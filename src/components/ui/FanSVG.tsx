import React from 'react';

export function FanSVG({ className = '' }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 200 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1" strokeLinecap="round">
        <path d="M100 110 L20 20" />
        <path d="M100 110 L40 10" />
        <path d="M100 110 L70 5" />
        <path d="M100 110 L100 0" />
        <path d="M100 110 L130 5" />
        <path d="M100 110 L160 10" />
        <path d="M100 110 L180 20" />
        
        {/* Arc bands */}
        <path d="M30 30 Q100 0 170 30" strokeWidth="1.5" strokeOpacity="0.8" />
        <path d="M50 50 Q100 20 150 50" strokeWidth="2" strokeOpacity="0.6" />
        <path d="M70 70 Q100 45 130 70" strokeWidth="2" strokeOpacity="0.4" />
        
        <circle cx="100" cy="110" r="5" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}
