import QuizEngine from "../../components/Quiz/QuizEngine";

interface Props {
  params: Promise<{ questionId: string }>;
}

export default async function QuizPage({ params }: Props) {
  const { questionId } = await params;
  const questionIdNum = parseInt(questionId);

  return <QuizEngine startQuestionId={questionIdNum} />;
}
