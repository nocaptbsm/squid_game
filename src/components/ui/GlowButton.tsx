import React from 'react';

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  children: React.ReactNode;
}

export function GlowButton({ variant = 'primary', className = '', children, ...props }: GlowButtonProps) {
  let baseStyles = "relative overflow-hidden font-bold uppercase tracking-widest rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";
  
  let variantStyles = "";
  
  switch (variant) {
    case 'primary':
      variantStyles = "bg-gradient-to-br from-[#ff3580] to-[#ff6b6b] text-white shadow-[0_0_20px_rgba(255,53,128,0.5),0_0_40px_rgba(255,53,128,0.2)] hover:shadow-[0_0_30px_rgba(255,53,128,0.7)] border border-white/20";
      break;
    case 'secondary':
      variantStyles = "bg-gradient-to-br from-[#00d4d4] to-[#009696] text-white shadow-[0_0_20px_rgba(0,212,212,0.4)] hover:shadow-[0_0_30px_rgba(0,212,212,0.6)] border border-white/20";
      break;
    case 'danger':
      variantStyles = "bg-gradient-to-br from-[#ff2222] to-[#b30000] text-white shadow-[0_0_20px_rgba(255,34,34,0.4)] hover:shadow-[0_0_30px_rgba(255,34,34,0.6)] border border-white/20";
      break;
    case 'ghost':
      variantStyles = "bg-white/[0.06] border border-white/[0.12] text-npText hover:bg-white/[0.10] hover:border-white/20";
      break;
  }

  return (
    <button className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
      {/* Shimmer effect for solid buttons */}
      {variant !== 'ghost' && (
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent hover:animate-[shimmer_1.5s_infinite]" />
      )}
    </button>
  );
}
