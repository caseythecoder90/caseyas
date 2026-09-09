// Typed data accessors. As of milestone 2 the Plans feature reads and writes the
// real api through TanStack Query; everything else still serves the mock data
// and moves over in milestones 3-5. Screens only ever import from here.

import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { initialFor } from '../people'
import { paths } from '../paths'
import { dotFor } from '../ui/tokens'
import type {
  CreateItemInput,
  CreatePlanInput,
  ReorderEntry,
  ServerBundle,
  ServerItem,
  ServerMedia,
  ServerPlan,
  ServerVote,
  UpdateItemInput,
} from './api/plansApi'
import { plansApi, uploadFile } from './api/plansApi'
import { ANNIVERSARY, JAPAN_START, LAKE_START, SIM_OPTIONS, countdown, daysUntil, parseISO, realToday, simFor } from './dates'
import {
  AGENDA_EVENT_DAYS,
  AGENDA_EXTRA,
  AUTO_ALBUMS,
  CALENDAR_LEGEND,
  CALENDAR_MONTH,
  CAPS,
  CHAT_MEDIA,
  CHAT_UNREAD,
  CUSTOM_ALBUMS,
  DETAIL_COMMENTS,
  DETAIL_INLINE_DESKTOP,
  EV,
  EVENTS,
  EVENT_MORE_KEYS,
  EVENT_SEGS,
  GAL_FILTERS,
  MEM,
  MEMORY_FILTERS,
  MEMORY_PLAN,
  MORE_ITEMS,
  NOTES,
  NOTE_COLORS,
  NOTE_SCHEDULE_WHEN,
  NOTIF_ROWS,
  ON_THIS_DAY,
  OPT_INS,
  PINNED,
  PLAN_BARS,
  PLAN_GROUPS,
  PLAN_NOTIF_CHIPS,
  REACTIONS,
  SEALED_NOTE,
  SECURITY,
  STATS,
  TODAY_HEADER,
  TRIP_MORE_KEYS,
  TRIP_SEGS,
  TYPING_MS,
  WAVE,
  WAVE_PLAYED,
  WEEK,
  YESTERDAY_MESSAGE,
  agendaSortKey,
  baseMessages,
  detailFor,
  detailGallery,
  filterMemories,
  filterTiles,
  findMemory,
  galleryMonths,
  withShowMonth,
} from './mock'
import { clearOffline, isOfflineEnabled, loadOffline, saveOffline, savedAgo } from './offline'
import {
  bundleCounts,
  fmtDateTime,
  toBookings,
  toBudget,
  toChecklists,
  toDays,
  toDocs,
  toIdeas,
  toPins,
  toPlanCard,
  toTodayItems,
  toUnscheduled,
  tripDayOf,
  tripLength,
} from './planViews'
import { setState, useStore } from './store'
import type {
  AgendaRow,
  Budget,
  ChatMessage,
  FridgeNote,
  GalleryFilter,
  Idea,
  IdeaFilter,
  MoreItem,
  NoteColor,
  NotifKey,
  OptInKey,
  OverviewHero,
  Plan,
  PlanId,
  PlanNotifKey,
  PlanStatus,
  Sim,
  TimelineLayout,
  TodayHeader,
} from './types'

export type { ChecklistItemView, ChecklistView } from './planViews'
export type { LinkPreview, ServerItem, ServerMedia } from './api/plansApi'

// ---------------------------------------------------------------- dates

/** The simulated date (ISO) or null for the real clock, plus its setter. */
export function useSimDate(): [string | null, (iso: string | null) => void] {
  const simDate = useStore((s) => s.simDate)
  const set = useCallback((iso: string | null) => setState({ simDate: iso }), [])
  return [simDate, set]
}

/** "Today": the simulated date when set, else the real date (local midnight). */
export function useToday(): Date {
  const simDate = useStore((s) => s.simDate)
  return useMemo(() => (simDate ? parseISO(simDate) : realToday()), [simDate])
}

/** Where today sits relative to the Japan trip: now | during | after. */
export function useSim(): Sim {
  return simFor(useToday())
}

// ---------------------------------------------------------------- plans (real api)

export interface PlanView extends Plan {
  status: PlanStatus
  countdown: string
  /** where tapping the card goes: the Today screen while a trip is underway */
  openPath: string
  small: boolean
}

function decorate(card: Plan): PlanView {
  const openPath = card.status === 'underway' ? paths.today(card.id) : paths.plan(card.id)
  return { ...card, openPath, small: !card.large }
}

