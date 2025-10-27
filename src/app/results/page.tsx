'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Question, QuizResult } from '@/lib/types';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Repeat, Home, Check, X, AlertCircle, Eye } from 'lucide-react';
import Confetti from 'react-dom-confetti';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

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
    const parsedState = JSON.parse(storedState);
    setQuizState(parsedState);
    // We will clear storage when user navigates away
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

  const clearQuizAndNavigate = (path: string) => {
    localStorage.removeItem('triviaQuiz');
    router.push(path);
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
          <div className="flex justify-center flex-wrap gap-4 pt-4">
            <Button onClick={() => clearQuizAndNavigate('/quiz')} size="lg">
              <Repeat className="mr-2 h-4 w-4" /> Play Again
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" size="lg">
                  <Eye className="mr-2 h-4 w-4" /> Review Answers
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Review Your Answers</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-6">
                  <div className="space-y-6 my-4">
                    {quizState.questions.map((question, index) => {
                      const userAnswer = quizState.answers[index];
                      const isCorrect = userAnswer === question.correct_answer;

                      return (
                        <div key={index}>
                          <p className="font-semibold mb-2" dangerouslySetInnerHTML={{ __html: `${index + 1}. ${question.question}` }} />
                          <div className="space-y-2">
                            <p
                              className={cn(
                                'p-3 rounded-md text-sm',
                                isCorrect ? 'bg-green-100 dark:bg-green-900/40 border border-green-400' : 'bg-red-100 dark:bg-red-900/40 border border-red-400'
                              )}
                            >
                              <span className="font-bold">Your Answer: </span>
                              <span dangerouslySetInnerHTML={{ __html: userAnswer ?? 'Not Answered' }} />
                            </p>
                            {!isCorrect && (
                              <p className="p-3 rounded-md text-sm bg-green-100 dark:bg-green-900/40 border border-green-400">
                                <span className="font-bold">Correct Answer: </span>
                                <span dangerouslySetInnerHTML={{ __html: question.correct_answer }} />
                              </p>
                            )}
                          </div>
                          {index < quizState.questions.length - 1 && <Separator className="mt-6" />}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button>Close</Button>
                    </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button onClick={() => clearQuizAndNavigate('/')} variant="outline" size="lg">
              <Home className="mr-2 h-4 w-4" /> Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
