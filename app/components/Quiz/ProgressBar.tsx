"use client";

interface Props {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: Props) {
  const percentage = (current / total) * 100;
  return (
    <div className="w-full bg-gray-200 h-4 rounded mt-4">
      <div
        className="bg-green-500 h-4 rounded transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}