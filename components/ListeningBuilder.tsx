"use client";

import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { soundManager } from "@/utils/SoundManager";
import { incrementStat } from "@/utils/dailyStats";

interface Sentence {
  korean: string;
  english: string[];
}

interface LevelData {
  id: number;
  description: string;
  sentences: Sentence[];
}

interface ListeningBuilderProps {
  level: LevelData;
  onComplete: (points: number) => void;
  onLevelComplete: () => void;
  onHint: () => boolean;
}

// Define SpeechRecognition types
interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

export default function ListeningBuilder({
  level,
  onComplete,
  onLevelComplete,
}: ListeningBuilderProps) {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<
    { id: string; text: string }[]
  >([]);
  const [isWrong, setIsWrong] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const successHandledRef = useRef(false);

  // STT State
  const [isListening, setIsListening] = useState(false);
  const [sttResult, setSttResult] = useState<string | null>(null);
  const [sttFeedback, setSttFeedback] = useState<
    "perfect" | "try_again" | null
  >(null);
  const [bonusAwarded, setBonusAwarded] = useState(false);

  const currentSentence = level.sentences[currentSentenceIndex];
  const hasPlayedRef = useRef(false);

  // Scoring Logic Helper
  const getPointsForLevel = (levelId: number) => {
    if (levelId <= 3) return 10;
    if (levelId <= 7) return 20;
    return 30;
  };

  const pointsPerAction = getPointsForLevel(level.id);

  // Reset sentence index when level changes
  useEffect(() => {
    setCurrentSentenceIndex(0);
  }, [level.id]);

  // Init Sentence
  useEffect(() => {
    const currentSentence = level.sentences[currentSentenceIndex];
    if (currentSentence) {
      const words = currentSentence.english.map((word, idx) => ({
        id: `${word}-${idx}-${Date.now()}`,
        text: word,
      }));
      setAvailableWords([...words].sort(() => Math.random() - 0.5));
      setSelectedWords([]);
      setIsWrong(false);
      setIsSuccess(false);
      setSttResult(null);
      setSttFeedback(null);
      setBonusAwarded(false);
      successHandledRef.current = false;
      hasPlayedRef.current = false;

      // Auto-play sound on start (only once per sentence)
      setTimeout(() => {
        if (!hasPlayedRef.current) {
          speak(currentSentence.english.join(" "));
          hasPlayedRef.current = true;
        }
      }, 500);
    }
  }, [currentSentenceIndex, level]);

  const handleNext = () => {
    soundManager.playSound("click");
    setIsSuccess(false);
    if (currentSentenceIndex < level.sentences.length - 1) {
      setCurrentSentenceIndex((prev) => prev + 1);
    } else {
      setTimeout(() => {
        fireConfetti(true);
        alert("레벨 완료! 참 잘했어요! 🎉");
        setCurrentSentenceIndex(0);
        onLevelComplete();
      }, 100);
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
        colors: ["#6366f1", "#FFD700", "#00BFFF"], // Indigo base
      });
    }
  };

  const speak = async (text: string, rate: number = 1.0) => {
    if (typeof window === "undefined") return;

    try {
      const { TextToSpeech } = await import(
        "@capacitor-community/text-to-speech"
      );
      await TextToSpeech.speak({
        text: text,
        lang: "en-US",
        rate: rate,
        pitch: 1.0,
        volume: 1.0,
        category: "ambient",
      });
    } catch {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = rate;
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const handleListen = () => {
    soundManager.playSound("click");
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      alert("이 브라우저에서는 음성 인식을 지원하지 않습니다.");
      return;
    }

    const SpeechRecognitionConstructor =
      (window as unknown as { SpeechRecognition: new () => SpeechRecognition })
        .SpeechRecognition ||
      (
        window as unknown as {
          webkitSpeechRecognition: new () => SpeechRecognition;
        }
      ).webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) return;

    const recognition = new SpeechRecognitionConstructor();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    setSttFeedback(null);
    setSttResult(null);

    recognition.start();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSttResult(transcript);

      const targetRaw = currentSentence.english.join(" ").toLowerCase();
      const spokenRaw = transcript.toLowerCase();

      const targetWords = targetRaw.replace(/[.,!?]/g, "").split(/\s+/);
      const spokenWords = spokenRaw.replace(/[.,!?]/g, "").split(/\s+/);

      let matchCount = 0;
      targetWords.forEach((w) => {
        if (spokenWords.includes(w)) matchCount++;
      });

      const accuracy = matchCount / targetWords.length;
      const isMatch = accuracy >= 0.6; // 60% match required

      if (isMatch || spokenRaw.includes(targetRaw.replace(/[.,!?]/g, ""))) {
        setSttFeedback("perfect");
        fireConfetti();
        speak(`Excellent! +${pointsPerAction} Points`);

        if (!bonusAwarded) {
          onComplete(pointsPerAction);
          setBonusAwarded(true);
          setTimeout(() => {
            handleNext();
          }, 2000);
        }
      } else {
        setSttFeedback("try_again");
      }
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setSttFeedback("try_again");
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const handleWordClick = (wordText: string, wordId: string) => {
    if (isSuccess) return;
    soundManager.playSound("pop", 0.9);
    setSelectedWords((prev) => [...prev, wordText]);
    setAvailableWords((prev) => prev.filter((w) => w.id !== wordId));
    setIsWrong(false);
  };

  const handleRemoveWord = (wordText: string, idxToRemove: number) => {
    if (isSuccess) return;
    const newSelected = selectedWords.filter((_, i) => i !== idxToRemove);
    soundManager.playSound("pop", 0.8);
    setSelectedWords(newSelected);
    setAvailableWords((prev) => [
      ...prev,
      { id: `${wordText}-${Date.now()}`, text: wordText },
    ]);
  };

  const checkSentence = () => {
    if (successHandledRef.current) return;
    const constructed = selectedWords.join(" ");
    const target = currentSentence.english.join(" ");

    if (constructed === target) {
      setIsSuccess(true);
      soundManager.playSound("success");
      fireConfetti();
      speak(target);
      successHandledRef.current = true;
      incrementStat("listening"); // Track daily stats
    } else {
      setIsWrong(true);
      soundManager.playSound("fail", 0.3);
      setTimeout(() => setIsWrong(false), 1000);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto p-2 py-4 h-full relative">
      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full mb-8 shrink-0 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${(currentSentenceIndex / level.sentences.length) * 100}%`,
          }}
        />
      </div>

      <div className="flex-1 w-full flex flex-col items-center space-y-3 min-h-0">
        <div className="text-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block leading-none mb-1">
            Listen and build
          </span>
          <h2 className="text-base md:text-lg font-black text-gray-700 leading-tight">
            무엇을 들었나요?
          </h2>
        </div>

        {/* Selected Words Area - Fixed height to avoid jumping */}
        <div
          className={`
            min-h-[70px] md:min-h-[80px] w-full bg-white/30 rounded-2xl border-2 border-dashed
            flex flex-wrap items-center justify-center gap-1.5 p-2 transition-all duration-300
            shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]
            ${
              isWrong
                ? "border-red-300 bg-red-50/50 shake ring-1 ring-red-200"
                : "border-gray-200"
            }
            ${
              isSuccess
                ? "border-green-400 bg-green-50/50 scale-[1.01] border-solid"
                : ""
            }
          `}
        >
          {selectedWords.length === 0 && !isSuccess && (
            <span className="text-gray-400 text-xs font-bold opacity-60 animate-pulse text-center px-2">
              들리는 단어를 선택하세요
            </span>
          )}
          {selectedWords.map((word, idx) => (
            <button
              key={idx}
              onClick={() => handleRemoveWord(word, idx)}
              className="relative"
            >
              <div className="bg-white px-2.5 py-1.5 rounded-lg font-bold text-gray-700 jelly-depth-white border border-gray-50 text-xs md:text-sm">
                <div className="jelly-gloss-layer opacity-40" />
                {word}
              </div>
            </button>
          ))}
        </div>

        {/* Available Words - Force minimum visibility */}
        <div className="flex-1 overflow-y-auto custom-scrollbar w-full py-1 min-h-[140px]">
          <div className="flex flex-wrap justify-center gap-2 content-start pb-4">
            {availableWords.map((word) => (
              <button
                key={word.id}
                onClick={() => handleWordClick(word.text, word.id)}
                className="relative shrink-0"
              >
                <div className="bg-white/95 text-gray-700 font-bold py-2 px-3.5 rounded-xl border border-white/80 jelly-depth-white text-sm md:text-base">
                  <div className="jelly-gloss-layer opacity-40" />
                  {word.text}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="flex gap-3 w-full pt-4 pb-6 border-t border-gray-100/50 mt-auto">
        {/* <button
          onClick={() => speak(currentSentence.english.join(" "), 1.0)}
          className="w-12 h-12 relative jelly-active-click group"
          title="Play Audio"
        >
          <div className="absolute inset-0 bg-indigo-500 border border-white/20 rounded-2xl jelly-depth-indigo">
            <div className="jelly-gloss-layer" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-xl pointer-events-none">
            🔊
          </div>
        </button> */}

        <button
          onClick={() => speak(currentSentence.english.join(" "), 0.67)}
          className="w-12 h-12 relative jelly-active-click group"
          title="Hint (Slower)"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-50 to-yellow-200 border border-white/20 rounded-2xl jelly-depth-yellow">
            <div className="jelly-gloss-layer" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-xl pointer-events-none">
            💡
          </div>
        </button>

        <button
          onClick={checkSentence}
          disabled={selectedWords.length === 0}
          className={`flex-1 h-12 relative jelly-active-click group ${
            selectedWords.length > 0 ? "" : "opacity-60 cursor-not-allowed"
          }`}
        >
          {selectedWords.length > 0 ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-2xl border-t border-white/40 jelly-depth-indigo">
                <div className="jelly-gloss-layer opacity-50" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center font-black text-white text-lg tracking-wide pointer-events-none uppercase">
                CHECK
              </div>
            </>
          ) : (
            <div className="absolute inset-0 bg-gray-200 rounded-2xl border border-gray-300 flex items-center justify-center font-black text-gray-400 text-lg uppercase">
              CHECK
            </div>
          )}
        </button>
      </div>

      {/* Success Modal with Speaking Integration */}
      {isSuccess && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 z-40 animate-fade-in space-y-6">
          <h2 className="text-3xl font-black text-indigo-600 drop-shadow-sm">
            정답입니다!
          </h2>
          <div className="text-2xl font-bold text-gray-700 text-center">
            {currentSentence.english.join(" ")}
          </div>
          <div className="text-lg text-gray-400 font-medium">
            {currentSentence.korean}
          </div>

          {/* STT Feedback Display */}
          <div className="h-12 flex items-center justify-center">
            {isListening && (
              <span className="text-indigo-500 font-bold animate-pulse text-lg">
                듣고 있어요... 🎙️
              </span>
            )}
            {sttFeedback === "perfect" && (
              <span className="text-green-500 font-bold text-xl scale-110 transition-transform">
                참 잘했어요! +{pointsPerAction} 🌟
              </span>
            )}
            {sttFeedback === "try_again" && (
              <div className="text-center animate-bounce-short">
                <span className="text-orange-400 font-bold block">
                  다시 한번 말해볼까요?
                </span>
                <span className="text-xs text-gray-400 line-clamp-1 italic">
                  &quot;{sttResult}&quot;
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-4 w-full max-w-xs">
            {/* Mic Button */}
            <button
              onClick={handleListen}
              disabled={isListening || bonusAwarded}
              className={`
                flex-1 h-16 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95 flex flex-col items-center justify-center gap-1 relative overflow-hidden
                ${
                  isListening
                    ? "bg-gray-400 cursor-wait"
                    : bonusAwarded
                    ? "bg-green-500 opacity-60"
                    : "bg-gradient-to-b from-blue-400 to-blue-600 shadow-blue-200"
                }
              `}
            >
              {!isListening && !bonusAwarded && (
                <div className="jelly-gloss-layer opacity-30" />
              )}
              <span className="text-2xl">🎤</span>
              <span className="text-xs uppercase">Speak</span>
            </button>

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={!bonusAwarded}
              className={`
                flex-1 h-16 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95 flex flex-col items-center justify-center gap-1
                ${
                  bonusAwarded
                    ? "bg-gradient-to-b from-green-400 to-green-600 shadow-green-200"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }
              `}
            >
              {bonusAwarded && <div className="jelly-gloss-layer opacity-30" />}
              <span className="text-2xl">➡️</span>
              <span className="text-xs uppercase">Next</span>
            </button>
          </div>

          <button
            onClick={() => {
              soundManager.playSound("click");
              speak(currentSentence.english.join(" "));
            }}
            className="text-gray-400 text-sm hover:text-indigo-600 underline flex items-center gap-1"
          >
            <span>다시 듣기</span> 🔊
          </button>
        </div>
      )}

      <style jsx>{`
        .jelly-depth-indigo {
          box-shadow: 0 6px 0 #4338ca;
        }
        .jelly-depth-blue {
          box-shadow: 0 4px 0 #2563eb;
        }
        .jelly-depth-white {
          box-shadow: 0 4px 0 #e5e7eb;
        }
        @keyframes bounce-short {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        .animate-bounce-short {
          animation: bounce-short 0.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
