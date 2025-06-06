import React, { useState, useEffect } from 'react'
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  Briefcase, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Bell, 
  Search, 
  ChevronDown,
  Wallet,
  Star,
  FileText,
  Clock,
  Award,
  BookOpen,
  Calendar,
  PieChart,
  Zap,
  Shield,
  HelpCircle,
  BarChart,
  User,
  Mail,
  Lock,
  BellRing,
  Globe,
  Moon,
  Sun,
  Palette,
  Trash2
} from 'lucide-react'
import Login from './components/Login'
import Signup from './components/Signup'
import FreelancerDashboard from './components/freelancer/dashboard/FreelancerDashboard'
import ClientDashboard from './components/client/dashboard/ClientDashboard'
import FreelancerOnboarding from './components/freelancer/FreelancerOnboarding'
import ClientOnboarding from './components/client/ClientOnboarding'
import FreelancerDirectory from './components/client/dashboard/FreelancerDirectory'
import ProjectsDirectory from './components/client/dashboard/ProjectsDirectory'
import MessagesPage from './components/messages/MessagesPage'
import SettingsPage from './components/settings/SettingsPage'
import FindJobs from './components/freelancer/dashboard/FindJobs'
import MyProposals from './components/freelancer/dashboard/MyProposals'
import Contracts from './components/freelancer/dashboard/Contracts'
import MyProjects from './components/freelancer/dashboard/MyProjects'
import ProjectDetails from './components/freelancer/dashboard/ProjectDetails'
import Portfolio from './components/freelancer/dashboard/Portfolio'
import MyEarnings from './components/freelancer/dashboard/MyEarnings'
import Transactions from './components/freelancer/dashboard/Transactions'
import Reports from './components/freelancer/dashboard/Reports'
import Profile from './components/freelancer/dashboard/Profile'
import SkillsBadges from './components/freelancer/dashboard/SkillsBadges'
import Reviews from './components/freelancer/dashboard/Reviews'
import SecurityPage from './components/freelancer/dashboard/SecurityPage'
import HelpCenter from './components/freelancer/dashboard/HelpCenter'
import { supabase } from './lib/supabase'
import TermsAndConditions from './components/TermsAndConditions'

