'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function SignInPage() {
  const router = useRouter();
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setErrorMessage('Anda harus menyetujui Syarat & Ketentuan serta kebijakan privasi.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const fullName = `${firstName} ${lastName}`.trim();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          whatsapp: whatsapp,
          role: role,
        },
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
    } else {
      const destination = role === 'seller' ? '/dashboard/seller' : '/dashboard/buyer';

      if (data.session) {
        setSuccessMessage('Pendaftaran berhasil! Mengalihkan ke dashboard...');
        setTimeout(() => {
          router.push(destination);
        }, 1500);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setSuccessMessage('Pendaftaran berhasil! Silakan masuk.');
          setIsLoading(false);
        } else {
          setSuccessMessage('Berhasil masuk! Mengalihkan ke dashboard...');
          setTimeout(() => {
            router.push(destination);
          }, 1500);
        }
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
    }
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
          <span className="text-lg sm:text-xl font-medium text-slate-700">Daftar</span>
        </Link>
      </header>

      <main className="flex-1 w-full bg-[#059669] py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="w-full max-w-4xl mx-auto">
          {step === 'role' ? (
            <div className="bg-[#059669] text-white flex flex-col items-center text-center">
              <div className="w-full flex justify-start mb-6 max-w-2xl">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#059669] hover:scale-105 active:scale-98 transition-all duration-200 border border-emerald-500/20 font-medium text-xs sm:text-sm rounded-lg shadow-sm"
                >
                  <span>← Kembali</span>
                </Link>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                  Pilih Peran Anda
                </h2>
                <p className="text-xs sm:text-sm text-emerald-50 mt-2 font-normal">
                  Bagaimana Anda ingin menggunakan Flexa?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-2xl mb-8">
                <div
                  onClick={() => setRole('buyer')}
                  className={`cursor-pointer p-6 sm:p-8 rounded-2xl border-2 hover:scale-101 active:scale-98 transition-all duration-200 flex flex-col items-center text-center ${
                    role === 'buyer'
                      ? 'bg-emerald-600/30 border-white shadow-xl'
                      : 'bg-emerald-700/20 border-white/30 hover:border-white/60'
                  }`}
                >
                  <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-4 text-white">
                    <svg className="w-7 h-7 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Pembeli</h3>
                  <p className="text-xs sm:text-sm text-emerald-50 font-normal">
                    Saya ingin mencari barang murah di sekitar.
                  </p>
                </div>

                <div
                  onClick={() => setRole('seller')}
                  className={`cursor-pointer p-6 sm:p-8 rounded-2xl border-2 hover:scale-101 active:scale-98 transition-all duration-200 flex flex-col items-center text-center ${
                    role === 'seller'
                      ? 'bg-emerald-600/30 border-white shadow-xl'
                      : 'bg-emerald-700/20 border-white/30 hover:border-white/60'
                  }`}
                >
                  <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-4 text-white">
                    <svg className="w-7 h-7 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Penjual</h3>
                  <p className="text-xs sm:text-sm text-emerald-50 font-normal">
                    Saya ingin berjualan menggunakan Flexa.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep('form')}
                className="w-full max-w-2xl py-3 sm:py-3.5 bg-white text-[#059669] hover:-translate-y-1 active:scale-98 hover:scale-101 font-medium text-xs sm:text-sm rounded-xl shadow-lg transition-all"
              >
                Lanjutkan daftar sebagai {role === 'buyer' ? 'Pembeli' : 'Penjual'} →
              </button>
            </div>
          ) : (
            <div className="w-full max-w-lg mx-auto bg-[#059669] text-white flex flex-col items-center p-6 sm:p-8 md:p-10">
              <div className="mb-6 text-center">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                  Buat Akun Baru
                </h2>
                <p className="text-xs sm:text-sm text-emerald-50 mt-1 font-normal">
                  Lengkapi data diri Anda untuk memulai.
                </p>
              </div>

              {errorMessage && (
                <div className="w-full mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-xl text-xs sm:text-sm">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="w-full mb-4 p-3 bg-emerald-100 border border-emerald-300 text-[#059669] rounded-xl text-xs sm:text-sm">
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleRegister} className="w-full space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Nama Depan"
                      required
                      className="w-full px-4 py-3 bg-white text-slate-800 placeholder-slate-400 rounded-xl text-xs sm:text-sm focus:outline-none shadow-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Nama Belakang"
                      className="w-full px-4 py-3 bg-white text-slate-800 placeholder-slate-400 rounded-xl text-xs sm:text-sm focus:outline-none shadow-sm"
                    />
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    required
                    className="w-full px-4 pr-10 py-3 bg-white text-slate-800 placeholder-slate-400 rounded-xl text-xs sm:text-sm focus:outline-none shadow-sm"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="No. Whatsapp"
                    required
                    className="w-full px-4 pr-10 py-3 bg-white text-slate-800 placeholder-slate-400 rounded-xl text-xs sm:text-sm focus:outline-none shadow-sm"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </span>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (Min. 8 Karakter)"
                    required
                    minLength={8}
                    className="w-full px-4 pr-10 py-3 bg-white text-slate-800 placeholder-slate-400 rounded-xl text-xs sm:text-sm focus:outline-none shadow-sm"
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

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded text-[#059669] focus:ring-[#059669] cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-xs text-emerald-50 cursor-pointer select-none">
                    Saya setuju dengan <span className="font-bold underline">Syarat & Ketentuan</span> serta kebijakan privasi
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-white hover:scale-105 active:scale-98 transition-all duration-200 text-black/80 font-medium text-xs sm:text-sm rounded-xl shadow-lg disabled:opacity-50"
                >
                  {isLoading ? 'Memproses...' : 'Daftar Sekarang →'}
                </button>
              </form>

              <div className="w-full flex items-center my-6">
                <div className="flex-1 border-t border-white/30"></div>
                <span className="px-4 text-xs sm:text-sm text-emerald-50 font-medium">Atau</span>
                <div className="flex-1 border-t border-white/30"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-3.5 bg-white text-black/80 font-medium hover:scale-105 active:scale-98 transition-all duration-200 text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.18v3.15C3.16 21.32 7.22 24 12 24z" />
                  <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.18C.43 8.12 0 9.83 0 12s.43 3.88 1.18 5.39l4.09-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.22 0 3.16 2.68 1.18 6.61l4.09 3.15c.95-2.85 3.6-4.96 6.73-4.96z" />
                </svg>
                <span>Lanjut dengan Google</span>
              </button>

              <button
                type="button"
                onClick={() => setStep('role')}
                className="mt-6 text-xs sm:text-sm hover:scale-105 active:scale-98 transition-all duration-200 text-emerald-50 hover:text-white font-medium"
              >
                &lt; Kembali ke peran
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}