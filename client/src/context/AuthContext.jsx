import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  //import axios from 'axios'

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

  // Anti-Crash Secure Login
  const login = async (email, password, role) => {
    try {
      const res = await api.post('/auth/login', { email, password, role })
      
      // Guard: Ensure properties exist before mutating React state
      if (res?.data?.token && res?.data?.user) {
        localStorage.setItem('token', res.data.token)
        setUser(res.data.user)
        return { success: true, user: res.data.user }
      }
      
      throw new Error('Malformed structural authentication payload from server.')
    } catch (err) {
      console.error('❌ Authentication service intercept failure:', err.response?.data || err.message)
      
      // 🌟 FIX: Dynamic fallback strategy to catch .error, .message, or generic status codes
      const backendError = err.response?.data?.error || err.response?.data?.message || err.message || 'Authentication services down.'
      
      return { 
        success: false, 
        error: backendError
      }
    }
  }

  // Anti-Crash Secure Registration
  const register = async (data) => {
    try {
      const res = await api.post('/auth/register', data)
      
      // Guard: Ensure structure integrity
      if (res?.data?.token && res?.data?.user) {
        localStorage.setItem('token', res.data.token)
        setUser(res.data.user)
        return { success: true, user: res.data.user }
      }
      
      throw new Error('Malformed structural registration payload from server.')
    } catch (err) {
      console.error('❌ Registration service intercept failure:', err.response?.data || err.message)
      
      // 🌟 FIX: Dynamic fallback strategy here as well
      const backendError = err.response?.data?.error || err.response?.data?.message || err.message || 'Registration services down.'
      
      return { 
        success: false, 
        error: backendError 
      }
    }
  }

  // Secure Logout
  const logout = () => {
    try {
      localStorage.removeItem('token')
      setUser(null)
    } catch (err) {
      console.error('⚠️ State clear handling warning:', err.message)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)