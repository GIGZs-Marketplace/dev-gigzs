import { useState, useEffect } from 'react'
import { 
  Star, 
  Shield, 
  Zap, 
  Plus,
  Search,
  Info,
  X
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'

function SkillsBadges() {
  // --- Certifications State & Hooks ---
  type Certification = {
    id: string;
    name: string;
    issuer: string;
    logo: string;
    description: string;
    credential_url: string;
    issueDate: string;
    expires: string | null;
  };

  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [showAddCertModal, setShowAddCertModal] = useState(false);
  const [newCert, setNewCert] = useState({
    name: '',
    issuer: '',
    logo: '',
    description: '',
    credential_url: '',
    issueDate: '',
    expires: '',
  });
  const [certLoading, setCertLoading] = useState(false);
  const [certError, setCertError] = useState<string | null>(null);

  // Load certifications from Supabase
  type SupabaseCertification = {
    id: string;
    user_id: string;
    name: string;
    issuer: string;
    logo: string;
    description: string;
    credential_url: string;
    issue_date: string;
    expires: string | null;
  };

  const loadCertifications = async () => {
    try {
      setCertLoading(true);
      setCertError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .eq('user_id', user.id)
        .order('issue_date', { ascending: false });
      if (error) throw error;
      setCertifications(
        (data || []).map((cert: SupabaseCertification) => ({
          id: cert.id,
          name: cert.name,
          issuer: cert.issuer,
          logo: cert.logo,
          description: cert.description,
          credential_url: cert.credential_url,
          issueDate: cert.issue_date,
          expires: cert.expires,
        }))
      );
    } catch (err) {
      setCertError(err instanceof Error ? err.message : 'An error occurred loading certifications');
    } finally {
      setCertLoading(false);
    }
  };

  useEffect(() => {
    loadCertifications();
  }, []);

  // Add Certification Handler
  const handleAddCertification = async () => {
    if (!newCert.name.trim() || !newCert.issuer.trim()) return;
    try {
      setCertLoading(true);
      setCertError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      const { data, error } = await supabase
        .from('certifications')
        .insert([
          {
            user_id: user.id,
            name: newCert.name.trim(),
            issuer: newCert.issuer.trim(),
            logo: newCert.logo.trim(),
            description: newCert.description.trim(),
            credential_url: newCert.credential_url.trim(),
            issue_date: newCert.issueDate,
            expires: newCert.expires || null,
          },
        ])
        .select();
      if (error) throw error;
      setShowAddCertModal(false);
      setNewCert({ name: '', issuer: '', logo: '', description: '', credential_url: '', issueDate: '', expires: '' });
      loadCertifications();
    } catch (err) {
      setCertError(err instanceof Error ? err.message : 'An error occurred adding certification');
    } finally {
      setCertLoading(false);
    }
  };

  // Delete Certification Handler
  const handleDeleteCertification = async (id: string) => {
    try {
      setCertLoading(true);
      setCertError(null);
      await supabase.from('certifications').delete().eq('id', id);
      loadCertifications();
    } catch (err) {
      setCertError(err instanceof Error ? err.message : 'An error occurred deleting certification');
    } finally {
      setCertLoading(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showAddSkillModal, setShowAddSkillModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSkills()
  }, [])

  const loadSkills = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { data: freelancerProfile, error: profileError } = await supabase
        .from('freelancer_profiles')
        .select('skills')
        .eq('user_id', user.id)
        .single()

      if (profileError) throw profileError

      if (freelancerProfile) {
        const dbSkills = freelancerProfile.skills;
        setSkills(Array.isArray(dbSkills) ? dbSkills : []);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred loading skills')
    } finally {
      setLoading(false)
    }
  }

  const handleAddSkill = async () => {
    if (!newSkill.trim() || skills.includes(newSkill.trim())) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const updatedSkills = [...skills, newSkill.trim()]

      const { error } = await supabase
        .from('freelancer_profiles')
        .update({ skills: updatedSkills })
        .eq('user_id', user.id)

      if (error) throw error

      setSkills(updatedSkills)
      setNewSkill('')
      setShowAddSkillModal(false)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred adding skill')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveSkill = async (skillToRemove: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const updatedSkills = skills.filter(skill => skill !== skillToRemove)

      const { error } = await supabase
        .from('freelancer_profiles')
        .update({ skills: updatedSkills })
        .eq('user_id', user.id)

      if (error) throw error

      setSkills(updatedSkills)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred removing skill')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Skills & Badges</h2>
          <p className="text-sm text-gray-600 mt-1">Showcase your expertise and achievements</p>
        </div>
        <button
          onClick={() => setShowAddSkillModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-[#005538] flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Add New Skill
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search skills and badges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
            >
              <option value="all">All Categories</option>
              <option value="technical">Technical Skills</option>
              <option value="soft">Soft Skills</option>
              <option value="certifications">Certifications</option>
            </select>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Earned Badges</h3>
        <div className="text-gray-500 text-center py-8">No badges earned yet.</div>
      </div>

      {/* Skills Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Skills</h3>
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg px-4 py-2 flex items-center gap-2 hover:shadow-md transition-all duration-300"
            >
              <span className="text-gray-900">{skill}</span>
              <button
                onClick={() => handleRemoveSkill(skill)}
                className="text-gray-400 hover:text-red-500"
                disabled={loading}
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <button
            onClick={() => setShowAddSkillModal(true)}
            className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#00704A] hover:text-primary flex items-center gap-2"
            disabled={loading}
          >
            <Plus size={20} />
            Add Skill
          </button>
        </div>
      </div>

      {/* Certifications Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Certifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certError && (
  <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">{certError}</div>
)}
{certLoading ? (
  <div className="text-gray-500">Loading certifications...</div>
) : (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {certifications.map((cert) => (
        <div
          key={cert.id}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-center space-x-4">
            <img
              src={cert.logo}
              alt={cert.name}
              className="w-12 h-12 object-contain"
            />
            <div>
              <h4 className="font-medium text-gray-900">{cert.name}</h4>
              <p className="text-sm text-gray-500">{cert.issuer}</p>
              {cert.description && (
                <p className="text-xs text-gray-400 mt-1">{cert.description}</p>
              )}
              {cert.credential_url && (
                <a
                  href={cert.credential_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 underline mt-1 inline-block"
                >
                  View Credential
                </a>
              )}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-gray-500">Issued {cert.issueDate}</span>
            {cert.expires ? (
              <span className="text-yellow-600">Expires {cert.expires}</span>
            ) : (
              <span className="text-green-600">No Expiration</span>
            )}
            <button onClick={() => handleDeleteCertification(cert.id)} className="text-gray-400 hover:text-red-500 ml-2" disabled={certLoading}><X size={16} /></button>
          </div>
        </div>
      ))}
      <div className="flex items-stretch">
        <button
          onClick={() => setShowAddCertModal(true)}
          className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#00704A] hover:text-primary flex items-center gap-2 w-full justify-center"
          disabled={certLoading}
        >
          <Plus size={20} />
          Add Certification
        </button>
      </div>
    </div>
  </>
)}
        </div>
      </div>

      {/* Add Skill Modal */}
      {showAddSkillModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Skill</h3>
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Enter skill name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A] mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddSkillModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleAddSkill}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-[#005538] disabled:opacity-50"
                disabled={loading || !newSkill.trim()}
              >
                Add Skill
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add Certification Modal */}
      {showAddCertModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Certification</h3>
            <input
              type="text"
              placeholder="Certification Name"
              value={newCert.name}
              onChange={e => setNewCert({ ...newCert, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A] mb-2"
            />
            <input
              type="text"
              placeholder="Issuer"
              value={newCert.issuer}
              onChange={e => setNewCert({ ...newCert, issuer: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A] mb-2"
            />
            <input
              type="text"
              placeholder="Logo URL (optional)"
              value={newCert.logo}
              onChange={e => setNewCert({ ...newCert, logo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A] mb-2"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newCert.description}
              onChange={e => setNewCert({ ...newCert, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A] mb-2"
            />
            <input
              type="text"
              placeholder="Credential URL (optional)"
              value={newCert.credential_url}
              onChange={e => setNewCert({ ...newCert, credential_url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A] mb-2"
            />
            <label className="block text-sm text-gray-600 mb-1">Start Date</label>
            <input
              type="month"
              value={newCert.issueDate}
              onChange={e => setNewCert({ ...newCert, issueDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A] mb-2"
            />
            <label className="block text-sm text-gray-600 mb-1">End Date (optional)</label>
            <input
              type="month"
              value={newCert.expires}
              onChange={e => setNewCert({ ...newCert, expires: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A] mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddCertModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={certLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleAddCertification}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-[#005538] disabled:opacity-50"
                disabled={certLoading || !newCert.name.trim() || !newCert.issuer.trim()}
              >
                Add Certification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const badges = [
  {
    id: 1,
    name: 'Top Rated',
    description: 'Consistently high client satisfaction',
    icon: Star,
    bgColor: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
    earnedDate: 'Mar 2024'
  },
  {
    id: 2,
    name: 'Expert',
    description: 'Demonstrated expertise in field',
    icon: Shield,
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    earnedDate: 'Feb 2024'
  },
  {
    id: 3,
    name: 'Rising Talent',
    description: 'Exceptional early performance',
    icon: Zap,
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    earnedDate: 'Jan 2024'
  }
]


export default SkillsBadges