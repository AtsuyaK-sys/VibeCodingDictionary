/* 動きの計算辞典 — A: 共通ヘルパー / 座標とベクトル / 補間とイージング / 速度・重力 / ばね */
(function(){
const { $, $$, esc, seg } = KIT;
const S = (title, items, note) => ({ title, note, layout:'rows', items });
const C = (title, items, note, lg) => ({ title, note, layout:lg ? 'cards lg' : 'cards', items });
const T = (name, en, desc, prompt, tags, more) => Object.assign({ name, en, desc, prompt, tags }, more || {});
const verdict = (el, cls, html) => { el.classList.remove('ok', 'bad', 'warn'); if (cls) el.classList.add(cls); el.innerHTML = html; };
const cssv = (el, n) => getComputedStyle(el).getPropertyValue(n).trim();
// キャンバスと色の準備
function cv(el, sel = '.mm-cv'){ const box = $(el, sel), c = Object.assign(VD.canvas(box), { box, ink:cssv(el, '--stage-ink') || '#222', mut:cssv(el, '--muted') || '#888', acc:cssv(el, '--accent') || '#65a30d', bd:cssv(el, '--border') || '#ddd', bad:cssv(el, '--bad') || '#d64545', ok:cssv(el, '--ok') || '#1f9d63' });
  // 後から入るボタンやスライダーで枠の大きさが変わったら、解像度を合わせて描き直す（c.redraw）
  // ドラッグできる点（box._pts）も同じ割合で動かす
  new ResizeObserver(() => { const w = box.clientWidth, h = box.clientHeight; if (!w || !h || (w === c.w && h === c.h)) return; const dpr = Math.min(3, window.devicePixelRatio || 1), sx = w / c.w, sy = h / c.h; (box._pts || []).forEach(list => list.forEach(p => { p[0] *= sx; p[1] *= sy; })); c.c.width = Math.round(w * dpr); c.c.height = Math.round(h * dpr); c.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); c.w = w; c.h = h; if (c.redraw) c.redraw(); }).observe(box);
  return c; }
function sliders(box, defs, on){ const st = {}; box.classList.add('mm-ctl');
  box.innerHTML = defs.map(([k, l, a, b, s, v]) => (st[k] = v, `<b>${l}</b><input type="range" min="${a}" max="${b}" step="${s}" value="${v}" data-k="${k}" aria-label="${l}"><output data-o="${k}"></output>`)).join('');
  const show = () => defs.forEach(d => { $(box, `[data-o="${d[0]}"]`).textContent = d[6] ? d[6](st[d[0]]) : st[d[0]]; });
  $$(box, 'input').forEach(i => i.oninput = () => { st[i.dataset.k] = +i.value; show(); if (on) on(st, i.dataset.k); }); show();
  st.set = (k, v) => { st[k] = v; const i = $(box, `[data-k="${k}"]`); if (i) i.value = v; show(); }; return st; }
const pos = (box, e) => { const r = box.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
// 点をドラッグできるようにする
function dragPts(box, pts, onMove, rad = 16){ let k = -1; (box._pts = box._pts || []).push(pts);
  box.addEventListener('pointerdown', (e) => { const [x, y] = pos(box, e); k = pts.findIndex(p => Math.hypot(p[0] - x, p[1] - y) < rad); if (k >= 0){ box.setPointerCapture(e.pointerId); e.preventDefault(); } });
  box.addEventListener('pointermove', (e) => { if (k < 0) return; const [x, y] = pos(box, e); pts[k][0] = Math.max(4, Math.min(box.clientWidth - 4, x)); pts[k][1] = Math.max(4, Math.min(box.clientHeight - 4, y)); onMove && onMove(k); });
  box.addEventListener('pointerup', () => { k = -1; }); }
function arrow(g, x1, y1, x2, y2, col, w = 2.5){ const a = Math.atan2(y2 - y1, x2 - x1), hl = 10; g.strokeStyle = col; g.fillStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); g.beginPath(); g.moveTo(x2, y2); g.lineTo(x2 - hl * Math.cos(a - .4), y2 - hl * Math.sin(a - .4)); g.lineTo(x2 - hl * Math.cos(a + .4), y2 - hl * Math.sin(a + .4)); g.fill(); }
const dot = (g, x, y, r, col) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
const f2 = (n, d = 2) => (Math.round(n * 10 ** d) / 10 ** d).toFixed(d);
// イージング関数
const EASE = { linear:(t) => t, easeInQuad:(t) => t * t, easeOutQuad:(t) => 1 - (1 - t) * (1 - t), easeInOutCubic:(t) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, easeOutBack:(t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }, easeOutElastic:(t) => t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * (2 * Math.PI) / 3) + 1, easeOutBounce:(t) => { const n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75; if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375; return n * (t -= 2.625 / d) * t + .984375; } };
// ばねのシミュレーション（位置1→0へ戻る。半陰的オイラー法）
function springCurve(k, c, m, dur = 2, dt = 1 / 240){ let x = 1, v = 0; const out = []; for (let t = 0; t <= dur; t += dt){ out.push(x); const a = (-k * x - c * v) / m; v += a * dt; x += v * dt; } return out; }
window.MMH = { S, C, T, verdict, cssv, cv, sliders, pos, dragPts, arrow, dot, f2, EASE, springCurve };

