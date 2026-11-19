// Cremo additions on top of the upstream renderer:
//  1. The sidebar logo takes you back to the home view.
//  2. A hand-written Spanish dictionary that also covers UI drawn after
//     startup (upstream only translates the DOM once, at boot).
'use strict';

// Settings left behind by upstream features Cremo removed (the lottie library cache
// alone was ~300 KB of storage.json).
(function cremoDropObsoleteKeys() {
  ['cremo_lottie_lib_cache', 'cremo_spotify_promo_dismissed', 'cremo_sb_promo_dismissed_v1',
    'cremo_sidebar_pinned_tracks', 'cremo_sidebar_library_tracks', 'cremo_sidebar_default_wide_v2',
    'cremo_sb_lib_sort', 'cremo_home_layout', 'cremo_show_albums'].forEach((k) => {
    try { if (localStorage.getItem(k) !== null) localStorage.removeItem(k); } catch (_) {}
  });
})();

(function cremoLogoHome() {
  const logo = document.getElementById('cremo-home-logo');
  if (!logo) return;
  const goHomeNow = () => {
    if (typeof window.goHome === 'function') window.goHome();
    else document.getElementById('btn-top-search-home')?.click();
  };
  logo.addEventListener('click', goHomeNow);
  logo.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goHomeNow(); }
  });
})();

