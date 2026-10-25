import { Wallpaper } from '../types/wallpaper';

const FAVORITES_STORAGE_KEY = 'depth_wallpaper_room_favorites';

type Listener = (favorites: Wallpaper[]) => void;
const listeners = new Set<Listener>();

export const wallpaperDatabase = {
  getFavorites(): Wallpaper[] {
    try {
      const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to read favorites from local database:', e);
      return [];
    }
  },

  isFavorite(id: string): boolean {
    const favorites = this.getFavorites();
    return favorites.some((item) => item.id === id);
  },

  addFavorite(wallpaper: Wallpaper): void {
    const favorites = this.getFavorites();
    if (!favorites.some((item) => item.id === wallpaper.id)) {
      const updated = [{ ...wallpaper, savedAt: Date.now() }, ...favorites];
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
        notifyListeners(updated);
      } catch (e) {
        console.error('Failed to save favorite in Room database:', e);
      }
    }
  },

  removeFavorite(id: string): void {
    const favorites = this.getFavorites();
    const updated = favorites.filter((item) => item.id !== id);
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
      notifyListeners(updated);
    } catch (e) {
      console.error('Failed to remove favorite:', e);
    }
  },

  toggleFavorite(wallpaper: Wallpaper): boolean {
    if (this.isFavorite(wallpaper.id)) {
      this.removeFavorite(wallpaper.id);
      return false;
    } else {
      this.addFavorite(wallpaper);
      return true;
    }
  },

  clearAll(): void {
    localStorage.removeItem(FAVORITES_STORAGE_KEY);
    notifyListeners([]);
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    // Provide initial state
    listener(this.getFavorites());
    return () => {
      listeners.delete(listener);
    };
  },
};

function notifyListeners(favorites: Wallpaper[]) {
  for (const listener of listeners) {
    try {
      listener(favorites);
    } catch (e) {
      console.error(e);
    }
  }
}
