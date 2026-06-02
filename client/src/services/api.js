import axios from 'axios'
import toast from 'react-hot-toast'

// Determine API URL based on environment
const getAPIUrl = () => {
  // Local development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000'
  }

  // Using VITE_API_URL from .env
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }

  // Production/deployed — your Render backend
  if (window.location.hostname.includes('vercel.app') || window.location.hostname !== 'localhost') {
    return 'https://medicare-backend-44gu.onrender.com'
  }

  // Fallback to Render
  return 'https://medicare-backend-44gu.onrender.com'
}

const API_URL = getAPIUrl()
console.log('✅ API Base URL:', API_URL)
console.log('✅ Environment:', window.location.hostname)

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

console.log('✅ Full API endpoint:', `${API_URL}/api`)

// Request interceptor — add JWT token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('🔐 Token added to request:', config.url)
    }
    console.log('📤 Request:', config.method?.toUpperCase(), config.url)
    return config
  },
  error => {
    console.error('❌ Request error:', error.message)
    toast.error('Request failed. Please try again.')
    return Promise.reject(error)
  }
)

// Response interceptor — handle errors globally
api.interceptors.response.use(
  res => {
    console.log('✅ Response:', res.status, res.config.url)
    return res
  },
  error => {
    const status = error.response?.status
    const message = error.response?.data?.error || error.message
    const url = error.config?.url

    // Log detailed error info
    console.error('❌ API Error Details:', {
      status,
      message,
      url,
      fullURL: `${API_URL}/api${url}`,
      timestamp: new Date().toISOString()
    })

    // Handle different error types
    if (!error.response) {
      // Network error — no response from server
      console.error('🌐 Network Error — backend may be down:', error.message)
      toast.error('Network error. Check your connection or backend is running.')
      return Promise.reject(error)
    }

    // 400 — Bad Request / Validation Error
    if (status === 400) {
      console.warn('⚠️ Bad Request (400):', message)
      // Don't show toast here — let component handle it
      return Promise.reject(error)
    }

    // 401 — Unauthorized / Session Expired / Invalid Credentials
    if (status === 401) {
      const isLoginPage = window.location.pathname === '/login'
      
      if (!isLoginPage) {
        // Session expired on other pages
        console.warn('⚠️ Session Expired (401) — redirecting to login')
        localStorage.removeItem('token')
        toast.error('Session expired. Please login again.')
        window.location.href = '/login'
      } else {
        // Login page — invalid credentials, let login page handle it
        console.warn('⚠️ Invalid Credentials (401)')
      }
      return Promise.reject(error)
    }

    // 403 — Forbidden / Access Denied
    if (status === 403) {
      console.warn('⚠️ Access Denied (403):', message)
      toast.error('Access denied. Insufficient permissions.')
      return Promise.reject(error)
    }

    // 404 — Not Found
    if (status === 404) {
      console.warn('⚠️ Endpoint Not Found (404):', url)
      toast.error('API endpoint not found. Check your backend URL.')
      return Promise.reject(error)
    }

    // 409 — Conflict (e.g., email already exists)
    if (status === 409) {
      console.warn('⚠️ Conflict (409):', message)
      return Promise.reject(error)
    }

    // 429 — Too Many Requests
    if (status === 429) {
      console.warn('⚠️ Rate Limited (429)')
      toast.error('Too many requests. Please try again later.')
      return Promise.reject(error)
    }

    // 500+ — Server Error
    if (status >= 500) {
      console.error('❌ Server Error (' + status + '):', message)
      toast.error('Server error. Please try again later.')
      return Promise.reject(error)
    }

    // Unknown error
    console.error('❌ Unknown Error (' + status + '):', message)
    toast.error('An unexpected error occurred.')
    return Promise.reject(error)
  }
)

export default api