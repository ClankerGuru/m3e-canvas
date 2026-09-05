/** localStorage for the board and a few editor prefs. Not the JSON download
 *  (that's lib/project.ts). */
import type { Doc, Kind } from "./tokens";

export const DOC_KEY = "m3e:doc";
export const UI_KEY = "m3e:ui";
/** the design a draft or a link replaced, until the author keeps or undoes it */
export const BEFORE_KEY = "m3e:doc:before";
/** Web Lock so two tabs do not overwrite each other */
export const DOC_LOCK = "m3e:doc:editor";

export type StoredUi = {
  view?: { x: number; y: number; z: number };
  leftOpen?: boolean;
  rightOpen?: boolean;
  leftW?: number;
  rightW?: number;
  favorites?: Kind[];
  mode?: string;
  lang?: string;
};

export function readStoredDoc(): Partial<Doc> | null {
  try {
    const raw = localStorage.getItem(DOC_KEY);
    return raw ? (JSON.parse(raw) as Partial<Doc>) : null;
  } catch {
    return null;
  }
}

export function writeStoredDoc(doc: unknown) {
  try {
    localStorage.setItem(DOC_KEY, JSON.stringify(doc));
  } catch {}
}

export function readStoredUi(): StoredUi | null {
  try {
    const raw = localStorage.getItem(UI_KEY);
    return raw ? (JSON.parse(raw) as StoredUi) : null;
  } catch {
    return null;
  }
}

export function writeStoredUi(ui: StoredUi) {
  try {
    localStorage.setItem(UI_KEY, JSON.stringify(ui));
  } catch {}
}
