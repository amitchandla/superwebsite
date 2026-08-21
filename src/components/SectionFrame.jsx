// Shared empty/loading/error/list frame so every dashboard section
// looks consistent without duplicating markup.
export default function SectionFrame({ title, subtitle, loading, error, isEmpty, emptyLabel, children, action }) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">{title}</h1>
          {subtitle && <p className="mt-1 text-ink/60">{subtitle}</p>}
        </div>
        {action}
      </div>

      <div className="mt-6">
        {loading && <p className="text-ink/50">Loading…</p>}
        {!loading && error && (
          <div role="alert" className="rounded-lg border border-ember/40 bg-ember/10 px-4 py-3 text-sm text-ember">
            {error}
          </div>
        )}
        {!loading && !error && isEmpty && (
          <div className="rounded-xl border border-dashed border-line px-6 py-12 text-center text-ink/50">
            {emptyLabel}
          </div>
        )}
        {!loading && !error && !isEmpty && children}
      </div>
    </div>
  )
}
