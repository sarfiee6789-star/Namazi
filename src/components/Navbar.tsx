import React from 'react';
import { MapPin, BellOff, Volume2, VolumeX } from 'lucide-react';
import { HijriDateInfo, LocationCoordinates } from '../types';

interface NavbarProps {
  hijriDate: HijriDateInfo;
  currentLocation: LocationCoordinates;
  onOpenLocationModal: () => void;
  isSilentModeActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onNavigateTab: (tab: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  hijriDate,
  currentLocation,
  onOpenLocationModal,
  isSilentModeActive,
  isMuted,
  onToggleMute,
  onNavigateTab,
}) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[#070D1E]/80 border-b border-amber-500/15">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => onNavigateTab('dashboard')}
          className="flex items-center gap-2.5 text-left group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/20 via-amber-500/10 to-transparent border border-amber-500/30 flex items-center justify-center text-amber-300 shadow-sm shadow-amber-500/10 group-hover:border-amber-400/50 transition-colors">
            {/* Islamic Crescent & Star Motif */}
            <svg
              className="w-5 h-5 text-amber-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.5 5.5 0 0 1-7.54-7.54A9.03 9.03 0 0 0 12 3z" />
              <polygon points="19 3 19.5 4.5 21 4.5 19.8 5.4 20.2 7 19 6 17.8 7 18.2 5.4 17 4.5 18.5 4.5" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-lg text-slate-100 font-display">
                Namazi
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                نمازي
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {hijriDate.formattedEn}
            </p>
          </div>
        </button>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Silent Mode Status Pill */}
          {isSilentModeActive && (
            <button
              onClick={() => onNavigateTab('prayers')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-medium animate-pulse"
              title="Silent Mode is automated and active for prayer"
            >
              <BellOff className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Silent Mode Active</span>
            </button>
          )}

          {/* Location button */}
          <button
            onClick={onOpenLocationModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800/90 border border-amber-500/20 hover:border-amber-500/40 text-xs text-slate-200 transition-all cursor-pointer"
            title="Change prayer location"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span className="max-w-[110px] sm:max-w-[160px] truncate font-medium">
              {currentLocation.city}
            </span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              isMuted
                ? 'bg-red-950/30 border-red-500/30 text-red-400 hover:bg-red-950/50'
                : 'bg-slate-900/80 border-slate-700/50 text-slate-300 hover:text-amber-300 hover:border-amber-500/30'
            }`}
            title={isMuted ? 'Unmute audio cues' : 'Mute audio cues'}
            aria-label="Toggle audio"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
