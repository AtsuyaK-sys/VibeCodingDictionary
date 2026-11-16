/* グラフ・データ可視化辞典 — A: 共通ヘルパー / グラフの選び方 / 基本のグラフ / 見やすくするルール / 動かす・操作する */
(function(){
const { $, $$, esc, seg } = KIT;
const S = (title, items, note) => ({ title, note, layout:'rows', items });
const C = (title, items, note, lg) => ({ title, note, layout:lg ? 'cards lg' : 'cards', items });
const T = (name, en, desc, prompt, tags, more) => Object.assign({ name, en, desc, prompt, tags }, more || {});
const verdict = (el, cls, html) => { el.classList.remove('ok', 'bad', 'warn'); if (cls) el.classList.add(cls); el.innerHTML = html; };

/* ---- 色（検証済みパレット）---- カテゴリは決まった順番で使い、系列ごとに色を固定する */
const SER = [1, 2, 3, 4, 5, 6, 7, 8].map(i => `var(--dv${i})`);
const isDark = (el) => getComputedStyle(el || document.documentElement).getPropertyValue('--dv-surface').trim() === '#1a1a19';
const SEQ = { 100:'#cde2fb', 150:'#b7d3f6', 200:'#9ec5f4', 250:'#86b6ef', 300:'#6da7ec', 350:'#5598e7', 400:'#3987e5', 450:'#2a78d6', 500:'#256abf', 550:'#1c5cab', 600:'#184f95', 650:'#104281', 700:'#0d366b' };
const seq5 = (el) => isDark(el) ? [SEQ[600], SEQ[500], SEQ[400], SEQ[300], SEQ[200]] : [SEQ[100], SEQ[200], SEQ[350], SEQ[500], SEQ[650]];
const DIVR = ['#f9d0cc', '#f19a93', '#e34948', '#b4302f'], DIVB = [SEQ[100], SEQ[250], SEQ[400], SEQ[550]];
const STATUS = { good:['#0ca30c', '✓', '良好'], warn:['#fab219', '!', '注意'], serious:['#ec835a', '!!', '要対応'], crit:['#d03b3b', '×', '危険'] };

/* ---- 数字・目盛り ---- */
const nf = (n, d = 0) => (Math.round(n * 10 ** d) / 10 ** d).toLocaleString('ja-JP');
const lin = (d0, d1, r0, r1) => v => r0 + (v - d0) / ((d1 - d0) || 1) * (r1 - r0);
function stepOf(span, n){ const raw = span / n, p = 10 ** Math.floor(Math.log10(raw || 1)); return [1, 2, 2.5, 5, 10].map(k => k * p).find(s => span / s <= n) || 10 * p; }
function ticks(a, b, n = 5){ if (b <= a) return [a]; const st = stepOf(b - a, n), out = []; for (let v = Math.ceil(a / st - 1e-9) * st; v <= b + st * 1e-9; v += st) out.push(Math.round(v * 1e6) / 1e6); return out; }
function niceMax(v, n = 5){ if (v <= 0) return 1; const st = stepOf(v, n); return Math.ceil(v / st - 1e-9) * st; }
const rng = (s) => () => (s = (s * 16807) % 2147483647) / 2147483647;
const gauss = (r) => { const u = r() || 1e-9, v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const quart = (a) => { const s = [...a].sort((x, y) => x - y), q = (p) => { const i = (s.length - 1) * p, lo = Math.floor(i); return s[lo] + (s[Math.ceil(i)] - s[lo]) * (i - lo); }; return { min:s[0], q1:q(.25), med:q(.5), q3:q(.75), max:s[s.length - 1], s }; };
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;

/* ---- 描画の土台 ---- */
const size = (box) => ({ W:Math.max(120, Math.floor(box.clientWidth)), H:Math.max(80, Math.floor(box.clientHeight)) });
// 棒の端：データの端（上・右など）だけ4pxの角丸。'n' は角丸なし（積み上げの途中）
function rbar(x, y, w, h, end = 't', r = 4){
  if (w <= 0 || h <= 0) return ''; r = Math.min(r, w / 2, h / 2);
  if (end === 'n') return `M${x},${y}h${w}v${h}h${-w}Z`;
  if (end === 't') return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
  if (end === 'b') return `M${x},${y}V${y + h - r}Q${x},${y + h} ${x + r},${y + h}H${x + w - r}Q${x + w},${y + h} ${x + w},${y + h - r}V${y}Z`;
  if (end === 'r') return `M${x},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x}Z`;
  return `M${x + w},${y}H${x + r}Q${x},${y} ${x},${y + r}V${y + h - r}Q${x},${y + h} ${x + r},${y + h}H${x + w}Z`;
}
function tip(box){
  if (box._tip){ if (!box._tip.isConnected) box.append(box._tip); return box._tip; }
  const t = document.createElement('div'); t.className = 'dv-tip'; t.hidden = true; box.append(t); box._tip = t;
  box.addEventListener('pointermove', (e) => { if (e.target.closest('[data-xh]')) return; const m = e.target.closest('[data-tip]'); if (m && box.contains(m)) showTip(box, e, m.dataset.tip); else t.hidden = true; });
  box.addEventListener('pointerleave', () => { t.hidden = true; });
  return t;
}
function showTip(box, e, html){
  const t = tip(box); t.innerHTML = html; t.hidden = false; const b = box.getBoundingClientRect();
  let x = e.clientX - b.left + 12, y = e.clientY - b.top + 14; if (x + t.offsetWidth > b.width - 2) x = e.clientX - b.left - t.offsetWidth - 12; if (y + t.offsetHeight > b.height - 2) y = e.clientY - b.top - t.offsetHeight - 12;
  t.style.left = Math.max(2, Math.min(x, b.width - t.offsetWidth - 2)) + 'px'; t.style.top = Math.max(2, y) + 'px';
}
// 箱の大きさが変わったら（説明文の行数が変わった等）描き直す
const RO = 'ResizeObserver' in window ? new ResizeObserver(es => es.forEach(e => { const b = e.target; if (!b._last || !b.isConnected || !b.offsetParent) return; const { W, H } = size(b); if (Math.abs(W - (b._W || 0)) > 2 || Math.abs(H - (b._H || 0)) > 2) b._last(); })) : null;
function keep(box, fn){ box._last = fn; box._keepNow = true; if (RO && !box._ro){ box._ro = 1; RO.observe(box); } }
function draw(box, W, H, inner, defs = ''){ if (!box._keepNow) box._last = null; box._keepNow = false; box._W = W; box._H = H; box.innerHTML = `<svg class="dv-svg" width="100%" height="100%" viewBox="0 0 ${W} ${H}" role="img">${defs}${inner}</svg>`; tip(box); return box.querySelector('svg'); }
const sw = (c) => `<i style="background:${c}"></i>`;
const leg = (ser) => `<div class="dv-leg">${ser.map(s => `<span>${sw(s.c)}${esc(s.n)}</span>`).join('')}</div>`;
const gridY = (y, tks, x0, x1, fmt, suf = '') => tks.map(v => `<line class="dv-grid" x1="${x0}" x2="${x1}" y1="${y(v)}" y2="${y(v)}"/><text class="dv-lbl" x="${x0 - 6}" y="${y(v) + 3.5}" text-anchor="end">${fmt(v)}${suf}</text>`).join('');

/* ---- 棒グラフ（縦・横、グループ・積み上げ・100%）---- */
function barChart(box, o){
  keep(box, () => barChart(box, o));
  const { W, H } = size(box), fmt = o.fmt || nf, u = o.unit || '', ser = o.series, cats = o.cats, k = o.k ?? 1;
  const raw = (s, i) => { const v = s.v[i]; if (!o.pct) return v; const t = ser.reduce((a, x) => a + x.v[i], 0); return t ? v / t * 100 : 0; };
  const totals = cats.map((_, i) => ser.reduce((a, s) => a + raw(s, i), 0));
  const min = o.yMin || 0, max = o.yMax ?? (o.pct ? 100 : niceMax(o.stacked ? Math.max(...totals) : Math.max(...ser.flatMap(s => cats.map((_, i) => raw(s, i)))), 4));
  const val = (s, i) => min + (raw(s, i) - min) * k;
  const col = (s, i) => o.catColors ? o.catColors[i] : s.c, suf = o.pct ? '%' : '';
  const tipOf = (i) => esc(`<b>${esc(cats[i])}</b>` + ser.map(s => `<br>${sw(col(s, i))}${s.n ? esc(s.n) + ' ' : ''}<b>${fmt(o.pct ? raw(s, i) : s.v[i], o.pct ? 1 : 0)}${o.pct ? '%' : u}</b>`).join(''));
  const dim = (i) => o.hl != null && o.hl !== i ? ' class="dim"' : '';
  let g = '';
  if (!o.horiz){
    const m = { l:o.ml ?? 44, r:8, t:o.vlab ? 18 : 10, b:22 }, iw = W - m.l - m.r, ih = H - m.t - m.b, y = lin(min, max, m.t + ih, m.t), bw = iw / cats.length;
    g += gridY(y, ticks(min, max, Math.max(2, Math.min(6, Math.floor(ih / 34)))), m.l, W - m.r, fmt, suf);
    const pad = o.gap0 ? 1 : Math.max(1, Math.min(bw * .18, 16)), n = o.stacked ? 1 : ser.length, bwid = Math.max(1, (bw - pad * 2 - (n - 1) * 2) / n), step = Math.max(1, Math.ceil((o.lblW || 30) / bw));
    cats.forEach((c, i) => { let acc = 0; const x0 = m.l + i * bw + pad;
      ser.forEach((s, j) => { const v = val(s, i) - min;
        if (o.stacked){ const last = j === ser.length - 1, ya = y(min + acc + v), yb = y(min + acc); acc += v; const hh = yb - ya - (j ? 2 : 0); if (hh > 0) g += `<path${dim(i)} d="${rbar(x0, ya, bw - pad * 2, hh, last ? 't' : 'n')}" style="fill:${col(s, i)}" data-tip="${tipOf(i)}"/>`; }
        else { const x = x0 + j * (bwid + 2), yv = y(min + v), hh = y(min) - yv; if (hh > .5) g += `<path${dim(i)} d="${rbar(x, yv, bwid, hh, 't')}" style="fill:${col(s, i)}" data-tip="${tipOf(i)}"/>`; if (o.vlab && hh > .5) g += `<text class="dv-dl" x="${x + bwid / 2}" y="${yv - 5}" text-anchor="middle">${fmt(s.v[i])}</text>`; } });
      if (i % step === 0) g += `<text class="dv-lbl" x="${m.l + i * bw + bw / 2}" y="${H - 6}" text-anchor="middle">${esc(c)}</text>`; });
    g += `<line class="dv-base" x1="${m.l}" x2="${W - m.r}" y1="${y(min)}" y2="${y(min)}"/>`;
  } else {
    const m = { l:o.lw || 64, r:o.vlab ? 50 : 12, t:6, b:18 }, iw = W - m.l - m.r, ih = H - m.t - m.b, x = lin(min, max, m.l, m.l + iw), bh = ih / cats.length;
    g += ticks(min, max, Math.max(2, Math.min(5, Math.floor(iw / 64)))).map(v => `<line class="dv-grid" y1="${m.t}" y2="${H - m.b}" x1="${x(v)}" x2="${x(v)}"/><text class="dv-lbl" y="${H - 4}" x="${x(v)}" text-anchor="middle">${fmt(v)}${suf}</text>`).join('');
    const pad = Math.max(1, Math.min(bh * .18, 10));
    cats.forEach((c, i) => { let acc = 0; const y0 = m.t + i * bh + pad, hh = bh - pad * 2, n = o.stacked ? 1 : ser.length, sh = Math.max(1, (hh - (n - 1) * 2) / n);
      ser.forEach((s, j) => { const v = val(s, i) - min;
        if (o.stacked){ const last = j === ser.length - 1, xa = x(min + acc) + (j ? 2 : 0), xb = x(min + acc + v); acc += v; if (xb - xa > 0) g += `<path${dim(i)} d="${rbar(xa, y0, xb - xa, hh, last ? 'r' : 'n')}" style="fill:${col(s, i)}" data-tip="${tipOf(i)}"/>`; }
        else { const yy = y0 + j * (sh + 2), ww = x(min + v) - x(min); if (ww > .5) g += `<path${dim(i)} d="${rbar(x(min), yy, ww, sh, 'r')}" style="fill:${col(s, i)}" data-tip="${tipOf(i)}"/>`; if (o.vlab) g += `<text class="dv-dl" x="${x(min) + ww + 5}" y="${yy + sh / 2 + 4}">${fmt(s.v[i])}${u}</text>`; } });
      g += `<text x="${m.l - 6}" y="${m.t + i * bh + bh / 2 + 4}" text-anchor="end">${esc(c)}</text>`; });
    g += `<line class="dv-base" y1="${m.t}" y2="${H - m.b}" x1="${x(min)}" x2="${x(min)}"/>`;
  }
  const svg = draw(box, W, H, g); if (o.after) o.after(svg); return svg;
}

/* ---- 折れ線・面グラフ（クロスヘア＋ツールチップ付き）---- */
function lineChart(box, o){
  keep(box, () => lineChart(box, o));
  const { W, H } = size(box), fmt = o.fmt || nf, u = o.unit || '', ser = o.series.filter(s => !s.off), xs = o.xs, n = xs.length, k = o.k ?? 1;
  const cum = o.stack ? ser.map((_, j) => xs.map((_, i) => ser.slice(0, j + 1).reduce((a, s) => a + (s.v[i] || 0), 0))) : null;
  const all = (cum ? cum[cum.length - 1] : ser.flatMap(s => s.v)).filter(v => v != null);
  const min = o.yMin ?? 0, max = o.yMax ?? niceMax(Math.max(...all, 1), 4);
  const dl = o.direct && ser.length && ser.length <= 4, m = { l:o.ml ?? 42, r:dl ? (o.dlw || 60) : (o.mr ?? 12), t:10, b:22 }, iw = W - m.l - m.r, ih = H - m.t - m.b;
  const x = (i) => m.l + (n > 1 ? i / (n - 1) * iw : iw / 2), y0 = lin(min, max, m.t + ih, m.t), y = (v) => y0(min + (v - min) * k);
  let g = gridY(y0, ticks(min, max, Math.max(2, Math.min(6, Math.floor(ih / 34)))), m.l, W - m.r, fmt, o.ysuf || '');
  const step = Math.max(1, Math.ceil((o.lblW || 34) / (iw / Math.max(1, n - 1))));
  xs.forEach((c, i) => { if (i % step === 0) g += `<text class="dv-lbl" x="${x(i)}" y="${H - 6}" text-anchor="middle">${esc(c)}</text>`; });
  const pathOf = (vals) => { let d = '', pen = false; vals.forEach((v, i) => { if (v == null){ pen = false; return; } d += (pen ? 'L' : 'M') + x(i).toFixed(1) + ',' + y(v).toFixed(1); pen = true; }); return d; };
  if (o.stack) ser.forEach((s, j) => { const top = cum[j], bot = j ? cum[j - 1] : xs.map(() => min); g += `<path d="${pathOf(top)}${[...bot].reverse().map((v, i) => 'L' + x(n - 1 - i).toFixed(1) + ',' + y(v).toFixed(1)).join('')}Z" style="fill:${s.c}" data-tip="${esc(`<b>${esc(s.n)}</b>`)}"/><path d="${pathOf(top)}" fill="none" style="stroke:var(--dv-surface);stroke-width:2"/>`; });
  else ser.forEach(s => { if (o.area && !s.v.includes(null)) g += `<path d="${pathOf(s.v)}L${x(n - 1)},${y(min)}L${x(0)},${y(min)}Z" style="fill:${s.c};opacity:.14"/>`; g += `<path class="ln" d="${pathOf(s.v)}" style="stroke:${s.c};${s.w ? 'stroke-width:' + s.w + ';' : ''}${s.dash ? 'stroke-dasharray:5 4;' : ''}"/>`; });
  if (dl){ const labs = ser.map((s, j) => { const vals = cum ? cum[j] : s.v; let li = n - 1; while (li > 0 && vals[li] == null) li--; return { s, yy:y(vals[li]) + 4, xx:x(li) + 6 }; }).sort((a, b) => a.yy - b.yy);
    for (let i = 1; i < labs.length; i++) if (labs[i].yy - labs[i - 1].yy < 13) labs[i].yy = labs[i - 1].yy + 13;
    labs.forEach(l => { g += `<text x="${l.xx}" y="${l.yy}" style="fill:var(--dv-ink);font-weight:700">${esc(l.s.n)}</text>`; }); }
  g += `<line class="dv-base" x1="${m.l}" x2="${W - m.r}" y1="${y0(min)}" y2="${y0(min)}"/>`;
  if (o.extra) g += o.extra({ x, y, m, iw, ih, W, H });
  g += `<g class="xhg" style="display:none" pointer-events="none"><line class="xh" y1="${m.t}" y2="${m.t + ih}"/>${ser.map(s => `<circle class="mk" r="4" style="fill:${s.c}"/>`).join('')}</g><rect class="hit" data-xh x="${m.l}" y="${m.t}" width="${Math.max(1, iw)}" height="${Math.max(1, ih)}"/>`;
  const svg = draw(box, W, H, g), xg = $(svg, '.xhg'), ln = $(xg, 'line'), dots = $$(xg, 'circle'), hit = $(svg, '.hit');
  hit.addEventListener('pointermove', (e) => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const loc = pt.matrixTransform(svg.getScreenCTM().inverse()), i = Math.max(0, Math.min(n - 1, Math.round((loc.x - m.l) / iw * (n - 1)))); xg.style.display = ''; ln.setAttribute('x1', x(i)); ln.setAttribute('x2', x(i));
    ser.forEach((s, j) => { const v = cum ? cum[j][i] : s.v[i]; dots[j].style.display = s.v[i] == null ? 'none' : ''; if (s.v[i] != null){ dots[j].setAttribute('cx', x(i)); dots[j].setAttribute('cy', y(v)); } });
    showTip(box, e, `<b>${esc(xs[i])}</b>` + ser.map(s => `<br>${sw(s.c)}${esc(s.n)} <b>${s.v[i] == null ? '—（データなし）' : fmt(s.v[i], o.dec || 0) + u}</b>`).join('')); });
  hit.addEventListener('pointerleave', () => { xg.style.display = 'none'; tip(box).hidden = true; });
  if (o.after) o.after(svg);
  return { svg, x, y, m, iw, ih };
}

/* ---- ドーナツ・散布図・小さな線（スパークライン）---- */
function donut(box, items, o = {}){
  keep(box, () => donut(box, items, o));
  const { W, H } = size(box), cx = W / 2, cy = H / 2, R = Math.max(10, Math.min(W, H) / 2 - 6), r = R * (o.hole ?? .6), tot = items.reduce((a, b) => a + b.v, 0) || 1; let a0 = -Math.PI / 2, g = '';
  const p = (a, rr) => `${(cx + Math.cos(a) * rr).toFixed(2)},${(cy + Math.sin(a) * rr).toFixed(2)}`;
  items.forEach(it => { const a1 = a0 + it.v / tot * Math.PI * 2 * (o.k ?? 1), lg = a1 - a0 > Math.PI ? 1 : 0;
    g += `<path d="M${p(a0, R)}A${R},${R} 0 ${lg} 1 ${p(a1, R)}L${p(a1, r)}A${r},${r} 0 ${lg} 0 ${p(a0, r)}Z" style="fill:${it.c};stroke:var(--dv-surface);stroke-width:2" data-tip="${esc(`${sw(it.c)}${esc(it.n)} <b>${nf(it.v)}${o.unit || ''}</b>（${nf(it.v / tot * 100, 1)}%）`)}"/>`; a0 = a1; });
  if (r > 0) g += `<text x="${cx}" y="${cy + 4}" text-anchor="middle" style="font-size:${Math.max(13, r * .36)}px;font-weight:800;fill:var(--dv-ink)">${o.center ?? nf(tot)}</text><text x="${cx}" y="${cy + 6 + Math.max(13, r * .36) * .7}" text-anchor="middle" class="dv-lbl">${o.sub || '合計'}</text>`;
  return draw(box, W, H, g);
}
function scatter(box, o){
  keep(box, () => scatter(box, o));
  const { W, H } = size(box), m = { l:46, r:12, t:10, b:30 }, iw = W - m.l - m.r, ih = H - m.t - m.b, pts = o.pts;
  const xmax = o.xMax ?? niceMax(Math.max(...pts.map(p => p.x)), 4), ymax = o.yMax ?? niceMax(Math.max(...pts.map(p => p.y)), 4), x = lin(0, xmax, m.l, m.l + iw), y = lin(0, ymax, m.t + ih, m.t);
  let g = gridY(y, ticks(0, ymax, Math.max(2, Math.floor(ih / 40))), m.l, W - m.r, nf) + ticks(0, xmax, Math.max(2, Math.floor(iw / 70))).map(v => `<line class="dv-grid" y1="${m.t}" y2="${m.t + ih}" x1="${x(v)}" x2="${x(v)}"/><text class="dv-lbl" x="${x(v)}" y="${m.t + ih + 13}" text-anchor="middle">${nf(v)}</text>`).join('');
  g += `<text class="dv-lbl" x="${m.l + iw}" y="${H - 2}" text-anchor="end">${o.xLab || ''} →</text><text class="dv-lbl" x="${m.l + 2}" y="${m.t + 9}">↑ ${o.yLab || ''}</text>`;
  if (o.trend){ const mx = mean(pts.map(p => p.x)), my = mean(pts.map(p => p.y)), b = pts.reduce((a, p) => a + (p.x - mx) * (p.y - my), 0) / pts.reduce((a, p) => a + (p.x - mx) ** 2, 0), a = my - b * mx; g += `<line x1="${x(0)}" y1="${y(Math.max(0, a))}" x2="${x(xmax)}" y2="${y(a + b * xmax)}" style="stroke:var(--dv-ink2);stroke-width:1.5;stroke-dasharray:6 4"/>`; }
  pts.forEach(p => { g += `<circle cx="${x(p.x)}" cy="${y(p.y)}" r="${p.r || 5}" class="mk${p.dim ? ' dim' : ''}" style="fill:${p.c || SER[0]};stroke-width:1.5" data-tip="${esc(p.tip || `${o.xLab}：<b>${nf(p.x)}</b><br>${o.yLab}：<b>${nf(p.y)}</b>`)}"/>`; });
  return draw(box, W, H, g);
}
const corr = (pts) => { const mx = mean(pts.map(p => p.x)), my = mean(pts.map(p => p.y)); let a = 0, b = 0, c = 0; pts.forEach(p => { a += (p.x - mx) * (p.y - my); b += (p.x - mx) ** 2; c += (p.y - my) ** 2; }); return a / Math.sqrt(b * c); };
function spark(vals, c, w = 120, h = 26){ const mn = Math.min(...vals), mx = Math.max(...vals), x = (i) => 2 + i / (vals.length - 1) * (w - 6), y = (v) => h - 3 - (v - mn) / ((mx - mn) || 1) * (h - 6); return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path d="${vals.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ',' + y(v).toFixed(1)).join('')}" fill="none" style="stroke:${c};stroke-width:2;vector-effect:non-scaling-stroke"/><circle cx="${x(vals.length - 1)}" cy="${y(vals[vals.length - 1])}" r="2.5" style="fill:${c}"/></svg>`; }

/* ---- 日本のタイルグリッド地図（2020年国勢調査の人口・概数、万人）---- */
const PREF = [['北海道', 11, 0, 522], ['青森', 10, 1, 124], ['秋田', 9, 2, 96], ['岩手', 10, 2, 121], ['石川', 6, 3, 113], ['富山', 7, 3, 103], ['新潟', 8, 3, 220], ['山形', 9, 3, 107], ['宮城', 10, 3, 230], ['福井', 6, 4, 77], ['岐阜', 7, 4, 198], ['長野', 8, 4, 205], ['群馬', 9, 4, 194], ['福島', 10, 4, 183], ['島根', 2, 5, 67], ['鳥取', 3, 5, 55], ['兵庫', 4, 5, 547], ['京都', 5, 5, 258], ['滋賀', 6, 5, 141], ['愛知', 7, 5, 754], ['山梨', 8, 5, 81], ['埼玉', 9, 5, 734], ['栃木', 10, 5, 193], ['山口', 1, 6, 134], ['広島', 2, 6, 280], ['岡山', 3, 6, 189], ['大阪', 4, 6, 884], ['奈良', 5, 6, 133], ['三重', 6, 6, 177], ['静岡', 7, 6, 363], ['神奈川', 8, 6, 924], ['東京', 9, 6, 1405], ['茨城', 10, 6, 287], ['佐賀', 0, 7, 81], ['福岡', 1, 7, 514], ['大分', 2, 7, 112], ['愛媛', 3, 7, 133], ['香川', 4, 7, 95], ['和歌山', 5, 7, 92], ['千葉', 10, 7, 628], ['長崎', 0, 8, 131], ['熊本', 1, 8, 174], ['宮崎', 2, 8, 107], ['高知', 3, 8, 69], ['徳島', 4, 8, 72], ['鹿児島', 1, 9, 159], ['沖縄', 0, 10, 147]];
function tileMap(box, o = {}){
  keep(box, () => tileMap(box, o)); box._keepNow = false;
  const vals = o.vals || PREF.map(p => p[3]), fmt = o.fmt || ((v) => nf(v) + (o.unit ?? '万人')), cols = seq5(box), dark = isDark(box);
  const s = [...vals].sort((a, b) => a - b), br = [.2, .4, .6, .8].map(q => s[Math.floor(q * (s.length - 1))]), cls = (v) => br.filter(b => v > b).length;
  const { W, H } = size(box); box._W = W; box._H = H; const lh = 20, cell = Math.max(10, Math.floor(Math.min(W / 12, (H - lh) / 11)));
  box.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;justify-content:center"><div class="dv-tiles" style="grid-template-columns:repeat(12, ${cell - 2}px);grid-template-rows:repeat(11, ${cell - 2}px)">${PREF.map((p, i) => { const c = cls(vals[i]), light = dark ? c >= 3 : c <= 1;
      return `<div class="${light ? 'lt' : ''}" style="grid-column:${p[1] + 1};grid-row:${p[2] + 1};background:${cols[c]}" data-tip="${esc(`<b>${p[0]}</b><br>${o.label || '人口'}：<b>${fmt(vals[i])}</b>`)}">${cell >= 22 ? p[0].slice(0, cell >= 30 ? 3 : 1) : ''}</div>`; }).join('')}</div>
    <div class="dv-ramp">少<span>${cols.map(c => `<i style="background:${c}"></i>`).join('')}</span>多　<span style="display:inline">（5段階・各約9件ずつ）</span></div></div>`;
  tip(box);
}
window.DVH = { keep, S, C, T, verdict, SER, SEQ, seq5, DIVR, DIVB, STATUS, isDark, nf, lin, ticks, niceMax, rng, gauss, quart, mean, size, rbar, tip, showTip, draw, sw, leg, gridY, barChart, lineChart, donut, scatter, corr, spark, PREF, tileMap };

/* ---- 共通のサンプルデータ ---- */
const MONTHS = Array.from({ length:12 }, (_, i) => `${i + 1}月`);
const PROD = [{ n:'商品A', c:SER[0], v:[120, 135, 150, 160, 155, 170, 190, 210, 200, 215, 230, 260] }, { n:'商品B', c:SER[1], v:[80, 85, 90, 100, 110, 105, 115, 120, 130, 125, 140, 150] }, { n:'商品C', c:SER[2], v:[40, 45, 60, 55, 70, 85, 90, 100, 115, 130, 145, 170] }];
const CH = [['検索', 4200], ['X', 2600], ['Instagram', 1900], ['YouTube', 1500], ['メール', 900], ['その他', 600]];
const R0 = rng(7), DUR = Array.from({ length:400 }, () => Math.max(.3, Math.exp(1.2 + gauss(R0) * .55)));
const SCAT = (() => { const r = rng(11); return Array.from({ length:36 }, () => { const x = 10 + r() * 90; return { x:Math.round(x), y:Math.round(Math.max(20, x * 4.2 + 60 + gauss(r) * 55)) }; }); })();

/* ================= 1. グラフの選び方 ================= */
const NAV = [
  ['比較', '大小を比べる', '<b>棒グラフ</b>（項目名が長いなら横棒）。大きい順に並べると一目で分かる。', '円グラフ・3Dの棒', (b) => barChart(b, { cats:CH.map(c => c[0]), series:[{ n:'訪問数', c:SER[0], v:CH.map(c => c[1]) }], horiz:true, vlab:true, lw:72 })],
  ['推移', '時間とともにどう変わったか', '<b>折れ線グラフ</b>。期間が短く、各時点の量を比べたいなら棒グラフも。', '項目ごとにバラバラな色の棒・時間を横軸にしない', (b) => lineChart(b, { xs:MONTHS, series:PROD, direct:true })],
  ['構成比', '全体の中の割合', '<b>100%積み上げ棒</b>（グループ間で比べやすい）。項目が2〜3個で1つだけなら<b>ドーナツ</b>も可。', '項目が多い円グラフ・3Dの円', (b) => barChart(b, { cats:['10代', '20代', '30代', '40代', '50代〜'], series:[{ n:'スマホ', c:SER[0], v:[88, 79, 66, 58, 44] }, { n:'PC', c:SER[1], v:[8, 16, 27, 33, 42] }, { n:'タブレット', c:SER[2], v:[4, 5, 7, 9, 14] }], horiz:true, stacked:true, pct:true, lw:56 })],
  ['分布', '値がどう散らばっているか', '<b>ヒストグラム</b>・<b>箱ひげ図</b>。平均だけでは分からない偏りが見える。', '平均値だけの棒グラフ', (b) => { const bins = 14, mx = 14, c = Array(bins).fill(0); DUR.forEach(v => c[Math.min(bins - 1, Math.floor(v / mx * bins))]++); barChart(b, { cats:c.map((_, i) => `${i}分`), series:[{ n:'人数', c:SER[0], v:c }], gap0:true, lblW:34 }); }],
  ['関係', '2つの量に関係があるか', '<b>散布図</b>。傾向線を足すと分かりやすい。3つ目の量は点の大きさで（バブルチャート）。', '2軸の折れ線（関係があるように見せてしまう）', (b) => scatter(b, { pts:SCAT, xLab:'広告費（万円）', yLab:'売上（万円）', trend:true })],
  ['地域', '場所ごとの違い', '<b>塗り分け地図</b>（コロプレス）。面積の差に引っぱられないよう<b>タイルグリッド地図</b>も便利。値は人口あたりなどに<b>そろえる</b>。', '人口をそのまま塗る（人が多い所が濃くなるだけ）', (b) => tileMap(b)],
  ['1つの数字', '一番伝えたい数字が1つ', '<b>グラフにしない</b>。大きな数字と、前と比べた変化を添える（KPIタイル）。', '数字1つのための円グラフ・ゲージ', (b) => { b.innerHTML = '<div class="dv-hero" style="height:100%"><div class="k">今月の売上</div><div class="v">¥1,284万</div><div class="k" style="color:var(--dv-up);font-weight:800">▲ 12.4%（先月比）</div></div>'; }],
];
const KINDS = [['棒グラフ', '比較', '項目ごとの量を比べる。<b>0から始める</b>'], ['横棒グラフ', '比較・ランキング', '項目名が長い・項目が多いとき'], ['折れ線グラフ', '推移', '時間の変化。系列は4本くらいまで'], ['面グラフ', '推移＋量', '量の大きさを強調。重ねすぎると見えない'], ['積み上げ棒・面', '内訳＋合計', '一番下以外は比べにくい点に注意'], ['100%積み上げ', '構成比の比較', 'グループ間で割合を比べる'], ['円・ドーナツ', '構成比', '<b>項目2〜4個まで</b>。近い値の比較は苦手'], ['散布図', '関係・相関', '2つの量の関係。外れ値も見つかる'], ['ヒストグラム', '分布', '値の散らばり。棒の間はすき間なし'], ['箱ひげ図', '分布の比較', '複数グループのばらつきを比べる'], ['ヒートマップ', '2つの切り口の量', '曜日×時間など。色の濃さで量'], ['ツリーマップ', '階層の構成比', '面積で量。項目が多い内訳に'], ['ファネル', '段階ごとの減り方', '購入までの離脱など'], ['ウォーターフォール', '増減の内訳', '前月→今月の差が何で生まれたか'], ['スパークライン', '小さな推移', '表やKPIの横に添える'], ['地図（コロプレス）', '地域差', '人口あたりなどの割合で塗る'], ['数字（KPIタイル）', '1つの重要な値', 'グラフより速く伝わる']];

TABS.push({ id:'choose', label:'グラフの選び方', icon:'📐',
  intro:'グラフは<b>「何を伝えたいか」</b>で選びます。大小の比較なら棒、時間の変化なら折れ線、割合なら100%積み上げ…。そして<b>伝えたいことが数字1つなら、グラフにしない</b>のが一番伝わります。この辞典のグラフは、色覚の多様性まで検証済みの配色で描いています。',
  sections:[
    C('触って理解する', [
      { name:'グラフ選びナビ', en:'Chart chooser', h:470, tags:['基本','体験','最重要'],
        demo:'<div class="kt"><span class="sw"></span><div class="dv-surf dv-pad"><div class="dv-title tt"></div><div class="dv-plot pl"></div></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.sw').replaceWith(seg(NAV.map(n => n[0]), i => { const [, q, rec, avoid, fn] = NAV[i]; $(el, '.tt').textContent = `伝えたいこと：${q}`; const pl = $(el, '.pl'); pl._last = null; fn(pl); verdict($(el, '.res'), '', `おすすめ：${rec}<br><span style="color:var(--bad)">避けたい：</span>${avoid}`); }).el); },
        desc:'グラフ選びは「何を伝えたいか」から逆算します。<b>比較・推移・構成比・分布・関係・地域・1つの数字</b>の7つに分けると、ほとんど迷いません。AIにグラフを頼むときも「〜の推移を見せたい」のように<b>目的</b>を伝えると、合ったグラフを選んでくれます。',
        prompt:'このデータ（CSV）で伝えたいのは「どのチャネルからの売上が伸びているか」です。目的に合うグラフの種類を選んで、理由と一緒に提案して。その上で Recharts で実装して。' },
      { name:'同じデータ、違うグラフ', en:'Same data, different stories', h:470, tags:['体験','比較'],
        demo:'<div class="kt"><span class="sw"></span><div class="dv-surf dv-pad"><div class="lg"></div><div class="dv-plot pl"></div></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.lg').innerHTML = leg(PROD);
          const V = [['折れ線', (b) => lineChart(b, { xs:MONTHS, series:PROD, direct:true }), '<b>推移</b>がよく分かる。商品Cの伸びが急なことが一目で。'], ['グループ棒', (b) => barChart(b, { cats:MONTHS, series:PROD }), '月ごとの<b>商品間の比較</b>向き。12か月×3本は少しうるさい。'], ['積み上げ棒', (b) => barChart(b, { cats:MONTHS, series:PROD, stacked:true }), '<b>合計の推移</b>が分かる。ただし一番下以外の商品の変化は読みにくい。'], ['積み上げ面', (b) => lineChart(b, { xs:MONTHS, series:PROD, stack:true }), '合計と内訳の<b>流れ</b>。きれいだが、個々の値は読み取りにくい。'], ['表', (b) => { b._last = null; b.innerHTML = `<div class="kt-tblwrap" style="height:100%">${KIT.tbl(['月', ...PROD.map(p => p.n), '合計'], MONTHS.map((m, i) => [m, ...PROD.map(p => p.v[i]), PROD.reduce((a, p) => a + p.v[i], 0)]))}</div>`; }, '<b>正確な値</b>を知りたい人向け。傾向はつかみにくいので、グラフと併用する。']];
          $(el, '.sw').replaceWith(seg(V.map(v => v[0]), i => { V[i][1]($(el, '.pl')); verdict($(el, '.res'), '', V[i][2]); }).el); },
        desc:'同じ「3商品×12か月の売上」でも、グラフの種類で<b>見えてくることが変わります</b>。推移なら折れ線、月ごとの比較ならグループ棒、合計なら積み上げ。<b>1つのグラフで伝えることは1つ</b>に絞り、言いたいことに合わせて選びましょう。',
        prompt:'売上データ（月×商品）をダッシュボードに表示したい。「合計の推移」「商品ごとの伸び」「今月の内訳」の3つを伝えたいので、それぞれに合うグラフを選んで、3つのグラフを並べた画面を作って。' },
      { name:'グラフにしない方がいいとき', en:'When a number beats a chart', h:340, tags:['体験','KPI'],
        demo:'<div class="kt"><span class="sw"></span><div class="dv-surf dv-plot pl" style="display:flex"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const pl = $(el, '.pl');
          $(el, '.sw').replaceWith(seg(['円グラフで見せる', '数字1つで見せる'], i => { if (i === 0){ pl.innerHTML = '<div class="dv-plot" style="flex:1"></div>'; donut(pl.firstChild, [{ n:'スマホ', v:68, c:SER[0] }, { n:'PC・その他', v:32, c:SER[1] }], { center:'', sub:'' }); verdict($(el, '.res'), 'warn', '何%か読み取るのに時間がかかり、場所も取ります。'); }
            else { pl.innerHTML = '<div class="dv-hero" style="flex:1"><div class="v">68%</div><div class="k">のお客さまが<b>スマホ</b>から購入</div><div class="k" style="color:var(--dv-up);font-weight:800">▲ 5ポイント（前年比）</div></div>'; verdict($(el, '.res'), 'ok', '一瞬で伝わります。<b>前と比べた変化</b>を添えると、良いのか悪いのかも分かります。'); } }).el); },
        desc:'伝えたい数字が1つだけなら、グラフより<b>大きな数字</b>の方が速く正確に伝わります。円グラフやゲージは場所を取るわりに情報が少なめ。ダッシュボードの一番上には、こうした<b>KPIタイル</b>を並べるのが定番です。',
        prompt:'管理画面のトップに、今月の売上・新規会員数・解約率・平均単価の4つをKPIタイルで並べて。それぞれ大きな数字、前月比（上がったら緑の▲、下がったら赤の▼。解約率は下がるのが良いので色を逆に）、小さな推移の線を付けて。' },
    ], null, true),
    { title:'グラフの種類と使いどころ', note:'迷ったら<b>棒か折れ線</b>。この2つで多くの場面をカバーできます。円グラフは「項目2〜4個・合計が100%」のときだけ。',
      table:{ head:['グラフ', '伝えること', 'ポイント'], rows:KINDS } },
    S('データとグラフの基本用語', [
      T('量的データ', 'Quantitative', '数で表せるデータ（売上・人数・時間）。足したり平均したりできる。'),
      T('質的データ（カテゴリ）', 'Categorical', '種類を表すデータ（商品名・地域・性別）。順番に意味がない。色で区別するのに向く。'),
      T('順序データ', 'Ordinal', '順番に意味があるカテゴリ（満足度の5段階・S/M/L）。1色の濃淡で表すと伝わる。'),
      T('時系列データ', 'Time series', '時間の順に並んだデータ。横軸に時間を置き、左から右へ流す。'),
      T('指標と切り口', 'Measure / Dimension', '指標＝数える量（売上）、切り口＝分ける観点（月・商品・地域）。「月別・商品別の売上」のように組み合わせる。', null, ['基本']),
      T('系列', 'Series', 'グラフの中の1本の線・1色の棒のまとまり。凡例で区別する。'),
      T('粒度', 'Granularity', 'データの細かさ（日・週・月）。期間が長いほど粗い粒度で集計すると見やすい。'),
      T('集計', 'Aggregation', '合計・平均・件数・最大などにまとめること。何で集計したかをグラフに明記する。'),
      T('実数と割合', 'Counts vs rates', '「件数」と「率」で見え方が大きく変わる。地域や期間で母数が違うときは割合（人口あたり等）に。', null, ['注意']),
      T('1グラフ1メッセージ', 'One message per chart', '1つのグラフで言うことは1つ。タイトルに結論を書く（「商品Cが3倍に成長」）とさらに伝わる。', null, ['コツ']),
      T('結論タイトル', 'Action title', '「月別売上」ではなく「商品Cの売上が1年で4倍に」のように、読み取ってほしいことをタイトルにする。'),
      T('出典と注記', 'Source / notes', 'データの出どころ・期間・単位・集計方法を小さく添える。信頼性が上がる。'),
    ]),
  ]});

