import React, { useState } from 'react'
import { 
  Shield, 
  Lock, 
  Smartphone, 
  Key, 
  AlertTriangle, 
  Clock, 
  Globe, 
  LogOut,
  CheckCircle,
  X
} from 'lucide-react'

function SecurityPage() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Security Settings</h2>
          <p className="text-sm text-gray-600 mt-1">Manage your account security and authentication methods</p>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Two-Factor Authentication (2FA)</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add an extra layer of security to your account by requiring both your password and an authentication code.
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => {
                setIs2FAEnabled(!is2FAEnabled)
                if (!is2FAEnabled) setShowQRCode(true)
              }}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                is2FAEnabled ? 'bg-[#00704A]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  is2FAEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {showQRCode && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Setup Two-Factor Authentication</h4>
            <p className="text-sm text-gray-600 mb-4">
              1. Install an authenticator app like Google Authenticator or Authy
              <br />
              2. Scan the QR code below
              <br />
              3. Enter the verification code from your app
            </p>
            <div className="flex justify-center mb-4">
              {/* Placeholder for QR Code */}
              <div className="w-48 h-48 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">QR Code</span>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowQRCode(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538]">
                Verify Code
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Password Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Password</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Last changed 30 days ago
                </p>
              </div>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="px-4 py-2 text-[#00704A] hover:bg-[#00704A]/5 rounded-lg"
              >
                Change Password
              </button>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center text-sm">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>At least 8 characters long</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>Contains numbers and special characters</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>Different from previous passwords</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Device Management */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-medium text-gray-900 mb-4">Device Management</h3>
        <div className="space-y-4">
          {devices.map((device) => (
            <div key={device.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Smartphone className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{device.name}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <Globe size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-500">{device.location}</span>
                    <span className="text-gray-300">•</span>
                    <Clock size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-500">{device.lastActive}</span>
                  </div>
                </div>
              </div>
              {device.current ? (
                <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  Current Device
                </span>
              ) : (
                <button className="text-red-600 hover:text-red-700">
                  <LogOut size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Login Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-medium text-gray-900 mb-4">Recent Login Activity</h3>
        <div className="space-y-4">
          {loginActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  activity.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {activity.status === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{activity.location}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <Clock size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-500">{activity.time}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-500">{activity.device}</span>
                  </div>
                </div>
              </div>
              {activity.status === 'failed' && (
                <span className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
                  Failed Attempt
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                <input
                  type="password"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input
                  type="password"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none"
                />
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538]"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const devices = [
  {
    id: 1,
    name: 'MacBook Pro',
    location: 'San Francisco, US',
    lastActive: 'Currently active',
    current: true
  },
  {
    id: 2,
    name: 'iPhone 13',
    location: 'San Francisco, US',
    lastActive: '2 hours ago',
    current: false
  },
  {
    id: 3,
    name: 'Windows PC',
    location: 'New York, US',
    lastActive: '3 days ago',
    current: false
  }
]

const loginActivity = [
  {
    location: 'San Francisco, United States',
    time: '2 minutes ago',
    device: 'MacBook Pro - Chrome',
    status: 'success'
  },
  {
    location: 'London, United Kingdom',
    time: '1 hour ago',
    device: 'Unknown Device - Firefox',
    status: 'failed'
  },
  {
    location: 'San Francisco, United States',
    time: '3 hours ago',
    device: 'iPhone 13 - Safari',
    status: 'success'
  }
]

export default SecurityPage