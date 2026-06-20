"use client";

import React, { useState } from "react";
import { Question } from "../../lib/types";
import MediaRenderer from "./MediaRenderer";

interface Props {
  initialQuestions: Question[];
  roundName: string;
}

function isVideoMedia(q: Question): boolean {
  if (!q.mediaType || !q.mediaUrl) return false;
  if (q.mediaType === "YouTubeClip" || q.mediaType === "YouTubeShort") return true;
  if (q.mediaType === "Mp4") {
    return !/\.(mp3|wav|ogg|m4a|aac|flac)(\?.*)?$/i.test(q.mediaUrl);
  }
  return false;
}

export default function TeamQuizEngine({ initialQuestions, roundName }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [mediaPhase, setMediaPhase] = useState<boolean>(
    () => initialQuestions.length > 0 && isVideoMedia(initialQuestions[0])
  );
  const [qaAnimKey, setQaAnimKey] = useState(0);
  const [watchedVideos, setWatchedVideos] = useState<Set<number>>(new Set());

  const enterQaPhase = () => {
    setWatchedVideos((prev) => new Set(prev).add(currentIndex));
    setMediaPhase(false);
    setQaAnimKey((k) => k + 1);
  };

  const goToPrevious = () => {
    const prev = Math.max(0, currentIndex - 1);
    setCurrentIndex(prev);
    setRevealed(false);
    setMediaPhase(false);
  };

  const goToNext = () => {
    const next = Math.min(initialQuestions.length - 1, currentIndex + 1);
    setCurrentIndex(next);
    setRevealed(false);
    setMediaPhase(isVideoMedia(initialQuestions[next]) && !watchedVideos.has(next));
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setRevealed(false);
    setWatchedVideos(new Set());
    setMediaPhase(initialQuestions.length > 0 && isVideoMedia(initialQuestions[0]));
  };

  if (initialQuestions.length === 0) {
    return (
      <div className="text-center mt-16 text-gray-600 text-2xl">
        Geen vragen gevonden voor deze ronde.
      </div>
    );
  }

  if (currentIndex >= initialQuestions.length) {
    return (
      <div className="max-w-3xl mx-auto mt-24 text-center space-y-8">
        <h2 className="text-5xl font-bold text-green-600">Ronde afgerond!</h2>
        <p className="text-2xl text-gray-500">
          Alle {initialQuestions.length} vragen zijn beantwoord.
        </p>
        <button
          onClick={restartQuiz}
          className="bg-green-700 hover:bg-green-800 text-white px-12 py-5 rounded-2xl text-xl font-semibold transition-colors"
        >
          Opnieuw starten
        </button>
      </div>
    );
  }

  const question = initialQuestions[currentIndex];
  const isLast = currentIndex === initialQuestions.length - 1;

  if (mediaPhase) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xl text-gray-500 dark:text-gray-400 font-medium">
            Vraag {currentIndex + 1} / {initialQuestions.length}
          </span>
          <span className="text-2xl font-bold text-green-600">{roundName}</span>
        </div>

        <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl">
          <MediaRenderer
            mediaType={question.mediaType}
            mediaUrl={question.mediaUrl}
            onVideoEnded={enterQaPhase}
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={enterQaPhase}
            className="py-3 px-8 bg-green-600 hover:bg-green-700 text-white rounded-2xl text-lg font-semibold transition-colors"
          >
            Toon Vraag →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="text-xl text-gray-500 dark:text-gray-400 font-medium">
          Vraag {currentIndex + 1} / {initialQuestions.length}
        </span>
        <span className="text-2xl font-bold text-green-600">{roundName}</span>
      </div>

      {/* Question card */}
      <div key={qaAnimKey} className="bg-white/70 dark:bg-white/5 backdrop-blur-sm shadow-lg rounded-3xl p-10 w-full border border-black/6 dark:border-white/8">
        {/* Media — no autoplay here; quizmaster controls playback */}
        <MediaRenderer
          mediaType={question.mediaType}
          mediaUrl={question.mediaUrl}
          onVideoEnded={() => {}}
          autoPlay={false}
        />

        {/* Question text */}
        <p
          className={`text-4xl font-bold text-center mt-6 mb-8 leading-snug${qaAnimKey > 0 ? " slide-in-up" : ""}`}
          style={qaAnimKey > 0 ? ({ "--slide-delay": "200ms" } as React.CSSProperties) : undefined}
        >
          {question.questionText}
        </p>

        {/* Answers grid */}
        <div
          className={`grid gap-4 ${
            question.answers.length === 2
              ? "grid-cols-2"
              : question.answers.length <= 4
              ? "grid-cols-2"
              : "grid-cols-3"
          }`}
        >
          {question.answers.map((answer, i) => {
            let classes =
              "py-5 px-6 rounded-2xl text-2xl font-semibold text-center transition-all duration-300 border-2 ";

            if (!revealed) {
              classes +=
                "bg-green-600 dark:bg-green-700 text-white border-transparent";
            } else if (answer.isCorrect) {
              classes +=
                "bg-emerald-600 dark:bg-emerald-500 text-white border-transparent scale-105 shadow-lg";
            } else {
              classes +=
                "bg-gray-200 dark:bg-white/10 text-gray-400 dark:text-gray-500 border-transparent opacity-50";
            }

            if (qaAnimKey > 0) classes += " slide-in-up";

            return (
              <div
                key={answer.id}
                className={classes}
                style={qaAnimKey > 0 ? ({ "--slide-delay": `${400 + i * 200}ms` } as React.CSSProperties) : undefined}
              >
                {answer.answerText}
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className="flex-1 py-4 px-6 bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white rounded-2xl text-xl font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← Vorige
        </button>

        <button
          onClick={() => setRevealed((r) => !r)}
          className={`flex-[2] py-4 px-6 rounded-2xl text-xl font-bold transition-colors ${
            revealed
              ? "bg-amber-500 hover:bg-amber-600 text-white"
              : "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
          }`}
        >
          {revealed ? "Verberg Antwoord" : "Toon Antwoord"}
        </button>

        <button
          onClick={isLast ? () => setCurrentIndex(initialQuestions.length) : goToNext}
          className="flex-1 py-4 px-6 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white rounded-2xl text-xl font-semibold transition-colors"
        >
          {isLast ? "Afronden" : "Volgende →"}
        </button>
      </div>
    </div>
  );
}
