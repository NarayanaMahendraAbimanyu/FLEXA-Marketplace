'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const PLACEHOLDERS = [
  'Cari barang sewa...',
  'Cari jasa pembuatan website...',
  'Cari jasa desain poster UMKM...',
  'Cari proyektor & peralatan event...'
];

interface NavbarGuestProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function NavbarGuest({ searchQuery, onSearchChange }: NavbarGuestProps) {
  const [placeholderText, setPlaceholderText] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

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

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-0 sm:h-20 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 md:gap-6">
        
        <div className="w-full sm:w-auto flex items-center justify-between shrink-0">
          <div 
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
          </div>

          <div className="flex items-center gap-2 sm:hidden">
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="p-2 text-slate-600 hover:text-[#059669] focus:outline-none"
            >
              <svg className="w-6 h-6 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <Link 
              href="/login"
              className="border-2 border-[#059669] text-[#059669] font-semibold text-xs px-3 py-1.5 rounded-lg"
            >
              Masuk
            </Link>
            <Link 
              href="/signin"
              className="bg-[#059669] text-white font-semibold text-xs px-3 py-1.5 rounded-lg"
            >
              Daftar
            </Link>
          </div>
        </div>

        <div className={`w-full sm:flex-1 max-w-2xl ${isMobileSearchOpen ? 'block' : 'hidden sm:block'}`}>
          <div className="relative flex items-center w-full bg-[#f4f4f4] border-1 border-transparent focus-within:border-[#059669] focus-within:ring-1 focus-within:ring-[#059669] rounded-full p-1 sm:p-1.5 md:p-2 pl-4 sm:pl-5 md:pl-6 transition-all duration-200 shadow-inner">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={placeholderText}
              className="w-full bg-transparent text-xs sm:text-sm md:text-base text-black/80 placeholder-black/40 focus:outline-none pr-2"
            />
            <button 
              type="button"
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
          <Link 
            href="/login"
            className="border-2 border-[#059669] text-[#059669] hover:bg-[#059669] hover:text-white font-semibold text-xs md:text-sm px-3 md:px-6 py-1.5 md:py-2.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            Masuk
          </Link>

          <Link 
            href="/signin"
            className="bg-[#059669]  border-2 border-[#059669] text-white font-semibold text-xs md:text-sm px-3 md:px-6 py-1.5 md:py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            Daftar
          </Link>
        </div>

      </div>
    </header>
  );
}