'use client';

import React, { useState, useEffect, useRef } from 'react';
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

interface NavbarBuyerProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onSearchSubmit?: (val: string) => void;
}

export default function NavbarBuyer({ searchQuery, onSearchChange, onSearchSubmit }: NavbarBuyerProps) {
  const router = useRouter();
  const [placeholderText, setPlaceholderText] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
        const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
        setUserName(fullName);
        setUserEmail(user.email || '');
        setUserAvatar(avatarUrl);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

          <div className="flex items-center gap-1 sm:hidden relative" ref={mobileMenuRef}>
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="p-2 text-black/70 hover:text-[#059669] focus:outline-none"
            >
              <svg className="w-6 h-6 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            <Link href="/cart" className="text-[#059669] hover:text-[#047857] transition-colors p-2 relative">
              <svg className="w-6 h-6 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H19m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </Link>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-black/70 hover:text-[#059669] focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            {isMobileMenuOpen && (
              <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-2xl py-3 px-3 flex flex-col gap-2 z-50 border border-[#059669] animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-3 px-3 py-2 border-b border-slate-100 mb-1">
                  <div className="w-8 h-8 rounded-full bg-[#059669] text-white overflow-hidden flex items-center justify-center shrink-0">
                    {userAvatar ? (
                      <Image src={userAvatar} alt={userName} width={32} height={32} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-bold text-black/80 truncate">{userName}</span>
                    <span className="text-[10px] text-black/50 truncate">{userEmail}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <Link
                    href="/dashboard/buyer/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-left py-2 px-3 text-black/70 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 hover:bg-[#059669] hover:text-white flex items-center gap-2.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Akun Saya
                  </Link>

                  <Link
                    href="/dashboard/buyer/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-left py-2 px-3 text-black/70 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 hover:bg-[#059669] hover:text-white flex items-center gap-2.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Pesanan Saya
                  </Link>
                </div>

                <div className="border-t border-black/10 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left py-2 px-3 text-red-600 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 hover:bg-red-50 flex items-center gap-2.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Log Out
                  </button>
                </div>
              </div>
            )}
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

        <div className="hidden sm:flex items-center gap-2 md:gap-4 shrink-0">
          <Link href="/buyer/cart" className="text-[#059669] hover:text-[#047857] transition-colors p-2 relative">
            <svg className="w-6 h-6 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H19m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </Link>

          <div className="h-6 w-[1px] bg-slate-300"></div>

          <div 
            className="relative" 
            ref={dropdownRef}
          >
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 bg-[#059669] active:scale-98 duration-200 transition-all text-white py-1.5 pl-1.5 pr-4 rounded-full cursor-pointer shadow-md select-none"
            >
              <div className="w-9 h-9 rounded-full bg-white text-[#059669] overflow-hidden flex items-center justify-center shadow-sm relative shrink-0">
                {userAvatar ? (
                  <Image 
                    src={userAvatar} 
                    alt={userName} 
                    width={32} 
                    height={32} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <span className="text-xs sm:text-sm font-medium truncate max-w-[110px]">
                {userName}
              </span>
            </div>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl py-3 px-3 flex flex-col gap-2 z-50 border border-[#059669] animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex flex-col gap-1">
                  <Link
                    href="/dashboard/buyer/profile"
                    className="w-full text-left py-2 px-3 text-slate-700 text-xs sm:text-sm font-medium rounded-xl transition-all duration-200 hover:bg-[#059669] hover:text-white flex items-center gap-2.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Akun Saya
                  </Link>

                  <Link
                    href="/dashboard/buyer/orders"
                    className="w-full text-left py-2 px-3 text-slate-700 text-xs sm:text-sm font-medium rounded-xl transition-all duration-200 hover:bg-[#059669] hover:text-white flex items-center gap-2.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Pesanan Saya
                  </Link>
                </div>

                <div className="border-t border-black/20 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left py-2 px-3 text-red-600 text-xs sm:text-sm font-medium rounded-xl transition-all duration-200 hover:bg-red-50 flex items-center gap-2.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}