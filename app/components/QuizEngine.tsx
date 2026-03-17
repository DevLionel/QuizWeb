"use client";

import { useEffect, useState } from "react";
import { getQuiz, Question } from "../services/quizService";
import TrueFalseTemplate from "./Quiz/TruefalseTemplate";
import MultipleChoiceTemplate from "./Quiz/MultipleChoiceTemplate";
import MoreLessTemplate from "./Quiz/MoreLessTemplate";

interface Props {
  templateId: number;
}

export default function QuizEngine({ templateId }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function loadQuiz() {
      const data = await getQuiz(templateId);
      setQuestions(data);
    }

    loadQuiz();
     
  }, [templateId]);

  if (questions.length === 0) {
    return <p>Loading quiz...</p>;
  }

  const question = questions[currentIndex];
  console.log(question);

  function nextQuestion() {
    setCurrentIndex((prev) => prev + 1);
     console.log(question);
  }

  return (
    <div className="space-y-6">

      <div>
        Question {currentIndex + 1} / {questions.length}
       
      </div>

      
      {question.templateTypeId === 1 && (
        <TrueFalseTemplate question={question} />
      )}

      {question.templateTypeId === 2 && (
        <MultipleChoiceTemplate question={question} />
      )}

      {question.templateTypeId === 3 && (
        <MoreLessTemplate question={question} />
      )}

      <button
        onClick={nextQuestion}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Next Question
      </button>

    </div>
  );
}