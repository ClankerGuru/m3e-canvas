// @ts-nocheck
import { s } from "@/lib/css";
import type { JSX } from "solid-js";
import { useEffect, useRef, useState, type CSSProperties } from "@/lib/hooks";
import { COLOR_TOKENS, PLACES, R_INNER, clamp } from "@/lib/tokens";
import type { ColorToken, Palette, Place } from "@/lib/tokens";
import { AnimatePresence, motion } from "@/lib/motion";
import { t, useLang } from "@/lib/i18n";
import { Icon } from "./M3Node";

export function IconBtn(props: {
  icon: string;
  on?: boolean;
  onClick?: () => void;
  title?: string;
  size?: number;
  p: Palette;
  danger?: boolean;
  disabled?: boolean;
  fill?: boolean;
}) {
  const size = () => props.size ?? 36;
  return (
    <button
      onClick={props.onClick}
      title={props.title}
      aria-label={props.title}
      disabled={props.disabled}
      class="m3-press"
      style={s({
        width: size(),
        height: size(),
        borderRadius: size() / 2,
        border: "none",
        background: props.on ? (props.danger ? props.p.errorContainer : props.p.secondaryContainer) : "transparent",
        color: props.disabled
          ? props.p.outlineVariant
          : props.danger
            ? props.p.error
            : props.on
              ? props.p.onSecondaryContainer
              : props.p.onSurfaceVariant,
        cursor: props.disabled ? "default" : "pointer",
        display: "grid",
        placeItems: "center",
        flex: "0 0 auto",
      })}
    >
      <Icon name={props.icon} size={Math.round(size() * 0.58)} fill={props.fill ?? props.on} />
    </button>
  );
}

export type SegOption<K extends string> = { key: K; icon?: string; label?: string; title?: string; /** small marker: this option carries something */ dot?: boolean; /** this option alone takes the spare width */ grow?: boolean; /** an icon-only option that should not shrink to a square */ wide?: boolean };

