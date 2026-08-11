import React, { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Film, Type, Music, GripVertical } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { formatTime } from '../../utils/mediaEngine';
import { Clip } from '../../types';

export const Timeline: React.FC = () => {
  const { activeProject, currentTime, setCurrentTime, selectedClipId, setSelectedClipId, setSelectedTextLayerId, setSelectedAudioLayerId, zoomLevel, setZoomLevel, updateClip, reorderClips } = useProject();
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const [draggingClip, setDraggingClip] = useState<number | null>(null);
  const dragStartX = useRef(0);
  const dragMoved = useRef(false);
  const initialIndex = useRef(0);

  useEffect(() => {
    if (draggingClip === null || !activeProject) return;
    const onPointerMove = (e: PointerEvent) => { if (Math.abs(e.clientX - dragStartX.current) > 8) dragMoved.current = true; };
    const onPointerUp = (e: PointerEvent) => {
      if (dragMoved.current) {
        const deltaX = e.clientX - dragStartX.current;
        const stepWidth = Math.max(50, zoomLevel * 1.25);
        const targetIndex = Math.max(0, Math.min(activeProject.clips.length - 1, initialIndex.current + Math.round(deltaX / stepWidth)));
        if (targetIndex !== initialIndex.current) reorderClips(initialIndex.current, targetIndex);
      }
      setDraggingClip(null);
      dragMoved.current = false;
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp, { once: true });
    return () => { window.removeEventListener('pointermove', onPointerMove); window.removeEventListener('pointerup', onPointerUp); };
  }, [draggingClip, zoomLevel, activeProject, reorderClips]);

  if (!activeProject) return null;

  const pixelsPerSecond = zoomLevel;
  const totalTimelineWidth = Math.max(360, activeProject.duration * pixelsPerSecond);

  const beginClipDrag = (e: React.PointerEvent, clipIndex: number) => {
    if ((e.target as HTMLElement).closest('.trim-handle')) return;
    e.stopPropagation();
    dragStartX.current = e.clientX;
    initialIndex.current = clipIndex;
    dragMoved.current = false;
    setDraggingClip(clipIndex);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handleTrimStart = (e: React.PointerEvent, clip: Clip, handle: 'left' | 'right') => {
    e.stopPropagation(); e.preventDefault();
    const startX = e.clientX;
    const initialIn = clip.sourceIn;
    const initialOut = clip.sourceOut;
    const speed = clip.speed || 1;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    const onMove = (move: PointerEvent) => {
      const deltaTime = ((move.clientX - startX) / pixelsPerSecond) * speed;
      if (handle === 'left') updateClip(clip.id, { sourceIn: Math.max(0, Math.min(initialOut - 0.2, initialIn + deltaTime)) });
      else updateClip(clip.id, { sourceOut: Math.max(initialIn + 0.2, Math.min(clip.originalDuration, initialOut + deltaTime)) });
    };
    const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
  };

  const handleTimelinePointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!timelineRef.current || draggingClip !== null || dragMoved.current) return;
    if ((e.target as HTMLElement).closest('.timeline-clip, .timeline-layer')) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + timelineRef.current.scrollLeft;
    setCurrentTime(Math.max(0, Math.min(activeProject.duration, x / pixelsPerSecond)));
  };

  const ticks = [];
  for (let t = 0; t <= activeProject.duration + 2; t += 2) ticks.push(t);

  return (
    <section className="w-full bg-[#050505] border-y border-[#1A1A1A] shrink-0 select-none">
      <div className="h-9 px-3 bg-[#0A0A0A] border-b border-[#1A1A1A] flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0"><span className="font-mono text-[10px] font-bold text-white">{formatTime(currentTime)}</span><span className="text-[#333]">/</span><span className="font-mono text-[10px] text-[#777]">{formatTime(activeProject.duration)}</span><span className="hidden sm:inline text-[9px] uppercase tracking-wider text-[#555]">{activeProject.clips.length} clips</span></div>
        <div className="flex items-center gap-1"><button onClick={() => setZoomLevel((z) => Math.max(12, z - 6))} className="w-8 h-8 rounded-lg border border-[#1A1A1A] bg-[#050505] text-[#888] flex items-center justify-center"><ZoomOut className="w-3.5 h-3.5" /></button><span className="hidden md:inline text-[8px] font-mono text-[#555] w-14 text-center">{zoomLevel}px/s</span><button onClick={() => setZoomLevel((z) => Math.min(90, z + 6))} className="w-8 h-8 rounded-lg border border-[#1A1A1A] bg-[#050505] text-[#888] flex items-center justify-center"><ZoomIn className="w-3.5 h-3.5" /></button></div>
      </div>

      <div ref={timelineRef} onPointerDown={handleTimelinePointer} className="relative overflow-x-auto overflow-y-hidden touch-pan-x custom-scrollbar px-3 py-2">
        <div style={{ width: `${totalTimelineWidth + 24}px` }} className="relative min-h-[126px]">
          <div className="relative h-6 border-b border-[#1A1A1A] pointer-events-none">{ticks.map((tick) => <div key={tick} style={{ left: `${tick * pixelsPerSecond}px` }} className="absolute top-0"><div className="h-2 w-px bg-[#333]" /><span className="text-[8px] font-mono text-[#555]">{formatTime(tick, false)}</span></div>)}</div>

          <div className="relative h-14 mt-2 rounded-lg border border-[#1A1A1A] bg-[#080808]">
            <div className="absolute -left-1 top-1/2 -translate-x-full -translate-y-1/2 text-[#555]"><Film className="w-3.5 h-3.5" /></div>
            {activeProject.clips.map((clip, index) => {
              const selected = selectedClipId === clip.id;
              const width = Math.max(42, clip.duration * pixelsPerSecond);
              const left = clip.startTime * pixelsPerSecond;
              return <div key={clip.id} style={{ left, width }} onClick={(e) => { e.stopPropagation(); setSelectedClipId(clip.id); setSelectedTextLayerId(null); setSelectedAudioLayerId(null); }} onPointerDown={(e) => beginClipDrag(e, index)} className={`timeline-clip absolute top-1 bottom-1 overflow-hidden rounded-md border ${selected ? 'border-white shadow-[0_0_12px_rgba(255,255,255,0.35)]' : 'border-[#222]'} ${draggingClip === index ? 'opacity-60 scale-[0.98]' : ''} bg-[#111] touch-none`}>
                <img src={clip.thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover opacity-35 pointer-events-none" /><div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-black/70 pointer-events-none" />
                {selected && <div onPointerDown={(e) => handleTrimStart(e, clip, 'left')} className="trim-handle absolute left-0 top-0 bottom-0 w-5 bg-white text-black z-20 flex items-center justify-center cursor-ew-resize"><GripVertical className="w-3 h-3" /></div>}
                <div className="relative z-10 h-full flex items-center px-2 min-w-0 pointer-events-none"><span className="text-[9px] font-extrabold text-white uppercase truncate">{clip.name}</span></div>
                <span className="absolute right-1 bottom-1 z-10 text-[7px] font-mono text-white bg-black/70 px-1 rounded pointer-events-none">{clip.duration.toFixed(1)}s</span>
                {selected && <div onPointerDown={(e) => handleTrimStart(e, clip, 'right')} className="trim-handle absolute right-0 top-0 bottom-0 w-5 bg-white text-black z-20 flex items-center justify-center cursor-ew-resize"><GripVertical className="w-3 h-3" /></div>}
              </div>;
            })}
          </div>

          <div className="relative h-8 mt-1 rounded-md border border-[#151515] bg-[#080808]"><div className="absolute -left-1 top-1/2 -translate-x-full -translate-y-1/2 text-[#555]"><Type className="w-3.5 h-3.5" /></div>{activeProject.textLayers.map((layer) => <div key={layer.id} style={{ left: layer.startTime * pixelsPerSecond, width: Math.max(30, layer.duration * pixelsPerSecond) }} className="timeline-layer absolute inset-y-1 rounded border border-[#333] bg-[#161616] px-2 flex items-center text-[8px] text-zinc-300 font-bold truncate">{layer.text}</div>)}</div>
          <div className="relative h-8 mt-1 rounded-md border border-[#151515] bg-[#080808]"><div className="absolute -left-1 top-1/2 -translate-x-full -translate-y-1/2 text-[#555]"><Music className="w-3.5 h-3.5" /></div>{activeProject.audioLayers.map((layer) => <div key={layer.id} style={{ left: layer.startTime * pixelsPerSecond, width: Math.max(30, layer.duration * pixelsPerSecond) }} className="timeline-layer absolute inset-y-1 rounded border border-[#333] bg-[#111] px-2 flex items-center text-[8px] text-zinc-400 font-bold truncate">{layer.name}</div>)}</div>
          <div style={{ left: `${currentTime * pixelsPerSecond}px` }} className="absolute top-0 bottom-0 w-px bg-white z-30 pointer-events-none shadow-[0_0_8px_rgba(255,255,255,0.9)]"><div className="w-3 h-3 -ml-[5px] -mt-1 rounded-full bg-white border-2 border-black" /></div>
        </div>
      </div>
    </section>
  );
};
