import { PRIORITY, type RawMatch } from './types'

// macOS/Linux 공용 폴더처럼 실제 "개인 이름"이 아닌 흔한 값은 가리지 않는다
const SKIP_NAMES = new Set(['shared', 'guest', 'default', 'public'])

const UNIX_HOME_RE = /\/(?:Users|home)\/([^/\s]+)/g
const WINDOWS_HOME_RE = /C:\\Users\\([^\\/\s]+)/gi

function collect(text: string, re: RegExp, matches: RawMatch[]): void {
  for (const m of text.matchAll(re)) {
    if (m.index === undefined) continue
    const name = m[1]! // 선택적이지 않은 그룹
    if (SKIP_NAMES.has(name.toLowerCase())) continue

    const nameStart = m.index + m[0].length - name.length
    matches.push({
      start: nameStart,
      end: nameStart + name.length,
      category: 'home',
      priority: PRIORITY.home,
    })
  }
}

/** /Users/<이름>, /home/<이름>, C:\Users\<이름> 의 사용자 이름 부분만 가린다 */
export function findHomePaths(text: string): RawMatch[] {
  const matches: RawMatch[] = []
  collect(text, UNIX_HOME_RE, matches)
  collect(text, WINDOWS_HOME_RE, matches)
  return matches
}
