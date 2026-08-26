import React, { useState, useMemo } from 'react';
import { 
  Music, Play, Pause, Disc, Sparkles, Filter, Search, Clock, 
  Flame, Radio, Heart, Check, Volume2, Info, ArrowRight, Zap, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LibraryTrack, MUSIC_LIBRARY } from '../data/musicLibrary';

interface MusicLibraryProps {
  currentTrackId: string;
  isPlaying: boolean;
  onSelectTrack: (track: LibraryTrack) => void;
  onTogglePlayPause?: () => void;
  userRole?: 'host' | 'listener';
  isCompact?: boolean;
}

export const MusicLibraryModalOrSection: React.FC<MusicLibraryProps> = ({
  currentTrackId,
  isPlaying,
  onSelectTrack,
  onTogglePlayPause,
  userRole = 'host',
  isCompact = false
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewTrackId, setPreviewTrackId] = useState<string | null>(null);

  const genres = ['ALL', '80s Classic', 'Synthwave', 'Electro Pop', 'Deep House', 'Lo-Fi Chill', 'Cyberpunk', 'Podcast'];

  const filteredTracks = useMemo(() => {
    return MUSIC_LIBRARY.filter(track => {
      const matchGenre = selectedGenre === 'ALL' || track.vibe === selectedGenre;
      const q = searchQuery.toLowerCase();
      const matchSearch = 
        track.title.toLowerCase().includes(q) || 
        track.artist.toLowerCase().includes(q) || 
        track.genre.toLowerCase().includes(q) ||
        (track.album && track.album.toLowerCase().includes(q));
      return matchGenre && matchSearch;
    });
  }, [selectedGenre, searchQuery]);

  const formatDuration = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#070D1E] border border-cyan-900/60 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col h-full">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#00F2FE]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#0072FF]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-cyan-900/50 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#00F2FE]/10 border border-[#00F2FE]/30 text-[#00F2FE]">
              <Disc className="w-5 h-5 animate-spin [animation-duration:8s]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>BIBLIOTECA DE FAIXAS</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-700/60 text-[#00F2FE]">
                  {MUSIC_LIBRARY.length} FAIXAS
                </span>
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                {userRole === 'host' 
                  ? 'Escolha a música para transmitir instantaneamente para todos os nós' 
                  : 'Selecione e escute as faixas do catálogo ou sugira para o DJ'}
              </p>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-cyan-500/70 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por faixa, artista ou gênero..."
            className="w-full bg-[#050A15] border border-cyan-900/80 focus:border-[#00F2FE] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Genre Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-3 no-scrollbar border-b border-cyan-950 relative z-10">
        {genres.map((g) => {
          const isActive = selectedGenre === g;
          return (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-gradient-to-r from-[#00F2FE] to-[#0072FF] text-black shadow-md shadow-[#00F2FE]/20'
                  : 'bg-[#091224] text-zinc-400 hover:text-white hover:bg-[#0E1A36] border border-cyan-900/40'
              }`}
            >
              {g === '80s Classic' && <Flame className="w-3 h-3" />}
              {g}
            </button>
          );
        })}
      </div>

      {/* Tracks Grid / List */}
      <div className="flex-1 overflow-y-auto py-4 space-y-2.5 pr-1 relative z-10 min-h-[300px] max-h-[520px]">
        {filteredTracks.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-xs font-mono">
            Nenhuma faixa encontrada para "{searchQuery}".
          </div>
        ) : (
          filteredTracks.map((track) => {
            const isCurrentlyLoaded = currentTrackId === track.id;
            const isCurrentlyPlayingThis = isCurrentlyLoaded && isPlaying;

            return (
              <motion.div
                key={track.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`group relative rounded-xl border transition-all p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer ${
                  isCurrentlyLoaded
                    ? 'bg-gradient-to-r from-[#091B3A] to-[#0D2652] border-[#00F2FE]/60 shadow-lg shadow-[#00F2FE]/10 ring-1 ring-[#00F2FE]/40'
                    : 'bg-[#0A1226]/80 hover:bg-[#0E1B38] border-cyan-900/50 hover:border-cyan-700/60'
                }`}
                onClick={() => onSelectTrack(track)}
              >
                {/* Track Left Info: Artwork / Play / Title */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Artwork Thumbnail */}
                  <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${track.coverGradient} border border-cyan-500/30 flex-shrink-0 flex items-center justify-center shadow-md overflow-hidden`}>
                    <Music className="w-5 h-5 text-white/80 group-hover:scale-110 transition-transform" />
                    
                    {/* Play/Pause Overlay */}
                    <div className={`absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center transition-opacity ${
                      isCurrentlyLoaded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      {isCurrentlyPlayingThis ? (
                        <div className="flex items-end gap-0.5 h-4">
                          <span className="w-1 bg-[#00F2FE] rounded-full animate-bounce [animation-delay:0ms] h-4" />
                          <span className="w-1 bg-[#00F2FE] rounded-full animate-bounce [animation-delay:150ms] h-3" />
                          <span className="w-1 bg-[#00F2FE] rounded-full animate-bounce [animation-delay:300ms] h-4" />
                        </div>
                      ) : (
                        <Play className="w-5 h-5 text-[#00F2FE] fill-[#00F2FE] ml-0.5" />
                      )}
                    </div>
                  </div>

                  {/* Title & Artist & Badge */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-black tracking-tight truncate ${
                        isCurrentlyLoaded ? 'text-[#00F2FE]' : 'text-white group-hover:text-cyan-200'
                      }`}>
                        {track.title}
                      </span>
                      {track.badge && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#00F2FE]/15 text-[#00F2FE] border border-[#00F2FE]/30">
                          {track.badge}
                        </span>
                      )}
                      {isCurrentlyLoaded && (
                        <span className="flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          NO AR
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono mt-0.5 truncate">
                      <span className="text-cyan-300/90 font-medium">{track.artist}</span>
                      {track.year && <span>• {track.year}</span>}
                      {track.bpm && <span className="hidden sm:inline">• {track.bpm} BPM</span>}
                      {track.key && <span className="hidden md:inline">• {track.key}</span>}
                    </div>

                    <p className="text-[11px] text-zinc-400/80 line-clamp-1 mt-1 hidden sm:block">
                      {track.description}
                    </p>
                  </div>
                </div>

                {/* Track Right Meta & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-cyan-950/60">
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                    <span className="px-2 py-0.5 rounded bg-[#050A15] border border-cyan-900/60 text-[10px] text-cyan-300">
                      {track.vibe}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      {formatDuration(track.duration)}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTrack(track);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                      isCurrentlyLoaded
                        ? 'bg-[#00F2FE] text-black shadow-md shadow-[#00F2FE]/30'
                        : 'bg-[#0E1E3D] hover:bg-[#00F2FE] text-cyan-200 hover:text-black border border-cyan-700/60'
                    }`}
                  >
                    {isCurrentlyLoaded ? (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{isPlaying ? 'TOCANDO' : 'CARREGADA'}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current" />
                        <span>{userRole === 'host' ? 'CARREGAR NO DECK' : 'ESCUTAR FAIXA'}</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Footer Info Banner */}
      <div className="pt-3 border-t border-cyan-900/40 text-[11px] font-mono text-zinc-400 flex flex-col sm:flex-row items-center justify-between gap-2 relative z-10 bg-[#050A15]/60 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 p-4">
        <div className="flex items-center gap-2 text-[#00F2FE]">
          <Sparkles className="w-4 h-4 text-[#00F2FE]" />
          <span>Sintetizador Web Audio API com latência zero ativo para todas as faixas da biblioteca.</span>
        </div>
        <div className="text-zinc-500">
          Sync Beats Audio Engine v2.4
        </div>
      </div>
    </div>
  );
};
