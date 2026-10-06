import { PRIORITY, type RawMatch } from './types'

function escapeRegExp(word: string): string {
  return word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 사용자가 등록한 단어(회사명·실명·고객사명 등)를 대소문자 구분 없이, 글자 그대로
 * 찾는다. 짧은 단어가 긴 단어의 일부를 가로채지 않도록 긴 단어부터 시도한다
 * (예: "Acme"와 "AcmeCorp"가 둘 다 등록돼 있으면 "AcmeCorp"를 통째로 가린다).
 */
export function findCustomWords(text: string, words: readonly string[]): RawMatch[] {
  const unique = [...new Set(words.map(w => w.trim()).filter(w => w.length > 0))].sort(
    (a, b) => b.length - a.length,
  )

  if (unique.length === 0) {
    return []
  }

  const pattern = new RegExp(unique.map(escapeRegExp).join('|'), 'gi')
  const matches: RawMatch[] = []

  for (const m of text.matchAll(pattern)) {
    if (m.index === undefined || m[0].length === 0) continue
    matches.push({
      start: m.index,
      end: m.index + m[0].length,
      category: 'custom',
      priority: PRIORITY.custom,
    })
  }

  return matches
}
