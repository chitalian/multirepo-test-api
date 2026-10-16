import { createServer } from 'node:http'
import { HttpError, match, readJson, send, type Route } from './http.js'
import { orderRoutes } from './routes/orders.js'
import { userRoutes } from './routes/users.js'

const routes: Route[] = [...userRoutes, ...orderRoutes]
const API_KEY = process.env.ACME_API_KEY ?? 'sk_test_123'

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost')
  try {
    if (req.headers.authorization !== `Bearer ${API_KEY}`) throw new HttpError(401, 'Missing or invalid bearer token')
    for (const route of routes) {
      const params = match(route, req.method ?? 'GET', url.pathname)
      if (!params) continue
      const result = await route.handler({ params, query: url.searchParams, body: await readJson(req) })
      return send(res, result.status, result.body)
    }
    throw new HttpError(404, `No route for ${req.method} ${url.pathname}`)
  } catch (err) {
    if (err instanceof HttpError) return send(res, err.status, { error: err.message })
    console.error(err)
    return send(res, 500, { error: 'Internal error' })
  }
})

server.listen(Number(process.env.PORT ?? 3000))
