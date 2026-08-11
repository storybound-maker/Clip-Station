export interface SampleMedia {
  id: string;
  name: string;
  type: 'video' | 'image';
  url: string;
  thumbnail: string;
  duration: number; // in seconds
  category: 'Cinematic' | 'Nature' | 'Urban' | 'Abstract' | 'Graphics';
  aspectRatio: '9:16' | '16:9' | '1:1';
}

export const SAMPLE_MEDIA_LIBRARY: SampleMedia[] = [
  {
    id: 'sample_vid_1',
    name: 'Cyberpunk Neon Street',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=400&auto=format&fit=crop',
    duration: 15,
    category: 'Cinematic',
    aspectRatio: '16:9',
  },
  {
    id: 'sample_vid_2',
    name: 'Abstract Glowing Waves',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=400&auto=format&fit=crop',
    duration: 10,
    category: 'Abstract',
    aspectRatio: '16:9',
  },
  {
    id: 'sample_vid_3',
    name: 'Futuristic Drone City',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&auto=format&fit=crop',
    duration: 12,
    category: 'Urban',
    aspectRatio: '16:9',
  },
  {
    id: 'sample_vid_4',
    name: 'Cosmic Nebula Motion',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&auto=format&fit=crop',
    duration: 14,
    category: 'Abstract',
    aspectRatio: '16:9',
  },
  {
    id: 'sample_img_1',
    name: 'Neo Tokyo Tower',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=400&auto=format&fit=crop',
    duration: 5,
    category: 'Urban',
    aspectRatio: '9:16',
  },
  {
    id: 'sample_img_2',
    name: 'Dark Geometric Grid',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop',
    duration: 5,
    category: 'Abstract',
    aspectRatio: '1:1',
  },
  {
    id: 'sample_img_3',
    name: 'Electric Prism Lighting',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=400&auto=format&fit=crop',
    duration: 5,
    category: 'Graphics',
    aspectRatio: '9:16',
  }
];

export interface SampleAudio {
  id: string;
  name: string;
  artist: string;
  duration: number;
  type: 'music' | 'sfx' | 'voiceover';
  url: string;
}

export const SAMPLE_AUDIO_LIBRARY: SampleAudio[] = [
  {
    id: 'audio_1',
    name: 'Synthwave Cyber Beat',
    artist: 'Clip Station Audio Lab',
    duration: 30,
    type: 'music',
    url: 'https://actions.google.com/sounds/v1/science_fiction/alien_beacon.ogg'
  },
  {
    id: 'audio_2',
    name: 'Futuristic Whoosh SFX',
    artist: 'Sound FX',
    duration: 3,
    type: 'sfx',
    url: 'https://actions.google.com/sounds/v1/science_fiction/deep_whoosh.ogg'
  },
  {
    id: 'audio_3',
    name: 'Ambient Electronic Chill',
    artist: 'Clip Station Music',
    duration: 45,
    type: 'music',
    url: 'https://actions.google.com/sounds/v1/ambiences/outdoor_rain.ogg'
  }
];
