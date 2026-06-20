import { getRoundById } from '../../../services/roundService'
import { getQuestionsForRound } from '../../../services/questionService'
import QuizEngine from '../../../components/Quiz/QuizEngine'
import TeamQuizEngine from '../../../components/Quiz/TeamQuizEngine'
import PhotoRoundEngine from '../../../components/Quiz/PhotoRoundEngine'
import PassportRoundEngine from '../../../components/Quiz/PassportRoundEngine'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function QuizRoundPage({
  params,
}: {
  params: Promise<{ roundId: string }>
}) {
  const { roundId: roundIdStr } = await params
  const roundId = Number(roundIdStr)
  if (isNaN(roundId)) notFound()

  const [round, questions] = await Promise.all([
    getRoundById(roundId),
    getQuestionsForRound(roundId),
  ])

  const backLink = (
    <div className="max-w-2xl mx-auto mb-6">
      <Link
        href={`/categories/${round.categoryId}`}
        className="text-green-600 dark:text-green-500 hover:underline text-lg"
      >
        ← Terug naar {round.categoryName}
      </Link>
    </div>
  )

  if (round.roundType === 'PhotoRound') {
    return (
      <div className="min-h-screen py-10 px-4">
        {backLink}
        <PhotoRoundEngine questions={questions} roundName={round.name} subject={round.subjectName ?? undefined} />
      </div>
    )
  }

  if (round.roundType === 'PassportRound') {
    return (
      <div className="min-h-screen py-10 px-4">
        <div className="max-w-3xl mx-auto mb-6">
          <Link
            href={`/categories/${round.categoryId}`}
            className="text-green-600 dark:text-green-500 hover:underline text-lg"
          >
            ← Terug naar {round.categoryName}
          </Link>
        </div>
        <PassportRoundEngine questions={questions} roundName={round.name} subject={round.subjectName ?? undefined} />
      </div>
    )
  }

  if (round.playMode === 'Team') {
    return (
      <div className="min-h-screen py-10 px-6">
        <div className="max-w-4xl mx-auto mb-6">
          <Link
            href={`/categories/${round.categoryId}`}
            className="text-xl text-green-600 dark:text-green-500 hover:underline"
          >
            ← Terug naar {round.categoryName}
          </Link>
        </div>
        <TeamQuizEngine initialQuestions={questions} roundName={round.name} />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-xl mx-auto mb-6 flex items-center justify-between">
        <Link
          href={`/categories/${round.categoryId}`}
          className="text-2xl text-green-600 dark:text-green-600 hover:underline"
        >
          ← Terug naar {round.categoryName}
        </Link>
        <div className="text-right">
          <span className="text-2xl font-medium text-green-600">{round.name}</span>
          {round.subjectName && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{round.subjectName}</p>
          )}
        </div>
      </div>
      <QuizEngine initialQuestions={questions} />
    </div>
  )
}
