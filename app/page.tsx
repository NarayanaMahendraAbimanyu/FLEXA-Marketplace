'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import NavbarGuest from './components/NavbarGuest';
import NavbarBuyer from './components/NavbarBuyer';
import NavbarSeller from './components/NavbarSeller';
import HeroGuest from './components/sections/Hero';
import RecommendationSection from './components/sections/Recommendation';

function MainContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchFromUrl = searchParams.get('search') || '';
  const categoryFromUrl = searchParams.get('category') || '';

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isRoleChecked, setIsRoleChecked] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);

  useEffect(() => {
    setSearchQuery(searchFromUrl);
  }, [searchFromUrl]);

  useEffect(() => {
    async function checkUserSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsLoggedIn(true);

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();

        setUserRole(profile?.role || null);
      }
      setIsRoleChecked(true);
    }
    checkUserSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoggedIn(!!session);
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();
        setUserRole(profile?.role || null);
      } else {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSearchSubmit = (val: string) => {
    if (val.trim() !== '') {
      router.push(`/?search=${encodeURIComponent(val)}`);
    } else {
      router.push('/');
    }
  };

  const isSeller = isLoggedIn && userRole === 'penjual';

  return (
    <main className="min-h-screen bg-white">
      {!isRoleChecked ? (
        <div className="w-full h-20 border-b border-slate-200 bg-white" />
      ) : isSeller ? (
        <NavbarSeller 
          searchQuery={searchQuery} 
          onSearchChange={setSearchQuery} 
          onSearchSubmit={handleSearchSubmit}
        />
      ) : isLoggedIn ? (
        <NavbarBuyer 
          searchQuery={searchQuery} 
          onSearchChange={setSearchQuery} 
          onSearchSubmit={handleSearchSubmit}
        />
      ) : (
        <NavbarGuest 
          searchQuery={searchQuery} 
          onSearchChange={setSearchQuery} 
        />
      )}
      
      <HeroGuest isLoggedIn={isLoggedIn} />
      
      <RecommendationSection searchQuery={searchQuery} isLoggedIn={isLoggedIn} initialCategory={categoryFromUrl} />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <MainContent />
    </Suspense>
  );
}