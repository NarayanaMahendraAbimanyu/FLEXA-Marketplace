'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';

export default function LupaPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setMessage({
        text: 'Instruksi pemulihan password telah dikirim ke email Anda. Silakan cek kotak masuk.',
        type: 'success',
      });
    } catch (err: any) {
      setMessage({
        text: err.message || 'Gagal mengirim email pemulihan password.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col justify-between font-sans text-slate-800 relative">
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <Link href="/" className="inline-flex items-center gap-3">
          <Image
            src="/flexa-logo-green.png"
            alt="Flexa Logo"
            width={120}
            height={36}
            className="h-7 sm:h-8 w-auto object-contain cursor-pointer"
            priority
          />
          <span className="text-lg sm:text-xl font-medium text-slate-700">Lupa Password</span>
        </Link>
      </header>

      <main className="flex-1 w-full bg-[#059669] py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl">
            <div className="w-full flex justify-start mb-6">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#059669] hover:text-white hover:bg-[#059669] hover:scale-105 transition-all duration-200 border border-emerald-500/20 font-medium text-xs sm:text-sm rounded-lg shadow-sm"
              >
                <span>← Kembali ke Masuk</span>
              </Link>
            </div>
            
            <div className="mb-6 text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-black/70 tracking-tight">
                Lupa Password
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
                Masukkan email Anda untuk menerima tautan pemulihan password.
              </p>
            </div>

            {message && (
              <div className={`mb-4 p-3 rounded-xl text-xs sm:text-sm ${message.type === 'success' ? 'bg-emerald-50 text-[#059669] border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#059669]">
                    <svg className="w-5 h-5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan email terdaftar"
                    required
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white border border-emerald-500/40 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 sm:py-3.5 bg-[#059669] hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition-all duration-200 mt-2 disabled:opacity-50"
              >
                {isLoading ? 'Memproses...' : 'Kirim Tautan Pemulihan'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}