/* ================= 2. 基本のグラフ ================= */
const QTR = ['1Q', '2Q', '3Q', '4Q'], QS = PROD.map(p => ({ ...p, v:[0, 1, 2, 3].map(q => p.v.slice(q * 3, q * 3 + 3).reduce((a, b) => a + b, 0)) }));
const HOURS = Array.from({ length:24 }, (_, i) => i), DAYS = ['月', '火', '水', '木', '金', '土', '日'];
const HEAT = DAYS.map((d, di) => HOURS.map(h => { const we = di >= 5, base = we ? (h >= 9 && h <= 22 ? 40 + 35 * Math.sin((h - 9) / 13 * Math.PI) : 6) : (h >= 7 && h <= 9 ? 45 : h >= 12 && h <= 13 ? 55 : h >= 19 && h <= 23 ? 50 + (h - 19) * 8 : h >= 1 && h <= 6 ? 3 : 20); return Math.round(base + ((di * 7 + h * 13) % 9)); }));
const BOXG = (() => { const r = rng(21); return [['渋谷店', 52, 14], ['新宿店', 46, 9], ['横浜店', 38, 20], ['大宮店', 41, 6]].map(([n, mu, sd]) => ({ n, v:Array.from({ length:40 }, () => Math.round(mu + gauss(r) * sd + (r() < .05 ? sd * 3 : 0))) })); })();

