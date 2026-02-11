// Daily statistics tracking utility
// Tracks how many problems the user solved today

const STORAGE_KEY = "wordrobe_daily_stats";

export interface DailyStats {
  date: string; // YYYY-MM-DD format
  problemsSolved: number;
  sentencesCompleted: number;
  wordsCompleted: number;
  listeningCompleted: number;
}

// Get today's date in YYYY-MM-DD format (local time)
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Get today's stats from localStorage
export function getTodayStats(): DailyStats {
  if (typeof window === "undefined") {
    return {
      date: getTodayDateString(),
      problemsSolved: 0,
      sentencesCompleted: 0,
      wordsCompleted: 0,
      listeningCompleted: 0,
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        date: getTodayDateString(),
        problemsSolved: 0,
        sentencesCompleted: 0,
        wordsCompleted: 0,
        listeningCompleted: 0,
      };
    }

    const stats = JSON.parse(stored) as DailyStats;
    const today = getTodayDateString();

    // If the stored date is not today, reset the stats
    if (stats.date !== today) {
      return {
        date: today,
        problemsSolved: 0,
        sentencesCompleted: 0,
        wordsCompleted: 0,
        listeningCompleted: 0,
      };
    }

    return stats;
  } catch (error) {
    console.error("Error reading daily stats:", error);
    return {
      date: getTodayDateString(),
      problemsSolved: 0,
      sentencesCompleted: 0,
      wordsCompleted: 0,
      listeningCompleted: 0,
    };
  }
}

// Save stats to localStorage
function saveStats(stats: DailyStats): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    // Dispatch custom event so components can listen to updates
    window.dispatchEvent(
      new CustomEvent("dailyStatsUpdated", { detail: stats }),
    );
  } catch (error) {
    console.error("Error saving daily stats:", error);
  }
}

// Increment a specific stat
export function incrementStat(type: "sentence" | "word" | "listening"): void {
  const stats = getTodayStats();
  stats.problemsSolved += 1;

  if (type === "sentence") {
    stats.sentencesCompleted += 1;
  } else if (type === "word") {
    stats.wordsCompleted += 1;
  } else if (type === "listening") {
    stats.listeningCompleted += 1;
  }

  saveStats(stats);
}

// Reset today's stats (useful for testing)
export function resetTodayStats(): void {
  const stats: DailyStats = {
    date: getTodayDateString(),
    problemsSolved: 0,
    sentencesCompleted: 0,
    wordsCompleted: 0,
    listeningCompleted: 0,
  };
  saveStats(stats);
}
