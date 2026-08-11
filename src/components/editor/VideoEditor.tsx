import React from 'react';
import { ArrowLeft, Undo2, Redo2, Download } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { VideoPreview } from './VideoPreview';
import { Timeline } from './Timeline';
import { EditingToolbar } from './EditingToolbar';

export const VideoEditor: React.FC = () => {
  const {
    activeProject,
    setActiveTab,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useProject();

  if (!activeProject) {
    return (
      <div className="flex-1 w-full h-full bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-[#666666] mb-4">No project active.</p>
        <button
          onClick={() => setActiveTab('home')}
          className="px-4 py-2 rounded-full bg-white text-black font-extrabold text-xs uppercase tracking-wider"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-full bg-[#050505] text-[#F2F2F2] flex flex-col overflow-hidden select-none pb-16">
      {/* Editor Top Navigation Bar */}
      <div className="w-full h-12 px-4 bg-[#0A0A0A] border-b border-[#1A1A1A] flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('home')}
            className="p-1.5 rounded-lg bg-[#0A0A0A] border border-[#1A1A1A] text-zinc-400 hover:text-white"
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex flex-col">
            <span className="text-xs font-extrabold text-white truncate max-w-[140px]">
              {activeProject.name}
            </span>
            <span className="text-[9px] text-[#666666] uppercase font-mono tracking-wider">
              {activeProject.aspectRatio} Canvas
            </span>
          </div>
        </div>

        {/* Undo / Redo / Export Controls */}
        <div className="flex items-center gap-1.5">
          {/* Undo */}
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg bg-zinc-900 border border-[#1A1A1A] text-zinc-300 disabled:opacity-30 disabled:border-[#1A1A1A] hover:text-white transition-all min-w-[36px] min-h-[36px] flex items-center justify-center"
            title="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>

          {/* Redo */}
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg bg-zinc-900 border border-[#1A1A1A] text-zinc-300 disabled:opacity-30 disabled:border-[#1A1A1A] hover:text-white transition-all min-w-[36px] min-h-[36px] flex items-center justify-center"
            title="Redo"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          {/* Export Video Button */}
          <button
            onClick={() => setActiveTab('export')}
            className="px-3 py-1.5 rounded-full bg-white text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,255,255,0.4)] hover:shadow-[0_0_20px_rgba(255,255,255,0.6)] transition-all cursor-pointer ml-1 min-h-[36px]"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Editor Content Body */}
      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
        {/* Video Canvas Preview */}
        <VideoPreview />

        {/* Multi-Track Timeline */}
        <Timeline />

        {/* Editing Tools Bar */}
        <EditingToolbar />
      </div>
    </div>
  );
};

