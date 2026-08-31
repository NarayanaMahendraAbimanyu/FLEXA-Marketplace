'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabaseClient'

interface StoreSettingsData {
  id?: string
  user_id: string
  store_name: string
  banner_url: string | null
  logo_url: string | null
  updated_at?: string
}

export default function StoreSettingsPage() {
  const [loading, setLoading] = useState<boolean>(false)
  const [storeName, setStoreName] = useState<string>('')
  const [bannerUrl, setBannerUrl] = useState<string>('')
  const [logoUrl, setLogoUrl] = useState<string>('')
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  
  const userId: string = 'USER_ID_HERE'

  useEffect(() => {
    fetchStoreSettings()
  }, [])

  const fetchStoreSettings = async (): Promise<void> => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (data) {
        const storeData = data as StoreSettingsData
        setStoreName(storeData.store_name || '')
        setBannerUrl(storeData.banner_url || '')
        setLogoUrl(storeData.logo_url || '')
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
        banner_url: finalBannerUrl,
        logo_url: finalLogoUrl,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('store_settings')
        .upsert(updates, { onConflict: 'user_id' })

      if (error) throw error

      alert('Pengaturan toko berhasil disimpan!')
      fetchStoreSettings()
      setBannerFile(null)
      setLogoFile(null)
    } catch (error: any) {
      alert('Terjadi kesalahan saat menyimpan: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:py-8 sm:px-6 lg:px-8 flex justify-center items-start">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Pengaturan Toko</h1>
        </div>

        <form onSubmit={handleSave} className="p-4 sm:p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Banner Toko</label>
            <div className="relative w-full h-40 sm:h-56 bg-gray-200 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center group">
              {bannerFile ? (
                <img src={URL.createObjectURL(bannerFile)} alt="Banner Preview" className="w-full h-full object-cover" />
              ) : bannerUrl ? (
                <img src={bannerUrl} alt="Banner Toko" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-500 font-medium">Banner Toko</span>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <label className="cursor-pointer bg-white text-gray-800 px-4 py-2 rounded-lg text-sm font-medium shadow hover:bg-gray-100">
                  {bannerUrl || bannerFile ? 'Ganti' : 'Tambah'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e: React.ChangeEvent<HTMLInputElement>) => e.target.files?.[0] && setBannerFile(e.target.files[0])} />
                </label>
                {(bannerUrl || bannerFile) && (
                  <button type="button" onClick={() => { setBannerFile(null); setBannerUrl(''); }} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow hover:bg-red-700">
                    Hapus
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200 border-2 border-dashed border-gray-300 overflow-hidden flex-shrink-0 flex items-center justify-center group">
              {logoFile ? (
                <img src={URL.createObjectURL(logoFile)} alt="Logo Preview" className="w-full h-full object-cover" />
              ) : logoUrl ? (
                <img src={logoUrl} alt="Foto Toko" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-500 text-xs sm:text-sm font-medium text-center px-2">Foto Toko</span>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <label className="cursor-pointer bg-white text-gray-800 p-2 rounded-full shadow hover:bg-gray-100 text-xs font-medium">
                  {logoUrl || logoFile ? 'Ganti' : 'Tambah'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e: React.ChangeEvent<HTMLInputElement>) => e.target.files?.[0] && setLogoFile(e.target.files[0])} />
                </label>
              </div>
            </div>

            <div className="w-full">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Toko</label>
              <input
                type="text"
                value={storeName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStoreName(e.target.value)}
                placeholder="Masukkan nama toko Anda"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-800 text-sm sm:text-base"
              />
              {(logoUrl || logoFile) && (
                <button type="button" onClick={() => { setLogoFile(null); setLogoUrl(''); }} className="mt-2 text-xs text-red-600 hover:underline font-medium">
                  Hapus Foto Toko
                </button>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md transition-all disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}