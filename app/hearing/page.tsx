"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import SideMenu from "@/components/SideMenu";
import { useKakaoBrowserEscape } from "@/hooks/useKakaoBrowserEscape";

export default function HearingPage() {
  useKakaoBrowserEscape();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const savedPoints = localStorage.getItem("wordrobe_points");
    if (savedPoints) setPoints(Number(savedPoints));
  }, []);

  return (
    <main className="h-screen w-full bg-slate-100 flex items-center justify-center font-sans overflow-hidden">
      <div
        className="w-full max-w-md h-full bg-pink-50 flex flex-col relative shadow-2xl overflow-hidden md:rounded-3xl md:h-[95vh] md:border-8 md:border-gray-800 transition-all duration-500 ease-out"
        style={{
          paddingTop: "max(env(safe-area-inset-top))",
          paddingBottom: "max(env(safe-area-inset-bottom))",
        }}
      >
        <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        <Header points={points} onMenuClick={() => setIsMenuOpen(true)} />

        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <div className="text-6xl mb-4">🎧</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">리스닝</h2>
          <p className="text-gray-500">학습 준비 중입니다...</p>
        </div>
      </div>
    </main>
  );
}
