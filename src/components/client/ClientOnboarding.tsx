import React, { useState } from 'react'
import { Building2, CreditCard, FileText, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import CompanyDetails from './CompanyDetails'
import PaymentSetup from './PaymentSetup'
import ProjectPreferences from './ProjectPreferences'

interface ClientOnboardingProps {
  onComplete: () => void
}

function ClientOnboarding({ onComplete }: ClientOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  const steps = [
    { number: 1, title: 'Company Details', icon: Building2, component: CompanyDetails },
    { number: 2, title: 'Project Preferences', icon: FileText, component: ProjectPreferences },
    { number: 3, title: 'Payment Setup', icon: CreditCard, component: PaymentSetup }
  ]

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const CurrentStepComponent = steps[currentStep - 1].component

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
                style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
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
          {currentStep === totalSteps ? (
            <button
              onClick={onComplete}
              className="flex items-center px-6 py-2 rounded-lg bg-primary text-white hover:opacity-90 transition-colors"
            >
              Go to Dashboard
              <ArrowRight size={20} className="ml-2" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center px-6 py-2 rounded-lg bg-primary text-white hover:opacity-90 transition-colors"
            >
              Next
              <ArrowRight size={20} className="ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ClientOnboarding