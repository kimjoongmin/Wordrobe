"use client";

import React, { useState, useEffect } from "react";
import { getAssetPath } from "@/utils/paths";

interface SplashScreenProps {
  onStart: () => void;
}

export default function SplashScreen({ onStart }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const duration = 2500; // 2.5 seconds
    const interval = 50;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newProgress = Math.min((currentStep / steps) * 100, 100);
      setProgress(newProgress);

      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(onStart, 500); // Small delay after 100% before transition
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onStart]);

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Background Image */}
      <img
        src={getAssetPath("/assets/theme/background.png")}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover -z-20"
      />

      {/* Fallback Background (in case image missing) */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200 -z-30"></div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md z-10 relative mt-10">
        {/* Logo (CSS Based) */}
        {/* Logo (Now part of Background) */}
        <div className="mb-8 w-full text-center animate-bounce-slow h-24">
          {/* Title removed as per user request (in background) */}
        </div>

        {/* Character Area - Spacer (Assume in BG) */}
        <div className="relative mb-12 flex justify-center h-64 sm:h-80 w-full pointer-events-none">
          {/* Spacer for character if in BG */}
        </div>

        {/* Loading Bar Container */}
        <div className="w-full max-w-xs h-8 relative">
          {/* If user provides a custom loading bar frame image */}
          {/* <img src="/assets/theme/loading_bar_frame.png" className="absolute inset-0 w-full h-full" /> */}

          <div className="w-full h-full bg-black/20 rounded-full p-1 backdrop-blur-sm border border-white/50 shadow-inner overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 rounded-full shadow-[0_0_15px_rgba(100,200,255,0.6)] transition-all duration-100 ease-linear relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
            </div>
          </div>
        </div>
        <p className="text-white font-bold mt-2 text-sm tracking-widest uppercase drop-shadow-md">
          Loading... {Math.round(progress)}%
        </p>
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(-5%);
          }
          50% {
            transform: translateY(0);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite ease-in-out;
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite linear;
        }
      `}</style>
    </div>
  );
}
