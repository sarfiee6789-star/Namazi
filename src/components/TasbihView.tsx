import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  History,
  Volume2,
  VolumeX,
  Vibrate,
  Sparkles,
  ChevronDown,
  Trash2,
  CheckCircle,
  Plus,
} from 'lucide-react';
import { DhikrPreset, TasbihSession } from '../types';
import { DHIKR_PRESETS } from '../data/dhikrData';
import { audioService } from '../utils/audioService';

export const TasbihView: React.FC = () => {
  const [selectedDhikr, setSelectedDhikr] = useState<DhikrPreset>(DHIKR_PRESETS[0]);
  const [count, setCount] = useState<number>(0);
  const [target, setTarget] = useState<number>(33);
  const [cyclesCompleted, setCyclesCompleted] = useState<number>(0);
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [history, setHistory] = useState<TasbihSession[]>(() => {
    try {
      const saved = localStorage.getItem('namazi_tasbih_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isPressing, setIsPressing] = useState<boolean>(false);
  const [customTargetModal, setCustomTargetModal] = useState<boolean>(false);
  const [customTargetInput, setCustomTargetInput] = useState<string>('500');

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('namazi_tasbih_history', JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  // Handle tap / count increment
  const handleTap = () => {
    setIsPressing(true);
    setTimeout(() => setIsPressing(false), 120);

    const newCount = count + 1;
    setCount(newCount);

    // Audio & Haptic Feedback
    if (soundEnabled) {
      audioService.playTasbihClick();
    }
    if (vibrationEnabled) {
      audioService.vibrate(25);
    }

    // Check target reached
    if (target > 0 && newCount >= target) {
      // Milestone celebration
      if (soundEnabled) {
        audioService.playMilestoneSound();
      }
      if (vibrationEnabled) {
        audioService.vibrate([60, 80, 60]);
      }

      // Confetti burst
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#F7D794', '#DFB15B', '#FFFFFF', '#60A5FA'],
        });
      } catch {
        // ignore
      }

      // Log session
      const durationSeconds = Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000));
      const session: TasbihSession = {
        id: Date.now().toString(),
        dhikrId: selectedDhikr.id,
        dhikrArabic: selectedDhikr.arabic,
        dhikrTransliteration: selectedDhikr.transliteration,
        count: newCount,
        target: target,
        completedAt: new Date().toISOString(),
        durationSeconds,
      };

      setHistory((prev) => [session, ...prev.slice(0, 49)]); // keep last 50
      setCyclesCompleted((prev) => prev + 1);
      setCount(0); // Reset for next cycle or continuous loop
      setSessionStartTime(Date.now());
    }
  };

  // Reset counter manually
  const handleReset = () => {
    if (count > 0) {
      // If user had counted partially, log partial progress if > 5
      if (count >= 5) {
        const durationSeconds = Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000));
        const session: TasbihSession = {
          id: Date.now().toString(),
          dhikrId: selectedDhikr.id,
          dhikrArabic: selectedDhikr.arabic,
          dhikrTransliteration: selectedDhikr.transliteration,
          count: count,
          target: target,
          completedAt: new Date().toISOString(),
          durationSeconds,
        };
        setHistory((prev) => [session, ...prev.slice(0, 49)]);
      }
    }
    setCount(0);
    setSessionStartTime(Date.now());
  };

  const handleSelectDhikr = (dhikr: DhikrPreset) => {
    if (count > 0) {
      handleReset();
    }
    setSelectedDhikr(dhikr);
    setTarget(dhikr.defaultTarget);
    setCyclesCompleted(0);
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all recorded Tasbih history?')) {
      setHistory([]);
    }
  };

  // SVG ring calculations
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const progress = target > 0 ? Math.min(1, count / target) : 0;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto px-4 sm:px-6 pt-4">
      {/* Top Header & Toggles */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 font-display">
            Digital Tasbih
          </h1>
          <p className="text-xs text-amber-300/80">
            Tactile counter with haptic feedback & goal tracking
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl p-1">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg text-xs transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-amber-400/15 text-amber-300 border border-amber-500/30'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setVibrationEnabled(!vibrationEnabled)}
            className={`p-2 rounded-lg text-xs transition-colors cursor-pointer ${
              vibrationEnabled
                ? 'bg-amber-400/15 text-amber-300 border border-amber-500/30'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle Vibration"
          >
            <Vibrate className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2 rounded-lg text-xs transition-colors cursor-pointer ${
              showHistory
                ? 'bg-amber-400/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-amber-300'
            }`}
            title="View Tasbih History"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dhikr Selector Card */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0C1736] via-[#09122A] to-[#060D1E] border border-amber-500/30 p-4 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">
            Selected Dhikr
          </span>
          <div className="relative group">
            <select
              value={selectedDhikr.id}
              onChange={(e) => {
                const found = DHIKR_PRESETS.find((d) => d.id === e.target.value);
                if (found) handleSelectDhikr(found);
              }}
              className="appearance-none bg-slate-900 border border-amber-500/30 text-amber-300 text-xs rounded-xl px-3 py-1.5 pr-7 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {DHIKR_PRESETS.map((d) => (
                <option key={d.id} value={d.id} className="bg-slate-900 text-slate-200">
                  {d.transliteration} ({d.defaultTarget})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-amber-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Arabic Calligraphy Display */}
        <div className="text-center py-2">
          <p className="font-arabic text-2xl sm:text-3xl text-amber-200 leading-relaxed drop-shadow">
            {selectedDhikr.arabic}
          </p>
          <p className="text-sm font-semibold text-slate-100 mt-1">
            {selectedDhikr.transliteration}
          </p>
          <p className="text-xs text-slate-300/80 mt-0.5 max-w-md mx-auto">
            "{selectedDhikr.meaning}"
          </p>
        </div>

        {/* Virtue footnote */}
        <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-amber-300/70 flex items-center gap-1.5 justify-center">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{selectedDhikr.virtue}</span>
        </div>
      </div>

      {/* Target Goal Presets */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-slate-400 shrink-0 font-medium">
          Goal:
        </span>
        <div className="flex items-center gap-1.5">
          {[33, 99, 100, 1000].map((presetTarget) => (
            <button
              key={presetTarget}
              onClick={() => {
                setTarget(presetTarget);
                setCount(0);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                target === presetTarget
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'bg-slate-900/90 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-amber-500/30'
              }`}
            >
              {presetTarget}
            </button>
          ))}
          <button
            onClick={() => setCustomTargetModal(true)}
            className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1 ${
              ![33, 99, 100, 1000].includes(target)
                ? 'bg-amber-400 text-slate-950 border-amber-400'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-500/30'
            }`}
          >
            <span>{![33, 99, 100, 1000].includes(target) ? `${target}` : 'Custom'}</span>
          </button>
        </div>
      </div>

      {/* LARGE TAPPABLE CIRCULAR COUNTER */}
      <div className="flex flex-col items-center justify-center py-4">
        <div className="relative flex items-center justify-center">
          {/* SVG Progress Ring */}
          <svg className="w-72 h-72 sm:w-80 sm:h-80 -rotate-90">
            {/* Background track */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              className="text-slate-800/80 stroke-current"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Glowing Golden Progress Arc */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="url(#goldGradient)"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-200 ease-out"
            />
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#DFB15B" />
                <stop offset="50%" stopColor="#F7D794" />
                <stop offset="100%" stopColor="#C99738" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Tappable Button */}
          <button
            onClick={handleTap}
            aria-label="Tap to count Dhikr"
            className={`absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-[#12224A] via-[#0D1836] to-[#070D1E] border-2 border-amber-500/40 shadow-2xl flex flex-col items-center justify-center cursor-pointer select-none active:scale-95 transition-transform duration-100 ${
              isPressing
                ? 'scale-95 border-amber-400 ring-8 ring-amber-400/20 shadow-[0_0_30px_rgba(245,158,11,0.4)]'
                : 'hover:border-amber-400/60'
            }`}
          >
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400/80 mb-1">
              Tap Anywhere
            </span>
            <div className="text-6xl sm:text-7xl font-extrabold font-display text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-100 to-amber-300 drop-shadow">
              {count}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-2">
              <span className="font-semibold text-amber-300">Goal: {target}</span>
              {cyclesCompleted > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                  {cyclesCompleted} {cyclesCompleted === 1 ? 'Round' : 'Rounds'}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Counter Action Controls (Reset & Quick Plus) */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/30 text-slate-300 hover:text-amber-300 text-xs font-semibold transition-all cursor-pointer shadow"
            title="Reset counter"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Counter</span>
          </button>

          <button
            onClick={handleTap}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+1 Count</span>
          </button>
        </div>
      </div>

      {/* Custom Target Modal */}
      {customTargetModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A1430] border border-amber-500/40 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100">
              Set Custom Target Goal
            </h3>
            <p className="text-xs text-slate-400">
              Enter target number of repetitions for this dhikr session.
            </p>
            <input
              type="number"
              min="1"
              max="100000"
              value={customTargetInput}
              onChange={(e) => setCustomTargetInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-amber-500/30 text-slate-100 focus:outline-none focus:border-amber-400 text-lg font-bold"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCustomTargetModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const val = parseInt(customTargetInput, 10);
                  if (val > 0) {
                    setTarget(val);
                    setCount(0);
                  }
                  setCustomTargetModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs shadow hover:brightness-110"
              >
                Save Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Drawer / Log List */}
      {showHistory && (
        <div className="rounded-2xl bg-[#09132E] border border-amber-500/30 p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-100">
                Completed Sessions History
              </h3>
              <span className="text-xs text-slate-400">({history.length})</span>
            </div>
            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              No completed sessions recorded yet. Tap the counter to reach your target goal!
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#070D1E] border border-slate-800 hover:border-amber-500/30 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                      <span>{item.dhikrTransliteration}</span>
                      <span className="text-amber-300/80 font-arabic text-sm">
                        {item.dhikrArabic}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(item.completedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        month: 'short',
                        day: 'numeric',
                      })} • {item.durationSeconds}s
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-amber-400/10 border border-amber-500/20 text-amber-300 font-bold">
                      {item.count} / {item.target}
                    </span>
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
