'use server'
import { supabase } from '../lib/supabaseClient'
import { revalidatePath } from 'next/cache'

// ── READ ──────────────────────────────────────────────────────────────────────

export async function getAllQuestionsWithAnswers(quizId: number) {
  const { data, error } = await supabase
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
  const { data, error } = await supabase
    .from('quizzes')
    .select('id, title')
    .order('id', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

// ── CREATE ────────────────────────────────────────────────────────────────────

export async function addTrueFalseQuestion(
  quizId: number,
  questionText: string,
  correctAnswer: boolean
) {
  const { data: question, error } = await supabase
    .from('questions')
    .insert([{ quiz_id: quizId, question_text: questionText, question_type: 'true_false' }])
    .select('id').single()
  if (error || !question) throw new Error(error?.message)
  await supabase.from('true_false_answers')
    .insert([{ question_id: question.id, correct_answer: correctAnswer }])
  revalidatePath('/admin')
}

export async function addMultipleChoiceQuestion(
  quizId: number,
  questionText: string,
  options: { text: string; isCorrect: boolean }[]
) {
  const { data: question, error } = await supabase
    .from('questions')
    .insert([{ quiz_id: quizId, question_text: questionText, question_type: 'multiple_choice' }])
    .select('id').single()
  if (error || !question) throw new Error(error?.message)
  const rows = options.map((opt, i) => ({
    question_id: question.id,
    option_text: opt.text,
    is_correct: opt.isCorrect,
    sort_order: i + 1,
  }))
  await supabase.from('multiple_choice_options').insert(rows)
  revalidatePath('/admin')
}

export async function addMoreLessQuestion(
  quizId: number,
  questionText: string,
  referenceValue: number,
  correctAnswer: string,
  unit: string
) {
  const { data: question, error } = await supabase
    .from('questions')
    .insert([{ quiz_id: quizId, question_text: questionText, question_type: 'more_less' }])
    .select('id').single()
  if (error || !question) throw new Error(error?.message)
  await supabase.from('more_less_answers').insert([{
    question_id: question.id,
    reference_value: referenceValue,
    correct_answer: correctAnswer,
    unit,
  }])
  revalidatePath('/admin')
}

// ── UPDATE ────────────────────────────────────────────────────────────────────

export async function updateQuestionText(questionId: number, questionText: string) {
  const { error } = await supabase
    .from('questions')
    .update({ question_text: questionText })
    .eq('id', questionId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function updateTrueFalseAnswer(questionId: number, correctAnswer: boolean) {
  const { error } = await supabase
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
    const { error } = await supabase
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
  const { error } = await supabase
    .from('more_less_answers')
    .update({ reference_value: referenceValue, correct_answer: correctAnswer, unit })
    .eq('question_id', questionId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

// ── DELETE ────────────────────────────────────────────────────────────────────

export async function deleteQuestion(questionId: number) {
  // Answer rows are deleted automatically via CASCADE
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}
