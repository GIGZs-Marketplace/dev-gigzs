import React from 'react'
import { UserPlus, Mail, Phone, MapPin, Link2, MoreVertical, Star } from 'lucide-react'

function TeamManagement() {
  const teamMembers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Project Manager',
      email: 'sarah.j@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      status: 'Active',
      projects: 8
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Lead Developer',
      email: 'michael.c@example.com',
      phone: '+1 (555) 234-5678',
      location: 'New York, NY',
      avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      status: 'Active',
      projects: 5
    },
    {
      id: 3,
      name: 'Emma Wilson',
      role: 'UI/UX Designer',
      email: 'emma.w@example.com',
      phone: '+1 (555) 345-6789',
      location: 'London, UK',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      status: 'On Leave',
      projects: 6
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header with Add Team Member Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Team Members</h2>
        <button className="flex items-center px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538] transition-colors">
          <UserPlus size={20} className="mr-2" />
          Add Team Member
        </button>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 gap-6">
        {teamMembers.map((member) => (
          <div 
            key={member.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.role}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                    member.status === 'Active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {member.status}
                  </span>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical size={20} />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail size={16} />
                <span>{member.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone size={16} />
                <span>{member.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin size={16} />
                <span>{member.location}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Link2 size={16} />
                <span>{member.projects} Active Projects</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Star className="text-yellow-400" size={16} />
                <span className="text-sm font-medium text-gray-600">Performance Rating: 4.8/5</span>
              </div>
              <button className="text-[#00704A] hover:text-[#005538] text-sm font-medium">
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TeamManagement