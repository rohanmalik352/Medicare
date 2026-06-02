import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Validate session on app initialization
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.get('/auth/me')
        .then(res => {
          if (res?.data?.user) {
            setUser(res.data.user)
          } else {
            localStorage.removeItem('token')
          }
        })
        .catch((err) => {
          console.warn('⚠️ Session validation failed or token expired:', err.message)
          localStorage.removeItem('token')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

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