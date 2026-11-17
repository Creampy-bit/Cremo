'use strict';
// Cremo: extra music sources, all free and open with no API key:
//   - Internet radio from Radio Browser (radio-browser.info)
//   - Independent music from Audius (audius.co)
//   - Podcasts: Apple's catalogue to find shows, the show's own RSS feed for episodes
// Tracks from here carry ids like "cr-radio:<uuid>", so /api/stream-info plays
// their URL directly instead of looking the song up on YouTube.

const crypto = require('crypto');

const VERSION = (() => { try { return require('../../package.json').version; } catch (_) { return '0'; } })();
const UA = 'Cremo/' + VERSION;
const APP_NAME = 'Cremo';
const AUDIUS = 'https://api.audius.co/v1';
const RB_HOSTS = ['de1', 'de2', 'fi1', 'nl1'].map((h) => `https://${h}.api.radio-browser.info`);
const LIST_TTL = 10 * 60 * 1000;
const FEED_TTL = 30 * 60 * 1000;
const ID_RE = /^cr-(radio|pod|audius):/;

const cache = new Map();
async function cached(key, ttl, fn) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttl) return hit.data;
  const data = await fn();
  cache.set(key, { at: Date.now(), data });
  if (cache.size > 300) cache.delete(cache.keys().next().value);
  return data;
}

async function get(url, as = 'json', ms = 12000) {
  const r = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: as === 'json' ? 'application/json' : '*/*' },
    redirect: 'follow',
    signal: AbortSignal.timeout(ms)
  });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return as === 'json' ? r.json() : r.text();
}

function countryCode() {
  try {
    const { app } = require('electron');
    const c = app && typeof app.getLocaleCountryCode === 'function' ? app.getLocaleCountryCode() : '';
    if (/^[A-Z]{2}$/.test(c || '')) return c;
  } catch (_) {}
  return '';
}

