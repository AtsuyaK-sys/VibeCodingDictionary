#!/usr/bin/env node
/* 全辞典の項目を集めて、一覧ページの横断検索用データ（assets/search-index.js）を作る。
   使い方:  node tools/build-search-index.js
   辞典の項目を足したり名前を変えたりしたら、もう一度実行してコミットする。

   しくみ: 各ページのスクリプトを、ブラウザの代わりの「空の画面」で読み込み、
   VD.render(...) に渡されたタブ・項目の一覧だけを取り出す（見本そのものは動かさない）。 */
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');

// 何を呼んでも・何を読んでもエラーにならない「空っぽ」の代用品
const hole = new Proxy(function(){}, {
  get(t, k){ if (k === Symbol.toPrimitive || k === 'toString' || k === 'valueOf') return () => ''; if (k === Symbol.iterator) return function*(){}; if (k === 'length') return 0; if (k === 'then') return undefined; return hole; },
  apply(){ return hole; }, construct(){ return hole; }, set(){ return true; }, has(){ return true; },
});
const store = { getItem:() => null, setItem(){}, removeItem(){}, clear(){} };
class Obs { observe(){} unobserve(){} disconnect(){} takeRecords(){ return []; } }

function sandbox(){
  const sb = {
    console, URL, URLSearchParams, Math, JSON, Date, Intl, Promise, Symbol, Map, Set, WeakMap, WeakSet, Array, Object, String, Number, Boolean, RegExp, Error, TypeError,
    parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent, encodeURI, decodeURI, Uint8Array, Float32Array, ArrayBuffer, TextEncoder, TextDecoder,
    setTimeout:() => 0, clearTimeout(){}, setInterval:() => 0, clearInterval(){}, requestAnimationFrame:() => 0, cancelAnimationFrame(){}, queueMicrotask(){},
    document:hole, navigator:hole, screen:hole, history:hole, localStorage:store, sessionStorage:store,
    location:{ hash:'', search:'', href:'file:///x.html', pathname:'/x.html', protocol:'file:', origin:'null', host:'' },
    addEventListener(){}, removeEventListener(){}, dispatchEvent(){}, scrollTo(){}, scrollBy(){}, alert(){}, open(){},
    matchMedia:() => ({ matches:false, addEventListener(){}, removeEventListener(){}, addListener(){}, removeListener(){} }),
    getComputedStyle:() => hole, performance:{ now:() => 0 }, fetch:() => new Promise(() => {}),
    innerWidth:1200, innerHeight:800, devicePixelRatio:1, scrollX:0, scrollY:0,
    ResizeObserver:Obs, IntersectionObserver:Obs, MutationObserver:Obs, CSS:{ supports:() => true, escape:(s) => s },
  };
  // 上にない名前（Image・AudioContext など）は、すべて「空っぽ」で代用する
  const ctx = new Proxy(sb, { has:() => true, get:(t, k) => (k in t ? t[k] : (k === Symbol.unscopables ? undefined : (typeof k === 'string' && k in globalThis && typeof globalThis[k] !== 'undefined' ? globalThis[k] : hole))) });
  sb.window = sb.self = sb.globalThis = sb.top = sb.parent = ctx;
  return vm.createContext(ctx);
}

const strip = (h) => String(h == null ? '' : h).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const cut = (s, n = 70) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

function loadPage(file){
  const html = fs.readFileSync(path.join(root, file), 'utf8'), ctx = sandbox();
  let cfg = null;
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/g; let m;
  while ((m = re.exec(html))){
    const attrs = m[1], src = /src="([^"]+)"/.exec(attrs), type = /type="([^"]+)"/.exec(attrs);
    if (type && !/javascript|module/.test(type[1])) continue;           // importmap など
    let code = m[2], name = file + ' (inline)';
    if (src){ if (/^https?:/.test(src[1])) continue; name = src[1]; code = fs.readFileSync(path.join(root, src[1]), 'utf8'); }
    try { vm.runInContext(code, ctx, { filename:name }); } catch (e){ console.warn(`  ! ${name}: ${e.message}`); }
    if (src && /assets\/dict\.js$/.test(src[1])) ctx.VD.render = (c) => { cfg = c; return hole; };
  }
  return { cfg, dicts:ctx.VD && ctx.VD.DICTS };
}

function entriesOf(cfg){
  const tabs = [], out = [];
  (cfg.tabs || []).forEach((tab) => {
    const ti = tabs.push([tab.id, strip(tab.label)]) - 1; let n = 0;
    const add = (name, en) => { name = strip(name); en = strip(en); if (!name && !en) return; out.push([ti, cut(name || en), name ? cut(en) : '']); n++; };
    (tab.sections || []).forEach((sec) => {
      (sec.items || []).forEach((it) => add(it.name, it.en));
      if (sec.table && Array.isArray(sec.table.rows)) sec.table.rows.forEach((r) => Array.isArray(r) && add(r[0], r[1]));
      [sec.html, sec.after].forEach((h) => { if (typeof h !== 'string') return; const tr = /<tr\b[^>]*>([\s\S]*?)<\/tr>/g; let r; while ((r = tr.exec(h))){ const cells = [...r[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map((c) => c[1]); if (cells.length) add(cells[0], cells[1]); } });
    });
    tabs[ti].push(n);
  });
  return { tabs, out };
}

const first = loadPage('glossary.html');
if (!first.dicts){ console.error('assets/dict.js から辞典の一覧（DICTS）を読めませんでした'); process.exit(1); }
const dicts = [], entries = []; let total = 0;
first.dicts.forEach((d, di) => {
  const { cfg } = loadPage(d.file);
  if (!cfg){ console.warn(`× ${d.file}: VD.render が呼ばれませんでした`); dicts.push([d.file, d.short || d.title, d.icon, d.accent, []]); return; }
  const { tabs, out } = entriesOf(cfg);
  dicts.push([d.file, d.short || d.title, d.icon, d.accent, tabs.map((t) => [t[0], t[1]])]);
  out.forEach((e) => entries.push([di, e[0], e[1], e[2]]));
  total += out.length;
  console.log(`${String(out.length).padStart(5)}  ${d.file.padEnd(24)} ${tabs.map((t) => t[2]).join(' / ')}`);
});
const date = new Date().toISOString().slice(0, 10);
const js = `/* 自動生成（node tools/build-search-index.js）。手で編集しない。 */\nwindow.VD_INDEX=${JSON.stringify({ date, dicts, e:entries })};\n`;
fs.writeFileSync(path.join(root, 'assets', 'search-index.js'), js);
console.log(`\n合計 ${total} 項目 → assets/search-index.js（${Math.round(js.length / 1024)} KB）`);
