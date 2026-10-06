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
git init -q && git add -A && git -c user.name=demo -c user.email=demo@example.com commit -q -m "init" && git checkout -q -b feat/order-cancel
echo "$DIR"
