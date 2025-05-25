import React, { useState } from 'react'
import { Mail, Lock, Briefcase, User, AlertCircle } from 'lucide-react'
import { supabase, UserType } from '../lib/supabase'

interface LoginProps {
  onSwitch: () => void
  onSuccess: (type: UserType) => void
}

function Login({ onSwitch, onSuccess }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accountType, setAccountType] = useState<UserType>('freelancer')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Client-side validation
    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) {
        // Handle specific error cases
        if (signInError.message.includes('Invalid login credentials')) {
          throw new Error(
            'Invalid email or password. Please check your credentials and try again. ' +
            'If you recently signed up, make sure to verify your email first.'
          )
        }
        if (signInError.message.includes('Email not confirmed')) {
          throw new Error(
            'Please verify your email address before logging in. ' +
            'Check your inbox for the verification email.'
          )
        }
        throw signInError
      }

      if (!data.user) {
        throw new Error('No user found')
      }

      // Check user type from profile tables
      const { data: freelancerProfile, error: freelancerError } = await supabase
        .from('freelancer_profiles')
        .select('id')
        .eq('user_id', data.user.id)
        .maybeSingle()

      if (freelancerError) {
        throw new Error('Error checking freelancer profile')
      }

      const { data: clientProfile, error: clientError } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', data.user.id)
        .maybeSingle()

      if (clientError) {
        throw new Error('Error checking client profile')
      }

      // Determine user type based on existing profile
      if (freelancerProfile) {
        onSuccess('freelancer')
      } else if (clientProfile) {
        onSuccess('client')
      } else {
        throw new Error('Profile not found. Please sign up first.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      })

      if (error) throw error

      setError('Verification email resent. Please check your inbox.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend verification email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-[800px] w-full">
      <h2 className="text-2xl font-bold text-center mb-8 text-primary">Welcome Back</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-700">
          <AlertCircle className="shrink-0 mr-2 mt-1" size={20} />
          <div className="flex-1">
            <p className="text-sm">{error}</p>
            {error.includes('verify your email') && (
              <button
                onClick={handleResendVerification}
                className="text-sm text-red-700 underline mt-2 hover:text-red-800"
                disabled={loading}
              >
                Resend verification email
              </button>
            )}
          </div>
        </div>
      )}

      {/* Account Type Selection */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setAccountType('freelancer')}
          className={`flex-1 p-6 rounded-lg border-2 transition-all ${
            accountType === 'freelancer'
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 hover:border-primary/50'
          }`}
        >
          <div className="flex justify-center mb-4">
            <Briefcase size={32} className={accountType === 'freelancer' ? 'text-primary' : 'text-gray-400'} />
          </div>
          <h3 className="text-lg font-semibold text-center">Freelancer</h3>
        </button>

        <button
          onClick={() => setAccountType('client')}
          className={`flex-1 p-6 rounded-lg border-2 transition-all ${
            accountType === 'client'
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 hover:border-primary/50'
          }`}
        >
          <div className="flex justify-center mb-4">
            <User size={32} className={accountType === 'client' ? 'text-primary' : 'text-gray-400'} />
          </div>
          <h3 className="text-lg font-semibold text-center">Client</h3>
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError(null)
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              placeholder="Enter your email"
              required
            />
            <Mail className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (error) setError(null)
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              placeholder="Enter your password (min. 6 characters)"
              required
              minLength={6}
            />
            <Lock className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-[#00704A]" />
            <span className="ml-2 text-sm text-gray-600">Remember me</span>
          </label>
          <a href="#" className="text-sm text-primary hover:underline">Forgot password?</a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-2 rounded-lg hover:bg-[#005538] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <button onClick={onSwitch} className="text-primary hover:underline">
          Sign up
        </button>
      </p>
    </div>
  )
}

export default Login