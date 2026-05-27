# Spelers Paspoort — Ontwerp

Drie kaart-varianten voor de PassportRound. Alle varianten gebruiken de bestaande app-stijl:
font Oxanium, groen accent (#15803d / green-600), glazen kaart backdrop-blur, dark-mode support.

---

## Reveal mechanic

Klikken op de kaart onthult **zowel de foto als de naam** tegelijkertijd:

| State        | Foto                         | Naam  | Geboortedatum / Nationaliteit / Historie |
|--------------|------------------------------|-------|------------------------------------------|
| Niet onthuld | Placeholder silhouette       | `"?"` | ✅ Altijd zichtbaar (dit zijn de hints)  |
| Onthuld      | Echte spelerfoto             | Naam  | ✅ Altijd zichtbaar                      |

Placeholder: `/public/passport-placeholder.svg` — grijs vlak met witte spelerssilhouet.

---

## Props interface

```typescript
interface PassportCardProps {
  question : Question   // see data model below
  index    : number     // 1-based badge number
  revealed : boolean    // false → foto verborgen (placeholder) + naam "?"
  onReveal : () => void
}
```

## Data model (encoded in existing Question shape)

| Field         | Maps to                                                                          |
|---------------|----------------------------------------------------------------------------------|
| Speler foto   | `question.mediaUrl` (`mediaType: 'Image'`)                                       |
| Naam          | `question.questionText` — revealed on click                                      |
| Geboortedatum | `question.answers[0].answerText` (displayOrder 1)                                |
| Nationaliteit | `question.answers[1].answerText` (displayOrder 2)                                |
| Historie rij  | `question.answers[2+].answerText` (displayOrder 3+), format: `"1981-1987|Ajax|133|128"` |

`questionType` wordt opgeslagen als `'MultipleChoice'` om de API-validatie "exactly 1 answer" van Photo te omzeilen.

---

## Design 1 — "Classic Passport" (aanbevolen)

Horizontale split: foto links, gegevens rechts, historietabel onderaan.

```
┌──────────────────────────────────────────────────────────────┐
│  [#1]  SPELERS PASPOORT                                       │  ← green-600 header bar
├──────────────┬───────────────────────────────────────────────┤
│              │  Naam:           ?  (klik om te onthullen)     │
│  [FOTO       │                                                │
│   SPELER]    │  Geboortedatum:  31 oktober 1964               │
│  aspect-sq   │  Nationaliteit:  Nederland                     │
│              │                                                │
├──────────────┴───────────────────────────────────────────────┤
│  HISTORIE                                                     │
│  Seizoen      Club           W        (g)                     │
│  ──────────────────────────────────────────────────          │
│  1981–1987    Ajax           133       128                    │
│  1987–1995    AC Milan       147        90                    │
│  ──────────────────────────────────────────────────          │
│  Totaal                      280       218                    │
└──────────────────────────────────────────────────────────────┘
```

**Tailwind tokens:**
- Outer: `rounded-2xl shadow-md border border-black/6 dark:border-white/8 bg-white/70 dark:bg-white/5 backdrop-blur-sm`
- Header: `bg-green-600 text-white px-4 py-2 flex items-center gap-3`
- Badge: `bg-white text-green-700 w-7 h-7 rounded-full text-sm font-bold`
- Photo: `w-full aspect-square object-cover` (left ~35%)
- Naam (verborgen): `text-gray-300 dark:text-gray-600 select-none`
- Naam (onthuld): `text-gray-900 dark:text-white font-bold`
- Table header: `text-xs font-semibold text-gray-400 uppercase`
- Table rows: `text-sm text-gray-700 dark:text-gray-300`
- Totaal row: `font-bold border-t border-gray-200 dark:border-gray-700`

---

## Design 2 — "Trading Card"

Grote foto bovenaan (full-width), drie stat-vakjes eronder, historietabel onderaan.

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│               [FOTO SPELER — full width, 16/9]               │
│                                                              │
│  ████████████████ gradient overlay ████████████████████████ │
│  [#1]   SPELERS PASPOORT                                     │  ← overlay on photo
├──────────────┬─────────────────────┬────────────────────────┤
│   NAAM       │   GEBOORTEDATUM     │   NATIONALITEIT         │
│   ?          │   31 okt 1964       │   Nederland             │  ← 3 equal columns
├──────────────┴─────────────────────┴────────────────────────┤
│  Seizoen      Club           W        (g)                    │
│  1981–1987    Ajax           133       128                   │
│  1987–1995    AC Milan       147        90                   │
└──────────────────────────────────────────────────────────────┘
```

**Tailwind tokens:**
- Outer: `rounded-2xl overflow-hidden shadow-md border border-black/6 dark:border-white/8`
- Photo wrapper: `relative w-full aspect-video`
- Gradient overlay: `absolute inset-0 bg-gradient-to-t from-black/70 to-transparent`
- Overlay text: `absolute bottom-3 left-4 text-white font-bold`
- Stat boxes: `grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-700 bg-white/70 dark:bg-white/5`
- Stat label: `text-xs text-gray-400 uppercase tracking-wide`
- Stat value (naam verborgen): `text-gray-300 dark:text-gray-600`
- Stat value (naam onthuld): `text-sm font-semibold dark:text-white`

---

## Design 3 — "Official Document"

Formeel document-stijl met ring-rand, donkere koptekst, tabel met gridlijnen.

```
╔══════════════════════════════════════════════════════════════╗
║               OFFICIEEL SPELERS PASPOORT                     ║  ← dark green bg, white text
╠══════════════════════════════════════════════════════════════╣
║  ┌──────────────┐   PERSOONLIJKE GEGEVENS                   ║
║  │              │   ─────────────────────                   ║
║  │  [FOTO]      │   Naam:           ?                       ║
║  │              │   Geboortedatum:  31 okt 1964              ║
║  │              │   Nationaliteit:  Nederland                ║
║  └──────────────┘                                           ║
╠══════════════════════════════════════════════════════════════╣
║  CARRIÈRE OVERZICHT                                          ║
║  ┌────────────┬──────────────┬──────────┬──────────┐        ║
║  │ Seizoen    │ Club         │    W     │   (g)    │        ║
║  ├────────────┼──────────────┼──────────┼──────────┤        ║
║  │ 1981–1987  │ Ajax         │   133    │   128    │        ║
║  │ 1987–1995  │ AC Milan     │   147    │    90    │        ║
║  ├────────────┼──────────────┼──────────┼──────────┤        ║
║  │ Totaal     │              │   280    │   218    │        ║
║  └────────────┴──────────────┴──────────┴──────────┘        ║
╚══════════════════════════════════════════════════════════════╝
```

**Tailwind tokens:**
- Outer: `rounded-2xl overflow-hidden ring-2 ring-green-700 dark:ring-green-500 shadow-lg`
- Header: `bg-green-800 dark:bg-green-900 text-white text-center py-3 font-bold tracking-widest uppercase`
- Body: `bg-white dark:bg-gray-900 p-4`
- Section divider: `border-t-2 border-green-700 dark:border-green-600`
- Table: `w-full text-sm border-collapse border border-gray-300 dark:border-gray-600`
- Table header cells: `bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-semibold px-3 py-2 border border-gray-300 dark:border-gray-600`
- Table data cells: `px-3 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300`
- Totaal row: `bg-gray-50 dark:bg-gray-800 font-bold`
