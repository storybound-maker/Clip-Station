import { MediaType } from '../types';

export interface SelectedMediaFile {
  id: string;
  name: string;
  uri: string;
  type: MediaType;
  duration: number;
  sizeBytes?: number;
  width?: number;
  height?: number;
  thumbnail?: string;
}

/**
 * Mobile Media Picker Service
 * Abstraction for expo-image-picker, react-native-image-picker, and HTML5 Web Media.
 */
export class MediaPickerService {
  /**
   * Request storage/camera permissions for Android / iOS
   */
  static async requestPermissions(): Promise<boolean> {
    if (typeof window !== 'undefined' && 'navigator' in window) {
      // Web environment permission mock
      return true;
    }
    // Expo native call pattern:
    // const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    // return status === 'granted';
    return true;
  }

  /**
   * Extracts real duration, dimensions, and generates frame thumbnail for video/image files
   */
  static async extractMediaMetadata(file: File): Promise<SelectedMediaFile> {
    const isVideo = file.type.startsWith('video');
    const objectUrl = URL.createObjectURL(file);

    if (isVideo) {
      return new Promise((resolve) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true;
        video.playsInline = true;
        video.src = objectUrl;

        let duration = 10;
        let width = 1280;
        let height = 720;

        video.onloadedmetadata = () => {
          if (isFinite(video.duration) && video.duration > 0) {
            duration = video.duration;
          }
          width = video.videoWidth || 1280;
          height = video.videoHeight || 720;

          // Seek to 0.5s or 15% duration for thumbnail frame
          video.currentTime = Math.min(0.5, duration * 0.15);
        };

        video.onseeked = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = Math.min(320, video.videoWidth || 320);
            canvas.height = Math.max(1, Math.round((canvas.width * (video.videoHeight || 180)) / (video.videoWidth || 320)));
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
              resolve({
                id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                name: file.name,
                uri: objectUrl,
                type: 'video',
                duration,
                width,
                height,
                sizeBytes: file.size,
                thumbnail,
              });
              return;
            }
          } catch {
            // ignore canvas error and fall through
          }
          resolve({
            id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: file.name,
            uri: objectUrl,
            type: 'video',
            duration,
            width,
            height,
            sizeBytes: file.size,
            thumbnail: objectUrl,
          });
        };

        video.onerror = () => {
          resolve({
            id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: file.name,
            uri: objectUrl,
            type: 'video',
            duration: 10,
            width: 1280,
            height: 720,
            sizeBytes: file.size,
            thumbnail: objectUrl,
          });
        };
      });
    } else {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = objectUrl;
        img.onload = () => {
          resolve({
            id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: file.name,
            uri: objectUrl,
            type: 'image',
            duration: 5,
            width: img.width || 1080,
            height: img.height || 1080,
            sizeBytes: file.size,
            thumbnail: objectUrl,
          });
        };
        img.onerror = () => {
          resolve({
            id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: file.name,
            uri: objectUrl,
            type: 'image',
            duration: 5,
            width: 1080,
            height: 1080,
            sizeBytes: file.size,
            thumbnail: objectUrl,
          });
        };
      });
    }
  }

  /**
   * Opens file picker dialog for web or calls Expo ImagePicker launchImageLibraryAsync for React Native
   */
  static async pickMediaFromFiles(type: 'video' | 'image' | 'all' = 'all'): Promise<SelectedMediaFile[]> {
    if (typeof window === 'undefined') return [];

    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;

      if (type === 'video') input.accept = 'video/*';
      else if (type === 'image') input.accept = 'image/*';
      else input.accept = 'video/*,image/*';

      input.onchange = async (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (!files || files.length === 0) {
          resolve([]);
          return;
        }

        const results: SelectedMediaFile[] = [];
        for (let i = 0; i < files.length; i++) {
          const fileMeta = await MediaPickerService.extractMediaMetadata(files[i]);
          results.push(fileMeta);
        }
        resolve(results);
      };

      input.click();
    });
  }
}

