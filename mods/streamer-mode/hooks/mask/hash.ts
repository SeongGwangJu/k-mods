/**
 * 암호학적으로 안전하지 않은, 가벼운 FNV-1a 해시. 세션 동안 "같은 값을 또 가렸는지"만
 * 구분하면 되므로 원본 비밀 값은 절대 저장하지 않고 이 해시만 집합에 담아 둔다.
 *
 * @param input 해시할 원본 문자열 (절대 보관하지 않음)
 * @returns 36진수 문자열로 된 짧은 해시
 */
export function cheapHash(input: string): string {
  let hash = 0x811c9dc5

  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }

  return (hash >>> 0).toString(36)
}
