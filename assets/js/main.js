(function () {
  "use strict";

  const STORAGE_KEY = "lang";
  const LEGACY_KEY = "portfolio-lang";

  function migrateLangStorage() {
    if (
      !localStorage.getItem(STORAGE_KEY) &&
      localStorage.getItem(LEGACY_KEY)
    ) {
      localStorage.setItem(STORAGE_KEY, localStorage.getItem(LEGACY_KEY) || "");
      localStorage.removeItem(LEGACY_KEY);
    }
  }

  function initLangToggle() {
    document.querySelectorAll("[data-lang-switch]").forEach((el) => {
      el.addEventListener("click", () => {
        const lang = el.dataset.langSwitch;
        if (lang) localStorage.setItem(STORAGE_KEY, lang);
      });
    });
  }

  function initNavReveal() {
    const hero = document.getElementById("hero");
    const nav = document.getElementById("site-nav");
    if (!hero || !nav) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          nav.classList.toggle("site-nav--visible", !entry.isIntersecting);
        });
      },
      { threshold: 0.12, rootMargin: "-8px 0px 0px 0px" },
    );
    io.observe(hero);
  }

  function initScrollReveal() {
    const els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );
    els.forEach((el) => io.observe(el));
  }

  function initSmoothNav() {
    document.querySelectorAll('a[data-scroll][href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        closeMobileNav();
      });
    });
  }

  function initNavActive() {
    const sections = document.querySelectorAll("main section[id]");
    const links = document.querySelectorAll(".site-nav__link[data-scroll]");
    if (!sections.length || !links.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          links.forEach((l) => {
            l.classList.toggle(
              "is-active",
              l.getAttribute("href") === `#${id}`,
            );
          });
        });
      },
      { threshold: 0.35, rootMargin: "-20% 0px -55% 0px" },
    );
    sections.forEach((s) => io.observe(s));
  }

  const mobile = {
    root: null,
    btn: null,
    open: false,
  };

  function closeMobileNav() {
    if (!mobile.root || !mobile.btn) return;
    mobile.open = false;
    mobile.root.classList.remove("site-nav__panel--open");
    mobile.root.setAttribute("aria-hidden", "true");
    mobile.btn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  }

  function initMobileNav() {
    mobile.root = document.getElementById("nav-panel");
    mobile.btn = document.getElementById("nav-toggle");
    if (!mobile.root || !mobile.btn) return;

    mobile.btn.addEventListener("click", () => {
      mobile.open = !mobile.open;
      mobile.root.classList.toggle("site-nav__panel--open", mobile.open);
      mobile.root.setAttribute("aria-hidden", mobile.open ? "false" : "true");
      mobile.btn.setAttribute("aria-expanded", mobile.open ? "true" : "false");
      document.body.classList.toggle("nav-open", mobile.open);
    });

    mobile.root.querySelectorAll("a[data-scroll]").forEach((a) => {
      a.addEventListener("click", () => closeMobileNav());
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    migrateLangStorage();
    initLangToggle();
    initNavReveal();
    initScrollReveal();
    initSmoothNav();
    initNavActive();
    initMobileNav();
  });
})();
