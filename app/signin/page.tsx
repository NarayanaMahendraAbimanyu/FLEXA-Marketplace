'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function SignInPage() {
  const router = useRouter();
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [role, setRole] = useState<'pembeli' | 'penjual'>('pembeli');
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
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    const redirectIfLoggedIn = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: existingUser } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();

      if (existingUser) {
        const destination = existingUser.role === 'penjual' ? '/seller/dashboard' : '/';
        router.push(destination);
      }
    };

    redirectIfLoggedIn();
  }, [router]);

  useEffect(() => {
    const roleConflict = typeof window !== 'undefined' ? sessionStorage.getItem('role_conflict') : null;
    if (roleConflict) {
      const roleName = roleConflict === 'penjual' ? 'Penjual' : 'Pembeli';
      setToastMessage(`Akun Google ini sudah terdaftar sebagai ${roleName}. Silakan masuk dengan peran tersebut.`);
      sessionStorage.removeItem('role_conflict');
    }
  }, []);

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 13) {
      value = value.substring(0, 13);
    }

    let formatted = '';
    if (value.length > 0) {
      formatted += value.substring(0, 4);
    }
    if (value.length >= 5) {
      formatted += '-' + value.substring(4, 8);
    }
    if (value.length >= 9) {
      formatted += '-' + value.substring(8, 13);
    }

    setWhatsapp(formatted);
  };

  const isEmailValid = email.includes('@');
  const rawWhatsapp = whatsapp.replace(/\D/g, '');
  const isWhatsappValid = rawWhatsapp.length >= 10 && rawWhatsapp.length <= 13;
  const isPasswordValid = password.length >= 8;
  const isFormValid = isEmailValid && isWhatsappValid && isPasswordValid && agreeTerms;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEmailValid) {
      setErrorMessage('Format email tidak valid.');
      return;
    }

    if (!isWhatsappValid) {
      setErrorMessage('No. Whatsapp minimal 10 digit dan maksimal 13 digit.');
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage('Password minimal harus 8 karakter.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Anda harus menyetujui Syarat & Ketentuan serta kebijakan privasi.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    setToastMessage('');

    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('role')
      .eq('email', email)
      .maybeSingle();

    if (checkError) {
      setIsLoading(false);
      setErrorMessage('Gagal memeriksa akun. Coba lagi.');
      return;
    }

    if (existingProfile) {
      setIsLoading(false);
      const roleName = existingProfile.role === 'penjual' ? 'Penjual' : 'Pembeli';
      setToastMessage(`Akun tersebut sudah terdaftar sebagai ${roleName}, silahkan pilih akun yang lain`);
      return;
    }

    const fullName = `${firstName} ${lastName}`.trim();
    const rawPhone = whatsapp.replace(/\D/g, '');

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: fullName,
          phone: rawPhone,
          role: role,
        },
      },
    });

    if (authError) {
      setErrorMessage(authError.message);
      setIsLoading(false);
      return;
    }

    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email: email,
          username: fullName,
          phone: rawPhone,
          role: role,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Gagal menyimpan profil:', profileError.message);
        setErrorMessage('Akun dibuat, tetapi gagal menyimpan data profil.');
        setIsLoading(false);
        return;
      }
    }

    const destination = role === 'penjual' ? '/seller/dashboard' : '/';

    if (authData.session) {
      setSuccessMessage('Pendaftaran berhasil! Mengalihkan...');
      setTimeout(() => {
        router.push(destination);
      }, 1500);
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setSuccessMessage('Pendaftaran berhasil! Silakan cek email untuk konfirmasi, lalu masuk.');
        setIsLoading(false);
      } else {
        setSuccessMessage('Berhasil masuk! Mengalihkan...');
        setTimeout(() => {
          router.push(destination);
        }, 1500);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setToastMessage('');

    localStorage.setItem('selected_role', role);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white font-sans text-slate-900">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap"
      />

      {toastMessage && (
        <div className="fixed top-6 left-1/2 z-50 w-[92%] max-w-md -translate-x-1/2">
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 shadow-lg">
            <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="flex min-h-screen">
        <aside
          className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-emerald-900 px-12 py-12 text-white lg:flex"
        >
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
              {step === 'role' ? (
                <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-emerald-700">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Kembali ke beranda
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep('role')}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-emerald-700"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Kembali ke peran
                </button>
              )}
              <Link href="/login" className="text-sm font-semibold text-emerald-700 hover:underline">
                Masuk
              </Link>
            </div>

            {step === 'role' ? (
              <div>
                <h2 style={{ fontFamily: "'Fraunces', serif" }} className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  Pilih peran kamu
                </h2>
                <p className="mt-2.5 text-sm text-slate-500">
                  Kami akan menyesuaikan pengalaman Flexa sesuai kebutuhanmu.
                </p>

                <div className="mt-8 grid grid-cols-2 gap-3.5">
                  <button
                    type="button"
                    onClick={() => setRole('pembeli')}
                    className={`relative flex flex-col items-center rounded-2xl border p-5 text-center transition-all sm:p-6 ${
                      role === 'pembeli'
                        ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {role === 'pembeli' && (
                      <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </span>
                    )}
                    <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-full ${role === 'pembeli' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <h3 style={{ fontFamily: "'Fraunces', serif" }} className="text-base font-semibold text-slate-900">Pembeli</h3>
                    <p className="mt-1 text-xs leading-snug text-slate-500">Mencari barang &amp; jasa di sekitar.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('penjual')}
                    className={`relative flex flex-col items-center rounded-2xl border p-5 text-center transition-all sm:p-6 ${
                      role === 'penjual'
                        ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {role === 'penjual' && (
                      <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </span>
                    )}
                    <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-full ${role === 'penjual' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 style={{ fontFamily: "'Fraunces', serif" }} className="text-base font-semibold text-slate-900">Penjual</h3>
                    <p className="mt-1 text-xs leading-snug text-slate-500">Ingin berjualan lewat Flexa.</p>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white transition-all hover:bg-emerald-700 active:scale-[0.99]"
                >
                  Lanjutkan sebagai {role === 'pembeli' ? 'Pembeli' : 'Penjual'}
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            ) : (
              <div>
                <h2 style={{ fontFamily: "'Fraunces', serif" }} className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  {role === 'penjual' ? 'Daftar sebagai Penjual' : 'Daftar sebagai Pembeli'}
                </h2>
                <p className="mt-2.5 text-sm text-slate-500">
                  {role === 'penjual'
                    ? 'Mulai buka toko dan jangkau pelanggan di sekitarmu.'
                    : 'Lengkapi datamu untuk mulai berbelanja dan menyewa.'}
                </p>

                {errorMessage && (
                  <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <span>{errorMessage}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{successMessage}</span>
                  </div>
                )}

                <form onSubmit={handleRegister} className="mt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Depan</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Nama depan"
                        required
                        className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Belakang</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Nama belakang"
                        className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
                      />
                    </div>
                  </div>

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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Nomor WhatsApp</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={whatsapp}
                        onChange={handleWhatsappChange}
                        placeholder="0812-3456-7890"
                        required
                        className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 pr-10 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                        <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Buat Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 8 karakter"
                        required
                        minLength={8}
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

                  <div className="flex items-start gap-2.5 pt-1">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer"
                    />
                    <label htmlFor="terms" className="text-xs leading-relaxed text-slate-500 cursor-pointer select-none">
                      Saya setuju dengan <span className="font-medium text-emerald-700 underline">Syarat &amp; Ketentuan</span> serta kebijakan privasi Flexa.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !isFormValid}
                    className={`w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-all ${
                      isFormValid && !isLoading
                        ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99]'
                        : 'cursor-not-allowed bg-slate-200 text-slate-400'
                    }`}
                  >
                    {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
                  </button>
                </form>

                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs font-medium text-slate-400">Atau daftar dengan</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
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
                  Sudah punya akun?{' '}
                  <Link href="/login" className="font-semibold text-emerald-700 hover:underline">
                    Masuk
                  </Link>
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}