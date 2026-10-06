/**
 * 렌더 훅은 자주 돈다. 같은 문자열을 또 가리지 않도록 원문→가려진 문자열 캐시를 둔다.
 * `Map`은 삽입 순서를 기억하므로, 읽을 때 다시 넣어 "최근 사용" 순서로 옮기면
 * 간단한 LRU(least-recently-used)가 된다.
 */
export interface MaskCache {
  get(key: string): string | undefined
  set(key: string, value: string): void
  readonly size: number
}

/**
 * @param limit 캐시에 담아 둘 최대 항목 수. 넘치면 가장 오래전에 쓰인 것부터 지운다.
 */
export function createMaskCache(limit: number): MaskCache {
  const map = new Map<string, string>()

  return {
    get(key) {
      if (!map.has(key)) {
        return undefined
      }

      const value = map.get(key) as string
      // 다시 넣어서 "최근 사용"의 맨 뒤로 옮긴다
      map.delete(key)
      map.set(key, value)
      return value
    },

    set(key, value) {
      if (map.has(key)) {
        map.delete(key)
      }

      map.set(key, value)

      if (map.size > limit) {
        const oldest = map.keys().next()
        if (!oldest.done) {
          map.delete(oldest.value)
        }
      }
    },

    get size() {
      return map.size
    },
  }
}
