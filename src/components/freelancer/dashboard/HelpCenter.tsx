import React, { useState } from 'react'
import { 
  Search, 
  HelpCircle, 
  MessageSquare, 
  FileText, 
  ChevronDown, 
  ChevronRight,
  Send,
  Plus,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Help Center</h2>
          <p className="text-sm text-gray-600 mt-1">Find answers, submit tickets, and get support</p>
        </div>
        <button
          onClick={() => setShowTicketForm(true)}
          className="px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538] flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Submit Ticket
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-lg font-medium text-center text-gray-900 mb-2">
            How can we help you today?
          </h3>
          <div className="relative">
            <input
              type="text"
              placeholder="Search for help articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
            />
            <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
          </div>
        </div>
      </div>

      {/* Help Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`p-6 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300 text-left ${
              selectedCategory === category.id ? 'border-[#00704A] bg-[#00704A]/5' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${category.iconBg}`}>
                <category.icon className={`h-6 w-6 ${category.iconColor}`} />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{category.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.id} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                <ChevronDown
                  size={20}
                  className={`text-gray-500 transition-transform ${
                    expandedFAQ === faq.id ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              {expandedFAQ === faq.id && (
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Live Chat */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Live Support</h3>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            Online
          </span>
        </div>
        
        <div className="h-64 border border-gray-200 rounded-lg mb-4 p-4 overflow-y-auto">
          <div className="space-y-4">
            {/* Chat messages would go here */}
            <div className="flex items-start space-x-2">
              <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                <p className="text-gray-900">Hello! How can I help you today?</p>
                <span className="text-xs text-gray-500 mt-1">Support Agent • 12:30 PM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
          />
          <button className="px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538]">
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* Support Ticket Form Modal */}
      {showTicketForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Submit Support Ticket</h3>
              <button
                onClick={() => setShowTicketForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none">
                  <option>Account Issues</option>
                  <option>Payment Problems</option>
                  <option>Technical Support</option>
                  <option>Feature Request</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={4}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Attachments</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <Plus className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer rounded-md font-medium text-[#00704A] hover:text-[#005538]">
                        <span>Upload files</span>
                        <input type="file" className="sr-only" multiple />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowTicketForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538]"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const categories = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'New to the platform? Start here',
    icon: HelpCircle,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600'
  },
  {
    id: 'account-billing',
    name: 'Account & Billing',
    description: 'Manage your account and payments',
    icon: FileText,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600'
  },
  {
    id: 'technical-support',
    name: 'Technical Support',
    description: 'Get help with technical issues',
    icon: MessageSquare,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600'
  }
]

const faqs = [
  {
    id: '1',
    question: 'How do I get paid for my work?',
    answer: 'We process payments through secure payment gateways. Once a project milestone is completed and approved by the client, the payment is released to your account within 5-7 business days.'
  },
  {
    id: '2',
    question: 'What happens if a client disputes my work?',
    answer: 'If a client disputes your work, our mediation team will review the case and work with both parties to reach a fair resolution. We recommend keeping detailed documentation of all work and communication.'
  },
  {
    id: '3',
    question: 'How can I improve my profile visibility?',
    answer: 'To improve your profile visibility, complete all sections of your profile, maintain a high job success rate, regularly update your portfolio, and keep your skills current.'
  }
]

export default HelpCenter