TABS.push({ id:'basic', label:'基本のグラフ', icon:'📊',
  intro:'よく使うグラフを、<b>マウスを乗せると値が出る</b>動く見本で確認しましょう。棒の端だけ少し丸める・線は2px・グリッドは控えめ・2系列以上は凡例と直接ラベル…といった<b>見やすさの細かいルール</b>も、すべての見本に入っています。',
  sections:[
    C('触って理解する', [
      { name:'棒グラフ', en:'Bar chart', h:410, tags:['比較','体験','定番'],
        demo:'<div class="kt"><div class="kt-row"><span class="sw"></span><div class="ck" style="display:flex;flex-wrap:wrap;gap:4px 10px;font-size:11.5px"></div></div><div class="dv-surf dv-pad"><div class="dv-title">流入元ごとの訪問数（10月）</div><div class="dv-plot pl"></div></div></div>',
        init:(el) => { let horiz = 0; const st = { sort:true, hl:false };
          $(el, '.ck').innerHTML = '<label><input type="checkbox" data-k="sort" checked>大きい順</label><label><input type="checkbox" data-k="hl">一番大きい物を強調</label>';
          const run = () => { const d = st.sort ? [...CH].sort((a, b) => b[1] - a[1]) : [3, 0, 5, 2, 4, 1].map(i => CH[i]); const hi = d.findIndex(x => x[1] === Math.max(...d.map(y => y[1]))); barChart($(el, '.pl'), { cats:d.map(x => x[0]), series:[{ n:'', c:SER[0], v:d.map(x => x[1]) }], horiz:!!horiz, vlab:true, lw:72, hl:st.hl ? hi : null, unit:'人' }); };
          $$(el, '.ck input').forEach(i => i.onchange = () => { st[i.dataset.k] = i.checked; run(); });
          $(el, '.sw').replaceWith(seg(['縦', '横'], i => { horiz = i; run(); }).el); },
        desc:'量を比べる基本のグラフ。<b>縦軸は必ず0から</b>始め、項目に順番がなければ<b>大きい順</b>に並べます。項目名が長いときや数が多いときは<b>横棒</b>に。1系列なら凡例はいらず、タイトルで何の量か伝えます。',
        prompt:'Recharts で、流入元ごとの訪問数を横棒グラフで表示して。大きい順に並べ、棒の右に値を表示、一番多い項目だけ濃い色で他は薄く。縦軸のラベルが長くても切れないように幅を調整して。' },
      { name:'折れ線グラフ', en:'Line chart', h:420, tags:['推移','体験','定番'],
        demo:'<div class="kt"><div class="dv-surf dv-pad"><div class="dv-title">商品別の月間売上（万円）</div>' + leg(PROD) + '<div class="dv-plot pl"></div></div></div>', hint:'線の上でマウスを動かす',
        init:(el) => { lineChart($(el, '.pl'), { xs:MONTHS, series:PROD, direct:true, unit:'万円' }); },
        desc:'時間による変化を見せる定番。線は<b>2px</b>、目盛り線は薄く。系列が4本くらいまでなら<b>線の終わりに名前</b>（直接ラベル）を置くと、凡例と見比べずに済みます。マウスを乗せると、その月の全商品の値がまとめて出ます（クロスヘア）。',
        prompt:'Chart.js で商品別の月間売上の折れ線グラフを作って。線は2px、点は普段は出さずホバー時だけ、ツールチップは同じ月の全商品をまとめて表示（mode: index）、グリッド線は薄く、凡例は上に。' },
      { name:'積み上げと100%積み上げ', en:'Stacked bar / area', h:430, tags:['内訳','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="dv-surf dv-pad">' + leg(PROD) + '<div class="dv-plot pl"></div></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const V = [['積み上げ棒', (b) => barChart(b, { cats:QTR, series:QS, stacked:true }), '<b>合計</b>と内訳。合計の伸びがよく分かるが、真ん中の商品Bの変化は読みにくい。'], ['100%積み上げ', (b) => barChart(b, { cats:QTR, series:QS, stacked:true, pct:true }), '<b>割合の変化</b>。商品Cの比率が増えているのがはっきり分かる。合計の大きさは消える。'], ['積み上げ面', (b) => lineChart(b, { xs:MONTHS, series:PROD, stack:true }), '<b>流れ</b>を見せる。月が多いときに。']];
          $(el, '.sw').replaceWith(seg(V.map(v => v[0]), i => { V[i][1]($(el, '.pl')); verdict($(el, '.res'), '', V[i][2]); }).el); },
        desc:'<b>合計と内訳</b>を同時に見せたいときは積み上げ、<b>割合の変化</b>を見せたいときは100%積み上げ。積み上げは、一番下以外の系列は基準がずれるので比べにくい、という弱点があります。重なりの境目には細いすき間を入れると区切りが見やすくなります。',
        prompt:'四半期ごとの売上を商品別の積み上げ棒グラフにして。切り替えボタンで「金額」と「割合（100%積み上げ）」を切り替えられるようにし、ツールチップには金額と割合の両方を表示して。' },
      { name:'円グラフ・ドーナツ', en:'Pie / donut', h:400, tags:['構成比','体験','注意'],
        demo:'<div class="kt"><span class="sw"></span><div class="dv-surf" style="flex:1;display:flex;gap:8px;padding:8px;min-height:0"><div class="dv-plot pl"></div><div class="lg" style="display:flex;flex-direction:column;justify-content:center;gap:4px;font-size:11.5px;min-width:0"></div></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const D6 = CH.map((c, i) => ({ n:c[0], v:c[1], c:SER[i] })), top3 = [...D6.slice(0, 3), { n:'その他', v:D6.slice(3).reduce((a, b) => a + b.v, 0), c:'var(--dv-gray)' }];
          const run = (d, msg, cls) => { donut($(el, '.pl'), d, { sub:'合計（人）' }); const t = d.reduce((a, b) => a + b.v, 0); $(el, '.lg').innerHTML = d.map(x => `<span style="display:flex;align-items:center;gap:5px;white-space:nowrap">${sw(x.c).replace('<i ', '<i class="lgi" ')}${esc(x.n)} <b style="margin-left:auto;padding-left:6px">${nf(x.v / t * 100)}%</b></span>`).join(''); $$(el, '.lgi').forEach(i => Object.assign(i.style, { width:'10px', height:'10px', borderRadius:'3px', display:'inline-block' })); verdict($(el, '.res'), cls, msg); };
          $(el, '.sw').replaceWith(seg(['6項目', '3項目＋その他'], i => i ? run(top3, '項目を絞り、残りは<b>灰色の「その他」</b>にまとめると読みやすくなります。', 'ok') : run(D6, '6項目だと、似た大きさの扇形を比べるのが難しくなります。', 'warn')).el); },
        desc:'円グラフは「全体の中の割合」を表しますが、人の目は<b>角度や面積の比較が苦手</b>です。使うなら<b>項目は2〜4個</b>、大きい順に12時の位置から時計回り、残りは「その他」にまとめます。値の比較が大事なら棒グラフの方が正確に伝わります。',
        prompt:'アンケートの回答の割合をドーナツグラフにして。項目は大きい順に時計回りで並べ、上位3つ以外は灰色の「その他」にまとめ、中央に回答数の合計、横に項目名と割合の一覧を表示して。' },
      { name:'散布図', en:'Scatter plot', h:420, tags:['関係','体験'],
        demo:'<div class="kt"><label class="kt-row" style="font-size:11.5px"><input type="checkbox" class="tr" checked>傾向線を表示</label><div class="dv-surf dv-pad"><div class="dv-title">店舗ごとの広告費と売上（月）</div><div class="dv-plot pl"></div></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const run = () => { scatter($(el, '.pl'), { pts:SCAT, xLab:'広告費（万円）', yLab:'売上（万円）', trend:$(el, '.tr').checked }); verdict($(el, '.res'), '', `相関係数 r = <b>${corr(SCAT).toFixed(2)}</b>（1に近いほど「一緒に増える」関係が強い）。ただし<b>相関があっても原因とは限りません</b>（「データの準備」タブ）。`); }; $(el, '.tr').onchange = run; run(); },
        desc:'2つの量の<b>関係</b>を見るグラフ。右上がりなら「一緒に増える」、ばらばらなら関係が薄い。傾向線（回帰直線）を足すと関係が分かりやすく、<b>線から大きく外れた点（外れ値）</b>も見つけやすくなります。点が重なる場合は少し透明にします。',
        prompt:'商品ごとの「価格」と「レビューの星の平均」の散布図を作って。点にマウスを乗せると商品名を表示、傾向線を点線で描き、相関係数をグラフの右上に表示して。' },
      { name:'ヒストグラム', en:'Histogram', h:430, tags:['分布','体験'],
        demo:'<div class="kt"><div class="sl"></div><div class="dv-surf dv-pad"><div class="dv-title">サイトの滞在時間（400人）</div><div class="dv-plot pl"></div></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const q = quart(DUR), mu = mean(DUR);
          const run = (bins) => { const mx = 16, c = Array(bins).fill(0); DUR.forEach(v => c[Math.min(bins - 1, Math.floor(v / mx * bins))]++);
            barChart($(el, '.pl'), { cats:c.map((_, i) => nf(i * mx / bins, 1)), series:[{ n:'人数', c:SER[0], v:c }], gap0:true, lblW:34, unit:'人', after:(svg) => { const W = svg.viewBox.baseVal.width, m = 44, iw = W - m - 8, x = (v) => m + v / mx * iw, H = svg.viewBox.baseVal.height;
            svg.insertAdjacentHTML('beforeend', `<line x1="${x(mu)}" x2="${x(mu)}" y1="10" y2="${H - 22}" style="stroke:var(--dv2);stroke-width:2;stroke-dasharray:4 3"/><text x="${x(mu) + 4}" y="20" style="fill:var(--dv-ink);font-weight:700">平均 ${mu.toFixed(1)}分</text><line x1="${x(q.med)}" x2="${x(q.med)}" y1="24" y2="${H - 22}" style="stroke:var(--dv-ink);stroke-width:2"/><text x="${x(q.med) + 4}" y="34" style="fill:var(--dv-ink);font-weight:700">中央値 ${q.med.toFixed(1)}分</text>`); } });
            verdict($(el, '.res'), '', `区切り：<b>${bins}個</b>。少なすぎると形がつぶれ、多すぎるとギザギザに。右に長い分布では<b>平均が中央値より大きく</b>なります。`); };
          const box = $(el, '.sl'); box.classList.add('t3-ctl'); box.style.cssText = 'display:grid;grid-template-columns:auto 1fr auto;gap:4px 8px;align-items:center;font-size:11.5px'; box.innerHTML = '<b style="font-size:11px;color:var(--muted)">区切りの数</b><input type="range" min="4" max="40" value="16" aria-label="区切りの数"><output style="font:700 11px var(--mono)">16</output>';
          $(box, 'input').oninput = (e) => { $(box, 'output').textContent = e.target.value; run(+e.target.value); }; run(16); },
        desc:'値を区間に分けて、それぞれ何件あるかを棒で表すグラフ。<b>分布の形</b>（山がいくつあるか・偏り・外れ値）が見えます。棒と棒の間は<b>すき間なし</b>（連続した値なので）。区切りの数で見え方が変わるので、いくつか試すのがコツです。',
        prompt:'注文金額の分布をヒストグラムで表示して。区切りの幅をスライダーで変えられるようにし、平均と中央値を縦線で重ねて、それぞれラベルを付けて。' },
      { name:'箱ひげ図', en:'Box plot', h:420, tags:['分布','体験'],
        demo:'<div class="kt"><label class="kt-row" style="font-size:11.5px"><input type="checkbox" class="pt">1件ずつの点も表示</label><div class="dv-surf dv-pad"><div class="dv-title">店舗別の1日の来店数（40日）</div><div class="dv-plot pl"></div></div></div>',
        init:(el) => { const run = () => { const box = $(el, '.pl'), { W, H } = size(box), m = { l:44, r:10, t:10, b:22 }, iw = W - m.l - m.r, ih = H - m.t - m.b, all = BOXG.flatMap(g => g.v), y = lin(0, niceMax(Math.max(...all)), m.t + ih, m.t), bw = iw / BOXG.length, r = rng(5);
            let g = gridY(y, ticks(0, niceMax(Math.max(...all)), 5), m.l, W - m.r, nf);
            BOXG.forEach((gr, i) => { const q = quart(gr.v), iqr = q.q3 - q.q1, lo = Math.min(...gr.v.filter(v => v >= q.q1 - 1.5 * iqr)), hi = Math.max(...gr.v.filter(v => v <= q.q3 + 1.5 * iqr)), cx = m.l + i * bw + bw / 2, w = Math.min(46, bw * .45), c = SER[i];
              const tp = esc(`<b>${gr.n}</b><br>最大（ひげ）<b>${hi}</b><br>上位25%の境 <b>${nf(q.q3)}</b><br>中央値 <b>${nf(q.med)}</b><br>下位25%の境 <b>${nf(q.q1)}</b><br>最小（ひげ）<b>${lo}</b>`);
              g += `<line x1="${cx}" x2="${cx}" y1="${y(hi)}" y2="${y(lo)}" style="stroke:${c};stroke-width:1.5"/><line x1="${cx - w / 4}" x2="${cx + w / 4}" y1="${y(hi)}" y2="${y(hi)}" style="stroke:${c};stroke-width:1.5"/><line x1="${cx - w / 4}" x2="${cx + w / 4}" y1="${y(lo)}" y2="${y(lo)}" style="stroke:${c};stroke-width:1.5"/>`;
              g += `<rect x="${cx - w / 2}" y="${y(q.q3)}" width="${w}" height="${y(q.q1) - y(q.q3)}" rx="4" style="fill:color-mix(in srgb, ${c} 22%, var(--dv-surface));stroke:${c};stroke-width:1.5" data-tip="${tp}"/><line x1="${cx - w / 2}" x2="${cx + w / 2}" y1="${y(q.med)}" y2="${y(q.med)}" style="stroke:${c};stroke-width:2.5" pointer-events="none"/>`;
              gr.v.filter(v => v < lo || v > hi).forEach(v => { g += `<circle cx="${cx}" cy="${y(v)}" r="4" style="fill:var(--dv-surface);stroke:${c};stroke-width:1.5" data-tip="${esc(`${gr.n}：外れ値 <b>${v}</b>`)}"/>`; });
              if ($(el, '.pt').checked) gr.v.forEach(v => { g += `<circle cx="${cx + w / 2 + 6 + r() * Math.max(4, bw / 2 - w / 2 - 12)}" cy="${y(v)}" r="2.5" style="fill:${c};opacity:.55" pointer-events="none"/>`; });
              g += `<text class="dv-lbl" x="${cx}" y="${H - 6}" text-anchor="middle">${gr.n}</text>`; });
            draw(box, W, H, g); }; $(el, '.pt').onchange = run; run(); },
        desc:'データの<b>散らばり</b>を5つの数字（最小・下位25%・中央値・上位25%・最大）で表すグラフ。箱の中に真ん中の半分のデータが入ります。<b>複数のグループのばらつきを並べて比べる</b>のが得意。ひげより外の点は<b>外れ値</b>です。',
        prompt:'店舗ごとの日別売上を箱ひげ図で比較できるようにして。箱にマウスを乗せると中央値・四分位・最大最小をツールチップで表示し、外れ値は白抜きの点で、チェックで全データの点も重ねて表示できるようにして。' },
      { name:'ヒートマップ', en:'Heatmap', h:430, tags:['2つの切り口','体験'],
        demo:'<div class="kt"><div class="dv-surf dv-pad"><div class="dv-title">曜日×時間帯のアクセス数</div><div class="dv-plot pl"></div><div class="dv-ramp rp"></div></div></div>',
        init:(el) => { const box = $(el, '.pl'), { W, H } = size(box), m = { l:22, r:4, t:4, b:16 }, cw = (W - m.l - m.r) / 24, ch = (H - m.t - m.b) / 7, cols = seq5(box), mx = Math.max(...HEAT.flat()), cl = (v) => Math.min(4, Math.floor(v / (mx + 1) * 5));
          let g = ''; HEAT.forEach((row, d) => { g += `<text class="dv-lbl" x="${m.l - 5}" y="${m.t + d * ch + ch / 2 + 4}" text-anchor="end">${DAYS[d]}</text>`; row.forEach((v, h) => { g += `<rect x="${m.l + h * cw + 1}" y="${m.t + d * ch + 1}" width="${Math.max(1, cw - 2)}" height="${Math.max(1, ch - 2)}" rx="2" style="fill:${cols[cl(v)]}" data-tip="${esc(`${DAYS[d]}曜 ${h}時台：<b>${v}</b>件`)}"/>`; }); });
          HOURS.forEach(h => { if (h % (cw < 14 ? 6 : 3) === 0) g += `<text class="dv-lbl" x="${m.l + h * cw + cw / 2}" y="${H - 3}" text-anchor="middle">${h}時</text>`; });
          draw(box, W, H, g); $(el, '.rp').innerHTML = `少<span>${cols.map(c => `<i style="background:${c}"></i>`).join('')}</span>多`; },
        desc:'2つの切り口（曜日×時間など）の量を、<b>色の濃さ</b>で表すグラフ。「平日の朝と夜、週末の昼に集中」のようなパターンが一目で分かります。量の大小は<b>1色の濃淡</b>で（虹色は使わない）。正確な値はツールチップで補います。',
        prompt:'注文データから「曜日×時間帯」の注文数ヒートマップを作って。色は1色（青）の濃淡で5段階、セルにマウスを乗せると件数を表示、下に色の凡例を付けて。データは orders テーブルの created_at から集計して。' },
    ], null, true),
    S('グラフの部品の名前', [
      T('軸と目盛り', 'Axis / ticks', '縦軸（Y軸）と横軸（X軸）。目盛りは「0・50・100」のようにきりのいい数で4〜6個くらい。'),
      T('グリッド線', 'Gridlines', '値を読むための薄い線。<b>濃すぎると主役のデータが目立たなくなる</b>。横線だけで十分なことが多い。'),
      T('基線（ベースライン）', 'Baseline', '0の位置の線。棒グラフは必ずここから伸ばす。'),
      T('凡例', 'Legend', 'どの色が何かの説明。<b>2系列以上なら必ず付ける</b>。1系列なら不要（タイトルで伝える）。'),
      T('直接ラベル', 'Direct labels', '線の終わりや棒の横に直接名前・値を書く。凡例と見比べる手間がなくなる。4系列くらいまで。', null, ['おすすめ']),
      T('データラベル', 'Data labels', '棒や点の値そのものを書くこと。全部に付けると読みにくいので、大事な所だけに。'),
      T('ツールチップ', 'Tooltip', 'マウスを乗せると出る小さな説明。正確な値はここで見せ、グラフ自体はすっきりさせる。'),
      T('クロスヘア', 'Crosshair', '折れ線でマウスの位置に縦線を出し、同じ時点の全系列の値をまとめて見せる。'),
      T('マーカー', 'Markers', '折れ線の点。普段は出さずに、ホバー時だけ出すとすっきりする。'),
      T('棒の幅とすき間', 'Bar width / gap', '棒の幅はすき間より太めに。隣り合う棒・積み上げの境目には細いすき間（2px）。'),
      T('四分位・中央値', 'Quartiles / median', '小さい順に並べて、25%・50%・75%の位置の値。中央値は外れ値に左右されにくい。'),
      T('外れ値', 'Outlier', '他から大きく離れた値。入力ミスか、本当に特別な値かを確かめる。'),
      T('相関係数', 'Correlation (r)', '−1〜1。1に近いほど「一緒に増える」、−1に近いほど「片方が増えると片方が減る」。0付近は関係が薄い。'),
      T('カラーバー（色の凡例）', 'Color legend', 'ヒートマップや地図で、色の濃さがどの値かを示す帯。'),
    ]),
  ]});

