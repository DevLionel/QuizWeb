"use client";

interface Props {
  mediaType: string | null;
  mediaUrl: string | null;
}

export default function MediaRenderer({ mediaType, mediaUrl }: Props) {
  if (!mediaUrl) return null;

  if (mediaType === "youtube")
    return (
      <iframe
        className="w-full aspect-video rounded-xl mb-4"
        src={mediaUrl}
        allowFullScreen
        title="YouTube video"
      />
    );

  if (mediaType === "image")
    return <img src={mediaUrl} alt="Question media" className="w-full rounded-xl mb-4" />;

  return null;
}