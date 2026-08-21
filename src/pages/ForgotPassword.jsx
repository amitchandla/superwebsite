import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ForgotPassword() {
  const { sendPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!EMAIL_RE.test(email.trim())) {
      setError('Enter a valid email address.')
      return
    }

    setSubmitting(true)
    const { error: resetError } = await sendPasswordReset(email.trim())
    setSubmitting(false)

    if (resetError) {
      setError(resetError)
      return
    }
    setSent(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="font-display text-2xl font-semibold text-ink">
            BizGrow <span className="text-ember">AI</span>
          </Link>
          <p className="mt-2 text-sm text-ink/60">Reset your password.</p>
        </div>

        {sent ? (
          <div className="rounded-lg border border-moss/30 bg-moss/10 px-4 py-4 text-sm text-moss">
            If an account exists for <strong>{email}</strong>, a reset link has been sent. Check your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`input-field ${error ? 'input-field-error' : ''}`}
              />
            </div>
            {error && (
              <div role="alert" className="rounded-lg border border-ember/40 bg-ember/10 px-4 py-3 text-sm text-ember">
                {error}
              </div>
            )}
            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? 'Sending link…' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-ink/60">
          <Link to="/login" className="text-moss hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  )
}
