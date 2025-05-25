import { useState, useEffect } from 'react';
import { X, Plus, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface RequirementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  isClient: boolean;
  projectStatus: string;
}

interface Requirement {
  id: string;
  requirements_text: string;
  created_at: string;
  created_by: string;
}

export default function RequirementsModal({ 
  isOpen, 
  onClose, 
  projectId, 
  isClient,
  projectStatus 
}: RequirementsModalProps) {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [newRequirement, setNewRequirement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchRequirements();
    }
  }, [isOpen, projectId]);

  const fetchRequirements = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('project_requirements')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequirements(data || []);
    } catch (error) {
      console.error('Error fetching requirements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequirement.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error(userError?.message || 'User not authenticated');
      }

      console.log('=== DEBUG: Starting to add requirement ===');
      console.log('Project ID:', projectId);
      console.log('Requirement text:', newRequirement);
      console.log('User ID:', user.id);

      // First, verify the project exists and get client_id
      console.log('Verifying project exists and user is client...');
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('id, client_id')
        .eq('id', projectId)
        .single();

      if (projectError || !projectData) {
        console.error('Project verification failed:', projectError);
        throw new Error(projectError?.message || 'Project not found');
      }

      console.log('Project found. Client ID:', projectData.client_id);
      console.log('Current user is client?', user.id === projectData.client_id);

      // Insert the new requirement
      console.log('Attempting to insert requirement...');
      const { data, error: insertError } = await supabase
        .from('project_requirements')
        .insert([
          { 
            project_id: projectId, 
            requirements_text: newRequirement,
            created_by: user.id
          }
        ])
        .select('*'); // Select all fields to see what's returned

      if (insertError) {
        console.error('=== INSERT ERROR DETAILS ===');
        console.error('Code:', insertError.code);
        console.error('Message:', insertError.message);
        console.error('Details:', insertError.details);
        console.error('Hint:', insertError.hint);
        console.error('===========================');
        throw insertError;
      }

      console.log('Successfully added requirement:', data);

      // Refresh requirements
      await fetchRequirements();
      setNewRequirement('');
    } catch (error: any) {
      console.error('Error adding requirement:', {
        error,
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      });
      // Show error to the user
      alert(`Failed to add requirement: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">
            {isClient ? 'Manage Project Requirements' : 'Project Requirements'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00704A]"></div>
            </div>
          ) : requirements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No requirements added yet.
            </div>
          ) : (
            <div className="space-y-6">
              {requirements.map((req) => (
                <div key={req.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <p className="whitespace-pre-line">{req.requirements_text}</p>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-2">
                    <Clock size={14} className="mr-1" />
                    {new Date(req.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isClient && projectStatus !== 'completed' && (
          <div className="p-4 border-t">
            <form onSubmit={handleAddRequirement} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add New Requirements
              </label>
              <div className="flex space-x-2">
                <textarea
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  placeholder="Enter requirements here..."
                  rows={3}
                  className="flex-1 p-2 border rounded-lg focus:ring-1 focus:ring-[#00704A] focus:border-[#00704A] text-sm"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={!newRequirement.trim() || isSubmitting}
                  className="self-end px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Plus size={18} className="mr-1" />
                  Add
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
