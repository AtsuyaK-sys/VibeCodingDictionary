/* ゲーム制作辞典 — Canvas のライブデモ */
(function(){
const $ = (el, s) => el.querySelector(s), $$ = (el, s) => [...el.querySelectorAll(s)];
const BG = '#151827', FG = '#e8eaf6', DIM = '#2a2f45';
const ACC = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#2f9e44';
const rnd = (a, b) => a + Math.random() * (b - a);
function mouse(el){ const m = { x:-1, y:-1, down:false, clicked:false, inside:false }; el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); m.x = e.clientX - r.left; m.y = e.clientY - r.top; m.inside = true; }); el.addEventListener('pointerleave', () => m.inside = false); el.addEventListener('pointerdown', e => { const r = el.getBoundingClientRect(); m.x = e.clientX - r.left; m.y = e.clientY - r.top; m.down = true; m.clicked = true; }); el.addEventListener('pointerup', () => m.down = false); return m; }
function hud(ctx, t, x, y){ ctx.fillStyle = 'rgba(232,234,246,.65)'; ctx.font = '600 11px "JetBrains Mono", monospace'; ctx.fillText(t, x || 8, y || 16); }

/* ---- デモ群 ---- */
const D = {
  jump(el){ const { ctx, w, h } = VD.canvas(el); const m = mouse(el); const G = 1900, J = -620, ground = h - 24; const p = { x:w * .3, y:ground - 22, vy:0, vx:90, on:true, sq:1 }; let idle = 0, coyote = 0; const plats = [[w * .55, h - 70, 70], [w * .75, h - 110, 60]];
    el.tabIndex = 0; const jump = () => { if (p.on || coyote > 0){ p.vy = J; p.on = false; coyote = 0; p.sq = .7; } }; el.addEventListener('pointerdown', () => { idle = 0; jump(); }); el.addEventListener('keydown', e => { if (e.code === 'Space'){ e.preventDefault(); idle = 0; jump(); } });
    return VD.loop(el, (dt) => { idle += dt; if (idle > 2.5 && p.on && Math.random() < .02) jump(); if (!m.down && p.vy < 0 && idle < 2.5) p.vy += G * dt * 1.2; p.vy += G * dt; p.x += p.vx * dt; if (p.x < 20 || p.x > w - 40) p.vx *= -1; const prevY = p.y; p.y += p.vy * dt; const wasOn = p.on; p.on = false;
      if (p.y + 22 >= ground){ p.y = ground - 22; if (p.vy > 300) p.sq = 1.3; p.vy = 0; p.on = true; }
      plats.forEach(([px, py, pw]) => { if (p.vy >= 0 && prevY + 22 <= py && p.y + 22 >= py && p.x + 18 > px && p.x < px + pw){ p.y = py - 22; p.vy = 0; p.on = true; } });
      if (wasOn && !p.on) coyote = .1; else coyote -= dt; p.sq += (1 - p.sq) * Math.min(1, dt * 12);
      ctx.fillStyle = BG; ctx.fillRect(0, 0, w, h); ctx.fillStyle = DIM; ctx.fillRect(0, ground, w, h - ground); plats.forEach(([px, py, pw]) => ctx.fillRect(px, py, pw, 8));
      ctx.fillStyle = ACC(); const sw = 18 * (2 - p.sq), sh = 22 * p.sq; ctx.fillRect(p.x + 9 - sw / 2, p.y + 22 - sh, sw, sh); hud(ctx, `vy=${Math.round(p.vy)}  ${p.on ? '接地' : '空中'}   クリック/Spaceでジャンプ`); }); },

  aabb(el){ const { ctx, w, h } = VD.canvas(el); let t = 0; return VD.loop(el, (dt) => { t += dt; const a = { x:w / 2 - 80 + Math.sin(t * 1.3) * (w * .28), y:h / 2 - 30, w:70, h:50 }, b = { x:w / 2 - 25, y:h / 2 - 25 + Math.sin(t * 1.7) * 45, w:50, h:50 }; const hit = a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
      ctx.fillStyle = BG; ctx.fillRect(0, 0, w, h); ctx.lineWidth = 2; [a, b].forEach((r, i) => { ctx.fillStyle = hit ? 'rgba(239,68,68,.35)' : (i ? 'rgba(96,165,250,.3)' : 'rgba(74,222,128,.3)'); ctx.strokeStyle = hit ? '#ef4444' : (i ? '#60a5fa' : '#4ade80'); ctx.fillRect(r.x, r.y, r.w, r.h); ctx.strokeRect(r.x, r.y, r.w, r.h); });
      if (hit){ const ix = Math.max(a.x, b.x), iy = Math.max(a.y, b.y), iw = Math.min(a.x + a.w, b.x + b.w) - ix, ih = Math.min(a.y + a.h, b.y + b.h) - iy; ctx.fillStyle = '#fbbf24'; ctx.fillRect(ix, iy, iw, ih); }
      const c1 = { x:w * .82 + Math.cos(t) * 30, y:h / 2 + Math.sin(t * 2) * 30, r:16 }, c2 = { x:w * .82, y:h / 2, r:20 }; const ch = Math.hypot(c1.x - c2.x, c1.y - c2.y) < c1.r + c2.r; [c1, c2].forEach(c => { ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, 7); ctx.strokeStyle = ch ? '#ef4444' : '#a78bfa'; ctx.stroke(); }); hud(ctx, `矩形(AABB): ${hit ? '衝突！' : 'なし'}   円: ${ch ? '衝突！' : 'なし'}`); }); },

  bounce(el){ const { ctx, w, h } = VD.canvas(el); const m = mouse(el); const b = { x:w / 2, y:h / 2, vx:220, vy:-200, r:7 }; const pad = { x:w / 2, w:80 }; const bricks = []; const reset = () => { bricks.length = 0; for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) bricks.push({ x:12 + c * (w - 24) / 8, y:20 + r * 16, w:(w - 24) / 8 - 4, h:11, a:true }); }; reset();
    return VD.loop(el, (dt) => { pad.x += ((m.inside ? m.x : b.x) - pad.x) * Math.min(1, dt * 10); b.x += b.vx * dt; b.y += b.vy * dt; if (b.x < b.r || b.x > w - b.r){ b.vx *= -1; b.x = Math.max(b.r, Math.min(w - b.r, b.x)); } if (b.y < b.r){ b.vy = Math.abs(b.vy); } if (b.y > h - 18 - b.r && Math.abs(b.x - pad.x) < pad.w / 2 && b.vy > 0){ b.vy = -Math.abs(b.vy); b.vx = (b.x - pad.x) * 6; } if (b.y > h + 20){ b.x = w / 2; b.y = h / 2; b.vy = -200; }
      bricks.forEach(k => { if (k.a && b.x > k.x && b.x < k.x + k.w && b.y - b.r < k.y + k.h && b.y + b.r > k.y){ k.a = false; b.vy *= -1; } }); if (bricks.every(k => !k.a)) reset();
      ctx.fillStyle = BG; ctx.fillRect(0, 0, w, h); bricks.forEach((k, i) => { if (k.a){ ctx.fillStyle = ['#f87171', '#fbbf24', '#4ade80'][Math.floor(i / 8)]; ctx.fillRect(k.x, k.y, k.w, k.h); } }); ctx.fillStyle = FG; ctx.fillRect(pad.x - pad.w / 2, h - 18, pad.w, 8); ctx.fillStyle = ACC(); ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.fill(); }); },

  homing(el){ const { ctx, w, h } = VD.canvas(el); const m = mouse(el); const es = Array.from({ length:7 }, () => ({ x:rnd(0, w), y:rnd(0, h), vx:0, vy:0 })); let t = 0;
    return VD.loop(el, (dt) => { t += dt; const tx = m.inside ? m.x : w / 2 + Math.cos(t) * w * .3, ty = m.inside ? m.y : h / 2 + Math.sin(t * 1.4) * h * .3; es.forEach((e, i) => { const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy) || 1; e.vx += dx / d * 500 * dt; e.vy += dy / d * 500 * dt; es.forEach((o, j) => { if (i !== j){ const sx = e.x - o.x, sy = e.y - o.y, sd = Math.hypot(sx, sy); if (sd < 26 && sd > 0){ e.vx += sx / sd * 300 * dt; e.vy += sy / sd * 300 * dt; } } }); const sp = Math.hypot(e.vx, e.vy), max = 140; if (sp > max){ e.vx *= max / sp; e.vy *= max / sp; } e.x += e.vx * dt; e.y += e.vy * dt; });
      ctx.fillStyle = BG; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(tx, ty, 7, 0, 7); ctx.fill(); es.forEach(e => { const a = Math.atan2(e.vy, e.vx); ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(a); ctx.fillStyle = '#f87171'; ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-7, -6); ctx.lineTo(-7, 6); ctx.fill(); ctx.restore(); }); hud(ctx, 'マウスを動かすと敵が追ってくる（追尾＋分離）'); }); },

  shoot(el){ const { ctx, w, h } = VD.canvas(el); const m = mouse(el); const bs = []; let cd = 0, t = 0; const c = { x:w / 2, y:h / 2 };
    return VD.loop(el, (dt) => { t += dt; cd -= dt; const tx = m.inside ? m.x : c.x + Math.cos(t * .8) * 100, ty = m.inside ? m.y : c.y + Math.sin(t * .8) * 100; const a = Math.atan2(ty - c.y, tx - c.x); if (cd <= 0){ cd = .12; bs.push({ x:c.x + Math.cos(a) * 20, y:c.y + Math.sin(a) * 20, vx:Math.cos(a + rnd(-.06, .06)) * 420, vy:Math.sin(a + rnd(-.06, .06)) * 420 }); } for (let i = bs.length - 1; i >= 0; i--){ const b = bs[i]; b.x += b.vx * dt; b.y += b.vy * dt; if (b.x < -10 || b.x > w + 10 || b.y < -10 || b.y > h + 10) bs.splice(i, 1); }
      ctx.fillStyle = BG; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#fde68a'; bs.forEach(b => ctx.fillRect(b.x - 2, b.y - 2, 4, 4)); ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(a); ctx.fillStyle = ACC(); ctx.fillRect(0, -4, 22, 8); ctx.beginPath(); ctx.arc(0, 0, 12, 0, 7); ctx.fill(); ctx.restore(); hud(ctx, `弾の数: ${bs.length}（画面外に出たら削除）`); }); },

  spawn(el){ const { ctx, w, h } = VD.canvas(el); const es = []; let t = 0, wave = 1, next = 0, left = 6; const c = { x:w / 2, y:h / 2 };
    return VD.loop(el, (dt) => { t += dt; next -= dt; if (left > 0 && next <= 0){ next = Math.max(.15, .7 - wave * .08); left--; const s = Math.floor(rnd(0, 4)); const p = [[rnd(0, w), -10], [w + 10, rnd(0, h)], [rnd(0, w), h + 10], [-10, rnd(0, h)]][s]; es.push({ x:p[0], y:p[1], sp:40 + wave * 12 + rnd(0, 20) }); } if (left === 0 && es.length === 0){ wave++; left = 4 + wave * 2; next = 1; }
      for (let i = es.length - 1; i >= 0; i--){ const e = es[i], dx = c.x - e.x, dy = c.y - e.y, d = Math.hypot(dx, dy); if (d < 16){ es.splice(i, 1); continue; } e.x += dx / d * e.sp * dt; e.y += dy / d * e.sp * dt; }
      ctx.fillStyle = BG; ctx.fillRect(0, 0, w, h); ctx.fillStyle = ACC(); ctx.beginPath(); ctx.arc(c.x, c.y, 14, 0, 7); ctx.fill(); ctx.fillStyle = '#f87171'; es.forEach(e => ctx.fillRect(e.x - 5, e.y - 5, 10, 10)); hud(ctx, `WAVE ${wave}  残り出現 ${left}  画面上 ${es.length}`); }); },

  astar(el){ const { ctx, w, h } = VD.canvas(el); const m = mouse(el); const C = 20, cols = Math.floor(w / C), rows = Math.floor(h / C); const ox = (w - cols * C) / 2, oy = (h - rows * C) / 2; let grid; const start = [1, Math.floor(rows / 2)]; let goal = [cols - 2, Math.floor(rows / 2)], path = [];
    const gen = () => { grid = Array.from({ length:rows }, (_, y) => Array.from({ length:cols }, (_, x) => Math.random() < .26 && !(x === start[0] && y === start[1]))); };
    const solve = () => { const key = (p) => p[0] + ',' + p[1]; const open = [{ p:start, g:0, f:0 }], came = {}, gs = { [key(start)]:0 }; while (open.length){ open.sort((a, b) => a.f - b.f); const cur = open.shift(); if (cur.p[0] === goal[0] && cur.p[1] === goal[1]){ const out = [cur.p]; let k = key(cur.p); while (came[k]){ out.unshift(came[k]); k = key(came[k]); } return out; } [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(d => { const n = [cur.p[0] + d[0], cur.p[1] + d[1]]; if (n[0] < 0 || n[1] < 0 || n[0] >= cols || n[1] >= rows || grid[n[1]][n[0]]) return; const g = cur.g + 1; if (g < (gs[key(n)] ?? Infinity)){ gs[key(n)] = g; came[key(n)] = cur.p; open.push({ p:n, g, f:g + Math.abs(n[0] - goal[0]) + Math.abs(n[1] - goal[1]) }); } }); } return []; };
    gen(); grid[goal[1]][goal[0]] = false; path = solve(); let t = 0;
    el.addEventListener('pointerdown', () => { const gx = Math.floor((m.x - ox) / C), gy = Math.floor((m.y - oy) / C); if (gx >= 0 && gy >= 0 && gx < cols && gy < rows){ grid[gy][gx] = false; goal = [gx, gy]; path = solve(); t = 0; } });
    return VD.loop(el, (dt) => { t += dt; ctx.fillStyle = BG; ctx.fillRect(0, 0, w, h); for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++){ ctx.fillStyle = grid[y][x] ? '#3b4262' : '#1d2133'; ctx.fillRect(ox + x * C + 1, oy + y * C + 1, C - 2, C - 2); } const n = Math.min(path.length, Math.floor(t * 18)); ctx.fillStyle = ACC(); for (let i = 0; i < n; i++) ctx.fillRect(ox + path[i][0] * C + 5, oy + path[i][1] * C + 5, C - 10, C - 10); ctx.fillStyle = '#60a5fa'; ctx.fillRect(ox + start[0] * C + 3, oy + start[1] * C + 3, C - 6, C - 6); ctx.fillStyle = '#fbbf24'; ctx.fillRect(ox + goal[0] * C + 3, oy + goal[1] * C + 3, C - 6, C - 6); hud(ctx, path.length ? `最短経路 ${path.length - 1}歩　（クリックでゴール変更）` : '到達できません（クリックでゴール変更）'); }); },

  terrain(el){ const { ctx, w, h } = VD.canvas(el); const seed = Math.random() * 1000; const hash = (n) => { const s = Math.sin(n * 127.1 + seed) * 43758.5453; return s - Math.floor(s); }; const vn = (x) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash(i) * (1 - u) + hash(i + 1) * u; }; const fbm = (x) => vn(x) * .6 + vn(x * 2.1) * .25 + vn(x * 4.3) * .15; let off = 0;
    return VD.loop(el, (dt) => { off += dt * 60; ctx.fillStyle = '#0e1530'; ctx.fillRect(0, 0, w, h); const layer = (sp, sc, base, amp, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, h); for (let x = 0; x <= w; x += 4){ ctx.lineTo(x, base - fbm((x + off * sp) / sc) * amp); } ctx.lineTo(w, h); ctx.fill(); }; layer(.3, 160, h * .55, h * .35, '#28345e'); layer(.6, 110, h * .75, h * .4, '#3a5a40'); layer(1, 70, h * .95, h * .3, '#588157'); hud(ctx, 'ノイズ関数で地形を自動生成（毎回ちがう形）'); }); },

  parallax(el){ const { ctx, w, h } = VD.canvas(el); let x = 0; const stars = Array.from({ length:40 }, () => [rnd(0, w), rnd(0, h * .5)]);
    const hills = (sp, base, amp, per, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, h); for (let i = 0; i <= w; i += 4) ctx.lineTo(i, base - Math.sin((i + x * sp) / per) * amp - Math.sin((i + x * sp) / (per * .37)) * amp * .3); ctx.lineTo(w, h); ctx.fill(); };
    return VD.loop(el, (dt) => { x += dt * 120; const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#1e1b4b'); g.addColorStop(1, '#f472b6'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#fff'; stars.forEach(s => ctx.fillRect((s[0] - x * .02 + w) % w, s[1], 1.5, 1.5)); ctx.fillStyle = '#fde68a'; ctx.beginPath(); ctx.arc(w * .75, h * .35, 22, 0, 7); ctx.fill(); hills(.15, h * .62, 18, 90, '#6d28d9'); hills(.4, h * .75, 16, 60, '#4c1d95'); hills(1, h * .9, 12, 40, '#2e1065'); ctx.fillStyle = ACC(); ctx.fillRect(w * .3, h * .9 - 30 + Math.abs(Math.sin(x / 30)) * -6, 16, 22); hud(ctx, '奥ほどゆっくり：空0.02 / 山0.15 / 丘0.4 / 手前1.0'); }); },

  camera(el){ const { ctx, w, h } = VD.canvas(el); const W = w * 3, Hh = h * 2; let t = 0; const cam = { x:0, y:0 }; const trees = Array.from({ length:60 }, () => [rnd(0, W), rnd(0, Hh)]);
    return VD.loop(el, (dt) => { t += dt; const p = { x:W / 2 + Math.sin(t * .7) * W * .4, y:Hh / 2 + Math.sin(t * 1.3) * Hh * .35 }; const tx = p.x - w / 2, ty = p.y - h / 2; cam.x += (tx - cam.x) * Math.min(1, dt * 3); cam.y += (ty - cam.y) * Math.min(1, dt * 3);
      ctx.fillStyle = '#1a2e1f'; ctx.fillRect(0, 0, w, h); ctx.save(); ctx.translate(-cam.x, -cam.y); ctx.strokeStyle = '#24402b'; for (let gx = 0; gx < W; gx += 40){ ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, Hh); ctx.stroke(); } for (let gy = 0; gy < Hh; gy += 40){ ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); } ctx.fillStyle = '#4ade80'; trees.forEach(tr => { ctx.beginPath(); ctx.arc(tr[0], tr[1], 7, 0, 7); ctx.fill(); }); ctx.fillStyle = ACC(); ctx.fillRect(p.x - 8, p.y - 8, 16, 16); ctx.restore(); ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.setLineDash([4, 4]); ctx.strokeRect(w / 2 - 40, h / 2 - 25, 80, 50); ctx.setLineDash([]); hud(ctx, 'カメラが少し遅れて追いかける（lerp）'); }); },

  particles(el){ const { ctx, w, h } = VD.canvas(el); const m = mouse(el); const ps = []; let t = 0; const burst = (x, y) => { const cols = ['#fbbf24', '#f87171', '#60a5fa', '#4ade80', '#f472b6']; for (let i = 0; i < 40; i++){ const a = rnd(0, Math.PI * 2), s = rnd(60, 280); ps.push({ x, y, vx:Math.cos(a) * s, vy:Math.sin(a) * s - 80, life:rnd(.5, 1.1), max:1, c:cols[i % 5], r:rnd(2, 4.5) }); } };
    el.addEventListener('pointerdown', () => burst(m.x, m.y));
    return VD.loop(el, (dt) => { t += dt; if (t > .9){ t = 0; burst(rnd(w * .2, w * .8), rnd(h * .3, h * .7)); } ctx.fillStyle = 'rgba(21,24,39,.35)'; ctx.fillRect(0, 0, w, h); for (let i = ps.length - 1; i >= 0; i--){ const p = ps[i]; p.vy += 420 * dt; p.vx *= .985; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; if (p.life <= 0){ ps.splice(i, 1); continue; } ctx.globalAlpha = Math.min(1, p.life * 2); ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * Math.min(1, p.life * 2), 0, 7); ctx.fill(); } ctx.globalAlpha = 1; hud(ctx, `パーティクル数: ${ps.length}（クリックで爆発）`); }); },

  // 手触り演出：オン/オフを切り替えて比べる
  juice(el){
    el.innerHTML = '<div class="gm-juice"><div class="cv"></div><div class="opts">' + [['shake', '画面揺れ'], ['stop', 'ヒットストップ'], ['flash', '白フラッシュ'], ['parts', 'パーティクル'], ['nums', 'ダメージ数字'], ['knock', 'ノックバック'], ['squash', '伸び縮み'], ['sound', '効果音']].map((o, i) => `<label><input type="checkbox" data-k="${o[0]}" ${o[0] !== 'sound' ? 'checked' : ''}>${o[1]}</label>`).join('') + '<button class="all">全部OFF</button></div></div>';
    const cv = $(el, '.cv'); const { ctx, w, h } = VD.canvas(cv); const opt = {}; $$(el, 'input').forEach(i => { opt[i.dataset.k] = i.checked; i.onchange = () => opt[i.dataset.k] = i.checked; }); $(el, '.all').onclick = () => { const on = !$$(el, 'input').some(i => i.checked); $$(el, 'input').forEach(i => { i.checked = on && i.dataset.k !== 'sound'; opt[i.dataset.k] = i.checked; }); $(el, '.all').textContent = on ? '全部OFF' : '全部ON'; };
    const e = { x:w * .62, y:h * .6, kx:0, flash:0, sq:1, hp:100 }; const pl = { x:w * .3, y:h * .6, atk:0 }; let shake = 0, stop = 0, t = 0; const ps = [], nums = []; let ac;
    const hit = () => { pl.atk = .15; if (opt.stop) stop = .07; if (opt.shake) shake = .25; if (opt.flash) e.flash = .1; if (opt.knock) e.kx = 26; if (opt.squash) e.sq = .65; const dmg = Math.floor(rnd(8, 24)); e.hp -= dmg; if (e.hp <= 0) e.hp = 100; if (opt.nums) nums.push({ x:e.x + rnd(-10, 10), y:e.y - 40, v:dmg, life:.8 }); if (opt.parts) for (let i = 0; i < 18; i++){ const a = rnd(-Math.PI * .9, -Math.PI * .1) + Math.PI * (Math.random() < .5 ? 0 : 0); ps.push({ x:e.x - 10, y:e.y - 14, vx:Math.cos(a) * rnd(80, 260) + 60, vy:Math.sin(a) * rnd(80, 260), life:rnd(.3, .6) }); } if (opt.sound){ try { ac = ac || new AudioContext(); const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(180, ac.currentTime); o.frequency.exponentialRampToValueAtTime(50, ac.currentTime + .12); g.gain.setValueAtTime(.4, ac.currentTime); g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + .15); o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + .16); } catch(_){} } };
    cv.addEventListener('pointerdown', hit);
    return VD.loop(cv, (dt) => { t += dt; if (t > 1.1){ t = 0; hit(); } if (stop > 0){ stop -= dt; return; } shake = Math.max(0, shake - dt); e.flash = Math.max(0, e.flash - dt); e.kx *= Math.pow(.0001, dt); e.sq += (1 - e.sq) * Math.min(1, dt * 14); pl.atk = Math.max(0, pl.atk - dt);
      ctx.save(); if (shake > 0){ const s = shake * 30; ctx.translate(rnd(-s, s), rnd(-s, s)); } ctx.fillStyle = BG; ctx.fillRect(-20, -20, w + 40, h + 40); ctx.fillStyle = DIM; ctx.fillRect(-20, h * .6 + 22, w + 40, 60);
      ctx.fillStyle = ACC(); const lunge = pl.atk > 0 ? 14 : 0; ctx.fillRect(pl.x - 14 + lunge, pl.y - 22, 28, 44); if (pl.atk > 0){ ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(pl.x + 22, pl.y - 6, 26, -1.2, .9); ctx.stroke(); }
      const ew = 34 * (2 - e.sq), eh = 44 * e.sq; ctx.fillStyle = e.flash > 0 ? '#ffffff' : '#f87171'; ctx.fillRect(e.x + e.kx - ew / 2, e.y + 22 - eh, ew, eh);
      ctx.fillStyle = '#333a55'; ctx.fillRect(e.x - 30, e.y - 44, 60, 6); ctx.fillStyle = '#4ade80'; ctx.fillRect(e.x - 30, e.y - 44, 60 * e.hp / 100, 6);
      for (let i = ps.length - 1; i >= 0; i--){ const p = ps[i]; p.vy += 600 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; if (p.life <= 0){ ps.splice(i, 1); continue; } ctx.fillStyle = '#fde68a'; ctx.fillRect(p.x, p.y, 3, 3); }
      for (let i = nums.length - 1; i >= 0; i--){ const n = nums[i]; n.life -= dt; n.y -= 40 * dt; if (n.life <= 0){ nums.splice(i, 1); continue; } ctx.globalAlpha = Math.min(1, n.life * 2); ctx.font = `900 ${18 + (n.life > .65 ? (n.life - .65) * 60 : 0)}px "JetBrains Mono", monospace`; ctx.fillStyle = '#fff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.strokeText(n.v, n.x, n.y); ctx.fillText(n.v, n.x, n.y); ctx.globalAlpha = 1; }
      if (e.flash > 0 && opt.flash){ ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(0, 0, w, h); } ctx.restore(); hud(ctx, 'クリックで攻撃 → 右のチェックで演出を比較'); });
  },
};
const g = (k, o) => Object.assign({ stage:'free', h:200, init:(el) => D[k](el), tags:o.tags || [] }, o);

