import React, { useEffect, useState, useRef } from 'react';
import { Search, Phone, Video, MoreVertical, Send, Paperclip, Image as ImageIcon, Smile, ChevronDown } from 'lucide-react';
import {supabase} from '../../lib/supabase';

interface Chat {
  id: string;
  created_at: string;
  participant_one: string;
  participant_two: string;
}

interface Message {
  id: string;
  chat_id: string;
  content: string;
  created_at: string;
  sender_id: string;
}

interface MessagesPageProps {
  initialUserId?: string;
}

function MessagesPage({ initialUserId }: MessagesPageProps) {
  // ...existing state
  const [otherUsers, setOtherUsers] = useState<Record<string, { name?: string; email?: string }>>({});
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeChatUserIds, setActiveChatUserIds] = useState<Set<string>>(new Set());
  const [userType, setUserType] = useState<'freelancer' | 'client' | null>(null);
  const messagesEndRef = useRef(null);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
      console.log('Current auth user ID:', user?.id);
      if (!user) return;
      // Try freelancer profile first
      const { data: freelancerProfile, error: freelancerProfileError, status: freelancerStatus } = await supabase
        .from('freelancer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (freelancerStatus === 406) {
        // Not a freelancer, try client
        const { data: clientProfile, error: clientProfileError, status: clientStatus } = await supabase
          .from('client_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();
        if (clientStatus === 406) {
          setUserType(null);
          setActiveChatUserIds(new Set());
          setContacts([]);
          setError('No profile found for this user. Please contact support or complete onboarding.');
          return;
        } else {
          setUserType('client');
          // Get all jobs for this client
          let jobs: { id: string }[] = [];
          if (clientProfile && clientProfile.id) {
            const { data } = await supabase
              .from('jobs')
              .select('id')
              .eq('client_id', clientProfile.id);
            jobs = Array.isArray(data) ? data.filter(j => j && j.id) : [];
          }
          const jobIds = jobs.map(j => j.id);
          if (jobIds.length > 0) {
            // Get all accepted applications for these jobs
            const { data: acceptedApps } = await supabase
              .from('job_applications')
              .select('freelancer_id, status, freelancer_profiles ( user_id )')
              .in('job_id', jobIds)
              .eq('status', 'accepted');
            // Get all freelancer user_ids
            const freelancerUserIds = (acceptedApps || [])
              .map(app => {
                const fp = app.freelancer_profiles;
                if (Array.isArray(fp) && fp.length > 0 && 'user_id' in fp[0]) return fp[0].user_id;
                if (fp && typeof fp === 'object' && 'user_id' in fp) return fp.user_id;
                return undefined;
              })
              .filter(Boolean);
            setActiveChatUserIds(new Set(freelancerUserIds));
          } else {
            setActiveChatUserIds(new Set());
          }
        }
      } else if (freelancerProfile) {
        setUserType('freelancer');
        // Fetch accepted job applications for freelancer
        const { data: acceptedApps } = await supabase
          .from('job_applications')
          .select('job_id, status, jobs ( client_id )')
          .eq('freelancer_id', freelancerProfile.id)
          .eq('status', 'accepted');
        // Get all client user_ids for accepted jobs
        const clientIds = (acceptedApps || [])
          .map(app => {
            const jobs = app.jobs;
            if (Array.isArray(jobs) && jobs.length > 0 && 'client_id' in jobs[0]) return jobs[0].client_id;
            if (jobs && typeof jobs === 'object' && 'client_id' in jobs) return jobs.client_id;
            return undefined;
          })
          .filter(Boolean);
        if (clientIds.length > 0) {
          const { data: clientProfiles } = await supabase
            .from('client_profiles')
            .select('user_id')
            .in('id', clientIds);
          setActiveChatUserIds(new Set((clientProfiles || []).map(cp => cp.user_id)));
        } else {
          setActiveChatUserIds(new Set());
        }
      } else {
        setUserType(null);
        setActiveChatUserIds(new Set());
        setContacts([]);
        setError('No profile found for this user. Please contact support or complete onboarding.');
        return;
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchChats();
    }
  }, [userId]);

  // Select or create chat if initialUserId is provided
  useEffect(() => {
    if (!userId || !initialUserId || userId === initialUserId) return;
    const ensureChat = async () => {
      // Wait for chats to be loaded
      if (loadingChats) return;
      // Try to find existing chat
      let chat = chats.find(
        c => (c.participant_one === userId && c.participant_two === initialUserId) ||
             (c.participant_two === userId && c.participant_one === initialUserId)
      );
      if (chat) {
        setSelectedChat(chat);
        return;
      }
      // If not found, create it
      const { data, error } = await supabase
        .from('chats')
        .insert([
          { participant_one: userId, participant_two: initialUserId }
        ])
        .select('id, created_at, participant_one, participant_two')
        .single();
      if (!error && data) {
        setChats(prev => [data, ...prev]);
        setSelectedChat(data);
      }
    };
    ensureChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUserId, userId, loadingChats, chats]);

  useEffect(() => {
    if (!selectedChat || !userId) return;
    fetchMessages();
    const channel = supabase
      .channel(`messages-chat-${selectedChat.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${selectedChat.id}` },
        (payload) => {
          setMessages((msgs) => [...msgs, payload.new as Message]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChat, userId]);

  const fetchChats = async () => {
    if (!userId) {
      console.log('No userId, skipping fetchChats');
      return;
    }
    setLoadingChats(true);
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('id, created_at, participant_one, participant_two')
        .or(`participant_one.eq.${userId},participant_two.eq.${userId}`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setChats(data || []);
      // Fetch other users' info
      const otherIds = (data || []).flatMap((chat) => [chat.participant_one, chat.participant_two]).filter((id) => id !== userId);
      const userMap = await fetchOtherUsersInfo(otherIds);
      setOtherUsers(userMap);
      console.log('Other users info:', userMap);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoadingChats(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedChat || !userId) return;
    setLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id, chat_id, content, created_at, sender_id')
        .eq('chat_id', selectedChat.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat || !userId || !message.trim()) return;
    // Optimistically add message
    const optimisticMsg: Message = {
      id: `optimistic-${Date.now()}`,
      chat_id: selectedChat.id,
      content: message.trim(),
      created_at: new Date().toISOString(),
      sender_id: userId,
    };
    setMessages((msgs) => [...msgs, optimisticMsg]);
    setMessage('');
    try {
      const { error } = await supabase
        .from('messages')
        .insert([{ chat_id: selectedChat.id, content: optimisticMsg.content, sender_id: userId }]);
      if (error) throw error;
      // Fallback: re-fetch messages to ensure consistency
      fetchMessages();
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Fetch contacts for modal
  useEffect(() => {
    const fetchContacts = async () => {
      if (!userId || !userType) return;
      let contactList: any[] = [];
      if (userType === 'freelancer') {
        // Get freelancer profile id
        const { data: freelancerProfile, error: fpError } = await supabase
          .from('freelancer_profiles')
          .select('id')
          .eq('user_id', userId)
          .single();
        console.log('Freelancer profile:', freelancerProfile, 'Error:', fpError);
        if (!freelancerProfile) return;
        // 1. All clients with accepted jobs
        const { data: acceptedApps, error: appsError } = await supabase
          .from('job_applications')
          .select('job_id, status, jobs ( client_id, title, id )')
          .eq('status', 'accepted')
          .eq('freelancer_id', freelancerProfile.id);
        console.log('Accepted apps:', acceptedApps, 'Error:', appsError);
        const clientIds = (acceptedApps || [])
          .map(app => {
            const jobs = app.jobs;
            if (Array.isArray(jobs) && jobs.length > 0 && 'client_id' in jobs[0]) return jobs[0].client_id;
            if (jobs && typeof jobs === 'object' && 'client_id' in jobs) return jobs.client_id;
            return undefined;
          })
          .filter(Boolean);
        let clients: any[] = [];
        if (clientIds.length > 0) {
          const { data: clientProfiles, error: cpError } = await supabase
            .from('client_profiles')
            .select('user_id, company_name')
            .in('id', clientIds);
          console.log('Client profiles:', clientProfiles, 'Error:', cpError);
          clients = (clientProfiles || []).map(cp => ({ user_id: cp.user_id, name: cp.company_name }));
        }
        // 2. Other freelancers working on the same jobs
        const jobIds = (acceptedApps || [])
          .map(app => {
            const jobs = app.jobs;
            if (Array.isArray(jobs) && jobs.length > 0 && 'id' in jobs[0]) return jobs[0].id;
            if (jobs && typeof jobs === 'object' && 'id' in jobs) return jobs.id;
            return undefined;
          })
          .filter(Boolean);
        let freelancers: any[] = [];
        if (jobIds.length > 0) {
          const { data: otherApps, error: otherAppsError } = await supabase
            .from('job_applications')
            .select('freelancer_id, freelancer_profiles ( user_id, full_name, avatar_url )')
            .in('job_id', jobIds)
            .eq('status', 'accepted');
          console.log('Other freelancers apps:', otherApps, 'Error:', otherAppsError);
          freelancers = (otherApps || [])
            .map(app => app.freelancer_profiles as any)
            .filter(fp => fp && typeof fp === 'object' && !Array.isArray(fp) && 'user_id' in fp && fp.user_id !== userId)
            .map(fp => ({ user_id: fp.user_id, name: fp.full_name, avatar_url: fp.avatar_url }));
        }
        contactList = [...clients, ...freelancers];
      } else if (userType === 'client') {
        // 1. All freelancers with accepted jobs
        const { data: clientProfile, error: cpError } = await supabase
          .from('client_profiles')
          .select('id')
          .eq('user_id', userId)
          .single();
        console.log('Client profile:', clientProfile, 'Error:', cpError);
        if (clientProfile) {
          let jobs: { id: string }[] = [];
          if (clientProfile && clientProfile.id) {
            const { data } = await supabase
              .from('jobs')
              .select('id')
              .eq('client_id', clientProfile.id);
            jobs = Array.isArray(data) ? (data as { id: string }[]).filter(j => j && j.id) : [];
          }
          const jobIds = jobs.map(j => j.id);
          if (jobIds.length > 0) {
            const { data: acceptedApps, error: appsError } = await supabase
              .from('job_applications')
              .select('freelancer_id, freelancer_profiles ( user_id, full_name, avatar_url )')
              .in('job_id', jobIds)
              .eq('status', 'accepted');
            console.log('Accepted freelancer apps:', acceptedApps, 'Error:', appsError);
            contactList = (acceptedApps || [])
              .map(app => app.freelancer_profiles as any)
              .filter(fp => fp && typeof fp === 'object' && !Array.isArray(fp) && 'user_id' in fp && fp.user_id !== userId)
              .map(fp => ({ user_id: fp.user_id, name: fp.full_name, avatar_url: fp.avatar_url }));
          }
        }
      }
      // Remove duplicates
      const uniqueContacts = Object.values(
        contactList.reduce((acc, c) => {
          acc[c.user_id] = c;
          return acc;
        }, {} as Record<string, any>)
      );
      console.log('Final contacts:', uniqueContacts);
      setContacts(uniqueContacts);
    };
    fetchContacts();
  }, [userId, userType]);

  // Fetch other users' info for chat display
  const fetchOtherUsersInfo = async (otherIds: string[]) => {
    let userMap: Record<string, { name?: string; email?: string }> = {};
    if (otherIds.length > 0) {
      // Try freelancer_profiles
      const { data: freelancers, error: fpError } = await supabase
        .from('freelancer_profiles')
        .select('user_id, full_name')
        .in('user_id', otherIds);
      console.log('Freelancer names:', freelancers, 'Error:', fpError);
      if (freelancers) {
        freelancers.forEach((f: any) => {
          userMap[f.user_id] = { name: f.full_name };
        });
      }
      // Try client_profiles
      const { data: clients, error: cpError } = await supabase
        .from('client_profiles')
        .select('user_id, company_name')
        .in('user_id', otherIds);
      console.log('Client names:', clients, 'Error:', cpError);
      if (clients) {
        clients.forEach((c: any) => {
          userMap[c.user_id] = { name: c.company_name };
        });
      }
    }
    return userMap;
  };

  // Fix chat display logic: always show correct name
  const getDisplayName = (otherId: string) => {
    const otherInfo = otherUsers[otherId];
    if (otherInfo?.name) return otherInfo.name;
    if (otherInfo?.email) return otherInfo.email;
    return 'Unknown User';
  };

  // Handler to start a new chat
  const handleStartChat = async (contact: any) => {
    if (!userId || !contact.user_id) return;
    // Check if chat exists
    const { data: existingChats } = await supabase
      .from('chats')
      .select('id, participant_one, participant_two')
      .or(`and(participant_one.eq.${userId},participant_two.eq.${contact.user_id}),and(participant_one.eq.${contact.user_id},participant_two.eq.${userId})`);
    let chatId = null;
    if (existingChats && existingChats.length > 0) {
      chatId = existingChats[0].id;
    } else {
      // Create chat
      const { data: newChat, error } = await supabase
        .from('chats')
        .insert([{ participant_one: userId, participant_two: contact.user_id }])
        .select('id, participant_one, participant_two')
        .single();
      if (newChat) chatId = newChat.id;
    }
    // Open the chat
    if (chatId) {
      // Refetch chats and select the new one
      await fetchChats();
      const chat = (chats || []).find(c => c.id === chatId);
      if (chat) setSelectedChat(chat);
    }
    setShowNewMessageModal(false);
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex rounded-lg overflow-hidden bg-white border border-gray-200">
      {error ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 font-semibold">{error}</p>
            <p className="text-gray-500 mt-2">User ID: {userId}</p>
            <p className="text-gray-500 mt-2">If you see this, please ensure your profile exists in the database.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Chats List */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search messages..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              </div>
              <button
                className="ml-2 px-3 py-1 bg-[#00704A] text-white rounded hover:bg-[#005538] text-sm"
                onClick={() => setShowNewMessageModal(true)}
              >
                New Message
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingChats ? (
                <div className="p-4 text-gray-500">Loading chats...</div>
              ) : chats.length === 0 ? (
                <div className="p-4 text-gray-500">No chats yet.</div>
              ) : (
                <ul>
                  {chats.map((chat) => {
                    const otherId = chat.participant_one === userId ? chat.participant_two : chat.participant_one;
                    const displayName = getDisplayName(otherId);
                    const isActive = activeChatUserIds.has(otherId);
                    return (
                      <li
                        key={chat.id}
                        className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100 ${selectedChat?.id === chat.id ? 'bg-gray-100' : ''}`}
                        onClick={() => setSelectedChat(chat)}
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold">
                          {displayName[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-semibold flex items-center gap-2">
                            {displayName}
                            {isActive && (
                              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">Active Contract</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400">{new Date(chat.created_at).toLocaleDateString()}</div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Chat Area */}
          {selectedChat ? (
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                {selectedChat && (
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold">
                      {(() => {
                        const otherId = selectedChat.participant_one === userId ? selectedChat.participant_two : selectedChat.participant_one;
                        const otherInfo = otherUsers[otherId];
                        const displayName = otherInfo?.name || otherInfo?.email || `Chat ${selectedChat.id.slice(-6)}`;
                        return displayName[0]?.toUpperCase() || 'U';
                      })()}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">
                        {(() => {
                          const otherId = selectedChat.participant_one === userId ? selectedChat.participant_two : selectedChat.participant_one;
                          const otherInfo = otherUsers[otherId];
                          return otherInfo?.name || otherInfo?.email || `Chat ${selectedChat.id.slice(-6)}`;
                        })()}
                      </div>
                      <div className="text-xs text-green-600">Online</div>
                    </div>
                    <Phone className="w-5 h-5 mx-2 cursor-pointer text-gray-400" />
                    <Video className="w-5 h-5 mx-2 cursor-pointer text-gray-400" />
                    <MoreVertical className="w-5 h-5 mx-2 cursor-pointer text-gray-400" />
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMessages ? (
                  <div className="text-gray-500">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-gray-500">No messages yet</div>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={msg.id || index}
                      className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          msg.sender_id === userId
                            ? 'bg-[#00704A] text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.sender_id === userId ? 'text-[#00704A]/75' : 'text-gray-500'}`}>
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <button type="button" className="p-2 hover:bg-gray-100 rounded-full">
                    <Paperclip size={20} className="text-gray-600" />
                  </button>
                  <button type="button" className="p-2 hover:bg-gray-100 rounded-full">
                    <ImageIcon size={20} className="text-gray-600" />
                  </button>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
                  />
                  <button type="button" className="p-2 hover:bg-gray-100 rounded-full">
                    <Smile size={20} className="text-gray-600" />
                  </button>
                  <button
                    type="submit"
                    className="p-2 bg-[#00704A] text-white rounded-full hover:bg-[#005538]"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">Select a chat to start messaging</p>
            </div>
          )}

          {/* New Message Modal */}
          {showNewMessageModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Start a New Message</h2>
                  <button onClick={() => setShowNewMessageModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {contacts.length === 0 ? (
                    <div className="text-gray-500">No contacts found.</div>
                  ) : (
                    <ul>
                      {contacts.map(contact => {
                        if (
                          contact &&
                          typeof contact === 'object' &&
                          !Array.isArray(contact) &&
                          'user_id' in contact
                        ) {
                          const c = contact as any;
                          return (
                            <li
                              key={c.user_id}
                              className="flex items-center gap-3 p-2 hover:bg-gray-100 cursor-pointer rounded"
                              onClick={() => handleStartChat(c)}
                            >
                              <img
                                src={c.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name || c.email || 'User')}`}
                                alt={c.name || c.email || 'User'}
                                className="w-8 h-8 rounded-full"
                              />
                              <span className="font-medium">{c.name || c.email || 'User'}</span>
                            </li>
                          );
                        }
                        return null;
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default MessagesPage