'use client'
import { useState, useTransition } from 'react'
import {
  updateQuestionText,
  updateTrueFalseAnswer,
  updateMultipleChoiceOptions,
  updateMoreLessAnswer,
  updateQuestionMedia,
  deleteQuestion,
} from '../actions'

type MCOption = { id: number; option_text: string; is_correct: boolean; sort_order: number | null }
type TFAnswer = { id: number; correct_answer: boolean }
type MLAnswer = { id: number; correct_answer: string; reference_value: number; unit: string | null }

type Question = {
  id: number
  question_text: string
  question_type: string
  media_type: string | null
  image_url: string | null
  youtube_url: string | null
  true_false_answers: TFAnswer[]
  multiple_choice_options: MCOption[]
  more_less_answers: MLAnswer[]
}

// ── Answer summary (read-only) ────────────────────────────────────────────────

function AnswerSummary({ question }: { question: Question }) {
  if (question.question_type === 'true_false') {
    const tf = question.true_false_answers[0]
    return (
      <p className="text-sm text-gray-500 mt-1">
        Correct antwoord: <strong>{tf?.correct_answer ? 'Waar' : 'Niet waar'}</strong>
      </p>
    )
  }
  if (question.question_type === 'multiple_choice') {
    return (
      <ul className="text-sm text-gray-500 mt-1 list-disc ml-4">
        {question.multiple_choice_options.map(opt => (
          <li key={opt.id} className={opt.is_correct ? 'text-green-700 font-medium' : ''}>
            {opt.option_text} {opt.is_correct ? '✓' : ''}
          </li>
        ))}
      </ul>
    )
  }
  if (question.question_type === 'more_less') {
    const ml = question.more_less_answers[0]
    return (
      <p className="text-sm text-gray-500 mt-1">
        Referentiewaarde: <strong>{ml?.reference_value} {ml?.unit}</strong> — correct:{' '}
        <strong>{ml?.correct_answer}</strong>
      </p>
    )
  }
  return null
}

// ── Edit form ─────────────────────────────────────────────────────────────────

