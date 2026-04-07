'use server'
import { supabase } from '../lib/supabaseClient'

export async function addTrueFalseQuestion(
quizId: number,
questionText: string,
correctAnswer: boolean,
mediaType?: 'image' | 'youtube',
mediaUrl?: string
) {
// Stap 1: vraag aanmaken
const { data: question, error } = await supabase
    .from('questions')
    .insert([{
        quiz_id: quizId,
        question_text: questionText,
        question_type: 'true_false',
        media_type: mediaType ?? null,
        image_url: mediaType === 'image' ? mediaUrl : null,
        youtube_url: mediaType === 'youtube' ? mediaUrl : null,
        }])
        .select('id').single()

        if (error || !question) throw new Error(error?.message)

        // Stap 2: antwoord koppelen
        await supabase
            .from('true_false_answers')
            .insert([{ question_id: question.id, correct_answer: correctAnswer }])
}

export async function addMultipleChoiceQuestion(
quizId: number,
questionText: string,
options: { text: string; isCorrect: boolean }[]
) {
const { data: question, error } = await supabase
    .from('questions')
    .insert([{ quiz_id: quizId, question_text: questionText,
        question_type: 'multiple_choice' }])
        .select('id').single()
        
        if (error || !question) throw new Error(error?.message)


// Alle opties in 1 keer invoegen
const optionRows = options.map((opt, i) => ({
question_id: question.id,
option_text: opt.text,
is_correct: opt.isCorrect,
sort_order: i + 1,
}))
await supabase.from('multiple_choice_options').insert(optionRows)
}

export async function getTrueFalseQuestions(quizId: number) {
  const { data, error } = await supabase
    .from('questions')
    .select('*, true_false_answers(*)')
    .eq('quiz_id', quizId)
    .eq('question_type', 'true_false')

  if (error) throw new Error(error.message)
  return data
}

export async function getQuestionsWithMedia(quizId: number) {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('quiz_id', quizId)
    .not('media_type', 'is', null)

  if (error) throw new Error(error.message)
  return data
}
