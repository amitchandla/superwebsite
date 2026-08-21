import { useAuth } from '../../context/AuthContext'
import { useBusinessRows } from '../../lib/useBusinessRows'
import { supabase } from '../../lib/supabaseClient'
import SectionFrame from '../../components/SectionFrame'

export default function FollowUps() {
  const { business } = useAuth()
  const { rows, loading, error, reload } = useBusinessRows('follow_ups', business?.id, {
    orderBy: 'due_at',
    ascending: true
  })

  async function toggleComplete(id, completed) {
    await supabase.from('follow_ups').update({ completed: !completed }).eq('id', id)
    reload()
  }

  return (
    <SectionFrame
      title="Follow-ups"
      subtitle="What's due, so nothing slips through."
      loading={loading}
      error={error}
      isEmpty={rows.length === 0}
      emptyLabel="Nothing due. Follow-ups will appear here as leads and customers need attention."
    >
      <ul className="divide-y divide-line rounded-xl border border-line bg-white">
        {rows.map((f) => (
          <li key={f.id} className="flex items-start gap-3 px-4 py-4">
            <input
              type="checkbox"
              checked={f.completed}
              onChange={() => toggleComplete(f.id, f.completed)}
              className="mt-1 h-4 w-4 accent-moss"
              aria-label={`Mark "${f.note}" complete`}
            />
            <div className={f.completed ? 'opacity-50 line-through' : ''}>
              <p className="font-medium">{f.note}</p>
              <p className="text-sm text-ink/50">Due {new Date(f.due_at).toLocaleDateString()}</p>
            </div>
          </li>
        ))}
      </ul>
    </SectionFrame>
  )
}
