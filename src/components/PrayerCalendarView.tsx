import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Sliders,
  Volume2,
  Bell,
  BellOff,
  Clock,
  Play,
  Square,
  Check,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Info,
} from 'lucide-react';
import {
  CalculationMethodId,
  HijriDateInfo,
  JuristicMethod,
  LocationCoordinates,
  MosqueOffsets,
  PrayerNotificationSettings,
  PrayerTimesRecord,
  SilentModeSettings,
} from '../types';
import {
  CALCULATION_METHODS,
  computePrayerTimes,
  formatTo12Hour,
} from '../utils/prayerCalc';
import { getHijriDate, ISLAMIC_EVENTS } from '../utils/hijriDate';
import { audioService } from '../utils/audioService';

interface PrayerCalendarViewProps {
  currentLocation: LocationCoordinates;
  calculationMethod: CalculationMethodId;
  onChangeCalculationMethod: (method: CalculationMethodId) => void;
  juristicMethod: JuristicMethod;
  onChangeJuristicMethod: (method: JuristicMethod) => void;
  mosqueOffsets: MosqueOffsets;
  onChangeMosqueOffsets: (offsets: MosqueOffsets) => void;
  notificationSettings: PrayerNotificationSettings;
  onChangeNotificationSettings: (settings: PrayerNotificationSettings) => void;
  silentModeSettings: SilentModeSettings;
  onChangeSilentModeSettings: (settings: SilentModeSettings) => void;
  hijriDate: HijriDateInfo;
  todayPrayerTimes: PrayerTimesRecord;
}

