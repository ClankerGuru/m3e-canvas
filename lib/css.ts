/** React-style objects → a CSS string Solid will accept (camelCase + unitless numbers). */
const UNITLESS = new Set([
  "animationIterationCount",
  "columnCount",
  "flex",
  "flexGrow",
  "flexShrink",
  "fontWeight",
  "gridArea",
  "gridColumn",
  "gridColumnEnd",
  "gridColumnStart",
  "gridRow",
  "gridRowEnd",
  "gridRowStart",
  "lineHeight",
  "opacity",
  "order",
  "orphans",
  "tabSize",
  "widows",
  "zIndex",
  "zoom",
  "fillOpacity",
  "floodOpacity",
  "stopOpacity",
  "strokeDasharray",
  "strokeDashoffset",
  "strokeMiterlimit",
  "strokeOpacity",
  "strokeWidth",
]);

function key(k: string) {
  return k.startsWith("--") ? k : k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

export function s(style: Record<string, unknown> | undefined | null): string {
  if (!style) return "";
  const out: string[] = [];
  for (const [k, v] of Object.entries(style)) {
    if (v == null || v === false) continue;
    const val = typeof v === "number" && v !== 0 && !UNITLESS.has(k) ? `${v}px` : String(v);
    out.push(`${key(k)}:${val}`);
  }
  return out.join(";");
}

export type CSSProperties = Record<string, string | number | undefined | null>;
