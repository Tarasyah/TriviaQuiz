'use client';

import { Button } from '@/components/ui/button';
import { Swords, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/firebase';

export default function Home() {
  const { user } = useUser();

  const handleStart = () => {
    localStorage.removeItem('triviaQuiz');
  }

  return (
    <div className="relative min-h-screen">
      <section className="absolute inset-0 h-screen w-full">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1740"
          alt="Mystical Forest"
          className="h-full w-full object-cover"
        />
      </section>

      <section className="relative z-20 flex flex-col items-center justify-center h-screen text-white text-center px-4">
        <h1 className="text-6xl md:text-8xl font-bold font-headline tracking-tighter mb-4"
            style={{textShadow: '0 4px 15px rgba(0,0,0,0.5)'}}>
            TriviaQuest
        </h1>
        <p className="text-xl md:text-2xl max-w-2xl mb-8"
            style={{textShadow: '0 2px 10px rgba(0,0,0,0.5)'}}>
            Test your knowledge, challenge your friends, and conquer the quest for wisdom.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="font-bold text-lg py-7 px-10 bg-primary/90 hover:bg-primary border border-primary-foreground/20 text-primary-foreground" onClick={handleStart}>
              <Link href="/quiz">
                <Swords className="mr-2 h-6 w-6" /> Start Your Quest
              </Link>
            </Button>
            {!user && (
               <Button asChild variant="outline" size="lg" className="font-bold text-lg py-7 px-10 bg-white/10 hover:bg-white/20 border-white/50 text-white backdrop-blur-sm">
                <Link href="/login">
                  <LogIn className="mr-2 h-6 w-6" /> Login to Save Progress
                </Link>
              </Button>
            )}
        </div>
      </section>
    </div>
  );
}