/** Bundle fetch with the offline copy as the fallback and the refresh target. */
async function fetchBundle(id: string): Promise<ServerBundle> {
  try {
    const bundle = await plansApi.bundle(id)
    if (isOfflineEnabled(id)) saveOffline(id, bundle, loadOffline(id)?.budget)
    return bundle
  } catch (e) {
    const cached = loadOffline(id)
    if (cached) return cached.bundle
    throw e
  }
}

async function fetchBudget(id: string) {
  try {
    const budget = await plansApi.budget(id)
    const cached = loadOffline(id)
    if (cached) saveOffline(id, cached.bundle, budget)
    return budget
  } catch (e) {
    const cached = loadOffline(id)
    if (cached?.budget) return cached.budget
    throw e
  }
}

export interface ActiveTrip {
  id: string
  name: string
  day: number
  length: number
}

export function usePlans() {
  const today = useToday()
  const qc = useQueryClient()
  const listQ = useQuery({ queryKey: ['plans'], queryFn: plansApi.list, staleTime: 10_000 })
  const serverPlans = listQ.data ?? []
  const bundleQs = useQueries({
    queries: serverPlans.map((p) => ({
      queryKey: ['plan-bundle', p.id],
      queryFn: () => fetchBundle(p.id),
      staleTime: 10_000,
    })),
  })

  // A stable-size dependency: spread deps change length as bundles load, which
  // React forbids. dataUpdatedAt bumps whenever any bundle refetches.
  const bundlesStamp = bundleQs.map((q) => q.dataUpdatedAt ?? 0).join('|')
  const plans = useMemo(
    () =>
      serverPlans.map((p, i) => {
        const bundle = bundleQs[i]?.data
        return decorate(toPlanCard(p, bundle ? bundleCounts(bundle) : undefined, today))
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [serverPlans, today, bundlesStamp],
  )

  const groups = useMemo(
    () => PLAN_GROUPS.map(([label, key]) => ({ label, key, items: plans.filter((p) => p.group === key) })),
    [plans],
  )

  const activeTrip = useMemo<ActiveTrip | null>(() => {
    const trip = serverPlans.find((p) => p.type === 'trip' && tripDayOf(p, today) != null)
    return trip ? { id: trip.id, name: trip.name, day: tripDayOf(trip, today)!, length: tripLength(trip) } : null
  }, [serverPlans, today])

  const createPlan = useCallback(
    async (input: CreatePlanInput): Promise<ServerPlan> => {
      const created = await plansApi.createPlan(input)
      await qc.invalidateQueries({ queryKey: ['plans'] })
      return created
    },
    [qc],
  )

  const sim = simFor(today)
  return {
    plans,
    groups,
    sim,
    duringTrip: activeTrip != null,
    afterTrip: sim === 'after',
    today,
    activeTrip,
    loading: listQ.isPending,
    error: listQ.isError,
    createPlan,
  }
}

const EMPTY_BUDGET: Budget = { planned: '$0', committed: '$0', paid: '$0', plannedJpy: '', committedJpy: '', paidJpy: '', rate: '', rows: [] }

function skeletonPlan(id: string): PlanView {
  return {
    id,
    name: '',
    type: 'Trip',
    dates: '',
    dest: [],
    status: 'planning',
    countdown: '',
    hints: '',
    color: 'var(--accent)',
    cover: '',
    group: 'next',
    openPath: paths.plan(id),
    small: false,
  }
}

export interface PlanMutations {
  createItem: (input: CreateItemInput) => Promise<ServerItem>
  updateItem: (itemId: string, patch: UpdateItemInput) => Promise<ServerItem>
  deleteItem: (itemId: string) => Promise<void>
  vote: (itemId: string, vote: ServerVote | null) => Promise<void>
  comment: (itemId: string, text: string) => Promise<void>
  reorder: (entries: ReorderEntry[]) => Promise<void>
  /** key is '<listId>:<itemId>' from ChecklistItemView.key */
  tick: (key: string, done: boolean) => Promise<void>
  addListItem: (listId: string, text: string, assignee?: string, dueDate?: string) => Promise<void>
  setRate: (rate: number) => Promise<void>
  upload: (files: File[] | FileList) => Promise<ServerMedia[]>
  linkPreview: typeof plansApi.linkPreview
  refresh: () => Promise<void>
}

/** Everything the plan detail, today and desktop workspace screens need. */
export function usePlan(id: PlanId | string | undefined) {
  const today = useToday()
  const qc = useQueryClient()
  const pid = id ?? ''

  const bundleQ = useQuery({ queryKey: ['plan-bundle', pid], queryFn: () => fetchBundle(pid), enabled: !!pid, staleTime: 5_000 })
  const budgetQ = useQuery({ queryKey: ['plan-budget', pid], queryFn: () => fetchBudget(pid), enabled: !!pid, staleTime: 5_000 })
  const usersQ = useQuery({ queryKey: ['users'], queryFn: plansApi.users, staleTime: 300_000 })

  const bundle = bundleQ.data
  const users = usersQ.data ?? []
  const serverPlan = bundle?.plan
  const items = useMemo(() => bundle?.items ?? [], [bundle])
  const isEvent = serverPlan?.type === 'event'
  const sim = simFor(today)
  const tripDay = serverPlan ? tripDayOf(serverPlan, today) : null

  const refresh = useCallback(async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['plan-bundle', pid] }),
      qc.invalidateQueries({ queryKey: ['plan-budget', pid] }),
      qc.invalidateQueries({ queryKey: ['plans'] }),
    ])
  }, [qc, pid])

  const m = useMemo<PlanMutations>(
    () => ({
      createItem: async (input) => {
        const item = await plansApi.createItem(pid, input)
        void refresh()
        return item
      },
      updateItem: async (itemId, patch) => {
        const item = await plansApi.updateItem(pid, itemId, patch)
        void refresh()
        return item
      },
      deleteItem: async (itemId) => {
        await plansApi.deleteItem(pid, itemId)
        void refresh()
      },
      vote: async (itemId, vote) => {
        await plansApi.vote(pid, itemId, vote)
        void refresh()
      },
      comment: async (itemId, text) => {
        await plansApi.comment(pid, itemId, text)
        void refresh()
      },
      reorder: async (entries) => {
        await plansApi.reorder(pid, entries)
        void refresh()
      },
      tick: async (key, done) => {
        const [listId, itemId] = key.split(':')
        await plansApi.updateChecklistItem(pid, listId, itemId, { done })
        void refresh()
      },
      addListItem: async (listId, text, assignee, dueDate) => {
        await plansApi.addChecklistItem(pid, listId, text, assignee, dueDate)
        void refresh()
      },
      setRate: async (rate) => {
        await plansApi.updatePlan(pid, { rate })
        void refresh()
      },
      upload: async (files) => {
        const uploaded: ServerMedia[] = []
        for (const file of Array.from(files)) {
          uploaded.push(await uploadFile(file, pid))
        }
        void refresh()
        return uploaded
      },
      linkPreview: plansApi.linkPreview,
      refresh,
    }),
    [pid, refresh],
  )

  /** legacy signature kept for the checklist screens */
  const toggleTick = useCallback((key: string, currentlyDone: boolean) => void m.tick(key, !currentlyDone), [m])

  const views = useMemo(() => {
    if (!serverPlan) {
      return {
        plan: skeletonPlan(pid),
        days: [],
        unscheduled: [],
        ideas: [] as (Idea & { id: string })[],
        bookings: [],
        lists: [],
        docs: [],
        pins: {} as Record<string, import('./types').MapPin[]>,
        todayItems: [],
        itemNotes: {} as Record<string, string>,
        hero: null as OverviewHero | null,
      }
    }
    const counts = bundleCounts(bundle!)
    const itemNotes: Record<string, string> = {}
    for (const item of items) {
      const last = item.comments.at(-1)
      if (last) itemNotes[item.title] = last.text
    }
    return {
      plan: decorate(toPlanCard(serverPlan, counts, today)),
      days: toDays(serverPlan, items, users),
      unscheduled: toUnscheduled(items, users),
      ideas: toIdeas(items, users),
      bookings: toBookings(items),
      lists: toChecklists(bundle!.checklists, users),
      docs: toDocs(bundle!.media, items),
      pins: toPins(serverPlan, items),
      todayItems: toTodayItems(serverPlan, items, today, new Date()),
      itemNotes,
      hero: heroFor(serverPlan, items, today),
    }
  }, [serverPlan, bundle, items, users, today, pid])

  const ideaFilters = useMemo<IdeaFilter[]>(() => {
    const cities = [...new Set(views.ideas.map((i) => i.city).filter(Boolean))]
    return ['All', ...cities, 'Shortlisted', 'Decided']
  }, [views.ideas])

  const filterIdeas = useCallback(
    (ideas: Idea[], f: IdeaFilter): Idea[] =>
      f === 'All'
        ? ideas
        : f === 'Shortlisted'
          ? ideas.filter((i) => i.status === 'shortlisted')
          : f === 'Decided'
            ? ideas.filter((i) => i.status === 'decided')
            : ideas.filter((i) => i.city === f),
    [],
  )

  const budget = budgetQ.data ? toBudget(budgetQ.data) : EMPTY_BUDGET

  const pinCount = Object.values(views.pins).reduce((n, arr) => n + arr.length, 0)
  const moreItems = useMemo<MoreItem[]>(() => {
    const done = views.lists.reduce((n, l) => n + l.doneNow, 0)
    const total = views.lists.reduce((n, l) => n + l.total, 0)
    const meta: Record<string, string> = {
      lists: total ? `${done}/${total}` : 'empty',
      budget: budget.planned,
      docs: views.docs.length ? `${views.docs.length} files` : 'none yet',
      map: pinCount ? `${pinCount} pins` : 'no pins yet',
      locked: '',
    }
    return MORE_ITEMS.map((item) => ({ ...item, meta: meta[item.key] ?? item.meta }))
  }, [views.lists, views.docs.length, pinCount, budget.planned])

  const todayHeader = useMemo<TodayHeader>(() => {
    if (!serverPlan || tripDay == null) return TODAY_HEADER
    const next = views.todayItems.find((t) => t.next)
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return {
      eyebrow: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
      title: `Day ${tripDay} of ${tripLength(serverPlan)}`,
      sub: views.days.find((d) => d.n === tripDay)?.city ?? '',
      next: next ? `next · ${next.time}` : 'nothing timed today',
    }
  }, [serverPlan, tripDay, views.todayItems, views.days, today])

  const offlineEnabled = isOfflineEnabled(pid)
  const offline = useMemo(() => {
    const copy = loadOffline(pid)
    return {
      enabled: offlineEnabled,
      note: copy ? savedAgo(copy.at) : 'off',
      toggle: async () => {
        if (isOfflineEnabled(pid)) {
          clearOffline(pid)
        } else if (bundle) {
          saveOffline(pid, bundle, budgetQ.data)
        }
        await refresh()
      },
    }
  }, [pid, offlineEnabled, bundle, budgetQ.data, refresh])

  return {
    plan: views.plan,
    isEvent,
    sim,
    today,
    duringTrip: tripDay != null,
    afterTrip: !!serverPlan?.dateEnd && parseISO(serverPlan.dateEnd) < today && serverPlan.type === 'trip',
    tripDay,
    days: views.days,
    unscheduled: views.unscheduled,
    ideas: views.ideas,
    ideaFilters,
    filterIdeas,
    bookings: views.bookings,
    lists: views.lists,
    toggleTick,
    budget,
    docs: views.docs,
    pins: views.pins,
    hero: views.hero ?? FALLBACK_HERO,
    heroIsFallback: views.hero == null,
    itemNotes: views.itemNotes,
    moreItems,
    segs: isEvent ? EVENT_SEGS : TRIP_SEGS,
    moreKeys: isEvent ? EVENT_MORE_KEYS : TRIP_MORE_KEYS,
    todayHeader,
    todayItems: views.todayItems,
    loading: bundleQ.isPending,
    error: bundleQ.isError,
    notFound: !bundleQ.isPending && !bundle,
    offline,
    serverItems: items,
    m,
  }
}

