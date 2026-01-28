(function () {
  const root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
  }

  function getPreferredTheme() {
    const saved = localStorage.getItem("simhealth-theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }

  function toggleTheme() {
    const current = root.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem("simhealth-theme", next);
  }
.lang-toggle {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
  user-select: none;
}

.lang-toggle a {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.2px;
  padding: 6px 10px;
  border-radius: 999px;
  text-decoration: none;
  color: var(--muted);
  transition: background var(--t-fast) var(--ease), color var(--t-fast) var(--ease), transform var(--t-fast) var(--ease);
}

.lang-toggle a:hover {
  background: color-mix(in srgb, var(--text) 6%, transparent);
  color: var(--text);
}

.lang-toggle a:active { transform: translateY(1px); }

.lang-toggle a.active {
  background: color-mix(in srgb, var(--primary) 22%, transparent);
  color: var(--text);
  border: 1px solid color-mix(in srgb, var(--primary) 40%, transparent);
}

  applyTheme(getPreferredTheme());

  window.SimHealthTheme = { toggleTheme };
})();
