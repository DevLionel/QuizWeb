"use client";

import { Question } from "../../lib/types";

export type PassportVariant = 1 | 2 | 3;

interface Props {
  question: Question;
  index: number;
  revealed: boolean;
  onReveal: () => void;
  variant?: PassportVariant;
}

interface HistorieRow {
  seizoen: string;
  club: string;
  w: number;
  g: number;
}

function parseRow(text: string): HistorieRow {
  const [seizoen = "", club = "", w = "0", g = "0"] = text.split("|");
  return { seizoen, club, w: Number(w), g: Number(g) };
}

function parsePassport(question: Question) {
  // Name in answers[0] (isCorrect: true), career data in questionText as 4 newline-separated lines:
  // line 0: geboortedatum
  // line 1: nationaliteit
  // line 2: club rows joined by ;; (each: "seizoen|club|w|g")
  // line 3: INTERLAND|... interland rows joined by ;;
  const naam = question.answers.find((a) => a.isCorrect)?.answerText ?? "";
  const lines = question.questionText.split("\n");
  const geboortedatum = lines[0] ?? "";
  const nationaliteit = lines[1] ?? "";
  const historieRows: HistorieRow[] = [];
  const interlandRows: HistorieRow[] = [];

  const clubText = lines[2] ?? "";
  const intText  = lines[3] ?? "";
  clubText.split(";;").filter(t => t && t !== "-").forEach(t => historieRows.push(parseRow(t)));
  const intBody = intText.startsWith("INTERLAND|") ? intText.slice("INTERLAND|".length) : intText;
  intBody.split(";;").filter(Boolean).forEach(t => interlandRows.push(parseRow(t)));

  const totaalW    = historieRows.reduce((s, r) => s + r.w, 0);
  const totaalG    = historieRows.reduce((s, r) => s + r.g, 0);
  const totaalIntW = interlandRows.reduce((s, r) => s + r.w, 0);
  const totaalIntG = interlandRows.reduce((s, r) => s + r.g, 0);

  return { naam, geboortedatum, nationaliteit, historieRows, totaalW, totaalG, interlandRows, totaalIntW, totaalIntG };
}

// ── Shared table ──────────────────────────────────────────────────────────────

function HistorieTable({ rows, totaalW, totaalG, landKolom = false }: {
  rows: HistorieRow[]; totaalW: number; totaalG: number; landKolom?: boolean;
}) {
  return (
    <table className="w-full text-3xl">
      <thead>
        <tr className="text-2xl text-gray-400 uppercase border-b border-gray-200 dark:border-gray-700">
          <th className="text-left font-semibold pb-2 pr-4">Seizoen</th>
          <th className="text-left font-semibold pb-2 pr-4">{landKolom ? "Land" : "Club"}</th>
          <th className="text-right font-semibold pb-2 w-24">W</th>
          <th className="text-right font-semibold pb-2 w-24">(g)</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
        {rows.map((row, i) => (
          <tr key={i}>
            <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{row.seizoen}</td>
            <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{row.club}</td>
            <td className="py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">{row.w}</td>
            <td className="py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">{row.g}</td>
          </tr>
        ))}
        <tr className="border-t-2 border-gray-300 dark:border-gray-600 font-bold">
          <td className="pt-2 pr-4 text-gray-900 dark:text-white">Totaal</td>
          <td className="pt-2 pr-4" />
          <td className="pt-2 text-right tabular-nums text-gray-900 dark:text-white">{totaalW}</td>
          <td className="pt-2 text-right tabular-nums text-gray-900 dark:text-white">{totaalG}</td>
        </tr>
      </tbody>
    </table>
  );
}

// ── Design 1 — Classic Passport ───────────────────────────────────────────────

