"use client";

import TrueFalseTemplate from "./TruefalseTemplate";
import MultipleChoiceTemplate from "./MultipleChoiceTemplate";
import MoreLessTemplate from "./MoreLessTemplate";
import { Question } from "../../services/quizService";

interface Props {
  question: Question;
  onAnswer: (correct: boolean) => void;
}

export default function QuestionRenderer({ question, onAnswer }: Props) {
  const templates: Record<number, any> = {
    1: TrueFalseTemplate,
    2: MultipleChoiceTemplate,
    3: MoreLessTemplate,
  };

  const Template = templates[question.templateTypeId];

  if (!Template) return <div>Unknown question type</div>;

  return <Template question={question} onAnswer={onAnswer} />;
}