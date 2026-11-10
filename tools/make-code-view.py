#!/usr/bin/env python3
"""Генератор страниц «просмотр кода» для демо-стендов.

Стенды — самодостаточные однофайловые сайты, поэтому код удобнее показывать
отдельной страницей рядом с демо. Исходник встраивается целиком (без fetch:
работает и по file://), подсвечивается своим парсером, считается в строках
и копируется/скачивается одной кнопкой.

Запуск: python3 tools/make-code-view.py
"""
from __future__ import annotations

import html
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORKS = os.path.join(ROOT, "works")
KUHNYA_SRC = "/home/babaduke/Загрузки/claude/sessions/vashakuhnya/site/src"

CSS = """
:root{
  --bg:#0b0c09; --panel:#111310; --panel2:#15170f; --line:rgba(241,240,229,.15);
  --ink:#f1f0e5; --muted:#94948a; --acc:#c9f24e; --acc-ink:#0b0c09;
  --mono:"JetBrains Mono",ui-monospace,"SFMono-Regular",Consolas,monospace;
  --sans:"Golos Text",system-ui,-apple-system,sans-serif;
}
*{box-sizing:border-box}
html,body{margin:0}
body{background:var(--bg);color:var(--ink);font:400 15px/1.55 var(--sans);-webkit-font-smoothing:antialiased}
a{color:inherit}
.wrap{width:100%;max-width:1180px;margin:0 auto;padding:0 28px}
.top{position:sticky;top:0;z-index:20;background:color-mix(in srgb,var(--bg) 88%,transparent);
  backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.top__in{display:flex;align-items:center;gap:16px;height:56px}
.back{font-family:var(--mono);font-size:11.5px;text-decoration:none;color:var(--muted);
  border-bottom:1px solid transparent;padding-bottom:1px;transition:.15s}
.back:hover{color:var(--ink);border-color:var(--acc)}
.top__name{font-family:var(--mono);font-size:11.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.top__right{margin-left:auto;display:flex;gap:8px;align-items:center}
.head{padding:44px 0 18px}
.kind{font-family:var(--mono);font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--acc);margin:0 0 14px}
h1{font-family:"Unbounded",var(--sans);font-weight:600;font-size:clamp(26px,3.4vw,40px);line-height:1.02;
  letter-spacing:-.04em;margin:0}
.note{color:var(--muted);max-width:70ch;margin:14px 0 0;font-size:14.5px}
.meta{display:flex;flex-wrap:wrap;gap:8px 22px;margin:20px 0 0;font-family:var(--mono);font-size:11px;color:var(--muted)}
.meta b{color:var(--ink);font-weight:500}

.bar{border-top:1px solid var(--line);border-bottom:1px solid var(--line);position:sticky;top:56px;
  z-index:15;background:var(--bg);margin-top:22px}
.bar__in{display:flex;align-items:center;gap:6px;padding:9px 0;overflow:auto}
.tab{
  font-family:var(--mono);font-size:11.5px;padding:7px 12px;border:1px solid var(--line);border-radius:7px;
  background:transparent;color:var(--muted);cursor:pointer;white-space:nowrap;transition:.15s
}
.tab:hover{color:var(--ink);border-color:rgba(241,240,229,.4)}
.tab[aria-selected="true"]{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.tab em{font-style:normal;opacity:.55;margin-left:7px;font-size:10px}
.bar__tools{margin-left:auto;display:flex;gap:6px;flex-shrink:0}
.btn{
  font-family:var(--mono);font-size:11px;padding:7px 11px;border-radius:7px;border:1px solid var(--line);
  background:var(--panel2);color:var(--ink);cursor:pointer;transition:.15s
}
.btn:hover{border-color:rgba(241,240,229,.45);background:#1c1f14}
.btn[data-done="1"]{background:var(--acc);border-color:var(--acc);color:var(--acc-ink)}

.code{margin:0 0 40px;border:1px solid var(--line);border-top:0;background:var(--panel);overflow:auto}
.code pre{margin:0;padding:16px 18px 20px;font-family:var(--mono);font-size:12.5px;line-height:1.68;
  tab-size:2;white-space:pre;color:#cfd3c6}
.code pre.wrap-lines{white-space:pre-wrap;word-break:break-word}
.ln{display:block;position:relative;padding-left:52px;min-height:1.68em}
.ln::before{content:attr(data-n);position:absolute;left:0;width:34px;text-align:right;color:#43483f;
  font-size:11px;user-select:none}
.ln:hover::before{color:var(--acc)}
.tok-com{color:#5f6b58;font-style:italic}
.tok-str{color:#e3b478}
.tok-tag{color:#8fd6ff}
.tok-attr{color:var(--acc)}
.tok-kw{color:#ff9ecb}
.tok-num{color:#b6e05a}
.tok-prop{color:#9ad0ff}
.tok-at{color:#c4a6ff}

.foot{display:flex;gap:18px;flex-wrap:wrap;align-items:center;border-top:1px solid var(--line);
  padding:18px 0 40px;font-family:var(--mono);font-size:10.5px;color:var(--muted)}
.foot a{text-decoration:none;border-bottom:1px solid var(--line);padding-bottom:1px}
.foot a:hover{border-color:var(--acc);color:var(--ink)}
.foot__r{margin-left:auto;display:flex;gap:16px}
@media (max-width:640px){
  .wrap{padding:0 16px}
  .head{padding:28px 0 14px}
  .top__name{display:none}
  .code pre{font-size:11.5px;padding:12px 10px}
  .ln{padding-left:38px}
  .ln::before{width:24px;font-size:10px}
  .bar{top:52px}
}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
:focus-visible{outline:2px solid var(--acc);outline-offset:3px}
"""

