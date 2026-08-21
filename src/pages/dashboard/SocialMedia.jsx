import { useAuth } from '../../context/AuthContext'
import { useBusinessRows } from '../../lib/useBusinessRows'
import SectionFrame from '../../components/SectionFrame'

const STATUS_STYLES = {
  draft: 'bg-ink/10 text-ink/50',
  scheduled: 'bg-brass/15 text-brass',
  posted: 'bg-moss/15 text-moss',
  failed: 'bg-ember/15 text-ember'
}

export default function SocialMedia() {
  const { business } = useAuth()
  const { rows, loading, error } = useBusinessRows('social_posts', business?.id)

  return (
    <SectionFrame
      title="Social media"
      subtitle="Posts drafted, scheduled, and published across your channels."
      loading={loading}
      error={error}
      isEmpty={rows.length === 0}
      emptyLabel="No posts yet. Drafts and scheduled posts will show up here."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((p) => (
          <div key={p.id} className="rounded-xl border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-ink/50">{p.platform.replace('_', ' ')}</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[p.status] || ''}`}>
                {p.status}
              </span>
            </div>
            <p className="mt-3 text-sm text-ink/80">{p.caption || 'No caption yet.'}</p>
            {p.scheduled_at && (
              <p className="mt-2 text-xs text-ink/50">Scheduled {new Date(p.scheduled_at).toLocaleString()}</p>
            )}
          </div>
        ))}
      </div>
    </SectionFrame>
  )
}
