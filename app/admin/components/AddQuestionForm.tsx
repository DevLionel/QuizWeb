'use client'
import { useState, useTransition } from 'react'
import { addTrueFalseQuestion, addMultipleChoiceQuestion, addMoreLessQuestion } from '../actions'

type QuestionType = 'true_false' | 'multiple_choice' | 'more_less'
type MediaType = 'youtube' | 'image' | 'audio'
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
  if (!url.trim()) return null // empty = no media, that's fine
  try {
    new URL(url) // must be a valid URL first
  } catch {
    return 'Enter a valid URL (starting with https://)'
  }
  if (type === 'youtube') {
    const isYt =
      /youtube\.com\/watch\?.*v=[\w-]+/.test(url) ||
      /youtu\.be\/[\w-]+/.test(url) ||
      /youtube\.com\/embed\/[\w-]+/.test(url)
    if (!isYt) return 'Must be a YouTube URL (youtube.com/watch?v=… or youtu.be/…)'
  }
  if (type === 'image') {
    const isImage = /\.(jpg|jpeg|png|gif|webp|svg|avif)(\?.*)?$/i.test(url)
    if (!isImage) return 'URL must end with an image extension (.jpg, .png, .webp, …)'
  }
  if (type === 'audio') {
    const isAudio = /\.(mp3|wav|ogg|m4a|aac|flac)(\?.*)?$/i.test(url)
    if (!isAudio) return 'URL must end with an audio extension (.mp3, .wav, .ogg, …)'
  }
  return null
}

// ── Media picker ──────────────────────────────────────────────────────────────

type MediaState = { type: MediaType; url: string } | null

