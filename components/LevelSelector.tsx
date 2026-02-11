import React, { useState, useRef, useEffect } from "react";
import { soundManager } from "@/utils/SoundManager";

interface LevelSelectorProps {
  currentLevelId: number;
  levels: { id: number }[];
  onLevelChange: (id: number) => void;
  colorTheme?: "blue" | "pink";
}

export default function LevelSelector({
  currentLevelId,
  levels,
  onLevelChange,
  colorTheme = "blue",
}: LevelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themeClasses =
    colorTheme === "blue"
      ? {
          button:
            "bg-blue-100 border-blue-200 text-blue-600 focus:ring-blue-400",
          item: "hover:bg-blue-50 text-blue-600",
          activeItem: "bg-blue-100 font-bold",
          icon: "text-blue-500",
        }
      : {
          button:
            "bg-pink-100 border-pink-200 text-pink-600 focus:ring-pink-400",
          item: "hover:bg-pink-50 text-pink-600",
          activeItem: "bg-pink-100 font-bold",
          icon: "text-pink-500",
        };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => {
          soundManager.playSound("click");
          setIsOpen(!isOpen);
        }}
        className={`appearance-none border-2 font-black py-1 pl-4 pr-10 rounded-full text-lg focus:outline-none flex items-center gap-2 relative jelly-active-click jelly-depth-gray ${themeClasses.button}`}
        type="button"
      >
        <div className="jelly-gloss-layer opacity-40" />
        <span className="relative z-10">{currentLevelId}</span>
        <div
          className={`absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none relative z-10 ${themeClasses.icon}`}
        >
          <svg
            className={`fill-current h-4 w-4 transform transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-24 max-h-60 overflow-y-auto bg-white border border-gray-100 rounded-xl shadow-xl z-50 custom-scrollbar">
          {levels.map((level) => (
            <button
              key={level.id}
              className={`w-full text-left px-4 py-2 transition-colors ${
                themeClasses.item
              } ${currentLevelId === level.id ? themeClasses.activeItem : ""}`}
              onClick={() => {
                soundManager.playSound("click");
                onLevelChange(level.id);
                setIsOpen(false);
              }}
            >
              <span className="font-bold">{level.id}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
