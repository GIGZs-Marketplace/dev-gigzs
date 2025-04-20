import React, { useState } from 'react'
import { Mail, Lock, BellRing, Globe, Moon, Sun, Palette, User, Shield } from 'lucide-react'

function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: BellRing },
    { id: 'appearance', label: 'Appearance', icon: Palette }
  ]

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Settings Header */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Settings">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-[#00704A] text-[#00704A]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="mr-2" size={20} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Settings Content */}
      <div className="p-6">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Profile Settings</h2>
            
            <div className="flex items-center space-x-6">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="Profile"
                className="w-24 h-24 rounded-full"
              />
              <div>
                <button className="px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538]">
                  Change Photo
                </button>
                <p className="mt-2 text-sm text-gray-500">
                  JPG, GIF or PNG. Max size of 2MB
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none"
                  defaultValue="Yatharth"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none"
                  defaultValue="Chauhan"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  rows={4}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none"
                  defaultValue="Senior Full Stack Developer with 5+ years of experience..."
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Account Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <div className="mt-1 flex rounded-lg shadow-sm">
                  <input
                    type="email"
                    className="flex-1 rounded-l-lg border border-r-0 border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none"
                    defaultValue="yatharth.chauhan@example.com"
                  />
                  <button className="rounded-r-lg border border-l-0 border-gray-300 px-4 bg-gray-50 text-gray-500 hover:text-gray-700">
                    Verify
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <button className="mt-1 px-4 py-2 text-[#00704A] hover:bg-[#00704A]/5 rounded-lg">
                  Change Password
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Two-Factor Authentication</label>
                <button className="mt-1 px-4 py-2 text-[#00704A] hover:bg-[#00704A]/5 rounded-lg">
                  Enable 2FA
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
              <div className="mt-4 space-y-4">
                <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                  Deactivate Account
                </button>
                <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Notification Preferences</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="email"
                    type="checkbox"
                    className="rounded border-gray-300 text-[#00704A] focus:ring-[#00704A]"
                    defaultChecked
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="email" className="font-medium text-gray-700">Email Notifications</label>
                  <p className="text-gray-500">Receive email updates about your account activity</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="browser"
                    type="checkbox"
                    className="rounded border-gray-300 text-[#00704A] focus:ring-[#00704A]"
                    defaultChecked
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="browser" className="font-medium text-gray-700">Browser Notifications</label>
                  <p className="text-gray-500">Receive notifications in your browser</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="marketing"
                    type="checkbox"
                    className="rounded border-gray-300 text-[#00704A] focus:ring-[#00704A]"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="marketing" className="font-medium text-gray-700">Marketing Emails</label>
                  <p className="text-gray-500">Receive emails about new features and updates</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Appearance Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Theme</label>
                <div className="mt-2 space-x-2">
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Sun size={20} className="mr-2" />
                    Light
                  </button>
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Moon size={20} className="mr-2" />
                    Dark
                  </button>
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Globe size={20} className="mr-2" />
                    System
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Color Scheme</label>
                <div className="mt-2 grid grid-cols-5 gap-2">
                  {['#00704A', '#2563eb', '#7c3aed', '#db2777', '#ea580c'].map((color) => (
                    <button
                      key={color}
                      className="w-10 h-10 rounded-full border-2 border-white ring-2 ring-gray-200 hover:ring-gray-300"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Font Size</label>
                <select className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none">
                  <option>Small</option>
                  <option>Medium</option>
                  <option>Large</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SettingsPage