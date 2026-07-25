import React from 'react';

interface SyncBeatsIconProps {
  className?: string;
  size?: number;
}

export const SyncBeatsIcon: React.FC<SyncBeatsIconProps> = ({ className = '', size = 38 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 120 80" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`drop-shadow-[0_0_12px_rgba(0,242,254,0.4)] ${className}`}
    >
      <defs>
        {/* Cyan to Electric Blue Gradient for Strand 1 */}
        <linearGradient id="sbCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00F2FE" />
          <stop offset="50%" stopColor="#00C6FF" />
          <stop offset="100%" stopColor="#0072FF" />
        </linearGradient>

        {/* Teal to Cyan Gradient for Strand 2 */}
        <linearGradient id="sbTealGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0072FF" />
          <stop offset="50%" stopColor="#00F2C5" />
          <stop offset="100%" stopColor="#00F2FE" />
        </linearGradient>

        {/* Glow filter */}
        <filter id="sbGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <linearGradient id="playGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00F2FE" />
          <stop offset="100%" stopColor="#0072FF" />
        </linearGradient>
      </defs>

      {/* Main DNA / Infinity Intertwined Wave Strand 1 */}
      <path 
        d="M 25 40 C 25 20, 52 20, 60 40 C 68 60, 95 60, 95 40 C 95 20, 68 20, 60 40 C 52 60, 25 60, 25 40 Z" 
        stroke="url(#sbCyanGrad)" 
        strokeWidth="6" 
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Secondary Intertwined Wave Strand 2 */}
      <path 
        d="M 18 40 C 18 12, 52 12, 60 40 C 68 68, 102 68, 102 40 C 102 12, 68 12, 60 40 C 52 68, 18 68, 18 40 Z" 
        stroke="url(#sbTealGrad)" 
        strokeWidth="3.5" 
        strokeDasharray="90 10"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />

      {/* Equalizer Soundbars Left Loop */}
      <rect x="32" y="32" width="2.5" height="16" rx="1.25" fill="#00F2C5" />
      <rect x="37" y="27" width="2.5" height="26" rx="1.25" fill="#00F2FE" />
      <rect x="42" y="30" width="2.5" height="20" rx="1.25" fill="#00C6FF" />

      {/* Equalizer Soundbars Right Loop */}
      <rect x="75.5" y="30" width="2.5" height="20" rx="1.25" fill="#00C6FF" />
      <rect x="80.5" y="27" width="2.5" height="26" rx="1.25" fill="#00F2FE" />
      <rect x="85.5" y="32" width="2.5" height="16" rx="1.25" fill="#0072FF" />

      {/* Center Circle with Glow & Play Icon */}
      <circle cx="60" cy="40" r="10" fill="#0A0F1D" stroke="url(#sbCyanGrad)" strokeWidth="2.5" />
      <polygon points="57,34 66,40 57,46" fill="url(#playGrad)" />
    </svg>
  );
};

interface SyncBeatsLogoProps {
  showTagline?: boolean;
  showBetasBadge?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

export const SyncBeatsLogo: React.FC<SyncBeatsLogoProps> = ({
  showTagline = false,
  showBetasBadge = true,
  size = 'md',
  onClick,
  className = '',
}) => {
  const iconSizes = {
    sm: 32,
    md: 42,
    lg: 56,
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      {/* Icon Emblem */}
      <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
        <SyncBeatsIcon size={iconSizes[size]} />
      </div>

      {/* Text & Tag */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2">
          {/* Main Name with Cyber/Tech Accents */}
          <span className={`${titleSizes[size]} font-black tracking-tighter text-white uppercase font-sans flex items-center`}>
            SYNC<span className="bg-gradient-to-r from-[#00F2FE] via-[#00C6FF] to-[#0072FF] bg-clip-text text-transparent ml-1">BEATS</span>
          </span>

          {/* BETAS Badge as requested in image 1 */}
          {showBetasBadge && (
            <span className="px-2 py-0.5 rounded-md bg-[#00F2FE]/10 border border-[#00F2FE]/40 text-[#00F2FE] text-[9px] font-mono font-black uppercase tracking-widest shadow-[0_0_10px_rgba(0,242,254,0.2)]">
              BETAS
            </span>
          )}
        </div>

        {/* Subtitle / Tagline from logo image 2 */}
        {showTagline && (
          <span className="text-[9px] font-mono tracking-widest text-cyan-300/80 uppercase font-semibold -mt-0.5">
            SHARED AUDIO | REAL-TIME CHAT
          </span>
        )}
      </div>
    </div>
  );
};
