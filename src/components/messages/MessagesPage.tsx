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

function MessagesPage() {
  // ...existing state
  const [otherUsers, setOtherUsers] = useState<Record<string, { name?: string; email?: string }>>({});
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
      console.log('Fetched user:', user);
    };
    getUser();
  }, []);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (userId) {
      fetchChats();
    }
  }, [userId]);

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
      console.log('Chats fetched:', data, 'Error:', error);
      if (error) throw error;
      setChats(data || []);
      // Fetch other users' info
      const otherIds = data.flatMap((chat) => [chat.participant_one, chat.participant_two]).filter((id) => id !== userId);
      // Fetch names from both freelancer_profiles and client_profiles
      let userMap: Record<string, { name?: string; email?: string }> = {};
      if (otherIds.length > 0) {
        // Fetch freelancer names
        const { data: freelancers } = await supabase
          .from('freelancer_profiles')
          .select('user_id, full_name')
          .in('user_id', otherIds);
        if (freelancers) {
          freelancers.forEach((f: any) => {
            userMap[f.user_id] = { name: f.full_name };
          });
        }
        // Fetch client names
        const { data: clients } = await supabase
          .from('client_profiles')
          .select('user_id, company_name')
          .in('user_id', otherIds);
        if (clients) {
          clients.forEach((c: any) => {
            userMap[c.user_id] = { name: c.company_name };
          });
        }
        // Fetch emails as fallback
        const { data: usersData } = await supabase
          .from('users')
          .select('id, email')
          .in('id', otherIds);
        if (usersData) {
          usersData.forEach((u: any) => {
            if (!userMap[u.id]) userMap[u.id] = {};
            userMap[u.id].email = u.email;
          });
        }
      }
      setOtherUsers(userMap);
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

  return (
    <div className="h-[calc(100vh-6rem)] flex rounded-lg overflow-hidden bg-white border border-gray-200">
      {/* Chats List */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
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
                const otherInfo = otherUsers[otherId];
                const displayName = otherInfo?.name || otherInfo?.email || `Chat ${chat.id.slice(-6)}`;
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
                      <div className="font-semibold">
                        {displayName}
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
    </div>
  )
}

const chats = [
  {
    id: 1,
    name: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    lastMessage: 'Looking forward to our meeting tomorrow!',
    lastMessageTime: '2m ago',
    unread: 2,
    messages: [
      { text: 'Hi, how are you?', time: '10:00 AM', sent: false },
      { text: 'I\'m good, thanks! How about you?', time: '10:02 AM', sent: true },
      { text: 'Looking forward to our meeting tomorrow!', time: '10:05 AM', sent: false }
    ]
  },
  {
    id: 2,
    name: 'Michael Chen',
    avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    lastMessage: 'The project is coming along nicely',
    lastMessageTime: '1h ago',
    unread: 0,
    messages: [
      { text: 'How\'s the project going?', time: '9:30 AM', sent: false },
      { text: 'The project is coming along nicely', time: '9:35 AM', sent: true }
    ]
  },
  {
    id: 3,
    name: 'Emma Wilson',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    lastMessage: 'Can you review the latest designs?',
    lastMessageTime: '3h ago',
    unread: 1,
    messages: [
      { text: 'Can you review the latest designs?', time: '8:00 AM', sent: false },
      { text: 'I\'ll take a look right away', time: '8:05 AM', sent: true }
    ]
  }
]

export default MessagesPage