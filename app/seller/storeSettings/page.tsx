'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabaseClient'

interface StoreSettingsData {
  id?: string
  user_id: string
  store_name: string
  store_description?: string | null
  store_address?: string | null
  banner_url: string | null
  logo_url: string | null
  store_avatar?: string | null
  updated_at?: string
}

interface NotificationState {
  message: string
  type: 'success' | 'error'
}

export default function StoreSettingsPage() {
  const [loading, setLoading] = useState<boolean>(false)
  const [storeName, setStoreName] = useState<string>('')
  const [storeDescription, setStoreDescription] = useState<string>('')
  const [storeAddress, setStoreAddress] = useState<string>('')
  const [bannerUrl, setBannerUrl] = useState<string>('')
  const [logoUrl, setLogoUrl] = useState<string>('')
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const [notification, setNotification] = useState<NotificationState | null>(null)
  const [isNotifAnimatingOut, setIsNotifAnimatingOut] = useState<boolean>(false)

  useEffect(() => {
    const getSessionAndSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        fetchStoreSettings(user.id)
      }
    }
    getSessionAndSettings()
  }, [])

  const triggerNotification = (message: string, type: 'success' | 'error') => {
    setIsNotifAnimatingOut(false)
    setNotification({ message, type })

    setTimeout(() => {
      setIsNotifAnimatingOut(true)
      setTimeout(() => {
        setNotification(null)
        setIsNotifAnimatingOut(false)
      }, 500)
    }, 3000)
  }

  const fetchStoreSettings = async (currentUserId: string): Promise<void> => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('user_id', currentUserId)
        .single()

      if (data) {
        const storeData = data as StoreSettingsData
        setStoreName(storeData.store_name || '')
        setStoreDescription(storeData.store_description || '')
        setStoreAddress(storeData.store_address || '')
        setBannerUrl(storeData.banner_url || '')
        setLogoUrl(storeData.logo_url || storeData.store_avatar || '')
      }
    } catch (error: any) {
      console.error('Error fetching settings:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('store-assets')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data } = supabase.storage
      .from('store-assets')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (!userId) {
      triggerNotification('User tidak ditemukan. Silakan login terlebih dahulu.', 'error')
      return
    }

    try {
      setLoading(true)

      let finalBannerUrl: string | null = bannerUrl
      let finalLogoUrl: string | null = logoUrl

      if (bannerFile) {
        finalBannerUrl = await uploadFile(bannerFile, 'banners')
      }

      if (logoFile) {
        finalLogoUrl = await uploadFile(logoFile, 'logos')
      }

      const updates: StoreSettingsData = {
        user_id: userId,
        store_name: storeName,
        store_description: storeDescription,
        store_address: storeAddress,
        banner_url: finalBannerUrl,
        logo_url: finalLogoUrl,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('store_settings')
        .upsert(updates, { onConflict: 'user_id' })

      if (error) throw error

      triggerNotification('Pengaturan toko berhasil disimpan!', 'success')
      fetchStoreSettings(userId)
      setBannerFile(null)
      setLogoFile(null)
    } catch (error: any) {
      triggerNotification('Terjadi kesalahan saat menyimpan: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full px-2 sm:px-2 lg:px-2 relative pb-10">
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <div
            className={`px-5 py-3 rounded-2xl shadow-lg text-sm font-normal flex items-center gap-3 transition-all duration-300 transform bg-white border ${
              notification.type === 'success' ? 'border-[#059669]/30 text-black/80' : 'border-red-300 text-black/80'
            } ${isNotifAnimatingOut ? '-translate-y-20 opacity-0' : 'translate-y-0 opacity-100'}`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
              notification.type === 'success' ? 'bg-emerald-50 text-[#059669]' : 'bg-red-50 text-red-500'
            }`}>
              {notification.type === 'success' ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </span>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <div className="mb-6 sm:mb-8 pb-5 sm:pb-6 border-b border-slate-300">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-black/85 mb-1.5">Pengaturan Toko</h1>
        <p className="text-xs sm:text-sm text-black/45 font-normal">Kelola identitas dan informasi toko yang tampil ke pembeli.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 6h16v12H4V6z" />
              </svg>
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-medium text-black/80">Banner Toko</h2>
              <p className="text-[11px] text-black/40 font-normal">Rekomendasi rasio 16:9 (1280 x 720 px)</p>
            </div>
          </div>

          <div className="w-full aspect-video max-h-48 sm:max-h-56 lg:max-h-64 bg-slate-50 rounded-2xl overflow-hidden border border-dashed border-slate-200 flex items-center justify-center mx-auto">
            {bannerFile ? (
              <img src={URL.createObjectURL(bannerFile)} alt="Banner Preview" className="w-full h-full object-cover" />
            ) : bannerUrl ? (
              <img src={bannerUrl} alt="Banner Toko" className="w-full h-full object-cover" />
            ) : (
              <span className="text-black/30 text-sm font-normal">Belum ada banner</span>
            )}
          </div>
          <div className="flex items-center gap-2.5 mt-4">
            <label className="cursor-pointer bg-slate-50 hover:bg-slate-100 text-black/70 border border-transparent hover:border-black/70 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200">
              {bannerUrl || bannerFile ? 'Ganti Banner' : 'Tambah Banner'}
              <input type="file" accept="image/*" className="hidden" onChange={(e: React.ChangeEvent<HTMLInputElement>) => e.target.files?.[0] && setBannerFile(e.target.files[0])} />
            </label>
            {(bannerUrl || bannerFile) && (
              <button type="button" onClick={() => { setBannerFile(null); setBannerUrl(''); }} className="text-red-500 hover:bg-red-50 hover:border-red-300 border border-transparent px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200">
                Hapus
              </button>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-medium text-black/80">Logo & Nama Toko</h2>
              <p className="text-[11px] text-black/40 font-normal">Logo rekomendasi rasio 1:1 (500 x 500 px)</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-50 border border-dashed border-slate-200 overflow-hidden flex items-center justify-center">
                {logoFile ? (
                  <img src={URL.createObjectURL(logoFile)} alt="Logo Preview" className="w-full h-full object-cover" />
                ) : logoUrl ? (
                  <img src={logoUrl} alt="Logo Toko" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-black/30 text-[11px] font-normal text-center px-2">Belum ada logo</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <label className="cursor-pointer bg-slate-50 hover:bg-slate-100 text-black/70 px-3 py-1.5 border border-transparent hover:border-black/70 rounded-lg text-[11px] sm:text-xs font-medium transition-all duration-200">
                  {logoUrl || logoFile ? 'Ganti' : 'Tambah'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e: React.ChangeEvent<HTMLInputElement>) => e.target.files?.[0] && setLogoFile(e.target.files[0])} />
                </label>
                {(logoUrl || logoFile) && (
                  <button type="button" onClick={() => { setLogoFile(null); setLogoUrl(''); }} className="text-red-500 hover:bg-red-50 hover:border-red-300 border border-transparent px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all duration-200">
                    Hapus
                  </button>
                )}
              </div>
            </div>

            <div className="w-full">
              <label className="block text-xs sm:text-sm font-medium text-black/70 mb-2">Nama Toko</label>
              <input
                type="text"
                value={storeName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStoreName(e.target.value)}
                placeholder="Masukkan nama toko Anda"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/30 focus:border-[#059669] outline-none transition-all text-black/80 text-sm sm:text-base font-normal placeholder:text-black/30"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-medium text-black/80">Detail Toko</h2>
              <p className="text-[11px] text-black/40 font-normal">Ceritakan tentang toko dan lokasinya kepada pembeli.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-black/70 mb-2">Deskripsi Toko</label>
            <textarea
              value={storeDescription}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setStoreDescription(e.target.value)}
              placeholder="Ceritakan sedikit tentang toko atau produk yang Anda jual"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/30 focus:border-[#059669] outline-none transition-all text-black/80 text-sm sm:text-base font-normal resize-none placeholder:text-black/30"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-black/70 mb-2">Alamat Toko</label>
            <textarea
              value={storeAddress}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setStoreAddress(e.target.value)}
              placeholder="Masukkan alamat lengkap lokasi toko Anda"
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/30 focus:border-[#059669] outline-none transition-all text-black/80 text-sm sm:text-base font-normal resize-none placeholder:text-black/30"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-[#059669] hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 duration-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  )
}