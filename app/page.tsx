"use client";

import React, { useState, useEffect, useRef } from "react";
import Draggable from "react-draggable";
import AvatarDisplay from "@/components/AvatarDisplay";
import SentenceBuilder from "@/components/SentenceBuilder";
import Shop from "@/components/Shop";
import Header from "@/components/Header";
import SideMenu from "@/components/SideMenu";
import { ShopItem, fetchSentences, BACKGROUND_ITEMS } from "@/data/gameData"; // Removed LEVELS import
import sentencesData from "@/data/sentences.json"; // Direct Import (Simulates API)
import { useKakaoBrowserEscape } from "@/hooks/useKakaoBrowserEscape";
import { soundManager } from "@/utils/SoundManager";

interface LevelData {
  id: number;
  description: string;
  sentences: { korean: string; english: string[] }[];
}

export default function Home() {
  // ✅ Redirect if in KakaoTalk browser
  useKakaoBrowserEscape();

  const [points, setPoints] = useState(0); // Start at 0
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [levelData, setLevelData] = useState<LevelData | null>(null);
  const [loading, setLoading] = useState(true);

  // Shop State
  const [ownedItems, setOwnedItems] = useState<string[]>([]);
  // Single Avatar State, defaults to base
  const [equippedAvatar, setEquippedAvatar] = useState<string>("avatar_base");
  const [equippedBackground, setEquippedBackground] =
    useState<string>("bg_default");
  const [cheatCount, setCheatCount] = useState(0);

  // Mobile Tab State
  const [activeTab, setActiveTab] = useState<"play" | "shop">("play");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isHydrated, setIsHydrated] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  // --- Persistence Logic ---
  useEffect(() => {
    // Load data from localStorage on mount
    const savedPoints = localStorage.getItem("wordrobe_points");
    const savedLevel = localStorage.getItem("wordrobe_level");
    const savedOwned = localStorage.getItem("wordrobe_owned");
    const savedEquipped = localStorage.getItem("wordrobe_equipped");
    const savedBg = localStorage.getItem("wordrobe_bg_equipped");

    if (savedPoints) setPoints(Number(savedPoints));
    if (savedLevel) setCurrentLevelId(Number(savedLevel));
    if (savedOwned) setOwnedItems(JSON.parse(savedOwned));
    if (savedEquipped) setEquippedAvatar(savedEquipped);
    if (savedBg) setEquippedBackground(savedBg);

    setIsHydrated(true); // ✅ Mark as hydrated after loading

    // Initialize sound manager on mount
    soundManager.init();
  }, []);

  // ... (Save effects remain same) ...

  // Save data whenever it changes
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("wordrobe_points", points.toString());
  }, [points, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("wordrobe_level", currentLevelId.toString());
  }, [currentLevelId, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("wordrobe_owned", JSON.stringify(ownedItems));
  }, [ownedItems, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("wordrobe_equipped", equippedAvatar);
  }, [equippedAvatar, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("wordrobe_bg_equipped", equippedBackground);
  }, [equippedBackground, isHydrated]);

  // --- 2. API Integration (Simulated with JSON) ---
  // Instead of hardcoded LEVELS, we generate levels dynamically from our "Database" (sentences.json)
  useEffect(() => {
    const generateLevel = async () => {
      setLoading(true);

      // Simulate API Network Delay (0.5s) to feel like "Connectivity"
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 1. Fetch Data (Google Sheet or Local Fallback)
      let rawData = await fetchSentences();

      if (!rawData || rawData.length === 0) {
        console.log("Using local backup data.");
        rawData = sentencesData;
      } else {
        console.log("Using Google Sheet data:", rawData.length, "sentences");
      }

      // 2. Calculate Difficulty for all sentences
      // Difficulty = Korean length + English word count * 2 (roughly)
      const rankedSentences = [...rawData]
        .map((s) => ({
          ...s,
          difficulty:
            s.korean.length +
            (Array.isArray(s.english)
              ? s.english.join(" ").length
              : s.english.length),
        }))
        .sort((a, b) => a.difficulty - b.difficulty);

      // 2. Define Level Buckets (10 Levels)
      // We have ~52 sentences. 10 Levels means ~5 sentences per level.
      const totalSentences = rankedSentences.length;
      const bucketCount = 10;
      const bucketSize = Math.max(3, Math.floor(totalSentences / bucketCount)); // Ensure at least 3

      // 3. Determine which bucket to use based on currentLevelId
      // Level 1 -> Bucket 0
      // Level 10 -> Bucket 9
      // Level 11+ -> Bucket 9 (Max Difficulty)
      const levelIndex = Math.min(currentLevelId - 1, bucketCount - 1);
      const startIndex = levelIndex * bucketSize;

      // If it's the last bucket, take everything remaining
      // Otherwise, take the bucketSize
      // However, to make it distinct, let's just take a slice.
      // If we run out of bounds (shouldn't with the min clamp), we fallback.

      // Handling the "Everything else" for the last level?
      // Or just rigid buckets?
      // Let's do rigid buckets but ensuring we don't go out of bounds.

      const start = Math.min(startIndex, totalSentences - 3); // Safety clamp
      const end = Math.min(start + bucketSize + 2, totalSentences); // Overlap a bit for variety?

      // Let's just grab the specific slice for this difficulty tier
      // Actually, let's allow a wider pool for variety, centered on the difficulty.
      // But user wants "levels" to be distinct.

      const distinctPool = rankedSentences.slice(start, end);

      // 4. Select random 10 sentences from this difficulty pool
      const shuffledPool = [...distinctPool].sort(() => Math.random() - 0.5);
      const selectedSentences = shuffledPool.slice(0, 10);

      // Process them into the format SentenceBuilder expects (string -> array)
      const formattedSentences = selectedSentences.map((s) => ({
        korean: s.korean,
        english:
          typeof s.english === "string" ? s.english.split(" ") : s.english,
      }));

      const getLevelTitle = (id: number) => {
        if (id <= 3) return "Beginner";
        if (id <= 7) return "Intermediate";
        return "Advanced";
      };

      setLevelData({
        id: currentLevelId,
        description: `Level ${currentLevelId}: ${getLevelTitle(
          currentLevelId,
        )}`,
        sentences: formattedSentences,
      });

      setLoading(false);
    };

    generateLevel();
  }, [currentLevelId]);

  // Just adds points, DOES NOT advance level
  const handleSentenceComplete = (earnedPoints: number) => {
    setPoints((prev) => prev + earnedPoints);
  };

  // Called ONLY when all sentences in the level are finished
  const handleFinalLevelComplete = () => {
    // Advance after short delay
    setTimeout(() => {
      if (currentLevelId < 10) {
        setCurrentLevelId((prev) => prev + 1);
      } else {
        // Game Cleared Logic
        alert("🎉 Congratulations! You have cleared all 10 levels! 🎉");
        // Optionally reset to 1 or just stay at 10
      }
    }, 1000);
  };

  const handleBuy = (item: ShopItem) => {
    if (points >= item.cost && !ownedItems.includes(item.id)) {
      setPoints((prev) => prev - item.cost);
      setOwnedItems((prev) => [...prev, item.id]);

      // Auto-Equip on Buy (User Request)
      if (item.type === "avatar") {
        setEquippedAvatar(item.id);
      } else if (item.type === "background") {
        setEquippedBackground(item.id);
      }
    }
  };

  const handleEquip = (item: ShopItem) => {
    if (item.type === "avatar") {
      setEquippedAvatar(item.id);
    } else if (item.type === "background") {
      setEquippedBackground(item.id);
    }
  };

  const handleHint = () => {
    if (points >= 20) {
      setPoints((prev) => prev - 20);
      return true; // Success
    } else {
      alert("Not enough coins! You need 20 coins for a hint.");
      return false; // Failed
    }
  };

  return (
    // --- 1. Mobile Layout Wrapper ---
    // Background fills screen, but content is constrained to "Mobile Width" (max-w-md) and centered.
    <main
      className="h-screen w-full bg-slate-100 flex items-center justify-center font-sans overflow-hidden"
      onClick={() => soundManager.playBGM()} // Auto-play BGM on first interaction
    >
      {/* Mobile Device Container */}
      <div
        className="w-full max-w-md h-full bg-pink-50 flex flex-col relative shadow-2xl overflow-hidden md:rounded-3xl md:h-[95vh] md:border-8 md:border-gray-800 transition-all duration-500 ease-out"
        style={{
          paddingTop: "max(env(safe-area-inset-top))",
          paddingBottom: "max(env(safe-area-inset-bottom))",
        }}
      >
        {/* Background Ambience handled in globals.css */}

        {/* Side Menu */}
        <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

        {/* Top Bar (Sticky) */}
        <Header
          points={points}
          onMenuClick={() => setIsMenuOpen(true)}
          onLogoClick={() => {
            soundManager.playSound("click");
            const newCount = cheatCount + 1;
            setCheatCount(newCount);
            // console.log("Cheat Count:", newCount); // Debug

            if (newCount >= 10) {
              setPoints((prev) => prev + 5000);
              alert("🦸‍♂️ 아빠가 용돈 5000원 줬다! (Daddy's Chance Applied)");
              setCheatCount(0); // Reset
            }
          }}
        />

        {/* Scrollable Content Area */}
        {/* We use flex-1 and overflow-y-auto to ensure scrolling happens INSIDE this container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col ">
          {/* --- 3. Avatar Visibility Fix --- */}
          {/* Added min-height and proper scaling to ensure it's never 0 height */}
          <div className="w-full flex justify-center bg-transparent shrink-0">
            <div className="relative w-full aspect-[4/3] max-h-[400px] flex items-center justify-center overflow-hidden md:rounded-3xl">
              {/* Background Layer */}
              <div
                className="absolute inset-0 transition-all duration-500 ease-out z-0"
                style={
                  BACKGROUND_ITEMS.find((b) => b.id === equippedBackground)
                    ?.style || { background: "transparent" }
                }
              />
              {/* Inner container: fixed size for Avatar */}
              <Draggable nodeRef={avatarRef} bounds="parent">
                <div
                  ref={avatarRef}
                  className="relative w-[220px] h-[220px] aspect-square drop-shadow-2xl z-10 cursor-move active:cursor-grabbing"
                >
                  {/* Only render avatar after hydration to prevent flicker */}
                  {isHydrated && (
                    <AvatarDisplay
                      avatarId={equippedAvatar}
                      className="w-full h-full object-contain pointer-events-none"
                    />
                  )}
                </div>
              </Draggable>
            </div>
          </div>

          {/* Dynamic Content Section */}
          <div className="flex-1 bg-white/60 backdrop-blur-md  shadow-[0_-5px_20px_rgba(0,0,0,0.05)] border-t border-white/80 p-4 min-h-[450px] pb-20">
            {/* Tab Content */}
            {activeTab === "play" ? (
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-end">
                  {/* Restored Dropdown in Header */}
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-gray-700">Level</h2>
                    <div className="relative">
                      <select
                        value={currentLevelId}
                        onChange={(e) => {
                          soundManager.playSound("click");
                          setCurrentLevelId(Number(e.target.value));
                        }}
                        className="appearance-none bg-pink-100 border border-pink-200 text-pink-600 font-bold py-1 pl-3 pr-8 rounded-full text-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                      >
                        {/* 10 Distinct Levels */}
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(
                          (id) => (
                            <option key={id} value={id}>
                              {id}
                            </option>
                          ),
                        )}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-pink-500">
                        <svg
                          className="fill-current h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:block">
                    Difficulty: {currentLevelId <= 10 ? currentLevelId : "Max"}
                  </span>
                </div>

                {loading ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 py-10">
                    <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
                    <p className="text-gray-400 font-bold animate-pulse text-xs uppercase tracking-wider">
                      Loading Questions...
                    </p>
                  </div>
                ) : levelData ? (
                  <SentenceBuilder
                    level={levelData}
                    onComplete={handleSentenceComplete}
                    onLevelComplete={handleFinalLevelComplete}
                    onHint={handleHint}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center text-red-400 text-sm">
                    Failed to load data.
                  </div>
                )}
              </div>
            ) : (
              <Shop
                points={points}
                ownedItems={ownedItems}
                onBuy={handleBuy}
                onEquip={handleEquip}
                equippedAvatar={equippedAvatar}
                equippedBackground={equippedBackground}
              />
            )}
          </div>
        </div>

        {/* --- 1. Mobile Bottom Navigation --- */}
        <nav className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-xl p-1.5 rounded-full shadow-2xl border border-white/60 flex gap-1 z-50">
          <button
            onClick={() => {
              soundManager.playSound("click");
              setActiveTab("play");
            }}
            className={`px-6 py-3 rounded-full font-bold text-sm transition-all flex items-center gap-2
                    ${
                      activeTab === "play"
                        ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md transform scale-105"
                        : "text-gray-400 hover:bg-gray-100"
                    }
                `}
          >
            <span>🎮</span> Play
          </button>
          <button
            onClick={() => {
              soundManager.playSound("click");
              setActiveTab("shop");
            }}
            className={`px-6 py-3 rounded-full font-bold text-sm transition-all flex items-center gap-2
                    ${
                      activeTab === "shop"
                        ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-md transform scale-105"
                        : "text-gray-400 hover:bg-gray-100"
                    }
                `}
          >
            <span>🛍️</span> Shop
          </button>
        </nav>
      </div>
    </main>
  );
}
