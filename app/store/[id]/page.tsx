'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PRODUCTS, Product } from '../../data/products';
import { supabase } from '../../../lib/supabaseClient';

interface StoreProduct {
  id: number;
  title: string;
  price: string | number;
  imageUrl?: string;
}

export default function StorePage() {
  const params = useParams();
  const router = useRouter();
  const sellerId = params?.id as string;

  const [storeName, setStoreName] = useState<string>('');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [bannerUrl, setBannerUrl] = useState<string>('');
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!sellerId) return;

    const fetchStore = async () => {
      const { data: storeData } = await supabase
        .from('store_settings')
        .select('store_name, logo_url, banner_url')
        .eq('user_id', sellerId)
        .single();

      if (storeData) {
        setStoreName(storeData.store_name || 'Name Shop');
        setLogoUrl(storeData.logo_url || '');
        setBannerUrl(storeData.banner_url || '');
      }

      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .or(`user_id.eq.${sellerId},store_id.eq.${sellerId}`);

      if (productsData) {
        const mapped: StoreProduct[] = productsData.map((item) => ({
          id: item.id,
          title: item.title || item.name || 'Name of Product',
          price:
            typeof item.price === 'number'
              ? `Rp. ${item.price.toLocaleString('id-ID')}`
              : item.price,
          imageUrl:
            item.image_url || item.imageUrl || item.image || item.photo || item.photo_url || item.img,
        }));
        setProducts(mapped);
      }

      setLoading(false);
    };

    fetchStore();

    const channel = supabase
      .channel(`store_settings_page_${sellerId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'store_settings',
          filter: `user_id=eq.${sellerId}`,
        },
        (payload) => {
          const updated = payload.new;
          if (updated.store_name) setStoreName(updated.store_name);
          setLogoUrl(updated.logo_url || '');
          setBannerUrl(updated.banner_url || '');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sellerId]);

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col">
      <header className="w-full bg-white border-b border-[#059669]/30 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-3 sm:gap-4 sticky top-0 z-30 shadow-sm">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-[#059669] hover:scale-110 active:scale-95 duration-200 transition-all font-bold text-xl sm:text-2xl"
        >
          ←
        </button>
        <h1 className="text-sm sm:text-base lg:text-lg font-bold text-black/80 truncate">
          Detail Toko
        </h1>
      </header>

      <div className="w-full h-32 sm:h-48 lg:h-64 bg-slate-200 overflow-hidden">
        {bannerUrl ? (
          <img src={bannerUrl} alt="Banner Toko" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-black/30 text-xs sm:text-sm font-medium">
            Belum Ada Banner
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-14 lg:-mt-16 relative">
        <div className="flex items-end gap-3 sm:gap-4">
          <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-slate-100 border-4 border-white shadow-md flex items-center justify-center font-bold text-black/50 text-xl sm:text-2xl flex-shrink-0 overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt={storeName} className="w-full h-full object-cover" />
            ) : (
              storeName.charAt(0) || 'T'
            )}
          </div>
          <h2 className="text-base sm:text-xl lg:text-2xl font-bold text-black/80 pb-1 sm:pb-2 truncate">
            {storeName || 'Name Shop'}
          </h2>
        </div>
      </div>

      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 flex-1">
        <h3 className="text-xs sm:text-sm lg:text-base font-bold text-black/70 mb-4">
          Produk dari Toko Ini
        </h3>

        {loading ? (
          <div className="text-center py-14 text-black/40 text-xs sm:text-sm">
            Memuat produk...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-14 text-black/40 text-xs sm:text-sm italic">
            Toko ini belum memiliki produk.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="bg-white border border-slate-200 rounded-2xl p-2.5 sm:p-3 shadow-sm hover:shadow-md hover:scale-[1.02] duration-200 transition-all"
              >
                <div className="w-full aspect-square rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden mb-2">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-black/30 text-xs font-medium">PRODUK</span>
                  )}
                </div>
                <h4 className="text-[11px] sm:text-xs lg:text-sm font-semibold text-black/80 line-clamp-2 mb-1">
                  {product.title}
                </h4>
                <span className="text-[11px] sm:text-xs lg:text-sm font-bold text-[#059669]">
                  {product.price}
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}