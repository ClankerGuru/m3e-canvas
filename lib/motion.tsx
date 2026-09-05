// @ts-nocheck
/** Drop-in stand-in for `motion/react`. Animations snap; the editor still works. */
import { createEffect, onCleanup, splitProps, type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";

export type TargetAndTransition = Record<string, unknown>;
export type Variants = Record<string, TargetAndTransition>;

type MV<T = number> = {
  get: () => T;
  set: (v: T) => void;
  jump: (v: T) => void;
  on: (ev: string, fn: (v: T) => void) => () => void;
};

function isMV(v: unknown): v is MV<unknown> {
  return !!v && typeof v === "object" && typeof (v as MV).get === "function" && typeof (v as MV).set === "function";
}

export function useMotionValue<T>(init: T): MV<T> {
  let v = init;
  const ls = new Set<(n: T) => void>();
  const set = (n: T) => {
    v = n;
    ls.forEach((fn) => fn(n));
  };
  return {
    get: () => v,
    set,
    jump: set,
    on: (_ev, fn) => {
      ls.add(fn);
      return () => ls.delete(fn);
    },
  };
}

export function useSpring(init: number, _opts?: unknown): MV<number> {
  return useMotionValue(init);
}

export function useReducedMotion(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export function useTransform(input: MV | MV[], fn: (...args: never[]) => unknown): MV<unknown> {
  const out = useMotionValue<unknown>(undefined);
  const read = () => (Array.isArray(input) ? fn(...(input.map((m) => m.get()) as never[])) : fn(input.get() as never));
  out.set(read());
  const unsubs = (Array.isArray(input) ? input : [input]).map((m) => m.on("change", () => out.set(read())));
  onCleanup(() => unsubs.forEach((u) => u()));
  return out;
}

export function animate(mv: MV<number>, to: number, _opts?: unknown): { stop: () => void } {
  mv.set(to);
  return { stop() {} };
}

export function useDragControls(): { start: (e?: unknown) => void } {
  return { start() {} };
}

const STRIP = [
  "initial",
  "animate",
  "exit",
  "transition",
  "layout",
  "drag",
  "dragListener",
  "dragControls",
  "variants",
  "custom",
  "whileHover",
  "whileTap",
] as const;

const UNITLESS = new Set(["opacity", "zIndex", "fontWeight", "scale", "flex", "flexGrow", "flexShrink"]);

function applyStyle(el: HTMLElement, style: Record<string, unknown> | string | undefined) {
  if (!style || typeof style === "string") return;
  let x: unknown;
  let y: unknown;
  let scale: unknown;
  for (const [k, raw] of Object.entries(style)) {
    const v = isMV(raw) ? raw.get() : raw;
    if (v == null) continue;
    if (k === "x") {
      x = v;
      continue;
    }
    if (k === "y") {
      y = v;
      continue;
    }
    if (k === "scale") {
      scale = v;
      continue;
    }
    const css = k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
    if (typeof v === "number" && v !== 0 && !UNITLESS.has(k)) {
      el.style.setProperty(css, `${v}px`);
    } else {
      el.style.setProperty(css, String(v));
    }
  }
  const parts: string[] = [];
  if (x != null || y != null) {
    const tx = typeof x === "number" ? `${x}px` : (x ?? 0);
    const ty = typeof y === "number" ? `${y}px` : (y ?? 0);
    parts.push(`translate(${tx}, ${ty})`);
  }
  if (scale != null) parts.push(`scale(${scale})`);
  if (parts.length) el.style.transform = parts.join(" ");
}

function MotionTag(tag: string) {
  return (raw: JSX.HTMLAttributes<HTMLElement> & Record<string, unknown>) => {
    const [stripped, rest] = splitProps(raw, [...STRIP]);
    let node: HTMLElement | undefined;
    const paint = () => {
      if (!node) return;
      const style = rest.style;
      if (style && typeof style === "object") applyStyle(node, style as Record<string, unknown>);
      const anim = stripped.animate as Record<string, unknown> | undefined;
      if (anim) applyStyle(node, anim);
    };
    createEffect(paint);
    return (
      <Dynamic
        component={tag}
        {...rest}
        ref={(el: HTMLElement) => {
          node = el;
          paint();
          const userRef = rest.ref;
          if (typeof userRef === "function") (userRef as (e: HTMLElement) => void)(el);
          else if (userRef && typeof userRef === "object") (userRef as { current: HTMLElement | null }).current = el;
          const style = rest.style as Record<string, unknown> | undefined;
          if (style && typeof style === "object") {
            for (const v of Object.values(style)) {
              if (isMV(v)) v.on("change", paint);
            }
          }
        }}
      />
    );
  };
}

export const motion: Record<string, ReturnType<typeof MotionTag>> = new Proxy(
  {},
  { get: (_, tag: string) => MotionTag(tag) },
);

export function AnimatePresence(props: { children?: JSX.Element; initial?: boolean; mode?: string; custom?: unknown }) {
  return <>{props.children}</>;
}

export const Reorder = {
  Group: (props: JSX.HTMLAttributes<HTMLUListElement> & { axis?: string; values?: unknown; onReorder?: (v: unknown) => void }) => {
    const [, rest] = splitProps(props, ["axis", "values", "onReorder"]);
    return <ul {...rest} />;
  },
  Item: (props: JSX.HTMLAttributes<HTMLLIElement> & { value?: unknown; dragListener?: boolean; dragControls?: unknown }) => {
    const [, rest] = splitProps(props, ["value", "dragListener", "dragControls"]);
    return <li {...rest} />;
  },
};
