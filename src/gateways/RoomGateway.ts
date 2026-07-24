/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Server, Socket } from 'socket.io';
import { RoomService } from '../services/RoomService.ts';
import { v4 as uuidv4 } from 'uuid';

export class RoomGateway {
  private roomService = new RoomService();

  constructor(private io: Server) {
    this.setupHandlers();
  }

  private setupHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Sincronização de relógio (NTP simplificado)
      socket.on('request_time', (clientTime: number) => {
        socket.emit('sync_time', {
          clientTime,
          serverTime: Date.now(),
        });
      });

      socket.on('join_room', async ({ roomId, userId, userName }) => {
        socket.join(roomId);
        
        let room = await this.roomService.getRoom(roomId);
        if (!room) {
          // Se a sala não existe, o primeiro a entrar é o Host (simplificação)
          room = await this.roomService.createRoom(roomId, userId);
        }

        socket.emit('room_state', room);
        
        // Notifica outros na sala
        socket.to(roomId).emit('user_joined', { userId, userName });
        console.log(`User ${userId} joined room ${roomId}`);
      });

      socket.on('send_message', ({ roomId, userId, userName, content }) => {
        const message = {
          id: uuidv4(),
          userId,
          userName,
          content,
          timestamp: Date.now(),
        };
        this.io.to(roomId).emit('new_message', message);
      });

      socket.on('sync_play', async ({ roomId, trackId, seekPosition }) => {
        const room = await this.roomService.getRoom(roomId);
        
        // Apenas o Host pode disparar sync_play (validação básica)
        // Em produção, verificaríamos o userId do socket contra room.hostId
        
        const startTime = Date.now(); // UTC
        const updatedRoom = await this.roomService.updateSync(roomId, trackId, startTime, seekPosition);

        if (updatedRoom) {
          this.io.to(roomId).emit('sync_play', {
            trackId,
            startTime,
            seekPosition,
            status: 'playing'
          });
        }
      });

      socket.on('sync_pause', async ({ roomId, seekPosition }) => {
        const updatedRoom = await this.roomService.pauseRoom(roomId, seekPosition);
        if (updatedRoom) {
          this.io.to(roomId).emit('sync_pause', { seekPosition, status: 'paused' });
        }
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }
}
