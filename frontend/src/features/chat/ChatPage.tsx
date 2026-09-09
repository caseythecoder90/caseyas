// /chat - until milestone 4 the honest empty thread (ChatEmpty). With the
// designPreview dev flag on: the mobile thread below 768px, the two-pane
// desktop layout above it, both on mock data behind the banner.

import { useDesignPreview } from '../../data/hooks'
import { PreviewBanner } from '../shared/PreviewBanner'
import { ChatDesktop } from './ChatDesktop'
import { ChatEmptyDesktop, ChatEmptyMobile } from './ChatEmpty'
import { ChatMobile } from './ChatMobile'
import { useIsDesktop } from './useIsDesktop'

export default function ChatPage() {
  const [preview] = useDesignPreview()
  const isDesktop = useIsDesktop()
  if (!preview) return isDesktop ? <ChatEmptyDesktop /> : <ChatEmptyMobile />
  return (
    <>
      <PreviewBanner style={isDesktop ? { padding: '8px 32px 0' } : { padding: '4px 20px 0' }} />
      {isDesktop ? <ChatDesktop /> : <ChatMobile />}
    </>
  )
}
