import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Project,
  Clip,
  TextLayer,
  AudioLayer,
  StickerLayer,
  NavigationTab,
  ActiveTool,
  AspectRatio,
} from '../types';
import { SAMPLE_MEDIA_LIBRARY } from '../data/sampleMedia';
import { recalculateTimeline, splitClipAtTime } from '../utils/mediaEngine';

interface HistoryState {
  past: Project[];
  future: Project[];
}

interface ProjectContextType {
  projects: Project[];
  activeProject: Project | null;
  activeTab: NavigationTab;
  activeTool: ActiveTool;
  selectedClipId: string | null;
  selectedTextLayerId: string | null;
  selectedAudioLayerId: string | null;
  currentTime: number;
  isPlaying: boolean;
  zoomLevel: number;
  phoneFrameMode: boolean;
  permissionsGranted: boolean;

  // Actions
  setActiveTab: (tab: NavigationTab) => void;
  setActiveTool: (tool: ActiveTool) => void;
  setSelectedClipId: (id: string | null) => void;
  setSelectedTextLayerId: (id: string | null) => void;
  setSelectedAudioLayerId: (id: string | null) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean | ((prev: boolean) => boolean)) => void;
  setZoomLevel: (zoom: number | ((prev: number) => number)) => void;
  setPhoneFrameMode: (enabled: boolean | ((prev: boolean) => boolean)) => void;
  setPermissionsGranted: (granted: boolean) => void;

  // Project CRUD
  createProject: (name: string, aspectRatio: AspectRatio, mediaItems: Array<{ url: string; name: string; type: 'video' | 'image'; duration: number; thumbnail: string }>) => Project;
  selectProject: (id: string) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => void;

  // Editing Actions
  updateClip: (clipId: string, updates: Partial<Clip>) => void;
  splitClip: (clipId: string, splitTime?: number) => void;
  trimClip: (clipId: string, newSourceIn: number, newSourceOut: number) => void;
  deleteClip: (clipId: string) => void;
  duplicateClip: (clipId: string) => void;
  reorderClips: (fromIndex: number, toIndex: number) => void;

  // Text Layer Actions
  addTextLayer: (text?: string) => void;
  updateTextLayer: (id: string, updates: Partial<TextLayer>) => void;
  deleteTextLayer: (id: string) => void;

  // Audio Layer Actions
  addAudioLayer: (audio: { name: string; url: string; duration: number; type: 'music' | 'sfx' | 'voiceover' }) => void;
  updateAudioLayer: (id: string, updates: Partial<AudioLayer>) => void;
  deleteAudioLayer: (id: string) => void;

  // Sticker Layer Actions
  addStickerLayer?: (emojiOrUrl: string) => void;
  deleteStickerLayer?: (id: string) => void;

  // Undo / Redo
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'clip_station_projects_v1';