TABS.push({
  id:'genre', label:'ジャンル', icon:'◆',
  intro:'ゲームのジャンルと、その<b>核になる仕組み（コアループ）</b>。AIにゲームを頼むときは「ジャンル名＋操作方法＋勝ち負けの条件＋1プレイの長さ」を伝えると、遊べるものが一発で出てきやすくなります。',
  sections:[
    { title:'アクション・シューティング', layout:'rows', items:[
      { name:'プラットフォーマー（横スクロールアクション）', en:'Platformer', tags:['ジャンプ','定番'], desc:'足場から足場へジャンプして進む。コア：走る・跳ぶ・敵を避ける／踏む・ゴールへ。操作感（ジャンプの気持ちよさ）が命。', prompt:'1ファイルのHTMLで横スクロールのプラットフォーマーを作って。←→で移動、Spaceでジャンプ（長押しで高く）、足場・トゲ・コイン・ゴール旗、3ステージ。コヨーテタイムとジャンプ先行入力も入れて。' },
      { name:'シューティング（STG）', en:'Shoot \'em up', tags:['弾幕'], desc:'自機を動かして敵を撃つ。縦スクロール・横スクロール・全方向（ツインスティック）など。弾幕系は敵の弾を避けるのが主役。', prompt:'縦スクロールシューティングをCanvasで作って。自機は矢印キー移動・Zで連射、敵は3種類の動き、ボス戦、パワーアップアイテム、残機とスコア表示。' },
      { name:'ヴァンパイアサバイバー系（バレットヘブン）', en:'Survivors-like / Bullet Heaven', tags:['流行'], desc:'移動だけ操作し、攻撃は自動。押し寄せる敵の大群を倒して経験値を集め、レベルアップで武器を選んで強くなる。中毒性が高い。', prompt:'Vampire Survivors風のゲームを作って。WASDで移動、攻撃は自動、敵は画面外から増え続け、倒すと経験値ジェム。レベルアップで3つの強化から1つ選ぶ。10分生き残ればクリア。' },
      { name:'ローグライク／ローグライト', en:'Roguelike / Roguelite', tags:['ランダム生成','やり込み'], desc:'毎回ランダムに生成されるダンジョンに挑み、死んだら最初から。ローグライトは死んでも一部の強化が引き継がれる。', prompt:'ターン制のローグライクを作って。ランダム生成のダンジョン（部屋と通路）、敵・アイテム・階段、死んだらやり直し。グラフィックは絵文字で。' },
      { name:'格闘・アクションRPG', en:'Fighting / Action RPG', desc:'攻撃・回避・コンボ。「手触り」（ヒットストップ・ノックバック）が重要。「手触り演出」タブ参照。' },
    ]},
    { title:'パズル・カジュアル', layout:'rows', items:[
      { name:'落ち物パズル', en:'Falling Block Puzzle', tags:['テトリス系','ぷよ系'], desc:'落ちてくるブロックを並べて消す。列を揃えて消す型と、同じ色を4つつなげて消す型が有名。', prompt:'落ち物パズルを作って。7種類のブロック、回転・ハードドロップ、ホールド、次のブロック表示、ライン消去でスコアとレベルアップ（落下速度アップ）。' },
      { name:'マッチ3', en:'Match-3', desc:'隣のピースと入れ替えて3つ以上揃えて消す。連鎖・特殊ピースで爽快感を出す。', prompt:'8×8盤面のマッチ3パズルを作って。隣と入れ替えて3つ揃えば消え、上から補充、連鎖ボーナス、30手でスコアを競う。消えるときにパーティクル。' },
      { name:'2048・スライド系', en:'2048-like', desc:'同じ数字を合体させて大きな数字を目指す。シンプルで実装しやすく、最初のゲーム制作に最適。', prompt:'2048を作って。矢印キーとスワイプで操作、タイルが動くアニメーション、ベストスコアをlocalStorageに保存。' },
      { name:'物理パズル', en:'Physics Puzzle', tags:['Matter.js'], desc:'物理エンジンで物を積む・転がす・飛ばす（スイカゲーム型、Angry Birds型）。', prompt:'Matter.jsでスイカゲーム風のゲームを作って。上から果物を落とし、同じ果物がぶつかると1段階大きい果物に進化、箱からあふれたらゲームオーバー。' },
      { name:'ハイパーカジュアル', en:'Hyper-casual', desc:'タップだけ・数秒で理解できる超シンプルなゲーム。フラッピー系、スタック系、ランナー系。', prompt:'タップでジャンプして土管の隙間を抜けていくフラッピー系のゲームを作って。スマホ対応、スコアとベストスコア。' },
      { name:'クリッカー・放置ゲーム', en:'Clicker / Idle', tags:['数字が増える快感'], desc:'クリックや時間経過で資源が増え、施設を買って自動化していく。数字のインフレと強化の選択が楽しさ。', prompt:'クッキークリッカー風の放置ゲームを作って。クリックで資源、5種類の施設購入で自動生産、価格は購入ごとに1.15倍、オフライン中の生産も計算、localStorageに保存。' },
    ]},
    { title:'その他のジャンル', layout:'rows', items:[
      { name:'RPG', en:'Role-Playing Game', desc:'キャラクターを育て、物語を進める。ターン制バトル、装備、レベル、会話イベント。データ設計（ステータス・アイテム表）が大事。', prompt:'ブラウザで遊べる小さなターン制RPGを作って。フィールド移動（タイルマップ）、エンカウント、たたかう/まほう/にげる、レベルアップ、ボス1体。' },
      { name:'タワーディフェンス', en:'Tower Defense', desc:'決まった道を進んでくる敵を、道沿いに置いたタワーで倒す。配置と強化の戦略性。', prompt:'タワーディフェンスを作って。固定のルートを敵がウェーブで進み、3種類のタワー（単体・範囲・減速）をお金で設置・強化、20ウェーブ耐えたら勝ち。' },
      { name:'リズムゲーム', en:'Rhythm Game', desc:'音楽に合わせて流れてくるノーツをタイミングよく押す。判定（Perfect/Good/Miss）と音ズレ対策が肝。', prompt:'4レーンのリズムゲームを作って。D/F/J/Kキーで判定、Perfect/Great/Missの判定表示、コンボ数、譜面はJSONで。Web AudioのcurrentTimeで時間管理して音ズレしないように。' },
      { name:'ノベル・アドベンチャー', en:'Visual Novel / ADV', desc:'背景・立ち絵・文章で物語を読み進める。選択肢で分岐。シナリオをデータ（JSON/Markdown）として持つと書きやすい。', prompt:'ビジュアルノベルのエンジンを作って。背景・キャラ立ち絵・名前付きの文章ウィンドウ（クリックで次へ、タイプライター表示）、選択肢による分岐、セーブ/ロード。シナリオはJSONで。' },
      { name:'脱出ゲーム', en:'Escape Room', desc:'画面内を調べてアイテムを集め、組み合わせて謎を解いて脱出する。', prompt:'ポイント&クリックの脱出ゲームを作って。部屋を4方向に見回せて、アイテム入手・使用、暗証番号の謎、クリアで脱出演出。' },
      { name:'カードゲーム・デッキ構築', en:'Card / Deckbuilder', desc:'カードを引いて使う。デッキ構築型（Slay the Spire系）は戦いながらカードを集めて強くする。', prompt:'デッキ構築型のカードバトルを作って。手札5枚、エネルギー3、攻撃/防御/スキルのカード、敵の行動予告、勝利後に3枚から1枚を報酬として選ぶ。' },
      { name:'レース', en:'Racing', desc:'車や乗り物でコースを走る。疑似3D（昔のアウトラン風）なら2D Canvasでも作れる。' },
      { name:'クイズ・タイピング・知育', en:'Quiz / Typing / Educational', desc:'作りやすく実用的。問題データを差し替えるだけで量産できる。', prompt:'日本語のタイピングゲームを作って。ローマ字入力（しゃ=sya/sha両対応）、制限時間60秒、正確さとWPMを表示。' },
    ]},
  ]
});

