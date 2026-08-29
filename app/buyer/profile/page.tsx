'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function BuyerProfilePage() {
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    birthdate: '',
    gender: 'Laki-Laki',
    email: '',
    password: '••••••••',
    address: '',
  });

  const [initialData, setInitialData] = useState({
    username: '',
    phone: '',
    birthdate: '',
    gender: 'Laki-Laki',
    address: '',
  });

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) return;

        const fetchedEmail = user.email || '';
        const fetchedPassword = user.user_metadata?.password || '••••••••';

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        const currentUsername = profileData?.username || user.user_metadata?.full_name || '';
        const currentPhone = profileData?.phone || '';
        const currentBirthdate = profileData?.birthdate || '';
        const currentGender = profileData?.gender || 'Laki-Laki';
        const currentAddress = profileData?.address || '';

        setFormData({
          username: currentUsername,
          phone: currentPhone,
          birthdate: currentBirthdate,
          gender: currentGender,
          email: fetchedEmail,
          password: fetchedPassword,
          address: currentAddress,
        });

        setInitialData({
          username: currentUsername,
          phone: currentPhone,
          birthdate: currentBirthdate,
          gender: currentGender,
          address: currentAddress,
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (notification) {
      setShowNotification(true);
      const timer = setTimeout(() => {
        setShowNotification(false);
        setTimeout(() => setNotification(null), 500);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    setFormData((prev) => ({ ...prev, username: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 13) {
      val = val.substring(0, 13);
    }
    let formatted = val;
    if (val.length > 4 && val.length <= 8) {
      formatted = `${val.substring(0, 4)}-${val.substring(4)}`;
    } else if (val.length > 8) {
      formatted = `${val.substring(0, 4)}-${val.substring(4, 8)}-${val.substring(8)}`;
    }
    setFormData((prev) => ({ ...prev, phone: formatted }));
  };

  const handleBirthdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    let formatted = '';
    if (val.length > 0) {
      formatted += val.substring(0, 2); 
    }
    if (val.length >= 3) {
      formatted += '-' + val.substring(2, 4);
    }
    if (val.length >= 5) {
      formatted += '-' + val.substring(4, 8);
    }
    setFormData((prev) => ({ ...prev, birthdate: formatted }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const handleRequestPasswordReset = async () => {
    if (!formData.email) {
      setNotification({ message: 'Email tidak ditemukan', type: 'error' });
      return;
    }

    setIsSendingResetEmail(true);
    setNotification(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setNotification({
        message: 'Email instruksi ubah password telah dikirim. Silakan cek email Anda.',
        type: 'success',
      });
    } catch (err: any) {
      setNotification({
        message: `Gagal mengirim email: ${err.message || 'Terjadi kesalahan'}`,
        type: 'error',
      });
    } finally {
      setIsSendingResetEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setNotification(null);

    const isNoChange =
      formData.username === initialData.username &&
      formData.phone === initialData.phone &&
      formData.birthdate === initialData.birthdate &&
      formData.gender === initialData.gender &&
      formData.address === initialData.address;

    if (isNoChange) {
      setNotification({ message: 'Tidak ada perubahan', type: 'info' });
      setIsSaving(false);
      return;
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Sesi login tidak ditemukan. Silakan login ulang.');
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: formData.username,
          phone: formData.phone,
          birthdate: formData.birthdate,
          gender: formData.gender,
          address: formData.address,
          updated_at: new Date(),
        });

      if (error) throw error;

      setInitialData({
        username: formData.username,
        phone: formData.phone,
        birthdate: formData.birthdate,
        gender: formData.gender,
        address: formData.address,
      });

      setNotification({ message: 'Profil telah diperbarui', type: 'success' });
    } catch (err: any) {
      setNotification({ message: `Gagal menyimpan: ${err.message || 'Terjadi kesalahan'}`, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm relative overflow-hidden">
      {notification && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-slate-100 shadow-2xl px-6 py-4 rounded-2xl flex items-center gap-3 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${showNotification ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-12 scale-95 pointer-events-none'}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white ${notification.type === 'success' ? 'bg-[#059669]' : notification.type === 'info' ? 'bg-amber-500' : 'bg-red-500'}`}>
            {notification.type === 'success' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
              </svg>
            ) : notification.type === 'info' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            )}
          </div>
          <span className="font-medium text-sm text-black/80">{notification.message}</span>
        </div>
      )}

      <h1 className="mt-3 text-2xl font-bold text-black/80 mb-6">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={handleUsernameChange}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#059669] focus:outline-none text-sm font-medium text-slate-800"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Tanggal Lahir</label>
            <input
              type="text"
              value={formData.birthdate}
              onChange={handleBirthdateChange}
              maxLength={10}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#059669] focus:outline-none text-sm font-medium text-slate-800"
              placeholder="Masukkan tanggal lahir (xx-xx-xxxx)"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nomor telepon</label>
            <input
              type="text"
              value={formData.phone}
              onChange={handlePhoneChange}
              minLength={10}
              maxLength={15}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#059669] focus:outline-none text-sm font-medium text-slate-800"
              placeholder="Masukkan nomor telepon (08xx)"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Jenis Kelamin</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, gender: 'Laki-Laki' }))}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                  formData.gender === 'Laki-Laki'
                    ? 'bg-[#059669] text-white shadow-sm'
                    : 'bg-slate-50 border border-slate-200 text-slate-700 hover:border-[#059669]'
                }`}
              >
                Laki-Laki
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, gender: 'Perempuan' }))}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                  formData.gender === 'Perempuan'
                    ? 'bg-[#059669] text-white shadow-sm'
                    : 'bg-slate-50 border border-slate-200 text-slate-700 hover:border-[#059669]'
                }`}
              >
                Perempuan
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-sm font-medium text-slate-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <input
                type="password"
                value={formData.password}
                disabled
                className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-sm font-medium text-slate-400 cursor-not-allowed"
              />
              <button
                type="button"
                onClick={handleRequestPasswordReset}
                disabled={isSendingResetEmail}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#059669] hover:underline disabled:opacity-50"
              >
                {isSendingResetEmail ? 'Mengirim...' : 'Ubah'}
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Alamat Lengkap</label>
          <textarea
            rows={4}
            value={formData.address}
            onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#059669] focus:outline-none text-sm font-medium text-slate-800"
            placeholder="Masukkan alamat lengkap"
          />
        </div>

        <div className="flex flex-row gap-4 pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 bg-[#059669] text-white font-bold text-sm py-3.5 rounded-xl hover:bg-emerald-700 active:scale-98 transition-all shadow-sm disabled:opacity-50"
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  );
}