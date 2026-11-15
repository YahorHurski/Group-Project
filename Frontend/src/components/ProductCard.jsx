import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
  const inStock = product.stockQuantity > 0

  return (
    <article className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
            {product.categoryName || 'Uncategorized'}
          </span>
          <span
            className={`text-xs font-medium ${
              inStock ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {inStock ? `In stock: ${product.stockQuantity}` : 'Out of stock'}
          </span>
        </div>

        <h2 className="text-lg font-semibold text-slate-900 line-clamp-1">
          <Link to={`/products/${product.id}`} className="hover:text-indigo-600">
            {product.name}
          </Link>
        </h2>

        <p className="text-sm text-slate-600 line-clamp-2 min-h-[2.5rem]">
          {product.description || 'No description provided.'}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-lg font-bold text-slate-900">
          ${Number(product.price).toFixed(2)}
        </span>

        <Link
          to={`/products/${product.id}`}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          Details
        </Link>
      </div>
    </article>
  )
}