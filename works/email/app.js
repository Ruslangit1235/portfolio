/* Письмо «Обжарка» — скрипты просмотрщика.
   Переключение ширины, тёмная тема клиента и выбор письма.
   Само письмо скриптов не содержит: в почте JavaScript не работает. */

(function () {
  'use strict';

  var $ = function (s) { return document.querySelector(s); };

  var app = $('#app');
  var stage = $('#stage');
  var status = $('#status');
  var themeBtn = $('#theme');

  var LETTERS = {
    '1': {
      from: 'Обжарка &lt;hello@obzharka.example&gt;',
      when: 'сегодня, 09:14',
      subj: 'Новая партия эфиопии уже в обжарке'
    },
    '2': {
      from: 'СДЭК &lt;no-reply@cdek.example&gt;',
      when: 'сегодня, 08:02',
      subj: 'Посылка 1098234 передана курьеру'
    },
    '3': {
      from: 'Анна Ковалёва &lt;anna@obzharka.example&gt;',
      when: 'вчера, 19:41',
      subj: 'Профиль обжарки на вторник'
    },
    '4': {
      from: 'Хостинг &lt;billing@host.example&gt;',
      when: '28 сентября, 11:20',
      subj: 'Счёт за октябрь оплачен'
    }
  };

  /* ---------- строка состояния ---------- */
  function updateStatus() {
    var width = stage.dataset.view === 'mobile' ? '360 px' : '600 px';
    var theme = app.classList.contains('dark') ? 'тёмная' : 'светлая';
    status.textContent = 'Ширина письма ' + width + ' · ' + theme + ' тема клиента';
  }

  /* ---------- ширина письма ---------- */
  document.querySelectorAll('.tbtn[data-view]').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.tbtn[data-view]').forEach(function (x) {
        x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
      });
      stage.dataset.view = b.dataset.view;
      updateStatus();
    });
  });

  /* ---------- тёмная тема ---------- */
  themeBtn.addEventListener('click', function () {
    var on = themeBtn.getAttribute('aria-pressed') !== 'true';
    themeBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    themeBtn.textContent = on ? 'Светлая тема' : 'Тёмная тема';
    app.classList.toggle('dark', on);
    updateStatus();
  });

  /* ---------- выбор письма ----------
     Вёрстано только одно письмо — остальные показывают заглушку,
     чтобы было видно, что список рабочий, а не картинка. */
  var readBody = $('.read__body');
  var original = readBody.innerHTML;

  document.querySelectorAll('.msg').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.msg').forEach(function (x) { x.classList.remove('is-open'); });
      btn.classList.add('is-open');

      var dot = btn.querySelector('.msg__dot');
      if (dot) dot.remove();

      var id = btn.dataset.msg;
      var L = LETTERS[id];

      $('.read__subj').textContent = L.subj;
      $('.read__from').innerHTML =
        '<div><dt>От</dt><dd>' + L.from + '</dd></div>' +
        '<div><dt>Кому</dt><dd>demo@example.ru</dd></div>' +
        '<div><dt>Когда</dt><dd>' + L.when + '</dd></div>';

      if (id === '1') {
        readBody.innerHTML = original;
        stage = $('#stage');
        var active = document.querySelector('.tbtn[data-view][aria-pressed="true"]');
        stage.dataset.view = active ? active.dataset.view : 'desktop';
      } else {
        readBody.innerHTML =
          '<p style="max-width:52ch;margin-inline:auto;padding:40px 10px;text-align:center;' +
          'color:var(--ink-3);font-size:.94rem">В этом демо сверстано одно письмо — рассылка ' +
          '«Обжарки». Остальные в списке нужны, чтобы показать, что клиент вокруг письма ' +
          'тоже рабочий: панели переключаются, непрочитанные отмечаются прочитанными.</p>';
      }

      app.dataset.pane = 'mail';
      updateStatus();
    });
  });

  /* ---------- возврат к списку на телефоне ---------- */
  $('#back').addEventListener('click', function () {
    app.dataset.pane = 'list';
  });

  /* ---------- папки: это демо ---------- */
  document.querySelectorAll('.folders a').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      document.querySelectorAll('.folders a').forEach(function (x) { x.classList.remove('is-current'); });
      a.classList.add('is-current');
    });
  });

  $('.compose').addEventListener('click', function () {
    var b = this;
    b.textContent = 'Это демо';
    setTimeout(function () { b.textContent = 'Написать'; }, 1400);
  });

  updateStatus();
})();