const FALLBACK_HERO: OverviewHero = {
  num: '',
  line: 'days to go',
  kind: 'last',
  title: 'Nothing booked yet',
  sub: 'The first booking shows up here',
  conf: '',
}

function heroFor(plan: ServerPlan, items: ServerItem[], today: Date): OverviewHero | null {
  const todayIso = today.toISOString().slice(0, 10)
  const upcoming = items
    .filter((i) => (i.status === 'booked' || i.status === 'done') && i.start && i.start.slice(0, 10) >= todayIso)
    .sort((a, b) => a.start!.localeCompare(b.start!))[0]
  if (!upcoming) return null
  const day = tripDayOf(plan, today)
  const num = day != null ? String(day) : plan.dateStart ? String(Math.max(0, daysUntil(plan.dateStart, today))) : ''
  return {
    num,
    line: day != null ? `of ${tripLength(plan)} days` : 'days to go',
    kind: upcoming.kind === 'flight' ? 'flight' : 'reservation',
    title: upcoming.title,
    sub: fmtDateTime(upcoming.start),
    conf: upcoming.confirmation ?? '—',
  }
}

// ---------------------------------------------------------------- memories

export function useMemories() {
  const layout = useStore((s) => s.timelineLayout)
  const showOnThisDay = useStore((s) => s.showOnThisDay)
  const setLayout = useCallback((l: TimelineLayout) => setState({ timelineLayout: l }), [])
  const setShowOnThisDay = useCallback((v: boolean) => setState({ showOnThisDay: v }), [])
  return {
    memories: MEM,
    filters: MEMORY_FILTERS,
    filterMemories,
    withShowMonth,
    layout,
    setLayout,
    showOnThisDay,
    setShowOnThisDay,
    onThisDay: ON_THIS_DAY,
  }
}

