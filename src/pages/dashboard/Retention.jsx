import { useAuth } from '../../context/AuthContext'
import { useBusinessRows } from '../../lib/useBusinessRows'
import SectionFrame from '../../components/SectionFrame'

export default function Retention() {
  const { business } = useAuth()
  const { rows, loading, error } = useBusinessRows('retention_notes', business?.id)

  return (
    <SectionFrame
      title="Retention"
      subtitle="Notes and nudges to keep customers coming back."
      loading={loading}
      error={error}
      isEmpty={rows.length === 0}
      emptyLabel="No retention notes yet."
    >
      <ul className="space-y-3">
        {rows.map((n) => (
          <li key={n.id} className="rounded-xl border border-line bg-white p-4">
            <p className="text-sm">{n.note}</p>
            <p className="mt-2 text-xs text-ink/40">{new Date(n.created_at).toLocaleDateString()}</p>
          </li>
        ))}
      </ul>
    </SectionFrame>
  )
}
