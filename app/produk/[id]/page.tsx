'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Review {
  id: number;
  username: string;
  rating: number;
  comment: string;
  time: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id;

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  
  const [reviewsList, setReviewsList] = useState<Review[]>([
    {
      id: 1,
      username: 'Narayana Mahendra Abimanyu',
      rating: 5,
      comment: 'Barangnya bagus dan mulus banget pengiriman juga cepat.',
      time: 'BARU SAJA',
    },
  ]);

  const product = {
    id: productId,
    categoryPath: 'FLEXA > Elektronik',
    categoryTag: 'Elektronik',
    title: 'Sony Alpha A7 III Mirrorless Camera',
    storeName: 'ALFA CAM',
    rating: 4.9,
    soldCount: '3rb+ Terjual',
    price: 'Rp. 50.000,00',
    stock: 12,
    description: 'Kamera mirrorless full-frame kondisi mulus, sensor bersih, kelengkapan lengkap (body, lensa kit 28-70mm, baterai 2 buah, charger, tas). Sangat cocok untuk kebutuhan dokumentasi event, wedding, maupun pembuatan konten profesional.',
    images: ['CAMERA 1', 'CAMERA 2', 'CAMERA 3'],
  };

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const triggerAlert = (msg: string) => {
    setAlertMessage(msg);
    setIsAlertVisible(true);
    setTimeout(() => {
      setIsAlertVisible(false);
    }, 3000);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    setAlertMessage('');

    if (userRating === 0 && !reviewText.trim()) {
      triggerAlert('Silakan berikan bintang dan tulis komentar ulasan Anda!');
      return;
    }
    if (userRating === 0) {
      triggerAlert('Silakan berikan rating bintang terlebih dahulu!');
      return;
    }
    if (!reviewText.trim()) {
      triggerAlert('Silakan tulis komentar ulasan Anda!');
      return;
    }

    const newReview: Review = {
      id: Date.now(),
      username: 'Narayana Mahendra Abimanyu',
      rating: userRating,
      comment: reviewText,
      time: 'BARU SAJA',
    };

    setReviewsList([newReview, ...reviewsList]);
    setReviewText('');
    setUserRating(0);
  };

  return (
    <main className="w-full min-h-screen bg-slate-50 pt-14 pb-12 px-4 sm:px-6 lg:px-8 relative">
      {alertMessage && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-[#059669] text-black/80 px-5 py-3 rounded-2xl shadow-lg font-medium text-xs sm:text-sm flex items-center gap-3 transition-all duration-300 ${
          isAlertVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-12'
        }`}>
          <span className="text-red-500 font-bold">✕</span>
          <span>{alertMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto mb-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#059669] text-white rounded-xl font-semibold text-xs sm:text-sm hover:bg-emerald-700 hover:scale-[1.03] active:scale-[0.98] duration-200 transition-all shadow-sm"
        >
          <span>‹ Kembali</span>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto border border-[#059669]/40 rounded-3xl p-4 sm:p-6 lg:p-8 bg-white shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        <div className="w-full lg:col-span-6 lg:sticky lg:top-13 space-y-4">
          <div className="w-full aspect-[4/3] bg-slate-200 rounded-2xl flex items-center justify-center p-6 border border-slate-200 shadow-inner">
            <span className="text-3xl sm:text-5xl font-black text-black/30 tracking-wider">
              {product.images[selectedImage]}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImage(idx)}
                className={`w-full aspect-[4/3] rounded-xl bg-slate-100 flex items-center justify-center border-2 hover:scale-[1.03] active:scale-[0.98] duration-200 transition-all ${
                  selectedImage === idx ? 'border-[#059669] bg-emerald-50/50' : 'border-transparent hover:border-black/20'
                }`}
              >
                <span className="text-xs sm:text-sm font-bold text-black/40">{img}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="w-full lg:col-span-6 space-y-4">
          <div>
            <span className="text-xs text-black/40 font-medium block mb-1">
              {product.categoryPath} &gt; <span className="text-black/60 font-semibold">{product.title}</span>
            </span>
            <h1 className="text-xl sm:text-3xl font-extrabold text-black/80 tracking-tight">
              {product.title}
            </h1>
          </div>

          <div>
            <span className="text-2xl sm:text-3xl font-bold text-[#059669]">{product.price}</span>
          </div>

          <div className="flex items-center gap-3 py-1">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg border-2 border-amber-200/50">
              <span className="text-amber-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 sm:w-6 sm:h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </span>
              <span className="font-bold text-xs sm:text-sm text-amber-700">{product.rating}</span>
            </div>
            <span className="text-xs sm:text-sm text-black/60 font-medium">{product.soldCount}</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-300 flex items-center justify-center text-white font-bold flex-shrink-0">
                {product.storeName.charAt(0)}
              </div>
              <div>
                <span className="text-xs text-black/40 block">Toko</span>
                <span className="text-sm sm:text-base font-bold text-black/80">{product.storeName}</span>
              </div>
            </div>
            <button
              type="button"
              className="px-4 sm:px-5 py-2.5 bg-[#059669] text-white hover:bg-emerald-700 hover:scale-[1.03] active:scale-[0.98] duration-200 transition-all font-bold text-xs sm:text-sm rounded-xl shadow-sm flex-shrink-0"
            >
              Tawar / Chat
            </button>
          </div>

          <div>
            <h3 className="text-xs sm:text-sm font-bold text-black/80 mb-1">Deskripsi</h3>
            <p className="text-xs sm:text-sm text-black/60 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="inline-flex flex-col p-4 bg-emerald-50/70 border border-[#059669]/30 rounded-2xl w-fit">
            <span className="text-xs text-black/50 block font-medium mb-1">Stock tersedia</span>
            <span className="text-2xl font-black text-[#059669]">{product.stock}</span>
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="text-xs sm:text-sm font-bold text-black/80">Ulasan Pengguna</h3>
            
            <form onSubmit={handleAddReview} className="p-4 border border-slate-200 rounded-2xl bg-white space-y-3 shadow-sm">
              <span className="text-xs font-bold text-black/70 block">BERI ULASAN ANDA</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserRating(star)}
                    className={`hover:scale-110 active:scale-95 duration-200 transition-all ${
                      userRating >= star ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300'
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-7 h-7"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <textarea
                  rows={2}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Ceritakan pengalaman belanja Anda..."
                  className="w-full p-3 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#059669] resize-none text-black/80"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#059669] text-white text-xs font-bold rounded-xl flex items-center justify-center hover:bg-emerald-700 hover:scale-[1.03] active:scale-[0.98] duration-200 transition-all shadow-sm"
                >
                  KIRIM ULASAN
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {reviewsList.map((rev) => (
                <div key={rev.id} className="p-4 border border-slate-100 rounded-2xl bg-white space-y-2 shadow-sm">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {rev.username.charAt(0)}
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-black/80">{rev.username}</span>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <svg
                          key={s}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className={`w-4 h-4 ${s <= rev.rating ? 'text-amber-400' : 'text-slate-200'}`}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-black/70 italic">"{rev.comment}"</p>
                  <span className="text-[10px] text-[#059669] font-bold block">{rev.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sticky md:sticky md:bottom-0.5 bottom-1 left-0 right-0 z-40 bg-white/95 sm:bg-white/90 backdrop-blur-md p-3 sm:p-4 border-t sm:border border-black/30 sm:rounded-2xl shadow-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg flex-shrink-0">
              <button
                type="button"
                onClick={handleDecrement}
                className="w-7 h-7 rounded-xl bg-white shadow-sm flex items-center justify-center font-bold text-black/70 hover:text-[#059669] hover:scale-[1.03] active:scale-[0.98] duration-200 transition-all text-sm"
              >
                -
              </button>
              <span className="text-xs sm:text-sm font-bold text-black/80 w-6 text-center">{quantity}</span>
              <button
                type="button"
                onClick={handleIncrement}
                className="w-7 h-7 rounded-xl bg-white shadow-sm flex items-center justify-center font-bold text-black/70 hover:text-[#059669] hover:scale-[1.03] active:scale-[0.98] duration-200 transition-all text-sm"
              >
                +
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full">
              <button
                type="button"
                className="py-2.5 px-2 bg-white border border-[#059669] text-[#059669] hover:scale-[1.03] active:scale-[0.98] duration-200 transition-all font-medium text-xs rounded-lg text-center shadow-sm truncate"
              >
                Masuk Keranjang
              </button>
              <button
                type="button"
                className="py-2.5 px-2 bg-[#059669] text-white hover:bg-emerald-700 hover:scale-[1.03] active:scale-[0.98] duration-200 transition-all font-medium text-xs rounded-lg shadow-lg shadow-emerald-600/20 text-center truncate"
              >
                Beli Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}