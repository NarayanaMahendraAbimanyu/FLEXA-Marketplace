'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PopupLogin from './LoginModal';
import { PRODUCTS, Product } from '../../data/products';
import { supabase } from '@/lib/supabaseClient';

interface ExtendedProduct extends Omit<Product, 'id'> {
  id: string | number;
  imageUrl?: string;
}

interface RecommendationSectionProps {
  searchQuery: string;
  isLoggedIn?: boolean;
  initialCategory?: string;
}

const CATEGORIES = [
  {
    id: 'trending',
    label: 'Trending',
    icon: (
      <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    id: 'elektronik',
    label: 'Elektronik',
    icon: (
      <svg className="w-4 h-4 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="8" y="8" width="8" height="8" rx="1" strokeLinecap="round" strokeLinejoin="round" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 4v2m6-2v2M9 18v2m6-2v2M4 9h2m-2 3h2m-2 3h2m12-6h2m-2 3h2m-2 3h2" />
      </svg>
    ),
  },
  {
    id: 'fashion',
    label: 'Fashion',
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M12 2L9 4H4v6l2 2v10h12V12l2-2V4h-5l-3-2zm4 18H8V11.83l-1.41-1.41V6h3.17L12 4.17 14.24 6H17v4.42L15.59 11.83V20z"/>
      </svg>
    ),
  },
  {
    id: 'sewa',
    label: 'Sewa',
    icon: (
      <svg className="w-4 h-4 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8" />
      </svg>
    ),
  },
  {
    id: 'jasa',
    label: 'Jasa',
    icon: (
      <svg className="w-4 h-4 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a4 4 0 00-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 005.4-5.4l-2.65 2.65a1 1 0 01-1.4 0l-1.6-1.6a1 1 0 010-1.4L14.7 6.3z" />
      </svg>
    ),
  },
];

// --- purely visual: colour identity per category, used for badges & image placeholders ---
const CATEGORY_STYLES: Record<string, { badge: string; gradient: string; icon: string }> = {
  elektronik: {
    badge: 'bg-blue-50 text-blue-700 border-blue-200/80',
    gradient: 'from-blue-50 via-blue-50 to-sky-100',
    icon: 'text-blue-300',
  },
  fashion: {
    badge: 'bg-rose-50 text-rose-700 border-rose-200/80',
    gradient: 'from-rose-50 via-rose-50 to-pink-100',
    icon: 'text-rose-300',
  },
  sewa: {
    badge: 'bg-violet-50 text-violet-700 border-violet-200/80',
    gradient: 'from-violet-50 via-violet-50 to-purple-100',
    icon: 'text-violet-300',
  },
  jasa: {
    badge: 'bg-amber-50 text-amber-700 border-amber-200/80',
    gradient: 'from-amber-50 via-amber-50 to-orange-100',
    icon: 'text-amber-300',
  },
};
const DEFAULT_CATEGORY_STYLE = {
  badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  gradient: 'from-emerald-50 via-emerald-50 to-teal-100',
  icon: 'text-emerald-300',
};

function getCategoryStyle(category?: string) {
  if (!category) return DEFAULT_CATEGORY_STYLE;
  return CATEGORY_STYLES[category.toLowerCase()] || DEFAULT_CATEGORY_STYLE;
}

function getCategoryIcon(category?: string) {
  const found = CATEGORIES.find((c) => c.id === category?.toLowerCase());
  return found ? found.icon : CATEGORIES[1].icon;
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 1.5l2.55 5.17 5.7.83-4.13 4.02.98 5.68L10 14.9l-5.1 2.3.98-5.68L1.75 7.5l5.7-.83L10 1.5z" />
    </svg>
  );
}

interface AnimatedCardProps {
  product: ExtendedProduct;
  index: number;
  onClick: () => void;
}

