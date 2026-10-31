/* Клюев и партнёры — общий скрипт для всех страниц. */
(function () {
  'use strict';

  /* Переход по якорю с поправкой на липкие панели.
     scroll-margin-top работает не везде одинаково: при плавной прокрутке
     и меняющейся высоте шапки браузер промахивается мимо цели, иногда
     улетая в самый низ страницы. Поэтому считаем смещение сами. */
  function stickyOffset() {
    var h = 0;
    ['.top', '.topbar', '.subnav'].forEach(function (sel) {
      var el = document.querySelector(sel);
      if (!el) return;
      var pos = getComputedStyle(el).position;
      if (pos === 'sticky' || pos === 'fixed') h += el.getBoundingClientRect().height;
    });
    return h + 16;
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    var y = target.getBoundingClientRect().top + window.pageYOffset - stickyOffset();
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    try { history.replaceState(null, '', '#' + id); } catch (err) { /* песочница */ }
  });

  /* мобильное меню */
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

  /* подсветка текущей практики в липкой полосе на странице «Практики» */
  var subnav = document.querySelector('.subnav');
  if (subnav && window.IntersectionObserver) {
    var links = Array.prototype.slice.call(subnav.querySelectorAll('a'));
    var secs = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var i = secs.indexOf(en.target);
        links.forEach(function (a, n) { a.classList.toggle('is-active', n === i); });
      });
    }, { rootMargin: '-35% 0px -55% 0px' });

    secs.forEach(function (s) { if (s) io.observe(s); });

    /* клик подсвечивает сразу, не дожидаясь прокрутки */
    subnav.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a) return;
      links.forEach(function (x) { x.classList.toggle('is-active', x === a); });
    });
  }

  /* форма обратной связи на странице контактов */
  var form = document.getElementById('lead');
  if (form) {
    var msg = document.getElementById('msg');
    var counter = document.getElementById('counter');
    var LIMIT = 1200;

    if (msg && counter) {
      var sync = function () {
        var n = msg.value.length;
        counter.textContent = n + ' / ' + LIMIT;
        counter.classList.toggle('over', n > LIMIT);
      };
      msg.addEventListener('input', sync);
      sync();
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var out = document.getElementById('msgout');
      var name = document.getElementById('name').value.trim();
      var mail = document.getElementById('mail').value.trim();
      var text = msg.value.trim();

      if (!name) { out.textContent = 'Укажите, как к вам обращаться.'; document.getElementById('name').focus(); return; }
      if (!mail) { out.textContent = 'Оставьте почту или телефон — иначе мы не сможем ответить.'; document.getElementById('mail').focus(); return; }
      if (text.length < 30) { out.textContent = 'Опишите ситуацию подробнее: сейчас ' + text.length + ' символов из 30 минимальных.'; msg.focus(); return; }
      if (text.length > LIMIT) { out.textContent = 'Слишком длинно. Сократите до ' + LIMIT + ' символов или приложите документы файлом.'; msg.focus(); return; }

      out.textContent = 'Форма прошла проверку. Это демо — заявка никуда не отправлена.';
    });
  }
})();
