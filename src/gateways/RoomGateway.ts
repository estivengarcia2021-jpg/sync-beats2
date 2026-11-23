/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Server, Socket } from 'socket.io';
import { RoomService } from '../services/RoomService.ts';
import { RedisService } from '../services/RedisService.ts';
import { v4 as uuidv4 } from 'uuid';

interface RoomMember {
  socketId: string;
  userId: string;
  username: string;
  joinedAt: number;
}

const VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;
const ROOM_ID_REGEX = /^[a-zA-Z0-9_-]{2,64}$/;

function sanitizeText(input: unknown, maxLen: number): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLen);
}

function sanitizeTime(input: unknown): number {
  const num = Number(input);
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.min(num, 86400);
}

export class RoomGateway {
  private roomService = new RoomService();
  private redis = RedisService.getInstance();
  private roomMembers = new Map<string, Map<string, RoomMember>>();
  private roomHosts = new Map<string, string>();

  constructor(private io: Server) {
    this.setupHandlers();
  }

  private getMembersArray(roomId: string): Array<{ userId: string; username: string; isHost: boolean }> {
    const membersMap = this.roomMembers.get(roomId);
    const hostId = this.roomHosts.get(roomId) || '';
    if (!membersMap) return [];
    const seenUsers = new Map<string, { userId: string; username: string; isHost: boolean }>();
    for (const m of membersMap.values()) {
      seenUsers.set(m.userId, {
        userId: m.userId,
        username: m.username,
        isHost: m.userId === hostId,
      });
    }
    return Array.from(seenUsers.values());
  }

  private broadcastRoomInfo(roomId: string) {
    const hostId = this.roomHosts.get(roomId) || '';
    const members = this.getMembersArray(roomId);
    this.io.to(roomId).emit('room:info', {
      roomId,
      hostId,
      members,
    });
  }

  private leaveCurrentYouTubeRoom(socket: Socket) {
    const prevRoomId = socket.data.ytRoomId as string | undefined;
    if (!prevRoomId) return;

    socket.leave(prevRoomId);
    const membersMap = this.roomMembers.get(prevRoomId);
    if (membersMap) {
      membersMap.delete(socket.id);
      if (membersMap.size === 0) {
        this.roomMembers.delete(prevRoomId);
        // Mantém o hostId registrado no Redis/memória caso o Host reconecte rapidamente
      } else {
        this.broadcastRoomInfo(prevRoomId);
      }
    }
    socket.data.ytRoomId = undefined;
  }

