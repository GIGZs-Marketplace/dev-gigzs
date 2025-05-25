import React, { useRef, useState, useEffect } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { 
  FileText, 
  Download, 
  Upload, 
  Trash2, 
  Edit, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  Send,
  X
} from 'lucide-react'
import { format } from 'date-fns'
import { supabase } from '../../../lib/supabase'
import SignatureModal from '../../SignatureModal'
import { toast } from 'react-hot-toast'

type SignatureRef = SignatureCanvas | null

interface ContractSigningProps {
  onClose?: () => void
}

function ContractSigning({ onClose }: ContractSigningProps) {
  // Modal state for contract preview
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [previewContract, setPreviewContract] = useState<any>(null);
  const [previewContractDetails, setPreviewContractDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setPreviewContract(null);
    setPreviewContractDetails(null);
    setDetailsError(null);
  };

  const [activeTab, setActiveTab] = useState<'contracts'>('contracts')
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [selectedContract, setSelectedContract] = useState<any>(null)
  const [selectedContractDetails, setSelectedContractDetails] = useState<any>(null)
  const signatureRef = useRef<SignatureRef>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [signatureData, setSignatureData] = useState<string | null>(null)
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [signingContractId, setSigningContractId] = useState<string | null>(null)

  useEffect(() => {
    const fetchContracts = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')
        // Get client profile
        const { data: clientProfile } = await supabase
          .from('client_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single()
        if (!clientProfile) throw new Error('Client profile not found')
        // Fetch contracts for this client with status 'pending'
        const { data, error } = await supabase
          .from('contracts')
          .select('*')
          .eq('client_id', clientProfile.id)
          .eq('status', 'pending')
        if (error) throw error
        setContracts(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }
    fetchContracts()
  }, [])

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear()
      setSignatureData(null)
    }
  }

  const saveSignature = () => {
    if (signatureRef.current) {
      const dataUrl = signatureRef.current.toDataURL()
      setSignatureData(dataUrl)
      setShowSignatureModal(false)
    }
  }

  // DEBUG: Log all contracts for the current client
  useEffect(() => {
    const debugFetchContracts = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('DEBUG: No user logged in');
          return;
        }
        const { data: clientProfile } = await supabase
          .from('client_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();
        if (!clientProfile) {
          console.log('DEBUG: No client profile found');
          return;
        }
        const { data: contracts, error } = await supabase
          .from('contracts')
          .select('*')
          .eq('client_id', clientProfile.id);
        if (error) {
          console.log('DEBUG: Error fetching contracts:', error);
        } else {
          console.log('DEBUG: Contracts for client:', contracts);
        }
      } catch (err) {
        console.log('DEBUG: Exception fetching contracts:', err);
      }
    };
    debugFetchContracts();
  }, []);

  const handleClientSign = async (contractId: string, signature: string) => {
    try {
      setLoading(true);
      
      console.log('DEBUG: Attempting to update contract. contractId:', contractId, 'typeof:', typeof contractId);
      // Update contract with signature
      const { error: updateError } = await supabase
        .from('contracts')
        .update({
          client_signature: signature,
          client_signed: true,
          status: 'signed',
        })
        .eq('id', contractId);

      if (updateError) {
        console.error('DEBUG: Supabase update error:', updateError);
        throw updateError;
      }

      // Refresh contracts list
      setContracts(prevContracts => 
        prevContracts.map(contract => 
          contract.id === contractId 
            ? { ...contract, client_signature: signature, status: 'signed' }
            : contract
        )
      );

      setShowSignatureModal(false);
      setSelectedContract(null);
      setSigningContractId(null);
      
      // Show success message
      toast.success('Contract signed successfully!');
    } catch (error) {
      console.error('DEBUG: Error signing contract:', error);
      toast.error('Failed to sign contract. Please try again.');
    } finally {
      setLoading(false);
    }
  };




  // Add contract details modal
  const ContractDetailsModal = ({ 
    contract, 
    isOpen, 
    onClose, 
    details,
    loading,
    error 
  }: { 
    contract: any, 
    isOpen: boolean, 
    onClose: () => void,
    details: any,
    loading: boolean,
    error: string | null
  }) => {
    if (!isOpen) return null;
    
    if (loading) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00704A]"></div>
            </div>
          </div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-semibold text-red-600">Error Loading Contract Details</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <p className="text-gray-700">{error}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Signatures</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Client Signature</p>
              {contract.client_signature ? (
                <img src={contract.client_signature} alt="Client Signature" className="max-w-[200px]" />
              ) : (
                <p className="text-gray-400">Not signed yet</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Freelancer Signature</p>
              {contract.freelancer_signature ? (
                <img src={contract.freelancer_signature} alt="Freelancer Signature" className="max-w-[200px]" />
              ) : (
                <p className="text-gray-400">Not signed yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Contract & NDA Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage and sign contracts and NDAs securely</p>
        </div>

      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('contracts')}
            className={`py-4 px-1 relative ${
              activeTab === 'contracts'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Active Contracts
          </button>
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search contracts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:border-primary"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending Signature</option>
            <option value="signed">Signed</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Contract List */}
      <div className="space-y-4">
        {contracts.map((contract) => (
          <div
            key={contract.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <FileText className="text-primary" size={24} />
                  <h3 className="text-lg font-semibold text-gray-900">{contract.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    contract.status === 'signed' ? 'bg-green-100 text-green-800' :
                    contract.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    contract.status === 'expired' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Created on {contract.created_at ? format(new Date(contract.created_at), 'MMM dd, yyyy') : 'N/A'}</p>
              </div>

              <div className="flex items-center space-x-2">
                {!contract.client_signature && (
                  <button 
                    onClick={() => {
                      setSelectedContract(contract)
                      setShowSignatureModal(true)
                      setSigningContractId(contract.id)
                    }}
                    className="px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538] transition-colors flex items-center"
                  >
                    Sign Now
                  </button>
                )}
                <button
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  onClick={async () => {
                    setShowDetailsModal(true);
                    setDetailsLoading(true);
                    setDetailsError(null);
                    try {
                      // Fetch client company name and freelancer name using FKs
                      const [clientRes, freelancerRes] = await Promise.all([
                        contract.client_id ? supabase.from('client_profiles').select('id,full_name,company_name,name,email').eq('id', contract.client_id).single() : { data: null },
                        contract.freelancer_id ? supabase.from('freelancer_profiles').select('id,full_name,name,email').eq('id', contract.freelancer_id).single() : { data: null }
                      ]);
                      setPreviewContract(contract);
                      setPreviewContractDetails({
                        client: clientRes.data,
                        freelancer: freelancerRes.data
                      });
                    } catch (err: any) {
                      setDetailsError(err.message || 'Failed to fetch contract details.');
                      setPreviewContractDetails(null);
                    } finally {
                      setDetailsLoading(false);
                    }
                  }}
                >
                  <Eye size={20} />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <Download size={20} />
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-6">
              <div className="flex items-center text-sm text-gray-600">
                <Users size={16} className="mr-2" />
                <span>{Array.isArray(contract.parties) ? contract.parties.join(', ') : 'N/A'}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock size={16} className="mr-2" />
                <span>Expires on {contract.end_date ? format(new Date(contract.end_date), 'MMM dd, yyyy') : 'N/A'}</span>
              </div>
            </div>

            {contract.status === 'pending' && (
              <div className="mt-4 flex items-center p-4 bg-yellow-50 rounded-lg">
                <AlertTriangle className="text-yellow-500 mr-2" size={20} />
                <span className="text-sm text-yellow-700">Awaiting signature from {contract.pendingSignature}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Signature Modal */}
      <SignatureModal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onSign={signature => signingContractId && handleClientSign(signingContractId, signature)}
        loading={loading}
      />

      {/* Contract Details Modal */}
      {previewContract && (
        <ContractDetailsModal 
          contract={previewContract} 
          isOpen={showDetailsModal} 
          onClose={closeDetailsModal} 
          details={previewContractDetails}
          loading={detailsLoading}
          error={detailsError}
        />
      )}
    </div>
  )
}

export default ContractSigning