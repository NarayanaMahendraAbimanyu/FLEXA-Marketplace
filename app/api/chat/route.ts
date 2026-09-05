import { NextRequest, NextResponse } from "next/server";
import { findFaqAnswer } from "@/lib/faq";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Pesan tidak valid." },
        { status: 400 }
      );
    }

    const faqAnswer = findFaqAnswer(message);
    if (faqAnswer) {
      return NextResponse.json({ reply: faqAnswer, source: "faq" });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error("API Key tidak ditemukan di environment variables!");
      return NextResponse.json(
        { error: "GEMINI_API_KEY belum diatur di .env.local" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `Kamu adalah asisten customer service untuk FLEXA, sebuah platform sewa barang & jasa digital di Indonesia.
FLEXA menyediakan sewa: Elektronik (kamera, proyektor, drone, laptop), Fashion, peralatan Event, dan Jasa digital (desain logo, editing video, dll).
Tugasmu: bantu calon penyewa menemukan barang/jasa yang cocok, jelaskan proses sewa secara umum, dan bersikap ramah & singkat.
Jika kamu tidak yakin dengan kebijakan spesifik (misal harga pasti, stok barang), arahkan user untuk mengecek halaman produk atau menghubungi support@flexa.id.
Jawab dalam Bahasa Indonesia, singkat dan jelas (maksimal 3-4 kalimat).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: message,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const aiText = response.text || "Maaf, saya belum bisa menjawab itu sekarang.";

    return NextResponse.json({ reply: aiText, source: "ai" });
  } catch (err: any) {
    console.error("Detail Error Chat API:", err);
    return NextResponse.json(
      { error: `Terjadi kesalahan server: ${err.message || err}` },
      { status: 500 }
    );
  }
}