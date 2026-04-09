'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createQuiz } from '../actions'

type Quiz = { id: number; title: string }

export default function QuizSelector({
  quizzes,
  selectedQuizId,
}: {
  quizzes: Quiz[]
  selectedQuizId: number | null
}) {
  const router = useRouter()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    if (val === '') return
    router.push(`/admin?quizId=${val}`)
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      try {
        const newId = await createQuiz(newTitle)
        setNewTitle('')
        setShowCreateForm(false)
        router.push(`/admin?quizId=${newId}`)
      } catch (err) {
        setError((err as Error).message)
      }
    })
  }

  return (
    <div className="flex flex-col items-center gap-4 mb-8">
      {/* Quiz dropdown */}
      <div className="flex items-center gap-3">
        <label htmlFor="quiz-select" className="font-medium text-gray-700">
          Select quiz:
        </label>
        <select
          id="quiz-select"
          value={selectedQuizId ?? ''}
          onChange={handleSelect}
          className="border rounded p-2 min-w-[220px]"
        >
          <option value="" disabled>
            — choose a quiz —
          </option>
          {quizzes.map(q => (
            <option key={q.id} value={q.id}>
              {q.title}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setShowCreateForm(v => !v)}
          className="bg-green-600 text-white px-4 py-2 rounded text-sm"
        >
          {showCreateForm ? 'Cancel' : '+ New quiz'}
        </button>
      </div>

      {/* Create quiz form */}
      {showCreateForm && (
        <form
          onSubmit={handleCreate}
          className="flex items-end gap-3 border rounded-lg p-4 bg-gray-50 w-full max-w-lg"
        >
          <label className="flex-1">
            <span className="block text-sm font-medium text-gray-700 mb-1">Quiz name</span>
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              required
              autoFocus
              className="block w-full border rounded p-2 text-sm"
              placeholder="e.g. Geography Quiz 2025"
            />
          </label>
          <button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 dark:bg-blue-500 text-white dark:text-gray-900 px-5 py-2 rounded text-sm disabled:opacity-50"
          >
            {isPending ? 'Creating…' : 'Create'}
          </button>
          {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        </form>
      )}
    </div>
  )
}
