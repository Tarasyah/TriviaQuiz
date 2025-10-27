'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Question, QuizResult } from '@/lib/types';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Repeat, Home, Check, X, AlertCircle } from 'lucide-react';
import Confetti from 'react-dom-confetti';

interface QuizState {
  questions: Question[];
  answers: (string | null)[];
}

export default function ResultsPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const storedState = localStorage.getItem('triviaQuiz');
    if (!storedState) {
      router.replace('/');
      return;
    }
    setQuizState(JSON.parse(storedState));
    localStorage.removeItem('triviaQuiz'); // Clear quiz after showing results
  }, [router]);

  const { score, incorrect, unanswered } = useMemo(() => {
    if (!quizState) return { score: 0, incorrect: 0, unanswered: 0 };
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    quizState.questions.forEach((question, index) => {
      const userAnswer = quizState.answers[index];
      if (userAnswer === null) {
        unanswered++;
      } else if (question.correct_answer === userAnswer) {
        correct++;
      } else {
        incorrect++;
      }
    });
    return { score: correct, incorrect, unanswered };
  }, [quizState]);

  useEffect(() => {
    if (quizState && user && firestore) {
      if (score / quizState.questions.length >= 0.7) {
        setShowConfetti(true);
      }

      const result: Omit<QuizResult, 'id'> = {
        score,
        incorrect,
        unanswered,
        total: quizState.questions.length,
        date: new Date().toISOString(),
        userId: user.uid,
      };

      const historyColRef = collection(firestore, 'users', user.uid, 'quiz_history');
      addDocumentNonBlocking(historyColRef, result);
    }
  }, [quizState, user, score, incorrect, unanswered, firestore]);

  const handlePlayAgain = () => {
    router.push('/quiz');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  if (!quizState) {
    return <div className="flex items-center justify-center min-h-screen">Loading results...</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl py-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
      <Card className="w-full text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Confetti
            active={showConfetti}
            config={{
              angle: 90,
              spread: 360,
              startVelocity: 40,
              elementCount: 100,
              decay: 0.9,
            }}
          />
        </div>
        <CardHeader>
          <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit">
            <Trophy className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-4xl font-bold mt-4">Quiz Complete!</CardTitle>
          <CardDescription className="text-lg">Here's how you did.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 divide-x divide-border rounded-lg border bg-muted p-4">
             <div className="flex flex-col items-center gap-1 px-2">
                <Check className="h-6 w-6 text-green-500" />
                <p className="text-2xl font-bold">{score}</p>
                <p className="text-sm text-muted-foreground">Correct</p>
             </div>
             <div className="flex flex-col items-center gap-1 px-2">
                <X className="h-6 w-6 text-red-500" />
                <p className="text-2xl font-bold">{incorrect}</p>
                <p className="text-sm text-muted-foreground">Incorrect</p>
            </div>
            <div className="flex flex-col items-center gap-1 px-2">
                <AlertCircle className="h-6 w-6 text-yellow-500" />
                <p className="text-2xl font-bold">{unanswered}</p>
                <p className="text-sm text-muted-foreground">Unanswered</p>
            </div>
          </div>
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
