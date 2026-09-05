'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { PRODUCTS, Product } from '@/app/data/products';
import RentalDatePicker from '../../components/sections/RentalDatePicker';
import ServiceBookingCard from '../../components/sections/ServiceBookingCard';
import { supabase } from '@/lib/supabaseClient';

interface Review {
  id: number;
  product_id: number;
  username: string;
  avatar?: string | null;
  rating: number;
  comment: string;
  created_at: string;
}

const getStoreAvatarUrl = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const { data } = supabase.storage.from('store-assets').getPublicUrl(cleanPath);
  return data?.publicUrl || null;
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params?.id);

  const foundProduct: Product | undefined = PRODUCTS.find((p) => p.id === productId);

  const [dbProduct, setDbProduct] = useState<any>(null);
  const [liveStoreName, setLiveStoreName] = useState<string>('');
  const [liveStoreLogo, setLiveStoreLogo] = useState<string | null>(null);
  const [storeOwnerId, setStoreOwnerId] = useState<string>('');

  const [userData, setUserData] = useState<{ name: string; avatar: string | null }>({
    name: '',
    avatar: null,
  });

  const [deliveryRange, setDeliveryRange] = useState('');

  useEffect(() => {
    async function fetchStoreAndProductData() {
      if (!productId) return;

      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .maybeSingle();

      let currentProduct = null;

      if (!productError && productData) {
        currentProduct = productData;
        setDbProduct(productData);

        const ownerId = productData.user_id || '';
        if (ownerId) setStoreOwnerId(ownerId);
        setLiveStoreName(productData.store_name || 'Toko Seller');

        if (ownerId) {
          const { data: storeData } = await supabase
            .from('store_settings')
            .select('logo_url')
            .eq('user_id', ownerId)
            .maybeSingle();

          if (storeData?.logo_url) {
            setLiveStoreLogo(storeData.logo_url);
          }
        }
      } else if (foundProduct) {
        currentProduct = foundProduct;
        setDbProduct(foundProduct);
        setLiveStoreName(foundProduct.storeName || 'Toko Seller');
      }
    }

    fetchStoreAndProductData();
  }, [productId, foundProduct]);

  const activeProduct = foundProduct || dbProduct;

  useEffect(() => {
    if (!storeOwnerId) return;

    const storeChannel = supabase
      .channel(`public:store_settings:user_id=eq.${storeOwnerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'store_settings',
          filter: `user_id=eq.${storeOwnerId}`,
        },
        (payload: any) => {
          if (payload.new?.store_name) {
            setLiveStoreName(payload.new.store_name);
          }
          if (payload.new?.logo_url !== undefined) {
            setLiveStoreLogo(payload.new.logo_url);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(storeChannel);
    };
  }, [storeOwnerId]);

  useEffect(() => {
    async function fetchActiveUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
        const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
        setUserData({ name: fullName, avatar: avatarUrl });
      }
    }
    fetchActiveUser();

    const start = new Date();
    start.setDate(start.getDate() + 2);

    const end = new Date();
    end.setDate(end.getDate() + 4);

    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    const formattedStart = start.toLocaleDateString('id-ID', options);
    const formattedEnd = end.toLocaleDateString('id-ID', options);

    setDeliveryRange(`${formattedStart} - ${formattedEnd}`);
  }, []);

  const product = {
    id: activeProduct ? activeProduct.id : 1,
    categoryTag: activeProduct ? (activeProduct.categoryTag || activeProduct.category || 'Elektronik') : 'Elektronik',
    title: activeProduct ? (activeProduct.title || activeProduct.name || 'Produk Tidak Ditemukan') : 'Produk Tidak Ditemukan',
    storeName: liveStoreName || 'Toko Seller',
    storeAvatar: getStoreAvatarUrl(
      liveStoreLogo || 
      activeProduct?.store_avatar || 
      activeProduct?.storeLogo || 
      null
    ),
    rating: activeProduct ? (activeProduct.rating || 5.0) : 5.0,
    soldCount: activeProduct && ('soldCount' in activeProduct || 'sold_count' in activeProduct) 
      ? (activeProduct.soldCount || activeProduct.sold_count) 
      : '0 Terjual',
    price: activeProduct 
      ? (typeof activeProduct.price === 'number' ? `Rp. ${activeProduct.price.toLocaleString('id-ID')}` : activeProduct.price) 
      : 'Rp. 0',
    stock: activeProduct && ('stock' in activeProduct) ? activeProduct.stock : 0,
    description: activeProduct && (activeProduct.description) 
      ? activeProduct.description 
      : activeProduct 
      ? `Deskripsi lengkap untuk ${activeProduct.title || activeProduct.name} yang dijual oleh ${liveStoreName || 'Seller'}.` 
      : 'Deskripsi tidak tersedia.',
    images: activeProduct && Array.isArray(activeProduct.images) && activeProduct.images.length > 0
      ? activeProduct.images
      : [
          activeProduct ? (activeProduct.imageText || activeProduct.title || activeProduct.name || 'PRODUK') : 'PRODUK', 
          activeProduct ? `${activeProduct.imageText || activeProduct.title || activeProduct.name} 2` : 'DETAIL', 
          activeProduct ? `${activeProduct.imageText || activeProduct.title || activeProduct.name} 3` : 'PREVIEW'
        ],
    image: activeProduct ? (activeProduct.image || activeProduct.image_url || null) : null,
  };

  const categoryLower = product.categoryTag.toLowerCase();
  const isSewa = categoryLower === 'sewa';
  const isJasa = categoryLower === 'jasa';

  const [rentalStartDate, setRentalStartDate] = useState('');
  const [rentalEndDate, setRentalEndDate] = useState('');

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [mainImageError, setMainImageError] = useState(false);
  
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  
  const [alertMessage, setAlertMessage] = useState('');
  const [isAlertVisible, setIsAlertVisible] = useState(false);

  const [reviewAlertMessage, setReviewAlertMessage] = useState('');
  const [isReviewAlertVisible, setIsReviewAlertVisible] = useState(false);
  
  const [reviewsList, setReviewsList] = useState<Review[]>([]);

  useEffect(() => {
    if (!productId) return;

    async function fetchReviews() {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('id', { ascending: false });

      if (!error && data) {
        setReviewsList(data);
      }
    }

    fetchReviews();

    const channel = supabase
      .channel(`public:reviews:product_id=eq.${productId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reviews',
          filter: `product_id=eq.${productId}`,
        },
        (payload) => {
          setReviewsList((prev) => [payload.new as Review, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId]);

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const triggerAlert = (msg: string) => {
    setAlertMessage(msg);
    setIsAlertVisible(true);
    setTimeout(() => {
      setIsAlertVisible(false);
    }, 3000);
  };

  const triggerReviewAlert = (msg: string) => {
    setReviewAlertMessage(msg);
    setIsReviewAlertVisible(true);
    setTimeout(() => {
      setIsReviewAlertVisible(false);
    }, 3000);
  };

  const handleStartChat = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { 
      triggerAlert('Silakan login terlebih dahulu untuk chat dengan penjual!');
      return; 
    }

    if (!storeOwnerId) return;

    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('buyer_id', user.id)
      .eq('seller_id', storeOwnerId)
      .eq('product_id', product.id)
      .maybeSingle();

    if (existing) {
      router.push(`/chat/${existing.id}`);
      return;
    }

    const { data: newConv } = await supabase
      .from('conversations')
      .insert([{
        buyer_id: user.id,
        seller_id: storeOwnerId,
        product_id: product.id,
        buyer_name: userData.name || 'Pembeli',
        buyer_avatar: userData.avatar || '',
        product_name: product.title,
        product_image: product.image,
      }])
      .select()
      .single();

    if (newConv) router.push(`/chat/${newConv.id}`);
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewAlertMessage('');

    if (userRating === 0 && !reviewText.trim()) {
      triggerReviewAlert('Silakan berikan bintang dan tulis komentar ulasan Anda!');
      return;
    }
    if (userRating === 0) {
      triggerReviewAlert('Silakan berikan rating bintang terlebih dahulu!');
      return;
    }
    if (!reviewText.trim()) {
      triggerReviewAlert('Silakan tulis komentar ulasan Anda!');
      return;
    }

    const { error } = await supabase.from('reviews').insert([
      {
        product_id: productId,
        username: userData.name || 'Pengguna',
        avatar: userData.avatar,
        rating: userRating,
        comment: reviewText,
      },
    ]);

    if (error) {
      triggerReviewAlert('Gagal mengirim ulasan. Coba lagi.');
      return;
    }

    setReviewText('');
    setUserRating(0);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col">
      <main className="w-full flex-1 pt-6 pb-12 px-4 sm:px-6 lg:px-8 relative max-w-7xl mx-auto">
        {alertMessage && (
          <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-white border border-[#059669] text-black/80 px-5 py-3 rounded-2xl shadow-lg font-medium text-xs sm:text-sm flex items-center gap-3 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isAlertVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-24 scale-95 pointer-events-none'
          }`}>
            <svg className="w-5 h-5 stroke-[2] text-[#059669] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H19m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{alertMessage}</span>
          </div>
        )}

        {reviewAlertMessage && (
          <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-white border border-[#059669] text-black/80 px-5 py-3 rounded-2xl shadow-lg font-medium text-xs sm:text-sm flex items-center gap-3 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isReviewAlertVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-24 scale-95 pointer-events-none'
          }`}>
            <span className="text-red-500 font-bold">✕</span>
            <span>{reviewAlertMessage}</span>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <Link 
            href={`/`} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#059669] text-white rounded-xl font-semibold text-xs sm:text-sm hover:bg-emerald-700 hover:scale-[1.03] active:scale-[0.98] duration-200 transition-all shadow-sm"
          >
            <span>← Kembali</span>
          </Link>
          <h1 className="text-lg sm:text-2xl font-semibold text-black/80 tracking-tight">Detail Produk</h1>
        </div>

        <div className="border border-[#059669]/40 rounded-3xl p-4 sm:p-6 lg:p-8 bg-white shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
          <div className="w-full lg:col-span-6 lg:sticky lg:top-15 space-y-4">
            <div className="w-full aspect-[4/3] bg-slate-200 rounded-2xl flex items-center justify-center p-6 border border-slate-200 shadow-inner overflow-hidden relative">
              {product.image && !mainImageError ? (
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover rounded-2xl"
                  onError={() => setMainImageError(true)}
                />
              ) : (
                <span className="text-sm sm:text-lg lg:text-xl font-medium text-slate-400 text-center px-4">
                  Belum Ada Foto Produk
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(idx)}
                  className={`w-full aspect-[4/3] rounded-xl bg-slate-100 flex items-center justify-center border-2 hover:scale-[1.03] active:scale-[0.98] duration-200 transition-all overflow-hidden relative ${
                    selectedImage === idx ? 'border-[#059669] bg-emerald-50/50' : 'border-transparent hover:border-black/20'
                  }`}
                >
                  {product.image && !mainImageError ? (
                    <Image
                      src={product.image}
                      alt={`${product.title} ${idx + 1}`}
                      fill
                      className="object-cover"
                      onError={() => setMainImageError(true)}
                    />
                  ) : (
                    <span className="text-[9px] sm:text-[11px] lg:text-xs font-semibold text-slate-400 text-center px-1">
                      Tidak Ada Foto
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full lg:col-span-6 space-y-4">
            <div>
              <span className="text-xs text-black/40 font-medium block mb-1">
                <Link href="/" className="hover:text-[#059669] transition-colors font-semibold">FLEXA</Link>
                {' > '}
                <Link href={`/?category=${product.categoryTag.toLowerCase()}`} className="hover:text-[#059669] transition-colors font-semibold">{product.categoryTag}</Link>
                {' > '}
                <span className="text-[#059669] font-semibold">{product.title}</span>
              </span>
              <h1 className="text-xl sm:text-3xl font-bold text-black/80 tracking-tight">
                {product.title}
              </h1>
            </div>

            <div>
              <span className="text-2xl sm:text-3xl font-bold text-[#059669]">{product.price}</span>
            </div>

            <div className="flex items-center gap-3 py-1">
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg border-2 border-amber-200/50">
                <span className="text-amber-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 sm:w-6 sm:h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </span>
                <span className="font-bold text-xs sm:text-sm text-amber-600">{product.rating}</span>
              </div>
              <span className="text-xs sm:text-sm text-black/60 font-medium">{product.soldCount}</span>
            </div>

            {!isSewa && !isJasa && (
              <div className="inline-flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm text-xs sm:text-sm font-medium text-black/80">
                <span className="text-black/50">Pengiriman</span>
                <span className="text-slate-300">|</span>
                <div className="flex items-center gap-1.5 text-[#059669]">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v11.25c0 1.036.84 1.875 1.875 1.875h1.5a3.75 3.75 0 007.5 0h3.75a3.75 3.75 0 007.5 0h.75a.75.75 0 00.75-.75v-3.75c0-.212-.084-.416-.234-.568l-4.5-4.5a.75.75 0 00-.53-.22H16.5V4.875C16.5 3.84 15.66 3 14.625 3H3.375zM7.5 18.75a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM19.5 18.75a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM15 11.25V6h3.879l3.182 3.182V11.25H15z" />
                  </svg>
                  <span className="font-bold text-[#059669]">{deliveryRange || 'Memuat...'}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <Link
                href={storeOwnerId ? `/store/${storeOwnerId}` : '#'}
                className="flex items-center gap-3 hover:opacity-80 duration-200 transition-opacity"
              >
                {product.storeAvatar ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden relative border border-slate-200 flex-shrink-0">
                    <Image
                      src={product.storeAvatar}
                      alt={product.storeName}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-300 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {product.storeName.charAt(0)}
                  </div>
                )}
                <div>
                  <span className="text-xs text-black/40 block">Toko</span>
                  <span className="text-sm sm:text-base font-bold text-black/70 hover:text-[#059669]">{product.storeName}</span>
                </div>
              </Link>
              <button
                type="button"
                onClick={handleStartChat}
                className="px-4 sm:px-5 py-2.5 bg-[#059669] text-white hover:bg-emerald-700 hover:scale-[1.03] active:scale-[0.98] duration-200 transition-all font-bold text-xs sm:text-sm rounded-xl shadow-sm flex-shrink-0"
              >
                Chat Penjual
              </button>
            </div>

            {isSewa && (
              <RentalDatePicker
                price={product.price}
                startDate={rentalStartDate}
                endDate={rentalEndDate}
                onStartDateChange={setRentalStartDate}
                onEndDateChange={setRentalEndDate}
              />
            )}
            {isJasa && <ServiceBookingCard productId={product.id} triggerAlert={triggerAlert} />}

            <div>
              <h3 className="text-xs sm:text-sm font-bold text-black/80 mb-1">Deskripsi</h3>
              <p className="text-xs sm:text-sm text-black/60 leading-relaxed">
                {product.description}
              </p>
            </div>

            {!isSewa && !isJasa && (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#059669] text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm">
                <span>Stock tersedia :</span>
                <span>{product.stock}</span>
              </div>
            )}

            <div className="space-y-4 pt-2">
              <h3 className="text-xs sm:text-sm font-bold text-black/80">Ulasan Pengguna</h3>
              
              <form onSubmit={handleAddReview} className="p-4 border border-slate-200 rounded-2xl bg-white space-y-3 shadow-sm">
                <span className="text-xs font-bold text-black/70 block">BERI ULASAN ANDA</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className={`hover:scale-110 active:scale-95 duration-200 transition-all ${
                        userRating >= star ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300'
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-7 h-7"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Ceritakan pengalaman belanja Anda..."
                    className="w-full p-3 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#059669] resize-none text-black/80"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#059669] text-white text-xs font-semibold rounded-xl flex items-center justify-center hover:bg-emerald-700 hover:scale-[1.03] active:scale-[0.98] duration-200 transition-all shadow-sm"
                  >
                    KIRIM ULASAN
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                {reviewsList.length === 0 ? (
                  <div className="text-center py-6 text-black/40 text-xs sm:text-sm italic border border-dashed border-slate-200 rounded-2xl">
                    Belum ada ulasan. Jadilah yang pertama memberikan ulasan!
                  </div>
                ) : (
                  reviewsList.map((rev) => (
                    <div key={rev.id} className="p-4 border border-slate-100 rounded-2xl bg-white space-y-2 shadow-sm">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          {rev.avatar ? (
                            <Image
                              src={rev.avatar}
                              alt={rev.username}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {rev.username.charAt(0)}
                            </div>
                          )}
                          <span className="text-xs sm:text-sm font-bold text-black/80">{rev.username}</span>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <svg
                              key={s}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className={`w-4 h-4 ${s <= rev.rating ? 'text-amber-400' : 'text-slate-200'}`}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                              />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-black/70 italic">"{rev.comment}"</p>
                      <span className="text-[10px] text-[#059669] font-bold block">
                        {new Date(rev.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {!isJasa && (
              <div className="sticky bottom-0 left-0 right-0 z-40 bg-white/95 sm:bg-white/90 backdrop-blur-md p-3 sm:p-4 border-t sm:border border-black/30 sm:rounded-2xl shadow-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    className="w-7 h-7 rounded-xl bg-white shadow-sm flex items-center justify-center font-bold text-black/70 hover:text-[#059669] hover:scale-[1.03] active:scale-[0.98] duration-200 transition-all text-sm"
                  >
                    -
                  </button>
                  <span className="text-xs sm:text-sm font-bold text-black/80 w-6 text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={handleIncrement}
                    className="w-7 h-7 rounded-xl bg-white shadow-sm flex items-center justify-center font-bold text-black/70 hover:text-[#059669] hover:scale-[1.03] active:scale-[0.98] duration-200 transition-all text-sm"
                  >
                    +
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 w-full">
                  <button
                    type="button"
                    onClick={async () => {
                      const { data: { user } } = await supabase.auth.getUser();
                      if (!user) {
                        triggerAlert('Silakan login terlebih dahulu untuk memasukkan produk ke keranjang!');
                        return;
                      }

                      const rawNumericPrice = Number(product.price.toString().replace(/[^0-9]/g, '')) || 0;

                      const { error } = await supabase.from('cart').insert([
                        {
                          user_id: user.id,
                          product_id: product.id,
                          product_name: product.title,
                          store_name: product.storeName,
                          product_price: product.price,
                          raw_price: rawNumericPrice,
                          image_text: product.images[selectedImage] || 'PRODUK',
                          quantity: quantity,
                        }
                      ]);

                      if (error) {
                        console.error(error);
                        triggerAlert('Gagal memasukkan produk ke keranjang.');
                        return;
                      }

                      triggerAlert('Produk berhasil masuk ke dalam keranjang!');
                    }}
                    className="py-2.5 px-2 bg-white border border-[#059669] text-[#059669] hover:scale-[1.03] active:scale-[0.98] duration-200 transition-all font-medium text-xs rounded-lg text-center shadow-sm truncate flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-5 h-5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H19m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Keranjang</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (isSewa) {
                        if (!rentalStartDate || !rentalEndDate) {
                          triggerAlert('Silakan pilih tanggal mulai dan selesai sewa terlebih dahulu.');
                          return;
                        }
                        const start = new Date(rentalStartDate);
                        const end = new Date(rentalEndDate);
                        const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
                        router.push(`/checkout/${product.id}?qty=${quantity}&startDate=${rentalStartDate}&endDate=${rentalEndDate}&days=${days}`);
                        return;
                      }
                      router.push(`/checkout/${product.id}?qty=${quantity}`);
                    }}
                    className="py-2.5 px-2 bg-[#059669] text-white hover:bg-emerald-700 hover:scale-[1.03] active:scale-[0.98] duration-200 transition-all font-medium text-xs rounded-lg shadow-lg shadow-emerald-600/20 text-center truncate"
                  >
                    {isSewa ? 'Sewa Sekarang' : 'Beli Sekarang'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}