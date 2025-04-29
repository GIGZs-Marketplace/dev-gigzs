import { useState, useEffect } from 'react'
import { 
  Search, 
  DollarSign,
  Clock,
  Calendar,
  Edit,
  Save
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'

interface Review {
  id: number
  created_at: string
  duration: string
  value: string
  freelancer_id: string
  completed: string
  skills_used: string[]
  client_name?: string
  client_avatar?: string
  project_title?: string
  comment?: string
}

function Reviews() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingReview, setEditingReview] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Partial<Review>>({})

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      // First get the freelancer profile using user_id
      const { data: freelancerProfile, error: profileError } = await supabase
        .from('freelancer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;
      if (!freelancerProfile) throw new Error('Freelancer profile not found');

      // Get reviews without joining jobs
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews_freelancer')
        .select(`
          id,
          created_at,
          duration,
          value,
          completed,
          skills_used,
          job_id
        `)
        .eq('freelancer_id', freelancerProfile.id);

      if (reviewsError) throw reviewsError;

      // Fetch job titles separately
      const jobIds = reviewsData.map((review: any) => review.job_id);
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('id, title')
        .in('id', jobIds);

      if (jobsError) throw jobsError;

      const jobMap = jobsData.reduce((acc: any, job: any) => {
        acc[job.id] = job.title;
        return acc;
      }, {});

      const normalizedReviews = (reviewsData || []).map((review: any) => ({
        ...review,
        project_title: jobMap[review.job_id] || 'Project'
      }));

      setReviews(normalizedReviews);

    } catch (err) {
      console.error('Load reviews error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred loading reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (review: Review) => {
    setEditingReview(review.id)
    setEditForm(review)
  }

  const handleSave = async () => {
    if (!editingReview || !editForm) return

    try {
      setLoading(true)
      setError(null)

      const { error: updateError } = await supabase
        .from('reviews_freelancer')
        .update({
          duration: editForm.duration,
          value: editForm.value,
          completed: editForm.completed,
          skills_used: editForm.skills_used
        })
        .eq('id', editingReview)

      if (updateError) throw updateError

      // Refresh reviews after update
      await loadReviews()
      setEditingReview(null)
      setEditForm({})

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred saving review')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingReview(null)
    setEditForm({})
  }

  const filteredReviews = reviews.filter(review => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        review.project_title?.toLowerCase().includes(searchLower) ||
        review.comment?.toLowerCase().includes(searchLower) ||
        (Array.isArray(review.skills_used) && review.skills_used.some(skill =>
          skill?.toLowerCase().includes(searchLower)
        ))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Client Reviews</h2>
          <p className="text-sm text-gray-600 mt-1">See what clients are saying about your work</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
            >
              <option value="recent">Most Recent</option>
              <option value="value">Project Value</option>
              <option value="duration">Duration</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00704A] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            No reviews found
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              {editingReview === review.id ? (
                // Edit Form
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={editForm.duration || ''}
                      onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Value
                    </label>
                    <input
                      type="text"
                      value={editForm.value || ''}
                      onChange={(e) => setEditForm({ ...editForm, value: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Completion Date
                    </label>
                    <input
                      type="date"
                      value={editForm.completed || ''}
                      onChange={(e) => setEditForm({ ...editForm, completed: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Skills Used (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={editForm.skills_used?.join(', ') || ''}
                      onChange={(e) => setEditForm({ 
                        ...editForm, 
                        skills_used: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538] flex items-center disabled:opacity-50"
                      disabled={loading}
                    >
                      <Save size={18} className="mr-2" />
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                // Review Display
                <>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                      {review.client_avatar && (
                        <img
                          src={review.client_avatar}
                          alt={review.client_name}
                          className="h-12 w-12 rounded-full"
                        />
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900">{review.client_name || 'Client'}</h4>
                        <p className="text-gray-600">{review.project_title || 'Project'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEdit(review)}
                      className="text-gray-400 hover:text-[#00704A]"
                    >
                      <Edit size={18} />
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="text-gray-400" size={18} />
                      <div>
                        <p className="text-xs text-gray-500">Project Value</p>
                        <p className="text-sm font-medium">${review.value}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="text-gray-400" size={18} />
                      <div>
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="text-sm font-medium">{review.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="text-gray-400" size={18} />
                      <div>
                        <p className="text-xs text-gray-500">Completed</p>
                        <p className="text-sm font-medium">
                          {new Date(review.completed).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(review.skills_used) ? review.skills_used.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      )) : null}
                    </div>
                  </div>

                  {review.comment && (
                    <div className="mt-4 text-gray-600">
                      {review.comment}
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Reviews