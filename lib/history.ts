/** Undo / redo for the board. No UI. */
import type { Frame, Group } from "./tokens";

export type Snapshot = { groups: Group[]; frames: Frame[] };

export const HISTORY_MAX = 100;

export function createHistory(max = HISTORY_MAX) {
  const past: Snapshot[] = [];
  const future: Snapshot[] = [];
  let lastKey = "";
  let lastAt = 0;

  const push = (current: Snapshot) => {
    past.push(current);
    if (past.length > max) past.shift();
    future.length = 0;
  };

  /** consecutive edits of the same field collapse into one undo step */
  const pushFor = (key: string, current: Snapshot) => {
    const now = Date.now();
    if (lastKey !== key || now - lastAt > 800) push(current);
    lastKey = key;
    lastAt = now;
  };

  const undo = (current: Snapshot): Snapshot | null => {
    const prev = past.pop();
    if (!prev) return null;
    future.push(current);
    return prev;
  };

  const redo = (current: Snapshot): Snapshot | null => {
    const next = future.pop();
    if (!next) return null;
    past.push(current);
    return next;
  };

  const clear = () => {
    past.length = 0;
    future.length = 0;
    lastKey = "";
    lastAt = 0;
  };

  return {
    push,
    pushFor,
    undo,
    redo,
    clear,
    get canUndo() {
      return past.length > 0;
    },
    get canRedo() {
      return future.length > 0;
    },
  };
}
