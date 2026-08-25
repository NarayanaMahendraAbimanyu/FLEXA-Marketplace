'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    if (!rememberMe) {
      await supabase.auth.signOut();
      window.localStorage.removeItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID + '-auth-token');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
    } else {
      if (!rememberMe) {
        const sessionData = window.localStorage.getItem(
          Object.keys(window.localStorage).find((key) => key.startsWith('sb-') && key.endsWith('-auth-token')) || ''
        );
        if (sessionData) {
          window.sessionStorage.setItem('supabase.auth.token', sessionData);
          window.localStorage.removeItem(
            Object.keys(window.localStorage).find((key) => key.startsWith('sb-') && key.endsWith('-auth-token')) || ''
          );
        }
      }
      window.location.href = '/dashboard';
    }
  };

  const handleGoogleAuth = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setErrorMessage(error.message);
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col justify-between font-sans text-slate-800">
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
          <span className="text-lg sm:text-xl font-medium text-slate-700">Masuk</span>
        </Link>
      </header>

      <main className="flex-1 w-full bg-[#059669] py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 text-white flex flex-col items-center justify-center text-center p-2 my-auto">
            <div className="flex flex-col items-center justify-center">
              <div className="mb-6 flex justify-center">
                <Image
                  src="/flexa-logo-white.png"
                  alt="Flexa Logo Large"
                  width={220}
                  height={70}
                  className="h-14 sm:h-18 lg:h-24 w-auto object-contain brightness-0 invert"
                  priority
                />
              </div>
              <p className="text-xs sm:text-sm lg:text-base text-emerald-50 leading-relaxed max-w-md font-normal text-center">
                Akses ratusan peralatan siap sewa dan hubungkan usahamu dengan talenta digital lokal terbaik dalam satu platform.
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 w-full max-w-md mx-auto lg:max-w-none">
            <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl">
              <div className="w-full flex justify-start lg:justify-start mb-8">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#059669] hover:text-white hover:bg-[#059669] hover:scale-105 active:scale-98 transition-all duration-200 border border-emerald-500/20 font-medium text-xs sm:text-sm rounded-lg shadow-sm"
                >
                  <span>← Kembali</span>
                </Link>
              </div>
              <div className="mb-6 sm:mb-8 text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-black/70 tracking-tight">
                  Masuk
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
                  Pilih metode masuk untuk melanjutkan.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs sm:text-sm">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
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
                      placeholder="Masukkan email"
                      required
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white border border-emerald-500/40 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700">
                      Password
                    </label>
                    <Link
                      href="/lupa-password"
                      className="text-[11px] sm:text-xs text-[#059669] hover:underline font-medium"
                    >
                      Lupa Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#059669]">
                      <svg className="w-5 h-5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password"
                      required
                      className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-white border border-emerald-500/40 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#059669] transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a8.962 8.962 0 012.122-.363c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-[#059669] rounded border-slate-300 focus:ring-[#059669] accent-[#059669] cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5">
                    <label htmlFor="remember" className="text-xs sm:text-sm text-slate-700 font-medium cursor-pointer">
                      Ingat Saya
                    </label>
                    <div className="relative group flex items-center">
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-slate-400 text-[10px] text-slate-500 font-bold cursor-pointer hover:border-slate-600 hover:text-slate-700 transition-colors">
                        ?
                      </span>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-3 bg-white text-slate-700 text-xs rounded-xl shadow-xl border border-slate-200 z-30 transition-all pointer-events-none">
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-white"></div>
                        Jika dipilih, kamu akan tetap login di website Flexa setelah menutup tab browser.
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 sm:py-3.5 bg-[#059669] hover:bg-emerald-500 hover:-translate-y-1 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition-all duration-200 active:scale-[0.99] mt-2 disabled:opacity-50"
                >
                  {isLoading ? 'Memproses...' : 'Masuk Sekarang'}
                </button>
              </form>

              <div className="relative my-6 flex items-center justify-center">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-3 text-[11px] sm:text-xs text-black/40 font-medium absolute">
                  Atau Masuk Dengan
                </span>
              </div>

              <div className="flex hover:-translate-y-1 transition-all duration-200">
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="w-full py-2.5 px-3 bg-white border border-emerald-500/40 rounded-xl hover:border-[#059669] hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google</span>
                </button>
              </div>

              <p className="text-center text-xs sm:text-sm text-slate-600 mt-6 font-medium">
                Belum punya akun?{' '}
                <Link href="/signin" className="text-[#059669] font-bold hover:underline">
                  Daftar
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}