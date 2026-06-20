import { getCategoryById } from '../../services/categoryService'
import { getRoundsForCategory } from '../../services/roundService'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>
}) {
  const { categoryId: categoryIdStr } = await params
  const categoryId = Number(categoryIdStr)
  if (isNaN(categoryId)) notFound()

  const [category, rounds] = await Promise.all([
    getCategoryById(categoryId),
    getRoundsForCategory(categoryId),
  ])

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-6 py-24">
      {/* Back link */}
      <div className="w-full max-w-4xl mb-9">
        <Link href="/" className="text-base text-gray-500 dark:text-gray-400 underline">
          ← Terug naar overzicht
        </Link>
      </div>

      <h1 className="text-7xl font-bold text-green-600 mb-4 text-center">{category.name}</h1>
      <p className="text-2xl text-green-600 mb-14 text-center">Kies een ronde om te beginnen</p>

      {rounds.length === 0 ? (
        <p className="text-gray-400 text-lg">
          Nog geen rondes in deze categorie. Vraag de beheerder om rondes toe te voegen.
        </p>
      ) : (
        <div className="grid gap-7 w-full max-w-4xl">
          {rounds
            .slice()
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map(round => (
              <div
                key={round.id}
                className="bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-black/6 dark:border-white/8 p-9 flex items-center justify-between"
              >
                <div>
                  <h2 className="text-3xl font-semibold text-green-600">{round.name}</h2>
                  {round.subjectName && (
                    <p className="text-xl text-gray-500 dark:text-gray-400 mt-1">{round.subjectName}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    round.playMode === 'Team'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                      : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                  }`}>
                    {round.playMode === 'Team' ? 'Team' : 'Individueel'}
                  </span>
                  <Link
                    href={`/quiz/round/${round.id}`}
                    className="btn-quiz px-9 py-4 text-base"
                  >
                    Start
                  </Link>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
