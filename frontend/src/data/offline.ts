// Per-plan offline copies (architecture section 7): a bundle plus the budget in
// localStorage, read when the network is away. Read-only in this milestone;
// document bytes still need their presigned URLs, so covers are best-effort.

import type { ServerBudget, ServerBundle } from './api/plansApi'

const KEY = (planId: string) => `ours.offline.${planId}`

export interface OfflineCopy {
  at: number
  bundle: ServerBundle
  budget?: ServerBudget
}

export function loadOffline(planId: string): OfflineCopy | null {
  try {
    const raw = localStorage.getItem(KEY(planId))
    return raw ? (JSON.parse(raw) as OfflineCopy) : null
  } catch {
    return null
  }
}

export function saveOffline(planId: string, bundle: ServerBundle, budget?: ServerBudget): void {
  try {
    localStorage.setItem(KEY(planId), JSON.stringify({ at: Date.now(), bundle, budget }))
  } catch {
    // storage full or blocked: the toggle just won't stick
  }
}

export function clearOffline(planId: string): void {
  try {
    localStorage.removeItem(KEY(planId))
  } catch {
    // ignore
  }
}

export function isOfflineEnabled(planId: string): boolean {
  return loadOffline(planId) != null
}

/** 'just now' | 'saved 2h ago' | 'saved 3d ago' */
export function savedAgo(at: number): string {
  const minutes = Math.round((Date.now() - at) / 60_000)
  if (minutes < 2) return 'saved just now'
  if (minutes < 60) return `saved ${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 48) return `saved ${hours}h ago`
  return `saved ${Math.round(hours / 24)}d ago`
}
