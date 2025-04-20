import React, { useState } from 'react'
import { 
  Play, 
  Pause, 
  Clock, 
  Calendar, 
  DollarSign,
  Building2,
  Search,
  Filter,
  ChevronDown,
  Plus,
  Edit2,
  Trash2
} from 'lucide-react'
import { useTimer } from 'react-timer-hook'

interface TimeEntry {
  id: string
  projectId: string
  projectName: string
  clientName: string
  startTime: string
  endTime: string
  duration: number // in minutes
  description: string
  hourlyRate: number
}

function TimeTracking() {
  const [searchTerm, setSearchTerm] = useState('')
  const [projectFilter, setProjectFilter] = useState('all')
  const [dateRange, setDateRange] = useState('week')
  const [showAddModal, setShowAddModal] = useState(false)
  const [isTracking, setIsTracking] = useState(false)
  const [selectedProject, setSelectedProject] = useState('')
  const [description, setDescription] = useState('')

  // Timer setup
  const time = new Date()
  time.setSeconds(time.getSeconds() + 0)
  const {
    seconds,
    minutes,
    hours,
    isRunning,
    start,
    pause,
    restart
  } = useTimer({ expiryTimestamp: time, autoStart: false })

  const startTimer = () => {
    if (selectedProject) {
      setIsTracking(true)
      const time = new Date()
      time.setSeconds(time.getSeconds() + 0)
      restart(time, true)
    }
  }

  const stopTimer = () => {
    setIsTracking(false)
    pause()
    // Here you would save the time entry
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const calculateEarnings = (duration: number, hourlyRate: number) => {
    return (duration / 60) * hourlyRate
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Time Tracking</h2>
          <p className="text-sm text-gray-600 mt-1">Track your working hours and earnings</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538]"
        >
          <Plus size={20} className="mr-2" />
          Log Time Manually
        </button>
      </div>

      {/* Timer Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
            >
              <option value="">Select a project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you working on?"
              className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
            />
          </div>
          <div className="ml-6 text-center">
            <div className="text-3xl font-mono mb-2">
              {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <button
              onClick={isTracking ? stopTimer : startTimer}
              disabled={!selectedProject}
              className={`px-6 py-2 rounded-lg flex items-center justify-center ${
                isTracking
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-[#00704A] hover:bg-[#005538]'
              } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isTracking ? (
                <>
                  <Pause size={20} className="mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Play size={20} className="mr-2" />
                  Start Timer
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search time entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
            
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
            >
              <option value="all">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>
      </div>

      {/* Time Entries */}
      <div className="space-y-4">
        {timeEntries.map((entry) => (
          <div
            key={entry.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">{entry.projectName}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Building2 size={16} className="mr-1" />
                    <span>{entry.clientName}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-1" />
                    <span>{new Date(entry.startTime).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-[#00704A] rounded-lg hover:bg-gray-50">
                  <Edit2 size={20} />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Clock className="text-gray-400" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="text-sm font-medium">{formatDuration(entry.duration)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="text-gray-400" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Earnings</p>
                  <p className="text-sm font-medium">
                    ${calculateEarnings(entry.duration, entry.hourlyRate).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">{entry.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Sample data
const projects = [
  { id: '1', name: 'E-commerce Website Development' },
  { id: '2', name: 'Mobile App Development' },
  { id: '3', name: 'Website Redesign Project' }
]

const timeEntries: TimeEntry[] = [
  {
    id: '1',
    projectId: '1',
    projectName: 'E-commerce Website Development',
    clientName: 'TechCorp Solutions',
    startTime: '2024-03-25T09:00:00',
    endTime: '2024-03-25T12:30:00',
    duration: 210,
    description: 'Working on checkout flow implementation',
    hourlyRate: 65
  },
  {
    id: '2',
    projectId: '2',
    projectName: 'Mobile App Development',
    clientName: 'InnovateLabs',
    startTime: '2024-03-24T14:00:00',
    endTime: '2024-03-24T18:00:00',
    duration: 240,
    description: 'UI implementation for user profile screens',
    hourlyRate: 75
  },
  {
    id: '3',
    projectId: '3',
    projectName: 'Website Redesign Project',
    clientName: 'Design Studio Pro',
    startTime: '2024-03-24T10:00:00',
    endTime: '2024-03-24T13:00:00',
    duration: 180,
    description: 'Homepage responsive design implementation',
    hourlyRate: 60
  }
]

export default TimeTracking