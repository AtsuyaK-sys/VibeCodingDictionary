/* Vibe Coding 辞典 — 図解キット（KIT）
   セキュリティ／データベース／Git辞典で共通に使う、図解用の小さな部品。 */
(function(){
const $ = (el, s) => el.querySelector(s), $$ = (el, s) => [...el.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

// 小さな表のHTML。rows は配列の配列。opt.cls(row, i) で行のクラス、opt.colCls(j) で列のクラス
function tbl(head, rows, opt = {}){
  const cell = (v) => v === null || v === undefined ? '<span class="null">NULL</span>' : typeof v === 'number' ? v : esc(v);
  const th = head ? '<tr>' + head.map((x, j) => `<th class="${opt.colCls ? opt.colCls(j) || '' : ''}">${esc(x)}</th>`).join('') + '</tr>' : '';
  const tr = rows.map((r, i) => `<tr class="${opt.cls ? opt.cls(r, i) || '' : ''}">${r.map((v, j) => `<td class="${typeof v === 'number' ? 'num ' : ''}${opt.colCls ? opt.colCls(j) || '' : ''}">${cell(v)}</td>`).join('')}</tr>`).join('');
  return `<table class="kt-tbl">${th}${tr}</table>`;
}

// 切替ボタン（セグメント）。onChange(i) が選択時に呼ばれる
function seg(labels, onChange, start = 0){
  const box = document.createElement('div'); box.className = 'kt-seg'; box.setAttribute('role', 'group');
  const bs = labels.map((l, i) => { const b = document.createElement('button'); b.type = 'button'; b.innerHTML = l; b.onclick = () => set(i); box.append(b); return b; });
  function set(i){ bs.forEach((b, j) => { b.classList.toggle('on', i === j); b.setAttribute('aria-pressed', i === j); }); onChange && onChange(i); }
  set(start);
  return { el:box, set };
}

// シーケンス図（ステップ送り）。actors:[{label, icon}], steps:[{f, t, label, note, dash, bad, good}]
function seq(el, { actors, steps, auto = 1900 }){
  const N = actors.length, col = 100 / N;
  el.innerHTML = `<div class="kt-seq"><div class="act" style="grid-template-columns:repeat(${N}, 1fr)">${actors.map(a => `<div>${a.icon ? `<i>${a.icon}</i>` : ''}${a.label}</div>`).join('')}</div>
    <div class="lanes">${actors.map((_, i) => `<i class="ln" style="left:${(i + .5) * col}%"></i>`).join('')}${steps.map(s => {
      const self = s.f === s.t, a = Math.min(s.f, s.t), w = Math.abs(s.t - s.f);
      const cls = ['msg', self ? 'self' : s.t > s.f ? 'r' : 'l', s.dash ? 'dash' : '', s.bad ? 'bad' : '', s.good ? 'good' : ''].join(' ');
      const ar = self ? '' : `<i class="ar" style="left:${(a + .5) * col}%;width:${w * col}%"></i>`;
      const tx = self ? `left:${s.f * col + 2}%;width:${col - 4}%` : `left:${(a + .5) * col}%;width:${w * col}%`;
      return `<div class="${cls}">${ar}<span class="tx" style="${tx}" title="${esc(s.label.replace(/<[^>]+>/g, ''))}">${s.label}</span></div>`; }).join('')}</div>
    <div class="nt"></div><div class="ctl"><span class="pg"></span><button type="button" class="kt-btn sm prev">◀ 戻る</button><button type="button" class="kt-btn sm pri next">次へ ▶</button><button type="button" class="kt-btn sm auto">▶ 自動</button></div></div>`;
  const msgs = $$(el, '.msg'), nt = $(el, '.nt'), pg = $(el, '.pg'), prev = $(el, '.prev'), next = $(el, '.next'), au = $(el, '.auto'), lanes = $(el, '.lanes');
  let k = 1, timer = null;
  const render = () => {
    msgs.forEach((m, i) => { m.classList.toggle('show', i < k); m.classList.toggle('cur', i === k - 1); });
    const s = steps[k - 1]; nt.innerHTML = `<b class="n">${k}</b>${s.note || s.label}`;
    pg.textContent = `${k} / ${steps.length}`; prev.disabled = k <= 1; next.textContent = k >= steps.length ? '最初から ↺' : '次へ ▶';
    const m = msgs[k - 1]; lanes.scrollTop = Math.max(0, m.offsetTop - lanes.clientHeight + 36);
  };
  const stopAuto = () => { clearInterval(timer); timer = null; au.textContent = '▶ 自動'; };
  prev.onclick = () => { stopAuto(); if (k > 1){ k--; render(); } };
  next.onclick = () => { stopAuto(); k = k >= steps.length ? 1 : k + 1; render(); };
  au.onclick = () => { if (timer){ stopAuto(); return; } if (k >= steps.length) k = 0; au.textContent = '❚❚ 停止'; const step = () => { if (k >= steps.length){ stopAuto(); return; } k++; render(); }; step(); timer = setInterval(step, auto); };
  render();
  return stopAuto;
}

// 縦に並ぶ手順を1つずつ進める。list は HTML の配列
function stepper(el, list, { title = '' } = {}){
  el.innerHTML = `<div class="kt">${title ? `<div class="kt-lbl">${title}</div>` : ''}<div class="kt-steps kt-grow kt-scroll">${list.map(x => `<div>${x}</div>`).join('')}</div><div class="kt-row"><button type="button" class="kt-btn sm prev">◀ 戻る</button><button type="button" class="kt-btn sm pri next">次へ ▶</button><span class="kt-lbl pg" style="margin-left:auto"></span></div></div>`;
  const ds = $$(el, '.kt-steps > div'), box = $(el, '.kt-steps'), pg = $(el, '.pg'); let k = 0;
  const render = () => { ds.forEach((d, i) => { d.classList.toggle('on', i === k); d.classList.toggle('done', i < k); }); pg.textContent = `${k + 1} / ${ds.length}`; box.scrollTop = Math.max(0, ds[k].offsetTop - box.clientHeight / 2); $(el, '.next').textContent = k >= ds.length - 1 ? '最初から ↺' : '次へ ▶'; };
  $(el, '.prev').onclick = () => { if (k > 0){ k--; render(); } };
  $(el, '.next').onclick = () => { k = k >= ds.length - 1 ? 0 : k + 1; render(); };
  render();
}

// SQLの簡易色付け（キーワード・文字列・コメント）
const SQLK = /\b(SELECT|FROM|WHERE|AND|OR|NOT|IN|IS|NULL|AS|ON|JOIN|LEFT|RIGHT|FULL|INNER|OUTER|CROSS|GROUP|BY|ORDER|ASC|DESC|LIMIT|OFFSET|HAVING|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|INDEX|VIEW|DROP|ALTER|ADD|COLUMN|PRIMARY|KEY|FOREIGN|REFERENCES|UNIQUE|DEFAULT|CHECK|BEGIN|COMMIT|ROLLBACK|TRANSACTION|DISTINCT|COUNT|SUM|AVG|MIN|MAX|CASE|WHEN|THEN|ELSE|END|LIKE|BETWEEN|WITH|UNION|ALL|EXISTS|CONFLICT|DO|NOTHING|RETURNING|INTEGER|TEXT|REAL|EXPLAIN|QUERY|PLAN|OVER|PARTITION|POLICY|USING|ENABLE|ROW|LEVEL|SECURITY|GRANT|TO|IF)\b/gi;
function hlSQL(s){ return esc(s).replace(/('(?:[^']|'')*')|(--[^\n]*)|([A-Za-z_]+)/g, (m, str, com, w) => str ? `<span class="s">${str}</span>` : com ? `<span class="c">${com}</span>` : SQLK.test(w) ? (SQLK.lastIndex = 0, `<span class="k">${w}</span>`) : (SQLK.lastIndex = 0, w)); }

window.KIT = { $, $$, esc, tbl, seg, seq, stepper, hlSQL };
})();
