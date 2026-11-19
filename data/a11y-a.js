/* アクセシビリティ辞典 — A: 共通の部品（見本ページ・読み上げの再現・コントラスト計算） / 基本と体験 / 読み上げ / 色と文字 / キーボード */
(function(){
const { $, $$, esc, seg } = KIT;
const S = (title, items, note) => ({ title, note, layout:'rows', items });
const C = (title, items, note, lg) => ({ title, note, layout:lg ? 'cards lg' : 'cards', items });
const T = (name, en, desc, prompt, tags, more) => Object.assign({ name, en, desc, prompt, tags }, more || {});
const L = (...a) => a.join('\n');
const verdict = (el, cls, html) => { el.classList.remove('ok', 'bad', 'warn'); if (cls) el.classList.add(cls); el.innerHTML = html; };
const MK = (a) => `<span class="ax-mk ${a}">${{ ok:'○', warn:'△', bad:'×' }[a]}</span>`;
let UID = 0;

/* ---------- 色覚の見え方を再現するフィルター（おおまかな近似） ---------- */
(function filters(){ if (document.getElementById('ax-filters')) return;
  const m = { p:'0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0', d:'0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0', t:'0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0' };
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.id = 'ax-filters'; s.setAttribute('aria-hidden', 'true'); s.setAttribute('width', '0'); s.setAttribute('height', '0'); s.style.position = 'absolute';
  s.innerHTML = Object.entries(m).map(([k, v]) => `<filter id="ax-f-${k}" color-interpolation-filters="linearRGB"><feColorMatrix type="matrix" values="${v}"/></filter>`).join('');
  const put = () => document.body.append(s); document.body ? put() : addEventListener('DOMContentLoaded', put);
})();

/* ---------- 見本の小さなページ（よくない作り / 配慮した作り） ---------- */
const LOGO = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><rect width="28" height="28" rx="6" fill="#1e3a8a"/><path d="M8 18c3-8 9-8 12 0" stroke="#fde68a" stroke-width="3" fill="none"/></svg>');
function sample(good){ const u = 'ax' + (++UID);
  return good ? `<div class="ax-mini" lang="ja">
  <header class="ax-top"><img src="${LOGO}" alt="" width="28" height="28"><h1 class="ax-big">サンプル商店</h1></header>
  <h2 class="ax-h">お知らせ</h2>
  <p>年末年始は営業時間が変わります。<a href="#">年末年始の営業時間を見る</a></p>
  <div class="ax-r"><label for="${u}q">商品を探す</label><input id="${u}q" type="search"><button type="button" class="ic" aria-label="検索">🔍</button></div>
  <div class="ax-r"><span style="color:#166534">✓ 在庫あり</span><span style="color:#b91c1c">✕ 在庫なし</span></div>
  <button type="button">カートに入れる</button>
</div>` : `<div class="ax-mini">
  <div class="ax-top"><img src="${LOGO}" data-file="logo_final2.png" width="28" height="28"><div class="ax-big">サンプル商店</div></div>
  <div class="ax-h">お知らせ</div>
  <p>年末年始は営業時間が変わります。くわしくは<a href="#">こちら</a>。</p>
  <div class="ax-r"><input type="text" placeholder="商品を探す"><span class="ax-icbtn" data-click>🔍</span></div>
  <div class="ax-r"><span style="color:#8fd18f">● 在庫あり</span><span style="color:#f19a9a">● 在庫なし</span></div>
  <div class="ax-btn" data-click>カートに入れる</div>
</div>`; }
const noNav = (root) => root.addEventListener('click', (e) => { if (e.target.closest('a[href="#"]')) e.preventDefault(); });

/* ---------- 読み上げの再現（スクリーンリーダーの「だいたいの」読み方） ---------- */
const RJ = { button:'ボタン', link:'リンク', img:'画像', textbox:'編集', searchbox:'検索 編集', checkbox:'チェックボックス', navigation:'ナビゲーション ランドマーク', banner:'バナー ランドマーク', main:'メイン ランドマーク' };
function roleOf(el){ const r = el.getAttribute('role'); if (r) return r; const t = el.tagName.toLowerCase();
  if (t === 'button') return 'button'; if (t === 'a' && el.hasAttribute('href')) return 'link';
  if (t === 'img') return el.getAttribute('alt') === '' ? 'presentation' : 'img';
  if (/^h[1-6]$/.test(t)) return 'heading';
  if (t === 'input'){ const ty = (el.getAttribute('type') || 'text').toLowerCase(); return ty === 'checkbox' ? 'checkbox' : ty === 'search' ? 'searchbox' : ['button', 'submit'].includes(ty) ? 'button' : 'textbox'; }
  if (t === 'textarea') return 'textbox'; if (t === 'ul' || t === 'ol') return 'list'; if (t === 'nav') return 'navigation'; if (t === 'main') return 'main';
  if (t === 'header'){ const c = el.parentElement.closest('main, article, section, .ax-mini'); return !c || c.classList.contains('ax-mini') ? 'banner' : null; } return null; }
function textOf(el){ let s = ''; el.childNodes.forEach(n => { if (n.nodeType === 3) s += n.textContent; else if (n.nodeType === 1 && n.getAttribute('aria-hidden') !== 'true'){ s += n.tagName === 'IMG' ? (n.getAttribute('alt') || '') : textOf(n); } }); return s.replace(/\s+/g, ' '); }
function nameOf(el, root){ const lb = el.getAttribute('aria-labelledby'); if (lb) return lb.split(/\s+/).map(id => (root.querySelector('#' + CSS.escape(id)) || {}).textContent || '').join(' ').trim();
  const al = el.getAttribute('aria-label'); if (al) return al.trim(); const t = el.tagName.toLowerCase();
  if (t === 'img') return el.hasAttribute('alt') ? el.getAttribute('alt') : null;
  if (['input', 'select', 'textarea'].includes(t)){ let s = ''; if (el.id){ const l = root.querySelector(`label[for="${CSS.escape(el.id)}"]`); if (l) s = textOf(l).trim(); } if (!s){ const l = el.closest('label'); if (l) s = textOf(l).trim(); } if (!s && el.title) s = el.title; if (!s && el.placeholder) return { ph:el.placeholder }; return s; }
  return textOf(el).trim() || el.title || ''; }
const VAGUE = ['こちら', 'ここ', 'くわしくは', '詳しくは', 'もっと見る', 'click here', 'here'];
function announce(root){ const out = [];
  const walk = (el) => { for (const n of el.childNodes){
    if (n.nodeType === 3){ const t = n.textContent.replace(/\s+/g, ' ').trim(); if (t) out.push({ t }); continue; }
    if (n.nodeType !== 1 || n.getAttribute('aria-hidden') === 'true' || n.hidden || getComputedStyle(n).display === 'none') continue;
    if (n.dataset.click !== undefined){ out.push({ t:textOf(n).trim(), c:'bad', w:'見た目はボタンでも<b>ただの文字</b>として読まれ、キーボードでも押せません' + (/^\p{Extended_Pictographic}/u.test(textOf(n).trim()) ? '。絵文字は「虫眼鏡」のような絵文字の名前で読まれます' : '') }); continue; }
    if (n.tagName === 'LABEL' && n.htmlFor){ out.push({ t:textOf(n).trim() }); continue; }
    const r = roleOf(n);
    if (!r || r === 'presentation' || r === 'none'){ if (n.tagName !== 'IMG') walk(n); continue; }
    if (r === 'list'){ out.push({ t:`リスト ${n.querySelectorAll(':scope > li').length}項目` }); walk(n); continue; }
    if (['navigation', 'banner', 'main'].includes(r)){ out.push({ t:RJ[r] }); walk(n); continue; }
    if (r === 'status' || r === 'alert'){ walk(n); continue; }
    const nm = nameOf(n, root);
    if (r === 'img'){ out.push(nm === null ? { t:`${n.dataset.file || '画像'} 画像`, c:'bad', w:'alt がないので、<b>ファイル名</b>が読まれたり、ただ「画像」とだけ読まれたりします' } : { t:`${nm} 画像` }); continue; }
    if (r === 'heading'){ out.push({ t:`見出し レベル${n.getAttribute('aria-level') || n.tagName[1]} ${nm}` }); continue; }
    if (r === 'textbox' || r === 'searchbox'){ const st = (n.required || n.getAttribute('aria-required') === 'true' ? ' 必須' : '') + (n.getAttribute('aria-invalid') === 'true' ? ' 無効な入力' : '');
      const ds = (n.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean).map(id => (root.querySelector('#' + CSS.escape(id)) || {}).textContent || '').join(' ').trim();
      if (nm && nm.ph) out.push({ t:`${RJ[r]}${st} ${nm.ph}`, c:'warn', w:'ラベルがなく、<b>プレースホルダーが名前の代わり</b>。入力すると見えなくなり、読み方もソフトによってまちまちです' });
      else if (!nm) out.push({ t:RJ[r] + st, c:'bad', w:'何を入力する欄か分かりません' });
      else out.push({ t:`${nm} ${RJ[r]}${st}${ds ? ' ' + ds : ''}` }); continue; }
    if (r === 'checkbox'){ out.push({ t:`${nm} チェックボックス ${n.checked ? 'チェックあり' : 'チェックなし'}` }); continue; }
    if (r === 'button' || r === 'link'){ const ex = n.getAttribute('aria-expanded'); const st = ex ? (ex === 'true' ? ' 展開' : ' 折りたたみ') : n.getAttribute('aria-pressed') === 'true' ? ' オン' : '';
      if (!nm) out.push({ t:RJ[r] + st, c:'bad', w:'名前がないので、何のボタン・リンクか分かりません' });
      else if (r === 'link' && VAGUE.includes(nm)) out.push({ t:`${nm} ${RJ[r]}`, c:'warn', w:'リンクだけを順に聞く人には、<b>行き先が分かりません</b>' });
      else out.push({ t:`${nm} ${RJ[r]}${st}` }); continue; }
    out.push({ t:`${nm} ${r}` }); } };
  walk(root); return out; }
const sayList = (items) => items.map((x, i) => `<li class="${x.c || ''}"><span class="n">${i + 1}</span><span>${x.c ? MK(x.c) + ' ' : ''}<span class="v">${esc(x.t)}</span>${x.w ? `<small>${x.w}</small>` : ''}</span></li>`).join('');
// 実際に声で読み上げる（ブラウザの音声合成。使えない環境では何もしない）
function speak(text){ try{ if (!('speechSynthesis' in window)) { VD.toast && VD.toast('このブラウザは読み上げに対応していません'); return; } speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'ja-JP'; u.rate = 1.15; speechSynthesis.speak(u); }catch(e){} }
const hush = () => { try{ speechSynthesis.cancel(); }catch(e){} };

/* ---------- コントラスト比（WCAG の計算式） ---------- */
const hex2rgb = (h) => { h = String(h).trim().replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); if (!/^[0-9a-f]{6}$/i.test(h)) return null; const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const lum = (rgb) => { const f = (v) => (v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]); };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const rgb2hex = (c) => '#' + c.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
const css2rgb = (s) => { const m = String(s).match(/\d+(\.\d+)?/g); return m ? m.slice(0, 3).map(Number) : null; };

window.AXH = { S, C, T, L, verdict, MK, sample, noNav, roleOf, nameOf, textOf, announce, sayList, speak, hush, hex2rgb, ratio, css2rgb, rgb2hex, uid:() => 'ax' + (++UID) };

/* ================= 1. 基本と体験 ================= */
const MODES = [['そのまま', ''], ['ぼやけて見える', 'ax-blur'], ['まぶしい・暗い', 'ax-dim'], ['1型色覚（赤）', 'ax-p'], ['2型色覚（緑）', 'ax-d'], ['画面を見ない', 'ax-hide']];
const MODE_NOTE = [
  'ふだんの見え方です。下のボタンで、いろいろな見え方・使い方に切り替えてみてください。',
  '視力が弱い（ロービジョン）、メガネを外している、疲れ目のときの見え方の例。<b>小さい文字・薄い文字</b>から読めなくなります。拡大して使う人も多くいます。',
  '屋外の日差しの下、画面の明るさを下げているときなど。<b>コントラストが低い色</b>は、誰にとっても読みにくくなります。',
  '赤が暗く見え、赤と緑の区別がつきにくい見え方の近似。日本人男性の約5%が、なんらかの色覚の特性を持つといわれます。<b>「●在庫あり／●在庫なし」を色だけで区別</b>すると伝わりません。',
  '緑と赤の区別がつきにくい見え方の近似（色覚の特性でもっとも多いタイプ）。',
  '目の見えない人は、<b>スクリーンリーダー</b>（読み上げソフト）で、ページの中身を上から順に音声で聞きます。右に、このページがどう読まれるかの例を出しています。',
];
TABS.push({ id:'basics', label:'基本と体験', icon:'🧭',
  intro:'アクセシビリティは、<b>障害のある人・高齢の人・一時的にけがをしている人・まぶしい屋外にいる人</b>など、いろいろな状況の人が<b>同じように使える</b>ようにすることです。特別な機能を足すことより、<b>正しい HTML・十分なコントラスト・キーボードで操作できる</b>といった基本を守ることがほとんどです。公開前の短いチェックは <a href="release.html">公開・品質チェック辞典</a>、テストの方法は <a href="testing.html">テスト・品質辞典</a> にもあります。',
  sections:[
    C('触って理解する', [
      { name:'いろいろな見え方・使い方を体験', en:'Simulate', h:470, wide:true, tags:['体験','最重要'],
        demo:'<div class="kt"><div class="ax-row2"><span class="kt-lbl">作り</span><span class="s1"></span></div><div class="ax-row2"><span class="kt-lbl">見え方</span><span class="s2"></span></div><div class="ax-split"><div class="ax-frame fr"></div><div class="sayw" hidden><div class="kt-row"><span class="kt-lbl">読み上げの例</span><button type="button" class="kt-btn sm sp" style="margin-left:auto">🔊 声で聞く</button></div><ol class="ax-say"></ol></div></div><div class="kt-verdict note"></div></div>',
        init:(el) => { let good = 0, mode = 0; const fr = $(el, '.fr'); noNav(fr);
          const up = () => { fr.innerHTML = sample(good); fr.className = 'ax-frame fr ' + MODES[mode][1]; const blind = mode === 5; $(el, '.sayw').hidden = !blind;
            if (blind) $(el, '.ax-say').innerHTML = sayList(announce($(fr, '.ax-mini')));
            verdict($(el, '.note'), '', MODE_NOTE[mode] + (good ? ' <b>配慮した作り</b>では、色に加えて記号（✓ ✕）や、正しい見出し・ラベルが使われています。' : '')); };
          $(el, '.s1').append(seg(['よくない作り', '配慮した作り'], (i) => { good = i; up(); }, 0).el);
          $(el, '.s2').append(seg(MODES.map(m => m[0]), (i) => { mode = i; hush(); up(); }, 0).el);
          $(el, '.sp').onclick = () => speak(announce($(fr, '.ax-mini')).map(x => x.t).join('、'));
          return hush; },
        desc:'色覚の見え方は、画面の色を計算で変えた<b>おおまかな再現</b>です。実際の見え方は人によって違います。「声で聞く」はブラウザの音声合成で、本物のスクリーンリーダーとは読み方が違います。',
        prompt:'このページを、目の見えない人（スクリーンリーダー利用者）、色の区別がつきにくい人、キーボードだけで操作する人、の3つの立場で使ったときに困る所を挙げて。直し方も、優先度の高い順に教えて。\n【HTML】' },
    ], null, true),
    { title:'4つの原則（WCAG）', note:'国際的なガイドライン WCAG（ウェブコンテンツ・アクセシビリティ・ガイドライン）は、すべての基準を4つの原則にまとめています。',
      table:{ head:['原則', '意味', '例'], rows:[
        ['知覚可能', 'どんな感覚でも、情報を受け取れる', '画像の代替テキスト、動画の字幕、十分なコントラスト、色だけに頼らない'],
        ['操作可能', 'どんな方法でも、操作できる', 'キーボードで操作できる、時間制限を延ばせる、点滅しない、押しやすい大きさ'],
        ['理解可能', '内容と操作が分かる', '分かりやすい言葉、予想どおりに動く、エラーの説明と直し方'],
        ['堅牢（けんろう）', 'いろいろな機器・支援技術で使える', '正しい HTML、名前・役割・状態が支援技術に伝わる'],
      ] } },
    S('はじめに覚える言葉', [
      T('アクセシビリティ', 'Accessibility（a11y）', '使える人・状況をできるだけ広げること。a と y の間に11文字あるので <b>a11y</b> とも書きます。', null, ['基本']),
      T('支援技術', 'Assistive technology', 'スクリーンリーダー（読み上げ）、画面拡大、音声入力、スイッチ操作、点字ディスプレイなど、障害のある人が機器を使うための道具。'),
      T('スクリーンリーダー', 'Screen reader', '画面の内容を音声や点字で伝えるソフト。Windows の NVDA（無料）・ナレーター（標準）、Mac・iPhone の VoiceOver（標準）、Android の TalkBack（標準）など。日本では PC-Talker も使われています。', null, ['最重要']),
      T('一時的・状況的な制約', 'Situational disability', '腕のけが、赤ちゃんを抱いて片手しか使えない、騒がしい電車で音が聞けない、日差しで画面が見にくい。<b>アクセシビリティは障害のある人だけのものではありません</b>。'),
      T('いろいろな特性', 'Kinds of disability', '視覚（全盲・ロービジョン・色覚）、聴覚、運動（手が動かしにくい・ふるえ）、認知・学習（読むのに時間がかかる・覚えるのが苦手）など。年齢とともに、誰でもいくつかを持つようになります。'),
      T('WCAG', 'Web Content Accessibility Guidelines', 'W3C が作る国際的なガイドライン。最新の正式版は <b>WCAG 2.2</b>（2023年10月）。基準ごとに <b>A・AA・AAA</b> のレベルがあり、ふつうは <b>AA</b> を目標にします。', null, ['基本']),
      T('達成基準', 'Success criteria', 'WCAG の1つ1つの基準。「1.4.3 コントラスト（最低限）」のように番号が付いています。この辞典でも番号を併記しています。'),
      T('JIS X 8341-3', 'Japanese standard', '日本のウェブアクセシビリティの規格。今の版（2016年）は WCAG 2.0 と同じ内容で、<b>WCAG 2.2 に合わせる改正作業</b>が進められています（2026年11月時点）。'),
      T('合理的配慮', 'Reasonable accommodation', '障害のある人から求められたときに、負担が重すぎない範囲で対応すること。<b>2024年4月から、民間の事業者にも義務</b>になりました（障害者差別解消法の改正）。くわしくは「確認とルール」タブ。'),
      T('アクセシビリティは誰の得？', 'Benefits', '字幕は音を出せない場所で、キーボード操作は慣れた人の時短に、見出しの構造は検索エンジンにも役立ちます。<b>みんなが使いやすくなる</b>ことがほとんどです。'),
    ]),
  ]});

/* ================= 2. 読み上げ（スクリーンリーダー） ================= */
const ALT = [
  { ctx:'ニュース記事の写真', pic:'📰 市長が式典でテープカットをしている写真', opts:[
    ['（alt なし）', 'bad', 'ファイル名が読まれたり、「画像」とだけ読まれたりします。'],
    ['画像', 'bad', '画像であることは読み上げソフトが伝えるので、意味のない言葉です。'],
    ['写真', 'bad', '何の写真か分かりません。'],
    ['新庁舎の開所式でテープカットをする市長', 'ok', '記事の文脈で<b>写真が伝えていること</b>を短く書けています。'],
  ] },
  { ctx:'アイコンだけのボタン', pic:'☰ メニューを開くアイコン（ボタンの中の画像）', opts:[
    ['（alt なし）', 'bad', 'ボタンの名前がなくなり、「ボタン」とだけ読まれます。'],
    ['三本線のアイコン', 'warn', '見た目の説明より、<b>押すと何が起きるか</b>を書きます。'],
    ['メニューを開く', 'ok', 'ボタンの中の画像の alt は、<b>ボタンの働き</b>を書きます。'],
    ['（alt=""）', 'bad', '飾り扱いになり、ボタンの名前がなくなります。'],
  ] },
  { ctx:'見出しの横の飾り', pic:'🌸 見出しの横に添えた花のイラスト（意味はない）', opts:[
    ['（alt なし）', 'bad', 'ファイル名が読まれ、聞く人のじゃまになります。'],
    ['花のイラスト', 'warn', '意味のない飾りまで読むと、聞く時間がむだに長くなります。'],
    ['（alt=""）', 'ok', '<b>空の alt</b> は「飾りなので読まなくてよい」という合図。読み飛ばされます。CSS の背景にする方法もあります。'],
    ['春のお知らせ', 'warn', '見出しと同じ言葉なら、2回読まれることになります。'],
  ] },
  { ctx:'売上のグラフ画像', pic:'📊 月ごとの売上の棒グラフ（4月から9月）', opts:[
    ['グラフ', 'bad', '何のグラフで、何が分かるのかが伝わりません。'],
    ['月別売上グラフ', 'warn', '何のグラフかは分かりますが、<b>グラフで伝えたいこと</b>が抜けています。'],
    ['4〜9月の月別売上。7月が最高の320万円で、9月は180万円に下がった', 'ok', '要点を alt に書き、細かい数値は<b>本文や表</b>でも示すとさらによくなります。'],
    ['（alt=""）', 'bad', '内容のある画像を飾り扱いにすると、情報がまるごと消えます。'],
  ] },
];
const HEADS = [
  ['見た目だけの見出し', '<div class="ax-mini" lang="ja"><div class="ax-big">サンプル商店</div><div class="ax-h">お知らせ</div><p>年末年始の営業について。</p><div class="ax-h">商品一覧</div><p>人気の商品です。</p><div class="ax-h" style="font-size:13px">新着</div><p>今週入荷した商品。</p></div>', '文字を大きく太くしただけで、<b>見出しのタグ（h1〜h6）がありません</b>。スクリーンリーダーの「見出しで移動」機能が使えず、全部を最初から聞くしかありません。'],
  ['レベルを飛ばした見出し', '<div class="ax-mini" lang="ja"><h1 class="ax-big">サンプル商店</h1><h3 class="ax-h">お知らせ</h3><p>年末年始の営業について。</p><h3 class="ax-h">商品一覧</h3><p>人気の商品です。</p><h5 class="ax-h" style="font-size:13px">新着</h5><p>今週入荷した商品。</p></div>', '文字の大きさに合わせて h3・h5 を選んだため、<b>レベルが飛んでいます</b>。「何かの見出しが抜けているのかな」と迷わせます。見た目の大きさは CSS で決めます。'],
  ['正しい見出し', '<div class="ax-mini" lang="ja"><h1 class="ax-big">サンプル商店</h1><h2 class="ax-h">お知らせ</h2><p>年末年始の営業について。</p><h2 class="ax-h">商品一覧</h2><p>人気の商品です。</p><h3 class="ax-h" style="font-size:13px">新着</h3><p>今週入荷した商品。</p></div>', 'h1 → h2 → h3 と<b>入れ子の構造</b>どおり。目次のように飛び回れます。見出しは1つの文書の「目次」だと考えます。'],
];
TABS.push({ id:'sr', label:'読み上げ', icon:'🔊',
  intro:'スクリーンリーダーは、ページを<b>HTMLの順番どおりに</b>、要素の<b>名前・役割（ボタン・リンク・見出し）・状態</b>を音声で伝えます。見た目がボタンでも HTML がボタンでなければ「ボタン」とは伝わりません。利用者は見出しやリンクだけを拾って移動しながら、ページを「聞いて」います。',
  sections:[
    C('触って理解する', [
      { name:'スクリーンリーダーにはこう聞こえる', en:'What a screen reader hears', h:500, wide:true, tags:['体験','最重要'],
        demo:'<div class="kt"><div class="kt-row"><span class="sg"></span><button type="button" class="kt-btn sm sp" style="margin-left:auto">🔊 声で聞く</button><button type="button" class="kt-btn sm st">■ 止める</button></div><div class="ax-split"><div class="ax-frame fr"></div><div><span class="kt-lbl">読み上げの例（上から順に）</span><ol class="ax-say"></ol></div></div></div>',
        init:(el) => { const fr = $(el, '.fr'); noNav(fr);
          $(el, '.sg').append(seg(['よくない作り', '配慮した作り'], (i) => { hush(); fr.innerHTML = sample(i); $(el, '.ax-say').innerHTML = sayList(announce($(fr, '.ax-mini'))); }, 0).el);
          $(el, '.sp').onclick = () => speak(announce($(fr, '.ax-mini')).map(x => x.t).join('、')); $(el, '.st').onclick = hush; return hush; },
        desc:'読み上げの言い方は、NVDA などの日本語の読み方を参考にした<b>だいたいの例</b>です。ソフトや設定で変わります。本物で確かめるなら、Windows の NVDA（無料）か、Mac の VoiceOver（Cmd＋F5）を使ってみてください。',
        prompt:'次の HTML を、スクリーンリーダーで上から読んだときに何と読まれるかを1行ずつ書いて。名前のないボタン・リンク、alt のない画像、ラベルのない入力欄、見た目だけのボタンや見出しを指摘して、直した HTML も出して。\n【HTML】' },
      { name:'代替テキスト（alt）を選ぶ', en:'Writing alt text', h:400, tags:['体験','最重要'],
        demo:'<div class="kt"><div class="sg"></div><div class="kt-verdict pic" style="font-size:13px;font-weight:700"></div><div class="lc op" style="display:flex;flex-direction:column;gap:4px"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.sg').append(seg(ALT.map(a => a.ctx), (i) => { const a = ALT[i]; $(el, '.pic').innerHTML = a.pic;
            $(el, '.op').innerHTML = a.opts.map((o, j) => `<button type="button" class="kt-btn sm" data-j="${j}" style="text-align:left;white-space:normal">alt=${o[0].startsWith('（') ? o[0] : `"${esc(o[0])}"`}</button>`).join('');
            verdict($(el, '.res'), '', 'いちばんよい alt はどれ？');
            $$(el, '.op button').forEach(b => b.onclick = () => { const [, c, w] = a.opts[+b.dataset.j]; $$(el, '.op button').forEach(x => x.classList.remove('pri')); b.classList.add('pri'); verdict($(el, '.res'), c, `${MK(c)} ${w}`); }); }, 0).el); },
        desc:'alt は「<b>この画像が見えなかったら、代わりに何と書くか</b>」で考えます。同じ写真でも、置かれた場所（記事・ボタン・飾り）で正解が変わります（WCAG 1.1.1）。',
        prompt:'このページの画像それぞれについて、置かれている文脈に合った alt を提案して。飾りの画像には alt="" を、ボタンやリンクの中の画像には働きを書いて。グラフや図は、伝えたい要点も含めて。\n【HTML】' },
      { name:'見出しは「目次」', en:'Heading structure', h:420, wide:true, tags:['体験'],
        demo:'<div class="kt"><div class="sg"></div><div class="ax-split"><div class="ax-frame fr"></div><div><span class="kt-lbl">スクリーンリーダーの見出し一覧</span><ul class="ax-outline"></ul></div></div><div class="kt-verdict note"></div></div>',
        init:(el) => $(el, '.sg').append(seg(HEADS.map(h => h[0]), (i) => { const fr = $(el, '.fr'); fr.innerHTML = HEADS[i][1]; let prev = 0;
          const hs = $$(fr, 'h1,h2,h3,h4,h5,h6'); $(el, '.ax-outline').innerHTML = hs.length ? hs.map(h => { const lv = +h.tagName[1], skip = prev && lv > prev + 1; prev = lv; return `<li class="${skip ? 'skip' : ''}" style="padding-left:${(lv - 1) * 12}px"><b>h${lv}</b>${esc(h.textContent)}${skip ? '（レベルが飛んでいる）' : ''}</li>`; }).join('') : '<li>（見出しがありません）</li>';
          verdict($(el, '.note'), i === 2 ? 'ok' : i === 1 ? 'warn' : 'bad', HEADS[i][2]); }, 0).el),
        desc:'スクリーンリーダーの利用者は、<b>見出しだけを次々に聞いて</b>目的の場所を探すことがよくあります（NVDA なら H キー）。見出しが正しいと、目の見える人の「ざっと眺める」と同じことができます。',
        prompt:'このページの見出し（h1〜h6）を目次の形で書き出して。見た目は見出しなのにタグが違う所、レベルが飛んでいる所、h1 が複数ある所を指摘して、直した構造を提案して。' },
    ], null, true),
    S('読み上げのしくみと言葉', [
      T('アクセシブルな名前', 'Accessible name', 'ボタン・リンク・入力欄などに付く「名前」。ボタンなら中の文字、画像なら alt、入力欄なら label から決まります。<b>名前がない部品は「ボタン」としか読まれません</b>。', null, ['最重要']),
      T('役割（ロール）', 'Role', 'その部品が何か（ボタン・リンク・見出し・チェックボックス…）。正しい HTML タグを使えば自動で付きます。'),
      T('状態', 'State', 'チェックあり／なし、展開／折りたたみ、選択中、無効など。変わったときにも伝わる必要があります（WCAG 4.1.2）。'),
      T('読み上げの順番＝HTMLの順番', 'Reading order', 'CSS で見た目の位置を入れ替えても、読み上げは<b>HTML に書いた順</b>です。<code>order</code> や <code>position</code> で大きく並べ替えると、聞く順番がちぐはぐになります。', null, ['注意']),
      T('見出しで移動', 'Navigate by headings', 'スクリーンリーダーには見出し・リンク・ランドマークだけを順に移動する機能があります。だから<b>見出しとリンクの文字だけで意味が通じる</b>ことが大切です。'),
      T('ランドマーク', 'Landmarks', '<code>&lt;header&gt;</code>・<code>&lt;nav&gt;</code>・<code>&lt;main&gt;</code>・<code>&lt;footer&gt;</code> などで、ページの区画を伝えるもの。「メインの内容へ」一気に移動できます。'),
      T('「こちら」リンク', 'Vague link text', 'リンクだけを一覧で聞くと「こちら、こちら、詳しくは」になり、行き先が分かりません。<b>リンクの文字に行き先を書きます</b>（WCAG 2.4.4）。'),
      T('装飾画像は alt=""', 'Decorative images', '意味のない飾りの画像は、<b>alt を空</b>にします。alt 属性そのものを書かないのは別物で、ファイル名が読まれる原因になります。'),
      T('アイコンだけのボタン', 'Icon buttons', '🔍 や ☰ だけのボタンには <code>aria-label="検索"</code> のように名前を付けます。ツールチップ（title）だけでは伝わらないことがあります。'),
      T('ページの言語 lang', 'Page language', '<code>&lt;html lang="ja"&gt;</code> がないと、日本語を英語の読み方で読み上げてしまうことがあります（WCAG 3.1.1）。'),
      T('ページタイトル', 'Page title', '<code>&lt;title&gt;</code> はタブを切り替えたとき最初に読まれます。「ページ名 | サイト名」の形でページごとに変えます（WCAG 2.4.2）。'),
      T('表の見出し', 'Table headers', 'データの表は <code>&lt;th&gt;</code> で見出しのセルを作ると、「列：値」の組で読まれます。レイアウトのために表を使うのはやめます。'),
      T('見た目から隠す・読み上げから隠す', 'Hiding content', '<code>display:none</code> は両方から消える。<code>aria-hidden="true"</code> は読み上げからだけ消える。見た目だけ消して読ませたいときは「visually-hidden」という CSS を使います。', null, ['注意'], { code:'.visually-hidden {\n  position: absolute; width: 1px; height: 1px;\n  overflow: hidden; clip: rect(0 0 0 0);\n  clip-path: inset(50%); white-space: nowrap;\n}' }),
    ]),
  ]});

