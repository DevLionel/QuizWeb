"use client";

import { useState } from "react";
import { Question } from "../../services/quizService";
import { GivenAnswer } from "./QuestionRenderer";

interface Props {
  question: Question;
  onAnswer: (correct: boolean, answerId: number) => void;
  givenAnswer: GivenAnswer | null;
}

export default function MoreLessTemplate({ question, onAnswer, givenAnswer }: Props) {
  const [localSelected, setLocalSelected] = useState<number | null>(null);

  if (!question.answers || question.answers.length === 0) {
    return <div className="text-center text-gray-500">Geen antwoorden beschikbaar</div>;
  }

  const handleClick = (answerId: number, correct: boolean) => {
    if (givenAnswer !== null || localSelected !== null) return;
    setLocalSelected(answerId);
    setTimeout(() => {
      onAnswer(correct, answerId);
    }, 1000);
  };

  const activeAnswerId = givenAnswer?.answerId ?? localSelected;
  const isLocked = activeAnswerId !== null;

  return (
    <div className="flex flex-col gap-4 w-full">
      <p className="text-lg font-semibold text-center mb-2">{question.questionText}</p>
      {question.answers.map((a) => {
        let color = "bg-blue-600 hover:bg-blue-700";
        if (isLocked) {
          if (a.isCorrect) color = "bg-emerald-700";
          else if (a.id === activeAnswerId) color = "bg-red-600";
          else color = "bg-blue-600 opacity-50";
        }
        return (
          <button
            key={a.id}
            onClick={() => handleClick(a.id, a.isCorrect)}
            disabled={isLocked}
            className={`text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-200 ${
              isLocked ? "cursor-default" : "hover:scale-105 active:scale-95"
            } ${color}`}
          >
            {a.answerText}
          </button>
        );
      })}
    </div>
  );
}
