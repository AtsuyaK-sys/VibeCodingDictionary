/* 動きの計算辞典 — B: 波とノイズ / 当たり判定 / 曲線と経路 / UIで使う計算 */
(function(){
const { $, $$, seg } = KIT;
const { S, C, T, verdict, cv, sliders, pos, dragPts, arrow, dot, f2, EASE } = MMH;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
// なめらかな乱数（1次元のバリューノイズ）
const hash = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const noise1 = (x) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash(i) + (hash(i + 1) - hash(i)) * u; };
const fbm = (x) => { let a = .5, s = 0, n = 0; for (let o = 0; o < 4; o++){ s += a * noise1(x + o * 17.3); n += a; x *= 2; a *= .5; } return s / n; };
const line = (g, pts) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); };
// 同じ内容なら書き換えない（毎フレームの DOM 更新を減らす）
const setOut = (el, sel, html, cls) => { const o = $(el, sel); if (o._v === html + cls) return; o._v = html + cls; if (cls === undefined) o.innerHTML = html; else verdict(o, cls, html); };

/* ================= 5. 波とノイズ ================= */
TABS.push({ id:'waves', label:'波とノイズ', icon:'🌊',
  intro:'<b>sin（サイン）</b>を時間で動かすと、ふわふわ浮く・ゆれる・呼吸する動きが作れます。さらに <code>Math.random()</code> の代わりに<b>ノイズ</b>（なめらかにつながった乱数）を使うと、葉っぱの揺れ・炎・カメラの手ぶれのような<b>自然な不規則さ</b>になります。',
  sections:[
    C('触って理解する', [
      { name:'sin で揺らす', en:'Sine wave', h:470, tags:['基本','体験','定番'],
        demo:'<div class="kt"><div class="mm-cv"></div><div class="sl"></div><div class="mm-f out"></div></div>',
        init:(el) => { const c = cv(el), g = c.ctx; const st = sliders($(el, '.sl'), [['A', '振幅（大きさ）', 0, 70, 1, 36, (v) => v + 'px'], ['f', '周波数（速さ）', .1, 3, .1, .8, (v) => v + '回/秒'], ['p', '位相（ずらし）', 0, 6.28, .01, 0, (v) => f2(v) + ' rad']], () => upd());
          const upd = () => { $(el, '.out').innerHTML = `y = 中心 + <b>${st.A}</b> × sin(2π × <b>${st.f}</b> × 時間 + <b>${f2(st.p)}</b>)\n周期（1往復の時間）= 1 ÷ 周波数 = <b>${f2(1 / st.f)}</b>秒`; }; upd();
          return VD.loop(c.box, (dt, now) => { const gw = c.w * .66, mid = c.h / 2, span = 3, t = now % span, y = (tt) => mid - st.A * Math.sin(2 * Math.PI * st.f * tt + st.p);
            g.clearRect(0, 0, c.w, c.h); g.strokeStyle = c.bd; g.lineWidth = 1; g.beginPath(); g.moveTo(8, mid); g.lineTo(gw, mid); g.moveTo(gw + 10, 0); g.lineTo(gw + 10, c.h); g.stroke();
            g.fillStyle = c.mut; g.font = '10px monospace'; g.fillText('0秒', 8, c.h - 8); g.fillText('3秒', gw - 22, c.h - 8);
            g.strokeStyle = c.acc; g.lineWidth = 2.5; const pts = []; for (let x = 8; x <= gw; x += 2) pts.push([x, y((x - 8) / (gw - 8) * span)]); line(g, pts);
            const cx = 8 + t / span * (gw - 8), by = y(t), bx = gw + 10 + (c.w - gw - 10) / 2; dot(g, cx, by, 6, c.bad);
            g.setLineDash([3, 4]); g.strokeStyle = c.mut; g.beginPath(); g.moveTo(cx, by); g.lineTo(bx, by); g.stroke(); g.setLineDash([]);
            g.fillStyle = c.acc; g.beginPath(); g.roundRect(bx - 20, by - 20, 40, 40, 10); g.fill(); g.fillStyle = '#fff'; g.font = '700 18px sans-serif'; g.textAlign = 'center'; g.fillText('☁', bx, by + 6); g.textAlign = 'left'; }); },
        desc:'sin は −1〜1 をなめらかに行き来する関数。<b>振幅</b>を掛けると揺れの大きさ、<b>周波数</b>で速さ、<b>位相</b>で開始のずれを決められます。要素ごとに位相をずらすと、文字が波打つ・並んだ物が順に揺れる、といった動きになります。',
        prompt:'ヒーローのイラストが上下にふわふわ浮くアニメーションを作って。y = 振幅 × sin(2π × 周波数 × 時間) で、振幅 8px・周期 3秒くらい。CSS の @keyframes 版と requestAnimationFrame 版の両方を書き、動きを減らす設定では止めて。',
        code:'const t = performance.now() / 1000;                       // 秒\nconst y = baseY + 8 * Math.sin(2 * Math.PI * 0.33 * t);   // 振幅8px・約3秒で1往復\n\n// 文字ごとに位相をずらすと「波打つ文字」に\nletters.forEach((el, i) => {\n  el.style.transform = `translateY(${6 * Math.sin(t * 4 - i * 0.5)}px)`;\n});' },
      { name:'波を重ねる', en:'Adding waves', h:440, tags:['体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="mm-cv"></div><div class="mm-f out"></div></div>',
        init:(el) => { let n = 3; const c = cv(el), g = c.ctx, W = [[.5, 26, 0, '#0ea5e9'], [1.37, 12, 1.3, '#f59e0b'], [3.11, 6, 2.1, '#a855f7']];
          $(el, '.sw').replaceWith(seg(['1つだけ', '2つ重ねる', '3つ重ねる'], i => { n = i + 1; $(el, '.out').innerHTML = W.slice(0, n).map(w => `${w[1]} × sin(2π × ${w[0]} × t + ${w[2]})`).join(' ＋ ') + (n > 1 ? '\n周波数を割り切れない比にすると、同じ形がなかなか繰り返されない' : '\n1つだけだと、規則正しすぎて機械的に見える'); }, 2).el);
          return VD.loop(c.box, (dt, now) => { const top = c.h * .26, mid = c.h * .66, gw = c.w - 70, f = (w, tt) => w[1] * Math.sin(2 * Math.PI * w[0] * tt + w[2]), sum = (tt) => W.slice(0, n).reduce((s, w) => s + f(w, tt), 0);
            g.clearRect(0, 0, c.w, c.h); g.lineWidth = 1.5; W.slice(0, n).forEach(w => { g.strokeStyle = w[3]; g.globalAlpha = .75; const pts = []; for (let x = 0; x <= gw; x += 3) pts.push([x, top + f(w, now + x / 80) * .6]); line(g, pts); }); g.globalAlpha = 1;
            g.strokeStyle = c.acc; g.lineWidth = 3; const pts = []; for (let x = 0; x <= gw; x += 2) pts.push([x, mid + sum(now + x / 80)]); line(g, pts);
            g.fillStyle = c.mut; g.font = '10px sans-serif'; g.fillText('それぞれの波', 4, 12); g.fillText('合計', 4, mid - 48);
            const bx = gw + 35, by = c.h - 10, ang = sum(now) / 60; g.strokeStyle = '#16a34a'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(bx, by - 50, bx + Math.sin(ang) * 80, by - Math.cos(ang) * 80); g.stroke(); g.lineCap = 'butt'; }); },
        desc:'周波数の違う sin を何本か<b>足し算</b>すると、規則正しさが消えて<b>自然な揺れ</b>になります（右の草は合計の値で揺れています）。草・旗・炎・水面などに。周波数を 1 : 2 のような割り切れる比にすると繰り返しが目立つので、1.37 や 3.11 のような<b>半端な比</b>にするのがコツです。',
        prompt:'風に揺れる草むらを Canvas で描いて。草1本ごとに、周波数の違う sin を2〜3本足した角度で揺らし、草ごとに位相をずらして。風の強さのスライダーで振幅を変えられるように。' },
      { name:'ランダムとノイズの違い', en:'Random vs noise', h:470, tags:['体験','最重要'],
        demo:'<div class="kt"><span class="sw"></span><div class="mm-cv"></div><div class="mm-f out"></div></div>',
        init:(el) => { let k = 1; const c = cv(el), g = c.ctx, tr = [], NOTE = ['毎回まったく関係ない値が出るので<b>ガタガタ</b>。動かすと震えて見えるだけ。', '決まった間隔の乱数の間を<b>なめらかにつなぐ</b>（バリューノイズ）。ゆっくり不規則に動く。', '細かいノイズを小さく重ねる（fBm・オクターブ）。<b>自然な起伏</b>（地形・雲・手ぶれ）に。'];
          const val = (x) => k === 0 ? hash(Math.floor(x * 8)) : k === 1 ? noise1(x) : fbm(x);
          $(el, '.sw').replaceWith(seg(['Math.random()', 'ノイズ', 'ノイズを重ねる'], i => { k = i; tr.length = 0; $(el, '.out').innerHTML = NOTE[i]; }, 1).el);
          return VD.loop(c.box, (dt, now) => { const gh = c.h * .42; g.clearRect(0, 0, c.w, c.h);
            g.strokeStyle = c.acc; g.lineWidth = 2; const pts = []; for (let x = 0; x <= c.w; x += 2) pts.push([x, 10 + (1 - val(now * .8 + x / 60)) * (gh - 20)]); line(g, pts);
            g.strokeStyle = c.bd; g.lineWidth = 1; g.beginPath(); g.moveTo(0, gh); g.lineTo(c.w, gh); g.stroke();
            const s = now * .5, px = 20 + val(s) * (c.w - 40), py = gh + 16 + val(s + 37.7) * (c.h - gh - 32); tr.push([px, py]); if (tr.length > 90) tr.shift();
            g.strokeStyle = c.mut; g.globalAlpha = .5; g.lineWidth = 1.5; line(g, tr); g.globalAlpha = 1; g.font = '20px sans-serif'; g.textAlign = 'center'; g.fillText('🐝', px, py + 7); g.textAlign = 'left'; }); },
        desc:'<code>Math.random()</code> は呼ぶたびに無関係な値なので、毎フレーム位置に使うと<b>震える</b>だけ。<b>ノイズ</b>は「近い入力には近い値」を返す乱数で、時間を入力にすると<b>なめらかで予測できない</b>動きになります。上のグラフは値の変化、下の蜂は x と y を別々のノイズで動かした様子。有名なのはパーリンノイズ・シンプレックスノイズ（npm の simplex-noise など）。',
        prompt:'背景にふわふわ漂う光の粒を30個表示したい。位置は Math.random() で毎フレーム動かすのではなく、simplex-noise ライブラリのノイズに時間を入れて、粒ごとに違うずらしでなめらかに動かして。',
        code:"import { createNoise2D } from 'simplex-noise';\nconst noise2D = createNoise2D();               // −1〜1 を返す\n\nparticles.forEach((p, i) => {\n  const t = performance.now() / 1000 * 0.2;      // 小さく掛けるほどゆっくり\n  p.x = p.baseX + noise2D(t, i * 10) * 40;       // 粒ごとに入力をずらす\n  p.y = p.baseY + noise2D(t, i * 10 + 5) * 40;\n});" },
      { name:'リサージュ曲線（8の字に飛ぶ）', en:'Lissajous curves', h:460, tags:['体験'],
        demo:'<div class="kt"><div class="mm-two"><div><div class="mm-cv"></div></div><div><div class="sl"></div><div class="mm-f out"></div></div></div></div>',
        init:(el) => { const c = cv(el), g = c.ctx; const st = sliders($(el, '.sl'), [['a', '横の周波数 a', 1, 5, 1, 1], ['b', '縦の周波数 b', 1, 5, 1, 2], ['d', 'ずらし δ', 0, 3.14, .01, 1.57, (v) => f2(v)]], () => upd());
          const upd = () => { $(el, '.out').innerHTML = `x = 中心x + 幅 × sin(<b>${st.a}</b>t + <b>${f2(st.d)}</b>)\ny = 中心y + 高さ × sin(<b>${st.b}</b>t)\n${st.a === 1 && st.b === 2 ? '→ <b>8の字</b>（a : b = 1 : 2）' : st.a === st.b ? '→ 楕円・円・斜めの線（a = b）' : '→ a : b の比で形が決まる'}`; }; upd();
          return VD.loop(c.box, (dt, now) => { const R = Math.min(c.w, c.h) / 2 - 14, cx = c.w / 2, cy = c.h / 2, P = (t) => [cx + R * Math.sin(st.a * t + st.d), cy + R * Math.sin(st.b * t)];
            g.clearRect(0, 0, c.w, c.h); g.strokeStyle = c.bd; g.lineWidth = 1.5; const pts = []; for (let t = 0; t <= Math.PI * 2 + .02; t += .02) pts.push(P(t)); line(g, pts);
            const t = now * 1.2; g.strokeStyle = c.acc; g.lineWidth = 3; const tl = []; for (let u = t - .8; u <= t; u += .02) tl.push(P(u)); line(g, tl); const [x, y] = P(t); dot(g, x, y, 8, c.bad); }); },
        desc:'横と縦を<b>別々の周波数の sin</b> で動かすと、8の字・円・複雑なループになります（リサージュ曲線）。ホタルや敵キャラの「ふらふら飛び回る」動き、ローディングの飾り、ロゴのアニメーションに。比 a : b とずらし δ だけで形が決まるので、同じ動きを何度でも再現できます。',
        prompt:'ゲームの敵キャラが8の字を描いて飛ぶ動きを作って。x = 中心 + 幅 × sin(t)、y = 中心 + 高さ × sin(2t) で、敵ごとに中心・大きさ・速さを変えられるように。向きは進行方向に合わせて回転させて。' },
      { name:'画面の揺れ（シェイク）', en:'Screen shake with trauma', h:450, tags:['体験','ゲーム'],
        demo:'<div class="kt"><span class="sw"></span><div class="mm-cv"></div><div class="kt-row"><button type="button" class="kt-btn pri hit">💥 ぶつける</button><span class="mm-f out" style="flex:1">揺れ = 最大量 × <b>トラウマ²</b> × ノイズ(時間)</span></div></div>',
        init:(el) => { let k = 1, tr = 0; const c = cv(el), g = c.ctx;
          $(el, '.sw').replaceWith(seg(['毎フレーム Math.random()', 'トラウマ² × ノイズ'], i => { k = i; }, 1).el);
          $(el, '.hit').onclick = () => { tr = Math.min(1, tr + .5); };
          return VD.loop(c.box, (dt, now) => { tr = Math.max(0, tr - dt * .9); const sh = k ? tr * tr : tr, rnd = (o) => k ? noise1(now * 18 + o) * 2 - 1 : Math.random() * 2 - 1, ox = 24 * sh * rnd(0), oy = 24 * sh * rnd(50), ang = .08 * sh * rnd(99), gy = c.h * .7;
            g.clearRect(0, 0, c.w, c.h); g.save(); g.translate(c.w / 2 + ox, c.h / 2 + oy); g.rotate(ang); g.translate(-c.w / 2, -c.h / 2);
            g.fillStyle = '#7dd3fc'; g.fillRect(-40, -40, c.w + 80, gy + 40); g.fillStyle = '#65a30d'; g.fillRect(-40, gy, c.w + 80, c.h - gy + 40);
            [[.18, 50], [.42, 80], [.82, 60]].forEach(([x, hh]) => { g.fillStyle = '#a16207'; g.fillRect(c.w * x - 6, gy - hh, 12, hh); g.fillStyle = '#15803d'; g.beginPath(); g.arc(c.w * x, gy - hh, 24, 0, 7); g.fill(); });
            g.font = '30px sans-serif'; g.textAlign = 'center'; g.fillText('🏃', c.w * .62, gy - 4); g.textAlign = 'left'; g.restore();
            g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(6, 6, 178, 18); g.fillStyle = c.bad; g.fillRect(10, 10, 80 * tr, 10); g.strokeStyle = '#fff'; g.lineWidth = 1; g.strokeRect(10, 10, 80, 10); g.fillStyle = '#fff'; g.font = '700 10px sans-serif'; g.fillText('トラウマ ' + f2(tr), 98, 19); }); },
        desc:'ダメージや爆発で画面を揺らすときは、<b>トラウマ</b>（揺れの強さ 0〜1）を加算して時間で減らし、<b>揺れ = 最大量 × トラウマ² × ノイズ</b>にするのが定番。2乗にすると小さい衝撃は控えめ、大きい衝撃はしっかり揺れます。Math.random() だと細かく震えるだけで重さが出ません。酔いやすい人のために<b>揺れを弱める設定</b>も用意しましょう。',
        prompt:'ゲームでダメージを受けたときの画面の揺れを実装して。trauma（0〜1）を加算して毎秒減らし、shake = trauma²、カメラの位置と角度を noise(時間) × 最大量 × shake でずらして。設定画面に「画面の揺れ：オフ／弱／強」を追加して。' },
    ], null, true),
    { title:'揺れの使い分け', note:'同じ「揺れ」でも、目的によって使う計算が変わります。',
      table:{ head:['動き', '使う計算', '例'], rows:[['ふわふわ浮く', 'sin（ゆっくり・小さく）', 'ヒーローのイラスト、浮かぶボタン'], ['呼吸する', 'sin で scale・透明度', 'ローディング、録音中の表示'], ['ゆらゆら', '重ねた sin・ノイズ', '草・炎・旗・水面'], ['不規則に飛び回る', '2つのノイズで x と y', 'ホタル・ほこり・背景の粒'], ['ぶるっと震える', '減衰する sin（A × e^(−kt) × sin）', '入力エラーの横揺れ'], ['ドンと揺れる', 'トラウマ² × ノイズ', 'ダメージ・爆発・着地'], ['波打つ文字', '文字ごとに位相をずらした sin', 'タイトル・お祝いの演出']] } },
    S('波とノイズの用語', [
      T('振幅', 'Amplitude', '揺れの大きさ。sin の結果（−1〜1）に掛ける数。', null, ['基本']),
      T('周波数', 'Frequency', '1秒に何回揺れるか（Hz）。大きいほど速い。'),
      T('周期', 'Period', '1回揺れるのにかかる時間。周期 ＝ 1 ÷ 周波数。'),
      T('位相', 'Phase', '波の開始位置のずれ。要素ごとに変えると、順番に揺れる。'),
      T('減衰振動', 'Damped oscillation', 'A × e^(−kt) × sin(…)。だんだん小さくなる揺れ。エラーの「ぶるっ」に。'),
      T('ノイズ', 'Noise', '近い入力には近い値を返す、なめらかな乱数。'),
      T('パーリンノイズ', 'Perlin noise', '代表的なノイズ。地形・雲・炎・木目の生成で有名。'),
      T('シンプレックスノイズ', 'Simplex noise', 'パーリンノイズの改良版。多次元でも速い。npm の simplex-noise が手軽。'),
      T('fBm・オクターブ', 'Fractal Brownian motion', '周波数を2倍・振幅を半分にしたノイズを重ねて、細かい凹凸を足す方法。'),
      T('シード', 'Seed', '乱数の出発点。同じシードなら毎回同じ結果になる（再現できる）。'),
      T('疑似乱数', 'Pseudo-random', '計算で作った「乱数っぽい」数。Math.random() はシードを指定できない。'),
      T('トラウマ', 'Trauma (shake)', '画面の揺れの強さを 0〜1 で持つ考え方。2乗して使うと自然。'),
      T('リサージュ曲線', 'Lissajous curve', '縦と横を別の周波数の sin で動かしてできる曲線。'),
    ]),
  ]});

/* ================= 6. 当たり判定 ================= */
TABS.push({ id:'collision', label:'当たり判定', icon:'💥',
  intro:'ゲームでもUIでも「重なった？」「ぶつかった？」の判定はよく使います。2Dなら<b>四角・円・線</b>の3つの判定でほとんど足ります。ぶつかった後の<b>跳ね返りの向き</b>、速すぎて<b>すり抜ける</b>問題、物が多いときの<b>高速化</b>まで、触って確かめましょう。',
  sections:[
    C('触って理解する', [
      { name:'四角と円の当たり判定', en:'AABB & circle tests', h:470, tags:['基本','体験','最重要'],
        demo:'<div class="kt"><span class="sw"></span><div class="mm-cv"><span class="tip">図形をドラッグ</span></div><div class="mm-f out"></div></div>',
        init:(el) => { let k = 0; const c = cv(el), g = c.ctx, P = [[c.w * .36, c.h * .5], [c.w * .62, c.h * .42]], RW = Math.round(Math.min(64, c.w * .16)), RH = 42, R = Math.round(Math.min(46, c.w * .12));
          const shape = (p, col, circle) => { g.fillStyle = col; g.strokeStyle = col; g.lineWidth = 2; g.globalAlpha = .3; g.beginPath(); circle ? g.arc(p[0], p[1], R, 0, 7) : g.rect(p[0] - RW, p[1] - RH, RW * 2, RH * 2); g.fill(); g.globalAlpha = 1; g.stroke(); };
          const draw = () => { g.clearRect(0, 0, c.w, c.h); const [a, b] = P; let txt;
            if (k === 0){ const ox = RW * 2 - Math.abs(a[0] - b[0]), oy = RH * 2 - Math.abs(a[1] - b[1]), hit = ox > 0 && oy > 0, col = hit ? c.bad : c.acc; shape(a, col); shape(b, col);
              if (hit){ if (ox < oy) arrow(g, b[0], b[1], b[0] + Math.sign(b[0] - a[0] || 1) * ox, b[1], c.ink); else arrow(g, b[0], b[1], b[0], b[1] + Math.sign(b[1] - a[1] || 1) * oy, c.ink); }
              txt = `横の重なり = ${Math.round(ox)}px、縦の重なり = ${Math.round(oy)}px\n両方がプラスなら当たり → <b>${hit ? '当たり' : 'はずれ'}</b>${hit ? `\n矢印：重なりの小さい方向へ ${Math.round(Math.min(ox, oy))}px 押し出すと離れる` : ''}`; }
            else if (k === 1){ const d = Math.hypot(a[0] - b[0], a[1] - b[1]), hit = d < R * 2, col = hit ? c.bad : c.acc; shape(a, col, 1); shape(b, col, 1); g.strokeStyle = c.ink; g.setLineDash([4, 4]); g.lineWidth = 1.5; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); g.setLineDash([]);
              txt = `中心の距離 = <b>${Math.round(d)}</b>px、半径の合計 = <b>${R * 2}</b>px\n距離 < 半径の合計 なら当たり → <b>${hit ? '当たり' : 'はずれ'}</b>\n（√ を省いて、2乗どうしで比べると速い）`; }
            else { const qx = clamp(a[0], b[0] - RW, b[0] + RW), qy = clamp(a[1], b[1] - RH, b[1] + RH), d = Math.hypot(a[0] - qx, a[1] - qy), hit = d < R, col = hit ? c.bad : c.acc; shape(a, col, 1); shape(b, col); g.strokeStyle = c.ink; g.setLineDash([4, 4]); g.lineWidth = 1.5; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(qx, qy); g.stroke(); g.setLineDash([]); dot(g, qx, qy, 5, c.ink);
              txt = `四角の中で、円の中心に一番近い点（黒）を clamp で求める\nその点までの距離 <b>${Math.round(d)}</b>px < 半径 <b>${R}</b>px → <b>${hit ? '当たり' : 'はずれ'}</b>`; }
            P.forEach(p => dot(g, p[0], p[1], 4, c.ink)); $(el, '.out').innerHTML = txt; };
          dragPts(c.box, P, draw, 50); c.redraw = draw; $(el, '.sw').replaceWith(seg(['四角 × 四角', '円 × 円', '円 × 四角'], i => { k = i; draw(); }).el); },
        desc:'<b>AABB</b>（回転しない四角）どうしは「横も縦も重なっているか」、<b>円どうし</b>は「中心の距離 < 半径の合計」、<b>円と四角</b>は「四角の中で円の中心に一番近い点（clamp）までの距離 < 半径」。ほとんどの2Dゲーム・UIの当たり判定はこの3つで足ります。ぶつかった後は<b>重なりの小さい方向に押し出す</b>と、めり込みが直ります。',
        prompt:'2Dアクションゲームで、プレイヤー（四角）と壁（四角）の当たり判定とめり込みの解消を書いて。横と縦の重なりを計算し、重なりが小さい方向に押し戻して、その方向の速度を0にする。地面に立っているかどうかも返して。',
        code:'// 四角 × 四角（x, y は左上、w, h は幅・高さ）\nconst hitRect = (a, b) =>\n  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;\n\n// 円 × 円（2乗で比べて √ を省く）\nconst hitCircle = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2 < (a.r + b.r) ** 2;\n\n// 円 × 四角：四角の中で一番近い点を clamp で求める\nconst hitCircleRect = (c, r) => {\n  const qx = Math.max(r.x, Math.min(c.x, r.x + r.w));\n  const qy = Math.max(r.y, Math.min(c.y, r.y + r.h));\n  return (c.x - qx) ** 2 + (c.y - qy) ** 2 < c.r ** 2;\n};' },
      { name:'跳ね返りの向き（反射ベクトル）', en:'Reflection & restitution', h:480, tags:['体験'],
        demo:'<div class="kt"><div class="mm-cv"><span class="tip">壁の両端・青い玉をドラッグ</span></div><div class="sl"></div><div class="mm-f out"></div></div>',
        init:(el) => { const c = cv(el), g = c.ctx, P = [[c.w * .22, c.h * .8], [c.w * .82, c.h * .6], [c.w * .18, c.h * .16]]; const st = sliders($(el, '.sl'), [['e', '反発係数 e', 0, 1, .05, .8]], () => draw());
          const draw = () => { g.clearRect(0, 0, c.w, c.h); const [p0, p1, s] = P, M = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2], wl = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) || 1; let nx = -(p1[1] - p0[1]) / wl, ny = (p1[0] - p0[0]) / wl; if ((s[0] - M[0]) * nx + (s[1] - M[1]) * ny < 0){ nx = -nx; ny = -ny; }
            const L = Math.hypot(M[0] - s[0], M[1] - s[1]) || 1, dx = (M[0] - s[0]) / L, dy = (M[1] - s[1]) / L, dn = dx * nx + dy * ny, rx = dx - (1 + st.e) * dn * nx, ry = dy - (1 + st.e) * dn * ny, len = Math.min(L, 130);
            g.strokeStyle = c.ink; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); g.stroke(); g.lineCap = 'butt';
            g.strokeStyle = c.mut; g.setLineDash([4, 4]); g.lineWidth = 1.5; g.beginPath(); g.moveTo(M[0], M[1]); g.lineTo(M[0] + nx * 56, M[1] + ny * 56); g.stroke(); g.setLineDash([]); g.fillStyle = c.mut; g.font = '11px sans-serif'; g.fillText('法線 n', M[0] + nx * 60 - 14, M[1] + ny * 60);
            arrow(g, s[0], s[1], M[0], M[1], '#0ea5e9', 3); if (Math.hypot(rx, ry) > .02) arrow(g, M[0], M[1], M[0] + rx * len, M[1] + ry * len, c.bad, 3); dot(g, s[0], s[1], 9, '#0ea5e9'); dot(g, p0[0], p0[1], 6, c.ink); dot(g, p1[0], p1[1], 6, c.ink);
            $(el, '.out').innerHTML = `入ってくる向き v = (${f2(dx)}, ${f2(dy)})　法線 n = (${f2(nx)}, ${f2(ny)})　v・n = <b>${f2(dn)}</b>\n跳ね返り v' = v − (1 + e)(v・n)n = (<b>${f2(rx)}</b>, <b>${f2(ry)}</b>)${st.e === 1 ? '\n← e = 1：鏡のような完全な反射' : st.e === 0 ? '\n← e = 0：壁に沿ってすべるだけ' : ''}`; };
          dragPts(c.box, P, draw, 18); c.redraw = draw; draw(); },
        desc:'ボールが壁で跳ね返る向きは、壁に垂直な向き（<b>法線 n</b>）を使って <code>v − 2(v・n)n</code> で求めます。v・n（内積）は「壁に向かう成分」。そこだけを逆向きにして、壁に沿った成分はそのまま残します。<b>反発係数 e</b> を入れて <code>v − (1 + e)(v・n)n</code> にすると、弱い跳ね返りも表現できます。',
        prompt:'ブロック崩しのボールが、斜めの壁や丸いバンパーに当たったときに正しく跳ね返るようにして。当たった面の法線を求め、v − 2(v・n)n で反射させ、反発係数で速さを少し落として。',
        code:'// n は長さ1の法線（壁から外向き）\nconst vn = v.x * n.x + v.y * n.y;\nif (vn < 0) {                       // 壁に向かっているときだけ\n  v.x -= (1 + e) * vn * n.x;        // e = 1 で完全反射、0 で張り付く\n  v.y -= (1 + e) * vn * n.y;\n}' },
      { name:'速すぎるとすり抜ける', en:'Tunneling & continuous detection', h:450, tags:['体験','よくある失敗'],
        demo:'<div class="kt"><span class="sw"></span><div class="mm-cv"></div><div class="sl"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let k = 0, b, acc = 0, wait = 0; const c = cv(el), g = c.ctx, DT = 1 / 30, r = 6, ww = 8, wx = Math.round(c.w * .62);
          const st = sliders($(el, '.sl'), [['v', '弾の速さ', 100, 2400, 50, 1500, (v) => v + 'px/秒']], () => reset());
          // 最初の位置は「壁の直前で止まるフレームがある」最悪のケースにそろえる
          const reset = () => { const step = st.v * DT, x0 = wx - r - 1 - step * Math.floor((wx - r - 17) / step); b = { x:x0, tr:[x0], hit:false, out:false }; acc = 0; wait = 0; }; reset();
          $(el, '.sw').replaceWith(seg(['フレームごとの位置で判定', '移動した線で判定'], i => { k = i; reset(); }).el);
          return VD.loop(c.box, (dt) => { const y = c.h / 2, step = st.v * DT;
            if (wait > 0){ wait -= dt; if (wait <= 0) reset(); }
            else { acc += dt * .5; while (acc >= DT && wait <= 0){ acc -= DT; const nx = b.x + step;  // 実時間の半分のスローモーション
                if (k === 0 ? (nx + r > wx && nx - r < wx + ww) : (b.x + r <= wx && nx + r >= wx)){ b.x = wx - r; b.hit = true; wait = 1.2; } else b.x = nx;
                b.tr.push(b.x); if (b.x > c.w + 20){ b.out = true; wait = .9; } } }
            g.clearRect(0, 0, c.w, c.h); g.fillStyle = c.ink; g.fillRect(wx, y - 50, ww, 100); g.fillStyle = c.mut; g.font = '10px sans-serif'; g.fillText('灰色 = 1/30秒ごとの位置', 8, 14);
            if (k === 1 && b.tr.length > 1){ g.strokeStyle = c.acc; g.lineWidth = 2; g.beginPath(); g.moveTo(b.tr[0], y); g.lineTo(b.x, y); g.stroke(); }
            g.globalAlpha = .35; b.tr.slice(0, -1).forEach(x => dot(g, x, y, r, c.mut)); g.globalAlpha = 1; dot(g, b.x, y, r, b.hit ? c.bad : '#0ea5e9');
            const head = `1フレームに進む距離 = 速さ × dt = <b>${Math.round(step)}</b>px（壁 ${ww}px ＋ 弾 ${r * 2}px = ${ww + r * 2}px）\n`;
            if (b.hit) setOut(el, '.res', head + (k ? '✓ 前の位置から今の位置への<b>線分</b>が壁をまたいだかで判定するので、どんなに速くても当たります（連続的な衝突判定）。' : '当たりました。速さを上げて、1フレームの移動が壁＋弾の大きさを超えると…？'), 'ok');
            else if (b.out) setOut(el, '.res', head + '❌ 弾の位置が壁の<b>手前と向こう側</b>にしか来なかったので、<b>すり抜けました</b>。', 'bad');
            else setOut(el, '.res', head + '飛んでいます…', ''); }); },
        desc:'当たり判定を「各フレームの位置」だけで行うと、<b>1フレームに進む距離が壁より大きい</b>とき、弾は壁の手前→向こう側へワープして<b>すり抜けます</b>（トンネリング）。対策は ①前の位置から今の位置への<b>線分</b>で判定する（連続的な衝突判定）②1フレームを細かく分けて何回か判定する ③壁を厚くする・速さに上限を付ける。',
        prompt:'このゲームで、速い弾が薄い壁や敵をすり抜けてしまう。前フレームの位置から今の位置への線分と、壁や敵の四角が交わるかで判定する方法（レイキャスト）に直して。当たった場合は、当たった地点も返して。' },
      { name:'たくさんの当たり判定を速くする', en:'Broad phase with a spatial grid', h:470, tags:['体験','上級'],
        demo:'<div class="kt"><span class="sw"></span><div class="mm-cv"></div><div class="sl"></div><div class="mm-f out"></div></div>',
        init:(el) => { let k = 0, B = [], tAvg = 0, cAvg = 0, fr = 0; const c = cv(el), g = c.ctx, R = 4, CELL = 20;
          const make = (n) => { B = Array.from({ length:n }, () => ({ x:Math.random() * c.w, y:Math.random() * c.h, vx:(Math.random() - .5) * 80, vy:(Math.random() - .5) * 80, hit:false })); };
          const st = sliders($(el, '.sl'), [['n', '玉の数', 50, 800, 50, 300]], () => make(st.n)); make(st.n);
          $(el, '.sw').replaceWith(seg(['総当たり', '空間グリッド'], i => { k = i; }).el);
          return VD.loop(c.box, (dt) => { B.forEach(b => { b.x += b.vx * dt; b.y += b.vy * dt; if (b.x < R || b.x > c.w - R) b.vx *= -1; if (b.y < R || b.y > c.h - R) b.vy *= -1; b.x = clamp(b.x, R, c.w - R); b.y = clamp(b.y, R, c.h - R); b.hit = false; });
            const t0 = performance.now(), D2 = (R * 2) ** 2; let checks = 0; const test = (a, b) => { checks++; const dx = a.x - b.x, dy = a.y - b.y; if (dx * dx + dy * dy < D2) a.hit = b.hit = true; };
            if (k === 0){ for (let i = 0; i < B.length; i++) for (let j = i + 1; j < B.length; j++) test(B[i], B[j]); }
            else { const cols = Math.ceil(c.w / CELL), grid = new Map(); B.forEach(b => { const key = Math.floor(b.x / CELL) + Math.floor(b.y / CELL) * cols; (grid.get(key) || grid.set(key, []).get(key)).push(b); });
              // 同じマスと「右・左下・下・右下」のマスだけ調べる（同じ組を2回数えない）
              grid.forEach((list, key) => { const cx = key % cols, cy = (key - cx) / cols; for (let i = 0; i < list.length; i++){ for (let j = i + 1; j < list.length; j++) test(list[i], list[j]); for (const [ox, oy] of [[1, 0], [-1, 1], [0, 1], [1, 1]]){ const nx = cx + ox; if (nx < 0 || nx >= cols) continue; const other = grid.get(nx + (cy + oy) * cols); if (other) for (const o of other) test(list[i], o); } } }); }
            const ms = performance.now() - t0; tAvg += (ms - tAvg) * .1; cAvg += (checks - cAvg) * .1;
            g.clearRect(0, 0, c.w, c.h); if (k === 1){ g.strokeStyle = c.bd; g.lineWidth = 1; g.beginPath(); for (let x = 0; x < c.w; x += CELL){ g.moveTo(x, 0); g.lineTo(x, c.h); } for (let y = 0; y < c.h; y += CELL){ g.moveTo(0, y); g.lineTo(c.w, y); } g.stroke(); }
            B.forEach(b => dot(g, b.x, b.y, R, b.hit ? c.bad : c.acc));
            if (fr++ % 8 === 0) $(el, '.out').innerHTML = `1フレームの判定回数：<b>${Math.round(cAvg).toLocaleString()}</b> 回（総当たりなら ${(B.length * (B.length - 1) / 2).toLocaleString()} 回）\n判定にかかった時間：<b>${f2(tAvg, 2)}</b> ms　赤 = ぶつかっている玉`; }); },
        desc:'玉が N 個あると、総当たりの判定は N × (N − 1) ÷ 2 回（800個なら約32万回）。<b>空間グリッド</b>で画面をマス目に分け、<b>同じマスと隣のマスの玉だけ</b>を調べると、回数が桁違いに減ります。大まかに候補を絞る段階を<b>ブロードフェーズ</b>、細かく調べる段階を<b>ナローフェーズ</b>と呼びます。',
        prompt:'シューティングゲームで弾と敵が数百個になると重くなる。画面を 64px のマス目に分ける空間グリッドを作り、同じマスと周りのマスにいる物どうしだけ当たり判定するように直して。毎フレーム作り直す簡単な実装で。' },
    ], null, true),
    { title:'形の組み合わせと判定方法', note:'判定したい形の組み合わせから、使う計算を選びます。複雑な形は、まず<b>四角や円で大まかに</b>判定してから細かく調べると速くなります。',
      table:{ head:['組み合わせ', '考え方', '使う場面'], rows:[['点 × 四角', 'x・y が両方とも範囲内か', 'クリック・ホバーの判定'], ['四角 × 四角（AABB）', '横も縦も重なっているか', 'タイルのゲーム、UIの重なり'], ['円 × 円', '距離² < (半径の合計)²', '弾・玉・キャラ'], ['円 × 四角', 'clamp で一番近い点を求める', 'ボールとブロック'], ['線分 × 線分', '外積の符号で、互いをまたぐか', 'レーザー・速い弾・視線'], ['回転した四角・多角形', '分離軸定理（SAT）', '物理エンジン・回転する物'], ['点 × 多角形', '点から半直線を伸ばし、辺と交わる回数が奇数なら内側', '地図のエリア・投げ縄選択'], ['もっと複雑な形', '物理エンジンに任せる', 'Matter.js・Rapier・Box2D']] } },
    S('当たり判定の用語', [
      T('当たり判定', 'Collision detection', '物どうしが重なったか・ぶつかったかを調べること。', null, ['基本']),
      T('AABB', 'Axis-Aligned Bounding Box', '回転しない（軸にそろった）四角。判定がいちばん簡単で速い。'),
      T('バウンディングボックス', 'Bounding box', '形全体を囲む四角。まずこれで大まかに判定する。'),
      T('分離軸定理（SAT）', 'Separating Axis Theorem', '「2つの形の間に線を引けるなら重なっていない」を使う判定。回転した四角や多角形に。'),
      T('法線', 'Normal', '面に垂直で、長さ1の向き。跳ね返り・押し出し・光の計算に使う。'),
      T('反射ベクトル', 'Reflection vector', 'v − 2(v・n)n。壁で跳ね返った後の向き。'),
      T('めり込みの解消', 'Penetration resolution', 'ぶつかって重なった分だけ、重なりの小さい方向へ押し戻す。'),
      T('トンネリング', 'Tunneling', '速すぎる物が、フレームの間に壁を飛び越えてすり抜けること。', null, ['よくある失敗']),
      T('連続的な衝突判定', 'Continuous collision detection (CCD)', '移動の途中も含めて判定する方法。線分やスイープで調べる。'),
      T('ブロードフェーズ・ナローフェーズ', 'Broad / narrow phase', '大まかに候補を絞る段階と、細かく調べる段階。'),
      T('空間グリッド・四分木', 'Spatial grid / quadtree', '画面をマス目や4分割の木に分け、近くの物だけ調べる工夫。'),
      T('レイキャスト', 'Raycast', '点から光線を飛ばし、最初に当たる物を調べる。視線・弾・クリック判定に。'),
      T('物理エンジン', 'Physics engine', '重力・衝突・跳ね返りをまとめて計算するライブラリ。Matter.js（2D）・Rapier（2D/3D）など。'),
    ]),
  ]});

