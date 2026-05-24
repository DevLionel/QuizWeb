'use client'

import { useState, useTransition } from 'react'
import { saveQuestion, uploadMediaFile } from '../actions'
import type { CreateQuestionPayload } from '../../lib/types'

interface Props {
  roundId: number
  questionCount: number  // how many cards already exist (0–9)
}

export default function AddPhotoCardForm({ roundId, questionCount }: Props) {
  const [answerText, setAnswerText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [urlError, setUrlError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [cardCount, setCardCount] = useState(questionCount)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  function validateImageUrl(url: string): string | null {
    if (!url.trim()) return null
    try { new URL(url) } catch { return 'Voer een geldige URL in (beginnend met https://)' }
    const isImage = /\.(jpg|jpeg|png|gif|webp|svg|avif)(\?.*)?$/i.test(url)
    if (!isImage) return 'URL moet eindigen met een afbeeldingsextensie (.jpg, .png, .webp, …)'
    return null
  }

  function handleUrlChange(url: string) {
    setUrlError(validateImageUrl(url))
    setImageUrl(url)
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUrlError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const url = await uploadMediaFile(fd, 'images')
      setImageUrl(url)
      setUrlError(null)
    } catch (err) {
      setUrlError('Upload mislukt: ' + (err as Error).message)
    } finally {
      setUploading(false)
    }
  }

  function resetForm() {
    setAnswerText('')
    setImageUrl('')
    setUrlError(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const urlErr = validateImageUrl(imageUrl)
    if (urlErr) { setUrlError(urlErr); return }
    if (!imageUrl.trim()) {
      setMessage({ text: 'Voeg een afbeelding toe voor deze kaart.', ok: false })
      return
    }

    setMessage(null)

    const payload: CreateQuestionPayload = {
      text: answerText,
      questionType: 'MultipleChoice',
      roundId,
      mediaType: 'Image',
      mediaUrl: imageUrl.trim(),
      answers: [{ text: answerText, isCorrect: true, displayOrder: 1 }],
    }

    startTransition(async () => {
      try {
        await saveQuestion(roundId, payload)
        const newCount = cardCount + 1
        setCardCount(newCount)
        setMessage({ text: `Kaart opgeslagen! (${newCount} / 9)`, ok: true })
        resetForm()
      } catch (err) {
        setMessage({ text: 'Fout: ' + (err as Error).message, ok: false })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-6 bg-white dark:bg-gray-900 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold dark:text-gray-100">Fotokaart toevoegen</h2>
        <span className="text-sm font-medium text-gray-400 tabular-nums">
          {cardCount} / 9 kaarten
        </span>
      </div>

      {/* Image field */}
      <div className="mb-4">
        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Afbeelding
        </span>

        <input
          value={imageUrl}
          onChange={e => handleUrlChange(e.target.value)}
          placeholder="https://example.com/foto.jpg"
          className={`block w-full border rounded p-2 text-sm dark:bg-gray-800 dark:text-gray-100 mb-2 ${
            urlError ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'
          }`}
        />

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 dark:text-gray-400">Of upload bestand:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="text-xs"
          />
          {uploading && <span className="text-xs text-blue-500">Uploading…</span>}
        </div>

        {urlError && <p className="text-red-500 text-xs mt-1">{urlError}</p>}
        {!urlError && imageUrl && (
          <p className="text-green-600 text-xs mt-1">✓ Geldige afbeelding URL</p>
        )}
      </div>

      {/* Answer field */}
      <label className="block mb-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Antwoord</span>
        <input
          value={answerText}
          onChange={e => setAnswerText(e.target.value)}
          required
          placeholder="Het juiste antwoord op deze foto…"
          className="mt-1 block w-full border rounded p-2 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
        />
      </label>

      <button
        type="submit"
        disabled={isPending || uploading || cardCount >= 9}
        className="bg-blue-600 dark:bg-blue-500 text-white dark:text-gray-900 px-6 py-2 rounded disabled:opacity-50"
      >
        {isPending ? 'Opslaan...' : cardCount >= 9 ? 'Ronde vol (9/9)' : 'Kaart opslaan'}
      </button>

      {message && (
        <p className={`mt-3 text-sm ${message.ok ? 'text-green-700 dark:text-green-400' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}
    </form>
  )
}
