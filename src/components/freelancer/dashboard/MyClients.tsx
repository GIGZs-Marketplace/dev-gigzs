import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  ChevronDown, 
  MessageSquare, 
  Star, 
  DollarSign, 
  Calendar,
  Clock,
  Building2,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Plus
} from 'lucide-react'
import { supabase } from '../../../lib/supabase';

function MyClients() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [filterStatus, setFilterStatus] = useState('all')
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not logged in');
        // 2. Get freelancer profile
        const { data: freelancerProfile } = await supabase
          .from('freelancer_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();
        if (!freelancerProfile) throw new Error('No freelancer profile found.');
        // 3. Get all accepted job applications for this freelancer
        const { data: applications, error: appsError } = await supabase
          .from('job_applications')
          .select('job_id, status, jobs ( id, title, created_at, client_id, budget_amount, budget_max_amount, status, client_profiles ( user_id, company_name, avatar_url, email, phone, location ) )')
          .eq('freelancer_id', freelancerProfile.id)
          .eq('status', 'accepted');
        if (appsError) throw appsError;
        // 4. Group jobs by client
        const clientMap: Record<string, any> = {};
        (applications || []).forEach(app => {
          let job = Array.isArray(app.jobs) ? app.jobs[0] : app.jobs;
          if (!job || !job.client_profiles) return;
          let clientProfile = Array.isArray(job.client_profiles) ? job.client_profiles[0] : job.client_profiles;
          if (!clientProfile || !clientProfile.user_id) return;
          const clientId = clientProfile.user_id;
          const clientName = clientProfile.company_name  || 'Client';
          if (!clientMap[clientId]) {
            clientMap[clientId] = {
              id: clientId,
              name: clientName,
              company: clientName,
              avatar: clientProfile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(clientName)}`,
              email: clientProfile.email || '',
              phone: clientProfile.phone || '',
              location: clientProfile.location || '',
              totalProjects: 0,
              totalEarnings: 0,
              lastProject: '',
              rating: 4.8, // Placeholder, you can fetch real rating if you have it
              recentProjects: []
            };
          }
          // Add project to client
          clientMap[clientId].totalProjects += 1;
          clientMap[clientId].totalEarnings += job.budget_amount || job.budget_max_amount || 0;
          // For lastProject, use the most recent job
          if (!clientMap[clientId].lastProject || new Date(job.created_at) > new Date(clientMap[clientId].lastProjectDate || 0)) {
            clientMap[clientId].lastProject = timeAgo(job.created_at);
            clientMap[clientId].lastProjectDate = job.created_at;
          }
          // Add to recentProjects (limit to 3)
          clientMap[clientId].recentProjects.push({
            name: job.title,
            date: new Date(job.created_at).toLocaleDateString(),
            value: job.budget_amount || job.budget_max_amount || 0,
            status: job.status || 'In Progress'
          });
          clientMap[clientId].recentProjects = clientMap[clientId].recentProjects.slice(-3);
        });
        setClients(Object.values(clientMap));
      } catch (err: any) {
        setError(err.message || 'Failed to fetch clients.');
        setClients([]);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  // Helper to show '2 weeks ago', etc.
  function timeAgo(dateString: string) {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    if (diff < 2592000) return `${Math.floor(diff / 604800)} weeks ago`;
    return date.toLocaleDateString();
  }

  const handleRequestNewWork = (client: any) => {
    alert(`Request new work from ${client.name}`);
    // TODO: Open modal or navigate to request new work form
  };

  const handleViewFullHistory = (client: any) => {
    alert(`Viewing full history with ${client.name}`);
    // TODO: Open modal or navigate to full history page
  };

  // Filter and search
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) || client.company.toLowerCase().includes(searchTerm.toLowerCase());
    // You can add more filter logic for status here if you want
    return matchesSearch;
  });

  // Sort
  filteredClients.sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.lastProjectDate || 0).getTime() - new Date(a.lastProjectDate || 0).getTime();
    } else if (sortBy === 'earnings') {
      return b.totalEarnings - a.totalEarnings;
    } else if (sortBy === 'projects') {
      return b.totalProjects - a.totalProjects;
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">My Clients</h2>
          <p className="text-sm text-gray-600 mt-1">Manage your client relationships and projects</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
            >
              <option value="all">All Clients</option>
              <option value="active">Active</option>
              <option value="past">Past Clients</option>
              <option value="potential">Potential Clients</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
            >
              <option value="recent">Most Recent</option>
              <option value="earnings">Highest Earnings</option>
              <option value="projects">Most Projects</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-gray-500">Loading clients...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : filteredClients.length === 0 ? (
          <div className="text-gray-500">No clients found.</div>
        ) : (
          filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
            >
              {/* Client Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={client.avatar}
                    alt={client.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{client.name}</h3>
                    <div className="flex items-center mt-1">
                      <Building2 size={16} className="text-gray-400 mr-1" />
                      <span className="text-sm text-gray-600">{client.company}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-[#00704A] rounded-lg hover:bg-gray-50">
                    <MessageSquare size={20} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-[#00704A] rounded-lg hover:bg-gray-50">
                    <ExternalLink size={20} />
                  </button>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Mail className="text-gray-400" size={16} />
                  <span className="text-sm text-gray-600">{client.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="text-gray-400" size={16} />
                  <span className="text-sm text-gray-600">{client.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="text-gray-400" size={16} />
                  <span className="text-sm text-gray-600">{client.location}</span>
                </div>
              </div>

              {/* Projects and Stats */}
              <div className="mt-6 grid grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Briefcase className="text-gray-400" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Total Projects</p>
                    <p className="text-sm font-medium">{client.totalProjects}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="text-gray-400" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Total Earnings</p>
                    <p className="text-sm font-medium">${client.totalEarnings.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="text-gray-400" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Last Project</p>
                    <p className="text-sm font-medium">{client.lastProject}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="text-yellow-400" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Client Rating</p>
                    <p className="text-sm font-medium">{client.rating}/5</p>
                  </div>
                </div>
              </div>

              {/* Recent Projects */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Recent Projects</h4>
                <div className="space-y-3">
                  {client.recentProjects.map((project: any, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div>
                        <h5 className="font-medium text-gray-900">{project.name}</h5>
                        <p className="text-sm text-gray-600">{project.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${project.value.toLocaleString()}</p>
                        <span className={`text-sm ${
                          project.status === 'Completed' ? 'text-green-600' : 'text-blue-600'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                <button className="flex items-center text-[#00704A] hover:text-[#005538]" onClick={() => handleRequestNewWork(client)}>
                  <Plus size={18} className="mr-1" />
                  Request New Work
                </button>
                <button className="px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538]" onClick={() => handleViewFullHistory(client)}>
                  View Full History
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default MyClients