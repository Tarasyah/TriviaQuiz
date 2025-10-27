'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { Question } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface QuizState {
  questions: Question[];
  answers: (string | null)[];
  currentQuestionIndex: number;
}

export default function QuestionPage() {
  const router = useRouter();
  const params = useParams();
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const questionNumber = parseInt(params.questionNumber as string, 10);

  useEffect(() => {
    const storedState = localStorage.getItem('triviaQuiz');
    if (!storedState) {
      router.replace('/quiz');
      return;
    }
    const parsedState: QuizState = JSON.parse(storedState);
    if (questionNumber - 1 !== parsedState.currentQuestionIndex) {
        // If URL doesn't match state, sync it
        router.replace(`/quiz/${parsedState.currentQuestionIndex + 1}`);
    }
    setQuizState(parsedState);
  }, [questionNumber, router]);

  const currentQuestion = quizState?.questions[questionNumber - 1];
  const options = useMemo(() => {
    if (!currentQuestion) return [];
    const incorrect = currentQuestion.incorrect_answers;
    const correct = currentQuestion.correct_answer;
    return [...incorrect, correct].sort(() => Math.random() - 0.5);
  }, [currentQuestion]);
  
  const handleAnswer = (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
    setIsAnswered(true);

    if (quizState) {
      const newAnswers = [...quizState.answers];
      newAnswers[questionNumber - 1] = answer;
      const newState = { ...quizState, answers: newAnswers };
      setQuizState(newState);
      // We don't save to localStorage here, only on "Next"
    }
  };

  const handleNext = useCallback(() => {
    if (!quizState) return;

    const nextIndex = quizState.currentQuestionIndex + 1;
    const newState = { ...quizState, currentQuestionIndex: nextIndex };
    localStorage.setItem('triviaQuiz', JSON.stringify(newState));

    if (nextIndex < quizState.questions.length) {
      router.push(`/quiz/${nextIndex + 1}`);
    } else {
      router.push('/results');
    }
  }, [quizState, router]);

  if (!quizState || !currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        {/* Loading state can be more sophisticated */}
        <p>Loading question...</p>
      </div>
    );
  }

  const isCorrect = selectedAnswer === currentQuestion.correct_answer;

  return (
    <div className="container mx-auto max-w-3xl py-12">
      <div className="space-y-8">
        <div>
            <p className="text-center text-sm font-semibold text-primary mb-2">
                Question {questionNumber} of {quizState.questions.length}
            </p>
            <Progress value={(questionNumber / quizState.questions.length) * 100} />
        </div>
        
        <Card>
          <CardHeader>
            <CardDescription>{currentQuestion.category} ({currentQuestion.difficulty})</CardDescription>
            <CardTitle className="text-2xl font-headline">{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              let buttonVariant: "default" | "secondary" | "destructive" | "outline" = "outline";
              if (isAnswered) {
                if (option === currentQuestion.correct_answer) {
                  buttonVariant = "default";
                } else if (isSelected) {
                  buttonVariant = "destructive";
                } else {
                  buttonVariant = "outline";
                }
              }

              return (
                <Button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  disabled={isAnswered}
                  className={cn(
                    "h-auto justify-start text-left whitespace-normal py-4 text-base",
                     isSelected && !isAnswered && "ring-2 ring-primary",
                     isAnswered && option === currentQuestion.correct_answer && "bg-green-500 hover:bg-green-600 text-white",
                     isAnswered && isSelected && option !== currentQuestion.correct_answer && "bg-red-500 hover:bg-red-600 text-white",
                     isAnswered && "opacity-70"
                  )}
                >
                  {option}
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {isAnswered && (
          <div className="flex flex-col items-center gap-4">
            <Alert className={cn(isCorrect ? "border-green-500 text-green-700" : "border-red-500 text-red-700")}>
                {isCorrect ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                <AlertTitle className="font-bold">{isCorrect ? 'Correct!' : 'Incorrect!'}</AlertTitle>
                {!isCorrect && (
                    <AlertDescription>
                        The correct answer was: {currentQuestion.correct_answer}
                    </AlertDescription>
                )}
            </Alert>
            <Button onClick={handleNext} size="lg">
              {questionNumber === quizState.questions.length ? 'See Results' : 'Next Question'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
