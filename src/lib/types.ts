export interface User {
  email: string;
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
  score: number;
  total: number;
  date: string;
}
