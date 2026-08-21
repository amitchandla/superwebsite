import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'

const METRICS = [
  { table: 'leads', label: 'Total leads' },
  { table: 'customers', label: 'Total customers' },
  { table: 'follow_ups', label: 'Open follow-ups', filter: { completed: false } },
  { table: 'social_posts', label: 'Posts published', filter: { status: 'posted' } },
  { table: 'ads', label: 'Active campaigns', filter: { status: 'active' } }
]

export default function Reports() {
  const { business } = useAuth()
  const [counts, setCounts] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadCounts() {
      if (!business?.id) {
        setLoading(false)
        return
      }
      setLoading(true)
      setError('')

      const results = await Promise.all(
        METRICS.map(async (m) => {
          let query = supabase
            .from(m.table)
            .select('id', { count: 'exact', head: true })
            .eq('business_id', business.id)
          if (m.filter) {
            for (const [k, v] of Object.entries(m.filter)) query = query.eq(k, v)
          }
          const { count, error: countError } = await query
          return { ...m, count, error: countError }
        })
      )

      if (cancelled) return
      const failed = results.find((r) => r.error)
      if (failed) {
        setError("We couldn't load your reports. Please try again.")
      } else {
        setCounts(results)
      }
      setLoading(false)
    }

    loadCounts()
    return () => { cancelled = true }
  }, [business?.id])

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Reports</h1>
      <p className="mt-1 text-ink/60">A real-time snapshot of where things stand.</p>

      <div className="mt-6">
        {loading && <p className="text-ink/50">Loading…</p>}
        {!loading && error && (
          <div role="alert" className="rounded-lg border border-ember/40 bg-ember/10 px-4 py-3 text-sm text-ember">
            {error}
          </div>
        )}
        {!loading && !error && counts && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {counts.map((c) => (
              <div key={c.table} className="rounded-xl border border-line bg-white p-6">
                <p className="text-sm text-ink/60">{c.label}</p>
                <p className="mt-2 font-display text-3xl font-semibold">{c.count ?? 0}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