/* ================= 1. 座標とベクトル ================= */
TABS.push({ id:'basics', label:'座標とベクトル', icon:'📐',
  intro:'画面の動きは、<b>座標（x, y）</b>と<b>ベクトル（向きと大きさ）</b>で計算します。画面の座標は<b>左上が原点で、yは下向き</b>なのが数学との一番の違い。角度は<b>ラジアン</b>、向きは <code>Math.atan2</code>、長さは <code>Math.hypot</code>。ここを押さえると、ほとんどの動きが書けるようになります。',
  sections:[
    C('触って理解する', [
      { name:'画面の座標は y が下向き', en:'Screen coordinates', h:400, tags:['基本','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="mm-cv"><span class="tip">マウスを動かす</span></div><div class="mm-f out">マウスを動かしてください</div></div>',
        init:(el) => { let math = 0; const c = cv(el), g = c.ctx; let m = [c.w * .6, c.h * .4];
          const draw = () => { g.clearRect(0, 0, c.w, c.h); g.strokeStyle = c.bd; g.lineWidth = 1; for (let x = 0; x < c.w; x += 40){ g.beginPath(); g.moveTo(x, 0); g.lineTo(x, c.h); g.stroke(); } for (let y = 0; y < c.h; y += 40){ g.beginPath(); g.moveTo(0, y); g.lineTo(c.w, y); g.stroke(); }
            const oy = math ? c.h : 0; arrow(g, 4, oy || 4, c.w - 8, oy || 4, c.acc); arrow(g, 4, oy || 4, 4, math ? 8 : c.h - 8, c.acc); g.fillStyle = c.ink; g.font = '700 12px sans-serif'; g.fillText('x →', c.w - 40, math ? c.h - 10 : 20); g.fillText(math ? 'y ↑' : 'y ↓', 10, math ? 20 : c.h - 12); g.fillText('原点(0,0)', 8, math ? c.h - 10 : 18);
            dot(g, m[0], m[1], 6, c.bad); g.strokeStyle = c.bad; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(m[0], math ? c.h : 0); g.lineTo(m[0], m[1]); g.lineTo(0, m[1]); g.stroke(); g.setLineDash([]);
            const yy = math ? c.h - m[1] : m[1]; $(el, '.out').innerHTML = `x = <b>${Math.round(m[0])}</b>　y = <b>${Math.round(yy)}</b>　${math ? '（数学：上が＋。画面では y = 高さ − 画面のy）' : '（画面：左上が原点、下に行くほど y が大きい）'}`; };
          c.box.onpointermove = (e) => { m = pos(c.box, e); draw(); }; c.redraw = draw; $(el, '.sw').replaceWith(seg(['画面の座標', '数学の座標'], i => { math = i; draw(); }).el); },
        desc:'数学のグラフは「左下が原点・上が＋」ですが、画面（Canvas・CSS・SVG）は<b>左上が原点・下が＋</b>です。数式をそのまま使うと上下が逆になるので、重力は<b>＋（下向き）</b>、上に投げるときは<b>−</b>の速さ、と考えます。',
        prompt:'Canvas に、マウスの位置の座標を表示するデバッグ用の表示を作って。画面の座標（左上が原点・y下向き）と、数学の座標（左下が原点・y上向き）の両方を出し、変換の式をコメントで説明して。' },
      { name:'ベクトル（向きと大きさ）', en:'Vectors', h:460, tags:['基本','体験','最重要'],
        demo:'<div class="kt"><div class="mm-cv"><span class="tip">点 A・B をドラッグ</span></div><div class="mm-f out"></div></div>',
        init:(el) => { const c = cv(el), g = c.ctx, P = [[c.w * .25, c.h * .7], [c.w * .7, c.h * .3]];
          const draw = () => { g.clearRect(0, 0, c.w, c.h); const [a, b] = P, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ang = Math.atan2(dy, dx);
            g.strokeStyle = c.bd; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); g.setLineDash([]);
            arrow(g, a[0], a[1], b[0], b[1], c.acc, 3); if (L > 1) arrow(g, a[0], a[1], a[0] + dx / L * 50, a[1] + dy / L * 50, c.bad, 3);
            g.strokeStyle = c.mut; g.beginPath(); g.arc(a[0], a[1], 26, 0, ang, ang < 0); g.stroke();
            dot(g, a[0], a[1], 8, c.ink); dot(g, b[0], b[1], 8, c.ink); g.fillStyle = c.ink; g.font = '700 13px sans-serif'; g.fillText('A', a[0] - 18, a[1] + 18); g.fillText('B', b[0] + 10, b[1] - 10);
            $(el, '.out').innerHTML = `差（A→B）= (<b>${Math.round(dx)}</b>, <b>${Math.round(dy)}</b>)　長さ = Math.hypot(dx, dy) = <b>${f2(L, 1)}</b>\n向き（長さ1・赤）= (<b>${f2(dx / (L || 1))}</b>, <b>${f2(dy / (L || 1))}</b>)　角度 = Math.atan2(dy, dx) = <b>${f2(ang)}</b> rad（${Math.round(ang * 180 / Math.PI)}°）`; };
          dragPts(c.box, P, draw); c.redraw = draw; draw(); },
        desc:'<b>ベクトル</b>は「どっち向きに・どれだけ」の組。2点の<b>差</b>で向きが、<code>Math.hypot</code> で<b>長さ（距離）</b>が、長さで割ると<b>向きだけ（長さ1・正規化）</b>が、<code>Math.atan2</code> で<b>角度</b>が求まります。「Bに向かって毎秒200px進む」は「正規化した向き × 200 × 経過時間」です。',
        prompt:'キャラクターがクリックした地点に向かって一定の速さで移動し、到着したら止まる処理を書いて。2点の差から向きを正規化し、「速さ × 経過時間」で進め、行き過ぎないよう残りの距離と比べて。',
        code:'const dx = target.x - pos.x, dy = target.y - pos.y;\nconst dist = Math.hypot(dx, dy);            // 長さ（距離）\nif (dist > 0.5) {\n  const step = Math.min(speed * dt, dist);  // 行き過ぎない\n  pos.x += dx / dist * step;                // 正規化した向き × 進む量\n  pos.y += dy / dist * step;\n}\nconst angle = Math.atan2(dy, dx);           // 向き（ラジアン）' },
      { name:'単位円と sin・cos', en:'Unit circle', h:430, tags:['基本','体験'],
        demo:'<div class="kt"><div class="mm-cv"></div><div class="sl"></div><div class="mm-f out"></div></div>',
        init:(el) => { const st = sliders($(el, '.sl'), [['sp', '回る速さ', 0, 3, .1, 1, (v) => v + ' rad/秒']]); const c = cv(el), g = c.ctx; let a = 0; const hist = [];
          return VD.loop(c.box, (dt) => { a += st.sp * dt; const R = Math.min(c.h * .38, c.w * .2), cx = R + 20, cy = c.h / 2; hist.unshift(Math.sin(a)); if (hist.length > 400) hist.pop();
            g.clearRect(0, 0, c.w, c.h); g.strokeStyle = c.bd; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke(); g.beginPath(); g.moveTo(cx - R - 10, cy); g.lineTo(c.w - 6, cy); g.moveTo(cx, cy - R - 10); g.lineTo(cx, cy + R + 10); g.stroke();
            const px = cx + Math.cos(a) * R, py = cy - Math.sin(a) * R; g.strokeStyle = c.acc; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(px, py); g.stroke();
            g.strokeStyle = c.bad; g.beginPath(); g.moveTo(px, py); g.lineTo(px, cy); g.stroke(); g.strokeStyle = '#0ea5e9'; g.beginPath(); g.moveTo(cx, cy); g.lineTo(px, cy); g.stroke();
            const x0 = cx + R + 24; g.strokeStyle = c.mut; g.setLineDash([3, 3]); g.beginPath(); g.moveTo(px, py); g.lineTo(x0, py); g.stroke(); g.setLineDash([]);
            g.strokeStyle = c.bad; g.lineWidth = 2; g.beginPath(); hist.forEach((v, i) => { const x = x0 + i * 1.2, y = cy - v * R; if (x < c.w) i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); dot(g, px, py, 6, c.ink); dot(g, x0, py, 5, c.bad);
            const deg = ((a * 180 / Math.PI) % 360 + 360) % 360; $(el, '.out').innerHTML = `角度 <b>${Math.round(deg)}°</b>（${f2(a % (Math.PI * 2))} rad）　<span style="color:#0ea5e9">cos = ${f2(Math.cos(a))}（横）</span>　<span style="color:var(--bad)">sin = ${f2(Math.sin(a))}（縦）</span>`; }); },
        desc:'半径1の円の上を回る点の<b>横の位置が cos、縦の位置が sin</b>。だから <code>x = cx + cos(角度) × 半径</code>、<code>y = cy + sin(角度) × 半径</code> で円を描いて回せます。sin を時間で動かすと、右のような<b>波</b>になり、ふわふわ浮く・ゆれる動きに使えます。角度の単位はラジアン（360° ＝ 2π）。',
        prompt:'Canvas で、中心の周りを衛星が円を描いて回るアニメーションを作って。角度を経過時間で増やし、x = 中心 + cos × 半径、y = 中心 + sin × 半径 で位置を計算して。楕円軌道にする場合の式も教えて。' },
      { name:'マウスの方を向く（atan2）', en:'Look at the pointer', h:380, tags:['体験'],
        demo:'<div class="kt"><div class="mm-cv"><span class="tip">マウスを動かす</span></div><div class="mm-f out">マウスを動かしてください</div></div>',
        init:(el) => { const c = cv(el), g = c.ctx; let m = [c.w * .8, c.h * .2];
          const draw = () => { g.clearRect(0, 0, c.w, c.h); [[c.w * .35, c.h * .5], [c.w * .55, c.h * .5]].forEach(([x, y]) => { const a = Math.atan2(m[1] - y, m[0] - x), R = Math.min(34, c.h * .14); g.fillStyle = '#fff'; g.strokeStyle = c.ink; g.lineWidth = 2; g.beginPath(); g.arc(x, y, R, 0, 7); g.fill(); g.stroke(); dot(g, x + Math.cos(a) * R * .5, y + Math.sin(a) * R * .5, R * .38, '#111'); });
            const ax = c.w * .45, ay = c.h * .85, a = Math.atan2(m[1] - ay, m[0] - ax); arrow(g, ax, ay, ax + Math.cos(a) * 50, ay + Math.sin(a) * 50, c.acc, 4); dot(g, m[0], m[1], 5, c.bad);
            $(el, '.out').innerHTML = `角度 = Math.atan2(マウスy − 矢印y, マウスx − 矢印x) = <b>${f2(a)}</b> rad（${Math.round(a * 180 / Math.PI)}°）\n黒目の位置 = 目の中心 + (cos, sin) × 半径の半分`; };
          c.box.onpointermove = (e) => { m = pos(c.box, e); draw(); }; c.redraw = draw; draw(); },
        desc:'「マウスの方を向く」「敵が自分を狙う」は <code>Math.atan2(dy, dx)</code> で角度を求めて回転させるだけ。<b>yを先に書く</b>のが注意点です（atan2(y, x)）。目玉は、角度の方向に少しずらして黒目を描けば完成。CSSなら <code>transform: rotate(角度rad)</code>。',
        prompt:'ページ上の矢印のアイコンが、常にマウスの方向を向くようにして。Math.atan2 で角度を求め、CSS の transform: rotate() に渡す。スマホではタッチした位置を向くように。' },
    ], null, true),
    S('座標とベクトルの用語', [
      T('座標', 'Coordinates', '位置を (x, y) の数で表す。画面は左上が原点で、右が x＋、下が y＋。', null, ['基本']),
      T('ベクトル', 'Vector', '向きと大きさを持つ量。位置・速さ・力を表す。(x, y) の組で書く。'),
      T('長さ（大きさ）', 'Magnitude', '√(x² + y²)。JavaScript なら <code>Math.hypot(x, y)</code>。2点間の距離にも使う。'),
      T('正規化', 'Normalize', '長さで割って長さ1にすること。「向きだけ」を取り出す。長さ0のときの割り算に注意。', null, ['よくある失敗']),
      T('内積', 'Dot product', 'a.x×b.x + a.y×b.y。2つの向きがどれだけ同じ方向か（1＝同じ、0＝直角、−1＝逆）。視野の判定や反射に使う。'),
      T('ラジアン', 'Radians', '角度の単位。180° ＝ π。度に直すには × 180 / π。三角関数はラジアンで受け取る。'),
      T('sin・cos', 'Sine / cosine', '角度から縦・横の成分を出す関数。円運動・波・揺れに使う。'),
      T('atan2', 'Math.atan2(y, x)', 'ベクトルから角度を求める。<b>y が先</b>。−π〜π の範囲で返る。'),
      T('距離の2乗で比べる', 'Squared distance', '近いかどうかを比べるだけなら √ を計算せず2乗のまま比べると速い。'),
      T('ワールド座標とスクリーン座標', 'World vs screen', 'ゲームの世界の座標と、画面の座標。カメラ（スクロール）の分だけずらして変換する。'),
    ]),
  ]});

/* ================= 2. 補間とイージング ================= */
const ESL = [['linear', '一定の速さ', 't'], ['easeInQuad', 'ゆっくり始まる', 't * t'], ['easeOutQuad', 'ゆっくり止まる', '1 - (1 - t) * (1 - t)'], ['easeInOutCubic', 'ゆっくり→速く→ゆっくり', 't < .5 ? 4*t*t*t : 1 - (-2*t + 2)**3 / 2'], ['easeOutBack', '少し行き過ぎて戻る', '1 + c3*(t-1)**3 + c1*(t-1)**2'], ['easeOutElastic', 'ゴムのように揺れる', '2**(-10t) * sin((10t - .75) * 2π/3) + 1'], ['easeOutBounce', '跳ねて止まる', '（場合分けの放物線）']];

TABS.push({ id:'interp', label:'補間とイージング', icon:'〰',
  intro:'アニメーションの基本は「A から B へ、時間に合わせて値を変える」こと。その間の値を作るのが<b>補間（lerp）</b>、加速・減速のしかたを決めるのが<b>イージング</b>です。CSS の <code>ease</code> や <code>cubic-bezier()</code> も中身は同じ計算。値の範囲を変換する <b>map・clamp</b> も一緒に覚えましょう。',
  sections:[
    C('触って理解する', [
      { name:'lerp（線形補間）と map', en:'Lerp, map & clamp', h:440, tags:['基本','体験','最重要'],
        demo:'<div class="kt"><div class="mm-cv"><span class="tip">点をドラッグ</span></div><div class="sl"></div><div class="mm-f out"></div></div>',
        init:(el) => { const c = cv(el), g = c.ctx, P = [[c.w * .15, c.h * .7], [c.w * .85, c.h * .3]]; const st = sliders($(el, '.sl'), [['t', 't（0〜1）', 0, 1, .01, .3]], () => draw());
          const draw = () => { g.clearRect(0, 0, c.w, c.h); const [a, b] = P, t = st.t, x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t;
            g.strokeStyle = c.bd; g.lineWidth = 3; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); g.strokeStyle = c.acc; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(x, y); g.stroke();
            dot(g, a[0], a[1], 8, c.ink); dot(g, b[0], b[1], 8, c.ink); dot(g, x, y, 9, c.bad);
            const col = (u) => `rgb(${Math.round(37 + (244 - 37) * u)},${Math.round(99 + (63 - 99) * u)},${Math.round(235 + (94 - 235) * u)})`; for (let i = 0; i < c.w - 20; i += 4){ g.fillStyle = col(i / (c.w - 20)); g.fillRect(10 + i, c.h - 22, 4, 12); } g.strokeStyle = c.ink; g.strokeRect(10 + t * (c.w - 20) - 2, c.h - 25, 4, 18);
            const sc = Math.round(t * 1000), op = Math.min(1, Math.max(0, (sc - 200) / (800 - 200)));
            $(el, '.out').innerHTML = `lerp(a, b, t) = a + (b − a) × t → 位置 (<b>${Math.round(x)}</b>, <b>${Math.round(y)}</b>)・色も同じ式で混ぜられる\nmap：スクロール量 <b>${sc}</b>px を 200〜800 → 透明度 0〜1 に変換し、clamp で範囲に収める → <b>${f2(op)}</b>`; };
          dragPts(c.box, P, draw); c.redraw = draw; draw(); },
        desc:'<b>lerp</b>（線形補間）は <code>a + (b − a) × t</code>。t が 0 なら a、1 なら b、0.5 なら真ん中。位置・色・大きさ・角度…何でも同じ式で混ぜられます。<b>map</b> は「ある範囲の値を別の範囲に直す」（スクロール 200〜800px → 透明度 0〜1）、<b>clamp</b> は範囲の外に出ないよう押さえ込む関数です。',
        prompt:'スクロール量に応じてヘッダーの背景の透明度と高さを変えたい。map（範囲の変換）と clamp（範囲に収める）と lerp の関数を TypeScript で書いて、スクロール 0〜300px で透明度 0→1、高さ 80px→56px に変わるようにして。',
        code:'const lerp  = (a, b, t) => a + (b - a) * t;\nconst clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));\nconst invLerp = (a, b, v) => (v - a) / (b - a);          // 値 → 0〜1\nconst map = (v, a, b, c, d) => lerp(c, d, clamp(invLerp(a, b, v), 0, 1));\n\nheader.style.opacity = map(scrollY, 0, 300, 0, 1);' },
      { name:'イージング関数', en:'Easing functions', h:470, tags:['体験','定番'],
        demo:'<div class="kt"><span class="sw"></span><div class="mm-cv"></div><div class="mm-f out"></div></div>',
        init:(el) => { let k = 3; const c = cv(el), g = c.ctx, t0 = performance.now();
          $(el, '.sw').replaceWith(seg(ESL.map(e => e[1]), i => { k = i; $(el, '.out').innerHTML = `<b>${ESL[i][0]}</b>：y = ${esc(ESL[i][2])}`; }, 3).el);
          return VD.loop(c.box, () => { const f = EASE[ESL[k][0]], m = 24, gw = Math.min(c.w * .55, c.h - 2 * m), gx = m, gy = (c.h - gw) / 2, t = ((performance.now() - t0) / 1600) % 1.4, tt = Math.min(1, t);
            g.clearRect(0, 0, c.w, c.h); g.strokeStyle = c.bd; g.lineWidth = 1; g.strokeRect(gx, gy, gw, gw); g.fillStyle = c.mut; g.font = '10px monospace'; g.fillText('時間 →', gx + gw - 40, gy + gw + 14); g.fillText('進み', gx - 20, gy + 10);
            g.strokeStyle = c.acc; g.lineWidth = 2.5; g.beginPath(); for (let i = 0; i <= 100; i++){ const x = gx + i / 100 * gw, y = gy + gw - f(i / 100) * gw; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); dot(g, gx + tt * gw, gy + gw - f(tt) * gw, 6, c.bad);
            const tx0 = gx + gw + 30, tx1 = c.w - 24; if (tx1 > tx0 + 20){ g.strokeStyle = c.bd; g.beginPath(); g.moveTo(tx0, c.h / 2); g.lineTo(tx1, c.h / 2); g.stroke(); g.fillStyle = c.acc; g.beginPath(); g.roundRect ? g.roundRect(tx0 + f(tt) * (tx1 - tx0) - 14, c.h / 2 - 14, 28, 28, 7) : g.rect(tx0 + f(tt) * (tx1 - tx0) - 14, c.h / 2 - 14, 28, 28); g.fill(); } }); },
        desc:'<b>イージング</b>は「時間の進み（0〜1）」を「動きの進み（0〜1）」に変える関数です。グラフの傾きが<b>速さ</b>。始めと終わりがゆるやかな <code>easeInOut</code> は自然、<code>easeOutBack</code> は少し行き過ぎて戻る、<code>easeOutBounce</code> は跳ねる。UIでは<b>現れるときは easeOut、消えるときは easeIn</b> が基本です。',
        prompt:'自作のアニメーション関数 animate(from, to, duration, easing, onUpdate) を TypeScript で書いて。requestAnimationFrame で経過時間を 0〜1 にし、イージング関数（easeOutCubic・easeInOutCubic・easeOutBack）を選べるように。動きを減らす設定のときは即座に終わらせて。' },
      { name:'cubic-bezier を作る', en:'Cubic Bézier timing editor', h:500, tags:['体験','CSS'],
        demo:'<div class="kt"><div class="mm-two"><div><div class="mm-cv"><span class="tip">2つの点をドラッグ</span></div></div><div style="justify-content:center"><div class="mm-f out"></div><div style="position:relative;height:56px;border-radius:10px;background:var(--surface-2);border:1px solid var(--border)"><div class="mm-box bx" style="position:absolute;left:6px;top:6px"></div></div><button type="button" class="kt-btn pri go">▶ 動かす</button></div></div></div>',
        init:(el) => { const c = cv(el), g = c.ctx, N = [[.25, .1], [.25, 1]], P = [[0, 0], [0, 0]]; let S0, ox, oy;
          // 制御点は 0〜1 の値で持ち、枠の大きさから画面の位置を計算する
          const geo = () => { S0 = Math.max(40, Math.min(c.w, c.h) - 40); ox = (c.w - S0) / 2; oy = (c.h - S0) / 2; N.forEach((n, i) => { P[i][0] = ox + n[0] * S0; P[i][1] = oy + S0 - n[1] * S0; }); };
          const val = () => N;
          const draw = () => { geo(); g.clearRect(0, 0, c.w, c.h); g.strokeStyle = c.bd; g.lineWidth = 1; g.strokeRect(ox, oy, S0, S0); const A = [ox, oy + S0], B = [ox + S0, oy];
            g.strokeStyle = c.mut; g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(P[0][0], P[0][1]); g.moveTo(B[0], B[1]); g.lineTo(P[1][0], P[1][1]); g.stroke();
            g.strokeStyle = c.acc; g.lineWidth = 3; g.beginPath(); g.moveTo(A[0], A[1]); g.bezierCurveTo(P[0][0], P[0][1], P[1][0], P[1][1], B[0], B[1]); g.stroke(); P.forEach(p => dot(g, p[0], p[1], 8, c.bad));
            const [[x1, y1], [x2, y2]] = val(); el._cb = `cubic-bezier(${f2(x1)}, ${f2(y1)}, ${f2(x2)}, ${f2(y2)})`; $(el, '.out').innerHTML = `transition-timing-function:\n<b>${el._cb}</b>`; };
          dragPts(c.box, P, (k) => { N[k] = [Math.max(0, Math.min(1, (P[k][0] - ox) / S0)), (oy + S0 - P[k][1]) / S0]; draw(); }); c.redraw = draw;
          $(el, '.go').onclick = () => { const b = $(el, '.bx'), track = b.parentElement.clientWidth - 56; b.style.transition = 'none'; b.style.transform = 'translateX(0)'; b.offsetWidth; b.style.transition = `transform 1s ${el._cb}`; b.style.transform = `translateX(${track}px)`; }; draw(); },
        desc:'CSS の <code>cubic-bezier(x1, y1, x2, y2)</code> は、2つの<b>制御点</b>でイージングの曲線を決めます（横軸＝時間、縦軸＝進み）。点を上にはみ出させると<b>行き過ぎて戻る</b>動きにもなります。点をドラッグして「▶ 動かす」で確かめ、気に入ったらそのまま CSS に使えます。',
        prompt:'このサイトのアニメーションのイージングを統一したい。「現れる」「消える」「移動」用に cubic-bezier の値を3つ決めて CSS 変数（--ease-out など）にし、すべての transition をその変数に置き換えて。' },
      { name:'フレームレートに左右されない追従', en:'Frame-rate independent smoothing', h:440, tags:['体験','よくある失敗'],
        demo:'<div class="kt"><span class="sw"></span><div class="mm-cv"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const c = cv(el), g = c.ctx; const FPS = [[30, '#0ea5e9'], [60, '#16a34a'], [144, '#e11d48']];
          let mode = 0; const draw = () => { g.clearRect(0, 0, c.w, c.h); const m = 30, W = c.w - m - 10, H = c.h - 40, X = (t) => m + t / 1 * W, Y = (v) => 10 + H - v * H;
              g.strokeStyle = c.bd; g.strokeRect(m, 10, W, H); g.fillStyle = c.mut; g.font = '10px monospace'; g.fillText('0秒', m, c.h - 14); g.fillText('1秒', m + W - 20, c.h - 14); g.fillText('目標', m + 4, 22);
              FPS.forEach(([fps, col], i) => { let x = 0; const dt = 1 / fps; g.strokeStyle = col; g.lineWidth = 2.5; g.beginPath(); g.moveTo(X(0), Y(0)); for (let t = dt; t <= 1.0001; t += dt){ x += (1 - x) * (mode ? 1 - Math.exp(-6.3 * dt) : .1); g.lineTo(X(t), Y(x)); } g.stroke(); g.fillStyle = col; g.fillText(`${fps}fps`, m + W - 44, Y(.5) + i * 14); });
              verdict($(el, '.res'), mode ? 'ok' : 'bad', mode ? '✓ <code>1 − Math.exp(−速さ × dt)</code> を係数に使うと、<b>どのフレームレートでも同じ速さ</b>で近づきます。' : '❌ 「毎フレーム10%近づく」は、<b>144Hzの画面では速く、30fpsでは遅く</b>なります（3本の線がばらばら）。'); };
          c.redraw = draw; $(el, '.sw').replaceWith(seg(['毎フレーム10%近づく', '時間で補正する'], (i) => { mode = i; draw(); }).el); },
        desc:'「毎フレーム、目標との差の10%だけ近づく」書き方は手軽ですが、<b>画面のリフレッシュレートで速さが変わります</b>（120Hz・144Hz のスマホやモニターでは倍速に）。経過時間 dt を使って係数を <code>1 − exp(−k × dt)</code> にすると、どの端末でも同じ動きになります。',
        prompt:'このコードで「位置 += (目標 − 位置) × 0.1」としているマウス追従を、フレームレートに依存しない形（係数 = 1 − Math.exp(−速さ × 経過秒数)）に直して。経過秒数は requestAnimationFrame のタイムスタンプから計算して。',
        code:'let last = performance.now();\nfunction tick(now) {\n  const dt = Math.min(0.05, (now - last) / 1000);  // 秒。タブ復帰時の大きな飛びを抑える\n  last = now;\n  const k = 1 - Math.exp(-12 * dt);                 // 12 ＝ 追いかける速さ\n  pos.x += (target.x - pos.x) * k;\n  pos.y += (target.y - pos.y) * k;\n  requestAnimationFrame(tick);\n}\nrequestAnimationFrame(tick);' },
    ], null, true),
    S('補間とイージングの用語', [
      T('lerp（線形補間）', 'Linear interpolation', 'a + (b − a) × t。2つの値の間を割合で取る。', null, ['基本']),
      T('逆補間', 'Inverse lerp', '(v − a) / (b − a)。値が範囲のどのあたりか（0〜1）を求める。'),
      T('map・remap', 'Remap', 'ある範囲の値を別の範囲に変換する。逆補間 → lerp の組み合わせ。'),
      T('clamp', 'Clamp', '値を最小〜最大の範囲に収める。'),
      T('イージング', 'Easing', '時間の進み 0〜1 を、動きの進み 0〜1 に変える関数。'),
      T('easeIn・easeOut・easeInOut', 'Ease directions', 'In＝ゆっくり始まる、Out＝ゆっくり止まる。UIで現れる動きは Out が自然。'),
      T('cubic-bezier', 'cubic-bezier()', 'CSS のイージングを2つの制御点で決める書き方。'),
      T('steps()', 'Step easing', 'CSS で、なめらかに変えず段階的に変える（コマ送り・タイプライター）。'),
      T('smoothstep', 'Smoothstep', 't × t × (3 − 2t)。端がなめらかな0〜1の補間。シェーダーでもよく使う。'),
      T('指数関数的な減衰', 'Exponential decay', '毎回「残りの一定割合」近づく動き。dt を使って 1 − exp(−k × dt) で補正する。'),
      T('角度の補間', 'Angle lerp', '359°→1° を lerp すると逆回りする。差を −180°〜180° に直してから補間する（「UIで使う計算」タブ）。', null, ['よくある失敗']),
    ]),
  ]});

