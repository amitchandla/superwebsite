import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ requireOnboarding = true }) {
  const { isAuthenticated, loadingSession, onboardingCompleted } = useAuth()
  const location = useLocation()

  if (loadingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center text-ink/60">
        Loading your session…
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireOnboarding && !onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
