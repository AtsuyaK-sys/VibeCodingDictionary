/* HTML・CSSの基本辞典 — B: Flexbox / Grid / 位置と重なり / レスポンシブと文字・色 */
(function(){
const { $, $$, esc, seg } = KIT;
const { S, C, T, L, verdict, page, sliders } = HCH;
// セレクトボックスの組（[プロパティ, 選択肢, 初期値]）
function selects(box, defs, on){ const st = {}; box.innerHTML = defs.map(([k, opts, v]) => (st[k] = v, `<b>${k}</b><select data-k="${k}" aria-label="${k}">${opts.map(o => `<option ${o === v ? 'selected' : ''}>${o}</option>`).join('')}</select>`)).join('');
  $$(box, 'select').forEach(s => s.onchange = () => { st[s.dataset.k] = s.value; on(st); }); return st; }

/* ================= 5. Flexbox ================= */
const FLEX = [['flex-direction', ['row', 'column', 'row-reverse'], 'row'], ['justify-content', ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'], 'flex-start'], ['align-items', ['stretch', 'flex-start', 'center', 'flex-end'], 'stretch'], ['flex-wrap', ['nowrap', 'wrap'], 'nowrap']];
TABS.push({ id:'flex', label:'Flexbox', icon:'↔',
  intro:'<b>Flexbox</b> は、要素を<b>横一列（または縦一列）に並べる</b>ための仕組みです。メニュー・ボタンの並び・カードの横並び・中央寄せなど、レイアウトの大半はこれで作れます。親に <code>display: flex;</code> を書くと、中の子が並びます。',
  sections:[
    C('触って理解する', [
      { name:'Flexbox の遊び場', en:'Flexbox playground', h:500, wide:true, tags:['体験','最重要'],
        demo:'<div class="kt"><div class="hc-split" style="flex:none"><div class="hc-pg sel"></div><div class="hc-pg"><b>gap</b><input type="range" class="gp" min="0" max="24" step="2" value="8" aria-label="gap"><b>子の数</b><input type="range" class="nm" min="1" max="9" value="4" aria-label="子の数"><b>1つ目を伸ばす</b><label style="font-size:11.5px"><input type="checkbox" class="gr"> flex: 1</label></div></div><div class="hc-area ar"></div><pre class="hc-code out" style="flex:none"></pre></div>',
        init:(el) => { const ar = $(el, '.ar');
          const draw = () => { const st = s, gap = +$(el, '.gp').value, n = +$(el, '.nm').value, gr = $(el, '.gr').checked;
            Object.assign(ar.style, { display:'flex', flexDirection:st['flex-direction'], justifyContent:st['justify-content'], alignItems:st['align-items'], flexWrap:st['flex-wrap'], gap:gap + 'px' });
            ar.innerHTML = Array.from({ length:n }, (_, i) => `<div class="hc-it" style="${i === 0 && gr ? 'flex:1;' : ''}${i % 3 === 1 ? 'min-height:44px;' : ''}">${i + 1}</div>`).join('');
            $(el, '.out').innerHTML = `.parent {\n  display: flex;\n${FLEX.map(([k]) => `  ${k}: <b>${st[k]}</b>;`).join('\n')}\n  gap: <b>${gap}px</b>;\n}${gr ? '\n.parent > :first-child { flex: 1; }  /* 残りの幅を全部使う */' : ''}`; };
          const s = selects($(el, '.sel'), FLEX, draw); $$(el, 'input').forEach(i => i.oninput = draw); draw(); },
        desc:'<code>justify-content</code> は<b>並ぶ向き</b>（横並びなら横）のそろえ方、<code>align-items</code> は<b>それと直角の向き</b>（横並びなら縦）のそろえ方です。2番目の子は背が高いので、align-items の違いが分かります。',
        prompt:'このメニュー（またはカードの並び）を Flexbox で作り直して。横に並べ、間隔は 16px、スマホ幅では折り返す（または縦に並べる）ようにして。中央寄せと、右端だけ寄せる場合の書き方も教えて。\n【HTML】' },
    ], null, true),
    S('よく使う Flexbox の型', [
      T('上下左右の中央寄せ', 'Center anything', '親に <code>display:flex; justify-content:center; align-items:center;</code>。昔は難しかった中央寄せが3行で書けます。', null, ['最重要'], { code:'.parent {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 200px;\n}' }),
      T('両端に寄せる', 'Space between', 'ロゴを左、メニューを右に置くヘッダーは <code>justify-content: space-between;</code>。'),
      T('1つだけ右に寄せる', 'margin-left: auto', '並びの中の1つに <code>margin-left: auto;</code> を付けると、それ以降が右端に寄ります。ヘッダーの「ログイン」ボタンなどに。'),
      T('折り返す', 'flex-wrap', '<code>flex-wrap: wrap;</code> で、入りきらない子が次の行に回ります。カードの並びをスマホでも崩さないために。'),
      T('flex: 1', 'Grow to fill', '子に <code>flex: 1;</code> を付けると、余った幅を分け合って伸びます。検索欄を横いっぱいにする、など。'),
      T('gap', 'gap', '子どうしの間隔。margin で1つずつ空けるより簡単で、端に余計な余白ができません。'),
      T('縦に並べる', 'Column', '<code>flex-direction: column;</code> で縦一列。カードの中で「ボタンだけ下にそろえる」ときは、中身を縦の flex にしてボタンに <code>margin-top: auto;</code>。'),
    ]),
  ]});

/* ================= 6. Grid ================= */
const COLS = [['repeat(3, 1fr)', '同じ幅で3列'], ['200px 1fr', '左は固定、右は残り全部（サイドバー）'], ['1fr 2fr 1fr', '真ん中を2倍'], ['repeat(auto-fill, minmax(90px, 1fr))', '入るだけ並べて、自動で折り返す（カード一覧の定番）']];
TABS.push({ id:'grid', label:'Grid', icon:'▦',
  intro:'<b>Grid</b> は、要素を<b>縦と横の格子（マス目）</b>に並べる仕組みです。カードの一覧、写真のギャラリー、ページ全体の区割りに向いています。<b>一方向に並べるなら Flexbox、マス目なら Grid</b>と覚えると選びやすくなります。',
  sections:[
    C('触って理解する', [
      { name:'Grid の遊び場', en:'Grid playground', h:500, wide:true, tags:['体験','最重要'],
        demo:'<div class="kt"><div class="sg"></div><div class="hc-pg"><b>gap</b><input type="range" class="gp" min="0" max="24" step="2" value="8" aria-label="gap"><b>子の数</b><input type="range" class="nm" min="2" max="12" value="7" aria-label="子の数"><b>1つ目</b><label style="font-size:11.5px"><input type="checkbox" class="sp"> 2列分にまたがる（grid-column: span 2）</label></div><div class="hc-area ar"></div><pre class="hc-code out" style="flex:none"></pre><div class="kt-note nt"></div></div>',
        init:(el) => { let c = 0; const ar = $(el, '.ar');
          const draw = () => { const gap = +$(el, '.gp').value, n = +$(el, '.nm').value, sp = $(el, '.sp').checked, [v, d] = COLS[c];
            Object.assign(ar.style, { display:'grid', gridTemplateColumns:v, gap:gap + 'px', alignContent:'start' });
            ar.innerHTML = Array.from({ length:n }, (_, i) => `<div class="hc-it" style="${i === 0 && sp ? 'grid-column:span 2;' : ''}">${i + 1}</div>`).join('');
            $(el, '.out').innerHTML = `.parent {\n  display: grid;\n  grid-template-columns: <b>${v}</b>;\n  gap: <b>${gap}px</b>;\n}${sp ? '\n.parent > :first-child { grid-column: span 2; }' : ''}`; $(el, '.nt').textContent = d + (c === 3 ? '。この見本の枠の幅を変える（画面の幅を変える）と、列の数が変わります。' : ''); };
          $(el, '.sg').append(seg(COLS.map(x => x[0].length > 18 ? 'auto-fill（自動）' : x[0]), (i) => { c = i; draw(); }, 0).el); $$(el, 'input').forEach(i => i.oninput = draw); },
        desc:'<code>fr</code> は「残りの幅を分ける割合」の単位です。<code>repeat(auto-fill, minmax(90px, 1fr))</code> は「最低 90px の列を、入るだけ並べる」で、<b>メディアクエリなしでレスポンシブ</b>なカード一覧が作れます。',
        prompt:'商品カードの一覧を CSS Grid で作って。カードは最低 220px、入るだけ横に並べて、画面が狭いと自動で列が減るようにして（repeat(auto-fill, minmax(...)) を使って）。カードの高さはそろえて。' },
    ], null, true),
    S('Grid の言葉と型', [
      T('fr', 'Fraction', '残りの幅を分ける割合。<code>1fr 2fr</code> は 1:2。', null, ['基本']),
      T('repeat()', 'repeat()', '<code>repeat(4, 1fr)</code> は <code>1fr 1fr 1fr 1fr</code> と同じ。'),
      T('minmax()', 'minmax()', '<code>minmax(200px, 1fr)</code> は「最低 200px、余裕があれば広がる」。'),
      T('auto-fill と auto-fit', 'auto-fill / auto-fit', 'どちらも入るだけ列を作る。子が少ないとき、auto-fill は空の列を残し、auto-fit は子を広げて埋めます。'),
      T('またがる（span）', 'Spanning', '<code>grid-column: span 2;</code> で2列分、<code>grid-row: span 2;</code> で2行分の大きさに。ベントーグリッド（大小のマス）の基本です。'),
      T('名前で区割り', 'grid-template-areas', 'ページの区画に名前を付けて、絵のように配置を書けます。ヘッダー・サイドバー・本文・フッターの配置に。', null, null, { code:'.page {\n  display: grid;\n  grid-template-columns: 200px 1fr;\n  grid-template-areas:\n    "head head"\n    "side main"\n    "foot foot";\n}\nheader { grid-area: head; }\naside  { grid-area: side; }\nmain   { grid-area: main; }\nfooter { grid-area: foot; }' }),
      T('Flexbox と Grid の使い分け', 'Flex or Grid?', '<b>一方向に並べる・中身の大きさに合わせる</b>なら Flexbox（メニュー・ボタンの並び）。<b>縦横のマス目にそろえる</b>なら Grid（カード一覧・ページの区割り）。組み合わせて使うのがふつうです。', null, ['最重要']),
    ]),
  ]});

/* ================= 7. 位置と重なり ================= */
const POS = [
  ['static', '初期値。ふつうの並び順のまま。top・left は効きません。'],
  ['relative', '<b>元の場所を基準に</b>ずらします。元の場所は空いたまま（ほかの要素は詰めてこない）。子の absolute の基準にするためにもよく使います。'],
  ['absolute', '<b>いちばん近い relative などの親</b>を基準に、好きな位置に置きます。元の場所からは抜けて、ほかの要素と重なります。バッジや閉じるボタンに。'],
  ['fixed', '<b>画面</b>を基準に固定。スクロールしても動きません（見本では、枠の中に閉じ込めて見せています）。右下のチャットボタンや固定ヘッダーに。'],
  ['sticky', 'ふだんはふつうの位置で、スクロールして<b>指定した位置（top: 0 など）に来たら貼り付く</b>。見出しや目次に。親より外には出ません。'],
];
TABS.push({ id:'position', label:'位置と重なり', icon:'📍',
  intro:'<code>position</code> は、要素を<b>ふつうの並び順から外して</b>、好きな位置に置くための指定です。固定ヘッダー、右上のバッジ、モーダルなどで使います。重なり順は <code>z-index</code> で決めます。',
  sections:[
    C('触って理解する', [
      { name:'position の5種類', en:'position', h:480, wide:true, tags:['体験','最重要'],
        demo:'<div class="kt"><div class="sg"></div><div class="hc-ctl sl"></div><div class="hc-pos"><div class="wrap"><div class="blk">ふつうの要素 A</div><div class="tg">動く要素</div><div class="blk">ふつうの要素 B（中でスクロールしてみてください）</div><div class="filler"></div></div></div><div class="kt-verdict note"></div><pre class="hc-code out" style="flex:none"></pre></div>',
        init:(el) => { let p = 1; const tg = $(el, '.tg');
          const draw = (st) => { const v = POS[p][0]; Object.assign(tg.style, { position:v, top:st.t + 'px', left:st.l + 'px' }); verdict($(el, '.note'), '', POS[p][1]);
            $(el, '.out').innerHTML = `.box {\n  position: <b>${v}</b>;\n  top: <b>${st.t}px</b>;\n  left: <b>${st.l}px</b>;\n}`; };
          const st = sliders($(el, '.sl'), [['t', 'top', 0, 80, 2, 10, 'px'], ['l', 'left', 0, 120, 2, 20, 'px']], (s) => draw(s));
          $(el, '.sg').append(seg(POS.map(x => x[0]), (i) => { p = i; draw(st); }, 1).el); },
        desc:'absolute の子は、<b>position が static 以外の、いちばん近い親</b>を基準にします。親に何も指定がないと、ページ全体が基準になって、思わぬ場所に飛んでいきます。「親に <code>position: relative</code>、子に <code>position: absolute</code>」がセットの定番です。',
        prompt:'カードの右上に「NEW」のバッジを重ねて表示したい。カードに position: relative、バッジに position: absolute を使って作って。スマホでもずれないようにして。' },
    ], null, true),
    S('位置と重なりの言葉', [
      T('relative ＋ absolute', 'Positioning context', '親に relative、子に absolute を付けて、親の中の好きな位置に子を置く定番の組み合わせ。', null, ['最重要'], { code:'.card { position: relative; }\n.badge {\n  position: absolute;\n  top: 8px;\n  right: 8px;\n}' }),
      T('z-index', 'z-index', '重なったときの順番。数字が大きいほど手前。<b>position が static 以外の要素</b>に効きます。'),
      T('重なりのグループ', 'Stacking context', 'z-index は「同じグループの中」での順番です。親に transform や opacity などがあると新しいグループができ、z-index: 9999 でも親の外には出られません。「z-index が効かない」の多くはこれ。', null, ['注意']),
      T('sticky が効かない', 'sticky not working', '親に <code>overflow: hidden</code> があると sticky は効きません。また、top などの値を指定しないと貼り付きません。'),
      T('固定ヘッダーと重なり', 'Fixed header offset', '固定ヘッダーの下に本文の先頭が隠れるので、本文に上の余白を付けます。ページ内リンクは <code>scroll-margin-top</code> で調整。'),
      T('inset', 'inset', '<code>inset: 0;</code> は <code>top:0; right:0; bottom:0; left:0;</code> の省略形。全面を覆う背景やモーダルに。'),
      T('transform で中央寄せ', 'Centering with transform', '<code>top:50%; left:50%; transform:translate(-50%, -50%);</code> で、absolute の要素を中央に置く昔からの定番。今は Flexbox や Grid の方が簡単です。'),
    ]),
  ]});

/* ================= 8. レスポンシブと文字・色 ================= */
const RCSS = 'body{margin:0;font-family:system-ui,"Noto Sans JP",sans-serif;color:#222}.top{background:#1971c2;color:#fff;padding:10px 14px;font-weight:800}.cards{display:grid;grid-template-columns:1fr;gap:10px;padding:12px}.card{background:#f1f3f5;border-radius:10px;padding:10px}.card b{display:block}.side{display:none}.lbl{position:fixed;right:6px;bottom:6px;background:#222;color:#fff;font:700 11px monospace;padding:2px 6px;border-radius:6px}.lbl::after{content:"スマホ（〜599px）"}@media (min-width:600px){.cards{grid-template-columns:repeat(2,1fr)}.lbl::after{content:"タブレット（600px〜）"}}@media (min-width:900px){.wrap{display:grid;grid-template-columns:180px 1fr}.side{display:block;padding:12px;background:#e7f5ff}.cards{grid-template-columns:repeat(3,1fr)}.lbl::after{content:"パソコン（900px〜）"}}';
const RHTML = '<div class="top">サンプル商店</div><div class="wrap"><aside class="side">サイドメニュー</aside><div class="cards">' + ['ジャム', 'パン', 'クッキー', 'ケーキ', 'マフィン', 'スコーン'].map(n => `<div class="card"><b>${n}</b>手作りの味</div>`).join('') + '</div></div><span class="lbl"></span>';
TABS.push({ id:'responsive', label:'レスポンシブ・文字・色', icon:'📱',
  intro:'同じページを、スマホ・タブレット・パソコンの<b>どの幅でも見やすく</b>するのがレスポンシブです。<b>メディアクエリ</b>で幅ごとに CSS を切り替えます。あわせて、文字の大きさと色の書き方の基本もまとめました。',
  sections:[
    C('触って理解する', [
      { name:'画面の幅で変わるレイアウト', en:'Media queries', h:500, wide:true, tags:['体験','最重要'],
        demo:'<div class="kt"><div class="hc-ctl sl"></div><div class="hc-rwrap"><iframe class="hc-rframe" sandbox="allow-same-origin" title="幅を変えた見本"></iframe></div><pre class="hc-code" style="flex:none">/* スマホを基本に書き、広い画面の指定を足す（モバイルファースト） */\n.cards { grid-template-columns: 1fr; }\n@media (min-width: <b>600px</b>) { .cards { grid-template-columns: repeat(2, 1fr); } }\n@media (min-width: <b>900px</b>) { .cards { grid-template-columns: repeat(3, 1fr); } }</pre></div>',
        init:(el) => { const f = $(el, 'iframe'); f.srcdoc = page(RHTML, RCSS).replace('body{margin:12px;', 'body{');
          sliders($(el, '.sl'), [['w', '見本の幅', 280, 1000, 10, 360, 'px']], (st) => { f.style.width = (st.w + 4) + 'px'; }); },  // 枠線（2px×2）の分を足して、中の幅＝表示の値にする
        desc:'枠の中は本物の Web ページなので、<b>本物のメディアクエリ</b>が働いています。幅を広げると、599px と 600px、899px と 900px の境目でレイアウトが切り替わります（右下の表示）。スマホの見た目を基本に書いて、広い画面の指定を足していく書き方を<b>モバイルファースト</b>と呼びます。',
        prompt:'このページをレスポンシブにして。スマホ（〜599px）は1列、タブレット（600px〜）は2列、パソコン（900px〜）は3列＋サイドバー。モバイルファーストで書いて、画像は横にはみ出さないようにして。\n【HTML】\n【CSS】' },
    ], null, true),
    S('レスポンシブの基本', [
      T('メディアクエリ', 'Media query', '<code>@media (min-width: 600px) { … }</code> の中に書いた CSS は、画面の幅が 600px 以上のときだけ効きます。', null, ['基本','最重要']),
      T('モバイルファースト', 'Mobile first', 'スマホの見た目を基本に書き、<code>min-width</code> で広い画面の指定を足す書き方。スマホでの見落としが減ります。'),
      T('ブレークポイント', 'Breakpoints', 'レイアウトを切り替える幅の境目。600px・900px のように、自分のデザインが崩れる所で決めます。'),
      T('画像をはみ出させない', 'Fluid images', '<code>img { max-width: 100%; height: auto; }</code> を書いておくと、画像が親の幅より大きくならず、縦横比も保たれます。', null, ['最重要']),
      T('開発者ツールでスマホ表示', 'Device mode', '開発者ツールのスマホのアイコン（デバイスモード）で、いろいろな画面幅を試せます。最後は実機でも確かめます。'),
      T('コンテナクエリ', 'Container queries', '画面ではなく<b>親の箱の幅</b>で切り替える新しい仕組み。部品をどこに置いても形を変えられます（<a href="web-design.html">Webデザイン辞典</a>）。'),
    ]),
    S('文字と色の書き方', [
      T('文字の大きさは rem', 'rem for font size', '<code>1rem</code> は基本の文字の大きさ（多くは 16px）。rem で書くと、利用者がブラウザの文字を大きくしたときにも一緒に大きくなります。', null, ['基本']),
      T('clamp() でなめらかに', 'clamp()', '<code>font-size: clamp(1.5rem, 4vw, 2.5rem);</code> は「最小 1.5rem、画面幅に合わせて、最大 2.5rem」。見出しの大きさを画面に合わせて変えられます。'),
      T('行間', 'line-height', '日本語の本文は <code>line-height: 1.7〜1.9</code> くらいが読みやすい。単位なしの数字で書くのが基本。'),
      T('フォントの指定', 'font-family', '<code>font-family: "Noto Sans JP", sans-serif;</code> のように、使いたい書体と、なかったときの代わり（sans-serif など）を並べます。'),
      T('色の書き方', 'Color formats', '<code>#1971c2</code>（16進数）、<code>rgb(25 113 194)</code>、<code>hsl(209 77% 43%)</code>（色相・彩度・明度）。HSL は「少し明るく」が数字で調整しやすい（<a href="color-typography.html">配色辞典</a>）。'),
      T('透明度', 'Transparency', '<code>rgb(0 0 0 / 0.5)</code> のように <code>/</code> のあとに透明度。要素ごと薄くするなら <code>opacity</code>。'),
      T('文字のコントラスト', 'Contrast', '薄いグレーの文字は読みにくい。文字と背景の明るさの差（コントラスト比 4.5:1 以上）を確かめます（<a href="accessibility.html#color">アクセシビリティ辞典</a>）。', null, ['注意']),
    ]),
  ]});
})();
