import React, { useState, useEffect } from 'react'
import { Building2, FileText, CheckCircle, ArrowRight, ArrowLeft, ShieldCheck, LogIn } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import CompanyDetails from './CompanyDetails'
import ProjectPreferences from './ProjectPreferences'
import Verification from './Verification'

interface ClientOnboardingProps {
  onComplete: () => void
}

function ClientOnboarding({ onComplete }: ClientOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string>('')
  const [hasValidProfile, setHasValidProfile] = useState(true)

  const steps = [
    { 
      number: 1, 
      title: 'Company Details', 
      icon: Building2, 
      component: CompanyDetails,
      description: 'Tell us about your company'
    },
    { 
      number: 2, 
      title: 'Project Preferences', 
      icon: FileText, 
      component: ProjectPreferences,
      description: 'Define your project needs'
    },
    { 
      number: 3, 
      title: 'Verification', 
      icon: ShieldCheck, 
      component: Verification,
      description: 'Verify your company'
    }
  ]
  
  // Check verification status on mount
  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setHasValidProfile(false)
          throw new Error('Not authenticated')
        }
        
        setUserId(user.id)
        
        // Check if user has a valid entry in the database
        const { data: profile, error } = await supabase
          .from('client_profiles')
          .select('verification_status')
          .eq('user_id', user.id)
          .single()
        
        // If no profile exists, mark as invalid profile
        if (error || !profile) {
          setHasValidProfile(false)
        } else if (profile?.verification_status === 'approved') {
          onComplete()
          return
        }
      } catch (error) {
        console.error('Error checking verification status:', error)
        setHasValidProfile(false)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkVerificationStatus()
  }, [onComplete])

  const handleNext = async () => {
    if (currentStep < steps.length) {
      // If moving to verification step, submit for review
      if (currentStep === steps.length - 1) {
        await submitForVerification()
      }
      setCurrentStep(prev => prev + 1)
    }
  }
  
  const submitForVerification = async () => {
    try {
      // Update verification status to 'pending' (matching the database constraint)
      const { error } = await supabase
        .from('client_profiles')
        .update({ 
          verification_status: 'pending',
          is_verified: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (error) throw error
      
      // Here you would typically send an email to admin
      console.log('Client verification submitted for review')
      
    } catch (error) {
      console.error('Error submitting for verification:', error)
      throw error
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }
  
  // Handle redirect to signup
  const handleBackToSignup = async () => {
    // Sign out current session if any
    await supabase.auth.signOut()
    // Redirect to root which should show the login/signup page
    window.location.href = '/'
  }

  // Safely get the current step component with fallback
  const currentStepObj = steps[currentStep - 1] || steps[0]
  const CurrentStepComponent = currentStepObj?.component || (() => <div>Step not found</div>)

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  // Show error and back to signup button if no valid profile
  if (!hasValidProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-4 text-5xl flex justify-center">
            <LogIn size={64} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-6">
            It looks like you're trying to access the client onboarding process without properly signing up.
            Please go back to the sign-up page to create an account first.
          </p>
          <button
            onClick={handleBackToSignup}
            className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Sign Up
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.number <= currentStep
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step.number < currentStep ? (
                    <CheckCircle size={20} />
                  ) : (
                    <step.icon size={20} />
                  )}
                </div>
                <p
                  className={`mt-2 text-sm font-medium ${
                    step.number <= currentStep ? 'text-[#00704A]' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </p>
              </div>
            ))}
            {/* Progress Bar */}
            <div className="absolute top-5 left-0 h-0.5 bg-gray-200 w-full -z-10">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Current Step Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <CurrentStepComponent onNext={handleNext} onBack={handleBack} />
        </div>

        {/* Navigation Buttons */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={handleBack}
            className={`flex items-center px-6 py-2 rounded-lg ${
              currentStep === 1
                ? 'invisible'
                : 'bg-white text-[#00704A] border-2 border-[#00704A] hover:bg-primary hover:text-white'
            } transition-colors`}
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>
          {currentStep === steps.length ? (
            <button
              onClick={onComplete}
              className="flex items-center px-6 py-2 rounded-lg bg-primary text-white hover:opacity-90 transition-colors"
            >
              Go to Dashboard
              <ArrowRight size={20} className="ml-2" />
            </button>
          ) : (
            <div className="flex items-center">
              <button
                onClick={handleNext}
                className="flex items-center px-6 py-2 rounded-lg bg-primary text-white hover:opacity-90 transition-colors"
              >
                Next
                <ArrowRight size={20} className="ml-2" />
              </button>
              
              {currentStep === 1 && (
                <button
                  onClick={handleBackToSignup}
                  className="ml-4 flex items-center px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <LogIn className="mr-2" size={18} />
                  Back to Sign Up
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ClientOnboarding