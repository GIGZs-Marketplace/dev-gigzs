import React, { useState, useEffect } from 'react'
import { Star, ThumbsUp, MessageSquare, Filter, Search, Calendar, MoreVertical } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import AddReviewModal from './AddReviewModal'

function RatingsReviews() {
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedFreelancer, setSelectedFreelancer] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [freelancers, setFreelancers] = useState<{id: string, name: string}[]>([])
  const [projects, setProjects] = useState<{id: string, title: string}[]>([])
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    fetchReviews()
    fetchFreelancers()
    fetchProjects()
  }, [])

  const fetchFreelancers = async () => {
    const { data, error } = await supabase
      .from('freelancer_profiles')
      .select('id, full_name')
      .order('created_at', { ascending: false })
    if (!error && data) {
      setFreelancers(data.map((f: any) => ({ id: f.id, name: f.full_name })))
    } else {
      setFreelancers([])
    }
  }

  const fetchProjects = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return setProjects([])
    const { data: clientProfile } = await supabase
      .from('client_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (!clientProfile) return setProjects([])
    const { data, error } = await supabase
      .from('projects')
      .select('id, title')
      .eq('client_id', clientProfile.id)
      .order('created_at', { ascending: false })
    if (!error && data) {
      setProjects(data.map((p: any) => ({ id: p.id, title: p.title })))
    } else {
      setProjects([])
    }
  }

  const fetchReviews = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!clientProfile) throw new Error('Client profile not found')

      // DEBUG: Try a simple query without relationships first
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews_freelancer')
        .select('*')
        .eq('client_id', clientProfile.id)
        .order('created_at', { ascending: false });

      if (reviewsError) {
        console.error('Supabase reviews fetch error:', reviewsError);
        throw reviewsError;
      }

      // Once this works, try the advanced query below:
      // const { data: reviewsData, error: reviewsError } = await supabase
      //   .from('reviews_freelancer')
      //   .select(`
      //     id,
      //     created_at,
      //     rating,
      //     review_text,
      //     would_rehire,
      //     freelancer_id,
      //     project_id,
      //     freelancers:freelancer_profiles ( full_name, avatar_url, professional_title ),
      //     projects:projects ( title )
      //   `)
      //   .eq('client_id', clientProfile.id)
      //   .order('created_at', { ascending: false });
      //
      // if (reviewsError) {
      //   console.error('Supabase reviews fetch error:', reviewsError);
      //   throw reviewsError;
      // }

      const normalized = (reviewsData || []).map((r: any) => ({
        ...r,
        freelancer: {
          name: r.freelancers?.full_name || '',
          image: r.freelancers?.avatar_url || '',
          title: r.freelancers?.professional_title || ''
        },
        project: r.projects?.title || '',
        date: r.created_at,
        would_rehire: r.would_rehire,
      }))
      setReviews(normalized)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reviews')
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddReview = async (reviewData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!clientProfile) throw new Error('Client profile not found')

      // Verify project_id exists in projects table before inserting
      const { data: projectExists, error: projectError } = await supabase
        .from('projects')
        .select('id')
        .eq('id', reviewData.projectId)
        .single();
      if (projectError || !projectExists) {
        setError('Selected project does not exist. Please choose a valid project.');
        return;
      }

      const { error } = await supabase
        .from('reviews_freelancer')
        .insert([
          {
            // Required fields
            client_id: clientProfile.id,
            freelancer_id: reviewData.freelancerId,
            job_id: reviewData.jobId || null, // if not provided, set to null
            project_id: reviewData.projectId,
            duration: reviewData.duration || '',
            value: reviewData.value || '',
            completed: reviewData.completed || '',
            skills_used: reviewData.skillsUsed || '',
            created_at: new Date().toISOString(),
            rating: reviewData.rating,
            review_text: reviewData.review,
            would_rehire: Boolean(reviewData.wouldRehire)
          }
        ])

      if (error) throw error

      // Refresh reviews list
      await fetchReviews()
      setShowReviewModal(false)
      setSuccessMsg('Review submitted successfully!')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (error: any) {
      setError(error.message || 'Failed to submit review.')
      setShowReviewModal(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Ratings & Reviews</h2>
        <div className="flex items-center space-x-4">
          <button
            className="px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538] font-medium shadow transition-all"
            onClick={() => setShowReviewModal(true)}
          >
            Add Review
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:border-[#00704A]"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
          >
            <option value="all">All Reviews</option>
            <option value="recent">Recent First</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded mb-4">
          {successMsg}
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
            {/* Review Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={review.freelancer.image}
                  alt={review.freelancer.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{review.freelancer.name}</h3>
                  <p className="text-sm text-gray-600">{review.freelancer.title}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <Calendar size={16} className="text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Project and Freelancer Name */}
            <div className="mt-4">
              <span className="text-sm font-medium text-gray-600">Project:</span>
              <span className="ml-2 text-sm text-gray-900">{review.project}</span>
              <span className="mx-2 text-gray-400">|</span>
              <span className="text-sm font-medium text-gray-600">Freelancer:</span>
              <span className="ml-2 text-sm text-gray-900">{review.freelancer.name}</span>
            </div>

            {/* Rating */}
            <div className="mt-4 flex items-center">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">{review.rating}.0</span>
            </div>

            {/* Review Text */}
            <p className="mt-4 text-gray-700">{review.review_text}</p>

            {/* Would Rehire */}
            <div className="mt-4">
              <span className="text-sm font-medium text-gray-600">Would Rehire:</span>
              <span className="ml-2 text-sm font-semibold text-gray-900">{review.would_rehire ? 'Yes' : 'No'}</span>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end border-t pt-4">
              <button className="text-[#00704A] hover:text-[#005538] text-sm font-medium">
                View Full Review
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Review Modal */}
      <AddReviewModal
        open={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleAddReview}
        freelancers={freelancers}
        projects={projects}
      />
    </div>
  )
}

export default RatingsReviews