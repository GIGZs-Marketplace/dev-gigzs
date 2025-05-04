import React, { useState } from 'react'
import { User, Mail, Lock, Briefcase, AlertCircle } from 'lucide-react'
import { supabase, supabaseAdmin, UserType } from '../lib/supabase'

interface SignupProps {
  onSwitch: () => void
  onSuccess: (type: UserType) => void
}

function Signup({ onSwitch, onSuccess }: SignupProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    accountType: 'freelancer' as UserType
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate password before submission
    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    setError(null)
    setLoading(true)

    try {
      // Check if user exists first
      const { data: { user: existingUser }, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (existingUser) {
        throw new Error('An account with this email already exists. Please sign in instead.')
      }

      // If user doesn't exist, proceed with sign up
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            account_type: formData.accountType
          }
        }
      })

      if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please sign in instead.')
        }
        throw signUpError
      }

      if (!user) throw new Error('Failed to create account')

      // Sign in the user to establish the session
      const { error: signInAfterSignUpError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (signInAfterSignUpError) {
        throw new Error('Failed to sign in after account creation')
      }

      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (!session) throw new Error('No session established')

      // Create profile based on account type using admin client
      try {
        if (formData.accountType === 'freelancer') {
          const { error: profileError } = await supabaseAdmin
            .from('freelancer_profiles')
            .insert([
              {
                user_id: user.id,
                full_name: formData.name,
              }
            ])
            .select()
          if (profileError) {
            console.error('Error creating freelancer profile:', profileError)
            throw new Error('Failed to create freelancer profile')
          }
        } else {
          const { error: profileError } = await supabaseAdmin
            .from('client_profiles')
            .insert([
              {
                user_id: user.id,
                company_name: formData.name,
              }
            ])
            .select()
          if (profileError) {
            console.error('Error creating client profile:', profileError)
            throw new Error('Failed to create client profile')
          }
        }
        
        onSuccess(formData.accountType)
      } catch (profileErr) {
        // If profile creation fails, delete the user to maintain consistency
        await supabase.auth.admin.deleteUser(user.id)
        throw profileErr
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred during signup')
      if (err instanceof Error && err.message.includes('already exists')) {
        setTimeout(() => onSwitch(), 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-2xl font-bold text-center mb-8 text-[#00704A]">Create Account</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
          <AlertCircle className="shrink-0 mr-2" size={20} />
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {formData.accountType === 'freelancer' ? 'Full Name' : 'Company Name'}
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
              placeholder={formData.accountType === 'freelancer' ? 'Enter your full name' : 'Enter company name'}
              required
            />
            <User className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <div className="relative">
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
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
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value })
                // Clear error when user starts typing a new password
                if (error?.includes('Password must be')) {
                  setError(null)
                }
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
              placeholder="Create a password (min. 6 characters)"
              required
              minLength={6}
            />
            <Lock className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          <p className="mt-1 text-sm text-gray-500">Password must be at least 6 characters long</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
          <div className="flex space-x-4">
            <label className="flex-1">
              <input
                type="radio"
                name="accountType"
                value="freelancer"
                checked={formData.accountType === 'freelancer'}
                onChange={(e) => setFormData({ ...formData, accountType: e.target.value as UserType })}
                className="sr-only"
              />
              <div className={`
                p-4 border rounded-lg cursor-pointer text-center
                ${formData.accountType === 'freelancer' ? 'bg-[#00704A] text-white' : 'bg-gray-100 text-gray-700'}
                hover:bg-[#00704A] hover:text-white transition-colors
              `}>
                <Briefcase className="mx-auto mb-2" size={24} />
                <span>Freelancer</span>
              </div>
            </label>
            <label className="flex-1">
              <input
                type="radio"
                name="accountType"
                value="client"
                checked={formData.accountType === 'client'}
                onChange={(e) => setFormData({ ...formData, accountType: e.target.value as UserType })}
                className="sr-only"
              />
              <div className={`
                p-4 border rounded-lg cursor-pointer text-center
                ${formData.accountType === 'client' ? 'bg-[#00704A] text-white' : 'bg-gray-100 text-gray-700'}
                hover:bg-[#00704A] hover:text-white transition-colors
              `}>
                <Briefcase className="mx-auto mb-2" size={24} />
                <span>Client</span>
              </div>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#00704A] text-white py-2 px-4 rounded-lg hover:bg-[#005C3E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitch}
            className="text-[#00704A] hover:underline"
          >
            Sign in
          </button>
        </p>
      </form>
    </div>
  )
}

export default Signup