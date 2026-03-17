"use client";

import TrueFalseTemplate from "./TruefalseTemplate";
import MultipleChoiceTemplate from "./MultipleChoiceTemplate";
import MoreLessTemplate from "./MoreLessTemplate";
import { Question } from "../../services/quizService";
import MediaRenderer from "./MediaRenderer";

interface Props {
  question: Question;
  onAnswer: (correct: boolean) => void;
}

export default function QuestionRenderer({ question, onAnswer }: Props) {

  const templates: Record<number, React.ComponentType<Props>> = {
    1: TrueFalseTemplate,
    2: MultipleChoiceTemplate,
    3: MoreLessTemplate,
  };

  const Template = templates[question.templateTypeId];

  if (!Template) {
    return (
      <div className="text-red-500 font-semibold">
        Unknown question type
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center w-full space-y-6">

      {/* Question text */}
      <h2 className="text-2xl font-bold">
        {question.questionText}
      </h2>

      {/* Media (image / youtube) */}
      <MediaRenderer
        mediaType={question.mediaType}
        mediaUrl={question.mediaUrl}
      />

      {/* Render correct template */}
      <Template question={question} onAnswer={onAnswer} />

    </div>
  );
}