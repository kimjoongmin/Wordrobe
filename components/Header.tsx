"use client";

import React from "react";
import { soundManager } from "@/utils/SoundManager";

interface HeaderProps {
  points: number;
  onMenuClick: () => void;
  onLogoClick?: () => void;
  onPointsClick?: () => void;
}

export default function Header({
  points,
  onMenuClick,
  onLogoClick,
  onPointsClick,
}: HeaderProps) {
  return (
    <header className="flex justify-between items-center px-4 py-3 bg-white/70 backdrop-blur-xl shadow-sm border-b border-white/40 sticky top-0 z-40 shrink-0 h-14">
      {/* Left: Hamburger Menu */}
      <button
        onClick={() => {
          soundManager.playSound("click");
          onMenuClick();
        }}
        className="p-2 -ml-2 rounded-full hover:bg-white/50 active:scale-95 transition-all text-gray-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Center: Logo */}
      <div
        className="absolute left-1/2 transform -translate-x-1/2 cursor-pointer select-none active:scale-95 transition-transform"
        onClick={onLogoClick}
      >
        <h1 className="text-2xl font-black tracking-tight relative group">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500 drop-shadow-[0_2px_4px_rgba(236,72,153,0.3)] filter brightness-110">
            Wordrobe
          </span>
          {/* Glossy shine overlay for text */}
          <div className="absolute top-0 left-0 w-full h-[40%] bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-t-lg opacity-80"></div>
        </h1>
      </div>

      {/* Right: Points */}
      <div className="flex gap-2 items-center">
        <div
          className="relative group active:scale-95 transition-all duration-200 cursor-pointer"
          onClick={onPointsClick}
        >
          <div className="bg-gradient-to-b from-yellow-50 to-orange-50 px-3.5 py-1.5 rounded-2xl font-black text-yellow-700 jelly-depth-yellow border border-yellow-200 flex items-center gap-1.5 text-[15px] overflow-hidden relative">
            <div className="jelly-gloss-layer opacity-40" />
            <span className="relative z-10 drop-shadow-sm filter brightness-110 group-hover:animate-bounce-short">
              💰
            </span>
            <span className="relative z-10 drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">
              {points}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
