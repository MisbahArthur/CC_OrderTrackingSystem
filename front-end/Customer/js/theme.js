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
    toggle.addEventListener('click', () => {
      const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
      applyMode(next);
      localStorage.setItem(STORAGE_KEY, next);
    });
  }
}

function applyMode(mode) {
  if (mode === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  syncToggle(mode);
}

function syncToggle(mode) {
  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    const icon = toggle.querySelector('i');
    if (icon) {
      icon.className = mode === 'dark' ? 'ph ph-sun text-lg' : 'ph ph-moon text-lg';
    }
  }
}
