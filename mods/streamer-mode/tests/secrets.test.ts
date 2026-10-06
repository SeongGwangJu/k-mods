import { describe, expect, test } from 'claude-code/testing'

import { findSecrets, isSecretKey, keyWords } from '../hooks/mask/secrets'
import { maskWith } from './fixtures/mask-simple'

function masked(text: string): string {
  return maskWith(text, findSecrets(text))
}

describe('findSecrets — 이름이 있는 키/토큰 형식', () => {
  test('Anthropic 키(sk-ant-...)를 가린다', () => {
    expect(masked('key sk-ant-api03-abcdefghijklmnopqrstuvwxyz0123456789 끝')).toBe(
      'key [토큰 가림] 끝',
    )
  })

  test('OpenAI 키(sk-...)를 가린다', () => {
    expect(masked('OPENAI_API_KEY 없이 sk-abcdefghijklmnopqrstuvwxyz0123456789 사용')).toContain(
      '[토큰 가림]',
    )
  })

  test('OpenAI sk-proj- 키도 가린다', () => {
    expect(masked('sk-proj-abcdefghijklmnopqrstuvwxyz0123456789012345')).toBe('[토큰 가림]')
  })

  test('GitHub 토큰(ghp_...)을 가린다', () => {
    // "token: " 접두사를 붙이면 대입문 탐지(우선순위가 더 높음)가 먼저 걸려
    // "[값 가림]"이 되므로, 이름 있는 토큰 탐지 자체는 접두사 없이 확인한다.
    expect(masked(`${'ghp_' + 'a'.repeat(36)} 사용 중`)).toBe('[토큰 가림] 사용 중')
  })

  test('GitHub 다른 접두사(gho_, ghs_)도 가린다', () => {
    expect(findSecrets('gho_' + 'a'.repeat(36))).toHaveLength(1)
    expect(findSecrets('ghs_' + 'a'.repeat(36))).toHaveLength(1)
  })

  test('GitHub fine-grained PAT(github_pat_...)를 가린다', () => {
    expect(findSecrets('github_pat_' + 'a'.repeat(40))).toHaveLength(1)
  })

  test('AWS 액세스 키(AKIA/ASIA + 16자리)를 가린다', () => {
    expect(masked('AKIAIOSFODNN7EXAMPLE')).toBe('[토큰 가림]')
    expect(findSecrets('ASIAIOSFODNN7EXAMPLE')).toHaveLength(1)
  })

  test('Google API 키(AIza + 35자리)를 가린다', () => {
    expect(findSecrets('AIza' + 'A'.repeat(35))).toHaveLength(1)
  })

  test('Slack 토큰(xoxb- 등)을 가린다', () => {
    expect(findSecrets('xoxb-demo-not-a-real-token-0000')).toHaveLength(1)
  })

  // 테스트용 가짜 값은 실행 중에 조립한다. 소스에 실제 형식의 문자열이 그대로 있으면
  // 저장소 비밀값 스캐너가 진짜 키로 오인한다.
  test('Stripe 키(sk_live_ 등)를 가린다', () => {
    const fake = 'abcdefghijklmnopqrstuvwxyz1234'
    expect(findSecrets(['sk', 'live', fake].join('_'))).toHaveLength(1)
    expect(findSecrets(['rk', 'live', fake].join('_'))).toHaveLength(1)
  })

  test('npm 토큰(npm_ + 36자리)을 가린다', () => {
    expect(findSecrets('npm_' + 'a'.repeat(36))).toHaveLength(1)
  })

  test('JWT(eyJ....... 세 토막)를 가린다', () => {
    const jwt =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dQw4w9WgXcQ_dGVzdHNpZ25hdHVyZQ'
    expect(masked(`Authorization header: ${jwt}`)).toBe('Authorization header: [토큰 가림]')
  })

  test('텔레그램 봇 토큰(숫자:35자)을 가린다', () => {
    expect(findSecrets('123456789:' + 'A'.repeat(35))).toHaveLength(1)
  })

  test('Slack 웹훅 URL을 가린다', () => {
    expect(
      findSecrets('https://hooks.slack.com/services/' + ['T00000000', 'B00000000', 'X'.repeat(24)].join('/')),
    ).toHaveLength(1)
  })

  test('Discord 웹훅 URL을 가린다', () => {
    expect(
      findSecrets('https://discord.com/api/webhooks/123456789012345678/abcDEF123-xyz_456'),
    ).toHaveLength(1)
  })

  test('PEM 개인 키 블록 전체를 하나로 가린다', () => {
    const pem = [
      '-----BEGIN RSA PRIVATE KEY-----',
      'MIIBogIBAAJBAKj34GkxFhD91assdfQIDAQAB',
      'QIDAQAB',
      '-----END RSA PRIVATE KEY-----',
    ].join('\n')
    const matches = findSecrets(pem)
    expect(matches).toHaveLength(1)
    expect(matches[0]!.end - matches[0]!.start).toBe(pem.length)
  })

  test('scheme://user:PASSWORD@host는 비밀번호만 가린다', () => {
    expect(masked('postgres://admin:S3cretPW!@db.example.com:5432/app')).toBe(
      'postgres://admin:[토큰 가림]@db.example.com:5432/app',
    )
  })

  test('Bearer 토큰은 "Bearer " 뒤만 가린다', () => {
    expect(masked('Authorization: Bearer abcde12345xyz987zz')).toBe(
      'Authorization: Bearer [토큰 가림]',
    )
  })
})

