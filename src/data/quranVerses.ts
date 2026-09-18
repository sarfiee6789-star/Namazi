import { QuranVerse } from '../types';

export const QURAN_VERSES: QuranVerse[] = [
  {
    id: 1,
    surahNumber: 2,
    surahName: 'Al-Baqarah',
    surahNameArabic: 'البقرة',
    ayahNumber: 152,
    arabicText: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ',
    transliteration: 'Fadhkurūnī adhkurkum washkurū lī wa lā takfurūn',
    translation: 'So remember Me; I will remember you. And be grateful to Me and do not deny Me.',
    theme: 'Remembrance & Gratitude',
  },
  {
    id: 2,
    surahNumber: 2,
    surahName: 'Al-Baqarah',
    surahNameArabic: 'البقرة',
    ayahNumber: 286,
    arabicText: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
    transliteration: 'Lā yukallifullāhu nafsan illā wus‘ahā',
    translation: 'Allah does not burden a soul beyond that it can bear.',
    theme: 'Hope & Resilience',
  },
  {
    id: 3,
    surahNumber: 94,
    surahName: 'Ash-Sharh',
    surahNameArabic: 'الشرح',
    ayahNumber: 5,
    arabicText: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا • إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    transliteration: "Fa'inna ma'al-'usri yusrā • Inna ma'al-'usri yusrā",
    translation: 'For indeed, with hardship [will be] ease. Indeed, with hardship [will be] ease.',
    theme: 'Comfort in Trial',
  },
  {
    id: 4,
    surahNumber: 13,
    surahName: "Ar-Ra'd",
    surahNameArabic: 'الرعد',
    ayahNumber: 28,
    arabicText: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    transliteration: 'Alā bidhikrillāhi taṭma’innul-qulūb',
    translation: 'Unquestionably, by the remembrance of Allah hearts are assured.',
    theme: 'Inner Peace',
  },
  {
    id: 5,
    surahNumber: 65,
    surahName: 'At-Talaq',
    surahNameArabic: 'الطلاق',
    ayahNumber: 3,
    arabicText: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
    transliteration: 'Wa may yatawakkal ‘alallāhi fahuwa ḥasbuh',
    translation: 'And whoever relies upon Allah - then He is sufficient for him.',
    theme: 'Tawakkul (Reliance)',
  },
  {
    id: 6,
    surahNumber: 3,
    surahName: 'Ali ‘Imran',
    surahNameArabic: 'آل عمران',
    ayahNumber: 139,
    arabicText: 'وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ',
    transliteration: 'Wa lā tahinū wa lā taḥzanū wa antumul-a‘lawna in kuntum mu’minīn',
    translation: 'So do not weaken and do not grieve, and you will be superior if you are [true] believers.',
    theme: 'Strength of Faith',
  },
  {
    id: 7,
    surahNumber: 2,
    surahName: 'Al-Baqarah',
    surahNameArabic: 'البقرة',
    ayahNumber: 186,
    arabicText: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ',
    transliteration: 'Wa idhā sa’alaka ‘ibādī ‘annī fa’innī qarīb, ujību da‘watad-dā‘i idhā da‘ān',
    translation: 'And when My servants ask you concerning Me - indeed I am near. I respond to the invocation of the supplicant when he calls upon Me.',
    theme: 'Closeness in Dua',
  },
  {
    id: 8,
    surahNumber: 14,
    surahName: 'Ibrahim',
    surahNameArabic: 'إبراهيم',
    ayahNumber: 7,
    arabicText: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ',
    transliteration: "La'in shakartum la'azīdannakum",
    translation: 'If you are grateful, I will surely increase your favor upon you.',
    theme: 'Blessing of Gratitude',
  },
];

export function getDailyVerse(date: Date = new Date()): QuranVerse {
  // Rotate verse deterministically by day of year
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return QURAN_VERSES[dayOfYear % QURAN_VERSES.length];
}
