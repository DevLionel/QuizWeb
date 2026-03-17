"use client";

import { Question } from "../../services/quizService";
import { useState } from "react";

interface Props {
  question: Question;
}

export default function MultipleChoiceTemplate({ question }: Props) {
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const selectedAnswer = question.answers.find(a => a.id === selectedAnswerId);

  return (
    <div className="p-4 border rounded shadow space-y-4 bg-white">
      
      <h2 className="font-semibold text-lg">{question.questionText}</h2>

      {/* Media support */}
      {question.mediaType === "Image" && (
        <img src={question.mediaUrl} className="w-96 rounded" />
      )}

      {question.mediaType === "YouTube" && (
        <iframe
          width="400"
          height="225"
          src={question.mediaUrl}
          title="YouTube video"
          allowFullScreen
        />
      )}

      {/* Answers */}
      <div className="flex flex-col gap-2">
        {question.answers.map(answer => (
          <button
            key={answer.id}
            onClick={() => setSelectedAnswerId(answer.id)}
            className={`p-2 border rounded text-left
              ${selectedAnswerId === answer.id ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}
          >
            {answer.answerText}
          </button>
        ))}
      </div>

      <button
        onClick={() => setSubmitted(true)}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Submit
      </button>

      {submitted && selectedAnswer && (
        <p className="font-semibold">
          {selectedAnswer.isCorrect ? "✅ Correct!" : "❌ Wrong answer"}
        </p>
      )}
    </div>
  );
}