import React, { useState, useEffect } from 'react'
import { 
  Shield, 
  Lock, 
  Smartphone, 
  AlertTriangle, 
  Clock, 
  Globe, 
  LogOut,
  CheckCircle,
  Eye,
  EyeOff,
  RefreshCw,
  UserCheck,
  FileWarning,
  Fingerprint,
  X,
  Info,
  ExternalLink
} from 'lucide-react'

// Define types for device and login activity
type Device = {
  id: number;
  name: string;
  location: string;
  lastActive: string;
  current: boolean;
  ipAddress: string;
};

type LoginActivity = {
  location: string;
  time: string;
  device: string;
  status: 'success' | 'failed';
  ipAddress: string;
};

type SecurityItem = {
  id: number;
  status: 'good' | 'warning' | 'danger';
  text: string;
};

function SecurityPage() {
  // Initialize with empty arrays of the correct type
  const [activeDevices, setActiveDevices] = useState<Device[]>([])
  const [loginHistory, setLoginHistory] = useState<LoginActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [securityScore, setSecurityScore] = useState(0)
  const [securityItems, setSecurityItems] = useState<SecurityItem[]>([])
  
  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState<{title: string; content: string}>({
    title: '',
    content: ''
  })

  // Function to show modal with content
  const handleShowModal = (title: string, content: string) => {
    setModalContent({ title, content })
    setShowModal(true)
  }

  // Resource content - would typically come from an API
  const [resourceContent, setResourceContent] = useState<{[key: string]: {title: string; content: string}}>({});
  
  // Function to handle security resource clicks
  const handleResourceClick = (resourceName: string) => {
    // If we already have the content, show it
    if (resourceContent[resourceName]) {
      handleShowModal(resourceContent[resourceName].title, resourceContent[resourceName].content);
      return;
    }
    
    // Otherwise simulate fetching it
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      let newContent: {title: string; content: string};
      
      switch(resourceName) {
        case 'checklist':
          newContent = {
            title: 'Security Checklist',
            content: 'Complete these steps to secure your account:\n\n' +
              '1. Use a strong, unique password\n' +
              '2. Keep your contact information up to date\n' +
              '3. Review your active devices regularly\n' +
              '4. Monitor your account for suspicious activity\n' +
              '5. Be cautious of phishing attempts\n' +
              '6. Use secure networks when accessing your account'
          };
          break;
        case 'report':
          newContent = {
            title: 'Report Suspicious Activity',
            content: 'If you notice any suspicious activity on your account, please report it immediately:\n\n' +
              '• Unauthorized login attempts\n' +
              '• Unexpected changes to your account\n' +
              '• Suspicious messages from clients\n' +
              '• Unusual payment requests\n\n' +
              'Contact our security team at security@gigzs.com'
          };
          break;
        case 'privacy':
          newContent = {
            title: 'Privacy Policy',
            content: 'At GIGZS, we take your privacy seriously. Our privacy policy outlines:\n\n' +
              '• What information we collect\n' +
              '• How we use your data\n' +
              '• How we protect your information\n' +
              '• Your rights regarding your data\n\n' +
              'For the full privacy policy, visit our website.'
          };
          break;
        case 'faq':
          newContent = {
            title: 'Security FAQ',
            content: 'Frequently Asked Security Questions:\n\n' +
              'Q: How often should I change my password?\n' +
              'A: We recommend updating your password every 3 months.\n\n' +
              'Q: What should I do if I notice a login from an unknown location?\n' +
              'A: Log out all devices immediately and contact support.\n\n' +
              'Q: How does GIGZS protect my payment information?\n' +
              'A: We use industry-standard encryption and never store complete payment details.'
          };
          break;
        default:
          newContent = {
            title: 'Resource Information',
            content: 'Information not available at this time.'
          };
      }
      
      // Update the resource content cache
      setResourceContent(prev => ({
        ...prev,
        [resourceName]: newContent
      }));
      
      // Show the modal
      handleShowModal(newContent.title, newContent.content);
      setIsLoading(false);
    }, 500);
  }

  // Simulate fetching device and login data
  useEffect(() => {
    const fetchSecurityData = () => {
      setIsLoading(true)
      
      // Simulate API call with timeout
      setTimeout(() => {
        // Simulate calculating security score based on various factors
        const calculateSecurityScore = () => {
          // In a real app, this would be based on actual security factors
          // For now, we'll simulate it with some randomness but weighted toward realistic values
          
          // Base score between 60-80
          let baseScore = 60 + Math.floor(Math.random() * 21);
          
          // Add some bonus points for various security factors (would be real factors in production)
          const hasStrongPassword = Math.random() > 0.3;
          const hasVerifiedEmail = Math.random() > 0.4;
          const hasCompleteProfile = Math.random() > 0.5;
          const hasRecentPasswordUpdate = Math.random() > 0.6;
          const hasNoSuspiciousActivity = Math.random() > 0.2;
          
          if (hasStrongPassword) baseScore += 5;
          if (hasVerifiedEmail) baseScore += 4;
          if (hasCompleteProfile) baseScore += 3;
          if (hasRecentPasswordUpdate) baseScore += 4;
          if (hasNoSuspiciousActivity) baseScore += 5;
          
          // Cap at 95 (perfect security is never 100%)
          return Math.min(baseScore, 95);
        };
        
        const newScore = calculateSecurityScore();
        setSecurityScore(newScore);
        
        // Generate security items based on actual factors that would affect security
        // In a real app, these would be fetched from an API based on the user's actual security status
        const generateSecurityItems = () => {
          const items: SecurityItem[] = [];
          
          // Password strength (always include this)
          items.push({ 
            id: 1, 
            status: newScore > 70 ? 'good' : 'warning', 
            text: 'Strong password' 
          });
          
          // Login activity (always include this)
          const hasNormalLoginPatterns = Math.random() > 0.2;
          items.push({ 
            id: 2, 
            status: hasNormalLoginPatterns ? 'good' : 'warning', 
            text: 'Regular login activity' 
          });
          
          // Email verification
          const isEmailVerified = newScore > 75;
          items.push({ 
            id: 3, 
            status: isEmailVerified ? 'good' : 'warning', 
            text: 'Email verification' 
          });
          
          // Profile completeness
          const isProfileComplete = newScore > 85;
          items.push({ 
            id: 4, 
            status: isProfileComplete ? 'good' : 'warning', 
            text: 'Profile information complete' 
          });
          
          // Password update recency
          const hasRecentPasswordUpdate = newScore > 80;
          items.push({ 
            id: 5, 
            status: hasRecentPasswordUpdate ? 'good' : 'warning', 
            text: 'Recent password update' 
          });
          
          // Unusual activity
          const hasUnusualActivity = newScore < 90;
          if (Math.random() > 0.7 || hasUnusualActivity) {
            items.push({ 
              id: 6, 
              status: hasUnusualActivity ? 'danger' : 'good', 
              text: 'Unusual login activity' 
            });
          }
          
          // Return 4-5 items randomly selected from available items
          return items.sort(() => 0.5 - Math.random()).slice(0, 4 + Math.floor(Math.random() * 2));
        };
        
        setSecurityItems(generateSecurityItems());
        
        // Generate device data based on browser information and geolocation
        // In a real app, this would come from actual user sessions
        
        // Simulate fetching device data from an API
        const fetchDeviceData = () => {
          // In a real app, this would call an API endpoint
          
          // Get browser and OS information
          const detectBrowser = () => {
            const userAgents = [
              { name: 'Chrome', os: 'Windows' },
              { name: 'Firefox', os: 'macOS' },
              { name: 'Safari', os: 'iOS' },
              { name: 'Edge', os: 'Windows' },
              { name: 'Chrome', os: 'Android' },
              { name: 'Firefox', os: 'Linux' }
            ];
            return userAgents[Math.floor(Math.random() * userAgents.length)];
          };
          
          // Get location data
          const getLocation = () => {
            const locations = [
              { city: 'New York', country: 'US' },
              { city: 'San Francisco', country: 'US' },
              { city: 'London', country: 'UK' },
              { city: 'Toronto', country: 'CA' },
              { city: 'Sydney', country: 'AU' },
              { city: 'Berlin', country: 'DE' },
              { city: 'Tokyo', country: 'JP' },
              { city: 'Paris', country: 'FR' }
            ];
            return locations[Math.floor(Math.random() * locations.length)];
          };
          
          // Generate IP address
          const generateIP = () => {
            const segments = [];
            for (let i = 0; i < 4; i++) {
              segments.push(Math.floor(Math.random() * 256));
            }
            return segments.join('.');
          };
          
          // Current device
          const currentUA = detectBrowser();
          const currentLocation = getLocation();
          const currentDevice = {
            id: 1,
            name: `${currentUA.os} - ${currentUA.name}`,
            location: `${currentLocation.city}, ${currentLocation.country}`,
            lastActive: 'Currently active',
            current: true,
            ipAddress: generateIP()
          };
          
          // Previous devices (1-3)
          const numPrevDevices = Math.floor(Math.random() * 3) + 1;
          const prevDevices: Device[] = [];
          
          for (let i = 0; i < numPrevDevices; i++) {
            const ua = detectBrowser();
            const location = getLocation();
            const hoursAgo = Math.floor(Math.random() * 72) + 1; // 1-72 hours ago
            
            prevDevices.push({
              id: i + 2,
              name: `${ua.os} - ${ua.name}`,
              location: `${location.city}, ${location.country}`,
              lastActive: `${hoursAgo} ${hoursAgo === 1 ? 'hour' : 'hours'} ago`,
              current: false,
              ipAddress: generateIP()
            });
          }
          
          return [currentDevice, ...prevDevices];
        };
        
        // Simulate fetching login history
        const fetchLoginHistory = () => {
          // In a real app, this would call an API endpoint
          
          const loginEntries: LoginActivity[] = [];
          const numEntries = Math.floor(Math.random() * 3) + 2; // 2-4 entries
          
          for (let i = 0; i < numEntries; i++) {
            const ua = detectBrowser();
            const location = getLocation();
            const isSuccess = Math.random() > 0.25; // 75% success rate
            
            let timeAgo;
            if (i === 0) {
              timeAgo = 'Just now';
            } else if (i === 1) {
              timeAgo = `${Math.floor(Math.random() * 59) + 1} minutes ago`;
            } else {
              timeAgo = `${Math.floor(Math.random() * 24) + 1} hours ago`;
            }
            
            loginEntries.push({
              location: `${location.city}, ${location.country}`,
              time: timeAgo,
              device: `${ua.os} - ${ua.name}`,
              status: isSuccess ? 'success' : 'failed',
              ipAddress: generateIP()
            });
          }
          
          return loginEntries;
        };
        
        // Helper function to detect browser (simulated)
        function detectBrowser() {
          const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
          const devices = ['Windows', 'macOS', 'iOS', 'Android', 'Linux'];
          return {
            name: browsers[Math.floor(Math.random() * browsers.length)],
            os: devices[Math.floor(Math.random() * devices.length)]
          };
        }
        
        // Helper function to generate IP
        function generateIP() {
          return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
        }
        
        // Helper function to get location (simulated)
        function getLocation() {
          const locations = [
            { city: 'New York', country: 'US' },
            { city: 'San Francisco', country: 'US' },
            { city: 'London', country: 'UK' },
            { city: 'Toronto', country: 'CA' },
            { city: 'Sydney', country: 'AU' },
            { city: 'Berlin', country: 'DE' }
          ];
          return locations[Math.floor(Math.random() * locations.length)];
        }
        
        // Set the device data
        setActiveDevices(fetchDeviceData());
        
        // Set the login history
        setLoginHistory(fetchLoginHistory());
        
        // Update state with the new login entries
       
        setIsLoading(false)
      }, 1000)
    }
    
    fetchSecurityData()
  }, [])

  // Function to handle device logout
  const handleLogoutDevice = (deviceId: number) => {
    setActiveDevices(prevDevices => 
      prevDevices.filter(device => device.id !== deviceId)
    )
  }

  // Function to refresh security data
  const handleRefreshData = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Security Center</h2>
          <p className="text-sm text-gray-600 mt-1">Monitor your account security and stay protected</p>
        </div>
        <button
          onClick={handleRefreshData}
          disabled={isLoading}
          className="px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538] flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={18} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Security Score */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Security Score</h3>
              <p className="mt-1 text-sm text-gray-500">
                Your account security is being monitored. Follow the recommendations below to improve your security.
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <div 
              className={`w-16 h-16 rounded-full border-4 flex items-center justify-center cursor-pointer hover:shadow-md transition-shadow ${
                securityScore >= 80 ? 'border-green-500' : 
                securityScore >= 70 ? 'border-yellow-500' : 'border-red-500'
              }`}
              onClick={() => handleShowModal('Security Score', `Your security score is ${securityScore}%. ${securityScore >= 80 ? 'Great job! Your account is well protected.' : securityScore >= 70 ? 'Your account security is good, but could be improved.' : 'Your account security needs attention. Please address the warnings below.'}`)}
            >
              <span 
                className={`text-xl font-bold ${
                  securityScore >= 80 ? 'text-green-600' : 
                  securityScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                }`}
              >
                {securityScore}%
              </span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((_, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 animate-pulse">
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-gray-200 rounded-full mr-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {securityItems.map((item) => (
              <div 
                key={item.id} 
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => {
                  // Simulate fetching detailed information about this security item
                  setIsLoading(true);
                  
                  // In a real app, this would be an API call with the item ID
                  setTimeout(() => {
                    // Map of titles for each security item type
                    const getItemTitle = (itemText: string) => {
                      const titleMap: {[key: string]: string} = {
                        'Strong password': 'Password Security',
                        'Regular login activity': 'Login Activity',
                        'Email verification': 'Email Verification',
                        'Profile information complete': 'Profile Completeness',
                        'Recent password update': 'Password Updates',
                        'Unusual login activity': 'Security Alert'
                      };
                      return titleMap[itemText] || 'Security Information';
                    };
                    
                    // Generate content based on item type and status
                    const getItemContent = (item: SecurityItem) => {
                      switch(item.text) {
                        case 'Strong password':
                          return item.status === 'good' 
                            ? 'Your password is strong and secure. It includes a mix of uppercase and lowercase letters, numbers, and special characters. Remember to change it every 3 months for optimal security.'
                            : 'Your password could be stronger. Consider updating it to include a mix of uppercase and lowercase letters, numbers, and special characters. Aim for at least 12 characters in length.';
                            
                        case 'Regular login activity':
                          return item.status === 'good'
                            ? 'Your login patterns are consistent with your typical behavior. No suspicious activity has been detected.'
                            : 'We\'ve noticed some unusual login patterns. Please review your recent login activity and ensure it was you.';
                            
                        case 'Email verification':
                          return item.status === 'good'
                            ? 'Your email address has been verified. This adds an extra layer of security to your account and ensures we can contact you if needed.'
                            : 'Please verify your email address to improve account security. We\'ve sent a verification link to your registered email.';
                            
                        case 'Profile information complete':
                          return item.status === 'good'
                            ? 'Your profile information is complete. Thank you for providing all necessary details to secure your account.'
                            : 'Your profile is missing some important information. Complete your profile to improve account security and verification.';
                            
                        case 'Recent password update':
                          return item.status === 'good'
                            ? 'You\'ve updated your password within the last 3 months. Great job staying secure!'
                            : 'It\'s been more than 3 months since your last password update. Consider changing your password regularly to maintain security.';
                            
                        case 'Unusual login activity':
                          return item.status === 'good'
                            ? 'No unusual login activity has been detected on your account in the past 30 days.'
                            : 'We\'ve detected login attempts from unusual locations or devices. Please review your recent login activity and secure your account if necessary.';
                            
                        default:
                          return 'No additional information available.';
                      }
                    };
                    
                    // Show the modal with the generated content
                    handleShowModal(getItemTitle(item.text), getItemContent(item));
                    setIsLoading(false);
                  }, 300);
                }}
              >
                <div className="flex items-center">
                  {item.status === 'good' ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : item.status === 'warning' ? (
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span className="font-medium">{item.text}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security Best Practices */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start space-x-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Security Best Practices</h3>
            <p className="mt-1 text-sm text-gray-500">
              Follow these guidelines to keep your account secure and protect your data
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start">
              <div className="p-1 bg-[#00704A]/10 rounded-lg mr-3">
                <Eye className="h-5 w-5 text-[#00704A]" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Use Strong, Unique Passwords</h4>
                <p className="mt-1 text-sm text-gray-600">
                  Create passwords that are at least 12 characters long with a mix of letters, numbers, and symbols. Never reuse passwords across different accounts.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start">
              <div className="p-1 bg-[#00704A]/10 rounded-lg mr-3">
                <EyeOff className="h-5 w-5 text-[#00704A]" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Beware of Phishing Attempts</h4>
                <p className="mt-1 text-sm text-gray-600">
                  Be cautious of suspicious emails or messages asking for your personal information. GIGZS will never ask for your password via email or message.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start">
              <div className="p-1 bg-[#00704A]/10 rounded-lg mr-3">
                <UserCheck className="h-5 w-5 text-[#00704A]" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Verify Client Identity</h4>
                <p className="mt-1 text-sm text-gray-600">
                  Before accepting projects, verify the client's identity and reviews. Use the platform's messaging system for all communications to maintain a record.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start">
              <div className="p-1 bg-[#00704A]/10 rounded-lg mr-3">
                <FileWarning className="h-5 w-5 text-[#00704A]" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Secure File Sharing</h4>
                <p className="mt-1 text-sm text-gray-600">
                  When sharing files with clients, use the platform's secure file sharing system. Avoid sending sensitive information through external channels.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start">
              <div className="p-1 bg-[#00704A]/10 rounded-lg mr-3">
                <Fingerprint className="h-5 w-5 text-[#00704A]" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Protect Personal Information</h4>
                <p className="mt-1 text-sm text-gray-600">
                  Be mindful of the personal information you share on your profile. Only provide what's necessary for clients to evaluate your skills and experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Device Management */}
     
      {/* Login Activity */}
    
      {/* Additional Security Tips */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-medium text-gray-900 mb-4">Security Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => handleResourceClick('checklist')} 
            className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-[#00704A] mb-2">Security Checklist</h4>
              <Info size={16} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-600">Complete our security checklist to ensure your account is fully protected.</p>
          </button>
          
          <button 
            onClick={() => handleResourceClick('report')} 
            className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-[#00704A] mb-2">Report Suspicious Activity</h4>
              <AlertTriangle size={16} className="text-yellow-500" />
            </div>
            <p className="text-sm text-gray-600">If you notice any unusual activity, report it immediately to our security team.</p>
          </button>
          
          <button 
            onClick={() => handleResourceClick('privacy')} 
            className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-[#00704A] mb-2">Privacy Policy</h4>
              <ExternalLink size={16} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-600">Learn how we protect your data and what information we collect.</p>
          </button>
          
          <button 
            onClick={() => handleResourceClick('faq')} 
            className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-[#00704A] mb-2">Security FAQ</h4>
              <Info size={16} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-600">Find answers to common security questions and concerns.</p>
          </button>
        </div>
      </div>
      
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">{modalContent.title}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 whitespace-pre-line">{modalContent.content}</p>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SecurityPage