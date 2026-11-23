import React, { useEffect, useRef, useState, useCallback } from 'react';
import YouTube from 'react-youtube';
import { io } from 'socket.io-client';
import {
  Play,
  Pause,
  Search,
  Users,
  Radio,
  Copy,
  Check,
  Shield,
  Volume2,
  Link as LinkIcon,
  Send,
  RefreshCw,
  Crown,
  BookOpen,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Clock,
  Wifi,
  WifiOff,
  Music,
} from 'lucide-react';

const SOCKET_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

const CURATED_MUSIC_VIDEOS = [
  { videoId: '9OFpfTd0EIs', title: 'Eyes Without A Face', artist: 'Billy Idol' },
  { videoId: 'dX3k_QDnzHE', title: 'Midnight City', artist: 'M83' },
  { videoId: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody', artist: 'Queen' },
  { videoId: '4NRXx6U8ABQ', title: 'Blinding Lights', artist: 'The Weeknd' },
  { videoId: '5qap5aO4i9A', title: 'Lofi Hip Hop Beats', artist: 'Lofi Girl' },
];

function extractYouTubeVideoId(raw) {
  const trimmed = String(raw || '').trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'youtu.be') {
      const candidate = parsed.pathname.slice(1).split('/')[0];
      return /^[a-zA-Z0-9_-]{11}$/.test(candidate) ? candidate : null;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      const vParam = parsed.searchParams.get('v');
      if (vParam && /^[a-zA-Z0-9_-]{11}$/.test(vParam)) return vParam;
      const parts = parsed.pathname.split('/').filter(Boolean);
      if ((parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live') && parts[1]) {
        return /^[a-zA-Z0-9_-]{11}$/.test(parts[1]) ? parts[1] : null;
      }
    }
  } catch {
    return null;
  }
  return null;
}

function getOrCreateGuestIdentity() {
  try {
    const existing = sessionStorage.getItem('syncbeats_yt_guest');
    if (existing) {
      const parsed = JSON.parse(existing);
      if (parsed?.id && parsed?.name) return parsed;
    }
  } catch {
    // ignore storage errors
  }
  const suffix = Math.floor(1000 + Math.random() * 9000);
  const guest = {
    id: `guest-${suffix}-${Date.now().toString(36)}`,
    name: `Ouvinte_${suffix}`,
  };
  try {
    sessionStorage.setItem('syncbeats_yt_guest', JSON.stringify(guest));
  } catch {
    // ignore storage errors
  }
  return guest;
}