JS = r"""
(() => {
  "use strict";
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const tabs = $$(".tab");
  const panes = $$(".pane");

  const MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;" };
  const esc = (s) => s.replace(/[&<>]/g, (c) => MAP[c]);

  /* ——— лексер: комментарии и строки, затем ключевые слова ——— */
  /* угловые скобки разметки пишем как \x3C: их литералы ломают разбор скрипта */
  const TOKEN = /(\/\*[\s\S]*?\*\/|\/\/[^\n]*|\x3C!--[\s\S]*?--\x3E|`(?:\\[\s\S]|[^`\\])*`|"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*')/g;
  const KW = /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|this|null|undefined|true|false|await|async|of|in|typeof|instanceof|delete|try|catch|finally|throw|import|export|from|default)\b/g;
  const NUM = /\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b|\b0x[0-9a-fA-F]+\b/g;
  const TAG = /\x3C!--[\s\S]*?--\x3E|\x3C\/?[a-zA-Z][^>]*>/g;
  const ATTR = /([\w:@.\-]+)(\s*=\s*)("[^"]*"|'[^']*'|[^\s>]+)|([\w:@.\-]+)|([\s\S])/g;

  const paintJs = (s) => esc(s).replace(KW, '<span class="tok-kw">$1</span>').replace(NUM, '<span class="tok-num">$&</span>');
  const paintCss = (s) => esc(s)
    .replace(/(@[\w-]+)/g, '<span class="tok-at">$1</span>')
    .replace(/([\w-]+)(?=\s*:)/g, '<span class="tok-prop">$1</span>')
    .replace(NUM, '<span class="tok-num">$&</span>');

  function paintCode(src, lang) {
    const body = lang === "css" ? paintCss : paintJs;
    let out = "", last = 0, m;
    TOKEN.lastIndex = 0;
    while ((m = TOKEN.exec(src))) {
      out += body(src.slice(last, m.index));
      const t = m[0];
      const isComment = t.startsWith("\x3C!--") || t.startsWith("/*") || t.startsWith("//");
      out += '<span class="' + (isComment ? "tok-com" : "tok-str") + '">' + esc(t) + "</span>";
      last = m.index + t.length;
    }
    return out + body(src.slice(last));
  }

  function paintTag(tag) {
    if (tag.startsWith("\x3C!--")) return '<span class="tok-com">' + esc(tag) + "</span>";
    const m = /^<(\/?)([a-zA-Z][\w:-]*)([\s\S]*?)(\/?)>$/.exec(tag);
    if (!m) return esc(tag);
    const [, slash, name, attrs, selfClose] = m;
    let painted = "", a;
    ATTR.lastIndex = 0;
    while ((a = ATTR.exec(attrs))) {
      if (a[4] !== undefined) painted += '<span class="tok-attr">' + esc(a[4]) + "</span>";
      else if (a[1] !== undefined) {
        painted += '<span class="tok-attr">' + esc(a[1]) + "</span>" + esc(a[2] || "") +
          '<span class="tok-str">' + esc(a[3] || "") + "</span>";
      } else painted += esc(a[5]);
    }
    return esc("<") + esc(slash || "") + '<span class="tok-tag">' + esc(name) + "</span>" +
      painted + esc(selfClose || "") + esc(">");
  }

  function paintHtml(src) {
    let out = "", i = 0, m;
    while (i < src.length) {
      TAG.lastIndex = i;
      m = TAG.exec(src);
      if (!m) { out += esc(src.slice(i)); break; }
      out += esc(src.slice(i, m.index));
      out += paintTag(m[0]);
      i = m.index + m[0].length;
      /* внутри script и style подсвечиваем по правилам их языков */
      const open = /^\x3C(script|style)\b/i.exec(m[0]);
      if (open && !/\/>$/.test(m[0])) {
        const name = open[1].toLowerCase();
        const close = src.toLowerCase().indexOf("</" + name, i);
        const end = close === -1 ? src.length : close;
        out += name === "script" ? paintCode(src.slice(i, end), "js") : paintCode(src.slice(i, end), "css");
        i = end;
      }
    }
    return out;
  }

  function paintAstro(src) {
    const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(src);
    if (!fm) return paintHtml(src);
    const head = paintCode(fm[1], "js");
    const rest = src.slice(fm[0].length);
    return '<span class="tok-com">---</span>\n' + head + '\n<span class="tok-com">---</span>' + paintHtml(rest);
  }

  function paintLine(line, lang, state) {
    if (lang === "css" || lang === "js") {
      if (state.comment) {
        const end = line.indexOf("*/");
        if (end === -1) return '<span class="tok-com">' + esc(line) + "</span>";
        state.comment = false;
        return '<span class="tok-com">' + esc(line.slice(0, end + 2)) + "</span>" + paintCode(line.slice(end + 2), lang);
      }
      const out = paintCode(line, lang);
      if (/\/\*(?![\s\S]*\*\/)/.test(line)) state.comment = true;
      return out;
    }
    if (lang === "html" || lang === "astro") return lang === "astro" ? paintAstro(line) : paintHtml(line);
    return esc(line);
  }

  function render(pre) {
    if (pre.dataset.done) return;
    const lang = pre.dataset.lang || "html";
    const lines = pre.textContent.replace(/\t/g, "  ").split("\n");
    const state = { comment: false };
    /* строки — блочные span'ы, переносов в тексте нет: собираем их обратно
       при копировании и скачивании, иначе файл выгрузится одной строкой */
    pre.innerHTML = lines
      .map((line, i) => '<span class="ln" data-n="' + (i + 1) + '">' + paintLine(line, lang, state) + "</span>")
      .join("");
    pre.dataset.done = "1";
    pre.dataset.lines = lines.length;
  }

  const rawText = (pre) => Array.from(pre.children).map((el) => el.textContent).join("\n");

  function select(name) {
    tabs.forEach((t) => t.setAttribute("aria-selected", String(t.dataset.tab === name)));
    panes.forEach((p) => (p.hidden = p.dataset.pane !== name));
    const active = panes.find((p) => p.dataset.pane === name);
    if (active) {
      const pre = active.querySelector("pre");
      render(pre);
      document.getElementById("stat-lines").textContent = pre.dataset.lines;
      document.getElementById("stat-size").textContent = active.dataset.size + " КБ";
      document.getElementById("stat-file").textContent = active.dataset.file;
      pre.classList.remove("wrap-lines");
      const wb = document.getElementById("wrap");
      wb.textContent = "Переносы строк"; wb.dataset.done = "0";
    }
    if (location.hash !== "#" + name) history.replaceState(null, "", "#" + name);
  }

  tabs.forEach((t) => t.addEventListener("click", () => select(t.dataset.tab)));

  document.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    if (/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
    const i = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
    const next = (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    tabs[next].click();
    tabs[next].focus();
  });

  function current() {
    const pane = panes.find((p) => !p.hidden);
    return { pane, pre: pane.querySelector("pre"), name: pane.dataset.file };
  }

  document.getElementById("copy").addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    try {
      await navigator.clipboard.writeText(rawText(current().pre));
      btn.dataset.done = "1";
      btn.textContent = "Скопировано";
    } catch {
      btn.textContent = "Выделите вручную";
    }
    setTimeout(() => { btn.textContent = "Копировать"; delete btn.dataset.done; }, 1800);
  });

  document.getElementById("download").addEventListener("click", () => {
    const { pre, name } = current();
    const blob = new Blob([rawText(pre)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  const wrapBtn = document.getElementById("wrap");
  wrapBtn.addEventListener("click", () => {
    const on = current().pre.classList.toggle("wrap-lines");
    wrapBtn.dataset.done = on ? "1" : "0";
    wrapBtn.textContent = on ? "Без переносов" : "Переносы строк";
  });

  select(location.hash.slice(1) || panes[0].dataset.pane);
})();
"""

