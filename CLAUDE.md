# CLAUDE.md — Quiz Web Application

This file documents the project architecture for developers and AI assistants working in this codebase.

---

## Project Overview

A Next.js quiz application that loads questions from a **local REST API** at `QUIZ_API_BASE_URL` (`http://192.168.2.50:5059` by default) and displays them one-by-one with a 15-second timer, score tracking, and forward/backward navigation.

**Tech stack:**
- Next.js 16.1.6 (App Router)
- React 19.2.3
- TypeScript 5
- Tailwind CSS 4
- REST API backend (OpenAPI, local network)

---

## Architecture

```
quiz-web/
├── app/
│   ├── lib/
│   │   ├── apiClient.ts             ← HTTP fetch wrapper (GET/POST/PUT/DELETE + media upload)
│   │   ├── types.ts                 ← All TypeScript interfaces + mapQuestion() mapper
│   │   └── youtube.ts               ← YouTube URL → embed converter
│   ├── services/
│   │   ├── categoryService.ts       ← CRUD for /api/Categories
│   │   ├── roundService.ts          ← CRUD for /api/Rounds
│   │   └── questionService.ts       ← CRUD for /api/Questions
│   ├── components/Quiz/
│   │   ├── QuizEngine.tsx           ← Main state: questions, timer, score, navigation
│   │   ├── QuestionRenderer.tsx     ← Routes question to the correct template
│   │   ├── TruefalseTemplate.tsx    ← Template: True/False (questionType = 'true_false')
│   │   ├── MultipleChoiceTemplate.tsx ← Template: Multiple choice (questionType = 'multiple_choice')
│   │   ├── MoreLessTemplate.tsx     ← Template: More/Less/Equal (questionType = 'more_less')
│   │   ├── QuestionCard.tsx         ← Card wrapper UI
│   │   ├── ProgressBar.tsx          ← Progress through quiz
│   │   ├── Scoreboard.tsx           ← Current score display
│   │   └── MediaRenderer.tsx        ← Renders YouTube iframes or images
│   ├── page.tsx                     ← Landing page: lists all categories
│   ├── categories/
│   │   └── [categoryId]/page.tsx    ← Lists rounds within a category
│   ├── quiz/
│   │   └── round/[roundId]/page.tsx ← Renders <QuizEngine> for a round
│   ├── admin/
│   │   ├── page.tsx                 ← Admin: category management
│   │   ├── actions.ts               ← Server actions: full CRUD via REST API
│   │   ├── categories/
│   │   │   └── [categoryId]/
│   │   │       ├── page.tsx         ← Admin: round management for a category
│   │   │       └── rounds/
│   │   │           └── [roundId]/page.tsx  ← Admin: question management for a round
│   │   └── components/
│   │       ├── CategoryList.tsx     ← Client: category list with create/edit/delete
│   │       ├── RoundList.tsx        ← Client: round list with create/edit/delete
│   │       ├── QuestionList.tsx     ← Client: question list with inline edit + delete
│   │       └── AddQuestionForm.tsx  ← Client: form to add a new question (type-adaptive)
│   ├── layout.tsx                   ← Root layout (fonts, metadata)
│   └── globals.css                  ← Tailwind base + custom styles
├── public/                          ← Static assets
├── .env.local                       ← API base URL (not committed)
├── package.json
├── tsconfig.json
└── CLAUDE.md                        ← This file
```

---

## Data Hierarchy

```
Categories
  └── Rounds  (per category, have displayOrder + roundType)
        └── Questions  (per round, have questionType + answers[])
              └── Answers  (flat array, have text + isCorrect + displayOrder)
```

---

## Data Flow

```
REST API (http://192.168.2.50:5059)
    ↓  (fetch via apiClient.ts)
categoryService / roundService / questionService
    ↓  (Question[] via mapQuestion())
Server Component (page.tsx)
    ↓  (passes initialQuestions)
QuizEngine.tsx  (state: questions, currentIndex, score, timer, givenAnswers)
    ↓
QuestionRenderer.tsx  (picks template by questionType)
    ↓
Template Component  (renders question + answer buttons)
    ↓  (onAnswer callback)
QuizEngine.tsx  (records answer, advances question)
```

