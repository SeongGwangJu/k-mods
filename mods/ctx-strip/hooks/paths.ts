// ctx-strip의 경로·스냅샷 계산. $를 받지 않는 순수 함수만 둔다 — mods API는 항상
// $.네임스페이스.메서드(...)로 호출 지점에서 끝까지 적어야 하므로, $.env/$.fs/$.process를
// 값으로 넘기는 도우미를 만들 수 없다(정적 분석 규칙). 실제 $ 호출은 register.ts 쪽
// 최상위 함수(tempDir/ensureDir/openPath/writeSnapshot)에 그대로 두고, 그 함수들이 여기
// 순수 함수에 "이미 읽어 온 값"만 건넨다.
import type { SessionContextBreakdown } from 'claude-code'

/**
 * 세션마다 다른 사람이 쓸 수 있는 공용 /tmp 대신, 사람별 임시 폴더 이름.
 * TMPDIR(맥은 사람마다 다른 경로)이 없으면 /tmp, 사용자 이름도 없으면 "user".
 * 같은 공식을 extras/statusline-ctx.py 쪽에서도 그대로 써서 서로 다른 경로를 보지 않게 맞춘다.
 */
export function tempDirFrom(tmpdir: string | undefined, user: string | undefined): string {
  const base = tmpdir && tmpdir.length > 0 ? tmpdir : '/tmp'
  const name = user && user.length > 0 ? user : 'user'
  return `${base.replace(/\/+$/, '')}/ctx-strip-${name}`
}

export type SnapshotPayload = {
  /** 상태줄 스크립트가 같은 색을 쓰도록 팔레트 이름을 함께 적는다 */
  palette: string
  percentage: number
  totalTokens: number
  maxTokens: number
  autoCompactThreshold: number | null
  delta: number | null
  categories: Array<{ name: string; tokens: number }>
}

/** statusline 모드가 쓰는 JSON 스냅샷의 내용(원본 writeSnapshot과 같은 필드). */
export function snapshotPayload(breakdown: SessionContextBreakdown, delta: number | null, palette: string = 'dark'): SnapshotPayload {
  return {
    palette,
    percentage: breakdown.percentage,
    totalTokens: breakdown.totalTokens,
    maxTokens: breakdown.rawMaxTokens || breakdown.maxTokens,
    autoCompactThreshold: breakdown.isAutoCompactEnabled ? (breakdown.autoCompactThreshold ?? null) : null,
    delta,
    categories: breakdown.categories.filter((c) => c.kind === 'used' && c.tokens > 0).map((c) => ({ name: c.name, tokens: c.tokens })),
  }
}
