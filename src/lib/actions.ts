'use server';

import type { Question } from './types';

export async function getTriviaQuestions(): Promise<Question[]> {
  try {
    const response = await fetch('https://opentdb.com/api.php?amount=10&type=multiple&encode=base64');
    if (!response.ok) {
      throw new Error('Failed to fetch trivia questions.');
    }
    const data = await response.json();
    
    if (data.response_code !== 0) {
      throw new Error('Invalid response from trivia API.');
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
