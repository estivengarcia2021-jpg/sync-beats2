import React, { useState } from 'react';
import { Mail, User, Shield, Check, X, ArrowRight, Sparkles, Headphones, Radio, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { SyncBeatsLogo } from './SyncBeatsLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  defaultRole?: 'host' | 'listener';
  actionTitle?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  defaultRole = 'listener',
  actionTitle = 'Entrar na Sala Sincronizada'
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'host' | 'listener'>(defaultRole);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Por favor, digite seu e-mail.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    setIsLoading(true);

    // Auto-derive name if empty
    const derivedName = name.trim() || trimmedEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const newUser: UserProfile = {
      id: `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      name: derivedName,
      email: trimmedEmail.toLowerCase(),
      role: role,
      joinedAt: Date.now(),
    };

    setTimeout(() => {
      // Save in localStorage for persistence
      try {
        localStorage.setItem('syncbeats_auth_user', JSON.stringify(newUser));
      } catch (err) {
        console.error('Failed to store auth user', err);
      }
      setIsLoading(false);
      onLoginSuccess(newUser);
    }, 400);
  };

  const handleQuickLogin = (quickEmail: string, quickName: string, quickRole: 'host' | 'listener') => {
    setEmail(quickEmail);
    setName(quickName);
    setRole(quickRole);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.93, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.93, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-[#0A1124] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-[#00F2FE]/15 z-10 overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00F2FE]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#0072FF]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white rounded-full bg-cyan-950/60 border border-cyan-800/50 hover:bg-cyan-900 transition-colors cursor-pointer"
            title="Fechar"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center mb-3">
              <SyncBeatsLogo size="sm" showBetasBadge={false} />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Acesso à Sala de Áudio
            </h3>
            <p className="text-xs text-cyan-300/80 font-mono mt-1">
              Informe seu e-mail para conectar e sincronizar seu áudio em tempo real.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-cyan-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#00F2FE]" />
                <span>Seu E-mail de Acesso <span className="text-[#00F2FE]">*</span></span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="exemplo@syncbeats.app"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full bg-[#050A15] border border-cyan-800/70 focus:border-[#00F2FE] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all shadow-inner focus:ring-2 focus:ring-[#00F2FE]/20"
                />
              </div>
            </div>

            {/* Display Name Field */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-cyan-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#00F2FE]" />
                <span>Seu Nome ou Apelido DJ <span className="text-zinc-500 font-normal lowercase">(opcional)</span></span>
              </label>
              <input
                type="text"
                placeholder="Ex: Pedro Mix ou DJ Alex"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#050A15] border border-cyan-800/70 focus:border-[#00F2FE] rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-all shadow-inner focus:ring-2 focus:ring-[#00F2FE]/20"
              />
            </div>

            {/* Role Switcher */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-cyan-300 mb-1.5 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#00F2FE]" />
                <span>Como deseja entrar?</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('listener')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    role === 'listener'
                      ? 'bg-gradient-to-r from-cyan-950 to-[#0072FF]/20 border-[#00F2FE] text-[#00F2FE] shadow-sm'
                      : 'bg-[#050A15]/80 border-cyan-900/60 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>Ouvinte VIP</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('host')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    role === 'host'
                      ? 'bg-gradient-to-r from-cyan-950 to-[#0072FF]/20 border-[#00F2FE] text-[#00F2FE] shadow-sm'
                      : 'bg-[#050A15]/80 border-cyan-900/60 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Host / DJ Master</span>
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-2.5 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs font-medium flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00F2FE] via-[#00C6FF] to-[#0072FF] hover:brightness-110 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-[#00F2FE]/25 transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <span>Validando acesso...</span>
              ) : (
                <>
                  <span>{actionTitle}</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </button>
          </form>

          {/* Quick presets for testing */}
          <div className="mt-5 pt-4 border-t border-cyan-900/50">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-2 text-center">
              Ou selecione um perfil de teste rápido:
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                type="button"
                onClick={() => handleQuickLogin('dj.billy@syncbeats.app', 'DJ Billy', 'host')}
                className="px-2.5 py-1 rounded-lg bg-cyan-950/70 border border-cyan-800/60 hover:border-[#00F2FE] text-[10px] font-mono text-cyan-200 hover:text-white transition-colors cursor-pointer"
              >
                🎧 dj.billy@syncbeats.app
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('ouvinte.clara@gmail.com', 'Clara Ouvinte', 'listener')}
                className="px-2.5 py-1 rounded-lg bg-cyan-950/70 border border-cyan-800/60 hover:border-[#00F2FE] text-[10px] font-mono text-cyan-200 hover:text-white transition-colors cursor-pointer"
              >
                🎵 ouvinte.clara@gmail.com
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