  private setupHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);

      // =========================================================================
      // PROTOCOLO YOUTUBE SYNC PLAYER (Socket.io + Redis room:{id}:player)
      // =========================================================================

      // Medição de latência / ping para compensação NTP (< 200ms - RN06)
      socket.on('sync:ping', (clientStart: number, callback?: (serverTime: number) => void) => {
        const serverTime = Date.now();
        if (typeof callback === 'function') {
          callback(serverTime);
        } else {
          socket.emit('sync:pong', { clientStart, serverTime });
        }
      });

      // Entrar em uma sala YouTube sincronizada
      socket.on('room:join', async (payload: {
        roomId?: string;
        userId?: string;
        username?: string;
        preferredRole?: 'host' | 'listener';
      }) => {
        const roomId = sanitizeText(payload?.roomId, 64);
        const userId = sanitizeText(payload?.userId, 80);
        const username = sanitizeText(payload?.username, 40) || 'Ouvinte';

        if (!ROOM_ID_REGEX.test(roomId) || !userId) {
          socket.emit('error:invalid_room', { message: 'ID de sala ou usuário inválido.' });
          return;
        }

        // Sai de sala anterior caso esteja trocando
        if (socket.data.ytRoomId && socket.data.ytRoomId !== roomId) {
          this.leaveCurrentYouTubeRoom(socket);
        }

        socket.join(roomId);
        socket.data.ytRoomId = roomId;
        socket.data.userId = userId;
        socket.data.username = username;

        if (!this.roomMembers.has(roomId)) {
          this.roomMembers.set(roomId, new Map());
        }
        const membersMap = this.roomMembers.get(roomId)!;
        membersMap.set(socket.id, {
          socketId: socket.id,
          userId,
          username,
          joinedAt: Date.now(),
        });

        // Define Host autoritativo no servidor (primeiro usuário ou quem assumiu)
        let hostId = this.roomHosts.get(roomId);
        if (!hostId) {
          const storedHost = await this.redis.get(`room:${roomId}:host`);
          if (storedHost) {
            hostId = storedHost;
            this.roomHosts.set(roomId, hostId);
          }
        }

        // Se a sala ainda não tem Host, o primeiro membro (ou um usuário com preferredRole === 'host' se a sala estava vazia) torna-se Host
        if (!hostId) {
          hostId = userId;
          this.roomHosts.set(roomId, hostId);
          await this.redis.set(`room:${roomId}:host`, hostId, 'EX', 86400);
        }

        this.broadcastRoomInfo(roomId);

        // Envia o estado atual armazenado no Redis (room:{id}:player) para sincronização imediata
        const playerState = await this.redis.hgetall(`room:${roomId}:player`);
        if (playerState && playerState.videoId) {
          const storedTimestamp = sanitizeTime(playerState.timestamp);
          const storedUpdatedAt = Number(playerState.updatedAt) || Date.now();
          const status = playerState.status === 'playing' ? 'playing' : 'paused';

          socket.emit('player:sync', {
            status,
            videoId: playerState.videoId,
            title: playerState.title || '',
            timestamp: storedTimestamp,
            serverTime: storedUpdatedAt,
          });
        }
      });

      // Permite reivindicar controle de Host apenas se o Host atual não estiver conectado na sala
      socket.on('room:claim_host', async (payload: { roomId?: string }) => {
        const roomId = sanitizeText(payload?.roomId || socket.data.ytRoomId, 64);
        const userId = socket.data.userId as string | undefined;
        if (!roomId || !userId || socket.data.ytRoomId !== roomId) return;

        const currentHostId = this.roomHosts.get(roomId);
        const membersMap = this.roomMembers.get(roomId);
        const isCurrentHostOnline = currentHostId
          ? Array.from(membersMap?.values() || []).some((m) => m.userId === currentHostId)
          : false;

        if (!currentHostId || !isCurrentHostOnline || currentHostId === userId) {
          this.roomHosts.set(roomId, userId);
          await this.redis.set(`room:${roomId}:host`, userId, 'EX', 86400);
          this.broadcastRoomInfo(roomId);
        } else {
          socket.emit('error:unauthorized', {
            message: 'Esta sala já possui um Host ativo no momento.',
          });
        }
      });

      // Comando PLAY com YouTube videoId (Apenas o Host tem permissão - RN07)
      socket.on('player:play', async (payload: {
        roomId?: string;
        userId?: string;
        hostId?: string;
        videoId?: string;
        title?: string;
        currentTime?: number;
      }) => {
        const roomId = sanitizeText(payload?.roomId, 64);
        const userId = sanitizeText(payload?.userId, 80);
        const videoId = sanitizeText(payload?.videoId, 20);
        const title = sanitizeText(payload?.title, 200);
        const currentTime = sanitizeTime(payload?.currentTime);

        if (!ROOM_ID_REGEX.test(roomId) || socket.data.ytRoomId !== roomId) {
          return socket.emit('error:unauthorized', { message: 'Você não está conectado a esta sala.' });
        }

        const authoritativeHostId = this.roomHosts.get(roomId) || (await this.redis.get(`room:${roomId}:host`));
        const socketUserId = socket.data.userId as string | undefined;

        if (!authoritativeHostId || socketUserId !== authoritativeHostId || userId !== authoritativeHostId) {
          return socket.emit('error:unauthorized', { message: 'Apenas o Host controla o player.' });
        }

        if (!VIDEO_ID_REGEX.test(videoId)) {
          return socket.emit('error:invalid_video', { message: 'ID de vídeo do YouTube inválido.' });
        }

        const serverTime = Date.now();
        await this.redis.hset(`room:${roomId}:player`, {
          status: 'playing',
          videoId,
          title,
          timestamp: String(currentTime),
          updatedAt: String(serverTime),
        });
        await this.redis.expire(`room:${roomId}:player`, 86400);

        this.io.to(roomId).emit('player:sync', {
          status: 'playing',
          videoId,
          title,
          timestamp: currentTime,
          serverTime,
        });
      });

      // Comando PAUSE (Apenas o Host tem permissão - RN07)
      socket.on('player:pause', async (payload: {
        roomId?: string;
        userId?: string;
        hostId?: string;
        videoId?: string;
        title?: string;
        currentTime?: number;
      }) => {
        const roomId = sanitizeText(payload?.roomId, 64);
        const userId = sanitizeText(payload?.userId, 80);
        const videoId = sanitizeText(payload?.videoId, 20);
        const title = sanitizeText(payload?.title, 200);
        const currentTime = sanitizeTime(payload?.currentTime);

        if (!ROOM_ID_REGEX.test(roomId) || socket.data.ytRoomId !== roomId) {
          return socket.emit('error:unauthorized', { message: 'Você não está conectado a esta sala.' });
        }

        const authoritativeHostId = this.roomHosts.get(roomId) || (await this.redis.get(`room:${roomId}:host`));
        const socketUserId = socket.data.userId as string | undefined;

        if (!authoritativeHostId || socketUserId !== authoritativeHostId || userId !== authoritativeHostId) {
          return socket.emit('error:unauthorized', { message: 'Apenas o Host controla o player.' });
        }

        if (!VIDEO_ID_REGEX.test(videoId)) {
          return socket.emit('error:invalid_video', { message: 'ID de vídeo do YouTube inválido.' });
        }

        const existing = await this.redis.hgetall(`room:${roomId}:player`);
        const resolvedTitle = title || existing?.title || '';
        const serverTime = Date.now();

        await this.redis.hset(`room:${roomId}:player`, {
          status: 'paused',
          videoId,
          title: resolvedTitle,
          timestamp: String(currentTime),
          updatedAt: String(serverTime),
        });
        await this.redis.expire(`room:${roomId}:player`, 86400);

        this.io.to(roomId).emit('player:sync', {
          status: 'paused',
          videoId,
          title: resolvedTitle,
          timestamp: currentTime,
          serverTime,
        });
      });

      // Chat em tempo real da sala YouTube
      socket.on('room:chat', (payload: { roomId?: string; text?: string }) => {
        const roomId = sanitizeText(payload?.roomId || socket.data.ytRoomId, 64);
        const text = sanitizeText(payload?.text, 300);
        if (!roomId || !text || socket.data.ytRoomId !== roomId) return;

        const hostId = this.roomHosts.get(roomId);
        this.io.to(roomId).emit('room:chat_message', {
          id: uuidv4(),
          userId: socket.data.userId || socket.id,
          username: socket.data.username || 'Ouvinte',
          isHost: socket.data.userId === hostId,
          text,
          timestamp: Date.now(),
        });
      });

      // =========================================================================
      // EVENTOS LEGADOS DO DECK DE ÁUDIO (Mantidos para compatibilidade)
      // =========================================================================

      // Sincronização de relógio (NTP simplificado)
      socket.on('request_time', (clientTime: number) => {
        socket.emit('sync_time', {
          clientTime,
          serverTime: Date.now(),
        });
      });

      socket.on('join_room', async ({ roomId, userId, userName }) => {
        socket.join(roomId);
        socket.data.userId = userId;

        let room = await this.roomService.getRoom(roomId);
        if (!room) {
          room = await this.roomService.createRoom(roomId, userId);
        }

        socket.emit('room_state', room);
        socket.to(roomId).emit('user_joined', { userId, userName });
        console.log(`User ${userId} joined room ${roomId}`);
      });

      socket.on('send_message', ({ roomId, userId, userName, content }) => {
        const safeContent = sanitizeText(content, 500);
        if (!safeContent) return;
        const message = {
          id: uuidv4(),
          userId,
          userName: sanitizeText(userName, 40) || 'Ouvinte',
          content: safeContent,
          timestamp: Date.now(),
        };
        this.io.to(roomId).emit('new_message', message);
      });

      socket.on('sync_play', async ({ roomId, trackId, seekPosition }) => {
        const room = await this.roomService.getRoom(roomId);
        if (!room || (socket.data.userId && room.hostId !== socket.data.userId)) {
          return socket.emit('error:unauthorized', { message: 'Apenas o Host controla o player.' });
        }

        const startTime = Date.now();
        const updatedRoom = await this.roomService.updateSync(roomId, trackId, startTime, sanitizeTime(seekPosition));

        if (updatedRoom) {
          this.io.to(roomId).emit('sync_play', {
            trackId,
            startTime,
            seekPosition: sanitizeTime(seekPosition),
            status: 'playing',
          });
        }
      });

      socket.on('sync_pause', async ({ roomId, seekPosition }) => {
        const room = await this.roomService.getRoom(roomId);
        if (!room || (socket.data.userId && room.hostId !== socket.data.userId)) {
          return socket.emit('error:unauthorized', { message: 'Apenas o Host controla o player.' });
        }

        const updatedRoom = await this.roomService.pauseRoom(roomId, sanitizeTime(seekPosition));
        if (updatedRoom) {
          this.io.to(roomId).emit('sync_pause', { seekPosition: sanitizeTime(seekPosition), status: 'paused' });
        }
      });

      socket.on('disconnect', () => {
        this.leaveCurrentYouTubeRoom(socket);
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }
}
