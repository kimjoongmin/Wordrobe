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
            className="relative w-[200px] h-[220px] z-10 cursor-move active:cursor-grabbing flex items-center justify-center pt-8"
          >
            {/* Jelly Floor/Platform */}
            <div className="absolute bottom-4 inset-x-4 h-8 bg-white/30 rounded-[100%] border-2 border-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(255,255,255,0.8)] z-0">
              <div className="absolute top-1 inset-x-4 h-[40%] bg-white/40 rounded-full" />
            </div>

            {/* Only render avatar after hydration to prevent flicker */}
            {isHydrated && (
              <div className="relative z-10 w-full h-full drop-shadow-[0_10px_10px_rgba(0,0,0,0.15)] filter brightness-105">
                <AvatarDisplay
                  avatarId={equippedAvatar}
                  className="w-full h-full object-contain pointer-events-none"
                />
              </div>
            )}
          </div>
        </Draggable>
      </div>
    </div>
  );
}
