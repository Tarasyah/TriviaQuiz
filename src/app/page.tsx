'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Swords, LogIn } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/icons/Logo';
import { useUser } from '@/firebase';

export default function Home() {
  const { user } = useUser();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-grid-pattern">
      <div className="container mx-auto flex items-center justify-center">
        <Card className="w-full max-w-lg shadow-2xl overflow-hidden border-primary/20">
            <div className="p-8 bg-primary/10 flex justify-center items-center">
                 <Logo className="h-24 w-24 text-primary" />
            </div>
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-headline font-bold text-primary">TriviaQuest</CardTitle>
            <CardDescription className="text-lg pt-2">
              Test your knowledge and challenge yourself!
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-6 pt-0">
            <Button asChild size="lg" className="w-full font-bold text-lg py-7">
              <Link href="/quiz">
                <Swords className="mr-2 h-6 w-6" /> Start Quiz
              </Link>
            </Button>
            {!user && (
               <Button asChild variant="outline" size="lg" className="w-full font-bold text-lg py-7">
                <Link href="/login">
                  <LogIn className="mr-2 h-6 w-6" /> Login to Save Progress
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
