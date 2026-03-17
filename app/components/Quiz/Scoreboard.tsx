"use client";

interface Props {
  score: number;
}

export default function ScoreBoard({ score }: Props) {
  return (
    <div className="text-lg font-semibold">
      Score: {score}
    </div>
  );
}