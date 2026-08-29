'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PRODUCTS, Product } from '@/app/data/products';
import { supabase } from '@/lib/supabaseClient';

export default function CheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const productId = Number(params?.id);
  const qtyParam = Number(searchParams.get('qty')) || 1;

  const foundProduct: Product | undefined = PRODUCTS.find((p) => p.id === productId);

  const product = {
    id: foundProduct ? foundProduct.id : 1,
    title: foundProduct ? foundProduct.title : 'Produk Tidak Ditemukan',
    storeName: foundProduct ? foundProduct.storeName : 'Toko Tidak Ditemukan',
    price: foundProduct ? foundProduct.price : 'Rp 0',
    imageText: foundProduct ? foundProduct.imageText : 'PRODUK',
    rawPrice: foundProduct 
      ? Number(foundProduct.price.replace(/[^0-9]/g, '')) 
      : 0,
  };

  const [address, setAddress] = useState('Jl. Merdeka No. 45, RT 01 / RW 05, Kel. Menteng, Kec. Menteng, Kota Jakarta Pusat, DKI Jakarta, 10350');
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState('qris');

  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [isPromoSuccess, setIsPromoSuccess] = useState(false);

  const [alertMessage, setAlertMessage] = useState('');
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const shippingCost = 10000;
  const subtotal = product.rawPrice * qtyParam;
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const totalBayar = subtotal + shippingCost - discountAmount;

  const formatRupiah = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  const triggerAlert = (msg: string) => {
    setAlertMessage(msg);
    setIsAlertVisible(true);
    setTimeout(() => {
      setIsAlertVisible(false);
    }, 3000);
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'OPENFLEXA') {
      setDiscountPercent(30);
      setIsPromoSuccess(true);
      setPromoMessage('Selamat! Kode promo OPENFLEXA berhasil digunakan (Diskon 30%).');
      triggerAlert('Kode promo berhasil dipasang!');
    } else {
      setDiscountPercent(0);
      setIsPromoSuccess(false);
      setPromoMessage('Kode promo tidak valid atau kadaluarsa.');
      triggerAlert('Kode promo tidak valid!');
    }
  };

  const handleCreateOrder = async () => {
    const randomId = Math.floor(100000 + Math.random() * 900000).toString();
    const orderData = {
      id: randomId,
      name: product.title,
      price: formatRupiah(totalBayar),
      imageText: product.imageText,
      qty: qtyParam,
      storeName: product.storeName,
      address: address,
      paymentMethod: paymentMethod,
    };

    localStorage.setItem('last_purchase', JSON.stringify(orderData));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('orders').insert([
          {
            order_id: randomId,
            user_id: user.id,
            product_name: product.title,
            product_price: formatRupiah(totalBayar),
            image_text: product.imageText,
            quantity: qtyParam,
            store_name: product.storeName,
            address: address,
            payment_method: paymentMethod,
            status: 'Belum dikirim'
          }
        ]);
      }
    } catch (error) {
      console.error('Gagal menyimpan ke database:', error);
    }

    setIsSuccessModalOpen(true);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col">
      <main className="w-full flex-1 pt-6 pb-16 px-4 sm:px-6 lg:px-8 relative max-w-4xl mx-auto space-y-6">
        {alertMessage && (
          <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-white border border-[#059669] text-black/80 px-5 py-3 rounded-2xl shadow-lg font-medium text-xs sm:text-sm flex items-center gap-3 transition-all duration-300 ${
            isAlertVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-12'
          }`}>
            <span className="text-[#059669] font-bold">✓</span>
            <span>{alertMessage}</span>
          </div>
        )}

        {isSuccessModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-center animate-in fade-in zoom-in duration-200">
              <div className="w-16 h-16 bg-emerald-100 text-[#059669] rounded-full flex items-center justify-center text-3xl mx-auto font-bold">
                ✓
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-black/80">Pesanan Telah Dibuat</h3>
                <p className="text-xs sm:text-sm text-black/60">
                  Pesanan Anda berhasil diproses dan tersimpan ke akun Anda.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/"
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 hover:scale-105 active:scale-95 text-black/80 font-medium text-xs sm:text-sm rounded-xl transition-all text-center"
                >
                  Lihat Produk Lainnya
                </Link>
                <Link
                  href="/buyer/purchase"
                  className="flex-1 py-3 px-4 bg-[#059669] hover:bg-emerald-700 hover:scale-105 active:scale-95 text-white font-medium text-xs sm:text-sm rounded-xl transition-all text-center shadow-lg shadow-emerald-600/20"
                >
                  Lihat Pesanan
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Link 
            href={`/product/${productId}`} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#059669] text-white rounded-xl font-semibold text-xs sm:text-sm hover:bg-emerald-700 hover:scale-[1.03] active:scale-[0.98] duration-200 transition-all shadow-sm"
          >
            <span>← Kembali</span>
          </Link>
          <h1 className="text-lg sm:text-2xl font-semibold text-black/80 tracking-tight">Konfirmasi Pemesanan</h1>
        </div>

        <div className="bg-white border border-[#059669]/30 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-black/80 font-bold text-sm sm:text-base">
              <span>📍</span>
              <span>Alamat Pengiriman</span>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingAddress(!isEditingAddress)}
              className="text-xs font-semibold text-[#059669] hover:underline"
            >
              {isEditingAddress ? 'Simpan' : 'Ubah Alamat'}
            </button>
          </div>

          {isEditingAddress ? (
            <textarea
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-3 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#059669] text-black/80"
            />
          ) : (
            <p className="text-xs sm:text-sm text-black/70 leading-relaxed font-medium">
              {address}
            </p>
          )}
        </div>

        <div className="bg-white border border-[#059669]/30 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-black/80 font-bold text-sm sm:text-base border-b border-slate-100 pb-3">
            <span>📦</span>
            <span>Produk yang Dipesan</span>
          </div>

          <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-200 rounded-xl flex items-center justify-center font-bold text-black/40 text-xs flex-shrink-0">
              {product.imageText}
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <span className="text-[10px] text-black/40 font-bold uppercase block">{product.storeName}</span>
              <h3 className="text-xs sm:text-sm font-bold text-black/80 truncate">{product.title}</h3>
              <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
                <span className="text-black/60">{qtyParam}x {product.price}</span>
                <span className="text-[#059669] font-bold">{formatRupiah(subtotal)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#059669]/30 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-black/80 font-bold text-sm sm:text-base border-b border-slate-100 pb-3">
            <span>💳</span>
            <span>Metode Pembayaran</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('qris')}
              className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col gap-2 ${
                paymentMethod === 'qris' ? 'border-[#059669] bg-emerald-50/40' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="text-xl">📱</span>
              <span className="text-xs sm:text-sm font-bold text-black/80">QRIS / Instant</span>
              <span className="text-[10px] text-black/50">Scan & bayar langsung</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('va')}
              className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col gap-2 ${
                paymentMethod === 'va' ? 'border-[#059669] bg-emerald-50/40' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="text-xl">🏦</span>
              <span className="text-xs sm:text-sm font-bold text-black/80">Transfer VA</span>
              <span className="text-[10px] text-black/50">BCA, Mandiri, BNI, BRI</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('cod')}
              className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col gap-2 ${
                paymentMethod === 'cod' ? 'border-[#059669] bg-emerald-50/40' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="text-xl">🛵</span>
              <span className="text-xs sm:text-sm font-bold text-black/80">COD (Bayar di Tempat)</span>
              <span className="text-[10px] text-black/50">Bayar saat kurir tiba</span>
            </button>
          </div>
        </div>

        <div className="bg-white border border-[#059669]/30 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-black/80 font-bold text-sm sm:text-base border-b border-slate-100 pb-3">
            <span>🎟️</span>
            <span>Kode Promo</span>
          </div>

          <form onSubmit={handleApplyPromo} className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Masukkan kode promo (coba: OPENFLEXA)"
              className="flex-1 p-3 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#059669] uppercase font-semibold text-black/80"
            />
            <button
              type="submit"
              className="px-5 py-3 bg-[#059669] text-white font-bold text-xs sm:text-sm rounded-xl hover:bg-emerald-700 transition-all shadow-sm"
            >
              Gunakan
            </button>
          </form>

          {promoMessage && (
            <p className={`text-xs font-semibold ${isPromoSuccess ? 'text-[#059669]' : 'text-red-500'}`}>
              {promoMessage}
            </p>
          )}
        </div>

        <div className="bg-white border border-[#059669]/30 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="space-y-2 text-xs sm:text-sm font-semibold text-black/70">
            <div className="flex justify-between">
              <span className="tracking-wider">SUBTOTAL PRODUK</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="tracking-wider">BIAYA KIRIM</span>
              <span>{formatRupiah(shippingCost)}</span>
            </div>
            <div className="flex justify-between text-[#059669]">
              <span className="tracking-wider">POTONGAN DISKON</span>
              <span>- {formatRupiah(discountAmount)}</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-black/40 tracking-widest block uppercase">Total Bayar</span>
              <span className="text-2xl sm:text-3xl font-bold text-[#059669]">{formatRupiah(totalBayar)}</span>
            </div>

            <button
              type="button"
              onClick={handleCreateOrder}
              className="w-full sm:w-auto px-8 py-4 bg-[#059669] text-white hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98] duration-200 transition-all font-bold text-sm sm:text-base rounded-2xl shadow-xl shadow-emerald-600/20 text-center"
            >
              BUAT PESANAN SEKARANG
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}