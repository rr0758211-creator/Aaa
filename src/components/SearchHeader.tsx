import React, { useState, useEffect } from 'react';
import { Search, X, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';

interface SearchHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (query: string) => void;
  totalWallpapers?: number;
}

const PRESET_TAGS = [
  'All Anime Boys',
  'Naruto',
  'Gojo',
  'Solo Leveling',
  'Levi',
  'Bleach',
  'Demon Slayer',
  'Jujutsu Kaisen',
  'Cyberpunk Boy',
  'Samurai Boy',
];

export function SearchHeader({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  totalWallpapers,
}: SearchHeaderProps) {
  const [localInput, setLocalInput] = useState(searchQuery);

  useEffect(() => {
    setLocalInput(searchQuery);
  }, [searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(localInput);
  };

  const handleClear = () => {
    setLocalInput('');
    onSearchChange('');
    onSearchSubmit('');
  };

  const handleTagClick = (tag: string) => {
    const val = tag === 'All Anime Boys' ? '' : tag;
    setLocalInput(val);
    onSearchChange(val);
    onSearchSubmit(val);
  };

  return (
    <div className="w-full px-4 pt-2 pb-3 space-y-2.5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20 border-b border-slate-800/60">
      {/* App Header & Credit */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/20 ring-1 ring-indigo-400/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-1.5 leading-none">
              Depth Wallpaper
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Anime Boys
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
              Portrait Anime Boys Only • Pure SFW
            </p>
          </div>
        </div>

        {/* Wallpapers from Wallhaven Credit Pill */}
        <a
          href="https://wallhaven.cc"
          target="_blank"
          rel="noopener noreferrer"
          title="Wallpapers provided by Wallhaven API"
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/90 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-indigo-300 border border-slate-700/80 transition-all shadow-sm group"
        >
          <span className="text-slate-400">By</span>
          <span className="font-semibold text-slate-200 group-hover:text-indigo-300">Wallhaven</span>
          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-300 ml-0.5" />
        </a>
      </div>

      {/* Material 3 Search Bar */}
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="relative flex items-center">
          <div className="absolute left-3.5 pointer-events-none text-slate-400 flex items-center">
            <Search className="w-4 h-4" />
          </div>

          <input
            type="text"
            value={localInput}
            onChange={(e) => {
              setLocalInput(e.target.value);
              onSearchChange(e.target.value);
            }}
            placeholder="Search anime boys (e.g. naruto, gojo, bleach)..."
            className="w-full bg-slate-900/90 text-slate-100 placeholder-slate-400 text-xs sm:text-sm pl-10 pr-10 py-2.5 rounded-2xl border border-slate-700/70 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 transition-all shadow-inner"
          />

          {localInput && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* Quick Filter Tag Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
        <div className="flex items-center gap-1 text-[10px] text-indigo-300/90 bg-indigo-500/15 px-2 py-1 rounded-lg border border-indigo-500/25 whitespace-nowrap shrink-0 font-mono">
          <span>+&quot;anime boys&quot; -&quot;anime girls&quot;</span>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-emerald-400/90 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 whitespace-nowrap shrink-0">
          <ShieldCheck className="w-3 h-3" />
          <span>SFW 100%</span>
        </div>

        {PRESET_TAGS.map((tag) => {
          const isSelected =
            (tag === 'All Anime Boys' && !searchQuery) ||
            searchQuery.toLowerCase() === tag.toLowerCase();

          return (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 shrink-0 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-slate-100 border border-slate-800'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
