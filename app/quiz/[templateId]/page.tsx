import TrueFalseTemplate from "../../components/Quiz/TruefalseTemplate";
import MultipleChoiceTemplate from '../../components/Quiz/MultipleChoiceTemplate';
import MoreLessTemplate from '../../components/Quiz/MoreLessTemplate';
import QuizEngine from "../../components/Quiz/QuizEngine";


interface Props {
  params: { templateId: string };
}

export default async function QuizPage({ params }: Props) {
    const resolvedParams = await params;
    const templateId = parseInt(resolvedParams.templateId);
  
    return (
        <div className="p-8">
            <QuizEngine templateId={templateId} />
        </div>
    );
}