/* ================= 3. 速度・重力 ================= */
TABS.push({ id:'physics', label:'速度・重力', icon:'🪂',
  intro:'動きの物理は、<b>位置 ＋＝ 速度 × 時間</b>、<b>速度 ＋＝ 加速度 × 時間</b>の2行が基本です。重力は下向きの加速度、摩擦や空気抵抗は速さを減らす力。計算のしかた（積分）によっては、時間がたつと<b>エネルギーが増えて暴走</b>することもあります。',
  sections:[
    C('触って理解する', [
      { name:'投げる（放物線）', en:'Projectile motion', h:480, tags:['体験','定番'],
        demo:'<div class="kt"><div class="mm-cv"></div><div class="sl"></div><div class="kt-row"><button type="button" class="kt-btn pri go">▶ 投げる</button></div><div class="mm-f out"></div></div>',
        init:(el) => { const c = cv(el), g = c.ctx; let ball = null; const st = sliders($(el, '.sl'), [['ang', '角度', 5, 85, 1, 45, (v) => v + '°'], ['v', '初速', 50, 400, 5, 260, (v) => v + 'px/秒'], ['gr', '重力', 100, 1200, 10, 500, (v) => v + 'px/秒²']], () => { ball = null; });
          const stop = VD.loop(c.box, (dt) => { const g0 = c.h - 20, a = st.ang * Math.PI / 180, vx = Math.cos(a) * st.v, vy = -Math.sin(a) * st.v, H = st.v * st.v * Math.sin(a) ** 2 / (2 * st.gr), R = st.v * st.v * Math.sin(2 * a) / st.gr;
            g.clearRect(0, 0, c.w, c.h); g.fillStyle = c.bd; g.fillRect(0, g0, c.w, 20); g.strokeStyle = c.mut; g.setLineDash([4, 5]); g.beginPath(); for (let t = 0; t < 4; t += .02){ const x = 20 + vx * t, y = g0 + vy * t + .5 * st.gr * t * t; if (y > g0) break; t ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.setLineDash([]);
            if (ball){ ball.vy += st.gr * dt; ball.x += ball.vx * dt; ball.y += ball.vy * dt; if (ball.y > g0){ ball.y = g0; ball.vx = 0; ball.vy = 0; } ball.tr.push([ball.x, ball.y]); g.strokeStyle = c.acc; g.lineWidth = 2; g.beginPath(); ball.tr.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); dot(g, ball.x, ball.y - 7, 7, c.bad); }
            arrow(g, 20, g0, 20 + vx * .2, g0 + vy * .2, c.ink, 2);
            $(el, '.out').innerHTML = `最高点の高さ = v² sin²θ ÷ 2g = <b>${Math.round(H)}</b>px　飛距離 = v² sin2θ ÷ g = <b>${Math.round(R)}</b>px\n毎フレーム：速度y ＋＝ 重力 × dt、位置 ＋＝ 速度 × dt（画面は下が＋なので、上へは速度yがマイナス）`; });
          $(el, '.go').onclick = () => { const a = st.ang * Math.PI / 180; ball = { x:20, y:c.h - 20, vx:Math.cos(a) * st.v, vy:-Math.sin(a) * st.v, tr:[] }; }; return stop; },
        desc:'斜めに投げたボールは、横には<b>同じ速さ</b>、縦には<b>重力で速度が変わり続ける</b>ので放物線を描きます。毎フレーム「速度に重力を足す → 位置に速度を足す」だけ。点線は計算で予測した軌道です。45°で一番遠くまで飛ぶことも確かめてみましょう。',
        prompt:'Canvas で、ドラッグして離すとその向きと強さでボールを投げられるゲームの部品を作って。重力をかけて放物線で飛ばし、投げる前に予測線（点線）を表示、地面で跳ね返って止まるようにして。dt は requestAnimationFrame から計算して。' },
      { name:'計算のしかたで結果がずれる（積分）', en:'Euler vs semi-implicit vs Verlet', h:480, tags:['体験','上級'],
        demo:'<div class="kt"><span class="sw"></span><div class="mm-cv"></div><div class="kt-row"><button type="button" class="kt-btn sm rs">最初から</button></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const c = cv(el), g = c.ctx; let mode = 0, s, tr, cx, cy, r0; const GM = 2.4e6;
          const reset = () => { cx = c.w / 2; cy = c.h / 2; r0 = Math.min(c.w, c.h) * .3; const v0 = Math.sqrt(GM / r0); s = { x:cx + r0, y:cy, vx:0, vy:-v0, px:cx + r0, py:cy + v0 / 60 }; tr = []; }; reset(); c.redraw = reset;
          const acc = (x, y) => { const dx = cx - x, dy = cy - y, d = Math.hypot(dx, dy); return [GM * dx / d ** 3, GM * dy / d ** 3]; };
          $(el, '.sw').replaceWith(seg(['オイラー法', '半陰的オイラー法', 'ベルレ法'], i => { mode = i; reset(); }).el); $(el, '.rs').onclick = reset;
          return VD.loop(c.box, () => { const dt = 1 / 60; for (let k = 0; k < 2; k++){ const [ax, ay] = acc(s.x, s.y);
              if (mode === 0){ s.x += s.vx * dt; s.y += s.vy * dt; s.vx += ax * dt; s.vy += ay * dt; }
              else if (mode === 1){ s.vx += ax * dt; s.vy += ay * dt; s.x += s.vx * dt; s.y += s.vy * dt; }
              else { const nx = 2 * s.x - s.px + ax * dt * dt, ny = 2 * s.y - s.py + ay * dt * dt; s.px = s.x; s.py = s.y; s.x = nx; s.y = ny; } }
            tr.push([s.x, s.y]); if (tr.length > 900) tr.shift(); const d = Math.hypot(s.x - cx, s.y - cy);
            g.clearRect(0, 0, c.w, c.h); g.strokeStyle = c.bd; g.setLineDash([3, 4]); g.beginPath(); g.arc(cx, cy, r0, 0, 7); g.stroke(); g.setLineDash([]); dot(g, cx, cy, 12, '#f59e0b');
            g.strokeStyle = c.acc; g.lineWidth = 1.5; g.beginPath(); tr.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); dot(g, s.x, s.y, 6, c.bad);
            const drift = (d / r0 - 1) * 100; verdict($(el, '.res'), Math.abs(drift) > 15 ? 'bad' : Math.abs(drift) > 3 ? 'warn' : 'ok', `本来の軌道（点線）からのずれ：<b>${f2(drift, 1)}%</b>　` + ['オイラー法は、古い速度で位置を進めるので<b>少しずつエネルギーが増え</b>、外へ外へと逃げていきます。', '速度を先に更新してから位置を進めるだけで、<b>ほぼ安定</b>します（ゲームでよく使う）。', '前の位置と今の位置から次を決める方法。安定していて、ロープや布のシミュレーションでも定番。'][mode]); }); },
        desc:'「位置 ＋＝ 速度 × dt」と「速度 ＋＝ 加速度 × dt」の<b>順番</b>を変えるだけで、結果が大きく変わります。素朴なオイラー法は時間とともに誤差がたまり、惑星が軌道から飛び出していきます。<b>速度を先に更新する半陰的オイラー法</b>に変えるだけで安定するので、迷ったらこちら。',
        prompt:'このゲームの物理の更新処理を、オイラー法から半陰的オイラー法（速度を先に更新）に直して。さらに、フレームの時間がばらついても結果が安定するよう、固定の時間刻み（1/120秒）で何回か進めるアキュムレーター方式にして。' },
      { name:'摩擦と空気抵抗', en:'Friction & drag', h:430, tags:['体験'],
        demo:'<div class="kt"><div class="mm-cv"></div><div class="kt-row"><button type="button" class="kt-btn pri go">▶ 3つ同時にすべらせる</button></div><div class="mm-f out">摩擦なし（上）・一定の摩擦（中）・空気抵抗（下）</div></div>',
        init:(el) => { const c = cv(el), g = c.ctx; let P = null; const COL = ['#0ea5e9', '#16a34a', '#e11d48'], NAME = ['摩擦なし', '一定の摩擦', '空気抵抗'];
          $(el, '.go').onclick = () => { P = [0, 1, 2].map(() => ({ x:24, v:320 })); };
          return VD.loop(c.box, (dt) => { g.clearRect(0, 0, c.w, c.h); [0, 1, 2].forEach(i => { const y = (i + .5) * c.h / 3; g.strokeStyle = c.bd; g.beginPath(); g.moveTo(10, y + 14); g.lineTo(c.w - 10, y + 14); g.stroke(); g.fillStyle = c.mut; g.font = '11px sans-serif'; g.fillText(NAME[i], 12, y - 16);
              if (P){ const p = P[i]; if (i === 1) p.v = Math.max(0, p.v - 160 * dt); if (i === 2) p.v *= Math.exp(-1.6 * dt); p.x += p.v * dt; if (p.x > c.w - 24){ p.x = c.w - 24; p.v = 0; } g.fillStyle = COL[i]; g.fillRect(p.x - 14, y - 14, 28, 28); g.fillStyle = c.ink; g.fillText(`${Math.round(p.v)}px/秒`, Math.min(c.w - 80, p.x + 18), y + 4); } }); }); },
        desc:'<b>一定の摩擦</b>は速さを毎秒同じ量ずつ減らすので、ある所でピタッと止まります。<b>空気抵抗</b>は速さに比例して減らすので、速いうちは急に、遅くなるとじわじわ減速して、なかなか止まりません。慣性スクロールやスワイプで投げた物の減速は、空気抵抗型（<code>v ×＝ exp(−k × dt)</code>）が自然です。',
        prompt:'カード一覧を横にスワイプして離したとき、指の速さを引き継いで慣性で流れ、だんだん減速して止まるようにして。減速は v *= Math.exp(-k * dt) で、端では軽く跳ね返るように。' },
    ], null, true),
    S('速度と重力の用語', [
      T('速度・加速度', 'Velocity / acceleration', '速度＝1秒に進む量（向き付き）。加速度＝1秒に変わる速度の量。', null, ['基本']),
      T('dt（経過時間）', 'Delta time', '前のフレームからの秒数。速度×dt で進めると、端末の速さに左右されない。'),
      T('重力', 'Gravity', '下向きの一定の加速度。画面では y＋ が下なので、そのまま足す。'),
      T('積分', 'Integration', '加速度→速度→位置と、少しずつ足し上げていく計算。'),
      T('オイラー法', 'Explicit Euler', '最も素朴な積分。誤差がたまりやすい。'),
      T('半陰的オイラー法', 'Semi-implicit Euler', '速度を先に更新してから位置を更新する。簡単で安定。ゲームの定番。', null, ['おすすめ']),
      T('ベルレ法', 'Verlet integration', '前の位置と今の位置から次を求める。ロープ・布・ラグドールに。'),
      T('固定の時間刻み', 'Fixed timestep', '物理だけは一定の dt（例 1/120秒）で進める。結果が安定し、再現性もある。'),
      T('摩擦', 'Friction', '動きと逆向きに働き、速さを減らす力。'),
      T('空気抵抗（減衰）', 'Drag / damping', '速さに比例して減らす。exp(−k × dt) を掛けると、フレームレートに依存しない。'),
      T('反発係数', 'Restitution', 'ぶつかった後に残る速さの割合。1で完全に跳ね返り、0で跳ねない。'),
    ]),
  ]});

