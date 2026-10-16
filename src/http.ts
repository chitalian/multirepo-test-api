import type { IncomingMessage, ServerResponse } from 'node:http'

export type Request = {
  params: Record<string, string>
  query: URLSearchParams
  body: unknown
}

export type Handler = (req: Request) => Promise<{ status: number; body: unknown }>

export type Route = { method: string; path: string; handler: Handler }

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

export function match(route: Route, method: string, pathname: string): Record<string, string> | null {
  if (route.method !== method) return null
  const want = route.path.split('/')
  const got = pathname.split('/')
  if (want.length !== got.length) return null
  const params: Record<string, string> = {}
  for (let i = 0; i < want.length; i++) {
    if (want[i].startsWith(':')) params[want[i].slice(1)] = decodeURIComponent(got[i])
    else if (want[i] !== got[i]) return null
  }
  return params
}

export async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  if (chunks.length === 0) return undefined
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

export function send(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'content-type': 'application/json' })
  res.end(JSON.stringify(body))
}
