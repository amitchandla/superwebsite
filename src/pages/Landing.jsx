import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="flex items-center justify-between px-6 py-6 sm:px-10">
        <span className="font-display text-xl font-semibold">
          BizGrow <span className="text-ember">AI</span>
        </span>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/login" className="hover:underline">Log in</Link>
          <Link to="/signup" className="btn-primary px-5 py-2 text-sm">Get started</Link>
        </nav>
      </header>

      <section className="mx-auto max-w-3xl px-6 pb-24 pt-16 text-center sm:pt-24">
        <p className="font-medium uppercase tracking-widest text-ember">Your AI Business Growth Assistant</p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
          Every small business decision, backed by an assistant that never clocks out.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-ink/70">
          Leads, follow-ups, social posts, ads, and retention — BizGrow AI turns your daily
          business data into the next best action, automatically.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/signup" className="btn-primary">Start free trial</Link>
          <Link to="/login" className="btn-ghost">Log in</Link>
        </div>
      </section>
    </div>
  )
}
