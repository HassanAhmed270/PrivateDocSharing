import axios from 'axios'

// Create axios instance with baseURL from Vite env
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || ''
})

// Request interceptor: attach Authorization header when token exists in localStorage
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (err) {
      // Ignore localStorage errors (e.g. server-side rendering or private mode)
      // but do not block the request
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle 401/403 centrally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error && error.response) {
      const status = error.response.status
      if (status === 401) {
        // unauthorized - redirect to login
        try {
          // remove possible stale token
          localStorage.removeItem('token')
        } catch (e) {}
        // Use window.location to force redirect
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      } else if (status === 403) {
        // forbidden - optionally handle (could show a message). For now, redirect to login as well
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
