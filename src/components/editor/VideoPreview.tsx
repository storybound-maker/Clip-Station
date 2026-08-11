import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Maximize2, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { getActiveClipAtTime, formatTime, getCssFilterString } from '../../utils/mediaEngine';

export const VideoPreview: React.FC = () => {
  const {
    activeProject,
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    selectedTextLayerId,
    setSelectedTextLayerId,
  } = useProject();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!activeProject) return null;

  const { clip, clipLocalTime } = getActiveClipAtTime(activeProject.clips, currentTime);

  // Sync HTML5 video element with playhead local time and audio volume
  useEffect(() => {
    if (videoRef.current && clip && clip.type === 'video') {
      const vid = videoRef.current;
      if (Math.abs(vid.currentTime - clipLocalTime) > 0.3) {
        vid.currentTime = clipLocalTime;
      }
      if (clip.speed) vid.playbackRate = clip.speed;

      const normVol = isMuted ? 0 : Math.min(1, Math.max(0, (clip.volume ?? 100) / 100));
      vid.volume = normVol;

      if (isPlaying) {
        vid.play().catch(() => {});
      } else {
        vid.pause();
      }
    }
  }, [clip, clipLocalTime, isPlaying, isMuted]);

  // Main playback loop timer
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      if (isPlaying) {
        const delta = (now - lastTime) / 1000;
        setCurrentTime((prevTime) => {
          const nextTime = prevTime + delta;
          if (nextTime >= activeProject.duration) {
            setIsPlaying(false);
            return 0;
          }
          return nextTime;
        });
      }
      lastTime = now;
      if (isPlaying) {
        animId = requestAnimationFrame(loop);
      }
    };

    if (isPlaying) {
      lastTime = performance.now();
      animId = requestAnimationFrame(loop);
    }

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, activeProject.duration, setCurrentTime, setIsPlaying]);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const jumpToPreviousClip = () => {
    const prevClips = activeProject.clips.filter((c) => c.startTime < currentTime - 0.2);
    if (prevClips.length > 0) {
      setCurrentTime(prevClips[prevClips.length - 1].startTime);
    } else {
      setCurrentTime(0);
    }
  };

  const jumpToNextClip = () => {
    const nextClip = activeProject.clips.find((c) => c.startTime > currentTime + 0.2);
    if (nextClip) {
      setCurrentTime(nextClip.startTime);
    } else {
      setCurrentTime(activeProject.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
  };

  const filterStyle = clip ? getCssFilterString(clip.filters) : 'none';

  const getCropStyle = (ratio?: string) => {
    if (ratio === '9:16') return 'aspect-[9/16] h-full object-cover';
    if (ratio === '16:9') return 'aspect-video w-full object-cover';
    if (ratio === '1:1') return 'aspect-square h-full object-cover';
    if (ratio === '4:5') return 'aspect-[4/5] h-full object-cover';
    return 'w-full h-full object-contain';
  };

  return (
    <div className="w-full bg-[#050505] flex flex-col items-center justify-center relative select-none shrink-0">
      {/* Video Canvas Container */}
      <div
        ref={containerRef}
        className={`relative w-full overflow-hidden flex items-center justify-center bg-black transition-all ${
          activeProject.aspectRatio === '9:16'
            ? 'aspect-[9/16] max-h-[260px] sm:max-h-[360px] md:max-h-[480px]'
            : activeProject.aspectRatio === '1:1'
            ? 'aspect-square max-h-[240px] sm:max-h-[320px] md:max-h-[420px]'
            : 'aspect-video max-h-[200px] sm:max-h-[280px] md:max-h-[360px]'
        }`}
      >
        {clip ? (
          <div
            className="relative w-full h-full flex items-center justify-center overflow-hidden transition-all duration-200"
            style={{
              transform: `rotate(${clip.rotation || 0}deg)`,
              filter: filterStyle,
            }}
          >
            {clip.type === 'video' ? (
              <video
                ref={videoRef}
                src={clip.url}
                className={`${getCropStyle(clip.crop?.ratio)} pointer-events-none transition-all`}
                muted={isMuted || clip.volume === 0}
                playsInline
              />
            ) : (
              <img
                src={clip.url}
                alt={clip.name}
                className={`${getCropStyle(clip.crop?.ratio)} pointer-events-none transition-all`}
              />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-[#666666] text-[10px] uppercase tracking-wider">
            <span>No Clip at Playhead</span>
          </div>
        )}

        {/* Floating Draggable Text Layers Overlay */}
        {activeProject.textLayers.map((textLayer) => {
          if (
            currentTime >= textLayer.startTime &&
            currentTime <= textLayer.startTime + textLayer.duration
          ) {
            const isSelected = selectedTextLayerId === textLayer.id;
            return (
              <div
                key={textLayer.id}
                onClick={() => setSelectedTextLayerId(textLayer.id)}
                style={{
                  top: `${textLayer.y}%`,
                  left: `${textLayer.x}%`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: `${textLayer.fontSize}px`,
                  fontFamily: textLayer.fontFamily || 'sans-serif',
                  color: textLayer.color || '#FFFFFF',
                  backgroundColor: textLayer.backgroundColor || 'transparent',
                  textAlign: textLayer.alignment || 'center',
                  fontWeight: textLayer.isBold ? 'bold' : 'normal',
                  fontStyle: textLayer.isItalic ? 'italic' : 'normal',
                }}
                className={`absolute px-3 py-1 rounded cursor-pointer z-30 transition-all ${
                  isSelected ? 'outline-2 outline-white shadow-[0_0_15px_rgba(255,255,255,0.8)]' : ''
                }`}
              >
                {textLayer.text}
              </div>
            );
          }
          return null;
        })}

        {/* Playhead Time Overlay Tag */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 border border-[#1A1A1A] text-[9px] font-mono text-[#888888] pointer-events-none">
          {formatTime(currentTime)} / {formatTime(activeProject.duration)}
        </div>
      </div>

      {/* Video Control Bar */}
      <div className="w-full px-4 py-2 bg-[#0A0A0A] border-b border-[#1A1A1A] flex items-center justify-between text-xs">
        {/* Playback Controls & Time */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={jumpToPreviousClip}
            className="p-1.5 rounded-lg bg-[#050505] border border-[#1A1A1A] text-zinc-400 hover:text-white min-w-[32px] min-h-[32px] flex items-center justify-center active:scale-95"
            title="Previous Clip"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:shadow-[0_0_12px_rgba(255,255,255,0.6)] active:scale-95 transition-all cursor-pointer"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-black text-black" />
            ) : (
              <Play className="w-4 h-4 fill-black text-black ml-0.5" />
            )}
          </button>

          <button
            onClick={jumpToNextClip}
            className="p-1.5 rounded-lg bg-[#050505] border border-[#1A1A1A] text-zinc-400 hover:text-white min-w-[32px] min-h-[32px] flex items-center justify-center active:scale-95"
            title="Next Clip"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <span className="font-mono text-[10px] text-white font-bold ml-1">
            {formatTime(currentTime)}
          </span>
        </div>

        {/* Scrub Slider */}
        <div className="flex-1 mx-3">
          <input
            type="range"
            min={0}
            max={activeProject.duration || 1}
            step={0.05}
            value={currentTime}
            onChange={handleSeek}
            className="w-full accent-white cursor-pointer h-1.5 bg-[#1A1A1A] rounded-lg"
          />
        </div>

        {/* Mute & Fullscreen Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsMuted((prev) => !prev)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white min-w-[32px] min-h-[32px] flex items-center justify-center"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setIsFullscreen(true)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white min-w-[32px] min-h-[32px] flex items-center justify-center"
            title="Fullscreen Preview"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Fullscreen Video Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#1A1A1A] border border-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-wider min-h-[36px]"
          >
            Exit Fullscreen
          </button>
          <div className="relative max-w-full max-h-[80vh] flex items-center justify-center">
            {clip?.type === 'video' ? (
              <video src={clip.url} className="max-w-full max-h-[80vh] object-contain" autoPlay loop muted={isMuted} />
            ) : (
              <img src={clip?.url} alt="" className="max-w-full max-h-[80vh] object-contain" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

