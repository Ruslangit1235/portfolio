/* Высота — скрипты фитнес-клуба.
   Расписание рисуется из массива занятий: семь колонок по дням,
   а там, где они не влезают, — один день и вкладки сверху. */

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

  var $ = function (s) { return document.querySelector(s); };

  /* ---------- данные ---------- */
  // Латинские слаги для имён классов: цвет полосы зависит от направления.
  var SLUG = {
    'Силовые': 'power', 'Йога': 'yoga', 'Кардио': 'cardio',
    'Бассейн': 'pool', 'Единоборства': 'fight', 'Танцы': 'dance'
  };

  var DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
  var SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // d — день недели (0 = понедельник), cap — всего мест, taken — занято
  var classes = [
    { d:0, t:'07:00', dur:45, n:'Кардио-микс',      dir:'Кардио',       coach:'Орлов',  hall:'Большой зал', lvl:'любой',       cap:20, taken:14 },
    { d:0, t:'09:30', dur:75, n:'Хатха-йога',       dir:'Йога',         coach:'Зимина', hall:'Малый зал',   lvl:'начинающий',  cap:14, taken:9  },
    { d:0, t:'18:00', dur:55, n:'Силовая база',     dir:'Силовые',      coach:'Орлов',  hall:'Большой зал', lvl:'начинающий',  cap:12, taken:12 },
    { d:0, t:'19:30', dur:60, n:'Бокс',             dir:'Единоборства', coach:'Карпов', hall:'Ринг',        lvl:'любой',       cap:16, taken:11 },

    { d:1, t:'08:00', dur:45, n:'Аквааэробика',     dir:'Бассейн',      coach:'Шульга', hall:'Бассейн',     lvl:'любой',       cap:15, taken:7  },
    { d:1, t:'12:30', dur:60, n:'Латина',           dir:'Танцы',        coach:'Зимина', hall:'Малый зал',   lvl:'начинающий',  cap:18, taken:5  },
    { d:1, t:'18:30', dur:55, n:'Штанга',           dir:'Силовые',      coach:'Орлов',  hall:'Большой зал', lvl:'продолжающий',cap:12, taken:10 },
    { d:1, t:'20:00', dur:75, n:'Виньяса',          dir:'Йога',         coach:'Зимина', hall:'Малый зал',   lvl:'продолжающий',cap:14, taken:13 },

    { d:2, t:'07:00', dur:45, n:'Интервальная',     dir:'Кардио',       coach:'Орлов',  hall:'Большой зал', lvl:'любой',       cap:20, taken:16 },
    { d:2, t:'10:00', dur:45, n:'Техника плавания', dir:'Бассейн',      coach:'Шульга', hall:'Бассейн',     lvl:'начинающий',  cap:10, taken:4  },
    { d:2, t:'18:00', dur:60, n:'Кикбоксинг',       dir:'Единоборства', coach:'Карпов', hall:'Ринг',        lvl:'продолжающий',cap:16, taken:16 },
    { d:2, t:'19:30', dur:55, n:'Силовая база',     dir:'Силовые',      coach:'Орлов',  hall:'Большой зал', lvl:'начинающий',  cap:12, taken:6  },

    { d:3, t:'08:00', dur:75, n:'Хатха-йога',       dir:'Йога',         coach:'Зимина', hall:'Малый зал',   lvl:'любой',       cap:14, taken:8  },
    { d:3, t:'13:00', dur:45, n:'Степ',             dir:'Кардио',       coach:'Шульга', hall:'Большой зал', lvl:'начинающий',  cap:20, taken:3  },
    { d:3, t:'18:30', dur:55, n:'Гантели и вес',    dir:'Силовые',      coach:'Орлов',  hall:'Большой зал', lvl:'любой',       cap:12, taken:9  },
    { d:3, t:'20:00', dur:60, n:'Современная',      dir:'Танцы',        coach:'Зимина', hall:'Малый зал',   lvl:'продолжающий',cap:18, taken:14 },

    { d:4, t:'07:30', dur:45, n:'Аквааэробика',     dir:'Бассейн',      coach:'Шульга', hall:'Бассейн',     lvl:'любой',       cap:15, taken:11 },
    { d:4, t:'12:00', dur:45, n:'Кардио-микс',      dir:'Кардио',       coach:'Орлов',  hall:'Большой зал', lvl:'любой',       cap:20, taken:6  },
    { d:4, t:'18:00', dur:60, n:'Бокс',             dir:'Единоборства', coach:'Карпов', hall:'Ринг',        lvl:'начинающий',  cap:16, taken:8  },
    { d:4, t:'19:30', dur:55, n:'Штанга',           dir:'Силовые',      coach:'Орлов',  hall:'Большой зал', lvl:'продолжающий',cap:12, taken:11 },

    { d:5, t:'10:00', dur:75, n:'Виньяса',          dir:'Йога',         coach:'Зимина', hall:'Малый зал',   lvl:'любой',       cap:14, taken:5  },
    { d:5, t:'11:30', dur:60, n:'Латина',           dir:'Танцы',        coach:'Зимина', hall:'Малый зал',   lvl:'любой',       cap:18, taken:9  },
    { d:5, t:'13:00', dur:55, n:'Силовая база',     dir:'Силовые',      coach:'Карпов', hall:'Большой зал', lvl:'начинающий',  cap:12, taken:4  },

    { d:6, t:'10:30', dur:45, n:'Техника плавания', dir:'Бассейн',      coach:'Шульга', hall:'Бассейн',     lvl:'любой',       cap:10, taken:6  },
    { d:6, t:'12:00', dur:75, n:'Хатха-йога',       dir:'Йога',         coach:'Зимина', hall:'Малый зал',   lvl:'начинающий',  cap:14, taken:7  }
  ];

  /* ---------- даты текущей недели ---------- */
  var monday = (function () {
    var now = new Date();
    var shift = (now.getDay() + 6) % 7;       // 0 = понедельник
    var m = new Date(now);
    m.setDate(now.getDate() - shift);
    m.setHours(0, 0, 0, 0);
    return m;
  })();
  var todayIndex = (new Date().getDay() + 6) % 7;

  var MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  function dateLabel(i) {
    var d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.getDate() + ' ' + MONTHS[d.getMonth()];
  }

  /* ---------- фильтры ---------- */
  var grid = $('#sched-grid'), daysBox = $('#days'), found = $('#found'),
      empty = $('#empty'), coachSel = $('#coach'), partSel = $('#part'), freeBox = $('#free');
  var activeDay = todayIndex;

  function dirs() {
    return Array.prototype.slice
      .call(document.querySelectorAll('#dirchips .chip[aria-pressed="true"]'))
      .map(function (b) { return b.dataset.dir; });
  }

  function partOf(time) {
    var h = parseInt(time.slice(0, 2), 10);
    if (h < 12) return 'morning';
    if (h < 17) return 'day';
    return 'evening';
  }

  function visible() {
    var ds = dirs(), coach = coachSel.value, part = partSel.value, onlyFree = freeBox.checked;
    return classes.filter(function (c) {
      if (ds.length && ds.indexOf(c.dir) === -1) return false;
      if (coach && c.coach !== coach) return false;
      if (part && partOf(c.t) !== part) return false;
      if (onlyFree && c.taken >= c.cap) return false;
      return true;
    });
  }

  /* ---------- отрисовка ---------- */
  function seatsText(c) {
    var left = c.cap - c.taken;
    if (left <= 0) return { cls: 'none', text: 'мест нет' };
    if (left <= 3) return { cls: 'low', text: 'осталось ' + left + ' из ' + c.cap };
    return { cls: '', text: 'свободно ' + left + ' из ' + c.cap };
  }

  function endTime(c) {
    var h = parseInt(c.t.slice(0, 2), 10), m = parseInt(c.t.slice(3), 10) + c.dur;
    h += Math.floor(m / 60); m = m % 60;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }

  function render() {
    var list = visible();

    grid.innerHTML = DAYS.map(function (name, i) {
      var dayItems = list.filter(function (c) { return c.d === i; })
                         .sort(function (a, b) { return a.t.localeCompare(b.t); });

      var body = dayItems.length
        ? dayItems.map(function (c) {
            var s = seatsText(c), full = c.taken >= c.cap;
            return '<button class="cls cls--' + SLUG[c.dir] + '" type="button" data-id="' + classes.indexOf(c) + '"' +
                   (full ? ' disabled' : '') + '>' +
                     '<span class="cls__t">' + c.t + '–' + endTime(c) + '</span>' +
                     '<span class="cls__n">' + c.n + '</span>' +
                     '<span class="cls__meta">' + c.coach + ' · ' + c.hall + '</span>' +
                     '<span class="cls__seats ' + s.cls + '">' + s.text + '</span>' +
                   '</button>';
          }).join('')
        : '<p class="col__none">Занятий нет</p>';

      return '<div class="col' + (i === activeDay ? ' is-shown' : '') + '" data-d="' + i + '">' +
               '<div class="col__h' + (i === todayIndex ? ' is-today' : '') + '">' +
                 '<b>' + name + '</b><span>' + dateLabel(i) +
                 (i === todayIndex ? ' · сегодня' : '') + '</span>' +
               '</div>' +
               '<div class="col__list">' + body + '</div>' +
             '</div>';
    }).join('');

    daysBox.innerHTML = SHORT.map(function (s, i) {
      var n = list.filter(function (c) { return c.d === i; }).length;
      return '<button class="day-tab" type="button" role="tab" data-d="' + i + '"' +
             ' aria-selected="' + (i === activeDay) + '">' +
               '<b>' + s + '</b><span>' + (n ? n + ' зан.' : '—') + '</span>' +
             '</button>';
    }).join('');

    found.textContent = 'Показано ' + list.length + ' занятий из ' + classes.length;
    empty.hidden = list.length > 0;
    $('.schedwrap').hidden = list.length === 0;
  }

  /* ---------- переключение дня ---------- */
  daysBox.addEventListener('click', function (e) {
    var b = e.target.closest('[data-d]');
    if (!b) return;
    activeDay = parseInt(b.dataset.d, 10);
    render();
  });

  /* ---------- модалка записи ---------- */
  var modal = $('#modal'), form = $('#m-form'), msg = $('#m-msg'),
      nameIn = $('#m-name'), telIn = $('#m-tel'), lastFocus = null, currentId = -1;

  function openModal(id) {
    currentId = id;
    var c = classes[id], s = seatsText(c);
    lastFocus = document.activeElement;

    $('#m-dir').textContent = c.dir + ' · уровень: ' + c.lvl;
    $('#m-title').textContent = c.n;
    $('#m-specs').innerHTML =
      '<div><dt>Когда</dt><dd>' + DAYS[c.d] + ', ' + dateLabel(c.d) + '</dd></div>' +
      '<div><dt>Время</dt><dd>' + c.t + '–' + endTime(c) + ' · ' + c.dur + ' мин</dd></div>' +
      '<div><dt>Тренер</dt><dd>' + c.coach + '</dd></div>' +
      '<div><dt>Зал</dt><dd>' + c.hall + '</dd></div>' +
      '<div><dt>Места</dt><dd>' + s.text + '</dd></div>';

    msg.textContent = ''; msg.classList.remove('ok');
    nameIn.value = ''; telIn.value = '';
    nameIn.classList.remove('bad'); telIn.classList.remove('bad');
    $('#m-submit').disabled = false;
    $('#m-submit').textContent = 'Записаться';

    modal.hidden = false;
    document.body.classList.add('locked');
    nameIn.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('locked');
    if (lastFocus) lastFocus.focus();
  }

  grid.addEventListener('click', function (e) {
    var b = e.target.closest('.cls');
    if (b && !b.disabled) openModal(parseInt(b.dataset.id, 10));
  });

  modal.addEventListener('click', function (e) {
    if (e.target.closest('[data-close]')) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  /* фокус не уходит за пределы открытой модалки */
  modal.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var able = modal.querySelectorAll('button, input, [href]');
    var first = able[0], last = able[able.length - 1];
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = nameIn.value.trim();
    var tel = telIn.value.replace(/[^\d+]/g, '');

    nameIn.classList.remove('bad'); telIn.classList.remove('bad');
    msg.classList.remove('ok');

    if (name.length < 2) {
      msg.textContent = 'Напишите имя — хотя бы две буквы.';
      nameIn.classList.add('bad'); nameIn.focus(); return;
    }
    if (tel.replace(/\D/g, '').length < 11) {
      msg.textContent = 'Телефон нужен из 11 цифр, вместе с кодом страны.';
      telIn.classList.add('bad'); telIn.focus(); return;
    }

    var c = classes[currentId];
    c.taken = Math.min(c.cap, c.taken + 1);

    msg.classList.add('ok');
    msg.textContent = 'Записали. Это демо — заявка никуда не ушла, но счётчик мест уменьшился.';
    $('#m-submit').disabled = true;
    $('#m-submit').textContent = 'Готово';
    render();
  });

  /* ---------- слушатели фильтров ---------- */
  document.querySelectorAll('#dirchips .chip').forEach(function (b) {
    b.addEventListener('click', function () {
      b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      render();
    });
  });
  coachSel.addEventListener('change', render);
  partSel.addEventListener('change', render);
  freeBox.addEventListener('change', render);
  $('#reset').addEventListener('click', function () {
    document.querySelectorAll('#dirchips .chip').forEach(function (b) {
      b.setAttribute('aria-pressed', 'false');
    });
    coachSel.value = ''; partSel.value = ''; freeBox.checked = false;
    render();
  });

  /* ---------- бургер и подсветка раздела ---------- */
  var burger = $('#burger'), nav = $('#nav');
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

  var links = Array.prototype.slice.call(nav.querySelectorAll('a'));
  var secs = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  if (window.IntersectionObserver) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var i = secs.indexOf(en.target);
        links.forEach(function (a, n) { a.classList.toggle('is-active', n === i); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(function (s) { if (s) io.observe(s); });
  }

  /* ---------- кнопки абонементов ---------- */
  document.querySelectorAll('.plan__b').forEach(function (b) {
    b.addEventListener('click', function () {
      var was = b.textContent;
      b.textContent = 'Это демо';
      setTimeout(function () { b.textContent = was; }, 1500);
    });
  });

  render();
})();
