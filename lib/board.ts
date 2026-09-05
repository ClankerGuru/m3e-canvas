/** The board: screens, parts, and how a saved file becomes one.
 *  No buttons. No Solid. Page.tsx still draws it. */
import { KIND_SPEC, NAV_BAR_H, PHONE_H, PHONE_MARGIN, PHONE_W, frameRect, makeItem, normalizeTheme, uid } from "./tokens";
import type { Doc, Frame, Group, Kind, Palette, Platform, Theme } from "./tokens";
import { isPlatform } from "./tokens";
import { t } from "./i18n";

export const SEED_FRAMES: Frame[] = [{ id: "seedF1", name: "Home", x: 0, y: 0 }];

/** Documents saved before the bars grew their system insets have the navigation
 *  bar flush with the old 80dp bottom; keep it on the bottom edge. */
export function migrateGroups(groups: Group[], frames: Frame[]): Group[] {
  const oldNavH = KIND_SPEC.bottomNav.h - NAV_BAR_H;
  return groups.map((g) => {
    if (g.items.length !== 1 || g.items[0].kind !== "bottomNav") return g;
    const f = frames.find((fr) => {
      const r = frameRect(fr);
      return g.x >= r.l - 1 && g.x <= r.r && g.y === r.b - oldNavH;
    });
    return f ? { ...g, y: frameRect(f).b - KIND_SPEC.bottomNav.h } : g;
  });
}

/** Seed ids are deterministic so server and client render the same markup. */
export const seed = (): Group[] => {
  let n = 0;
  const sid = () => `seed${++n}`;
  const mk = (k: Kind) => ({ ...makeItem(k), id: sid() });
  const bar = mk("topAppBar");
  const a = mk("button");
  const b = mk("button");
  a.label = "お気に入り";
  a.icon = "star";
  b.label = "共有";
  b.icon = "share";
  b.variant = "tonal";
  const rows = ["受信トレイ", "スター付き", "アーカイブ"].map((label, i) => {
    const it = mk("listItem");
    it.label = label;
    it.icon = ["inbox", "star", "archive"][i];
    it.supporting = "サブテキスト";
    return it;
  });
  const nav = mk("bottomNav");
  const fab = mk("fab");
  return [
    { id: sid(), x: 0, y: 0, axis: "x", items: [bar] },
    { id: sid(), x: PHONE_MARGIN, y: 96, axis: "x", items: [a, b] },
    { id: sid(), x: PHONE_MARGIN, y: 184, axis: "y", items: rows },
    {
      id: sid(),
      x: PHONE_W - 56 - PHONE_MARGIN,
      y: PHONE_H - KIND_SPEC.bottomNav.h - 56 - PHONE_MARGIN,
      axis: "x",
      items: [fab],
    },
    { id: sid(), x: 0, y: PHONE_H - KIND_SPEC.bottomNav.h, axis: "x", items: [nav] },
  ];
};

/** The phone version starts with buttons only: that is all it edits. */
export const mobileSeed = (): Group[] => {
  const mk = (k: Kind) => makeItem(k);
  const a = mk("button");
  const b = mk("button");
  const c = mk("button");
  a.label = "お気に入り";
  a.icon = "star";
  b.label = "共有";
  b.icon = "share";
  b.variant = "tonal";
  c.label = "はじめる";
  c.icon = "arrow_forward";
  return [
    { id: uid(), x: PHONE_MARGIN, y: 120, axis: "x", items: [a, b] },
    { id: uid(), x: PHONE_MARGIN, y: 200, axis: "x", items: [c] },
  ];
};

export const mobileHomeFrame = (): Frame => ({ id: uid(), name: t("home"), x: 0, y: 0 });

export type Board = {
  groups: Group[];
  frames: Frame[];
  paletteKey: string;
  customPalette: Palette | null;
  dynamicColor: boolean;
  theme: Theme;
  title: string;
  brief: string;
  promptEdit: string | undefined;
  platform: Platform | null;
};

export function emptyBoard(): Board {
  return {
    groups: seed(),
    frames: SEED_FRAMES,
    paletteKey: "purple",
    customPalette: null,
    dynamicColor: false,
    theme: normalizeTheme(undefined),
    title: "",
    brief: "",
    promptEdit: undefined,
    platform: null,
  };
}

/** Merge a stored or opened document into the current board.
 *  Fields a partial document leaves out keep their current value, or go back
 *  to the default when `reset`. */
export function hydrateDoc(incoming: Partial<Doc>, current: Board, reset: boolean): Board {
  const frames = Array.isArray(incoming.frames) ? incoming.frames : current.frames;
  const groups = Array.isArray(incoming.groups) ? migrateGroups(incoming.groups, frames) : current.groups;
  return {
    groups,
    frames,
    paletteKey: typeof incoming.paletteKey === "string" && incoming.paletteKey ? incoming.paletteKey : reset ? "purple" : current.paletteKey,
    customPalette:
      incoming.customPalette && typeof incoming.customPalette.primary === "string"
        ? incoming.customPalette
        : reset
          ? null
          : current.customPalette,
    dynamicColor: typeof incoming.dynamicColor === "boolean" ? incoming.dynamicColor : reset ? false : current.dynamicColor,
    theme: incoming.theme && typeof incoming.theme === "object" ? normalizeTheme(incoming.theme) : reset ? normalizeTheme(undefined) : current.theme,
    title: typeof incoming.title === "string" ? incoming.title : reset ? "" : current.title,
    brief: typeof incoming.brief === "string" ? incoming.brief : reset ? "" : current.brief,
    promptEdit: typeof incoming.promptEdit === "string" ? incoming.promptEdit : reset ? undefined : current.promptEdit,
    platform: isPlatform(incoming.platform) ? incoming.platform : reset ? null : current.platform,
  };
}