TEMPLATE = """<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#0b0c09">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%230d0e0b'/%3E%3Cpath d='M9 22l5-12h4l5 12h-3l-1.2-3h-5.6L12 22z' fill='%23c9f24e'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Unbounded:wght@500;600&family=Golos+Text:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap">
<style>{css}</style>
</head>
<body>

<div class="top">
  <div class="wrap top__in">
    <a class="back" href="index.html">← к демо</a>
    <span class="top__name">{kind}</span>
    <div class="top__right"><a class="back" href="../../index.html">в портфолио</a></div>
  </div>
</div>

<header class="head">
  <div class="wrap">
    <p class="kind">{kind}</p>
    <h1>{h1}</h1>
    <p class="note">{note}</p>
    <p class="meta">
      <span>файлов: <b>{nfiles}</b></span>
      <span>открыт: <b id="stat-file">—</b></span>
      <span>строк: <b id="stat-lines">—</b></span>
      <span>размер: <b id="stat-size">—</b></span>
    </p>
  </div>
</header>

<div class="bar">
  <div class="wrap bar__in" role="tablist" aria-label="Файлы">
    {tabs}
    <div class="bar__tools">
      <button class="btn" type="button" id="wrap">Переносы строк</button>
      <button class="btn" type="button" id="download">Скачать</button>
      <button class="btn" type="button" id="copy">Копировать</button>
    </div>
  </div>
</div>

<main class="wrap">
  {panes}
</main>

<footer class="foot wrap">
  <span>страница кода · исходник встроен целиком, подсветка своя</span>
  <div class="foot__r">
    <a href="index.html">демо ↗</a>
    <a href="../../index.html">в портфолио</a>
  </div>
</footer>

<script>{js}</script>
</body>
</html>
"""

