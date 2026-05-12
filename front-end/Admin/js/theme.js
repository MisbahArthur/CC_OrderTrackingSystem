export function initTheme() {
  ui('mode', 'auto');
  ui('theme', '#f3d998');
  updateThemeIcon(ui('mode'));
}

export function toggleTheme() {
  const current = ui('mode');
  const next = current === 'dark' ? 'light' : 'dark';
  ui('mode', next);
  updateThemeIcon(next);
}

function updateThemeIcon(mode) {
  const icon = mode === 'dark' ? 'dark_mode' : 'light_mode';
  document.querySelectorAll('#btn-theme i, #btn-theme-mobile i').forEach(el => el.textContent = icon);
}
