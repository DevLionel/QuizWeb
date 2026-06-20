# Quiz Modes: Individueel & Team

## Overzicht

Elke ronde wordt bij aanmaken vast ingesteld als **Individueel** of **Team**. De modus kan achteraf worden gewijzigd via de admin. Een ronde kan niet voor beide modi tegelijk worden gebruikt.

| Modus | Scherm | Timer | Score | Navigatie |
|---|---|---|---|---|
| **Individueel** | Mobiel (telefoon) | 15 seconden per vraag | Bijgehouden per speler | Speler klikt zelf door |
| **Team** | Desktop / groot scherm | Geen | Geen (teams schrijven zelf) | Quizmaster klikt door |

---

## Modus instellen

In de **admin** (`/admin/categories/{id}`) kies je bij het aanmaken of bewerken van een ronde de speelmodus:

```
Speelmodus:  [Individueel ▼]   (opties: Individueel / Team)
```

De modus wordt opgeslagen als `playMode` in de API en bepaalt welke quiz-engine wordt geladen.

---

## Routing

De modus is opgeslagen op de ronde zelf — er is **geen** URL-parameter nodig. De rondenspagina leest `round.playMode` direct uit de API:

```
/quiz/round/[roundId]   ← laadt automatisch de juiste engine op basis van playMode
```

Op de categorieënpagina (`/categories/{id}`) toont elke rondekaart één **Start**-knop en een modus-badge:

```
┌─────────────────────────────────────────────────┐
│  Ronde 1 — Aardrijkskunde         [Individueel] │
│                                   [Start]       │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Ronde 2 — Beroemde Gezichten     [Team]        │
│                                   [Start]       │
└─────────────────────────────────────────────────┘
```

---

## Individuele modus (`QuizEngine`)

- Component: `app/components/Quiz/QuizEngine.tsx`
- 15-seconden afteltimer per vraag
- Score wordt bijgehouden en getoond
- Speler kan terug-navigeren (antwoord blijft zichtbaar in groen/rood)
- Geoptimaliseerd voor mobiel: grote aanraakdoelen (min. 56px hoogte)

---

## Team modus (`TeamQuizEngine`)

Component: `app/components/Quiz/TeamQuizEngine.tsx`

### Werking

1. Quizmaster opent de ronde op een groot scherm (beamer/TV)
2. Alle vragen worden één voor één getoond in groot lettertype
3. Teams schrijven hun antwoorden op papier
4. Quizmaster klikt **"Toon Antwoord"** → correct antwoord licht groen op, foutieve antwoorden dimmen
5. Quizmaster klikt **"Volgende →"** → volgende vraag, antwoord verborgen

### UI-layout

```
┌────────────────────────────────────────────────────┐
│  ← Terug        Vraag 3 / 10        Rondenaam      │
├────────────────────────────────────────────────────┤
│                                                    │
│         [Media: afbeelding of video]               │
│                                                    │
│     Wat is de hoofdstad van Australië?             │
│              (tekst: text-4xl)                     │
│                                                    │
│  ┌──────────────┐   ┌──────────────┐              │
│  │   Sydney     │   │  Canberra ✓  │  ← groen     │
│  └──────────────┘   └──────────────┘              │
│  ┌──────────────┐   ┌──────────────┐              │
│  │   Melbourne  │   │   Brisbane   │              │
│  └──────────────┘   └──────────────┘              │
│                                                    │
│  [← Vorige]   [Toon Antwoord / Verberg]  [Volgende →] │
└────────────────────────────────────────────────────┘
```

### State

```typescript
currentIndex: number   // welke vraag (0 … n-1)
revealed: boolean      // true = correct antwoord zichtbaar
```

Navigeren naar een nieuwe vraag reset `revealed` naar `false`.

---

## Gewijzigde bestanden

| Bestand | Wijziging |
|---|---|
| `app/lib/types.ts` | `PlayMode` type toegevoegd; `playMode` veld op `RoundResponse` + `CreateRoundPayload` |
| `app/components/Quiz/TeamQuizEngine.tsx` | Nieuw — team-modus engine |
| `app/quiz/round/[roundId]/page.tsx` | Brancht op `round.playMode` (geen searchParams meer) |
| `app/categories/[categoryId]/page.tsx` | Één Start-knop + modus-badge per ronde |
| `app/admin/components/RoundList.tsx` | Speelmodus-selector in aanmaak- en bewerkformulier |
| `app/components/Quiz/TruefalseTemplate.tsx` | Grotere aanraakdoelen mobiel |
| `app/components/Quiz/MultipleChoiceTemplate.tsx` | Grotere aanraakdoelen mobiel |
| `app/components/Quiz/MoreLessTemplate.tsx` | Grotere aanraakdoelen mobiel |