(function cremoSpanish() {
  if ((localStorage.getItem('cremo_ui_lang') || 'en') !== 'es') return;

  // Exact UI strings -> Spanish. Only whole strings are replaced, never song
  // titles or artist names (those are never exact matches of these keys).
  const ES = {
    // Navigation / sidebar
    'Home': 'Inicio',
    'Explore': 'Explorar',
    'Liked songs': 'Me gusta',
    'Liked Songs': 'Me gusta',
    'Favorites': 'Me gusta',
    'Albums': 'Álbumes',
    'Album': 'Álbum',
    'My files': 'Biblioteca',
    'History': 'Historial',
    'Queue': 'Cola',
    'Settings': 'Ajustes',
    'Your Library': 'Tu biblioteca',
    'Create': 'Crear',
    'Custom': 'Personalizado',
    'Playlists': 'Playlists',
    'Playlist': 'Playlist',
    'Artists': 'Artistas',
    'Artist': 'Artista',
    'Songs': 'Canciones',
    'All': 'Todo',
    'Recents': 'Recientes',
    'Recently added': 'Añadidos recientemente',
    'Alphabetical': 'Alfabético',
    'Create playlist': 'Crear playlist',
    'Audio presets': 'Ajustes de sonido',
    'Expand Your Library': 'Expandir tu biblioteca',
    'Collapse Your Library': 'Contraer tu biblioteca',
    'Search in Your Library': 'Buscar en tu biblioteca',
    'Import playlist': 'Importar playlist',
    'Pin current track': 'Fijar canción actual',
    // Home
    'For you': 'Para ti',
    'Based on your taste': 'Según tus gustos',
    'Trending now': 'Tendencias',
    'Home / Quick picks': 'Inicio',
    'Favorite artists': 'Artistas favoritos',
    'Made for you': 'Hecho para ti',
    'Popular artists': 'Artistas populares',
    'Recently played': 'Escuchado recientemente',
    'Top chart': 'Top',
    'Show all': 'Mostrar todo',
    'See all': 'Ver todo',
    'Daily Mix': 'Mix diario',
    'My Wave': 'Mi onda',
    // Right panel / now playing
    'Credits': 'Créditos',
    'Main Artist': 'Artista principal',
    'Lyricist': 'Letrista',
    'Producer': 'Productor',
    'Composer': 'Compositor',
    'Follow': 'Seguir',
    'Following': 'Siguiendo',
    'Audio source': 'Fuente de audio',
    'Lyrics': 'Letra',
    'Lyrics preview': 'Muestra de la letra',
    'Up next': 'A continuación',
    'Next in queue': 'Siguiente en la cola',
    'Now playing': 'Reproduciendo',
    'About the artist': 'Sobre el artista',
    'monthly listeners': 'oyentes mensuales',
    // Player
    'Play': 'Reproducir',
    'Pause': 'Pausar',
    'Play or pause': 'Reproducir o pausar',
    'Next': 'Siguiente',
    'Previous': 'Anterior',
    'Shuffle': 'Aleatorio',
    'Repeat': 'Repetir',
    'Mute': 'Silenciar',
    'Volume': 'Volumen',
    'Clear queue': 'Vaciar cola',
    'Add to queue': 'Añadir a la cola',
    'Add to playlist': 'Añadir a playlist',
    'Add to Liked songs': 'Añadir a Me gusta',
    'Remove from Liked songs': 'Quitar de Me gusta',
    'Favorite': 'Me gusta',
    'Unfavorite': 'Quitar de Me gusta',
    'Remove from favorites': 'Quitar de Me gusta',
    'Remove from Cremo': 'Quitar de Cremo',
    'Add to library': 'Añadir a la biblioteca',
    'Remove from library': 'Quitar de la biblioteca',
    'Pin to sidebar': 'Fijar en la barra lateral',
    'Unpin from sidebar': 'Desfijar de la barra lateral',
    'Share link': 'Compartir enlace',
    'Change banner': 'Cambiar portada',
    'Rename track': 'Renombrar canción',
    'Set top moment here': 'Marcar mejor momento aquí',
    'Remove top moment': 'Quitar mejor momento',
    'Top moment removed': 'Mejor momento eliminado',
    'Top moment set at': 'Mejor momento marcado en',
    'Block track': 'Bloquear canción',
    'Unblock track': 'Desbloquear canción',
    'Block artist': 'Bloquear artista',
    'Unblock artist': 'Desbloquear artista',
    'Go to artist': 'Ir al artista',
    'Go to album': 'Ir al álbum',
    'Share': 'Compartir',
    'Download': 'Descargar',
    'Remove': 'Quitar',
    'Delete': 'Eliminar',
    'Rename': 'Renombrar',
    'Cancel': 'Cancelar',
    'Save': 'Guardar',
    'Close': 'Cerrar',
    'Back': 'Atrás',
    'Forward': 'Adelante',
    'More': 'Más',
    'More options': 'Más opciones',
    // Search
    'Search tracks, artists, or albums...': 'Busca canciones, artistas o álbumes...',
    'Search songs, artists, albums...': 'Busca canciones, artistas o álbumes...',
    'Search': 'Buscar',
    'Top result': 'Mejor resultado',
    'No results': 'Sin resultados',
  };
  // "2 songs", "1 song", "12 tracks"
  const COUNT_RE = /^(\d[\d.,]*)\s+(songs?|tracks?)$/i;

  // Share with upstream's own translator so t() and its boot pass use these too.
  try {
    const dict = window.BUILTIN_UI_DICT || (window.BUILTIN_UI_DICT = {});
    dict.es = Object.assign(dict.es || {}, ES);
    if (typeof window.applyI18n === 'function') window.applyI18n('es');
  } catch (_) {}

  const translateString = (s) => {
    const key = s.trim();
    if (!key) return null;
    if (Object.prototype.hasOwnProperty.call(ES, key)) return s.replace(key, ES[key]);
    const m = COUNT_RE.exec(key);
    if (m) return s.replace(key, `${m[1]} ${m[1] === '1' ? 'canción' : 'canciones'}`);
    // Playlist subtitles: "Name • 1 songs, 5 min"
    if (/\b\d+ (songs?|tracks?), \d/.test(key)) {
      return s.replace(/\b(\d+) (?:songs?|tracks?)\b/, (_, n) => `${n} ${n === '1' ? 'canción' : 'canciones'}`);
    }
    return null;
  };

  const SKIP = 'script,style,textarea,input,[contenteditable],.lyrics-container,.lyrics-line';
  const translateTextNode = (node) => {
    const parent = node.parentElement;
    if (!parent || parent.closest(SKIP)) return;
    const next = translateString(node.nodeValue);
    if (next !== null && next !== node.nodeValue) node.nodeValue = next;
  };
  const translateAttrs = (el) => {
    for (const attr of ['title', 'aria-label', 'placeholder']) {
      const v = el.getAttribute && el.getAttribute(attr);
      if (!v) continue;
      const next = translateString(v);
      if (next !== null && next !== v) el.setAttribute(attr, next);
    }
  };
  const translateTree = (root) => {
    if (root.nodeType === Node.TEXT_NODE) { translateTextNode(root); return; }
    if (root.nodeType !== Node.ELEMENT_NODE || root.matches(SKIP)) return;
    translateAttrs(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (n.nodeType === Node.TEXT_NODE) translateTextNode(n);
      else translateAttrs(n);
    }
  };

  // Batch DOM changes once per frame so frequent updates (progress time,
  // visualizer) stay cheap.
  let pending = new Set();
  let scheduled = false;
  const flush = () => {
    scheduled = false;
    const nodes = pending; pending = new Set();
    for (const n of nodes) if (n.isConnected) translateTree(n);
  };
  const observer = new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === 'childList') r.addedNodes.forEach(n => pending.add(n));
      else if (r.type === 'characterData') pending.add(r.target);
      else if (r.type === 'attributes') pending.add(r.target);
    }
    if (!scheduled && pending.size) { scheduled = true; requestAnimationFrame(flush); }
  });

  const start = () => {
    translateTree(document.body);
    observer.observe(document.body, {
      subtree: true, childList: true, characterData: true,
      attributes: true, attributeFilter: ['title', 'aria-label', 'placeholder']
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();

// ---------------------------------------------------------------------------
// Rail v3: compact rail only, animated tooltips, a sliding "selected" pill,
// a click pop, and a "Me gusta" shortcut at the top of the Playlists menu.
// ---------------------------------------------------------------------------
(function cremoRail() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  const body = document.body;

  const isEs = (localStorage.getItem('cremo_ui_lang') || 'en') === 'es';
  const LABELS = isEs ? {
    'cremo-home-logo': 'Inicio',
    'nav-discover': 'Explorar',
    'nav-favorites': 'Me gusta',
    'nav-local': 'Biblioteca',
    'nav-settings': 'Ajustes',
    'btn-toggle-presets-drawer': 'Ajustes de sonido',
    'btn-toggle-playlists-drawer': 'Playlists',
  } : {};
  const TILE = '.sidebar-nav .nav-item, .rail-icon-btn, #cremo-home-logo';

  // ---- Tooltip ----
  const tip = document.createElement('div');
  tip.className = 'cr-tip';
  tip.setAttribute('role', 'tooltip');
  document.body.appendChild(tip);
  let tipFor = null;

  const labelOf = (btn) => LABELS[btn.id] || btn.dataset.crTip || btn.getAttribute('title') || btn.getAttribute('aria-label') || '';
  const showTip = (btn) => {
    if (body.classList.contains('sidebar-expanded')) return;
    const label = labelOf(btn);
    if (!label) return;
    // Park the native title so the grey OS tooltip doesn't also appear.
    if (btn.hasAttribute('title')) {
      btn.dataset.crTip = btn.getAttribute('title');
      btn.removeAttribute('title');
    }
    tipFor = btn;
    tip.textContent = label;
    const r = btn.getBoundingClientRect();
    tip.style.left = `${Math.round(r.right + 12)}px`;
    tip.style.top = `${Math.round(r.top + r.height / 2)}px`;
    tip.classList.remove('show');
    void tip.offsetWidth;
    tip.classList.add('show');
  };
  const hideTip = () => {
    if (tipFor && tipFor.dataset.crTip && !tipFor.hasAttribute('title')) {
      tipFor.setAttribute('title', tipFor.dataset.crTip);
    }
    tipFor = null;
    tip.classList.remove('show');
  };
  sidebar.addEventListener('mouseover', (e) => {
    const btn = e.target.closest(TILE);
    if (!btn || !sidebar.contains(btn) || btn === tipFor) return;
    if (btn.closest('#rail-drawer')) return;
    hideTip();
    showTip(btn);
  });
  sidebar.addEventListener('mouseout', (e) => {
    if (!tipFor) return;
    if (e.relatedTarget && tipFor.contains(e.relatedTarget)) return;
    hideTip();
  });
  sidebar.addEventListener('focusin', (e) => {
    const btn = e.target.closest(TILE);
    if (btn && btn.matches(':focus-visible')) { hideTip(); showTip(btn); }
  });
  sidebar.addEventListener('focusout', hideTip);
  window.addEventListener('blur', hideTip);

  // ---- Click pop ----
  sidebar.addEventListener('click', (e) => {
    const btn = e.target.closest(TILE);
    if (!btn || btn.closest('#rail-drawer')) return;
    btn.classList.remove('cr-pop');
    void btn.offsetWidth;
    btn.classList.add('cr-pop');
    hideTip();
  });
  sidebar.addEventListener('animationend', (e) => {
    if (e.animationName === 'cr-pop') e.target.classList.remove('cr-pop');
  });

  // ---- Sliding pill next to the selected button ----
  if (getComputedStyle(sidebar).position === 'static') sidebar.style.position = 'relative';
  const pill = document.createElement('div');
  pill.className = 'cr-rail-pill';
  sidebar.appendChild(pill);
  let pillFrame = 0;
  const placePill = () => {
    pillFrame = 0;
    const drawerBtn = sidebar.querySelector('.rail-icon-btn.active');
    const navActive = [...sidebar.querySelectorAll('.sidebar-nav .nav-item.active')].find(n => n.offsetParent !== null);
    // Library + playlist pages belong to the Playlists button now.
    const view = window.state && window.state.currentView;
    const inLibrary = !navActive && (view === 'local' || view === 'playlist-detail');
    const plBtn = document.getElementById('btn-toggle-playlists-drawer');
    if (plBtn) plBtn.classList.toggle('cr-current', inLibrary);
    const active = drawerBtn || navActive || (inLibrary ? plBtn : null);
    if (!active || active.offsetParent === null) { pill.classList.remove('show'); return; }
    const sr = sidebar.getBoundingClientRect();
    const r = active.getBoundingClientRect();
    const h = Math.round(r.height * 0.5);
    pill.style.height = `${h}px`;
    pill.style.top = `${Math.round(r.top - sr.top + (r.height - h) / 2)}px`;
    pill.classList.add('show');
  };
  const queuePill = () => { if (!pillFrame) pillFrame = requestAnimationFrame(placePill); };
  new MutationObserver(queuePill).observe(sidebar, { subtree: true, attributes: true, attributeFilter: ['class'] });
  window.addEventListener('resize', queuePill);
  setTimeout(queuePill, 300);

  // ---- Rail order: Explorar, Me gusta, Playlists | sound presets ... settings ----
  // Álbumes, Cola, Historial and Biblioteca leave the rail (Biblioteca moves into
  // the Playlists menu; the queue stays on the player bar).
  const nav = sidebar.querySelector('.sidebar-nav');
  const plBtn = document.getElementById('btn-toggle-playlists-drawer');
  const favBtn = document.getElementById('nav-favorites');
  if (nav && plBtn && favBtn) favBtn.insertAdjacentElement('afterend', plBtn);

  // ---- Playlists menu: "Biblioteca" shortcut above the playlists ----
  const section = document.getElementById('drawer-section-playlists');
  const list = document.getElementById('playlists-list');
  if (section && list) {
    const lib = document.createElement('div');
    lib.className = 'cr-liked-item cr-lib-item';
    lib.setAttribute('role', 'button');
    lib.tabIndex = 0;
    lib.innerHTML = `
      <div class="cr-liked-thumb"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><path d="M12 10.5v5"/><circle cx="10.6" cy="15.6" r="1.6"/><path d="M12 10.5l2.6.9"/></svg></div>
      <div class="cr-liked-info">
        <span class="cr-liked-name">${isEs ? 'Biblioteca' : 'Library'}</span>
        <span class="cr-liked-count"></span>
      </div>
      <svg class="cr-row-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>`;
    const label = document.createElement('div');
    label.className = 'cr-drawer-label';
    label.textContent = isEs ? 'Tus playlists' : 'Your playlists';
    section.insertBefore(lib, list);
    section.insertBefore(label, list);

    const countEl = lib.querySelector('.cr-liked-count');
    const refreshCount = () => {
      const n = Array.isArray(window.state?.localTracks) ? window.state.localTracks.length : 0;
      const songs = isEs ? `${n} ${n === 1 ? 'canción' : 'canciones'}` : `${n} song${n === 1 ? '' : 's'}`;
      countEl.textContent = isEs ? `Tus archivos · ${songs}` : `Your files · ${songs}`;
    };
    const openLib = () => {
      document.getElementById('nav-local')?.click();
      document.getElementById('btn-close-rail-drawer')?.click();
    };
    lib.addEventListener('click', openLib);
    lib.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLib(); }
    });
    const drawer = document.getElementById('rail-drawer');
    if (drawer) {
      new MutationObserver(() => { if (drawer.classList.contains('open')) refreshCount(); })
        .observe(drawer, { attributes: true, attributeFilter: ['class'] });
    }
    refreshCount();
  }
})();

