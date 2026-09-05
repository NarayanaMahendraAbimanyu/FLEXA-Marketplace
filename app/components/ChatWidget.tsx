"use client";
import { useState, useRef, useEffect } from "react";
import { Sparkles, X, ArrowUp, ShoppingBag } from "lucide-react";

interface Message {
  role: "user" | "bot";
  text: string;
}

const SUGGESTIONS = ["Cara sewa barang", "Kategori apa saja?"];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Halo, saya asisten FLEXA. Ada yang bisa saya bantu seputar sewa barang atau jasa digital?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) {
      setHasOpenedOnce(true);
      const t = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const sendMessage = async (overrideText?: string) => {
    const trimmed = (overrideText ?? input).trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: res.ok ? data.reply : data.error || "Maaf, terjadi kesalahan.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Koneksi bermasalah, coba lagi sebentar ya." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="fixed bottom-24 right-4 sm:bottom-5 sm:right-5 z-50 flex flex-col items-end font-sans pointer-events-none">
      <div
        className={`mb-3 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_12px_40px_-8px_rgba(4,52,44,0.35)] ring-1 ring-black/5 transition-all duration-300 ease-out ${
          isOpen
            ? "h-[500px] translate-y-0 opacity-100 pointer-events-auto"
            : "pointer-events-none h-0 translate-y-3 opacity-0"
        }`}
      >
        <div className="relative flex items-center gap-3 bg-gradient-to-br from-emerald-600 to-emerald-700 px-4 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
            <ShoppingBag size={18} className="text-white" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold leading-tight text-white">FLEXA Assistant</p>
            <p className="flex items-center gap-1.5 text-[12px] text-emerald-50/80">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-300" />
              Siap membantu
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Tutup chat"
            className="rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        <div ref={scrollRef} className="flex-1 space-y-3.5 overflow-y-auto bg-[#F7F8F6] px-3.5 py-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "bot" && (
                <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center self-end rounded-full bg-emerald-600">
                  <Sparkles size={13} className="text-white" />
                </div>
              )}
              <div
                className={`max-w-[75%] whitespace-pre-wrap px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                  msg.role === "user"
                    ? "rounded-2xl rounded-br-sm bg-emerald-600 text-white"
                    : "rounded-2xl rounded-bl-sm bg-white text-slate-700 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center self-end rounded-full bg-emerald-600">
                <Sparkles size={13} className="text-white" />
              </div>
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300" />
              </div>
            </div>
          )}

          {messages.length === 1 && !loading && (
            <div className="flex flex-wrap gap-1.5 pl-9 pt-1">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-[12px] text-emerald-700 transition-colors hover:bg-emerald-50"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-slate-100 bg-white p-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tulis pesan..."
            className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-[13.5px] text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            aria-label="Kirim pesan"
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Tutup chat" : "Buka chat FLEXA Assistant"}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-[0_8px_24px_-6px_rgba(4,52,44,0.5)] transition-all duration-300 hover:scale-105 hover:bg-emerald-700 active:scale-95 pointer-events-auto"
      >
        <Sparkles
          size={22}
          className={`absolute transition-all duration-300 ${isOpen ? "scale-0 opacity-0 rotate-45" : "scale-100 opacity-100 rotate-0"}`}
        />
        <X
          size={22}
          className={`absolute transition-all duration-300 ${isOpen ? "scale-100 opacity-100 rotate-0" : "scale-0 opacity-0 -rotate-45"}`}
        />
        {!hasOpenedOnce && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-lime-400 ring-2 ring-white" />
          </span>
        )}
      </button>
    </div>
  );
}