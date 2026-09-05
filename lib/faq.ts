export interface FaqItem {
  keywords: string[];
  answer: string;
}

export const faqData: FaqItem[] = [
  {
    keywords: ["cara sewa", "bagaimana sewa", "cara menyewa", "sewa gimana"],
    answer:
      "Untuk menyewa barang di FLEXA: 1) Cari barang/jasa yang kamu butuhkan, 2) Pilih tanggal sewa, 3) Klik 'Sewa Sekarang', 4) Lakukan pembayaran, 5) Barang akan diantar atau bisa diambil sesuai kesepakatan dengan penyedia.",
  },
  {
    keywords: ["syarat", "ktp", "identitas", "dokumen"],
    answer:
      "Syarat sewa umumnya: KTP yang masih berlaku, nomor HP aktif, dan untuk barang bernilai tinggi kadang diperlukan jaminan tambahan. Detail syarat bisa berbeda tergantung penyedia barang.",
  },
  {
    keywords: ["deposit", "jaminan", "dp"],
    answer:
      "Sebagian besar barang memerlukan deposit/jaminan yang akan dikembalikan penuh setelah barang dikembalikan dalam kondisi baik. Besaran deposit tertera di halaman masing-masing produk.",
  },
  {
    keywords: ["telat", "denda", "terlambat kembalikan"],
    answer:
      "Jika pengembalian terlambat, akan dikenakan denda harian sesuai ketentuan yang tertera di halaman produk. Sebaiknya hubungi penyedia jika kamu memperkirakan akan terlambat.",
  },
  {
    keywords: ["hubungi", "kontak", "customer service", "cs", "admin"],
    answer:
      "Kamu bisa menghubungi tim support FLEXA melalui email di support@flexa.id atau chat ini. Jika pertanyaanmu lebih kompleks, saya akan bantu carikan jawabannya!",
  },
  {
    keywords: ["kategori", "jenis barang", "apa saja yang bisa disewa"],
    answer:
      "FLEXA menyediakan sewa Elektronik (kamera, proyektor, laptop, dll), Fashion, peralatan Event, dan berbagai Jasa digital seperti desain logo, editing video, dan lainnya.",
  },
];

export function findFaqAnswer(message: string): string | null {
  const lowerMsg = message.toLowerCase();
  for (const item of faqData) {
    if (item.keywords.some((kw) => lowerMsg.includes(kw))) {
      return item.answer;
    }
  }
  return null;
}