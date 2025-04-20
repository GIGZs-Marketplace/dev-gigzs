import React, { useState } from 'react'
import { Building2, Globe, Users, MapPin } from 'lucide-react'

interface CompanyDetailsProps {
  onNext: () => void
  onBack: () => void
}

function CompanyDetails({ onNext }: CompanyDetailsProps) {
  const [logo, setLogo] = useState<File | null>(null)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogo(e.target.files[0])
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Company Details</h2>
        <p className="mt-2 text-gray-600">Tell us about your company and its requirements</p>
      </div>

      <form className="space-y-6">
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
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none"
                  placeholder="Enter company name"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Website</label>
              <div className="mt-1 flex items-center space-x-2">
                <Globe size={20} className="text-gray-400" />
                <input
                  type="url"
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
                <select className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none">
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
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none"
            placeholder="Tell us about your company..."
          />
        </div>

        {/* Industry */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Industry</h3>
          <select className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none">
            <option>Technology</option>
            <option>Healthcare</option>
            <option>Finance</option>
            <option>Education</option>
            <option>E-commerce</option>
            <option>Manufacturing</option>
            <option>Other</option>
          </select>
        </div>
      </form>
    </div>
  )
}

export default CompanyDetails