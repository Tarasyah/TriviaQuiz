'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';

export default function QuizConfig() {
  const router = useRouter();
  const [timeLimit, setTimeLimit] = useState<string>('300'); // Default to 5 minutes

  const handleStart = () => {
    router.push(`/quiz/start?time=${timeLimit}`);
  };

  const timeOptions = [
    { value: '60', label: '1 Minute' },
    { value: '180', label: '3 Minutes' },
    { value: '300', label: '5 Minutes' },
    { value: '600', label: '10 Minutes' },
    { value: 'null', label: 'No Limit' },
  ];

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-80px)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <Clock className="h-6 w-6" />
            Set Quiz Timer
          </CardTitle>
          <CardDescription>
            Choose how much time you want for the entire quiz.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup value={timeLimit} onValueChange={setTimeLimit} className="grid grid-cols-2 gap-4">
            {timeOptions.map((option) => (
              <div key={option.value}>
                <RadioGroupItem value={option.value} id={option.value} className="peer sr-only" />
                <Label
                  htmlFor={option.value}
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          <Button onClick={handleStart} className="w-full" size="lg">
            Start Quiz
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
