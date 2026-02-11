"use client";

import { getAssetPath } from "./paths";

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

  private soundsPool: Map<string, HTMLAudioElement[]> = new Map();
  private poolIndex: Map<string, number> = new Map();

  init() {
    if (this.initialized || typeof window === "undefined") return;

    const soundEffects = ["click", "success", "fail", "pop"];
    const POOL_SIZE = 3; // Number of concurrent instances per sound

    soundEffects.forEach((name) => {
      const pool: HTMLAudioElement[] = [];
      for (let i = 0; i < POOL_SIZE; i++) {
        const audio = new Audio(getAssetPath(`/sound/${name}.ogg`));
        audio.preload = "auto";
        pool.push(audio);
      }
      this.soundsPool.set(name, pool);
      this.poolIndex.set(name, 0);
    });

    this.initialized = true;
  }

  // ... (BGM methods) ...
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

  playSound(name: string, volume: number = 0.7) {
    if (!this.initialized) this.init();
    if (this.isMuted) return;

    const pool = this.soundsPool.get(name);
    const index = this.poolIndex.get(name) ?? 0;

    if (pool && pool.length > 0) {
      const audio = pool[index];

      // Reset and play
      audio.pause();
      audio.currentTime = 0;
      audio.volume = volume;

      audio.play().catch((e) => {
        // Fallback for some browsers that require explicit load
        if (e.name === "NotSupportedError") {
          audio.load();
          audio
            .play()
            .catch((err) => console.log(`Sound ${name} retry failed:`, err));
        }
        console.log(`Sound ${name} play failed:`, e);
      });

      // Advance pool index
      this.poolIndex.set(name, (index + 1) % pool.length);
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
