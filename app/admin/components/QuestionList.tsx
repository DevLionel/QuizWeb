'use client'
import { useState, useTransition } from 'react'
import { updateQuestion, deleteQuestion, uploadMediaFile } from '../actions'
import type { Question, CreateQuestionPayload, AnswerPayload } from '../../lib/types'

type MCEditOption = { text: string; isCorrect: boolean }

interface HistorieRow { seizoen: string; club: string; w: string; g: string }

// ── Passport helpers ──────────────────────────────────────────────────────────

function parseRow(text: string): HistorieRow {
  const [seizoen = '', club = '', w = '', g = ''] = text.split('|')
  return { seizoen, club, w, g }
}

function parsePassportAnswers(question: Question) {
  // Name in answers[0] (isCorrect: true), career data in questionText as 4 newline-separated lines
  const naam = question.answers.find(a => a.isCorrect)?.answerText ?? ''
  const lines = question.questionText.split('\n')
  const geboortedatum = lines[0] ?? ''
  const nationaliteit = lines[1] ?? ''
  const historieRows: HistorieRow[] = []
  const interlandRows: HistorieRow[] = []
  const clubText = lines[2] ?? ''
  const intText  = lines[3] ?? ''
  clubText.split(';;').filter(t => t && t !== '-').forEach(t => historieRows.push(parseRow(t)))
  const intBody = intText.startsWith('INTERLAND|') ? intText.slice('INTERLAND|'.length) : intText
  intBody.split(';;').filter(Boolean).forEach(t => interlandRows.push(parseRow(t)))
  return { naam, geboortedatum, nationaliteit, historieRows, interlandRows }
}

// ── Answer summary (read-only) ────────────────────────────────────────────────

function AnswerSummary({ question, roundType }: { question: Question; roundType?: string }) {
  // Passport cards — show structured summary
  if (roundType === 'PassportRound') {
    const { geboortedatum, nationaliteit, historieRows, interlandRows } = parsePassportAnswers(question)
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 space-y-0.5">
        {geboortedatum && <p>📅 {geboortedatum}</p>}
        {nationaliteit && <p>🌍 {nationaliteit}</p>}
        <p>📋 {historieRows.length} clubrij{historieRows.length !== 1 ? 'en' : ''}, {interlandRows.length} interland{interlandRows.length !== 1 ? 's' : ''}</p>
      </div>
    )
  }
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

// ── Passport edit sub-form ────────────────────────────────────────────────────

