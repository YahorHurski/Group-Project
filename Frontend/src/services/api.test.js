import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, productsApi, setToken } from './api.js'

function jsonResponse(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    })
}

describe('productsApi.list', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn(async () => jsonResponse([])))
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        setToken(null)
    })

    const requestedUrl = () => fetch.mock.calls[0][0]

    it('requests the plain list when no filters are given', async () => {
        await productsApi.list()

        expect(requestedUrl()).toBe('/api/products')
    })

    it('sends every active filter as a query parameter', async () => {
        await productsApi.list({
            search: '  laptop ',
            categoryId: '3',
            minPrice: '10',
            maxPrice: '99.5',
            inStock: true,
        })

        const params = new URL(requestedUrl(), 'http://localhost').searchParams
        expect(Object.fromEntries(params)).toEqual({
            search: 'laptop',
            categoryId: '3',
            minPrice: '10',
            maxPrice: '99.5',
            inStock: 'true',
        })
    })

    it('omits empty filters but keeps a minimum price of 0', async () => {
        await productsApi.list({ search: '   ', categoryId: '', minPrice: '0', maxPrice: '', inStock: false })

        expect(requestedUrl()).toBe('/api/products?minPrice=0')
    })

    it('attaches the bearer token when a user is signed in', async () => {
        setToken('abc')

        await productsApi.list()

        expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer abc')
    })

    it('throws an ApiError with the validation message on 400', async () => {
        fetch.mockResolvedValueOnce(jsonResponse({ errors: { minPrice: ['minPrice cannot be negative.'] } }, 400))

        const error = await productsApi.list({ minPrice: '-1' }).catch((e) => e)

        expect(error).toBeInstanceOf(ApiError)
        expect(error.status).toBe(400)
        expect(error.message).toBe('minPrice cannot be negative.')
    })

    it('reports an unreachable server as status 0', async () => {
        fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))

        const error = await productsApi.list().catch((e) => e)

        expect(error.status).toBe(0)
        expect(error.message).toBe('Cannot reach the server.')
    })
})
