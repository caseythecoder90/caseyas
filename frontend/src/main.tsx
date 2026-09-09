import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { applyStoredTheme } from './theme'
import './index.css'

// stamp data-theme before the first paint so a stored dark choice never flashes paper
applyStoredTheme()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // a 401 already redirected the browser; never retry it
        if (error instanceof Error && error.name === 'ApiError') return false
        return failureCount < 2
      },
      staleTime: 30_000,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
