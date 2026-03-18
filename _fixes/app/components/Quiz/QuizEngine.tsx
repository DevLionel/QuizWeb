"use client";

import { useEffect, useState } from "react";
import { getAllQuestions, Question } from "../../services/quizService";
import QuestionRenderer from "./QuestionRenderer";
import ProgressBar from "./ProgressBar";
import ScoreBoard from "./Scoreboard";
import QuestionCard from "./QuestionCard";

const TIMER_SECONDS = 15;

interface GivenAnswer {
  answerId: number;
  correct: boolean;
}

export default function QuizEngine() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [givenAnswers, setGivenAnswers] = useState<Record<number, GivenAnswer>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vragen laden bij opstarten
  useEffect(() => {
    getAllQuestions()
      .then((data) => setQuestions(data))
      .catch(() =>
        setError("Kon de vragen niet laden. Controleer of de API actief is op https://localhost:5001/api")
      )
      .finally(() => setLoading(false));
  }, []);

  // Timer: reset bij elke vraagwissel
  useEffect(() => {
    setTimeLeft(TIMER_SECONDS);
  }, [currentIndex]);

  // Timer: aftellen en automatisch doorspringen
  useEffect(() => {
    if (loading || questions.length === 0) return;
    if (givenAnswers[currentIndex] !== undefined) return; // Vraag al beantwoord, timer pauzeert

    if (timeLeft <= 0) {
      // Tijd op: automatisch naar volgende vraag
      setCurrentIndex((i) => i + 1);
      return;
    }

    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, loading, questions.length, currentIndex, givenAnswers]);

  const handleAnswer = (correct: boolean, answerId: number) => {
    if (givenAnswers[currentIndex] !== undefined) return; // Dubbele klik voorkomen

    setGivenAnswers((prev) => ({
      ...prev,
      [currentIndex]: { answerId, correct },
    }));

    if (correct) setScore((s) => s + 1);

    // Na 1 seconde (feedback tonen) automatisch doorspringen
    setTimeout(() => {
      setCurrentIndex((i) => i + 1);
    }, 1000);
  };

  const goToPrevious = () => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  };

  const goToNext = () => {
    setCurrentIndex((i) => Math.min(questions.length - 1, i + 1));
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setScore(0);
    setGivenAnswers({});
    setTimeLeft(TIMER_SECONDS);
  };

  // Laadscherm
  if (loading) {
    return (
      <div className="text-center mt-16 text-gray-600 text-lg">
        Vragen laden...
      </div>
    );
  }

  // Foutmelding
  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-16 text-center">
        <p className="text-red-500 font-semibold">{error}</p>
      </div>
    );
  }

  // Geen vragen
  if (questions.length === 0) {
    return (
      <div className="text-center mt-16 text-gray-600">
        Geen vragen gevonden.
      </div>
    );
  }

  // Eindscherm (currentIndex heeft de grens bereikt)
  if (currentIndex >= questions.length) {
    return (
      <div className="max-w-xl mx-auto mt-16 text-center space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Quiz afgerond!</h2>
        <p className="text-xl text-gray-700">
          Jouw score:{" "}
          <span className="font-bold text-green-700">
            {score} / {questions.length}
          </span>
        </p>
        <p className="text-gray-500">
          {score === questions.length
            ? "Perfect gescoord! 🎉"
            : score >= questions.length / 2
            ? "Goed gedaan!"
            : "Oefen nog wat en probeer het opnieuw."}
        </p>
        <button
          onClick={restartQuiz}
          className="bg-green-700 hover:bg-green-800 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
        >
          Opnieuw spelen
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isAnswered = givenAnswers[currentIndex] !== undefined;
  const timerPercent = (timeLeft / TIMER_SECONDS) * 100;
  const isTimerLow = timeLeft <= 5;

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Bovenste balk: score en timer */}
      <div className="flex justify-between items-center">
        <ScoreBoard score={score} />
        <div
          className={`text-lg font-bold tabular-nums ${
            isTimerLow ? "text-red-500" : "text-gray-700"
          }`}
        >
          {isAnswered ? "✓" : `${timeLeft}s`}
        </div>
      </div>

      {/* Timer balk */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-1000 ${
            isAnswered
              ? "bg-green-500"
              : isTimerLow
              ? "bg-red-500"
              : "bg-blue-500"
          }`}
          style={{ width: `${isAnswered ? 100 : timerPercent}%` }}
        />
      </div>

      {/* Voortgangsbalk */}
      <ProgressBar current={currentIndex + 1} total={questions.length} />

      {/* Vraagnummer */}
      <p className="text-sm text-gray-500 text-center">
        Vraag {currentIndex + 1} van {questions.length}
      </p>

      {/* Vraagkaart */}
      <QuestionCard>
        <QuestionRenderer
          key={currentIndex}
          question={currentQuestion}
          onAnswer={handleAnswer}
          givenAnswer={givenAnswers[currentIndex] ?? null}
        />
      </QuestionCard>

      {/* Vorige / Volgende knoppen */}
      <div className="flex justify-between gap-4 mt-2">
        <button
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← Vorige
        </button>
        <button
          onClick={goToNext}
          disabled={currentIndex === questions.length - 1}
          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Volgende →
        </button>
      </div>
    </div>
  );
}
