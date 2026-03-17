"use client";

import { Question } from '../../services/quizService';
import { useState } from 'react';

interface Props {
  question: Question;
}

export default function TrueFalseTemplate({ question }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="p-4 border rounded shadow space-y-2">
      <p className="font-semibold">{question.questionText}</p>
      {question.mediaUrl && question.mediaType === 'YouTube' && (
        <iframe
          width="400"
          height="225"
          src={question.mediaUrl}
          title="YouTube video"
          allowFullScreen
        />
      )}
      <div className="flex gap-4">
        {question.answers.map((a) => (
          <button
            key={a.id}
            onClick={() => setSelected(a.answerText)}
            className={`px-4 py-2 border rounded ${selected === a.answerText ? 'bg-blue-500 text-white' : ''}`}
          >
            {a.answerText}
          </button>
        ))}
      </div>
      {selected && (
        <p>{question.answers.find((a) => a.answerText === selected)?.isCorrect ? 'Correct!' : 'Wrong!'}</p>
      )}
    </div>
  );
}