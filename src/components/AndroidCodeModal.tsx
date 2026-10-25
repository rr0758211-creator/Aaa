import { useState } from 'react';
import { ANDROID_KOTLIN_FILES, AndroidFile } from '../data/androidKotlinCode';
import {
  FileCode,
  Copy,
  Check,
  Download,
  FolderGit2,
  ExternalLink,
  Smartphone,
  ChevronRight,
} from 'lucide-react';
import JSZip from 'jszip';

export function AndroidCodeModal() {
  const [selectedFile, setSelectedFile] = useState<AndroidFile>(
    ANDROID_KOTLIN_FILES[0]
  );
  const [isCopied, setIsCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();

      // Root files
      zip.file(
        'README.md',
        `# Depth Wallpaper - Native Android App

Native Android wallpaper app built with Kotlin, Jetpack Compose, Room Database, Coil 2.6, and Retrofit.

## Features
- Wallhaven API integration (SFW anime wallpapers only: categories=010, purity=100)
- 2-Column LazyVerticalGrid with Coil image caching
- Infinite scroll pagination
- Search anime wallpapers
- Full-screen wallpaper preview with high-res download to gallery
- Room Database for local persistent favorites
- Material 3 Dark Theme

## Build & Run
Open this folder in Android Studio Ladybug / Koala or newer and click Run on an Android device or emulator.
`
      );

      // Add each Kotlin and gradle file
      for (const file of ANDROID_KOTLIN_FILES) {
        zip.file(file.path, file.content);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'DepthWallpaper-Android-Compose-Project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to create zip', e);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-3 max-w-4xl mx-auto w-full space-y-3 pb-8">
      {/* Header Info */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              Native Android Project (Kotlin & Jetpack Compose)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete production-ready Android Studio codebase with Coil caching, Room DB, Retrofit, and Material 3.
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-600/25 shrink-0"
        >
          {isZipping ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Packaging .zip...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download Android Studio Project (.zip)</span>
            </>
          )}
        </button>
      </div>

      {/* Main File Browser & Editor */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 min-h-[480px]">
        {/* File tree sidebar */}
        <div className="md:col-span-4 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-3 flex flex-col space-y-2">
          <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <FolderGit2 className="w-4 h-4 text-slate-400" />
            <span>Android Source Files</span>
          </div>

          <div className="flex-1 space-y-1 overflow-y-auto pr-1">
            {ANDROID_KOTLIN_FILES.map((file) => {
              const isActive = selectedFile.name === file.name;
              return (
                <button
                  key={file.name}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/40 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-indigo-400' : 'text-slate-500'
                      }`}
                    />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? 'text-indigo-400' : 'text-slate-600'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Viewer */}
        <div className="md:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-xl">
          {/* Top code bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono font-semibold text-slate-200">
                {selectedFile.path}
              </span>
              <p className="text-[10px] text-slate-400 truncate max-w-sm mt-0.5">
                {selectedFile.description}
              </p>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium transition-colors"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Monospace Code Display */}
          <div className="flex-1 overflow-auto p-4 font-mono text-[11px] leading-relaxed text-slate-300 bg-slate-950/80">
            <pre className="select-text whitespace-pre overflow-x-auto">
              {selectedFile.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
