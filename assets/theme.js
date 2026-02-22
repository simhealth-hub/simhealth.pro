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

  applyTheme(getPreferredTheme());

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

  document.addEventListener("click", (e) => {
    const menu = getMenu();
    const btn = getToggleButton();
    if (!menu || !btn) return;
    if (!menu.classList.contains(MENU_OPEN_CLASS)) return;

    const clickedInsideMenu = menu.contains(e.target);
    const clickedButton = btn.contains(e.target);

    if (!clickedInsideMenu && !clickedButton) closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const menu = getMenu();
    if (menu && menu.classList.contains(MENU_OPEN_CLASS)) closeMenu();
  });

  document.addEventListener("click", (e) => {
    const a = e.target && e.target.closest ? e.target.closest(".nav .menu a") : null;
    if (!a) return;
    closeMenu();
  });

  setExpanded(false);

  window.SimHealthNav = { toggleMenu, openMenu, closeMenu };

  // --- MOBILE CRISIS BAR -------------------------------------

  function shouldHideCrisisByPath_() {
    const path = (location.pathname || "").toLowerCase();

    // Hide on all legal pages + sitemap (and french sitemap if you use it)
    if (path.includes("/legal/")) return true;
    if (path.endsWith("/sitemap.html") || path.includes("/sitemap")) return true;
    if (path.includes("/plan-du-site")) return true;

    return false;
  }

  function initCrisisBar() {
    const bar = document.querySelector(".mobile-crisis");
    if (!bar) return;

    // Auto-hide by route
    if (shouldHideCrisisByPath_()) {
      document.body.setAttribute("data-hide-crisis", "true");
      return;
    }

    const footer =
      document.getElementById("site-footer") ||
      document.querySelector("footer");

    if (!footer) return;

    const MQ = window.matchMedia("(max-width: 900px)");

    function resetLift() {
      bar.style.transform = "translateY(0)";
    }

    function applyLiftPx(px) {
      bar.style.transform = px > 0 ? `translateY(-${px}px)` : "translateY(0)";
    }

    function calcLift() {
      if (!MQ.matches) {
        resetLift();
        return;
      }

      const barRect = bar.getBoundingClientRect();
      const footerRect = footer.getBoundingClientRect();

      // If footer isn't on screen, no lift needed
      if (footerRect.top >= window.innerHeight) {
        resetLift();
        return;
      }

      // overlap amount (positive means bar covers footer)
      const overlap = barRect.bottom - footerRect.top;

      // add breathing room
      const lift = Math.max(0, overlap + 12);

      applyLiftPx(lift);
    }

    // Best: observer to trigger recalculation when footer appears
    if ("IntersectionObserver" in window) {
      const obs = new IntersectionObserver(
        () => calcLift(),
        { threshold: 0.01 }
      );
      obs.observe(footer);

      // keep stable if user scrolls while footer is visible
      window.addEventListener("scroll", () => requestAnimationFrame(calcLift), { passive: true });
      window.addEventListener("resize", () => requestAnimationFrame(calcLift));
      MQ.addEventListener?.("change", () => requestAnimationFrame(calcLift));

      // initial
      requestAnimationFrame(calcLift);
      return;
    }

    // Fallback: scroll/resize only
    let ticking = false;
    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        calcLift();
      });
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    MQ.addEventListener?.("change", requestUpdate);
    requestAnimationFrame(calcLift);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCrisisBar);
  } else {
    initCrisisBar();
  }
})();
