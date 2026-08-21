import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from './Sidebar'

export default function AppShell({ variant = 'dashboard' }) {
  const { profile, business, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="flex items-center justify-between border-b border-line px-6 py-4">
        <Link to="/app" className="font-display text-xl font-semibold">
          BizGrow <span className="text-ember">AI</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <span className="text-ink/60">{business?.name || profile?.full_name || 'Welcome'}</span>
          {isAdmin && (
            <Link to="/admin" className="text-moss hover:underline">Admin</Link>
          )}
          <button onClick={handleLogout} className="btn-ghost px-4 py-2">Log out</button>
        </nav>
      </header>
      <div className="mx-auto flex max-w-6xl">
        <Sidebar variant={variant} />
        <main className="min-w-0 flex-1 px-6 py-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
