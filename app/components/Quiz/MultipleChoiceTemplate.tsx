"use client";

import { Question } from "../../services/quizService";

interface Props {
  question: Question;
  onAnswer: (correct: boolean) => void;
}

export default function MultipleChoiceTemplate({ question, onAnswer }: Props) {
  return (
    <div className="flex flex-col items-center space-y-4 mt-4">
      <h2 className="text-2xl font-bold text-center">{question.questionText}</h2>

      <div className="flex flex-col gap-4 w-full max-w-md mt-2">
        {question.answers.map(answer => (
          <button
            key={answer.id}
            onClick={() => onAnswer(answer.isCorrect)}
            className="w-full px-6 py-3 border rounded hover:bg-blue-500 hover:text-white text-center"
          >
            {answer.answerText}
          </button>
        ))}
      </div>
    </div>
  );
}