/* ================= 4. ばね ================= */
const PRE = [['やわらか', 120, 14, 1], ['弾む', 300, 8, 1], ['キビキビ', 500, 40, 1], ['重い', 200, 30, 3]];
TABS.push({ id:'spring', label:'ばね', icon:'🌀',
  intro:'<b>ばね（スプリング）</b>は、気持ちいいUIアニメーションの定番です。「目標からのずれに比例して引き戻す力」と「速さに比例してブレーキをかける力」の2つだけで、<b>弾む・吸い付く・ふわっと止まる</b>が作れます。時間（秒）ではなく<b>硬さと減衰</b>で動きを決めるので、途中で目標が変わっても自然に追いかけます。',
  sections:[
    C('触って理解する', [
      { name:'ばねシミュレーター', en:'Spring simulator', h:540, tags:['体験','定番','最重要'], wide:true,
        demo:'<div class="kt"><span class="sw"></span><div class="mm-two"><div><div class="mm-cv"></div></div><div><div class="sl"></div><div class="mm-f out" style="flex:1"></div></div></div></div>',
        init:(el) => { const c = cv(el), g = c.ctx; let t0 = performance.now(); const st = sliders($(el, '.sl'), [['k', '硬さ（stiffness）', 20, 800, 5, 300], ['c', '減衰（damping）', 1, 60, 1, 8], ['m', '重さ（mass）', .5, 5, .1, 1]], () => { t0 = performance.now(); });
          $(el, '.sw').replaceWith(seg(PRE.map(p => p[0]), i => { st.set('k', PRE[i][1]); st.set('c', PRE[i][2]); st.set('m', PRE[i][3]); t0 = performance.now(); }, 1).el);
          return VD.loop(c.box, () => { const curve = springCurve(st.k, st.c, st.m, 2), N = curve.length, zeta = st.c / (2 * Math.sqrt(st.k * st.m)), m = 26, W = c.w - m - 10, H = c.h * .62 - 14, top = 10, X = (i) => m + i / (N - 1) * W, Y = (v) => Math.max(top, Math.min(top + H, top + H * .88 - (1 - v) * H * .55));
            g.clearRect(0, 0, c.w, c.h); g.strokeStyle = c.bd; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(m, Y(0)); g.lineTo(m + W, Y(0)); g.stroke(); g.setLineDash([]); g.fillStyle = c.mut; g.font = '10px monospace'; g.fillText('目標', 2, Y(0) + 3); g.fillText('開始', 2, Y(1) + 3); g.fillText('2秒', m + W - 22, top + H);
            g.strokeStyle = c.acc; g.lineWidth = 2.5; g.beginPath(); curve.forEach((v, i) => { if (i % 3) return; const x = X(i), y = Y(v); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke();
            const t = ((performance.now() - t0) / 1000) % 2.6, idx = Math.min(N - 1, Math.floor(t * 240)), v = curve[idx]; g.strokeStyle = c.mut; g.beginPath(); g.moveTo(X(idx), top); g.lineTo(X(idx), top + H); g.stroke();
            const by = c.h * .82, x0 = c.w * .15, x1 = c.w * .85, bx = x1 + (x0 - x1) * v; g.strokeStyle = c.bd; g.beginPath(); g.moveTo(x0, by); g.lineTo(x1, by); g.stroke(); dot(g, x1, by, 4, c.mut); dot(g, bx, by, 13, c.bad);
            if (!el._n || el._n++ % 10 === 0){ el._n = el._n || 1; let settle = N; for (let i = N - 1; i >= 0; i--){ if (Math.abs(curve[i]) > .01){ settle = i + 1; break; } } $(el, '.out').innerHTML = `減衰比 ζ = c ÷ (2√(k×m)) = <b>${f2(zeta)}</b>\n${zeta < 1 ? 'ζ < 1：<b>弾む</b>（行き過ぎて戻る）' : zeta < 1.05 ? 'ζ ≒ 1：<b>臨界減衰</b>（行き過ぎずに最速で止まる）' : 'ζ > 1：<b>過減衰</b>（ゆっくり近づく）'}\n止まるまで：約 <b>${settle >= N ? '2秒以上' : f2(settle / 240, 2) + '秒'}</b>\n\n// 毎フレーム\nforce = -k * (x - target) - c * v\nv += force / m * dt\nx += v * dt`; } }); },
        desc:'ばねの動きは<b>硬さ（k）・減衰（c）・重さ（m）</b>の3つで決まります。硬いほど速く、減衰が小さいほど<b>弾み</b>、重いほどゆったり。3つを組み合わせた<b>減衰比 ζ</b> が1より小さいと弾み、1付近でピタッと止まり、1より大きいとじわっと近づきます。Framer Motion・react-spring・SwiftUI のばねも同じ考え方です。',
        prompt:'モーダルが開くとき、ばねの動き（stiffness 300・damping 24・mass 1 程度）で下からふわっと出てくるようにして。Framer Motion（motion）の spring トランジションを使い、動きを減らす設定のときはフェードだけにして。値を変えると印象がどう変わるかも教えて。' },
      { name:'ドラッグして離すと戻る', en:'Drag & spring back', h:460, tags:['体験','UI'],
        demo:'<div class="kt"><span class="sw"></span><div class="mm-cv"><span class="tip">カードをドラッグして離す</span></div></div>',
        init:(el) => { const c = cv(el), g = c.ctx; let p = 1; const home = [c.w / 2, c.h / 2]; let x = home[0], y = home[1], vx = 0, vy = 0, drag = false, off = [0, 0]; const tr = [];
          $(el, '.sw').replaceWith(seg(PRE.map(q => q[0]), i => { p = i; }, 1).el);
          c.box.addEventListener('pointerdown', (e) => { const [mx, my] = pos(c.box, e); if (Math.abs(mx - x) < 60 && Math.abs(my - y) < 40){ drag = true; off = [mx - x, my - y]; c.box.setPointerCapture(e.pointerId); } });
          c.box.addEventListener('pointermove', (e) => { if (!drag) return; const [mx, my] = pos(c.box, e); vx = (mx - off[0] - x) * 60; vy = (my - off[1] - y) * 60; x = mx - off[0]; y = my - off[1]; });
          c.box.addEventListener('pointerup', () => { drag = false; });
          return VD.loop(c.box, (dt) => { home[0] = c.w / 2; home[1] = c.h / 2; if (!drag){ const [, k, cc, m] = PRE[p]; for (let s = 0; s < 4; s++){ const h = dt / 4; vx += (-k * (x - home[0]) - cc * vx) / m * h; vy += (-k * (y - home[1]) - cc * vy) / m * h; x += vx * h; y += vy * h; } }
            tr.push([x, y]); if (tr.length > 40) tr.shift(); g.clearRect(0, 0, c.w, c.h); g.strokeStyle = c.bd; g.setLineDash([4, 4]); g.strokeRect(home[0] - 60, home[1] - 40, 120, 80); g.setLineDash([]);
            g.strokeStyle = c.acc; g.globalAlpha = .4; g.lineWidth = 2; g.beginPath(); tr.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.stroke(); g.globalAlpha = 1;
            g.strokeStyle = c.mut; g.setLineDash([2, 4]); g.beginPath(); g.moveTo(home[0], home[1]); g.lineTo(x, y); g.stroke(); g.setLineDash([]);
            g.fillStyle = c.acc; g.beginPath(); g.roundRect ? g.roundRect(x - 60, y - 40, 120, 80, 14) : g.rect(x - 60, y - 40, 120, 80); g.fill(); g.fillStyle = '#fff'; g.font = '700 13px sans-serif'; g.textAlign = 'center'; g.fillText('ドラッグ', x, y + 5); g.textAlign = 'left'; }); },
        desc:'ばねは「目標の位置」に向かう力なので、<b>ドラッグして離した瞬間の速さ</b>をそのまま引き継いで、自然に元の場所へ戻ります。決まった時間のアニメーション（0.3秒で戻る）だと、投げた勢いが消えて不自然になりがち。プリセットを変えて、戻り方の違いを触って比べてみましょう。',
        prompt:'カードをドラッグして離すと、離した速さを引き継いでばねで元の位置に戻るUIを作って。一定以上の速さで横に投げたら、画面外に飛ばして削除（スワイプで消す）。Framer Motion の drag と dragSnapToOrigin、または自前のばねで。' },
    ], null, true),
    { title:'ばねの設定の目安', note:'ライブラリによって数値の意味（単位）が少しずつ違います。まず<b>プリセット</b>から選び、少しずつ調整するのが近道です。',
      table:{ head:['印象', '硬さ', '減衰', '向いている'], rows:[['ふわっと', '低め（100〜200）', '中（15〜20）', 'モーダル・パネルの出現'], ['キビキビ', '高め（400〜600）', '高め（30〜40）', 'ボタン・トグル・タブ切り替え'], ['弾む', '中（250〜350）', '低め（6〜10）', 'いいね・通知のバッジ・遊び心'], ['どっしり', '中', '中', '重さ（mass）を上げて大きな物に']] } },
    S('ばねの用語', [
      T('ばね（スプリング）アニメーション', 'Spring animation', '時間ではなく物理（硬さ・減衰・重さ）で決める動き。', null, ['定番']),
      T('硬さ', 'Stiffness (k)', '目標へ引き戻す力の強さ。大きいほど速く動く。'),
      T('減衰', 'Damping (c)', '速さに比例するブレーキ。小さいほど弾み、大きいほどすぐ止まる。'),
      T('重さ', 'Mass (m)', '大きいほどゆったり、勢いが残る。'),
      T('減衰比', 'Damping ratio (ζ)', 'c ÷ (2√(km))。1未満で振動、1で臨界、1超で過減衰。'),
      T('臨界減衰', 'Critical damping', '行き過ぎずに最も早く止まる設定。'),
      T('速度の引き継ぎ', 'Velocity handoff', 'ドラッグを離した瞬間の速さをばねの初速にする。自然な操作感の鍵。'),
      T('CSS の linear()', 'CSS linear() easing', '点の並びでイージングを書ける CSS の関数。ばねの動きを近似して CSS だけで使える。'),
      T('Framer Motion / react-spring', 'Spring libraries', 'React でばねのアニメーションを簡単に書けるライブラリ。'),
    ]),
  ]});
})();