function AnimatedCard({ product, index, onClick }: AnimatedCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (cardRef.current) observer.unobserve(cardRef.current);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) observer.observe(cardRef.current);

    return () => observer.disconnect();
  }, []);

  const rowIndex = Math.floor(index / 4);
  const delayMs = Math.min(rowIndex * 60, 240);
  const fallbackText = product.title ? product.title.trim().split(' ')[0].toUpperCase() : 'PRODUK';
  const style = getCategoryStyle(product.category);
  const icon = getCategoryIcon(product.category);
  const storeInitial = product.storeName ? product.storeName.trim().charAt(0).toUpperCase() : 'T';

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      style={{ transitionDelay: isVisible ? `${delayMs}ms` : '0ms' }}
      className={`bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_24px_-8px_rgba(15,23,42,0.12)] transition-all duration-500 ease-out overflow-hidden group flex flex-col cursor-pointer ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className={`relative w-full aspect-[4/3] bg-gradient-to-br ${style.gradient} flex flex-col items-center justify-center gap-1.5 sm:gap-2 overflow-hidden`}>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <>
            {React.cloneElement(icon, { className: `w-9 h-9 sm:w-14 sm:h-14 ${style.icon}` })}
            <span className="text-[9px] sm:text-xs font-semibold text-slate-400 tracking-wide text-center px-4 line-clamp-1">
              {fallbackText}
            </span>
          </>
        )}
        <span className={`absolute top-2 left-2 sm:top-3 sm:left-3 backdrop-blur-sm border font-medium text-[8px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 rounded-full ${style.badge}`}>
          {product.categoryTag}
        </span>
      </div>

      <div className="p-2.5 sm:p-4 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-1.5 min-w-0">
            <span className="hidden sm:flex shrink-0 w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold items-center justify-center">
              {storeInitial}
            </span>
            <span className="text-[9px] sm:text-xs text-slate-500 font-medium truncate">{product.storeName}</span>
            <span className="ml-auto flex items-center gap-0.5 sm:gap-1 shrink-0">
              <StarIcon className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-amber-400" />
              <span className="text-[9px] sm:text-xs text-slate-600 font-semibold">{product.rating}</span>
            </span>
          </div>

          <h3 className="text-[11px] sm:text-sm font-bold text-slate-800 leading-snug line-clamp-2 sm:line-clamp-1 group-hover:text-[#059669] transition-colors">
            {product.title}
          </h3>
        </div>

        <div className="mt-2 sm:mt-3 flex items-center justify-between gap-1">
          <span className="text-xs sm:text-lg font-bold text-[#059669]">{product.price}</span>
          <span className="text-[8px] sm:text-xs text-slate-400 font-medium bg-slate-50 rounded-full px-1.5 sm:px-2 py-0.5 whitespace-nowrap">
            {product.soldCount}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function RecommendationSection({ searchQuery, isLoggedIn, initialCategory }: RecommendationSectionProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('trending');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>(PRODUCTS);

  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory.toLowerCase());
    }
  }, [initialCategory]);

  useEffect(() => {
    const fetchRealProducts = async () => {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*');

      if (!productsError && productsData) {
        const formattedRealProducts = await Promise.all(
          productsData.map(async (item: any) => {
            const title = String(item.title || item.name || item.product_name || 'Produk');
            const priceValue = item.price;

            let storeName = item.store_name || item.storeName || 'Toko Seller';
            const ownerId = item.user_id || item.store_id;

            if (ownerId) {
              const { data: storeData } = await supabase
                .from('store_settings')
                .select('store_name')
                .eq('user_id', ownerId)
                .single();

              if (storeData?.store_name) {
                storeName = storeData.store_name;
              }
            }

            let formattedPrice = 'Rp. 50.000';
            if (typeof priceValue === 'number') {
              formattedPrice = `Rp. ${priceValue.toLocaleString('id-ID')}`;
            } else if (typeof priceValue === 'string' && priceValue.trim() !== '') {
              formattedPrice = priceValue;
            }

            const firstWord = title.trim().split(' ')[0].toUpperCase();

            return {
              id: item.id,
              title: title,
              price: formattedPrice,
              category: String(item.category || 'fashion').toLowerCase(),
              categoryTag: item.category ? String(item.category).charAt(0).toUpperCase() + String(item.category).slice(1) : 'Fashion',
              imageText: firstWord,
              imageUrl: item.image_url || item.image || item.photo || item.image_path || undefined,
              storeName: storeName,
              rating: Number(item.rating) || 5,
              soldCount: String(item.sold_count || '0 Terjual'),
            };
          })
        );

        setAllProducts([...formattedRealProducts, ...PRODUCTS]);
      }
    };

    fetchRealProducts();
  }, []);

  const filteredProducts = allProducts.filter((product) => {
    const matchesCategory = activeCategory === 'trending' || product.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.imageText && product.imageText.toLowerCase().includes(searchQuery.toLowerCase())) ||
      product.storeName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleCardClick = (productId: number | string) => {
    if (!isLoggedIn) {
      setIsModalOpen(true);
    } else {
      router.push(`/product/${productId}`);
    }
  };

  return (
    <section className="relative w-full bg-[#F8FAF9] pt-8 pb-20 px-3 sm:px-6 lg:px-8">
      {/* filter bar */}
      <div className="max-w-7xl mx-auto -mt-16 mb-14 sticky top-14 sm:top-18 z-40 pt-2">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-lg shadow-slate-900/5 border border-slate-100">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 py-1">
            <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
              {CATEGORIES.slice(0, 3).map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`font-medium text-[11px] sm:text-sm px-2.5 sm:px-5 py-2 sm:py-2.5 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 hover:scale-103 active:scale-98 transition-all duration-200 ${
                      isActive
                        ? 'bg-[#059669] text-white font-semibold shadow-sm'
                        : 'bg-white border border-slate-300 text-slate-800 hover:border-[#059669] hover:text-[#059669]'
                    }`}
                  >
                    {cat.icon}
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2 w-2/3 sm:w-auto">
              {CATEGORIES.slice(3, 5).map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`font-medium text-[11px] sm:text-sm px-2.5 sm:px-5 py-2 sm:py-2.5 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 hover:scale-103 active:scale-98 transition-all duration-200 ${
                      isActive
                        ? 'bg-[#059669] text-white font-semibold shadow-sm'
                        : 'bg-white border border-slate-300 text-slate-800 hover:border-[#059669] hover:text-[#059669]'
                    }`}
                  >
                    {cat.icon}
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* section heading with one deliberate decorative accent */}
        <div className="relative text-center mb-10 sm:mb-12">
          <svg
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[420px] h-[280px] sm:h-[420px] -z-10 opacity-70 pointer-events-none"
            viewBox="0 0 400 400"
            fill="none"
          >
            <path
              d="M200 40C280 40 360 100 360 190C360 280 290 360 195 360C100 360 40 290 45 200C50 110 120 40 200 40Z"
              fill="url(#recoBlobGradient)"
            />
            <defs>
              <linearGradient id="recoBlobGradient" x1="0" y1="0" x2="400" y2="400" gradientUnits="userSpaceOnUse">
                <stop stopColor="#059669" stopOpacity="0.07" />
                <stop offset="1" stopColor="#059669" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Rekomendasi Untukmu
          </h2>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-xs sm:text-sm md:text-base text-slate-500">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Berdasarkan lokasi terdekatmu (Simulasi)
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm sm:text-base font-semibold text-slate-700">Produk tidak ditemukan</p>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">Coba kategori lain atau ubah kata pencarianmu.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product, idx) => (
              <AnimatedCard
                key={`${product.id}-${idx}`}
                product={product}
                index={idx}
                onClick={() => handleCardClick(product.id)}
              />
            ))}
          </div>
        )}

        {!isLoggedIn && (
          <div className="mt-10 sm:mt-14 flex justify-center">
            <Link
              href="/login"
              className="group bg-[#059669] text-white hover:bg-[#047857] transition-all duration-200 font-semibold text-xs sm:text-sm px-6 sm:px-8 py-3.5 rounded-full flex items-center gap-2 shadow-md shadow-emerald-900/10 hover:shadow-lg hover:shadow-emerald-900/15"
            >
              <span>Login Untuk Lihat Lainnya</span>
              <svg className="w-4 h-4 stroke-[2.5] transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        )}
      </div>

      <PopupLogin isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}