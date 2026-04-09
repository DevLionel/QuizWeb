"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTheme } from "next-themes";

type AnimationType = "pulse" | "wave" | "random";

interface GridConfig {
  rows: number;
  cols: number;
  spacing: number;
  duration: number;
  color: string;
  animationType: AnimationType;
  pulseEffect: boolean;
  mouseGlow: boolean;
  opacityMin: number;
  opacityMax: number;
  background: string;
}

// ── DataGridHero ────────────────────────────────────────────────────────────

interface DataGridHeroProps extends GridConfig {
  children?: React.ReactNode;
}

function DataGridHero({
  rows: _rows,
  cols,
  spacing,
  duration,
  color,
  animationType,
  pulseEffect,
  mouseGlow,
  opacityMin,
  opacityMax,
  background,
  children,
}: DataGridHeroProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = gridRef.current;
    if (!container) return;

    const buildGrid = () => {
      container.innerHTML = "";

      // Square cells: derive size from viewport width ÷ cols
      const cellSize = Math.floor(window.innerWidth / cols);
      const actualRows = Math.ceil(window.innerHeight / (cellSize + spacing)) + 1;

      container.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
      container.style.gridTemplateRows    = `repeat(${actualRows}, ${cellSize}px)`;
      container.style.gap = `${spacing}px`;
      container.style.setProperty("--mouse-glow-opacity", mouseGlow ? "1" : "0");

      const centerRow = Math.floor(actualRows / 2);
      const centerCol = Math.floor(cols / 2);
      const total = actualRows * cols;

      for (let i = 0; i < total; i++) {
        const cell = document.createElement("div");
        cell.className = "grid-cell";
        cell.style.backgroundColor = color;
        cell.style.setProperty("--opacity-min", String(opacityMin));
        cell.style.setProperty("--opacity-max", String(opacityMax));

        if (pulseEffect) {
          let delay: number;
          const r = Math.floor(i / cols);
          const c = i % cols;

          if (animationType === "wave") {
            delay = (r + c) * 0.1 + Math.random() * 0.3;
          } else if (animationType === "random") {
            delay = Math.random() * duration * 1.2;
          } else {
            // pulse from center — single outward wave, plays once
            const dr = Math.abs(r - centerRow);
            const dc = Math.abs(c - centerCol);
            const dist = Math.sqrt(dr * dr + dc * dc);
            delay = dist * 0.22 + Math.random() * 0.35;
          }

          // Play ONCE: dark → bright → dark, then stop
          cell.style.animation = `cell-pulse ${duration}s ease-in-out ${delay.toFixed(3)}s 1 normal both`;
        } else {
          cell.style.opacity = String(opacityMin);
        }

        container.appendChild(cell);
      }
    };

    buildGrid();
    window.addEventListener("resize", buildGrid);
    return () => window.removeEventListener("resize", buildGrid);
  }, [cols, spacing, color, animationType, pulseEffect, duration, opacityMin, opacityMax, mouseGlow]);

  useEffect(() => {
    if (!mouseGlow || !gridRef.current) return;
    const handler = (e: MouseEvent) => {
      if (!gridRef.current) return;
      const rect = gridRef.current.getBoundingClientRect();
      gridRef.current.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      gridRef.current.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [mouseGlow]);

  return (
    <div className="data-grid-hero" style={{ background }}>
      <div ref={gridRef} className="grid-container" aria-hidden="true" />
      <div className="hero-content" role="region" aria-label="Hero Content">
        {children}
      </div>
    </div>
  );
}

// ── Control panel ────────────────────────────────────────────────────────────

interface ControlPanelProps {
  cfg: GridConfig;
  setCfg: React.Dispatch<React.SetStateAction<GridConfig>>;
  onClose: () => void;
  onRandomize: () => void;
}

function ControlPanel({ cfg, setCfg, onClose, onRandomize }: ControlPanelProps) {
  return (
    <aside className="control-panel">
      <h3>Grid Controls</h3>
      <Slider label="Rows"        min={5}  max={50} step={1}   value={cfg.rows}       onChange={(v) => setCfg({ ...cfg, rows: v })} />
      <Slider label="Columns"     min={5}  max={50} step={1}   value={cfg.cols}       onChange={(v) => setCfg({ ...cfg, cols: v })} />
      <Slider label="Spacing"     min={0}  max={16} step={1}   value={cfg.spacing}    onChange={(v) => setCfg({ ...cfg, spacing: v })} />
      <Slider label="Duration"    min={1}  max={15} step={0.1} value={cfg.duration}   onChange={(v) => setCfg({ ...cfg, duration: v })} />
      <Select
        label="Animation Type"
        value={cfg.animationType}
        options={[
          { label: "Pulse from Center", value: "pulse" },
          { label: "Wave",              value: "wave"  },
          { label: "Random",            value: "random"},
        ]}
        onChange={(v) => setCfg({ ...cfg, animationType: v as AnimationType })}
      />
      <Toggle label="Pulse Effect" value={cfg.pulseEffect} onChange={(v) => setCfg({ ...cfg, pulseEffect: v })} />
      <Toggle label="Mouse Glow"   value={cfg.mouseGlow}   onChange={(v) => setCfg({ ...cfg, mouseGlow: v })} />
      <Slider label="Opacity Min"  min={0} max={1} step={0.05} value={cfg.opacityMin} onChange={(v) => setCfg({ ...cfg, opacityMin: v })} />
      <Slider label="Opacity Max"  min={0} max={1} step={0.05} value={cfg.opacityMax} onChange={(v) => setCfg({ ...cfg, opacityMax: v })} />
      <div className="panel-buttons">
        <button onClick={onRandomize}>Randomize (R)</button>
        <button onClick={onClose}>Close (H)</button>
      </div>
    </aside>
  );
}

interface SliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}

