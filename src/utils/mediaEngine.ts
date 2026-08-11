import { Clip, Project, TextLayer } from '../types';

/**
 * Format time in seconds to MM:SS.SS or MM:SS
 */
export function formatTime(seconds: number, includeMillis: boolean = true): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 100);

  const pad = (num: number) => num.toString().padStart(2, '0');

  if (includeMillis) {
    return `${pad(mins)}:${pad(secs)}.${pad(millis)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

/**
 * Recalculate timeline positions and total project duration
 */
export function recalculateTimeline(clips: Clip[]): { clips: Clip[]; totalDuration: number } {
  let currentTime = 0;
  const updatedClips = clips.map((clip) => {
    // Effective duration on timeline considering speed
    const effectiveDuration = (clip.sourceOut - clip.sourceIn) / (clip.speed || 1);
    const updatedClip: Clip = {
      ...clip,
      startTime: currentTime,
      duration: Math.max(0.1, effectiveDuration),
    };
    currentTime += updatedClip.duration;
    return updatedClip;
  });

  return {
    clips: updatedClips,
    totalDuration: Math.max(1, currentTime),
  };
}

/**
 * Find which clip is active at the given timeline time position
 */
export function getActiveClipAtTime(
  clips: Clip[],
  time: number
): { clip: Clip | null; clipLocalTime: number; clipIndex: number } {
  for (let i = 0; i < clips.length; i++) {
    const clip = clips[i];
    if (time >= clip.startTime && time <= clip.startTime + clip.duration) {
      // Local time inside the source video
      const offsetOnTimeline = time - clip.startTime;
      const clipLocalTime = clip.sourceIn + offsetOnTimeline * clip.speed;
      return { clip, clipLocalTime, clipIndex: i };
    }
  }

  // If time exceeds last clip, return last clip or null
  if (clips.length > 0) {
    if (time < clips[0].startTime) {
      return { clip: clips[0], clipLocalTime: clips[0].sourceIn, clipIndex: 0 };
    }
    const last = clips[clips.length - 1];
    return { clip: last, clipLocalTime: last.sourceOut, clipIndex: clips.length - 1 };
  }

  return { clip: null, clipLocalTime: 0, clipIndex: -1 };
}

/**
 * Split a clip at a given timeline split time
 */
export function splitClipAtTime(
  clip: Clip,
  splitTimelineTime: number
): { clip1: Clip; clip2: Clip } | null {
  if (
    splitTimelineTime <= clip.startTime + 0.1 ||
    splitTimelineTime >= clip.startTime + clip.duration - 0.1
  ) {
    return null; // Too close to boundaries
  }

  const offsetOnTimeline = splitTimelineTime - clip.startTime;
  const sourceSplitPoint = clip.sourceIn + offsetOnTimeline * clip.speed;

  const clip1: Clip = {
    ...clip,
    id: `clip_${Date.now()}_1`,
    sourceOut: sourceSplitPoint,
    duration: offsetOnTimeline,
  };

  const clip2: Clip = {
    ...clip,
    id: `clip_${Date.now()}_2`,
    startTime: splitTimelineTime,
    sourceIn: sourceSplitPoint,
    duration: clip.duration - offsetOnTimeline,
  };

  return { clip1, clip2 };
}

/**
 * Generate CSS filter string from filter settings
 */
export function getCssFilterString(filters: Clip['filters']): string {
  if (!filters) return 'none';
  const brightness = 100 + filters.brightness;
  const contrast = 100 + filters.contrast;
  const saturate = 100 + filters.saturation;
  return `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%)`;
}

/**
 * High-performance Video Canvas Exporter
 * Renders real video frames, images, filters, and text layers onto a canvas stream,
 * encoding them into an actual playable/downloadable video blob (MP4/WebM).
 */
export async function exportVideoCanvas(
  project: Project,
  exportResolution: '720p' | '1080p' | '4K',
  exportFps: number,
  onProgress: (percent: number, status: string) => void
): Promise<string> {
  let width = 1920;
  let height = 1080;

  if (project.aspectRatio === '9:16') {
    width = exportResolution === '4K' ? 2160 : exportResolution === '1080p' ? 1080 : 720;
    height = exportResolution === '4K' ? 3840 : exportResolution === '1080p' ? 1920 : 1280;
  } else if (project.aspectRatio === '1:1') {
    width = exportResolution === '4K' ? 2160 : exportResolution === '1080p' ? 1080 : 720;
    height = width;
  } else if (project.aspectRatio === '16:9') {
    width = exportResolution === '4K' ? 3840 : exportResolution === '1080p' ? 1920 : 1280;
    height = exportResolution === '4K' ? 2160 : exportResolution === '1080p' ? 1080 : 720;
  } else {
    width = 1080;
    height = 1350;
  }

  onProgress(5, 'Preloading clip video & image assets...');

  const mediaElements = new Map<string, HTMLVideoElement | HTMLImageElement>();

  for (const clip of project.clips) {
    if (!mediaElements.has(clip.url)) {
      if (clip.type === 'video') {
        const vid = document.createElement('video');
        vid.crossOrigin = 'anonymous';
        vid.preload = 'auto';
        vid.muted = true;
        vid.playsInline = true;
        vid.src = clip.url;
        await new Promise((res) => {
          vid.onloadeddata = res;
          vid.onerror = res;
          setTimeout(res, 2000);
        });
        mediaElements.set(clip.url, vid);
      } else {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = clip.url;
        await new Promise((res) => {
          img.onload = res;
          img.onerror = res;
          setTimeout(res, 2000);
        });
        mediaElements.set(clip.url, img);
      }
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not obtain 2D rendering context');

  const stream = typeof (canvas as any).captureStream === 'function' ? (canvas as any).captureStream(0) : null;
  const videoTrack = stream ? stream.getVideoTracks()[0] : null;
  const hasRequestFrame = videoTrack && typeof (videoTrack as any).requestFrame === 'function';

  // Fallback to auto-capture stream if requestFrame is unavailable
  const activeStream = hasRequestFrame ? stream : (canvas as any).captureStream(exportFps);

  let selectedMime = 'video/webm';
  const candidateMimes = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4',
  ];

  for (const mime of candidateMimes) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mime)) {
      selectedMime = mime;
      break;
    }
  }

  const mediaRecorder = new MediaRecorder(activeStream, { mimeType: selectedMime });
  const chunks: Blob[] = [];

  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  return new Promise((resolve, reject) => {
    mediaRecorder.onstop = () => {
      const finalBlob = new Blob(chunks, { type: selectedMime || 'video/mp4' });
      if (finalBlob.size === 0) {
        reject(new Error('Exported video file is empty (0 bytes). Please try again.'));
        return;
      }
      const videoUrl = URL.createObjectURL(finalBlob);
      onProgress(100, 'Export complete!');
      resolve(videoUrl);
    };

    mediaRecorder.onerror = (e) => reject(e);

    mediaRecorder.start(100);

    const totalDuration = project.duration;
    const totalFrames = Math.max(15, Math.ceil(totalDuration * exportFps));
    let frameIndex = 0;

    const renderNextFrame = async () => {
      if (frameIndex >= totalFrames) {
        onProgress(98, 'Finalizing output video stream...');
        setTimeout(() => {
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
        }, 200);
        return;
      }

      const currentTime = (frameIndex / totalFrames) * totalDuration;
      const percent = Math.min(95, Math.floor((frameIndex / totalFrames) * 90) + 8);
      onProgress(percent, `Rendering frame ${frameIndex + 1}/${totalFrames} (${currentTime.toFixed(1)}s)...`);

      // Clear Canvas
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, width, height);

      // Get active clip for timestamp
      const { clip, clipLocalTime } = getActiveClipAtTime(project.clips, currentTime);

      if (clip) {
        const media = mediaElements.get(clip.url);

        ctx.save();
        ctx.translate(width / 2, height / 2);

        if (clip.rotation) {
          ctx.rotate((clip.rotation * Math.PI) / 180);
        }

        const f = clip.filters || { brightness: 0, contrast: 0, saturation: 0, exposure: 0, vignette: 0 };
        const brightnessVal = 100 + f.brightness;
        const contrastVal = 100 + f.contrast;
        const saturateVal = 100 + f.saturation;
        ctx.filter = `brightness(${brightnessVal}%) contrast(${contrastVal}%) saturate(${saturateVal}%)`;

        if (clip.type === 'video' && media instanceof HTMLVideoElement) {
          if (Math.abs(media.currentTime - clipLocalTime) > 0.03) {
            await new Promise<void>((resolveSeek) => {
              let isDone = false;
              const handleSeeked = () => {
                if (!isDone) {
                  isDone = true;
                  media.removeEventListener('seeked', handleSeeked);
                  resolveSeek();
                }
              };
              media.addEventListener('seeked', handleSeeked);
              media.currentTime = clipLocalTime;
              setTimeout(() => {
                if (!isDone) {
                  isDone = true;
                  media.removeEventListener('seeked', handleSeeked);
                  resolveSeek();
                }
              }, 100);
            });
          }
        }

        const mediaWidth =
          media instanceof HTMLVideoElement
            ? media.videoWidth || width
            : media instanceof HTMLImageElement
            ? media.naturalWidth || width
            : width;
        const mediaHeight =
          media instanceof HTMLVideoElement
            ? media.videoHeight || height
            : media instanceof HTMLImageElement
            ? media.naturalHeight || height
            : height;

        let sx = 0;
        let sy = 0;
        let sWidth = mediaWidth;
        let sHeight = mediaHeight;

        if (clip.crop?.ratio && clip.crop.ratio !== 'free') {
          let targetRatio = 1;
          if (clip.crop.ratio === '16:9') targetRatio = 16 / 9;
          else if (clip.crop.ratio === '9:16') targetRatio = 9 / 16;
          else if (clip.crop.ratio === '1:1') targetRatio = 1;
          else if (clip.crop.ratio === '4:5') targetRatio = 4 / 5;
          else if (clip.crop.ratio === '4:3') targetRatio = 4 / 3;

          const currentRatio = mediaWidth / mediaHeight;
          if (currentRatio > targetRatio) {
            sWidth = mediaHeight * targetRatio;
            sHeight = mediaHeight;
            sx = (mediaWidth - sWidth) / 2;
          } else {
            sWidth = mediaWidth;
            sHeight = mediaWidth / targetRatio;
            sy = (mediaHeight - sHeight) / 2;
          }
        }

        let drawW = width;
        let drawH = height;
        if (clip.rotation === 90 || clip.rotation === 270) {
          drawW = height;
          drawH = width;
        }

        try {
          ctx.drawImage(media, sx, sy, sWidth, sHeight, -drawW / 2, -drawH / 2, drawW, drawH);
        } catch {
          ctx.fillStyle = '#1A1A1A';
          ctx.fillRect(-drawW / 2, -drawH / 2, drawW, drawH);
        }

        ctx.restore();
      }

      // Render Active Text Layers
      project.textLayers.forEach((textLayer) => {
        if (
          currentTime >= textLayer.startTime &&
          currentTime <= textLayer.startTime + textLayer.duration
        ) {
          ctx.save();
          const posX = (textLayer.x / 100) * width;
          const posY = (textLayer.y / 100) * height;

          ctx.font = `${textLayer.isBold ? 'bold' : 'normal'} ${textLayer.fontSize * (width / 500)}px ${textLayer.fontFamily || 'sans-serif'}`;
          ctx.textAlign = textLayer.alignment || 'center';

          if (textLayer.backgroundColor && textLayer.backgroundColor !== 'transparent') {
            ctx.fillStyle = textLayer.backgroundColor;
            const textMetrics = ctx.measureText(textLayer.text);
            const padding = 16;
            ctx.fillRect(
              posX - textMetrics.width / 2 - padding,
              posY - textLayer.fontSize * (width / 500) - padding / 2,
              textMetrics.width + padding * 2,
              textLayer.fontSize * (width / 500) * 1.4
            );
          }

          ctx.fillStyle = textLayer.color || '#FFFFFF';
          ctx.fillText(textLayer.text, posX, posY);
          ctx.restore();
        }
      });

      // Render Active Sticker Layers
      if (project.stickerLayers) {
        project.stickerLayers.forEach((sticker) => {
          if (
            currentTime >= sticker.startTime &&
            currentTime <= sticker.startTime + sticker.duration
          ) {
            ctx.save();
            const posX = (sticker.x / 100) * width;
            const posY = (sticker.y / 100) * height;
            const scale = sticker.scale || 1;
            const size = 60 * (width / 500) * scale;

            ctx.translate(posX, posY);
            if (sticker.rotation) {
              ctx.rotate((sticker.rotation * Math.PI) / 180);
            }
            ctx.font = `${size}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(sticker.emojiOrUrl, 0, 0);
            ctx.restore();
          }
        });
      }

      // Watermark
      ctx.save();
      ctx.font = '700 18px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.textAlign = 'right';
      ctx.fillText('CLIP STATION', width - 24, height - 24);
      ctx.restore();

      // Trigger precise frame capture if videoTrack requestFrame is available
      if (hasRequestFrame && typeof (videoTrack as any).requestFrame === 'function') {
        (videoTrack as any).requestFrame();
      }

      frameIndex++;
      setTimeout(renderNextFrame, hasRequestFrame ? 5 : 1000 / exportFps);
    };

    renderNextFrame();
  });
}