function ClassicPassport({ question, index, revealed, onReveal }: Omit<Props, "variant">) {
  const { naam, geboortedatum, nationaliteit, historieRows, totaalW, totaalG, interlandRows, totaalIntW, totaalIntG } = parsePassport(question);

  return (
    <div onClick={() => { if (!revealed) onReveal(); }}
      className={`rounded-2xl shadow-md border border-black/6 dark:border-white/8 bg-white/70 dark:bg-white/5 backdrop-blur-sm overflow-hidden transition-transform duration-200 ${revealed ? "cursor-default" : "cursor-pointer hover:scale-[1.02] active:scale-[0.98]"}`}>
      <div className="bg-green-600 text-white px-6 py-3 flex items-center gap-4">
        <span className="bg-white text-green-700 w-12 h-12 rounded-full text-2xl font-bold flex items-center justify-center shrink-0">{index}</span>
        <span className="text-3xl font-bold tracking-wide uppercase">Spelers Paspoort</span>
      </div>
      <div className="flex">
        <div className="w-2/5 shrink-0">
          {revealed && question.mediaUrl
            ? <img src={question.mediaUrl} alt={`Speler ${index}`} className="w-full aspect-square object-cover" />
            : <img src="/passport-placeholder.svg" alt="?" className="w-full aspect-square object-cover" />}
        </div>
        <div className="flex-1 px-6 py-5 space-y-4">
          <div>
            <p className="text-2xl font-semibold text-gray-400 uppercase tracking-wide leading-tight">Naam</p>
            <p className={`text-4xl font-bold mt-1 leading-tight ${revealed ? "text-gray-900 dark:text-white" : "text-gray-300 dark:text-gray-600 select-none"}`}>
              {revealed ? naam : "?"}
            </p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-gray-400 uppercase tracking-wide leading-tight">Geboortedatum</p>
            <p className="text-3xl text-gray-700 dark:text-gray-300 mt-1 leading-tight">{geboortedatum || "—"}</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-gray-400 uppercase tracking-wide leading-tight">Nationaliteit</p>
            <p className="text-3xl text-gray-700 dark:text-gray-300 mt-1 leading-tight">{nationaliteit || "—"}</p>
          </div>
        </div>
      </div>
      {historieRows.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <p className="text-2xl font-semibold text-gray-400 uppercase tracking-wide mb-3">Historie als speler</p>
          <HistorieTable rows={historieRows} totaalW={totaalW} totaalG={totaalG} />
        </div>
      )}
      {interlandRows.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <p className="text-2xl font-semibold text-gray-400 uppercase tracking-wide mb-3">Interlands</p>
          <HistorieTable rows={interlandRows} totaalW={totaalIntW} totaalG={totaalIntG} landKolom />
        </div>
      )}
    </div>
  );
}

// ── Design 2 — Trading Card ────────────────────────────────────────────────────

