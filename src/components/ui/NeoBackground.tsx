'use client';
import React, { useEffect, useState } from 'react';
import { FanSVG } from './FanSVG';

export function NeoBackground() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Abstract Cloud Blobs */}
      <div className="absolute top-1/4 -right-20 w-[600px] h-[400px] bg-npPink/10 blur-[120px] rounded-full animate-float mix-blend-screen" style={{ animationDelay: '0s' }} />
      <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-npTeal/10 blur-[120px] rounded-full animate-float mix-blend-screen" style={{ animationDelay: '2s' }} />
      
      {/* Decorative Fans */}
      <FanSVG className="absolute -top-10 -left-10 w-96 h-96 text-npPink opacity-10 rotate-[135deg]" />
      <FanSVG className="absolute -bottom-10 -right-10 w-96 h-96 text-npTeal opacity-10 rotate-[-45deg]" />

      {/* Floating Particles */}
      {mounted && (
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-20"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${4 + Math.random() * 6}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      )}
      
      {/* Radial Center Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#050818_100%)] opacity-60 mix-blend-multiply" />
    </div>
  );
}
