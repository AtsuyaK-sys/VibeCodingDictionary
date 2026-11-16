/* モーション・インタラクション辞典 — B: 出現・退場 / スクロール演出 */
(function(){
const { $, $$, clamp, swapText, flip } = MO;
const EZ = 'cubic-bezier(.2,.8,.2,1)';
const GRAD = ['linear-gradient(135deg,#c026d3,#fb7185)', 'linear-gradient(135deg,#0ea5e9,#6366f1)', 'linear-gradient(135deg,#16a34a,#a3e635)', 'linear-gradient(135deg,#f97316,#facc15)', 'linear-gradient(135deg,#8b5cf6,#ec4899)', 'linear-gradient(135deg,#0f766e,#22d3ee)', 'linear-gradient(135deg,#e11d48,#f59e0b)', 'linear-gradient(135deg,#334155,#64748b)'];
const center = '<div style="position:absolute;inset:0;display:grid;place-items:center">';

/* ---------- 出現・退場 ---------- */
function openDialog(el, origin){
  const ov = document.createElement('div'); ov.className = 'mo-ov';
  ov.innerHTML = '<div class="mo-dlg" role="dialog"><h5>プロフィールを編集</h5><p>背景をクリックすると閉じます。閉じる動きは開くより短くしています。</p><button class="mo-btn sm">閉じる</button></div>';
  el.append(ov);
  const d = $(ov, '.mo-dlg'), r = d.getBoundingClientRect();
  d.style.transformOrigin = origin ? `${origin.x - r.left}px ${origin.y - r.top}px` : '50% 50%';
  ov.animate([{ opacity:0 }, { opacity:1 }], { duration:250 });
  d.animate([{ opacity:0, transform:'scale(.3)' }, { opacity:1, transform:'none' }], { duration:380, easing:EZ });
  const close = () => { ov.animate([{ opacity:1 }, { opacity:0 }], { duration:180, fill:'forwards' }); d.animate([{ opacity:1, transform:'none' }, { opacity:0, transform:'scale(.3)' }], { duration:200, easing:'cubic-bezier(.4,0,1,1)', fill:'forwards' }).onfinish = () => ov.remove(); };
  ov.onclick = (e) => { if (e.target === ov || e.target.tagName === 'BUTTON') close(); };
}
function sonner(el){
  const box = $(el, '.mo-toasts'); const list = []; let hover = false;
  const M = [['✓', '#16a34a', '保存しました'], ['↗', '#0ea5e9', 'リンクをコピーしました'], ['!', '#f59e0b', '通信が不安定です'], ['✓', '#16a34a', '3件を削除しました'], ['i', '#6366f1', '新しいバージョンがあります']]; let k = 0;
  const layout = () => { let acc = 0; list.forEach((t, i) => { const y = hover ? -acc : -i * 11, s = hover ? 1 : 1 - i * .06; acc += t.offsetHeight + 8; t.style.transform = `translateY(${y}px) scale(${s})`; t.style.opacity = (hover || i < 3) ? 1 : 0; t.style.zIndex = 50 - i; }); };
  const remove = (t) => { if (!t.isConnected) return; if (hover){ setTimeout(() => remove(t), 1000); return; } const i = list.indexOf(t); if (i >= 0) list.splice(i, 1); t.style.opacity = 0; t.style.transform += ' translateY(20px)'; setTimeout(() => t.remove(), 400); layout(); };
  const add = () => { const m = M[k++ % M.length]; const t = document.createElement('div'); t.className = 'mo-toast'; t.innerHTML = `<i style="background:${m[1]}">${m[0]}</i><span>${m[2]}</span>`; t.style.transformOrigin = '50% 100%'; t.style.transform = 'translateY(110%)'; t.style.opacity = 0; box.append(t); list.unshift(t); if (list.length > 6) remove(list[list.length - 1]); requestAnimationFrame(() => requestAnimationFrame(layout)); setTimeout(() => remove(t), 4500); };
  box.onmouseenter = () => { hover = true; layout(); }; box.onmouseleave = () => { hover = false; layout(); };
  $(el, '.mo-btn').onclick = add; add(); setTimeout(add, 250);
}
function listDemo(el){
  const ul = $(el, '.mo-list'); const C = ['#c026d3', '#0ea5e9', '#16a34a', '#f97316', '#8b5cf6']; let n = 0;
  const mk = (txt) => { const li = document.createElement('li'); li.className = 'mo-li'; li.innerHTML = `<div><div class="c"><i style="background:${C[n % C.length]}"></i><span>${txt}</span><button aria-label="削除">×</button></div></div>`; $(li, 'button').onclick = () => rm(li); n++; return li; };
  const rm = (li) => { li.classList.add('leave'); li.addEventListener('transitionend', (e) => { if (e.propertyName === 'grid-template-rows') li.remove(); }); setTimeout(() => li.remove(), 500); };
  const add = () => { const li = mk(`タスク ${n + 1}`); li.classList.add('enter'); ul.prepend(li); void li.offsetWidth; li.classList.remove('enter'); const items = $$(ul, '.mo-li:not(.leave)'); if (items.length > 4) rm(items[items.length - 1]); };
  ['資料をまとめる', 'デザインを確認'].forEach(t => ul.append(mk(t)));
  $(el, '.mo-btn').onclick = add;
}
function sheetDemo(el){
  const ph = $(el, '.mo-phone'), sh = $(el, '.sheet');
  $(el, '.open').onclick = () => ph.classList.add('open'); $(el, '.shade').onclick = () => ph.classList.remove('open');
  let y0 = 0, dy = 0, t0 = 0, drag = false;
  sh.addEventListener('pointerdown', (e) => { if (!ph.classList.contains('open')) return; drag = true; y0 = e.clientY; t0 = performance.now(); dy = 0; sh.style.transition = 'none'; sh.setPointerCapture(e.pointerId); });
  sh.addEventListener('pointermove', (e) => { if (!drag) return; dy = e.clientY - y0; if (dy < 0) dy *= .2; sh.style.transform = `translateY(${dy}px)`; });
  sh.addEventListener('pointerup', () => { if (!drag) return; drag = false; sh.style.transition = ''; const v = dy / (performance.now() - t0); if (dy > sh.offsetHeight * .3 || v > .6) ph.classList.remove('open'); sh.style.transform = ''; });
}
function sharedDemo(el){
  $$(el, '.t').forEach((t, i) => t.onclick = () => {
    const r0 = el.getBoundingClientRect(), a = t.getBoundingClientRect();
    const d = document.createElement('div'); d.className = 'mo-detail'; d.style.background = t.style.background;
    d.innerHTML = `<button class="x" aria-label="閉じる">×</button><b style="font-size:18px">${t.textContent}</b><div class="body">サムネイルから詳細へ、同じ要素が拡大していくように見せると、どこから来た画面なのかが分かります。閉じると元の位置へ戻ります（共有要素トランジション）。</div>`;
    el.append(d); const b = d.getBoundingClientRect();
    const inv = `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})`;
    t.style.visibility = 'hidden';
    d.animate([{ transform:inv, borderRadius:'12px' }, { transform:'none', borderRadius:'16px' }], { duration:480, easing:EZ });
    $(d, '.body').animate([{ opacity:0, transform:'translateY(8px)' }, { opacity:1, transform:'none' }], { duration:300, delay:250, fill:'forwards', easing:EZ });
    $(d, '.x').onclick = () => { $(d, '.body').animate([{ opacity:1 }, { opacity:0 }], { duration:120, fill:'forwards' }); d.animate([{ transform:'none' }, { transform:inv }], { duration:380, easing:'cubic-bezier(.4,0,.2,1)', fill:'forwards' }).onfinish = () => { d.remove(); t.style.visibility = ''; }; };
  });
}
function stepsDemo(el){
  const box = $(el, '.mo-steps2'), pg = $(el, '.pg'); const P = [['ようこそ', 'まずはプロフィールを設定しましょう。'], ['好きなものを選ぶ', 'あなたに合った内容をおすすめします。'], ['通知の設定', '大事なお知らせだけ受け取れます。'], ['準備完了！', 'さっそく始めましょう。']]; let k = 0;
  const show = (i, dir) => { const p = document.createElement('div'); p.className = 'pane'; p.style.background = GRAD[i]; p.innerHTML = `<b>${P[i][0]}</b><span>${P[i][1]}</span>`;
    [...box.children].forEach(o => o.animate([{ transform:'none', opacity:1, filter:'blur(0px)' }, { transform:`translateX(${-dir * 35}%)`, opacity:0, filter:'blur(4px)' }], { duration:300, easing:'cubic-bezier(.4,0,.2,1)', fill:'forwards' }).onfinish = () => o.remove());
    box.append(p); if (dir) p.animate([{ transform:`translateX(${dir * 35}%)`, opacity:0, filter:'blur(4px)' }, { transform:'none', opacity:1, filter:'blur(0px)' }], { duration:380, easing:EZ }); pg.textContent = `${i + 1} / 4`; };
  const [pv, nx] = $$(el, '.mo-btn'); pv.onclick = () => { if (k > 0) show(--k, -1); }; nx.onclick = () => { if (k < 3) show(++k, 1); }; show(0, 0);
}
function cmdDemo(el){
  $(el, '.mo-btn').onclick = () => {
    const ov = document.createElement('div'); ov.className = 'mo-cmd-ov';
    ov.innerHTML = '<div class="mo-cmd"><div class="in">🔍 コマンドを検索…</div>' + [['📄', '新規ドキュメント'], ['🌙', 'テーマを切り替え'], ['⚙', '設定を開く'], ['⎋', 'ログアウト']].map(x => `<div class="it">${x[0]} ${x[1]}</div>`).join('') + '</div>';
    el.append(ov); const p = $(ov, '.mo-cmd');
    ov.animate([{ opacity:0 }, { opacity:1 }], { duration:180 });
    p.animate([{ opacity:0, transform:'scale(.96) translateY(-8px)' }, { opacity:1, transform:'none' }], { duration:240, easing:EZ });
    $$(p, '.it').forEach((it, i) => it.animate([{ opacity:0, transform:'translateY(-4px)' }, { opacity:1, transform:'none' }], { duration:220, delay:60 + i * 30, easing:EZ, fill:'backwards' }));
    ov.onclick = (e) => { if (e.target !== ov) return; ov.animate([{ opacity:1 }, { opacity:0 }], { duration:140, fill:'forwards' }); p.animate([{ opacity:1, transform:'none' }, { opacity:0, transform:'scale(.98)' }], { duration:120, fill:'forwards' }).onfinish = () => ov.remove(); };
  };
}
function tipDemo(el){
  let lastHide = 0;
  $$(el, '.mo-tipbar button').forEach(b => { const tip = $(b, '.tip'); let t = null;
    b.addEventListener('mouseenter', () => { const warm = performance.now() - lastHide < 400; if (warm){ tip.classList.add('instant', 'on'); } else t = setTimeout(() => { tip.classList.remove('instant'); tip.classList.add('on'); }, 500); });
    b.addEventListener('mouseleave', () => { clearTimeout(t); if (tip.classList.contains('on')) lastHide = performance.now(); tip.classList.remove('on', 'instant'); });
  });
}
function originMenus(el){
  $$(el, '.mo-dd').forEach(dd => { const b = $(dd, 'button'); let m = null;
    const close = () => { if (!m) return; const mm = m; m = null; mm.animate([{ opacity:1, transform:'none' }, { opacity:0, transform:'scale(.9)' }], { duration:130, fill:'forwards' }).onfinish = () => mm.remove(); };
    b.onclick = (e) => { e.stopPropagation(); if (m) return close(); m = document.createElement('div'); m.className = 'menu'; m.innerHTML = '<div>プロフィール</div><div>設定</div><div>ログアウト</div>'; dd.append(m); m.style.transformOrigin = dd.classList.contains('r') ? 'top right' : 'center center'; m.animate([{ opacity:0, transform:'scale(.85)' }, { opacity:1, transform:'none' }], { duration:200, easing:EZ }); };
    el.addEventListener('click', (e) => { if (!dd.contains(e.target)) close(); });
  });
}

TABS.push({
  id:'enter', label:'出現・退場', icon:'❐',
  intro:'モーダル・メニュー・トースト・リストの項目などが<b>現れる・消える</b>ときの動き。「どこから来て、どこへ消えるか」を一貫させると、画面のつながりが自然に理解できます。',
  sections:[
    { title:'重なって出るもの', items:[
      { name:'押した場所から開くモーダル', en:'Origin-aware modal', h:210, stage:'free', demo: center + '<div class="mo-row"><button class="mo-btn sm ghost" data-m="c">中央から開く</button><button class="mo-btn sm" data-m="o">押した場所から開く</button></div></div>', tags:['つながり'],
        init:(el) => $$(el, '[data-m]').forEach(b => b.onclick = () => { const r = b.getBoundingClientRect(); openDialog(el, b.dataset.m === 'o' ? { x:r.left + r.width / 2, y:r.top + r.height / 2 } : null); }),
        desc:'ダイアログを、<b>押したボタンの位置から広がるように</b>開く。どの操作で開いたのかが伝わる。閉じるときは開くより短く（200ms程度）して軽快に。', prompt:'モーダルを、押したボタンの中心を transform-origin にして拡大しながら開くようにして（0.38秒・ease-out）。閉じるときは同じ点に向かって0.2秒で縮むように。背景は同時にフェード。' },
      { name:'メニューの起点を合わせる', en:'Transform origin', h:200, stage:'free', demo:'<div style="position:absolute;inset:0;display:flex;justify-content:space-around;padding-top:26px"><div class="mo-col"><span class="mo-lbl">× 中央から</span><div class="mo-dd l"><button class="mo-btn sm ghost">メニュー ▾</button></div></div><div class="mo-col"><span class="mo-lbl">○ ボタンの角から</span><div class="mo-dd r"><button class="mo-btn sm ghost">メニュー ▾</button></div></div></div>', tags:['細部','比較'],
        init:(el) => originMenus(el),
        desc:'ドロップダウンは<b>ボタンに近い角を起点に</b>拡大させる（右寄せなら右上）。中央から広がると、ボタンと関係なく浮かび上がったように見える。小さな違いだが、受け取る印象が大きく変わる細部。', prompt:'ドロップダウンメニューを開くアニメーションの transform-origin を、メニューが付いているボタンの位置に合わせて（右寄せのメニューは top right）。0.85倍から0.2秒で拡大、閉じるときは0.13秒で縮むように。' },
      { name:'積み重なるトースト', en:'Stacked toasts (Sonner style)', h:220, stage:'free', demo:'<div style="position:absolute;inset:0"><div style="position:absolute;top:16px;left:0;right:0;text-align:center"><button class="mo-btn sm">トーストを追加</button></div><div class="mo-toasts"></div></div>', tags:['話題','通知'], hint:'重なりにホバー',
        init:(el) => sonner(el),
        desc:'新しい通知が下から入り、古いものは<b>後ろに少しずつ小さく重なる</b>。重なりにマウスを乗せると、全部が広がって読める。Emil Kowalski作のトーストライブラリ「Sonner」で有名になった表現。', prompt:'トースト通知を、新しいものが下から入ってきて、古いものは後ろに11pxずつずれて6%ずつ縮みながら重なる表示にして（3件まで見せる）。重なりにホバーしたら縦に広がって全部読めるように、4.5秒で自動で消えるように。Reactなら sonner を使って。' },
      { name:'CSSだけで出入りするポップオーバー', en:'@starting-style + popover', h:160, demo:'<div class="mo-col"><button class="mo-btn" popovertarget="mo-pop-demo">ポップオーバーを開く</button><div id="mo-pop-demo" popover><b>CSSだけで出入りする</b><p style="margin:6px 0 12px;color:var(--muted);font-size:12.5px;line-height:1.7">@starting-style と transition-behavior: allow-discrete で、表示と非表示の両方がアニメーションします。外側クリックかEscでも閉じます。</p><button class="mo-btn sm" popovertarget="mo-pop-demo" popovertargetaction="hide">閉じる</button></div><span class="mo-lbl sup"></span></div>', tags:['新しいCSS','JS不要'],
        init:(el) => { $(el, '.sup').textContent = HTMLElement.prototype.hasOwnProperty('popover') ? 'JavaScriptを使っていません' : '※このブラウザはpopover未対応です'; },
        desc:'<code>display:none</code> の要素は今までアニメーションできなかったが、<b><code>@starting-style</code>（表示直後の状態）</b>と <code>allow-discrete</code> を使うと、<b>CSSだけで出現と退場の両方</b>を動かせる。popover・dialogと相性が良い。', prompt:'popover属性を使ったポップオーバーを、JavaScriptなしでフェード＋少し拡大しながら表示し、閉じるときも逆の動きで消えるようにして（@starting-style と transition-behavior: allow-discrete を使う）。',
        code:'[popover] { opacity:0; transform:scale(.96);\n  transition: opacity .25s, transform .3s, overlay .3s allow-discrete, display .3s allow-discrete; }\n[popover]:popover-open { opacity:1; transform:none; }\n@starting-style { [popover]:popover-open { opacity:0; transform:scale(.96); } }' },
      { name:'ボトムシート（引っぱって閉じる）', en:'Drawer / bottom sheet', h:260, stage:'free', demo:'<div class="mo-phone"><div class="scr"><b>ホーム</b><div class="ln" style="width:80%"></div><div class="ln"></div><div class="ln" style="width:60%"></div><button class="mo-btn sm open" style="margin-top:auto">シートを開く</button></div><div class="shade"></div><div class="sheet"><div class="grab"></div><b>共有</b><p style="font-size:12px;color:var(--muted);margin:6px 0 10px">下に引っぱると閉じます</p><div class="ln" style="margin-bottom:8px"></div><div class="ln" style="width:70%"></div></div></div>', tags:['スマホ','話題'],
        init:(el) => sheetDemo(el),
        desc:'下からシートが出て、<b>後ろの画面が少し縮んで奥へ下がる</b>（iOS風）。指で下に引っぱれば閉じ、少しだけなら戻る。上に引っぱると重く抵抗する。Emil Kowalski作の「Vaul」で有名な動き。', prompt:'スマホ向けのボトムシートを作って。開くと下から cubic-bezier(.32,.72,0,1) でせり上がり、背景の画面は0.92倍に縮んで角が丸くなる。シートは下にドラッグでき、高さの30%以上か速くはじいたら閉じ、それ以外は元に戻る。上方向へのドラッグは抵抗をかけて。' },
      { name:'コマンドパレット', en:'Command palette', h:210, stage:'free', demo: center + '<button class="mo-btn ghost">⌘K コマンドパレット</button></div>', tags:['生産性'],
        init:(el) => cmdDemo(el),
        desc:'背景が<b>ぼやけて暗くなり</b>、パネルが少し上から拡大して現れ、項目が順番に出てくる。キーボードで頻繁に開くものなので、<b>短く（250ms以内）</b>するのが鉄則。', prompt:'⌘K でコマンドパレットを開くとき、背景をぼかして暗くし、パネルを0.96倍・少し上の位置から0.24秒で表示、項目は30msずつ遅れてフェードインさせて。閉じるときは0.12秒で素早く消して。' },
    ]},
    { title:'リスト・切り替え', items:[
      { name:'リストの追加・削除', en:'List enter / exit', h:230, stage:'free', demo:'<div style="position:absolute;inset:12px;display:flex;flex-direction:column;align-items:center;gap:10px"><button class="mo-btn sm">＋ 追加</button><ul class="mo-list"></ul></div>', tags:['定番'],
        init:(el) => listDemo(el),
        desc:'追加した項目は<b>高さが広がりながら</b>入り、削除した項目は<b>高さが縮みながら</b>消える。下の項目がカクッと動かず、滑らかに詰まる。', prompt:'リストに項目を追加したら、高さ0から広がりながら左からフェードイン、×で削除したら右へフェードアウトしながら高さが0に縮んで、下の項目が滑らかに詰まるようにして（grid-template-rows: 1fr⇄0fr を使う）。Reactなら Motion の AnimatePresence で。' },
      { name:'並び替え（シャッフル）', en:'Reorder (FLIP)', h:200, demo:'<div class="mo-col"><div class="mo-flip">' + Array.from({ length:8 }, (_, i) => `<i style="background:${GRAD[i]}">${i + 1}</i>`).join('') + '</div><div class="mo-row"><button class="mo-btn sm">シャッフル</button><button class="mo-btn sm ghost">並べ直す</button></div></div>', tags:['FLIP','フィルター'],
        init:(el) => { const g = $(el, '.mo-flip'); const tiles = () => $$(g, 'i'); const [sh, so] = $$(el, '.mo-btn');
          sh.onclick = () => flip(tiles(), () => { const t = tiles(); for (let i = t.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [t[i], t[j]] = [t[j], t[i]]; } t.forEach(x => g.append(x)); }, { duration:600 });
          so.onclick = () => flip(tiles(), () => tiles().sort((a, b) => a.textContent - b.textContent).forEach(x => g.append(x)), { duration:600 }); },
        desc:'並び順が変わっても、各要素が<b>今の位置から新しい位置へ滑って</b>いく。絞り込み・並べ替え・ドラッグ並べ替えで、何がどこへ行ったか追える。', prompt:'カード一覧を並べ替え・絞り込みしたとき、各カードが元の位置から新しい位置へ0.6秒で滑らかに移動するようにして（FLIPアニメーション）。Reactなら Motion の layout か @formkit/auto-animate を使って。' },
      { name:'方向のある切り替え', en:'Directional transition', h:190, demo:'<div class="mo-col" style="width:100%"><div class="mo-steps2"></div><div class="mo-row"><button class="mo-btn sm ghost">← 前へ</button><span class="mo-lbl pg">1 / 4</span><button class="mo-btn sm">次へ →</button></div></div>', tags:['ウィザード'],
        init:(el) => stepsDemo(el),
        desc:'「次へ」では<b>右から入って左へ抜け</b>、「前へ」では逆向きに。ぼかしを少し加えると速さが和らぐ。進む・戻るの感覚が動きと一致する。', prompt:'初期設定のステップ画面を、「次へ」では新しい画面が右から入り古い画面が左へ抜け、「前へ」では逆向きに動くようにして。少しぼかしを加えて0.38秒で。' },
      { name:'サムネイル → 詳細', en:'Shared element transition', h:210, stage:'free', demo:'<div class="mo-gal">' + ['東京', '京都', '沖縄'].map((t, i) => `<div class="t" style="background:${GRAD[i * 2]}">${t}</div>`).join('') + '</div>', tags:['ギャラリー','話題'],
        init:(el) => sharedDemo(el),
        desc:'小さなカードが<b>そのまま大きくなって詳細画面になり</b>、閉じると元の場所へ戻る。View Transitions API の <code>view-transition-name</code> を使えば、ページ遷移でも同じことができる。', prompt:'一覧のカードをクリックしたら、そのカードがその位置から拡大して詳細パネルになり（FLIP）、本文は少し遅れてフェードイン、閉じると元のカードの位置へ縮んで戻るようにして。ページ遷移なら View Transitions API の view-transition-name で。' },
    ]},
    { title:'小さな出現', items:[
      { name:'ツールチップの「待ち」と「連続」', en:'Tooltip delay & skip-delay', h:150, demo:'<div class="mo-col"><div class="mo-tipbar">' + [['✎', '編集'], ['⧉', '複製'], ['↗', '共有'], ['🗑', '削除']].map(x => `<button aria-label="${x[1]}">${x[0]}<span class="tip">${x[1]}</span></button>`).join('') + '</div><span class="mo-lbl">1つ目は少し待って表示 → 隣へ移るとすぐ表示</span></div>', tags:['細部','話題'], hint:'端から順にホバー',
        init:(el) => tipDemo(el),
        desc:'最初のツールチップは<b>0.5秒待ってから</b>（うっかり出さない）、一度出たあとに隣へ移ったら<b>待たずにアニメーションなしで</b>表示する。ツールバーを順番に見ていくときに快適。Radix UIなどのツールチップも採用している細部。', prompt:'ツールバーのツールチップを、最初は0.5秒ホバーしてから表示し、一度表示した直後（0.4秒以内）に別のボタンへ移ったときは待たずにアニメーションなしで即表示するようにして。' },
      { name:'メニュー項目が順番に出る', en:'Staggered menu items', h:200, stage:'free', demo:'<div style="position:absolute;inset:0;display:flex;justify-content:center;padding-top:24px"><div class="mo-menu2"><button class="mo-btn sm ghost">メニュー ▾</button></div></div>', tags:['スタッガー'],
        init:(el) => { const w = $(el, '.mo-menu2'), b = $(w, 'button'); let m = null; b.onclick = (e) => { e.stopPropagation(); if (m){ m.remove(); m = null; return; } m = document.createElement('div'); m.className = 'm'; m.innerHTML = ['👤 プロフィール', '⭐ お気に入り', '⚙ 設定', '❓ ヘルプ', '⎋ ログアウト'].map((x, i) => `<div style="--i:${i}">${x}</div>`).join(''); w.append(m); m.animate([{ opacity:0, transform:'scale(.95)' }, { opacity:1, transform:'none' }], { duration:180, easing:EZ }); }; el.addEventListener('click', () => { if (m){ m.remove(); m = null; } }); },
        desc:'メニューが開いたあと、項目が<b>上から30msずつずれて</b>現れる。間隔は短く、全体で0.2秒以内に収めるのがコツ（長いと待たされる）。', prompt:'ドロップダウンメニューの項目を、メニューが開いたあと上から30msずつ遅らせて、上から少し下がりながらフェードインさせて。' },
    ]},
  ]
});

/* ---------- スクロール演出 ---------- */
const sbox = (el, html, extra) => { el.innerHTML = `<div class="mo-sb">${html}</div>${extra || ''}`; return $(el, '.mo-sb'); };
const TIP = '<div class="mo-tip">↓ この枠の中をスクロール</div>';
const stickyP = (box, wrap) => clamp((box.scrollTop - wrap.offsetTop) / Math.max(1, wrap.offsetHeight - box.clientHeight), 0, 1);
const onScroll = (box, fn) => { box.addEventListener('scroll', fn, { passive:true }); requestAnimationFrame(fn); };
function stickyDemo(el, inner, fn, height = 500){
  const box = sbox(el, `<div class="wrap" style="height:${height}%;position:relative">${inner}</div>`);
  const wrap = $(box, '.wrap'), stick = $(box, '.stick'); stick.style.height = box.clientHeight + 'px';
  onScroll(box, () => fn(stickyP(box, wrap), box)); return box;
}

const SCROLL = [
  { name:'1文字ずつ色が付く文章', en:'Scroll text reveal', tags:['話題','読ませる'],
    init:(el) => { const txt = 'AIと一緒につくると、アイデアはすぐに形になる。名前を知れば、指示はもっと正確になる。'; const box = sbox(el, `${TIP}<div style="height:80px"></div><p class="mo-words">${[...txt].map(c => `<span>${c}</span>`).join('')}</p><div style="height:240px"></div>`); const p = $(box, '.mo-words'), ss = $$(p, 'span');
      onScroll(box, () => { const r = p.getBoundingClientRect(), b = box.getBoundingClientRect(); const t = clamp((b.bottom - 40 - r.top) / (b.height - 50), 0, 1); const lit = t * ss.length * 1.15; ss.forEach((s, i) => s.classList.toggle('lit', i < lit)); }); },
    desc:'スクロールに合わせて、薄い文字が<b>読む順番に1文字ずつ濃くなる</b>。メッセージを1文ずつ読ませたいコンセプト紹介に。Appleの製品ページなどで多用され、Xでもよく紹介される。', prompt:'コンセプト文を、最初は薄い灰色（不透明度15%）で表示し、スクロール量に応じて先頭から1文字（英語なら1単語）ずつ濃くなっていく演出にして。' },
  { name:'カードが積み重なる', en:'Sticky stacking cards', tags:['話題','sticky'],
    init:(el) => { const C = ['#c026d3', '#0ea5e9', '#16a34a', '#f97316']; const T = ['① 企画する', '② つくる', '③ 試す', '④ 届ける']; const box = sbox(el, `${TIP}<div class="mo-stack">${C.map((c, i) => `<div class="card" style="background:${c};top:${10 + i * 10}px">${T[i]}</div>`).join('')}</div><div style="height:140px"></div>`);
      const cs = $$(box, '.card'); const s = cs.map((c, i) => c.offsetTop - (10 + i * 10));
      onScroll(box, () => cs.forEach((c, i) => { const q = clamp((box.scrollTop - s[i]) / 160, 0, cs.length - 1 - i); c.style.transform = `scale(${1 - q * .06})`; c.style.filter = `brightness(${1 - q * .15})`; })); },
    desc:'カードが上に貼り付き、<b>次のカードが上に重なると前のカードが少し縮んで暗く</b>なる。手順やサービスの特徴を順番に見せるのに人気。position: sticky と少しのJS（またはスクロール駆動アニメーション）で作れる。', prompt:'特徴紹介のカード4枚を、スクロールすると上部に貼り付きながら次のカードが上に重なっていき、下になったカードは6%ずつ縮んで少し暗くなる「スタッキングカード」にして（position: sticky ＋ スクロール量で scale を計算）。' },
  { name:'画像が広がって画面いっぱいに', en:'Scroll to expand', tags:['ヒーロー'],
    init:(el) => stickyDemo(el, '<div class="stick" style="position:sticky;top:0;display:grid;place-items:center;overflow:hidden"><div class="mo-expimg"><span>Welcome</span></div></div>', (p, box) => { const im = $(box, '.mo-expimg'), sp = $(im, 'span'); im.style.width = (46 + 54 * p) + '%'; im.style.height = (42 + 58 * p) + '%'; im.style.borderRadius = (24 * (1 - p)) + 'px'; sp.style.opacity = clamp((p - .6) / .3, 0, 1); }),
    desc:'小さな角丸の画像（動画）が、スクロールに合わせて<b>画面いっぱいまで広がる</b>。ヒーローから本編へ没入感を持って入れる。', prompt:'ヒーローの画像（または動画）を、スクロールに合わせて幅46%・角丸24pxの状態から、画面いっぱい・角丸0まで広がるようにして。画面は sticky で固定し、広がり切ったらキャッチコピーをフェードイン。' },
  { name:'ぼかしながら順番に出現', en:'Blur-in stagger', tags:['定番の進化形'],
    init:(el) => { const box = sbox(el, `${TIP}<div style="height:150px"></div><div class="mo-bs">${Array.from({ length:9 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</div><div style="height:160px"></div>`); const g = $(box, '.mo-bs'); const ob = new IntersectionObserver(([e]) => g.classList.toggle('in', e.isIntersecting), { root:box, threshold:.3 }); ob.observe(g); return () => ob.disconnect(); },
    desc:'ただのフェードインに<b>ぼかし（blur）を加え</b>、70msずつずらして出す。ピントが合うように現れて、今っぽく上品な印象になる。', prompt:'要素が画面に入ったら、blur(10px)・下に18px・不透明度0の状態から、ぼかしが解けながら浮かび上がるように表示して。グリッドの各要素は70msずつ遅らせて。' },
  { name:'セクションごとに背景色が変わる', en:'Section color change', tags:['ストーリー'],
    init:(el) => { const S = [['#fef3c7', '#78350f', '朝'], ['#bae6fd', '#0c4a6e', '昼'], ['#fdba74', '#7c2d12', '夕方'], ['#1e1b4b', '#e0e7ff', '夜']]; const box = sbox(el, S.map(s => `<div class="mo-colsec" data-bg="${s[0]}" data-fg="${s[1]}">${s[2]}</div>`).join(''));
      box.style.transition = 'background .6s, color .6s'; const secs = $$(box, '.mo-colsec');
      onScroll(box, () => { const mid = box.getBoundingClientRect().top + box.clientHeight / 2; const cur = secs.find(s => { const r = s.getBoundingClientRect(); return r.top <= mid && r.bottom > mid; }) || secs[0]; box.style.background = cur.dataset.bg; box.style.color = cur.dataset.fg; }); },
    desc:'画面の中央に来たセクションに合わせて、<b>背景色全体がゆっくり切り替わる</b>。時間の流れやストーリー、ブランドの章立てに。', prompt:'セクションが画面の中央に来たら、ページ全体の背景色と文字色がそのセクションの色へ0.6秒で切り替わるようにして（朝→昼→夕方→夜のような流れ）。' },
  { name:'スクロールの速さで傾く', en:'Velocity skew', tags:['話題','勢い'],
    init:(el) => { const box = sbox(el, `${TIP}<div class="mo-vel">${Array.from({ length:9 }, (_, i) => `<div class="c">CARD ${i + 1}</div>`).join('')}</div>`); const cs = $$(box, '.c'); let last = box.scrollTop, sk = 0;
      return VD.loop(el, (dt) => { const st = box.scrollTop, v = (st - last) / Math.max(dt, .001); last = st; sk += (clamp(v * .008, -12, 12) - sk) * Math.min(1, dt * 8); cs.forEach(c => c.style.transform = `skewY(${sk.toFixed(2)}deg)`); }); },
    desc:'速くスクロールするほど要素が<b>斜めに傾き</b>、止まると戻る。勢いが目に見えて、遊び心のあるポートフォリオで人気。', prompt:'スクロールの速さに比例して、コンテンツが skewY で最大12度まで傾き、スクロールを止めると滑らかに0度へ戻る演出を入れて（requestAnimationFrame で速度を計算して補間）。' },
  { name:'スクロール方向で流れが変わるマーキー', en:'Scroll-reactive marquee', tags:['話題'],
    init:(el) => { const word = 'VIBE CODING ✦ MOTION ✦ INTERACTION ✦ '; const box = sbox(el, `<div class="mo-band"><div class="tr">${word.repeat(4)}</div></div>${TIP}<div style="height:900px"></div>`); const tr = $(box, '.tr'); let x = 0, last = box.scrollTop, dir = 1;
      return VD.loop(el, (dt) => { const st = box.scrollTop, d = st - last; last = st; if (d) dir = d > 0 ? 1 : -1; const v = 50 + Math.min(900, Math.abs(d) / Math.max(dt, .001) * .6); x -= dir * v * dt; const W = tr.scrollWidth / 2; if (x <= -W) x += W; if (x > 0) x -= W; tr.style.transform = `translateX(${x}px)`; }); },
    desc:'下へスクロールすると左へ、上へ戻すと右へ流れ、<b>速くスクロールするほど速く</b>流れる。ページ全体に躍動感が出る。', prompt:'帯状の流れる文字（マーキー）を、下にスクロールすると左へ、上にスクロールすると右へ流れ、スクロールが速いほど速く流れるようにして。' },
  { name:'左右から集まる見出し', en:'Split headline', tags:['見出し'],
    init:(el) => stickyDemo(el, '<div class="stick" style="position:sticky;top:0;display:flex;flex-direction:column;justify-content:center;align-items:center;overflow:hidden;font-size:30px;font-weight:900"><div class="l1">MAKE IT</div><div class="l2" style="color:var(--accent)">MOVE.</div></div>', (p, box) => { $(box, '.l1').style.transform = `translateX(${-(1 - p) * 80}%)`; $(box, '.l2').style.transform = `translateX(${(1 - p) * 80}%)`; $(box, '.l1').style.opacity = $(box, '.l2').style.opacity = .15 + .85 * p; }, 400),
    desc:'2行の見出しが、スクロールに合わせて<b>左右から中央へ集まって</b>くる。セクションの区切りや大きなメッセージに。', prompt:'大見出しの1行目を左から、2行目を右から、スクロール量に合わせて中央に集まるようにして（画面は sticky で固定、translateX をスクロール率で計算）。' },
  { name:'円形の進捗リング＋トップへ', en:'Progress ring', tags:['ナビ'],
    init:(el) => { const box = sbox(el, `${TIP}${Array.from({ length:10 }, (_, i) => `<div style="height:56px;margin:12px 16px;border-radius:12px;background:color-mix(in srgb, var(--accent) ${12 + i * 7}%, transparent)"></div>`).join('')}`, '<button class="mo-ring" aria-label="トップへ戻る"><svg viewBox="0 0 46 46"><circle class="bg" cx="23" cy="23" r="20"/><circle class="fg" cx="23" cy="23" r="20" stroke-dasharray="125.7" stroke-dashoffset="125.7"/></svg><span>0%</span></button>');
      const ring = $(el, '.mo-ring'), fg = $(ring, '.fg'), sp = $(ring, 'span'); ring.onclick = () => box.scrollTo({ top:0, behavior:'smooth' });
      onScroll(box, () => { const p = clamp(box.scrollTop / (box.scrollHeight - box.clientHeight), 0, 1); fg.style.strokeDashoffset = 125.7 * (1 - p); sp.textContent = Math.round(p * 100) + '%'; }); },
    desc:'右下の丸い枠が<b>読んだ分だけ一周していき</b>、押すとトップへ戻る。上部の進捗バーより場所を取らない。', prompt:'右下に、スクロール率に応じてSVGの円がぐるっと描かれていく「進捗リング」付きのトップへ戻るボタンを置いて。中央に何%読んだかを表示し、押したら滑らかに先頭へ戻るように。' },
  { name:'タイムラインの線が伸びる', en:'Timeline progress', tags:['沿革'],
    init:(el) => { const box = sbox(el, `${TIP}<div class="mo-tl"><div class="track"><i></i></div>${['2024 アイデアが生まれる', '2025 最初の試作品', '2026 春 正式リリース', '2026 夏 利用者1万人', '2026 秋 海外展開'].map(t => `<div class="ev">${t}</div>`).join('')}</div>`); const tl = $(box, '.mo-tl'), fill = $(box, '.track i'), evs = $$(box, '.ev');
      onScroll(box, () => { const h = clamp(box.scrollTop + box.clientHeight * .55 - tl.offsetTop, 0, tl.offsetHeight); fill.style.height = h + 'px'; evs.forEach(e => e.classList.toggle('on', e.offsetTop + 16 < h)); }); },
    desc:'縦線が<b>スクロールに合わせて伸び</b>、線が届いた出来事の点が光る。沿革・ロードマップ・手順説明に。', prompt:'会社の沿革のタイムラインで、左の縦線がスクロールに合わせて上から伸びていき、線が届いた出来事の丸が塗られて光るようにして。' },
  { name:'起き上がるカード（3D）', en:'3D rise on scroll', tags:['奥行き'],
    init:(el) => { const box = sbox(el, `${TIP}<div class="mo-rise">${Array.from({ length:9 }, (_, i) => `<div class="c"><i style="background:${GRAD[i % 8]}"></i>アイテム ${i + 1}</div>`).join('')}</div><div style="height:40px"></div>`); const cs = $$(box, '.c');
      onScroll(box, () => { const b = box.getBoundingClientRect(); cs.forEach(c => { const r = c.getBoundingClientRect(); const t = clamp((b.bottom - r.top) / 110, 0, 1); c.style.transform = `rotateX(${(1 - t) * 60}deg) translateY(${(1 - t) * 24}px)`; c.style.opacity = .25 + .75 * t; }); }); },
    desc:'画面下から入ってくるカードが、<b>寝た状態から手前に起き上がる</b>ように現れる。perspective（遠近）を付けた rotateX で、立体的な出現になる。', prompt:'リストの各カードが画面の下から入ってくるとき、rotateX(60deg) で奥に倒れた状態から、スクロールに合わせて起き上がるように表示して（親に perspective を設定）。' },
  { name:'スクロールで回る円形の文字', en:'Rotating circular text', tags:['装飾'],
    init:(el) => stickyDemo(el, '<div class="stick mo-circ" style="position:sticky;top:0;display:grid;place-items:center"><svg viewBox="0 0 150 150" style="width:150px;height:150px"><defs><path id="mo-circ-p" d="M75,75 m-56,0 a56,56 0 1,1 112,0 a56,56 0 1,1 -112,0"/></defs><g class="rot" style="transform-origin:75px 75px"><text style="font:700 11.5px var(--mono);letter-spacing:3px;fill:var(--stage-ink)"><textPath href="#mo-circ-p">SCROLL • VIBE CODING • MOTION • </textPath></text></g><circle cx="75" cy="75" r="30" fill="var(--accent)"/><text x="75" y="82" text-anchor="middle" style="font:900 20px var(--font);fill:#fff">↓</text></svg></div>', (p, box) => { $(box, '.rot').style.transform = `rotate(${box.scrollTop * .6}deg)`; }, 600),
    desc:'円に沿って並んだ文字が、<b>スクロール量に合わせて回転</b>する。「SCROLL」案内やロゴのバッジとして、受賞系のサイトでよく使われる。SVGの <code>textPath</code> で作る。', prompt:'円に沿って文字が並ぶバッジ（SVGの textPath）を作り、スクロール量に応じて回転するようにして。中央には下向き矢印の丸を置いて。' },
  { name:'塗られていく見出し', en:'Text fill on scroll', tags:['見出し'],
    init:(el) => stickyDemo(el, '<div class="stick mo-fillh" style="position:sticky;top:0;display:grid;place-items:center"><h6>名前を知れば、<br>指示は正確になる。<span aria-hidden="true">名前を知れば、<br>指示は正確になる。</span></h6></div>', (p, box) => { $(box, '.mo-fillh span').style.clipPath = `inset(0 ${(1 - p) * 100}% 0 0)`; }, 400),
    desc:'薄い見出しが、スクロールに合わせて<b>左から色で塗られていく</b>。読み進めている実感が出る。同じ文字を重ねて、上の層を clip-path で見せていく。', prompt:'大きな見出しを最初は薄い色で表示し、スクロール量に合わせて左からアクセントカラーで塗られていくようにして（同じテキストを重ね、上の層を clip-path: inset() で表示範囲を広げる）。' },
  { name:'奥から迫るズーム', en:'Zoom parallax', tags:['話題','迫力'],
    init:(el) => { const T = [[0, 0, 34, 30, 2.6], [-36, -26, 22, 20, 4.2], [36, -28, 24, 22, 4.6], [-38, 26, 20, 26, 4.4], [38, 24, 22, 22, 4.8], [0, -38, 18, 14, 5.4], [0, 38, 20, 14, 5.2]];
      stickyDemo(el, `<div class="stick mo-zoom" style="position:sticky;top:0;overflow:hidden">${T.map((t, i) => `<div class="tile" style="left:50%;top:50%;width:${t[2]}%;height:${t[3]}%;background:${GRAD[i]}"></div>`).join('')}</div>`, (p, box) => { const st = $(box, '.stick'), W = st.clientWidth, H = st.clientHeight; $$(box, '.tile').forEach((tl, i) => { const t = T[i], s = 1 + p * (t[4] - 1); tl.style.transform = `translate(calc(-50% + ${t[0] / 100 * W * s}px), calc(-50% + ${t[1] / 100 * H * s}px)) scale(${s})`; }); }, 500); },
    desc:'中央の画像と周りの画像が、スクロールに合わせて<b>一斉に手前へ迫ってくる</b>。周りは画面外へ飛び出し、中央の画像が画面を埋める。ポートフォリオや製品紹介の冒頭で印象的。', prompt:'中央と周囲に配置した7枚の画像を、スクロールに合わせて画面の中心を基準に拡大し、周りの画像は外へ飛び出しながら中央の画像が画面いっぱいになる「ズームパララックス」にして（sticky で固定）。' },
  { name:'円が広がって次の場面へ', en:'Circle reveal on scroll', tags:['場面転換'],
    init:(el) => stickyDemo(el, '<div class="stick mo-curtain" style="position:sticky;top:0;overflow:hidden"><div class="a">BEFORE</div><div class="b">AFTER</div></div>', (p, box) => { $(box, '.b').style.clipPath = `circle(${p * 80}% at 50% 50%)`; }, 400),
    desc:'次のセクションが<b>中心から円形に広がって</b>現れる。ビフォー・アフターや、章の切り替えに。clip-path の circle() をスクロール率で大きくするだけ。', prompt:'2つのセクションを重ね、スクロールに合わせて上のセクションが中心から円形に広がって現れるようにして（clip-path: circle() の半径をスクロール率で変える）。' },
];

TABS.push({
  id:'scroll', label:'スクロール演出（上級）', icon:'↕',
  intro:'基本のフェードインより一歩進んだ、<b>スクロール量に連動する演出</b>。見本は枠の中をスクロールして確認できます。多くは <code>position: sticky</code> で画面を止めて、スクロール率（0〜1）で見た目を変える、という同じ仕組みでできています。基本形は <a href="web-design.html#scroll">Webデザイン辞典のスクロール演出</a> へ。 スクロール量を 0〜1 に変える計算は <a href="motion-math.html#ui">動きの計算辞典の「UIで使う計算」</a> へ。',
  sections:[
    { title:'仕組み：スクロール率で動かす', layout:'rows', items:[
      { name:'スクロール率（0〜1）を求める', en:'Scroll progress', tags:['全部の基本'], desc:'「その区間をどれだけ進んだか」を0〜1の数で出し、それを大きさ・位置・不透明度・回転に掛け算するのがスクロール連動演出の基本。区間を <code>position: sticky</code> で画面に止めておくと、止まっている間に変化を見せられる。', prompt:'このセクションを高さ400vhにして中身を sticky で画面に固定し、セクション内のスクロール率（0〜1）を計算して、その値で要素の scale・translate・opacity を変えるようにして。',
        code:"const p = Math.min(1, Math.max(0, (scrollY - section.offsetTop) / (section.offsetHeight - innerHeight)));\nel.style.transform = `scale(${0.5 + 0.5 * p})`;\n// CSSだけなら：animation-timeline: view(); / scroll();" },
      { name:'CSSだけで書く方法', en:'Scroll-driven animations', tags:['新しいCSS'], desc:'<code>animation-timeline: scroll()</code>（ページ全体のスクロール）や <code>view()</code>（要素が画面を通過する間）を使うと、上の計算をJSなしで書ける。対応ブラウザが増えているが、未対応環境では普通に表示されるようにしておく。', code:'@supports (animation-timeline: view()) {\n  .card { animation: rise linear both; animation-timeline: view(); animation-range: entry 0% cover 40%; }\n}\n@keyframes rise { from { opacity:0; transform: translateY(40px) rotateX(40deg); } }' },
      { name:'ライブラリを使う', en:'GSAP ScrollTrigger / Motion / Lenis', desc:'複雑な演出は GSAP の ScrollTrigger（pin・scrub）が定番。Reactなら Motion の <code>useScroll</code>。Lenis で慣性スクロールにすると、連動演出がさらに滑らかに見える。', prompt:'GSAPのScrollTriggerで、このセクションを pin して scrub: true にし、スクロールに合わせてタイムラインを進めて。' },
    ]},
    { title:'スクロール連動の見本', items: SCROLL.map(s => Object.assign({ stage:'free', h:220, hint:'枠内をスクロール' }, s)) },
  ]
});
})();