TABS.push({
  id:'mech', label:'メカニクス', icon:'⚙',
  intro:'ゲームを動かす<b>仕組み（プログラムの部品）</b>。見本はCanvasで実際に動いていて、多くはマウスやクリックで操作できます。名前を知っているとAIに正確に頼めます。 ベクトル・重力・当たり判定の計算を基礎から触るなら <a href="motion-math.html#collision">動きの計算辞典</a> へ。',
  sections:[
    { title:'動き・物理', items:[
      g('jump', { name:'重力とジャンプ', en:'Gravity / Jump / Coyote Time', tags:['物理','定番'], desc:'毎フレーム下向きの速度を足す（重力）、ジャンプは上向きの速度を一瞬与えるだけ。<b>押す長さでジャンプの高さが変わる</b>・<b>足場を離れた直後もジャンプできる（コヨーテタイム）</b>と気持ちよくなる。着地の伸び縮みも入れている。', prompt:'プラットフォーマーのジャンプを気持ちよくして。重力2000、ジャンプ初速-650、ボタンを離したら上昇を弱める（可変ジャンプ）、足場を離れて0.1秒以内はジャンプ可能（コヨーテタイム）、着地0.1秒前の入力も受け付ける（ジャンプバッファ）。',
        code:'vy += GRAVITY * dt;        // 重力\ny  += vy * dt;\nif (y >= ground) { y = ground; vy = 0; onGround = true; }\nif (jumpPressed && (onGround || coyote > 0)) vy = JUMP_VELOCITY; // 上向き（マイナス）' }),
      g('bounce', { name:'反射（跳ね返り）', en:'Reflection / Bounce', tags:['ブロック崩し'], desc:'壁に当たったら速度の向きを反転させる。パドルの当たった位置で反射角を変えると狙えるようになる。見本はマウスでパドルを操作できる。', prompt:'ブロック崩しを作って。パドルの当たった位置で反射角が変わり、ブロックを壊すとパーティクル、全部壊したら次のステージ。',
        code:'if (x < r || x > width - r) vx = -vx;   // 左右の壁\nif (y < r) vy = -vy;                    // 天井\n// パドル: vx = (ballX - paddleX) * 6;  当たった位置で角度を変える' }),
      g('homing', { name:'追尾・群れ', en:'Seek / Steering / Separation', tags:['敵AI'], desc:'目標の方向へ加速し、最高速度で制限する（ステアリング）。仲間と近づきすぎたら離れる「分離」を加えると、重ならずに自然な群れになる。', prompt:'敵が常にプレイヤーを追いかけてくるようにして。最高速度を制限し、敵同士は重ならないように分離（separation）の力を加えて。' }),
      g('shoot', { name:'弾の発射', en:'Projectiles / Bullets', tags:['シューティング'], desc:'向きの角度から速度を計算して弾を生成し、毎フレーム移動。<b>画面外に出た弾は配列から削除</b>しないと重くなる。たくさん出すならオブジェクトプール。', prompt:'マウスの方向に向く砲台から0.12秒ごとに弾を撃ち、少しだけ角度をばらつかせて、画面外に出た弾は削除して。弾はオブジェクトプールで再利用して。',
        code:'const a = Math.atan2(mouseY - y, mouseX - x);\nbullets.push({ x, y, vx: Math.cos(a) * SPEED, vy: Math.sin(a) * SPEED });' }),
    ]},
    { title:'判定・生成・探索', items:[
      g('aabb', { name:'当たり判定', en:'Collision Detection: AABB / Circle', tags:['必須'], desc:'<b>矩形（AABB）</b>＝xとyの範囲が両方重なっていれば衝突。<b>円</b>＝中心間の距離が半径の合計より小さければ衝突。見た目より少し小さい判定にするとプレイヤーに優しい。', prompt:'プレイヤーと敵の当たり判定を、見た目より少し小さい矩形で行って。デバッグ用にDキーで判定の枠を表示できるようにして。',
        code:'const hit = a.x < b.x + b.w && a.x + a.w > b.x &&\n            a.y < b.y + b.h && a.y + a.h > b.y;\nconst circleHit = Math.hypot(a.x - b.x, a.y - b.y) < a.r + b.r;' }),
      g('spawn', { name:'スポーン・ウェーブ', en:'Spawning / Waves', tags:['難易度'], desc:'敵を画面外の位置から一定間隔で出現させ、ウェーブごとに数・速さ・出現間隔を上げていく。<b>難易度曲線</b>の基本。', prompt:'敵が画面の外周からランダムに出現して中央へ向かうようにして。ウェーブごとに敵の数と速さを増やし、ウェーブの間に3秒の休憩を入れて。' }),
      g('astar', { name:'経路探索（A*）', en:'Pathfinding: A* (A-star)', tags:['敵AI','タイル'], desc:'障害物を避けて目的地までの最短経路を探すアルゴリズム。タワーディフェンス、RPGの敵、クリック移動に。見本はクリックした場所へのルートを計算する。', prompt:'タイルマップ上で、クリックした場所までA*で経路を探してキャラクターが移動するようにして。斜め移動なし、壁は通れない。' }),
      g('terrain', { name:'プロシージャル生成', en:'Procedural Generation / Noise', tags:['ランダム地形'], desc:'ノイズ関数（Perlin・Simplex・Value noise）や乱数で、地形・ダンジョン・惑星などを<b>自動生成</b>する。シード値を固定すれば同じ世界を再現できる。', prompt:'シード値から毎回同じ地形が生成されるように、Simplexノイズで2Dの横スクロール地形を作って。木や岩もノイズの値に応じて配置して。' }),
    ]},
    { title:'見せ方・カメラ', items:[
      g('parallax', { name:'視差スクロール', en:'Parallax Scrolling', tags:['奥行き'], desc:'背景を何層にも分け、<b>奥の層ほどゆっくり</b>動かして奥行きを出す。2Dゲームの定番。', prompt:'横スクロールの背景を4層（空・遠い山・近い山・地面）に分けて、カメラ移動量の0.1/0.3/0.6/1.0倍で動かす視差スクロールにして。' }),
      g('camera', { name:'カメラ追従', en:'Camera Follow / Lerp / Deadzone', tags:['スムーズ'], desc:'カメラをプレイヤーの位置に<b>少しずつ近づける（線形補間：lerp）</b>と滑らかに追いかける。中央の枠（デッドゾーン）内では動かさない方式も。', prompt:'カメラがプレイヤーを滑らかに追いかけるようにして（lerpで毎フレーム10%ずつ近づく）。マップの端ではカメラが外に出ないように制限して。',
        code:'cam.x += (player.x - width / 2 - cam.x) * 0.1;  // 10%ずつ近づく\nctx.translate(-cam.x, -cam.y);' }),
      g('particles', { name:'パーティクル', en:'Particle System', tags:['演出'], desc:'たくさんの小さな粒を、ランダムな方向・速さで飛ばし、寿命で消す。爆発・火花・煙・紙吹雪・魔法。見本はクリックで爆発する。', prompt:'敵を倒したら、40個のパーティクルが重力付きで飛び散って0.5〜1秒でフェードアウトする演出を入れて。' }),
    ]},
    { title:'ゲームの土台', layout:'rows', items:[
      { name:'ゲームループ', en:'Game Loop / requestAnimationFrame', tags:['最重要'], desc:'「入力→更新→描画」を毎フレーム繰り返す仕組み。<b>前のフレームからの経過時間（dt）を掛けて動かす</b>と、画面のリフレッシュレート（60Hz/120Hz）が違っても同じ速さになる。', code:"let last = performance.now();\nfunction loop(now) {\n  const dt = Math.min(0.05, (now - last) / 1000); last = now;\n  update(dt);   // 位置 += 速度 * dt\n  draw();\n  requestAnimationFrame(loop);\n}\nrequestAnimationFrame(loop);", prompt:'ゲームループをrequestAnimationFrameで作り、移動はすべて経過時間dtを掛けて、120Hzのモニターでも速さが変わらないようにして。' },
      { name:'状態遷移（ステートマシン）', en:'State Machine', desc:'「タイトル→プレイ中→ポーズ→ゲームオーバー」や、敵の「待機→追跡→攻撃→逃走」を状態として管理する。if文の迷路を防げる。', prompt:'ゲーム全体をステートマシン（title / playing / paused / gameover）で管理して、各状態でupdateとdrawを切り替えて。敵のAIも idle / chase / attack の状態で作って。' },
      { name:'入力の扱い', en:'Input: Keyboard / Mouse / Touch / Gamepad', desc:'押した瞬間・押している間・離した瞬間を区別する。スマホ向けは仮想ジョイスティックやタップ操作を用意。Gamepad APIでコントローラーにも対応できる。', prompt:'キーボード（WASD/矢印）、ゲームパッド、スマホの仮想ジョイスティックのどれでも操作できるように、入力を1つのモジュールにまとめて。' },
      { name:'スプライトアニメーション', en:'Sprite Sheet Animation', desc:'1枚の画像に並べたコマを順番に切り出して表示し、パラパラ漫画のように動かす。歩く・走る・攻撃などの状態ごとにコマを用意。', code:'const frame = Math.floor(time * FPS) % FRAMES;\nctx.drawImage(sheet, frame * W, row * H, W, H, x, y, W, H);' },
      { name:'タイルマップ', en:'Tilemap', desc:'マップを同じ大きさのマス（タイル）の2次元配列で表す。Tiledなどのエディタで作ってJSONで読み込むのが定番。', prompt:'Tiledで作ったJSONのタイルマップを読み込んで描画し、壁タイルとの当たり判定を付けて。' },
      { name:'セーブ・ロード', en:'Save / Load', desc:'進行状況をlocalStorage（またはIndexedDB・サーバー）に保存。データにバージョン番号を付けておくと、アップデート時に古いセーブを変換できる。', prompt:'ゲームの進行状況（レベル・所持アイテム・設定）をlocalStorageに自動保存して、起動時に続きから再開できるようにして。セーブデータにはversionを持たせて。' },
      { name:'乱数とシード', en:'Random / Seeded RNG', desc:'<code>Math.random()</code> は再現できない。シード付き乱数（mulberry32など）を使うと、同じシードで同じ結果になり、デイリーチャレンジやバグの再現に便利。', code:'function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);\n  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }\nconst rand = mulberry32(20261022);' },
      { name:'固定タイムステップ', en:'Fixed Timestep', desc:'物理計算を一定間隔（1/60秒）で行うと、処理落ちしても挙動が安定する。物理エンジンやオンライン対戦で重要。' },
      { name:'オブジェクトプール', en:'Object Pool', desc:'弾やパーティクルを毎回作って捨てるのではなく、使い回す仕組み。ガベージコレクションによるカクつきを防ぐ。' },
    ]},
  ]
});

