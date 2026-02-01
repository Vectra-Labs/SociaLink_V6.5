import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import './i18n' // Initialize i18n
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { SubscriptionProvider } from './context/SubscriptionContext.jsx'
import { SocketProvider } from './context/SocketContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { UIFeaturesProvider } from './context/UIFeaturesContext.jsx'

// Create a client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <UIFeaturesProvider>
        <ThemeProvider>
          <AuthProvider>
            <SocketProvider>
              <SubscriptionProvider>
                <App />
              </SubscriptionProvider>
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </UIFeaturesProvider>
    </QueryClientProvider>
  </StrictMode>,
)
