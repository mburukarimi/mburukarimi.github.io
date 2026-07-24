/* ============================================================
   Mburu Karimi — shared site script
   Loaded on every page. All features guard for missing elements.
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Theme: light by default, manual toggle, remembered ---------- */

  var root = document.documentElement;
  var saved = null;

  try { saved = localStorage.getItem('theme'); } catch (e) {}
  if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved);

  var themeBtn = document.getElementById('themeToggle');

  function syncThemeLabel() {
    if (!themeBtn) return;
    var dark = root.getAttribute('data-theme') === 'dark';
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }
  syncThemeLabel();

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      syncThemeLabel();
    });
  }

  /* ---------- Sliding nav pill ---------- */

  var nav = document.getElementById('nav');
  var pill = document.getElementById('navPill');

  if (nav && pill) {
    var links = nav.querySelectorAll('.nav-link');
    var current = nav.querySelector('.nav-link[aria-current="page"]');

    function movePill(el) {
      if (!el) return;
      pill.style.left = el.offsetLeft + 'px';
      pill.style.width = el.offsetWidth + 'px';
    }

    function restPill() {
      if (current) {
        movePill(current);
        pill.classList.add('is-active');
      } else {
        pill.classList.remove('is-active');
      }
    }

    links.forEach(function (link) {
      link.addEventListener('mouseenter', function () {
        pill.classList.add('is-active');
        movePill(link);
      });
    });

    nav.addEventListener('mouseleave', restPill);
    window.addEventListener('resize', restPill);
    requestAnimationFrame(restPill);
  }

  /* ---------- Mobile nav ---------- */

  var navToggle = document.getElementById('navToggle');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------- Copy phone number ---------- */

  var phoneBtn = document.getElementById('phoneBtn');
  var phoneTip = document.getElementById('phoneTip');

  if (phoneBtn && phoneTip) {
    phoneBtn.addEventListener('click', function () {
      var original = '(248) 312-9650';
      function flash(msg) {
        phoneTip.textContent = msg;
        setTimeout(function () { phoneTip.textContent = original; }, 1400);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('2483129650').then(
          function () { flash('Copied'); },
          function () { flash(original); }
        );
      } else {
        flash(original);
      }
    });
  }

  /* ---------- Project rail ---------- */

  var rail = document.getElementById('rail');

  if (rail) {
    var prevBtn = document.getElementById('railPrev');
    var nextBtn = document.getElementById('railNext');
    var countEl = document.getElementById('railCount');
    var cards = rail.querySelectorAll('.rail-card');
    var total = cards.length;

    function pad(n) { return n < 10 ? '0' + n : String(n); }

    function step() {
      if (!cards.length) return 340;
      var styles = window.getComputedStyle(rail);
      var gap = parseFloat(styles.columnGap || styles.gap) || 18;
      return cards[0].getBoundingClientRect().width + gap;
    }

    function update() {
      var max = rail.scrollWidth - rail.clientWidth;
      var index = Math.round(rail.scrollLeft / step()) + 1;
      if (index < 1) index = 1;
      if (index > total) index = total;

      if (countEl) countEl.textContent = pad(index) + ' / ' + pad(total);
      if (prevBtn) prevBtn.disabled = rail.scrollLeft <= 2;
      if (nextBtn) nextBtn.disabled = rail.scrollLeft >= max - 2;
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { rail.scrollLeft -= step(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { rail.scrollLeft += step(); });

    rail.addEventListener('scroll', function () {
      window.requestAnimationFrame(update);
    }, { passive: true });

    window.addEventListener('resize', update);
    update();

    /* Drag to scroll */
    var dragging = false;
    var startX = 0;
    var startScroll = 0;
    var moved = 0;

    rail.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return;
      dragging = true;
      moved = 0;
      startX = e.clientX;
      startScroll = rail.scrollLeft;
      rail.classList.add('is-dragging');
    });

    window.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var delta = e.clientX - startX;
      moved = Math.abs(delta);
      rail.scrollLeft = startScroll - delta;
    });

    window.addEventListener('pointerup', function () {
      if (!dragging) return;
      dragging = false;
      rail.classList.remove('is-dragging');
      update();
    });

    /* Suppress the click that ends a drag */
    rail.addEventListener('click', function (e) {
      if (moved > 6) {
        e.preventDefault();
        e.stopPropagation();
      }
      moved = 0;
    }, true);
  }

  /* ---------- Custom cursor (fine pointers, motion allowed) ---------- */

  var fine = window.matchMedia('(pointer: fine)').matches;
  var stillOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (fine && stillOK) {
    var dot = document.querySelector('.cursor-dot');
    var ring = document.querySelector('.cursor-ring');

    if (dot && ring) {
      var mx = 0, my = 0, rx = 0, ry = 0;
      var started = false;

      window.addEventListener('pointermove', function (e) {
        mx = e.clientX;
        my = e.clientY;
        dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
        if (!started) {
          started = true;
          rx = mx; ry = my;
          document.body.classList.add('cursor-ready');
        }
      }, { passive: true });

      (function loop() {
        rx += (mx - rx) * 0.16;
        ry += (my - ry) * 0.16;
        ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
        window.requestAnimationFrame(loop);
      })();

      var hoverables = 'a, button, .rail-card, .chip, .contact-pill, input, select, textarea, [role="button"]';

      document.addEventListener('pointerover', function (e) {
        if (e.target.closest && e.target.closest(hoverables)) ring.classList.add('is-hover');
      });

      document.addEventListener('pointerout', function (e) {
        if (e.target.closest && e.target.closest(hoverables)) ring.classList.remove('is-hover');
      });

      document.addEventListener('pointerleave', function () {
        document.body.classList.remove('cursor-ready');
      });

      document.addEventListener('pointerenter', function () {
        document.body.classList.add('cursor-ready');
      });
    }
  }


  /* ---------- Expandable project cards ---------- */

  var heads = document.querySelectorAll('.xcard-head');

  heads.forEach(function (head) {
    var card = head.closest('.xcard');
    if (!card || card.classList.contains('coming-soon')) return;

    head.setAttribute('aria-expanded', 'false');

    head.addEventListener('click', function () {
      var open = card.classList.toggle('is-open');
      head.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* ---------- Open a card if linked directly (e.g. projects.html#boeing) ---------- */

  function openFromHash() {
    var id = window.location.hash.replace('#', '');
    if (!id) return;
    var target = document.getElementById(id);
    if (!target || !target.classList.contains('xcard')) return;
    if (target.classList.contains('coming-soon')) return;

    target.classList.add('is-open');
    var h = target.querySelector('.xcard-head');
    if (h) h.setAttribute('aria-expanded', 'true');
    setTimeout(function () {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
  }

  if (heads.length) {
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
  }


  /* ---------- Hide any photo that fails to load ---------- */

  document.addEventListener('error', function (e) {
    var el = e.target;
    if (!el || el.tagName !== 'IMG') return;
    var fig = el.closest('figure');
    if (fig) { fig.style.display = 'none'; return; }
    el.style.display = 'none';
  }, true);

})();
