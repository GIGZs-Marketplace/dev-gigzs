import React, { useState } from 'react'
import {
  Calendar,
  Download,
  Filter,
  DollarSign,
  Clock,
  Users,
  Star,
  ChevronDown,
  FileText
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

function Reports() {
  const [dateRange, setDateRange] = useState('month')
  const [projectType, setProjectType] = useState('all')

  // Earnings Trend Chart Data
  const earningsTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Earnings',
        data: [4500, 5200, 4800, 6100, 5800, 7200],
        borderColor: '#00704A',
        backgroundColor: 'rgba(0, 112, 74, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  }

  // Project Distribution Chart Data
  const projectDistributionData = {
    labels: ['Web Development', 'Mobile Apps', 'UI/UX Design', 'Backend Development'],
    datasets: [
      {
        data: [40, 25, 20, 15],
        backgroundColor: [
          'rgba(0, 112, 74, 0.8)',
          'rgba(0, 112, 74, 0.6)',
          'rgba(0, 112, 74, 0.4)',
          'rgba(0, 112, 74, 0.2)'
        ],
        borderColor: 'white',
        borderWidth: 2
      }
    ]
  }

  // Hours Worked Chart Data
  const hoursWorkedData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Hours',
        data: [8, 6, 7, 8, 5, 3, 0],
        backgroundColor: 'rgba(0, 112, 74, 0.8)'
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Reports & Analytics</h2>
          <p className="text-sm text-gray-600 mt-1">View detailed insights about your work and earnings</p>
        </div>
        <div className="flex space-x-4">
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <FileText size={20} className="mr-2" />
            Generate Report
          </button>
          <button className="flex items-center px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538]">
            <Download size={20} className="mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>

            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
            >
              <option value="all">All Projects</option>
              <option value="web">Web Development</option>
              <option value="mobile">Mobile Development</option>
              <option value="design">UI/UX Design</option>
            </select>

            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Calendar size={20} className="text-gray-500 mr-2" />
              Custom Range
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
              +15.3%
            </span>
          </div>
          <h3 className="text-2xl font-semibold mt-4">$24,500</h3>
          <p className="text-gray-600 text-sm">Total Earnings</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              +8.4%
            </span>
          </div>
          <h3 className="text-2xl font-semibold mt-4">164</h3>
          <p className="text-gray-600 text-sm">Hours Worked</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
              +12.5%
            </span>
          </div>
          <h3 className="text-2xl font-semibold mt-4">8</h3>
          <p className="text-gray-600 text-sm">Active Clients</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded-full">
              98%
            </span>
          </div>
          <h3 className="text-2xl font-semibold mt-4">4.9</h3>
          <p className="text-gray-600 text-sm">Average Rating</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Trend */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-800">Earnings Trend</h3>
            <button className="text-gray-500 hover:text-gray-700">
              <ChevronDown size={20} />
            </button>
          </div>
          <div className="h-80">
            <Line data={earningsTrendData} options={chartOptions} />
          </div>
        </div>

        {/* Project Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-800">Project Distribution</h3>
            <button className="text-gray-500 hover:text-gray-700">
              <ChevronDown size={20} />
            </button>
          </div>
          <div className="h-80 flex items-center justify-center">
            <Doughnut
              data={projectDistributionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%'
              }}
            />
          </div>
        </div>

        {/* Hours Worked */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-800">Hours Worked</h3>
            <button className="text-gray-500 hover:text-gray-700">
              <ChevronDown size={20} />
            </button>
          </div>
          <div className="h-80">
            <Bar data={hoursWorkedData} options={chartOptions} />
          </div>
        </div>

        {/* Top Clients */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-800">Top Clients</h3>
            <button className="text-gray-500 hover:text-gray-700">
              <ChevronDown size={20} />
            </button>
          </div>
          <div className="space-y-4">
            {topClients.map((client) => (
              <div key={client.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <img
                    src={client.avatar}
                    alt={client.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{client.name}</h4>
                    <p className="text-sm text-gray-500">{client.company}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${client.totalEarnings}</p>
                  <p className="text-sm text-gray-500">{client.projectsCount} projects</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const topClients = [
  {
    id: 1,
    name: 'Sarah Johnson',
    company: 'TechCorp Solutions',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    totalEarnings: 12500,
    projectsCount: 3
  },
  {
    id: 2,
    name: 'Michael Chen',
    company: 'InnovateLabs',
    avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    totalEarnings: 8200,
    projectsCount: 2
  },
  {
    id: 3,
    name: 'Emma Wilson',
    company: 'Design Studio Pro',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    totalEarnings: 6800,
    projectsCount: 2
  }
]

export default Reports