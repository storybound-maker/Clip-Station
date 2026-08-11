import React, { useRef } from 'react';
import { ZoomIn, ZoomOut, Film, Type, Music, Scissors, GripVertical } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { formatTime } from '../../utils/mediaEngine';
import { Clip } from '../../types';

export const Timeline: React.FC = () => {
  const {
    activeProject,
    currentTime,
    setCurrentTime,
    selectedClipId,
    setSelectedClipId,
    selectedTextLayerId,
    setSelectedTextLayerId,
    selectedAudioLayerId,
    setSelectedAudioLayerId,
    zoomLevel,
    setZoomLevel,
    updateClip,
    reorderClips,
  } = useProject();

  const timelineRef = useRef<HTMLDivElement | null>(null);

  if (!activeProject) return null;

  const pixelsPerSecond = zoomLevel; // e.g. 30px per second
  const totalTimelineWidth = Math.max(300, activeProject.duration * pixelsPerSecond);

  const handleClipDragStart = (
    e: React.MouseEvent | React.TouchEvent,
    clipIndex: number
  ) => {
    if ((e.target as HTMLElement).closest('.trim-handle')) return;

    const startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    let lastTargetIdx = clipIndex;

    const onMove = (moveEv: MouseEvent | TouchEvent) => {
      const currentX = 'touches' in moveEv ? moveEv.touches[0].clientX : (moveEv as MouseEvent).clientX;
      const deltaX = currentX - startX;

      const stepWidth = 50;
      const shift = Math.round(deltaX / stepWidth);
      const targetIdx = Math.max(0, Math.min(activeProject.clips.length - 1, clipIndex + shift));

      if (targetIdx !== lastTargetIdx) {
        lastTargetIdx = targetIdx;
        reorderClips(clipIndex, targetIdx);
      }
    };

    const onEnd = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onEnd);
  };

  const handleTrimDragStart = (
    e: React.MouseEvent | React.TouchEvent,
    clip: Clip,
    handle: 'left' | 'right'
  ) => {
    e.stopPropagation();
    const startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const initialSourceIn = clip.sourceIn;
    const initialSourceOut = clip.sourceOut;
    const speed = clip.speed || 1;

    const onMove = (moveEv: MouseEvent | TouchEvent) => {
      const currentX = 'touches' in moveEv ? moveEv.touches[0].clientX : (moveEv as MouseEvent).clientX;
      const deltaX = currentX - startX;
      const deltaTime = (deltaX / pixelsPerSecond) * speed;

      if (handle === 'left') {
        const newIn = Math.max(0, Math.min(initialSourceOut - 0.2, initialSourceIn + deltaTime));
        updateClip(clip.id, { sourceIn: newIn });
      } else {
        const newOut = Math.max(initialSourceIn + 0.2, Math.min(clip.originalDuration, initialSourceOut + deltaTime));
        updateClip(clip.id, { sourceOut: newOut });
      }
    };

    const onEnd = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onEnd);
  };

  // Time ruler ticks every 2 seconds
  const ticks = [];
  for (let t = 0; t <= activeProject.duration + 5; t += 2) {
    ticks.push(t);
  }

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left + timelineRef.current.scrollLeft;
    const clickedTime = Math.max(0, Math.min(activeProject.duration, clickX / pixelsPerSecond));
    setCurrentTime(clickedTime);
  };

  return (
    <div className="w-full bg-[#050505] border-t border-[#1A1A1A] flex flex-col shrink-0 min-h-[150px] max-h-[200px] select-none overflow-hidden">
      {/* Timeline Controls Bar (Zoom, Track Status) */}
      <div className="px-4 py-1.5 bg-[#0A0A0A] border-b border-[#1A1A1A] flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-[#666666]">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-white font-bold">
            {formatTime(currentTime)}
          </span>
          <span className="text-[#1A1A1A]">|</span>
          <span className="text-zinc-400 font-bold">{activeProject.clips.length} Clips</span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomLevel((z) => Math.max(10, z - 10))}
            className="p-1 rounded-md bg-[#0A0A0A] border border-[#1A1A1A] text-zinc-300 hover:text-white min-w-[32px] min-h-[32px] flex items-center justify-center active:scale-95"
            title="Zoom Out Timeline"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[9px] font-mono text-[#666666] hidden sm:inline">Scale: {zoomLevel}px/s</span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(100, z + 10))}
            className="p-1 rounded-md bg-[#0A0A0A] border border-[#1A1A1A] text-zinc-300 hover:text-white min-w-[32px] min-h-[32px] flex items-center justify-center active:scale-95"
            title="Zoom In Timeline"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Horizontal Scrollable Timeline Area */}
      <div
        ref={timelineRef}
        onClick={handleTimelineClick}
        className="relative flex-1 overflow-x-auto overflow-y-auto custom-scrollbar bg-[#050505] p-4 cursor-pointer"
      >
        <div style={{ width: `${totalTimelineWidth + 120}px` }} className="relative flex flex-col gap-2 min-h-[160px]">
          {/* Time Ruler Bar */}
          <div className="relative h-6 border-b border-[#1A1A1A] mb-1 pointer-events-none">
            {ticks.map((tick) => (
              <div
                key={tick}
                style={{ left: `${tick * pixelsPerSecond}px` }}
                className="absolute top-0 flex flex-col items-start"
              >
                <div className="h-2 w-[1px] bg-[#1A1A1A]" />
                <span className="text-[9px] font-mono text-[#666666] mt-0.5">
                  {formatTime(tick, false)}
                </span>
              </div>
            ))}
          </div>

          {/* MAIN VIDEO TRACK */}
          <div className="relative h-16 bg-[#0A0A0A] rounded-xl border border-[#1A1A1A] p-1 flex items-center">
            <div className="absolute left-[-28px] top-1/2 -translate-y-1/2 text-[#666666]">
              <Film className="w-4 h-4" />
            </div>

            {activeProject.clips.map((clip, index) => {
              const isSelected = selectedClipId === clip.id;
              const clipWidth = clip.duration * pixelsPerSecond;
              const clipLeft = clip.startTime * pixelsPerSecond;

              return (
                <div
                  key={clip.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedClipId(clip.id);
                    setSelectedTextLayerId(null);
                    setSelectedAudioLayerId(null);
                  }}
                  onMouseDown={(e) => handleClipDragStart(e, index)}
                  onTouchStart={(e) => handleClipDragStart(e, index)}
                  style={{
                    left: `${clipLeft}px`,
                    width: `${clipWidth}px`,
                  }}
                  className={`absolute h-14 rounded-lg overflow-hidden border cursor-pointer transition-all flex items-center justify-between px-2 bg-zinc-900 group ${
                    isSelected
                      ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.4)] z-20'
                      : 'border-[#1A1A1A] hover:border-zinc-700 opacity-90'
                  }`}
                >
                  {/* Clip Thumbnail Background Strip */}
                  <div className="absolute inset-0 opacity-30 overflow-hidden pointer-events-none flex">
                    <img src={clip.thumbnail} alt="" className="h-full object-cover min-w-full" />
                  </div>

                  {/* Left Interactive Trim Handle */}
                  {isSelected && (
                    <div
                      onMouseDown={(e) => handleTrimDragStart(e, clip, 'left')}
                      onTouchStart={(e) => handleTrimDragStart(e, clip, 'left')}
                      className="trim-handle absolute left-0 top-0 bottom-0 w-6 bg-white hover:bg-zinc-200 cursor-ew-resize z-30 flex items-center justify-center rounded-l shadow-[0_0_12px_rgba(255,255,255,0.9)] active:scale-110 transition-transform touch-none"
                      title="Drag to trim start (source in)"
                    >
                      <GripVertical className="w-3.5 h-3.5 text-black" />
                    </div>
                  )}

                  {/* Clip Name & Stats */}
                  <div className="relative z-10 flex items-center gap-1.5 min-w-0 px-2 pointer-events-none">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-white truncate drop-shadow-md">
                      {clip.name}
                    </span>
                    {clip.speed !== 1 && (
                      <span className="text-[8px] font-bold text-black bg-white px-1 rounded uppercase tracking-wider">
                        {clip.speed}x
                      </span>
                    )}
                  </div>

                  <span className="relative z-10 text-[9px] font-mono text-zinc-300 bg-black/80 border border-[#1A1A1A] px-1 rounded pointer-events-none">
                    {clip.duration.toFixed(1)}s
                  </span>

                  {/* Right Interactive Trim Handle */}
                  {isSelected && (
                    <div
                      onMouseDown={(e) => handleTrimDragStart(e, clip, 'right')}
                      onTouchStart={(e) => handleTrimDragStart(e, clip, 'right')}
                      className="trim-handle absolute right-0 top-0 bottom-0 w-6 bg-white hover:bg-zinc-200 cursor-ew-resize z-30 flex items-center justify-center rounded-r shadow-[0_0_12px_rgba(255,255,255,0.9)] active:scale-110 transition-transform touch-none"
                      title="Drag to trim end (source out)"
                    >
                      <GripVertical className="w-3.5 h-3.5 text-black" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* TEXT OVERLAY TRACK */}
          <div className="relative h-10 bg-[#0A0A0A] rounded-lg border border-[#1A1A1A] p-1 flex items-center">
            <div className="absolute left-[-28px] top-1/2 -translate-y-1/2 text-[#666666]">
              <Type className="w-4 h-4" />
            </div>

            {activeProject.textLayers.map((textLayer) => {
              const isSelected = selectedTextLayerId === textLayer.id;
              const layerWidth = textLayer.duration * pixelsPerSecond;
              const layerLeft = textLayer.startTime * pixelsPerSecond;

              return (
                <div
                  key={textLayer.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTextLayerId(textLayer.id);
                  }}
                  style={{
                    left: `${layerLeft}px`,
                    width: `${layerWidth}px`,
                  }}
                  className={`absolute h-8 rounded-md border flex items-center px-2 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-wider truncate transition-all ${
                    isSelected ? 'border-white shadow-[0_0_12px_rgba(255,255,255,0.4)]' : 'border-[#1A1A1A]'
                  }`}
                >
                  <span className="truncate">{textLayer.text}</span>
                </div>
              );
            })}
          </div>

          {/* AUDIO TRACK */}
          <div className="relative h-10 bg-[#0A0A0A] rounded-lg border border-[#1A1A1A] p-1 flex items-center">
            <div className="absolute left-[-28px] top-1/2 -translate-y-1/2 text-[#666666]">
              <Music className="w-4 h-4" />
            </div>

            {activeProject.audioLayers.map((audioLayer) => {
              const isSelected = selectedAudioLayerId === audioLayer.id;
              const layerWidth = audioLayer.duration * pixelsPerSecond;
              const layerLeft = audioLayer.startTime * pixelsPerSecond;

              return (
                <div
                  key={audioLayer.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAudioLayerId(audioLayer.id);
                  }}
                  style={{
                    left: `${layerLeft}px`,
                    width: `${layerWidth}px`,
                  }}
                  className={`absolute h-8 rounded-md border flex items-center px-2 bg-zinc-900 text-zinc-300 text-[10px] font-bold uppercase tracking-wider truncate transition-all ${
                    isSelected ? 'border-white shadow-[0_0_12px_rgba(255,255,255,0.4)]' : 'border-[#1A1A1A]'
                  }`}
                >
                  <span className="truncate">{audioLayer.name}</span>
                </div>
              );
            })}
          </div>

          {/* PLAYHEAD GLOWING VERTICAL LINE */}
          <div
            style={{ left: `${currentTime * pixelsPerSecond}px` }}
            className="absolute top-0 bottom-0 w-[2px] bg-white z-40 pointer-events-none drop-shadow-[0_0_8px_rgba(255,255,255,1)]"
          >
            {/* Playhead Top Needle Handle */}
            <div className="w-3 h-3 bg-white border-2 border-black rounded-full -translate-x-1.2 -translate-y-1 shadow-md" />
          </div>
        </div>
      </div>
    </div>
  );
};

