import { Compass, Heart, Code2, Smartphone, Monitor } from 'lucide-react';

interface AndroidNavigationBarProps {
  currentTab: 'explore' | 'favorites' | 'android-code';
  onTabChange: (tab: 'explore' | 'favorites' | 'android-code') => void;
  favoritesCount: number;
  isPhoneFrame: boolean;
  onTogglePhoneFrame: () => void;
}

export function AndroidNavigationBar({
  currentTab,
  onTabChange,
  favoritesCount,
  isPhoneFrame,
  onTogglePhoneFrame,
}: AndroidNavigationBarProps) {
  return (
    <div className="w-full bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/80 px-4 py-2 z-30 transition-colors">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Explore Tab */}
        <button
          onClick={() => onTabChange('explore')}
          className="flex flex-col items-center gap-1 group relative outline-none focus:outline-none"
        >
          <div
            className={`px-5 py-1.5 rounded-full transition-all duration-200 flex items-center justify-center ${
              currentTab === 'explore'
                ? 'bg-indigo-500/25 text-indigo-300 ring-1 ring-indigo-500/40 shadow-sm shadow-indigo-500/20'
                : 'text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800/60'
            }`}
          >
            <Compass className={`w-5 h-5 transition-transform duration-200 ${currentTab === 'explore' ? 'scale-110' : ''}`} />
          </div>
          <span
            className={`text-[11px] font-medium transition-colors ${
              currentTab === 'explore' ? 'text-indigo-300 font-semibold' : 'text-slate-400'
            }`}
          >
            Explore
          </span>
        </button>

        {/* Favorites Tab */}
        <button
          onClick={() => onTabChange('favorites')}
          className="flex flex-col items-center gap-1 group relative outline-none focus:outline-none"
        >
          <div
            className={`relative px-5 py-1.5 rounded-full transition-all duration-200 flex items-center justify-center ${
              currentTab === 'favorites'
                ? 'bg-rose-500/25 text-rose-300 ring-1 ring-rose-500/40 shadow-sm shadow-rose-500/20'
                : 'text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800/60'
            }`}
          >
            <Heart
              className={`w-5 h-5 transition-transform duration-200 ${
                currentTab === 'favorites' ? 'scale-110 fill-rose-400 text-rose-400' : ''
              }`}
            />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center ring-2 ring-slate-900 shadow">
                {favoritesCount > 99 ? '99+' : favoritesCount}
              </span>
            )}
          </div>
          <span
            className={`text-[11px] font-medium transition-colors ${
              currentTab === 'favorites' ? 'text-rose-300 font-semibold' : 'text-slate-400'
            }`}
          >
            Favorites
          </span>
        </button>

        {/* Android Kotlin Source Code Tab */}
        <button
          onClick={() => onTabChange('android-code')}
          className="flex flex-col items-center gap-1 group relative outline-none focus:outline-none"
        >
          <div
            className={`px-5 py-1.5 rounded-full transition-all duration-200 flex items-center justify-center ${
              currentTab === 'android-code'
                ? 'bg-emerald-500/25 text-emerald-300 ring-1 ring-emerald-500/40 shadow-sm shadow-emerald-500/20'
                : 'text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800/60'
            }`}
          >
            <Code2 className={`w-5 h-5 transition-transform duration-200 ${currentTab === 'android-code' ? 'scale-110' : ''}`} />
          </div>
          <span
            className={`text-[11px] font-medium transition-colors ${
              currentTab === 'android-code' ? 'text-emerald-300 font-semibold' : 'text-slate-400'
            }`}
          >
            Kotlin / Jetpack
          </span>
        </button>

        {/* Device Frame Viewport Toggle */}
        <button
          onClick={onTogglePhoneFrame}
          title={isPhoneFrame ? 'Switch to Fluid Desktop View' : 'Switch to Android Phone Frame'}
          className="flex flex-col items-center gap-1 group outline-none focus:outline-none"
        >
          <div className="px-3 py-1.5 rounded-full text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800/60 transition-colors">
            {isPhoneFrame ? <Monitor className="w-5 h-5" /> : <Smartphone className="w-5 h-5 text-indigo-400" />}
          </div>
          <span className="text-[11px] font-medium text-slate-400">
            {isPhoneFrame ? 'Expand' : 'Phone'}
          </span>
        </button>
      </div>

      {/* Android Home indicator bar */}
      <div className="w-32 h-1 bg-slate-700/80 rounded-full mx-auto mt-2" />
    </div>
  );
}
