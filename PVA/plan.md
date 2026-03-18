# Plan van Aanpak — Quiz Web Applicatie

## 1. Probleemanalyse

### Huidige situatie
| Probleem | Oorzaak |
|---|---|
| `localhost:3000` toont de standaard Next.js template | `app/page.tsx` is nooit vervangen door een eigen startpagina |
| Navigeren naar `/quiz` geeft een 307 in de output | `app/page.tsx` bevat een `redirect("/quiz")` — 307 is de HTTP-code voor een tijdelijke doorverwijzing. Dit is geen fout maar verwarrend. |
| Geen timer per vraag | `QuizEngine` heeft geen timer-logica |
| Geen vorige/volgende navigatie | `QuizEngine` heeft alleen een `moveNext` functie |
| Beantwoorde vragen worden niet bijgehouden bij terugnavigeren | Antwoord-status zit in lokale state van templates, niet in de engine |
| Dynamische route `/quiz/[questionId]` is niet nodig | De quiz laadt alle vragen tegelijk en navigeert intern |

---

## 2. Gewenste situatie

- Navigeren naar `/quiz` laadt direct de quiz (alle vragen via API)
- Vragen worden één voor één getoond
- Per vraag: **15 seconden timer** die automatisch doorzet als er niet geantwoord is
- **Vorige / Volgende** knoppen om handmatig te navigeren
- **Progressbar** toont animatie van voortgang door de quiz
- **Score** wordt bijgehouden per correct antwoord
- Eerder beantwoorde vragen blijven zichtbaar als "vergrendeld" bij terugnavigeren
- Na de laatste vraag: eindscherm met score en optie om opnieuw te spelen

---

## 3. Technische architectuur

```
quiz-web/
├── app/
│   ├── page.tsx                          ← Landingspagina met "Start Quiz" knop
│   ├── quiz/
│   │   ├── page.tsx                      ← Rendert QuizEngine (server component)
│   │   └── [questionId]/page.tsx         ← Blijft staan, niet actief gebruikt
│   └── components/Quiz/
│       ├── QuizEngine.tsx                ← GEWIJZIGD: state, timer, navigatie
│       ├── QuestionRenderer.tsx          ← GEWIJZIGD: givenAnswer prop doorgeven
│       ├── TruefalseTemplate.tsx         ← GEWIJZIGD: toont vergrendelde staat
│       ├── MultipleChoiceTemplate.tsx    ← GEWIJZIGD: toont vergrendelde staat
│       ├── MoreLessTemplate.tsx          ← GEWIJZIGD: toont vergrendelde staat
│       ├── QuestionCard.tsx              ← geen wijziging nodig
│       ├── ProgressBar.tsx               ← geen wijziging nodig
│       └── Scoreboard.tsx                ← geen wijziging nodig
```

### State in QuizEngine

```typescript
questions: Question[]          // alle geladen vragen
currentIndex: number           // huidige vraagindex (0 t/m questions.length)
score: number                  // aantal goede antwoorden
timeLeft: number               // afteltimer (15 → 0)
givenAnswers: Record<number, { answerId: number; correct: boolean }>
                               // beantwoorde vragen per index
loading: boolean
error: string | null
```

Wanneer `currentIndex === questions.length` → eindscherm.

### Gewijzigde component-interface (templates)

```typescript
interface Props {
  question: Question;
  onAnswer: (correct: boolean, answerId: number) => void;
  givenAnswer: { answerId: number; correct: boolean } | null;
}
```

`givenAnswer` is `null` als de vraag nog niet beantwoord is. Zodra er een antwoord is,
toont de template de vergrendelde staat (groen = goed, rood = fout) zonder nieuwe klik toe te staan.

### Timer-logica

```
useEffect → telt af met setTimeout (1 seconde interval)
  - stopt als givenAnswers[currentIndex] bestaat (vraag al beantwoord)
  - reset naar 15 bij elke currentIndex-wijziging
  - bij timeLeft === 0: automatisch door naar volgende vraag
```

---

## 4. Stap-voor-stap implementatie

