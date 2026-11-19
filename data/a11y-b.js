/* アクセシビリティ辞典 — B: HTMLとARIA / フォームとエラー / 動き・画像・動画 / 確認とルール */
(function(){
const { $, $$, esc, seg } = KIT;
const { S, C, T, L, verdict, MK, sample, noNav, roleOf, nameOf, announce, sayList, speak, hush, ratio, css2rgb, uid } = AXH;
const CK = (name, en, desc, prompt, tags) => ({ name, en, desc, prompt, tags, check:true });

/* ================= 5. HTMLとARIA ================= */
TABS.push({ id:'aria', label:'HTMLとARIA', icon:'🏷',
  intro:'アクセシビリティのいちばんの近道は、<b>正しい HTML タグを使うこと</b>です。<code>&lt;button&gt;</code> は最初から、Tab で止まり、Enter と Space で押せて、「ボタン」と読まれます。ARIA（アリア）は、HTML だけでは伝えられない<b>状態や役割を補う</b>ための属性で、<b>使わずに済むなら使わない</b>のが第一のルールです。',
  sections:[
    C('触って理解する', [
      { name:'div のボタンと、本物のボタン', en:'div vs button', h:420, tags:['体験','最重要'],
        demo:'<div class="kt"><div class="kt-note">それぞれを<b>マウスで押す</b>のと、<b>Tab で選んで Enter・Space で押す</b>のを試してください。</div><div class="ax-frame fr" style="flex:none"><div class="ax-mini" lang="ja"><div class="ax-r"><div class="ax-btn d1" data-click onclick="">削除（div）</div><button type="button" class="b1">削除（button）</button></div></div></div><div class="ax-split"><div><span class="kt-lbl">起きたこと</span><pre class="ax-log lg"></pre></div><div><span class="kt-lbl">ちがい</span><ul class="ax-res df"></ul></div></div></div>',
        init:(el) => { const lg = $(el, '.lg'), d = $(el, '.d1'), b = $(el, '.b1'); let n = 0;
          const log = (t) => { lg.querySelectorAll('.new').forEach(s => s.classList.remove('new')); lg.insertAdjacentHTML('beforeend', `<span class="new">${++n}. ${esc(t)}</span>`); lg.scrollTop = lg.scrollHeight; };
          lg.innerHTML = '<span class="kt-note">まだ何も起きていません</span>';
          d.addEventListener('click', (e) => log('div：クリックされた → 削除しました（' + (e.detail ? 'マウス' : 'キーボード') + '）'));
          b.addEventListener('click', (e) => log('button：クリックされた → 削除しました（' + (e.detail ? 'マウス' : 'キーボード') + '）'));
          d.addEventListener('keydown', (e) => log('div：キー ' + e.key + ' を受け取ったが、何も起きない'));
          $(el, '.df').innerHTML = [['Tab で止まる', d.tabIndex >= 0, b.tabIndex >= 0], ['Enter・Space で押せる', false, true], ['読み上げ', '「削除（div）」', '「削除（button） ボタン」'], ['無効にできる（disabled）', false, true]]
            .map(([k, x, y]) => `<li><span><b>${k}</b><br>div：${typeof x === 'string' ? x : x ? '○' : '✕'}　／　button：${typeof y === 'string' ? y : y ? '○' : '✕'}</span></li>`).join(''); },
        desc:'div で同じことをするには、<code>role="button"</code>・<code>tabindex="0"</code>・Enter と Space のキー処理・無効のときの処理……と自分で全部書く必要があります。<b>最初から &lt;button&gt; を使えば0行</b>です。AIが <code>&lt;div onClick&gt;</code> を書いたら、直してもらいましょう。',
        prompt:'このコードで、div や span にクリック処理（onClick）を付けてボタンやリンクの代わりにしている所を探して、<button> や <a href> に置き換えて。見た目が変わらないように CSS も調整して。\n【コード】' },
      { name:'開く・閉じるの状態を伝える', en:'aria-expanded', h:400, tags:['体験'],
        demo:'<div class="kt"><div class="ax-frame fr" style="flex:none"></div><div><span class="kt-lbl">いまの HTML</span><pre class="ax-code cd"></pre></div><div class="ax-status sy"></div></div>',
        init:(el) => { const u = uid(), fr = $(el, '.fr');
          fr.innerHTML = `<div class="ax-mini" lang="ja"><h3 class="ax-h" style="margin:0"><button type="button" aria-expanded="false" aria-controls="${u}p" style="background:#e5e7eb;color:#222;width:100%;text-align:left">送料はいくらですか？</button></h3><div id="${u}p" hidden style="font-size:12px">全国一律 600 円です。5,000 円以上のご注文で無料になります。</div></div>`;
          const bt = $(fr, 'button'), p = $(fr, '#' + u + 'p');
          const up = () => { const ex = bt.getAttribute('aria-expanded'); $(el, '.cd').innerHTML = esc(`<button aria-expanded="${ex}" aria-controls="faq1">\n  送料はいくらですか？\n</button>\n<div id="faq1"${ex === 'true' ? '' : ' hidden'}>…</div>`).replace(/aria-expanded="(\w+)"/, 'aria-expanded="<b>$1</b>"').replace(/ hidden/, ' <b>hidden</b>');
            $(el, '.sy').textContent = '読み上げの例：「' + announce($(fr, '.ax-mini')).map(x => x.t).join('、') + '」'; };
          bt.onclick = () => { const ex = bt.getAttribute('aria-expanded') === 'true'; bt.setAttribute('aria-expanded', String(!ex)); p.hidden = ex; up(); }; up(); },
        desc:'見た目の「▼」の向きは目の見えない人には伝わりません。<code>aria-expanded</code> を <b>true / false で切り替える</b>と、「展開」「折りたたみ」と読まれます。HTML の <code>&lt;details&gt;</code>・<code>&lt;summary&gt;</code> を使えば、これも自動です。',
        prompt:'このアコーディオン（またはメニュー・タブ）の開閉状態がスクリーンリーダーに伝わるように、aria-expanded と aria-controls を正しく付けて。<details> で置き換えられるならその案も出して。\n【コード】' },
      { name:'画面の変化を知らせる（ライブリージョン）', en:'Live regions', h:400, tags:['体験'],
        demo:'<div class="kt"><div class="sg"></div><div class="ax-frame fr" style="flex:none"></div><div class="kt-row"><span class="kt-lbl">スクリーンリーダーが自動で読むこと</span><label class="kt-note" style="margin-left:auto"><input type="checkbox" class="v"> 声でも聞く</label></div><pre class="ax-log lg"></pre><div class="kt-verdict note"></div></div>',
        init:(el) => { let live = 0, cnt = 0, mo = null; const fr = $(el, '.fr'), lg = $(el, '.lg');
          const up = () => { if (mo) mo.disconnect(); cnt = 0; lg.innerHTML = '<span class="kt-note">（まだありません）</span>';
            fr.innerHTML = `<div class="ax-mini" lang="ja"><div class="ax-r"><b>手作りジャム</b><button type="button">カートに入れる</button></div><span class="msg" style="font-size:12px;color:#166534" ${live ? 'role="status"' : ''}></span></div>`;
            const msg = $(fr, '.msg'); $(fr, 'button').onclick = () => { msg.textContent = `カートに入れました（${++cnt}点）`; };
            mo = new MutationObserver(() => { if (msg.getAttribute('role') !== 'status') return; const t = msg.textContent; if (lg.querySelector('.kt-note')) lg.innerHTML = ''; lg.insertAdjacentHTML('beforeend', `<span>「${esc(t)}」</span>`); lg.scrollTop = lg.scrollHeight; if ($(el, '.v').checked) speak(t); });
            mo.observe(msg, { childList:true, characterData:true, subtree:true });
            verdict($(el, '.note'), live ? 'ok' : 'bad', live ? '<code>role="status"</code>（<code>aria-live="polite"</code> と同じ働き）を付けた場所の文字が変わると、<b>今の読み上げが終わってから</b>自動で読まれます。' : '文字は画面に出ても、スクリーンリーダーの利用者は<b>フォーカスのある場所しか聞いていない</b>ので、カートに入ったことに気づけません。'); };
          $(el, '.sg').append(seg(['知らせない', 'role="status" で知らせる'], (i) => { live = i; up(); }, 0).el);
          return () => { if (mo) mo.disconnect(); hush(); }; },
        desc:'保存しました・〇件見つかりました・エラーがあります、のような<b>状態のメッセージ</b>は、フォーカスを動かさずに伝える必要があります（WCAG 4.1.3）。急ぎのエラーは <code>role="alert"</code>。<b>ライブリージョンの要素は最初から置いておき</b>、中の文字だけを変えるのがコツです。',
        prompt:'この画面で、操作の結果（保存完了・エラー・検索結果の件数・読み込み中）を表示している所に、スクリーンリーダーにも伝わるように role="status" や role="alert" を付けて。使い分けの理由も説明して。\n【コード】' },
    ], null, true),
    S('まず HTML（セマンティクス）', [
      T('ARIA の第一のルール', 'First rule of ARIA', '<b>同じことが HTML でできるなら、ARIA ではなく HTML を使う</b>。間違った ARIA は、何も付けないより悪くなることがあります。', null, ['最重要']),
      T('button と a の使い分け', 'Button vs link', '<b>ページを移動するなら &lt;a href&gt;、その場で何かをするなら &lt;button&gt;</b>。リンクは Enter、ボタンは Enter と Space で動きます。'),
      T('ランドマークのタグ', 'Landmark elements', '<code>&lt;header&gt;</code>・<code>&lt;nav&gt;</code>・<code>&lt;main&gt;</code>・<code>&lt;aside&gt;</code>・<code>&lt;footer&gt;</code>。div だけで組むより、区画が伝わります。<code>&lt;main&gt;</code> はページに1つ。'),
      T('リストと表', 'Lists & tables', '並んだ項目は <code>&lt;ul&gt;</code>・<code>&lt;li&gt;</code>（「リスト 5項目」と読まれる）、データは <code>&lt;table&gt;</code> と <code>&lt;th&gt;</code>。'),
      T('details と summary', 'Disclosure', 'クリックで開閉する部品を、JavaScript なしで、キーボード対応・状態の読み上げつきで作れます。'),
      T('dialog', 'Dialog element', 'モーダルは <code>&lt;dialog&gt;</code> と <code>showModal()</code>。自作より、ずっと簡単に正しく作れます。'),
    ]),
    S('よく使う ARIA', [
      T('aria-label', 'aria-label', '見えない名前を付ける。アイコンだけのボタンに <code>aria-label="閉じる"</code>。見える文字があるなら、そちらを使います。', null, ['基本']),
      T('aria-labelledby', 'aria-labelledby', 'ページ上の別の要素の文字を名前にする。モーダルのタイトルをモーダルの名前にする、など。'),
      T('aria-describedby', 'aria-describedby', '補足の説明を結びつける。入力欄のエラーメッセージや「8文字以上」などのヒントに使います。'),
      T('aria-expanded', 'aria-expanded', '開いている（true）・閉じている（false）。メニュー・アコーディオンのボタンに。'),
      T('aria-current', 'aria-current', '「今いるページ」「今のステップ」を示す。ナビゲーションの現在地に <code>aria-current="page"</code>。'),
      T('aria-pressed', 'aria-pressed', 'オン・オフを切り替えるボタン（お気に入り・ミュートなど）の状態。'),
      T('aria-hidden="true"', 'aria-hidden', '読み上げから隠す。装飾のアイコンに使います。<b>フォーカスできる部品の中や親に付けてはいけません</b>（見えないのに押せる状態になる）。', null, ['注意']),
      T('role="status" と role="alert"', 'Live regions', '中の文字が変わったら自動で読まれる場所。status は控えめに、alert はすぐに割り込んで読まれます。'),
      T('aria-invalid と aria-required', 'Form states', '入力が間違っている・必須であることを伝えます。HTML の <code>required</code> 属性でも必須は伝わります。'),
      T('role を自分で付ける', 'Custom roles', 'タブ・メニュー・コンボボックスなど複雑な部品は、役割・状態・キー操作まで<b>決まったパターン</b>があります（W3C の ARIA Authoring Practices Guide）。自作より、対応済みのライブラリを使うのが安全です。'),
    ]),
  ]});

/* ================= 6. フォームとエラー ================= */
function form(good){ const u = uid();
  return good ? `<form class="ax-mini" lang="ja" novalidate><div class="sum" tabindex="-1" hidden></div>
    <div class="fld"><label for="${u}n">お名前<span class="req">（必須）</span></label><input id="${u}n" name="n" type="text" required autocomplete="name"><span class="err" id="${u}ne" hidden></span></div>
    <div class="fld"><label for="${u}m">メールアドレス<span class="req">（必須）</span></label><input id="${u}m" name="m" type="email" required autocomplete="email" aria-describedby="${u}mh"><span id="${u}mh" style="font-size:11px;color:#555">例：aki@example.com</span><span class="err" id="${u}me" hidden></span></div>
    <button type="submit">送信する</button></form>`
    : `<form class="ax-mini" lang="ja" novalidate>
    <div class="fld"><input name="n" type="text" placeholder="お名前 *"></div>
    <div class="fld"><input name="m" type="text" placeholder="メールアドレス *"></div>
    <div class="ax-btn" data-click data-submit style="align-self:flex-start">送信する</div></form>`; }
TABS.push({ id:'forms', label:'フォームとエラー', icon:'📝',
  intro:'フォームは、アクセシビリティの問題が<b>いちばん「使えない」に直結する</b>場所です。何を入れる欄か（ラベル）、必須かどうか、どこが間違っているか、どう直せばよいかを、<b>見た目と読み上げの両方</b>で伝えます。',
  sections:[
    C('触って理解する', [
      { name:'エラーの伝え方', en:'Accessible errors', h:500, wide:true, tags:['体験','最重要'],
        demo:'<div class="kt"><div class="kt-row"><span class="sg"></span><span class="kt-note">何も入れずに「送信する」を押してみてください</span></div><div class="ax-split"><div class="ax-frame fr"></div><div><span class="kt-lbl">フォーカスした欄の読み上げの例</span><div class="ax-status sy">（欄を選ぶと表示）</div><span class="kt-lbl">起きたこと</span><pre class="ax-log lg"></pre></div></div><div class="kt-verdict note"></div></div>',
        init:(el) => { let good = 0; const fr = $(el, '.fr'), lg = $(el, '.lg');
          const log = (t) => { lg.insertAdjacentHTML('beforeend', `<span>${esc(t)}</span>`); lg.scrollTop = lg.scrollHeight; };
          const sayF = (inp) => { const eds = announce($(fr, 'form')).filter(x => x.t.includes('編集')), k = $$(fr, 'form input').indexOf(inp); return eds[k] ? eds[k].t : ''; };
          const up = () => { fr.innerHTML = form(good); lg.innerHTML = ''; const f = $(fr, 'form');
            f.addEventListener('focusin', (e) => { if (e.target.matches('input')) $(el, '.sy').textContent = '「' + sayF(e.target) + '」'; });
            const submit = () => { const ins = $$(f, 'input'), bad = [];
              ins.forEach(i => { const v = i.value.trim(), ok = i.name === 'm' ? /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) : !!v; i.classList.toggle('bad', !ok);
                if (good){ const er = $(f, '#' + i.id + 'e'); i.setAttribute('aria-invalid', String(!ok)); er.hidden = ok; er.textContent = ok ? '' : (i.name === 'm' ? (v ? '✕ メールアドレスの形が正しくありません（例：aki@example.com）' : '✕ メールアドレスを入力してください') : '✕ お名前を入力してください');
                  const ds = [i.name === 'm' ? i.id + 'h' : '', ok ? '' : i.id + 'e'].filter(Boolean).join(' '); ds ? i.setAttribute('aria-describedby', ds) : i.removeAttribute('aria-describedby'); }
                if (!ok) bad.push(i); });
              if (!bad.length){ log('送信できました'); verdict($(el, '.note'), 'ok', '送信できました。'); return; }
              if (good){ const sm = $(f, '.sum'); sm.hidden = false; sm.innerHTML = `<b>${bad.length}件の入力を確認してください</b><ul>${bad.map(i => `<li><a href="#${i.id}">${esc($(f, `label[for="${i.id}"]`).firstChild.textContent)}</a></li>`).join('')}</ul>`;
                $$(sm, 'a').forEach(a => a.onclick = (e) => { e.preventDefault(); $(f, a.getAttribute('href')).focus(); }); sm.focus({ preventScroll:true });
                log(`エラーのまとめにフォーカスが移動 →「${bad.length}件の入力を確認してください」と読まれる`);
                verdict($(el, '.note'), 'ok', 'エラーの<b>まとめ</b>にフォーカスが移り、件数と、各欄へのリンクが読まれます。欄を選ぶと「<b>無効な入力</b>」と<b>エラーの文</b>も読まれます（WCAG 3.3.1・3.3.3）。'); }
              else { log('赤い枠が付いた（それ以外は何も変わらない）'); verdict($(el, '.note'), 'bad', '<b>赤い枠だけ</b>で、何が間違っているかの説明がありません。色の区別がつきにくい人にも、スクリーンリーダーの人にも伝わりません。ラベルもプレースホルダーだけなので、入力すると何の欄か分からなくなります。「送信する」は div なので、キーボードでは押せません。'); } };
            f.addEventListener('submit', (e) => { e.preventDefault(); submit(); });
            const sb = $(f, '[data-submit]'); if (sb) sb.onclick = submit;
            verdict($(el, '.note'), '', good ? 'ラベル・必須の文字・入力例が見えていて、エラーは文字で説明されます。' : '見た目はすっきりしていますが……送信してみてください。'); };
          $(el, '.sg').append(seg(['よくない作り', '配慮した作り'], (i) => { good = i; up(); }, 0).el); },
        desc:'送信ボタンを押す前から全部の欄を赤くしない、エラーは<b>欄のすぐ近くに文字で</b>、直し方（例）も書く、が基本です。入力欄の <code>autocomplete</code>（name・email など）は、入力の手間を減らします（WCAG 1.3.5）。',
        prompt:'このフォームのエラー表示を、アクセシブルにして。各欄に label、必須の表示、エラー時は aria-invalid と aria-describedby でエラー文を結びつけ、送信時はエラーのまとめにフォーカスを移す。エラー文は「何が違うか」と「どう直すか」を書いて。\n【コード】' },
    ], null, true),
    S('フォームの基本', [
      T('label を付ける', 'Labels', '<code>&lt;label for="id"&gt;</code> と入力欄の id を結びつけます。<b>ラベルの文字をクリックしても入力欄が選べる</b>ので、誰にとっても押しやすくなります（WCAG 1.3.1・3.3.2）。', null, ['最重要']),
      T('プレースホルダーはラベルではない', 'Placeholder is not a label', '入力すると消える・薄くて読みにくい・読み上げが不安定、の3つの問題があります。ラベルは欄の外に、プレースホルダーは使うとしても例だけ。', null, ['注意']),
      T('必須の伝え方', 'Required fields', '「*」や赤い色だけでなく「（必須）」と文字で書くか、最初に「* は必須です」と説明します。HTML の <code>required</code> も付けます。'),
      T('まとまりの見出し', 'fieldset & legend', 'ラジオボタンなどのグループは <code>&lt;fieldset&gt;</code> と <code>&lt;legend&gt;</code> で「お支払い方法：」のように、何の選択肢かを伝えます。'),
      T('エラーの特定と説明', 'Error identification', 'どの欄が・なぜ間違っているかを文字で（WCAG 3.3.1）。直し方が分かるなら提案も（3.3.3）。'),
      T('autocomplete 属性', 'Autocomplete', '<code>autocomplete="email"</code> などを付けると、ブラウザが自動入力できます。手が動かしにくい人・記憶が苦手な人の助けになります（WCAG 1.3.5）。'),
      T('同じことを2回入れさせない', 'Redundant entry', '前の画面で入れた住所を、もう一度入れさせない（自動で入れるか、選べるようにする）。WCAG 2.2 で追加（3.3.7）。'),
      T('ログインの配慮', 'Accessible authentication', 'パスワードの<b>貼り付けを禁止しない</b>（パスワード管理ソフトが使えなくなる）。パズルや記憶力テストだけの認証にしない（WCAG 2.2 の 3.3.8）。', null, ['注意']),
      T('時間制限', 'Timing', '入力に時間制限があるなら、延長・解除できるようにするか、事前に知らせます（WCAG 2.2.1）。'),
      T('送信前の確認', 'Error prevention', 'お金・契約・データの削除などは、送信前に確認画面を出すか、取り消せるようにします（WCAG 3.3.4）。'),
      T('CAPTCHA', 'CAPTCHA', '画像の文字を読ませる CAPTCHA は、目の見えない人には解けません。音声版や、利用者に負担をかけない方式を選びます。'),
    ]),
  ]});

/* ================= 7. 動き・画像・動画 ================= */
TABS.push({ id:'media', label:'動き・画像・動画', icon:'🎬',
  intro:'動き・音・映像は、人によっては<b>気分が悪くなる・発作の原因になる・まったく受け取れない</b>ものです。動きを減らす設定に従う、点滅させない、勝手に音を出さない、動画には字幕を付ける、が基本です。',
  sections:[
    C('触って理解する', [
      { name:'動きを減らす設定に合わせる', en:'prefers-reduced-motion', h:420, tags:['体験','最重要'],
        demo:'<div class="kt"><div class="ax-status os"></div><div class="sg"></div><div class="ax-stagebox"><div class="ax-mv mv">新着！</div></div><pre class="ax-code">.card { animation: swing 1.6s infinite alternate; }\n\n@media (prefers-reduced-motion: reduce) {\n  .card { animation: fade 2.4s infinite alternate; }\n}</pre><div class="kt-verdict note"></div></div>',
        init:(el) => { const mq = matchMedia('(prefers-reduced-motion: reduce)'); let m = 0; const mv = $(el, '.mv');
          const up = () => { const reduce = m === 0 ? mq.matches : m === 1; mv.className = 'ax-mv mv ' + (reduce ? 'calm' : 'anim');
            $(el, '.os').textContent = 'あなたの端末の設定：' + (mq.matches ? '「動きを減らす」がオン' : '「動きを減らす」はオフ');
            verdict($(el, '.note'), reduce ? 'ok' : 'warn', reduce ? '大きな移動・回転をやめて、<b>ふわっと明るさが変わるだけ</b>にしました。意味（新着の目印）は残っています。' : '大きく揺れる動き。前庭障害（めまい）のある人は、こうした動きで<b>気分が悪くなる</b>ことがあります。'); };
          mq.addEventListener('change', up);
          $(el, '.sg').append(seg(['端末の設定に合わせる', '動きを減らす（再現）', '動きあり'], (i) => { m = i; up(); }, 0).el);
          return () => mq.removeEventListener('change', up); },
        desc:'OS の設定は、Windows なら「設定 → アクセシビリティ → 視覚効果 → アニメーション効果」、Mac なら「システム設定 → アクセシビリティ → ディスプレイ → 視差効果を減らす」、iPhone なら「設定 → アクセシビリティ → 動作 → 視差効果を減らす」（OS のバージョンで名前が違うことがあります）。動きのくわしい作り方は <a href="motion.html">モーション辞典</a> へ。',
        prompt:'このサイトのアニメーション（CSS と JavaScript）を、prefers-reduced-motion: reduce のときは控えめにするように直して。動きをゼロにするのではなく、意味が伝わる最小限の変化（フェードなど）に置き換えて。自動で動くカルーセルには停止ボタンも付けて。\n【コード】' },
    ], null, true),
    S('動きと点滅', [
      T('点滅は1秒に3回まで', 'Three flashes', '1秒に3回を超える点滅や、画面の大きな範囲がちかちかする表現は、光過敏性発作の原因になりえます（WCAG 2.3.1）。<b>この辞典では安全のため、点滅の見本は置いていません</b>。', null, ['最重要']),
      T('止められるようにする', 'Pause, stop, hide', '5秒以上自動で動くもの（カルーセル・流れる文字・背景動画）には、<b>一時停止ボタン</b>を付けます（WCAG 2.2.2）。'),
      T('動きを減らす設定', 'Reduced motion', '<code>@media (prefers-reduced-motion: reduce)</code> で、大きな移動・拡大・視差（パララックス）を控えます。操作に伴う動きの扱いは WCAG 2.3.3（AAA）。'),
      T('勝手に音を出さない', 'Audio control', 'ページを開いたとたんに音が鳴ると、スクリーンリーダーの声が聞こえなくなります。3秒以上の自動再生には停止・音量の手段を（WCAG 1.4.2）。'),
      T('スクロールで動く演出', 'Scroll effects', 'スクロールに合わせて大きく動く・拡大する演出は酔いやすい表現です。動きを減らす設定のときは止めます。'),
    ]),
    S('画像・動画・音声', [
      T('動画の字幕', 'Captions', 'セリフだけでなく、<b>[拍手] [ドアの音]</b> などの効果音も文字にします（WCAG 1.2.2）。自動字幕は誤りが多いので、見直します。', null, ['最重要'], { code:'<video controls>\n  <source src="intro.mp4" type="video/mp4">\n  <track kind="captions" src="intro.ja.vtt" srclang="ja" label="日本語" default>\n</video>' }),
      T('字幕ファイル（WebVTT）', 'WebVTT', '時間と文字を書いたテキストファイル（.vtt）。<code>&lt;track&gt;</code> で動画に付けます。', null, null, { code:'WEBVTT\n\n00:00:01.000 --> 00:00:04.000\nこんにちは。サンプル商店です。\n\n00:00:04.500 --> 00:00:07.000\n[軽快な音楽]' }),
      T('音声解説', 'Audio description', '画面に映っているけれど音声では語られない大事な情報（文字・表情・動き）を、ナレーションで補うもの（WCAG 1.2.5）。'),
      T('書き起こし', 'Transcript', '音声だけのコンテンツ（ポッドキャスト）には、全文の書き起こしを用意します。検索にも引っかかるようになります。'),
      T('複雑な図やグラフ', 'Complex images', 'alt には要点を、詳しいデータは<b>本文や表</b>で。SVG のグラフには <code>role="img"</code> と <code>aria-label</code> を付けます。'),
      T('CAPTCHA の画像・地図', 'Images with no text alternative', '地図・図面など文字で置き換えにくいものは、住所や行き方を文字で併記します。'),
      T('AIで alt や字幕を作る', 'AI-generated alt & captions', '画像説明AIや自動字幕は下書きとして便利ですが、<b>文脈に合っているか・誤りがないか</b>を人が確認します。', 'このページの画像（ファイル名と前後の文章を渡します）に、文脈に合った alt の候補を作って。飾りの画像は alt="" にして、判断の理由も書いて。最後に、私が確認すべき点も挙げて。'),
    ]),
  ]});

/* ================= 8. 確認とルール ================= */
function audit(root){ const out = [], add = (c, t, w) => out.push([c, t, w]);
  if (!root.getAttribute('lang')) add('bad', 'ページの言語（lang）がない', '<code>&lt;html lang="ja"&gt;</code> を付けます（3.1.1）');
  $$(root, 'img').forEach(i => { if (!i.hasAttribute('alt')) add('bad', '画像に alt がない', '<code>alt</code> を付けます。飾りなら <code>alt=""</code>（1.1.1）'); });
  $$(root, 'button, a[href]').forEach(b => { const n = nameOf(b, root); if (!n) add('bad', `${b.tagName === 'A' ? 'リンク' : 'ボタン'}に名前がない`, '中に文字を入れるか、<code>aria-label</code> を付けます（4.1.2）'); else if (b.tagName === 'A' && ['こちら', 'ここ', 'くわしくは'].includes(n)) add('warn', `リンクの文字があいまい：「${esc(n)}」`, '行き先が分かる文字にします（2.4.4）'); });
  $$(root, 'input:not([type=checkbox]):not([type=radio]), textarea, select').forEach(i => { const n = nameOf(i, root); if (n && n.ph) add('warn', `ラベルがなく、プレースホルダーだけ：「${esc(n.ph)}」`, '<code>&lt;label&gt;</code> を付けます（1.3.1・3.3.2）'); else if (!n) add('bad', '入力欄にラベルがない', '<code>&lt;label&gt;</code> を付けます'); });
  $$(root, '[data-click]').forEach(d => add('bad', `クリックできる div・span：「${esc(d.textContent.trim())}」`, '<code>&lt;button&gt;</code> にします（2.1.1・4.1.2）。※実際のツールでは見つけられないことも多い'));
  $$(root, '[tabindex]').forEach(e => { if (e.tabIndex > 0) add('warn', `tabindex="${e.getAttribute('tabindex')}"（正の数）`, '使わずに HTML の順番で並べます（2.4.3）'); });
  $$(root, '[style*="color"]').forEach(e => { const c = css2rgb(getComputedStyle(e).color), r = ratio(c, [255, 255, 255]); if (r < 4.5) add('bad', `文字のコントラスト不足 ${r.toFixed(2)}:1：「${esc(e.textContent.trim().slice(0, 10))}」`, '4.5:1 以上にします（1.4.3）'); });
  const hs = $$(root, 'h1,h2,h3,h4,h5,h6'); if (!hs.length) add('warn', '見出し（h1〜h6）が1つもない', '見出しのタグで構造を示します（1.3.1・2.4.6）');
  return out; }
const LAWS = [
  ['日本', '障害者差別解消法（2024年4月の改正施行）', '民間の事業者にも<b>合理的配慮の提供が義務</b>に。Webサイトを使いやすくしておく「環境の整備」は努力義務'],
  ['日本', 'JIS X 8341-3:2016', 'ウェブアクセシビリティの日本の規格（WCAG 2.0 と同じ内容）。WCAG 2.2 に合わせた改正の作業中（2026〜2027年ごろの見込み・2026年11月時点）'],
  ['日本', '総務省「みんなの公共サイト運用ガイドライン」', '国・自治体などの公的機関のサイトに、JIS の AA 準拠を求めるガイドライン'],
  ['国際', 'WCAG 2.2（2023年10月）', 'W3C の最新の正式版。ISO/IEC 40500:2025 として国際規格にも'],
  ['EU', '欧州アクセシビリティ法（EAA）', '2025年6月28日から適用。EU向けの EC サイト・銀行・電子書籍などのサービスが対象（小規模な事業者には例外あり）'],
  ['米国', 'ADA・Section 508', '民間サイトをめぐる訴訟が多い。州・自治体向けの規則（WCAG 2.1 AA）は、2026年4月に期限が1年延期されたと報じられている'],
];
TABS.push({ id:'check', label:'確認とルール', icon:'✅',
  intro:'最後に、確かめ方とルールです。<b>自動チェックで見つかるのは問題の一部</b>（よく「3〜4割程度」と言われます）で、キーボードで実際に操作する、読み上げで聞いてみる、という<b>人の確認</b>が欠かせません。テストの自動化は <a href="testing.html">テスト・品質辞典</a> にもあります。',
  sections:[
    C('触って理解する', [
      { name:'自動チェックを動かす', en:'Automated audit', h:460, wide:true, tags:['体験','最重要'],
        demo:'<div class="kt"><div class="kt-row"><span class="sg"></span><button type="button" class="kt-btn sm pri run">検査する</button></div><div class="ax-split"><div class="ax-frame fr"></div><div><span class="kt-lbl">見つかった問題</span><ul class="ax-res rs"></ul></div></div><div class="kt-verdict note"></div></div>',
        init:(el) => { const fr = $(el, '.fr'); noNav(fr);
          const run = () => { const res = audit($(fr, '.ax-mini')); $(el, '.rs').innerHTML = res.length ? res.map(([c, t, w]) => `<li>${MK(c)}<span><b>${t}</b><br><span class="kt-note">${w}</span></span></li>`).join('') : `<li>${MK('ok')}<span>自動チェックでは問題が見つかりませんでした</span></li>`;
            verdict($(el, '.note'), 'warn', '<b>自動チェックでは分からないこと：</b>alt の内容が文脈に合っているか／見た目だけの見出し／色だけで伝えていないか／Tab の順番が自然か／フォーカスが見えるか／読み上げたときに意味が通じるか。これらは人が確かめます。'); };
          $(el, '.sg').append(seg(['よくない作り', '配慮した作り'], (i) => { fr.innerHTML = sample(i); $(el, '.rs').innerHTML = '<li><span class="kt-note">「検査する」を押してください</span></li>'; verdict($(el, '.note'), '', 'axe や Lighthouse のような自動チェックを、ごく簡単にまねた検査です。'); }, 0).el);
          $(el, '.run').onclick = run; },
        desc:'本物の道具は、Chrome の <b>Lighthouse</b>（開発者ツール）、拡張機能の <b>axe DevTools</b>・<b>WAVE</b> など。テストに組み込むなら axe-core（<code>@axe-core/playwright</code> など）が定番です。',
        prompt:'このページのアクセシビリティを確認したい。①自動チェック（Lighthouse・axe）で見るべき項目、②キーボードだけで確かめる手順、③スクリーンリーダー（NVDA または VoiceOver）で確かめる手順、をチェックリストにして。WCAG 2.2 AA を目標にして。' },
    ], null, true),
    { title:'公開前の手動チェック', note:'チェックはこのブラウザに保存されます。5分でできるものから。', layout:'rows', items:[
      CK('Tab キーだけで、全部の操作ができる', 'Keyboard only', 'マウスを使わずに、メニュー・フォーム・モーダル・送信まで。Tab の順番が自然で、閉じ込められない。', null, ['最重要']),
      CK('フォーカスの位置がいつも見える', 'Visible focus', 'Tab を押すたびに、どこにいるかが分かる枠や色の変化がある。'),
      CK('画像に適切な alt がある', 'Alt text', '意味のある画像には内容を、飾りには alt=""、ボタンの中の画像には働きを。'),
      CK('見出しの構造が目次になっている', 'Headings', 'h1 → h2 → h3 の順。見た目だけの見出しがない。'),
      CK('文字のコントラストが足りている', 'Contrast', 'ふつうの文字 4.5:1、大きい文字・アイコン・入力欄の枠 3:1。'),
      CK('色だけで伝えていない', 'Not color alone', 'エラー・必須・状態・グラフ・リンクに、文字や形の手がかりがある。'),
      CK('400%に拡大しても横スクロールしない', 'Reflow', 'ブラウザの拡大（Ctrl＋＋）で確かめる。文字が重ならない・切れない。'),
      CK('フォームにラベルとエラーの説明がある', 'Forms', 'プレースホルダーだけの欄がない。エラーは文字で、直し方つき。'),
      CK('動きを減らす設定に対応し、点滅がない', 'Motion', '自動で動くものは止められる。1秒に3回を超える点滅がない。'),
      CK('スクリーンリーダーで主な流れを聞いた', 'Screen reader', 'NVDA（Windows）か VoiceOver（Mac・iPhone）で、トップページと一番大事な操作を一通り。', 'NVDA（または VoiceOver）を初めて使う人向けに、起動・停止・見出しで移動・リンク一覧・フォームの入力のキー操作を、短い練習手順にまとめて。'),
      CK('ページの言語とタイトルがある', 'Lang & title', '<code>&lt;html lang="ja"&gt;</code> と、ページごとに違う <code>&lt;title&gt;</code>。'),
    ] },
    { title:'ルールと規格（2026年11月時点）', note:'報道ベースの情報を含みます。適用の有無は、事業の内容や国によって違うので、一次情報で確認してください。',
      table:{ head:['地域', '名前', '内容'], rows:LAWS } },
    S('道具と、AIへの頼み方', [
      T('Lighthouse', 'Lighthouse', 'Chrome の開発者ツールに入っている検査。アクセシビリティの点数と、直すべき所の一覧が出ます。点数が100でも、問題がないとは限りません。', null, ['基本']),
      T('axe DevTools と axe-core', 'axe', '代表的な自動チェックのエンジン。拡張機能で画面を検査したり、Playwright などのテストに組み込んだりできます。'),
      T('NVDA', 'NVDA', 'Windows 用の無料のスクリーンリーダー。Insert（または CapsLock）キーと組み合わせて操作します。H で見出し、Tab でリンクやボタンへ移動。'),
      T('VoiceOver', 'VoiceOver', 'Mac・iPhone に標準で入っているスクリーンリーダー。Mac は Cmd＋F5 でオン・オフ。iPhone は「設定 → アクセシビリティ」から。'),
      T('開発者ツールのアクセシビリティ表示', 'Accessibility tree', 'Chrome の開発者ツールの「Elements」→「Accessibility」で、要素の名前・役割・状態（支援技術に伝わる情報）を確認できます。'),
      T('AIにアクセシビリティを頼む', 'Ask AI', '「アクセシブルにして」だけだと、ARIA を付けすぎることがあります。<b>WCAG 2.2 AA・まず HTML・キーボード操作</b>と、条件を具体的に伝えます。', 'このコンポーネントを WCAG 2.2 AA を目標にアクセシブルにして。まずは正しい HTML 要素を使い、ARIA は必要な所だけにして。キーボード操作（Tab・Enter・Space・Esc・矢印）と、スクリーンリーダーでの読まれ方も説明して。\n【コード】', ['最重要']),
      T('AIの出力も確かめる', 'Verify AI output', 'AI は存在しない ARIA 属性や、間違った role の組み合わせを書くことがあります。キーボードと読み上げで、実際に確かめます。'),
      T('アクセシビリティ方針の公開', 'Accessibility statement', '「どの基準を目標に、どこまで対応しているか、問い合わせ先はどこか」をページにまとめて公開すると、困った人が連絡しやすくなります。', 'このサイトのアクセシビリティ方針のページの下書きを作って。目標とする基準（JIS X 8341-3 / WCAG 2.2 AA）、対応状況、分かっている課題、問い合わせ先の項目を入れて。'),
    ]),
  ]});
})();
