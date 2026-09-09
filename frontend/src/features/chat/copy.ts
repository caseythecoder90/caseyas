// Copy this feature needs verbatim from the specs. Anything already in
// data/mock is imported from there; the few strings that differ between the
// spec and the shared mock (the sealed note body / eyebrow) are kept here so
// the screens match `design/spec/mobile-c-chat-calendar-notes-us.md` section 3
// and `mobile-d-sheets.md` section 12 exactly.

import { PINNED, PLANS } from '../../data/mock'

export const CHAT_STATUS = 'Active now'
export const CHAT_PLACEHOLDER = (her: string) => `Message ${her}`
export const CHAT_TYPING = (her: string) => `${her} is typing…`
export const CHAT_SEARCH = 'Search this conversation'
export const PINNED_BAR = `Pinned · "${PINNED[0].text}"`
export const PINNED_BAR_COUNT = String(PINNED.length)
export const SEP_TODAY = 'Today'
export const SEP_YESTERDAY = 'Yesterday'
export const SAVE_TO_MEMORIES = 'Save to memories'
export const OPEN_IN_PLAN = 'Open in plan'
export const PUT_ON_A_DAY = 'Put it on a day'
export const PINNED_EYEBROW = `Pinned · ${PINNED.length}`
export const MEDIA_EYEBROW = 'Media in this chat'
export const MEDIA_ALL = 'All →'
export const SAVED_TO_MEMORIES_TOAST = 'Saved to memories'
export const SAVED_TO_PLAN_TOAST = `Saved to ${PLANS.find((p) => p.id === 'japan')?.name ?? 'Japan 2027'}`

export const NOTES_INTRO = "Notes stay here. They don't scroll away like messages."
export const LEAVE_A_NOTE = 'Leave a note'
export const UNOPENED_EYEBROW = 'Unopened · 1'
export const SEALED_CARD_TITLE = (her: string) => `A sealed note from ${her}`
export const SEALED_CARD_SUB = 'Left Sep 5 · tap to open'
export const SEALED_EYEBROW = 'Sealed Sep 5 · opened just now'
export const SEALED_BODY =
  "You were asleep before I got home and I didn't want to wake you. The porch light was on. That's the whole note, really."
export const SEALED_KEEP = 'Keep it →'

export const NOTE_SHEET_TITLE = 'Leave a note'
export const NOTE_SHEET_FOR = (her: string) => `for ${her}`
export const NOTE_ADD_PHOTO = '+ photo'
export const NOTE_COLOR_LABEL = 'color'
export const NOTE_SCHEDULE_ROW = 'Schedule it'
export const NOTE_SEAL_ROW = 'Seal it'
export const NOTE_SEAL_HINT = (her: string) => `${her} has to open it`

export const DESKTOP_PLACEHOLDER = 'Desktop layout not in this round — see the mobile prototype.'
