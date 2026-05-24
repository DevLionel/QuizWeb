import { apiGet, apiPost, apiPut, apiDelete } from '../lib/apiClient'
import type { RoundResponse, CreateRoundPayload } from '../lib/types'

export async function getRoundsForCategory(categoryId: number): Promise<RoundResponse[]> {
  return apiGet<RoundResponse[]>('/api/Rounds', { categoryId })
}

export async function getRoundById(id: number): Promise<RoundResponse> {
  return apiGet<RoundResponse>(`/api/Rounds/${id}`)
}

export async function createRound(data: CreateRoundPayload): Promise<RoundResponse> {
  return apiPost<RoundResponse>('/api/Rounds', data)
}

export async function updateRound(id: number, data: CreateRoundPayload): Promise<RoundResponse> {
  return apiPut<RoundResponse>(`/api/Rounds/${id}`, data)
}

export async function deleteRound(id: number): Promise<void> {
  return apiDelete(`/api/Rounds/${id}`)
}
