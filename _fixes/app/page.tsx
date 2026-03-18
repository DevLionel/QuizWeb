import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">Quiz Platform</h1>
        <p className="text-gray-600 text-lg">Test jouw kennis met onze interactieve quiz</p>
        <Link
          href="/quiz"
          className="inline-block bg-green-700 hover:bg-green-800 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
        >
          Start Quiz
        </Link>
      </div>
    </div>
  );
}