export const PrayerCalendarView: React.FC<PrayerCalendarViewProps> = ({
  currentLocation,
  calculationMethod,
  onChangeCalculationMethod,
  juristicMethod,
  onChangeJuristicMethod,
  mosqueOffsets,
  onChangeMosqueOffsets,
  notificationSettings,
  onChangeNotificationSettings,
  silentModeSettings,
  onChangeSilentModeSettings,
  hijriDate,
  todayPrayerTimes,
}) => {
  const [subTab, setSubTab] = useState<'settings' | 'calendar'>('settings');
  const [playingAzan, setPlayingAzan] = useState<string | null>(null);

  // Calendar state
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [selectedDayDate, setSelectedDayDate] = useState<Date>(new Date());

  // Handle Azan Sound Preview
  const handlePreviewAzan = (style: 'makkah' | 'madinah' | 'alaqsa' | 'serene') => {
    if (playingAzan === style) {
      setPlayingAzan(null);
      return;
    }
    setPlayingAzan(style);
    audioService.playAzanPreview(style, () => {
      setPlayingAzan(null);
    });
  };

  // Adjust offsets for specific prayer
  const handleOffsetChange = (prayer: keyof MosqueOffsets, delta: number) => {
    const updated = {
      ...mosqueOffsets,
      [prayer]: mosqueOffsets[prayer] + delta,
    };
    onChangeMosqueOffsets(updated);
  };

  // Request browser notification permissions
  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification('Namazi Azan Alerts Active', {
            body: `Prayer alerts configured for ${currentLocation.city}`,
            icon: '/assets/aistudio/icon.png',
          });
        }
      } catch {
        // ignore
      }
    }
  };

  // Generate calendar days for current month view
  const monthDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

    const days: Array<{
      date: Date;
      dayNumber: number;
      hijri: HijriDateInfo;
      isCurrentMonth: boolean;
      isToday: boolean;
      event?: (typeof ISLAMIC_EVENTS)[0];
    }> = [];

    // Current month days
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const h = getHijriDate(d);
      const isToday =
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();

      // Check if day matches any major Islamic event
      const event = ISLAMIC_EVENTS.find(
        (ev) => ev.hijriMonth === h.month && ev.hijriDay === h.day
      );

      days.push({
        date: d,
        dayNumber: i,
        hijri: h,
        isCurrentMonth: true,
        isToday,
        event,
      });
    }

    return { days, startingDayOfWeek, year, month };
  }, [calendarDate]);

  // Prayer times for selected day in calendar
  const selectedDayPrayerTimes = useMemo(() => {
    return computePrayerTimes(
      selectedDayDate,
      currentLocation,
      calculationMethod,
      juristicMethod,
      mosqueOffsets
    );
  }, [selectedDayDate, currentLocation, calculationMethod, juristicMethod, mosqueOffsets]);

  const selectedDayHijri = useMemo(() => {
    return getHijriDate(selectedDayDate);
  }, [selectedDayDate]);

  return (
    <div className="space-y-6 pb-24 max-w-3xl mx-auto px-4 sm:px-6 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 font-display">
            Prayer Times & Calendar
          </h1>
          <p className="text-xs text-amber-300/80">
            Mosque alignment, Azan sound notifications & automated silent mode
          </p>
        </div>

        {/* Sub-tab switcher */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
          <button
            onClick={() => setSubTab('settings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              subTab === 'settings'
                ? 'bg-amber-400 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mosque & Azan
          </button>
          <button
            onClick={() => setSubTab('calendar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              subTab === 'calendar'
                ? 'bg-amber-400 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Hijri Calendar
          </button>
        </div>
      </div>

      {subTab === 'settings' ? (
        <div className="space-y-6">
          {/* MOSQUE MANUAL OFFSETS ADJUSTMENT */}
          <div className="rounded-2xl bg-gradient-to-br from-[#0C1738] via-[#09122C] to-[#060D1E] border border-amber-500/25 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  Mosque Alignment (Manual Offsets)
                </h3>
              </div>
              <button
                onClick={() =>
                  onChangeMosqueOffsets({
                    Fajr: 0,
                    Sunrise: 0,
                    Dhuhr: 0,
                    Asr: 0,
                    Maghrib: 0,
                    Isha: 0,
                  })
                }
                className="text-xs text-amber-400 hover:text-amber-300 underline cursor-pointer"
              >
                Reset to 0
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Fine-tune prayer times by ± minutes to match the exact timetable of your local masjid.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {(['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const).map(
                (prayer) => {
                  const offset = mosqueOffsets[prayer];
                  return (
                    <div
                      key={prayer}
                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-semibold text-slate-200">
                          {prayer}
                        </div>
                        <div className="text-xs font-mono font-bold text-amber-300">
                          {formatTo12Hour(todayPrayerTimes[prayer])}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOffsetChange(prayer, -1)}
                          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs"
                          title="Subtract 1 minute"
                        >
                          -
                        </button>
                        <span
                          className={`text-xs font-mono font-bold min-w-[28px] text-center ${
                            offset > 0
                              ? 'text-emerald-400'
                              : offset < 0
                              ? 'text-rose-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {offset > 0 ? `+${offset}` : offset}m
                        </span>
                        <button
                          onClick={() => handleOffsetChange(prayer, 1)}
                          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs"
                          title="Add 1 minute"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* CALCULATION & JURISTIC METHOD */}
          <div className="rounded-2xl bg-[#09132E] border border-amber-500/20 p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Calculation & Juristic Methods</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Calculation Standard
                </label>
                <select
                  value={calculationMethod}
                  onChange={(e) =>
                    onChangeCalculationMethod(e.target.value as CalculationMethodId)
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  {Object.values(CALCULATION_METHODS).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  {CALCULATION_METHODS[calculationMethod]?.description}
                </p>
              </div>

              {/* Juristic Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Asr Juristic Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onChangeJuristicMethod('Standard')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      juristicMethod === 'Standard'
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow'
                        : 'bg-slate-900 border-slate-700 text-slate-300'
                    }`}
                  >
                    Standard (Shafi'i/Hanbali)
                  </button>
                  <button
                    onClick={() => onChangeJuristicMethod('Hanafi')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      juristicMethod === 'Hanafi'
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow'
                        : 'bg-slate-900 border-slate-700 text-slate-300'
                    }`}
                  >
                    Hanafi (Shadow x2)
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {juristicMethod === 'Standard'
                    ? 'Shadow length equals object height'
                    : 'Shadow length equals twice object height (later Asr time)'}
                </p>
              </div>
            </div>
          </div>

          {/* CUSTOMIZABLE AZAN NOTIFICATIONS */}
          <div className="rounded-2xl bg-gradient-to-br from-[#0B1638] via-[#08122C] to-[#060D1E] border border-amber-500/20 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  Customizable Azan Notifications
                </h3>
              </div>
              <button
                onClick={requestNotificationPermission}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 underline cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Enable Desktop Alerts</span>
              </button>
            </div>

            {/* Azan Voice / Sound Style Selector */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-semibold text-slate-300">
                Azan Audio Voice & Style
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'makkah', label: 'Makkah Al-Mukarramah' },
                  { id: 'madinah', label: 'Madinah Al-Munawwarah' },
                  { id: 'alaqsa', label: 'Al-Aqsa (Jerusalem)' },
                  { id: 'serene', label: 'Serene Minimal Chime' },
                ].map((sound) => {
                  const isSelected = notificationSettings.azanSound === sound.id;
                  const isPlaying = playingAzan === sound.id;

                  return (
                    <div
                      key={sound.id}
                      onClick={() =>
                        onChangeNotificationSettings({
                          ...notificationSettings,
                          azanSound: sound.id as any,
                        })
                      }
                      className={`p-3 rounded-xl border flex flex-col justify-between gap-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-400/15 border-amber-400 text-amber-200'
                          : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold leading-tight">
                        {sound.label}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviewAzan(sound.id as any);
                        }}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border transition-colors ${
                          isPlaying
                            ? 'bg-amber-400 text-slate-950 border-amber-300'
                            : 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
                        }`}
                      >
                        {isPlaying ? (
                          <>
                            <Square className="w-3 h-3 fill-current" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-current" />
                            <span>Preview</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Per-Prayer Notification Toggle */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300">
                Alert Preferences per Prayer
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const).map(
                  (prayer) => {
                    const currentType = notificationSettings[prayer];

                    return (
                      <div
                        key={prayer}
                        className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between"
                      >
                        <span className="text-xs font-semibold text-slate-200">
                          {prayer}
                        </span>
                        <select
                          value={currentType}
                          onChange={(e) =>
                            onChangeNotificationSettings({
                              ...notificationSettings,
                              [prayer]: e.target.value as any,
                            })
                          }
                          className="bg-slate-800 border border-slate-700 text-amber-300 text-[11px] rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                        >
                          <option value="azan">Azan Audio</option>
                          <option value="beep">Chime Only</option>
                          <option value="silent">Silent Visual</option>
                          <option value="off">Off</option>
                        </select>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          {/* SILENT MODE AUTOMATION DURING PRAYER HOURS */}
          <div className="rounded-2xl bg-gradient-to-br from-[#0A1633] via-[#071026] to-[#040817] border border-emerald-500/30 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    Silent Mode Automation
                  </h3>
                  <p className="text-xs text-slate-400">
                    Automatically quiets notification sounds during Jama'ah prayer
                  </p>
                </div>
              </div>

              {/* Master Toggle */}
              <button
                onClick={() =>
                  onChangeSilentModeSettings({
                    ...silentModeSettings,
                    enabled: !silentModeSettings.enabled,
                  })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  silentModeSettings.enabled ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    silentModeSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {silentModeSettings.enabled && (
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">
                      Silent Duration Window:
                    </span>
                    <span className="font-bold text-emerald-300">
                      {silentModeSettings.durationMinutes} Minutes after Azan
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="45"
                    step="5"
                    value={silentModeSettings.durationMinutes}
                    onChange={(e) =>
                      onChangeSilentModeSettings({
                        ...silentModeSettings,
                        durationMinutes: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>10 mins</span>
                    <span>20 mins (Recommended)</span>
                    <span>45 mins</span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 pt-1">
                  Active during:
                </div>
                <div className="flex flex-wrap gap-2">
                  {(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const).map(
                    (prayer) => {
                      const isActive = silentModeSettings.prayers[prayer];
                      return (
                        <button
                          key={prayer}
                          onClick={() =>
                            onChangeSilentModeSettings({
                              ...silentModeSettings,
                              prayers: {
                                ...silentModeSettings.prayers,
                                [prayer]: !isActive,
                              },
                            })
                          }
                          className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                              : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {isActive && '✓ '}
                          {prayer}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ISLAMIC HIJRI CALENDAR VIEW */
        <div className="space-y-6">
          {/* Month Navigation Card */}
          <div className="rounded-2xl bg-[#09132E] border border-amber-500/20 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() =>
                  setCalendarDate(
                    new Date(
                      calendarDate.getFullYear(),
                      calendarDate.getMonth() - 1,
                      1
                    )
                  )
                }
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-amber-300 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="text-center">
                <h3 className="text-base font-bold text-slate-100">
                  {calendarDate.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </h3>
                <p className="text-xs font-arabic text-amber-300">
                  {hijriDate.monthNameAr} {hijriDate.year} هـ
                </p>
              </div>

              <button
                onClick={() =>
                  setCalendarDate(
                    new Date(
                      calendarDate.getFullYear(),
                      calendarDate.getMonth() + 1,
                      1
                    )
                  )
                }
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-amber-300 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-amber-400/80 uppercase">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* Empty offset padding */}
              {Array.from({ length: monthDays.startingDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="h-14 opacity-0" />
              ))}

              {monthDays.days.map((item) => {
                const isSelected =
                  item.date.getDate() === selectedDayDate.getDate() &&
                  item.date.getMonth() === selectedDayDate.getMonth() &&
                  item.date.getFullYear() === selectedDayDate.getFullYear();

                return (
                  <button
                    key={item.dayNumber}
                    onClick={() => setSelectedDayDate(item.date)}
                    className={`h-14 rounded-xl p-1 flex flex-col justify-between items-center transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-lg shadow-amber-400/30'
                        : item.isToday
                        ? 'bg-amber-400/15 border-amber-400/60 text-amber-200'
                        : item.event
                        ? 'bg-indigo-950/40 border-indigo-500/40 text-slate-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-amber-500/30'
                    }`}
                  >
                    <span className="text-xs font-semibold leading-none mt-0.5">
                      {item.dayNumber}
                    </span>
                    <span
                      className={`text-[9px] font-mono leading-none ${
                        isSelected ? 'text-slate-900 font-bold' : 'text-amber-400/80'
                      }`}
                    >
                      {item.hijri.day}
                    </span>
                    {item.event && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SELECTED DAY PRAYER TIMINGS DETAIL */}
          <div className="rounded-2xl bg-gradient-to-br from-[#0B1638] via-[#08122C] to-[#060D1E] border border-amber-500/20 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-display">
                  Timings for {selectedDayDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </h3>
                <p className="text-xs text-amber-300 font-arabic">
                  {selectedDayHijri.formattedAr} ({selectedDayHijri.formattedEn})
                </p>
              </div>

              <div className="text-xs text-slate-400">
                {currentLocation.city}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {(['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const).map(
                (p) => (
                  <div
                    key={p}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center"
                  >
                    <span className="text-[11px] text-slate-400">{p}</span>
                    <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
                      {formatTo12Hour(selectedDayPrayerTimes[p])}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* KEY ISLAMIC EVENTS LIST */}
          <div className="rounded-2xl bg-[#09132E] border border-amber-500/20 p-5 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-amber-400" />
              <span>Major Islamic Holy Events (1448 AH)</span>
            </h3>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {ISLAMIC_EVENTS.map((event) => (
                <div
                  key={event.id}
                  className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/30 flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100">
                        {event.title}
                      </span>
                      <span className="font-arabic text-amber-300/80 text-sm">
                        {event.arabicTitle}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {event.description}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-lg bg-amber-400/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono whitespace-nowrap">
                    Day {event.hijriDay}, Month {event.hijriMonth}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
