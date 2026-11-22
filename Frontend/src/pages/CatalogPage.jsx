import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { categoriesApi, productsApi } from '../services/api.js'

export default function CatalogPage() {
    const { user, isAdmin, logout } = useAuth()

    // Filters live in the URL so the page is linkable and survives reloads / back navigation.
    const [searchParams, setSearchParams] = useSearchParams()
    const searchInput = searchParams.get('search') ?? ''
    const selectedCategory = searchParams.get('categoryId') ?? ''
    const minPrice = searchParams.get('minPrice') ?? ''
    const maxPrice = searchParams.get('maxPrice') ?? ''
    const onlyInStock = searchParams.get('inStock') === 'true'

    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [debouncedSearch, setDebouncedSearch] = useState(searchInput)
    const [debouncedPrices, setDebouncedPrices] = useState({ minPrice, maxPrice })

    // Loading & error states
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [categoriesError, setCategoriesError] = useState('')

    const requestId = useRef(0)

    function updateFilter(key, value) {
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams(prev)
                if (value === '' || value === false || value == null) next.delete(key)
                else next.set(key, String(value))
                return next
            },
            { replace: true },
        )
    }

    // Debounce free-text and price inputs so every keystroke does not hit the API
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput)
            setDebouncedPrices({ minPrice, maxPrice })
        }, 300)
        return () => clearTimeout(timer)
    }, [searchInput, minPrice, maxPrice])

    // Load categories once
    useEffect(() => {
        let active = true
        categoriesApi
            .list()
            .then((data) => {
                if (active) setCategories(data || [])
            })
            .catch((err) => {
                if (active) setCategoriesError(err.message || 'Failed to load categories.')
            })
        return () => {
            active = false
        }
    }, [])

    const priceError =
        debouncedPrices.minPrice !== '' &&
        debouncedPrices.maxPrice !== '' &&
        Number(debouncedPrices.minPrice) > Number(debouncedPrices.maxPrice)
            ? 'Min price cannot be greater than max price.'
            : ''

    // Load products from the API whenever the (debounced) filters change
    const fetchProducts = useCallback(async () => {
        const id = ++requestId.current
        setLoading(true)
        setError('')
        try {
            const data = await productsApi.list({
                search: debouncedSearch,
                categoryId: selectedCategory,
                minPrice: debouncedPrices.minPrice,
                maxPrice: debouncedPrices.maxPrice,
                inStock: onlyInStock,
            })
            // Ignore stale responses from superseded requests
            if (id !== requestId.current) return
            setProducts(data || [])
        } catch (err) {
            if (id !== requestId.current) return
            setError(err.message || 'Failed to load products.')
        } finally {
            if (id === requestId.current) setLoading(false)
        }
    }, [debouncedSearch, selectedCategory, debouncedPrices, onlyInStock])

    useEffect(() => {
        if (priceError) {
            requestId.current++ // drop any in-flight response
            return
        }
        fetchProducts()
    }, [fetchProducts, priceError])

    const setSearchInput = (v) => updateFilter('search', v)
    const setSelectedCategory = (v) => updateFilter('categoryId', v)
    const setMinPrice = (v) => updateFilter('minPrice', v)
    const setMaxPrice = (v) => updateFilter('maxPrice', v)
    const setOnlyInStock = (v) => updateFilter('inStock', v)

    function handleResetFilters() {
        setSearchParams({}, { replace: true })
        setDebouncedSearch('')
        setDebouncedPrices({ minPrice: '', maxPrice: '' })
    }

    const hasActiveFilters =
        searchInput || selectedCategory || minPrice !== '' || maxPrice !== '' || onlyInStock

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            {/* Top Navbar */}
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
                    <Link to="/" className="text-xl font-bold text-indigo-600">
                        Online Store
                    </Link>

                    <nav className="flex items-center gap-3 text-sm">
                        {isAdmin && (
                            <Link
                                to="/admin"
                                className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 font-medium text-indigo-700 hover:bg-indigo-100"
                            >
                                Admin panel
                            </Link>
                        )}
                        {user ? (
                            <>
                                <span className="text-slate-600">{user.email}</span>
                                <button
                                    onClick={logout}
                                    className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-100"
                                >
                                    Sign out
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="rounded-lg bg-indigo-600 px-3 py-1.5 font-medium text-white hover:bg-indigo-700"
                            >
                                Sign in
                            </Link>
                        )}
                    </nav>
                </div>
            </header>

            <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Product Catalog</h1>
                    <p className="text-sm text-slate-500">
                        Browse products, search by name or description, and filter by category or price.
                    </p>
                </div>

                {/* Search & Filter Bar */}
                <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Search input */}
                        <div className="lg:col-span-2">
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                Search
                            </label>
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search by product name or description..."
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            />
                        </div>

                        {/* Category filter */}
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                Category
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                            >
                                <option value="">All categories</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            {categoriesError && (
                                <p className="mt-1 text-xs text-amber-600">{categoriesError}</p>
                            )}
                        </div>

                        {/* Price range */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Min price ($)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    placeholder="0"
                                    className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Max price ($)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    placeholder="Any"
                                    className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={onlyInStock}
                                onChange={(e) => setOnlyInStock(e.target.checked)}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            In stock only
                        </label>

                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                            >
                                Reset filters
                            </button>
                        )}
                    </div>
                </section>

                {priceError && (
                    <p role="alert" className="text-sm text-amber-700">
                        {priceError}
                    </p>
                )}

                {/* Error State */}
                {error && (
                    <div
                        role="alert"
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                    >
                        <div>
                            <p className="font-semibold">Unable to load products</p>
                            <p>{error}</p>
                        </div>
                        <button
                            type="button"
                            onClick={fetchProducts}
                            className="rounded-lg bg-red-600 px-3 py-1.5 font-medium text-white hover:bg-red-700"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* Loading State (Skeleton grid) */}
                {loading && !error && !priceError && (
                    <div
                        aria-label="Loading products"
                        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        {Array.from({ length: 6 }).map((_, idx) => (
                            <div
                                key={idx}
                                className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 space-y-3"
                            >
                                <div className="flex justify-between">
                                    <div className="h-5 w-20 rounded-full bg-slate-200" />
                                    <div className="h-4 w-16 rounded bg-slate-200" />
                                </div>
                                <div className="h-6 w-3/4 rounded bg-slate-200" />
                                <div className="h-4 w-full rounded bg-slate-200" />
                                <div className="h-4 w-2/3 rounded bg-slate-200" />
                                <div className="flex justify-between pt-3 border-t border-slate-100">
                                    <div className="h-6 w-16 rounded bg-slate-200" />
                                    <div className="h-8 w-20 rounded-lg bg-slate-200" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && !priceError && products.length === 0 && (
                    <div className="rounded-xl border border-slate-200 bg-white p-10 text-center space-y-3">
                        <p className="text-lg font-semibold text-slate-800">No products found</p>
                        <p className="text-sm text-slate-500">
                            Try adjusting your search query or clearing active filters.
                        </p>
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                )}

                {/* Products Grid */}
                {!loading && !error && !priceError && products.length > 0 && (
                    <>
                        <p className="text-xs text-slate-500">
                            Showing {products.length} product
                            {products.length === 1 ? '' : 's'}
                        </p>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}
