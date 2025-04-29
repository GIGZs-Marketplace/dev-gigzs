import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface Client {
  client_name: string;
  client_user_id: string;
  jobs: { job_id: string; job_title: string }[];
}

interface JobWithClient {
  id: string;
  title: string;
  client_id: string;
  client_profiles: { user_id: string; company_name: string }[] | { user_id: string; company_name: string };
}

const MyClients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!userId) return;
        // 1. Get freelancer profile
        const { data: freelancerProfile } = await supabase
          .from('freelancer_profiles')
          .select('id')
          .eq('user_id', userId)
          .single();
        if (!freelancerProfile) {
          setError('No freelancer profile found.');
          setClients([]);
          setLoading(false);
          return;
        }
        // 2. Get accepted job applications
        const { data: applications, error: appsError } = await supabase
          .from('job_applications')
          .select('job_id, jobs ( id, title, client_id, client_profiles ( user_id, company_name ) )')
          .eq('freelancer_id', freelancerProfile.id)
          .eq('status', 'accepted');
        if (appsError) throw appsError;

        // Debug: log what we get
        console.log('Applications:', applications);

        // 3. Group by client
        const clientMap: Record<string, Client> = {};
        (applications || []).forEach(app => {
          let job: JobWithClient | undefined;
          if (Array.isArray(app.jobs)) {
            job = app.jobs[0];
          } else {
            job = app.jobs;
          }
          if (!job) return;
          let clientProfile: { user_id: string; company_name: string } | undefined;
          if (Array.isArray(job.client_profiles)) {
            clientProfile = job.client_profiles[0];
          } else {
            clientProfile = job.client_profiles;
          }
          if (!clientProfile || !clientProfile.user_id) return;
          const clientId = clientProfile.user_id;
          if (!clientMap[clientId]) {
            clientMap[clientId] = {
              client_name: clientProfile.company_name,
              client_user_id: clientId,
              jobs: []
            };
          }
          clientMap[clientId].jobs.push({ job_id: job.id, job_title: job.title });
        });
        setClients(Object.values(clientMap));
      } catch (err: any) {
        setError(err.message || 'Failed to fetch clients.');
        setClients([]);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchClients();
  }, [userId]);

  const handleRequestNewWork = (client: Client) => {
    // Open a modal or navigate to a form to request new work from this client
    alert(`Request new work from ${client.client_name}`);
    // You can implement a modal here to collect job details and submit to the DB
  };

  const handleViewFullHistory = (client: Client) => {
    // Open a modal or navigate to a page showing all jobs/messages with this client
    alert(`Viewing full history with ${client.client_name}`);
    // You can implement a modal or page to show all jobs (including completed) with this client
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Clients</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : clients.length === 0 ? (
        <div className="text-gray-500">No clients found.</div>
      ) : (
        <div className="space-y-6">
          {clients.map(client => (
            <div key={client.client_user_id} className="border rounded-lg p-4 bg-white shadow-sm">
              <h2 className="text-lg font-semibold mb-2">{client.client_name}</h2>
              <ul className="list-disc ml-6">
                {client.jobs.map(job => (
                  <li key={job.job_id}>{job.job_title}</li>
                ))}
              </ul>
              <div className="mt-4 flex gap-2">
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => handleRequestNewWork(client)}
                >
                  Request New Work
                </button>
                <button
                  className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  onClick={() => handleViewFullHistory(client)}
                >
                  View Full History
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyClients; 