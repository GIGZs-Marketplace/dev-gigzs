import React, { useEffect, useState } from 'react'
import { Users, Briefcase, DollarSign, Star, TrendingUp, Search, Filter, ChevronDown, Clock, CheckCircle, User } from 'lucide-react'
import { supabase } from '../../../lib/supabase'

function FreelancerDashboard() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>('');

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('freelancer_profiles')
        .select('avatar_url, full_name')
        .eq('user_id', user.id)
        .single();
      if (data) {
        setAvatarUrl(data.avatar_url || null);
        setFullName(data.full_name || '');
      }
    };
    fetchProfile();
  }, []);

  const stats = [
    { 
      title: 'Active Projects', 
      value: '3', 
      icon: Briefcase, 
      trend: '+2 this month',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50' 
    },
    { 
      title: 'Total Earnings', 
      value: '$12,450', 
      icon: DollarSign, 
      trend: '+15.3%',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    { 
      title: 'Job Success Score', 
      value: '98%', 
      icon: Star, 
      trend: '+2.4%',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    { 
      title: 'Available Jobs', 
      value: '156', 
      icon: TrendingUp, 
      trend: '+12 new',
      color: 'text-violet-600',
      bgColor: 'bg-violet-50'
    }
  ]

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
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg w-72 focus:outline-none focus:border-[#00704A] focus:ring-1 focus:ring-[#00704A] transition-all duration-300"
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          </div>
          
          <button className="flex items-center px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-300">
            <Filter size={20} className="text-gray-500" />
            <span className="ml-2 text-gray-700">Filters</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">Sort by:</span>
          <button className="flex items-center px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-300">
            <span className="text-gray-700">Best Match</span>
            <ChevronDown size={16} className="ml-2" />
          </button>
        </div>
      </div>

      {/* Active Projects */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Active Projects</h2>
        <div className="space-y-4">
          {activeProjects.map((project, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{project.title}</h3>
                  <p className="text-gray-600 mt-1">{project.client}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  project.status === 'Review' ? 'bg-amber-100 text-amber-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
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
          ))}
        </div>
      </div>

      {/* Recent Job Matches */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Recent Job Matches</h2>
        <div className="space-y-4">
          {jobMatches.map((job, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{job.title}</h3>
                  <p className="text-gray-600 mt-1">{job.company}</p>
                </div>
                <span className="text-sm font-medium text-[#00704A]">{job.matchPercentage}% Match</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {job.skills.map((skill, skillIndex) => (
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
                    <span className="text-sm text-gray-600">{job.budget}</span>
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
          ))}
        </div>
      </div>
    </div>
  )
}

const activeProjects = [
  {
    title: 'E-commerce Platform Development',
    client: 'TechCorp Solutions',
    status: 'In Progress',
    deadline: 'Due in 2 weeks',
    budget: '$8,000',
    progress: 65
  },
  {
    title: 'Mobile App UI Design',
    client: 'InnovateLabs',
    status: 'Review',
    deadline: 'Due in 5 days',
    budget: '$3,500',
    progress: 90
  },
  {
    title: 'Website Optimization',
    client: 'GrowthMedia',
    status: 'Completed',
    deadline: 'Delivered',
    budget: '$2,000',
    progress: 100
  }
]

const jobMatches = [
  {
    title: 'Senior Full Stack Developer',
    company: 'TechStart Inc.',
    matchPercentage: 95,
    skills: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
    budget: '$70-90/hr',
    duration: '6+ months'
  },
  {
    title: 'Frontend Developer',
    company: 'DesignPro Agency',
    matchPercentage: 88,
    skills: ['React', 'TypeScript', 'Tailwind CSS'],
    budget: '$50-65/hr',
    duration: '3 months'
  },
  {
    title: 'Backend Developer',
    company: 'DataFlow Systems',
    matchPercentage: 85,
    skills: ['Node.js', 'Express', 'MongoDB'],
    budget: '$60-80/hr',
    duration: '4 months'
  }
]

export default FreelancerDashboard