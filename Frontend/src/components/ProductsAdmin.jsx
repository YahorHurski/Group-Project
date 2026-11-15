import { useCallback, useEffect, useState } from 'react'
import { categoriesApi, productsApi } from '../services/api.js'

const emptyForm = { name: '', description: '', price: '', stockQuantity: '', categoryId: '' }

export default function ProductsAdmin() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      const [productList, categoryList] = await Promise.all([productsApi.list(), categoriesApi.list()])
      setProducts(productList)
      setCategories(categoryList)
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

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function reset() {
    setForm(emptyForm)
    setEditingId(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stockQuantity: Number(form.stockQuantity),
      categoryId: Number(form.categoryId),
    }
    try {
      if (editingId === null) await productsApi.create(payload)
      else await productsApi.update(editingId, payload)
      reset()
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function startEdit(product) {
    setEditingId(product.id)
    setForm({
      name: product.name,
      description: product.description ?? '',
      price: String(product.price),
      stockQuantity: String(product.stockQuantity),
      categoryId: String(product.categoryId),
    })
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete product "${product.name}"?`)) return
    setError('')
    try {
      await productsApi.remove(product.id)
      if (editingId === product.id) reset()
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  const inputClass = 'mt-1 w-full rounded border border-slate-300 px-3 py-2'

  return (
    <section className="space-y-4">
      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2 bg-white rounded-xl shadow p-4">
        <h2 className="sm:col-span-2 font-medium">{editingId === null ? 'New product' : 'Edit product'}</h2>

        <label className="text-sm">
          <span className="text-slate-600">Name</span>
          <input required maxLength={200} value={form.name} onChange={(e) => setField('name', e.target.value)} className={inputClass} />
        </label>

        <label className="text-sm">
          <span className="text-slate-600">Category</span>
          <select required value={form.categoryId} onChange={(e) => setField('categoryId', e.target.value)} className={inputClass}>
            <option value="">Select…</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="text-slate-600">Price</span>
          <input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setField('price', e.target.value)} className={inputClass} />
        </label>

        <label className="text-sm">
          <span className="text-slate-600">Stock</span>
          <input required type="number" min="0" step="1" value={form.stockQuantity} onChange={(e) => setField('stockQuantity', e.target.value)} className={inputClass} />
        </label>

        <label className="text-sm sm:col-span-2">
          <span className="text-slate-600">Description</span>
          <textarea maxLength={2000} rows={3} value={form.description} onChange={(e) => setField('description', e.target.value)} className={inputClass} />
        </label>

        <div className="sm:col-span-2 flex gap-2">
          <button type="submit" disabled={saving} className="rounded bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700 disabled:opacity-60">
            {editingId === null ? 'Add' : 'Save'}
          </button>
          {editingId !== null && (
            <button type="button" onClick={reset} className="rounded border border-slate-300 px-4 py-2">
              Cancel
            </button>
          )}
        </div>
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
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2 text-right">Price</th>
              <th className="px-4 py-2 text-right">Stock</th>
              <th className="px-4 py-2 w-40" />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-3 text-slate-500">Loading…</td>
              </tr>
            )}
            {!loading && products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-3 text-slate-500">No products yet.</td>
              </tr>
            )}
            {products.map((product) => (
              <tr key={product.id} className="border-t border-slate-100">
                <td className="px-4 py-2">{product.id}</td>
                <td className="px-4 py-2">{product.name}</td>
                <td className="px-4 py-2">{product.categoryName}</td>
                <td className="px-4 py-2 text-right">{product.price.toFixed(2)}</td>
                <td className="px-4 py-2 text-right">{product.stockQuantity}</td>
                <td className="px-4 py-2 text-right space-x-3">
                  <button onClick={() => startEdit(product)} className="text-indigo-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(product)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
