import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, VolumeX, 
  Search, Heart, ThumbsUp, ThumbsDown, MoreVertical, Share2, Radio, 
  MessageSquare, Users, Sparkles, Check, Sliders, Disc, Music, Flame, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LibraryTrack, MUSIC_LIBRARY } from '../data/musicLibrary';
import { UserProfile } from '../types';

interface YouTubeMusicViewProps {
  currentTrack: {
    id: string;
    title: string;
    artist: string;
    duration: number;
  };
  isPlaying: boolean;
  onPlay: () => void;
  onPause: (seek?: number) => void;
  onSelectTrack: (track: LibraryTrack) => void;
  onSeek?: (positionMs: number) => void;
  currentSeekMs: number;
  authUser: UserProfile | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  isAudioMuted: boolean;
  audioVolume: number;
  onToggleMute: () => void;
  onVolumeChange: (vol: number) => void;
  // Sincronização & Chat
  messages: Array<{ id: string; user: string; text: string; time: number }>;
  onSendMessage: (text: string) => void;
  reactions: Array<{ id: string; emoji: string; x: number; y: number; timestamp: number }>;
  onReaction: (emoji: string) => void;
  latency: number;
  onLatencyChange: (val: number) => void;
  onSwitchToStudio?: () => void;
}

export const YouTubeMusicView: React.FC<YouTubeMusicViewProps> = ({
  currentTrack,
  isPlaying,
  onPlay,
  onPause,
  onSelectTrack,
  onSeek,
  currentSeekMs,
  authUser,
  onOpenLogin,
  onLogout,
  isAudioMuted,
  audioVolume,
  onToggleMute,
  onVolumeChange,
  messages,
  onSendMessage,
  reactions,
  onReaction,
  latency,
  onLatencyChange,
  onSwitchToStudio,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tudo');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [likedTrackIds, setLikedTrackIds] = useState<Record<string, boolean>>({
    'track-billy-idol-1': true,
    'track-m83-midnight': true,
  });
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const categories = ['Tudo', 'Energia', 'Relaxar', 'Treino', 'Foco', 'Anos 80', 'Eletrônica', 'Deep House', 'Lo-Fi'];

  // Encontra a faixa ativa da biblioteca para pegar capa e estilo
  const activeLibraryTrack = useMemo(() => {
    return MUSIC_LIBRARY.find(t => t.id === currentTrack.id || t.title.toLowerCase() === currentTrack.title.toLowerCase()) || MUSIC_LIBRARY[0];
  }, [currentTrack.id, currentTrack.title]);

  const toggleLike = (trackId: string) => {
    setLikedTrackIds(prev => ({
      ...prev,
      [trackId]: !prev[trackId],
    }));
  };

  const handleShare = () => {
    try {
      navigator.clipboard.writeText(window.location.origin);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !onSeek) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / rect.width));
    const targetSeek = Math.floor(fraction * (currentTrack.duration || 1));
    onSeek(targetSeek);
  };

  const filteredTracks = useMemo(() => {
    return MUSIC_LIBRARY.filter(t => {
      const matchSearch = searchQuery === '' || 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.genre.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (selectedCategory === 'Tudo') return true;
      if (selectedCategory === 'Anos 80') return t.vibe === '80s Classic';
      if (selectedCategory === 'Eletrônica') return t.vibe === 'Electro Pop' || t.vibe === 'Synthwave' || t.vibe === 'Cyberpunk';
      if (selectedCategory === 'Deep House') return t.vibe === 'Deep House';
      if (selectedCategory === 'Lo-Fi') return t.vibe === 'Lo-Fi Chill';
      if (selectedCategory === 'Energia') return t.vibe === 'Cyberpunk' || t.vibe === 'Synthwave';
      if (selectedCategory === 'Relaxar' || selectedCategory === 'Foco') return t.vibe === 'Lo-Fi Chill' || t.vibe === '80s Classic';
      if (selectedCategory === 'Treino') return t.vibe === 'Electro Pop' || t.vibe === 'Cyberpunk';
      return true;
    });
  }, [searchQuery, selectedCategory]);

  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput.trim());
    setChatInput('');
  };

  const handleNextTrack = () => {
    const currentIndex = MUSIC_LIBRARY.findIndex(t => t.id === activeLibraryTrack.id);
    const nextIndex = (currentIndex + 1) % MUSIC_LIBRARY.length;
    onSelectTrack(MUSIC_LIBRARY[nextIndex]);
  };

  const handlePrevTrack = () => {
    const currentIndex = MUSIC_LIBRARY.findIndex(t => t.id === activeLibraryTrack.id);
    const prevIndex = (currentIndex - 1 + MUSIC_LIBRARY.length) % MUSIC_LIBRARY.length;
    onSelectTrack(MUSIC_LIBRARY[prevIndex]);
  };

  const progressPercent = currentTrack.duration > 0 
    ? Math.min(100, (currentSeekMs / currentTrack.duration) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-[#030303] text-[#FFFFFF] font-sans selection:bg-[#FF0000]/30 pb-28 relative">
      {/* Floating Reactions Emojis */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {reactions.map((r) => (
            <motion.div
              key={r.id}
              initial={{ y: '85vh', x: `${r.x}%`, opacity: 0, scale: 0.6 }}
              animate={{ y: '-10vh', opacity: [0, 1, 1, 0], scale: [1, 1.4, 1.1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.8, ease: 'easeOut' }}
              className="absolute text-3xl filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
            >
              {r.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* HEADER ESTILO YOUTUBE MUSIC */}
      <header className="h-16 px-4 md:px-8 border-b border-[#1F1F1F] bg-[#030303]/95 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between gap-4">
        {/* Logo YouTube Music Style */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setSelectedCategory('Tudo')}>
            <div className="w-8 h-8 rounded-full bg-[#FF0000] flex items-center justify-center shadow-md shadow-[#FF0000]/20">
              <Play className="w-4 h-4 text-white fill-white ml-0.5" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold tracking-tight text-white font-sans">Music</span>
              <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.2 bg-[#1F1F1F] text-[#00F2FE] rounded border border-[#2B2B2B]">
                Sync
              </span>
            </div>
          </div>

          {/* Links Navegação Desktop */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#AAAAAA]">
            <button 
              onClick={() => setSelectedCategory('Tudo')}
              className={`hover:text-white transition-colors cursor-pointer ${selectedCategory === 'Tudo' ? 'text-white font-semibold' : ''}`}
            >
              Início
            </button>
            <button 
              onClick={() => setSelectedCategory('Eletrônica')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Explorar
            </button>
            <button 
              onClick={() => setSelectedCategory('Anos 80')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Biblioteca
            </button>
          </nav>
        </div>

        {/* Barra de Pesquisa YouTube Music Centralizada */}
        <div className="flex-1 max-w-xl mx-2">
          <div className="relative">
            <Search className="w-4 h-4 text-[#AAAAAA] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar músicas, álbuns, artistas, podcasts"
              className="w-full bg-[#212121] hover:bg-[#2A2A2A] focus:bg-[#121212] border border-transparent focus:border-[#444444] rounded-full pl-10 pr-9 py-2 text-sm text-white placeholder:text-[#888888] focus:outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-white text-xs p-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Lado Direito: Sessão Sincronizada + Usuário */}
        <div className="flex items-center gap-3">
          {/* Botão de Sessão Ao Vivo / Ouvir Juntos */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#181818] hover:bg-[#252525] border border-[#333333] text-xs font-semibold text-white transition-all cursor-pointer"
            title="Clique para copiar link e convidar amigos para a sala sincronizada"
          >
            <span className="w-2 h-2 rounded-full bg-[#00F2FE] animate-pulse" />
            <Users className="w-3.5 h-3.5 text-[#00F2FE]" />
            <span className="hidden sm:inline">
              {copiedLink ? 'Link Copiado!' : 'Ouvir Juntos'}
            </span>
          </button>

          {/* Toggle Chat / Sessão */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-2 rounded-full border transition-all cursor-pointer relative ${
              isChatOpen 
                ? 'bg-[#FF0000]/20 border-[#FF0000] text-[#FF0000]' 
                : 'bg-[#181818] hover:bg-[#252525] border-[#333333] text-[#AAAAAA] hover:text-white'
            }`}
            title="Chat da Sala & Reações"
          >
            <MessageSquare className="w-4 h-4" />
            {messages.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF0000] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {messages.length}
              </span>
            )}
          </button>

          {/* Usuário / Login */}
          {authUser ? (
            <div className="flex items-center gap-2 pl-1">
              <div 
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF0000] to-[#FF6B6B] text-white flex items-center justify-center text-xs font-bold shadow-md cursor-pointer"
                title={`${authUser.name} (${authUser.email})`}
                onClick={onLogout}
              >
                {authUser.name.charAt(0).toUpperCase()}
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-4 py-1.5 rounded-full bg-white hover:bg-[#E5E5E5] text-black font-semibold text-xs transition-all cursor-pointer shadow-md"
            >
              Fazer Login
            </button>
          )}

          {/* Opção para alternar ao Modo Studio DJ Avançado */}
          {onSwitchToStudio && (
            <button
              onClick={onSwitchToStudio}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#121212] hover:bg-[#1E1E1E] border border-[#2E2E2E] text-[11px] font-mono text-zinc-400 hover:text-cyan-300 transition-colors cursor-pointer"
              title="Abrir Simulador Técnico Lado a Lado"
            >
              <Sliders className="w-3 h-3 text-[#00F2FE]" />
              <span>Studio DJ</span>
            </button>
          )}
        </div>
      </header>

      {/* CATEGORY CHIPS ESTILO YOUTUBE MUSIC */}
      <div className="px-4 md:px-8 py-3 bg-[#030303] sticky top-16 z-30 flex items-center gap-2.5 overflow-x-auto scrollbar-none border-b border-[#141414]">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-[#212121] text-white hover:bg-[#303030]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* CONTEÚDO PRINCIPAL ESTILO YOUTUBE MUSIC */}
      <main className="px-4 md:px-8 py-6 max-w-[1600px] mx-auto space-y-10">

        {/* BANNER DINÂMICO DE REPRODUÇÃO ATUAL (HERO RECOMENDADO) */}
        <section className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#181818] via-[#101010] to-[#0A0A0A] border border-[#222222] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left z-10">
            {/* Capa com Efeito Vinyl */}
            <div className="relative group w-36 h-36 sm:w-44 sm:h-44 flex-shrink-0 rounded-xl overflow-hidden shadow-2xl border border-white/10">
              <img
                src={activeLibraryTrack.coverImage || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80'}
                alt={activeLibraryTrack.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={isPlaying ? () => onPause() : onPlay}
                  className="w-14 h-14 rounded-full bg-[#FF0000] text-white flex items-center justify-center shadow-2xl transform active:scale-95 cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-white" />
                  ) : (
                    <Play className="w-6 h-6 fill-white ml-1" />
                  )}
                </button>
              </div>
              {isPlaying && (
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/80 backdrop-blur-md rounded-full text-[10px] font-mono font-bold text-[#00F2FE] border border-[#00F2FE]/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FE] animate-ping" />
                  <span>TOCANDO</span>
                </div>
              )}
            </div>

            {/* Informações da Faixa em Destaque */}
            <div className="space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-[#AAAAAA] uppercase tracking-wider">
                <Disc className="w-3.5 h-3.5 text-[#FF0000]" />
                <span>Tocando Agora na Sala Sincronizada</span>
                {activeLibraryTrack.badge && (
                  <span className="px-2 py-0.5 rounded-full bg-[#FF0000]/15 text-[#FF4D4D] text-[10px] font-bold border border-[#FF0000]/30">
                    {activeLibraryTrack.badge}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {activeLibraryTrack.title}
              </h1>
              <p className="text-sm sm:text-base text-[#AAAAAA] font-medium">
                {activeLibraryTrack.artist} • <span className="text-[#888888]">{activeLibraryTrack.album || 'Single'}</span> • <span className="text-[#888888]">{activeLibraryTrack.genre}</span>
              </p>
              <p className="text-xs text-zinc-400 line-clamp-2 max-w-xl pt-1">
                {activeLibraryTrack.description}
              </p>

              {/* Botões de Ação Rápida */}
              <div className="flex items-center justify-center sm:justify-start gap-3 pt-3">
                <button
                  onClick={isPlaying ? () => onPause() : onPlay}
                  className="px-6 py-2.5 rounded-full bg-white hover:bg-[#E5E5E5] text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-black" />
                      <span>Pausar</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-black" />
                      <span>Reproduzir</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => toggleLike(activeLibraryTrack.id)}
                  className={`p-2.5 rounded-full border transition-colors cursor-pointer ${
                    likedTrackIds[activeLibraryTrack.id]
                      ? 'bg-[#FF0000]/20 border-[#FF0000] text-[#FF0000]'
                      : 'bg-[#222222] hover:bg-[#333333] border-[#333333] text-white'
                  }`}
                  title="Curtir música"
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>

                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-full bg-[#222222] hover:bg-[#333333] border border-[#333333] text-white transition-colors cursor-pointer"
                  title="Compartilhar com amigos"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Painel Lateral do Hero: Reações Rápidas e Latência Zero */}
          <div className="w-full md:w-64 bg-[#141414] border border-[#262626] rounded-xl p-4 flex flex-col justify-between gap-4 z-10">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-white mb-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Sessão Ao Vivo</span>
                </span>
                <span className="text-[10px] font-mono text-[#00F2FE]">
                  {latency}ms ping
                </span>
              </div>
              <p className="text-[11px] text-[#AAAAAA] leading-relaxed">
                Áudio sintetizado e sincronizado em tempo real entre todos os ouvintes conectados.
              </p>
            </div>

            {/* Disparador de Reações */}
            <div>
              <div className="text-[10px] font-bold text-[#888888] uppercase tracking-wider mb-2">
                Reações em Tempo Real
              </div>
              <div className="flex items-center justify-between gap-1.5">
                {['🔥', '❤️', '⚡', '👏', '🎶'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => onReaction(emoji)}
                    className="w-9 h-9 rounded-lg bg-[#222222] hover:bg-[#303030] hover:scale-110 active:scale-95 text-base flex items-center justify-center transition-all cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO 1: OUVIR NOVAMENTE / ESCOLHAS RÁPIDAS (QUICK PICKS) */}
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs font-semibold text-[#AAAAAA] uppercase tracking-wider">
                Iniciar rádio a partir de uma faixa
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Escolhas rápidas
              </h2>
            </div>
            <button 
              onClick={() => setSelectedCategory('Tudo')}
              className="text-xs font-bold text-[#AAAAAA] hover:text-white px-3 py-1 rounded-full border border-[#333333] hover:border-white transition-colors cursor-pointer"
            >
              Ver tudo
            </button>
          </div>

          {/* Grid de Faixas estilo YouTube Music */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {filteredTracks.slice(0, 8).map((track) => {
              const isSelected = activeLibraryTrack.id === track.id;
              const isLiked = likedTrackIds[track.id];

              return (
                <div
                  key={track.id}
                  className={`group bg-[#121212] hover:bg-[#1C1C1C] rounded-xl p-3 border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                    isSelected 
                      ? 'border-[#00F2FE]/50 shadow-lg shadow-[#00F2FE]/10' 
                      : 'border-[#1F1F1F] hover:border-[#333333]'
                  }`}
                  onClick={() => onSelectTrack(track)}
                >
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-3 bg-[#1A1A1A]">
                    <img
                      src={track.coverImage || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80'}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Botão de Play circular YouTube Music que surge no Hover */}
                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isSelected) {
                            isPlaying ? onPause() : onPlay();
                          } else {
                            onSelectTrack(track);
                          }
                        }}
                        className="w-12 h-12 rounded-full bg-[#FF0000] text-white flex items-center justify-center shadow-xl transform group-hover:scale-110 active:scale-95 transition-all cursor-pointer"
                      >
                        {isSelected && isPlaying ? (
                          <Pause className="w-5 h-5 fill-white" />
                        ) : (
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        )}
                      </button>
                    </div>

                    {/* Badge ou Duração */}
                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-[10px] font-mono text-zinc-300">
                      {formatTime(track.duration)}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h4 className="font-semibold text-sm text-white line-clamp-1 group-hover:text-white transition-colors">
                        {track.title}
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(track.id);
                        }}
                        className={`text-xs p-1 cursor-pointer transition-colors ${isLiked ? 'text-[#FF0000]' : 'text-[#666666] hover:text-white'}`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#FF0000]' : ''}`} />
                      </button>
                    </div>
                    <p className="text-xs text-[#AAAAAA] line-clamp-1">
                      {track.artist}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-[#777777] mt-2 pt-2 border-t border-[#1F1F1F]">
                      <span>{track.genre}</span>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-[#00F2FE]">TOCANDO</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SEÇÃO 2: MIXES & ESTAÇÕES RECOMENDADAS */}
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs font-semibold text-[#AAAAAA] uppercase tracking-wider">
                Continuar ouvindo
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Mixes recomendados para você
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Supermix dos Anos 80',
                subtitle: 'Billy Idol, Eurythmics e clássicos de sintetizador',
                track: MUSIC_LIBRARY[0],
                cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
              },
              {
                title: 'Mix Indie & Synthwave',
                subtitle: 'M83, The Weeknd e batidas retro-futuristas',
                track: MUSIC_LIBRARY[2],
                cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80',
              },
              {
                title: 'Lo-Fi Chuva & Madrugada',
                subtitle: 'Piano elétrico, vinil e foco para programar',
                track: MUSIC_LIBRARY[4],
                cover: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&auto=format&fit=crop&q=80',
              },
              {
                title: 'Club Electro & Cyber House',
                subtitle: 'Sub-bass marcante, pistas de dança e energia pura',
                track: MUSIC_LIBRARY[5],
                cover: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80',
              },
            ].map((mix, idx) => (
              <div
                key={idx}
                onClick={() => onSelectTrack(mix.track)}
                className="group p-4 bg-[#121212] hover:bg-[#1C1C1C] rounded-2xl border border-[#1F1F1F] hover:border-[#333333] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-[#1A1A1A]">
                  <img
                    src={mix.cover}
                    alt={mix.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
                    <Radio className="w-3 h-3 text-[#FF0000]" />
                    <span>Estação de Rádio</span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <div className="w-12 h-12 rounded-full bg-[#FF0000] text-white flex items-center justify-center shadow-2xl">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-white group-hover:text-white transition-colors">
                    {mix.title}
                  </h4>
                  <p className="text-xs text-[#AAAAAA] mt-1 line-clamp-2 leading-relaxed">
                    {mix.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SEÇÃO 3: TABELA DE FAIXAS EM ALTA ESTILO YOUTUBE MUSIC */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Músicas em alta na sala
            </h2>
            <span className="text-xs font-mono text-[#AAAAAA]">
              {MUSIC_LIBRARY.length} faixas disponíveis
            </span>
          </div>

          <div className="bg-[#0D0D0D] border border-[#1F1F1F] rounded-2xl overflow-hidden">
            <div className="divide-y divide-[#181818]">
              {MUSIC_LIBRARY.map((track, i) => {
                const isSelected = activeLibraryTrack.id === track.id;
                const isLiked = likedTrackIds[track.id];

                return (
                  <div
                    key={track.id}
                    onClick={() => onSelectTrack(track)}
                    className={`px-4 py-3 flex items-center justify-between gap-4 transition-colors cursor-pointer group ${
                      isSelected ? 'bg-[#181818]' : 'hover:bg-[#141414]'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Posição / Indicador de Play */}
                      <div className="w-6 text-center text-xs font-mono text-[#777777] group-hover:hidden">
                        {isSelected && isPlaying ? (
                          <span className="w-2 h-2 rounded-full bg-[#FF0000] animate-ping inline-block" />
                        ) : (
                          `${i + 1}`
                        )}
                      </div>
                      <div className="w-6 hidden group-hover:flex items-center justify-center text-white">
                        <Play className="w-3.5 h-3.5 fill-white" />
                      </div>

                      {/* Capa */}
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-[#222222] flex-shrink-0">
                        <img
                          src={track.coverImage || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80'}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Título & Artista */}
                      <div className="min-w-0">
                        <div className={`font-semibold text-sm truncate ${isSelected ? 'text-[#00F2FE]' : 'text-white'}`}>
                          {track.title}
                        </div>
                        <div className="text-xs text-[#AAAAAA] truncate">
                          {track.artist}
                        </div>
                      </div>
                    </div>

                    {/* Álbum (Desktop) */}
                    <div className="hidden md:block text-xs text-[#888888] truncate max-w-xs">
                      {track.album || track.genre}
                    </div>

                    {/* Ações e Duração */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(track.id);
                        }}
                        className={`p-1.5 transition-colors cursor-pointer ${
                          isLiked ? 'text-[#FF0000]' : 'text-[#666666] hover:text-white'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#FF0000]' : ''}`} />
                      </button>

                      <span className="text-xs font-mono text-[#888888] w-12 text-right">
                        {formatTime(track.duration)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* CHAT & PAINEL DA SALA (SLIDE-OVER / DRAWER FLUTUANTE) */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.aside
            initial={{ opacity: 0, x: 340 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 340 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-16 right-0 bottom-24 w-80 sm:w-96 bg-[#121212] border-l border-[#262626] shadow-2xl z-40 flex flex-col"
          >
            {/* Header do Chat */}
            <div className="p-4 border-b border-[#222222] flex items-center justify-between bg-[#161616]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#FF0000]" />
                <h3 className="font-bold text-sm text-white">Chat da Sala Sincronizada</h3>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-zinc-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            {/* Ajuste de Latência / Chaos Slider Discreto */}
            <div className="p-3 bg-[#0D0D0D] border-b border-[#222222] text-xs">
              <div className="flex items-center justify-between text-[#AAAAAA] mb-1">
                <span>Latência de Rede:</span>
                <span className="font-mono text-[#00F2FE] font-bold">{latency}ms</span>
              </div>
              <input
                type="range"
                min="0"
                max="600"
                step="10"
                value={latency}
                onChange={(e) => onLatencyChange(parseInt(e.target.value))}
                className="w-full h-1 bg-[#262626] rounded appearance-none cursor-pointer accent-[#FF0000]"
              />
            </div>

            {/* Lista de Mensagens */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs">
              {messages.length === 0 ? (
                <div className="text-center text-zinc-500 py-10">
                  Nenhuma mensagem ainda. Seja o primeiro a falar na sala!
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className="p-2.5 rounded-lg bg-[#1A1A1A] border border-[#262626]">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-[#00F2FE]">{m.user}</span>
                      <span className="text-[#666666] font-mono">
                        {new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-zinc-200 leading-relaxed">{m.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Input de Envio */}
            <form onSubmit={handleSendChatMessage} className="p-3 border-t border-[#222222] bg-[#161616] flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Enviar mensagem para a sala..."
                className="flex-1 bg-[#222222] border border-[#333333] rounded-full px-3 py-1.5 text-xs text-white placeholder:text-[#777777] focus:outline-none focus:border-[#FF0000]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-full bg-[#FF0000] hover:bg-[#E60000] text-white text-xs font-bold transition-all cursor-pointer"
              >
                Enviar
              </button>
            </form>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* YOUTUBE MUSIC BOTTOM PLAYER BAR (PERSISTENTE) */}
      <footer className="fixed bottom-0 left-0 right-0 h-[72px] bg-[#212121] border-t border-[#333333] z-50 flex flex-col justify-between select-none shadow-[0_-5px_25px_rgba(0,0,0,0.8)]">
        {/* Barra de Progresso Vermelha YouTube Music */}
        <div
          ref={progressBarRef}
          onClick={handleProgressBarClick}
          className="w-full h-1 bg-[#3A3A3A] hover:h-2 cursor-pointer transition-all relative group"
        >
          <div
            className="h-full bg-[#FF0000] relative"
            style={{ width: `${progressPercent}%` }}
          >
            {/* Ponto indicador de arraste */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#FF0000] opacity-0 group-hover:opacity-100 transition-opacity shadow-md" />
          </div>
        </div>

        {/* Controles Principais */}
        <div className="flex-1 px-4 sm:px-6 flex items-center justify-between gap-4">
          
          {/* LADO ESQUERDO: Miniatura + Título + Artista + Likes */}
          <div className="flex items-center gap-3 w-1/4 min-w-[180px] max-w-[320px]">
            <div className="w-11 h-11 rounded-md overflow-hidden bg-[#333333] flex-shrink-0 shadow-md">
              <img
                src={activeLibraryTrack.coverImage || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80'}
                alt={activeLibraryTrack.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-semibold text-white truncate hover:underline cursor-pointer">
                {activeLibraryTrack.title}
              </div>
              <div className="text-[11px] text-[#AAAAAA] truncate hover:underline cursor-pointer">
                {activeLibraryTrack.artist}
              </div>
            </div>
            <button
              onClick={() => toggleLike(activeLibraryTrack.id)}
              className={`p-1.5 ml-1 transition-colors cursor-pointer hidden sm:block ${
                likedTrackIds[activeLibraryTrack.id] ? 'text-[#FF0000]' : 'text-[#AAAAAA] hover:text-white'
              }`}
              title="Gostei"
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
          </div>

          {/* CENTRO: Controles de Reprodução YouTube Music */}
          <div className="flex flex-col items-center justify-center gap-1">
            <div className="flex items-center gap-3 sm:gap-5">
              <button
                onClick={() => setIsShuffle(!isShuffle)}
                className={`p-1.5 transition-colors cursor-pointer ${
                  isShuffle ? 'text-[#FF0000]' : 'text-[#AAAAAA] hover:text-white'
                }`}
                title="Aleatório"
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={handlePrevTrack}
                className="text-[#AAAAAA] hover:text-white p-1.5 transition-colors cursor-pointer"
                title="Faixa Anterior"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              {/* Botão de Play / Pause Grande Circular */}
              <button
                onClick={isPlaying ? () => onPause() : onPlay}
                className="w-10 h-10 rounded-full bg-white hover:scale-105 active:scale-95 text-black flex items-center justify-center shadow-lg transition-transform cursor-pointer"
                title={isPlaying ? 'Pausar' : 'Reproduzir'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-black" />
                ) : (
                  <Play className="w-5 h-5 fill-black ml-0.5" />
                )}
              </button>

              <button
                onClick={handleNextTrack}
                className="text-[#AAAAAA] hover:text-white p-1.5 transition-colors cursor-pointer"
                title="Próxima Faixa"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={() => setIsRepeat(!isRepeat)}
                className={`p-1.5 transition-colors cursor-pointer ${
                  isRepeat ? 'text-[#FF0000]' : 'text-[#AAAAAA] hover:text-white'
                }`}
                title="Repetir"
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* LADO DIREITO: Volume + Duração + Chat */}
          <div className="flex items-center justify-end gap-3 w-1/4 min-w-[160px]">
            {/* Contador de Tempo */}
            <div className="text-[11px] font-mono text-[#AAAAAA] hidden sm:block whitespace-nowrap">
              <span>{formatTime(currentSeekMs)}</span>
              <span className="mx-1">/</span>
              <span>{formatTime(activeLibraryTrack.duration)}</span>
            </div>

            {/* Controle de Volume */}
            <div className="flex items-center gap-1.5 group">
              <button
                onClick={onToggleMute}
                className="text-[#AAAAAA] hover:text-white p-1 transition-colors cursor-pointer"
                title={isAudioMuted ? 'Desmutar' : 'Mutar'}
              >
                {isAudioMuted || audioVolume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isAudioMuted ? 0 : audioVolume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-16 sm:w-20 h-1 bg-[#3A3A3A] rounded appearance-none cursor-pointer accent-white"
              />
            </div>

            {/* Botão de Abrir Chat na Barra Inferior */}
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isChatOpen ? 'text-[#FF0000]' : 'text-[#AAAAAA] hover:text-white'
              }`}
              title="Abrir Chat da Sala"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>

        </div>
      </footer>
    </div>
  );
};
