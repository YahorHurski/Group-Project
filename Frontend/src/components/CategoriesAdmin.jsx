import { useCallback, useEffect, useState } from 'react'
import { categoriesApi } from '../services/api.js'

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setCategories(await categoriesApi.list())
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  function reset() {
    setName('')
    setEditingId(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editingId === null) await categoriesApi.create({ name })
      else await categoriesApi.update(editingId, { name })
      reset()
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(category) {
    if (!window.confirm(`Delete category "${category.name}"?`)) return
    setError('')
    try {
      await categoriesApi.remove(category.id)
      if (editingId === category.id) reset()
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="space-y-4">
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-end bg-white rounded-xl shadow p-4">
        <label className="flex-1 min-w-48 text-sm">
          <span className="text-slate-600">{editingId === null ? 'New category' : 'Edit category'}</span>
          <input
            required
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700 disabled:opacity-60"
        >
          {editingId === null ? 'Add' : 'Save'}
        </button>
        {editingId !== null && (
          <button type="button" onClick={reset} className="rounded border border-slate-300 px-4 py-2">
            Cancel
          </button>
        )}
      </form>

      {error && (
        <p role="alert" className="rounded bg-red-50 text-red-700 px-3 py-2 text-sm">
          {error}
        </p>
      )}

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-2 w-16">ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2 w-40" />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={3} className="px-4 py-3 text-slate-500">Loading…</td>
              </tr>
            )}
            {!loading && categories.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-3 text-slate-500">No categories yet.</td>
              </tr>
            )}
            {categories.map((category) => (
              <tr key={category.id} className="border-t border-slate-100">
                <td className="px-4 py-2">{category.id}</td>
                <td className="px-4 py-2">{category.name}</td>
                <td className="px-4 py-2 text-right space-x-3">
                  <button
                    onClick={() => {
                      setEditingId(category.id)
                      setName(category.name)
                    }}
                    className="text-indigo-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDelete(category)} className="text-red-600 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
