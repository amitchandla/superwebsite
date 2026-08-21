import { useState, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabaseConfigured } from '../lib/supabaseClient'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from?.pathname || '/app'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false) // belt-and-braces guard against double-submit

  function validate() {
    const errors = {}
    if (!email.trim()) {
      errors.email = 'Enter your email address.'
    } else if (!EMAIL_RE.test(email.trim())) {
      errors.email = 'Enter a valid email address.'
    }
    if (!password) {
      errors.password = 'Enter your password.'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    // Prevent duplicate submissions (state + ref, since setState is async).
    if (submittingRef.current) return
    if (!validate()) return

    submittingRef.current = true
    setSubmitting(true)

    const { error } = await signIn({ email: email.trim(), password })

    submittingRef.current = false
    setSubmitting(false)

    if (error) {
      setFormError(error)
      return
    }

    navigate(redirectTo, { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="font-display text-2xl font-semibold text-ink">
            BizGrow <span className="text-ember">AI</span>
          </Link>
          <p className="mt-2 text-sm text-ink/60">Log in to your growth dashboard.</p>
        </div>

        {!supabaseConfigured && (
          <div className="mb-4 rounded-lg border border-ember/40 bg-ember/10 px-4 py-3 text-sm text-ember">
            Authentication integration requires Supabase configuration/credentials.
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4" aria-busy={submitting}>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`input-field ${fieldErrors.email ? 'input-field-error' : ''}`}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            />
            {fieldErrors.email && (
              <p id="email-error" className="mt-1 text-sm text-ember">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-ink">
                Password
              </label>
              <Link to="/forgot-password" className="text-sm text-moss hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`input-field ${fieldErrors.password ? 'input-field-error' : ''}`}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            />
            {fieldErrors.password && (
              <p id="password-error" className="mt-1 text-sm text-ember">{fieldErrors.password}</p>
            )}
          </div>

          {formError && (
            <div role="alert" className="rounded-lg border border-ember/40 bg-ember/10 px-4 py-3 text-sm text-ember">
              {formError}
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Logging in…' : 'Log In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          New to BizGrow AI?{' '}
          <Link to="/signup" className="text-moss hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  )
}
