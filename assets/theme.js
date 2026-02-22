/***************************************
 * SimHealth — theme.js
 * - Theme (dark/light) with OS sync
 * - Mobile nav open/close + a11y
 * - Mobile crisis bar: lifts when footer is visible
 *
 * REQUIREMENTS IN HTML:
 * - Crisis bar element: <div class="mobile-crisis">...</div>
 * - Footer element: <footer id="site-footer">...</footer>
 ***************************************/

(function () {
  "use strict";

  const root = document.documentElement;
  const STORAGE_KEY = "simhealth-theme";
  const MENU_OPEN_CLASS = "open";

  // =========================
  // THEME
  // =========================

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
  }

  function getSavedTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === "light" || saved === "dark" ? saved : null;
    } catch (_) {
      return null;
    }
  }

  function getSystemTheme() {
    try {
      return window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
    } catch (_) {
      return "dark";
    }
  }

  function getPreferredTheme() {
    return getSavedTheme() || getSystemTheme();
  }

  function toggleTheme() {
    const current = root.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch (_) {}
  }

  // Apply immediately to reduce theme flash
  applyTheme(getPreferredTheme());

  // If user hasn't explicitly set a theme, follow OS changes
  try {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const handler = () => {
      if (!getSavedTheme()) applyTheme(getSystemTheme());
    };

    if (mq && typeof mq.addEventListener === "function") mq.addEventListener("change", handler);
    else if (mq && typeof mq.addListener === "function") mq.addListener(handler);
  } catch (_) {}

  window.SimHealthTheme = { toggleTheme };

  // =========================
  // NAV / MOBILE MENU
  // =========================

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

  // Close when a link inside the menu is clicked
  document.addEventListener("click", (e) => {
    const a = e.target && e.target.closest ? e.target.closest(".nav .menu a") : null;
    if (!a) return;
    closeMenu();
  });

  // Init aria-expanded correctly on load
  setExpanded(false);

  window.SimHealthNav = { toggleMenu, openMenu, closeMenu };

  // =========================
  // MOBILE CRISIS BAR — MOVE UP WHEN FOOTER APPEARS
  // Uses IntersectionObserver; falls back to scroll math.
  // =========================

  function initCrisisFooterAvoidance() {
    const bar = document.querySelector(".mobile-crisis");
    const footer = document.getElementById("site-footer") || document.querySelector("footer");
    if (!bar || !footer) return;

    const MQ = window.matchMedia("(max-width: 900px)");

    function setBottom(px) {
      // Your CSS sets bottom: 64px; we override only when needed
      bar.style.bottom = px;
      // Ensure any old transform-based code doesn't interfere
      bar.style.transform = "translateY(0)";
    }

    function resetDesktop() {
      bar.style.bottom = "";
      bar.style.transform = "translateY(0)";
    }

    // Prefer IntersectionObserver (more reliable and cheaper)
    if ("IntersectionObserver" in window) {
      const obs = new IntersectionObserver(
        (entries) => {
          // If footer intersects viewport, lift the bar
          const visible = entries && entries[0] ? entries[0].isIntersecting : false;

          if (!MQ.matches) {
            resetDesktop();
            return;
          }

          if (visible) setBottom("140px"); // lift amount (adjust if you want)
          else setBottom("64px");          // default mobile bottom
        },
        { threshold: 0.01 }
      );

      obs.observe(footer);

      // Also respond to breakpoint changes
      const onMq = () => {
        if (!MQ.matches) resetDesktop();
        else setBottom("64px");
      };
      if (typeof MQ.addEventListener === "function") MQ.addEventListener("change", onMq);
      else if (typeof MQ.addListener === "function") MQ.addListener(onMq);

      // Initial
      onMq();
      return;
    }

    // Fallback (no IntersectionObserver): scroll math
    let ticking = false;

    function update() {
      ticking = false;

      if (!MQ.matches) {
        resetDesktop();
        return;
      }

      // If footer enters viewport, lift
      const footerTop = footer.getBoundingClientRect().top;
      const viewportH = window.innerHeight;

      if (footerTop < viewportH) setBottom("140px");
      else setBottom("64px");
    }

    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    setTimeout(update, 0);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    if (typeof MQ.addEventListener === "function") MQ.addEventListener("change", requestUpdate);
    else if (typeof MQ.addListener === "function") MQ.addListener(requestUpdate);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCrisisFooterAvoidance);
  } else {
    initCrisisFooterAvoidance();
  }

})();
