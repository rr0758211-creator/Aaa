/**
 * Depth Wallpaper - Native Android Anime Wallpaper App
 * Built with Kotlin & Jetpack Compose principles
 * Powered by Wallhaven API (SFW Anime Portrait)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Wallpaper, WallhavenResponse } from './types/wallpaper';
import { fetchWallpapersFromApi } from './services/api';
import { wallpaperDatabase } from './services/wallpaperDatabase';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { AndroidNavigationBar } from './components/AndroidNavigationBar';
import { SearchHeader } from './components/SearchHeader';
import { WallpaperGrid } from './components/WallpaperGrid';
import { WallpaperDetailModal } from './components/WallpaperDetailModal';
import { FavoritesScreen } from './components/FavoritesScreen';
import { AndroidCodeModal } from './components/AndroidCodeModal';
import { ErrorView } from './components/ErrorView';

export default function App() {
  // Navigation & UI state
  const [currentTab, setCurrentTab] = useState<'explore' | 'favorites' | 'android-code'>('explore');
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);

  // Wallpapers list & pagination
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalWallpapers, setTotalWallpapers] = useState(0);

  // Search query
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');

  // Loading & error states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingNextPage, setIsLoadingNextPage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Favorites state (persisted locally in Room DB simulation)
  const [favorites, setFavorites] = useState<Wallpaper[]>([]);

  // Selected wallpaper for full-screen preview
  const [selectedWallpaper, setSelectedWallpaper] = useState<Wallpaper | null>(null);

  // Scroll container ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Subscribe to persistent favorites (Room DB)
  useEffect(() => {
    const unsubscribe = wallpaperDatabase.subscribe((updated) => {
      setFavorites(updated);
    });
    return () => unsubscribe();
  }, []);

  // Fetch wallpapers from API
  const loadWallpapers = useCallback(
    async (pageToLoad: number, queryToUse: string, isNextPage = false) => {
      if (isNextPage) {
        setIsLoadingNextPage(true);
      } else {
        setIsLoading(true);
        setError(null);
      }

      try {
        const response: WallhavenResponse = await fetchWallpapersFromApi(
          pageToLoad,
          queryToUse
        );

        const newWallpapers = response.data || [];
        const meta = response.meta;

        setLastPage(meta.last_page || 1);
        setTotalWallpapers(meta.total || 0);
        setCurrentPage(pageToLoad);

        if (isNextPage) {
          // Append next page without duplicates
          setWallpapers((prev) => {
            const existingIds = new Set(prev.map((item) => item.id));
            const filteredNew = newWallpapers.filter(
              (item) => !existingIds.has(item.id)
            );
            return [...prev, ...filteredNew];
          });
        } else {
          setWallpapers(newWallpapers);
          // Scroll back to top on fresh search/launch
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 0;
          }
        }
      } catch (err: any) {
        console.error('Failed to load wallpapers:', err);
        setError(
          err.message ||
            'Unable to connect to Wallhaven API. Please check your internet connection.'
        );
      } finally {
        setIsLoading(false);
        setIsLoadingNextPage(false);
      }
    },
    []
  );

  // Automatically fetch on launch
  useEffect(() => {
    loadWallpapers(1, submittedQuery);
  }, [loadWallpapers, submittedQuery]);

  // Load next page when user scrolls near the bottom
  const handleLoadNextPage = useCallback(() => {
    if (currentPage < lastPage && !isLoading && !isLoadingNextPage) {
      loadWallpapers(currentPage + 1, submittedQuery, true);
    }
  }, [currentPage, lastPage, isLoading, isLoadingNextPage, loadWallpapers, submittedQuery]);

  // Search submission
  const handleSearchSubmit = (query: string) => {
    setSubmittedQuery(query);
    setCurrentPage(1);
    setCurrentTab('explore');
  };

  // Toggle favorite
  const handleToggleFavorite = (wallpaper: Wallpaper) => {
    wallpaperDatabase.toggleFavorite(wallpaper);
  };

  const isWallpaperFavorite = (id: string) => {
    return favorites.some((fav) => fav.id === id);
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex items-center justify-center p-0 sm:p-4 md:p-6 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Container: either authentic Android Phone Mockup or Edge-to-Edge Responsive */}
      <div
        className={`w-full transition-all duration-300 flex flex-col overflow-hidden bg-[#0b0f17] ${
          isPhoneFrame
            ? 'max-w-[440px] h-[100dvh] sm:h-[890px] sm:rounded-[44px] shadow-2xl shadow-indigo-950/40 border-0 sm:border-[8px] border-slate-800 ring-1 ring-slate-700/60'
            : 'max-w-5xl h-[100dvh] sm:h-[92vh] sm:rounded-3xl border-0 sm:border border-slate-800 shadow-2xl'
        }`}
      >
        {/* Android Material 3 Status Bar */}
        <AndroidStatusBar isPhoneFrame={isPhoneFrame} />

        {/* Content Area */}
        <div
          ref={scrollContainerRef}
          className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative scroll-smooth no-scrollbar"
        >
          {currentTab === 'explore' && (
            <>
              {/* Search Bar & Tag Chips with Wallhaven Credit */}
              <SearchHeader
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSearchSubmit={handleSearchSubmit}
                totalWallpapers={totalWallpapers}
              />

              {/* Main Content: Error or Wallpaper Grid */}
              {error ? (
                <ErrorView
                  message={error}
                  onRetry={() => loadWallpapers(1, submittedQuery)}
                  isRetrying={isLoading}
                />
              ) : (
                <WallpaperGrid
                  wallpapers={wallpapers}
                  onWallpaperClick={(w) => setSelectedWallpaper(w)}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={isWallpaperFavorite}
                  isLoading={isLoading}
                  isLoadingNextPage={isLoadingNextPage}
                  hasMore={currentPage < lastPage}
                  onLoadMore={handleLoadNextPage}
                  error={error}
                  onRetry={() => loadWallpapers(currentPage, submittedQuery)}
                />
              )}
            </>
          )}

          {currentTab === 'favorites' && (
            <FavoritesScreen
              favorites={favorites}
              onWallpaperClick={(w) => setSelectedWallpaper(w)}
              onExploreClick={() => setCurrentTab('explore')}
            />
          )}

          {currentTab === 'android-code' && <AndroidCodeModal />}
        </div>

        {/* Material 3 Bottom Navigation Bar */}
        <AndroidNavigationBar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          favoritesCount={favorites.length}
          isPhoneFrame={isPhoneFrame}
          onTogglePhoneFrame={() => setIsPhoneFrame((prev) => !prev)}
        />
      </div>

      {/* Full-Screen Wallpaper Preview Modal */}
      {selectedWallpaper && (
        <WallpaperDetailModal
          wallpaper={selectedWallpaper}
          onClose={() => setSelectedWallpaper(null)}
          isFavorite={isWallpaperFavorite(selectedWallpaper.id)}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
}
