import { parseCSV } from "../utils/csvParser";
import { getAssetPath } from "../utils/paths";

export interface Word {
  id: string;
  text: string;
}

export interface Level {
  id: number;
  description: string;
  sentences: {
    korean: string;
    english: string[]; // Correct order
  }[];
}

export interface ShopItem {
  id: string;
  name?: string;
  type: "avatar" | "background";
  cost: number;
  imagePath: string; // Restored path logic
  style?: React.CSSProperties; // Custom positioning
}

export interface Sentence {
  korean: string;
  english: string | string[];
}

export interface WordData {
  id: string;
  text: string;
}

export interface VocabLevel {
  id: number;
  description: string;
  words: { korean: string; english: string }[];
}

// 🔴 TODO: Replace this with your own Google Sheet "Published to Web" CSV link
// Example: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ.../pub?output=csv"
export const GOOGLE_SHEET_URL = "";

export const fetchSentences = async (): Promise<Sentence[] | null> => {
  if (!GOOGLE_SHEET_URL) return null;

  try {
    const response = await fetch(GOOGLE_SHEET_URL);
    if (!response.ok) throw new Error("Network response was not ok");

    const text = await response.text();
    const data = parseCSV(text);

    // Map CSV columns to our Sentence structure
    // We look for 'korean' and 'english' headers (case-insensitive)
    return data
      .map((row) => ({
        korean: row["korean"] || Object.values(row)[0], // Fallback to 1st col
        english: row["english"] || Object.values(row)[1], // Fallback to 2nd col
      }))
      .filter((s) => s.korean && s.english);
  } catch (error) {
    console.warn(
      "Failed to fetch from Google Sheet, falling back to local data.",
      error,
    );
    return null;
  }
};

