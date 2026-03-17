import { apiFetch } from "../lib/apiClient";

export interface Answer {
  id: number;
  answerText: string;
  isCorrect: boolean;
}

export interface Question {
  id: number;
  questionText: string;
  templateTypeId: number;
  mediaType: string;
  mediaUrl: string;
  answers: Answer[];
}

export async function getQuiz(templateId: number): Promise<Question[]> {
  return apiFetch(`/quiz/${templateId}`);
}