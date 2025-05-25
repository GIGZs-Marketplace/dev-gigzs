import React, { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';

interface FreelancerOption {
  id: string;
  name: string;
}
interface ProjectOption {
  id: string;
  title: string;
}
interface FormData {
  freelancerId: string;
  projectId: string;
  rating: number;
  review: string;
  wouldRehire: boolean;
}

interface AddReviewModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void> | void;
  freelancers: FreelancerOption[];
  projects: ProjectOption[];
}

const initialState: FormData = {
  freelancerId: '',
  projectId: '',
  rating: 0,
  review: '',
  wouldRehire: true,
};

const AddReviewModal: React.FC<AddReviewModalProps> = ({ open, onClose, onSubmit, freelancers, projects }) => {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm(initialState);
      setError('');
      setLoading(false);
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, type } = e.target;
    const value = type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : type === 'number'
      ? Number(e.target.value)
      : e.target.value;

    setForm(prev => ({
      ...prev,
      [name]: name === 'wouldRehire' ? Boolean(value) : value,
    }));
  };

  const handleRating = (rating: number) => {
    setForm(f => ({ ...f, rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    if (!form.freelancerId) {
      setError('Please select a freelancer');
      return;
    }
    if (!form.projectId) {
      setError('Please select a project');
      return;
    }
    if (!form.rating || form.rating < 1 || form.rating > 5) {
      setError('Please provide a valid rating between 1 and 5');
      return;
    }
    if (!form.review.trim()) {
      setError('Please write your review');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...form,
        rating: Number(form.rating),
        wouldRehire: Boolean(form.wouldRehire)
      });
      setForm(initialState);
      onClose();
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8 relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          disabled={loading}
          aria-label="Close"
        >
          <X size={24} />
        </button>
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Add a Review</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Freelancer</label>
            <select
              name="freelancerId"
              value={form.freelancerId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
              required
            >
              <option value="">Select a freelancer</option>
              {freelancers.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select
              name="projectId"
              value={form.projectId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
              required
            >
              <option value="">Select a project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleRating(i)}
                  className="focus:outline-none"
                  aria-label={`Rate ${i} star${i > 1 ? 's' : ''}`}
                >
                  <Star size={26} className={i <= form.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} />
                </button>
              ))}
              <span className="ml-2 text-sm font-medium text-gray-900">{form.rating}.0</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
            <textarea
              name="review"
              value={form.review}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A] resize-none"
              placeholder="Write your feedback..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Would you rehire?</label>
            <div className="flex items-center space-x-6 mt-2">
              <label className="inline-flex items-center space-x-2">
                <input
                  type="radio"
                  name="wouldRehire"
                  value="true"
                  checked={form.wouldRehire === true || form.wouldRehire === 'true'}
                  onChange={() => setForm(f => ({ ...f, wouldRehire: true }))}
                  className="form-radio text-[#00704A]"
                />
                <span>Yes</span>
              </label>
              <label className="inline-flex items-center space-x-2">
                <input
                  type="radio"
                  name="wouldRehire"
                  value="false"
                  checked={form.wouldRehire === false || form.wouldRehire === 'false'}
                  onChange={() => setForm(f => ({ ...f, wouldRehire: false }))}
                  className="form-radio text-[#00704A]"
                />
                <span>No</span>
              </label>
            </div>
          </div>
          <>
            {error && <div className="text-red-500 text-sm font-semibold text-center">{error}</div>}
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538] font-semibold disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </>
        </form>
      </div>
    </div>
  );
};

export default AddReviewModal;
