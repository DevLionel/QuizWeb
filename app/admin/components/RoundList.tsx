'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { createRound, updateRound, deleteRound, findOrCreateSubject } from '../actions'
import type { RoundResponse, CreateRoundPayload, RoundType, SubjectResponse } from '../../lib/types'

const ROUND_TYPES: { value: RoundType; label: string }[] = [
  { value: 'QuestionRound', label: 'Vragenronde' },
  { value: 'PhotoRound', label: 'Fotoronde' },
  { value: 'PassportRound', label: 'Paspoort ronde' },
]

export default function RoundList({
  rounds,
  categoryId,
  subjects: initialSubjects,
}: {
  rounds: RoundResponse[]
  categoryId: number
  subjects: SubjectResponse[]
}) {
  // Local copies so the UI updates immediately without waiting for server re-render.
  const [localRounds, setLocalRounds] = useState<RoundResponse[]>(rounds)
  const [subjects, setSubjects] = useState<SubjectResponse[]>(initialSubjects)

  const [editId, setEditId] = useState<number | null>(null)
  const [editData, setEditData] = useState<Partial<CreateRoundPayload> & { subjectInput: string }>({
    subjectInput: '',
  })

  const [newName, setNewName] = useState('')
  const [newSubjectInput, setNewSubjectInput] = useState('')
  const [newType, setNewType] = useState<RoundType>('QuestionRound')
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  function startEdit(round: RoundResponse) {
    setEditId(round.id)
    setEditData({
      name: round.name,
      subjectId: round.subjectId,
      subjectInput: round.subjectName ?? '',
      displayOrder: round.displayOrder,
      roundType: round.roundType,
      categoryId,
    })
  }

  /** Resolves the subject text input → subjectId.
   *  If the text is empty → null.
   *  If the text matches an existing subject → use its id.
   *  If the text is new → create the subject and return its id.
   *  Also updates the local subjects list so the new subject appears immediately.
   */
  async function resolveSubjectId(input: string): Promise<number | null> {
    const name = input.trim()
    if (!name) return null
    const existing = subjects.find(s => s.name.toLowerCase() === name.toLowerCase())
    if (existing) return existing.id
    const created = await findOrCreateSubject(name)
    setSubjects(prev => [...prev, created])
    return created.id
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setMessage(null)
    startTransition(async () => {
      try {
        const subjectId = await resolveSubjectId(newSubjectInput)
        const payload: CreateRoundPayload = {
          name: newName.trim(),
          subjectId,
          displayOrder: localRounds.length + 1,
          roundType: newType,
          categoryId,
        }
        const created = await createRound(payload)
        setLocalRounds(prev => [...prev, created])
        setNewName('')
        setNewSubjectInput('')
        setNewType('QuestionRound')
        setMessage({ text: `Ronde "${created.name}" aangemaakt.`, ok: true })
      } catch (err) {
        setMessage({ text: 'Fout: ' + (err as Error).message, ok: false })
      }
    })
  }

  function handleUpdate(e: React.FormEvent, id: number) {
    e.preventDefault()
    const name = editData.name?.trim()
    if (!name) return
    setMessage(null)

    startTransition(async () => {
      try {
        const subjectId = await resolveSubjectId(editData.subjectInput ?? '')
        const payload: CreateRoundPayload = {
          name,
          subjectId,
          displayOrder: editData.displayOrder ?? 1,
          roundType: editData.roundType ?? 'QuestionRound',
          categoryId: editData.categoryId ?? categoryId,
        }
        const updated = await updateRound(id, payload)
        // If the API returns 204 (no body), fall back to the data we just sent
        const updatedRound: RoundResponse = updated ?? {
          id,
          ...payload,
          subjectName: subjects.find(s => s.id === subjectId)?.name ?? null,
          categoryName: localRounds.find(r => r.id === id)?.categoryName ?? '',
        }
        setLocalRounds(prev => prev.map(r => r.id === id ? updatedRound : r))
        setEditId(null)
        setMessage({ text: 'Ronde bijgewerkt.', ok: true })
      } catch (err) {
        setMessage({ text: 'Fout: ' + (err as Error).message, ok: false })
      }
    })
  }

  function handleDelete(id: number, name: string) {
    if (!confirm(`Ronde "${name}" verwijderen? Alle vragen in deze ronde worden ook verwijderd.`)) return
    setMessage(null)
    startTransition(async () => {
      try {
        await deleteRound(id, categoryId)
        setLocalRounds(prev => prev.filter(r => r.id !== id))
        setMessage({ text: `Ronde "${name}" verwijderd.`, ok: true })
      } catch (err) {
        setMessage({ text: 'Fout: ' + (err as Error).message, ok: false })
      }
    })
  }

  const inputCls = 'border rounded p-2 text-sm dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600'

  return (
    <div>
      {/* Create form */}
      <form onSubmit={handleCreate} className="flex gap-3 mb-6 flex-wrap">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Nieuwe rondenaam…"
          required
          className={`flex-1 min-w-40 ${inputCls}`}
        />
        {/* Subject: free-text with datalist suggestions from existing subjects */}
        <input
          list="subjects-create"
          value={newSubjectInput}
          onChange={e => setNewSubjectInput(e.target.value)}
          placeholder="Onderwerp… (bijv. Beroemde schilders)"
          className={`flex-1 min-w-52 ${inputCls}`}
        />
        <datalist id="subjects-create">
          {subjects.map(s => <option key={s.id} value={s.name} />)}
        </datalist>
        <select value={newType} onChange={e => setNewType(e.target.value as RoundType)}
          className={inputCls}>
          {ROUND_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <button type="submit" disabled={isPending}
          className="bg-green-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50">
          + Ronde toevoegen
        </button>
      </form>

      {message && (
        <p className={`mb-4 text-sm ${message.ok ? 'text-green-700' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}

      {localRounds.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">Nog geen rondes. Maak er een aan hierboven.</p>
      ) : (
        <div className="space-y-3">
          {localRounds
            .slice()
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map(round => (
              <div key={round.id}
                className="border dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
                {editId === round.id ? (
                  <form onSubmit={e => handleUpdate(e, round.id)}
                    className="flex gap-2 items-center p-4 flex-wrap">
                    <input
                      value={editData.name ?? ''}
                      onChange={e => setEditData(d => ({ ...d, name: e.target.value }))}
                      required autoFocus
                      placeholder="Rondenaam"
                      className={`flex-1 min-w-32 ${inputCls}`}
                    />
                    {/* Subject: free-text + datalist for autocomplete; creates new if not found */}
                    <input
                      list="subjects-edit"
                      value={editData.subjectInput ?? ''}
                      onChange={e => setEditData(d => ({ ...d, subjectInput: e.target.value }))}
                      placeholder="Onderwerp"
                      className={`flex-1 min-w-40 ${inputCls}`}
                    />
                    <datalist id="subjects-edit">
                      {subjects.map(s => <option key={s.id} value={s.name} />)}
                    </datalist>
                    <input
                      type="number"
                      value={editData.displayOrder ?? 1}
                      onChange={e => setEditData(d => ({ ...d, displayOrder: Number(e.target.value) }))}
                      className={`w-20 ${inputCls}`}
                      title="Volgorde"
                    />
                    <select
                      value={editData.roundType ?? 'QuestionRound'}
                      onChange={e => setEditData(d => ({ ...d, roundType: e.target.value as RoundType }))}
                      className={inputCls}>
                      {ROUND_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <button type="submit" disabled={isPending}
                      className="bg-blue-600 text-white px-3 py-2 rounded text-sm disabled:opacity-50">
                      Opslaan
                    </button>
                    <button type="button" onClick={() => setEditId(null)}
                      className="text-gray-500 px-3 py-2 rounded text-sm border border-gray-300 dark:border-gray-600">
                      Annuleren
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-3 p-4">
                    <span className="text-xs text-gray-400 w-6 text-center font-mono">
                      {round.displayOrder}
                    </span>
                    <div className="flex-1">
                      <span className="font-semibold dark:text-gray-100">{round.name}</span>
                      <span className="text-xs text-gray-400 ml-2 font-mono">{round.roundType}</span>
                      {round.subjectName && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{round.subjectName}</p>
                      )}
                    </div>
                    <Link
                      href={`/admin/categories/${categoryId}/rounds/${round.id}`}
                      className="text-sm text-blue-600 dark:text-blue-400 underline">
                      {round.roundType === 'PhotoRound' ? "Foto's beheren →" : 'Vragen beheren →'}
                    </Link>
                    <button onClick={() => startEdit(round)}
                      className="text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 px-3 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                      Bewerken
                    </button>
                    <button onClick={() => handleDelete(round.id, round.name)} disabled={isPending}
                      className="text-sm text-red-600 border border-red-300 px-3 py-1.5 rounded hover:bg-red-50 disabled:opacity-50">
                      Verwijder
                    </button>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
