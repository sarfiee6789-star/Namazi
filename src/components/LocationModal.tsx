import React, { useState } from 'react';
import { MapPin, Navigation, Search, X, Check, Globe } from 'lucide-react';
import { LocationCoordinates } from '../types';
import { PRESET_CITIES } from '../utils/prayerCalc';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: LocationCoordinates;
  onSelectLocation: (loc: LocationCoordinates) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredCities = PRESET_CITIES.filter((c) =>
    `${c.city} ${c.country}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGetCurrentLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        const newLoc: LocationCoordinates = {
          city: 'My Location',
          country: 'GPS Position',
          latitude,
          longitude,
          timezoneOffset: -new Date().getTimezoneOffset() / 60,
        };
        onSelectLocation(newLoc);
        onClose();
      },
      (err) => {
        setIsLocating(false);
        setErrorMessage(
          err.message || 'Unable to access your location. Please select a city below.'
        );
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#09132E] border border-amber-500/30 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-display">
                Select Location
              </h2>
              <p className="text-[11px] text-slate-400">
                Calculates precise prayer times & Qibla direction
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* GPS Auto-Detect Button */}
        <button
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
        >
          <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
          <span>
            {isLocating ? 'Detecting GPS Coordinates...' : 'Use My Current GPS Location'}
          </span>
        </button>

        {errorMessage && (
          <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/60 p-2.5 rounded-xl">
            {errorMessage}
          </p>
        )}

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search worldwide cities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Cities List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-[220px]">
          {filteredCities.map((city) => {
            const isSelected =
              currentLocation.city.toLowerCase() === city.city.toLowerCase();

            return (
              <button
                key={city.city}
                onClick={() => {
                  onSelectLocation(city);
                  onClose();
                }}
                className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-amber-400/15 border-amber-400/60 text-amber-200'
                    : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-amber-500/30 hover:bg-slate-900'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold text-slate-200">
                    {city.city}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {city.country} • {city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°
                  </div>
                </div>

                {isSelected && <Check className="w-4 h-4 text-amber-400" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
