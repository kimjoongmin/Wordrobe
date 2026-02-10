"use client";

import React from "react";

interface MainMenuProps {
  onPlay: () => void;
  onShop: () => void;
}

export default function MainMenu({ onPlay, onShop }: MainMenuProps) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-between p-8 overflow-hidden select-none">
      {/* Background Image */}
      <img
        src="/assets/theme/background.png"
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
      <div className="z-10 w-full max-w-sm flex flex-row justify-center gap-4 mb-16 animate-fade-in-up px-6">
        {/* Play Button */}
        <button
          onClick={onPlay}
          className="flex-1 group relative active:scale-95 transition-all duration-150"
        >
          <div className="relative bg-gradient-to-b from-cyan-400 to-blue-600 rounded-2xl p-[3px] shadow-[0_5px_15px_rgba(6,182,212,0.4)] border border-white/20">
            <div className="bg-gradient-to-b from-cyan-300 to-blue-500 rounded-[calc(1rem-1px)] px-2 py-2.5 flex items-center justify-center gap-1.5 overflow-hidden relative">
              {/* Glass Reflection */}
              <div className="absolute top-0 inset-x-0 h-[45%] bg-gradient-to-b from-white/40 to-transparent"></div>

              <span className="relative z-10 text-xl drop-shadow-sm">❄️</span>
              <span className="relative z-10 text-lg font-black text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.3)] tracking-tight">
                PLAY
              </span>
            </div>
          </div>
        </button>

        {/* Shop Button */}
        <button
          onClick={onShop}
          className="flex-1 group relative active:scale-95 transition-all duration-150"
        >
          <div className="relative bg-gradient-to-b from-purple-400 to-indigo-600 rounded-2xl p-[3px] shadow-[0_5px_15px_rgba(124,58,237,0.4)] border border-white/20">
            <div className="bg-gradient-to-b from-purple-300 to-indigo-500 rounded-[calc(1rem-1px)] px-2 py-2.5 flex items-center justify-center gap-1.5 overflow-hidden relative">
              {/* Glass Reflection */}
              <div className="absolute top-0 inset-x-0 h-[45%] bg-gradient-to-b from-white/40 to-transparent"></div>

              <span className="relative z-10 text-xl drop-shadow-sm">💎</span>
              <span className="relative z-10 text-lg font-black text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.3)] tracking-tight">
                SHOP
              </span>
            </div>
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
