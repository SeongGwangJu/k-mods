#!/usr/bin/env node
// 원본 저장소에 고정 커밋 이후 새 커밋이 생긴 외부 항목을 마크다운 표로 알려 준다.
//   node scripts/outdated.mjs
import { execFileSync } from 'node:child_process'
import { loadRegistry } from './lib/catalog.mjs'

const rows = []
for (const e of loadRegistry()) {
  if (e.kind !== 'upstream' && e.kind !== 'patched') continue
  const up = e.upstream
  if (!up) continue
  try {
    const head = execFileSync('git', ['ls-remote', `https://github.com/${up.repo}.git`, 'HEAD'], { encoding: 'utf8' }).split(/\s+/)[0]
    if (head && !head.startsWith(up.commit)) {
      const compare = `https://github.com/${up.repo}/compare/${up.commit.slice(0, 12)}...${head.slice(0, 12)}`
      rows.push(`| \`${e.name}\` | ${e.kind === 'patched' ? '수정판' : '원본'} | \`${up.commit.slice(0, 7)}\` → \`${head.slice(0, 7)}\` | [바뀐 점](${compare}) |`)
    }
  } catch (err) {
    rows.push(`| \`${e.name}\` | 확인 실패 | | ${String(err.message).split('\n')[0]} |`)
  }
}
console.log('## 원본 업데이트 확인\n')
if (rows.length === 0) console.log('모든 항목이 원본 최신 커밋과 같아요.')
else console.log(['| 항목 | 종류 | 커밋 | 비교 |', '| --- | --- | --- | --- |', ...rows].join('\n'))
