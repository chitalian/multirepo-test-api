import type { Order, User } from './types.js'

export const users: User[] = [
  { id: 'usr_1', email: 'ada@example.com', name: 'Ada Lovelace', createdAt: '2026-01-04T10:00:00Z' },
  { id: 'usr_2', email: 'alan@example.com', name: 'Alan Turing', createdAt: '2026-02-11T15:30:00Z' },
]

export const orders: Order[] = [
  {
    id: 'ord_1',
    userId: 'usr_1',
    status: 'paid',
    items: [{ sku: 'WIDGET-1', quantity: 2 }],
    totalCents: 4000,
    createdAt: '2026-03-01T09:00:00Z',
  },
]

export const prices: Record<string, number> = {
  'WIDGET-1': 2000,
  'GADGET-7': 4999,
}
