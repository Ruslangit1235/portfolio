/* Руслан Качев — портфолио · интерфейс
   Ванильный ES2020, без зависимостей и сборки. */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ——————————————————— тема ——————————————————— */
  const root = document.documentElement;
  const themeBtn = $("#theme-toggle");
  const stored = localStorage.getItem("rk-theme");
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = stored || (systemDark ? "dark" : "light");

  function setTheme(theme) {
    root.dataset.theme = theme;
    themeBtn.setAttribute("aria-pressed", String(theme === "dark"));
    themeBtn.setAttribute("aria-label", theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему");
    const meta = $('meta[name="theme-color"]:not([media])');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0b0c09" : "#efede4");
  }
  setTheme(initialTheme);
  themeBtn.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("rk-theme", next);
    setTheme(next);
  });

  /* ——————————————————— прогресс чтения + активный раздел ——————————————————— */
  const progress = $("#progress");
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${h > 0 ? clamp(window.scrollY / h, 0, 1) : 0})`;
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const navLinks = $$("#nav a");
  const sections = $$("main section[id]");

  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          // у «Обо мне» ссылки в меню нет — тогда подсветка снимается целиком
          navLinks.forEach((a) =>
            a.setAttribute("aria-current", String(a.getAttribute("href") === "#" + entry.target.id))
          );
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => navObserver.observe(s));

    /* появление блоков */
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );
    $$(".reveal").forEach((el) => revealObserver.observe(el));

    /* шаг процесса подсвечивается, когда он в середине экрана */
    const stepObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => entry.target.classList.toggle("is-active", entry.isIntersecting));
      },
      { rootMargin: "-49.5% 0px -49.5% 0px" }
    );
    $$(".step").forEach((s) => stepObserver.observe(s));
  } else {
    $$(".reveal").forEach((el) => el.classList.add("is-in"));
  }

  /* ——————————————————— масштабирование живого стенда ——————————————————— */
  function makeFitter(stage, screen, readout, suffix) {
    let width = 1280;

    function label(w) {
      if (w < 520) return "мобильный";
      if (w < 900) return "планшет";
      return "десктоп";
    }

    function apply() {
      const stageW = stage.clientWidth;
      const stageH = stage.clientHeight;
      if (!stageW || !stageH) return;
      const scale = Math.min(1, stageW / width);
      screen.style.width = width + "px";
      screen.style.height = Math.round(stageH / scale) + "px";
      // центровку держит CSS-свойство translate: -50% 0, здесь только масштаб
      screen.style.transform = `scale(${scale})`;
      if (readout) {
        readout.innerHTML = `${width} px${suffix ? ` · <b>${label(width)}</b>` : ""}`;
      }
    }

    // размеры стенда могут появиться позже (диалог, шрифты) — следим за ними
    if ("ResizeObserver" in window) new ResizeObserver(() => apply()).observe(stage);

    return {
      apply,
      get width() { return width; },
      setWidth(w) { width = clamp(Math.round(w), 280, 1440); apply(); },
    };
  }

  const specStage = $("#spec-stage");
  const specScreen = $("#spec-screen");
  const specReadout = $("#spec-readout");
  const specGrip = $("#spec-grip");
  const specChips = $$(".spec .chips button");
  const specFit = makeFitter(specStage, specScreen, specReadout, true);

  specChips.forEach((btn) => {
    btn.addEventListener("click", () => {
      specChips.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      specFit.setWidth(+btn.dataset.w);
    });
  });

  /* перетаскивание правого края */
  let dragging = false;
  specGrip.addEventListener("pointerdown", (e) => {
    dragging = true;
    specGrip.setPointerCapture(e.pointerId);
  });
  specGrip.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const rect = specStage.getBoundingClientRect();
    const ratio = clamp((e.clientX - rect.left) / rect.width, 0.06, 1);
    specFit.setWidth(280 + ratio * 1160);
    specChips.forEach((b) => b.setAttribute("aria-pressed", "false"));
  });
  const stopDrag = () => { dragging = false; };
  specGrip.addEventListener("pointerup", stopDrag);
  specGrip.addEventListener("pointercancel", stopDrag);
  specGrip.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    specChips.forEach((b) => b.setAttribute("aria-pressed", "false"));
    specFit.setWidth(specFit.width + (e.key === "ArrowRight" ? 40 : -40) * (e.shiftKey ? 4 : 1));
  });

  specFit.setWidth(1280);

  /* ——————————————————— фильтр работ ——————————————————— */
  const filters = $$(".filters button");
  const works = $$(".work[data-cat]");
  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.dataset.filter;
      filters.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      works.forEach((card) => card.classList.toggle("is-hidden", value !== "all" && card.dataset.cat !== value));
    });
  });

  /* ——————————————————— кейс в диалоге ——————————————————— */
  const caseDialog = $("#case");
  const caseStage = $("#case-stage");
  const caseScreen = $("#case-screen");
  const caseFrame = $("#case-frame");
  const caseReadout = $("#case-readout");
  const caseChips = $$("#case-chips button");
  const caseFit = makeFitter(caseStage, caseScreen, caseReadout, false);

  function openCase(card) {
    const d = card.dataset;
    $("#case-k").textContent = d.kind || "кейс";
    $("#case-t").textContent = d.title || "";
    $("#case-d").textContent = d.desc || "";

    const stats = (d.stats || "").split("|").filter(Boolean);
    $("#case-stats").innerHTML = stats
      .map((pair) => {
        const [k, ...rest] = pair.split(":");
        return `<li><span>${k}</span><b>${rest.join(":")}</b></li>`;
      })
      .join("");

    $("#case-tags").innerHTML = (d.tags || "")
      .split(",")
      .filter(Boolean)
      .map((t) => `<span class="tag">${t.trim()}</span>`)
      .join("");

    const demo = $("#case-demo");
    demo.href = d.demo || "#";
    const code = $("#case-code");
    if (d.code) {
      code.hidden = false;
      code.href = d.code;
    } else {
      code.hidden = true;
      code.removeAttribute("href");
    }

    caseFrame.src = d.demo || "about:blank";
    caseChips.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.w === "1280")));
    caseFit.setWidth(window.innerWidth < 900 ? 390 : 1280);

    caseDialog.showModal();
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => {
      caseFit.apply();
      $(".case__close").focus({ preventScroll: true });
    });
  }

  function closeCase() {
    caseDialog.close();
    caseFrame.src = "about:blank";
    document.body.style.overflow = "";
  }

  works.forEach((card) => {
    card.addEventListener("click", () => openCase(card));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openCase(card);
      }
    });
  });

  caseChips.forEach((btn) => {
    btn.addEventListener("click", () => {
      caseChips.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      caseFit.setWidth(+btn.dataset.w);
    });
  });

  $$("[data-close-case]").forEach((b) => b.addEventListener("click", closeCase));
  caseDialog.addEventListener("click", (e) => {
    if (e.target === caseDialog) closeCase();
  });
  caseDialog.addEventListener("close", () => {
    document.body.style.overflow = "";
    caseFrame.src = "about:blank";
  });

  /* ——————————————————— письмо ——————————————————— */
  const sheet = $("#contact-sheet");
  $$("[data-open-contact]").forEach((btn) =>
    btn.addEventListener("click", () => {
      sheet.showModal();
      document.body.style.overflow = "hidden";
    })
  );
  sheet.addEventListener("close", () => (document.body.style.overflow = ""));
  sheet.addEventListener("click", (e) => {
    if (e.target === sheet) sheet.close();
  });

  /* ——————————————————— копирование ——————————————————— */
  $$("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const target = $(btn.dataset.copy);
      if (!target) return;
      const text = target.textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
        btn.dataset.done = "1";
        btn.textContent = "скопировано";
      } catch {
        btn.textContent = "не вышло — выделите";
      }
      setTimeout(() => {
        btn.textContent = "копировать";
        delete btn.dataset.done;
      }, 1800);
    });
  });

  /* ——————————————————— меню ——————————————————— */
  const menu = $("#menu");
  const burger = $("#burger");
  let menuOpen = false;

  function toggleMenu(open) {
    menuOpen = open;
    menu.dataset.open = String(open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
    if (open) $(".overlay__close").focus({ preventScroll: true });
    else burger.focus({ preventScroll: true });
  }
  burger.addEventListener("click", () => toggleMenu(!menuOpen));
  $$("[data-close-menu]").forEach((b) => b.addEventListener("click", () => toggleMenu(false)));
  $$(".menu__link").forEach((a) => a.addEventListener("click", () => toggleMenu(false)));

  /* ——————————————————— палитра команд ——————————————————— */
  const palette = $("#palette");
  const paletteInput = $("#palette-input");
  const paletteList = $("#palette-list");
  const SECTION_LABELS = {
    services: "раздел 01 · услуги",
    works: "раздел 02 · работы",
    process: "раздел 03 · процесс",
    pricing: "раздел 04 · цены",
    about: "раздел 05 · обо мне",
    faq: "раздел 06 · вопросы",
    contact: "раздел 07 · контакты",
  };

  const items = Object.entries(SECTION_LABELS).map(([id, label]) => ({
    label,
    text: label.replace(/раздел \d+ · /, ""),
    hay: label,
    run: () => {
      closePalette();
      $(`#${id}`).scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", `#${id}`);
    },
  }));

  works.forEach((card) =>
    items.push({
      label: "кейс",
      text: card.dataset.title || "",
      hay: [card.dataset.title, card.dataset.kind, card.dataset.tags].join(" "),
      run: () => {
        closePalette();
        openCase(card);
      },
    })
  );

  let results = items.slice();
  let cursor = 0;

  function renderPalette() {
    paletteList.innerHTML = results.length
      ? results
          .map(
            (item, i) =>
              `<li role="option" aria-selected="${i === cursor}" data-i="${i}"><b>${item.label.split(" · ")[0]}</b>${item.text}</li>`
          )
          .join("")
      : `<li role="option" aria-selected="false" aria-disabled="true"><b>—</b>ничего не нашлось</li>`;
  }

  function openPalette() {
    palette.dataset.open = "true";
    paletteInput.value = "";
    results = items.slice();
    cursor = 0;
    renderPalette();
    document.body.style.overflow = "hidden";
    setTimeout(() => paletteInput.focus({ preventScroll: true }), 30);
  }

  function closePalette() {
    palette.dataset.open = "false";
    document.body.style.overflow = "";
  }

  paletteInput.addEventListener("input", () => {
    const q = paletteInput.value.trim().toLowerCase();
    results = q ? items.filter((i) => (i.hay || i.text).toLowerCase().includes(q)) : items.slice();
    cursor = 0;
    renderPalette();
  });

  paletteList.addEventListener("click", (e) => {
    const li = e.target.closest("li[data-i]");
    if (!li) return;
    results[+li.dataset.i].run();
  });

  palette.addEventListener("click", (e) => {
    if (e.target.hasAttribute("data-close-palette")) closePalette();
  });

  $("#open-palette").addEventListener("click", openPalette);

  document.addEventListener("keydown", (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      palette.dataset.open === "true" ? closePalette() : openPalette();
      return;
    }
    if (e.key === "/" && !typing && palette.dataset.open !== "true") {
      e.preventDefault();
      openPalette();
      return;
    }

    if (palette.dataset.open === "true") {
      if (e.key === "Escape") { closePalette(); return; }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!results.length) return;
        cursor = (cursor + (e.key === "ArrowDown" ? 1 : -1) + results.length) % results.length;
        renderPalette();
        const active = paletteList.querySelector('[aria-selected="true"]');
        if (active) active.scrollIntoView({ block: "nearest" });
        return;
      }
      if (e.key === "Enter" && results[cursor]) {
        e.preventDefault();
        results[cursor].run();
      }
      return;
    }

    if (e.key === "Escape" && menuOpen) toggleMenu(false);
  });

  /* ——————————————————— часы и год ——————————————————— */
  const clock = $("#clock");
  function tick() {
    clock.textContent = new Date().toLocaleTimeString("ru-RU", {
      timeZone: "Europe/Moscow",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }
  tick();
  setInterval(tick, 1000);
  $("#year").textContent = String(new Date().getFullYear());

  /* ——————————————————— пересчёт стендов при ресайзе ——————————————————— */
  let resizeRaf;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      specFit.apply();
      if (caseDialog.open) caseFit.apply();
    });
  });

  /* шрифты догрузились — стенд мог изменить высоту */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      specFit.apply();
      if (caseDialog.open) caseFit.apply();
    });
  }
})();