/* ================= 3. 見やすくするルール ================= */
const CVD = { p:'0.152286 1.052583 -0.204868 0 0  0.114503 0.786281 0.099216 0 0  -0.003882 -0.048116 1.051998 0 0  0 0 0 1 0', d:'0.367322 0.860646 -0.227968 0 0  0.280085 0.672501 0.047413 0 0  -0.011820 0.042940 0.968881 0 0  0 0 0 1 0', t:'1.255528 -0.076749 -0.178779 0 0  -0.078411 0.930809 0.147602 0 0  0.004733 0.691367 0.303900 0 0  0 0 0 1 0', g:'0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0' };
const RAINBOW = ['#6e40aa', '#4c6edb', '#23abd8', '#1ddfa3', '#52f667', '#aff05b', '#e2b72f', '#ff7847', '#fe4b83', '#be3caf'];
const ANTI = [['2軸グラフ（左右に別の目盛り）', '目盛りの取り方で、関係があるようにもないようにも見せられてしまう', '2つのグラフに分ける／最初を100にそろえる（指数化）'], ['棒グラフの軸を途中から', '小さな差が何倍にも見える', '棒グラフは0から。差を見せたいなら差そのものをグラフに'], ['3Dのグラフ', '奥行きで大きさがゆがむ。手前の物が大きく見える', '平面のグラフにする'], ['近い値の円グラフ', '角度の差はほとんど見分けられない', '大きい順の横棒グラフ'], ['虹色のグラデーション', '色の境目に、データにない「区切り」が見える。明るさが順番になっていない', '1色の濃淡（連続）、プラスマイナスは2色（発散）'], ['発散の真ん中に色', '「ゼロ・普通」の所が目立ってしまう', '真ん中は灰色'], ['色だけで区別', '色覚の多様性や白黒印刷で読めない', '直接ラベル・形・模様を併用'], ['系列の色が並び順で変わる', 'フィルターすると同じ物の色が変わり、混乱する', '系列ごとに色を固定'], ['項目が多すぎる凡例', '9色以上は見分けられない', '上位だけ色を付け、残りは「その他」の灰色に'], ['全部の点に数値ラベル', '数字で埋まって形が見えない', '大事な点だけ・ツールチップで補う'], ['濃いグリッド・枠・影', 'データより飾りが目立つ', '薄い横線だけにする']];

