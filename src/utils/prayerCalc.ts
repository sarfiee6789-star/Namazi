import {
  CalculationMethod,
  CalculationMethodId,
  JuristicMethod,
  LocationCoordinates,
  MosqueOffsets,
  NextPrayerInfo,
  PrayerTimesRecord,
} from '../types';

// Mecca coordinates for Qibla calculation
export const MECCA_COORDINATES = {
  latitude: 21.422487,
  longitude: 39.826206,
};

export const CALCULATION_METHODS: Record<CalculationMethodId, CalculationMethod> = {
  MWL: {
    id: 'MWL',
    name: 'Muslim World League',
    description: 'Fajr 18°, Isha 17° (Europe, Far East, parts of US)',
    fajrAngle: 18,
    ishaAngle: 17,
  },
  ISNA: {
    id: 'ISNA',
    name: 'Islamic Society of North America',
    description: 'Fajr 15°, Isha 15° (North America: USA & Canada)',
    fajrAngle: 15,
    ishaAngle: 15,
  },
  Egypt: {
    id: 'Egypt',
    name: 'Egyptian General Authority of Survey',
    description: 'Fajr 19.5°, Isha 17.5° (Africa, Syria, Lebanon, Malaysia)',
    fajrAngle: 19.5,
    ishaAngle: 17.5,
  },
  Makkah: {
    id: 'Makkah',
    name: 'Umm al-Qura University, Makkah',
    description: 'Fajr 18.5°, Isha 90 min after Maghrib (Arabian Peninsula)',
    fajrAngle: 18.5,
    ishaInterval: 90,
  },
  Karachi: {
    id: 'Karachi',
    name: 'University of Islamic Sciences, Karachi',
    description: 'Fajr 18°, Isha 18° (Pakistan, India, Bangladesh, Afghanistan)',
    fajrAngle: 18,
    ishaAngle: 18,
  },
  Tehran: {
    id: 'Tehran',
    name: 'Institute of Geophysics, Univ. of Tehran',
    description: 'Fajr 17.7°, Isha 14°',
    fajrAngle: 17.7,
    ishaAngle: 14,
  },
  Gulf: {
    id: 'Gulf',
    name: 'Gulf Region / Dubai',
    description: 'Fajr 19.5°, Isha 90 min after Maghrib',
    fajrAngle: 19.5,
    ishaInterval: 90,
  },
};

// Math helpers
const d2r = (d: number) => (d * Math.PI) / 180.0;
const r2d = (r: number) => (r * 180.0) / Math.PI;
const sinD = (d: number) => Math.sin(d2r(d));
const cosD = (d: number) => Math.cos(d2r(d));
const tanD = (d: number) => Math.tan(d2r(d));
const asinD = (x: number) => r2d(Math.asin(Math.max(-1, Math.min(1, x))));
const acosD = (x: number) => r2d(Math.acos(Math.max(-1, Math.min(1, x))));
const atan2D = (y: number, x: number) => r2d(Math.atan2(y, x));

/**
 * Calculates Qibla bearing from coordinates to Mecca in degrees (0 = North, clockwise)
 */
export function calculateQiblaBearing(lat: number, lng: number): number {
  const phi1 = d2r(lat);
  const phi2 = d2r(MECCA_COORDINATES.latitude);
  const deltaLambda = d2r(MECCA_COORDINATES.longitude - lng);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  const bearing = (r2d(Math.atan2(y, x)) + 360) % 360;
  return Math.round(bearing * 10) / 10;
}

/**
 * Calculates distance from coordinates to Mecca in kilometers
 */