// ---------------------------------------------------------------------------
// Custom themes: one accent color drives the whole Cremo look (cremo.css
// derives every tint from --cr-accent). Picker lives in Ajustes > Tema.
// ---------------------------------------------------------------------------
(function cremoThemes() {
  const KEY = 'cremo_theme_accent';
  const DEFAULT = '#e2475d';
  const isEs = (localStorage.getItem('cremo_ui_lang') || 'en') === 'es';
  const PRESETS = [
    { name: isEs ? 'Carmesí' : 'Crimson', color: '#e2475d' },
    { name: isEs ? 'Rosa' : 'Pink', color: '#ec4899' },
    { name: isEs ? 'Violeta' : 'Violet', color: '#8b5cf6' },
    { name: isEs ? 'Índigo' : 'Indigo', color: '#6366f1' },
    { name: isEs ? 'Azul' : 'Blue', color: '#3b82f6' },
    { name: isEs ? 'Cian' : 'Cyan', color: '#06b6d4' },
    { name: isEs ? 'Esmeralda' : 'Emerald', color: '#10b981' },
    { name: isEs ? 'Lima' : 'Lime', color: '#84cc16' },
    { name: isEs ? 'Ámbar' : 'Amber', color: '#f59e0b' },
    { name: isEs ? 'Naranja' : 'Orange', color: '#f97316' },
  ];
  const valid = (c) => /^#[0-9a-f]{6}$/i.test(c || '');

  const hexToHsl = (hex) => {
    const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return [0, 0, l];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h * 60, s, l];
  };
  const BASE_HSL = hexToHsl(DEFAULT);

  const apply = (color, persist) => {
    if (!valid(color)) color = DEFAULT;
    color = color.toLowerCase();
    const root = document.documentElement;
    root.style.setProperty('--cr-accent', color);
    // The logo artwork is crimson: rotate its hue to match the new accent.
    const [h, s] = hexToHsl(color);
    root.style.setProperty('--cr-logo-hue', `${Math.round(h - BASE_HSL[0])}deg`);
    root.style.setProperty('--cr-logo-sat', String(Math.max(0.15, Math.min(1.4, s / BASE_HSL[1]))));
    if (persist) {
      try {
        localStorage.setItem(KEY, color);
        if (window.state) window.state.themeAccent = color;
      } catch (_) {}
    }
    syncPicker(color);
    window.dispatchEvent(new CustomEvent('cremo-theme-change', { detail: { color } }));
  };

  // ---- Picker card in Ajustes > Tema ----
  let card = null;
  const syncPicker = (color) => {
    if (!card) return;
    let matched = false;
    card.querySelectorAll('.cr-theme-swatch').forEach(sw => {
      const on = sw.dataset.color === color;
      if (on) matched = true;
      sw.classList.toggle('active', on);
      sw.setAttribute('aria-checked', String(on));
    });
    const custom = card.querySelector('.cr-theme-custom');
    custom.classList.toggle('active', !matched);
    custom.querySelector('input').value = color;
    card.querySelector('.cr-theme-current').textContent =
      matched ? PRESETS.find(p => p.color === color).name : (isEs ? 'Personalizado' : 'Custom');
  };

  const buildCard = () => {
    const group = document.querySelector('.settings-section[data-cat="theme"] .m3-group');
    if (!group || group.querySelector('.cr-theme-card')) return;
    card = document.createElement('div');
    card.className = 'setting-item cr-theme-card';
    card.innerHTML = `
      <div class="cr-theme-head">
        <div>
          <div class="cr-theme-title">${isEs ? 'Tema de Cremo' : 'Cremo theme'}</div>
          <div class="cr-theme-sub">${isEs ? 'Elige un color y toda la interfaz se adapta.' : 'Pick a color and the whole interface follows.'}</div>
        </div>
        <span class="cr-theme-current"></span>
      </div>
      <div class="cr-theme-grid" role="radiogroup" aria-label="${isEs ? 'Color del tema' : 'Theme color'}">
        ${PRESETS.map(p => `
          <button type="button" class="cr-theme-swatch" role="radio" data-color="${p.color}" style="--sw:${p.color}" title="${p.name}">
            <span class="cr-theme-dot"></span><span class="cr-theme-name">${p.name}</span>
          </button>`).join('')}
        <label class="cr-theme-swatch cr-theme-custom" title="${isEs ? 'Elegir otro color' : 'Pick any color'}">
          <span class="cr-theme-dot cr-theme-dot-custom"><input type="color" value="${DEFAULT}"></span>
          <span class="cr-theme-name">${isEs ? 'Personalizado' : 'Custom'}</span>
        </label>
      </div>
      <div class="cr-theme-preview" aria-hidden="true">
        <span class="cr-pv-play"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg></span>
        <span class="cr-pv-bar"><span></span></span>
        <span class="cr-pv-chip">${isEs ? 'Vista previa' : 'Preview'}</span>
      </div>`;
    group.prepend(card);
    card.querySelectorAll('button.cr-theme-swatch').forEach(sw => {
      sw.addEventListener('click', () => apply(sw.dataset.color, true));
    });
    const input = card.querySelector('.cr-theme-custom input');
    input.addEventListener('input', () => apply(input.value, false));
    input.addEventListener('change', () => apply(input.value, true));
    syncPicker(getComputedStyle(document.documentElement).getPropertyValue('--cr-accent').trim() || DEFAULT);
  };

  let stored = null;
  try { stored = localStorage.getItem(KEY); } catch (_) {}
  apply(valid(stored) ? stored : DEFAULT, false);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildCard);
  else buildCard();
})();