const NO_FAVS: number[] = []

export function useMemory(id: number | string | undefined, variant: 'mobile' | 'desktop' = 'mobile') {
  const memory = findMemory(id)
  const reactions = useStore((s) => s.reactions)
  const favsAll = useStore((s) => s.favs)
  const reacted = reactions[memory.id] ?? ''
  const favs = favsAll[memory.id] ?? NO_FAVS
  const gallery = useMemo(() => detailGallery(memory, variant), [memory, variant])
  const setReacted = useCallback(
    (label: string) =>
      setState((s) => ({ reactions: { ...s.reactions, [memory.id]: (s.reactions[memory.id] ?? '') === label ? '' : label } })),
    [memory.id],
  )
  const toggleFav = useCallback(
    (index: number) =>
      setState((s) => {
        const cur = s.favs[memory.id] ?? []
        return { favs: { ...s.favs, [memory.id]: cur.includes(index) ? cur.filter((x) => x !== index) : [...cur, index] } }
      }),
    [memory.id],
  )
  const reactionCounts = useMemo(
    () => REACTIONS.map(([label, n]) => ({ label, n: n + (reacted === label ? 1 : 0), on: reacted === label })),
    [reacted],
  )
  const plan = MEMORY_PLAN[memory.id]
  return {
    memory,
    detail: detailFor(memory.id),
    inlineDesktop: DETAIL_INLINE_DESKTOP[memory.id] ?? DETAIL_INLINE_DESKTOP.default,
    gallery,
    caps: CAPS,
    comments: DETAIL_COMMENTS,
    reacted,
    setReacted,
    reactions: reactionCounts,
    favs,
    toggleFav,
    hasPlan: !!plan,
    planId: plan?.planId,
    planName: plan?.name,
    /** author's initial for the take signature */
    ini: initialFor(memory.by),
  }
}

