/* 要件定義・AI開発の進め方辞典 — A: 共通ヘルパー / 企画 / 要件を書く / 画面と流れ / 作業を分ける */
(function(){
const { $, $$, esc, tbl, seg, seq, stepper } = KIT;
const S = (title, items, note) => ({ title, note, layout:'rows', items });
const C = (title, items, note, lg) => ({ title, note, layout:lg ? 'cards lg' : 'cards', items });
const T = (name, en, desc, prompt, tags, more) => Object.assign({ name, en, desc, prompt, tags }, more || {});
const verdict = (el, cls, html) => { el.classList.remove('ok', 'bad', 'warn'); if (cls) el.classList.add(cls); el.innerHTML = html; };
// 「## 見出し」付きのテキストを、見やすい文書として表示する
const md = (text) => text.split('\n').map(l => l.startsWith('## ') ? `<h5>${esc(l.slice(3))}</h5>` : `<div>${l.trim() ? esc(l) : '&nbsp;'}</div>`).join('');
// 生成した文書＋コピーボタン
function docOut(box, text, label = '生成された文書'){ box.innerHTML = `<div class="wf-docbar"><span class="kt-lbl">${label}</span></div><div class="wf-doc"></div>`; box.querySelector('.wf-doc').innerHTML = md(text); box.querySelector('.wf-docbar').append(VD.copyBtn(() => text)); }
window.WFH = { S, C, T, verdict, md, docOut };

/* ================= 1. 作るものを決める ================= */
const CANVAS = [['name', 'アプリ名', 'ひとり暮らし家計簿'], ['who', '誰のため？', '自炊を始めたばかりの一人暮らしの大学生'], ['pain', '困りごと', '月末にお金が足りなくなる。何に使ったか分からない'], ['now', '今はどうしてる？', 'レシートを財布にためて、結局つけない'], ['idea', '解決のアイデア', 'レシートを撮るだけで記録。食費の残りが一目で分かる'], ['core', '一番大事な機能（1つ）', '今月の食費の残り金額を、毎日トップに大きく表示'], ['goal', '成功の目安', '3週間続けて記録できる人が半分以上'], ['not', 'やらないこと', '銀行連携・家族共有・投資の管理']];
const FEATS = [['ログイン', 3, 'm'], ['レシピ投稿', 3, 'm'], ['写真アップロード', 2, 'm'], ['キーワード検索', 3, 's'], ['お気に入り', 1, 's'], ['コメント', 2, 'c'], ['フォロー', 3, 'c'], ['通知', 3, 'c'], ['栄養計算', 5, 'w'], ['動画投稿', 8, 'w'], ['多言語対応', 5, 'w'], ['管理画面', 4, 's']];
const MOS = { m:['Must', '必須'], s:['Should', 'できれば'], c:['Could', '余裕があれば'], w:['Won\'t', '今回はやらない'] };
const VE = [['ログイン', 8, 4], ['AIレシピ提案', 9, 8], ['お気に入り', 6, 1], ['ダークモード', 3, 2], ['動画投稿', 5, 9], ['SNSシェア', 5, 2]];

TABS.push({ id:'plan', label:'作るものを決める', icon:'🎯',
  intro:'AIは「作り方」は得意でも、「何を・誰のために作るか」は決めてくれません。最初に<b>1枚の紙にまとめる</b>だけで、AIへの指示がぶれなくなり、作りすぎも防げます。ここでは企画の決め方と、最初に作る範囲（MVP）の削り方を体験できます。',
  sections:[
    C('触って決める', [
      { name:'1枚企画書をつくる', en:'One-page product brief', h:520, wide:true, tags:['最初の一歩','体験'],
        demo:'<div class="kt"><div class="kt-row kt-split" style="align-items:stretch;flex-wrap:nowrap;gap:10px;min-height:0;flex:1"><div class="wf-form fm" style="flex:1;align-content:start;overflow:auto"></div><div class="out" style="flex:1;display:flex;flex-direction:column;gap:4px;min-height:0"></div></div></div>',
        init:(el) => { $(el, '.fm').innerHTML = CANVAS.map(([k, l, v]) => `<b>${l}</b><input class="kt-in" data-k="${k}" value="${esc(v)}" aria-label="${l}">`).join('');
          const run = () => { const v = {}; $$(el, '.fm input').forEach(i => v[i.dataset.k] = i.value.trim() || '（未記入）');
            docOut($(el, '.out'), `## ${v.name}\n誰のため：${v.who}\n## 困りごと\n${v.pain}\n今は：${v.now}\n## 解決のアイデア\n${v.idea}\n## 最初に作る1つの機能\n${v.core}\n## 成功の目安\n${v.goal}\n## 今回やらないこと\n${v.not}\n## AIへの最初の依頼\n上の企画書をもとに、最初のバージョン（MVP）で作る画面の一覧と、必要なデータ（テーブル）を提案してください。「今回やらないこと」は作らないでください。不明点があれば、作り始める前に質問してください。`, '1枚企画書（コピーしてAIに渡せる）'); };
          $$(el, '.fm input').forEach(i => i.oninput = run); run(); },
        desc:'<b>誰の・どんな困りごとを・どう解決するか</b>を1枚にまとめます。特に「<b>最初に作る1つの機能</b>」と「<b>やらないこと</b>」を決めるのが大切。左を書き換えると、右の企画書とAIへの依頼文がその場で変わります。この1枚をプロジェクトの <code>docs/brief.md</code> に置いておくと、AIがいつでも読み返せます。',
        prompt:'次のアイデアを「1枚企画書」にまとめて：誰のため・困りごと・今の代わりの方法・解決のアイデア・最初に作る1つの機能・成功の目安・今回やらないこと。足りない情報は、推測で埋めずに私に質問して。アイデア：（ここに書く）' },
      { name:'MVP の削り方（MoSCoW）', en:'Must / Should / Could / Won\'t', h:400, tags:['体験','優先順位'],
        demo:'<div class="kt"><div class="kt-lbl">レシピ共有アプリの機能（クリックで分類を変える）</div><div class="wf-cards cs"></div><div class="kt-lbl">最初のバージョン（Must）の作業量　目安：1か月 = 12ポイント</div><div class="wf-bar bar"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const st = FEATS.map(f => f[2]), ORDER = ['m', 's', 'c', 'w'];
          const draw = () => { $(el, '.cs').innerHTML = FEATS.map(([n, p], i) => `<button type="button" class="${st[i]}" data-i="${i}">${n}<small>${MOS[st[i]][0]}・${p}pt</small></button>`).join('');
            $$(el, '.cs button').forEach(b => b.onclick = () => { const i = +b.dataset.i; st[i] = ORDER[(ORDER.indexOf(st[i]) + 1) % 4]; draw(); });
            const sum = (k) => FEATS.reduce((a, f, i) => a + (st[i] === k ? f[1] : 0), 0), m = sum('m'), cap = 12, tot = Math.max(cap, m);
            $(el, '.bar').innerHTML = `<i style="width:${Math.min(m, cap) / tot * 100}%;background:var(--ok)"></i><i style="width:${Math.max(0, m - cap) / tot * 100}%;background:var(--bad)"></i>`;
            verdict($(el, '.res'), m > cap ? 'bad' : m < 6 ? 'warn' : 'ok', m > cap ? `❌ Must が <b>${m}ポイント</b>。1か月に収まりません。「これがないと使う意味がない」ものだけ残しましょう。` : m < 6 ? `⚠ Must が ${m}ポイント。少なすぎて、価値が伝わらないかもしれません。` : `✅ Must ${m}ポイント。まずはこれを作って、実際に使ってもらいましょう。Should 以下は使われ方を見てから。`); };
          draw(); },
        desc:'機能を <b>Must（ないと成り立たない）・Should（できれば）・Could（余裕があれば）・Won\'t（今回はやらない）</b> に分けます。最初に作るのは Must だけ。AIに頼むと何でも作れてしまうので、<b>作らないことを決める</b>のが一番の仕事です。カードをクリックして、1か月に収まるMVPを作ってみてください。',
        prompt:'この機能一覧を MoSCoW（Must / Should / Could / Won\'t）で分類して。「Must がないとこのアプリを使う意味がない」という基準で、最初のバージョンを1か月で作れる量まで削って、理由も添えて。' },
      { name:'価値と手間のマトリクス', en:'Value / effort matrix', h:400, tags:['体験','優先順位'],
        demo:'<div class="kt"><div class="wf-mx mx"><div class="q">やらない</div><div class="q">計画して取り組む</div><div class="q">余裕があれば</div><div class="q">今すぐやる</div><span class="ax" style="left:6px;bottom:3px">価値 低 →</span><span class="ax" style="right:6px;bottom:3px">価値 高</span><span class="ax" style="left:50%;top:3px;transform:translateX(-50%)">↑ 手間 大</span></div><div class="kt-row"><span class="kt-lbl">選んだ機能</span><span class="sw"></span></div><div class="kt-row"><span class="kt-lbl">価値</span><input type="range" min="0" max="10" class="v" aria-label="価値"><span class="kt-lbl">手間</span><input type="range" min="0" max="10" class="e" aria-label="手間"></div></div>',
        init:(el) => { let cur = 0; const data = VE.map(x => [...x]); const Q = ['やらない', '計画して取り組む', '余裕があれば', '今すぐやる'];
          const draw = () => { $$(el, '.mx .dot').forEach(d => d.remove()); data.forEach(([n, v, e], i) => { const d = document.createElement('span'); d.className = 'dot' + (i === cur ? ' on' : ''); d.textContent = n; d.style.left = (8 + v * 8.4) + '%'; d.style.top = (92 - e * 8.4) + '%'; d.onclick = () => sel.set(i); $(el, '.mx').append(d); }); };
          const sel = seg(VE.map(x => x[0]), i => { cur = i; $(el, '.v').value = data[i][1]; $(el, '.e').value = data[i][2]; draw(); }); $(el, '.sw').replaceWith(sel.el);
          $(el, '.v').oninput = (e) => { data[cur][1] = +e.target.value; draw(); }; $(el, '.e').oninput = (e) => { data[cur][2] = +e.target.value; draw(); }; },
        desc:'横が<b>価値</b>（使う人がうれしい度合い）、縦が<b>手間</b>（作る・直す・保守する大変さ）。右下「価値が高くて手間が小さい」から作るのが鉄則です。AIで作るとコードを書く手間は減りますが、<b>確認・修正・保守の手間</b>は残るので、手間は小さく見積もりすぎないこと。',
        prompt:'この機能一覧それぞれについて「利用者にとっての価値（0〜10）」と「作る・テスト・保守する手間（0〜10）」を見積もって表にし、価値と手間のマトリクスで「今すぐやる・計画して取り組む・余裕があれば・やらない」に分けて。' },
    ], null, true),
    S('企画を固めるための考え方', [
      T('ペルソナ', 'Persona', '使う人を1人の具体的な人物として描く（年齢・状況・困っていること・使う時間帯・スマホかPCか）。「みんなのため」は誰のためでもない。', 'このアプリの主な利用者を、具体的なペルソナ（名前・年齢・状況・困りごと・使う場面・ITへの慣れ）として2人描いて。その人が最初の1週間でどう使うかのストーリーも書いて。'),
      T('課題（ペイン）を先に', 'Problem first', '「AIで〇〇を作りたい」ではなく「〇〇で困っている人がいる」から始める。解決策から考えると、誰も困っていない物を作りがち。', null, ['最重要']),
      T('価値提案', 'Value proposition', '「〇〇な人が、〇〇できるようになる。今までの〇〇より〇〇だから」の1文で言えるか。言えないなら、まだ作り始める段階ではない。'),
      T('MVP（最小限の製品）', 'Minimum Viable Product', '価値を確かめるための、最小限の機能のバージョン。<b>早く出して、使ってもらって、直す</b>。完璧を目指すと公開できない。', null, ['基本']),
      T('作らずに確かめる', 'Validate before building', 'Googleフォーム・スプレッドシート・ノーコード・紙の試作で、本当に使われるか先に確かめる。既存のサービスで十分なら作らない判断もあり。'),
      T('競合・類似サービスを調べる', 'Competitive research', '似たアプリの良い点・不満点（アプリストアのレビューが宝の山）を集める。差別化のポイントが見つかる。', '「〇〇」のような目的のアプリ・Webサービスを5つ挙げて、それぞれの特徴・料金・利用者の不満点（レビューの傾向）を表にまとめて。私のアイデアとの違いも分析して。'),
      T('成功の目安を数字で', 'Success metrics / KPI', '「使ってもらえたら成功」ではなく「1か月で100人登録・3週間続く人が半分」のように数字で決める。あとで改善の判断ができる。'),
      T('制約を書き出す', 'Constraints', '予算（月いくらまで）・期限・使える時間・自分のスキル・使いたい／使えない技術。AIに伝えると、無理のない構成を選んでくれる。'),
      T('リスクを先に考える', 'Risks', '個人情報を扱うか・お金が動くか・法律が関わるか（特商法・資金決済・医療など）・AIの誤りが害になるか。リスクが大きい部分ほど慎重に。（セキュリティ辞典参照）'),
      T('名前とドメイン', 'Naming', '覚えやすく・検索で埋もれず・商標とかぶらない名前。ドメインやSNSのアカウントが取れるかも確認。'),
      T('お金の流れ', 'Business model', '無料・広告・買い切り・月額（サブスク）・従量課金。AI APIを使うなら、<b>利用者1人あたりの原価</b>を先に見積もる（AI組み込み辞典のコスト計算機参照）。'),
    ]),
  ]});

/* ================= 2. 要件を書く ================= */
const VAGUE = { prompt:'ログイン機能を作って。', items:[['ログインの方法', 'メール＋パスワード？ Google？ マジックリンク？'], ['新規登録', '同じ画面？ メール確認は？'], ['パスワードの条件', '何文字以上？'], ['忘れたとき', 'リセットの方法は？'], ['ログイン後の移動先', 'トップ？ 元のページ？'], ['未ログインで見られる範囲', '全部？ 一部？'], ['エラーの見せ方', '「パスワードが違います」？'], ['使うサービス', '自作？ Supabase？ Clerk？'], ['見た目', '既存のデザインに合わせる？']] };
const CLEAR = 'ログイン機能を作ってください。\n・方法：Supabase Auth の「メール＋パスワード」と「Googleでログイン」\n・新規登録：同じ画面のタブで切り替え。登録後に確認メールを送る\n・パスワード：12文字以上。「忘れた方」からリセットメール\n・ログイン後：元いたページへ戻る（なければ /dashboard）\n・未ログインでは / と /about だけ見られる。他は /login へ転送\n・エラー：入力欄の下に赤字で表示。登録有無は明かさない\n・見た目：既存の Button / Input コンポーネントを使う\n完了条件：上の動作を手で確認でき、型エラーがないこと。';
const NFR = [['パスワードを忘れたら再設定できる', 'f'], ['ページは3秒以内に表示される', 'n'], ['スマホとPCの両方で使える', 'n'], ['管理者は全ユーザーの一覧を見られる', 'f'], ['同時に1,000人が使っても落ちない', 'n'], ['注文履歴をCSVで書き出せる', 'f'], ['個人情報は暗号化して保存する', 'n'], ['投稿にタグを付けられる', 'f'], ['画面の読み上げソフトで操作できる', 'n'], ['データは毎日バックアップされる', 'n']];
const EDGE = ['何も入力せずに送信', '1文字だけ／とても長い（1,000文字）', '前後に空白だけ', '絵文字や記号（👍・<script>）', 'すでに使われている名前', '大文字・小文字・全角半角の違い（Taro と ｔａｒｏ）', '禁止したい言葉（運営・admin）', '2つの画面で同時に変更', '通信が途中で切れた', '変更直後に別の端末で表示'];
const PRD = [['1. 概要', 'レシピを写真付きで投稿・共有できるWebアプリ。料理初心者が「今ある材料で作れる」レシピを見つけやすくする。'], ['2. 目的と成功の目安', '3か月で月間利用者1,000人。投稿したレシピの30%に「作った」報告が付く。'], ['3. 利用者（ペルソナ）', '一人暮らしの社会人（20代）。平日夜にスマホで見る。料理は週2〜3回。'], ['4. 機能要件（MVP）', '会員登録・ログイン／レシピ投稿（写真1〜3枚・材料・手順）／材料で検索／お気に入り'], ['5. 非機能要件', 'スマホ優先・主要画面は2秒以内・画像は自動で縮小・個人情報はメールのみ'], ['6. 画面一覧', 'トップ／検索結果／レシピ詳細／投稿・編集／マイページ／ログイン'], ['7. データ', 'users・recipes・ingredients・recipe_images・favorites（ER図は別ファイル）'], ['8. スコープ外（今回やらない）', '動画・コメント・フォロー・栄養計算・アプリ版'], ['9. 未決事項', '不適切な投稿の通報の仕組み／画像の保存容量の上限']];

TABS.push({ id:'req', label:'要件を書く', icon:'📝',
  intro:'<b>要件</b>とは「何ができれば完成か」を言葉にしたものです。AIは書かれていないことを<b>推測で埋めます</b>。推測が当たれば速いですが、外れると作り直し。曖昧な依頼と具体的な依頼の差、ユーザーストーリーと受け入れ条件の書き方を体験してください。',
  sections:[
    C('触って理解する', [
      { name:'曖昧な依頼と具体的な依頼', en:'Vague vs specific', h:440, tags:['最重要','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="kt-code p"></div><div class="kt-lbl lb"></div><div class="sc-res kt-grow ls" style="display:flex;flex-direction:column;gap:3px;overflow:auto;min-height:0"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.sw').replaceWith(seg(['曖昧な依頼', '具体的な依頼'], k => { $(el, '.p').textContent = k ? CLEAR : VAGUE.prompt; $(el, '.lb').textContent = k ? '決まっていること' : 'AIが勝手に決めてしまうこと';
          $(el, '.ls').innerHTML = VAGUE.items.map(([a, b]) => `<div style="display:flex;gap:8px;align-items:center;font-size:11.5px;padding:3px 7px;border-radius:7px;background:var(--surface);border:1px solid var(--border)"><b style="min-width:120px">${a}</b><span style="color:var(--muted)">${k ? '決定済み' : b}</span><span class="kt-badge ${k ? 'ok' : 'bad'}" style="margin-left:auto">${k ? '✓' : '推測'}</span></div>`).join('');
          verdict($(el, '.res'), k ? 'ok' : 'bad', k ? '✅ 9つの判断がすべて言葉になっています。<b>完了条件</b>まで書いてあるので、AIも自分で確認できます。' : '❌ 1行の依頼の裏に、<b>9つの未決事項</b>があります。AIはそれぞれを推測で決め、気に入らなければ作り直しになります。'); }).el); },
        desc:'同じ「ログイン機能」でも、決めるべきことは山ほどあります。全部を自分で書けなくても大丈夫。<b>「作る前に、決めるべきことを質問して」</b>と頼むと、AIが未決事項を洗い出してくれます。決まったことは <code>docs/spec.md</code> に残しましょう。',
        prompt:'〇〇機能を作りたいです。すぐにコードを書かずに、まず実装に必要な判断（方法・画面・データ・エラー時の動き・権限・見た目・使うサービス）を質問リストにして。私が答えたら、その内容を仕様書（docs/spec.md）にまとめてから実装して。' },
      { name:'ユーザーストーリーと受け入れ条件', en:'User story + acceptance criteria', h:520, wide:true, tags:['体験','テンプレ'],
        demo:'<div class="kt"><div class="kt-row kt-split" style="align-items:stretch;flex-wrap:nowrap;gap:10px;flex:1;min-height:0"><div style="flex:1;display:flex;flex-direction:column;gap:5px;min-height:0;overflow:auto"><div class="wf-form"><b>〇〇として</b><input class="kt-in r" value="料理初心者の利用者"><b>〇〇したい</b><input class="kt-in w" value="今ある材料からレシピを探したい"><b>なぜなら</b><input class="kt-in y" value="買い物に行かずに夕飯を作りたいから"></div><div class="kt-lbl">受け入れ条件（Given / When / Then）</div><div class="acs" style="display:flex;flex-direction:column;gap:4px"></div><button type="button" class="kt-btn sm add" style="align-self:flex-start">＋ 条件を追加</button></div><div class="out" style="flex:1;display:flex;flex-direction:column;gap:4px;min-height:0"></div></div></div>',
        init:(el) => { const AC = [['材料「卵」「玉ねぎ」を入力した', '検索した', '両方を使うレシピが新しい順に表示される'], ['材料を何も入力していない', '検索した', '「材料を1つ以上入力してください」と表示される'], ['該当するレシピが0件', '検索した', '「見つかりませんでした」と、似た材料の候補が表示される']];
          const rowHtml = (a) => `<div class="wf-form" style="grid-template-columns:52px 1fr;padding:5px;border:1px solid var(--border);border-radius:8px;background:var(--surface)"><b>前提</b><input class="kt-in g" value="${esc(a[0])}"><b>操作</b><input class="kt-in wn" value="${esc(a[1])}"><b>結果</b><input class="kt-in t" value="${esc(a[2])}"></div>`;
          const run = () => { const acs = $$(el, '.acs > div').map((d, i) => `- [ ] 条件${i + 1}\n  - 前提：${$(d, '.g').value}\n  - 操作：${$(d, '.wn').value}\n  - 結果：${$(d, '.t').value}`).join('\n');
            docOut($(el, '.out'), `## ユーザーストーリー\n${$(el, '.r').value}として、${$(el, '.w').value}。なぜなら、${$(el, '.y').value}。\n## 受け入れ条件\n${acs}\n## AIへの依頼\nこのユーザーストーリーを実装してください。受け入れ条件をテスト（Vitest または Playwright）として先に書き、すべて通ることを確認してから完了としてください。`, 'Issue・仕様書に貼れる形'); el.querySelectorAll('input').forEach(i => i.oninput = run); };
          $(el, '.acs').innerHTML = AC.map(rowHtml).join(''); $(el, '.add').onclick = () => { $(el, '.acs').insertAdjacentHTML('beforeend', rowHtml(['', '', ''])); run(); }; run(); },
        desc:'<b>ユーザーストーリー</b>は「〇〇として、〇〇したい。なぜなら〇〇だから」の形で、機能を<b>使う人の目線</b>で書きます。<b>受け入れ条件</b>は「どうなれば完成か」を、前提（Given）・操作（When）・結果（Then）で書いたもの。そのままテストになるので、AIに「この条件をテストにしてから実装して」と頼めます。',
        prompt:'次の機能について、ユーザーストーリー（〇〇として、〇〇したい。なぜなら〇〇）と、正常な場合・入力エラー・0件・権限がない場合を含む受け入れ条件（前提／操作／結果）を書いて：（機能）' },
      { name:'機能要件と非機能要件', en:'Functional vs non-functional', h:420, tags:['クイズ'],
        demo:'<div class="kt"><div class="kt-lbl">クリックで「機能」「非機能」を切り替えて、答え合わせ</div><div class="wf-cards cs" style="grid-template-columns:repeat(auto-fill, minmax(150px, 1fr))"></div><div class="kt-row"><button type="button" class="kt-btn pri chk">答え合わせ</button><button type="button" class="kt-btn sm rs">やり直す</button></div><div class="kt-verdict res">機能要件＝「何ができるか」、非機能要件＝「どのくらいの品質で」。</div></div>',
        init:(el) => { let ans = NFR.map(() => null), shown = false;
          const draw = () => { $(el, '.cs').innerHTML = NFR.map(([t, c], i) => `<button type="button" data-i="${i}" class="${shown ? (ans[i] === c ? 'c' : 'm') : ans[i] === 'f' ? 's' : ans[i] === 'n' ? 'c' : ''}">${t}<small>${ans[i] === 'f' ? '機能' : ans[i] === 'n' ? '非機能' : '？'}${shown ? (ans[i] === c ? ' ✓' : ` ✗（正解：${c === 'f' ? '機能' : '非機能'}）`) : ''}</small></button>`).join('');
            $$(el, '.cs button').forEach(b => b.onclick = () => { if (shown) return; const i = +b.dataset.i; ans[i] = ans[i] === 'f' ? 'n' : 'f'; draw(); }); };
          $(el, '.chk').onclick = () => { shown = true; draw(); const ok = NFR.filter(([, c], i) => ans[i] === c).length; verdict($(el, '.res'), ok >= 8 ? 'ok' : 'warn', `${NFR.length}問中 <b>${ok}問</b> 正解。非機能要件（速さ・安全・使える環境・落ちにくさ）は、<b>書かないとAIはほぼ考慮しません</b>。`); };
          $(el, '.rs').onclick = () => { ans = NFR.map(() => null); shown = false; draw(); verdict($(el, '.res'), '', '機能要件＝「何ができるか」、非機能要件＝「どのくらいの品質で」。'); }; draw(); },
        desc:'<b>機能要件</b>は「何ができるか」（投稿できる・検索できる）。<b>非機能要件</b>は「どのくらいの品質で」（速さ・安全性・対応端末・落ちにくさ・読み上げ対応）。非機能要件は画面に見えないので見落とされがちですが、公開後のトラブルの多くはここから起きます。',
        prompt:'このアプリの非機能要件を、性能（表示速度）・セキュリティ・可用性（落ちにくさ・バックアップ）・対応環境（端末・ブラウザ）・アクセシビリティ・運用（ログ・監視）の観点で、個人開発で現実的なレベルで提案して。' },
      { name:'エッジケースを洗い出す', en:'Edge cases', h:420, tags:['体験','品質'],
        demo:'<div class="kt"><div class="kt-lbl">機能：「ニックネームを登録・変更できる」— 思いつく「変な入力・状況」にチェック</div><div class="sc-res kt-grow ls" style="display:flex;flex-direction:column;gap:3px;overflow:auto;min-height:0"></div><div class="kt-row"><button type="button" class="kt-btn pri all">AIに洗い出してもらった結果を見る</button></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const draw = (all) => { $(el, '.ls').innerHTML = EDGE.map((e, i) => `<label style="display:flex;gap:8px;align-items:center;font-size:12px;padding:4px 8px;border-radius:7px;background:var(--surface);border:1px solid var(--border);cursor:pointer"><input type="checkbox" ${all ? 'checked' : ''}>${esc(e)}</label>`).join(''); $$(el, '.ls input').forEach(x => x.onchange = cnt); cnt(); };
          const cnt = () => { const n = $$(el, '.ls input:checked').length; verdict($(el, '.res'), n >= 8 ? 'ok' : '', `${EDGE.length}個中 <b>${n}個</b>。ふつうの使い方（ハッピーパス）以外にも、これだけの「起こりうること」があります。`); };
          $(el, '.all').onclick = () => draw(true); draw(false); },
        desc:'<b>エッジケース</b>は、ふつうではない入力や状況のこと。空・長すぎ・特殊文字・重複・同時操作・通信切れ…。AIは指示がないとハッピーパス（うまくいく場合）だけを作りがちです。「この機能のエッジケースを洗い出して、それぞれの動きを決めて」と頼むと、品質が一段上がります。',
        prompt:'「〇〇機能」のエッジケース（空・長すぎ・特殊文字・重複・同時操作・通信エラー・権限なし・削除済みデータなど）を洗い出して、それぞれどう動くべきかを表にして。決めるべきことは私に確認して、決まったものはテストにして。' },
      { name:'要件定義書（PRD）の中身', en:'PRD outline', h:440, tags:['テンプレ'],
        demo:'<div class="kt"><div class="kt-lbl">例：レシピ共有アプリのPRD（見出しをクリックで開閉）</div><div class="wf-doc kt-grow d" style="white-space:normal"></div></div>',
        init:(el) => { $(el, '.d').innerHTML = PRD.map(([h, b], i) => `<details ${i < 2 ? 'open' : ''} style="margin-bottom:4px"><summary style="cursor:pointer;font-weight:800;color:var(--accent)">${h}</summary><div style="padding:2px 0 4px 14px;font-size:12px">${esc(b)}</div></details>`).join(''); },
        desc:'<b>PRD（Product Requirements Document）</b>は、作るものの設計図をまとめた文書です。個人開発なら1〜2ページで十分。<b>スコープ外</b>と<b>未決事項</b>を書く欄があると、AIが勝手に作りすぎたり、決まっていないことを決め打ちしたりするのを防げます。',
        prompt:'これまでの会話の内容をもとに、PRD（概要・目的と成功の目安・利用者・機能要件（MVP）・非機能要件・画面一覧・データ・スコープ外・未決事項）を docs/prd.md として書いて。未決事項は推測で埋めずに一覧にして。' },
    ], null, true),
    { title:'良い要件の条件', table:{ head:['条件', '悪い例', '良い例'], rows:[
      ['具体的', '使いやすくする', 'ボタンは親指の届く画面下半分に、44px以上の大きさで'],
      ['確かめられる', '速く表示する', '一覧は3G回線でも3秒以内に表示される'],
      ['意味が1つ', '最新の投稿を表示', '公開日時が新しい順に20件。下書きは除く'],
      ['理由がある', 'メール確認を必須にする', 'メール確認を必須にする（なりすまし登録とスパムを防ぐため）'],
      ['優先度がある', '全部必要', 'Must：投稿・検索／Should：お気に入り／Won\'t：動画'],
      ['やらないことが書いてある', '（書いていない）', '今回は決済・多言語・アプリ版は作らない'],
    ]}},
    S('要件定義の用語', [
      T('要件定義', 'Requirements definition', '「何を作れば目的を達成できるか」を決めて、言葉にする工程。作り方（設計・実装）の前に行う。'),
      T('機能要件', 'Functional requirements', 'システムが「何をするか」。登録できる・検索できる・通知が届く。'),
      T('非機能要件', 'Non-functional requirements', '「どのくらいの品質か」。性能・セキュリティ・可用性・使える端末・アクセシビリティ・保守のしやすさ。', null, ['見落とし注意']),
      T('ユーザーストーリー', 'User story', '「〇〇として、〇〇したい。なぜなら〇〇」。機能を、使う人の目的から書く。'),
      T('受け入れ条件', 'Acceptance criteria', '「どうなれば完成か」の具体的な条件。テストの元になる。AIに完了条件として渡すと、自分で確認しながら作ってくれる。', null, ['おすすめ']),
      T('Given / When / Then', 'Gherkin style', '前提（〇〇の状態で）・操作（〇〇したら）・結果（〇〇になる）の3つで条件を書く型。'),
      T('ユースケース', 'Use case', '利用者がシステムを使って目的を達成するまでの一連の流れ（例：注文する＝商品を選ぶ→カート→住所入力→支払い→確認メール）。'),
      T('ハッピーパスと例外', 'Happy path / exceptions', 'すべてうまくいく流れと、途中で失敗する流れ。例外の方が数が多い。'),
      T('スコープ外', 'Out of scope', '今回やらないことの一覧。AIの作りすぎ・話の脱線を防ぐ。'),
      T('前提と制約', 'Assumptions / constraints', '前提＝正しいと仮定していること（利用者はスマホを持っている）。制約＝守らなければならない条件（予算・期限・使う技術）。'),
      T('用語集（ドメイン用語）', 'Glossary', '「会員」「ユーザー」「お客様」が同じ意味かを決めておく。AIのコード上の名前（user / member）もそろう。'),
      T('仕様書はリポジトリに置く', 'Docs as code', '<code>docs/</code> フォルダにMarkdownで置けば、AIがいつでも読める・Gitで変更履歴が残る。仕様が変わったら一緒に更新する。', 'このプロジェクトに docs/ フォルダを作って、prd.md（要件）・screens.md（画面一覧）・data.md（データ設計）・decisions.md（決めたことの記録）の雛形を作って。CLAUDE.md から参照されるようにして。', ['バイブコーディング']),
      T('仕様の変更', 'Change management', '途中で変えるのは普通のこと。変えたら仕様書・受け入れ条件・テストも更新し、「なぜ変えたか」を残す。'),
    ]),
  ]});

