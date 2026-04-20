'use server'
import { supabaseAdmin } from '../lib/supabaseAdmin'
import { revalidatePath } from 'next/cache'

// ── READ ──────────────────────────────────────────────────────────────────────

export async function getAllQuestionsWithAnswers(quizId: number) {
  const { data, error } = await supabaseAdmin
    .from('questions')
    .select(`
      id, question_text, question_type, points, sort_order,
      media_type, image_url, youtube_url,
      true_false_answers ( id, correct_answer ),
      multiple_choice_options ( id, option_text, is_correct, sort_order ),
      more_less_answers ( id, correct_answer, reference_value, unit )
    `)
    .eq('quiz_id', quizId)
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getAllQuizzes() {
  const { data, error } = await supabaseAdmin
    .from('quizzes')
    .select('id, title')
    .order('id', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createQuiz(title: string): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('quizzes')
    .insert([{ title: title.trim() }])
    .select('id')
    .single()
  if (error || !data) throw new Error(error?.message)
  revalidatePath('/admin')
  return data.id
}

// ── CREATE ────────────────────────────────────────────────────────────────────

type Media = { type: 'youtube' | 'image' | 'audio'; url: string } | null

function mediaFields(media: Media) {
  if (!media) return { media_type: null, image_url: null, youtube_url: null }
  return {
    media_type: media.type,
    youtube_url: media.type === 'youtube' ? media.url : null,
    // audio reuses image_url column (media_type distinguishes them)
    image_url: media.type === 'image' || media.type === 'audio' ? media.url : null,
  }
}

export async function addTrueFalseQuestion(
  quizId: number,
  questionText: string,
  correctAnswer: boolean,
  media: Media = null
) {
  const { data: question, error } = await supabaseAdmin
    .from('questions')
    .insert([{ quiz_id: quizId, question_text: questionText, question_type: 'true_false', ...mediaFields(media) }])
    .select('id').single()
  if (error || !question) throw new Error(error?.message)
  await supabaseAdmin.from('true_false_answers')
    .insert([{ question_id: question.id, correct_answer: correctAnswer }])
  revalidatePath('/admin')
}

export async function addMultipleChoiceQuestion(
  quizId: number,
  questionText: string,
  options: { text: string; isCorrect: boolean }[],
  media: Media = null
) {
  const { data: question, error } = await supabaseAdmin
    .from('questions')
    .insert([{ quiz_id: quizId, question_text: questionText, question_type: 'multiple_choice', ...mediaFields(media) }])
    .select('id').single()
  if (error || !question) throw new Error(error?.message)
  const rows = options.map((opt, i) => ({
    question_id: question.id,
    option_text: opt.text,
    is_correct: opt.isCorrect,
    sort_order: i + 1,
  }))
  await supabaseAdmin.from('multiple_choice_options').insert(rows)
  revalidatePath('/admin')
}

export async function addMoreLessQuestion(
  quizId: number,
  questionText: string,
  referenceValue: number,
  correctAnswer: string,
  unit: string,
  media: Media = null
) {
  const { data: question, error } = await supabaseAdmin
    .from('questions')
    .insert([{ quiz_id: quizId, question_text: questionText, question_type: 'more_less', ...mediaFields(media) }])
    .select('id').single()
  if (error || !question) throw new Error(error?.message)
  await supabaseAdmin.from('more_less_answers').insert([{
    question_id: question.id,
    reference_value: referenceValue,
    correct_answer: correctAnswer,
    unit,
  }])
  revalidatePath('/admin')
}

// ── UPDATE ────────────────────────────────────────────────────────────────────

export async function updateQuestionText(questionId: number, questionText: string) {
  const { error } = await supabaseAdmin
    .from('questions')
    .update({ question_text: questionText })
    .eq('id', questionId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function updateTrueFalseAnswer(questionId: number, correctAnswer: boolean) {
  const { error } = await supabaseAdmin
    .from('true_false_answers')
    .update({ correct_answer: correctAnswer })
    .eq('question_id', questionId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function updateMultipleChoiceOptions(
  questionId: number,
  options: { id: number; option_text: string; is_correct: boolean }[]
) {
  for (const opt of options) {
    const { error } = await supabaseAdmin
      .from('multiple_choice_options')
      .update({ option_text: opt.option_text, is_correct: opt.is_correct })
      .eq('id', opt.id)
    if (error) throw new Error(error.message)
  }
  revalidatePath('/admin')
}

export async function updateMoreLessAnswer(
  questionId: number,
  referenceValue: number,
  correctAnswer: string,
  unit: string
) {
  const { error } = await supabaseAdmin
    .from('more_less_answers')
    .update({ reference_value: referenceValue, correct_answer: correctAnswer, unit })
    .eq('question_id', questionId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function updateQuestionMedia(questionId: number, media: Media) {
  const { error } = await supabaseAdmin
    .from('questions')
    .update(mediaFields(media))
    .eq('id', questionId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

// ── DELETE ────────────────────────────────────────────────────────────────────

export async function deleteQuestion(questionId: number) {
  // Answer rows are deleted automatically via CASCADE
  const { error } = await supabaseAdmin
    .from('questions')
    .delete()
    .eq('id', questionId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

