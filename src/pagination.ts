import { HttpError, type Request } from './http.js'
import type { Page } from './types.js'

export const DEFAULT_LIMIT = 20
export const MAX_LIMIT = 100

export function readLimit(req: Request): number {
  const raw = req.query.get('limit')
  if (raw === null) return DEFAULT_LIMIT
  const limit = Number(raw)
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    throw new HttpError(400, `limit must be an integer from 1 to ${MAX_LIMIT}`)
  }
  return limit
}

export function paginate<T extends { id: string }>(items: T[], req: Request): Page<T> {
  const limit = readLimit(req)
  const cursor = req.query.get('cursor')
  const start = cursor ? items.findIndex((item) => item.id === cursor) + 1 : 0
  const data = items.slice(start, start + limit)
  const nextCursor = start + limit < items.length ? data[data.length - 1].id : null
  return { data, nextCursor }
}
