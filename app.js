/* Портфолио верстальщика — интерактив.
   Три блока: тема, ресайзер вьюпорта, копирование контактов. */

(function () {
  'use strict';

  var root = document.documentElement;
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* приватное окно */ } }
  };

  /* ---------- Тема ---------- */
  var toggle = document.getElementById('theme-toggle');
  var saved = store.get('theme');
  if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved);

  function isDark() {
    var attr = root.getAttribute('data-theme');
    if (attr) return attr === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function syncToggle() {
    if (toggle) toggle.setAttribute('aria-pressed', isDark() ? 'true' : 'false');
  }
  syncToggle();
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      store.set('theme', next);
      syncToggle();
    });
  }

  /* ---------- Мобильное меню ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Ресайзер вьюпорта ---------- */
  var stage = document.getElementById('vp-stage');
  var vp = document.getElementById('vp');
  var grip = document.getElementById('vp-grip');
  var readout = document.getElementById('vp-readout');
  var MIN = 280;

  function maxW() {
    if (!stage) return 0;
    var cs = getComputedStyle(stage);
    return stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  }

  function label(w) {
    if (w < 480) return 'Мобильный';
    if (w < 768) return 'Крупный мобильный';
    if (w < 1024) return 'Планшет';
    return 'Десктоп';
  }

  function report() {
    if (!vp || !readout) return;
    var w = Math.round(vp.getBoundingClientRect().width);
    readout.textContent = w + ' px · ' + label(w);
  }

  function setW(w) {
    if (!vp) return;
    var max = maxW();
    vp.style.width = Math.max(MIN, Math.min(w, max)) + 'px';
    report();
  }

  if (vp && grip && stage) {
    var dragging = false, startX = 0, startW = 0;

    grip.addEventListener('pointerdown', function (e) {
      dragging = true;
      startX = e.clientX;
      startW = vp.getBoundingClientRect().width;
      grip.setPointerCapture(e.pointerId);
      vp.classList.add('is-dragging');
      e.preventDefault();
    });

    grip.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      setW(startW + (e.clientX - startX));
    });

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      vp.classList.remove('is-dragging');
      if (e.pointerId !== undefined && grip.hasPointerCapture(e.pointerId)) {
        grip.releasePointerCapture(e.pointerId);
      }
    }
    grip.addEventListener('pointerup', endDrag);
    grip.addEventListener('pointercancel', endDrag);

    grip.addEventListener('keydown', function (e) {
      var step = e.shiftKey ? 100 : 20;
      if (e.key === 'ArrowLeft') { setW(vp.getBoundingClientRect().width - step); e.preventDefault(); }
      if (e.key === 'ArrowRight') { setW(vp.getBoundingClientRect().width + step); e.preventDefault(); }
    });

    document.querySelectorAll('.demo__presets .chip').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var v = btn.dataset.w;
        if (v === 'auto') { vp.style.width = ''; report(); }
        else setW(parseInt(v, 10));
        document.querySelectorAll('.demo__presets .chip').forEach(function (b) {
          b.classList.toggle('is-on', b === btn);
        });
      });
    });

    window.addEventListener('resize', function () {
      if (vp.style.width) setW(vp.getBoundingClientRect().width);
      else report();
    });

    report();
  }

  /* ---------- Копирование контактов ---------- */
  document.querySelectorAll('.copy').forEach(function (btn) {
    var target = document.querySelector(btn.dataset.copy);
    if (!target) return;

    btn.addEventListener('click', function () {
      var text = target.textContent.trim();
      var done = function () {
        var was = btn.textContent;
        btn.textContent = 'Скопировано';
        btn.classList.add('is-done');
        setTimeout(function () { btn.textContent = was; btn.classList.remove('is-done'); }, 1600);
      };
      var fallback = function () {
        var range = document.createRange();
        range.selectNodeContents(target);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        btn.textContent = 'Выделено — Ctrl+C';
        setTimeout(function () { btn.textContent = 'Копировать'; }, 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else {
        fallback();
      }
    });
  });

  /* ---------- Окно «Написать мне» ---------- */
  var sheet = document.getElementById('contact-sheet');
  var openers = document.querySelectorAll('[data-open-contact]');
  if (sheet && openers.length) {
    Array.prototype.forEach.call(openers, function (btn) {
      btn.addEventListener('click', function () {
        if (typeof sheet.showModal === 'function') sheet.showModal();
        else sheet.setAttribute('open', '');
      });
    });
    // клик по затемнению закрывает окно
    sheet.addEventListener('click', function (e) {
      if (e.target !== sheet) return;
      if (typeof sheet.close === 'function') sheet.close();
      else sheet.removeAttribute('open');
    });
  }

  /* ---------- Год в подвале ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
