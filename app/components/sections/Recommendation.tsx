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
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
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
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z"/>
      </svg>
    ),
  },
  {
    id: 'jasa',
    label: 'Jasa',
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z"/>
      </svg>
    ),
  },
];

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

  const columnIndex = index % 4;
  const delayMs = columnIndex * 150;

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      style={{
        transitionDelay: isVisible ? `${delayMs}ms` : '0ms',
      }}
      className={`bg-white rounded-2xl border border-slate-200/85 hover:border-[#059669] shadow-sm hover:shadow-md transition-all duration-700 ease-out overflow-hidden group flex flex-col transform cursor-pointer ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
    >
      <div className="relative w-full aspect-[4/3] bg-black/10 flex items-center justify-center p-4 overflow-hidden">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.title} 
            className="w-full h-full object-cover rounded-t-2xl" 
          />
        ) : (
          <span className="text-2xl sm:text-3xl font-black text-black/20 tracking-wider text-center uppercase">
            {product.imageText}
          </span>
        )}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm border border-emerald-500/30 text-[#059669] font-medium text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full">
          {product.categoryTag}
        </span>
      </div>

      <div className="p-4 flex flex-col justify-between flex-1 bg-white">
        <div>
          <div className="flex items-center justify-between gap-2 text-[10px] sm:text-xs text-black/40 font-semibold tracking-wider uppercase mb-1">
            <span>{product.storeName}</span>
            <div className="flex items-center gap-1 text-amber-500">
              <span>★</span>
              <span className="text-amber-500 font-bold">{product.rating}</span>
            </div>
          </div>

          <h3 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-[#059669] transition-colors">
            {product.title}
          </h3>
        </div>

        <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-sm sm:text-lg font-bold text-[#059669]">
            {product.price}
          </span>

          <span className="text-xs sm:text-sm text-black/50 font-medium">
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
        .select('*')
        .order('created_at', { ascending: false });

      if (!productsError && productsData) {
        const { data: storeData } = await supabase
          .from('store_settings')
          .select('store_name, user_id')
          .single();

        const formattedRealProducts = productsData.map((item: any) => {
          const title = String(item.title || item.name || item.product_name);
          const priceValue = item.price;
          const storeName = String(item.store_name || storeData?.store_name);

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
            imageUrl: item.image_url || item.image || item.photo || undefined,
            storeName: storeName,
            rating: Number(item.rating) || 5,
            soldCount: String(item.sold_count || '0 Terjual'),
          };
        });

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
      product.imageText.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    <section className="relative w-full bg-slate-50 pt-8 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto -mt-16 mb-12 sticky top-14 sm:top-18 z-40 pt-2">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-4 shadow-xl border border-slate-100">
          <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`font-medium text-xs sm:text-sm px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl shrink-0 flex items-center gap-2 hover:scale-103 active:scale-98 transition-all duration-200 ${
                    isActive
                      ? 'bg-[#059669] text-white font-semibold shadow-sm'
                      : 'bg-white border border-slate-300 text-slate-800 hover:border-[#059669] hover:text-[#059669]'
                  }`}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-black/90 tracking-tight">
            Rekomendasi Untukmu
          </h2>
          <p className="mt-2 text-xs sm:text-sm md:text-base text-black/50 font-normal">
            Berdasarkan lokasi terdekatmu (Simulasi)
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-black/40">
            <p className="text-base font-medium">Produk tidak ditemukan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
          <div className="mt-8 sm:mt-12 flex justify-center">
            <Link
              href="/login"
              className="bg-transparent text-[#059669] hover:scale-105 active:scale-98 transition-all duration-200 font-semibold text-xs sm:text-sm border border-[#059669] px-6 sm:px-8 py-3.5 rounded-xl hover:bg-[#059669] hover:border-[#059669] hover:text-white flex items-center gap-2 shadow-sm"
            >
              <span>Login Untuk Lihat Lainnya</span>
              <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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