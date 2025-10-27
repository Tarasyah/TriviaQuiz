'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { QuizResult } from '@/lib/types';
import { collection, orderBy, query, doc, deleteDoc } from 'firebase/firestore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { History as HistoryIcon, Trash2, LineChart as LineChartIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart"
import { LineChart, CartesianGrid, XAxis, YAxis, Line, ResponsiveContainer } from "recharts"


export default function HistoryPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const quizHistoryQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'quiz_history'), orderBy('date', 'asc'));
  }, [user, firestore]);
  
  const { data: history, isLoading } = useCollection<QuizResult>(quizHistoryQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  const handleDelete = async (id: string) => {
    if (!user || !firestore) return;
    try {
      await deleteDoc(doc(firestore, 'users', user.uid, 'quiz_history', id));
      toast({
        title: "Success",
        description: "Quiz history entry deleted.",
      });
    } catch (error) {
      console.error("Error deleting document: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete history entry.",
      });
    }
  };

  const chartData = useMemo(() => {
    if (!history) return [];
    return history.map(item => ({
      date: format(new Date(item.date), 'MMM d'),
      score: item.score,
    }));
  }, [history]);

  const chartConfig = {
    score: {
      label: "Correct Answers",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig

  if (isUserLoading || isLoading || !user) {
    return <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">Loading history...</div>;
  }

  const reversedHistory = history ? [...history].reverse() : [];

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
        <CardContent className="space-y-8">
            {history && history.length > 1 && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <LineChartIcon className="h-5 w-5" />
                            Score Over Time
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12}/>
                                    <YAxis tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12}/>
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{r: 4, fill: "hsl(var(--primary))"}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            )}

          {reversedHistory && reversedHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Correct</TableHead>
                  <TableHead>Incorrect</TableHead>
                  <TableHead>Unanswered</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reversedHistory.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell className="font-medium text-green-600">{result.score}</TableCell>
                    <TableCell className="text-red-600">{result.incorrect}</TableCell>
                    <TableCell className="text-yellow-600">{result.unanswered}</TableCell>
                    <TableCell>{result.total}</TableCell>
                    <TableCell>{Math.round((result.score / result.total) * 100)}%</TableCell>
                    <TableCell>{format(new Date(result.date), 'PPpp')}</TableCell>
                    <TableCell className="text-right">
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this quiz result from your history.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(result.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
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
