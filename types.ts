export enum Difficulty {
  NB = 'Nhận biết', // Knowing
  TH = 'Thông hiểu', // Understanding
  VD = 'Vận dụng'   // Applying
}

export enum TopicCategory {
  ALGEBRA = 'Số và Đại số',
  GEOMETRY = 'Hình học và Đo lường',
  STATS = 'Thống kê và Xác suất'
}

export interface Question {
  id: string;
  category: TopicCategory;
  topic: string; // Specific topic name (e.g., "Hàm số y=ax^2")
  difficulty: Difficulty;
  content: string; // The question text (Markdown/LaTeX supported)
  options: string[]; // 4 options
  correctAnswer: number; // Index 0-3
  explanation: string; // Detailed solution
  solutionMethod2?: string; // Optional second method
  geometrySvg?: string; // Optional SVG code for geometry
}

export interface ExamState {
  status: 'intro' | 'generating' | 'exam' | 'result';
  questions: Question[];
  userAnswers: Record<string, number>; // questionId -> optionIndex
  timeLeft: number; // Seconds
  score: number;
}

export const EXAM_DURATION_SECONDS = 90 * 60; // 90 minutes
export const TOTAL_QUESTIONS = 50;
export const SCORE_PER_QUESTION = 0.2;

// Matrix Configuration aligned with Vietnam Grade 9 Curriculum
export const EXAM_MATRIX = [
  {
    category: TopicCategory.ALGEBRA,
    count: 24,
    topics: [
      "Căn bậc hai, Căn bậc ba",
      "Hàm số bậc nhất y = ax + b",
      "Hệ hai phương trình bậc nhất hai ẩn",
      "Hàm số y = ax² (a ≠ 0) và Phương trình bậc hai một ẩn"
    ],
    difficultyDist: { nb: 10, th: 7, vd: 7 }
  },
  {
    category: TopicCategory.GEOMETRY,
    count: 19,
    topics: [
      "Hệ thức lượng trong tam giác vuông",
      "Đường tròn (Đường kính, dây cung, tiếp tuyến)",
      "Góc với đường tròn (Góc nội tiếp, Tứ giác nội tiếp)",
      "Hình trụ, Hình nón, Hình cầu"
    ],
    difficultyDist: { nb: 7, th: 5, vd: 7 }
  },
  {
    category: TopicCategory.STATS,
    count: 7,
    topics: [
      "Thống kê (Bảng tần số, biểu đồ)",
      "Xác suất (Xác suất thực nghiệm)"
    ],
    difficultyDist: { nb: 3, th: 3, vd: 1 }
  }
];