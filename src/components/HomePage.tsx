import React, { useState, useEffect } from 'react';
import { 
  Radio, Zap, Shield, Users, ArrowRight, Music, Sparkles, CheckCircle2, 
  MessageSquare, Heart, Flame, Globe, Lock, Play, Share2, Layers, Rocket, 
  Target, Award, Star, Volume2, Headphones, Check, Smartphone, Plus, HelpCircle,
  Mail, LogIn, LogOut, User, Disc, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SyncBeatsLogo } from './SyncBeatsLogo';
import { UserProfile } from '../types';
import { MUSIC_LIBRARY } from '../data/musicLibrary';

interface HomePageProps {
  onOpenStudio: () => void;
  onOpenLogin: (defaultRole?: 'host' | 'listener', actionTitle?: string) => void;
  authUser: UserProfile | null;
  onLogout: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenStudio, onOpenLogin, authUser, onLogout }) => {
  // Live listener count simulation
  const [listenerCount, setListenerCount] = useState<number>(842);
  useEffect(() => {
    const interval = setInterval(() => {
      setListenerCount(prev => Math.max(500, prev + Math.floor(Math.random() * 7) - 3));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleEnterRoom = (role: 'host' | 'listener' = 'listener', title?: string) => {
    if (authUser) {
      onOpenStudio();
    } else {
      onOpenLogin(role, title || (role === 'host' ? 'Criar Minha Sala de DJ' : 'Entrar na Sala Sincronizada'));
    }
  };

  return (
    <div className="min-h-screen bg-[#050A15] text-zinc-100 font-sans selection:bg-[#00F2FE]/30 relative">
      {/* Top Banner - Live Indicator */}
      <div className="bg-[#091224] border-b border-cyan-900/50 px-4 py-2 text-center text-xs font-mono flex flex-wrap items-center justify-center gap-3">
        <span className="flex items-center gap-1.5 text-[#00F2FE] font-bold">
          <span className="w-2 h-2 rounded-full bg-[#00F2FE] animate-ping" />
          <span>• AO VIVO AGORA</span>
        </span>
        <span className="text-cyan-900 hidden sm:inline">•</span>
        <span className="text-zinc-300">
          <strong className="text-white">{listenerCount.toLocaleString('pt-BR')}</strong> ouvintes sincronizados na rede Sync Beats
        </span>
        <button 
          onClick={() => handleEnterRoom('listener', 'Entrar na Sala Ao Vivo')}
          className="ml-2 bg-gradient-to-r from-[#00F2FE] to-[#0072FF] hover:brightness-110 text-black px-3 py-0.5 rounded font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-sm shadow-[#00F2FE]/20"
        >
          {authUser ? 'Acessar Sala' : 'Entrar via E-mail'}
        </button>
      </div>

      {/* Navbar */}
      <header className="h-20 border-b border-cyan-900/40 bg-[#050A15]/90 backdrop-blur-xl sticky top-0 z-50 px-6 lg:px-16 flex items-center justify-between">
        {/* Logo SYNC BEATS */}
        <SyncBeatsLogo showBetasBadge={true} size="md" onClick={() => handleEnterRoom('listener')} />

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-extrabold uppercase tracking-widest text-zinc-400">
          <a href="#biblioteca" className="hover:text-[#00F2FE] text-cyan-300 transition-colors flex items-center gap-1.5 font-black">
            <Sparkles className="w-3.5 h-3.5 text-[#00F2FE]" />
            <span>BIBLIOTECA (LIB)</span>
          </a>
          <a href="#problema" className="hover:text-cyan-300 transition-colors">O PROBLEMA</a>
          <a href="#solucao" className="hover:text-cyan-300 transition-colors">COMO FUNCIONA</a>
          <a href="#planos" className="hover:text-cyan-300 transition-colors">PREÇOS</a>
          <a href="#artistas" className="hover:text-cyan-300 transition-colors">PARA ARTISTAS</a>
        </nav>

        {/* Right CTA / Auth Status */}
        <div className="flex items-center gap-3 sm:gap-4">
          {authUser ? (
            <div className="flex items-center gap-2 bg-[#0A1124] border border-cyan-500/30 rounded-xl px-3 py-1.5 shadow-sm">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00F2FE] to-[#0072FF] text-black flex items-center justify-center font-black text-xs">
                {authUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">
                  {authUser.name}
                </div>
                <div className="text-[10px] font-mono text-cyan-300/70 truncate max-w-[120px]">
                  {authUser.email}
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 hover:bg-cyan-950 text-zinc-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer ml-1"
                title="Sair / Trocar de conta"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => onOpenLogin('listener', 'Entrar na Conta Sync Beats')} 
              className="text-xs font-extrabold uppercase tracking-wider text-cyan-300 hover:text-white cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-cyan-950/60 border border-transparent hover:border-cyan-800/60 transition-all"
            >
              <Mail className="w-3.5 h-3.5 text-[#00F2FE]" />
              <span>ENTRAR VIA E-MAIL</span>
            </button>
          )}

          <button
            onClick={() => handleEnterRoom('host', 'Criar Nova Sala de DJ')}
            className="px-5 sm:px-6 py-2.5 sm:py-3 rounded bg-gradient-to-r from-[#00F2FE] via-[#00C6FF] to-[#0072FF] hover:brightness-110 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-[#00F2FE]/25 transition-all transform active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{authUser ? 'IR PARA SALA' : 'CRIAR SALA'}</span>
          </button>
        </div>
      </header>

      {/* SECTION 1: HERO */}
      <section className="relative pt-12 pb-24 px-6 lg:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Text & CTAs */}
          <div className="lg:col-span-7 text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Eyebrow Label */}
              <div className="flex items-center gap-2 mb-4 text-[#00F2FE] text-xs font-extrabold uppercase tracking-widest">
                <Headphones className="w-4 h-4 text-[#00F2FE]" />
                <span>O STREAMING FICOU SOLITÁRIO</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl sm:text-7xl lg:text-[80px] font-black uppercase tracking-tight leading-[0.92] text-white mb-6">
                PARE DE OUVIR <br />
                MÚSICA <span className="bg-gradient-to-r from-[#00F2FE] via-[#00C6FF] to-[#0072FF] bg-clip-text text-transparent">SOZINHO.</span>
              </h1>

              {/* Subheadline */}
              <p className="text-zinc-300 text-base sm:text-lg font-normal leading-relaxed mb-8 max-w-xl">
                Entre em salas ao vivo, escute com amigos e viva a música como um evento social — em tempo real. O primeiro clube de música social da América Latina.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
                <button
                  onClick={() => handleEnterRoom('listener', 'Entrar na Sala Sincronizada')}
                  className="px-8 py-4 rounded bg-gradient-to-r from-[#00F2FE] via-[#00C6FF] to-[#0072FF] hover:brightness-110 text-black font-black text-sm uppercase tracking-wider shadow-xl shadow-[#00F2FE]/30 transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>ENTRAR NA SALA AGORA</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>

                <button
                  onClick={() => handleEnterRoom('host', 'Criar Minha Sala Grátis')}
                  className="px-8 py-4 rounded border border-cyan-900/60 bg-[#091224] hover:bg-[#0E1B38] text-white font-black text-sm uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Radio className="w-4 h-4 text-[#00F2FE]" />
                  <span>CRIAR MINHA SALA GRÁTIS</span>
                </button>
              </div>

              {/* Trust markers for conversion */}
              <div className="flex items-center gap-6 pt-2 border-t border-cyan-900/40 text-xs text-zinc-400 font-mono">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00F2C5]" />
                  <span>Login Rápido por E-mail</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00F2C5]" />
                  <span>100% Grátis para Começar</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00F2C5]" />
                  <span>Latência Milimétrica</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Hero Interactive Live Card Mock */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-[#0A1124] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl relative border-t-[#00F2FE]/80 shadow-[#00F2FE]/10"
            >
              {/* Live Badge and Counter Header */}
              <div className="flex items-center justify-between mb-5">
                <span className="px-2.5 py-1 rounded-full bg-[#00F2FE]/15 border border-[#00F2FE]/30 text-[#00F2FE] font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FE] animate-ping" />
                  • AO VIVO
                </span>
                <span className="text-cyan-300 text-xs font-mono font-bold tracking-wider uppercase">
                  {listenerCount} OUVINDO
                </span>
              </div>

              {/* Album Art Cover Card */}
              <div className="bg-[#0E1A36] rounded-xl border border-cyan-800/60 p-12 flex flex-col items-center justify-center mb-6 text-center group cursor-pointer hover:border-[#00F2FE]/50 transition-colors" onClick={() => handleEnterRoom('listener')}>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00F2FE]/20 to-[#0072FF]/20 border border-[#00F2FE]/40 flex items-center justify-center text-[#00F2FE] mb-2 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,242,254,0.3)]">
                  <Music className="w-8 h-8 text-[#00F2FE]" />
                </div>
              </div>

              {/* Song Title and Subtitle */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">EYES WITHOUT A FACE</h3>
                <p className="text-xs text-cyan-300/80 font-mono mt-1">Billy Idol • Rebel Yell (1984)</p>
              </div>

              {/* Chat Messages Block */}
              <div className="border-t border-cyan-900/50 pt-4 space-y-2.5 text-xs font-sans">
                <div className="flex items-center gap-2">
                  <span className="text-[#00F2FE] font-bold">@marcos_music:</span>
                  <span className="text-zinc-300">Esse sintetizador dos anos 80 é lindo! 🔥</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#00F2FE] font-bold">@ana_vibe:</span>
                  <span className="text-zinc-300">A guitarra e a bateria tão 100% afinadas aqui!</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#00F2FE] font-bold">@dj_tech:</span>
                  <span className="text-zinc-300">Sincronia perfeita entre os decks.</span>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* SECTION: BIBLIOTECA DE FAIXAS (LIB) */}
      <section id="biblioteca" className="py-20 bg-[#060D1E] border-t border-cyan-900/60 px-6 lg:px-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00F2FE]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0072FF]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-mono font-bold text-[#00F2FE] uppercase tracking-widest block mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00F2FE]" />
                CATÁLOGO DE ÁUDIO SINCRONIZADO
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
                Biblioteca de Faixas (LIB)
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base mt-3 max-w-2xl">
                Escolha qualquer faixa para carregar diretamente na sala de DJ ou escutar em tempo real com reprodução de sintetizador Web Audio API de ultra-baixa latência.
              </p>
            </div>

            <button
              onClick={() => handleEnterRoom('host', 'Acessar Biblioteca e Decks')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#0072FF] hover:brightness-110 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto shadow-lg shadow-[#00F2FE]/20"
            >
              <Disc className="w-4 h-4" />
              <span>ABRIR NO STUDIO DJ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MUSIC_LIBRARY.map((track) => (
              <motion.div
                key={track.id}
                whileHover={{ y: -4 }}
                className="bg-[#0A1226] border border-cyan-900/60 hover:border-cyan-500/60 rounded-2xl p-5 flex flex-col justify-between group transition-all cursor-pointer shadow-md hover:shadow-xl hover:shadow-[#00F2FE]/10"
                onClick={() => handleEnterRoom('listener', `Escutar ${track.title}`)}
              >
                <div>
                  {/* Card Cover Art */}
                  <div className={`h-36 rounded-xl bg-gradient-to-br ${track.coverGradient} border border-cyan-500/30 p-4 flex flex-col justify-between relative overflow-hidden mb-4 group-hover:border-[#00F2FE]/60 transition-colors`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 uppercase">
                        {track.vibe}
                      </span>
                      {track.badge && (
                        <span className="text-[8px] font-mono font-black px-2 py-0.5 rounded bg-[#00F2FE] text-black uppercase">
                          {track.badge}
                        </span>
                      )}
                    </div>

                    <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center self-center group-hover:scale-110 group-hover:bg-[#00F2FE] group-hover:text-black text-white transition-all shadow-lg">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-300">
                      <span>{track.bpm ? `${track.bpm} BPM` : '80s Vinyl'}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-300" />
                        {Math.floor(track.duration / 60000)}:{Math.floor((track.duration % 60000) / 1000).toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-black text-base text-white uppercase tracking-tight group-hover:text-[#00F2FE] transition-colors truncate">
                    {track.title}
                  </h3>
                  <div className="text-xs text-cyan-300/80 font-mono mt-0.5 truncate">
                    {track.artist}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                    {track.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-cyan-900/40 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">
                    {track.genre.split('/')[0]}
                  </span>
                  <span className="text-xs font-black text-[#00F2FE] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Ouvir</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2: O PROBLEMA */}
      <section id="problema" className="py-20 bg-[#091122] border-t border-cyan-900/50 px-6 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold text-[#00F2FE] uppercase tracking-widest block mb-2">
              A FRATURA DA INDÚSTRIA
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
              🎧 O streaming ficou solitário
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base mt-4">
              Apesar de termos milhões de faixas no bolso, ouvir música hoje virou uma experiência isolada e fria.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-[#0D1833] border border-cyan-900/60 p-8 rounded-2xl relative group hover:border-[#00F2FE]/50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#00F2FE]/15 text-[#00F2FE] border border-[#00F2FE]/30 flex items-center justify-center font-black text-lg mb-6">
                01
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Você ouve música sozinho</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Cada um fica isolado em seus fones. Para ouvir com amigos distantes, é preciso enviar links e tentar sincronizar manualmente.
              </p>
            </div>

            <div className="bg-[#0D1833] border border-cyan-900/60 p-8 rounded-2xl relative group hover:border-[#00F2FE]/50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#00F2FE]/15 text-[#00F2FE] border border-[#00F2FE]/30 flex items-center justify-center font-black text-lg mb-6">
                02
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Precisa de 3 apps pra ouvir com amigos</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Spotify pra tocar, Discord pra conversar e outro app pra tentar sincronizar o áudio. Uma gambiarra frustrante.
              </p>
            </div>

            <div className="bg-[#0D1833] border border-cyan-900/60 p-8 rounded-2xl relative group hover:border-[#00F2FE]/50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#00F2FE]/15 text-[#00F2FE] border border-[#00F2FE]/30 flex items-center justify-center font-black text-lg mb-6">
                03
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Assinaturas estão caras</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Serviços tradicionais cobram mensalidades sem oferecer comunidade real ou interatividade de fã para fã.
              </p>
            </div>
          </div>

          <div className="text-center p-8 bg-[#0D1833] border border-[#00F2FE]/30 rounded-2xl">
            <p className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              "Música sempre foi social. O streaming quebrou isso."
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: SOLUÇÃO & COMO FUNCIONA */}
      <section id="solucao" className="py-20 px-6 lg:px-16 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold text-[#00F2FE] uppercase tracking-widest block mb-2">
            PROPOSTA DE VALOR
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            🚀 O primeiro clube de música social da América Latina
          </h2>
          <p className="text-zinc-300 text-base mt-4 leading-relaxed">
            O Sync Beats transforma qualquer faixa em uma experiência compartilhada, ao vivo e totalmente interativa.
          </p>
        </div>

        {/* Highlight Differentiator */}
        <div className="bg-[#0A1124] border border-[#00F2FE]/40 p-8 sm:p-12 rounded-2xl text-center shadow-2xl mb-16 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00F2FE] via-[#00C6FF] to-[#0072FF]" />
          <span className="px-3 py-1 bg-[#00F2FE]/15 text-[#00F2FE] border border-[#00F2FE]/30 text-xs font-mono font-bold uppercase rounded mb-4 inline-block">
            DIFERENCIAL CENTRAL
          </span>
          <h3 className="text-2xl sm:text-4xl font-black text-white uppercase mb-2">
            Não somos uma biblioteca de arquivos.
          </h3>
          <p className="text-xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00F2FE] via-[#00C6FF] to-[#0072FF] uppercase">
            Somos um clube de experiências musicais ao vivo.
          </p>
        </div>

        {/* 3 Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#0A1124] border border-cyan-900/60 p-6 rounded-2xl text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00F2FE] to-[#0072FF] text-black rounded-xl flex items-center justify-center font-black text-xl mx-auto mb-4 shadow-lg shadow-[#00F2FE]/20">
              1
            </div>
            <h4 className="font-bold text-white text-base mb-2 uppercase">Crie ou entre em uma sala</h4>
            <p className="text-xs text-zinc-400">Escolha uma rádio ao vivo ou abra sua própria sala de DJ em 1 clique.</p>
          </div>

          <div className="bg-[#0A1124] border border-cyan-900/60 p-6 rounded-2xl text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00F2FE] to-[#0072FF] text-black rounded-xl flex items-center justify-center font-black text-xl mx-auto mb-4 shadow-lg shadow-[#00F2FE]/20">
              2
            </div>
            <h4 className="font-bold text-white text-base mb-2 uppercase">Convide amigos com um link</h4>
            <p className="text-xs text-zinc-400">Envie o link direto pelo WhatsApp. Zero fricção para entrar.</p>
          </div>

          <div className="bg-[#0A1124] border border-cyan-900/60 p-6 rounded-2xl text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00F2FE] to-[#0072FF] text-black rounded-xl flex items-center justify-center font-black text-xl mx-auto mb-4 shadow-lg shadow-[#00F2FE]/20">
              3
            </div>
            <h4 className="font-bold text-white text-base mb-2 uppercase">Ouçam juntos em tempo real</h4>
            <p className="text-xs text-zinc-400">Sincronia milimétrica, chat ao vivo e reações em tempo real sem atrasos.</p>
          </div>
        </div>
      </section>

      {/* SECTION 7: PLANOS & MONETIZAÇÃO */}
      <section id="planos" className="py-20 bg-[#091122] border-t border-cyan-900/50 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold text-[#00F2FE] uppercase tracking-widest block mb-2">
              PREÇOS E ASSINATURAS
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">Planos Acessíveis</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Freemium */}
            <div className="bg-[#0A1124] border border-cyan-900/60 p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-black text-white uppercase mb-1">Freemium</h3>
                <div className="text-3xl font-black text-white mb-6">Grátis</div>
                <ul className="space-y-3 text-xs text-zinc-300 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00F2FE]" />
                    <span>Acesso a todas as salas públicas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00F2FE]" />
                    <span>Chat e reações ilimitadas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00F2FE]" />
                    <span>Grátis com anúncios</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleEnterRoom('listener', 'Começar Grátis com E-mail')}
                className="w-full py-3 rounded bg-cyan-950/60 border border-cyan-800 hover:bg-cyan-900 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                COMEÇAR GRÁTIS
              </button>
            </div>

            {/* Plano Lite */}
            <div className="bg-[#0A1124] border-2 border-[#00F2FE] p-8 rounded-2xl flex flex-col justify-between relative shadow-2xl shadow-[#00F2FE]/20">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-[#00F2FE] to-[#0072FF] text-black font-mono text-[10px] font-black uppercase tracking-wider rounded">
                MAIS POPULAR
              </span>
              <div>
                <h3 className="text-2xl font-black text-white uppercase mb-1">Plano Lite</h3>
                <div className="text-3xl font-black text-white mb-6">
                  R$ 12,90 <span className="text-xs text-zinc-400 font-normal">/mês</span>
                </div>
                <ul className="space-y-3 text-xs text-zinc-200 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00F2C5]" />
                    <span>Áudio sincronizado sem anúncios</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00F2C5]" />
                    <span>Salas privadas com amigos ilimitadas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00F2C5]" />
                    <span>Emojis e badges exclusivos</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleEnterRoom('listener', 'Assinar Plano Lite')}
                className="w-full py-3 rounded bg-gradient-to-r from-[#00F2FE] via-[#00C6FF] to-[#0072FF] hover:brightness-110 text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                ASSINAR PLANO LITE
              </button>
            </div>

            {/* Plano Pro */}
            <div className="bg-[#0A1124] border border-cyan-900/60 p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-black text-white uppercase mb-1">Plano Pro</h3>
                <div className="text-3xl font-black text-white mb-6">
                  R$ 29,90 <span className="text-xs text-zinc-400 font-normal">/mês</span>
                </div>
                <ul className="space-y-3 text-xs text-zinc-300 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00F2FE]" />
                    <span>Áudio Hi-Fi Flawless Sound</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00F2FE]" />
                    <span>Salas ilimitadas para até 10.000 ouvintes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00F2FE]" />
                    <span>Badge Exclusivo de Host VIP</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleEnterRoom('host', 'Assinar Plano Pro e Criar Sala')}
                className="w-full py-3 rounded bg-cyan-950/60 border border-cyan-800 hover:bg-cyan-900 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                ASSINAR PLANO PRO
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: PARA ARTISTAS */}
      <section id="artistas" className="py-20 px-6 lg:px-16 max-w-7xl mx-auto">
        <div className="bg-[#0A1124] border border-cyan-900/60 rounded-2xl p-8 sm:p-12 border-l-4 border-l-[#00F2FE]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-mono font-bold text-[#00F2FE] uppercase">
                B2B & ENGANJAMENTO
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white uppercase mt-2 mb-4">
                🎤 Para Artistas e Selos
              </h2>
              <p className="text-zinc-300 text-sm leading-relaxed mb-6">
                Faça <strong className="text-white">Listening Parties</strong> ao vivo com seus fãs mais engajados, veja quem está ouvindo suas faixas e crie uma comunidade ao redor do seu catálogo.
              </p>
            </div>

            <div className="text-center lg:text-right">
              <button
                onClick={() => handleEnterRoom('host', 'Acesso Artista / Host DJ')}
                className="px-8 py-4 rounded bg-gradient-to-r from-[#00F2FE] via-[#00C6FF] to-[#0072FF] hover:brightness-110 text-black font-black text-sm uppercase tracking-wider cursor-pointer shadow-lg shadow-[#00F2FE]/20"
              >
                SOLICITAR ACESSO PARA ARTISTA
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Action Button (FAB Bottom-Right) */}
      <button
        onClick={() => handleEnterRoom('host', 'Criar Sala Rápida')}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-[#00F2FE] to-[#0072FF] hover:brightness-110 text-black rounded-xl shadow-2xl shadow-[#00F2FE]/40 flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
        title="Criar Sala Grátis"
      >
        <Plus className="w-8 h-8 stroke-[3]" />
      </button>

      {/* Footer */}
      <footer className="py-8 px-6 lg:px-16 border-t border-cyan-900/50 text-xs text-zinc-500 bg-[#050A15]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <SyncBeatsLogo showBetasBadge={true} showTagline={true} size="sm" onClick={() => handleEnterRoom('listener')} />
          <div className="text-zinc-500 text-[11px]">
            © {new Date().getFullYear()} Sync Beats — O primeiro clube de música social da América Latina.
          </div>
        </div>
      </footer>
    </div>
  );
};
