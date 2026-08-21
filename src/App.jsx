import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import AppShell from './components/AppShell'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'

import Leads from './pages/dashboard/Leads'
import Customers from './pages/dashboard/Customers'
import FollowUps from './pages/dashboard/FollowUps'
import SocialMedia from './pages/dashboard/SocialMedia'
import Ads from './pages/dashboard/Ads'
import Retention from './pages/dashboard/Retention'
import Reports from './pages/dashboard/Reports'

import Pricing from './pages/admin/Pricing'
import Prompts from './pages/admin/Prompts'
import Features from './pages/admin/Features'
import Limits from './pages/admin/Limits'
import FAQs from './pages/admin/FAQs'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Requires auth, but not a completed onboarding */}
        <Route element={<ProtectedRoute requireOnboarding={false} />}>
          <Route path="/onboarding" element={<Onboarding />} />
        </Route>

        {/* Requires auth + completed onboarding */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell variant="dashboard" />}>
            <Route path="/app" element={<Dashboard />} />
            <Route path="/app/leads" element={<Leads />} />
            <Route path="/app/customers" element={<Customers />} />
            <Route path="/app/follow-ups" element={<FollowUps />} />
            <Route path="/app/social" element={<SocialMedia />} />
            <Route path="/app/ads" element={<Ads />} />
            <Route path="/app/retention" element={<Retention />} />
            <Route path="/app/reports" element={<Reports />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route element={<AppShell variant="admin" />}>
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/pricing" element={<Pricing />} />
              <Route path="/admin/prompts" element={<Prompts />} />
              <Route path="/admin/features" element={<Features />} />
              <Route path="/admin/limits" element={<Limits />} />
              <Route path="/admin/faqs" element={<FAQs />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}
