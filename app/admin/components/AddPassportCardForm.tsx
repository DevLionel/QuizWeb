'use client'

import { useState, useTransition } from 'react'
import { saveQuestion, uploadMediaFile } from '../actions'
import type { CreateQuestionPayload, AnswerPayload } from '../../lib/types'

interface HistorieRow {
  seizoen: string
  club: string
  w: string
  g: string
}

const inputCls = 'border rounded p-2 text-sm dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600'

// ── Moved outside to prevent remount on every keystroke ───────────────────────

function RowSection({
  label, colLabel, rows, update, onAdd, onRemove,
}: {
  label: string
  colLabel: string
  rows: HistorieRow[]
  update: (i: number, f: keyof HistorieRow, v: string) => void
  onAdd: () => void
  onRemove: (i: number) => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <button type="button" onClick={onAdd}
          className="text-xs text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-600 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30">
          + Rij toevoegen
        </button>
      </div>
      <div className="grid grid-cols-[1fr_1.5fr_4rem_4rem_2rem] gap-2 mb-1 px-1">
        {['Seizoen', colLabel, 'W', '(g)', ''].map(h => (
          <span key={h} className="text-xs font-semibold text-gray-400 uppercase">{h}</span>
        ))}
      </div>
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-[1fr_1.5fr_4rem_4rem_2rem] gap-2 items-center">
            <input value={row.seizoen} onChange={e => update(i, 'seizoen', e.target.value)} placeholder="1981–1987" className={inputCls} />
            <input value={row.club}    onChange={e => update(i, 'club',    e.target.value)} placeholder={colLabel === 'Land' ? 'Nederland' : 'Ajax'} className={inputCls} />
            <input value={row.w}       onChange={e => update(i, 'w',       e.target.value)} placeholder="58" type="number" min="0" className={inputCls} />
            <input value={row.g}       onChange={e => update(i, 'g',       e.target.value)} placeholder="24" type="number" min="0" className={inputCls} />
            <button type="button" onClick={() => onRemove(i)} disabled={rows.length === 1}
              className="text-red-400 hover:text-red-600 disabled:opacity-30 text-lg leading-none" title="Rij verwijderen">×</button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main form ─────────────────────────────────────────────────────────────────

interface Props {
  roundId: number
  questionCount: number
}

export default function AddPassportCardForm({ roundId, questionCount }: Props) {
  const [naam, setNaam] = useState('')
  const [geboortedatum, setGeboortedatum] = useState('')
  const [nationaliteit, setNationaliteit] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [urlError, setUrlError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [historieRows, setHistorieRows] = useState<HistorieRow[]>([
    { seizoen: '', club: '', w: '', g: '' },
  ])
  const [interlandRows, setInterlandRows] = useState<HistorieRow[]>([
    { seizoen: '', club: '', w: '', g: '' },
  ])
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

  function updateHistorieRow(index: number, field: keyof HistorieRow, value: string) {
    setHistorieRows(prev => { const u = [...prev]; u[index] = { ...u[index], [field]: value }; return u })
  }
  function updateInterlandRow(index: number, field: keyof HistorieRow, value: string) {
    setInterlandRows(prev => { const u = [...prev]; u[index] = { ...u[index], [field]: value }; return u })
  }

  function resetForm() {
    setNaam(''); setGeboortedatum(''); setNationaliteit(''); setImageUrl(''); setUrlError(null)
    setHistorieRows([{ seizoen: '', club: '', w: '', g: '' }])
    setInterlandRows([{ seizoen: '', club: '', w: '', g: '' }])
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const urlErr = validateImageUrl(imageUrl)
    if (urlErr) { setUrlError(urlErr); return }
    if (!imageUrl.trim()) { setMessage({ text: 'Voeg een afbeelding toe voor deze kaart.', ok: false }); return }
    setMessage(null)

    const clubRows = historieRows.filter(r => r.seizoen.trim() || r.club.trim())
    const intRows  = interlandRows.filter(r => r.seizoen.trim() || r.club.trim())

    const clubText = clubRows.map(r =>
      `${r.seizoen.trim()}|${r.club.trim()}|${r.w.trim() || '0'}|${r.g.trim() || '0'}`
    ).join(';;') || '-'
    const intText = intRows.length > 0
      ? 'INTERLAND|' + intRows.map(r =>
          `${r.seizoen.trim()}|${r.club.trim()}|${r.w.trim() || '0'}|${r.g.trim() || '0'}`
        ).join(';;')
      : ''
    const careerData = [geboortedatum.trim(), nationaliteit.trim(), clubText, intText].join('\n')

    const answers: AnswerPayload[] = [
      { text: naam.trim(), isCorrect: true, displayOrder: 1 },
    ]

    const payload: CreateQuestionPayload = {
      text: careerData,
      questionType: 'Photo',
      roundId,
      mediaType: 'Image',
      mediaUrl: imageUrl.trim(),
      answers,
    }

    startTransition(async () => {
      try {
        await saveQuestion(roundId, payload)
        const newCount = cardCount + 1
        setCardCount(newCount)
        setMessage({ text: `Paspoort voor "${naam.trim()}" opgeslagen! (${newCount} / 9)`, ok: true })
        resetForm()
      } catch (err) {
        setMessage({ text: 'Fout: ' + (err as Error).message, ok: false })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-6 bg-white dark:bg-gray-900 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold dark:text-gray-100">Spelers Paspoort toevoegen</h2>
        <span className="text-sm font-medium text-gray-400 tabular-nums">{cardCount} / 9 kaarten</span>
      </div>

      {/* Photo */}
      <div>
        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Foto van speler</span>
        <input value={imageUrl} onChange={e => handleUrlChange(e.target.value)}
          placeholder="https://example.com/speler.jpg"
          className={`block w-full ${inputCls} mb-2 ${urlError ? 'border-red-400' : ''}`} />
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 dark:text-gray-400">Of upload:</label>
          <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} className="text-xs" />
          {uploading && <span className="text-xs text-blue-500">Uploading…</span>}
        </div>
        {urlError && <p className="text-red-500 text-xs mt-1">{urlError}</p>}
        {!urlError && imageUrl && <p className="text-green-600 text-xs mt-1">✓ Geldige afbeelding URL</p>}
      </div>

      {/* Personal details */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Naam *</span>
          <input value={naam} onChange={e => setNaam(e.target.value)} required
            placeholder="Marco van Basten" className={`mt-1 block w-full ${inputCls}`} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Geboortedatum</span>
          <input value={geboortedatum} onChange={e => setGeboortedatum(e.target.value)}
            placeholder="31 oktober 1964" className={`mt-1 block w-full ${inputCls}`} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nationaliteit</span>
          <input value={nationaliteit} onChange={e => setNationaliteit(e.target.value)}
            placeholder="Nederland" className={`mt-1 block w-full ${inputCls}`} />
        </label>
      </div>

      {/* Historie als speler */}
      <RowSection
        label="Historie als speler" colLabel="Club"
        rows={historieRows} update={updateHistorieRow}
        onAdd={() => setHistorieRows(prev => [...prev, { seizoen: '', club: '', w: '', g: '' }])}
        onRemove={i => setHistorieRows(prev => prev.filter((_, idx) => idx !== i))}
      />

      {/* Interlands */}
      <RowSection
        label="Interlands" colLabel="Land"
        rows={interlandRows} update={updateInterlandRow}
        onAdd={() => setInterlandRows(prev => [...prev, { seizoen: '', club: '', w: '', g: '' }])}
        onRemove={i => setInterlandRows(prev => prev.filter((_, idx) => idx !== i))}
      />

      <button type="submit" disabled={isPending || uploading || cardCount >= 9}
        className="bg-blue-600 dark:bg-blue-500 text-white dark:text-gray-900 px-6 py-2 rounded disabled:opacity-50">
        {isPending ? 'Opslaan...' : cardCount >= 9 ? 'Ronde vol (9/9)' : 'Paspoort opslaan'}
      </button>

      {message && (
        <p className={`text-sm ${message.ok ? 'text-green-700 dark:text-green-400' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}
    </form>
  )
}
