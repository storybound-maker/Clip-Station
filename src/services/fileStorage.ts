import { Project } from '../types';

/**
 * Mobile-compatible Local Storage Abstraction
 * Uses Expo FileSystem / Async Storage specification pattern on mobile
 * with in-memory / persistent fallback.
 */

const STORAGE_KEY = 'CLIP_STATION_PROJECTS_V1';

export class FileStorageService {
  private static memoryCache: Map<string, Project> = new Map();

  static async loadProjects(): Promise<Project[]> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Project[];
          parsed.forEach((p) => this.memoryCache.set(p.id, p));
          return parsed;
        }
      }
    } catch (e) {
      console.warn('FileStorageService: Fallback to memory storage', e);
    }
    return Array.from(this.memoryCache.values());
  }

  static async saveProject(project: Project): Promise<void> {
    this.memoryCache.set(project.id, project);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const all = Array.from(this.memoryCache.values());
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      }
    } catch (e) {
      console.warn('FileStorageService: Save warning', e);
    }
  }

  static async deleteProject(projectId: string): Promise<void> {
    this.memoryCache.delete(projectId);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const all = Array.from(this.memoryCache.values());
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      }
    } catch (e) {
      console.warn('FileStorageService: Delete warning', e);
    }
  }

  static generateLocalUri(type: 'video' | 'image' | 'audio', name: string): string {
    const time = Date.now();
    const cleanName = name.replace(/[^a-zA-Z0-9._-]/g, '_');
    return `file:///storage/emulated/0/Android/data/com.clipstation.editor/files/media/${type}_${time}_${cleanName}`;
  }
}
