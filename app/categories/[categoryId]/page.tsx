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
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-16">
      {/* Back link */}
      <div className="w-full max-w-2xl mb-6">
        <Link href="/" className="text-sm text-gray-500 dark:text-gray-400 underline">
          ← Terug naar overzicht
        </Link>
      </div>

      <h1 className="text-5xl font-bold text-green-600 mb-3 text-center">{category.name}</h1>
      <p className="text-xl text-green-600 mb-10 text-center">Kies een ronde om te beginnen</p>

      {rounds.length === 0 ? (
        <p className="text-gray-400">
          Nog geen rondes in deze categorie. Vraag de beheerder om rondes toe te voegen.
        </p>
      ) : (
        <div className="grid gap-5 w-full max-w-2xl">
          {rounds
            .slice()
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map(round => (
              <div
                key={round.id}
                className="bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-xl border border-black/6 dark:border-white/8 p-6 flex items-center justify-between"
              >
                <div>
                  <h2 className="text-lg font-semibold text-green-600">{round.name}</h2>
                  <p className="text-sm text-gray-400 mt-0.5 font-mono">{round.roundType}</p>
                </div>
                <Link
                  href={`/quiz/round/${round.id}`}
                  className="btn-quiz px-6 py-3 text-sm"
                >
                  Start ronde
                </Link>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
