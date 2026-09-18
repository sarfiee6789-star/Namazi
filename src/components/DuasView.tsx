import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Volume2,
  Square,
  Play,
  Bookmark,
  BookmarkCheck,
  Share2,
  Check,
  Sparkles,
  BookOpen,
  SlidersHorizontal,
} from 'lucide-react';
import { DuaCategory, DuaItem } from '../types';
import { DUA_CATEGORIES, DUAS_DATA } from '../data/duasData';
import { audioService } from '../utils/audioService';

export const DuasView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DuaCategory | 'all' | 'favorites'>('all');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.85);
  const [activeAudioDuaId, setActiveAudioDuaId] = useState<string | null>(null);
  const [copiedDuaId, setCopiedDuaId] = useState<string | null>(null);

  // Favorites state persisted to localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('namazi_saved_duas');
      return saved ? JSON.parse(saved) : ['sayyid-al-istighfar', 'ayat-al-kursi'];
    } catch {
      return ['sayyid-al-istighfar', 'ayat-al-kursi'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('namazi_saved_duas', JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filtered Duas list
  const filteredDuas = useMemo(() => {
    return DUAS_DATA.filter((dua) => {
      // Category filter
      if (selectedCategory === 'favorites') {
        if (!favorites.includes(dua.id)) return false;
      } else if (selectedCategory !== 'all') {
        if (dua.category !== selectedCategory) return false;
      }

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        dua.title.toLowerCase().includes(q) ||
        dua.translation.toLowerCase().includes(q) ||
        dua.transliteration.toLowerCase().includes(q) ||
        dua.source.toLowerCase().includes(q) ||
        dua.arabic.includes(searchQuery)
      );
    });
  }, [selectedCategory, searchQuery, favorites]);

  // Audio recitation playback
  const handleToggleAudio = (dua: DuaItem) => {
    if (activeAudioDuaId === dua.id) {
      audioService.stopSpeaking();
      setActiveAudioDuaId(null);
    } else {
      setActiveAudioDuaId(dua.id);
      audioService.speakText(
        dua.arabic,
        'ar',
        playbackSpeed,
        () => setActiveAudioDuaId(dua.id),
        () => setActiveAudioDuaId(null),
        () => setActiveAudioDuaId(null)
      );
    }
  };

  const handleCopyDua = (dua: DuaItem) => {
    const text = `${dua.title}\n\n${dua.arabic}\n\n${dua.transliteration}\n\n"${dua.translation}"\n\n[Reference: ${dua.source}]`;
    navigator.clipboard.writeText(text);
    setCopiedDuaId(dua.id);
    setTimeout(() => setCopiedDuaId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-24 max-w-3xl mx-auto px-4 sm:px-6 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 font-display">
            Authentic Duas
          </h1>
          <p className="text-xs text-amber-300/80">
            Categorized supplications with Arabic, translation & audio recitation
          </p>
        </div>

        {/* Playback speed selector */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
          <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">Audio Speed:</span>
          {[0.75, 0.85, 1.0].map((rate) => (
            <button
              key={rate}
              onClick={() => setPlaybackSpeed(rate)}
              className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                playbackSpeed === rate
                  ? 'bg-amber-400 text-slate-950'
                  : 'text-slate-300 hover:text-amber-300'
              }`}
            >
              {rate === 0.85 ? 'Normal' : `${rate}x`}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by keyword, meaning, Arabic, or Hadith reference..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#09132E] border border-amber-500/20 hover:border-amber-500/40 text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-amber-400 shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
              : 'bg-slate-900/90 text-slate-300 hover:text-amber-300 border border-slate-800'
          }`}
        >
          All Duas ({DUAS_DATA.length})
        </button>

        <button
          onClick={() => setSelectedCategory('favorites')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === 'favorites'
              ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
              : 'bg-slate-900/90 text-slate-300 hover:text-amber-300 border border-slate-800'
          }`}
        >
          <BookmarkCheck className="w-3.5 h-3.5" />
          <span>Saved ({favorites.length})</span>
        </button>

        {DUA_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'bg-slate-900/90 text-slate-300 hover:text-amber-300 border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Duas List */}
      <div className="space-y-4">
        {filteredDuas.length === 0 ? (
          <div className="rounded-2xl bg-[#09132E] border border-slate-800 p-8 text-center space-y-2">
            <BookOpen className="w-8 h-8 text-amber-400/60 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-200">
              No matching Duas found
            </h3>
            <p className="text-xs text-slate-400">
              Try searching with another keyword or selecting "All Duas".
            </p>
          </div>
        ) : (
          filteredDuas.map((dua) => {
            const isPlaying = activeAudioDuaId === dua.id;
            const isFav = favorites.includes(dua.id);
            const isCopied = copiedDuaId === dua.id;

            return (
              <div
                key={dua.id}
                className="rounded-2xl bg-gradient-to-br from-[#0B1638] via-[#08122C] to-[#060D1E] border border-amber-500/20 hover:border-amber-500/40 p-5 shadow-xl transition-all space-y-4"
              >
                {/* Title & Action Buttons */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-100 font-display">
                      {dua.title}
                    </h3>
                    {dua.whenToRecite && (
                      <p className="text-[11px] text-amber-400/80 font-medium mt-0.5">
                        {dua.whenToRecite}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Audio Recite button */}
                    <button
                      onClick={() => handleToggleAudio(dua)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isPlaying
                          ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md animate-pulse'
                          : 'bg-slate-900/90 border-amber-500/30 text-amber-300 hover:bg-amber-500/10'
                      }`}
                      title={isPlaying ? 'Stop Recitation' : 'Play Arabic Recitation'}
                    >
                      {isPlaying ? (
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

                    {/* Bookmark */}
                    <button
                      onClick={() => toggleFavorite(dua.id)}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                        isFav
                          ? 'bg-amber-400/15 border-amber-500/40 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-300'
                      }`}
                      title={isFav ? 'Remove from Saved' : 'Save Dua'}
                    >
                      {isFav ? (
                        <BookmarkCheck className="w-4 h-4" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>

                    {/* Copy */}
                    <button
                      onClick={() => handleCopyDua(dua)}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                      title="Copy Dua"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Arabic Calligraphy */}
                <div className="bg-[#050A17]/70 rounded-2xl p-4 border border-amber-500/15 text-right">
                  <p className="font-arabic text-xl sm:text-2xl text-amber-200 leading-loose tracking-wide select-all">
                    {dua.arabic}
                  </p>
                </div>

                {/* Transliteration */}
                <div className="text-xs text-amber-300/85 font-mono italic">
                  {dua.transliteration}
                </div>

                {/* English Translation */}
                <div className="text-sm text-slate-200 leading-relaxed">
                  "{dua.translation}"
                </div>

                {/* Virtue & Source Attribution Footer */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
                  <span className="font-semibold text-amber-400/90">
                    Source: {dua.source}
                  </span>
                  {dua.virtue && (
                    <span className="text-slate-400 italic flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                      {dua.virtue}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
