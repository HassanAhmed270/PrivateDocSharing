import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import { AuthProvider, useAuth } from './context/AuthContext'

function Home() {
  const { user, logout } = useAuth()
  return (
    <div style={{ padding: 24 }}>
      <h1>PrivateAI Agent</h1>
      {user ? (
        <div>
          <p>Welcome, {user.name || user.displayName || user.username || user.email}</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <p>Frontend scaffold (Vite + React). Feature work goes on feat/frontend.</p>
          <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