---

## REST API Endpoints

Base URL: `http://192.168.2.50:5059` (configured via `QUIZ_API_BASE_URL`)

### Categories
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/Categories` | List all categories |
| POST | `/api/Categories` | Create category `{ name }` |
| GET | `/api/Categories/{id}` | Get single category |
| PUT | `/api/Categories/{id}` | Update category `{ name }` |
| DELETE | `/api/Categories/{id}` | Delete category |

### Rounds
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/Rounds?categoryId=N` | List rounds for a category |
| POST | `/api/Rounds` | Create round `{ name, displayOrder, roundType, categoryId }` |
| GET | `/api/Rounds/{id}` | Get single round |
| PUT | `/api/Rounds/{id}` | Update round |
| DELETE | `/api/Rounds/{id}` | Delete round |

### Questions
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/Questions?roundId=N&pageSize=200` | List questions for a round |
| POST | `/api/Questions` | Create question (with answers array) |
| GET | `/api/Questions/{id}` | Get single question |
| PUT | `/api/Questions/{id}` | Update question |
| DELETE | `/api/Questions/{id}` | Delete question |

### Media
| Method | Path | Purpose |
|---|---|---|
| POST | `/api/media/images` | Upload image (multipart/form-data) |
| POST | `/api/media/videos` | Upload video/audio (multipart/form-data) |
| DELETE | `/api/media/images/{fileName}` | Delete image |
| DELETE | `/api/media/videos/{fileName}` | Delete video |

---

## Data Models

```typescript
// Raw API shapes (from app/lib/types.ts)

interface AnswerResponse {
  id: number; text: string; isCorrect: boolean; displayOrder: number
}

interface QuestionResponse {
  id: number; text: string
  questionType: 'true_false' | 'multiple_choice' | 'more_less'
  roundId: number; roundName: string; categoryId: number; categoryName: string
  createdAt: string; mediaType: 'youtube' | 'image' | 'audio' | null; mediaUrl: string | null
  answers: AnswerResponse[]
}

interface RoundResponse {
  id: number; name: string; displayOrder: number; roundType: string
  categoryId: number; categoryName: string
}

interface CategoryResponse { id: number; name: string }

// Domain types (used in Quiz components — field names preserved for compatibility)
interface Answer { id: number; answerText: string; isCorrect: boolean }
interface Question {
  id: number; questionText: string
  questionType: 'true_false' | 'multiple_choice' | 'more_less'
  mediaType: string | null; mediaUrl: string | null; answers: Answer[]
}
```

`mapQuestion()` in `app/lib/types.ts` converts `QuestionResponse` → `Question` (maps `text` → `questionText`, answer `text` → `answerText`).

---

## Question Templates

| questionType | Component | Description |
|---|---|---|
| `true_false` | `TruefalseTemplate.tsx` | Two buttons: Waar / Niet waar |
| `multiple_choice` | `MultipleChoiceTemplate.tsx` | 2–6 answer buttons |
| `more_less` | `MoreLessTemplate.tsx` | Three buttons: Meer / Minder / Gelijk |

All templates:
- Accept `givenAnswer` prop — shows locked state (green=correct, red=wrong) when user navigates back
- Disable buttons once answered
- Call `onAnswer(correct: boolean, answerId: number)` on click

---

## Quiz Engine State

```typescript
questions: Question[]
currentIndex: number
score: number
timeLeft: number                                         // 15 seconds per question
givenAnswers: Record<number, { answerId: number; correct: boolean }>
```

When `currentIndex === questions.length` the end screen is shown with final score and a restart button.

---

## User-Facing Routes

```
/                               → Category list (landing page)
/categories/{categoryId}        → Rounds within a category
/quiz/round/{roundId}           → Play a round (quiz engine)

