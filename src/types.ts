export type TabType = 'dashboard' | 'prayers' | 'tasbih' | 'qibla' | 'duas' | 'settings';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  timezoneOffset?: number; // hours from UTC
}

export type CalculationMethodId = 
  | 'MWL'      // Muslim World League
  | 'ISNA'     // Islamic Society of North America
  | 'Egypt'    // Egyptian General Authority
  | 'Makkah'   // Umm al-Qura University, Makkah
  | 'Karachi'  // University of Islamic Sciences, Karachi
  | 'Tehran'   // Institute of Geophysics, University of Tehran
  | 'Gulf';    // Gulf Region

export interface CalculationMethod {
  id: CalculationMethodId;
  name: string;
  description: string;
  fajrAngle: number;
  ishaAngle?: number;
  ishaInterval?: number; // minutes after Maghrib (e.g. 90 mins for Makkah)
}

export type JuristicMethod = 'Standard' | 'Hanafi'; // Standard = Shafi'i, Maliki, Hanbali (shadow = 1), Hanafi (shadow = 2)

export interface PrayerTimesRecord {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  dateStr: string; // YYYY-MM-DD
}

export interface NextPrayerInfo {
  name: 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
  arabicName: string;
  timeStr: string;
  remainingSeconds: number;
  totalDurationSeconds: number;
  progressPercent: number; // 0 to 100
  isPrayerTimeNow: boolean; // within silent mode / prayer window
}

export interface MosqueOffsets {
  Fajr: number;
  Sunrise: number;
  Dhuhr: number;
  Asr: number;
  Maghrib: number;
  Isha: number;
}

export type AzanNotificationType = 'azan' | 'beep' | 'silent' | 'off';

export interface PrayerNotificationSettings {
  Fajr: AzanNotificationType;
  Sunrise: AzanNotificationType;
  Dhuhr: AzanNotificationType;
  Asr: AzanNotificationType;
  Maghrib: AzanNotificationType;
  Isha: AzanNotificationType;
  azanSound: 'makkah' | 'madinah' | 'alaqsa' | 'serene';
}

export interface SilentModeSettings {
  enabled: boolean;
  durationMinutes: number; // e.g. 20 minutes after Azan
  prayers: {
    Fajr: boolean;
    Dhuhr: boolean;
    Asr: boolean;
    Maghrib: boolean;
    Isha: boolean;
  };
}

export interface QuranVerse {
  id: number;
  surahNumber: number;
  surahName: string;
  surahNameArabic: string;
  ayahNumber: number;
  arabicText: string;
  transliteration: string;
  translation: string;
  theme: string;
}

export interface DhikrPreset {
  id: string;
  arabic: string;
  transliteration: string;
  meaning: string;
  virtue: string;
  defaultTarget: number;
}

export interface TasbihSession {
  id: string;
  dhikrId: string;
  dhikrArabic: string;
  dhikrTransliteration: string;
  count: number;
  target: number;
  completedAt: string; // ISO string
  durationSeconds: number;
}

export type DuaCategory = 
  | 'morning_evening'
  | 'salah_mosque'
  | 'daily_life'
  | 'forgiveness'
  | 'protection'
  | 'health_illness'
  | 'travel'
  | 'family_parents';

export interface DuaItem {
  id: string;
  title: string;
  category: DuaCategory;
  arabic: string;
  transliteration: string;
  translation: string;
  source: string;
  virtue?: string;
  whenToRecite?: string;
}

export interface IslamicEvent {
  id: string;
  title: string;
  arabicTitle: string;
  hijriDay: number;
  hijriMonth: number; // 1-indexed (1 = Muharram)
  description: string;
  importance: 'high' | 'medium';
}

export interface HijriDateInfo {
  day: number;
  month: number;
  monthNameEn: string;
  monthNameAr: string;
  year: number;
  formattedEn: string;
  formattedAr: string;
}
