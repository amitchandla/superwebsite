import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const DASHBOARD_LINKS = [
  { to: '/app', label: 'Overview', end: true },
  { to: '/app/leads', label: 'Leads' },
  { to: '/app/customers', label: 'Customers' },
  { to: '/app/follow-ups', label: 'Follow-ups' },
  { to: '/app/social', label: 'Social media' },
  { to: '/app/ads', label: 'Ads' },
  { to: '/app/retention', label: 'Retention' },
  { to: '/app/reports', label: 'Reports' }
]

const ADMIN_LINKS = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/pricing', label: 'Pricing' },
  { to: '/admin/prompts', label: 'AI prompts' },
  { to: '/admin/features', label: 'Feature flags' },
  { to: '/admin/limits', label: 'Usage limits' },
  { to: '/admin/faqs', label: 'FAQs' }
]

function linkClass({ isActive }) {
  return `block rounded-lg px-3 py-2 text-sm transition-colors ${
    isActive ? 'bg-moss text-paper' : 'text-ink/70 hover:bg-line/50'
  }`
}

export default function Sidebar({ variant = 'dashboard' }) {
  const { isAdmin } = useAuth()
  const links = variant === 'admin' ? ADMIN_LINKS : DASHBOARD_LINKS

  return (
    <aside className="w-56 shrink-0 border-r border-line px-3 py-6">
      <nav className="space-y-1">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
            {link.label}
          </NavLink>
        ))}
      </nav>
      {variant === 'dashboard' && isAdmin && (
        <div className="mt-6 border-t border-line pt-4">
          <NavLink to="/admin" className={linkClass}>Go to admin</NavLink>
        </div>
      )}
      {variant === 'admin' && (
        <div className="mt-6 border-t border-line pt-4">
          <NavLink to="/app" className={linkClass}>Back to dashboard</NavLink>
        </div>
      )}
    </aside>
  )
}