/* ================= 3. 画面と流れを設計する ================= */
const FLOWS = [
  { l:'TODOアプリ', s:[['top', 'トップ', '🏠', 18, 30, '紹介・ログインへのボタン'], ['login', 'ログイン', '🔑', 18, 74, 'メール＋パスワード／Google'], ['list', '一覧', '📋', 52, 52, '未完了のTODO・追加フォーム・絞り込み'], ['detail', '詳細・編集', '✏️', 84, 30, 'タイトル・期限・メモの編集、削除'], ['settings', '設定', '⚙️', 84, 76, 'プロフィール・ログアウト・退会']], e:[['top', 'login', 'はじめる'], ['login', 'list', 'ログイン成功'], ['login', 'login', '失敗→エラー表示', 1], ['list', 'detail', 'タップ'], ['detail', 'list', '保存・削除'], ['list', 'settings', 'メニュー'], ['settings', 'top', 'ログアウト']] },
  { l:'ネットショップ', s:[['top', 'トップ', '🏠', 14, 30, '特集・カテゴリ'], ['search', '検索結果', '🔍', 14, 76, '絞り込み・並べ替え'], ['item', '商品詳細', '👕', 44, 52, '写真・サイズ・在庫・カートに入れる'], ['cart', 'カート', '🛒', 72, 28, '数量変更・合計'], ['pay', '支払い', '💳', 88, 62, '住所・決済（Stripe）'], ['done', '完了', '✅', 62, 84, '注文番号・確認メール']], e:[['top', 'item', 'タップ'], ['top', 'search', '検索'], ['search', 'item', 'タップ'], ['item', 'cart', 'カートに入れる'], ['cart', 'pay', '購入へ'], ['pay', 'done', '決済成功'], ['pay', 'cart', '決済失敗・在庫切れ', 1]] },
  { l:'予約サイト', s:[['menu', 'メニュー選択', '📖', 16, 50, 'コース・所要時間・料金'], ['cal', '日時選択', '📅', 44, 24, '空き枠のカレンダー'], ['form', '情報入力', '📝', 44, 78, '名前・電話・要望（未ログインでも可）'], ['check', '確認', '👀', 74, 50, '内容の確認・キャンセル規定'], ['ok', '予約完了', '✅', 92, 22, '確認メール・カレンダー登録']], e:[['menu', 'cal', '選ぶ'], ['cal', 'form', '空き枠を選択'], ['form', 'check', '次へ'], ['check', 'ok', '予約する'], ['check', 'cal', '同時に埋まった', 1], ['check', 'form', '修正']] },
];
const FID = [['rough', 'ラフ（手描き）', '<b>紙やホワイトボードに手描き</b>。5分で何案も出せる。配置と流れだけを考える。'], ['wire', 'ワイヤーフレーム', '<b>灰色の箱で骨組み</b>だけ。何がどこにあるかを決める。色や装飾はまだ考えない。'], ['mock', 'モックアップ', '<b>本物に近い見た目</b>。色・文字・画像を入れて、雰囲気を確認する（Figmaなど）。'], ['proto', 'プロトタイプ', '<b>触って動く試作品</b>。ボタンが押せる・画面が移る。AIツール（v0・Lovable・Claude）なら数分で作れる（ボタンを押してみて）。']];
const STATES = [['通常', () => ['🍳 オムライス', '🥗 シーザーサラダ', '🍜 担々麺', '🍛 キーマカレー'].map(t => `<div class="it"><i></i>${t}</div>`).join(''), '<b>通常</b>：データがある状態。デザインはまずここから作られがち。'], ['空（0件）', () => '<div class="cn"><div><b>📭</b>まだレシピがありません<br><button type="button" class="kt-btn pri sm" style="margin-top:6px">最初のレシピを投稿</button></div></div>', '<b>空の状態</b>：初めて使う人が最初に見る画面。<b>次に何をすればいいか</b>を案内する。'], ['読み込み中', () => '<div class="sk"></div><div class="sk"></div><div class="sk"></div><div class="sk"></div>', '<b>読み込み中</b>：スケルトン（灰色の仮の形）で、画面がガタつかないようにする。'], ['エラー', () => '<div class="cn"><div><b>⚠️</b>読み込めませんでした<br><span style="font-size:11px">通信状況を確認して、もう一度お試しください</span><br><button type="button" class="kt-btn sm" style="margin-top:6px">再読み込み</button></div></div>', '<b>エラー</b>：何が起きたか・どうすればいいかを伝え、<b>やり直す手段</b>を置く。'], ['大量', () => Array.from({ length:9 }, (_, i) => `<div class="it" style="padding:3px 7px"><i style="width:16px;height:16px"></i>レシピ ${i + 1}：とても長いタイトルが入ったときにどう折り返すか確認する</div>`).join('') + '<div class="kt-lbl" style="text-align:center">…ほか 1,240件（もっと見る）</div>', '<b>大量・長い</b>：件数が多い、文字が長いときに崩れないか。ページ送りや省略表示を決める。']];

