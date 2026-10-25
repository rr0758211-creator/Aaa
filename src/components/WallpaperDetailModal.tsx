import { useState, useEffect } from 'react';
import { Wallpaper } from '../types/wallpaper';
import {
  X,
  Heart,
  Download,
  Share2,
  ExternalLink,
  Smartphone,
  Eye,
  Info,
  CheckCircle2,
  Lock,
  Layers,
} from 'lucide-react';
import { downloadWallpaperFile } from '../services/api';

interface WallpaperDetailModalProps {
  wallpaper: Wallpaper | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (wallpaper: Wallpaper) => void;
}

export function WallpaperDetailModal({
  wallpaper,
  onClose,
  isFavorite,
  onToggleFavorite,
}: WallpaperDetailModalProps) {
  const [fullImageLoaded, setFullImageLoaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showLockScreenMockup, setShowLockScreenMockup] = useState(false);
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setFullImageLoaded(false);
    setDownloadSuccess(false);
    setShowLockScreenMockup(false);

    const now = new Date();
    setCurrentTime(
      now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    );
    setCurrentDate(
      now.toLocaleDateString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    );
  }, [wallpaper]);

  if (!wallpaper) return null;

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadWallpaperFile(wallpaper);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Depth Wallpaper - ${wallpaper.id}`,
          text: `Check out this anime wallpaper from Wallhaven: ${wallpaper.resolution}`,
          url: wallpaper.url,
        });
      } catch {
        // User cancelled or unsupported
      }
    } else {
      navigator.clipboard.writeText(wallpaper.url);
      alert('Wallpaper link copied to clipboard!');
    }
  };

  const fileSizeMb = (wallpaper.file_size / (1024 * 1024)).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200">
      {/* Background Container */}
      <div className="relative w-full h-full max-w-lg mx-auto flex flex-col justify-between overflow-hidden bg-black select-none">
        
        {/* Full-Screen Wallpaper Display */}
        <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
          {/* Blurred thumbnail as instant backdrop */}
          <img
            src={wallpaper.thumbs.large}
            alt="Blur backdrop"
            className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110"
          />

          {/* Full-size high resolution wallpaper from data[].path */}
          <img
            src={wallpaper.path}
            alt={`Anime Wallpaper ${wallpaper.id}`}
            onLoad={() => setFullImageLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              fullImageLoaded ? 'opacity-100' : 'opacity-80 scale-100'
            }`}
          />

          {/* High-res Loading Spinner */}
          {!fullImageLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xs z-10 gap-2">
              <div className="w-10 h-10 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium text-white/90 drop-shadow">
                Loading original full-res ({fileSizeMb} MB)...
              </span>
            </div>
          )}

          {/* Lock Screen Simulation Overlay */}
          {showLockScreenMockup && (
            <div className="absolute inset-0 z-20 flex flex-col justify-between p-8 bg-black/25 pointer-events-none text-white animate-in fade-in duration-300">
              {/* Lock Icon & Time */}
              <div className="flex flex-col items-center pt-10 space-y-1">
                <Lock className="w-5 h-5 text-white/80 mb-2 drop-shadow" />
                <h2 className="text-7xl font-extralight tracking-tight font-sans drop-shadow-lg">
                  {currentTime || '09:41'}
                </h2>
                <p className="text-sm font-medium tracking-wide text-white/90 drop-shadow">
                  {currentDate || 'Sunday, Oct 25'}
                </p>

                {/* Simulated notification pill */}
                <div className="mt-8 px-4 py-2.5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center gap-3 shadow-lg max-w-xs">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/80 flex items-center justify-center text-xs font-bold">
                    DW
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-semibold text-white/90">Depth Wallpaper</p>
                    <p className="text-slate-300 text-[11px]">Anime Lock Screen Preview</p>
                  </div>
                </div>
              </div>

              {/* Swipe to unlock hint */}
              <div className="flex flex-col items-center space-y-2 pb-6">
                <div className="w-36 h-1.5 bg-white/70 rounded-full shadow-lg" />
                <p className="text-[11px] text-white/80 font-medium tracking-wider uppercase drop-shadow">
                  Swipe up to unlock
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Top Floating App Bar */}
        <div className="relative z-30 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-black/60 text-white hover:bg-black/90 backdrop-blur-md border border-white/10 transition-colors shadow-lg active:scale-95"
            aria-label="Back"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            {/* Lock screen preview toggle */}
            <button
              onClick={() => setShowLockScreenMockup((prev) => !prev)}
              title="Preview on Android Lock Screen"
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-medium border transition-all ${
                showLockScreenMockup
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/30'
                  : 'bg-black/60 text-slate-200 border-white/15 hover:bg-black/80'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{showLockScreenMockup ? 'Hide Lock UI' : 'Lock Screen'}</span>
            </button>

            {/* Info toggle */}
            <button
              onClick={() => setShowInfoSheet((prev) => !prev)}
              className="p-2.5 rounded-full bg-black/60 text-white hover:bg-black/90 backdrop-blur-md border border-white/10 transition-colors shadow-lg"
              aria-label="Details"
            >
              <Info className="w-4 h-4" />
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="p-2.5 rounded-full bg-black/60 text-white hover:bg-black/90 backdrop-blur-md border border-white/10 transition-colors shadow-lg"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Info Drawer when toggled */}
        {showInfoSheet && (
          <div className="relative z-30 mx-4 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl text-slate-200 space-y-3 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="font-semibold text-sm text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                Wallpaper Specifications
              </h4>
              <button
                onClick={() => setShowInfoSheet(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Resolution
                </span>
                <span className="font-mono font-medium text-indigo-300">
                  {wallpaper.resolution}
                </span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  File Size
                </span>
                <span className="font-mono font-medium text-slate-200">
                  {fileSizeMb} MB ({wallpaper.file_type.split('/')[1]?.toUpperCase() || 'JPG'})
                </span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Purity / Category
                </span>
                <span className="font-medium text-emerald-400 uppercase">
                  {wallpaper.purity} • {wallpaper.category}
                </span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Wallhaven ID
                </span>
                <span className="font-mono text-slate-300">#{wallpaper.id}</span>
              </div>
            </div>

            {/* Color Palette */}
            {wallpaper.colors && wallpaper.colors.length > 0 && (
              <div className="pt-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1.5">
                  Extracted Palette
                </span>
                <div className="flex items-center gap-1.5">
                  {wallpaper.colors.map((c, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-lg ring-1 ring-white/10 shadow-sm"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Source credit */}
            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
              <span>Source: Wallhaven Anime Toplist</span>
              <a
                href={wallpaper.url}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                View on Wallhaven <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Bottom Action Bar: Heart Button + Download Button */}
        <div className="relative z-30 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
          <div className="flex items-center gap-4 max-w-sm mx-auto">
            {/* Heart Button: Add / Remove Favorite */}
            <button
              onClick={() => onToggleFavorite(wallpaper)}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              className={`p-4 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl border ${
                isFavorite
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 hover:bg-rose-500/30 ring-2 ring-rose-500/30'
                  : 'bg-slate-900/90 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Heart
                className={`w-6 h-6 transition-transform duration-300 ${
                  isFavorite ? 'fill-current scale-110' : ''
                }`}
              />
            </button>

            {/* Download Button: Saves image to gallery */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={`flex-1 py-4 px-6 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2.5 transition-all duration-200 shadow-xl border ${
                downloadSuccess
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/25'
                  : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white border-indigo-400/30 shadow-indigo-600/30'
              }`}
            >
              {isDownloading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving to Gallery...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Saved to Gallery!</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Download Full Res ({fileSizeMb} MB)</span>
                </>
              )}
            </button>
          </div>

          {/* Wallpapers from Wallhaven small footer note */}
          <p className="text-center text-[10px] text-slate-400 mt-3 drop-shadow">
            Wallpapers from Wallhaven • Strict SFW Anime Boys Only
          </p>
        </div>
      </div>
    </div>
  );
}
