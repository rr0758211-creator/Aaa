import React, { useEffect, useRef, useState } from 'react';
import { Wallpaper } from '../types/wallpaper';
import { Heart, Image as ImageIcon, Sparkles, Layers } from 'lucide-react';
import { coilCache } from '../services/coilImageCache';

interface WallpaperGridProps {
  wallpapers: Wallpaper[];
  onWallpaperClick: (wallpaper: Wallpaper) => void;
  onToggleFavorite: (wallpaper: Wallpaper) => void;
  isFavorite: (id: string) => boolean;
  isLoading: boolean;
  isLoadingNextPage: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  error?: string | null;
  onRetry?: () => void;
}

export function WallpaperGrid({
  wallpapers,
  onWallpaperClick,
  onToggleFavorite,
  isFavorite,
  isLoading,
  isLoadingNextPage,
  hasMore,
  onLoadMore,
  error,
  onRetry,
}: WallpaperGridProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Infinite scroll trigger with IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isLoading && !isLoadingNextPage) {
          onLoadMore();
        }
      },
      {
        rootMargin: '400px', // Pre-fetch before user reaches the very bottom
        threshold: 0.1,
      }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingNextPage, onLoadMore]);

  if (isLoading && wallpapers.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-3 p-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[9/16] rounded-2xl bg-slate-900 border border-slate-800/80 animate-pulse relative overflow-hidden flex flex-col justify-between p-3"
          >
            <div className="w-12 h-4 rounded bg-slate-800/80" />
            <div className="space-y-1.5">
              <div className="w-3/4 h-3.5 rounded bg-slate-800/80" />
              <div className="w-1/2 h-2.5 rounded bg-slate-800/60" />
            </div>
            {/* Shimmer overlay */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-slate-800/30 to-transparent" />
          </div>
        ))}
      </div>
    );
  }

  if (wallpapers.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
          <ImageIcon className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-200">No Wallpapers Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Try adjusting your search keywords. We enforce strict SFW anime wallpapers from Wallhaven.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-2">
      {/* 2-Column Grid as required */}
      <div className="grid grid-cols-2 gap-3">
        {wallpapers.map((wallpaper, idx) => {
          const favorite = isFavorite(wallpaper.id);
          return (
            <WallpaperCard
              key={`${wallpaper.id}-${idx}`}
              wallpaper={wallpaper}
              isFavorite={favorite}
              onClick={() => onWallpaperClick(wallpaper)}
              onToggleFavorite={(e) => {
                e.stopPropagation();
                onToggleFavorite(wallpaper);
              }}
            />
          );
        })}
      </div>

      {/* Loading next page indicator */}
      {isLoadingNextPage && (
        <div className="py-6 flex flex-col items-center justify-center gap-2">
          <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-[11px] text-slate-400 font-medium">
            Fetching next page from Wallhaven...
          </span>
        </div>
      )}

      {/* End of results message */}
      {!hasMore && wallpapers.length > 0 && (
        <div className="py-8 text-center text-xs text-slate-500 border-t border-slate-900 mt-4">
          ✨ You've reached the end of Wallhaven anime toplist!
        </div>
      )}

      {/* Intersection observer sentinel for auto pagination */}
      <div ref={sentinelRef} className="h-10 w-full pointer-events-none" />
    </div>
  );
}

interface WallpaperCardProps {
  wallpaper: Wallpaper;
  isFavorite: boolean;
  onClick: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

function WallpaperCard({
  wallpaper,
  isFavorite,
  onClick,
  onToggleFavorite,
}: WallpaperCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [cachedUrl, setCachedUrl] = useState<string>(wallpaper.thumbs.large);
  const [isCached, setIsCached] = useState(false);

  useEffect(() => {
    let isMounted = true;
    // Coil image caching simulation
    coilCache
      .getOrLoadImage(wallpaper.thumbs.large)
      .then((loadedUrl) => {
        if (isMounted) {
          setCachedUrl(loadedUrl);
          setIsCached(coilCache.isCachedInMemory(wallpaper.thumbs.large));
        }
      })
      .catch(() => {
        if (isMounted) {
          setCachedUrl(wallpaper.thumbs.large);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [wallpaper.thumbs.large]);

  // Extract display resolution label (e.g. 4K, 2K, FHD)
  const width = wallpaper.dimension_x;
  const height = wallpaper.dimension_y;
  let resBadge = 'HD';
  if (width >= 3840 || height >= 3840) resBadge = '4K';
  else if (width >= 2560 || height >= 2560) resBadge = '2K';
  else if (width >= 1920 || height >= 1920) resBadge = 'FHD';

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
      className="group relative aspect-[9/16] rounded-2xl bg-slate-900 overflow-hidden cursor-pointer border border-slate-800/80 hover:border-indigo-500/50 transition-all duration-300 transform active:scale-[0.98] shadow-md hover:shadow-indigo-500/10"
    >
      {/* Skeleton Shimmer while loading */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center overflow-hidden">
          <div className="w-full h-full bg-slate-800/50 animate-pulse flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-slate-700 animate-spin" />
          </div>
        </div>
      )}

      {/* Thumbnail image parsed from data[].thumbs.large */}
      <img
        src={cachedUrl}
        alt={`Anime wallpaper ${wallpaper.id}`}
        loading="lazy"
        onLoad={() => setImageLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Top badges: Resolution & Coil Cache tag */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
        <span className="px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-slate-200 border border-white/10 tracking-tight">
          {resBadge}
        </span>

        {/* Coil cache indicator */}
        {isCached && (
          <span
            title="Loaded from Coil In-Memory / Disk Cache"
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-indigo-950/80 backdrop-blur-md text-[9px] font-medium text-indigo-300 border border-indigo-500/30"
          >
            <Layers className="w-2.5 h-2.5" />
            Coil
          </span>
        )}
      </div>

      {/* Bottom Gradient Overlay */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

      {/* Favorite Heart Button & Info */}
      <div className="absolute bottom-2 inset-x-2 flex items-center justify-between z-10">
        <div className="text-[10px] text-slate-300/90 font-medium truncate drop-shadow">
          <span>{wallpaper.resolution}</span>
        </div>

        <button
          type="button"
          onClick={onToggleFavorite}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className={`p-2 rounded-full backdrop-blur-md transition-all duration-200 shadow-md ${
            isFavorite
              ? 'bg-rose-500 text-white scale-105 ring-2 ring-rose-300/40'
              : 'bg-black/50 text-slate-300 hover:text-white hover:bg-black/80'
          }`}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-transform ${
              isFavorite ? 'fill-current scale-110' : ''
            }`}
          />
        </button>
      </div>
    </div>
  );
}
