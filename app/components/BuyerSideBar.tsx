'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function BuyerSidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      label: 'Profil Saya',
      href: '/buyer/profile',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      ),
    },
    {
      label: 'Keranjang Saya',
      href: '/buyer/cart',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      ),
    },
    {
      label: 'Pesanan Saya',
      href: '/buyer/purchase',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm10 15H4V8h16v11z"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="w-full lg:w-72 bg-white rounded-3xl border border-slate-200/80 p-6 flex flex-col justify-between shadow-sm">
      <div>
        <div className="pb-6 mb-6 border-b border-slate-100 flex items-center">
          <Link href="/" className="inline-block">
            <Image
              src="/flexa-logo-green.png"
              alt="Flexa Logo"
              width={140}
              height={40}
              priority
              className="h-8 sm:h-9 md:h-10 w-auto object-contain"
            />
          </Link>
        </div>

        <div className="flex flex-col items-center pb-6 border-b border-slate-100">
          <div className="w-24 h-24 rounded-full bg-slate-200 overflow-hidden mb-4 border-2 border-emerald-500/20 flex items-center justify-center text-slate-400">
            <svg className="w-12 h-12 fill-current" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <h2 className="text-base font-bold text-slate-800 tracking-tight">Nama User</h2>
        </div>

        <nav className="mt-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-[#059669] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#059669]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-6 mt-6 border-t border-slate-100">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.1 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
          </svg>
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );
}