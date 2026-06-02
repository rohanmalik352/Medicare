import axios from 'axios'

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL}/api` 
    : 'https://medicare-backend-44gu.onrender.com/api'
})

// Request interceptor remains clean
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Smart response interceptor
api.interceptors.response.use(
  res => res,
  err => {
    const originalRequest = err.config

    if (err.response?.status === 401) {
      // 🌟 FIX: If the 401 error is coming from the login route, DO NOT redirect!
      // Let it pass through to AuthContext so the Toast can display the error message.
      if (originalRequest.url.includes('/auth/login')) {
        return Promise.reject(err)
      }

      // Otherwise, handle an expired token on dashboard routes normally
      console.warn('⚠️ Session expired. Redirecting to login portal.')
      localStorage.removeItem('token')
      
      // Avoid redirect loops if already on public pages
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(err)
  }
)

export default api