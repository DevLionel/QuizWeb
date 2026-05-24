import { apiGet, apiPost, apiPut, apiDelete } from '../lib/apiClient'
import type { CategoryResponse } from '../lib/types'

export async function getAllCategories(): Promise<CategoryResponse[]> {
  return apiGet<CategoryResponse[]>('/api/Categories')
}

export async function getCategoryById(id: number): Promise<CategoryResponse> {
  return apiGet<CategoryResponse>(`/api/Categories/${id}`)
}

export async function createCategory(name: string): Promise<CategoryResponse> {
  return apiPost<CategoryResponse>('/api/Categories', { name })
}

export async function updateCategory(id: number, name: string): Promise<CategoryResponse> {
  return apiPut<CategoryResponse>(`/api/Categories/${id}`, { name })
}

export async function deleteCategory(id: number): Promise<void> {
  return apiDelete(`/api/Categories/${id}`)
}
