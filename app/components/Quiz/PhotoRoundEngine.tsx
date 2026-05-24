"use client";

import { useState } from "react";
import { Question } from "../../lib/types";
import PhotoCard from "./PhotoCard";

const TOTAL_CARDS = 9;

interface Props {
  questions: Question[];
  roundName: string;
}

export default function PhotoRoundEngine({ questions, roundName }: Props) {
  const [revealedSet, setRevealedSet] = useState<Set<number>>(new Set());

  const revealedCount = revealedSet.size;

  function handleReveal(index: number) {
    setRevealedSet((prev) => new Set(prev).add(index));
  }

  function handleReset() {
    setRevealedSet(new Set());
  }

  // Build a fixed array of 9 slots — fill with questions, rest are null
  const slots: (Question | null)[] = Array.from({ length: TOTAL_CARDS }, (_, i) =>
    questions[i] ?? null
  );

  return (
    <div className="max-w-2xl mx-auto space-y-4 px-2">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-green-600 dark:text-green-500 truncate">
          {roundName}
        </h2>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-300 tabular-nums">
            {revealedCount} / {TOTAL_CARDS} onthuld
          </span>
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* 3×3 grid */}
      <div className="grid grid-cols-3 gap-3">
        {slots.map((question, i) =>
          question ? (
            <PhotoCard
              key={question.id}
              question={question}
              index={i + 1}
              revealed={revealedSet.has(i)}
              onReveal={() => handleReveal(i)}
            />
          ) : (
            /* Empty placeholder card */
            <div
              key={`empty-${i}`}
              className="relative rounded-2xl overflow-hidden border border-dashed border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-white/5"
            >
              <div className="w-full aspect-square flex items-center justify-center">
                <span className="text-gray-300 dark:text-gray-600 text-3xl">—</span>
              </div>
              <div className="absolute top-2 left-2 bg-gray-300 dark:bg-gray-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">
                {i + 1}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
