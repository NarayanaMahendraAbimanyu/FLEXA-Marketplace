'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-6 sm:p-8 text-center shadow-2xl border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-100/70 flex items-center justify-center">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#059669]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3 3.1-3 1.71 0 3.1 1.39 3.1 3v2z"/>
            </svg>
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl font-semibold text-[#059669] mb-3 tracking-tight">
          Login Diperlukan
        </h3>

        <p className="text-xs sm:text-sm text-black/50 leading-relaxed mb-8 px-2 sm:px-4">
          Ups! Fitur transaksi dan negosiasi harga hanya tersedia untuk member. Yuk gabung sekarang!
        </p>

        <div className="space-y-3">
          <Link
            href="/login"
            className="w-full py-3.5 px-4 bg-[#059669] hover:bg-emerald-500 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-emerald-600/20 transition-all duration-200 inline-block"
          >
            Masuk Akun
          </Link>

          <Link
            href="/signin"
            className="w-full py-3.5 px-4 bg-white border border-slate-200 hover:border-emerald-500 text-black/40 hover:text-[#059669] font-bold text-sm sm:text-base rounded-2xl transition-all duration-200 inline-block"
          >
            Daftar Baru
          </Link>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 text-xs sm:text-sm text-black/40 hover:text-black/80 hover:underline font-medium transition-colors"
        >
          Kembali melihat-lihat
        </button>
      </div>
    </div>
  );
}