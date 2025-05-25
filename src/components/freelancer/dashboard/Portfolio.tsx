import { useState, useEffect } from 'react'
import { 
  Plus,
  Edit2,
  X,
  Trash
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'

interface PortfolioProject {
  id: string;
  freelancer_id: string;
  title: string;
  description: string;
  skills: string[];
  date: string;
  tech: string[];
  external_url?: string;
  project_type?: 'external' | 'platform';
  platform_project_id?: string;
  auto_rating?: number | null;
  status?: string;
}

function Portfolio() {
  const [projects, setProjects] = useState<PortfolioProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    tech: [] as string[],
    skills: [] as string[],
    external_url: '',
  })
  const [freelancerProfile, setFreelancerProfile] = useState<any>(null)
  const [profileChecked, setProfileChecked] = useState(false)

  useEffect(() => {
    loadPortfolioProjects()
  }, [])

  const loadPortfolioProjects = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')
      console.log('Current user:', user);

      // Get freelancer profile ID first
      const { data: freelancerProfileData, error: profileError } = await supabase
        .from('freelancer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      setFreelancerProfile(freelancerProfileData)
      setProfileChecked(true)

      if (profileError) {
        console.error('Error fetching freelancer profile:', profileError)
        throw new Error('Could not find freelancer profile')
      }

      if (!freelancerProfileData) {
        throw new Error('Freelancer profile not found')
      }
      console.log('Freelancer profile:', freelancerProfileData);
      // Get portfolio projects
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('Portfolio')
        .select(`
          id,
          freelancer_id,
          title,
          description,
          skills,
          date,
          tech,
          external_url,
          project_type,
          platform_project_id,
          auto_rating,
          status
        `)
        .eq('freelancer_id', freelancerProfileData.id)
        .order('date', { ascending: false })

      if (portfolioError) {
        console.error('Error fetching portfolio:', portfolioError)
        throw portfolioError
      }

      setProjects(portfolioData || [])
      console.log('Portfolio data:', portfolioData);
    } catch (err) {
      console.error('Portfolio error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred loading portfolio')
    } finally {
      setLoading(false)
    }
  }

  const handleAddProject = async () => {
    try {
      setError(null)
      setIsSubmitting(true)
      
      if (!newProject.title || !newProject.description) {
        setError('Title and description are required')
        return
      }

      if (!freelancerProfile || !freelancerProfile.id) {
        setError('Freelancer profile not found. Please complete your freelancer onboarding.')
        return
      }
      console.log('Using freelancerProfile for insert:', freelancerProfile)

      // Create the new project object
      const newProjectData = {
        freelancer_id: freelancerProfile.id,
        title: newProject.title.trim(),
        description: newProject.description.trim(),
        tech: newProject.tech,
        skills: newProject.skills,
        external_url: newProject.external_url.trim(),
        date: new Date().toISOString(),
        project_type: 'external',
        status: 'published',
      }

      // Insert the new project
      const { error: insertError } = await supabase
        .from('Portfolio')
        .insert([newProjectData])

      if (insertError) {
        console.error('Insert error:', insertError)
        if (insertError.code === '23503') {
          setError('Your freelancer profile could not be found in the database. Please contact support if this persists.')
        } else {
          setError('Failed to add project: ' + insertError.message)
        }
        return
      }

      // Fetch the updated list of projects
      const { data: portfolioData, error: fetchError } = await supabase
        .from('Portfolio')
        .select('*')
        .eq('freelancer_id', freelancerProfile.id)
        .order('date', { ascending: false })

      if (fetchError) {
        console.error('Fetch error:', fetchError)
        throw new Error('Failed to refresh projects')
      }

      setProjects(portfolioData || [])
      setShowAddModal(false)
      setNewProject({
        title: '',
        description: '',
        tech: [],
        skills: [],
        external_url: ''
      })
    } catch (err) {
      console.error('Error adding project:', err)
      setError(err instanceof Error ? err.message : 'An error occurred adding the project')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddTag = (type: 'tech' | 'skills') => {
    const tag = prompt(`Enter new ${type === 'tech' ? 'technology' : 'skill'}`)?.trim()
    if (tag && !newProject[type].includes(tag)) {
      setNewProject({
        ...newProject,
        [type]: [...newProject[type], tag]
      })
    }
  }

  const handleRemoveTag = (type: 'tech' | 'skills', index: number) => {
    setNewProject({
      ...newProject,
      [type]: newProject[type].filter((_, i) => i !== index)
    })
  }

  const handleEdit = (projectId: string) => {
    // Implement edit functionality
    console.log('Edit project:', projectId)
  }

  const handleDelete = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('Portfolio')
        .delete()
        .eq('id', projectId)

      if (error) throw error

      setProjects(projects.filter(project => project.id !== projectId))
    } catch (err) {
      console.error('Error deleting project:', err)
      setError(err instanceof Error ? err.message : 'An error occurred deleting the project')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00704A]"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Portfolio</h2>
          <p className="text-sm text-gray-600 mt-1">Showcase your best work and projects. Platform-completed projects are shown automatically and cannot be edited.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538]"
          disabled={!freelancerProfile || !freelancerProfile.id}
        >
          <Plus size={20} className="mr-2" />
          Add External Project
        </button>
      </div>
      {profileChecked && (!freelancerProfile || !freelancerProfile.id) && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
          You need to complete your freelancer profile before adding portfolio projects. Please go to your profile settings to finish onboarding.
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add External Project</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
                  placeholder="Enter project title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
                  rows={4}
                  placeholder="Describe your project"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  External Project URL (GitHub, LinkedIn, etc.)
                </label>
                <input
                  type="text"
                  value={newProject.external_url}
                  onChange={(e) => setNewProject({ ...newProject, external_url: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
                  placeholder="https://github.com/your-project or https://linkedin.com/in/your-profile"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Technologies
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newProject.tech.map((tech, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center"
                    >
                      {tech}
                      <button
                        onClick={() => handleRemoveTag('tech', index)}
                        className="ml-2 text-gray-500 hover:text-red-500"
                      >
                        <Trash size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => handleAddTag('tech')}
                  className="text-[#00704A] hover:text-[#005538] text-sm flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                  Add Technology
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newProject.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center"
                    >
                      {skill}
                      <button
                        onClick={() => handleRemoveTag('skills', index)}
                        className="ml-2 text-gray-500 hover:text-red-500"
                      >
                        <Trash size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => handleAddTag('skills')}
                  className="text-[#00704A] hover:text-[#005538] text-sm flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                  Add Skill
                </button>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProject}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Adding...
                    </>
                  ) : (
                    'Add Project'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Grid */}
      {/* Deduplicate projects by id before rendering */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from(new Map(projects.map(p => [p.id, p])).values()).map((project) => (
          <div key={project.id} className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <span className={project.project_type === 'platform' ? 'text-xs text-blue-600 font-semibold' : 'text-xs text-gray-400'}>
                  {project.project_type === 'platform' ? 'Platform Project' : 'External Project'}
                </span>
                {project.auto_rating !== undefined && project.auto_rating !== null && (
                  <span className="text-xs text-yellow-600 font-semibold">Auto Rating: {project.auto_rating.toFixed(1)}</span>
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mt-2">{project.title}</h3>
              <p className="mt-2 text-gray-600 line-clamp-2">{project.description}</p>

              {/* Technologies */}
              {project.tech && project.tech.length > 0 && (
  <div className="mt-4">
    <div className="font-semibold text-xs text-gray-500 mb-1">Technologies:</div>
    <div className="flex flex-wrap gap-2">
      {project.tech.map((tech, index) => (
        <span
          key={index}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
        >
          {tech}
        </span>
      ))}
    </div>
  </div>
)}

              {/* Skills */}
              {project.skills && project.skills.length > 0 && (
  <div className="mt-2">
    <div className="font-semibold text-xs text-gray-500 mb-1">Skills:</div>
    <div className="flex flex-wrap gap-2">
      {project.skills.map((skill, index) => (
        <span
          key={index}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
        >
          {skill}
        </span>
      ))}
    </div>
  </div>
)}

              {/* External URL */}
              {project.external_url && (
                <div className="mt-4">
                  <a href={project.external_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">
                    View External Project
                  </a>
                </div>
              )}

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">{project.status === 'published' ? 'Published' : (project.status || '')}</span>
                <span className="text-sm text-gray-500">
                  {new Date(project.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>

              {/* Only allow edit/delete for external projects */}
              {project.project_type !== 'platform' && (
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => handleEdit(project.id)}
                    className="p-2 bg-white rounded-full shadow hover:bg-gray-50"
                  >
                    <Edit2 size={16} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-2 bg-white rounded-full shadow hover:bg-gray-50"
                  >
                    <Trash size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {!loading && projects.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No portfolio projects yet. Add your first project!
        </div>
      )}
    </div>
  )
}

export default Portfolio