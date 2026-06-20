# Media-First Q&A Flow in Team Mode

## What This Feature Does

In Team Mode, questions that have a **YouTube clip or MP4 video** attached play the video full-width first. The question text and answers are hidden during playback. Once the video ends (or the quizmaster skips it), the Q&A card appears with a staggered slide-in animation.

Each video plays **once** automatically. After that, the video is visible in the Q&A card in a paused state — the quizmaster can press play again if they want, but it never autoplays a second time.

---

## Flow

```
Navigate to question with video media (first visit)
        │
        ▼
  [MEDIA PHASE]
  Full-width video — autoplays, no question text or answers shown
  "Toon Vraag →" button to skip manually
        │
        ├── video ends naturally ──► [Q&A PHASE]
        └── quizmaster clicks skip ─► [Q&A PHASE]

  [Q&A PHASE]
  Question text + answers slide in (staggered animation)
  Video shown below question in paused state — quizmaster can replay manually
  "Toon Antwoord" / "Verberg Antwoord" controls as before

Navigate to same question again (already watched)
        │
        ▼
  [Q&A PHASE directly — no media phase, no animation]
```

Questions **without** video (Image, audio, no media) skip straight to Q&A — no change.

Navigating **backward** always goes to Q&A directly (no re-play, no animation).

---

## Implementation

### `app/components/Quiz/TeamQuizEngine.tsx`

**State:**
```typescript
const [mediaPhase, setMediaPhase] = useState<boolean>(
  () => initialQuestions.length > 0 && isVideoMedia(initialQuestions[0])
);
const [qaAnimKey, setQaAnimKey] = useState(0);
const [watchedVideos, setWatchedVideos] = useState<Set<number>>(new Set());
```

**`enterQaPhase` helper** — called by both `onVideoEnded` and the skip button:
```typescript
const enterQaPhase = () => {
  setWatchedVideos((prev) => new Set(prev).add(currentIndex));
  setMediaPhase(false);
  setQaAnimKey((k) => k + 1);
};
```

**Navigation handlers:**
- `goToNext` → `setMediaPhase(isVideoMedia(next) && !watchedVideos.has(next))` — skips media phase if already watched
- `goToPrevious` → `setMediaPhase(false)` — always goes straight to Q&A
- `restartQuiz` → clears `watchedVideos` so videos play again in the new session

**Q&A card:**
- `key={qaAnimKey}` on the card div — React remounts it on each `enterQaPhase` call, replaying CSS animations
- `slide-in-up` class applied to question text and each answer only when `qaAnimKey > 0`
- `MediaRenderer` rendered with `autoPlay={false}` — video is visible but paused

**Slide-in timing:**

| Element | `--slide-delay` |
|---|---|
| Question text | 200 ms |
| Answer 1 | 400 ms |
| Answer 2 | 600 ms |
| Answer 3 | 800 ms |
| Answer n | `200 + n × 200` ms |

### `app/globals.css`

```css
@keyframes slide-in-up {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}

.slide-in-up {
  animation: slide-in-up 3s ease-out both;
  animation-delay: var(--slide-delay, 0ms);
}
```

### `app/components/Quiz/MediaRenderer.tsx`

Added `autoPlay?: boolean` prop (defaults to `true` so existing usage is unchanged):

```typescript
interface Props {
  mediaType: string | null;
  mediaUrl: string | null;
  onVideoEnded?: () => void;
  autoPlay?: boolean;
}
```

- YouTube: `playerVars: { autoplay: autoPlay ? 1 : 0, ... }`
- HTML5 video/audio: `autoPlay={autoPlay}`

---

## Edge Cases

| Case | Behaviour |
|---|---|
| First question has video on load | Media phase starts immediately, autoplays |
| Video ends naturally | `enterQaPhase` → slide-in animation, video added to watched set |
| "Toon Vraag →" clicked | Same as video end |
| Navigate forward to watched video question | Q&A directly — no media phase, no animation |
| Navigate backward | Always Q&A directly — no media phase, no animation |
| Image / audio / no media | Q&A phase directly — no change |
| Last question with video | Media → Q&A → "Afronden" ends round |
| Restart quiz | `watchedVideos` cleared — videos play again from the start |
| 0 questions | Existing empty-state guard fires before any phase logic |

---

## Verification

1. `npm run dev` → open a Team Mode round with a YouTube or MP4 video question.
2. First visit → full-width video autoplays, no question/answers visible.
3. Video ends → Q&A card appears with staggered slide-in animation (question at 200 ms, answers cascading every 200 ms).
4. Click "Toon Vraag →" before end → same slide-in animation.
5. Video visible in Q&A card but paused — quizmaster can press play to replay.
6. Navigate away and back to the same question → Q&A shown directly, no video autoplay, no animation.
7. Navigate backward → Q&A shown directly, no animation.
8. Question without video → Q&A appears immediately, no animation.
9. Click "Opnieuw starten" → videos play again from scratch.
