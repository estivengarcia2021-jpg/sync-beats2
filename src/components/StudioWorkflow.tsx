import React, { useState } from 'react';
import { 
  Play, Pause, Zap, Radio, Sliders, Shield, Users, ArrowRight, 
  HelpCircle, Sparkles, CheckCircle2, RefreshCw, Cpu, Activity, Info, ChevronDown, ChevronUp, Music, Headphones
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface PresetTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  track: {
    id: string;
    title: string;
    artist: string;
    duration: number;
  };
}

export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: 'radio-fm',
    name: '📻 Rádio FM Digital / WebRádio',
    description: 'Transmissão contínua com DJ Host no comando, fila de sugestões e ouvintes interagindo ao vivo.',
    icon: 'Radio',
    track: {
      id: 'track-radio-1',
      title: 'MIDNIGHT CITY (Live Set)',
      artist: 'M83 • Indie Electronic',
      duration: 180000, // 3 mins
    },
  },
  {
    id: 'silent-disco',
    name: '🎧 Festa Silenciosa (Silent Disco)',
    description: 'Múltiplos fones de ouvido sincronizados com latência zero e reações de emojis flutuantes em massa.',
    icon: 'Headphones',
    track: {
      id: 'track-disco-1',
      title: 'Neon Nights & Sub-Bass',
      artist: 'DJ Pulse X',
      duration: 240000, // 4 mins
    },
  },
  {
    id: 'podcast-live',
    name: '🎙️ Podcast Interativo & Fan Meeting',
    description: 'Episódio ao vivo com chat de fãs, perguntas em tempo real e controle absoluto do podcaster.',
    icon: 'Music',
    track: {
      id: 'track-podcast-1',
      title: 'Ep. 42: O Futuro do Áudio Sincronizado',
      artist: 'Tech Talk Studio',
      duration: 300000, // 5 mins
    },
  },
];

interface StudioWorkflowProps {
  serverStatus: 'playing' | 'paused';
  startTime: number | null;
  seekPosition: number;
  latency: number;
  activeTemplateId: string;
  onSelectTemplate: (template: PresetTemplate) => void;
  onRunAutoDemo: () => void;
}

