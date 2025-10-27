'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Question } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface QuizClientProps {
  questions: Question[];
  timeLimit: number | null;
}

export default function QuizClient({ questions, timeLimit }: QuizClientProps) {
  const router = useRouter();

  useEffect(() => {
    // Always start a new quiz, clearing any old state
    const quizState = {
      questions,
      answers: Array(questions.length).fill(null),
      currentQuestionIndex: 0,
      startTime: Date.now(),
      timeLimit,
    };
    localStorage.setItem('triviaQuiz', JSON.stringify(quizState));
    router.replace('/quiz/1');
  }, [questions, router, timeLimit]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-lg text-muted-foreground">Preparing your quiz...</p>
    </div>
  );
}
