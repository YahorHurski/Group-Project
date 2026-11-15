import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import AdminPage from './pages/AdminPage.jsx'
import CatalogPage from './pages/CatalogPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ProductDetailsPage from './pages/ProductDetailsPage.jsx'

function AdminRoute() {
    const { user, loading, isAdmin, logout } = useAuth()

    if (loading) {
        return <p className="p-8 text-slate-500">Loading...</p>
    }

    if (!user) return <Navigate to="/login" replace />

    if (!isAdmin) {
        return (
            <main className="min-h-screen flex flex-col items-center justify-center gap-3 p-4">
                <p>Access denied: the admin panel is available to administrators only.</p>
                <button
                    onClick={logout}
                    className="rounded border border-slate-300 px-3 py-1 hover:bg-slate-100"
                >
                    Sign out
                </button>
            </main>
        )
    }

    return <AdminPage />
}

function LoginRoute() {
    const { user, isAdmin, loading } = useAuth()
    if (loading) return <p className="p-8 text-slate-500">Loading...</p>
    if (user) return <Navigate to={isAdmin ? '/admin' : '/'} replace />
    return <LoginPage />
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<CatalogPage />} />
                    <Route path="/products/:id" element={<ProductDetailsPage />} />
                    <Route path="/login" element={<LoginRoute />} />
                    <Route path="/admin" element={<AdminRoute />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}