function App() {
  const [onboardingStatus, setOnboardingStatus] = useState<'loading' | 'incomplete' | 'complete'>('loading');
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isOnboarding, setIsOnboarding] = useState(true)
  const [userType, setUserType] = useState<'freelancer' | 'client'>('freelancer')
  const [activeSection, setActiveSection] = useState('dashboard')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [freelancerName, setFreelancerName] = useState('')
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [sectionState, setSectionState] = useState<any>(null);
  const [showTerms, setShowTerms] = useState(false);

  
  // Handle custom navigation events
  useEffect(() => {
    const handleNavigation = (e: CustomEvent) => {
      const { section, projectId } = e.detail;
      setActiveSection(section);
      if (projectId) {
        setSelectedProjectId(projectId);
      }
    };

    // @ts-ignore - CustomEvent typing issue
    window.addEventListener('navigate', handleNavigation);
    
    return () => {
      // @ts-ignore - CustomEvent typing issue
      window.removeEventListener('navigate', handleNavigation);
    };
  }, []);

  useEffect(() => {
    // Check if user is already authenticated on mount (for session persistence)
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setSessionChecked(true);
      if (user) {
        // Detect user type on refresh
        const { data: freelancerProfile } = await supabase
          .from('freelancer_profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        const { data: clientProfile } = await supabase
          .from('client_profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        if (freelancerProfile) {
          setUserType('freelancer');
        } else if (clientProfile) {
          setUserType('client');
        }
      }
    };
    checkSession();

    // Listen for custom navigation events
    const handler = (e: any) => {
      if (e.detail && e.detail.section) {
        setActiveSection(e.detail.section);
        setSectionState(e.detail);
      }
    };
    window.addEventListener('navigate', handler);
    return () => window.removeEventListener('navigate', handler);
  }, []);

  useEffect(() => {
    // Check onboarding completion for freelancer and client
    const checkOnboarding = async () => {
      setOnboardingStatus('loading');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setOnboardingStatus('incomplete');
        return;
      }
      
      if (userType === 'freelancer') {
        // 1. Check freelancer profile
        const { data: profile } = await supabase
          .from('freelancer_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        const profileComplete = profile && profile.professional_title && profile.hourly_rate && profile.skills && profile.skills.length > 0;
        
        // 2. Check documents
        const { data: docs } = await supabase
          .from('documents')
          .select('id')
          .eq('user_id', user.id);
        const docsUploaded = docs && docs.length > 0;
        
        if (profileComplete && docsUploaded) {
          setOnboardingStatus('complete');
        } else {
          setOnboardingStatus('incomplete');
        }
      } else if (userType === 'client') {
        // Check client profile and verification status
        const { data: profile } = await supabase
          .from('client_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        // Check if profile exists and is verified
        if (profile && profile.verification_status === 'approved') {
          setOnboardingStatus('complete');
        } else {
          setOnboardingStatus('incomplete');
        }
      }
    };
    
    if (isAuthenticated) {
      checkOnboarding();
    }
  }, [isAuthenticated, userType]);

  useEffect(() => {
    loadFreelancerProfile()
  }, [])

  // Fetch user's profile picture
  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Try to fetch from the appropriate profile table based on user type
        if (userType === 'freelancer') {
          const { data: profile, error } = await supabase
            .from('freelancer_profiles')
            .select('avatar_url, full_name')
            .eq('user_id', user.id)
            .single();

          if (!error && profile) {
            if (profile.avatar_url) {
              setProfileImageUrl(profile.avatar_url);
            }
            if (profile.full_name) {
              setFreelancerName(profile.full_name);
            }
          }
        } else if (userType === 'client') {
          const { data: profile, error } = await supabase
            .from('client_profiles')
            .select('avatar_url, full_name, company_name')
            .eq('user_id', user.id)
            .single();

          if (!error && profile) {
            if (profile.avatar_url) {
              setProfileImageUrl(profile.avatar_url);
            }
            if (profile.company_name || profile.full_name) {
              setFreelancerName(profile.company_name || profile.full_name || '');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching profile picture:', error);
      }
    };

    fetchProfilePicture();

    // Set up real-time subscription for profile picture updates
    const freelancerChannel = supabase
      .channel('freelancer_profile_changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'freelancer_profiles',
      }, (payload) => {
        console.log('Freelancer profile updated:', payload.new);
        if (userType === 'freelancer') {
          if (payload.new.avatar_url) {
            console.log('Updating profile image URL:', payload.new.avatar_url);
            setProfileImageUrl(payload.new.avatar_url);
          }
          if (payload.new.full_name) {
            setFreelancerName(payload.new.full_name);
          }
        }
      })
      .subscribe();
      
    const clientChannel = supabase
      .channel('client_profile_changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'client_profiles',
      }, (payload) => {
        console.log('Client profile updated:', payload.new);
        if (userType === 'client') {
          if (payload.new.avatar_url) {
            console.log('Updating profile image URL:', payload.new.avatar_url);
            setProfileImageUrl(payload.new.avatar_url);
          }
          if (payload.new.company_name || payload.new.full_name) {
            setFreelancerName(payload.new.company_name || payload.new.full_name);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(freelancerChannel);
      supabase.removeChannel(clientChannel);
    };
  }, [userType]);

  const loadFreelancerProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: freelancerProfile } = await supabase
        .from('freelancer_profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single()

      if (freelancerProfile) {
        setFreelancerName(freelancerProfile.full_name || '')
      }
    } catch (error) {
      console.error('Error loading freelancer profile:', error)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      // First delete all related data
      if (userType === 'freelancer') {
        // Get freelancer profile ID
        const { data: freelancerProfile, error: profileIdError } = await supabase
          .from('freelancer_profiles')
          .select('id, avatar_url')
          .eq('user_id', user.id)
          .single()

        if (profileIdError) throw profileIdError
        if (!freelancerProfile) throw new Error('Freelancer profile not found')

        // Delete job applications
        const { error: applicationsError } = await supabase
          .from('job_applications')
          .delete()
          .eq('freelancer_id', freelancerProfile.id)

        if (applicationsError) throw applicationsError

        // Delete profile image from storage if exists
        if (freelancerProfile.avatar_url) {
          const fileName = freelancerProfile.avatar_url.split('/').pop()
          if (fileName) {
            const { error: storageError } = await supabase.storage
              .from('avatars')
              .remove([fileName])
            if (storageError) console.error('Error deleting avatar:', storageError)
          }
        }

        // Delete freelancer profile
        const { error: profileError } = await supabase
          .from('freelancer_profiles')
          .delete()
          .eq('id', freelancerProfile.id)

        if (profileError) throw profileError
      } else {
        // Get client profile ID
        const { data: clientProfile, error: profileIdError } = await supabase
          .from('client_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (profileIdError) throw profileIdError
        if (!clientProfile) throw new Error('Client profile not found')

        // Delete all jobs posted by the client
        const { error: jobsError } = await supabase
          .from('jobs')
          .delete()
          .eq('client_id', clientProfile.id)

        if (jobsError) throw jobsError

        // Delete client profile
        const { error: profileError } = await supabase
          .from('client_profiles')
          .delete()
          .eq('id', clientProfile.id)

        if (profileError) throw profileError
      }

      // Finally delete the user's auth account
      await supabase.auth.signOut()
      setIsAuthenticated(false)
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Failed to delete account. Please try again.')
    }
  }

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetch('https://api.gigzs.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Show terms popup immediately after successful login
      setShowTerms(true);
      
      // Don't set isAuthenticated until terms are accepted
      // This will keep the user on the login screen until they accept
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleAcceptTerms = () => {
    setShowTerms(false);
    // Only set isAuthenticated after terms are accepted
    setIsAuthenticated(true);
    localStorage.setItem('termsAccepted', 'true');
  };

  if (!sessionChecked) {
    // Don't show login/signup until session check is complete
    return null;
  }
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        {showSignup ? (
          <Signup
            onSwitch={() => setShowSignup(false)}
            onSuccess={(type: 'freelancer' | 'client') => {
              setUserType(type)
              setShowTerms(true); // Show terms after signup
            }}
          />
        ) : (
          <Login
            onSwitch={() => setShowSignup(true)}
            onSuccess={(type: 'freelancer' | 'client') => {
              setUserType(type)
              setShowTerms(true); // Show terms after login
            }}
          />
        )}
        {showTerms && <TermsAndConditions onAccept={handleAcceptTerms} />}
      </div>
    )
  }

  // Block dashboard until onboarding complete for both freelancers and clients
  if (userType === 'freelancer' && onboardingStatus !== 'complete') {
    return <FreelancerOnboarding onComplete={() => setOnboardingStatus('complete')} />;
  }
  
  // For clients: block dashboard until onboarding complete
  if (userType === 'client' && onboardingStatus !== 'complete') {
    return <ClientOnboarding onComplete={() => setOnboardingStatus('complete')} />;
  }

  const freelancerMenuSections = [
    {
      title: 'Main',
      items: [
        { id: 'dashboard', icon: Home, text: 'Dashboard' },
        { id: 'jobs', icon: Briefcase, text: 'Find Jobs' },
        { id: 'proposals', icon: FileText, text: 'My Proposals' },
        { id: 'contracts', icon: FileText, text: 'Contracts' },
      ]
    },
    {
      title: 'Work',
      items: [
        { id: 'projects', icon: Briefcase, text: 'My Projects' },
        { id: 'portfolio', icon: BookOpen, text: 'Portfolio' },
      ]
    },
    {
      title: 'Earnings',
      items: [
        { id: 'earnings', icon: Wallet, text: 'My Earnings' },
        { id: 'transactions', icon: PieChart, text: 'Transactions' },
        { id: 'reports', icon: BarChart, text: 'Reports' },
      ]
    },
    {
      title: 'Profile',
      items: [
        { id: 'profile', icon: User, text: 'Profile' },
        { id: 'skills', icon: Zap, text: 'Skills & Badges' },
        { id: 'reviews', icon: Star, text: 'Reviews' },
      ]
    },
    {
      title: 'Communication',
      items: [
        { id: 'messages', icon: MessageSquare, text: 'Messages' },
      ]
    },
    {
      title: 'Settings',
      items: [
        { id: 'settings', icon: Settings, text: 'Settings' },
        { id: 'security', icon: Shield, text: 'Security' },
        { id: 'help', icon: HelpCircle, text: 'Help Center' },
        { id: 'logout', icon: LogOut, text: 'Logout', onClick: () => setIsAuthenticated(false) },
        { 
          id: 'delete', 
          icon: Trash2, 
          text: 'Delete Account',
          onClick: () => setShowDeleteConfirm(true)
        }
      ]
    }
  ]

  const clientMenuSections = [
    { id: 'dashboard', icon: Home, text: 'Dashboard' },
    { id: 'freelancers', icon: Users, text: 'Freelancers' },
    { id: 'projects', icon: Briefcase, text: 'Projects' },
    { id: 'messages', icon: MessageSquare, text: 'Messages' },
    { id: 'settings', icon: Settings, text: 'Settings' },
    { id: 'logout', icon: LogOut, text: 'Logout', onClick: () => setIsAuthenticated(false) },
    { 
      id: 'delete', 
      icon: Trash2, 
      text: 'Delete Account',
      onClick: () => setShowDeleteConfirm(true)
    }
  ]

  const renderContent = () => {
    if (userType === 'client') {
      switch (activeSection) {
        case 'freelancers':
          return <FreelancerDirectory />
        case 'projects':
          return <ProjectsDirectory />
        case 'messages':
          return <MessagesPage />
        case 'settings':
          return <SettingsPage />
        default:
          return <ClientDashboard />
      }
    }
    
    // Handle project details view
    if (activeSection === 'projects' && selectedProjectId) {
      return <ProjectDetails projectId={selectedProjectId} onBack={() => setSelectedProjectId(null)} />
    }
    
    switch (activeSection) {
      case 'jobs':
        return <FindJobs />
      case 'proposals':
        return <MyProposals sectionState={sectionState} />
      case 'contracts':
        return <Contracts />
      case 'projects':
        return <MyProjects onViewDetails={setSelectedProjectId} />
      case 'portfolio':
        return <Portfolio />
      case 'earnings':
        return <MyEarnings />
      case 'transactions':
        return <Transactions />
      case 'reports':
        return <Reports />
      case 'profile':
        return <Profile />
      case 'skills':
        return <SkillsBadges />
      case 'reviews':
        return <Reviews />
      case 'messages':
        return <MessagesPage />
      case 'settings':
        return <SettingsPage />
      case 'security':
        return <SecurityPage />
      case 'help':
        return <HelpCenter />
      default:
        return <FreelancerDashboard />
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--secondary-bg)', color: 'var(--primary-text)' }}>
      {showTerms && <TermsAndConditions onAccept={handleAcceptTerms} />}
      {/* Sidebar */}
      <aside 
        className={`bg-primary text-white fixed left-0 top-0 h-screen transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="h-16 px-4 flex items-center justify-between border-b border-primary">
          <h1 className={`font-sans font-bold sidebar-header ${isSidebarOpen ? 'block' : 'hidden'}`}>
            {userType === 'freelancer' ? 'Freelancer Hub' : 'Client Hub'}
          </h1>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-primary rounded-lg text-white"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        <div className="h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="p-4">
            {userType === 'freelancer' ? (
              // Freelancer Menu Sections
              <div className="space-y-6">
                {freelancerMenuSections.map((section, sectionIndex) => (
                  <div key={sectionIndex}>
                    {isSidebarOpen && (
                      <h2 className="px-2 text-xs font-semibold uppercase tracking-wider mb-2 sidebar-section-title">
                        {section.title}
                      </h2>
                    )}
                    {section.items.map((item, itemIndex) => (
                      <NavItem
                        key={itemIndex}
                        icon={<item.icon size={20} />}
                        text={item.text}
                        isOpen={isSidebarOpen}
                        isActive={activeSection === item.id}
                        onClick={() => {
                          if (item.onClick) {
                            item.onClick()
                          } else {
                            setActiveSection(item.id)
                            setSelectedProjectId(null) // Reset selected project when changing sections
                          }
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              // Client Menu Items
              clientMenuSections.map((item) => (
                <NavItem
                  key={item.id}
                  icon={<item.icon size={20} />}
                  text={item.text}
                  isOpen={isSidebarOpen}
                  isActive={activeSection === item.id}
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick()
                    } else {
                      setActiveSection(item.id)
                    }
                  }}
                />
              ))
            )}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className={`min-h-screen transition-all duration-300 ${
          isSidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        {/* Header */}
        <header className="h-16 fixed top-0 right-0 left-0 z-10 border-b" style={{ left: isSidebarOpen ? '16rem' : '5rem', background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
          <div className="h-full px-6 flex items-center justify-between">
            <div className="flex items-center flex-1">
              <h2 className="text-xl font-semibold" style={{ color: 'var(--heading-text)' }}>
                {userType === 'freelancer' ? 'Freelancer Dashboard' : 'Client Dashboard'}
              </h2>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-2">
                  <img
                    src={profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(freelancerName || 'U')}`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(freelancerName || 'U')}`;
                    }}
                  />
                  <span className="font-semibold">{freelancerName}</span>
                  <ChevronDown size={16} />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-20" style={{ background: 'var(--card-bg)' }}>
                    <a href="#" onClick={() => setActiveSection('profile')} className="block px-4 py-2 text-sm hover:bg-hover" style={{ color: 'var(--primary-text)' }}>Profile</a>
                    <a href="#" onClick={() => setActiveSection('settings')} className="block px-4 py-2 text-sm hover:bg-hover" style={{ color: 'var(--primary-text)' }}>Settings</a>
                    <a href="#" onClick={() => setActiveSection('logout')} className="block px-4 py-2 text-sm hover:bg-hover" style={{ color: 'var(--primary-text)' }}>Logout</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="pt-20 px-6 pb-8">
          {renderContent()}
        </div>

        {/* Copyright Footer */}
        <div className="text-center py-4 text-sm text-gray-500 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <p>
            © 2025 <a href="https://gigzs.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">gigzs.com</a> | 
            Designed by <a href="https://uimitra.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">uimitra.com</a>
          </p>
        </div>
      </main>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-lg p-6 max-w-md w-full mx-4" style={{ background: 'var(--card-bg)' }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--heading-text)' }}>Delete Account</h3>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border rounded-lg hover:bg-hover"
                style={{ borderColor: 'var(--border-color)', color: 'var(--primary-text)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function NavItem({ 
  icon, 
  text, 
  isOpen, 
  isActive, 
  onClick 
}: { 
  icon: React.ReactNode
  text: string
  isOpen: boolean
  isActive?: boolean
  onClick?: () => void 
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200 ease-in-out cursor-pointer ${
        isActive
          ? 'bg-primary text-white scale-105 shadow-md'
          : 'text-white hover:bg-primary hover:text-white hover:scale-105 hover:shadow-lg'
      }`}
    >
      <span className="min-w-[2rem]">{icon}</span>
      {isOpen && <span className="ml-2 truncate">{text}</span>}
    </button>
  )
}

const styles = `
  .sidebar-header {
    color: white !important;
  }
  .sidebar-section-title {
    color: white !important;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default App