// ---------------------------------------------------------------- gallery

export function useGallery() {
  const deleted = useStore((s) => s.deletedTiles)
  const months = useMemo(() => galleryMonths(), [])
  const deleteTiles = useCallback((ids: string[]) => setState((s) => ({ deletedTiles: [...s.deletedTiles, ...ids] })), [])
  /** months with the filter and this session's deletions applied; count label per month */
  const monthsFor = useCallback(
    (filter: GalleryFilter) =>
      months.map((m) => {
        const tiles = filterTiles(m.tiles, filter, deleted)
        return { ...m, tiles, countLabel: tiles.length + ' items' }
      }),
    [months, deleted],
  )
  return { months, monthsFor, deleted, deleteTiles, filters: GAL_FILTERS, customAlbums: CUSTOM_ALBUMS, autoAlbums: AUTO_ALBUMS }
}

// ---------------------------------------------------------------- chat + notes

let typingTimer: ReturnType<typeof setTimeout> | undefined
function scheduleTypingOff() {
  clearTimeout(typingTimer)
  typingTimer = setTimeout(() => setState({ typing: false }), TYPING_MS)
}

export function useChat(variant: 'mobile' | 'desktop' = 'mobile') {
  const sent = useStore((s) => s.sent)
  const typing = useStore((s) => s.typing)
  const sealedDone = useStore((s) => s.sealedDone)
  const base = useMemo(() => baseMessages(variant), [variant])
  const messages = useMemo<ChatMessage[]>(() => [...base, ...sent], [base, sent])
  const send = useCallback((text: string): boolean => {
    if (!text.trim()) return false
    setState((s) => ({ sent: [...s.sent, { id: Date.now(), from: 'me', type: 'text', text, time: 'Delivered' }], typing: true }))
    scheduleTypingOff()
    return true
  }, [])
  const sharePhoto = useCallback((img: string) => {
    setState((s) => ({ sent: [...s.sent, { id: Date.now(), from: 'me', type: 'photo', img, time: 'Delivered' }] }))
  }, [])
  const notesUnread = sealedDone ? 0 : 1
  return {
    messages,
    send,
    sharePhoto,
    typing,
    sealedDone,
    /** desktop Chat badge */
    chatUnread: CHAT_UNREAD,
    /** desktop Notes badge */
    notesUnread,
    /** mobile Chat tab badge (messages + notes): 3, then 2 once the sealed note is opened */
    badge: CHAT_UNREAD + notesUnread,
    pinned: PINNED,
    media: CHAT_MEDIA,
    wave: WAVE,
    wavePlayed: WAVE_PLAYED,
    yesterday: YESTERDAY_MESSAGE,
  }
}

