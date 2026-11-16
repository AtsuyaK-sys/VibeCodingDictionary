/* エラー・トラブル辞典 — B: 表示が崩れる（CSS）/ TypeScript / エラーを読む練習 */
(function(){
const { $, $$, seg } = KIT;
const E = (msg, cat, mean, causes, fix, prompt, tags) => ({ name:`<code class="err">${msg.replace(/</g, '&lt;')}</code>`, en:cat, tags, search:msg,
  desc:`<b>意味：</b>${mean}<br><b>よくある原因：</b><ul>${causes.map(c => `<li>${c}</li>`).join('')}</ul><b>対処：</b>${fix}`, prompt });
const T = (name, en, desc, prompt, tags) => ({ name, en, desc, prompt, tags });

/* 崩れた見本と、直した見本を切り替える。B = [崩れたHTML, 直したHTML], FIX = 直し方のCSS */
const flip = (B, FIX) => (el) => { const box = $(el, '.er-box'), fx = $(el, '.er-fix');
  $(el, '.sw').replaceWith(seg(['崩れている', '直した'], i => { box.innerHTML = `<span class="er-tag ${i ? 'ok' : ''}">${i ? '直した' : '崩れている'}</span>` + B[i]; fx.innerHTML = FIX[i]; }).el); };
const D = '<div class="kt"><span class="sw"></span><div class="er-box"></div><div class="er-fix"></div></div>';
const URL = 'https://example.com/very/long/path/to/some/page?utm_source=newsletter&utm_campaign=autumn';
// 正方形の「写真」。none ＝ 枠に合わせて引きのばす（つぶれる）、slice ＝ 比率を保って切り取る（object-fit: cover と同じ）
const PHOTO = (fit, w) => `<svg viewBox="0 0 100 100" preserveAspectRatio="${fit}" style="width:${w};flex:${w === 'auto' ? 1 : 'none'};min-width:0;height:100%;border-radius:6px;display:block"><rect width="100" height="100" fill="#7dd3fc"/><rect y="68" width="100" height="32" fill="#65a30d"/><circle cx="50" cy="44" r="22" fill="#fde68a" stroke="#fff" stroke-width="3"/><circle cx="43" cy="40" r="2.5" fill="#1e293b"/><circle cx="57" cy="40" r="2.5" fill="#1e293b"/><path d="M42 51 Q50 58 58 51" stroke="#1e293b" stroke-width="2.5" fill="none"/></svg>`;
const IMG = (style) => `<div style="${style};background:linear-gradient(135deg,#f97316 0 50%,#2563eb 50%);position:relative"><span style="position:absolute;left:50%;top:50%;translate:-50% -50%;width:34%;aspect-ratio:1;border-radius:50%;background:#fde68a;border:3px solid #fff"></span></div>`;

/* ================= 表示が崩れる（CSS） ================= */
TABS.push({ id:'css', label:'表示が崩れる（CSS）', icon:'🧱',
  intro:'見た目の崩れは<b>エラーが出ない</b>ので、原因を見つけにくいトラブルです。よくある崩れ方を、<b>崩れた状態と直した状態を切り替えて</b>見比べられるようにしました。どれに似ているかが分かれば、AIへの伝え方も具体的になります。ブラウザで右クリック →「検証」を開き、崩れている部品を選ぶと、効いているCSSが見られます。',
  sections:[
    { title:'崩れ方を見比べる', layout:'cards', items:[
      { name:'横にはみ出す・横スクロールが出る', en:'Horizontal overflow', h:330, tags:['よくある', 'スマホ'], demo:D,
        init:flip([`<div class="er-phone"><div class="er-card">参考：${URL}</div>${IMG('width:260px;height:70px;margin-top:6px')}</div>`, `<div class="er-phone"><div class="er-card" style="overflow-wrap:anywhere">参考：${URL}</div>${IMG('width:260px;max-width:100%;height:70px;margin-top:6px')}</div>`],
          ['長いURLや英単語は<b>折り返されない</b>。画像は<b>固定の幅</b>のままはみ出す。', '.card { <b>overflow-wrap: anywhere;</b> }  /* 長い文字も折り返す */\nimg   { <b>max-width: 100%;</b> height: auto; }']),
        desc:'スマホで横にスクロールできてしまう原因の多くは、<b>折り返せない長い文字（URL・英数字）</b>か、<b>幅を固定した画像や表</b>です。開発者ツールで画面の右端より外に出ている部品を探します。',
        prompt:'スマホ（幅375px）で見ると、ページが横にスクロールしてしまう。はみ出している要素を探す方法を教えて、原因の要素を直して。長いURLは折り返し、画像は画面の幅に収まるようにして。' },
      { name:'真ん中にそろわない', en:'Centering fails', h:300, tags:['よくある'], demo:D,
        init:flip(['<div style="height:100%;background:#f1f5f9;text-align:center"><button style="padding:6px 14px">申し込む</button></div>', '<div style="height:100%;background:#f1f5f9;display:grid;place-items:center"><button style="padding:6px 14px">申し込む</button></div>'],
          ['<b>text-align: center</b> は横だけ。縦は真ん中にならない。', '.wrap { <b>display: grid; place-items: center;</b> }\n/* または display:flex; justify-content:center; align-items:center; */']),
        desc:'「真ん中にしたい」は、<b>横だけなのか、縦も含めてなのか</b>で書き方が変わります。親の箱に <code>display:grid; place-items:center</code> を付けるのが一番かんたんです。',
        prompt:'このボタンを、親の箱の縦横どちらも真ん中に置きたい。今の書き方で真ん中にならない理由も説明して。' },
      { name:'後ろに隠れる・重なり順がおかしい', en:'z-index & stacking', h:310, tags:['よくある'], demo:D,
        init:flip(['<div style="position:relative;height:100%"><div style="background:#fef3c7;padding:6px;height:40px;position:relative;z-index:2">ヘッダー（z-index:2）</div><div style="position:relative;z-index:1"><div style="position:absolute;top:-24px;left:30px;width:140px;background:#fff;border:1px solid #94a3b8;border-radius:6px;padding:6px;z-index:999;box-shadow:0 6px 16px #0003">メニュー（z-index:999）<br>…なのに隠れる</div></div></div>', '<div style="position:relative;height:100%"><div style="background:#fef3c7;padding:6px;height:40px;position:relative;z-index:2">ヘッダー（z-index:2）</div><div style="position:relative;z-index:3"><div style="position:absolute;top:-24px;left:30px;width:140px;background:#fff;border:1px solid #94a3b8;border-radius:6px;padding:6px;box-shadow:0 6px 16px #0003">メニュー<br>前に出た</div></div></div>'],
          ['メニューの z-index が 999 でも、<b>親の z-index:1</b> の中に閉じ込められている（重なりのグループ）。', '/* 比べられるのは「同じグループの中」だけ */\n.menu-parent { z-index: <b>3</b>; }  /* 親を前に出す */\n/* または メニューを body の直下に出す（ポータル） */']),
        desc:'z-index を 9999 にしても前に出ないのは、<b>親が作った重なりのグループ</b>の中でしか比べられないためです。親に <code>z-index</code>・<code>transform</code>・<code>opacity</code> などがあるとグループが作られます。モーダルやメニューは、ページの一番外側に出すのが確実です。',
        prompt:'ドロップダウンメニューが、z-index を大きくしてもヘッダーの後ろに隠れる。重なりのグループ（stacking context）の観点から原因を調べて、確実に前に出る形に直して。' },
      { name:'画像がつぶれる・伸びる', en:'Distorted images', h:300, tags:['よくある'], demo:D,
        init:flip([`<div style="display:flex;gap:8px;height:100%">${PHOTO('none', '90px')}${PHOTO('none', 'auto')}</div>`, `<div style="display:flex;gap:8px;height:100%">${PHOTO('xMidYMid slice', '90px')}${PHOTO('xMidYMid slice', 'auto')}</div>`],
          ['幅と高さを両方決めると、<b>縦横の比率がくずれて</b>顔がつぶれたり伸びたりする。', 'img { width: 100%; height: 200px; <b>object-fit: cover;</b> }\n/* 比率を保ったまま、はみ出た所を切る */']),
        desc:'写真に幅と高さの両方を指定すると、元の比率と違うときに<b>つぶれたり伸びたり</b>します。<code>object-fit: cover</code> を付けると、比率を保ったまま箱いっぱいに広げて、はみ出た部分を切り取ります。全体を見せたいときは <code>contain</code>。',
        prompt:'商品一覧の写真が、カードによってつぶれたり伸びたりして見える。すべて同じ高さの枠に、比率を保ったまま切り取って表示するように直して。' },
      { name:'幅を指定したのに大きくなる', en:'box-sizing', h:290, tags:['よくある'], demo:D,
        init:flip(['<div style="width:200px;max-width:100%;border:2px dashed #94a3b8;padding:4px"><div style="width:100%;padding:0 20px;border:6px solid #2563eb;background:#dbeafe;box-sizing:content-box">width:100% なのに<br>はみ出す</div></div>', '<div style="width:200px;max-width:100%;border:2px dashed #94a3b8;padding:4px"><div style="width:100%;padding:0 20px;border:6px solid #2563eb;background:#dbeafe;box-sizing:border-box">ちょうど収まる</div></div>'],
          ['幅100% ＋ 内側の余白 40px ＋ 枠線 12px ＝ <b>はみ出す</b>。', '*, *::before, *::after { <b>box-sizing: border-box;</b> }\n/* 幅に、余白と枠線を含めて計算する */']),
        desc:'CSSの初期の決まりでは、<code>width</code> は中身だけの幅で、<b>余白（padding）と枠線は外側に足される</b>ため、指定より大きくなります。ページの最初に <code>box-sizing: border-box</code> を全体へ付けておくのが定番です。',
        prompt:'入力欄に width:100% を付けたのに、親の箱からはみ出す。原因を説明して、ページ全体で box-sizing: border-box を使う形に直して。' },
      { name:'並べた中身が縮まずにはみ出す', en:'Flex items & min-width', h:280, tags:['よくある'], demo:D,
        init:flip([`<div style="display:flex;gap:6px;width:100%;border:1px solid #94a3b8;padding:6px;border-radius:8px"><span style="width:28px;height:28px;border-radius:50%;background:#94a3b8;flex:none"></span><div><b>山田さん</b><div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${URL}</div></div></div>`, `<div style="display:flex;gap:6px;width:100%;border:1px solid #94a3b8;padding:6px;border-radius:8px"><span style="width:28px;height:28px;border-radius:50%;background:#94a3b8;flex:none"></span><div style="min-width:0"><b>山田さん</b><div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${URL}</div></div></div>`],
          ['横並び（flex）の中身は、<b>中の文字より小さく縮まない</b>決まりがある。「…」で省略されない。', '.row > .text { <b>min-width: 0;</b> }\n/* これで縮めるようになり、… の省略が効く */']),
        desc:'<code>display:flex</code> で横に並べた中身は、初期の決まりで<b>中の文字の長さより小さくならない</b>ため、省略（…）が効かずにはみ出します。縮めたい側に <code>min-width: 0</code> を付けるのが決まり文句です。',
        prompt:'アイコンと文字を横並びにしたリストで、長い文字が「…」で省略されずに外へはみ出す。flex の min-width の観点から直して。' },
      { name:'上に固定（sticky）が効かない', en:'position: sticky not working', h:300, tags:['よくある'], demo:D,
        init:(el) => { const box = $(el, '.er-box'), fx = $(el, '.er-fix'), list = Array.from({ length:14 }, (_, i) => `<div style="padding:4px 8px;border-bottom:1px solid #e2e8f0">項目 ${i + 1}</div>`).join('');
          $(el, '.sw').replaceWith(seg(['崩れている', '直した'], i => { box.classList.add('scroll'); box.scrollTop = 0; box.innerHTML = `<span class="er-tag ${i ? 'ok' : ''}" style="position:sticky;float:right;top:0">${i ? '直した' : '崩れている'}</span><div style="${i ? '' : 'overflow:hidden;'}"><div style="position:sticky;top:0;background:#1e293b;color:#fff;padding:6px 8px;font-weight:700">見出し（sticky）</div>${list}</div>`; fx.innerHTML = i ? '/* 親から <b>overflow: hidden を外す</b>と、スクロールに合わせて止まる */' : '枠の中をスクロールしてみてください。見出しが一緒に流れていきます。<b>親に overflow: hidden</b> があると sticky は効きません。'; }).el); },
        desc:'<code>position: sticky</code> が効かない原因の多くは、<b>途中の親に overflow（hidden・auto）が付いている</b>ことです。ほかに、<code>top</code> の指定忘れ、親の高さが足りない、も定番です。',
        prompt:'見出しに position: sticky; top: 0; を付けたのに、スクロールすると一緒に流れてしまう。親要素のどれが原因かを調べる方法を教えて、直して。' },
    ] },
    { title:'崩れたときの調べ方', layout:'rows', items:[
      T('部品を選んで、効いているCSSを見る', 'Inspect element', '崩れている所を右クリック →「検証」。右側に、その部品に効いているCSSが上から順に出ます。線で消されているものは、ほかのCSSに負けて効いていません。', 'この部品の見た目がおかしい。開発者ツールの「スタイル」欄をコピーして貼るので、どのCSSが原因か教えて。\n\n【スタイル欄をここに貼る】', ['まずここ']),
      T('全部に線を引いて、箱の大きさを見る', 'Outline everything', '一時的に <code>* { outline: 1px solid red; }</code> を足すと、すべての箱の境目が見えて、はみ出している箱が一目で分かります。確認が終わったら必ず消します。'),
      T('スマホの幅で確かめる', 'Device toolbar', '開発者ツールのスマホのアイコン（Ctrl+Shift+M）で、スマホの幅を再現できます。パソコンで直したつもりが、スマホで崩れていることはとても多いです。'),
      T('スクリーンショットで伝える', 'Show, don\'t describe', '見た目の問題は、言葉より画像の方が早く正確に伝わります。崩れている所を丸で囲んで、AIに見せましょう。', 'このスクリーンショットの赤丸の部分が崩れている。本来は【こうなってほしい】。原因を推測して、パソコンでの見た目は変えずに直して。'),
      T('キャッシュを疑う', 'Hard reload', 'CSSを直したのに見た目が変わらないときは、古いCSSが残っています。Ctrl+Shift+R（Macは ⌘+Shift+R）で読み直します。'),
    ] },
  ]});

/* ================= TypeScript ================= */
TABS.push({ id:'ts', label:'TypeScript', icon:'TS',
  intro:'TypeScript は「この変数には文字が入る」のように<b>型（データの種類）</b>を決めて書く JavaScript です。型が合わないと、<b>動かす前に</b>エディタやビルドでエラーを出して教えてくれます。エラー文の <code>TS2322</code> のような番号で検索すると、意味がすぐ分かります。<b>any で黙らせる・@ts-ignore で消す</b>のは最後の手段です。',
  sections:[
    { title:'型のエラー', layout:'rows', items:[
      E("Type 'string' is not assignable to type 'number'. (TS2322)", 'TypeScript', '決めておいた型と違う種類の値を入れようとした。', ['入力欄の値（いつも文字）をそのまま数値の変数に入れた', 'APIの返事の型の決め方が実際と違う', '型を決めた後に、使い方を変えた'], '値を変換する（<code>Number(value)</code>）か、型の決め方が実際のデータと合っているか確かめる。', 'TypeScript で「Type \'string\' is not assignable to type \'number\'」が出た。どこで文字が入ってきているかを調べて、変換が必要な場所で正しく変換して。型の決め方の方が間違っていれば、そちらを直して。', ['よくある']),
      E("Property 'xxx' does not exist on type 'YYY'. (TS2339)", 'TypeScript', 'その型には xxx という項目がない、と TypeScript が判断した。', ['項目名のスペルミス', '型の定義に項目を書き忘れた', 'まだ種類が絞り込まれていない（AかBのどちらか分からない）'], '型の定義に項目を足すか、<code>if (\'xxx\' in obj)</code> などで種類を絞り込んでから使う。', 'TypeScript で「Property \'xxx\' does not exist on type」が出た。型の定義が足りないのか、種類の絞り込みが必要なのかを判断して、正しい方法で直して。any は使わないで。'),
      E("'xxx' is possibly 'undefined'. (TS18048)", 'TypeScript', 'その値は「ないかもしれない（undefined）」ので、そのままでは使えない。', ['配列の find() の結果（見つからない場合がある）', '省略できる項目（?: で定義したもの）', 'URL のパラメーターや localStorage の値'], '「なかった場合」の処理を書く。<code>if (!x) return;</code>、<code>x?.name</code>、<code>x ?? \'なし\'</code> など。', 'TypeScript で「is possibly \'undefined\'」が出た。値が無い場合に画面がどうなるべきかも考えて、安全に扱う形に直して。! で黙らせる書き方は避けて。', ['よくある']),
      E("Object is possibly 'null'. (TS2531)", 'TypeScript', 'その値は null（空っぽ）かもしれない。', ['document.querySelector() の結果（見つからない場合がある）', 'React の useRef の初期値'], '使う前に <code>if (el)</code> で確かめるか、<code>el?.focus()</code> のように書く。'),
      E("Argument of type 'X' is not assignable to parameter of type 'Y'. (TS2345)", 'TypeScript', '関数に渡した値の型が、関数が受け取る型と違う。', ['引数の順番の間違い', 'オブジェクトの項目が足りない・多い', 'ライブラリの更新で受け取る型が変わった'], '関数の定義（マウスを乗せると見える）と、渡している値を見比べる。'),
      E("Parameter 'x' implicitly has an 'any' type. (TS7006)", 'TypeScript', '引数の型が書かれていないので、何でも入る（any）になってしまう。', ['関数の引数に型を書いていない', 'JavaScript から TypeScript に移した直後'], '<code>function f(x: string)</code> のように型を書く。'),
      E('Expected 2 arguments, but got 1. (TS2554)', 'TypeScript', '関数に渡す値の数が合わない。', ['引数を書き忘れた', '関数の定義を変えたのに、呼び出し側を直していない'], '関数の定義と呼び出しを見比べる。省略できる引数は <code>x?: string</code> にする。'),
    ] },
    { title:'設定・読み込みのエラー', layout:'rows', items:[
      E("Cannot find module 'xxx' or its corresponding type declarations. (TS2307)", 'TypeScript', 'そのモジュール、または型の情報が見つからない。', ['パッケージを入れていない', '型の情報が別のパッケージ（@types/xxx）になっている', 'ファイルの場所（パス）の書き間違い'], '<code>npm install xxx</code>、必要なら <code>npm install -D @types/xxx</code>。パスなら、ファイルの場所を確かめる。', 'TypeScript で「Cannot find module」が出た。パッケージが入っていないのか、型の情報が足りないのか、パスが違うのかを確かめて直して。'),
      E("Cannot find name 'xxx'. (TS2304)", 'TypeScript', 'その名前（変数・型）が見つからない。', ['import を書き忘れた', 'スペルミス', 'ブラウザ用・Node用の型の設定が足りない（document や process が見つからない）'], 'import を足すか、tsconfig.json の lib・types の設定を確かめる。'),
      E("'await' expressions are only allowed within async functions. (TS1308)", 'TypeScript', 'await は async を付けた関数の中でしか使えない。', ['関数に async を付け忘れた', 'forEach の中で await を使った'], '外側の関数に <code>async</code> を付ける。forEach の代わりに <code>for...of</code> を使う。'),
      E('Type instantiation is excessively deep and possibly infinite. (TS2589)', 'TypeScript', '型の計算が複雑すぎて、TypeScript があきらめた。', ['ライブラリの複雑な型の組み合わせ', '自分で作った再帰的な型'], 'ライブラリの更新、または型を途中で明示して計算を短くする。困ったらエラー文ごとAIに相談。'),
    ] },
    { title:'TypeScript とうまく付き合う', layout:'rows', items:[
      T('any で黙らせない', 'Avoid any', '<code>any</code> を使うと、エラーは消えますが<b>型のチェックも全部消えます</b>。本当に分からないときは <code>unknown</code> を使い、使う前に確かめます。', 'このコードの any をできるだけ具体的な型に置き換えて。型が分からない所は unknown にして、使う前に確かめる形にして。', ['最重要']),
      T('@ts-ignore は最後の手段', 'Don\'t silence errors', 'エラーを隠すだけで、原因はそのまま残ります。AIが @ts-ignore や as any を使って直したら、本当の原因を直すよう頼み直します。', 'さっきの修正で @ts-ignore（または as any）を使っている。エラーを隠すのではなく、原因を直す方法に書き換えて。'),
      T('型エラーはまとめてAIに見せる', 'Paste all errors', 'ビルドで出たエラーは、1つずつではなくまとめて貼ると、共通の原因が見つかりやすいです。', 'npm run build で次の型エラーが出た。共通の原因があればまとめて直して。直した理由も1行ずつ説明して。\n\n【エラーをまとめて貼る】'),
      T('型を自動で作る', 'Generate types', 'APIやデータベースの型は、手で書くより自動で作る方が正確です（Supabase・Prisma・OpenAPI などは型の自動生成の機能があります）。'),
    ] },
  ]});

/* ================= エラーを読む練習 ================= */
const TRACES = [
  { name:'Node.js（サーバー側）', lines:[
    ['msg', "TypeError: Cannot read properties of undefined (reading 'email')", '<b>1行目が一番大事</b>。何のエラーか（TypeError）と、何をしようとして失敗したか（undefined の中の email を読もうとした）。'],
    ['mine', '    at sendWelcome (/app/src/mail.js:14:28)', '<b>自分のファイル</b>（src/ の中）。mail.js の <b>14行目の28文字目</b>で起きた。まずここを開きます。'],
    ['mine', '    at registerUser (/app/src/routes/users.js:42:11)', '自分のファイル。sendWelcome を呼び出したのは users.js の42行目。<b>ここで渡した値</b>が undefined だった可能性があります。'],
    ['lib', '    at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)', '<b>node_modules の中はライブラリ</b>。ここが原因であることはまれです。読み飛ばしてOK。'],
    ['lib', '    at next (/app/node_modules/express/lib/router/route.js:149:13)', 'ライブラリの内部。読み飛ばしてOK。'],
    ['lib', '    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)', '「node:internal」は Node.js 自体の内部。読み飛ばしてOK。'],
  ], tip:'下から上へ「呼び出した順」に並んでいます。<b>上から見て、最初に出てくる自分のファイル</b>が原因の場所です。この例では mail.js の14行目で、users.js から渡された user が undefined だったと考えられます。' },
  { name:'ブラウザ（Console）', lines:[
    ['msg', 'Uncaught (in promise) SyntaxError: Unexpected token \'<\', "<!DOCTYPE "... is not valid JSON', '1行目。JSON として読もうとしたら、<b>「<!DOCTYPE」から始まる HTML</b> が返ってきた。'],
    ['mine', '    at loadItems (app.js:23:31)', '自分のファイル。app.js の23行目で <code>res.json()</code> をしている所です。'],
    ['mine', '    at async init (app.js:8:3)', '自分のファイル。init から loadItems が呼ばれた。'],
    ['lib', 'GET http://localhost:5173/api/items 404 (Not Found)', '<b>すぐ上に出ていたネットワークのエラー</b>。API の場所（URL）が間違っていて、404 の HTML ページが返ってきたのが本当の原因です。'],
  ], tip:'このエラーの<b>本当の原因は1行目ではなく、近くのネットワークのエラー</b>でした。「not valid JSON」が出たら、まず Network タブで、その通信の状態（404・500 など）と返ってきた中身を確かめます。' },
  { name:'Python', lines:[
    ['lib', 'Traceback (most recent call last):', 'Python は Node.js と<b>逆向き</b>。「最後の呼び出しが一番下」という意味です。'],
    ['mine', '  File "/home/me/report.py", line 31, in <module>', '自分のファイル。report.py の31行目から始まった。'],
    ['mine', '    total = summarize(rows)', 'その行の中身。'],
    ['mine', '  File "/home/me/report.py", line 12, in summarize', '自分のファイル。summarize 関数の12行目。<b>一番下に近い自分のファイル</b>が原因の場所です。'],
    ['mine', '    return sum(r["price"] for r in rows)', 'エラーが起きた行の中身。'],
    ['msg', "KeyError: 'price'", '<b>Python は一番下の行が一番大事</b>。rows の中に price という項目がない行があった。'],
  ], tip:'Python のエラーは<b>一番下から読みます</b>。最後の行が何のエラーか、そのすぐ上が起きた場所です。この例では、CSV の列の名前が「price」ではなかった（例：「価格」や「Price」）可能性が高いです。' },
];
// タブの並び：向き合い方 → 読む練習 → JavaScript → 表示の崩れ → … → React の後ろに TypeScript
const moveAfter = (id, afterId) => { const t = TABS.splice(TABS.findIndex(x => x.id === id), 1)[0]; TABS.splice(TABS.findIndex(x => x.id === afterId) + 1, 0, t); };

TABS.push({ id:'read', label:'エラーを読む練習', icon:'🔍',
  intro:'長いエラーの中で、<b>見るべき所は2か所だけ</b>です。「何のエラーか」と「自分のファイルのどの行か」。実物そっくりのエラーで、どの行が大事かを練習しましょう。行を押すと説明が出ます。',
  sections:[
    { title:'行を押して読む', layout:'cards lg', items:[
      { name:'スタックトレースを読む', en:'Reading a stack trace', h:520, tags:['体験','最重要'], wide:true,
        demo:'<div class="kt"><span class="sw"></span><div class="er-trace tr"></div><div class="kt-verdict res"></div><div class="kt-row"><button type="button" class="kt-btn sm all">大事な行に印を付ける</button></div></div>',
        init:(el) => { let k = 0, marked = false; const res = $(el, '.res');
          const show = () => { const t = TRACES[k]; $(el, '.tr').innerHTML = t.lines.map((l, i) => `<div data-i="${i}" class="${marked ? l[0] : ''}">${l[1].replace(/</g, '&lt;')}</div>`).join(''); res.classList.remove('ok'); res.innerHTML = '気になる行を押してください。どの行が「何のエラーか」で、どの行が「自分のファイル」でしょう？';
            $$(el, '.tr div').forEach(d => d.onclick = () => { $$(el, '.tr div').forEach(x => x.classList.toggle('on', x === d)); res.innerHTML = t.lines[+d.dataset.i][2]; }); };
          $(el, '.all').onclick = () => { marked = !marked; show(); if (marked){ res.classList.add('ok'); res.innerHTML = '<span style="color:#dc2626">■</span> 何のエラーか　<span style="color:#ca8a04">■</span> 自分のファイル　<span style="color:#64748b">■</span> ライブラリ（読み飛ばしてOK）<br>' + TRACES[k].tip; } $(el, '.all').textContent = marked ? '印を消す' : '大事な行に印を付ける'; };
          $(el, '.sw').replaceWith(seg(TRACES.map(t => t.name), i => { k = i; show(); }).el); },
        desc:'エラーの中の長い行のつながりを<b>スタックトレース</b>と言います。「どの関数が、どの関数を呼んで、どこで失敗したか」の記録です。<b>ライブラリの中（node_modules・site-packages）の行はほとんど読み飛ばしてよく</b>、自分のファイル名が出てくる行を探します。Python は下から、Node.js やブラウザは上から読むのがコツです。',
        prompt:'このエラーのスタックトレースを読んで、①何のエラーか ②自分のコードのどのファイルの何行目が原因の可能性が高いか ③ライブラリの行は無視してよいか、を順に説明して。そのうえで直して。\n\n【エラーの全文を貼る】' },
    ] },
    { title:'エラー文の読み方のコツ', layout:'rows', items:[
      T('種類の名前を見る', 'Error type', '<code>TypeError</code>（値の種類が違う）、<code>ReferenceError</code>（名前がない）、<code>SyntaxError</code>（書き方の間違い）など、最初の単語で大まかな原因が分かります。', null, ['基本']),
      T('ファイル名:行:列 を探す', 'file:line:column', '<code>app.js:23:31</code> は「app.js の23行目、31文字目」。エディタでそのまま移動できます。'),
      T('引用されている名前を探す', 'Quoted names', "<code>'email'</code> や <code>'price'</code> のように引用符で囲まれた名前が、問題の変数や項目です。"),
      T('最初のエラーから直す', 'Fix the first error first', 'エラーが10個出ても、1つ目が原因で残りが連鎖していることが多いです。上（Python は下）の1つ目から直します。'),
      T('英語のまま検索する', 'Search in English', 'エラー文は、自分の変数名などを除いて英語のまま検索すると、同じ悩みの解決例が見つかります。'),
    ] },
  ]});
moveAfter('read', 'howto'); moveAfter('css', 'js'); moveAfter('ts', 'framework');
})();
