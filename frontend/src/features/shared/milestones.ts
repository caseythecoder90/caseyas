// One place for the "not yet" copy: which milestone (docs/architecture.md
// section 16) brings each tab that is still waiting on its backend. The honest
// empty states and the not-yet screens read from here so the numbers cannot
// drift between screens.

export const MILESTONE = {
  memories: 3,
  chat: 4,
  push: 4,
  calendar: 5,
  notes: 6,
  gallery: 6,
} as const

export const MEMORIES_ARRIVE = `Memories arrive with milestone ${MILESTONE.memories}.`
export const PLAN_TO_MEMORY_ARRIVES = `Turning a trip into a memory arrives with milestone ${MILESTONE.memories}.`
export const GALLERY_ARRIVES = `The gallery arrives with milestone ${MILESTONE.gallery}.`
export const CHAT_ARRIVES = `Chat arrives with milestone ${MILESTONE.chat}`
export const NOTES_ARRIVE = `Notes arrive with milestone ${MILESTONE.notes}`
export const PUSH_ARRIVES = `Push notifications arrive with milestone ${MILESTONE.push}.`

/** The thin banner every previewed screen carries so mock data is never mistaken for real. */
export const PREVIEW_BANNER = 'Design preview · placeholder data'