TABS.push({
  id:'juice', label:'手触り演出（ジュース）', icon:'✸',
  intro:'同じゲームでも、<b>画面揺れ・ヒットストップ・フラッシュ・パーティクル</b>などの演出を足すだけで「気持ちいい」手触りに変わります。これを「ジュース（juice）」「ゲームフィール」と呼びます。下の見本でチェックを外して違いを比べてください。 画面の揺れ（トラウマ×ノイズ）やばねの式は <a href="motion-math.html#waves">動きの計算辞典</a> へ。',
  sections:[
    { title:'演出のオン・オフ比較', items:[ { name:'演出あり／なしを比べる', en:'Juice it or lose it', wide:true, h:260, stage:'free', init:(el) => D.juice(el), tags:['必見'],
      desc:'クリック（または自動）で攻撃したときの演出を、チェックボックスで1つずつ切り替えられる。<b>全部OFFにすると驚くほど味気ない</b>ことが分かる。', prompt:'攻撃が当たったときの手触りを良くして。0.07秒のヒットストップ、0.25秒の画面揺れ、敵の白フラッシュ、ノックバック、伸び縮み、ダメージ数字のポップアップ、火花のパーティクル、打撃音を入れて。各演出は設定でオフにできるように。' } ] },
    { title:'演出の種類', layout:'rows', items:[
      { name:'画面揺れ', en:'Screen Shake', tags:['定番'], desc:'衝撃の瞬間に画面全体を小刻みに揺らす。強さを時間とともに減衰させる。<b>揺らしすぎは酔う</b>ので設定でオフにできるように。', code:'if (shake > 0) { ctx.translate((Math.random()*2-1) * shake * 30, (Math.random()*2-1) * shake * 30); shake -= dt; }' },
      { name:'ヒットストップ', en:'Hit Stop / Hit Pause', tags:['格闘ゲーム'], desc:'攻撃が当たった瞬間、ゲーム全体を<b>数十ミリ秒だけ止める</b>。重さと手応えが劇的に増す。強い攻撃ほど長く止める。', code:'if (hitStop > 0) { hitStop -= dt; return; } // updateを丸ごとスキップ' },
      { name:'ヒットフラッシュ', en:'Hit Flash', desc:'ダメージを受けたキャラを1〜3フレームだけ真っ白（または赤）にする。当たったことが一目で分かる。' },
      { name:'ノックバック', en:'Knockback', desc:'攻撃の方向へ相手を押し戻す。当たった感触と、間合いの調整の両方に効く。' },
      { name:'伸び縮み', en:'Squash & Stretch', desc:'ジャンプで縦に伸び、着地でつぶれる。叩かれたら横につぶれる。柔らかさと勢いが出る（Webデザイン辞典の「アニメーションの原則」も参照）。' },
      { name:'ダメージ数字', en:'Damage Numbers / Floating Text', desc:'当たった位置から数字が飛び出して消える。クリティカルは大きく・色を変える。RPGやハクスラの快感の源。' },
      { name:'トゥイーン（補間アニメーション）', en:'Tweening / Easing', desc:'UIやオブジェクトの動きにイージングを付ける。スコアがポンと弾む、メニューがスッと出る。GSAPやTween.jsが便利。' },
      { name:'スローモーション', en:'Slow Motion / Time Scale', desc:'決定的な瞬間（最後の敵を倒した、ギリギリで避けた）に時間をゆっくりにする。dtに倍率を掛けるだけで実装できる。', code:'update(dt * timeScale); // 0.2にすると1/5の速さ' },
      { name:'残像・軌跡', en:'Motion Trail / Afterimage', desc:'速く動く物の後ろに半透明の残像や線を残す。剣の軌跡、ダッシュ、弾。' },
      { name:'カメラのズーム・パンチ', en:'Camera Punch / Zoom', desc:'衝撃の瞬間にカメラを少しだけ寄せてすぐ戻す。画面揺れより酔いにくい強調方法。' },
      { name:'音と振動', en:'Sound & Haptics', desc:'効果音は演出の半分。スマホならVibration APIで小さく振動させると手応えが増す。', links:[['サウンド・効果音辞典へ', 'sound.html']] },
      { name:'操作の受け付けを優しく', en:'Coyote Time / Input Buffer', desc:'足場を離れた直後のジャンプを許す（コヨーテタイム）、着地直前の入力を覚えておく（入力バッファ）。<b>プレイヤーは気づかないが「操作しやすい」と感じる</b>隠れた優しさ。' },
    ]},
    { title:'UIの手触り', items:[
      { name:'遅れて減るHPバー', en:'Delayed Damage Bar', h:150, stage:'free', demo:'<div class="gm-hp"><div class="bar"><i class="lag"></i><i class="cur"></i></div><button class="snd-btn">ダメージ！</button><button class="snd-btn ghost">回復</button></div>',
        init:(el) => { let hp = 100; const cur = $(el, '.cur'), lag = $(el, '.lag'); const set = () => { cur.style.width = hp + '%'; setTimeout(() => lag.style.width = hp + '%', 400); }; const [d, r] = $$(el, 'button'); d.onclick = () => { hp = Math.max(0, hp - 18); el.querySelector('.bar').classList.remove('hit'); void el.offsetWidth; el.querySelector('.bar').classList.add('hit'); set(); }; r.onclick = () => { hp = Math.min(100, hp + 30); lag.style.width = hp + '%'; cur.style.width = hp + '%'; }; },
        desc:'ダメージを受けると緑のバーはすぐ減り、<b>白い部分が少し遅れて減る</b>。どれだけ減ったかが分かり、格闘ゲームのような手応えが出る。', prompt:'HPバーを、ダメージ時は本体がすぐ減り、後ろの白いバーが0.4秒遅れて追いかけて減るようにして。被弾時にバーを少し揺らして。' },
      { name:'スコアが弾む', en:'Score Pop', h:140, stage:'free', demo:'<div class="gm-score"><b>0</b><button class="snd-btn">+100</button></div>',
        init:(el) => { let s = 0; const b = $(el, 'b'); $(el, 'button').onclick = () => { s += 100; b.textContent = s.toLocaleString(); b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }; },
        desc:'スコアや所持金が増えたら、数字を一瞬大きくして戻す。小さなことだが「得した」感覚が強まる。', prompt:'スコアが加算されたら、数字が1.4倍に弾んで戻るアニメーションを付けて。大きく加算されたときは色も変えて。' },
    ]},
  ]
});

