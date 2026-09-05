'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';

interface Message {
  id: number;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: number;
  buyer_name: string;
  buyer_avatar: string;
  product_name: string;
  product_image: string;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params?.id as string;

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [productPrice, setProductPrice] = useState<string>('');
  const [dynamicStoreName, setDynamicStoreName] = useState<string>('');
  const [storeLogoUrl, setStoreLogoUrl] = useState<string>('');
  const [isQuickAnswerOpen, setIsQuickAnswerOpen] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!conversationId) return;

    const fetchConversation = async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (!error && data) {
        setConversation(data);
      } else {
        console.error('Gagal mengambil conversation:', error?.message);
      }
    };

    fetchConversation();
  }, [conversationId]);

  useEffect(() => {
    if (!conversation?.product_id) return;

    const fetchProductPrice = async () => {
      const { data } = await supabase
        .from('products')
        .select('price')
        .eq('id', conversation.product_id)
        .single();

      if (data) {
        setProductPrice(
          typeof data.price === 'number'
            ? `Rp. ${data.price.toLocaleString('id-ID')}`
            : data.price
        );
      }
    };

    fetchProductPrice();
  }, [conversation]);

  useEffect(() => {
    if (!conversation?.seller_id) return;

    const fetchStoreName = async () => {
      const { data: storeData, error } = await supabase
        .from('store_settings')
        .select('store_name, logo_url')
        .eq('user_id', conversation.seller_id)
        .maybeSingle();

      if (storeData) {
        setDynamicStoreName(storeData.store_name || '');
        setStoreLogoUrl(storeData.logo_url || '');
      } else if (error) {
        console.error('Gagal mengambil store settings:', error.message);
      }
    };

    fetchStoreName();

    const storeChannel = supabase
      .channel(`store_settings_${conversation.seller_id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'store_settings',
          filter: `user_id=eq.${conversation.seller_id}`,
        },
        (payload: any) => {
          const updated = payload.new;
          if (updated) {
            if (updated.store_name) setDynamicStoreName(updated.store_name);
            setStoreLogoUrl(updated.logo_url || '');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(storeChannel);
    };
  }, [conversation]);

  const isBuyerView = currentUser && conversation && currentUser.id === conversation.buyer_id;
  const headerName = conversation
    ? (isBuyerView ? dynamicStoreName || 'Narayana Store' : conversation.buyer_name || 'Pembeli')
    : '';
  const headerAvatar = conversation
    ? (isBuyerView ? storeLogoUrl : conversation.buyer_avatar)
    : '';

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error.message);
      }
      if (!error && data) {
        setMessages(data);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel(`room_conversation_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((msg) => msg.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    if (!currentUser) {
      alert('Silakan login terlebih dahulu untuk mengirim pesan.');
      return;
    }
    if (!conversationId) return;

    const { error } = await supabase.from('messages').insert([
      {
        conversation_id: conversationId,
        sender_id: currentUser.id,
        content: textToSend,
        is_read: false,
      },
    ]);

    if (error) {
      alert('Gagal mengirim pesan: ' + error.message);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const textToSend = inputText;
    setInputText('');
    await handleSendMessage(textToSend);
  };

  const handleQuickQuestion = async (questionText: string) => {
    await handleSendMessage(questionText);
  };

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    if (isToday) return 'Hari ini';
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  let lastDateLabel = '';

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 flex flex-col">
      <header className="w-full bg-white/95 backdrop-blur-sm border-b border-slate-200 px-3 sm:px-6 lg:px-10 py-3 sm:py-4 flex items-center sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2.5 sm:gap-4 max-w-5xl mx-auto w-full">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#059669] text-white rounded-xl font-semibold text-xs sm:text-sm hover:bg-emerald-700 hover:scale-[1.03] active:scale-[0.98] duration-200 transition-all shadow-sm"
          >
            <span>← Kembali</span>
          </button>
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center font-bold text-[#047857] text-sm flex-shrink-0 overflow-hidden ring-2 ring-white shadow">
            {headerAvatar ? (
              <img src={headerAvatar} alt={headerName} className="w-full h-full object-cover" />
            ) : (
              headerName.charAt(0) || '?'
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-500 rounded-full ring-2 ring-white"></span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm sm:text-base lg:text-lg font-bold text-black/85 truncate leading-tight">
              {headerName || 'Memuat...'}
            </span>
            <span className="text-[10px] sm:text-xs text-emerald-600 font-medium">Aktif</span>
          </div>
        </div>
      </header>

      <div className="sticky top-[61px] sm:top-[73px] lg:top-[81px] z-20 w-full px-3 sm:px-6 lg:px-10 pt-3">
        <div className="max-w-5xl mx-auto w-full bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 lg:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-[70px] lg:h-[70px] rounded-xl bg-slate-100 flex items-center justify-center font-semibold text-black/30 text-[10px] flex-shrink-0 border border-slate-200 overflow-hidden">
              {conversation?.product_image ? (
                <img src={conversation.product_image} alt={conversation.product_name} className="w-full h-full object-cover" />
              ) : (
                <span>PRODUK</span>
              )}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-[11px] text-black/40 block font-medium mb-0.5">
                Kamu menanyakan tentang produk ini
              </span>
              <h2 className="text-xs sm:text-sm lg:text-base font-bold text-black/85 line-clamp-1">
                {conversation?.product_name || 'Memuat...'}
              </h2>
              <span className="text-sm sm:text-base lg:text-lg font-extrabold text-[#059669]">
                {productPrice}
              </span>
            </div>
          </div>

          {conversation?.product_id && (
            <Link
              href={`/product/${conversation.product_id}`}
              className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-[#059669] text-white rounded-xl font-semibold text-xs sm:text-sm hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.97] duration-200 transition-all text-center shadow-md flex-shrink-0"
            >
              Beli Sekarang
            </Link>
          )}
        </div>
      </div>

      <main className="w-full flex-1 max-w-5xl mx-auto px-3 sm:px-6 lg:px-10 pt-4 pb-3 flex flex-col justify-between">
        <div className="flex-1 space-y-1 py-2">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-50 flex items-center justify-center text-2xl sm:text-3xl mb-4">
                💬
              </div>
              <p className="text-black/40 text-xs sm:text-sm">
                Belum ada pesan. Mulai obrolan sekarang!
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = currentUser && msg.sender_id === currentUser.id;
              const currentLabel = formatDateLabel(msg.created_at);
              const showDateDivider = currentLabel !== lastDateLabel;
              lastDateLabel = currentLabel;

              return (
                <React.Fragment key={msg.id}>
                  {showDateDivider && (
                    <div className="flex items-center justify-center py-3">
                      <span className="text-[10px] sm:text-[11px] font-semibold text-black/40 bg-white border border-slate-200 rounded-full px-3 py-1 shadow-sm">
                        {currentLabel}
                      </span>
                    </div>
                  )}
                  <div className={`flex w-full mb-2.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[82%] sm:max-w-[65%] lg:max-w-[55%] px-4 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                        isMine
                          ? 'bg-white border border-slate-200 text-black/80 rounded-br-md'
                          : 'bg-[#059669] text-white rounded-bl-md font-medium'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <span
                        className={`block text-[9px] sm:text-[10px] mt-1.5 text-right ${
                          isMine ? 'text-black/35' : 'text-emerald-100'
                        }`}
                      >
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          )}
        </div>

        <div className="sticky bottom-3 left-0 right-0 bg-white border border-slate-200 rounded-2xl p-2.5 sm:p-3.5 lg:p-4 shadow-[0_4px_24px_rgba(0,0,0,0.08)] flex flex-col gap-2 mt-4">
          <div className="flex items-center justify-between px-1 pb-1.5 border-b border-slate-100">
            <span className="text-[11px] sm:text-xs font-bold text-black/60 flex items-center gap-1.5">
              <span>⚡</span> Quick Question
            </span>
            <button
              type="button"
              onClick={() => setIsQuickAnswerOpen(!isQuickAnswerOpen)}
              className="text-[11px] sm:text-xs font-semibold text-[#059669] hover:underline flex items-center gap-1"
            >
              {isQuickAnswerOpen ? 'Tutup ▴' : 'Buka ▾'}
            </button>
          </div>

          {isQuickAnswerOpen && (
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1.5 sm:gap-2 pb-2 border-b border-slate-100">
              <button
                type="button"
                onClick={() => handleQuickQuestion("Halo, apakah barangnya masih ada?")}
                className="sm:flex-1 sm:min-w-[180px] text-left px-3 py-2 bg-slate-50 hover:bg-[#059669] hover:text-white text-black/70 rounded-lg text-[11px] sm:text-xs font-medium transition-all duration-200 border border-slate-200 active:scale-[0.98] flex items-center justify-between gap-2 group"
              >
                <span className="truncate">Halo, apakah barangnya masih ada?</span>
                <span className="text-black/30 group-hover:text-white transition-colors flex-shrink-0">⤴</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickQuestion("Bisa kurang harganya kak?")}
                className="sm:flex-1 sm:min-w-[180px] text-left px-3 py-2 bg-slate-50 hover:bg-[#059669] hover:text-white text-black/70 rounded-lg text-[11px] sm:text-xs font-medium transition-all duration-200 border border-slate-200 active:scale-[0.98] flex items-center justify-between gap-2 group"
              >
                <span className="truncate">Bisa kurang harganya kak?</span>
                <span className="text-black/30 group-hover:text-white transition-colors flex-shrink-0">⤴</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickQuestion("Kapan pesanan ini bisa dikirim?")}
                className="sm:flex-1 sm:min-w-[180px] text-left px-3 py-2 bg-slate-50 hover:bg-[#059669] hover:text-white text-black/70 rounded-lg text-[11px] sm:text-xs font-medium transition-all duration-200 border border-slate-200 active:scale-[0.98] flex items-center justify-between gap-2 group"
              >
                <span className="truncate">Kapan pesanan ini bisa dikirim?</span>
                <span className="text-black/30 group-hover:text-white transition-colors flex-shrink-0">⤴</span>
              </button>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tulis pesan..."
              className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-black/80 focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-emerald-100 transition-all"
            />
            <button
              type="submit"
              aria-label="Kirim pesan"
              className="w-10 h-10 sm:w-12 sm:h-12 bg-[#059669] text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 hover:scale-[1.05] active:scale-[0.95] duration-200 transition-all shadow-md flex-shrink-0 font-bold text-sm sm:text-base"
            >
              ➔
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}