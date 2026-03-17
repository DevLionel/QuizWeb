interface Props {
  mediaType?: string | null;
  mediaUrl?: string | null;
}

export default function MediaRenderer({ mediaType, mediaUrl }: Props) {

  if (!mediaType || !mediaUrl) return null

  if (mediaType === "image") {
    return (
      <img
        src={mediaUrl}
        alt="Question media"
        className="max-h-80 rounded-lg shadow-md mb-4"
      />
    )
  }

  if (mediaType === "youtube") {

    const videoId = mediaUrl.split("v=")[1]

    return (
      <iframe
        className="w-full h-64 rounded-lg mb-4"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video"
        allowFullScreen
      />
    )
  }

  return null
}