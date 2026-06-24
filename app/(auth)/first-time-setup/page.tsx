'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Loader2, LockKeyhole, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { changePassword, auth } from '@/services/auth-service'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function FirstTimeSetupPage() {
  const router = useRouter()
  const { logoutUser, isAuthenticated, loading: authLoading } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.replace('/login')
        return
      }
      const user = auth.getUser()
      if (!user?.must_change_password) {
        router.replace('/dashboard')
      }
    }
  }, [authLoading, isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await changePassword(password)
      if (result.success) {
        // Update local state to remove the flag
        const user = auth.getUser()
        if (user) {
          user.must_change_password = false
          localStorage.setItem('user', JSON.stringify(user))
        }
        // Proceed to dashboard
        router.push('/dashboard')
      } else {
        setError(result.error || 'Failed to change password')
      }
    } catch (err) {
      console.error(err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex justify-center bg-[#f5f7fb]">
      <div className="w-full flex items-center justify-center p-4 bg-muted relative">
        <div className="w-full bg-white border border-border rounded-xl shadow-xl p-8 max-w-[420px] mx-auto z-10">
          <div className="mb-6 flex flex-col items-center justify-center">
            <Image
              src="/aabhar/logo.svg"
              alt="HDFC Bank Logo"
              width={270}
              height={60}
              className="object-contain mb-4"
            />
            <h2 className="text-xl md:text-2xl text-foreground font-bold text-center mt-4">
              Set New Password
            </h2>
            <p className="text-sm text-muted-foreground text-center mt-2">
              For security reasons, you must change your default password before continuing.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <LockKeyhole className="h-4 w-4" />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-md border-border pl-10 pr-10 focus-visible:ring-ring/20 focus-visible:border-primary"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <LockKeyhole className="h-4 w-4" />
                </div>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 rounded-md border-border pl-10 pr-10 focus-visible:ring-ring/20 focus-visible:border-primary"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-md text-base bg-[#1c2c5b] hover:bg-[#131d3d] transition-all duration-150 text-white font-medium shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving...
                </span>
              ) : (
                'Update Password'
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={logoutUser}
              disabled={loading}
              className="w-full h-11 rounded-md text-base mt-2"
            >
              Logout
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
