import React, { useState, useEffect } from 'react';
import { Upload, UserCircle, ShieldCheck, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import UploadDetails from './UploadDetails';
import CreateProfile from './CreateProfile';
import Verification from './Verification';

interface FreelancerOnboardingProps {
  onComplete: () => void;
}

function FreelancerOnboarding({ onComplete }: FreelancerOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');

  // Check verification status on mount
  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        
        setUserId(user.id);
        
        // Check if user has already completed onboarding
        const { data: profile } = await supabase
          .from('freelancer_profiles')
          .select('verification_status')
          .eq('user_id', user.id)
          .single();
          
        if (profile?.verification_status === 'approved') {
          onComplete();
          return;
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
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
      title: 'Verification', 
      icon: ShieldCheck, 
      component: Verification,
      description: 'Wait for verification'
    }
  ];

  const handleNext = async () => {
    if (currentStep < steps.length) {
      // If moving to verification step, submit for review
      if (currentStep === steps.length - 1) {
        await submitForVerification();
      }
      setCurrentStep(prev => prev + 1);
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

  const CurrentStepComponent = steps[currentStep - 1].component;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
          <CurrentStepComponent onNext={handleNext} onBack={handleBack} />
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
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
          
          <button
            onClick={handleNext}
            disabled={currentStep === steps.length}
            className="flex items-center px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === steps.length ? 'Submit for Review' : 'Next'}
            <ArrowRight className="ml-2" size={18} />
          </button>
          </div>
      </div>
    </div>
  )
}

export default FreelancerOnboarding