import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti"; // Import confetti
import { soundManager } from "@/utils/SoundManager";

// Define SpeechRecognition types locally since they are not standard in all TS environments yet
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

interface Sentence {
  korean: string;
  english: string[];
}

interface LevelData {
  id: number;
  description: string;
  sentences: Sentence[];
}

interface SentenceBuilderProps {
  level: LevelData;
  onComplete: (points: number) => void;
  onLevelComplete: () => void;
  onHint: () => boolean;
}

export default function SentenceBuilder({
  level,
  onComplete,
  onLevelComplete,
  onHint,
}: SentenceBuilderProps) {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<
    { id: string; text: string }[]
  >([]);
  const [isWrong, setIsWrong] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // STT State
  const [isListening, setIsListening] = useState(false);
  const [sttResult, setSttResult] = useState<string | null>(null);
  const [sttFeedback, setSttFeedback] = useState<
    "perfect" | "try_again" | null
  >(null);
  const [bonusAwarded, setBonusAwarded] = useState(false);

  const successHandledRef = useRef(false);

  const currentSentence = level.sentences[currentSentenceIndex];

  // Scoring Logic Helper
  const getPointsForLevel = (levelId: number) => {
    if (levelId <= 3) return 10;
    if (levelId <= 7) return 20;
    return 30; // Levels 8-10+
  };

  const pointsPerAction = getPointsForLevel(level.id);

  // Init Sentence
  useEffect(() => {
    const currentSentence = level.sentences[currentSentenceIndex];
    if (currentSentence) {
      const words = currentSentence.english.map((word, idx) => ({
        id: `${word}-${idx}`,
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
    }
  }, [currentSentenceIndex, level]);

  const handleNext = () => {
    setIsSuccess(false);

    if (currentSentenceIndex < level.sentences.length - 1) {
      setCurrentSentenceIndex((prev) => prev + 1);
    } else {
      setTimeout(() => {
        fireConfetti(true); // Big confetti for level clear
        alert("Level Complete! Great job! 🎉");
        setCurrentSentenceIndex(0);
        onLevelComplete();
      }, 100);
    }
  };

  // Confetti Helper
  const fireConfetti = (big = false) => {
    if (big) {
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
      };

      function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });
      fire(0.2, {
        spread: 60,
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    } else {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FF69B4", "#FFD700", "#00BFFF"], // Pink, Gold, Blue
      });
    }
  };

  const speak = async (text: string) => {
    if (typeof window === "undefined") return;

    try {
      const { TextToSpeech } = await import(
        "@capacitor-community/text-to-speech"
      );

      await TextToSpeech.speak({
        text: text,
        lang: "en-US",
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
        category: "ambient",
      });
    } catch {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      } else {
        console.warn("Speech Synthesis not supported");
      }
    }
  };

  const handleListen = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      alert(
        "Speech recognition is not supported in this browser. Try Chrome or Safari.",
      );
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

        // Trigger bonus confetti
        fireConfetti();

        speak(`Perfect! +${pointsPerAction} Points`);

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

  const handleHintClick = () => {
    if (isSuccess || isWrong) return;
    const success = onHint();
    if (success) {
      const target = currentSentence.english.join(" ");
      speak(target);
    }
  };

  const handleWordClick = (wordText: string, wordId: string) => {
    if (isSuccess) return;
    soundManager.playSound("pop");
    setSelectedWords((prev) => [...prev, wordText]);
    setAvailableWords((prev) => prev.filter((w) => w.id !== wordId));
    setIsWrong(false);
  };

  const handleReset = () => {
    if (isSuccess) return;
    const rehydratedWords = currentSentence.english.map((word, idx) => ({
      id: `${word}-${idx}`,
      text: word,
    }));
    setAvailableWords([...rehydratedWords].sort(() => Math.random() - 0.5));
    setSelectedWords([]);
  };

  const handleRemoveWord = (wordText: string, idxToRemove: number) => {
    if (isSuccess) return;
    const newSelected = selectedWords.filter((_, i) => i !== idxToRemove);
    soundManager.playSound("click");
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

      // Fire Confetti!
      fireConfetti();

      speak(target);
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
          className="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${(currentSentenceIndex / level.sentences.length) * 100}%`,
          }}
        />
      </div>

      {/* Main Game Content */}
      <div className="flex-1 w-full flex flex-col justify-center space-y-1 md:space-y-2 min-h-0 overflow-hidden">
        <div className="w-full text-center space-y-1 shrink-0">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
            Translate this
          </span>
          <h2 className="text-lg md:text-2xl font-black text-gray-700 leading-tight halo-text break-keep">
            {currentSentence?.korean}
          </h2>
        </div>

        <div
          className={`
            min-h-[50px] md:min-h-[70px] w-full bg-white/50 rounded-2xl border-2 border-dashed
            flex flex-wrap items-center justify-center gap-2 p-2 transition-all duration-300 shrink-0
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
              selectedWords.length > 0 && !isWrong && !isSuccess
                ? "border-pink-300 border-solid bg-white/80"
                : ""
            }
        `}
        >
          {selectedWords.length === 0 && !isSuccess && (
            <span className="text-gray-400 text-sm font-medium animate-pulse">
              Tap words to build sentence
            </span>
          )}
          {selectedWords.map((word, idx) => (
            <button
              key={idx}
              onClick={() => handleRemoveWord(word, idx)}
              className="bg-white shadow-sm px-2 py-1 md:px-3 md:py-1.5 rounded-xl font-bold text-gray-700 animate-pop-in border border-gray-100 hover:bg-red-50 transition-colors text-sm md:text-base"
            >
              {word}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar w-full min-h-0">
          <div className="flex flex-wrap justify-center gap-2 content-start pb-2">
            {availableWords.map((word) => (
              <button
                key={word.id}
                onClick={() => handleWordClick(word.text, word.id)}
                className="
                  bg-white hover:bg-gray-50 text-gray-600 font-bold py-1.5 px-2.5 md:py-2 md:px-4 rounded-xl md:rounded-2xl text-xs md:text-sm 
                  shadow-[0_2px_0_0_rgba(0,0,0,0.1)] border-2 border-transparent hover:border-pink-100
                  active:translate-y-[2px] active:shadow-none transition-all
                "
              >
                {word.text}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 w-full shrink-0 mt-auto pt-1 border-t border-gray-100/50">
        <button
          onClick={handleReset}
          className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
          title="Reset"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
        <button
          onClick={handleHintClick}
          className="w-14 h-14 flex items-center justify-center rounded-2xl bg-yellow-100 text-yellow-500 hover:bg-yellow-200 hover:text-yellow-600 transition-colors border-2 border-yellow-200"
          title="Hint (-20 pts)"
        >
          💡
        </button>
        <button
          onClick={checkSentence}
          disabled={selectedWords.length === 0}
          className={`flex-1 h-14 rounded-2xl font-black text-white shadow-lg transition-all active:scale-95 text-lg tracking-wide flex items-center justify-center gap-2 ${
            selectedWords.length > 0
              ? "bg-gradient-to-r from-pink-500 to-purple-500 shadow-pink-200 hover:shadow-pink-300"
              : "bg-gray-200 text-gray-400 shadow-none cursor-not-allowed"
          }`}
        >
          CHECK
        </button>
      </div>

      {/* Success Actions (STT & Next) - Replaces Controls when success */}
      {isSuccess && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 z-40 animate-fade-in space-y-8">
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 drop-shadow-sm">
            Correct!
          </h2>

          <div className="text-xl font-medium text-gray-700 text-center">
            {currentSentence.english.join(" ")}
          </div>

          {/* STT Feedback Display */}
          <div className="h-12 flex items-center justify-center">
            {isListening && (
              <span className="text-pink-500 font-bold animate-pulse">
                Listening... 🎙️
              </span>
            )}
            {sttFeedback === "perfect" && (
              <span className="text-green-500 font-bold text-xl">
                Perfect! +{pointsPerAction} Points 🌟
              </span>
            )}
            {sttFeedback === "try_again" && (
              <div className="text-center">
                <span className="text-orange-400 font-bold block">
                  Try again!
                </span>
                <span className="text-sm text-gray-400">
                  You said: &quot;{sttResult}&quot;
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-4 w-full max-w-xs">
            {/* Mic Button */}
            <button
              onClick={handleListen}
              disabled={isListening}
              className={`
                 flex-1 h-16 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95 flex flex-col items-center justify-center gap-1
                 ${
                   isListening
                     ? "bg-gray-400 cursor-wait"
                     : "bg-gradient-to-b from-blue-400 to-blue-600 shadow-blue-200"
                 }
               `}
            >
              <span className="text-2xl">🎤</span>
              <span className="text-xs">Practice</span>
            </button>

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="flex-1 h-16 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95 bg-gradient-to-b from-green-400 to-green-600 shadow-green-200 flex flex-col items-center justify-center gap-1"
            >
              <span className="text-2xl">➡️</span>
              <span className="text-xs">Next</span>
            </button>
          </div>

          <button
            onClick={() => speak(currentSentence.english.join(" "))}
            className="text-gray-400 text-sm hover:text-gray-600 underline"
          >
            Hear it again 🔊
          </button>
        </div>
      )}
    </div>
  );
}
