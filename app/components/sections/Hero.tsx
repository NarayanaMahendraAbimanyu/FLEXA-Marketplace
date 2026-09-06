'use client';

import React from 'react';
import Link from 'next/link';

interface HeroProps {
  isLoggedIn?: boolean;
}

export default function HeroGuest({ isLoggedIn }: HeroProps) {
  return (
    <section className="relative bg-[#232323] text-white pt-20 sm:pt-24 md:pt-28 pb-20 sm:pb-24 md:pb-28 overflow-hidden">
      {/* soft brand glow — one deliberate accent, not scattered */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] sm:w-[760px] sm:h-[760px] bg-emerald-500/10 rounded-full blur-[110px] pointer-events-none" />

      {/* thin brand line, ties into the green identity used across the site */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#059669]/60 to-transparent" />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="text-[26vw] font-black text-white/[0.035] tracking-widest leading-none uppercase whitespace-nowrap">
          FLEXA
        </span>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
          Sewa Barang & Jasa Digital
        </h1>

        <div className="mt-2 sm:mt-3 flex items-center justify-center gap-2 sm:gap-3 text-3xl sm:text-4xl md:text-5xl font-extrabold">
          <span className="text-white/70 font-medium">With</span>
          <span className="bg-[#059669] text-white px-3 py-0.5 sm:px-4 sm:py-1 rounded-lg inline-block shadow-[0_10px_28px_-8px_rgba(5,150,105,0.55)]">
            FLEXA.
          </span>
        </div>

        <p className="mt-4 sm:mt-6 max-w-2xl mx-auto text-xs sm:text-base md:text-lg text-white/60 leading-relaxed font-normal">
          Lihat-lihat dulu, daftar nanti. Temukan ratusan peralatan untuk disewa dan jasa digital, mulai dari sewa drone hingga jasa desain logo.
        </p>

        {!isLoggedIn && (
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/signin"
              className="group w-full sm:w-auto bg-[#059669] hover:bg-[#047857] text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-full transition-all duration-200 shadow-lg shadow-emerald-900/30 hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Buat akun gratis</span>
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] transition-transform duration-200 group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto border border-white/25 hover:border-white/50 text-white/90 hover:text-white font-medium text-xs sm:text-sm px-6 py-3 rounded-full transition-all duration-200 hover:bg-white/5 active:scale-95 flex items-center justify-center gap-2"
            >
              Sudah punya akun?
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}