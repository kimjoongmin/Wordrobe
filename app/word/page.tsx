"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import SideMenu from "@/components/SideMenu";
import AvatarStage from "@/components/AvatarStage";
import VocabularyBuilder from "@/components/VocabularyBuilder";
import LevelSelector from "@/components/LevelSelector";
import Shop from "@/components/Shop";
import { ShopItem, VocabLevel } from "@/data/gameData"; // Removed VOCAB_LEVELS
import wordsData from "@/data/words.json"; // Direct Import (Simulates API)
import { useKakaoBrowserEscape } from "@/hooks/useKakaoBrowserEscape";
import { soundManager } from "@/utils/SoundManager";
import { useRouter } from "next/navigation";

export default function WordPage() {
  useKakaoBrowserEscape();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [points, setPoints] = useState(0);
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [isHydrated, setIsHydrated] = useState(false);
  const [equippedAvatar, setEquippedAvatar] = useState<string>("avatar_base");
  const [equippedBackground, setEquippedBackground] =
    useState<string>("bg_default");

  const [levelData, setLevelData] = useState<VocabLevel | null>(null);
  const [loading, setLoading] = useState(true);

  // Shop State
  const [ownedItems, setOwnedItems] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"play" | "shop">("play");
  const [cheatCount, setCheatCount] = useState(0);

  // --- Persistence Logic ---
  useEffect(() => {
    // Load data from localStorage on mount
    const savedPoints = localStorage.getItem("wordrobe_points");
    const savedLevel = localStorage.getItem("wordrobe_vocab_level");
    const savedEquipped = localStorage.getItem("wordrobe_equipped");
    const savedBg = localStorage.getItem("wordrobe_bg_equipped");
    const savedOwned = localStorage.getItem("wordrobe_owned");

    if (savedPoints) setPoints(Number(savedPoints));
    if (savedLevel) setCurrentLevelId(Number(savedLevel));
    if (savedEquipped) setEquippedAvatar(savedEquipped);
    if (savedBg) setEquippedBackground(savedBg);
    if (savedOwned) setOwnedItems(JSON.parse(savedOwned));

    setIsHydrated(true);
    soundManager.init();
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("wordrobe_points", points.toString());
  }, [points, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("wordrobe_vocab_level", currentLevelId.toString());
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

  // --- API Integration (Simulated) ---
  useEffect(() => {
    const fetchLevelData = async () => {
      setLoading(true);
      // Simulate API Delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Filter words for the current level
      // The JSON has "level" property.
      const levelWords = wordsData.filter((w) => w.level === currentLevelId);

      // Select random 5 words if there are more
      const shuffled = [...levelWords].sort(() => Math.random() - 0.5);
      const selectedWords = shuffled.slice(0, 5);

      setLevelData({
        id: currentLevelId,
        description: `Level ${currentLevelId}`,
        words: selectedWords.map((w) => ({
          korean: w.korean,
          english: w.english,
        })),
      });
      setLoading(false);
    };

    fetchLevelData();
  }, [currentLevelId]);

  const handleWordComplete = (/* earnedPoints ignored, calculated here */) => {
    // Scoring Logic:
    // Levels 1-5: 10 points
    // Levels 6-10: 20 points
    const pointsPerWord = currentLevelId <= 5 ? 10 : 20;
    setPoints((prev) => prev + pointsPerWord);
  };

  const handleFinalLevelComplete = () => {
    setTimeout(() => {
      if (currentLevelId < 10) {
        // Max level 10
        setCurrentLevelId((prev) => prev + 1);
      } else {
        alert(
          "🎉 Congratulations! You have cleared all 10 vocabulary levels! 🎉",
        );
      }
    }, 1000);
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

  const handleBuy = (item: ShopItem) => {
    if (points >= item.cost && !ownedItems.includes(item.id)) {
      setPoints((prev) => prev - item.cost);
      setOwnedItems((prev) => [...prev, item.id]);

      // Auto-Equip on Buy
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

  return (
    <main
      className="h-screen w-full bg-slate-100 flex items-center justify-center font-sans overflow-hidden"
      onClick={() => soundManager.playBGM()}
    >
      <div
        className="w-full max-w-md h-full bg-blue-50 flex flex-col relative shadow-2xl overflow-hidden md:rounded-3xl md:h-[95vh] md:border-8 md:border-gray-800 transition-all duration-500 ease-out"
        style={{
          paddingTop: "max(env(safe-area-inset-top))",
          paddingBottom: "max(env(safe-area-inset-bottom))",
        }}
      >
        <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        <Header
          points={points}
          onMenuClick={() => setIsMenuOpen(true)}
          onLogoClick={() => {
            soundManager.playSound("click");
            router.push("/"); // Back to home
          }}
          onPointsClick={() => {
            const newCount = cheatCount + 1;
            setCheatCount(newCount);
            if (newCount >= 11) {
              setPoints((prev) => prev + 5000);
              alert("🦸‍♂️ 아빠가 용돈 5000원 줬다! (Daddy's Chance Applied)");
              setCheatCount(0); // Reset
            }
          }}
        />

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          {/* Avatar Stage */}
          <AvatarStage
            equippedAvatar={equippedAvatar}
            equippedBackground={equippedBackground}
          />

          {/* Dynamic Content Section */}
          <div className="flex-1 bg-white/60 backdrop-blur-md shadow-[0_-5px_20px_rgba(0,0,0,0.05)] border-t border-white/80 p-4 pb-20 min-h-[400px]">
            {activeTab === "play" ? (
              <div className="h-full flex flex-col">
                {/* Level Selector - Only show in Play mode */}
                <div className="flex justify-between items-end mb-2">
                  <h2 className="text-2xl font-black text-gray-700">
                    Vocabulary
                  </h2>
                  <LevelSelector
                    currentLevelId={currentLevelId}
                    levels={Array.from({ length: 10 }, (_, i) => ({
                      id: i + 1,
                    }))}
                    onLevelChange={setCurrentLevelId}
                    colorTheme="blue"
                  />
                </div>

                {loading ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 py-10">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-gray-400 font-bold animate-pulse text-xs uppercase tracking-wider">
                      Loading Words...
                    </p>
                  </div>
                ) : levelData ? (
                  <VocabularyBuilder
                    level={levelData}
                    onComplete={handleWordComplete}
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

        {/* --- Mobile Bottom Navigation --- */}
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
