"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getTodayStats, type DailyStats } from "@/utils/dailyStats";
import { soundManager } from "@/utils/SoundManager";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const pathname = usePathname();
  const [stats, setStats] = useState<DailyStats>({
    date: "",
    problemsSolved: 0,
    sentencesCompleted: 0,
    wordsCompleted: 0,
    listeningCompleted: 0,
  });

  // Load stats on mount (client-side only)
  useEffect(() => {
    setStats(getTodayStats());
  }, []);

  // Listen for stats updates
  useEffect(() => {
    const handleStatsUpdate = (event: CustomEvent<DailyStats>) => {
      setStats(event.detail);
    };

    window.addEventListener(
      "dailyStatsUpdated",
      handleStatsUpdate as EventListener,
    );
    return () => {
      window.removeEventListener(
        "dailyStatsUpdated",
        handleStatsUpdate as EventListener,
      );
    };
  }, []);

  // Update stats when menu opens
  useEffect(() => {
    if (isOpen) {
      setStats(getTodayStats());
    }
  }, [isOpen]);

  const menuItems = [
    {
      name: "문장 만들기",
      path: "/sentence",
      icon: "🏠",
      gradient: "from-pink-400 to-rose-500",
    },
    {
      name: "단어장",
      path: "/word",
      icon: "📕",
      gradient: "from-orange-400 to-amber-500",
    },
    {
      name: "리스닝",
      path: "/hearing",
      icon: "🎧",
      gradient: "from-purple-400 to-violet-500",
    },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`absolute top-0 left-0 bottom-0 w-80 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background:
            "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
        }}
      >
        <div className="p-6 flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h2
              className="text-3xl font-black text-white drop-shadow-lg"
              style={{
                textShadow: "0 4px 8px rgba(0,0,0,0.3)",
              }}
            >
              Menu
            </h2>
            <button
              onClick={() => {
                soundManager.playSound("click");
                onClose();
              }}
              className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white transition-all duration-200 hover:scale-110"
              style={{
                boxShadow:
                  "0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mb-4 space-y-4">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => {
                    soundManager.playSound("click");
                    onClose();
                  }}
                  className={`group relative flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 overflow-hidden ${
                    isActive
                      ? "scale-105"
                      : "hover:scale-102 hover:translate-x-1"
                  }`}
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)"
                      : "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(10px)",
                    boxShadow: isActive
                      ? "0 8px 32px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.8), inset 0 -2px 8px rgba(0,0,0,0.1)"
                      : "0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.3)",
                    border: isActive
                      ? "2px solid rgba(255,255,255,0.6)"
                      : "2px solid rgba(255,255,255,0.2)",
                  }}
                >
                  {/* Jelly Gloss Effect */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1/2 opacity-30 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, transparent 100%)",
                      borderRadius: "1rem 1rem 0 0",
                    }}
                  />

                  {/* Icon with gradient background */}
                  <div
                    className={`relative z-10 w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform duration-300 ${
                      isActive
                        ? ""
                        : "group-hover:scale-110 group-hover:rotate-3"
                    }`}
                    style={{
                      background: isActive
                        ? `linear-gradient(135deg, ${item.gradient
                            .split(" ")
                            .slice(1)
                            .join(" ")})`
                        : "rgba(255,255,255,0.25)",
                      boxShadow: isActive
                        ? "0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.5)"
                        : "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    {item.icon}
                  </div>

                  {/* Text */}
                  <span
                    className={`relative z-10 text-lg font-black transition-colors ${
                      isActive
                        ? "bg-clip-text text-transparent bg-gradient-to-r " +
                          item.gradient
                        : "text-white group-hover:text-white"
                    }`}
                    style={{
                      textShadow: isActive
                        ? "none"
                        : "0 2px 4px rgba(0,0,0,0.2)",
                    }}
                  >
                    {item.name}
                  </span>

                  {/* Active indicator */}
                  {isActive && (
                    <div
                      className="absolute right-4 w-2 h-2 rounded-full animate-pulse"
                      style={{
                        background: `linear-gradient(135deg, ${item.gradient
                          .split(" ")
                          .slice(1)
                          .join(" ")})`,
                        boxShadow: "0 0 8px rgba(255,255,255,0.8)",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Today's Stats Card */}
          <div className="space-y-4 mb-6">
            <div
              className="p-4 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
                boxShadow:
                  "0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.3)",
                border: "2px solid rgba(255,255,255,0.2)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center text-xl"
                  style={{
                    boxShadow:
                      "0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.5)",
                  }}
                >
                  ⭐
                </div>
                <div>
                  <p className="text-xs text-white/70 font-semibold">
                    오늘의 학습
                  </p>
                  <p className="text-lg font-black text-white">
                    {stats.problemsSolved}문제 완료!
                  </p>
                </div>
              </div>
              {/* Detailed breakdown */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/20">
                <div className="text-center">
                  <p className="text-2xl font-black text-white">
                    {stats.sentencesCompleted}
                  </p>
                  <p className="text-[10px] text-white/60 font-semibold">
                    문장
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-white">
                    {stats.wordsCompleted}
                  </p>
                  <p className="text-[10px] text-white/60 font-semibold">
                    단어
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-white">
                    {stats.listeningCompleted}
                  </p>
                  <p className="text-[10px] text-white/60 font-semibold">
                    리스닝
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-white/20">
            <p className="text-xs text-center text-white/60 font-semibold">
              © 2024 Wordrobe
            </p>
          </div>
        </div>

        {/* Background Pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
          }}
        />
      </div>
    </>
  );
}
