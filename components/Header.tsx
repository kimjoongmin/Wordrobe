"use client";

import React from "react";

interface HeaderProps {
  points: number;
  onMenuClick: () => void;
  onLogoClick?: () => void;
}

export default function Header({
  points,
  onMenuClick,
  onLogoClick,
}: HeaderProps) {
  return (
    <header className="flex justify-between items-center px-4 py-3 bg-white/70 backdrop-blur-xl shadow-sm border-b border-white/40 sticky top-0 z-40 shrink-0 h-14">
      {/* Left: Hamburger Menu */}
      <button
        onClick={onMenuClick}
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
        <h1 className="text-xl font-black tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 drop-shadow-sm">
            Wordrobe
          </span>
        </h1>
      </div>

      {/* Right: Points */}
      <div className="flex gap-2 items-center">
        <div className="bg-white/80 px-3 py-1 rounded-full font-bold text-yellow-600 shadow-inner border border-yellow-200 flex items-center gap-1 text-sm">
          <span>💰</span> {points}
        </div>
      </div>
    </header>
  );
}
