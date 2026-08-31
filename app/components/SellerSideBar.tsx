'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function SellerSideBar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between p-6 md:flex">
      <div>
        <div className="mb-8">
          <Link href="/">
            <Image
              src="/flexa-logo-green.png"
              alt="Flexa Logo"
              width={120}
              height={36}
              className="h-12 w-auto object-contain cursor-pointer hover:scale-105 active:scale-95 duration-200 transition-all"
              priority
            />
          </Link>
        </div>

        <div className="mb-6">
          <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3">TOKO</p>
          <nav className="space-y-1">
            <Link
              href="/seller/dashboard"
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
              className={`flex items-center px-4 py-2.5 rounded-xl text-sm transition-colors ${
                isActive('/seller/product')
                  ? 'bg-[#059669]/20 text-[#059669] font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Katalog
            </Link>
            <Link
              href="/seller/pesanan"
              className={`flex items-center px-4 py-2.5 rounded-xl text-sm transition-colors ${
                isActive('/seller/pesanan')
                  ? 'bg-[#059669]/20 text-[#059669] font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Pesanan
            </Link>
            <Link
              href="/seller/income"
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
  );
}