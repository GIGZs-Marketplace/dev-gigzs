import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSign: (signature: string) => void;
  loading?: boolean;
  initialSignature?: string | null;
}

const SignatureModal: React.FC<SignatureModalProps> = ({ isOpen, onClose, onSign, loading, initialSignature }) => {
  const signatureRef = useRef<SignatureCanvas | null>(null);
  const [signatureData, setSignatureData] = useState<string | null>(initialSignature || null);

  useEffect(() => {
    if (isOpen && signatureRef.current && initialSignature) {
      signatureRef.current.fromDataURL(initialSignature);
    }
    if (!isOpen) {
      setSignatureData(initialSignature || null);
    }
  }, [isOpen, initialSignature]);

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setSignatureData(null);
    }
  };

  const handleSign = () => {
    if (signatureRef.current) {
      const dataUrl = signatureRef.current.toDataURL();
      setSignatureData(dataUrl);
      onSign(dataUrl);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Sign Contract</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        <div className="border rounded-lg p-4 mb-4">
          <SignatureCanvas
            ref={signatureRef}
            canvasProps={{
              className: 'signature-canvas border rounded-lg w-full h-64 bg-gray-50',
            }}
            backgroundColor="rgb(249, 250, 251)"
          />
        </div>
        <div className="flex justify-between">
          <button
            onClick={clearSignature}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            Clear
          </button>
          <div className="space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSign}
              className="px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538]"
              disabled={loading}
            >
              {loading ? 'Signing...' : 'Sign Contract'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignatureModal;