PANE = """<section class="pane" data-pane="{key}" data-file="{file}" data-size="{size}" {hidden}>
    <div class="code"><pre data-lang="{lang}">{source}</pre></div>
  </section>"""


def lang_of(path: str) -> str:
    if path.endswith(".astro"):
        return "astro"
    if path.endswith(".css"):
        return "css"
    if path.endswith((".js", ".ts")):
        return "js"
    if path.endswith((".html", ".xml")):
        return "html"
    return "text"


def key_of(path: str) -> str:
    base = os.path.basename(path)
    stem = base.split(".")[0]
    ext = base.split(".")[-1]
    return (stem.replace("_", "-") + "-" + ext) if "." in base else stem


def build(stand: str, title: str, h1: str, kind: str, note: str,
          files: list[tuple[str, str]], base: str | None = None) -> None:
    """files — пары (путь, подпись вкладки); base — где лежат файлы."""
    root = base or os.path.join(WORKS, stand)
    tabs, panes = [], []
    for i, (rel, label) in enumerate(files):
        full = os.path.join(root, rel)
        raw = open(full, encoding="utf-8").read()
        size = max(1, round(os.path.getsize(full) / 1024))
        key = key_of(rel)
        tabs.append(
            '<button class="tab" type="button" role="tab" data-tab="{k}" aria-selected="{sel}">{label}'
            "<em>{kb} КБ</em></button>".format(k=key, sel="true" if i == 0 else "false", label=label, kb=size)
        )
        panes.append(
            PANE.format(key=key, file=os.path.basename(rel), size=size,
                        hidden="" if i == 0 else "hidden",
                        lang=lang_of(rel), source=html.escape(raw))
        )

    out = TEMPLATE.format(
        title=title, desc=note, css=CSS, js=JS, kind=kind, h1=h1, note=note,
        nfiles=len(files), tabs="\n    ".join(tabs), panes="\n  ".join(panes),
    )
    dst = os.path.join(WORKS, stand, "code.html")
    with open(dst, "w", encoding="utf-8") as fh:
        fh.write(out)
    print(f"{dst}: {len(out) / 1024:.0f} КБ, файлов {len(files)}")


