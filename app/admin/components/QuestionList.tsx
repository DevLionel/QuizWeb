'use client'
import { useState, useTransition } from 'react'
import { updateQuestion, deleteQuestion } from '../actions'
import type { Question, Answer, CreateQuestionPayload, AnswerPayload } from '../../lib/types'

type MCEditOption = { text: string; isCorrect: boolean }

// ── Answer summary (read-only) ────────────────────────────────────────────────

function AnswerSummary({ question }: { question: Question }) {
  if (question.questionType === 'TrueFalse') {
    const correct = question.answers.find(a => a.isCorrect)
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Correct antwoord: <strong>{correct?.answerText ?? '?'}</strong>
      </p>
    )
  }
  if (question.questionType === 'MultipleChoice') {
    return (
      <ul className="text-sm text-gray-500 dark:text-gray-400 mt-1 list-disc ml-4">
        {question.answers.map(a => (
          <li key={a.id} className={a.isCorrect ? 'text-green-700 dark:text-green-400 font-medium' : ''}>
            {a.answerText} {a.isCorrect ? '✓' : ''}
          </li>
        ))}
      </ul>
    )
  }
  if (question.questionType === 'LessMore' || question.questionType === 'LowerHigher') {
    const correct = question.answers.find(a => a.isCorrect)
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Correct antwoord: <strong>{correct?.answerText ?? '?'}</strong>
      </p>
    )
  }
  return null
}

// ── Edit form ─────────────────────────────────────────────────────────────────

