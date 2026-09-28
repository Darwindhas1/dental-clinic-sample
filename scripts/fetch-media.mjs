/**
 * fetch-media.mjs — local media pipeline for the dental clinic sample site.
 *
 * Reads API keys from .env (never committed), downloads on-topic photography and
 * illustrations, converts everything to sized WebP inside /assets/img/, and writes
 * /assets/img/credits.json with photographer names + source URLs.
 *
 * Run with:  npm run media
 *
 * The keys live ONLY here. The published site serves local files and never talks
 * to Pexels, Pixabay or Pollinations at runtime.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'img');

/* ------------------------------------------------------------------ env --- */

async function loadEnv() {
  const raw = await fs.readFile(path.join(ROOT, '.env'), 'utf8');
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

const env = await loadEnv();
const PEXELS_KEY = env.PEXELS_API_KEY;
const PIXABAY_KEY = env.PIXABAY_API_KEY;
if (!PEXELS_KEY) throw new Error('PEXELS_API_KEY missing from .env');

/* -------------------------------------------------------------- manifest --- */
/* Each entry: output name, search query, which result to take, output size.   */

const PHOTOS = [
  // hero + key page imagery
  { name: 'hero-smile',      q: 'beautiful smile teeth',        i: 6, w: 1100, h: 1400 },
  { name: 'about-hero',      q: 'modern dental office',         i: 1, w: 1600, h: 860 },
  { name: 'about-story',     q: 'dentist team clinic',          i: 1, w: 960,  h: 800 },
  { name: 'how-it-works',    q: 'dentist patient consultation', i: 0, w: 1000, h: 820 },
  { name: 'cta-band',        q: 'dentist smiling with patient', i: 4, w: 1600, h: 760 },
  { name: 'faq-dentist',     q: 'female dentist smiling',       i: 0, w: 760,  h: 900 },
  { name: 'family-smile',    q: 'happy family smiling',         i: 0, w: 960,  h: 720 },
  { name: 'services-hero',   q: 'dentist smiling with patient', i: 2, w: 1600, h: 860 },
  { name: 'contact-hero',    q: 'dental clinic interior',       i: 3, w: 1600, h: 700 },

  // dentists
  { name: 'dentist-1', q: 'asian female doctor portrait white coat', i: 0, w: 780, h: 900 },
  { name: 'dentist-2', q: 'asian male doctor portrait white coat',   i: 0, w: 780, h: 900 },
  { name: 'dentist-3', q: 'indian woman doctor portrait',            i: 2, w: 780, h: 900 },

  // clinic gallery
  { name: 'gallery-1', q: 'modern dental office',         i: 4, w: 900, h: 700 },
  { name: 'gallery-2', q: 'dentist chair clinic',       i: 0, w: 900, h: 700 },
  { name: 'gallery-3', q: 'dentist smiling with patient', i: 5, w: 900, h: 700 },
  { name: 'gallery-4', q: 'dental x ray',               i: 0, w: 900, h: 700 },
  { name: 'gallery-5', q: 'dentist chair clinic',       i: 2, w: 900, h: 700 },
  { name: 'gallery-6', q: 'dentist smiling with patient', i: 7, w: 900, h: 700 },

  // blog
  { name: 'blog-1', q: 'nervous patient dentist', i: 0, w: 960, h: 640 },
  { name: 'blog-2', q: 'toothbrush toothpaste',   i: 0, w: 960, h: 640 },
  { name: 'blog-3', q: 'braces teeth smile',      i: 0, w: 960, h: 640 },
  { name: 'blog-4', q: 'healthy food fruit',      i: 0, w: 960, h: 640 },
  { name: 'blog-5', q: 'child dentist checkup',   i: 0, w: 960, h: 640 },
  { name: 'blog-6', q: 'coffee cup tea',          i: 0, w: 960, h: 640 },
  { name: 'blog-1-wide', q: 'nervous patient dentist', i: 0, w: 1600, h: 800 },

  // small round avatars for the review / member stacks
  { name: 'avatar-1', q: 'portrait smiling person', i: 0, w: 160, h: 160 },
  { name: 'avatar-2', q: 'portrait smiling person', i: 1, w: 160, h: 160 },
  { name: 'avatar-3', q: 'portrait smiling person', i: 2, w: 160, h: 160 },
  { name: 'avatar-4', q: 'portrait smiling woman',  i: 0, w: 160, h: 160 },
  { name: 'avatar-5', q: 'portrait smiling man',    i: 0, w: 160, h: 160 },
];

/* 3D-style dental illustrations for the service cards. Pixabay first, then a
   Pollinations render described in the same visual language.                  */
/* Service-card illustrations.
 *
 * Neither Pixabay (flat clipart) nor Pollinations (watermarked, inconsistent
 * shapes) produced art good enough for a premium medical card, so the six
 * illustrations shipped with the site are original SVGs in /assets/icons/.
 * The fetch path below is kept for clients who would rather source raster art:
 *   node scripts/fetch-media.mjs --illustrations
 */
const FETCH_ILLUSTRATIONS = process.argv.includes('--illustrations');
const USE_PIXABAY_FOR_ILLUSTRATIONS = true;

const ILLUSTRATIONS = [
  { name: 'ill-checkup',   pixabay: '3d tooth dental',   prompt: 'glossy 3d render of a single clean white tooth next to a small dental mirror, soft studio lighting, pure white background, product render, centered, minimal' },
  { name: 'ill-whitening', pixabay: 'tooth white shine', prompt: 'glossy 3d render of one bright white tooth with a sparkle highlight and a pastel toothbrush, soft studio lighting, pure white background, product render, centered' },
  { name: 'ill-rootcanal', pixabay: 'tooth root',        prompt: 'glossy 3d medical render of a cross section tooth showing the root canal, clean anatomical illustration, soft studio lighting, pure white background, centered' },
  { name: 'ill-gums',      pixabay: 'gum teeth',         prompt: 'glossy 3d medical render of healthy pink gums with white teeth, clean anatomical illustration, soft studio lighting, pure white background, centered' },
  { name: 'ill-implant',   pixabay: 'dental implant',    prompt: 'glossy 3d medical render of a dental implant titanium screw with a white crown, clean anatomical illustration, soft studio lighting, pure white background, centered' },
  { name: 'ill-braces',    pixabay: 'braces teeth',      prompt: 'glossy 3d medical render of white teeth with metal braces on a pink gum arch, clean anatomical illustration, soft studio lighting, pure white background, centered' },
];

/* --------------------------------------------------------------- helpers --- */

const ONLY = (process.argv.find((a) => a.startsWith('--only=')) || '').slice(7)
  .split(',').map((s) => s.trim()).filter(Boolean);
const wanted = (name) => ONLY.length === 0 || ONLY.includes(name);

const credits = [];
const pexelsCache = new Map();

async function getBuffer(url, headers = {}) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return Buffer.from(await res.arrayBuffer());
}

