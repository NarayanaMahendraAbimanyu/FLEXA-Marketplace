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
    <div className="min-h-screen flex justify-center items-start relative">
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <div
            className={`px-6 py-3 rounded-xl shadow-2xl text-white font-medium text-sm flex items-center gap-3 transition-all duration-300 transform ${
              notification.type === 'success' ? 'bg-[#059669]' : 'bg-red-600'
            } ${isNotifAnimatingOut ? '-translate-y-20 opacity-0' : 'translate-y-0 opacity-100'}`}
          >
            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h1 className="text-xl sm:text-2xl font-bold text-black/80">Pengaturan Toko</h1>
        </div>

        <form onSubmit={handleSave} className="p-4 sm:p-8 space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-black/80">Banner Toko</label>
              <span className="text-xs text-black/50">Rekomendasi rasio 16:9 (Contoh: 1280 x 720 px)</span>
            </div>
            <div className="w-full aspect-video bg-gray-200 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center">
              {bannerFile ? (
                <img src={URL.createObjectURL(bannerFile)} alt="Banner Preview" className="w-full h-full object-cover" />
              ) : bannerUrl ? (
                <img src={bannerUrl} alt="Banner Toko" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-500 font-medium">Banner Toko</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-3">
              <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:border-gray-700 hover:scale-105 active:scale-95 duration-200 transition-all">
                {bannerUrl || bannerFile ? 'Ganti Banner' : 'Tambah Banner'}
                <input type="file" accept="image/*" className="hidden" onChange={(e: React.ChangeEvent<HTMLInputElement>) => e.target.files?.[0] && setBannerFile(e.target.files[0])} />
              </label>
              {(bannerUrl || bannerFile) && (
                <button type="button" onClick={() => { setBannerFile(null); setBannerUrl(''); }} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:scale-105 active:scale-95 duration-200 transition-all">
                  Hapus
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200 border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center">
                {logoFile ? (
                  <img src={URL.createObjectURL(logoFile)} alt="Logo Preview" className="w-full h-full object-cover" />
                ) : logoUrl ? (
                  <img src={logoUrl} alt="Logo Toko" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-black/60 text-xs sm:text-sm font-medium text-center px-2">Logo Toko</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <label className="cursor-pointer bg-white border border-gray-300 text-black/80 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm hover:border-gray-700 hover:scale-105 active:scale-95 duration-200 transition-all">
                  {logoUrl || logoFile ? 'Ganti' : 'Tambah'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e: React.ChangeEvent<HTMLInputElement>) => e.target.files?.[0] && setLogoFile(e.target.files[0])} />
                </label>
                {(logoUrl || logoFile) && (
                  <button type="button" onClick={() => { setLogoFile(null); setLogoUrl(''); }} className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm hover:scale-105 active:scale-95 duration-200 transition-all">
                    Hapus
                  </button>
                )}
              </div>
            </div>

            <div className="w-full">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-black/80">Nama Toko</label>
                <span className="text-xs text-black/50">Rekomendasi rasio 1:1 (Contoh: 500 x 500 px)</span>
              </div>
              <input
                type="text"
                value={storeName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStoreName(e.target.value)}
                placeholder="Masukkan nama toko Anda (Belum diisi)"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-800 text-sm sm:text-base"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-black/80">Deskripsi Toko</label>
            </div>
            <textarea
              value={storeDescription}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setStoreDescription(e.target.value)}
              placeholder="Ceritakan sedikit tentang toko atau produk yang Anda jual"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-800 text-sm sm:text-base"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-black/80">Alamat Toko</label>
            </div>
            <textarea
              value={storeAddress}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setStoreAddress(e.target.value)}
              placeholder="Masukkan alamat lengkap lokasi toko Anda"
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-800 text-sm sm:text-base"
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md hover:scale-105 active:scale-95 duration-200 transition-all disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}