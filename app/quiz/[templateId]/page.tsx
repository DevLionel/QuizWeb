import QuizEngine from "../../components/Quiz/QuizEngine";

interface PageProps {
  params: { templateId: string };
}

export default function QuizTemplatePage({ params }: PageProps) {
  const templateId = parseInt(params.templateId, 10);

  return <QuizEngine templateId={templateId} />;
}
