import React, { useState, useEffect } from 'react'
import { Upload, FileText, Image, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface UploadDetailsProps {
  onNext: () => void
  onBack: () => void
}

interface UploadedDoc {
  id: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
}

function UploadDetails({ onNext }: UploadDetailsProps) {
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch uploaded documents on mount
  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', user.id)
          .order('uploaded_at', { ascending: false });
        if (error) throw error;
        setUploadedDocs(data || []);
      } catch (err: any) {
        setError(err.message || 'Error loading documents');
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const files = Array.from(e.target.files);
      for (const file of files) {
        const filePath = `${user.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath);
        const fileUrl = urlData?.publicUrl || '';
        // Save metadata to table
        const { error: metaError } = await supabase
          .from('documents')
          .insert({
            user_id: user.id,
            file_name: file.name,
            file_url: fileUrl,
            uploaded_at: new Date().toISOString(),
          });
        if (metaError) throw metaError;
      }
      // Refresh list
      const { data } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });
      setUploadedDocs(data || []);
      // Move to next onboarding step after successful upload
      if (typeof onNext === 'function') onNext();
    } catch (err: any) {
      setError(err.message || 'Error uploading file');
    } finally {
      setLoading(false);
    }
  };

  const removeDocument = async (index: number) => {
    setError(null);
    setLoading(true);
    try {
      const doc = uploadedDocs[index];
      // Remove from Storage (optional)
      const filePath = doc.file_url.split('/documents/')[1];
      if (filePath) {
        await supabase.storage.from('documents').remove([filePath]);
      }
      // Remove from DB
      await supabase.from('documents').delete().eq('id', doc.id);
      setUploadedDocs(uploadedDocs.filter((_, i) => i !== index));
    } catch (err: any) {
      setError(err.message || 'Error deleting file');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Upload Your Documents</h2>
        <p className="mt-2 text-gray-600">Please provide the necessary documentation to verify your identity and skills</p>
      </div>

      {/* Document Upload Section */}
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-[#00704A]">
                  Click to upload
                </span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  multiple
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </label>
              <p className="text-xs text-gray-500">
                PDF, DOC, DOCX, JPG, JPEG, PNG up to 10MB
              </p>
            </div>
          </div>
        </div>

        {/* Uploaded Documents List (from DB) */}
        {uploadedDocs.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium text-gray-700">Uploaded Documents</h3>
            <div className="grid grid-cols-1 gap-3">
              {uploadedDocs.map((doc, index) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    {doc.file_name.match(/\.(jpg|jpeg|png)$/i) ? (
                      <>
                        <Image className="h-5 w-5 text-gray-400" />
                        <img src={doc.file_url} alt={doc.file_name} className="ml-2 h-10 w-10 object-cover rounded-full border" />
                        <button
                          className="ml-2 px-2 py-1 text-xs bg-green-500 text-white rounded"
                          onClick={async () => {
                            // Set as profile picture
                            setLoading(true);
                            setError(null);
                            try {
                              const { data: { user } } = await supabase.auth.getUser();
                              if (!user) throw new Error('Not authenticated');
                              await supabase
                                .from('freelancer_profiles')
                                .update({ avatar_url: doc.file_url })
                                .eq('user_id', user.id);
                            } catch (err: any) {
                              setError(err.message || 'Error setting profile picture');
                            } finally {
                              setLoading(false);
                            }
                          }}
                        >Set as Profile Picture</button>
                      </>
                    ) : (
                      <FileText className="h-5 w-5 text-gray-400" />
                    )}
                    <span className="ml-2 text-sm text-gray-600">{doc.file_name}</span>
                  </div>
                  <button
                    onClick={() => removeDocument(index)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Required Documents List */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-700 mb-2">Required Documents</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Government-issued ID (Passport or Driver's License)</li>
          <li>• Professional certifications (if applicable)</li>
          <li>• Portfolio samples</li>
          <li>• Resume/CV</li>
        </ul>
      </div>
    </div>
  )
}

export default UploadDetails