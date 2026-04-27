'use client'

import React, { useEffect } from 'react'

export function SquidHorrorTheme() {
  useEffect(() => {
    // --- Audio System ---
    let audioCtx: AudioContext | null = null;
    
    const initAudio = () => {
      if (audioCtx) return;
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    };

    const playEerieTone = () => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 1.5);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.5);
    };

    const playBeep = () => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    };

    const playHum = () => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    };

    // --- Interaction Listeners ---
    const handleFirstClick = () => {
      initAudio();
      playEerieTone();
      document.removeEventListener('click', handleFirstClick);
    };

    const handleBtnHover = (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).tagName === 'A') {
        initAudio();
        playHum();
      }
    };

    document.addEventListener('click', handleFirstClick);
    document.addEventListener('mouseover', handleBtnHover, { passive: true });

    // --- Timers & Events ---
    const dollInterval = setInterval(() => {
      document.body.classList.add('doll-active');
      playBeep();
      setTimeout(() => document.body.classList.remove('doll-active'), 2000);
    }, 15000);

    const redLightInterval = setInterval(() => {
      const overlay = document.createElement('div');
      overlay.className = 'red-light-event';
      overlay.innerHTML = '<span>RED LIGHT</span>';
      document.body.appendChild(overlay);
      document.body.classList.add('red-light-paused');
      
      setTimeout(() => {
        overlay.classList.add('fade-out');
        setTimeout(() => {
          overlay.remove();
          document.body.classList.remove('red-light-paused');
        }, 500);
      }, 1000);
    }, 20000);

    // Decorative Timer
    let seconds = 599;
    const timerEl = document.getElementById('squid-countdown');
    const timerInterval = setInterval(() => {
      seconds--;
      if (seconds < 0) seconds = 599;
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      if (timerEl) timerEl.innerText = `0${m}:${s < 10 ? '0' : ''}${s}`;
    }, 1000);

    return () => {
      document.removeEventListener('click', handleFirstClick);
      document.removeEventListener('mouseover', handleBtnHover);
      clearInterval(dollInterval);
      clearInterval(redLightInterval);
      clearInterval(timerInterval);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --squid-pink: #ed1b76;
          --squid-red: #8B0000;
        }

        /* 1. Background & Atmosphere */
        body::before {
          content: "";
          fixed: top 0 left 0;
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(circle at center, var(--squid-red) 0%, #000 100%);
          opacity: 0.8;
          z-index: -2;
          pointer-events: none;
        }

        body::after {
          content: "";
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.05;
          z-index: 9999;
          pointer-events: none;
          mix-blend-mode: overlay;
        }

        body {
          animation: flicker 5s infinite;
          cursor: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 2L2 22L22 22L12 2Z' fill='none' stroke='%23ed1b76' stroke-width='2'/%3E%3C/svg%3E"), crosshair !important;
        }

        @keyframes flicker {
          0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; filter: brightness(1); }
          20%, 24%, 55% { opacity: 0.9; filter: brightness(0.8); }
        }

        /* 2. Guards */
        .squid-guard {
          position: fixed;
          bottom: -20px;
          width: 120px;
          height: 200px;
          z-index: 1000;
          pointer-events: none;
          animation: guard-sway 4s ease-in-out infinite;
        }
        .guard-left { left: 20px; }
        .guard-right { right: 20px; animation-delay: -2s; }
        .guard-flip { animation: guard-turn 10s step-end infinite; }

        @keyframes guard-sway {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        @keyframes guard-turn {
          0%, 80% { transform: scaleX(1); }
          81%, 90% { transform: scaleX(-1); }
        }

        /* 3. The Doll */
        .squid-doll {
          position: fixed;
          bottom: 20px;
          right: 140px;
          font-size: 60px;
          z-index: 1001;
          filter: drop-shadow(0 0 10px rgba(0,0,0,0.5));
          transition: all 0.5s ease;
        }
        .doll-active .squid-doll {
          transform: rotate(180deg) scale(1.2);
          filter: drop-shadow(0 0 20px #ff0000);
        }
        .doll-active::before {
          content: "";
          position: fixed;
          inset: 0;
          background: radial-gradient(circle at 85% 85%, rgba(255,0,0,0.3) 0%, transparent 50%);
          z-index: 1000;
          pointer-events: none;
          animation: spotlight 0.2s infinite;
        }

        @keyframes spotlight {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* 4. Floating Shapes */
        .squid-shape {
          position: fixed;
          color: var(--squid-pink);
          opacity: 0.2;
          z-index: -1;
          pointer-events: none;
          animation: float 20s linear infinite;
        }

        @keyframes float {
          0% { transform: translate(0, 110vh) rotate(0deg); }
          100% { transform: translate(100px, -10vh) rotate(360deg); }
        }

        /* 5. Typography */
        h1, h2, h3, h4, .font-bold {
          font-family: 'Courier New', Courier, monospace !important;
          text-shadow: 0 0 10px #ff0000, 0 0 20px var(--squid-red) !important;
          color: #fff !important;
          position: relative;
        }
        h1::after {
          content: "살아남아라";
          display: block;
          font-size: 0.4em;
          color: var(--squid-pink);
          opacity: 0.6;
          letter-spacing: 4px;
          margin-top: 4px;
        }

        /* Buttons */
        button, .h-btn {
          position: relative;
          overflow: hidden;
          transition: all 0.3s !important;
        }
        button:hover, .h-btn:hover {
          background: var(--squid-red) !important;
          color: #fff !important;
          box-shadow: 0 0 15px var(--squid-red) !important;
        }
        button:hover::after {
          content: "";
          position: absolute;
          top: -100%; left: 50%;
          width: 2px; height: 100%;
          background: #ff0000;
          animation: drip 0.5s forwards;
        }
        @keyframes drip {
          to { top: 100%; }
        }

        /* 7. Red Light Event */
        .red-light-event {
          position: fixed;
          inset: 0;
          background: rgba(255,0,0,0.4);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 80px;
          font-weight: 900;
          letter-spacing: 10px;
          transition: opacity 0.5s;
        }
        .red-light-event.fade-out { opacity: 0; }
        .red-light-paused * {
          animation-play-state: paused !important;
        }

        /* Countdown */
        .squid-timer {
          position: fixed;
          top: 20px;
          right: 20px;
          font-family: monospace;
          font-size: 24px;
          color: #fff;
          background: rgba(0,0,0,0.8);
          padding: 5px 15px;
          border: 2px solid var(--squid-pink);
          border-radius: 4px;
          box-shadow: 0 0 10px var(--squid-pink);
          z-index: 1000;
        }
      `}} />

      {/* Visual Elements */}
      <div id="squid-countdown" className="squid-timer">09:59</div>
      
      {/* Guards (SVG Silhouettes) */}
      <div className="squid-guard guard-left">
        <svg viewBox="0 0 100 200" width="100%" height="100%">
          <path d="M50,10 C30,10 20,30 20,50 L20,150 L80,150 L80,50 C80,30 70,10 50,10" fill="#ed1b76" />
          <circle cx="50" cy="45" r="25" fill="#000" />
          <rect x="40" y="35" width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" />
        </svg>
      </div>
      <div className="squid-guard guard-right guard-flip">
        <svg viewBox="0 0 100 200" width="100%" height="100%">
          <path d="M50,10 C30,10 20,30 20,50 L20,150 L80,150 L80,50 C80,30 70,10 50,10" fill="#ed1b76" />
          <circle cx="50" cy="45" r="25" fill="#000" />
          <circle cx="50" cy="45" r="8" fill="none" stroke="#fff" strokeWidth="2" />
        </svg>
      </div>

      <div className="squid-doll">🪆</div>

      {/* Floating Shapes */}
      {[...Array(8)].map((_, i) => (
        <div 
          key={i} 
          className="squid-shape"
          style={{ 
            left: `${Math.random() * 100}vw`, 
            animationDelay: `${Math.random() * 20}s`,
            fontSize: `${20 + Math.random() * 40}px`
          }}
        >
          {['○', '△', '□'][i % 3]}
        </div>
      ))}
    </>
  )
}
