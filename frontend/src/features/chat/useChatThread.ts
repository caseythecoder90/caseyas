// The interaction state both chat layouts share: the composer draft and the
// navigation both bubbles need. Messages, the typing flag and send() come from
// the store through useChat(); the two save actions belong to the desktop-only
// photo overlay and plan-item buttons (desktop.md section 5).

import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'
import { useChat } from '../../data/hooks'
import { paths } from '../../paths'
import { HER } from '../../people'
import { useSession } from '../../session'
import { useToast } from '../../ui'
import { SAVED_TO_MEMORIES_TOAST, SAVED_TO_PLAN_TOAST } from './copy'

export function useChatThread(variant: 'mobile' | 'desktop') {
  const chat = useChat(variant)
  const navigate = useNavigate()
  const toast = useToast()
  const { meName } = useSession()

  const [draft, setDraft] = useState('')

  const send = useCallback(() => {
    if (!draft.trim()) return
    if (chat.send(draft)) setDraft('')
  }, [chat, draft])

  const openMemory = useCallback((memId: number) => navigate(paths.memory(memId)), [navigate])
  const openPlan = useCallback(() => navigate(paths.plan('japan', 'itinerary')), [navigate])
  const saveToMemories = useCallback(() => {
    toast.show(SAVED_TO_MEMORIES_TOAST, { label: 'Open', onClick: () => navigate(paths.timeline) })
  }, [navigate, toast])
  const saveToPlan = useCallback(() => {
    toast.show(SAVED_TO_PLAN_TOAST, { label: 'Open', onClick: () => navigate(paths.plan('japan', 'itinerary')) })
  }, [navigate, toast])

  return {
    ...chat,
    her: HER,
    meName,
    draft,
    setDraft,
    send,
    openMemory,
    openPlan,
    saveToMemories,
    saveToPlan,
  }
}
