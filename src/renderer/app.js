
'use strict';

window.__getDpr = () => window.devicePixelRatio || 1;

function dismissBootSkeleton() {
  const s = document.getElementById('boot-skeleton');
  if (!s || s.classList.contains('hide')) return;
  s.classList.add('hide');
  setTimeout(() => s.remove(), 180);
}
setTimeout(dismissBootSkeleton, 600);

var homeNextToSearch = localStorage.getItem('cremo_home_next_to_search') !== '0';
document.body.classList.toggle('home-next-to-search', homeNextToSearch);

document.addEventListener('DOMContentLoaded', async () => {
  const runDeferredStartup = () => {
    if (runDeferredStartup._ran) return;
    runDeferredStartup._ran = true;
    if (typeof init10BandEqUI === 'function') init10BandEqUI();
    if (typeof syncSettingsSlidersToState === 'function') syncSettingsSlidersToState();
    if (typeof updateHqRouting === 'function') updateHqRouting();
    if (typeof renderPresets === 'function') renderPresets();
    if (typeof initHqSliders === 'function') initHqSliders();
    if (typeof loadPlugins === 'function') loadPlugins();
    if (typeof fetchPersonalVibe === 'function') fetchPersonalVibe();
    if (typeof loadCustomThemes === 'function') loadCustomThemes();
    if (typeof checkToolsStatus === 'function') checkToolsStatus(false);
  };

  if (window.__cremoSplashDone) {
    setTimeout(runDeferredStartup, 50);
  } else {
    window.addEventListener('cremo-splash-done', () => setTimeout(runDeferredStartup, 40), { once: true });
    setTimeout(runDeferredStartup, 1000);
  }

  requestAnimationFrame(() => {
    document.body.classList.remove('app-skeleton-boot');
    dismissBootSkeleton();
    window.__cremoSplashDone = true;
    window.dispatchEvent(new CustomEvent('cremo-splash-done'));
  });
});

document.addEventListener('DOMContentLoaded', () => {
  // Cremo: open on the screen chosen in Ajustes → Interfaz → Pantalla al abrir
  // (Explorar by default; see cremo.js).
  if (typeof window.cremoOpenStartView === 'function') window.cremoOpenStartView();
  else if (typeof switchView === 'function') switchView('discover');

  if (typeof deduplicateSidebarNavIcons === 'function') deduplicateSidebarNavIcons();

  const btnCollapseRightPanel = document.getElementById('btn-collapse-right-panel');
  const rightPanel = document.getElementById('right-panel');
  if (btnCollapseRightPanel && rightPanel) {
    btnCollapseRightPanel.addEventListener('click', () => {
      rightPanel.classList.toggle('is-collapsed');
    });
  }
});
