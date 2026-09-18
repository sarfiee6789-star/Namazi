// Web Audio API Synthesizer and Web Speech API service for authentic feedback

class AudioService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Device vibration feedback
   */
  public vibrate(pattern: number | number[] = 25) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Safe fail on unsupported environments
      }
    }
  }

  /**
   * Tactile Tasbih bead tap sound
   */
  public playTasbihClick() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Noise click transient
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.04);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(3, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // ignore
    }
  }

  /**
   * Milestone sound when Tasbih target is completed (33, 99, 100, etc.)
   */
  public playMilestoneSound() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Multi-harmonic singing bell / chime
      const frequencies = [587.33, 880.0, 1174.66, 1760.0]; // D5, A5, D6, A6

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const volume = 0.15 / (idx + 1);
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + 1.5);
      });
    } catch {
      // ignore
    }
  }

  /**
   * Qibla compass alignment chime when pointing directly at Kaaba
   */
  public playQiblaAlignedChime() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (harmonic golden chord)
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);

        gain.gain.setValueAtTime(0, now + i * 0.06);
        gain.gain.linearRampToValueAtTime(0.12, now + i * 0.06 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.85);
      });
    } catch {
      // ignore
    }
  }

  /**
   * Melodic Azan preview synthesized in Maqam Bayati / Hijaz modal scale
   */
  public playAzanPreview(style: 'makkah' | 'madinah' | 'alaqsa' | 'serene' = 'makkah', onEnd?: () => void) {
    if (this.isMuted) {
      if (onEnd) onEnd();
      return;
    }
    const ctx = this.getContext();
    if (!ctx) {
      if (onEnd) onEnd();
      return;
    }

    try {
      const now = ctx.currentTime;
      // Authentic melodic phrases representing "Allahu Akbar, Allahu Akbar"
      // Frequencies in Hz corresponding to traditional Islamic modal melodic intervals
      let melody: Array<{ freq: number; duration: number; delay: number }> = [];

      if (style === 'makkah') {
        // Robust resonant traditional Makkah pitch contour
        melody = [
          { freq: 293.66, duration: 0.8, delay: 0.0 },  // D4
          { freq: 329.63, duration: 0.6, delay: 0.7 },  // E4
          { freq: 349.23, duration: 1.1, delay: 1.2 },  // F4 (Al-laaahu)
          { freq: 392.00, duration: 0.8, delay: 2.2 },  // G4
          { freq: 349.23, duration: 1.4, delay: 2.9 },  // F4 (Akbar)
          { freq: 293.66, duration: 0.8, delay: 4.4 },  // D4
          { freq: 349.23, duration: 1.2, delay: 5.1 },  // F4 (Al-laahu)
          { freq: 392.00, duration: 1.6, delay: 6.2 },  // G4 (Akbaaaar)
          { freq: 293.66, duration: 1.8, delay: 7.7 },  // D4
        ];
      } else if (style === 'madinah') {
        // Melodious gentle Madinah style with warm vibrato
        melody = [
          { freq: 349.23, duration: 0.9, delay: 0.0 },
          { freq: 392.00, duration: 0.8, delay: 0.8 },
          { freq: 440.00, duration: 1.3, delay: 1.5 },
          { freq: 392.00, duration: 1.0, delay: 2.7 },
          { freq: 349.23, duration: 1.5, delay: 3.6 },
          { freq: 440.00, duration: 1.2, delay: 5.0 },
          { freq: 523.25, duration: 1.8, delay: 6.1 },
          { freq: 349.23, duration: 1.8, delay: 7.8 },
        ];
      } else if (style === 'alaqsa') {
        // Emotional resonant Jerusalem style
        melody = [
          { freq: 261.63, duration: 0.9, delay: 0.0 },
          { freq: 311.13, duration: 0.8, delay: 0.8 },
          { freq: 349.23, duration: 1.3, delay: 1.5 },
          { freq: 392.00, duration: 1.1, delay: 2.7 },
          { freq: 311.13, duration: 1.4, delay: 3.7 },
          { freq: 261.63, duration: 1.8, delay: 5.0 },
        ];
      } else {
        // Minimalist serene chime tone
        melody = [
          { freq: 440.00, duration: 1.2, delay: 0.0 },
          { freq: 554.37, duration: 1.2, delay: 1.0 },
          { freq: 659.25, duration: 1.6, delay: 2.0 },
          { freq: 880.00, duration: 2.2, delay: 3.2 },
        ];
      }

      melody.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Warm organ/reed characteristic: gentle sine with subharmonic
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.freq, now + note.delay);

        // Soft attack and smooth vocal-like decay
        gain.gain.setValueAtTime(0.001, now + note.delay);
        gain.gain.linearRampToValueAtTime(0.2, now + note.delay + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + note.delay + note.duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + note.delay);
        osc.stop(now + note.delay + note.duration + 0.1);
      });

      const totalDuration =
        melody[melody.length - 1].delay + melody[melody.length - 1].duration + 0.2;
      setTimeout(() => {
        if (onEnd) onEnd();
      }, totalDuration * 1000);
    } catch {
      if (onEnd) onEnd();
    }
  }

  /**
   * Text-to-Speech recitation for Duas and Quranic Verses
   */
  public speakText(
    text: string,
    lang: 'ar' | 'en' = 'ar',
    rate: number = 0.9,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: () => void
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onError) onError();
      return;
    }

    window.speechSynthesis.cancel(); // stop previous speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1.0;

    if (lang === 'ar') {
      utterance.lang = 'ar-SA';
      // Find Arabic voice if available
      const voices = window.speechSynthesis.getVoices();
      const arabicVoice = voices.find(
        (v) => v.lang.startsWith('ar') || v.name.toLowerCase().includes('arabic')
      );
      if (arabicVoice) {
        utterance.voice = arabicVoice;
      }
    } else {
      utterance.lang = 'en-US';
    }

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    if (onError) utterance.onerror = onError;

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audioService = new AudioService();
