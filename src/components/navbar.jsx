"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const LANGUAGES = [
  { code: "id", name: "🇮🇩 Bahasa Indonesia" },
  { code: "en", name: "🇬🇧 English" },
  { code: "ja", name: "🇯🇵 日本語" },
  { code: "zh-CN", name: "🇨🇳 简体中文" },
  { code: "zh-TW", name: "🇹🇼 繁體中文" },
  { code: "ko", name: "🇰🇷 한국어" },
  { code: "es", name: "🇪🇸 Español" },
  { code: "fr", name: "🇫🇷 Français" },
  { code: "de", name: "🇩🇪 Deutsch" },
  { code: "ru", name: "🇷🇺 Русский" },
  { code: "ar", name: "🇸🇦 العربية" },
  { code: "th", name: "🇹🇭 ไทย" },
  { code: "vi", name: "🇻🇳 Tiếng Việt" },
];

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [translateOpen, setTranslateOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("id");
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const router = useRouter();
  const inputRef = useRef(null);
  const translateRef = useRef(null);

  useEffect(() => {
    if (searchOpen && inputRef.current) inputRef.current.focus();
  }, [searchOpen]);

  // Init Google Translate
  useEffect(() => {
    window.googleTranslateElementInit = () => {
      try {
        new window.google.translate.TranslateElement(
          { pageLanguage: "auto", layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE, autoDisplay: false },
          "google_translate_element"
        );
      } catch (e) { /* silent */ }
    };
    if (!document.querySelector("#google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  // Close translate dropdown when clicking outside
  useEffect(() => {
    function handleOutside(e) {
      if (translateRef.current && !translateRef.current.contains(e.target)) {
        setTranslateOpen(false);
        setShowLangDropdown(false);
      }
    }
    if (translateOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [translateOpen]);

  function handleSearch(e) {
    e.preventDefault();
    if (!searchVal.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchVal.trim())}`);
    setSearchVal("");
    setSearchOpen(false);
  }

  function handleLanguageSelect(langCode) {
    setSelectedLang(langCode);
    setShowLangDropdown(false);
    const select = document.querySelector(".goog-te-combo");
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event("change"));
    }
  }

  const currentLangName = LANGUAGES.find((l) => l.code === selectedLang)?.name || "🇮🇩 Indonesia";

  return (
    <>
      <header
        className="sticky top-0 z-[100]"
        style={{ background: "rgba(8,10,15,0.95)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-5xl mx-auto flex items-center gap-3 px-4 py-2.5" style={{ height: "56px" }}>
          {/* Brand */}
          <Link href="/" className="flex items-center gap-1 flex-shrink-0 mr-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#000", padding: "2px" }}>
              <img src="/icon.png" alt="MangaRift" className="w-full h-full object-contain rounded-md" />
            </div>
            <span
              className="text-[17px] font-bold tracking-tight"
              style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              angarift
            </span>
          </Link>

          <div className="flex-1" />

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1 mr-2">
            {[
              { href: "/", label: "Home" },
              { href: "/search", label: "Jelajah" },
              { href: "/library", label: "Library" },
              { href: "/about", label: "About" },
            ].map(({ href, label }) => (
              <Link key={href} href={href} className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">
                {label}
              </Link>
            ))}
          </nav>

          {/* Right buttons: Translate + Search */}
          <div className="flex items-center gap-1.5">
            {/* ── TRANSLATE BUTTON ── */}
            <div ref={translateRef} className="relative">
              <button
                onClick={() => { setTranslateOpen((v) => !v); setShowLangDropdown(false); }}
                className="w-9 h-9 flex items-center justify-center rounded-xl transition-all flex-shrink-0"
                style={{
                  background: translateOpen ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.05)",
                  border: translateOpen ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.07)",
                }}
                aria-label="Terjemahkan halaman"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={translateOpen ? "#818cf8" : "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </button>

              {translateOpen && (
                <div
                  className="absolute right-0 top-full mt-2 rounded-2xl overflow-hidden"
                  style={{
                    width: "260px",
                    background: "#12141c",
                    border: "1px solid rgba(99,102,241,0.3)",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.7)",
                    zIndex: 9999,
                  }}
                >
                  <div style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", padding: "12px 14px" }}>
                    <p className="text-white text-xs font-bold">🌐 Terjemahkan Halaman</p>
                    <p className="text-indigo-200 text-[10px] mt-0.5">Pilih bahasa untuk seluruh teks</p>
                  </div>

                  <div className="p-3">
                    {/* Language selector */}
                    <div className="relative">
                      <button
                        onClick={() => setShowLangDropdown((v) => !v)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-medium text-white"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(99,102,241,0.3)" }}
                      >
                        <span>{currentLangName}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" style={{ transform: showLangDropdown ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </button>

                      {showLangDropdown && (
                        <div
                          className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-y-auto"
                          style={{ background: "#1a1d2e", border: "1px solid rgba(99,102,241,0.25)", maxHeight: "200px", zIndex: 10000, boxShadow: "0 8px 24px rgba(0,0,0,0.6)" }}
                        >
                          {LANGUAGES.map((lang) => (
                            <button
                              key={lang.code}
                              onClick={() => handleLanguageSelect(lang.code)}
                              className="w-full text-left px-3 py-2.5 text-xs transition-colors"
                              style={{
                                color: selectedLang === lang.code ? "#818cf8" : "#d1d5db",
                                background: selectedLang === lang.code ? "rgba(99,102,241,0.15)" : "transparent",
                                borderBottom: "1px solid rgba(255,255,255,0.04)",
                              }}
                            >
                              {lang.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <p className="text-[10px] text-gray-500 mt-2 text-center">Powered by Google Translate</p>
                  </div>
                </div>
              )}
            </div>

            {/* ── SEARCH ── */}
            {searchOpen && (
              <form onSubmit={handleSearch} className="flex items-center gap-1.5">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  <input
                    ref={inputRef}
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    placeholder="Cari manga..."
                    className="text-sm text-gray-200 placeholder-gray-600 pl-9 pr-3 py-2 rounded-xl outline-none w-[180px] md:w-[240px] transition-all"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(245,158,11,0.35)" }}
                  />
                </div>
              </form>
            )}

            <button
              onClick={() => {
                if (searchOpen && searchVal.trim()) {
                  router.push(`/search?q=${encodeURIComponent(searchVal.trim())}`);
                  setSearchVal("");
                  setSearchOpen(false);
                } else {
                  setSearchOpen((v) => !v);
                  if (searchOpen) setSearchVal("");
                }
              }}
              className="w-9 h-9 flex items-center justify-center rounded-xl transition-all flex-shrink-0"
              style={{
                background: searchOpen ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.05)",
                border: searchOpen ? "1px solid rgba(245,158,11,0.35)" : "1px solid rgba(255,255,255,0.07)",
              }}
              aria-label={searchOpen ? "Cari" : "Buka pencarian"}
            >
              {searchOpen ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"><path d="M21 21l-4.35-4.35"/><circle cx="11" cy="11" r="8"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              )}
            </button>

            {searchOpen && (
              <button
                onClick={() => { setSearchOpen(false); setSearchVal(""); }}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-white transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hidden Google Translate element */}
      <div id="google_translate_element" style={{ display: "none" }} />

      <style jsx global>{`
        .goog-te-banner-frame.skiptranslate { display: none !important; }
        body { top: 0px !important; }
        .goog-te-gadget-simple { background-color: transparent !important; border: none !important; padding: 0 !important; display: none !important; }
        .goog-te-combo { display: none !important; }
        .goog-te-gadget span { display: none !important; }
        .goog-te-gadget { color: transparent !important; font-size: 0 !important; }
      `}</style>
    </>
  );
}
