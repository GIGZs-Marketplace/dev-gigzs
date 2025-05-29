import { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface VerificationProps {
  onNext: () => void;
  onBack: () => void;
}

function Verification({ onNext }: VerificationProps) {
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('client_profiles')
          .select('verification_status')
          .eq('user_id', user.id)
          .single();

        if (profile?.verification_status) {
          setStatus(profile.verification_status as any);
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkVerificationStatus();
  }, []);

  const statusInfo = {
    pending: {
      icon: Clock,
      title: 'Verification Pending',
      description: 'Your company details are being reviewed. This usually takes 1-2 business days.',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    approved: {
      icon: CheckCircle,
      title: 'Verification Approved',
      description: 'Your company has been verified. You can now post jobs and hire freelancers.',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    rejected: {
      icon: AlertTriangle,
      title: 'Verification Rejected',
      description: 'Your verification was not approved. Please contact support for more information.',
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
  };

  const currentStatus = statusInfo[status];
  const StatusIcon = currentStatus.icon;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Company Verification</h2>
        <p className="mt-2 text-gray-600">
          We verify all companies to ensure a safe and trusted marketplace
        </p>
      </div>

      <div className={`p-6 rounded-lg ${currentStatus.bgColor}`}>
        <div className="flex items-start">
          <div className={`p-3 rounded-full ${currentStatus.color} bg-white mr-4`}>
            <StatusIcon size={24} />
          </div>
          <div>
            <h3 className={`text-lg font-medium ${currentStatus.color}`}>{currentStatus.title}</h3>
            <p className="mt-1 text-gray-700">{currentStatus.description}</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Verification Requirements</h3>
        <ul className="space-y-3">
          <li className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-green-500">
              <CheckCircle size={20} />
            </div>
            <p className="ml-3 text-gray-700">Valid business registration or incorporation documents</p>
          </li>
          <li className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-green-500">
              <CheckCircle size={20} />
            </div>
            <p className="ml-3 text-gray-700">Company website or social media presence</p>
          </li>
          <li className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-green-500">
              <CheckCircle size={20} />
            </div>
            <p className="ml-3 text-gray-700">Valid business email address</p>
          </li>
          <li className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-green-500">
              <CheckCircle size={20} />
            </div>
            <p className="ml-3 text-gray-700">Complete company profile information</p>
          </li>
        </ul>
      </div>

      {status === 'pending' && (
        <div className="flex justify-center">
          <button
            onClick={onNext}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Submit for Verification
          </button>
        </div>
      )}

      {/* Pending status already shows appropriate UI */}

      {status === 'approved' && (
        <div className="text-center">
          <p className="text-gray-700 mb-4">
            Your company has been verified! You can now access the full dashboard.
          </p>
          
        </div>
      )}
      
      {status === 'pending' && (
        <div className="text-center">
          <p className="text-gray-700 mb-4">
            Your verification is pending. You'll be notified once your company is verified.
          </p>
          <button
            disabled
            className="px-6 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
          >
            Dashboard Access Pending
          </button>
        </div>
      )}

      {status === 'rejected' && (
        <div className="text-center">
          <p className="text-gray-700 mb-4">
            Please contact our support team for more information about why your verification was rejected.
          </p>
          <a
            href="mailto:support@gigzs.com"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 inline-block"
          >
            Contact Support
          </a>
        </div>
      )}
    </div>
  );
}

export default Verification;
