# BizGrow AI

Your AI Business Growth Assistant — landing page, full Supabase auth flow,
onboarding, dashboard shell, and admin gate.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in your real Supabase project URL + anon key
   (Supabase Dashboard → Project Settings → API).
3. Open the Supabase SQL editor and run `supabase/schema.sql` — it creates
   `profiles`, `businesses`, RLS policies, and the trigger that creates a
   profile row automatically when someone signs up.
4. `npm run dev`

## Full file list

```
src/
  App.jsx                     routes
  main.jsx                    entry
  index.css                   Tailwind + design tokens
  lib/
    supabaseClient.js         Supabase client (env-driven)
    useBusinessRows.js        shared fetch hook (no fake data)
  context/AuthContext.jsx     auth state, session, profile, business, admin flag
  components/
    ProtectedRoute.jsx        auth + onboarding gate
    AdminRoute.jsx             role='admin' gate (server-checked)
    AppShell.jsx               header + sidebar layout
    Sidebar.jsx                dashboard/admin nav
    SectionFrame.jsx           shared loading/error/empty frame
  pages/
    Landing.jsx, Login.jsx, Signup.jsx
    ForgotPassword.jsx, ResetPassword.jsx
    Onboarding.jsx, Dashboard.jsx, Admin.jsx, NotFound.jsx
    dashboard/
      Leads.jsx, Customers.jsx, FollowUps.jsx, SocialMedia.jsx,
      Ads.jsx, Retention.jsx, Reports.jsx
    admin/
      ConfigEditor.jsx         generic key/value editor
      Pricing.jsx, Prompts.jsx, Features.jsx, Limits.jsx, FAQs.jsx
supabase/schema.sql            every table + RLS policy + seed rows
.env.example
```

## What's implemented

- **Login** (`src/pages/Login.jsx`) — real `supabase.auth.signInWithPassword()`,
  client-side email/password validation, duplicate-submit guard, "Logging in…"
  loading state, friendly error messages (never raw Supabase errors), redirect
  to `/onboarding` or `/app` based on the user's profile.
- **Signup** (`Signup.jsx`) — `supabase.auth.signUp()`, handles the
  email-confirmation-enabled case.
- **Forgot / Reset password** (`ForgotPassword.jsx`, `ResetPassword.jsx`) —
  `resetPasswordForEmail()` → emailed link → `updateUser({ password })`.
- **Session persistence** — Supabase client is configured with
  `persistSession: true` + `autoRefreshToken: true`; `AuthContext` also
  listens via `onAuthStateChange` so refreshes don't lose the session.
- **Protected routes** (`ProtectedRoute.jsx`) — redirect to `/login` when
  signed out; redirect to `/onboarding` when signed in but
  `profile.onboarding_completed` is false.
- **Admin gate** (`AdminRoute.jsx`) — checks `profiles.role`, a column
  read from the database under RLS, not a frontend flag. A user can't
  self-promote (the `profiles` RLS update policy blocks changing `role`).
- **Logout** — `supabase.auth.signOut()`, clears local state, redirects
  to `/login`.
- **Dashboard modules** — Leads, Customers, Follow-ups (with a complete
  toggle), Social media, Ads, Retention, and Reports (live counts via
  Supabase). All read real rows scoped to the signed-in user's business
  via RLS; empty tables show an empty state, never placeholder data.
- **Admin config panel** — Pricing, AI prompts, Feature flags, Usage
  limits, and FAQs are all backed by one `app_config` table (key + JSON
  value), editable from the UI with no code deploy. Only rows a user's
  `profiles.role = 'admin'` can write, enforced by RLS — not by hiding
  a button in the frontend.

## Test report

| Test | Status |
|---|---|
| Login tested | **NO** |
| Logout tested | **NO** |
| Forgot password tested | **NO** |
| Session persistence tested | **NO** |
| Protected routes tested | **NO** |
| Admin authorization tested | **NO** |

**Authentication integration requires Supabase configuration/credentials.**

This sandbox has no Supabase project connected, so none of the above could be
exercised against a real backend — the `npm run build` above confirms the
code compiles cleanly and every screen renders, but that is not the same as
a tested auth flow. To actually test:

1. Create a Supabase project, run `supabase/schema.sql`.
2. Fill in `.env` with that project's URL/anon key.
3. `npm run dev` and walk through: sign up → confirm email (if enabled) →
   log in with wrong password (expect the specific error) → log in correctly
   → refresh the page (should stay logged in) → log out → try opening `/app`
   while logged out (should redirect to `/login`) → promote your own row's
   `role` to `admin` in the Supabase table editor and confirm `/admin` opens,
   then set it back to `user` and confirm `/admin` redirects away.
