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

function applyStyle(el: HTMLElement, style: Record<string, unknown> | string | undefined) {
  if (!style || typeof style === "string") return;
  for (const [k, raw] of Object.entries(style)) {
    const v = isMV(raw) ? raw.get() : raw;
    if (v == null) continue;
    if (k === "x" || k === "y") {
      el.style.transform = `${el.style.transform} translate${k.toUpperCase()}(${typeof v === "number" ? `${v}px` : v})`.trim();
      continue;
    }
    const css = k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
    if (typeof v === "number" && k !== "opacity" && k !== "zIndex" && k !== "fontWeight") {
      el.style.setProperty(css, `${v}px`);
    } else {
      el.style.setProperty(css, String(v));
    }
  }
}

function MotionTag(tag: string) {
  return (raw: JSX.HTMLAttributes<HTMLElement> & Record<string, unknown>) => {
    const [stripped, rest] = splitProps(raw, [...STRIP]);
    void stripped;
    return (
      <Dynamic
        component={tag}
        {...rest}
        ref={(el: HTMLElement) => {
          const userRef = rest.ref;
          if (typeof userRef === "function") (userRef as (e: HTMLElement) => void)(el);
          else if (userRef && typeof userRef === "object") (userRef as { current: HTMLElement | null }).current = el;
          createEffect(() => {
            const style = rest.style as Record<string, unknown> | undefined;
            applyStyle(el, style);
            if (style) {
              for (const v of Object.values(style)) {
                if (isMV(v)) v.on("change", () => applyStyle(el, style));
              }
            }
          });
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
