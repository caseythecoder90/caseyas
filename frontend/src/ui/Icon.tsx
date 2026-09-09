// tokens-and-components.md section 9: Lucide outline, 1.5px stroke,
// currentColor, 16-20px. KindIcon maps the item kinds; Icon covers the other
// icons the prototypes use (tab bar, FAB, headers).

import {
  BedSingle,
  Bus,
  Calendar,
  Camera,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Heart,
  Image as ImageIcon,
  LayoutGrid,
  Lightbulb,
  Lock,
  Map as MapIcon,
  MapPin,
  MessageCircle,
  Mic,
  Mountain,
  Plane,
  Play,
  Plus,
  Search,
  Send,
  Ticket,
  TramFront,
  Trash2,
  Users,
  Utensils,
  X,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react'
import type { BookingKind, ItemKind } from '../data/types'

/** The nine design kinds plus the app's bus/train/transport aliases. */
export type IconKind = ItemKind | BookingKind | 'car' | 'idea' | 'note'

export const KIND_ICON: Record<IconKind, LucideIcon> = {
  flight: Plane,
  stay: BedSingle,
  transport: TramFront,
  train: TramFront,
  bus: Bus,
  car: Car,
  activity: Mountain,
  food: Utensils,
  ticket: Ticket,
  idea: Lightbulb,
  note: FileText,
}

/** Mono abbreviation fallback where an icon would be too small (itinerary rows, chat cards). */
export const KIND_ABBR: Record<IconKind, string> = {
  flight: 'FLT',
  stay: 'STY',
  transport: 'TRN',
  train: 'TRN',
  bus: 'BUS',
  car: 'CAR',
  activity: 'ACT',
  food: 'EAT',
  ticket: 'TKT',
  idea: 'IDEA',
  note: 'NOTE',
}

export const KIND_LABEL: Record<IconKind, string> = {
  flight: 'Flight',
  stay: 'Stay',
  transport: 'Transport',
  train: 'Train',
  bus: 'Bus',
  car: 'Car',
  activity: 'Activity',
  food: 'Food',
  ticket: 'Ticket',
  idea: 'Idea',
  note: 'Note',
}

export interface KindIconProps extends Omit<LucideProps, 'ref'> {
  kind: IconKind
  size?: number
}

export function KindIcon({ kind, size = 18, strokeWidth = 1.5, ...rest }: KindIconProps) {
  const C = KIND_ICON[kind] ?? FileText
  return <C size={size} strokeWidth={strokeWidth} aria-hidden="true" {...rest} />
}

export const ICONS = {
  image: ImageIcon,
  map: MapIcon,
  calendar: Calendar,
  'message-circle': MessageCircle,
  users: Users,
  plus: Plus,
  camera: Camera,
  lock: Lock,
  check: Check,
  search: Search,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  x: X,
  play: Play,
  trash: Trash2,
  grid: LayoutGrid,
  'map-pin': MapPin,
  heart: Heart,
  send: Send,
  mic: Mic,
} as const

export type IconName = keyof typeof ICONS

export interface IconProps extends Omit<LucideProps, 'ref'> {
  name: IconName
  size?: number
}

/** A lucide icon at 1.5px stroke; pass strokeWidth={2.2} for the checklist check. */
export function Icon({ name, size = 22, strokeWidth = 1.5, ...rest }: IconProps) {
  const C = ICONS[name]
  return <C size={size} strokeWidth={strokeWidth} aria-hidden="true" {...rest} />
}
