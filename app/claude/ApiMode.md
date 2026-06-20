# API Architecture: Ondersteuning voor Individual & Team Modus

## Ontwerpprincipe

Een ronde is **altijd** voor één modus: Individueel of Team. De keuze wordt gemaakt bij het aanmaken van de ronde en kan worden bijgewerkt, maar een ronde is nooit voor beide tegelijk. Dit is een ontwerptijdsbeslissing — niet een keuze die de speler of quizmaster maakt bij het starten.

---

## Vereiste API-wijziging: `playMode` op Round

### Backend

Voeg een kolom toe aan de Rounds-tabel:

```sql
ALTER TABLE Rounds ADD COLUMN play_mode VARCHAR(20) NOT NULL DEFAULT 'Individual';
-- Waarden: 'Individual' | 'Team'
```

Voeg het veld toe aan de Round-entiteit en alle relevante DTO's:

```csharp
// RoundDto / RoundResponse
public string PlayMode { get; set; } = "Individual";
```

Zorg dat alle vier round-endpoints het veld respecteren:

| Endpoint | Gedrag |
|---|---|
| `GET /api/Rounds?categoryId=N` | Geeft `playMode` terug per ronde |
| `GET /api/Rounds/{id}` | Geeft `playMode` terug |
| `POST /api/Rounds` | Accepteert `playMode` in de body |
| `PUT /api/Rounds/{id}` | Accepteert `playMode` in de body |

### Frontend — `app/lib/types.ts`

```typescript
export type PlayMode = 'Individual' | 'Team'

export interface RoundResponse {
  id: number
  name: string
  subjectId: number | null
  subjectName: string | null
  displayOrder: number
  roundType: RoundType
  playMode: PlayMode   // ← nieuw
  categoryId: number
  categoryName: string
}

export interface CreateRoundPayload {
  name: string
  subjectId: number | null
  displayOrder: number
  roundType: RoundType
  playMode: PlayMode   // ← nieuw
  categoryId: number
}
```

---

## Hoe de frontend de modus gebruikt

### Rondenspagina (`app/quiz/round/[roundId]/page.tsx`)

Geen URL-parameter meer nodig. De pagina leest `round.playMode` direct:

```tsx
if (round.playMode === 'Team') {
  return <TeamQuizEngine initialQuestions={questions} roundName={round.name} />
}
// standaard → Individueel
return <QuizEngine initialQuestions={questions} />
```

### Categorieënpagina (`app/categories/[categoryId]/page.tsx`)

Eén Start-knop per ronde, met een modus-badge (groen = Individueel, blauw = Team):

```
┌─────────────────────────────────────────┐
│  Ronde 1 — Aardrijkskunde  [Individueel]│
│                             [Start]     │
└─────────────────────────────────────────┘
```

### Admin (`app/admin/components/RoundList.tsx`)

Een dropdown bij het aanmaken en bewerken van rondes:

```
Speelmodus:  [Individueel ▼]   (opties: Individueel / Team)
```

---

## Fase 2 — Score-opslag voor individuele modus (optioneel)

Op dit moment worden scores alleen lokaal in de browser bijgehouden. Als je scores wilt bewaren:

**Nieuw API-endpoint**

```
POST   /api/Scores          { roundId, playerName, score, totalQuestions }
GET    /api/Scores?roundId=N
GET    /api/Scores/leaderboard?categoryId=N
```

**Nieuwe entiteit**

```csharp
public class Score {
  public int Id { get; set; }
  public int RoundId { get; set; }
  public string PlayerName { get; set; }
  public int Points { get; set; }
  public int TotalQuestions { get; set; }
  public DateTime PlayedAt { get; set; }
}
```

Alleen relevant voor `playMode === 'Individual'` rondes.

---

## Samenvatting prioriteiten

| Prioriteit | Wijziging | Reden |
|---|---|---|
| **Hoog** | `playMode` kolom op Rounds | Kernwijziging — routing en admin werken hier op |
| **Middel** | Score-opslag voor Individual | Geeft spelers historiek en leaderboard |

---

## Wat er NIET hoeft te veranderen

- **Questions / Answers** — content is modusagnostisch
- **Categories** — geen wijzigingen nodig
- **Media-endpoints** — werken al voor beide modi
- **Timer** — volledig client-side, geen API-impact
- **PhotoRound / PassportRound** — roundType-routing blijft ongewijzigd; `playMode` werkt er ook op

---

## Volgorde van implementatie

1. Backend: voeg `play_mode` kolom + migratie toe
2. Backend: update DTO's en controllers (GET/POST/PUT)
3. Frontend `types.ts`: `PlayMode` type + `playMode` veld op beide interfaces *(al gedaan)*
4. Frontend Admin `RoundList.tsx`: speelmodus-dropdown *(al gedaan)*
5. Frontend categorieënpagina: modus-badge *(al gedaan)*
6. Frontend rondenspagina: branch op `round.playMode` *(al gedaan)*
7. (Later) Backend: `POST /api/Scores` + frontend eindscherm-formulier
