import { getAllCategories } from './services/categoryService'
import Link from 'next/link'

export default async function HomePage() {
  const categories = await getAllCategories()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <h1 className="text-9xl font-bold text-green-600 mb-2 text-center">Quiz Platform</h1>
      <p className="text-4xl font-bold text-green-600 mb-12 text-center">
        Test jouw kennis met één van onze categorieën
      </p>

      {!categories || categories.length === 0 ? (
        <p className="text-gray-400">
          Nog geen categorieën beschikbaar. Maak er een aan via de{' '}
          <Link href="/admin" className="text-blue-600 dark:text-blue-300 underline">
            admin pagina
          </Link>
          .
        </p>
      ) : (
        <div className="grid gap-6 w-full max-w-2xl">
          {categories.map(category => (
            <div
              key={category.id}
              className="bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-xl border border-black/6 dark:border-white/8 p-6 flex items-center justify-between"
            >
              <div>
                <h2 className="text-xl font-semibold text-green-600">{category.name}</h2>
              </div>
              <Link
                href={`/categories/${category.id}`}
                className="btn-quiz px-6 py-3 text-sm"
              >
                Bekijk rondes
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