TABS.push({ id:'rules', label:'見やすくするルール', icon:'🎯',
  intro:'同じデータでも、<b>軸・色・飾り</b>の扱いで、正しく伝わるか、誤解されるかが変わります。よくある<b>悪い例と直し方</b>を切り替えて見比べましょう。色は「何のために使うか（区別・量・プラスマイナス・状態）」で選び方が決まります。',
  sections:[
    C('悪い例と良い例', [
      { name:'棒グラフの軸は0から', en:'Truncated axis', h:380, tags:['よくある失敗','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="dv-surf dv-pad"><div class="dv-title">顧客満足度（点）</div><div class="dv-plot pl"></div></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const d = { cats:['A社', '自社', 'B社'], series:[{ n:'満足度', c:SER[0], v:[96, 98, 97] }], vlab:true };
          $(el, '.sw').replaceWith(seg(['0から始める', '途中（95）から始める'], i => { barChart($(el, '.pl'), { ...d, yMin:i ? 95 : 0, yMax:100 }); verdict($(el, '.res'), i ? 'bad' : 'ok', i ? '❌ 2点の差が<b>何倍もの差</b>に見えます。棒は長さで量を表すので、途中から始めるとうそになります。' : '✓ 実際の差（2点）がそのまま見えます。差を強調したいなら、<b>差そのもの</b>をグラフにしましょう。'); }).el); },
        desc:'棒グラフは<b>棒の長さ</b>で量を表すので、縦軸は<b>必ず0から</b>。途中から始めると、わずかな差が大げさに見えます。折れ線グラフは「変化の形」を見るので、0から始めなくても構いません（その場合は軸の数字をはっきり書く）。',
        prompt:'このグラフの縦軸が途中から始まっていて誤解を招きそうです。棒グラフは0から始まるように直して。差を強調したい場合は、別に「差分」のグラフを作る案も出して。' },
      { name:'2軸グラフの罠', en:'Dual-axis charts', h:450, tags:['よくある失敗','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="dv-surf dv-pad pl0" style="gap:6px"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const YRS = ['2019', '2020', '2021', '2022', '2023', '2024', '2025'], SALES = [12, 13, 15, 16, 18, 19, 21], MEM = [40, 48, 60, 75, 92, 110, 131], box = $(el, '.pl0');
          const V = [() => { box.innerHTML = '<div class="dv-title">売上と会員数（2軸）</div>' + leg([{ n:'売上（億円・左）', c:SER[0] }, { n:'会員数（万人・右）', c:SER[1] }]) + '<div class="dv-plot pl"></div>'; const pl = $(box, '.pl'), { W, H } = size(pl), m = { l:34, r:34, t:10, b:22 }, ih = H - m.t - m.b, iw = W - m.l - m.r, x = (i) => m.l + i / 6 * iw, yl = lin(10, 22, m.t + ih, m.t), yr = lin(0, 140, m.t + ih, m.t);
              let g = [10, 14, 18, 22].map(v => `<line class="dv-grid" x1="${m.l}" x2="${W - m.r}" y1="${yl(v)}" y2="${yl(v)}"/><text class="dv-lbl" x="${m.l - 5}" y="${yl(v) + 3}" text-anchor="end" style="fill:var(--dv1)">${v}</text>`).join('') + [0, 35, 70, 105, 140].map(v => `<text class="dv-lbl" x="${W - m.r + 5}" y="${yr(v) + 3}" style="fill:var(--dv2)">${v}</text>`).join('');
              g += `<path class="ln" d="${SALES.map((v, i) => (i ? 'L' : 'M') + x(i) + ',' + yl(v)).join('')}" style="stroke:var(--dv1)"/><path class="ln" d="${MEM.map((v, i) => (i ? 'L' : 'M') + x(i) + ',' + yr(v)).join('')}" style="stroke:var(--dv2)"/>` + YRS.map((y, i) => i % 2 ? '' : `<text class="dv-lbl" x="${x(i)}" y="${H - 6}" text-anchor="middle">${y}</text>`).join('');
              draw(pl, W, H, g); return ['bad', '❌ 線が交差して「会員数が売上を追い抜いた」ように見えますが、<b>単位も目盛りも違う</b>ので意味がありません。左右の目盛りを変えるだけで、どんな関係にも見せられます。']; },
            () => { box.innerHTML = '<div class="dv-title">売上（億円）</div><div class="dv-plot a"></div><div class="dv-title">会員数（万人）</div><div class="dv-plot b"></div>'; lineChart($(box, '.a'), { xs:YRS, series:[{ n:'売上', c:SER[0], v:SALES }], unit:'億円' }); lineChart($(box, '.b'), { xs:YRS, series:[{ n:'会員数', c:SER[1], v:MEM }], unit:'万人' }); return ['ok', '✓ <b>2つのグラフに分けて</b>、横軸（年）をそろえて縦に並べます。それぞれの変化が正しく読めます。']; },
            () => { box.innerHTML = '<div class="dv-title">2019年を100とした伸び</div>' + leg([{ n:'売上', c:SER[0] }, { n:'会員数', c:SER[1] }]) + '<div class="dv-plot pl"></div>'; lineChart($(box, '.pl'), { xs:YRS, series:[{ n:'売上', c:SER[0], v:SALES.map(v => v / SALES[0] * 100) }, { n:'会員数', c:SER[1], v:MEM.map(v => v / MEM[0] * 100) }], direct:true, dec:0 }); return ['ok', '✓ 最初の年を100にそろえる（<b>指数化</b>）と、1つの軸で「どちらがどれだけ伸びたか」を正しく比べられます。会員数は3倍以上、売上は1.75倍。']; }];
          $(el, '.sw').replaceWith(seg(['2軸（悪い例）', '2つに分ける', '最初を100にそろえる'], i => { const [c, m] = V[i](); verdict($(el, '.res'), c, m); }).el); },
        desc:'左右に別々の目盛りを持つ<b>2軸グラフ</b>は、目盛りの取り方しだいで「関係がある」「追い抜いた」ように見せられてしまう、最も多いグラフの失敗です。単位の違う2つの量は、<b>2つのグラフに分ける</b>か、<b>最初の値を100にそろえる（指数化）</b>のが正解です。',
        prompt:'このダッシュボードの2軸グラフ（売上と会員数）を、誤解のない形に直して。横軸をそろえた2つのグラフを縦に並べる版と、最初の月を100とした指数で1つのグラフにする版の両方を作って。' },
      { name:'円グラフは近い値が苦手', en:'Pie vs sorted bar', h:400, tags:['よくある失敗','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="dv-surf dv-pad"><div class="dv-title">好きな季節（%）　どれが一番多い？</div><div class="dv-plot pl"></div></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const D = [['春', 21], ['夏', 23], ['秋', 22], ['冬', 18], ['どれも', 16]];
          $(el, '.sw').replaceWith(seg(['円グラフ', '大きい順の横棒'], i => { if (!i){ donut($(el, '.pl'), D.map((d, j) => ({ n:d[0], v:d[1], c:SER[j] })), { hole:0, center:'' }); verdict($(el, '.res'), 'warn', '夏・秋・春のどれが一番大きいか、角度では<b>ほとんど分かりません</b>。'); }
            else { const s = [...D].sort((a, b) => b[1] - a[1]); barChart($(el, '.pl'), { cats:s.map(d => d[0]), series:[{ n:'割合', c:SER[0], v:s.map(d => d[1]) }], horiz:true, vlab:true, unit:'%', lw:48 }); verdict($(el, '.res'), 'ok', '✓ 一瞬で「夏＞秋＞春」と分かります。<b>長さの比較は、角度の比較よりずっと正確</b>です。'); } }).el); },
        desc:'人の目は<b>長さの違いには敏感、角度や面積の違いには鈍感</b>です。近い値が並ぶと、円グラフではほぼ区別できません。割合でも、比べることが目的なら<b>大きい順の横棒</b>が一番伝わります。3D の円グラフは手前が大きく見えるので、さらに不正確になります。',
        prompt:'このページの円グラフ（項目5つ）を、大きい順の横棒グラフに置き換えて。棒の右に%を表示して、合計が100%になることが分かるように注記を入れて。' },
      { name:'色は「役割」で選ぶ', en:'Color by job', h:450, tags:['色','体験','最重要'],
        demo:'<div class="kt"><span class="sw"></span><div class="pal"></div><div class="dv-surf dv-pad"><div class="dv-plot pl"></div></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const box = $(el, '.pl');
          const V = [() => { $(el, '.pal').innerHTML = `<div class="dv-pal">${SER.map((c, i) => `<i style="background:${c}">${i + 1}</i>`).join('')}</div>`; box._last = null; box.innerHTML = '<div style="display:flex;flex-direction:column;height:100%">' + leg(PROD) + '<div class="dv-plot" style="flex:1"></div></div>'; barChart($(box, '.dv-plot'), { cats:QTR, series:QS }); return '<b>カテゴリ（区別）</b>：種類を見分ける。<b>決まった順番</b>で使い、系列ごとに色を固定。8色まで（それ以上は「その他」へ）。'; },
            () => { const st = [100, 200, 300, 400, 500, 600, 700].map(k => SEQ[k]); $(el, '.pal').innerHTML = `<div class="dv-pal">${st.map(c => `<i style="background:${c}"></i>`).join('')}</div>`; tileMap(box); return '<b>連続（量）</b>：少ない→多いを<b>1色の明るさ</b>で。薄い＝少ない、濃い＝多い。地図・ヒートマップに。'; },
            () => { const st = [...DIVB].reverse().concat(['var(--dv-mid)'], DIVR); $(el, '.pal').innerHTML = `<div class="dv-pal">${st.map(c => `<i style="background:${c}"></i>`).join('')}</div>`; const v = [12, 8, 3, -2, -6, 5, -11, 15], cats = ['北海道', '東北', '関東', '中部', '近畿', '中国', '四国', '九州'];
              barChart(box, { cats, series:[{ n:'前年比', c:'', v:v.map(Math.abs) }], catColors:v.map(x => x >= 0 ? (x > 10 ? DIVB[3] : DIVB[2]) : (x < -10 ? DIVR[3] : DIVR[2])), fmt:(n) => nf(n), vlab:false, horiz:true, lw:52, after:(svg) => svg.querySelectorAll('[data-tip]').forEach((p, i) => p.dataset.tip = `${cats[i]}：<b>${v[i] > 0 ? '+' : ''}${v[i]}%</b>`) }); return '<b>発散（プラス・マイナス）</b>：真ん中（0・平均）から<b>2方向</b>へ。両端は反対の色（青↔赤）、<b>真ん中は灰色</b>。前年比・賛否に。（棒の長さは増減の大きさ）'; },
            () => { $(el, '.pal').innerHTML = `<div class="dv-pal">${Object.values(STATUS).map(s => `<i style="background:${s[0]}">${s[2]}</i>`).join('')}</div>`; box._last = null; box.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:8px;align-content:center;justify-content:center;height:100%">${[['サーバー', 'good'], ['決済API', 'good'], ['メール送信', 'warn'], ['画像変換', 'serious'], ['バックアップ', 'crit']].map(([n, k]) => `<span class="dv-status" style="--c:${STATUS[k][0]}" data-i="${STATUS[k][1]}">${n}：${STATUS[k][2]}</span>`).join('')}</div>`; return '<b>状態（良い・注意・危険）</b>：専用の4色を<b>状態にだけ</b>使う。必ず<b>アイコン＋言葉</b>とセット（色だけに頼らない）。系列の色には使わない。'; }];
          $(el, '.sw').replaceWith(seg(['カテゴリ', '連続', '発散', '状態'], i => verdict($(el, '.res'), '', V[i]())).el); },
        desc:'グラフの色は<b>「何のために使うか」</b>で選び方が決まります。種類を見分ける<b>カテゴリ</b>、量の大小を表す<b>連続</b>、プラスマイナスを表す<b>発散</b>、良い・悪いを表す<b>状態</b>の4つ。この辞典の色は、明るさ・色覚の多様性・背景とのコントラストを<b>計算で検証</b>したパレットです。',
        prompt:'このダッシュボードのグラフの色を整理して。系列の区別にはカテゴリ色（決まった順番・系列ごとに固定）、量の大小には1色の濃淡、前年比のプラスマイナスには青と赤（真ん中は灰色）、状態表示には緑・黄・橙・赤をアイコンと文字付きで使い分けて。' },
      { name:'虹色のグラデーションは避ける', en:'Avoid rainbow scales', h:360, tags:['色','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="dv-surf dv-pad"><div class="dv-title">10段階の値（0〜9）</div><div class="row" style="display:flex;gap:2px;flex:1;min-height:0"></div></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const steps = [100, 150, 200, 250, 300, 350, 450, 550, 600, 700].map(k => SEQ[k]);
          $(el, '.sw').replaceWith(seg(['虹色', '1色の濃淡'], i => { const cs = i ? steps : RAINBOW; $(el, '.row').innerHTML = cs.map((c, j) => `<div style="flex:1;border-radius:4px;background:${c};display:grid;place-items:end center;padding-bottom:4px;font:800 12px var(--mono);color:${i && j < 5 ? '#0b0b0b' : '#fff'}">${j}</div>`).join('');
            verdict($(el, '.res'), i ? 'ok' : 'bad', i ? '✓ <b>明るさが順番どおり</b>なので、白黒でも色覚の多様性があっても大小が分かります。' : '❌ 黄緑のあたりが一番明るく目立ち、色の境目に<b>データにない区切り</b>が見えます。どちらが大きいか直感的に分かりません。'); }).el); },
        desc:'虹色のグラデーションは派手ですが、<b>明るさが順番になっていない</b>ため「どちらが大きいか」が直感的に分かりません。色の境目にデータにない区切りも生まれます。量を表すなら<b>1色の濃淡</b>、プラスマイナスなら<b>2色＋真ん中灰色</b>が基本です。',
        prompt:'このヒートマップの色が虹色で読みにくいです。1色（青）の濃淡の5段階に変えて、薄い＝少ない、濃い＝多いになるようにし、色の凡例も付け直して。ダークモードでは別の段階を使って。' },
      { name:'1つだけ強調する', en:'Highlight one series', h:400, tags:['強調','体験'],
        demo:'<div class="kt"><label class="kt-row" style="font-size:11.5px"><input type="checkbox" class="hl" checked>自社だけ強調（他は灰色）</label><div class="dv-surf dv-pad"><div class="dv-title tt"></div><div class="dv-plot pl"></div></div></div>',
        init:(el) => { const names = ['自社', 'A社', 'B社', 'C社', 'D社', 'E社'], r = rng(3), data = names.map((n, i) => { let v = 30 + r() * 20; return Array.from({ length:12 }, (_, m) => Math.round(v += (i === 0 ? 3.2 : 0) + gauss(r) * 3)); });
          const run = () => { const hl = $(el, '.hl').checked; $(el, '.tt').textContent = hl ? '自社だけが1年で伸び続けている' : '6社の月間シェア指数'; lineChart($(el, '.pl'), { xs:MONTHS, series:names.map((n, i) => ({ n, v:data[i], c:hl ? (i ? 'var(--dv-gray)' : SER[0]) : SER[i], w:hl && i ? 1.5 : 2 })).reverse(), direct:!hl, extra:hl ? ({ x, y }) => `<text x="${x(11) + 6}" y="${y(data[0][11]) + 4}" style="fill:var(--dv-ink);font-weight:800">自社</text>` : null, ml:36, dlw:44, mr:hl ? 40 : 12 }); };
          $(el, '.hl').onchange = run; run(); },
        desc:'系列が多いと、全部に色を付けるとごちゃごちゃします。<b>伝えたい1本だけに色</b>を付け、残りは<b>灰色</b>にすると、言いたいことが一瞬で伝わります。タイトルにも結論（「自社だけが伸び続けている」）を書くとさらに効果的です。',
        prompt:'業界6社の推移グラフで、自社の線だけをブランドカラーで太めに、他社は灰色の細い線にして。自社の線の終わりに「自社」とラベルを付け、タイトルを結論の一文に変えて。' },
      { name:'色覚の多様性で見てみる', en:'Color-vision simulation', h:470, tags:['色','アクセシビリティ','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="dv-two" style="filter:var(--f)"><div class="dv-surf"><div class="dv-title">❌ 赤と緑だけで区別</div><div class="dv-plot a"></div></div><div class="dv-surf"><div class="dv-title">✓ 検証済みの色＋直接ラベル</div><div class="dv-plot b"></div></div></div><div class="kt-verdict res"></div><svg width="0" height="0" style="position:absolute"><defs>' + Object.entries(CVD).map(([k, m]) => `<filter id="dv-cvd-${k}"><feColorMatrix type="matrix" values="${m}"/></filter>`).join('') + '</defs></svg></div>',
        init:(el) => { const xs = ['1月', '2月', '3月', '4月', '5月', '6月'], a = [20, 28, 26, 35, 40, 46], b = [22, 25, 31, 33, 36, 38];
          lineChart($(el, '.a'), { xs, series:[{ n:'今年', c:'#d62728', v:a }, { n:'去年', c:'#2ca02c', v:b }], ml:30 }); lineChart($(el, '.b'), { xs, series:[{ n:'今年', c:SER[0], v:a }, { n:'去年', c:SER[1], v:b }], direct:true, ml:30, dlw:40 });
          const M = [['そのまま', '', '一般的な色覚での見え方。'], ['1型（P型）', 'p', '赤を感じにくい見え方のシミュレーション。日本人男性の約1.5%。'], ['2型（D型）', 'd', '緑を感じにくい見え方。<b>最も多いタイプ</b>（男性の約3.5%）。左のグラフはほぼ同じ色に。'], ['3型（T型）', 't', '青を感じにくい見え方。まれ。'], ['白黒', 'g', '白黒印刷・コピーでの見え方。']];
          $(el, '.sw').replaceWith(seg(M.map(x => x[0]), i => { $(el, '.dv-two').style.setProperty('--f', M[i][1] ? `url(#dv-cvd-${M[i][1]})` : 'none'); verdict($(el, '.res'), i ? 'warn' : '', M[i][2] + (i ? '<br>右は色が近く見えても、<b>線の終わりの名前</b>で区別できます。' : '')); }).el); },
        desc:'日本人男性の約20人に1人は、赤と緑の区別がつきにくい色覚を持っています。<b>赤と緑だけで区別</b>するグラフは、その人たちには読めません。明るさの違う色を選び、<b>直接ラベル・形・線の種類</b>など色以外の手がかりも付けましょう。シミュレーターで確認するのが確実です。',
        prompt:'このサイトのグラフが色覚の多様性に配慮できているか確認して。赤と緑だけで区別している箇所を探し、明るさの違う色に変えて、線の終わりに系列名を付ける・点の形を変えるなど色以外の区別も追加して。' },
      { name:'飾りを減らす', en:'Remove chart junk', h:420, tags:['デザイン','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="dv-surf dv-pad"><div class="dv-plot pl"></div></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const cats = ['春', '夏', '秋', '冬'], v = [320, 480, 410, 260];
          $(el, '.sw').replaceWith(seg(['飾りだらけ', 'すっきり'], i => { const box = $(el, '.pl');
            if (i){ barChart(box, { cats, series:[{ n:'', c:SER[0], v }], vlab:true }); verdict($(el, '.res'), 'ok', '✓ 薄い横線と、棒の上の値だけ。<b>データが主役</b>になります。'); return; }
            const { W, H } = size(box), m = { l:44, r:10, t:24, b:26 }, iw = W - m.l - m.r, ih = H - m.t - m.b, y = lin(0, 500, m.t + ih, m.t), bw = iw / 4, cs = ['#e11d48', '#f59e0b', '#22c55e', '#3b82f6'];
            let g = `<defs><linearGradient id="dvj" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fde68a"/><stop offset="1" stop-color="#a5b4fc"/></linearGradient><filter id="dvs"><feDropShadow dx="4" dy="4" stdDeviation="2" flood-opacity=".5"/></filter></defs><rect x="0" y="0" width="${W}" height="${H}" fill="url(#dvj)" rx="8"/>`;
            for (let t = 0; t <= 500; t += 50) g += `<line x1="${m.l}" x2="${W - m.r}" y1="${y(t)}" y2="${y(t)}" style="stroke:#000;stroke-width:1.2"/><text x="${m.l - 5}" y="${y(t) + 4}" text-anchor="end" style="fill:#000;font-weight:700">${t}</text>`;
            cats.forEach((c, j) => { const x = m.l + j * bw + bw * .15, w = bw * .7; g += `<rect x="${x}" y="${y(v[j])}" width="${w}" height="${y(0) - y(v[j])}" style="fill:${cs[j]};stroke:#000;stroke-width:2.5" filter="url(#dvs)"/><text x="${x + w / 2}" y="${y(v[j]) - 6}" text-anchor="middle" style="fill:#000;font-weight:900;font-size:13px">${v[j]}人!!</text><text x="${x + w / 2}" y="${H - 8}" text-anchor="middle" style="fill:#000">${c}</text>`; });
            g += `<text x="${W - 12}" y="16" text-anchor="end" style="fill:#000;font-weight:800">■来場者数 ■来場者数 ■来場者数 ■来場者数</text>`; draw(box, W, H, g); verdict($(el, '.res'), 'bad', '❌ 背景のグラデーション・濃い格子・影・太い枠・意味のない色分け・不要な凡例…。<b>どこを見ればいいか分かりません</b>。'); }).el); },
        desc:'グラフの<b>インクはデータのために使う</b>のが基本（データインク比）。背景の模様・濃い格子・影・3D・意味のない色分け・1系列なのに凡例…は、読む人の注意を奪うだけです。「これを消しても伝わるか？」と1つずつ消していくと、ぐっと見やすくなります。',
        prompt:'このグラフをすっきりさせて。背景の色・影・枠線・縦のグリッド線を消し、横のグリッド線は薄い灰色に、1系列なので凡例は削除してタイトルで説明、色は1色に統一して、値は棒の上に小さく表示して。' },
    ], null, true),
    { title:'よくある間違いと直し方', note:'グラフを作ったら、この表と見比べてチェックしましょう。<b>AIが作ったグラフも、2軸・虹色・0から始まらない軸</b>がよく混ざります。',
      table:{ head:['間違い', 'なぜダメか', '直し方'], rows:ANTI } },
    S('見やすさのための知識', [
      T('データインク比', 'Data-ink ratio', 'グラフのインクのうち、データを表す部分の割合。高いほど良い。飾りを消すほど上がる。'),
      T('結論を先に', 'Lead with the insight', 'タイトル・強調色・注釈で「どこを見てほしいか」を示す。'),
      T('注釈（アノテーション）', 'Annotation', '「キャンペーン開始」など、グラフの上に出来事を書き込む。変化の理由が伝わる。', null, ['おすすめ']),
      T('単位を書く', 'Units', '円・万円・%・人など。軸かタイトルに必ず。'),
      T('数字の丸め', 'Rounding', '1,284,391 より「128万」。細かすぎる数字は読みにくい。表では桁をそろえる（等幅数字）。'),
      T('カテゴリ色の順番', 'Fixed color order', 'カテゴリの色は決まった順番で使い、<b>同じ物はどのグラフでも同じ色</b>に。', null, ['定番']),
      T('灰色の「その他」', 'Other in gray', '9項目目以降や重要でない項目は、灰色の「その他」にまとめる。'),
      T('色だけに頼らない', 'Not color alone', '直接ラベル・アイコン・形・線の種類を併用する。白黒印刷・色覚の多様性への配慮。', null, ['アクセシビリティ']),
      T('ダークモードの色', 'Dark mode palette', '明るい背景の色をそのまま暗い背景に使うと、見えにくい色が出る。暗い背景用に<b>調整した色</b>を用意する。'),
      T('表も用意する', 'Table view', 'グラフの下や切り替えで表を見られるようにする。スクリーンリーダーで読める・正確な値が分かる。', null, ['アクセシビリティ']),
      T('代替テキスト', 'Alt text', 'グラフ画像には「2025年の売上は前年比12%増」のように、<b>結論を文章で</b>書く。'),
      T('テキストの色', 'Text color', '数値・ラベルの文字は系列の色にしない（読みにくい）。文字は普通の文字色、色は横の小さな印で示す。'),
    ]),
  ]});

/* ================= 4. 動かす・操作する ================= */
const DAILY = (() => { const r = rng(9); let v = 800; return Array.from({ length:365 }, (_, i) => Math.round(v = Math.max(300, v + gauss(r) * 40 + (i % 7 === 5 || i % 7 === 6 ? 120 : -30) * .3 + Math.sin(i / 58) * 8))); })();
const DAYLBL = Array.from({ length:365 }, (_, i) => { const d = new Date(2025, 0, 1 + i); return `${d.getMonth() + 1}/${d.getDate()}`; });

TABS.push({ id:'interact', label:'動かす・操作する', icon:'🖱',
  intro:'Webのグラフは<b>触れる</b>のが強み。マウスを乗せると値が出る、期間を切り替える、系列を絞り込む、範囲を選んで拡大する、クリックで詳しく見る（ドリルダウン）、リアルタイムに更新する…。操作のパターンを体験しましょう。',
  sections:[
    C('触って理解する', [
      { name:'期間の切り替え', en:'Time range presets', h:420, tags:['操作','体験','定番'],
        demo:'<div class="kt"><span class="sw"></span><div class="dv-surf dv-pad"><div class="dv-title tt"></div><div class="dv-plot pl"></div></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let raf = 0;
          const P = [['7日', 7, 1], ['30日', 30, 1], ['90日', 90, 7], ['1年', 365, 30]];
          const run = (i) => { const [lab, days, per] = P[i], src = DAILY.slice(365 - days), cats = [], vals = []; for (let s = 0; s < src.length; s += per){ const ch = src.slice(s, s + per); vals.push(ch.reduce((a, b) => a + b, 0)); cats.push(per === 1 ? DAYLBL[365 - days + s] : per === 7 ? DAYLBL[365 - days + s] + '〜' : `${Math.floor(s / 30.4) + 1}か月目`); }
            $(el, '.tt').textContent = `直近${lab}の訪問数（${per === 1 ? '日ごと' : per === 7 ? '週ごと' : '月ごと'}）`; cancelAnimationFrame(raf); const t0 = performance.now();
            const step = (now) => { const p = Math.min(1, (now - t0) / 450), k = 1 - Math.pow(1 - p, 3); barChart($(el, '.pl'), { cats, series:[{ n:'訪問数', c:SER[0], v:vals }], k, lblW:per === 7 ? 50 : 36, unit:'人' }); if (p < 1) raf = requestAnimationFrame(step); }; raf = requestAnimationFrame(step);
            verdict($(el, '.res'), '', `期間が長くなると、<b>集計の単位（粒度）</b>も粗くします（${per === 1 ? '日' : per === 7 ? '週' : '月'}ごと）。365本の棒は読めないので。`); };
          $(el, '.sw').replaceWith(seg(P.map(p => p[0]), run, 1).el); return () => cancelAnimationFrame(raf); },
        desc:'ダッシュボードの定番の操作。「7日・30日・90日・1年」のような<b>よく使う期間をボタン</b>にして、グラフの上に並べます。期間が長いほど<b>日→週→月</b>と集計を粗くし、切り替え時に少しアニメーションすると、変化したことが伝わります。',
        prompt:'売上グラフの上に「7日・30日・90日・1年」の期間ボタンを付けて。90日は週ごと、1年は月ごとに集計し直し、切り替え時は棒が下から伸びるアニメーション（0.4秒）にして。選んだ期間はURLのクエリにも保存して。' },
      { name:'凡例で表示を切り替える', en:'Toggle series (color follows entity)', h:440, tags:['操作','体験','色'],
        demo:'<div class="kt"><div class="kt-row"><label style="font-size:11.5px"><input type="checkbox" class="bad">色を並び順で付け直す（悪い例）</label></div><div class="dv-surf dv-pad"><div class="dv-leg lg"></div><div class="dv-plot pl"></div></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const names = ['東京', '大阪', '名古屋', '福岡', '札幌'], r = rng(17), data = names.map((n, i) => { let v = 90 - i * 14; return MONTHS.map(() => Math.round(v += gauss(r) * 4 + 1)); }), on = names.map(() => true);
          const run = () => { const bad = $(el, '.bad').checked; let k = 0; const ser = names.map((n, i) => ({ n, v:data[i], off:!on[i], c:bad ? (on[i] ? SER[k++] : '') : SER[i] }));
            $(el, '.lg').innerHTML = ser.map((s, i) => `<button type="button" data-i="${i}" class="${on[i] ? '' : 'off'}" aria-pressed="${on[i]}">${sw(on[i] ? s.c : 'var(--dv-gray)')}${s.n}</button>`).join('');
            $$(el, '.lg button').forEach(b => b.onclick = () => { const i = +b.dataset.i; if (on.filter(Boolean).length > 1 || !on[i]) on[i] = !on[i]; run(); });
            lineChart($(el, '.pl'), { xs:MONTHS, series:ser, direct:true, ml:34, dlw:52 });
            verdict($(el, '.res'), bad && on.some(x => !x) ? 'bad' : '', bad ? (on.some(x => !x) ? '❌ 系列を消すと、<b>残った都市の色が変わって</b>しまいました。さっきまで見ていた線を見失います。' : '凡例をクリックして、いくつか消してみてください。') : '✓ 系列を消しても、<b>残った都市の色は変わりません</b>（色は都市に結びつける）。凡例をクリックして試せます。'); };
          $(el, '.bad').onchange = run; run(); },
        desc:'凡例をクリックして系列を表示・非表示にする操作は定番です。このとき大事なのは<b>色を「並び順」ではなく「物」に結びつける</b>こと。消した後に残りの色が付け直されると、見ていた線を見失います。最後の1本は消せないようにするのも親切です。',
        prompt:'都市別の推移グラフで、凡例のクリックで系列の表示を切り替えられるようにして。色は都市ごとに固定（非表示にしても他の色は変えない）、非表示の凡例は灰色＋取り消し線、最後の1本は消せないようにして。' },
      { name:'範囲を選んで拡大（ブラシ）', en:'Brush to zoom', h:470, tags:['操作','体験'],
        demo:'<div class="kt"><div class="dv-surf dv-pad" style="flex:3"><div class="dv-title tt"></div><div class="dv-plot pl"></div></div><div class="dv-surf dv-pad" style="flex:1.1"><div class="dv-sub">全体（1年）：ドラッグで範囲を選ぶ</div><div class="dv-plot ov" style="touch-action:none;cursor:crosshair"></div></div></div>',
        init:(el) => { let a = 300, b = 364; const ov = $(el, '.ov'), { W, H } = size(ov), m = { l:8, r:8, t:4, b:4 }, iw = W - m.l - m.r, x = (i) => m.l + i / 364 * iw, mx = Math.max(...DAILY), y = lin(0, mx, H - m.b, m.t);
          const drawOv = () => { draw(ov, W, H, `<path d="${DAILY.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ',' + y(v).toFixed(1)).join('')}" style="fill:none;stroke:var(--dv-muted);stroke-width:1"/><rect x="${x(a)}" y="0" width="${Math.max(2, x(b) - x(a))}" height="${H}" style="fill:color-mix(in srgb, var(--dv1) 20%, transparent);stroke:var(--dv1);stroke-width:1.5" rx="3"/>`);
            $(el, '.tt').textContent = `訪問数：${DAYLBL[a]}〜${DAYLBL[b]}（${b - a + 1}日間）`; lineChart($(el, '.pl'), { xs:DAYLBL.slice(a, b + 1), series:[{ n:'訪問数', c:SER[0], v:DAILY.slice(a, b + 1) }], area:true, unit:'人', lblW:40 }); };
          let s0 = null; const idx = (e) => Math.max(0, Math.min(364, Math.round((e.clientX - ov.getBoundingClientRect().left - m.l) / iw * 364)));
          ov.onpointerdown = (e) => { s0 = idx(e); ov.setPointerCapture(e.pointerId); }; ov.onpointermove = (e) => { if (s0 == null) return; const i = idx(e); a = Math.min(s0, i); b = Math.max(s0, i); if (b - a < 6) b = Math.min(364, a + 6); drawOv(); }; ov.onpointerup = () => { s0 = null; };
          drawOv(); },
        desc:'長い期間のデータは、全体を小さく表示した<b>概要グラフ</b>の上でドラッグして範囲を選び、その部分だけを大きく表示すると便利です（ブラシ）。株価チャートやアクセス解析でおなじみの操作。全体と細部を行き来できます。',
        prompt:'1年分の日別データのグラフに、下に小さな全体グラフを付けて、ドラッグで範囲を選ぶと上のグラフがその範囲に拡大されるようにして。Recharts の Brush か ECharts の dataZoom を使って。' },
      { name:'クリックで詳しく（ドリルダウン）', en:'Drill-down', h:420, tags:['操作','体験'],
        demo:'<div class="kt"><div class="kt-row"><button type="button" class="kt-btn sm bk" disabled>← 年に戻る</button><span class="kt-lbl bc"></span></div><div class="dv-surf dv-pad"><div class="dv-plot pl"></div></div><div class="kt-note">棒をクリックすると、その年の月ごとの内訳を表示します。</div></div>',
        init:(el) => { const YRS = ['2022', '2023', '2024', '2025'], r = rng(31), MON = YRS.map((_, yi) => MONTHS.map((_, mi) => Math.round(60 + yi * 18 + Math.sin(mi / 1.9) * 12 + r() * 14)));
          const top = () => { $(el, '.bk').disabled = true; $(el, '.bc').textContent = '全体 › 年ごと'; barChart($(el, '.pl'), { cats:YRS.map(y => y + '年'), series:[{ n:'売上', c:SER[0], v:MON.map(m => m.reduce((a, b) => a + b, 0)) }], vlab:true, unit:'万円', after:(svg) => $$(svg, 'path[data-tip]').forEach((p, i) => { p.style.cursor = 'pointer'; p.onclick = () => down(i); }) }); };
          const down = (i) => { $(el, '.bk').disabled = false; $(el, '.bc').textContent = `全体 › ${YRS[i]}年 › 月ごと`; barChart($(el, '.pl'), { cats:MONTHS, series:[{ n:YRS[i] + '年', c:SER[0], v:MON[i] }], unit:'万円' }); };
          $(el, '.bk').onclick = top; top(); },
        desc:'まず全体（年ごと）を見せ、気になる所を<b>クリックするとその中身（月ごと）</b>を表示するのがドリルダウン。情報を一度に詰め込まず、<b>大まか → 細かい</b>の順で見せられます。今どこにいるかを示すパンくずと「戻る」を忘れずに。',
        prompt:'年別売上の棒グラフをクリックすると、その年の月別の棒グラフに切り替わるドリルダウンを作って。上に「全体 › 2025年」のパンくずと戻るボタン、URLにも選んだ年を保存して、ブラウザの戻るでも戻れるようにして。' },
      { name:'リアルタイムに更新', en:'Live / streaming chart', h:400, tags:['操作','体験'],
        demo:'<div class="kt"><div class="kt-row"><button type="button" class="kt-btn sm ps">一時停止</button><span class="kt-lbl lv"></span></div><div class="dv-surf dv-pad"><div class="dv-title">サーバーへのリクエスト数（1秒ごと）</div><div class="dv-plot pl"></div></div></div>',
        init:(el) => { const r = rng(41), N = 40; let v = 120, data = Array.from({ length:N }, () => Math.round(v = Math.max(20, v + gauss(r) * 12))), t = 0, run = true;
          const drawL = () => { lineChart($(el, '.pl'), { xs:data.map((_, i) => `${i - N + 1}秒`), series:[{ n:'リクエスト', c:SER[0], v:data }], area:true, yMax:250, lblW:44, unit:'件' }); const last = data[N - 1], st = last > 200 ? 'crit' : last > 170 ? 'warn' : 'good'; $(el, '.lv').innerHTML = `最新：<b>${last}件/秒</b>　<span class="dv-status" style="--c:${STATUS[st][0]}" data-i="${STATUS[st][1]}">${STATUS[st][2]}</span>`; };
          const id = setInterval(() => { if (!run || !el.isConnected) return; t++; data = data.slice(1).concat(Math.round(v = Math.max(20, Math.min(240, v + gauss(r) * 14 + (t % 25 > 20 ? 25 : 0))))); drawL(); }, 700);
          $(el, '.ps').onclick = (e) => { run = !run; e.target.textContent = run ? '一時停止' : '再開'; }; drawL(); return () => clearInterval(id); },
        desc:'サーバーの状態・売上の速報など、<b>新しいデータが次々に来る</b>グラフ。古いデータを左から押し出し、一定の幅（直近40秒など）だけを表示します。更新の間隔は見る人に合わせて（1〜数秒）。<b>一時停止</b>できると、気になる瞬間をじっくり見られます。',
        prompt:'管理画面に、WebSocket で1秒ごとに届くアクセス数をリアルタイムの折れ線グラフで表示して。直近60秒だけを表示し、しきい値を超えたら状態表示を「注意」「危険」に変え、一時停止ボタンも付けて。' },
    ], null, true),
    { title:'グラフの操作パターン', note:'操作は<b>なくても読める</b>ことが前提。ツールチップでしか分からない大事な情報は、グラフや表にも書いておきましょう（スマホではホバーできません）。',
      table:{ head:['操作', 'できること', '実装のヒント'], rows:[['ツールチップ', 'マウスを乗せて正確な値を見る', 'スマホはタップで表示。指で隠れない位置に'], ['クロスヘア', '同じ時点の全系列を比べる', 'Chart.js: interaction.mode="index"'], ['期間の切り替え', '7日・30日・1年などを選ぶ', '期間に合わせて集計の粒度も変える'], ['凡例で切り替え', '系列を絞り込む', '色は系列に固定。最後の1本は残す'], ['ブラシ・ズーム', '範囲を選んで拡大', 'Recharts: Brush / ECharts: dataZoom'], ['ドリルダウン', 'クリックで詳しい内訳へ', 'パンくずと戻るボタン、URLに状態を保存'], ['フィルター', '地域・商品などで絞り込む', 'グラフの上に1列で並べる。全グラフに効くことを明示'], ['リアルタイム更新', '新しいデータを流し続ける', '一時停止・更新間隔の調整'], ['ダウンロード', 'CSV・画像で保存', '表示中の条件のまま出力']] } },
    S('操作と表示の知識', [
      T('ホバーとタップ', 'Hover vs tap', 'スマホにはホバーがない。タップで表示・もう一度タップで消す、指で隠れない位置に出す。', null, ['スマホ']),
      T('当たり判定を大きく', 'Hit area', '細い線や小さな点は、見た目より広い範囲で反応させる（折れ線ならグラフ全体で一番近い点）。'),
      T('アニメーションは短く', 'Transitions', '切り替えの動きは0.3〜0.5秒。長いと待たされる。動きを減らす設定の人には止める。'),
      T('読み込み中', 'Loading skeleton', 'グラフの形をした薄い灰色の枠（スケルトン）を出すと、レイアウトがずれない。'),
      T('データがないとき', 'Empty state', '「この期間のデータはありません」と理由と次の行動を書く。真っ白な軸だけは不親切。'),
      T('エラーのとき', 'Error state', '「読み込めませんでした・再読み込み」のボタン。古いデータを出すなら「◯時点」と明記。'),
      T('フィルターの位置', 'Filter placement', 'グラフの上に1列で。どのグラフに効くかが分かるように。'),
      T('URLに状態を保存', 'State in URL', '期間・絞り込みをURLのクエリに入れると、共有・ブックマーク・戻るボタンが使える。'),
      T('大量のデータ', 'Large datasets', '数千点を超えたら間引く（ダウンサンプリング）か Canvas 描画のライブラリに。（「ライブラリとツール」タブ）'),
      T('タイムゾーン', 'Time zones', '日ごとの集計は「どの国の0時で区切るか」で変わる。サーバーはUTC、表示は日本時間が多い。', null, ['注意']),
    ]),
  ]});
})();
