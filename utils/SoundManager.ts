"use client";

class SoundManager {
  private static instance: SoundManager;
  private bgm: HTMLAudioElement | null = null;
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private isMuted: boolean = false;
  private initialized: boolean = false;

  private constructor() {}

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  init() {
    if (this.initialized || typeof window === "undefined") return;

    // this.bgm = new Audio("/audio/bgm.mp3");
    // this.bgm.loop = true;
    // this.bgm.volume = 0.3;

    // const soundEffects = ["click", "success", "fail", "pop"];
    // soundEffects.forEach((name) => {
    // Temporary: Audio files are missing, so we won't load them to prevent 404 errors.
    // const audio = new Audio(`/audio/${name}.mp3`);
    // audio.preload = "auto";
    // this.sounds.set(name, audio);
    // });

    this.initialized = true;
  }

  playBGM() {
    if (!this.initialized) this.init();
    if (this.bgm && !this.isMuted) {
      this.bgm.play().catch((e) => console.log("BGM play failed:", e));
    }
  }

  stopBGM() {
    if (this.bgm) {
      this.bgm.pause();
      this.bgm.currentTime = 0;
    }
  }

  playSound(name: string) {
    if (!this.initialized) this.init();
    if (this.isMuted) return;

    const audio = this.sounds.get(name);
    if (audio) {
      const clone = audio.cloneNode() as HTMLAudioElement;
      clone.volume = 0.5;
      clone.play().catch((e) => console.log(`Sound ${name} play failed:`, e));
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.bgm?.pause();
    } else {
      this.bgm?.play();
    }
    return this.isMuted;
  }
}

export const soundManager = SoundManager.getInstance();
