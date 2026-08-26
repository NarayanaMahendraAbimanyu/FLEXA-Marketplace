'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import NavbarGuest from './components/NavbarGuest';
import NavbarBuyer from './components/NavbarBuyer';
import HeroGuest from './components/sections/Hero';
import RecommendationSection from './components/sections/Recommendation';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function checkUserSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsLoggedIn(true);
      }
    }
    checkUserSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      {isLoggedIn ? (
        <NavbarBuyer searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      ) : (
        <NavbarGuest searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      )}
      
      <HeroGuest isLoggedIn={isLoggedIn} />
      
      <RecommendationSection searchQuery={searchQuery} isLoggedIn={isLoggedIn} />
    </main>
  );
}