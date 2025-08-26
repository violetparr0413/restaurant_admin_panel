// MiniTable.tsx
import { useTranslation } from "next-i18next";
import React, { useMemo, useRef, useState, useEffect } from "react";

type Align = "left" | "center" | "right";
type InputType = "text" | "number" | "select";

export type MiniTableColumn = {
  key: string;
  label: string;
  width?: string;               // e.g. "80px", "20ch", "1fr"
  align?: Align;
  input?: {
    type?: InputType;
    options?: Array<{ label: string; value: number }>; // for select
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
  };
};

export type MiniTableProps<T extends Record<string, any> = Record<string, any>> = {
  columns: MiniTableColumn[];
  value: T[];
  onChange?: (rows: T[]) => void;
  dense?: boolean;              // extra compact if true
  maxHeight?: number;           // px; scrolls if taller
  addLabel?: string;            // tooltip for the + button
  showIndex?: boolean;          // show # column
  readOnly?: boolean;           // disable add/remove
  className?: string;           // extra class hook
  style?: React.CSSProperties;
};

let __miniTableStylesInjected = false;
function injectStyles() {
  if (__miniTableStylesInjected) return;
  const css = `
  .mtb { --mtb-font: 12.5px; --mtb-pad: 6px; --mtb-radius: 8px; --mtb-border: 1px;
         --mtb-muted: #777; --mtb-bd: rgba(0,0,0,.12); --mtb-bg: #fff; --mtb-hover: rgba(0,0,0,.04);}
  .mtb.mtb-dense { --mtb-font: 12px; --mtb-pad: 4px; --mtb-radius: 6px; }
  .mtb-wrap { border: var(--mtb-border) solid var(--mtb-bd); border-radius: var(--mtb-radius); background: var(--mtb-bg); }
  .mtb table { width: 100%; border-collapse: collapse; font-size: var(--mtb-font); table-layout: fixed; }
  .mtb thead th { position: sticky; top: 0; z-index: 1; background: var(--mtb-bg); font-weight: 600;
                  text-align: left; padding: calc(var(--mtb-pad) + 1px) var(--mtb-pad); border-bottom: 1px solid var(--mtb-bd); }
  .mtb thead th.mtb-actions { width: 28px; text-align: right; }
  .mtb thead th:first-child {
  border-top-left-radius: var(--mtb-radius);
}

.mtb thead th:last-child {
  border-top-right-radius: var(--mtb-radius);
}
  .mtb tbody td { padding: var(--mtb-pad); border-bottom: 1px dashed rgba(0,0,0,.06); vertical-align: middle; }
  .mtb tfoot td { padding: var(--mtb-pad); border-top: 1px solid var(--mtb-bd); }
  .mtb .mtb-cell { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mtb .mtb-idx { width: 2.5ch; color: var(--mtb-muted); text-align: right; }
  .mtb .mtb-btn { all: unset; cursor: pointer; display: inline-grid; place-items: center; width: 22px; height: 22px;
                  border-radius: 6px; border: 1px solid transparent; }
  .mtb .mtb-btn:hover { background: var(--mtb-hover); }
  .mtb .mtb-btn:active { transform: translateY(1px); }
  .mtb .mtb-row-remove { color: #b02a37; }
  .mtb .mtb-row-remove:hover { outline: 1px solid rgba(176,42,55,.25); background: rgba(176,42,55,.08); }
  .mtb .mtb-add { color: #0b6bcb; }
  .mtb .mtb-add:hover { outline: 1px solid rgba(11,107,203,.25); background: rgba(11,107,203,.08); }
  .mtb input.mtb-in, .mtb select.mtb-in {
    width: 100%; box-sizing: border-box; font: inherit; color: inherit; background: #fff;
    border: 1px solid var(--mtb-bd); border-radius: 6px; padding: 4px 6px; height: 26px;
  }
  .mtb input.mtb-in:focus, .mtb select.mtb-in:focus { outline: 2px solid rgba(11,107,203,.25); border-color: #0b6bcb; }
  .mtb .mtb-scroller { overflow: auto; }
  .mtb .mtb-actions-col { text-align: right; }
  `;
  const style = document.createElement("style");
  style.setAttribute("data-mini-table", "true");
  style.textContent = css;
  document.head.appendChild(style);
  __miniTableStylesInjected = true;
}

