'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const CATEGORIES = ['Elektronik', 'Fashion', 'Sewa', 'Jasa'] as const;

// Kategori yang tidak memakai stok barang fisik (dihitung per pesanan/slot, bukan unit)
const NON_STOCK_CATEGORIES = ['Sewa', 'Jasa'];

const CATEGORY_STYLES: Record<string, string> = {
  Elektronik: 'bg-blue-50 text-blue-700 border-blue-100',
  Fashion: 'bg-pink-50 text-pink-700 border-pink-100',
  Sewa: 'bg-amber-50 text-amber-700 border-amber-100',
  Jasa: 'bg-purple-50 text-purple-700 border-purple-100',
};

function CategoryBadge({ category }: { category: string }) {
  const style = CATEGORY_STYLES[category] || 'bg-slate-50 text-slate-600 border-slate-100';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${style}`}>
      {category}
    </span>
  );
}

export default function SellerProductPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Elektronik');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('');
  const [price, setPrice] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeAvatar, setStoreAvatar] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isNotifAnimatingOut, setIsNotifAnimatingOut] = useState(false);

  const requiresStock = !NON_STOCK_CATEGORIES.includes(category);
  const requiresStockEdit = selectedProduct ? !NON_STOCK_CATEGORIES.includes(selectedProduct.category) : true;

  useEffect(() => {
    fetchProducts();
    fetchStoreInfo();
  }, []);

  // Kalau kategori diganti ke Sewa/Jasa, kosongkan input stok supaya tidak ikut terkirim
  useEffect(() => {
    if (!requiresStock && stock !== '') setStock('');
  }, [category]);

  const fetchStoreInfo = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('store_settings')
        .select('store_name, store_avatar, logo_url')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        if (data.store_name) {
          setStoreName(data.store_name);
        }
        if (data.store_avatar || data.logo_url) {
          setStoreAvatar(data.store_avatar || data.logo_url);
        }
      }
    }
  };

  const triggerNotification = (message: string, type: 'success' | 'error') => {
    setIsNotifAnimatingOut(false);
    setNotification({ message, type });
    setTimeout(() => {
      setIsNotifAnimatingOut(true);
      setTimeout(() => {
        setNotification(null);
        setIsNotifAnimatingOut(false);
      }, 300);
    }, 3000);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (!error && data) {
      setProducts(data);
    }
  };

  const formatNumberWithDots = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    return Number(numbers).toLocaleString('id-ID');
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const rawValue = e.target.value;
    const formatted = formatNumberWithDots(rawValue);
    if (isEdit) {
      setSelectedProduct({ ...selectedProduct, price: formatted });
    } else {
      setPrice(formatted);
    }
  };

  const isFormValid =
    name.trim() !== '' &&
    category !== '' &&
    description.trim() !== '' &&
    price !== '' &&
    (!requiresStock || stock !== '');

  const isEditFormValid =
    selectedProduct &&
    selectedProduct.name?.trim() !== '' &&
    selectedProduct.category !== '' &&
    selectedProduct.description?.trim() !== '' &&
    selectedProduct.price !== '' &&
    (!requiresStockEdit || (selectedProduct.stock !== '' && selectedProduct.stock !== undefined));

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    let finalStoreName = storeName;
    let currentUserId = null;

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      currentUserId = user.id;
      if (!finalStoreName) {
        const { data } = await supabase
          .from('store_settings')
          .select('store_name')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data && data.store_name) {
          finalStoreName = data.store_name;
        } else {
          finalStoreName = user.user_metadata?.store_name || user.user_metadata?.full_name || 'Toko Saya';
        }
      }
    } else {
      finalStoreName = 'Toko Saya';
    }

    let imageUrl = '';

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile);

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        if (publicUrlData) {
          imageUrl = publicUrlData.publicUrl;
        }
      }
    }

    const formattedPrice = `Rp. ${price}`;

    const newProductData = {
      name: name,
      category: category,
      price: formattedPrice,
      stock: requiresStock ? Number(stock) : null,
      description: description,
      image: imageUrl,
      store_name: finalStoreName,
      user_id: currentUserId,
    };

    const { data, error } = await supabase.from('products').insert([newProductData]).select();
    if (!error && data) {
      setProducts([data[0], ...products]);
      setName('');
      setDescription('');
      setStock('');
      setPrice('');
      setCategory('Elektronik');
      setImageFile(null);
      setIsModalOpen(false);
      triggerNotification('Produk baru berhasil ditambahkan!', 'success');
    } else {
      triggerNotification('Gagal menambahkan produk baru.', 'error');
    }
  };

  const handleOpenEditModal = (product: any) => {
    const rawPriceNumber = product.price ? product.price.replace(/[^0-9]/g, '') : '';
    const formattedExistingPrice = rawPriceNumber ? Number(rawPriceNumber).toLocaleString('id-ID') : '';
    setSelectedProduct({ ...product, price: formattedExistingPrice });
    setEditImageFile(null);
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditFormValid) return;

    let imageUrl = selectedProduct.image;

    if (editImageFile) {
      const fileExt = editImageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, editImageFile);

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        if (publicUrlData) {
          imageUrl = publicUrlData.publicUrl;
        }
      }
    } else if (!selectedProduct.image) {
      imageUrl = '';
    }

    const formattedPrice = `Rp. ${selectedProduct.price}`;

    const updatedData = {
      name: selectedProduct.name,
      category: selectedProduct.category,
      description: selectedProduct.description,
      stock: requiresStockEdit ? Number(selectedProduct.stock) : null,
      price: formattedPrice,
      image: imageUrl,
    };

    const { error } = await supabase
      .from('products')
      .update(updatedData)
      .eq('id', selectedProduct.id);

    if (!error) {
      setProducts(products.map((p) => (p.id === selectedProduct.id ? { ...selectedProduct, ...updatedData } : p)));
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      setEditImageFile(null);
      triggerNotification('Perubahan produk berhasil disimpan!', 'success');
    } else {
      triggerNotification('Gagal menyimpan perubahan produk.', 'error');
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    const { error } = await supabase.from('products').delete().eq('id', selectedProduct.id);
    if (!error) {
      setProducts(products.filter((p) => p.id !== selectedProduct.id));
      setIsDeleteModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      setEditImageFile(null);
      triggerNotification('Produk berhasil dihapus!', 'success');
    } else {
      triggerNotification('Gagal menghapus produk.', 'error');
    }
  };

  return (
    <div className="w-full px-2 sm:px-2 lg:px-2 relative font-poppins">
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <div
            className={`flex items-center gap-3 rounded-xl px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300 ${
              notification.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
            } ${isNotifAnimatingOut ? '-translate-y-20 opacity-0' : 'translate-y-0 opacity-100'}`}
          >
            {notification.type === 'success' ? (
              <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <main className="flex-1 min-h-screen">
        <div className="w-full max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Katalog Produk</h1>
                <p className="text-sm text-slate-500">{products.length} produk terdaftar di toko kamu</p>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-emerald-600/20 transition-all duration-200 hover:scale-[1.02] hover:bg-emerald-700 active:scale-95"
            >
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Tambah Produk</span>
            </button>
          </div>

          <div className="mb-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-600">Belum ada produk</p>
                <p className="text-xs text-slate-400">Klik &quot;Tambah Produk&quot; untuk mulai berjualan.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="py-3.5 px-6">Produk</th>
                      <th className="py-3.5 px-4 text-center">Harga</th>
                      <th className="py-3.5 px-4 text-center">Stok</th>
                      <th className="py-3.5 px-6 text-center">Opsi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {products.map((product) => {
                      const isStockless = NON_STOCK_CATEGORIES.includes(product.category);
                      return (
                        <tr key={product.id} className="transition-colors hover:bg-slate-50/80">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3.5">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="h-12 w-12 shrink-0 rounded-xl border border-slate-200 bg-slate-100 object-cover"
                                />
                              ) : (
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100">
                                  <span className="px-0.5 text-center text-[9px] font-medium leading-tight text-slate-400">
                                    Tanpa Foto
                                  </span>
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-slate-800">{product.name}</p>
                                <div className="mt-1">
                                  <CategoryBadge category={product.category} />
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center font-semibold text-emerald-600">{product.price}</td>
                          <td className="py-4 px-4 text-center">
                            {isStockless ? (
                              <span className="text-xs text-slate-400">Tanpa stok</span>
                            ) : (
                              <span className="font-semibold text-slate-700">{product.stock}</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() => handleOpenEditModal(product)}
                              className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition-all duration-200 hover:scale-[1.03] hover:bg-emerald-700 active:scale-95"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]">
          <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <h2 className="text-lg font-bold text-slate-900">Buat Produk Baru</h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="Tutup"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Nama Produk</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama produk..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Kategori Produk</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {CATEGORIES.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
                        category === c
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/30'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                {!requiresStock && (
                  <p className="mt-1.5 text-xs text-slate-400">
                    Kategori ini dihitung per pesanan, jadi kolom stok disembunyikan.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Deskripsi Produk</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tuliskan deskripsi lengkap produk..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                  required
                ></textarea>
              </div>

              <div className={`grid gap-4 ${requiresStock ? 'grid-cols-2' : 'grid-cols-1'}`}>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Harga Produk</label>
                  <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/20">
                    <span className="border-r border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-500">Rp.</span>
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => handlePriceChange(e, false)}
                      placeholder="0"
                      className="w-full bg-transparent px-3.5 py-2.5 text-sm text-slate-900 outline-none"
                      required
                    />
                  </div>
                </div>

                {requiresStock && (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Stok Produk</label>
                    <input
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0).toString())}
                      placeholder="0"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                      required
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Foto Produk</label>
                <input
                  id="create-product-image-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setImageFile(e.target.files[0]);
                    }
                  }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100"
                />
                {imageFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      const fileInput = document.getElementById('create-product-image-input') as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }}
                    className="mt-2 rounded-lg border border-red-200 px-3.5 py-1.5 text-xs font-medium text-red-600 transition-all duration-200 hover:border-red-400 hover:bg-red-50"
                  >
                    Hilangkan Foto
                  </button>
                )}
              </div>
            </form>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={handleCreateProduct}
                disabled={!isFormValid}
                className={`rounded-xl px-5 py-2 text-sm font-medium text-white transition-all duration-200 ${
                  isFormValid
                    ? 'bg-emerald-600 hover:scale-[1.02] hover:bg-emerald-700 active:scale-95'
                    : 'cursor-not-allowed bg-slate-300'
                }`}
              >
                Buat Produk Baru
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]">
          <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <h2 className="text-lg font-bold text-slate-900">Edit Produk</h2>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="Tutup"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Nama Produk</label>
                <input
                  type="text"
                  value={selectedProduct.name}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                  placeholder="Masukkan nama produk..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Kategori Produk</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {CATEGORIES.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setSelectedProduct({ ...selectedProduct, category: c })}
                      className={`rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
                        selectedProduct.category === c
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/30'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                {!requiresStockEdit && (
                  <p className="mt-1.5 text-xs text-slate-400">
                    Kategori ini dihitung per pesanan, jadi kolom stok disembunyikan.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Deskripsi Produk</label>
                <textarea
                  value={selectedProduct.description || ''}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, description: e.target.value })}
                  placeholder="Tuliskan deskripsi lengkap produk..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                  required
                ></textarea>
              </div>

              <div className={`grid gap-4 ${requiresStockEdit ? 'grid-cols-2' : 'grid-cols-1'}`}>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Harga Produk</label>
                  <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/20">
                    <span className="border-r border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-500">Rp.</span>
                    <input
                      type="text"
                      value={selectedProduct.price}
                      onChange={(e) => handlePriceChange(e, true)}
                      placeholder="0"
                      className="w-full bg-transparent px-3.5 py-2.5 text-sm text-slate-900 outline-none"
                      required
                    />
                  </div>
                </div>

                {requiresStockEdit && (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Stok Produk</label>
                    <input
                      type="number"
                      value={selectedProduct.stock ?? ''}
                      onChange={(e) =>
                        setSelectedProduct({
                          ...selectedProduct,
                          stock: e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0),
                        })
                      }
                      placeholder="0"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                      required
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Foto Produk</label>

                {(editImageFile || selectedProduct.image) && (
                  <div className="mb-3 flex items-center gap-3">
                    <img
                      src={editImageFile ? URL.createObjectURL(editImageFile) : selectedProduct.image}
                      alt="Preview Produk"
                      className="h-16 w-16 rounded-xl border border-slate-200 object-cover"
                    />
                    <p className="text-xs font-medium text-slate-500">
                      {editImageFile ? 'Foto baru dipilih' : 'Foto saat ini'}
                    </p>
                  </div>
                )}

                <input
                  id="edit-product-image-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setEditImageFile(e.target.files[0]);
                    }
                  }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100"
                />

                {(editImageFile || (selectedProduct.image && !selectedProduct.image.includes('placehold.co'))) && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditImageFile(null);
                      setSelectedProduct({ ...selectedProduct, image: '' });
                      const fileInput = document.getElementById('edit-product-image-input') as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }}
                    className="mt-2 rounded-lg border border-red-200 px-3.5 py-1.5 text-xs font-medium text-red-600 transition-all duration-200 hover:border-red-400 hover:bg-red-50"
                  >
                    Hilangkan Foto
                  </button>
                )}
              </div>
            </form>

            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-all duration-200 hover:border-red-400 hover:bg-red-50"
              >
                Hapus Produk
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50"
                >
                  Batalkan
                </button>
                <button
                  type="button"
                  onClick={handleUpdateProduct}
                  disabled={!isEditFormValid}
                  className={`rounded-xl px-5 py-2 text-sm font-medium text-white transition-all duration-200 ${
                    isEditFormValid
                      ? 'bg-emerald-600 hover:scale-[1.02] hover:bg-emerald-700 active:scale-95'
                      : 'cursor-not-allowed bg-slate-300'
                  }`}
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="mb-1.5 text-base font-bold text-slate-900">Hapus produk ini?</h3>
            <p className="mb-6 text-sm text-slate-500">Tindakan ini tidak dapat dibatalkan setelah dikonfirmasi.</p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:scale-[1.02] hover:bg-red-700 active:scale-95"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}