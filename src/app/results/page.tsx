'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Question, QuizResult } from '@/lib/types';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Repeat, Home, Check, X, AlertCircle, Eye } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';


interface QuizState {
  questions: Question[];
  answers: (string | null)[];
}

export default function ResultsPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const { toast } = useToast();

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
    const saveResult = async () => {
        if (quizState && user && firestore) {
          const result: Omit<QuizResult, 'id'> = {
            score,
            incorrect,
            unanswered,
            total: quizState.questions.length,
            date: new Date().toISOString(),
            userId: user.uid,
          };
    
          try {
            const historyColRef = collection(firestore, 'users', user.uid, 'quiz_history');
            await addDoc(historyColRef, result);
          } catch (error) {
              console.error("Error saving quiz result: ", error);
              toast({
                  variant: "destructive",
                  title: "Error",
                  description: "Could not save your quiz result.",
              });
          }
        }
    }
    saveResult();
  }, [quizState, user, firestore, score, incorrect, unanswered, toast]);

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

  return (
    <div className="container mx-auto max-w-2xl py-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
      <Card className="w-full text-center relative overflow-hidden">
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
            <Button onClick={handlePlayAgain} size="lg">
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
                                userAnswer === null ? 'bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-400' :
                                isCorrect ? 'bg-green-100 dark:bg-green-900/40 border border-green-400' : 'bg-red-100 dark:bg-red-900/40 border border-red-400'
                              )}
                            >
                              <span className="font-bold">Your Answer: </span>
                              <span dangerouslySetInnerHTML={{ __html: userAnswer ?? 'Not Answered' }} />
                            </p>
                            {!isCorrect && userAnswer !== null && (
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
            <Button onClick={handleGoHome} variant="outline" size="lg">
              <Home className="mr-2 h-4 w-4" /> Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
