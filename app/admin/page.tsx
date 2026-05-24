import { getAllCategories } from '../services/categoryService'
import CategoryList from './components/CategoryList'
import Link from 'next/link'

export default async function AdminPage() {
  const categories = await getAllCategories()

  return (
    <main className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold dark:text-gray-100">Admin — Control Panel</h1>
        <Link href="/" className="text-sm text-gray-500 dark:text-gray-400 underline">
          ← Naar de quiz
        </Link>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">Categorieën</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Elke categorie bevat rondes. Elke ronde bevat vragen.
          Klik op &quot;Rondes beheren&quot; om de rondes van een categorie te bewerken.
        </p>
        <CategoryList categories={categories} />
      </section>
    </main>
  )
}
