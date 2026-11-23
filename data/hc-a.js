/* HTML・CSSの基本辞典 — A: 部品 / しくみとライブエディタ / よく使うタグ / セレクタと優先順位 / ボックスモデル */
(function(){
const { $, $$, esc, seg } = KIT;
const S = (title, items, note) => ({ title, note, layout:'rows', items });
const C = (title, items, note, lg) => ({ title, note, layout:lg ? 'cards lg' : 'cards', items });
const T = (name, en, desc, prompt, tags, more) => Object.assign({ name, en, desc, prompt, tags }, more || {});
const L = (...a) => a.join('\n');
const verdict = (el, cls, html) => { el.classList.remove('ok', 'bad', 'warn'); if (cls) el.classList.add(cls); el.innerHTML = html; };
// 見本のページを iframe に表示（sandbox で中のスクリプトは動かさない）
const page = (html, css) => `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:12px;font-family:system-ui,"Noto Sans JP",sans-serif;color:#222}${css || ''}</style></head><body>${html}</body></html>`;
// 範囲スライダーの組（[key, ラベル, 最小, 最大, 刻み, 初期値, 単位]）
function sliders(box, defs, on){ const st = {}; box.innerHTML = defs.map(([k, l, a, b, s, v, u]) => (st[k] = v, `<b>${l}</b><input type="range" min="${a}" max="${b}" step="${s}" value="${v}" data-k="${k}" aria-label="${l}"><output data-o="${k}">${v}${u || ''}</output>`)).join('');
  $$(box, 'input').forEach(i => i.oninput = () => { st[i.dataset.k] = +i.value; const d = defs.find(x => x[0] === i.dataset.k); $(box, `[data-o="${i.dataset.k}"]`).textContent = i.value + (d[6] || ''); on(st); }); on(st); return st; }
window.HCH = { S, C, T, L, verdict, page, sliders };

/* ================= 1. しくみとライブエディタ ================= */
const PRESETS = [
  ['はじめてのページ', L('<h1>こんにちは！</h1>', '<p>これは <strong>はじめての</strong> Webページです。</p>', '<ul>', '  <li>HTML は中身と構造</li>', '  <li>CSS は見た目</li>', '</ul>', '<a href="#">リンク</a>'), L('h1 {', '  color: #1971c2;', '}', 'p {', '  line-height: 1.8;', '}')],
  ['カード', L('<div class="card">', '  <h2>手作りジャム</h2>', '  <p>旬のいちごで作りました。</p>', '  <button>カートに入れる</button>', '</div>'), L('.card {', '  max-width: 260px;', '  padding: 16px;', '  border-radius: 12px;', '  box-shadow: 0 4px 16px rgb(0 0 0 / .12);', '}', 'button {', '  background: #1971c2;', '  color: white;', '  border: 0;', '  padding: 8px 14px;', '  border-radius: 8px;', '}')],
  ['横に並べる', L('<nav class="menu">', '  <a href="#">ホーム</a>', '  <a href="#">商品</a>', '  <a href="#">お問い合わせ</a>', '</nav>'), L('.menu {', '  display: flex;', '  gap: 16px;', '  background: #f1f3f5;', '  padding: 12px;', '}', '.menu a {', '  color: #333;', '  text-decoration: none;', '}')],
];
const ROLES = [
  ['HTMLだけ', '', '<b>HTML</b> は「これは見出し」「これは段落」「これはボタン」という<b>中身と構造</b>。CSS がないと、ブラウザの標準の見た目（黒い文字・青い下線のリンク）になります。'],
  ['HTML＋CSS', '.hero{background:linear-gradient(135deg,#1971c2,#7048e8);color:#fff;padding:20px;border-radius:14px}.hero h1{margin:0 0 6px;font-size:22px}.hero p{margin:0 0 12px;opacity:.9}.hero button{background:#fff;color:#1971c2;border:0;border-radius:999px;padding:8px 16px;font-weight:700}nav{display:flex;gap:14px;margin-bottom:12px}nav a{color:#495057;text-decoration:none;font-weight:600}', '同じ HTML に <b>CSS</b> を足すと、色・大きさ・並び方が変わります。HTML を1文字も変えずに、見た目だけを作り変えられるのが CSS です。'],
];
const ROLE_HTML = '<nav><a href="#">ホーム</a><a href="#">商品</a><a href="#">会社</a></nav><section class="hero"><h1>サンプル商店</h1><p>旬の果物で作る、手作りジャムのお店です。</p><button>商品を見る</button></section>';
TABS.push({ id:'how', label:'しくみとエディタ', icon:'🧱',
  intro:'Webページは、<b>HTML（中身と構造）</b>と <b>CSS（見た目）</b>でできています。動きを付けるのが JavaScript です。AIが書いたコードを直すときも、「これは HTML の問題か、CSS の問題か」が分かると、頼み方がぐっと具体的になります。ここでは<b>書き換えると、すぐ右に結果が出る</b>エディタで試せます。デザインの型は <a href="web-design.html">Webデザイン辞典</a>、表示の崩れは <a href="errors.html#css">エラー辞典</a> へ。',
  sections:[
    C('触って理解する', [
      { name:'ライブエディタ（書き換えるとすぐ反映）', en:'Live editor', h:520, wide:true, tags:['体験','最重要'],
        demo:'<div class="kt"><div class="sg"></div><div class="hc-split"><div><span class="hc-lbl">HTML</span><textarea class="hc-ta h" spellcheck="false" aria-label="HTML"></textarea><span class="hc-lbl">CSS</span><textarea class="hc-ta c" spellcheck="false" aria-label="CSS"></textarea></div><div><span class="hc-lbl">結果</span><iframe class="hc-frame" sandbox="allow-same-origin" title="結果"></iframe></div></div></div>',
        init:(el) => { const h = $(el, '.h'), c = $(el, '.c'), f = $(el, 'iframe'); let tm = null;
          const run = () => { f.srcdoc = page(h.value, c.value); };
          [h, c].forEach(t => t.oninput = () => { clearTimeout(tm); tm = setTimeout(run, 250); });
          $(el, '.sg').append(seg(PRESETS.map(p => p[0]), (i) => { h.value = PRESETS[i][1]; c.value = PRESETS[i][2]; run(); }, 0).el);
          return () => clearTimeout(tm); },
        desc:'色の値（<code>#1971c2</code>）を変える、<code>gap</code> の数字を変える、タグを1つ足す……のように<b>1か所ずつ変えて結果を見る</b>のが、いちばん早い覚え方です。結果の表示は、スクリプトを動かさない安全な枠（sandbox）の中です。',
        prompt:'次の HTML と CSS が、それぞれ何をしているか1行ずつ説明して。そのあと、【変えたいこと：例 カードを横に3つ並べたい】ためには、どこをどう変えればよいかを教えて。\n【HTML】\n【CSS】' },
      { name:'HTML と CSS の役割', en:'Structure vs style', h:330, tags:['基本'],
        demo:'<div class="kt"><div class="sg"></div><iframe class="hc-frame" sandbox="allow-same-origin" title="見本"></iframe><div class="kt-verdict note"></div></div>',
        init:(el) => $(el, '.sg').append(seg(ROLES.map(r => r[0]), (i) => { $(el, 'iframe').srcdoc = page(ROLE_HTML, ROLES[i][1]); verdict($(el, '.note'), '', ROLES[i][2]); }, 0).el),
        desc:'AIに直してほしいとき、「見た目」なら CSS、「並ぶ順番や中身」なら HTML、「押したときの動き」なら JavaScript、と分けて伝えると、関係ない所まで書き換えられにくくなります。',
        prompt:null },
    ], null, true),
    S('HTML の言葉', [
      T('タグと要素', 'Tag / element', '<code>&lt;p&gt;こんにちは&lt;/p&gt;</code> のように、<b>開始タグ・中身・終了タグ</b>のまとまりが要素です。<code>&lt;img&gt;</code> や <code>&lt;br&gt;</code> のように終了タグのない要素もあります。', null, ['基本']),
      T('属性', 'Attribute', 'タグの中に書く追加の情報。<code>&lt;a href="…"&gt;</code> の href（行き先）、<code>&lt;img src="…" alt="…"&gt;</code> の src（画像の場所）と alt（代わりの文）など。'),
      T('入れ子（親と子）', 'Nesting', '要素の中に要素を入れられます。開いた順の逆に閉じる（<code>&lt;div&gt;&lt;p&gt;…&lt;/p&gt;&lt;/div&gt;</code>）。順番がずれると表示が崩れます。'),
      T('class と id', 'class / id', 'CSS や JavaScript から要素を選ぶための名前。<b>class は何度でも使える</b>、<b>id はページに1つだけ</b>。見た目のためには class を使うのが基本です。', null, ['最重要']),
      T('ページの基本の形', 'Document structure', '<code>&lt;!doctype html&gt;</code>、<code>&lt;html lang="ja"&gt;</code>、ページの情報を書く <code>&lt;head&gt;</code>、表示される中身の <code>&lt;body&gt;</code>。', null, null, { code:'<!doctype html>\n<html lang="ja">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>ページの名前</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>見出し</h1>\n  <script src="app.js"></script>\n</body>\n</html>' }),
      T('meta viewport', 'Viewport meta', '<code>&lt;meta name="viewport" content="width=device-width, initial-scale=1"&gt;</code> がないと、スマホでページが小さく縮んで表示されます。必ず入れます。', null, ['注意']),
      T('CSS のつなぎ方', 'Linking CSS', '<code>&lt;head&gt;</code> の中に <code>&lt;link rel="stylesheet" href="style.css"&gt;</code>。小さな見本なら <code>&lt;style&gt;</code> の中に直接書くこともできます。'),
      T('コメント', 'Comments', 'HTML は <code>&lt;!-- メモ --&gt;</code>、CSS は <code>/* メモ */</code>。表示されないメモです。'),
      T('特別な文字の書き方', 'Character references', '<code>&lt;</code> や <code>&amp;</code> をそのまま表示したいときは <code>&amp;lt;</code> <code>&amp;amp;</code> と書きます。'),
    ]),
    S('CSS の言葉', [
      T('ルールの形', 'Rule syntax', '<code>セレクタ { プロパティ: 値; }</code>。「どれに（セレクタ）」「何を（プロパティ）」「どうする（値）」の3つでできています。', null, ['基本'], { code:'h1 {\n  color: #1971c2;     /* 文字の色 */\n  font-size: 24px;    /* 文字の大きさ */\n}' }),
      T('開発者ツールで確かめる', 'DevTools', 'ページの上で右クリック →「検証」で、その要素の HTML と、効いている CSS が見られます。値をその場で変えて試すこともできます。', null, ['最重要']),
    ]),
  ]});

/* ================= 2. よく使うタグ ================= */
const TAGS = [
  ['h1〜h6', '<h1>見出し1</h1><h2>見出し2</h2><h3>見出し3</h3>', '見出し。数字が小さいほど大きな区切り。ページに h1 は1つが基本。<b>文字を大きくしたいだけ</b>なら CSS で。'],
  ['p', '<p>これは段落です。文章のまとまりは p で囲みます。</p><p>次の段落。</p>', '段落（文章のまとまり）。'],
  ['a', '<a href="https://example.com">リンクの文字</a>', 'リンク。<code>href</code> に行き先。別のタブで開くなら <code>target="_blank" rel="noopener"</code>。'],
  ['img', '<img src="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%2290%22%3E%3Crect width=%22160%22 height=%2290%22 rx=%2210%22 fill=%22%231971c2%22/%3E%3Ccircle cx=%2250%22 cy=%2245%22 r=%2218%22 fill=%22%23ffd43b%22/%3E%3C/svg%3E" alt="青い四角に黄色い丸の絵" width="160" height="90">', '画像。<code>src</code> に場所、<code>alt</code> に代わりの文（<a href="accessibility.html#sr">アクセシビリティ辞典</a>）。<code>width</code>・<code>height</code> を書くと表示のガタつきを防げます。'],
  ['ul・ol・li', '<ul><li>りんご</li><li>みかん</li></ul><ol><li>洗う</li><li>切る</li></ol>', '箇条書き。ul は順番なし（・）、ol は番号つき。中の1つ1つが li。'],
  ['button', '<button type="button">押す</button>', 'ボタン。押すと何かが起きる所には button を使います（div で作らない）。フォームの中では <code>type</code> を指定。'],
  ['input・label', '<label for="nm">お名前</label><br><input id="nm" type="text" placeholder="山田 花子"><br><label><input type="checkbox"> 同意する</label>', '入力欄と、その名前（ラベル）。<code>for</code> と <code>id</code> をそろえると、ラベルを押しても入力欄が選べます。'],
  ['form', '<form><label>メール <input type="email"></label> <button>送信</button></form>', 'フォーム。中の入力をまとめて送る範囲。'],
  ['table', '<table><tr><th>商品</th><th>値段</th></tr><tr><td>ジャム</td><td>800円</td></tr></table>', '表。th が見出しのセル、td がふつうのセル、tr が行。レイアウトのために表を使うのはやめます。'],
  ['div・span', '<div style="background:#e7f5ff;padding:6px">div は箱（ブロック）</div><p>文の中の <span style="background:#fff3bf">span は一部分</span> を囲む</p>', '意味を持たない入れ物。div はブロック（1行を使う）、span はインライン（文の中）。<b>意味のあるタグがあるならそちらを優先</b>。'],
  ['header・nav・main・footer', '<header style="border:1px dashed #999;padding:4px">header（上の部分）<nav>nav（メニュー）</nav></header><main style="border:1px dashed #999;padding:4px;margin:4px 0">main（中心の内容）</main><footer style="border:1px dashed #999;padding:4px">footer（下の部分）</footer>', 'ページの区画を表すタグ。見た目は div と同じでも、<b>読み上げソフトや検索エンジンに構造が伝わります</b>。'],
  ['strong・em', '<p>ここは <strong>とても大事</strong> で、ここは <em>強調</em> です。</p>', 'strong は重要、em は強調。太字・斜体にしたいだけなら CSS（font-weight など）で。'],
  ['select・textarea', '<select><option>小</option><option>中</option><option>大</option></select><br><textarea rows="2" cols="24">複数行の入力</textarea>', '選択肢から選ぶ欄と、複数行の入力欄。'],
];
TABS.push({ id:'tags', label:'よく使うタグ', icon:'🏷',
  intro:'HTML のタグは100種類以上ありますが、ふだん使うのは20個ほどです。タグを押すと、<b>表示された様子とコード</b>が出ます。大事なのは見た目ではなく<b>意味で選ぶ</b>こと（大きな文字＝h1、ではなく、いちばん大きな見出し＝h1）。',
  sections:[
    C('触って理解する', [
      { name:'タグ図鑑', en:'Common tags', h:440, wide:true, tags:['体験','基本'],
        demo:'<div class="kt"><div class="hc-tags"></div><div class="hc-split"><div><span class="hc-lbl">表示</span><div class="hc-show"></div></div><div><span class="hc-lbl">コード</span><pre class="hc-code cd" style="flex:1"></pre><div class="kt-note ds"></div></div></div></div>',
        init:(el) => { const box = $(el, '.hc-tags'); box.innerHTML = TAGS.map((t, i) => `<button type="button" data-i="${i}">${t[0]}</button>`).join('');
          const show = (i) => { const [, code, d] = TAGS[i]; $$(box, 'button').forEach((b, j) => b.classList.toggle('on', i === j)); $(el, '.hc-show').innerHTML = code; $(el, '.cd').textContent = code.replace(/></g, '>\n<').replace(/src="data:[^"]+"/, 'src="picture.svg"'); $(el, '.ds').innerHTML = d; };
          $$(box, 'button').forEach(b => b.onclick = () => show(+b.dataset.i)); $(el, '.hc-show').addEventListener('click', (e) => { if (e.target.closest('a, form button')) e.preventDefault(); }); show(0); },
        desc:'表示は、このページのブラウザで実際に描いたものです（色などはこの辞典の見た目の影響を少し受けます）。',
        prompt:'この HTML を、意味に合ったタグ（見出し・段落・リスト・ボタン・header/nav/main/footer など）を使う形に直して。見た目は CSS で今と同じに保って。div や span だけで組まれている所を中心に。\n【HTML】' },
    ], null, true),
    S('タグの考え方', [
      T('ブロックとインライン', 'Block / inline', 'div・p・h1 などは<b>ブロック</b>（横いっぱいを使い、前後で改行）。a・span・strong などは<b>インライン</b>（文の中に並ぶ）。CSS の display で変えられます。', null, ['基本']),
      T('意味で選ぶ（セマンティック）', 'Semantic HTML', '見た目ではなく役割でタグを選ぶと、読み上げ・検索・あとからの修正のすべてが楽になります。', null, ['最重要']),
      T('見出しのレベルを飛ばさない', 'Heading order', 'h1 → h2 → h3 の順に。h2 の次にいきなり h4 にしない（<a href="accessibility.html#sr">アクセシビリティ辞典</a>の見本）。'),
      T('リンクとボタンの違い', 'Link vs button', '<b>別のページへ移動するならリンク（a）</b>、<b>その場で何かをするならボタン（button）</b>。'),
      T('空の要素', 'Void elements', '<code>&lt;img&gt;</code> <code>&lt;input&gt;</code> <code>&lt;br&gt;</code> <code>&lt;meta&gt;</code> などは中身を持たないので、終了タグを書きません。'),
      T('大文字・小文字', 'Case', 'HTML のタグ名は小文字で書くのが一般的。ファイル名は公開先で大文字・小文字が区別されるので注意（<a href="deploy.html#basics">公開のしかた辞典</a>）。'),
    ]),
  ]});

/* ================= 3. セレクタと優先順位 ================= */
const DOM = '<header data-t="header#top" id="top"><h1 data-t="h1.title" class="title">サンプル商店</h1><nav data-t="nav"><a data-t="a.link.active" href="#" class="link active">ホーム</a><a data-t="a.link" href="#" class="link">ブログ</a></nav></header><main data-t="main"><article data-t="article.card" class="card"><h2 data-t="h2">記事1</h2><p data-t="p">本文<strong data-t="strong">大事</strong></p></article><article data-t="article.card.new" class="card new"><h2 data-t="h2">記事2</h2><p data-t="p">本文</p><button data-t="button[disabled]" type="button" disabled>購入</button></article></main><footer data-t="footer"><p data-t="p">© 2026</p></footer>';
const SELS = ['h2', '.card', '#top', 'nav a', '.card.new', 'article > p', '.link:not(.active)', 'p strong', 'article:first-child', 'button:disabled', '[href]', 'h1, footer p'];
function spec(sel){ let s = sel.replace(/"[^"]*"|'[^']*'/g, ''); s = s.replace(/:where\([^)]*\)/g, ''); s = s.replace(/:(is|not|has)\(([^)]*)\)/g, ' $2 ');
  const a = (s.match(/#[\w-]+/g) || []).length, b = (s.match(/\.[\w-]+/g) || []).length + (s.match(/\[[^\]]*\]/g) || []).length + (s.match(/(^|[^:]):(?!:)[\w-]+/g) || []).length;
  const c = (s.replace(/::?[\w-]+(\([^)]*\))?|\[[^\]]*\]|[#.][\w-]+/g, ' ').match(/(^|[\s>+~,(])[a-zA-Z][\w-]*/g) || []).length + (s.match(/::[\w-]+/g) || []).length; return [a, b, c]; }
const cmp = (x, y) => x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
TABS.push({ id:'selector', label:'セレクタと優先順位', icon:'🎯',
  intro:'CSS の<b>セレクタ</b>は「どの要素に効かせるか」を選ぶ書き方です。同じ要素に複数のルールが当たったときは、<b>より具体的なセレクタ（優先順位が高い方）</b>が勝ちます。「CSS を書いたのに効かない」の多くは、この優先順位の問題です。',
  sections:[
    C('触って理解する', [
      { name:'セレクタの実験台', en:'Selector tester', h:500, wide:true, tags:['体験','最重要'],
        demo:'<div class="kt"><input class="hc-in" value=".card" aria-label="セレクタ"><div class="hc-chips"></div><div class="kt-note res"></div><div class="hc-dom"></div></div>',
        init:(el) => { const dom = $(el, '.hc-dom'), inp = $(el, 'input'); dom.innerHTML = DOM; dom.addEventListener('click', (e) => { if (e.target.closest('a')) e.preventDefault(); });
          $(el, '.hc-chips').innerHTML = SELS.map(s => `<button type="button">${esc(s)}</button>`).join('');
          const run = () => { $$(dom, '.hit').forEach(x => x.classList.remove('hit')); const s = inp.value.trim(); if (!s){ $(el, '.res').textContent = 'セレクタを入れてください'; return; }
            try{ const hits = dom.querySelectorAll(s); hits.forEach(x => x.classList.add('hit')); const [a, b, c] = spec(s); $(el, '.res').innerHTML = `<b>${hits.length} 個</b>の要素に当たりました。優先順位（ID, クラス, 要素）＝ <b>(${a}, ${b}, ${c})</b>`; }
            catch(e){ $(el, '.res').innerHTML = '<b>セレクタの書き方が正しくありません</b>（かっこの閉じ忘れ・記号の打ち間違いなど）'; } };
          inp.oninput = run; $$(el, '.hc-chips button').forEach(b => b.onclick = () => { inp.value = b.textContent; run(); }); run(); },
        desc:'色の付いた箱が、そのセレクタで選ばれる要素です。箱の左上に、タグ名・class・id を書いてあります。判定はこのブラウザの <code>querySelectorAll</code> で実際に行っています。',
        prompt:'この CSS のセレクタが、HTML のどの要素に当たるかを説明して。意図しない要素まで当たっている所や、どこにも当たっていないセレクタがあれば指摘して。\n【HTML】\n【CSS】' },
      { name:'どちらのルールが勝つ？', en:'Specificity', h:380, tags:['体験'],
        demo:'<div class="kt"><div class="hc-spec"><input class="hc-in s1" value="nav a" aria-label="ルール1のセレクタ"><span class="sc o1"></span><input class="hc-in s2" value=".link" aria-label="ルール2のセレクタ"><span class="sc o2"></span></div><div class="kt-verdict note"></div><pre class="hc-code">優先順位は (ID の数, クラス・属性・疑似クラスの数, 要素の数) で比べる\n左の数字から順に比べて、大きい方が勝ち。同じなら、あとに書いた方が勝ち。</pre></div>',
        init:(el) => { const up = () => { const a = $(el, '.s1').value.trim(), b = $(el, '.s2').value.trim(), x = spec(a), y = spec(b), r = cmp(x, y);
            $(el, '.o1').innerHTML = `(${x.join(', ')})`; $(el, '.o2').innerHTML = `(${y.join(', ')})`; $(el, '.s1').classList.toggle('hc-win', r > 0); $(el, '.s2').classList.toggle('hc-win', r < 0);
            verdict($(el, '.note'), 'ok', r > 0 ? `<b>ルール1（${esc(a)}）が勝ち</b>。` : r < 0 ? `<b>ルール2（${esc(b)}）が勝ち</b>。` : '<b>同じ強さ</b>。CSS ファイルで<b>あとに書いた方</b>が勝ちます。'); };
          $$(el, 'input').forEach(i => i.oninput = up); up(); },
        desc:'計算は簡易版です（<code>:is()</code> などの細かい規則は省略）。<code>!important</code> はすべてに勝ちますが、使うほど直しにくくなるので最後の手段に。',
        prompt:'この CSS が効かない理由を、優先順位（詳細度）の観点で調べて。どのルールに負けているかを示して、!important を使わずに直す方法を教えて。\n【HTML】\n【効かない CSS】' },
    ], null, true),
    { title:'セレクタの早見表', note:'よく使う形です。',
      table:{ head:['書き方', '意味', '例'], rows:[
        ['<code>p</code>', 'その種類の要素すべて', '<code>p { line-height: 1.8; }</code>'],
        ['<code>.name</code>', 'class="name" の要素', '<code>.card { padding: 16px; }</code>'],
        ['<code>#name</code>', 'id="name" の要素（ページに1つ）', '<code>#top { … }</code>'],
        ['<code>A B</code>', 'A の中のどこかにある B（子孫）', '<code>nav a</code>'],
        ['<code>A &gt; B</code>', 'A のすぐ下の B（子）', '<code>ul &gt; li</code>'],
        ['<code>A, B</code>', 'A と B の両方', '<code>h1, h2 { … }</code>'],
        ['<code>.a.b</code>', 'a と b の両方の class を持つ', '<code>.card.new</code>'],
        ['<code>:hover</code>', 'マウスが乗っているとき', '<code>a:hover</code>'],
        ['<code>:focus-visible</code>', 'キーボードで選ばれているとき', '<code>button:focus-visible</code>'],
        ['<code>:first-child</code> / <code>:nth-child(2)</code>', '最初の子 / 2番目の子', '<code>li:nth-child(odd)</code>'],
        ['<code>::before</code> / <code>::after</code>', '要素の前後に飾りを足す', '<code>.new::before { content: "NEW"; }</code>'],
        ['<code>[type="email"]</code>', '属性で選ぶ', '<code>input[type="email"]</code>'],
      ] } },
    S('効く・効かないの仕組み', [
      T('カスケード', 'Cascade', '同じ要素に複数のルールが当たったとき、①優先順位の高い方、②同じならあとに書いた方、が使われる仕組み。', null, ['基本']),
      T('継承', 'Inheritance', '文字の色や大きさなどは、親に指定すると子にも受け継がれます。枠線や余白は受け継がれません。'),
      T('!important', '!important', 'どんな優先順位にも勝つ指定。使うと、あとで上書きできずに困るので、AIが多用していたら直してもらいます。', null, ['注意']),
      T('class で書くのが基本', 'Prefer classes', 'id で見た目を指定すると優先順位が高すぎて上書きしにくくなります。見た目は class で。'),
      T('CSS 変数', 'Custom properties', '<code>--main: #1971c2;</code> と名前を付けて、<code>color: var(--main);</code> で使う。色を一か所で変えられます（<a href="color-typography.html#tokens">配色辞典のトークン</a>）。'),
    ]),
  ]});

/* ================= 4. ボックスモデル ================= */
TABS.push({ id:'box', label:'ボックスモデル', icon:'📦',
  intro:'すべての要素は<b>四角い箱</b>です。箱は内側から <b>中身（content）→ 内側の余白（padding）→ 枠線（border）→ 外側の余白（margin）</b>の4層でできています。「思ったより幅が広い」「余白が効かない」は、この4層を意識すると解決します。',
  sections:[
    C('触って理解する', [
      { name:'箱の4層を動かす', en:'Box model', h:480, wide:true, tags:['体験','最重要'],
        demo:'<div class="kt"><div class="hc-legend"><span style="--c:color-mix(in srgb,#f59e0b 40%,transparent)">margin（外側の余白）</span><span style="--c:#64748b">border（枠線）</span><span style="--c:color-mix(in srgb,#22c55e 40%,#fff)">padding（内側の余白）</span><span style="--c:color-mix(in srgb,#3b82f6 45%,#fff)">content（中身）</span></div><div class="hc-ctl sl"></div><div class="kt-row"><span class="kt-lbl">box-sizing</span><span class="sg"></span></div><div class="hc-boxstage"><div class="hc-m"><div class="hc-b"><div class="hc-p"><div class="hc-c"></div></div></div></div></div><pre class="hc-code out"></pre></div>',
        init:(el) => { let bb = 0;
          const draw = (st) => { const { w, p, b, m } = st, cw = bb ? Math.max(0, w - 2 * p - 2 * b) : w, total = bb ? w : w + 2 * p + 2 * b;
            Object.assign($(el, '.hc-m').style, { padding:m + 'px' }); Object.assign($(el, '.hc-b').style, { padding:b + 'px' }); Object.assign($(el, '.hc-p').style, { padding:p + 'px' }); Object.assign($(el, '.hc-c').style, { width:cw + 'px' });
            $(el, '.hc-c').textContent = `中身 ${cw}px`;
            $(el, '.out').innerHTML = `.box {\n  box-sizing: <b>${bb ? 'border-box' : 'content-box'}</b>;\n  width: ${w}px;\n  padding: ${p}px;\n  border: ${b}px solid;\n  margin: ${m}px;\n}\n→ 画面で使う幅（枠線まで）＝ <b>${total}px</b>${bb ? '（width の中に padding と border が含まれる）' : `（${w} ＋ ${p}×2 ＋ ${b}×2）`}`; };
          const st = sliders($(el, '.sl'), [['w', 'width', 40, 220, 10, 140, 'px'], ['p', 'padding', 0, 40, 2, 16, 'px'], ['b', 'border', 0, 16, 1, 4, 'px'], ['m', 'margin', 0, 40, 2, 16, 'px']], draw);
          $(el, '.sg').append(seg(['content-box（初期値）', 'border-box'], (i) => { bb = i; draw(st); }, 0).el); },
        desc:'初期値の <code>content-box</code> では、width は<b>中身だけ</b>の幅なので、padding と border を足すと箱が広がります。<code>border-box</code> にすると width に枠線まで含まれ、計算が直感的になるので、多くのサイトは最初に全体へ指定しています。',
        prompt:'この要素の幅が思ったより広くなって、横にはみ出します。box-sizing・width・padding・border・margin の観点で原因を調べて、はみ出さないように直して。\n【HTML】\n【CSS】',
        code:'/* 多くのサイトが最初に書く設定 */\n*, *::before, *::after {\n  box-sizing: border-box;\n}' },
    ], null, true),
    S('箱と大きさの言葉', [
      T('margin と padding', 'Margin / padding', 'margin は箱の<b>外側</b>（となりとの間）、padding は箱の<b>内側</b>（枠線と中身の間）。背景色は padding まで塗られ、margin は塗られません。', null, ['基本','最重要']),
      T('値の書き方（上右下左）', 'Shorthand', '<code>padding: 8px 16px;</code> は「上下8px・左右16px」。<code>margin: 0 auto;</code> は「上下0・左右自動」で、幅のある箱を中央に寄せる定番。'),
      T('margin の相殺', 'Margin collapsing', '縦に並んだ箱の上下の margin は、足されずに<b>大きい方だけ</b>になります（24px と 16px なら 24px）。「余白が思ったより狭い」の原因に。', null, ['注意']),
      T('display', 'display', '<code>block</code>（1行を使う）、<code>inline</code>（文の中・幅を指定できない）、<code>inline-block</code>（文の中だが幅を指定できる）、<code>flex</code>・<code>grid</code>（中身を並べる）、<code>none</code>（消す）。'),
      T('単位', 'Units', '<code>px</code>（画面の点）、<code>%</code>（親に対する割合）、<code>rem</code>（基本の文字サイズの何倍か）、<code>em</code>（その要素の文字サイズの何倍か）、<code>vw</code>・<code>vh</code>（画面の幅・高さの1%）。文字は rem が基本。', null, ['基本']),
      T('max-width', 'max-width', '「最大でこの幅まで」。<code>max-width: 720px;</code> と <code>margin: 0 auto;</code> で、広い画面では中央にまとまり、狭い画面では縮む、読みやすい本文の幅が作れます。'),
      T('overflow', 'overflow', '中身が箱からあふれたときの扱い。<code>hidden</code>（隠す）、<code>auto</code>（スクロールさせる）。横スクロールが出る原因探しにも。'),
      T('height は固定しない', 'Avoid fixed height', '高さを固定すると、文字が増えたり拡大したりしたときにはみ出します。高さは中身に任せ、必要なら <code>min-height</code> を使います。', null, ['注意']),
    ]),
  ]});
})();
