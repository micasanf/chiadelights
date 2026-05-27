'use client'

import { useState, useEffect } from 'react'
import { Leaf, Loader2, LogOut, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import AdminDashboard from '@/components/admin/AdminDashboard'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [error, setError] = useState('')

  // Check if already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/verify')
        if (res.ok) {
          const data = await res.json()
          if (data.authenticated) {
            setIsAuthenticated(true)
          }
        }
      } catch {
        // Not authenticated
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoggingIn(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        return
      }

      setIsAuthenticated(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
    } catch {
      // Ignore errors
    }
    setIsAuthenticated(false)
    setUsername('')
    setPassword('')
  }

  // Loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ─── Admin Navbar ─── */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">ChiaDelights</span>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium ml-1">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5">
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            )}
            <a href="/">
              <Button size="sm" variant="outline">
                <Leaf className="w-4 h-4 mr-1" /> Back to Store
              </Button>
            </a>
          </div>
        </div>
      </nav>

      {/* ─── Content ─── */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <AnimatePresence mode="wait">
          {!isAuthenticated ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center min-h-[60vh]"
            >
              <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-8 h-8 text-emerald-600" />
                  </div>
                  <CardTitle className="text-2xl">Admin Login</CardTitle>
                  <CardDescription>
                    Enter your credentials to access the dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value)
                          if (error) setError('')
                        }}
                        required
                        autoComplete="username"
                        disabled={isLoggingIn}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value)
                            if (error) setError('')
                          }}
                          required
                          autoComplete="current-password"
                          disabled={isLoggingIn}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                      </motion.div>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 h-11"
                      disabled={isLoggingIn || !username || !password}
                    >
                      {isLoggingIn ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          Sign In
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="mt-6 pt-4 border-t">
                    <p className="text-xs text-center text-muted-foreground">
                      Default credentials: <span className="font-mono font-medium">admin</span> / <span className="font-mono font-medium">chiadelights2025</span>
                    </p>
                    <p className="text-xs text-center text-muted-foreground mt-1">
                      Change these via environment variables
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage orders, view proofs, and generate reports</p>
              </div>
              <AdminDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ─── Footer ─── */}
      <footer className="bg-emerald-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                <Leaf className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold text-sm">ChiaDelights Admin</span>
            </div>
            <p className="text-xs text-emerald-300">
              &copy; {new Date().getFullYear()} ChiaDelights. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
