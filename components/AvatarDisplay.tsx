"use client";

import React from "react";
import { SHOP_ITEMS } from "../data/gameData";
import { getAssetPath } from "../utils/paths";
// We don't import SPRITE_CONFIG anymore as we are using direct images.

interface AvatarProps {
  avatarId?: string;
  className?: string; // Additional classes for sizing
}

export default function AvatarDisplay({
  avatarId,
  className = "w-64 h-64",
}: AvatarProps) {
  // Find item data or default to base
  const item = SHOP_ITEMS.find((i) => i.id === avatarId);
  const imagePath = item
    ? item.imagePath
    : getAssetPath("/assets/character/avatar_base.png");

  return (
    <div className={`relative ${className} mx-auto`}>
      <img
        src={imagePath}
        alt="Avatar"
        className="absolute inset-0 w-full h-full object-contain drop-shadow-xl"
      />
    </div>
  );
}
