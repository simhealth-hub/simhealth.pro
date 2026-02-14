(function () {
  const root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
  }

  function getPreferredTheme() {
    const saved = localStorage.getItem("simhealth-theme");
    if (saved === "light" || saved === "dark") return saved;

    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }

  function toggleTheme() {
    const current = root.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem("simhealth-theme", next);
  }

  applyTheme(getPreferredTheme());
  window.SimHealthTheme = { toggleTheme };
})();
window.SimHealthNav = {
  toggleMenu() {
    const menu = document.querySelector('.nav .menu');
    if (!menu) return;
    menu.classList.toggle('open');
  }
};
