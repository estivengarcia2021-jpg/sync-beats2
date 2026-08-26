/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, Pause, MessageSquare, Activity, Shield, Users, 
  Clock, Terminal, Heart, Star, Zap, Music, Check, X, AlertCircle,
  Wifi, WifiOff, Sliders, Share2, Copy, ArrowLeft, Radio, HelpCircle, Sparkles, Info,
  Volume2, VolumeX, Disc, Flame, Mail, LogIn, LogOut, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HomePage } from './components/HomePage';
import { StudioWorkflow, PRESET_TEMPLATES, PresetTemplate } from './components/StudioWorkflow';
import { SyncBeatsLogo, SyncBeatsIcon } from './components/SyncBeatsLogo';
import { audioEngine } from './services/AudioEngine';
import { AuthModal } from './components/AuthModal';
import { UserProfile } from './types';
import { MUSIC_LIBRARY, LibraryTrack } from './data/musicLibrary';
import { MusicLibraryModalOrSection } from './components/MusicLibrary';

// --- Tipos e Interfaces ---
export interface DJTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  badge?: string;
  genre: string;
}

export const DJ_TEST_TRACKS: DJTrack[] = [
  {
    id: 'track-billy-idol-1',
    title: 'EYES WITHOUT A FACE',
    artist: 'Billy Idol • Rebel Yell (1984)',
    duration: 298000,
    badge: 'DECK TEST 1 (NOVO)',
    genre: 'Synth Pop / New Wave Anos 80',
  },
  {
    id: 'track-m83-1',
    title: 'MIDNIGHT CITY',
    artist: 'M83 • Indie Electronic',
    duration: 180000,
    badge: 'DECK TEST 2',
    genre: 'Indie Electronic',
  },
  {
    id: 'track-disco-1',
    title: 'NEON NIGHTS & SUB-BASS',
    artist: 'DJ Pulse X',
    duration: 240000,
    badge: 'DECK TEST 3',
    genre: 'Club Electro',
  },
  {
    id: 'track-tropical-1',
    title: 'VIBE TROPICAL',
    artist: 'Sync Beats Collective',
    duration: 180000,
    badge: 'DECK TEST 4',
    genre: 'Deep House',
  },
  {
    id: 'track-podcast-1',
    title: 'EP. 42: O FUTURO DO ÁUDIO SINCRONIZADO',
    artist: 'Tech Talk Studio',
    duration: 300000,
    badge: 'DECK TEST 5',
    genre: 'Podcast Talk',
  },
];

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
    id: 'track-billy-idol-1',
    title: 'EYES WITHOUT A FACE',
    artist: 'Billy Idol • Rebel Yell (1984)',
    duration: 298000,
  },
  startTime: null,
  seekPosition: 0,
  messages: [
    { id: '1', user: 'Host_DJ', text: '🎸 Faixa de teste Billy Idol - Eyes Without a Face pronta no deck!', time: Date.now() - 6000 },
    { id: '2', user: 'Ouvinte_SP', text: 'Esse clássico dos anos 80 tem um sintetizador sensacional! Pronto pro teste.', time: Date.now() - 3000 },
  ],
  reactions: [],
  suggestions: [],
};

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'studio'>('home');
  const [studioTab, setStudioTab] = useState<'studio' | 'library'>('studio');
  const [activeTemplateId, setActiveTemplateId] = useState<string>('billy-idol-eyes');
  const [serverState, setServerState] = useState<ServerState>(INITIAL_STATE);
  const [logs, setLogs] = useState<string[]>([]);
  const [latency, setLatency] = useState<number>(50); // Chaos Slider value
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [audioVolume, setAudioVolume] = useState<number>(0.5);

  // --- Estado de Autenticação de Usuário (Login por E-mail) ---
  const [authUser, setAuthUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('syncbeats_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalRole, setAuthModalRole] = useState<'host' | 'listener'>('listener');
  const [authModalTitle, setAuthModalTitle] = useState<string>('Entrar na Sala Sincronizada');

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
  }, []);

  const handleOpenLogin = (defaultRole: 'host' | 'listener' = 'listener', actionTitle: string = 'Entrar na Sala Sincronizada') => {
    setAuthModalRole(defaultRole);
    setAuthModalTitle(actionTitle);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setAuthUser(user);
    setIsAuthModalOpen(false);
    addLog(`👤 Usuário autenticado: ${user.name} (${user.email}) como ${user.role === 'host' ? 'Host DJ' : 'Ouvinte'}`);
    setCurrentView('studio');
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('syncbeats_auth_user');
    } catch (e) {
      console.error(e);
    }
    setAuthUser(null);
    addLog('🚪 Sessão encerrada');
  };

  // --- Web Audio Engine Synchronization ---
  useEffect(() => {
    if (serverState.status === 'playing') {
      audioEngine.init();
      audioEngine.setVolume(audioVolume);
      audioEngine.setMuted(isAudioMuted);
      audioEngine.playTrack(serverState.currentTrack.id, serverState.currentTrack.title);
    } else {
      audioEngine.stop();
    }

    return () => {
      audioEngine.stop();
    };
  }, [serverState.status, serverState.currentTrack.id, serverState.currentTrack.title]);

  const toggleMute = () => {
    const nextMuted = !isAudioMuted;
    setIsAudioMuted(nextMuted);
    audioEngine.setMuted(nextMuted);
    addLog(nextMuted ? '🔇 Áudio sintetizado silenciado' : '🔊 Áudio sintetizado ativado');
  };

  const handleVolumeChange = (newVol: number) => {
    setAudioVolume(newVol);
    audioEngine.setVolume(newVol);
  };

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

  const handleSelectTemplate = (template: PresetTemplate) => {
    setActiveTemplateId(template.id);
    updateServer(prev => ({
      ...prev,
      currentTrack: template.track,
      status: 'paused',
      startTime: null,
      seekPosition: 0,
    }), `Template alterado: ${template.name}`);
  };

  const handleSelectDJTrack = (track: DJTrack) => {
    updateServer(prev => ({
      ...prev,
      currentTrack: {
        id: track.id,
        title: track.title,
        artist: track.artist,
        duration: track.duration,
      },
      status: 'paused',
      startTime: null,
      seekPosition: 0,
    }), `🎛️ Faixa DJ Carregada no Deck: ${track.title} (${track.artist})`);
  };

  const handleSelectLibraryTrack = (track: LibraryTrack) => {
    const now = Date.now();
    updateServer(prev => ({
      ...prev,
      currentTrack: {
        id: track.id,
        title: track.title.toUpperCase(),
        artist: `${track.artist}${track.album ? ` • ${track.album}` : ''}${track.year ? ` (${track.year})` : ''}`,
        duration: track.duration,
      },
      status: 'playing',
      startTime: now,
      seekPosition: 0,
    }), `🎵 Faixa da LIB Selecionada: ${track.title} por ${track.artist} (Transmitindo ao vivo)`);
    setStudioTab('studio');
  };

  const handleRunAutoDemo = () => {
    addLog('🤖 Iniciando Demonstração Didática Automática...');
    
    // 1. Play
    const now = Date.now();
    updateServer(prev => ({ ...prev, status: 'playing', startTime: now }), '🤖 [Demo 1/5] Host deu Play no áudio (Billy Idol)');

    // 2. Emoji Reaction
    setTimeout(() => {
      const newReaction: Reaction = {
        id: Math.random().toString(36),
        emoji: '🔥',
        x: 50,
        y: 0,
        timestamp: Date.now(),
      };
      updateServer(prev => ({ ...prev, reactions: [...prev.reactions, newReaction] }), '🤖 [Demo 2/5] Reação "🔥" emitida pelo Ouvinte');
    }, 2000);

    // 3. Listener Chat
    setTimeout(() => {
      updateServer(prev => ({
        ...prev,
        messages: [...prev.messages, { id: Math.random().toString(36), user: 'Ouvinte_Demo', text: 'Eyes Without a Face tá tocando 100% afinado em tempo real!', time: Date.now() }],
      }), '🤖 [Demo 3/5] Mensagem de chat recebida');
    }, 4500);

    // 4. Inject Latency
    setTimeout(() => {
      setLatency(350);
      addLog('🤖 [Demo 4/5] Latência de rede alterada para 350ms (simulação de 4G instável)');
    }, 7000);

    // 5. Success
    setTimeout(() => {
      addLog('✅ [Demo 5/5] Teste concluído com sucesso! Repare que o áudio continuou perfeito.');
    }, 9500);
  };

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

  if (currentView === 'home') {
    return (
      <>
        <HomePage 
          onOpenStudio={() => setCurrentView('studio')} 
          onOpenLogin={handleOpenLogin}
          authUser={authUser}
          onLogout={handleLogout}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          defaultRole={authModalRole}
          actionTitle={authModalTitle}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-zinc-100 font-sans selection:bg-[#FF921C]/30">
      {/* Header */}
      <header className="h-16 border-b border-cyan-900/60 flex items-center justify-between px-4 sm:px-6 bg-[#050A15]/95 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-800/60 text-xs text-cyan-200 font-bold uppercase transition-colors cursor-pointer"
            title="Voltar para Apresentação Comercial"
          >
            <ArrowLeft className="w-4 h-4 text-[#00F2FE]" />
            <span className="hidden lg:inline">Apresentação Comercial</span>
          </button>

          <div className="h-4 w-px bg-cyan-900/60 hidden sm:block" />

          <div className="flex items-center gap-2 sm:gap-3">
            <SyncBeatsLogo size="sm" showBetasBadge={true} onClick={() => setCurrentView('home')} />
            
            {/* View Switcher Tabs: Studio vs Library */}
            <div className="flex items-center bg-[#070D1E] border border-cyan-900/70 rounded-xl p-1">
              <button
                onClick={() => setStudioTab('studio')}
                className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  studioTab === 'studio'
                    ? 'bg-gradient-to-r from-[#00F2FE] to-[#0072FF] text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">STUDIO DJ DECK</span>
                <span className="sm:hidden">DECK</span>
              </button>

              <button
                onClick={() => setStudioTab('library')}
                className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  studioTab === 'library'
                    ? 'bg-gradient-to-r from-[#00F2FE] to-[#0072FF] text-black shadow-sm'
                    : 'text-cyan-300 hover:text-white'
                }`}
              >
                <Disc className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">BIBLIOTECA (LIB)</span>
                <span className="sm:hidden">LIB</span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-700/60 text-[9px] font-mono text-[#00F2FE]">
                  {MUSIC_LIBRARY.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Section: User Profile Badge, Audio Synth & Latency */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* User Auth Profile Widget */}
          {authUser ? (
            <div className="flex items-center gap-2 bg-[#0A1124] border border-cyan-500/40 rounded-xl px-2.5 py-1 shadow-sm">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#00F2FE] to-[#0072FF] text-black flex items-center justify-center font-black text-[11px]">
                {authUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left leading-none">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="truncate max-w-[100px]">{authUser.name}</span>
                  <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded border uppercase ${
                    authUser.role === 'host'
                      ? 'text-[#00F2FE] bg-[#00F2FE]/15 border-[#00F2FE]/30'
                      : 'text-cyan-300 bg-cyan-950 border-cyan-700/60'
                  }`}>
                    {authUser.role === 'host' ? 'DJ HOST' : 'OUVINTE'}
                  </span>
                </div>
                <div className="text-[9px] font-mono text-cyan-300/70 truncate max-w-[120px] mt-0.5">
                  {authUser.email}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1 hover:bg-cyan-950 text-zinc-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                title="Sair / Trocar de Conta"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleOpenLogin('listener', 'Acessar com E-mail')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#0072FF] text-black text-xs font-black uppercase tracking-wider transition-all hover:brightness-110 cursor-pointer shadow-sm shadow-[#00F2FE]/20"
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ENTRAR VIA E-MAIL</span>
              <span className="sm:hidden">LOGIN</span>
            </button>
          )}

          {/* Web Audio Synthesizer Control */}
          <div className="hidden sm:flex items-center gap-2 bg-[#0A1124] border border-cyan-500/30 rounded-xl px-3 py-1.5 shadow-sm">
            <button
              onClick={toggleMute}
              className={`p-1 rounded-lg transition-colors cursor-pointer ${isAudioMuted ? 'text-zinc-500 hover:text-zinc-300' : 'text-[#00F2FE] hover:text-white'}`}
              title={isAudioMuted ? "Ativar som do sintetizador" : "Silenciar sintetizador"}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isAudioMuted ? 0 : audioVolume}
              onChange={(e) => {
                if (isAudioMuted) setIsAudioMuted(false);
                handleVolumeChange(parseFloat(e.target.value));
              }}
              className="w-16 h-1 bg-cyan-950 rounded-lg appearance-none cursor-pointer accent-[#00F2FE]"
              title="Volume do sintetizador Web Audio"
            />
            <span className="text-[10px] font-mono font-bold text-cyan-300">
              {isAudioMuted ? 'MUDO' : `${Math.round(audioVolume * 100)}%`}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${latency > 300 ? 'border-red-500/50 bg-red-500/10 text-red-400' : 'border-cyan-500/40 bg-cyan-950/60 text-cyan-200'}`}>
              {latency > 300 ? <WifiOff className="w-3 h-3 text-red-400" /> : <Wifi className="w-3 h-3 text-[#00F2FE]" />}
              <span className="text-[11px]">{latency}ms</span>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {studioTab === 'library' ? (
          <div className="space-y-6">
            <MusicLibraryModalOrSection
              currentTrackId={serverState.currentTrack.id}
              isPlaying={serverState.status === 'playing'}
              onSelectTrack={handleSelectLibraryTrack}
              onTogglePlayPause={serverState.status === 'playing' ? () => handleHostPause(0) : handleHostPlay}
              userRole={authUser?.role || 'host'}
            />
          </div>
        ) : (
          <>
            {/* DJ Crate: Seletor Rápido de Faixas de Teste */}
            <div className="bg-[#0A1124] border border-cyan-500/30 rounded-2xl p-5 shadow-xl shadow-cyan-950/20 relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#00F2FE]/20 to-[#0072FF]/20 border border-[#00F2FE]/40 text-[#00F2FE]">
                    <Disc className="w-5 h-5 text-[#00F2FE] animate-spin" style={{ animationDuration: serverState.status === 'playing' ? '3s' : '12s' }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-sm text-white uppercase tracking-wider">
                        🎛️ Faixas de Teste DJ (DJ Crate)
                      </h3>
                      <span className="px-2 py-0.5 bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/40 text-[9px] font-mono font-bold rounded-full uppercase">
                        Ao Vivo
                      </span>
                    </div>
                    <p className="text-xs text-cyan-300/80 font-mono mt-0.5">
                      Clique em qualquer faixa para carregar no deck com síntese de áudio Web Audio em tempo real
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStudioTab('library')}
                    className="px-3 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 text-xs font-black text-[#00F2FE] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Disc className="w-3.5 h-3.5" />
                    <span>Ver Todas as {MUSIC_LIBRARY.length} Faixas da LIB</span>
                  </button>

                  {/* Audio Synth Status Pill */}
                  <div className="flex items-center gap-2 bg-[#050A15] border border-cyan-500/30 px-3 py-1.5 rounded-full self-start md:self-auto">
                    <div className={`w-2 h-2 rounded-full ${serverState.status === 'playing' ? 'bg-[#00F2FE] animate-ping' : 'bg-zinc-600'}`} />
                    <span className="text-[10px] font-mono font-bold text-cyan-300">
                      {serverState.status === 'playing' ? 'SINTETIZADOR TOCANDO' : 'DECK PAUSADO'}
                    </span>
                    {/* Mini Audio Waves */}
                    {serverState.status === 'playing' && (
                      <div className="flex items-center gap-0.5 h-3 ml-1">
                        {[40, 80, 60, 100, 50].map((h, i) => (
                          <motion.div
                            key={i}
                            animate={{ height: ['20%', `${h}%`, '30%'] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                            className="w-0.5 bg-[#00F2FE] rounded-full"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Grid de Faixas DJ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                {DJ_TEST_TRACKS.map((track) => {
                  const isCurrent = serverState.currentTrack.title.toUpperCase().includes(track.title) || serverState.currentTrack.id === track.id;
                  const isBillyIdol = track.id === 'track-billy-idol-1';

                  return (
                    <button
                      key={track.id}
                      onClick={() => handleSelectDJTrack(track)}
                      className={`p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer relative group ${
                        isCurrent
                          ? 'bg-gradient-to-br from-cyan-950/80 to-[#0072FF]/20 border-[#00F2FE] shadow-lg shadow-[#00F2FE]/15 scale-[1.02]'
                          : 'bg-[#050A15]/70 hover:bg-[#050A15] border-cyan-900/60 hover:border-cyan-500/50'
                      }`}
                    >
                      {isBillyIdol && (
                        <div className="absolute -top-2 -right-1 bg-gradient-to-r from-[#00F2FE] to-[#0072FF] text-black text-[8px] font-black uppercase px-2 py-0.5 rounded-full shadow-md">
                          ★ DESTAQUE
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                            {track.badge}
                          </span>
                          {isCurrent && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FE] animate-pulse" />
                          )}
                        </div>
                        <div className="font-black text-xs text-white uppercase tracking-tight line-clamp-1 group-hover:text-[#00F2FE] transition-colors">
                          {track.title}
                        </div>
                        <div className="text-[10px] text-cyan-300/70 font-mono mt-0.5 line-clamp-1">
                          {track.artist}
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-cyan-900/40 flex items-center justify-between text-[9px] font-mono text-zinc-400">
                        <span>{track.genre}</span>
                        <span className={`font-bold ${isCurrent ? 'text-[#00F2FE]' : 'text-zinc-500'}`}>
                          {isCurrent ? 'NO DECK' : 'CARREGAR'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Componente Didático de Guia & Templates */}
            <StudioWorkflow
              serverStatus={serverState.status}
              startTime={serverState.startTime}
              seekPosition={serverState.seekPosition}
              latency={latency}
              activeTemplateId={activeTemplateId}
              onSelectTemplate={handleSelectTemplate}
              onRunAutoDemo={handleRunAutoDemo}
            />

            {/* Simulador Lado a Lado (Host x Ouvinte) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Lado do Host */}
              <AppView 
                title="Host (Controlador Mestre DJ)" 
                role="host" 
                serverState={serverState} 
                latency={latency}
                currentUser={authUser}
                onPlay={handleHostPlay}
                onPause={handleHostPause}
                onSendMessage={(txt) => handleSendMessage(authUser?.role === 'host' ? authUser.name : 'Host_DJ', txt)}
                onReaction={handleReaction}
                onApproveSuggestion={handleApproveSuggestion}
                onSelectDJTrack={handleSelectDJTrack}
                icon={<Shield className="w-5 h-5 text-[#00F2FE]" />}
              />

              {/* Lado do Ouvinte */}
              <AppView 
                title="Ouvinte (Nó Sincronizado)" 
                role="listener" 
                serverState={serverState} 
                latency={latency}
                currentUser={authUser}
                onSendMessage={(txt) => handleSendMessage(authUser?.role === 'listener' ? authUser.name : (authUser ? authUser.name : 'Ouvinte_SP'), txt)}
                onReaction={handleReaction}
                onSuggest={handleSuggest}
                icon={<Users className="w-5 h-5 text-cyan-400" />}
              />
            </div>
          </>
        )}
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

      {/* Auth Modal Global */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        defaultRole={authModalRole}
        actionTitle={authModalTitle}
      />
    </div>
  );
}

// --- Componente de Visualização do App ---
function AppView({ 
  title, 
  role, 
  serverState, 
  latency,
  currentUser,
  onPlay, 
  onPause, 
  onSendMessage,
  onReaction,
  onSuggest,
  onApproveSuggestion,
  onSelectDJTrack,
  icon 
}: { 
  title: string; 
  role: 'host' | 'listener'; 
  serverState: ServerState;
  latency: number;
  currentUser?: UserProfile | null;
  onPlay?: () => void;
  onPause?: (seek: number) => void;
  onSendMessage: (text: string) => void;
  onReaction: (emoji: string) => void;
  onSuggest?: (title: string, artist: string, userId: string) => void;
  onApproveSuggestion?: (id: string) => void;
  onSelectDJTrack?: (track: DJTrack) => void;
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
    <div className="bg-[#0A1124] rounded-3xl border border-cyan-500/30 overflow-hidden shadow-2xl flex flex-col h-[740px] relative group">
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
      <div className="p-5 border-b border-cyan-900/60 flex items-center justify-between bg-cyan-950/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${role === 'host' ? 'bg-[#00F2FE]/15 text-[#00F2FE]' : 'bg-cyan-500/10 text-cyan-300'}`}>
            {icon}
          </div>
          <div>
            <span className="font-bold text-sm block leading-none mb-1 text-white uppercase">{title}</span>
            <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest">
              {role === 'host' 
                ? (currentUser?.role === 'host' ? `Host DJ: ${currentUser.name}` : 'Master Controller DJ') 
                : (currentUser?.role === 'listener' ? `Ouvinte: ${currentUser.name}` : 'Sync Node #42')}
            </span>
          </div>
        </div>
        {role === 'listener' && (
          <button 
            onClick={() => setIsSuggesting(true)}
            className="p-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 rounded-lg transition-all active:scale-95 flex items-center gap-1.5 text-xs text-[#00F2FE] font-bold uppercase cursor-pointer"
            title="Sugerir Música"
          >
            <Music className="w-4 h-4 text-[#00F2FE]" />
            <span className="hidden sm:inline">Sugerir Música</span>
          </button>
        )}
      </div>

      {/* Didactic Banner per Role */}
      {role === 'host' ? (
        <div className="px-5 py-2.5 bg-[#00F2FE]/10 border-b border-[#00F2FE]/20 text-[11px] text-cyan-100 flex items-center justify-between font-sans">
          <span className="flex items-center gap-1.5">
            👑 <span><strong>Controlador Mestre:</strong> Dê Play para transmitir Billy Idol ou qualquer track a todos com áudio real.</span>
          </span>
          <span className="font-mono text-[9px] bg-[#00F2FE]/20 px-2 py-0.5 rounded text-[#00F2FE] font-bold uppercase">
            Emissor DJ
          </span>
        </div>
      ) : (
        <div className="px-5 py-2.5 bg-cyan-950/40 border-b border-cyan-500/20 text-[11px] text-cyan-100 flex items-center justify-between font-sans">
          <span className="flex items-center gap-1.5">
            🎧 <span><strong>Ouvinte Receptor:</strong> Seu player compensa o tempo e reproduz com precisão milimétrica.</span>
          </span>
          <span className="font-mono text-[9px] bg-cyan-500/20 px-2 py-0.5 rounded text-cyan-300 font-bold uppercase">
            Compensador
          </span>
        </div>
      )}

      {/* Player Section */}
      <div className="p-7 flex flex-col items-center text-center flex-shrink-0 bg-gradient-to-b from-cyan-950/20 to-transparent">
        <div className="w-40 h-40 bg-gradient-to-br from-[#00F2FE]/20 via-[#0072FF]/20 to-[#0A0F1D] rounded-2xl mb-5 shadow-2xl shadow-[#00F2FE]/15 flex items-center justify-center relative group overflow-hidden border border-[#00F2FE]/40">
          <Activity className="w-20 h-20 text-cyan-400/10 absolute" />
          <div className="z-10 flex flex-col items-center justify-center">
            <SyncBeatsIcon size={64} />
          </div>
          {serverState.status === 'playing' && (
            <motion.div 
              animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-[#00F2FE]/10"
            />
          )}
        </div>
        
        <h3 className="text-xl font-black mb-1 tracking-tight text-white uppercase">{serverState.currentTrack.title}</h3>
        <p className="text-cyan-300/80 text-xs font-mono font-semibold mb-3 uppercase tracking-widest">{serverState.currentTrack.artist}</p>

        {/* Botão de Compartilhar Live */}
        <button
          onClick={() => setIsSharing(true)}
          className="mb-5 px-4 py-1.5 bg-[#00F2FE]/15 hover:bg-gradient-to-r hover:from-[#00F2FE] hover:to-[#0072FF] border border-[#00F2FE]/40 hover:border-[#00F2FE] rounded-full text-xs font-black uppercase text-[#00F2FE] hover:text-black flex items-center gap-1.5 transition-all duration-300 shadow-lg active:scale-95 cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          Compartilhar Sessão 🚀
        </button>

        {/* Progress Bar */}
        <div className="w-full mb-6">
          <div className="h-2 bg-cyan-950 rounded-full overflow-hidden mb-2.5 p-0.5 border border-cyan-900/60">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#00F2FE] to-[#0072FF] rounded-full"
              style={{ width: `${progressPercent}%` }}
              transition={{ type: 'spring', bounce: 0, duration: 0.1 }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-cyan-400">
            <span>{formatTime(localSeek)}</span>
            <span>{formatTime(serverState.currentTrack.duration)}</span>
          </div>
        </div>

        {/* Controls & Reactions */}
        <div className="flex items-center gap-5">
          {role === 'host' && (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-4">
                {serverState.status === 'paused' ? (
                  <button 
                    onClick={onPlay}
                    className="w-13 h-13 bg-gradient-to-r from-[#00F2FE] to-[#0072FF] text-black rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-xl shadow-[#00F2FE]/25 active:scale-95 cursor-pointer"
                    title="Play (Espaço)"
                  >
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </button>
                ) : (
                  <button 
                    onClick={() => onPause?.(localSeek)}
                    className="w-13 h-13 bg-gradient-to-r from-[#00F2FE] to-[#0072FF] text-black rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-xl shadow-[#00F2FE]/25 active:scale-95 cursor-pointer"
                    title="Pause (Espaço)"
                  >
                    <Pause className="w-6 h-6 fill-current" />
                  </button>
                )}
              </div>
              <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60 mt-1">
                [Espaço]
              </span>
            </div>
          )}
          
          <div className="flex gap-1.5 bg-[#050A15] p-1.5 rounded-2xl border border-cyan-800/40">
            {['❤️', '🔥', '⭐', '🚀'].map(emoji => (
              <button 
                key={emoji}
                onClick={() => onReaction(emoji)}
                className="w-9 h-9 hover:bg-cyan-950 rounded-xl flex items-center justify-center text-lg transition-all active:scale-125 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area (Chat + Suggestions) */}
      <div className="flex-1 flex flex-col min-h-0 border-t border-cyan-900/60 bg-[#050A15]/80">
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
          {/* Notificações de Sugestão (Host Only) */}
          {role === 'host' && serverState.suggestions.length > 0 && (
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-[9px] font-black text-[#00F2FE] uppercase tracking-widest mb-1">
                <AlertCircle className="w-3 h-3" />
                <span>Sugestões Pendentes</span>
              </div>
              {serverState.suggestions.map(s => (
                <motion.div 
                  key={s.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-cyan-950/60 border border-cyan-500/30 p-2.5 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-[#00F2FE]/20 rounded-lg flex items-center justify-center">
                      <Music className="w-3.5 h-3.5 text-[#00F2FE]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{s.title}</div>
                      <div className="text-[10px] text-cyan-300/70">{s.artist}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onApproveSuggestion?.(s.id)}
                      className="w-7 h-7 bg-[#00F2FE] text-black rounded-lg flex items-center justify-center hover:bg-cyan-300 transition-colors cursor-pointer"
                      title="Aprovar e Tocar"
                    >
                      <Check className="w-3.5 h-3.5" />
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
                className={`flex flex-col ${msg.user === 'Host' || msg.user === 'Host_DJ' ? 'items-start' : 'items-end'}`}
              >
                <div className={`max-w-[85%] p-2.5 rounded-2xl text-xs shadow-lg ${
                  msg.user === 'Host' || msg.user === 'Host_DJ' ? 'bg-cyan-950/80 border border-cyan-700/40 text-cyan-100 rounded-tl-none' : 'bg-gradient-to-r from-[#00F2FE] to-[#0072FF] text-black font-medium rounded-tr-none'
                }`}>
                  <div className="text-[9px] font-black mb-0.5 opacity-60 uppercase tracking-widest">{msg.user}</div>
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
          className="p-3.5 border-t border-cyan-900/60 flex gap-2.5 bg-[#0A1124]/90"
        >
          <input 
            type="text" 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Comente sobre a música..."
            className="flex-1 bg-cyan-950/60 border border-cyan-800/60 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-[#00F2FE] outline-none text-white transition-all placeholder:text-cyan-600"
          />
          <button className="p-2.5 bg-gradient-to-r from-[#00F2FE] to-[#0072FF] hover:opacity-90 rounded-xl transition-all active:scale-90 shadow-lg shadow-cyan-500/20 text-black cursor-pointer">
            <MessageSquare className="w-4 h-4" />
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
              className="bg-[#0A1124] border border-cyan-500/40 p-6 rounded-3xl w-full max-w-xs shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-black text-lg tracking-tight text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-[#00F2FE]" />
                  Divulgar Sessão!
                </h4>
                <button onClick={() => setIsSharing(false)} className="text-zinc-500 hover:text-white transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-[11px] text-cyan-200/80 mb-4 leading-relaxed">
                Convide seus amigos para ouvirem <span className="text-white font-bold">{serverState.currentTrack.title}</span> 100% sincronizados com você em tempo real!
              </p>

              {/* Link de Compartilhamento */}
              <div className="bg-[#050A15] border border-cyan-800/60 rounded-xl p-2.5 flex items-center justify-between gap-2 mb-4">
                <div className="text-[10px] font-mono text-[#00F2FE] truncate flex-1">
                  {`https://syncbeats.app/room/live?track=${encodeURIComponent(serverState.currentTrack.title)}`}
                </div>
                <button
                  onClick={() => {
                    const shareUrl = `https://syncbeats.app/room/live?track=${encodeURIComponent(serverState.currentTrack.title)}`;
                    navigator.clipboard.writeText(shareUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="p-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-200 hover:text-white rounded-lg transition-colors cursor-pointer flex-shrink-0"
                  title="Copiar Link"
                  type="button"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#00F2FE]" />}
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
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Cola comigo no Sync Beats! Estamos ouvindo "${serverState.currentTrack.title}" ao vivo e 100% sincronizados. Sintonize aqui: https://syncbeats.app/room/live?track=${encodeURIComponent(serverState.currentTrack.title)}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 bg-emerald-600/15 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded-xl text-center text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  WhatsApp
                </a>

                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Ouvindo "${serverState.currentTrack.title}" de forma sincronizada com a galera no Sync Beats! 🚀✨ Entre no ritmo: https://syncbeats.app/room/live`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 bg-cyan-950/80 hover:bg-gradient-to-r hover:from-[#00F2FE] hover:to-[#0072FF] text-cyan-200 hover:text-black border border-cyan-800/60 rounded-xl text-center text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Twitter / X
                </a>

                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent('https://syncbeats.app/room/live')}&text=${encodeURIComponent(`Cola no Sync Beats para ouvir "${serverState.currentTrack.title}" em sincronia instantânea!`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 bg-sky-600/15 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/30 rounded-xl text-center text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2"
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
              className="bg-[#0A1124] border border-cyan-500/40 p-6 rounded-3xl w-full max-w-xs shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-black text-lg tracking-tight text-white">Sugerir Track</h4>
                <button onClick={() => setIsSuggesting(false)} className="text-zinc-500 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-[10px] font-bold text-cyan-400 uppercase mb-1 block">Nome da Música</label>
                  <input 
                    type="text" 
                    value={suggestTitle}
                    onChange={(e) => setSuggestTitle(e.target.value)}
                    className="w-full bg-[#050A15] border border-cyan-800/60 rounded-xl px-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-[#00F2FE]"
                    placeholder="Ex: Eyes Without a Face"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-cyan-400 uppercase mb-1 block">Artista</label>
                  <input 
                    type="text" 
                    value={suggestArtist}
                    onChange={(e) => setSuggestArtist(e.target.value)}
                    className="w-full bg-[#050A15] border border-cyan-800/60 rounded-xl px-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-[#00F2FE]"
                    placeholder="Ex: Billy Idol"
                  />
                </div>
              </div>
              <button 
                onClick={() => {
                  if (suggestTitle && suggestArtist) {
                    onSuggest?.(suggestTitle, suggestArtist, currentUser?.name || currentUser?.email || 'Ouvinte_1');
                    setIsSuggesting(false);
                    setSuggestTitle('');
                    setSuggestArtist('');
                  }
                }}
                className="w-full py-3 bg-gradient-to-r from-[#00F2FE] to-[#0072FF] hover:opacity-90 text-black font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
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
