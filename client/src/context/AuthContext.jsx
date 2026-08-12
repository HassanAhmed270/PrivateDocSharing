import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user')
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      return null
    }
  })
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('token') || null
    } catch (e) {
      return null
    }
  })
  const [loading, setLoading] = useState(Boolean(token))

  // Rehydrate on mount if token exists
  useEffect(() => {
    let mounted = true
    async function rehydrate() {
      if (!token) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const res = await api.get('/api/auth/me')
        if (!mounted) return
        setUser(res.data.user || res.data) // backend may return { user }
        // keep token as-is in localStorage
      } catch (err) {
        // token invalid or request failed -> clear
        try {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        } catch (e) {}
        setUser(null)
        setToken(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    rehydrate()
    return () => (mounted = false)
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password })
    // Expect backend to return { token, user } or { accessToken, user }
    const data = res.data
    const tokenFromServer = data.token || data.accessToken || data.access_token
    const userFromServer = data.user || data
    if (!tokenFromServer) throw new Error('No token received')
    try {
      localStorage.setItem('token', tokenFromServer)
      localStorage.setItem('user', JSON.stringify(userFromServer))
    } catch (e) {}
    setToken(tokenFromServer)
    setUser(userFromServer)
    return { user: userFromServer, token: tokenFromServer }
  }

  const logout = () => {
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } catch (e) {}
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export default AuthContext
