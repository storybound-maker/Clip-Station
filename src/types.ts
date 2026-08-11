export type MediaType = 'video' | 'image';

export type AspectRatio = '9:16' | '16:9' | '1:1' | '4:5';

export interface CropSettings {
  x: number;
  y: number;
  width: number;
  height: number;
  ratio: 'free' | '9:16' | '16:9' | '1:1' | '4:5' | '4:3';
}

export interface FilterSettings {
  brightness: number; // -100 to 100 (default 0)
  contrast: number;   // -100 to 100 (default 0)
  saturation: number; // -100 to 100 (default 0)
  exposure: number;   // -100 to 100 (default 0)
  vignette: number;   // 0 to 100 (default 0)
}

export interface Clip {
  id: string;
  mediaId: string;
  type: MediaType;
  name: string;
  url: string;
  thumbnail: string;
  startTime: number;    // Timeline position in seconds
  duration: number;     // Duration on timeline in seconds
  sourceIn: number;     // Source start trim point in seconds
  sourceOut: number;    // Source end trim point in seconds
  originalDuration: number; // Native file duration
  speed: number;        // e.g. 0.5, 1, 1.5, 2
  volume: number;       // 0 to 200 (100 default)
  crop: CropSettings;
  rotation: number;     // 0, 90, 180, 270
  filters: FilterSettings;
}

export interface TextLayer {
  id: string;
  text: string;
  startTime: number;
  duration: number;
  x: number;            // Percentage 0-100
  y: number;            // Percentage 0-100
  fontSize: number;     // Default e.g. 24
  fontFamily: 'sans' | 'serif' | 'mono' | 'display' | 'handwriting';
  color: string;        // Hex string
  backgroundColor: string; // Hex string or transparent
  alignment: 'left' | 'center' | 'right';
  isBold: boolean;
  isItalic: boolean;
  borderWidth: number;  // Stroke width
  borderColor: string;  // Stroke color
}

export interface AudioLayer {
  id: string;
  name: string;
  url: string;
  startTime: number;
  duration: number;
  volume: number;       // 0 to 200
  type: 'music' | 'sfx' | 'voiceover';
}

export interface StickerLayer {
  id: string;
  emojiOrUrl: string;
  startTime: number;
  duration: number;
  x: number;            // Percentage 0-100
  y: number;            // Percentage 0-100
  scale: number;        // Scale multiplier (e.g. 1)
  rotation: number;     // Rotation angle in degrees
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  duration: number;
  thumbnail: string;
  aspectRatio: AspectRatio;
  clips: Clip[];
  textLayers: TextLayer[];
  audioLayers: AudioLayer[];
  stickerLayers?: StickerLayer[];
  isDraft: boolean;
}

export interface ExportSettings {
  resolution: '720p' | '1080p' | '4K';
  fps: 24 | 30 | 60;
  format: 'mp4' | 'webm';
  quality: 'standard' | 'high';
}

export type ActiveTool = 
  | null
  | 'trim'
  | 'split'
  | 'duplicate'
  | 'delete'
  | 'speed'
  | 'volume'
  | 'crop'
  | 'rotate'
  | 'adjust'
  | 'text'
  | 'audio'
  | 'stickers'
  | 'reorder';

export type NavigationTab = 'home' | 'projects' | 'new_project' | 'editor' | 'export' | 'settings';
