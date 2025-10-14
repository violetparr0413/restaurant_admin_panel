// FancyMultiLineEditor.tsx
// A focus-safe, single-panel multi-line text editor with per-line font size (1,2,3)
// - Uses uncontrolled typing per row to avoid focus loss
// - Counts visual width for J/C/K characters (wide=2), identical to provided Flutter logic
// - Capacity: 46 ASCII units at font size 1 (scales down for 2,3)
// - Emits committed changes via onChange (on blur / enter / merge / paste-split)

import * as React from 'react';
import { Box, Paper, Typography, TextField, Chip } from '@mui/material';
import { useTranslation } from 'next-i18next';

// ---------- Types ----------
export type FontSize = 1 | 2 | 3;
export type PrintLine = { id: string; text: string; fontSize: FontSize };

let _idSeed = 0;
const mkId = () => `ln_${Date.now()}_${_idSeed++}`;

// ---------- Visual width helpers (JS port of your Flutter code) ----------
const isCombiningMark = (cp: number) =>
  (cp >= 0x0300 && cp <= 0x036F) ||
  (cp >= 0x1AB0 && cp <= 0x1AFF) ||
  (cp >= 0x1DC0 && cp <= 0x1DFF) ||
  (cp >= 0x20D0 && cp <= 0x20FF) ||
  (cp >= 0xFE20 && cp <= 0xFE2F) ||
  cp === 0x3099 || // dakuten
  cp === 0x309A;   // handakuten

const isSmallKana = (cp: number) =>
  [
    0x3041, 0x3043, 0x3045, 0x3047, 0x3049, // ぁぃぅぇぉ
    0x3063, // っ
    0x3083, 0x3085, 0x3087, // ゃゅょ
    0x30A1, 0x30A3, 0x30A5, 0x30A7, 0x30A9, // ァィゥェォ
    0x30C3, // ッ
    0x30E3, 0x30E5, 0x30E7, // ャュョ
    0x30EE, // ヮ
    0x30F5, 0x30F6 // ヵヶ
  ].includes(cp);

const isWide = (cp: number) =>
  (cp >= 0x1100 && cp <= 0x115F) || // Hangul Jamo
  (cp >= 0x2E80 && cp <= 0xA4CF) || // CJK Radicals, Ideographs
  (cp >= 0x3000 && cp <= 0x303F) || // CJK punctuation, Ideographic space
  (cp >= 0x3040 && cp <= 0x309F) || // Hiragana
  (cp >= 0x30A0 && cp <= 0x30FF) || // Katakana
  (cp >= 0xAC00 && cp <= 0xD7AF) || // Hangul Syllables
  (cp >= 0xF900 && cp <= 0xFAFF) || // CJK Compatibility Ideographs
  (cp >= 0xFE10 && cp <= 0xFE19) || // Vertical forms
  (cp >= 0xFE30 && cp <= 0xFE6F) || // CJK Compatibility Forms
  (cp >= 0xFF01 && cp <= 0xFF60) || // Full-width ASCII variants
  (cp >= 0x1F300 && cp <= 0x1F64F) || // Emojis (emoticons)
  (cp >= 0x1F900 && cp <= 0x1F9FF);   // Supplemental symbols

export const getVisualWidth = (text: string) => {
  let width = 0;
  for (const ch of Array.from(text)) {
    const cp = ch.codePointAt(0)!;
    if (isCombiningMark(cp)) width += 0;
    else if (isSmallKana(cp)) width += 1;
    else if (isWide(cp)) width += 2;
    else width += 1;
  }
  return width;
};

export const maxUnitsForFontSize = (fontSize: FontSize) => Math.floor(46 / fontSize);

export const clampByVisualWidth = (s: string, maxUnits: number) => {
  let acc = 0;
  let out = '';
  for (const ch of Array.from(s)) {
    const cp = ch.codePointAt(0)!;
    const add =
      isCombiningMark(cp) ? 0 :
        isSmallKana(cp) ? 1 :
          isWide(cp) ? 2 : 1;
    if (acc + add > maxUnits) break;
    out += ch;
    acc += add;
  }
  return out;
};

// ---------- Row (uncontrolled typing) ----------
type LineRowProps = {
  line: PrintLine;
  index: number;
  onCommitText: (id: string, text: string) => void;
  onChangeFont: (id: string, size: FontSize) => void;
  onInsertAfter: (idx: number) => void;
  onMergeUp: (idx: number) => void;
};

