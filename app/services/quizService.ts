import { apiFetch } from "../lib/apiClient";

export interface Answer {
  id: number
  answerText: string
  isCorrect: boolean
}

export interface Question {
  id: number
  questionText: string
  templateTypeId: number
  mediaType: string
  mediaUrl: string | null
  answers: Answer[]
}

export async function getQuestion(questionId: number): Promise<Question> {
  return apiFetch(`/quiz/${questionId}`)
}

export async function getAllQuestions(): Promise<Question[]> {
  return apiFetch(`/quiz`)
}