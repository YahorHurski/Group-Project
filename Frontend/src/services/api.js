const TOKEN_KEY = 'shop_token'

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // storage unavailable - the session just won't survive a reload
  }
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

// Builds a readable message from an ASP.NET ProblemDetails / validation response.
function errorMessage(body, status) {
  if (body?.errors) {
    return Object.values(body.errors).flat().join(' ')
  }
  if (body?.detail) return body.detail
  if (body?.title) return body.title
  return `Request failed (${status})`
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let response
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'Cannot reach the server.')
  }

  if (response.status === 204) return null

  let data = null
  try {
    data = await response.json()
  } catch {
    // empty or non-JSON body
  }

  if (!response.ok) {
    throw new ApiError(response.status, errorMessage(data, response.status))
  }
  return data
}

export const authApi = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  register: (email, password) => request('/auth/register', { method: 'POST', body: { email, password } }),
  me: () => request('/auth/me'),
}

export const categoriesApi = {
  list: () => request('/categories'),
  create: (data) => request('/categories', { method: 'POST', body: data }),
  update: (id, data) => request(`/categories/${id}`, { method: 'PUT', body: data }),
  remove: (id) => request(`/categories/${id}`, { method: 'DELETE' }),
}

export const productsApi = {
  list: () => request('/products'),
  create: (data) => request('/products', { method: 'POST', body: data }),
  update: (id, data) => request(`/products/${id}`, { method: 'PUT', body: data }),
  remove: (id) => request(`/products/${id}`, { method: 'DELETE' }),
}
