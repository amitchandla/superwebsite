import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function Onboarding() {
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [businessName, setBusinessName] = useState('')
  const [industry, setIndustry] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!businessName.trim()) {
      setError('Tell us your business name to continue.')
      return
    }

    setSubmitting(true)

    // Create the business record, owned by this user (RLS: owner_id = auth.uid()).
    const { error: bizError } = await supabase.from('businesses').insert({
      owner_id: user.id,
      name: businessName.trim(),
      industry: industry.trim() || null,
      subscription_status: 'trial'
    })

    if (bizError) {
      setSubmitting(false)
      setError("We couldn't save your business details. Please try again.")
      return
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', user.id)

    setSubmitting(false)

    if (profileError) {
      setError("We couldn't finish setting up your account. Please try again.")
      return
    }

    await refreshProfile()
    navigate('/app', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-md">
        <h1 className="font-display text-3xl font-semibold">Tell us about your business</h1>
        <p className="mt-2 text-ink/60">This helps BizGrow AI tailor growth suggestions to you.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="businessName" className="mb-1 block text-sm font-medium">Business name</label>
            <input
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="industry" className="mb-1 block text-sm font-medium">Industry (optional)</label>
            <input
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="input-field"
              placeholder="e.g. Restaurant, Salon, Retail"
            />
          </div>
          {error && (
            <div role="alert" className="rounded-lg border border-ember/40 bg-ember/10 px-4 py-3 text-sm text-ember">
              {error}
            </div>
          )}
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Setting up…' : 'Continue to dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}
