import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper text-center">
      <h1 className="font-display text-4xl font-semibold">404</h1>
      <p className="mt-2 text-ink/60">This page doesn't exist.</p>
      <Link to="/" className="btn-primary mt-6">Go home</Link>
    </div>
  )
}
