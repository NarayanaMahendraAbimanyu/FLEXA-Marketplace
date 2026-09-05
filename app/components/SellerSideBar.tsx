'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function SellerSideBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const isActive = (path: string) => pathname === path;

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    router.push('/app/login');
  };

  const fetchUnreadChatCount = async (userId: string) => {
    const { data: convs } = await supabase
      .from('conversations')
      .select('id')
      .eq('seller_id', userId);

    if (!convs || convs.length === 0) {
      setUnreadChatCount(0);
      return;
    }

    const ids = convs.map((c) => c.id);
    const { count } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .in('conversation_id', ids)
      .eq('is_read', false)
      .neq('sender_id', userId);

    setUnreadChatCount(count || 0);
  };

  useEffect(() => {
    const initUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    initUser();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    fetchUnreadChatCount(currentUserId);

    const channel = supabase
      .channel('sidebar-unread-messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => fetchUnreadChatCount(currentUserId)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations', filter: `seller_id=eq.${currentUserId}` },
        () => fetchUnreadChatCount(currentUserId)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  const menuItemClass = (path: string) =>
    `group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
      isActive(path)
        ? 'bg-[#059669] text-white font-bold shadow-md shadow-emerald-200'
        : 'text-slate-600 hover:bg-slate-100 hover:translate-x-0.5'
    }`;

  const iconClass = (path: string) =>
    `w-[18px] h-[18px] flex-shrink-0 ${
      isActive(path) ? 'text-white' : 'text-slate-400 group-hover:text-[#059669]'
    }`;

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
          className="relative p-2 rounded-xl bg-[#059669] active:scale-90 transition-all text-white focus:outline-none"
          aria-label="Toggle Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
          {!isOpen && unreadChatCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1 ring-2 ring-white">
              {unreadChatCount > 9 ? '9+' : unreadChatCount}
            </span>
          )}
        </button>
      </div>

      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 md:hidden"
        />
      )}

      <aside
        className={`fixed md:static top-0 right-0 h-full md:h-auto z-50 w-72 md:w-64 lg:w-72 border-l md:border-l-0 md:border-r border-slate-200 bg-white flex flex-col p-5 sm:p-6 shadow-2xl md:shadow-none transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mb-8 hidden md:flex items-center justify-between min-w-0">
            <Image
              src="/flexa-logo-green.png"
              alt="Flexa Logo"
              width={120}
              height={36}
              className="h-10 lg:h-12 w-auto object-contain cursor-pointer hover:scale-105 active:scale-95 duration-200 transition-all"
              priority
            />
          </div>

          <div className="mb-7">
            <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-3 px-1">TOKO</p>
            <nav className="space-y-1.5">
              <Link href="/seller/dashboard" onClick={() => setIsOpen(false)} className={menuItemClass('/seller/dashboard')}>
                <svg className={iconClass('/seller/dashboard')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Dashboard</span>
              </Link>

              <Link href="/seller/product" onClick={() => setIsOpen(false)} className={menuItemClass('/seller/product')}>
                <svg className={iconClass('/seller/product')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span>Katalog</span>
              </Link>

              <Link href="/seller/orders" onClick={() => setIsOpen(false)} className={`${menuItemClass('/seller/orders')} justify-between`}>
                <span className="flex items-center gap-3">
                  <svg className={iconClass('/seller/orders')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <span>Pesanan</span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    isActive('/seller/orders') ? 'bg-white/25 text-white' : 'bg-slate-200 text-black/70'
                  }`}
                >
                  2
                </span>
              </Link>

              <Link href="/seller/chat" onClick={() => setIsOpen(false)} className={`${menuItemClass('/seller/chat')} justify-between`}>
                <span className="flex items-center gap-3">
                  <svg className={iconClass('/seller/chat')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Chat</span>
                </span>
                {unreadChatCount > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      isActive('/seller/chat') ? 'bg-white/25 text-white' : 'bg-red-500 text-white'
                    }`}
                  >
                    {unreadChatCount > 99 ? '99+' : unreadChatCount}
                  </span>
                )}
              </Link>

              <Link href="/seller/income" onClick={() => setIsOpen(false)} className={menuItemClass('/seller/income')}>
                <svg className={iconClass('/seller/income')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 10v2m9-8a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Keuangan</span>
              </Link>
            </nav>
          </div>

          <div>
            <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-3 px-1">AKUN</p>
            <nav className="space-y-1.5">
              <Link href="/seller/storeSettings" onClick={() => setIsOpen(false)} className={menuItemClass('/seller/storeSettings')}>
                <svg className={iconClass('/seller/storeSettings')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Pengaturan Toko</span>
              </Link>

              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowLogoutModal(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 active:scale-[0.98] transition-all font-semibold"
              >
                <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Keluar</span>
              </button>
            </nav>
          </div>
        </div>
      </aside>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">Konfirmasi Keluar</h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-6">Apakah Anda yakin ingin keluar dari akun toko ini?</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-black/70 border border-black/15 hover:border-black/40 hover:bg-slate-50 duration-200 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-200 transition-all hover:scale-[1.02] active:scale-95 duration-200"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}