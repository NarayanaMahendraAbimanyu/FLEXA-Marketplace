'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';

export default function BuyerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState('Nama User');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) return;

        const { data: profileData } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', user.id)
          .single();

        if (profileData && profileData.username) {
          setUserName(profileData.username);
        } else if (user.user_metadata?.username) {
          setUserName(user.user_metadata.username);
        } else if (user.user_metadata?.full_name || user.user_metadata?.name) {
          setUserName(user.user_metadata.full_name || user.user_metadata.name);
        }

        if (profileData?.avatar_url) {
          setAvatarUrl(profileData.avatar_url);
        } else if (user.user_metadata?.avatar_url || user.user_metadata?.picture) {
          setAvatarUrl(user.user_metadata.avatar_url || user.user_metadata.picture);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchUserProfile();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        await supabase
          .from('profiles')
          .upsert({ id: user.id, avatar_url: publicUrl, updated_at: new Date() });
          
        setAvatarUrl(publicUrl);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const menuItems = [
    {
      label: 'Profil Saya',
      href: '/buyer/profile',
      icon: (
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      ),
    },
    {
      label: 'Keranjang Saya',
      href: '/buyer/cart',
      icon: (
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      ),
    },
    {
      label: 'Pesanan Saya',
      href: '/buyer/purchase',
      icon: (
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.09-.34.14-.57.14s-.41-.05-.57-.14l-7.9-4.44A1.003 1.003 0 0 1 3 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.09.34-.14.57-.14s.41.05.57.14l7.9 4.44c.32.17.53.5.53.88v9zM12 4.15L5 8.09v7.82l7 3.93 7-3.93V8.09l-7-3.94zM12 12.5l-5-2.81 5-2.81 5 2.81-5 2.81z"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="w-full lg:w-72 bg-white rounded-3xl border border-slate-200/80 p-6 flex flex-col justify-between shadow-sm relative">
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
          <div className="relative mb-4">
            <label className="w-24 h-24 rounded-full bg-slate-200 overflow-hidden border-2 border-emerald-500/20 flex items-center justify-center text-slate-400 relative cursor-pointer group">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
              ) : (
                <svg className="w-12 h-12 fill-current group-hover:text-slate-500 transition-colors" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              )}
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#059669] hover:bg-emerald-700 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md transition-all">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M4 5h3l2-2h6l2 2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm8 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0-2a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
              </svg>
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          </div>
          <h2 className="text-base font-bold text-black/70 text-center tracking-tight">{userName}</h2>
        </div>

        <nav className="mt-6 grid grid-cols-3 md:grid-cols-1 gap-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
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
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.1 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
          </svg>
          <span>Keluar</span>
        </button>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
            <h3 className="text-lg font-bold text-black/80 mb-2">Yakin ingin keluar?</h3>
            <p className="text-sm text-black/60 font-medium mb-6">Anda akan keluar dari sesi akun ini.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl hover:scale-105 active:scale-97 duration-200 border border-black/50 font-semibold text-sm text-black/70 transition-all"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 rounded-xl hover:scale-105 active:scale-97 duration-200 bg-red-500 font-semibold text-sm text-white hover:bg-red-600 transition-all"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}