TABS.push({ id:'design', label:'画面と流れを設計する', icon:'🗺',
  intro:'コードを書く前に、<b>どんな画面があって、どう移動するか</b>を決めておくと、AIへの指示が「この画面のこの部分」と具体的になります。画面遷移図、絵の細かさの段階、そして見落としがちな「画面の5つの状態」を触って確かめましょう。',
  sections:[
    C('触って理解する', [
      { name:'画面遷移図', en:'Screen flow', h:470, wide:true, tags:['体験','設計'],
        demo:'<div class="kt"><div class="kt-row"><span class="sw"></span><button type="button" class="kt-btn sm mm">Mermaidで書き出す</button></div><div class="wf-flow fl"><svg></svg></div><div class="kt-verdict res">画面をクリックすると、その画面の中身と行き先が分かります。赤い点線は失敗したときの流れ。</div><div class="kt-code mc" style="display:none;max-height:110px;overflow:auto"></div></div>',
        init:(el) => { let F = FLOWS[0];
          const draw = () => { const box = $(el, '.fl'); $$(box, '.wf-scr').forEach(x => x.remove()); F.s.forEach(([id, n, ic, x, y]) => box.insertAdjacentHTML('beforeend', `<div class="wf-scr" data-id="${id}" style="left:${x}%;top:${y}%"><i>${ic}</i>${n}</div>`));
            const br = box.getBoundingClientRect(), pos = (id) => { const r = $(box, `[data-id="${id}"]`).getBoundingClientRect(); return [r.left - br.left + r.width / 2, r.top - br.top + r.height / 2, r.width / 2, r.height / 2]; };
            const clip = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], k = Math.min(Math.abs(a[2] / (dx || 1e-6)), Math.abs(a[3] / (dy || 1e-6))); return [a[0] + dx * k, a[1] + dy * k]; };
            $(box, 'svg').innerHTML = `<defs><marker id="wfar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--muted)"/></marker></defs>` + F.e.map(([a, b, l, err], i) => { const A = pos(a), B = pos(b);
              if (a === b) return `<path data-a="${a}" data-b="${b}" class="${err ? 'err' : ''}" d="M${A[0] - 20} ${A[1] - A[3]} C${A[0] - 50} ${A[1] - A[3] - 40}, ${A[0] + 50} ${A[1] - A[3] - 40}, ${A[0] + 20} ${A[1] - A[3]}" marker-end="url(#wfar)"/><text x="${A[0]}" y="${A[1] - A[3] - 34}" text-anchor="middle">${l}</text>`;
              const p = clip(A, B), q = clip(B, A), mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2 - 10 - (i % 2) * 6; return `<path data-a="${a}" data-b="${b}" class="${err ? 'err' : ''}" d="M${p[0]} ${p[1]} Q${mx} ${my - 12} ${q[0]} ${q[1]}" marker-end="url(#wfar)"/><text x="${mx}" y="${my - 6}" text-anchor="middle">${l}</text>`; }).join('');
            $$(box, '.wf-scr').forEach(s => s.onclick = () => { const id = s.dataset.id, sc = F.s.find(x => x[0] === id); $$(box, '.wf-scr').forEach(x => x.classList.toggle('on', x === s)); $$(box, 'path[data-a]').forEach(p => p.classList.toggle('on', p.dataset.a === id));
              const outs = F.e.filter(e => e[0] === id).map(e => `${e[2]} → ${F.s.find(x => x[0] === e[1])[1]}`); verdict($(el, '.res'), '', `<b>${sc[2]} ${sc[1]}</b>：${sc[5]}<br>行き先：${outs.join('／') || 'なし'}`); });
            $(el, '.mc').textContent = 'flowchart LR\n' + F.e.map(([a, b, l]) => `  ${a}["${F.s.find(x => x[0] === a)[1]}"] -->|${l}| ${b}["${F.s.find(x => x[0] === b)[1]}"]`).join('\n'); };
          $(el, '.sw').replaceWith(seg(FLOWS.map(f => f.l), i => { F = FLOWS[i]; draw(); }).el);
          $(el, '.mm').onclick = () => { const c = $(el, '.mc'); c.style.display = c.style.display === 'none' ? '' : 'none'; draw(); }; },
        desc:'<b>画面遷移図</b>は、画面（箱）と移動（矢印）の地図です。「ログインに失敗したら？」「在庫が切れたら？」のような<b>失敗したときの行き先</b>（赤い点線）まで描くと、作り漏れがなくなります。<b>Mermaid</b> 形式で書くとAIもそのまま読めて、GitHubやNotionで図として表示されます。',
        prompt:'このアプリの画面一覧と画面遷移を、Mermaid の flowchart で書いて。各画面の主な要素と、エラーや権限がないときの遷移（ログインへ転送など）も含めて。画面一覧は表にして docs/screens.md に保存して。' },
      { name:'ラフ → ワイヤー → モック → プロトタイプ', en:'Fidelity levels', h:360, tags:['体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="wf-fid f"><div class="h"></div><div class="row"><div class="img"></div><div class="img"></div></div><div class="ln" style="width:80%"></div><div class="ln" style="width:60%"></div><div class="btn">予約する</div></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.btn').onclick = () => { if ($(el, '.f').classList.contains('proto')){ $(el, '.btn').textContent = '✓ 予約しました'; setTimeout(() => $(el, '.btn').textContent = '予約する', 1200); } };
          $(el, '.sw').replaceWith(seg(FID.map(f => f[1]), i => { $(el, '.f').className = 'wf-fid f ' + FID[i][0]; $(el, '.res').innerHTML = FID[i][2]; }).el); },
        desc:'画面の設計は、<b>粗いものから細かいものへ</b>。最初から本物の見た目を作ると、配置の問題に気づいても直しにくくなります。バイブコーディングでは、ラフやワイヤーを描いて（写真を撮って）AIに渡すと、画像から画面を作ってくれます。',
        prompt:'この手描きのラフ画像をもとに、画面のワイヤーフレーム（色なし・灰色の箱）をまず作って。配置を確認してから、既存のデザインに合わせた見た目にして。' },
      { name:'画面の5つの状態', en:'UI states', h:380, tags:['体験','見落とし注意'],
        demo:'<div class="kt"><span class="sw"></span><div class="wf-state s"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.sw').replaceWith(seg(STATES.map(s => s[0]), i => { $(el, '.s').innerHTML = STATES[i][1](); $(el, '.res').innerHTML = STATES[i][2]; }).el); },
        desc:'画面には、データがある「通常」以外に、<b>空・読み込み中・エラー・大量（長い）</b>の状態があります。AIは通常の状態だけを作りがちなので、「5つの状態をすべて作って」と頼むのがコツ。特に「空の状態」は、初めての利用者が最初に見る大事な画面です。',
        prompt:'この一覧画面について、通常・空（0件）・読み込み中（スケルトン）・エラー（再試行ボタン付き）・大量（ページ送り・長い文字の折り返し）の5つの状態をすべて実装して。確認用に、各状態を切り替えて表示できるようにして。' },
      { name:'会員登録の流れ（失敗も含めて）', en:'User flow with errors', h:430, tags:['仕組み'],
        init:(el) => seq(el, { actors:[{ icon:'🧑', label:'利用者' }, { icon:'📱', label:'画面' }, { icon:'🖥', label:'サーバー' }], steps:[
          { f:0, t:1, label:'メールとパスワードを入力', note:'入力した瞬間に、形式の間違い（@がない・短すぎ）を<b>画面側で</b>知らせる。' },
          { f:1, t:2, label:'登録を送信', note:'ボタンは送信中は押せないようにする（二重登録の防止）。' },
          { f:2, t:1, label:'❌ すでに登録済み', bad:true, dash:true, note:'<b>失敗の流れ①</b>：「このメールでは登録できません。ログインまたはパスワード再設定へ」と案内。登録の有無を明かしすぎない（セキュリティ辞典参照）。' },
          { f:2, t:1, label:'✓ 仮登録・確認メール送信', dash:true, good:true, note:'仮登録して、確認メールを送ります。' },
          { f:1, t:0, label:'「メールを確認してください」', dash:true, note:'次にやることをはっきり伝える。「届かない場合は迷惑メールフォルダ／再送ボタン」も。' },
          { f:0, t:2, label:'メールのリンクを開く', note:'リンクを開くと本登録。' },
          { f:2, t:1, label:'❌ リンクの期限切れ', bad:true, dash:true, note:'<b>失敗の流れ②</b>：「期限が切れました。もう一度送信」ボタンを出す。' },
          { f:2, t:1, label:'✓ 本登録 → 初期設定へ', good:true, dash:true, note:'登録完了。いきなり空っぽの画面ではなく、<b>最初の1歩</b>（プロフィール設定・使い方）に案内する。' },
        ]}),
        desc:'1つの機能にも、<b>うまくいく流れ（ハッピーパス）と、失敗したときの流れ</b>があります。失敗の流れでは「何が起きたか」と「次に何をすればいいか」を必ず示すこと。設計の段階で書き出しておくと、AIへの指示に漏れがなくなります。',
        prompt:'会員登録の流れを、成功する場合と、入力ミス・登録済み・メールが届かない・リンクの期限切れ・通信エラーの場合に分けて、画面に出す文言と次の行動まで設計して。' },
    ], null, true),
    S('画面設計の用語とコツ', [
      T('情報設計（IA）', 'Information Architecture', 'どの情報をどこに置き、どうたどり着かせるかの設計。メニューの分け方・名前の付け方。'),
      T('サイトマップ・画面一覧', 'Sitemap / screen list', 'すべての画面とURLの一覧。AIに「この一覧のとおりにルーティングを作って」と頼める。', '画面一覧（画面名・URL・ログイン必須か・主な要素・主な操作）を表にして。Next.js の App Router のフォルダ構成案も書いて。'),
      T('ワイヤーフレーム', 'Wireframe', '色や装飾のない、配置だけの設計図。'),
      T('モックアップ／プロトタイプ', 'Mockup / prototype', 'モック＝本物そっくりの見た目。プロトタイプ＝実際に触れる試作。'),
      T('ユーザーフロー', 'User flow', '目的を達成するまでの画面と操作の流れ。失敗した場合の分岐も描く。'),
      T('デザインシステム', 'Design system', 'ボタン・色・文字の大きさ・余白などの決まりごとと部品集。統一感が出て、AIへの指示も「既存のButtonを使って」で済む。（UIコンポーネント辞典・配色辞典参照）'),
      T('モバイルファースト', 'Mobile first', 'スマホの小さい画面から設計して、PCに広げる。逆だとスマホで詰め込みすぎになりがち。'),
      T('権限ごとの画面', 'Role-based screens', '未ログイン・一般・管理者で見える画面やボタンが違う場合は、表にしておく（守りはサーバー側で）。'),
      T('文言（マイクロコピー）', 'Microcopy', 'ボタン・エラー・空の状態の短い文章。画面の分かりやすさの半分は文言で決まる。'),
      T('参考にする画面を集める', 'Reference collection', '良いと思ったアプリのスクリーンショットを集めてAIに渡すと、雰囲気が伝わりやすい（Mobbin・Dribbble など）。'),
      T('AIで試作する', 'AI prototyping', 'v0・Lovable・Bolt・Claude のアーティファクトなどで、言葉や画像から動く画面をすぐ作れる。<b>試作で確かめてから本実装</b>が効率的。'),
      T('Figma', 'Figma', '画面デザインの定番ツール。無料で始められる。AIツールとの連携（デザインからコード生成）も進んでいる。'),
    ]),
  ]});

