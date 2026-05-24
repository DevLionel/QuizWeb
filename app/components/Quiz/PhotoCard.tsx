"use client";

import { Question } from "../../lib/types";

interface Props {
  question: Question;
  index: number;      // 1–9 badge number
  revealed: boolean;
  onReveal: () => void;
}

export default function PhotoCard({ question, index, revealed, onReveal }: Props) {
  const answerText = question.answers[0]?.answerText ?? "?";

  return (
    <div
      onClick={() => { if (!revealed) onReveal(); }}
      className={`relative rounded-2xl overflow-hidden shadow-md border border-black/6 dark:border-white/8 transition-transform duration-200 ${
        revealed ? "cursor-default" : "cursor-pointer hover:scale-105 active:scale-95"
      }`}
    >
      {/* Photo */}
      {question.mediaUrl ? (
        <img
          src={question.mediaUrl}
          alt={`Kaart ${index}`}
          className="w-full aspect-square object-cover"
        />
      ) : (
        <div className="w-full aspect-square bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <span className="text-gray-400 text-4xl">🖼️</span>
        </div>
      )}

      {/* Number badge */}
      <div className="absolute top-2 left-2 bg-green-600 dark:bg-green-700 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow">
        {index}
      </div>

      {/* Answer subtitle bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-black/70 backdrop-blur-sm py-1 px-2 text-sm font-semibold text-center truncate">
        {revealed ? (
          <span className="text-emerald-700 dark:text-emerald-400">{answerText}</span>
        ) : (
          <span className="text-gray-400">?</span>
        )}
      </div>
    </div>
  );
}
