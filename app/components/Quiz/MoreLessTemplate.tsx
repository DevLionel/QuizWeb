"use client";

import { Question } from "../../services/quizService";
import { useState } from "react";

interface Props {
  question: Question;
}

export default function MoreLessTemplate({ question }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const selectedAnswer = question.answers.find(a => a.answerText === selected);

  return (
    <div className="p-4 border rounded shadow space-y-4 bg-white">

      <h2 className="font-semibold text-lg">{question.questionText}</h2>

      {/* Media */}
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

      {/* More / Less buttons */}
      <div className="flex gap-4">

        <button
          onClick={() => setSelected("More")}
          className={`px-6 py-2 border rounded
            ${selected === "More" ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}
        >
          More
        </button>

        <button
          onClick={() => setSelected("Less")}
          className={`px-6 py-2 border rounded
            ${selected === "Less" ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}
        >
          Less
        </button>

      </div>

      <button
        onClick={() => setSubmitted(true)}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Submit
      </button>

      {submitted && selectedAnswer && (
        <p className="font-semibold">
          {selectedAnswer.isCorrect ? "✅ Correct!" : "❌ Incorrect"}
        </p>
      )}

    </div>
  );
}