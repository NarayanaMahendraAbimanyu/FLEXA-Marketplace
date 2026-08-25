'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Product {
  id: number;
  category: string;
  categoryTag: string;
  imageText: string;
  storeName: string;
  rating: number;
  title: string;
  price: string;
}

interface RecommendationSectionProps {
  searchQuery: string;
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

const PRODUCTS: Product[] = [
  { id: 1, category: 'sewa', categoryTag: 'Sewa', imageText: 'DRONE', storeName: 'REZKY RENTAL', rating: 4.9, title: 'Drone DJI 5 Pro Fly', price: 'Rp. 250.000' },
  { id: 2, category: 'elektronik', categoryTag: 'Elektronik', imageText: 'CAMERA', storeName: 'ALFA CAM', rating: 4.8, title: 'Sony Alpha A7 III', price: 'Rp. 350.000' },
  { id: 3, category: 'fashion', categoryTag: 'Fashion', imageText: 'SUIT', storeName: 'KING SUIT', rating: 4.7, title: 'Tuksedo Pria Slim Fit', price: 'Rp. 150.000' },
  { id: 4, category: 'jasa', categoryTag: 'Jasa', imageText: 'DESAIN', storeName: 'STUDIO GRAPHIC', rating: 5.0, title: 'Jasa Desain Logo Professional', price: 'Rp. 500.000' },
  { id: 5, category: 'sewa', categoryTag: 'Sewa', imageText: 'PROYEKSI', storeName: 'MEDIA RENT', rating: 4.9, title: 'Proyektor Epson 4000 Lumens', price: 'Rp. 180.000' },
  { id: 6, category: 'elektronik', categoryTag: 'Elektronik', imageText: 'LAPTOP', storeName: 'GADGET CORNER', rating: 4.8, title: 'MacBook Pro M2 16 inch', price: 'Rp. 450.000' },
  { id: 7, category: 'fashion', categoryTag: 'Fashion', imageText: 'KEBAYA', storeName: 'ANUGERAH BUSANA', rating: 4.9, title: 'Kebaya Modern Wisuda', price: 'Rp. 200.000' },
  { id: 8, category: 'jasa', categoryTag: 'Jasa', imageText: 'FOTO', storeName: 'FLASH SHOT', rating: 4.8, title: 'Jasa Fotografer Event & Buku', price: 'Rp. 800.000' },
  { id: 9, category: 'sewa', categoryTag: 'Sewa', imageText: 'SOUND', storeName: 'NADA SOUND', rating: 4.6, title: 'Sound System 1000 Watt', price: 'Rp. 600.000' },
  { id: 10, category: 'elektronik', categoryTag: 'Elektronik', imageText: 'LIGHTING', storeName: 'LIGHTING PRO', rating: 4.7, title: 'Godox SL60W LED Video Light', price: 'Rp. 120.000' },
  { id: 11, category: 'fashion', categoryTag: 'Fashion', imageText: 'COSPLAY', storeName: 'ANIME RENT', rating: 4.9, title: 'Kostum Cosplay Naruto Uzumaki', price: 'Rp. 90.000' },
  { id: 12, category: 'jasa', categoryTag: 'Jasa', imageText: 'WEB DEV', storeName: 'DEV STUDIO', rating: 5.0, title: 'Jasa Pembuatan Web Landing Page', price: 'Rp. 1.500.000' },
  { id: 13, category: 'sewa', categoryTag: 'Sewa', imageText: 'TENT', storeName: 'CAMPING GROUND', rating: 4.8, title: 'Tenda Camping Eiger 4 Orang', price: 'Rp. 75.000' },
  { id: 14, category: 'elektronik', categoryTag: 'Elektronik', imageText: 'MIC', storeName: 'AUDIO TECH', rating: 4.9, title: 'Microphone Wireless Saramonic', price: 'Rp. 130.000' },
  { id: 15, category: 'fashion', categoryTag: 'Fashion', imageText: 'GAUN', storeName: 'QUEEN DRESS', rating: 4.8, title: 'Gaun Pesta Elegant Red', price: 'Rp. 250.000' },
  { id: 16, category: 'jasa', categoryTag: 'Jasa', imageText: 'EDITING', storeName: 'CUT & GO', rating: 4.7, title: 'Jasa Video Editing Reels / TikTok', price: 'Rp. 300.000' },
  { id: 17, category: 'sewa', categoryTag: 'Sewa', imageText: 'IPAD', storeName: 'IGADGET RENT', rating: 4.9, title: 'iPad Pro 11 inch + Apple Pencil', price: 'Rp. 220.000' },
  { id: 18, category: 'elektronik', categoryTag: 'Elektronik', imageText: 'GIMBAL', storeName: 'REZKY RENTAL', rating: 4.7, title: 'Gimbal Stabilizer DJI RS3', price: 'Rp. 200.000' },
  { id: 19, category: 'fashion', categoryTag: 'Fashion', imageText: 'SEPATU', storeName: 'SNEAKER HUB', rating: 4.6, title: 'Sepatu Air Jordan 1 Retro', price: 'Rp. 110.000' },
  { id: 20, category: 'jasa', categoryTag: 'Jasa', imageText: 'SEO', storeName: 'DIGITAL OPTIMA', rating: 4.9, title: 'Jasa Optimasi SEO Website', price: 'Rp. 1.200.000' },
  { id: 21, category: 'sewa', categoryTag: 'Sewa', imageText: 'PLAYSTATION', storeName: 'GAME ZONE', rating: 4.8, title: 'PlayStation 5 + 2 Stik DualSense', price: 'Rp. 170.000' },
  { id: 22, category: 'elektronik', categoryTag: 'Elektronik', imageText: 'SPEAKER', storeName: 'SOUND TECH', rating: 4.8, title: 'Speaker Portable JBL PartyBox', price: 'Rp. 250.000' },
  { id: 23, category: 'fashion', categoryTag: 'Fashion', imageText: 'BATIK', storeName: 'BATIK WARISAN', rating: 4.9, title: 'Batik Tulis Premium Solo Pria', price: 'Rp. 130.000' },
  { id: 24, category: 'jasa', categoryTag: 'Jasa', imageText: 'COPYWRITE', storeName: 'PEN KREATIF', rating: 4.8, title: 'Jasa Penulisan Artikel SEO', price: 'Rp. 200.000' },
  { id: 25, category: 'sewa', categoryTag: 'Sewa', imageText: 'GENSET', storeName: 'POWER UTAMA', rating: 4.7, title: 'Genset Silent 5000 Watt', price: 'Rp. 500.000' },
  { id: 26, category: 'elektronik', categoryTag: 'Elektronik', imageText: 'VR HEADSET', storeName: 'VR WORLD', rating: 4.9, title: 'Meta Quest 3 128GB VR', price: 'Rp. 210.000' },
  { id: 27, category: 'fashion', categoryTag: 'Fashion', imageText: 'JAKET', storeName: 'OUTDOOR STYLE', rating: 4.7, title: 'Jaket Waterproof Gore-Tex', price: 'Rp. 85.000' },
  { id: 28, category: 'jasa', categoryTag: 'Jasa', imageText: 'TRANSLATOR', storeName: 'BAHASA GLOBAL', rating: 5.0, title: 'Jasa Penerjemah Dokumen Inggris', price: 'Rp. 350.000' },
  { id: 29, category: 'sewa', categoryTag: 'Sewa', imageText: 'CYCLE', storeName: 'GOWES RENT', rating: 4.8, title: 'Sepeda Balap Carbon Roadbike', price: 'Rp. 190.000' },
  { id: 30, category: 'elektronik', categoryTag: 'Elektronik', imageText: 'MONITOR', storeName: 'DISPLAY HUB', rating: 4.9, title: 'Monitor Gaming Curved 144Hz', price: 'Rp. 160.000' },
];

function AnimatedCard({ product }: { product: Product }) {
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

  return (
    <div
      ref={cardRef}
      className={`bg-white rounded-2xl border border-slate-200/80 hover:border-[#059669] shadow-sm hover:shadow-md transition-all duration-500 overflow-hidden group flex flex-col transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="relative w-full aspect-[4/3] bg-black/10 flex items-center justify-center p-4">
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm border border-emerald-500/30 text-[#059669] font-medium text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full">
          {product.categoryTag}
        </span>

        <span className="text-2xl sm:text-3xl font-black text-black/20 tracking-wider">
          {product.imageText}
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
          <span className="text-sm sm:text-base font-extrabold text-[#059669]">
            {product.price}
          </span>

          <button
            type="button"
            className="w-8 h-8 rounded-full bg-transparent text-[#059669] border border-[#059669] hover:bg-[#059669] hover:text-white transition-colors duration-200 flex items-center justify-center"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RecommendationSection({ searchQuery }: RecommendationSectionProps) {
  const [activeCategory, setActiveCategory] = useState('trending');

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCategory = activeCategory === 'trending' || product.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.imageText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.storeName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

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
                  className={`font-medium text-xs sm:text-sm px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl shrink-0 flex items-center gap-2 transition-colors duration-200 ${
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
            Rekomendasikan Untukmu
          </h2>
          <p className="mt-2 text-xs sm:text-sm md:text-base text-black/50 font-normal">
            Berdasarkan lokasi terdekatmu (Simulasi)
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="text-base font-medium">Produk tidak ditemukan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <AnimatedCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-8 sm:mt-12 flex justify-center">
          <button
            type="button"
            className="bg-transparent text-[#059669] font-semibold text-xs sm:text-sm border border-[#059669] px-6 sm:px-8 py-3.5 rounded-xl hover:bg-[#059669] hover:border-[#059669] hover:text-white transition-all duration-200 flex items-center gap-2 shadow-sm"
          >
            <span>Login Untuk Lihat Lainnya</span>
            <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}