'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { Question } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface QuizState {
  questions: Question[];
  answers: (string | null)[];
  currentQuestionIndex: number;
  startTime: number;
  timeLimit: number | null;
}

export default function QuestionPage() {
  const router = useRouter();
  const params = useParams();
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const questionNumber = parseInt(params.questionNumber as string, 10);

  useEffect(() => {
    const storedState = localStorage.getItem('triviaQuiz');
    if (!storedState) {
      router.replace('/quiz');
      return;
    }
    const parsedState: QuizState = JSON.parse(storedState);
    if (questionNumber - 1 !== parsedState.currentQuestionIndex) {
      router.replace(`/quiz/${parsedState.currentQuestionIndex + 1}`);
    }
    setQuizState(parsedState);
  }, [questionNumber, router]);

  useEffect(() => {
    if (!quizState?.timeLimit) return;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - quizState.startTime) / 1000;
      const remaining = Math.max(0, quizState.timeLimit - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0) {
        router.push('/results');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [quizState?.startTime, quizState?.timeLimit, router]);


  const currentQuestion = quizState?.questions[questionNumber - 1];
  const options = useMemo(() => {
    if (!currentQuestion) return [];
    return [...currentQuestion.incorrect_answers, currentQuestion.correct_answer].sort(() => Math.random() - 0.5);
  }, [currentQuestion]);

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
  
  const handleAnswer = (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
    setIsAnswered(true);

    if (quizState) {
      const newAnswers = [...quizState.answers];
      newAnswers[questionNumber - 1] = answer;
      const newState = { ...quizState, answers: newAnswers };
      setQuizState(newState);
      localStorage.setItem('triviaQuiz', JSON.stringify(newState));
    }

    setTimeout(() => {
      handleNext();
    }, 2000); // Wait 2 seconds before moving to next question
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!quizState || !currentQuestion) {
    return <div className="flex items-center justify-center min-h-[calc(100vh-80px)]"><p>Loading question...</p></div>;
  }

  return (
    <div className="container mx-auto max-w-3xl py-12">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
            <p className="text-sm font-semibold text-primary">
                Question {questionNumber} of {quizState.questions.length}
            </p>
            {timeLeft !== null && (
                <div className="flex items-center gap-2 font-semibold text-primary">
                    <Clock className="h-5 w-5" />
                    <span>{formatTime(timeLeft)}</span>
                </div>
            )}
        </div>
        <Progress value={(questionNumber / quizState.questions.length) * 100} />
        
        <Card>
          <CardHeader>
            <CardDescription>{currentQuestion.category} ({currentQuestion.difficulty})</CardDescription>
            <CardTitle className="text-2xl font-headline" dangerouslySetInnerHTML={{ __html: currentQuestion.question }}/>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              let buttonStyle = {};

              if (isAnswered) {
                if (option === currentQuestion.correct_answer) {
                  buttonStyle = { backgroundColor: 'var(--success-color, #28a745)', color: 'white' };
                } else if (isSelected) {
                  buttonStyle = { backgroundColor: 'var(--destructive-color, #dc3545)', color: 'white' };
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
                     isAnswered && "opacity-80"
                  )}
                  style={buttonStyle}
                  dangerouslySetInnerHTML={{ __html: option }}
                />
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
