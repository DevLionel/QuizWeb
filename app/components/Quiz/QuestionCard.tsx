interface Props {
  children: React.ReactNode
}

export default function QuestionCard({ children }: Props) {

  return (
    <div className="bg-white shadow-lg rounded-3xl p-8 w-full max-w-xl text-center">
      {children}
    </div>
  )
}