import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'cyan' | 'violet' | 'emerald' | 'amber' | 'crimson' | 'none';
  interactive?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glow = 'none',
  interactive = false,
  onClick,
}) => {
  const glowStyles = {
    cyan: 'hover:border-cyber-cyan/40 hover:shadow-glow-cyan',
    violet: 'hover:border-cyber-violet/40 hover:shadow-glow-violet',
    emerald: 'hover:border-cyber-emerald/40 hover:shadow-glow-emerald',
    amber: 'hover:border-cyber-amber/40 hover:shadow-[0_0_25px_-5px_rgba(245,158,11,0.4)]',
    crimson: 'hover:border-cyber-crimson/40 hover:shadow-glow-crimson',
    none: 'hover:border-white/20',
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl
        bg-cosmic-850/60 backdrop-blur-xl
        border border-white/10
        shadow-glass-card
        transition-all duration-300
        ${interactive ? 'cursor-pointer active:scale-[0.99] ' + glowStyles[glow] : ''}
        ${className}
      `}
    >
      {/* Specular sheen line on top edge */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      
      {/* Card Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
