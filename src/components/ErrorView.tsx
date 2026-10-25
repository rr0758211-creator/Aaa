import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

interface ErrorViewProps {
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export function ErrorView({ message, onRetry, isRetrying }: ErrorViewProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 my-auto">
      <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-950/20">
        <WifiOff className="w-8 h-8" />
      </div>

      <div className="space-y-1.5 max-w-xs">
        <h3 className="text-base font-bold text-slate-100 flex items-center justify-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          Network Connection Error
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          {message || 'Unable to connect to Wallhaven API. Please check your internet connection and try again.'}
        </p>
      </div>

      <button
        onClick={onRetry}
        disabled={isRetrying}
        className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition-all duration-200 active:scale-95 disabled:opacity-60"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
        <span>{isRetrying ? 'Connecting...' : 'Retry Connection'}</span>
      </button>

      <p className="text-[10px] text-slate-400">
        Endpoint: https://wallhaven.cc/api/v1/search (q=+&quot;anime boys&quot; -&quot;anime girls&quot;, categories=010, purity=100, ratios=portrait)
      </p>
    </div>
  );
}