async function pexelsSearch(query) {
  if (pexelsCache.has(query)) return pexelsCache.get(query);
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15`;
  const res = await fetch(url, { headers: { Authorization: PEXELS_KEY } });
  if (!res.ok) throw new Error(`Pexels ${res.status} for "${query}"`);
  const json = await res.json();
  pexelsCache.set(query, json.photos || []);
  return json.photos || [];
}

async function pixabaySearch(query, type) {
  if (!PIXABAY_KEY) return [];
  const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(query)}` +
              `&image_type=${type}&per_page=20&safesearch=true`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const json = await res.json();
  return json.hits || [];
}

async function writePhoto(buf, name, w, h) {
  await sharp(buf)
    .resize(w, h, { fit: 'cover', position: 'attention' })
    .webp({ quality: 80 })
    .toFile(path.join(OUT, `${name}.webp`));

  // Half-scale companion for srcset. Avatars are already tiny.
  if (!name.startsWith('avatar')) {
    await sharp(buf)
      .resize(Math.round(w * 0.56), Math.round(h * 0.56), { fit: 'cover', position: 'attention' })
      .webp({ quality: 74 })
      .toFile(path.join(OUT, `${name}-sm.webp`));
  }
}

/**
 * Knock the flat white studio background out of an illustration so the card's
 * pastel gradient shows through behind it. Conservative threshold: only pixels
 * that are near-white on every channel go fully transparent, with a short
 * feather above it so edges do not alias.
 */
