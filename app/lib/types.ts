// ── Raw API response shapes (match REST API exactly) ─────────────────────────

export interface AnswerResponse {
  id: number
  text: string
  isCorrect: boolean
  displayOrder: number
}

export interface QuestionResponse {
  id: number
  text: string
  questionType: QuestionType
  roundId: number
  roundName: string
  categoryId: number
  categoryName: string
  createdAt: string
  mediaType: 'YouTubeClip' | 'YouTubeShort' | 'Image' | 'Mp4' | null
  mediaUrl: string | null
  answers: AnswerResponse[]
}

export interface SubjectResponse {
  id: number
  name: string
}

export interface RoundResponse {
  id: number
  name: string
  subjectId: number | null
  subjectName: string | null
  displayOrder: number
  roundType: RoundType
  playMode: PlayMode
  categoryId: number
  categoryName: string
}

export interface CategoryResponse {
  id: number
  name: string
}

// ── Payloads sent to the API ──────────────────────────────────────────────────

export interface AnswerPayload {
  text: string
  isCorrect: boolean
  displayOrder: number
}

export type QuestionType = 'MultipleChoice' | 'TrueFalse' | 'LowerHigher' | 'LessMore' | 'Photo'

export interface CreateQuestionPayload {
  text: string
  questionType: QuestionType
  roundId: number
  mediaType: 'YouTubeClip' | 'YouTubeShort' | 'Image' | 'Mp4' | null
  mediaUrl: string | null
  answers: AnswerPayload[]
}

export type RoundType = 'QuestionRound' | 'PhotoRound' | 'PassportRound'

export type PlayMode = 'Individual' | 'Team'

export interface CreateRoundPayload {
  name: string
  subjectId: number | null
  displayOrder: number
  roundType: RoundType
  playMode: PlayMode
  categoryId: number
}

// ── Domain types used inside Quiz components ──────────────────────────────────
// Field names (questionText, answerText) are preserved so quiz templates need
// no body changes — only their import path changes.

export interface Answer {
  id: number
  answerText: string
  isCorrect: boolean
}

export interface Question {
  id: number
  questionText: string
  questionType: QuestionType
  mediaType: string | null
  mediaUrl: string | null
  answers: Answer[]
}

// ── Mapper: API response → domain type ───────────────────────────────────────

export function mapQuestion(q: QuestionResponse): Question {
  return {
    id: q.id,
    questionText: q.text,
    questionType: q.questionType,
    mediaType: q.mediaType,
    mediaUrl: q.mediaUrl,
    answers: q.answers
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(a => ({
        id: a.id,
        answerText: a.text,
        isCorrect: a.isCorrect,
      })),
  }
}
