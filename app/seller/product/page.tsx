'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isNotifAnimatingOut, setIsNotifAnimatingOut] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

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

  const isFormValid = name.trim() !== '' && category !== '' && description.trim() !== '' && stock !== '' && price !== '';
  const isEditFormValid = selectedProduct && selectedProduct.name?.trim() !== '' && selectedProduct.category !== '' && selectedProduct.description?.trim() !== '' && selectedProduct.stock !== '' && selectedProduct.stock !== undefined && selectedProduct.price !== '';

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    let imageUrl = `https://placehold.co/100x100?text=${encodeURIComponent(name || 'Product')}`;

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
      stock: Number(stock),
      description: description,
      image: imageUrl
    };

    const { data, error } = await supabase.from('products').insert([newProductData]).select();
    if (!error && data) {
      setProducts([data[0], ...products]);
      setName('');
      setDescription('');
      setStock('');
      setPrice('');
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
    }

    const formattedPrice = `Rp. ${selectedProduct.price}`;

    const updatedData = {
      name: selectedProduct.name,
      category: selectedProduct.category,
      description: selectedProduct.description,
      stock: Number(selectedProduct.stock),
      price: formattedPrice,
      image: imageUrl
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
    <div className="w-full px-2 sm:px-2 lg:px-2 relative">
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <div
            className={`px-6 py-3 rounded-xl shadow-lg text-white font-medium text-sm flex items-center gap-3 transition-all duration-300 transform ${
              notification.type === 'success' ? 'bg-[#059669]' : 'bg-red-600'
            } ${isNotifAnimatingOut ? '-translate-y-20 opacity-0' : ''}`}
          >
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <main className="flex-1 min-h-screen">
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8 border-b border-black/30 pb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black/85">Katalog Produk</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#059669] hover:scale-105 active:scale-95 duration-200 transition-all text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-sm"
            >
              Tambah Produk
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-10">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-black/80 font-semibold text-sm">
                    <th className="py-4 px-6">Nama Produk</th>
                    <th className="py-4 px-0">Harga</th>
                    <th className="py-4 px-0">Stok</th>
                    <th className="py-4 px-0 text-center">Opsi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 flex items-center gap-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">{product.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{product.category}</p>
                        </div>
                      </td>
                      <td className="py-4 px-0 text-emerald-700 font-medium">{product.price}</td>
                      <td className="py-4 px-3 text-black/80 font-semibold">{product.stock}</td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          className="bg-[#059669] hover:scale-105 active:scale-95 duration-200 text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Buat Produk Baru</h2>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Nama Produk</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama produk..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Kategori Produk</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900"
                >
                  <option value="Elektronik">Elektronik</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Sewa">Sewa</option>
                  <option value="Jasa">Jasa</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Deskripsi Produk</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tuliskan deskripsi lengkap produk..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Harga Produk</label>
                <div className="flex items-center w-full border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 bg-white">
                  <span className="px-4 py-2.5 bg-slate-50 text-slate-600 text-sm font-semibold border-r border-slate-200">Rp.</span>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => handlePriceChange(e, false)}
                    placeholder="0"
                    className="w-full px-4 py-2.5 text-sm focus:outline-none text-slate-900 bg-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Stok Produk</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0).toString())}
                  placeholder="0"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Foto Produk</label>
                <input
                  id="create-product-image-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setImageFile(e.target.files[0]);
                    }
                  }}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
                {imageFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      const fileInput = document.getElementById('create-product-image-input') as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }}
                    className="mt-2 text-xs font-medium text-red-600 py-2 px-4 bg-transparent border border-red-300 rounded-xl hover:border-red-600 hover:scale-105 active:scale-95 duration-200 transition-all"
                  >
                    Hilangkan Foto
                  </button>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-black/80 border border-black/30 hover:border-black/80 hover:scale-105 active:scale-95 duration-200 transition-all"
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className={`px-5 py-2 rounded-xl text-sm font-medium text-white transition-all ${
                    isFormValid ? 'bg-[#059669] hover:bg-[#047857] hover:scale-105 active:scale-95 duration-200 transition-all' : 'bg-slate-300 cursor-not-allowed'
                  }`}
                >
                  Buat Produk Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Edit Produk</h2>
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Nama Produk</label>
                <input
                  type="text"
                  value={selectedProduct.name}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                  placeholder="Masukkan nama produk..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Kategori Produk</label>
                <select
                  value={selectedProduct.category}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, category: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900"
                >
                  <option value="Elektronik">Elektronik</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Sewa">Sewa</option>
                  <option value="Jasa">Jasa</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Deskripsi Produk</label>
                <textarea
                  value={selectedProduct.description || ''}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, description: e.target.value })}
                  placeholder="Tuliskan deskripsi lengkap produk..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Harga Produk</label>
                <div className="flex items-center w-full border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 bg-white">
                  <span className="px-4 py-2.5 bg-slate-50 text-slate-600 text-sm font-semibold border-r border-slate-200">Rp.</span>
                  <input
                    type="text"
                    value={selectedProduct.price}
                    onChange={(e) => handlePriceChange(e, true)}
                    placeholder="0"
                    className="w-full px-4 py-2.5 text-sm focus:outline-none text-slate-900 bg-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Stok Produk</label>
                <input
                  type="number"
                  value={selectedProduct.stock}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, stock: e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0) })}
                  placeholder="0"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Foto Produk</label>
                <input
                  id="edit-product-image-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setEditImageFile(e.target.files[0]);
                    }
                  }}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
                {editImageFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditImageFile(null);
                      const fileInput = document.getElementById('edit-product-image-input') as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }}
                    className="mt-2 text-xs font-medium text-red-600 py-2 px-4 bg-transparent border border-red-300 rounded-xl hover:border-red-600 hover:scale-105 active:scale-95 duration-200 transition-all"
                  >
                    Hilangkan Foto
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-red-600 border border-red-300 hover:border-red-600 hover:scale-105 active:scale-95 duration-200 transition-all"
                >
                  Hapus Produk
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-black/70 border border-black/30 hover:border-black/80 hover:scale-105 active:scale-95 duration-200 transition-all"
                  >
                    Batalkan
                  </button>
                  <button
                    type="submit"
                    disabled={!isEditFormValid}
                    className={`px-5 py-2 rounded-xl text-sm font-medium text-white transition-all ${
                      isEditFormValid ? 'bg-[#059669] hover:bg-[#047857] hover:scale-105 active:scale-95 duration-200 transition-all' : 'bg-slate-300 cursor-not-allowed'
                    }`}
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl text-center">
            <h3 className="text-lg font-bold text-black/80 mb-2">Hapus Produk?</h3>
            <p className="text-sm text-black/60 mb-6">Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-black/80 border border-black/30 hover:border-black/80 hover:scale-105 active:scale-95 duration-200 transition-all"
              >
                Tidak
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:scale-105 active:scale-95 duration-200 transition-all"
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