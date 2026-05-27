import { apiGet, apiPost } from '../lib/apiClient'
import type { SubjectResponse } from '../lib/types'

export async function getSubjects(): Promise<SubjectResponse[]> {
  return apiGet<SubjectResponse[]>('/api/Subjects')
}

export async function createSubject(name: string): Promise<SubjectResponse> {
  return apiPost<SubjectResponse>('/api/Subjects', { name: name.trim() })
}
