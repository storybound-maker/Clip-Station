import React, { useEffect, useState } from 'react';
import { ArrowLeft, Download, CheckCircle2, Share2, Sparkles, FolderDown } from 'lucide-react';
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
  const [exportError, setExportError] = useState('');

  useEffect(() => () => { if (exportedVideoUrl) URL.revokeObjectURL(exportedVideoUrl); }, [exportedVideoUrl]);
  if (!activeProject) return null;

  const validate = async (url: string) => new Promise<{ size: number; duration: number }>((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = async () => {
      try {
        const blob = await fetch(url).then((r) => r.blob());
        if (!blob.size || !video.duration || !video.videoWidth || !video.videoHeight) throw new Error('Export validation failed.');
        resolve({ size: blob.size, duration: video.duration });
      } catch (e) { reject(e); }
    };
    video.onerror = () => reject(new Error('The exported video could not be opened by the browser.'));
    video.src = url;
  });

  const startExport = async () => {
    setIsExporting(true); setProgressPercent(0); setExportError(''); setExportedVideoUrl(null);
    try {
      const url = await exportVideoCanvas(activeProject, resolution, fps, (percent, status) => { setProgressPercent(percent); setStatusMessage(status); });
      setStatusMessage('Checking the rendered file...');
      await validate(url);
      setExportedVideoUrl(url);
      setProgressPercent(100);
      setStatusMessage('Ready to save.');
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Export failed.');
    } finally { setIsExporting(false); }
  };

  const share = async () => {
    if (!exportedVideoUrl) return;
    try {
      if (navigator.share) await navigator.share({ title: activeProject.name, text: 'Created with Clip Station', url: exportedVideoUrl });
      else await navigator.clipboard?.writeText(exportedVideoUrl);
    } catch { /* user cancelled */ }
  };

  return <div className="flex-1 w-full h-full bg-[#050505] text-[#F2F2F2] overflow-y-auto custom-scrollbar p-4 pb-24">
    <div className="max-w-xl mx-auto space-y-4">
      <header className="flex items-center gap-3 border-b border-[#1A1A1A] pb-3">
        <button onClick={() => setActiveTab('editor')} className="w-9 h-9 rounded-lg border border-[#1A1A1A] bg-[#0A0A0A] text-zinc-400 flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
        <div><h1 className="text-sm font-extrabold uppercase tracking-widest">Export</h1><p className="text-[9px] text-[#666] uppercase">{activeProject.name}</p></div>
      </header>

      {exportedVideoUrl ? <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-lg border border-[#1A1A1A] bg-[#0A0A0A]"><CheckCircle2 className="w-5 h-5 text-white" /><div><div className="text-[10px] font-extrabold uppercase">Export validated</div><div className="text-[8px] text-[#666]">Browser-safe WebM render • {resolution} • {fps} FPS</div></div></div>
        <video src={exportedVideoUrl} controls playsInline className="w-full max-h-[48vh] rounded-lg bg-black border border-[#1A1A1A] object-contain" />
        <a href={exportedVideoUrl} download={`${activeProject.name.replace(/\s+/g, '_')}_ClipStation.webm`} className="w-full h-12 rounded-full bg-white text-black font-extrabold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2"><FolderDown className="w-4 h-4" />Save WebM</a>
        <button onClick={share} className="w-full h-11 rounded-full bg-[#0A0A0A] border border-[#1A1A1A] text-white font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2"><Share2 className="w-4 h-4" />Share</button>
        <button onClick={() => setExportedVideoUrl(null)} className="w-full text-[9px] uppercase text-[#666]">Export again</button>
      </div> : isExporting ? <div className="py-16 flex flex-col items-center gap-5 text-center"><div className="w-16 h-16 rounded-full border-2 border-[#1A1A1A] border-t-white animate-spin flex items-center justify-center"><Sparkles className="w-5 h-5 text-white" /></div><div><div className="text-3xl font-mono font-black">{progressPercent}%</div><div className="text-[9px] uppercase tracking-wider text-[#888] mt-1">{statusMessage}</div></div><div className="w-full h-2 bg-[#0A0A0A] border border-[#1A1A1A] rounded-full overflow-hidden"><div className="h-full bg-white" style={{ width: `${progressPercent}%` }} /></div></div> : <>
        <div className="grid grid-cols-3 gap-2">{(['720p','1080p','4K'] as const).map((r) => <button key={r} onClick={() => setResolution(r)} className={`h-11 rounded-lg border text-[9px] font-extrabold ${resolution === r ? 'bg-white text-black border-white' : 'bg-[#0A0A0A] border-[#1A1A1A] text-[#777]'}`}>{r}</button>)}</div>
        <div className="grid grid-cols-3 gap-2">{([24,30,60] as const).map((r) => <button key={r} onClick={() => setFps(r)} className={`h-11 rounded-lg border text-[9px] font-extrabold ${fps === r ? 'bg-white text-black border-white' : 'bg-[#0A0A0A] border-[#1A1A1A] text-[#777]'}`}>{r} FPS</button>)}</div>
        <div className="p-3 rounded-lg border border-[#1A1A1A] bg-[#0A0A0A] text-[9px] text-[#777] space-y-1"><div className="flex justify-between"><span>Duration</span><span className="text-white font-mono">{formatTime(activeProject.duration)}</span></div><div className="flex justify-between"><span>Format</span><span className="text-white font-mono">WEBM / browser render</span></div><div className="text-[8px] text-[#555] pt-1">Native Android/iOS MP4 will use the native renderer once the development build is available.</div></div>
        {exportError && <div className="p-3 rounded-lg border border-red-900/50 bg-red-950/20 text-[9px] text-red-200">{exportError}</div>}
        <button onClick={startExport} className="w-full h-12 rounded-full bg-white text-black font-extrabold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2"><Download className="w-4 h-4" />Render Video</button>
      </>}
    </div>
  </div>;
};