if __name__ == "__main__":
    build(
        "analytics", "Код · Скала — панель продукта",
        "Скала: весь дашборд одним файлом",
        "скала · код",
        "Четыре экрана, canvas-графики, когорты и выгрузка CSV — один HTML-документ без библиотек. "
        "Подсветка, нумерация строк, копирование и скачивание файла целиком.",
        [("index.html", "index.html")],
    )
    build(
        "typefoundry", "Код · Гарнитура — шрифтовая студия",
        "Гарнитура: тестер набора в одном файле",
        "гарнитура · код",
        "Живой тестер типографики: пересчёт кегля, трекинга и интерлиньяжа, сетка глифов, копирование CSS. "
        "Разметка, стили и скрипт лежат в одном документе.",
        [("index.html", "index.html")],
    )
    build(
        "kontrast", "Код · Контраст — палитра и WCAG",
        "Контраст: OKLCH и контраст без библиотек",
        "контраст · код",
        "Преобразования sRGB ↔ OKLab ↔ OKLCH, гамут-мэппинг, формула относительной светимости WCAG 2.1 "
        "и экспорт переменных — всё написано руками, здесь это видно построчно.",
        [("index.html", "index.html")],
    )
    build(
        "kuhnya", "Код · Ваша Кухня — фабрика кухонь",
        "Ваша Кухня: исходники на Astro",
        "ваша кухня · код",
        "Клиентский проект собирается на Astro: страницы, компоненты, SEO-разметка и стили. "
        "Здесь — четыре файла из исходного проекта: главная страница, SEO-компонент, квиз-калькулятор и глобальные стили.",
        [("pages/index.astro", "index.astro"),
         ("components/Seo.astro", "Seo.astro"),
         ("components/Quiz.astro", "Quiz.astro"),
         ("styles/global.css", "global.css")],
        base=KUHNYA_SRC,
    )
