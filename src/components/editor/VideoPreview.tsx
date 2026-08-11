import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Maximize2, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { getActiveClipAtTime, formatTime, getCssFilterString } from '../../utils/mediaEngine';

export const VideoPreview: React.FC = () => {
  const { activeProject, currentTime, setCurrentTime, isPlaying, setIsPlaying, selectedTextLayerId, setSelectedTextLayerId } = useProject();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const currentTimeRef = useRef(currentTime);
  const animationRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const active = activeProject ? getActiveClipAtTime(activeProject.clips, currentTime) : { clip: null, clipLocalTime: 0, clipIndex: -1 };
  const clip = active.clip;

  useEffect(() => { currentTimeRef.current = currentTime; }, [currentTime]);
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !clip || clip.type !== 'video') return;
    video.playbackRate = Math.max(0.05, clip.speed || 1);
    video.volume = isMuted ? 0 : Math.min(1, Math.max(0, (clip.volume ?? 100) / 100));
    if (!isPlaying) { if (Math.abs(video.currentTime - active.clipLocalTime) > 0.08) video.currentTime = active.clipLocalTime; video.pause(); }
    else video.play().catch(() => undefined);
  }, [clip?.id, isPlaying, isMuted]);
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !clip || clip.type !== 'video' || isPlaying) return;
    if (Math.abs(video.currentTime - active.clipLocalTime) > 0.08) video.currentTime = active.clipLocalTime;
  }, [active.clipLocalTime, clip?.id, isPlaying]);
  useEffect(() => {
    if (!isPlaying || !activeProject) return;
    lastTickRef.current = performance.now();
    const tick = (now: number) => {
      const delta = Math.min(0.08, Math.max(0, (now - lastTickRef.current) / 1000));
      lastTickRef.current = now;
      const next = currentTimeRef.current + delta;
      if (next >= activeProject.duration) { currentTimeRef.current = 0; setCurrentTime(0); setIsPlaying(false); return; }
      currentTimeRef.current = next; setCurrentTime(next); animationRef.current = requestAnimationFrame(tick);
    };
    animationRef.current = requestAnimationFrame(tick);
    return () => { if (animationRef.current !== null) cancelAnimationFrame(animationRef.current); };
  }, [isPlaying, activeProject?.id, activeProject?.duration, setCurrentTime, setIsPlaying]);

  if (!activeProject) return null;
  const jumpPrevious = () => { const previous = [...activeProject.clips].reverse().find((c) => c.startTime < currentTime - 0.15); setIsPlaying(false); setCurrentTime(previous?.startTime ?? 0); };
  const jumpNext = () => { const next = activeProject.clips.find((c) => c.startTime > currentTime + 0.15); setIsPlaying(false); setCurrentTime(next?.startTime ?? activeProject.duration); };
  const ratioClass = activeProject.aspectRatio === '9:16' ? 'aspect-[9/16] max-h-[250px] sm:max-h-[360px] md:max-h-[480px]' : activeProject.aspectRatio === '1:1' ? 'aspect-square max-h-[240px] sm:max-h-[330px] md:max-h-[420px]' : 'aspect-video max-h-[190px] sm:max-h-[280px] md:max-h-[360px]';
  const cropRatio = clip?.crop?.ratio;
  const cropStyle = cropRatio && cropRatio !== 'free' ? { aspectRatio: cropRatio === '9:16' ? '9 / 16' : cropRatio === '16:9' ? '16 / 9' : cropRatio === '1:1' ? '1 / 1' : cropRatio === '4:5' ? '4 / 5' : '4 / 3' } : undefined;

  return <div className="w-full bg-[#050505] flex flex-col shrink-0 select-none">
    <div className={`relative w-full ${ratioClass} mx-auto overflow-hidden bg-black flex items-center justify-center`}>
      {clip ? <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <div style={cropStyle} className={`relative max-w-full max-h-full overflow-hidden flex items-center justify-center ${cropStyle ? 'h-full' : 'w-full h-full'}`}>
          <div className="relative w-full h-full overflow-hidden flex items-center justify-center" style={{ filter: getCssFilterString(clip.filters), transform: `rotate(${clip.rotation || 0}deg) scale(${clip.rotation % 180 ? 1.04 : 1})` }}>
            {clip.type === 'video' ? <video ref={videoRef} key={clip.id} src={clip.url} className="w-full h-full object-cover pointer-events-none" muted={isMuted || clip.volume === 0} playsInline preload="metadata" /> : <img src={clip.url} alt={clip.name} className="w-full h-full object-cover pointer-events-none" />}
          </div>
        </div>
        {activeProject.textLayers.map((text) => textVisible(text, currentTime) ? <div key={text.id} onClick={() => setSelectedTextLayerId(text.id)} style={{ top: `${text.y}%`, left: `${text.x}%`, transform: 'translate(-50%, -50%)', fontSize: `${text.fontSize}px`, color: text.color || '#fff', backgroundColor: text.backgroundColor || 'transparent', fontWeight: text.isBold ? 800 : 400, fontStyle: text.isItalic ? 'italic' : 'normal' }} className={`absolute z-20 px-2 py-1 rounded cursor-pointer ${selectedTextLayerId === text.id ? 'outline outline-1 outline-white shadow-[0_0_12px_rgba(255,255,255,.8)]' : ''}`}>{text.text}</div> : null)}
      </div> : <span className="text-[9px] uppercase tracking-widest text-[#555]">No clip at playhead</span>}
      <div className="absolute left-2 top-2 px-2 py-1 rounded bg-black/70 border border-[#1A1A1A] text-[8px] font-mono text-white pointer-events-none">{formatTime(currentTime)} / {formatTime(activeProject.duration)}</div>
    </div>

    <div className="h-12 px-3 bg-[#0A0A0A] border-b border-[#1A1A1A] flex items-center gap-2">
      <button onClick={jumpPrevious} className="w-8 h-8 rounded-lg border border-[#1A1A1A] text-[#777] flex items-center justify-center"><SkipBack className="w-3.5 h-3.5" /></button>
      <button onClick={() => setIsPlaying((prev) => !prev)} className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_10px_rgba(255,255,255,.25)]">{isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}</button>
      <button onClick={jumpNext} className="w-8 h-8 rounded-lg border border-[#1A1A1A] text-[#777] flex items-center justify-center"><SkipForward className="w-3.5 h-3.5" /></button>
      <input aria-label="Timeline seek" type="range" min="0" max={activeProject.duration || 1} step="0.02" value={currentTime} onChange={(e) => { setIsPlaying(false); setCurrentTime(Number(e.target.value)); }} className="flex-1 accent-white" />
      <button onClick={() => setIsMuted((v) => !v)} className="w-8 h-8 text-[#777] flex items-center justify-center">{isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}</button>
      <button onClick={() => setIsFullscreen(true)} className="w-8 h-8 text-[#777] flex items-center justify-center"><Maximize2 className="w-4 h-4" /></button>
    </div>

    {isFullscreen && <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4"><button onClick={() => setIsFullscreen(false)} className="absolute top-4 right-4 h-9 px-3 rounded-full bg-[#1A1A1A] text-white text-[9px] uppercase font-bold">Close</button>{clip?.type === 'video' ? <video src={clip.url} controls autoPlay playsInline className="max-w-full max-h-[85vh] object-contain" /> : <img src={clip?.url} alt="" className="max-w-full max-h-[85vh] object-contain" />}</div>}
  </div>;
};

function textVisible(text: { startTime: number; duration: number }, time: number) { return time >= text.startTime && time <= text.startTime + text.duration; }
