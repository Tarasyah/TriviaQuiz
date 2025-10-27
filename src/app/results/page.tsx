'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Question, QuizResult } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Repeat, Home } from 'lucide-react';
import Confetti from 'react-dom-confetti';

interface QuizState {
  questions: Question[];
  answers: string[];
}

export default function ResultsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const storedState = localStorage.getItem('triviaQuiz');
    if (!storedState) {
      router.replace('/');
      return;
    }
    setQuizState(JSON.parse(storedState));
  }, [router]);
  
  const score = useMemo(() => {
    if (!quizState) return 0;
    return quizState.questions.reduce((acc, question, index) => {
      return question.correct_answer === quizState.answers[index] ? acc + 1 : acc;
    }, 0);
  }, [quizState]);

  useEffect(() => {
    if (quizState) {
        if (score / quizState.questions.length >= 0.7) {
            setShowConfetti(true);
        }
        if (user) {
            const result: QuizResult = {
                score,
                total: quizState.questions.length,
                date: new Date().toISOString(),
            };
            const historyStr = localStorage.getItem(`triviaHistory_${user.email}`);
            const history: QuizResult[] = historyStr ? JSON.parse(historyStr) : [];
            history.unshift(result);
            localStorage.setItem(`triviaHistory_${user.email}`, JSON.stringify(history.slice(0, 20))); // Limit history
        }
    }
  }, [quizState, user, score]);

  const handlePlayAgain = () => {
    localStorage.removeItem('triviaQuiz');
    router.push('/quiz');
  };

  const handleGoHome = () => {
    localStorage.removeItem('triviaQuiz');
    router.push('/');
  }

  if (!quizState) {
    return <div className="flex items-center justify-center min-h-screen">Loading results...</div>;
  }

  const percentage = Math.round((score / quizState.questions.length) * 100);

  return (
    <div className="container mx-auto max-w-2xl py-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
      <Card className="w-full text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Confetti active={showConfetti} config={{
                angle: 90,
                spread: 360,
                startVelocity: 40,
                elementCount: 100,
                decay: 0.9,
            }} />
        </div>
        <CardHeader>
          <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit">
            <Trophy className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-4xl font-bold mt-4">Quiz Complete!</CardTitle>
          <CardDescription className="text-lg">Here's how you did.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-baseline justify-center gap-2">
            <p className="text-7xl font-bold text-primary">{score}</p>
            <p className="text-2xl text-muted-foreground">/ {quizState.questions.length}</p>
          </div>
          <p className="text-3xl font-semibold">{percentage}%</p>
          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={handlePlayAgain} size="lg">
              <Repeat className="mr-2 h-4 w-4" /> Play Again
            </Button>
            <Button onClick={handleGoHome} variant="outline" size="lg">
              <Home className="mr-2 h-4 w-4" /> Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
