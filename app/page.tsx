'use client';

import React, { useState } from 'react';
import NavbarGuest from './components/NavbarGuest';
import HeroGuest from './components/sections/HeroGuest';
import RecommendationSection from './components/sections/Recommendation';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <NavbarGuest searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <HeroGuest />
      <RecommendationSection searchQuery={searchQuery} />
    </main>
  );
}