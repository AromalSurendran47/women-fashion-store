"use client";

/**
 * Lightweight SVG/CSS charts for the admin dashboard — no chart library.
 *
 * Palette notes (validated with the dataviz six-checks script on white):
 * - Data series hue: #2a78d6 (single hue per chart; magnitude is carried by
 *   length/position, so one color is correct).
 * - Status donut uses the fixed status palette (good/warning/critical/serious).
 *   Pending & Refunded sit below 3:1 on white, so the legend always shows
 *   visible labels + counts (the "relief rule") — color never works alone.
 */

import { useEffect, useRef, useState } from "react";
import { formatPrice } from "@/lib/utils";

export const SERIES = "#2a78d6";
const GRID = "#EDE8E2"; // site hairline token
const AXIS_TEXT = "#6B6B6B"; // site muted token

/* ----------------------------- helpers ----------------------------- */

/** Track the rendered width of a block element (responsive SVG). */
function useContainerWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => setWidth(entries[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, width };
}

/** Clean rounded y-axis ticks: 0 … top, where top >= max. */
function niceTicks(max: number, count = 3): number[] {
  if (max <= 0) return [0, 1];
  const rough = max / count;
  const pow = 10 ** Math.floor(Math.log10(rough));
  const step =
    [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s * count >= max) ?? 10 * pow;
  const ticks: number[] = [];
  for (let v = 0; v <= max - 1e-9 + step; v += step) ticks.push(Math.round(v * 100) / 100);
  return ticks;
}

