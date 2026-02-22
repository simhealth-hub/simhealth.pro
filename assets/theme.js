(function () {
  const root = document.documentElement;
  const STORAGE_KEY = "simhealth-theme";
  const MENU_OPEN_CLASS = "open";

  // --- THEME -------------------------------------------------

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
  }

  function getSavedTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : null;
  }

  function getSystemTheme() {
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }

  function getPreferredTheme() {
    return getSavedTheme() || getSystemTheme();
  }

  function toggleTheme() {
    const current = root.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  // Apply immediately to reduce theme flash
  applyTheme(getPreferredTheme());

  // If user hasn't explicitly set a theme, follow OS changes
  try {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    if (mq && typeof mq.addEventListener === "function") {
      mq.addEventListener("change", () => {
        if (!getSavedTheme()) applyTheme(getSystemTheme());
      });
    } else if (mq && typeof mq.addListener === "function") {
      mq.addListener(() => {
        if (!getSavedTheme()) applyTheme(getSystemTheme());
      });
    }
  } catch (_) {}

  window.SimHealthTheme = { toggleTheme };

  // --- NAV / MOBILE MENU -------------------------------------

  function getMenu() {
    return document.querySelector(".nav .menu");
  }

  function getToggleButton() {
    return document.querySelector(".nav .nav-toggle");
  }

  function setExpanded(isOpen) {
    const btn = getToggleButton();
    if (!btn) return;
    btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }

  function openMenu() {
    const menu = getMenu();
    if (!menu) return;
    menu.classList.add(MENU_OPEN_CLASS);
    setExpanded(true);
  }

  function closeMenu() {
    const menu = getMenu();
    if (!menu) return;
    menu.classList.remove(MENU_OPEN_CLASS);
    setExpanded(false);
  }

  function toggleMenu() {
    const menu = getMenu();
    if (!menu) return;

    const willOpen = !menu.classList.contains(MENU_OPEN_CLASS);
    if (willOpen) openMenu();
    else closeMenu();
  }

  // Close on outside click (mobile drawer)
  document.addEventListener("click", (e) => {
    const menu = getMenu();
    const btn = getToggleButton();
    if (!menu || !btn) return;

    if (!menu.classList.contains(MENU_OPEN_CLASS)) return;

    const clickedInsideMenu = menu.contains(e.target);
    const clickedButton = btn.contains(e.target);

    if (!clickedInsideMenu && !clickedButton) closeMenu();
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const menu = getMenu();
    if (menu && menu.classList.contains(MENU_OPEN_CLASS)) closeMenu();
  });

  // Close when a link inside the menu is clicked (navigating away)
  document.addEventListener("click", (e) => {
    const a = e.target && e.target.closest ? e.target.closest(".nav .menu a") : null;
    if (!a) return;
    closeMenu();
  });

  // Init aria-expanded correctly on load
  setExpanded(false);

  window.SimHealthNav = { toggleMenu, openMenu, closeMenu };

  // --- MOBILE CRISIS BAR: LIFT ABOVE FOOTER ------------------

  function initCrisisFooterAvoidance() {
    const bar = document.querySelector(".mobile-crisis");
    const footer = document.querySelector("footer");
    if (!bar || !footer) return;

    function update() {
      // Desktop/tablet: no lift needed
      if (window.innerWidth > 900) {
        root.style.setProperty("--crisis-lift", "0px");
        return;
      }

      const barRect = bar.getBoundingClientRect();
      const footerRect = footer.getBoundingClientRect();

      // Footer not on screen yet
      if (footerRect.top >= window.innerHeight) {
        root.style.setProperty("--crisis-lift", "0px");
        return;
      }

      // If bar overlaps footer, lift it up
      const overlap = barRect.bottom - footerRect.top;
      const lift = Math.max(0, overlap + 12); // +12px breathing room
      root.style.setProperty("--crisis-lift", lift + "px");
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCrisisFooterAvoidance);
  } else {
    initCrisisFooterAvoidance();
  }
}