/** Connected-button group with the same fused corners as the canvas. */
export function Segmented<K extends string>({
  options,
  value,
  onChange,
  p,
  height = 40,
  grow = true,
}: {
  options: SegOption<K>[];
  value: K;
  onChange: (k: K) => void;
  p: Palette;
  height?: number;
  grow?: boolean;
}) {
  return (
    <div style={s({ display: "flex", gap: 3 })}>
      {options.map((o, i) => {
        const on = o.key === value;
        const first = i === 0;
        const last = i === options.length - 1;
        const outer = height / 2;
        return (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            title={o.title ?? o.label}
            aria-label={o.title ?? o.label}
            class="m3-press"
            style={s({
              flex: (o.grow ?? grow) ? 1 : "0 0 auto",
              minWidth: o.wide ? height * 1.4 : height,
              height,
              padding: o.label ? "0 14px" : 0,
              border: "none",
              cursor: "pointer",
              borderTopLeftRadius: first ? outer : R_INNER,
              borderBottomLeftRadius: first ? outer : R_INNER,
              borderTopRightRadius: last ? outer : R_INNER,
              borderBottomRightRadius: last ? outer : R_INNER,
              background: on ? p.primary : p.surfaceContainerHigh,
              color: on ? p.onPrimary : p.onSurfaceVariant,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: on ? 600 : 500,
              transition: "background 120ms, color 120ms, border-radius 160ms",
              position: "relative",
            })}
          >
            {o.icon && <Icon name={o.icon} size={Math.round(height * 0.5)} fill={on} />}
            {o.label && <span>{o.label}</span>}
            {o.dot && (
              <span
                aria-hidden
                style={s({
                  position: "absolute",
                  top: 5,
                  right: 7,
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  background: on ? p.onPrimary : p.primary,
                })}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Field({
  value,
  onChange,
  placeholder,
  p,
  icon,
  multiline,
  rows = 3,
  height = 44,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  p: Palette;
  icon?: string;
  multiline?: boolean;
  rows?: number;
  height?: number;
}) {
  const lang = useLang();
  const filled = value.length > 0;
  const base: CSSProperties = {
    width: "100%",
    padding: multiline ? `12px ${filled ? 40 : 14}px 12px ${icon ? 42 : 14}px` : `0 ${filled ? 40 : 14}px 0 ${icon ? 42 : 14}px`,
    borderRadius: multiline ? 18 : height / 2,
    border: "none",
    background: p.surfaceContainerHigh,
    color: p.onSurface,
    fontSize: 14,
    lineHeight: multiline ? 1.55 : undefined,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    resize: "none",
  };
  return (
    <div style={s({ position: "relative", width: "100%" })}>
      {icon && (
        <span
          style={s({
            position: "absolute",
            left: 12,
            top: multiline ? 12 : (height - 20) / 2,
            color: p.onSurfaceVariant,
            pointerEvents: "none",
            lineHeight: 1,
          })}
        >
          <Icon name={icon} size={20} />
        </span>
      )}
      {multiline ? (
        <textarea
          value={value}
          rows={rows}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={base}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={s({ ...base, height })}
        />
      )}
      {filled && (
        <button
          onClick={() => onChange("")}
          title={t("clear", lang)}
          aria-label={t("clear", lang)}
          style={s({
            position: "absolute",
            right: 6,
            top: multiline ? 8 : (height - 30) / 2,
            width: 30,
            height: 30,
            borderRadius: 15,
            border: "none",
            background: "transparent",
            color: p.onSurfaceVariant,
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
          })}
        >
          <Icon name="close" size={16} />
        </button>
      )}
    </div>
  );
}

/** Slider with a typed-in number beside it. The slider moves in `step`s; the
 *  field accepts any whole number and is clamped to min..max when it commits. */
/** A rectangle whose top or bottom corners are rounded: the corner-radius slider icons. */
export function CornerIcon({ side, size = 20 }: { side: "top" | "bottom" | "left" | "right"; size?: number }) {
  const d =
    side === "top"
      ? "M4 17 V9 a5 5 0 0 1 5 -5 h6 a5 5 0 0 1 5 5 v8"
      : side === "bottom"
        ? "M4 3 v8 a5 5 0 0 0 5 5 h6 a5 5 0 0 0 5 -5 v-8"
        : side === "left"
          ? "M17 4 H9 a5 5 0 0 0 -5 5 v6 a5 5 0 0 0 5 5 h8"
          : "M7 4 h8 a5 5 0 0 1 5 5 v6 a5 5 0 0 1 -5 5 h-8";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

export function Slider({
  icon = "tune",
  iconNode,
  value,
  min,
  max,
  step,
  onChange,
  p,
  unit = "",
  title,
}: {
  icon?: string;
  /** custom glyph shown instead of the Material Symbol */
  iconNode?: JSX.Element;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  p: Palette;
  unit?: string;
  title?: string;
}) {
  const [text, setText] = useState(String(value));
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    if (!editing()) setText(String(value));
  }, [value, editing]);
  const commit = () => {
    const n = Math.round(Number(text));
    if (Number.isFinite(n) && text().trim() !== "") onChange(clamp(n, min, max));
    setEditing(false);
    setText(String(value));
  };
  return (
    <div style={s({ display: "flex", alignItems: "center", gap: 10 })}>
      <span title={title} style={s({ color: p.onSurfaceVariant, lineHeight: 1, flex: "0 0 auto", display: "inline-flex" })}>
        {iconNode ?? <Icon name={icon} size={20} />}
      </span>
      <input
        type="range"
        class="m3-range"
        aria-label={title}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={s({ "--track": p.secondaryContainer, "--thumb": p.primary })}
      />
      <span style={s({ position: "relative", flex: "0 0 auto", display: "inline-flex", alignItems: "center" })}>
        <input
          type="number"
          inputMode="numeric"
          aria-label={title}
          min={min}
          max={max}
          value={editing() ? text : String(value)}
          onFocus={(e) => {
            setEditing(true);
            setText(String(value));
            e.currentTarget.select();
          }}
          onChange={(e) => {
            setText(e.target.value);
            // apply as you type once the number is already in range, so the canvas follows
            const n = Math.round(Number(e.target.value));
            if (e.target.value.trim() !== "" && Number.isFinite(n) && n >= min && n <= max) onChange(n);
          }}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") {
              setText(String(value));
              e.currentTarget.blur();
            }
          }}
          class="m3-number"
          style={s({
            width: unit ? 56 : 52,
            height: 30,
            padding: unit ? "0 18px 0 6px" : "0 6px",
            borderRadius: 8,
            border: "none",
            background: p.surfaceContainerHigh,
            color: p.onSurface,
            fontSize: 12,
            fontWeight: 600,
            textAlign: "right",
            fontVariantNumeric: "tabular-nums",
            fontFamily: "inherit",
            outline: editing ? `2px solid ${p.primary}` : "none",
            outlineOffset: -1,
            boxSizing: "border-box",
          })}
        />
        {unit && (
          <span
            style={s({
              position: "absolute",
              right: 6,
              fontSize: 11,
              color: p.onSurfaceVariant,
              pointerEvents: "none",
            })}
          >
            {unit}
          </span>
        )}
      </span>
    </div>
  );
}

/** Quick picks for a size: the values the frame is built from (screen width,
 *  content width, half a row) or a component's standard sizes. */
export function SizePresets({
  values,
  value,
  min,
  max,
  onChange,
  p,
  labelOf,
}: {
  values: number[];
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  p: Palette;
  /** optional hover text for a value, e.g. "Screen width" for 412 */
  labelOf?: (v: number) => string | undefined;
}) {
  const shown = values.filter((v) => v >= min && v <= max);
  if (shown.length === 0) return null;
  return (
    <div style={s({ display: "flex", flexWrap: "wrap", gap: 6, paddingLeft: 30 })}>
      {shown.map((v) => {
        const on = v === value;
        const label = labelOf?.(v);
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            title={label}
            aria-label={label ? `${label}: ${v}` : String(v)}
            aria-pressed={on}
            class="m3-press"
            style={s({
              height: 28,
              padding: "0 10px",
              borderRadius: 14,
              border: on ? "1px solid transparent" : `1px solid ${p.outlineVariant}`,
              background: on ? p.secondaryContainer : "transparent",
              color: on ? p.onSecondaryContainer : p.onSurfaceVariant,
              fontSize: 12,
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            })}
          >
            {v}
          </button>
        );
      })}
    </div>
  );
}

export function Toggle({
  on,
  onChange,
  p,
  icon,
  label,
  grow,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  p: Palette;
  icon?: string;
  label?: string;
  /** fill the row and push the switch to the trailing edge */
  grow?: boolean;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      title={label}
      aria-label={label}
      aria-pressed={on}
      style={s({
        display: grow ? "flex" : "inline-flex",
        width: grow ? "100%" : undefined,
        alignItems: "center",
        gap: 10,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        padding: 0,
        color: p.onSurfaceVariant,
      })}
    >
      {icon && <Icon name={icon} size={20} />}
      {label && <span style={s({ fontSize: 13, color: p.onSurface, flex: grow ? 1 : undefined, textAlign: "left" })}>{label}</span>}
      <span
        style={s({
          position: "relative",
          width: 44,
          height: 26,
          borderRadius: 13,
          background: on ? p.primary : p.surfaceContainerHighest,
          border: on ? "2px solid transparent" : `2px solid ${p.outline}`,
          boxSizing: "border-box",
          transition: "background 160ms",
          flex: "0 0 auto",
        })}
      >
        <span
          style={s({
            position: "absolute",
            top: "50%",
            left: on ? 20 : 3,
            width: on ? 18 : 12,
            height: on ? 18 : 12,
            marginTop: on ? -9 : -6,
            borderRadius: 9,
            background: on ? p.onPrimary : p.outline,
            transition: "left 160ms, width 160ms, height 160ms, margin 160ms",
          })}
        />
      </span>
    </button>
  );
}

/** Collapsible section; collapsed state is remembered per key. */
export function Section({
  id,
  icon,
  title,
  p,
  children,
  right,
  defaultOpen = true,
}: {
  id: string;
  icon: string;
  title: string;
  p: Palette;
  children: JSX.Element;
  right?: JSX.Element;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  useEffect(() => {
    try {
      const v = localStorage.getItem(`m3e:sec:${id}`);
      if (v !== null) setOpen(v === "1");
    } catch {}
  }, [id]);
  const toggle = () => {
    setOpen((o) => {
      try {
        localStorage.setItem(`m3e:sec:${id}`, o ? "0" : "1");
      } catch {}
      return !o;
    });
  };
  return (
    <div style={s({ marginBottom: 10 })}>
      <div style={s({ display: "flex", alignItems: "center", gap: 6, height: 36 })}>
        <button
          onClick={toggle}
          aria-expanded={open()}
          style={s({
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 8,
            height: 36,
            padding: "0 6px",
            border: "none",
            background: "transparent",
            color: p.onSurfaceVariant,
            cursor: "pointer",
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.4,
            textAlign: "left",
          })}
        >
          <Icon name={icon} size={18} />
          <span style={s({ flex: 1 })}>{title}</span>
          <Icon name={open() ? "expand_less" : "expand_more"} size={18} />
        </button>
        {right}
      </div>
      {open() && <div style={s({ padding: "6px 4px 14px" })}>{children}</div>}
    </div>
  );
}

export function Tile({
  icon,
  label,
  p,
  onPointerDown,
  onClick,
  starred,
  onStar,
  active,
  compact,
}: {
  icon: string;
  label: string;
  p: Palette;
  onPointerDown?: (e: PointerEvent) => void;
  onClick?: () => void;
  starred?: boolean;
  onStar?: () => void;
  active?: boolean;
  compact?: boolean;
}) {
  const lang = useLang();
  return (
    <div
      class="m3-tile"
      onPointerDown={onPointerDown}
      onClick={onClick}
      title={label}
      style={s({
        position: "relative",
        display: "flex",
        flexDirection: compact ? "row" : "column",
        alignItems: "center",
        justifyContent: compact ? "flex-start" : "center",
        gap: compact ? 10 : 6,
        padding: compact ? "8px 12px" : "12px 6px 10px",
        borderRadius: 16,
        background: active ? p.secondaryContainer : p.surfaceContainerLow,
        color: active ? p.onSecondaryContainer : p.onSurface,
        cursor: onPointerDown ? "grab" : "pointer",
        userSelect: "none",
        touchAction: "none",
        minHeight: compact ? 40 : 72,
        boxSizing: "border-box",
      })}
    >
      <Icon name={icon} size={compact ? 20 : 26} color={active ? p.onSecondaryContainer : p.primary} />
      <span
        style={s({
          fontSize: 11,
          fontWeight: 500,
          lineHeight: 1.2,
          textAlign: "center",
          color: active ? p.onSecondaryContainer : p.onSurfaceVariant,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: "100%",
        })}
      >
        {label}
      </span>
      {onStar && (
        <button
          class="m3-star"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onStar();
          }}
          title={starred ? t("removeFavorite", lang) : t("addFavorite", lang)}
          aria-label={starred ? t("removeFavorite", lang) : t("addFavorite", lang)}
          style={s({
            position: "absolute",
            top: 4,
            right: 4,
            width: 24,
            height: 24,
            borderRadius: 12,
            border: "none",
            background: "transparent",
            color: starred ? p.primary : p.outline,
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
            opacity: starred ? 1 : undefined,
          })}
        >
          <Icon name="star" size={16} fill={starred} />
        </button>
      )}
    </div>
  );
}

/** palette-role swatches; the dot shows the real color of the current theme */
export function TokenChips({
  value,
  onChange,
  p,
  none,
  noneOn,
  onNone,
}: {
  value: ColorToken;
  onChange: (t: ColorToken) => void;
  p: Palette;
  /** offer a "no background" chip */
  none?: boolean;
  noneOn?: boolean;
  onNone?: () => void;
}) {
  const lang = useLang();
  return (
    <div style={s({ display: "flex", flexWrap: "wrap", gap: 8 })}>
      {none && (
        <button
          onClick={onNone}
          title={t("noBackground", lang)}
          aria-label={t("noBackground", lang)}
          aria-pressed={noneOn}
          class="m3-press"
          style={s({
            width: 30,
            height: 30,
            borderRadius: 15,
            border: `1px solid ${p.outlineVariant}`,
            padding: 0,
            cursor: "pointer",
            background: "transparent",
            color: p.onSurfaceVariant,
            display: "grid",
            placeItems: "center",
            outline: noneOn ? `2px solid ${p.primary}` : "2px solid transparent",
            outlineOffset: 2,
          })}
        >
          <Icon name="block" size={16} />
        </button>
      )}
      {COLOR_TOKENS.map((t) => {
        const on = !noneOn && t.key === value;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            title={t.label}
            aria-label={t.label}
            aria-pressed={on}
            class="m3-press"
            style={s({
              width: 30,
              height: 30,
              borderRadius: 15,
              border: `1px solid ${p.outlineVariant}`,
              padding: 0,
              cursor: "pointer",
              background: p[t.key],
              outline: on ? `2px solid ${p.primary}` : "2px solid transparent",
              outlineOffset: 2,
            })}
          />
        );
      })}
    </div>
  );
}

/** M3 basic dialog for a destructive confirmation. */
/** A run of buttons fused like the canvas's connected buttons: round outside, small corners where they meet. */
export function ButtonRun({ children }: { children: JSX.Element }) {
  return <div class="m3-run" style={s({ display: "flex", gap: 3 })}>{children}</div>;
}

export type TidyState = "tidy" | "undo" | "done";

/** One button that reads as "Tidy", turns into "Undo tidy" right after, and is
 *  disabled while the screen is already tidy. */
export function TidyButton({
  state,
  onClick,
  p,
  pill,
  place,
  onPlace,
}: {
  state: TidyState;
  onClick: () => void;
  p: Palette;
  /** the toolbar version next to the zoom pill */
  pill?: boolean;
  /** where the screen's body goes; with `onPlace` the button gains a trailing menu to change it */
  place?: Place;
  onPlace?: (place: Place) => void;
}) {
  const lang = useLang();
  const done = state === "done";
  const label = state === "undo" ? t("tidyUndo", lang) : state === "done" ? t("tidyDone", lang) : t("tidy", lang);
  const [menu, setMenu] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  /* the menu closes on a tap anywhere else or on Escape */
  useEffect(() => {
    if (!menu()) return;
    const away = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setMenu(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setMenu(false);
    };
    document.addEventListener("pointerdown", away, true);
    document.addEventListener("keydown", key, true);
    return () => {
      document.removeEventListener("pointerdown", away, true);
      document.removeEventListener("keydown", key, true);
    };
  }, [menu]);
  const split = !!onPlace;
  const current = place ?? "top";
  const placeLabel = (k: Place) => t(k === "top" ? "placeTop" : k === "center" ? "placeCenter" : k === "bottom" ? "placeBottom" : "placeSpread", lang);
  const h = pill ? 40 : 44;
  const bg = done ? "transparent" : state === "undo" ? p.tertiaryContainer : p.secondaryContainer;
  const fg = done ? p.onSurfaceVariant : state === "undo" ? p.onTertiaryContainer : p.onSecondaryContainer;
  const main = (
    <button
      onClick={onClick}
      disabled={done}
      title={label}
      aria-label={label}
      class="m3-press"
      style={s({
        width: pill ? (done ? 40 : undefined) : split ? undefined : "100%",
        flex: split && !pill ? 1 : undefined,
        height: h,
        padding: done ? 0 : pill ? "0 16px 0 12px" : "0 16px",
        borderRadius: split && !done ? `${h / 2}px ${R_INNER}px ${R_INNER}px ${h / 2}px` : h / 2,
        border: "none",
        background: bg,
        color: fg,
        fontSize: 13,
        fontWeight: 600,
        cursor: done ? "default" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        opacity: done ? 0.7 : 1,
        whiteSpace: "nowrap",
      })}
    >
      <Icon name={state === "undo" ? "undo" : state === "done" ? "check" : "align_space_even"} size={done ? 22 : 20} />
      {!done && label}
    </button>
  );
  if (!split) return main;
  /* a split button: tidy on the left, the placement menu behind the chevron, 3dp apart like a connected pair */
  return (
    <div ref={ref} style={s({ position: "relative", display: "flex", gap: 3, alignItems: "center", width: pill ? undefined : "100%" })}>
      {main}
      <button
        onClick={() => setMenu((m) => !m)}
        title={t("placement", lang)}
        aria-label={t("placement", lang)}
        aria-expanded={menu()}
        aria-haspopup="true"
        class="m3-press"
        style={s({
          height: h,
          width: h,
          borderRadius: done ? h / 2 : `${R_INNER}px ${h / 2}px ${h / 2}px ${R_INNER}px`,
          border: "none",
          background: done ? "transparent" : bg,
          color: done ? p.onSurfaceVariant : fg,
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
          flex: "0 0 auto",
        })}
      >
        <Icon name={PLACES.find((o) => o.key === current)?.icon ?? "vertical_align_top"} size={20} />
      </button>
      {menu() && (
        <div
          role="group"
          aria-label={t("placement", lang)}
          style={s({
            position: "absolute",
            ...(pill ? { bottom: "100%", marginBottom: 8 } : { top: "100%", marginTop: 8 }),
            right: 0,
            display: "flex",
            gap: 3,
            padding: 4,
            borderRadius: 24,
            background: p.surfaceContainer,
            boxShadow: "0 2px 6px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.12)",
            zIndex: 30,
          })}
        >
          {PLACES.map((o) => {
            const on = current === o.key;
            return (
              <button
                key={o.key}
                aria-pressed={on}
                title={placeLabel(o.key)}
                aria-label={placeLabel(o.key)}
                onClick={() => {
                  setMenu(false);
                  onPlace(o.key);
                }}
                class="m3-press"
                style={s({
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  border: "none",
                  background: on ? p.secondaryContainer : "transparent",
                  color: on ? p.onSecondaryContainer : p.onSurfaceVariant,
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                })}
              >
                <Icon name={o.icon} size={22} fill={on} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  body,
  icon = "delete_sweep",
  p,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  body: string;
  icon?: string;
  p: Palette;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const lang = useLang();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCancel();
      }
      if (e.key === "Enter") {
        e.stopPropagation();
        onConfirm();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, onCancel, onConfirm]);
  const btn = (label: string, primary: boolean, onClick: () => void) => (
    <button
      onClick={onClick}
      class="m3-press"
      style={s({
        height: 40,
        padding: "0 16px",
        borderRadius: 20,
        border: "none",
        background: primary ? p.primary : "transparent",
        color: primary ? p.onPrimary : p.primary,
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
      })}
    >
      {label}
    </button>
  );
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="scrim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={onCancel}
          style={s({
            position: "fixed",
            inset: 0,
            zIndex: 600,
            background: "rgba(0,0,0,0.32)",
            display: "grid",
            placeItems: "center",
            padding: 24,
          })}
        >
          <motion.div
            role="alertdialog"
            aria-modal
            aria-label={title}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 520, damping: 34, mass: 0.7 }}
            onClick={(e) => e.stopPropagation()}
            style={s({
              width: "min(100%, 340px)",
              padding: 24,
              borderRadius: 28,
              background: p.surfaceContainerHigh,
              color: p.onSurface,
              boxShadow: "0 8px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.10)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            })}
          >
            <div style={s({ textAlign: "center", color: p.error })}>
              <Icon name={icon} size={28} />
            </div>
            <div style={s({ fontSize: 22, textAlign: "center" })}>{title}</div>
            <div style={s({ fontSize: 14, lineHeight: 1.5, color: p.onSurfaceVariant })}>{body}</div>
            <div style={s({ display: "flex", justifyContent: "flex-end", gap: 8 })}>
              {btn(t("cancel", lang), false, onCancel)}
              {btn(t("ok", lang), true, onConfirm)}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
