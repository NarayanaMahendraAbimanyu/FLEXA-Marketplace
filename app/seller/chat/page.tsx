'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: number | null;
  buyer_name: string;
  buyer_avatar: string;
  product_name: string;
  product_image: string;
  last_message: string;
  last_message_at: string;
  unread_count?: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export default function SellerChatPage() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isNotifAnimatingOut, setIsNotifAnimatingOut] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedConversationRef = useRef<Conversation | null>(null);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    initUser();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    fetchConversations(currentUserId);

    const conversationChannel = supabase
      .channel('seller-conversations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations', filter: `seller_id=eq.${currentUserId}` },
        () => {
          fetchConversations(currentUserId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationChannel);
    };
  }, [currentUserId]);

  useEffect(() => {
    if (!selectedConversation) return;
    fetchMessages(selectedConversation.id);
    markAsRead(selectedConversation.id);

    const messageChannel = supabase
      .channel(`messages-${selectedConversation.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selectedConversation.id}` },
        (payload) => {
          const incoming = payload.new as Message;
          setMessages((prev) => (prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]));
          if (incoming.sender_id !== currentUserId) {
            markAsRead(selectedConversation.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
    };
  }, [selectedConversation, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const triggerNotification = (message: string, type: 'success' | 'error') => {
    setIsNotifAnimatingOut(false);
    setNotification({ message, type });
    setTimeout(() => {
      setIsNotifAnimatingOut(true);
      setTimeout(() => {
        setNotification(null);
        setIsNotifAnimatingOut(false);
      }, 300);
    }, 3000);
  };

  const initUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
  };

  const fetchConversations = async (userId: string) => {
    setLoadingConversations(true);
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('seller_id', userId)
      .order('last_message_at', { ascending: false });

    if (!error && data) {
      const withUnread = await Promise.all(
        data.map(async (conv) => {
          const { count } = await supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_id', userId);
          return { ...conv, unread_count: count || 0 };
        })
      );
      setConversations(withUnread);
    }
    setLoadingConversations(false);
  };

  const fetchMessages = async (conversationId: string) => {
    setLoadingMessages(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (!error && data) setMessages(data);
    setLoadingMessages(false);
  };

  const markAsRead = async (conversationId: string) => {
    if (!currentUserId) return;
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', currentUserId)
      .eq('is_read', false);

    setConversations((prev) => prev.map((c) => (c.id === conversationId ? { ...c, unread_count: 0 } : c)));
  };

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    setMobileView('chat');
  };

  const handleBackToList = () => {
    setMobileView('list');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !currentUserId || sending) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage('');

    const { error: msgError } = await supabase.from('messages').insert([
      {
        conversation_id: selectedConversation.id,
        sender_id: currentUserId,
        content,
      },
    ]);

    if (!msgError) {
      const nowIso = new Date().toISOString();
      await supabase
        .from('conversations')
        .update({ last_message: content, last_message_at: nowIso })
        .eq('id', selectedConversation.id);

      setConversations((prev) => {
        const updated = prev.map((c) =>
          c.id === selectedConversation.id ? { ...c, last_message: content, last_message_at: nowIso } : c
        );
        return updated.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
      });
    } else {
      triggerNotification('Gagal mengirim pesan.', 'error');
      setNewMessage(content);
    }
    setSending(false);
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="w-full px-2 sm:px-2 lg:px-2 relative font-poppins">
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <div
            className={`px-6 py-3 rounded-xl shadow-lg text-white font-medium text-sm flex items-center gap-3 transition-all duration-300 transform ${
              notification.type === 'success' ? 'bg-[#059669]' : 'bg-red-600'
            } ${isNotifAnimatingOut ? '-translate-y-20 opacity-0' : ''}`}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <main className="flex-1 min-h-screen">
        <div className="w-full max-w-7xl mx-auto">
          <div className="mb-8 border-b border-black/30 pb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black/85">Pesan</h1>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-10 h-[70vh] min-h-[480px]">
            <div className="flex h-full">
              {/* Daftar percakapan */}
              <div
                className={`${
                  mobileView === 'chat' ? 'hidden' : 'flex'
                } sm:flex w-full sm:w-[320px] border-r border-slate-200 flex-col shrink-0`}
              >
                <div className="px-5 py-4 border-b border-slate-100">
                  <p className="text-sm font-semibold text-black/70">Semua Percakapan</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {loadingConversations ? (
                    <div className="p-5 text-sm text-black/40 text-center">Memuat percakapan...</div>
                  ) : conversations.length === 0 ? (
                    <div className="p-5 text-sm text-black/40 text-center">Belum ada pesan masuk.</div>
                  ) : (
                    conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => handleSelectConversation(conv)}
                        className={`w-full text-left px-5 py-4 flex items-start gap-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                          selectedConversation?.id === conv.id ? 'bg-emerald-50' : ''
                        }`}
                      >
                        {conv.buyer_avatar ? (
                          <img
                            src={conv.buyer_avatar}
                            alt={conv.buyer_name}
                            className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-[#e5e7eb] border border-slate-200 flex items-center justify-center shrink-0">
                            <span className="text-xs font-semibold text-slate-500">
                              {conv.buyer_name ? conv.buyer_name.charAt(0).toUpperCase() : '?'}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-sm text-black/80 truncate">{conv.buyer_name || 'Pembeli'}</p>
                            <span className="text-[10px] text-black/40 shrink-0">{formatTime(conv.last_message_at)}</span>
                          </div>
                          <p className="text-xs text-black/50 truncate mt-0.5">{conv.product_name}</p>
                          <div className="flex items-center justify-between gap-2 mt-1">
                            <p className="text-xs text-black/60 truncate">{conv.last_message || 'Belum ada pesan'}</p>
                            {!!conv.unread_count && (
                              <span className="bg-[#059669] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shrink-0">
                                {conv.unread_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Detail percakapan */}
              <div className={`${mobileView === 'list' ? 'hidden' : 'flex'} sm:flex flex-1 flex-col`}>
                {selectedConversation ? (
                  <>
                    <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                      <button onClick={handleBackToList} className="sm:hidden text-black/60 shrink-0" aria-label="Kembali">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      {selectedConversation.product_image ? (
                        <img
                          src={selectedConversation.product_image}
                          alt={selectedConversation.product_name}
                          className="w-10 h-10 rounded-lg object-cover bg-[#e5e7eb] border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#e5e7eb] border border-slate-200 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-black/80 truncate">{selectedConversation.buyer_name || 'Pembeli'}</p>
                        <p className="text-xs text-black/50 truncate">{selectedConversation.product_name}</p>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 bg-slate-50/50">
                      {loadingMessages ? (
                        <div className="text-sm text-black/40 text-center">Memuat pesan...</div>
                      ) : messages.length === 0 ? (
                        <div className="text-sm text-black/40 text-center">Mulai percakapan dengan pembeli.</div>
                      ) : (
                        messages.map((msg) => {
                          const isMine = msg.sender_id === currentUserId;
                          return (
                            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                              <div
                                className={`max-w-[75%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                                  isMine
                                    ? 'bg-[#059669] text-white rounded-br-sm'
                                    : 'bg-white border border-slate-200 text-black/80 rounded-bl-sm'
                                }`}
                              >
                                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                <p className={`text-[10px] mt-1 ${isMine ? 'text-white/70' : 'text-black/40'}`}>
                                  {formatTime(msg.created_at)}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="px-4 sm:px-6 py-4 border-t border-slate-200 flex items-center gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Tulis pesan..."
                        className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all shrink-0 ${
                          newMessage.trim() && !sending
                            ? 'bg-[#059669] hover:bg-[#047857] hover:scale-105 active:scale-95 duration-200'
                            : 'bg-slate-300 cursor-not-allowed'
                        }`}
                      >
                        Kirim
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center px-6 text-center">
                    <p className="text-sm text-black/40">Pilih percakapan di sebelah kiri untuk mulai membalas.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}