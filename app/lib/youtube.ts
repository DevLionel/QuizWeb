export function toYouTubeEmbed(url: string): string {

const match = url.match(
/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))(\S+)/
)

if (!match) 
    throw new Error('Geen geldige YouTube URL')

return `https://www.youtube.com/embed/${match[1]}`
}
// Gebruik in een React component:
// <iframe
// src={toYouTubeEmbed(question.youtube_url)}
// width='560' height='315' allowFullScreen
// />