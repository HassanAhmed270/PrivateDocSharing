import React from 'react'

import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
      <header className="border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <Link to="/" className="font-semibold">PrivateAI Agent</Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  )
}

function Home() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <h1 className="text-2xl font-bold">Welcome — PrivateAI Agent</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-300">This is a placeholder homepage. Frontend work continues on the feat/frontend branch.</p>
      <div className="mt-4">
        <Link to="#" className="text-sky-600">Get started</Link>
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="text-center">
      <h2 className="text-xl font-semibold">404 — Not found</h2>
      <p className="mt-2 text-neutral-500">The page you requested does not exist.</p>
    </div>
  )
}