function EditForm({
  question,
  isPending,
  onSave,
  onDelete,
}: {
  question: Question
  isPending: boolean
  onSave: (action: () => Promise<void>) => void
  onDelete: () => void
}) {
  const [text, setText] = useState(question.question_text)

  // media state
  const [mediaType, setMediaType] = useState<'none' | 'youtube' | 'image'>(
    (question.media_type as 'youtube' | 'image') ?? 'none'
  )
  const [mediaUrl, setMediaUrl] = useState(
    question.youtube_url ?? question.image_url ?? ''
  )

  // true_false state
  const [tfCorrect, setTfCorrect] = useState(
    question.true_false_answers[0]?.correct_answer ?? true
  )

  // multiple_choice state
  const [mcOptions, setMcOptions] = useState(
    question.multiple_choice_options.map(o => ({
      id: o.id,
      option_text: o.option_text,
      is_correct: o.is_correct,
    }))
  )

  // more_less state
  const ml = question.more_less_answers[0]
  const [mlRef, setMlRef] = useState(String(ml?.reference_value ?? ''))
  const [mlAnswer, setMlAnswer] = useState(ml?.correct_answer ?? 'more')
  const [mlUnit, setMlUnit] = useState(ml?.unit ?? '')

  function handleSave() {
    onSave(async () => {
      await updateQuestionText(question.id, text)
      if (question.question_type === 'true_false') {
        await updateTrueFalseAnswer(question.id, tfCorrect)
      } else if (question.question_type === 'multiple_choice') {
        await updateMultipleChoiceOptions(question.id, mcOptions)
      } else if (question.question_type === 'more_less') {
        await updateMoreLessAnswer(question.id, Number(mlRef), mlAnswer, mlUnit)
      }
      const media =
        mediaType === 'none' || !mediaUrl.trim()
          ? null
          : { type: mediaType as 'youtube' | 'image', url: mediaUrl.trim() }
      await updateQuestionMedia(question.id, media)
    })
  }

  return (
    <div className="p-4 bg-white border-t space-y-4">
      {/* Question text */}
      <label className="block">
        <span className="text-sm font-medium text-gray-700">Vraagtekst</span>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          className="mt-1 block w-full border rounded p-2 text-sm"
        />
      </label>

      {/* True / False */}
      {question.question_type === 'true_false' && (
        <fieldset>
          <legend className="text-sm font-medium text-gray-700 mb-1">Correct antwoord</legend>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" checked={tfCorrect === true} onChange={() => setTfCorrect(true)} />
            Waar
          </label>
          <label className="flex items-center gap-2 text-sm mt-1">
            <input type="radio" checked={tfCorrect === false} onChange={() => setTfCorrect(false)} />
            Niet waar
          </label>
        </fieldset>
      )}

      {/* Multiple choice */}
      {question.question_type === 'multiple_choice' && (
        <div>
          <span className="text-sm font-medium text-gray-700">Antwoordopties</span>
          {mcOptions.map((opt, i) => (
            <div key={opt.id} className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={opt.is_correct}
                onChange={e => {
                  const updated = [...mcOptions]
                  updated[i] = { ...updated[i], is_correct: e.target.checked }
                  setMcOptions(updated)
                }}
                title="Correct antwoord"
              />
              <input
                value={opt.option_text}
                onChange={e => {
                  const updated = [...mcOptions]
                  updated[i] = { ...updated[i], option_text: e.target.value }
                  setMcOptions(updated)
                }}
                className="flex-1 border rounded p-1 text-sm"
              />
            </div>
          ))}
        </div>
      )}

      {/* More / Less */}
      {question.question_type === 'more_less' && (
        <div className="grid grid-cols-3 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Referentiewaarde</span>
            <input
              type="number"
              value={mlRef}
              onChange={e => setMlRef(e.target.value)}
              className="mt-1 block w-full border rounded p-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Eenheid</span>
            <input
              value={mlUnit}
              onChange={e => setMlUnit(e.target.value)}
              className="mt-1 block w-full border rounded p-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Correct antwoord</span>
            <select
              value={mlAnswer}
              onChange={e => setMlAnswer(e.target.value)}
              className="mt-1 block w-full border rounded p-2 text-sm"
            >
              <option value="more">Meer</option>
              <option value="less">Minder</option>
              <option value="equal">Gelijk</option>
            </select>
          </label>
        </div>
      )}

      {/* Media */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-gray-700">Media (optioneel)</span>
        <div className="flex gap-3 items-center">
          <select
            value={mediaType}
            onChange={e => {
              setMediaType(e.target.value as 'none' | 'youtube' | 'image')
              setMediaUrl('')
            }}
            className="border rounded p-2 text-sm"
          >
            <option value="none">Geen</option>
            <option value="youtube">YouTube</option>
            <option value="image">Afbeelding</option>
          </select>
          {mediaType !== 'none' && (
            <input
              value={mediaUrl}
              onChange={e => setMediaUrl(e.target.value)}
              placeholder={mediaType === 'youtube' ? 'YouTube URL' : 'Afbeelding URL'}
              className="flex-1 border rounded p-2 text-sm"
            />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="bg-blue-600 dark:bg-blue-500 text-white dark:text-gray-900 px-4 py-2 rounded text-sm disabled:opacity-50"
        >
          {isPending ? 'Opslaan...' : 'Opslaan'}
        </button>
        <button
          onClick={onDelete}
          disabled={isPending}
          className="bg-red-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
        >
          Verwijderen
        </button>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function QuestionList({ questions }: { questions: Question[] }) {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  if (questions.length === 0) {
    return <p className="text-gray-500">Nog geen vragen. Voeg een vraag toe via het formulier hierboven.</p>
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Alle vragen ({questions.length})</h2>
      {questions.map(q => (
        <div key={q.id} className="border rounded-lg mb-3 overflow-hidden">
          <div className="flex items-start gap-3 p-4 bg-gray-50">
            <input
              type="checkbox"
              className="mt-1 cursor-pointer"
              checked={selectedId === q.id}
              onChange={() => setSelectedId(selectedId === q.id ? null : q.id)}
            />
            <div className="flex-1">
              <span className="text-xs font-mono bg-gray-200 px-1 rounded mr-2">
                {q.question_type}
              </span>
              <span className="font-medium">{q.question_text}</span>
              <AnswerSummary question={q} />
            </div>
          </div>

          {selectedId === q.id && (
            <EditForm
              question={q}
              isPending={isPending}
              onSave={action => startTransition(action)}
              onDelete={() =>
                startTransition(async () => {
                  await deleteQuestion(q.id)
                  setSelectedId(null)
                })
              }
            />
          )}
        </div>
      ))}
    </div>
  )
}
