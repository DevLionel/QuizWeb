// app/components/Quiz/QuizEngine.tsx
"use client";

import { useEffect, useState } from "react";
import { getQuiz, Question } from "../../services/quizService";
import QuestionRenderer from "./QuestionRenderer";
import ProgressBar from "./ProgressBar";
import ScoreBoard from "./Scoreboard";

interface Props {
  templateId?: number; // now optional
}

export default function QuizEngine({ templateId }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    async function loadQuiz() {
      const data = await getQuiz(templateId);
      setQuestions(data);
    }
    loadQuiz();
  }, [templateId]);

  const moveNext = (correct: boolean) => {
    if (correct) setScore(prev => prev + 1);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setTimeLeft(10); // reset timer for next question
    } else {
      setShowResult(true);
    }
  };

  // Timer logic
  useEffect(() => {
    if (showResult || questions.length === 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          moveNext(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex, questions, showResult]);

  if (questions.length === 0) return <p className="text-center mt-8">Loading quiz...</p>;

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center space-y-6 mt-8">
      <ScoreBoard score={score} />
      <ProgressBar current={currentIndex + 1} total={questions.length} />

      <div className="text-center font-bold text-lg">Time left: {timeLeft}s</div>
      <div className="text-sm text-gray-500">Question {currentIndex + 1} / {questions.length}</div>

      {showResult ? (
        <div className="text-center text-xl font-bold mt-8">
          Quiz Finished! Score: {score}/{questions.length}
        </div>
      ) : (
        <QuestionRenderer question={questions[currentIndex]} onAnswer={moveNext} />
      )}
    </div>
  );
}