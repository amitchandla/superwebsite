import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const SHORTCUTS = [
  { to: '/app/leads', label: 'Leads' },
  { to: '/app/follow-ups', label: 'Follow-ups' },
  { to: '/app/social', label: 'Social media' },
  { to: '/app/reports', label: 'Reports' }
]

export default function Dashboard() {
  const { profile, business } = useAuth()

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">
        Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}
      </h1>
      <p className="mt-2 text-ink/60">
        {business?.name ? `Here's how ${business.name} is growing.` : 'Your growth overview.'}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SHORTCUTS.map((s) => (
          <Link key={s.to} to={s.to} className="rounded-xl border border-line bg-white p-6 transition-colors hover:border-moss">
            <p className="font-medium">{s.label}</p>
            <p className="mt-1 text-sm text-ink/50">View {s.label.toLowerCase()} →</p>
          </Link>
        ))}
      </div>

      {business?.subscription_status === 'trial' && (
        <div className="mt-8 rounded-xl border border-brass/40 bg-brass/10 p-6">
          <p className="font-medium">You're on a free trial.</p>
          <p className="mt-1 text-sm text-ink/70">Upgrade any time to keep growth suggestions running.</p>
        </div>
      )}
    </div>
  )
}
