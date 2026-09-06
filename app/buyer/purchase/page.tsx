'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface OrderItem {
  id: string;
  dbId: number;
  name: string;
  price: string;
  imageText?: string;
  qty?: number;
  storeName?: string;
  status?: string;
  address?: string;
  paymentMethod?: string;
  numericPrice?: number;
  category?: string;
  rentalStartDate?: string;
  rentalEndDate?: string;
  deliveryMethod?: string;
}

export default function PurchasePage() {
  const [purchasedProducts, setPurchasedProducts] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<OrderItem | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (!error && data) {
            const formattedOrders: OrderItem[] = data.map((item: any) => {
              const rawPrice = item.product_price;
              const numericPrice = typeof rawPrice === 'number' 
                ? rawPrice 
                : parseInt(String(rawPrice).replace(/[^0-9]/g, '')) || 0;

              return {
                id: item.order_id || String(item.id),
                dbId: item.id,
                name: item.product_name,
                price: rawPrice,
                numericPrice: numericPrice,
                imageText: item.image_text || 'PRODUK',
                qty: item.quantity || 1,
                storeName: item.store_name,
                status: item.status || 'Belum dikirim',
                address: item.address,
                paymentMethod: item.payment_method,
                category: item.category || '',
                rentalStartDate: item.rental_start_date || '',
                rentalEndDate: item.rental_end_date || '',
                deliveryMethod: item.delivery_method || '',
              };
            });
            setPurchasedProducts(formattedOrders);
            setIsLoading(false);
            return;
          }
        }

        setPurchasedProducts([]);
      } catch (err) {
        console.error('Gagal mengambil data pesanan:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setOrderToCancel(null);
        return;
      }

      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderToCancel.dbId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Gagal membatalkan pesanan:', error);
        setOrderToCancel(null);
        return;
      }

      setPurchasedProducts(prev => prev.filter(item => item.dbId !== orderToCancel.dbId));

      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    } catch (err) {
      console.error('Gagal membatalkan pesanan:', err);
    } finally {
      setOrderToCancel(null);
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm relative overflow-hidden">
      {showNotification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-white border border-[#059669] text-[#059669] px-6 py-3 rounded-full shadow-lg font-medium text-xs sm:text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-4 slide-out-to-top-4 duration-300 w-[90%] sm:w-auto justify-center max-w-md">
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.09-.34.14-.57.14s-.41-.05-.57-.14l-7.9-4.44A1.003 1.003 0 0 1 3 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.09.34-.14.57-.14s.41.05.57.14l7.9 4.44c.32.17.53.5.53.88v9zM12 4.15L5 8.09v7.82l7 3.93 7-3.93V8.09l-7-3.94zM12 12.5l-5-2.81 5-2.81 5 2.81-5 2.81z"/>
          </svg>
          <span className="text-center truncate">Pesanan berhasil dibatalkan</span>
        </div>
      )}

      <h1 className="text-xl sm:text-2xl font-bold text-black/80 mb-3">Pesanan Saya</h1>
      <div className="w-full h-[1px] bg-slate-200 mb-6" />

      <div className="min-h-[483px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <p className="text-sm text-black/50 font-medium">Memuat pesanan...</p>
          </div>
        ) : purchasedProducts.length > 0 ? (
          <div className="space-y-2">
            {purchasedProducts.map((item, index) => {
              const qty = item.qty || 1;
              const unitPriceNum = item.numericPrice || 0;
              const totalPriceNum = unitPriceNum * qty;
              const formattedUnitPrice = unitPriceNum.toLocaleString('id-ID');
              const formattedTotalPrice = totalPriceNum.toLocaleString('id-ID');

              return (
                <div 
                  key={index} 
                  className="border border-slate-300 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 relative"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-200 rounded-xl flex items-center justify-center text-center font-bold text-black/40 text-xs shrink-0">
                      {item.imageText || 'PRODUK'}
                    </div>
                    <div>
                      <span className="text-xs text-black/60 font-medium">#{item.id}</span>
                      <h3 className="font-bold text-base sm:text-lg text-black/80">{item.name}</h3>
                      <span className="text-xs sm:text-sm font-semibold text-black/60">{qty} x Rp. {formattedUnitPrice}</span>
                      <p className="text-xs sm:text-lg font-bold text-[#059669]">Total : Rp {formattedTotalPrice}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2 self-end sm:self-center">
                    <span className="text-xs font-medium bg-[#059669]/10 py-2 px-4 rounded-md text-[#059669]">
                      {item.status || 'Belum dikirim'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setOrderToCancel(item)}
                        className="shadow-md text-sm bg-red-500 py-2 px-3 rounded-md font-normal text-white hover:scale-103 active:scale-95 transition-all duration-200"
                      >
                        Batalkan Pesanan
                      </button>
                      <button 
                        onClick={() => setSelectedOrder(item)}
                        className="shadow-md text-sm bg-[#059669] py-2 px-3 rounded-md font-normal text-white hover:scale-103 active:scale-95 transition-all duration-200"
                      >
                        Detail Pesanan
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <p className="text-sm text-black/50 font-medium">Belum ada pesanan yang dilakukan.</p>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md sm:max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-br from-[#059669] to-emerald-700 px-5 py-5 sm:px-7 sm:py-6 flex items-start justify-between shrink-0">
              <div>
                <span className="text-[10px] sm:text-xs text-emerald-100 font-semibold uppercase tracking-wider">Detail Pesanan</span>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">#{selectedOrder.id}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6 space-y-5">
              <div className="flex items-center gap-4 p-3 sm:p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-200 rounded-xl flex items-center justify-center text-center font-bold text-black/40 text-[10px] sm:text-xs p-1 shrink-0">
                  {selectedOrder.imageText || 'PRODUK'}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] sm:text-xs text-black/40 font-bold uppercase block truncate">{selectedOrder.storeName || 'Official Store'}</span>
                  <h4 className="font-bold text-sm sm:text-base text-black/80 leading-snug">{selectedOrder.name}</h4>
                  <span className="text-xs sm:text-sm font-semibold text-black/50">{selectedOrder.qty || 1}x</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-[#059669] border border-emerald-200">
                  {selectedOrder.status || 'Belum dikirim'}
                </span>
                {selectedOrder.paymentMethod && (
                  <span className="text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 text-black/60 border border-slate-200 uppercase">
                    {selectedOrder.paymentMethod}
                  </span>
                )}
                {selectedOrder.category && (
                  <span className="text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 text-black/60 border border-slate-200 capitalize">
                    {selectedOrder.category}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[10px] sm:text-xs text-black/40 font-bold uppercase tracking-wider">Informasi Pesanan</span>
                <div className="rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                  {selectedOrder.category?.toLowerCase() === 'sewa' && selectedOrder.rentalStartDate && selectedOrder.rentalEndDate && (
                    <div className="flex items-center justify-between px-4 py-3 text-xs sm:text-sm">
                      <span className="text-black/50 font-medium">Periode Sewa</span>
                      <span className="font-bold text-black/80 text-right">
                        {new Date(selectedOrder.rentalStartDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - {new Date(selectedOrder.rentalEndDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                  {selectedOrder.category?.toLowerCase() === 'sewa' && selectedOrder.deliveryMethod && (
                    <div className="flex items-center justify-between px-4 py-3 text-xs sm:text-sm">
                      <span className="text-black/50 font-medium">Metode Ambil/Kirim</span>
                      <span className="font-bold text-black/80">
                        {selectedOrder.deliveryMethod === 'pickup' ? 'Ambil di Toko' : 'Dikirim ke Alamat'}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between px-4 py-3 text-xs sm:text-sm">
                    <span className="text-black/50 font-medium">Jumlah</span>
                    <span className="font-bold text-black/80">{selectedOrder.qty || 1} item</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 text-xs sm:text-sm bg-emerald-50/40">
                    <span className="text-black/60 font-semibold">Total Harga</span>
                    <span className="font-bold text-[#059669] text-sm sm:text-base">{selectedOrder.price}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] sm:text-xs text-black/40 font-bold uppercase tracking-wider">
                  {selectedOrder.deliveryMethod === 'pickup' ? 'Alamat Pengambilan' : 'Alamat Pengiriman'}
                </span>
                <p className="text-xs sm:text-sm text-black/70 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {selectedOrder.address || 'Alamat tidak tersedia'}
                </p>
              </div>
            </div>

            <div className="px-5 py-4 sm:px-7 sm:py-5 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-full py-3 bg-[#059669] hover:bg-emerald-700 hover:scale-[1.02] active:scale-95 duration-200 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/20"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {orderToCancel && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200 text-center">
            <h3 className="text-lg font-bold text-black/80">Batalkan Pesanan</h3>
            <p className="text-xs sm:text-sm text-black/70">
              Apakah Anda yakin ingin membatalkan pesanan untuk produk <span className="font-bold text-black/80">{orderToCancel.name}</span>?
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOrderToCancel(null)}
                className="flex-1 py-2.5 shadow-xl border text-black hover:scale-105 active:scale-95 font-medium text-xs sm:text-sm rounded-xl transition-all duration-200"
              >
                Tidak
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-800 hover:scale-105 active:scale-95 text-white font-medium text-xs sm:text-sm rounded-xl transition-all duration-200 shadow-lg shadow-red-500/20"
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}