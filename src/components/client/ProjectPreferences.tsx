import React, { useState } from 'react'
import { Tags, Clock, DollarSign, Users } from 'lucide-react'

interface ProjectPreferencesProps {
  onNext: () => void
  onBack: () => void
}

function ProjectPreferences({ onNext }: ProjectPreferencesProps) {
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')

  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill])
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove))
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Project Preferences</h2>
        <p className="mt-2 text-gray-600">Define your project requirements and preferences</p>
      </div>

      <form className="space-y-6">
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
                <input type="checkbox" className="h-4 w-4 text-[#00704A] rounded border-gray-300 focus:ring-[#00704A]" />
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
                <select className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none">
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
                <select className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none">
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
            <select className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none">
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
                  className="h-4 w-4 text-[#00704A] rounded border-gray-300 focus:ring-[#00704A]"
                />
                <span className="text-sm text-gray-700">{pref}</span>
              </label>
            ))}
          </div>
        </div>
      </form>
    </div>
  )
}

export default ProjectPreferences