// @ts-nocheck
import { s } from "@/lib/css";
import type { JSX } from "solid-js";
import { useMemo, useState } from "@/lib/hooks";
import { Reorder, useDragControls } from "@/lib/motion";
import { KIND_SPEC, explodeGroup, isPhoneFrame } from "@/lib/tokens";
import type { Frame, Group, Item, Palette } from "@/lib/tokens";
import { Icon } from "./M3Node";
import { IconBtn } from "./ui";
import { KIND_TEXT, t, useLang } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

function nameOf(it: Item, lang: Lang) {
  const spec = KIND_SPEC[it.kind];
  const noun = KIND_TEXT[lang][it.kind]?.noun ?? spec.label;
  return it.label.trim() || (it.kind === "iconButton" || it.kind === "fab" ? (it.icon ?? noun) : noun);
}

function runLabel(g: Group, lang: Lang) {
  const first = g.items[0];
  const noun = KIND_TEXT[lang][first.kind]?.noun ?? KIND_SPEC[first.kind].label;
  return g.free ? `${t("group", lang)} × ${g.items.length}` : g.items.length > 1 ? `${noun} × ${g.items.length}` : nameOf(first, lang);
}

function Row({
  id,
  p,
  depth,
  icon,
  label,
  on,
  onSelect,
  open,
  onToggle,
  onDragging,
  onUp,
  onDown,
  canUp,
  canDown,
  children,
}: {
  id: string;
  p: Palette;
  depth: number;
  icon: JSX.Element;
  label: string;
  on: boolean;
  onSelect: (add: boolean) => void;
  open?: boolean;
  onToggle?: () => void;
  onDragging: (dragging: boolean) => void;
  onUp?: () => void;
  onDown?: () => void;
  canUp?: boolean;
  canDown?: boolean;
  children?: JSX.Element;
}) {
  const lang = useLang();
  const controls = useDragControls();
  const h = depth === 0 ? 40 : 36;
  return (
    <Reorder.Item value={id} style={s({ listStyle: "none", display: "flex", flexDirection: "column", gap: 4, position: "relative" })}>
      <div
        style={s({
          display: "flex",
          alignItems: "center",
          gap: 6,
          height: h,
          padding: "0 6px 0 2px",
          marginLeft: depth * 14,
          borderRadius: depth === 0 ? 14 : 12,
          background: on ? p.secondaryContainer : depth === 0 ? p.surfaceContainerLow : p.surface,
          color: on ? p.onSecondaryContainer : p.onSurface,
          userSelect: "none",
        })}
      >
        <span
          onPointerDown={(e) => {
            e.preventDefault();
            controls.start(e);
            onDragging(true);
          }}
          onPointerUp={() => onDragging(false)}
          style={s({ cursor: "grab", color: p.outline, display: "grid", placeItems: "center", width: depth === 0 ? 24 : 20, height: h, touchAction: "none" })}
        >
          <Icon name="drag_indicator" size={18} />
        </span>
        <button
          onClick={(e) => onSelect(e.shiftKey)}
          style={s({
            flex: 1,
            minWidth: 0,
            height: h,
            display: "flex",
            alignItems: "center",
            gap: 8,
            border: "none",
            background: "transparent",
            color: "inherit",
            cursor: "pointer",
            padding: 0,
            textAlign: "left",
          })}
        >
          <span style={s({ display: "inline-flex", gap: 2, color: on ? p.onSecondaryContainer : p.primary })}>{icon}</span>
          <span style={s({ fontSize: 12, fontWeight: depth === 0 ? 600 : 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" })}>{label}</span>
        </button>
        {onToggle && (
          <button
            onClick={onToggle}
            title={t(open ? "hideParts" : "showParts", lang)}
            aria-expanded={open}
            class="m3-press"
            style={s({ width: 28, height: 28, borderRadius: 14, border: "none", background: "transparent", color: on ? p.onSecondaryContainer : p.onSurfaceVariant, cursor: "pointer", padding: 0, display: "grid", placeItems: "center", flex: "0 0 auto" })}
          >
            <span style={s({ display: "inline-flex", transform: open ? "rotate(90deg)" : "none", transition: "transform 160ms" })}>
              <Icon name="chevron_right" size={20} />
            </span>
          </button>
        )}
        {onUp && onDown && (
          <>
            <IconBtn icon="keyboard_arrow_up" p={p} size={28} onClick={onUp} disabled={!canUp} title="↑" />
            <IconBtn icon="keyboard_arrow_down" p={p} size={28} onClick={onDown} disabled={!canDown} title="↓" />
          </>
        )}
      </div>
      {open && children}
    </Reorder.Item>
  );
}

function Level({ values, onReorder, children }: { values: string[]; onReorder: (next: string[]) => void; children: JSX.Element }) {
  return (
    <Reorder.Group axis="y" values={values} onReorder={onReorder} style={s({ display: "flex", flexDirection: "column", gap: 4, padding: 0, margin: 0 })}>
      {children}
    </Reorder.Group>
  );
}

function RunParts({
  run,
  p,
  depth,
  sel,
  onSelect,
  onReorder,
  onDragging,
}: {
  run: Group;
  p: Palette;
  depth: number;
  sel: Set<string>;
  onSelect: (itemIds: string[], add: boolean) => void;
  onReorder: (ids: string[]) => void;
  onDragging: (dragging: boolean) => void;
}) {
  const lang = useLang();
  const ids = run.items.map((it) => it.id);
  return (
    <Level values={ids} onReorder={onReorder}>
      {run.items.map((it) => (
        <Row
          id={it.id}
          p={p}
          depth={depth}
          icon={<Icon name={KIND_SPEC[it.kind].paletteIcon} size={16} />}
          label={nameOf(it, lang)}
          on={sel.has(it.id)}
          onSelect={(add) => onSelect([it.id], add)}
          onDragging={onDragging}
        />
      ))}
    </Level>
  );
}

/** The z-order of one screen, top layer first. A connected run opens to its parts;
 *  a free group opens to the runs it holds. Arrows reorder the top level (the
 *  motion stub does not drag). */
export function LayersPanel({
  p,
  frames,
  frameId,
  onFrame,
  groups,
  widths,
  selectedIds,
  onSelect,
  onReorder,
  onReorderItems,
  onDragging,
}: {
  p: Palette;
  frames: Frame[];
  frameId: string | null;
  onFrame: (id: string) => void;
  groups: Group[];
  widths: Record<string, number>;
  selectedIds: string[];
  onSelect: (itemIds: string[], add: boolean) => void;
  onReorder: (topFirst: string[]) => void;
  onReorderItems: (groupId: string, ids: string[]) => void;
  onDragging: (dragging: boolean) => void;
}) {
  const lang = useLang();
  const topFirst = useMemo(() => [...groups].reverse(), [groups]);
  const ids = topFirst().map((g) => g.id);
  const sel = new Set(selectedIds);
  const [openIds, setOpenIds] = useState<string[]>([]);
  const isOpen = (id: string) => openIds().includes(id);
  const toggle = (id: string) =>
    setOpenIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  const freeRuns = (g: Group) => [...explodeGroup(g, widths)].reverse();
  const flatten = (runsTopFirst: Group[]) => [...runsTopFirst].reverse().flatMap((r) => r.items.map((it) => it.id));
  const move = (i: number, d: number) => {
    const next = [...ids];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onReorder(next);
  };

  const groupBody = (g: Group, depth: number) => {
    if (!g.free) {
      return <RunParts run={g} p={p} depth={depth} sel={sel} onSelect={onSelect} onReorder={(order) => onReorderItems(g.id, order)} onDragging={onDragging} />;
    }
    const runs = freeRuns(g);
    const runIds = runs.map((r) => r.id);
    const byId = new Map(runs.map((r) => [r.id, r]));
    const reorderRuns = (next: string[]) => onReorderItems(g.id, flatten(next.map((id) => byId.get(id)).filter((r): r is Group => !!r)));
    return (
      <Level values={runIds} onReorder={reorderRuns}>
        {runs.map((r) => {
          const many = r.items.length > 1;
          const open = many && isOpen(r.id);
          return (
            <Row
              id={r.id}
              p={p}
              depth={depth}
              icon={r.items.slice(0, 3).map((it, k) => <Icon name={KIND_SPEC[it.kind].paletteIcon} size={16} />)}
              label={runLabel(r, lang)}
              on={r.items.some((it) => sel.has(it.id))}
              onSelect={(add) => onSelect(r.items.map((it) => it.id), add)}
              open={many ? open : undefined}
              onToggle={many ? () => toggle(r.id) : undefined}
              onDragging={onDragging}
            >
              <RunParts
                run={r}
                p={p}
                depth={depth + 1}
                sel={sel}
                onSelect={onSelect}
                onDragging={onDragging}
                onReorder={(order) => {
                  const members = new Set(r.items.map((it) => it.id));
                  let k = 0;
                  onReorderItems(
                    g.id,
                    g.items.map((it) => (members.has(it.id) ? order[k++] : it.id)),
                  );
                }}
              />
            </Row>
          );
        })}
      </Level>
    );
  };

  return (
    <div style={s({ display: "flex", flexDirection: "column", height: "100%" })}>
      {frames.length > 1 && (
        <div class="no-scrollbar" style={s({ display: "flex", gap: 6, padding: "12px 12px 4px", overflowX: "auto", flex: "0 0 auto" })}>
          {frames.map((f) => {
            const on = f.id === frameId;
            return (
              <button
                onClick={() => onFrame(f.id)}
                class="m3-press"
                style={s({
                  height: 32,
                  padding: "0 12px 0 8px",
                  borderRadius: 16,
                  border: "none",
                  background: on ? p.primary : p.surfaceContainerHigh,
                  color: on ? p.onPrimary : p.onSurfaceVariant,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  whiteSpace: "nowrap",
                  flex: "0 0 auto",
                })}
              >
                <Icon name={isPhoneFrame(f) ? "smartphone" : "desktop_windows"} size={16} />
                {f.name || t("screen", lang)}
              </button>
            );
          })}
        </div>
      )}
      <div class="no-scrollbar" style={s({ flex: 1, overflowY: "auto", padding: "8px 10px 12px" })}>
        {topFirst().length === 0 ? (
          <div style={s({ padding: 24, textAlign: "center", color: p.outline, fontSize: 12 })}>
            <Icon name="layers_clear" size={32} />
            <div style={s({ marginTop: 8 })}>{t("noLayers", lang)}</div>
          </div>
        ) : (
          <Level values={ids} onReorder={onReorder}>
            {topFirst().map((g, i) => {
              const canOpen = g.free || g.items.length > 1;
              const open = canOpen && isOpen(g.id);
              return (
                <Row
                  id={g.id}
                  p={p}
                  depth={0}
                  icon={g.free ? <Icon name="group_work" size={18} /> : g.items.slice(0, 3).map((it) => <Icon name={KIND_SPEC[it.kind].paletteIcon} size={18} />)}
                  label={runLabel(g, lang)}
                  on={g.items.some((it) => sel.has(it.id))}
                  onSelect={(add) => onSelect(g.items.map((it) => it.id), add)}
                  open={canOpen ? open : undefined}
                  onToggle={canOpen ? () => toggle(g.id) : undefined}
                  onDragging={onDragging}
                  onUp={() => move(i, -1)}
                  onDown={() => move(i, 1)}
                  canUp={i > 0}
                  canDown={i < topFirst().length - 1}
                >
                  {groupBody(g, 1)}
                </Row>
              );
            })}
          </Level>
        )}
      </div>
    </div>
  );
}
