import React, { useState } from 'react'
import { Star, MessageSquare, ExternalLink, MapPin, Briefcase, Filter, Search, ChevronDown, Building2, Users, Globe, CheckCircle } from 'lucide-react'

function FreelancerList() {
  const [view, setView] = useState<'freelancers' | 'agencies'>('freelancers')
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    skills: [] as string[],
    availability: 'all',
    experience: 'all',
    hourlyRate: 'all'
  })

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <button
            onClick={() => setView('freelancers')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'freelancers'
                ? 'bg-[#00704A] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users className="inline-block mr-2" size={20} />
            Freelancers
          </button>
          <button
            onClick={() => setView('agencies')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'agencies'
                ? 'bg-[#00704A] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Building2 className="inline-block mr-2" size={20} />
            Agencies
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder={`Search ${view}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:border-[#00704A]"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter size={20} className="text-gray-500 mr-2" />
            Filters
          </button>

          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]">
            <option>Sort by: Best Match</option>
            <option>Rating: High to Low</option>
            <option>Hourly Rate: Low to High</option>
            <option>Experience Level</option>
          </select>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
              value={filters.skills}
              onChange={(e) => setFilters({ ...filters, skills: [e.target.value] })}
            >
              <option value="all">All Skills</option>
              <option>React</option>
              <option>Node.js</option>
              <option>Python</option>
              <option>UI/UX Design</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
              value={filters.availability}
              onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
            >
              <option value="all">All</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="hourly">Hourly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
              value={filters.experience}
              onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
            >
              <option value="all">All Levels</option>
              <option value="entry">Entry Level</option>
              <option value="intermediate">Intermediate</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
              value={filters.hourlyRate}
              onChange={(e) => setFilters({ ...filters, hourlyRate: e.target.value })}
            >
              <option value="all">Any Rate</option>
              <option value="0-25">$0 - $25</option>
              <option value="25-50">$25 - $50</option>
              <option value="50-100">$50 - $100</option>
              <option value="100+">$100+</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {view === 'freelancers' ? (
          // Freelancer Cards
          freelancers.map((freelancer) => (
            <div 
              key={freelancer.id} 
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-300 group"
            >
              <div className="flex items-start space-x-4">
                <img
                  src={freelancer.image}
                  alt={freelancer.name}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-gray-900 truncate group-hover:text-[#00704A] transition-colors">
                    {freelancer.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{freelancer.title}</p>
                  <div className="flex items-center mt-1 space-x-3">
                    <div className="flex items-center">
                      <Star className="text-amber-400" size={16} />
                      <span className="ml-1 text-sm font-medium text-gray-900">{freelancer.rating}</span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm font-medium text-gray-900">{freelancer.hourlyRate}/hr</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center text-sm text-gray-500 space-x-2">
                <MapPin size={16} />
                <span>{freelancer.location}</span>
              </div>

              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {freelancer.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 bg-gray-50 text-gray-700 rounded-full text-xs border border-gray-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-500">
                  <Briefcase size={16} className="mr-1" />
                  <span>{freelancer.completedProjects} projects completed</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  freelancer.availability === 'Available'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {freelancer.availability}
                </span>
              </div>

              <div className="mt-5 flex space-x-2">
                <button className="flex-1 px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538] transition-colors flex items-center justify-center shadow-sm hover:shadow">
                  <MessageSquare size={18} className="mr-2" />
                  Contact
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-300">
                  <ExternalLink size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          // Agency Cards
          agencies.map((agency) => (
            <div 
              key={agency.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-300 group"
            >
              <div className="flex items-start space-x-4">
                <img
                  src={agency.logo}
                  alt={agency.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-gray-900 truncate group-hover:text-[#00704A] transition-colors">
                    {agency.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{agency.specialization}</p>
                  <div className="flex items-center mt-1 space-x-3">
                    <div className="flex items-center">
                      <Star className="text-amber-400" size={16} />
                      <span className="ml-1 text-sm font-medium text-gray-900">{agency.rating}</span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center">
                      <CheckCircle size={16} className="text-emerald-500 mr-1" />
                      <span className="text-sm font-medium">Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Globe size={16} className="mr-1" />
                  <span>{agency.location}</span>
                </div>
                <div className="flex items-center">
                  <Users size={16} className="mr-1" />
                  <span>{agency.teamSize} team members</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {agency.expertise.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 bg-gray-50 text-gray-700 rounded-full text-xs border border-gray-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">{agency.projectsCompleted}</p>
                  <p className="text-gray-500">Projects</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">{agency.clientSatisfaction}%</p>
                  <p className="text-gray-500">Satisfaction</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">{agency.responseTime}</p>
                  <p className="text-gray-500">Resp. Time</p>
                </div>
              </div>

              <div className="mt-5 flex space-x-2">
                <button className="flex-1 px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538] transition-colors flex items-center justify-center shadow-sm hover:shadow">
                  <MessageSquare size={18} className="mr-2" />
                  Contact Agency
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-300">
                  <ExternalLink size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const freelancers = [
  {
    id: 1,
    name: 'Sarah Johnson',
    title: 'Senior Full Stack Developer',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    rating: 4.9,
    hourlyRate: '$65',
    location: 'San Francisco, CA',
    skills: ['React', 'Node.js', 'Python', 'AWS'],
    completedProjects: 45,
    availability: 'Full-time'
  },
  {
    id: 2,
    name: 'Michael Chen',
    title: 'UI/UX Designer',
    image: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    rating: 4.8,
    hourlyRate: '$55',
    location: 'New York, NY',
    skills: ['Figma', 'Adobe XD', 'Sketch', 'UI Design'],
    completedProjects: 38,
    availability: 'Part-time'
  },
  {
    id: 3,
    name: 'Emma Wilson',
    title: 'Mobile Developer',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    rating: 4.7,
    hourlyRate: '$60',
    location: 'London, UK',
    skills: ['React Native', 'iOS', 'Android', 'Flutter'],
    completedProjects: 32,
    availability: 'Available'
  }
]

const agencies = [
  {
    id: 1,
    name: 'TechPro Solutions',
    specialization: 'Full-Stack Development Agency',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    rating: 4.9,
    location: 'San Francisco, USA',
    teamSize: '25-50',
    expertise: ['Web Development', 'Mobile Apps', 'Cloud Solutions', 'UI/UX Design'],
    projectsCompleted: 150,
    clientSatisfaction: 98,
    responseTime: '< 2hrs'
  },
  {
    id: 2,
    name: 'DesignCraft Studio',
    specialization: 'Creative Design Agency',
    logo: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    rating: 4.8,
    location: 'London, UK',
    teamSize: '10-25',
    expertise: ['Brand Design', 'UI/UX', 'Motion Graphics', 'Web Design'],
    projectsCompleted: 200,
    clientSatisfaction: 96,
    responseTime: '< 1hr'
  },
  {
    id: 3,
    name: 'InnovateHub',
    specialization: 'Digital Innovation Agency',
    logo: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    rating: 4.7,
    location: 'Berlin, Germany',
    teamSize: '50-100',
    expertise: ['Digital Strategy', 'Software Development', 'AI/ML', 'IoT'],
    projectsCompleted: 300,
    clientSatisfaction: 95,
    responseTime: '< 3hrs'
  }
]

export default FreelancerList