"use client";

import { useState } from "react";
import { Question } from "../../services/quizService";
import { TemplateProps } from "./QuestionRenderer";
import MediaRenderer from "./MediaRenderer";

export default function MultipleChoiceTemplate({ question, onAnswer, givenAnswer, onVideoEnded }: TemplateProps) {
  const [localSelected, setLocalSelected] = useState<number | null>(null);

  if (!question.answers || question.answers.length === 0) {
    return <div className="text-center text-gray-500">Geen antwoorden beschikbaar</div>;
  }

  const handleClick = (answerId: number, correct: boolean) => {
    if (givenAnswer !== null || localSelected !== null) return;
    setLocalSelected(answerId);
    setTimeout(() => onAnswer(correct, answerId), 1000);
  };

  const activeAnswerId = givenAnswer?.answerId ?? localSelected;
  const isLocked = activeAnswerId !== null;

  return (
    <div className="flex flex-col gap-4 w-full">
      <MediaRenderer
        mediaType={question.mediaType}
        mediaUrl={question.mediaUrl}
        onVideoEnded={onVideoEnded}
      />
      <p className="text-lg font-semibold text-center mb-2">{question.questionText}</p>
      {question.answers.map((a) => {
        let color = "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600";
        if (isLocked) {
          if (a.isCorrect) color = "bg-emerald-700 dark:bg-emerald-600";
          else if (a.id === activeAnswerId) color = "bg-red-600 dark:bg-red-500";
          else color = "bg-green-600 dark:bg-green-700 opacity-50";
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
