import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Compass,
  Navigation,
  Info,
  Sliders,
  CheckCircle2,
  RefreshCw,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { LocationCoordinates } from '../types';
import {
  calculateDistanceToMecca,
  calculateQiblaBearing,
} from '../utils/prayerCalc';
import { audioService } from '../utils/audioService';

interface QiblaViewProps {
  currentLocation: LocationCoordinates;
  onOpenLocationModal: () => void;
}

export const QiblaView: React.FC<QiblaViewProps> = ({
  currentLocation,
  onOpenLocationModal,
}) => {
  // Calculated constants based on coordinates
  const qiblaBearing = calculateQiblaBearing(
    currentLocation.latitude,
    currentLocation.longitude
  );
  const distanceKm = calculateDistanceToMecca(
    currentLocation.latitude,
    currentLocation.longitude
  );
  const distanceMiles = Math.round(distanceKm * 0.621371);

  // Compass state
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [hasSensor, setHasSensor] = useState<boolean>(false);
  const [sensorPermissionNeeded, setSensorPermissionNeeded] = useState<boolean>(false);
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const [aligned, setAligned] = useState<boolean>(false);
  const lastChimeTime = useRef<number>(0);

  // Check alignment
  const diffAngle = Math.abs(((deviceHeading - qiblaBearing + 180) % 360) - 180);
  const isCurrentlyAligned = diffAngle <= 3;

  // Handle alignment audio/vibration feedback
  useEffect(() => {
    if (isCurrentlyAligned && !aligned) {
      setAligned(true);
      const now = Date.now();
      if (now - lastChimeTime.current > 3000) {
        lastChimeTime.current = now;
        audioService.playQiblaAlignedChime();
        audioService.vibrate([40, 80, 40]);
      }
    } else if (!isCurrentlyAligned && aligned) {
      setAligned(false);
    }
  }, [isCurrentlyAligned, aligned]);

  // Orientation event handler
  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    let heading: number | null = null;

    // iOS webkitCompassHeading
    if ('webkitCompassHeading' in event && typeof (event as any).webkitCompassHeading === 'number') {
      heading = (event as any).webkitCompassHeading;
    } else if (event.alpha !== null) {
      // Android / standard (alpha = 0 is North if absolute)
      heading = 360 - event.alpha;
    }

    if (heading !== null && !isNaN(heading)) {
      setHasSensor(true);
      if (!isManualMode) {
        setDeviceHeading(Math.round((heading + 360) % 360));
      }
    }
  }, [isManualMode]);

  // Request permission for iOS 13+ devices
  const requestIOSPermission = async () => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setSensorPermissionNeeded(false);
          window.addEventListener('deviceorientation', handleOrientation, true);
        } else {
          setIsManualMode(true);
        }
      } catch {
        setIsManualMode(true);
      }
    } else {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
  };

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      setSensorPermissionNeeded(true);
    } else if (typeof window !== 'undefined') {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, [handleOrientation]);

  // Turn to face Kaaba helper
  const turnDirection = () => {
    const rawDiff = (qiblaBearing - deviceHeading + 360) % 360;
    if (isCurrentlyAligned) return 'Aligned with Kaaba!';
    if (rawDiff > 0 && rawDiff <= 180) {
      return `Turn right ${Math.round(rawDiff)}°`;
    } else {
      return `Turn left ${Math.round(360 - rawDiff)}°`;
    }
  };

  // Dial rotation: rotate the compass rose opposite to the heading
  const compassRoseRotation = -deviceHeading;

  return (
    <div className="space-y-6 pb-24 max-w-xl mx-auto px-4 sm:px-6 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 font-display">
            Qibla Direction
          </h1>
          <p className="text-xs text-amber-300/80">
            Real-time smart compass aligned with the Kaaba
          </p>
        </div>

        <button
          onClick={() => setIsManualMode(!isManualMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
            isManualMode
              ? 'bg-amber-400 text-slate-950 border-amber-300 shadow'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-500/30'
          }`}
          title="Toggle Manual/Simulator mode"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{isManualMode ? 'Manual' : 'Sensor'}</span>
        </button>
      </div>

      {/* Permission request alert for iOS if needed */}
      {sensorPermissionNeeded && !hasSensor && (
        <div className="bg-amber-500/15 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div className="text-xs text-amber-200">
            Enable device orientation sensor to calibrate live compass.
          </div>
          <button
            onClick={requestIOSPermission}
            className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 text-xs font-bold shadow hover:brightness-110"
          >
            Enable Sensor
          </button>
        </div>
      )}

      {/* Alignment Status Banner */}
      <div
        className={`rounded-2xl p-4 border transition-all duration-300 flex items-center justify-between shadow-xl ${
          isCurrentlyAligned
            ? 'bg-gradient-to-r from-amber-500/20 via-amber-400/20 to-amber-500/10 border-amber-400 text-amber-200 shadow-amber-500/20 animate-pulse'
            : 'bg-[#09132E] border-slate-800 text-slate-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isCurrentlyAligned
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/40'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {isCurrentlyAligned ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Navigation
                className="w-5 h-5"
                style={{
                  transform: `rotate(${qiblaBearing - deviceHeading}deg)`,
                  transition: 'transform 0.3s ease-out',
                }}
              />
            )}
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight">
              {isCurrentlyAligned ? '✨ Facing the Holy Kaaba' : turnDirection()}
            </div>
            <div className="text-xs text-slate-400">
              Bearing: <span className="text-amber-300 font-semibold">{qiblaBearing}°</span> • Device: <span className="font-mono">{deviceHeading}°</span>
            </div>
          </div>
        </div>

        {isCurrentlyAligned && (
          <div className="px-2.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[11px] font-bold">
            Aligned
          </div>
        )}
      </div>

      {/* SMART COMPASS CANVAS / DIAL */}
      <div className="relative flex flex-col items-center justify-center py-6">
        {/* Ambient Halo Glow */}
        <div
          className={`absolute w-72 h-72 rounded-full blur-3xl pointer-events-none transition-opacity duration-500 ${
            isCurrentlyAligned ? 'bg-amber-400/25 opacity-100' : 'bg-blue-600/10 opacity-50'
          }`}
        />

        <div className="relative w-72 h-72 sm:w-84 sm:h-84 flex items-center justify-center">
          {/* Fixed Outer Bezel with degrees and heading indicator */}
          <div className="absolute inset-0 rounded-full border-2 border-amber-500/30 bg-[#070D1E]/90 shadow-2xl flex items-center justify-center">
            {/* Top Indicator Arrow (Current Device Heading) */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-amber-400" />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
            </div>
          </div>

          {/* Rotating Compass Disc */}
          <div
            className="absolute inset-4 rounded-full border border-slate-800 transition-transform duration-200 ease-out flex items-center justify-center"
            style={{
              transform: `rotate(${compassRoseRotation}deg)`,
            }}
          >
            {/* Cardinal Direction Markers */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 font-bold text-red-400 text-xs tracking-wider">
              N
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 font-bold text-slate-400 text-xs tracking-wider">
              S
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs tracking-wider">
              E
            </div>
            <div className="absolute left-2 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs tracking-wider">
              W
            </div>

            {/* Subtle Ticks on Disc */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <div
                key={deg}
                className="absolute w-full h-full pointer-events-none"
                style={{ transform: `rotate(${deg}deg)` }}
              >
                <div className="w-0.5 h-2 bg-slate-700 mx-auto" />
              </div>
            ))}

            {/* KAABA POINTER (Oriented at qiblaBearing on the rotating disc) */}
            <div
              className="absolute w-full h-full pointer-events-none"
              style={{ transform: `rotate(${qiblaBearing}deg)` }}
            >
              {/* Kaaba Golden Needle / Icon */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                {/* Kaaba Miniature Icon */}
                <div
                  className={`w-7 h-7 rounded-md border flex items-center justify-center shadow-lg transition-all duration-300 ${
                    isCurrentlyAligned
                      ? 'bg-amber-400 border-amber-200 text-slate-950 scale-125 shadow-[0_0_15px_#F59E0B]'
                      : 'bg-[#15234A] border-amber-400/80 text-amber-300'
                  }`}
                  title={`Qibla Bearing: ${qiblaBearing}°`}
                >
                  {/* Kaaba Cube Vector */}
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                {/* Pointer Line to Kaaba */}
                <div className="w-0.5 h-16 bg-gradient-to-b from-amber-400 to-transparent" />
              </div>
            </div>
          </div>

          {/* Center Hub */}
          <div className="relative z-20 w-16 h-16 rounded-full bg-gradient-to-br from-[#0F1E42] to-[#08122B] border-2 border-amber-500/40 shadow-xl flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase font-bold text-amber-400/80 leading-none">
              Mecca
            </span>
            <span className="text-xs font-mono font-bold text-slate-100">
              {qiblaBearing}°
            </span>
          </div>
        </div>

        {/* Manual Heading Simulator Slider (For desktop, testing, or sensorless environments) */}
        {isManualMode && (
          <div className="w-full max-w-sm mt-6 p-4 rounded-2xl bg-[#09132E] border border-amber-500/20 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                Heading Simulator (Drag to Turn)
              </span>
              <span className="font-mono text-amber-300 font-bold">
                {deviceHeading}°
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="359"
              value={deviceHeading}
              onChange={(e) => setDeviceHeading(parseInt(e.target.value, 10))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0° N</span>
              <span>90° E</span>
              <span>180° S</span>
              <span>270° W</span>
              <button
                onClick={() => setDeviceHeading(Math.round(qiblaBearing))}
                className="text-amber-400 hover:underline cursor-pointer"
              >
                Snap to Qibla ({qiblaBearing}°)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* LOCATION & DISTANCE INFO CARD */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0B1638] via-[#08112C] to-[#060D1E] border border-amber-500/20 p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <h3 className="text-xs font-bold text-slate-200">
                {currentLocation.city}, {currentLocation.country}
              </h3>
              <p className="text-[11px] text-slate-400">
                {currentLocation.latitude.toFixed(4)}° N, {currentLocation.longitude.toFixed(4)}° E
              </p>
            </div>
          </div>

          <button
            onClick={onOpenLocationModal}
            className="text-xs text-amber-300 hover:text-amber-200 underline font-medium cursor-pointer"
          >
            Change Location
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">
              Distance to Kaaba
            </span>
            <div className="text-base font-bold text-amber-300 mt-0.5">
              {distanceKm.toLocaleString()} km
            </div>
            <div className="text-[10px] text-slate-400">
              ~{distanceMiles.toLocaleString()} miles
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">
              Qibla Bearing
            </span>
            <div className="text-base font-bold text-amber-300 mt-0.5">
              {qiblaBearing}° North-East
            </div>
            <div className="text-[10px] text-slate-400">
              Clockwise from True North
            </div>
          </div>
        </div>

        {/* Calibration Tips */}
        <div className="text-[11px] text-slate-400/90 flex items-start gap-1.5 pt-1">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Hold your device flat horizontally. For optimal compass accuracy, calibrate by moving your phone in a figure-8 motion away from metal objects.
          </span>
        </div>
      </div>
    </div>
  );
};
