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
      <div className="w-full h-2 bg-gray-200 rounded-full mb-5 shrink-0 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${(currentWordIndex / level.words.length) * 100}%`,
          }}
        />
      </div>

      {/* Main Game Content */}
      <div className="flex-1 w-full flex flex-col justify-center space-y-2 md:space-y-4 min-h-0 overflow-hidden">
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
            min-h-[60px] md:min-h-[70px] w-full bg-white/50 rounded-2xl border-2 border-dashed
            flex flex-wrap items-center justify-center gap-2 p-3 transition-all duration-300 shrink-0
            ${
              isWrong
                ? "border-red-300 bg-red-50/50 shake ring-2 ring-red-200"
                : "border-gray-300"
            }
            ${
              isSuccess
                ? "border-green-400 bg-green-50/50 scale-105 border-solid ring-4 ring-green-200/50"
                : ""
            }
            ${
              selectedLetters.length > 0 && !isWrong && !isSuccess
                ? "border-blue-300 border-solid bg-white/80"
                : ""
            }
        `}
        >
          {selectedLetters.length === 0 && !isSuccess && (
            <span className="text-gray-400 text-sm font-medium animate-pulse">
              Tap letters to spell
            </span>
          )}
          {selectedLetters.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => handleRemoveLetter(item.id, idx)}
              className="bg-white shadow-sm px-2 py-1 md:px-3 md:py-1.5 rounded-xl font-bold text-gray-700 animate-pop-in border border-gray-100 hover:bg-red-50 transition-colors text-sm md:text-base"
            >
              {item.char}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar w-full min-h-0">
          <div className="flex flex-wrap justify-center gap-2 content-start pb-2">
            {availableLetters.map((item) => (
              <button
                key={item.id}
                onClick={() => handleLetterClick(item.char, item.id)}
                className="
                  bg-white hover:bg-gray-50 text-gray-600 font-bold py-1.5 px-2.5 md:py-2 md:px-4 rounded-xl md:rounded-2xl text-xs md:text-sm 
                  shadow-[0_2px_0_0_rgba(0,0,0,0.1)] border-2 border-transparent hover:border-blue-100
                  active:translate-y-[2px] active:shadow-none transition-all
                  flex items-center justify-center
                "
              >
                {item.char}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-3 w-full shrink-0 mt-auto pt-1 border-t border-gray-100/50">
        <button
          onClick={handleHintClick}
          className="w-14 h-14 flex items-center justify-center rounded-2xl bg-yellow-100 text-yellow-500 hover:bg-yellow-200 hover:text-yellow-600 transition-colors border-2 border-yellow-200"
          title="Hint (-20 pts)"
        >
          💡
        </button>
        <button
          onClick={checkWord}
          disabled={selectedLetters.length === 0}
          className={`flex-1 h-14 rounded-2xl font-black text-white shadow-lg transition-all active:scale-95 text-lg tracking-wide flex items-center justify-center gap-2 ${
            selectedLetters.length > 0
              ? "bg-gradient-to-r from-blue-500 to-cyan-500 shadow-blue-200 hover:shadow-blue-300"
              : "bg-gray-200 text-gray-400 shadow-none cursor-not-allowed"
          }`}
        >
          CHECK
        </button>
      </div>

      {/* Success Overlay */}
      {isSuccess && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 z-40 animate-fade-in space-y-8">
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 drop-shadow-sm">
            Correct!
          </h2>

          <div className="text-3xl font-black text-gray-700 text-center tracking-widest">
            {currentWord.english.toUpperCase()}
          </div>

          <div className="flex gap-4 w-full max-w-xs">
            <button
              onClick={handleNext}
              className="flex-1 h-20 rounded-2xl font-bold text-white shadow-xl transition-all active:scale-95 bg-gradient-to-b from-green-400 to-green-600 shadow-green-200 flex flex-col items-center justify-center gap-1"
            >
              <span className="text-3xl">➡️</span>
              <span className="text-sm">Next Word</span>
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
