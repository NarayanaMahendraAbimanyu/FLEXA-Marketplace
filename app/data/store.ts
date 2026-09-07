export interface DummyStore {
  storeId: string;
  storeName: string;
  description: string;
  address: string;
}

export const DUMMY_STORES: DummyStore[] = [
  { storeId: 'dummy-rezky-rental', storeName: 'REZKY RENTAL', description: 'Menyewakan peralatan drone dan gimbal berkualitas untuk kebutuhan foto & video profesional.', address: 'Jl. Diponegoro No. 12, Bandung' },
  { storeId: 'dummy-alfa-cam', storeName: 'ALFA CAM', description: 'Toko kamera dan lensa terpercaya untuk fotografer pemula hingga profesional.', address: 'Jl. Braga No. 45, Bandung' },
  { storeId: 'dummy-king-suit', storeName: 'KING SUIT', description: 'Penjualan dan penyewaan tuksedo dan setelan formal pria.', address: 'Jl. Sudirman No. 88, Jakarta Pusat' },
  { storeId: 'dummy-studio-graphic', storeName: 'STUDIO GRAPHIC', description: 'Studio jasa desain grafis profesional untuk kebutuhan branding UMKM.', address: 'Jl. Gatot Subroto No. 21, Jakarta Selatan' },
  { storeId: 'dummy-media-rent', storeName: 'MEDIA RENT', description: 'Rental peralatan presentasi dan multimedia untuk acara & kantor.', address: 'Jl. Ahmad Yani No. 5, Surabaya' },
  { storeId: 'dummy-gadget-corner', storeName: 'GADGET CORNER', description: 'Menjual laptop dan gadget elektronik terbaru dengan garansi resmi.', address: 'Jl. Malioboro No. 33, Yogyakarta' },
  { storeId: 'dummy-anugerah-busana', storeName: 'ANUGERAH BUSANA', description: 'Spesialis kebaya modern untuk acara wisuda dan pernikahan.', address: 'Jl. Pahlawan No. 17, Semarang' },
  { storeId: 'dummy-flash-shot', storeName: 'FLASH SHOT', description: 'Jasa fotografer event, wisuda, dan buku tahunan sekolah.', address: 'Jl. Veteran No. 9, Malang' },
  { storeId: 'dummy-nada-sound', storeName: 'NADA SOUND', description: 'Penyewaan sound system untuk acara pernikahan dan konser kecil.', address: 'Jl. Cihampelas No. 60, Bandung' },
  { storeId: 'dummy-lighting-pro', storeName: 'LIGHTING PRO', description: 'Menyediakan peralatan lighting video profesional untuk konten kreator.', address: 'Jl. Kemang Raya No. 14, Jakarta Selatan' },
  { storeId: 'dummy-anime-rent', storeName: 'ANIME RENT', description: 'Penyewaan kostum cosplay karakter anime dan game favorit.', address: 'Jl. Dago No. 77, Bandung' },
  { storeId: 'dummy-dev-studio', storeName: 'DEV STUDIO', description: 'Jasa pembuatan website dan landing page untuk bisnis dan personal.', address: 'Jl. HR Rasuna Said No. 3, Jakarta Selatan' },
  { storeId: 'dummy-camping-ground', storeName: 'CAMPING GROUND', description: 'Rental peralatan camping dan pendakian gunung lengkap.', address: 'Jl. Setiabudi No. 41, Bandung' },
  { storeId: 'dummy-audio-tech', storeName: 'AUDIO TECH', description: 'Menjual peralatan audio dan mikrofon wireless untuk konten kreator.', address: 'Jl. Thamrin No. 25, Jakarta Pusat' },
  { storeId: 'dummy-queen-dress', storeName: 'QUEEN DRESS', description: 'Butik gaun pesta elegan untuk berbagai acara formal.', address: 'Jl. Riau No. 55, Bandung' },
  { storeId: 'dummy-cut-and-go', storeName: 'CUT & GO', description: 'Jasa video editing cepat untuk konten Reels dan TikTok.', address: 'Jl. Kaliurang No. 10, Yogyakarta' },
  { storeId: 'dummy-igadget-rent', storeName: 'IGADGET RENT', description: 'Penyewaan tablet dan aksesoris Apple untuk kebutuhan kerja dan acara.', address: 'Jl. Merdeka No. 8, Bandung' },
  { storeId: 'dummy-sneaker-hub', storeName: 'SNEAKER HUB', description: 'Menjual sepatu sneakers original dan limited edition.', address: 'Jl. Asia Afrika No. 19, Bandung' },
  { storeId: 'dummy-digital-optima', storeName: 'DIGITAL OPTIMA', description: 'Jasa optimasi SEO dan digital marketing untuk website bisnis.', address: 'Jl. Sisingamangaraja No. 2, Jakarta Selatan' },
  { storeId: 'dummy-game-zone', storeName: 'GAME ZONE', description: 'Rental konsol game terbaru untuk acara dan penggunaan pribadi.', address: 'Jl. Ahmad Dahlan No. 30, Yogyakarta' },
  { storeId: 'dummy-sound-tech', storeName: 'SOUND TECH', description: 'Menjual speaker portable dan perangkat audio outdoor.', address: 'Jl. Pemuda No. 12, Semarang' },
  { storeId: 'dummy-batik-warisan', storeName: 'BATIK WARISAN', description: 'Menjual batik tulis premium khas Solo dengan motif tradisional.', address: 'Jl. Slamet Riyadi No. 100, Solo' },
  { storeId: 'dummy-pen-kreatif', storeName: 'PEN KREATIF', description: 'Jasa penulisan artikel SEO dan konten blog untuk bisnis.', address: 'Jl. Diponegoro No. 5, Semarang' },
  { storeId: 'dummy-power-utama', storeName: 'POWER UTAMA', description: 'Penyewaan genset silent untuk acara outdoor dan kebutuhan darurat.', address: 'Jl. Industri No. 22, Bekasi' },
  { storeId: 'dummy-vr-world', storeName: 'VR WORLD', description: 'Menjual dan menyewakan perangkat VR headset terbaru.', address: 'Jl. Boulevard No. 7, Jakarta Utara' },
  { storeId: 'dummy-outdoor-style', storeName: 'OUTDOOR STYLE', description: 'Menjual jaket dan perlengkapan outdoor tahan air berkualitas.', address: 'Jl. Cihampelas No. 90, Bandung' },
  { storeId: 'dummy-bahasa-global', storeName: 'BAHASA GLOBAL', description: 'Jasa penerjemah dokumen resmi dan non-resmi berbagai bahasa.', address: 'Jl. Cikini Raya No. 15, Jakarta Pusat' },
  { storeId: 'dummy-gowes-rent', storeName: 'GOWES RENT', description: 'Penyewaan sepeda balap dan sepeda gunung untuk komunitas gowes.', address: 'Jl. Ir. H. Juanda No. 40, Bandung' },
  { storeId: 'dummy-display-hub', storeName: 'DISPLAY HUB', description: 'Menjual monitor gaming dan perangkat display terbaru.', address: 'Jl. Panglima Sudirman No. 60, Surabaya' },
];

export function findDummyStore(storeId: string): DummyStore | undefined {
  return DUMMY_STORES.find((s) => s.storeId === storeId);
}