const LineRow = React.memo(function LineRow({
  line, index, onCommitText, onChangeFont, onInsertAfter, onMergeUp
}: LineRowProps) {
  const { t } = useTranslation('common')
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [local, setLocal] = React.useState(line.text);
  const [focused, setFocused] = React.useState(false);

  // Sync external text only when not focused (e.g. font change clamping)
  React.useEffect(() => {
    if (!focused && local !== line.text) setLocal(line.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line.text, focused]);

  const maxUnits = maxUnitsForFontSize(line.fontSize);

  const placeCaretEnd = (el: HTMLElement) => {
    const r = document.createRange();
    r.selectNodeContents(el);
    r.collapse(false);
    const s = window.getSelection();
    s?.removeAllRanges();
    s?.addRange(r);
  };

  const commitNow = (value: string) => {
    if (value !== line.text) onCommitText(line.id, value);
  };

  const onInput = (e: React.FormEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const raw = (el.textContent ?? '').replace(/\n/g, '');
    const clamped = clampByVisualWidth(raw, maxUnits);
    if (raw !== clamped) {
      el.textContent = clamped;
      placeCaretEnd(el);
    }
    setLocal(clamped); // local only
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const el = e.currentTarget;

    if (e.key === 'Enter') {
      e.preventDefault();
      commitNow(local);
      onInsertAfter(index);
      requestAnimationFrame(() => {
        const panel = el.closest('[data-editor-root]');
        const next = panel?.querySelectorAll('[data-line]')[index + 1] as HTMLElement | null;
        next?.focus();
      });
    }

    if (e.key === 'Backspace') {
      const sel = window.getSelection();
      const atStart = sel && sel.anchorOffset === 0;
      if (atStart && index > 0) {
        e.preventDefault();
        commitNow(local);
        onMergeUp(index);
        requestAnimationFrame(() => {
          const panel = el.closest('[data-editor-root]');
          const prev = panel?.querySelectorAll('[data-line]')[index - 1] as HTMLElement | null;
          prev?.focus();
        });
      }
    }
  };

  const onBlur = () => {
    setFocused(false);
    commitNow(local);
  };

  // Initialize DOM text only on mount
  const setRef = (node: HTMLDivElement | null) => {
    ref.current = node;
    if (node && node.textContent !== local) node.textContent = local;
  };

  const remaining = Math.max(0, maxUnits - getVisualWidth(local));

  // Grapheme-insensitive, but fine for width calibration
  const hasCJK = (s: string) => /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(s);

  const measureTextWidth = (text: string, fontCSS: string) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    ctx.font = fontCSS;
    return ctx.measureText(text).width;
  };

  /**
   * Returns an adjusted font size so a CJK-heavy string matches the ASCII width target.
   * - basePx: 14 / 28 / 42 (your current mapping)
   * - fontStack: the same font-family used in the editable div
   */
  const getAdjustedFontSizePx = (() => {
    // cache reference widths per base size to avoid re-measuring
    const cache: Record<number, { ascii: number }> = {};

    return (lineText: string, basePx: number, fontStack: string) => {
      // If no CJK present, keep the base size
      if (!hasCJK(lineText)) return basePx;

      // Build the CSS font string (normal weight/style assumed; update if needed)
      const fontCSS = `${basePx}px ${fontStack}`;
      // Calibrate once per base size with a stable ASCII reference of 46 columns
      if (!cache[basePx]) {
        cache[basePx] = {
          ascii: measureTextWidth('f'.repeat(46), fontCSS), // same count as your size-1 capacity
        };
      }

      // Measure a CJK reference string of 23 ideographs (your "two cells each" intent)
      // Using the actual line would also work, but this keeps behavior consistent.
      const cjkSample = '印'.repeat(23);
      const cjkWidth = measureTextWidth(cjkSample, fontCSS);
      if (cjkWidth <= 0) return basePx;

      // Scale font size so 23 CJK match 46 ASCII columns visually.
      const target = cache[basePx].ascii;
      const scale = target / cjkWidth;

      // Clamp a bit to avoid huge jumps if a user types only a few chars
      const clampedScale = Math.max(0.85, Math.min(1.15, scale));

      return Math.round(basePx * clampedScale);
    };
  })();

  const basePx = line.fontSize === 1 ? 14 : line.fontSize === 2 ? 28 : 42;
  const fontStack =
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

  const adjustedPx = React.useMemo(
    () => getAdjustedFontSizePx(local || line.text, basePx, fontStack),
    [local, line.text, basePx]
  );


  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '120px 1fr 90px',
        alignItems: 'center',
        gap: 1,
        px: 1.5, py: 1,
        borderBottom: '1px dashed',
        borderColor: 'divider',
        '&:hover': { bgcolor: 'action.hover' }
      }}
    >
      <TextField
        size="small"
        label={t('size')}
        select
        SelectProps={{ native: true }}
        value={line.fontSize}
        onChange={(e) => onChangeFont(line.id, Number(e.target.value) as FontSize)}
      >
        <option value={1}>1</option>
        <option value={2}>2</option>
        <option value={3}>3</option>
      </TextField>

      <Box
        ref={setRef}
        data-line
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        role="textbox"
        onFocus={() => setFocused(true)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        onInput={onInput}
        sx={{
          minHeight: 36,
          lineHeight: 1.6,
          outline: 'none',
          borderRadius: 1.5,
          px: 1.25, py: 0.75,
          bgcolor: 'background.default',
          border: '1px solid',
          borderColor: 'action.disabledBackground',
          fontFamily: fontStack,
          fontSize: adjustedPx,
        }}
      />

      <Box sx={{ textAlign: 'right' }}>
        <Chip
          size="small"
          label={`${remaining}/${maxUnits}`}
          variant={remaining === 0 ? 'filled' : 'outlined'}
          color={remaining === 0 ? 'warning' : 'default'}
        />
      </Box>
    </Box>
  );
});

