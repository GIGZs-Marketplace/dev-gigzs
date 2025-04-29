import React, { useEffect, useState } from 'react'
import { Users, Briefcase, DollarSign, Star, TrendingUp, Search, Filter, ChevronDown, Clock, CheckCircle, User } from 'lucide-react'
import { supabase } from '../../../lib/supabase'

function FreelancerDashboard() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>('');
  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [jobSuccessScore, setJobSuccessScore] = useState<number>(0);
  const [availableJobsCount, setAvailableJobsCount] = useState<number>(0);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [freelancerSkills, setFreelancerSkills] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'best_match' | 'date' | 'budget'>('best_match');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchProfileAndStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // Get freelancer profile
      const { data: freelancerProfile } = await supabase
        .from('freelancer_profiles')
        .select('id, avatar_url, full_name, skills')
        .eq('user_id', user.id)
        .single();
      if (!freelancerProfile) return;
      setAvatarUrl(freelancerProfile.avatar_url || null);
      setFullName(freelancerProfile.full_name || '');
      setFreelancerSkills(freelancerProfile.skills || []);

      // Get accepted job applications (active projects)
      const { data: applications } = await supabase
        .from('job_applications')
        .select(`
          *,
          job:jobs (
            id,
            title,
            client_id,
            budget_amount,
            duration,
            status,
            created_at,
            client:client_profiles (company_name)
          )
        `)
        .eq('freelancer_id', freelancerProfile.id)
        .eq('status', 'accepted');
      const projects = (applications || [])
        .filter(app => app.job)
        .map(app => ({
          title: app.job.title,
          client: app.job.client?.company_name || '',
          status: 'In Progress',
          deadline: 'TBD',
          budget: app.job.budget_amount ? `$${app.job.budget_amount}` : 'N/A',
          progress: 0
        }));
      setActiveProjects(projects);

      // Total Earnings (assuming a 'payments' table with 'amount' and 'freelancer_id')
      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('freelancer_id', freelancerProfile.id);
      setTotalEarnings((payments || []).reduce((sum, p) => sum + (p.amount || 0), 0));

      // Job Success Score (assuming a 'reviews_freelancer' table with 'completed' boolean)
      const { data: reviews } = await supabase
        .from('reviews_freelancer')
        .select('completed')
        .eq('freelancer_id', freelancerProfile.id);
      if (reviews && reviews.length > 0) {
        const completed = reviews.filter(r => r.completed).length;
        setJobSuccessScore(Math.round((completed / reviews.length) * 100));
      } else {
        setJobSuccessScore(0);
      }

      // Available Jobs (all jobs with status 'open')
      const { data: availableJobs } = await supabase
        .from('jobs')
        .select('id')
        .eq('status', 'open');
      setAvailableJobsCount((availableJobs || []).length);
    };
    fetchProfileAndStats();
  }, []);

  useEffect(() => {
    // Fetch recommended jobs for the freelancer (open jobs matching skills)
    const fetchRecommendedJobs = async () => {
      if (!freelancerSkills || freelancerSkills.length === 0) {
        setRecommendedJobs([]);
        return;
      }
      const { data: jobs } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          budget_amount,
          budget_type,
          duration,
          client:client_profiles (company_name),
          skills_required
        `)
        .eq('status', 'open');
      const recommended = (jobs || [])
        .filter(job =>
          job.skills_required && job.skills_required.some((skill: string) => freelancerSkills.includes(skill))
        )
        .slice(0, 3); // Show top 3
      setRecommendedJobs(recommended);
    };
    fetchRecommendedJobs();
  }, [freelancerSkills]);

  // Filter and sort recommended jobs
  const filteredAndSortedJobs = recommendedJobs
    .filter((job: any) => {
      // Search filter
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.client?.company_name || '').toLowerCase().includes(searchTerm.toLowerCase());
      // Status filter (if you want to filter by status, add a status field to jobs)
      const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a: any, b: any) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc'
          ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          : new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortBy === 'budget') {
        return sortOrder === 'desc'
          ? (b.budget_amount || 0) - (a.budget_amount || 0)
          : (a.budget_amount || 0) - (b.budget_amount || 0);
      } else {
        // Best match: sort by number of matching skills
        const aMatch = a.skills_required?.filter((skill: string) => freelancerSkills.includes(skill)).length || 0;
        const bMatch = b.skills_required?.filter((skill: string) => freelancerSkills.includes(skill)).length || 0;
        return sortOrder === 'desc' ? bMatch - aMatch : aMatch - bMatch;
      }
    });

  const stats = [
    {
      title: 'Active Projects',
      value: activeProjects.length.toString(),
      icon: Briefcase,
      trend: '',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Earnings',
      value: `$${totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      trend: '',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Job Success Score',
      value: `${jobSuccessScore}%`,
      icon: Star,
      trend: '',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      title: 'Available Jobs',
      value: availableJobsCount.toString(),
      icon: TrendingUp,
      trend: '',
      color: 'text-violet-600',
      bgColor: 'bg-violet-50'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Profile Picture Section */}
      <div className="flex items-center space-x-4 mb-4">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Profile" className="h-16 w-16 rounded-full border object-cover" />
        ) : (
          <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl text-gray-500">
            <User size={32} />
          </div>
        )}
        <div>
          <div className="text-xl font-semibold text-gray-800">{fullName || 'Freelancer'}</div>
          <div className="text-gray-500 text-sm">Welcome back!</div>
        </div>
      </div>
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                {stat.trend}
              </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
            <p className="text-2xl font-semibold mt-2 text-gray-800">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg w-72 focus:outline-none focus:border-[#00704A] focus:ring-1 focus:ring-[#00704A] transition-all duration-300"
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Status</option>
            {/* Add more status options if your jobs have a status field */}
          </select>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">Sort by:</span>
          <button
            className={`flex items-center px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 ${sortBy === 'best_match' ? 'bg-gray-100' : ''}`}
            onClick={() => setSortBy('best_match')}
          >
            <span className="text-gray-700">Best Match</span>
            <ChevronDown size={16} className="ml-2" />
          </button>
          <button
            className={`flex items-center px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 ${sortBy === 'date' ? 'bg-gray-100' : ''}`}
            onClick={() => setSortBy('date')}
          >
            <span className="text-gray-700">Date</span>
            <ChevronDown size={16} className="ml-2" />
          </button>
          <button
            className={`flex items-center px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 ${sortBy === 'budget' ? 'bg-gray-100' : ''}`}
            onClick={() => setSortBy('budget')}
          >
            <span className="text-gray-700">Budget</span>
            <ChevronDown size={16} className="ml-2" />
          </button>
          <button
            className="flex items-center px-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <span className="text-gray-700">{sortOrder === 'asc' ? 'Asc' : 'Desc'}</span>
          </button>
        </div>
      </div>

      {/* Active Projects */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Active Projects</h2>
        <div className="space-y-4">
          {activeProjects.length === 0 ? (
            <div className="text-gray-500">No active projects found.</div>
          ) : (
            activeProjects.map((project, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{project.title}</h3>
                    <p className="text-gray-600 mt-1">{project.client}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800`}>
                    {project.status}
                  </span>
                </div>
                <div className="mt-4 flex items-center space-x-6">
                  <div className="flex items-center">
                    <Clock className="text-gray-400 mr-2" size={16} />
                    <span className="text-sm text-gray-600">{project.deadline}</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="text-gray-400 mr-2" size={16} />
                    <span className="text-sm text-gray-600">{project.budget}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-medium">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#00704A] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Job Matches */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Recent Job Matches</h2>
        <div className="space-y-4">
          {filteredAndSortedJobs.length === 0 ? (
            <div className="text-gray-500">No recommended jobs found.</div>
          ) : (
            filteredAndSortedJobs.map((job: any, index: number) => (
              <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{job.title}</h3>
                    <p className="text-gray-600 mt-1">{job.client?.company_name}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {job.skills_required && job.skills_required.map((skill: string, skillIndex: number) => (
                    <span
                      key={skillIndex}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <DollarSign className="text-gray-400 mr-1" size={16} />
                      <span className="text-sm text-gray-600">{job.budget_amount ? `$${job.budget_amount}` : 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="text-gray-400 mr-1" size={16} />
                      <span className="text-sm text-gray-600">{job.duration}</span>
                    </div>
                  </div>
                  <button className="text-[#00704A] hover:text-[#005538] font-medium text-sm">
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default FreelancerDashboard