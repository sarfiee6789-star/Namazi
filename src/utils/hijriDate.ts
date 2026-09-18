import { HijriDateInfo, IslamicEvent } from '../types';

export const HIJRI_MONTHS_EN = [
  'Muharram',
  'Safar',
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhu al-Qi'dah",
  'Dhu al-Hijjah',
];

export const HIJRI_MONTHS_AR = [
  'المُحَرَّم',
  'صَفَر',
  'رَبِيع الأوّل',
  'رَبِيع الآخِر',
  'جُمَادَى الأولى',
  'جُمَادَى الآخِرة',
  'رَجَب',
  'شَعْبَان',
  'رَمَضَان',
  'شَوَّال',
  'ذُو القَعْدَة',
  'ذُو الحِجَّة',
];

export const ISLAMIC_EVENTS: IslamicEvent[] = [
  {
    id: 'islamic-new-year',
    title: 'Islamic New Year',
    arabicTitle: 'رأس السنة الهجرية',
    hijriMonth: 1,
    hijriDay: 1,
    description: 'First day of Muharram, marking the Hijra of Prophet Muhammad (ﷺ).',
    importance: 'high',
  },
  {
    id: 'day-of-ashura',
    title: 'Day of Ashura',
    arabicTitle: 'يوم عاشوراء',
    hijriMonth: 1,
    hijriDay: 10,
    description: '10th of Muharram; recommended day of fasting commemorating Prophet Musa (AS).',
    importance: 'high',
  },
  {
    id: 'mawlid',
    title: "Mawlid an-Nabi",
    arabicTitle: 'المولد النبوي الشريف',
    hijriMonth: 3,
    hijriDay: 12,
    description: 'Commemoration of the birth of the Prophet Muhammad (ﷺ).',
    importance: 'medium',
  },
  {
    id: 'isra-miraj',
    title: "Al-Isra' wal-Mi'raj",
    arabicTitle: 'الإسراء والمعراج',
    hijriMonth: 7,
    hijriDay: 27,
    description: 'The miraculous Night Journey and Ascension to the Heavens, when the 5 daily prayers were gifted.',
    importance: 'high',
  },
  {
    id: 'nisf-shaban',
    title: "Mid-Sha'ban (Nisf Sha'ban)",
    arabicTitle: 'ليلة النصف من شعبان',
    hijriMonth: 8,
    hijriDay: 15,
    description: "The 15th night of Sha'ban, night of forgiveness and prayer in preparation for Ramadan.",
    importance: 'medium',
  },
  {
    id: 'start-of-ramadan',
    title: 'First Day of Ramadan',
    arabicTitle: 'غرة شهر رمضان المبارك',
    hijriMonth: 9,
    hijriDay: 1,
    description: 'The beginning of the blessed holy month of fasting and Quranic revelation.',
    importance: 'high',
  },
  {
    id: 'laylat-al-qadr',
    title: 'Laylat al-Qadr (Night of Power)',
    arabicTitle: 'ليلة القدر المباركة',
    hijriMonth: 9,
    hijriDay: 27,
    description: 'Better than a thousand months; seeking the blessed night in the last odd nights of Ramadan.',
    importance: 'high',
  },
  {
    id: 'eid-al-fitr',
    title: 'Eid al-Fitr',
    arabicTitle: 'عيد الفطر المبارك',
    hijriMonth: 10,
    hijriDay: 1,
    description: 'Joyous celebration marking the conclusion of the holy month of Ramadan.',
    importance: 'high',
  },
  {
    id: 'day-of-arafah',
    title: 'Day of Arafah',
    arabicTitle: 'يوم عرفة',
    hijriMonth: 12,
    hijriDay: 9,
    description: 'The pinnacle of Hajj; expiates sins of the previous and coming year for non-pilgrim fasters.',
    importance: 'high',
  },
  {
    id: 'eid-al-adha',
    title: 'Eid al-Adha',
    arabicTitle: 'عيد الأضحى المبارك',
    hijriMonth: 12,
    hijriDay: 10,
    description: 'Feast of the Sacrifice commemorating Prophet Ibrahim’s (AS) devotion.',
    importance: 'high',
  },
];

/**
 * Converts a Gregorian Date to an approximate Islamic (Hijri) date
 * using Kuwaiti algorithm / Intl.DateTimeFormat
 */
export function getHijriDate(date: Date, dayAdjustment: number = 0): HijriDateInfo {
  // Try using native Intl with islamic-umalqura calendar
  try {
    const adjustedDate = new Date(date);
    adjustedDate.setDate(adjustedDate.getDate() + dayAdjustment);

    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });

    const parts = formatter.formatToParts(adjustedDate);
    const dayPart = parts.find((p) => p.type === 'day')?.value;
    const monthPart = parts.find((p) => p.type === 'month')?.value;
    const yearPart = parts.find((p) => p.type === 'year')?.value;

    const day = parseInt(dayPart || '1', 10);
    const month = parseInt(monthPart || '1', 10);
    const year = parseInt(yearPart || '1448', 10);

    const monthIndex = Math.max(0, Math.min(11, month - 1));
    const monthNameEn = HIJRI_MONTHS_EN[monthIndex];
    const monthNameAr = HIJRI_MONTHS_AR[monthIndex];

    return {
      day,
      month,
      monthNameEn,
      monthNameAr,
      year,
      formattedEn: `${day} ${monthNameEn} ${year} AH`,
      formattedAr: `${day} ${monthNameAr} ${year} هـ`,
    };
  } catch {
    // Mathematical algorithmic fallback
    const jd = Math.floor((date.getTime() / 86400000) + 2440587.5) + dayAdjustment;
    const l = jd - 1948440 + 10632;
    const n = Math.floor((l - 1) / 10631);
    const l2 = l - 10631 * n + 354;
    const j =
      Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
      Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
    const l3 =
      l2 -
      Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
      Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
      29;
    const m = Math.floor((24 * l3) / 709);
    const d = l3 - Math.floor((709 * m) / 24);
    const y = 30 * n + j - 30;

    const monthIndex = Math.max(0, Math.min(11, m - 1));
    return {
      day: d,
      month: m,
      monthNameEn: HIJRI_MONTHS_EN[monthIndex],
      monthNameAr: HIJRI_MONTHS_AR[monthIndex],
      year: y,
      formattedEn: `${d} ${HIJRI_MONTHS_EN[monthIndex]} ${y} AH`,
      formattedAr: `${d} ${HIJRI_MONTHS_AR[monthIndex]} ${y} هـ`,
    };
  }
}
