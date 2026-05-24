'use client'
import { useState, useTransition } from 'react'
import { saveQuestion, uploadMediaFile } from '../actions'
import type { CreateQuestionPayload, AnswerPayload } from '../../lib/types'

type QuestionType = 'MultipleChoice' | 'TrueFalse' | 'LowerHigher' | 'LessMore'
type MediaType = 'YouTubeClip' | 'YouTubeShort' | 'Image' | 'Mp4'
type MCOption = { text: string; isCorrect: boolean }

// ── Icons ─────────────────────────────────────────────────────────────────────

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1C4.5 20.5 12 20.5 12 20.5s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.8 15.5V8.5l6.4 3.5-6.4 3.5z" />
    </svg>
  )
}

function PhotoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  )
}

function SoundIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5" aria-hidden="true">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  )
}

// ── Validation ────────────────────────────────────────────────────────────────

function validateUrl(type: MediaType, url: string): string | null {
  if (!url.trim()) return null
  try { new URL(url) } catch { return 'Voer een geldige URL in (beginnend met https://)' }
  if (type === 'YouTubeClip' || type === 'YouTubeShort') {
    const isYt =
      /youtube\.com\/watch\?.*v=[\w-]+/.test(url) ||
      /youtu\.be\/[\w-]+/.test(url) ||
      /youtube\.com\/embed\/[\w-]+/.test(url) ||
      /youtube\.com\/shorts\/[\w-]+/.test(url)
    if (!isYt) return 'Moet een YouTube URL zijn (youtube.com/watch?v=… of youtu.be/…)'
  }
  if (type === 'Image') {
    const isImage = /\.(jpg|jpeg|png|gif|webp|svg|avif)(\?.*)?$/i.test(url)
    if (!isImage) return 'URL moet eindigen met een afbeeldingsextensie (.jpg, .png, .webp, …)'
  }
  if (type === 'Mp4') {
    const isMedia = /\.(mp4|mp3|wav|ogg|m4a|aac|flac|webm)(\?.*)?$/i.test(url)
    if (!isMedia) return 'URL moet eindigen met een media-extensie (.mp4, .mp3, .wav, …)'
  }
  return null
}

// ── Media picker ──────────────────────────────────────────────────────────────

type MediaState = { type: MediaType; url: string } | null

