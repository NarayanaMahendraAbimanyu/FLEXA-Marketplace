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
  categoryTag: string;
  rating: number;
  soldCount: string;
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

      const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('*')
            .eq('user_id', sellerId);

        console.log('SELLER ID DI URL:', sellerId);
        console.log('ERROR PRODUCTS:', productsError);
        console.log('DATA PRODUCTS:', productsData);

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
            categoryTag: item.category
              ? String(item.category).charAt(0).toUpperCase() + String(item.category).slice(1)
              : 'Fashion',
            rating: Number(item.rating) || 5,
            soldCount: String(item.sold_count || '0 Terjual'),
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
                  className="bg-white rounded-2xl border border-slate-200/85 hover:border-[#059669] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group flex flex-col"
                >
                  <div className="relative w-full aspect-[4/3] bg-[#DDDDDD] flex items-center justify-center overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover rounded-t-2xl"
                      />
                    ) : (
                      <span className="text-lg sm:text-3xl lg:text-4xl font-semibold text-black/30 text-center uppercase">
                        {product.title.trim().split(' ')[0]}
                      </span>
                    )}
                    <span className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-white/90 backdrop-blur-sm border border-emerald-500/30 text-[#059669] font-medium text-[9px] sm:text-[10px] lg:text-xs px-2 sm:px-2.5 py-0.5 rounded-full">
                      {product.categoryTag}
                    </span>
                  </div>
                
                  <div className="p-2.5 sm:p-3 lg:p-4 flex flex-col justify-between flex-1 bg-white">
                    <div>
                      <h3 className="text-[11px] sm:text-xs lg:text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-[#059669] transition-colors">
                        {product.title}
                      </h3>
                      <div className="flex items-center justify-start gap-1 text-amber-500 text-[9px] sm:text-[10px] lg:text-xs font-semibold mb-1">
                        <span>★</span>
                        <span className="font-bold">{product.rating}</span>
                      </div>
                    </div>
                
                    <div className="mt-2 sm:mt-3 flex items-center justify-between pt-1.5 sm:pt-2 border-t border-slate-100">
                      <span className="text-xs sm:text-sm lg:text-lg font-bold text-[#059669]">
                        {product.price}
                      </span>
                
                      <span className="text-[10px] sm:text-xs lg:text-sm text-black/50 font-medium">
                        {product.soldCount}
                      </span>
                    </div>
                  </div>
                </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}