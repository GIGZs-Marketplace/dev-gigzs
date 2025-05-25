import { useState, useEffect } from 'react'
import { 
  ArrowLeft,
  Clock,
  DollarSign,
  Calendar,
  CheckCircle,
  MessageSquare,
  FileText,
  Upload,
  AlertCircle,
  Plus,
  X,
  ListChecks
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'

interface ProjectDetailsProps {
  projectId: string
  onBack: () => void
}

interface Requirement {
  id: string;
  requirements_text: string;
  created_at: string;
  created_by: string;
}

function ProjectDetails({ projectId, onBack }: ProjectDetailsProps) {
  const [showSubmitWorkModal, setShowSubmitWorkModal] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null)
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRequirements = async () => {
      try {
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

    fetchRequirements();
  }, [projectId]);

  // Find project details - in a real app, this would fetch from API
  const project = projects.find(p => p.id === projectId)

  if (!project) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Project not found</h3>
        <button
          onClick={onBack}
          className="mt-4 text-[#00704A] hover:text-[#005538]"
        >
          Go back
        </button>
      </div>
    )
  }

  const canSubmitWork = (project.totalPayment / project.budget) >= 0.75

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{project.title}</h2>
            <p className="text-sm text-gray-600 mt-1">Project Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
            project.status === 'Completed' ? 'bg-green-100 text-green-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {project.status}
          </span>
          {canSubmitWork && (
            <button
              onClick={() => setShowSubmitWorkModal(true)}
              className="px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538] flex items-center"
            >
              <Upload size={20} className="mr-2" />
              Submit Work
            </button>
          )}
        </div>
      </div>

      {/* Project Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Project Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="text-gray-400" size={20} />
                <span className="text-gray-600">Start Date</span>
              </div>
              <span className="font-medium">{project.startDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="text-gray-400" size={20} />
                <span className="text-gray-600">Deadline</span>
              </div>
              <span className="font-medium">{project.deadline}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="text-gray-400" size={20} />
                <span className="text-gray-600">Budget</span>
              </div>
              <span className="font-medium">${project.budget.toLocaleString()}</span>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <h4 className="font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-gray-600">{project.description}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Total Received</span>
                <span className="font-medium">${project.totalPayment.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#00704A] h-2 rounded-full"
                  style={{ width: `${(project.totalPayment / project.budget) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Payment Status</span>
              <span className={`font-medium ${
                project.paymentStatus === 'Paid' ? 'text-green-600' :
                project.paymentStatus === 'Pending' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {project.paymentStatus}
              </span>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <h4 className="font-medium text-gray-900 mb-2">Next Payment</h4>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Expected Amount</span>
                <span className="font-medium">${project.nextPayment.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">Due Date</span>
                <span className="font-medium">{project.nextPaymentDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Requirements Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <ListChecks className="mr-2" size={20} />
              Project Requirements
            </h3>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00704A]"></div>
            </div>
          ) : requirements.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No requirements have been added yet.
            </div>
          ) : (
            <div className="space-y-6 bg-gray-50 p-4 rounded-lg">
              {requirements.map((req) => (
                <div key={req.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                  <div className="whitespace-pre-line text-gray-800">
                    {req.requirements_text}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-2">
                    <Clock size={14} className="mr-1" />
                    Added on {new Date(req.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        </div>
        
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Project Milestones</h3>
        <div className="space-y-4">
          {project.milestones.map((milestone, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    milestone.status === 'completed' ? 'bg-green-100' :
                    milestone.status === 'in_progress' ? 'bg-blue-100' :
                    'bg-gray-100'
                  }`}>
                    {milestone.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                    <p className="text-sm text-gray-500">{milestone.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-medium">${milestone.amount.toLocaleString()}</span>
                  <p className="text-sm text-gray-500">Due: {milestone.dueDate}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Communication History */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Communication History</h3>
        <div className="space-y-4">
          {project.communications.map((comm, index) => (
            <div key={index} className="flex items-start space-x-4">
              <img
                src={comm.avatar}
                alt={comm.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-900">{comm.name}</span>
                    <span className="text-gray-500 text-sm ml-2">{comm.time}</span>
                  </div>
                  {comm.type === 'message' ? (
                    <MessageSquare size={16} className="text-gray-400" />
                  ) : (
                    <FileText size={16} className="text-gray-400" />
                  )}
                </div>
                <p className="text-gray-600 mt-1">{comm.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Work Modal */}
      {showSubmitWorkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Submit Work</h3>
              <button
                onClick={() => setShowSubmitWorkModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Milestone</label>
                <select
                  value={selectedMilestone || ''}
                  onChange={(e) => setSelectedMilestone(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none"
                >
                  <option value="">Choose a milestone</option>
                  {project.milestones.map((milestone, index) => (
                    <option key={index} value={milestone.id}>
                      {milestone.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={4}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none"
                  placeholder="Describe the work you're submitting..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Attachments</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <Plus className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer rounded-md font-medium text-[#00704A] hover:text-[#005538]">
                        <span>Upload files</span>
                        <input type="file" className="sr-only" multiple />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowSubmitWorkModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538]"
                >
                  Submit Work
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const projects = [
  {
    id: '1',
    title: 'E-commerce Website Development',
    status: 'In Progress',
    startDate: 'Mar 15, 2024',
    deadline: 'Jun 15, 2024',
    budget: 12000,
    totalPayment: 9000,
    paymentStatus: 'Pending',
    nextPayment: 3000,
    nextPaymentDate: 'Apr 15, 2024',
    description: 'Development of a full-featured e-commerce platform including product management, payment integration, and admin dashboard.',
    milestones: [
      {
        id: 'm1',
        title: 'Frontend Development',
        description: 'Complete UI implementation and responsive design',
        amount: 4000,
        dueDate: 'Apr 15, 2024',
        status: 'completed'
      },
      {
        id: 'm2',
        title: 'Backend Integration',
        description: 'API development and database setup',
        amount: 5000,
        dueDate: 'May 15, 2024',
        status: 'in_progress'
      },
      {
        id: 'm3',
        title: 'Testing & Deployment',
        description: 'Final testing and production deployment',
        amount: 3000,
        dueDate: 'Jun 15, 2024',
        status: 'pending'
      }
    ],
    communications: [
      {
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        time: '2 hours ago',
        content: 'The frontend development is coming along nicely. I\'ve completed the product listing and cart functionality.',
        type: 'message'
      },
      {
        name: 'Michael Chen',
        avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        time: '1 day ago',
        content: 'Updated the project timeline document with the latest milestones.',
        type: 'file'
      }
    ]
  }
]

export default ProjectDetails