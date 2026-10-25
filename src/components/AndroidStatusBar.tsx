import { useState, useEffect } from 'react';
import { Wifi, Signal, BatteryMedium } from 'lucide-react';

interface AndroidStatusBarProps {
  isPhoneFrame?: boolean;
}

export function AndroidStatusBar({ isPhoneFrame = true }: AndroidStatusBarProps) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex items-center justify-between px-5 pt-2 pb-1 text-xs font-medium text-slate-300 select-none z-30">
      {/* Time */}
      <div className="flex items-center gap-1">
        <span className="font-semibold tracking-wide text-slate-200">{time || '12:00'}</span>
        {isPhoneFrame && (
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1.5 animate-pulse" title="Microphone / Camera secure" />
        )}
      </div>

      {/* Front camera notch placeholder if phone frame */}
      {isPhoneFrame && (
        <div className="w-3.5 h-3.5 rounded-full bg-black/90 ring-1 ring-slate-800 -mt-1 shadow-inner" />
      )}

      {/* System Icons: 5G, Wifi, Battery */}
      <div className="flex items-center gap-2 text-slate-300">
        <span className="text-[10px] font-bold tracking-tight text-slate-400">5G</span>
        <Signal className="w-3.5 h-3.5" />
        <Wifi className="w-3.5 h-3.5" />
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono text-slate-400">92%</span>
          <BatteryMedium className="w-4 h-4 text-emerald-400" />
        </div>
      </div>
    </div>
  );
}
