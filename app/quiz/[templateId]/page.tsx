// app/quiz/[templateId]/page.tsx
import QuizEngine from "../../components/Quiz/QuizEngine";

// This is a server component by default
interface PageProps {
  params: { templateId?: string }; // templateId may be optional
}

export default function QuizPage({ params }: PageProps) {
  // ✅ Safely unwrap the templateId
  const templateId = params.templateId ? parseInt(params.templateId, 10) : undefined;

  // Pass to client component
  return <QuizEngine templateId={templateId} />;
}