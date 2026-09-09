// Scheduling for one plan, backed by the real api: dragging out of the
// unscheduled tray or promoting an idea onto a day PATCHes the item
// (day + status 'decided') and lets the query refetch render the move.
// No local merged state survives here any more.

import { useCallback, useMemo, useState } from 'react'
import { usePlan, type PlanMutations } from '../../data/hooks'
import type { Idea, ItineraryDay, UnscheduledItem } from '../../data/types'

/** A tray row that remembers where it sits in the source list. */
export interface TrayItem extends UnscheduledItem {
  index: number
}

export interface PlanBoard {
  days: ItineraryDay[]
  unscheduled: TrayItem[]
  /** the ideas sitting in the desktop ideas tray */
  ideas: Idea[]
  /** move tray item `index` onto day `n` */
  scheduleUnscheduled: (index: number, dayN: number) => void
  /** put an idea on day `n` */
  scheduleIdea: (idea: Idea, dayN: number) => void
  /** true when nothing has been moved yet */
  pristine: boolean
  /** last scheduling failure, cleared on the next attempt */
  error: string | null
}

export function usePlanBoard(
  planId: string,
  days: ItineraryDay[],
  unscheduled: UnscheduledItem[],
  ideas: Idea[],
  m?: PlanMutations,
): PlanBoard {
  // Callers that predate the real api pass no mutations; fall back to the
  // plan's own (the query cache dedupes, so this costs nothing extra).
  const fallback = usePlan(planId)
  const mutations = m ?? fallback.m

  const [moved, setMoved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const schedule = useCallback(
    (itemId: string | undefined, dayN: number) => {
      if (!itemId) return
      setMoved(true)
      setError(null)
      mutations.updateItem(itemId, { day: dayN, status: 'decided' }).catch(() => {
        setError('Could not put that on a day. Try again.')
      })
    },
    [mutations],
  )

  const scheduleUnscheduled = useCallback(
    (index: number, dayN: number) => schedule(unscheduled[index]?.id, dayN),
    [schedule, unscheduled],
  )

  const scheduleIdea = useCallback((idea: Idea, dayN: number) => schedule(idea.id, dayN), [schedule])

  const tray = useMemo<TrayItem[]>(() => unscheduled.map((u, index) => ({ ...u, index })), [unscheduled])

  return {
    days,
    unscheduled: tray,
    ideas,
    scheduleUnscheduled,
    scheduleIdea,
    pristine: !moved,
    error,
  }
}

/** dataTransfer `text/plain` payload prefixes, shared by both drag sources. */
export const TRAY_PREFIX = 'tray:'
export const IDEA_PREFIX = 'idea:'
