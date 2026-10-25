import { useState } from 'react';
import { Wallpaper } from '../types/wallpaper';
import { Heart, Trash2, Sparkles, Compass } from 'lucide-react';
import { wallpaperDatabase } from '../services/wallpaperDatabase';

interface FavoritesScreenProps {
  favorites: Wallpaper[];
  onWallpaperClick: (wallpaper: Wallpaper) => void;
  onExploreClick: () => void;
}

export function FavoritesScreen({
  favorites,
  onWallpaperClick,
  onExploreClick,
}: FavoritesScreenProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleRemove = (e: React.MouseEvent, wallpaper: Wallpaper) => {
    e.stopPropagation();
    wallpaperDatabase.removeFavorite(wallpaper.id);
  };

  const handleClearAll = () => {
    wallpaperDatabase.clearAll();
    setShowClearConfirm(false);
  };

  if (favorites.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-5 my-auto">
        <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-950/20 ring-1 ring-rose-500/20">
          <Heart className="w-10 h-10 fill-rose-500/20" />
        </div>
        <div className="space-y-1.5 max-w-xs">
          <h3 className="text-lg font-bold text-slate-100">No Favorites Yet</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tap the heart icon on any anime wallpaper in Explore to save it locally. It persists even when the app closes (backed by Room DB).
          </p>
        </div>
        <button
          onClick={onExploreClick}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition-all duration-200 active:scale-95"
        >
          <Compass className="w-4 h-4" />
          <span>Explore Wallpapers</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col px-3 py-3 space-y-3">
      {/* Top action header for favorites */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            Saved Wallpapers
            <span className="text-xs text-slate-400 font-normal">
              ({favorites.length})
            </span>
          </h2>
          <span className="text-[10px] text-slate-400">
            Stored locally in Room Database • Persistent Offline Cache
          </span>
        </div>

        <button
          onClick={() => setShowClearConfirm(true)}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 px-2 py-1 rounded-lg hover:bg-slate-900 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 max-w-xs w-full text-center space-y-4 shadow-2xl">
            <h4 className="font-bold text-slate-100 text-sm">Clear all favorites?</h4>
            <p className="text-xs text-slate-400">
              This will remove all {favorites.length} saved wallpapers from your local storage.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-750"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-medium hover:bg-rose-500"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2-Column Grid */}
      <div className="grid grid-cols-2 gap-3 pb-8">
        {favorites.map((wallpaper) => (
          <div
            key={wallpaper.id}
            onClick={() => onWallpaperClick(wallpaper)}
            className="group relative aspect-[9/16] rounded-2xl bg-slate-900 overflow-hidden cursor-pointer border border-slate-800 hover:border-rose-500/50 transition-all duration-300 transform active:scale-[0.98] shadow-md"
          >
            <img
              src={wallpaper.thumbs.large}
              alt={`Favorite wallpaper ${wallpaper.id}`}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Top resolution chip */}
            <div className="absolute top-2 left-2 z-10">
              <span className="px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-slate-200 border border-white/10">
                {wallpaper.resolution}
              </span>
            </div>

            {/* Bottom gradient */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

            {/* Quick Remove Button */}
            <div className="absolute bottom-2 right-2 z-10">
              <button
                type="button"
                onClick={(e) => handleRemove(e, wallpaper)}
                title="Remove from favorites"
                className="p-2 rounded-full bg-rose-500/80 hover:bg-rose-600 text-white backdrop-blur-md shadow-md transition-transform active:scale-90"
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
