// Data types for the mock datasets (design/spec/mock-data.md section 20) plus
// the few shapes the shell and hooks add on top.

export type Person = 'Casey' | 'Yasmim'
export type Owner = 'c' | 'h' | 'b' // Casey, her, both
export type Initial = 'C' | 'Y'

export type MemoryType = 'Trip' | 'Date night' | 'Everyday' | 'Milestone'
export type MemorySize = 'large' | 'medium' | 'compact'
export type MemoryFilter = 'All' | 'Trips' | 'Date nights' | 'Everyday' | 'Milestones' | 'Videos'
export type TimelineLayout = 'editorial' | 'grid' | 'journal'

export interface Memory {
  id: number
  title: string
  date: string // 'Aug 14–17, 2026'
  day: string // '14'
  mon: string // 'Aug'
  loc: string
  type: MemoryType
  by: Person
  ex: string // excerpt
  exLong?: string // desktop large card
  count: string // '38 photos · 2 videos'
  size: MemorySize
  seed: string // mock-image seed of `img` ('asheville'); detail gallery derives from it
  img: string
  img2: string // '' when none
  month: string // 'August 2026' or ''
  showMonth: boolean
  more: string // '+36' or ''
}

export interface MemoryDetail {
  take1a: string
  quote: string
  take1b: string
  inline: string
  inlineCap: string
  take2: string
}

export interface MemoryComment {
  by: Person
  text: string
  when: string
}

export interface GalleryTile {
  src: string
  span: 1 | 2
  video?: boolean
  dur?: string
}
export interface PhotoTile {
  id: string
  src: string
  video: boolean
  dur: string
  fav: boolean
  byHer: boolean
}
export interface GalleryMonth {
  label: string
  count: number
  key: string
}
export interface Album {
  name: string
  count: string
  src: string
  memId?: number
}
export type GalleryFilter = 'All' | 'Photos' | 'Videos' | 'Favorites' | 'Casey' | 'Yasmim'
export type GallerySeg = 'photos' | 'albums'

export type MessageType = 'text' | 'photo' | 'photos' | 'voice' | 'memory' | 'link' | 'planitem'
export interface ChatMessage {
  id: number
  from: 'me' | 'h'
  type: MessageType
  time: string // '9:38 PM' | 'Seen 9:42 PM' | 'Delivered'
  text?: string
  img?: string
  imgs?: { src: string }[]
  dur?: string
  title?: string
  sub?: string
  memId?: number
  url?: string
  domain?: string
  kind?: ItemKind
}
export interface PinnedMessage {
  text: string
  by: Person
  when: string
}
export type ChatSeg = 'msgs' | 'notes'

export type NoteColor = 'n1' | 'n2' | 'n3' | 'n4'
export interface FridgeNote {
  body: string
  color: NoteColor
  from: Person
  time: string // 'This morning' | 'Yesterday' | 'Aug 30' | 'Scheduled' | 'Just now'
  span: 1 | 2
  hasPhoto?: boolean
  photo?: string
  scheduled?: boolean
  when?: string // 'Appears Oct 3, 7:00 AM'
}

export type BlockType = 'h' | 'p' | 'list' | 'q' | 'img'
export interface ComposerBlock {
  type: BlockType
  text?: string
  color?: string
  items?: string[]
  src?: string
  cap?: string
}
export interface ToolbarTool {
  label: string
  font: string
  weight: 400 | 500 | 600
  style: 'normal' | 'italic'
}
export interface ComposerMediaTile {
  seed: string
  src: string
  cover: boolean
  uploading: boolean
  pct?: string
  cap?: string
}

export type EventKind = 'Reminder' | 'Recurring' | 'Event' | 'All day'
export interface CalendarEvent {
  day: number // day of September 2026
  title: string
  kind: EventKind
  owner: Owner
  when: string // 'Tue Sep 8 · 2:30 PM'
  rule: string // 'Does not repeat' | 'Every second Thursday' | ...
  loc: string // '' -> 'No location'
  past?: boolean
}
export interface CalendarBlock {
  day: number
  title: string
  owner: Owner
  start?: number
  len?: number
  allDay?: boolean
}
export interface AgendaRow {
  day: string
  dow: string
  title: string
  sub: string
  dot: string
  right: string
  rightColor: string
  planId?: PlanId
  eventDay?: number
}
export interface PlanBar {
  bg: string
  label: string
  l: string
  r: string
  rad: string
}

