/* ==========================================================================
   Studio J&L — script.js
   Sumário:
     1. Setup / estado global
     2. Preloader
     3. Entrada do hero (linhas do título, clip-path, fade dos CTAs)
     4. Scroll reveals genéricos (IntersectionObserver + ScrollTrigger)
     5. Barra de progresso + header show/hide
     6. Menu mobile
     7. Resultados — carrossel pinado (desktop) via ScrollTrigger
     8. Parallax leve da foto da hero
     9. Lightbox da galeria
    10. Bootstrap
   Todas as animações GSAP respeitam prefers-reduced-motion (ver REDUCED).
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- 1. Setup / estado global ---------------------------------- */
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HAS_GSAP = !!window.gsap;
  var HAS_SCROLLTRIGGER = !!window.ScrollTrigger;

  if (HAS_GSAP && HAS_SCROLLTRIGGER) {
    gsap.registerPlugin(ScrollTrigger);
  }

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 2. Preloader ------------------------------------------------ */
  var preloaderDone = false;
  function initPreloader() {
    var pre = document.getElementById('preloader');
    if (!pre) { startHeroEntrance(); return; }

    function finish() {
      if (preloaderDone) return;
      preloaderDone = true;
      pre.style.display = 'none';
      startHeroEntrance();
    }

    if (REDUCED || !HAS_GSAP) {
      finish();
      return;
    }

    gsap.to(pre.querySelector('span'), { opacity: 1, duration: .5, delay: .15 });
    gsap.to(pre, { opacity: 0, duration: .6, delay: .95, onComplete: finish });
    // salvaguarda: nunca prender o visitante no preloader
    setTimeout(finish, 2200);
  }

  /* ---------- 3. Entrada do hero ------------------------------------------ */
  function startHeroEntrance() {
    var lines = document.querySelectorAll('#hero-title .line');
    var heroReveals = document.querySelectorAll('.hero-copy [data-reveal]');
    var clip = document.getElementById('hero-clip');
    var heroImg = document.getElementById('hero-img');

    if (REDUCED || !HAS_GSAP) {
      lines.forEach(function (l) { l.style.transform = 'none'; });
      heroReveals.forEach(function (el) { el.classList.add('in'); });
      if (clip) clip.style.clipPath = 'inset(0 0 0 0)';
      if (heroImg) heroImg.style.transform = 'scale(1)';
      return;
    }

    gsap.set(lines, { yPercent: 110 });
    gsap.to(lines, { yPercent: 0, duration: 1, ease: 'power4.out', stagger: .12, delay: .1 });
    gsap.to(heroReveals, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .12, delay: .5 });
    if (clip) gsap.to(clip, { clipPath: 'inset(0% 0 0 0)', duration: 1.3, ease: 'power4.inOut', delay: .15 });
    if (heroImg) gsap.to(heroImg, { scale: 1, duration: 1.6, ease: 'power3.out', delay: .15 });
  }

  /* ---------- 4. Scroll reveals genéricos ---------------------------------- */
  function initGenericReveals() {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: .15 });
      document.querySelectorAll('[data-reveal]').forEach(function (el) { io.observe(el); });
    }

    document.querySelectorAll('.reveal-mask').forEach(function (mask) {
      if (!mask.querySelector('.line')) mask.classList.add('in');
    });
  }

  function initScrollTriggerReveals() {
    if (REDUCED || !HAS_GSAP || !HAS_SCROLLTRIGGER) return;

    ScrollTrigger.batch(
      '.manifesto .line, .about-text [data-reveal], .cta-final [data-reveal], .resultados-head [data-reveal]',
      {
        start: 'top 85%',
        onEnter: function (els) {
          gsap.to(els, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .08 });
        }
      }
    );

    document.querySelectorAll('.reveal-mask').forEach(function (mask) {
      var line = mask.querySelector('.line');
      if (!line) return;
      gsap.set(line, { yPercent: 100 });
      ScrollTrigger.create({
        trigger: mask,
        start: 'top 88%',
        onEnter: function () { gsap.to(line, { yPercent: 0, duration: .9, ease: 'power4.out' }); }
      });
    });
  }

  /* ---------- 5. Barra de progresso + header show/hide ---------------------- */
  function initProgressAndHeader() {
    var header = document.getElementById('site-header');
    var bar = document.getElementById('progress');
    if (!header || !bar) return;

    var lastY = window.scrollY;
    var ticking = false;

    function onScroll() {
      var y = window.scrollY;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? (y / max * 100) : 0) + '%';
      header.classList.toggle('scrolled', y > 40);
      if (y > lastY && y > 140) header.classList.add('hide');
      else header.classList.remove('hide');
      lastY = y;
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    });
  }

  /* ---------- 6. Menu mobile -------------------------------------------------- */
  function initMobileMenu() {
    var toggle = document.getElementById('menu-toggle');
    var burger = document.getElementById('burger-btn');
    if (!toggle || !burger) return;

    function setMenu(open) {
      toggle.checked = open;
      var links = document.querySelectorAll('nav ul li a');
      if (open && !REDUCED && HAS_GSAP) {
        gsap.to(links, { y: 0, duration: .6, ease: 'power3.out', stagger: .06, delay: .05 });
      } else if (open) {
        links.forEach(function (a) { a.style.transform = 'none'; });
      } else {
        links.forEach(function (a) { a.style.transform = ''; });
      }
    }

    burger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setMenu(!toggle.checked); }
    });
    toggle.addEventListener('change', function () { setMenu(toggle.checked); });
    document.querySelectorAll('nav ul a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
  }

  /* ---------- 7. Resultados — carrossel pinado (desktop) ---------------------- */
  function initResultadosPin() {
    var pinEl = document.getElementById('res-pin');
    var track = document.getElementById('res-track');
    if (!pinEl || !track || REDUCED || !HAS_GSAP || !HAS_SCROLLTRIGGER) return;

    ScrollTrigger.matchMedia({
      '(min-width: 901px)': function () {
        var distance = track.scrollWidth - pinEl.offsetWidth;
        if (distance <= 0) return;
        gsap.to(track, {
          x: -distance,
          ease: 'none',
          scrollTrigger: {
            trigger: pinEl, start: 'top top', end: '+=' + distance,
            scrub: .4, pin: true, anticipatePin: 1
          }
        });
      }
    });
  }

  /* ---------- 8. Parallax leve da foto da hero --------------------------------- */
  function initHeroParallax() {
    if (REDUCED || !HAS_GSAP || !HAS_SCROLLTRIGGER || window.innerWidth < 901) return;
    gsap.to('#hero-img', {
      yPercent: 8, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: .5 }
    });
  }

  /* ---------- 9. Lightbox da galeria -------------------------------------------- */
  function initLightbox() {
    var lb = document.getElementById('lightbox');
    var lbImg = document.getElementById('lb-img');
    var lbCaption = document.getElementById('lb-caption');
    var closeBtn = document.getElementById('lb-close');
    if (!lb || !lbImg || !closeBtn) return;

    var lastFocused = null;

    function open(src, alt, caption) {
      lastFocused = document.activeElement;
      lbImg.src = src;
      lbImg.alt = alt || '';
      if (lbCaption) lbCaption.textContent = caption || '';
      lb.style.visibility = 'visible';
      document.documentElement.setAttribute('data-lock', '');

      if (!REDUCED && HAS_GSAP) {
        gsap.fromTo(lb, { opacity: 0 }, { opacity: 1, duration: .35 });
        gsap.fromTo(lbImg, { scale: .92, opacity: 0 }, { scale: 1, opacity: 1, duration: .4, delay: .05 });
      } else {
        lb.style.opacity = 1;
      }
      closeBtn.focus();
    }

    function close() {
      function done() {
        lb.style.visibility = 'hidden';
        document.documentElement.removeAttribute('data-lock');
        if (lastFocused) lastFocused.focus();
      }
      if (!REDUCED && HAS_GSAP) {
        gsap.to(lb, { opacity: 0, duration: .3, onComplete: done });
      } else {
        lb.style.opacity = 0;
        done();
      }
    }

    document.querySelectorAll('[data-lightbox]').forEach(function (card) {
      card.setAttribute('tabindex', '0');
      card.addEventListener('click', function () {
        open(card.getAttribute('data-full'), card.getAttribute('data-alt'), card.getAttribute('data-caption'));
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          open(card.getAttribute('data-full'), card.getAttribute('data-alt'), card.getAttribute('data-caption'));
        }
      });
    });

    closeBtn.addEventListener('click', close);
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lb.style.visibility === 'visible') close();
    });
  }

  /* ---------- 10. Bootstrap ------------------------------------------------------ */
  function init() {
    initPreloader();
    initGenericReveals();
    initProgressAndHeader();
    initMobileMenu();
    initLightbox();
  }

  function initOnLoad() {
    initResultadosPin();
    initHeroParallax();
    initScrollTriggerReveals();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('load', initOnLoad);
})();