export const LEVELS: Level[] = [
  {
    id: 1,
    description: "Level 1: Basic Greetings & Introductions",
    sentences: [
      { korean: "나는 학생입니다.", english: ["I", "am", "a", "student"] },
      { korean: "만나서 반가워요 :)", english: ["Nice", "to", "meet", "you"] },
      { korean: "이것은 사과입니다.", english: ["This", "is", "an", "apple"] },
      { korean: "안녕하세요!", english: ["Hello"] },
      { korean: "저는 김민수입니다.", english: ["I", "am", "Minsu", "Kim"] },
      {
        korean: "오늘은 좋은 날입니다.",
        english: ["Today", "is", "a", "good", "day"],
      },
      { korean: "고맙습니다.", english: ["Thank", "you"] },
      { korean: "실례합니다.", english: ["Excuse", "me"] },
      { korean: "미안합니다.", english: ["I", "am", "sorry"] },
      { korean: "안녕히 가세요.", english: ["Goodbye"] },
    ],
  },
  {
    id: 2,
    description: "Level 2: Simple Actions",
    sentences: [
      {
        korean: "그녀는 책을 읽습니다.",
        english: ["She", "reads", "a", "book"],
      },
      {
        korean: "우리는 학교에 갑니다.",
        english: ["We", "go", "to", "school"],
      },
      { korean: "그는 피자를 좋아합니다.", english: ["He", "likes", "pizza"] },
      { korean: "나는 물을 마십니다.", english: ["I", "drink", "water"] },
      { korean: "그들은 축구를 합니다.", english: ["They", "play", "soccer"] },
      { korean: "고양이가 잡니다.", english: ["The", "cat", "sleeps"] },
      {
        korean: "선생님이 가르칩니다.",
        english: ["The", "teacher", "teaches"],
      },
      {
        korean: "나는 음악을 듣습니다.",
        english: ["I", "listen", "to", "music"],
      },
      { korean: "그녀는 춤을 춥니다.", english: ["She", "dances"] },
      { korean: "우리는 점심을 먹습니다.", english: ["We", "eat", "lunch"] },
    ],
  },
  {
    id: 3,
    description: "Level 3: Questions",
    sentences: [
      {
        korean: "지금 몇 시인가요?",
        english: ["What", "time", "is", "it", "now"],
      },
      { korean: "어디에 사시나요?", english: ["Where", "do", "you", "live"] },
      {
        korean: "영어를 할 수 있나요?",
        english: ["Can", "you", "speak", "English"],
      },
      { korean: "이름이 무엇인가요?", english: ["What", "is", "your", "name"] },
      {
        korean: "얼마나 오래 걸리나요?",
        english: ["How", "long", "does", "it", "take"],
      },
      {
        korean: "누구와 함께 가나요?",
        english: ["Who", "are", "you", "going", "with"],
      },
      { korean: "왜 늦었나요?", english: ["Why", "are", "you", "late"] },
      { korean: "어떻게 지내세요?", english: ["How", "are", "you"] },
      { korean: "언제 출발하나요?", english: ["When", "do", "you", "leave"] },
      {
        korean: "어느 것을 선택하시겠어요?",
        english: ["Which", "one", "will", "you", "choose"],
      },
    ],
  },
  {
    id: 4,
    description: "Level 4: Past Tense",
    sentences: [
      {
        korean: "나는 어제 공부를 했습니다.",
        english: ["I", "studied", "yesterday"],
      },
      {
        korean: "그들은 공원에 갔습니다.",
        english: ["They", "went", "to", "the", "park"],
      },
      { korean: "그녀는 행복했습니다.", english: ["She", "was", "happy"] },
      {
        korean: "우리는 영화를 봤습니다.",
        english: ["We", "watched", "a", "movie"],
      },
      {
        korean: "그는 친구를 만났습니다.",
        english: ["He", "met", "his", "friend"],
      },
      { korean: "나는 아침을 먹었습니다.", english: ["I", "ate", "breakfast"] },
      { korean: "비가 왔습니다.", english: ["It", "rained"] },
      {
        korean: "그들은 노래를 불렀습니다.",
        english: ["They", "sang", "a", "song"],
      },
      { korean: "나는 집에 있었습니다.", english: ["I", "was", "at", "home"] },
      {
        korean: "그녀는 책을 샀습니다.",
        english: ["She", "bought", "a", "book"],
      },
    ],
  },
  {
    id: 5,
    description: "Level 5: Complex Sentences",
    sentences: [
      {
        korean: "비가 와서 나는 집에 있었습니다.",
        english: ["I", "stayed", "home", "because", "it", "rained"],
      },
      {
        korean: "내가 가장 좋아하는 색은 파란색입니다.",
        english: ["My", "favorite", "color", "is", "blue"],
      },
      {
        korean: "내일 친구를 만날 것입니다.",
        english: ["I", "will", "meet", "my", "friend", "tomorrow"],
      },
      {
        korean: "나는 피곤해서 일찍 잤습니다.",
        english: [
          "I",
          "went",
          "to",
          "bed",
          "early",
          "because",
          "I",
          "was",
          "tired",
        ],
      },
      {
        korean: "그는 운동을 좋아하지만 게으릅니다.",
        english: ["He", "likes", "sports", "but", "he", "is", "lazy"],
      },
      {
        korean: "우리는 한국어와 영어를 배웁니다.",
        english: ["We", "learn", "Korean", "and", "English"],
      },
      {
        korean: "나는 의사가 되고 싶습니다.",
        english: ["I", "want", "to", "be", "a", "doctor"],
      },
      {
        korean: "그녀는 노래를 잘 부릅니다.",
        english: ["She", "sings", "very", "well"],
      },
      {
        korean: "날씨가 좋으면 산책할 거예요.",
        english: [
          "If",
          "the",
          "weather",
          "is",
          "nice",
          "I",
          "will",
          "take",
          "a",
          "walk",
        ],
      },
      {
        korean: "나는 책을 읽는 것을 좋아합니다.",
        english: ["I", "like", "reading", "books"],
      },
    ],
  },
  {
    id: 6,
    description: "Level 6: Daily Conversations",
    sentences: [
      {
        korean: "저는 매일 아침 7시에 일어납니다.",
        english: ["I", "wake", "up", "at", "seven", "every", "morning"],
      },
      {
        korean: "학교까지 걸어서 20분 걸립니다.",
        english: [
          "It",
          "takes",
          "twenty",
          "minutes",
          "to",
          "walk",
          "to",
          "school",
        ],
      },
      {
        korean: "주말에 보통 무엇을 하나요?",
        english: ["What", "do", "you", "usually", "do", "on", "weekends"],
      },
      {
        korean: "저는 수학을 공부하고 있습니다.",
        english: ["I", "am", "studying", "math"],
      },
      {
        korean: "오늘 날씨가 정말 좋네요.",
        english: ["The", "weather", "is", "really", "nice", "today"],
      },
      {
        korean: "점심으로 무엇을 먹을까요?",
        english: ["What", "should", "we", "eat", "for", "lunch"],
      },
      {
        korean: "저는 커피보다 차를 더 좋아합니다.",
        english: ["I", "prefer", "tea", "to", "coffee"],
      },
      {
        korean: "숙제를 다 끝냈어요.",
        english: ["I", "have", "finished", "my", "homework"],
      },
      {
        korean: "내일 시험이 있습니다.",
        english: ["I", "have", "a", "test", "tomorrow"],
      },
      { korean: "지금 바쁜가요?", english: ["Are", "you", "busy", "now"] },
    ],
  },
  {
    id: 7,
    description: "Level 7: Expressing Opinions",
    sentences: [
      {
        korean: "제 생각에는 그게 좋은 아이디어입니다.",
        english: ["I", "think", "that", "is", "a", "good", "idea"],
      },
      {
        korean: "저는 그 영화가 재미있다고 생각합니다.",
        english: ["I", "think", "the", "movie", "is", "interesting"],
      },
      {
        korean: "스포츠를 하는 것은 건강에 좋습니다.",
        english: ["Playing", "sports", "is", "good", "for", "your", "health"],
      },
      {
        korean: "저는 여행을 정말 좋아합니다.",
        english: ["I", "really", "love", "traveling"],
      },
      {
        korean: "공부하는 것이 때때로 어렵습니다.",
        english: ["Studying", "is", "sometimes", "difficult"],
      },
      {
        korean: "제 꿈은 과학자가 되는 것입니다.",
        english: ["My", "dream", "is", "to", "become", "a", "scientist"],
      },
      {
        korean: "독서는 재미있고 유익합니다.",
        english: ["Reading", "is", "fun", "and", "useful"],
      },
      {
        korean: "운동을 매일 해야 한다고 생각합니다.",
        english: ["I", "think", "we", "should", "exercise", "every", "day"],
      },
      {
        korean: "저는 그것에 동의하지 않습니다.",
        english: ["I", "do", "not", "agree", "with", "that"],
      },
      {
        korean: "음악은 우리 삶을 풍요롭게 합니다.",
        english: ["Music", "enriches", "our", "lives"],
      },
    ],
  },
  {
    id: 8,
    description: "Level 8: Making Plans",
    sentences: [
      {
        korean: "이번 주말에 영화 보러 갈까요?",
        english: [
          "Shall",
          "we",
          "go",
          "to",
          "the",
          "movies",
          "this",
          "weekend",
        ],
      },
      {
        korean: "저는 내년에 대학에 갈 계획입니다.",
        english: ["I", "plan", "to", "go", "to", "college", "next", "year"],
      },
      {
        korean: "방학 때 여행을 가고 싶습니다.",
        english: ["I", "want", "to", "travel", "during", "vacation"],
      },
      {
        korean: "오후 3시에 만나는 게 어때요?",
        english: [
          "How",
          "about",
          "meeting",
          "at",
          "three",
          "in",
          "the",
          "afternoon",
        ],
      },
      {
        korean: "저는 저녁에 친구들과 저녁을 먹을 겁니다.",
        english: [
          "I",
          "will",
          "have",
          "dinner",
          "with",
          "my",
          "friends",
          "tonight",
        ],
      },
      {
        korean: "다음 달에 생일 파티를 열 거예요.",
        english: [
          "I",
          "will",
          "have",
          "a",
          "birthday",
          "party",
          "next",
          "month",
        ],
      },
      {
        korean: "우리 같이 공부하면 어떨까요?",
        english: ["Why", "don't", "we", "study", "together"],
      },
      {
        korean: "저는 매주 토요일에 수영을 하러 갑니다.",
        english: ["I", "go", "swimming", "every", "Saturday"],
      },
      {
        korean: "여름에 캠핑을 가고 싶어요.",
        english: ["I", "want", "to", "go", "camping", "in", "summer"],
      },
      {
        korean: "내일 몇 시에 만날까요?",
        english: ["What", "time", "shall", "we", "meet", "tomorrow"],
      },
    ],
  },
  {
    id: 9,
    description: "Level 9: Describing Experiences",
    sentences: [
      {
        korean: "저는 지난주에 서울에 다녀왔습니다.",
        english: ["I", "went", "to", "Seoul", "last", "week"],
      },
      {
        korean: "그 경험은 정말 잊을 수 없어요.",
        english: ["That", "experience", "was", "really", "unforgettable"],
      },
      {
        korean: "저는 아직 그곳에 가본 적이 없습니다.",
        english: ["I", "have", "never", "been", "there", "before"],
      },
      {
        korean: "작년에 일본을 방문했을 때 정말 즐거웠습니다.",
        english: [
          "I",
          "really",
          "enjoyed",
          "when",
          "I",
          "visited",
          "Japan",
          "last",
          "year",
        ],
      },
      {
        korean: "그 영화를 이미 세 번 봤어요.",
        english: [
          "I",
          "have",
          "already",
          "watched",
          "that",
          "movie",
          "three",
          "times",
        ],
      },
      {
        korean: "저는 어렸을 때 피아노를 배웠습니다.",
        english: [
          "I",
          "learned",
          "to",
          "play",
          "the",
          "piano",
          "when",
          "I",
          "was",
          "young",
        ],
      },
      {
        korean: "그것은 제 인생에서 가장 행복한 날이었습니다.",
        english: ["It", "was", "the", "happiest", "day", "of", "my", "life"],
      },
      {
        korean: "저는 그 책을 읽은 후로 많이 변했습니다.",
        english: [
          "I",
          "have",
          "changed",
          "a",
          "lot",
          "since",
          "I",
          "read",
          "that",
          "book",
        ],
      },
      {
        korean: "우리는 박물관에서 놀라운 것들을 봤습니다.",
        english: ["We", "saw", "amazing", "things", "at", "the", "museum"],
      },
      {
        korean: "저는 그들을 5년 동안 알고 지냈습니다.",
        english: ["I", "have", "known", "them", "for", "five", "years"],
      },
    ],
  },
  {
    id: 10,
    description: "Level 10: Advanced Expressions",
    sentences: [
      {
        korean: "만약 내가 더 열심히 공부했다면 시험에 합격했을 것입니다.",
        english: [
          "If",
          "I",
          "had",
          "studied",
          "harder",
          "I",
          "would",
          "have",
          "passed",
          "the",
          "exam",
        ],
      },
      {
        korean: "환경을 보호하는 것은 우리 모두의 책임입니다.",
        english: [
          "Protecting",
          "the",
          "environment",
          "is",
          "everyone's",
          "responsibility",
        ],
      },
      {
        korean: "기술의 발전은 우리 삶을 크게 변화시켰습니다.",
        english: [
          "Technological",
          "advancement",
          "has",
          "greatly",
          "changed",
          "our",
          "lives",
        ],
      },
      {
        korean: "저는 그가 정직한 사람이라고 믿습니다.",
        english: ["I", "believe", "that", "he", "is", "an", "honest", "person"],
      },
      {
        korean: "노력 없이는 성공할 수 없습니다.",
        english: ["You", "cannot", "succeed", "without", "effort"],
      },
      {
        korean: "그녀는 영어를 유창하게 구사합니다.",
        english: ["She", "speaks", "English", "fluently"],
      },
      {
        korean: "저는 다른 문화를 배우는 것에 관심이 있습니다.",
        english: [
          "I",
          "am",
          "interested",
          "in",
          "learning",
          "about",
          "different",
          "cultures",
        ],
      },
      {
        korean: "건강한 식습관을 유지하는 것이 중요합니다.",
        english: [
          "It",
          "is",
          "important",
          "to",
          "maintain",
          "healthy",
          "eating",
          "habits",
        ],
      },
      {
        korean: "저는 미래에 대해 낙관적입니다.",
        english: ["I", "am", "optimistic", "about", "the", "future"],
      },
      {
        korean: "교육은 성공의 열쇠입니다.",
        english: ["Education", "is", "the", "key", "to", "success"],
      },
    ],
  },
];