/* ================= 4. 作業を分けて進める ================= */
const TREE = [['家計簿アプリ（MVP）', 0, '', [['ログイン', 1, '', [['Supabaseの設定と環境変数', 2, 'S'], ['ログイン・登録画面', 2, 'M'], ['未ログイン時の転送', 2, 'S']]], ['支出の記録', 1, '', [['expenses テーブルとRLS', 2, 'S'], ['記録フォーム（金額・カテゴリ・日付）', 2, 'M'], ['一覧と削除', 2, 'M']]], ['今月の残り表示', 1, '', [['予算の設定画面', 2, 'S'], ['残り金額の計算と表示', 2, 'M'], ['グラフ（カテゴリ別）', 2, 'L']]], ['レシート読み取り', 1, '', [['写真のアップロード', 2, 'M'], ['AIで金額と店名を読み取る', 2, 'L'], ['読み取り結果の確認・修正画面', 2, 'M']]]]]];
const KB0 = [['ログイン画面', 0], ['支出テーブル', 0], ['記録フォーム', 0], ['一覧画面', 0], ['予算設定', 0], ['グラフ', 0]];

TABS.push({ id:'tasks', label:'作業を分けて進める', icon:'🧩',
  intro:'AIに「アプリを全部作って」と頼むと、大きすぎて途中で崩れます。<b>1回で確認できる大きさ</b>に分けて、1つずつ「作る → 確かめる → コミット」するのが、バイブコーディングで一番効くコツです。',
  sections:[
    C('触って理解する', [
      { name:'タスクを分解する', en:'Work breakdown', h:420, tags:['体験','最重要'],
        demo:'<div class="kt"><div class="wf-tree kt-grow t"></div><div class="kt-row"><button type="button" class="kt-btn pri ord">AIに頼む順番を見る</button><span class="kt-lbl">S＝1回の依頼／M＝1〜3回／L＝さらに分ける</span></div><div class="kt-verdict res">▸ をクリックで開閉。</div></div>',
        init:(el) => { const leaves = [];
          const render = (nodes, path) => nodes.map(([n, lv, sz, ch], i) => { const id = path + i; if (!ch) leaves.push([id, n, sz]); return `<div class="lv${lv}" data-id="${id}" style="padding-left:${lv * 16 + 4}px">${ch ? `<span class="tg" data-t="${id}">▾</span>` : '<span class="tg">・</span>'}${esc(n)}${sz ? `<span class="sz ${sz}">${sz}</span>` : ''}</div>${ch ? `<div data-k="${id}">${render(ch, id + '-')}</div>` : ''}`; }).join('');
          $(el, '.t').innerHTML = render(TREE, ''); $$(el, '[data-t]').forEach(t => t.onclick = () => { const b = $(el, `[data-k="${t.dataset.t}"]`), open = b.style.display !== 'none'; b.style.display = open ? 'none' : ''; t.textContent = open ? '▸' : '▾'; });
          $(el, '.ord').onclick = () => { let k = 0; $$(el, '.t div[data-id]').forEach(d => d.classList.remove('hl')); const seqL = leaves.filter(l => !/グラフ|AIで/.test(l[1])).concat(leaves.filter(l => /グラフ|AIで/.test(l[1])));
            const iv = setInterval(() => { if (k >= seqL.length){ clearInterval(iv); verdict($(el, '.res'), 'ok', '✅ 機能ごとに上から順に、<b>1つ終わるたびに動作確認とコミット</b>。大きい（L）タスクは最後に、さらに分けてから。'); return; } const d = $(el, `[data-id="${seqL[k][0]}"]`); d.classList.add('hl'); verdict($(el, '.res'), '', `${k + 1}. ${esc(seqL[k][1])}`); k++; }, 380); };
        },
        desc:'大きな目標（エピック）→ 機能 → タスクと、<b>1回の依頼で終わる大きさ</b>まで分けます。目安は「AIの変更を自分で読んで確認できる量」。大きいタスク（L）はさらに分けるか、まず調査だけ頼みます。分解自体もAIに手伝ってもらえます。',
        prompt:'このアプリのMVPを作るためのタスクを、機能ごとに分解して。各タスクは「1回の依頼で実装でき、変更を目で確認できる大きさ」にして、S/M/L の大きさと、依存関係を考えた実施順を付けて。GitHub の Issue として登録できる形（タイトル・説明・受け入れ条件）でお願い。' },
      { name:'横に切る・縦に切る', en:'Horizontal vs vertical slicing', h:380, tags:['体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="wf-grid g"></div><div class="kt-row"><button type="button" class="kt-btn pri nx">1週間進める</button><button type="button" class="kt-btn sm rs">最初から</button><b class="kt-mono wk"></b></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const L = ['画面', 'API', 'DB'], F = ['ログイン', '記録', 'グラフ']; let mode = 0, w = 0;
          const order = () => mode ? F.flatMap((_, f) => [2, 1, 0].map(l => [l, f])) : [2, 1, 0].flatMap(l => F.map((_, f) => [l, f]));
          const draw = () => { const done = order().slice(0, w), set = new Set(done.map(([l, f]) => l + '-' + f)); const works = F.filter((_, f) => L.every((_, l) => set.has(l + '-' + f)));
            $(el, '.g').innerHTML = '<b></b>' + F.map(f => `<b>${f}</b>`).join('') + L.map((l, li) => `<b>${l}</b>` + F.map((f, fi) => `<i class="${set.has(li + '-' + fi) ? 'done' + (works.includes(f) ? ' ok' : '') : ''}">${set.has(li + '-' + fi) ? '✓' : ''}</i>`).join('')).join('');
            $(el, '.wk').textContent = `${w}週目`; verdict($(el, '.res'), works.length ? 'ok' : w ? 'warn' : '', w === 0 ? '「1週間進める」を押してください。' : works.length ? `✅ 使える機能：<b>${works.join('・')}</b>（緑）。動くものを見て、早めに方向修正できます。` : `⚠ ${w}週間作業したのに、<b>まだ使える機能が0個</b>。全部そろうまで、方向が合っているか確かめられません。`); };
          $(el, '.sw').replaceWith(seg(['横に切る（層ごと）', '縦に切る（機能ごと）'], k => { mode = k; w = 0; draw(); }).el);
          $(el, '.nx').onclick = () => { if (w < 9){ w++; draw(); } }; $(el, '.rs').onclick = () => { w = 0; draw(); }; },
        desc:'<b>横に切る</b>＝DBを全部 → APIを全部 → 画面を全部、の順。最後まで何も動きません。<b>縦に切る</b>＝1つの機能をDB・API・画面まで一気に通す。毎回「動くもの」ができるので、確かめながら進められます。AIとの開発では<b>縦切りが基本</b>です。',
        prompt:'このMVPを、1つの機能ずつ画面・API・DBまで通して動く形（縦切り）で、順番に実装する計画を立てて。各段階の終わりに、動作を確認する方法も書いて。' },
      { name:'かんばんと「同時に進めすぎない」', en:'Kanban & WIP limit', h:360, tags:['体験'],
        demo:'<div class="kt"><div class="wf-kb kb"><div class="todo"><b>やること</b></div><div class="doing"><b>作業中 <span>上限2</span></b></div><div class="done"><b>完了</b></div></div><div class="kt-verdict res">カードをクリックすると右の列へ進みます。</div></div>',
        init:(el) => { const st = KB0.map(k => [...k]);
          const draw = () => { const cols = ['todo', 'doing', 'done']; cols.forEach((c, ci) => { const box = $(el, '.' + c), head = box.firstElementChild; box.innerHTML = ''; box.append(head); st.forEach((s, i) => { if (s[1] === ci){ const d = document.createElement('div'); d.className = 'card'; d.textContent = s[0]; d.onclick = () => { if (s[1] < 2){ s[1]++; draw(); } }; box.append(d); } }); });
            const doing = st.filter(s => s[1] === 1).length; $(el, '.doing').classList.toggle('over', doing > 2);
            verdict($(el, '.res'), doing > 2 ? 'bad' : st.every(s => s[1] === 2) ? 'ok' : '', doing > 2 ? `❌ 作業中が <b>${doing}個</b>。AIとの会話・ブランチ・確認が混ざって、どれも終わらなくなります。1つ終わらせてから次へ。` : st.every(s => s[1] === 2) ? '✅ すべて完了！' : 'カードをクリックすると右の列へ進みます。'); };
          draw(); },
        desc:'<b>かんばん</b>は「やること・作業中・完了」の3列でタスクを見える化する方法。大事なのは<b>作業中の数に上限（WIP制限）</b>を設けること。AIに並行して複数のことを頼むと、変更が混ざって確認できなくなります。1つ終わらせてから次へ。GitHub Projects・Trello・Notion で作れます。',
        prompt:'GitHub Projects でかんばんボード（Todo / In Progress / Done）を作り、MVPのタスクをIssueとして登録して。In Progress は同時に2つまでのルールで進めたいので、今やるべき2つを選んで。' },
    ], null, true),
    S('進め方の用語とコツ', [
      T('エピック・ストーリー・タスク', 'Epic / story / task', 'エピック＝大きな目標、ストーリー＝利用者にとって意味のある機能、タスク＝作業の単位。'),
      T('縦切り', 'Vertical slice', '1つの機能を、画面からDBまで通して完成させる切り方。早く動くものができ、方向修正がしやすい。', null, ['おすすめ']),
      T('1回の依頼の大きさ', 'Task sizing for AI', '「変更されたファイルを自分で読める量」「動作確認が5分で終わる量」が目安。大きすぎる依頼ほど、関係ない場所まで書き換えられる。', null, ['バイブコーディング']),
      T('完了の定義', 'Definition of Done', '「完了」と言える条件を決めておく（例：受け入れ条件を満たす・型エラーなし・テストが通る・スマホで確認・コミット済み）。AIにも渡せる。', 'このプロジェクトの「完了の定義」を作って CLAUDE.md に書いて：型チェック・リンター・テストが通る、受け入れ条件を手で確認、スマホ幅で表示確認、コミット済み。'),
      T('スパイク（調査タスク）', 'Spike', '作り方が分からないときに、時間を区切って調査・試作だけをするタスク。結果を元に本番の作り方を決める。'),
      T('タイムボックス', 'Timebox', '「この作業は2時間まで」と時間を区切る。うまくいかなければ、やり方を変える・小さくする・相談する。'),
      T('WIP制限', 'Work in progress limit', '同時に進める作業の数の上限。終わらせることを優先する。'),
      T('マイルストーン', 'Milestone', '「〇日までに、ここまで動く」という中間目標。公開日から逆算して置く。'),
      T('Issue で管理する', 'Issue tracking', 'GitHub Issue に1タスク1件で登録。AIエージェント（Claude Code など）に「Issue #12 を実装して」と渡せる。'),
      T('1タスク＝1ブランチ＝1プルリクエスト', 'One task, one branch, one PR', '変更の単位がそろうと、レビュー・取り消し・振り返りが楽。（Git辞典参照）'),
      T('見積もりは幅で', 'Estimate with ranges', '「3日」ではなく「2〜5日」。初めての作業ほど幅が大きい。AIで速くなるのは書く部分で、確認・修正の時間は残る。'),
      T('依存関係の順番', 'Dependencies', '認証 → データ → 一覧 → 編集 のように、土台から順番に。先に作ると後で全部直すことになる部分（DB設計・認証）は早めに固める。'),
      T('作業ログを残す', 'Work log', '何をして・何に詰まり・どう解決したかを短く記録。次回のAIとの会話の最初に渡すと、続きから始められる。'),
    ]),
  ]});
})();
