import { randomUUID } from 'node:crypto'
import { HttpError, type Route } from '../http.js'
import { paginate } from '../pagination.js'
import { orders, prices, users } from '../store.js'
import type { Order, OrderItem, OrderStatus } from '../types.js'

const STATUSES: OrderStatus[] = ['pending', 'paid', 'shipped', 'cancelled']

function parseItems(value: unknown): OrderItem[] {
  if (!Array.isArray(value) || value.length === 0) throw new HttpError(400, 'items must be a non-empty array')
  return value.map((item, i) => {
    const { sku, quantity } = (item ?? {}) as Record<string, unknown>
    if (typeof sku !== 'string' || !(sku in prices)) throw new HttpError(400, `items[${i}].sku is not a known SKU`)
    if (!Number.isInteger(quantity) || (quantity as number) < 1) throw new HttpError(400, `items[${i}].quantity must be a positive integer`)
    return { sku, quantity: quantity as number }
  })
}

export const orderRoutes: Route[] = [
  {
    method: 'GET',
    path: '/v1/orders',
    handler: async (req) => {
      const status = req.query.get('status')
      if (status !== null && !STATUSES.includes(status as OrderStatus)) {
        throw new HttpError(400, `status must be one of ${STATUSES.join(', ')}`)
      }
      const matching = status ? orders.filter((o) => o.status === status) : orders
      return { status: 200, body: paginate(matching, req) }
    },
  },
  {
    method: 'GET',
    path: '/v1/orders/:id',
    handler: async (req) => {
      const order = orders.find((o) => o.id === req.params.id)
      if (!order) throw new HttpError(404, `Order ${req.params.id} not found`)
      return { status: 200, body: order }
    },
  },
  {
    method: 'POST',
    path: '/v1/orders',
    handler: async (req) => {
      const { userId, items } = (req.body ?? {}) as Record<string, unknown>
      if (typeof userId !== 'string' || !users.some((u) => u.id === userId)) throw new HttpError(400, 'userId must reference an existing user')
      const parsed = parseItems(items)
      const order: Order = {
        id: `ord_${randomUUID().slice(0, 8)}`,
        userId,
        status: 'pending',
        items: parsed,
        totalCents: parsed.reduce((sum, item) => sum + prices[item.sku] * item.quantity, 0),
        createdAt: new Date().toISOString(),
        cancelledAt: null,
      }
      orders.push(order)
      return { status: 201, body: order }
    },
  },
  {
    method: 'POST',
    path: '/v1/orders/:id/cancel',
    handler: async (req) => {
      const order = orders.find((o) => o.id === req.params.id)
      if (!order) throw new HttpError(404, `Order ${req.params.id} not found`)
      if (order.status === 'shipped') throw new HttpError(409, 'Shipped orders cannot be cancelled')
      if (order.status !== 'cancelled') {
        order.status = 'cancelled'
        order.cancelledAt = new Date().toISOString()
      }
      return { status: 200, body: order }
    },
  },
]
