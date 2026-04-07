import { supabase } from '../lib/supabaseClient'

export default async function TestPage() {
  const { data, error } = await supabase
    .from('quizzes')
    .select(`
      *,
      questions (
        id,
        question_text,
        question_type,
        true_false_answers ( correct_answer ),
        more_less_answers ( reference_value, correct_answer, unit ),
        multiple_choice_options ( option_text, is_correct, sort_order )
      )
    `)

  if (error) return <p>Fout: {error.message}</p>

  return (
    <pre>{JSON.stringify(data, null, 2)}</pre>
  )
}