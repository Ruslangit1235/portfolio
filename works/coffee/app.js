/* Обжарка — скрипты лендинга. */

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

  /* бургер */
  var burger = document.getElementById('burger'), menu = document.getElementById('menu');
  burger.addEventListener('click', function () {
    var open = menu.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      menu.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });

  /* подсветка текущего раздела */
  var links = Array.prototype.slice.call(menu.querySelectorAll('a'));
  var targets = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  if (window.IntersectionObserver) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var i = targets.indexOf(en.target);
        links.forEach(function (a, n) { a.classList.toggle('is-active', n === i); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach(function (t) { if (t) io.observe(t); });
  }

  /* вкладки заваривания */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  function selectTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t); });
    t.addEventListener('keydown', function (e) {
      var n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : -1;
      if (n < 0 || n >= tabs.length) return;
      tabs[n].focus(); selectTab(tabs[n]); e.preventDefault();
    });
  });

  /* корзина в карточках сортов */
  document.querySelectorAll('.bean__b').forEach(function (b) {
    b.addEventListener('click', function () {
      b.textContent = 'В корзине'; b.classList.add('ok');
      setTimeout(function () { b.textContent = '250 г'; b.classList.remove('ok'); }, 1600);
    });
  });

  /* подписка: пересчёт и проверка */
  var total = document.getElementById('total');
  function recalc() {
    var r = document.querySelector('input[name="freq"]:checked');
    var price = parseInt(r.dataset.price, 10);
    var weeks = parseInt(r.value, 10);
    var month = Math.round(price * (4.33 / weeks));
    total.textContent = 'Раз в ' + weeks + ' недел' + (weeks === 2 ? 'и' : 'ь') +
      ' · ' + price + ' ₽ за отправку · примерно ' +
      month.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽ в месяц';
  }
  document.querySelectorAll('input[name="freq"]').forEach(function (r) {
    r.addEventListener('change', recalc);
  });
  recalc();

  document.getElementById('subform').addEventListener('submit', function (e) {
    e.preventDefault();
    var input = document.getElementById('mail'), msg = document.getElementById('formmsg');
    var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
    msg.textContent = ok
      ? 'Проверка пройдена. Это демо — письмо никуда не ушло.'
      : 'Проверьте адрес: нужен формат имя@почта.ру';
    if (!ok) input.focus();
  });
})();
