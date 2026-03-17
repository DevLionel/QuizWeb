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
  mediaType: string | null;
  mediaUrl: string | null;
  answers: Answer[];
}

/**
 * Fetch quiz questions from API
 * @param templateId optional template id
 * @returns array of questions
 */
export async function getQuiz(templateId?: number): Promise<Question[]> {
  const url = templateId ? `/quiz?templateId=${templateId}` : `/quiz`;
  return apiFetch(url);
}