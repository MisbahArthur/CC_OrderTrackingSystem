const STORAGE_KEY = 'cc-theme';

export function initTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  let mode;
  if (stored === 'dark' || stored === 'light') {
    mode = stored;
  } else {
    mode = prefersDark ? 'dark' : 'light';
  }

  applyMode(mode);
  syncToggle(mode);

  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('change', (e) => {
      const next = e.target.checked ? 'dark' : 'light';
      applyMode(next);
      localStorage.setItem(STORAGE_KEY, next);
    });
  }
}

function applyMode(mode) {
  if (typeof ui !== 'undefined') {
    ui('mode', mode);
  } else {
    document.body.className = mode;
  }
}

function syncToggle(mode) {
  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    const input = toggle.querySelector('input');
    if (input) {
      input.checked = mode === 'dark';
    }
  }
}