describe('findSecrets — key=value / key: value 대입문', () => {
  test('API_KEY=값 형태를 가리되 키는 남긴다', () => {
    expect(masked('API_KEY=sup3rSecretValue123')).toBe('API_KEY=[값 가림]')
  })

  test('YAML 스타일(api-key: 값)도 가린다', () => {
    expect(masked('api-key: sup3rSecretValue123')).toBe('api-key: [값 가림]')
  })

  test('JSON 스타일("secret": "값")도 가린다 (따옴표는 남긴다)', () => {
    expect(masked('"client_secret": "abcDEF123456"')).toBe('"client_secret": "[값 가림]"')
  })

  test('따옴표로 감싼 값은 따옴표를 남기고 안쪽만 가린다', () => {
    expect(masked('API_KEY="abcDEF123456"')).toBe('API_KEY="[값 가림]"')
  })

  test('빈 값은 가리지 않는다', () => {
    expect(findSecrets('DB_PASSWORD=')).toHaveLength(0)
  })

  test('xxx류 자리표시자는 가리지 않는다', () => {
    expect(findSecrets('TOKEN=xxx')).toHaveLength(0)
    expect(findSecrets('TOKEN=XXXX')).toHaveLength(0)
  })

  test('<your-key>류 자리표시자는 가리지 않는다', () => {
    expect(findSecrets('API_KEY=<your-key>')).toHaveLength(0)
  })

  test('${VAR}류 자리표시자는 가리지 않는다', () => {
    expect(findSecrets('SECRET=${DB_SECRET}')).toHaveLength(0)
  })

  test('changeme류 자리표시자는 가리지 않는다', () => {
    expect(findSecrets('PASSWORD=changeme')).toHaveLength(0)
  })
})

describe('findSecrets — 흔한 오탐 방지', () => {
  test('git SHA는 가리지 않는다', () => {
    expect(findSecrets('a1b2c3d4e5f678901234567890123456789012ab')).toHaveLength(0)
  })

  test('UUID는 가리지 않는다', () => {
    expect(findSecrets('550e8400-e29b-41d4-a716-446655440000')).toHaveLength(0)
  })

  test('일반 base64 블록은 가리지 않는다', () => {
    expect(findSecrets('SGVsbG8gV29ybGQhIFRoaXMgaXMgYSB0ZXN0IQ==')).toHaveLength(0)
  })

  test('버전 번호는 가리지 않는다', () => {
    expect(findSecrets('v2.1.291')).toHaveLength(0)
  })

  test('포트 번호(key=value지만 키가 수상하지 않음)는 가리지 않는다', () => {
    expect(findSecrets('PORT=8080')).toHaveLength(0)
  })

  test('키 이름에 비밀 단어가 "들어 있기만" 한 경우는 가리지 않는다', () => {
    expect(findSecrets('author: Jane')).toHaveLength(0)
    expect(findSecrets('max_tokens: 1024')).toHaveLength(0)
    expect(findSecrets('tokenizer=cl100k_base')).toHaveLength(0)
    expect(findSecrets('"authority": "kr-gov"')).toHaveLength(0)
  })

  test('단어 단위로 비밀인 키는 가린다', () => {
    expect(findSecrets('AUTH_TOKEN=abc123def456')).toHaveLength(1)
    expect(findSecrets('accessToken: "q9w8e7r6t5y4"')).toHaveLength(1)
    expect(findSecrets('OPENAI_API_KEY=xyz987654321')).toHaveLength(1)
    expect(findSecrets('DB_PASS=hunter2hunter2')).toHaveLength(1)
    expect(findSecrets('"apiKey": "k_live_123456789"')).toHaveLength(1)
    expect(findSecrets('process.env.CLIENT_SECRET = "s3cr3tvalue"')).toHaveLength(1)
  })
})

describe('isSecretKey', () => {
  test('키를 단어로 쪼갠다', () => {
    expect(keyWords('OPENAI_API_KEY')).toEqual(['openai', 'api', 'key'])
    expect(keyWords('accessToken')).toEqual(['access', 'token'])
    expect(keyWords('process.env.db-pass')).toEqual(['process', 'env', 'db', 'pass'])
  })

  test('pass는 다른 단어 뒤에 올 때만 비밀로 본다', () => {
    expect(isSecretKey('DB_PASS')).toBe(true)
    expect(isSecretKey('pass')).toBe(false)
    expect(isSecretKey('passes')).toBe(false)
  })
})
