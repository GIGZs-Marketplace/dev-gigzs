import React, { useState, useEffect } from 'react';
import { Upload, UserCircle, ShieldCheck, CheckCircle, ArrowRight, ArrowLeft, LogIn, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import UploadDetails from './UploadDetails';
import CreateProfile from './CreateProfile';
import Verification from './Verification';
import QuestionnairePage from '../../pages/QuestionnairePage';

interface FreelancerOnboardingProps {
  onComplete: () => void;
}

function FreelancerOnboarding({ onComplete }: FreelancerOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');
  const [hasValidProfile, setHasValidProfile] = useState(true);

  // Check verification status on mount
  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setHasValidProfile(false);
          throw new Error('Not authenticated');
        }
        
        setUserId(user.id);
        
        // Check if user has a valid entry in the database
        const { data: profile, error } = await supabase
          .from('freelancer_profiles')
          .select('verification_status')
          .eq('user_id', user.id)
          .single();
        
        // If no profile exists, mark as invalid profile
        if (error || !profile) {
          setHasValidProfile(false);
        } else if (profile?.verification_status === 'approved') {
          onComplete();
          return;
        } else if (profile?.verification_status === 'in_review') {
          setCurrentStep(4); // Navigate to Verification step
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
        setHasValidProfile(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkVerificationStatus();
  }, [onComplete]);

  const steps = [
    { 
      number: 1, 
      title: 'Personal Details', 
      icon: UserCircle, 
      component: CreateProfile,
      description: 'Tell us about yourself'
    },
    { 
      number: 2, 
      title: 'Documents & Links', 
      icon: Upload, 
      component: UploadDetails,
      description: 'Upload required documents'
    },
    {
      number: 3,
      title: 'Ethos Assessment',
      icon: FileText,
      component: QuestionnairePage,
      description: 'Answer a few questions'
    },
    { 
      number: 4, 
      title: 'Verification', 
      icon: ShieldCheck, 
      component: Verification,
      description: 'Wait for verification'
    }
  ];

  const handleNext = async () => {
    if (currentStep < steps.length) {
      const currentStepObject = steps[currentStep - 1];
      if (currentStepObject?.title === 'Ethos Assessment') {
        try {
          setIsLoading(true);
          await submitForVerification(); // This updates status to 'in_review'
          setCurrentStep(prev => prev + 1); // Proceed to Verification step
        } catch (error) {
          console.error("Failed to submit for verification after questionnaire:", error);
          // Optionally, display an error message to the user here
        } finally {
          setIsLoading(false);
        }
      } else {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const submitForVerification = async () => {
    try {
      // Update verification status to 'in_review'
      const { error } = await supabase
        .from('freelancer_profiles')
        .update({ 
          verification_status: 'in_review',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;
      
      // Here you would typically send an email to admin
      // For now, we'll just log it
      console.log('Verification submitted for review');
      
    } catch (error) {
      console.error('Error submitting for verification:', error);
      throw error;
    }
  };

  // Safely get the current step component with fallback
  const currentStepObj = steps[currentStep - 1] || steps[0];
  const CurrentStepComponent = currentStepObj?.component || (() => <div>Step not found</div>);

  // Handle redirect to signup
  const handleBackToSignup = async () => {
    // Sign out current session if any
    await supabase.auth.signOut();
    // Redirect to root which should show the login/signup page
    window.location.href = '/';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
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
            It looks like you're trying to access the freelancer onboarding process without properly signing up.
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
    );
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
          {(() => {
            if (!currentStepObj) return <div>Step configuration error.</div>;

            if (currentStepObj.title === 'Personal Details') {
              return <CreateProfile userId={userId} onNext={handleNext} onBack={handleBack} />;
            } else if (currentStepObj.title === 'Documents & Links') {
              return <UploadDetails userId={userId} onNext={handleNext} onBack={handleBack} />;
            } else if (currentStepObj.title === 'Ethos Assessment') {
              return <QuestionnairePage userId={userId} onComplete={handleNext} />;
            } else if (currentStepObj.title === 'Verification') {
              return <Verification userId={userId} />;
            }
            return <div>Step component not found for {currentStepObj.title}.</div>;
          })()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8">
          {currentStepObj?.title !== 'Ethos Assessment' && currentStepObj?.title !== 'Verification' && (
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`flex items-center px-6 py-2 rounded-lg ${
                currentStep === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-primary hover:bg-primary/10'
              }`}
            >
              <ArrowLeft className="mr-2" size={18} />
              Back
            </button>
          )}
          {/* Placeholder for alignment when Back button is hidden on Ethos Assessment */} 
          {currentStepObj?.title === 'Ethos Assessment' && <div className="w-[calc(3rem+36px)]"></div>}
          
          <button
            onClick={handleNext}
            disabled={currentStep === steps.length}
            className="flex items-center px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === steps.length ? 'Go to Dashboard' : 'Next'}
            <ArrowRight className="ml-2" size={18} />
          </button>
          
          {(currentStep === 1 || currentStepObj?.title === 'Verification') && (
            <button
              onClick={handleBackToSignup}
              className={`flex items-center px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 ${
                currentStepObj?.title === 'Verification' ? '' : 'ml-4'
              }`}
            >
              <LogIn className="mr-2" size={18} />
              Back to Sign Up
            </button>
          )}
          {/* Original Back to Signup for step 1, now handled above with conditional marginLeft */}
          {/* currentStep === 1 && ( removed, handled by the combined condition above */}
          
          </div>
      </div>
    </div>
  )
}

export default FreelancerOnboarding