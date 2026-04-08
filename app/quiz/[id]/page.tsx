import { getAllQuestionsForQuiz } from '../../services/quizService'
import { supabaseAdmin } from '../../lib/supabaseAdmin'
import QuizEngine from '../../components/Quiz/QuizEngine'
import Link from 'next/link'

export default async function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const quizId = Number(id)

  const { data: quiz } = await supabaseAdmin
    .from('quizzes')
    .select('title')
    .eq('id', quizId)
    .single()

  const questions = await getAllQuestionsForQuiz(quizId)

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto mb-6 flex items-center justify-between">
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← Terug naar overzicht
        </Link>
        {quiz && <span className="text-sm font-medium text-gray-600">{quiz.title}</span>}
      </div>
      <QuizEngine initialQuestions={questions} />
    </div>
  )
}
