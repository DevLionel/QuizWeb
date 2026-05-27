'use server'
import { revalidatePath } from 'next/cache'
import { apiGet, apiPost, apiPut, apiDelete, uploadMedia } from '../lib/apiClient'
import type {
  CategoryResponse,
  RoundResponse,
  SubjectResponse,
  QuestionResponse,
  CreateQuestionPayload,
  CreateRoundPayload,
} from '../lib/types'

// ── Categories ────────────────────────────────────────────────────────────────

export async function createCategory(name: string): Promise<CategoryResponse> {
  const result = await apiPost<CategoryResponse>('/api/Categories', { name: name.trim() })
  revalidatePath('/admin')
  return result
}

export async function updateCategory(id: number, name: string): Promise<CategoryResponse> {
  const result = await apiPut<CategoryResponse>(`/api/Categories/${id}`, { name: name.trim() })
  revalidatePath('/admin')
  return result
}

export async function deleteCategory(id: number): Promise<void> {
  await apiDelete(`/api/Categories/${id}`)
  revalidatePath('/admin')
}

// ── Subjects ──────────────────────────────────────────────────────────────────

export async function getSubjects(): Promise<SubjectResponse[]> {
  return apiGet<SubjectResponse[]>('/api/Subjects')
}

/** Finds an existing subject by name (case-insensitive) or creates a new one. */
export async function findOrCreateSubject(name: string): Promise<SubjectResponse> {
  const trimmed = name.trim()
  const all = await apiGet<SubjectResponse[]>('/api/Subjects')
  const existing = all.find(s => s.name.toLowerCase() === trimmed.toLowerCase())
  if (existing) return existing
  return apiPost<SubjectResponse>('/api/Subjects', { name: trimmed })
}

// ── Rounds ────────────────────────────────────────────────────────────────────

export async function createRound(data: CreateRoundPayload): Promise<RoundResponse> {
  const result = await apiPost<RoundResponse>('/api/Rounds', data)
  revalidatePath(`/admin/categories/${data.categoryId}`)
  return result
}

export async function updateRound(
  id: number,
  data: CreateRoundPayload
): Promise<RoundResponse> {
  const result = await apiPut<RoundResponse>(`/api/Rounds/${id}`, data)
  revalidatePath(`/admin/categories/${data.categoryId}`)
  return result
}

export async function deleteRound(id: number, categoryId: number): Promise<void> {
  await apiDelete(`/api/Rounds/${id}`)
  revalidatePath(`/admin/categories/${categoryId}`)
}

// ── Questions ─────────────────────────────────────────────────────────────────

export async function saveQuestion(
  roundId: number,
  payload: CreateQuestionPayload
): Promise<QuestionResponse> {
  const result = await apiPost<QuestionResponse>('/api/Questions', { ...payload, roundId })
  revalidatePath('/admin')
  return result
}

export async function updateQuestion(
  id: number,
  payload: CreateQuestionPayload
): Promise<QuestionResponse> {
  const result = await apiPut<QuestionResponse>(`/api/Questions/${id}`, payload)
  revalidatePath('/admin')
  return result
}

export async function deleteQuestion(questionId: number): Promise<void> {
  await apiDelete(`/api/Questions/${questionId}`)
  revalidatePath('/admin')
}

// ── Media ─────────────────────────────────────────────────────────────────────

export async function uploadMediaFile(
  formData: FormData,
  kind: 'images' | 'videos'
): Promise<string> {
  return uploadMedia(kind, formData)
}
