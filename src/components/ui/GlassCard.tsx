import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: 'pink' | 'teal' | 'gold' | 'none';
  children: React.ReactNode;
}

export function GlassCard({ glow = 'none', className = '', children, ...props }: GlassCardProps) {
  let glowClass = '';
  switch (glow) {
    case 'pink': glowClass = 'hover:shadow-npPinkGlow hover:border-npPink/30'; break;
    case 'teal': glowClass = 'hover:shadow-npTealGlow hover:border-npTeal/30'; break;
    case 'gold': glowClass = 'hover:shadow-npGoldGlow hover:border-npGold/30'; break;
    default: glowClass = 'hover:border-white/20'; break;
  }

  return (
    <div 
      className={`backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 hover:bg-white/[0.08] ${glowClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
