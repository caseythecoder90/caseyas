// The one place the SPA talks to the api.
//
// Auth is a session cookie set by the api after the Keycloak redirect dance.
// A 401 means "not signed in": send the browser to the api's OAuth2 entry
// point and let it come back. There is deliberately no token handling here.

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export type Me = {
  id: string
  username: string
  displayName: string
}

export const LOGIN_PATH = '/oauth2/authorization/keycloak'

export function csrfToken(): string | undefined {
  const raw = document.cookie
    .split('; ')
    .find((c) => c.startsWith('XSRF-TOKEN='))
    ?.slice('XSRF-TOKEN='.length)
  return raw ? decodeURIComponent(raw) : undefined
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  const method = (init.method ?? 'GET').toUpperCase()
  if (method !== 'GET' && method !== 'HEAD') {
    const token = csrfToken()
    if (token) headers.set('X-XSRF-TOKEN', token)
    if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(path, { ...init, method, headers, credentials: 'same-origin' })

  if (res.status === 401) {
    window.location.assign(LOGIN_PATH)
    throw new ApiError(401, 'Not signed in')
  }
  if (!res.ok) throw new ApiError(res.status, await res.text())
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}