function EditForm({
  question, roundId, isPending, onSave, onDelete,
}: {
  question: Question
  roundId: number
  isPending: boolean
  onSave: (action: () => Promise<void>) => void
  onDelete: () => void
}) {
  const [text, setText] = useState(question.questionText)
  const [mediaType, setMediaType] = useState<'none' | 'YouTubeClip' | 'YouTubeShort' | 'Image' | 'Mp4'>(
    (question.mediaType as 'YouTubeClip' | 'YouTubeShort' | 'Image' | 'Mp4') ?? 'none'
  )
  const [mediaUrl, setMediaUrl] = useState(question.mediaUrl ?? '')

  // true_false
  const tfInitial = question.answers.find(a => a.isCorrect)?.answerText === 'Waar'
  const [tfCorrect, setTfCorrect] = useState(tfInitial)

  // multiple_choice
  const [mcOptions, setMcOptions] = useState<MCEditOption[]>(
    question.answers.map(a => ({ text: a.answerText, isCorrect: a.isCorrect }))
  )

  // more_less
  const mlInitialCorrect = question.answers.find(a => a.isCorrect)?.answerText?.toLowerCase() ?? 'meer'
  const mlAnswerMap: Record<string, string> = { meer: 'more', minder: 'less', gelijk: 'equal' }
  const [mlAnswer, setMlAnswer] = useState(mlAnswerMap[mlInitialCorrect] ?? 'more')

  // photo — single correct answer text
  const [photoAnswer, setPhotoAnswer] = useState(question.answers[0]?.answerText ?? '')

  function buildAnswers(): AnswerPayload[] {
    if (question.questionType === 'TrueFalse') {
      return [
        { text: 'Waar', isCorrect: tfCorrect, displayOrder: 1 },
        { text: 'Niet waar', isCorrect: !tfCorrect, displayOrder: 2 },
      ]
    }
    if (question.questionType === 'MultipleChoice') {
      return mcOptions.map((o, i) => ({ text: o.text, isCorrect: o.isCorrect, displayOrder: i + 1 }))
    }
    if (question.questionType === 'LowerHigher') {
      return [
        { text: 'Lager', isCorrect: mlAnswer === 'less', displayOrder: 1 },
        { text: 'Hoger', isCorrect: mlAnswer === 'more', displayOrder: 2 },
      ]
    }
    if (question.questionType === 'Photo') {
      // API requires exactly 1 answer with isCorrect: true
      return [{ text: photoAnswer.trim(), isCorrect: true, displayOrder: 1 }]
    }
    // LessMore
    return [
      { text: 'Meer', isCorrect: mlAnswer === 'more', displayOrder: 1 },
      { text: 'Minder', isCorrect: mlAnswer === 'less', displayOrder: 2 },
    ]
  }

  function handleSave() {
    onSave(async () => {
      const payload: CreateQuestionPayload = {
        text,
        questionType: question.questionType,
        roundId,
        mediaType: mediaType === 'none' ? null : mediaType as 'YouTubeClip' | 'YouTubeShort' | 'Image' | 'Mp4',
        mediaUrl: mediaType === 'none' || !mediaUrl.trim() ? null : mediaUrl.trim(),
        answers: buildAnswers(),
      }
      await updateQuestion(question.id, payload)
    })
  }

  const inputCls = 'border rounded p-2 text-sm dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600'

  return (
    <div className="p-4 bg-white dark:bg-gray-900 border-t space-y-4">
      {/* Question text */}
      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vraagtekst</span>
        <input value={text} onChange={e => setText(e.target.value)}
          className={`mt-1 block w-full ${inputCls}`} />
      </label>

      {/* Photo — single answer text (shown on card reveal) */}
      {question.questionType === 'Photo' && (
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Antwoord (zichtbaar na onthullen)</span>
          <input
            value={photoAnswer}
            onChange={e => setPhotoAnswer(e.target.value)}
            placeholder="Bijv. Vincent van Gogh"
            className={`mt-1 block w-full ${inputCls}`}
          />
        </label>
      )}

      {/* True / False */}
      {question.questionType === 'TrueFalse' && (
        <fieldset>
          <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correct antwoord</legend>
          <label className="flex items-center gap-2 text-sm dark:text-gray-200">
            <input type="radio" checked={tfCorrect} onChange={() => setTfCorrect(true)} /> Waar
          </label>
          <label className="flex items-center gap-2 text-sm mt-1 dark:text-gray-200">
            <input type="radio" checked={!tfCorrect} onChange={() => setTfCorrect(false)} /> Niet waar
          </label>
        </fieldset>
      )}

      {/* Multiple choice */}
      {question.questionType === 'MultipleChoice' && (
        <div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Antwoordopties</span>
          {mcOptions.map((opt, i) => (
            <div key={i} className="flex items-center gap-2 mt-2">
              <input type="checkbox" checked={opt.isCorrect}
                onChange={e => {
                  const updated = [...mcOptions]
                  updated[i] = { ...updated[i], isCorrect: e.target.checked }
                  setMcOptions(updated)
                }} title="Correct antwoord" />
              <input value={opt.text}
                onChange={e => {
                  const updated = [...mcOptions]
                  updated[i] = { ...updated[i], text: e.target.value }
                  setMcOptions(updated)
                }}
                className={`flex-1 ${inputCls}`} />
            </div>
          ))}
        </div>
      )}

      {/* More / Less */}
      {(question.questionType === 'LessMore' || question.questionType === 'LowerHigher') && (
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Correct antwoord</span>
          <select value={mlAnswer} onChange={e => setMlAnswer(e.target.value)}
            className={`mt-1 block w-full ${inputCls}`}>
            <option value="more">{question.questionType === 'LowerHigher' ? 'Hoger' : 'Meer'}</option>
            <option value="less">{question.questionType === 'LowerHigher' ? 'Lager' : 'Minder'}</option>
          </select>
        </label>
      )}

      {/* Media */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Media (optioneel)</span>
        <div className="flex gap-3 items-center flex-wrap">
          <select value={mediaType}
            onChange={e => { setMediaType(e.target.value as typeof mediaType); setMediaUrl('') }}
            className={inputCls}>
            <option value="none">Geen</option>
            <option value="YouTubeClip">YouTube</option>
            <option value="YouTubeShort">YouTube Short</option>
            <option value="Image">Afbeelding</option>
            <option value="Mp4">Video / Audio</option>
          </select>
          {mediaType !== 'none' && (
            <input value={mediaUrl} onChange={e => setMediaUrl(e.target.value)}
              placeholder={mediaType === 'YouTubeShort' ? 'YouTube Shorts URL' : mediaType === 'YouTubeClip' ? 'YouTube URL' : `${mediaType} URL`}
              className={`flex-1 ${inputCls}`} />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button onClick={handleSave} disabled={isPending}
          className="bg-blue-600 dark:bg-blue-500 text-white dark:text-gray-900 px-4 py-2 rounded text-sm disabled:opacity-50">
          {isPending ? 'Opslaan...' : 'Opslaan'}
        </button>
        <button onClick={onDelete} disabled={isPending}
          className="bg-red-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50">
          Verwijderen
        </button>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function QuestionList({ questions, roundId }: { questions: Question[]; roundId: number }) {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  if (questions.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400">
        Nog geen vragen. Voeg een vraag toe via het formulier hierboven.
      </p>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">
        Alle vragen ({questions.length})
      </h2>
      {questions.map(q => (
        <div key={q.id} className="border dark:border-gray-700 rounded-lg mb-3 overflow-hidden">
          <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800">
            <input type="checkbox" className="mt-1 cursor-pointer"
              checked={selectedId === q.id}
              onChange={() => setSelectedId(selectedId === q.id ? null : q.id)} />
            <div className="flex-1">
              <span className="text-xs font-mono bg-gray-200 dark:bg-gray-700 dark:text-gray-300 px-1 rounded mr-2">
                {q.questionType}
              </span>
              <span className="font-medium dark:text-gray-100">{q.questionText}</span>
              <AnswerSummary question={q} />
            </div>
          </div>

          {selectedId === q.id && (
            <EditForm
              question={q}
              roundId={roundId}
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
