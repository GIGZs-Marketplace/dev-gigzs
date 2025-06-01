import React, { useState, useEffect } from 'react';
import { FileText, X, Link as LinkIcon, Github, Linkedin, Globe, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

type DocumentType = 'government_id' | 'resume' | 'other';

interface Document {
  id: string;
  file_name: string;
  file_url: string;
  type: DocumentType;
  uploaded_at: string;
}

interface ProfileLinks {
  portfolio_url: string;
  linkedin_url: string;
  website_url: string;
  github_url: string;
}

interface UploadDetailsProps {
  userId?: string; // Added to accept userId from FreelancerOnboarding
  onNext: () => void;
  onBack: () => void;
}

function UploadDetails({ onNext, onBack, userId }: UploadDetailsProps) { // Added userId to props destructuring
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [links, setLinks] = useState<ProfileLinks>({
    portfolio_url: '',
    linkedin_url: '',
    website_url: '',
    github_url: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const hasRequiredDocs = () => {
    const hasGovId = documents.some(doc => doc.type === 'government_id');
    const hasResume = documents.some(doc => doc.type === 'resume');
    return hasGovId && hasResume;
  };
  
  const isFormValid = hasRequiredDocs();

  // Fetch uploaded documents and profile links on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsUploading(true);
      setError(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        
        // Fetch documents
        const { data: docsData, error: docsError } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', user.id)
          .order('uploaded_at', { ascending: false });
          
        if (docsError) throw docsError;
        
        // Fetch profile links
        const { data: profileData, error: profileError } = await supabase
          .from('freelancer_profiles')
          .select('portfolio_url, linkedin_url, website_url, github_url')
          .eq('user_id', user.id)
          .single();
          
        if (profileError && !profileError.details?.includes('0 rows')) {
          console.error('Error fetching profile:', profileError);
        }
        
        setDocuments(docsData || []);
        if (profileData) {
          setLinks({
            portfolio_url: profileData.portfolio_url || '',
            linkedin_url: profileData.linkedin_url || '',
            website_url: profileData.website_url || '',
            github_url: profileData.github_url || ''
          });
        }
      } catch (err: any) {
        setError(err.message || 'Error loading data');
      } finally {
        setIsUploading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: DocumentType) => {
    if (!e.target.files?.length) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const file = e.target.files[0];
      const bucket = type === 'government_id' ? 'government-ids' : 'resumes';
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      
      const fileUrl = urlData?.publicUrl || '';
      
      // First, check if a document of this type already exists
      const { data: existingDoc } = await supabase
        .from('documents')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', type)
        .single();

      let docData;
      if (existingDoc) {
        // Update existing document
        const { data, error } = await supabase
          .from('documents')
          .update({
            file_name: file.name,
            file_url: fileUrl,
            uploaded_at: new Date().toISOString()
          })
          .eq('id', existingDoc.id)
          .select()
          .single();
        
        if (error) throw error;
        docData = data;
      } else {
        // Insert new document
        const { data, error } = await supabase
          .from('documents')
          .insert({
            user_id: user.id,
            file_name: file.name,
            file_url: fileUrl,
            type,
            uploaded_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (error) throw error;
        docData = data;
      }
      
      // Update local state
      setDocuments(prev => [
        ...prev.filter(doc => doc.type !== type),
        docData
      ]);
      
    } catch (err: any) {
      setError(err.message || 'Error uploading file');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };
  
  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLinks(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const saveProfileLinks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('freelancer_profiles')
        .update({
          ...links,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
        
      if (error) throw error;
      
    } catch (err: any) {
      setError(err.message || 'Error saving profile links');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    try {
      await saveProfileLinks();
      if (onNext) onNext();
    } catch (err) {
      console.error('Error in form submission:', err);
    }
  };

  // Document removal functionality can be added here if needed
  // Currently using replace on upload instead of remove + upload

  const getDocumentByType = (type: DocumentType) => {
    return documents.find(doc => doc.type === type);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-[#00704A] transition-colors"
        >
          <Home className="h-5 w-5 mr-1" />
          <span>Home</span>
        </button>
      </div>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Verify Your Identity</h2>
          <p className="mt-2 text-gray-600">Please upload the required documents to complete your profile</p>
        </div>

        {/* Required Documents Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Required Documents</h3>
          
          {/* Government ID */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Government ID</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Upload a government-issued ID (Passport, Driver's License, etc.)
                </p>
                {getDocumentByType('government_id') && (
                  <div className="mt-2 flex items-center text-sm text-green-600">
                    <FileText className="h-4 w-4 mr-1" />
                    {getDocumentByType('government_id')?.file_name}
                  </div>
                )}
              </div>
              <div>
                <label className="cursor-pointer px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  {getDocumentByType('government_id') ? 'Change' : 'Upload'}
                  <input
                    type="file"
                    className="sr-only"
                    onChange={(e) => handleFileChange(e, 'government_id')}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </label>
              </div>
            </div>
          </div>
          
          {/* Resume */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Resume / CV</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Upload your most recent resume or CV
                </p>
                {getDocumentByType('resume') && (
                  <div className="mt-2 flex items-center text-sm text-green-600">
                    <FileText className="h-4 w-4 mr-1" />
                    {getDocumentByType('resume')?.file_name}
                  </div>
                )}
              </div>
              <div>
                <label className="cursor-pointer px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  {getDocumentByType('resume') ? 'Change' : 'Upload'}
                  <input
                    type="file"
                    className="sr-only"
                    onChange={(e) => handleFileChange(e, 'resume')}
                    accept=".pdf,.doc,.docx"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Links Section */}
        <div className="space-y-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Profile Links (Optional)</h3>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Portfolio URL */}
            <div>
              <label htmlFor="portfolio_url" className="block text-sm font-medium text-gray-700">
                Portfolio URL
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  name="portfolio_url"
                  id="portfolio_url"
                  value={links.portfolio_url}
                  onChange={handleLinkChange}
                  onBlur={saveProfileLinks}
                  className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
            
            {/* LinkedIn URL */}
            <div>
              <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700">
                LinkedIn Profile
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Linkedin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  name="linkedin_url"
                  id="linkedin_url"
                  value={links.linkedin_url}
                  onChange={handleLinkChange}
                  onBlur={saveProfileLinks}
                  className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>
            
            {/* GitHub URL */}
            <div>
              <label htmlFor="github_url" className="block text-sm font-medium text-gray-700">
                GitHub Profile
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Github className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  name="github_url"
                  id="github_url"
                  value={links.github_url}
                  onChange={handleLinkChange}
                  onBlur={saveProfileLinks}
                  className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="https://github.com/username"
                />
              </div>
            </div>
            
            {/* Website URL */}
            <div>
              <label htmlFor="website_url" className="block text-sm font-medium text-gray-700">
                Personal Website
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  name="website_url"
                  id="website_url"
                  value={links.website_url}
                  onChange={handleLinkChange}
                  onBlur={saveProfileLinks}
                  className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation buttons removed as per request */}
      </div>
    </form>
  )
}

export default UploadDetails