// Cremo additions on top of the Riff renderer:
//  1. The sidebar logo takes you back to the home view.
//  2. A hand-written Spanish dictionary that also covers UI drawn after
//     startup (Riff only translates the DOM once, at boot).
'use strict';

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
  if ((localStorage.getItem('riff_ui_lang') || 'en') !== 'es') return;

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
    'Remove from Riff': 'Quitar de Cremo',
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

  // Share with Riff's own translator so t() and its boot pass use these too.
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

  // The expanded "Tu biblioteca" panel is gone: keep the rail collapsed.
  const keepCollapsed = () => {
    if (body.classList.contains('sidebar-expanded') && typeof window.applySidebarWidth === 'function') {
      window.applySidebarWidth(84, true);
    }
  };
  new MutationObserver(keepCollapsed).observe(body, { attributes: true, attributeFilter: ['class'] });
  keepCollapsed();
  window.addEventListener('load', keepCollapsed);

  const isEs = (localStorage.getItem('riff_ui_lang') || 'en') === 'es';
  const LABELS = isEs ? {
    'cremo-home-logo': 'Inicio',
    'nav-discover': 'Explorar',
    'nav-favorites': 'Me gusta',
    'nav-albums': 'Álbumes',
    'nav-local': 'Biblioteca',
    'nav-queue': 'Cola',
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
  const isEs = (localStorage.getItem('riff_ui_lang') || 'en') === 'es';
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
        // Keep Riff's own accent (visualizer, generated covers) in step.
        localStorage.setItem('riff_theme_accent', color);
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
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'
  };
  const click = (id) => { const b = document.getElementById(id); if (b) b.click(); };
  const ACTIONS = [
    { key: 'radio', label: 'Radio para ti', primary: true, run: () => click('btn-play-my-wave') },
    { key: 'shuffle', label: 'Mezclar Me gusta', run: () => click('btn-shuffle-favorites') },
    { key: 'heart', label: 'Me gusta', run: () => click('nav-favorites') },
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
   categories, hides Riff-only / duplicated rows and fixes labels.
   Idempotent: runs at startup and every time a settings category opens. */
(function cremoSettings() {
  'use strict';
  const ES = (localStorage.getItem('riff_ui_lang') || 'en') === 'es';
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
      [t('Secciones', 'Sections'), ['[data-adv="my_wave"]', '[data-adv="jump_back"]', '[data-adv="fav_artists"]', '[data-adv="my_wave_ambient"]', '#btn-reset-sidebar-order']],
      [t('Recomendaciones', 'Recommendations'), ['#btn-reset-recommendations']]
    ]]
  ];

  // Rows that only made sense in Riff, or that are duplicated elsewhere.
  const HIDE = [
    '#account-promocode-input',                       // Riff's promo codes
    '#btn-acc-export-rfacc', '#btn-acc-import-rfacc', // also in Almacenamiento
    '[data-adv="classic_sidebar"]',                   // breaks Cremo's rail
    '#btn-show-local', '#btn-show-albums',            // tabs Cremo's rail replaces
    '[data-adv="albums"]',
    '#btn-toggle-riff-home'                           // old Riff home layout (hides Explorar)
  ];

  // Mesh gradient rows live in Avanzado; Tema already has the mesh brightness.
  const TO_THEME = ['[data-adv="mesh_gradient"]', '[data-adv="mesh_follow_intensity"]', '[data-adv="mesh_cover_color"]'];

  const NAMES = ES ? {
    '#btn-disable-animations': 'Desactivar animaciones',
    '#btn-setting-riff-home-icon': 'Logo de Cremo en el botón Inicio',
    '#btn-riff-library': 'Búsqueda combinada',
    '#btn-riff-library-streaming': 'Reproducción híbrida (búsqueda combinada)',
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
    '[data-adv="my_wave_ambient"]': 'Luz ambiental',
    '[data-adv="mesh_follow_intensity"]': 'La malla sigue la intensidad del tema',
    '[data-adv="mesh_cover_color"]': 'Color de la malla según la portada',
    '[data-adv="ui_alpha_auto"]': 'Menor opacidad de la interfaz con fondos'
  } : {
    '#btn-setting-riff-home-icon': 'Cremo logo on Home button',
    '#btn-riff-library': 'Combined search',
    '#btn-riff-library-streaming': 'Hybrid streaming (combined search)'
  };
  const HINTS = ES ? {
    '#btn-disable-animations': 'Consume menos CPU y GPU y responde más rápido, pero sin animaciones suaves.',
    '#btn-riff-library': 'Junta YouTube Music y SoundCloud en una sola fuente de búsqueda'
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

    // The sidebar-order column lists Riff's old rail buttons (Álbumes, Cola,
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