export function calculateDistanceToMecca(lat: number, lng: number): number {
  const R = 6371; // Earth radius in km
  const dLat = d2r(MECCA_COORDINATES.latitude - lat);
  const dLng = d2r(MECCA_COORDINATES.longitude - lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(d2r(lat)) *
      Math.cos(d2r(MECCA_COORDINATES.latitude)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Astronomical Sun position calculation for prayer calculations
 */
function getSunPosition(julianDate: number) {
  const D = julianDate - 2451545.0;
  const g = (357.529 + 0.98560028 * D) % 360;
  const q = (280.459 + 0.98564736 * D) % 360;
  const L = (q + 1.915 * sinD(g) + 0.02 * sinD(2 * g)) % 360;
  const e = 23.439 - 0.00000036 * D; // Obliquity

  // Declination
  const delta = asinD(sinD(e) * sinD(L));

  // Equation of time in minutes
  const RA = (atan2D(cosD(e) * sinD(L), cosD(L)) + 360) % 360;
  let eqt = (q / 15 - RA / 15) * 60;
  while (eqt > 20) eqt -= 60;
  while (eqt < -20) eqt += 60;

  return { declination: delta, equationOfTime: eqt };
}

function getJulianDate(year: number, month: number, day: number): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return (
    Math.floor(365.25 * (year + 4716)) +
    Math.floor(30.6001 * (month + 1)) +
    day +
    B -
    1524.5
  );
}

/**
 * Calculates raw prayer times for a specific date and location
 */
export function computePrayerTimes(
  date: Date,
  location: LocationCoordinates,
  methodId: CalculationMethodId = 'MWL',
  juristic: JuristicMethod = 'Standard',
  offsets: MosqueOffsets = { Fajr: 0, Sunrise: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 }
): PrayerTimesRecord {
  const method = CALCULATION_METHODS[methodId] || CALCULATION_METHODS.MWL;
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const jd = getJulianDate(year, month, day);
  const { declination, equationOfTime } = getSunPosition(jd);

  // Timezone in hours (either explicitly provided or from date)
  const tz =
    location.timezoneOffset !== undefined
      ? location.timezoneOffset
      : -date.getTimezoneOffset() / 60;

  // Solar noon (Dhuhr base)
  const transit = 12 + tz - location.longitude / 15 - equationOfTime / 60;

  // Helper for Sun Hour Angle given depression angle
  const computeHourAngle = (angle: number) => {
    const lat = location.latitude;
    const cosHA =
      (sinD(-angle) - sinD(lat) * sinD(declination)) /
      (cosD(lat) * cosD(declination));
    if (cosHA > 1) return 0; // never rises
    if (cosHA < -1) return 180; // never sets
    return acosD(cosHA) / 15; // in hours
  };

  // Fajr
  const fajrHA = computeHourAngle(method.fajrAngle);
  const fajrTime = transit - fajrHA;

  // Sunrise (altitude = -0.833)
  const sunriseHA = computeHourAngle(0.833);
  const sunriseTime = transit - sunriseHA;

  // Dhuhr (transit + small safety buffer of ~1 min)
  const dhuhrTime = transit + 1 / 60;

  // Asr
  const shadowFactor = juristic === 'Hanafi' ? 2 : 1;
  const latDelta = Math.abs(location.latitude - declination);
  const asrAltitude = r2d(Math.atan(1 / (shadowFactor + tanD(latDelta))));
  const asrHA =
    acosD(
      (sinD(asrAltitude) - sinD(location.latitude) * sinD(declination)) /
        (cosD(location.latitude) * cosD(declination))
    ) / 15;
  const asrTime = transit + asrHA;

  // Maghrib / Sunset (altitude = -0.833 + 2 min buffer)
  const maghribTime = transit + sunriseHA + 2 / 60;

  // Isha
  let ishaTime: number;
  if (method.ishaInterval) {
    ishaTime = maghribTime + method.ishaInterval / 60;
  } else {
    const ishaHA = computeHourAngle(method.ishaAngle || 17);
    ishaTime = transit + ishaHA;
  }

  // Format hours float to HH:MM with offsets applied
  const formatTime = (rawHours: number, offsetMinutes: number) => {
    let totalMinutes = Math.round(rawHours * 60) + offsetMinutes;
    // Normalize within 24 hours
    totalMinutes = ((totalMinutes % 1440) + 1440) % 1440;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');

  return {
    Fajr: formatTime(fajrTime, offsets.Fajr),
    Sunrise: formatTime(sunriseTime, offsets.Sunrise),
    Dhuhr: formatTime(dhuhrTime, offsets.Dhuhr),
    Asr: formatTime(asrTime, offsets.Asr),
    Maghrib: formatTime(maghribTime, offsets.Maghrib),
    Isha: formatTime(ishaTime, offsets.Isha),
    dateStr: `${y}-${m}-${d}`,
  };
}

/**
 * Calculates remaining time until the next prayer and current progress
 */
export function getNextPrayer(
  times: PrayerTimesRecord,
  now: Date = new Date(),
  silentDurationMinutes: number = 20
): NextPrayerInfo {
  const prayers: Array<{
    name: 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
    arabicName: string;
    time: string;
  }> = [
    { name: 'Fajr', arabicName: 'الفجر', time: times.Fajr },
    { name: 'Sunrise', arabicName: 'الشروق', time: times.Sunrise },
    { name: 'Dhuhr', arabicName: 'الظهر', time: times.Dhuhr },
    { name: 'Asr', arabicName: 'العصر', time: times.Asr },
    { name: 'Maghrib', arabicName: 'المغرب', time: times.Maghrib },
    { name: 'Isha', arabicName: 'العشاء', time: times.Isha },
  ];

  const nowMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

  const toMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const prayerMinutesList = prayers.map((p) => ({
    ...p,
    minutes: toMinutes(p.time),
  }));

  // Check if currently in prayer/silent window (within silentDurationMinutes of any main prayer except Sunrise)
  let isPrayerTimeNow = false;
  for (const p of prayerMinutesList) {
    if (p.name === 'Sunrise') continue;
    if (nowMinutes >= p.minutes && nowMinutes <= p.minutes + silentDurationMinutes) {
      isPrayerTimeNow = true;
      break;
    }
  }

  // Find next prayer today
  let nextPrayer = prayerMinutesList.find((p) => p.minutes > nowMinutes);
  let prevPrayer = [...prayerMinutesList].reverse().find((p) => p.minutes <= nowMinutes);

  let remainingMinutes = 0;
  let totalIntervalMinutes = 240; // fallback

  if (nextPrayer) {
    remainingMinutes = nextPrayer.minutes - nowMinutes;
    if (prevPrayer) {
      totalIntervalMinutes = nextPrayer.minutes - prevPrayer.minutes;
    }
  } else {
    // Next prayer is Fajr tomorrow
    nextPrayer = prayerMinutesList[0];
    const fajrTomorrowMinutes = prayerMinutesList[0].minutes + 1440;
    remainingMinutes = fajrTomorrowMinutes - nowMinutes;
    const ishaMinutes = prayerMinutesList[prayerMinutesList.length - 1].minutes;
    totalIntervalMinutes = fajrTomorrowMinutes - ishaMinutes;
  }

  const remainingSeconds = Math.max(0, Math.round(remainingMinutes * 60));
  const totalDurationSeconds = Math.max(60, Math.round(totalIntervalMinutes * 60));
  const elapsedSeconds = totalDurationSeconds - remainingSeconds;
  const progressPercent = Math.min(
    100,
    Math.max(0, (elapsedSeconds / totalDurationSeconds) * 100)
  );

  return {
    name: nextPrayer.name,
    arabicName: nextPrayer.arabicName,
    timeStr: nextPrayer.time,
    remainingSeconds,
    totalDurationSeconds,
    progressPercent: Math.round(progressPercent),
    isPrayerTimeNow,
  };
}

/**
 * Formats seconds into human friendly duration like "2h 45m" or "18m 22s"
 */
export function formatRemainingTime(seconds: number): string {
  if (seconds <= 0) return 'Prayer Time Now';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}h ${m}m ${s}s`;
  }
  if (m > 0) {
    return `${m}m ${s}s`;
  }
  return `${s}s`;
}

/**
 * Formats 24h string "14:30" to 12h display "2:30 PM"
 */
export function formatTo12Hour(time24: string): string {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${mStr} ${ampm}`;
}

export const PRESET_CITIES: LocationCoordinates[] = [
  { city: 'Mecca (Makkah)', country: 'Saudi Arabia', latitude: 21.4225, longitude: 39.8262, timezoneOffset: 3 },
  { city: 'Medina (Madinah)', country: 'Saudi Arabia', latitude: 24.4672, longitude: 39.6111, timezoneOffset: 3 },
  { city: 'Jerusalem (Al-Quds)', country: 'Palestine', latitude: 31.7683, longitude: 35.2137, timezoneOffset: 3 },
  { city: 'Istanbul', country: 'Turkey', latitude: 41.0082, longitude: 28.9784, timezoneOffset: 3 },
  { city: 'Cairo', country: 'Egypt', latitude: 30.0444, longitude: 31.2357, timezoneOffset: 2 },
  { city: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708, timezoneOffset: 4 },
  { city: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, timezoneOffset: 1 },
  { city: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.006, timezoneOffset: -4 },
  { city: 'Toronto', country: 'Canada', latitude: 43.6532, longitude: -79.3832, timezoneOffset: -4 },
  { city: 'Kuala Lumpur', country: 'Malaysia', latitude: 3.139, longitude: 101.6869, timezoneOffset: 8 },
  { city: 'Jakarta', country: 'Indonesia', latitude: -6.2088, longitude: 106.8456, timezoneOffset: 7 },
  { city: 'Karachi', country: 'Pakistan', latitude: 24.8607, longitude: 67.0011, timezoneOffset: 5 },
  { city: 'Dhaka', country: 'Bangladesh', latitude: 23.8103, longitude: 90.4125, timezoneOffset: 6 },
  { city: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522, timezoneOffset: 2 },
  { city: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093, timezoneOffset: 10 },
];