function Slider({ label, min, max, step, value, onChange }: SliderProps) {
  return (
    <label className="panel-control">
      <div className="label-row">
        <span>{label}</span>
        <span className="value">{Number(value).toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </label>
  );
}

interface ToggleProps {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

function Toggle({ label, value, onChange }: ToggleProps) {
  return (
    <label className="panel-control toggle-control">
      <span>{label}</span>
      <button type="button" role="switch" aria-checked={value} onClick={() => onChange(!value)}>
        <span />
      </button>
    </label>
  );
}

interface SelectOption { label: string; value: string; }
interface SelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (v: string) => void;
}

function Select({ label, value, options, onChange }: SelectProps) {
  return (
    <label className="panel-control">
      <div className="label-row">{label}</div>
      <div className="select-wrapper">
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </label>
  );
}

// ── Export ───────────────────────────────────────────────────────────────────

const COLORS = ["#15803d", "#be185d", "#0e7490", "#a16207", "#c2410c"];
const ANIMS: AnimationType[] = ["pulse", "wave", "random"];

export function DataGridBackground() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [cfg, setCfg] = useState<GridConfig>({
    rows: 25,
    cols: 65,
    spacing: 3,
    duration: 5.0,
    color: "#15803d", // dark green
    animationType: "pulse",
    pulseEffect: true,
    mouseGlow: true,
    opacityMin: 0.05,
    opacityMax: isDark ? 0.6 : 0.35,
    background: "transparent",
  });

  const [panelOpen, setPanelOpen] = useState(false);

  const randomize = useCallback(() => {
    const rand = (min: number, max: number) => Math.random() * (max - min) + min;
    setCfg((c) => ({
      ...c,
      rows: Math.floor(rand(15, 40)),
      cols: Math.floor(rand(15, 40)),
      duration: rand(3, 10),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      animationType: ANIMS[Math.floor(Math.random() * ANIMS.length)],
      pulseEffect: Math.random() > 0.2,
      mouseGlow: Math.random() > 0.3,
      opacityMin: rand(0.05, 0.2),
      opacityMax: rand(0.5, 1.0),
      spacing: Math.floor(rand(2, 8)),
    }));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName.toLowerCase() === "input") return;
      const k = e.key.toLowerCase();
      if (k === "h") setPanelOpen((v) => !v);
      if (k === "r") randomize();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [randomize]);

  return (
    <DataGridHero {...cfg}>
      {panelOpen && (
        <ControlPanel
          cfg={cfg}
          setCfg={setCfg}
          onClose={() => setPanelOpen(false)}
          onRandomize={randomize}
        />
      )}
    </DataGridHero>
  );
}
