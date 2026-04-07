import { supabase } from '../lib/supabaseClient'

export interface Answer {
  id: number
  answerText: string
  isCorrect: boolean
}

export interface Question {
  id: number
  questionText: string
  templateTypeId: number
  mediaType: string
  mediaUrl: string | null
  answers: Answer[]
}

export async function getAllQuestions(): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select(`
      id,
      question_text,
      template_type_id,
      media_type,
      media_url,
      answers (
        id,
        answer_text,
        is_correct
      )
    `)

  if (error) throw new Error(error.message)

  return (data ?? []).map(q => ({
    id: q.id,
    questionText: q.question_text,
    templateTypeId: q.template_type_id,
    mediaType: q.media_type,
    mediaUrl: q.media_url,
    answers: (q.answers as { id: number; answer_text: string; is_correct: boolean }[]).map(a => ({
      id: a.id,
      answerText: a.answer_text,
      isCorrect: a.is_correct,
    })),
  }))
}
