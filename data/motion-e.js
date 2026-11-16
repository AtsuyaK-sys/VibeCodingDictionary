/* モーション・インタラクション辞典 — E: 遊び心・JavaScriptで動くもの */
(function(){
const { $, $$, clamp, retrigger, confettiLayer } = window.MO;
const R = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const rep = (n, f) => Array.from({ length:n }, (_, i) => f(i)).join('');
const wait = (ms) => new Promise(r => setTimeout(r, ms));
// イベント登録して「解除する関数」を返す
const listen = (t, ty, f, o) => { t.addEventListener(ty, f, o); return () => t.removeEventListener(ty, f, o); };
const local = (el, e) => { const r = el.getBoundingClientRect(); return { x:e.clientX - r.left, y:e.clientY - r.top }; };
// ステージ全面に重ねるCanvas（drag=true でタッチのスクロールを止める）
function cv(host, drag){ const o = VD.canvas(host); o.c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block' + (drag ? ';touch-action:none' : ''); return o; }
function star(ctx, s){ ctx.beginPath(); ctx.moveTo(0, -s); ctx.quadraticCurveTo(0, 0, s, 0); ctx.quadraticCurveTo(0, 0, 0, s); ctx.quadraticCurveTo(0, 0, -s, 0); ctx.quadraticCurveTo(0, 0, 0, -s); ctx.fill(); }
// 「カチッ」という小さな効果音（ユーザー操作の中でだけ鳴らす）
let AC = null;
function click(freq = 1800){ try{ AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const o = AC.createOscillator(), g = AC.createGain(); o.type = 'square'; o.frequency.value = freq; g.gain.setValueAtTime(.08, AC.currentTime); g.gain.exponentialRampToValueAtTime(.0001, AC.currentTime + .05); o.connect(g).connect(AC.destination); o.start(); o.stop(AC.currentTime + .06); }catch(e){} }

const PIPS = { 1:[4], 2:[0, 8], 3:[0, 4, 8], 4:[0, 2, 6, 8], 5:[0, 2, 4, 6, 8], 6:[0, 2, 3, 5, 6, 8] };
const DIE = '<div class="pl-die">' + [1, 2, 3, 4, 5, 6].map(v => `<div class="f${v === 1 ? ' one' : ''}">${rep(9, k => `<b${PIPS[v].includes(k) ? '' : ' style="visibility:hidden"'}></b>`)}</div>`).join('') + '</div>';
const FACE = { 1:[0, 0], 2:[0, -90], 3:[-90, 0], 4:[90, 0], 5:[0, 90], 6:[0, 180] };
const SLOT = ['🍒', '🍋', '🔔', '⭐', '🍇', '💎'];
const KONAMI = ['↑', '↑', '↓', '↓', '←', '→', '←', '→', 'B', 'A'];

TABS.push({
  id:'play-js', label:'遊び心・JS', icon:'🎮',
  intro:'カーソルについてくる・逃げる、つかんで投げる、くじを引く、隠しコマンド……。<b>JavaScriptで「触ると反応が返ってくる」</b>遊び心のある見本です。物理演算（バネ・重力・摩擦）はどれも数行の計算で作れます。サービスの隠し要素、404ページ、キャンペーン、ゲーム的な演出のアイデア帳として使ってください。',
  sections:[
    { title:'カーソルについてくる・逃げる', note:'カーソルの位置を毎フレーム読んで、少し遅れて追いかける（なめらかに近づける）と生き物らしく見えます。', items:[
      { name:'カーソルを見つめる目', en:'Googly eyes follow cursor', h:190, tags:['定番','カーソル'],
        demo:'<div class="pl pl-eyesbg"><div class="pl-faces">' + ['#fb923c', '#a78bfa', '#34d399'].map(c => `<div class="pl-f" style="--c:${c}"><i class="eye l"><i></i></i><i class="eye r"><i></i></i><i class="mo"></i></div>`).join('') + '</div><span class="pl-hint">ページのどこでもカーソルを動かしてみて</span></div>',
        init:(el) => { const pupils = $$(el, '.eye i'), faces = $$(el, '.pl-f');
          const off = listen(window, 'pointermove', (e) => { pupils.forEach(p => { const r = p.parentNode.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), a = Math.atan2(dy, dx), d = Math.min(7, Math.hypot(dx, dy) / 12); p.style.transform = `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d}px)`; }); });
          const iv = setInterval(() => { const f = pick(faces); f.classList.add('blink'); setTimeout(() => f.classList.remove('blink'), 140); }, 900);
          return () => { off(); clearInterval(iv); }; },
        desc:'黒目が<b>カーソルの方向へ</b>動き、ときどきランダムにまばたきする。カーソルとの角度を <code>Math.atan2</code> で求め、白目からはみ出さない距離だけずらす。ログイン画面で「パスワード入力中は目をふさぐ」アレンジも人気。',
        prompt:'3つの丸いキャラクターの黒目が、マウスカーソルの方向を見つめるようにして。目の中心からカーソルへの角度を Math.atan2 で計算し、黒目を最大7pxまでその方向へずらし、ときどきランダムに1体がまばたきするようにして。',
        code:'window.addEventListener("pointermove", (e) => {\n  const r = eye.getBoundingClientRect();\n  const a = Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2));\n  pupil.style.transform = `translate(${Math.cos(a) * 7}px, ${Math.sin(a) * 7}px)`;\n});' },
      { name:'ついてくるひよこ', en:'Cursor-following pet', h:200, tags:['キャラ','追従'],
        demo:'<div class="pl" style="cursor:crosshair"><div class="pl-chick"><i class="ft"></i><i class="bd"></i><i class="wing"></i></div><span class="pl-hint">ステージの中でカーソルを動かす</span></div>',
        init:(el) => { const host = $(el, '.pl'), ck = $(el, '.pl-chick'); let x = host.clientWidth / 2, y = host.clientHeight / 2, tx = x, ty = y, dir = 1, walking = false, last = 0;
          const off = listen(host, 'pointermove', (e) => { const p = local(host, e); tx = p.x; ty = clamp(p.y, 30, host.clientHeight - 30); last = performance.now(); });
          const stop = VD.loop(el, (dt) => {
            if (performance.now() - last > 3500 && !walking && Math.random() < .01){ tx = R(40, host.clientWidth - 40); ty = R(40, host.clientHeight - 40); }
            const dx = tx - x, dy = ty - y, d = Math.hypot(dx, dy);
            if (d > 32) walking = true; else if (d < 22) walking = false;
            if (walking){ const sp = Math.min(d - 20, 170 * dt); x += dx / d * sp; y += dy / d * sp; if (Math.abs(dx) > 3) dir = dx < 0 ? -1 : 1; }
            ck.className = 'pl-chick ' + (walking ? 'walk' : 'peck');
            ck.style.transform = `translate(${x}px, ${y}px) scaleX(${dir})`; });
          return () => { off(); stop(); }; },
        desc:'カーソルへ向かって<b>一定の速さでとことこ歩き</b>、追いつくとその場でエサをつつく。歩く／止まるの境目に少し幅（ヒステリシス）を持たせると、ガタガタ切り替わらない。放っておくと勝手に散歩する。',
        prompt:'カーソルを追いかけて歩くひよこを作って。毎フレーム、カーソルとの距離が32pxより遠ければ秒速170pxで近づき（歩きアニメ）、22px以内に入ったら止まって地面をつつくアニメにして。向きは進行方向に合わせて scaleX(-1) で反転、3.5秒操作がなければランダムな場所へ散歩させて。' },
      { name:'キラキラの軌跡', en:'Sparkle cursor trail', h:200, tags:['Canvas','カーソル'],
        demo:'<div class="pl pl-dark"><span class="pl-hint">カーソルを動かす（放っておくと自動で描く）</span></div>',
        init:(el) => { const host = $(el, '.pl'), { ctx, w, h } = cv(host); const ps = []; let hue = 0, lx = null, ly = null, last = 0, auto = 0;
          const add = (x, y, n) => { for (let i = 0; i < n && ps.length < 400; i++) ps.push({ x, y, vx:R(-40, 40), vy:R(-60, 20), s:R(3, 8), life:1, h:(hue += 3) % 360, r:R(0, 3) }); };
          const o1 = listen(host, 'pointermove', (e) => { const p = local(host, e); if (lx != null) add(p.x, p.y, Math.min(4, 1 + Math.hypot(p.x - lx, p.y - ly) / 12 | 0)); lx = p.x; ly = p.y; last = performance.now(); });
          const o2 = listen(host, 'pointerleave', () => { lx = ly = null; });
          const stop = VD.loop(el, (dt, t) => {
            if (performance.now() - last > 1500){ auto += dt; add(w / 2 + Math.sin(auto * 1.6) * w * .32, h / 2 + Math.sin(auto * 3.2) * h * .28, 2); }
            ctx.clearRect(0, 0, w, h);
            for (let i = ps.length - 1; i >= 0; i--){ const p = ps[i]; p.life -= dt * 1.1; if (p.life <= 0){ ps.splice(i, 1); continue; }
              p.vy += 60 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += dt * 3;
              ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.globalAlpha = p.life; ctx.fillStyle = `hsl(${p.h} 100% 72%)`; star(ctx, p.s * p.life * (.7 + .3 * Math.sin(t * 20 + p.r * 5))); ctx.restore(); }
          });
          return () => { o1(); o2(); stop(); }; },
        desc:'カーソルの通り道に<b>虹色の星</b>がこぼれ、ふわっと落ちながら瞬いて消える。速く動かすほどたくさん出る。2000年代の個人サイトで流行った演出が、Canvasでなめらかに復活。',
        prompt:'Canvasでマウスカーソルの軌跡に虹色の4つ角の星をこぼすエフェクトを作って。移動距離に応じて1〜4個ずつ生成し、色相を少しずつずらし、ゆっくり落ちながら回転・明滅して1秒で消えるようにして。粒子は最大400個まで。' },
      { name:'逃げる文字', en:'Repelling letters', h:170, tags:['文字','バネ'],
        demo:'<div class="pl"><div class="pl-flee">' + [...'さわれないよ〜'].map(c => `<span>${c}</span>`).join('') + '</div><span class="pl-hint">文字にカーソルを近づけて</span></div>',
        init:(el) => { const host = $(el, '.pl'), sp = $$(el, '.pl-flee span'), st = sp.map(() => ({ x:0, y:0, vx:0, vy:0, hx:0, hy:0 })); let px = -1e4, py = -1e4, homeW = 0;
          const home = () => { const r0 = host.getBoundingClientRect(); sp.forEach((s, i) => { const r = s.getBoundingClientRect(); st[i].hx = r.left + r.width / 2 - r0.left - st[i].x; st[i].hy = r.top + r.height / 2 - r0.top - st[i].y; }); homeW = host.clientWidth; };
          const o1 = listen(host, 'pointermove', (e) => { const p = local(host, e); px = p.x; py = p.y; }), o2 = listen(host, 'pointerleave', () => { px = py = -1e4; });
          const stop = VD.loop(el, (dt) => { if (homeW !== host.clientWidth) home();
            st.forEach((s, i) => { const dx = s.hx + s.x - px, dy = s.hy + s.y - py, d = Math.hypot(dx, dy) || 1;
              if (d < 80){ const f = (80 - d) * 60; s.vx += dx / d * f * dt; s.vy += dy / d * f * dt; }
              s.vx += -s.x * 90 * dt; s.vy += -s.y * 90 * dt; s.vx *= Math.exp(-7 * dt); s.vy *= Math.exp(-7 * dt); s.x += s.vx * dt; s.y += s.vy * dt;
              sp[i].style.transform = `translate(${s.x}px, ${s.y}px) rotate(${clamp(s.vx * .15, -40, 40)}deg)`; }); });
          return () => { o1(); o2(); stop(); }; },
        desc:'1文字ずつが<b>カーソルから押しのけられ</b>、離れるとバネで元の位置に戻る。動いた速さに合わせて文字が傾く。「反発する力」と「元に戻るバネ」と「減衰」の3つを足すだけ。',
        prompt:'見出しの文字を1文字ずつspanに分け、カーソルが80px以内に近づいたら距離に応じた力で押しのけ、離れたらバネのように元の位置へ戻るようにして（毎フレーム、反発力・元に戻る力・減衰を速度に足す）。横の速さに比例して文字を最大40度傾けて。',
        code:'// 毎フレーム（dt = 経過秒）\nif (d < 80) { s.vx += dx / d * (80 - d) * 60 * dt; }\ns.vx += -s.x * 90 * dt;          // 元の位置へ戻るバネ\ns.vx *= Math.exp(-7 * dt);       // 減衰\ns.x += s.vx * dt;' },
      { name:'逃げるボタン', en:'Runaway "No" button', h:210, tags:['ネタ','話題'],
        demo:'<div class="pl"><b class="pl-msg">バイブコーディング、楽しい？</b><div class="mo-row"><button class="mo-btn yes">楽しい！</button><span class="ph" style="display:inline-block;width:96px;height:40px"></span></div><button class="mo-btn ghost pl-run no">べつに…</button></div>',
        init:(el) => { const host = $(el, '.pl'), no = $(el, '.no'), yes = $(el, '.yes'), ph = $(el, '.ph'), msg = $(el, '.pl-msg'), L = confettiLayer(el); let n = 0, nx = 0, ny = 0;
          const r0 = host.getBoundingClientRect(), r = ph.getBoundingClientRect(); nx = r.left - r0.left; ny = r.top - r0.top; no.style.transition = 'none'; no.style.transform = `translate(${nx}px, ${ny}px)`; void no.offsetWidth; no.style.transition = '';
          const lines = ['おっと', '逃げるよ〜', 'むだだよ', 'しつこいなあ', '「楽しい！」を押そう？', '……'];
          const flee = (px, py) => { const W = host.clientWidth - no.offsetWidth - 10, H = host.clientHeight - no.offsetHeight - 10; let k = 0;
            do { nx = R(10, W); ny = R(40, H); k++; } while (k < 30 && Math.hypot(nx + no.offsetWidth / 2 - px, ny + no.offsetHeight / 2 - py) < 120);
            no.style.transform = `translate(${nx}px, ${ny}px)`; msg.textContent = lines[Math.min(n++, lines.length - 1)]; };
          const o1 = listen(host, 'pointermove', (e) => { const p = local(host, e); if (Math.abs(p.x - nx - no.offsetWidth / 2) < no.offsetWidth / 2 + 16 && Math.abs(p.y - ny - no.offsetHeight / 2) < no.offsetHeight / 2 + 16) flee(p.x, p.y); });
          no.addEventListener('pointerdown', (e) => { e.preventDefault(); const p = local(host, e); flee(p.x, p.y); });
          no.addEventListener('click', () => { msg.textContent = 'うそだ〜、楽しいでしょ？'; });
          yes.onclick = () => { msg.textContent = 'でしょ！🎉'; const a = yes.getBoundingClientRect(), rr = el.getBoundingClientRect(); L.burst(a.left + a.width / 2 - rr.left, a.top - rr.top, 70, -90, 90, 600); };
          return () => { o1(); L.stop(); }; },
        desc:'「いいえ」側のボタンが<b>カーソルが近づくとピョンと逃げる</b>。逃げるたびにセリフが変わる。告白メーカーやエイプリルフール企画でSNSによく流れてくるネタ。逃げ先はカーソルから一定以上離れた場所をランダムに選ぶ。',
        prompt:'「楽しい！」と「べつに…」の2つのボタンを作り、「べつに…」ボタンはカーソルが16px以内に近づくと、カーソルから120px以上離れたランダムな位置へバネのような動き（transition 0.28秒）で逃げるようにして。逃げるたびに上のセリフを「おっと」「逃げるよ〜」…と変え、「楽しい！」を押したら紙吹雪を出して。タッチでも押せないように pointerdown で逃がして。' },
      { name:'カーソルを追う魚の群れ', en:'Boids flocking', h:220, tags:['群れ','Canvas'],
        demo:'<div class="pl" style="background:radial-gradient(circle at 50% 35%, #0e7490, #082f49)"><span class="pl-hint" style="color:#a5f3fc">カーソルについてくる／クリックで散る</span></div>',
        init:(el) => { const host = $(el, '.pl'), { ctx, w, h } = cv(host); let px = null, py = null, scare = 0;
          const F = Array.from({ length:34 }, () => ({ x:R(0, w), y:R(0, h), vx:R(-60, 60), vy:R(-60, 60), ph:R(0, 6), c:Math.random() < .2 ? '#f8fafc' : pick(['#fb923c', '#f97316', '#fdba74']) }));
          const o1 = listen(host, 'pointermove', (e) => { const p = local(host, e); px = p.x; py = p.y; }), o2 = listen(host, 'pointerleave', () => { px = null; }), o3 = listen(host, 'pointerdown', (e) => { const p = local(host, e); px = p.x; py = p.y; scare = 1; });
          const stop = VD.loop(el, (dt, t) => { scare = Math.max(0, scare - dt);
            for (const f of F){ let ax = 0, ay = 0, cx = 0, cy = 0, avx = 0, avy = 0, n = 0;
              for (const g of F){ if (g === f) continue; const dx = g.x - f.x, dy = g.y - f.y, d = Math.hypot(dx, dy) || 1;
                if (d < 60){ n++; cx += g.x; cy += g.y; avx += g.vx; avy += g.vy; if (d < 18){ ax -= dx / d * 140; ay -= dy / d * 140; } } }
              if (n){ ax += (cx / n - f.x) * .8 + (avx / n - f.vx) * 1.2; ay += (cy / n - f.y) * .8 + (avy / n - f.vy) * 1.2; }
              if (px != null){ const dx = px - f.x, dy = py - f.y, d = Math.hypot(dx, dy) || 1; if (scare > 0 && d < 150){ ax -= dx / d * 1200; ay -= dy / d * 1200; } else { ax += dx / d * 90; ay += dy / d * 90; } }
              else { ax += (w / 2 - f.x) * .12; ay += (h / 2 - f.y) * .12; }
              if (f.x < 20) ax += 200; if (f.x > w - 20) ax -= 200; if (f.y < 20) ay += 200; if (f.y > h - 20) ay -= 200;
              f.vx += ax * dt; f.vy += ay * dt; const sp = Math.hypot(f.vx, f.vy) || 1, mx = scare > 0 ? 280 : 140, mn = 40;
              if (sp > mx){ f.vx *= mx / sp; f.vy *= mx / sp; } else if (sp < mn){ f.vx *= mn / sp; f.vy *= mn / sp; }
              f.x += f.vx * dt; f.y += f.vy * dt; }
            ctx.clearRect(0, 0, w, h);
            for (const f of F){ ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(Math.atan2(f.vy, f.vx)); ctx.fillStyle = f.c;
              const wag = Math.sin(t * 14 + f.ph) * 3;
              ctx.beginPath(); ctx.ellipse(0, 0, 9, 4.5, 0, 0, 7); ctx.fill();
              ctx.beginPath(); ctx.moveTo(-7, 0); ctx.lineTo(-15, -5 + wag); ctx.lineTo(-15, 5 + wag); ctx.closePath(); ctx.fill(); ctx.restore(); }
          });
          return () => { o1(); o2(); o3(); stop(); }; },
        desc:'「近すぎたら離れる・まわりと向きをそろえる・群れの中心に寄る」の<b>3つのルール（ボイド）</b>だけで、本物の魚の群れのように泳ぐ。カーソルを目指して泳ぎ、クリックするとパッと散る。',
        prompt:'Canvasで34匹の魚が群れで泳ぐボイド（Boids）アニメーションを作って。各魚は、近すぎる仲間から離れる・近くの仲間と速度をそろえる・近くの仲間の中心へ寄る、の3つのルールに加えて、マウスカーソルに向かって泳ぎ、クリックした地点からは逃げるようにして。速さは秒速40〜140pxに制限し、尾びれを左右に振って描いて。' },
      { name:'カーソルでなびく草むら', en:'Interactive grass', h:200, tags:['Canvas','自然'],
        demo:'<div class="pl" style="background:linear-gradient(#bae6fd, #f0f9ff 70%)"><span class="pl-hint" style="top:10px;bottom:auto">草の上でカーソルを動かす</span></div>',
        init:(el) => { const host = $(el, '.pl'), { ctx, w, h } = cv(host); let px = null, py = null;
          const B = Array.from({ length:Math.floor(w / 3.5) }, (_, i) => ({ x:i * 3.5 + R(-2, 2), len:R(h * .32, h * .62), a:0, v:0, c:`hsl(${R(95, 135) | 0} ${R(45, 70) | 0}% ${R(30, 46) | 0}%)`, fl:Math.random() < .07 ? pick(['#f472b6', '#fde047', '#fff', '#c084fc']) : null }));
          const o1 = listen(host, 'pointermove', (e) => { const p = local(host, e); px = p.x; py = p.y; }), o2 = listen(host, 'pointerleave', () => { px = null; });
          const stop = VD.loop(el, (dt, t) => { ctx.clearRect(0, 0, w, h);
            for (const b of B){ let tg = Math.sin(t * 1.3 + b.x * .02) * .12 + Math.sin(t * 2.7 + b.x * .05) * .04;
              if (px != null && py > h - b.len - 20){ const dx = b.x - px; if (Math.abs(dx) < 50) tg += Math.sign(dx || 1) * (50 - Math.abs(dx)) / 50 * .9; }
              b.v += (tg - b.a) * 40 * dt; b.v *= Math.exp(-4 * dt); b.a += b.v * dt;
              const tx = b.x + Math.sin(b.a) * b.len, ty = h - Math.cos(b.a) * b.len, cx = b.x + Math.sin(b.a) * b.len * .35, cy = h - b.len * .55;
              ctx.fillStyle = b.c; ctx.beginPath(); ctx.moveTo(b.x - 2, h); ctx.quadraticCurveTo(cx, cy, tx, ty); ctx.quadraticCurveTo(cx, cy, b.x + 2, h); ctx.fill();
              if (b.fl){ ctx.fillStyle = b.fl; ctx.beginPath(); ctx.arc(tx, ty, 4, 0, 7); ctx.fill(); ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(tx, ty, 1.6, 0, 7); ctx.fill(); } }
          });
          return () => { o1(); o2(); stop(); }; },
        desc:'草1本1本が<b>風でゆらぎ</b>、カーソルが通ると左右に押し分けられ、バネでゆっくり戻る。根元を固定して先端の角度だけを計算すれば、数百本でも軽い。',
        prompt:'Canvasで草むらを作って。草は数百本の細い曲線で、根元を固定し先端の角度をバネで動かす。ふだんは2つのsin波を足した風でゆらゆら揺れ、カーソルが近づくと左右に押し分けられてゆっくり戻るようにして。ところどころの草の先に小さな花を咲かせて。' },
    ]},
    { title:'さわって遊ぶ物理', note:'重力・バネ・摩擦は「速度に力を足す → 位置に速度を足す」を毎フレーム繰り返すだけで作れます。', items:[
      { name:'つかんで投げるボール', en:'Drag & throw physics', h:230, tags:['物理','ドラッグ'],
        demo:'<div class="pl"><div class="pl-ball"><i style="position:absolute;inset:0;border-radius:50%;background:linear-gradient(90deg, transparent 44%, rgba(255,255,255,.5) 44% 56%, transparent 56%)"></i></div><span class="pl-hint">ボールをつかんで投げる</span></div>',
        init:(el) => { const host = $(el, '.pl'), ball = $(el, '.pl-ball'), stripe = ball.firstElementChild, r = 27;
          let W = host.clientWidth, H = host.clientHeight, x = W / 2, y = H / 3, vx = 160, vy = 0, rot = 0, sq = 0, axis = 0, drag = false, hist = [];
          ball.addEventListener('pointerdown', (e) => { drag = true; ball.setPointerCapture(e.pointerId); hist = []; ball.style.cursor = 'grabbing'; });
          ball.addEventListener('pointermove', (e) => { if (!drag) return; const p = local(host, e); x = clamp(p.x, r, W - r); y = clamp(p.y, r, H - r); hist.push({ x, y, t:performance.now() }); if (hist.length > 5) hist.shift(); });
          const up = () => { if (!drag) return; drag = false; ball.style.cursor = ''; const a = hist[0], b = hist[hist.length - 1];
            if (a && b && b.t > a.t){ vx = clamp((b.x - a.x) / (b.t - a.t) * 1000, -2600, 2600); vy = clamp((b.y - a.y) / (b.t - a.t) * 1000, -2600, 2600); } else { vx = vy = 0; } };
          ball.addEventListener('pointerup', up); ball.addEventListener('pointercancel', up);
          const stop = VD.loop(el, (dt) => { W = host.clientWidth; H = host.clientHeight;
            if (!drag){ vy += 1500 * dt; x += vx * dt; y += vy * dt;
              if (y > H - r){ y = H - r; if (vy > 250){ sq = Math.min(.35, vy / 3500); axis = 0; } vy = Math.abs(vy) < 90 ? 0 : -vy * .72; vx *= .92; }
              if (y < r){ y = r; vy = -vy * .72; }
              if (x < r || x > W - r){ x = clamp(x, r, W - r); if (Math.abs(vx) > 250){ sq = Math.min(.3, Math.abs(vx) / 3500); axis = 1; } vx = -vx * .75; }
              if (y >= H - r - .5 && vy === 0) vx *= Math.exp(-1.4 * dt);
              rot += vx * dt / r; }
            sq *= Math.exp(-10 * dt);
            const sx = axis ? 1 - sq : 1 + sq, sy = axis ? 1 + sq : 1 - sq;
            ball.style.transform = `translate(${x}px, ${y + (axis ? 0 : r * sq)}px) scale(${sx}, ${sy})`; stripe.style.transform = `rotate(${rot}rad)`; });
          return stop; },
        desc:'ボールをつかんで放すと、<b>手を離す直前の速さ</b>で飛んでいき、重力で落ちて壁と床で跳ね返る。ぶつかった瞬間だけ<b>つぶれて</b>、転がりながら回転する。投げる速さは、直近数フレームの位置の差から計算する。',
        prompt:'ドラッグでつかんで投げられるボールを作って。放す直前の約5フレームの移動量から速度を計算して投げ、重力（1500px/秒²）で落ち、床と壁で0.72倍の反発で跳ね返り、床では摩擦で止まるようにして。強くぶつかった瞬間はぶつかった方向につぶれて元に戻り、転がった距離に合わせて模様が回転するようにして。' },
      { name:'落ちて積もるタグ', en:'Stacking tags (gravity)', h:240, tags:['物理','積み上げ'],
        demo:'<div class="pl"><div class="pl-chips"></div><div class="pl-ctrl"><button class="mo-btn sm add">タグを落とす</button><button class="mo-btn sm ghost boom">ぶっとばす</button></div></div>',
        init:(el) => { const box = $(el, '.pl-chips'); let chips = [];
          const LB = [['CSS', '#2563eb'], ['JavaScript', '#ca8a04'], ['React', '#0891b2'], ['アニメ', '#c026d3'], ['AI', '#7c3aed'], ['デザイン', '#db2777'], ['ゲーム', '#16a34a'], ['API', '#ea580c'], ['バイブコーディング', '#0f766e'], ['Figma', '#e11d48'], ['3D', '#4f46e5'], ['サウンド', '#65a30d']];
          const add = (dy = 0) => { const [t, c] = pick(LB), e = document.createElement('span'); e.className = 'pl-chip'; e.textContent = t; e.style.background = c; box.append(e);
            const ch = { e, w:e.offsetWidth, h:e.offsetHeight, x:0, y:-40 - dy, vx:0, vy:0, rot:R(-30, 30), vr:R(-200, 200), tr:R(-4, 4), land:false }; ch.x = R(0, Math.max(0, box.clientWidth - ch.w));
            e.addEventListener('pointerdown', () => { ch.vy = -R(600, 800); ch.vx = R(-200, 200); ch.vr = R(-500, 500); ch.land = false; });
            chips.push(ch); if (chips.length > 22) chips.shift().e.remove(); };
          for (let i = 0; i < 8; i++) add(i * 50);
          $(el, '.add').onclick = () => add();
          $(el, '.boom').onclick = () => chips.forEach(c => { c.vy = -R(500, 900); c.vx = R(-350, 350); c.vr = R(-600, 600); c.land = false; });
          const stop = VD.loop(el, (dt) => { const W = box.clientWidth, H = box.clientHeight;
            for (const c of [...chips].sort((a, b) => b.y - a.y)){
              c.vy += 1600 * dt; c.x += c.vx * dt; c.vx *= Math.exp(-2 * dt); const pb = c.y + c.h; c.y += c.vy * dt;
              if (c.x < 0){ c.x = 0; c.vx *= -.5; } if (c.x + c.w > W){ c.x = W - c.w; c.vx *= -.5; }
              let g = H; for (const o of chips){ if (o !== c && c.x + 4 < o.x + o.w && c.x + c.w - 4 > o.x && pb <= o.y + 2 && o.y < g) g = o.y; }
              if (c.y + c.h > g){ c.y = g - c.h; if (c.vy > 320) c.vy *= -.25; else { c.vy = 0; c.land = true; } c.vx *= .8; }
              c.rot = c.land ? c.rot + (c.tr - c.rot) * Math.min(1, 12 * dt) : c.rot + c.vr * dt;
              c.e.style.transform = `translate(${c.x}px, ${c.y}px) rotate(${c.rot}deg)`; } });
          return stop; },
        desc:'タグ（チップ）が上から<b>落ちてきて積み重なり</b>、「ぶっとばす」で一斉に跳ね上がってまた降り積もる。タグを押すとそれだけ跳ねる。スキル一覧・タグクラウド・404ページの遊びに。本格的にやるなら物理エンジン（Matter.js）を使う。',
        prompt:'スキルのタグ（丸いチップ）が上から重力で落ちてきて、床や他のタグの上に積み重なるようにして。各タグは落下中は回転し、着地したら少しだけ傾いた角度に落ち着く。「ぶっとばす」ボタンで全部のタグを上にランダムに跳ね飛ばし、タグを押すとそのタグだけが跳ねるようにして（簡易的なAABBの当たり判定で。本格的にするなら Matter.js でもよい）。' },
      { name:'引っぱるひもスイッチ', en:'Pull-cord light switch', h:230, tags:['物理','ダークモード','話題'],
        demo:'<div class="pl"></div>',
        init:(el) => { const host = $(el, '.pl'), { c, ctx, w, h } = cv(host, true); const N = 12, seg = h * .4 / N, ax = w * .72;
          const pts = Array.from({ length:N + 1 }, (_, i) => ({ x:ax, y:i * seg, px:ax, py:i * seg }));
          let grab = false, gx = 0, gy = 0, on = 1, lit = 1;
          c.addEventListener('pointerdown', (e) => { const p = local(host, e), e0 = pts[N]; if (Math.hypot(p.x - e0.x, p.y - e0.y) < 34){ grab = true; gx = p.x; gy = p.y; c.setPointerCapture(e.pointerId); click(900); } });
          c.addEventListener('pointermove', (e) => { const p = local(host, e), e0 = pts[N]; c.style.cursor = grab ? 'grabbing' : Math.hypot(p.x - e0.x, p.y - e0.y) < 34 ? 'grab' : ''; if (grab){ gx = p.x; gy = Math.min(p.y, N * seg + 90); } });
          const up = () => { if (!grab) return; grab = false; if (gy > N * seg + 40){ on = 1 - on; click(on ? 2200 : 1400); } };
          c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
          const stop = VD.loop(el, (dt, t) => {
            for (let i = 1; i <= N; i++){ const p = pts[i]; if (grab && i === N){ p.px = p.x; p.py = p.y; p.x = gx; p.y = gy; continue; }
              const vx = (p.x - p.px) * .985, vy = (p.y - p.py) * .985; p.px = p.x; p.py = p.y; p.x += vx + (i === N && !grab ? Math.sin(t * 1.5) * .02 : 0); p.y += vy + 900 * dt * dt; }
            for (let k = 0; k < 14; k++) for (let i = 0; i < N; i++){ const a = pts[i], b = pts[i + 1], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, df = (d - seg) / d;
              const wa = i === 0 ? 0 : 1, wb = grab && i + 1 === N ? 0 : 1; if (!(wa + wb)) continue;
              a.x += dx * df * wa / (wa + wb); a.y += dy * df * wa / (wa + wb); b.x -= dx * df * wb / (wa + wb); b.y -= dy * df * wb / (wa + wb); }
            lit += (on - lit) * Math.min(1, dt * 9);
            const mix = (a, b) => Math.round(a + (b - a) * lit);
            ctx.fillStyle = `rgb(${mix(15, 254)},${mix(23, 243)},${mix(42, 199)})`; ctx.fillRect(0, 0, w, h);
            const lx = w * .34; ctx.strokeStyle = lit > .5 ? '#78716c' : '#475569'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, 34); ctx.stroke();
            if (lit > .02){ const g = ctx.createRadialGradient(lx, 62, 4, lx, 62, h * .9); g.addColorStop(0, `rgba(253,224,71,${.55 * lit})`); g.addColorStop(1, 'rgba(253,224,71,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); }
            ctx.fillStyle = lit > .5 ? '#334155' : '#1e293b'; ctx.beginPath(); ctx.moveTo(lx - 10, 34); ctx.lineTo(lx + 10, 34); ctx.lineTo(lx + 34, 60); ctx.lineTo(lx - 34, 60); ctx.closePath(); ctx.fill();
            ctx.fillStyle = `rgb(${mix(71, 254)},${mix(85, 240)},${mix(105, 138)})`; ctx.beginPath(); ctx.arc(lx, 62, 10, 0, Math.PI); ctx.fill();
            ctx.strokeStyle = lit > .5 ? '#a8a29e' : '#64748b'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < N; i++){ const m = pts[i], n = pts[i + 1]; ctx.quadraticCurveTo(m.x, m.y, (m.x + n.x) / 2, (m.y + n.y) / 2); } ctx.lineTo(pts[N].x, pts[N].y); ctx.stroke();
            const e0 = pts[N]; ctx.fillStyle = '#b45309'; ctx.beginPath(); ctx.ellipse(e0.x, e0.y + 8, 7, 11, 0, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(e0.x - 2, e0.y + 4, 2, 4, 0, 0, 7); ctx.fill();
            ctx.fillStyle = lit > .5 ? '#92400e' : '#94a3b8'; ctx.font = '700 11px "Noto Sans JP", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('ひもを下に引っぱって離す', w / 2, h - 12);
          });
          return stop; },
        desc:'天井から垂れた<b>ひもを引っぱって離す</b>と、カチッと音がして明かりがつく／消える。ひもは点を鎖のようにつないだ「ベルレ積分」の簡単な物理で、離すとぶらぶら揺れる。ダークモード切替のスイッチとしてXで何度も話題になる演出。',
        prompt:'ダークモード切替を「天井から垂れたひもを引っぱるスイッチ」にして。ひもは12個の点をつないだベルレ積分の物理で、先端の持ち手をドラッグで下に引っぱり、40px以上引いてから離したら、カチッという短い効果音とともに部屋の明かりがON/OFFし、背景色が0.3秒ほどで切り替わるようにして。離したひもはぶらぶら揺れて止まるように。' },
      { name:'ぷるぷるスライム', en:'Soft-body jelly', h:230, tags:['物理','キャラ','Canvas'],
        demo:'<div class="pl"><span class="pl-hint">押す・なでる</span></div>',
        init:(el) => { const host = $(el, '.pl'), { ctx, w, h } = cv(host, true); const N = 28, cx = w / 2, cy = h / 2 + 10, R0 = Math.min(w, h) * .3;
          const P = Array.from({ length:N }, (_, i) => ({ a:i / N * Math.PI * 2, o:0, v:0 })); let px = null, py = null, blink = 0, joy = 0;
          const o1 = listen(host, 'pointermove', (e) => { const p = local(host, e); px = p.x; py = p.y; }), o2 = listen(host, 'pointerleave', () => { px = null; });
          const o3 = listen(host, 'pointerdown', (e) => { const p = local(host, e); px = p.x; py = p.y; joy = 1; P.forEach(q => { const qx = cx + Math.cos(q.a) * (R0 + q.o), qy = cy + Math.sin(q.a) * (R0 + q.o), d = Math.hypot(qx - p.x, qy - p.y); q.v -= 700 * Math.max(0, 1 - d / 90); q.v += R(-60, 60); }); });
          const stop = VD.loop(el, (dt, t) => { const steps = Math.ceil(dt / (1 / 240)), h1 = dt / steps;
            const pa = px == null ? 0 : Math.atan2(py - cy, px - cx), pd = px == null ? 1e9 : Math.hypot(px - cx, py - cy);
            for (let s = 0; s < steps; s++) P.forEach((q, i) => { const a = P[(i + N - 1) % N], b = P[(i + 1) % N];
              let f = -q.o * 220 + (a.o + b.o - 2 * q.o) * 900 - q.v * 5;
              let da = Math.abs(((q.a - pa) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI);
              if (pd < R0 + q.o && da < .55) f += (pd - (R0 + q.o)) * 500 * (1 - da / .55);
              q.v += f * h1; q.o = clamp(q.o + q.v * h1, -R0 * .7, R0 * .6); });
            blink = Math.max(0, blink - dt); if (Math.random() < dt * .4) blink = .15; joy = Math.max(0, joy - dt * 1.5);
            const br = Math.sin(t * 2) * 3; const pt = (q) => [cx + Math.cos(q.a) * (R0 + q.o + br), cy + Math.sin(q.a) * (R0 + q.o - br * .5)];
            ctx.clearRect(0, 0, w, h); ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.beginPath(); ctx.ellipse(cx, cy + R0 + 10, R0 * .9, 8, 0, 0, 7); ctx.fill();
            const g = ctx.createRadialGradient(cx - R0 * .3, cy - R0 * .4, 4, cx, cy, R0 * 1.3); g.addColorStop(0, '#bbf7d0'); g.addColorStop(1, '#16a34a'); ctx.fillStyle = g; ctx.beginPath();
            const pts = P.map(pt); let m = [(pts[N - 1][0] + pts[0][0]) / 2, (pts[N - 1][1] + pts[0][1]) / 2]; ctx.moveTo(m[0], m[1]);
            for (let i = 0; i < N; i++){ const p0 = pts[i], p1 = pts[(i + 1) % N]; ctx.quadraticCurveTo(p0[0], p0[1], (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2); } ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.beginPath(); ctx.ellipse(cx - R0 * .45, cy - R0 * .45, R0 * .16, R0 * .09, -.6, 0, 7); ctx.fill();
            const lk = px == null ? [0, 0] : [Math.cos(pa) * 4, Math.sin(pa) * 4];
            [-1, 1].forEach(sx => { const ex = cx + sx * R0 * .32, ey = cy - R0 * .12; ctx.fillStyle = '#14532d';
              if (joy > 0){ ctx.lineWidth = 3; ctx.strokeStyle = '#14532d'; ctx.beginPath(); ctx.arc(ex, ey + 3, 6, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
              else { ctx.beginPath(); ctx.ellipse(ex + lk[0], ey + lk[1], 5.5, blink > 0 ? .8 : 7.5, 0, 0, 7); ctx.fill(); } });
            ctx.strokeStyle = '#14532d'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy + R0 * .12, joy > 0 ? 10 : 6, .15 * Math.PI, .85 * Math.PI); ctx.stroke();
          });
          return () => { o1(); o2(); o3(); stop(); }; },
        desc:'輪郭を28個の点で作り、それぞれを<b>バネ</b>でつなぐと、押した場所がへこんで<b>波のようにぷるぷる伝わる</b>。カーソルでなでると表面がへこみ、押すと笑う。計算を1/240秒ずつに分けると、バネが固くても暴れない。',
        prompt:'Canvasで、押すとぷるぷる揺れる緑のスライムキャラを作って。輪郭は28個の点で、各点は「元の半径に戻るバネ」と「隣の点とそろうバネ」でつなぎ、押した場所の近くの点を内側に押し込んで波のように揺らして。カーソルが中に入ると表面がへこみ、目はカーソルを見て、押した直後は目が「^^」になって笑うようにして。計算は1/240秒刻みに分割して安定させて。' },
      { name:'ハンドスピナー', en:'Fidget spinner (inertia)', h:220, tags:['慣性','ドラッグ'],
        demo:'<div class="pl"><div class="pl-spinner">' + [0, 120, 240].map(a => `<i class="arm" style="height:52px;top:calc(50% - 52px);transform-origin:50% 100%;transform:rotate(${a}deg)"></i>`).join('') + [0, 120, 240].map(a => `<i class="lobe" style="transform:rotate(${a}deg) translateY(-50px)"></i>`).join('') + '<i class="hub"></i></div><b class="pl-rpm">0 rpm</b><span class="pl-hint">ドラッグしてはじくと回り続ける</span></div>',
        init:(el) => { const sp = $(el, '.pl-spinner'), rpm = $(el, '.pl-rpm'); let ang = 0, w = 0, drag = false, la = 0, lt = 0;
          const angOf = (e) => { const r = sp.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)); };
          sp.addEventListener('pointerdown', (e) => { drag = true; sp.setPointerCapture(e.pointerId); la = angOf(e); lt = performance.now(); w = 0; });
          sp.addEventListener('pointermove', (e) => { if (!drag) return; const a = angOf(e), now = performance.now(); let d = a - la; if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2;
            ang += d; w = w * .5 + d / Math.max(.008, (now - lt) / 1000) * .5; la = a; lt = now; });
          const up = () => { if (!drag) return; drag = false; if (performance.now() - lt > 90) w = 0; };
          sp.addEventListener('pointerup', up); sp.addEventListener('pointercancel', up);
          const stop = VD.loop(el, (dt) => { if (!drag){ ang += w * dt; w *= Math.exp(-.35 * dt); if (Math.abs(w) < .05) w = 0; }
            sp.style.transform = `rotate(${ang}rad)`; sp.style.filter = Math.abs(w) > 25 ? `blur(${Math.min(2.5, (Math.abs(w) - 25) / 40).toFixed(2)}px)` : 'none';
            rpm.textContent = Math.round(Math.abs(w) * 60 / (Math.PI * 2)) + ' rpm'; });
          return stop; },
        desc:'ドラッグで回し、はじいて離すと<b>慣性でしばらく回り続け</b>、摩擦でゆっくり止まる。高速回転中は少しぼかすとスピード感が出る。離す直前に止めていたら勢いはゼロにする、のがはじく操作を気持ちよくするコツ。',
        prompt:'ドラッグで回せるハンドスピナーを作って。中心からカーソルへの角度の変化量で回転させ、離したときは直前の角速度で回り続けて、毎秒少しずつ減速（Math.exp(-0.35 * dt)）して止まるようにして。高速回転中は回転数に応じて blur をかけ、現在の rpm を表示して。離す直前に90ms以上止めていたら勢いはゼロにして。' },
      { name:'はじける弦', en:'Rubber-band strings', h:220, tags:['SVG','バネ','話題'],
        demo:'<div class="pl" style="touch-action:none"><svg style="position:absolute;inset:0;width:100%;height:100%;overflow:visible"></svg><span class="pl-hint">線の上をサッと横切ってはじく</span></div>',
        init:(el) => { const host = $(el, '.pl'), svg = $(el, 'svg'); const W = host.clientWidth, H = host.clientHeight, x0 = 24, x1 = W - 24;
          const S = [0, 1, 2, 3, 4].map(i => { const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('fill', 'none'); p.setAttribute('stroke', `hsl(${290 + i * 22} 80% 60%)`); p.setAttribute('stroke-width', 3); p.setAttribute('stroke-linecap', 'round'); svg.append(p); return { p, y0:H * (.18 + i * .15), off:0, v:0, gx:W / 2, grab:false, prev:null }; });
          const rel = () => S.forEach(s => { s.grab = false; s.prev = null; });
          const o1 = listen(host, 'pointermove', (e) => { const p = local(host, e);
            S.forEach(s => { const r = p.y - s.y0; if (!s.grab && s.prev != null && p.x > x0 && p.x < x1 && Math.sign(r) !== Math.sign(s.prev)) s.grab = true;
              if (s.grab){ s.off = r; s.gx = p.x; s.v = 0; if (Math.abs(r) > 34 || p.x < x0 || p.x > x1) s.grab = false; } s.prev = r; }); });
          const o2 = listen(host, 'pointerleave', rel), o3 = listen(host, 'pointerup', rel);
          const stop = VD.loop(el, (dt) => { const n = Math.ceil(dt / (1 / 240)), h1 = dt / n;
            S.forEach(s => { if (!s.grab){ for (let k = 0; k < n; k++){ s.v += (-s.off * 1800 - s.v * 4) * h1; s.off += s.v * h1; } s.gx += (W / 2 - s.gx) * Math.min(1, dt * 6); }
              s.p.setAttribute('d', `M${x0} ${s.y0} Q${s.gx.toFixed(1)} ${(s.y0 + s.off * 2).toFixed(1)} ${x1} ${s.y0}`); }); });
          return () => { o1(); o2(); o3(); stop(); }; },
        desc:'カーソルが線を横切ると<b>線が引っかかって伸び</b>、ある程度伸びたら外れて<b>ビヨンビヨンと振動</b>して止まる。2次ベジェ曲線の制御点をバネで動かすだけ。区切り線やフッターにこっそり仕込むとXで「触ってしまう」と話題になりやすい。',
        prompt:'SVGで横向きの線を5本引き、カーソルが線を横切ったら線がカーソルに引っかかって伸び、34px以上離れたら外れて、ゴムのように上下に振動しながら減衰して戻るようにして（線は2次ベジェ曲線 Q で、制御点のずれをバネ k=1800・減衰4で計算）。' },
    ]},
    { title:'ご褒美・くじ・ガチャの演出', note:'「タメ（待たせる）」→「発表」→「お祝い」の順番を守ると、結果がなんであれ楽しくなります。', items:[
      { name:'スロットマシン', en:'Slot machine reels', h:230, tags:['くじ','WAAPI'],
        demo:'<div class="pl"><div class="pl-slot"><div class="pl-reels">' + rep(3, () => '<div class="pl-reel"><div class="strip"><span>💎</span></div></div>') + '</div><button class="mo-btn spin">スピン！</button><b class="res" style="font-size:12px;height:16px"></b></div></div>',
        init:(el) => { const L = confettiLayer(el), box = $(el, '.pl-reels'), strips = $$(el, '.strip'), btn = $(el, '.spin'), res = $(el, '.res'); let busy = false;
          btn.onclick = () => { if (busy) return; busy = true; box.classList.remove('win'); res.textContent = '';
            const r = Math.random() < .3 ? Array(3).fill(pick(SLOT)) : [pick(SLOT), pick(SLOT), pick(SLOT)];
            strips.forEach((s, i) => { const seq = [s.firstElementChild.textContent, ...Array.from({ length:14 + i * 6 }, () => pick(SLOT)), r[i]]; s.innerHTML = seq.map(x => `<span>${x}</span>`).join('');
              const H = 64 * (seq.length - 1), a = s.animate([{ transform:'translateY(0)', filter:'blur(0)' }, { filter:'blur(1.5px)', offset:.3 }, { filter:'blur(1px)', offset:.75 }, { transform:`translateY(${-H}px)`, filter:'blur(0)' }], { duration:1100 + i * 450, easing:'cubic-bezier(.15,.7,.25,1.04)', fill:'forwards' });
              a.onfinish = () => { s.innerHTML = `<span>${r[i]}</span>`; a.cancel();
                if (i === 2){ busy = false; if (r[0] === r[1] && r[1] === r[2]){ box.classList.add('win'); res.textContent = '🎉 大当たり！'; const b = box.getBoundingClientRect(), rr = el.getBoundingClientRect(); L.burst(b.left + b.width / 2 - rr.left, b.top - rr.top, 90, -90, 100, 650); }
                  else res.textContent = r[0] === r[1] || r[1] === r[2] || r[0] === r[2] ? 'おしい！' : 'もう一回！'; } }; }); };
          return L.stop; },
        desc:'3つのリールが<b>左から順番に止まる</b>。最後のリールほど長く回すのが「ドキドキ」の正体。回転中はぼかし、止まる瞬間に少し行き過ぎて戻る。そろったら枠が光って紙吹雪。',
        prompt:'3つのリールのスロットマシンを作って。スピンを押すと、各リールに14個以上のランダムな絵柄を並べ、Web Animations APIで縦に流して、左から1.1秒・1.55秒・2秒で順番に止めて（止まる瞬間に少し行き過ぎて戻るイージング、回転中はblur）。3つそろったら枠を点滅させて紙吹雪、2つなら「おしい！」と表示して。' },
      { name:'3Dサイコロ', en:'3D dice roll', h:220, tags:['3D','くじ'],
        demo:'<div class="pl"><div class="mo-col"><div class="pl-dice">' + DIE + DIE + '</div><button class="mo-btn roll">サイコロを振る</button><b class="res" style="font-size:12px;height:16px"></b></div></div>',
        init:(el) => { const L = confettiLayer(el), dice = $$(el, '.pl-die'), res = $(el, '.res'), btn = $(el, '.roll'); let n = 0, busy = false;
          const tf = (k, v) => { const [rx, ry] = FACE[v]; return `rotateX(-16deg) rotateY(20deg) rotateX(${k * 720 + rx}deg) rotateY(${k * 720 + ry}deg)`; };
          dice.forEach((d, i) => { d.style.transform = tf(0, 1); d.style.transitionDuration = (1.2 + i * .35) + 's'; });
          btn.onclick = () => { if (busy) return; busy = true; n++; res.textContent = ''; const v = [1 + (Math.random() * 6 | 0), 1 + (Math.random() * 6 | 0)];
            dice.forEach((d, i) => { d.style.transform = tf(n, v[i]); });
            setTimeout(() => { busy = false; if (v[0] === v[1]){ res.textContent = `ゾロ目！ ${v[0]}・${v[1]} 🎉`; const b = dice[0].parentNode.getBoundingClientRect(), rr = el.getBoundingClientRect(); L.burst(b.left + b.width / 2 - rr.left, b.top - rr.top, 70); } else res.textContent = `合計 ${v[0] + v[1]}`; }, 1600); };
          return L.stop; },
        desc:'6面を <code>rotateX/Y</code> と <code>translateZ</code> で組み立てた<b>本物の立体</b>。振るたびに720度ずつ足して回すので、毎回ちゃんと転がって見える。出る目は先に決めておき、その面が正面に来る角度で止める。',
        prompt:'CSSの3D（transform-style: preserve-3d）でサイコロを2つ作って。6つの面を rotateX/rotateY と translateZ で立方体に組み、「振る」ボタンで出る目を先にランダムに決め、その面が正面に来る角度に「前回より720度多く」回転させて転がって見えるようにして（2つ目は少し長く転がす）。ゾロ目なら紙吹雪を出して。' },
      { name:'スクラッチくじ', en:'Scratch card', h:210, tags:['Canvas','くじ'],
        demo:'<div class="pl"><div class="pl-scratch"><div class="prize"></div></div></div>',
        init:(el) => { const L = confettiLayer(el), box = $(el, '.pl-scratch'), pr = $(el, '.prize');
          const P = pick([['大当たり 🎉', '今日のコードは一発で動く'], ['あたり 🍩', 'ドーナツ休憩券'], ['あたり ☕', 'コーヒー1杯ぶんの集中力'], ['小当たり ✨', 'タイポが1つ見つかる'], ['はずれ 🫠', 'でも、セミコロンは足りてる']]);
          pr.innerHTML = `<div><b>${P[0]}</b><small>${P[1]}</small></div>`;
          const { c, ctx, w, h } = cv(box, true); c.style.cursor = 'crosshair';
          const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#cbd5e1'); g.addColorStop(.5, '#f1f5f9'); g.addColorStop(1, '#94a3b8'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
          for (let i = 0; i < 160; i++){ ctx.fillStyle = `rgba(255,255,255,${R(.2, .8)})`; ctx.fillRect(R(0, w), R(0, h), 2, 2); }
          ctx.fillStyle = '#64748b'; ctx.font = '800 15px "Noto Sans JP", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('ここをこすってね 🪙', w / 2, h / 2);
          let down = false, lx = null, ly = null, cnt = 0, done = false;
          const check = () => { const d = ctx.getImageData(0, 0, c.width, c.height).data; let cl = 0, tot = 0; for (let i = 3; i < d.length; i += 64){ tot++; if (d[i] < 20) cl++; }
            if (!done && cl / tot > .5){ done = true; c.style.transition = 'opacity .6s'; c.style.opacity = 0; c.style.pointerEvents = 'none'; if (!P[0].startsWith('はずれ')){ const r = box.getBoundingClientRect(), rr = el.getBoundingClientRect(); L.burst(r.left + r.width / 2 - rr.left, r.top + r.height / 2 - rr.top, 80); } } };
          const scr = (e) => { const p = local(box, e); ctx.globalCompositeOperation = 'destination-out'; ctx.strokeStyle = '#000'; ctx.lineCap = 'round'; ctx.lineWidth = 30; ctx.beginPath(); ctx.moveTo(lx ?? p.x, ly ?? p.y); ctx.lineTo(p.x + .1, p.y); ctx.stroke(); lx = p.x; ly = p.y; if (++cnt % 6 === 0) check(); };
          c.addEventListener('pointerdown', (e) => { down = true; c.setPointerCapture(e.pointerId); lx = ly = null; scr(e); });
          c.addEventListener('pointermove', (e) => { if (down) scr(e); });
          c.addEventListener('pointerup', () => { down = false; check(); });
          return L.stop; },
        desc:'銀色の膜を<b>こすったところだけ消えて</b>、下の結果が見えてくる。半分以上けずれたら残りがふわっと消えてお祝い。膜はCanvasに描き、<code>destination-out</code> で塗った場所を透明にする。↻でもう1枚。',
        prompt:'スクラッチくじを作って。結果のカードの上に銀色のグラデーションのCanvasを重ね、ドラッグした跡を globalCompositeOperation = "destination-out" の太い線（30px・丸い先端）で消して下が見えるようにして。消えた割合をときどき getImageData で調べ、50%を超えたら残りを0.6秒でフェードアウトし、当たりなら紙吹雪を出して。' },
      { name:'おみくじ', en:'Omikuji fortune', h:220, tags:['和風','くじ','3D'],
        demo:'<div class="pl"><div class="pl-omk"><div class="pl-omkwrap"><i class="stk"></i><button class="pl-omkbox">おみくじ</button></div><div class="pl-omkres"><div class="card"><div class="fc">← 箱を押して<br>引いてね</div><div class="bc"></div></div></div></div></div>',
        init:(el) => { const L = confettiLayer(el), wrap = $(el, '.pl-omkwrap'), box = $(el, '.pl-omkbox'), stk = $(el, '.stk'), card = $(el, '.card'), bc = $(el, '.bc'); let busy = false;
          const LOT = [['大吉', 'バグが自分から名乗り出る', 15], ['中吉', 'AIが一発で意図をくみ取る', 20], ['小吉', 'タイポは1つだけ', 20], ['吉', 'キャッシュを消せば直る', 20], ['末吉', '動くけど理由は不明', 15], ['凶', '本番でだけ再現する', 10]];
          box.onclick = async () => { if (busy) return; busy = true;
            if (card.classList.contains('flip')){ card.classList.remove('flip'); stk.style.transform = ''; await wait(450); }
            await wrap.animate([{ transform:'rotate(0)' }, { transform:'rotate(-16deg)' }, { transform:'rotate(14deg)' }, { transform:'rotate(-12deg)' }, { transform:'rotate(10deg)' }, { transform:'rotate(-6deg)' }, { transform:'rotate(0)' }], { duration:850, easing:'ease-in-out' }).finished;
            stk.style.transform = 'translateY(-36px)'; await wait(450);
            let k = Math.random() * 100, r = LOT[0]; for (const x of LOT){ if ((k -= x[2]) < 0){ r = x; break; } }
            bc.className = 'bc' + (r[0] === '大吉' ? ' gold' : ''); bc.innerHTML = `<b>${r[0]}</b><small>${r[1]}</small>`; card.classList.add('flip');
            if (r[0] === '大吉') setTimeout(() => { const b = card.getBoundingClientRect(), rr = el.getBoundingClientRect(); L.burst(b.left + b.width / 2 - rr.left, b.top - rr.top, 80); }, 600);
            busy = false; };
          return L.stop; },
        desc:'箱を<b>ガシャガシャ振ると棒が飛び出し</b>、紙が3Dでめくれて結果が出る。大吉だけ金色に光って紙吹雪。「振る（タメ）→ 棒が出る → めくる」と段階を踏むほど、結果を見る瞬間が楽しくなる。',
        prompt:'おみくじの演出を作って。箱をクリックすると底を支点に左右に0.85秒ガシャガシャ振れ、上から棒がバネのように飛び出し、横の紙が rotateY(180deg) で3Dにめくれて結果（大吉〜凶、確率付き）とプログラマー向けの一言が出るようにして。大吉のときだけ紙を金色に光らせて紙吹雪を出し、もう一度押すと紙が裏返って引き直せるようにして。' },
      { name:'ガチャガチャ', en:'Capsule toy machine', h:240, tags:['ガチャ','レア演出'],
        demo:'<div class="pl"><div class="pl-gacha"><div class="dome">' + [[2, 76], [31, 78], [60, 76], [89, 78], [16, 50], [46, 52], [76, 50], [32, 26], [62, 28]].map(([l, t], i) => `<i style="left:${l}px;top:${t}px;--c:${['#f472b6', '#60a5fa', '#fbbf24', '#34d399', '#a78bfa', '#fb7185', '#22d3ee', '#facc15', '#4ade80'][i]};rotate:${(i * 47) % 90 - 45}deg"></i>`).join('') + '</div><div class="base"></div><button class="handle" aria-label="ハンドルを回す"></button><i class="chute"></i></div><span class="pl-hint">ハンドルを回す → 出てきたカプセルを押す</span></div>',
        init:(el) => { const L = confettiLayer(el), g = $(el, '.pl-gacha'), hd = $(el, '.handle'); let rot = 0, busy = false, cap = null;
          hd.onclick = async () => { if (busy) return; busy = true; if (cap){ cap.remove(); cap = null; } rot += 360; hd.style.transform = `rotate(${rot}deg)`; g.classList.add('shake'); click(600);
            await wait(850); g.classList.remove('shake');
            const k = Math.random(), it = k < .08 ? ['🦄', '★★★ SSR', true] : k < .3 ? [pick(['🐉', '🦊', '🐙']), '★★ SR', false] : [pick(['🐣', '🍙', '🎈', '🧦', '🥚']), '★ R', false];
            cap = document.createElement('div'); cap.className = 'pl-cap'; cap.style.cssText = `--c:${it[2] ? '#facc15' : pick(['#f472b6', '#60a5fa', '#34d399', '#a78bfa'])};left:55px;top:146px`;
            cap.innerHTML = `<i class="top"></i><i class="bot"></i><span class="pl-prize">${it[0]}</span><b class="pl-rar">${it[1]}</b>`; g.append(cap);
            // 転がる距離はステージの右端に収まる範囲で（狭い画面・拡大表示でも見切れない）
            const tr = clamp(el.getBoundingClientRect().right - g.getBoundingClientRect().left - 55 - 40 - 8, 40, 116);
            cap.animate([{ transform:'translateY(-10px) scale(.5)', opacity:0 }, { transform:'translateY(4px) scale(1)', opacity:1, offset:.25 }, { transform:`translate(${tr * .6}px, 0) rotate(220deg)`, offset:.6 }, { transform:`translate(${tr * .83}px, -16px) rotate(300deg)`, offset:.78 }, { transform:`translate(${tr}px, 0) rotate(360deg)` }], { duration:1100, easing:'ease-out', fill:'forwards' });
            cap.onclick = () => { if (cap.classList.contains('open')) return; cap.classList.add('open'); click(1200);
              if (it[2]){ const b = cap.getBoundingClientRect(), rr = el.getBoundingClientRect(); L.burst(b.left + b.width / 2 - rr.left, b.top - rr.top, 100, -90, 120, 680); } };
            busy = false; };
          return L.stop; },
        desc:'ハンドルが回り、中のカプセルが<b>ガタガタ揺れて</b>から1つ転がり出てくる。カプセルを押すとパカッと開いて中身とレア度が出る。SSRはカプセルが金色で、開くと紙吹雪。<b>開ける前からレア度をほのめかす</b>のが盛り上げのコツ。',
        prompt:'ガチャガチャの演出を作って。ハンドルを押すと360度回転し、ドームの中のカプセルが0.85秒ガタガタ揺れ、取り出し口から1つのカプセルが転がりながら右へ出てきて止まる（Web Animations APIのキーフレームで）。カプセルを押すと上半分がパカッと開いて、中身の絵文字とレア度（★R／★★SR／★★★SSR、確率付き）が飛び出し、SSRのときはカプセルを最初から金色にして、開けたら紙吹雪を出して。' },
      { name:'クリックで花火', en:'Fireworks on click', h:230, tags:['Canvas','お祝い'],
        demo:'<div class="pl pl-dark" style="cursor:crosshair"><span class="pl-hint">クリックした場所に打ち上がる（ハート形もあるよ）</span></div>',
        init:(el) => { const host = $(el, '.pl'), { ctx, w, h } = cv(host); const RK = [], PT = []; let auto = .3, user = 0;
          const launch = (tx, ty) => { const x = clamp(tx + R(-60, 60), 20, w - 20), vy = -Math.sqrt(2 * 600 * Math.max(30, h - ty)), T = -vy / 600; RK.push({ x, y:h, vx:(tx - x) / T, vy, hue:R(0, 360) }); };
          const boom = (x, y, hue) => { const heart = Math.random() < .25, n = heart ? 80 : 90;
            for (let i = 0; i < n; i++){ let vx, vy; if (heart){ const t = i / n * Math.PI * 2; vx = 16 * Math.sin(t) ** 3 * 9; vy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 9; }
              else { const a = R(0, Math.PI * 2), s = 210 * Math.sqrt(Math.random()); vx = Math.cos(a) * s; vy = Math.sin(a) * s; }
              PT.push({ x, y, vx, vy, life:R(1, 1.6), hue:heart ? 340 : hue + R(-20, 20) }); } };
          const o1 = listen(host, 'pointerdown', (e) => { const p = local(host, e); user = performance.now(); launch(p.x, p.y); });
          const stop = VD.loop(el, (dt) => {
            if (performance.now() - user > 2500 && (auto -= dt) <= 0){ auto = R(.7, 1.4); launch(R(w * .2, w * .8), R(h * .15, h * .45)); }
            ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = 'rgba(23,20,42,.25)'; ctx.fillRect(0, 0, w, h); ctx.globalCompositeOperation = 'lighter';
            for (let i = RK.length - 1; i >= 0; i--){ const r = RK[i]; r.vy += 600 * dt; r.x += r.vx * dt; r.y += r.vy * dt; ctx.fillStyle = `hsl(${r.hue} 100% 75%)`; ctx.beginPath(); ctx.arc(r.x, r.y, 2.2, 0, 7); ctx.fill(); if (r.vy >= 0){ boom(r.x, r.y, r.hue); RK.splice(i, 1); } }
            for (let i = PT.length - 1; i >= 0; i--){ const p = PT[i]; const k = Math.exp(-1.6 * dt); p.vx *= k; p.vy = p.vy * k + 110 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
              if (p.life <= 0){ PT.splice(i, 1); continue; } ctx.globalAlpha = Math.min(1, p.life); ctx.fillStyle = `hsl(${p.hue} 100% ${55 + p.life * 15}%)`; ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, 7); ctx.fill(); }
            ctx.globalAlpha = 1; });
          return () => { o1(); stop(); }; },
        desc:'クリックした場所へ<b>花火玉が打ち上がり、頂点で破裂</b>する。毎フレーム背景を半透明で塗り重ねると、光の尾（残像）が自然に残る。4発に1発はハート形（ハートの数式で粒の速度を決める）。',
        prompt:'Canvasでクリックした位置に花火を打ち上げるアニメーションを作って。玉は重力で減速しながら上がり、頂点（速度が0になった瞬間）で80〜90個の粒に破裂、粒は空気抵抗と重力で広がりながら落ちて1〜1.6秒で消えるようにして。毎フレーム背景を透明度0.25の暗い色で塗って残像を出し、粒は加算合成（lighter）で光らせて。4回に1回はハートの数式で粒をハート形に飛ばして。' },
      { name:'湧き上がるハート', en:'Live-stream hearts', h:220, tags:['SNS','連打'],
        demo:'<div class="pl" style="background:linear-gradient(#fdf2f8, #fce7f3)"><b class="pl-msg cnt" style="text-align:left;left:14px;color:#db2777">♥ 0</b><button class="pl-heartbtn" aria-label="ハートを送る">♥</button><span class="pl-hint" style="right:80px">押す・長押しで連打</span></div>',
        init:(el) => { const host = $(el, '.pl'), btn = $(el, '.pl-heartbtn'), cnt = $(el, '.cnt'); let n = 0, iv = null;
          const spawn = () => { n++; cnt.textContent = '♥ ' + n; const e = document.createElement('span'); e.className = 'pl-heart'; e.textContent = pick(['❤️', '💖', '💜', '💛', '💚', '🩵', '🧡']);
            const r0 = host.getBoundingClientRect(), b = btn.getBoundingClientRect(); e.style.left = (b.left - r0.left + b.width / 2 - 12) + 'px'; e.style.top = (b.top - r0.top) + 'px'; e.style.fontSize = R(18, 30) + 'px'; host.append(e);
            const amp = R(12, 28) * (Math.random() < .5 ? -1 : 1), H = R(host.clientHeight * .55, host.clientHeight * .9), kf = [];
            for (let k = 0; k <= 10; k++){ const p = k / 10; kf.push({ transform:`translate(${Math.sin(p * Math.PI * 2.2) * amp - p * 40}px, ${-p * H}px) scale(${k === 0 ? .2 : Math.min(1, .5 + p * 3)})`, opacity:p < .7 ? 1 : 1 - (p - .7) / .3 }); }
            e.animate(kf, { duration:R(1800, 2600), easing:'cubic-bezier(.3,.6,.5,1)' }).onfinish = () => e.remove(); };
          const end = () => { clearInterval(iv); iv = null; };
          btn.addEventListener('pointerdown', () => { spawn(); end(); iv = setInterval(spawn, 90); });
          ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => btn.addEventListener(t, end));
          btn.addEventListener('click', (e) => { if (e.detail === 0) spawn(); });
          return end; },
        desc:'ライブ配信のように、押すたびに<b>色とりどりのハートがゆらゆら</b>立ちのぼって消える。長押しで連打。ハートごとに揺れ幅・高さ・速さを少しずつ変えると、たくさん出ても単調にならない。',
        prompt:'ライブ配信風の「ハートを送る」ボタンを作って。押すたびにボタンの位置から色の違うハートの絵文字を出し、sin波で左右にゆらゆら揺れながら上へ昇り、最初は小さく膨らんで最後の30%でフェードアウトするようにして（Web Animations APIで、揺れ幅・高さ・時間はハートごとにランダム）。長押し中は90msごとに連続で出して、送った数も表示して。' },
    ]},
    { title:'隠し要素・ゲームっぽさ', note:'見つけた人だけが楽しめる要素は、SNSで「これ知ってた？」と共有されやすくなります。', items:[
      { name:'隠しコマンド（コナミコマンド）', en:'Konami code easter egg', h:240, tags:['隠し要素','キーボード'],
        demo:'<div class="pl" tabindex="0" style="outline:none"><div class="pl-konami"><div class="pl-seq">' + KONAMI.map(k => `<b>${k}</b>`).join('') + '</div><div class="pl-pad"><button data-k="↑" style="grid-area:1/2">↑</button><button data-k="←" style="grid-area:2/1">←</button><button data-k="↓" style="grid-area:2/2">↓</button><button data-k="→" style="grid-area:2/3">→</button><button class="ab" data-k="B" style="grid-area:1/5/3/6">B</button><button class="ab" data-k="A" style="grid-area:1/6/3/7">A</button></div><small class="msg" style="color:var(--muted);font-size:11px;min-height:46px;display:flex;align-items:center;gap:4px">ボタンを押すか、ここをクリックしてキーボードで入力</small></div></div>',
        init:(el) => { const host = $(el, '.pl'), seq = $(el, '.pl-seq'), bs = $$(el, '.pl-seq b'), msg = $(el, '.msg'), L = confettiLayer(el); let i = 0, party = false;
          const reset = () => { i = 0; bs.forEach(b => b.classList.remove('on')); };
          const press = (k) => { if (party) return;
            if (k === KONAMI[i]){ bs[i].classList.add('on'); i++;
              if (i === KONAMI.length){ party = true; host.classList.add('pl-party'); msg.innerHTML = '<span class="pl-dance">🕺</span><b style="font-size:14px;color:var(--accent)">隠しコマンド成功！</b><span class="pl-dance" style="animation-delay:-.25s">💃</span>'; L.burst(el.clientWidth / 2, el.clientHeight * .6, 100, -90, 120, 650);
                setTimeout(() => { party = false; host.classList.remove('pl-party'); msg.textContent = 'もう一度どうぞ'; reset(); }, 4000); } }
            else { if (k === '↑' && i === 2) return; retrigger(seq, 'bad'); reset(); if (k === KONAMI[0]){ bs[0].classList.add('on'); i = 1; } } };
          $$(el, '.pl-pad button').forEach(b => b.onclick = () => press(b.dataset.k));
          const KEY = { ArrowUp:'↑', ArrowDown:'↓', ArrowLeft:'←', ArrowRight:'→', b:'B', B:'B', a:'A', A:'A' };
          host.addEventListener('keydown', (e) => { const k = KEY[e.key]; if (!k) return; e.preventDefault(); press(k); });
          return L.stop; },
        desc:'<b>↑↑↓↓←→←→BA</b> と入力すると、画面が虹色に変わってキャラが踊り出す。入力の進み具合をマスで見せ、まちがえたら横に震えて最初から。ゲーム会社やエンジニア系サイトの隠し要素の定番。',
        prompt:'コナミコマンド（↑↑↓↓←→←→BA）の隠し要素を作って。入力の進み具合を10個のマスで表示し、正しいキーなら1マスずつ色が付き、まちがえたらマスの列が左右に震えてリセット。全部正しく入力できたら、4秒間 filter: hue-rotate で画面全体を虹色に回し、踊る絵文字と紙吹雪を出して。キーボードの矢印キー（preventDefaultでスクロールを止める）と画面のボタンの両方に対応して。',
        code:'const SEQ = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];\nlet i = 0;\naddEventListener("keydown", (e) => {\n  i = e.key === SEQ[i] ? i + 1 : (e.key === SEQ[0] ? 1 : 0);\n  if (i === SEQ.length) { party(); i = 0; }\n});' },
      { name:'入力がアツくなる（パワーモード）', en:'Power mode typing', h:210, tags:['入力欄','コンボ','話題'],
        demo:'<div class="pl"><div class="pl-power"><b class="pl-combo"></b><input type="text" placeholder="ここに何か入力してみて" aria-label="入力欄"><small style="color:var(--muted);font-size:11px">打つたびに火花・連打でコンボ</small></div></div>',
        init:(el) => { const host = $(el, '.pl'), inp = $(el, 'input'), cb = $(el, '.pl-combo'), { c, ctx, w, h } = cv(host); c.style.pointerEvents = 'none';
          const mc = document.createElement('canvas').getContext('2d'), ps = []; let combo = 0, to = null;
          const MS = { 10:'すごい！', 25:'アツい！🔥', 50:'神速！⚡', 100:'伝説…👑' };
          inp.addEventListener('input', () => { combo++; clearTimeout(to); to = setTimeout(() => { combo = 0; cb.textContent = ''; }, 1600);
            const ms = Object.keys(MS).map(Number).filter(k => combo >= k).pop(); cb.textContent = combo + ' コンボ' + (ms ? ' ' + MS[ms] : ''); retrigger(cb, 'pop');
            const cs = getComputedStyle(inp); mc.font = cs.font; const tw = mc.measureText(inp.value.slice(0, inp.selectionStart ?? inp.value.length)).width;
            const ir = inp.getBoundingClientRect(), r0 = host.getBoundingClientRect(), x = ir.left - r0.left + parseFloat(cs.paddingLeft) + clamp(tw - inp.scrollLeft, 0, inp.clientWidth - 24), y = ir.top - r0.top + ir.height / 2;
            const hue = combo < 10 ? 40 : combo < 25 ? 195 : null;
            for (let i = 0, n = 6 + Math.min(20, combo / 2 | 0); i < n; i++){ const a = R(-Math.PI, 0), s = R(80, 260); ps.push({ x, y, vx:Math.cos(a) * s, vy:Math.sin(a) * s, life:R(.4, .8), hue:hue ?? R(0, 360) }); }
            const k = Math.min(8, 1.5 + combo / 6); inp.animate([{ transform:`translate(${R(-k, k)}px, ${R(-k, k)}px)` }, { transform:'none' }], { duration:110 }); });
          const stop = VD.loop(el, (dt) => { ctx.clearRect(0, 0, w, h);
            for (let i = ps.length - 1; i >= 0; i--){ const p = ps[i]; p.vy += 500 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; if (p.life <= 0){ ps.splice(i, 1); continue; }
              ctx.globalAlpha = Math.min(1, p.life * 2); ctx.fillStyle = `hsl(${p.hue} 100% 60%)`; ctx.fillRect(p.x, p.y, 3, 3); } ctx.globalAlpha = 1; });
          return () => { stop(); clearTimeout(to); }; },
        desc:'1文字打つごとに<b>カーソル位置から火花</b>が飛び、入力欄が小さく揺れ、連続で打つとコンボ数が増えて色や言葉が変わる。エディタの拡張機能「Power Mode」で有名になった演出。カーソル位置は、カーソルまでの文字の幅を測って求める。',
        prompt:'入力欄に「パワーモード」を付けて。1文字入力するたびに、カーソル位置（カーソルまでの文字列の幅を measureText で測る）から火花の粒をCanvasで飛ばし、入力欄を一瞬ランダムに揺らして。1.6秒以内に打ち続けるとコンボ数が増え、10・25・50・100コンボで「すごい！」などの言葉を出し、火花の色も黄→水色→虹色と変えて。コンボ数は打つたびにポンと弾ませて。' },
      { name:'溜め撃ち', en:'Charge & release shot', h:200, tags:['ゲーム','長押し'],
        demo:'<div class="pl pl-dark"><div class="pl-charge"><b class="pl-lv" style="color:#e2e8f0">Lv 0</b><i class="pl-orb"></i><button class="mo-btn pl-holdbtn">長押しでチャージ</button></div><span class="pl-hint" style="top:14px;bottom:auto;left:auto;right:44px;text-align:right">Lv3で画面がゆれる</span></div>',
        init:(el) => { const host = $(el, '.pl'), wrap = $(el, '.pl-charge'), orb = $(el, '.pl-orb'), lvEl = $(el, '.pl-lv'), btn = $(el, '.pl-holdbtn'); let on = false, ch = 0, acc = 0;
          const COL = ['#60a5fa', '#facc15', '#fb923c'];
          const start = () => { if (on) return; on = true; ch = 0; click(300); };
          const fire = () => { if (!on) return; on = false; const lv = ch, sz = 14 + lv * 18, W = wrap.clientWidth, s = document.createElement('i'); s.className = 'pl-shot';
            s.style.cssText = `left:${40 - sz / 2}px;width:${sz}px;height:${sz}px;margin-top:${-sz / 2}px;filter:drop-shadow(0 0 ${6 + lv * 6}px ${lv >= 3 ? '#f0abfc' : '#fbbf24'})`; wrap.append(s);
            s.animate([{ transform:'translateX(0) scaleX(1)' }, { transform:`translateX(${W}px) scaleX(${1 + lv * .4})` }], { duration:520 - lv * 60, easing:'cubic-bezier(.5,0,.9,.6)' }).onfinish = () => s.remove();
            if (lv >= 3) host.animate([{ transform:'translate(7px,-5px)' }, { transform:'translate(-7px,4px)' }, { transform:'translate(5px,5px)' }, { transform:'translate(-3px,-2px)' }, { transform:'none' }], { duration:360, delay:200 });
            click(lv >= 3 ? 120 : 500); ch = 0; };
          btn.addEventListener('pointerdown', (e) => { btn.setPointerCapture(e.pointerId); start(); });
          ['pointerup', 'pointercancel'].forEach(t => btn.addEventListener(t, fire));
          btn.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat){ e.preventDefault(); start(); } });
          btn.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') fire(); });
          const stop = VD.loop(el, (dt, t) => { if (on){ ch = Math.min(3, ch + dt * 1.4); acc += dt;
              while (acc > .045){ acc -= .045; const d = document.createElement('i'), a = R(0, Math.PI * 2), r = R(40, 70), y0 = wrap.clientHeight / 2; d.style.cssText = `position:absolute;left:${40 + Math.cos(a) * r}px;top:${y0 + Math.sin(a) * r}px;width:4px;height:4px;border-radius:50%;background:#fff;pointer-events:none`; wrap.append(d);
                d.animate([{ transform:'none', opacity:1 }, { transform:`translate(${-Math.cos(a) * r}px, ${-Math.sin(a) * r}px) scale(.3)`, opacity:.2 }], { duration:300, easing:'ease-in' }).onfinish = () => d.remove(); } }
            const lv = Math.floor(ch), col = lv >= 3 ? `hsl(${(t * 600) % 360} 100% 65%)` : COL[lv];
            orb.style.setProperty('--oc', col); orb.style.setProperty('--lv', (ch / 3).toFixed(2)); orb.style.transform = `scale(${1 + ch * .55 + (lv >= 3 ? Math.sin(t * 40) * .06 : 0)})`;
            lvEl.textContent = 'Lv ' + lv + (lv >= 3 ? ' MAX!' : ''); });
          return stop; },
        desc:'長押しの間<b>光の粒が吸い込まれて</b>玉が大きくなり、Lv1→2→3で色が変わる。離すとその強さで発射。最大チャージだと画面がゆれる。「待つほど報われる」長押し操作は、ゲーム以外でも保存・送信の演出に使える。',
        prompt:'長押しでチャージして離すと発射する演出を作って。押している間、玉のまわりから白い光の粒が中心に吸い込まれ、玉は大きくなりながら青→黄→オレンジ→虹色（Lv3 MAX）に変わって小刻みに震える。離したらチャージ量に応じた大きさの弾が右へ飛び、Lv3のときは画面全体を0.36秒ゆらして。キーボードのSpace長押しにも対応して。' },
      { name:'粒子でできた文字', en:'Particle text', h:210, tags:['Canvas','文字'],
        demo:'<div class="pl pl-dark"><span class="pl-hint">なでると散る・クリックで爆発</span></div>',
        init:(el) => { const host = $(el, '.pl'), { ctx, w, h } = cv(host); let P = [], px = -1e4, py = -1e4;
          const build = () => { const oc = document.createElement('canvas'); oc.width = w; oc.height = h; const o = oc.getContext('2d'), fs = Math.min(h * .5, w / 4.2);
            o.font = `900 ${fs}px "Noto Sans JP", sans-serif`; o.textAlign = 'center'; o.textBaseline = 'middle'; o.fillText('あそぼ！', w / 2, h / 2); const d = o.getImageData(0, 0, w, h).data, st = w < 420 ? 4 : 5, nP = [];
            for (let y = 0; y < h; y += st) for (let x = 0; x < w; x += st) if (d[(y * w + x) * 4 + 3] > 128){ const q = P[nP.length]; nP.push({ hx:x, hy:y, x:q ? q.x : R(0, w), y:q ? q.y : R(0, h), vx:0, vy:0, c:`hsl(${(x / w * 300 + 180) | 0} 90% 65%)` }); }
            P = nP; };
          build(); document.fonts && document.fonts.load(`900 40px "Noto Sans JP"`, 'あそぼ').then(build, () => {});
          const o1 = listen(host, 'pointermove', (e) => { const p = local(host, e); px = p.x; py = p.y; }), o2 = listen(host, 'pointerleave', () => { px = py = -1e4; });
          const o3 = listen(host, 'pointerdown', (e) => { const p = local(host, e); P.forEach(q => { const dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy) || 1; q.vx += dx / d * R(300, 900); q.vy += dy / d * R(300, 900); }); });
          const stop = VD.loop(el, (dt) => { ctx.clearRect(0, 0, w, h); const k = Math.exp(-5 * dt);
            for (const q of P){ const dx = q.x - px, dy = q.y - py, d = Math.hypot(dx, dy);
              if (d < 50){ const f = (50 - d) * 90 / (d || 1); q.vx += dx * f * dt; q.vy += dy * f * dt; }
              q.vx = (q.vx + (q.hx - q.x) * 40 * dt) * k; q.vy = (q.vy + (q.hy - q.y) * 40 * dt) * k; q.x += q.vx * dt; q.y += q.vy * dt;
              ctx.fillStyle = q.c; ctx.fillRect(q.x, q.y, 2.6, 2.6); } });
          return () => { o1(); o2(); o3(); stop(); }; },
        desc:'文字を見えないCanvasに描いて<b>点の位置を読み取り</b>、その数百個の点を粒子として動かす。カーソルでなでると散り、クリックで爆発し、バネで元の文字に戻ってくる。ヒーローエリアのタイトルに。',
        prompt:'Canvasで「あそぼ！」という文字を数百個の粒子で表示して。文字を一度オフスクリーンのCanvasに描いて getImageData で4〜5pxおきに塗られている点を読み取り、各粒子の帰る場所にする。最初はバラバラの位置から集まって文字になり、カーソルの50px以内の粒子は押しのけられ、クリックするとその場所から爆発して、バネ（減衰付き）で文字に戻るようにして。色は左から右へ虹色のグラデーションに。' },
      { name:'水面の波紋', en:'Water ripple simulation', h:210, tags:['Canvas','シミュレーション'],
        demo:'<div class="pl"><span class="pl-hint" style="color:#cffafe">なでる・クリックで波紋（ときどき雨）</span></div>',
        init:(el) => { const host = $(el, '.pl'), { ctx, w, h } = cv(host), S = 3, W = Math.ceil(w / S), H = Math.ceil(h / S);
          let A = new Float32Array(W * H), B = new Float32Array(W * H), rain = 0, lx = -99, ly = -99;
          const oc = document.createElement('canvas'); oc.width = W; oc.height = H; const oct = oc.getContext('2d'), img = oct.createImageData(W, H);
          const drop = (x, y, s) => { const cx = x / S | 0, cy = y / S | 0; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++){ const X = cx + dx, Y = cy + dy; if (X > 0 && Y > 0 && X < W - 1 && Y < H - 1 && dx * dx + dy * dy <= 4) A[Y * W + X] += s; } };
          const o1 = listen(host, 'pointermove', (e) => { const p = local(host, e); if (Math.hypot(p.x - lx, p.y - ly) > 6){ drop(p.x, p.y, 90); lx = p.x; ly = p.y; } }), o2 = listen(host, 'pointerdown', (e) => { const p = local(host, e); drop(p.x, p.y, 600); });
          const stop = VD.loop(el, (dt) => { if ((rain -= dt) <= 0){ rain = R(.25, .9); drop(R(0, w), R(0, h), 380); }
            for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++){ const i = y * W + x; B[i] = ((A[i - 1] + A[i + 1] + A[i - W] + A[i + W]) / 2 - B[i]) * .975; }
            const T = A; A = B; B = T; const d = img.data;
            for (let i = 0, j = 0; i < A.length; i++, j += 4){ const l = clamp(((A[i - 1] || 0) - (A[i + 1] || 0) + (A[i - W] || 0) - (A[i + W] || 0)) * .5, -60, 110); d[j] = clamp(12 + l * .9, 0, 255); d[j + 1] = clamp(120 + l, 0, 255); d[j + 2] = clamp(160 + l * .8, 0, 255); d[j + 3] = 255; }
            oct.putImageData(img, 0, 0); ctx.imageSmoothingEnabled = true; ctx.drawImage(oc, 0, 0, w, h); });
          return () => { o1(); o2(); stop(); }; },
        desc:'水面を小さなマス目の「高さ」で表し、<b>まわり4マスの平均から次の高さを決める</b>だけで波が広がり、ぶつかり、重なる（古典的な波紋アルゴリズム）。高さの傾きを明るさにすると光が反射しているように見える。',
        prompt:'Canvasで水面の波紋シミュレーションを作って。画面を3pxごとのマス目にした高さの配列を2つ用意し、「新しい高さ = 上下左右の平均×2 − 1つ前の高さ」に0.975をかけて減衰させる古典的なアルゴリズムで波を広げ、高さの傾きを明るさにして水色の水面として描いて。カーソルでなでると小さな波、クリックで大きな波紋、ときどき自動で雨粒が落ちるようにして。' },
      { name:'万華鏡ペン', en:'Kaleidoscope drawing', h:230, tags:['Canvas','お絵かき'],
        demo:'<div class="pl" style="background:#0f172a"><span class="pl-hint" style="color:#94a3b8">ドラッグで描く（放っておくと自動で描く）</span></div>',
        init:(el) => { const host = $(el, '.pl'), { c, ctx, w, h } = cv(host, true), cx = w / 2, cy = h / 2, K = 8; c.style.cursor = 'crosshair';
          let down = false, lx = 0, ly = 0, hue = 0, idle = 3, at = 0, al = null;
          const seg = (x1, y1, x2, y2) => { ctx.save(); ctx.translate(cx, cy); ctx.strokeStyle = `hsl(${hue} 90% 62%)`; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
            for (let k = 0; k < K; k++){ ctx.rotate(Math.PI * 2 / K); for (const m of [1, -1]){ ctx.save(); ctx.scale(1, m); ctx.beginPath(); ctx.moveTo(x1 - cx, y1 - cy); ctx.lineTo(x2 - cx, y2 - cy); ctx.stroke(); ctx.restore(); } }
            ctx.restore(); hue = (hue + 1.2) % 360; };
          c.addEventListener('pointerdown', (e) => { const p = local(host, e); down = true; lx = p.x; ly = p.y; idle = 0; c.setPointerCapture(e.pointerId); });
          c.addEventListener('pointermove', (e) => { if (!down) return; const p = local(host, e); seg(lx, ly, p.x, p.y); lx = p.x; ly = p.y; });
          ['pointerup', 'pointercancel'].forEach(t => c.addEventListener(t, () => { down = false; }));
          const stop = VD.loop(el, (dt) => { ctx.fillStyle = 'rgba(15,23,42,.018)'; ctx.fillRect(0, 0, w, h);
            if (down){ idle = 0; return; } idle += dt; if (idle < 2.5){ al = null; return; }
            at += dt; const r = Math.min(w, h) * .42, p = [cx + r * Math.sin(at * 1.3) * Math.cos(at * .37), cy + r * Math.sin(at * 1.9 + 1) * Math.cos(at * .23)];
            if (al) seg(al[0], al[1], p[0], p[1]); al = p; });
          return stop; },
        desc:'1本の線を<b>8方向に回転＋鏡写し</b>して16本同時に描くので、何を描いてもきれいな模様になる。色相は描くたびに少しずつ変わり、古い線はゆっくり暗く消えていく。',
        prompt:'Canvasで万華鏡のようなお絵かきを作って。ドラッグした線を、画面中央を中心に45度ずつ回転させた8方向と、その鏡写しの合計16本に同時に描き、線の色は描くたびに色相を少しずつ変えて。毎フレーム背景色を透明度0.018で塗り重ねて古い線をゆっくり消し、2.5秒操作がないときは自動で模様を描き続けるようにして。' },
    ]},
  ],
});
})();
