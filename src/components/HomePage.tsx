import React, { useState, useEffect } from 'react';
import { 
  Radio, Zap, Shield, Users, ArrowRight, Music, Sparkles, CheckCircle2, 
  MessageSquare, Heart, Flame, Globe, Lock, Play, Share2, Layers, Rocket, 
  Target, Award, Star, Volume2, Headphones, Check, Smartphone, Plus, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SyncBeatsLogo } from './SyncBeatsLogo';

interface HomePageProps {
  onOpenStudio: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenStudio }) => {
  // Live listener count simulation
  const [listenerCount, setListenerCount] = useState<number>(842);
  useEffect(() => {
    const interval = setInterval(() => {
      setListenerCount(prev => Math.max(500, prev + Math.floor(Math.random() * 7) - 3));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#050A15] text-zinc-100 font-sans selection:bg-[#00F2FE]/30 relative">
      {/* Top Banner - Live Indicator */}
      <div className="bg-[#091224] border-b border-cyan-900/50 px-4 py-2 text-center text-xs font-mono flex items-center justify-center gap-3">
        <span className="flex items-center gap-1.5 text-[#00F2FE] font-bold">
          <span className="w-2 h-2 rounded-full bg-[#00F2FE] animate-ping" />
          <span>• AO VIVO AGORA</span>
        </span>
        <span className="text-cyan-900 hidden sm:inline">•</span>
        <span className="text-zinc-300">
          <strong className="text-white">{listenerCount.toLocaleString('pt-BR')}</strong> ouvintes sincronizados na rede Sync Beats
        </span>
        <button 
          onClick={onOpenStudio}
          className="ml-2 bg-gradient-to-r from-[#00F2FE] to-[#0072FF] hover:brightness-110 text-black px-3 py-0.5 rounded font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-sm shadow-[#00F2FE]/20"
        >
          Entrar Na Sala
        </button>
      </div>

      {/* Navbar */}
      <header className="h-20 border-b border-cyan-900/40 bg-[#050A15]/90 backdrop-blur-xl sticky top-0 z-50 px-6 lg:px-16 flex items-center justify-between">
        {/* Logo SYNC BEATS */}
        <SyncBeatsLogo showBetasBadge={true} size="md" onClick={onOpenStudio} />

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-extrabold uppercase tracking-widest text-zinc-400">
          <a href="#problema" className="hover:text-cyan-300 transition-colors">O PROBLEMA</a>
          <a href="#solucao" className="hover:text-cyan-300 transition-colors">COMO FUNCIONA</a>
          <a href="#planos" className="hover:text-cyan-300 transition-colors">PREÇOS</a>
          <a href="#artistas" className="hover:text-cyan-300 transition-colors">PARA ARTISTAS</a>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-5">
          <button 
            onClick={onOpenStudio} 
            className="text-xs font-extrabold uppercase tracking-wider text-zinc-300 hover:text-white cursor-pointer hidden sm:block"
          >
            ENTRAR
          </button>
          <button
            onClick={onOpenStudio}
            className="px-6 py-3 rounded bg-gradient-to-r from-[#00F2FE] via-[#00C6FF] to-[#0072FF] hover:brightness-110 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-[#00F2FE]/25 transition-all transform active:scale-95 cursor-pointer"
          >
            CRIAR SALA
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
                  onClick={onOpenStudio}
                  className="px-8 py-4 rounded bg-gradient-to-r from-[#00F2FE] via-[#00C6FF] to-[#0072FF] hover:brightness-110 text-black font-black text-sm uppercase tracking-wider shadow-xl shadow-[#00F2FE]/30 transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>ENTRAR NA SALA AGORA</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>

                <button
                  onClick={onOpenStudio}
                  className="px-8 py-4 rounded border border-cyan-900/60 bg-[#091224] hover:bg-[#0E1B38] text-white font-black text-sm uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>CRIAR MINHA SALA GRÁTIS</span>
                </button>
              </div>

              {/* Trust markers for conversion */}
              <div className="flex items-center gap-6 pt-2 border-t border-cyan-900/40 text-xs text-zinc-400 font-mono">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00F2C5]" />
                  <span>Sem Download</span>
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
              <div className="bg-[#0E1A36] rounded-xl border border-cyan-800/60 p-12 flex flex-col items-center justify-center mb-6 text-center group cursor-pointer hover:border-[#00F2FE]/50 transition-colors" onClick={onOpenStudio}>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00F2FE]/20 to-[#0072FF]/20 border border-[#00F2FE]/40 flex items-center justify-center text-[#00F2FE] mb-2 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,242,254,0.3)]">
                  <Music className="w-8 h-8 text-[#00F2FE]" />
                </div>
              </div>

              {/* Song Title and Subtitle */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">MIDNIGHT CITY</h3>
                <p className="text-xs text-cyan-300/80 font-mono mt-1">M83 • Indie Electronic</p>
              </div>

              {/* Chat Messages Block */}
              <div className="border-t border-cyan-900/50 pt-4 space-y-2.5 text-xs font-sans">
                <div className="flex items-center gap-2">
                  <span className="text-[#00F2FE] font-bold">@marcos_music:</span>
                  <span className="text-zinc-300">Essa transição é absurda! 🔥</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#00F2FE] font-bold">@ana_vibe:</span>
                  <span className="text-zinc-300">Alguém sabe quando é o próximo drop?</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#00F2FE] font-bold">@dj_tech:</span>
                  <span className="text-zinc-300">Sincronia perfeita aqui em SP.</span>
                </div>
              </div>
            </motion.div>
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
                onClick={onOpenStudio}
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
                onClick={onOpenStudio}
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
                onClick={onOpenStudio}
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
                onClick={onOpenStudio}
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
        onClick={onOpenStudio}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-[#00F2FE] to-[#0072FF] hover:brightness-110 text-black rounded-xl shadow-2xl shadow-[#00F2FE]/40 flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
        title="Criar Sala Grátis"
      >
        <Plus className="w-8 h-8 stroke-[3]" />
      </button>

      {/* Footer */}
      <footer className="py-8 px-6 lg:px-16 border-t border-cyan-900/50 text-xs text-zinc-500 bg-[#050A15]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <SyncBeatsLogo showBetasBadge={true} showTagline={true} size="sm" onClick={onOpenStudio} />
          <div className="text-zinc-500 text-[11px]">
            © {new Date().getFullYear()} Sync Beats — O primeiro clube de música social da América Latina.
          </div>
        </div>
      </footer>
    </div>
  );
};
