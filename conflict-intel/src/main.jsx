import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import { IntelProvider } from './context/IntelContext'
import AuthGate from './components/AuthGate'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <IntelProvider>
        <AuthGate />
      </IntelProvider>
    </AuthProvider>
  </StrictMode>,
)
