// app/login/page.tsx
'use client'
import { signInWithMagicLink, verifySupabaseInit } from '@/lib/auth'
import { useState, useEffect } from 'react'

export default function LoginPage() {
  const [message, setMessage] = useState('')
  const [initError, setInitError] = useState('')

  useEffect(() => {
    try {
      verifySupabaseInit()
    } catch (error) {
      setInitError(error instanceof Error ? error.message : 'Configuration error')
    }
  }, [])

  const handleLogin = async () => {
    setMessage('Sending login link...')
    try {
      const { error } = await signInWithMagicLink()
      setMessage(error 
        ? `Error: ${error.message}` 
        : 'Login link sent to your email!'
      )
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to send login link')
    }
  }

  if (initError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-900 p-8 rounded-lg max-w-md w-full">
          <h2 className="text-xl font-bold text-white mb-4">Configuration Error</h2>
          <p className="text-red-200">{initError}</p>
          <p className="mt-4 text-red-200 text-sm">
            Please check your environment variables
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-yellow-400 mb-4">Time Tracker Login</h1>
        <button
          onClick={handleLogin}
          disabled={!!initError}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Send Magic Link
        </button>
        {message && (
          <p className={`mt-4 ${message.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  )
}