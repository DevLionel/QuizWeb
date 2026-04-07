# CLAUDE.md — Quiz Web Application

This file documents the project architecture for developers and AI assistants working in this codebase.

---

## Project Overview

A Next.js quiz application that loads questions directly from a **Supabase** database and displays them one-by-one with a 15-second timer, score tracking, and forward/backward navigation.

**Tech stack:**
- Next.js 16.1.6 (App Router)
- React 19.2.3
- TypeScript 5
- Tailwind CSS 4
- Supabase (database + JS client)

---

## Architecture

```
quiz-web/
├── app/
│   ├── lib/
│   │   └── supabaseClient.ts        ← Supabase client singleton
│   ├── services/
│   │   └── quizService.ts           ← Data access: getAllQuestions()
│   ├── components/Quiz/
│   │   ├── QuizEngine.tsx           ← Main state: questions, timer, score, navigation
│   │   ├── QuestionRenderer.tsx     ← Routes question to the correct template
│   │   ├── TruefalseTemplate.tsx    ← Template: True/False (templateTypeId = 1)
│   │   ├── MultipleChoiceTemplate.tsx ← Template: Multiple choice (templateTypeId = 2)
│   │   ├── MoreLessTemplate.tsx     ← Template: More/Less/Equal (templateTypeId = 3)
│   │   ├── QuestionCard.tsx         ← Card wrapper UI
│   │   ├── ProgressBar.tsx          ← Progress through quiz
│   │   ├── Scoreboard.tsx           ← Current score display
│   │   └── MediaRenderer.tsx        ← Renders YouTube iframes or images
│   ├── quiz/
│   │   └── page.tsx                 ← Renders <QuizEngine />
│   ├── page.tsx                     ← Landing page with "Start Quiz" button
│   ├── layout.tsx                   ← Root layout (fonts, metadata)
│   └── globals.css                  ← Tailwind base + custom styles
├── public/                          ← Static assets (SVGs)
├── .env.local                       ← Supabase credentials (not committed)
├── package.json
├── tsconfig.json
└── CLAUDE.md                        ← This file
```

---

## Data Flow

```
Supabase (PostgreSQL)
    ↓  (JS client query)
supabaseClient.ts
    ↓
quizService.ts → getAllQuestions()
    ↓  (Question[] with nested Answer[])
QuizEngine.tsx  (state: questions, currentIndex, score, timer, givenAnswers)
    ↓
QuestionRenderer.tsx  (picks template by templateTypeId)
    ↓
Template Component  (renders question + answer buttons)
    ↓  (onAnswer callback)
QuizEngine.tsx  (records answer, advances question)
```

---

## Supabase Setup

### Step 1 — Create project

