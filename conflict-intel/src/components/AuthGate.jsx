import { useAuth } from '../context/AuthContext'
import LoginScreen from './LoginScreen'
import MainAppShell from './MainAppShell'

export default function AuthGate() {
  const { isLoggedIn } = useAuth()
  return isLoggedIn ? <MainAppShell /> : <LoginScreen />
}
