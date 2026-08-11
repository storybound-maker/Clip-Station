import React, { useState } from 'react';
import { ArrowLeft, Check, Plus, Film, Image as ImageIcon, ShieldCheck, Sparkles, X, Layers } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { SAMPLE_MEDIA_LIBRARY } from '../../data/sampleMedia';
import { AspectRatio } from '../../types';
import { MediaPickerService } from '../../services/mediaPicker';

export const NewProjectScreen: React.FC = () => {
  const { createProject, setActiveTab, permissionsGranted, setPermissionsGranted } = useProject();

  const [projectName, setProjectName] = useState('New Clip Station Project');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [activeTab, setActiveTabMedia] = useState<'sample' | 'upload'>('sample');

  // Selected media queue
  const [selectedMedia, setSelectedMedia] = useState<
    Array<{
      id: string;
      name: string;
      type: 'video' | 'image';
      url: string;
      thumbnail: string;
      duration: number;
    }>
  >([
    {
      id: SAMPLE_MEDIA_LIBRARY[0].id,
      name: SAMPLE_MEDIA_LIBRARY[0].name,
      type: SAMPLE_MEDIA_LIBRARY[0].type,
      url: SAMPLE_MEDIA_LIBRARY[0].url,
      thumbnail: SAMPLE_MEDIA_LIBRARY[0].thumbnail,
      duration: SAMPLE_MEDIA_LIBRARY[0].duration,
    },
  ]);

  const [showPermissionDialog, setShowPermissionDialog] = useState(!permissionsGranted);

  const toggleMediaSelection = (item: {
    id: string;
    name: string;
    type: 'video' | 'image';
    url: string;
    thumbnail: string;
    duration: number;
  }) => {
    setSelectedMedia((prev) => {
      const exists = prev.some((m) => m.id === item.id);
      if (exists) {
        return prev.filter((m) => m.id !== item.id);
      }
      return [...prev, item];
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files: File[] = Array.from(e.target.files);
    for (const file of files) {
      const meta = await MediaPickerService.extractMediaMetadata(file);
      setSelectedMedia((prev) => [
        ...prev,
        {
          id: meta.id,
          name: meta.name,
          type: meta.type,
          url: meta.uri,
          thumbnail: meta.thumbnail || meta.uri,
          duration: meta.duration,
        },
      ]);
    }
  };

  const handlePickFromDevice = async () => {
    const picked = await MediaPickerService.pickMediaFromFiles('all');
    if (picked && picked.length > 0) {
      setSelectedMedia((prev) => [
        ...prev,
        ...picked.map((meta) => ({
          id: meta.id,
          name: meta.name,
          type: meta.type,
          url: meta.uri,
          thumbnail: meta.thumbnail || meta.uri,
          duration: meta.duration,
        })),
      ]);
    }
  };

  const handleCreate = () => {
    if (selectedMedia.length === 0) {
      alert('Please select at least one video or image file.');
      return;
    }

    createProject(projectName, aspectRatio, selectedMedia);
  };

  return (
    <div className="flex-1 w-full h-full bg-[#050505] text-[#F2F2F2] flex flex-col overflow-y-auto custom-scrollbar p-5 pb-24">
      <div className="w-full max-w-5xl mx-auto flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1A1A1A] mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('home')}
            className="p-2 rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-base font-extrabold uppercase tracking-widest text-white">New Timeline</h1>
        </div>

        <button
          onClick={handleCreate}
          disabled={selectedMedia.length === 0}
          className="px-4 py-1.5 rounded-full bg-white text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(255,255,255,0.4)] disabled:opacity-40 disabled:shadow-none hover:shadow-[0_0_25px_rgba(255,255,255,0.6)]"
        >
          Create ({selectedMedia.length})
        </button>
      </div>

      {/* Permission Banner if not granted */}
      {showPermissionDialog && (
        <div className="mb-4 p-4 rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] flex items-start justify-between gap-3 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-white/10 text-white shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs font-bold text-white uppercase tracking-wider">Storage Permission</span>
              <p className="text-[10px] text-[#666666] mt-0.5">
                Clip Station requires access to your local videos and photos for importing and exporting.
              </p>
              <button
                onClick={() => {
                  setPermissionsGranted(true);
                  setShowPermissionDialog(false);
                }}
                className="mt-2 text-xs font-extrabold text-white underline uppercase tracking-wider"
              >
                Grant Mobile Permission
              </button>
            </div>
          </div>
          <button onClick={() => setShowPermissionDialog(false)} className="text-[#666666] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Project Name & Canvas Aspect Ratio Setup */}
      <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] mb-5 space-y-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#666666] mb-1.5">
            Project Title
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full px-3.5 py-2 rounded-lg bg-black border border-[#1A1A1A] text-xs text-white font-bold focus:outline-none focus:border-white/30"
            placeholder="Name your project"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#666666] mb-2">
            Canvas Format
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(
              [
                { id: '9:16', label: '9:16 Shorts' },
                { id: '16:9', label: '16:9 Cinema' },
                { id: '1:1', label: '1:1 Square' },
                { id: '4:5', label: '4:5 Post' },
              ] as const
            ).map((aspect) => (
              <button
                key={aspect.id}
                onClick={() => setAspectRatio(aspect.id)}
                className={`py-2 px-1 rounded-lg text-[10px] uppercase tracking-wider font-bold flex flex-col items-center justify-center gap-1 border transition-all ${
                  aspectRatio === aspect.id
                    ? 'bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.3)]'
                    : 'bg-black text-[#666666] border-[#1A1A1A] hover:border-white/20'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{aspect.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Media Queue Banner */}
      {selectedMedia.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#666666]">
              Import Queue ({selectedMedia.length} clips)
            </span>
            <button
              onClick={() => setSelectedMedia([])}
              className="text-[10px] text-[#666666] hover:text-white uppercase font-bold tracking-wider"
            >
              Clear all
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
            {selectedMedia.map((m, index) => (
              <div
                key={`${m.id}_${index}`}
                className="relative w-14 h-14 rounded-lg bg-black border border-[#1A1A1A] overflow-hidden shrink-0 group"
              >
                <img src={m.thumbnail} alt={m.name} className="w-full h-full object-cover" />
                <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-black/80 text-[9px] font-bold text-white flex items-center justify-center">
                  {index + 1}
                </div>
                <button
                  onClick={() =>
                    setSelectedMedia((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Media Selection Source Tabs */}
      <div className="flex border-b border-[#1A1A1A] mb-4">
        <button
          onClick={() => setActiveTabMedia('sample')}
          className={`pb-2 px-4 text-xs uppercase tracking-wider font-bold transition-colors border-b-2 ${
            activeTab === 'sample'
              ? 'border-white text-white'
              : 'border-transparent text-[#666666] hover:text-white'
          }`}
        >
          Sample Clips
        </button>
        <button
          onClick={() => setActiveTabMedia('upload')}
          className={`pb-2 px-4 text-xs uppercase tracking-wider font-bold transition-colors border-b-2 ${
            activeTab === 'upload'
              ? 'border-white text-white'
              : 'border-transparent text-[#666666] hover:text-white'
          }`}
        >
          Device Gallery
        </button>
      </div>

      {activeTab === 'sample' ? (
        <div className="grid grid-cols-2 gap-3">
          {SAMPLE_MEDIA_LIBRARY.map((item) => {
            const isSelected = selectedMedia.some((m) => m.id === item.id);
            return (
              <div
                key={item.id}
                onClick={() =>
                  toggleMediaSelection({
                    id: item.id,
                    name: item.name,
                    type: item.type,
                    url: item.url,
                    thumbnail: item.thumbnail,
                    duration: item.duration,
                  })
                }
                className={`relative rounded-xl overflow-hidden bg-[#0A0A0A] border cursor-pointer group transition-all ${
                  isSelected
                    ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                    : 'border-[#1A1A1A] hover:border-white/30'
                }`}
              >
                <div className="relative aspect-video bg-black border-b border-[#1A1A1A]">
                  <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/70 border border-[#1A1A1A] flex items-center justify-center">
                    {isSelected ? (
                      <Check className="w-3 h-3 text-white stroke-[3]" />
                    ) : (
                      <Plus className="w-3 h-3 text-[#666666] group-hover:text-white" />
                    )}
                  </div>

                  <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[9px] text-zinc-300 font-mono flex items-center gap-1">
                    {item.type === 'video' ? <Film className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                    <span>{item.duration}s</span>
                  </div>
                </div>

                <div className="p-2.5">
                  <span className="block text-xs font-bold text-white truncate">{item.name}</span>
                  <span className="text-[10px] text-[#666666] uppercase tracking-wider">{item.category}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 border border-dashed border-[#1A1A1A] rounded-xl text-center bg-[#0A0A0A] flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-[#1A1A1A] flex items-center justify-center text-white mb-3">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-white mb-1">Upload Device Media</span>
          <p className="text-[10px] text-[#666666] max-w-xs mb-4">
            Select videos or images directly from your mobile device media storage.
          </p>

          <label className="px-4 py-2 rounded-full bg-white text-black font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:shadow-[0_0_25px_rgba(255,255,255,0.6)] transition-all">
            Browse Files
            <input
              type="file"
              accept="video/*,image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}
      </div>
    </div>
  );
};

