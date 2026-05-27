import { getCategoryById } from '../../../../../services/categoryService'
import { getRoundById } from '../../../../../services/roundService'
import { getQuestionsForRound } from '../../../../../services/questionService'
import AddQuestionForm from '../../../../components/AddQuestionForm'
import AddPhotoCardForm from '../../../../components/AddPhotoCardForm'
import AddPassportCardForm from '../../../../components/AddPassportCardForm'
import QuestionList from '../../../../components/QuestionList'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function AdminRoundPage({
  params,
}: {
  params: Promise<{ categoryId: string; roundId: string }>
}) {
  const { categoryId: catStr, roundId: roundStr } = await params
  const categoryId = Number(catStr)
  const roundId = Number(roundStr)
  if (isNaN(categoryId) || isNaN(roundId)) notFound()

  const [category, round, questions] = await Promise.all([
    getCategoryById(categoryId),
    getRoundById(roundId),
    getQuestionsForRound(roundId),
  ])

  return (
    <main className="max-w-4xl mx-auto p-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/admin" className="underline hover:text-gray-700 dark:hover:text-gray-200">
          Admin
        </Link>
        <span className="mx-2">›</span>
        <Link href={`/admin/categories/${categoryId}`} className="underline hover:text-gray-700 dark:hover:text-gray-200">
          {category.name}
        </Link>
        <span className="mx-2">›</span>
        <span className="dark:text-gray-200">{round.name}</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold dark:text-gray-100">{round.name}</h1>
        <div className="text-right text-sm text-gray-400">
          <div>Ronde #{round.id}</div>
          <div>{round.roundType}</div>
        </div>
      </div>

      {/* Add question / photo card / passport card form */}
      {round.roundType === 'PhotoRound'
        ? <AddPhotoCardForm roundId={roundId} questionCount={questions.length} />
        : round.roundType === 'PassportRound'
        ? <AddPassportCardForm roundId={roundId} questionCount={questions.length} />
        : <AddQuestionForm roundId={roundId} />
      }

      <hr className="my-8 dark:border-gray-700" />

      {/* Question list */}
      <QuestionList questions={questions} roundId={roundId} roundType={round.roundType} />
    </main>
  )
}
