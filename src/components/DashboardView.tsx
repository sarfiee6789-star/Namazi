import React, { useState } from 'react';
import {
  Clock,
  Volume2,
  Compass,
  CircleDot,
  BookOpen,
  Calendar,
  Share2,
  Check,
  Play,
  Square,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import {
  NextPrayerInfo,
  PrayerTimesRecord,
  QuranVerse,
  TabType,
  LocationCoordinates,
  HijriDateInfo,
} from '../types';
import { formatRemainingTime, formatTo12Hour } from '../utils/prayerCalc';
import { audioService } from '../utils/audioService';

interface DashboardViewProps {
  prayerTimes: PrayerTimesRecord;
  nextPrayer: NextPrayerInfo;
  dailyVerse: QuranVerse;
  currentLocation: LocationCoordinates;
  hijriDate: HijriDateInfo;
  isSilentModeActive: boolean;
  onNavigateTab: (tab: TabType) => void;
  onOpenLocationModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  prayerTimes,
  nextPrayer,
  dailyVerse,
  currentLocation,
  hijriDate,
  isSilentModeActive,
  onNavigateTab,
  onOpenLocationModal,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedVerse, setCopiedVerse] = useState(false);
  const [playingAzanPrayer, setPlayingAzanPrayer] = useState<string | null>(null);

  const prayersList: Array<{
    name: 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
    arabic: string;
    time: string;
  }> = [
    { name: 'Fajr', arabic: 'الفَجْر', time: prayerTimes.Fajr },
    { name: 'Sunrise', arabic: 'الشُّرُوق', time: prayerTimes.Sunrise },
    { name: 'Dhuhr', arabic: 'الظُّهْر', time: prayerTimes.Dhuhr },
    { name: 'Asr', arabic: 'العَصْر', time: prayerTimes.Asr },
    { name: 'Maghrib', arabic: 'المَغْرِب', time: prayerTimes.Maghrib },
    { name: 'Isha', arabic: 'العِشَاء', time: prayerTimes.Isha },
  ];

  const handleToggleVerseAudio = () => {
    if (isPlayingAudio) {
      audioService.stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      // Read the Arabic ayah first then translation
      audioService.speakText(
        dailyVerse.arabicText,
        'ar',
        0.85,
        () => setIsPlayingAudio(true),
        () => {
          setIsPlayingAudio(false);
        },
        () => setIsPlayingAudio(false)
      );
    }
  };

  const handleCopyVerse = () => {
    const text = `"${dailyVerse.translation}"\n\n${dailyVerse.arabicText}\n[Surah ${dailyVerse.surahName} ${dailyVerse.surahNumber}:${dailyVerse.ayahNumber}]`;
    navigator.clipboard.writeText(text);
    setCopiedVerse(true);
    setTimeout(() => setCopiedVerse(false), 2000);
  };

  const handlePlayAzanPreview = (prayerName: string) => {
    if (playingAzanPrayer === prayerName) {
      setPlayingAzanPrayer(null);
      return;
    }
    setPlayingAzanPrayer(prayerName);
    audioService.playAzanPreview('makkah', () => {
      setPlayingAzanPrayer(null);
    });
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 sm:px-6 pt-4">
      {/* Silent Mode Active Alert if during prayer */}
      {isSilentModeActive && (
        <div className="bg-emerald-950/70 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-emerald-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-emerald-200">
                Silent Mode Automated & Active
              </h4>
              <p className="text-xs text-emerald-400/90">
                Congregational Salah in progress. Visual alerts only.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('prayers')}
            className="text-xs text-emerald-300 underline hover:text-emerald-200 font-medium"
          >
            Configure
          </button>
        </div>
      )}

      {/* HERO: Next Prayer & Countdown */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D1B3E] via-[#0A1633] to-[#070D1E] border border-amber-500/30 p-6 sm:p-8 shadow-2xl shadow-black/60">
        {/* Soft Gold Radial Glow in Background */}
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-72 h-72 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-500/30 text-amber-300 text-xs font-medium tracking-wide">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Next Prayer</span>
              <span className="text-slate-400">•</span>
              <span className="font-arabic text-sm">{nextPrayer.arabicName}</span>
            </div>

            <div className="flex items-baseline gap-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight font-display">
                {nextPrayer.name}
              </h1>
              <span className="text-xl sm:text-2xl font-semibold text-amber-300">
                {formatTo12Hour(nextPrayer.timeStr)}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5">
              <span>{currentLocation.city}, {currentLocation.country}</span>
              <button
                onClick={onOpenLocationModal}
                className="text-amber-400 hover:text-amber-300 text-xs underline ml-1 cursor-pointer"
              >
                Change
              </button>
            </p>
          </div>

          {/* Countdown Display Card */}
          <div className="w-full md:w-auto bg-[#070D1E]/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-amber-500/20 flex flex-col items-center md:items-end justify-center">
            <span className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1 font-medium mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Time Remaining
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100">
              {formatRemainingTime(nextPrayer.remainingSeconds)}
            </div>

            {/* Progress Bar between prayers */}
            <div className="w-full max-w-[200px] mt-3 space-y-1">
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-1000 ease-out"
                  style={{ width: `${nextPrayer.progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Interval</span>
                <span>{nextPrayer.progressPercent}% elapsed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACCESS ICONS TO ALL MAIN FEATURES */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider font-display">
            Quick Actions
          </h2>
          <span className="text-xs text-amber-400/80">Tap to explore</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Tasbih */}
          <button
            onClick={() => onNavigateTab('tasbih')}
            className="flex flex-col items-start p-4 rounded-2xl bg-[#09132E] hover:bg-[#0D1C44] border border-amber-500/20 hover:border-amber-500/40 transition-all duration-200 group text-left cursor-pointer shadow-lg shadow-black/30"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-500/30 flex items-center justify-center text-amber-300 mb-3 group-hover:scale-110 transition-transform">
              <CircleDot className="w-5 h-5" />
            </div>
            <div className="font-semibold text-slate-200 text-sm group-hover:text-amber-300 transition-colors">
              Digital Tasbih
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Haptic counter & dhikr
            </p>
          </button>

          {/* Qibla */}
          <button
            onClick={() => onNavigateTab('qibla')}
            className="flex flex-col items-start p-4 rounded-2xl bg-[#09132E] hover:bg-[#0D1C44] border border-amber-500/20 hover:border-amber-500/40 transition-all duration-200 group text-left cursor-pointer shadow-lg shadow-black/30"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-500/30 flex items-center justify-center text-amber-300 mb-3 group-hover:scale-110 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div className="font-semibold text-slate-200 text-sm group-hover:text-amber-300 transition-colors">
              Qibla Compass
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Real-time smart compass
            </p>
          </button>

          {/* Authentic Duas */}
          <button
            onClick={() => onNavigateTab('duas')}
            className="flex flex-col items-start p-4 rounded-2xl bg-[#09132E] hover:bg-[#0D1C44] border border-amber-500/20 hover:border-amber-500/40 transition-all duration-200 group text-left cursor-pointer shadow-lg shadow-black/30"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-500/30 flex items-center justify-center text-amber-300 mb-3 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="font-semibold text-slate-200 text-sm group-hover:text-amber-300 transition-colors">
              Authentic Duas
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Categorized with audio
            </p>
          </button>

          {/* Hijri Calendar */}
          <button
            onClick={() => onNavigateTab('prayers')}
            className="flex flex-col items-start p-4 rounded-2xl bg-[#09132E] hover:bg-[#0D1C44] border border-amber-500/20 hover:border-amber-500/40 transition-all duration-200 group text-left cursor-pointer shadow-lg shadow-black/30"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-500/30 flex items-center justify-center text-amber-300 mb-3 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="font-semibold text-slate-200 text-sm group-hover:text-amber-300 transition-colors">
              Islamic Calendar
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Azan & Mosque offsets
            </p>
          </button>
        </div>
      </div>

      {/* TODAY'S 6 PRAYER TIMINGS GRID */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider font-display">
            Daily Prayer Timings
          </h2>
          <button
            onClick={() => onNavigateTab('prayers')}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Mosque Settings</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {prayersList.map((prayer) => {
            const isNext = nextPrayer.name === prayer.name;
            const isPlayingThis = playingAzanPrayer === prayer.name;

            return (
              <div
                key={prayer.name}
                className={`relative rounded-2xl p-3.5 transition-all flex flex-col justify-between ${
                  isNext
                    ? 'bg-gradient-to-b from-[#132857] to-[#0A1738] border-2 border-amber-400/60 shadow-lg shadow-amber-500/10'
                    : 'bg-[#09132E]/90 border border-slate-800 hover:border-amber-500/30'
                }`}
              >
                {isNext && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-400 text-[#070D1E] text-[9px] font-bold uppercase tracking-wider shadow">
                    Next
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-300">{prayer.name}</span>
                    <span className="font-arabic text-amber-300/80 text-sm">
                      {prayer.arabic}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-slate-100 font-display">
                    {formatTo12Hour(prayer.time)}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    {prayer.name === 'Sunrise' ? 'Solar Event' : 'Salah'}
                  </span>
                  {prayer.name !== 'Sunrise' && (
                    <button
                      onClick={() => handlePlayAzanPreview(prayer.name)}
                      className={`p-1 rounded-md transition-colors cursor-pointer ${
                        isPlayingThis
                          ? 'bg-amber-400 text-slate-950 animate-pulse'
                          : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800'
                      }`}
                      title="Preview Azan tone"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DAILY QURANIC VERSE */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0A1633] via-[#08122B] to-[#050B1B] border border-amber-500/25 p-6 shadow-xl shadow-black/40">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300 font-display">
                Daily Quranic Verse
              </span>
              <p className="text-[11px] text-slate-400">
                Surah {dailyVerse.surahName} ({dailyVerse.surahNameArabic}) • {dailyVerse.surahNumber}:{dailyVerse.ayahNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {dailyVerse.theme}
            </span>

            {/* Audio Recitation button */}
            <button
              onClick={handleToggleVerseAudio}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                isPlayingAudio
                  ? 'bg-amber-400 text-slate-950 border-amber-300'
                  : 'bg-slate-900 border-amber-500/30 text-amber-300 hover:bg-amber-500/10'
              }`}
              title="Listen to Verse Recitation"
            >
              {isPlayingAudio ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Recite</span>
                </>
              )}
            </button>

            {/* Share / Copy button */}
            <button
              onClick={handleCopyVerse}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
              title="Copy Verse"
            >
              {copiedVerse ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Arabic Calligraphy */}
        <div className="bg-[#050A17]/60 rounded-2xl p-5 border border-amber-500/15 mb-4 text-right">
          <p className="font-arabic text-2xl sm:text-3xl text-amber-200 leading-loose tracking-wide select-all">
            {dailyVerse.arabicText}
          </p>
        </div>

        {/* Transliteration and Translation */}
        <div className="space-y-2">
          <p className="text-xs text-amber-300/80 italic font-mono">
            {dailyVerse.transliteration}
          </p>
          <p className="text-sm sm:text-base text-slate-200 font-normal leading-relaxed">
            "{dailyVerse.translation}"
          </p>
        </div>
      </div>
    </div>
  );
};
