'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  store_name: string;
  product_price: string;
  raw_price: number;
  image_text: string;
  quantity: number;
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setCartItems(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  const handleRemoveItem = async (id: number) => {
    try {
      const { error } = await supabase.from('cart').delete().eq('id', id);
      if (!error) {
        setCartItems(cartItems.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckout = (item: CartItem) => {
    router.push(`/checkout/${item.product_id}?qty=${item.quantity}`);
  };

  return (
    <div className="w-full min-h-[600px] bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm relative overflow-hidden">
      <main className="w-full flex-1 relative mx-auto space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-black/80 mb-3">Keranjang Saya</h1>
      <div className="w-full h-[1px] bg-slate-200 mb-6" />

        {loading ? (
          <div className="text-center py-10 text-black/60 text-sm">Memuat keranjang...</div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white border border-[#059669]/30 rounded-3xl p-8 shadow-sm text-center space-y-4">
            <div className="text-4xl">🛒</div>
            <p className="text-xs sm:text-sm text-black/60 font-medium">Keranjang belanja Anda masih kosong.</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-[#059669] hover:scale-105 active:scale-95 duration-200 text-white rounded-xl font-bold text-xs sm:text-sm hover:bg-emerald-700 transition-all shadow-sm"
            >
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => {
              const subtotal = item.raw_price * item.quantity;
              return (
                <div key={item.id} className="bg-white border border-[#059669]/30 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-200 rounded-xl flex items-center justify-center font-bold text-black/40 text-xs flex-shrink-0">
                        {item.image_text}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <span className="text-[10px] text-black/40 font-bold uppercase block">{item.store_name}</span>
                        <h3 className="text-xs sm:text-sm font-bold text-black/80 truncate">{item.product_name}</h3>
                        <div className="text-xs sm:text-sm font-semibold text-black/60">
                          {item.quantity} x {item.product_price}
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-[#059669]">
                          Total: {formatRupiah(subtotal)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-red-600 rounded-xl font-semibold text-xs transition-all"
                      >
                        Hapus
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCheckout(item)}
                        className="px-5 py-2 bg-[#059669] hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm"
                      >
                        Beli Sekarang
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}