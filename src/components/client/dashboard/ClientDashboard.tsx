import React, { useState, useEffect } from 'react'
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
  UserPlus,
  RefreshCw
} from 'lucide-react'
import PostJob from './PostJob'
import ProjectList from './ProjectList'
import FreelancerList from './FreelancerList'
import ContractManagement from './ContractManagement'
import RatingsReviews from './RatingsReviews'
import ContractSigning from './ContractSigning'

import ProposalList from './ProposalList'
import { fetchClientProjects } from '../../../lib/projectApi'

type TabType = 'projects' | 'contracts' | 'reviews' | 'signing' | 'proposals'

function ClientDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('projects')
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [showPostJob, setShowPostJob] = useState(false)
  const [loadingStats, setLoadingStats] = useState(true)
  const [stats, setStats] = useState([
    { title: 'Active Projects', value: '-', icon: FileText, trend: '', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { title: 'Hired Freelancers', value: '-', icon: Users, trend: '', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { title: 'Total Spent', value: '-', icon: DollarSign, trend: '', color: 'text-violet-600', bgColor: 'bg-violet-50' },
    { title: 'Project Success Rate', value: '-', icon: BarChart, trend: '', color: 'text-amber-600', bgColor: 'bg-amber-50' }
  ])

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true)
      try {
        const projects = await fetchClientProjects()
        // Active Projects: status 'open' or 'in_progress'
        const activeProjects = projects.filter((p: any) => ['open', 'in_progress'].includes(p.status)).length
        // Hired Freelancers: unique freelancer_id (not null)
        const hiredFreelancers = new Set(projects.map((p: any) => p.freelancer_id).filter(Boolean)).size
        // Total Spent: sum of budget_amount for completed projects
        const totalSpent = projects
          .filter((p: any) => p.status === 'completed')
          .reduce((sum: number, p: any) => sum + (p.budget_amount || 0), 0)
        // Project Success Rate: completed / total
        const completed = projects.filter((p: any) => p.status === 'completed').length
        const successRate = projects.length > 0 ? Math.round((completed / projects.length) * 100) : 0
        setStats([
          { title: 'Active Projects', value: String(activeProjects), icon: FileText, trend: '', color: 'text-blue-600', bgColor: 'bg-blue-50' },
          { title: 'Hired Freelancers', value: String(hiredFreelancers), icon: Users, trend: '', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
          { title: 'Total Spent', value: `$${totalSpent.toLocaleString()}`, icon: DollarSign, trend: '', color: 'text-violet-600', bgColor: 'bg-violet-50' },
          { title: 'Project Success Rate', value: `${successRate}%`, icon: BarChart, trend: '', color: 'text-amber-600', bgColor: 'bg-amber-50' }
        ])
      } catch (e) {
        setStats([
          { title: 'Active Projects', value: '-', icon: FileText, trend: '', color: 'text-blue-600', bgColor: 'bg-blue-50' },
          { title: 'Hired Freelancers', value: '-', icon: Users, trend: '', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
          { title: 'Total Spent', value: '-', icon: DollarSign, trend: '', color: 'text-violet-600', bgColor: 'bg-violet-50' },
          { title: 'Project Success Rate', value: '-', icon: BarChart, trend: '', color: 'text-amber-600', bgColor: 'bg-amber-50' }
        ])
      } finally {
        setLoadingStats(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Client Dashboard</h2>
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-600 hover:text-[#00704A] rounded-lg hover:bg-gray-50"
              >
                <RefreshCw size={20} />
              </button>
              <button
                onClick={() => setShowPostJob(true)}
                className="flex items-center px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538] transition-colors w-full sm:w-auto justify-center"
              >
                <PlusCircle size={20} className="mr-2" />
                Post New Job
              </button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={stat.color} size={24} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <nav className="flex overflow-x-auto no-scrollbar">
              {[
                { id: 'projects', label: 'Projects', icon: FileText },
                { id: 'contracts', label: 'Contracts', icon: FileText },
                { id: 'signing', label: 'Contract Signing', icon: FileSignature },
                { id: 'reviews', label: 'Reviews', icon: Star },
                { id: 'proposals', label: 'Proposals', icon: DollarSign },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center px-4 py-5 border-b-2 font-medium text-sm transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="mr-2" size={20} />
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Tab Content */}
            <div className="p-4 sm:p-6">
              {activeTab === 'projects' && <ProjectList key={`projects-${refreshTrigger}`} />}
              {activeTab === 'contracts' && <ContractManagement key={`contracts-${refreshTrigger}`} />}
              {activeTab === 'signing' && <ContractSigning key={`signing-${refreshTrigger}`} />}
              {activeTab === 'reviews' && <RatingsReviews key={`reviews-${refreshTrigger}`} />}
              {activeTab === 'proposals' && <ProposalList key={`proposals-${refreshTrigger}`} />}
            </div>
          </div>
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