export interface LeaveNoteInput {
  body: string
  color: NoteColor
  sched: boolean
  /** only changes the button label in the prototype; kept for parity */
  seal?: boolean
}

export function useNotes() {
  const added = useStore((s) => s.addedNotes)
  const sealedDone = useStore((s) => s.sealedDone)
  const notes = useMemo<FridgeNote[]>(() => [...added, ...NOTES], [added])
  const leaveNote = useCallback((input: LeaveNoteInput): boolean => {
    if (!input.body.trim()) return false
    const note: FridgeNote = {
      body: input.body,
      color: input.color,
      from: 'Casey',
      time: input.sched ? 'Scheduled' : 'Just now',
      span: 1,
      scheduled: input.sched,
      when: NOTE_SCHEDULE_WHEN,
    }
    setState((s) => ({ addedNotes: [note, ...s.addedNotes] }))
    return true
  }, [])
  const openSealed = useCallback(() => setState({ sealedDone: true }), [])
  return { notes, leaveNote, hasUnopened: !sealedDone, sealedDone, openSealed, colors: NOTE_COLORS, sealed: SEALED_NOTE }
}

// ---------------------------------------------------------------- calendar

export function useEvents() {
  const today = useToday()
  const agenda = useMemo<AgendaRow[]>(() => {
    const eventRows: AgendaRow[] = AGENDA_EVENT_DAYS.map((n) => {
      const e = EVENTS[n]
      const hasTime = e.when.includes('· ')
      const timePart = hasTime ? e.when.split('· ')[1] : ''
      const sub = hasTime ? timePart + (e.rule.startsWith('Every') ? ' · ' + e.rule : '') : e.when
      return { day: String(n), dow: e.when.slice(0, 3), title: e.title, sub, dot: dotFor(e.owner), right: e.loc, rightColor: 'var(--fg3)', eventDay: n }
    })
    const fixed = AGENDA_EXTRA.map((r) => ({
      ...r,
      right: r.planId === 'lake' ? countdown(LAKE_START, today) : r.planId === 'japan' ? countdown(JAPAN_START, today) : countdown(ANNIVERSARY, today),
    }))
    return [...eventRows, ...fixed].sort((a, b) => agendaSortKey(a) - agendaSortKey(b))
  }, [today])
  return { events: EVENTS, blocks: EV, planBars: PLAN_BARS, agenda, month: CALENDAR_MONTH, week: WEEK, legend: CALENDAR_LEGEND, today }
}

// ---------------------------------------------------------------- preferences (Us)

export function usePreferences() {
  const prefs = useStore((s) => s.prefs)
  const [simDate, setSimDate] = useSimDate()
  const toggleNotif = useCallback((k: NotifKey) => setState((s) => ({ prefs: { ...s.prefs, notif: { ...s.prefs.notif, [k]: !s.prefs.notif[k] } } })), [])
  const togglePlanNotif = useCallback(
    (k: PlanNotifKey) => setState((s) => ({ prefs: { ...s.prefs, planNotif: { ...s.prefs.planNotif, [k]: !s.prefs.planNotif[k] } } })),
    [],
  )
  const toggleOptIn = useCallback((k: OptInKey) => setState((s) => ({ prefs: { ...s.prefs, optIn: { ...s.prefs.optIn, [k]: !s.prefs.optIn[k] } } })), [])
  return {
    prefs,
    toggleNotif,
    togglePlanNotif,
    toggleOptIn,
    notifRows: NOTIF_ROWS,
    planNotifChips: PLAN_NOTIF_CHIPS,
    optIns: OPT_INS,
    stats: STATS,
    security: SECURITY,
    /** dev tweak: null = real clock */
    simDate,
    setSimDate,
    simOptions: SIM_OPTIONS,
  }
}
