import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center text-center gap-9">
        <h1 className="text-[12rem] font-bold text-gray-900 leading-none">Quiz Platform</h1>
        <p className="text-[4.5rem] text-gray-600">Test jouw kennis met onze interactieve quiz</p>
        <Link
          href="/quiz/1"
          className="btn-quiz px-36 py-16 text-[5.5rem]"
        >
          Start Quiz
        </Link>
      </div>
    </div>
  );
}
