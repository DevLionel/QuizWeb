import { getCategoryById } from '../../../services/categoryService'
import { getRoundsForCategory } from '../../../services/roundService'
import RoundList from '../../components/RoundList'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function AdminCategoryPage({
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
    <main className="max-w-4xl mx-auto p-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/admin" className="underline hover:text-gray-700 dark:hover:text-gray-200">
          Admin
        </Link>
        <span className="mx-2">›</span>
        <span className="dark:text-gray-200">{category.name}</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold dark:text-gray-100">{category.name}</h1>
        <span className="text-sm text-gray-400">Categorie #{category.id}</span>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">Rondes</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Elke ronde bevat vragen. Klik op &quot;Vragen beheren&quot; om vragen toe te voegen of te bewerken.
        </p>
        <RoundList rounds={rounds} categoryId={categoryId} />
      </section>
    </main>
  )
}
