'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { createCategory, updateCategory, deleteCategory } from '../actions'
import type { CategoryResponse } from '../../lib/types'

export default function CategoryList({ categories }: { categories: CategoryResponse[] }) {
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [newName, setNewName] = useState('')
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  function startEdit(cat: CategoryResponse) {
    setEditId(cat.id)
    setEditName(cat.name)
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setMessage(null)
    startTransition(async () => {
      try {
        await createCategory(newName.trim())
        setNewName('')
        setMessage({ text: `Categorie "${newName.trim()}" aangemaakt.`, ok: true })
      } catch (err) {
        setMessage({ text: 'Fout: ' + (err as Error).message, ok: false })
      }
    })
  }

  function handleUpdate(e: React.FormEvent, id: number) {
    e.preventDefault()
    if (!editName.trim()) return
    setMessage(null)
    startTransition(async () => {
      try {
        await updateCategory(id, editName.trim())
        setEditId(null)
        setMessage({ text: 'Categorie bijgewerkt.', ok: true })
      } catch (err) {
        setMessage({ text: 'Fout: ' + (err as Error).message, ok: false })
      }
    })
  }

  function handleDelete(id: number, name: string) {
    if (!confirm(`Categorie "${name}" verwijderen? Alle rondes en vragen worden ook verwijderd.`)) return
    setMessage(null)
    startTransition(async () => {
      try {
        await deleteCategory(id)
        setMessage({ text: `Categorie "${name}" verwijderd.`, ok: true })
      } catch (err) {
        setMessage({ text: 'Fout: ' + (err as Error).message, ok: false })
      }
    })
  }

  return (
    <div>
      {/* Create form */}
      <form onSubmit={handleCreate} className="flex gap-3 mb-6">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Nieuwe categorienaam…"
          required
          className="flex-1 border rounded p-2 text-sm dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
        />
        <button type="submit" disabled={isPending}
          className="bg-green-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50">
          + Categorie toevoegen
        </button>
      </form>

      {message && (
        <p className={`mb-4 text-sm ${message.ok ? 'text-green-700' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}

      {categories.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">Nog geen categorieën. Maak er een aan hierboven.</p>
      ) : (
        <div className="space-y-3">
          {categories.map(cat => (
            <div key={cat.id}
              className="border dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
              {editId === cat.id ? (
                <form onSubmit={e => handleUpdate(e, cat.id)}
                  className="flex gap-2 items-center p-4">
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    required autoFocus
                    className="flex-1 border rounded p-2 text-sm dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                  />
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
                  <div className="flex-1">
                    <span className="font-semibold dark:text-gray-100">{cat.name}</span>
                    <span className="text-xs text-gray-400 ml-2">#{cat.id}</span>
                  </div>
                  <Link href={`/admin/categories/${cat.id}`}
                    className="text-sm text-blue-600 dark:text-blue-400 underline">
                    Rondes beheren →
                  </Link>
                  <button onClick={() => startEdit(cat)}
                    className="text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 px-3 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                    Bewerken
                  </button>
                  <button onClick={() => handleDelete(cat.id, cat.name)} disabled={isPending}
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
