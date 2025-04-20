import React, { useState } from 'react'
import { Star, ThumbsUp, MessageSquare, Filter, Search, Calendar, MoreVertical } from 'lucide-react'
import { supabase } from '../../../lib/supabase'

function RatingsReviews() {
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedFreelancer, setSelectedFreelancer] = useState<any>(null)

  const reviews = [
    {
      id: 1,
      freelancer: {
        name: 'Sarah Johnson',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        title: 'Senior Full Stack Developer'
      },
      project: 'E-commerce Website Development',
      rating: 5,
      review: 'Sarah exceeded all expectations. Her technical expertise and communication skills were outstanding. She delivered the project ahead of schedule and implemented additional features that greatly enhanced the functionality.',
      date: '2024-03-15',
      metrics: {
        communication: 5,
        quality: 5,
        expertise: 5,
        deadlines: 5,
        collaboration: 5
      },
      helpful: 12,
      replies: 3
    },
    {
      id: 2,
      freelancer: {
        name: 'Michael Chen',
        image: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        title: 'UI/UX Designer'
      },
      project: 'Mobile App Design',
      rating: 4,
      review: 'Michael brought creative solutions to our design challenges. His attention to detail and user-centric approach resulted in a highly intuitive interface. Would definitely work with him again.',
      date: '2024-03-10',
      metrics: {
        communication: 4,
        quality: 5,
        expertise: 4,
        deadlines: 4,
        collaboration: 5
      },
      helpful: 8,
      replies: 2
    }
  ]

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

      const { error } = await supabase
        .from('freelancer_reviews')
        .insert([
          {
            client_id: clientProfile.id,
            freelancer_id: reviewData.freelancerId,
            project_id: reviewData.projectId,
            rating: reviewData.rating,
            review: reviewData.review,
            metrics: reviewData.metrics
          }
        ])

      if (error) throw error

      // Refresh reviews list
      // You would typically fetch the updated reviews here
    } catch (error) {
      console.error('Error adding review:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Ratings & Reviews</h2>
        <div className="flex items-center space-x-4">
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

            {/* Project Name */}
            <div className="mt-4">
              <span className="text-sm font-medium text-gray-600">Project:</span>
              <span className="ml-2 text-sm text-gray-900">{review.project}</span>
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
            <p className="mt-4 text-gray-700">{review.review}</p>

            {/* Performance Metrics */}
            <div className="mt-6 grid grid-cols-5 gap-4">
              {Object.entries(review.metrics).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </div>
                  <div className="flex items-center justify-center">
                    <Star size={16} className="text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm text-gray-600">{value}.0</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <div className="flex items-center space-x-4">
                <button className="flex items-center text-gray-600 hover:text-gray-900">
                  <ThumbsUp size={16} className="mr-1" />
                  <span className="text-sm">Helpful ({review.helpful})</span>
                </button>
                <button className="flex items-center text-gray-600 hover:text-gray-900">
                  <MessageSquare size={16} className="mr-1" />
                  <span className="text-sm">Reply ({review.replies})</span>
                </button>
              </div>
              <button className="text-[#00704A] hover:text-[#005538] text-sm font-medium">
                View Full Review
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RatingsReviews