// Real ids come from the server now; the mock ids ('japan', 'lake', ...) still satisfy it.
export type PlanId = string
export type PlanType = 'Trip' | 'Event'
export type PlanStatus = 'planning' | 'booked' | 'dreaming' | 'done' | 'underway'
export type PlanGroup = 'next' | 'dream' | 'past'
export type PlanSeg = 'overview' | 'itinerary' | 'ideas' | 'bookings' | 'lists' | 'budget' | 'docs' | 'map' | 'locked'
export interface Plan {
  id: PlanId
  name: string
  type: PlanType
  dates: string
  dest: string[]
  status: PlanStatus
  countdown: string // Sep 6, 2026 snapshot; hooks recompute from the date
  hints: string
  color: string // token var()
  cover: string
  group: PlanGroup
  large?: boolean
  start?: string // ISO yyyy-mm-dd when the plan has dates
  end?: string
}
export interface OverviewHero {
  num: string
  line: string
  kind: 'flight' | 'last' | 'reservation'
  title: string
  sub: string
  conf: string
}
export interface MoreItem {
  label: string
  key: PlanSeg
  meta: string
}

export type ItemKind = 'flight' | 'transport' | 'stay' | 'food' | 'activity' | 'ticket'
export interface ItineraryItem {
  /** server item id; absent on mock rows */
  id?: string
  kind: ItemKind
  time: string
  title: string
  place: string
  cost: string
  booked: boolean
  conf?: string
  docs: number
  by: Person
}
export interface ItineraryDay {
  n: number
  dow: string
  date: string
  city: string
  items: ItineraryItem[]
}
export interface UnscheduledItem {
  id?: string
  kind: ItemKind
  title: string
  place: string
  by: Person
}

export type Vote = 'like' | 'meh' | 'no'
export type IdeaStatus = 'idea' | 'shortlisted' | 'decided'
export type MapCity = 'Tokyo' | 'Hakuba' | 'Kyoto'
export type IdeaFilter = string
export interface Idea {
  id?: string
  title: string
  city: string
  by: Person
  status: IdeaStatus
  img: string
  c: Vote
  h: Vote
}

export type BookingKind = 'flight' | 'train' | 'bus' | 'stay' | 'ticket'
export type BookingGroup = 'Flights' | 'Stays' | 'Transport' | 'Tickets'
export interface Booking {
  id?: string
  group: BookingGroup
  kind: BookingKind
  title: string
  a?: string // route origin / ticket venue
  b?: string // route destination ('' for tickets)
  addr?: string // stays
  dep: string
  arr: string
  seats: string // seats, phone (stays) or guests (tickets)
  conf: string // '—' when none
  docs: number
  sub: string
}
export interface BookingKindRow {
  label: string
  abbr: string
  form: 'flight' | 'stay' | null
}
export interface PasteField {
  k: string
  v: string
  tag: 'ok' | 'check tz' | 'add'
  mono?: boolean
}
export type BookingForm = null | 'kinds' | 'flight' | 'stay' | 'paste'

export interface ChecklistItem {
  t: string
  who: Initial
  done: boolean
  due: string
}
export interface Checklist {
  name: string
  done: number
  total: number
  items: ChecklistItem[]
}

export interface Budget {
  planned: string
  committed: string
  paid: string
  plannedJpy: string
  committedJpy: string
  paidJpy: string
  rate: string
  rows: [category: string, amount: string, pct: number][]
}
export interface PlanDoc {
  id?: string
  name: string
  of: string
  pages: number
  /** presigned thumb URL for real documents */
  thumb?: string
}
export interface MapPin {
  kind: ItemKind
  title: string
  place: string
  when: string
  x: number
  y: number
}
export interface TodayItem {
  time: string
  kind: ItemKind
  title: string
  place: string
  conf?: string
  past?: boolean
  next?: boolean
}
export interface TodayHeader {
  eyebrow: string
  title: string
  sub: string
  next: string
}

export interface Stat {
  n: string
  l: string
}
export interface SecurityRow {
  t: string
  d: string
  r: string
  c: string
}
export type NotifKey = 'push' | 'email' | 'quiet'
export type PlanNotifKey = 'votes' | 'comments' | 'decisions' | 'bookings'
export type OptInKey = 'map' | 'paste'
export interface Prefs {
  notif: Record<NotifKey, boolean>
  planNotif: Record<PlanNotifKey, boolean>
  optIn: Record<OptInKey, boolean>
}
export interface NotifRow {
  key: NotifKey
  t: string
  d: string
}
export interface OptInRow {
  key: OptInKey
  t: string
  d: string
}

export type Sim = 'now' | 'during' | 'after'
export interface SimDateOption {
  key: Sim
  label: string
  date: string // ISO
}
export type Screen =
  | 'signin'
  | 'memories'
  | 'detail'
  | 'gallery'
  | 'composer'
  | 'plans'
  | 'plan'
  | 'today'
  | 'calendar'
  | 'chat'
  | 'us'