Go to [https://supabase.com](https://supabase.com), create a new project.

### Step 2 — Create tables

Run in the **SQL Editor**:

```sql
-- Questions table
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  question_text TEXT NOT NULL,
  template_type_id INT NOT NULL,  -- 1=TrueFalse, 2=MultipleChoice, 3=MoreLess
  media_type TEXT,                -- 'youtube', 'image', or NULL
  media_url TEXT                  -- full URL or NULL
);

-- Answers table
CREATE TABLE answers (
  id SERIAL PRIMARY KEY,
  question_id INT REFERENCES questions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE
);
```

### Step 3 — Row Level Security

Enable RLS on both tables and add public read policies:

```sql
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON questions FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON answers FOR SELECT USING (true);
```

### Step 4 — Add credentials

Copy **Project URL** and **anon public key** from **Project Settings → API** and add them to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### Step 5 — Seed questions

Use the Supabase **Table Editor** or SQL Editor to insert questions:

```sql
INSERT INTO questions (question_text, template_type_id, media_type, media_url)
VALUES
  ('Is the Earth round?', 1, NULL, NULL),
  ('Which planet is largest?', 2, NULL, NULL);

INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (1, 'True', true),
  (1, 'False', false),
  (2, 'Jupiter', true),
  (2, 'Saturn', false),
  (2, 'Mars', false);
```

---

## Data Models

```typescript
interface Answer {
  id: number
  answerText: string
  isCorrect: boolean
}

interface Question {
  id: number
  questionText: string
  templateTypeId: number   // 1=TrueFalse, 2=MultipleChoice, 3=MoreLess
  mediaType: string        // 'youtube' | 'image' | null
  mediaUrl: string | null
  answers: Answer[]
}
```

Supabase column names use `snake_case`; the service layer maps them to `camelCase` TypeScript interfaces.

---

## Question Templates

| templateTypeId | Component | Description |
|---|---|---|
| 1 | `TruefalseTemplate.tsx` | Two buttons: True / False |
| 2 | `MultipleChoiceTemplate.tsx` | 2–6 answer buttons |
| 3 | `MoreLessTemplate.tsx` | Comparative: More / Less / Equal |

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
loading: boolean
error: string | null
```

When `currentIndex === questions.length` the end screen is shown with final score and a restart button.

---

## Development Commands

```bash
npm run dev      # Start local dev server at http://localhost:3000
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## What Was Deleted and Why

| Deleted | Reason |
|---|---|
| `app/lib/apiClient.ts` | Generic REST fetch wrapper — replaced by Supabase client |
| `app/quiz/[questionId]/page.tsx` | Unused dynamic route — quiz loads all questions at once |
| `_fixes/` directory | Backup implementations from a prior refactoring cycle — no longer needed |
| `PVA/plan.md` | Dutch implementation plan from the same cycle — replaced by this file |
| `public/next.svg` | Default Next.js scaffold asset — not used in the app |
| `public/vercel.svg` | Default Next.js scaffold asset — not used in the app |

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous (public) API key |

Both are prefixed `NEXT_PUBLIC_` so they are available in the browser. The anon key is safe to expose — access is controlled by Row Level Security policies in Supabase.

---

## Admin Page

The `/admin` route allows an administrator to manage questions without touching the Supabase dashboard.

### File map

```
app/admin/
├── page.tsx                  ← Server component: loads quizzes + questions
├── actions.ts                ← Server actions: full CRUD (read/create/update/delete)
└── components/
    ├── QuestionList.tsx      ← Client: list of all questions with checkboxes + inline edit
    └── AddQuestionForm.tsx   ← Client: form to add a new question (type-adaptive)
```

### How it works

1. Navigate to `http://localhost:3000/admin`
2. The page loads all questions from the first quiz in Supabase
3. **Add a question** — fill in the form at the top, choose a question type, fill in the answer fields, click "Vraag opslaan"
4. **Edit a question** — check the checkbox next to a question, an inline edit form appears with pre-filled values. Edit and click "Opslaan"
5. **Delete a question** — check the checkbox, click "Verwijderen". The question and all its answers are removed (CASCADE)

### Question types in the form

| Type | Dutch label | Answer fields |
|---|---|---|
| `true_false` | Waar / Niet waar | Radio: Waar or Niet waar |
| `multiple_choice` | Meerkeuze | Dynamic list of text inputs with correct checkboxes; add/remove rows |
| `more_less` | Meer / Minder / Gelijk | Reference value, unit, and correct answer select |

### Server actions (app/admin/actions.ts)

| Function | Purpose |
|---|---|
| `getAllQuizzes()` | Fetch all quizzes (id + title) |
| `getAllQuestionsWithAnswers(quizId)` | Fetch all questions with nested answers |
| `addTrueFalseQuestion(...)` | Insert question + true_false_answers row |
| `addMultipleChoiceQuestion(...)` | Insert question + multiple_choice_options rows |
| `addMoreLessQuestion(...)` | Insert question + more_less_answers row |
| `updateQuestionText(questionId, text)` | Update question text |
| `updateTrueFalseAnswer(questionId, correct)` | Update correct_answer |
| `updateMultipleChoiceOptions(questionId, opts)` | Update all option rows |
| `updateMoreLessAnswer(questionId, ...)` | Update reference_value, correct_answer, unit |
| `deleteQuestion(questionId)` | Delete question (answers cascade) |

All actions call `revalidatePath('/admin')` so the list refreshes automatically after changes.

### Authentication

**The `/admin` route is currently unprotected.** This is fine for local development. Before deploying to production, add authentication. Recommended approach:

1. Install `@supabase/ssr`:
   ```bash
   npm install @supabase/ssr
   ```
2. Create a sign-in page at `app/admin/login/page.tsx`
3. Add `middleware.ts` in the project root to check the Supabase session for all `/admin/*` routes
4. Add RLS policies in Supabase to restrict INSERT/UPDATE/DELETE to authenticated users only
