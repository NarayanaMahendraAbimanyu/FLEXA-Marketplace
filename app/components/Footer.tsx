'use client';

import React from 'react';
import Image from 'next/image';

export default function FooterGuest() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="w-full bg-white border-t border-slate-200 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center cursor-pointer transition-transform hover:opacity-90 active:scale-95 focus:outline-none"
          >
            <Image
              src="/flexa-logo-green.png"
              alt="Flexa Logo"
              width={100}
              height={30}
              priority
              className="h-6 sm:h-8 w-auto object-contain"
            />
          </button>

          <span className="text-slate-300">|</span>

          <p className="text-xs sm:text-sm text-slate-500 whitespace-nowrap">
            © {new Date().getFullYear()} FLEXA.
          </p>
        </div>

        <button
          type="button"
          onClick={scrollToTop}
          className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#059669] transition-colors focus:outline-none"
        >
          <span>Kembali ke Atas</span>
          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
            <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          </div>
        </button>

      </div>
    </footer>
  );
}