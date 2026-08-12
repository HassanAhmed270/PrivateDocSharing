import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: attach Authorization header when token present
api.interceptors.request.use(
  (config) => {
    try {
      const raw = localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('jwt')
      const token = raw && typeof raw === 'string' ? raw : null
      if (token && config && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (err) {
      // ignore localStorage errors
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor: central 401/403 handling
api.interceptors.response.use(
  (response) => response.data ?? response,
  (error) => {
    if (error && error.response) {
      const status = error.response.status
      if (status === 401) {
        // Unauthorized — token invalid or expired. Clear stored auth and redirect to login.
        try {
          // keep minimal user info rules: only remove sensitive fields
          localStorage.removeItem('token')
          localStorage.removeItem('accessToken')
          localStorage.removeItem('jwt')
          localStorage.removeItem('user')
        } catch (e) {}
        // redirect to login page (frontend route)
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
      if (status === 403) {
        // Forbidden — optionally show a toast or redirect. For now, redirect to /unauthorized
        if (typeof window !== 'undefined') {
          window.location.href = '/unauthorized'
        }
      }
    }
    return Promise.reject(error)
  },
)

export default api