export const StudioWorkflow: React.FC<StudioWorkflowProps> = ({
  serverStatus,
  startTime,
  seekPosition,
  latency,
  activeTemplateId,
  onSelectTemplate,
  onRunAutoDemo,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [showFormula, setShowFormula] = useState<boolean>(true);
  const [showTemplates, setShowTemplates] = useState<boolean>(false);

  // Cálculo didático do tempo
  const now = Date.now();
  const elapsedSeconds = startTime ? Math.max(0, (now - startTime) / 1000) : 0;
  const computedSeekSeconds = (seekPosition / 1000) + (serverStatus === 'playing' ? elapsedSeconds : 0);

  return (
    <div className="bg-[#0A1124] border border-cyan-500/30 rounded-2xl p-5 mb-8 shadow-2xl backdrop-blur-xl">
      {/* Top Banner: Workflow Header & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-cyan-900/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded bg-[#00F2FE]/15 text-[#00F2FE] border border-[#00F2FE]/30 text-[10px] font-mono font-bold uppercase tracking-wider">
              Guia Didático do Studio
            </span>
            <span className="text-xs text-cyan-300/60">• Como Funciona a Sincronização</span>
          </div>
          <h2 className="text-xl font-black uppercase text-white flex items-center gap-2">
            <span>Fluxo de Funcionamento Sync Beats</span>
            <Sparkles className="w-5 h-5 text-[#00F2FE] animate-pulse" />
          </h2>
        </div>

        {/* Buttons: Templates & Auto-Demo */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="px-4 py-2 rounded bg-[#0E1A36] hover:bg-[#12234A] border border-cyan-800/60 text-xs font-bold text-cyan-200 flex items-center gap-2 transition-all active:scale-95 cursor-pointer uppercase"
          >
            <Music className="w-4 h-4 text-[#00F2FE]" />
            <span>Mudar Modelo / Template</span>
            {showTemplates ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onRunAutoDemo}
            className="px-4 py-2 rounded bg-gradient-to-r from-[#00F2FE] via-[#00C6FF] to-[#0072FF] hover:brightness-110 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-[#00F2FE]/20 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-black text-black" />
            <span>▶ Teste Automático Guiado (10s)</span>
          </button>
        </div>
      </div>

      {/* Selector de Templates Dropdown */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-b border-cyan-900/50 py-4"
          >
            <p className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest mb-3">
              Selecione um Caso de Uso Didático para Testar:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PRESET_TEMPLATES.map((tmpl) => {
                const isSelected = tmpl.id === activeTemplateId;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => {
                      onSelectTemplate(tmpl);
                      setShowTemplates(false);
                    }}
                    className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#00F2FE]/15 border-[#00F2FE] text-white shadow-lg shadow-[#00F2FE]/10'
                        : 'bg-[#0D1833] border-cyan-900/60 hover:border-cyan-700 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="font-bold text-xs text-white mb-1 flex items-center justify-between uppercase">
                      <span>{tmpl.name}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#00F2FE]" />}
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-normal">{tmpl.description}</p>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4 Steps Interactive Workflow */}
      <div className="pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {/* Step 1 */}
          <div
            onClick={() => setActiveStep(1)}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              activeStep === 1
                ? 'bg-[#00F2FE]/20 border-[#00F2FE] text-white shadow-lg shadow-[#00F2FE]/10'
                : 'bg-[#0D1833] border-cyan-900/60 text-zinc-400 hover:border-cyan-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold uppercase text-[#00F2FE]">Passo 1</span>
              <Shield className="w-4 h-4 text-[#00F2FE]" />
            </div>
            <div className="font-bold text-xs text-white mb-1 uppercase">Host (Controlador)</div>
            <p className="text-[10px] text-zinc-400 leading-tight">
              Aperta PLAY/PAUSE. Envia apenas um timestamp global ao servidor.
            </p>
          </div>

          {/* Step 2 */}
          <div
            onClick={() => setActiveStep(2)}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              activeStep === 2
                ? 'bg-[#00F2FE]/20 border-[#00F2FE] text-white shadow-lg shadow-[#00F2FE]/10'
                : 'bg-[#0D1833] border-cyan-900/60 text-zinc-400 hover:border-cyan-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold uppercase text-[#00F2FE]">Passo 2</span>
              <Cpu className="w-4 h-4 text-[#00F2FE]" />
            </div>
            <div className="font-bold text-xs text-white mb-1 uppercase">Redis & State Engine</div>
            <p className="text-[10px] text-zinc-400 leading-tight">
              Grava o <code className="text-[#00F2FE]">startTime</code> absoluto e propaga o evento.
            </p>
          </div>

          {/* Step 3 */}
          <div
            onClick={() => setActiveStep(3)}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              activeStep === 3
                ? 'bg-[#00F2C5]/20 border-[#00F2C5] text-white shadow-lg shadow-[#00F2C5]/10'
                : 'bg-[#0D1833] border-cyan-900/60 text-zinc-400 hover:border-cyan-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold uppercase text-[#00F2C5]">Passo 3</span>
              <Users className="w-4 h-4 text-[#00F2C5]" />
            </div>
            <div className="font-bold text-xs text-white mb-1 uppercase">Ouvinte (Compensador)</div>
            <p className="text-[10px] text-zinc-400 leading-tight">
              Mesmo com latência, calcula o ponto exato da música instantaneamente.
            </p>
          </div>

          {/* Step 4 */}
          <div
            onClick={() => setActiveStep(4)}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              activeStep === 4
                ? 'bg-[#00F2C5]/20 border-[#00F2C5] text-white shadow-lg shadow-[#00F2C5]/10'
                : 'bg-[#0D1833] border-cyan-900/60 text-zinc-400 hover:border-cyan-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold uppercase text-[#00F2C5]">Passo 4</span>
              <Activity className="w-4 h-4 text-[#00F2C5]" />
            </div>
            <div className="font-bold text-xs text-white mb-1 uppercase">Interação em Tempo Real</div>
            <p className="text-[10px] text-zinc-400 leading-tight">
              Reações de emojis, chat e fila de faixas sincronizadas para todos.
            </p>
          </div>
        </div>

        {/* Detailed Explanation Box */}
        <div className="bg-[#0D1833] border border-cyan-900/60 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/20 mt-0.5">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold uppercase text-[#00F2FE] mb-0.5">
                Explicação do Passo {activeStep}:
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed max-w-2xl">
                {activeStep === 1 && (
                  <>
                    <strong>O Host não envia o áudio pesado</strong> pela rede. Ele apenas transmite o evento "Play" ou "Pause". O servidor grava o horário global e notifica os clientes.
                  </>
                )}
                {activeStep === 2 && (
                  <>
                    <strong>O backend (Socket.IO + Redis)</strong> armazena a estrutura: <code className="bg-cyan-950 px-1 text-[#00F2FE] rounded border border-cyan-800/40">status: 'playing'</code> e <code className="bg-cyan-950 px-1 text-[#00F2FE] rounded border border-cyan-800/40">startTime: {startTime || 'null'}</code>.
                  </>
                )}
                {activeStep === 3 && (
                  <>
                    <strong>Matemática da Sincronia:</strong> O ouvinte calcula <code className="bg-cyan-950 px-1 text-[#00F2C5] rounded border border-cyan-800/40">Posição = SeekInicial + (RelógioLocal - StartTimeServidor)</code>. Se o pacote atrasar, o ouvinte ajusta o tempo e mantém o som afinado!
                  </>
                )}
                {activeStep === 4 && (
                  <>
                    <strong>Engajamento Total:</strong> Clique nos emojis de coração ou fogo no Host ou Ouvinte e veja a reação subir no chat em tempo real!
                  </>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowFormula(!showFormula)}
            className="text-xs font-mono text-cyan-300 hover:text-white flex items-center gap-1.5 bg-[#091224] border border-cyan-800/60 px-3 py-1.5 rounded uppercase whitespace-nowrap cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-[#00F2FE]" />
            <span>{showFormula ? 'Ocultar Fórmula' : 'Ver Fórmula'}</span>
          </button>
        </div>

        {/* Live Formula Visualization */}
        <AnimatePresence>
          {showFormula && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 bg-[#0D1833] border border-[#00F2FE]/20 rounded-xl p-4 text-xs font-mono"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-zinc-300">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <div>
                    <span className="text-zinc-500">Status Servidor:</span>{' '}
                    <strong className={serverStatus === 'playing' ? 'text-emerald-400' : 'text-[#00F2C5]'}>
                      {serverStatus.toUpperCase()}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap text-[11px]">
                  <div>
                    <span className="text-zinc-500">StartTime:</span>{' '}
                    <span className="text-[#00F2FE]">{startTime ? startTime : 'N/A (Pausado)'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Latência Injetada:</span>{' '}
                    <span className={latency > 300 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                      {latency}ms
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Posição Calculada:</span>{' '}
                    <span className="text-white font-bold">{computedSeekSeconds.toFixed(2)}s</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
