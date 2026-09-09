// mock-data.md section 5: the 8 base chat messages and desktop side-panel data.

import { mockImage as img } from '../mockImage'
import type { ChatMessage, PinnedMessage } from '../types'

/** Base thread. Image sizes differ between the mobile and desktop canvases. */
export function baseMessages(variant: 'mobile' | 'desktop' = 'mobile'): ChatMessage[] {
  const desktop = variant === 'desktop'
  return [
    { id: 1, from: 'h', type: 'text', text: 'Did you see the sky on your way home', time: '9:38 PM' },
    { id: 2, from: 'me', type: 'photo', img: desktop ? img('sunset', 640, 480) : img('sunset', 480, 360), time: '9:40 PM' },
    {
      id: 3,
      from: 'h',
      type: 'photos',
      imgs: ['p1', 'p2', 'p3', 'p4'].map((x) => ({ src: desktop ? img(x, 320, 240) : img(x, 200, 200) })),
      time: '9:40 PM',
    },
    { id: 4, from: 'me', type: 'voice', dur: '0:42', time: '9:41 PM' },
    {
      id: 5,
      from: 'h',
      type: 'memory',
      img: desktop ? img('asheville', 400, 400) : img('asheville', 600, 300),
      title: 'Three days in Asheville',
      sub: 'Aug 14–17 · 38 photos',
      memId: 3,
      time: '9:41 PM',
    },
    { id: 6, from: 'h', type: 'link', url: 'resy.com/nonnas', title: 'Nonna’s — Reserve a table', domain: 'resy.com', time: '9:42 PM' },
    { id: 7, from: 'me', type: 'text', text: 'Booked for Friday. 7.', time: 'Seen 9:42 PM' },
    {
      id: 8,
      from: 'h',
      type: 'planitem',
      kind: 'activity',
      title: 'Fushimi Inari at sunrise',
      sub: desktop ? 'Japan 2027 · unscheduled' : 'Japan 2027 · unscheduled · put it on day 11?',
      time: '9:44 PM',
    },
  ]
}

export const MESSAGES: ChatMessage[] = baseMessages('mobile')

/** Desktop thread: one "Yesterday" bubble before the base messages. */
export const YESTERDAY_MESSAGE: ChatMessage = { id: 0, from: 'h', type: 'text', text: 'Gate code is 4471, garage is the birthday', time: 'Yesterday' }

/** Voice waveform: 30 bar heights in px; bars i < 12 are the played portion (fg1), the rest fg3. */
export const WAVE: number[] = Array.from({ length: 30 }, (_, i) => 6 + Math.round(Math.abs(Math.sin(i * 1.7) * 14 + Math.cos(i * 0.8) * 4)))
export const WAVE_PLAYED = 12

/** Desktop chat side panel. */
export const PINNED: PinnedMessage[] = [
  { text: 'Gate code is 4471, garage is the birthday', by: 'Yasmim', when: 'Aug 3' },
  { text: 'Vet: Dr. Okafor, (828) 555-0142', by: 'Casey', when: 'Jun 19' },
]
export const CHAT_MEDIA: string[] = ['sunset', 'p1', 'p2', 'p3', 'p4', 'cm1', 'cm2', 'cm3', 'cm4'].map((x) => img(x, 200, 200))

/** Her typing indicator shows for this long after each send. */
export const TYPING_MS = 2500
/** Unread count for the chat thread itself (desktop badge); notes add one more while the sealed note is unopened. */
export const CHAT_UNREAD = 2
