'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

const isBrowser = typeof window !== 'undefined';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'pembeli' | 'penjual' | null>(null);
  const [pendingUser, setPendingUser] = useState<any>(null);

  useEffect(() => {
    const checkGoogleRedirectLogin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const user = session.user;
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (error || !profile || !profile.role) {
          setPendingUser(user);
          setShowRoleModal(true);
        } else {
          if (profile.role === 'penjual') {
            router.push('/seller/dashboard');
          } else {
            router.push('/');
          }
        }
      }
    };

    checkGoogleRedirectLogin();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    if (isBrowser) {
      localStorage.setItem('supabase_remember_me', rememberMe ? 'true' : 'false');
    }

    if (!rememberMe) {
      await supabase.auth.signOut();
      window.localStorage.removeItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID + '-auth-token');
      window.sessionStorage.removeItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID + '-auth-token');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage('Email atau password Anda salah, silakan coba lagi');
      setIsLoading(false);
    } else {
      if (!rememberMe) {
        const tokenKey = Object.keys(window.localStorage).find(
          (key) => key.startsWith('sb-') && key.endsWith('-auth-token')
        );
        if (tokenKey) {
          const sessionData = window.localStorage.getItem(tokenKey);
          if (sessionData) {
            window.sessionStorage.setItem(tokenKey, sessionData);
            window.localStorage.removeItem(tokenKey);
          }
        }
      }

      const user = data.user;
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError || !profile || !profile.role) {
          setPendingUser(user);
          setShowRoleModal(true);
          setIsLoading(false);
        } else {
          if (profile.role === 'penjual') {
            router.push('/seller/dashboard');
          } else {
            router.push('/');
          }
        }
      }
    }
  };

  const handleGoogleAuth = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/login`,
      },
    });
    if (error) setErrorMessage(error.message);
  };

  const handleSaveRole = async () => {
    if (!pendingUser || !selectedRole) return;

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: pendingUser.id,
        email: pendingUser.email,
        role: selectedRole,
        updated_at: new Date(),
      });

    if (!error) {
      router.push(selectedRole === 'penjual' ? '/seller/dashboard' : '/');
    } else {
      setErrorMessage(error.message);
      setShowRoleModal(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white font-sans text-slate-900">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap"
      />

      <div className="flex min-h-screen">
        <aside className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-emerald-900 px-12 py-12 text-white lg:flex">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '22px 22px',
            }}
          />

          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image
                src="/flexa-logo-white.png"
                alt="Flexa"
                width={120}
                height={36}
                className="h-8 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          <div className="relative z-10 max-w-sm">
            <h1 style={{ fontFamily: "'Fraunces', serif" }} className="text-[2.5rem] font-semibold leading-[1.15] tracking-tight">
              Semua yang kamu butuh, ada di sekitarmu.
            </h1>
            <p className="mt-5 text-sm leading-relaxed text-emerald-50/80">
              Flexa mempertemukan kamu dengan barang sewaan dan jasa dari tetangga serta pelaku usaha lokal — cepat, dekat, dan saling menguntungkan.
            </p>

            <div className="mt-10 space-y-5">
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                </div>
                <p className="pt-1 text-sm text-emerald-50/90">Sewa alat dan barang harian tanpa perlu beli baru.</p>
              </div>
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="pt-1 text-sm text-emerald-50/90">Pesan jasa dari penyedia terpercaya di sekitarmu.</p>
              </div>
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                </div>
                <p className="pt-1 text-sm text-emerald-50/90">Chat dan bayar aman, semua dalam satu aplikasi.</p>
              </div>
            </div>
          </div>

          <p className="relative z-10 text-xs text-emerald-100/50">Flexa — Sewa Barang & Jasa Digital</p>
        </aside>

        <main className="flex w-full flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:w-[56%]">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <Link href="/" className="inline-flex items-center gap-2">
                <Image src="/flexa-logo-green.png" alt="Flexa" width={100} height={30} className="h-7 w-auto object-contain" priority />
              </Link>
            </div>

            <div className="mb-8 flex items-center justify-between">
              <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-emerald-700">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Kembali ke beranda
              </Link>
              <Link href="/signin" className="text-sm font-semibold text-emerald-700 hover:underline">
                Daftar
              </Link>
            </div>

            <h2 style={{ fontFamily: "'Fraunces', serif" }} className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Selamat datang kembali
            </h2>
            <p className="mt-2.5 text-sm text-slate-500">Masuk untuk lanjutkan transaksi dan kelola akunmu.</p>

            {errorMessage && (
              <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@gmail.com"
                    required
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 pr-10 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                    <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">Password</label>
                  <Link href="/lupa-password" className="text-xs font-semibold text-emerald-700 hover:underline">
                    Lupa password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    required
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 pr-10 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 transition-colors hover:text-emerald-700"
                  >
                    {showPassword ? (
                      <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a8.962 8.962 0 012.122-.363c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer"
                />
                <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer select-none">
                  Ingat saya di perangkat ini
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white transition-all hover:bg-emerald-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              >
                {isLoading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-medium text-slate-400">Atau masuk dengan</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.18v3.15C3.16 21.32 7.22 24 12 24z" />
                <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.18C.43 8.12 0 9.83 0 12s.43 3.88 1.18 5.39l4.09-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.22 0 3.16 2.68 1.18 6.61l4.09 3.15c.95-2.85 3.6-4.96 6.73-4.96z" />
              </svg>
              <span>Lanjutkan dengan Google</span>
            </button>

            <p className="mt-8 text-center text-sm text-slate-500">
              Belum punya akun?{' '}
              <Link href="/signin" className="font-semibold text-emerald-700 hover:underline">
                Daftar
              </Link>
            </p>
          </div>
        </main>
      </div>

      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <h2 style={{ fontFamily: "'Fraunces', serif" }} className="text-center text-2xl font-semibold text-slate-900 sm:text-3xl">
              Pilih peran kamu
            </h2>
            <p className="mt-2 text-center text-sm text-slate-500">Bagaimana kamu ingin menggunakan Flexa?</p>

            <div className="mt-7 grid grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => setSelectedRole('pembeli')}
                className={`relative flex flex-col items-center rounded-2xl border p-5 text-center transition-all ${
                  selectedRole === 'pembeli'
                    ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {selectedRole === 'pembeli' && (
                  <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </span>
                )}
                <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-full ${selectedRole === 'pembeli' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 style={{ fontFamily: "'Fraunces', serif" }} className="text-base font-semibold text-slate-900">Pembeli</h3>
                <p className="mt-1 text-xs leading-snug text-slate-500">Mencari barang &amp; jasa di sekitar.</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('penjual')}
                className={`relative flex flex-col items-center rounded-2xl border p-5 text-center transition-all ${
                  selectedRole === 'penjual'
                    ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {selectedRole === 'penjual' && (
                  <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </span>
                )}
                <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-full ${selectedRole === 'penjual' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 style={{ fontFamily: "'Fraunces', serif" }} className="text-base font-semibold text-slate-900">Penjual</h3>
                <p className="mt-1 text-xs leading-snug text-slate-500">Ingin berjualan lewat Flexa.</p>
              </button>
            </div>

            <button
              onClick={handleSaveRole}
              disabled={!selectedRole}
              className={`mt-7 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all ${
                selectedRole
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.99]'
                  : 'cursor-not-allowed bg-slate-100 text-slate-400'
              }`}
            >
              Lanjutkan sebagai {selectedRole === 'penjual' ? 'Penjual' : selectedRole === 'pembeli' ? 'Pembeli' : '...'}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowRoleModal(false);
                setSelectedRole(null);
              }}
              className="mt-3 w-full text-center text-sm font-medium text-slate-500 hover:text-emerald-700"
            >
              Batalkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}