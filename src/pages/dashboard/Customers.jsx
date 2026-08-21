import { useAuth } from '../../context/AuthContext'
import { useBusinessRows } from '../../lib/useBusinessRows'
import SectionFrame from '../../components/SectionFrame'

export default function Customers() {
  const { business } = useAuth()
  const { rows, loading, error } = useBusinessRows('customers', business?.id)

  return (
    <SectionFrame
      title="Customers"
      subtitle="Everyone who's already bought from you."
      loading={loading}
      error={error}
      isEmpty={rows.length === 0}
      emptyLabel="No customers on file yet."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((c) => (
          <div key={c.id} className="rounded-xl border border-line bg-white p-5">
            <p className="font-medium">{c.name}</p>
            <p className="mt-1 text-sm text-ink/60">{c.contact || 'No contact on file'}</p>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-ink/50">Lifetime value</span>
              <span className="font-medium">
                {c.lifetime_value ? `₹${Number(c.lifetime_value).toLocaleString('en-IN')}` : '—'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </SectionFrame>
  )
}
