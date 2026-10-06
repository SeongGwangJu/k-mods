const MAX_DEPTH = 20

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * 객체·배열 모양은 그대로 두고, 그 안의 문자열 값만 전부 가린다.
 * `ToolUse.input`, `ToolResult.output` 같은 알 수 없는 모양의 값에 쓴다.
 *
 * @param value 원본 값 (문자열·숫자·불리언·배열·객체 등 JSON류 데이터)
 * @param maskFn 문자열 하나를 가리는 함수
 * @param depth 재귀 깊이 (내부용, 비정상적으로 깊은 구조에서 멈추기 위함)
 */
export function deepMaskValue(value: unknown, maskFn: (text: string) => string, depth = 0): unknown {
  if (depth > MAX_DEPTH) {
    return value
  }

  if (typeof value === 'string') {
    return maskFn(value)
  }

  if (Array.isArray(value)) {
    return value.map(item => deepMaskValue(item, maskFn, depth + 1))
  }

  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {}
    for (const key of Object.keys(value)) {
      out[key] = deepMaskValue(value[key], maskFn, depth + 1)
    }
    return out
  }

  return value
}
