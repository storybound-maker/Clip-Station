import React, { useState } from 'react';
import {
  Scissors,
  Split,
  Copy,
  Trash2,
  Gauge,
  Volume2,
  Crop,
  RotateCw,
  Sliders,
  Type,
  Music,
  Smile,
  ArrowLeftRight,
  X,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { ActiveTool } from '../../types';
import { SAMPLE_AUDIO_LIBRARY } from '../../data/sampleMedia';

export const EditingToolbar: React.FC = () => {
  const {
    activeProject,
    activeTool,
    setActiveTool,
    selectedClipId,
    selectedTextLayerId,
    updateClip,
    splitClip,
    deleteClip,
    duplicateClip,
    reorderClips,
    addTextLayer,
    updateTextLayer,
    deleteTextLayer,
    addAudioLayer,
    addStickerLayer,
    deleteStickerLayer,
    currentTime,
  } = useProject();

  const [textInput, setTextInput] = useState('');

  if (!activeProject) return null;

  const selectedClip = activeProject.clips.find((c) => c.id === selectedClipId) || activeProject.clips[0];
  const selectedTextLayer = activeProject.textLayers.find((t) => t.id === selectedTextLayerId);

  const toolsList: Array<{ id: ActiveTool; label: string; icon: React.ReactNode }> = [
    { id: 'trim', label: 'Trim', icon: <Scissors className="w-4 h-4" /> },
    { id: 'split', label: 'Split', icon: <Split className="w-4 h-4" /> },
    { id: 'duplicate', label: 'Duplicate', icon: <Copy className="w-4 h-4" /> },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="w-4 h-4" /> },
    { id: 'speed', label: 'Speed', icon: <Gauge className="w-4 h-4" /> },
    { id: 'volume', label: 'Volume', icon: <Volume2 className="w-4 h-4" /> },
    { id: 'crop', label: 'Crop', icon: <Crop className="w-4 h-4" /> },
    { id: 'rotate', label: 'Rotate', icon: <RotateCw className="w-4 h-4" /> },
    { id: 'adjust', label: 'Adjust', icon: <Sliders className="w-4 h-4" /> },
    { id: 'text', label: 'Text', icon: <Type className="w-4 h-4" /> },
    { id: 'audio', label: 'Audio', icon: <Music className="w-4 h-4" /> },
    { id: 'stickers', label: 'Stickers', icon: <Smile className="w-4 h-4" /> },
    { id: 'reorder', label: 'Reorder', icon: <ArrowLeftRight className="w-4 h-4" /> },
  ];

  const handleToolClick = (toolId: ActiveTool) => {
    if (toolId === 'split' && selectedClip) {
      splitClip(selectedClip.id, currentTime);
      return;
    }

    if (toolId === 'duplicate' && selectedClip) {
      duplicateClip(selectedClip.id);
      return;
    }

    if (toolId === 'delete' && selectedClip) {
      deleteClip(selectedClip.id);
      return;
    }

    if (toolId === 'rotate' && selectedClip) {
      const nextRotation = ((selectedClip.rotation || 0) + 90) % 360;
      updateClip(selectedClip.id, { rotation: nextRotation });
      return;
    }

    setActiveTool(activeTool === toolId ? null : toolId);
  };

  return (
    <div className="w-full bg-[#0A0A0A] border-t border-[#1A1A1A] flex flex-col shrink-0 select-none">
      {/* Selected Clip Context Bar */}
      <div className="px-4 py-1.5 bg-[#080808] border-b border-[#1A1A1A] flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#888888]">
        {selectedClip ? (
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-white truncate max-w-[160px] font-mono">{selectedClip.name}</span>
            <span className="text-[#555555]">|</span>
            <span className="text-zinc-400 font-mono">{((selectedClip.sourceOut - selectedClip.sourceIn) / (selectedClip.speed || 1)).toFixed(1)}s</span>
          </div>
        ) : (
          <span className="text-zinc-500 italic">Select a clip on the timeline to edit</span>
        )}
        {selectedClip && (
          <span className="text-[9px] text-zinc-500 font-mono uppercase">
            {selectedClip.speed || 1}x • {selectedClip.volume ?? 100}% • {selectedClip.rotation || 0}°
          </span>
        )}
      </div>

      {/* Active Tool Sub-Panel / Controls Drawer */}
      {activeTool && (
        <div className="p-3.5 bg-[#050505] border-b border-[#1A1A1A] flex flex-col gap-3 max-h-56 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <span className="capitalize">{activeTool} Tool</span>
            </span>
            <button
              onClick={() => setActiveTool(null)}
              className="p-1.5 text-[#666666] hover:text-white rounded-lg bg-[#0A0A0A] border border-[#1A1A1A] min-w-[36px] min-h-[36px] flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* TRIM TOOL */}
          {activeTool === 'trim' && selectedClip && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-[#666666] text-[10px] uppercase font-mono">
                <span>In: {selectedClip.sourceIn.toFixed(1)}s</span>
                <span className="text-white font-bold">Dur: {((selectedClip.sourceOut - selectedClip.sourceIn) / (selectedClip.speed || 1)).toFixed(1)}s</span>
                <span>Out: {selectedClip.sourceOut.toFixed(1)}s</span>
                <button
                  onClick={() => updateClip(selectedClip.id, { sourceIn: 0, sourceOut: selectedClip.originalDuration })}
                  className="px-2.5 py-1 rounded bg-[#0A0A0A] border border-[#1A1A1A] text-zinc-300 hover:text-white text-[9px] font-bold flex items-center gap-1 min-h-[32px]"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-[#666666] uppercase mb-1">Source In (Start)</label>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(0, selectedClip.sourceOut - 0.5)}
                    step={0.1}
                    value={selectedClip.sourceIn}
                    onChange={(e) => updateClip(selectedClip.id, { sourceIn: parseFloat(e.target.value) })}
                    className="w-full accent-white h-6"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-[#666666] uppercase mb-1">Source Out (End)</label>
                  <input
                    type="range"
                    min={selectedClip.sourceIn + 0.5}
                    max={selectedClip.originalDuration}
                    step={0.1}
                    value={selectedClip.sourceOut}
                    onChange={(e) => updateClip(selectedClip.id, { sourceOut: parseFloat(e.target.value) })}
                    className="w-full accent-white h-6"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SPEED TOOL */}
          {activeTool === 'speed' && selectedClip && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] uppercase text-[#666666] font-mono">
                <span>Playback Speed</span>
                <span className="text-white font-bold">{selectedClip.speed}x</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3].map((s) => (
                  <button
                    key={s}
                    onClick={() => updateClip(selectedClip.id, { speed: s })}
                    className={`min-h-[44px] rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center border ${
                      selectedClip.speed === s
                        ? 'bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                        : 'bg-[#0A0A0A] border-[#1A1A1A] text-[#888888] hover:text-white'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* VOLUME TOOL */}
          {activeTool === 'volume' && selectedClip && (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-[#666666] text-[10px] uppercase font-bold tracking-wider">
                <span>Volume Level</span>
                <span className="font-mono text-white">{selectedClip.volume}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={200}
                value={selectedClip.volume}
                onChange={(e) => updateClip(selectedClip.id, { volume: parseInt(e.target.value) })}
                className="w-full accent-white h-6"
              />
              <div className="grid grid-cols-6 gap-1.5">
                {[0, 25, 50, 75, 100, 150].map((v) => (
                  <button
                    key={v}
                    onClick={() => updateClip(selectedClip.id, { volume: v })}
                    className={`min-h-[40px] rounded-lg text-[10px] font-extrabold uppercase tracking-wider border transition-all flex items-center justify-center ${
                      selectedClip.volume === v
                        ? 'bg-white text-black border-white'
                        : 'bg-[#0A0A0A] border-[#1A1A1A] text-[#888888] hover:text-white'
                    }`}
                  >
                    {v === 0 ? 'Mute' : `${v}%`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CROP TOOL */}
          {activeTool === 'crop' && selectedClip && (
            <div className="space-y-2">
              <span className="block text-[10px] font-bold text-[#666666] uppercase tracking-wider">
                Crop / Aspect Presets
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { ratio: 'free', label: 'Original' },
                  { ratio: '9:16', label: '9:16' },
                  { ratio: '16:9', label: '16:9' },
                  { ratio: '1:1', label: '1:1' },
                  { ratio: '4:5', label: '4:5' },
                ].map((preset) => (
                  <button
                    key={preset.ratio}
                    onClick={() =>
                      updateClip(selectedClip.id, {
                        crop: { ...selectedClip.crop, ratio: preset.ratio as any },
                      })
                    }
                    className={`min-h-[44px] rounded-xl text-xs font-extrabold uppercase tracking-wider border transition-all flex items-center justify-center ${
                      selectedClip.crop?.ratio === preset.ratio
                        ? 'bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                        : 'bg-[#0A0A0A] border-[#1A1A1A] text-[#888888] hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ADJUST / FILTERS TOOL */}
          {activeTool === 'adjust' && selectedClip && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#666666] text-[10px] uppercase font-bold tracking-wider mb-1">
                  Brightness ({selectedClip.filters.brightness})
                </label>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  value={selectedClip.filters.brightness}
                  onChange={(e) =>
                    updateClip(selectedClip.id, {
                      filters: { ...selectedClip.filters, brightness: parseInt(e.target.value) },
                    })
                  }
                  className="w-full accent-white"
                />
              </div>

              <div>
                <label className="block text-[#666666] text-[10px] uppercase font-bold tracking-wider mb-1">
                  Contrast ({selectedClip.filters.contrast})
                </label>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  value={selectedClip.filters.contrast}
                  onChange={(e) =>
                    updateClip(selectedClip.id, {
                      filters: { ...selectedClip.filters, contrast: parseInt(e.target.value) },
                    })
                  }
                  className="w-full accent-white"
                />
              </div>

              <div>
                <label className="block text-[#666666] text-[10px] uppercase font-bold tracking-wider mb-1">
                  Saturation ({selectedClip.filters.saturation})
                </label>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  value={selectedClip.filters.saturation}
                  onChange={(e) =>
                    updateClip(selectedClip.id, {
                      filters: { ...selectedClip.filters, saturation: parseInt(e.target.value) },
                    })
                  }
                  className="w-full accent-white"
                />
              </div>
            </div>
          )}

          {/* TEXT OVERLAY TOOL */}
          {activeTool === 'text' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="ENTER TEXT STRING..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-[#0A0A0A] border border-[#1A1A1A] text-xs text-white placeholder-[#666666] focus:outline-none"
                />
                <button
                  onClick={() => {
                    if (textInput.trim()) {
                      addTextLayer(textInput.trim());
                      setTextInput('');
                    }
                  }}
                  className="px-4 py-2 rounded-full bg-white text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-1 shadow-[0_0_10px_rgba(255,255,255,0.4)]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>

              {selectedTextLayer && (
                <div className="p-3 rounded-lg bg-[#0A0A0A] border border-[#1A1A1A] flex items-center justify-between text-xs">
                  <span className="font-bold text-white truncate max-w-[150px]">
                    "{selectedTextLayer.text}"
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateTextLayer(selectedTextLayer.id, {
                          isBold: !selectedTextLayer.isBold,
                        })
                      }
                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                        selectedTextLayer.isBold ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      B
                    </button>
                    <button
                      onClick={() => deleteTextLayer(selectedTextLayer.id)}
                      className="text-red-400 hover:text-red-300 font-bold text-[10px] uppercase tracking-wider"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AUDIO TRACK TOOL */}
          {activeTool === 'audio' && (
            <div className="space-y-2">
              <span className="text-[10px] text-[#666666] font-bold uppercase tracking-wider">Select Audio Track:</span>
              <div className="space-y-2">
                {SAMPLE_AUDIO_LIBRARY.map((audio) => (
                  <div
                    key={audio.id}
                    onClick={() => addAudioLayer(audio)}
                    className="p-2.5 rounded-lg bg-[#0A0A0A] border border-[#1A1A1A] hover:border-white/20 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <span className="block text-xs font-bold text-white uppercase tracking-wider">{audio.name}</span>
                      <span className="text-[9px] font-mono text-[#666666]">{audio.artist} • {audio.duration}s</span>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center font-bold shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STICKERS TOOL */}
          {activeTool === 'stickers' && (
            <div className="space-y-3">
              <span className="text-[10px] text-[#666666] font-bold uppercase tracking-wider block">Tap emoji sticker to overlay:</span>
              <div className="grid grid-cols-5 gap-2">
                {['🔥', '✨', '⚡', '🎬', '🍿', '💯', '❤️', '🚀', '⭐', '💥'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => addStickerLayer && addStickerLayer(emoji)}
                    className="p-2.5 rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] hover:border-white/30 text-xl flex items-center justify-center active:scale-95 transition-all shadow-sm"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {activeProject.stickerLayers && activeProject.stickerLayers.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-[#1A1A1A]">
                  <span className="text-[9px] text-[#666666] font-bold uppercase tracking-wider block">Active Stickers:</span>
                  <div className="flex flex-wrap gap-2">
                    {activeProject.stickerLayers.map((st) => (
                      <div
                        key={st.id}
                        className="px-2.5 py-1 rounded-lg bg-[#0A0A0A] border border-[#1A1A1A] text-xs flex items-center gap-2 text-white font-mono"
                      >
                        <span>{st.emojiOrUrl}</span>
                        <button
                          onClick={() => deleteStickerLayer && deleteStickerLayer(st.id)}
                          className="text-red-400 hover:text-red-300 font-bold text-[10px] ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* REORDER TOOL */}
          {activeTool === 'reorder' && selectedClip && (
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-[#666666] font-bold uppercase tracking-wider">Reorder clip:</span>
              <button
                onClick={() => {
                  const idx = activeProject.clips.findIndex((c) => c.id === selectedClip.id);
                  if (idx > 0) reorderClips(idx, idx - 1);
                }}
                className="px-4 py-2 rounded-full bg-[#0A0A0A] border border-[#1A1A1A] text-[10px] uppercase font-bold tracking-wider text-white hover:border-white/30"
              >
                Move Left
              </button>
              <button
                onClick={() => {
                  const idx = activeProject.clips.findIndex((c) => c.id === selectedClip.id);
                  if (idx < activeProject.clips.length - 1) reorderClips(idx, idx + 1);
                }}
                className="px-4 py-2 rounded-full bg-[#0A0A0A] border border-[#1A1A1A] text-[10px] uppercase font-bold tracking-wider text-white hover:border-white/30"
              >
                Move Right
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Horizontally Scrollable Tool Bar */}
      <div className="px-3 py-2.5 flex items-center gap-3 overflow-x-auto touch-pan-x custom-scrollbar">
        {toolsList.map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className={`flex flex-col items-center gap-1 shrink-0 transition-all p-1.5 rounded-xl min-w-[56px] min-h-[52px] justify-center active:scale-95 cursor-pointer ${
                isActive ? 'text-white' : 'text-[#777777] hover:text-white'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-white text-black shadow-[0_0_14px_rgba(255,255,255,0.5)] scale-105'
                    : 'bg-[#0A0A0A] border border-[#1A1A1A] hover:border-white/30'
                }`}
              >
                {tool.icon}
              </div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-center">{tool.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