export default function YouTubeSyncPlayer({
  roomId: roomIdProp = '',
  initialRoomId = 'syncbeats-live-01',
  currentUser: currentUserProp = null,
  hostId: hostIdProp = '',
  authUser = null,
  onRequireLogin = undefined,
}) {
  const guestRef = useRef(getOrCreateGuestIdentity());
  const currentUser = currentUserProp
    ? currentUserProp
    : authUser
    ? { id: authUser.id, name: authUser.name }
    : guestRef.current;

  const socketRef = useRef(null);
  const playerRef = useRef(null);
  const latencyRef = useRef(0);
  const videoIdRef = useRef('9OFpfTd0EIs');
  const pendingSyncRef = useRef(null);
  const hasInteractedRef = useRef(false);

  const resolvedInitialRoom = roomIdProp || initialRoomId;
  const [roomId, setRoomId] = useState(resolvedInitialRoom);
  const [roomInput, setRoomInput] = useState(resolvedInitialRoom);
  const [hostId, setHostId] = useState(hostIdProp || '');
  const [members, setMembers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const [videoId, setVideoId] = useState('9OFpfTd0EIs');
  const [trackTitle, setTrackTitle] = useState('Billy Idol — Eyes Without A Face');
  const [playbackStatus, setPlaybackStatus] = useState('paused');
  const [latencyMs, setLatencyMs] = useState(0);
  const [lastDriftMs, setLastDriftMs] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // Modal de interação inicial para destravar política de Autoplay do navegador
  const [hasEnteredRoom, setHasEnteredRoom] = useState(false);

  // Busca na YouTube Data API v3 (via backend seguro com cache Redis 24h)
  const [searchConfigured, setSearchConfigured] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [lastSearchCached, setLastSearchCached] = useState(false);

  // Entrada direta por URL ou videoId (0 cota de API)
  const [directUrlInput, setDirectUrlInput] = useState('');
  const [directUrlTitle, setDirectUrlTitle] = useState('');

  // Chat em tempo real da sala
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  // Auxiliares de interface
  const [notice, setNotice] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const effectiveHostId = hostId || hostIdProp || '';
  const isHost = Boolean(effectiveHostId && currentUser.id === effectiveHostId);

  useEffect(() => {
    if (roomIdProp && roomIdProp !== roomId) {
      setRoomId(roomIdProp);
      setRoomInput(roomIdProp);
    }
  }, [roomIdProp, roomId]);

  const showTransientNotice = useCallback((type, message) => {
    setNotice({ type, message });
    setTimeout(() => {
      setNotice((prev) => (prev?.message === message ? null : prev));
    }, 5000);
  }, []);

  // Verifica status da chave da YouTube Data API v3 no backend
  useEffect(() => {
    fetch('/api/youtube/status')
      .then((res) => res.json())
      .then((data) => setSearchConfigured(Boolean(data?.searchConfigured)))
      .catch(() => setSearchConfigured(false));
  }, []);

  // Aplica sincronização no player do YouTube com compensação NTP (< 200ms - RN06)
  const applySyncPayload = useCallback((payload) => {
    const { status, videoId: incomingId, title, timestamp, serverTime } = payload;

    if (incomingId && incomingId !== videoIdRef.current) {
      videoIdRef.current = incomingId;
      setVideoId(incomingId);
    }
    if (title) {
      setTrackTitle(title);
    }
    setPlaybackStatus(status);
    pendingSyncRef.current = payload;

    const player = playerRef.current;
    if (!player) return;

    // Compensação NTP + atraso de rede para manter tolerância < 200ms (RN06)
    const networkDelaySec = (Date.now() - serverTime + latencyRef.current) / 1000;
    const targetTime = timestamp + (status === 'playing' ? Math.max(0, networkDelaySec) : 0);

    try {
      const currentPlayerTime =
        typeof player.getCurrentTime === 'function' ? player.getCurrentTime() || 0 : 0;
      const driftSec = Math.abs(currentPlayerTime - targetTime);
      setLastDriftMs(Math.round(driftSec * 1000));

      if (driftSec > 0.25) {
        player.seekTo(targetTime, true);
      }

      if (status === 'playing') {
        if (hasInteractedRef.current) {
          player.playVideo();
        }
      } else if (status === 'paused') {
        player.pauseVideo();
      }
    } catch {
      // IFrame carregando o novo videoId; será sincronizado quando pronto
    }
  }, []);

  // Conexão WebSocket (Socket.io) com a sala
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
    });
    socketRef.current = socket;

    const measurePing = () => {
      const start = Date.now();
      socket.emit('sync:ping', start, () => {
        const halfRtt = Math.round((Date.now() - start) / 2);
        latencyRef.current = halfRtt;
        setLatencyMs(halfRtt);
      });
    };

    socket.on('connect', () => {
      setIsConnected(true);
      measurePing();
      socket.emit('room:join', {
        roomId,
        userId: currentUser.id,
        username: currentUser.name,
        preferredRole: authUser?.role || 'listener',
      });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('room:info', (info) => {
      if (info?.hostId) {
        setHostId(info.hostId);
      }
      setMembers(Array.isArray(info?.members) ? info.members : []);
    });

    // Recebe ordem de sincronização do servidor
    socket.on('player:sync', (payload) => {
      applySyncPayload(payload);
    });

    socket.on('room:chat_message', (msg) => {
      setChatMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev.slice(-49), msg];
      });
    });

    socket.on('error:unauthorized', ({ message }) => {
      showTransientNotice('error', message || 'Apenas o Host controla o player.');
    });

    socket.on('error:invalid_video', ({ message }) => {
      showTransientNotice('error', message || 'ID de vídeo do YouTube inválido.');
    });

    const pingInterval = setInterval(measurePing, 10000);
    return () => {
      clearInterval(pingInterval);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId, currentUser.id, currentUser.name, authUser?.role, applySyncPayload, showTransientNotice]);

  // Botão "Entrar na Sala" para destravar áudio nos navegadores
  const handleEnterRoomUnlock = () => {
    hasInteractedRef.current = true;
    setHasEnteredRoom(true);

    const player = playerRef.current;
    const pending = pendingSyncRef.current;

    if (player && pending) {
      const networkDelaySec = (Date.now() - pending.serverTime + latencyRef.current) / 1000;
      const targetTime =
        pending.timestamp + (pending.status === 'playing' ? Math.max(0, networkDelaySec) : 0);
      try {
        player.seekTo(targetTime, true);
        if (pending.status === 'playing') {
          player.playVideo();
        } else {
          player.pauseVideo();
        }
      } catch {
        // player pronto em breve
      }
    } else if (player && isHost) {
      try {
        player.cueVideoById(videoIdRef.current);
      } catch {
        // ignore
      }
    }
  };

  // Busca músicas na YouTube Data API v3 (categoria Música = 10) com cache Redis 24h
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setLastSearchCached(false);

    try {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setSearchResults([]);
        setSearchError(data?.error || 'Não foi possível concluir a busca no YouTube.');
        if (data?.needsApiKey) {
          setSearchConfigured(false);
        }
        return;
      }

      setSearchConfigured(true);
      setLastSearchCached(Boolean(data?.cached));
      setSearchResults(Array.isArray(data?.items) ? data.items : []);
      if (!data?.items?.length) {
        setSearchError('Nenhum vídeo musical encontrado para essa busca.');
      }
    } catch {
      setSearchError('Erro de rede ao consultar a busca de músicas.');
    } finally {
      setIsSearching(false);
    }
  };

  // Host seleciona uma música da busca para tocar na sala
  const handleSelectTrack = (selectedId, selectedTitle) => {
    if (!isHost) {
      showTransientNotice('error', 'Apenas o Host pode alterar a música da sala.');
      return;
    }

    hasInteractedRef.current = true;
    setHasEnteredRoom(true);
    videoIdRef.current = selectedId;
    setVideoId(selectedId);
    setTrackTitle(selectedTitle);
    setSearchResults([]);

    socketRef.current?.emit('player:play', {
      roomId,
      userId: currentUser.id,
      hostId: effectiveHostId,
      videoId: selectedId,
      title: selectedTitle,
      currentTime: 0,
    });
  };

  // Host carrega uma URL ou videoId diretamente (0 cota de API)
  const handleLoadDirectUrl = (e) => {
    e.preventDefault();
    if (!isHost) {
      showTransientNotice('error', 'Apenas o Host controla o player.');
      return;
    }
    const parsedId = extractYouTubeVideoId(directUrlInput);
    if (!parsedId) {
      showTransientNotice('error', 'Cole um link válido do YouTube ou um videoId de 11 caracteres.');
      return;
    }
    const label = directUrlTitle.trim() || `YouTube Clipe (${parsedId})`;
    handleSelectTrack(parsedId, label);
    setDirectUrlInput('');
    setDirectUrlTitle('');
  };

  // Controles manuais do Host
  const handlePlay = () => {
    if (!isHost || !playerRef.current) return;
    hasInteractedRef.current = true;
    setHasEnteredRoom(true);
    const currentTime = playerRef.current.getCurrentTime?.() || 0;

    socketRef.current?.emit('player:play', {
      roomId,
      userId: currentUser.id,
      hostId: effectiveHostId,
      videoId: videoIdRef.current,
      title: trackTitle,
      currentTime,
    });
  };

  const handlePause = () => {
    if (!isHost || !playerRef.current) return;
    const currentTime = playerRef.current.getCurrentTime?.() || 0;

    socketRef.current?.emit('player:pause', {
      roomId,
      userId: currentUser.id,
      hostId: effectiveHostId,
      videoId: videoIdRef.current,
      title: trackTitle,
      currentTime,
    });
  };

  const handleForceResync = () => {
    if (!isHost || !playerRef.current) return;
    const currentTime = playerRef.current.getCurrentTime?.() || 0;
    const eventName = playbackStatus === 'playing' ? 'player:play' : 'player:pause';
    socketRef.current?.emit(eventName, {
      roomId,
      userId: currentUser.id,
      hostId: effectiveHostId,
      videoId: videoIdRef.current,
      title: trackTitle,
      currentTime,
    });
    showTransientNotice('info', 'Pulso de sincronização reenviado para todos os membros da sala.');
  };

  const handleClaimHost = () => {
    socketRef.current?.emit('room:claim_host', { roomId });
  };

  const handleSwitchRoom = (e) => {
    e.preventDefault();
    const cleaned = roomInput.trim().replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 64);
    if (cleaned.length < 2) {
      showTransientNotice('error', 'O nome da sala precisa ter pelo menos 2 caracteres.');
      return;
    }
    setRoomId(cleaned);
    setRoomInput(cleaned);
    setChatMessages([]);
    window.history.replaceState(null, '', `#youtube?room=${encodeURIComponent(cleaned)}`);
    showTransientNotice('info', `Conectado à sala ${cleaned}.`);
  };

  const handleCopyInviteLink = async () => {
    const url = `${window.location.origin}/#youtube?room=${encodeURIComponent(roomId)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      showTransientNotice('info', `Link da sala: ${url}`);
    }
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    socketRef.current?.emit('room:chat', {
      roomId,
      text: chatInput.trim(),
    });
    setChatInput('');
  };

  const handlePlayerReady = (event) => {
    playerRef.current = event.target;
    setIsReady(true);

    const pending = pendingSyncRef.current;
    if (pending && hasInteractedRef.current) {
      applySyncPayload(pending);
    }
  };

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      controls: isHost ? 1 : 0, // Oculta controles nativos para ouvintes (RN07)
      disablekb: 1,
      modestbranding: 1,
      rel: 0,
      playsinline: 1,
    },
  };

  const isCurrentHostOnline = members.some((m) => m.userId === effectiveHostId);

  return (
    <div className="space-y-6">
      {/* Barra de Sala e Conexão */}
      <div className="bg-[#0A1124] border border-cyan-900/50 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-cyan-300/80 font-mono">
            <span className="inline-flex items-center gap-1.5 font-semibold text-white">
              {isConnected ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-red-400" />
              )}
              {isConnected ? 'Socket.io Conectado' : 'Reconectando...'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">Ping: {latencyMs}ms</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">Desvio: {lastDriftMs}ms</span>
            <span aria-hidden="true">·</span>
            <span>{isHost ? 'Host (Controle Total)' : 'Ouvinte Sincronizado'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Sala YouTube Sincronizada
          </h2>
          <p className="text-sm text-zinc-400">
            Reprodução oficial via YouTube IFrame Player API com estado sincronizado via WebSockets e Redis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={handleSwitchRoom} className="flex items-center gap-2">
            <input
              type="text"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              placeholder="ID da sala..."
              aria-label="ID da sala"
              className="w-40 sm:w-48 px-3 py-2 rounded-lg bg-[#050A15] border border-cyan-900/70 text-sm font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-[#00F2FE]"
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-800/70 text-xs font-semibold text-cyan-100 transition-colors cursor-pointer whitespace-nowrap"
            >
              Trocar Sala
            </button>
          </form>

          <button
            type="button"
            onClick={handleCopyInviteLink}
            className="px-3.5 py-2 rounded-lg bg-[#00F2FE] hover:brightness-110 text-black text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedLink ? 'Link Copiado' : 'Convidar Ouvintes'}
          </button>
        </div>
      </div>

      {/* Notificações */}
      {notice && (
        <div
          role="status"
          className={`rounded-xl px-4 py-3 border text-sm flex items-center gap-2.5 ${
            notice.type === 'error'
              ? 'bg-red-950/40 border-red-500/40 text-red-200'
              : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-100'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{notice.message}</span>
        </div>
      )}

      {/* Grid Principal: Clipe Ao Vivo + Controles & Busca | Sidebar Presença & Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Principal (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Player Oficial do YouTube (Obrigatório manter visível >= 200x200px conforme Termos do YouTube) */}
          <div className="bg-[#0A1124] border border-cyan-900/50 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-cyan-900/40 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-xs text-cyan-300/80 font-mono flex items-center gap-2">
                  <span>Clipe Ao Vivo</span>
                  <span aria-hidden="true">·</span>
                  <span>Sala: {roomId}</span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={
                      playbackStatus === 'playing'
                        ? 'text-emerald-400 font-semibold'
                        : 'text-amber-300'
                    }
                  >
                    {playbackStatus === 'playing' ? 'Reproduzindo' : 'Pausado'}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white truncate mt-0.5">
                  {trackTitle}
                </h3>
              </div>

              {!isHost && !isCurrentHostOnline && (
                <button
                  type="button"
                  onClick={handleClaimHost}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Crown className="w-3.5 h-3.5" />
                  Assumir Host
                </button>
              )}
            </div>

            <div className="relative w-full aspect-video min-h-[260px] bg-black">
              <YouTube
                videoId={videoId}
                opts={opts}
                onReady={handlePlayerReady}
                className="w-full h-full"
                iframeClassName="w-full h-full"
              />

              {/* Modal inicial "Entrar na Sala" para destravar som automático nos navegadores */}
              {!hasEnteredRoom && (
                <div className="absolute inset-0 z-20 bg-[#050A15]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#00F2FE]/15 border border-[#00F2FE]/40 text-[#00F2FE] flex items-center justify-center mb-4">
                    <Volume2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-white">
                    Pronto para ouvir em sincronia?
                  </h4>
                  <p className="text-sm text-zinc-400 max-w-md mt-1.5 mb-5">
                    Os navegadores exigem um clique inicial para liberar o áudio do player. Clique abaixo para sincronizar com a sala{' '}
                    <span className="text-white font-mono">{roomId}</span>.
                  </p>
                  <button
                    type="button"
                    onClick={handleEnterRoomUnlock}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#0072FF] text-black font-bold text-sm inline-flex items-center gap-2 hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-[#00F2FE]/20"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Entrar na Sala
                  </button>
                </div>
              )}
            </div>

            {/* Botões de Controle do Host (RN07) */}
            <div className="px-5 py-4 border-t border-cyan-900/40 bg-[#070D1E] flex flex-wrap items-center justify-between gap-3">
              {isHost ? (
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handlePlay}
                    disabled={!isReady}
                    className="px-4 py-2 rounded-lg bg-[#00F2FE] hover:brightness-110 disabled:opacity-50 text-black text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Play Sincronizado
                  </button>
                  <button
                    type="button"
                    onClick={handlePause}
                    disabled={!isReady}
                    className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    Pausar Sala
                  </button>
                  <button
                    type="button"
                    onClick={handleForceResync}
                    disabled={!isReady}
                    className="px-3.5 py-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-800/60 disabled:opacity-50 text-cyan-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Re-sincronizar
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Shield className="w-4 h-4 text-[#00F2FE] shrink-0" />
                  <span>
                    Modo Ouvinte (RN07): o player segue automaticamente o play, pause e tempo do Host da sala.
                  </span>
                </div>
              )}

              <div className="text-xs font-mono text-zinc-400 tabular-nums">ID: {videoId}</div>
            </div>
          </div>

          {/* Barra de Busca de Músicas (Apenas Host) */}
          {isHost ? (
            <div className="bg-[#0A1124] border border-cyan-900/50 rounded-2xl p-5 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-white">Buscar Música no YouTube</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Pesquisa na YouTube Data API v3 (categoria Música) com cache de 24h no servidor para economizar cota.
                  </p>
                </div>
                <div className="text-xs font-mono text-cyan-300/80">
                  {searchConfigured === true
                    ? 'API v3 Ativa · Cache 24h'
                    : searchConfigured === false
                    ? 'Modo Link Direto (API Key não definida)'
                    : 'Verificando API...'}
                </div>
              </div>

              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar música ou artista no YouTube..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#050A15] border border-cyan-900/70 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#00F2FE]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#00F2FE] hover:brightness-110 disabled:opacity-50 text-black text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                >
                  {isSearching ? 'Buscando...' : 'Buscar'}
                </button>
              </form>

              {searchError && (
                <div className="text-xs text-amber-200 bg-amber-950/30 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <span>{searchError}</span>
                </div>
              )}

              {/* Resultados da Busca */}
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Resultados ({searchResults.length})</span>
                    <span className="font-mono text-cyan-300">
                      {lastSearchCached
                        ? 'Servido do Cache Redis 24h (0 cota)'
                        : 'Consulta YouTube Data API v3'}
                    </span>
                  </div>
                  <ul className="divide-y divide-cyan-900/40 border border-cyan-900/40 rounded-xl overflow-hidden bg-[#070D1E]">
                    {searchResults.map((item) => (
                      <li key={item.videoId}>
                        <button
                          type="button"
                          onClick={() =>
                            handleSelectTrack(item.videoId, `${item.title} — ${item.channelTitle}`)
                          }
                          className="w-full flex items-center gap-3.5 p-3 hover:bg-cyan-950/50 transition-colors text-left cursor-pointer"
                        >
                          <div className="w-20 h-12 rounded-lg overflow-hidden bg-zinc-900 shrink-0 flex items-center justify-center">
                            {item.thumbnail ? (
                              <img
                                src={item.thumbnail}
                                alt={item.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Music className="w-5 h-5 text-zinc-500" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-white truncate">
                              {item.title}
                            </div>
                            <div className="text-xs text-zinc-400 truncate mt-0.5">
                              {item.channelTitle} · {item.videoId}
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-[#00F2FE] shrink-0">
                            Tocar na Sala
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Carregamento direto por URL ou videoId (0 cota) */}
              <div className="border-t border-cyan-900/40 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-[#00F2FE]" />
                    Colar Link ou videoId do YouTube (Gratuito · 0 cota de API)
                  </span>
                </div>
                <form onSubmit={handleLoadDirectUrl} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <input
                    type="text"
                    value={directUrlInput}
                    onChange={(e) => setDirectUrlInput(e.target.value)}
                    placeholder="https://youtube.com/watch?v=... ou videoId"
                    className="sm:col-span-6 px-3.5 py-2 rounded-xl bg-[#050A15] border border-cyan-900/70 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00F2FE]"
                  />
                  <input
                    type="text"
                    value={directUrlTitle}
                    onChange={(e) => setDirectUrlTitle(e.target.value)}
                    placeholder="Nome da faixa (opcional)"
                    className="sm:col-span-4 px-3.5 py-2 rounded-xl bg-[#050A15] border border-cyan-900/70 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00F2FE]"
                  />
                  <button
                    type="submit"
                    className="sm:col-span-2 px-3 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 text-xs font-semibold text-cyan-100 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Carregar
                  </button>
                </form>

                {/* Faixas rápidas de teste */}
                <div className="pt-1">
                  <div className="text-xs text-zinc-400 mb-2">
                    Seleção rápida para testar sincronização imediata:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {CURATED_MUSIC_VIDEOS.map((track) => {
                      const active = videoId === track.videoId;
                      return (
                        <button
                          key={track.videoId}
                          type="button"
                          onClick={() =>
                            handleSelectTrack(track.videoId, `${track.artist} — ${track.title}`)
                          }
                          className={`px-3 py-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#00F2FE]/10 border-[#00F2FE]/60 text-white'
                              : 'bg-[#070D1E] border-cyan-900/50 hover:border-cyan-700 text-zinc-300'
                          }`}
                        >
                          <div className="text-xs font-semibold truncate text-white">
                            {track.title}
                          </div>
                          <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                            {track.artist}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#0A1124] border border-cyan-900/50 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white">Controle Reservado ao Host</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Apenas o Host da sala pode pesquisar e trocar faixas. Use o chat ao lado para sugerir a próxima música ou crie sua própria sala digitando um novo ID acima.
                </p>
              </div>
              {!authUser && onRequireLogin && (
                <button
                  type="button"
                  onClick={onRequireLogin}
                  className="px-4 py-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-xs font-semibold text-cyan-200 whitespace-nowrap cursor-pointer"
                >
                  Entrar com E-mail
                </button>
              )}
            </div>
          )}

          {/* Guia Expansível: Google Cloud + Termos de Serviço */}
          <div className="bg-[#0A1124] border border-cyan-900/50 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowGuide((prev) => !prev)}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-cyan-950/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-[#00F2FE]" />
                <span className="text-sm font-bold text-white">
                  Configuração da YouTube Data API v3 e Conformidade com os Termos de Serviço
                </span>
              </div>
              {showGuide ? (
                <ChevronUp className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              )}
            </button>

            {showGuide && (
              <div className="px-5 pb-5 pt-2 border-t border-cyan-900/40 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-300 leading-relaxed">
                <div className="space-y-2.5">
                  <h4 className="font-bold text-white text-sm">
                    Passo 1: Chave da API no Google Cloud
                  </h4>
                  <ol className="list-decimal list-inside space-y-1.5 text-zinc-400">
                    <li>
                      Acesse o Google Cloud Console e crie o projeto{' '}
                      <span className="text-white font-mono">SyncBeats-MVP</span>.
                    </li>
                    <li>
                      Vá em <span className="text-zinc-200">APIs e Serviços &rarr; Biblioteca</span>{' '}
                      e ative a <span className="text-white">YouTube Data API v3</span>.
                    </li>
                    <li>
                      Em{' '}
                      <span className="text-zinc-200">
                        Credenciais &rarr; Criar credenciais &rarr; Chave de API
                      </span>
                      , copie sua chave.
                    </li>
                    <li>
                      Configure <span className="text-[#00F2FE] font-mono">YOUTUBE_API_KEY</span> nas
                      variáveis de ambiente do servidor.
                    </li>
                  </ol>
                  <p className="text-zinc-500">
                    A reprodução via YouTube IFrame Player API é gratuita e não consome cota; a chave é usada apenas nas buscas por texto.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <h4 className="font-bold text-white text-sm">
                    Passo 4: Regras dos Termos do YouTube
                  </h4>
                  <ul className="space-y-2 text-zinc-400">
                    <li>
                      <strong className="text-zinc-200">Player sempre visível:</strong> o vídeo permanece embutido em formato 16:9 acima do mínimo exigido (200px &times; 200px) como Clipe Ao Vivo.
                    </li>
                    <li>
                      <strong className="text-zinc-200">Cota gratuita protegida:</strong> limite padrão de 10.000 unidades/dia (100 unidades por busca). Buscas repetidas ficam em cache no Redis por 24 horas.
                    </li>
                    <li>
                      <strong className="text-zinc-200">Desbloqueio de áudio:</strong> o modal inicial &quot;Entrar na Sala&quot; dispara o play dentro da interação do ouvinte para atender à política de autoplay dos navegadores.
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Coluna Lateral (4 cols): Membros Online + Chat Ao Vivo da Sala */}
        <div className="lg:col-span-4 space-y-6">
          {/* Presença em Tempo Real */}
          <div className="bg-[#0A1124] border border-cyan-900/50 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#00F2FE]" />
                Na Sala Agora
              </h3>
              <span className="text-xs font-mono text-zinc-400 tabular-nums">
                {members.length} {members.length === 1 ? 'membro' : 'membros'}
              </span>
            </div>

            {members.length === 0 ? (
              <p className="text-xs text-zinc-500">Conectando participantes da sala...</p>
            ) : (
              <ul className="space-y-2">
                {members.map((member) => {
                  const isSelf = member.userId === currentUser.id;
                  return (
                    <li
                      key={member.userId}
                      className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#070D1E] border border-cyan-900/40 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800/60 text-[#00F2FE] font-bold flex items-center justify-center shrink-0">
                          {member.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <span className="font-semibold text-white">{member.username}</span>
                          {isSelf && <span className="text-zinc-500 ml-1">(você)</span>}
                        </div>
                      </div>
                      <span
                        className={`font-mono text-[11px] shrink-0 ${
                          member.isHost ? 'text-[#00F2FE] font-semibold' : 'text-zinc-500'
                        }`}
                      >
                        {member.isHost ? 'Host' : 'Ouvinte'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="pt-2 border-t border-cyan-900/40 text-xs text-zinc-400 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Tolerância alvo (RN06)
              </span>
              <span className="font-mono text-zinc-200 tabular-nums">&lt; 200ms</span>
            </div>
          </div>

          {/* Chat da Sala via Socket.io */}
          <div className="bg-[#0A1124] border border-cyan-900/50 rounded-2xl p-5 flex flex-col h-[380px]">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-900/40">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#00F2FE]" />
                Chat da Sala
              </h3>
              <span className="text-xs font-mono text-zinc-500">{roomId}</span>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-xs text-zinc-500 px-4">
                  <p>Nenhuma mensagem ainda.</p>
                  <p className="mt-1">
                    Envie uma mensagem ou abra o link de convite em outra aba para testar a sincronização ao vivo.
                  </p>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className="space-y-0.5">
                    <div className="flex items-center gap-2 text-[11px]">
                      <span
                        className={`font-semibold ${
                          msg.isHost ? 'text-[#00F2FE]' : 'text-zinc-300'
                        }`}
                      >
                        {msg.username}
                      </span>
                      {msg.isHost && <span className="text-zinc-500 font-mono">Host</span>}
                      <span className="text-zinc-600 font-mono tabular-nums ml-auto">
                        {new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-200 leading-relaxed break-words">{msg.text}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendChat} className="pt-3 border-t border-cyan-900/40 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Escrever na sala..."
                maxLength={300}
                className="flex-1 px-3 py-2 rounded-lg bg-[#050A15] border border-cyan-900/70 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00F2FE]"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                aria-label="Enviar mensagem"
                className="px-3 py-2 rounded-lg bg-[#00F2FE] hover:brightness-110 disabled:opacity-40 text-black transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export { YouTubeSyncPlayer };