export default function MiniTable<T extends Record<string, any> = Record<string, any>>({
  columns,
  value,
  onChange,
  dense,
  maxHeight = 160,
  addLabel = "Add row",
  showIndex = false,
  readOnly = false,
  className,
  style
}: MiniTableProps<T>) {
  const { t } = useTranslation('common')

  useEffect(injectStyles, []);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const firstInputRef = useRef<HTMLInputElement | HTMLSelectElement | null>(null);

  const colDefs = useMemo(() => columns.map(c => ({
    ...c,
    width: c.width ?? "auto",
    align: c.align ?? "left",
    input: c.input ?? { type: "text" as InputType }
  })), [columns]);

  useEffect(() => {
    if (adding) {
      // focus first input after showing add row
      setTimeout(() => firstInputRef.current?.focus(), 0);
    }
  }, [adding]);

  function startAdd() {
    if (readOnly) return;
    const initial: Record<string, string> = {};
    colDefs.forEach(c => (initial[c.key] = ""));
    setDraft(initial);
    setAdding(true);
  }

  function cancelAdd() {
    setAdding(false);
    setDraft({});
  }

  function commitAdd() {
    // simple validation: required inputs must be non-empty
    for (const c of colDefs) {
      if (c.input?.required && !String(draft[c.key] ?? "").trim()) {
        // focus offending input
        const el = document.querySelector<HTMLInputElement | HTMLSelectElement>(
          `[data-mtb-input="${c.key}"]`
        );
        el?.focus();
        return;
      }
    }
    const nextRow: Record<string, any> = {};
    for (const c of colDefs) {
      const raw = draft[c.key] ?? "";
      nextRow[c.key] = c.input?.type === "number" ? (raw === "" ? null : Number(raw)) : raw;
    }
    const next = [...value, nextRow as T];
    onChange?.(next);
    cancelAdd();
  }

  function removeAt(idx: number) {
    if (readOnly) return;
    const next = value.slice(0, idx).concat(value.slice(idx + 1));
    onChange?.(next);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitAdd();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelAdd();
    }
  }

  return (
    <div className={`mtb ${dense ? "mtb-dense" : ""} ${className ?? ""}`} style={style}>
      <div className="mtb-wrap">
        <table>
          <thead>
            <tr>
              {showIndex && <th className="mtb-idx">#</th>}
              {colDefs.map((c) => (
                <th key={c.key} style={{ width: c.width, textAlign: c.align }}>{c.label}</th>
              ))}
              <th className="mtb-actions">{
                !readOnly && (
                  <button
                    type="button"
                    className="mtb-btn mtb-add"
                    title={addLabel}
                    onClick={() => (adding ? commitAdd() : startAdd())}
                    aria-label={adding ? "Confirm add" : addLabel}
                  >
                    {adding ? (
                      // check icon
                      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M20.3 5.7a1 1 0 0 1 0 1.4l-10 10a1 1 0 0 1-1.4 0l-5-5a1 1 0 1 1 1.4-1.4l4.3 4.3 9.3-9.3a1 1 0 0 1 1.4 0z" />
                      </svg>
                    ) : (
                      // plus icon
                      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M11 5a1 1 0 1 1 2 0v6h6a1 1 0 1 1 0 2h-6v6a1 1 0 1 1-2 0v-6H5a1 1 0 1 1 0-2h6V5z" />
                      </svg>
                    )}
                  </button>
                )
              }</th>
            </tr>
          </thead>

          <tbody className="mtb-scroller" style={{ maxHeight }}>
            {value.length === 0 && !adding && (
              <tr>
                <td colSpan={(showIndex ? 1 : 0) + colDefs.length + 1} style={{ color: "#777", fontStyle: "italic" }}>
                  {t('no_records')}
                </td>
              </tr>
            )}

            {value.map((row, i) => (
              <tr key={i}>
                {showIndex && <td className="mtb-idx">{i + 1}</td>}
                {colDefs.map((c) => (
                  <td key={c.key}>
                    <div className="mtb-cell" style={{ textAlign: c.align }}>
                      {c.input?.type === "select"
                        ? (c.input?.options?.find(opt => String(opt.value) === String(row[c.key]))?.label ?? "")
                        : String(row[c.key] ?? "")}
                    </div>
                  </td>
                ))}
                <td className="mtb-actions-col">
                  {!readOnly && (
                    <button
                      type="button"
                      className="mtb-btn mtb-row-remove"
                      title="Remove row"
                      onClick={() => removeAt(i)}
                      aria-label={`Remove row ${i + 1}`}
                    >
                      {/* minus icon */}
                      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M5 11a1 1 0 1 0 0 2h14a1 1 0 1 0 0-2H5z" />
                      </svg>
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {adding && (
              <tr onKeyDown={handleKeyDown}>
                {showIndex && <td className="mtb-idx">•</td>}
                {colDefs.map((c, idx) => {
                  const common = {
                    "data-mtb-input": c.key,
                    className: "mtb-in",
                    style: { textAlign: c.align } as React.CSSProperties,
                    value: draft[c.key] ?? "",
                    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
                      setDraft((d) => ({ ...d, [c.key]: e.target.value }))
                  };
                  const placeholder = c.input?.placeholder; // no fallback
                  const showPlaceholder = typeof placeholder === "string" && placeholder.length > 0;
                  if (c.input?.type === "select") {
                    return (
                      <td key={c.key}>
                        <select {...common} ref={idx === 0 ? (firstInputRef as any) : undefined} aria-label={c.label}>
                          {showPlaceholder && <option value="">{placeholder}</option>}
                          {(c.input.options ?? []).map(opt => (
                            <option key={String(opt.value)} value={String(opt.value)}>{opt.label}</option>
                          ))}
                        </select>
                      </td>
                    );
                  }
                  if (c.input?.disabled === true) {
                    return (
                      <td key={c.key}></td>
                    )
                  }
                  return (
                    <td key={c.key}>
                      <input
                        {...common}
                        ref={idx === 0 ? (firstInputRef as any) : undefined}
                        type={c.input?.type === "number" ? "number" : "text"}
                        placeholder={placeholder + (c.input?.required ? " *" : "")}
                        aria-label={c.label}
                      />
                    </td>
                  );
                })}
                <td className="mtb-actions-col">
                  <button
                    type="button"
                    className="mtb-btn"
                    title="Cancel"
                    onClick={cancelAdd}
                    aria-label="Cancel"
                  >
                    {/* x icon */}
                    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M6.2 5.2a1 1 0 0 1 1.4 0L12 9.6l4.4-4.4a1 1 0 1 1 1.4 1.4L13.4 11l4.4 4.4a1 1 0 1 1-1.4 1.4L12 12.4l-4.4 4.4a1 1 0 1 1-1.4-1.4L10.6 11 6.2 6.6a1 1 0 0 1 0-1.4z" />
                    </svg>
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
