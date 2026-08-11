import { Clip, Project } from '../types';

export function formatTime(seconds: number, includeMillis = true): string {
  const safe = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  const mins = Math.floor(safe / 60);
  const secs = Math.floor(safe % 60);
  const millis = Math.floor((safe % 1) * 100);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return includeMillis ? `${pad(mins)}:${pad(secs)}.${pad(millis)}` : `${pad(mins)}:${pad(secs)}`;
}

export function recalculateTimeline(clips: Clip[]): { clips: Clip[]; totalDuration: number } {
  let cursor = 0;
  const normalized = clips.map((clip) => {
    const speed = Math.max(0.05, clip.speed || 1);
    const sourceIn = Math.max(0, Math.min(clip.sourceIn, clip.originalDuration));
    const sourceOut = Math.max(sourceIn + 0.05, Math.min(clip.originalDuration, clip.sourceOut));
    const duration = Math.max(0.05, (sourceOut - sourceIn) / speed);
    const next = { ...clip, sourceIn, sourceOut, startTime: cursor, duration };
    cursor += duration;
    return next;
  });
  return { clips: normalized, totalDuration: Math.max(0.05, cursor) };
}

export function getActiveClipAtTime(clips: Clip[], time: number): { clip: Clip | null; clipLocalTime: number; clipIndex: number } {
  if (!clips.length) return { clip: null, clipLocalTime: 0, clipIndex: -1 };
  const safeTime = Math.max(0, time);
  for (let i = 0; i < clips.length; i++) {
    const clip = clips[i];
    const end = clip.startTime + clip.duration;
    const isLast = i === clips.length - 1;
    if (safeTime >= clip.startTime && (safeTime < end || (isLast && safeTime <= end))) {
      const local = clip.sourceIn + Math.min(clip.duration, safeTime - clip.startTime) * (clip.speed || 1);
      return { clip, clipLocalTime: Math.min(clip.sourceOut, local), clipIndex: i };
    }
  }
  const last = clips[clips.length - 1];
  return { clip: last, clipLocalTime: last.sourceOut, clipIndex: clips.length - 1 };
}

export function splitClipAtTime(clip: Clip, splitTimelineTime: number): { clip1: Clip; clip2: Clip } | null {
  const relative = splitTimelineTime - clip.startTime;
  if (relative <= 0.15 || relative >= clip.duration - 0.15) return null;
  const sourceSplit = clip.sourceIn + relative * (clip.speed || 1);
  if (sourceSplit <= clip.sourceIn + 0.05 || sourceSplit >= clip.sourceOut - 0.05) return null;
  const stamp = Date.now();
  return {
    clip1: { ...clip, id: `clip_${stamp}_a`, sourceOut: sourceSplit, duration: relative },
    clip2: { ...clip, id: `clip_${stamp}_b`, sourceIn: sourceSplit, duration: clip.duration - relative },
  };
}

export function getCssFilterString(filters: Clip['filters']): string {
  if (!filters) return 'none';
  return `brightness(${100 + filters.brightness}%) contrast(${100 + filters.contrast}%) saturate(${100 + filters.saturation}%)`;
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function seekVideo(video: HTMLVideoElement, time: number): Promise<void> {
  const target = Math.max(0, Math.min(time, Number.isFinite(video.duration) ? video.duration : time));
  if (Math.abs(video.currentTime - target) < 0.005 && video.readyState >= 2) return Promise.resolve();
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      video.removeEventListener('seeked', finish);
      resolve();
    };
    video.addEventListener('seeked', finish, { once: true });
    video.currentTime = target;
    window.setTimeout(finish, 1500);
  });
}

function getOutputSize(project: Project, resolution: '720p' | '1080p' | '4K') {
  const base = resolution === '4K' ? 2160 : resolution === '1080p' ? 1080 : 720;
  switch (project.aspectRatio) {
    case '9:16': return { width: base, height: Math.round(base * 16 / 9) };
    case '1:1': return { width: base, height: base };
    case '4:5': return { width: base, height: Math.round(base * 5 / 4) };
    default: return { width: base, height: Math.round(base * 9 / 16) };
  }
}

function pickMimeType(): string {
  if (typeof MediaRecorder === 'undefined') throw new Error('This browser does not provide MediaRecorder export support.');
  const candidates = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
  return candidates.find((mime) => MediaRecorder.isTypeSupported(mime)) || '';
}

/**
 * Stable browser export path. It intentionally uses the browser's supported
 * MediaRecorder container instead of pretending a WebM stream is an MP4 file.
 * Native Android/iOS export remains the place for deterministic H.264 MP4.
 */
