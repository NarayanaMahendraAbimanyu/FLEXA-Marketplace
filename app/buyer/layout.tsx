'use client';

import React, { useEffect, useState } from 'react';
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