import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { soundManager } from "@/utils/SoundManager";

interface VocabularyBuilderProps {
  level: {
    id: number;
    description: string;
    words: { korean: string; english: string }[];
  };
  onComplete: (points: number) => void;
  onLevelComplete: () => void;
  onHint: () => boolean;
}

export default function VocabularyBuilder({
  level,
  onComplete,
  onLevelComplete,
  onHint,
}: VocabularyBuilderProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState<
    { id: string; char: string }[]
  >([]);
  const [availableLetters, setAvailableLetters] = useState<
    { id: string; char: string }[]
  >([]);
  const [isWrong, setIsWrong] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const successHandledRef = useRef(false);

  const currentWord = level.words[currentWordIndex];

  // Scoring
  const pointsPerAction = 10; // Simple flat rate for words

  // Init Word
  useEffect(() => {
    const currentWord = level.words[currentWordIndex];
    if (currentWord) {
      // Create letter objects with unique IDs
      const letters = currentWord.english.split("").map((char, idx) => ({
        id: `${char}-${idx}-${Date.now()}`,
        char: char.toUpperCase(),
      }));

      setAvailableLetters([...letters].sort(() => Math.random() - 0.5));
      setSelectedLetters([]);
      setIsWrong(false);
      setIsSuccess(false);
      successHandledRef.current = false;
    }
  }, [currentWordIndex, level]);

  const handleNext = () => {
    setIsSuccess(false);

    if (currentWordIndex < level.words.length - 1) {
      setCurrentWordIndex((prev) => prev + 1);
    } else {
      setTimeout(() => {
        fireConfetti(true);
        alert("Level Complete! Great job! 🎉");
        setCurrentWordIndex(0);
        onLevelComplete();
      }, 500);
    }
  };

  const fireConfetti = (big = false) => {
    if (big) {
      const count = 200;
      const defaults = { origin: { y: 0.7 } };
      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      };
      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    } else {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FF69B4", "#FFD700", "#00BFFF"],
      });
    }
  };

  const speak = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleLetterClick = (char: string, id: string) => {
    if (isSuccess) return;
    soundManager.playSound("pop");
    setSelectedLetters((prev) => [...prev, { id, char }]);
    setAvailableLetters((prev) => prev.filter((l) => l.id !== id));
    setIsWrong(false);
  };

  const handleRemoveLetter = (id: string, idxToRemove: number) => {
    if (isSuccess) return;
    const letterToRemove = selectedLetters[idxToRemove];
    const newSelected = selectedLetters.filter((_, i) => i !== idxToRemove);
    soundManager.playSound("click");
    setSelectedLetters(newSelected);
    setAvailableLetters((prev) => [...prev, letterToRemove]);
  };

  const handleHintClick = () => {
    if (isSuccess || isWrong) return;
    const success = onHint();
    if (success) {
      speak(currentWord.english);
    }
  };

  const checkWord = () => {
    if (successHandledRef.current) return;

    const constructed = selectedLetters.map((l) => l.char).join("");
    const target = currentWord.english.toUpperCase();

    if (constructed === target) {
      setIsSuccess(true);
      soundManager.playSound("success");
      fireConfetti();
      speak(currentWord.english);
      successHandledRef.current = true;
      onComplete(pointsPerAction);
    } else {
      setIsWrong(true);
      soundManager.playSound("fail");
      setTimeout(() => {
        setIsWrong(false);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto p-2 py-4 h-full relative">
      {/* Progress Bar */}
      <div className="w-full h-3 bg-gray-200/50 rounded-full mb-5 shrink-0 overflow-hidden relative shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]">
        <div
          className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full transition-all duration-500 ease-out relative"
          style={{
            width: `${(currentWordIndex / level.words.length) * 100}%`,
          }}
        >
          <div className="absolute top-0 inset-x-0 h-[40%] bg-white/30 rounded-full" />
        </div>
      </div>

      {/* Main Game Content */}
      <div className="flex-1 w-full flex flex-col justify-center space-y-2 md:space-y-4 min-h-0">
        <div className="w-full text-center space-y-2 shrink-0">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
            Spell this word
          </span>
          <h2 className="text-xl md:text-2xl font-black text-gray-700 leading-tight halo-text">
            {currentWord?.korean}
          </h2>
        </div>

        {/* Selected Letters Area (Input) */}
        <div
          className={`
            min-h-[60px] md:min-h-[70px] w-full bg-white/40 rounded-3xl border-2 border-dashed
            flex flex-wrap items-center justify-center gap-2.5 p-3 transition-all duration-300 shrink-0
            shadow-[inset_0_2px_8px_rgba(0,0,0,0.05)]
            ${
              isWrong
                ? "border-red-300 bg-red-50/50 shake ring-2 ring-red-200"
                : "border-gray-200"
            }
            ${
              isSuccess
                ? "border-green-400 bg-green-50/50 scale-[1.02] border-solid ring-4 ring-green-200/50"
                : ""
            }
            ${
              selectedLetters.length > 0 && !isWrong && !isSuccess
                ? "border-blue-300/40 border-solid bg-white/60"
                : ""
            }
        `}
        >
          {selectedLetters.length === 0 && !isSuccess && (
            <span className="text-gray-400 text-sm font-bold opacity-60 animate-pulse">
              Tap letters to spell
            </span>
          )}
          {selectedLetters.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => handleRemoveLetter(item.id, idx)}
              className="relative grow-0"
            >
              <div className="bg-white px-3 py-1.5 md:px-4 md:py-2 rounded-2xl font-bold text-gray-700 jelly-depth-white border border-gray-50 flex items-center justify-center text-sm md:text-base group-hover:bg-red-50 transition-colors">
                <div className="jelly-gloss-layer opacity-40" />
                <span className="relative z-10">{item.char}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar w-full min-h-0 py-2">
          <div className="flex flex-wrap justify-center gap-3 content-start pb-4">
            {availableLetters.map((item) => (
              <button
                key={item.id}
                onClick={() => handleLetterClick(item.char, item.id)}
                className="relative shrink-0"
              >
                <div className="bg-white/90 text-gray-700 font-black py-2.5 px-4 md:py-3 md:px-6 rounded-2xl text-sm md:text-lg border border-white/80 jelly-depth-white flex flex-col items-center">
                  <div className="jelly-gloss-layer opacity-50" />
                  <span className="relative z-10">{item.char}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4 w-full shrink-0 mt-auto pt-3 border-t border-gray-100/50">
        <button
          onClick={handleHintClick}
          className="w-14 h-14 relative jelly-active-click group"
          title="Hint (-20 pts)"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-50 to-yellow-200 border border-white rounded-2xl jelly-depth-yellow">
            <div className="jelly-gloss-layer opacity-60" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-xl pointer-events-none">
            💡
          </div>
        </button>
        <button
          onClick={checkWord}
          disabled={selectedLetters.length === 0}
          className={`flex-1 h-14 relative jelly-active-click group ${
            selectedLetters.length > 0 ? "" : "opacity-60 cursor-not-allowed"
          }`}
        >
          {selectedLetters.length > 0 ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-b from-blue-400 to-blue-600 rounded-2xl border-t border-white/40 jelly-depth-gray shadow-[0_5px_0_#2563eb]">
                <div className="jelly-gloss-layer opacity-50" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center font-black text-white text-lg tracking-wide pointer-events-none">
                CHECK
              </div>
            </>
          ) : (
            <div className="absolute inset-0 bg-gray-200 rounded-2xl border border-gray-300 flex items-center justify-center font-black text-gray-400 text-lg">
              CHECK
            </div>
          )}
        </button>
      </div>

      {/* Success Overlay */}
      {isSuccess && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-xl flex flex-col items-center justify-center p-6 z-40 animate-fade-in space-y-10">
          <div className="relative">
            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 drop-shadow-[0_2px_10px_rgba(16,185,129,0.2)]">
              Correct!
            </h2>
            <div className="absolute -top-6 -right-6 text-4xl animate-bounce-short">
              ✨
            </div>
          </div>

          <div className="relative group">
            <div className="bg-white/80 px-10 py-6 rounded-[2.5rem] border-2 border-white shadow-xl jelly-shadow">
              <div className="jelly-gloss-layer opacity-30" />
              <div className="text-4xl font-black text-gray-700 text-center tracking-[0.2em] relative z-10">
                {currentWord.english.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full max-w-xs">
            <button
              onClick={handleNext}
              className="w-full h-16 relative jelly-active-click group"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-green-400 to-emerald-600 rounded-3xl border border-white/30 shadow-[0_8px_0_#059669]">
                <div className="jelly-gloss-layer opacity-40" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center gap-3 pointer-events-none">
                <span className="text-xl font-black text-white drop-shadow-md">
                  NEXT WORD
                </span>
                <span className="text-2xl">➡️</span>
              </div>
            </button>
          </div>

          <button
            onClick={() => speak(currentWord.english)}
            className="text-gray-400 text-sm hover:text-gray-600 underline"
          >
            Hear it again 🔊
          </button>
        </div>
      )}
    </div>
  );
}
