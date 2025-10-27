export interface User {
  uid: string;
  email: string | null;
}

export interface Question {
  category: string;
  type: 'multiple';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export interface QuizResult {
  id: string;
  userId: string;
  score: number;
  incorrect: number;
  unanswered: number;
  total: number;
  date: string;
}
