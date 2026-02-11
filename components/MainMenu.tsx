"use client";

import React from "react";
import { getAssetPath } from "@/utils/paths";

interface MainMenuProps {
  onPlay: () => void;
  onShop: () => void;
}

export default function MainMenu({ onPlay, onShop }: MainMenuProps) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-between p-8 overflow-hidden select-none">
      {/* Background Image */}
      <img
        src={getAssetPath("/assets/theme/background.png")}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover -z-20"
      />
      {/* Fallback Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200 -z-30"></div>

      {/* Header / Logo (Now part of Background) */}
      <div className="z-10 mt-16 w-full max-w-[90%] text-center animate-fade-in-down h-24">
        {/* Title removed as per user request (in background) */}
      </div>

      {/* Main Character Area (Spacer) 
          Use transparent spacer to let background character show through.
      */}
      <div className="relative z-10 flex-1 w-full flex items-center justify-center pointer-events-none">
        {/* Character is likely in the background png now */}
      </div>

      {/* Action Buttons (Refined Jelly Style) */}
      <div className="z-10 w-full max-w-sm flex flex-row justify-center gap-5 mb-16 animate-fade-in-up px-6">
        {/* Play Button */}
        <button
          onClick={onPlay}
          className="flex-1 h-14 relative jelly-active-click group"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-300 to-cyan-500 rounded-2xl border border-white/50 jelly-depth-gray shadow-[0_6px_0_#0891b2]">
            <div className="jelly-gloss-layer opacity-60" />
            {/* Specular highlights */}
            <div className="absolute top-1.5 right-3 w-1.5 h-1.5 bg-white/40 rounded-full" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center gap-2 pointer-events-none">
            <span className="text-xl filter brightness-110 drop-shadow-sm">
              ❄️
            </span>
            <span className="text-lg font-black text-white drop-shadow-md tracking-tight">
              PLAY
            </span>
          </div>
        </button>

        {/* Shop Button */}
        <button
          onClick={onShop}
          className="flex-1 h-14 relative jelly-active-click group"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-purple-400 to-purple-500 rounded-2xl border border-white/50 jelly-depth-gray shadow-[0_6px_0_#9333ea]">
            <div className="jelly-gloss-layer opacity-60" />
            {/* Specular highlights */}
            <div className="absolute top-1.5 right-3 w-1.5 h-1.5 bg-white/40 rounded-full" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center gap-2 pointer-events-none">
            <span className="text-xl filter brightness-110 drop-shadow-sm">
              💎
            </span>
            <span className="text-lg font-black text-white drop-shadow-md tracking-tight">
              SHOP
            </span>
          </div>
        </button>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-fade-in-down {
          animation: fadeInDown 1s ease-out;
        }
        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out;
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
