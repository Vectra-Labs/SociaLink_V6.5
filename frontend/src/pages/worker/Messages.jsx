import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../context/SocketContext';
import api from '../../api/client';
import {
    Search, Send, Paperclip, Phone, Video, MoreVertical, Check, CheckCheck,
    ArrowLeft, Menu, Bell, Flag, X, Lock
} from 'lucide-react';

export default function Messages() {
    const { user } = useAuth();
    const { isConnected, joinConversation, leaveConversation, sendMessage: socketSend, startTyping, stopTyping, on } = useSocket();

    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showMobileList, setShowMobileList] = useState(true);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [features, setFeatures] = useState({ audio_calls: false, video_calls: false });

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const inputRef = useRef(null);

    // Initial load
    useEffect(() => {
        fetchConversations();
        fetchFeatures();
    }, []);

    // Fetch feature flags from public API
    const fetchFeatures = async () => {
        try {
            const { data } = await api.get('/public/features');
            setFeatures(data);
        } catch (error) {
            // Silent fallback to defaults
        }
    };

    // Socket.io event listeners
    useEffect(() => {
        if (!isConnected) return;

        const unsubNewMessage = on('new_message', (data) => {
            if (data.conversationId === activeConversation?.id) {
                setMessages(prev => [...prev, {
                    message_id: Date.now(),
                    content: data.content,
                    sender_id: data.senderId,
                    created_at: data.timestamp,
                    is_read: false
                }]);
            } else {
                // Increment unread count for other conversations
                setUnreadCounts(prev => ({
                    ...prev,
                    [data.conversationId]: (prev[data.conversationId] || 0) + 1
                }));
            }
            fetchConversations();
        });

        const unsubTyping = on('user_typing', (data) => {
            if (data.conversationId === activeConversation?.id) {
                setIsTyping(true);
            }
        });

        const unsubStopTyping = on('user_stopped_typing', (data) => {
            if (data.conversationId === activeConversation?.id) {
                setIsTyping(false);
            }
        });

        return () => {
            unsubNewMessage?.();
            unsubTyping?.();
            unsubStopTyping?.();
        };
    }, [isConnected, activeConversation, on]);

    // Join/leave conversation rooms
    useEffect(() => {
        if (activeConversation && isConnected) {
            joinConversation(activeConversation.id);
            setShowMobileList(false);
            // Clear unread count
            setUnreadCounts(prev => ({ ...prev, [activeConversation.id]: 0 }));
        }
        return () => {
            if (activeConversation && isConnected) {
                leaveConversation(activeConversation.id);
            }
        };
    }, [activeConversation, isConnected]);

    // Load messages when active conversation changes
    useEffect(() => {
        if (activeConversation) {
            fetchMessages(activeConversation.id);
        }
    }, [activeConversation]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const { data } = await api.get('/messages/conversations');
            setConversations(data.data || []);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const fetchMessages = async (convId) => {
        try {
            const { data } = await api.get(`/messages/${convId}/messages`);
            setMessages(data.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    // Handle typing indicator
    const handleTyping = useCallback(() => {
        if (activeConversation && isConnected) {
            startTyping?.(activeConversation.id);

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
                stopTyping?.(activeConversation.id);
            }, 2000);
        }
    }, [activeConversation, isConnected, startTyping, stopTyping]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation || sending) return;

        const messageContent = newMessage.trim();
        setNewMessage('');
        setSending(true);

        // Optimistic update
        const optimisticMsg = {
            message_id: `temp-${Date.now()}`,
            content: messageContent,
            sender_id: user.user_id,
            is_read: false,
            created_at: new Date().toISOString(),
            sending: true
        };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            const { data } = await api.post('/messages', {
                conversationId: activeConversation.id,
                content: messageContent,
                receiverId: activeConversation.partner.id
            });

            // Emit via socket for real-time
            if (isConnected) {
                socketSend?.(activeConversation.id, messageContent);
            }

            // Replace optimistic message
            setMessages(prev => prev.map(m =>
                m.message_id === optimisticMsg.message_id
                    ? { ...data.data, sender_id: user.user_id }
                    : m
            ));

            fetchConversations();
        } catch (error) {
            console.error(error);
            setMessages(prev => prev.filter(m => m.message_id !== optimisticMsg.message_id));
        } finally {
            setSending(false);
            stopTyping?.(activeConversation.id);
        }
    };

    // Filter conversations
    const filteredConversations = conversations.filter(c =>
        c.partner.name.toLowerCase().includes(searchText.toLowerCase())
    );

    // Format time for sidebar
    const formatSidebarTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Hier';
        } else {
            return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        }
    };

    // Format message time
    const formatMessageTime = (dateStr) => {
        return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <div className="h-[calc(100vh-100px)] flex items-center justify-center bg-slate-50">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="bg-white h-[calc(100vh-100px)] flex overflow-hidden border border-slate-200 rounded-lg shadow-sm">
            {/* Sidebar - Conversation List */}
            <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col ${!showMobileList && activeConversation ? 'hidden md:flex' : 'flex'}`}>
                {/* Sidebar Header */}
                <div className="px-4 py-3 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 mb-3">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher une conversation..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.length > 0 ? (
                        filteredConversations.map(conv => {
                            const unread = unreadCounts[conv.id] || (conv.lastMessage?.isRead === false && !conv.lastMessage?.isMe);
                            const unreadCount = unreadCounts[conv.id] || (unread ? 1 : 0);

                            return (
                                <div
                                    key={conv.id}
                                    onClick={() => setActiveConversation(conv)}
                                    className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${activeConversation?.id === conv.id ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <div className="flex gap-3 items-start">
                                        {/* Avatar */}
                                        <div className="relative flex-shrink-0">
                                            {conv.partner.avatar ? (
                                                <img src={conv.partner.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                                                    {conv.partner.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                </div>
                                            )}
                                            {/* Online indicator */}
                                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <h3 className={`font-semibold text-sm truncate ${unread ? 'text-slate-900' : 'text-slate-700'}`}>
                                                    {conv.partner.name}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-slate-400">
                                                        {formatSidebarTime(conv.updatedAt)}
                                                    </span>
                                                    {unreadCount > 0 && (
                                                        <span className="min-w-[20px] h-5 px-1.5 bg-blue-600 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                                                            {unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-500 truncate">
                                                {conv.partner.subtitle}
                                            </p>
                                            <p className={`text-sm truncate mt-0.5 ${unread ? 'font-medium text-slate-800' : 'text-slate-500'}`}>
                                                {conv.lastMessage?.content || 'Nouvelle conversation'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-8 text-center text-slate-400 text-sm">
                            Aucune conversation
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            {activeConversation ? (
                <div className={`flex-1 flex flex-col bg-slate-50 ${showMobileList ? 'hidden md:flex' : 'flex'}`}>
                    {/* Chat Header */}
                    <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => { setActiveConversation(null); setShowMobileList(true); }}
                                className="md:hidden p-2 hover:bg-slate-100 rounded-lg -ml-2"
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </button>

                            {/* Partner Avatar */}
                            <div className="relative">
                                {activeConversation.partner.avatar ? (
                                    <img src={activeConversation.partner.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                                        {activeConversation.partner.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </div>
                                )}
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>

                            {/* Partner Info */}
                            <div>
                                <h3 className="font-semibold text-slate-900">{activeConversation.partner.name}</h3>
                                <p className="text-xs text-slate-500">
                                    {isTyping ? (
                                        <span className="text-blue-600">En train d'écrire...</span>
                                    ) : (
                                        activeConversation.partner.subtitle || 'En ligne'
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Header Actions */}
                        <div className="flex items-center gap-1">
                            {/* Audio Call Button */}
                            <div className="relative group">
                                <button
                                    disabled={!features.audio_calls}
                                    className={`p-2 rounded-lg relative ${features.audio_calls
                                        ? 'text-blue-600 hover:bg-blue-50 cursor-pointer'
                                        : 'text-slate-300 cursor-not-allowed'}`}
                                    title={features.audio_calls ? 'Démarrer un appel vocal' : 'Appel vocal - Bientôt disponible (Réservé aux abonnés)'}
                                    onClick={() => features.audio_calls && alert('Appel vocal - Fonctionnalité en cours de développement')}
                                >
                                    <Phone className="w-5 h-5" />
                                </button>
                                {!features.audio_calls && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                        <div className="flex items-center gap-1">
                                            <Lock className="w-3 h-3" />
                                            <span>Bientôt disponible • Abonnés</span>
                                        </div>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                    </div>
                                )}
                            </div>
                            {/* Video Call Button */}
                            <div className="relative group">
                                <button
                                    disabled={!features.video_calls}
                                    className={`p-2 rounded-lg ${features.video_calls
                                        ? 'text-purple-600 hover:bg-purple-50 cursor-pointer'
                                        : 'text-slate-300 cursor-not-allowed'}`}
                                    title={features.video_calls ? 'Démarrer un appel vidéo' : 'Appel vidéo - Bientôt disponible (Réservé aux abonnés)'}
                                    onClick={() => features.video_calls && alert('Appel vidéo - Fonctionnalité en cours de développement')}
                                >
                                    <Video className="w-5 h-5" />
                                </button>
                                {!features.video_calls && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                        <div className="flex items-center gap-1">
                                            <Lock className="w-3 h-3" />
                                            <span>Bientôt disponible • Abonnés</span>
                                        </div>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                    </div>
                                )}
                            </div>
                            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, idx) => {
                            const isMe = msg.sender_id === user.user_id;

                            return (
                                <div key={msg.message_id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] ${isMe ? 'order-1' : 'order-2'}`}>
                                        {/* Message Bubble */}
                                        <div
                                            className={`px-4 py-2.5 text-sm leading-relaxed ${isMe
                                                ? 'bg-blue-600 text-white rounded-2xl rounded-br-md'
                                                : 'bg-white text-slate-800 rounded-2xl rounded-bl-md shadow-sm border border-slate-100'
                                                } ${msg.sending ? 'opacity-70' : ''}`}
                                        >
                                            {msg.content}
                                        </div>

                                        {/* Timestamp */}
                                        <div className={`flex items-center gap-1 mt-1 text-xs text-slate-400 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <span>{formatMessageTime(msg.created_at)}</span>
                                            {isMe && (
                                                msg.sending ? (
                                                    <span className="text-slate-300">•</span>
                                                ) : msg.is_read ? (
                                                    <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                                                ) : (
                                                    <Check className="w-3.5 h-3.5" />
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="flex items-center gap-2">
                                <div className="px-4 py-2.5 bg-white rounded-2xl rounded-bl-md shadow-sm border border-slate-100">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="bg-white px-4 py-3 border-t border-slate-200">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                            <button type="button" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                <Paperclip className="w-5 h-5" />
                            </button>

                            <input
                                ref={inputRef}
                                type="text"
                                className="flex-1 px-4 py-2.5 bg-slate-100 border-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                placeholder="Écrire un message..."
                                value={newMessage}
                                onChange={(e) => {
                                    setNewMessage(e.target.value);
                                    handleTyping();
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                            />

                            <button
                                type="submit"
                                disabled={!newMessage.trim() || sending}
                                className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                /* Empty State */
                <div className="flex-1 hidden md:flex flex-col items-center justify-center text-center bg-slate-50 p-8">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                        <Send className="w-10 h-10 text-blue-500 ml-1" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Vos Messages</h2>
                    <p className="text-slate-500 max-w-md">
                        Sélectionnez une conversation pour commencer à discuter.
                    </p>
                </div>
            )}
        </div>
    );
}
