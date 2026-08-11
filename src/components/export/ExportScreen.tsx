import React, { useState } from 'react';
import { ArrowLeft, Download, CheckCircle2, Share2, Play, Sparkles, FolderDown, RefreshCw } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { exportVideoCanvas, formatTime } from '../../utils/mediaEngine';

export const ExportScreen: React.FC = () => {
  const { activeProject, setActiveTab } = useProject();

  const [resolution, setResolution] = useState<'720p' | '1080p' | '4K'>('1080p');
  const [fps, setFps] = useState<24 | 30 | 60>(30);

  const [isExporting, setIsExporting] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);

  if (!activeProject) return null;

  const validateExportedVideo = async (url: string): Promise<{ size: number; duration: number; width: number; height: number }> => {
    const response = await fetch(url);
    const blob = await response.blob();
    if (!blob || blob.size === 0) {
      throw new Error('Exported video blob is empty (0 bytes)');
    }

    return new Promise((resolve, reject) => {
      const testVideo = document.createElement('video');
      testVideo.preload = 'metadata';
      testVideo.src = url;

      testVideo.onloadedmetadata = () => {
        if (testVideo.duration > 0 && testVideo.videoWidth > 0 && testVideo.videoHeight > 0) {
          resolve({
            size: blob.size,
            duration: testVideo.duration,
            width: testVideo.videoWidth,
            height: testVideo.videoHeight,
          });
        } else {
          reject(new Error('Exported video metadata check failed: invalid duration or dimensions'));
        }
      };

      testVideo.onerror = () => {
        reject(new Error('Exported video failed to load in player test'));
      };

      setTimeout(() => {
        reject(new Error('Exported video validation timed out'));
      }, 4000);
    });
  };

  const handleStartExport = async () => {
    setIsExporting(true);
    setProgressPercent(0);
    setStatusMessage('Initializing Canvas Video Engine...');
    setExportedVideoUrl(null);

    try {
      const videoUrl = await exportVideoCanvas(
        activeProject,
        resolution,
        fps,
        (percent, status) => {
          setProgressPercent(percent);
          setStatusMessage(status);
        }
      );

      setStatusMessage('Validating exported video file integrity...');
      const stats = await validateExportedVideo(videoUrl);
      console.log('Export validation passed:', stats);
      setExportedVideoUrl(videoUrl);
    } catch (err: any) {
      console.error('Export failed', err);
      setStatusMessage(err?.message || 'Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (!exportedVideoUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: activeProject.name,
          text: 'Created with Clip Station Mobile Video Editor',
          url: exportedVideoUrl,
        });
      } catch (e) {
        console.warn('Share cancelled or not supported', e);
      }
    } else {
      navigator.clipboard.writeText(exportedVideoUrl);
      alert('Video URL copied to clipboard!');
    }
  };

  return (
    <div className="flex-1 w-full h-full bg-[#050505] text-[#F2F2F2] flex flex-col overflow-y-auto custom-scrollbar p-5 pb-24">
      <div className="w-full max-w-5xl mx-auto flex flex-col">
      {/* Top Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#1A1A1A] mb-5">
        <button
          onClick={() => setActiveTab('editor')}
          className="p-2 rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-base font-extrabold uppercase tracking-widest text-white">Export Engine</h1>
          <p className="text-[10px] text-[#666666] uppercase tracking-wider">{activeProject.name}</p>
        </div>
      </div>

      {exportedVideoUrl ? (
        /* Completion State */
        <div className="flex flex-col items-center text-center space-y-6 my-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider mb-1">Export Complete</h2>
            <p className="text-[10px] text-[#666666] uppercase tracking-wider">
              Your video has been rendered and is ready for save or share.
            </p>
          </div>

          {/* Exported Video Preview Player */}
          <div className="w-full max-w-xs aspect-video bg-black rounded-xl overflow-hidden border border-[#1A1A1A] shadow-2xl">
            <video src={exportedVideoUrl} controls autoPlay loop className="w-full h-full object-contain" />
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-2.5 pt-2">
            <a
              href={exportedVideoUrl}
              download={`${activeProject.name.replace(/\s+/g, '_')}_ClipStation.mp4`}
              className="w-full py-3 px-5 rounded-full bg-white text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:shadow-[0_0_25px_rgba(255,255,255,0.6)]"
            >
              <FolderDown className="w-4 h-4" />
              <span>Save MP4 to Mobile Device</span>
            </a>

            <button
              onClick={handleShare}
              className="w-full py-3 px-5 rounded-full bg-[#0A0A0A] border border-[#1A1A1A] font-bold text-xs uppercase tracking-wider text-white flex items-center justify-center gap-2 hover:border-white/30"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Video</span>
            </button>

            <button
              onClick={() => setExportedVideoUrl(null)}
              className="text-[10px] text-[#666666] hover:text-white font-bold uppercase tracking-wider"
            >
              Export with different settings
            </button>
          </div>
        </div>
      ) : isExporting ? (
        /* Progress State */
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-6 my-auto">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-[#1A1A1A] border-t-white animate-spin" />
            <Sparkles className="w-7 h-7 text-white animate-pulse" />
          </div>

          <div>
            <span className="text-3xl font-black font-mono text-white mb-1 block">
              {progressPercent}%
            </span>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">{statusMessage}</p>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-xs h-2 rounded-full bg-[#0A0A0A] border border-[#1A1A1A] overflow-hidden p-0.5">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-white rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(255,255,255,0.8)]"
            />
          </div>

          <p className="text-[10px] text-[#666666] uppercase tracking-wider">
            Rendering video frames locally with Clip Station GPU engine.
          </p>
        </div>
      ) : (
        /* Settings Selection Form */
        <div className="space-y-5">
          {/* Resolution Options */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#666666] mb-2">
              Resolution
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['720p', '1080p', '4K'] as const).map((res) => (
                <button
                  key={res}
                  onClick={() => setResolution(res)}
                  className={`min-h-[44px] rounded-xl text-xs font-extrabold uppercase tracking-wider border transition-all flex items-center justify-center ${
                    resolution === res
                      ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                      : 'bg-[#0A0A0A] text-[#666666] border-[#1A1A1A] hover:border-white/20'
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>

          {/* Frame Rate Options */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#666666] mb-2">
              Frame Rate (FPS)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([24, 30, 60] as const).map((rate) => (
                <button
                  key={rate}
                  onClick={() => setFps(rate)}
                  className={`min-h-[44px] rounded-xl text-xs font-extrabold uppercase tracking-wider border transition-all flex items-center justify-center ${
                    fps === rate
                      ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                      : 'bg-[#0A0A0A] text-[#666666] border-[#1A1A1A] hover:border-white/20'
                  }`}
                >
                  {rate} FPS
                </button>
              ))}
            </div>
          </div>

          {/* Project Summary Stats */}
          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] space-y-2 text-xs">
            <div className="flex justify-between text-[#666666]">
              <span className="uppercase text-[10px] font-bold tracking-wider">Duration:</span>
              <span className="text-white font-mono">{formatTime(activeProject.duration)}</span>
            </div>
            <div className="flex justify-between text-[#666666]">
              <span className="uppercase text-[10px] font-bold tracking-wider">Canvas Format:</span>
              <span className="text-white uppercase font-mono">{activeProject.aspectRatio}</span>
            </div>
            <div className="flex justify-between text-[#666666]">
              <span className="uppercase text-[10px] font-bold tracking-wider">Estimated Size:</span>
              <span className="text-white font-mono">
                ~{(activeProject.duration * (resolution === '4K' ? 4 : resolution === '1080p' ? 2 : 1)).toFixed(1)} MB
              </span>
            </div>
          </div>

          {/* Start Export Button */}
          <button
            onClick={handleStartExport}
            className="w-full py-3.5 rounded-full bg-white text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:shadow-[0_0_25px_rgba(255,255,255,0.6)] transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Export Video Now</span>
          </button>
        </div>
      )}
      </div>
    </div>
  );
};

