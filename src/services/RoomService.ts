/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RedisService } from './RedisService.ts';
import { RoomState } from '../types.ts';

export class RoomService {
  private redis = RedisService.getInstance();
  private readonly ROOM_PREFIX = 'room:';

  async getRoom(roomId: string): Promise<RoomState | null> {
    const data = await this.redis.get(`${this.ROOM_PREFIX}${roomId}`);
    return data ? JSON.parse(data) : null;
  }

  async saveRoom(room: RoomState): Promise<void> {
    await this.redis.set(
      `${this.ROOM_PREFIX}${room.roomId}`,
      JSON.stringify(room),
      'EX',
      86400 // Expira em 24h de inatividade
    );
  }

  async createRoom(roomId: string, hostId: string): Promise<RoomState> {
    const room: RoomState = {
      roomId,
      hostId,
      currentTrackId: null,
      trackStartTime: null,
      status: 'paused',
      seekPosition: 0,
    };
    await this.saveRoom(room);
    return room;
  }

  async updateSync(roomId: string, trackId: string, startTime: number, seekPosition: number): Promise<RoomState | null> {
    const room = await this.getRoom(roomId);
    if (!room) return null;

    room.currentTrackId = trackId;
    room.trackStartTime = startTime;
    room.status = 'playing';
    room.seekPosition = seekPosition;

    await this.saveRoom(room);
    return room;
  }

  async pauseRoom(roomId: string, seekPosition: number): Promise<RoomState | null> {
    const room = await this.getRoom(roomId);
    if (!room) return null;

    room.status = 'paused';
    room.seekPosition = seekPosition;
    room.trackStartTime = null;

    await this.saveRoom(room);
    return room;
  }
}