export async function exportVideoCanvas(
  project: Project,
  exportResolution: '720p' | '1080p' | '4K',
  exportFps: number,
  onProgress: (percent: number, status: string) => void,
): Promise<string> {
  if (typeof document === 'undefined') throw new Error('Browser export is unavailable in this runtime.');
  const mime = pickMimeType();
  if (!mime) throw new Error('No supported browser video export format was found.');

  const { width, height } = getOutputSize(project, exportResolution);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create the export canvas.');

  onProgress(3, 'Loading project media...');
  const media = new Map<string, HTMLVideoElement | HTMLImageElement>();
  for (const clip of project.clips) {
    if (media.has(clip.url)) continue;
    if (clip.type === 'video') {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = 'anonymous';
      video.src = clip.url;
      await new Promise<void>((resolve) => {
        const done = () => resolve();
        video.addEventListener('loadeddata', done, { once: true });
        video.addEventListener('error', done, { once: true });
        window.setTimeout(done, 2500);
        video.load();
      });
      media.set(clip.url, video);
    } else {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.src = clip.url;
      await new Promise<void>((resolve) => {
        image.onload = () => resolve();
        image.onerror = () => resolve();
        window.setTimeout(resolve, 2500);
      });
      media.set(clip.url, image);
    }
  }

  const stream = canvas.captureStream(exportFps);
  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (event) => { if (event.data?.size) chunks.push(event.data); };

  const result = new Promise<string>((resolve, reject) => {
    recorder.onerror = () => reject(new Error('The browser video recorder stopped unexpectedly.'));
    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      const blob = new Blob(chunks, { type: mime });
      if (!blob.size) { reject(new Error('Export produced an empty video file.')); return; }
      onProgress(100, 'Export complete.');
      resolve(URL.createObjectURL(blob));
    };
  });

  recorder.start(250);
  const frameDuration = 1 / Math.max(1, exportFps);
  const totalFrames = Math.max(1, Math.ceil(project.duration * exportFps));

  for (let frame = 0; frame < totalFrames; frame++) {
    const timelineTime = Math.min(project.duration, frame * frameDuration);
    const { clip, clipLocalTime } = getActiveClipAtTime(project.clips, timelineTime);
    ctx.save();
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, width, height);

    if (clip) {
      const source = media.get(clip.url);
      if (source) {
        if (source instanceof HTMLVideoElement) await seekVideo(source, clipLocalTime);
        const sourceWidth = source instanceof HTMLVideoElement ? source.videoWidth : source.naturalWidth;
        const sourceHeight = source instanceof HTMLVideoElement ? source.videoHeight : source.naturalHeight;
        const sw = sourceWidth || width;
        const sh = sourceHeight || height;
        let cropW = sw;
        let cropH = sh;
        const ratio = clip.crop?.ratio;
        if (ratio && ratio !== 'free') {
          const target = ratio === '9:16' ? 9/16 : ratio === '16:9' ? 16/9 : ratio === '1:1' ? 1 : ratio === '4:5' ? 4/5 : 4/3;
          const current = sw / sh;
          if (current > target) cropW = sh * target; else cropH = sw / target;
        }
        const sx = (sw - cropW) / 2;
        const sy = (sh - cropH) / 2;
        const scale = Math.max(width / cropW, height / cropH);
        const drawW = cropW * scale;
        const drawH = cropH * scale;
        ctx.translate(width / 2, height / 2);
        ctx.rotate(((clip.rotation || 0) * Math.PI) / 180);
        ctx.filter = getCssFilterString(clip.filters);
        ctx.drawImage(source, sx, sy, cropW, cropH, -drawW / 2, -drawH / 2, drawW, drawH);
      }
    }
    ctx.restore();

    for (const text of project.textLayers) {
      if (timelineTime < text.startTime || timelineTime > text.startTime + text.duration) continue;
      ctx.save();
      ctx.fillStyle = text.backgroundColor && text.backgroundColor !== 'transparent' ? text.backgroundColor : 'transparent';
      ctx.font = `${text.isBold ? '700' : '400'} ${Math.max(12, text.fontSize * width / 500)}px sans-serif`;
      ctx.textAlign = text.alignment || 'center';
      const x = (text.x / 100) * width;
      const y = (text.y / 100) * height;
      const metrics = ctx.measureText(text.text);
      if (ctx.fillStyle !== 'transparent') ctx.fillRect(x - metrics.width / 2 - 10, y - text.fontSize, metrics.width + 20, text.fontSize * 1.5);
      ctx.fillStyle = text.color || '#fff';
      ctx.fillText(text.text, x, y);
      ctx.restore();
    }

    onProgress(Math.min(96, Math.round(((frame + 1) / totalFrames) * 96)), `Rendering ${frame + 1}/${totalFrames}`);
    await wait(frameDuration * 1000);
  }

  recorder.stop();
  return result;
}