/* ================= 3. 色と文字 ================= */
TABS.push({ id:'color', label:'色と文字', icon:'🎨',
  intro:'読みやすさの基本は<b>文字と背景のコントラスト</b>と、<b>色だけで情報を伝えない</b>ことです。さらに、文字を<b>拡大しても崩れない</b>レイアウトにします。配色そのものは <a href="color-typography.html">配色・タイポグラフィ辞典</a> も参考に。',
  sections:[
    C('触って理解する', [
      { name:'コントラスト比を測る', en:'Contrast checker', h:450, tags:['体験','最重要'],
        demo:'<div class="kt"><div class="ax-cc"><span class="kt-lbl">文字</span><input type="color" class="fc" value="#8a8a8a" aria-label="文字の色"><input class="kt-in ft" value="#8a8a8a" aria-label="文字の色（16進数）"><span class="kt-lbl">背景</span><input type="color" class="bc" value="#ffffff" aria-label="背景の色"><input class="kt-in bt" value="#ffffff" aria-label="背景の色（16進数）"></div><div class="ax-prev pv"><div class="s">ふつうの文字（16px）：注文を確定する</div><div class="l">大きい文字（24px）</div></div><div class="kt-row"><span class="ax-ratio rt"></span><button type="button" class="kt-btn sm fix" style="margin-left:auto">文字色を基準に合わせる</button></div><div class="ax-badges bg"></div><div class="kt-verdict note"></div></div>',
        init:(el) => { const fc = $(el, '.fc'), ft = $(el, '.ft'), bc = $(el, '.bc'), bt = $(el, '.bt');
          const up = () => { const f = hex2rgb(ft.value), b = hex2rgb(bt.value); if (!f || !b) return; const r = ratio(f, b);
            $(el, '.pv').style.color = rgb2hex(f); $(el, '.pv').style.background = rgb2hex(b); $(el, '.rt').textContent = r.toFixed(2) + ' : 1';
            const B = [['ふつうの文字 AA', 4.5], ['大きい文字 AA', 3], ['ふつうの文字 AAA', 7], ['大きい文字 AAA', 4.5], ['アイコン・枠線', 3]];
            $(el, '.bg').innerHTML = B.map(([n, t]) => `<span class="kt-badge ${r >= t ? 'ok' : 'bad'}">${r >= t ? '✓' : '✕'} ${n}（${t}）</span>`).join('');
            verdict($(el, '.note'), r >= 4.5 ? 'ok' : r >= 3 ? 'warn' : 'bad', r >= 4.5 ? 'ふつうの文字でも読みやすいコントラストです（WCAG 1.4.3 AA）。' : r >= 3 ? '<b>大きい文字（24px 以上、太字なら約19px 以上）</b>とアイコンなら基準を満たしますが、ふつうの文字には足りません。' : '<b>コントラスト不足</b>。薄いグレーの文字や、写真の上の白い文字でよく起きます。'); };
          const sync = (a, b) => { a.oninput = () => { b.value = a.value; up(); }; }; sync(fc, ft); sync(bc, bt);
          ft.oninput = () => { if (hex2rgb(ft.value)) fc.value = rgb2hex(hex2rgb(ft.value)); up(); }; bt.oninput = () => { if (hex2rgb(bt.value)) bc.value = rgb2hex(hex2rgb(bt.value)); up(); };
          $(el, '.fix').onclick = () => { const f = hex2rgb(ft.value), b = hex2rgb(bt.value); if (!f || !b) return; const to = lum(b) > 0.18 ? [0, 0, 0] : [255, 255, 255]; let c = f;
            for (let k = 0; k <= 1.0001 && ratio(c, b) < 4.5; k += 0.02) c = f.map((v, i) => v + (to[i] - v) * k);
            ft.value = rgb2hex(c); fc.value = ft.value; up(); };
          up(); },
        desc:'計算式は WCAG の相対輝度によるものです。基準は<b>ふつうの文字 4.5:1、大きい文字 3:1</b>（1.4.3）、ボタンの枠や入力欄の境界・アイコンなど<b>文字以外の部品は 3:1</b>（1.4.11）。',
        prompt:'このサイトの CSS の色の組み合わせ（文字色と背景色）を一覧にして、WCAG のコントラスト比を計算して。4.5:1（大きい文字は3:1）に足りない組み合わせには、見た目の雰囲気をなるべく変えない代わりの色を提案して。\n【CSS】' },
      { name:'色だけに頼らない', en:'Don\'t rely on color alone', h:420, tags:['体験','最重要'],
        demo:'<div class="kt"><div class="ax-row2"><span class="kt-lbl">作り</span><span class="s1"></span></div><div class="ax-row2"><span class="kt-lbl">見え方</span><span class="s2"></span></div><div class="ax-frame fr"></div><div class="kt-verdict note"></div></div>',
        init:(el) => { let good = 0, f = 0; const F = ['', 'ax-p', 'ax-d', 'ax-g'];
          const up = () => { const fr = $(el, '.fr'); fr.className = 'ax-frame fr ' + F[f];
            fr.innerHTML = `<div class="ax-mini" lang="ja"><div class="fld"><label>メールアドレス</label><input type="text" value="aki@example" style="border:2px solid ${good ? '#b91c1c' : '#e05252'}">${good ? '<span class="err">✕ 「@」のあとに「.com」などを入れてください</span>' : ''}</div>
              <div class="ax-r" style="font-size:12px"><span style="color:${good ? '#166534' : '#3a9a3a'}">${good ? '✓ ' : '● '}受付中</span><span style="color:${good ? '#b91c1c' : '#d04040'}">${good ? '✕ ' : '● '}締め切り</span><span style="color:${good ? '#92400e' : '#d0a020'}">${good ? '△ ' : '● '}残りわずか</span></div>
              <svg viewBox="0 0 220 70" style="width:100%;max-width:300px" role="img" aria-label="売上の推移。今年は去年より上回っている"><polyline points="10,55 60,45 110,40 160,28 210,15" fill="none" stroke="#d04040" stroke-width="3"${good ? '' : ''}/><polyline points="10,50 60,52 110,46 160,44 210,40" fill="none" stroke="#3a9a3a" stroke-width="3"${good ? ' stroke-dasharray="6 4"' : ''}/>${good ? '<text x="212" y="13" font-size="10" text-anchor="end" fill="#222">今年</text><text x="212" y="52" font-size="10" text-anchor="end" fill="#222">去年（点線）</text>' : '<rect x="10" y="2" width="8" height="4" fill="#d04040"/><text x="22" y="7" font-size="7" fill="#555">今年</text><rect x="45" y="2" width="8" height="4" fill="#3a9a3a"/><text x="57" y="7" font-size="7" fill="#555">去年</text>'}</svg></div>`;
            verdict($(el, '.note'), good ? 'ok' : 'bad', good ? '色に加えて<b>文字・記号（✓ ✕ △）・線の種類（点線）・直接のラベル</b>で区別しています。色の見え方を変えても、意味は伝わります。' : 'エラーは赤い枠だけ、状態は●の色だけ、グラフは赤と緑の線だけ。見え方を切り替えると<b>区別がつかなくなります</b>（WCAG 1.4.1）。'); };
          $(el, '.s1').append(seg(['色だけ', '色＋文字・記号'], (i) => { good = i; up(); }, 0).el);
          $(el, '.s2').append(seg(['そのまま', '1型色覚', '2型色覚', '白黒'], (i) => { f = i; up(); }, 1).el); },
        desc:'白黒で印刷しても意味が通じるかを考えると分かりやすいです。グラフの配色は <a href="dataviz.html">グラフ・データ可視化辞典</a> も参考に。',
        prompt:'この画面で、色だけで意味を伝えている所（エラー表示・状態・グラフ・必須の印・リンクなど）を探して、文字や記号・形でも伝わるように直す案を出して。\n【HTML/CSS またはスクリーンショットの説明】' },
      { name:'拡大しても崩れない（リフロー）', en:'Zoom & reflow', h:420, tags:['体験'],
        demo:'<div class="kt"><div class="ax-row2"><span class="kt-lbl">作り</span><span class="s1"></span></div><div class="ax-row2"><span class="kt-lbl">拡大率</span><input type="range" min="100" max="400" step="50" value="100" aria-label="拡大率" style="flex:1;accent-color:var(--accent)"><b class="zv" style="font:700 12px var(--mono)"></b></div><div class="ax-zoomframe zf"></div><div class="kt-verdict note"></div></div>',
        init:(el) => { let fluid = 0; const r = $(el, 'input'), zf = $(el, '.zf');
          const up = () => { const z = +r.value; $(el, '.zv').textContent = z + '%';
            zf.innerHTML = `<div class="ax-page ${fluid ? 'fluid' : 'fixed'}" style="zoom:${z / 100}"><div class="bar">サンプル商店</div><div class="cols"><div><b>お知らせ</b><br>年末年始の営業時間が変わります。</div><div><b>人気の商品</b><br>手作りジャムの詰め合わせ。</div></div></div>`;
            setTimeout(() => { const h = zf.scrollWidth > zf.clientWidth + 2; verdict($(el, '.note'), h ? 'bad' : 'ok', h ? `<b>横スクロールが必要</b>になりました。拡大して使う人は、1行読むたびに左右に動かすことになります（WCAG 1.4.10）。` : (fluid ? '幅に合わせて折り返すので、拡大しても<b>縦のスクロールだけ</b>で読めます。' : 'まだ収まっています。拡大率を上げてみてください。')); }); };
          $(el, '.s1').append(seg(['幅を固定（620px）', '幅に合わせて折り返す'], (i) => { fluid = i; up(); }, 0).el); r.oninput = up; },
        desc:'WCAG では、<b>幅 320px 相当（パソコンで400%に拡大したのと同じ）</b>でも横スクロールなしで読めることを求めています（1.4.10）。固定の幅（<code>width:620px</code>）より、<code>max-width</code> と折り返し（flex-wrap・grid）を使います。',
        prompt:'このページを400%に拡大したとき（幅320px相当）に、横スクロールが出たり文字が重なったりする原因を CSS から探して直して。固定の width・height、はみ出す表、折り返さない文字に注目して。\n【CSS】' },
    ], null, true),
    S('色と文字の基準', [
      T('コントラスト比', 'Contrast ratio', '明るさの差を 1:1（同じ色）〜21:1（白と黒）で表したもの。ふつうの文字は <b>4.5:1 以上</b>、大きい文字は 3:1 以上（WCAG 1.4.3 AA）。', null, ['最重要']),
      T('大きい文字の定義', 'Large text', '18ポイント（約24px）以上、または太字で14ポイント（約18.7px）以上。'),
      T('文字以外のコントラスト', 'Non-text contrast', '入力欄の枠・ボタンの境界・アイコン・グラフの線など、<b>操作や理解に必要な形</b>は背景と 3:1 以上（WCAG 1.4.11）。薄いグレーの枠の入力欄は要注意です。'),
      T('色覚の多様性', 'Color vision', '日本人男性の約5%、女性の約0.2%が、なんらかの色覚の特性を持つといわれます。赤と緑、青と紫の区別がつきにくいなどがあります。'),
      T('色だけで伝えない', 'Use of color', '必須の印・エラー・状態・リンク・グラフの区別を、<b>色＋文字・記号・形</b>で伝えます（WCAG 1.4.1）。本文中のリンクは下線を残すのが安全です。', null, ['最重要']),
      T('文字の拡大 200%', 'Resize text', 'ブラウザで文字を 200% にしても、内容や機能が失われないこと（WCAG 1.4.4）。文字の大きさを <code>px</code> で固定せず <code>rem</code> を使い、高さを固定しない。'),
      T('リフロー', 'Reflow', '拡大しても横スクロールなしで読めること。幅 320px 相当が目安（WCAG 1.4.10）。表・地図・ツールバーなど2方向のスクロールが必要なものは例外。'),
      T('文字の間隔を変えても崩れない', 'Text spacing', '利用者が行間を1.5倍、段落の間を2倍、字間を広げても、文字が切れたり重なったりしないこと（WCAG 1.4.12）。高さを固定した箱に注意。'),
      T('画像の中の文字', 'Images of text', '文字は画像にせず、本物の文字で。拡大・色の変更・読み上げ・翻訳ができます（WCAG 1.4.5）。ロゴは例外です。'),
      T('プレースホルダーの薄い文字', 'Placeholder contrast', '入力欄の中の薄いグレーの例文は、コントラストが足りず、入力すると消えます。説明はラベルや補足文として外に書きます。'),
      T('読みやすい書体と行間', 'Readable typography', '本文は 16px 前後、行間 1.5〜1.8 程度。UD（ユニバーサルデザイン）フォントは、形の似た文字を見分けやすく工夫されています。'),
      T('ダークモードと強制カラー', 'Dark & forced colors', 'ダークモードでも同じ基準でコントラストを確かめます。Windows のハイコントラスト（強制カラー）では背景画像や影が消えるので、<b>枠線で形が分かる</b>ようにしておきます。'),
    ]),
  ]});

