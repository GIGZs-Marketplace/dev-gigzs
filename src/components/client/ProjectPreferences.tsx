import React, { useState, useEffect } from 'react'
import { Tags, Clock, DollarSign, Users, MessageCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface ProjectPreferencesProps {
  onNext: () => void
  onBack: () => void
}

function ProjectPreferences({ onNext }: ProjectPreferencesProps) {
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string>('')
  const [formData, setFormData] = useState({
    project_types: [] as string[],
    project_duration: 'Less than 1 month',
    budget_range: 'Less than $1,000',
    team_size: 'Individual Freelancer',
    communication_preferences: [] as string[]
  })

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')
        
        setUserId(user.id)
        
        // Check if profile exists and has project preferences
        const { data: profile, error } = await supabase
          .from('client_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()
          
        if (profile) {
          // Load saved skills
          if (profile.required_skills && Array.isArray(profile.required_skills)) {
            setSkills(profile.required_skills)
          }
          
          // Load other preferences
          setFormData({
            project_types: profile.project_types || [],
            project_duration: profile.project_duration || 'Less than 1 month',
            budget_range: profile.budget_range || 'Less than $1,000',
            team_size: profile.team_size || 'Individual Freelancer',
            communication_preferences: profile.communication_preferences || []
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

  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill])
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove))
  }
  
  const handleProjectTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        project_types: [...prev.project_types, type]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        project_types: prev.project_types.filter(t => t !== type)
      }))
    }
  }
  
  const handleCommunicationPrefChange = (pref: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        communication_preferences: [...prev.communication_preferences, pref]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        communication_preferences: prev.communication_preferences.filter(p => p !== pref)
      }))
    }
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
      // Save profile to database
      const { error } = await supabase
        .from('client_profiles')
        .update({
          required_skills: skills,
          project_types: formData.project_types,
          project_duration: formData.project_duration,
          budget_range: formData.budget_range,
          team_size: formData.team_size,
          communication_preferences: formData.communication_preferences,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        
      if (error) throw error
      
      // Proceed to next step
      onNext()
    } catch (err: any) {
      console.error('Error saving preferences:', err)
      setError(err.message || 'Error saving preferences')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Project Preferences</h2>
        <p className="mt-2 text-gray-600">Define your project requirements and preferences</p>
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
        {/* Project Types */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Project Types</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              'Web Development',
              'Mobile Development',
              'UI/UX Design',
              'Content Writing',
              'Digital Marketing',
              'Data Analysis',
              'Graphic Design',
              'Video Production'
            ].map((type, index) => (
              <label key={index} className="relative flex items-center p-4 border rounded-lg cursor-pointer hover:border-[#00704A]">
                <input 
                  type="checkbox" 
                  checked={formData.project_types.includes(type)}
                  onChange={(e) => handleProjectTypeChange(type, e.target.checked)}
                  className="h-4 w-4 text-[#00704A] rounded border-gray-300 focus:ring-[#00704A]" 
                />
                <span className="ml-2 text-sm text-gray-700">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Required Skills */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Required Skills</h3>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Tags size={20} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-[#00704A] focus:outline-none"
                placeholder="Add required skills"
              />
            </div>
            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538]"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-[#00704A]/10 text-[#00704A] rounded-full text-sm flex items-center"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-2 text-[#00704A] hover:text-[#005538]"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Project Duration & Budget */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Project Duration & Budget</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Typical Project Duration</label>
              <div className="mt-1 flex items-center space-x-2">
                <Clock size={20} className="text-gray-400" />
                <select 
                  name="project_duration"
                  value={formData.project_duration}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none"
                >
                  <option>Less than 1 month</option>
                  <option>1-3 months</option>
                  <option>3-6 months</option>
                  <option>6+ months</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Budget Range</label>
              <div className="mt-1 flex items-center space-x-2">
                <DollarSign size={20} className="text-gray-400" />
                <select 
                  name="budget_range"
                  value={formData.budget_range}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none"
                >
                  <option>Less than $1,000</option>
                  <option>$1,000 - $5,000</option>
                  <option>$5,000 - $10,000</option>
                  <option>$10,000+</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Team Size */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Team Size Preference</h3>
          <div className="flex items-center space-x-2">
            <Users size={20} className="text-gray-400" />
            <select 
              name="team_size"
              value={formData.team_size}
              onChange={handleChange}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none"
            >
              <option>Individual Freelancer</option>
              <option>Small Team (2-3)</option>
              <option>Medium Team (4-6)</option>
              <option>Large Team (7+)</option>
            </select>
          </div>
        </div>

        {/* Communication Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Communication Preferences</h3>
          <div className="space-y-2">
            {[
              'Daily Updates',
              'Weekly Meetings',
              'Email Communication',
              'Chat/Messaging',
              'Video Calls'
            ].map((pref, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.communication_preferences.includes(pref)}
                  onChange={(e) => handleCommunicationPrefChange(pref, e.target.checked)}
                  className="h-4 w-4 text-[#00704A] rounded border-gray-300 focus:ring-[#00704A]"
                />
                <span className="text-sm text-gray-700">{pref}</span>
              </label>
            ))}
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

export default ProjectPreferences