function MediaFields({
  value, onChange,
}: {
  value: MediaState
  onChange: (v: MediaState) => void
}) {
  const [urlError, setUrlError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  function selectType(t: MediaType) {
    if (value?.type === t) { onChange(null); setUrlError(null) }
    else { onChange({ type: t, url: '' }); setUrlError(null) }
  }

  function handleUrlChange(url: string) {
    if (!value) return
    setUrlError(validateUrl(value.type, url))
    onChange({ ...value, url })
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !value) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const kind = value.type === 'Mp4' ? 'videos' : 'images'
      const url = await uploadMediaFile(fd, kind)
      onChange({ ...value, url })
      setUrlError(null)
    } catch (err) {
      setUrlError('Upload mislukt: ' + (err as Error).message)
    } finally {
      setUploading(false)
    }
  }

  const btnBase = 'flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors'
  const active = 'bg-blue-600 dark:bg-blue-500 text-white dark:text-gray-900 border-blue-600 dark:border-blue-500'
  const inactive = 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 dark:bg-transparent dark:text-gray-300 dark:border-gray-600'

  const placeholders: Record<MediaType, string> = {
    YouTubeClip: 'https://www.youtube.com/watch?v=…',
    YouTubeShort: 'https://www.youtube.com/shorts/…',
    Image: 'https://example.com/image.jpg',
    Mp4: 'https://example.com/video.mp4',
  }

  return (
    <div className="mb-4">
      <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Media (optioneel)</span>
      <div className="flex gap-2 mb-3 flex-wrap">
        {([
          { type: 'YouTubeClip', label: 'YouTube', icon: <YoutubeIcon />, color: 'text-red-500' },
          { type: 'YouTubeShort', label: 'YT Short', icon: <YoutubeIcon />, color: 'text-red-400' },
          { type: 'Image', label: 'Foto', icon: <PhotoIcon />, color: 'text-green-600' },
          { type: 'Mp4', label: 'Video/Audio', icon: <SoundIcon />, color: 'text-purple-600' },
        ] as { type: MediaType; label: string; icon: React.ReactNode; color: string }[]).map(({ type: t, label, icon, color }) => (
          <button key={t} type="button" onClick={() => selectType(t)}
            className={`${btnBase} ${value?.type === t ? active : inactive}`}>
            <span className={color}>{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {value && (
        <div className="space-y-2">
          <input value={value.url} onChange={e => handleUrlChange(e.target.value)}
            placeholder={placeholders[value.type]}
            className={`block w-full border rounded p-2 text-sm dark:bg-gray-800 dark:text-gray-100 ${urlError ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
          />
          {(value.type === 'Image' || value.type === 'Mp4') && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 dark:text-gray-400">Of upload bestand:</label>
              <input type="file"
                accept={value.type === 'Image' ? 'image/*' : 'video/*,audio/*'}
                onChange={handleFileUpload} disabled={uploading}
                className="text-xs" />
              {uploading && <span className="text-xs text-blue-500">Uploading…</span>}
            </div>
          )}
          {urlError && <p className="text-red-500 text-xs">{urlError}</p>}
          {!urlError && value.url && <p className="text-green-600 text-xs">Geldige {value.type} URL</p>}
        </div>
      )}
    </div>
  )
}

// ── Answer sub-forms ──────────────────────────────────────────────────────────

function TrueFalseFields({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <fieldset className="mb-4">
      <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Correct antwoord</legend>
      <label className="flex items-center gap-2 text-sm dark:text-gray-200">
        <input type="radio" checked={value === true} onChange={() => onChange(true)} /> Waar
      </label>
      <label className="flex items-center gap-2 text-sm mt-1 dark:text-gray-200">
        <input type="radio" checked={value === false} onChange={() => onChange(false)} /> Niet waar
      </label>
    </fieldset>
  )
}

function MultipleChoiceFields({ options, onChange }: { options: MCOption[]; onChange: (opts: MCOption[]) => void }) {
  function updateOption(index: number, patch: Partial<MCOption>) {
    onChange(options.map((o, i) => (i === index ? { ...o, ...patch } : o)))
  }
  return (
    <div className="mb-4">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Antwoordopties</span>
      <p className="text-xs text-gray-400 mb-2">Vink het juiste antwoord aan.</p>
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2 mt-2">
          <input type="checkbox" checked={opt.isCorrect}
            onChange={e => updateOption(i, { isCorrect: e.target.checked })} title="Correct antwoord" />
          <input value={opt.text} onChange={e => updateOption(i, { text: e.target.value })}
            placeholder={`Optie ${i + 1}`} required
            className="flex-1 border rounded p-2 text-sm dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600" />
          {options.length > 2 && (
            <button type="button" onClick={() => onChange(options.filter((_, j) => j !== i))}
              className="text-red-500 text-xs px-2">Verwijder</button>
          )}
        </div>
      ))}
      <button type="button" onClick={() => onChange([...options, { text: '', isCorrect: false }])}
        className="mt-3 text-sm text-blue-600 dark:text-blue-300 underline">+ Optie toevoegen</button>
    </div>
  )
}

function MoreLessFields({ referenceValue, onReferenceChange, answer, onAnswerChange, unit, onUnitChange, questionType }: {
  referenceValue: string; onReferenceChange: (v: string) => void
  answer: string; onAnswerChange: (v: string) => void
  unit: string; onUnitChange: (v: string) => void
  questionType: QuestionType
}) {
  const isLowerHigher = questionType === 'LowerHigher'
  return (
    <div className="mb-4 grid grid-cols-3 gap-3">
      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Referentiewaarde</span>
        <input type="number" value={referenceValue} onChange={e => onReferenceChange(e.target.value)} required
          className="mt-1 block w-full border rounded p-2 text-sm dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600" />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Eenheid (bijv. kg)</span>
        <input value={unit} onChange={e => onUnitChange(e.target.value)} placeholder="kg, cm, …"
          className="mt-1 block w-full border rounded p-2 text-sm dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600" />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Correct antwoord</span>
        <select value={answer} onChange={e => onAnswerChange(e.target.value)}
          className="mt-1 block w-full border rounded p-2 text-sm dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600">
          <option value="more">{isLowerHigher ? 'Hoger' : 'Meer'}</option>
          <option value="less">{isLowerHigher ? 'Lager' : 'Minder'}</option>
        </select>
      </label>
    </div>
  )
}

// ── Main form ─────────────────────────────────────────────────────────────────

export default function AddQuestionForm({ roundId }: { roundId: number }) {
  const [type, setType] = useState<QuestionType>('MultipleChoice')
  const [questionText, setQuestionText] = useState('')
  const [media, setMedia] = useState<MediaState>(null)

  const [tfCorrect, setTfCorrect] = useState(true)
  const [mcOptions, setMcOptions] = useState<MCOption[]>([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ])
  const [mlRef, setMlRef] = useState('')
  const [mlAnswer, setMlAnswer] = useState('more')
  const [mlUnit, setMlUnit] = useState('')

  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  function resetForm() {
    setQuestionText('')
    setMedia(null)
    setTfCorrect(true)
    setMcOptions([{ text: '', isCorrect: false }, { text: '', isCorrect: false }])
    setMlRef('')
    setMlAnswer('more')
    setMlUnit('')
  }

  function buildAnswers(): AnswerPayload[] {
    if (type === 'TrueFalse') {
      return [
        { text: 'Waar', isCorrect: tfCorrect === true, displayOrder: 1 },
        { text: 'Niet waar', isCorrect: tfCorrect === false, displayOrder: 2 },
      ]
    }
    if (type === 'MultipleChoice') {
      return mcOptions.map((opt, i) => ({
        text: opt.text,
        isCorrect: opt.isCorrect,
        displayOrder: i + 1,
      }))
    }
    if (type === 'LowerHigher') {
      return [
        { text: 'Lager', isCorrect: mlAnswer === 'less', displayOrder: 1 },
        { text: 'Hoger', isCorrect: mlAnswer === 'more', displayOrder: 2 },
      ]
    }
    // LessMore
    return [
      { text: 'Meer', isCorrect: mlAnswer === 'more', displayOrder: 1 },
      { text: 'Minder', isCorrect: mlAnswer === 'less', displayOrder: 2 },
    ]
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (media?.url && validateUrl(media.type, media.url)) {
      setMessage({ text: 'Herstel de media-URL voor het opslaan.', ok: false })
      return
    }
    if (type === 'MultipleChoice' && !mcOptions.some(o => o.isCorrect)) {
      setMessage({ text: 'Vink minstens één correct antwoord aan.', ok: false })
      return
    }
    setMessage(null)

    const validMedia = (media?.url?.trim()) ? media : null
    const payload: CreateQuestionPayload = {
      text: questionText,
      questionType: type,
      roundId,
      mediaType: validMedia?.type ?? null,
      mediaUrl: validMedia?.url ?? null,
      answers: buildAnswers(),
    }

    startTransition(async () => {
      try {
        await saveQuestion(roundId, payload)
        setMessage({ text: 'Vraag opgeslagen!', ok: true })
        resetForm()
      } catch (err) {
        setMessage({ text: 'Fout: ' + (err as Error).message, ok: false })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-6 bg-white dark:bg-gray-900 shadow-sm">
      <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">Nieuwe vraag toevoegen</h2>

      <label className="block mb-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vraagtype</span>
        <select value={type} onChange={e => setType(e.target.value as QuestionType)}
          className="mt-1 block w-full border rounded p-2 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600">
          <option value="MultipleChoice">Meerkeuze</option>
          <option value="TrueFalse">Waar / Niet waar</option>
          <option value="LessMore">Meer / Minder</option>
          <option value="LowerHigher">Lager / Hoger</option>
        </select>
      </label>

      <label className="block mb-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vraagtekst</span>
        <input value={questionText} onChange={e => setQuestionText(e.target.value)} required
          className="mt-1 block w-full border rounded p-2 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
          placeholder="Typ hier de vraag…" />
      </label>

      {type === 'TrueFalse' && <TrueFalseFields value={tfCorrect} onChange={setTfCorrect} />}
      {type === 'MultipleChoice' && <MultipleChoiceFields options={mcOptions} onChange={setMcOptions} />}
      {(type === 'LessMore' || type === 'LowerHigher') && (
        <MoreLessFields referenceValue={mlRef} onReferenceChange={setMlRef}
          answer={mlAnswer} onAnswerChange={setMlAnswer} unit={mlUnit} onUnitChange={setMlUnit}
          questionType={type} />
      )}

      <MediaFields value={media} onChange={setMedia} />

      <button type="submit" disabled={isPending}
        className="bg-blue-600 dark:bg-blue-500 text-white dark:text-gray-900 px-6 py-2 rounded disabled:opacity-50">
        {isPending ? 'Opslaan...' : 'Vraag opslaan'}
      </button>

      {message && (
        <p className={`mt-3 text-sm ${message.ok ? 'text-green-700' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}
    </form>
  )
}
