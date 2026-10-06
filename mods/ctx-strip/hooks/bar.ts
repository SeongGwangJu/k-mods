// ctx-strip 띠(band)의 핵심 계산. $를 받지 않는 순수 함수라 테스트하기 쉽다.
// 막대 채우기 규칙은 원본 statusline-ctx.py의 슬롯 채우기 그대로 옮겼다: 분류별로 누적
// 비율을 반올림해 칸 수를 정하고, 토큰이 있는 분류는 최소 1칸은 보이게 한다. 자동 압축
// 지점 표시(▕)는 "아직 쓰지 않은 칸"에만 그린다 — 이미 그 지점을 지나 채워진 칸은 분류
// 색이 우선이다(원본 파이썬의 렌더 순서와 같다: 채워진 칸이 먼저 걸리면 표시는 안 보인다).

import { k } from './format'

export type Tier = 'wide' | 'medium' | 'narrow'

/** CONTRIBUTING.md 화면 원칙의 폭 3단계: 넓음 ≥100, 보통 70~99, 좁음 <70. */
export function widthTier(columns: number): Tier {
  if (columns >= 100) return 'wide'
  if (columns >= 70) return 'medium'
  return 'narrow'
}

/** 막대가 쓸 칸 수. 퍼센트 글자·여백 몫으로 8칸을 비워 둔다. */
export function barWidth(bodyColumns: number): number {
  return Math.max(10, bodyColumns - 8)
}

export type BarRun = {
  /** 분류 이름, 또는 빈 칸(아직 안 쓴 구간)이면 null. */
  key: string | null
  length: number
  /** 이 칸이 자동 압축 지점 표시인지(항상 length === 1, 빈 구간 안에서만). */
  hasMark: boolean
}

/**
 * 분류별 토큰을 막대 칸으로 슬롯 채우기 한 뒤 연속 구간으로 묶는다(run-length encoding).
 *
 * @param categories kind==='used' && tokens>0 로 이미 걸러진, 엔진이 준 순서 그대로
 * @param width 막대 전체 칸 수
 * @param maxTokens 막대가 나타내는 전체 창 크기(토큰)
 * @param thresholdTokens 자동 압축 지점(토큰), 없으면 null
 */
export function barSegments(
  categories: ReadonlyArray<{ name: string; tokens: number }>,
  width: number,
  maxTokens: number,
  thresholdTokens: number | null,
): BarRun[] {
  if (width <= 0) return []
  const slots: (string | null)[] = []
  if (maxTokens > 0) {
    let acc = 0
    for (const c of categories) {
      acc += c.tokens
      let end = Math.round((acc / maxTokens) * width)
      if (end <= slots.length) end = slots.length + 1
      end = Math.min(width, end)
      while (slots.length < end) slots.push(c.name)
    }
  }
  while (slots.length < width) slots.push(null)

  const markIndex =
    thresholdTokens != null && maxTokens > 0 ? Math.min(width - 1, Math.round((thresholdTokens / maxTokens) * width)) : null

  const runs: BarRun[] = []
  for (let i = 0; i < slots.length; i++) {
    const key = slots[i] ?? null
    const hasMark = markIndex === i && key === null
    const prev = runs[runs.length - 1]
    if (prev && prev.key === key && !hasMark && !prev.hasMark) {
      prev.length += 1
    } else {
      runs.push({ key, length: 1, hasMark })
    }
  }
  return runs
}

/** 10% 이상은 정수, 0.1% 이상은 소수 한 자리, 그 밑은 "<0.1%". */
export function pctText(tokens: number, total: number): string {
  if (total <= 0) return '0%'
  const p = (tokens / total) * 100
  if (p >= 10) return `${p.toFixed(0)}%`
  if (p >= 0.1) return `${p.toFixed(1)}%`
  return '<0.1%'
}

export type Chip = { name: string; pct: string }

/** 토큰 많은 순 범례. limit을 주면(보통 폭) 상위 N개만. */
export function legendChips(categories: ReadonlyArray<{ name: string; tokens: number }>, maxTokens: number, limit?: number): Chip[] {
  const sorted = [...categories].sort((a, b) => b.tokens - a.tokens)
  const sliced = limit !== undefined ? sorted.slice(0, limit) : sorted
  return sliced.map((c) => ({ name: c.name, pct: pctText(c.tokens, maxTokens) }))
}

export type DeltaInfo = { text: string; isBig: boolean }

/**
 * 지난 턴 대비 증가량 문구. 1000 토큰 밑이면 안 보여준다(너무 자잘해서).
 * isBig은 "많이 늘었을 때"만 켜진다 — 압축 뒤처럼 크게 줄 때는 경고가 아니라 좋은 소식이라
 * 원본과 같이 양수 쪽만 큰 증가로 본다.
 */
export function deltaText(delta: number | null): DeltaInfo {
  if (delta === null || Math.abs(delta) < 1000) return { text: '', isBig: false }
  const sign = delta > 0 ? '+' : '−'
  return { text: `${sign}${k(Math.abs(delta))}`, isBig: delta >= 20000 }
}

/** 퍼센트에 따른 팔레트 색 선택(심각도). */
export function percentSeverity(percentage: number): 'danger' | 'warn' | 'bright' {
  if (percentage >= 85) return 'danger'
  if (percentage >= 70) return 'warn'
  return 'bright'
}
