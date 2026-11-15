import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { productsApi } from '../services/api.js'

export default function ProductDetailsPage() {
    const { id } = useParams()

    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [notFound, setNotFound] = useState(false)

    const fetchProduct = useCallback(async () => {
        setLoading(true)
        setError('')
        setNotFound(false)
        try {
            const data = await productsApi.getById(id)
            setProduct(data)
        } catch (err) {
            if (err.status === 404) {
                setNotFound(true)
            } else {
                setError(err.message || 'Failed to load product details.')
            }
        } finally {
            setLoading(false)
        }
    }, [id])

    useEffect(() => {
        fetchProduct()
    }, [fetchProduct])

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
                    <Link to="/" className="text-xl font-bold text-indigo-600">
                        Online Store
                    </Link>
                    <Link
                        to="/"
                        className="text-sm font-medium text-slate-600 hover:text-indigo-600"
                    >
                        &larr; Back to catalog
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-4xl px-4 py-8">
                {/* Loading State */}
                {loading && (
                    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-6 space-y-4">
                        <div className="h-5 w-28 rounded-full bg-slate-200" />
                        <div className="h-8 w-2/3 rounded bg-slate-200" />
                        <div className="h-20 w-full rounded bg-slate-200" />
                        <div className="h-8 w-32 rounded bg-slate-200" />
                    </div>
                )}

                {/* 404 Not Found State */}
                {!loading && notFound && (
                    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center space-y-3">
                        <h1 className="text-xl font-bold text-slate-900">Product not found</h1>
                        <p className="text-sm text-slate-500">
                            The product you are looking for does not exist or was removed.
                        </p>
                        <Link
                            to="/"
                            className="inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                        >
                            Return to catalog
                        </Link>
                    </div>
                )}

                {/* General Error State */}
                {!loading && error && (
                    <div
                        role="alert"
                        className="rounded-xl border border-red-200 bg-red-50 p-6 space-y-3 text-red-700"
                    >
                        <h1 className="text-lg font-semibold">Error loading product</h1>
                        <p className="text-sm">{error}</p>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={fetchProduct}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                            >
                                Try again
                            </button>
                            <Link
                                to="/"
                                className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                            >
                                Back to catalog
                            </Link>
                        </div>
                    </div>
                )}

                {/* Product Details Content */}
                {!loading && !error && !notFound && product && (
                    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                                {product.categoryName || 'Uncategorized'}
                            </span>
                            <span
                                className={`text-sm font-medium ${product.stockQuantity > 0 ? 'text-emerald-600' : 'text-rose-600'
                                    }`}
                            >
                                {product.stockQuantity > 0
                                    ? `In stock (${product.stockQuantity} available)`
                                    : 'Out of stock'}
                            </span>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>
                            <p className="text-2xl font-bold text-indigo-600">
                                ${Number(product.price).toFixed(2)}
                            </p>
                        </div>

                        <div className="border-t border-slate-100 pt-4">
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">
                                Description
                            </h2>
                            <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                                {product.description || 'No description available for this product.'}
                            </p>
                        </div>

                        <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-400">
                            <span>Product ID: #{product.id}</span>
                            <span>Category ID: #{product.categoryId}</span>
                        </div>
                    </article>
                )}
            </main>
        </div>
    )
}