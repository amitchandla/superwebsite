import { useAuth } from '../../context/AuthContext'
import { useBusinessRows } from '../../lib/useBusinessRows'
import SectionFrame from '../../components/SectionFrame'

const STATUS_STYLES = {
  draft: 'bg-ink/10 text-ink/50',
  active: 'bg-moss/15 text-moss',
  paused: 'bg-brass/15 text-brass',
  ended: 'bg-ink/10 text-ink/40'
}

export default function Ads() {
  const { business } = useAuth()
  const { rows, loading, error } = useBusinessRows('ads', business?.id)

  return (
    <SectionFrame
      title="Ads"
      subtitle="Campaigns running across Google and Meta."
      loading={loading}
      error={error}
      isEmpty={rows.length === 0}
      emptyLabel="No ad campaigns yet."
    >
      <div className="overflow-hidden rounded-xl border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-paper text-ink/50">
            <tr>
              <th className="px-4 py-3 font-medium">Campaign</th>
              <th className="px-4 py-3 font-medium">Platform</th>
              <th className="px-4 py-3 font-medium">Budget</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((ad) => (
              <tr key={ad.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-medium">{ad.name}</td>
                <td className="px-4 py-3 text-ink/60 capitalize">{ad.platform}</td>
                <td className="px-4 py-3 text-ink/60">{ad.budget ? `₹${Number(ad.budget).toLocaleString('en-IN')}` : '—'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[ad.status] || ''}`}>
                    {ad.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionFrame>
  )
}