### Stap 1 — `app/page.tsx` vervangen
Vervang de standaard Next.js template door een eenvoudige landingspagina
met een "Start Quiz" knop die linkt naar `/quiz`.

**Bestand:** `_fixes/app/page.tsx`

---

### Stap 2 — `app/quiz/page.tsx` aanpassen
Vervang de huidige link-pagina door een server component dat direct
`<QuizEngine />` rendert. De engine laadt zelf alle vragen.

**Bestand:** `_fixes/app/quiz/page.tsx`

---

### Stap 3 — `QuizEngine.tsx` herschrijven
Dit is de kern van de wijzigingen:
- `startQuestionId` prop verwijderen (niet meer nodig)
- Timer toevoegen (15 seconden, aftellend, reset bij vraagwissel)
- `givenAnswers` state toevoegen (bijhouden welke antwoorden gegeven zijn)
- `handleAnswer(correct, answerId)` updaten
- Vorige/Volgende knoppen toevoegen
- Eindscherm toevoegen met herstartoptie

**Bestand:** `_fixes/app/components/Quiz/QuizEngine.tsx`

---

### Stap 4 — `QuestionRenderer.tsx` updaten
Prop `givenAnswer` doorgeven aan de juiste template.
Signature van `onAnswer` updaten naar `(correct: boolean, answerId: number) => void`.

**Bestand:** `_fixes/app/components/Quiz/QuestionRenderer.tsx`

---

### Stap 5 — Templates updaten (alle drie)
`TruefalseTemplate`, `MultipleChoiceTemplate`, `MoreLessTemplate` krijgen:
- `givenAnswer` prop (toont vergrendelde staat bij terugnavigeren)
- Knoppen worden `disabled` zodra er een antwoord is

**Bestanden:**
- `_fixes/app/components/Quiz/TruefalseTemplate.tsx`
- `_fixes/app/components/Quiz/MultipleChoiceTemplate.tsx`
- `_fixes/app/components/Quiz/MoreLessTemplate.tsx`

---

## 5. Bestanden kopiëren

Kopieer alle bestanden uit `_fixes/` naar de corresponderende locatie in `app/`:

| Van `_fixes/`                                       | Naar                                                  |
|-----------------------------------------------------|-------------------------------------------------------|
| `app/page.tsx`                                      | `app/page.tsx`                                        |
| `app/quiz/page.tsx`                                 | `app/quiz/page.tsx`                                   |
| `app/components/Quiz/QuizEngine.tsx`                | `app/components/Quiz/QuizEngine.tsx`                  |
| `app/components/Quiz/QuestionRenderer.tsx`          | `app/components/Quiz/QuestionRenderer.tsx`            |
| `app/components/Quiz/TruefalseTemplate.tsx`         | `app/components/Quiz/TruefalseTemplate.tsx`           |
| `app/components/Quiz/MultipleChoiceTemplate.tsx`    | `app/components/Quiz/MultipleChoiceTemplate.tsx`      |
| `app/components/Quiz/MoreLessTemplate.tsx`          | `app/components/Quiz/MoreLessTemplate.tsx`            |

---

## 6. Controleer na implementatie

1. Start de dev server: `npm run dev`
2. Ga naar `http://localhost:3000` → landingspagina zichtbaar
3. Klik "Start Quiz" → navigeert naar `/quiz`
4. Vragen worden geladen (API moet draaien op `https://localhost:5001/api`)
5. Timer telt af van 15 → bij 0 automatisch volgende vraag
6. Antwoord op een vraag → 1 seconde feedback, dan volgende vraag
7. Navigeer terug met "Vorige" → eerder beantwoorde vraag toont vergrendeld antwoord
8. Progressbar toont animatie van voortgang
9. Na laatste vraag → eindscherm met score

---

## 7. Mogelijke uitbreidingen (buiten scope van dit plan)

- Vraag-shuffle (willekeurige volgorde)
- Categorieën of moeilijkheidsgraden
- High score opslaan (localStorage of database)
- Animatie bij correct/fout antwoord (confetti, shake)
- Mobiele optimalisatie (touch-gestures voor vorige/volgende)
