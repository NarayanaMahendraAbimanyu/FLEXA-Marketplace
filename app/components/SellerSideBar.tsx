'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function SellerSideBar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30">
        <Image
          src="/flexa-logo-green.png"
          alt="Flexa Logo"
          width={100}
          height={30}
          className="h-8 w-auto object-contain"
          priority
        />
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors focus:outline-none"
          aria-label="Toggle Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {isOpen && (
        <div 
          onClick={toggleSidebar} 
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      <aside className={`fixed md:static top-0 right-0 h-full md:h-auto z-50 w-64 border-l md:border-l-0 md:border-r border-slate-200 bg-white flex flex-col justify-between p-6 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
      }`}>
        <div>
          <div className="mb-8 hidden md:block">
            <div>
              <Image
                src="/flexa-logo-green.png"
                alt="Flexa Logo"
                width={120}
                height={36}
                className="h-12 w-auto object-contain cursor-pointer hover:scale-105 active:scale-95 duration-200 transition-all"
                priority
              />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3">TOKO</p>
            <nav className="space-y-1">
              <Link
                href="/seller/dashboard"
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive('/seller/dashboard')
                    ? 'bg-[#059669]/20 text-[#059669] font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/seller/product"
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive('/seller/product')
                    ? 'bg-[#059669]/20 text-[#059669] font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Katalog
              </Link>
              <Link
                href="/seller/orders"
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive('/seller/orders')
                    ? 'bg-[#059669]/20 text-[#059669] font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>Pesanan</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isActive('/seller/orders')
                    ? 'bg-[#059669] text-white'
                    : 'bg-slate-200 text-black/80'
                }`}>
                  2
                </span>
              </Link>
              <Link
                href="/seller/chat"
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive('/seller/chat')
                    ? 'bg-[#059669]/20 text-[#059669] font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Chat
              </Link>
              <Link
                href="/seller/income"
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive('/seller/income')
                    ? 'bg-[#059669]/20 text-[#059669] font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Keuangan
              </Link>
            </nav>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3">AKUN</p>
            <nav className="space-y-1">
              <Link
                href="/seller/storeSettings"
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive('/seller/storeSettings')
                    ? 'bg-[#059669]/20 text-[#059669] font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Pengaturan Toko
              </Link>
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}