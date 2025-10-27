'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Question } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface QuizClientProps {
  questions: Question[];
}

export default function QuizClient({ questions }: QuizClientProps) {
  const router = useRouter();

  useEffect(() => {
    // Check for existing quiz
    const existingQuiz = localStorage.getItem('triviaQuiz');
    if (existingQuiz) {
        const { currentQuestionIndex } = JSON.parse(existingQuiz);
        // Resume existing quiz
        router.replace(`/quiz/${currentQuestionIndex + 1}`);
        return;
    }

    // Start a new quiz
    const quizState = {
      questions,
      answers: [],
      currentQuestionIndex: 0,
    };
    localStorage.setItem('triviaQuiz', JSON.stringify(quizState));
    router.replace('/quiz/1');
  }, [questions, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Preparing your quiz...</p>
    </div>
  );
}
