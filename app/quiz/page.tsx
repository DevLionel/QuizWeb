import { supabase } from '../lib/supabaseClient'

export default async function QuizPage({ params }: { params: { id: string } }) {
const { data: questions, error } = await supabase
  .from('questions')
  .select(`
  id, question_text, question_type, points,
  media_type, image_url, youtube_url,
  true_false_answers ( correct_answer ),
  more_less_answers ( reference_value, correct_answer, unit ),
  multiple_choice_options ( id, option_text, is_correct, sort_order )
  `)
  .eq('quiz_id', Number(params.id))
  .order('sort_order', { ascending: true })

  if (error) return <p>Fout: {error.message}</p>

  return (
    <div>
      {questions.map(q => (
        <div key={q.id}>
          <p>{q.question_text}</p>
          {/* Render per question_type het juiste component */}
        </div>
      ))}
    </div>
  )
}
