"use client";

import { useState } from "react";
import { Question } from "../../lib/types";
import PassportCard, { PassportVariant } from "./PassportCard";

interface Props {
  questions: Question[];
  roundName: string;
  subject?: string;
  variant?: PassportVariant;
}

export default function PassportRoundEngine({
  questions,
  roundName,
  subject,
  variant = 1,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedSet, setRevealedSet] = useState<Set<number>>(new Set());

  const total = questions.length;
  const currentQuestion = questions[currentIndex] ?? null;
  const isRevealed = revealedSet.has(currentIndex);

  function handleReveal() {
    setRevealedSet((prev) => new Set(prev).add(currentIndex));
  }

  function handlePrev() {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }

  function handleNext() {
    setCurrentIndex((i) => Math.min(total - 1, i + 1));
  }

  function handleReset() {
    // Clears all reveals — position stays so the quizmaster can re-reveal from where they are
    setRevealedSet(new Set());
  }

  return (
    <div className="flex flex-col gap-4 px-2">
      {/* Header — same width constraint as the card */}
      <div className="flex items-center justify-between gap-4 max-w-3xl mx-auto w-full">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-green-600 dark:text-green-500 truncate">
            {roundName}
          </h2>
          {subject && (
            <p className="text-lg font-semibold text-green-700 dark:text-green-400 mt-1 truncate">
              {subject}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {total > 0 && (
            <span className="text-sm font-medium text-gray-500 dark:text-gray-300 tabular-nums">
              Kaart {currentIndex + 1} / {total}
            </span>
          )}
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Card */}
      {total === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-16">
          Geen paspoortkaarten gevonden voor deze ronde.
        </p>
      ) : currentQuestion ? (
        <div className="max-w-3xl mx-auto w-full">
          <PassportCard
            question={currentQuestion}
            index={currentIndex + 1}
            revealed={isRevealed}
            onReveal={handleReveal}
            variant={variant}
          />
        </div>
      ) : null}

      {/* Navigation buttons */}
      {total > 1 && (
        <div className="flex items-center justify-between max-w-3xl mx-auto w-full mt-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-6 py-3 rounded-xl font-semibold bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Vorige
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex >= total - 1}
            className="px-6 py-3 rounded-xl font-semibold bg-green-600 hover:bg-green-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Volgende →
          </button>
        </div>
      )}
    </div>
  );
}
