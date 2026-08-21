import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabaseConfigured } from '../lib/supabaseClient'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)
  const submittingRef = useRef(false)

  function validate() {
    const errors = {}
    if (!fullName.trim()) errors.fullName = 'Enter your name.'
    if (!email.trim()) {
      errors.email = 'Enter your email address.'
    } else if (!EMAIL_RE.test(email.trim())) {
      errors.email = 'Enter a valid email address.'
    }
    if (!password || password.length < 8) {
      errors.password = 'Password must be at least 8 characters.'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    if (submittingRef.current) return
    if (!validate()) return

    submittingRef.current = true
    setSubmitting(true)
    const { error, session } = await signUp({ email: email.trim(), password, fullName: fullName.trim() })
    submittingRef.current = false
    setSubmitting(false)

    if (error) {
      setFormError(error)
      return
    }

    if (session) {
      navigate('/onboarding', { replace: true })
    } else {
      // Email confirmation is enabled on the Supabase project.
      setConfirmationSent(true)
    }
  }

  if (confirmationSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="font-display text-2xl font-semibold">Check your email</h1>
          <p className="mt-3 text-ink/70">
            We've sent a confirmation link to <strong>{email}</strong>. Verify your email, then log in.
          </p>
          <Link to="/login" className="btn-primary mt-6 inline-flex">Go to login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="font-display text-2xl font-semibold text-ink">
            BizGrow <span className="text-ember">AI</span>
          </Link>
          <p className="mt-2 text-sm text-ink/60">Create your account.</p>
        </div>

        {!supabaseConfigured && (
          <div className="mb-4 rounded-lg border border-ember/40 bg-ember/10 px-4 py-3 text-sm text-ember">
            Authentication integration requires Supabase configuration/credentials.
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="fullName" className="mb-1 block text-sm font-medium">Full name</label>
            <input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`input-field ${fieldErrors.fullName ? 'input-field-error' : ''}`}
            />
            {fieldErrors.fullName && <p className="mt-1 text-sm text-ember">{fieldErrors.fullName}</p>}
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`input-field ${fieldErrors.email ? 'input-field-error' : ''}`}
            />
            {fieldErrors.email && <p className="mt-1 text-sm text-ember">{fieldErrors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`input-field ${fieldErrors.password ? 'input-field-error' : ''}`}
            />
            {fieldErrors.password && <p className="mt-1 text-sm text-ember">{fieldErrors.password}</p>}
          </div>

          {formError && (
            <div role="alert" className="rounded-lg border border-ember/40 bg-ember/10 px-4 py-3 text-sm text-ember">
              {formError}
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          Already have an account?{' '}
          <Link to="/login" className="text-moss hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}
