/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Redis from 'ioredis';

// In-memory Redis-compatible fallback for environments without an external Redis server
class MockRedis {
  private store = new Map<string, string>();
  private hashes = new Map<string, Record<string, string>>();
  private expirations = new Map<string, number>();

  private isExpired(key: string): boolean {
    const expiresAt = this.expirations.get(key);
    if (expiresAt !== undefined && Date.now() > expiresAt) {
      this.store.delete(key);
      this.hashes.delete(key);
      this.expirations.delete(key);
      return true;
    }
    return false;
  }

  async get(key: string): Promise<string | null> {
    if (this.isExpired(key)) return null;
    return this.store.get(key) || null;
  }

  async set(key: string, value: string, ...args: any[]): Promise<'OK'> {
    this.store.set(key, value);
    // Support 'EX', seconds
    if (args.length >= 2 && String(args[0]).toUpperCase() === 'EX') {
      const ttlSeconds = Number(args[1]);
      if (Number.isFinite(ttlSeconds) && ttlSeconds > 0) {
        this.expirations.set(key, Date.now() + ttlSeconds * 1000);
      }
    }
    return 'OK';
  }

  async hset(key: string, fields: Record<string, string | number>): Promise<number> {
    if (this.isExpired(key)) {
      this.hashes.delete(key);
    }
    const existing = this.hashes.get(key) || {};
    let added = 0;
    for (const [field, val] of Object.entries(fields)) {
      if (!(field in existing)) added++;
      existing[field] = String(val ?? '');
    }
    this.hashes.set(key, existing);
    return added;
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    if (this.isExpired(key)) return {};
    const hash = this.hashes.get(key);
    return hash ? { ...hash } : {};
  }

  async del(key: string): Promise<number> {
    const existed = this.store.has(key) || this.hashes.has(key);
    this.store.delete(key);
    this.hashes.delete(key);
    this.expirations.delete(key);
    return existed ? 1 : 0;
  }

  async incr(key: string): Promise<number> {
    const current = parseInt((await this.get(key)) || '0', 10);
    const next = current + 1;
    this.store.set(key, next.toString());
    return next;
  }

  async decr(key: string): Promise<number> {
    const current = parseInt((await this.get(key)) || '0', 10);
    const next = current - 1;
    this.store.set(key, next.toString());
    return next;
  }

  async keys(pattern: string): Promise<string[]> {
    const allKeys = new Set([...this.store.keys(), ...this.hashes.keys()]);
    const result: string[] = [];
    for (const key of allKeys) {
      if (!this.isExpired(key)) {
        result.push(key);
      }
    }
    return result;
  }

  async expire(key: string, seconds: number): Promise<number> {
    if (!this.store.has(key) && !this.hashes.has(key)) return 0;
    if (Number.isFinite(seconds) && seconds > 0) {
      this.expirations.set(key, Date.now() + seconds * 1000);
      return 1;
    }
    return 0;
  }

  async flushall(): Promise<'OK'> {
    this.store.clear();
    this.hashes.clear();
    this.expirations.clear();
    return 'OK';
  }

  on(event: string, cb: Function): this {
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

      // Se não houver URL ou for localhost (que falha neste ambiente), usa o MockRedis
      if (!redisUrl || redisUrl.includes('localhost') || redisUrl.includes('127.0.0.1')) {
        console.warn('REDIS_URL não configurada ou inacessível. Usando MockRedis (In-Memory) para o MVP.');
        this.instance = new MockRedis();
      } else {
        try {
          this.instance = new Redis(redisUrl, {
            maxRetriesPerRequest: 1,
            retryStrategy(times) {
              if (times > 3) return null;
              return Math.min(times * 50, 2000);
            },
          });

          this.instance.on('error', (err: any) => {
            console.error('Redis Connection Error:', err.message);
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
