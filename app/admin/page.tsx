import { getAllQuestionsWithAnswers, getAllQuizzes } from './actions'
import QuestionList from './components/QuestionList'
import AddQuestionForm from './components/AddQuestionForm'

export default async function AdminPage() {
  const quizzes = await getAllQuizzes()
  const quizId = quizzes[0]?.id ?? 1
  const questions = await getAllQuestionsWithAnswers(quizId)

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">Admin — Vragen beheren</h1>
      {quizzes[0] && (
        <p className="text-gray-500 mb-6">Quiz: <strong>{quizzes[0].title}</strong></p>
      )}
      <AddQuestionForm quizId={quizId} />
      <hr className="my-8" />
      <QuestionList questions={questions} />
    </main>
  )
}
