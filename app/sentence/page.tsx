"use client";

import React, { useState, useEffect, Suspense } from "react";
import Header from "@/components/Header";
import SideMenu from "@/components/SideMenu";
import AvatarStage from "@/components/AvatarStage";
import SentenceBuilder from "@/components/SentenceBuilder";
import LevelSelector from "@/components/LevelSelector";
import Shop from "@/components/Shop";
import { Level, ShopItem, fetchSentences, LEVELS } from "@/data/gameData";
import { useKakaoBrowserEscape } from "@/hooks/useKakaoBrowserEscape";
import { soundManager } from "@/utils/SoundManager";
import { useSearchParams, useRouter } from "next/navigation";
import { shuffleArray } from "@/utils/shuffleArray";

function SentenceContent() {
  useKakaoBrowserEscape();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "shop" ? "shop" : "play";

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [points, setPoints] = useState(0);
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [isHydrated, setIsHydrated] = useState(false);
  const [equippedAvatar, setEquippedAvatar] = useState<string>("avatar_base");
  const [equippedBackground, setEquippedBackground] =
    useState<string>("bg_default");

  const [levelData, setLevelData] = useState<Level | null>(null);
  const [loading, setLoading] = useState(true);
  const [ownedItems, setOwnedItems] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"play" | "shop">(initialTab);
  const [cheatCount, setCheatCount] = useState(0);

  // --- Persistence Logic ---
  useEffect(() => {
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

  // --- Data Fetching ---
  useEffect(() => {
    const loadLevelData = async () => {
      setLoading(true);
      try {
        // Use curated LEVELS for all levels 1-10
        if (
          currentLevelId >= 1 &&
          currentLevelId <= 10 &&
          LEVELS[currentLevelId - 1]
        ) {
          const level = LEVELS[currentLevelId - 1];
          // Shuffle sentences for random order each time
          setLevelData({
            ...level,
            sentences: shuffleArray(level.sentences),
          });
        } else {
          // Fallback for levels beyond 10 (if ever needed)
          // This part would typically fetch from a dynamic source if levels beyond 10 were implemented
          // For now, it's a placeholder.
          const rawData = await fetchSentences(); // Assuming fetchSentences can provide more data
          if (!rawData || rawData.length === 0) {
            // If no dynamic data, perhaps a default or error state
            console.warn(
              "No dynamic sentence data available for levels beyond 10.",
            );
            setLevelData(null); // Or set a default level
            setLoading(false);
            return;
          }

          const offset = (currentLevelId - 1) * 3; // Example offset logic for dynamic levels
          const levelSentences = rawData.slice(offset, offset + 3);

          setLevelData({
            id: currentLevelId,
            description: `Level ${currentLevelId}`,
            sentences: levelSentences.map((s) => ({
              korean: s.korean,
              english: Array.isArray(s.english)
                ? s.english
                : s.english.split(" "),
            })),
          });
        }
      } catch (err) {
        console.error("Failed to load level data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isHydrated) {
      loadLevelData();
    }
  }, [currentLevelId, isHydrated]);

  const handleSentenceComplete = (earnedPoints: number) => {
    setPoints((prev) => prev + earnedPoints);
  };

  const handleFinalLevelComplete = () => {
    if (currentLevelId < 10) {
      setCurrentLevelId((prev) => prev + 1);
    }
  };

  const handleHint = () => {
    if (points >= 20) {
      setPoints((prev) => prev - 20);
      return true;
    } else {
      alert("코인이 부족합니다! (20코인 필요)");
      return false;
    }
  };

  const handleBuy = (item: ShopItem) => {
    if (points >= item.cost && !ownedItems.includes(item.id)) {
      setPoints((prev) => prev - item.cost);
      setOwnedItems((prev) => [...prev, item.id]);

      if (item.type === "avatar") {
        setEquippedAvatar(item.id);
      } else if (item.type === "background") {
        setEquippedBackground(item.id);
      }
      soundManager.playSound("success");
    }
  };

  const handleEquip = (item: ShopItem) => {
    if (item.type === "avatar") {
      setEquippedAvatar(item.id);
    } else if (item.type === "background") {
      setEquippedBackground(item.id);
    }
    soundManager.playSound("click");
  };

  return (
    <main
      className="h-screen w-full bg-slate-100 flex items-center justify-center font-sans overflow-hidden"
      onClick={() => soundManager.playBGM()}
    >
      <div
        className="w-full max-w-md h-full bg-pink-50 flex flex-col relative shadow-2xl overflow-hidden md:rounded-3xl md:h-[95vh] md:border-8 md:border-gray-800 transition-all duration-500 ease-out"
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
            router.push("/"); // Back to home on logo click
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

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          <AvatarStage
            equippedAvatar={equippedAvatar}
            equippedBackground={equippedBackground}
          />

          <div className="flex-1 bg-white/60 backdrop-blur-md shadow-[0_-5px_20px_rgba(0,0,0,0.05)] border-t border-white/80 p-4 pb-20 min-h-[400px]">
            {activeTab === "play" ? (
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-end mb-2">
                  <h2 className="text-2xl font-black text-gray-700">
                    Sentence
                  </h2>
                  <LevelSelector
                    currentLevelId={currentLevelId}
                    levels={Array.from({ length: 10 }, (_, i) => ({
                      id: i + 1,
                    }))}
                    onLevelChange={setCurrentLevelId}
                    colorTheme="pink"
                  />
                </div>

                {loading ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3">
                    <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
                    <p className="text-gray-400 font-bold animate-pulse text-xs uppercase">
                      LOADING QUESTIONS...
                    </p>
                  </div>
                ) : levelData ? (
                  <SentenceBuilder
                    key={levelData.id}
                    level={levelData}
                    onComplete={handleSentenceComplete}
                    onLevelComplete={handleFinalLevelComplete}
                    onHint={handleHint}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center text-red-400">
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

export default function SentencePage() {
  return (
    <Suspense
      fallback={
        <main className="h-screen w-full bg-slate-100 flex items-center justify-center font-sans overflow-hidden">
          <div className="w-full max-w-md h-full bg-pink-50 flex flex-col relative shadow-2xl overflow-hidden md:rounded-3xl md:h-[95vh] md:border-8 md:border-gray-800 transition-all duration-500 ease-out">
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
              <p className="text-gray-400 font-bold animate-pulse text-xs uppercase">
                LOADING...
              </p>
            </div>
          </div>
        </main>
      }
    >
      <SentenceContent />
    </Suspense>
  );
}
