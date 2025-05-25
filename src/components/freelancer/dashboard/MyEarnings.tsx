import React, { useState } from 'react'
import { DollarSign, ArrowUpRight, ArrowDownRight, Calendar, CreditCard, Ban as Bank, Plus, Download, Filter, ChevronDown, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

function MyEarnings() {
  const [timeFilter, setTimeFilter] = useState('monthly')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all')

  // Chart data
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Earnings',
        data: [4500, 5200, 4800, 6100, 5800, 7200],
        borderColor: 'var(--primary-color)',
        backgroundColor: 'var(--primary-color)10',
        tension: 0.4,
        fill: true
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
          <h2 className="text-xl font-semibold text-gray-800">My Earnings</h2>
          <p className="text-sm text-gray-600 mt-1">Track your income and manage withdrawals</p>
        </div>
        <button
          className="flex items-center px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538]"
          onClick={() => alert('Withdraw Funds action triggered!')}
        >
          <DollarSign size={20} className="mr-2" />
          Withdraw Funds
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
              +12.5%
            </span>
          </div>
          <h3 className="text-2xl font-semibold mt-4">$24,500</h3>
          <p className="text-gray-600 text-sm">Total Earnings</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-50 rounded-lg">
              <ArrowUpRight className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              Pending
            </span>
          </div>
          <h3 className="text-2xl font-semibold mt-4">$3,200</h3>
          <p className="text-gray-600 text-sm">Pending Payments</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-purple-50 rounded-lg">
              <ArrowDownRight className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
              Available
            </span>
          </div>
          <h3 className="text-2xl font-semibold mt-4">$1,850</h3>
          <p className="text-gray-600 text-sm">Available for Withdrawal</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>

            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Calendar size={20} className="text-gray-500 mr-2" />
              Custom Range
            </button>
          </div>

          <button className="flex items-center px-4 py-2 text-[#00704A] hover:bg-[#00704A]/5 rounded-lg"
            onClick={() => alert('Export Report action triggered!')}
          >
            <Download size={20} className="mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Earnings Chart */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Earnings Overview</h3>
        <div className="h-80">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-800">Payment Methods</h3>
          <button className="flex items-center text-[#00704A] hover:text-[#005538]">
            <Plus size={20} className="mr-2" />
            Add Payment Method
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <CreditCard size={24} className="text-gray-600" />
              </div>
              <div>
                <h4 className="font-medium">•••• •••• •••• 4242</h4>
                <p className="text-sm text-gray-500">Expires 12/25</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              Primary
            </span>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Bank size={24} className="text-gray-600" />
              </div>
              <div>
                <h4 className="font-medium">Bank Account</h4>
                <p className="text-sm text-gray-500">•••• 5678</p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <ExternalLink size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Earnings */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-800">Recent Earnings</h3>
            <button className="flex items-center text-[#00704A] hover:text-[#005538]">
              View All
              <ChevronDown size={16} className="ml-1" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentEarnings.map((earning) => (
                <tr key={earning.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{earning.project}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{earning.client}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${earning.amount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{format(new Date(earning.date), 'MMM dd, yyyy')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      earning.status === 'Completed'
                        ? 'bg-green-100 text-green-800'
                        : earning.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {earning.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const recentEarnings = [
  {
    id: 1,
    project: 'E-commerce Website Development',
    client: 'TechCorp Solutions',
    amount: 2500,
    date: '2024-03-25',
    status: 'Completed'
  },
  {
    id: 2,
    project: 'Mobile App UI Design',
    client: 'InnovateLabs',
    amount: 1800,
    date: '2024-03-24',
    status: 'Pending'
  },
  {
    id: 3,
    project: 'Backend API Development',
    client: 'DataFlow Systems',
    amount: 3200,
    date: '2024-03-23',
    status: 'Completed'
  },
  {
    id: 4,
    project: 'Website Optimization',
    client: 'GrowthMedia',
    amount: 1200,
    date: '2024-03-22',
    status: 'Processing'
  }
]

export default MyEarnings