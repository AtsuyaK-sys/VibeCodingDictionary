/* 配色・タイポグラフィ辞典 — 追加分：1色からデザイントークンを作る */
(function(){
const $ = (el, s) => el.querySelector(s), $$ = (el, s) => [...el.querySelectorAll(s)];
// 色の計算（HEX ⇄ HSL、相対輝度、コントラスト比）
const hex2rgb = (h) => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const rgb2hex = (r, g, b) => '#' + [r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const rgb2hsl = (r, g, b) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0; if (mx !== mn){ const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [h, s * 100, l * 100]; };
const hsl2hex = (h, s, l) => { s /= 100; l /= 100; const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return rgb2hex(f(0) * 255, f(8) * 255, f(4) * 255); };
const lum = (hex) => { const f = (v) => (v /= 255) <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4, [r, g, b] = hex2rgb(hex); return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
const STEPS = [[50, 97], [100, 93], [200, 86], [300, 76], [400, 64], [500, 52], [600, 43], [700, 35], [800, 27], [900, 19]];

function build(base){ const [h, s] = rgb2hsl(...hex2rgb(base)), sat = Math.max(25, Math.min(90, s)), sc = {};
  STEPS.forEach(([k, l]) => { sc[k] = hsl2hex(h, k < 300 ? sat * .9 : sat, l); });
  const grey = (l) => hsl2hex(h, 8, l), ink = grey(8);
  // ボタンの色は、上に乗る文字とのコントラストが 4.5:1 以上になる段階を選ぶ（色相によって必要な濃さが違うため）
  const pick = (keys, fg) => keys.findIndex(k => ratio(sc[k], fg) >= 4.5);
  const LK = [500, 600, 700, 800, 900], li = Math.max(0, pick(LK, '#ffffff')), lp = LK[li < 0 ? 4 : li], lh = LK[Math.min(4, (li < 0 ? 4 : li) + 1)];
  const DK = [500, 400, 300, 200, 100], di = pick(DK, ink), dp = DK[di < 0 ? 4 : di], dh = DK[Math.min(4, (di < 0 ? 4 : di) + 1)];
  const light = { bg:grey(98.5), surface:'#ffffff', text:grey(12), muted:grey(42), border:grey(88), primary:sc[lp], 'primary-hover':sc[lh], 'on-primary':'#ffffff', 'primary-soft':sc[50] };
  const dark = { bg:ink, surface:grey(12), text:grey(93), muted:grey(68), border:grey(22), primary:sc[dp], 'primary-hover':sc[dh], 'on-primary':ink, 'primary-soft':hsl2hex(h, sat * .5, 18) };
  return { sc, light, dark }; }
const css = (t) => `:root {\n${Object.entries(t.sc).map(([k, v]) => `  --brand-${k}: ${v};`).join('\n')}\n\n${Object.entries(t.light).map(([k, v]) => `  --color-${k}: ${v};`).join('\n')}\n}\n\n@media (prefers-color-scheme: dark) {\n  :root {\n${Object.entries(t.dark).map(([k, v]) => `    --color-${k}: ${v};`).join('\n')}\n  }\n}`;
const card = (m, nm) => `<div class="tg-card" style="background:${m.bg};color:${m.text};border-color:${m.border}"><small style="color:${m.muted}">${nm}</small><div class="tg-in" style="background:${m.surface};border-color:${m.border}"><b>お知らせ</b><span style="color:${m.muted}">新しいプランを始めました。</span><span class="tg-tag" style="background:${m['primary-soft']};color:${m.text}">NEW</span><button style="background:${m.primary};color:${m['on-primary']}">申し込む</button></div></div>`;
function gen(el){ const inp = $(el, 'input[type=color]'), hx = $(el, '.hx');
  const up = (v) => { const t = build(v);
    $(el, '.tg-scale').innerHTML = Object.entries(t.sc).map(([k, c]) => `<span style="background:${c};color:${lum(c) > .35 ? '#111' : '#fff'}" title="${c}">${k}</span>`).join('');
    $(el, '.tg-prev').innerHTML = card(t.light, 'ライト') + card(t.dark, 'ダーク');
    const chk = [['ライト：文字と背景', ratio(t.light.text, t.light.bg), 4.5], ['ライト：ボタンの文字', ratio(t.light['on-primary'], t.light.primary), 4.5], ['ダーク：文字と背景', ratio(t.dark.text, t.dark.bg), 4.5], ['ダーク：ボタンの文字', ratio(t.dark['on-primary'], t.dark.primary), 4.5]];
    $(el, '.tg-chk').innerHTML = chk.map(([n, r, need]) => `<span class="${r >= need ? 'ok' : 'ng'}">${r >= need ? '✓' : '✕'} ${n} ${r.toFixed(1)}:1</span>`).join('');
    $(el, '.tg-code').textContent = css(t); };
  inp.oninput = () => { hx.value = inp.value; up(inp.value); };
  hx.oninput = () => { if (/^#?[0-9a-f]{6}$/i.test(hx.value.trim())){ const v = '#' + hx.value.trim().replace('#', ''); inp.value = v; up(v); } };
  $$(el, '.tg-pre button').forEach(b => b.onclick = () => { inp.value = hx.value = b.dataset.c; up(b.dataset.c); });
  $(el, '.cp').onclick = () => VD.copyText($(el, '.tg-code').textContent);
  up(inp.value); }

const tk = TABS.find(t => t.id === 'tokens');
if (tk) tk.sections.unshift({ title:'1色からトークンを作る', items:[
  { name:'デザイントークン・ジェネレーター', en:'Token generator', h:520, wide:true, tags:['体験','最重要'],
    demo:'<div class="tg"><div class="tg-row"><span>ブランドの色</span><input type="color" value="#0f8b8d" aria-label="ブランドの色"><input class="hx" value="#0f8b8d" aria-label="色の16進数"><span class="tg-pre"><button type="button" data-c="#0f8b8d" style="background:#0f8b8d"></button><button type="button" data-c="#e2562b" style="background:#e2562b"></button><button type="button" data-c="#6d4cff" style="background:#6d4cff"></button><button type="button" data-c="#d97706" style="background:#d97706"></button><button type="button" data-c="#be185d" style="background:#be185d"></button></span></div><div class="tg-scale"></div><div class="tg-two"><div class="tg-prev"></div><div class="tg-right"><pre class="tg-code"></pre><button type="button" class="cp tg-btn">CSS をコピー</button></div></div><div class="tg-chk"></div></div>',
    init:(el) => gen(el),
    desc:'ブランドの色を1つ決めると、<b>明るさの段階（50〜900のスケール）</b>と、<b>役割の名前の付いた色（背景・文字・ボタンなど）</b>をライトとダークの両方で作ります。画面のコードでは <code>--color-primary</code> のような<b>役割の名前</b>だけを使うのがコツ。ブランドの色を変えても、全体がそろって変わります。ボタンの色は、黄色や水色のように明るく見える色ほど濃い段階が必要なので、<b>文字とのコントラストが 4.5:1 以上になる段階</b>を自動で選んでいます。',
    prompt:'ブランドカラー【#0f8b8d】から、デザイントークンを作って。①50〜900のカラースケール、②役割の名前（bg・surface・text・muted・border・primary・primary-hover・on-primary）、③ライトとダークの両方。CSS変数と Tailwind の設定の両方で出して、文字と背景のコントラスト比が4.5:1以上になっているかも確認して。' },
] });
})();