function TradingCard({ question, index, revealed, onReveal }: Omit<Props, "variant">) {
  const { naam, geboortedatum, nationaliteit, historieRows, totaalW, totaalG, interlandRows, totaalIntW, totaalIntG } = parsePassport(question);

  return (
    <div onClick={() => { if (!revealed) onReveal(); }}
      className={`rounded-2xl overflow-hidden shadow-md border border-black/6 dark:border-white/8 transition-transform duration-200 ${revealed ? "cursor-default" : "cursor-pointer hover:scale-[1.02] active:scale-[0.98]"}`}>
      <div className="relative w-full aspect-video">
        {revealed && question.mediaUrl
          ? <img src={question.mediaUrl} alt={`Speler ${index}`} className="w-full h-full object-cover" />
          : <img src="/passport-placeholder.svg" alt="?" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-4 left-5 flex items-center gap-3">
          <span className="bg-green-600 text-white w-12 h-12 rounded-full text-2xl font-bold flex items-center justify-center">{index}</span>
          <span className="text-white text-2xl font-bold uppercase tracking-wide">Spelers Paspoort</span>
        </div>
      </div>
      <div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-700 bg-white/70 dark:bg-white/5 backdrop-blur-sm">
        <div className="px-4 py-4 text-center">
          <p className="text-2xl text-gray-400 uppercase tracking-wide mb-1">Naam</p>
          <p className={`text-3xl font-semibold leading-tight ${revealed ? "text-gray-900 dark:text-white" : "text-gray-300 dark:text-gray-600 select-none"}`}>{revealed ? naam : "?"}</p>
        </div>
        <div className="px-4 py-4 text-center">
          <p className="text-2xl text-gray-400 uppercase tracking-wide mb-1">Geboren</p>
          <p className="text-3xl font-semibold text-gray-700 dark:text-gray-300 leading-tight">{geboortedatum || "—"}</p>
        </div>
        <div className="px-4 py-4 text-center">
          <p className="text-2xl text-gray-400 uppercase tracking-wide mb-1">Nationaliteit</p>
          <p className="text-3xl font-semibold text-gray-700 dark:text-gray-300 leading-tight">{nationaliteit || "—"}</p>
        </div>
      </div>
      {historieRows.length > 0 && (
        <div className="bg-white/70 dark:bg-white/5 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <p className="text-2xl font-semibold text-gray-400 uppercase tracking-wide mb-3">Historie als speler</p>
          <HistorieTable rows={historieRows} totaalW={totaalW} totaalG={totaalG} />
        </div>
      )}
      {interlandRows.length > 0 && (
        <div className="bg-white/70 dark:bg-white/5 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <p className="text-2xl font-semibold text-gray-400 uppercase tracking-wide mb-3">Interlands</p>
          <HistorieTable rows={interlandRows} totaalW={totaalIntW} totaalG={totaalIntG} landKolom />
        </div>
      )}
    </div>
  );
}

// ── Design 3 — Official Document ──────────────────────────────────────────────

function OfficialDocument({ question, index, revealed, onReveal }: Omit<Props, "variant">) {
  const { naam, geboortedatum, nationaliteit, historieRows, totaalW, totaalG, interlandRows, totaalIntW, totaalIntG } = parsePassport(question);

  return (
    <div onClick={() => { if (!revealed) onReveal(); }}
      className={`rounded-2xl overflow-hidden ring-2 ring-green-700 dark:ring-green-500 shadow-lg transition-transform duration-200 ${revealed ? "cursor-default" : "cursor-pointer hover:scale-[1.02] active:scale-[0.98]"}`}>
      <div className="bg-green-800 dark:bg-green-900 text-white text-center py-4 flex items-center justify-center gap-4">
        <span className="bg-white text-green-800 w-12 h-12 rounded-full text-2xl font-bold flex items-center justify-center shrink-0">{index}</span>
        <span className="font-bold tracking-widest uppercase text-3xl">Officieel Spelers Paspoort</span>
      </div>
      <div className="bg-white dark:bg-gray-900 p-6">
        <div className="flex gap-6 mb-6">
          <div className="w-2/5 shrink-0">
            {revealed && question.mediaUrl
              ? <img src={question.mediaUrl} alt={`Speler ${index}`} className="w-full aspect-square object-cover rounded-lg border border-gray-300 dark:border-gray-600" />
              : <img src="/passport-placeholder.svg" alt="?" className="w-full aspect-square object-cover rounded-lg border border-gray-300 dark:border-gray-600" />}
          </div>
          <div className="flex-1">
            <p className="text-2xl font-bold text-green-800 dark:text-green-400 uppercase tracking-wide border-b border-green-700 dark:border-green-600 pb-2 mb-4">Persoonlijke Gegevens</p>
            <div className="space-y-3 text-3xl">
              <div><span className="text-gray-500 dark:text-gray-400">Naam: </span>
                <span className={`font-semibold ${revealed ? "text-gray-900 dark:text-white" : "text-gray-300 dark:text-gray-600 select-none"}`}>{revealed ? naam : "?"}</span>
              </div>
              <div><span className="text-gray-500 dark:text-gray-400">Geboortedatum: </span><span className="font-semibold text-gray-800 dark:text-gray-200">{geboortedatum || "—"}</span></div>
              <div><span className="text-gray-500 dark:text-gray-400">Nationaliteit: </span><span className="font-semibold text-gray-800 dark:text-gray-200">{nationaliteit || "—"}</span></div>
            </div>
          </div>
        </div>
        {historieRows.length > 0 && (
          <>
            <div className="border-t-2 border-green-700 dark:border-green-600 pt-4 mb-3">
              <p className="text-2xl font-bold text-green-800 dark:text-green-400 uppercase tracking-wide">Historie als speler</p>
            </div>
            <table className="w-full text-3xl border-collapse border border-gray-300 dark:border-gray-600 mb-4">
              <thead><tr>{["Seizoen","Club","W","(g)"].map(h => <th key={h} className="bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-semibold px-4 py-3 border border-gray-300 dark:border-gray-600 text-left last:text-right">{h}</th>)}</tr></thead>
              <tbody>
                {historieRows.map((row, i) => (
                  <tr key={i} className="even:bg-gray-50 dark:even:bg-gray-800/40">
                    <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300">{row.seizoen}</td>
                    <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300">{row.club}</td>
                    <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300 text-right tabular-nums">{row.w}</td>
                    <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300 text-right tabular-nums">{row.g}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50 dark:bg-gray-800 font-bold">
                  <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-white">Totaal</td>
                  <td className="px-4 py-2 border border-gray-300 dark:border-gray-600" />
                  <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-white text-right tabular-nums">{totaalW}</td>
                  <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-white text-right tabular-nums">{totaalG}</td>
                </tr>
              </tbody>
            </table>
          </>
        )}
        {interlandRows.length > 0 && (
          <>
            <div className="border-t-2 border-green-700 dark:border-green-600 pt-4 mb-3">
              <p className="text-2xl font-bold text-green-800 dark:text-green-400 uppercase tracking-wide">Interlands</p>
            </div>
            <table className="w-full text-3xl border-collapse border border-gray-300 dark:border-gray-600">
              <thead><tr>{["Seizoen","Land","W","(g)"].map(h => <th key={h} className="bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-semibold px-4 py-3 border border-gray-300 dark:border-gray-600 text-left last:text-right">{h}</th>)}</tr></thead>
              <tbody>
                {interlandRows.map((row, i) => (
                  <tr key={i} className="even:bg-gray-50 dark:even:bg-gray-800/40">
                    <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300">{row.seizoen}</td>
                    <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300">{row.club}</td>
                    <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300 text-right tabular-nums">{row.w}</td>
                    <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300 text-right tabular-nums">{row.g}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50 dark:bg-gray-800 font-bold">
                  <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-white">Totaal</td>
                  <td className="px-4 py-2 border border-gray-300 dark:border-gray-600" />
                  <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-white text-right tabular-nums">{totaalIntW}</td>
                  <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-white text-right tabular-nums">{totaalIntG}</td>
                </tr>
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}

export default function PassportCard({ variant = 1, ...props }: Props) {
  if (variant === 2) return <TradingCard {...props} />;
  if (variant === 3) return <OfficialDocument {...props} />;
  return <ClassicPassport {...props} />;
}
