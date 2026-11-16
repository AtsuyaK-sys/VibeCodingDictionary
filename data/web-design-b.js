/* Webデザイン・アニメーション辞典 — B: スクロール / テキスト / 背景 / ローディング */
(function(){
const blocks = (n, cls) => Array.from({ length:n }, (_, i) => `<div class="s-blk ${cls || ''} ${i % 2 ? 'alt' : ''}"></div>`).join('');
const tip = (t) => `<div class="s-tip">${t || '↓ この枠の中をスクロールしてみて'}</div>`;
// 1文字ずつ <span style="--i:n"> に分割する
function split(node){
  const text = node.textContent; node.textContent = '';
  [...text].forEach((ch, i) => { const s = document.createElement('span'); s.textContent = ch === ' ' ? ' ' : ch; s.style.setProperty('--i', i); node.append(s); });
}
function io(root, targets, fn, opts){
  const ob = new IntersectionObserver((es) => es.forEach(e => fn(e)), Object.assign({ root, threshold:.25 }, opts || {}));
  targets.forEach(t => ob.observe(t));
  return () => ob.disconnect();
}

/* ---------- スクロール演出 ---------- */
TABS.push({
  id:'scroll', label:'スクロール演出', icon:'↕',
  intro:'スクロールに合わせて要素が現れたり動いたりする演出。見本は<b>枠の中をスクロール</b>して確認できます。実装の基本は <code>IntersectionObserver</code>（画面に入ったか判定するAPI）で、最近はCSSだけで書ける<b>スクロール駆動アニメーション</b>も使えるようになりました。積み重なるカードやズームなどの上級編は <a href="motion.html#scroll">モーション・インタラクション辞典</a> へ。',
  sections:[
    { title:'表示・出現', items:[
      { name:'スクロールでフェードイン', en:'reveal on scroll', stage:'free', h:210, hint:'枠内をスクロール', tags:['定番','IntersectionObserver','AOS'],
        demo:`<div class="s-box s-pad">${tip()}${blocks(8, 's-reveal')}</div>`,
        init:(el) => io(el.querySelector('.s-box'), el.querySelectorAll('.s-reveal'), e => e.target.classList.toggle('in', e.isIntersecting)),
        desc:'要素が画面内に入ったタイミングでフェードアップさせる。LPの基本中の基本。AOSライブラリなら <code>data-aos="fade-up"</code> だけで可能。',
        prompt:'各セクションの要素が画面に入ったら下から浮かび上がってフェードインするようにして。IntersectionObserverを使い、一度表示したら再度は動かさないで。',
        code:"const io = new IntersectionObserver(entries => {\n  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });\n}, { threshold: .2 });\ndocument.querySelectorAll('.reveal').forEach(el => io.observe(el));\n\n/* .reveal { opacity:0; transform:translateY(30px); transition:.6s; }\n   .reveal.in { opacity:1; transform:none; } */" },
      { name:'順番に出現', en:'staggered reveal', stage:'free', h:210, hint:'枠内をスクロール', tags:['stagger'],
        demo:`<div class="s-box s-pad">${tip()}<div class="s-stg">${Array.from({length:9}, (_, i) => `<i style="--i:${i}"></i>`).join('')}</div></div>`,
        init:(el) => io(el.querySelector('.s-box'), el.querySelectorAll('.s-stg'), e => e.target.classList.toggle('in', e.isIntersecting)),
        desc:'グリッドが画面に入ると、子要素が80msずつ遅れて順に現れる。実績・機能一覧・ギャラリーに。', prompt:'機能紹介の9個のカードが、画面に入ったら左上から順番に80msずつ遅れてポップインするようにして。',
        code:'.grid.in > * { opacity:1; transform:none; transition-delay: calc(var(--i) * 80ms); }' },
      { name:'カウントアップ', en:'count up number', stage:'free', h:190, hint:'枠内をスクロール', tags:['実績','数字'],
        demo:`<div class="s-box s-pad">${tip()}<div style="height:150px"></div><div class="s-count" data-to="12800">0</div><div class="s-tip">導入社数</div><div style="height:120px"></div></div>`,
        init:(el) => { const n = el.querySelector('.s-count'); let raf; return io(el.querySelector('.s-box'), [n], e => { if (!e.isIntersecting){ n.textContent = '0'; return; } const to = +n.dataset.to, t0 = performance.now(); cancelAnimationFrame(raf); (function step(now){ const p = Math.min(1, (now - t0) / 1500), v = 1 - Math.pow(1 - p, 3); n.textContent = Math.round(to * v).toLocaleString(); if (p < 1) raf = requestAnimationFrame(step); })(t0); }); },
        desc:'数字が見えたときに0から目標値までカウントアップする。「導入社数」「満足度」など実績の訴求に。', prompt:'実績セクションの数字（12,800社など）が画面に入ったら、0から1.5秒かけてカウントアップさせて。最後はゆっくり止まるease-outで、3桁ごとにカンマを入れて。',
        code:"function countUp(el, to, ms = 1500){\n  const t0 = performance.now();\n  (function step(now){\n    const p = Math.min(1, (now - t0) / ms), v = 1 - Math.pow(1 - p, 3); // easeOutCubic\n    el.textContent = Math.round(to * v).toLocaleString();\n    if (p < 1) requestAnimationFrame(step);\n  })(t0);\n}" },
      { name:'クリップで現れる画像', en:'clip-path reveal', stage:'free', h:210, hint:'枠内をスクロール', tags:['clip-path'],
        demo:`<div class="s-box s-pad">${tip()}<div style="height:140px"></div><div class="s-clip wd-art"></div><div style="height:220px"></div></div>`,
        init:(el) => { const box = el.querySelector('.s-box'), img = el.querySelector('.s-clip'); const f = () => { const r = img.getBoundingClientRect(), b = box.getBoundingClientRect(); const p = Math.min(1, Math.max(0, (b.bottom - r.top) / (b.height * .9))); const x = 50 - p * 50; img.style.clipPath = `inset(0 ${x}% 0 ${x}% round 14px)`; }; box.addEventListener('scroll', f, { passive:true }); f(); },
        desc:'スクロール量に応じて、画像が中央から左右に開くように現れる。写真を印象的に見せたいときに。', prompt:'スクロールに合わせて、画像が中央から左右に開くように表示されるclip-pathアニメーションを付けて。',
        code:"addEventListener('scroll', () => {\n  const r = img.getBoundingClientRect();\n  const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight * .9)));\n  const x = 50 - p * 50;\n  img.style.clipPath = `inset(0 ${x}% 0 ${x}%)`;\n}, { passive: true });" },
      { name:'スクロールで線を描く', en:'scroll-linked path drawing', stage:'free', h:210, hint:'枠内をスクロール', tags:['SVG','進捗連動'],
        demo:`<div class="s-box"><div style="position:sticky;top:0;height:210px;display:grid;place-items:center"><svg width="220" height="150" viewBox="0 0 220 150"><path d="M10 130 C 50 10, 90 140, 120 70 S 190 10, 210 40" fill="none" stroke="var(--accent)" stroke-width="5" stroke-linecap="round"/></svg></div><div style="height:500px"></div></div>`,
        init:(el) => { const box = el.querySelector('.s-box'), p = el.querySelector('path'); const L = p.getTotalLength(); p.style.strokeDasharray = L; const f = () => { const pr = box.scrollTop / (box.scrollHeight - box.clientHeight || 1); p.style.strokeDashoffset = L * (1 - pr); }; box.addEventListener('scroll', f, { passive:true }); f(); },
        desc:'スクロール量に比例してSVGの線が伸びていく。沿革（タイムライン）や道のり、手順の説明に。', prompt:'ページをスクロールするのに合わせて、SVGの曲線が少しずつ描かれていくようにして（スクロール率をstroke-dashoffsetに反映）。',
        code:"const L = path.getTotalLength();\npath.style.strokeDasharray = L;\naddEventListener('scroll', () => {\n  const p = scrollY / (document.documentElement.scrollHeight - innerHeight);\n  path.style.strokeDashoffset = L * (1 - p);\n});" },
    ]},
    { title:'奥行き・固定・横移動', items:[
      { name:'パララックス', en:'parallax scrolling', stage:'free', h:210, hint:'枠内をスクロール', tags:['視差','奥行き'],
        demo:`<div class="s-box"><div class="s-para">
          <div class="l" data-f=".7" style="top:30px"><div style="display:flex;justify-content:space-around;opacity:.35">${'<div class="wd-ball" style="width:16px;height:16px"></div>'.repeat(6)}</div></div>
          <div class="l" data-f=".4" style="top:110px"><div style="display:flex;justify-content:space-around;opacity:.6">${'<div class="wd-ball" style="width:30px;height:30px;background:#ff6b9a"></div>'.repeat(4)}</div></div>
          <div class="l" data-f="0" style="top:20px;padding:0 20px"><div class="wd-card" style="margin:140px auto 0">手前の要素は普通に流れ、奥の丸ほどゆっくり動く</div></div>
        </div></div>`,
        init:(el) => { const box = el.querySelector('.s-box'), ls = el.querySelectorAll('.l'); const f = () => ls.forEach(l => l.style.transform = `translateY(${box.scrollTop * l.dataset.f}px)`); box.addEventListener('scroll', f, { passive:true }); },
        desc:'奥のものほどゆっくり、手前のものほど速く動かして<b>奥行き</b>を感じさせる。背景画像だけゆっくり動かすのが最も手軽。', prompt:'ヒーローの背景画像をスクロール速度の50%で動かすパララックス効果を付けて。手前の文字は普通にスクロールさせて。',
        code:"addEventListener('scroll', () => {\n  layers.forEach(l => l.style.transform = `translateY(${scrollY * l.dataset.speed}px)`);\n}, { passive: true });\n/* data-speed=\"0.5\" なら半分の速さ。Rellax.js / GSAP ScrollTrigger でも可 */" },
      { name:'スティッキー（追従）', en:'position: sticky', stage:'free', h:210, hint:'枠内をスクロール', tags:['CSSのみ'],
        demo:`<div class="s-box s-sticky">${['第1章 はじめに','第2章 準備','第3章 実装','第4章 公開'].map(t => `<h5>${t}</h5><p>見出しはスクロールしても上に貼り付き、次の見出しが来ると押し出されます。目次・表のヘッダー・カテゴリ見出しに。</p>`).join('')}</div>`,
        desc:'スクロールしても指定位置に貼り付く。<b>CSS1行</b>でできる。ヘッダー、表の見出し行、サイドバーの目次に。親要素に <code>overflow:hidden</code> があると効かないので注意。', prompt:'各セクションの見出しを、スクロール中は画面上部に貼り付くようにして（position: sticky）。',
        code:'h2 { position: sticky; top: 0; background: #fff; z-index: 1; }' },
      { name:'横スクロールセクション', en:'horizontal scroll section', stage:'free', h:210, hint:'枠内を縦にスクロール', tags:['GSAP ScrollTrigger','pin'],
        demo:`<div class="s-box"><div class="s-hz-wrap"><div class="s-hz-sticky"><div class="s-hz-track">${['#6d4cff','#ff6b9a','#ffb703','#22c55e','#06b6d4','#f97316','#8b5cf6','#ec4899'].map((c, i) => `<div style="background:${c}">0${i+1}</div>`).join('')}</div></div></div></div>`,
        init:(el) => { const box = el.querySelector('.s-box'), wrap = el.querySelector('.s-hz-wrap'), st = el.querySelector('.s-hz-sticky'), tr = el.querySelector('.s-hz-track'); st.style.height = box.clientHeight + 'px'; const f = () => { const p = box.scrollTop / (wrap.offsetHeight - box.clientHeight); tr.style.transform = `translateX(${-p * Math.max(0, tr.scrollWidth - box.clientWidth)}px)`; }; box.addEventListener('scroll', f, { passive:true }); },
        desc:'縦にスクロールしているのに、ある区間だけ画面が固定され中身が横に流れる。作品一覧やステップ紹介でインパクトを出せる。', prompt:'「制作実績」セクションは、縦スクロールすると画面が固定（pin）されてカードが横に流れていく横スクロール演出にして。GSAPのScrollTriggerを使って。',
        code:"gsap.to('.track', {\n  x: () => -(track.scrollWidth - innerWidth),\n  ease: 'none',\n  scrollTrigger: { trigger: '.section', pin: true, scrub: 1, end: () => '+=' + track.scrollWidth }\n});" },
      { name:'スクロールスナップ', en:'scroll-snap', stage:'free', h:190, hint:'横にスワイプ/スクロール', tags:['CSSのみ','カルーセル'],
        demo:`<div class="s-snap">${['#6d4cff','#ff6b9a','#ffb703','#22c55e','#06b6d4'].map((c, i) => `<div style="background:${c}">SLIDE ${i+1}</div>`).join('')}</div>`,
        desc:'スクロールを止めると要素の位置にピタッと吸着する。JSなしでカルーセルやフルスクリーンのページ送りが作れる。', prompt:'商品画像のスライダーを、CSSのscroll-snapで横スワイプすると1枚ずつ中央にピタッと止まるようにして。',
        code:'.slider { display:flex; overflow-x:auto; scroll-snap-type: x mandatory; }\n.slide  { flex:0 0 80%; scroll-snap-align: center; }' },
    ]},
    { title:'ヘッダー・進捗・ナビ', items:[
      { name:'スクロール進捗バー', en:'reading progress bar', stage:'free', h:200, hint:'枠内をスクロール', tags:['ブログ'],
        demo:`<div class="s-progress"></div><div class="s-box s-pad">${tip('↓ スクロールで上のバーが伸びる')}${blocks(10)}</div>`,
        init:(el) => { const box = el.querySelector('.s-box'), bar = el.querySelector('.s-progress'); box.addEventListener('scroll', () => bar.style.width = (box.scrollTop / (box.scrollHeight - box.clientHeight) * 100) + '%', { passive:true }); },
        desc:'ページ上部に、どこまで読んだかを示すバーを表示。長い記事で読者の離脱を防ぐ。', prompt:'記事ページの最上部に、読んだ割合に応じて伸びる3pxの進捗バーを付けて。',
        code:"addEventListener('scroll', () => {\n  const h = document.documentElement;\n  bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';\n});" },
      { name:'CSSだけの進捗バー・出現', en:'scroll-driven animations', stage:'free', h:210, hint:'枠内をスクロール', tags:['新しいCSS','animation-timeline'],
        demo:`<div class="s-box"><div class="s-cssprog"></div><div class="s-pad"><div class="s-tip" data-support></div>${Array.from({length:8}, (_, i) => `<div class="s-blk s-cssview ${i % 2 ? 'alt' : ''}"></div>`).join('')}</div></div>`,
        init:(el) => { el.querySelector('[data-support]').textContent = CSS.supports('animation-timeline: scroll()') ? '↓ JSなし・CSSだけで動いています' : '※このブラウザは未対応（Chrome/Edge 115+で動作）'; },
        desc:'<code>animation-timeline: scroll()</code> と <code>view()</code> で、<b>JavaScriptなしで</b>スクロール連動アニメーションが書ける。Chrome/Edgeは対応済み。未対応ブラウザでは普通に表示されるようにしておく。',
        prompt:'CSSのスクロール駆動アニメーション（animation-timeline: scroll() と view()）で、上部の読書進捗バーと、要素のフェードインを実装して。未対応ブラウザでも内容は普通に見えるように@supportsで分けて。',
        code:'@supports (animation-timeline: scroll()) {\n  .progress { transform-origin:left; animation: grow linear both; animation-timeline: scroll(); }\n  .reveal   { animation: fadeUp linear both; animation-timeline: view(); animation-range: entry 0% cover 35%; }\n}\n@keyframes grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }' },
      { name:'縮むヘッダー', en:'shrinking sticky header', stage:'free', h:200, hint:'枠内をスクロール', tags:['ヘッダー'],
        demo:`<div class="s-box"><div class="s-head"><span>◆ LOGO</span><span>MENU</span></div><div class="s-pad">${tip()}${blocks(8)}</div></div>`,
        init:(el) => { const box = el.querySelector('.s-box'), hd = el.querySelector('.s-head'); box.addEventListener('scroll', () => hd.classList.toggle('small', box.scrollTop > 10), { passive:true }); },
        desc:'最初は大きく透明なヘッダーが、スクロールすると小さくなり背景と影が付く。', prompt:'ヘッダーは最初は透明で高さ80px、少しでもスクロールしたら高さ56pxに縮んで白背景と影が付くようにして。',
        code:"addEventListener('scroll', () => header.classList.toggle('small', scrollY > 10));\n/* .header { transition: padding .3s, background .3s, box-shadow .3s; } */" },
      { name:'隠れるヘッダー', en:'hide on scroll down', stage:'free', h:200, hint:'下→上にスクロール', tags:['スマホ向け','ヘッドルーム'],
        demo:`<div class="s-box"><div class="s-head small"><span>◆ LOGO</span><span>MENU</span></div><div class="s-pad">${tip('↓下へ：隠れる　↑上へ：出てくる')}${blocks(10)}</div></div>`,
        init:(el) => { const box = el.querySelector('.s-box'), hd = el.querySelector('.s-head'); let last = 0; box.addEventListener('scroll', () => { const y = box.scrollTop; hd.classList.toggle('hide', y > last && y > 40); last = y; }, { passive:true }); },
        desc:'下にスクロールするとヘッダーが隠れ、少しでも上に戻すと現れる。スマホで画面を広く使える。', prompt:'下にスクロールしたらヘッダーを上に隠し、上にスクロールしたらすぐに再表示するようにして（Headroom.jsのような挙動）。',
        code:"let last = 0;\naddEventListener('scroll', () => {\n  header.classList.toggle('hide', scrollY > last && scrollY > 80);\n  last = scrollY;\n});\n/* .hide { transform: translateY(-100%); } */" },
      { name:'ページ内スムーススクロール', en:'smooth scroll / anchor link', stage:'free', h:210, tags:['CSSのみ'],
        demo:`<div class="s-box"><nav class="s-anchor-nav"><a href="#" data-to="0">料金</a><a href="#" data-to="1">FAQ</a><a href="#" data-to="2">お問い合わせ</a></nav>${['料金','FAQ','お問い合わせ'].map((t, i) => `<div class="s-anchor-sec" style="background:color-mix(in srgb, var(--accent) ${10 + i * 12}%, transparent)">${t}</div>`).join('')}</div>`,
        init:(el) => { const box = el.querySelector('.s-box'), secs = el.querySelectorAll('.s-anchor-sec'), nav = el.querySelector('.s-anchor-nav'); el.querySelectorAll('[data-to]').forEach(a => a.addEventListener('click', (e) => { e.preventDefault(); box.scrollTo({ top: secs[a.dataset.to].offsetTop - nav.offsetHeight, behavior:'smooth' }); })); },
        desc:'目次のリンクを押すと、該当セクションまでヌルッと滑らかにスクロールする。固定ヘッダーがある場合は <code>scroll-margin-top</code> で見出しが隠れないようにする。', prompt:'ページ内リンクをクリックしたら滑らかにスクロールするようにして。固定ヘッダーの高さ分（64px）ずらして止まるように。',
        code:'html { scroll-behavior: smooth; }\nsection { scroll-margin-top: 64px; } /* 固定ヘッダーの高さ */' },
      { name:'トップへ戻るボタン', en:'back to top', stage:'free', h:200, hint:'枠内をスクロール', tags:['定番'],
        demo:`<div class="s-box s-pad">${tip()}${blocks(10)}</div><button class="s-totop" title="上へ">↑</button>`,
        init:(el) => { const box = el.querySelector('.s-box'), b = el.querySelector('.s-totop'); box.addEventListener('scroll', () => b.classList.toggle('show', box.scrollTop > 120), { passive:true }); b.addEventListener('click', () => box.scrollTo({ top:0, behavior:'smooth' })); },
        desc:'一定量スクロールしたら右下にボタンが現れ、押すとページ先頭へ戻る。', prompt:'400pxスクロールしたら右下に「↑」ボタンをフェードインで表示し、押したらページ先頭へスムーズに戻るようにして。',
        code:"addEventListener('scroll', () => btn.classList.toggle('show', scrollY > 400));\nbtn.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });" },
      { name:'無限スクロール', en:'infinite scroll', stage:'free', h:210, hint:'一番下までスクロール', tags:['SNS風','読み込み'],
        demo:`<div class="s-box s-pad"><div class="list"></div><div class="s-tip more">読み込み中…</div></div>`,
        init:(el) => { const box = el.querySelector('.s-box'), list = el.querySelector('.list'), more = el.querySelector('.more'); let n = 0, busy = false; const add = () => { for (let i = 0; i < 5 && n < 40; i++){ n++; const d = document.createElement('div'); d.className = 'wd-card'; d.style.cssText = 'width:auto;margin:8px 0'; d.textContent = '投稿 #' + n; list.append(d); } if (n >= 40) more.textContent = 'これ以上ありません'; }; add(); box.addEventListener('scroll', () => { if (busy || n >= 40) return; if (box.scrollTop + box.clientHeight > box.scrollHeight - 30){ busy = true; setTimeout(() => { add(); busy = false; }, 500); } }, { passive:true }); },
        desc:'一番下までスクロールすると次のデータを自動で読み込む。SNSのタイムライン。最下部に置いた目印をIntersectionObserverで監視するのが今風。', prompt:'投稿一覧を無限スクロールにして。一番下の「読み込み中…」要素が見えたら次の20件をAPIから取得して追加し、最後まで来たら「これ以上ありません」と表示して。',
        code:"const io = new IntersectionObserver(async ([e]) => {\n  if (!e.isIntersecting || loading) return;\n  loading = true; const items = await fetchNext(); render(items); loading = false;\n});\nio.observe(document.querySelector('#sentinel'));" },
    ]},
  ]
});

/* ---------- テキストエフェクト ---------- */
TABS.push({
  id:'text', label:'テキストエフェクト', icon:'Aa',
  intro:'見出しやキャッチコピーを印象的に見せる文字の演出。本文には使わず、<b>見出し・数字・キャッチコピーだけ</b>に絞ると効果的です。',
  sections:[
    { title:'動く文字', items:[
      { name:'タイプライター', en:'typewriter effect', demo:'<div class="t-type"><span class="tx"></span><span class="caret"></span></div>', tags:['定番','AI・チャット感'],
        init:(el) => { const tx = el.querySelector('.tx'); const words = ['Hello, World!', 'AIと一緒に作ろう。', 'Vibe Coding 辞典']; let w = 0, i = 0, del = false, alive = true; (function tick(){ if (!alive) return; const s = words[w]; tx.textContent = s.slice(0, i); if (!del && i < s.length) i++; else if (!del){ del = true; return setTimeout(tick, 1200); } else if (i > 0) i--; else { del = false; w = (w + 1) % words.length; } setTimeout(tick, del ? 40 : 90); })(); return () => alive = false; },
        desc:'1文字ずつ打ち込まれるように表示し、点滅カーソルを添える。複数のフレーズを打っては消す演出も定番。Typed.jsでも可。', prompt:'ヒーローのキャッチコピーを、1文字ずつタイピングされるように表示して。3つのフレーズを順番に「打つ→1.2秒待つ→消す」を繰り返し、末尾に点滅するカーソルを付けて。',
        code:"const words = ['Hello', 'こんにちは']; let w = 0, i = 0, del = false;\n(function tick(){\n  const s = words[w]; el.textContent = s.slice(0, i);\n  if (!del && i < s.length) i++;\n  else if (!del) { del = true; return setTimeout(tick, 1200); }\n  else if (i > 0) i--;\n  else { del = false; w = (w + 1) % words.length; }\n  setTimeout(tick, del ? 40 : 90);\n})();" },
      { name:'1文字ずつ出現', en:'split text / letter stagger', demo:'<div class="t-big t-split">アイデアをカタチに</div>', tags:['GSAP SplitText'],
        init:(el) => split(el.querySelector('.t-split')),
        desc:'文字を1つずつ<code>&lt;span&gt;</code>に分割し、時間差で回転しながら浮かび上がらせる。GSAPのSplitText（現在は無料）を使うと行・単語単位も簡単。', prompt:'見出しを1文字ずつspanに分割して、60msずつ遅らせながら下から少し回転して浮かび上がるアニメーションにして。',
        code:"[...h1.textContent].forEach((ch, i) => {\n  const s = document.createElement('span');\n  s.textContent = ch; s.style.setProperty('--i', i); /* …append */\n});\n/* span { display:inline-block; animation: up .7s both; animation-delay: calc(var(--i) * 60ms); } */" },
      { name:'波打つ文字', en:'wave text', demo:'<div class="t-big t-wave" style="font-size:26px">Loading...</div>', tags:['ループ'],
        init:(el) => split(el.querySelector('.t-wave')),
        desc:'文字が順番にぴょこっと跳ねて波のように見える。ローディング表示や楽しい見出しに。', prompt:'「Loading...」の文字が1文字ずつ順番に跳ねて波打つアニメーションにして。',
        code:'span { display:inline-block; animation: wave 1.4s ease-in-out infinite; animation-delay: calc(var(--i) * 90ms); }\n@keyframes wave { 30% { transform: translateY(-14px); } 60%,100% { transform: none; } }' },
      { name:'テキストスクランブル', en:'text scramble / decode', demo:'<div class="t-big" style="font-family:var(--mono);font-size:24px"><span class="sc">DECODING…</span></div>', tags:['JS','ハッカー風'],
        init:(el) => { const t = el.querySelector('.sc'); const finals = ['VIBE CODING', 'ACCESS GRANTED', 'HELLO, AI']; const chars = '!<>-_\\/[]{}—=+*^?#ｱｲｳｴｵｶｷ01'; let k = 0, alive = true; function run(){ if (!alive) return; const target = finals[k++ % finals.length]; let f = 0; const iv = setInterval(() => { if (!alive) return clearInterval(iv); t.textContent = [...target].map((c, i) => i < f / 3 ? c : chars[Math.floor(Math.random() * chars.length)]).join(''); f++; if (f / 3 > target.length){ clearInterval(iv); setTimeout(run, 1600); } }, 40); } run(); return () => alive = false; },
        desc:'ランダムな記号が次々に入れ替わり、左から正しい文字に確定していく。ハッカー・暗号解読・テック系の見出しに。', prompt:'見出しの文字を、ランダムな記号がパラパラ切り替わりながら左から順に正しい文字に確定していくスクランブル（デコード）演出にして。',
        code:"let f = 0;\nconst iv = setInterval(() => {\n  el.textContent = [...target].map((c, i) => i < f/3 ? c : chars[Math.random()*chars.length|0]).join('');\n  if (++f/3 > target.length) clearInterval(iv);\n}, 40);" },
      { name:'回転する単語', en:'rotating words', demo:'<div class="t-rotate">私たちは<span class="win"><span><span>作る。</span><span>試す。</span><span>届ける。</span><span>学ぶ。</span><span>作る。</span></span></span></div>', tags:['CSSのみ'],
        desc:'文の一部の単語だけが縦にスライドして入れ替わる。「〇〇を、もっと△△に」のようなキャッチコピーに。', prompt:'「私たちは〇〇。」の〇〇の部分だけ、「作る／試す／届ける／学ぶ」が2秒ごとに下から上へスライドして入れ替わるようにして。',
        code:'.win { height:1.4em; overflow:hidden; display:inline-block; }\n.win > span { display:flex; flex-direction:column; animation: words 6s infinite; }\n/* 最後に1つ目の単語を複製しておくと継ぎ目なくループする */' },
      { name:'マーキー（流れる文字）', en:'marquee / ticker', demo:'<div class="t-marquee"><div><span>VIBE CODING ✦ DESIGN ✦ ANIMATION ✦ API ✦</span><span>VIBE CODING ✦ DESIGN ✦ ANIMATION ✦ API ✦</span></div></div>', hint:'ホバーで一時停止', tags:['無限ループ','ロゴ帯'],
        desc:'文字やロゴが横に流れ続ける。<b>中身を2回並べて-50%移動</b>させると継ぎ目なくループする。導入企業ロゴの帯やニュースティッカーに。', prompt:'導入企業のロゴを横一列に並べて、右から左へ無限に流れ続けるマーキーにして。ホバーで一時停止し、両端はフェードアウトさせて。',
        code:'.track { display:inline-flex; animation: marquee 20s linear infinite; }\n.track:hover { animation-play-state: paused; }\n@keyframes marquee { to { transform: translateX(-50%); } }\n/* .track の中身を2セット並べる */' },
      { name:'マスクで下から出現', en:'mask reveal / line reveal', demo:'<div class="t-big t-mask" style="font-size:28px"><span>Design is how it works.</span></div>', tags:['高級感'],
        desc:'行ごとに<code>overflow:hidden</code>の枠を作り、文字を枠の下からスッと出す。ハイブランドのサイトで多用される上品な出現。', prompt:'見出しの各行を overflow:hidden で包み、文字が枠の下からスッとせり上がって現れるマスクリビール演出にして。',
        code:'.line { overflow:hidden; }\n.line > span { display:block; animation: up .9s cubic-bezier(.77,0,.18,1) both; }\n@keyframes up { from { transform: translateY(110%); } }' },
      { name:'ぼかしから出現', en:'blur in', demo:'<div class="t-big t-blurin" style="font-size:28px">FOCUS ON YOU</div>', tags:['filter'],
        init:(el) => split(el.querySelector('.t-blurin')),
        desc:'ぼやけた文字がピントが合うようにくっきりしていく。写真・カメラ・映画系の雰囲気に。', prompt:'タイトルの文字が1文字ずつ、ぼかし(blur 10px)からピントが合うようにくっきり現れる演出にして。',
        code:'span { display:inline-block; animation: blurIn 1s both; animation-delay: calc(var(--i)*80ms); }\n@keyframes blurIn { from { filter: blur(10px); opacity: 0; } }' },
      { name:'マーカーを引く', en:'highlighter / marker', demo:'<div style="font-size:18px;font-weight:700">ここが<span class="t-marker">一番大事なポイント</span>です</div>', tags:['強調','日本のLPで定番'],
        desc:'黄色い蛍光ペンを左から引くように強調する。日本の記事・LPで非常によく使われる。下半分だけ塗ると自然。', prompt:'本文中の重要な部分に、画面に入ったら左から黄色の蛍光マーカーが引かれるアニメーションを付けて（文字の下40%だけ塗る）。',
        code:'.marker { background: linear-gradient(transparent 60%, #ffe066 60%) no-repeat;\n  background-size: 0% 100%; transition: background-size 1s; }\n.marker.in { background-size: 100% 100%; }' },
      { name:'手書きで描く文字', en:'handwriting stroke text', demo:'<svg class="t-hand" width="260" height="90" viewBox="0 0 260 90"><text x="130" y="62" text-anchor="middle" font-size="52">ありがとう</text></svg>', tags:['SVG'],
        desc:'SVGの文字の輪郭線を描いてから塗りつぶす。メッセージカード、署名、結婚式の招待状などに。', prompt:'「ありがとう」の文字を、SVGで輪郭を手書きのように描いてから中を塗りつぶすアニメーションにして。',
        code:'text { fill: transparent; stroke: #6d4cff; stroke-dasharray: 600; stroke-dashoffset: 600;\n  animation: draw 4s forwards; }\n@keyframes draw { 60% { stroke-dashoffset: 0; fill: transparent; } 100% { stroke-dashoffset: 0; fill: #6d4cff; } }' },
    ]},
    { title:'装飾された文字', items:[
      { name:'グラデーション文字', en:'gradient text', demo:'<div class="t-big t-grad">Gradient Text</div>', tags:['定番','background-clip'],
        desc:'背景のグラデーションを文字の形で切り抜く。見出しの1語だけに使うのが上品。', prompt:'見出しの「未来」という単語だけ、紫→ピンク→オレンジのグラデーション文字にして。',
        code:'.grad { background: linear-gradient(90deg, #6d4cff, #ff6b9a, #ffb36b);\n  -webkit-background-clip: text; background-clip: text; color: transparent; }' },
      { name:'動くグラデーション文字', en:'animated gradient text', demo:'<div class="t-big t-grad-anim">Shimmering</div>', tags:['ループ'],
        desc:'グラデーションが文字の中を流れ続ける。AI・テクノロジー系の見出しに人気。', prompt:'タイトルのグラデーションが左から右へゆっくり流れ続けるようにして（background-sizeを300%にしてbackground-positionをアニメーション）。',
        code:'.t { background: linear-gradient(90deg, #6d4cff, #00d4ff, #ff6b9a, #6d4cff); background-size:300% 100%;\n  -webkit-background-clip:text; color:transparent; animation: pan 4s linear infinite; }\n@keyframes pan { to { background-position: 300% 0; } }' },
      { name:'グリッチ', en:'glitch text', demo:'<div class="t-glitch" data-text="GLITCH">GLITCH</div>', tags:['サイバー','::before/::after'],
        desc:'デジタルノイズで文字がズレたように乱れる。水色とマゼンタの色ズレを擬似要素で重ねて作る。', prompt:'見出しにグリッチエフェクトを付けて。::beforeと::afterで水色とマゼンタのコピーを重ね、clip-pathで横に切った断片をランダムにずらして。',
        code:'.glitch { position:relative; }\n.glitch::before, .glitch::after { content: attr(data-text); position:absolute; inset:0; }\n.glitch::before { color:#0ff; clip-path: inset(0 0 60% 0); animation: g1 2s infinite steps(1); }\n.glitch::after  { color:#f0f; clip-path: inset(55% 0 0 0); animation: g2 1.8s infinite steps(1); }' },
      { name:'ネオンサイン', en:'neon sign', stage:'free', demo:'<div class="t-neon-wrap"><div class="t-neon">OPEN 24H</div></div>', tags:['text-shadow'],
        desc:'text-shadowを何層も重ねて発光させ、ときどきチラつかせる。夜・バー・ゲーム・イベント系に。', prompt:'暗い背景に、ピンクのネオンサイン風の文字を作って。text-shadowを4層重ねて発光させ、ときどき蛍光灯のようにチラつかせて。',
        code:'.neon { color:#fff; text-shadow: 0 0 4px #fff, 0 0 10px #ff2bd6, 0 0 22px #ff2bd6, 0 0 40px #ff2bd6; }' },
      { name:'縁取り文字（アウトライン）', en:'outline / stroke text', hint:'ホバーしてみて', demo:'<div class="t-outline">OUTLINE</div>', tags:['text-stroke'],
        desc:'中を透明にして輪郭線だけ表示。大きな英字の背景装飾に。ホバーで塗りつぶすと面白い。', prompt:'セクションの背景に、輪郭線だけの巨大な英字「WORKS」を薄く配置して（-webkit-text-stroke）。',
        code:'.outline { color: transparent; -webkit-text-stroke: 1.5px #6d4cff; }' },
      { name:'立体文字（ロングシャドウ）', en:'3D / long shadow text', demo:'<div class="t-3d">3D TEXT</div>', tags:['text-shadow'],
        desc:'text-shadowを1pxずつずらして何枚も重ね、厚みのある立体文字にする。ポップ・レトロな見出しに。', prompt:'タイトルを、右下方向に6段の影を重ねた立体的なポップ文字にして。',
        code:'.t3d { color:#fff; text-shadow: 1px 1px 0 #5a3be0, 2px 2px 0 #5a3be0, 3px 3px 0 #5a3be0,\n  4px 4px 0 #5a3be0, 5px 5px 0 #5a3be0, 6px 6px 0 #5a3be0, 7px 7px 12px rgba(0,0,0,.35); }' },
      { name:'模様で塗った文字', en:'pattern-filled text', demo:'<div class="t-fill">POP</div>', tags:['background-clip'],
        desc:'グラデーションだけでなく、ストライプや画像・動画でも文字を塗れる。', prompt:'大見出しの文字を、斜めストライプ柄で塗りつぶして、柄がゆっくり流れるようにして。',
        code:'.fill { background: repeating-linear-gradient(45deg, #6d4cff 0 10px, #ff6b9a 10px 20px);\n  -webkit-background-clip:text; background-clip:text; color:transparent; }' },
    ]},
    { title:'日本語ならではの組版', note:'日本語サイトの品質を一段上げる、意外と知られていないCSS。', items:[
      { name:'縦書き', en:'writing-mode: vertical-rl', demo:'<div class="t-vert">令和<span class="tcy">8</span>年、<br>春の訪れを<br>お知らせします。</div>', tags:['和風','縦中横'],
        desc:'<code>writing-mode: vertical-rl</code>で縦書きに。縦の中の数字は <code>text-combine-upright</code>（縦中横）で横向きにまとめる。和風サイト、小説、お品書きに。', prompt:'お知らせ文を縦書き（右から左）にして、文中の2桁の数字は縦中横で横向きに表示して。フォントは明朝体で。',
        code:'.tategaki { writing-mode: vertical-rl; font-family: "Shippori Mincho", serif; }\n.tcy { text-combine-upright: all; } /* 縦中横 */' },
      { name:'見出しの改行をきれいに', en:'text-wrap: balance / auto-phrase', demo:'<div class="t-balance"><div><small>通常</small>バイブコーディングで誰でもアプリを作れる時代へ</div><div class="b"><small>balance + auto-phrase</small>バイブコーディングで誰でもアプリを作れる時代へ</div></div>', tags:['日本語の改行','Chrome'],
        desc:'<code>text-wrap: balance</code> で各行の長さを揃え、<code>word-break: auto-phrase</code>（Chrome 119+）で<b>文節の途中で改行しない</b>ようにする。「ア／プリ」のような変な改行を防げる。BudouXライブラリでも可。', prompt:'見出しが変なところで改行されないように、text-wrap: balance と word-break: auto-phrase を指定して。未対応ブラウザ用にBudouXも検討して。',
        code:'h1, h2 { text-wrap: balance; word-break: auto-phrase; }\np { text-wrap: pretty; } /* 最終行が1文字だけになるのを防ぐ */' },
      { name:'ルビ（ふりがな）', en:'<ruby>', demo:'<div style="font-size:24px;font-weight:700"><ruby>薔薇<rt>ばら</rt></ruby>と<ruby>檸檬<rt>レモン</rt></ruby></div>', tags:['HTML'],
        desc:'漢字の上にふりがなを付ける。HTMLの<code>&lt;ruby&gt;</code>タグで、CSSなしで使える。子ども向け・学習・難読漢字に。', prompt:'難しい漢字には<ruby>タグでふりがなを付けて。',
        code:'<ruby>薔薇<rt>ばら</rt></ruby>' },
    ]},
  ]
});

/* ---------- 背景エフェクト ---------- */
function particles(el){
  const { ctx, w, h } = VD.canvas(el);
  const N = Math.round(w * h / 2600);
  const ps = Array.from({ length:N }, () => ({ x:Math.random() * w, y:Math.random() * h, vx:(Math.random() - .5) * 30, vy:(Math.random() - .5) * 30 }));
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#6d4cff';
  let mx = -999, my = -999;
  el.addEventListener('mousemove', (e) => { const r = el.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
  el.addEventListener('mouseleave', () => { mx = my = -999; });
  return VD.loop(el, (dt) => {
    ctx.fillStyle = '#0d1022'; ctx.fillRect(0, 0, w, h);
    ps.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; if (p.x < 0 || p.x > w) p.vx *= -1; if (p.y < 0 || p.y > h) p.vy *= -1; });
    const all = ps.concat([{ x:mx, y:my }]);
    for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++){
      const dx = all[i].x - all[j].x, dy = all[i].y - all[j].y, d = Math.hypot(dx, dy);
      if (d < 80){ ctx.strokeStyle = `rgba(140,160,255,${1 - d / 80})`; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(all[i].x, all[i].y); ctx.lineTo(all[j].x, all[j].y); ctx.stroke(); }
    }
    ctx.fillStyle = accent; ps.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, 7); ctx.fill(); });
  });
}
function starfield(el){
  const { ctx, w, h } = VD.canvas(el);
  const stars = Array.from({ length:140 }, () => ({ x:Math.random() * w, y:Math.random() * h, z:Math.random() * 1 + .2, t:Math.random() * 6 }));
  return VD.loop(el, (dt, t) => {
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#05051a'); g.addColorStop(1, '#1b1446'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    stars.forEach(s => { s.x -= s.z * 8 * dt; if (s.x < 0) s.x = w; const a = .5 + .5 * Math.sin(t * 2 + s.t); ctx.fillStyle = `rgba(255,255,255,${a * s.z})`; ctx.fillRect(s.x, s.y, s.z * 1.8, s.z * 1.8); });
  });
}
function matrix(el){
  const { ctx, w, h } = VD.canvas(el);
  const fs = 13, cols = Math.ceil(w / fs), ys = Array.from({ length:cols }, () => Math.random() * -h);
  const chars = 'アイウエオカキクケコサシスセソタチツテト0123456789ABCDEF';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
  let acc = 0;
  return VD.loop(el, (dt) => {
    acc += dt; if (acc < .05) return; acc = 0;
    ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.fillRect(0, 0, w, h);
    ctx.font = fs + 'px monospace';
    ys.forEach((y, i) => { ctx.fillStyle = Math.random() > .95 ? '#d7ffd9' : '#21e06a'; ctx.fillText(chars[Math.random() * chars.length | 0], i * fs, y); ys[i] = y > h + Math.random() * 400 ? 0 : y + fs; });
  });
}
function sprinkle(el, sel, n, fn){
  const host = el.querySelector(sel);
  for (let i = 0; i < n; i++){ const s = document.createElement('i'); fn(s, i); host.append(s); }
}
TABS.push({
  id:'bg', label:'背景エフェクト', icon:'▦',
  intro:'セクションやヒーローの背景に使う模様・グラデーション・動き。背景は<b>主役の文字より目立たない</b>ことが大事。動く背景は控えめな速度で、文字の下には半透明の板を敷くと読みやすさを保てます。',
  sections:[
    { title:'グラデーション', items:[
      { name:'メッシュグラデーション', en:'mesh gradient', stage:'free', demo:'<div class="bg-fill bg-mesh"></div>', tags:['radial-gradient重ね'],
        desc:'複数の<code>radial-gradient</code>を重ねて、絵の具を混ぜたような柔らかい背景を作る。今どきのSaaS・アプリLPの定番。', prompt:'ヒーローの背景を、ピンク・紫・ミント・ラベンダーのradial-gradientを4か所に重ねた柔らかいメッシュグラデーションにして。',
        code:'.bg { background:\n  radial-gradient(at 20% 20%, #ff9a9e 0, transparent 50%),\n  radial-gradient(at 80% 10%, #a18cd1 0, transparent 50%),\n  radial-gradient(at 70% 80%, #84fab0 0, transparent 50%),\n  radial-gradient(at 10% 90%, #fbc2eb 0, transparent 50%), #fdfbfb; }' },
      { name:'動くグラデーション', en:'animated gradient', stage:'free', demo:'<div class="bg-fill bg-animgrad" style="display:grid;place-items:center"><span class="bg-label">Animated Gradient</span></div>', tags:['background-position'],
        desc:'大きなグラデーションの位置をゆっくり動かして、色が移り変わる背景にする。', prompt:'背景を4色（オレンジ・ピンク・青・緑）の斜めグラデーションにして、15秒周期でゆっくり色が流れるように動かして。',
        code:'.bg { background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);\n  background-size: 400% 400%; animation: move 15s ease infinite; }\n@keyframes move { 50% { background-position: 100% 50%; } }' },
      { name:'オーロラ（ぼかした光）', en:'aurora blobs', stage:'free', demo:'<div class="bg-fill bg-aurora"><i></i><i></i><i></i></div>', tags:['blur','blend'],
        desc:'大きくぼかした色の円を、ゆっくり漂わせて重ねる。AIプロダクトのLPに多い。', prompt:'暗い背景の上に、緑・青・紫の大きな円をblur(40px)でぼかして配置し、それぞれ違う速度でゆっくり漂わせてオーロラのようにして。',
        code:'.blob { position:absolute; width:60%; height:80%; border-radius:50%; filter: blur(40px);\n  mix-blend-mode: screen; animation: drift 10s ease-in-out infinite alternate; }' },
    ]},
    { title:'パターン・質感', items:[
      { name:'方眼（グリッド）', en:'grid pattern', stage:'free', demo:'<div class="bg-fill bg-grid bg-grid-fade"></div>', tags:['CSSのみ','技術系'],
        desc:'2本のlinear-gradientで方眼紙を作る。中央以外をマスクでフェードさせると今風。', prompt:'セクション背景に22px間隔の薄い方眼線を引いて、中央から外側に向かってフェードアウトさせて（mask-imageのradial-gradient）。',
        code:'.grid { background-image:\n  linear-gradient(#6d4cff33 1px, transparent 1px),\n  linear-gradient(90deg, #6d4cff33 1px, transparent 1px);\n  background-size: 22px 22px;\n  mask-image: radial-gradient(ellipse at center, #000 30%, transparent 75%); }' },
      { name:'ドット', en:'dot pattern', stage:'free', demo:'<div class="bg-fill bg-dots"></div>', tags:['CSSのみ'],
        desc:'radial-gradientで水玉模様。控えめな装飾に。', prompt:'背景に18px間隔の小さなドット模様を敷いて。', code:'.dots { background-image: radial-gradient(#6d4cff88 1.4px, transparent 1.6px); background-size: 18px 18px; }' },
      { name:'ストライプ', en:'stripes', stage:'free', demo:'<div class="bg-fill bg-stripes"></div>', tags:['repeating-linear-gradient'],
        desc:'斜めのしま模様。動かすと「処理中」や「工事中」の表現にもなる。', prompt:'プログレスバーの中を斜めストライプにして、右に流れ続けるようにして。', code:'.stripes { background: repeating-linear-gradient(45deg, #6d4cff 0 14px, #9f8bff 14px 28px); }' },
      { name:'市松模様', en:'checkerboard', stage:'free', demo:'<div class="bg-fill bg-check"></div>', tags:['conic-gradient'],
        desc:'conic-gradient1行で作れる市松模様。透明部分の表示やレトロ・ポップな装飾に。', prompt:'背景を紫と黄色の市松模様にして（conic-gradientで）。', code:'.check { background: conic-gradient(#6d4cff 25%, #ffd166 0 50%, #6d4cff 0 75%, #ffd166 0) 0 0/36px 36px; }' },
      { name:'ノイズ（粒子感）', en:'grain / noise texture', stage:'free', demo:'<div class="bg-fill bg-noise" style="display:grid;place-items:center"><span class="bg-label">Grainy</span></div>', tags:['SVG feTurbulence'],
        desc:'フィルムのようなざらつきを重ねると、のっぺりしたグラデーションに<b>質感と高級感</b>が出る。SVGのfeTurbulenceを画像として使う。', prompt:'グラデーション背景の上に、SVGのfeTurbulenceで作ったノイズを mix-blend-mode: overlay で薄く重ねて、フィルムのような粒子感を出して。',
        code:".grain::after { content:\"\"; position:absolute; inset:0; opacity:.4; mix-blend-mode:overlay;\n  background-image: url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\"); }" },
      { name:'ビネット（周辺減光）', en:'vignette', stage:'free', demo:'<div class="bg-fill bg-vignette"></div>', tags:['写真的'],
        desc:'四隅を暗くして中央に視線を集める。写真の上に文字を乗せるときにも読みやすくなる。', prompt:'ヒーロー画像の四隅を暗くするビネット効果を付けて、中央の文字に視線が集まるようにして。',
        code:'.hero::after { content:""; position:absolute; inset:0;\n  background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,.65) 100%); }' },
    ]},
    { title:'動く背景', items:[
      { name:'パーティクル（つながる点）', en:'particle network', stage:'free', h:190, hint:'カーソルにも反応', tags:['Canvas','tsParticles'],
        init:(el) => particles(el),
        desc:'たくさんの点が漂い、近い点同士が線でつながる。テック・AI・ネットワーク系の定番。tsParticlesを使えば設定だけで作れる。', prompt:'ヒーローの背景にCanvasでパーティクルを描いて。60個の点がゆっくり漂い、80px以内の点同士を薄い線でつなぎ、マウスカーソルにも線がつながるようにして。',
        code:"// 毎フレーム：点を動かす → 近い点同士に線を引く\nfor (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {\n  const d = Math.hypot(ps[i].x - ps[j].x, ps[i].y - ps[j].y);\n  if (d < 80) { ctx.strokeStyle = `rgba(140,160,255,${1 - d/80})`; /* moveTo/lineTo/stroke */ }\n}" },
      { name:'星空', en:'starfield / twinkle', stage:'free', h:190, tags:['Canvas'],
        init:(el) => starfield(el),
        desc:'星がまたたきながらゆっくり流れる夜空。宇宙・夢・夜のサービスに。', prompt:'背景をCanvasで描く星空にして。140個の星がそれぞれ違う周期でまたたき、奥行きに応じた速さで左へゆっくり流れるようにして。',
        code:"stars.forEach(s => {\n  s.x -= s.z * 8 * dt; if (s.x < 0) s.x = w;          // 奥の星ほど遅い\n  const a = .5 + .5 * Math.sin(t * 2 + s.offset);    // またたき\n  ctx.fillStyle = `rgba(255,255,255,${a * s.z})`; ctx.fillRect(s.x, s.y, 2, 2);\n});" },
      { name:'マトリックス風', en:'matrix digital rain', stage:'free', h:190, tags:['Canvas','ハッカー'],
        init:(el) => matrix(el),
        desc:'緑のカタカナや数字が縦に降り注ぐ、映画マトリックス風の背景。', prompt:'背景に映画マトリックスのような、緑のカタカナと数字が縦に降り注ぐCanvasアニメーションを入れて。',
        code:"ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.fillRect(0,0,w,h); // 前フレームを薄く消して残像を作る\nys.forEach((y, i) => { ctx.fillText(randomChar(), i * fs, y); ys[i] = y > h ? 0 : y + fs; });" },
      { name:'波', en:'animated waves', stage:'free', demo:`<div class="bg-fill bg-waves"><svg class="w2" viewBox="0 0 1200 120" preserveAspectRatio="none"><path d="M0 60 Q150 0 300 60 T600 60 T900 60 T1200 60 V120 H0Z" fill="#4fb3ff"/></svg><svg class="w1" viewBox="0 0 1200 120" preserveAspectRatio="none"><path d="M0 70 Q150 20 300 70 T600 70 T900 70 T1200 70 V120 H0Z" fill="#1d8fe0"/></svg></div>`, tags:['SVG'],
        desc:'横に長いSVGの波を2枚重ね、別の速さで横に流す。海・水・リラックス系、セクションの区切りに。', prompt:'セクションの下端に、SVGの波を2層重ねて、それぞれ違う速さで横に流れ続けるアニメーションを入れて。',
        code:'.wave { width:200%; animation: waveX 7s linear infinite; }\n@keyframes waveX { to { transform: translateX(-50%); } }\n/* SVGのパスは左右半分が同じ形になるよう繰り返して描く */' },
      { name:'ブロブ（アメーバ）', en:'blob', stage:'free', demo:'<div class="bg-fill bg-blob"><i></i></div>', tags:['border-radius'],
        desc:'形を変えながら浮遊するグラデーションの塊。親しみやすいスタートアップのヒーローに。', prompt:'背景に、形を変えながらふわふわ浮遊するピンク〜オレンジのブロブ（アメーバ形）を配置して。', code:'.blob { animation: morph 7s ease-in-out infinite, float 5s ease-in-out infinite; }' },
      { name:'桜が舞う', en:'falling petals / snow', stage:'free', tags:['季節演出','JS生成'],
        demo:'<div class="bg-fill bg-sakura"></div>',
        init:(el) => sprinkle(el, '.bg-sakura', 18, (s) => { const d = 4 + Math.random() * 5; s.style.left = (Math.random() * 100 - 10) + '%'; s.style.animationDuration = d + 's'; s.style.animationDelay = (-Math.random() * d) + 's'; const z = .6 + Math.random() * .8; s.style.width = 12 * z + 'px'; s.style.height = 10 * z + 'px'; }),
        desc:'花びらや雪が回転しながら舞い落ちる。季節のキャンペーンや和風サイトに。ランダムな位置・速さ・大きさで生成するのが自然に見せるコツ。', prompt:'背景に桜の花びらが回転しながらひらひら舞い落ちる演出を入れて。位置・落下速度・大きさ・開始タイミングはランダムにして、20枚程度に抑えて。',
        code:"for (let i = 0; i < 20; i++) {\n  const p = document.createElement('i');\n  const d = 4 + Math.random() * 5;\n  p.style.left = Math.random() * 100 + '%';\n  p.style.animationDuration = d + 's';\n  p.style.animationDelay = -Math.random() * d + 's'; // 最初から舞っているように\n  layer.append(p);\n}" },
      { name:'ボケ（玉ボケ）', en:'bokeh', stage:'free', tags:['夜景','きらめき'],
        demo:'<div class="bg-fill bg-bokeh"></div>',
        init:(el) => sprinkle(el, '.bg-bokeh', 16, (s) => { const z = 20 + Math.random() * 60; const cs = ['#ffd166','#ff6b9a','#6d4cff','#4fd1c5']; s.style.cssText = `width:${z}px;height:${z}px;left:${Math.random() * 100}%;top:${Math.random() * 100}%;background:${cs[Math.random() * 4 | 0]};animation-duration:${3 + Math.random() * 4}s;animation-delay:${-Math.random() * 4}s`; }),
        desc:'ピントの外れた光の玉。夜景・クリスマス・パーティー・ジュエリーの華やかさに。', prompt:'暗い背景に、ピンボケした色とりどりの光の玉（ボケ）を散らして、ゆっくり上下に漂わせて。', code:'.bokeh { border-radius:50%; filter: blur(3px); opacity:.5; animation: float 5s ease-in-out infinite; }' },
      { name:'シンセウェイブのグリッド', en:'retro grid floor', stage:'free', demo:'<div class="bg-fill bg-synth"><b></b><i></i></div>', tags:['80年代','perspective'],
        desc:'奥へ流れていくネオンの格子の地面と夕日。レトロゲーム・音楽サイトに。', prompt:'80年代シンセウェイブ風に、奥へ向かって流れ続けるピンクのネオングリッドの地面と、グラデーションの夕日を背景に作って。',
        code:'.floor { transform: perspective(200px) rotateX(60deg); transform-origin: bottom;\n  background: linear-gradient(transparent 90%, #ff2bd6 90%) 0 0/100% 24px,\n              linear-gradient(90deg, transparent 95%, #ff2bd6 95%) 0 0/40px 100%;\n  animation: move 1s linear infinite; }\n@keyframes move { to { background-position: 0 24px, 0 0; } }' },
    ]},
  ]
});

