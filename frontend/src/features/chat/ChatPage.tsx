// /chat - the mobile thread below 768px, the two-pane desktop layout above it.

import { ChatDesktop } from './ChatDesktop'
import { ChatMobile } from './ChatMobile'
import { useIsDesktop } from './useIsDesktop'

export default function ChatPage() {
  return useIsDesktop() ? <ChatDesktop /> : <ChatMobile />
}
