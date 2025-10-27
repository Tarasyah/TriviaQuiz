'use server';

import type { Question } from './types';

export async function getTriviaQuestions(): Promise<Question[]> {
  try {
    const response = await fetch('https://opentdb.com/api.php?amount=10&type=multiple&encode=base64', { cache: 'no-store' });
    if (!response.ok) {
      // Instead of throwing, log the error and return empty array
      console.error('Failed to fetch trivia questions. Status:', response.status);
      return [];
    }
    const data = await response.json();
    
    if (data.response_code !== 0) {
      // Log the specific API error and return empty
      console.error('Trivia API returned an error code:', data.response_code);
      return [];
    }
    
    // Decode base64 encoded strings
    const decodedQuestions: Question[] = data.results.map((item: any) => {
        return {
            ...item,
            category: atob(item.category),
            question: atob(item.question),
            correct_answer: atob(item.correct_answer),
            incorrect_answers: item.incorrect_answers.map((ans: string) => atob(ans)),
        };
    });

    return decodedQuestions;
  } catch (error) {
    console.error('Error fetching trivia questions:', error);
    return [];
  }
}
