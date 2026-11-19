/* コードの読み方辞典 — A: 共通の部品（1行ずつ実行・部位の表示） / 読み方のコツ / 変数と値 / 条件とくり返し / 関数 */
(function(){
const { $, $$, esc, seg } = KIT;
const S = (title, items, note) => ({ title, note, layout:'rows', items });
const C = (title, items, note, lg) => ({ title, note, layout:lg ? 'cards lg' : 'cards', items });
const T = (name, en, desc, prompt, tags, more) => Object.assign({ name, en, desc, prompt, tags }, more || {});
const L = (...a) => a.join('\n');
const verdict = (el, cls, html) => { el.classList.remove('ok', 'bad', 'warn'); if (cls) el.classList.add(cls); el.innerHTML = html; };

/* ---------- 色付け（JavaScript / Python / シェル / SQL の簡易版） ---------- */
const KW = {
  js:new Set('const let var function return if else for while do of in break continue new class extends this async await import export from default try catch finally throw typeof instanceof true false null undefined switch case delete void super static interface type enum implements readonly as keyof'.split(' ')),
  py:new Set('def return if elif else for while in not and or is None True False import from as class self try except finally raise with lambda pass break continue async await print len range'.split(' ')),
  sh:new Set('cd ls npm npx git echo export mkdir rm cp mv cat sudo if then fi for do done'.split(' ')),
};
const RE = {
  js:/(\/\/[^\n]*)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)/g,
  py:/(#[^\n]*)|(f?"(?:\\.|[^"\\\n])*"|f?'(?:\\.|[^'\\\n])*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][\w]*)/g,
};
function hl(src, lang = 'js'){
  if (lang === 'sql') return KIT.hlSQL(src);
  const re = lang === 'py' || lang === 'sh' ? RE.py : lang === 'js' ? RE.js : null;
  if (!re) return esc(src);
  const kw = KW[lang] || KW.js; let out = '', last = 0, m; re.lastIndex = 0;
  while ((m = re.exec(src))){
    out += esc(src.slice(last, m.index)); last = re.lastIndex;
    out += m[1] ? `<span class="c">${esc(m[1])}</span>` : m[2] ? `<span class="s">${esc(m[2])}</span>` : m[3] ? `<span class="n">${m[3]}</span>` : kw.has(m[4]) ? `<span class="k">${m[4]}</span>` : esc(m[4]);
  }
  return out + esc(src.slice(last));
}
// 行番号つきのコード（<ol>）。cls(i) で行ごとのクラス
const codeList = (code, lang = 'js', cls) => `<ol class="cr-code">${code.split('\n').map((l, i) => `<li data-n="${i + 1}" class="${cls ? cls(l, i) || '' : ''}"><span class="ln">${i + 1}</span><span class="tx">${hl(l, lang) || ' '}</span></li>`).join('')}</ol>`;

/* ---------- 値を見やすい文字にする ---------- */
function fmt(v, d = 0){
  if (v === undefined) return 'undefined';
  if (v === null) return 'null';
  if (typeof v === 'string') return `'${v}'`;
  if (typeof v === 'function') return `ƒ ${v.name || ''}()`;
  if (typeof v === 'number' && Number.isNaN(v)) return 'NaN';
  if (Array.isArray(v)) return d > 1 ? '[…]' : '[' + v.map(x => fmt(x, d + 1)).join(', ') + ']';
  if (v instanceof Promise) return 'Promise {<pending>}';
  if (typeof v === 'object') return d > 1 ? '{…}' : '{ ' + Object.entries(v).map(([k, x]) => k + ': ' + fmt(x, d + 1)).join(', ') + ' }';
  return String(v);
}

/* ---------- 部品1：1行ずつ実行して見る（トレーサー）----------
   run(R, v) の中で R(行番号, 説明, {変数}, {stack, queue}) を順に呼んで「記録」する。
   R.log(...) は画面への出力、R.err(...) はエラーの出力。inputs で入力を切り替えられる。 */
function tracer(el, o){
  el.innerHTML = `<div class="kt cr-tr">${o.inputs ? `<div class="kt-row"><span class="kt-lbl">${o.inputs.label}</span><span class="inp"></span></div>` : ''}
    <div class="cr-tw"><div class="codebox" style="display:flex;min-height:0"></div><div class="cr-side">
      <div class="cr-box"><div class="kt-lbl">${o.varLabel || '変数の中身'}</div><div class="cr-vt"></div></div>
      <div class="cr-box stk" hidden><div class="kt-lbl">実行中の関数（上ほど新しい）</div><div class="cr-stack"></div></div>
      <div class="cr-box que" hidden><div class="kt-lbl">あとで実行する予約</div><div class="cr-queue"></div></div>
      <div class="cr-box"><div class="kt-lbl">画面への出力（console.log）</div><pre class="cr-out"></pre></div>
    </div></div>
    <div class="kt-verdict cr-note"></div>
    <div class="kt-row"><button type="button" class="kt-btn sm prev">◀ 戻る</button><button type="button" class="kt-btn sm pri next">次へ ▶</button><button type="button" class="kt-btn sm auto">▶ 自動</button><span class="kt-lbl pg" style="margin-left:auto"></span></div></div>`;
  const cb = $(el, '.codebox'), vt = $(el, '.cr-vt'), stk = $(el, '.cr-stack'), que = $(el, '.cr-queue'), out = $(el, '.cr-out'), note = $(el, '.cr-note'), pg = $(el, '.pg'), prev = $(el, '.prev'), next = $(el, '.next'), au = $(el, '.auto');
  let steps = [], k = 0, timer = null, v, lis = [];
  const build = () => {
    steps = []; const lines = [];
    const R = (ln, txt, vars = {}, ex = {}) => steps.push({ ln, txt, vars:Object.fromEntries(Object.entries(vars).map(([n, x]) => [n, fmt(x)])), out:lines.slice(), stack:ex.stack, queue:ex.queue, cls:ex.cls });
    R.log = (...a) => lines.push({ t:a.map(x => typeof x === 'string' ? x : fmt(x)).join(' ') });
    R.err = (t) => lines.push({ t:'✖ ' + t, err:true });
    o.run(R, v);
    const code = typeof o.code === 'function' ? o.code(v) : o.code;
    cb.innerHTML = codeList(code, o.lang); lis = $$(cb, 'li'); $(cb, 'ol').style.flex = '1';
    $(el, '.stk').hidden = !steps.some(s => s.stack); $(el, '.que').hidden = !steps.some(s => s.queue); vt.parentElement.hidden = !steps.some(s => Object.keys(s.vars).length);
    k = 0; render();
  };
  const keep = (li) => { [$(cb, 'ol')].forEach(box => { if (box.scrollHeight <= box.clientHeight + 2) return; const r = li.getBoundingClientRect(), p = box.getBoundingClientRect(); if (r.top < p.top + 4 || r.bottom > p.bottom - 4) box.scrollTop += r.top - p.top - p.height / 2 + r.height / 2; }); };
  const render = () => {
    const s = steps[k], p = steps[k - 1];
    lis.forEach((li, i) => { li.classList.toggle('cur', i + 1 === s.ln); li.classList.toggle('was', !!p && i + 1 === p.ln && p.ln !== s.ln); });
    const names = Object.keys(s.vars);
    vt.innerHTML = names.length ? '<table>' + names.map(n => `<tr class="${p && p.vars[n] !== s.vars[n] ? 'chg' : ''}"><th>${esc(n)}</th><td>${esc(s.vars[n])}</td></tr>`).join('') + '</table>' : '<span class="kt-note">（まだありません）</span>';
    stk.innerHTML = (s.stack || []).slice().reverse().map((f, i) => `<div class="${i ? '' : 'top'}">${esc(f)}</div>`).join('') || '<span class="kt-note">（なし）</span>';
    que.innerHTML = (s.queue || []).map(q => `<span class="${q.mi ? 'mi' : ''}">${esc(q.t || q)}</span>`).join('') || '<span class="kt-note">（空）</span>';
    const nw = p ? p.out.length : 0;
    out.innerHTML = s.out.map((l, i) => `<span class="${l.err ? 'err' : i >= nw ? 'new' : ''}">${esc(l.t)}</span>`).join('') || '<span class="kt-note">（まだ何も表示されていません）</span>';
    verdict(note, s.cls || '', `<span class="no">${k + 1}</span>${s.txt}`);
    pg.textContent = `${k + 1} / ${steps.length}`; prev.disabled = k <= 0; next.textContent = k >= steps.length - 1 ? '最初から ↺' : '次へ ▶';
    if (lis[s.ln - 1]) keep(lis[s.ln - 1]);
    const side = $(el, '.cr-side'); if (s.out.length > nw && side.scrollHeight > side.clientHeight + 2){ const o = out.lastElementChild.getBoundingClientRect(), b = side.getBoundingClientRect(); if (o.bottom > b.bottom) side.scrollTop += o.bottom - b.bottom + 6; }
  };
  const stopAuto = () => { clearInterval(timer); timer = null; au.textContent = '▶ 自動'; };
  prev.onclick = () => { stopAuto(); if (k > 0){ k--; render(); } };
  next.onclick = () => { stopAuto(); k = k >= steps.length - 1 ? 0 : k + 1; render(); };
  au.onclick = () => { if (timer){ stopAuto(); return; } if (k >= steps.length - 1) k = -1; au.textContent = '❚❚ 停止'; const go = () => { if (k >= steps.length - 1){ stopAuto(); return; } k++; render(); }; go(); timer = setInterval(go, o.speed || 1500); };
  if (o.inputs){ const opts = o.inputs.opts; $(el, '.inp').append(seg(opts.map(x => x[0]), (i) => { v = opts[i][1]; stopAuto(); build(); }, o.inputs.start || 0).el); }
  else build();
  return stopAuto;
}

/* ---------- 部品2：コードの部位を光らせる ----------
   code の中の ⟦key|文字⟧ が部位。parts:[[key, ボタン名, 説明]] */
function anat(el, { code, lang = 'js', parts, title }){
  const html = code.split(/(⟦\w+\|[\s\S]*?⟧)/).map(sg => { const m = sg.match(/^⟦(\w+)\|([\s\S]*)⟧$/); return m ? `<span class="cr-p" data-p="${m[1]}">${hl(m[2], lang)}</span>` : hl(sg, lang); }).join('');
  el.innerHTML = `<div class="kt">${title ? `<div class="kt-lbl">${title}</div>` : ''}<div class="sg"></div><pre class="cr-pre focus">${html}</pre><div class="kt-verdict cr-note"></div></div>`;
  const s = seg(parts.map(p => p[1]), (i) => { const key = parts[i][0]; let first = null; $$(el, '.cr-p').forEach(x => { const on = x.dataset.p === key; x.classList.toggle('on', on); if (on && !first) first = x; }); $(el, '.cr-note').innerHTML = parts[i][2]; if (first){ const box = $(el, '.cr-pre'), r = first.getBoundingClientRect(), b = box.getBoundingClientRect(); if (r.top < b.top || r.bottom > b.bottom) box.scrollTop += r.top - b.top - 20; } }, 0);
  $(el, '.sg').append(s.el);
}

window.CRH = { S, C, T, L, verdict, hl, codeList, fmt, tracer, anat };

/* ================= 1. 読み方のコツ ================= */
TABS.push({ id:'how', label:'読み方のコツ', icon:'🧭',
  intro:'コードは、全部を理解しなくても読めます。<b>どこから動き始めて、何を受け取り、何を返すか</b>が分かれば、AIが書いたコードの大半は見通せます。この辞典は JavaScript を中心に、<b>1行ずつ実行して変数の中身を見る</b>見本で、読み方を身につけます。エラー文の読み方は <a href="errors.html">エラー・トラブル辞典</a>、言葉の意味は <a href="glossary.html">開発用語辞典</a> へ。',
  sections:[
    C('触って理解する', [
      { name:'コードの地図（どこに何が書いてあるか）', en:'Anatomy of a file', h:420, tags:['基本','最重要'], demo:'<div class="a"></div>',
        init:(el) => anat($(el, '.a'), { title:'ボタンを押すと天気を表示するコード。読む順番どおりに並べています',
          code:L(
            '⟦cm|// ボタンを押すと、今日の天気を表示する⟧',
            "⟦imp|import { getWeather } from './api.js';⟧",
            '',
            "⟦cfg|const CITY = 'Tokyo';",
            "const button = document.querySelector('#show');⟧",
            '',
            '⟦def|async function showWeather() {',
            '  const data = await getWeather(CITY);',
            "  const text = data.temp + '℃ ' + data.sky;",
            "  document.querySelector('#result').textContent = text;",
            '}⟧',
            '',
            "⟦run|button.addEventListener('click', showWeather);⟧"),
          parts:[
            ['run', '① 入口', 'まず<b>「いつ動き出すか」</b>を探します。ここではボタンがクリック（click）されたときに showWeather が動きます。<b>ページを開いただけでは何も起きません</b>。'],
            ['def', '② 関数の定義', 'ここは「やり方」を書いてあるだけで、<b>呼ばれるまで動きません</b>。名前（showWeather＝天気を見せる）から中身を予想してから読むと速く読めます。'],
            ['cfg', '③ 設定・準備', '大文字の CITY は「変えない設定値」の目印。button には、画面の部品（id="show" のボタン）を探して入れています。'],
            ['imp', '④ 読み込み', '別のファイル（api.js）から getWeather という関数を借りてきています。中身を知りたいときは、そのファイルを開きます。'],
            ['cm', '⑤ コメント', '// から行末までは人間向けのメモで、実行されません。AIのコードではコメントが要約になっていることが多いので、先に読みます（ただし古いことも）。'],
          ] }),
        desc:'ファイルを上から順に読む必要はありません。<b>入口 → 呼ばれる関数 → 使っている設定や部品</b>の順にたどると、少ない行数で全体がつかめます。',
        prompt:'このファイルを「入口（動き出すきっかけ）」「関数の定義」「設定・準備」「読み込み」に分けて、それぞれ何行目かと役割を表にして。読む順番のおすすめも付けて。\n【コード】' },
      { name:'1行ずつ実行して見る（関数は呼ばれたときに動く）', en:'Step through', h:470, wide:true, tags:['基本','体験','最重要'], demo:'<div class="t"></div>',
        init:(el) => tracer($(el, '.t'), {
          code:L('function greet(name) {', "  const msg = 'こんにちは、' + name;", '  return msg;', '}', '', "console.log('はじまり');", "const a = greet('アキ');", 'console.log(a);'),
          run:(R) => {
            const G = 'プログラム全体', greet = function greet(){};
            R(1, '1〜4行目は関数の<b>定義</b>。「greet という手順がある」と覚えるだけで、<b>中身はまだ実行しません</b>。次は6行目に飛びます。', { greet }, { stack:[G] });
            R.log('はじまり'); R(6, '実際の処理はここから。「はじまり」と表示します。', { greet }, { stack:[G] });
            R(7, "greet('アキ') で関数を<b>呼び出す</b>。7行目はいったん止まり、1行目へジャンプします。", { greet }, { stack:[G] });
            R(1, "引数 name に 'アキ' が入って、関数の中身がスタート。右の「実行中の関数」に greet が積まれました。", { name:'アキ' }, { stack:[G, "greet('アキ')"] });
            R(2, "msg に 'こんにちは、アキ' を作って入れます。", { name:'アキ', msg:'こんにちは、アキ' }, { stack:[G, "greet('アキ')"] });
            R(3, '<b>return</b>：msg を持って、<b>呼び出した場所（7行目）へ戻ります</b>。関数の中の変数（name・msg）はここで消えます。', { name:'アキ', msg:'こんにちは、アキ' }, { stack:[G, "greet('アキ')"] });
            R(7, "戻ってきた値 'こんにちは、アキ' が a に入ります。", { greet, a:'こんにちは、アキ' }, { stack:[G] });
            R.log('こんにちは、アキ'); R(8, 'a を表示しておしまい。<b>上から順ではなく 6→7→1→2→3→7→8</b> の順に動きました。', { greet, a:'こんにちは、アキ' }, { stack:[G] });
          } }),
        desc:'右側の「変数の中身」「実行中の関数」「出力」が、1行ごとにどう変わるかを見てください。この辞典の見本はすべてこの形です。ブラウザの開発者ツール（F12）のデバッガーでも、同じことが自分のコードでできます。',
        prompt:'このコードを実行したとき、どの行がどの順番で実行されるか、1ステップずつ表にして。列は「順番・行番号・やっていること・その時点の変数の中身」。\n【コード】' },
    ], null, true),
    S('読むときのコツ', [
      T('全部を理解しようとしない', 'Skim first', '最初は<b>関数の名前・変数の名前・コメント</b>だけを拾い読みして、全体で何をしているかをつかみます。細かい所は、必要になってから読みます。', 'このファイルを、関数ごとに「何をするか」1行ずつで要約して。細かい処理の説明はいらない。', ['最重要']),
      T('入口（エントリーポイント）を探す', 'Entry point', 'プログラムが動き始める場所。Webページなら <code>addEventListener</code> やページを開いたときの処理、Node.js なら package.json の <code>scripts</code>、React なら <code>App</code>、Python なら <code>if __name__ == "__main__":</code> の下。', 'このプロジェクトはどこから実行が始まる？入口のファイルと関数を教えて、そこから呼ばれる順に主な関数を並べて。', ['最重要']),
      T('名前から意味を予想する', 'Read the names', '<code>getUser</code>（ユーザーを取ってくる）、<code>isOpen</code>（開いているか＝true/false）、<code>handleClick</code>（クリックされたときの処理）、<code>users</code>（ユーザーの一覧＝配列）。<b>関数は「動詞＋名詞」、真偽値は is/has/can で始まる</b>のが基本です。', 'このコードに出てくる変数名・関数名を一覧にして、それぞれ英語の意味と「何が入っているか／何をするか」を説明して。'),
      T('インデント（字下げ）はまとまり', 'Indentation', '右に下がっている行は、その上の行の <code>{ }</code> の「中身」です。同じ深さの行が同じまとまり。Python では字下げそのものが文法なので、ずれると動きません。'),
      T('実行の順番は「上から下」＋例外', 'Execution order', '基本は上から1行ずつ。ただし<b>関数は呼ばれたとき</b>、<b>if は条件が合ったとき</b>、<b>くり返しは何度も</b>、<b>クリックや通信の結果はあとで</b>動きます。', null, ['基本']),
      T('console.log で中身をのぞく', 'Print debugging', '分からない変数は、その直後に <code>console.log(変数)</code> を入れて動かすと、開発者ツール（F12）の Console に中身が出ます。<code>console.log({ a, b })</code> と書くと名前つきで見られます。', 'この関数の各ステップで変数の中身が分かるように console.log を入れた版を作って。何を確かめるためのログかコメントも付けて。確認が終わったら消しやすいように、ログの行には // DEBUG と書いて。', ['実践'], { code:"console.log('price:', price);\nconsole.log({ user, items }); // 名前つきでまとめて見る" }),
      T('ブレークポイントで止める', 'Breakpoint', '開発者ツールの「Sources」で行番号をクリックするか、コードに <code>debugger;</code> と書くと、そこで実行が止まります。変数の中身を見ながら1行ずつ進められます（この辞典の見本と同じ体験）。'),
      T('分からない行は、行を指定してAIに聞く', 'Ask line by line', '「このコードを説明して」より、<b>行番号や関数名を指定して</b>聞くほうが、具体的で正確な答えが返ってきます。', '次のコードの 12〜20 行目を、1行ずつ「何をしているか」を中学生にも分かる言葉で説明して。専門用語には（）で補足を付けて。\n【コード】', ['最重要']),
      T('コメントや名前を信じすぎない', 'The code is the truth', 'コメントや関数名が古いまま残っていることがあります。<b>最後に正しいのはコードの動き</b>です。怪しいときは動かして確かめます。'),
      T('定義へジャンプ・使われている所を探す', 'Go to definition', 'VS Code などでは、関数名を Ctrl（Mac は Cmd）＋クリックすると定義へ飛べます。Shift＋F12 で「どこから使われているか」の一覧が出ます。'),
      T('画面の文字で検索する', 'Search in files', 'Ctrl＋Shift＋F でプロジェクト全体から文字を探せます。<b>画面に出ているボタンの文言</b>で検索すると、その部品のコードに最短でたどり着けます。', null, ['実践']),
      T('図にしてもらう', 'Diagram it', 'ファイルや関数のつながりは、図にすると一気に分かります。AIに Mermaid 形式で書いてもらうと、GitHub や多くのエディタで図として表示できます。', 'このプロジェクトの主なファイルと関数の呼び出し関係を、Mermaid の flowchart で図にして。矢印には「何を渡すか」を書いて。'),
      T('小さく動かして確かめる', 'Experiment', '数字を1つ変える、行を1つコメントアウトする、のように<b>小さく変えて結果の違いを見る</b>のがいちばん確実な読み方です。Git で保存してから試せば、いつでも元に戻せます（<a href="git-terminal.html">Git辞典</a>）。'),
    ]),
    { title:'記号の読み方', note:'コードに出てくる記号の、声に出すときの読み方と意味です。',
      table:{ head:['記号', '読み方', '意味', '例'], rows:[
        ['<code>=</code>', 'だいにゅう', '右の値を左の変数に<b>入れる</b>（「等しい」ではない）', '<code>x = 5</code>'],
        ['<code>===</code>', 'イコール3つ', '等しいか比べる（型も比べる）', '<code>age === 20</code>'],
        ['<code>!==</code>', 'ノットイコール', '等しくないか', "<code>s !== ''</code>"],
        ['<code>!</code>', 'ノット', 'true と false を逆にする', '<code>!isOpen</code>'],
        ['<code>&amp;&amp;</code> / <code>||</code>', 'アンド / オア', '両方とも / どちらか', '<code>a &amp;&amp; b</code>'],
        ['<code>=&gt;</code>', 'アロー', '関数の短い書き方', '<code>x =&gt; x * 2</code>'],
        ['<code>( )</code>', 'かっこ', '関数を呼ぶ・引数を渡す・計算の順番', "<code>greet('アキ')</code>"],
        ['<code>{ }</code>', 'なみかっこ', '処理のまとまり（ブロック）／オブジェクト', "<code>{ name: 'アキ' }</code>"],
        ['<code>[ ]</code>', 'かくかっこ', '配列／何番目かを取り出す', '<code>list[0]</code>'],
        ['<code>.</code>', 'ドット', '「〜の」。中身や機能を取り出す', '<code>user.name</code>'],
        ['<code>?.</code>', 'オプショナルチェーン', 'なければエラーにせず undefined にする', '<code>user?.name</code>'],
        ['<code>??</code>', 'ヌル合体', '左が null・undefined なら右を使う', "<code>name ?? '名無し'</code>"],
        ['<code>...</code>', 'スプレッド', '中身を広げる／残り全部', '<code>[...list, 4]</code>'],
        ['<code>` `</code> と <code>${ }</code>', 'テンプレート文字列', '文字列の中に値を埋め込む', '<code>`${n}円`</code>'],
        ['<code>//</code>', 'コメント', '行末までメモ（実行されない）', '<code>// 説明</code>'],
        ['<code>;</code>', 'セミコロン', '文の終わり（省略されることも多い）', '<code>x = 1;</code>'],
      ] } },
  ]});

/* ================= 2. 変数と値 ================= */
const EXPR = [
  ['1 + 1', () => 1 + 1, '数どうしなら、ふつうの足し算です。'],
  ["'1' + 1", () => '1' + 1, '<b>どちらかが文字列だと + は「つなげる」</b>になります。入力欄の値（いつも文字列）でよく起きる失敗です。'],
  ["'5' * 2", () => '5' * 2, '* と - と / は、文字列を数に直してから計算します。+ だけが特別です。'],
  ["'5' - 2", () => '5' - 2, '引き算も数に直されます。'],
  ['0.1 + 0.2', () => 0.1 + 0.2, '小数はコンピューターの中では2進数なので、ほんの少しずれます。お金は「円」の整数で計算するのが安全です。'],
  ["'10' > '9'", () => '10' > '9', '文字どうしの比較は「辞書の順番」。1文字目の「1」と「9」を比べて false。数として比べるなら Number() で直します。'],
  ["1 == '1'", () => 1 == '1', '== は型をそろえてから比べるので true。思わぬ一致が起きるので、ふつうは === を使います。'],
  ["1 === '1'", () => 1 === '1', '=== は型も比べるので false（数と文字は別物）。'],
  ["Number('12px')", () => Number('12px'), '数にできない文字は NaN（Not a Number＝数ではない）になります。'],
  ["parseInt('12px')", () => parseInt('12px', 10), '先頭から読める所までを数にします。'],
  ['typeof null', () => typeof null, "null は「空」なのに 'object'。JavaScript の初期からある有名なくせです。"],
  ["Boolean('0')", () => Boolean('0'), "空でない文字列は true 扱い。'0' や 'false' という文字も true です。"],
  ['[1, 2, 3].length', () => [1, 2, 3].length, '要素の数。最後の番号（2）とは1ずれます。'],
  ["'abc'[0]", () => 'abc'[0], '文字列も0番目から数えます。'],
];
TABS.push({ id:'values', label:'変数と値', icon:'📦',
  intro:'変数は<b>名前の付いた箱</b>です。コードを読むことは、ほとんど「どの箱に、いつ、何が入るか」を追うことです。値には文字・数・真偽（はい/いいえ）などの<b>種類（型）</b>があり、種類が違うと同じ <code>+</code> でも結果が変わります。',
  sections:[
    C('触って理解する', [
      { name:'変数は箱（あとから中身が変わる）', en:'Variables', h:460, wide:true, tags:['基本','体験','最重要'], demo:'<div class="t"></div>',
        init:(el) => tracer($(el, '.t'), {
          code:L('let score = 0;', "const name = 'アキ';", 'score = score + 10;', "let msg = name + 'さん ' + score + '点';", 'score += 5;', 'console.log(msg);', 'console.log(score);'),
          run:(R) => {
            R(1, '<code>score</code> という箱を作って 0 を入れます。<b>let</b> は、あとで中身を入れ替えられる箱です。', { score:0 });
            R(2, "<b>const</b> は中身を入れ替えられない箱。name に 'アキ' を入れます。", { score:0, name:'アキ' });
            R(3, '<b>右側を先に計算</b>（0 + 10 = 10）してから、score に入れ直します。<code>=</code> は「等しい」ではなく「入れる」です。', { score:10, name:'アキ' });
            R(4, "文字と数を + でつなぐと文字列になります。msg は 'アキさん 10点'。", { score:10, name:'アキ', msg:'アキさん 10点' });
            R(5, '<code>score += 5</code> は <code>score = score + 5</code> の省略形。15 になります。', { score:15, name:'アキ', msg:'アキさん 10点' });
            R.log('アキさん 10点'); R(6, 'msg は4行目の時点で作った文字なので、<b>score が変わっても「10点」のまま</b>です。変数は「その時の値のコピー」を持っています。', { score:15, name:'アキ', msg:'アキさん 10点' }, { cls:'warn' });
            R.log(15); R(7, 'score は 15。「表示がずれる」バグの多くは、<b>値を作ったタイミング</b>を追うと見つかります。', { score:15, name:'アキ', msg:'アキさん 10点' });
          } }),
        desc:'変数の中身が変わった行は、右の表で色が付きます。「いつ入った値か」を意識すると、表示が古いままになるバグが読めるようになります。',
        prompt:'このコードで、各変数の中身が何行目でどう変わるかを表にして（列＝行番号、行＝変数名）。\n【コード】' },
      { name:'予想してからめくる：型で変わる計算', en:'Types & coercion', h:430, tags:['体験','注意'], demo:'<div class="kt"><div class="kt-row"><span class="kt-lbl">結果を予想してからカードを押す</span><button type="button" class="kt-btn sm all" style="margin-left:auto">全部めくる</button></div><div class="cr-cards"></div></div>',
        init:(el) => { const box = $(el, '.cr-cards');
          box.innerHTML = EXPR.map(([e, f, w]) => { const r = f(); return `<button type="button" class="cr-card"><code>${esc(e)}</code><span class="a">→ ${esc(fmt(r))}　<small>(${typeof r})</small></span><span class="why">${w}</span></button>`; }).join('');
          $$(box, '.cr-card').forEach(b => { const a = $(b, '.a'), ans = a.innerHTML; a.textContent = '→ ？'; b.onclick = () => { const o = b.classList.toggle('open'); a.innerHTML = o ? ans : '→ ？'; }; b._ans = ans; });
          $(el, '.all').onclick = () => $$(box, '.cr-card').forEach(b => { b.classList.add('open'); $(b, '.a').innerHTML = b._ans; }); },
        desc:'結果はこのページの JavaScript で実際に計算しています。<b>入力欄の値はいつも文字列</b>なので、<code>\'1\' + 1</code> の失敗は本当によく起きます。',
        prompt:'このコードで、文字列と数がまざって計算されている所がないか確認して。入力欄の値（.value）を数として使う所は Number() で変換しているかも見て。\n【コード】' },
      { name:'const でも中身は変わる？', en:'const & mutation', h:460, wide:true, tags:['体験','注意'], demo:'<div class="t"></div>',
        init:(el) => tracer($(el, '.t'), {
          code:L('const cart = [];', "cart.push('りんご');", "cart.push('パン');", 'console.log(cart.length);', "cart = ['メロン'];"),
          run:(R) => {
            R(1, '空の配列を const の箱に入れます。', { cart:[] });
            R(2, "push は配列の<b>中身に追加</b>する命令。箱そのものは同じなので、const でもできます。", { cart:['りんご'] });
            R(3, '2つ目も追加。', { cart:['りんご', 'パン'] });
            R.log(2); R(4, '要素の数は 2。', { cart:['りんご', 'パン'] });
            R.err('TypeError: Assignment to constant variable.'); R(5, '<b>箱ごと入れ替える</b>のは const では禁止。「定数に代入しようとした」というエラーで止まります。中身を変えたいだけなら push など、入れ替えたいなら let を使います。', { cart:['りんご', 'パン'] }, { cls:'bad' });
          } }),
        desc:'const は「この名前は別の箱に付け替えない」という約束で、<b>中身まで凍らせるわけではありません</b>。AIのコードは基本 const で書き、入れ替える変数だけ let にします。',
        prompt:null },
    ], null, true),
    S('値の種類（型）', [
      T('文字列', 'String', "文字の並び。<code>'こんにちは'</code>・<code>\"Hi\"</code>・<code>`${n}円`</code> のように、引用符で囲みます。", null, ['基本']),
      T('数値', 'Number', '整数も小数も同じ number 型です。<code>1_000_000</code> のように _ で区切って書けます。'),
      T('真偽値', 'Boolean', '<code>true</code>（はい）と <code>false</code>（いいえ）の2つだけ。比較の結果や、isOpen のような「状態」に使います。', null, ['基本']),
      T('undefined', 'Undefined', '「まだ何も入っていない」。宣言しただけの変数や、存在しない項目を読んだときの値です。'),
      T('null', 'Null', '「わざと空にした」ことを表す値。undefined との違いは、<b>人が意図して入れたかどうか</b>です。'),
      T('NaN', 'Not a Number', '数にできなかった計算の結果。<code>Number(\'abc\')</code> など。NaN は自分自身とも等しくならないので、<code>Number.isNaN(x)</code> で調べます。'),
      T('配列', 'Array', '<code>[1, 2, 3]</code> のように、順番のある並び。0番目から数えます。くわしくは「配列とオブジェクト」タブ。'),
      T('オブジェクト', 'Object', "<code>{ name: 'アキ', age: 20 }</code> のように、名前（キー）と値の組をまとめたもの。"),
      T('typeof', 'typeof', '値の種類を調べる命令。<code>typeof 1</code> は <code>\'number\'</code>。配列も <code>\'object\'</code> になるので、配列かどうかは <code>Array.isArray()</code> で調べます。'),
      T('型の変換', 'Type conversion', '<code>Number(\'12\')</code> で数に、<code>String(12)</code> で文字に。<code>parseInt(\'12px\', 10)</code> は先頭の数字だけを取り出します。'),
      T('入力欄の値は文字列', 'input.value is a string', '<code>&lt;input type="number"&gt;</code> でも、<code>.value</code> で取り出した値は文字列です。足し算の前に <code>Number()</code> で変換します。', 'このフォームの入力値を計算に使っている所で、文字列のまま計算していないか確認して。必要なら Number() で変換し、数でない入力のときの扱いも追加して。', ['注意','最重要']),
      T('テンプレート文字列', 'Template literal', '<code>`合計 ${total} 円`</code> のように、バッククォートで囲むと <code>${ }</code> の中に変数や計算を埋め込めます。'),
    ]),
    S('変数の作り方と書き方', [
      T('const', 'const', 'あとで別の値に入れ替えない変数。<b>基本はこれ</b>。中身（配列の要素など）は変えられます。', null, ['基本']),
      T('let', 'let', 'あとで入れ替える変数。カウンターや合計など。'),
      T('var', 'var', '古い書き方。今のコードではほぼ使いません。AIが var を書いたら、古い例を参考にしている合図かもしれません。'),
      T('代入と再代入', 'Assignment', '<code>x = 5</code> は「x に 5 を入れる」。<code>x = x + 1</code> は「今の x に1を足して入れ直す」で、数学の式とは意味が違います。'),
      T('省略記法 += ++', 'Compound assignment', '<code>x += 2</code> は <code>x = x + 2</code>、<code>x++</code> は <code>x = x + 1</code> と同じです。'),
      T('宣言だけしても中身は undefined', 'Declaration', '<code>let total;</code> とだけ書くと、中身は undefined。足し算すると NaN になるので、<code>let total = 0;</code> のように最初の値を入れます。'),
    ]),
    { title:'名前の付け方の見分け方', note:'名前の書き方を見ると、それが何なのかの見当がつきます。',
      table:{ head:['書き方', '見た目', 'よく使う所'], rows:[
        ['キャメルケース', '<code>userName</code>', 'JavaScript の変数・関数'],
        ['パスカルケース', '<code>UserCard</code>', 'クラス、React の部品（コンポーネント）、型'],
        ['スネークケース', '<code>user_name</code>', 'Python の変数・関数、データベースの列名'],
        ['大文字スネーク', '<code>MAX_COUNT</code>', '変えない設定値、環境変数（<code>API_KEY</code>）'],
        ['ケバブケース', '<code>user-card</code>', 'ファイル名、CSS のクラス名、URL'],
        ['is / has / can で始まる', '<code>isOpen</code> <code>hasError</code>', 'true / false が入る変数'],
        ['複数形', '<code>users</code> <code>items</code>', '配列（一覧）'],
        ['handle / on で始まる', '<code>handleClick</code> <code>onSubmit</code>', 'クリックや送信のときに動く関数'],
        ['get / fetch / set で始まる', '<code>getUser</code> <code>fetchPosts</code>', '取ってくる・通信で取ってくる・設定する関数'],
        ['_ で始まる', '<code>_cache</code>', '「内部用なので外から触らないで」という目印'],
      ] } },
  ]});

/* ================= 3. 条件とくり返し ================= */
TABS.push({ id:'flow', label:'条件とくり返し', icon:'🔀',
  intro:'プログラムの流れを変えるのは、たった2つ。<b>条件分岐（もし〜なら）</b>と<b>くり返し</b>です。入力を切り替えて、通る行がどう変わるかを見てください。「なぜかこの処理が動かない」は、たいてい<b>条件の読み違い</b>か<b>くり返しの回数のずれ</b>です。',
  sections:[
    C('触って理解する', [
      { name:'もし〜なら（if / else if / else）', en:'if statement', h:480, wide:true, tags:['基本','体験','最重要'], demo:'<div class="t"></div>',
        init:(el) => tracer($(el, '.t'), {
          inputs:{ label:'年齢を変える', opts:[['8 歳', 8], ['30 歳', 30], ['70 歳', 70], ['13 歳', 13]], start:1 },
          code:(age) => L('function price(age) {', '  if (age < 13) {', '    return 500;   // 子ども', '  } else if (age >= 65) {', '    return 700;   // シニア', '  }', '  return 1000;    // 大人', '}', '', `const fee = price(${age});`, "console.log(fee + '円');"),
          run:(R, age) => {
            const G = 'プログラム全体', F = `price(${age})`; let fee;
            R(10, `price(${age}) を呼び出します。1行目へジャンプ。`, {}, { stack:[G] });
            R(1, `引数 age に ${age} が入ります。`, { age }, { stack:[G, F] });
            const c1 = age < 13;
            R(2, `<code>age &lt; 13</code> → <code>${age} &lt; 13</code> は <b>${c1}</b>。` + (c1 ? '中（3行目）に入ります。' : '<b>{ } の中は飛ばして</b>、次の else if へ。'), { age }, { stack:[G, F] });
            if (c1){ fee = 500; R(3, '<b>return 500</b>：ここで関数は終わり。下の行はもう実行されません。', { age }, { stack:[G, F] }); }
            else {
              const c2 = age >= 65;
              R(4, `<code>age &gt;= 65</code> → <code>${age} &gt;= 65</code> は <b>${c2}</b>。` + (c2 ? '中（5行目）へ。' : '中は飛ばします。'), { age }, { stack:[G, F] });
              if (c2){ fee = 700; R(5, '<b>return 700</b>：関数はここで終わり。', { age }, { stack:[G, F] }); }
              else { fee = 1000; R(7, 'どの条件にも当てはまらなかったので、最後の <b>return 1000</b> まで来ました。', { age }, { stack:[G, F] }); }
            }
            R(10, `戻ってきた ${fee} が fee に入ります。`, { fee }, { stack:[G] });
            R.log(fee + '円'); R(11, `「${fee}円」と表示。` + (age === 13 ? '13歳は <code>&lt; 13</code> に当てはまらないので<b>大人</b>扱い。「13歳未満」か「13歳以下」か、<b>境目の数</b>はバグが出やすい所です。' : '年齢を変えると、通る行が変わります。13歳（境目）も試してください。'), { fee }, { stack:[G], cls:age === 13 ? 'warn' : '' });
          } }),
        desc:'条件は<b>上から順に</b>調べられ、最初に当てはまった所だけが実行されます。<code>return</code> があると、その下の行は実行されません。',
        prompt:'この料金の判定で、境目の値（12歳・13歳・64歳・65歳）でそれぞれ何円になるか表にして。仕様（13歳未満は子ども、65歳以上はシニア）と合っているか確認して。\n【コード】' },
      { name:'くり返し（for）と「1つずれ」', en:'for loop & off-by-one', h:500, wide:true, tags:['体験','注意','最重要'], demo:'<div class="t"></div>',
        init:(el) => tracer($(el, '.t'), {
          inputs:{ label:'くり返しの条件', opts:[['i &lt; prices.length（正しい）', '<'], ['i &lt;= prices.length（まちがい）', '<=']] },
          code:(op) => L('const prices = [300, 450, 120];', 'let total = 0;', `for (let i = 0; i ${op} prices.length; i++) {`, '  total = total + prices[i];', '}', 'console.log(total);'),
          run:(R, op) => {
            const prices = [300, 450, 120]; let total = 0;
            R(1, '値段の配列。<b>0番目＝300、1番目＝450、2番目＝120</b>。要素は3つなので length は 3。', { prices });
            R(2, '合計を入れる箱を 0 で用意。', { prices, total });
            for (let i = 0; ; i++){
              const ok = op === '<' ? i < prices.length : i <= prices.length;
              R(3, `i = ${i}。条件 <code>${i} ${op === '<' ? '&lt;' : '&lt;='} 3</code> は <b>${ok}</b>` + (ok ? ' → 中へ。' : ' → くり返し終了。'), { prices, total, i });
              if (!ok) break;
              const before = total; total = total + prices[i];
              R(4, `prices[${i}] は <b>${fmt(prices[i])}</b>。total = ${before} + ${fmt(prices[i])} → <b>${fmt(total)}</b>` + (prices[i] === undefined ? '。<b>3番目は存在しない</b>ので undefined。数に undefined を足すと NaN（数ではない）になってしまいました。' : ''), { prices, total, i }, { cls:prices[i] === undefined ? 'bad' : '' });
              R(3, `1周終わり。<code>i++</code> で i を1増やして、条件を調べ直します。`, { prices, total, i:i + 1 });
            }
            R.log(total); R(6, op === '<' ? `合計 ${total}。` : '合計が <b>NaN</b>。<code>&lt;=</code> にすると1回多く回り、存在しない要素を読んでしまいます。これが「<b>1つずれ（off-by-one）</b>」のバグです。', { prices, total }, { cls:op === '<' ? 'ok' : 'bad' });
          } }),
        desc:'配列は0番目から数えるので、最後の番号は <b>length − 1</b>。<code>&lt;</code> と <code>&lt;=</code> の1文字の違いで結果が壊れます。今は <code>for (const p of prices)</code> と書けば、番号を使わずに済みます。',
        prompt:'このコードのくり返しで、回数が1回多い・少ない（off-by-one）の心配がないか確認して。番号を使わない for...of や reduce で書ける所は書き換えて。\n【コード】' },
      { name:'while と無限ループ', en:'while loop', h:480, wide:true, tags:['体験','注意'], demo:'<div class="t"></div>',
        init:(el) => tracer($(el, '.t'), {
          inputs:{ label:'最初の n', opts:[['1', 1], ['30', 30], ['0（危険）', 0]] },
          code:(s) => L(`let n = ${s};`, 'let count = 0;', 'while (n < 100) {', '  n = n * 2;', '  count++;', '}', "console.log(count + '回');"),
          speed:900,
          run:(R, s) => {
            let n = s, count = 0;
            R(1, `n に ${s}。`, { n }); R(2, '回数を数える count。', { n, count });
            for (let loop = 0; ; loop++){
              const ok = n < 100;
              if (s === 0 && loop >= 3){ R(3, `n は何回かけても <b>0 のまま</b>（0 に何をかけても 0）。条件 <code>0 &lt; 100</code> がずっと true なので、<b>永遠に終わりません＝無限ループ</b>。本物ならタブが固まります（見本はここで止めています）。`, { n, count }, { cls:'bad' }); return; }
              R(3, `条件 <code>${n} &lt; 100</code> は <b>${ok}</b>` + (ok ? ' → 中へ。' : ' → くり返し終了。'), { n, count });
              if (!ok) break;
              n = n * 2; R(4, `n を2倍 → ${n}`, { n, count });
              count++; R(5, `count を1増やす → ${count}`, { n, count });
            }
            R.log(count + '回'); R(7, `${count}回くり返して 100 以上になりました。`, { n, count }, { cls:'ok' });
          } }),
        desc:'while は「条件が true の間ずっと」くり返します。<b>中で条件に関わる変数が変わらないと止まりません</b>。画面が固まったら、まず while とくり返しの条件を疑います。',
        prompt:'このくり返しが必ず終わるか確認して。終わらない入力がありえるなら、その入力の例と、上限回数を付けるなどの直し方を教えて。\n【コード】' },
    ], null, true),
    S('条件（もし〜なら）', [
      T('if / else', 'if / else', '<code>if (条件) { A } else { B }</code>：条件が true なら A、false なら B。', null, ['基本']),
      T('else if', 'else if', '条件をいくつも並べるとき。<b>上から順に調べて、最初に当てはまった1つだけ</b>が実行されます。順番を入れ替えると結果が変わることがあります。'),
      T('比較の記号', 'Comparison', '<code>&lt;</code> 未満、<code>&lt;=</code> 以下、<code>&gt;</code> より大きい、<code>&gt;=</code> 以上、<code>===</code> 等しい、<code>!==</code> 等しくない。<b>「以上・以下」は境目を含む</b>。'),
      T('=== と ==', 'Strict equality', '<code>===</code> は型も比べ、<code>==</code> は型をそろえてから比べます。<code>0 == \'\'</code> が true になるなど思わぬ一致が起きるので、基本は <code>===</code>。'),
      T('かつ・または・ではない', '&& || !', '<code>a &amp;&amp; b</code>（両方）、<code>a || b</code>（どちらか）、<code>!a</code>（逆）。<code>!isLoggedIn</code> は「ログインしていない」。'),
      T('truthy と falsy', 'Truthy / falsy', 'if の中では、<b>false・0・\'\'（空文字）・null・undefined・NaN</b> が「いいえ」扱い、それ以外は全部「はい」扱いです。<code>if (items.length)</code> は「1件以上あれば」。', null, ['注意']),
      T('三項演算子', 'Ternary', '<code>条件 ? A : B</code> は、if/else を1行で書いて値を返す形。<code>const label = isOpen ? \'閉じる\' : \'開く\';</code>'),
      T('&& で表示を切り替える', 'Short-circuit', "<code>isError &amp;&amp; '失敗しました'</code> は、isError が true のときだけ右側を返します。React でよく見る書き方です。"),
      T('switch', 'switch', '1つの値をいくつもの候補と比べるとき。各 case の最後に <code>break</code> がないと、下の case まで続けて実行されてしまいます。'),
      T('早めの return（ガード節）', 'Guard clause', '<code>if (!user) return;</code> のように、条件に合わないときは最初に抜ける書き方。下の処理は「user がいる前提」で読めるので、ネストが浅くなります。'),
    ]),
    S('くり返し', [
      T('for', 'for loop', '<code>for (let i = 0; i &lt; n; i++)</code>：「i を0から始めて、n 未満の間、1ずつ増やしながら」くり返す。3つの部分は「最初・続ける条件・1周ごとにすること」。', null, ['基本']),
      T('for...of', 'for...of', '<code>for (const item of items)</code>：配列の要素を1つずつ取り出す。番号がいらないときはこちらが読みやすく、1つずれも起きません。'),
      T('forEach', 'forEach', '<code>items.forEach(item =&gt; { … })</code>：配列の全要素に同じ処理をする。途中で止められない、await が効かない点に注意。'),
      T('while', 'while', '条件が true の間くり返す。回数が決まっていないとき（データが尽きるまで、など）に使います。'),
      T('break と continue', 'break / continue', '<code>break</code> はくり返しを途中でやめる、<code>continue</code> はその周だけ飛ばして次の周へ。'),
      T('無限ループ', 'Infinite loop', 'くり返しの条件がずっと true のまま終わらない状態。画面が固まる、ファンが回り続ける、などで気づきます。', null, ['注意']),
      T('1つずれ（off-by-one）', 'Off-by-one error', '回数が1回多い・少ないバグ。0から数えるか1から数えるか、<code>&lt;</code> か <code>&lt;=</code> かで起きます。', null, ['注意']),
      T('ネスト（入れ子）', 'Nesting', 'くり返しの中のくり返し。100件×100件で1万回になるので、データが増えると急に遅くなる原因になります。'),
    ]),
  ]});

/* ================= 4. 関数 ================= */
TABS.push({ id:'func', label:'関数', icon:'🧩',
  intro:'関数は<b>名前の付いた手順</b>です。値を受け取り（引数）、何かをして、結果を返します（戻り値）。コードを読むときは、関数の中身に入る前に<b>「何を受け取って、何を返すか」</b>だけを見ると、全体の流れがすっきり分かります。',
  sections:[
    C('触って理解する', [
      { name:'関数の各部の名前', en:'Anatomy of a function', h:400, tags:['基本','最重要'], demo:'<div class="a"></div>',
        init:(el) => anat($(el, '.a'), {
          code:L('function ⟦name|addTax⟧(⟦arg|price⟧) {', '⟦body|  const rate = 0.1;⟧', '  ⟦ret|return price + price * rate;⟧', '}', '', 'const total = ⟦call|addTax(1000)⟧;  // 1100', '', '// 同じ意味の短い書き方（アロー関数）', 'const addTax2 = ⟦arrow|(price) => price + price * 0.1⟧;'),
          parts:[
            ['name', '名前', '関数の名前。<b>動詞＋名詞</b>（addTax＝税を足す）で、何をするかが分かるように付けます。'],
            ['arg', '引数', '関数が<b>受け取る値</b>の入れ物。呼ぶときに渡した値（ここでは 1000）が入ります。いくつでも並べられます。'],
            ['body', '中身', '{ } の中が手順。ここで作った変数（rate）は<b>関数の中だけ</b>で使えます。'],
            ['ret', '戻り値', '<b>return</b> の右の値が、呼び出した所に返されます。return を通ると、そこで関数は終わります。'],
            ['call', '呼び出し', '名前のあとに ( ) を付けると実行されます。<code>addTax</code> だけだと「関数そのもの」で、実行はされません。'],
            ['arrow', 'アロー関数', '<code>(引数) =&gt; 戻り値</code> の短い書き方。{ } を省くと、右側の値がそのまま返されます。'],
          ] }),
        desc:'関数を読むときは、まず<b>名前・引数・return</b>の3つだけを見ます。中身は、その関数の動きがおかしいと分かってから読めば十分です。',
        prompt:'このファイルの関数をすべて表にして。列は「名前・受け取るもの（引数と型）・返すもの・やっていること（1行）・外の変数を書き換えるか」。\n【コード】' },
      { name:'関数の中から関数を呼ぶ', en:'Call stack', h:500, wide:true, tags:['体験'], demo:'<div class="t"></div>',
        init:(el) => tracer($(el, '.t'), {
          code:L('function tax(price) {', '  return Math.round(price * 1.1);', '}', 'function total(items) {', '  let sum = 0;', '  for (const p of items) {', '    sum += tax(p);', '  }', '  return sum;', '}', 'const bill = total([100, 250]);', 'console.log(bill);'),
          speed:1300,
          run:(R) => {
            const G = 'プログラム全体', items = [100, 250], T1 = 'total(items)', st2 = { stack:[G, T1] };
            R(11, 'total([100, 250]) を呼びます。4行目へジャンプ。', {}, { stack:[G] });
            R(4, 'items に [100, 250] が入ります。', { items }, st2);
            let sum = 0; R(5, 'sum を 0 で用意。', { items, sum }, st2);
            for (const p of items){
              R(6, `items から1つ取り出して p = ${p}。`, { items, sum, p }, st2);
              R(7, `tax(${p}) を呼びます。<b>total はここで一時停止</b>して、tax の結果を待ちます。`, { items, sum, p }, st2);
              const t = Math.round(p * 1.1), st3 = { stack:[G, T1, `tax(${p})`] };
              R(1, `price に ${p}。<b>tax の中からは total の変数（sum など）は見えません</b>。`, { price:p }, st3);
              R(2, `${p} × 1.1 を四捨五入して <b>${t}</b> を返します。`, { price:p }, st3);
              sum += t; R(7, `戻ってきた ${t} を sum に足して <b>${sum}</b>。total の続きから再開です。`, { items, sum, p }, st2);
            }
            R(9, `くり返しが終わったので sum（${sum}）を返します。`, { items, sum }, st2);
            R(11, `bill に ${sum}。`, { bill:sum }, { stack:[G] });
            R.log(sum); R(12, '表示しておしまい。右の「実行中の関数」は、呼ぶたびに上に積まれ、return で取り除かれます。エラー文に出る<b>スタックトレース</b>は、この積み重なりの記録です。', { bill:sum }, { stack:[G] });
          } }),
        desc:'関数が関数を呼ぶと、呼んだ側は<b>一時停止</b>して結果を待ちます。エラー文の「at tax (…:2)」「at total (…:7)」という並びは、この積み重なり（コールスタック）です。',
        prompt:'このエラーのスタックトレースを読んで、どの関数がどの順番で呼ばれてエラーになったかを、上から順に説明して。自分で書いたコードの行と、ライブラリの中の行を分けて。\n【エラー全文】' },
      { name:'同じ名前でも別の箱（スコープ）', en:'Scope', h:460, wide:true, tags:['体験','注意'], demo:'<div class="t"></div>',
        init:(el) => tracer($(el, '.t'), {
          code:L('let count = 0;', 'function up() {', '  let count = 10;', '  count++;', '  return count;', '}', 'const r = up();', 'console.log(r, count);'),
          run:(R) => {
            const G = 'プログラム全体', U = 'up()', O = 'count（外）', I = 'count（up の中）';
            R(1, '外側に count を作って 0。', { [O]:0 }, { stack:[G] });
            R(7, 'up() を呼びます。', { [O]:0 }, { stack:[G] });
            R(3, '関数の中で <b>let count</b> と書いたので、<b>同じ名前の別の箱</b>ができました。中からは近いほう（中）の count が見えます。', { [O]:0, [I]:10 }, { stack:[G, U] });
            R(4, 'count++ で変わるのは中の箱だけ → 11。', { [O]:0, [I]:11 }, { stack:[G, U] });
            R(5, '11 を返します。関数が終わると、中の count は消えます。', { [O]:0, [I]:11 }, { stack:[G, U] });
            R(7, 'r に 11。', { [O]:0, r:11 }, { stack:[G] });
            R.log(11, 0); R(8, '外の count は <b>0 のまま</b>。3行目の <code>let</code> を消すと、中の count++ は外の箱を書き換えて「11 11」になります。<b>同じ名前の変数があったら、どこで作られたものか</b>を確かめます。', { [O]:0, r:11 }, { stack:[G], cls:'warn' });
          } }),
        desc:'変数が使える範囲を<b>スコープ</b>と言います。<code>{ }</code> の中で let・const で作った変数は、その中だけのもの。「値を変えたのに反映されない」ときは、別の箱を変えていないかを疑います。',
        prompt:'このコードで、同じ名前の変数が別の場所（関数の中と外など）で作られていないか確認して。あれば、どちらがどこで使われているか説明して、まぎらわしくない名前に変える案を出して。\n【コード】' },
    ], null, true),
    S('関数の言葉', [
      T('関数', 'Function', '名前の付いた手順。同じ処理を何度も使うとき、長い処理を分けて読みやすくするときに作ります。', null, ['基本']),
      T('引数（ひきすう）', 'Argument / parameter', '関数に渡す値。定義側の入れ物（price）を「仮引数」、呼ぶときに渡す値（1000）を「実引数」と呼び分けることもあります。', null, ['基本']),
      T('戻り値（返り値）', 'Return value', '<code>return</code> で返す値。return がない関数を呼ぶと、結果は undefined です。', null, ['基本']),
      T('return のない関数', 'Side effects', '画面を書き換える、保存する、通信するなど「外に何かをする」関数。こういう働きを<b>副作用</b>と呼びます。'),
      T('アロー関数', 'Arrow function', '<code>(a, b) =&gt; a + b</code>。<code>{ }</code> を付けたときは、return を書かないと値が返らない点に注意。'),
      T('無名関数', 'Anonymous function', '名前のない関数。<code>button.addEventListener(\'click\', () =&gt; { … })</code> のように、その場で渡すときに使います。'),
      T('コールバック', 'Callback', '「あとで呼んでね」と<b>引数として渡す関数</b>。クリックされたとき、通信が終わったとき、配列の各要素に、などで呼ばれます。', null, ['最重要']),
      T('メソッド', 'Method', 'オブジェクトに付いている関数。<code>list.push(x)</code> の push、<code>text.trim()</code> の trim など。「〜の〜する」と読みます。'),
      T('組み込み関数', 'Built-in', '最初から使える関数。<code>Math.round</code>（四捨五入）、<code>parseInt</code>、<code>JSON.parse</code>、<code>setTimeout</code> など。名前で検索すると MDN（公式解説）が見つかります。'),
      T('デフォルト引数', 'Default parameter', '<code>function greet(name = \'ゲスト\')</code>：渡されなかったときに使う値。'),
      T('スコープ', 'Scope', '変数が使える範囲。<code>{ }</code> の中で作った変数は外から見えません。'),
      T('クロージャ', 'Closure', '関数が、作られた場所の変数を覚えている仕組み。カウンターや設定を閉じ込める書き方で見かけます。'),
      T('再帰', 'Recursion', '関数が自分自身を呼ぶこと。フォルダの中のフォルダをたどる、など入れ子の処理で使います。終わる条件がないと止まりません。'),
      T('import / export', 'Modules', '<code>export</code> で他のファイルに貸し出し、<code>import { 名前 } from \'./ファイル\'</code> で借りてきます。<code>export default</code> はそのファイルの代表1つ。', null, ['基本']),
      T('クラスとインスタンス', 'Class / instance', '<code>class</code> は設計図、<code>new 設計図()</code> で作った実物がインスタンス。<code>this</code> は「この実物自身」を指します。'),
      T('イベントハンドラ', 'Event handler', 'クリック・入力・送信などが起きたときに呼ばれる関数。<code>onClick</code>、<code>handleSubmit</code> のような名前が多いです。'),
    ]),
  ]});
})();
