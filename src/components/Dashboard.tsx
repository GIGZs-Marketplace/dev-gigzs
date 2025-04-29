import React, { useState } from 'react'
import { Users, Briefcase, DollarSign, Star, TrendingUp } from 'lucide-react'

function Dashboard() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="space-y-6">
      {/* Profile Dropdown */}
      <div className="relative flex justify-end">
        <button
          onClick={toggleDropdown}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none"
        >
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt="Profile"
            className="w-8 h-8 rounded-full"
          />
          <span>Profile</span>
        </button>
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
            <button onClick={() => alert('Profile clicked')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</button>
            <button onClick={() => alert('Settings clicked')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</button>
            <button onClick={() => alert('Logout clicked')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Projects"
          value="12"
          icon={<Briefcase className="text-blue-600" size={24} />}
          trend="+2.5%"
        />
        <StatCard
          title="Total Earnings"
          value="$24,500"
          icon={<DollarSign className="text-green-600" size={24} />}
          trend="+12.3%"
        />
        <StatCard
          title="Client Rating"
          value="4.8"
          icon={<Star className="text-yellow-600" size={24} />}
          trend="+0.2"
        />
        <StatCard
          title="Available Jobs"
          value="156"
          icon={<TrendingUp className="text-purple-600" size={24} />}
          trend="+5.6%"
        />
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Project</th>
                <th className="text-left py-3 px-4">Client</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Due Date</th>
                <th className="text-left py-3 px-4">Budget</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{project.name}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <img src={project.clientImage} alt={project.client} className="w-8 h-8 rounded-full mr-2" />
                      {project.client}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{project.dueDate}</td>
                  <td className="py-3 px-4">{project.budget}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Freelancers */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Top Freelancers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {freelancers.map((freelancer, index) => (
            <div key={index} className="flex items-center p-4 border rounded-lg hover:shadow-md transition-shadow">
              <img src={freelancer.image} alt={freelancer.name} className="w-12 h-12 rounded-full" />
              <div className="ml-4">
                <h3 className="font-semibold">{freelancer.name}</h3>
                <p className="text-sm text-gray-600">{freelancer.role}</p>
                <div className="flex items-center mt-1">
                  <Star className="text-yellow-400" size={16} />
                  <span className="ml-1 text-sm">{freelancer.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, trend }: { title: string; value: string; icon: React.ReactNode; trend: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-gray-100 rounded-lg">{icon}</div>
        <span className="text-sm text-green-600">{trend}</span>
      </div>
      <h3 className="text-gray-600 text-sm">{title}</h3>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  )
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'in progress':
      return 'bg-blue-100 text-blue-800'
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const projects = [
  {
    name: 'E-commerce Website Redesign',
    client: 'Sarah Johnson',
    clientImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'In Progress',
    dueDate: 'Mar 15, 2024',
    budget: '$4,500'
  },
  {
    name: 'Mobile App Development',
    client: 'Michael Chen',
    clientImage: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'Pending',
    dueDate: 'Mar 20, 2024',
    budget: '$8,000'
  },
  {
    name: 'Brand Identity Design',
    client: 'Emma Wilson',
    clientImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'Completed',
    dueDate: 'Mar 10, 2024',
    budget: '$2,500'
  }
]

const freelancers = [
  {
    name: 'Alex Thompson',
    role: 'Full Stack Developer',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    name: 'Jessica Lee',
    role: 'UI/UX Designer',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    name: 'David Martinez',
    role: 'Mobile Developer',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }
]

export default Dashboard