import { isPlaceholderValue } from './placeholder'
import { PRIORITY, type RawMatch } from './types'

function pushMatch(
  matches: RawMatch[],
  start: number,
  end: number,
  isAssignmentValue = false,
): void {
  matches.push({
    start,
    end,
    category: 'secret',
    priority: isAssignmentValue ? PRIORITY.secretAssignment : PRIORITY.secret,
    isAssignmentValue,
  })
}

function collectFromRegex(text: string, re: RegExp, matches: RawMatch[]): void {
  for (const m of text.matchAll(re)) {
    if (m.index === undefined) continue
    pushMatch(matches, m.index, m.index + m[0].length)
  }
}

// ---- 이름이 있는 키/토큰 형식들 ---------------------------------------------

const ANTHROPIC_KEY_RE = /(?<![A-Za-z0-9_])sk-ant-[A-Za-z0-9_-]{10,}(?![A-Za-z0-9_-])/g
// sk-ant-... 는 OpenAI 패턴과 접두사가 겹치므로 OpenAI 쪽에서 제외한다
const OPENAI_KEY_RE = /(?<![A-Za-z0-9_])sk-(?!ant-)(?:proj-)?[A-Za-z0-9_-]{20,}(?![A-Za-z0-9_-])/g
const GITHUB_TOKEN_RE = /(?<![A-Za-z0-9_])gh[pousr]_[A-Za-z0-9]{20,}(?![A-Za-z0-9_])/g
const GITHUB_PAT_RE = /(?<![A-Za-z0-9_])github_pat_[A-Za-z0-9_]{20,}(?![A-Za-z0-9_])/g
const AWS_KEY_RE = /(?<![A-Z0-9])(?:AKIA|ASIA)[A-Z0-9]{16}(?![A-Z0-9])/g
const GOOGLE_KEY_RE = /(?<![A-Za-z0-9_-])AIza[A-Za-z0-9_-]{35}(?![A-Za-z0-9_-])/g
const SLACK_TOKEN_RE = /(?<![A-Za-z0-9])xox[abposr]-[A-Za-z0-9-]{10,}(?![A-Za-z0-9-])/g
const STRIPE_KEY_RE = /(?<![A-Za-z0-9])(?:sk_live_|rk_live_|sk_test_)[A-Za-z0-9]{10,}(?![A-Za-z0-9])/g
const NPM_TOKEN_RE = /(?<![A-Za-z0-9_])npm_[A-Za-z0-9]{36}(?![A-Za-z0-9_])/g
// \b는 base64url의 '-'/'_'가 뒤이어 비(非)단어 문자와 만나면 경계가 안 생길 수 있어
// 경계 대신 lookaround로 앞뒤에 토큰 문자가 더 없는지를 직접 본다.
const JWT_RE =
  /(?<![A-Za-z0-9_-])eyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}(?![A-Za-z0-9_-])/g
const TELEGRAM_TOKEN_RE = /(?<!\d)\d{8,10}:[A-Za-z0-9_-]{35}(?![A-Za-z0-9_-])/g
const SLACK_WEBHOOK_RE = /https:\/\/hooks\.slack\.com\/services\/[A-Za-z0-9/]+/g
const DISCORD_WEBHOOK_RE =
  /https:\/\/(?:ptb\.|canary\.)?discord(?:app)?\.com\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+/g

// PEM 개인 키 블록 전체 (여러 줄)
const PEM_BLOCK_RE = /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]+?-----END [A-Z ]*PRIVATE KEY-----/g

// scheme://user:PASSWORD@host — 비밀번호 부분만 가린다
const URL_CREDENTIAL_RE =
  /(\b[a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^\s/:@]+:)([^\s/@]+)(@)/g

// Bearer <token> — "Bearer " 뒤의 토큰만 가린다
const BEARER_RE = /\bBearer\s+([A-Za-z0-9._~+/=-]{8,})/gi

