import React, { useEffect, useState } from 'react';
import { Film, Play, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      const finishTimer = setTimeout(() => {
        onFinish();
      }, 500); // Wait for transition
      return () => clearTimeout(finishTimer);
    }, 1200); // Display duration

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#050505] flex flex-col items-center justify-center transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-6 px-6 text-center max-w-xs">
        {/* Geometric Balance Logo Container */}
        <div className="relative flex items-center justify-center">
          {/* Outer Pulsing Subtle Ring */}
          <div className="absolute w-24 h-24 rounded-2xl border border-white/20 animate-ping opacity-20" />
          <div className="absolute w-20 h-20 rounded-2xl border border-white/40 animate-pulse" />

          {/* Main Logo Card */}
          <div className="w-16 h-16 rounded-2xl bg-[#0A0A0A] border border-[#1A1A1A] flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] relative z-10">
            <div className="relative">
              <Film className="w-8 h-8 text-white stroke-[1.5]" />
              <Play className="w-3.5 h-3.5 text-black fill-white absolute -bottom-0.5 -right-0.5" />
            </div>
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="flex flex-col items-center gap-1.5">
          <h1 className="text-2xl font-extrabold tracking-wider text-white uppercase font-sans">
            CLIP STATION
          </h1>
          <p className="text-[11px] font-mono tracking-widest text-zinc-500 uppercase">
            Mobile Video Studio
          </p>
        </div>

        {/* Loading Indicator Bar */}
        <div className="w-36 h-1 bg-[#1A1A1A] rounded-full overflow-hidden relative mt-2">
          <div className="h-full bg-white rounded-full animate-[loading_1.2s_ease-in-out_infinite]" />
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-mono tracking-wide mt-2">
          <Sparkles className="w-3 h-3 text-zinc-500 animate-spin" />
          <span>INITIALIZING ENGINE</span>
        </div>
      </div>
    </div>
  );
};
