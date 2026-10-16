import { HttpError, type Route } from '../http.js'
import { paginate } from '../pagination.js'
import { users } from '../store.js'

export const userRoutes: Route[] = [
  {
    method: 'GET',
    path: '/v1/users',
    handler: async (req) => ({ status: 200, body: paginate(users, req) }),
  },
  {
    method: 'GET',
    path: '/v1/users/:id',
    handler: async (req) => {
      const user = users.find((u) => u.id === req.params.id)
      if (!user) throw new HttpError(404, `User ${req.params.id} not found`)
      return { status: 200, body: user }
    },
  },
]
