import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

// Generic editor over app_config rows for one category. Values are stored
// as JSONB; here we edit them as raw JSON text so any shape (a number for
// a limit, an object for a pricing plan, a string for a prompt) works
// without a bespoke form per category.
export default function ConfigEditor({ category, title, description, newKeyPlaceholder }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingKey, setSavingKey] = useState('')
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [drafts, setDrafts] = useState({})

  const reload = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error: fetchError } = await supabase
      .from('app_config')
      .select('*')
      .eq('category', category)
      .order('key', { ascending: true })

    if (fetchError) {
      setError("We couldn't load this configuration. Please try again.")
    } else {
      setRows(data || [])
      setDrafts(Object.fromEntries((data || []).map((r) => [r.key, JSON.stringify(r.value, null, 2)])))
    }
    setLoading(false)
  }, [category])

  useEffect(() => { reload() }, [reload])

  async function saveRow(key) {
    let parsed
    try {
      parsed = JSON.parse(drafts[key])
    } catch {
      setError(`"${key}" isn't valid JSON. Fix the formatting and try again.`)
      return
    }
    setSavingKey(key)
    setError('')
    const { error: saveError } = await supabase
      .from('app_config')
      .update({ value: parsed, updated_at: new Date().toISOString() })
      .eq('key', key)
    setSavingKey('')
    if (saveError) {
      setError("We couldn't save that change. Please try again.")
      return
    }
    reload()
  }

  async function deleteRow(key) {
    const { error: deleteError } = await supabase.from('app_config').delete().eq('key', key)
    if (deleteError) {
      setError("We couldn't delete that entry. Please try again.")
      return
    }
    reload()
  }

  async function addRow(e) {
    e.preventDefault()
    setError('')
    if (!newKey.trim()) {
      setError('Give the new entry a key.')
      return
    }
    let parsed
    try {
      parsed = newValue.trim() ? JSON.parse(newValue) : {}
    } catch {
      setError('New value must be valid JSON.')
      return
    }
    const { error: insertError } = await supabase
      .from('app_config')
      .insert({ key: newKey.trim(), category, value: parsed })
    if (insertError) {
      setError(insertError.message.includes('duplicate') ? 'That key already exists.' : "We couldn't add that entry.")
      return
    }
    setNewKey('')
    setNewValue('')
    reload()
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">{title}</h1>
      <p className="mt-1 text-ink/60">{description}</p>

      <form onSubmit={addRow} className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-white p-4">
        <div className="flex-1 min-w-[160px]">
          <label className="mb-1 block text-xs font-medium text-ink/60">Key</label>
          <input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder={newKeyPlaceholder} className="input-field" />
        </div>
        <div className="flex-[2] min-w-[220px]">
          <label className="mb-1 block text-xs font-medium text-ink/60">Value (JSON)</label>
          <input value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder='{"example": true}' className="input-field font-mono text-sm" />
        </div>
        <button type="submit" className="btn-primary">Add</button>
      </form>

      {error && (
        <div role="alert" className="mt-4 rounded-lg border border-ember/40 bg-ember/10 px-4 py-3 text-sm text-ember">
          {error}
        </div>
      )}

      <div className="mt-6 space-y-4">
        {loading && <p className="text-ink/50">Loading…</p>}
        {!loading && rows.length === 0 && (
          <div className="rounded-xl border border-dashed border-line px-6 py-12 text-center text-ink/50">
            No {title.toLowerCase()} configured yet. Add one above.
          </div>
        )}
        {rows.map((row) => (
          <div key={row.key} className="rounded-xl border border-line bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-sm font-medium">{row.key}</p>
              <button onClick={() => deleteRow(row.key)} className="text-sm text-ember hover:underline">Delete</button>
            </div>
            <textarea
              value={drafts[row.key] ?? ''}
              onChange={(e) => setDrafts((d) => ({ ...d, [row.key]: e.target.value }))}
              rows={4}
              className="input-field mt-2 font-mono text-sm"
            />
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-ink/40">Updated {new Date(row.updated_at).toLocaleString()}</p>
              <button
                onClick={() => saveRow(row.key)}
                disabled={savingKey === row.key}
                className="btn-ghost px-4 py-1.5 text-sm"
              >
                {savingKey === row.key ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
