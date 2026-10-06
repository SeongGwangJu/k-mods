/**
 * 이번 세션에서 가린, 서로 다른 항목의 개수를 센다. 원본 값은 절대 담지 않고
 * (해시만 담아) 같은 값을 다시 가렸을 때 중복으로 세지 않기 위한 용도로만 쓴다.
 */
export interface SessionCounter {
  /** 해시 키를 기록한다. 이번 세션에 처음 보는 키면 true를 돌려준다. */
  record(key: string): boolean
  readonly count: number
}

// 비정상적으로 긴 세션에서 메모리가 끝없이 늘지 않도록 두는 방어적 상한.
// 실제로 한 세션에서 이만큼 서로 다른 비밀을 가릴 일은 거의 없다.
const MAX_TRACKED = 10_000

export function createSessionCounter(): SessionCounter {
  const seen = new Set<string>()

  return {
    record(key) {
      if (seen.has(key)) {
        return false
      }
      if (seen.size >= MAX_TRACKED) {
        return false
      }

      seen.add(key)
      return true
    },

    get count() {
      return seen.size
    },
  }
}
