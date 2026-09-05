import { createEffect, createMemo, createSignal, onCleanup, type Accessor, type JSX } from "solid-js";

export { createContext, useContext, createSignal, createEffect, createMemo, onCleanup, For, Show } from "solid-js";
export type { Accessor, JSX };
export { s } from "./css";
export type { CSSProperties } from "./css";

export function useState<T>(init: T | (() => T)): [Accessor<T>, (v: T | ((p: T) => T)) => void] {
  const initial = typeof init === "function" ? (init as () => T)() : init;
  const [get, set] = createSignal(initial);
  const setState = (v: T | ((p: T) => T)) => {
    if (typeof v === "function") set((p) => (v as (p: T) => T)(p as T));
    else set(() => v);
  };
  return [get, setState];
}

export function useRef<T>(init: T): { current: T } {
  return { current: init };
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