/* ================= 7. 曲線と経路 ================= */
TABS.push({ id:'curves', label:'曲線と経路', icon:'➰',
  intro:'なめらかな線や、物が曲がりながら進む経路は<b>ベジェ曲線</b>や<b>スプライン</b>で作ります。SVG の path、CSS の cubic-bezier、デザインツールのペン、フォントの輪郭も同じしくみ。曲線の上を<b>一定の速さ</b>で動かすには、もうひと工夫（弧長）が必要です。',
  sections:[
    C('触って理解する', [
      { name:'ベジェ曲線のしくみ', en:'Bézier curves (de Casteljau)', h:500, tags:['基本','体験','最重要'],
        demo:'<div class="kt"><span class="sw"></span><div class="mm-cv"><span class="tip">点をドラッグ</span></div><div class="sl"></div><div class="mm-f out"></div></div>',
        init:(el) => { let k = 1; const c = cv(el), g = c.ctx, P = [[c.w * .1, c.h * .85], [c.w * .22, c.h * .12], [c.w * .72, c.h * .1], [c.w * .9, c.h * .8]], LV = [c.bd, '#0ea5e9', '#a855f7']; const st = sliders($(el, '.sl'), [['t', 't（0〜1）', 0, 1, .01, .4]], () => draw());
          const split = (q, u) => q.slice(1).map((p, j) => [q[j][0] + (p[0] - q[j][0]) * u, q[j][1] + (p[1] - q[j][1]) * u]);
          const draw = () => { const pts = k ? P : P.slice(0, 3), R = (n) => Math.round(n); g.clearRect(0, 0, c.w, c.h);
            const cur = []; for (let i = 0; i <= 60; i++){ let q = pts; while (q.length > 1) q = split(q, i / 60); cur.push(q[0]); } g.strokeStyle = c.acc; g.lineWidth = 3; line(g, cur);
            let q = pts, lv = 0; while (q.length > 1){ g.strokeStyle = LV[lv]; g.lineWidth = lv ? 1.5 : 1; line(g, q); if (lv) q.forEach(p => dot(g, p[0], p[1], 4, LV[lv])); q = split(q, st.t); lv++; }
            pts.forEach((p, i) => { dot(g, p[0], p[1], 7, c.ink); g.fillStyle = c.mut; g.font = '10px monospace'; g.fillText('P' + i, p[0] + 9, p[1] - 6); }); dot(g, q[0][0], q[0][1], 8, c.bad);
            const d = k ? `M ${R(P[0][0])} ${R(P[0][1])} C ${R(P[1][0])} ${R(P[1][1])}, ${R(P[2][0])} ${R(P[2][1])}, ${R(P[3][0])} ${R(P[3][1])}` : `M ${R(P[0][0])} ${R(P[0][1])} Q ${R(P[1][0])} ${R(P[1][1])}, ${R(P[2][0])} ${R(P[2][1])}`;
            $(el, '.out').innerHTML = (k ? 'B(t) = (1−t)³P0 + 3(1−t)²t P1 + 3(1−t)t² P2 + t³P3' : 'B(t) = (1−t)²P0 + 2(1−t)t P1 + t²P2') + `\nt = ${f2(st.t)} の点（赤）= (<b>${R(q[0][0])}</b>, <b>${R(q[0][1])}</b>)\nSVG：<b>${d}</b>`; };
          dragPts(c.box, P, draw); c.redraw = draw; $(el, '.sw').replaceWith(seg(['2次（点3つ）', '3次（点4つ）'], i => { k = i; draw(); }, 1).el); },
        desc:'ベジェ曲線は「<b>線の上を t の割合で進む点</b>」を何段も重ねて作ります（ド・カステリョのアルゴリズム）。灰色の線を t で分けた点を結び（青）、さらに t で分け（紫）…最後の1点（赤）が曲線上の点。端の点は曲線が通りますが、<b>真ん中の制御点は通らず「引っぱる」だけ</b>。SVG の <code>C</code>・<code>Q</code>、CSS の <code>cubic-bezier()</code>、フォントの輪郭、Figma のペンツールも同じしくみです。',
        prompt:'Canvas で、ベジェ曲線の制御点をドラッグして形を変えられるエディターを作って。曲線を描き、SVG の path の d 属性（M … C …）を下に表示してコピーできるようにして。',
        code:'// 3次ベジェ曲線上の点（t は 0〜1）\nfunction bezier(p0, p1, p2, p3, t) {\n  const u = 1 - t;\n  return {\n    x: u*u*u*p0.x + 3*u*u*t*p1.x + 3*u*t*t*p2.x + t*t*t*p3.x,\n    y: u*u*u*p0.y + 3*u*u*t*p1.y + 3*u*t*t*p2.y + t*t*t*p3.y,\n  };\n}' },
      { name:'点を通るなめらかな線', en:'Catmull-Rom & B-spline', h:450, tags:['体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="mm-cv"><span class="tip">点をドラッグ</span></div><div class="mm-f out"></div></div>',
        init:(el) => { let k = 1; const c = cv(el), g = c.ctx, P = [.08, .25, .42, .58, .75, .92].map((x, i) => [c.w * x, c.h * (i % 2 ? .28 : .72)]);
          const NOTE = ['点を直線でつなぐだけ。角ができて、動きの経路にするとカクカク曲がる。', '<b>すべての点を通る</b>なめらかな曲線。手描きの線の補正、カメラや敵の巡回ルート、グラフの曲線（D3 の curveCatmullRom）に。', '<b>点を通らない</b>が、とてもなめらか。点は磁石のように線を引き寄せるだけ。'];
          const cr = (p0, p1, p2, p3, t) => [0, 1].map(d => .5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t * t + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t * t * t));
          const bs = (p0, p1, p2, p3, t) => [0, 1].map(d => ((1 - t) ** 3 * p0[d] + (3 * t ** 3 - 6 * t * t + 4) * p1[d] + (-3 * t ** 3 + 3 * t * t + 3 * t + 1) * p2[d] + t ** 3 * p3[d]) / 6);
          const draw = () => { g.clearRect(0, 0, c.w, c.h); const a = P[0], z = P[P.length - 1]; g.strokeStyle = k ? c.bd : c.acc; g.lineWidth = k ? 1.5 : 3; line(g, P);
            if (k){ const f = k === 1 ? cr : bs, E = k === 1 ? [a, ...P, z] : [a, a, ...P, z, z], out = []; for (let i = 0; i < E.length - 3; i++) for (let s = 0; s <= 20; s++) out.push(f(E[i], E[i + 1], E[i + 2], E[i + 3], s / 20)); g.strokeStyle = c.acc; g.lineWidth = 3; line(g, out); }
            P.forEach(p => dot(g, p[0], p[1], 7, c.bad)); $(el, '.out').innerHTML = NOTE[k]; };
          dragPts(c.box, P, draw); c.redraw = draw; $(el, '.sw').replaceWith(seg(['折れ線', 'Catmull-Rom', 'Bスプライン'], i => { k = i; draw(); }, 1).el); },
        desc:'いくつかの点を<b>すべて通る</b>なめらかな線が欲しいときは <b>Catmull-Rom スプライン</b>。前後の点から曲がり方を自動で決めるので、点を並べるだけで曲線になります。SVG で描くときは、各区間を3次ベジェ（制御点 = p1 + (p2 − p0) ÷ 6 と p2 − (p3 − p1) ÷ 6）に変換できます。',
        prompt:'マウスで描いた線を、ガタガタを減らしたなめらかな曲線にしたい。数px ごとに点を間引き、Catmull-Rom スプラインをベジェ曲線に変換して SVG の path として出力して。',
        code:'// Catmull-Rom（p0, p1, p2, p3）→ p1〜p2 をつなぐ3次ベジェ\nconst toBezier = (p0, p1, p2, p3) => [\n  { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 },\n  { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 },\n  p2,\n];\n// d += `C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`' },
      { name:'曲線の上を一定の速さで動かす', en:'Arc-length parameterization', h:480, tags:['体験','よくある失敗'],
        demo:'<div class="kt"><span class="sw"></span><div class="mm-cv"><span class="tip">点をドラッグ</span></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let k = 0, lut = []; const c = cv(el), g = c.ctx, P = [[c.w * .08, c.h * .82], [c.w * .14, c.h * .1], [c.w * .3, c.h * .1], [c.w * .92, c.h * .72]];
          const B = (t) => { const u = 1 - t; return [0, 1].map(d => u * u * u * P[0][d] + 3 * u * u * t * P[1][d] + 3 * u * t * t * P[2][d] + t * t * t * P[3][d]); };
          // 曲線を200区間に分けて、始点からの長さの表（LUT）を作る
          const build = () => { lut = [0]; let prev = B(0); for (let i = 1; i <= 200; i++){ const p = B(i / 200); lut.push(lut[i - 1] + Math.hypot(p[0] - prev[0], p[1] - prev[1])); prev = p; } };
          const tAt = (s) => { const L = lut[200] * s; let lo = 0, hi = 200; while (lo < hi){ const m = (lo + hi) >> 1; if (lut[m] < L) lo = m + 1; else hi = m; } if (lo === 0) return 0; const a = lut[lo - 1], b = lut[lo]; return (lo - 1 + (L - a) / (b - a || 1)) / 200; };
          build(); dragPts(c.box, P, build); c.redraw = build; $(el, '.sw').replaceWith(seg(['t を一定に進める', '距離を一定に進める'], i => { k = i; }).el);
          return VD.loop(c.box, (dt, now) => { const T = (u) => k ? tAt(u) : u, s = (now / 3) % 1; g.clearRect(0, 0, c.w, c.h);
            g.strokeStyle = c.bd; g.lineWidth = 1; line(g, P); const cur = []; for (let i = 0; i <= 80; i++) cur.push(B(i / 80)); g.strokeStyle = c.acc; g.lineWidth = 3; line(g, cur);
            const ds = []; let prev = null; for (let i = 0; i <= 16; i++){ const p = B(T(i / 16)); dot(g, p[0], p[1], 4, c.ink); if (prev) ds.push(Math.hypot(p[0] - prev[0], p[1] - prev[1])); prev = p; }
            const t = T(s), t2 = Math.min(1, t + .01), p = B(t), p1 = B(t2 - .01), p2 = B(t2), ang = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
            g.save(); g.translate(p[0], p[1]); g.rotate(ang); g.fillStyle = c.bad; g.beginPath(); g.moveTo(14, 0); g.lineTo(-10, -9); g.lineTo(-10, 9); g.closePath(); g.fill(); g.restore(); P.forEach(q => dot(g, q[0], q[1], 6, c.mut));
            const mx = Math.max(...ds), mn = Math.min(...ds);
            setOut(el, '.res', k ? `✓ 曲線の長さの表（全長 ${Math.round(lut[200])}px を200区間で測定）から<b>距離 → t</b> を逆引き。点の間隔がそろい（${Math.round(mn)}〜${Math.round(mx)}px）、<b>一定の速さ</b>で進みます。向きは少し先の点との差の atan2。` : `❌ t を一定に増やすと、制御点が近い所で詰まり、離れた所で間延びします。点の間隔が <b>${Math.round(mn)}〜${Math.round(mx)}px</b>（最大 ${f2(mx / (mn || 1), 1)} 倍）＝<b>速さが変わる</b>。`, k ? 'ok' : 'bad'); }); },
        desc:'ベジェ曲線の t を一定に増やしても、<b>一定の速さにはなりません</b>（制御点が近い所ではゆっくり、遠い所では速い）。等速で動かしたいときは、曲線を細かく区切って<b>長さの表（LUT）</b>を作り、「進んだ距離 → t」を逆引きします。SVG なら <code>path.getTotalLength()</code> と <code>getPointAtLength()</code> がこの計算を代わりにやってくれます。',
        prompt:'SVG の曲線のパスに沿って、飛行機のアイコンを一定の速さで飛ばしたい。path.getTotalLength() と getPointAtLength() で位置を求め、少し先の点との差から角度を出して、アイコンを進行方向に向けて。',
        code:"const path = document.querySelector('#route');\nconst total = path.getTotalLength();\n\nfunction place(progress) {                 // 0〜1（距離の割合 ＝ 等速）\n  const d = progress * total;\n  const p = path.getPointAtLength(d);\n  const q = path.getPointAtLength(Math.min(total, d + 1));\n  const deg = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI;\n  plane.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${deg})`);\n}" },
      { name:'CSS だけでパスに沿って動かす', en:'CSS offset-path', h:420, tags:['体験','CSS'],
        demo:'<div class="kt"><span class="sw"></span><div class="mm-cv op"></div><div class="mm-f out"></div></div>',
        init:(el) => { let rot = 'auto'; const box = $(el, '.op');
          const apply = () => { const o = $(box, '.mm-off'); if (o) o.style.offsetRotate = rot; };
          // ボタンと説明が入って枠の大きさが決まってから、パスを作る
          const build = () => { const W = box.clientWidth, H = box.clientHeight, d = `M 22 ${H - 26} C ${Math.round(W * .3)} ${Math.round(-H * .25)}, ${Math.round(W * .55)} ${Math.round(H * 1.15)}, ${W - 26} 26`;
            box.innerHTML = `<svg width="${W}" height="${H}" style="position:absolute;inset:0" aria-hidden="true"><path d="${d}" fill="none" stroke="var(--border-strong)" stroke-width="2" stroke-dasharray="5 5"/></svg><div class="mm-off" style="offset-path:path('${d}')">➤</div>`; apply(); };
          $(el, '.sw').replaceWith(seg(['offset-rotate: auto', 'offset-rotate: 0deg'], i => { rot = i ? '0deg' : 'auto'; apply(); $(el, '.out').innerHTML = `.plane {\n  offset-path: path('M … C …');\n  offset-rotate: <b>${rot}</b>;  /* ${i ? '向きは固定' : '進行方向を向く'} */\n  animation: fly 3s ease-in-out infinite alternate;\n}\n@keyframes fly { to { offset-distance: 100%; } }`; }).el);
          build(); let last = [box.clientWidth, box.clientHeight]; const ro = new ResizeObserver(() => { const s = [box.clientWidth, box.clientHeight]; if (s[0] && s[1] && (s[0] !== last[0] || s[1] !== last[1])){ last = s; build(); } }); ro.observe(box); return () => ro.disconnect(); },
        desc:'CSS の <b>offset-path</b> を使うと、JavaScript なしで要素をパスに沿って動かせます。<code>offset-distance</code> は<b>距離の割合</b>なので自動的に等速になり、<code>offset-rotate: auto</code> で進行方向にも向きます。ロゴの演出・紙飛行機・配送ルートの表示などに。',
        prompt:'ページの見出しの横で、紙飛行機のアイコンが曲線のパスに沿って飛ぶ演出を CSS の offset-path で作って。進行方向を向くようにし、スクロールに合わせて進むよう animation-timeline: scroll() も使って。対応していないブラウザでは止まった状態で表示して。' },
    ], null, true),
    { title:'曲線の使い分け', note:'「点を通るか」と「なめらかさ」で選びます。',
      table:{ head:['曲線', '点を通る？', '向いている'], rows:[['折れ線', '通る', 'グラフ、カクカクした経路'], ['2次ベジェ', '端だけ通る', '簡単なカーブ、吹き出しのしっぽ'], ['3次ベジェ', '端だけ通る', 'SVG・フォント・イージング・デザインツール'], ['Catmull-Rom', 'すべて通る', '手描き線の補正、巡回ルート、グラフ'], ['Bスプライン', '通らない', 'とてもなめらかな形、3Dモデル'], ['円弧', '—', '角丸、円を描く動き']] } },
    S('曲線と経路の用語', [
      T('ベジェ曲線', 'Bézier curve', '端の点と制御点で形を決める曲線。2次（点3つ）と3次（点4つ）がよく使われる。', null, ['基本']),
      T('アンカーと制御点', 'Anchor / control point', 'アンカー＝曲線が通る点。制御点（ハンドル）＝曲線を引っぱる点。'),
      T('ド・カステリョのアルゴリズム', "De Casteljau's algorithm", '線を t の割合で分ける操作をくり返して、曲線上の点を求める方法。'),
      T('パラメーター t', 'Parameter t', '曲線の始点が0、終点が1になる進み具合。距離の割合とは一致しない。'),
      T('接線', 'Tangent', '曲線のその点での進む向き。物を進行方向に向けるときに使う。'),
      T('スプライン', 'Spline', '点をなめらかにつなぐ曲線の総称。'),
      T('Catmull-Rom スプライン', 'Catmull-Rom spline', 'すべての点を通るスプライン。'),
      T('弧長', 'Arc length', '曲線に沿って測った長さ。等速で動かすときに使う。'),
      T('LUT（ルックアップテーブル）', 'Lookup table', '計算結果を表にしておき、あとで引くこと。弧長 → t の変換に。'),
      T('getPointAtLength', 'SVGPathElement.getPointAtLength()', 'SVG のパスで、始点から指定の長さの位置を返す。'),
      T('offset-path', 'CSS Motion Path', 'CSS で要素をパスに沿って動かす機能。offset-distance・offset-rotate とセット。'),
      T('パスのモーフィング', 'Path morphing', 'ある形から別の形へ、パスを変形させるアニメーション。点の数をそろえるのがコツ（flubber など）。'),
    ]),
  ]});

