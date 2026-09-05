'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SellerSideBar from '../components/SellerSideBar';
import { supabase } from '@/lib/supabaseClient';

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

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
    
      if (!profile || profile.role !== 'penjual') {
        router.replace('/');
        return;
      }
    
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

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">
      <SellerSideBar />
      <main className="flex-1 bg-slate-50 p-4 sm:p-6 lg:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}