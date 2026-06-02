import axios from 'axios'
import toast from 'react-hot-toast'

// Determine API base URL based on environment
const getBaseURL = () => {
  const currentOrigin = window.location.origin

  // Production URLs — update with your actual backend URL
  if (currentOrigin.includes('medicare-azure-six.vercel.app')) {
    return 'https://your-backend-production-url.com/api'  // ← Update this
  }
  if (currentOrigin.includes('medicare-q52gs2p9t')) {
    return 'https://your-backend-staging-url.com/api'  // ← Update this
  }

  // Development with .env
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }

  // Default to localhost
  return 'http://localhost:5000/api'
}

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

console.log('API Base URL:', getBaseURL())  // Debug: see which URL is being used

// Request interceptor — add JWT token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('Request error:', error)
    toast.error('Request failed. Please try again.')
    return Promise.reject(error)
  }
)

// Response interceptor — handle errors globally
api.interceptors.response.use(
  res => res,
  error => {
    const status = error.response?.status
    const message = error.response?.data?.error || error.message

    // 401 — Unauthorized / Expired token
    if (status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
      toast.error('Session expired. Please login again.')
    }
    // 403 — Forbidden
    else if (status === 403) {
      toast.error('Access denied. Insufficient permissions.')
    }
    // 404 — Not found
    else if (status === 404) {
      console.warn('Resource not found:', error.config?.url)
    }
    // 400 — Bad request / Validation error
    else if (status === 400) {
      console.error('Validation error:', message)
    }
    // 500+ — Server error
    else if (status >= 500) {
      toast.error('Server error. Please try again later.')
      console.error('Server error:', error.response?.data)
    }
    // Network error
    else if (!status) {
      toast.error('Network error. Check your connection.')
      console.error('Network error:', error.message)
    }

    return Promise.reject(error)
  }
)

export default api