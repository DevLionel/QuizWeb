import { apiGet, apiPost, apiPut, apiDelete } from '../lib/apiClient'
import { mapQuestion } from '../lib/types'
import type { Question, QuestionResponse, CreateQuestionPayload } from '../lib/types'

export type { CreateQuestionPayload }

export async function getQuestionsForRound(roundId: number): Promise<Question[]> {
  const responses = await apiGet<QuestionResponse[]>('/api/Questions', { roundId, pageSize: 200 })
  return responses.map(mapQuestion)
}

export async function getQuestionById(id: number): Promise<Question> {
  const response = await apiGet<QuestionResponse>(`/api/Questions/${id}`)
  return mapQuestion(response)
}

export async function createQuestion(payload: CreateQuestionPayload): Promise<QuestionResponse> {
  return apiPost<QuestionResponse>('/api/Questions', payload)
}

export async function updateQuestion(
  id: number,
  payload: CreateQuestionPayload
): Promise<QuestionResponse> {
  return apiPut<QuestionResponse>(`/api/Questions/${id}`, payload)
}

export async function deleteQuestion(id: number): Promise<void> {
  return apiDelete(`/api/Questions/${id}`)
}
