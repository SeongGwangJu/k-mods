/** key=value 대입문에서 "이미 가려져 있거나 값이 없는" 흔한 자리표시자들 */
const PLACEHOLDER_WORDS = new Set([
  'changeme',
  'change_me',
  'your-key',
  'your_key',
  'your-token',
  'your_token',
  'example',
  'placeholder',
  'todo',
  'fixme',
  'null',
  'undefined',
  'none',
])

/**
 * key=value 대입문의 값이 실제 비밀이 아니라 자리표시자(placeholder)인지 본다.
 * 빈 문자열, `xxx`류, `<your-key>`류, `${VAR}`류, `changeme`류를 걸러낸다.
 */
export function isPlaceholderValue(value: string): boolean {
  const trimmed = value.trim()

  if (trimmed.length === 0) {
    return true
  }
  if (/^x+$/i.test(trimmed)) {
    return true
  }
  if (/^<.*>$/.test(trimmed)) {
    return true
  }
  if (/^\$\{.*\}$/.test(trimmed)) {
    return true
  }
  if (PLACEHOLDER_WORDS.has(trimmed.toLowerCase())) {
    return true
  }

  return false
}
