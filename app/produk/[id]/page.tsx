'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id;

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const product = {
    id: productId,
    categoryTag: 'Elektronik',
    title: 'Sony Alpha A7 III Mirrorless Camera',
    storeName: 'ALFA CAM',
    rating: 4.8,
    reviewsCount: 120,
    price: 'Rp. 350.000',
    period: '/ hari',
    description: 'Kamera mirrorless full-frame kondisi mulus, sensor bersih, kelengkapan lengkap (body, lensa kit 28-70mm, baterai 2 buah, charger, tas). Sangat cocok untuk kebutuhan dokumentasi event, wedding, maupun pembuatan konten profesional.',
    images: ['CAMERA 1', 'CAMERA 2', 'CAMERA 3'],
  };

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <main className="w-full min-h-screen bg-slate-50 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto mb-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-black/50 hover:text-[#059669] transition-colors"
        >
          <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-4">
          <div className="w-full aspect-[4/3] bg-black/10 rounded-3xl flex items-center justify-center p-6 border border-slate-200">
            <span className="text-3xl sm:text-5xl font-black text-black/20 tracking-wider">
              {product.images[selectedImage]}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImage(idx)}
                className={`w-full aspect-[4/3] rounded-2xl bg-black/5 flex items-center justify-center border-2 transition-all ${
                  selectedImage === idx ? 'border-[#059669] bg-emerald-50/50' : 'border-transparent hover:border-slate-300'
                }`}
              >
                <span className="text-xs sm:text-sm font-bold text-black/30">{img}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/85 shadow-sm space-y-6">
          <div>
            <span className="inline-block bg-emerald-50 border border-emerald-500/30 text-[#059669] font-medium text-xs px-3 py-1 rounded-full mb-3">
              {product.categoryTag}
            </span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
              {product.title}
            </h1>
          </div>

          <div className="flex items-center justify-between py-3 border-y border-slate-100">
            <div>
              <span className="text-xs text-black/40 block font-medium">Penyedia / Toko</span>
              <span className="text-sm sm:text-base font-bold text-slate-700">{product.storeName}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200/50">
              <span className="text-amber-500">★</span>
              <span className="font-bold text-xs sm:text-sm text-amber-700">{product.rating}</span>
              <span className="text-[10px] text-amber-600/70">({product.reviewsCount})</span>
            </div>
          </div>

          <div>
            <span className="text-xs text-black/40 block font-medium mb-1">Harga Sewa</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-[#059669]">{product.price}</span>
              <span className="text-xs sm:text-sm text-black/50 font-medium">{product.period}</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 mb-2">Deskripsi Produk</h3>
            <p className="text-xs sm:text-sm text-black/60 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-slate-800">Atur Jumlah Durasi</span>
              <div className="flex items-center gap-3 bg-slate-100 px-3 py-1.5 rounded-xl">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center font-bold text-slate-700 hover:text-[#059669] transition-colors"
                >
                  -
                </button>
                <span className="text-sm font-bold text-slate-800 w-6 text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center font-bold text-slate-700 hover:text-[#059669] transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                className="w-full py-3.5 px-4 bg-emerald-50 text-[#059669] hover:bg-emerald-100 font-bold text-xs sm:text-sm rounded-2xl transition-all"
              >
                Masukkan Keranjang
              </button>
              <button
                type="button"
                className="w-full py-3.5 px-4 bg-[#059669] text-white hover:bg-emerald-700 font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/20 transition-all"
              >
                Sewa Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}