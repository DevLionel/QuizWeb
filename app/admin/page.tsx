import { getAllQuestionsWithAnswers, getAllQuizzes } from './actions'
import QuizSelector from './components/QuizSelector'
import QuestionList from './components/QuestionList'
import AddQuestionForm from './components/AddQuestionForm'

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ quizId?: string }>
}) {
  const params = await searchParams
  const quizzes = await getAllQuizzes()
  const quizId = params.quizId ? Number(params.quizId) : null
  const questions = quizId ? await getAllQuestionsWithAnswers(quizId) : []
  const selectedQuiz = quizzes.find(q => q.id === quizId) ?? null

  return (
    <main className="max-w-4xl mx-auto p-8">
      {/* Centered title */}
      <h1 className="text-3xl font-bold text-center mb-8">Admin — Control panel</h1>

      {/* Quiz selector + create */}
      <QuizSelector quizzes={quizzes} selectedQuizId={quizId} />

      {/* Question management — only shown when a quiz is selected */}
      {selectedQuiz && (
        <>
          <p className="text-center text-gray-500 mb-6">
            Managing: <strong>{selectedQuiz.title}</strong>
          </p>
          <AddQuestionForm quizId={selectedQuiz.id} />
          <hr className="my-8" />
          <QuestionList questions={questions} />
        </>
      )}

      {/* Placeholder when no quiz selected */}
      {!selectedQuiz && quizzes.length > 0 && (
        <p className="text-center text-gray-400 mt-12">
          Select a quiz above to manage its questions.
        </p>
      )}

      {!selectedQuiz && quizzes.length === 0 && (
        <p className="text-center text-gray-400 mt-12">
          No quizzes yet. Create your first quiz above.
        </p>
      )}
    </main>
  )
}
