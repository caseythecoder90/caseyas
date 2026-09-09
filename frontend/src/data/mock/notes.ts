// mock-data.md section 6: fridge notes.

import { mockImage as img } from '../mockImage'
import type { FridgeNote, NoteColor } from '../types'

export const NOTES: FridgeNote[] = [
  { body: 'Coffee’s in the thermos. The good beans, not the emergency ones.', color: 'n1', from: 'Yasmim', time: 'This morning', span: 1 },
  { body: 'Reminder that you said you’d fix the porch light. Reminder from me, not the light.', color: 'n2', from: 'Casey', time: 'Yesterday', span: 1 },
  { body: 'Found this in the glovebox.', color: 'n3', from: 'Yasmim', time: 'Aug 30', span: 2, hasPhoto: true, photo: img('glovebox', 600, 300) },
  { body: 'Happy birthday. Check the freezer.', color: 'n4', from: 'Casey', time: 'Scheduled', span: 1, scheduled: true, when: 'Appears Oct 3, 7:00 AM' },
  { body: 'You hummed the whole drive back. You didn’t notice.', color: 'n1', from: 'Yasmim', time: 'Aug 22', span: 1 },
]

export const NOTE_COLORS: NoteColor[] = ['n1', 'n2', 'n3', 'n4']
export const NOTE_COLOR_NAMES: Record<NoteColor, string> = { n1: 'cream', n2: 'moss', n3: 'blush', n4: 'slate' }

/** Note composer copy. */
export const NOTE_SCHEDULE_WHEN = 'Appears Oct 3, 7:00 AM'
export const NOTE_SCHEDULE_TIME = 'Oct 3, 7:00 AM'
export const NOTE_APPEARS_NOW = 'appears now'
export const NOTE_PLACEHOLDER = 'No title. Just say it.'
export function leaveNoteLabel(seal: boolean, sched: boolean): string {
  return seal ? 'Seal it and leave it' : sched ? 'Schedule it' : 'Leave it on the fridge'
}

/** The sealed note (unopened card on the Notes board). */
export const SEALED_NOTE = {
  from: 'Yasmim',
  eyebrow: 'Sealed · from Yasmim',
  body: 'You hummed the whole drive back. You didn’t notice.',
  color: 'n1',
} as const
