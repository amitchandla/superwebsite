import { useAuth } from '../../context/AuthContext'
import { useBusinessRows } from '../../lib/useBusinessRows'
import SectionFrame from '../../components/SectionFrame'

const STATUS_STYLES = {
  new: 'bg-brass/15 text-brass',
  contacted: 'bg-moss/15 text-moss',
  qualified: 'bg-moss/15 text-moss',
  won: 'bg-moss text-paper',
  lost: 'bg-ink/10 text-ink/50'
}

export default function Leads() {
  const { business } = useAuth()
  const { rows, loading, error } = useBusinessRows('leads', business?.id)

  return (
    <SectionFrame
      title="Leads"
      subtitle="People who've shown interest, ready to be worked."
      loading={loading}
      error={error}
      isEmpty={rows.length === 0}
      emptyLabel="No leads yet. New leads from your channels will show up here."
    >
      <div className="overflow-hidden rounded-xl border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-paper text-ink/50">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((lead) => (
              <tr key={lead.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-medium">{lead.name}</td>
                <td className="px-4 py-3 text-ink/60">{lead.contact || '—'}</td>
                <td className="px-4 py-3 text-ink/60">{lead.source || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[lead.status] || ''}`}>
                    {lead.status}
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
