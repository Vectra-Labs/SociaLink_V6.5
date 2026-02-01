import { useState, useEffect, useRef } from 'react';
import {
    Send, Search, MoreVertical, Paperclip,
    Smile, Plus, CheckCircle, Check, Clock, User, Shield, Briefcase, Building2
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../hooks/useAuth';

const AdminMessages = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('internal'); // 'internal' | 'support'
    const [conversations, setConversations] = useState([]);
    const [filteredConversations, setFilteredConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    // Initial fetch
    useEffect(() => {
        fetchContacts();
        const interval = setInterval(() => {
            if (activeChat) fetchMessages(activeChat.user_id);
            fetchContacts(); // Refresh list for unread counts
        }, 5000); // Poll every 5s

        return () => clearInterval(interval);
    }, [activeChat, activeTab]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Filter conversations based on search
        if (!searchQuery) {
            setFilteredConversations(conversations);
        } else {
            setFilteredConversations(conversations.filter(c =>
                c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (c.first_name && c.first_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (c.last_name && c.last_name.toLowerCase().includes(searchQuery.toLowerCase()))
            ));
        }
    }, [searchQuery, conversations]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchContacts = async () => {
        try {
            // 1. Get Messages to determine recent contacts
            const msgsRes = await api.get('/super-admin/messages');
            const allMsgs = msgsRes.data;

            let potentialContacts = [];

            if (activeTab === 'internal') {
                // Fetch Admins & Super Admins
                const adminsRes = await api.get('/super-admin/admins');
                potentialContacts = adminsRes.data.filter(u => u.user_id !== user.user_id);
            } else {
                // For Support: We ideally need a list of users who have messaged us OR search results.
                // For MVP: We will assume we only show users we have history with + search result
                // But the helper `getAllUsers` does pagination, might be heavy.
                // WORKAROUND: We fetch active conversations from message history + allow searching for new users via separate API call if needed.
                // For "Projet de formation": Fetch first 100 users? Or just rely on message history?
                // Let's rely on message history + Search feature to find new users.

                // Extract unique user IDs involved in conversations with me
                const interactedUserIds = [...new Set(allMsgs.map(m =>
                    m.sender_id === user.user_id ? m.receiver_id : m.sender_id
                ))];

                // We need to fetch details for these users if we don't have them. 
                // Since our API for users is paginated, this is tricky.
                // We'll simplify: Fetch "Recent Users" endpoint or just standard users list but filtered.
                // As a fallback, we'll fetch all users (limit 50) and merge with interacted.

                // If we want to start a chat with a user not in list, search is key.
                const usersRes = await api.get('/super-admin/users?limit=100'); // Get top 100 users
                potentialContacts = usersRes.data.items.filter(u =>
                    (u.role === 'WORKER' || u.role === 'ESTABLISHMENT')
                );
            }

            // Process conversations (Merge contacts with message history)
            const processedConvos = potentialContacts.map(contact => {
                // Find interaction with this contact
                const interaction = allMsgs.filter(m =>
                    (m.sender_id === contact.user_id && m.receiver_id === user.user_id) ||
                    (m.sender_id === user.user_id && m.receiver_id === contact.user_id)
                ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]; // Get latest

                const unreadCount = allMsgs.filter(m =>
                    m.sender_id === contact.user_id &&
                    m.receiver_id === user.user_id &&
                    !m.is_read
                ).length;

                // For support tab, we only want to show if there is an interaction OR if explicitly searched (handled by filter)
                // BUT for contact list, we might want to show all admins ( Internal)
                // For Support, showing 100 random users is noise.
                // IMPROVEMENT: For Support tab, only show contacts with `interaction` OR if we are searching.

                if (activeTab === 'support' && !interaction && !searchQuery) return null;

                return {
                    ...contact,
                    lastMessage: interaction ? interaction.content : (activeTab === 'internal' ? 'Nouvelle conversation' : ''),
                    lastMessageTime: interaction ? new Date(interaction.created_at) : null,
                    unread: unreadCount,
                    online: true // Mock
                };
            }).filter(Boolean) // Remove nulls
                .sort((a, b) => {
                    // Sort by last message time
                    if (a.lastMessageTime && b.lastMessageTime) return b.lastMessageTime - a.lastMessageTime;
                    if (a.lastMessageTime) return -1;
                    if (b.lastMessageTime) return 1;
                    return 0;
                });

            setConversations(processedConvos);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching contacts", error);
            setLoading(false);
        }
    };

    const fetchMessages = async (partnerId) => {
        try {
            const res = await api.get(`/super-admin/messages?targetId=${partnerId}`);
            setMessages(res.data);

            // Mark as read locally
            setConversations(prev => prev.map(c =>
                c.user_id === partnerId ? { ...c, unread: 0 } : c
            ));

            // API call to mark read (fire and forget)
            api.post('/super-admin/messages/read-all', { senderId: partnerId });
        } catch (error) {
            console.error("Error fetching chat", error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;

        try {
            const res = await api.post('/super-admin/messages', {
                receiverId: activeChat.user_id,
                content: newMessage
            });

            setMessages(prev => [...prev, res.data]);
            setNewMessage('');
            fetchContacts(); // Update sidebar
        } catch (error) {
            console.error("Error sending message", error);
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'ADMIN': return <Shield className="w-4 h-4 text-blue-600" />;
            case 'SUPER_ADMIN': return <Shield className="w-4 h-4 text-purple-600" />;
            case 'WORKER': return <Briefcase className="w-4 h-4 text-green-600" />;
            case 'ESTABLISHMENT': return <Building2 className="w-4 h-4 text-orange-600" />;
            default: return <User className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <div className="flex h-[calc(100vh-140px)] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {/* Sidebar List */}
            <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50">
                {/* Tabs */}
                <div className="flex border-b border-slate-200 bg-white">
                    <button
                        onClick={() => { setActiveTab('internal'); setActiveChat(null); }}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'internal' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Interne
                    </button>
                    <button
                        onClick={() => { setActiveTab('support'); setActiveChat(null); }}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'support' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Support
                    </button>
                </div>

                <div className="p-4 border-b border-slate-200 bg-white">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder={activeTab === 'internal' ? "Chercher un admin..." : "Chercher un utilisateur..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-slate-500">Chargement...</div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            <p>Aucune conversation trouvée.</p>
                            {activeTab === 'support' && <p className="text-xs mt-2">Utilisez la recherche pour trouver un utilisateur.</p>}
                        </div>
                    ) : (
                        filteredConversations.map(contact => (
                            <button
                                key={contact.user_id}
                                onClick={() => {
                                    setActiveChat(contact);
                                    fetchMessages(contact.user_id);
                                }}
                                className={`w-full p-4 flex items-start gap-3 hover:bg-white hover:shadow-sm transition-all border-b border-slate-100 ${activeChat?.user_id === contact.user_id ? 'bg-blue-50 border-blue-100' : ''
                                    }`}
                            >
                                <div className="relative">
                                    {contact.avatar ? (
                                        <img src={contact.avatar || `https://ui-avatars.com/api/?name=${contact.first_name}+${contact.last_name}&background=random`} alt="" className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                                            {(contact.email || contact.first_name || '?')[0].toUpperCase()}
                                        </div>
                                    )}
                                    <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${contact.online ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <span className={`font-semibold text-sm truncate max-w-[100px] ${activeChat?.user_id === contact.user_id ? 'text-blue-900' : 'text-slate-900'}`}>
                                                {contact.first_name ? `${contact.first_name} ${contact.last_name}` : contact.email.split('@')[0]}
                                            </span>
                                            {getRoleIcon(contact.role)}
                                        </div>
                                        {contact.lastMessageTime && <span className="text-xs text-slate-400 whitespace-nowrap">{formatTime(contact.lastMessageTime)}</span>}
                                    </div>
                                    <p className={`text-xs truncate ${contact.unread > 0 ? 'font-bold text-slate-800' : 'text-slate-500'}`}>
                                        {contact.lastMessage || 'Aucun message'}
                                    </p>
                                </div>
                                {contact.unread > 0 && (
                                    <div className="bg-blue-600 text-white text-[10px] font-bold px-1.5 h-5 min-w-[1.25rem] flex items-center justify-center rounded-full">
                                        {contact.unread}
                                    </div>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {activeChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold overflow-hidden">
                                    {activeChat.avatar ?
                                        <img src={activeChat.avatar} className="w-full h-full object-cover" /> :
                                        (activeChat.email || activeChat.first_name || '?')[0].toUpperCase()
                                    }
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-slate-800">
                                            {activeChat.first_name ? `${activeChat.first_name} ${activeChat.last_name}` : activeChat.email}
                                        </h3>
                                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                                            {activeChat.role}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        <span className="text-xs text-slate-500">En ligne</span>
                                    </div>
                                </div>
                            </div>
                            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                            {messages.map((msg, idx) => {
                                const isMe = msg.sender_id === user.user_id;
                                return (
                                    <div key={msg.message_id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${isMe
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                                            }`}>
                                            <p className="text-sm">{msg.content}</p>
                                            <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                                                <span>{formatTime(msg.created_at)}</span>
                                                {isMe && (
                                                    msg.is_read ? <CheckCircle className="w-3 h-3" /> : <Check className="w-3 h-3" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-slate-200">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                <button type="button" className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="Écrivez votre message..."
                                        className="w-full pl-4 pr-10 py-3 bg-slate-100 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        <Smile className="w-5 h-5" />
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 transition-all"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <User className="w-10 h-10 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Messagerie Admin</h3>
                        <p className="text-slate-500 max-w-sm">
                            Sélectionnez un contact pour commencer. Utilisez la recherche pour trouver un utilisateur ou un administrateur.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminMessages;
