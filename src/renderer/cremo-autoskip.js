/* ---------- Saltos automáticos: SponsorBlock y silencios ----------
   - SponsorBlock: in YouTube videos, skips the parts other people marked as
     not music (talking intros/outros, sponsors, "subscribe" bits). Asks by a
     4-character hash prefix, so the server never learns which video plays.
   - Silences: the server scans the track with ffmpeg; we skip the silence at
     the start and end of a song and gaps of 8 s or more in the middle.
   A part is not skipped if the user seeks into it on purpose.
   Uses cremoLS / cremoEsc from cremo.js (loaded before this file). */
(function cremoAutoSkip() {
  'use strict';
  const ES = (localStorage.getItem('cremo_ui_lang') || 'en') === 'es';
  const t = (es, en) => (ES ? es : en);
  const KEY_SB = 'cremo_sponsorblock';
  const KEY_SIL = 'cremo_skip_silence';
  const KEY_CACHE = 'cremo_silence_cache';
  const isOn = (k) => cremoLS.get(k, '1') !== '0';
  const SB_API = 'https://sponsor.ajay.app/api/skipSegments/';
  const SB_QUERY = '?categories=' + encodeURIComponent(JSON.stringify(['music_offtopic', 'sponsor', 'selfpromo', 'interaction'])) +
    '&actionTypes=' + encodeURIComponent('["skip"]');
  const YT_ID = /^[a-zA-Z0-9_-]{11}$/;
  const YT_PLATFORMS = ['yt', 'youtube', 'ytmusic'];
  const MAX_SCAN = 20 * 60;

  const audio = () => document.getElementById('native-audio');
  const st = () => window.state || {};

  let cur = null;        // { key, sb: [], sil: [], full, fullAsked, ending }
  let selfSeek = false;  // our own seeks must not count as the user's
  const sbCache = new Map();

  const keyOf = (tr) => [tr.resolvedYtId || tr.id || '', tr.title || '', tr.artist || ''].join('|');
  const range = (s, e, kind, vd) => ({ s, e, kind, vd: vd || 0, ignored: false });

  function videoIdOf(tr) {
    if (YT_ID.test(String(tr.resolvedYtId || ''))) return tr.resolvedYtId;
    const platform = tr.platform || st().platform || 'ytmusic';
    if (YT_PLATFORMS.indexOf(platform) < 0 || /soundcloud\.com/i.test(tr.url || '')) return '';
    const id = String(tr.id || tr.videoId || '');
    if (YT_ID.test(id)) return id;
    const m = String(tr.url || '').match(/(?:v=|youtu\.be\/|\/shorts\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : '';
  }

  function silenceCache() {
    try { return JSON.parse(cremoLS.get(KEY_CACHE, '{}')) || {}; } catch (_) { return {}; }
  }
  function rememberSilence(key, list) {
    const all = silenceCache();
    delete all[key];
    all[key] = list;
    const keys = Object.keys(all);
    for (let i = 0; i < keys.length - 500; i++) delete all[keys[i]];
    cremoLS.set(KEY_CACHE, JSON.stringify(all));
  }

  async function sponsorSegments(videoId) {
    if (sbCache.has(videoId)) return sbCache.get(videoId);
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(videoId));
    const prefix = Array.from(new Uint8Array(buf).slice(0, 2), (b) => b.toString(16).padStart(2, '0')).join('');
    const r = await fetch(SB_API + prefix + SB_QUERY, { signal: AbortSignal.timeout(8000) });
    let segs = [];
    if (r.ok) {
      const hit = ((await r.json()) || []).find((v) => v && v.videoID === videoId);
      segs = ((hit && hit.segments) || [])
        .filter((g) => Array.isArray(g.segment) && g.segment[1] - g.segment[0] >= 1)
        .map((g) => ({ s: g.segment[0], e: g.segment[1], vd: g.videoDuration || 0 }));
    } else if (r.status !== 404) {
      throw new Error('SponsorBlock HTTP ' + r.status);
    }
    sbCache.set(videoId, segs);
    return segs;
  }

  async function silenceRanges(tr, a, head) {
    const port = st().serverPort;
    const src = a.currentSrc || a.src || '';
    if (!port || !src) return null;
    const id = tr._cachedId || tr.resolvedYtId || tr.id || '';
    const u = 'http://127.0.0.1:' + port + '/api/silence-scan?id=' + encodeURIComponent(id) +
      '&src=' + encodeURIComponent(src) + (head ? '&head=1' : '');
    const d = await fetch(u).then((x) => x.json());
    return d && d.success && Array.isArray(d.skip) ? d.skip : null;
  }

  // A new file finished loading: work out what to skip in it.
  function onLoaded() {
    const a = audio();
    const tr = st().currentTrack;
    if (!a || !tr) return;
    const key = keyOf(tr);
    if (cur && cur.key === key) { cur.ending = false; return; } // same song again (repeat, stream recovery)
    const live = !isFinite(a.duration) || a.duration <= 0;
    const skippable = !live && !/^cr-/.test(String(tr.id || '')) && a.duration <= MAX_SCAN;
    const c = { key, sb: [], sil: [], full: false, fullAsked: !skippable, ending: false };
    cur = c;
    if (!skippable) return;
    const known = silenceCache()[key];
    if (known) { c.sil = known.map(([s, e]) => range(s, e, 'sil')); c.full = c.fullAsked = true; }
    const vid = isOn(KEY_SB) ? videoIdOf(tr) : '';
    if (vid) {
      sponsorSegments(vid).then((segs) => {
        if (cur === c) c.sb = segs.map((g) => range(g.s, g.e, 'sb', g.vd));
      }).catch(() => {});
    }
    if (isOn(KEY_SIL) && !c.full) {
      silenceRanges(tr, a, true).then((list) => {
        if (cur === c && list && !c.full) c.sil = list.map(([s, e]) => range(s, e, 'sil'));
      }).catch(() => {});
    }
  }

  // The whole-track scan waits until the song has played a little, so songs
  // skipped right away cost nothing and the cached copy is usually ready.
  function maybeFullScan(time, dur) {
    const c = cur;
    if (!c || c.fullAsked || !isOn(KEY_SIL) || time < Math.min(20, dur * 0.3)) return;
    c.fullAsked = true;
    const tr = st().currentTrack;
    const a = audio();
    if (!tr || !a) return;
    silenceRanges(tr, a, false).then((list) => {
      if (!list) { c.fullAsked = false; return; }
      rememberSilence(c.key, list);
      if (cur === c) { c.sil = list.map(([s, e]) => range(s, e, 'sil')); c.full = true; }
    }).catch(() => { c.fullAsked = false; });
  }

  function jump(r, a, state, dur) {
    if (r.kind === 'sb' && window.showToast) {
      window.showToast(t('Saltada una parte sin música (SponsorBlock)', 'Skipped a non-music part (SponsorBlock)'), 'info');
    }
    if (r.e < dur - 0.5) { selfSeek = true; a.currentTime = r.e; return; }
    // The rest of the song is silence or non-music: end it like a natural ending.
    cur.ending = true;
    if (state.sleepTimer && state.sleepTimer.mode === 'end') { selfSeek = true; a.currentTime = Math.max(0, dur - 0.05); return; }
    if (state.isRepeat) { selfSeek = true; a.currentTime = 0; cur.ending = false; return; }
    if (typeof window.playNext !== 'function') return;
    state._isNaturalEnding = true;
    try { window.playNext(); } finally { state._isNaturalEnding = false; }
  }

  function onTime() {
    const a = audio();
    const state = st();
    if (!a || !cur || cur.ending || a.seeking || state.isLoadingTrack || !state.isPlaying) return;
    const dur = a.duration;
    if (!isFinite(dur) || dur <= 0) return;
    const time = a.currentTime;
    maybeFullScan(time, dur);
    const list = (isOn(KEY_SB) ? cur.sb : []).concat(isOn(KEY_SIL) ? cur.sil : []);
    for (const r of list) {
      if (r.ignored || time < r.s || time >= r.e - 0.3) continue;
      if (r.vd && Math.abs(r.vd - dur) > 2.5) continue; // another upload or audio: the times would not match
      jump(r, a, state, dur);
      return;
    }
  }

  // 'seeking', not 'seeked': the browser fires timeupdate at the new position
  // before 'seeked', and that timeupdate must already know it was the user.
  function onSeeking() {
    if (selfSeek) { selfSeek = false; return; }
    const a = audio();
    if (!a || !cur) return;
    const p = a.currentTime;
    cur.sb.concat(cur.sil).forEach((r) => { if (p > r.s + 0.5 && p < r.e) r.ignored = true; });
  }

  /* ----- settings rows, next to Crossfade in "Canciones y audio" ----- */
  function switchRow(id, key, name, hint) {
    const row = document.createElement('div');
    row.className = 'setting-item';
    row.id = id;
    row.innerHTML =
      '<div class="setting-item-top" style="align-items: center;"><div style="display: flex; flex-direction: column; gap: 2px;">' +
      '<span class="setting-name">' + cremoEsc(name) + '</span><span class="setting-hint">' + cremoEsc(hint) + '</span></div>' +
      '<button type="button" class="effect-switch-btn' + (isOn(key) ? ' active' : '') + '"><span class="thumb"></span></button></div>';
    const btn = row.querySelector('button');
    btn.addEventListener('click', () => {
      const next = !isOn(key);
      cremoLS.set(key, next ? '1' : '0');
      btn.classList.toggle('active', next);
    });
    return row;
  }

  function addSettings() {
    if (document.getElementById('cr-setting-sponsorblock')) return;
    const slider = document.getElementById('slider-crossfade');
    const anchor = slider && slider.closest('.setting-item');
    if (!anchor) return;
    const sb = switchRow('cr-setting-sponsorblock', KEY_SB,
      t('Saltar partes sin música', 'Skip non-music parts'),
      t('En vídeos de YouTube, salta intros habladas, patrocinios y finales sin música marcados por la comunidad de SponsorBlock',
        'In YouTube videos, skips talking intros, sponsors and non-music endings marked by the SponsorBlock community'));
    const sil = switchRow('cr-setting-skip-silence', KEY_SIL,
      t('Saltar silencios', 'Skip silences'),
      t('Quita el silencio al principio y al final de las canciones, y los huecos de 8 segundos o más',
        'Removes the silence at the start and end of songs, and gaps of 8 seconds or more'));
    anchor.parentNode.insertBefore(sil, anchor.nextSibling);
    anchor.parentNode.insertBefore(sb, anchor.nextSibling);
  }

  window.cremoAutoSkipState = () => cur; // for debugging from DevTools

  function start() {
    addSettings();
    const a = audio();
    if (!a) return;
    a.addEventListener('loadedmetadata', onLoaded);
    a.addEventListener('loadstart', () => { if (cur) cur.ending = false; });
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('seeking', onSeeking);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