// ---------- Main Editor (manages lines + IDs; emits onChange on commit/structural ops) ----------
export type PrintableTextEditorProps = {
  value: Array<Pick<PrintLine, 'text' | 'fontSize'> & Partial<Pick<PrintLine, 'id'>>>;
  onChange: (next: PrintLine[]) => void;
  maxHeight?: number;
};


export default function PrintableTextEditor({
  value, onChange, maxHeight = 360
}: PrintableTextEditorProps) {
  const { t } = useTranslation('common')
  // normalize incoming value to have stable ids
  const [lines, setLines] = React.useState<PrintLine[]>(() =>
    (value?.length ? value : [{ text: '', fontSize: 1 }])
      .map(l => ({ id: l.id ?? mkId(), text: l.text ?? '', fontSize: (l.fontSize as FontSize) ?? 1 }))
  );

  // When parent value changes externally (e.g., loading saved data), re-normalize
  React.useEffect(() => {
    const normalized = (value?.length ? value : [{ text: '', fontSize: 1 }])
      .map(l => ({ id: l.id ?? mkId(), text: l.text ?? '', fontSize: (l.fontSize as FontSize) ?? 1 }));
    setLines(normalized);
  }, [value]);

  const emit = React.useCallback((next: PrintLine[]) => {
    setLines(next);
    onChange?.(next);
  }, [onChange]);

  const addLineAfter = (idx: number) =>
    emit([
      ...lines.slice(0, idx + 1),
      { id: mkId(), text: '', fontSize: 1 },
      ...lines.slice(idx + 1),
    ]);

  const removeLineMergeUp = (idx: number) => {
    if (idx <= 0) return;
    const up = lines[idx - 1];
    const cur = lines[idx];
    const maxUnits = maxUnitsForFontSize(up.fontSize);
    const merged = clampByVisualWidth(up.text + cur.text, maxUnits);
    emit([
      ...lines.slice(0, idx - 1),
      { ...up, text: merged },
      ...lines.slice(idx + 1),
    ]);
  };

  const commitLineText = (id: string, text: string) =>
    emit(lines.map(l => (l.id === id ? { ...l, text } : l)));

  const changeLineFont = (id: string, size: FontSize) =>
    emit(lines.map(l => {
      if (l.id !== id) return l;
      const clamped = clampByVisualWidth(l.text, maxUnitsForFontSize(size));
      return { ...l, fontSize: size, text: clamped };
    }));

  return (
    <Paper variant="outlined" sx={{ p: 0, borderRadius: 3, overflow: 'hidden', borderColor: 'divider' }} data-editor-root>
      {/* Header */}
      <Box
        sx={{
          px: 2, py: 1,
          borderBottom: '1px solid', borderColor: 'divider',
          bgcolor: 'background.paper',
          position: 'sticky', top: 0, zIndex: 1,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {t('printable_text')}
        </Typography>
        <Typography variant="caption" color="text.secondary">
        </Typography>
      </Box>

      {/* Body */}
      <Box sx={{ maxHeight, overflow: 'auto', '&::-webkit-scrollbar': { height: 8, width: 8 } }}>
        {lines.map((ln, i) => (
          <LineRow
            key={ln.id}
            line={ln}
            index={i}
            onCommitText={commitLineText}
            onChangeFont={changeLineFont}
            onInsertAfter={addLineAfter}
            onMergeUp={removeLineMergeUp}
          />
        ))}
      </Box>
    </Paper>
  );
}

/*
USAGE EXAMPLE (inside your page):

import PrintableTextEditor, { PrintLine } from './FancyMultiLineEditor';

const [printLines, setPrintLines] = React.useState<PrintLine[]>([]);

// ... in render:
<PrintableTextEditor
  value={printLines}
  onChange={(next) => setPrintLines(next)}
/>

// When saving:
formData.append('print_data', JSON.stringify(printLines));

// When loading (from server):
// setPrintLines(parsedArrayFromServer);
*/
