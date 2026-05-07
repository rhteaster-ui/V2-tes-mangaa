import { NextResponse } from "next/server";

const FAA_YTPLAY_URL = "https://api-faa.my.id/faa/ytplay";
const DEFAULT_QUERY = "Inni uhibbuka";
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Range",
  "Cache-Control": "no-store",
};

function corsJson(body, init = {}) {
  return NextResponse.json(body, { ...init, headers: { ...CORS_HEADERS, ...(init.headers || {}) } });
}

function proxiedAudioUrl(url) {
  if (!url) return "";
  return `/api/music/stream?url=${encodeURIComponent(url)}`;
}

function normalizeTrack(raw) {
  if (!raw || typeof raw !== "object") return null;

  // Support both flat result and nested result.result
  const track = raw.result && typeof raw.result === "object" ? raw.result : raw;

  const mp3 =
    track.mp3 || track.audio || track.audioUrl || track.audio_url ||
    track.play || track.download || track.dl || track.url_mp3 || "";

  if (!mp3 || typeof mp3 !== "string" || !mp3.startsWith("http")) return null;

  const title = track.title || track.name || track.trackName || "Unknown Track";
  const author = track.author || track.artist || track.channel || track.artistName || "Unknown Artist";
  const thumbnail = track.thumbnail || track.thumb || track.image || track.cover || "/favicon.png";
  const duration = Number(track.duration) || 0;

  return {
    title,
    author,
    thumbnail,
    duration,
    duration_timestamp: track.duration_timestamp || track.timestamp || "",
    views: Number(track.views) || 0,
    published: track.published || track.ago || "",
    url: track.url || track.videoUrl || "",
    mp3,
    streamUrl: proxiedAudioUrl(mp3),
    // legacy aliases kept for compatibility
    trackName: title,
    artistName: author,
    artworkUrl100: thumbnail,
    previewUrl: proxiedAudioUrl(mp3),
    originalPreviewUrl: mp3,
    trackTimeMillis: duration * 1000,
  };
}

async function fetchFaaMusic(query, attempt = 1) {
  const url = new URL(FAA_YTPLAY_URL);
  url.searchParams.set("query", query);

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json, text/plain, */*",
        "User-Agent": "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/125 Mobile Safari/537.36",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });

    const text = await res.text();
    if (!res.ok) throw new Error(`Faa API responded ${res.status}: ${text.slice(0, 120)}`);

    try {
      return JSON.parse(text);
    } catch {
      throw new Error("Faa API returned non-JSON response");
    }
  } catch (err) {
    if (attempt < 2) return fetchFaaMusic(query, attempt + 1);
    throw err;
  }
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || DEFAULT_QUERY).trim() || DEFAULT_QUERY;

  try {
    const data = await fetchFaaMusic(q);

    // FAA API returns: { status, creator, result: { title, url, mp3, thumbnail, ... } }
    const track = normalizeTrack(data);
    const results = track ? [track] : [];

    return corsJson({
      status: Boolean(track),
      creator: data?.creator || "Faa",
      query: q,
      result: track,
      results,
      resultCount: results.length,
      message: track ? undefined : "No playable mp3 URL found",
    });
  } catch (e) {
    return corsJson({ status: false, error: e.message, query: q, results: [], resultCount: 0 }, { status: 200 });
  }
}
