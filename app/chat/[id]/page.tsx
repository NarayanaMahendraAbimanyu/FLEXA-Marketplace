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

  // Ambil user yang sedang login
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUser(user);
    };
    fetchUser();
  }, []);

  // Ambil data conversation
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

  // Ambil harga produk (tidak tersimpan di conversations, jadi fetch terpisah)
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

  // Ambil nama & logo toko seller, plus subscribe perubahan realtime
  useEffect(() => {
    if (!conversation?.seller_id) return;

    const fetchStoreName = async () => {
      const { data: storeData } = await supabase
        .from('store_settings')
        .select('store_name, logo_url')
        .eq('user_id', conversation.seller_id)
        .single();

      if (storeData) {
        setDynamicStoreName(storeData.store_name || 'Toko Seller');
        setStoreLogoUrl(storeData.logo_url || '');
      }
    };

    fetchStoreName();

    const storeChannel = supabase
      .channel(`store_settings_${conversation.seller_id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'store_settings',
          filter: `user_id=eq.${conversation.seller_id}`,
        },
        (payload) => {
          const updated = payload.new;
          if (updated.store_name) setDynamicStoreName(updated.store_name);
          setStoreLogoUrl(updated.logo_url || '');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(storeChannel);
    };
  }, [conversation]);

  // Tentukan siapa "lawan bicara" — kalau user login = buyer, tampilkan toko seller.
  // Kalau user login = seller, tampilkan nama buyer.
  const isBuyerView = currentUser && conversation && currentUser.id === conversation.buyer_id;
  const headerName = conversation
    ? (isBuyerView ? dynamicStoreName || 'Toko Seller' : conversation.buyer_name || 'Pembeli')
    : '';
  const headerAvatar = conversation
    ? (isBuyerView ? storeLogoUrl : conversation.buyer_avatar)
    : '';

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');

  // Ambil pesan & subscribe realtime, difilter per conversation_id
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

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col">
      <header className="w-full bg-white border-b border-[#059669]/30 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3 sm:gap-4 max-w-7xl mx-auto w-full">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#059669] text-white rounded-xl font-semibold text-xs sm:text-sm hover:bg-emerald-700 hover:scale-[1.03] active:scale-[0.98] duration-200 transition-all shadow-sm"
          >
            <span>← Kembali</span>
          </button>
          <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-full bg-slate-200 flex items-center justify-center font-bold text-black/60 text-xs sm:text-sm flex-shrink-0 overflow-hidden">
            {headerAvatar ? (
              <img src={headerAvatar} alt={headerName} className="w-full h-full object-cover" />
            ) : (
              headerName.charAt(0) || '?'
            )}
          </div>
          <span className="text-sm sm:text-base lg:text-lg font-bold text-black/80 truncate">
            {headerName || 'Memuat...'}
          </span>
        </div>
      </header>

      <div className="sticky top-[57px] sm:top-[73px] z-20 w-full bg-slate-50 px-3 sm:px-6 lg:px-8 pt-3 pb-2">
        <div className="max-w-4xl mx-auto w-full bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] sm:text-xs text-black/50 block font-medium">
              Kamu menanyakan tentang produk ini.
            </span>
            <div className="flex items-center gap-3 pt-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-black/40 text-xs flex-shrink-0 border border-slate-200 overflow-hidden">
                {conversation?.product_image ? (
                  <img src={conversation.product_image} alt={conversation.product_name} className="w-full h-full object-cover" />
                ) : (
                  <span>PRODUK</span>
                )}
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-black/80 line-clamp-1">
                  {conversation?.product_name || 'Memuat...'}
                </h2>
                <span className="text-xs sm:text-lg font-bold text-[#059669]">
                  {productPrice}
                </span>
              </div>
            </div>
          </div>

          {conversation?.product_id && (
            <Link
              href={`/product/${conversation.product_id}`}
              className="w-full sm:w-auto px-4 py-2 bg-[#059669] text-white rounded-lg font-medium text-xs sm:text-sm hover:bg-emerald-700 hover:scale-[1.03] active:scale-[0.98] duration-200 transition-all text-center shadow-sm flex-shrink-0"
            >
              Beli Sekarang
            </Link>
          )}
        </div>
      </div>

      <main className="w-full flex-1 max-w-4xl mx-auto p-3 sm:p-6 lg:p-8 flex flex-col justify-between space-y-6">
        <div className="space-y-6">
          <div className="space-y-4 py-2">
            {messages.length === 0 ? (
              <div className="text-center py-10 text-black/40 text-xs sm:text-sm italic">
                Belum ada pesan. Mulai obrolan sekarang!
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = currentUser && msg.sender_id === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs sm:text-sm shadow-sm ${
                        isMine
                          ? 'bg-white border border-slate-200 text-black/80 rounded-br-none'
                          : 'bg-[#059669] text-white rounded-bl-none font-medium'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <span
                        className={`block text-[10px] mt-1 text-right ${
                          isMine ? 'text-black/40' : 'text-emerald-100'
                        }`}
                      >
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="sticky bottom-3 left-0 right-0 bg-white border border-slate-200 rounded-2xl p-2 sm:p-3 shadow-lg flex flex-col gap-2">
          <div className="flex flex-col gap-1.5 pb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={() => handleQuickQuestion("Halo, apakah barangnya masih ada?")}
              className="w-full text-left px-3 py-2 bg-slate-50 hover:bg-[#059669] hover:text-white text-black/70 rounded-lg text-xs sm:text-xs font-normal transition-all duration-200 border border-slate-200 active:scale-[0.99] flex items-center justify-between group"
            >
              <span>Halo, apakah barangnya masih ada?</span>
              <span className="text-black/40 group-hover:text-white transition-colors">⤴</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickQuestion("Bisa kurang harganya kak?")}
              className="w-full text-left px-3 py-2 bg-slate-50 hover:bg-[#059669] hover:text-white text-black/70 rounded-lg text-xs sm:text-xs font-normal transition-all duration-200 border border-slate-200 active:scale-[0.99] flex items-center justify-between group"
            >
              <span>Bisa kurang harganya kak?</span>
              <span className="text-black/40 group-hover:text-white transition-colors">⤴</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickQuestion("Kapan pesanan ini bisa dikirim?")}
              className="w-full text-left px-3 py-2 bg-slate-50 hover:bg-[#059669] hover:text-white text-black/70 rounded-lg text-xs sm:text-xs font-normal transition-all duration-200 border border-slate-200 active:scale-[0.99] flex items-center justify-between group"
            >
              <span>Kapan pesanan ini bisa dikirim?</span>
              <span className="text-black/40 group-hover:text-white transition-colors">⤴</span>
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tulis pesan..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-black/80 focus:outline-none focus:border-[#059669]"
            />
            <button
              type="submit"
              className="w-10 h-10 sm:w-11 sm:h-11 bg-[#059669] text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 hover:scale-[1.05] active:scale-[0.95] duration-200 transition-all shadow-md flex-shrink-0 font-bold"
            >
              ➔
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}