// key=value / key: value / "key": "value". 키 이름을 단어 단위로 쪼개 비밀 같은 키의 값만 가린다.
// 부분 문자열로 보면 author(auth), max_tokens(token), tokenizer(token)까지 걸려서 단어 단위로 본다.
const ASSIGNMENT_RE = /(["'])?([A-Za-z][A-Za-z0-9_.-]*)\1\s*[:=]\s*(["'`]?)([^\s"'`,;]+)\3/g

const SECRET_WORDS = new Set([
  'secret',
  'secrets',
  'token',
  'password',
  'passwd',
  'pwd',
  'passphrase',
  'credential',
  'credentials',
  'auth',
  'authorization',
  'apikey',
  'privatekey',
  'accesskey',
  'secretkey',
])
// 두 단어가 붙어야 비밀인 경우 (API_KEY, privateKey, AWS_ACCESS_KEY ...)
const SECRET_PAIRS = new Set(['api key', 'private key', 'access key', 'secret key', 'signing key', 'encryption key', 'master key'])

/** OPENAI_API_KEY → [openai, api, key], accessToken → [access, token] */
export function keyWords(key: string): string[] {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[\s_.\-]+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase())
}

/** 이 키 이름의 값이 비밀일 가능성이 높은가 */
export function isSecretKey(key: string): boolean {
  const words = keyWords(key)
  for (let i = 0; i < words.length; i++) {
    const w = words[i]!
    if (SECRET_WORDS.has(w)) return true
    // DB_PASS, SMTP_PASS처럼 다른 단어 뒤에 오는 pass
    if (w === 'pass' && i > 0) return true
    if (i + 1 < words.length && SECRET_PAIRS.has(`${w} ${words[i + 1]}`)) return true
  }
  return false
}

function findNamedTokens(text: string): RawMatch[] {
  const matches: RawMatch[] = []

  for (const re of [
    ANTHROPIC_KEY_RE,
    OPENAI_KEY_RE,
    GITHUB_TOKEN_RE,
    GITHUB_PAT_RE,
    AWS_KEY_RE,
    GOOGLE_KEY_RE,
    SLACK_TOKEN_RE,
    STRIPE_KEY_RE,
    NPM_TOKEN_RE,
    JWT_RE,
    TELEGRAM_TOKEN_RE,
    SLACK_WEBHOOK_RE,
    DISCORD_WEBHOOK_RE,
    PEM_BLOCK_RE,
  ]) {
    collectFromRegex(text, re, matches)
  }

  return matches
}

function findUrlCredentials(text: string): RawMatch[] {
  const matches: RawMatch[] = []

  for (const m of text.matchAll(URL_CREDENTIAL_RE)) {
    if (m.index === undefined) continue
    // 세 그룹 모두 선택적이 아니므로 전체 매치가 있으면 항상 들어 있다.
    const passwordStart = m.index + m[1]!.length
    const passwordEnd = passwordStart + m[2]!.length
    pushMatch(matches, passwordStart, passwordEnd)
  }

  return matches
}

function findBearerTokens(text: string): RawMatch[] {
  const matches: RawMatch[] = []

  for (const m of text.matchAll(BEARER_RE)) {
    if (m.index === undefined) continue
    const token = m[1]! // 선택적이지 않은 그룹
    const tokenStart = m.index + m[0].length - token.length
    pushMatch(matches, tokenStart, tokenStart + token.length)
  }

  return matches
}

function findAssignments(text: string): RawMatch[] {
  const matches: RawMatch[] = []

  for (const m of text.matchAll(ASSIGNMENT_RE)) {
    if (m.index === undefined) continue
    if (!isSecretKey(m[2]!)) continue
    const value = m[4]! // 선택적이지 않은 그룹 (값 자체)

    // "Authorization: Bearer xyz" 같은 줄은 키가 비밀 단어(authorization)라 걸리지만, 값이
    // 그냥 "Bearer"만 잘려 잡힌다 — 진짜 토큰은 findBearerTokens가 따로 잡으므로
    // 여기서는 건너뛴다 (아니면 "Bearer" 단어만 엉뚱하게 가려진다).
    if (/^bearer$/i.test(value)) continue
    if (isPlaceholderValue(value)) continue

    // 그룹 3은 `(["'`]?)`로 ?가 글자 집합 안에 있어 그룹 자체는 항상 참여한다
    // (빈 문자열이거나 따옴표 하나). 그래도 타입상 optional이라 단언이 필요하다.
    const quoteLen = m[3]!.length
    const valueStart = m.index + m[0].length - quoteLen - value.length
    pushMatch(matches, valueStart, valueStart + value.length, true)
  }

  return matches
}

/** mask_secrets 그룹의 모든 탐지기를 합쳐 돌린다 */
export function findSecrets(text: string): RawMatch[] {
  return [
    ...findNamedTokens(text),
    ...findUrlCredentials(text),
    ...findBearerTokens(text),
    ...findAssignments(text),
  ]
}