// Initial Demo Project
const DEFAULT_INITIAL_PROJECT: Project = {
  id: 'proj_demo_1',
  name: 'Cyberpunk Teaser',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  duration: 25,
  thumbnail: SAMPLE_MEDIA_LIBRARY[0].thumbnail,
  aspectRatio: '9:16',
  isDraft: false,
  clips: [
    {
      id: 'clip_demo_1',
      mediaId: SAMPLE_MEDIA_LIBRARY[0].id,
      type: 'video',
      name: SAMPLE_MEDIA_LIBRARY[0].name,
      url: SAMPLE_MEDIA_LIBRARY[0].url,
      thumbnail: SAMPLE_MEDIA_LIBRARY[0].thumbnail,
      startTime: 0,
      duration: 15,
      sourceIn: 0,
      sourceOut: 15,
      originalDuration: 15,
      speed: 1,
      volume: 100,
      crop: { x: 0, y: 0, width: 100, height: 100, ratio: '9:16' },
      rotation: 0,
      filters: { brightness: 10, contrast: 15, saturation: 20, exposure: 0, vignette: 10 },
    },
    {
      id: 'clip_demo_2',
      mediaId: SAMPLE_MEDIA_LIBRARY[1].id,
      type: 'video',
      name: SAMPLE_MEDIA_LIBRARY[1].name,
      url: SAMPLE_MEDIA_LIBRARY[1].url,
      thumbnail: SAMPLE_MEDIA_LIBRARY[1].thumbnail,
      startTime: 15,
      duration: 10,
      sourceIn: 0,
      sourceOut: 10,
      originalDuration: 10,
      speed: 1,
      volume: 100,
      crop: { x: 0, y: 0, width: 100, height: 100, ratio: '9:16' },
      rotation: 0,
      filters: { brightness: 0, contrast: 0, saturation: 0, exposure: 0, vignette: 0 },
    },
  ],
  textLayers: [
    {
      id: 'text_demo_1',
      text: 'CLIP STATION V1.0',
      startTime: 2,
      duration: 8,
      x: 50,
      y: 20,
      fontSize: 28,
      fontFamily: 'display',
      color: '#FFFFFF',
      backgroundColor: 'rgba(0,0,0,0.6)',
      alignment: 'center',
      isBold: true,
      isItalic: false,
      borderWidth: 0,
      borderColor: '#000000',
    },
  ],
  audioLayers: [],
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved projects', e);
    }
    return [DEFAULT_INITIAL_PROJECT];
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    return projects[0]?.id || DEFAULT_INITIAL_PROJECT.id;
  });

  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [selectedTextLayerId, setSelectedTextLayerId] = useState<string | null>(null);
  const [selectedAudioLayerId, setSelectedAudioLayerId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(30); // pixels per second
  const [phoneFrameMode, setPhoneFrameMode] = useState<boolean>(false);
  const [permissionsGranted, setPermissionsGranted] = useState<boolean>(true);

  // Undo/Redo history stack for active project
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    future: [],
  });

  // Active Project Reference
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0] || null;

  // Persist projects
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.warn('Could not save projects to localStorage', e);
    }
  }, [projects]);

  // Push state to Undo History before modification
  const pushHistory = useCallback(
    (currentProj: Project) => {
      setHistory((prev) => ({
        past: [...prev.past.slice(-20), JSON.parse(JSON.stringify(currentProj))], // Max 20 undo steps
        future: [],
      }));
    },
    []
  );

  const saveProjectState = useCallback(
    (updatedProj: Project) => {
      setProjects((prev) =>
        prev.map((p) => (p.id === updatedProj.id ? { ...updatedProj, updatedAt: new Date().toISOString() } : p))
      );
    },
    []
  );

  const undo = useCallback(() => {
    if (history.past.length === 0 || !activeProject) return;

    const previousProj = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, history.past.length - 1);

    setHistory({
      past: newPast,
      future: [JSON.parse(JSON.stringify(activeProject)), ...history.future],
    });

    saveProjectState(previousProj);
  }, [history, activeProject, saveProjectState]);

  const redo = useCallback(() => {
    if (history.future.length === 0 || !activeProject) return;

    const nextProj = history.future[0];
    const newFuture = history.future.slice(1);

    setHistory({
      past: [...history.past, JSON.parse(JSON.stringify(activeProject))],
      future: newFuture,
    });

    saveProjectState(nextProj);
  }, [history, activeProject, saveProjectState]);

  // Project CRUD
  const createProject = useCallback(
    (
      name: string,
      aspectRatio: AspectRatio,
      mediaItems: Array<{ url: string; name: string; type: 'video' | 'image'; duration: number; thumbnail: string }>
    ) => {
      let startTime = 0;
      const initialClips: Clip[] = mediaItems.map((item, idx) => {
        const duration = item.duration || (item.type === 'image' ? 5 : 10);
        const clip: Clip = {
          id: `clip_${Date.now()}_${idx}`,
          mediaId: `media_${Date.now()}_${idx}`,
          type: item.type,
          name: item.name,
          url: item.url,
          thumbnail: item.thumbnail || item.url,
          startTime: startTime,
          duration: duration,
          sourceIn: 0,
          sourceOut: duration,
          originalDuration: duration,
          speed: 1,
          volume: 100,
          crop: { x: 0, y: 0, width: 100, height: 100, ratio: 'free' },
          rotation: 0,
          filters: { brightness: 0, contrast: 0, saturation: 0, exposure: 0, vignette: 0 },
        };
        startTime += duration;
        return clip;
      });

      const { clips: formattedClips, totalDuration } = recalculateTimeline(initialClips);

      const newProject: Project = {
        id: `proj_${Date.now()}`,
        name: name || 'New Clip Project',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        duration: totalDuration,
        thumbnail: formattedClips[0]?.thumbnail || SAMPLE_MEDIA_LIBRARY[0].thumbnail,
        aspectRatio: aspectRatio,
        clips: formattedClips,
        textLayers: [],
        audioLayers: [],
        isDraft: false,
      };

      setProjects((prev) => [newProject, ...prev]);
      setActiveProjectId(newProject.id);
      setSelectedClipId(formattedClips[0]?.id || null);
      setCurrentTime(0);
      setHistory({ past: [], future: [] });
      setActiveTab('editor');

      return newProject;
    },
    []
  );

  const selectProject = useCallback((id: string) => {
    setActiveProjectId(id);
    const target = projects.find((p) => p.id === id);
    if (target) {
      setSelectedClipId(target.clips[0]?.id || null);
      setCurrentTime(0);
      setIsPlaying(false);
      setHistory({ past: [], future: [] });
    }
  }, [projects]);

  const updateProject = useCallback(
    (project: Project) => {
      if (activeProject) pushHistory(activeProject);
      saveProjectState(project);
    },
    [activeProject, pushHistory, saveProjectState]
  );

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const duplicateProject = useCallback((id: string) => {
    const target = projects.find((p) => p.id === id);
    if (!target) return;

    const dup: Project = {
      ...JSON.parse(JSON.stringify(target)),
      id: `proj_${Date.now()}`,
      name: `${target.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProjects((prev) => [dup, ...prev]);
  }, [projects]);

  // Clip Editing
  const updateClip = useCallback(
    (clipId: string, updates: Partial<Clip>) => {
      if (!activeProject) return;
      pushHistory(activeProject);

      const updatedClips = activeProject.clips.map((c) => {
        if (c.id === clipId) {
          return { ...c, ...updates };
        }
        return c;
      });

      const { clips: recalClips, totalDuration } = recalculateTimeline(updatedClips);

      saveProjectState({
        ...activeProject,
        clips: recalClips,
        duration: totalDuration,
      });
    },
    [activeProject, pushHistory, saveProjectState]
  );

  const splitClip = useCallback(
    (clipId: string, splitTime?: number) => {
      if (!activeProject) return;
      const targetClip = activeProject.clips.find((c) => c.id === clipId);
      if (!targetClip) return;

      const splitPoint = splitTime ?? currentTime;
      const splitResult = splitClipAtTime(targetClip, splitPoint);

      if (!splitResult) return; // Cannot split

      pushHistory(activeProject);

      const clipIdx = activeProject.clips.findIndex((c) => c.id === clipId);
      const newClips = [...activeProject.clips];
      newClips.splice(clipIdx, 1, splitResult.clip1, splitResult.clip2);

      const { clips: recalClips, totalDuration } = recalculateTimeline(newClips);

      saveProjectState({
        ...activeProject,
        clips: recalClips,
        duration: totalDuration,
      });

      setSelectedClipId(splitResult.clip2.id);
    },
    [activeProject, currentTime, pushHistory, saveProjectState]
  );

  const trimClip = useCallback(
    (clipId: string, newSourceIn: number, newSourceOut: number) => {
      if (!activeProject) return;
      pushHistory(activeProject);

      const updatedClips = activeProject.clips.map((c) => {
        if (c.id === clipId) {
          return {
            ...c,
            sourceIn: Math.max(0, newSourceIn),
            sourceOut: Math.min(c.originalDuration, Math.max(newSourceIn + 0.5, newSourceOut)),
          };
        }
        return c;
      });

      const { clips: recalClips, totalDuration } = recalculateTimeline(updatedClips);

      saveProjectState({
        ...activeProject,
        clips: recalClips,
        duration: totalDuration,
      });
    },
    [activeProject, pushHistory, saveProjectState]
  );

  const deleteClip = useCallback(
    (clipId: string) => {
      if (!activeProject) return;
      if (activeProject.clips.length <= 1) {
        alert('Project must contain at least one clip.');
        return;
      }

      pushHistory(activeProject);

      const filteredClips = activeProject.clips.filter((c) => c.id !== clipId);
      const { clips: recalClips, totalDuration } = recalculateTimeline(filteredClips);

      saveProjectState({
        ...activeProject,
        clips: recalClips,
        duration: totalDuration,
      });

      setSelectedClipId(recalClips[0]?.id || null);
    },
    [activeProject, pushHistory, saveProjectState]
  );

  const duplicateClip = useCallback(
    (clipId: string) => {
      if (!activeProject) return;
      const targetClip = activeProject.clips.find((c) => c.id === clipId);
      if (!targetClip) return;

      pushHistory(activeProject);

      const clipIdx = activeProject.clips.findIndex((c) => c.id === clipId);
      const duplicated: Clip = {
        ...JSON.parse(JSON.stringify(targetClip)),
        id: `clip_${Date.now()}_dup`,
        name: `${targetClip.name} (Copy)`,
      };

      const newClips = [...activeProject.clips];
      newClips.splice(clipIdx + 1, 0, duplicated);

      const { clips: recalClips, totalDuration } = recalculateTimeline(newClips);

      saveProjectState({
        ...activeProject,
        clips: recalClips,
        duration: totalDuration,
      });

      setSelectedClipId(duplicated.id);
    },
    [activeProject, pushHistory, saveProjectState]
  );

  const reorderClips = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (!activeProject) return;
      if (fromIndex < 0 || fromIndex >= activeProject.clips.length) return;
      if (toIndex < 0 || toIndex >= activeProject.clips.length) return;

      pushHistory(activeProject);

      const clipsCopy = [...activeProject.clips];
      const [moved] = clipsCopy.splice(fromIndex, 1);
      clipsCopy.splice(toIndex, 0, moved);

      const { clips: recalClips, totalDuration } = recalculateTimeline(clipsCopy);

      saveProjectState({
        ...activeProject,
        clips: recalClips,
        duration: totalDuration,
      });
    },
    [activeProject, pushHistory, saveProjectState]
  );

  // Text Layer Actions
  const addTextLayer = useCallback(
    (text?: string) => {
      if (!activeProject) return;
      pushHistory(activeProject);

      const newText: TextLayer = {
        id: `text_${Date.now()}`,
        text: text || 'NEW TEXT',
        startTime: currentTime,
        duration: 5,
        x: 50,
        y: 50,
        fontSize: 24,
        fontFamily: 'sans',
        color: '#FFFFFF',
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignment: 'center',
        isBold: true,
        isItalic: false,
        borderWidth: 0,
        borderColor: '#000000',
      };

      saveProjectState({
        ...activeProject,
        textLayers: [...activeProject.textLayers, newText],
      });

      setSelectedTextLayerId(newText.id);
    },
    [activeProject, currentTime, pushHistory, saveProjectState]
  );

  const updateTextLayer = useCallback(
    (id: string, updates: Partial<TextLayer>) => {
      if (!activeProject) return;
      pushHistory(activeProject);

      saveProjectState({
        ...activeProject,
        textLayers: activeProject.textLayers.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      });
    },
    [activeProject, pushHistory, saveProjectState]
  );

  const deleteTextLayer = useCallback(
    (id: string) => {
      if (!activeProject) return;
      pushHistory(activeProject);

      saveProjectState({
        ...activeProject,
        textLayers: activeProject.textLayers.filter((t) => t.id !== id),
      });

      if (selectedTextLayerId === id) setSelectedTextLayerId(null);
    },
    [activeProject, selectedTextLayerId, pushHistory, saveProjectState]
  );

  // Audio Layer Actions
  const addAudioLayer = useCallback(
    (audio: { name: string; url: string; duration: number; type: 'music' | 'sfx' | 'voiceover' }) => {
      if (!activeProject) return;
      pushHistory(activeProject);

      const newAudio: AudioLayer = {
        id: `audio_${Date.now()}`,
        name: audio.name,
        url: audio.url,
        startTime: currentTime,
        duration: audio.duration,
        volume: 100,
        type: audio.type,
      };

      saveProjectState({
        ...activeProject,
        audioLayers: [...activeProject.audioLayers, newAudio],
      });

      setSelectedAudioLayerId(newAudio.id);
    },
    [activeProject, currentTime, pushHistory, saveProjectState]
  );

  const updateAudioLayer = useCallback(
    (id: string, updates: Partial<AudioLayer>) => {
      if (!activeProject) return;
      pushHistory(activeProject);

      saveProjectState({
        ...activeProject,
        audioLayers: activeProject.audioLayers.map((a) => (a.id === id ? { ...a, ...updates } : a)),
      });
    },
    [activeProject, pushHistory, saveProjectState]
  );

  const deleteAudioLayer = useCallback(
    (id: string) => {
      if (!activeProject) return;
      pushHistory(activeProject);

      saveProjectState({
        ...activeProject,
        audioLayers: activeProject.audioLayers.filter((a) => a.id !== id),
      });

      if (selectedAudioLayerId === id) setSelectedAudioLayerId(null);
    },
    [activeProject, selectedAudioLayerId, pushHistory, saveProjectState]
  );

  // Sticker Layer Actions
  const addStickerLayer = useCallback(
    (emojiOrUrl: string) => {
      if (!activeProject) return;
      pushHistory(activeProject);

      const newSticker: StickerLayer = {
        id: `sticker_${Date.now()}`,
        emojiOrUrl: emojiOrUrl || '🔥',
        startTime: currentTime,
        duration: 5,
        x: 50,
        y: 50,
        scale: 1,
        rotation: 0,
      };

      const existingStickers = activeProject.stickerLayers || [];

      saveProjectState({
        ...activeProject,
        stickerLayers: [...existingStickers, newSticker],
      });
    },
    [activeProject, currentTime, pushHistory, saveProjectState]
  );

  const deleteStickerLayer = useCallback(
    (id: string) => {
      if (!activeProject) return;
      pushHistory(activeProject);

      const existingStickers = activeProject.stickerLayers || [];

      saveProjectState({
        ...activeProject,
        stickerLayers: existingStickers.filter((s) => s.id !== id),
      });
    },
    [activeProject, pushHistory, saveProjectState]
  );

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        activeTab,
        activeTool,
        selectedClipId,
        selectedTextLayerId,
        selectedAudioLayerId,
        currentTime,
        isPlaying,
        zoomLevel,
        phoneFrameMode,
        permissionsGranted,

        setActiveTab,
        setActiveTool,
        setSelectedClipId,
        setSelectedTextLayerId,
        setSelectedAudioLayerId,
        setCurrentTime,
        setIsPlaying,
        setZoomLevel,
        setPhoneFrameMode,
        setPermissionsGranted,

        createProject,
        selectProject,
        updateProject,
        deleteProject,
        duplicateProject,

        updateClip,
        splitClip,
        trimClip,
        deleteClip,
        duplicateClip,
        reorderClips,

        addTextLayer,
        updateTextLayer,
        deleteTextLayer,

        addAudioLayer,
        updateAudioLayer,
        deleteAudioLayer,

        addStickerLayer,
        deleteStickerLayer,

        undo,
        redo,
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
