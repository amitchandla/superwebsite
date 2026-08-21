import { Link } from 'react-router-dom'

const SECTIONS = [
  { to: '/admin/pricing', label: 'Pricing', blurb: 'Plans and prices shown to customers.' },
  { to: '/admin/prompts', label: 'AI prompts', blurb: 'System prompts behind the Growth Advisor.' },
  { to: '/admin/features', label: 'Feature flags', blurb: 'Turn features on or off per rollout.' },
  { to: '/admin/limits', label: 'Usage limits', blurb: 'Per-plan caps like leads or generations.' },
  { to: '/admin/faqs', label: 'FAQs', blurb: 'Questions shown on the landing page.' }
]

export default function Admin() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Admin</h1>
      <p className="mt-2 text-ink/60">
        Config-driven controls — nothing here requires a code deploy. Access is verified
        server-side via the <code>profiles.role</code> column under RLS.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <Link key={s.to} to={s.to} className="rounded-xl border border-line bg-white p-5 transition-colors hover:border-moss">
            <p className="font-medium">{s.label}</p>
            <p className="mt-1 text-sm text-ink/60">{s.blurb}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
