'use client';

import React from 'react';
import Link from 'next/link';

export default function HeroGuest() {
  return (
    <section className="relative bg-[#292929] text-white pt-20 sm:pt-24 md:pt-28 pb-20 sm:pb-24 md:pb-28 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="text-[26vw] font-black text-white/[0.035] tracking-widest leading-none uppercase whitespace-nowrap">
          FLEXA
        </span>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
          Sewa Barang & Jasa Digital
        </h1>
        
        <div className="mt-2 sm:mt-3 flex items-center justify-center gap-2 text-3xl sm:text-4xl md:text-5xl font-extrabold">
          <span>With</span>
          <span className="bg-[#059669] text-white px-3 py-0.5 sm:px-4 sm:py-1 rounded-lg inline-block">
            FLEXA.
          </span>
        </div>

        <p className="mt-4 sm:mt-6 max-w-2xl mx-auto text-xs sm:text-base md:text-lg text-white/60 leading-relaxed font-normal">
          Lihat-lihat dulu, daftar nanti. Temukan ratusan peralatan untuk disewa dan jasa digital, mulai dari sewa drone hingga jasa desain logo.
        </p>

        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/signin"
            className="w-full sm:w-auto bg-white hover:bg-[#047857] border-2 border-white hover:border-[#047857] text-black/90 hover:text-white font-medium text-xs sm:text-sm px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:scale-105 active:scale-95"
          >
            Buat akun gratis &rarr;
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto border-2 border-white/80 hover:border-white text-white font-medium text-xs sm:text-sm px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 hover:bg-white/10 active:scale-95 flex items-center justify-center gap-2"
          >
            Sudah punya akun?
          </Link>
        </div>
      </div>
    </section>
  );
}