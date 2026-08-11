import React from 'react';
import { Plus, Video, Film, Settings, Clock, Sparkles, FolderOpen, ChevronRight, Play } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { HeaderLogo } from '../common/HeaderLogo';
import { formatTime } from '../../utils/mediaEngine';

export const HomeScreen: React.FC = () => {
  const { projects, selectProject, setActiveTab } = useProject();

  const recentProjects = projects.filter((p) => !p.isDraft).slice(0, 5);
  const draftProjects = projects.filter((p) => p.isDraft);

  return (
    <div className="flex-1 w-full h-full bg-[#050505] text-[#F2F2F2] flex flex-col overflow-y-auto custom-scrollbar p-5 pb-24">
      <div className="w-full max-w-5xl mx-auto flex flex-col">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-2 pb-5 border-b border-[#1A1A1A]">
        <HeaderLogo size="md" subtitle="Cross-Platform Engine" />
        <button
          onClick={() => setActiveTab('settings')}
          className="p-2.5 rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] text-zinc-400 hover:text-white hover:border-white/30 transition-all active:scale-95"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Hero Welcome Banner */}
      <div className="relative mt-5 mb-5 p-5 rounded-2xl bg-[#0A0A0A] border border-[#1A1A1A] shadow-lg overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 border border-white/10 text-[10px] uppercase tracking-wider font-bold text-white mb-3">
            <Sparkles className="w-3 h-3 text-white" />
            <span>Geometric Mobile Studio</span>
          </div>

          <h1 className="text-xl font-black tracking-tight text-white mb-1 uppercase">
            Create something iconic.
          </h1>
          <p className="text-xs text-[#666666] leading-relaxed mb-5 max-w-xs font-medium">
            Cross-platform React Native mobile video editing with non-destructive multi-track timeline engine.
          </p>

          {/* Large Glowing New Project Button */}
          <button
            onClick={() => setActiveTab('new_project')}
            className="w-full py-3.5 px-5 rounded-full bg-white text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:shadow-[0_0_25px_rgba(255,255,255,0.6)] active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center">
              <Plus className="w-4 h-4 text-black stroke-[3]" />
            </div>
            <span>New Mobile Project</span>
          </button>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <button
          onClick={() => setActiveTab('new_project')}
          className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] hover:border-white/30 flex flex-col items-start gap-2 group transition-all text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-[#1A1A1A] flex items-center justify-center text-white group-hover:scale-105 transition-transform">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-xs font-bold text-white uppercase tracking-wider">Import Video</span>
            <span className="text-[10px] text-[#666666]">Local media file URIs</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] hover:border-white/30 flex flex-col items-start gap-2 group transition-all text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-[#1A1A1A] flex items-center justify-center text-white group-hover:scale-105 transition-transform">
            <FolderOpen className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-xs font-bold text-white uppercase tracking-wider">All Projects</span>
            <span className="text-[10px] text-[#666666]">{projects.length} saved timelines</span>
          </div>
        </button>
      </div>

      {/* Recent Projects Section */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#666666]" />
            <h2 className="text-[10px] uppercase tracking-widest font-bold text-[#666666]">
              Recent Timelines
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('projects')}
            className="text-[10px] uppercase font-bold text-[#666666] hover:text-white flex items-center gap-0.5"
          >
            <span>View all</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {recentProjects.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-[#1A1A1A] text-center text-[#666666] text-xs">
            No recent projects. Tap New Project to create one!
          </div>
        ) : (
          <div className="space-y-2">
            {recentProjects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => {
                  selectProject(proj.id);
                  setActiveTab('editor');
                }}
                className="p-3 rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] hover:border-white/30 flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-[0.99] group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="relative w-12 h-12 rounded-lg bg-black overflow-hidden shrink-0 border border-[#1A1A1A]">
                    <img
                      src={proj.thumbnail}
                      alt={proj.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-4 h-4 text-white fill-white" />
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white truncate">
                      {proj.name}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-[#666666] mt-0.5 font-mono">
                      <span>{formatTime(proj.duration, false)}</span>
                      <span>•</span>
                      <span>{proj.clips.length} clips</span>
                      <span>•</span>
                      <span className="uppercase text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-900 border border-[#1A1A1A] text-zinc-300">
                        {proj.aspectRatio}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-7 h-7 rounded-full bg-zinc-900 border border-[#1A1A1A] group-hover:bg-white group-hover:text-black flex items-center justify-center text-[#666666] transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drafts Section */}
      {draftProjects.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Film className="w-3.5 h-3.5 text-[#666666]" />
            <h2 className="text-[10px] uppercase tracking-widest font-bold text-[#666666]">
              Drafts ({draftProjects.length})
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {draftProjects.map((draft) => (
              <div
                key={draft.id}
                onClick={() => {
                  selectProject(draft.id);
                  setActiveTab('editor');
                }}
                className="p-3 rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] hover:border-white/30 cursor-pointer flex flex-col gap-2"
              >
                <div className="relative aspect-video rounded-lg bg-black overflow-hidden border border-[#1A1A1A]">
                  <img
                    src={draft.thumbnail}
                    alt={draft.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] text-zinc-300 font-mono">
                    {formatTime(draft.duration, false)}
                  </div>
                </div>
                <span className="text-xs font-bold text-zinc-200 truncate">
                  {draft.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

