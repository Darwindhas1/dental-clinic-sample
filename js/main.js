/* ==========================================================================
   Senyum Dental Clinic — site behaviour
   Vanilla JS. GSAP + ScrollTrigger and Lenis are loaded from a CDN and every
   use of them is guarded, so the site still works if they fail to load.
   ========================================================================== */

(function () {
  'use strict';

  var CFG = window.CLINIC || {};
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ------------------------------------------------------ config binding --
     Any element with data-cfg="KEY" gets its text from config.js; the markup
     keeps a readable fallback so the page is never empty without JS.        */

  function applyConfig() {
    $$('[data-cfg]').forEach(function (el) {
      var value = CFG[el.getAttribute('data-cfg')];
      if (value != null && value !== '') el.textContent = value;
    });

    $$('[data-cfg-href]').forEach(function (el) {
      var parts = el.getAttribute('data-cfg-href').split(':');
      var kind = parts[0];
      var key = parts[1];
      var value = CFG[key];
      if (!value) return;
      if (kind === 'tel') el.href = 'tel:' + String(value).replace(/\s/g, '');
      else if (kind === 'mail') el.href = 'mailto:' + value;
      else el.href = value;
    });

    // social links
    $$('[data-social]').forEach(function (el) {
      var url = (CFG.SOCIALS || {})[el.getAttribute('data-social')];
      if (url) el.href = url;
    });

    // service price + name, keyed by the card's data-service id
    $$('[data-service]').forEach(function (el) {
      var svc = (CFG.SERVICES || []).filter(function (s) { return s.id === el.getAttribute('data-service'); })[0];
      if (!svc) return;
      var name = $('[data-service-name]', el);
      var price = $('[data-service-price]', el);
      if (name) name.textContent = svc.name;
      if (price) price.textContent = svc.price;
    });

    var year = $('[data-year]');
    if (year) year.textContent = new Date().getFullYear();
  }

  /* ------------------------------------------------------------- header -- */

  function initHeader() {
    var header = $('.site-header');
    if (!header) return;

    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    var toggle = $('.nav-toggle');
    var menu = $('.mobile-menu');
    if (!toggle || !menu) return;

    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
      menu.setAttribute('aria-hidden', String(!open));
    };

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    $$('a', menu).forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /* ----------------------------------------------------------- whatsapp -- */

  function initWhatsApp() {
    var fab = $('.wa-fab');
    if (!fab) return;
    var number = String(CFG.WHATSAPP_NUMBER || '').replace(/\D/g, '');

    if (number) {
      fab.href = 'https://wa.me/' + number + '?text=' + encodeURIComponent(CFG.WHATSAPP_MESSAGE || 'Hello');
      fab.target = '_blank';
      fab.rel = 'noopener';
    } else {
      // No number configured yet — the icon is decorative and does nothing.
      fab.setAttribute('href', '#');
      fab.setAttribute('aria-disabled', 'true');
      fab.addEventListener('click', function (e) { e.preventDefault(); });
    }
  }

  /* ---------------------------------------------------------- accordion -- */

  function initAccordion() {
    $$('.accordion').forEach(function (acc) {
      var items = $$('.accordion__item', acc);
      items.forEach(function (item) {
        var trigger = $('.accordion__trigger', item);
        var panel = $('.accordion__panel', item);
        if (!trigger || !panel) return;

        trigger.addEventListener('click', function () {
          var isOpen = item.classList.contains('is-open');
          items.forEach(function (other) {
            other.classList.remove('is-open');
            $('.accordion__trigger', other).setAttribute('aria-expanded', 'false');
          });
          if (!isOpen) {
            item.classList.add('is-open');
            trigger.setAttribute('aria-expanded', 'true');
          }
        });
      });
    });
  }

  /* ------------------------------------------------------------- slider --
     Testimonials scroll continuously. The track is duplicated so the loop is
     seamless; the copy is hidden from assistive tech.                       */

  function initSlider() {
    $$('.slider').forEach(function (slider) {
      var track = $('.slider__track', slider);
      if (!track || reduceMotion) return;
      var clone = track.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      $$('a, button', clone).forEach(function (el) { el.setAttribute('tabindex', '-1'); });
      while (clone.firstChild) track.appendChild(clone.firstChild);
      track.classList.add('is-animating');
    });
  }

  /* -------------------------------------------------------------- forms --
     Front-end only for this sample: validate, show a toast, reset.
     WEB3FORMS: swap the handler for a real endpoint when going live.        */

  function showToast(message) {
    var toast = $('.toast');
    if (!toast) return;
    $('.toast__text', toast).textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () { toast.classList.remove('is-visible'); }, 5000);
  }

  function validateField(field) {
    var input = $('input, select, textarea', field);
    if (!input) return true;
    var value = input.value.trim();
    var ok = true;

    if (input.required && !value) ok = false;
    else if (value && input.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
    else if (value && input.type === 'tel') ok = value.replace(/\D/g, '').length >= 7;

    field.classList.toggle('has-error', !ok);
    input.setAttribute('aria-invalid', String(!ok));
    return ok;
  }

  function initForms() {
    $$('form[data-demo-form]').forEach(function (form) {
      var fields = $$('.field', form);

      fields.forEach(function (field) {
        var input = $('input, select, textarea', field);
        if (!input) return;
        input.addEventListener('blur', function () {
          if (input.value.trim() || field.classList.contains('has-error')) validateField(field);
        });
        input.addEventListener('input', function () {
          if (field.classList.contains('has-error')) validateField(field);
        });
      });

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var valid = true;
        fields.forEach(function (field) { if (!validateField(field)) valid = false; });

        if (!valid) {
          var firstError = $('.field.has-error input, .field.has-error select, .field.has-error textarea', form);
          if (firstError) firstError.focus();
          showToast('Please check the highlighted fields.');
          return;
        }

        showToast(form.getAttribute('data-success') || 'Thank you — we will be in touch shortly.');
        form.reset();
        fields.forEach(function (field) { field.classList.remove('has-error'); });
      });
    });
  }

  /* ----------------------------------------------------------- lightbox -- */

  function initLightbox() {
    var box = $('.lightbox');
    if (!box) return;
    var img = $('img', box);
    var lastFocus = null;

    $$('.gallery button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var source = $('img', btn);
        lastFocus = btn;
        img.src = source.getAttribute('data-full') || source.src;
        img.alt = source.alt;
        box.setAttribute('open', '');
        $('.lightbox__close', box).focus();
      });
    });

    var close = function () {
      box.removeAttribute('open');
      if (lastFocus) lastFocus.focus();
    };
    $('.lightbox__close', box).addEventListener('click', close);
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && box.hasAttribute('open')) close();
    });
  }

  /* ---------------------------------------------------------------- map -- */

  function initMap() {
    var el = document.getElementById('map');
    if (!el || typeof window.L === 'undefined') return;

    var map = window.L.map(el, { scrollWheelZoom: false }).setView([CFG.MAP_LAT, CFG.MAP_LNG], 15);
    window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    window.L.marker([CFG.MAP_LAT, CFG.MAP_LNG])
      .addTo(map)
      .bindPopup('<strong>' + (CFG.CLINIC_NAME || '') + '</strong><br>' + (CFG.ADDRESS || ''))
      .openPopup();
  }

  /* ----------------------------------------------------------- animation -- */

  function splitWords(el) {
    if (el.dataset.split === 'done') return $$('.word', el);
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(function (node) {
      if (!node.nodeValue.trim()) return;
      var frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(function (chunk) {
        if (!chunk.trim()) { frag.appendChild(document.createTextNode(chunk)); return; }
        var span = document.createElement('span');
        span.className = 'word';
        span.textContent = chunk;
        frag.appendChild(span);
      });
      node.parentNode.replaceChild(frag, node);
    });
    el.dataset.split = 'done';
    return $$('.word', el);
  }

  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-count-suffix') || '';
    var decimals = (el.getAttribute('data-count') || '').split('.')[1];
    var places = decimals ? decimals.length : 0;
    var start = performance.now();
    var duration = 1400;

    function frame(now) {
      var t = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = (target * eased).toFixed(places) + suffix;
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function initAnimation() {
    var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

    if (reduceMotion || !hasGsap) {
      // Make sure nothing stays hidden, then run counters immediately.
      document.documentElement.classList.remove('js-anim');
      $$('[data-count]').forEach(function (el) {
        el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-count-suffix') || '');
      });
      return;
    }

    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    // Lenis smooth scroll, kept in sync with ScrollTrigger.
    if (typeof window.Lenis !== 'undefined') {
      var lenis = new window.Lenis({ duration: 1.05, smoothWheel: true });
      lenis.on('scroll', window.ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }

    // Headings reveal word by word.
    $$('[data-reveal="words"]').forEach(function (el) {
      var words = splitWords(el);
      gsap.set(el, { opacity: 1 });
      gsap.from(words, {
        yPercent: 110,
        opacity: 0,
        duration: 0.85,
        ease: 'power3.out',
        stagger: 0.035,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });

    // Everything else fades and slides up, in groups where asked.
    $$('[data-reveal="up"]').forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 34 }, {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      });
    });

    $$('[data-reveal-group]').forEach(function (group) {
      var items = $$('[data-reveal="item"]', group);
      gsap.fromTo(items, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.75, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: { trigger: group, start: 'top 86%', once: true },
      });
    });

    // Slow parallax on the hero portrait.
    var heroImg = $('.hero__media img');
    if (heroImg) {
      gsap.to(heroImg, {
        yPercent: 7,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
      });
    }

    // Counters fire once, in view.
    $$('[data-count]').forEach(function (el) {
      window.ScrollTrigger.create({
        trigger: el,
        start: 'top 92%',
        once: true,
        onEnter: function () { countUp(el); },
      });
    });
  }

  /* ---------------------------------------------------------------- boot -- */

  function boot() {
    applyConfig();
    initHeader();
    initWhatsApp();
    initAccordion();
    initSlider();
    initForms();
    initLightbox();
    initMap();
    initAnimation();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Images settle after boot, so positions are recalculated once on load.
  window.addEventListener('load', function () {
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  });
})();