function PassportEditForm({
  question, roundId, isPending, onSave, onDelete,
}: {
  question: Question
  roundId: number
  isPending: boolean
  onSave: (action: () => Promise<void>) => void
  onDelete: () => void
}) {
  const { naam: initNaam, geboortedatum: initGb, nationaliteit: initNat, historieRows: initRows, interlandRows: initIntRows } = parsePassportAnswers(question)

  const [naam, setNaam] = useState(initNaam)
  const [imageUrl, setImageUrl] = useState(question.mediaUrl ?? '')
  const [urlError, setUrlError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [geboortedatum, setGeboortedatum] = useState(initGb)
  const [nationaliteit, setNationaliteit] = useState(initNat)
  const [historieRows, setHistorieRows] = useState<HistorieRow[]>(
    initRows.length > 0 ? initRows : [{ seizoen: '', club: '', w: '', g: '' }]
  )
  const [interlandRows, setInterlandRows] = useState<HistorieRow[]>(
    initIntRows.length > 0 ? initIntRows : [{ seizoen: '', club: '', w: '', g: '' }]
  )

  const inputCls = 'border rounded p-2 text-sm dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600'

  function validateImageUrl(url: string): string | null {
    if (!url.trim()) return null
    try { new URL(url) } catch { return 'Voer een geldige URL in' }
    const isImage = /\.(jpg|jpeg|png|gif|webp|svg|avif)(\?.*)?$/i.test(url)
    if (!isImage) return 'URL moet eindigen met een afbeeldingsextensie'
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

  function updateRow(index: number, field: keyof HistorieRow, value: string) {
    setHistorieRows(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  function handleSave() {
    const urlErr = validateImageUrl(imageUrl)
    if (urlErr) { setUrlError(urlErr); return }

    const clubRows = historieRows.filter(r => r.seizoen.trim() || r.club.trim())
    const intRows  = interlandRows.filter(r => r.seizoen.trim() || r.club.trim())

    // Pack career data into 4-line questionText; single correct answer = player name
    const clubText = clubRows.map(r =>
      `${r.seizoen.trim()}|${r.club.trim()}|${r.w.trim() || '0'}|${r.g.trim() || '0'}`
    ).join(';;') || '-'
    const intText = intRows.length > 0
      ? 'INTERLAND|' + intRows.map(r =>
          `${r.seizoen.trim()}|${r.club.trim()}|${r.w.trim() || '0'}|${r.g.trim() || '0'}`
        ).join(';;')
      : ''
    const careerData = [geboortedatum.trim(), nationaliteit.trim(), clubText, intText].join('\n')

    const payload: CreateQuestionPayload = {
      text: careerData,
      questionType: 'Photo',
      roundId,
      mediaType: 'Image',
      mediaUrl: imageUrl.trim() || null,
      answers: [{ text: naam.trim(), isCorrect: true, displayOrder: 1 }],
    }

    onSave(async () => {
      await updateQuestion(question.id, payload)
    })
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-900 border-t space-y-4">
      {/* Photo */}
      <div>
        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Foto van speler</span>
        <input
          value={imageUrl}
          onChange={e => handleUrlChange(e.target.value)}
          placeholder="https://example.com/speler.jpg"
          className={`block w-full ${inputCls} mb-2 ${urlError ? 'border-red-400' : ''}`}
        />
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
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Historie als speler</span>
          <button type="button"
            onClick={() => setHistorieRows(prev => [...prev, { seizoen: '', club: '', w: '', g: '' }])}
            className="text-xs text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-600 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30">
            + Rij toevoegen
          </button>
        </div>
        <div className="grid grid-cols-[1fr_1.5fr_4rem_4rem_2rem] gap-2 mb-1 px-1">
          {['Seizoen', 'Club', 'W', '(g)', ''].map(h => (
            <span key={h} className="text-xs font-semibold text-gray-400 uppercase">{h}</span>
          ))}
        </div>
        <div className="space-y-2">
          {historieRows.map((row, i) => (
            <div key={i} className="grid grid-cols-[1fr_1.5fr_4rem_4rem_2rem] gap-2 items-center">
              <input value={row.seizoen} onChange={e => updateRow(i, 'seizoen', e.target.value)}
                placeholder="1981–1987" className={inputCls} />
              <input value={row.club} onChange={e => updateRow(i, 'club', e.target.value)}
                placeholder="Ajax" className={inputCls} />
              <input value={row.w} onChange={e => updateRow(i, 'w', e.target.value)}
                placeholder="133" type="number" min="0" className={inputCls} />
              <input value={row.g} onChange={e => updateRow(i, 'g', e.target.value)}
                placeholder="128" type="number" min="0" className={inputCls} />
              <button type="button"
                onClick={() => setHistorieRows(prev => prev.filter((_, idx) => idx !== i))}
                disabled={historieRows.length === 1}
                className="text-red-400 hover:text-red-600 disabled:opacity-30 text-lg leading-none"
                title="Rij verwijderen">×</button>
            </div>
          ))}
        </div>
      </div>

      {/* Interlands */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Interlands</span>
          <button type="button"
            onClick={() => setInterlandRows(prev => [...prev, { seizoen: '', club: '', w: '', g: '' }])}
            className="text-xs text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-600 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30">
            + Rij toevoegen
          </button>
        </div>
        <div className="grid grid-cols-[1fr_1.5fr_4rem_4rem_2rem] gap-2 mb-1 px-1">
          {['Seizoen', 'Land', 'W', '(g)', ''].map(h => (
            <span key={h} className="text-xs font-semibold text-gray-400 uppercase">{h}</span>
          ))}
        </div>
        <div className="space-y-2">
          {interlandRows.map((row, i) => (
            <div key={i} className="grid grid-cols-[1fr_1.5fr_4rem_4rem_2rem] gap-2 items-center">
              <input value={row.seizoen} onChange={e => setInterlandRows(prev => { const u=[...prev]; u[i]={...u[i],seizoen:e.target.value}; return u })}
                placeholder="1983–1995" className={inputCls} />
              <input value={row.club} onChange={e => setInterlandRows(prev => { const u=[...prev]; u[i]={...u[i],club:e.target.value}; return u })}
                placeholder="Nederland" className={inputCls} />
              <input value={row.w} onChange={e => setInterlandRows(prev => { const u=[...prev]; u[i]={...u[i],w:e.target.value}; return u })}
                placeholder="58" type="number" min="0" className={inputCls} />
              <input value={row.g} onChange={e => setInterlandRows(prev => { const u=[...prev]; u[i]={...u[i],g:e.target.value}; return u })}
                placeholder="24" type="number" min="0" className={inputCls} />
              <button type="button"
                onClick={() => setInterlandRows(prev => prev.filter((_, idx) => idx !== i))}
                disabled={interlandRows.length === 1}
                className="text-red-400 hover:text-red-600 disabled:opacity-30 text-lg leading-none"
                title="Rij verwijderen">×</button>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button onClick={handleSave} disabled={isPending || uploading}
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

// ── Generic edit form ─────────────────────────────────────────────────────────

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

export default function QuestionList({
  questions,
  roundId,
  roundType,
}: {
  questions: Question[]
  roundId: number
  roundType?: string
}) {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  const isPassport = roundType === 'PassportRound'

  if (questions.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400">
        {isPassport
          ? 'Nog geen paspoorten. Voeg een speler toe via het formulier hierboven.'
          : 'Nog geen vragen. Voeg een vraag toe via het formulier hierboven.'}
      </p>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">
        {isPassport ? `Alle paspoorten (${questions.length})` : `Alle vragen (${questions.length})`}
      </h2>
      {questions.map(q => (
        <div key={q.id} className="border dark:border-gray-700 rounded-lg mb-3 overflow-hidden">
          <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800">
            <input type="checkbox" className="mt-1 cursor-pointer"
              checked={selectedId === q.id}
              onChange={() => setSelectedId(selectedId === q.id ? null : q.id)} />
            <div className="flex-1">
              {isPassport ? (
                <span className="font-medium dark:text-gray-100">
                  👤 {q.questionType === 'Photo'
                    ? (q.answers.find(a => a.isCorrect)?.answerText ?? q.questionText)
                    : q.questionText}
                </span>
              ) : (
                <>
                  <span className="text-xs font-mono bg-gray-200 dark:bg-gray-700 dark:text-gray-300 px-1 rounded mr-2">
                    {q.questionType}
                  </span>
                  <span className="font-medium dark:text-gray-100">{q.questionText}</span>
                </>
              )}
              <AnswerSummary question={q} roundType={roundType} />
            </div>
          </div>

          {selectedId === q.id && (
            isPassport ? (
              <PassportEditForm
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
            ) : (
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
            )
          )}
        </div>
      ))}
    </div>
  )
}