/** Compact ₹ for axis labels: ₹950 · ₹12k · ₹4.5L */
function compactINR(v: number): string {
  if (v >= 100000) return `₹${(v / 100000).toFixed(v % 100000 === 0 ? 0 : 1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  return `₹${v}`;
}

const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

/* --------------------------- Revenue area --------------------------- */

export interface DayPoint {
  date: string;
  revenue: number;
  orders: number;
}

export function RevenueAreaChart({ data }: { data: DayPoint[] }) {
  const { ref, width } = useContainerWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const H = 240;
  const pad = { top: 14, right: 12, bottom: 26, left: 46 };
  const w = Math.max(width, 320);
  const innerW = w - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const max = Math.max(...data.map((d) => d.revenue), 0);
  const ticks = niceTicks(max);
  const yMax = ticks[ticks.length - 1] || 1;

  // A single day centers its lone point instead of pinning it to the left edge.
  const x = (i: number) =>
    data.length <= 1 ? pad.left + innerW / 2 : pad.left + (i * innerW) / (data.length - 1);
  const y = (v: number) => pad.top + innerH * (1 - v / yMax);

  const line = data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d.revenue)}`).join(" ");
  const area = `${line} L ${x(data.length - 1)} ${y(0)} L ${x(0)} ${y(0)} Z`;

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (data.length <= 1) return setHover(data.length - 1 >= 0 ? 0 : null);
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const i = Math.round(((mx - pad.left) / innerW) * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, i)));
  };

  const hovered = hover !== null ? data[hover] : null;
  const noData = max === 0;

  return (
    <div ref={ref} className="relative">
      <svg
        width={w}
        height={H}
        role="img"
        aria-label="Revenue for the last 30 days"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        className="block"
      >
        {/* gridlines + y labels */}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.left} x2={w - pad.right} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth={1} />
            <text x={pad.left - 8} y={y(t) + 3.5} textAnchor="end" fontSize={10.5} fill={AXIS_TEXT}>
              {compactINR(t)}
            </text>
          </g>
        ))}

        {/* x labels ~weekly */}
        {data.map((d, i) =>
          (i % 7 === 0 && i < data.length - 3) || i === data.length - 1 ? (
            <text
              key={d.date}
              x={x(i)}
              y={H - 8}
              textAnchor={
                data.length === 1
                  ? "middle"
                  : i === 0
                  ? "start"
                  : i === data.length - 1
                  ? "end"
                  : "middle"
              }
              fontSize={10.5}
              fill={AXIS_TEXT}
            >
              {shortDate(d.date)}
            </text>
          ) : null
        )}

        {!noData && data.length > 1 && (
          <>
            <path d={area} fill={SERIES} opacity={0.1} />
            <path d={line} fill="none" stroke={SERIES} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          </>
        )}
        {!noData && data.length === 1 && (
          <circle cx={x(0)} cy={y(data[0].revenue)} r={4.5} fill={SERIES} stroke="#FFFFFF" strokeWidth={2} />
        )}

        {/* hover crosshair + marker */}
        {hovered && !noData && (
          <>
            <line x1={x(hover!)} x2={x(hover!)} y1={pad.top} y2={y(0)} stroke={GRID} strokeWidth={1} />
            <circle cx={x(hover!)} cy={y(hovered.revenue)} r={4.5} fill={SERIES} stroke="#FFFFFF" strokeWidth={2} />
          </>
        )}
      </svg>

      {noData && (
        <p className="absolute inset-0 flex items-center justify-center text-sm text-muted">
          No revenue in the last 30 days.
        </p>
      )}

      {hovered && !noData && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-xl border border-line bg-background px-3 py-2 text-xs shadow-lg"
          style={{
            left: Math.min(Math.max(x(hover!), 70), w - 70),
            top: Math.max(y(hovered.revenue) - 64, 0),
          }}
        >
          <p className="font-medium">{shortDate(hovered.date)}</p>
          <p className="mt-0.5 text-muted">
            {formatPrice(hovered.revenue)} · {hovered.orders} order{hovered.orders === 1 ? "" : "s"}
          </p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------- Donut ------------------------------ */

export interface Slice {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({
  data,
  centerLabel,
  ariaLabel,
}: {
  data: Slice[];
  centerLabel: string;
  ariaLabel: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0);
  const slices = data.filter((d) => d.value > 0);

  const SIZE = 176;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const r1 = 52; // inner
  const r2 = 82; // outer

  const pt = (r: number, a: number) => `${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`;
  let angle = -Math.PI / 2;
  const arcs = slices.map((s) => {
    const sweep = Math.min((s.value / total) * Math.PI * 2, Math.PI * 2 - 0.0001);
    const a0 = angle;
    const a1 = angle + sweep;
    angle = a1;
    const large = sweep > Math.PI ? 1 : 0;
    const d = `M ${pt(r2, a0)} A ${r2} ${r2} 0 ${large} 1 ${pt(r2, a1)} L ${pt(r1, a1)} A ${r1} ${r1} 0 ${large} 0 ${pt(r1, a0)} Z`;
    return { ...s, d, mid: (a0 + a1) / 2 };
  });

  if (total === 0) {
    return <p className="py-12 text-center text-sm text-muted">No orders yet.</p>;
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <div className="relative">
        <svg width={SIZE} height={SIZE} role="img" aria-label={ariaLabel}>
          {arcs.map((a, i) => (
            <path
              key={a.label}
              d={a.d}
              fill={a.color}
              stroke="#FFFFFF"
              strokeWidth={2}
              opacity={hover === null || hover === i ? 1 : 0.35}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold">
            {hover !== null ? arcs[hover].value : total}
          </span>
          <span className="max-w-[90px] text-center text-[11px] leading-tight text-muted">
            {hover !== null ? arcs[hover].label : centerLabel}
          </span>
        </div>
      </div>

      {/* Legend - visible labels + counts (never color alone) */}
      <ul className="flex min-w-[150px] flex-col gap-2 text-sm">
        {data.map((s) => {
          const i = arcs.findIndex((a) => a.label === s.label);
          const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
          return (
            <li
              key={s.label}
              className={`flex items-center gap-2 rounded-lg px-2 py-1 transition-colors ${
                i !== -1 && hover === i ? "bg-secondary" : ""
              }`}
              onMouseEnter={() => i !== -1 && setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
              <span className="flex-1">{s.label}</span>
              <span className="font-medium tabular-nums">{s.value}</span>
              <span className="w-9 text-right text-xs text-muted tabular-nums">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* --------------------------- Horizontal bars ------------------------- */

export interface BarRow {
  label: string;
  value: number;
  /** Optional secondary figure shown muted after the value (e.g. revenue). */
  detail?: string;
}

export function HBarChart({
  data,
  format = (v: number) => String(v),
  color = SERIES,
}: {
  data: BarRow[];
  format?: (v: number) => string;
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 0);
  if (max === 0) {
    return <p className="py-10 text-center text-sm text-muted">Nothing to show yet.</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      {data.map((d) => (
        <div
          key={d.label}
          className="grid grid-cols-[130px_1fr_auto] items-center gap-3 text-sm"
        >
          <span className="truncate text-muted" title={d.label}>
            {d.label}
          </span>
          <div className="h-3.5">
            <div
              className="h-full min-w-[3px]"
              style={{
                width: `${(d.value / max) * 100}%`,
                background: color,
                // square at the baseline (left), 4px rounded data-end (right)
                borderRadius: "0 4px 4px 0",
              }}
            />
          </div>
          <span className="whitespace-nowrap text-right">
            <span className="font-medium tabular-nums">{format(d.value)}</span>
            {d.detail && <span className="ml-2 text-xs text-muted">{d.detail}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

