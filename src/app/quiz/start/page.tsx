import { getTriviaQuestions } from '@/lib/actions';
import QuizClient from '@/components/quiz/QuizClient';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default async function StartQuizPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const questions = await getTriviaQuestions();
  const timeLimit = searchParams.time ? parseInt(searchParams.time as string) : null;

  if (!questions || questions.length === 0) {
    return (
      <div className="container mx-auto max-w-2xl py-12">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Could not load trivia questions. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <QuizClient questions={questions} timeLimit={timeLimit} />;
}
