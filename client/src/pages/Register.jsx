import React, { useState } from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'

const ORG_DOMAIN = '@techtitan.com' // client-side allowed domain (backend is authoritative)

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  function validate() {
    if (!name.trim()) return 'Name is required'
    if (!email.includes('@')) return 'Email is invalid'
    if (!email.endsWith(ORG_DOMAIN)) return `Email must belong to ${ORG_DOMAIN}`
    if (password.length < 8) return 'Password must be at least 8 characters'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const v = validate()
    if (v) return setError(v)
    setLoading(true)
    try {
      await api.post('/api/auth/register', { email, password, username: name, displayName: name })
      // On success, redirect to login
      navigate('/login')
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', padding: 16 }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block' }}>Name</label>
          <input aria-label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block' }}>Email</label>
          <input aria-label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block' }}>Password</label>
          <input aria-label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        <button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
      </form>
    </div>
  )
}
