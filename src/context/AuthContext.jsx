import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabaseClient'

const AuthContext = createContext(null)

// Maps raw Supabase/Postgres errors to safe, user-facing copy.
// Never surface raw error.message from Supabase to the UI.
function toFriendlyAuthError(error) {
  if (!error) return null
  const msg = (error.message || '').toLowerCase()

  if (msg.includes('invalid login credentials')) {
    return 'Email or password is incorrect. Please check your details and try again.'
  }
  if (msg.includes('email not confirmed')) {
    return 'Please verify your email before logging in.'
  }
  if (msg.includes('failed to fetch') || msg.includes('network')) {
    return 'Unable to connect right now. Please check your internet connection and try again.'
  }
  return "We couldn't sign you in right now. Please try again."
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [business, setBusiness] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loadingSession, setLoadingSession] = useState(true)

  const loadProfileAndBusiness = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null)
      setBusiness(null)
      setIsAdmin(false)
      return
    }

    // Profile row is protected by RLS: "id = auth.uid()".
    const { data: profileRow, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, onboarding_completed, role')
      .eq('id', userId)
      .maybeSingle()

    if (profileError) {
      // eslint-disable-next-line no-console
      console.error('Failed to load profile:', profileError.message)
      setProfile(null)
      setIsAdmin(false)
    } else {
      setProfile(profileRow)
      // Admin flag comes from a server-controlled column behind RLS,
      // never from a frontend-only variable or localStorage.
      setIsAdmin(profileRow?.role === 'admin')
    }

    const { data: businessRow, error: businessError } = await supabase
      .from('businesses')
      .select('id, name, subscription_status, trial_ends_at')
      .eq('owner_id', userId)
      .maybeSingle()

    if (businessError) {
      // eslint-disable-next-line no-console
      console.error('Failed to load business:', businessError.message)
      setBusiness(null)
    } else {
      setBusiness(businessRow)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function init() {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to restore session:', error.message)
      }
      if (!isMounted) return
      setSession(data?.session ?? null)
      if (data?.session?.user?.id) {
        await loadProfileAndBusiness(data.session.user.id)
      }
      setLoadingSession(false)
    }

    init()

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)
      if (newSession?.user?.id) {
        await loadProfileAndBusiness(newSession.user.id)
      } else {
        setProfile(null)
        setBusiness(null)
        setIsAdmin(false)
      }
    })

    return () => {
      isMounted = false
      listener?.subscription?.unsubscribe()
    }
  }, [loadProfileAndBusiness])

  const signIn = useCallback(async ({ email, password }) => {
    if (!supabaseConfigured) {
      return { error: 'Authentication integration requires Supabase configuration/credentials.' }
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return { error: toFriendlyAuthError(error) }
    }
    if (data?.session?.user?.id) {
      await loadProfileAndBusiness(data.session.user.id)
    }
    return { error: null, session: data.session }
  }, [loadProfileAndBusiness])

  const signUp = useCallback(async ({ email, password, fullName }) => {
    if (!supabaseConfigured) {
      return { error: 'Authentication integration requires Supabase configuration/credentials.' }
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    })
    if (error) {
      const msg = (error.message || '').toLowerCase()
      if (msg.includes('already registered') || msg.includes('already exists')) {
        return { error: 'An account with this email already exists.' }
      }
      return { error: toFriendlyAuthError(error) }
    }
    return { error: null, session: data.session, user: data.user }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
    setBusiness(null)
    setIsAdmin(false)
  }, [])

  const sendPasswordReset = useCallback(async (email) => {
    if (!supabaseConfigured) {
      return { error: 'Authentication integration requires Supabase configuration/credentials.' }
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    if (error) {
      return { error: toFriendlyAuthError(error) }
    }
    return { error: null }
  }, [])

  const updatePassword = useCallback(async (newPassword) => {
    if (!supabaseConfigured) {
      return { error: 'Authentication integration requires Supabase configuration/credentials.' }
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      return { error: toFriendlyAuthError(error) }
    }
    return { error: null }
  }, [])

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    business,
    isAdmin,
    loadingSession,
    isAuthenticated: Boolean(session?.user),
    onboardingCompleted: Boolean(profile?.onboarding_completed),
    signIn,
    signUp,
    signOut,
    sendPasswordReset,
    updatePassword,
    refreshProfile: () => loadProfileAndBusiness(session?.user?.id)
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
