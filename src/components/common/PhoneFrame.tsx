import React from 'react';
import { Wifi, Battery, Smartphone, Maximize2 } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

interface PhoneFrameProps {
  children: React.ReactNode;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  const { phoneFrameMode, setPhoneFrameMode } = useProject();

  const currentTimeStr = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  if (!phoneFrameMode) {
    return (
      <div className="relative w-full h-full min-h-screen bg-[#050505] text-[#F2F2F2] flex flex-col font-sans selection:bg-white selection:text-black">
        {/* Floating Mobile View Mode Toggle */}
        <div className="absolute top-3 right-4 z-50">
          <button
            onClick={() => setPhoneFrameMode(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0A0A0A] border border-[#1A1A1A] text-xs font-semibold text-zinc-300 hover:text-white hover:border-white/30 shadow-[0_0_12px_rgba(255,255,255,0.1)] transition-all"
            title="Switch to Mobile Phone Frame View"
          >
            <Smartphone className="w-3.5 h-3.5 text-white" />
            <span className="uppercase tracking-wider text-[10px] font-bold">Mobile View</span>
          </button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#050505] flex items-center justify-center p-2 sm:p-4 md:p-6 select-none font-sans overflow-x-hidden">
      {/* Background Ambient Radial Glow */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/30 via-black to-black pointer-events-none" />

      {/* Mobile Device Shell */}
      <div className="relative w-full max-w-[500px] sm:max-w-[580px] md:max-w-[640px] h-[92vh] max-h-[920px] bg-[#0A0A0A] rounded-[36px] sm:rounded-[44px] border-[4px] sm:border-[5px] border-[#1A1A1A] shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_20px_rgba(255,255,255,0.05)] flex flex-col overflow-hidden transition-all duration-300">
        
        {/* Device Outer Glow Highlight */}
        <div className="absolute -inset-[1px] rounded-[44px] border border-white/10 pointer-events-none z-50" />

        {/* Top Mobile Status Bar */}
        <div className="w-full h-10 px-6 bg-[#0A0A0A] border-b border-[#1A1A1A]/50 flex items-center justify-between z-40 text-[11px] font-mono text-zinc-400 shrink-0 select-none">
          {/* Time */}
          <span className="text-zinc-200 font-semibold tracking-tight">
            {currentTimeStr}
          </span>

          {/* Camera Hole Punch */}
          <div className="w-4 h-4 rounded-full bg-black border border-[#1A1A1A] shadow-inner flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
          </div>

          {/* Indicators */}
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="text-[9px] font-bold tracking-wider text-zinc-300">5G</span>
            <Wifi className="w-3.5 h-3.5 text-zinc-300" />
            <Battery className="w-4 h-4 text-zinc-300 rotate-90" />
          </div>
        </div>

        {/* Phone Content Screen */}
        <div className="flex-1 relative w-full h-full bg-[#050505] flex flex-col overflow-hidden">
          {children}
        </div>

        {/* Gesture Navigation Bar */}
        <div className="w-full h-5 bg-[#0A0A0A] border-t border-[#1A1A1A]/30 flex items-center justify-center shrink-0 z-40">
          <div className="w-28 h-1 bg-zinc-700 rounded-full" />
        </div>

        {/* Fullscreen Toggle Control */}
        <button
          onClick={() => setPhoneFrameMode(false)}
          className="absolute top-11 right-3 z-50 w-7 h-7 rounded-full bg-black/70 border border-[#1A1A1A] flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/40 transition-all backdrop-blur-md"
          title="Expand to Desktop View"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

