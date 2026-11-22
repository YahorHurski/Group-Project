import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CatalogPage from './CatalogPage.jsx'
import { categoriesApi, productsApi } from '../services/api.js'

vi.mock('../services/api.js', () => ({
    categoriesApi: { list: vi.fn() },
    productsApi: { list: vi.fn() },
}))

vi.mock('../context/AuthContext.jsx', () => ({
    useAuth: () => ({ user: null, isAdmin: false, logout: vi.fn() }),
}))

const laptop = {
    id: 1,
    name: 'Gaming Laptop',
    description: 'Fast machine',
    price: 2000,
    stockQuantity: 5,
    categoryId: 1,
    categoryName: 'Computers',
}
const mouse = { ...laptop, id: 2, name: 'Wireless Mouse', price: 25, categoryName: 'Computers' }

const categories = [
    { id: 1, name: 'Computers' },
    { id: 2, name: 'Books' },
]

function renderCatalog(url = '/') {
    return render(
        <MemoryRouter initialEntries={[url]}>
            <CatalogPage />
        </MemoryRouter>,
    )
}

function deferred() {
    let resolve
    let reject
    const promise = new Promise((res, rej) => {
        resolve = res
        reject = rej
    })
    return { promise, resolve, reject }
}

const lastCallArgs = () => productsApi.list.mock.calls.at(-1)[0]

beforeEach(() => {
    categoriesApi.list.mockResolvedValue(categories)
    productsApi.list.mockResolvedValue([laptop, mouse])
})

describe('CatalogPage states', () => {
    it('shows a loading skeleton, then the products', async () => {
        const pending = deferred()
        productsApi.list.mockReturnValueOnce(pending.promise)

        renderCatalog()

        expect(screen.getByLabelText('Loading products')).toBeInTheDocument()

        pending.resolve([laptop, mouse])

        expect(await screen.findByText('Gaming Laptop')).toBeInTheDocument()
        expect(screen.getByText('Wireless Mouse')).toBeInTheDocument()
        expect(screen.queryByLabelText('Loading products')).not.toBeInTheDocument()
        expect(screen.getByText(/Showing 2 products/)).toBeInTheDocument()
    })

    it('shows the error and recovers with "Try again"', async () => {
        productsApi.list.mockRejectedValueOnce(new Error('Cannot reach the server.'))

        renderCatalog()

        const alert = await screen.findByRole('alert')
        expect(alert).toHaveTextContent('Cannot reach the server.')

        await userEvent.click(screen.getByRole('button', { name: 'Try again' }))

        expect(await screen.findByText('Gaming Laptop')).toBeInTheDocument()
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
        expect(productsApi.list).toHaveBeenCalledTimes(2)
    })

    it('shows the empty state when the API returns no products', async () => {
        productsApi.list.mockResolvedValue([])

        renderCatalog()

        expect(await screen.findByText('No products found')).toBeInTheDocument()
    })

    it('keeps the page usable when categories fail to load', async () => {
        categoriesApi.list.mockRejectedValue(new Error('Failed to load categories.'))

        renderCatalog()

        expect(await screen.findByText('Failed to load categories.')).toBeInTheDocument()
        expect(await screen.findByText('Gaming Laptop')).toBeInTheDocument()
    })
})

describe('CatalogPage API filtering', () => {
    it('requests the unfiltered catalog first', async () => {
        renderCatalog()

        await screen.findByText('Gaming Laptop')

        expect(lastCallArgs()).toEqual({
            search: '',
            categoryId: '',
            minPrice: '',
            maxPrice: '',
            inStock: false,
        })
    })

    it('sends the search text to the API (debounced)', async () => {
        renderCatalog()
        await screen.findByText('Gaming Laptop')
        productsApi.list.mockClear()

        await userEvent.type(screen.getByPlaceholderText(/search by product name/i), 'mouse')

        await waitFor(() => expect(lastCallArgs().search).toBe('mouse'))
        // Typing five characters must not produce five requests.
        expect(productsApi.list.mock.calls.length).toBeLessThan(5)
    })

    it('sends the selected category, stock and price filters', async () => {
        renderCatalog()
        await screen.findByText('Gaming Laptop')

        await userEvent.selectOptions(screen.getByRole('combobox'), 'Books')
        await userEvent.click(screen.getByRole('checkbox', { name: /in stock only/i }))
        await userEvent.type(screen.getByPlaceholderText('0'), '10')
        await userEvent.type(screen.getByPlaceholderText('Any'), '500')

        await waitFor(() =>
            expect(lastCallArgs()).toEqual({
                search: '',
                categoryId: '2',
                minPrice: '10',
                maxPrice: '500',
                inStock: true,
            }),
        )
    })

    it('restores filters from the URL', async () => {
        renderCatalog('/?search=lap&categoryId=1&maxPrice=3000&inStock=true')

        await screen.findByText('Gaming Laptop')

        expect(lastCallArgs()).toEqual({
            search: 'lap',
            categoryId: '1',
            minPrice: '',
            maxPrice: '3000',
            inStock: true,
        })
        expect(screen.getByPlaceholderText(/search by product name/i)).toHaveValue('lap')
        expect(screen.getByRole('checkbox', { name: /in stock only/i })).toBeChecked()
    })

    it('resets every filter with "Reset filters"', async () => {
        renderCatalog('/?search=lap&inStock=true')
        await screen.findByText('Gaming Laptop')

        await userEvent.click(screen.getByRole('button', { name: 'Reset filters' }))

        await waitFor(() =>
            expect(lastCallArgs()).toEqual({
                search: '',
                categoryId: '',
                minPrice: '',
                maxPrice: '',
                inStock: false,
            }),
        )
        expect(screen.getByPlaceholderText(/search by product name/i)).toHaveValue('')
    })

    it('does not call the API for an inverted price range', async () => {
        renderCatalog()
        await screen.findByText('Gaming Laptop')
        productsApi.list.mockClear()

        await userEvent.type(screen.getByPlaceholderText('0'), '100')
        await userEvent.type(screen.getByPlaceholderText('Any'), '10')

        expect(await screen.findByText('Min price cannot be greater than max price.')).toBeInTheDocument()
        // Intermediate values are fine (min 100 / max 1, 10), but the inverted range must never reach the API.
        const invertedRequests = productsApi.list.mock.calls.filter(
            ([args]) => args.minPrice !== '' && args.maxPrice !== '' && Number(args.minPrice) > Number(args.maxPrice),
        )
        expect(invertedRequests).toHaveLength(0)
        expect(screen.queryByText('Gaming Laptop')).not.toBeInTheDocument()
    })

    it('ignores a stale response that arrives after a newer one', async () => {
        const slow = deferred()
        productsApi.list.mockReset()
        productsApi.list
            .mockReturnValueOnce(slow.promise) // initial, unfiltered request - answers last
            .mockResolvedValueOnce([mouse]) // filtered request - answers first

        renderCatalog()
        await userEvent.click(screen.getByRole('checkbox', { name: /in stock only/i }))

        expect(await screen.findByText('Wireless Mouse')).toBeInTheDocument()

        slow.resolve([laptop, mouse])
        await Promise.resolve()

        await waitFor(() => expect(screen.queryByText('Gaming Laptop')).not.toBeInTheDocument())
        expect(screen.getByText('Wireless Mouse')).toBeInTheDocument()
    })
})
