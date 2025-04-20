import React from 'react'
import { CheckCircle2, Clock, ShieldCheck, AlertCircle } from 'lucide-react'

interface VerificationProps {
  onNext: () => void
  onBack: () => void
}

function Verification({ onNext }: VerificationProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Verification Status</h2>
        <p className="mt-2 text-gray-600">Track the status of your account verification</p>
      </div>

      <div className="space-y-4">
        {/* Document Verification Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-800">Document Verification</h3>
              <p className="mt-1 text-sm text-gray-600">Your documents have been received and are being reviewed</p>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
                <span className="mt-2 text-sm text-green-600">Completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Identity Verification */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-800">Identity Verification</h3>
              <p className="mt-1 text-sm text-gray-600">We're verifying your identity documents</p>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <span className="mt-2 text-sm text-yellow-600">In Progress</span>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Assessment */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-800">Skills Assessment</h3>
              <p className="mt-1 text-sm text-gray-600">Your skills are being reviewed by our team</p>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
                <span className="mt-2 text-sm text-blue-600">In Review</span>
              </div>
            </div>
          </div>
        </div>

        {/* Estimated Time */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-gray-400" />
            <p className="text-sm text-gray-600">
              Estimated verification time: <span className="font-medium">24-48 hours</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Verification