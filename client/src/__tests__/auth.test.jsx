import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import App from '../App'
import api from '../services/api'

vi.mock('../services/api')

// When mocking the api module, require it after mocking so vitest's hoisting works.
const mockApi = api

describe('Auth pages and session', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetAllMocks()
    // ensure mocked functions exist
    mockApi.post = mockApi.post || vi.fn()
    mockApi.get = mockApi.get || vi.fn()
  })

  it('register blocks invalid domain client-side', async () => {
    render(<App />)
    // navigate to register
    const link = screen.getByText(/Register/i)
    fireEvent.click(link)
    const nameInput = await screen.findByLabelText(/Name/i)
    const emailInput = screen.getByLabelText(/Email/i)
    const passInput = screen.getByLabelText(/Password/i)

    fireEvent.change(nameInput, { target: { value: 'Alice' } })
    fireEvent.change(emailInput, { target: { value: 'alice@gmail.com' } })
    fireEvent.change(passInput, { target: { value: 'password123' } })

    const btn = screen.getByText(/Register/i)
    fireEvent.click(btn)

    await waitFor(() => {
      expect(screen.getByText(/Email must belong to @techtitan.com/i)).toBeInTheDocument()
    })
  })

  it('successful login stores token and user', async () => {
    // mock login response
    mockApi.post.mockResolvedValue({ data: { token: 'tok-123', user: { id: 1, name: 'Bob' } } })
    mockApi.get.mockResolvedValue({ data: { user: { id: 1, name: 'Bob' } } })

    render(<App />)
    // go to login
    const link = screen.getByText(/Login/i)
    fireEvent.click(link)

    const emailInput = await screen.findByLabelText(/Email/i)
    const passInput = screen.getByLabelText(/Password/i)

    fireEvent.change(emailInput, { target: { value: 'bob@techtitan.com' } })
    fireEvent.change(passInput, { target: { value: 'password123' } })

    const btn = screen.getByText(/Login/i)
    fireEvent.click(btn)

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('tok-123')
      expect(JSON.parse(localStorage.getItem('user')).name).toBe('Bob')
    })
  })

  it('invalid token on rehydrate clears session', async () => {
    // set token but make /api/auth/me fail
    localStorage.setItem('token', 'bad-token')
    mockApi.get.mockRejectedValue({ response: { status: 401 } })

    render(<App />)

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull()
    })
  })
})
