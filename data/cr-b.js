/* コードの読み方辞典 — B: 配列とオブジェクト / 待つ処理（非同期） / 言語の見分け方 / AIのコードを確かめる */
(function(){
const { $, $$, esc, seg } = KIT;
const { S, C, T, L, verdict, hl, codeList, fmt, tracer, anat } = CRH;
const CK = (name, en, desc, prompt, tags) => ({ name, en, desc, prompt, tags, check:true });

/* ================= 5. 配列とオブジェクト ================= */
const GOODS = [
  { name:'りんご', price:120, stock:3 }, { name:'バナナ', price:90, stock:0 }, { name:'メロン', price:980, stock:1 },
  { name:'いちご', price:450, stock:5 }, { name:'みかん', price:60, stock:0 },
];
const card = (g, cls) => `<div class="cr-item ${cls || ''}"><b>${esc(g.name)}</b><small>${g.price}円・在庫${g.stock}</small></div>`;
const chip = (v, cls) => `<div class="cr-item ${cls || ''}"><b>${esc(fmt(v))}</b></div>`;
const PIPE = [
  { l:'元のデータ', code:L('const goods = [', "  { name: 'りんご', price: 120, stock: 3 },", '  …（全部で5件）', '];'),
    show:() => GOODS.map(g => card(g)).join(''), res:GOODS, note:'オブジェクト（1件の商品）が5つ入った配列です。APIから返ってくるデータの多くはこの形です。' },
  { l:'filter 絞り込む', code:L('goods', '  .filter(g => g.stock > 0)'),
    show:() => GOODS.map(g => card(g, g.stock > 0 ? 'hit' : 'out')).join(''), res:GOODS.filter(g => g.stock > 0), note:'<b>filter</b> は、条件が true の要素だけを残した<b>新しい配列</b>を返します。<code>g =&gt; g.stock &gt; 0</code> は「g を受け取って、在庫が0より多いか」を返す関数です。' },
  { l:'map 変換する', code:L('goods', '  .filter(g => g.stock > 0)', '  .map(g => Math.round(g.price * 1.1))'),
    show:() => GOODS.filter(g => g.stock > 0).map(g => chip(Math.round(g.price * 1.1), 'hit')).join(''), res:GOODS.filter(g => g.stock > 0).map(g => Math.round(g.price * 1.1)), note:'<b>map</b> は、全部の要素を同じルールで<b>変換した新しい配列</b>を返します。数は変わりません（3件 → 3件）。ここでは税込みの値段に。' },
  { l:'reduce まとめる', code:L('goods', '  .filter(g => g.stock > 0)', '  .map(g => Math.round(g.price * 1.1))', '  .reduce((sum, p) => sum + p, 0)'),
    show:() => `<span class="cr-big">${GOODS.filter(g => g.stock > 0).map(g => Math.round(g.price * 1.1)).reduce((s, p) => s + p, 0)}</span>`, res:GOODS.filter(g => g.stock > 0).map(g => Math.round(g.price * 1.1)).reduce((s, p) => s + p, 0), note:'<b>reduce</b> は、配列を<b>1つの値にまとめます</b>。<code>sum</code> がこれまでの合計、<code>p</code> が今の要素、最後の <code>0</code> が合計の初めの値です。<b>上から順に「絞る → 変える → まとめる」</b>と読みます。' },
  { l:'find 1つ探す', code:L('goods.find(g => g.price > 400)'),
    show:() => { const f = GOODS.find(g => g.price > 400); return GOODS.map(g => card(g, g === f ? 'hit' : 'out')).join(''); }, res:GOODS.find(g => g.price > 400), note:'<b>find</b> は条件に合う<b>最初の1件</b>を返します（配列ではなく要素そのもの）。いちごも 400 円より高いですが、先に見つかったメロンだけ。見つからないと <code>undefined</code>。' },
  { l:'sort 並べる', code:L('[...goods].sort((a, b) => a.price - b.price)'),
    show:() => [...GOODS].sort((a, b) => a.price - b.price).map(g => card(g)).join(''), res:[...GOODS].sort((a, b) => a.price - b.price).map(g => g.name), note:'<b>sort</b> は並べ替え。<code>a.price - b.price</code> で安い順（逆にすると高い順）。sort は<b>元の配列を書き換える</b>ので、<code>[...goods]</code> でコピーしてから並べています。' },
  { l:'some / includes', code:L('goods.some(g => g.stock === 0)', "['りんご', 'メロン'].includes('バナナ')"),
    show:() => GOODS.map(g => card(g, g.stock === 0 ? 'hit' : '')).join(''), res:[GOODS.some(g => g.stock === 0), ['りんご', 'メロン'].includes('バナナ')], note:'<b>some</b> は「1つでも当てはまるか」、<b>every</b> は「全部当てはまるか」、<b>includes</b> は「その値が入っているか」を true / false で返します。' },
];

// JSON の木。値を押すと、取り出し方（パス）を表示
const RESP = { user:{ id:7, name:'アキ', tags:['admin', 'beta'] }, orders:[{ id:101, total:1500, items:[{ name:'ノート', qty:2 }] }, { id:102, total:980, items:[] }], 'last-login':'2026-11-20', next:null };
const acc = (k) => typeof k === 'number' ? `[${k}]` : /^[A-Za-z_$][\w$]*$/.test(k) ? `.${k}` : `['${k}']`;
function jrows(v, keys, key, ind, last){
  const pad = '  '.repeat(ind), k = key === null || typeof key === 'number' ? '' : `<span class="key">"${esc(key)}"</span>: `, cm = last ? '' : ',', dk = esc(JSON.stringify(keys));
  if (v !== null && typeof v === 'object'){
    const arr = Array.isArray(v), ent = arr ? v.map((x, i) => [i, x]) : Object.entries(v);
    if (!ent.length) return `<div class="row">${pad}${k}<button type="button" data-k="${dk}">${arr ? '[]' : '{}'}</button>${cm}</div>`;
    return `<div class="row">${pad}${k}<button type="button" data-k="${dk}">${arr ? '[' : '{'}</button></div>` + ent.map(([kk, x], i) => jrows(x, keys.concat([kk]), kk, ind + 1, i === ent.length - 1)).join('') + `<div class="row">${pad}${arr ? ']' : '}'}${cm}</div>`;
  }
  return `<div class="row">${pad}${k}<button type="button" class="${typeof v === 'string' ? 's' : typeof v === 'number' ? 'n' : ''}" data-k="${dk}">${esc(JSON.stringify(v))}</button>${cm}</div>`;
}

TABS.push({ id:'data', label:'配列とオブジェクト', icon:'🗂',
  intro:'実際のアプリのデータは、ほとんどが<b>配列（一覧）</b>と<b>オブジェクト（項目のまとまり）</b>の組み合わせです。APIから返ってくる JSON もこの形。<b>「どこにあるデータを、どう取り出して、どう加工しているか」</b>が読めると、画面に表示される中身の出どころが分かります。',
  sections:[
    C('触って理解する', [
      { name:'配列を加工する（filter・map・reduce）', en:'Array methods', h:440, wide:true, tags:['基本','体験','最重要'],
        demo:'<div class="kt"><div class="sg"></div><div class="kt-split" style="display:flex;gap:8px;flex:1;min-height:0"><div class="cb" style="flex:1 1 0;display:flex;min-height:0"></div><div style="flex:1 1 0;display:flex;flex-direction:column;gap:6px;min-height:0"><div class="cr-items it" style="flex:1;min-height:0;overflow:auto"></div><div class="kt-code res"></div></div></div><div class="kt-verdict cr-note"></div></div>',
        init:(el) => { const s = seg(PIPE.map(p => p.l), (i) => { const p = PIPE[i]; $(el, '.cb').innerHTML = codeList(p.code); $(el, '.cb ol').style.flex = '1'; $(el, '.it').innerHTML = p.show(); $(el, '.res').textContent = '→ ' + fmt(p.res); $(el, '.cr-note').innerHTML = p.note; }, 0); $(el, '.sg').append(s.el); },
        desc:'AIのコードには <code>.filter(…).map(…)</code> のように<b>メソッドが鎖のようにつながった形</b>がよく出ます。上から1行ずつ「何が残り、何に変わるか」を追えば読めます。',
        prompt:'このコードの配列の処理（filter・map・reduce などのつながり）を、1段ずつ「入ってくるデータ → 出ていくデータ」の例つきで説明して。\n【コード】' },
      { name:'JSON から値を取り出す', en:'Reading JSON paths', h:460, tags:['基本','体験','最重要'],
        demo:'<div class="kt"><div class="kt-lbl">API から返ってきたデータ（data）。値やかっこを押すと、取り出し方が出ます</div><div class="cr-json"></div><div class="kt-verdict cr-res"><span class="kt-note">↑ どれか押してください</span></div></div>',
        init:(el) => { const box = $(el, '.cr-json'); box.innerHTML = jrows(RESP, [], null, 0, true);
          box.onclick = (e) => { const b = e.target.closest('button'); if (!b) return; $$(box, 'button').forEach(x => x.classList.toggle('on', x === b));
            const keys = JSON.parse(b.dataset.k); let v = RESP; keys.forEach(k => { v = v[k]; });
            const path = 'data' + keys.map(acc).join(''), steps = keys.map(k => typeof k === 'number' ? `<b>${k}番目</b>` : esc(k)).join(' → ');
            const arrIn = keys.some(k => typeof k === 'number'), hy = keys.some(k => typeof k === 'string' && !/^[A-Za-z_$][\w$]*$/.test(k));
            let tip = keys.length ? `data → ${steps}` : 'データ全体です。';
            if (hy) tip += '<br>名前に - が入っているので <code>.last-login</code> とは書けず、<code>[\'last-login\']</code> と書きます。';
            if (arrIn) tip += '<br>配列は<b>0番目から</b>数えます。中身が空のこともあるなら <code>?.</code> を使うと安全です（例：<code>data.orders[1].items[0]?.name</code>）。';
            if (v === null) tip += '<br><b>null</b>＝「次のページはない」のように、わざと空にしてある値です。';
            if (Array.isArray(v) && !v.length) tip += '<br><b>空の配列</b>。<code>[0]</code> を読むと undefined、その先の <code>.name</code> を読むとエラーになります。';
            $(el, '.cr-res').innerHTML = `<div class="cr-path">${esc(path)}</div><div>→ ${esc(fmt(v))}</div><div class="kt-note">${tip}</div>`; }; },
        desc:'<code>.</code> は「〜の」、<code>[0]</code> は「0番目の」と読みます。<code>data.orders[0].items[0].name</code> は「data の orders の0番目の items の0番目の name」。',
        prompt:'この API の返り値（JSON）から、【欲しい値】を取り出すコードを書いて。途中が空・null のときにエラーにならないようにして、その場合に何を表示するかも決めて。\n【JSON の例】' },
      { name:'コピーしたつもりが同じもの（参照）', en:'Reference vs copy', h:460, wide:true, tags:['体験','注意'], demo:'<div class="t"></div>',
        init:(el) => tracer($(el, '.t'), {
          code:L('const a = [1, 2];', 'const b = a;', 'b.push(3);', 'console.log(a);', 'const c = [...a];', 'c.push(4);', 'console.log(a, c);'),
          run:(R) => {
            R(1, '配列 [1, 2] を作って a に入れます。', { a:[1, 2] });
            R(2, '<code>b = a</code> は<b>コピーではありません</b>。同じ配列に「b」という名札をもう1枚付けただけです。', { a:[1, 2], b:[1, 2] });
            R(3, 'b に 3 を追加……', { a:[1, 2, 3], b:[1, 2, 3] }, { cls:'warn' });
            R.log([1, 2, 3]); R(4, '<b>a まで [1, 2, 3] に</b>。a と b は同じものを指しているからです。配列・オブジェクトは「中身」ではなく「置き場所」が渡されます（<b>参照</b>）。', { a:[1, 2, 3], b:[1, 2, 3] }, { cls:'bad' });
            R(5, '<code>[...a]</code>（スプレッド）で中身を広げて、<b>新しい配列</b>を作ります。これが本当のコピー。', { a:[1, 2, 3], b:[1, 2, 3], c:[1, 2, 3] });
            R(6, 'c に 4 を追加。', { a:[1, 2, 3], b:[1, 2, 3], c:[1, 2, 3, 4] });
            R.log('[1, 2, 3] [1, 2, 3, 4]'); R(7, '今度は a は変わりません。React で「state を変えたのに画面が変わらない」原因の多くがこれです（同じ配列を書き換えている）。', { a:[1, 2, 3], b:[1, 2, 3], c:[1, 2, 3, 4] }, { cls:'ok' });
          } }),
        desc:'数や文字は代入するとコピーされますが、<b>配列とオブジェクトは同じものを共有</b>します。<code>[...a]</code>・<code>{ ...obj }</code> は1段目だけのコピー、入れ子まで丸ごとコピーするなら <code>structuredClone(obj)</code>。',
        prompt:'このコードで、配列やオブジェクトを「コピーしたつもりで元を書き換えている」所がないか確認して。React の state を直接書き換えている所もあれば教えて。\n【コード】' },
    ], null, true),
    S('配列', [
      T('配列', 'Array', '<code>[\'りんご\', \'バナナ\']</code> のように順番のある並び。名前は複数形（users・items）が多いです。', null, ['基本']),
      T('インデックス（番号）', 'Index', '<b>0から</b>数えます。<code>list[0]</code> が最初、<code>list[list.length - 1]</code> や <code>list.at(-1)</code> が最後。', null, ['基本']),
      T('length', 'length', '要素の数。空なら 0 なので、<code>if (list.length === 0)</code> で「0件のとき」の表示を出せます。'),
      T('push / pop', 'push / pop', '<code>push</code> は最後に追加、<code>pop</code> は最後を取り出す。<b>元の配列を書き換えます</b>。'),
      T('map', 'map', '全部の要素を変換した新しい配列を返す。React で一覧を表示する <code>items.map(item =&gt; &lt;li&gt;…&lt;/li&gt;)</code> は毎日のように見ます。', null, ['最重要']),
      T('filter', 'filter', '条件に合う要素だけを残した新しい配列を返す。'),
      T('find / findIndex', 'find', '条件に合う最初の1件（の番号）を返す。見つからないと undefined（-1）。'),
      T('reduce', 'reduce', '配列を1つの値（合計・件数の集計など）にまとめる。<code>(合計, 今の要素) =&gt; 新しい合計</code> と初めの値で読みます。'),
      T('sort', 'sort', '並べ替え。<b>元の配列を書き換える</b>うえ、何も指定しないと数も「文字の順」で並ぶ（10 が 9 より前）ので、<code>(a, b) =&gt; a - b</code> を付けます。', null, ['注意']),
      T('slice と splice', 'slice / splice', '<code>slice</code> は一部を切り出した新しい配列（元はそのまま）、<code>splice</code> は元の配列から削除・挿入する。名前が似ているので要注意。'),
      T('includes / some / every', 'includes', '入っているか／1つでも合うか／全部合うかを true・false で返す。'),
      T('forEach', 'forEach', '全要素に処理をするだけで、何も返さない（undefined）。'),
    ]),
    S('オブジェクトと JSON', [
      T('オブジェクト', 'Object', "<code>{ name: 'アキ', age: 20 }</code>：キー（名前）と値の組。<code>user.name</code> で取り出します。", null, ['基本']),
      T('プロパティ', 'Property', 'オブジェクトの中の1つ1つの項目（name や age）。'),
      T('ドット記法とかっこ記法', 'Dot / bracket', '<code>user.name</code> と <code>user[\'name\']</code> は同じ。名前に - や空白が入る、名前を変数で指定する、ときはかっこ記法。'),
      T('分割代入', 'Destructuring', "<code>const { name, age } = user;</code> は <code>const name = user.name;</code> を項目ぶんまとめた書き方。配列なら <code>const [first, second] = list;</code>。", null, ['最重要']),
      T('スプレッド構文', 'Spread', '<code>{ ...user, age: 21 }</code> は「user の中身を全部広げて、age だけ上書きした新しいオブジェクト」。'),
      T('オプショナルチェーン ?.', 'Optional chaining', '<code>user?.address?.city</code>：途中が null・undefined でもエラーにせず undefined を返す。<b>データが無いかもしれない所</b>の目印です。'),
      T('?? と ||', 'Nullish coalescing', "<code>count ?? 0</code> は null・undefined のときだけ 0。<code>count || 0</code> は 0 や '' のときも 0 になるので、0 を正しく扱いたいなら ??。"),
      T('JSON', 'JSON', 'データをやり取りするための文字の形式。見た目はオブジェクトとほぼ同じですが、<b>キーも " " で囲む</b>、関数やコメントは書けない、などの決まりがあります。', null, ['基本']),
      T('JSON.parse / JSON.stringify', 'Parse / stringify', '<code>JSON.parse</code> は文字 → データ、<code>JSON.stringify</code> はデータ → 文字。localStorage に保存するときや API とのやり取りで使います。'),
      T('Object.keys / entries', 'Object.keys', 'オブジェクトのキーの一覧・[キー, 値] の組の一覧を配列で返す。オブジェクトをくり返し処理したいときに使います。'),
    ]),
    { title:'配列の処理の早見表', note:'「元の配列を書き換えるか」は、バグの原因になりやすい所です。',
      table:{ head:['書き方', '返すもの', '元の配列を書き換える？'], rows:[
        ['<code>map(x =&gt; …)</code>', '変換した新しい配列（同じ件数）', 'いいえ'],
        ['<code>filter(x =&gt; 条件)</code>', '条件に合う要素の新しい配列', 'いいえ'],
        ['<code>find(x =&gt; 条件)</code>', '最初に合った1件（なければ undefined）', 'いいえ'],
        ['<code>reduce((acc, x) =&gt; …, 初め)</code>', '1つの値', 'いいえ'],
        ['<code>some</code> / <code>every</code> / <code>includes</code>', 'true / false', 'いいえ'],
        ['<code>slice(開始, 終わり)</code>', '切り出した新しい配列', 'いいえ'],
        ['<code>forEach(x =&gt; …)</code>', 'なし（undefined）', 'いいえ（中で書き換えれば別）'],
        ['<code>push</code> / <code>pop</code> / <code>shift</code> / <code>unshift</code>', '長さ / 取り出した要素', '<b>はい</b>'],
        ['<code>sort</code> / <code>reverse</code>', '並べ替えた同じ配列', '<b>はい</b>（新しい <code>toSorted</code> は「いいえ」）'],
        ['<code>splice(位置, 個数, …)</code>', '取り除いた要素の配列', '<b>はい</b>'],
      ] } },
  ]});

/* ================= 6. 待つ処理（非同期） ================= */
TABS.push({ id:'async', label:'待つ処理（非同期）', icon:'⏳',
  intro:'通信・タイマー・ファイルの読み込みなど<b>時間がかかる処理は、終わるのを待たずに次の行へ進みます</b>。これを非同期と呼びます。「書いた順番と動く順番が違う」「値が undefined になる」の多くはここが原因です。<code>async</code>・<code>await</code>・<code>.then</code> を見たら、<b>どこで待っていて、どこで待っていないか</b>を読みます。',
  sections:[
    C('触って理解する', [
      { name:'書いた順番と動く順番が違う', en:'Event loop', h:480, wide:true, tags:['体験','最重要'], demo:'<div class="t"></div>',
        init:(el) => tracer($(el, '.t'), {
          code:L("console.log('A');", 'setTimeout(() => {', "  console.log('B');", '}, 0);', 'Promise.resolve().then(() => {', "  console.log('C');", '});', "console.log('D');"),
          speed:1700,
          run:(R) => {
            const G = 'プログラム全体', TB = { t:'タイマー：B を表示' }, PC = { t:'Promise：C を表示', mi:true };
            R.log('A'); R(1, 'A を表示。', {}, { stack:[G], queue:[] });
            R(2, 'setTimeout は「0ミリ秒<b>後に</b>この関数を実行して」という<b>予約</b>です。中身（3行目）は<b>今は実行しません</b>。', {}, { stack:[G], queue:[TB] });
            R(5, '.then も「終わったら実行して」という予約。Promise の予約は、<b>タイマーより先に</b>処理される特別な列に並びます。', {}, { stack:[G], queue:[PC, TB] });
            R.log('D'); R(8, 'D を表示。これで上から下まで読み終わりました。', {}, { stack:[G], queue:[PC, TB] });
            R(0, '今の処理がすべて終わってから、予約を順に実行します。この仕組みを<b>イベントループ</b>と呼びます。', {}, { stack:[], queue:[PC, TB] });
            R.log('C'); R(6, 'まず Promise の予約：C。', {}, { stack:['then に渡した関数'], queue:[TB] });
            R.log('B'); R(3, '最後にタイマー：B。0ミリ秒でも「今の処理が終わったあと」です。', {}, { stack:['setTimeout に渡した関数'], queue:[] });
            R(0, '表示の順番は <b>A → D → C → B</b>。書いた順番と動く順番が違う――これが非同期です。', {}, { stack:[], queue:[], cls:'warn' });
          } }),
        desc:'クリック・通信の結果・タイマーは、すべて「予約」として後から実行されます。<b>関数を渡しているだけの行（コールバック）は、その場では動かない</b>と覚えておくと読み違えません。',
        prompt:'このコードで、各 console.log がどの順番で表示されるか、理由つきで説明して。同期で動く所と、あとで動く所（コールバック・Promise）を分けて。\n【コード】' },
      { name:'await を忘れると', en:'Forgetting await', h:420, tags:['体験','注意','最重要'],
        demo:'<div class="kt"><div class="kt-row"><span class="sg"></span><button type="button" class="kt-btn sm pri run">▶ 実行</button></div><div class="cb" style="display:flex"></div><div class="cr-lanes"><span>通信</span><div class="bar"><i></i><span class="tm"></span></div></div><div class="cr-box" style="flex:1;min-height:0;overflow:auto"><div class="kt-lbl">出力</div><pre class="cr-out"></pre></div><div class="kt-verdict cr-note"></div></div>',
        init:(el) => { let mode = 0, timers = [];
          const CODE = [L('async function show() {', '  const data = fetchUser();   // 1.5秒かかる', '  console.log(data);', '  console.log(data.name);', '}'), L('async function show() {', '  const data = await fetchUser();', '  console.log(data);', '  console.log(data.name);', '}')];
          const out = $(el, '.cr-out'), bar = $(el, '.bar i'), tm = $(el, '.tm'), note = $(el, '.cr-note');
          const clear = () => { timers.forEach(clearTimeout); timers = []; bar.style.transition = 'none'; bar.style.width = '0'; tm.textContent = ''; };
          const put = (t, cls) => { out.insertAdjacentHTML('beforeend', `<span class="${cls || ''}">${esc(t)}</span>`); };
          const reset = () => { clear(); out.innerHTML = '<span class="kt-note">▶ 実行を押してください</span>'; verdict(note, '', mode ? '<b>await</b> は「この Promise が終わるまで、この関数の続きを止めて待つ」という意味です。' : '<code>fetchUser()</code> は時間のかかる通信。<b>await を付けずに</b>結果を使うとどうなるでしょう？'); $(el, '.cb').innerHTML = codeList(CODE[mode]); $(el, '.cb ol').style.flex = '1'; };
          $(el, '.sg').append(seg(['await なし', 'await あり'], (i) => { mode = i; reset(); }, 0).el);
          $(el, '.run').onclick = () => { reset(); out.innerHTML = ''; void bar.offsetWidth; bar.style.transition = 'width 1.5s linear'; bar.style.width = '100%';
            if (!mode){ put('Promise {<pending>}', 'new'); put('undefined', 'err'); tm.textContent = '通信中…';
              verdict(note, 'bad', '通信を待たずに次の行へ進んだので、data は<b>「あとで結果が入る予約券（Promise）」</b>のまま。<code>data.name</code> は undefined です。');
              timers.push(setTimeout(() => { bar.style.transition = 'none'; bar.style.width = '100%'; tm.textContent = '1.5秒'; put('（1.5秒後に通信は終わったが、結果を受け取る人がいない）'); }, 1550)); }
            else { put('（待っています… 下の行はまだ実行されません）'); tm.textContent = '通信中…';
              timers.push(setTimeout(() => { bar.style.transition = 'none'; bar.style.width = '100%'; tm.textContent = '1.5秒'; out.innerHTML = ''; put("{ name: 'アキ', age: 20 }", 'new'); put('アキ', 'new'); verdict(note, 'ok', '通信が終わってから次の行に進んだので、中身を使えました。await は <b>async の付いた関数の中</b>でだけ使えます。'); }, 1550)); } };
          return clear; },
        desc:'<code>Promise {&lt;pending&gt;}</code> や <code>[object Promise]</code> と表示されたら、<b>await（または .then）を付け忘れている</b>合図です。',
        prompt:'このコードで、Promise を返す関数（fetch・データベース・ファイル読み込みなど）に await を付け忘れている所がないか確認して。forEach の中の await のように、待っているつもりで待てていない所も探して。\n【コード】' },
      { name:'順番に待つか、同時に待つか', en:'Sequential vs parallel', h:400, tags:['体験'],
        demo:'<div class="kt"><div class="kt-row"><span class="sg"></span><button type="button" class="kt-btn sm pri run">▶ 実行</button></div><div class="cb" style="display:flex"></div><div class="cr-lanes ln"></div><div class="kt-verdict cr-note"></div></div>',
        init:(el) => { let mode = 0, timers = [];
          const JOBS = [['ユーザー', 1.0], ['投稿', 1.5], ['天気', 0.8]], MAX = 3.3;
          const CODE = [L('const a = await getUser();     // 1.0秒', 'const b = await getPosts();    // 1.5秒', 'const c = await getWeather();  // 0.8秒'), L('const [a, b, c] = await Promise.all([', '  getUser(), getPosts(), getWeather(),', ']);')];
          const ln = $(el, '.ln'), note = $(el, '.cr-note');
          const reset = () => { timers.forEach(clearTimeout); timers = []; $(el, '.cb').innerHTML = codeList(CODE[mode]); $(el, '.cb ol').style.flex = '1';
            ln.innerHTML = JOBS.map(([n]) => `<span>${n}</span><div class="bar"><i></i><span></span></div>`).join('') + '<span class="h">合計</span><span class="h tot" style="grid-column:auto"></span>';
            verdict(note, '', mode ? '<b>Promise.all</b> は、全部の通信を<b>同時に始めて</b>、全部終わるのを待ちます。' : '1つずつ await すると、<b>前の通信が終わるまで次が始まりません</b>。'); };
          $(el, '.sg').append(seg(['1つずつ await', 'Promise.all'], (i) => { mode = i; reset(); }, 0).el);
          $(el, '.run').onclick = () => { reset(); let t0 = 0; const bars = $$(ln, '.bar');
            JOBS.forEach(([, d], i) => { const start = mode ? 0 : t0, b = bars[i], bi = $(b, 'i'); bi.style.left = (start / MAX * 100) + '%'; bi.style.transition = 'none'; bi.style.width = '0';
              void bi.offsetWidth; bi.style.transition = `width ${d}s linear ${start}s`; bi.style.width = (d / MAX * 100) + '%';
              timers.push(setTimeout(() => { bi.style.transition = 'none'; bi.style.width = (d / MAX * 100) + '%'; $(b, 'span').textContent = d.toFixed(1) + '秒'; }, (start + d) * 1000)); t0 += d; });
            const total = mode ? Math.max(...JOBS.map(j => j[1])) : t0;
            timers.push(setTimeout(() => { $(el, '.tot').textContent = total.toFixed(1) + '秒'; verdict(note, mode ? 'ok' : 'warn', mode ? `いちばん遅い通信（1.5秒）のぶんだけで終わりました。<b>お互いに関係ない通信</b>は、まとめて待つと速くなります。` : `1.0 + 1.5 + 0.8 = <b>${total.toFixed(1)}秒</b>。b を取るのに a の結果がいらないなら、待つ必要はありません。`); }, total * 1000 + 50)); };
          return () => timers.forEach(clearTimeout); },
        desc:'<b>前の結果を次で使うときだけ</b>順番に await します（ログイン → そのユーザーの投稿、など）。関係ない通信は <code>Promise.all</code> でまとめて待ちます。',
        prompt:'このコードで、順番に await しているけれど、お互いの結果を使っていない通信がないか確認して。あれば Promise.all でまとめた版を作って、1つが失敗したときの扱いも決めて。\n【コード】' },
    ], null, true),
    S('非同期の言葉', [
      T('同期と非同期', 'Sync / async', '同期は「終わるまで待ってから次へ」、非同期は「始めておいて、終わったら知らせてもらう」。通信やタイマーは非同期です。', null, ['基本']),
      T('Promise', 'Promise', '「あとで結果が入る予約券」。待ち中（pending）→ 成功（fulfilled）か失敗（rejected）のどちらかになります。', null, ['最重要']),
      T('async', 'async', '関数の前に付けると、その関数は<b>必ず Promise を返す</b>ようになり、中で await が使えます。'),
      T('await', 'await', '「この Promise が終わるまで、この関数の続きを止めて待つ」。止まるのはその関数だけで、画面全体は固まりません。', null, ['最重要']),
      T('.then / .catch', 'then / catch', '<code>fetch(url).then(res =&gt; …).catch(err =&gt; …)</code>：await を使わない書き方。then の中は「終わったあと」、catch の中は「失敗したとき」。'),
      T('fetch', 'fetch', 'ネットから データを取ってくる命令。<code>const res = await fetch(url); const data = await res.json();</code> と<b>2回待つ</b>のが決まった形です。', null, ['基本']),
      T('try / catch / finally', 'Error handling', '<code>try</code> の中でエラーが起きたら <code>catch</code> へ。<code>finally</code> は成功でも失敗でも最後に実行（読み込み中の表示を消す、など）。'),
      T('throw', 'throw', '自分でエラーを起こす命令。<code>if (!res.ok) throw new Error(\'取得に失敗\');</code> のように、失敗を catch に知らせます。'),
      T('res.ok', 'Response.ok', 'fetch は <b>404 や 500 でもエラーになりません</b>。<code>res.ok</code>（200番台なら true）を確かめないと、失敗に気づけません。', null, ['注意']),
      T('Promise.all', 'Promise.all', '複数の Promise を同時に待つ。1つでも失敗すると全体が失敗するので、別々に結果を知りたいときは <code>Promise.allSettled</code>。'),
      T('setTimeout / setInterval', 'Timers', '「○ミリ秒後に1回」「○ミリ秒ごとに」関数を実行する予約。止めるときは clearTimeout / clearInterval。'),
      T('コールバック地獄', 'Callback hell', 'コールバックの中にコールバック…と右へ右へ深くなる古い書き方。async / await に書き直すと上から下へ読めます。'),
      T('forEach の中の await', 'await in forEach', 'forEach は待ってくれないので、中で await しても順番どおりに終わりません。<code>for (const x of list) { await … }</code> か Promise.all を使います。', null, ['注意']),
      T('読み込み中の状態', 'Loading state', '待っている間の表示（くるくる・スケルトン）と、二重送信を防ぐボタンの無効化。非同期のコードには、たいてい <code>isLoading</code> のような変数がセットで出てきます。'),
      T('レースコンディション', 'Race condition', '後から始めた通信が先に終わり、古い結果で上書きしてしまうバグ。検索欄で速く打つと起きやすい。'),
    ]),
  ]});

/* ================= 7. 言語の見分け方 ================= */
const QUIZ = [
  ['JavaScript', 'js', L('const total = items.reduce((s, x) => s + x.price, 0);', 'console.log(total);'), 'const・=>・console.log は JavaScript の目印です。'],
  ['TypeScript', 'js', L('type User = { name: string; age?: number };', 'function greet(u: User): string {', "  return 'Hi ' + u.name;", '}'), '<code>: string</code> のような<b>型の注釈</b>や type・interface があれば TypeScript。'],
  ['Python', 'py', L('def total(items):', "    return sum(x['price'] for x in items)", '', 'print(total(items))'), 'def・行末のコロン（:）・字下げ・print は Python。{ } を使いません。'],
  ['HTML', 'plain', L('<section class="card">', '  <h2>お知らせ</h2>', '  <p>明日は休みです</p>', '</section>'), '<code>&lt;タグ&gt;</code> で囲む形は HTML。画面の骨組みです。'],
  ['CSS', 'plain', L('.card {', '  padding: 16px;', '  border-radius: 8px;', '}', '.card:hover { color: red; }'), '<code>セレクタ { 名前: 値; }</code> の形は CSS。見た目の指定です。'],
  ['SQL', 'sql', L('SELECT name, price', 'FROM goods', 'WHERE stock > 0', 'ORDER BY price DESC;'), 'SELECT・FROM・WHERE は SQL（データベースへの問い合わせ）。'],
  ['JSON', 'js', L('{', '  "name": "アキ",', '  "tags": ["admin"],', '  "active": true', '}'), 'キーも " " で囲み、関数も代入もない「データだけ」の形は JSON。'],
  ['YAML', 'py', L('name: deploy', 'on: push', 'jobs:', '  build:', '    runs-on: ubuntu-latest'), '「名前: 値」を字下げで入れ子にする設定ファイル。GitHub Actions や docker-compose で使います。'],
  ['シェル', 'sh', L('cd my-app', 'npm install', 'npm run dev'), 'cd・npm・git など、ターミナルに打つコマンド。1行が1つの命令です。'],
  ['JSX（React）', 'js', L('function Card({ title }) {', '  return <div className="card">{title}</div>;', '}'), 'JavaScript の中に HTML のようなタグがあり、class ではなく <b>className</b>。React の JSX です。'],
  ['Markdown', 'plain', L('# 見出し', '', '- 箇条書き', '- **太字**', '', '[リンク](https://example.com)'), '# や - や ** で書く文章の書式。README.md など。'],
  ['.env', 'plain', L('DATABASE_URL=postgres://localhost/app', 'NEXT_PUBLIC_SITE_NAME=My App'), '<code>大文字の名前=値</code> が並ぶのは環境変数のファイル。秘密の値が入るので公開しません。'],
];
const SAME = [
  ['JavaScript', 'js', L('const names = goods', '  ⟦f|.filter(g => g.stock > 0)⟧', '  ⟦s|.sort((a, b) => a.price - b.price)⟧', '  ⟦m|.map(g => g.name)⟧;')],
  ['TypeScript', 'js', L('type Good = { name: string; price: number; stock: number };', '', 'const names: string[] = goods', '  ⟦f|.filter((g: Good) => g.stock > 0)⟧', '  ⟦s|.sort((a, b) => a.price - b.price)⟧', '  ⟦m|.map((g) => g.name)⟧;')],
  ['Python', 'py', L('⟦f|in_stock = [g for g in goods if g["stock"] > 0]⟧', '⟦s|in_stock.sort(key=lambda g: g["price"])⟧', '⟦m|names = [g["name"] for g in in_stock]⟧')],
  ['SQL', 'sql', L('⟦m|SELECT name⟧', 'FROM goods', '⟦f|WHERE stock > 0⟧', '⟦s|ORDER BY price;⟧')],
  ['Googleスプレッドシート', 'plain', L('=⟦s|SORT(⟧', '  ⟦f|FILTER(⟧⟦m|A2:A6⟧⟦f|, C2:C6 > 0)⟧⟦s|,⟧', '  ⟦s|FILTER(B2:B6, C2:C6 > 0), TRUE)⟧')],
];
TABS.push({ id:'langs', label:'言語の見分け方', icon:'🔤',
  intro:'AIは、頼んだ内容に合わせていろいろな言語でコードを書きます。<b>まず「これは何語で、どこで動くものか」</b>が分かれば、調べ方も、AIへの聞き方も決まります。見た目の手がかりと、TypeScript・React（JSX）の読み方をまとめました。',
  sections:[
    C('触って理解する', [
      { name:'何の言語？クイズ', en:'Language quiz', h:430, tags:['体験','基本'],
        demo:'<div class="kt"><div class="kt-row"><span class="kt-lbl q"></span><span class="cr-score sc" style="margin-left:auto"></span></div><div class="cb" style="display:flex;flex:1;min-height:0"></div><div class="cr-opts op"></div><div class="kt-verdict cr-note"></div><div class="kt-row"><button type="button" class="kt-btn sm pri nx">次の問題 ▶</button></div></div>',
        init:(el) => { let k = 0, score = 0, done = false; const order = QUIZ.map((_, i) => i);
          const show = () => { const [ans, lang, code] = QUIZ[order[k]]; done = false; $(el, '.q').textContent = `第 ${k + 1} 問 / ${QUIZ.length}`; $(el, '.sc').textContent = `正解 ${score}`;
            $(el, '.cb').innerHTML = codeList(code, lang); $(el, '.cb ol').style.flex = '1';
            const others = QUIZ.map(q => q[0]).filter(n => n !== ans).sort(() => Math.random() - .5).slice(0, 3), opts = others.concat([ans]).sort(() => Math.random() - .5);
            $(el, '.op').innerHTML = opts.map(o => `<button type="button" class="kt-btn sm">${esc(o)}</button>`).join('');
            verdict($(el, '.cr-note'), '', '何の言語（書式）でしょう？');
            $$(el, '.op button').forEach(b => b.onclick = () => { if (done) return; done = true; const ok = b.textContent === ans; if (ok) score++; b.classList.add(ok ? 'ok' : 'ng'); $$(el, '.op button').forEach(x => { if (x.textContent === ans) x.classList.add('ok'); });
              $(el, '.sc').textContent = `正解 ${score}`; verdict($(el, '.cr-note'), ok ? 'ok' : 'bad', (ok ? '正解！ ' : `答えは <b>${esc(ans)}</b>。 `) + QUIZ[order[k]][3]); }); };
          $(el, '.nx').onclick = () => { k++; if (k >= QUIZ.length){ verdict($(el, '.cr-note'), 'ok', `全 ${QUIZ.length} 問で <b>${score} 問</b>正解。もう一度どうぞ。`); k = 0; score = 0; setTimeout(show, 1600); return; } show(); };
          show(); },
        desc:'言語が分かったら、エラーや分からない書き方を調べるときに<b>「言語名＋書き方」</b>で検索します（例：「JavaScript ?. とは」）。',
        prompt:'このコードは何の言語・何のフレームワークで書かれている？そう判断した手がかりと、どこで（ブラウザ・サーバー・ターミナルなど）動くものかも教えて。\n【コード】' },
      { name:'同じ処理を言語ごとに比べる', en:'Same task, different languages', h:420, tags:['体験'],
        demo:'<div class="kt"><div class="kt-lbl">在庫がある商品の名前を、安い順に並べる</div><div class="sg1"></div><div class="ab" style="flex:1;min-height:0;position:relative"></div></div>',
        init:(el) => { const P = (lang) => [
            ['f', '絞り込む', { JavaScript:'filter で「在庫 &gt; 0」だけ残す。', TypeScript:'JavaScript と同じ。<code>(g: Good)</code> の部分が型の注釈。', Python:'<b>リスト内包表記</b> <code>[g for g in … if 条件]</code> で絞り込み。', SQL:'<b>WHERE</b> で行を絞り込む。', 'Googleスプレッドシート':'<b>FILTER(範囲, 条件)</b> で行を絞り込む。' }[lang]],
            ['s', '並べる', { JavaScript:'sort に「引き算」の比べ方を渡して安い順。', TypeScript:'JavaScript と同じ。', Python:'<code>sort(key=…)</code>：何で並べるかを関数（lambda）で指定。', SQL:'<b>ORDER BY</b> で並べ替え（DESC で高い順）。', 'Googleスプレッドシート':'<b>SORT(範囲, 並べ替えの基準, TRUE)</b>：TRUE で小さい順。基準は「値段の列を同じ条件で絞ったもの」。' }[lang]],
            ['m', '取り出す', { JavaScript:'map で名前だけの配列に変換。', TypeScript:'結果は <code>string[]</code>（文字列の配列）。', Python:'もう一度リスト内包表記で名前だけ取り出す。', SQL:'<b>SELECT</b> で取り出す列を指定。<b>SQLは「何が欲しいか」を先に書く</b>ので順番が逆に見えます。', 'Googleスプレッドシート':'A列（名前）だけを範囲に指定して取り出す。' }[lang]]];
          const box = $(el, '.ab');
          $(el, '.sg1').append(seg(SAME.map(s => s[0]), (i) => { const [lang, hlg, code] = SAME[i]; anat(box, { code, lang:hlg, parts:P(lang) }); }, 0).el); },
        desc:'書き方は違っても、<b>やっていること（絞る・並べる・取り出す）は同じ</b>です。知っている言語の「どの部分に当たるか」で読むと、初めての言語でも見当がつきます。',
        prompt:'次のコードを、私が知っている【JavaScript】で書くとどうなるか、行ごとに対応させて説明して。\n【コード】' },
      { name:'TypeScript の型を読む', en:'Reading TypeScript', h:420, tags:['基本'], demo:'<div class="a"></div>',
        init:(el) => anat($(el, '.a'), { code:L('⟦ty|type User = {', '  name: string;', '  age?: number;', "  role: 'admin' | 'member';", '};⟧', '', 'function greet(⟦an|u: User⟧)⟦rt|: string⟧ {', "  return 'こんにちは、' + u.name;", '}', '', 'const list⟦ar|: User[]⟧ = [];', 'const [me, setMe] = useState⟦ge|<User | null>⟧(null);', 'const id = ⟦as|input.value as string⟧;'),
          parts:[
            ['ty', '型の定義', '<code>type</code>（や <code>interface</code>）は「データの形」の約束。<code>age?</code> の <b>?</b> は「なくてもよい」、<code>\'admin\' | \'member\'</code> の <b>|</b> は「どちらか」。'],
            ['an', '引数の型', '<code>u: User</code> は「u には User の形のデータが来る」。違う形を渡すと、実行する前にエディタが赤線で教えてくれます。'],
            ['rt', '戻り値の型', '<code>): string</code> は「この関数は文字列を返す」。'],
            ['ar', '配列の型', '<code>User[]</code> は「User の配列」。<code>Array&lt;User&gt;</code> と書くこともあります。'],
            ['ge', 'ジェネリクス', '<code>&lt; &gt;</code> は「中に入るものの型」を指定する書き方。ここでは「User か null が入る state」。'],
            ['as', 'as（型の上書き）', '<code>as</code> は「この型だと思って」とエディタに言い聞かせるだけで、<b>中身は変わりません</b>。多いときはエラーを黙らせているサインかも。'],
          ] }),
        desc:'TypeScript は「JavaScript ＋ 型の注釈」です。<b>型の部分（: のあと、type、&lt; &gt;）を消すと、ほぼ JavaScript</b>として読めます。',
        prompt:'この TypeScript の型エラーの意味を、どの値がどの型で、どの型が期待されているかに分けて説明して。型を as や any でごまかさない直し方を教えて。\n【エラー全文】\n【コード】' },
      { name:'React（JSX）の部品を読む', en:'Reading a React component', h:420, tags:['基本'], demo:'<div class="a"></div>',
        init:(el) => anat($(el, '.a'), { code:L("⟦im|import { useState } from 'react';⟧", '', 'export default function ⟦nm|Counter⟧(⟦pr|{ label }⟧) {', '  ⟦st|const [count, setCount] = useState(0);⟧', '  return (', '    ⟦jx|<button className="btn" onClick={() => setCount(count + 1)}>', '      {label}: {count}', '    </button>⟧', '  );', '}'),
          parts:[
            ['nm', '部品の名前', 'React の部品（コンポーネント）は<b>大文字で始まる関数</b>。<code>&lt;Counter label="いいね" /&gt;</code> のようにタグとして使います。'],
            ['pr', 'props', '親から渡される値。<code>{ label }</code> は分割代入で、<code>&lt;Counter label="いいね"&gt;</code> の "いいね" が入ります。'],
            ['st', 'state（状態）', '<code>useState(0)</code> は「最初は0の、覚えておく値」。<code>count</code> が今の値、<code>setCount</code> が変えるための関数。<b>set〜で変えると画面が描き直されます</b>。'],
            ['jx', 'JSX', '関数が<b>返している画面の形</b>。HTML に似ていますが、class は <code>className</code>、<code>{ }</code> の中は JavaScript です。'],
            ['im', '読み込み', 'react から useState という機能を借りてきています。use で始まる関数は<b>フック</b>と呼ばれます。'],
          ] }),
        desc:'React の部品は「<b>受け取る（props）→ 覚えておく（state）→ 画面を返す（JSX）</b>」の3つで読めます。',
        prompt:'この React コンポーネントを「受け取る props」「持っている state と、それを変えるきっかけ」「表示している内容」「useEffect で何をしているか」に分けて説明して。\n【コード】' },
    ], null, true),
    { title:'ファイルの拡張子で見分ける', note:'ファイル名の最後（拡張子）を見れば、だいたいの言語と役割が分かります。',
      table:{ head:['拡張子', '言語・形式', 'どこで動く・何に使う'], rows:[
        ['.html', 'HTML', 'ブラウザ。画面の骨組み'],
        ['.css / .scss', 'CSS / Sass', 'ブラウザ。見た目'],
        ['.js / .mjs', 'JavaScript', 'ブラウザ、Node.js（サーバー・ツール）'],
        ['.ts', 'TypeScript', 'JavaScript に変換してから動く'],
        ['.jsx / .tsx', 'React（JSX）', '画面の部品。Next.js などでも使う'],
        ['.vue / .svelte', 'Vue / Svelte', 'それぞれのフレームワークの部品'],
        ['.py', 'Python', 'サーバー、データ分析、AI、自動化'],
        ['.gs', 'Google Apps Script', 'Google のサーバー（スプレッドシートの自動化など）'],
        ['.json', 'JSON', 'データ・設定（package.json など）'],
        ['.yml / .yaml', 'YAML', '設定（GitHub Actions、docker-compose）'],
        ['.toml', 'TOML', '設定（Python・Rust のプロジェクトなど）'],
        ['.md', 'Markdown', '説明書（README）、ドキュメント'],
        ['.sql', 'SQL', 'データベースへの命令・テーブル定義'],
        ['.sh / .ps1', 'シェル / PowerShell', 'ターミナルで実行するコマンドのまとまり'],
        ['.env', '環境変数', 'APIキーなどの設定。<b>公開しない</b>'],
        ['.go / .rs / .java / .php / .rb / .swift / .kt', 'Go / Rust / Java / PHP / Ruby / Swift / Kotlin', 'サーバー、スマホアプリなど'],
      ] } },
    S('TypeScript の記号', [
      T('型の注釈 :', 'Type annotation', '<code>let n: number</code>：「n には数が入る」という約束。', null, ['基本']),
      T('type と interface', 'type / interface', 'データの形に名前を付ける2つの書き方。読むときはほぼ同じ意味と思って大丈夫です。'),
      T('? （なくてもよい）', 'Optional', '<code>age?: number</code> は「age はあってもなくてもよい」。使う前に undefined の確認が必要です。'),
      T('| （どれか）', 'Union type', "<code>'admin' | 'member'</code> は「どちらかの文字だけ」。<code>string | null</code> は「文字か空」。"),
      T('&lt;T&gt;（ジェネリクス）', 'Generics', '「中に入る型」をあとから決める書き方。<code>Promise&lt;User&gt;</code> は「あとで User が手に入る予約券」。'),
      T('any', 'any', '「何でもよい」＝型チェックをやめる指定。AIがエラーを消すために使いがちなので、多いときは注意。', null, ['注意']),
      T('! （null ではないと断言）', 'Non-null assertion', '<code>user!.name</code> は「user は絶対 null じゃない」とエディタを黙らせる書き方。本当に null だと実行時にエラーになります。'),
    ]),
    S('React・Next.js でよく見る形', [
      T('コンポーネント', 'Component', '画面の部品。大文字で始まる関数で、JSX を返します。', null, ['基本']),
      T('props', 'Props', '親から子へ渡す値。<code>&lt;Card title="お知らせ" /&gt;</code> の title。子の側からは変えられません。'),
      T('useState', 'useState', '覚えておく値と、それを変える関数のペア。set〜を呼ぶと画面が描き直されます。', null, ['最重要']),
      T('useEffect', 'useEffect', '「画面を表示したあと」や「この値が変わったあと」に動く処理。最後の <code>[ ]</code>（依存配列）に、何が変わったら動くかを書きます。空の [ ] なら最初の1回だけ。', null, ['注意']),
      T('JSX の { }', 'Expressions in JSX', 'JSX の中の <code>{ }</code> は JavaScript の世界。<code>{items.map(…)}</code> で一覧、<code>{isOpen &amp;&amp; &lt;Menu /&gt;}</code> で出し分け。'),
      T('key', 'key', '一覧を map で表示するときに付ける目印（<code>key={item.id}</code>）。ない・重複していると警告が出ます。'),
      T("'use client'", 'Client component', "Next.js で、ファイルの先頭にあると「このファイルはブラウザで動く部品」。useState やクリック処理を使うときに必要です。"),
      T('export default', 'Default export', 'そのファイルの「代表」。Next.js の page.tsx では、これが画面として表示されます。'),
    ]),
    S('Python でよく見る形', [
      T('def とインデント', 'def', '<code>def 名前(引数):</code> で関数。中身は<b>字下げ</b>でまとまりを表します（{ } を使わない）。', null, ['基本']),
      T('リスト内包表記', 'List comprehension', '<code>[x * 2 for x in nums if x &gt; 0]</code>：「nums の中で 0 より大きい x を2倍したリスト」。右から読むと分かりやすいです。'),
      T('f文字列', 'f-string', "<code>f'合計 {total} 円'</code>：{ } の中に変数を埋め込む。JavaScript の <code>`${total}`</code> と同じです。"),
      T('辞書（dict）', 'Dictionary', "<code>{'name': 'アキ'}</code>：JavaScript のオブジェクトに当たるもの。取り出しは <code>user['name']</code>。"),
      T('self', 'self', 'クラスの中で「この実物自身」を指す。JavaScript の this に当たります。'),
      T('if __name__ == "__main__":', 'Entry point', '「このファイルを直接実行したときだけ動かす」部分。ここが入口です。'),
    ]),
  ]});

/* ================= 8. AIのコードを確かめる ================= */
const BUGS = [
  { t:'合計が NaN になる', code:L('function sum(list) {', '  let total = 0;', '  for (let i = 0; i <= list.length; i++) {', '    total += list[i];', '  }', '  return total;', '}'), bad:3,
    why:'<code>&lt;=</code> だと1回多く回り、存在しない <code>list[list.length]</code>（undefined）を足して NaN に。', fix:'for (let i = 0; i < list.length; i++) {\n// または：return list.reduce((s, x) => s + x, 0);' },
  { t:'いつも「管理者」と表示される', code:L('function label(user) {', "  if (user.role = 'admin') {", "    return '管理者';", '  }', "  return '一般';", '}'), bad:2,
    why:'<code>=</code> は「入れる」。比べているつもりが role に \'admin\' を<b>代入</b>していて、その結果（\'admin\'＝true扱い）で必ず中に入ります。', fix:"if (user.role === 'admin') {" },
  { t:'「res.json is not a function」と出る', code:L('async function showName() {', "  const res = fetch('/api/me');", '  const user = await res.json();', '  title.textContent = user.name;', '}'), bad:2,
    why:'fetch に <b>await がない</b>ので、res は通信の結果ではなく Promise（予約券）のまま。Promise には json という機能がありません。', fix:"const res = await fetch('/api/me');" },
  { t:'100 と 1000 を足すと「1001000円」', code:L("const a = document.querySelector('#a').value;", "const b = document.querySelector('#b').value;", 'const sum = a + b;', "result.textContent = sum + '円';"), bad:3,
    why:'入力欄の値は<b>文字列</b>なので、+ が「つなげる」になります。1・2行目で変換しても正解です。', fix:'const sum = Number(a) + Number(b);' },
  { t:'公開すると危ない', code:L("const AI_KEY = '（ここに本物のキー）';", '', "fetch('https://api.example.com/chat', {", "  method: 'POST',", "  headers: { Authorization: 'Bearer ' + AI_KEY },", '});'), bad:1,
    why:'ブラウザで動くコードに書いたキーは、<b>誰でも開発者ツールで見られます</b>。キーはサーバー側（環境変数）に置き、ブラウザからは自分のサーバーを呼びます。くわしくは <a href="security.html">セキュリティ辞典</a>。', fix:"// ブラウザ側\nfetch('/api/chat', { method: 'POST', body })\n// サーバー側（キーは環境変数から）\nprocess.env.AI_KEY" },
  { t:'0円の商品が「価格未設定」になる', code:L('function priceLabel(item) {', '  if (!item.price) {', "    return '価格未設定';", '  }', "  return item.price + '円';", '}'), bad:2,
    why:'<code>!item.price</code> は 0 のときも true（0 は「いいえ」扱い）。「値がない」だけを調べるなら null と undefined に絞ります。', fix:'if (item.price == null) {  // null と undefined だけ' },
  { t:'件数が増えると、とても遅い', code:L('const list = [];', 'for (const id of userIds) {', "  const res = await fetch('/api/users/' + id);", '  list.push(await res.json());', '}'), bad:3,
    why:'くり返しの中で1件ずつ通信しているので、100人なら100回、<b>前の通信が終わるのを待ちながら</b>順番に。まとめて取る API を使うか、Promise.all で同時に取ります。', fix:"const res = await fetch('/api/users?ids=' + userIds.join(','));\n// または Promise.all(userIds.map(id => fetch(...)))" },
];
const DIFF = L('@@ -3,7 +3,8 @@ function total(items) {', '   let sum = 0;', '-  for (let i = 0; i <= items.length; i++) {', '-    sum += items[i].price;', '+  for (const item of items) {', '+    sum += item.price * item.qty;', '   }', '-  return sum;', '+  const tax = Math.round(sum * 0.1);', '+  return sum + tax;', ' }');
TABS.push({ id:'review', label:'AIのコードを確かめる', icon:'🔍',
  intro:'AIが書いたコードは、もっともらしく見えても<b>頼んでいない変更・存在しない関数・境目の見落とし</b>がまぎれこみます。全部を読めなくても大丈夫。<b>差分（何が変わったか）を見る → 怪しいサインを探す → 動かして確かめる</b>の順で、要点だけ確認します。セキュリティの確認は <a href="security.html">セキュリティ辞典</a>、テストは <a href="testing.html">テスト辞典</a> へ。',
  sections:[
    C('触って理解する', [
      { name:'バグはどの行？', en:'Spot the bug', h:470, wide:true, tags:['体験','最重要'],
        demo:'<div class="kt"><div class="kt-row"><span class="kt-lbl q"></span><b class="ttl" style="font-size:12.5px"></b></div><div class="cb" style="display:flex;flex:1;min-height:0"></div><div class="kt-verdict cr-note"></div><div class="kt-row"><button type="button" class="kt-btn sm prev">◀ 前の問題</button><button type="button" class="kt-btn sm ans">答えを見る</button><button type="button" class="kt-btn sm pri nx">次の問題 ▶</button></div></div>',
        init:(el) => { let k = 0;
          const answer = (b, ok) => { const lis = $$(el, '.cb li'); lis.forEach(li => li.classList.remove('bad', 'good')); lis[b.bad - 1].classList.add('good');
            verdict($(el, '.cr-note'), ok ? 'ok' : 'warn', `${ok ? '<b>正解！</b> ' : `答えは <b>${b.bad}行目</b>。`}${b.why}<pre class="kt-code" style="margin:6px 0 0">${esc(b.fix)}</pre>`); };
          const show = () => { const b = BUGS[k]; $(el, '.q').textContent = `${k + 1} / ${BUGS.length}`; $(el, '.ttl').textContent = '症状：' + b.t;
            $(el, '.cb').innerHTML = codeList(b.code, 'js', () => 'pick'); $(el, '.cb ol').style.flex = '1';
            verdict($(el, '.cr-note'), '', '原因だと思う<b>行を押してください</b>。');
            $$(el, '.cb li').forEach((li, i) => li.onclick = () => { if (i + 1 === b.bad) answer(b, true); else { $$(el, '.cb li').forEach(x => x.classList.remove('bad')); li.classList.add('bad'); verdict($(el, '.cr-note'), 'bad', `${i + 1}行目は、この症状の原因ではなさそうです。症状「${esc(b.t)}」に関係する値がどこで作られているかを追ってみてください。`); } }); };
          $(el, '.ans').onclick = () => answer(BUGS[k], false);
          $(el, '.nx').onclick = () => { k = (k + 1) % BUGS.length; show(); };
          $(el, '.prev').onclick = () => { k = (k + BUGS.length - 1) % BUGS.length; show(); };
          show(); },
        desc:'どれも AI のコードで実際によく見る間違いです。<b>症状 → その値が作られる行</b>と逆向きにたどると、見つけやすくなります。',
        prompt:'【症状】が起きています。このコードで、その症状の原因になりうる行を可能性の高い順に3つ挙げて、それぞれ確かめ方（console.log を入れる場所など）を教えて。まだ直さないで。\n【コード】' },
      { name:'差分（diff）の読み方', en:'Reading a diff', h:440, tags:['基本','体験','最重要'],
        demo:'<div class="kt"><div class="sg"></div><div class="cb" style="display:flex;flex:1;min-height:0"></div><div class="kt-verdict cr-note"></div></div>',
        init:(el) => { const ls = DIFF.split('\n');
          const NOTES = [
            '<b>-</b>（赤）は消えた行、<b>+</b>（緑）は増えた行、記号なしは変わっていない前後の行です。<code>@@ -3,7 +3,8 @@</code> は「元の3行目から7行ぶんが、新しい3行目から8行ぶんになった」という場所の印。',
            '変更前のコード。',
            '変更後のコード。',
            'AIに「<b>合計が NaN になるのを直して</b>」と頼んだときの差分だとすると……①くり返しの直し（頼んだこと）のほかに、②<b>数量（qty）を掛ける</b>、③<b>税を足す</b>、という<b>頼んでいない仕様の変更</b>が入っています。こういう「ついでの変更」こそ diff で見つけます。',
          ];
          $(el, '.sg').append(seg(['差分', '変更前', '変更後', '確認ポイント'], (i) => { let code, cls;
            if (i === 1 || i === 2){ const keep = ls.slice(1).filter(l => l[0] !== (i === 1 ? '+' : '-')); code = keep.map(l => l.slice(1)).join('\n'); cls = null; }
            else { code = ls.join('\n'); cls = (l, j) => { const c = l.startsWith('@@') ? 'hunk' : l[0] === '+' ? 'add' : l[0] === '-' ? 'del' : ''; if (i === 3 && (j === 5 || j === 8 || j === 9)) return c + ' bad'; if (i === 3 && j !== 0 && !c) return 'dim'; return c; }; }
            $(el, '.cb').innerHTML = codeList(code, 'js', cls); $(el, '.cb ol').style.flex = '1'; verdict($(el, '.cr-note'), i === 3 ? 'warn' : '', NOTES[i]); }, 0).el); },
        desc:'GitHub のプルリクエスト、VS Code の「ソース管理」、<code>git diff</code>、AIエージェントの変更確認画面は、どれもこの形です。<b>全部読めなくても、消えた行と、頼んでいない所の変更</b>だけは必ず見ます。',
        prompt:'今回の変更（diff）を、「頼んだ修正に必要な変更」と「それ以外の変更」に分けて一覧にして。それ以外の変更は、なぜ必要だったのか理由も書いて。不要なら元に戻して。' },
    ], null, true),
    { title:'あやしいサインと確かめ方', note:'見つけたら、すぐ直すより先に「なぜそうなっているか」をAIに聞きます。',
      table:{ head:['サイン', 'なぜ怪しい', '確かめ方'], rows:[
        ['見たことのない関数・パッケージ名', '存在しないもの（ハルシネーション）や、古い書き方のことがある', '公式ドキュメントや npm で名前を検索する'],
        ['<code>catch</code> の中が空', 'エラーが握りつぶされ、失敗に気づけない', '最低でも console.error と画面への表示を入れる'],
        ['<code>any</code>・<code>as</code>・<code>@ts-ignore</code>・<code>eslint-disable</code>', '警告を黙らせているだけかもしれない', '「なぜ必要か」をAIに聞き、外せないか試す'],
        ['テストを消した・skip した・期待値を変えた', 'テストを通すために、テストの方を弱めている', 'diff でテストファイルの変更を見る'],
        ['頼んでいないファイルの変更', 'ついでの修正で別の所が壊れることがある', 'diff のファイル一覧を見る'],
        ['<code>setTimeout</code> で少し待って直している', 'タイミング頼みで、環境によって再発する', '何を待つべきか（await・イベント）を聞く'],
        ['<code>// TODO</code>・仮の値・<code>example.com</code>', '未完成のまま残っている', 'ファイル全体を TODO で検索する'],
        ['入力をそのまま <code>innerHTML</code> に入れている', 'XSS（他人のスクリプトが動く）の入口', '<a href="security.html">セキュリティ辞典</a>で確認'],
        ['同じような処理のコピーが何か所も', '片方だけ直して食い違うバグの元', '共通の関数にまとめられないか聞く'],
        ['100行を超える関数', '読めない・テストできない', '役割ごとに分けてもらう'],
      ] } },
    { title:'確認チェックリスト', note:'AIの変更を受け入れる前に。チェックはこのブラウザに保存されます。', layout:'rows', items:[
      CK('何をするコードか一文で言える', 'Explain it', '言えないなら、まだ受け入れない。AIに説明させて、自分の言葉で言い直せるか確かめます。', 'この変更で何ができるようになったか、非エンジニアにも分かる一文で説明して。そのあと、変更したファイルごとに何を変えたか箇条書きで。', ['最重要']),
      CK('頼んだ範囲だけが変わっている', 'Scope of change', 'diff のファイル一覧と、消えた行を見ます。頼んでいない変更があれば理由を聞きます。', '今回の変更のうち、私が頼んだこと以外の変更があれば全部挙げて、理由を説明して。', ['最重要']),
      CK('秘密の値が書かれていない', 'No secrets', 'APIキー・パスワード・トークンがコードに直接書かれていないか。.env が公開されるファイルに入っていないか。', 'このプロジェクトの中に、APIキー・パスワード・トークンなどの秘密の値が直接書かれている所がないか探して。.gitignore に .env が入っているかも確認して。', ['最重要']),
      CK('存在しない関数・パッケージを使っていない', 'No hallucinated APIs', '初めて見る名前は、公式ドキュメントで実在とバージョンを確認します。'),
      CK('新しく増えたパッケージを確認した', 'New dependencies', 'package.json の dependencies に増えたものは、名前のつづり（そっくりな偽物に注意）と、本当に必要かを確認します。', '今回追加したパッケージを一覧にして、それぞれ何に使うのか、なしで書けないかを教えて。'),
      CK('空・0件・エラーのときの動きを見た', 'Edge cases', 'データが0件、入力が空、通信が失敗、のときに画面がどうなるか。AIのコードは「うまくいく場合」しか書かれていないことがよくあります。', 'この機能で、データが0件・入力が空・通信が失敗・とても長い文字、のときにどうなるかを表にして。対応していない所があれば直して。'),
      CK('境目の値で試した', 'Boundary values', '「13歳未満」なら12と13、「100件まで」なら100と101。境目はバグが出やすい所です。'),
      CK('実際に動かして確かめた', 'Run it', 'コードを読むだけでなく、画面で操作して確かめます。スマホ幅でも。', null, ['最重要']),
      CK('console.log や仮のコードが残っていない', 'Cleanup', 'デバッグ用のログ、コメントアウトした古いコード、TODO を消します。'),
      CK('テストが通る（テストを弱めていない）', 'Tests pass', 'テストがあるなら実行します。テストファイルの変更は特に注意して読みます。'),
    ] },
    S('AIに読んでもらう頼み方', [
      T('1行ずつ説明してもらう', 'Line-by-line', '分からない所は範囲をしぼって。説明のレベル（中学生にも分かるように、など）を指定すると読みやすくなります。', '次のコードを1行ずつ、何をしているか説明して。専門用語は（）で言い換えて。最後に全体を一文でまとめて。\n【コード】', ['最重要']),
      T('流れを番号つきで説明してもらう', 'Execution flow', '「ボタンを押してから画面が変わるまで」のように、きっかけと終わりを指定して、通る関数を順番に並べてもらいます。', '【ボタンを押してから、結果が表示されるまで】に、どのファイルのどの関数がどの順番で呼ばれるか、番号つきで説明して。それぞれ受け取る値と返す値も書いて。'),
      T('変数の変化を表にしてもらう', 'Trace table', 'この辞典の見本と同じことを、自分のコードでやってもらう頼み方です。', 'このコードを【入力：○○】で実行したときの、各行の後の変数の中身を表にして（列＝変数、行＝実行した行）。'),
      T('怪しい所を探してもらう', 'Code review', '「直して」ではなく「探して」と頼むと、勝手な書き換えを防げます。', 'このコードをレビューして。バグ・境目の値・エラー処理の抜け・セキュリティの心配を、重要度の高い順に挙げて。まだ直さないで、理由と確かめ方だけ書いて。\n【コード】', ['最重要']),
      T('コメントを付けてもらう', 'Add comments', '読み終わったら、理解したことをコメントとして残してもらうと、次に読むときに速くなります。', 'このコードの処理の区切りごとに、「何のための処理か」を日本語のコメントで付けて。コードそのものは変えないで。'),
      T('読みやすく書き直してもらう', 'Refactor for readability', '動きを変えずに、名前・分け方・書き方だけを分かりやすくしてもらいます。テストがあると安心です。', 'このコードを、動きは一切変えずに読みやすく書き直して。変数名を分かりやすく、長い関数は分けて。変えた所と理由を一覧にして。'),
      T('練習問題を出してもらう', 'Practice', '読めるようになったかを確かめるのに、自分のコードから問題を作ってもらうのも効果的です。', 'このコードの理解を確かめる問題を5問作って（例：「この関数に [1, 2] を渡すと何が返る？」）。答えは最後にまとめて。'),
      T('知っている言語で説明してもらう', 'Explain in a known language', '初めての言語は、知っている言語との対応で理解します（「言語の見分け方」タブの比べる見本も参照）。', 'この【Python】のコードを、【JavaScript】で書くとどうなるか行ごとに対応させて、書き方の違いを説明して。'),
    ]),
  ]});
})();
