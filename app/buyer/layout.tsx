'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BuyerSidebar from '../components/BuyerSideBar';
import { supabase } from '@/lib/supabaseClient';

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [accessState, setAccessState] = useState<'allowed' | 'wrong_role' | 'not_logged_in'>('allowed');

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile || profile.role !== 'pembeli') {
        setAccessState('wrong_role');
        setIsChecking(false);
        return;
      }

      setAccessState('allowed');
      setIsChecking(false);
    }
    checkAuth();
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <span className="text-black/40 text-sm font-medium">Memuat...</span>
      </div>
    );
  }

  if (accessState === 'wrong_role') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 max-w-md w-full text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-black/80">Halaman Khusus Pembeli</h2>
            <p className="text-xs sm:text-sm text-black/60 leading-relaxed">
              Akun Anda saat ini terdaftar sebagai <span className="font-semibold">Penjual</span>. Untuk melihat halaman ini, silakan beralih menjadi akun Pembeli terlebih dahulu.
            </p>
          </div>
          <Link
            href="/"
            className="inline-block w-full py-3 bg-[#059669] hover:bg-emerald-700 hover:scale-[1.02] active:scale-95 duration-200 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/20"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          <BuyerSidebar />
          <div className="w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}