TABS.push({
  id:'design', label:'ゲームデザイン用語', icon:'✎',
  intro:'面白さを設計するための考え方。AIに「面白くして」と頼むより、<b>どの要素を調整したいか</b>を具体的に伝える方がうまくいきます。',
  sections:[
    { title:'面白さの設計', layout:'rows', items:[
      { name:'コアループ', en:'Core Loop', tags:['最重要'], desc:'プレイヤーが何度も繰り返す行動の輪（例：敵を倒す→経験値→強くなる→もっと強い敵を倒す）。これが楽しくないと何を足しても楽しくならない。', prompt:'このゲームのコアループを「行動→報酬→成長→次の挑戦」の形で整理して、それぞれをもっと気持ちよくする改善案を出して。' },
      { name:'難易度曲線', en:'Difficulty Curve', desc:'だんだん難しくし、ときどき簡単な休憩を挟む（波を作る）。最初の1分で基本操作を自然に覚えられるように。', prompt:'敵の出現数・速さ・体力をウェーブごとにどう増やすか、難易度曲線の表（ウェーブ1〜20）を作って。5ウェーブごとに少し楽な回を入れて。' },
      { name:'フロー状態', en:'Flow', desc:'難しすぎず簡単すぎない、ちょうど夢中になれる状態。プレイヤーの腕前に合わせて難易度を自動調整する方法（ダイナミック・ディフィカルティ）もある。' },
      { name:'報酬と成長', en:'Rewards / Progression', desc:'経験値・レベル・アイテム・アンロック・実績など、続ける理由を作る。「あと少しで次がもらえる」状態を見せると続けてしまう。' },
      { name:'リスクとリターン', en:'Risk / Reward', desc:'危ない選択ほど見返りが大きい（ギリギリで避けるとボーナス等）。選択に意味が生まれる。' },
      { name:'チュートリアル', en:'Onboarding / Tutorial', desc:'説明文で教えるより、<b>やらせて覚えさせる</b>。最初のステージで、ジャンプしないと進めない場所を置くなど。' },
      { name:'フィードバック', en:'Feedback', desc:'プレイヤーの行動に、見た目・音・数字で必ず反応を返す。「手触り演出」タブ参照。' },
      { name:'バランス調整', en:'Balancing', desc:'数値（体力・攻撃力・価格・出現率）を調整して、強すぎる選択肢・使われない選択肢をなくす。数値は1か所の設定ファイルにまとめておくと調整しやすい。', prompt:'ゲームのバランス用の数値（プレイヤーの速度・ジャンプ力・敵の体力・出現間隔など）をすべて config.js にまとめて、画面上のデバッグパネルからリアルタイムに調整できるようにして。' },
    ]},
    { title:'画面・システム', layout:'rows', items:[
      { name:'HUD', en:'Heads-Up Display', desc:'プレイ中に常に表示する情報（HP・スコア・残り時間・ミニマップ）。必要最小限にし、画面の端にまとめる。' },
      { name:'ポーズ・設定', en:'Pause / Settings', desc:'Escで一時停止、音量・操作・画質の設定。タブが裏に回ったら自動でポーズ（Page Visibility API）。' },
      { name:'ランキング（リーダーボード）', en:'Leaderboard', desc:'スコアを他のプレイヤーと競う。Supabase・Firebaseなどにスコアを保存。不正なスコアの送信への対策も必要。', prompt:'ゲームオーバー時に名前を入力してSupabaseにスコアを保存し、上位10件のランキングを表示して。' },
      { name:'実績', en:'Achievements', desc:'「100体倒した」「ノーダメージでクリア」など、遊び方の目標を追加する。' },
      { name:'ゲームジャム', en:'Game Jam', desc:'決められたテーマで48時間などの短期間にゲームを作るイベント。小さく作って完成させる練習に最適。itch.ioで多数開催。' },
    ]},
  ]
});

