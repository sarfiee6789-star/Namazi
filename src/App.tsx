import { useState, useEffect, useMemo } from 'react';
import {
  TabType,
  LocationCoordinates,
  CalculationMethodId,
  JuristicMethod,
  MosqueOffsets,
  PrayerNotificationSettings,
  SilentModeSettings,
} from './types';
import {
  computePrayerTimes,
  getNextPrayer,
  PRESET_CITIES,
} from './utils/prayerCalc';
import { getHijriDate } from './utils/hijriDate';
import { getDailyVerse } from './data/quranVerses';
import { audioService } from './utils/audioService';

import { Navbar } from './components/Navbar';
import { TabBar } from './components/TabBar';
import { DashboardView } from './components/DashboardView';
import { TasbihView } from './components/TasbihView';
import { QiblaView } from './components/QiblaView';
import { DuasView } from './components/DuasView';
import { PrayerCalendarView } from './components/PrayerCalendarView';
import { LocationModal } from './components/LocationModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // User persistent settings with localStorage fallbacks
  const [currentLocation, setCurrentLocation] = useState<LocationCoordinates>(() => {
    try {
      const saved = localStorage.getItem('namazi_location');
      return saved ? JSON.parse(saved) : PRESET_CITIES[0]; // Mecca default
    } catch {
      return PRESET_CITIES[0];
    }
  });

  const [calculationMethod, setCalculationMethod] = useState<CalculationMethodId>(() => {
    try {
      const saved = localStorage.getItem('namazi_calc_method');
      return (saved as CalculationMethodId) || 'MWL';
    } catch {
      return 'MWL';
    }
  });

  const [juristicMethod, setJuristicMethod] = useState<JuristicMethod>(() => {
    try {
      const saved = localStorage.getItem('namazi_juristic_method');
      return (saved as JuristicMethod) || 'Standard';
    } catch {
      return 'Standard';
    }
  });

  const [mosqueOffsets, setMosqueOffsets] = useState<MosqueOffsets>(() => {
    try {
      const saved = localStorage.getItem('namazi_mosque_offsets');
      return saved
        ? JSON.parse(saved)
        : { Fajr: 0, Sunrise: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 };
    } catch {
      return { Fajr: 0, Sunrise: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 };
    }
  });

  const [notificationSettings, setNotificationSettings] =
    useState<PrayerNotificationSettings>(() => {
      try {
        const saved = localStorage.getItem('namazi_notif_settings');
        return saved
          ? JSON.parse(saved)
          : {
              Fajr: 'azan',
              Sunrise: 'off',
              Dhuhr: 'azan',
              Asr: 'azan',
              Maghrib: 'azan',
              Isha: 'azan',
              azanSound: 'makkah',
            };
      } catch {
        return {
          Fajr: 'azan',
          Sunrise: 'off',
          Dhuhr: 'azan',
          Asr: 'azan',
          Maghrib: 'azan',
          Isha: 'azan',
          azanSound: 'makkah',
        };
      }
    });

  const [silentModeSettings, setSilentModeSettings] = useState<SilentModeSettings>(
    () => {
      try {
        const saved = localStorage.getItem('namazi_silent_settings');
        return saved
          ? JSON.parse(saved)
          : {
              enabled: true,
              durationMinutes: 20,
              prayers: {
                Fajr: true,
                Dhuhr: true,
                Asr: true,
                Maghrib: true,
                Isha: true,
              },
            };
      } catch {
        return {
          enabled: true,
          durationMinutes: 20,
          prayers: {
            Fajr: true,
            Dhuhr: true,
            Asr: true,
            Maghrib: true,
            Isha: true,
          },
        };
      }
    }
  );

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('namazi_location', JSON.stringify(currentLocation));
    } catch {
      // ignore
    }
  }, [currentLocation]);

  useEffect(() => {
    try {
      localStorage.setItem('namazi_calc_method', calculationMethod);
    } catch {
      // ignore
    }
  }, [calculationMethod]);

  useEffect(() => {
    try {
      localStorage.setItem('namazi_juristic_method', juristicMethod);
    } catch {
      // ignore
    }
  }, [juristicMethod]);

  useEffect(() => {
    try {
      localStorage.setItem('namazi_mosque_offsets', JSON.stringify(mosqueOffsets));
    } catch {
      // ignore
    }
  }, [mosqueOffsets]);

  useEffect(() => {
    try {
      localStorage.setItem(
        'namazi_notif_settings',
        JSON.stringify(notificationSettings)
      );
    } catch {
      // ignore
    }
  }, [notificationSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(
        'namazi_silent_settings',
        JSON.stringify(silentModeSettings)
      );
    } catch {
      // ignore
    }
  }, [silentModeSettings]);

  // Real-time ticking clock for next prayer countdown
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute today's prayer times based on location, calculation method, juristic method & offsets
  const todayPrayerTimes = useMemo(() => {
    return computePrayerTimes(
      currentTime,
      currentLocation,
      calculationMethod,
      juristicMethod,
      mosqueOffsets
    );
  }, [currentTime, currentLocation, calculationMethod, juristicMethod, mosqueOffsets]);

  // Compute next prayer info and remaining countdown
  const nextPrayer = useMemo(() => {
    return getNextPrayer(
      todayPrayerTimes,
      currentTime,
      silentModeSettings.durationMinutes
    );
  }, [todayPrayerTimes, currentTime, silentModeSettings.durationMinutes]);

  // Check if silent mode is actively engaged
  const isSilentModeActive = useMemo(() => {
    if (!silentModeSettings.enabled) return false;
    return nextPrayer.isPrayerTimeNow;
  }, [silentModeSettings.enabled, nextPrayer.isPrayerTimeNow]);

  // Current Hijri date info
  const hijriDate = useMemo(() => {
    return getHijriDate(currentTime);
  }, [currentTime]);

  // Daily Quranic verse
  const dailyVerse = useMemo(() => {
    return getDailyVerse(currentTime);
  }, [currentTime]);

  const handleToggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioService.setMuted(newMuted);
  };

  return (
    <div className="min-h-screen bg-[#070D1E] text-slate-100 flex flex-col font-display selection:bg-amber-500/20 selection:text-amber-200">
      {/* Top Navbar */}
      <Navbar
        hijriDate={hijriDate}
        currentLocation={currentLocation}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        isSilentModeActive={isSilentModeActive}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* Main Tab Content */}
      <main className="flex-1">
        {activeTab === 'dashboard' && (
          <DashboardView
            prayerTimes={todayPrayerTimes}
            nextPrayer={nextPrayer}
            dailyVerse={dailyVerse}
            currentLocation={currentLocation}
            hijriDate={hijriDate}
            isSilentModeActive={isSilentModeActive}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenLocationModal={() => setIsLocationModalOpen(true)}
          />
        )}

        {activeTab === 'prayers' && (
          <PrayerCalendarView
            currentLocation={currentLocation}
            calculationMethod={calculationMethod}
            onChangeCalculationMethod={setCalculationMethod}
            juristicMethod={juristicMethod}
            onChangeJuristicMethod={setJuristicMethod}
            mosqueOffsets={mosqueOffsets}
            onChangeMosqueOffsets={setMosqueOffsets}
            notificationSettings={notificationSettings}
            onChangeNotificationSettings={setNotificationSettings}
            silentModeSettings={silentModeSettings}
            onChangeSilentModeSettings={setSilentModeSettings}
            hijriDate={hijriDate}
            todayPrayerTimes={todayPrayerTimes}
          />
        )}

        {activeTab === 'tasbih' && <TasbihView />}

        {activeTab === 'qibla' && (
          <QiblaView
            currentLocation={currentLocation}
            onOpenLocationModal={() => setIsLocationModalOpen(true)}
          />
        )}

        {activeTab === 'duas' && <DuasView />}
      </main>

      {/* Bottom Tab Navigation Bar */}
      <TabBar activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Location Selector Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={currentLocation}
        onSelectLocation={setCurrentLocation}
      />
    </div>
  );
}
