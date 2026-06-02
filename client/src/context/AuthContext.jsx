import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Verify user on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.get('/auth/me')
        .then(res => {
          if (res.data?.user) {
            setUser(res.data.user)
            setError(null)
          }
        })
        .catch(err => {
          console.error('Auth verification failed:', err)
          localStorage.removeItem('token')
          setError('Session expired')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password, role) => {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required')
      }

      const res = await api.post('/auth/login', { email, password, role })
      
      if (!res.data?.token || !res.data?.user) {
        throw new Error('Invalid response from server')
      }

      localStorage.setItem('token', res.data.token)
      setUser(res.data.user)
      setError(null)
      return res.data.user
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Login failed'
      setError(message)
      throw err
    }
  }

  const register = async (data) => {
    try {
      if (!data.name || !data.email || !data.password) {
        throw new Error('Name, email, and password are required')
      }

      if (data.password.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }

      const res = await api.post('/auth/register', data)
      
      if (!res.data?.token || !res.data?.user) {
        throw new Error('Invalid response from server')
      }

      localStorage.setItem('token', res.data.token)
      setUser(res.data.user)
      setError(null)
      return res.data.user
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Registration failed'
      setError(message)
      throw err
    }
  }

  const logout = () => {
    try {
      localStorage.removeItem('token')
      setUser(null)
      setError(null)
    } catch (err) {
      console.error('Logout error:', err)
      toast.error('Error during logout')
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}