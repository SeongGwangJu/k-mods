// Finds the tables and fenced code in a reply so they can be drawn as cards; the rest
// stays markdown.

export type Align = 'left' | 'right' | 'center'

export type Table = { kind: 'table'; header: string[]; align: Align[]; rows: string[][] }

// `raw` is the fence as written, for the surfaces that keep Claude Code's own drawing.
export type Code = { kind: 'code'; lang: string; code: string; raw: string }

export type Segment = { kind: 'text'; text: string } | Table | Code

const SEPARATOR = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/
const FENCE = /^\s*(```|~~~)\s*([\w+#.-]*)/

// Inline emphasis and code ticks read as noise in a padded cell.
const clean = (cell: string): string =>
  cell.replace(/\*\*|__|`/g, '').replace(/\\\|/g, '|').trim()

export function cellsOf(line: string): string[] {
  const inner = line.trim().replace(/^\|/, '').replace(/(?<!\\)\|$/, '')

  return inner.split(/(?<!\\)\|/).map(clean)
}

const alignOf = (cell: string): Align => {
  const spec = cell.trim()

  if (spec.startsWith(':') && spec.endsWith(':')) {
    return 'center'
  }

  return spec.endsWith(':') ? 'right' : 'left'
}

const fit = (cells: string[], width: number): string[] =>
  Array.from({ length: width }, (_, i) => cells[i] ?? '')

export function splitReply(markdown: string): Segment[] {
  const lines = markdown.split('\n')
  const segments: Segment[] = []
  let text: string[] = []
  let inFence = false

  const flush = () => {
    if (text.join('\n').trim() !== '') {
      segments.push({ kind: 'text', text: text.join('\n') })
    }

    text = []
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    const next = lines[i + 1] ?? ''

    const fence = FENCE.exec(line)

    // A closed fence becomes a code segment; one still streaming stays text.
    if (fence !== null && !inFence) {
      const close = lines.findIndex((other, j) => j > i && FENCE.test(other) && other.trim().replace(/[`~]/g, '') === '')

      if (close !== -1) {
        flush()
        segments.push({
          kind: 'code',
          lang: (fence[2] ?? '').toLowerCase(),
          code: lines.slice(i + 1, close).join('\n'),
          raw: lines.slice(i, close + 1).join('\n'),
        })
        i = close
        continue
      }

      inFence = true
    } else if (fence !== null) {
      inFence = false
    }

    const header = cellsOf(line)
    const isTable =
      !inFence &&
      line.includes('|') &&
      SEPARATOR.test(next) &&
      header.length > 1 &&
      cellsOf(next).length === header.length

    if (!isTable) {
      text.push(line)
      continue
    }

    flush()

    const rows: string[][] = []
    i += 2

    while (i < lines.length && (lines[i] ?? '').includes('|') && (lines[i] ?? '').trim() !== '') {
      rows.push(fit(cellsOf(lines[i] ?? ''), header.length))
      i++
    }

    i--
    segments.push({ kind: 'table', header, align: cellsOf(next).map(alignOf), rows })
  }

  flush()

  return segments
}

// k-mods: a column used to be sized by character count, which cuts a Hangul table
// short, since the terminal draws each Hangul (and other wide) character in two
// cells. `widthOf` counts terminal cells instead, so `columnWidths`, `cutCell` and
// `padCell` size and cut a Korean table the way the terminal actually draws it.
const isWide = (ch: string): boolean =>
  /[\u1100-\u115f\u2e80-\ua4cf\uac00-\ud7a3\uf900-\ufaff\ufe30-\ufe4f\uff00-\uff60\uffe0-\uffe6]/.test(ch)

export const widthOf = (text: string): number =>
  [...text].reduce((sum, ch) => sum + (isWide(ch) ? 2 : 1), 0)

// Cuts to a cell width in terminal cells, not characters, so a cut never splits a
// wide character's two cells. Marked with an ellipsis where it lost text.
function cutToWidth(text: string, width: number): string {
  if (widthOf(text) <= width) {
    return text
  }

  let out = ''
  let used = 0

  for (const ch of text) {
    const w = isWide(ch) ? 2 : 1

    if (used + w > width - 1) {
      break
    }

    out += ch
    used += w
  }

  return `${out}…`
}

// Natural column widths, narrowed from the widest down until the table fits.
export function columnWidths(table: Table, maxWidth: number, gap: number): number[] {
  const widths = table.header.map((cell, col) =>
    Math.max(widthOf(cell), ...table.rows.map(row => widthOf(row[col] ?? ''))),
  )
  const budget = maxWidth - gap * (widths.length - 1)

  while (widths.reduce((sum, width) => sum + width, 0) > budget) {
    const widest = widths.indexOf(Math.max(...widths))

    if ((widths[widest] ?? 0) <= 3) {
      break
    }

    widths[widest] = (widths[widest] ?? 0) - 1
  }

  return widths
}

// A cell cut to its column, marked with an ellipsis where it lost text.
export function cutCell(text: string, width: number): string {
  return cutToWidth(text, width)
}

export function padCell(text: string, width: number, align: Align): string {
  const cut = cutToWidth(text, width)
  const room = width - widthOf(cut)

  if (align === 'right') {
    return ' '.repeat(room) + cut
  }

  if (align === 'center') {
    const left = Math.floor(room / 2)

    return ' '.repeat(left) + cut + ' '.repeat(room - left)
  }

  return cut + ' '.repeat(room)
}
