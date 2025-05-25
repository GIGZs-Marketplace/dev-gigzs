import React, { useState, useEffect, useRef } from 'react'
import { 
  Search, 
  HelpCircle, 
  MessageSquare, 
  FileText, 
  ChevronDown, 
  ChevronRight,
  Send,
  Mail,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
  
  // Live chat state
  const [chatMessage, setChatMessage] = useState('')
  const [chatMessages, setChatMessages] = useState<{text: string; sender: 'user' | 'agent'; time: string}[]>([
    {text: 'Hello! How can I help you today?', sender: 'agent', time: formatTime(new Date())}
  ])
  const [isAgentTyping, setIsAgentTyping] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  
  // Email query state
  const [emailQuery, setEmailQuery] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  
  // Format time for chat messages
  function formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Scroll to bottom of chat when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages])

  // Handle sending chat messages
  const handleSendMessage = () => {
    if (chatMessage.trim() === '') return
    
    // Add user message
    const newMessage = {
      text: chatMessage,
      sender: 'user' as const,
      time: formatTime(new Date())
    }
    setChatMessages([...chatMessages, newMessage])
    setChatMessage('')
    
    // Simulate agent typing
    setIsAgentTyping(true)
    
    // Simulate agent response after a delay
    setTimeout(() => {
      setIsAgentTyping(false)
      
      // Generate a response based on the user's message
      let responseText = ''
      const lowerCaseMessage = chatMessage.toLowerCase()
      
      if (lowerCaseMessage.includes('payment') || lowerCaseMessage.includes('invoice')) {
        responseText = 'For payment related questions, please check the Account & Billing section. If you need further assistance, our finance team will get back to you within 24 hours.'
      } else if (lowerCaseMessage.includes('account') || lowerCaseMessage.includes('login')) {
        responseText = 'For account issues, you can reset your password from the login page or check our FAQ section for common account problems.'
      } else if (lowerCaseMessage.includes('project') || lowerCaseMessage.includes('client')) {
        responseText = 'If you are having issues with a project or client, please provide more details so we can assist you better.'
      } else {
        responseText = 'Thank you for your message. Our support team will review your query and get back to you soon. For faster assistance, you can also email us directly using the email form below.'
      }
      
      const agentResponse = {
        text: responseText,
        sender: 'agent' as const,
        time: formatTime(new Date())
      }
      
      setChatMessages(prev => [...prev, agentResponse])
    }, 1500)
  }
  
  // Handle sending email query
  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault()
    if (emailQuery.trim() === '') return
    
    // In a real application, you would send this to your backend
    console.log('Sending email to freelancers.connect@gigzs.com:', emailQuery)
    
    // Show success message
    setEmailSent(true)
    
    // Reset after 3 seconds
    setTimeout(() => {
      setEmailSent(false)
      setEmailQuery('')
    }, 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Help Center</h2>
          <p className="text-sm text-gray-600 mt-1">Find answers, get support, and contact our team</p>
        </div>
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
        
        <div 
          ref={chatContainerRef}
          className="h-64 border border-gray-200 rounded-lg mb-4 p-4 overflow-y-auto"
        >
          <div className="space-y-4">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`flex items-start ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                <div 
                  className={`rounded-lg p-3 max-w-[80%] ${msg.sender === 'user' 
                    ? 'bg-[#00704A]/10 text-gray-900' 
                    : 'bg-gray-100 text-gray-900'}`}
                >
                  <p>{msg.text}</p>
                  <span className="text-xs text-gray-500 mt-1 block">
                    {msg.sender === 'user' ? 'You' : 'Support Agent'} • {msg.time}
                  </span>
                </div>
              </div>
            ))}
            
            {isAgentTyping && (
              <div className="flex items-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
          />
          <button 
            onClick={handleSendMessage}
            className="px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538]"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
      
      {/* Email Query Box */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900">Contact Us Directly</h3>
          <p className="text-sm text-gray-600 mt-1">
            Send your query directly to our support team at freelancers.connect@gigzs.com
          </p>
        </div>
        
        <form onSubmit={handleSendEmail} className="space-y-4">
          <div>
            <textarea
              rows={4}
              value={emailQuery}
              onChange={(e) => setEmailQuery(e.target.value)}
              placeholder="Describe your issue or question in detail..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
              required
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538] flex items-center"
              disabled={emailSent}
            >
              {emailSent ? (
                <>
                  <CheckCircle size={20} className="mr-2" />
                  Email Sent!
                </>
              ) : (
                <>
                  <Mail size={20} className="mr-2" />
                  Send Email
                </>
              )}
            </button>
          </div>
        </form>
      </div>


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