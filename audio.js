// Chiptune Audio Manager — all sounds generated via Web Audio API, no files needed

class AudioManager {
  constructor() {
    this._ctx = null;
    this._masterGain = null;
    this._musicNodes = [];
    this._musicTimeout = null;
    this._currentZone = -1;
    this.musicVol = 0.18;
    this.sfxVol = 0.35;
  }

  // Lazily create AudioContext (must be after a user gesture on Chrome)
  _getCtx() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._masterGain = this._ctx.createGain();
      this._masterGain.gain.value = 1;
      this._masterGain.connect(this._ctx.destination);
    }
    if (this._ctx.state === 'suspended') this._ctx.resume();
    return this._ctx;
  }

  // ── Low-level helpers ────────────────────────────────────────────

  _note(freq, startTime, duration, type = 'square', vol = 0.3, dest = null) {
    const ctx = this._getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.setValueAtTime(vol * 0.9, startTime + duration * 0.75);
    gain.gain.linearRampToValueAtTime(0.0001, startTime + duration);
    osc.connect(gain);
    gain.connect(dest || this._masterGain);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
    return osc;
  }

  _sweep(freqStart, freqEnd, startTime, duration, type = 'square', vol = 0.3) {
    const ctx = this._getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, startTime);
    osc.frequency.exponentialRampToValueAtTime(freqEnd, startTime + duration);
    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.linearRampToValueAtTime(0.0001, startTime + duration);
    osc.connect(gain);
    gain.connect(this._masterGain);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
  }

  // ── SFX ─────────────────────────────────────────────────────────

  playSFX(name) {
    try {
      const ctx = this._getCtx();
      const t = ctx.currentTime;
      switch (name) {
        case 'jump':      this._sfxJump(t);      break;
        case 'slide':     this._sfxSlide(t);     break;
        case 'coin':      this._sfxCoin(t);      break;
        case 'hit':       this._sfxHit(t);       break;
        case 'boss_start':this._sfxBossStart(t); break;
        case 'boss_win':  this._sfxBossWin(t);   break;
      }
    } catch (e) { /* AudioContext not available */ }
  }

  _sfxJump(t) {
    const ctx = this._getCtx();

    // Layer 1 — main upward sweep: the satisfying "boing" rise
    const osc1 = ctx.createOscillator();
    const g1   = ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(200, t);
    osc1.frequency.exponentialRampToValueAtTime(740, t + 0.20);
    g1.gain.setValueAtTime(0.001, t);
    g1.gain.linearRampToValueAtTime(this.sfxVol * 1.1, t + 0.012);
    g1.gain.setValueAtTime(this.sfxVol * 0.85, t + 0.06);
    g1.gain.linearRampToValueAtTime(0.0001, t + 0.22);
    osc1.connect(g1); g1.connect(this._masterGain);
    osc1.start(t); osc1.stop(t + 0.24);

    // Layer 2 — low thump at launch: adds weight and "oomph"
    const osc2 = ctx.createOscillator();
    const g2   = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(190, t);
    osc2.frequency.exponentialRampToValueAtTime(70, t + 0.09);
    g2.gain.setValueAtTime(this.sfxVol * 0.75, t);
    g2.gain.linearRampToValueAtTime(0.0001, t + 0.10);
    osc2.connect(g2); g2.connect(this._masterGain);
    osc2.start(t); osc2.stop(t + 0.12);

    // Layer 3 — bright shimmer that trails in: adds sparkle
    const osc3 = ctx.createOscillator();
    const g3   = ctx.createGain();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(680, t + 0.04);
    osc3.frequency.exponentialRampToValueAtTime(1480, t + 0.20);
    g3.gain.setValueAtTime(0.0001, t + 0.03);
    g3.gain.linearRampToValueAtTime(this.sfxVol * 0.28, t + 0.07);
    g3.gain.linearRampToValueAtTime(0.0001, t + 0.22);
    osc3.connect(g3); g3.connect(this._masterGain);
    osc3.start(t + 0.03); osc3.stop(t + 0.24);
  }

  _sfxSlide(t) {
    const ctx = this._getCtx();

    // Layer 1 — main descending sweep: the "going low" pitch drop
    const osc1 = ctx.createOscillator();
    const g1   = ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(420, t);
    osc1.frequency.exponentialRampToValueAtTime(105, t + 0.22);
    g1.gain.setValueAtTime(0.001, t);
    g1.gain.linearRampToValueAtTime(this.sfxVol * 1.0, t + 0.012);
    g1.gain.setValueAtTime(this.sfxVol * 0.8, t + 0.05);
    g1.gain.linearRampToValueAtTime(0.0001, t + 0.25);
    osc1.connect(g1); g1.connect(this._masterGain);
    osc1.start(t); osc1.stop(t + 0.27);

    // Layer 2 — scrape / friction: gritty sawtooth for ground contact
    const osc2 = ctx.createOscillator();
    const g2   = ctx.createGain();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(160, t + 0.03);
    osc2.frequency.exponentialRampToValueAtTime(55, t + 0.22);
    g2.gain.setValueAtTime(0.0001, t + 0.02);
    g2.gain.linearRampToValueAtTime(this.sfxVol * 0.38, t + 0.06);
    g2.gain.linearRampToValueAtTime(0.0001, t + 0.24);
    osc2.connect(g2); g2.connect(this._masterGain);
    osc2.start(t + 0.02); osc2.stop(t + 0.26);

    // Layer 3 — air whoosh: quick high-to-low sweep as you duck under
    const osc3 = ctx.createOscillator();
    const g3   = ctx.createGain();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(1100, t);
    osc3.frequency.exponentialRampToValueAtTime(220, t + 0.10);
    g3.gain.setValueAtTime(this.sfxVol * 0.42, t);
    g3.gain.linearRampToValueAtTime(0.0001, t + 0.11);
    osc3.connect(g3); g3.connect(this._masterGain);
    osc3.start(t); osc3.stop(t + 0.13);
  }

  _sfxCoin(t) {
    const ctx = this._getCtx();

    // Layer 1 — ascending C-major arpeggio: cheerful "collecting" rise
    [1047, 1319, 1568].forEach((freq, i) => {
      this._note(freq, t + i * 0.062, 0.09, 'square', this.sfxVol * 0.78);
    });

    // Layer 2 — bell shimmer: long bright ring-out tail
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2093, t); // C7 — high sparkle
    g.gain.setValueAtTime(this.sfxVol * 0.55, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    osc.connect(g); g.connect(this._masterGain);
    osc.start(t); osc.stop(t + 0.47);

    // Layer 3 — low body note: gives the coin physical weight
    this._note(523, t, 0.05, 'triangle', this.sfxVol * 0.42);
  }

  _sfxHit(t) {
    // Harsh descending crash
    this._sweep(350, 40, t, 0.5, 'sawtooth', this.sfxVol * 1.1);
    // Add a noise-ish layer via fast vibrato
    const ctx = this._getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.35);
    gain.gain.setValueAtTime(this.sfxVol * 0.6, t);
    gain.gain.linearRampToValueAtTime(0.0001, t + 0.35);
    osc.connect(gain);
    gain.connect(this._masterGain);
    osc.start(t);
    osc.stop(t + 0.4);
  }

  _sfxBossStart(t) {
    // Three rising dramatic hits
    [0, 0.18, 0.36].forEach((delay, i) => {
      this._note([196, 294, 392][i], t + delay, 0.16, 'sawtooth', this.sfxVol * 1.1);
    });
    this._sweep(392, 196, t + 0.54, 0.3, 'sawtooth', this.sfxVol);
  }

  _sfxBossWin(t) {
    // Ascending victory jingle
    const melody = [523, 659, 784, 1047, 1318];
    melody.forEach((freq, i) => {
      this._note(freq, t + i * 0.1, 0.12, 'square', this.sfxVol * 0.9);
    });
    this._note(1047, t + 0.55, 0.25, 'square', this.sfxVol);
  }

  // ── Background Music ────────────────────────────────────────────

  // Each note: [frequency_hz, duration_beats]  (0 = rest)
  // Tempos are in seconds-per-beat

  // Zone 1 — Asteroid Belt: bright, bouncy C-major adventure
  _zone1Notes() {
    return {
      tempo: 0.13,
      melody: [
        [523,1],[659,1],[784,1],[523,1],
        [659,1],[784,1],[880,1],[784,1],
        [659,1],[523,1],[587,1],[659,1],
        [523,2],[0,2],
        [784,1],[880,1],[1047,1],[784,1],
        [659,1],[523,1],[659,1],[784,1],
        [523,1],[659,1],[784,1],[659,1],
        [523,2],[0,2],
      ],
      bass: [
        [131,2],[165,2],[196,2],[131,2],
        [131,2],[165,2],[196,2],[131,2],
        [131,2],[165,2],[196,2],[131,2],
        [131,2],[0,2],
        [131,2],[165,2],[196,2],[131,2],
        [131,2],[165,2],[196,2],[131,2],
        [131,2],[165,2],[196,2],[131,2],
        [131,2],[0,2],
      ],
    };
  }

  // Zone 2 — Alien Planet: mysterious A-minor with eerie feel
  _zone2Notes() {
    return {
      tempo: 0.14,
      melody: [
        [440,1],[523,1],[659,1],[440,1],
        [415,1],[494,1],[659,1],[415,1],
        [440,1],[659,1],[880,1],[784,1],
        [659,2],[0,2],
        [523,1],[659,1],[784,1],[523,1],
        [494,1],[587,1],[740,1],[494,1],
        [440,1],[523,1],[659,1],[523,1],
        [440,2],[0,2],
      ],
      bass: [
        [110,2],[131,2],[165,2],[110,2],
        [110,2],[124,2],[165,2],[110,2],
        [110,2],[131,2],[165,2],[110,2],
        [110,2],[0,2],
        [131,2],[165,2],[196,2],[131,2],
        [124,2],[147,2],[185,2],[124,2],
        [110,2],[131,2],[165,2],[131,2],
        [110,2],[0,2],
      ],
    };
  }

  // Zone 3 — Black Hole: dark, faster, E-minor intensity
  _zone3Notes() {
    return {
      tempo: 0.10,
      melody: [
        [659,1],[784,1],[659,1],[587,1],
        [523,1],[659,1],[523,1],[494,1],
        [440,1],[523,1],[659,1],[784,1],
        [659,2],[0,2],
        [330,0.5],[440,0.5],[330,0.5],[294,0.5],
        [330,1],[262,1],[220,1],[196,1],
        [220,0.5],[330,0.5],[440,0.5],[330,0.5],
        [220,2],[0,2],
      ],
      bass: [
        [165,1],[165,1],[165,1],[165,1],
        [131,1],[131,1],[131,1],[131,1],
        [110,1],[110,1],[131,1],[165,1],
        [165,2],[0,2],
        [82,1],[82,1],[82,1],[82,1],
        [110,1],[110,1],[110,1],[110,1],
        [82,1],[82,1],[110,1],[131,1],
        [110,2],[0,2],
      ],
    };
  }

  _scheduleTrack(notes, tempo, vol, type, dest) {
    const ctx = this._getCtx();
    let time = ctx.currentTime + 0.05;
    notes.forEach(([freq, beats]) => {
      if (freq > 0) {
        const dur = beats * tempo * 0.88; // slight gap between notes
        this._note(freq, time, dur, type, vol, dest);
      }
      time += beats * tempo;
    });
    return time;
  }

  playMusic(zoneIndex) {
    if (this._currentZone === zoneIndex) return;
    this._currentZone = zoneIndex;
    this.stopMusic();
    this._loopMusic(zoneIndex);
  }

  _loopMusic(zoneIndex) {
    try {
      const ctx = this._getCtx();
      const track = [this._zone1Notes(), this._zone2Notes(), this._zone3Notes()][zoneIndex % 3];

      // Melody channel — square wave
      const melodyEnd = this._scheduleTrack(track.melody, track.tempo, this.musicVol, 'square', this._masterGain);

      // Bass channel — triangle wave, quieter
      const bassGain = ctx.createGain();
      bassGain.gain.value = 0.6;
      bassGain.connect(this._masterGain);
      this._scheduleTrack(track.bass, track.tempo, this.musicVol * 0.7, 'triangle', bassGain);

      const loopMs = (melodyEnd - ctx.currentTime) * 1000 - 50;
      this._musicTimeout = setTimeout(() => {
        if (this._currentZone === zoneIndex) this._loopMusic(zoneIndex);
      }, Math.max(loopMs, 100));
    } catch (e) { /* silently skip */ }
  }

  stopMusic() {
    this._currentZone = -1;
    if (this._musicTimeout) { clearTimeout(this._musicTimeout); this._musicTimeout = null; }
  }

  // Resume AudioContext after user gesture (required by browsers)
  resume() {
    try { this._getCtx(); } catch (e) {}
  }
}

// Export singleton
export const audio = new AudioManager();
