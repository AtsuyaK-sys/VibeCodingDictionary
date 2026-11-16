/* モーション・インタラクション辞典 — C: 話題の演出 / 動きの調整 / 参考 */
(function(){
const { $, $$, clamp, retrigger, confettiLayer } = MO;
const EZ = 'cubic-bezier(.2,.8,.2,1)';
const GRAD = ['linear-gradient(135deg,#c026d3,#fb7185)', 'linear-gradient(135deg,#0ea5e9,#6366f1)', 'linear-gradient(135deg,#16a34a,#a3e635)', 'linear-gradient(135deg,#f97316,#facc15)', 'linear-gradient(135deg,#8b5cf6,#ec4899)', 'linear-gradient(135deg,#0f766e,#22d3ee)', 'linear-gradient(135deg,#e11d48,#f59e0b)', 'linear-gradient(135deg,#334155,#64748b)'];
const center = (h) => `<div style="position:absolute;inset:0;display:grid;place-items:center">${h}</div>`;
const local = (el, e) => { const r = el.getBoundingClientRect(); return { x:e.clientX - r.left, y:e.clientY - r.top, w:r.width, h:r.height }; };

/* ---------- 話題の演出 ---------- */
function island(el){
  const isl = $(el, '.mo-island'); const S = { idle:[110, 32, 20], call:[230, 38, 22], music:[240, 38, 22], timer:[170, 38, 22], big:[270, 112, 30] };
  const go = (s) => { const v = S[s]; isl.style.width = v[0] + 'px'; isl.style.height = v[1] + 'px'; isl.style.borderRadius = v[2] + 'px'; $$(isl, '.c').forEach(c => c.classList.toggle('on', c.dataset.s === s)); $$(el, '[data-go]').forEach(b => b.classList.toggle('ghost', b.dataset.go !== s)); };
  $$(el, '[data-go]').forEach(b => b.onclick = () => go(b.dataset.go)); go('idle');
}
function dock(el){
  const d = $(el, '.mo-dock'), is = $$(d, 'i');
  // アイコンの基準サイズはステージの幅に収まるように決める（CSS変数 --ds）
  d.style.setProperty('--ds', Math.max(22, Math.min(42, Math.floor((el.clientWidth - 72) / is.length))) + 'px');
  d.addEventListener('mousemove', (e) => { const base = parseFloat(getComputedStyle(d).getPropertyValue('--ds')) || 42;
    is.forEach(i => { const r = i.getBoundingClientRect(); const dist = Math.abs(e.clientX - (r.left + r.width / 2)); const s = 1 + .85 * Math.max(0, 1 - dist / 110); i.style.width = i.style.height = (base * s) + 'px'; }); });
  d.addEventListener('mouseleave', () => is.forEach(i => i.style.width = i.style.height = ''));
}
function glowGrid(el){
  const g = $(el, '.mo-ggrid');
  g.addEventListener('pointermove', (e) => $$(g, '.g').forEach(c => { const r = c.getBoundingClientRect(); c.style.setProperty('--x', (e.clientX - r.left) + 'px'); c.style.setProperty('--y', (e.clientY - r.top) + 'px'); }));
  g.addEventListener('pointerleave', () => $$(g, '.g').forEach(c => { c.style.removeProperty('--x'); c.style.removeProperty('--y'); }));
}
function glass(el){
  const g = $(el, '.mo-glass'); let ox = 0, oy = 0, drag = false, x = 0, y = 0;
  g.addEventListener('pointerdown', (e) => { drag = true; ox = e.clientX - x; oy = e.clientY - y; g.setPointerCapture(e.pointerId); });
  g.addEventListener('pointermove', (e) => { if (!drag) return; x = e.clientX - ox; y = e.clientY - oy; g.style.translate = `${x}px ${y}px`; });
  g.addEventListener('pointerup', () => drag = false);
}
function themeReveal(el){
  const b = $(el, '.mo-btn'); $(el, '.sup').textContent = document.startViewTransition ? 'View Transitions API 対応ブラウザです' : '※未対応ブラウザでは普通に切り替わります';
  b.onclick = async (e) => {
    if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches){ VD.toggleTheme(); return; }
    const x = e.clientX, y = e.clientY, r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const t = document.startViewTransition(() => VD.toggleTheme());
    await t.ready;
    document.documentElement.animate({ clipPath:[`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] }, { duration:650, easing:'cubic-bezier(.4,0,.2,1)', pseudoElement:'::view-transition-new(root)' });
  };
}
function flapClock(el){
  const units = $$(el, '.mo-flap').map(f => { f.innerHTML = '<div class="h t"><span>0</span></div><div class="h b"><span>0</span></div>'; let cur = '0';
    return (d) => { if (d === cur) return; const old = cur; cur = d; $(f, '.h.t span').textContent = d;
      const ft = document.createElement('div'); ft.className = 'h t f'; ft.innerHTML = `<span>${old}</span>`; f.append(ft);
      const fb = document.createElement('div'); fb.className = 'h b f'; fb.innerHTML = `<span>${d}</span>`; fb.style.transform = 'rotateX(90deg)'; f.append(fb);
      ft.animate([{ transform:'rotateX(0deg)' }, { transform:'rotateX(-90deg)' }], { duration:230, easing:'ease-in', fill:'forwards' }).onfinish = () => { ft.remove(); fb.animate([{ transform:'rotateX(90deg)' }, { transform:'rotateX(0deg)' }], { duration:230, easing:'ease-out', fill:'forwards' }).onfinish = () => { $(f, '.h.b span').textContent = d; fb.remove(); }; }; }; });
  const tick = () => { const n = new Date(), s = [n.getHours(), n.getMinutes(), n.getSeconds()].map(v => String(v).padStart(2, '0')).join(''); [...s].forEach((c, i) => units[i](c)); };
  tick(); const iv = setInterval(tick, 1000); return () => clearInterval(iv);
}
function swipe(el){
  const box = $(el, '.mo-swipe'); const N = ['京都の紅葉', '沖縄の海', '北海道の雪', '東京の夜景', '富士山', '奈良の鹿']; let k = 0;
  const mk = () => { const c = document.createElement('div'); c.className = 'sc'; c.style.background = GRAD[k % 8]; c.innerHTML = `<span class="stamp like">LIKE</span><span class="stamp nope">NOPE</span>${N[k % N.length]}<small style="font-weight:500;font-size:12px;opacity:.85">左右にスワイプ</small>`; k++; return c; };
  const layout = () => { const cs = [...box.children]; cs.forEach((c, i) => { const d = cs.length - 1 - i; c.classList.toggle('top', d === 0); c.style.transform = `translateY(${d * 10}px) scale(${1 - d * .05})`; c.style.opacity = d > 2 ? 0 : 1; }); };
  for (let i = 0; i < 3; i++) box.prepend(mk()); layout();
  let c = null, x0 = 0, y0 = 0, dx = 0, dy = 0;
  box.addEventListener('pointerdown', (e) => { const t = e.target.closest('.sc'); if (!t || !t.classList.contains('top')) return; c = t; x0 = e.clientX; y0 = e.clientY; dx = dy = 0; c.style.transition = 'none'; c.setPointerCapture(e.pointerId); });
  box.addEventListener('pointermove', (e) => { if (!c) return; dx = e.clientX - x0; dy = e.clientY - y0; c.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx * .07}deg)`; $(c, '.like').style.opacity = clamp(dx / 80, 0, 1); $(c, '.nope').style.opacity = clamp(-dx / 80, 0, 1); });
  box.addEventListener('pointerup', () => { if (!c) return; const t = c; c = null; t.style.transition = '';
    if (Math.abs(dx) > 90){ const dir = Math.sign(dx); t.style.transition = 'transform .4s ease-out, opacity .4s'; t.style.transform = `translate(${dir * 420}px, ${dy + 40}px) rotate(${dir * 35}deg)`; t.style.opacity = 0; t.classList.remove('top'); setTimeout(() => { t.remove(); const n = mk(); n.style.opacity = 0; box.prepend(n); requestAnimationFrame(layout); }, 380); requestAnimationFrame(() => { const rest = [...box.children].filter(x => x !== t); rest.forEach((x, i) => { const d = rest.length - 1 - i; x.classList.toggle('top', d === 0); x.style.transform = `translateY(${d * 10}px) scale(${1 - d * .05})`; }); }); }
    else { t.style.transition = 'transform .5s cubic-bezier(.34,1.56,.64,1)'; t.style.transform = 'none'; $$(t, '.stamp').forEach(s => s.style.opacity = 0); } });
}
function hoverImage(el){
  const fl = $(el, '.mo-hfloat'); let tx = 0, ty = 0, x = 0, y = 0;
  el.addEventListener('pointermove', (e) => { const p = local(el, e); tx = p.x + 70; ty = p.y - 10; });
  $$(el, '.mo-hlist a').forEach((a, i) => { a.addEventListener('mouseenter', () => { fl.style.background = GRAD[i * 2 % 8]; fl.classList.add('on'); }); });
  $(el, '.mo-hlist').addEventListener('mouseleave', () => fl.classList.remove('on'));
  return VD.loop(el, (dt) => { const k = Math.min(1, dt * 10); const vx = (tx - x) * k; x += vx; y += (ty - y) * k; fl.style.translate = `${x}px ${y}px`; fl.style.rotate = clamp(vx * .6, -14, 14) + 'deg'; });
}
function blob(el){
  const b = $(el, '.mo-blob'), area = $(el, '.mo-blobarea'); let tx = area.clientWidth / 2, ty = area.clientHeight / 2, x = tx, y = ty;
  area.addEventListener('pointermove', (e) => { const p = local(area, e); tx = p.x; ty = p.y; });
  area.addEventListener('pointerleave', () => { tx = area.clientWidth / 2; ty = area.clientHeight / 2; });
  return VD.loop(el, (dt) => { const k = Math.min(1, dt * 4); x += (tx - x) * k; y += (ty - y) * k; b.style.translate = `${x}px ${y}px`; });
}
function flipWords(el){
  const box = $(el, '.box'); const W = ['作る', '試す', '届ける', '学ぶ']; let k = 0, alive = true;
  const step = () => { if (!alive) return; k = (k + 1) % W.length; const old = box.firstElementChild, nw = document.createElement('span'); nw.textContent = W[k]; box.append(nw);
    old.animate([{ transform:'rotateX(0deg)', opacity:1 }, { transform:'rotateX(90deg)', opacity:0 }], { duration:500, easing:'cubic-bezier(.65,0,.35,1)', fill:'forwards' }).onfinish = () => old.remove();
    nw.animate([{ transform:'rotateX(-90deg)', opacity:0 }, { transform:'rotateX(0deg)', opacity:1 }], { duration:500, easing:'cubic-bezier(.65,0,.35,1)' }); setTimeout(step, 1900); };
  const t = setTimeout(step, 1600); return () => { alive = false; clearTimeout(t); };
}
function particleText(el){
  const { ctx, w, h } = VD.canvas(el); const off = document.createElement('canvas'); off.width = w; off.height = h; const o = off.getContext('2d');
  o.fillStyle = '#000'; o.font = `900 ${Math.min(h * .55, w * .26)}px "Noto Sans JP", sans-serif`; o.textAlign = 'center'; o.textBaseline = 'middle'; o.fillText('VIBE', w / 2, h / 2);
  const data = o.getImageData(0, 0, w, h).data, ps = []; const step = Math.max(4, Math.round(w / 90));
  for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) if (data[(y * w + x) * 4 + 3] > 128) ps.push({ tx:x, ty:y, x:Math.random() * w, y:Math.random() * h, vx:0, vy:0 });
  let mx = -999, my = -999; const acc = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  el.addEventListener('pointermove', (e) => { const p = local(el, e); mx = p.x; my = p.y; }); el.addEventListener('pointerleave', () => { mx = my = -999; });
  el.addEventListener('pointerdown', () => ps.forEach(p => { p.vx += (Math.random() - .5) * 900; p.vy += (Math.random() - .5) * 900; }));
  return VD.loop(el, (dt) => { ctx.fillStyle = '#0d0d16'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = acc;
    ps.forEach(p => { p.vx += (p.tx - p.x) * 40 * dt; p.vy += (p.ty - p.y) * 40 * dt; const dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy; if (d2 < 3600){ const f = (3600 - d2) / 3600 * 2400 * dt; const d = Math.sqrt(d2) || 1; p.vx += dx / d * f; p.vy += dy / d * f; } p.vx *= Math.pow(.02, dt); p.vy *= Math.pow(.02, dt); p.x += p.vx * dt; p.y += p.vy * dt; ctx.fillRect(p.x, p.y, step * .6, step * .6); }); });
}
function rubber(el){
  const fr = $(el, '.mo-rubber'), k = $(el, '.knob'); let drag = false, sx = 0, sy = 0, x = 0, y = 0, vx = 0, vy = 0, raf = 0;
  const rb = (d, dim) => (1 - 1 / (Math.abs(d) * .55 / dim + 1)) * dim * Math.sign(d);
  const set = () => k.style.transform = `translate(${x}px, ${y}px)`;
  k.addEventListener('pointerdown', (e) => { drag = true; sx = e.clientX; sy = e.clientY; cancelAnimationFrame(raf); k.setPointerCapture(e.pointerId); });
  k.addEventListener('pointermove', (e) => { if (!drag) return; x = rb(e.clientX - sx, fr.clientWidth / 2); y = rb(e.clientY - sy, fr.clientHeight / 2); set(); });
  k.addEventListener('pointerup', () => { if (!drag) return; drag = false; vx = vy = 0; let last = performance.now();
    const step = (now) => { const dt = Math.min(.032, (now - last) / 1000); last = now; vx += (-260 * x - 18 * vx) * dt; vy += (-260 * y - 18 * vy) * dt; x += vx * dt; y += vy * dt; set(); if (Math.abs(x) + Math.abs(y) + Math.abs(vx) + Math.abs(vy) > .2) raf = requestAnimationFrame(step); else { x = y = 0; set(); } };
    raf = requestAnimationFrame(step); });
  return () => cancelAnimationFrame(raf);
}
function holo(el){
  const c = $(el, '.mo-holo');
  c.addEventListener('pointermove', (e) => { const p = local(c, e); const px = p.x / p.w, py = p.y / p.h; c.classList.add('on'); c.style.transform = `perspective(700px) rotateY(${(px - .5) * 26}deg) rotateX(${(.5 - py) * 26}deg)`; c.style.setProperty('--px', (px * 100) + '%'); c.style.setProperty('--py', (py * 100) + '%'); c.style.setProperty('--gx', (px * 100) + '%'); c.style.setProperty('--gy', (py * 100) + '%'); });
  c.addEventListener('pointerleave', () => { c.classList.remove('on'); c.style.transform = ''; });
}
function goo(el){
  const w = $(el, '.mo-goow'), g = $(el, '.mo-goo'), b = $(el, '.mo-goo-btn'), ics = $$(el, '.mo-goo-ic'); const P = [[-64, -50], [0, -80], [64, -50]];
  b.onclick = () => { const open = !w.classList.contains('open'); w.classList.toggle('open', open); g.classList.toggle('open', open); b.classList.toggle('open', open); ics.forEach((ic, i) => ic.style.transform = open ? `translate(${P[i][0]}px, ${P[i][1]}px)` : ''); };
}
function letterRoll(el){ $$(el, '.mo-roll').forEach(a => { const t = a.textContent; a.innerHTML = [...t].map((ch, i) => `<span class="l"><span style="--i:${i}">${ch === ' ' ? '&nbsp;' : ch}</span></span>`).join(''); }); }

const TREND = [
  { name:'光が走る文字（シャイニーテキスト）', en:'Shiny / shimmer text', h:150, demo: center('<div class="mo-col"><span class="mo-pillbadge"><span class="mo-shiny">✨ 新機能が追加されました →</span></span><span class="mo-shiny" style="font-size:26px">Introducing Vibe</span></div>'), tags:['お知らせバッジ'],
    desc:'グラデーションの<b>光の帯が文字の上を流れる</b>。新機能のお知らせバッジや、AIが考え中の「Thinking…」表示でよく見る。', prompt:'お知らせバッジの文字に、左から右へ光の帯が流れ続けるシマー効果を付けて（文字を background-clip: text で切り抜き、明るい帯のグラデーションの background-position をアニメーション）。',
    code:'.shiny { background: linear-gradient(110deg, #888 35%, #fff 50%, #888 65%); background-size: 250% 100%;\n  -webkit-background-clip: text; background-clip: text; color: transparent; animation: shine 2.6s linear infinite; }\n@keyframes shine { from { background-position: 120% 0; } to { background-position: -20% 0; } }' },
  { name:'枠を光が一周する（ボーダービーム）', en:'Border beam', h:160, demo: center('<div class="mo-beam"><b>Pro プラン</b><p style="margin:6px 0 0;font-size:12px;color:var(--muted)">枠に沿って光が一周します</p></div>'), tags:['おすすめ強調','@property'],
    desc:'カードの枠線に沿って、<b>短い光が回り続ける</b>。おすすめプランや注目のカードの強調に。<code>@property</code> で角度を登録した conic-gradient を、マスクで枠の部分だけ見せて作る。', prompt:'おすすめプランのカードの枠線に沿って、短い光（紫→オレンジ）が3秒で一周し続ける「ボーダービーム」を付けて。@property で角度を登録した conic-gradient を、mask で枠線の幅だけ見せる方法で。',
    code:'@property --a { syntax:"<angle>"; initial-value:0deg; inherits:false; }\n.card::before { content:""; position:absolute; inset:-1px; border-radius:inherit; padding:1.5px;\n  background: conic-gradient(from var(--a), transparent 0 290deg, #c026d3 330deg, #fb923c 352deg, transparent 360deg);\n  mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0); animation: spin 3.2s linear infinite; }\n@keyframes spin { to { --a: 360deg; } }' },
  { name:'カーソルを共有する光るカード群', en:'Glowing card grid', h:190, demo: center('<div class="mo-ggrid">' + [['高速', '0.3秒でプレビュー'], ['安全', 'データは暗号化'], ['共同編集', 'チームで同時作業'], ['AI搭載', '指示するだけ']].map(c => `<div class="g"><b>${c[0]}</b>${c[1]}</div>`).join('') + '</div>'), tags:['ダークUI','話題'], hint:'カード群の上を動かす',
    init:(el) => glowGrid(el),
    desc:'カーソルの周りだけ<b>カードの枠線がほんのり光り</b>、隣のカードにも光がにじむ。1つの光源が複数のカードを照らしているように見える。Linear・Vercel風のダークなサイトで人気。', prompt:'暗い背景のカードグリッドで、マウスカーソルの位置を全カードに共有し、カーソルの近くだけ各カードの枠線とうっすら内側が紫に光るようにして（各カードに --x, --y を設定し、radial-gradient を枠線だけマスクで表示）。' },
  { name:'Dock のように拡大', en:'macOS Dock magnification', h:180, stage:'free', demo:'<div class="mo-dockbg"></div><div class="mo-dock">' + GRAD.slice(0, 7).map(g => `<i style="background:${g}"></i>`).join('') + '</div>', tags:['話題','ナビ'], hint:'アイコンの上を動かす',
    init:(el) => dock(el),
    desc:'カーソルに近いアイコンほど<b>大きく膨らみ</b>、両隣もなだらかに大きくなる。macOSのDockでおなじみの動きで、Webのナビゲーションでも再現例がよく紹介される。', prompt:'macOSのDockのようなアイコンバーを作って。マウスのX座標からの距離が110px以内のアイコンを、近いほど最大1.85倍に大きくし、離れたら元に戻るように。Reactなら Motion の useSpring で滑らかに。' },
  { name:'ダイナミックアイランド', en:'Dynamic Island morph', h:240, stage:'free', demo:'<div class="mo-island"><div class="c" data-s="idle"></div><div class="c" data-s="call"><i class="av"></i><span>山田さん</span><span class="grn">0:12</span></div><div class="c" data-s="music"><i class="av" style="border-radius:6px;background:linear-gradient(135deg,#f97316,#facc15)"></i><span>Lo-fi Beats</span><span class="eq"><b></b><b></b><b></b></span></div><div class="c" data-s="timer"><span>⏱ タイマー</span><span class="grn">04:59</span></div><div class="c big" data-s="big"><b style="font-size:14px">AirPods Pro</b><span style="color:#a1a1aa">接続しました・バッテリー 82%</span></div></div><div class="mo-row" style="position:absolute;left:0;right:0;bottom:14px">' + [['idle', '待機'], ['call', '通話'], ['music', '音楽'], ['timer', 'タイマー'], ['big', '展開']].map(x => `<button class="mo-btn sm ghost" data-go="${x[0]}">${x[1]}</button>`).join('') + '</div>', tags:['iPhone風','話題'],
    init:(el) => island(el),
    desc:'黒い小さな枠が、状況に合わせて<b>弾力のある動きで伸び縮み</b>し、中身が入れ替わる。iPhoneのDynamic Islandの表現で、Webの通知や再生中表示に応用される。', prompt:'iPhoneのダイナミックアイランド風の黒い角丸の枠を作って。状態（待機・通話・音楽・タイマー・展開）に応じて幅・高さ・角丸が少し行き過ぎて戻るバネの動き（cubic-bezier(.34,1.25,.64,1)）で変わり、中身はぼかしながら入れ替わるように。' },
  { name:'くっついて分かれるボタン（グーイー）', en:'Gooey menu', h:200, stage:'free', demo:'<svg width="0" height="0" style="position:absolute"><filter id="mo-goo-f"><feGaussianBlur in="SourceGraphic" stdDeviation="9" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" result="g"/><feComposite in="SourceGraphic" in2="g" operator="atop"/></filter></svg>' + center('<div class="mo-goow"><div class="mo-goo"><i></i><i></i><i></i><i></i></div><span class="mo-goo-ic">✎</span><span class="mo-goo-ic">📷</span><span class="mo-goo-ic">🔗</span><button class="mo-goo-btn" aria-label="メニュー">＋</button></div>'), tags:['SVGフィルター'],
    init:(el) => goo(el),
    desc:'丸いボタンから、<b>液体のようにくっついたまま</b>小さな丸が分かれて出てくる。SVGのぼかし＋コントラスト強調フィルターで、近づいた図形同士がとろりとつながって見える。', prompt:'右下のFABを押すと、3つのサブボタンが液体のようにくっついたまま分かれて上に広がる「グーイー」メニューにして（SVGの feGaussianBlur と feColorMatrix のフィルターを親にかける）。' },
  { name:'リキッドグラス風', en:'Liquid glass', h:210, stage:'free', demo:'<div class="mo-lgbg"><i style="width:110px;height:110px;left:8%;top:10%;background:#fde047"></i><i style="width:80px;height:80px;right:12%;bottom:12%;background:#22d3ee"></i><p style="top:16px">GLASS<br>INTERFACE</p><p style="bottom:16px;text-align:right">ドラッグして<br>動かしてみて</p></div><div class="mo-glass">Liquid Glass</div>', tags:['話題','iOS風'], hint:'ガラスをドラッグ',
    init:(el) => glass(el),
    desc:'背景を<b>ぼかし・彩度を上げ</b>、縁に光の反射（ハイライト）を重ねて、厚みのあるガラスのように見せる。Appleの新しいデザイン「Liquid Glass」が発表されてから、Webでの再現がXなどで盛んに共有されている。本物の屈折はSVGの変位フィルターで近づけられる（ブラウザ対応に差がある）。', prompt:'背景の上に重なるピル型のボタンを、Liquid Glass風にして。backdrop-filter で軽いぼかし＋彩度1.8倍＋少し明るく、box-shadow の inset で上辺の強いハイライトと縁の反射を重ね、ドラッグで動かせて、つかむと少し膨らむように。' },
  { name:'テーマ切替の円形リビール', en:'View Transitions theme reveal', h:150, demo: center('<div class="mo-col"><button class="mo-btn">◐ テーマを切り替える</button><span class="mo-lbl sup"></span></div>'), tags:['話題','View Transitions'],
    init:(el) => themeReveal(el),
    desc:'押した場所から<b>円が広がって、ページ全体の配色が切り替わる</b>（このページで実際に動きます）。View Transitions API で切り替え前後の画面を撮り、新しい画面を clip-path の円で広げる。Xで繰り返し話題になる定番の演出。', prompt:'ダークモード切替ボタンを押したら、押した位置から円が広がって新しいテーマが現れるようにして。document.startViewTransition でテーマを切り替え、::view-transition-new(root) に clip-path: circle() の拡大アニメーションをかける。未対応ブラウザと「視差効果を減らす」設定では普通に切り替えて。',
    code:"btn.onclick = async (e) => {\n  if (!document.startViewTransition) return toggleTheme();\n  const r = Math.hypot(Math.max(e.clientX, innerWidth - e.clientX), Math.max(e.clientY, innerHeight - e.clientY));\n  await document.startViewTransition(toggleTheme).ready;\n  document.documentElement.animate(\n    { clipPath: [`circle(0 at ${e.clientX}px ${e.clientY}px)`, `circle(${r}px at ${e.clientX}px ${e.clientY}px)`] },\n    { duration: 650, easing: 'cubic-bezier(.4,0,.2,1)', pseudoElement: '::view-transition-new(root)' });\n};\n/* CSS: ::view-transition-old(root), ::view-transition-new(root) { animation: none; mix-blend-mode: normal; } */" },
  { name:'段階的なぼかし（プログレッシブブラー）', en:'Progressive blur', h:200, stage:'free', demo:'<div class="mo-pblur"><div class="pic"></div><div class="layers">' + [0, 1, 2, 3, 4, 5].map(k => `<i style="backdrop-filter:blur(${.5 * Math.pow(2, k)}px);-webkit-backdrop-filter:blur(${.5 * Math.pow(2, k)}px);-webkit-mask:linear-gradient(to bottom, transparent ${k * 15}%, #000 ${k * 15 + 15}%, #000 ${k === 5 ? 100 : k * 15 + 30}%, transparent ${k === 5 ? 100 : k * 15 + 45}%);mask:linear-gradient(to bottom, transparent ${k * 15}%, #000 ${k * 15 + 15}%, #000 ${k === 5 ? 100 : k * 15 + 30}%, transparent ${k === 5 ? 100 : k * 15 + 45}%)"></i>`).join('') + '</div><div class="cap"><b>Kyoto, Autumn</b><span>下に行くほど強くぼける</span></div></div>', tags:['話題','画像の上の文字'],
    desc:'画像の下側が、<b>上から下へだんだん強くぼける</b>。一律のぼかしより自然で、上に載せた文字も読みやすい。ぼかしの強さが違う層を何枚も重ね、それぞれをグラデーションのマスクで帯状に見せて作る。', prompt:'カード画像の下半分に、下へ行くほど強くなる段階的なぼかし（プログレッシブブラー）をかけて、その上に白い文字のキャプションを載せて。backdrop-filter の強さが異なる6枚の層を、帯状のグラデーションマスクで重ねる方法で。' },
  { name:'パタパタ時計（スプリットフラップ）', en:'Split-flap display', h:160, demo: center('<div class="mo-flapw"><div class="mo-flap"></div><div class="mo-flap"></div><span class="sep">:</span><div class="mo-flap"></div><div class="mo-flap"></div><span class="sep">:</span><div class="mo-flap"></div><div class="mo-flap"></div></div>'), tags:['レトロ','数字'],
    init:(el) => flapClock(el),
    desc:'数字が変わるたびに<b>板の上半分がパタンと倒れて</b>次の数字になる。空港の発着案内のような質感で、カウントダウンや統計の表示に味が出る。', prompt:'現在時刻を、数字が変わるたびに上半分の板が手前に倒れて新しい数字が現れるスプリットフラップ（パタパタ時計）風に表示して。上半分は rotateX(0→-90deg)、続けて下半分は rotateX(90→0deg) で。' },
  { name:'カードスワイプ', en:'Swipe cards', h:260, stage:'free', demo: center('<div class="mo-swipe"></div>'), tags:['マッチングアプリ風'], hint:'左右にドラッグ',
    init:(el) => swipe(el),
    desc:'カードを指で左右に払うと、<b>傾きながら飛んでいき</b>、後ろのカードが繰り上がる。途中で離すとバネで戻る。払う方向に「LIKE / NOPE」がにじみ出る。', prompt:'カードを重ねて表示し、一番上のカードをドラッグで左右に動かせるようにして。動かした量に比例して回転し、右ならLIKE・左ならNOPEのスタンプが濃くなる。90px以上動かして離したら画面外へ飛ばして次のカードを繰り上げ、それ未満ならバネで元に戻るように。' },
  { name:'ホバーで画像が追いかける', en:'Hover image reveal', h:230, stage:'free', demo:'<div class="mo-hlist">' + [['Brand Renewal', '2026'], ['Mobile App', '2025'], ['Motion Study', '2025'], ['Exhibition', '2024']].map(x => `<a>${x[0]}<span>${x[1]}</span></a>`).join('') + '</div><div class="mo-hfloat"></div>', tags:['ポートフォリオ','話題'], hint:'項目にホバー',
    init:(el) => hoverImage(el),
    desc:'作品名にホバーすると、その作品の画像が<b>カーソルを少し遅れて追いかけ</b>、動いた方向に傾く。文字だけのシンプルな一覧が一気に華やかになる。', prompt:'作品一覧のテキストにホバーすると、その作品のサムネイル画像がカーソルの右側に現れ、少し遅れて追いかけるように（線形補間）動き、移動の速さに応じて傾くようにして。一覧から外れたら縮んで消えるように。' },
  { name:'文字が1文字ずつ回転する（ホバー）', en:'Letter roll hover', h:150, demo: center('<div class="mo-col"><a class="mo-roll">Get started →</a><a class="mo-roll" style="font-size:20px">はじめてみる</a></div>'), tags:['リンク','CSSのみ'], hint:'ホバーしてみて',
    init:(el) => letterRoll(el),
    desc:'ホバーすると、文字が<b>1文字ずつ少しずつ遅れて上に回り</b>、下から別の色の同じ文字が出てくる。text-shadow で下に複製を作れば、要素を増やさずに作れる。', prompt:'ボタンやリンクの文字を1文字ずつspanに分け、ホバーすると各文字が25msずつ遅れて上にスライドし、下からアクセントカラーの同じ文字が現れるようにして（text-shadow で下に文字を複製する方法で）。' },
  { name:'紙吹雪キャノン', en:'Confetti cannons', h:210, stage:'free', demo: center('<button class="mo-btn">🎊 お祝いする</button>'), tags:['お祝い'],
    init:(el) => { const L = confettiLayer(el); $(el, '.mo-btn').onclick = () => { L.burst(10, L.h - 10, 70, -62, 30, 760); L.burst(L.w - 10, L.h - 10, 70, -118, 30, 760); }; return L.stop; },
    desc:'画面の<b>左下と右下から紙吹雪を打ち上げる</b>。購入完了・レベルアップ・目標達成などの特別な瞬間に。', prompt:'目標を達成したら、画面の左下と右下から斜め上に向かって紙吹雪を打ち上げる演出を入れて（canvas-confetti の origin と angle を使って2回発射）。' },
  { name:'追いかけて光るブロブ', en:'Blob cursor', h:200, stage:'free', demo:'<div class="mo-blobarea"><div class="mo-blob"></div><h6>Move your cursor</h6></div>', tags:['ヒーロー背景'], hint:'カーソルを動かす',
    init:(el) => blob(el),
    desc:'ぼかした色のかたまりが、<b>カーソルをゆっくり追いかける</b>。上の文字は色が反転して読める。暗いヒーローセクションを生き生きさせる。', prompt:'暗いヒーローセクションで、ぼかした虹色のかたまり（blur 22px、ゆっくり回転）がマウスカーソルを遅れて追いかけるようにして。見出しは mix-blend-mode: difference で重なっても読めるように。' },
  { name:'重なったアバターが広がる', en:'Avatar stack expand', h:150, demo: center('<div class="mo-avs">' + [['山', '山田'], ['佐', '佐藤'], ['鈴', '鈴木'], ['高', '高橋'], ['+3', 'ほか3人']].map((a, i) => `<span class="a" style="background:${GRAD[i]}">${a[0]}<span class="n">${a[1]}</span></span>`).join('') + '</div>'), tags:['チーム','CSSのみ'], hint:'ホバーしてみて',
    desc:'重なって並ぶアバターが、ホバーで<b>弾むように間隔を広げ</b>、1人ずつ名前が出る。省スペースで、見たいときだけ詳しく見せられる。', prompt:'参加者のアバターを-14pxずつ重ねて並べ、グループにホバーしたら間隔が6pxに弾むように広がり、各アバターにホバーで少し浮いて名前のツールチップが出るようにして。' },
  { name:'3Dで回転する単語', en:'Flip words', h:150, demo: center('<div class="mo-fw">AIで<span class="box"><span>作る</span></span></div>'), tags:['キャッチコピー'],
    init:(el) => flipWords(el),
    desc:'文中の単語だけが、<b>立方体が回るように</b>次の単語へ入れ替わる。上下のスライドより立体感がある。', prompt:'キャッチコピーの一部の単語を、1.9秒ごとに立方体が回転するように（古い単語は rotateX(90deg) へ、新しい単語は rotateX(-90deg) から）次の単語へ入れ替えて。' },
  { name:'粒子が集まって文字になる', en:'Particle text', h:200, stage:'free', tags:['インパクト'], hint:'なぞる・クリック',
    init:(el) => particleText(el),
    desc:'散らばった粒子が<b>集まって文字</b>を作り、カーソルを近づけると逃げ、クリックで弾け飛んでまた集まる。文字の形を画像として読み取り、各粒子の目的地にする。', prompt:'Canvasで、ランダムな位置の粒子がバネのように集まって「VIBE」の文字を形作るようにして。マウスが近づくと粒子が逃げ、クリックすると弾け飛んでまた集まる。文字の形は別のCanvasに描いて getImageData で読み取って。' },
  { name:'ゴムのように引っぱる', en:'Rubber banding', h:210, stage:'free', demo:'<div class="mo-rubber"><div class="knob"></div></div>', tags:['ドラッグ','細部'], hint:'四角をドラッグ',
    init:(el) => rubber(el),
    desc:'引っぱるほど<b>重くなって伸びにくくなり</b>、離すとバネで戻る。スマホの端まで引いたときの「これ以上行けない」手触り。いきなり止めるより自然に限界が伝わる。', prompt:'ドラッグできる要素に「ラバーバンド」効果を付けて。引いた距離 d に対して (1 - 1/(d×0.55/幅 + 1)) × 幅 だけ動かして引くほど重くし、離したらバネの物理計算で元の位置に戻るように。' },
  { name:'キラキラ光るカード（ホログラム）', en:'Holographic card', h:250, demo: center('<div class="mo-holo"><b>VIBE CARD</b><small>No.001 ・ Rare</small></div>'), tags:['話題','3D'], hint:'カードの上を動かす',
    init:(el) => holo(el),
    desc:'カードが<b>カーソルの方へ立体的に傾き</b>、虹色の反射と光沢が角度に合わせて動く。トレーディングカードのキラ加工をCSSで再現した表現として、Xでたびたび話題になる。', prompt:'カードにホログラム効果を付けて。マウスの位置に合わせて最大13度3Dに傾け、虹色の縞模様（mix-blend-mode: color-dodge）の位置と、白い光沢の radial-gradient の中心をマウスに追従させて。離れたらゆっくり戻るように。' },
];

TABS.push({
  id:'trend', label:'話題の演出', icon:'✦',
  intro:'X（旧Twitter）などで、デザイナーやエンジニアが共有して<b>繰り返し話題になる定番の動き</b>を集めました。実際に触って確かめられます。使いすぎると疲れるので、1画面に1つの「見せ場」として使うのがコツです。',
  sections:[
    { title:'光・質感', items: TREND.filter((_, i) => [0, 1, 2, 6, 8, 19].includes(i)).map(x => Object.assign({ h:x.h || 180 }, x)) },
    { title:'形が変わる・くっつく', items: TREND.filter((_, i) => [3, 4, 5, 9, 16].includes(i)) },
    { title:'触って遊べる', items: TREND.filter((_, i) => [7, 10, 11, 12, 14, 17, 18].includes(i)) },
    { title:'お祝い・人', items: TREND.filter((_, i) => [13, 15].includes(i)) },
  ]
});

/* ---------- 動きの調整 ---------- */
function interruptDemo(el){
  const lanes = $$(el, '.mo-int'); const setD = () => lanes.forEach(l => l.style.setProperty('--d', (l.clientWidth - 34) + 'px')); setD();
  let on = false; $(el, '.mo-btn').onclick = () => { on = !on; const [kf, tr] = lanes; kf.classList.toggle('on', on); kf.classList.toggle('off', !on); tr.classList.toggle('on', on); };
}
function springDemo(el){
  const box = $(el, '.mo-spr'), i = $(box, '.tr i'), tr = $(box, '.tr'), ins = $$(box, 'input'), st = $(box, '.st'); let x = 0, v = 0, target = 0, raf = 0, last = 0;
  const P = () => ({ k:+ins[0].value, c:+ins[1].value, m:+ins[2].value });
  const settle = () => { const { k, c, m } = P(); let px = 0, pv = 0, t = 0; const T = 1; while (t < 6){ for (let s = 0; s < 4; s++){ pv += ((-k * (px - T) - c * pv) / m) / 480; px += pv / 480; } t += 1 / 120; if (Math.abs(px - T) < .002 && Math.abs(pv) < .01) break; } return Math.round(t * 1000); };
  const upd = () => { ins.forEach(n => n.nextElementSibling.textContent = n.value); st.textContent = `止まるまで 約${settle()}ms`; };
  ins.forEach(n => n.oninput = upd); upd();
  const run = (now) => { const dt = Math.min(.032, (now - last) / 1000); last = now; const { k, c, m } = P(); for (let s = 0; s < 4; s++){ v += ((-k * (x - target) - c * v) / m) * dt / 4; x += v * dt / 4; } i.style.transform = `translateX(${x * (tr.clientWidth - 44)}px)`; if (Math.abs(x - target) > .001 || Math.abs(v) > .01) raf = requestAnimationFrame(run); };
  $(box, '.mo-btn').onclick = () => { target = target ? 0 : 1; cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(run); };
  return () => cancelAnimationFrame(raf);
}
function staggerDemo(el){ const b = $(el, '.mo-stg'); retrigger(b, 'go'); const iv = setInterval(() => retrigger(b, 'go'), 2600); return () => clearInterval(iv); }

TABS.push({
  id:'tune', label:'動きの調整・コツ', icon:'⚖',
  intro:'同じアニメーションでも、<b>大きさ・速さ・起点・カーブ</b>の小さな違いで「気持ちいい」か「うっとうしい」かが分かれます。左右を見比べて、AIに直してもらうときの言葉として使ってください。 ばね・イージング・慣性の<b>中身の計算</b>は <a href="motion-math.html#spring">動きの計算辞典</a> へ。',
  sections:[
    { title:'見比べる', items:[
      { name:'scale(0) から出さない', en:'Don\'t animate from scale(0)', h:180, stage:'free', demo:'<div class="mo-cmp"><div><span class="tag ng">× scale(0) から</span><div class="mo-mini s0"><b>ダイアログ</b>どこからともなく湧く</div></div><div><span class="tag ok">○ 0.95＋フェード</span><div class="mo-mini s95"><b>ダイアログ</b>自然に現れる</div></div></div>', tags:['細部','比較'],
        desc:'何もない点（scale(0)）から膨らむと、大げさで不自然。<b>0.9〜0.97倍＋透明から</b>始めると、そこにあったものがふわっと現れたように見える。', prompt:'モーダルやポップオーバーの出現アニメーションを、scale(0) からではなく scale(0.95)・opacity 0 から始めるように直して。' },
      { name:'登場に ease-in を使わない', en:'Ease-out for entering', h:170, stage:'free', demo:'<div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:14px"><span class="mo-lbl">× ease-in（もたつく）</span><div class="mo-lane ein"><i></i></div><span class="mo-lbl">○ ease-out（キビキビ）</span><div class="mo-lane eout"><i></i></div></div>', tags:['イージング','比較'],
        desc:'ease-in は<b>ゆっくり動き出す</b>ので、押してから反応するまでが遅く感じる。画面に入ってくる・ユーザー操作に応える動きは<b>ease-out（最初が速い）</b>が基本。', prompt:'UIの登場アニメーションと操作への反応は、すべて ease-out 系（cubic-bezier(.2,.8,.2,1) など）にして。ease-in は画面から出ていく動きだけに使って。' },
      { name:'途中で止められるか', en:'Interruptible animations', h:190, stage:'free', demo:'<div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:10px"><span class="mo-lbl">× keyframes（途中で押すと端へワープ）</span><div class="mo-int kf"><i></i></div><span class="mo-lbl">○ transition（今の位置から引き返す）</span><div class="mo-int tr"><i></i></div><button class="mo-btn sm">連打してみて</button></div>', tags:['細部','比較'],
        init:(el) => interruptDemo(el),
        desc:'ユーザーは動きの途中でも操作する。keyframes は途中で切り替えると<b>最初からやり直して位置が飛ぶ</b>が、transition やスプリングは<b>今いる位置から自然に引き返す</b>。開閉・ホバー・トグルなど何度も切り替わるものは transition で。', prompt:'開閉や切り替えのアニメーションは、途中で再度操作されても位置が飛ばないように、@keyframes ではなく transition（またはスプリング）で実装して。' },
      { name:'スプリング（バネ）を調整する', en:'Spring tuning', h:230, stage:'free', demo:'<div class="mo-spr"><div class="tr"><i></i></div><label>硬さ stiffness<input type="range" min="50" max="600" value="260"><b>260</b></label><label>減衰 damping<input type="range" min="2" max="60" value="18"><b>18</b></label><label>重さ mass<input type="range" min=".5" max="4" step=".1" value="1"><b>1</b></label><div class="ft"><span class="st"></span><button class="mo-btn sm">動かす</button></div></div>', tags:['スプリング','実験'],
        init:(el) => springDemo(el),
        desc:'スプリングは「何秒で」ではなく<b>硬さ・減衰・重さ</b>で動きを決める。硬いほど速く、減衰が小さいほどよく弾み、重いほどゆったり。中断しても自然につながるのが強み。Motion（旧Framer Motion）やReact Springで使う値と同じ考え方。', prompt:'パネルの開閉を、Motion の type: "spring" で stiffness 260・damping 18・mass 1 にして。弾みすぎる場合は damping を上げて。' },
      { name:'スタッガーの間隔', en:'Stagger timing', h:190, stage:'free', demo:'<div class="mo-stg">' + [['15ms', '15ms'], ['50ms', '50ms'], ['150ms', '150ms']].map(r => `<div class="r" style="--g:${r[1]}"><span>${r[0]}</span><div class="bars">${Array.from({ length:7 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</div></div>`).join('') + '</div>', tags:['比較'],
        init:(el) => staggerDemo(el),
        desc:'ずらす間隔が<b>短すぎると一斉に見え、長すぎると待たされる</b>。項目数にもよるが30〜80msが目安で、全体が0.5秒程度に収まるようにする。', prompt:'一覧のスタッガーアニメーションの間隔を50msにして、項目が多い場合は全体が0.6秒を超えないよう、10件目以降は遅延を増やさないようにして。' },
    ]},
    { title:'気持ちいい動きのルール', layout:'rows', items:[
      { name:'すべてに目的を', en:'Purpose', desc:'アニメーションの役割は「<b>つながりを示す・状態の変化を伝える・注意を向ける・手応えを返す</b>」のどれか。目的のない動きは、ただ時間を奪う。', prompt:'このページのアニメーションを見直して、目的（つながり・状態変化・注意・手応え）のないものは削除するか短くして。' },
      { name:'よく使う操作ほど動かさない', en:'Frequency matters', desc:'1日に何十回も使う操作（キーボードショートカット、リストの移動、タブ切替）は、<b>アニメーションなし〜100ms程度</b>に。最初は楽しくても、毎回待たされると苛立ちになる。', tags:['大事'] },
      { name:'速さの目安', en:'Duration', desc:'ボタンの反応 100〜150ms、メニュー・ツールチップ 150〜250ms、モーダル 200〜300ms、画面遷移 300〜500ms。<b>閉じる・消える動きは開くより短く</b>。詳しくは <a href="web-design.html#easing">Webデザイン辞典のイージング</a>。' },
      { name:'起点と方向の一貫性', en:'Spatial consistency', desc:'メニューはボタンから開き、ボタンへ閉じる。右から入った画面は右へ戻る。<b>来た場所に帰る</b>と、画面の位置関係が頭の中で地図になる。' },
      { name:'動きは小さく', en:'Subtle distances', desc:'移動は<b>8〜24px</b>、拡大縮小は<b>0.95〜1.05倍</b>程度で十分。大きく動かすほど安っぽく、酔いやすくなる。' },
      { name:'transform と opacity だけを動かす', en:'Performance', desc:'width・top・margin などを動かすと、毎フレーム再計算されてカクつく。<b>位置・大きさ・回転は transform、出入りは opacity</b>で。高さはこの辞典のアコーディオンのような技で。', prompt:'アニメーションでレイアウトに影響するプロパティ（width, height, top, left, margin）を使っている箇所を、transform と opacity に置き換えて60fpsで動くようにして。' },
      { name:'「視差効果を減らす」設定を尊重', en:'prefers-reduced-motion', desc:'OSで動きを減らす設定をしている人には、<b>大きな移動・拡大・パララックス・自動ループを止め、フェードだけ</b>にする。酔いやすい人への大切な配慮。', code:'@media (prefers-reduced-motion: reduce) {\n  *, *::before, *::after { animation-duration:.01ms !important; animation-iteration-count:1 !important; transition-duration:.01ms !important; scroll-behavior:auto !important; }\n}', prompt:'prefers-reduced-motion: reduce の場合は、移動・拡大・パララックス・ループするアニメーションを無効にして、必要なものは短いフェードだけにして。' },
      { name:'CSS・JS・ライブラリの使い分け', en:'Choosing tools', desc:'<b>CSSのtransition</b>：ホバー・開閉など単純な切り替え。<b>@keyframes</b>：ループや決まった演出。<b>Web Animations API</b>：JSから細かく制御（この辞典の多くの見本）。<b>Motion / GSAP</b>：スプリング、レイアウト変化、スクロール連動、複雑なタイムライン。' },
      { name:'新しいCSSの対応状況', en:'Browser support', desc:'<code>@starting-style</code>・<code>linear()</code>・View Transitions（同一ページ）は主要ブラウザで使えるようになってきている。スクロール駆動アニメーションと <code>interpolate-size</code>（height:autoのアニメーション）はブラウザによって差がある。<b>未対応でも内容は普通に表示される</b>書き方にしておく。最新の対応は Can I use で確認。', links:[['Can I use', 'https://caniuse.com/']] },
    ]},
    { title:'参考にしたい作り手・サイト', note:'X（旧Twitter）でUIアニメーションの投稿や解説がよく話題になる作り手と、その公開物です。「〇〇のような動きで」とAIに伝えるときの参照先にも。', layout:'rows', items:[
      { name:'Emil Kowalski', en:'animations.dev / Sonner / Vaul', url:'https://animations.dev/', desc:'UIアニメーションの講座「animations.dev」の作者。トーストの「Sonner」、ドロワーの「Vaul」も公開しており、どちらもこの辞典で紹介した動きの元になっている。動きの細部（起点・速さ・中断）の解説が分かりやすい。' },
      { name:'Rauno Freiberg', en:'interfaces.rauno.me', url:'https://interfaces.rauno.me/', desc:'インタラクションの「見えない細部」を考察した文章や、操作感にこだわったUIの実験を公開している。' },
      { name:'Jhey Tompkins', en:'jhey.dev / CodePen', url:'https://codepen.io/jh3y', desc:'スクロール駆動アニメーション・View Transitions・anchor positioning など、新しいCSSを使った遊び心あるデモを多数公開。' },
      { name:'Josh W. Comeau', en:'joshwcomeau.com', url:'https://www.joshwcomeau.com/', desc:'スプリング、遊び心のあるインタラクション、CSSの仕組みをインタラクティブな記事で解説している。' },
      { name:'Adam Argyle', en:'transition.style / Open Props', url:'https://www.transition.style/', desc:'clip-path を使った出入りのトランジション集「transition.style」や、CSS変数のデザイントークン集「Open Props」の作者。' },
      { name:'NumberFlow', en:'number-flow.barvian.me', url:'https://number-flow.barvian.me/', desc:'数字が桁ごとに流れるように変わる部品。料金表やカウンターの表現の参考に。' },
      { name:'Motion の例集', en:'motion.dev', url:'https://motion.dev/', desc:'Motion（旧Framer Motion）の公式サイト。レイアウトアニメーション・スプリング・スクロール連動の実例が豊富。' },
      { name:'Magic UI / Aceternity UI / React Bits', en:'コピペで使える演出集', url:'https://magicui.design/', desc:'シャイニーテキスト・ボーダービーム・Dock・パーティクルなど、話題の演出がコンポーネントとして公開されている。', links:[['Aceternity UI', 'https://ui.aceternity.com/'], ['React Bits', 'https://reactbits.dev/']] },
      { name:'Codrops', en:'tympanus.net/codrops', url:'https://tympanus.net/codrops/', desc:'実験的なWebアニメーションのデモと、その作り方の解説記事が長年蓄積されている。' },
    ]},
  ]
});
})();