/admin                          → Admin: category management
/admin/categories/{id}          → Admin: round management
/admin/categories/{id}/rounds/{rid}  → Admin: question management
```

---

## Admin Panel

The `/admin` route allows an administrator to manage the full data hierarchy without touching the API directly.

### Navigation
1. `/admin` → manage Categories (create / rename / delete)
2. `/admin/categories/{id}` → manage Rounds within a category (create / reorder / delete)
3. `/admin/categories/{id}/rounds/{rid}` → manage Questions within a round (add / edit / delete)

### AddQuestionForm answer payload construction

| Type | Answers built |
|---|---|
| `true_false` | `[{text:'Waar', isCorrect: tfCorrect}, {text:'Niet waar', isCorrect: !tfCorrect}]` |
| `multiple_choice` | Maps each `MCOption` to `{text, isCorrect, displayOrder: i+1}` |
| `more_less` | `[{text:'Meer'}, {text:'Minder'}, {text:'Gelijk'}]` — one marked `isCorrect:true` |

All three types call the single `saveQuestion(roundId, payload)` server action → `POST /api/Questions`.

### Server actions (app/admin/actions.ts)

| Function | Purpose |
|---|---|
| `createCategory(name)` | POST /api/Categories |
| `updateCategory(id, name)` | PUT /api/Categories/{id} |
| `deleteCategory(id)` | DELETE /api/Categories/{id} |
| `createRound(data)` | POST /api/Rounds |
| `updateRound(id, data)` | PUT /api/Rounds/{id} |
| `deleteRound(id, categoryId)` | DELETE /api/Rounds/{id} |
| `saveQuestion(roundId, payload)` | POST /api/Questions |
| `updateQuestion(id, payload)` | PUT /api/Questions/{id} |
| `deleteQuestion(id)` | DELETE /api/Questions/{id} |
| `uploadMediaFile(formData, kind)` | POST /api/media/{images\|videos} |

### Authentication

**The `/admin` route is currently unprotected.** Fine for local network use.

---

## Development Commands

```bash
npm run dev      # Start local dev server at http://localhost:3000 (auto-opens browser)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `QUIZ_API_BASE_URL` | Base URL of the REST API (server-only, no NEXT_PUBLIC_ prefix) |

Default value in `apiClient.ts`: `http://192.168.2.50:5059`

All API calls happen in Server Components and Server Actions — never in the browser. The variable does **not** need the `NEXT_PUBLIC_` prefix.

---

## What Was Deleted and Why

| Deleted | Reason |
|---|---|
| `app/lib/supabaseClient.ts` | Supabase public client — replaced by `apiClient.ts` |
| `app/lib/supabaseAdmin.ts` | Supabase service-role client — replaced by `apiClient.ts` |
| `app/lib/database.types.ts` | Supabase-generated types — replaced by `app/lib/types.ts` |
| `app/lib/uploadImage.ts` | Supabase Storage upload — replaced by `POST /api/media/images` |
| `app/services/quizService.ts` | Supabase-based data accessor — replaced by `questionService.ts` |
| `app/quiz/actions.ts` | Unused duplicate server actions file |
| `app/quiz/[id]/page.tsx` | Old quiz-by-ID route — replaced by `/quiz/round/[roundId]` |
| `app/admin/components/QuizSelector.tsx` | Quiz selector — replaced by `CategoryList.tsx` |
| `app/test/page.tsx` | Debug page — no longer needed |
| `app/lib/apiClient.ts` (original) | Generic REST fetch wrapper from prior cycle — replaced by new version |
| `app/quiz/[questionId]/page.tsx` | Unused dynamic route |
| `_fixes/` directory | Backup implementations from a prior refactoring cycle |
| `PVA/plan.md` | Dutch implementation plan from the same cycle |

---

## PhotoRound — Implementation Plan

### Goal

A `PhotoRound` displays **9 photo cards in a 3×3 grid** simultaneously — no timer, no one-at-a-time flow. The quizmaster clicks each card to reveal its answer. Designed for classic pub-quiz "identify the picture" rounds.

---

### UX Flow

1. Player opens `/quiz/round/{roundId}` for a round whose `roundType === 'PhotoRound'`.
2. Instead of `<QuizEngine>`, the page renders `<PhotoRoundEngine>`.
3. All 9 cards appear at once in a 3×3 grid.
4. Each card shows:
   - The **photo** (fills most of the card).
   - A **number badge** (1–9) in the top-left corner.
   - A **subtitle bar** at the bottom with `?` while unrevealed.
5. The quizmaster clicks a card → the `?` flips to the **correct answer text** (green highlight).
6. A score counter at the top tracks how many have been revealed.
7. A **"Reset"** button resets all reveals back to `?`.

