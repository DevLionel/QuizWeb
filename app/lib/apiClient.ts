/**
 * Thin HTTP fetch wrapper for the Quiz REST API.
 * Base URL is read from the server-only env var QUIZ_API_BASE_URL.
 * All calls happen in Server Components / Server Actions — never in the browser.
 */

const BASE = process.env.QUIZ_API_BASE_URL ?? 'http://192.168.2.50:5059'

function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
  const url = new URL(path, BASE)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value))
      }
    }
  }
  return url.toString()
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`API ${res.status}: ${text}`)
  }
  // Some DELETE endpoints return 200 with no body
  const contentType = res.headers.get('content-type') ?? ''
  if (contentType.includes('application/json') || contentType.includes('text/plain')) {
    const text = await res.text()
    if (!text) return undefined as T
    try {
      return JSON.parse(text) as T
    } catch {
      return text as unknown as T
    }
  }
  return undefined as T
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | undefined>
): Promise<T> {
  const res = await fetch(buildUrl(path, params), {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })
  return handleResponse<T>(res)
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(buildUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })
  return handleResponse<T>(res)
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(buildUrl(path), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })
  return handleResponse<T>(res)
}

export async function apiDelete(path: string): Promise<void> {
  const res = await fetch(buildUrl(path), {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  })
  await handleResponse<void>(res)
}

/**
 * Upload a media file to the API.
 * @param kind  'images' or 'videos'
 * @param formData  FormData containing the file under the key "file"
 * @returns The public URL of the uploaded file as a string
 */
export async function uploadMedia(
  kind: 'images' | 'videos',
  formData: FormData
): Promise<string> {
  const res = await fetch(buildUrl(`/api/media/${kind}`), {
    method: 'POST',
    body: formData,
    // Do NOT set Content-Type — browser/Node sets multipart boundary automatically
  })
  return handleResponse<string>(res)
}
