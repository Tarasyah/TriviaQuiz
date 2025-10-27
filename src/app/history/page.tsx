'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { QuizResult } from '@/lib/types';
import { collection, orderBy, query } from 'firebase/firestore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { History as HistoryIcon } from 'lucide-react';
import { format } from 'date-fns';

export default function HistoryPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const quizHistoryQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'quiz_history'), orderBy('date', 'desc'));
  }, [user, firestore]);
  
  const { data: history, isLoading } = useCollection<QuizResult>(quizHistoryQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || isLoading || !user) {
    return <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">Loading history...</div>;
  }

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <HistoryIcon className="h-6 w-6" />
            Quiz History
          </CardTitle>
          <CardDescription>
            Here are the results from your previous quizzes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history && history.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Score</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell className="font-medium">{result.score} / {result.total}</TableCell>
                    <TableCell>{Math.round((result.score / result.total) * 100)}%</TableCell>
                    <TableCell>{format(new Date(result.date), 'PPpp')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">You haven't completed any quizzes yet.</p>
              <p className="text-muted-foreground">Go play one to see your results here!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
