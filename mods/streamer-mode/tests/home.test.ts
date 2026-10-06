import { describe, expect, test } from 'claude-code/testing'

import { findHomePaths } from '../hooks/mask/home'
import { maskWith } from './fixtures/mask-simple'

function masked(text: string): string {
  return maskWith(text, findHomePaths(text))
}

describe('findHomePaths', () => {
  test('/Users/이름 의 이름 부분만 가린다', () => {
    expect(masked('/Users/jsg/git/project')).toBe('/Users/●●●/git/project')
  })

  test('/home/이름 도 가린다', () => {
    expect(masked('/home/kim/.bashrc')).toBe('/home/●●●/.bashrc')
  })

  test('Windows 경로(C:\\Users\\이름)도 가린다', () => {
    expect(masked('C:\\Users\\kim\\Documents')).toBe('C:\\Users\\●●●\\Documents')
  })

  test('경로 끝에 이름만 있어도 가린다', () => {
    expect(findHomePaths('/Users/jsg')).toHaveLength(1)
  })

  test('/Users/Shared 같은 공용 폴더는 가리지 않는다', () => {
    expect(findHomePaths('/Users/Shared/App')).toHaveLength(0)
  })

  test('/Users/Guest 도 가리지 않는다', () => {
    expect(findHomePaths('/Users/Guest')).toHaveLength(0)
  })

  test('/Users/ 가 없는 평범한 경로는 가리지 않는다', () => {
    expect(findHomePaths('/var/log/app.log')).toHaveLength(0)
  })
})
