/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, Pause, MessageSquare, Activity, Shield, Users, 
  Clock, Terminal, Heart, Star, Zap, Music, Check, X, AlertCircle,
  Wifi, WifiOff, Sliders, Share2, Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Tipos e Interfaces ---
interface Reaction {
  id: string;
  emoji: string;
  x: number;
  y: number;
  timestamp: number;
}

interface Suggestion {
  id: string;
  title: string;
  artist: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface ServerState {
  status: 'playing' | 'paused';
  currentTrack: {
    id: string;
    title: string;
    artist: string;
    duration: number;
  };
  startTime: number | null;
  seekPosition: number;
  messages: Array<{ id: string; user: string; text: string; time: number }>;
  reactions: Reaction[];
  suggestions: Suggestion[];
}

// --- Mock de Infraestrutura (In-Memory) ---
const INITIAL_STATE: ServerState = {
  status: 'paused',
  currentTrack: {
    id: 'track-1',
    title: 'Vibe Tropical',
    artist: 'Sync Beats Collective',
    duration: 180000,
  },
  startTime: null,
  seekPosition: 0,
  messages: [],
  reactions: [],
  suggestions: [],
};

export default function App() {
  const [serverState, setServerState] = useState<ServerState>(INITIAL_STATE);
  const [logs, setLogs] = useState<string[]>([]);
  const [latency, setLatency] = useState<number>(50); // Chaos Slider value

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
  }, []);

  // --- Lógica de Sincronia com Latência Simulada ---
  const updateServer = useCallback((updater: (prev: ServerState) => ServerState, logMsg?: string) => {
    // Simula o tempo que o pacote leva para chegar ao servidor
    setTimeout(() => {
      setServerState(prev => {
        const newState = updater(prev);
        if (logMsg) addLog(logMsg);
        return newState;
      });
    }, latency / 2);
  }, [latency, addLog]);

  const handleHostPlay = () => {
    const now = Date.now();
    updateServer(prev => ({
      ...prev,
      status: 'playing',
      startTime: now,
    }), 'Host: Comando PLAY enviado');
  };

  const handleHostPause = (currentSeek: number) => {
    updateServer(prev => ({
      ...prev,
      status: 'paused',
      startTime: null,
      seekPosition: currentSeek,
    }), `Host: Comando PAUSE enviado (${Math.floor(currentSeek / 1000)}s)`);
  };

  const handleSendMessage = (user: string, text: string) => {
    updateServer(prev => ({
      ...prev,
      messages: [...prev.messages, { id: Math.random().toString(36), user, text, time: Date.now() }].slice(-20),
    }), `Chat: Mensagem de ${user} processada`);
  };

  const handleReaction = (emoji: string) => {
    const newReaction: Reaction = {
      id: Math.random().toString(36),
      emoji,
      x: Math.random() * 80 + 10, // 10% a 90%
      y: 0,
      timestamp: Date.now(),
    };
    updateServer(prev => ({
      ...prev,
      reactions: [...prev.reactions, newReaction].slice(-15),
    }));
  };

  const handleSuggest = (title: string, artist: string, userId: string) => {
    updateServer(prev => ({
      ...prev,
      suggestions: [...prev.suggestions, { id: Math.random().toString(36), title, artist, userId, status: 'pending' }],
    }), `Sugestão: "${title}" enviada por ${userId}`);
  };

  const handleApproveSuggestion = (id: string) => {
    updateServer(prev => {
      const suggestion = prev.suggestions.find(s => s.id === id);
      if (!suggestion) return prev;
      return {
        ...prev,
        currentTrack: { id: suggestion.id, title: suggestion.title, artist: suggestion.artist, duration: 210000 },
        status: 'paused',
        seekPosition: 0,
        startTime: null,
        suggestions: prev.suggestions.filter(s => s.id !== id),
      };
    }, 'Host: Sugestão aprovada! Nova música carregada.');
  };

  // Limpeza automática de reações antigas
  useEffect(() => {
    const interval = setInterval(() => {
      setServerState(prev => ({
        ...prev,
        reactions: prev.reactions.filter(r => Date.now() - r.timestamp < 3000),
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Event listener global para tecla Espaço (Play/Pause do Host)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const activeEl = document.activeElement;
        const isTyping = activeEl && (
          activeEl.tagName === 'INPUT' || 
          activeEl.tagName === 'TEXTAREA' || 
          activeEl.getAttribute('contenteditable') === 'true'
        );
        if (isTyping) return;

        e.preventDefault();

        if (serverState.status === 'playing') {
          const elapsed = Date.now() - (serverState.startTime || Date.now());
          const currentSeek = Math.min(serverState.seekPosition + elapsed, serverState.currentTrack.duration);
          handleHostPause(currentSeek);
        } else {
          handleHostPlay();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [serverState, handleHostPlay, handleHostPause]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Sync Beats <span className="text-xs font-medium text-indigo-400 ml-1 uppercase tracking-widest">Senac Tech Demo</span>
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 text-xs font-mono text-zinc-500">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${latency > 300 ? 'border-red-500/50 bg-red-500/10 text-red-400' : 'border-zinc-800 bg-zinc-800/50'}`}>
              {latency > 300 ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
              <span>LATENCY: {latency}ms</span>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {/* Lado do Host */}
        <AppView 
          title="Host (Controlador)" 
          role="host" 
          serverState={serverState} 
          latency={latency}
          onPlay={handleHostPlay}
          onPause={handleHostPause}
          onSendMessage={(txt) => handleSendMessage('Host', txt)}
          onReaction={handleReaction}
          onApproveSuggestion={handleApproveSuggestion}
          icon={<Shield className="w-5 h-5 text-indigo-400" />}
        />

        {/* Lado do Ouvinte */}
        <AppView 
          title="Ouvinte (Sincronizado)" 
          role="listener" 
          serverState={serverState} 
          latency={latency}
          onSendMessage={(txt) => handleSendMessage('Ouvinte', txt)}
          onReaction={handleReaction}
          onSuggest={handleSuggest}
          icon={<Users className="w-5 h-5 text-emerald-400" />}
        />
      </main>

      {/* Debug & Chaos Panel */}
      <footer className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 p-4 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              <Terminal className="w-3 h-3" />
              <span>Engine Logs & Network Events</span>
            </div>
            <div className="bg-black/50 rounded-xl p-3 h-32 overflow-y-auto font-mono text-[10px] leading-relaxed border border-zinc-800 scrollbar-hide">
              {logs.map((log, i) => (
                <div key={i} className="py-0.5 border-b border-white/5 last:border-0">
                  <span className="text-indigo-500 mr-2">➜</span>
                  <span className="text-zinc-400">{log}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="w-full md:w-80 flex flex-col gap-4">
            <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                  <Sliders className="w-3 h-3" />
                  <span>Chaos Slider (Network Injection)</span>
                </div>
                <span className={`text-xs font-mono font-bold ${latency > 300 ? 'text-red-400' : 'text-zinc-400'}`}>
                  {latency}ms
                </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1000" 
                step="10"
                value={latency}
                onChange={(e) => setLatency(parseInt(e.target.value))}
                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <p className="text-[9px] text-zinc-500 mt-2 leading-tight">
                Aumente a latência para ver o algoritmo de sincronia compensar o atraso de rede em tempo real.
              </p>
            </div>
          </div>
        </div>
      </footer>
      <div className="h-48" />
    </div>
  );
}

// --- Componente de Visualização do App ---
function AppView({ 
  title, 
  role, 
  serverState, 
  latency,
  onPlay, 
  onPause, 
  onSendMessage,
  onReaction,
  onSuggest,
  onApproveSuggestion,
  icon 
}: { 
  title: string; 
  role: 'host' | 'listener'; 
  serverState: ServerState;
  latency: number;
  onPlay?: () => void;
  onPause?: (seek: number) => void;
  onSendMessage: (text: string) => void;
  onReaction: (emoji: string) => void;
  onSuggest?: (title: string, artist: string, userId: string) => void;
  onApproveSuggestion?: (id: string) => void;
  icon: React.ReactNode;
}) {
  const [localSeek, setLocalSeek] = useState(0);
  const [chatInput, setChatInput] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestTitle, setSuggestTitle] = useState('');
  const [suggestArtist, setSuggestArtist] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const progressInterval = useRef<number | null>(null);

  // Lógica de Sincronia (Compensação de Latência)
  useEffect(() => {
    // Simula o delay de recebimento do pacote do servidor
    const timeout = setTimeout(() => {
      if (serverState.status === 'playing' && serverState.startTime) {
        const updateProgress = () => {
          const now = Date.now();
          // O segredo: startTime é o tempo real do servidor.
          // Mesmo que o evento chegue atrasado, calculamos a posição baseada no tempo absoluto.
          const elapsed = now - serverState.startTime!;
          const currentPos = serverState.seekPosition + elapsed;
          setLocalSeek(Math.min(currentPos, serverState.currentTrack.duration));
        };

        updateProgress();
        if (progressInterval.current) clearInterval(progressInterval.current);
        progressInterval.current = window.setInterval(updateProgress, 50);
      } else {
        if (progressInterval.current) clearInterval(progressInterval.current);
        setLocalSeek(serverState.seekPosition);
      }
    }, latency / 2);

    return () => {
      clearTimeout(timeout);
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [serverState.status, serverState.startTime, serverState.seekPosition, serverState.currentTrack.duration, latency]);

  const progressPercent = (localSeek / serverState.currentTrack.duration) * 100;

  return (
    <div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl flex flex-col h-[700px] relative group">
      {/* Reações Flutuantes */}
      <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
        <AnimatePresence>
          {serverState.reactions.map((r) => (
            <motion.div
              key={r.id}
              initial={{ y: 500, x: `${r.x}%`, opacity: 0, scale: 0.5 }}
              animate={{ y: -100, opacity: [0, 1, 1, 0], scale: [1, 1.5, 1.2] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3, ease: "easeOut" }}
              className="absolute text-3xl"
            >
              {r.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* App Header */}
      <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-800/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${role === 'host' ? 'bg-indigo-500/10' : 'bg-emerald-500/10'}`}>
            {icon}
          </div>
          <div>
            <span className="font-bold text-sm block leading-none mb-1">{title}</span>
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
              {role === 'host' ? 'Master Controller' : 'Sync Node #42'}
            </span>
          </div>
        </div>
        {role === 'listener' && (
          <button 
            onClick={() => setIsSuggesting(true)}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all active:scale-95"
            title="Sugerir Música"
          >
            <Music className="w-4 h-4 text-emerald-400" />
          </button>
        )}
      </div>

      {/* Player Section */}
      <div className="p-8 flex flex-col items-center text-center flex-shrink-0 bg-gradient-to-b from-zinc-800/10 to-transparent">
        <div className="w-44 h-44 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-[2.5rem] mb-6 shadow-2xl shadow-indigo-500/20 flex items-center justify-center relative group overflow-hidden">
          <Activity className="w-20 h-20 text-white/10 absolute" />
          <div className="z-10 text-white font-black text-5xl tracking-tighter">SB</div>
          {serverState.status === 'playing' && (
            <motion.div 
              animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-white/5"
            />
          )}
        </div>
        
        <h3 className="text-2xl font-black mb-1 tracking-tight">{serverState.currentTrack.title}</h3>
        <p className="text-zinc-500 text-sm font-medium mb-4 uppercase tracking-widest">{serverState.currentTrack.artist}</p>

        {/* Botão de Compartilhar Live */}
        <button
          onClick={() => setIsSharing(true)}
          className="mb-6 px-3.5 py-1.5 bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/20 hover:border-indigo-500 rounded-full text-xs font-bold text-indigo-400 hover:text-white flex items-center gap-1.5 transition-all duration-300 shadow-lg active:scale-95 cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          Compartilhar Live 🚀
        </button>

        {/* Progress Bar */}
        <div className="w-full mb-8">
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-3 p-0.5">
            <motion.div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
              transition={{ type: 'spring', bounce: 0, duration: 0.1 }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-zinc-500">
            <span>{formatTime(localSeek)}</span>
            <span>{formatTime(serverState.currentTrack.duration)}</span>
          </div>
        </div>

        {/* Controls & Reactions */}
        <div className="flex items-center gap-6">
          {role === 'host' && (
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-4">
                {serverState.status === 'paused' ? (
                  <button 
                    onClick={onPlay}
                    className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-xl active:scale-95 cursor-pointer"
                    title="Play (Espaço)"
                  >
                    <Play className="w-7 h-7 fill-current" />
                  </button>
                ) : (
                  <button 
                    onClick={() => onPause?.(localSeek)}
                    className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-xl active:scale-95 cursor-pointer"
                    title="Pause (Espaço)"
                  >
                    <Pause className="w-7 h-7 fill-current" />
                  </button>
                )}
              </div>
              <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest bg-zinc-800/40 px-2 py-0.5 rounded border border-zinc-800/60 mt-1">
                Atalho: [Espaço]
              </span>
            </div>
          )}
          
          <div className="flex gap-2 bg-zinc-800/50 p-2 rounded-2xl border border-zinc-700/30">
            {['❤️', '🔥', '⭐', '🚀'].map(emoji => (
              <button 
                key={emoji}
                onClick={() => onReaction(emoji)}
                className="w-10 h-10 hover:bg-zinc-700 rounded-xl flex items-center justify-center text-xl transition-all active:scale-125 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area (Chat + Suggestions) */}
      <div className="flex-1 flex flex-col min-h-0 border-t border-zinc-800 bg-black/40">
        <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide">
          {/* Notificações de Sugestão (Host Only) */}
          {role === 'host' && serverState.suggestions.length > 0 && (
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2">
                <AlertCircle className="w-3 h-3" />
                <span>Sugestões Pendentes</span>
              </div>
              {serverState.suggestions.map(s => (
                <motion.div 
                  key={s.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-2xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                      <Music className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">{s.title}</div>
                      <div className="text-[10px] text-zinc-500">{s.artist}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onApproveSuggestion?.(s.id)}
                      className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Chat Messages */}
          <AnimatePresence initial={false}>
            {serverState.messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex flex-col ${msg.user === 'Host' ? 'items-start' : 'items-end'}`}
              >
                <div className={`max-w-[85%] p-3 rounded-2xl text-xs shadow-lg ${
                  msg.user === 'Host' ? 'bg-zinc-800 text-zinc-200 rounded-tl-none' : 'bg-indigo-600 text-white rounded-tr-none'
                }`}>
                  <div className="text-[9px] font-black mb-1 opacity-50 uppercase tracking-widest">{msg.user}</div>
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (!chatInput.trim()) return;
            onSendMessage(chatInput);
            setChatInput('');
          }}
          className="p-4 border-t border-zinc-800 flex gap-3 bg-zinc-900/50"
        >
          <input 
            type="text" 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Comente a track..."
            className="flex-1 bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-zinc-600"
          />
          <button className="p-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all active:scale-90 shadow-lg shadow-indigo-500/20">
            <MessageSquare className="w-5 h-5 text-white" />
          </button>
        </form>
      </div>

      {/* Modal de Compartilhamento (Sessão Live) */}
      <AnimatePresence>
        {isSharing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl w-full max-w-xs shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-black text-lg tracking-tight text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-indigo-400" />
                  Divulgar Live!
                </h4>
                <button onClick={() => setIsSharing(false)} className="text-zinc-500 hover:text-white transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-[11px] text-zinc-400 mb-4 leading-relaxed">
                Convide seus amigos para ouvirem <span className="text-white font-bold">{serverState.currentTrack.title}</span> 100% sincronizados com você em tempo real!
              </p>

              {/* Link de Compartilhamento */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 flex items-center justify-between gap-2 mb-4">
                <div className="text-[10px] font-mono text-indigo-400 truncate flex-1">
                  {`https://syncbeats.app/room/live?track=${encodeURIComponent(serverState.currentTrack.title)}`}
                </div>
                <button
                  onClick={() => {
                    const shareUrl = `https://syncbeats.app/room/live?track=${encodeURIComponent(serverState.currentTrack.title)}`;
                    navigator.clipboard.writeText(shareUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-colors cursor-pointer flex-shrink-0"
                  title="Copiar Link"
                  type="button"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {copied && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="text-[10px] text-emerald-400 font-bold mb-4 text-center"
                >
                  Link copiado com sucesso! 🎉
                </motion.div>
              )}

              {/* Botões das Redes Sociais */}
              <div className="flex flex-col gap-2">
                {/* WhatsApp */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Cola comigo no Sync Beats! Estamos ouvindo "${serverState.currentTrack.title}" ao vivo e 100% sincronizados. Sintonize aqui: https://syncbeats.app/room/live?track=${encodeURIComponent(serverState.currentTrack.title)}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20 rounded-xl text-center text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  WhatsApp
                </a>

                {/* Twitter / X */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Ouvindo "${serverState.currentTrack.title}" de forma sincronizada com a galera no Sync Beats! 🚀✨ Entre no ritmo: https://syncbeats.app/room/live`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 bg-zinc-800 hover:bg-white text-zinc-300 hover:text-black border border-zinc-700 rounded-xl text-center text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Twitter / X
                </a>

                {/* Telegram */}
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent('https://syncbeats.app/room/live')}&text=${encodeURIComponent(`Cola no Sync Beats para ouvir "${serverState.currentTrack.title}" em sincronia instantânea!`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 bg-sky-600/10 hover:bg-sky-600 text-sky-400 hover:text-white border border-sky-500/20 rounded-xl text-center text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Telegram
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Sugestão (Listener Only) */}
      <AnimatePresence>
        {isSuggesting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl w-full max-w-xs shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-black text-lg tracking-tight">Sugerir Track</h4>
                <button onClick={() => setIsSuggesting(false)} className="text-zinc-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Nome da Música</label>
                  <input 
                    type="text" 
                    value={suggestTitle}
                    onChange={(e) => setSuggestTitle(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ex: Lofi Beats"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Artista</label>
                  <input 
                    type="text" 
                    value={suggestArtist}
                    onChange={(e) => setSuggestArtist(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ex: Chill Master"
                  />
                </div>
              </div>
              <button 
                onClick={() => {
                  if (suggestTitle && suggestArtist) {
                    onSuggest?.(suggestTitle, suggestArtist, 'Ouvinte_1');
                    setIsSuggesting(false);
                    setSuggestTitle('');
                    setSuggestArtist('');
                  }
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Enviar Sugestão
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
