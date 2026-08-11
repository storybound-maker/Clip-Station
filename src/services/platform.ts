export type SupportedPlatform = 'android' | 'ios' | 'web';

export interface PlatformCapabilities {
  platform: SupportedPlatform;
  hasNativeFFmpeg: boolean;
  hasHardwareAcceleration: boolean;
  hasDirectFileUriAccess: boolean;
  supportsMultiTrackAudio: boolean;
  exportEngine: 'ffmpeg_native' | 'expo_video_composer' | 'web_canvas_fallback';
}

export const getPlatform = (): SupportedPlatform => {
  // Safe runtime platform detection for React Native / Web hybrid container
  if (typeof window !== 'undefined' && window.navigator) {
    const ua = window.navigator.userAgent.toLowerCase();
    if (ua.includes('android')) return 'android';
    if (ua.includes('iphone') || ua.includes('ipad')) return 'ios';
  }
  return 'android'; // Default target platform is Android
};

export const getPlatformCapabilities = (): PlatformCapabilities => {
  const current = getPlatform();
  if (current === 'android') {
    return {
      platform: 'android',
      hasNativeFFmpeg: true,
      hasHardwareAcceleration: true,
      hasDirectFileUriAccess: true,
      supportsMultiTrackAudio: true,
      exportEngine: 'ffmpeg_native',
    };
  }
  if (current === 'ios') {
    return {
      platform: 'ios',
      hasNativeFFmpeg: true,
      hasHardwareAcceleration: true,
      hasDirectFileUriAccess: true,
      supportsMultiTrackAudio: true,
      exportEngine: 'expo_video_composer',
    };
  }
  return {
    platform: 'web',
    hasNativeFFmpeg: false,
    hasHardwareAcceleration: false,
    hasDirectFileUriAccess: false,
    supportsMultiTrackAudio: true,
    exportEngine: 'web_canvas_fallback',
  };
};

export const formatLocalUri = (uri: string): string => {
  if (!uri) return '';
  if (uri.startsWith('content://') || uri.startsWith('file://') || uri.startsWith('ph://')) {
    return uri;
  }
  return uri;
};
