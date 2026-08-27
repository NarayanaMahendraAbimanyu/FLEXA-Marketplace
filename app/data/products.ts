export interface Product {
  id: number;
  category: string;
  categoryTag: string;
  imageText: string;
  storeName: string;
  rating: number;
  title: string;
  price: string;
  stock: number;
  soldCount: string;
}

export const PRODUCTS: Product[] = [
  { id: 1, category: 'sewa', categoryTag: 'Sewa', imageText: 'DRONE', storeName: 'REZKY RENTAL', rating: 4.9, title: 'Drone DJI 5 Pro Fly', price: 'Rp. 250.000', stock: 12, soldCount: '3rb+ Terjual' },
  { id: 2, category: 'elektronik', categoryTag: 'Elektronik', imageText: 'CAMERA', storeName: 'ALFA CAM', rating: 4.8, title: 'Sony Alpha A7 III', price: 'Rp. 350.000', stock: 8, soldCount: '2rb+ Terjual' },
  { id: 3, category: 'fashion', categoryTag: 'Fashion', imageText: 'SUIT', storeName: 'KING SUIT', rating: 4.7, title: 'Tuksedo Pria Slim Fit', price: 'Rp. 150.000', stock: 25, soldCount: '1rb+ Terjual' },
  { id: 4, category: 'jasa', categoryTag: 'Jasa', imageText: 'DESAIN', storeName: 'STUDIO GRAPHIC', rating: 5.0, title: 'Jasa Desain Logo Professional', price: 'Rp. 500.000', stock: 50, soldCount: '900+ Terjual' },
  { id: 5, category: 'sewa', categoryTag: 'Sewa', imageText: 'PROYEKSI', storeName: 'MEDIA RENT', rating: 4.9, title: 'Proyektor Epson 4000 Lumens', price: 'Rp. 180.000', stock: 15, soldCount: '4rb+ Terjual' },
  { id: 6, category: 'elektronik', categoryTag: 'Elektronik', imageText: 'LAPTOP', storeName: 'GADGET CORNER', rating: 4.8, title: 'MacBook Pro M2 16 inch', price: 'Rp. 450.000', stock: 6, soldCount: '850+ Terjual' },
  { id: 7, category: 'fashion', categoryTag: 'Fashion', imageText: 'KEBAYA', storeName: 'ANUGERAH BUSANA', rating: 4.9, title: 'Kebaya Modern Wisuda', price: 'Rp. 200.000', stock: 20, soldCount: '3rb+ Terjual' },
  { id: 8, category: 'jasa', categoryTag: 'Jasa', imageText: 'FOTO', storeName: 'FLASH SHOT', rating: 4.8, title: 'Jasa Fotografer Event & Buku', price: 'Rp. 800.000', stock: 10, soldCount: '1rb+ Terjual' },
  { id: 9, category: 'sewa', categoryTag: 'Sewa', imageText: 'SOUND', storeName: 'NADA SOUND', rating: 4.6, title: 'Sound System 1000 Watt', price: 'Rp. 600.000', stock: 5, soldCount: '750+ Terjual' },
  { id: 10, category: 'elektronik', categoryTag: 'Elektronik', imageText: 'LIGHTING', storeName: 'LIGHTING PRO', rating: 4.7, title: 'Godox SL60W LED Video Light', price: 'Rp. 120.000', stock: 18, soldCount: '1rb+ Terjual' },
  { id: 11, category: 'fashion', categoryTag: 'Fashion', imageText: 'COSPLAY', storeName: 'ANIME RENT', rating: 4.9, title: 'Kostum Cosplay Naruto Uzumaki', price: 'Rp. 90.000', stock: 30, soldCount: '5rb+ Terjual' },
  { id: 12, category: 'jasa', categoryTag: 'Jasa', imageText: 'WEB DEV', storeName: 'DEV STUDIO', rating: 5.0, title: 'Jasa Pembuatan Web Landing Page', price: 'Rp. 1.500.000', stock: 40, soldCount: '430+ Terjual' },
  { id: 13, category: 'sewa', categoryTag: 'Sewa', imageText: 'TENT', storeName: 'CAMPING GROUND', rating: 4.8, title: 'Tenda Camping Eiger 4 Orang', price: 'Rp. 75.000', stock: 22, soldCount: '2rb+ Terjual' },
  { id: 14, category: 'elektronik', categoryTag: 'Elektronik', imageText: 'MIC', storeName: 'AUDIO TECH', rating: 4.9, title: 'Microphone Wireless Saramonic', price: 'Rp. 130.000', stock: 14, soldCount: '1rb+ Terjual' },
  { id: 15, category: 'fashion', categoryTag: 'Fashion', imageText: 'GAUN', storeName: 'QUEEN DRESS', rating: 4.8, title: 'Gaun Pesta Elegant Red', price: 'Rp. 250.000', stock: 10, soldCount: '950+ Terjual' },
  { id: 16, category: 'jasa', categoryTag: 'Jasa', imageText: 'EDITING', storeName: 'CUT & GO', rating: 4.7, title: 'Jasa Video Editing Reels / TikTok', price: 'Rp. 300.000', stock: 35, soldCount: '2rb+ Terjual' },
  { id: 17, category: 'sewa', categoryTag: 'Sewa', imageText: 'IPAD', storeName: 'IGADGET RENT', rating: 4.9, title: 'iPad Pro 11 inch + Apple Pencil', price: 'Rp. 220.000', stock: 9, soldCount: '1rb+ Terjual' },
  { id: 18, category: 'elektronik', categoryTag: 'Elektronik', imageText: 'GIMBAL', storeName: 'REZKY RENTAL', rating: 4.7, title: 'Gimbal Stabilizer DJI RS3', price: 'Rp. 200.000', stock: 11, soldCount: '1rb+ Terjual' },
  { id: 19, category: 'fashion', categoryTag: 'Fashion', imageText: 'SEPATU', storeName: 'SNEAKER HUB', rating: 4.6, title: 'Sepatu Air Jordan 1 Retro', price: 'Rp. 110.000', stock: 25, soldCount: '3rb+ Terjual' },
  { id: 20, category: 'jasa', categoryTag: 'Jasa', imageText: 'SEO', storeName: 'DIGITAL OPTIMA', rating: 4.9, title: 'Jasa Optimasi SEO Website', price: 'Rp. 1.200.000', stock: 20, soldCount: '620+ Terjual' },
  { id: 21, category: 'sewa', categoryTag: 'Sewa', imageText: 'PLAYSTATION', storeName: 'GAME ZONE', rating: 4.8, title: 'PlayStation 5 + 2 Stik DualSense', price: 'Rp. 170.000', stock: 16, soldCount: '4rb+ Terjual' },
  { id: 22, category: 'elektronik', categoryTag: 'Elektronik', imageText: 'SPEAKER', storeName: 'SOUND TECH', rating: 4.8, title: 'Speaker Portable JBL PartyBox', price: 'Rp. 250.000', stock: 13, soldCount: '2rb+ Terjual' },
  { id: 23, category: 'fashion', categoryTag: 'Fashion', imageText: 'BATIK', storeName: 'BATIK WARISAN', rating: 4.9, title: 'Batik Tulis Premium Solo Pria', price: 'Rp. 130.000', stock: 40, soldCount: '3rb+ Terjual' },
  { id: 24, category: 'jasa', categoryTag: 'Jasa', imageText: 'COPYWRITE', storeName: 'PEN KREATIF', rating: 4.8, title: 'Jasa Penulisan Artikel SEO', price: 'Rp. 200.000', stock: 45, soldCount: '1rb+ Terjual' },
  { id: 25, category: 'sewa', categoryTag: 'Sewa', imageText: 'GENSET', storeName: 'POWER UTAMA', rating: 4.7, title: 'Genset Silent 5000 Watt', price: 'Rp. 500.000', stock: 4, soldCount: '510+ Terjual' },
  { id: 26, category: 'elektronik', categoryTag: 'Elektronik', imageText: 'VR HEADSET', storeName: 'VR WORLD', rating: 4.9, title: 'Meta Quest 3 128GB VR', price: 'Rp. 210.000', stock: 7, soldCount: '890+ Terjual' },
  { id: 27, category: 'fashion', categoryTag: 'Fashion', imageText: 'JAKET', storeName: 'OUTDOOR STYLE', rating: 4.7, title: 'Jaket Waterproof Gore-Tex', price: 'Rp. 85.000', stock: 35, soldCount: '2rb+ Terjual' },
  { id: 28, category: 'jasa', categoryTag: 'Jasa', imageText: 'TRANSLATOR', storeName: 'BAHASA GLOBAL', rating: 5.0, title: 'Jasa Penerjemah Dokumen Inggris', price: 'Rp. 350.000', stock: 60, soldCount: '1rb+ Terjual' },
  { id: 29, category: 'sewa', categoryTag: 'Sewa', imageText: 'CYCLE', storeName: 'GOWES RENT', rating: 4.8, title: 'Sepeda Balap Carbon Roadbike', price: 'Rp. 190.000', stock: 10, soldCount: '1rb+ Terjual' },
  { id: 30, category: 'elektronik', categoryTag: 'Elektronik', imageText: 'MONITOR', storeName: 'DISPLAY HUB', rating: 4.9, title: 'Monitor Gaming Curved 144Hz', price: 'Rp. 160.000', stock: 12, soldCount: '2rb+ Terjual' },
];