async function writeIllustration(buf, name, size = 620) {
  const base = sharp(buf)
    .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .flatten({ background: { r: 255, g: 255, b: 255 } });

  const { data, info } = await base.raw().ensureAlpha().toBuffer({ resolveWithObject: true });
  const HARD = 247;
  const SOFT = 232;
  for (let p = 0; p < data.length; p += 4) {
    const min = Math.min(data[p], data[p + 1], data[p + 2]);
    if (min >= HARD) {
      data[p + 3] = 0;
    } else if (min >= SOFT) {
      data[p + 3] = Math.round(255 * (1 - (min - SOFT) / (HARD - SOFT)));
    }
  }

  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ threshold: 1 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 88, alphaQuality: 100 })
    .toFile(path.join(OUT, `${name}.webp`));
}

/* ------------------------------------------------------------------ main --- */

await fs.mkdir(OUT, { recursive: true });

console.log(`\nPhotography - Pexels (${PHOTOS.length} files)`);
for (const item of PHOTOS) {
  if (!wanted(item.name)) continue;
  try {
    const photos = await pexelsSearch(item.q);
    const photo = photos[item.i] || photos[0];
    if (!photo) { console.log(`  x ${item.name} - no result for "${item.q}"`); continue; }
    const buf = await getBuffer(photo.src.large2x || photo.src.large);
    await writePhoto(buf, item.name, item.w, item.h);
    credits.push({
      file: `${item.name}.webp`,
      source: 'Pexels',
      photographer: photo.photographer,
      photographer_url: photo.photographer_url,
      url: photo.url,
    });
    console.log(`  ok ${item.name}.webp ${item.w}x${item.h} - ${photo.photographer}`);
  } catch (err) {
    console.log(`  x ${item.name} - ${err.message}`);
  }
}

console.log(`\nIllustrations (${ILLUSTRATIONS.length} files)`);
for (const item of FETCH_ILLUSTRATIONS ? ILLUSTRATIONS : []) {
  if (!wanted(item.name)) continue;
  let done = false;
  for (const type of USE_PIXABAY_FOR_ILLUSTRATIONS ? ['illustration', 'vector'] : []) {
    if (done) break;
    try {
      const hits = await pixabaySearch(item.pixabay, type);
      const hit = hits.find((h) => h.imageWidth >= 500 && h.imageHeight >= 500);
      if (!hit) continue;
      const buf = await getBuffer(hit.largeImageURL);
      await writeIllustration(buf, item.name);
      credits.push({
        file: `${item.name}.webp`,
        source: 'Pixabay',
        photographer: hit.user,
        photographer_url: `https://pixabay.com/users/${hit.user}-${hit.user_id}/`,
        url: hit.pageURL,
      });
      console.log(`  ok ${item.name}.webp - Pixabay ${type} / ${hit.user}`);
      done = true;
    } catch (err) {
      console.log(`     (pixabay ${type} failed for ${item.name}: ${err.message})`);
    }
  }
  if (!done) {
    try {
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(item.prompt)}?width=720&height=720&nologo=true&seed=7`;
      const buf = await getBuffer(url);
      await writeIllustration(buf, item.name);
      credits.push({
        file: `${item.name}.webp`,
        source: 'Pollinations AI',
        photographer: 'AI generated',
        photographer_url: 'https://pollinations.ai',
        url: 'https://pollinations.ai',
      });
      console.log(`  ok ${item.name}.webp - Pollinations AI`);
    } catch (err) {
      console.log(`  x ${item.name} - ${err.message}`);
    }
  }
}

await fs.writeFile(
  path.join(OUT, 'credits.json'),
  JSON.stringify({ generated: new Date().toISOString().slice(0, 10), credits }, null, 2) + '\n'
);

console.log(`\nDone - ${credits.length} files in assets/img/, credits.json written.\n`);
