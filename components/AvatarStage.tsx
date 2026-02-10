import React, { useRef, useEffect, useState } from "react";
import Draggable from "react-draggable";
import AvatarDisplay from "@/components/AvatarDisplay";
import { BACKGROUND_ITEMS } from "@/data/gameData";

interface AvatarStageProps {
  equippedAvatar: string;
  equippedBackground: string;
}

export default function AvatarStage({
  equippedAvatar,
  equippedBackground,
}: AvatarStageProps) {
  const avatarRef = useRef<HTMLDivElement>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <div className="w-full flex justify-center bg-transparent shrink-0">
      <div className="relative w-full aspect-[4/2.6] max-h-[380px] flex items-center justify-center overflow-hidden">
        {/* Background Layer */}
        <div
          className="absolute inset-0 transition-all duration-500 ease-out z-0"
          style={
            BACKGROUND_ITEMS.find((b) => b.id === equippedBackground)
              ?.style || {
              background: "transparent",
            }
          }
        />
        {/* Inner container: fixed size for Avatar */}
        <Draggable nodeRef={avatarRef} bounds="parent">
          <div
            ref={avatarRef}
            className="relative w-[200px] h-[220px] aspect-square drop-shadow-2xl z-10 cursor-move active:cursor-grabbing"
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
  );
}
