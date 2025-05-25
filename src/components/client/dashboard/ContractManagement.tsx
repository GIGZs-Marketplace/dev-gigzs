import React, { useEffect, useState } from 'react'
import { FileText, Download, Clock, DollarSign, CheckCircle, AlertTriangle, CreditCard } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { toast } from 'react-hot-toast'

function ContractManagement() {
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedContract, setSelectedContract] = useState<any>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    const fetchContracts = async () => {
      setLoading(true)
      setError(null)
      try {
        let contractsData, error;
        // Try with joins and filter
        ({ data: contractsData, error } = await supabase
          .from('contracts')
          .select(`
            *,
            projects (
              id,
              title,
              budget_amount,
              budget_max_amount,
              budget_currency,
              budget_type
            ),
            client_profiles:client_id (company_name),
            freelancer_profiles:freelancer_id (full_name)
          `)
          .filter('status', 'eq', 'signed')
          .order('created_at', { ascending: false })
        );
        if (error) {
          // Fallback: fetch contracts only, no joins
          console.error('Join query failed, falling back to base contracts only:', error);
          const fallback = await supabase
            .from('contracts')
            .select('*')
            .eq('status', 'signed')
            .order('created_at', { ascending: false });
          contractsData = fallback.data;
          error = fallback.error;
          console.log('Fallback contractsData:', contractsData, 'Error:', error);
        }

        if (error) throw error

        const formattedContracts = (contractsData ?? []).map(contract => ({
          ...contract,
          title: contract.projects?.title || contract.title || 'Untitled Contract',
          value: contract.projects?.budget_amount || contract.value || 0,
          budgetDetails: {
            amount: contract.projects?.budget_amount ?? contract.value ?? 0,
            maxAmount: contract.projects?.budget_max_amount ?? contract.value ?? 0,
            currency: '₹', // Always use Indian Rupees
            type: contract.projects?.budget_type ?? 'fixed',
          },
          clientCompany: contract.client_profiles?.company_name ?? '',
          clientAvatar: contract.client_profiles?.avatar_url ?? '/default-avatar.png',
          freelancerName: contract.freelancer_profiles?.full_name ?? '',
          freelancerAvatar: contract.freelancer_profiles?.avatar_url ?? '/default-avatar.png',
          startDate: contract.startDate || contract.start_date || contract.created_at || '',
          endDate: contract.endDate || contract.end_date || '',
          status: contract.status || 'Unknown',
        }))

        setContracts(formattedContracts)
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }
    fetchContracts()
  }, [])

  const handlePayment = async (contractId: string, amount: number) => {
    try {
      setLoading(true);
      
      // Update contract payment status
      const { error: updateError } = await supabase
        .from('contracts')
        .update({
          payment_status: 'paid',
          last_payment_date: new Date().toISOString(),
          last_updated: new Date().toISOString()
        })
        .eq('id', contractId);
        
      if (updateError) throw updateError;
      
      // Call paymentService to create a payment and get the Cashfree payment link
      const paymentService = await import('../../../services/paymentService').then(mod => mod.default);
      const payment_link_url = await paymentService.createPayment(contractId, amount, 'completion');
      
      if (!payment_link_url) throw new Error('Failed to get payment link from Cashfree.');

      // Redirect to Cashfree payment page
      window.location.href = payment_link_url;
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast.error('Failed to initiate payment: ' + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  const PaymentModal = ({ contract, isOpen, onClose }: { contract: any, isOpen: boolean, onClose: () => void }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Process Payment</h3>
              <p className="text-gray-600 mt-1">{contract.title}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Amount</h4>
              <p className="text-2xl font-semibold text-gray-900">
                ₹{contract.amount || contract.value?.toLocaleString() || '0'}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Card Details</h4>
              <div className="p-4 border border-gray-200 rounded-lg">
                {/* Card element would be rendered here */}
              </div>
            </div>

            <button
              onClick={() => handlePayment(contract.id, contract.value)}
              disabled={loading}
              className="w-full px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Details Modal
  const DetailsModal = ({ contract, isOpen, onClose }: { contract: any, isOpen: boolean, onClose: () => void }) => {
    const [clientName, setClientName] = useState('Loading...');
    const [freelancerName, setFreelancerName] = useState('Loading...');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchNames = async () => {
        if (!isOpen || !contract) return;
        
        try {
          setLoading(true);
          setError(null);
          
          // Fetch client name
          if (contract.client_id) {
            const { data: clientProfile, error: clientError } = await supabase
              .from('client_profiles')
              .select('full_name')
              .eq('id', contract.client_id)
              .single();
              
            if (!clientError && clientProfile) {
              setClientName(clientProfile.full_name || 'Client');
            } else {
              console.error('Error fetching client profile:', clientError);
              setClientName('Client');
            }
          }
          
          // Fetch freelancer name
          if (contract.freelancer_id) {
            const { data: freelancerProfile, error: freelancerError } = await supabase
              .from('freelancer_profiles')
              .select('full_name')
              .eq('id', contract.freelancer_id)
              .single();
              
            if (!freelancerError && freelancerProfile) {
              setFreelancerName(freelancerProfile.full_name || 'Freelancer');
            } else {
              console.error('Error fetching freelancer profile:', freelancerError);
              setFreelancerName('Freelancer');
            }
          }
        } catch (err) {
          console.error('Error in fetchNames:', err);
          setError('Failed to load profile information');
        } finally {
          setLoading(false);
        }
      };
      
      fetchNames();
    }, [contract, isOpen]);

    if (!isOpen || !contract) return null;
    
    const projectTitle = contract.title || 'Untitled Project';
    const createdAt = contract.created_at ? new Date(contract.created_at).toLocaleDateString() : '';
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Contract Details</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
          </div>
          <div className="space-y-4">
            <p className="text-gray-700">
              The contract is between <b>{clientName}</b> and <b>{freelancerName}</b> for project <b>{projectTitle}</b> which was created on <b>{createdAt}</b>.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <DetailsModal contract={selectedContract} isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} />
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Contract Management</h2>

      </div>

      {/* Contracts List */}
      <div className="space-y-4">
        {contracts.map((contract) => (
          <div
            key={contract.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-900">{contract.title}</h3>
                <div className="flex items-center space-x-2">
                  <img
                    src={contract.clientAvatar}
                    alt={contract.clientCompany}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm text-gray-600">{contract.clientCompany}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                contract.status === 'Active'
                  ? 'bg-green-100 text-green-800'
                  : contract.status === 'Completed'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {contract.status}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Clock className="text-gray-400" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="text-sm font-medium">
                    {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="text-gray-400" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Budget</p>
                  <p className="text-sm font-medium">
                    ₹{contract.amount || contract.value || '0'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-gray-400" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Last Payment</p>
                  <p className="text-sm font-medium">
                    {new Date(contract.lastPayment).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="text-gray-400" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Next Payment</p>
                  <p className="text-sm font-medium">
                    {contract.nextPayment ? new Date(contract.nextPayment).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className={`text-sm font-medium ${
                contract.payment_status === 'paid'
                  ? 'text-green-600'
                  : contract.payment_status === 'pending'
                  ? 'text-yellow-600'
                  : 'text-blue-600'
              }`}>
                Payment Status: {contract.payment_status}
              </span>
              <div className="flex space-x-2">
                {contract.payment_status !== 'paid' && (
                  <button
                    onClick={() => {
                      setSelectedContract(contract);
                      setShowPaymentModal(true);
                    }}
                    className="flex items-center px-3 py-1 text-sm text-[#00704A] hover:bg-[#00704A]/5 rounded"
                  >
                    <CreditCard size={16} className="mr-1" />
                    Pay Now
                  </button>
                )}
          
                <button
                  className="flex items-center px-3 py-1 text-sm text-[#00704A] hover:bg-[#00704A]/5 rounded"
                  onClick={() => {
                    setSelectedContract(contract);
                    setShowDetailsModal(true);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        contract={selectedContract}
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      />
    </div>
  )
}

export default ContractManagement