"use client";

import TrueFalseTemplate from "./TruefalseTemplate";
import MultipleChoiceTemplate from "./MultipleChoiceTemplate";
import MoreLessTemplate from "./MoreLessTemplate";
import { Question } from "../../services/quizService";

export interface GivenAnswer {
  answerId: number;
  correct: boolean;
}

interface Props {
  question: Question;
  onAnswer: (correct: boolean, answerId: number) => void;
  givenAnswer: GivenAnswer | null;
}

export default function QuestionRenderer({ question, onAnswer, givenAnswer }: Props) {
  const templates: Record<number, React.ComponentType<Props>> = {
    1: TrueFalseTemplate,
    2: MultipleChoiceTemplate,
    3: MoreLessTemplate,
  };

  const Template = templates[question.templateTypeId];

  if (!Template) {
    return <div className="text-center text-red-500">Onbekend vraagtype</div>;
  }

  return <Template question={question} onAnswer={onAnswer} givenAnswer={givenAnswer} />;
}
