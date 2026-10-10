#!/bin/sh
# 데모 GIF용 작은 예제 프로젝트를 만든다 (기본 위치 /tmp/k-demo/shop-api).
# .env 의 값은 전부 가짜다. 스트리머 모드가 무엇을 가리는지 보여 주려고 넣었다.
set -e
DIR="${1:-/tmp/k-demo/shop-api}"
rm -rf "$DIR"
mkdir -p "$DIR/src/routes" "$DIR/src/lib"
cd "$DIR"
cat > package.json <<'JSON'
{
  "name": "shop-api",
  "version": "0.3.0",
  "type": "module",
  "scripts": { "dev": "tsx watch src/server.ts", "test": "vitest run" },
  "dependencies": { "hono": "^4.6.0", "zod": "^3.23.0" }
}
JSON
cat > README.md <<'MD'
# shop-api

작은 쇼핑몰 주문 API. 주문 생성·조회·취소를 제공한다.

- `POST /orders` 주문 생성 (재고 확인 후 결제 대기)
- `GET /orders/:id` 주문 조회
- `POST /orders/:id/cancel` 결제 전 주문 취소
MD
cat > src/server.ts <<'TS'
import { Hono } from 'hono'
import { orders } from './routes/orders'

const app = new Hono()
app.route('/orders', orders)
app.get('/health', (c) => c.json({ ok: true }))

export default app
TS
cat > src/routes/orders.ts <<'TS'
import { Hono } from 'hono'
import { z } from 'zod'
import { reserveStock, releaseStock } from '../lib/stock'

const CreateOrder = z.object({ sku: z.string(), quantity: z.number().int().positive() })
const store = new Map<string, { sku: string; quantity: number; status: 'pending' | 'paid' | 'cancelled' }>()

export const orders = new Hono()

orders.post('/', async (c) => {
  const body = CreateOrder.parse(await c.req.json())
  await reserveStock(body.sku, body.quantity)
  const id = crypto.randomUUID()
  store.set(id, { ...body, status: 'pending' })
  return c.json({ id, status: 'pending' }, 201)
})

orders.get('/:id', (c) => {
  const order = store.get(c.req.param('id'))
  return order ? c.json(order) : c.json({ error: 'not found' }, 404)
})

orders.post('/:id/cancel', async (c) => {
  const order = store.get(c.req.param('id'))
  if (!order) return c.json({ error: 'not found' }, 404)
  if (order.status !== 'pending') return c.json({ error: 'already paid' }, 409)
  await releaseStock(order.sku, order.quantity)
  order.status = 'cancelled'
  return c.json(order)
})
TS
cat > src/lib/stock.ts <<'TS'
const stock = new Map<string, number>([['tee-black-m', 12], ['mug-white', 3]])

export async function reserveStock(sku: string, quantity: number) {
  const left = stock.get(sku) ?? 0
  if (left < quantity) throw new Error(`out of stock: ${sku}`)
  stock.set(sku, left - quantity)
}

export async function releaseStock(sku: string, quantity: number) {
  stock.set(sku, (stock.get(sku) ?? 0) + quantity)
}
TS
cat > .env <<'ENV'
# 데모용 가짜 값
DATABASE_URL=postgres://shop:s3cretPassw0rd@db.internal:5432/shop
OPENAI_API_KEY=sk-proj-demo0000notreal0000demo0000notreal
ADMIN_EMAIL=kim.dev@example-shop.kr
ADMIN_PHONE=010-2345-6789
ENV
# 미리보기 촬영(shoot.sh)용 소품: 프로젝트 메모리·에이전트·스킬(컨텍스트 막대의 분류가 여러 개 보이게),
# 주문 데이터(컨텍스트를 채울 큰 파일), 빌드 산출물 dist/(위험 명령 브레이크가 지울 파일 수를 세는 대상)
cat > CLAUDE.md <<'MD'
# shop-api 작업 규칙

