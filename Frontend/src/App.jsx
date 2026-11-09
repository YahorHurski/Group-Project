import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import AdminPage from './pages/AdminPage.jsx'
import LoginPage from './pages/LoginPage.jsx'

function Screen() {
  const { user, loading, isAdmin, logout } = useAuth()

  if (loading) {
    return <p className="p-8 text-slate-500">Loading…</p>
  }

  if (!user) return <LoginPage />

  if (!isAdmin) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-3 p-4">
        <p>Access denied: the admin panel is available to administrators only.</p>
        <button onClick={logout} className="rounded border border-slate-300 px-3 py-1 hover:bg-slate-100">
          Sign out
        </button>
      </main>
    )
  }

  return <AdminPage />
}

export default function App() {
  return (
    <AuthProvider>
      <Screen />
    </AuthProvider>
  )
}
