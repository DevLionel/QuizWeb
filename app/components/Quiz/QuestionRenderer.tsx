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

const templates: Record<string, React.ComponentType<Props>> = {
  true_false: TrueFalseTemplate,
  multiple_choice: MultipleChoiceTemplate,
  more_less: MoreLessTemplate,
};

export default function QuestionRenderer({ question, onAnswer, givenAnswer }: Props) {
  const Template = templates[question.questionType];

  if (!Template) {
    return <div className="text-center text-red-500">Onbekend vraagtype: {question.questionType}</div>;
  }

  return <Template question={question} onAnswer={onAnswer} givenAnswer={givenAnswer} />;
}
