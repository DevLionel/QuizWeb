'use client'
import { useState, useTransition } from 'react'
import { addTrueFalseQuestion, addMultipleChoiceQuestion, addMoreLessQuestion } from '../actions'

type QuestionType = 'true_false' | 'multiple_choice' | 'more_less'
type MCOption = { text: string; isCorrect: boolean }

// ── Sub-forms ─────────────────────────────────────────────────────────────────

function TrueFalseFields({
  value,
  onChange,
}: {
  value: boolean
  onChange: (v: boolean) => void
}) {
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

function MultipleChoiceFields({
  options,
  onChange,
}: {
  options: MCOption[]
  onChange: (opts: MCOption[]) => void
}) {
  function updateOption(index: number, patch: Partial<MCOption>) {
    const updated = options.map((o, i) => (i === index ? { ...o, ...patch } : o))
    onChange(updated)
  }

  function addOption() {
    onChange([...options, { text: '', isCorrect: false }])
  }

  function removeOption(index: number) {
    onChange(options.filter((_, i) => i !== index))
  }

  return (
    <div className="mb-4">
      <span className="text-sm font-medium text-gray-700">Antwoordopties</span>
      <p className="text-xs text-gray-400 mb-2">Vink het juiste antwoord aan.</p>
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            checked={opt.isCorrect}
            onChange={e => updateOption(i, { isCorrect: e.target.checked })}
            title="Correct antwoord"
          />
          <input
            value={opt.text}
            onChange={e => updateOption(i, { text: e.target.value })}
            placeholder={`Optie ${i + 1}`}
            required
            className="flex-1 border rounded p-2 text-sm"
          />
          {options.length > 2 && (
            <button
              type="button"
              onClick={() => removeOption(i)}
              className="text-red-500 text-xs px-2"
            >
              Verwijder
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addOption}
        className="mt-3 text-sm text-blue-600 underline"
      >
        + Optie toevoegen
      </button>
    </div>
  )
}

function MoreLessFields({
  referenceValue,
  onReferenceChange,
  answer,
  onAnswerChange,
  unit,
  onUnitChange,
}: {
  referenceValue: string
  onReferenceChange: (v: string) => void
  answer: string
  onAnswerChange: (v: string) => void
  unit: string
  onUnitChange: (v: string) => void
}) {
  return (
    <div className="mb-4 grid grid-cols-3 gap-3">
      <label className="block">
        <span className="text-sm font-medium text-gray-700">Referentiewaarde</span>
        <input
          type="number"
          value={referenceValue}
          onChange={e => onReferenceChange(e.target.value)}
          required
          className="mt-1 block w-full border rounded p-2 text-sm"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-gray-700">Eenheid (bijv. kg)</span>
        <input
          value={unit}
          onChange={e => onUnitChange(e.target.value)}
          className="mt-1 block w-full border rounded p-2 text-sm"
          placeholder="kg, cm, …"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-gray-700">Correct antwoord</span>
        <select
          value={answer}
          onChange={e => onAnswerChange(e.target.value)}
          className="mt-1 block w-full border rounded p-2 text-sm"
        >
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

  // true_false
  const [tfCorrect, setTfCorrect] = useState(true)

  // multiple_choice
  const [mcOptions, setMcOptions] = useState<MCOption[]>([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ])

  // more_less
  const [mlRef, setMlRef] = useState('')
  const [mlAnswer, setMlAnswer] = useState('more')
  const [mlUnit, setMlUnit] = useState('')

  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  function resetForm() {
    setQuestionText('')
    setTfCorrect(true)
    setMcOptions([{ text: '', isCorrect: false }, { text: '', isCorrect: false }])
    setMlRef('')
    setMlAnswer('more')
    setMlUnit('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    startTransition(async () => {
      try {
        if (type === 'true_false') {
          await addTrueFalseQuestion(quizId, questionText, tfCorrect)
        } else if (type === 'multiple_choice') {
          if (!mcOptions.some(o => o.isCorrect)) {
            setMessage({ text: 'Vink minstens één correct antwoord aan.', ok: false })
            return
          }
          await addMultipleChoiceQuestion(quizId, questionText, mcOptions)
        } else {
          await addMoreLessQuestion(quizId, questionText, Number(mlRef), mlAnswer, mlUnit)
        }
        setMessage({ text: 'Vraag opgeslagen!', ok: true })
        resetForm()
      } catch (err) {
        setMessage({ text: 'Fout: ' + (err as Error).message, ok: false })
      }
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border rounded-lg p-6 bg-white shadow-sm"
    >
      <h2 className="text-xl font-semibold mb-4">Nieuwe vraag toevoegen</h2>

      {/* Question type */}
      <label className="block mb-4">
        <span className="text-sm font-medium text-gray-700">Vraagtype</span>
        <select
          value={type}
          onChange={e => setType(e.target.value as QuestionType)}
          className="mt-1 block w-full border rounded p-2"
        >
          <option value="true_false">Waar / Niet waar</option>
          <option value="multiple_choice">Meerkeuze</option>
          <option value="more_less">Meer / Minder / Gelijk</option>
        </select>
      </label>

      {/* Question text */}
      <label className="block mb-4">
        <span className="text-sm font-medium text-gray-700">Vraagtekst</span>
        <input
          value={questionText}
          onChange={e => setQuestionText(e.target.value)}
          required
          className="mt-1 block w-full border rounded p-2"
          placeholder="Typ hier de vraag…"
        />
      </label>

      {/* Type-specific answer fields */}
      {type === 'true_false' && (
        <TrueFalseFields value={tfCorrect} onChange={setTfCorrect} />
      )}
      {type === 'multiple_choice' && (
        <MultipleChoiceFields options={mcOptions} onChange={setMcOptions} />
      )}
      {type === 'more_less' && (
        <MoreLessFields
          referenceValue={mlRef}
          onReferenceChange={setMlRef}
          answer={mlAnswer}
          onAnswerChange={setMlAnswer}
          unit={mlUnit}
          onUnitChange={setMlUnit}
        />
      )}

      <button
        type="submit"
        disabled={isPending}
        className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
      >
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
