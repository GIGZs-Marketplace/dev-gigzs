import React, { useState } from 'react'
import { 
  Search, 
  Filter, 
  ChevronDown, 
  MessageSquare, 
  Star, 
  DollarSign, 
  Calendar,
  Clock,
  Building2,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Plus
} from 'lucide-react'

function MyClients() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [filterStatus, setFilterStatus] = useState('all')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">My Clients</h2>
          <p className="text-sm text-gray-600 mt-1">Manage your client relationships and projects</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
            >
              <option value="all">All Clients</option>
              <option value="active">Active</option>
              <option value="past">Past Clients</option>
              <option value="potential">Potential Clients</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
            >
              <option value="recent">Most Recent</option>
              <option value="earnings">Highest Earnings</option>
              <option value="projects">Most Projects</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients List */}
      <div className="space-y-6">
        {clients.map((client) => (
          <div
            key={client.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
          >
            {/* Client Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={client.avatar}
                  alt={client.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{client.name}</h3>
                  <div className="flex items-center mt-1">
                    <Building2 size={16} className="text-gray-400 mr-1" />
                    <span className="text-sm text-gray-600">{client.company}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-[#00704A] rounded-lg hover:bg-gray-50">
                  <MessageSquare size={20} />
                </button>
                <button className="p-2 text-gray-400 hover:text-[#00704A] rounded-lg hover:bg-gray-50">
                  <ExternalLink size={20} />
                </button>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Mail className="text-gray-400" size={16} />
                <span className="text-sm text-gray-600">{client.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="text-gray-400" size={16} />
                <span className="text-sm text-gray-600">{client.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="text-gray-400" size={16} />
                <span className="text-sm text-gray-600">{client.location}</span>
              </div>
            </div>

            {/* Projects and Stats */}
            <div className="mt-6 grid grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Briefcase className="text-gray-400" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Total Projects</p>
                  <p className="text-sm font-medium">{client.totalProjects}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="text-gray-400" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Total Earnings</p>
                  <p className="text-sm font-medium">${client.totalEarnings.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="text-gray-400" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Last Project</p>
                  <p className="text-sm font-medium">{client.lastProject}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="text-yellow-400" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Client Rating</p>
                  <p className="text-sm font-medium">{client.rating}/5</p>
                </div>
              </div>
            </div>

            {/* Recent Projects */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Recent Projects</h4>
              <div className="space-y-3">
                {client.recentProjects.map((project, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div>
                      <h5 className="font-medium text-gray-900">{project.name}</h5>
                      <p className="text-sm text-gray-600">{project.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${project.value.toLocaleString()}</p>
                      <span className={`text-sm ${
                        project.status === 'Completed' ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
              <button className="flex items-center text-[#00704A] hover:text-[#005538]">
                <Plus size={18} className="mr-1" />
                Request New Work
              </button>
              <button className="px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538]">
                View Full History
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const clients = [
  {
    id: 1,
    name: 'Sarah Johnson',
    company: 'TechCorp Solutions',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    email: 'sarah.j@techcorp.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    totalProjects: 8,
    totalEarnings: 45000,
    lastProject: '2 weeks ago',
    rating: 4.9,
    recentProjects: [
      {
        name: 'E-commerce Platform Development',
        date: 'Mar 15, 2024',
        value: 12000,
        status: 'Completed'
      },
      {
        name: 'Mobile App Integration',
        date: 'Mar 1, 2024',
        value: 8000,
        status: 'In Progress'
      }
    ]
  },
  {
    id: 2,
    name: 'Michael Chen',
    company: 'InnovateLabs',
    avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    email: 'm.chen@innovatelabs.com',
    phone: '+1 (555) 234-5678',
    location: 'New York, NY',
    totalProjects: 5,
    totalEarnings: 35000,
    lastProject: '1 month ago',
    rating: 4.8,
    recentProjects: [
      {
        name: 'AI Integration Project',
        date: 'Feb 28, 2024',
        value: 15000,
        status: 'Completed'
      },
      {
        name: 'Data Analytics Dashboard',
        date: 'Feb 15, 2024',
        value: 10000,
        status: 'Completed'
      }
    ]
  }
]

export default MyClients