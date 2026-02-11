"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const pathname = usePathname();

  const menuItems = [
    { name: "문장 만들기", path: "/", icon: "🏠" },
    { name: "단어장", path: "/word", icon: "📕" },
    { name: "리스닝", path: "/hearing", icon: "🎧" },
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
        className={`absolute top-0 left-0 bottom-0 w-64 bg-white/90 backdrop-blur-md shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
              Menu
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
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
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl duration-200 relative jelly-active-click ${
                    isActive
                      ? "bg-pink-100 text-pink-600 font-black jelly-depth-pink shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 font-bold hover:text-gray-900"
                  }`}
                >
                  {isActive && <div className="jelly-gloss-layer opacity-30" />}
                  <span className="text-xl relative z-10">{item.icon}</span>
                  <span className="relative z-10">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer (Optional) */}
          <div className="mt-auto pt-6 border-t border-gray-100">
            <p className="text-xs text-center text-gray-400">© 2024 Wordrobe</p>
          </div>
        </div>
      </div>
    </>
  );
}
