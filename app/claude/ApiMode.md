# API Architectuur: Ondersteuning voor Individual & Team Modus

## Ontwerpprincipe

Een ronde is **altijd** voor één modus: Individueel of Team. De keuze wordt gemaakt bij het aanmaken van de ronde en kan worden bijgewerkt. Dit is een ontwerpbeslissing — niet een keuze die de speler maakt bij het starten.

---

## Huidige status

| Component | Status |
|---|---|
| Frontend stuurt `playMode` mee in POST/PUT | ✅ Geïmplementeerd |
| Admin dropdown om modus te kiezen | ✅ Geïmplementeerd |
| Modus-badge op categorieënpagina | ✅ Geïmplementeerd |
| API retourneert `playMode` in GET responses | ❌ Nog niet geïmplementeerd |
| API slaat `playMode` op bij POST/PUT | ❌ Nog niet geïmplementeerd |

**Tijdelijke workaround:** Zolang de API `playMode` niet retourneert, bevat `app/config/teamRounds.ts` een hardgecodeerde set round-ID's die als Team-modus worden beschouwd. De routing checkt beide bronnen:

```typescript
if (round.playMode === 'Team' || TEAM_ROUND_IDS.has(round.id)) {
  // TeamQuizEngine
}
```

Zodra de API `playMode` correct retourneert, kan `app/config/teamRounds.ts` worden verwijderd.

---

## Vereiste API-wijziging: `playMode` op Round

### Stap 1 — Database

```sql
ALTER TABLE Rounds ADD COLUMN play_mode VARCHAR(20) NOT NULL DEFAULT 'Individual';
-- Geldige waarden: 'Individual' | 'Team'
```

### Stap 2 — C# entiteit en DTO's

```csharp
// Round entiteit
public string PlayMode { get; set; } = "Individual";

// RoundResponse / RoundDto  — zodat GET endpoints het veld teruggeven
public string PlayMode { get; set; } = "Individual";

// CreateRoundRequest  — zodat POST het veld accepteert
public string PlayMode { get; set; } = "Individual";

// UpdateRoundRequest  — zodat PUT het veld accepteert
public string PlayMode { get; set; } = "Individual";
```

Voeg validatie toe: alleen `'Individual'` en `'Team'` zijn geldige waarden (zie hoe `roundType` wordt gevalideerd voor het patroon).

### Stap 3 — Endpoints

| Endpoint | Wijziging |
|---|---|
| `GET /api/Rounds?categoryId=N` | Geef `playMode` terug per ronde |
| `GET /api/Rounds/{id}` | Geef `playMode` terug |
| `POST /api/Rounds` | Accepteer en sla `playMode` op (default `'Individual'`) |
| `PUT /api/Rounds/{id}` | Accepteer en sla `playMode` op |

---

## Frontend TypeScript (huidig)

```typescript
// app/lib/types.ts

export type PlayMode = 'Individual' | 'Team'

export interface RoundResponse {
  id: number
  name: string
  subjectId: number | null
  subjectName: string | null
  displayOrder: number
  roundType: RoundType
  playMode?: PlayMode   // optioneel — API retourneert dit nog niet
  categoryId: number
  categoryName: string
}

export interface CreateRoundPayload {
  name: string
  subjectId: number | null
  displayOrder: number
  roundType: RoundType
  playMode: PlayMode    // altijd meegestuurd naar de API
  categoryId: number
}
```

---

## Frontend aanpassingen NA de API-update

Zodra de API `playMode` correct retourneert zijn slechts twee kleine wijzigingen nodig:

### 1. `app/lib/types.ts` — maak `playMode` verplicht

```typescript
playMode: PlayMode   // verwijder de '?' — API garandeert het veld nu
```

### 2. `app/config/teamRounds.ts` — verwijderen

Het bestand kan worden verwijderd. Verwijder tegelijk de imports en fallback-checks in:
- `app/quiz/round/[roundId]/page.tsx`: `TEAM_ROUND_IDS.has(round.id)` verwijderen
- `app/categories/[categoryId]/page.tsx`: `TEAM_ROUND_IDS.has(round.id)` verwijderen
- `app/admin/components/RoundList.tsx`: `TEAM_ROUND_IDS` import verwijderen

---

## Volgorde van implementatie (backend)

| Stap | Actie |
|---|---|
| 1 | `play_mode` kolom + migratie toevoegen |
| 2 | Round entiteit bijwerken |
| 3 | `RoundResponse` / `RoundDto` bijwerken |
| 4 | `CreateRoundRequest` en `UpdateRoundRequest` bijwerken |
| 5 | Controllers updaten (alle vier round-endpoints) |
| 6 | Frontend: `playMode?` → `playMode` in `RoundResponse` |
| 7 | Frontend: `app/config/teamRounds.ts` verwijderen + imports opruimen |

---

## Wat er NIET hoeft te veranderen

- **Questions / Answers** — content is modusagnostisch
- **Categories** — geen wijzigingen nodig
- **Media-endpoints** — werken al voor beide modi
- **Timer** — volledig client-side, geen API-impact
- **PhotoRound / PassportRound** — eigen engines, worden niet beïnvloed door `playMode`
