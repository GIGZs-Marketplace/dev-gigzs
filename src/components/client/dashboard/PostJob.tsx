import React, { useState } from 'react'
import { X, Plus, Minus, DollarSign, Calendar, Clock, Briefcase, Users, Globe } from 'lucide-react'
import { supabase } from '../../../lib/supabase'

interface PostJobProps {
  onClose: () => void
  onJobPosted?: () => void
}

function PostJob({ onClose, onJobPosted }: PostJobProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectType: '',
    budget: {
      type: 'fixed',
      amount: '',
      maxAmount: '',
      currency: 'USD'
    },
    duration: '',
    experienceLevel: '',
    location: 'remote',
    timezone: 'UTC',
    projectScope: '',
    attachments: [] as File[],
    visibility: 'public',
    preferences: {
      openToAgencies: false,
      requireNDA: false,
      featured: false
    }
  })

  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill])
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({
        ...formData,
        attachments: [...formData.attachments, ...Array.from(e.target.files)]
      })
    }
  }

  const removeFile = (index: number) => {
    setFormData({
      ...formData,
      attachments: formData.attachments.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      // Get client profile
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!clientProfile) throw new Error('Client profile not found')

      // Create job posting
      const { data: job, error } = await supabase
        .from('jobs')
        .insert([
          {
            client_id: clientProfile.id,
            title: formData.title,
            description: formData.description,
            project_type: formData.projectType,
            budget_type: formData.budget.type,
            budget_amount: parseFloat(formData.budget.amount),
            budget_max_amount: formData.budget.type === 'range' ? parseFloat(formData.budget.maxAmount) : null,
            duration: formData.duration,
            experience_level: formData.experienceLevel,
            location: formData.location,
            timezone: formData.timezone,
            project_scope: formData.projectScope,
            skills_required: skills,
            status: 'open',
            visibility: formData.visibility,
            preferences: formData.preferences
          }
        ])
        .select()
        .single()

      if (error) throw error

      // Handle file uploads if needed
      if (formData.attachments.length > 0) {
        for (const file of formData.attachments) {
          const { error: uploadError } = await supabase.storage
            .from('job-attachments')
            .upload(`${job.id}/${file.name}`, file)
          
          if (uploadError) throw uploadError
        }
      }

      onJobPosted?.()
      onClose()
    } catch (error) {
      console.error('Error posting job:', error)
      // Handle error (show error message to user)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-8">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Post a New Job</h2>
            <p className="text-sm text-gray-600 mt-1">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
                  placeholder="e.g., Senior Full Stack Developer Needed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
                  placeholder="Describe your project requirements, goals, and expectations..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Type
                </label>
                <select
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
                >
                  <option value="">Select project type</option>
                  <option value="one-time">One-time project</option>
                  <option value="ongoing">Ongoing project</option>
                  <option value="complex">Complex project</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Required Skills</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
                    placeholder="Add required skills"
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <button
                    onClick={addSkill}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/10 text-[#00704A] rounded-full text-sm flex items-center"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="ml-2 hover:text-red-500"
                      >
                        <Minus size={16} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget Type
                  </label>
                  <select
                    value={formData.budget.type}
                    onChange={(e) => setFormData({
                      ...formData,
                      budget: { ...formData.budget, type: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="hourly">Hourly Rate</option>
                    <option value="range">Budget Range</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.budget.type === 'hourly' ? 'Hourly Rate' : 'Budget Amount'}
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    <input
                      type="number"
                      value={formData.budget.amount}
                      onChange={(e) => setFormData({
                        ...formData,
                        budget: { ...formData.budget, amount: e.target.value }
                      })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
                      placeholder="Enter amount"
                    />
                  </div>
                </div>

                {formData.budget.type === 'range' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Budget
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 text-gray-400" size={20} />
                      <input
                        type="number"
                        value={formData.budget.maxAmount}
                        onChange={(e) => setFormData({
                          ...formData,
                          budget: { ...formData.budget, maxAmount: e.target.value }
                        })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
                        placeholder="Enter maximum amount"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Duration
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
                >
                  <option value="">Select duration</option>
                  <option value="less_than_1_month">Less than 1 month</option>
                  <option value="1_to_3_months">1-3 months</option>
                  <option value="3_to_6_months">3-6 months</option>
                  <option value="more_than_6_months">More than 6 months</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Experience Level
                </label>
                <select
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
                >
                  <option value="">Select experience level</option>
                  <option value="entry">Entry Level</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Location
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
                >
                  <option value="remote">Remote</option>
                  <option value="onsite">On-site</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Scope
                </label>
                <textarea
                  value={formData.projectScope}
                  onChange={(e) => setFormData({ ...formData, projectScope: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
                  placeholder="Define the scope of work, deliverables, and milestones..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attachments
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-medium text-[#00704A] hover:text-[#005538] focus-within:outline-none"
                      >
                        <span>Upload files</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          multiple
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX up to 10MB
                    </p>
                  </div>
                </div>
                {formData.attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <span className="text-sm text-gray-600">{file.name}</span>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Preferences
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.preferences.openToAgencies}
                      onChange={(e) => setFormData({
                        ...formData,
                        preferences: { ...formData.preferences, openToAgencies: e.target.checked }
                      })}
                      className="rounded border-gray-300 text-[#00704A] focus:ring-[#00704A]"
                    />
                    <span className="text-sm text-gray-700">Open to agencies</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.preferences.requireNDA}
                      onChange={(e) => setFormData({
                        ...formData,
                        preferences: { ...formData.preferences, requireNDA: e.target.checked }
                      })}
                      className="rounded border-gray-300 text-[#00704A] focus:ring-[#00704A]"
                    />
                    <span className="text-sm text-gray-700">Require NDA</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.preferences.featured}
                      onChange={(e) => setFormData({
                        ...formData,
                        preferences: { ...formData.preferences, featured: e.target.checked }
                      })}
                      className="rounded border-gray-300 text-[#00704A] focus:ring-[#00704A]"
                    />
                    <span className="text-sm text-gray-700">Feature this job posting</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-between">
          <button
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Posting...' : 'Post Job'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostJob