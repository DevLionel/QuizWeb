import { supabaseAdmin } from './lib/supabaseAdmin'
import Link from 'next/link'

export default async function HomePage() {
  const { data: quizzes } = await supabaseAdmin
    .from('quizzes')
    .select('id, title, description')
    .order('id', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">Quiz Platform</h1>
      <p className="text-gray-500 mb-12 text-center">Test jouw kennis met een van onze quizzen</p>

      {!quizzes || quizzes.length === 0 ? (
        <p className="text-gray-400">Nog geen quizzen beschikbaar. Maak er een aan via de <Link href="/admin" className="text-blue-600 underline">admin pagina</Link>.</p>
      ) : (
        <div className="grid gap-6 w-full max-w-2xl">
          {quizzes.map(quiz => (
            <div key={quiz.id} className="bg-white rounded-2xl shadow-sm border p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{quiz.title}</h2>
                {quiz.description && (
                  <p className="text-gray-500 text-sm mt-1">{quiz.description}</p>
                )}
              </div>
              <Link
                href={`/quiz/${quiz.id}`}
                className="btn-quiz px-6 py-3 text-sm"
              >
                Start Quiz
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
