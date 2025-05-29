import React, { useState, useEffect } from 'react'
import { Building2, Globe, Users, MapPin, User, Mail, Phone } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface CompanyDetailsProps {
  onNext: () => void
  onBack: () => void
}

function CompanyDetails({ onNext }: CompanyDetailsProps) {
  const [logo, setLogo] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string>('')
  const [formData, setFormData] = useState({
    company_name: '',
    industry: 'Technology',
    company_size: '1-10 employees',
    location: '',
    bio: '',
    full_name: '',
    email: '',
    phone: '',
    company_website: '',
    linkedin_url: ''
  })

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')
        
        setUserId(user.id)
        
        // Get user email from auth
        if (user.email) {
          setFormData(prev => ({
            ...prev,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || ''
          }))
        }
        
        // Check if profile exists
        const { data: profile, error } = await supabase
          .from('client_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()
          
        if (profile) {
          setFormData({
            company_name: profile.company_name || '',
            industry: profile.industry || 'Technology',
            company_size: profile.company_size || '1-10 employees',
            location: profile.location || '',
            bio: profile.bio || '',
            full_name: profile.full_name || '',
            email: profile.email || '',
            phone: profile.phone || '',
            company_website: profile.company_website || '',
            linkedin_url: profile.linkedin_url || ''
          })
        }
      } catch (err: any) {
        console.error('Error loading profile:', err)
        setError('Error loading profile data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserData()
  }, [])
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogo(e.target.files[0])
    }
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    
    try {
      // Upload logo if selected
      let avatar_url = null
      if (logo) {
        const fileExt = logo.name.split('.').pop()
        const fileName = `${userId}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const filePath = `avatars/${fileName}`
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, logo)
          
        if (uploadError) throw uploadError
        
        // Get the public URL
        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)

        avatar_url = data.publicUrl
        
        if (!avatar_url) {
          throw new Error('Failed to get public URL for uploaded image')
        }
        
        console.log('Client profile image uploaded successfully:', avatar_url)
      }
      
      // Save profile to database
      const { error } = await supabase
        .from('client_profiles')
        .upsert({
          user_id: userId,
          company_name: formData.company_name,
          industry: formData.industry,
          company_size: formData.company_size,
          location: formData.location,
          bio: formData.bio,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          company_website: formData.company_website,
          linkedin_url: formData.linkedin_url,
          verification_status: 'pending',
          is_verified: false,
          updated_at: new Date().toISOString(),
          ...(avatar_url && { avatar_url })
        }, {
          onConflict: 'user_id'
        })
        
      if (error) throw error
      
      // Proceed to next step
      onNext()
    } catch (err: any) {
      console.error('Error saving profile:', err)
      setError(err.message || 'Error saving profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Company Details</h2>
        <p className="mt-2 text-gray-600">Tell us about your company and its requirements</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Logo */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Company Logo</h3>
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center">
              {logo ? (
                <img
                  src={URL.createObjectURL(logo)}
                  alt="Company Logo"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Building2 size={32} className="text-gray-400" />
              )}
            </div>
            <div>
              <label className="block">
                <span className="sr-only">Choose company logo</span>
                <input
                  type="file"
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-[#00704A] file:text-white
                    hover:file:bg-[#005538]"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
              </label>
              <p className="mt-1 text-sm text-gray-500">PNG, JPG up to 5MB</p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name</label>
              <div className="mt-1 flex items-center space-x-2">
                <Building2 size={20} className="text-gray-400" />
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none"
                  placeholder="Enter company name"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Website</label>
              <div className="mt-1 flex items-center space-x-2">
                <Globe size={20} className="text-gray-400" />
                <input
                  type="url"
                  name="company_website"
                  value={formData.company_website}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Company Size & Location */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Company Size & Location</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Size</label>
              <div className="mt-1 flex items-center space-x-2">
                <Users size={20} className="text-gray-400" />
                <select 
                  name="company_size"
                  value={formData.company_size}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none"
                >
                  <option>1-10 employees</option>
                  <option>11-50 employees</option>
                  <option>51-200 employees</option>
                  <option>201-500 employees</option>
                  <option>500+ employees</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <div className="mt-1 flex items-center space-x-2">
                <MapPin size={20} className="text-gray-400" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none"
                  placeholder="City, Country"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Company Description */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Company Description</h3>
          <textarea
            rows={4}
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none"
            placeholder="Tell us about your company..."
          />
        </div>

        {/* Industry */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Industry</h3>
          <select 
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none"
          >
            <option>Technology</option>
            <option>Healthcare</option>
            <option>Finance</option>
            <option>Education</option>
            <option>E-commerce</option>
            <option>Manufacturing</option>
            <option>Other</option>
          </select>
        </div>
        
        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Contact Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <div className="mt-1 flex items-center space-x-2">
                <User size={20} className="text-gray-400" />
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none"
                  placeholder="Your full name"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1 flex items-center space-x-2">
                <Mail size={20} className="text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none"
                  placeholder="Your email address"
                  required
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <div className="mt-1 flex items-center space-x-2">
                <Phone size={20} className="text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none"
                  placeholder="Your phone number"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
              <div className="mt-1 flex items-center space-x-2">
                <Globe size={20} className="text-gray-400" />
                <input
                  type="url"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {saving ? 'Saving...' : 'Save & Continue'}
          </button>
        </div>
      </form>
      )}
    </div>
  )
}

export default CompanyDetails