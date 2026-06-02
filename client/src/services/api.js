import axios from 'axios'

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL}/api` 
    : 'https://medicare-backend-44gu.onrender.com/api'
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    const originalRequest = err.config

    if (err.response?.status === 401) {
      // 🌟 RULE 1: If the 401 happens on authentication checks, DO NOT redirect!
      if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/me')) {
        return Promise.reject(err)
      }

      // 🌟 RULE 2: Only clear tokens and redirect if the user was genuinely inside an active session
      localStorage.removeItem('token')
      
      // Stop loop conditions if they are already on an auth screen
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api