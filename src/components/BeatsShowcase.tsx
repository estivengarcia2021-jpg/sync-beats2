import React, { useState, useMemo } from 'react';
import { 
  Flame, Disc, Play, Pause, Sparkles, Shield, Award, Music, 
  ArrowRight, Sliders, Volume2, CheckCircle2, Lock, Radio, Layers, 
  Zap, Info, Clock, Share2, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { albumTrapeton2026, ALBUM_METADATA, TrapetonTrack } from '../data/albumTrapeton';
import { audioEngine } from '../services/AudioEngine';

interface BeatsShowcaseProps {
  currentTrackId?: string;
  isPlaying?: boolean;
  onLoadToDeck?: (track: TrapetonTrack) => void;
  onOpenStudio?: () => void;
}

export const BeatsShowcase: React.FC<BeatsShowcaseProps> = ({
  currentTrackId,
  isPlaying = false,
  onLoadToDeck,
  onOpenStudio
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activePreviewTrack, setActivePreviewTrack] = useState<TrapetonTrack | null>(albumTrapeton2026[0]);
  const [isLocalPlaying, setIsLocalPlaying] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const categories = ['ALL', 'Trapeton', 'Club Banger', 'Dark Rap', 'Melodic'];

  const filteredTracks = useMemo(() => {
    if (selectedCategory === 'ALL') return albumTrapeton2026;
    return albumTrapeton2026.filter(t => t.category === selectedCategory);
  }, [selectedCategory]);

  const handleTestAudio = (track: TrapetonTrack) => {
    if (activePreviewTrack?.id === track.id && isLocalPlaying) {
      audioEngine.stop();
      setIsLocalPlaying(false);
    } else {
      setActivePreviewTrack(track);
      setIsLocalPlaying(true);
      audioEngine.playTrack(track.id, track.title, track.audioStyle);
    }
  };

  const handleLoadTrack = (track: TrapetonTrack) => {
    setActivePreviewTrack(track);
    if (onLoadToDeck) {
      onLoadToDeck(track);
    }
  };

  const handleCopyShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="w-full space-y-8">
      {/* HERO BANNER DO ÁLBUM */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0B1528] via-[#091022] to-[#040711] border border-cyan-500/30 p-6 sm:p-10 shadow-2xl shadow-cyan-950/40">
        {/* Background Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#00F2FE]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 w-64 h-64 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          {/* Cover Art Box */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative group w-44 h-44 sm:w-52 sm:h-52 rounded-2xl bg-gradient-to-br from-amber-600 via-red-900 to-black border-2 border-[#00F2FE]/40 p-4 shadow-2xl shadow-red-900/30 flex flex-col justify-between overflow-hidden flex-shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[#00F2FE] border border-cyan-500/40">
                  VOL. 1
                </span>
                <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40">
                  2026 MASTER
                </span>
              </div>

              {/* Central Vinyl Icon */}
              <div className="self-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-black/60 border border-cyan-400/50 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <Disc className={`w-10 h-10 text-[#00F2FE] ${isLocalPlaying ? 'animate-spin [animation-duration:3s]' : ''}`} />
                </div>
                <div className="text-[10px] font-mono font-black text-white tracking-widest uppercase mt-2">
                  TRAPETON
                </div>
              </div>

              <div className="flex items-center justify-between text-[9px] font-mono text-zinc-300">
                <span>DJSyncbeats</span>
                <span>4 FAIXAS</span>
              </div>
            </div>

            {/* Title & Credits */}
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1">
                  <Flame className="w-3 h-3 text-red-400" />
                  NOVO ÁLBUM OFICIAL
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-[#00F2FE] border border-cyan-700/60 text-[10px] font-mono font-bold uppercase tracking-wider">
                  DISCOGRAFIA 2026
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  DIREITOS RESERVADOS
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
                {ALBUM_METADATA.title}
              </h1>
              <p className="text-sm font-mono text-[#00F2FE] font-bold">
                {ALBUM_METADATA.subtitle} • PROD. BY DJSYNCBEATS
              </p>
              
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed pt-1">
                A fusão definitiva entre o peso, agressividade e graves 808 do <strong className="text-white">Rap Americano</strong> com a ginga, swing e calor do <strong className="text-[#00F2FE]">Reggaeton Latino (Dembow)</strong>. Quatro produções exclusivas afinadas para pistas globais.
              </p>

              {/* Author & Rights Badge Box */}
              <div className="pt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#040813] border border-cyan-800/60 text-xs font-mono text-zinc-300">
                  <Award className="w-4 h-4 text-[#00F2FE]" />
                  <span>Autoria & Produção Musical: <strong className="text-white">DJSyncbeats (Estiven Garcia)</strong></span>
                  <span className="text-zinc-500">|</span>
                  <span className="text-emerald-400 text-[11px]">© 2026 Todos os direitos reservados</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Action Box: Quick Play & Studio Deck Link */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto">
            {activePreviewTrack && (
              <button
                onClick={() => handleTestAudio(activePreviewTrack)}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#0072FF] hover:brightness-110 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#00F2FE]/25"
              >
                {isLocalPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-black" />
                    <span>PAUSAR TESTE: {activePreviewTrack.title.slice(0, 14)}...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-black ml-0.5" />
                    <span>TESTAR ÁUDIO ({activePreviewTrack.bpm} BPM)</span>
                  </>
                )}
              </button>
            )}

            {onOpenStudio && (
              <button
                onClick={onOpenStudio}
                className="px-6 py-3 rounded-xl bg-[#081226] hover:bg-[#0D1D3D] text-cyan-300 hover:text-white border border-cyan-700/60 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sliders className="w-4 h-4 text-[#00F2FE]" />
                <span>ABRIR NO STUDIO DJ DECK</span>
              </button>
            )}

            <button
              onClick={handleCopyShare}
              className="px-4 py-2 rounded-xl bg-[#050B17] hover:bg-[#091326] text-zinc-400 hover:text-white border border-cyan-900/60 font-mono text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Link Copiado!' : 'Compartilhar Álbum'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* REPRODUTOR / PAINEL DA PÁGINA /BEATS */}
      <div className="bg-[#070D1E] border border-cyan-900/60 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-cyan-900/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#00F2FE] uppercase tracking-wider flex items-center gap-1.5">
                <Music className="w-4 h-4 text-[#00F2FE]" />
                PÁGINA /BEATS: CATÁLOGO INTERATIVO DO ÁLBUM
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-1">
              Faixas Oficiais • Parâmetros de Produção & Chaves (Keys)
            </h2>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Filtre por estilo e teste cada faixa em tempo real com reprodução de sintetizador Web Audio API e sub-808s.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#00F2FE] to-[#0072FF] text-black shadow-md shadow-[#00F2FE]/20'
                      : 'bg-[#0A1226] text-zinc-400 hover:text-white hover:bg-[#0E1A36] border border-cyan-900/50'
                  }`}
                >
                  {cat === 'Trapeton' && <Flame className="w-3 h-3 text-red-400" />}
                  <span>{cat === 'ALL' ? 'Todas as Categorias' : cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Track Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTracks.map((track, idx) => {
            const isThisPlaying = isLocalPlaying && activePreviewTrack?.id === track.id;
            const isLoadedInMaster = currentTrackId === track.id;

            return (
              <div
                key={track.id}
                className={`rounded-2xl border p-5 transition-all flex flex-col justify-between group ${
                  isThisPlaying
                    ? 'bg-gradient-to-br from-[#091B3A] to-[#0E2752] border-[#00F2FE] shadow-lg shadow-[#00F2FE]/15'
                    : 'bg-[#0A1226]/90 hover:bg-[#0E1A36] border-cyan-900/60 hover:border-cyan-600/60'
                }`}
              >
                <div>
                  {/* Card Top: Number, Tag, Category */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-black/60 border border-cyan-800 text-[#00F2FE] text-xs font-mono font-black flex items-center justify-center">
                        0{idx + 1}
                      </span>
                      <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-[#00F2FE]/15 text-[#00F2FE] border border-[#00F2FE]/30">
                        {track.tag}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-black/50 text-zinc-400 border border-cyan-900/40">
                      {track.category}
                    </span>
                  </div>

                  {/* Title & Artist */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-[#00F2FE] transition-colors">
                        {track.title}
                      </h3>
                      <div className="text-xs font-mono text-cyan-300/80 mt-0.5 flex items-center gap-2">
                        <span>Artista: <strong>{track.artist}</strong></span>
                        <span>•</span>
                        <span className="text-zinc-400">{track.genre}</span>
                      </div>
                    </div>

                    {/* Mini Waveform Visualizer when Playing */}
                    {isThisPlaying && (
                      <div className="flex items-end gap-1 h-5 flex-shrink-0">
                        {[40, 90, 60, 100, 75, 45].map((h, i) => (
                          <motion.span
                            key={i}
                            animate={{ height: ['20%', `${h}%`, '30%'] }}
                            transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.08 }}
                            className="w-1 bg-[#00F2FE] rounded-full"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Description & Vibe */}
                  <p className="text-xs text-zinc-300 mt-2.5 leading-relaxed bg-[#060B18]/70 p-2.5 rounded-xl border border-cyan-950">
                    <strong className="text-cyan-300 font-mono text-[11px] block mb-0.5">VIBE & PRODUÇÃO:</strong>
                    {track.description}
                  </p>
                </div>

                {/* Card Bottom: Metadata Badges (BPM, Key, Duration) & Action Buttons */}
                <div className="mt-4 pt-3 border-t border-cyan-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Metadata: BPM & Key */}
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-300 flex-wrap">
                    <span className="px-2 py-1 rounded bg-[#040814] border border-cyan-900/70 text-[#00F2FE] font-bold">
                      ⚡ {track.bpm} BPM
                    </span>
                    <span className="px-2 py-1 rounded bg-[#040814] border border-cyan-900/70 text-amber-300 font-bold">
                      🎹 {track.key}
                    </span>
                    <span className="px-2 py-1 rounded bg-[#040814] border border-cyan-900/70 text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      {track.duration}
                    </span>
                  </div>

                  {/* Buttons: Test Audio / Load Deck */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTestAudio(track)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                        isThisPlaying
                          ? 'bg-[#00F2FE] text-black shadow-md shadow-[#00F2FE]/25'
                          : 'bg-[#07132B] hover:bg-[#00F2FE] text-cyan-200 hover:text-black border border-cyan-700/60'
                      }`}
                    >
                      {isThisPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-black" />
                          <span>Pausar</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          <span>Testar Beat</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleLoadTrack(track)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-[#00F2FE] border border-cyan-700/60 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                      title="Carregar faixa no Deck Mestre de DJ"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>{isLoadedInMaster ? 'No Deck DJ' : 'Carregar no Deck'}</span>
                    </button>
                  </div>
                </div>

                {/* Track Legal Line */}
                <div className="text-[10px] font-mono text-zinc-500 mt-2 flex items-center justify-between">
                  <span>{track.copyright}</span>
                  <span className="text-emerald-400/80">{track.rightsReserved}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Informações de Produção & Referências de Mercado */}
        <div className="bg-[#050A17] border border-cyan-900/50 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00F2FE]" />
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              ESTRUTURA DE SUCESSO: O DNA DO TRAPETON (RAP AMERICANO + REGGAETON)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#070E20] border border-cyan-950">
              <div className="font-bold text-white uppercase font-mono text-[11px] mb-1 text-red-400">
                🎤 Kendrick Lamar (Not Like Us / TV Off)
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Bumbos marcantes, groove rápido, hi-hats acelerados e presença vocal afiada.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#070E20] border border-cyan-950">
              <div className="font-bold text-white uppercase font-mono text-[11px] mb-1 text-amber-400">
                🔥 Travis Scott (FE!N)
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Produção minimalista, sintetizadores obscuros distorcidos e sub-808s viscerais.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#070E20] border border-cyan-950">
              <div className="font-bold text-white uppercase font-mono text-[11px] mb-1 text-[#00F2FE]">
                🌴 Bad Bunny & Feid (Perro Negro)
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                A batida clássica de reggaeton (dembow) com synths modernos e graves potentes.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#070E20] border border-cyan-950">
              <div className="font-bold text-white uppercase font-mono text-[11px] mb-1 text-fuchsia-400">
                ✨ Karol G & Young Miko (Classy 101)
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Linha de baixo contínua, elementos de plucks brilhantes e transição suave.
              </p>
            </div>
          </div>

          {/* Legal Notice & Autoria Full Box */}
          <div className="p-4 rounded-xl bg-[#03060E] border border-cyan-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex-shrink-0 mt-0.5">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-white uppercase">
                  CERTIFICADO DE AUTORIA & REGISTRO DE DIREITOS AUTORAIS
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                  Todas as 4 faixas do álbum <strong className="text-white">DJSyncbeats Vol. 1 (TRAPETON MASTER VOL. 1)</strong> são de autoria exclusiva de <strong className="text-[#00F2FE]">DJSyncbeats (Estiven Garcia)</strong>. Todos os direitos patrimoniais, autorais e fonográficos reservados internacionalmente.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 uppercase">
                TODOS OS DIREITOS RESERVADOS
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