/* ---------- Explorar: greeting hero with quick actions ---------- */
(function cremoExploreHero() {
  'use strict';
  const ICONS = {
    radio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 10v4M8 6v12M12 3v18M16 6v12M20 10v4"/></svg>',
    shuffle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    stats: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>'
  };
  const click = (id) => { const b = document.getElementById(id); if (b) b.click(); };
  const ACTIONS = [
    { key: 'radio', label: 'Radio para ti', primary: true, run: () => { if (typeof window.playMyWave === 'function') window.playMyWave(); } },
    { key: 'shuffle', label: 'Mezclar Me gusta', run: () => click('btn-shuffle-favorites') },
    { key: 'heart', label: 'Me gusta', run: () => click('nav-favorites') },
    { key: 'stats', label: 'Tu resumen', run: () => { if (window.cremoOpenSummary) window.cremoOpenSummary(); } },
    { key: 'search', label: 'Buscar', run: () => { const s = document.getElementById('search-input'); if (s) s.focus(); } }
  ];

  function greeting(h) {
    if (h >= 5 && h < 12) return 'Buenos días';
    if (h >= 12 && h < 20) return 'Buenas tardes';
    return 'Buenas noches';
  }

  function refresh(hero) {
    const now = new Date();
    hero.querySelector('.cr-hero-title').textContent = greeting(now.getHours());
    let date = '';
    try { date = now.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' }); } catch (_) {}
    hero.querySelector('.cr-hero-date').textContent = date ? date.charAt(0).toUpperCase() + date.slice(1) : '';
  }

  function build() {
    const home = document.getElementById('sp-home');
    if (!home || document.getElementById('cr-explore-hero')) return;
    const hero = document.createElement('section');
    hero.id = 'cr-explore-hero';
    hero.className = 'cr-explore-hero';
    hero.innerHTML =
      '<div class="cr-hero-glow" aria-hidden="true"></div>' +
      '<div class="cr-hero-text"><div class="cr-hero-date"></div><h1 class="cr-hero-title"></h1>' +
      '<div class="cr-hero-sub">¿Qué te apetece escuchar hoy?</div></div>' +
      '<div class="cr-hero-actions"></div>';
    const bar = hero.querySelector('.cr-hero-actions');
    ACTIONS.forEach((a) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cr-hero-chip' + (a.primary ? ' is-primary' : '');
      b.innerHTML = ICONS[a.key] + '<span>' + a.label + '</span>';
      b.addEventListener('click', a.run);
      bar.appendChild(b);
    });
    home.insertBefore(hero, home.firstChild);
    refresh(hero);
    setInterval(() => refresh(hero), 5 * 60 * 1000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();

/* ---------- Explorar: fade the edge of rows that can still scroll ---------- */
(function cremoRowFades() {
  'use strict';
  function upd(row) {
    const max = row.scrollWidth - row.clientWidth;
    row.classList.toggle('fade-left', row.scrollLeft > 4);
    row.classList.toggle('fade-right', max > 4 && row.scrollLeft < max - 4);
  }
  let t = 0;
  const all = () => { clearTimeout(t); t = setTimeout(() => document.querySelectorAll('#sp-home .sp-row').forEach(upd), 120); };
  document.addEventListener('scroll', (e) => {
    const r = e.target;
    if (r && r.classList && r.classList.contains('sp-row')) upd(r);
  }, true);
  window.addEventListener('resize', all);
  function start() {
    const home = document.getElementById('sp-home');
    if (!home) return;
    new MutationObserver(all).observe(home, { childList: true, subtree: true });
    all();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();

/* ---------- Settings: Cremo's own organisation ----------
   Moves existing setting rows (keeping their listeners) into three new
   categories, hides upstream-only / duplicated rows and fixes labels.
   Idempotent: runs at startup and every time a settings category opens. */
(function cremoSettings() {
  'use strict';
  const ES = (localStorage.getItem('cremo_ui_lang') || 'en') === 'es';
  const t = (es, en) => (ES ? es : en);

  const ICON = {
    visualizer: '<path d="M3 12h2M7 7v10M11 4v16M15 8v8M19 10v4"/>',
    player: '<circle cx="12" cy="12" r="9"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>',
    explore: '<circle cx="12" cy="12" r="9"/><polygon points="16 8 13.5 13.5 8 16 10.5 10.5 16 8"/>'
  };

  // [category, nav label, [[subheading, [selectors...]], ...]]
  const CATS = [
    ['visualizer', t('Visualizador', 'Visualizer'), [
      [t('Barra de reproducción', 'Player bar'), ['#btn-bar-wave', '#bar-viz-pos-group', '#val-bar-viz-opacity', '#val-bar-viz-sens', '#val-bar-viz-smooth']],
      [t('Reproduciendo ahora y karaoke', 'Now Playing & karaoke'), ['#btn-np-viz', '#viz-style-dropdown', '#val-viz-sens', '#val-viz-smooth', '#btn-tvk-visualizer-setting', '#btn-tvk-visualizer-lyrics-setting', '#val-tvk-vis-opacity-setting', '#val-tvk-bg-blur-setting']]
    ]],
    ['player', t('Reproductor', 'Player'), [
      [t('Barra de reproducción', 'Player bar'), ['#btn-play-btn-bg', '#toggle-m3-cover', '#btn-wavy-progress', '#btn-progress-knob', '#btn-progress-bg', '#btn-autohide-timestamps']],
      [t('Reproduciendo ahora', 'Now Playing'), ['#np-align-toggle', '#np-toolbar-pos-select', '#toggle-m3-hero-covers', '#top-moment-icon-selector', '[data-adv="track_credits"]', '[data-adv="credits_fallback"]']],
      [t('Letras', 'Lyrics'), ['#btn-lyrics-fullscreen-only', '#btn-lyrics-warnings', '[data-adv="online_lyrics"]', '[data-adv="karaoke_words"]', '[data-adv="lyrics_autoscroll"]', '#lyrics-source-dropdown', '#word-source-dropdown', '#lyrics-wordstyle-dropdown', '#lyrics-ease-dropdown', '#val-lyrics-speed', '#val-lyrics-tightness', '#btn-tr-enabled', '#select-tr-lang', '#btn-tr-auto']]
    ]],
    ['explore', t('Explorar', 'Explore'), [
      [t('Secciones', 'Sections'), ['[data-adv="my_wave"]', '[data-adv="jump_back"]', '[data-adv="fav_artists"]', '#btn-reset-sidebar-order']],
      [t('Recomendaciones', 'Recommendations'), ['#btn-reset-recommendations']]
    ]]
  ];

  // Rows that only made sense in upstream, or that are duplicated elsewhere.
  const HIDE = [
    '#account-promocode-input',                       // Upstream's promo codes
    '#btn-acc-export-rfacc', '#btn-acc-import-rfacc', // also in Almacenamiento
    '[data-adv="classic_sidebar"]',                   // breaks Cremo's rail
    '#btn-show-local', '#btn-show-albums',            // tabs Cremo's rail replaces
    '[data-adv="albums"]',
    '#btn-toggle-cremo-home'                           // old upstream home layout (hides Explorar)
  ];

  // Mesh gradient rows live in Avanzado; Tema already has the mesh brightness.
  const TO_THEME = ['[data-adv="mesh_gradient"]', '[data-adv="mesh_follow_intensity"]', '[data-adv="mesh_cover_color"]'];

  const NAMES = ES ? {
    '#btn-disable-animations': 'Desactivar animaciones',
    '#btn-setting-cremo-home-icon': 'Logo de Cremo en el botón Inicio',
    '#btn-cremo-library': 'Búsqueda combinada',
    '#btn-cremo-library-streaming': 'Reproducción híbrida (búsqueda combinada)',
    '#select-engine-api': 'Motor de búsqueda',
    '#settings-val-scale': 'Escala de la interfaz',
    '#val-panel-blur': 'Desenfoque de paneles flotantes',
    '#toggle-m3-cover': 'Portada con forma en la barra inferior',
    '#toggle-m3-hero-covers': 'Portadas con forma en Reproduciendo ahora y karaoke',
    '#val-track-row-height': 'Altura de las filas de canciones',
    '#track-style-toggle': 'Estilo de las filas de canciones',
    '#top-moment-icon-selector': 'Icono del mejor momento',
    '#val-theme-hue': 'Tono',
    '#val-theme-intensity': 'Intensidad',
    '#btn-intensity-bg': 'Aplicar intensidad al fondo',
    '#select-banner-fit': 'Ajuste del banner',
    '#val-crossfade': 'Fundido cruzado',
    '#download-folder-path': 'Carpeta de descargas',
    '#val-lyrics-tightness': 'Suavidad del degradado',
    '#btn-progress-knob': 'Indicador de la barra de progreso',
    '#btn-fav-header-setting': 'Cabecera de playlist en Me gusta',
    '#btn-show-fav-recs': 'Mostrar recomendaciones en Me gusta',
    '#btn-win-media-keys': 'Captura de teclas multimedia (modo antiguo)',
    '#btn-open-css-editor': 'Editor CSS',
    '#btn-reset-account-avatar': 'Avatar de perfil',
    '#val-tvk-bg-blur-setting': 'Desenfoque del fondo (karaoke)',
    '#val-tvk-vis-opacity-setting': 'Opacidad del visualizador (karaoke)',
    '#btn-reset-sidebar-order': 'Orden de las secciones',
    '[data-adv="my_wave"]': 'Para ti',
    '[data-adv="jump_back"]': 'Inicio (escuchado recientemente)',
    '[data-adv="fav_artists"]': 'Artistas favoritos',
    '[data-adv="mesh_follow_intensity"]': 'La malla sigue la intensidad del tema',
    '[data-adv="mesh_cover_color"]': 'Color de la malla según la portada',
    '[data-adv="ui_alpha_auto"]': 'Menor opacidad de la interfaz con fondos'
  } : {
    '#btn-setting-cremo-home-icon': 'Cremo logo on Home button',
    '#btn-cremo-library': 'Combined search',
    '#btn-cremo-library-streaming': 'Hybrid streaming (combined search)'
  };
  const HINTS = ES ? {
    '#btn-disable-animations': 'Consume menos CPU y GPU y responde más rápido, pero sin animaciones suaves.',
    '#btn-cremo-library': 'Junta YouTube Music y SoundCloud en una sola fuente de búsqueda'
  } : {};
  const NAV = ES ? { banners: 'Fondos y banners', tracks: 'Canciones y audio' } : { tracks: 'Tracks & audio' };

  const root = () => document.getElementById('view-settings');
  const rowOf = (sel) => {
    const r = root();
    const n = r && r.querySelector(sel);
    return n ? n.closest('.setting-item') : null;
  };

  function ensureCategory(cat, label, prevCat) {
    const nav = document.getElementById('settings-nav');
    const iface = document.querySelector('#view-settings .settings-section[data-cat="interface"]');
    if (!nav || !iface) return null;
    if (!nav.querySelector('.settings-nav-btn[data-cat="' + cat + '"]')) {
      const b = document.createElement('button');
      b.className = 'settings-nav-btn';
      b.type = 'button';
      b.dataset.cat = cat;
      b.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + ICON[cat] + '</svg><span>' + label + '</span>';
      const prevBtn = nav.querySelector('.settings-nav-btn[data-cat="' + prevCat + '"]');
      nav.insertBefore(b, prevBtn ? prevBtn.nextSibling : null);
    }
    let sec = document.querySelector('#view-settings .settings-section[data-cat="' + cat + '"]');
    if (!sec) {
      sec = document.createElement('div');
      sec.className = 'settings-section cr-own cat-hidden';
      sec.dataset.cat = cat;
      const prevSec = document.querySelector('#view-settings .settings-section[data-cat="' + prevCat + '"]') || iface;
      prevSec.parentNode.insertBefore(sec, prevSec.nextSibling);
    }
    return sec;
  }

  function ensureGroup(sec, idx, title) {
    let g = sec.querySelector('.m3-group[data-cr-group="' + idx + '"]');
    if (!g) {
      const h = document.createElement('div');
      h.className = 'settings-section-title cr-set-subhead';
      h.textContent = title;
      g = document.createElement('div');
      g.className = 'm3-group';
      g.dataset.crGroup = String(idx);
      sec.appendChild(h);
      sec.appendChild(g);
    }
    return g;
  }

  function organize() {
    if (!root()) return;
    let prevCat = 'interface';
    CATS.forEach(([cat, label, groups]) => {
      const sec = ensureCategory(cat, label, prevCat);
      prevCat = cat;
      if (!sec) return;
      groups.forEach(([title, sels], i) => {
        const g = ensureGroup(sec, i, title);
        sels.forEach((sel) => {
          const row = rowOf(sel);
          if (row) g.appendChild(row); // appendChild also keeps the listed order
        });
      });
    });

    const meshAnchor = rowOf('#btn-configure-mesh');
    if (meshAnchor) {
      let after = meshAnchor;
      TO_THEME.forEach((sel) => {
        const row = rowOf(sel);
        if (!row) return;
        if (after.nextSibling !== row) after.parentNode.insertBefore(row, after.nextSibling);
        after = row;
      });
    }

    HIDE.forEach((sel) => { const row = rowOf(sel); if (row) row.classList.add('cr-setting-hidden'); });

    Object.entries(NAMES).forEach(([sel, name]) => {
      const row = rowOf(sel);
      const n = row && row.querySelector('.setting-name');
      if (n && n.textContent !== name) n.textContent = name;
    });
    Object.entries(HINTS).forEach(([sel, hint]) => {
      const row = rowOf(sel);
      if (!row) return;
      const h = row.querySelector('.setting-hint') || row.querySelector('.setting-name + span');
      if (h && h.textContent !== hint) h.textContent = hint;
    });
    Object.entries(NAV).forEach(([cat, label]) => {
      const s = document.querySelector('#settings-nav .settings-nav-btn[data-cat="' + cat + '"] span');
      if (s && s.textContent !== label) s.textContent = label;
    });
    // The machine translation turned "Search settings..." into "Configuración de búsqueda".
    const search = document.getElementById('settings-search-input');
    const ph = t('Buscar ajustes', 'Search settings');
    if (search && search.placeholder !== ph) search.placeholder = ph;
    if (typeof window.reorderSettingsNav === 'function') window.reorderSettingsNav();

    // The sidebar-order column lists upstream's old rail buttons (Álbumes, Cola,
    // Historial...), which Cremo's rail replaces: keep only the Explorar column.
    const custom = document.getElementById('setting-sidebar-home-customizer');
    if (custom) {
      const boxes = custom.querySelectorAll('.customizer-box');
      if (boxes.length > 1) boxes[0].classList.add('cr-setting-hidden');
      const hint = custom.querySelector('.setting-hint') || custom.querySelector('.setting-name + span');
      const txt = t('Arrastra para cambiar el orden de las secciones de Explorar', 'Drag to reorder the Explore sections');
      if (hint && hint.textContent !== txt) hint.textContent = txt;
    }

    if (typeof window.syncSettingsNavIndicator === 'function') requestAnimationFrame(window.syncSettingsNavIndicator);
  }

  window.cremoOrganizeSettings = organize;
  const start = () => { organize(); setTimeout(organize, 1500); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();

/* ====================================================================
   Cremo 1.0 features: startup screen, sleep timer shortcut, backups,
   mini player shortcut and "Tu resumen" (listening stats).
   ==================================================================== */
const cremoEsc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const cremoLS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (_) { return d; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }
};

/* Small helper: a settings row with a segmented choice, styled like upstream's own. */
function cremoChoiceRow(id, name, hint, options, current, onPick, icon) {
  const row = document.createElement('div');
  row.className = 'setting-item' + (icon ? ' cr-has-icon' : '');
  row.id = id;
  row.innerHTML =
    '<div class="setting-item-top">' + (icon ? '<span class="cr-row-icon">' + icon + '</span>' : '') + '<div style="display:flex;flex-direction:column;gap:2px;">' +
    '<span class="setting-name">' + cremoEsc(name) + '</span>' +
    (hint ? '<span class="setting-hint">' + cremoEsc(hint) + '</span>' : '') +
    '</div></div><div class="theme-mode-toggle cr-choice"></div>';
  const box = row.querySelector('.cr-choice');
  options.forEach(([value, label]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'theme-mode-btn' + (value === current ? ' active' : '');
    b.dataset.value = value;
    b.textContent = label;
    b.addEventListener('click', () => {
      box.querySelectorAll('.theme-mode-btn').forEach((x) => x.classList.toggle('active', x === b));
      onPick(value);
    });
    box.appendChild(b);
  });
  return row;
}

/* ---------- Pantalla al abrir ---------- */
(function cremoStartView() {
  'use strict';
  const KEY = 'cremo_start_view';
  const LAST = 'cremo_last_view';
  const SIMPLE = ['discover', 'favorites', 'local'];

  window.cremoOpenStartView = function () {
    if (typeof window.switchView !== 'function') return;
    let v = cremoLS.get(KEY, 'discover');
    if (v === 'last') v = cremoLS.get(LAST, 'discover');
    if (v.indexOf('pl:') === 0) {
      const id = v.slice(3);
      const st = window.state || {};
      if (typeof window.openPlaylistDetail === 'function' && (st.playlists || []).some((p) => p.id === id)) {
        window.openPlaylistDetail(id);
        return;
      }
      v = 'discover';
    }
    window.switchView(SIMPLE.indexOf(v) >= 0 ? v : 'discover');
  };

  // Remember where the user is, for the "Donde lo dejé" option.
  setInterval(() => {
    const st = window.state;
    if (!st) return;
    if (SIMPLE.indexOf(st.currentView) >= 0) cremoLS.set(LAST, st.currentView);
    else if (st.currentView === 'playlist-detail' && st.currentPlaylistId) cremoLS.set(LAST, 'pl:' + st.currentPlaylistId);
  }, 2000);

  function addSetting() {
    if (document.getElementById('cr-setting-start-view')) return;
    const anchor = document.getElementById('setting-ui-lang-row');
    if (!anchor) return;
    const row = cremoChoiceRow('cr-setting-start-view', 'Pantalla al abrir', 'Qué se muestra al iniciar Cremo',
      [['discover', 'Explorar'], ['favorites', 'Me gusta'], ['local', 'Biblioteca'], ['last', 'Donde lo dejé']],
      cremoLS.get(KEY, 'discover'), (v) => cremoLS.set(KEY, v));
    anchor.parentNode.insertBefore(row, anchor.nextSibling);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addSetting);
  else addSetting();
})();

/* ---------- Temporizador de apagado en la barra de reproducción ---------- */
(function cremoSleepQuick() {
  'use strict';
  const OPTIONS = [['15', '15 min'], ['30', '30 min'], ['45', '45 min'], ['60', '1 hora'], ['90', '1 h 30'], ['end', 'Al terminar la canción']];
  const MOON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  const MINI = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><rect x="12" y="11" width="8" height="6" rx="1" fill="currentColor"/></svg>';
  let btn = null;
  let pop = null;

  const pill = (v) => document.querySelector('.audio-panel[data-audio-panel="sleep"] [data-sleep-minutes="' + v + '"]');

  function close() { if (pop) pop.classList.remove('open'); }

  function open() {
    if (!pop) return;
    const st = window.state && window.state.sleepTimer;
    pop.querySelectorAll('.cr-pop-item').forEach((b) => {
      const v = b.dataset.v;
      const on = !!st && ((v === 'end' && st.mode === 'end') || (st.mode === 'minutes' && String(st.minutes) === v));
      b.classList.toggle('is-on', on);
      if (v === 'off') b.hidden = !st;
    });
    const r = btn.getBoundingClientRect();
    pop.style.right = Math.max(8, window.innerWidth - r.right - 60) + 'px';
    pop.style.bottom = (window.innerHeight - r.top + 10) + 'px';
    pop.classList.add('open');
  }

  function badge() {
    if (!btn) return;
    const st = window.state && window.state.sleepTimer;
    const b = btn.querySelector('.cr-sleep-badge');
    btn.classList.toggle('is-on', !!st);
    if (!st) { b.textContent = ''; btn.title = 'Temporizador de apagado'; return; }
    if (st.mode === 'end') { b.textContent = 'fin'; btn.title = 'Se parará al terminar la canción'; return; }
    const left = Math.max(0, st.endsAt - Date.now());
    const m = Math.ceil(left / 60000);
    b.textContent = m + 'm';
    btn.title = 'Se parará en ' + m + ' min';
  }

  function build() {
    const anchor = document.getElementById('btn-open-settings');
    if (!anchor || document.getElementById('cr-btn-sleep')) return;

    const mini = document.createElement('button');
    mini.className = 'btn-icon-pill';
    mini.id = 'cr-btn-mini';
    mini.type = 'button';
    mini.title = 'Mini reproductor (P)';
    mini.innerHTML = MINI;
    mini.addEventListener('click', () => { if (typeof window.toggleMiniWindow === 'function') window.toggleMiniWindow(); });

    btn = document.createElement('button');
    btn.className = 'btn-icon-pill cr-sleep-btn';
    btn.id = 'cr-btn-sleep';
    btn.type = 'button';
    btn.innerHTML = MOON + '<span class="cr-sleep-badge"></span>';
    btn.addEventListener('click', (e) => { e.stopPropagation(); if (pop.classList.contains('open')) close(); else open(); });

    anchor.parentNode.insertBefore(mini, anchor);
    anchor.parentNode.insertBefore(btn, anchor);

    pop = document.createElement('div');
    pop.id = 'cr-sleep-pop';
    pop.className = 'cr-pop';
    pop.innerHTML = '<div class="cr-pop-title">Temporizador de apagado</div>';
    OPTIONS.concat([['off', 'Desactivar']]).forEach(([v, label]) => {
      const it = document.createElement('button');
      it.type = 'button';
      it.className = 'cr-pop-item' + (v === 'off' ? ' is-danger' : '');
      it.dataset.v = v;
      it.textContent = label;
      it.addEventListener('click', () => {
        const p = pill(v);
        if (p) p.click();
        close();
        setTimeout(badge, 50);
        if (window.showToast) window.showToast(v === 'off' ? 'Temporizador desactivado' : (v === 'end' ? 'Cremo se parará al terminar la canción' : 'Cremo se parará en ' + label), 'info');
      });
      pop.appendChild(it);
    });
    document.body.appendChild(pop);
    document.addEventListener('click', (e) => { if (pop.classList.contains('open') && !pop.contains(e.target)) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    setInterval(badge, 1000);
    badge();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();

/* ---------- Copias de seguridad automáticas ---------- */
(function cremoBackups() {
  'use strict';
  const api = window.electronAPI || {};
  if (!api.cremoBackupInfo) return;
  const KEY = 'cremo_auto_backup'; // 'week' | 'day' | 'off'
  const EVERY = { day: 24 * 3600e3, week: 7 * 24 * 3600e3 };

  const fmt = (t) => {
    if (!t) return 'todavía ninguna';
    try { return new Date(t).toLocaleString('es', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }); } catch (_) { return new Date(t).toLocaleString(); }
  };

  async function refreshHint() {
    const h = document.querySelector('#cr-setting-backup .setting-hint');
    if (!h) return;
    const info = await api.cremoBackupInfo();
    h.textContent = 'Guarda tus playlists, Me gusta y ajustes en ' + info.dir + '. Última copia: ' + fmt(info.last) + '.';
  }

  async function autoBackup() {
    const mode = cremoLS.get(KEY, 'week');
    if (!EVERY[mode]) return;
    const info = await api.cremoBackupInfo();
    if (Date.now() - (info.last || 0) < EVERY[mode]) return;
    const r = await api.cremoBackupNow();
    if (r && r.ok) refreshHint();
  }

  function addSetting() {
    if (document.getElementById('cr-setting-backup')) return;
    const anchor = document.getElementById('export-all-playlists-item');
    if (!anchor) return;
    const row = cremoChoiceRow('cr-setting-backup', 'Copia de seguridad automática', ' ',
      [['week', 'Cada semana'], ['day', 'Cada día'], ['off', 'Nunca']],
      cremoLS.get(KEY, 'week'), (v) => { cremoLS.set(KEY, v); autoBackup(); },
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/></svg>');
    const actions = document.createElement('div');
    actions.className = 'cr-row-actions';
    [['Hacer copia ahora', async () => {
      const r = await api.cremoBackupNow();
      if (window.showToast) window.showToast(r && r.ok ? 'Copia de seguridad guardada' : 'No se pudo guardar la copia', r && r.ok ? 'success' : 'error');
      refreshHint();
    }], ['Abrir carpeta', () => api.cremoBackupOpenFolder()], ['Restaurar una copia…', async () => {
      const r = await api.cremoBackupRestore();
      if (r && r.error === 'invalid' && window.showToast) window.showToast('Ese archivo no es una copia de Cremo válida', 'error');
    }]].forEach(([label, fn]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn-pill-secondary cr-row-btn';
      b.textContent = label;
      b.addEventListener('click', fn);
      actions.appendChild(b);
    });
    row.appendChild(actions);
    anchor.parentNode.insertBefore(row, anchor);
    refreshHint();
  }

  const start = () => { addSetting(); setTimeout(autoBackup, 15000); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
  setInterval(autoBackup, 6 * 3600e3);
})();

/* ---------- Tu resumen: estadísticas de escucha ---------- */
(function cremoStats() {
  'use strict';
  const KEY = 'cremo_stats';
  const TICK = 5000;
  const PLAY_AFTER_MS = 30000; // a track counts as a play after 30 s

  const monthKey = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  const trackKey = (t) => ((t.artist || '') + '|' + (t.title || '')).toLowerCase().trim();
  const slim = (t) => ({ id: t.id, title: t.title, artist: t.artist, thumbnail: t.thumbnail, url: t.url, platform: t.platform, duration: t.duration, album: t.album });

  function load() {
    // v2: history seed counts each past play as a full listen (v1 seeded no time).
    try { const s = JSON.parse(cremoLS.get(KEY, '')); if (s && s.months && s.v === 2) return s; } catch (_) {}
    return { v: 2, months: {} };
  }
  let stats = load();
  let dirty = false;
  const save = () => { if (dirty) { cremoLS.set(KEY, JSON.stringify(stats)); dirty = false; } };

  function bucket(month) {
    if (!stats.months[month]) stats.months[month] = { ms: 0, plays: 0, tracks: {} };
    return stats.months[month];
  }

  function add(month, t, ms, play) {
    const k = trackKey(t);
    if (!k || k === '|') return;
    const b = bucket(month);
    const e = b.tracks[k] || (b.tracks[k] = { t: slim(t), p: 0, ms: 0 });
    e.t = slim(t);
    e.ms += ms;
    b.ms += ms;
    if (play) { e.p += 1; b.plays += 1; }
    dirty = true;
  }

  // First run: seed with the existing history (one full listen per entry).
  if (!Object.keys(stats.months).length) {
    try {
      const hist = (window.state && window.state.history) || JSON.parse(cremoLS.get('devsize_history', '[]'));
      (hist || []).forEach((t) => { if (t && t.title) add(monthKey(new Date(t.playedAt || Date.now())), t, Math.max(0, Number(t.duration) || 0) * 1000, true); });
      dirty = true;
      save();
    } catch (_) {}
  }

  let curKey = '';
  let curMs = 0;
  let counted = false;
  setInterval(() => {
    const st = window.state;
    const t = st && st.currentTrack;
    if (!t || !st.isPlaying) return;
    const k = trackKey(t);
    if (k !== curKey) { curKey = k; curMs = 0; counted = false; }
    curMs += TICK;
    const play = !counted && curMs >= PLAY_AFTER_MS;
    if (play) counted = true;
    add(monthKey(new Date()), t, TICK, play);
  }, TICK);
  setInterval(save, 30000);
  window.addEventListener('beforeunload', save);

  /* ----- the summary view (overlay) ----- */
  function aggregate(period) {
    const now = new Date();
    const months = period === 'month' ? [monthKey(now)] : Object.keys(stats.months);
    const tracks = {};
    const artists = {};
    let ms = 0;
    let plays = 0;
    months.forEach((m) => {
      const b = stats.months[m];
      if (!b) return;
      ms += b.ms;
      plays += b.plays;
      Object.entries(b.tracks).forEach(([k, e]) => {
        const x = tracks[k] || (tracks[k] = { t: e.t, p: 0, ms: 0 });
        x.p += e.p; x.ms += e.ms; x.t = e.t;
        String(e.t.artist || '').split(/\s*(?:,|&| feat\.? | ft\.? | x )\s*/i)[0].split('|').forEach((a) => {
          a = a.trim();
          if (!a) return;
          const y = artists[a.toLowerCase()] || (artists[a.toLowerCase()] = { name: a, p: 0, ms: 0, img: e.t.thumbnail });
          y.p += e.p; y.ms += e.ms;
        });
      });
    });
    const rank = (a, b) => (b.p - a.p) || (b.ms - a.ms);
    return {
      ms, plays,
      tracks: Object.values(tracks).sort(rank).slice(0, 5),
      artists: Object.values(artists).sort(rank).slice(0, 5),
      uniq: Object.keys(tracks).length
    };
  }

  const minutes = (ms) => Math.round(ms / 60000);
  const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many);
  let overlay = null;
  let period = 'month';

  function render() {
    const a = aggregate(period);
    const now = new Date();
    let monthName = '';
    try { monthName = now.toLocaleDateString('es', { month: 'long' }); } catch (_) {}
    const body = overlay.querySelector('.cr-sum-body');
    if (!a.plays && !a.ms) {
      body.innerHTML = '<div class="cr-sum-empty">Aún no hay escuchas en este periodo. Pon música y vuelve más tarde.</div>';
      return;
    }
    const trackRows = a.tracks.map((x, i) =>
      '<button type="button" class="cr-sum-row" data-i="' + i + '">' +
      '<span class="cr-sum-rank">' + (i + 1) + '</span>' +
      '<img src="' + cremoEsc(x.t.thumbnail || '') + '" alt="" onerror="this.style.visibility=\'hidden\'">' +
      '<span class="cr-sum-txt"><b>' + cremoEsc(x.t.title) + '</b><small>' + cremoEsc(x.t.artist) + '</small></span>' +
      '<span class="cr-sum-n">' + plural(x.p, 'vez', 'veces') + '</span></button>').join('');
    const artistRows = a.artists.map((x, i) =>
      '<button type="button" class="cr-sum-artist" data-a="' + cremoEsc(x.name) + '">' +
      '<img src="' + cremoEsc(x.img || '') + '" alt="" onerror="this.style.visibility=\'hidden\'">' +
      '<b>' + cremoEsc(x.name) + '</b><small>' + plural(x.p, 'escucha', 'escuchas') + '</small></button>').join('');
    body.innerHTML =
      '<div class="cr-sum-stats">' +
      '<div><b>' + minutes(a.ms).toLocaleString('es') + '</b><small>minutos escuchados</small></div>' +
      '<div><b>' + a.plays.toLocaleString('es') + '</b><small>reproducciones</small></div>' +
      '<div><b>' + a.uniq.toLocaleString('es') + '</b><small>canciones distintas</small></div></div>' +
      '<h3>Tus canciones ' + (period === 'month' ? 'de ' + monthName : 'más escuchadas') + '</h3>' +
      '<div class="cr-sum-list">' + trackRows + '</div>' +
      '<h3>Tus artistas</h3><div class="cr-sum-artists">' + artistRows + '</div>';
    body.querySelectorAll('.cr-sum-row').forEach((r) => r.addEventListener('click', () => {
      const list = a.tracks.map((x) => x.t);
      const i = Number(r.dataset.i);
      if (typeof window.playTrack === 'function') window.playTrack(list[i], list, i, 'summary');
    }));
    body.querySelectorAll('.cr-sum-artist').forEach((r) => r.addEventListener('click', () => {
      if (typeof window.openArtistProfile === 'function') { close(); window.openArtistProfile(r.dataset.a); }
    }));
  }

  function close() { if (overlay) overlay.classList.remove('open'); }

  window.cremoOpenSummary = function () {
    save();
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'cr-summary';
      overlay.className = 'cr-summary';
      overlay.innerHTML =
        '<div class="cr-sum-card" role="dialog" aria-label="Tu resumen">' +
        '<div class="cr-sum-head"><div><div class="cr-sum-kicker">Cremo</div><h2>Tu resumen</h2></div>' +
        '<div class="cr-sum-tabs"><button type="button" data-p="month" class="active">Este mes</button><button type="button" data-p="all">Siempre</button></div>' +
        '<button type="button" class="cr-sum-close" aria-label="Cerrar">✕</button></div>' +
        '<div class="cr-sum-body"></div></div>';
      overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
      overlay.querySelector('.cr-sum-close').addEventListener('click', close);
      overlay.querySelectorAll('.cr-sum-tabs button').forEach((b) => b.addEventListener('click', () => {
        period = b.dataset.p;
        overlay.querySelectorAll('.cr-sum-tabs button').forEach((x) => x.classList.toggle('active', x === b));
        render();
      }));
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
      document.body.appendChild(overlay);
    }
    render();
    requestAnimationFrame(() => overlay.classList.add('open'));
  };
})();

/* ---------- Más música: radio, podcasts y Audius ----------
   Server side lives in src/server/cremo-sources.js. Tracks from there have ids
   like "cr-radio:…", so the normal player plays them (and they can go to
   Me gusta, playlists and history like any other song). */
(function cremoMoreMusic() {
  'use strict';
  const st = () => window.state || {};
  const api = async (path, params) => {
    const qs = new URLSearchParams(params || {}).toString();
    const r = await fetch(`http://127.0.0.1:${st().serverPort}${path}${qs ? '?' + qs : ''}`);
    const d = await r.json();
    if (!d || !d.success) throw new Error((d && d.error) || 'error');
    return d.items;
  };

  const RADIO_ICON = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" rx="20" fill="#2a1416"/>' +
    '<g fill="none" stroke="#ff6b6b" stroke-width="5" stroke-linecap="round"><path d="M30 34a25 25 0 0 0 0 28M66 34a25 25 0 0 1 0 28M22 26a37 37 0 0 0 0 44M74 26a37 37 0 0 1 0 44"/></g>' +
    '<circle cx="48" cy="48" r="7" fill="#ff6b6b"/></svg>');
  const fixRadio = (t) => { if (!t.thumbnail) t.thumbnail = RADIO_ICON; return t; };

  const ICON = {
    radio: '<svg class="sp-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7.8 16.2a6 6 0 0 1 0-8.4M16.2 7.8a6 6 0 0 1 0 8.4M4.9 19.1a10 10 0 0 1 0-14.2M19.1 4.9a10 10 0 0 1 0 14.2"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>',
    pod: '<svg class="sp-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8"/></svg>',
    indie: '<svg class="sp-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>'
  };

  function play(track, list, ctx) {
    if (typeof window.playTrack !== 'function') return;
    const idx = Math.max(0, list.indexOf(track));
    window.playTrack(track, list, idx, ctx || 'playlist');
  }

  /* ---- shared card ---- */
  function card({ cover, title, sub, badge, round, contain, onClick }) {
    const c = document.createElement('div');
    c.className = 'sp-card cr-src-card' + (contain ? ' cr-contain' : '') + (round ? ' cr-round' : '');
    c.innerHTML = '<div class="sp-card-cover"><img alt="" loading="lazy" draggable="false"></div>' +
      (badge ? '<span class="cr-live">' + cremoEsc(badge) + '</span>' : '') +
      '<div class="sp-card-title sp-fade"></div><div class="sp-card-sub sp-fade"></div>';
    const img = c.querySelector('img');
    img.addEventListener('error', () => { img.src = RADIO_ICON; c.classList.add('cr-contain'); }, { once: true });
    img.src = cover || RADIO_ICON;
    c.querySelector('.sp-card-title').textContent = title || '';
    c.querySelector('.sp-card-sub').textContent = sub || '';
    c.addEventListener('click', onClick);
    return c;
  }

  function fillRow(row, items, make, emptyText) {
    row.innerHTML = '';
    if (!items || !items.length) {
      row.innerHTML = '<div class="cr-src-empty">' + cremoEsc(emptyText) + '</div>';
      return;
    }
    items.forEach((it) => row.appendChild(make(it, items)));
    row.scrollLeft = 0;
  }
  const loadingRow = (row) => { row.innerHTML = '<div class="cr-src-empty">Cargando…</div>'; };

  const radioCard = (t, list) => card({ cover: t.thumbnail, title: t.title, sub: t.artist, badge: 'EN VIVO', contain: true, onClick: () => play(fixRadio(t), [fixRadio(t)]) });
  const trackCard = (t, list) => card({ cover: t.thumbnail, title: t.title, sub: t.artist, onClick: () => play(t, list) });
  const podCard = (p) => card({ cover: p.cover, title: p.title, sub: p.author, onClick: () => openPodcast(p) });

  /* ---- Explorar sections ---- */
  const RADIO_TAGS = [
    ['Cerca de ti', { country: 'local' }], ['Lo-fi', { tag: 'lofi' }], ['Pop', { tag: 'pop' }], ['Rock', { tag: 'rock' }],
    ['Jazz', { tag: 'jazz' }], ['Electrónica', { tag: 'electronic' }], ['Clásica', { tag: 'classical' }], ['Noticias', { tag: 'news' }]
  ];

  function section(id, icon, title, extraHead) {
    const sec = document.createElement('section');
    sec.className = 'sp-section cr-src-sec';
    sec.id = id;
    sec.innerHTML = '<h2>' + icon + '<span>' + cremoEsc(title) + '</span></h2>' + (extraHead || '') + '<div class="sp-row"></div>';
    // Upstream makes every Explorar header open its own "show all" page; ours have none.
    sec.addEventListener('click', (e) => { if (e.target.closest('.sp-sec-head, h2')) e.stopPropagation(); }, true);
    const row = sec.querySelector('.sp-row');
    if (typeof window.bindHorizontalWheel === 'function') window.bindHorizontalWheel(row);
    return sec;
  }

  async function loadRadio(row, params) {
    loadingRow(row);
    try { fillRow(row, (await api('/api/cremo-radio', { limit: 24, ...params })).map(fixRadio), radioCard, 'No hay emisoras para esto ahora mismo.'); }
    catch (_) { fillRow(row, [], radioCard, 'No se pudo cargar la radio. Revisa tu conexión.'); }
  }

  function buildSections() {
    const home = document.getElementById('sp-home');
    if (!home || document.getElementById('cr-radio-sec')) return;
    const anchor = document.getElementById('sp-artists-sec');

    const chips = '<div class="cr-src-chips">' + RADIO_TAGS.map(([label], i) =>
      '<button type="button" class="cr-src-chip' + (i === 0 ? ' active' : '') + '" data-i="' + i + '">' + cremoEsc(label) + '</button>').join('') + '</div>';
    const radioSec = section('cr-radio-sec', ICON.radio, 'Radio en vivo', chips);
    const podSec = section('cr-pod-sec', ICON.pod, 'Podcasts populares');
    const indieSec = section('cr-indie-sec', ICON.indie, 'Música independiente');
    indieSec.querySelector('h2').insertAdjacentHTML('beforeend', '<small class="cr-src-note">de Audius</small>');

    [radioSec, podSec, indieSec].forEach((s) => home.insertBefore(s, anchor && anchor.parentNode === home ? anchor : null));

    const radioRow = radioSec.querySelector('.sp-row');
    radioSec.querySelectorAll('.cr-src-chip').forEach((b) => b.addEventListener('click', () => {
      radioSec.querySelectorAll('.cr-src-chip').forEach((x) => x.classList.toggle('active', x === b));
      loadRadio(radioRow, RADIO_TAGS[Number(b.dataset.i)][1]);
    }));
    loadRadio(radioRow, RADIO_TAGS[0][1]);

    const podRow = podSec.querySelector('.sp-row');
    loadingRow(podRow);
    api('/api/cremo-podcasts', { limit: 24 })
      .then((items) => fillRow(podRow, items, podCard, 'No hay podcasts ahora mismo.'))
      .catch(() => fillRow(podRow, [], podCard, 'No se pudieron cargar los podcasts.'));

    const indieRow = indieSec.querySelector('.sp-row');
    loadingRow(indieRow);
    api('/api/cremo-audius', { limit: 24 })
      .then((items) => fillRow(indieRow, items, trackCard, 'No hay canciones ahora mismo.'))
      .catch(() => fillRow(indieRow, [], trackCard, 'No se pudo cargar Audius.'));
  }

  /* ---- Podcast sheet ---- */
  let sheet = null;
  const fmtDate = (ms) => (ms ? new Date(ms).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
  const fmtDur = (s) => { s = Math.round(s || 0); if (!s) return ''; const h = Math.floor(s / 3600), m = Math.round((s % 3600) / 60); return h ? h + ' h ' + m + ' min' : m + ' min'; };

  function closeSheet() { if (sheet) sheet.classList.remove('open'); }
  async function openPodcast(p) {
    if (!sheet) {
      sheet = document.createElement('div');
      sheet.className = 'cr-summary cr-pod-sheet';
      sheet.id = 'cr-podcast';
      sheet.addEventListener('click', (e) => { if (e.target === sheet) closeSheet(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });
      document.body.appendChild(sheet);
    }
    sheet.innerHTML = '<div class="cr-sum-card"><div class="cr-pod-head"><img class="cr-pod-cover" alt=""><div class="cr-pod-meta">' +
      '<span class="cr-sum-kicker">Podcast</span><h2></h2><span class="cr-pod-author"></span><p class="cr-pod-desc"></p>' +
      '<div class="cr-pod-actions"><button type="button" class="cr-pod-play" disabled>Reproducir el último</button></div></div>' +
      '<button type="button" class="cr-sum-close" aria-label="Cerrar">✕</button></div><div class="cr-pod-list"><div class="cr-sum-empty">Cargando episodios…</div></div></div>';
    sheet.querySelector('.cr-sum-close').addEventListener('click', closeSheet);
    const cover = sheet.querySelector('.cr-pod-cover');
    cover.src = p.cover || RADIO_ICON;
    sheet.querySelector('h2').textContent = p.title || '';
    sheet.querySelector('.cr-pod-author').textContent = p.author || '';
    requestAnimationFrame(() => sheet.classList.add('open'));

    const list = sheet.querySelector('.cr-pod-list');
    let data;
    try { data = await api('/api/cremo-podcast-episodes', { id: p.id || '', feed: p.feed || '' }); }
    catch (_) { list.innerHTML = '<div class="cr-sum-empty">No se pudieron cargar los episodios de este podcast.</div>'; return; }
    const eps = data.episodes || [];
    if (data.show) {
      if (!p.cover && data.show.cover) cover.src = data.show.cover;
      sheet.querySelector('.cr-pod-desc').textContent = data.show.description || '';
    }
    if (!eps.length) { list.innerHTML = '<div class="cr-sum-empty">Este podcast no tiene episodios de audio.</div>'; return; }
    list.innerHTML = '';
    eps.forEach((ep) => {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'cr-pod-ep';
      row.innerHTML = '<span class="cr-pod-ep-play"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M7 4v16l13-8z"/></svg></span>' +
        '<span class="cr-pod-ep-txt"><b></b><small></small><em></em></span>';
      row.querySelector('b').textContent = ep.title;
      row.querySelector('small').textContent = [fmtDate(ep.publishedAt), fmtDur(ep.duration)].filter(Boolean).join(' · ');
      row.querySelector('em').textContent = ep.description || '';
      row.addEventListener('click', () => { play(ep, eps); closeSheet(); });
      list.appendChild(row);
    });
    const playBtn = sheet.querySelector('.cr-pod-play');
    playBtn.disabled = false;
    playBtn.addEventListener('click', () => { play(eps[0], eps); closeSheet(); });
  }
  window.cremoOpenPodcast = openPodcast;

  /* ---- Search: extra sections under upstream's results ---- */
  function searchSection(title, note, items, render) {
    const sec = document.createElement('div');
    sec.className = 'search-albums-section cr-src-search';
    sec.innerHTML = '<div class="section-sub-header"><h3></h3>' + (note ? '<small class="cr-src-note"></small>' : '') + '</div><div class="search-albums-row sp-row"></div>';
    sec.querySelector('h3').textContent = title;
    if (note) sec.querySelector('.cr-src-note').textContent = note;
    const row = sec.querySelector('.search-albums-row');
    items.forEach((it) => row.appendChild(render(it, items)));
    if (typeof window.bindHorizontalWheel === 'function') window.bindHorizontalWheel(row);
    return sec;
  }

  let lastToken = 0;
  async function onSearch() {
    const s = st();
    const token = s.searchToken || 0;
    if (!token || token === lastToken) return;
    lastToken = token;
    const q = String(s.searchQuery || '').trim();
    let box = document.getElementById('cr-search-extra');
    const tracks = document.getElementById('search-tracks-list');
    if (!box && tracks) {
      box = document.createElement('div');
      box.id = 'cr-search-extra';
      tracks.parentNode.insertBefore(box, tracks);
    }
    if (!box) return;
    box.innerHTML = '';
    if (q.length < 2) return;
    const [radio, pods, indie] = await Promise.all([
      api('/api/cremo-radio', { q, limit: 16 }).catch(() => []),
      api('/api/cremo-podcasts', { q, limit: 16 }).catch(() => []),
      api('/api/cremo-audius', { q, limit: 16 }).catch(() => [])
    ]);
    if (lastToken !== token) return;
    if (radio.length) box.appendChild(searchSection('Emisoras de radio', '', radio.map(fixRadio), radioCard));
    if (pods.length) box.appendChild(searchSection('Podcasts', '', pods, podCard));
    if (indie.length) box.appendChild(searchSection('Música independiente', 'de Audius', indie, trackCard));
  }

  function start() {
    buildSections();
    // Upstream may rebuild parts of Explorar; put the sections back if they go missing.
    setInterval(() => { if (st().currentView === 'discover') buildSections(); onSearch(); }, 500);
    const chips = document.getElementById('search-filter-chips');
    if (chips) chips.addEventListener('click', (e) => {
      const b = e.target.closest('.search-chip');
      const box = document.getElementById('cr-search-extra');
      if (b && box) box.hidden = (b.dataset.filter || 'all') !== 'all';
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
