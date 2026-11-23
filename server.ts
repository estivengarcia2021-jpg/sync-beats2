/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { RoomGateway } from './src/gateways/RoomGateway.ts';
import { RedisService } from './src/services/RedisService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const YOUTUBE_SEARCH_CACHE_TTL_SECONDS = 86400; // 24 horas para economizar cota gratuita (100 unid./busca)

interface SanitizedYouTubeResult {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  publishedAt: string;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function isSafeHttpsUrl(url: unknown): url is string {
  if (typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  const httpServer = createServer(app);
  const configuredOrigin = (process.env.APP_URL || '').trim();
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        try {
          const parsed = new URL(origin);
          const isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
          const isConfigured = Boolean(configuredOrigin && origin === configuredOrigin);
          const isPreview = parsed.protocol === 'https:' && parsed.hostname.endsWith('.run.app');
          if (isLocal || isConfigured || isPreview) {
            return callback(null, true);
          }
        } catch {
          // invalid origin
        }
        return callback(new Error('Origin not allowed'));
      },
      methods: ['GET', 'POST'],
    },
  });

  const PORT = 3000;
  const redis = RedisService.getInstance();

  // Inicializa o Gateway de Salas (WebSockets + YouTube Sync)
  new RoomGateway(io);

  // API Health Check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // Status da configuração da YouTube Data API v3 (sem expor a chave)
  app.get('/api/youtube/status', (_req, res) => {
    const apiKey = (process.env.YOUTUBE_API_KEY || process.env.VITE_YOUTUBE_API_KEY || '').trim();
    res.json({
      searchConfigured: Boolean(apiKey),
      cacheTtlHours: 24,
    });
  });

  // Proxy seguro + Cache Redis 24h para busca na YouTube Data API v3 (categoria Música = 10)
  app.get('/api/youtube/search', async (req, res) => {
    const rawQuery = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (!rawQuery || rawQuery.length > 120) {
      return res.status(400).json({
        error: 'Informe um termo de busca válido (entre 1 e 120 caracteres).',
        items: [],
      });
    }

    const normalizedKey = `yt:search:${rawQuery.toLowerCase().replace(/\s+/g, ' ')}`;

    try {
      // 1. Verifica cache no Redis (24h) para economizar cota gratuita da API
      const cachedRaw = await redis.get(normalizedKey);
      if (cachedRaw) {
        const cachedItems = JSON.parse(cachedRaw) as SanitizedYouTubeResult[];
        return res.json({
          items: cachedItems,
          cached: true,
          cacheTtlSeconds: YOUTUBE_SEARCH_CACHE_TTL_SECONDS,
        });
      }

      // 2. Lê chave da API no servidor (nunca hardcoded)
      const apiKey = (process.env.YOUTUBE_API_KEY || process.env.VITE_YOUTUBE_API_KEY || '').trim();
      if (!apiKey) {
        return res.status(503).json({
          needsApiKey: true,
          error:
            'Chave da YouTube Data API v3 não configurada no ambiente (.env: YOUTUBE_API_KEY ou VITE_YOUTUBE_API_KEY). Você ainda pode colar qualquer URL ou videoId do YouTube diretamente!',
          items: [],
        });
      }

      // 3. Consulta oficial na YouTube Data API v3 (host fixo, sem SSRF)
      const ytUrl = new URL('https://www.googleapis.com/youtube/v3/search');
      ytUrl.searchParams.set('part', 'snippet');
      ytUrl.searchParams.set('type', 'video');
      ytUrl.searchParams.set('videoCategoryId', '10'); // Categoria Música
      ytUrl.searchParams.set('maxResults', '6');
      ytUrl.searchParams.set('q', rawQuery);
      ytUrl.searchParams.set('key', apiKey);

      const ytRes = await fetch(ytUrl.toString());
      const ytData: any = await ytRes.json();

      if (!ytRes.ok) {
        const apiMsg = ytData?.error?.message || 'Erro ao consultar a YouTube Data API v3.';
        return res.status(ytRes.status).json({
          error: apiMsg,
          items: [],
        });
      }

      const items: SanitizedYouTubeResult[] = Array.isArray(ytData?.items)
        ? ytData.items
            .filter((item: any) => typeof item?.id?.videoId === 'string' && /^[a-zA-Z0-9_-]{11}$/.test(item.id.videoId))
            .map((item: any) => {
              const thumbCandidate =
                item?.snippet?.thumbnails?.medium?.url ||
                item?.snippet?.thumbnails?.default?.url ||
                '';
              return {
                videoId: item.id.videoId,
                title: decodeHtmlEntities(String(item?.snippet?.title || 'Sem título')).slice(0, 180),
                channelTitle: decodeHtmlEntities(String(item?.snippet?.channelTitle || 'YouTube')).slice(0, 100),
                thumbnail: isSafeHttpsUrl(thumbCandidate) ? thumbCandidate : '',
                publishedAt: String(item?.snippet?.publishedAt || ''),
              };
            })
        : [];

      // 4. Armazena no Redis por 24 horas (86400s)
      await redis.set(normalizedKey, JSON.stringify(items), 'EX', YOUTUBE_SEARCH_CACHE_TTL_SECONDS);

      return res.json({
        items,
        cached: false,
        cacheTtlSeconds: YOUTUBE_SEARCH_CACHE_TTL_SECONDS,
      });
    } catch (err) {
      console.error('YouTube search route error:', err);
      return res.status(500).json({
        error: 'Falha temporária ao pesquisar músicas no YouTube.',
        items: [],
      });
    }
  });

  // Configuração do Vite Middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.use((_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Sync Beats Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
