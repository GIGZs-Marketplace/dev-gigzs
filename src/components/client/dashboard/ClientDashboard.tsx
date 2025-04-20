import React, { useState } from 'react'
import { 
  PlusCircle, 
  Users, 
  FileText, 
  DollarSign, 
  Star, 
  Clock, 
  Search,
  Filter,
  ChevronDown,
  BarChart,
  FileSignature,
  UserPlus
} from 'lucide-react'
import PostJob from './PostJob'
import ProjectList from './ProjectList'
import FreelancerList from './FreelancerList'
import TeamManagement from './TeamManagement'
import ContractManagement from './ContractManagement'
import RatingsReviews from './RatingsReviews'
import ContractSigning from './ContractSigning'
import TeamCollaboration from './TeamCollaboration'

type TabType = 'projects' | 'freelancers' | 'team' | 'contracts' | 'reviews' | 'signing' | 'collaboration'

function ClientDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('projects')
  const [showPostJob, setShowPostJob] = useState(false)

  const stats = [
    { 
      title: 'Active Projects', 
      value: '12', 
      icon: FileText, 
      trend: '+2.5%',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50' 
    },
    { 
      title: 'Hired Freelancers', 
      value: '8', 
      icon: Users, 
      trend: '+1.2%',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    { 
      title: 'Total Spent', 
      value: '$24,500', 
      icon: DollarSign, 
      trend: '+12.3%',
      color: 'text-violet-600',
      bgColor: 'bg-violet-50'
    },
    { 
      title: 'Project Success Rate', 
      value: '94%', 
      icon: BarChart, 
      trend: '+3.2%',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    }
  ]

  return (
    <div className="space-y-8">
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

      {/* Main Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowPostJob(true)}
            className="flex items-center px-5 py-2.5 bg-[#00704A] text-white rounded-lg hover:bg-[#005538] transition-all duration-300 shadow-sm hover:shadow"
          >
            <PlusCircle className="mr-2" size={20} />
            Post a Job
          </button>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects, freelancers..."
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
            <span className="text-gray-700">Most Recent</span>
            <ChevronDown size={16} className="ml-2" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <nav className="flex px-6">
          {[
            { id: 'projects', label: 'Projects', icon: FileText },
            { id: 'freelancers', label: 'Freelancers', icon: Users },
            { id: 'team', label: 'Team', icon: Users },
            { id: 'collaboration', label: 'Team Collaboration', icon: UserPlus },
            { id: 'contracts', label: 'Contracts', icon: FileText },
            { id: 'signing', label: 'Contract Signing', icon: FileSignature },
            { id: 'reviews', label: 'Reviews', icon: Star }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center px-4 py-5 border-b-2 font-medium text-sm transition-all duration-300 ${
                activeTab === tab.id
                  ? 'border-[#00704A] text-[#00704A]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="mr-2" size={20} />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'projects' && <ProjectList />}
          {activeTab === 'freelancers' && <FreelancerList />}
          {activeTab === 'team' && <TeamManagement />}
          {activeTab === 'collaboration' && <TeamCollaboration />}
          {activeTab === 'contracts' && <ContractManagement />}
          {activeTab === 'signing' && <ContractSigning />}
          {activeTab === 'reviews' && <RatingsReviews />}
        </div>
      </div>

      {/* Post Job Modal */}
      {showPostJob && (
        <PostJob onClose={() => setShowPostJob(false)} />
      )}
    </div>
  )
}

export default ClientDashboard