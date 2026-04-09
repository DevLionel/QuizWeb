"use client";

import { useCallback, useEffect, useState } from "react";
import { Question } from "../../services/quizService";
import QuestionRenderer from "./QuestionRenderer";
import ProgressBar from "./ProgressBar";
import ScoreBoard from "./Scoreboard";
import QuestionCard from "./QuestionCard";

const TIMER_SECONDS = 15;

interface GivenAnswer {
  answerId: number;
  correct: boolean;
}

interface Props {
  initialQuestions: Question[];
}

export default function QuizEngine({ initialQuestions }: Props) {
  const [questions] = useState<Question[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [givenAnswers, setGivenAnswers] = useState<Record<number, GivenAnswer>>({});
  // true while a YouTube video is still playing — timer is held
  const [timerHeld, setTimerHeld] = useState(
    () => initialQuestions[0]?.mediaType === "youtube"
  );

  // On question change: reset timer and hold it if the new question has a YouTube clip
  useEffect(() => {
    setTimeLeft(TIMER_SECONDS);
    setTimerHeld(questions[currentIndex]?.mediaType === "youtube");
  }, [currentIndex, questions]);

  // Timer: countdown and auto-advance (paused while timerHeld or already answered)
  useEffect(() => {
    if (questions.length === 0) return;
    if (givenAnswers[currentIndex] !== undefined) return;
    if (timerHeld) return;

    if (timeLeft <= 0) {
      setCurrentIndex((i) => i + 1);
      return;
    }

    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, questions.length, currentIndex, givenAnswers, timerHeld]);

  const handleVideoEnded = useCallback(() => setTimerHeld(false), []);

  const handleAnswer = (correct: boolean, answerId: number) => {
    if (givenAnswers[currentIndex] !== undefined) return;

    setGivenAnswers((prev) => ({
      ...prev,
      [currentIndex]: { answerId, correct },
    }));

    if (correct) setScore((s) => s + 1);

    setTimeout(() => {
      setCurrentIndex((i) => i + 1);
    }, 1000);
  };

  const goToPrevious = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const goToNext = () => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1));

  const restartQuiz = () => {
    setCurrentIndex(0);
    setScore(0);
    setGivenAnswers({});
    setTimeLeft(TIMER_SECONDS);
  };

  if (questions.length === 0) {
    return (
      <div className="text-center mt-16 text-gray-600">
        Geen vragen gevonden voor deze quiz.
      </div>
    );
  }

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
      <div className="flex justify-between items-center">
        <ScoreBoard score={score} />
        <div className={`text-lg font-bold tabular-nums ${isTimerLow && !timerHeld ? "text-red-500" : "text-gray-700"}`}>
          {isAnswered ? "✓" : timerHeld ? "▶" : `${timeLeft}s`}
        </div>
      </div>

      {/* Timer bar — frozen at full width while video plays */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-1000 ${
            isAnswered ? "bg-green-500" : timerHeld ? "bg-yellow-400" : isTimerLow ? "bg-red-500" : "bg-green-600 dark:bg-green-700"
          }`}
          style={{ width: `${isAnswered || timerHeld ? 100 : timerPercent}%` }}
        />
      </div>

      <ProgressBar current={currentIndex + 1} total={questions.length} />

      <p className="text-sm text-gray-500 text-center">
        Vraag {currentIndex + 1} van {questions.length}
      </p>

      <QuestionCard>
        <QuestionRenderer
          key={currentIndex}
          question={currentQuestion}
          onAnswer={handleAnswer}
          givenAnswer={givenAnswers[currentIndex] ?? null}
          onVideoEnded={handleVideoEnded}
        />
      </QuestionCard>

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
          className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Volgende →
        </button>
      </div>
    </div>
  );
}