---

### New Files

| File | Purpose |
|---|---|
| `app/components/Quiz/PhotoRoundEngine.tsx` | Top-level state: revealed cards, score, reset |
| `app/components/Quiz/PhotoCard.tsx` | Single card: image + number badge + answer subtitle |

---

### Changed Files

| File | Change |
|---|---|
| `app/quiz/round/[roundId]/page.tsx` | Check `round.roundType`; render `<PhotoRoundEngine>` when `'PhotoRound'` |

---

### Component Details

#### `PhotoCard.tsx`

```
Props:
  question    : Question        ← one of the 9 questions
  index       : number          ← 1–9 (card number shown in badge)
  revealed    : boolean         ← false → show "?", true → show answer
  onReveal    : () => void      ← called on card click (only fires when !revealed)

Layout (Tailwind):
  - Outer: rounded-2xl overflow-hidden shadow-md border border-black/6
           dark:border-white/8  cursor-pointer  hover:scale-105 transition
  - Image: object-cover w-full aspect-square  (square crop)
  - Badge: absolute top-2 left-2  bg-green-600 text-white
           rounded-full w-7 h-7  text-sm font-bold  flex items-center justify-center
  - Subtitle bar: bg-white/90 dark:bg-black/60  text-center
                  py-1 px-2  text-sm font-semibold  truncate
                  · unrevealed → text-gray-400  "?"
                  · revealed   → text-emerald-700 dark:text-emerald-400  answerText
```

#### `PhotoRoundEngine.tsx`

```
State:
  revealedSet : Set<number>   ← indices (0–8) of revealed cards

Derived:
  revealedCount = revealedSet.size   (shown as "X / 9 onthuld")

Layout:
  - Header row: round title  |  "X / 9 onthuld" counter  |  Reset button
  - 3×3 grid:  grid grid-cols-3 gap-3  (max-w-2xl mx-auto)
  - Each cell:  <PhotoCard>  with index = i + 1
  - If questions.length < 9, remaining cells show a placeholder card (grey + "—")
```

---

### Data Model

Each of the 9 questions in a PhotoRound is a standard `Question` with:

| Field | Value |
|---|---|
| `questionType` | any (e.g. `'MultipleChoice'`) — not used by PhotoRoundEngine |
| `mediaType` | `'Image'` |
| `mediaUrl` | URL of the photo |
| `answers` | At least one answer where `isCorrect: true`; its `answerText` is what appears under the card |
| `questionText` | Optional extra hint (not displayed in the basic design) |

The `mapQuestion()` mapper in `app/lib/types.ts` already handles this — no changes needed.

---

### No-Timer Contract

`PhotoRoundEngine` does **not** import or use `TIMER_SECONDS`, the timer `useEffect`, or the `timerHeld` state. It is a completely separate component from `QuizEngine`.

---

### Routing Change (`app/quiz/round/[roundId]/page.tsx`)

```tsx
// After fetching round + questions:
if (round.roundType === 'PhotoRound') {
  return (
    <div className="min-h-screen py-10 px-4">
      {/* back-link header */}
      <PhotoRoundEngine questions={questions} roundName={round.name} />
    </div>
  )
}
// existing QuizEngine fallback
return (
  <div className="min-h-screen py-10 px-4">
    {/* back-link header */}
    <QuizEngine initialQuestions={questions} />
  </div>
)
```

---

### Style Reference

Match the palette already used in the app:

| Token | Usage |
|---|---|
| `bg-green-600` / `dark:bg-green-700` | Number badge, score accent |
| `bg-emerald-700` / `dark:bg-emerald-400` | Revealed answer text |
| `bg-white/70` / `dark:bg-white/5` | Card background (same as `QuestionCard`) |
| `rounded-2xl`, `shadow-md` | Card corners & shadow |
| `backdrop-blur-sm` | Optional glass effect on subtitle bar |

---

### Out of Scope (for this iteration)

- Scoring per player (each team marks their own sheet).
- Admin UI for creating PhotoRound questions (use existing `AddQuestionForm` with `Image` media type).
- Animations / card-flip effect (can be added later with `transition-all`).