function MediaFields({
  value,
  onChange,
}: {
  value: MediaState
  onChange: (v: MediaState) => void
}) {
  const [urlError, setUrlError] = useState<string | null>(null)

  function selectType(t: MediaType) {
    if (value?.type === t) {
      onChange(null) // toggle off
      setUrlError(null)
    } else {
      onChange({ type: t, url: '' })
      setUrlError(null)
    }
  }

  function handleUrlChange(url: string) {
    if (!value) return
    const err = validateUrl(value.type, url)
    setUrlError(err)
    onChange({ ...value, url })
  }

  const btnBase = 'flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors'
  const active = 'bg-blue-600 text-white border-blue-600'
  const inactive = 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'

  const placeholders: Record<MediaType, string> = {
    youtube: 'https://www.youtube.com/watch?v=…',
    image: 'https://example.com/image.jpg',
    audio: 'https://example.com/sound.mp3',
  }

  return (
    <div className="mb-4">
      <span className="block text-sm font-medium text-gray-700 mb-2">Media (optional)</span>
      <div className="flex gap-2 mb-3">
        <button type="button" onClick={() => selectType('youtube')}
          className={`${btnBase} ${value?.type === 'youtube' ? active : inactive}`}>
          <span className="text-red-500"><YoutubeIcon /></span>
          YouTube
        </button>
        <button type="button" onClick={() => selectType('image')}
          className={`${btnBase} ${value?.type === 'image' ? active : inactive}`}>
          <span className="text-green-600"><PhotoIcon /></span>
          Photo
        </button>
        <button type="button" onClick={() => selectType('audio')}
          className={`${btnBase} ${value?.type === 'audio' ? active : inactive}`}>
          <span className="text-purple-600"><SoundIcon /></span>
          Sound
        </button>
      </div>

      {value && (
        <div>
          <input
            value={value.url}
            onChange={e => handleUrlChange(e.target.value)}
            placeholder={placeholders[value.type]}
            className={`block w-full border rounded p-2 text-sm ${urlError ? 'border-red-400' : ''}`}
          />
          {urlError && <p className="text-red-500 text-xs mt-1">{urlError}</p>}
          {!urlError && value.url && (
            <p className="text-green-600 text-xs mt-1">Valid {value.type} URL</p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Answer sub-forms ──────────────────────────────────────────────────────────

function TrueFalseFields({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <fieldset className="mb-4">
      <legend className="text-sm font-medium text-gray-700 mb-2">Correct antwoord</legend>
      <label className="flex items-center gap-2 text-sm">
        <input type="radio" checked={value === true} onChange={() => onChange(true)} />
        Waar
      </label>
      <label className="flex items-center gap-2 text-sm mt-1">
        <input type="radio" checked={value === false} onChange={() => onChange(false)} />
        Niet waar
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
      <span className="text-sm font-medium text-gray-700">Antwoordopties</span>
      <p className="text-xs text-gray-400 mb-2">Vink het juiste antwoord aan.</p>
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2 mt-2">
          <input type="checkbox" checked={opt.isCorrect}
            onChange={e => updateOption(i, { isCorrect: e.target.checked })}
            title="Correct antwoord" />
          <input value={opt.text} onChange={e => updateOption(i, { text: e.target.value })}
            placeholder={`Optie ${i + 1}`} required className="flex-1 border rounded p-2 text-sm" />
          {options.length > 2 && (
            <button type="button" onClick={() => onChange(options.filter((_, j) => j !== i))}
              className="text-red-500 text-xs px-2">
              Verwijder
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={() => onChange([...options, { text: '', isCorrect: false }])}
        className="mt-3 text-sm text-blue-600 underline">
        + Optie toevoegen
      </button>
    </div>
  )
}

function MoreLessFields({
  referenceValue, onReferenceChange, answer, onAnswerChange, unit, onUnitChange,
}: {
  referenceValue: string; onReferenceChange: (v: string) => void
  answer: string; onAnswerChange: (v: string) => void
  unit: string; onUnitChange: (v: string) => void
}) {
  return (
    <div className="mb-4 grid grid-cols-3 gap-3">
      <label className="block">
        <span className="text-sm font-medium text-gray-700">Referentiewaarde</span>
        <input type="number" value={referenceValue} onChange={e => onReferenceChange(e.target.value)}
          required className="mt-1 block w-full border rounded p-2 text-sm" />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-gray-700">Eenheid (bijv. kg)</span>
        <input value={unit} onChange={e => onUnitChange(e.target.value)}
          className="mt-1 block w-full border rounded p-2 text-sm" placeholder="kg, cm, …" />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-gray-700">Correct antwoord</span>
        <select value={answer} onChange={e => onAnswerChange(e.target.value)}
          className="mt-1 block w-full border rounded p-2 text-sm">
          <option value="more">Meer</option>
          <option value="less">Minder</option>
          <option value="equal">Gelijk</option>
        </select>
      </label>
    </div>
  )
}

// ── Main form ─────────────────────────────────────────────────────────────────

export default function AddQuestionForm({ quizId }: { quizId: number }) {
  const [type, setType] = useState<QuestionType>('true_false')
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

  function getValidMedia() {
    if (!media || !media.url.trim()) return null
    if (validateUrl(media.type, media.url)) return null // invalid — don't save
    return media
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Block submit if media URL is filled but invalid
    if (media?.url && validateUrl(media.type, media.url)) {
      setMessage({ text: 'Please fix the media URL before saving.', ok: false })
      return
    }
    setMessage(null)
    const validMedia = getValidMedia()
    startTransition(async () => {
      try {
        if (type === 'true_false') {
          await addTrueFalseQuestion(quizId, questionText, tfCorrect, validMedia)
        } else if (type === 'multiple_choice') {
          if (!mcOptions.some(o => o.isCorrect)) {
            setMessage({ text: 'Vink minstens één correct antwoord aan.', ok: false })
            return
          }
          await addMultipleChoiceQuestion(quizId, questionText, mcOptions, validMedia)
        } else {
          await addMoreLessQuestion(quizId, questionText, Number(mlRef), mlAnswer, mlUnit, validMedia)
        }
        setMessage({ text: 'Vraag opgeslagen!', ok: true })
        resetForm()
      } catch (err) {
        setMessage({ text: 'Fout: ' + (err as Error).message, ok: false })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-6 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Nieuwe vraag toevoegen</h2>

      <label className="block mb-4">
        <span className="text-sm font-medium text-gray-700">Vraagtype</span>
        <select value={type} onChange={e => setType(e.target.value as QuestionType)}
          className="mt-1 block w-full border rounded p-2">
          <option value="true_false">Waar / Niet waar</option>
          <option value="multiple_choice">Meerkeuze</option>
          <option value="more_less">Meer / Minder / Gelijk</option>
        </select>
      </label>

      <label className="block mb-4">
        <span className="text-sm font-medium text-gray-700">Vraagtekst</span>
        <input value={questionText} onChange={e => setQuestionText(e.target.value)}
          required className="mt-1 block w-full border rounded p-2"
          placeholder="Typ hier de vraag…" />
      </label>

      {type === 'true_false' && <TrueFalseFields value={tfCorrect} onChange={setTfCorrect} />}
      {type === 'multiple_choice' && <MultipleChoiceFields options={mcOptions} onChange={setMcOptions} />}
      {type === 'more_less' && (
        <MoreLessFields referenceValue={mlRef} onReferenceChange={setMlRef}
          answer={mlAnswer} onAnswerChange={setMlAnswer} unit={mlUnit} onUnitChange={setMlUnit} />
      )}

      <MediaFields value={media} onChange={setMedia} />

      <button type="submit" disabled={isPending}
        className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50">
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
