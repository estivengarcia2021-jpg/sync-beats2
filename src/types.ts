/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RoomState {
  roomId: string;
  hostId: string;
  currentTrackId: string | null;
  trackStartTime: number | null; // UTC timestamp em milissegundos
  status: 'playing' | 'paused';
  seekPosition: number; // Posição atual em milissegundos se pausado
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
}

export interface SyncPlayPayload {
  trackId: string;
  startTime: number; // UTC timestamp
  seekPosition: number;
}
