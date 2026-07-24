/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Redis from 'ioredis';

// Mock implementation for environments without a real Redis server
class MockRedis {
  private store = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.store.get(key) || null;
  }

  async set(key: string, value: string, ...args: any[]): Promise<'OK'> {
    this.store.set(key, value);
    return 'OK';
  }

  async del(key: string): Promise<number> {
    const existed = this.store.has(key);
    this.store.delete(key);
    return existed ? 1 : 0;
  }

  async incr(key: string): Promise<number> {
    const current = parseInt(this.store.get(key) || '0', 10);
    const next = current + 1;
    this.store.set(key, next.toString());
    return next;
  }

  async decr(key: string): Promise<number> {
    const current = parseInt(this.store.get(key) || '0', 10);
    const next = current - 1;
    this.store.set(key, next.toString());
    return next;
  }

  async keys(pattern: string): Promise<string[]> {
    return Array.from(this.store.keys());
  }

  async expire(key: string, seconds: number): Promise<number> {
    return 1;
  }

  async flushall(): Promise<'OK'> {
    this.store.clear();
    return 'OK';
  }

  on(event: string, cb: Function): this {
    // Simula eventos de conexão para manter compatibilidade
    if (event === 'connect') {
      setTimeout(() => cb(), 0);
    }
    return this;
  }
}

export class RedisService {
  private static instance: any;

  public static getInstance(): any {
    if (!this.instance) {
      const redisUrl = process.env.REDIS_URL;
      
      // Se não houver URL ou for localhost (que falha neste ambiente), usa o Mock
      if (!redisUrl || redisUrl.includes('localhost') || redisUrl.includes('127.0.0.1')) {
        console.warn('REDIS_URL não configurada ou inacessível. Usando MockRedis (In-Memory) para o MVP.');
        this.instance = new MockRedis();
      } else {
        try {
          this.instance = new Redis(redisUrl, {
            maxRetriesPerRequest: 1,
            retryStrategy(times) {
              if (times > 3) return null; // Para de tentar após 3 falhas
              return Math.min(times * 50, 2000);
            },
          });

          this.instance.on('error', (err: any) => {
            console.error('Redis Connection Error:', err.message);
            // Se falhar a conexão real, poderíamos forçar o fallback aqui se necessário
          });

          this.instance.on('connect', () => {
            console.log('Connected to real Redis server');
          });
        } catch (e) {
          console.error('Failed to initialize Redis, falling back to Mock:', e);
          this.instance = new MockRedis();
        }
      }
    }
    return this.instance;
  }
}
