import { supabaseAdmin } from '../lib/supabaseAdmin'

export interface Answer {
  id: number
  answerText: string
  isCorrect: boolean
}

export interface Question {
  id: number
  questionText: string
  questionType: 'true_false' | 'multiple_choice' | 'more_less'
  mediaType: string | null
  mediaUrl: string | null
  answers: Answer[]
}

export async function getAllQuestionsForQuiz(quizId: number): Promise<Question[]> {
  const { data, error } = await supabaseAdmin
    .from('questions')
    .select(`
      id,
      question_text,
      question_type,
      media_type,
      image_url,
      youtube_url,
      true_false_answers ( correct_answer ),
      multiple_choice_options ( id, option_text, is_correct, sort_order ),
      more_less_answers ( correct_answer )
    `)
    .eq('quiz_id', quizId)
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []).map(q => {
    let answers: Answer[] = []

    if (q.question_type === 'true_false') {
      const tf = (q.true_false_answers as { correct_answer: boolean }[])[0]
      const correct = tf?.correct_answer ?? true
      answers = [
        { id: q.id * 10 + 1, answerText: 'Waar', isCorrect: correct === true },
        { id: q.id * 10 + 2, answerText: 'Niet waar', isCorrect: correct === false },
      ]
    } else if (q.question_type === 'multiple_choice') {
      const opts = q.multiple_choice_options as { id: number; option_text: string; is_correct: boolean; sort_order: number | null }[]
      answers = opts
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map(o => ({ id: o.id, answerText: o.option_text, isCorrect: o.is_correct }))
    } else if (q.question_type === 'more_less') {
      const ml = (q.more_less_answers as { correct_answer: string }[])[0]
      const correct = ml?.correct_answer ?? 'more'
      answers = [
        { id: q.id * 10 + 1, answerText: 'Meer', isCorrect: correct === 'more' },
        { id: q.id * 10 + 2, answerText: 'Minder', isCorrect: correct === 'less' },
        { id: q.id * 10 + 3, answerText: 'Gelijk', isCorrect: correct === 'equal' },
      ]
    }

    const mediaUrl = q.media_type === 'youtube' ? q.youtube_url : q.image_url

    return {
      id: q.id,
      questionText: q.question_text,
      questionType: q.question_type as Question['questionType'],
      mediaType: q.media_type,
      mediaUrl,
      answers,
    }
  })
}
