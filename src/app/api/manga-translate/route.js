/**
 * Manga Translator API — wraps manga-translator.ai
 * Based on manga-translator.js script
 * Accepts: POST { imageUrl: string }
 * Returns: { success, translatedUrl, error? }
 */

const COMMON_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:150.0) Gecko/20100101 Firefox/150.0",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "Origin": "https://manga-translator.ai",
  "Referer": "https://manga-translator.ai/",
  "fp": "6e9a38cb67afccae784c68be21a8a387",
  "theme-version": "83EmcUoQTUv50LhNx0VrdcK8rcGexcP35FcZDcpgWsAXEyO4xqL5shCY6sFIWB2Q",
};

const UPLOAD_HEADERS = {
  ...COMMON_HEADERS,
  "fp1": "bFyIcq46yCju92avXHeOyA/RcuZH+3xcCTVRwdr34+5Iv6Zrdumo5c0BU7HK2cvM",
};

const TRANSLATE_HEADERS = {
  ...COMMON_HEADERS,
  "Content-Type": "application/json",
  "fp1": "Kt6LRBkBrtgZV5ReQJOyBs2DmPMmj1qaMSK0O46ru93rarSN/oa/bnE2OtTgaJcM",
  "x-guide": "sIABglDxcNCj5jW/k09n79D+Kv6UKB+Gz5km5Zg+OHmsxCV7WwYrsFDaPskrs4XTor6t64mr8IisbSvaikJoxroE3dtM6ZnukoiYMRq0raDX+J57I2/LVftlKvxpzoPPX6hcP5HlEQssGYXYtuhRCs8ayJnlv75Wkg9CRxb2SjM=",
};

async function uploadImageFromUrl(imageUrl) {
  // Fetch the source image first (via our proxy to avoid CORS)
  const proxyUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/proxy/page?url=${encodeURIComponent(imageUrl)}`;
  const imgRes = await fetch(proxyUrl);
  if (!imgRes.ok) throw new Error(`Failed to fetch image: ${imgRes.status}`);

  const imageBuffer = await imgRes.arrayBuffer();
  const contentType = imgRes.headers.get("content-type") || "image/jpeg";
  const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";

  // Build multipart form
  const boundary = `----FormBoundary${Date.now().toString(16)}`;
  const filename = `page.${ext}`;

  const preamble = [
    `--${boundary}`,
    `Content-Disposition: form-data; name="file"; filename="${filename}"`,
    `Content-Type: ${contentType}`,
    "",
    "",
  ].join("\r\n");

  const middle = [
    "",
    `--${boundary}`,
    `Content-Disposition: form-data; name="fn_name"`,
    "",
    "demo-image-translator",
    `--${boundary}`,
    `Content-Disposition: form-data; name="request_from"`,
    "",
    "22",
    `--${boundary}`,
    `Content-Disposition: form-data; name="origin_from"`,
    "",
    "1a98cd9363f93dca",
    `--${boundary}--`,
  ].join("\r\n");

  const preambleBytes = new TextEncoder().encode(preamble);
  const middleBytes = new TextEncoder().encode(middle);
  const imageBytes = new Uint8Array(imageBuffer);

  const body = new Uint8Array(preambleBytes.length + imageBytes.length + middleBytes.length);
  body.set(preambleBytes, 0);
  body.set(imageBytes, preambleBytes.length);
  body.set(middleBytes, preambleBytes.length + imageBytes.length);

  const res = await fetch("https://api.manga-translator.ai/aitools/upload-img", {
    method: "POST",
    headers: {
      ...UPLOAD_HEADERS,
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      "X-code": Date.now().toString(),
    },
    body: body.buffer,
  });

  const data = await res.json();
  if (!data?.data?.path) throw new Error("Upload failed: " + JSON.stringify(data));
  return data.data.path;
}

async function createTranslation(imagePath, index = 0) {
  const payload = {
    target_lang: "id",
    request_from: 22,
    image: imagePath,
    index: index,
    origin_from: "1a98cd9363f93dca",
  };

  const res = await fetch("https://api.manga-translator.ai/aitools/img-tr/create", {
    method: "POST",
    headers: { ...TRANSLATE_HEADERS, "X-code": Date.now().toString() },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!data?.data?.result) throw new Error("Translation failed: " + JSON.stringify(data));
  return data.data.result;
}

export async function POST(request) {
  try {
    const { imageUrl, index = 0 } = await request.json();
    if (!imageUrl) {
      return Response.json({ success: false, error: "imageUrl required" }, { status: 400 });
    }

    const uploadedPath = await uploadImageFromUrl(imageUrl);
    const resultPath = await createTranslation(uploadedPath, index);
    const translatedUrl = `https://temp.manga-translator.ai/${resultPath}`;

    return Response.json({ success: true, translatedUrl });
  } catch (err) {
    console.error("[manga-translate]", err.message);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
