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
      // If the 401 happens on login, bypass redirection so your Toast error can render!
      if (originalRequest.url.includes('/auth/login')) {
        return Promise.reject(err)
      }

      // Handle actual session timeouts on authenticated routes safely
      localStorage.removeItem('token')
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api