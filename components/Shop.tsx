"use client";

import React, { useState } from "react";
import { ShopItem, SHOP_ITEMS, BACKGROUND_ITEMS } from "../data/gameData";
import { getAssetPath } from "../utils/paths";
import { soundManager } from "@/utils/SoundManager";

interface ShopProps {
  points: number;
  ownedItems: string[];
  onBuy: (item: ShopItem) => void;
  onEquip: (item: ShopItem) => void;
  equippedAvatar: string;
  equippedBackground: string;
}

export default function Shop({
  points,
  ownedItems,
  onBuy,
  onEquip,
  equippedAvatar,
  equippedBackground,
}: ShopProps) {
  const [activeShopTab, setActiveShopTab] = useState<"avatar" | "background">(
    "avatar",
  );

  const displayedItems =
    activeShopTab === "avatar" ? SHOP_ITEMS : BACKGROUND_ITEMS;

  return (
    <div className="flex flex-col h-full bg-transparent rounded-[2rem] overflow-hidden">
      {/* Header */}
      <div className="flex flex-col border-b border-white/20 sticky top-0 z-10 glass backdrop-blur-xl">
        <div className="mb-2 flex justify-between items-center">
          <h2 className="text-xl font-bold text-pink-600 flex items-center gap-2 halo-text">
            🛍️ Shop
          </h2>
          <div className="px-3 py-1 bg-white/50 rounded-full text-yellow-700 font-bold border border-white shadow-sm text-sm">
            💰 {points}
          </div>
        </div>

        {/* Shop Tabs */}
        <div className="flex px-4 pb-3 gap-3">
          <button
            onClick={() => {
              soundManager.playSound("click");
              setActiveShopTab("avatar");
            }}
            className={`flex-1 py-1.5 rounded-xl text-sm font-black transition-all relative jelly-active-click ${
              activeShopTab === "avatar"
                ? "text-white jelly-depth-pink bg-gradient-to-b from-pink-400 to-pink-600"
                : "bg-white/40 text-gray-500 hover:bg-white/60"
            }`}
          >
            {activeShopTab === "avatar" && (
              <div className="jelly-gloss-layer opacity-50" />
            )}
            <span className="relative z-10">Avatars</span>
          </button>
          <button
            onClick={() => {
              soundManager.playSound("click");
              setActiveShopTab("background");
            }}
            className={`flex-1 py-1.5 rounded-xl text-sm font-black transition-all relative jelly-active-click ${
              activeShopTab === "background"
                ? "text-white jelly-depth-gray bg-gradient-to-b from-indigo-500 to-indigo-700 shadow-[0_4px_0_#3730a3]"
                : "bg-white/40 text-gray-500 hover:bg-white/60"
            }`}
          >
            {activeShopTab === "background" && (
              <div className="jelly-gloss-layer opacity-40" />
            )}
            <span className="relative z-10">Backgrounds</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        <div className="grid grid-cols-2 gap-4 pb-20">
          {displayedItems.map((item) => {
            const isOwned = ownedItems.includes(item.id) || item.cost === 0;
            const isEquipped =
              item.type === "avatar"
                ? equippedAvatar === item.id
                : equippedBackground === item.id;

            return (
              <div
                key={item.id}
                className={`
                    flex flex-col p-3 rounded-2xl border transition-all touch-manipulation glass-card relative overflow-hidden
                    ${
                      isOwned
                        ? "border-green-200 bg-green-50/30"
                        : "border-white/50 hover:bg-white/40 shadow-sm"
                    }
                `}
              >
                {/* Item Preview */}
                <div
                  className={`w-full mb-3 overflow-hidden relative border border-white/60 shadow-inner flex items-center justify-center p-2 rounded-xl transition-all ${
                    item.type === "background"
                      ? "h-24"
                      : "aspect-square bg-white/40"
                  }`}
                >
                  {item.type === "avatar" ? (
                    <img
                      src={item.imagePath}
                      alt={
                        item.name || `Avatar ${item.id.replace("avatar", "")}`
                      }
                      className="w-full h-full object-contain drop-shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getAssetPath(
                          "/assets/character/avatar_base.png",
                        );
                      }}
                    />
                  ) : (
                    // Background Preview
                    <div className="w-full h-full rounded-lg relative overflow-hidden">
                      <div
                        className="absolute inset-0 z-0"
                        style={item.style}
                      />
                    </div>
                  )}
                </div>

                <div className="mt-auto">
                  <p className="text-[11px] font-black text-gray-700 mb-2 truncate text-center uppercase tracking-tighter">
                    {item.name}
                  </p>

                  {isOwned ? (
                    <button
                      onClick={() => {
                        soundManager.playSound("click");
                        onEquip(item);
                      }}
                      disabled={isEquipped}
                      className={`
                                w-full py-2 rounded-xl text-xs font-black relative jelly-active-click
                                ${
                                  isEquipped
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed border-none"
                                    : "bg-gradient-to-b from-green-400 to-emerald-500 text-white shadow-[0_4px_0_#10b981] border border-white/20"
                                }
                            `}
                    >
                      {!isEquipped && (
                        <div className="jelly-gloss-layer opacity-40" />
                      )}
                      <span className="relative z-10">
                        {isEquipped ? "Wearing" : "Wear"}
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        soundManager.playSound("success");
                        onBuy(item);
                      }}
                      disabled={points < item.cost}
                      className={`
                                w-full py-2 rounded-xl text-[10px] md:text-xs font-black flex items-center justify-center gap-1 relative jelly-active-click
                                ${
                                  points < item.cost
                                    ? "bg-gray-100 text-gray-400 border-none"
                                    : "bg-gradient-to-b from-pink-400 to-rose-500 text-white shadow-[0_4px_0_#e11d48] border border-white/20"
                                }
                            `}
                    >
                      {points >= item.cost && (
                        <div className="jelly-gloss-layer opacity-40" />
                      )}
                      <span className="relative z-10 truncate px-1">
                        Buy {item.cost}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
