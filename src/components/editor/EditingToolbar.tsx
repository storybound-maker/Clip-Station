import React, { useState } from 'react';
import {
  Scissors, Split, Copy, Trash2, Gauge, Volume2, Crop, RotateCw, Sliders,
  Type, Music, ArrowLeftRight, X, Plus, RotateCcw, Sticker, PictureInPicture2,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { ActiveTool } from '../../types';
import { SAMPLE_AUDIO_LIBRARY } from '../../data/sampleMedia';

export const EditingToolbar: React.FC = () => {
  const {
    activeProject, activeTool, setActiveTool, selectedClipId, selectedTextLayerId,
    updateClip, splitClip, deleteClip, duplicateClip, addTextLayer, deleteTextLayer,
    addAudioLayer, currentTime, setCurrentTime,
  } = useProject();

  const [textInput, setTextInput] = useState('');
  if (!activeProject) return null;

  const selectedClip = activeProject.clips.find((c) => c.id === selectedClipId) || null;
  const selectedTextLayer = activeProject.textLayers.find((t) => t.id === selectedTextLayerId);

  const tools: Array<{ id: ActiveTool; label: string; icon: React.ReactNode }> = [
    { id: 'trim', label: 'Trim', icon: <Scissors /> },
    { id: 'split', label: 'Split', icon: <Split /> },
    { id: 'duplicate', label: 'Copy', icon: <Copy /> },
    { id: 'delete', label: 'Delete', icon: <Trash2 /> },
    { id: 'speed', label: 'Speed', icon: <Gauge /> },
    { id: 'volume', label: 'Volume', icon: <Volume2 /> },
    { id: 'crop', label: 'Crop', icon: <Crop /> },
    { id: 'rotate', label: 'Rotate', icon: <RotateCw /> },
    { id: 'adjust', label: 'Adjust', icon: <Sliders /> },
    { id: 'text', label: 'Text', icon: <Type /> },
    { id: 'audio', label: 'Music', icon: <Music /> },
    { id: 'reorder', label: 'Move', icon: <ArrowLeftRight /> },
  ];

  const runTool = (id: ActiveTool) => {
    if (!selectedClip && ['trim', 'split', 'duplicate', 'delete', 'speed', 'volume', 'crop', 'rotate', 'adjust'].includes(id || '')) return;
    if (id === 'split' && selectedClip) {
      const inside = currentTime > selectedClip.startTime + 0.15 && currentTime < selectedClip.startTime + selectedClip.duration - 0.15;
      const splitAt = inside ? currentTime : selectedClip.startTime + selectedClip.duration / 2;
      setCurrentTime(splitAt);
      splitClip(selectedClip.id, splitAt);
      return;
    }
    if (id === 'duplicate' && selectedClip) { duplicateClip(selectedClip.id); return; }
    if (id === 'delete' && selectedClip) { deleteClip(selectedClip.id); return; }
    if (id === 'rotate' && selectedClip) {
      updateClip(selectedClip.id, { rotation: ((selectedClip.rotation || 0) + 90) % 360 });
      return;
    }
    setActiveTool(activeTool === id ? null : id);
  };

  const addSubtitle = () => { addTextLayer('SUBTITLE'); setActiveTool('text'); };
  const addSticker = () => { addTextLayer('✦'); setActiveTool('text'); };

  return (
    <section className="w-full bg-[#0A0A0A] border-t border-[#1A1A1A] shrink-0 pb-[env(safe-area-inset-bottom)]">
      <div className="px-3 py-2 border-b border-[#1A1A1A] overflow-x-auto touch-pan-x">
        <div className="flex gap-2 min-w-max">
          <button onClick={() => setActiveTool('audio')} className="w-[122px] h-10 rounded-lg bg-[#15171C] border border-[#22252B] flex items-center gap-2 px-3 text-left active:scale-[0.98]">
            <Music className="w-4 h-4 text-zinc-400" /><span className="text-[9px] font-bold uppercase tracking-wider text-zinc-300">Add Music</span><Plus className="w-3 h-3 text-zinc-500 ml-auto" />
          </button>
          <button onClick={addSubtitle} className="w-[122px] h-10 rounded-lg bg-[#15171C] border border-[#22252B] flex items-center gap-2 px-3 text-left active:scale-[0.98]">
            <Type className="w-4 h-4 text-zinc-400" /><span className="text-[9px] font-bold uppercase tracking-wider text-zinc-300">Subtitle</span><Plus className="w-3 h-3 text-zinc-500 ml-auto" />
          </button>
          <button onClick={addSticker} className="w-[122px] h-10 rounded-lg bg-[#15171C] border border-[#22252B] flex items-center gap-2 px-3 text-left active:scale-[0.98]">
            <Sticker className="w-4 h-4 text-zinc-400" /><span className="text-[9px] font-bold uppercase tracking-wider text-zinc-300">Sticker</span><Plus className="w-3 h-3 text-zinc-500 ml-auto" />
          </button>
          <button disabled title="PIP track support is intentionally disabled until the core editor is stable" className="w-[122px] h-10 rounded-lg bg-[#111214] border border-[#1A1A1A] flex items-center gap-2 px-3 text-left opacity-45">
            <PictureInPicture2 className="w-4 h-4 text-zinc-500" /><span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">PIP</span><span className="text-[7px] ml-auto text-zinc-600">NEXT</span>
          </button>
        </div>
      </div>

      <div className="px-3 py-1.5 flex items-center justify-between border-b border-[#151515] min-w-0">
        <div className="flex items-center gap-2 min-w-0"><span className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedClip ? 'bg-white shadow-[0_0_8px_white]' : 'bg-[#444]'}`} /><span className="text-[8px] uppercase tracking-widest text-[#777] truncate">{selectedClip?.name || 'Select a clip'}</span></div>
        {selectedClip && <span className="text-[8px] font-mono text-[#666] shrink-0">{selectedClip.speed}x · {selectedClip.volume}% · {selectedClip.rotation}°</span>}
      </div>

      <div className="px-2 py-2 overflow-x-auto touch-pan-x custom-scrollbar">
        <div className="flex gap-1.5 min-w-max">
          {tools.map((tool) => {
            const active = activeTool === tool.id;
            return <button key={tool.id} onClick={() => runTool(tool.id)} className={`w-[58px] h-[54px] rounded-lg border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${active ? 'bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,.25)]' : 'bg-[#080808] border-[#1A1A1A] text-[#777]'}`}>
              {React.cloneElement(tool.icon as React.ReactElement, { className: 'w-4 h-4' })}
              <span className="text-[7px] font-extrabold uppercase tracking-wider">{tool.label}</span>
            </button>;
          })}
        </div>
      </div>

      {activeTool && <div className="border-t border-[#1A1A1A] bg-[#050505] p-3 max-h-[210px] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-3"><span className="text-[9px] uppercase tracking-[0.2em] font-extrabold text-white">{activeTool}</span><button onClick={() => setActiveTool(null)} className="w-7 h-7 rounded-md border border-[#1A1A1A] text-[#777] flex items-center justify-center"><X className="w-3.5 h-3.5" /></button></div>

        {activeTool === 'trim' && selectedClip && <div className="grid grid-cols-2 gap-3"><label className="text-[8px] uppercase text-[#666]">In {selectedClip.sourceIn.toFixed(1)}s<input type="range" min="0" max={Math.max(0, selectedClip.sourceOut - .2)} step=".05" value={selectedClip.sourceIn} onChange={(e) => updateClip(selectedClip.id, { sourceIn: Number(e.target.value) })} className="w-full accent-white mt-2" /></label><label className="text-[8px] uppercase text-[#666]">Out {selectedClip.sourceOut.toFixed(1)}s<input type="range" min={selectedClip.sourceIn + .2} max={selectedClip.originalDuration} step=".05" value={selectedClip.sourceOut} onChange={(e) => updateClip(selectedClip.id, { sourceOut: Number(e.target.value) })} className="w-full accent-white mt-2" /></label><button onClick={() => updateClip(selectedClip.id, { sourceIn: 0, sourceOut: selectedClip.originalDuration })} className="col-span-2 h-9 rounded-md border border-[#1A1A1A] text-[8px] uppercase font-bold text-zinc-400 flex items-center justify-center gap-1"><RotateCcw className="w-3 h-3" />Reset Trim</button></div>}

        {activeTool === 'speed' && selectedClip && <div className="grid grid-cols-4 gap-2">{[.25,.5,.75,1,1.25,1.5,2,3].map((speed) => <button key={speed} onClick={() => updateClip(selectedClip.id, { speed })} className={`h-10 rounded-md border text-[9px] font-extrabold ${selectedClip.speed === speed ? 'bg-white text-black border-white' : 'bg-[#0A0A0A] border-[#1A1A1A] text-[#777]'}`}>{speed}x</button>)}</div>}

        {activeTool === 'volume' && selectedClip && <div className="space-y-3"><div className="flex justify-between text-[8px] uppercase text-[#666]"><span>Volume</span><span className="text-white">{selectedClip.volume}%</span></div><input type="range" min="0" max="200" value={selectedClip.volume} onChange={(e) => updateClip(selectedClip.id, { volume: Number(e.target.value) })} className="w-full accent-white" /></div>}

        {activeTool === 'crop' && selectedClip && <div className="grid grid-cols-5 gap-1.5">{(['free','9:16','16:9','1:1','4:5'] as const).map((ratio) => <button key={ratio} onClick={() => updateClip(selectedClip.id, { crop: { ...selectedClip.crop, ratio } })} className={`h-10 rounded-md border text-[8px] font-extrabold ${selectedClip.crop.ratio === ratio ? 'bg-white text-black border-white' : 'bg-[#0A0A0A] border-[#1A1A1A] text-[#777]'}`}>{ratio === 'free' ? 'Original' : ratio}</button>)}</div>}

        {activeTool === 'rotate' && selectedClip && <div className="grid grid-cols-4 gap-2">{[0,90,180,270].map((rotation) => <button key={rotation} onClick={() => updateClip(selectedClip.id, { rotation })} className={`h-10 rounded-md border text-[9px] font-bold ${selectedClip.rotation === rotation ? 'bg-white text-black border-white' : 'border-[#1A1A1A] text-[#777]'}`}>{rotation}°</button>)}</div>}

        {activeTool === 'adjust' && selectedClip && <div className="grid grid-cols-3 gap-3">{(['brightness','contrast','saturation'] as const).map((key) => <label key={key} className="text-[8px] uppercase text-[#666]">{key}<input type="range" min="-50" max="50" value={selectedClip.filters[key]} onChange={(e) => updateClip(selectedClip.id, { filters: { ...selectedClip.filters, [key]: Number(e.target.value) } })} className="w-full accent-white mt-2" /></label>)}</div>}

        {activeTool === 'text' && <div className="space-y-2"><div className="flex gap-2"><input value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder="Enter subtitle or text..." className="flex-1 h-10 px-3 rounded-md bg-[#0A0A0A] border border-[#1A1A1A] text-[10px] text-white outline-none" /><button onClick={() => { if (textInput.trim()) { addTextLayer(textInput.trim()); setTextInput(''); } }} className="w-16 h-10 rounded-md bg-white text-black text-[8px] font-extrabold uppercase">Add</button></div>{selectedTextLayer && <button onClick={() => deleteTextLayer(selectedTextLayer.id)} className="h-8 text-[8px] uppercase text-red-300 border border-red-900/50 rounded-md px-3">Delete selected text</button>}</div>}

        {activeTool === 'audio' && <div className="space-y-2">{SAMPLE_AUDIO_LIBRARY.map((audio) => <button key={audio.id} onClick={() => addAudioLayer({ name: audio.name, url: audio.url, duration: Math.min(audio.duration, activeProject.duration), type: audio.type })} className="w-full h-11 rounded-md border border-[#1A1A1A] bg-[#0A0A0A] px-3 flex items-center text-left"><Music className="w-3.5 h-3.5 text-[#777] mr-2" /><span className="text-[9px] font-bold text-zinc-300 truncate">{audio.name}</span><span className="ml-auto text-[8px] text-[#555]">{audio.duration}s</span></button>)}</div>}

        {activeTool === 'reorder' && <div className="text-[9px] text-[#777] leading-relaxed">Drag the center of a clip in the timeline to move it. White edge handles are reserved for trimming.</div>}
      </div>}
    </section>
  );
};
