import { useState } from 'react'
import CategoriesAdmin from '../components/CategoriesAdmin.jsx'
import ProductsAdmin from '../components/ProductsAdmin.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const TABS = [
  { id: 'products', label: 'Products' },
  { id: 'categories', label: 'Categories' },
]

export default function AdminPage() {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState('products')

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Admin panel</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-600">{user.email}</span>
          <button onClick={logout} className="rounded border border-slate-300 px-3 py-1 hover:bg-slate-100">
            Sign out
          </button>
        </div>
      </header>

      <nav className="flex gap-2 border-b border-slate-200">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 -mb-px border-b-2 ${
              tab === id ? 'border-indigo-600 text-indigo-600 font-medium' : 'border-transparent text-slate-600'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === 'products' ? <ProductsAdmin /> : <CategoriesAdmin />}
    </div>
  )
}
