'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PRODUCTS, Product } from '../../data/products';
import { supabase } from '../../../lib/supabaseClient';

interface Message {
  id: number;
  sender: 'user' | 'seller';
  text: string;
  time: string;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params?.id);

  const foundProduct: Product | undefined = PRODUCTS.find((p) => p.id === productId);
  const [dbProduct, setDbProduct] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [dynamicStoreName, setDynamicStoreName] = useState<string>('');
  const [storeLogoUrl, setStoreLogoUrl] = useState<string>('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchDbProduct = async () => {
      if (!productId) return;
      if (!foundProduct) {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (!error && data) {
          console.log('DATA MENTAH PRODUK DARI SUPABASE:', data);
          setDbProduct(data);
        }
      }
    };
    fetchDbProduct();
  }, [productId, foundProduct]);

  const activeProduct = foundProduct || dbProduct;

  useEffect(() => {
  const ownerId = activeProduct ? (activeProduct.user_id || activeProduct.store_id) : undefined;

  const fetchStoreName = async () => {
    if (!activeProduct) return;

    if (ownerId) {
      const { data: storeData } = await supabase
        .from('store_settings')
        .select('store_name, logo_url')
        .eq('user_id', ownerId)
        .single();

      if (storeData) {
        setDynamicStoreName(storeData.store_name || activeProduct.storeName || activeProduct.store_name || 'Name Shop');
        setStoreLogoUrl(storeData.logo_url || '');
        return;
      }
    }

    setDynamicStoreName(activeProduct.storeName || activeProduct.store_name || 'Name Shop');
    setStoreLogoUrl('');
  };

  fetchStoreName();

  if (!ownerId) return;

  const storeChannel = supabase
    .channel(`store_settings_${ownerId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'store_settings',
        filter: `user_id=eq.${ownerId}`,
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
}, [activeProduct]);

  const rawImageUrl = activeProduct 
    ? (activeProduct.image_url || activeProduct.imageUrl || activeProduct.image || activeProduct.photo || activeProduct.photo_url || activeProduct.img || activeProduct.thumbnail || activeProduct.image_path)
    : undefined;

  const product = {
    id: activeProduct ? activeProduct.id : 1,
    title: activeProduct ? (activeProduct.title || activeProduct.name || 'Name of Product') : 'Name of Product',
    storeName: dynamicStoreName || 'Name Shop',
    price: activeProduct
      ? (typeof activeProduct.price === 'number' ? `Rp. ${activeProduct.price.toLocaleString('id-ID')}` : activeProduct.price)
      : 'Rp. 50.000,00',
    imageText: activeProduct ? (activeProduct.imageText || activeProduct.title || activeProduct.name || 'PRODUK') : 'PRODUK',
    imageUrl: rawImageUrl,
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (!productId || !currentUser) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error.message);
      }

      if (!error && data) {
        const formattedMessages: Message[] = data.map((item) => ({
          id: item.id,
          sender: item.sender,
          text: item.text,
          time: new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));
        setMessages(formattedMessages);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel(`room_product_${productId}_user_${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `product_id=eq.${productId}`,
        },
        (payload) => {
          const newItem = payload.new;
          if (newItem.user_id !== currentUser.id) return;

          const newMsg: Message = {
            id: newItem.id,
            sender: newItem.sender,
            text: newItem.text,
            time: new Date(newItem.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

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
  }, [productId, currentUser]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (!currentUser) {
      alert('Silakan login terlebih dahulu untuk mengirim pesan.');
      return;
    }

    const textToSend = inputText;
    setInputText('');

    const { data, error } = await supabase.from('messages').insert([
      {
        product_id: productId,
        user_id: currentUser.id,
        sender: 'user',
        text: textToSend,
      },
    ]).select();

    if (error) {
      console.error('Gagal mengirim pesan ke Supabase:', error.message);
      alert('Gagal mengirim pesan: ' + error.message);
    } else {
      console.log('Pesan berhasil tersimpan:', data);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col">
      <header className="w-full bg-white border-b border-[#059669]/30 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3 sm:gap-4 max-w-7xl mx-auto w-full">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-[#059669] hover:scale-110 active:scale-95 duration-200 transition-all font-bold text-xl sm:text-2xl"
          >
            ←
          </button>
          <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-full bg-slate-200 flex items-center justify-center font-bold text-black/60 text-xs sm:text-sm flex-shrink-0 overflow-hidden">
            {storeLogoUrl ? (
              <img src={storeLogoUrl} alt={product.storeName} className="w-full h-full object-cover" />
            ) : (
              product.storeName.charAt(0)
            )}
          </div>
          <h1 className="text-sm sm:text-base lg:text-lg font-bold text-black/80 truncate">
            {product.storeName}
          </h1>
        </div>
      </header>

      <div className="sticky top-[57px] sm:top-[56px] z-20 w-full bg-slate-50 px-3 sm:px-6 lg:px-8 pt-3 pb-2">
        <div className="max-w-4xl mx-auto w-full bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] sm:text-xs text-black/50 block font-medium">
              Kamu menanyakan tentang produk ini.
            </span>
            <div className="flex items-center gap-3 pt-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-black/40 text-xs flex-shrink-0 border border-slate-200 overflow-hidden">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <span>{product.imageText}</span>
                )}
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-black/80 line-clamp-1">
                  {product.title}
                </h2>
                <span className="text-xs sm:text-lg font-bold text-[#059669]">
                  {product.price}
                </span>
              </div>
            </div>
          </div>

          <Link
            href={`/product/${product.id}`}
            className="w-full sm:w-auto px-4 py-2 bg-[#059669] text-white rounded-lg font-medium text-xs sm:text-sm hover:bg-emerald-700 hover:scale-[1.03] active:scale-[0.98] duration-200 transition-all text-center shadow-sm flex-shrink-0"
          >
            Beli Sekarang
          </Link>
        </div>
      </div>

      <main className="w-full flex-1 max-w-4xl mx-auto p-3 sm:p-6 lg:p-8 flex flex-col justify-between space-y-6">
        <div className="space-y-6">
          <div className="space-y-4 py-2">
            {messages.length === 0 ? (
              <div className="text-center py-10 text-black/40 text-xs sm:text-sm italic">
                Belum ada pesan. Mulai obrolan dengan penjual sekarang!
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs sm:text-sm shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-white border border-slate-200 text-black/80 rounded-br-none'
                        : 'bg-[#059669] text-white rounded-bl-none font-medium'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span
                      className={`block text-[10px] mt-1 text-right ${
                        msg.sender === 'user' ? 'text-black/40' : 'text-emerald-100'
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="sticky bottom-3 left-0 right-0 bg-white border border-slate-200 rounded-2xl p-2 sm:p-3 shadow-lg">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
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