'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { createRound, updateRound, deleteRound } from '../actions'
import type { RoundResponse, CreateRoundPayload } from '../../lib/types'

type RoundType = 'QuestionRound' | 'PhotoRound' | 'PassportRound'

const ROUND_TYPES: { value: RoundType; label: string }[] = [
  { value: 'QuestionRound', label: 'Vragenronde' },
  { value: 'PhotoRound', label: 'Fotoronde' },
  { value: 'PassportRound', label: 'Paspoort ronde' },
]

export default function RoundList({
  rounds,
  categoryId,
}: {
  rounds: RoundResponse[]
  categoryId: number
}) {
  const [editId, setEditId] = useState<number | null>(null)
  const [editData, setEditData] = useState<Partial<CreateRoundPayload>>({})
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<RoundType>('QuestionRound')
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  function startEdit(round: RoundResponse) {
    setEditId(round.id)
    setEditData({
      name: round.name,
      displayOrder: round.displayOrder,
      roundType: round.roundType,
      categoryId,
    })
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setMessage(null)
    const payload: CreateRoundPayload = {
      name: newName.trim(),
      displayOrder: (rounds.length + 1),
      roundType: newType,
      categoryId,
    }
    startTransition(async () => {
      try {
        await createRound(payload)
        setNewName('')
        setNewType('QuestionRound')
        setMessage({ text: `Ronde "${newName.trim()}" aangemaakt.`, ok: true })
      } catch (err) {
        setMessage({ text: 'Fout: ' + (err as Error).message, ok: false })
      }
    })
  }

  function handleUpdate(e: React.FormEvent, id: number) {
    e.preventDefault()
    if (!editData.name?.trim()) return
    setMessage(null)
    startTransition(async () => {
      try {
        await updateRound(id, editData as CreateRoundPayload)
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

      {rounds.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">Nog geen rondes. Maak er een aan hierboven.</p>
      ) : (
        <div className="space-y-3">
          {rounds
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
                      className={`flex-1 min-w-32 ${inputCls}`}
                    />
                    <input
                      type="number"
                      value={editData.displayOrder ?? 1}
                      onChange={e => setEditData(d => ({ ...d, displayOrder: Number(e.target.value) }))}
                      className={`w-20 ${inputCls}`}
                      title="Volgorde"
                    />
                    <select
                      value={editData.roundType ?? 'standard'}
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
                    </div>
                    <Link
                      href={`/admin/categories/${categoryId}/rounds/${round.id}`}
                      className="text-sm text-blue-600 dark:text-blue-400 underline">
                      Vragen beheren →
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