/* ================= 4. キーボードとフォーカス ================= */
function tabbables(root){ const sel = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]';
  const els = $$(root, sel).filter(e => e.tabIndex >= 0 && e.offsetParent !== null);
  const pos = els.filter(e => e.tabIndex > 0).sort((a, b) => a.tabIndex - b.tabIndex), zero = els.filter(e => e.tabIndex === 0); return pos.concat(zero); }
const desc = (e) => e ? (nameOf(e, document) && typeof nameOf(e, document) === 'string' ? nameOf(e, document) : (e.placeholder || e.tagName.toLowerCase())) + '（' + (RJ[roleOf(e)] || e.tagName.toLowerCase()) + '）' : 'なし';
const FORMS = [
  (u) => `<div class="ax-mini ax-noring" lang="ja"><div class="ax-r"><input type="text" placeholder="お名前" tabindex="3"><input type="text" placeholder="メール" tabindex="1"></div><label class="chk"><input type="checkbox" tabindex="2"> 規約に同意する</label><div class="ax-r"><div class="ax-btn" data-click style="background:#6b7280">リセット</div><button type="button">送信</button></div></div>`,
  (u) => `<div class="ax-mini" lang="ja"><div class="fld"><label for="${u}n">お名前</label><input id="${u}n" type="text"></div><div class="fld"><label for="${u}m">メール</label><input id="${u}m" type="email"></div><label class="chk"><input type="checkbox"> 規約に同意する</label><div class="ax-r"><button type="button" style="background:#6b7280">リセット</button><button type="button">送信</button></div></div>`,
];
TABS.push({ id:'keyboard', label:'キーボードとフォーカス', icon:'⌨',
  intro:'マウスを使えない人・使わない人は、<b>Tab キーで部品を順に移動し、Enter や Space で押します</b>。スクリーンリーダーの利用者も、手がふるえる人も、上級者も、キーボードを使います。<b>今どこにいるか（フォーカス）が見える</b>こと、<b>順番が自然</b>なこと、<b>閉じ込められない</b>ことが大切です。',
  sections:[
    C('触って理解する', [
      { name:'Tab の順番とフォーカスの見え方', en:'Tab order & focus', h:440, wide:true, tags:['体験','最重要'],
        demo:'<div class="kt"><div class="kt-row"><span class="sg"></span><button type="button" class="kt-btn sm pri go">▶ Tab の順に動かす</button></div><div class="ax-frame ax-kf fr"></div><div class="ax-status now">いまのフォーカス：なし</div><div class="kt-verdict note"></div></div>',
        init:(el) => { let good = 0, timer = null; const fr = $(el, '.fr');
          const badges = () => { $$(fr, '.ax-no').forEach(b => b.remove()); const box = fr.getBoundingClientRect(), list = tabbables(fr);
            list.forEach((e, i) => { const r = e.getBoundingClientRect(); fr.insertAdjacentHTML('beforeend', `<i class="ax-no" style="left:${r.left - box.left + fr.scrollLeft - 6}px;top:${r.top - box.top + fr.scrollTop - 8}px">${i + 1}</i>`); });
            $$(fr, '[data-click]').forEach(e => { const r = e.getBoundingClientRect(); fr.insertAdjacentHTML('beforeend', `<i class="ax-no x" style="left:${r.left - box.left + fr.scrollLeft - 6}px;top:${r.top - box.top + fr.scrollTop - 8}px">✕</i>`); }); };
          const stop = () => { clearInterval(timer); timer = null; };
          const up = () => { stop(); fr.innerHTML = FORMS[good](AXH.uid()); setTimeout(badges, 30);
            verdict($(el, '.note'), good ? 'ok' : 'bad', good ? '<b>HTMLの順番どおり</b>に移動し、どこにいるかがオレンジの枠で見えます。リセットも本物のボタンなので、Tab で止まり Enter で押せます。' : '番号が<b>見た目の順番とちぐはぐ</b>（tabindex に正の数を使っている）。「リセット」は div なので Tab で止まりません（✕）。しかも <code>outline:none</code> でフォーカスの枠を消しているので、<b>今どこにいるか見えません</b>。「▶ Tab の順に動かす」で確かめてください。'); };
          const onf = () => { const a = document.activeElement; $(el, '.now').textContent = 'いまのフォーカス：' + (fr.contains(a) ? desc(a) : 'この見本の外'); };
          fr.addEventListener('focusin', onf); fr.addEventListener('focusout', () => setTimeout(onf, 0));
          $(el, '.sg').append(seg(['よくない作り', '配慮した作り'], (i) => { good = i; up(); }, 0).el);
          $(el, '.go').onclick = () => { stop(); const list = tabbables(fr); let i = 0; const step = () => { if (i >= list.length){ stop(); return; } list[i++].focus({ preventScroll:true }); }; step(); timer = setInterval(step, 900); };
          const ro = new ResizeObserver(() => setTimeout(badges, 30)); ro.observe(fr);
          return () => { stop(); ro.disconnect(); }; },
        desc:'見本の中をクリックしてから、<b>Tab（戻るときは Shift＋Tab）</b>を押して自分でも試せます。紫の番号が Tab で移動する順番です。フォーカスの枠は WCAG 2.4.7（見える）・2.4.3（順番）の基準です。',
        prompt:'このページをキーボードだけで操作したときの Tab の順番を、HTML から書き出して。順番が見た目とずれる所、Tab で止まらない操作部品（div のボタンなど）、フォーカスの枠が消えている CSS（outline:none）を指摘して直して。\n【HTML/CSS】' },
      { name:'モーダルとフォーカスの閉じ込め', en:'Modal focus', h:380, tags:['体験'],
        demo:'<div class="kt" style="position:absolute"><div class="kt-row"><button type="button" class="kt-btn sm o1">div で作ったモーダル</button><button type="button" class="kt-btn sm pri o2">&lt;dialog&gt; のモーダル</button></div><div class="ax-frame" style="background:var(--surface)"><div class="kt-note" style="padding:8px">開いたあと、<b>Tab</b> を何回か押してみてください。<br>（後ろのボタン：<button type="button" class="kt-btn sm">後ろのボタンA</button> <button type="button" class="kt-btn sm">後ろのボタンB</button>）</div></div><div class="ax-status now">いまのフォーカス：—</div><div class="kt-verdict note">2種類のモーダルを開いて比べます。</div></div>',
        init:(el) => { const kt = $(el, '.kt'); let dlg = null;
          const onf = () => { const a = document.activeElement; $(el, '.now').textContent = 'いまのフォーカス：' + (a && a !== document.body ? (a.textContent.trim().slice(0, 16) || a.getAttribute('aria-label') || a.tagName.toLowerCase()) + (a.closest('.ax-dlg') ? '（モーダルの中）' : '（モーダルの外）') : 'なし'); };
          document.addEventListener('focusin', onf);
          $(el, '.o1').onclick = () => { const ov = document.createElement('div'); ov.className = 'ax-ov'; ov.innerHTML = '<div class="ax-dlg"><b>会員登録</b><input type="text" placeholder="お名前"><button type="button" class="kt-btn sm pri">閉じる</button></div>'; kt.append(ov);
            $(ov, 'button').onclick = () => { ov.remove(); verdict($(el, '.note'), 'warn', '閉じたあと、フォーカスはどこにあるでしょう？ 開いたボタンに戻らず、ページの先頭に飛んでしまうことがあります。'); };
            verdict($(el, '.note'), 'bad', 'フォーカスが<b>モーダルの中に入りません</b>。Tab を押すと<b>後ろのボタン</b>に移動し、Esc でも閉じません。スクリーンリーダーでは、モーダルが開いたことにも気づけません。'); };
          $(el, '.o2').onclick = () => { if (!dlg){ dlg = document.createElement('dialog'); dlg.className = 'ax-dlg'; dlg.setAttribute('aria-labelledby', 'ax-dlg-t'); dlg.innerHTML = '<b id="ax-dlg-t">会員登録</b><input type="text" placeholder="お名前" aria-label="お名前"><button type="button" class="kt-btn sm pri">閉じる</button>'; document.body.append(dlg);
              $(dlg, 'button').onclick = () => dlg.close(); dlg.addEventListener('close', () => verdict($(el, '.note'), 'ok', '閉じると、フォーカスは<b>開いたボタンに戻りました</b>。Esc キーでも閉じられます。')); }
            dlg.showModal(); verdict($(el, '.note'), 'ok', '<b>&lt;dialog&gt; を showModal()</b> で開くと、ブラウザが自動で、フォーカスを中に移し、後ろを操作できなくし、Esc で閉じられるようにしてくれます。'); };
          return () => { document.removeEventListener('focusin', onf); if (dlg){ try{ dlg.close(); }catch(e){} dlg.remove(); } }; },
        desc:'モーダルは自作すると難しい部品の代表です。今は <code>&lt;dialog&gt;</code> 要素の <code>showModal()</code> を使えば、閉じ込め・Esc・戻り先の多くをブラウザがやってくれます（WCAG 2.1.2・2.4.3）。',
        prompt:'このモーダル（ダイアログ）の実装を、キーボードとスクリーンリーダーで使えるように直して。できれば <dialog> と showModal() を使い、開いたときのフォーカスの位置、Esc で閉じる、閉じたあと元のボタンに戻る、を満たして。\n【コード】' },
    ], null, true),
    { title:'キーボード操作の基本', note:'ブラウザやOSで少し違いますが、だいたい共通です。',
      table:{ head:['キー', '働き'], rows:[
        ['Tab / Shift＋Tab', '次の部品へ / 前の部品へ'],
        ['Enter', 'リンクを開く、ボタンを押す、フォームを送信'],
        ['Space', 'ボタンを押す、チェックボックスを切り替える、ページを下へ'],
        ['矢印キー', 'ラジオボタン・タブ・メニュー・スライダーの中で移動'],
        ['Esc', 'モーダル・メニュー・ポップアップを閉じる'],
        ['Home / End', '先頭・最後へ（入力欄・リストの中など）'],
      ] } },
    S('フォーカスの言葉と基準', [
      T('フォーカス', 'Focus', 'キーボードの入力を受け取る、いま選ばれている部品。Tab で移動します。', null, ['基本']),
      T('フォーカスを見えるようにする', 'Focus visible', '<code>outline:none</code> で枠を消すのは禁止に近い扱いです。デザインに合わせるなら、消すのではなく <code>:focus-visible</code> で見やすい枠に作り直します（WCAG 2.4.7）。', null, ['最重要'], { code:':focus-visible {\n  outline: 3px solid #f59e0b;\n  outline-offset: 2px;\n}' }),
      T('フォーカスが隠れない', 'Focus not obscured', '固定ヘッダーやクッキーのバナーの下に、フォーカスした部品が完全に隠れないこと（WCAG 2.2 で追加の 2.4.11）。<code>scroll-padding-top</code> で避けられます。'),
      T('tabindex', 'tabindex', '<code>0</code>：Tab で止まるようにする。<code>-1</code>：Tab では止まらないが、プログラムからフォーカスできる。<b>正の数（1, 2…）は使わない</b>（順番が壊れます）。', null, ['注意']),
      T('キーボードで操作できる', 'Keyboard accessible', 'マウスでできることは全部キーボードでもできること（WCAG 2.1.1）。ホバーでしか出ないメニュー、ドラッグでしかできない操作に注意。'),
      T('キーボードトラップ', 'Keyboard trap', 'フォーカスが入ったら出られない状態（WCAG 2.1.2）。埋め込みの動画プレーヤーや地図、自作のモーダルで起きがちです。'),
      T('スキップリンク', 'Skip link', 'ページの先頭に「本文へ移動」のリンクを置くと、毎回メニューを Tab で通り抜けずに済みます（WCAG 2.4.1）。ふだんは隠し、フォーカスしたときだけ表示するのが一般的です。'),
      T('閉じたらフォーカスを戻す', 'Return focus', 'モーダルやメニューを閉じたら、開いたボタンにフォーカスを戻します。戻さないとページの先頭に飛び、どこにいたか分からなくなります。'),
      T('押せる大きさ（ターゲットサイズ）', 'Target size', '小さなボタンは、手がふるえる人やスマホで押しにくくなります。WCAG 2.2 では<b>最低 24×24px</b>（間隔で代替可。2.5.8）、推奨は 44×44px 程度です。'),
      T('ドラッグの代わり', 'Dragging movements', 'ドラッグでしかできない操作（並べ替え・スライダー）には、ボタンや入力など<b>ドラッグ以外の方法</b>も用意します（WCAG 2.2 の 2.5.7）。'),
      T('1文字のショートカット', 'Character key shortcuts', '「j で次へ」のような1文字のショートカットは、音声入力の人が誤って発動させることがあります。オフにできる・変えられるようにします（WCAG 2.1.4）。'),
      T('ホバーで出る内容', 'Content on hover', 'ツールチップなどは、キーボードのフォーカスでも出て、Esc で消せて、マウスを乗せても消えないこと（WCAG 1.4.13）。'),
    ]),
  ]});
})();