const httpUrl = (u) => (typeof u === 'string' && /^https?:\/\//i.test(u.trim()) ? u.trim() : '');

/* ---------------- Radio ---------------- */

let rbHost = 0;
async function rb(pathAndQuery) {
  let lastErr;
  for (let i = 0; i < RB_HOSTS.length; i++) {
    const idx = (rbHost + i) % RB_HOSTS.length;
    try {
      const data = await get(RB_HOSTS[idx] + pathAndQuery);
      rbHost = idx;
      return data;
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('Radio Browser unreachable');
}

function stationTrack(s) {
  const url = httpUrl(s.url_resolved) || httpUrl(s.url);
  if (!url || !s.stationuuid || !s.name) return null;
  const tags = String(s.tags || '').split(',').map((t) => t.trim()).filter(Boolean).slice(0, 2);
  return {
    id: 'cr-radio:' + s.stationuuid,
    title: String(s.name).trim(),
    artist: [s.country, ...tags].filter(Boolean).join(' · ') || 'Radio',
    thumbnail: httpUrl(s.favicon),
    url,
    platform: 'radio',
    duration: 0,
    isLive: true,
    codec: s.codec || '',
    bitrate: s.bitrate || 0
  };
}

async function radio({ q = '', tag = '', country = '', limit = 30 }) {
  const p = new URLSearchParams({ hidebroken: 'true', order: 'clickcount', reverse: 'true', limit: String(Math.min(60, limit * 2)) });
  if (q) p.set('name', q);
  if (tag) p.set('tag', tag);
  if (country) p.set('countrycode', country);
  const key = 'radio:' + p.toString();
  return cached(key, LIST_TTL, async () => {
    const list = await rb('/json/stations/search?' + p.toString());
    const seen = new Set();
    const out = [];
    for (const s of Array.isArray(list) ? list : []) {
      const t = stationTrack(s);
      if (!t) continue;
      const k = t.title.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(t);
      if (out.length >= limit) break;
    }
    return out;
  });
}

// Radio Browser counts listens to rank stations; tell it when one is played.
function countRadioClick(uuid) {
  if (!/^[0-9a-f-]{36}$/i.test(uuid)) return;
  rb('/json/url/' + uuid).catch(() => {});
}

/* ---------------- Audius ---------------- */

function audiusTrack(t) {
  if (!t || !t.id || !t.title) return null;
  if (t.is_streamable === false || t.is_delete || t.is_stream_gated) return null;
  const art = t.artwork || {};
  return {
    id: 'cr-audius:' + t.id,
    title: String(t.title).trim(),
    artist: (t.user && t.user.name) || 'Audius',
    thumbnail: httpUrl(art['480x480']) || httpUrl(art['1000x1000']) || httpUrl(art['150x150']),
    url: `${AUDIUS}/tracks/${encodeURIComponent(t.id)}/stream?app_name=${APP_NAME}`,
    platform: 'audius',
    duration: Number(t.duration) || 0,
    genre: t.genre || ''
  };
}

async function audius({ q = '', limit = 24 }) {
  const url = q
    ? `${AUDIUS}/tracks/search?query=${encodeURIComponent(q)}&app_name=${APP_NAME}`
    : `${AUDIUS}/tracks/trending?time=week&app_name=${APP_NAME}`;
  return cached('audius:' + url, LIST_TTL, async () => {
    const data = await get(url);
    return (data && Array.isArray(data.data) ? data.data : []).map(audiusTrack).filter(Boolean).slice(0, limit);
  });
}

/* ---------------- Podcasts ---------------- */

const big = (u) => httpUrl(u).replace(/\/\d+x\d+(bb)?\.(jpg|png|webp)$/i, '/600x600bb.$2');

async function podcasts({ q = '', limit = 24 }) {
  const cc = (countryCode() || 'US').toLowerCase();
  if (q) {
    const url = `https://itunes.apple.com/search?media=podcast&entity=podcast&limit=${limit}&country=${cc}&term=${encodeURIComponent(q)}`;
    return cached('pods:' + url, LIST_TTL, async () => {
      const data = await get(url);
      return (data.results || []).filter((r) => r.feedUrl).map((r) => ({
        id: String(r.collectionId),
        title: r.collectionName || r.trackName || '',
        author: r.artistName || '',
        cover: big(r.artworkUrl600 || r.artworkUrl100),
        feed: r.feedUrl
      }));
    });
  }
  const url = `https://rss.applemarketingtools.com/api/v2/${cc}/podcasts/top/${limit}/podcasts.json`;
  return cached('pods:' + url, LIST_TTL, async () => {
    const data = await get(url);
    const results = (data && data.feed && data.feed.results) || [];
    return results.map((r) => ({ id: String(r.id), title: r.name || '', author: r.artistName || '', cover: big(r.artworkUrl100), feed: '' }));
  });
}

function xmlText(s) {
  if (s == null) return '';
  return String(s)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}
const tag = (xml, name) => { const m = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i')); return m ? m[1] : ''; };
const attr = (xml, name, a) => { const m = xml.match(new RegExp(`<${name}\\s[^>]*?${a}\\s*=\\s*["']([^"']+)["']`, 'i')); return m ? xmlText(m[1]) : ''; };

function parseDuration(v) {
  const s = String(v || '').trim();
  if (!s) return 0;
  if (/^\d+$/.test(s)) return Number(s);
  return s.split(':').reverse().reduce((acc, part, i) => acc + (Number(part) || 0) * Math.pow(60, i), 0);
}

async function lookupFeed(id) {
  if (!/^\d+$/.test(id || '')) return '';
  const data = await get(`https://itunes.apple.com/lookup?id=${id}&entity=podcast`);
  const r = (data.results || []).find((x) => x.feedUrl);
  return r ? r.feedUrl : '';
}

async function episodes({ id = '', feed = '' }) {
  const feedUrl = httpUrl(feed) || await lookupFeed(id);
  if (!feedUrl) throw new Error('No feed for this podcast');
  return cached('feed:' + feedUrl, FEED_TTL, async () => {
    let xml = await get(feedUrl, 'text', 20000);
    if (xml.length > 8 * 1024 * 1024) xml = xml.slice(0, 8 * 1024 * 1024);
    const head = xml.split(/<item[\s>]/i)[0];
    const show = {
      title: xmlText(tag(head, 'title')),
      author: xmlText(tag(head, 'itunes:author')),
      cover: attr(head, 'itunes:image', 'href') || xmlText(tag(tag(head, 'image'), 'url')),
      description: xmlText(tag(head, 'description')).slice(0, 400)
    };
    const items = [];
    const re = /<item[\s>][\s\S]*?<\/item>/gi;
    let m;
    while ((m = re.exec(xml)) && items.length < 150) {
      const it = m[0];
      const url = httpUrl(attr(it, 'enclosure', 'url'));
      const type = attr(it, 'enclosure', 'type');
      if (!url || (type && !/^audio\//i.test(type))) continue;
      const guid = xmlText(tag(it, 'guid')) || url;
      const pub = Date.parse(xmlText(tag(it, 'pubDate')));
      items.push({
        id: 'cr-pod:' + crypto.createHash('sha1').update(feedUrl + '\u0000' + guid).digest('hex').slice(0, 20),
        title: xmlText(tag(it, 'title')) || 'Episodio',
        artist: show.title,
        album: show.title,
        thumbnail: httpUrl(attr(it, 'itunes:image', 'href')) || httpUrl(show.cover),
        url,
        platform: 'podcast',
        duration: parseDuration(xmlText(tag(it, 'itunes:duration'))),
        publishedAt: Number.isFinite(pub) ? pub : 0,
        description: xmlText(tag(it, 'description') || tag(it, 'itunes:summary')).slice(0, 300)
      });
    }
    return { show: { ...show, feed: feedUrl }, episodes: items };
  });
}

/* ---------------- HTTP glue ---------------- */

function send(res, code, body) {
  res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(body));
}

const ROUTES = {
  '/api/cremo-radio': (q) => radio({ q: q.q || '', tag: q.tag || '', country: q.country === 'local' ? countryCode() : (q.country || ''), limit: Number(q.limit) || 30 }),
  '/api/cremo-audius': (q) => audius({ q: q.q || '', limit: Number(q.limit) || 24 }),
  '/api/cremo-podcasts': (q) => podcasts({ q: q.q || '', limit: Number(q.limit) || 24 }),
  '/api/cremo-podcast-episodes': (q) => episodes({ id: q.id || '', feed: q.feed || '' })
};
const PATHS = Object.keys(ROUTES);

// Returns true when it answered the request.
async function handle(pathname, query, res) {
  const fn = ROUTES[pathname];
  if (!fn) return false;
  try {
    send(res, 200, { success: true, country: countryCode(), items: await fn(query || {}) });
  } catch (e) {
    send(res, 200, { success: false, error: String((e && e.message) || e), items: [] });
  }
  return true;
}

const isCremoId = (id) => ID_RE.test(String(id || ''));

// Answers /api/stream-info for Cremo tracks: the URL is already playable; it only
// goes through the local audio proxy so the equalizer and visualizer can read it.
function streamInfo(res, trackId, trackUrl, port) {
  const url = httpUrl(trackUrl);
  if (!url) return send(res, 200, { success: false, error: 'Missing stream URL' });
  const kind = ID_RE.exec(trackId)[1];
  if (kind === 'radio') countRadioClick(String(trackId).slice('cr-radio:'.length));
  const isHls = /\.m3u8(\?|$)/i.test(url);
  const proxied = `http://127.0.0.1:${port}/api/audio-proxy?cremo=1&url=${encodeURIComponent(url)}`;
  send(res, 200, { success: true, isLocal: false, isHls, streamUrl: isHls ? url : proxied, rawStreamUrl: url, proxyUrl: proxied });
}

module.exports = { handle, streamInfo, isCremoId, PATHS, _test: { xmlText, parseDuration, stationTrack, audiusTrack } };
