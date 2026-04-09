interface Props {
  children: React.ReactNode
}

export default function QuestionCard({ children }: Props) {

  return (
    <div className="bg-white/70 dark:bg-white/5 backdrop-blur-sm shadow-lg rounded-3xl p-8 w-full max-w-xl text-center border border-black/6 dark:border-white/8">
      {children}
    </div>
  )
}