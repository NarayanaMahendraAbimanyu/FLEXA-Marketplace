'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

const PLACEHOLDERS = [
  'Cari barang sewa...',
  'Cari jasa pembuatan website...',
  'Cari jasa desain poster UMKM...',
  'Cari proyektor & peralatan event...'
];

interface NavbarSellerProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onSearchSubmit?: (val: string) => void;
}

export default function NavbarSeller({ searchQuery, onSearchChange, onSearchSubmit }: NavbarSellerProps) {
  const router = useRouter();
  const [placeholderText, setPlaceholderText] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  useEffect(() => {
    const currentFullText = PLACEHOLDERS[placeholderIndex];
    let typingSpeed = isDeleting ? 40 : 80;

    if (!isDeleting && charIndex === currentFullText.length) {
      typingSpeed = 1800;
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
      typingSpeed = 400;
    }

    const timer = setTimeout(() => {
      if (!isDeleting && charIndex < currentFullText.length) {
        setPlaceholderText(currentFullText.substring(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
      } else if (isDeleting && charIndex > 0) {
        setPlaceholderText(currentFullText.substring(0, charIndex - 1));
        setCharIndex((prev) => prev - 1);
      } else if (!isDeleting && charIndex === currentFullText.length) {
        setIsDeleting(true);
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, placeholderIndex]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleSearchAction = () => {
    if (searchQuery.trim() !== '') {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/');
    }
    if (onSearchSubmit) onSearchSubmit(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchAction();
    }
  };

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-0 sm:h-20 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 md:gap-6">

        <div className="w-full sm:w-auto flex items-center justify-between shrink-0">
          <Link
            href="/"
            onClick={scrollToTop}
            className="flex items-center cursor-pointer active:scale-98 transition-all duration-200"
          >
            <Image
              src="/flexa-logo-green.png"
              alt="Flexa Logo"
              width={140}
              height={40}
              priority
              className="h-8 sm:h-9 md:h-10 w-auto object-contain"
            />
          </Link>

          <div className="flex items-center gap-1 sm:hidden">
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="p-2 text-black/70 hover:text-[#059669] focus:outline-none"
            >
              <svg className="w-6 h-6 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <Link
              href="/seller/dashboard"
              className="flex items-center gap-1.5 px-3 py-2 bg-[#059669] hover:bg-emerald-700 active:scale-95 duration-200 transition-all text-white font-bold text-xs rounded-xl shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Dashboard</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              title="Keluar"
            >
              <svg className="w-5 h-5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        <div className={`w-full sm:flex-1 max-w-2xl ${isMobileSearchOpen ? 'block' : 'hidden sm:block'}`}>
          <div className="relative flex items-center w-full bg-[#f4f4f4] border-1 border-transparent focus-within:border-[#059669] focus-within:ring-1 focus-within:ring-[#059669] rounded-full p-1 sm:p-1.5 md:p-2 pl-4 sm:pl-5 md:pl-6 transition-all duration-200 shadow-inner">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholderText}
              className="w-full bg-transparent text-xs sm:text-sm md:text-base text-black/80 placeholder-black/40 focus:outline-none pr-2"
            />
            <button
              type="button"
              onClick={handleSearchAction}
              className="bg-[#059669] hover:scale-110 text-white p-1.5 sm:p-2 md:p-2.5 rounded-full transition-all duration-200 shrink-0 flex items-center justify-center shadow-sm active:scale-95"
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5 stroke-[2.5]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 md:gap-3 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-[#059669] text-[10px] sm:text-xs font-bold rounded-full">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125h-15A1.125 1.125 0 013 18.4v-4.25m18-1.5V6.75c0-.621-.504-1.125-1.125-1.125h-15C4.254 5.625 3.75 6.129 3.75 6.75v5.9m18 0h-18" />
            </svg>
            Mode Penjual
          </span>

          <div className="h-6 w-[1px] bg-slate-300"></div>

          <Link
            href="/seller/dashboard"
            className="flex items-center gap-2 px-4 md:px-5 py-2.5 bg-[#059669] hover:bg-emerald-700 hover:scale-[1.03] active:scale-[0.98] duration-200 transition-all text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Ke Dashboard</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="p-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
            title="Keluar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

      </div>
    </header>
  );
}