TABS.push({
  id:'engine', label:'エンジン・ツール', icon:'⧉',
  intro:'ゲームを作るためのライブラリ・エンジン・ツール。<b>Webで遊べる小さなゲームなら、まずは素のCanvasかPhaser</b>がAIとの相性も良くおすすめです。 Webで3Dを動かす仕組み（three.js・シェーダー）は <a href="3d.html">3D・WebGL・シェーダー辞典</a> へ。',
  sections:[
    { title:'Webゲーム向け（JavaScript）', layout:'rows', items:[
      { name:'素のCanvas＋JavaScript', en:'HTML5 Canvas', tags:['依存なし','学習向き'], desc:'ライブラリなしでも1ファイルのHTMLでゲームが作れる。この辞典の見本もすべて素のCanvas。小さなゲームならこれが一番手軽。', prompt:'外部ライブラリを使わず、1つのHTMLファイル（Canvas＋JavaScript）だけで動く〇〇ゲームを作って。' },
      { name:'Phaser', en:'phaser.io', tags:['2D定番','物理入り'], url:'https://phaser.io/', desc:'2Dゲームの定番フレームワーク。シーン管理・スプライト・アニメーション・物理（Arcade/Matter）・タイルマップ・音・入力がすべて揃う。', prompt:'Phaser 3でプラットフォーマーを作って。Arcade物理、タイルマップ（Tiled）、プレイヤーアニメーション、コイン収集、カメラ追従。' },
      { name:'KAPLAY（旧Kaboom.js）', en:'kaplayjs.com', tags:['超簡単','初心者向け'], url:'https://kaplayjs.com/', desc:'短いコードでゲームが作れる初心者向けライブラリ。ゲームジャムやプロトタイプに。' },
      { name:'PixiJS', en:'pixijs.com', tags:['高速2D描画'], url:'https://pixijs.com/', desc:'WebGL/WebGPUによる高速な2D描画エンジン。大量のスプライトやエフェクトに強い（ゲームの仕組みは自分で書く）。' },
      { name:'Three.js / Babylon.js', en:'3D', tags:['3D'], url:'https://threejs.org/', desc:'ブラウザで3Dゲーム。Three.jsは描画中心、Babylon.jsはゲームエンジン寄りで物理やGUIも内蔵。' },
      { name:'Matter.js / Rapier / Planck.js', en:'物理エンジン', tags:['物理'], url:'https://brm.io/matter-js/', desc:'物体の衝突・重力・回転・関節をリアルに計算する。物理パズル、スイカゲーム型、ピタゴラ装置に。' },
      { name:'p5.js', en:'p5js.org', tags:['クリエイティブコーディング'], url:'https://p5js.org/', desc:'絵や動きをコードで描くためのライブラリ。教育・アート・簡単なゲームに。' },
    ]},
    { title:'ゲームエンジン（アプリ・本格開発）', layout:'rows', items:[
      { name:'Godot Engine', en:'godotengine.org', tags:['無料・オープンソース','2D/3D'], url:'https://godotengine.org/', desc:'完全無料のゲームエンジン。軽量で2Dに強く、Web・PC・スマホへ書き出せる。GDScript（Python風）で書ける。' },
      { name:'Unity', en:'unity.com', tags:['世界的定番','C#'], url:'https://unity.com/', desc:'スマホゲームで最もよく使われるエンジン。情報・アセットが豊富。利用条件（収益規模など）は公式で確認。' },
      { name:'Unreal Engine', en:'unrealengine.com', tags:['高品質3D'], url:'https://www.unrealengine.com/', desc:'AAA級の美しい3D。ブループリント（ノード）でもプログラムできる。売上が一定額を超えるとロイヤリティ。' },
      { name:'GDevelop / Construct', en:'ノーコード', tags:['プログラム不要'], url:'https://gdevelop.io/', desc:'イベント（条件→動作）を並べるだけでゲームが作れるツール。' },
      { name:'RPGツクール / Pixel Game Maker MV', en:'ジャンル特化', url:'https://tkool.jp/', desc:'RPG・アクションなど特定ジャンルを作るための日本の定番ツール。' },
    ]},
    { title:'素材づくりのツール', layout:'rows', items:[
      { name:'Tiled / LDtk', en:'マップエディタ', url:'https://www.mapeditor.org/', desc:'タイルマップ（ステージ）を作るエディタ。JSONで書き出してゲームから読み込む。' },
      { name:'Aseprite / Piskel', en:'ドット絵エディタ', url:'https://www.aseprite.org/', desc:'ドット絵とスプライトアニメーションを作るツール（Piskelは無料・ブラウザで使える）。' },
      { name:'jsfxr / ZzFX', en:'効果音ジェネレーター', url:'https://sfxr.me/', desc:'レトロゲームの効果音をパラメータで生成。', links:[['サウンド・効果音辞典へ', 'sound.html']] },
      { name:'無料のゲーム素材', en:'Kenney / itch.io / OpenGameArt', url:'https://kenney.nl/', desc:'Kenneyは高品質なCC0素材（グラフィック・音・UI）を大量に配布。itch.ioやOpenGameArtにも素材が豊富。', links:[['無料素材・リソース辞典へ', 'resources.html#game']] },
    ]},
  ]
});
})();
