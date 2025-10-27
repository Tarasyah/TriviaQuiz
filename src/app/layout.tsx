'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/Header';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { usePathname } from 'next/navigation';

// export const metadata: Metadata = {
//   title: 'TriviaQuest',
//   description: 'A fun and fast-paced trivia game.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isQuizPage = pathname.startsWith('/quiz/') && pathname.length > '/quiz/'.length;

  return (
    <html lang="en" className="dark">
      <head>
        <title>TriviaQuest</title>
        <meta name="description" content="A fun and fast-paced trivia game." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
        <meta name="view-transition" content="same-origin" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          {!isQuizPage && <Header />}
          <main className="pt-20">
            {children}
          </main>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
