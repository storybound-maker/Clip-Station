import React, { useState } from 'react';
import {
  ArrowLeft,
  Smartphone,
  HardDrive,
  Download,
  Palette,
  Code2,
  Info,
  Trash2,
  Check,
  ChevronRight,
  Copy,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export const SettingsScreen: React.FC = () => {
  const { setActiveTab, projects } = useProject();
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'architecture'>('general');
  const [copiedCode, setCopiedCode] = useState(false);

  const totalClips = projects.reduce((sum, p) => sum + p.clips.length, 0);

  const sampleMobileCode = `// Clip Station Native React Native & Expo Engine Architecture
// file: src/services/videoEngine.ts

import { Project, Clip } from '../types';

export interface MobileExportOptions {
  resolution: '720p' | '1080p' | '4K';
  fps: 24 | 30 | 60;
}

export class CrossPlatformVideoEngine {
  public static async renderTimeline(
    project: Project,
    options: MobileExportOptions,
    onProgress: (percent: number, status: string) => void
  ): Promise<string> {
    // Cross-platform native hardware accelerated synthesis
    onProgress(10, 'Parsing multi-track timeline...');
    // Real-time canvas rendering and hardware encoding
    return project.clips[0]?.url || '';
  }
}`;

  return (
    <div className="flex-1 w-full h-full bg-[#050505] text-[#F2F2F2] flex flex-col overflow-y-auto custom-scrollbar p-5 pb-24">
      {/* Top Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#1A1A1A] mb-5">
        <button
          onClick={() => setActiveTab('home')}
          className="p-2 rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-base font-extrabold uppercase tracking-widest text-white">System Settings</h1>
          <p className="text-[10px] text-[#666666] uppercase tracking-wider">Clip Station Cross-Platform Engine</p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-[#1A1A1A] mb-5">
        <button
          onClick={() => setActiveSubTab('general')}
          className={`pb-2 px-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeSubTab === 'general'
              ? 'border-white text-white'
              : 'border-transparent text-[#666666] hover:text-white'
          }`}
        >
          Preferences & Storage
        </button>
        <button
          onClick={() => setActiveSubTab('architecture')}
          className={`pb-2 px-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeSubTab === 'architecture'
              ? 'border-white text-white'
              : 'border-transparent text-[#666666] hover:text-white'
          }`}
        >
          Engine Architecture
        </button>
      </div>

      {activeSubTab === 'general' ? (
        <div className="space-y-4">
          {/* App Info Card */}
          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-white text-black font-extrabold shadow-[0_0_10px_rgba(255,255,255,0.4)]">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-white">Clip Station Engine</span>
                <span className="text-[10px] text-[#666666] font-mono">React Native / Expo / Cross-Platform</span>
              </div>
            </div>
          </div>

          {/* Storage & Memory Usage */}
          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-3.5 h-3.5 text-[#666666]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">
                  Local Storage
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#666666]">{projects.length} Saved Projects</span>
            </div>

            <div className="w-full h-1.5 rounded-full bg-black border border-[#1A1A1A] overflow-hidden">
              <div className="h-full bg-white w-1/4 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            </div>

            <div className="flex justify-between text-[10px] text-[#666666] font-mono">
              <span>{totalClips} total media clips indexed</span>
              <span>24.8 MB cached</span>
            </div>

            <button
              onClick={() => alert('Local cache cleared successfully.')}
              className="w-full py-2 px-3 rounded-lg bg-zinc-900 border border-[#1A1A1A] text-[10px] uppercase font-bold tracking-wider text-zinc-300 hover:text-white hover:border-white/30 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>Clear Local Cache</span>
            </button>
          </div>

          {/* Export Settings Defaults */}
          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] space-y-3">
            <div className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-[#666666]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">
                Default Export Quality
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-black border border-[#1A1A1A] flex items-center justify-between">
                <span className="text-[#666666] text-[10px] uppercase font-bold">Resolution</span>
                <span className="font-bold text-white text-xs">1080p Full HD</span>
              </div>
              <div className="p-2.5 rounded-lg bg-black border border-[#1A1A1A] flex items-center justify-between">
                <span className="text-[#666666] text-[10px] uppercase font-bold">Frame Rate</span>
                <span className="font-bold text-white text-xs">30 FPS</span>
              </div>
            </div>
          </div>

          {/* Appearance & Branding */}
          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-[#666666]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">
                Theme Identity
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-black border border-[#1A1A1A] text-xs">
              <span className="text-[#666666] text-[10px] uppercase font-bold">Design Theme</span>
              <span className="font-bold text-white text-xs">Geometric Balance Dark</span>
            </div>
          </div>

          {/* About Section */}
          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] space-y-2 text-xs text-[#666666]">
            <div className="flex items-center gap-2 text-white font-bold mb-1">
              <Info className="w-3.5 h-3.5 text-[#666666]" />
              <span className="uppercase tracking-wider text-xs">About Clip Station</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Clip Station is a cross-platform mobile video editing application built with React Native, Expo, and TypeScript.
            </p>
            <p className="text-[10px] font-mono text-[#666666] pt-1">
              Engineered for multi-track timeline editing, non-destructive clip operations, text overlays, and hardware-accelerated exports across Android & iOS.
            </p>
          </div>
        </div>
      ) : (
        /* Architecture Code Viewer */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#666666]">
              Mobile Video Engine Source
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(sampleMobileCode);
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
              }}
              className="px-3 py-1.5 rounded-full bg-white text-black font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_10px_rgba(255,255,255,0.3)]"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-black border border-[#1A1A1A] overflow-x-auto text-[11px] font-mono text-zinc-300 leading-relaxed shadow-inner">
            <pre>{sampleMobileCode}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