/* ---------- ローディング・遷移 ---------- */
function cycle(el, fn, ms){ let alive = true, k = 0; (function go(){ if (!alive) return; fn(k++); setTimeout(go, ms); })(); return () => alive = false; }
TABS.push({
  id:'loading', label:'ローディング・遷移', icon:'◌',
  intro:'待ち時間や画面の切り替わりを気持ちよくする演出。<b>0.1秒未満なら何も出さない、1秒程度ならスピナー、それ以上なら進捗やスケルトン</b>が目安です。',
  sections:[
    { title:'ローディング表示', items:[
      { name:'スピナー', en:'spinner', demo:'<div class="l-spin"></div>', tags:['定番'],
        desc:'くるくる回る輪。どれくらい待つか分からないときの基本。', prompt:'送信中はボタンの中に小さな回転スピナーを表示して、二重送信できないようにボタンを無効化して。',
        code:'.spinner { width:44px; height:44px; border-radius:50%; border:4px solid #6d4cff33;\n  border-top-color:#6d4cff; animation: spin .9s linear infinite; }' },
      { name:'ドット', en:'bouncing dots', demo:'<div class="l-dots"><i></i><i></i><i></i></div>', tags:['チャット入力中'],
        desc:'3つの点が順番に大きくなる。チャットの「相手が入力中…」やAIの応答待ちに。', prompt:'AIの返答を待っている間、チャット吹き出しの中に3つの点が順番に弾む「入力中」アニメーションを出して。', code:'.dot { animation: dot 1.2s infinite; }\n.dot:nth-child(2) { animation-delay: .15s; } .dot:nth-child(3) { animation-delay: .3s; }' },
      { name:'不定のプログレスバー', en:'indeterminate progress bar', demo:'<div class="l-bar"></div>', tags:['ページ上部'],
        desc:'終わりが分からない処理を、行ったり来たりするバーで表現。ページ遷移時の上部バー（NProgress風）にも。', prompt:'ページ上部に、読み込み中は細いバーが左から右へ流れ続けるインジケーターを表示して。', code:'.bar::after { content:""; position:absolute; width:40%; animation: indet 1.4s ease-in-out infinite; }\n@keyframes indet { from { left:-40%; } to { left:100%; } }' },
      { name:'円形プログレス', en:'circular progress ring', demo:'<svg class="l-ring" width="90" height="90" viewBox="0 0 90 90"><circle class="bg" cx="45" cy="45" r="36"/><circle class="fg" cx="45" cy="45" r="36"/></svg>', tags:['SVG','進捗%'],
        desc:'円周の線が進捗に合わせて伸びる。アップロード、タイマー、目標達成率に。円周＝2πr をdasharrayに使う。', prompt:'アップロードの進捗を、SVGの円がぐるっと伸びていく円形プログレスで表示して。中央にパーセントの数字も出して。',
        code:'/* 円周 = 2 × π × 36 ≈ 226 */\ncircle.fg { stroke-dasharray: 226; stroke-dashoffset: calc(226 * (1 - var(--p))); transform: rotate(-90deg); transform-origin:center; }' },
      { name:'パーセント表示', en:'progress with percentage', demo:'<div style="width:72%"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px"><span>アップロード中</span><b class="pc">0%</b></div><div style="height:8px;border-radius:4px;background:color-mix(in srgb, var(--accent) 18%, transparent);overflow:hidden"><div class="pb" style="height:100%;width:0;background:var(--accent);border-radius:4px;transition:width .2s"></div></div></div>', tags:['確定的'],
        init:(el) => { const pc = el.querySelector('.pc'), pb = el.querySelector('.pb'); let v = 0; return cycle(el, () => { v = v >= 100 ? 0 : Math.min(100, v + Math.random() * 12); pc.textContent = Math.round(v) + '%'; pb.style.width = v + '%'; }, 260); },
        desc:'進み具合が分かる処理は、数字とバーで残り時間をイメージさせると体感の待ち時間が短くなる。', prompt:'ファイルアップロード時に、進捗率（%）の数字と横棒のプログレスバーを表示して。XMLHttpRequestのupload.onprogressで実際の進捗を反映して。', code:"xhr.upload.onprogress = e => { const p = e.loaded / e.total * 100; bar.style.width = p + '%'; label.textContent = Math.round(p) + '%'; };" },
      { name:'スケルトンスクリーン', en:'skeleton screen', demo:'<div class="l-skel"><i></i><div><b></b><b></b><b></b></div></div>', tags:['体感速度UP','おすすめ'],
        desc:'中身の形をした灰色のブロックに光が流れる。<b>レイアウトのガタつきを防ぎ、体感速度が上がる</b>ので、一覧やカードの読み込みに最適。', prompt:'記事一覧を読み込んでいる間、カードの形をしたグレーのスケルトンを表示して、左から右へ光が流れるシマー効果を付けて。',
        code:'.skeleton { background: linear-gradient(90deg, #eee 0%, #f8f8f8 50%, #eee 100%);\n  background-size: 200% 100%; animation: shimmer 1.4s linear infinite; border-radius:8px; }\n@keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }' },
      { name:'パルスリング', en:'pulse ring', demo:'<div class="l-pulse"></div>', tags:['検索中','接続中'],
        desc:'中心から輪が次々に広がる。位置情報の取得中、Bluetooth接続中、検索中などの「探している」表現。', prompt:'近くの店舗を検索中は、地図の現在地から輪が2重に広がり続けるパルスアニメーションを出して。', code:'.pulse::before, .pulse::after { content:""; position:absolute; inset:0; border-radius:50%; border:2px solid; animation: ring 2s ease-out infinite; }\n.pulse::after { animation-delay: 1s; }' },
      { name:'イコライザー', en:'equalizer bars', demo:'<div class="l-eq"><i></i><i></i><i></i><i></i><i></i></div>', tags:['音楽・再生中'],
        desc:'棒が上下に伸び縮み。再生中の曲、音声入力中、ポッドキャストに。', prompt:'再生中の曲の横に、5本の棒がランダムに伸び縮みするイコライザーアニメーションを付けて。', code:'.bar { transform-origin: bottom; animation: eq 1s ease-in-out infinite; }\n@keyframes eq { 50% { transform: scaleY(1); } 0%,100% { transform: scaleY(.25); } }' },
      { name:'グリッド点滅', en:'grid loader', demo:'<div class="l-grid9">' + Array.from({length:9}, (_, i) => `<i style="animation-delay:${[0.2,0.3,0.4,0.1,0.2,0.3,0,0.1,0.2][i]}s"></i>`).join('') + '</div>', tags:['個性的'],
        desc:'9つの四角が斜めの波のように縮む。', prompt:'3×3の正方形が、左下から右上へ斜めに波打つように縮んでは戻るローディングを作って。', code:'.cell { animation: g 1.3s ease-in-out infinite; }\n@keyframes g { 35% { transform: scale(0); } }' },
      { name:'ダブルリング', en:'dual ring', demo:'<div class="l-dual"></div>', tags:['2色'],
        desc:'上下に2色の弧がある輪が回る。ブランドカラー2色を使いたいときに。', prompt:'紫とピンクの2色の弧が回転するローディングを作って。', code:'.dual { border:4px solid transparent; border-top-color:#6d4cff; border-bottom-color:#ff6b9a; border-radius:50%; animation: spin 1.1s infinite; }' },
      { name:'「読み込み中…」の点', en:'animated ellipsis', demo:'<div style="font-weight:700;font-size:18px"><span class="l-text">読み込み中</span></div>', tags:['テキスト'],
        desc:'「…」の点が1つずつ増える。シンプルで場所を取らない。', prompt:'「読み込み中」の後ろの「...」が1つずつ増えて戻るアニメーションにして。', code:'.loading::after { content:""; animation: dots 1.5s steps(4) infinite; }\n@keyframes dots { 25% { content:"."; } 50% { content:".."; } 75% { content:"..."; } }' },
      { name:'完了チェックマーク', en:'success checkmark', demo:'<svg class="l-check" width="80" height="80" viewBox="0 0 56 56"><circle cx="28" cy="28" r="25"/><path d="M16 29 l8 8 l16 -17"/></svg>', hint:'↻で再生', tags:['SVG','成功'],
        desc:'円が描かれた後にチェックが描かれる。送信完了・決済完了など「終わった」ことを気持ちよく伝える。', prompt:'フォーム送信が成功したら、緑の円とチェックマークが順番に描かれるSVGアニメーションを表示して。',
        code:'circle { stroke-dasharray:166; stroke-dashoffset:166; animation: stroke .6s forwards; }\npath   { stroke-dasharray:48;  stroke-dashoffset:48;  animation: stroke .35s .6s forwards; }\n@keyframes stroke { to { stroke-dashoffset: 0; } }' },
    ]},
    { title:'画面遷移（トランジション）', note:'ページや画面の切り替わり方。React/Vueではルーター遷移時、静的サイトでは Barba.js や View Transitions API で実装します。', items:[
      { name:'フェード遷移', en:'fade transition', stage:'free', tags:['控えめ'],
        demo:'<div class="pt-stage"><div class="pt-page" style="background:#6d4cff">ページA</div><div class="pt-page" style="background:#ff6b9a;opacity:0;transition:opacity .5s">ページB</div></div>',
        init:(el) => { const b = el.querySelectorAll('.pt-page')[1]; return cycle(el, (k) => b.style.opacity = k % 2 ? '1' : '0', 1600); },
        desc:'前の画面が消え、次の画面が現れる。最も無難で、どんなサイトにも合う。', prompt:'ページを切り替えるとき、0.3秒でフェードアウト→フェードインするトランジションを付けて。', code:'.page-enter { opacity:0; } .page-enter-active { opacity:1; transition: opacity .3s; }' },
      { name:'スライド遷移', en:'slide transition', stage:'free', tags:['アプリ風'],
        demo:'<div class="pt-stage"><div class="pt-page" style="background:#6d4cff;transition:transform .5s cubic-bezier(.65,0,.35,1)">一覧</div><div class="pt-page" style="background:#22c55e;transform:translateX(100%);transition:transform .5s cubic-bezier(.65,0,.35,1)">詳細</div></div>',
        init:(el) => { const [a, b] = el.querySelectorAll('.pt-page'); return cycle(el, (k) => { const on = k % 2; a.style.transform = on ? 'translateX(-30%)' : 'none'; b.style.transform = on ? 'none' : 'translateX(100%)'; }, 1600); },
        desc:'次の画面が右から押し出すように入ってくる。スマホアプリの「詳細へ進む」と同じ動きで、階層が深くなったことが伝わる。', prompt:'一覧から詳細ページに進むときは右からスライドイン、戻るときは左へスライドアウトするトランジションにして（スマホアプリ風）。', code:'.next  { transform: translateX(100%); transition: transform .5s cubic-bezier(.65,0,.35,1); }\n.next.active { transform: none; }' },
      { name:'カーテン（ワイプ）遷移', en:'curtain / wipe', stage:'free', tags:['インパクト'],
        demo:'<div class="pt-stage"><div class="pt-page" style="background:#6d4cff">HOME</div><div class="pt-curtain"></div></div>',
        init:(el) => { const p = el.querySelector('.pt-page'), c = el.querySelector('.pt-curtain'); const pages = [['HOME', '#6d4cff'], ['WORKS', '#f97316'], ['ABOUT', '#06b6d4']]; c.style.transition = 'transform .45s cubic-bezier(.77,0,.18,1)'; return cycle(el, (k) => { c.style.transformOrigin = 'bottom'; c.style.transform = 'scaleY(1)'; setTimeout(() => { const pg = pages[(k + 1) % 3]; p.textContent = pg[0]; p.style.background = pg[1]; c.style.transformOrigin = 'top'; c.style.transform = 'scaleY(0)'; }, 500); }, 1800); },
        desc:'幕が下から上がって画面を覆い、中身が入れ替わってから幕が上に抜ける。ポートフォリオやブランドサイトで印象的。', prompt:'ページ遷移時に、黒い幕が下から上へ画面を覆い、次のページに切り替わったら幕が上へ抜けていくカーテントランジションにして（Barba.js＋GSAP）。', code:'/* 1. 幕を scaleY(0→1)（origin:bottom）\n   2. 中身を差し替え\n   3. 幕を scaleY(1→0)（origin:top） */' },
      { name:'View Transitions API', en:'view transitions', stage:'free', tags:['新しいAPI','形が変形'],
        demo:'<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px"><div class="vt-box"><div class="vt-item" style="view-transition-name:vt-a">A</div><div class="vt-item" style="view-transition-name:vt-b;background:#ff6b9a">B</div><div class="vt-item" style="view-transition-name:vt-c;background:#ffb703">C</div></div><button class="wd-btn" style="padding:6px 14px;font-size:12px">切り替える</button></div>',
        init:(el) => { const box = el.querySelector('.vt-box'); el.querySelector('button').addEventListener('click', () => { const fn = () => { box.classList.toggle('big'); box.append(box.firstElementChild); }; if (document.startViewTransition) document.startViewTransition(fn); else fn(); }); },
        desc:'DOMを書き換える前後の状態をブラウザが自動で補間してくれる。<code>view-transition-name</code>を付けた要素は、<b>サムネイルから詳細画像へ形が変形</b>するような遷移も簡単にできる（Chrome/Edge/Safari 18+）。', prompt:'一覧のサムネイルをクリックしたら、その画像が拡大・移動して詳細ページのメイン画像に変形するように、View Transitions APIで実装して。未対応ブラウザでは普通に切り替えて。',
        code:"function update(){ /* DOMを書き換える */ }\nif (document.startViewTransition) document.startViewTransition(update);\nelse update();\n/* CSS: .thumb { view-transition-name: hero; } 遷移先の大きな画像にも同じ名前を付ける */" },
    ]},
  ]
});
})();
