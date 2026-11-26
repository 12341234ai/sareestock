/**
 * All photo work happens in the browser: resize + compress before upload,
 * then a small local fingerprint (colour histogram + two perceptual hashes)
 * so Photo Search can compare sarees without any AI service.
 */

const MAX_DIMENSION = 1400;
const JPEG_QUALITY = 0.82;
const BINS = 16;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error("This photo could not be read. Please use a JPG, PNG or WebP image."));
    img.src = src;
  });
}

function drawTo(img, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height).data;
}

function hashFrom(pixels, width, height, kind) {
  const gray = [];
  for (let i = 0; i < pixels.length; i += 4) {
    gray.push(0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]);
  }
  const bits = [];
  if (kind === "d") {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width - 1; x++) {
        bits.push(gray[y * width + x] > gray[y * width + x + 1] ? 1 : 0);
      }
    }
  } else {
    const avg = gray.reduce((sum, v) => sum + v, 0) / (gray.length || 1);
    gray.forEach((v) => bits.push(v > avg ? 1 : 0));
  }
  let hex = "";
  for (let i = 0; i < bits.length; i += 4) {
    let nibble = 0;
    for (let j = 0; j < 4; j++) nibble = (nibble << 1) | (bits[i + j] || 0);
    hex += nibble.toString(16);
  }
  return hex;
}

function hexSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let same = 0;
  for (let i = 0; i < a.length; i++) if (a[i] === b[i]) same += 1;
  return same / a.length;
}

export async function compressImage(file) {
  if (!file || !file.type || !file.type.startsWith("image/")) {
    throw new Error("Only image files can be uploaded (JPG, PNG or WebP).");
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    let width = img.naturalWidth || img.width;
    let height = img.naturalHeight || img.height;
    if (!width || !height) throw new Error("This photo looks empty or damaged.");
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const scale = MAX_DIMENSION / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("This photo could not be compressed."))),
        "image/jpeg",
        JPEG_QUALITY,
      );
    });
    return { blob, width, height };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function computeSignature(blob) {
  const url = URL.createObjectURL(blob);
  try {
    const img = await loadImage(url);
    const histPixels = drawTo(img, 64, 64);
    const hist = new Array(BINS * 3).fill(0);
    const total = 64 * 64;
    for (let i = 0; i < histPixels.length; i += 4) {
      hist[Math.min(BINS - 1, Math.floor(histPixels[i] / 16))] += 1;
      hist[BINS + Math.min(BINS - 1, Math.floor(histPixels[i + 1] / 16))] += 1;
      hist[BINS * 2 + Math.min(BINS - 1, Math.floor(histPixels[i + 2] / 16))] += 1;
    }
    for (let i = 0; i < hist.length; i++) hist[i] = hist[i] / total;
    const dhash = hashFrom(drawTo(img, 9, 8), 9, 8, "d");
    const ahash = hashFrom(drawTo(img, 8, 8), 8, 8, "a");
    return { hist, dhash, ahash };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** 0–99 estimate. Colour carries the most weight, then structure. */
export function signatureSimilarity(a, b) {
  if (!a || !b || !Array.isArray(a.hist) || !Array.isArray(b.hist)) return 0;
  const length = Math.min(a.hist.length, b.hist.length);
  let intersection = 0;
  for (let i = 0; i < length; i++) intersection += Math.min(a.hist[i] || 0, b.hist[i] || 0);
  const histScore = Math.min(1, intersection / 3);
  const diffScore = hexSimilarity(a.dhash, b.dhash);
  const avgScore = hexSimilarity(a.ahash, b.ahash);
  const score = 0.55 * histScore + 0.2 * diffScore + 0.25 * avgScore;
  return Math.max(0, Math.min(99, Math.round(score * 100)));
}

export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the image data."));
    reader.readAsDataURL(blob);
  });
}

export function dataUrlToFile(dataUrl, name) {
  const parts = String(dataUrl).split(",");
  if (parts.length < 2) throw new Error("The image data in this backup is damaged.");
  const mime = /:(.*?);/.exec(parts[0])?.[1] || "image/jpeg";
  const binary = atob(parts[1]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], name, { type: mime });
}