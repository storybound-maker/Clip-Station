import React, { useState } from 'react';
import { Search, FolderOpen, MoreVertical, Play, Copy, Trash2, Edit2, Plus, ArrowLeft } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { formatTime } from '../../utils/mediaEngine';

export const ProjectsScreen: React.FC = () => {
  const { projects, selectProject, setActiveTab, deleteProject, duplicateProject, updateProject } = useProject();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'drafts' | 'recent'>('all');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedFilter === 'drafts') return matchesSearch && p.isDraft;
    return matchesSearch;
  });

  const handleRenameSubmit = (projId: string) => {
    const proj = projects.find((p) => p.id === projId);
    if (proj && editingName.trim()) {
      updateProject({ ...proj, name: editingName.trim() });
    }
    setEditingId(null);
  };

  return (
    <div className="flex-1 w-full h-full bg-[#050505] text-[#F2F2F2] flex flex-col overflow-y-auto custom-scrollbar p-5 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1A1A1A] mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('home')}
            className="p-2 rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-extrabold uppercase tracking-widest text-white">Project Library</h1>
            <p className="text-[10px] text-[#666666] uppercase tracking-wider">{projects.length} saved timelines</p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('new_project')}
          className="px-3.5 py-1.5 rounded-full bg-white text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:shadow-[0_0_25px_rgba(255,255,255,0.6)]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#666666]" />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] text-xs text-white placeholder-[#666666] focus:outline-none focus:border-white/30 transition-colors"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-3 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider transition-all ${
            selectedFilter === 'all'
              ? 'bg-white text-black font-bold shadow-[0_0_10px_rgba(255,255,255,0.3)]'
              : 'bg-[#0A0A0A] border border-[#1A1A1A] text-[#666666] hover:text-white'
          }`}
        >
          All ({projects.length})
        </button>
        <button
          onClick={() => setSelectedFilter('drafts')}
          className={`px-3 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider transition-all ${
            selectedFilter === 'drafts'
              ? 'bg-white text-black font-bold shadow-[0_0_10px_rgba(255,255,255,0.3)]'
              : 'bg-[#0A0A0A] border border-[#1A1A1A] text-[#666666] hover:text-white'
          }`}
        >
          Drafts ({projects.filter((p) => p.isDraft).length})
        </button>
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 border border-dashed border-[#1A1A1A] rounded-xl text-center">
          <FolderOpen className="w-8 h-8 text-[#666666] mb-2" />
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">No Projects Found</p>
          <p className="text-[10px] text-[#666666] mb-4">
            {searchQuery ? 'Try another search term.' : 'Create your first video project to get started.'}
          </p>
          <button
            onClick={() => setActiveTab('new_project')}
            className="px-4 py-2 rounded-full bg-white text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(255,255,255,0.4)]"
          >
            Create New Project
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="relative p-3 rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] hover:border-white/30 flex items-center justify-between gap-3 transition-all group"
            >
              {/* Clickable Card Body */}
              <div
                onClick={() => {
                  selectProject(proj.id);
                  setActiveTab('editor');
                }}
                className="flex items-center gap-3 overflow-hidden flex-1 cursor-pointer"
              >
                <div className="relative w-16 h-12 rounded-lg bg-black overflow-hidden shrink-0 border border-[#1A1A1A]">
                  <img
                    src={proj.thumbnail}
                    alt={proj.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                    <Play className="w-4 h-4 text-white fill-white" />
                  </div>
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  {editingId === proj.id ? (
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(proj.id)}
                        className="px-2 py-1 rounded bg-black text-xs text-white border border-[#1A1A1A] focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleRenameSubmit(proj.id)}
                        className="px-2 py-1 rounded bg-white text-black text-[10px] font-bold"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-white truncate group-hover:text-zinc-200">
                      {proj.name}
                    </span>
                  )}

                  <div className="flex items-center gap-2 text-[10px] text-[#666666] font-mono mt-0.5">
                    <span>{formatTime(proj.duration, false)}</span>
                    <span>•</span>
                    <span>{proj.clips.length} clips</span>
                    <span>•</span>
                    <span className="uppercase text-[9px] font-bold px-1 rounded bg-zinc-900 border border-[#1A1A1A]">
                      {proj.aspectRatio}
                    </span>
                  </div>
                </div>
              </div>

              {/* Context Actions Menu Trigger */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenId(menuOpenId === proj.id ? null : proj.id);
                  }}
                  className="p-1.5 rounded-lg text-[#666666] hover:text-white hover:bg-zinc-900"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {menuOpenId === proj.id && (
                  <div
                    className="absolute right-0 top-9 w-36 rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] shadow-2xl z-50 p-1 flex flex-col text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        setEditingId(proj.id);
                        setEditingName(proj.name);
                        setMenuOpenId(null);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900 text-left"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Rename</span>
                    </button>

                    <button
                      onClick={() => {
                        duplicateProject(proj.id);
                        setMenuOpenId(null);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900 text-left"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Duplicate</span>
                    </button>

                    <button
                      onClick={() => {
                        deleteProject(proj.id);
                        setMenuOpenId(null);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-left"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

