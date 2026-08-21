import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Admin gate relies on `profile.role`, which is read from the `profiles`
// table behind Supabase RLS (server-controlled), never from a client-side
// flag. A normal user's row simply won't have role = 'admin', so this
// cannot be bypassed by editing frontend state.
export default function AdminRoute() {
  const { isAuthenticated, loadingSession, isAdmin } = useAuth()

  if (loadingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center text-ink/60">
        Checking access…
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/app" replace />
  }

  return <Outlet />
}
