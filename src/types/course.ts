export interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Quiz {
  questions: QuizQuestion[];
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  notes: string | null;
  videos: Video[];
  is_completed: boolean;
  quiz_score: number | null;
  quiz_data: Quiz | null;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  user_id: string;
  topic: string;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
}
