# Quiz Modes: Individueel & Team

## Overzicht

Elke ronde wordt bij aanmaken vast ingesteld als **Individueel** of **Team**. De modus kan achteraf worden gewijzigd via de admin. Een ronde kan niet voor beide modi tegelijk worden gebruikt.

| Modus | Scherm | Timer | Score | Navigatie |
|---|---|---|---|---|
| **Individueel** | Mobiel (telefoon) | 15 seconden per vraag | Bijgehouden per speler | Speler klikt zelf door |
| **Team** | Desktop / groot scherm | Geen | Geen (teams schrijven zelf) | Quizmaster klikt door |

---

## Modus instellen (admin)

In de admin (`/admin/categories/{id}`) kies je bij het aanmaken of bewerken van een ronde de speelmodus via een dropdown:

```
Speelmodus:  [Individueel ▼]   (opties: Individueel / Team)
```

De frontend stuurt `playMode` mee in elk `POST /api/Rounds` en `PUT /api/Rounds/{id}` verzoek. Zodra de backend het veld ondersteunt, slaat de API de waarde op en geeft het terug — dan werkt de modus automatisch op basis van de API-waarde.

**Tijdelijke workaround:** Zolang de API `playMode` nog niet retourneert, bevat `app/config/teamRounds.ts` een hardgecodeerde set van round-ID's die altijd als Team-modus worden beschouwd. Zie `ApiMode.md` voor details en de stappen om dit te vervangen.

---

## Routing

De rondenspagina leest de modus uit twee bronnen (in volgorde van prioriteit):

```typescript
// app/quiz/round/[roundId]/page.tsx
if (round.playMode === 'Team' || TEAM_ROUND_IDS.has(round.id)) {
  return <TeamQuizEngine ... />
}
return <QuizEngine ... />
```

Op de categorieënpagina (`/categories/{id}`) toont elke rondekaart een modus-badge:

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
2. Vragen met video (YouTube / MP4) spelen eerst af op volledig scherm
3. Na afloop van de video (of via "Toon Vraag →") verschijnt de vraag + antwoorden
4. Teams schrijven hun antwoorden op papier
5. Quizmaster klikt **"Toon Antwoord"** → correct antwoord licht groen op, foutieve antwoorden dimmen
6. Quizmaster klikt **"Volgende →"** → volgende vraag, antwoord verborgen

### Media-first flow (video-vragen in Team modus)

```
Navigeer naar vraag met video
        │
        ▼
  [MEDIA FASE]  — volledig scherm video, geen vraag zichtbaar
  "Toon Vraag →" knop om te overslaan
        │
        ├── video eindigt ──► [VRAAG FASE]
        └── quizmaster klikt ─► [VRAAG FASE]

  [VRAAG FASE]  — vraagkaart + antwoorden + "Toon Antwoord" knop
```

### UI-layout (vraag fase)

```
┌────────────────────────────────────────────────────┐
│  ← Terug        Vraag 3 / 10        Rondenaam      │
├────────────────────────────────────────────────────┤
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
│  [← Vorige]  [Toon Antwoord / Verberg]  [Volgende →] │
└────────────────────────────────────────────────────┘
```

### State

```typescript
currentIndex: number   // welke vraag (0 … n-1)
revealed: boolean      // true = correct antwoord zichtbaar
mediaPhase: boolean    // true = video speelt, vraag verborgen
```

---

## Gewijzigde bestanden

| Bestand | Wijziging |
|---|---|
| `app/lib/types.ts` | `PlayMode` type; `playMode?` op `RoundResponse`; `playMode` op `CreateRoundPayload` |
| `app/config/teamRounds.ts` | Tijdelijke workaround: hardgecodeerde team-modus round-ID's |
| `app/components/Quiz/TeamQuizEngine.tsx` | Team-modus engine met media-first flow |
| `app/quiz/round/[roundId]/page.tsx` | Brancht op `round.playMode === 'Team' \|\| TEAM_ROUND_IDS.has(round.id)` |
| `app/categories/[categoryId]/page.tsx` | Modus-badge per ronde |
| `app/admin/components/RoundList.tsx` | Speelmodus-dropdown in aanmaak- en bewerkformulier |
| `app/components/Quiz/TruefalseTemplate.tsx` | Grotere aanraakdoelen mobiel |
| `app/components/Quiz/MultipleChoiceTemplate.tsx` | Grotere aanraakdoelen mobiel |
| `app/components/Quiz/MoreLessTemplate.tsx` | Grotere aanraakdoelen mobiel |