/* ================= 8. UIで使う計算 ================= */
const CODE = (s) => `<code>${s}</code>`;
TABS.push({ id:'ui', label:'UIで使う計算', icon:'🧮',
  intro:'ここまでの計算は、毎日のUIでも大活躍します。<b>スクロール連動</b>、なめらかな<b>並べ替え</b>、投げて流れる<b>慣性</b>、<b>近い方へ回る</b>角度、<b>スナップ</b>、<b>きれいなランダム配置</b>。最後に、コピーして使える<b>式の早見表</b>もまとめました。',
  sections:[
    C('触って理解する', [
      { name:'スクロール量を進み具合に変える', en:'Scroll progress mapping', h:470, tags:['体験','定番','最重要'],
        demo:'<div class="kt"><div class="mm-scroll sc"><div class="mm-bar"><i></i></div><div class="mm-sp"></div></div><div class="mm-f out"></div></div>',
        init:(el) => { const sc = $(el, '.sc'), COL = ['#65a30d', '#0ea5e9', '#f59e0b', '#e11d48'];
          $(el, '.mm-sp').innerHTML = '<p>↓ この枠の中をスクロール</p>' + COL.map((cl, i) => `<div class="mm-rv" style="background:${cl}">カード ${i + 1}</div>`).join('') + '<p>おわり</p>';
          const upd = () => { const max = sc.scrollHeight - sc.clientHeight, p = max ? sc.scrollTop / max : 0, r0 = sc.getBoundingClientRect(), rows = []; $(sc, '.mm-bar i').style.width = p * 100 + '%';
            $$(sc, '.mm-rv').forEach((card, i) => { const r = card.getBoundingClientRect(), q = clamp((r0.bottom - r.top) / (r0.height + r.height), 0, 1), e = clamp(q / .35, 0, 1), ez = 1 - (1 - e) ** 3; card.style.opacity = ez; card.style.transform = `translateY(${(1 - ez) * 40}px) scale(${.9 + .1 * ez})`; rows.push([i, q, ez]); });
            // いま枠に入ってきているカード（進みが一番小さいもの）の数字を見せる
            const [ci, cq, cez] = rows.filter(r => r[1] > 0 && r[1] < 1).sort((a, b) => a[1] - b[1])[0] || rows[0];
            $(el, '.out').innerHTML = `全体の進み = scrollTop ÷ (scrollHeight − clientHeight) = <b>${f2(p)}</b>\nカード${ci + 1}の進み = (枠の下端 − カードの上端) ÷ (枠の高さ ＋ カードの高さ) = <b>${f2(cq)}</b>\n→ 0〜0.35 を 0〜1 に map ＋ easeOut → 透明度 <b>${f2(cez)}</b>`; };
          sc.addEventListener('scroll', upd, { passive:true }); upd(); },
        desc:'スクロールに合わせた演出は、ほぼ<b>「スクロール量 → 0〜1 の進み具合 → 見た目」</b>の変換だけでできています。全体なら <code>scrollTop ÷ (scrollHeight − clientHeight)</code>、要素ごとなら「画面に入り始めてから出るまで」を 0〜1 にし、map・clamp・イージングで透明度や位置に変えます。今は CSS の <code>animation-timeline: scroll()</code> / <code>view()</code> だけでも書けます。',
        prompt:'記事ページの上部に読了の進み具合バーを付けて、各セクションの画像が画面に入るとふわっと現れるようにして。CSS の animation-timeline: scroll() / view() を使い、対応していないブラウザでは IntersectionObserver でクラスを付ける方法に切り替えて。',
        code:'/* CSS だけで（scroll-driven animations） */\n.progress {\n  transform-origin: left;\n  animation: grow linear both;\n  animation-timeline: scroll(root);\n}\n@keyframes grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }\n\n.reveal {\n  animation: show linear both;\n  animation-timeline: view();\n  animation-range: entry 0% entry 100%;\n}\n@keyframes show { from { opacity: 0; translate: 0 40px; } }' },
      { name:'並べ替えをなめらかにする（FLIP）', en:'FLIP technique', h:440, tags:['体験','上級'],
        demo:'<div class="kt"><span class="sw"></span><div class="kt-row"><button type="button" class="kt-btn pri sh">🔀 シャッフル</button><button type="button" class="kt-btn so">番号順に戻す</button></div><div class="mm-cards cd"></div><div class="mm-f out"></div></div>',
        init:(el) => { let flip = 1; const box = $(el, '.cd'), COL = ['#65a30d', '#0ea5e9', '#f59e0b', '#e11d48', '#8b5cf6', '#14b8a6', '#f97316', '#64748b'];
          box.innerHTML = COL.map((cl, i) => `<div style="background:${cl}" data-n="${i}">${i + 1}</div>`).join('');
          const go = (order) => { const items = $$(box, ':scope > div'), first = new Map(items.map(d => [d, d.getBoundingClientRect()])); order(items).forEach(d => box.append(d)); if (!flip) return;
            items.forEach(d => { const a = first.get(d), b = d.getBoundingClientRect(), dx = a.left - b.left, dy = a.top - b.top; if (dx || dy) d.animate([{ transform:`translate(${dx}px, ${dy}px)` }, { transform:'none' }], { duration:500, easing:'cubic-bezier(.2, .8, .2, 1)' }); }); };
          $(el, '.sh').onclick = () => go(a => a.map(d => [Math.random(), d]).sort((x, y) => x[0] - y[0]).map(x => x[1]));
          $(el, '.so').onclick = () => go(a => a.slice().sort((x, y) => x.dataset.n - y.dataset.n));
          $(el, '.sw').replaceWith(seg(['FLIP なし', 'FLIP あり'], i => { flip = i; $(el, '.out').innerHTML = i ? '<b>F</b>irst：動かす前の位置を測る → <b>L</b>ast：並べ替えて新しい位置を測る\n<b>I</b>nvert：差の分だけ transform で元の場所に戻す → <b>P</b>lay：transform を 0 へアニメーション' : 'DOM の順番を入れ替えるだけだと、カードは<b>瞬間移動</b>します。どれがどこへ行ったか目で追えません。'; }, 1).el); },
        desc:'要素の並び順を変えると、ブラウザは<b>一瞬で</b>新しい位置に描き直します。<b>FLIP</b> は「前の位置（First）と後の位置（Last）を測り、差の分だけ transform で戻して（Invert）、0 へアニメーションする（Play）」技。重いレイアウト計算をせず transform だけで動かすので、なめらかです。Motion の <code>layout</code>、auto-animate、View Transitions API も同じ考え方。',
        prompt:'リストの並べ替え・追加・削除のときに、項目がなめらかに移動するようにして。FLIP（First・Last・Invert・Play）を Web Animations API で自前で実装し、動きを減らす設定のときはアニメーションしないように。',
        code:"function flip(container, change) {\n  const items = [...container.children];\n  const first = new Map(items.map(el => [el, el.getBoundingClientRect()])); // F\n  change();                                                              // 並べ替える\n  for (const el of items) {\n    const a = first.get(el), b = el.getBoundingClientRect();             // L\n    const dx = a.left - b.left, dy = a.top - b.top;\n    if (!dx && !dy) continue;\n    el.animate(                                                          // I → P\n      [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],\n      { duration: 400, easing: 'cubic-bezier(.2, .8, .2, 1)' });\n  }\n}" },
      { name:'投げて流れる・端でゴムのように', en:'Inertia & rubber band', h:420, tags:['体験','UI'],
        demo:'<div class="kt"><div class="mm-cv"><span class="tip">横にドラッグして投げる</span></div><div class="mm-f out"></div></div>',
        init:(el) => { const c = cv(el), g = c.ctx, N = 12, CW = 90, GAP = 12, maxX = Math.max(0, N * (CW + GAP) - GAP + 24 - c.w), K = .55; let x = 0, v = 0, drag = false, lx = 0, lt = 0, fr = 0;
          // 端を越えた分を縮めて表示する（ラバーバンド）と、その逆算
          const rubber = (o) => o < 0 ? -(1 - 1 / (-o * K / c.w + 1)) * c.w : o > maxX ? maxX + (1 - 1 / ((o - maxX) * K / c.w + 1)) * c.w : o;
          const inv = (y) => y < 0 ? -(1 / (1 + y / c.w) - 1) * c.w / K : y > maxX ? maxX + (1 / (1 - (y - maxX) / c.w) - 1) * c.w / K : y;
          c.box.addEventListener('pointerdown', (e) => { drag = true; x = inv(x); v = 0; lx = e.clientX; lt = performance.now(); c.box.setPointerCapture(e.pointerId); });
          c.box.addEventListener('pointermove', (e) => { if (!drag) return; const now = performance.now(), dx = e.clientX - lx, dtp = Math.max(1, now - lt) / 1000; x -= dx; v = v * .6 + (-dx / dtp) * .4; lx = e.clientX; lt = now; });
          c.box.addEventListener('pointerup', () => { if (!drag) return; drag = false; x = rubber(x); if (performance.now() - lt > 80) v = 0; });
          return VD.loop(c.box, (dt) => { if (!drag){ if (x < 0 || x > maxX){ const b = x < 0 ? 0 : maxX; v += (-170 * (x - b) - 26 * v) * dt; x += v * dt; if (Math.abs(x - b) < .3 && Math.abs(v) < 5){ x = b; v = 0; } } else { x += v * dt; v *= Math.exp(-3.2 * dt); if (Math.abs(v) < 2) v = 0; } }
            const off = drag ? rubber(x) : x, y = c.h / 2 - 45; g.clearRect(0, 0, c.w, c.h);
            for (let i = 0; i < N; i++){ const cx = 12 + i * (CW + GAP) - off; if (cx > c.w || cx + CW < 0) continue; g.fillStyle = `hsl(${80 + i * 24} 65% 45%)`; g.beginPath(); g.roundRect(cx, y, CW, 90, 12); g.fill(); g.fillStyle = '#fff'; g.font = '800 20px monospace'; g.textAlign = 'center'; g.fillText(i + 1, cx + CW / 2, y + 52); g.textAlign = 'left'; }
            g.fillStyle = c.bd; g.fillRect(12, c.h - 14, c.w - 24, 4); g.fillStyle = c.acc; g.fillRect(12 + clamp(off / (maxX || 1), 0, 1) * (c.w - 24 - 40), c.h - 16, 40, 8);
            if (fr++ % 6 === 0) $(el, '.out').innerHTML = `速さ：<b>${Math.round(Math.abs(v))}</b> px/秒　位置：<b>${Math.round(off)}</b> / ${Math.round(maxX)}px${off < -.5 || off > maxX + .5 ? '　<b>← 端を越えている</b>' : ''}\n離したあと：v ×＝ exp(−3.2 × dt)（だんだん減速）\n端を越えたら：表示 = (1 − 1 ÷ (越えた量 × 0.55 ÷ 幅 + 1)) × 幅、離すとばねで戻る`; }); },
        desc:'スマホのスクロールのように「投げると流れ、だんだん止まり、端では<b>ゴムのように伸びて戻る</b>」動きは、3つの計算の組み合わせです。①離す直前の指の<b>速さ</b>を測る ②速さに <code>exp(−k × dt)</code> を掛けて減速 ③端を越えたら<b>越えた量を縮めて表示</b>し、離したらばねで戻す。',
        prompt:'横スクロールのカルーセルを、指で投げると慣性で流れ、端では引っぱるほど重くなるラバーバンド、離すとばねで戻る動きにして。速さは直近 100ms のポインターの移動から計算し、最後はいちばん近いカードの位置にスナップさせて。' },
      { name:'角度は近い方へ回す', en:'Shortest rotation', h:430, tags:['体験','よくある失敗'],
        demo:'<div class="kt"><span class="sw"></span><div class="mm-dial"><i></i><span style="left:50%;top:-10px">0°</span><span style="left:calc(100% + 16px);top:50%">90°</span><span style="left:50%;top:calc(100% + 10px)">180°</span><span style="left:-18px;top:50%">270°</span></div><div class="kt-row c tg"></div><div class="mm-f out">今 350°。「10°へ」を押して、2つのモードを比べてみましょう</div></div>',
        init:(el) => { let k = 1, cur = 350, from = 350, to = 350, t = 1; const needle = $(el, '.mm-dial i'), shortest = (a, b) => ((b - a) % 360 + 540) % 360 - 180;
          $(el, '.tg').innerHTML = [10, 90, 200, 340].map(a => `<button type="button" class="kt-btn sm" data-a="${a}">${a}°へ</button>`).join('');
          $$(el, '.tg button').forEach(bt => bt.onclick = () => { const a = +bt.dataset.a, n = ((cur % 360) + 360) % 360; from = k ? cur : n; to = k ? cur + shortest(cur, a) : a; t = 0; const dl = Math.round(to - from);
            $(el, '.out').innerHTML = `${Math.round(n)}° → ${a}°：` + (k ? `差を −180〜180° に直す\n((${a} − ${Math.round(n)}) mod 360 ＋ 540) mod 360 − 180 = <b>${dl}°</b>` : `そのまま引き算\n${a} − ${Math.round(n)} = <b>${dl}°</b>（${Math.abs(dl) > 180 ? '<b>遠回り！</b>' : 'たまたま近い方'}）`); });
          $(el, '.sw').replaceWith(seg(['そのまま補間', '近い方へ回す'], i => { k = i; }, 1).el);
          return VD.loop(needle, (dt) => { if (t < 1){ t = Math.min(1, t + dt / .9); cur = from + (to - from) * EASE.easeInOutCubic(t); } needle.style.transform = `rotate(${cur}deg)`; }); },
        desc:'角度を 350° から 10° へアニメーションするとき、そのまま補間すると<b>340° も逆回り</b>してしまいます。差を <code>((目標 − 今) mod 360 + 540) mod 360 − 180</code> で −180°〜180° に直すと、<b>近い方へ 20° だけ</b>回ります。キャラの向き・コンパス・時計の針・色相の補間で必ず必要になる計算です。',
        prompt:'コンパスの針が、方角のデータが変わるたびになめらかに回転するようにして。359° → 1° のときに逆回りしないよう、角度の差を −180〜180° に直してから補間して。transform の角度は 0〜360 に戻さず累積させて。',
        code:'// 差を −180〜180 に直す（JavaScript の % は負の数だと負を返すので工夫する）\nconst shortest = (from, to) => ((to - from) % 360 + 540) % 360 - 180;\nangle += shortest(angle, target) * k;   // k は 1 − Math.exp(−速さ × dt)\n\n// 正の余り（配列のループや角度の正規化に）\nconst mod = (n, m) => ((n % m) + m) % m;  // mod(-1, 360) → 359' },
      { name:'スナップと吸い付き', en:'Snapping & magnet', h:430, tags:['体験','UI'],
        demo:'<div class="kt"><span class="sw"></span><div class="mm-cv"><span class="tip">四角をドラッグ</span></div><div class="mm-f out"></div></div>',
        init:(el) => { let k = 1; const c = cv(el), g = c.ctx, G = 40, P = [[c.w * .5, c.h * .5]], SL = [[c.w * .22, c.h * .3], [c.w * .74, c.h * .3], [c.w * .5, c.h * .76]];
          const near = () => { let best = null, bd = 50; SL.forEach(s => { const d = Math.hypot(s[0] - P[0][0], s[1] - P[0][1]); if (d < bd){ bd = d; best = s; } }); return [best, bd]; };
          const shown = () => { const [x, y] = P[0]; if (k === 1) return [Math.round(x / G) * G, Math.round(y / G) * G]; if (k === 2){ const [s, d] = near(); if (s){ const pull = Math.min(1, (1 - d / 50) * 1.6); return [x + (s[0] - x) * pull, y + (s[1] - y) * pull]; } } return [x, y]; };
          const draw = () => { g.clearRect(0, 0, c.w, c.h); if (k === 1){ g.fillStyle = c.bd; for (let x = 0; x <= c.w; x += G) for (let y = 0; y <= c.h; y += G) g.fillRect(x - 1.5, y - 1.5, 3, 3); }
            if (k === 2) SL.forEach(s => { g.strokeStyle = c.bd; g.setLineDash([4, 4]); g.beginPath(); g.arc(s[0], s[1], 50, 0, 7); g.stroke(); g.setLineDash([]); g.strokeStyle = c.mut; g.strokeRect(s[0] - 18, s[1] - 18, 36, 36); });
            const [sx, sy] = shown(), [x, y] = P[0]; if (k && (sx !== x || sy !== y)){ g.globalAlpha = .35; dot(g, x, y, 9, c.mut); g.globalAlpha = 1; g.strokeStyle = c.mut; g.setLineDash([2, 3]); g.beginPath(); g.moveTo(x, y); g.lineTo(sx, sy); g.stroke(); g.setLineDash([]); }
            g.fillStyle = c.acc; g.fillRect(sx - 16, sy - 16, 32, 32);
            $(el, '.out').innerHTML = [`位置 = 指の位置そのまま (${Math.round(x)}, ${Math.round(y)})`, `位置 = Math.round(指 ÷ ${G}) × ${G} → (<b>${sx}</b>, <b>${sy}</b>)`, '50px 以内に枠があれば、近いほど強く引き寄せる（離すと枠にはまる）\n引き寄せ = 1 − 距離 ÷ 50 → 位置 = lerp(指, 枠, 引き寄せ)'][k]; };
          dragPts(c.box, P, draw, 40); c.box._pts.push(SL); c.redraw = draw;
          c.box.addEventListener('pointerup', () => { if (k === 1){ const s = shown(); P[0][0] = s[0]; P[0][1] = s[1]; } if (k === 2){ const [s] = near(); if (s){ P[0][0] = s[0]; P[0][1] = s[1]; } } draw(); });
          $(el, '.sw').replaceWith(seg(['自由', 'マス目にスナップ', '近くで吸い付く'], i => { k = i; draw(); }, 1).el); },
        desc:'位置を<b>マス目に合わせる</b>のは <code>Math.round(値 ÷ 間隔) × 間隔</code> の1行。<b>吸い付き（磁石）</b>は、目標に近いほど強く引き寄せ、離したら中に収めます。ドラッグ＆ドロップ、デザインツールのガイド、スライダーの目盛り、カルーセルの止まる位置（scroll-snap）など、あちこちで使われます。',
        prompt:'ドラッグで付箋を動かせるボードに、8px のグリッドへのスナップと、他の付箋の端に近づいたら吸い付くガイド線を付けて。Shift を押している間はスナップしないように。' },
      { name:'ばらつきのきれいなランダム配置', en:'Random, jittered & Poisson-disc', h:450, tags:['体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="mm-cv"></div><div class="kt-row"><button type="button" class="kt-btn sm re">↻ もう一度</button><span class="mm-f out" style="flex:1"></span></div></div>',
        init:(el) => { let k = 2; const c = cv(el), g = c.ctx, r = Math.max(18, Math.round(Math.min(c.w, c.h) / 9));
          // ポアソンディスク（Bridson のアルゴリズム）：どの2点も r 以上離れる
          const poisson = () => { const cell = r / Math.SQRT2, cols = Math.ceil(c.w / cell), rows = Math.ceil(c.h / cell), grid = new Array(cols * rows).fill(null), pts = [], act = [];
            const add = (p) => { pts.push(p); act.push(p); grid[Math.floor(p[0] / cell) + Math.floor(p[1] / cell) * cols] = p; }; add([c.w * Math.random(), c.h * Math.random()]);
            while (act.length){ const i = Math.floor(Math.random() * act.length), a = act[i]; let ok = false;
              for (let n = 0; n < 30 && !ok; n++){ const an = Math.random() * Math.PI * 2, d = r * (1 + Math.random()), p = [a[0] + Math.cos(an) * d, a[1] + Math.sin(an) * d]; if (p[0] < 0 || p[1] < 0 || p[0] >= c.w || p[1] >= c.h) continue;
                const gx = Math.floor(p[0] / cell), gy = Math.floor(p[1] / cell); let far = true; for (let y = Math.max(0, gy - 2); y <= Math.min(rows - 1, gy + 2) && far; y++) for (let x = Math.max(0, gx - 2); x <= Math.min(cols - 1, gx + 2); x++){ const q = grid[x + y * cols]; if (q && Math.hypot(q[0] - p[0], q[1] - p[1]) < r){ far = false; break; } }
                if (far){ add(p); ok = true; } }
              if (!ok) act.splice(i, 1); }
            return pts; };
          const make = () => { let pts = poisson(); const n = pts.length;
            if (k === 0) pts = Array.from({ length:n }, () => [Math.random() * c.w, Math.random() * c.h]);
            if (k === 1){ const cs = Math.sqrt(c.w * c.h / n), cols = Math.max(1, Math.round(c.w / cs)), rows = Math.max(1, Math.round(c.h / cs)), cw = c.w / cols, ch = c.h / rows; pts = []; for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) pts.push([(x + .1 + Math.random() * .8) * cw, (y + .1 + Math.random() * .8) * ch]); }
            let mn = Infinity, bad = 0; const near = pts.map((p, i) => { let m = Infinity; pts.forEach((q, j) => { if (i !== j) m = Math.min(m, Math.hypot(p[0] - q[0], p[1] - q[1])); }); mn = Math.min(mn, m); if (m < r * .5) bad++; return m; });
            g.clearRect(0, 0, c.w, c.h); pts.forEach((p, i) => { g.strokeStyle = c.bd; g.lineWidth = 1; g.beginPath(); g.arc(p[0], p[1], r / 2, 0, 7); g.stroke(); dot(g, p[0], p[1], Math.max(3, r * .18), near[i] < r * .5 ? c.bad : c.acc); });
            $(el, '.out').innerHTML = `点 <b>${pts.length}</b>個・一番近い2点の距離 <b>${Math.round(mn)}</b>px・近すぎる点（赤）<b>${bad}</b>個`; };
          $(el, '.re').onclick = make; c.redraw = make; $(el, '.sw').replaceWith(seg(['Math.random()', 'ジッター格子', 'ポアソンディスク'], i => { k = i; make(); }, 2).el); },
        desc:'木や星やアイコンを散らすとき、<code>Math.random()</code> だけだと<b>かたまりとすき間</b>ができて不自然です。マス目ごとに1つずつずらして置く<b>ジッター格子</b>はかんたんで均等、<b>ポアソンディスク</b>は「どの2点も一定距離以上離れる」配置で、いちばん自然に見えます（赤 = 近すぎる点、薄い円 = 半径の半分）。',
        prompt:'背景に星を散りばめたい。Math.random() だと偏るので、ポアソンディスクサンプリング（Bridson のアルゴリズム、最小距離 40px）で配置する関数を TypeScript で書いて。シード付きの乱数で、毎回同じ配置にもできるように。' },
    ], null, true),
    { title:'コピーして使える計算の早見表', note:'この辞典で出てきた式を1か所にまとめました。<code>t</code> は 0〜1、<code>dt</code> は前のフレームからの秒数です。',
      table:{ head:['やりたいこと', '式（JavaScript）'], rows:[
        ['2つの値の間を取る', CODE('a + (b - a) * t')],
        ['範囲に収める', CODE('Math.min(max, Math.max(min, v))')],
        ['範囲を変換する（map）', CODE('c + (d - c) * ((v - a) / (b - a))')],
        ['2点の距離', CODE('Math.hypot(x2 - x1, y2 - y1)')],
        ['2点の向き（角度）', CODE('Math.atan2(y2 - y1, x2 - x1)')],
        ['度 → ラジアン', CODE('deg * Math.PI / 180')],
        ['角度 → 向きのベクトル', CODE('[Math.cos(a), Math.sin(a)]')],
        ['円周上の点', CODE('[cx + Math.cos(a) * r, cy + Math.sin(a) * r]')],
        ['角度の差（近い方）', CODE('((b - a) % 360 + 540) % 360 - 180')],
        ['正の余り（ループ）', CODE('((n % m) + m) % m')],
        ['目盛りに丸める', CODE('Math.round(v / step) * step')],
        ['範囲の乱数', CODE('min + Math.random() * (max - min)')],
        ['0〜n−1 の整数の乱数', CODE('Math.floor(Math.random() * n)')],
        ['フレームに依存しない追従', CODE('v += (target - v) * (1 - Math.exp(-k * dt))')],
        ['ふわふわ揺れる', CODE('amp * Math.sin(2 * Math.PI * freq * time)')],
        ['なめらかな 0〜1', CODE('t * t * (3 - 2 * t)')],
        ['重力', CODE('vy += g * dt; y += vy * dt')],
        ['ばね', CODE('v += (-k * (x - target) - c * v) / m * dt; x += v * dt')],
      ] } },
    { title:'道具の選び方', note:'計算を自分で書く前に、まず使える道具を確認しましょう。',
      table:{ head:['道具', '得意なこと'], rows:[['CSS transition / @keyframes', '決まった動き・ホバー。まずはこれで足りないか考える'], ['Web Animations API', 'JavaScript から CSS と同じ性能で動かす。FLIP にも'], ['Motion（旧 Framer Motion）', 'React のばね・レイアウトアニメーション・ドラッグ'], ['GSAP', '複雑なタイムライン、スクロール演出（ScrollTrigger）'], ['react-spring', 'ばね中心の React アニメーション'], ['Matter.js', '2D の物理エンジン（積み木・ぶつかり・振り子）'], ['Rapier', '2D/3D の高速な物理エンジン（WebAssembly）'], ['simplex-noise', 'ノイズ（自然な揺れ・地形・背景）'], ['bezier-easing', 'CSS と同じ cubic-bezier を JavaScript で使う'], ['p5.js', 'クリエイティブコーディングで計算を試す']] } },
    S('UIで使う計算の用語', [
      T('requestAnimationFrame', 'requestAnimationFrame', '画面の書き換えに合わせて関数を呼ぶ。JavaScript のアニメーションの土台。', null, ['基本']),
      T('スクロール連動', 'Scroll-linked animation', 'スクロール量に合わせて見た目を変える演出。'),
      T('scroll-driven animations', 'animation-timeline', 'CSS だけでスクロール連動のアニメーションを書ける機能（scroll()・view()）。'),
      T('IntersectionObserver', 'IntersectionObserver', '要素が画面に入った・出たを知らせてくれる API。'),
      T('FLIP', 'First, Last, Invert, Play', '前後の位置の差を transform で埋めて、レイアウトの変化をなめらかに見せる技。'),
      T('Web Animations API', 'element.animate()', 'JavaScript から CSS アニメーションと同じしくみで動かせる API。'),
      T('View Transitions API', 'View Transitions', '画面の切り替え前後をブラウザが撮って、自動でつなぐアニメーション。'),
      T('慣性スクロール', 'Momentum scrolling', '指を離した後も速さを引き継いで流れ、だんだん止まるスクロール。'),
      T('ラバーバンド', 'Rubber banding', '端を越えて引っぱると重くなり、離すと戻る動き。'),
      T('スナップ', 'Snapping', '決まった位置（マス目・カード）に合わせて止める。CSS なら scroll-snap。'),
      T('最短回転', 'Shortest-path rotation', '角度の差を −180〜180° に直して、近い方へ回すこと。', null, ['よくある失敗']),
      T('ポアソンディスク', 'Poisson-disc sampling', 'どの2点も一定距離以上離れた、自然なランダム配置。'),
      T('prefers-reduced-motion', 'prefers-reduced-motion', '動きを減らしたい人の設定。大きな動き・揺れ・視差は控える。', null, ['アクセシビリティ']),
    ]),
  ]});
})();