- 런타임은 Node 22, 프레임워크는 Hono. 새 라우트는 `src/routes/`에 둔다.
- 입력 검증은 zod 스키마로 하고, 에러 응답은 `{ error: string }` 모양을 지킨다.
- 재고를 바꾸는 코드는 `src/lib/stock.ts`만 거친다.
- 테스트는 vitest. 라우트를 고치면 같은 이름의 `*.test.ts`도 함께 고친다.
- 커밋 메시지는 한국어로, `feat(orders): ...`처럼 범위를 붙인다.
MD
mkdir -p .claude/agents .claude/skills/release-notes src/data
cat > .claude/agents/code-reviewer.md <<'MD'
---
name: code-reviewer
description: 라우트·재고 로직 변경을 리뷰한다. zod 검증 누락, 재고 차감·복구 짝 맞춤, 에러 응답 모양({ error }), 409/404 상태 코드, 테스트 누락을 확인하고 심각도 순으로 보고한다. PR을 올리기 전이나 큰 수정 뒤에 쓴다.
tools: Read, Grep, Glob
---
변경된 파일을 읽고 위 기준으로 문제를 찾는다. 고치지 말고 보고만 한다.
MD
cat > .claude/agents/test-writer.md <<'MD'
---
name: test-writer
description: vitest로 라우트 테스트를 작성한다. 주문 생성·조회·취소의 정상 경로와 재고 부족, 이미 결제된 주문 취소(409), 없는 주문(404) 같은 실패 경로를 모두 다룬다. 라우트를 새로 만들거나 고친 뒤에 쓴다.
tools: Read, Write, Edit, Bash
---
대상 라우트를 읽고 같은 이름의 *.test.ts를 만든다. 실행해서 통과를 확인한다.
MD
cat > .claude/skills/release-notes/SKILL.md <<'MD'
---
name: release-notes
description: 최근 커밋과 변경 파일을 읽어 한국어 릴리스 노트(추가·수정·주의할 점)를 만든다. 버전 태그를 붙이기 전에 쓴다.
---
git log로 지난 태그 이후 커밋을 모아 사용자 관점의 변화만 골라 적는다.
MD
python3 - <<'PY'
import json, random
random.seed(7)
cats = ['tee', 'hoodie', 'mug', 'cap', 'sticker', 'bag', 'socks', 'poster']
colors = ['black', 'white', 'navy', 'grey', 'green', 'pink', 'beige']
sizes = ['xs', 's', 'm', 'l', 'xl']
items = []
for i in range(420):
    c = random.choice(cats)
    items.append({
        'sku': f'{c}-{random.choice(colors)}-{random.choice(sizes)}-{i:04d}',
        'name': f'{c.title()} #{i}',
        'category': c,
        'price': random.choice([4900, 9900, 12900, 19900, 29900, 39900, 59900]),
        'stock': random.randint(0, 120),
        'tags': random.sample(['new', 'sale', 'limited', 'bestseller', 'eco', 'collab'], 2),
    })
with open('src/data/products.jsonl', 'w') as f:
    for it in items:
        f.write(json.dumps(it, ensure_ascii=False) + '\n')
random.seed(11)
with open('src/data/orders-2026-09.jsonl', 'w') as f:
    for i in range(420):
        it = random.choice(items)
        f.write(json.dumps({
            'id': f'ord_{i:05d}', 'sku': it['sku'], 'quantity': random.randint(1, 4),
            'status': random.choice(['paid', 'paid', 'paid', 'pending', 'cancelled']),
            'createdAt': f'2026-09-{random.randint(1, 30):02d}T{random.randint(0, 23):02d}:{random.randint(0, 59):02d}:00+09:00',
        }, ensure_ascii=False) + '\n')
PY
printf 'dist/\nnode_modules/\n' > .gitignore
git init -q && git add -A && git -c user.name=demo -c user.email=demo@example.com commit -q -m "init" && git checkout -q -b feat/order-cancel
python3 - <<'PY'
import os
files = [('dist/server.js', 3200), ('dist/routes/orders.js', 3200), ('dist/lib/stock.js', 3200),
         ('dist/server.js.map', 12000), ('dist/routes/orders.js.map', 12000), ('dist/lib/stock.js.map', 12000)]
files += [(f'dist/assets/chunk-{i}.js', 16000) for i in range(1, 19)]
for path, size in files:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    line = f'/* {path} */ export const x = 1;\n'
    with open(path, 'w') as f:
        f.write((line * (size // len(line) + 1))[:size])
PY
echo "$DIR"
