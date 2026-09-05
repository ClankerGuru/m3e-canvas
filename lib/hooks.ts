import { createEffect, createMemo, createSignal, onCleanup, type Accessor, type JSX } from "solid-js";

export { createContext, useContext, createSignal, createEffect, createMemo, onCleanup, onMount, For, Show } from "solid-js";
export type { Accessor, JSX };
export { s } from "./css";
export type { CSSProperties } from "./css";

/** Solid accessor that also forwards array/object reads, so leftover React
 *  `groups.map` / `for (const g of groups)` / `drag?.item` keep working. */
function wrap<T>(get: Accessor<T>): Accessor<T> {
  const fn = ((..._args: unknown[]) => get()) as Accessor<T>;
  return new Proxy(fn, {
    apply() {
      return get();
    },
    get(target, prop, receiver) {
      const v = get();
      if (v != null && (typeof v === "object" || typeof v === "function")) {
        if (prop === Symbol.iterator || prop in (v as object)) {
          const val = (v as Record<PropertyKey, unknown>)[prop as PropertyKey];
          return typeof val === "function" ? (val as (...a: unknown[]) => unknown).bind(v) : val;
        }
      }
      return Reflect.get(target, prop, receiver);
    },
    has(_target, prop) {
      const v = get();
      if (v != null && (typeof v === "object" || typeof v === "function") && prop in (v as object)) return true;
      return prop in fn;
    },
  });
}

export function useState<T>(init: T | (() => T)): [Accessor<T>, (v: T | ((p: T) => T)) => void] {
  const initial = typeof init === "function" ? (init as () => T)() : init;
  const [get, set] = createSignal(initial);
  const setState = (v: T | ((p: T) => T)) => {
    if (typeof v === "function") set((p) => (v as (p: T) => T)(p as T));
    else set(() => v);
  };
  return [wrap(get), setState];
}

export function useRef<T>(init: T): { current: T } {
  const r = ((el?: T | null) => {
    if (el !== undefined) (r as { current: T }).current = el as T;
  }) as { current: T } & ((el?: T | null) => void);
  r.current = init;
  return r;
}

export function useMemo<T>(fn: () => T, _deps?: unknown[]): Accessor<T> {
  return createMemo(fn);
}

export function useCallback<T extends (...args: never[]) => unknown>(fn: T, _deps?: unknown[]): T {
  return fn;
}

export function useEffect(fn: () => void | (() => void), _deps?: unknown[]) {
  createEffect(() => {
    const clean = fn();
    if (typeof clean === "function") onCleanup(clean);
  });
}

export function useLayoutEffect(fn: () => void | (() => void), _deps?: unknown[]) {
  useEffect(fn, _deps);
}

export type ReactNode = JSX.Element;
export type PointerEvent<T = Element> = globalThis.PointerEvent;
export type ChangeEvent<T = Element> = Event;
export type KeyboardEvent<T = Element> = globalThis.KeyboardEvent;
export type MouseEvent<T = Element> = globalThis.MouseEvent;
