// Where the Security card's account-console hand-off points: Keycloak's account
// console (identity-pages.md screen 9 — "account console, Security; app links
// here from Us"). The api owns the address, so the SPA asks for it once:
// GET /api/config -> accountUrl. Until that resolves (or if it fails) there is
// no URL and the card renders as the five static rows the design specifies —
// no dev host is compiled into the bundle.

import { useQuery } from '@tanstack/react-query'
import { api } from '../../api'

/** Local override for `npm run dev` against a local realm; unset in builds. */
const ENV_ACCOUNT_URL: unknown = import.meta.env.VITE_ACCOUNT_URL

export interface AppConfig {
  /** absolute URL of the Keycloak account console */
  accountUrl?: string
}

/** The account-console URL, or undefined while it is unknown. */
export function useAccountUrl(): string | undefined {
  const { data } = useQuery({
    queryKey: ['config'],
    queryFn: () => api<AppConfig>('/api/config'),
    staleTime: Infinity,
    retry: false,
  })
  const fromApi = typeof data?.accountUrl === 'string' ? data.accountUrl.trim() : ''
  const fromEnv = typeof ENV_ACCOUNT_URL === 'string' ? ENV_ACCOUNT_URL.trim() : ''
  return fromApi || fromEnv || undefined
}
