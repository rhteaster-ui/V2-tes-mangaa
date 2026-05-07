"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

export default function HeroSlider({ heroes = [] }) {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);

  const goTo = useCallback(
    (idx) => {
      setFade(false);
      setTimeout(() => {
        setCurrent(idx);
        setFade(true);
      }, 220);
    },
    []
  );

  useEffect(() => {
    if (heroes.length <= 1) return;
    const timer = setInterval(() => {
      goTo((current + 1) % heroes.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [current, heroes.length, goTo]);

  if (!heroes.length) return null;

  const hero = heroes[current];
  const heroTitle =
    hero?.attributes?.title?.en ||
    hero?.attributes?.title?.["ja-ro"] ||
    Object.values(hero?.attributes?.title || {})[0] ||
    "";
  const heroCoverRel = hero?.relationships?.find((r) => r.type === "cover_art");
  const heroCoverFileName = heroCoverRel?.attributes?.fileName;
  const heroCoverOriginal = heroCoverFileName
    ? `https://uploads.mangadex.org/covers/${hero.id}/${heroCoverFileName}.512.jpg`
    : null;
  const heroCover = heroCoverOriginal
    ? `/api/proxy/cover?url=${encodeURIComponent(heroCoverOriginal)}`
    : null;
  const heroDesc =
    hero?.attributes?.description?.en ||
    Object.values(hero?.attributes?.description || {})[0] ||
    "";

  return (
    <div className="relative w-full overflow-hidden" style={{ height: "340px" }}>
      {/* Background */}
      {heroCover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={heroCover}
          alt=""
          key={hero.id + "-bg"}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            filter: "blur(3px) brightness(0.3)",
            transform: "scale(1.08)",
            transition: "opacity 0.4s ease",
            opacity: fade ? 1 : 0,
          }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to top, #080a0f 25%, transparent 70%)" }}
      />

      {/* Content */}
      <div
        className="relative z-10 flex items-end h-full px-5 pb-7 max-w-2xl mx-auto gap-4"
        style={{ transition: "opacity 0.4s ease", opacity: fade ? 1 : 0 }}
      >
        {heroCover && (
          <Link href={`/manga/${hero.id}`} className="flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroCover}
              alt={heroTitle}
              className="w-24 rounded-xl shadow-2xl"
              style={{
                border: "2px solid rgba(245,158,11,0.5)",
                aspectRatio: "2/3",
                objectFit: "cover",
                boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              }}
            />
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <span
            className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-2"
            style={{ background: "rgba(245,158,11,0.85)", color: "white" }}
          >
            Top Rated #{current + 1}
          </span>
          <h1 className="text-xl font-bold text-white mb-1.5 line-clamp-2 leading-tight">
            {heroTitle}
          </h1>
          <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">{heroDesc}</p>
          <Link
            href={`/manga/${hero.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl text-white active:scale-95 transition-all"
            style={{ background: "linear-gradient(135deg,#f59e0b,#ef4444)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            Baca Sekarang
          </Link>
        </div>
      </div>

      {/* Dots indicator */}
      {heroes.length > 1 && (
        <div className="absolute bottom-3 right-5 flex gap-1.5 z-20">
          {heroes.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="rounded-full transition-all"
              style={{
                width: i === current ? "20px" : "6px",
                height: "6px",
                background: i === current ? "#f59e0b" : "rgba(255,255,255,0.3)",
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