export const SHOP_ITEMS: ShopItem[] = Array.from({ length: 20 }, (_, i) => ({
  id: `avatar${String(i + 1).padStart(2, "0")}`, // avatar01, avatar02...
  name: `Avatar ${i + 1}`,
  type: "avatar",
  cost: 500 * (i + 1), // 500, 1000, 1500...
  imagePath: getAssetPath(
    `/assets/character/avatar${String(i + 1).padStart(2, "0")}.png`,
  ),
}));

export const VOCAB_LEVELS: VocabLevel[] = [
  {
    id: 1,
    description: "Level 1: 3-Letter Words",
    words: [
      { korean: "개", english: "dog" },
      { korean: "고양이", english: "cat" },
      { korean: "버스", english: "bus" },
      { korean: "해", english: "sun" },
      { korean: "자물쇠", english: "key" },
    ],
  },
  {
    id: 2,
    description: "Level 2: 4-Letter Words",
    words: [
      { korean: "책", english: "book" },
      { korean: "나무", english: "tree" },
      { korean: "오리", english: "duck" },
      { korean: "사자", english: "lion" },
      { korean: "별", english: "star" },
    ],
  },
  {
    id: 3,
    description: "Level 3: 5-Letter Words",
    words: [
      { korean: "사과", english: "apple" },
      { korean: "물", english: "water" },
      { korean: "집", english: "house" },
      { korean: "빵", english: "bread" },
      { korean: "초록색", english: "green" },
    ],
  },
  {
    id: 4,
    description: "Level 4: Animals",
    words: [
      { korean: "호랑이", english: "tiger" },
      { korean: "얼룩말", english: "zebra" },
      { korean: "원숭이", english: "monkey" },
      { korean: "토끼", english: "rabbit" },
      { korean: "panda", english: "panda" },
    ],
  },
  {
    id: 5,
    description: "Level 5: Fruits",
    words: [
      { korean: "바나나", english: "banana" },
      { korean: "포도", english: "grape" },
      { korean: "오렌지", english: "orange" },
      { korean: "레몬", english: "lemon" },
      { korean: "복숭아", english: "peach" },
    ],
  },
];

export const BACKGROUND_ITEMS: ShopItem[] = [
  {
    id: "bg_default", // Default (Hidden/Empty)
    name: "Default",
    type: "background",
    cost: 0,
    imagePath: "",
    style: { backgroundColor: "transparent" },
  },
  ...Array.from({ length: 12 }, (_, i) => {
    const num = i + 1;
    const formattedNum = num < 10 ? `0${num}` : num;
    const titles = [
      "Cozy Morning",
      "Midnight Study",
      "Pink Palace",
      "Kitty Lounge",
      "Forest Magic",
      "Toy Kingdom",
      "Deep Ocean",
      "Picnic Time",
      "Space Lab",
      "Sweet Cafe",
      "Dreamy Sky",
      "Fairy Garden",
    ];

    return {
      id: `bg_room_${formattedNum}`,
      name: titles[i],
      type: "background" as const,
      cost: 1000 * num,
      imagePath: getAssetPath(
        `/assets/background_room/background_room${formattedNum}.jpg`,
      ),
      style: {
        backgroundImage: `url(${getAssetPath(
          `/assets/background_room/background_room${formattedNum}.jpg`,
        )})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      },
    };
  }),
];
