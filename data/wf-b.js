/* 要件定義・AI開発の進め方辞典 — B: AIとの開発サイクル / AIエージェントの使いこなし / 確認・テスト・レビュー / テンプレート集 */
(function(){
const { $, $$, esc, tbl, seg, seq, stepper } = KIT;
const { S, C, T, verdict, md, docOut } = window.WFH;
const TP = (name, en, desc, tpl, prompt, tags) => ({ name, en, desc, prompt, tags, code:tpl, codeLabel:'テンプレート（Markdown）' });

/* ================= 5. AIとの開発サイクル ================= */
const LOOP = [['計画', 'AIに計画を出させる', '何を・どのファイルで・どの順に変えるかをAIに先に説明させ、あなたが確認・修正します。'], ['小さく実装', '1つだけ頼む', '計画の1ステップだけを実装させます。一度に全部やらせない。'], ['確認', '動かして確かめる', 'テストを実行し、画面を実際に触ります。AIにも「確認方法」を渡して自分で確かめさせる。'], ['差分を読む', 'git diff', '関係ない変更・消えたコード・デバッグ用の残骸がないか。分からない部分は説明させる。'], ['コミット', 'セーブポイント', '動いたら必ずコミット。次で壊れても、ここに戻れます。'], ['次へ', '記録して次のステップ', '決めたこと・残りの課題をメモして、次のステップへ。会話が長くなったら新しい会話で。']];
const CTX = [['CLAUDE.md・ルール', 3, '#7c3aed'], ['ファイルを読む', 12, '#2563eb'], ['ログを貼る', 25, '#d97706'], ['会話10往復', 20, '#0891b2'], ['大きなファイル丸ごと', 90, '#dc2626']];
const CLAIMS = [['`npm install react-auth-helper-pro` で認証が簡単に作れます', 'bad', '<b>作り話の可能性</b>：AIは存在しないパッケージ名を作ることがあります。<code>npm view パッケージ名</code> や npmjs.com で、作者・ダウンロード数・更新日を確認。'], ['Supabase の RLS を有効にすると、anon キーでも他人の行は読めなくなります', 'ok', '<b>正しい</b>（ポリシーが正しければ）。公式ドキュメントの「Row Level Security」で確認できます。'], ['Next.js の `getServerSideProps` を App Router のページで使ってください', 'bad', '<b>古い情報</b>：これは Pages Router の書き方。App Router では使えません。AIの知識は古いことがあるので、<b>使っているバージョンを伝える</b>。'], ['`fetch` のオプション `retry: 3` で自動で再試行されます', 'bad', '<b>存在しないオプション</b>：標準の fetch に retry はありません。もっともらしい引数名を作ることがあります。型エラーや公式リファレンスで確認。'], ['日付は `toISOString()` で UTC の文字列になります', 'ok', '<b>正しい</b>。こういう基本的な事実は信頼度が高めですが、迷ったらブラウザのコンソールで試すのが一番早い。']];

TABS.push({ id:'ai-dev', label:'AIとの開発サイクル', icon:'🔁',
  intro:'AIとの開発は「頼む → 待つ」ではなく、<b>計画 → 小さく実装 → 確認 → コミット</b>を短く回す共同作業です。AIの作業メモリ（コンテキスト）の仕組み、良い依頼文の型、詰まったときの抜け出し方、AIの「もっともらしい間違い」の見抜き方をまとめました。',
  sections:[
    C('触って理解する', [
      { name:'開発のサイクル', en:'Plan → build → verify → commit', h:380, tags:['最重要'],
        demo:'<div class="kt center"><div class="kt-row" style="flex-wrap:nowrap;gap:14px;align-items:center"><div class="wf-loop lp"><div class="ring"></div><div class="ce">↻</div></div><div class="kt-verdict res" style="flex:1;min-width:0"></div></div><div class="kt-row"><button type="button" class="kt-btn sm pv">◀</button><button type="button" class="kt-btn pri sm nx">次のステップ ▶</button></div></div>',
        init:(el) => { let k = 0; const lp = $(el, '.lp'); LOOP.forEach(([n, s], i) => { const a = -Math.PI / 2 + i / LOOP.length * Math.PI * 2; lp.insertAdjacentHTML('beforeend', `<div class="st" style="left:${50 + Math.cos(a) * 40}%;top:${50 + Math.sin(a) * 40}%">${n}<small>${s}</small></div>`); });
          const draw = () => { $$(lp, '.st').forEach((s, i) => s.classList.toggle('on', i === k)); $(el, '.res').innerHTML = `<b>${k + 1}. ${LOOP[k][0]}</b>：${LOOP[k][2]}`; };
          $(el, '.nx').onclick = () => { k = (k + 1) % LOOP.length; draw(); }; $(el, '.pv').onclick = () => { k = (k + LOOP.length - 1) % LOOP.length; draw(); }; draw(); },
        desc:'1周を<b>短く（数分〜30分）</b>回すほど、失敗しても失うものが小さくなります。人がやるべきは「計画の確認」「動作の確認」「差分を読む」の3つ。ここを飛ばすと、気づいたときには直せないほど崩れています。',
        prompt:'これから一緒に開発します。毎回、①変更の計画（どのファイルをどう変えるか）を先に見せる ②私がOKしたら1ステップだけ実装 ③テストと型チェックを実行して結果を報告 ④変更の要約を見せる、の順で進めて。私が確認したらコミットして次へ。' },
      { name:'コンテキスト（AIの作業メモリ）', en:'Context window', h:420, tags:['体験','仕組み'],
        demo:'<div class="kt"><div class="kt-row"><span class="kt-lbl">AIの作業メモリの大きさ</span><span class="sw"></span></div><div class="wf-ctx bar"></div><div class="wf-legend lg"></div><div class="kt-row ad"></div><div class="kt-row"><button type="button" class="kt-btn sm cp">要約して圧縮（/compact）</button><button type="button" class="kt-btn sm cl">新しい会話（/clear）</button></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let cap = 200, items = [];
          const draw = () => { const used = items.reduce((a, x) => a + x[1], 0); $(el, '.bar').innerHTML = items.map(([n, v, c]) => `<i style="width:${Math.min(100, v / cap * 100)}%;background:${c}"><span>${n}</span></i>`).join('');
            const groups = {}; items.forEach(([n, v, c]) => { groups[n] = groups[n] || [0, c]; groups[n][0] += v; }); $(el, '.lg').innerHTML = Object.entries(groups).map(([n, [v, c]]) => `<span style="--c:${c}">${n} ${v}k</span>`).join('') + `<span style="margin-left:auto;font-weight:800">${used}k / ${cap}k</span>`;
            const r = used / cap; verdict($(el, '.res'), r > 1 ? 'bad' : r > .75 ? 'warn' : 'ok', r > 1 ? '❌ <b>入りきりません</b>。古い内容が自動で要約され、細かい指示や途中の決定が抜け落ちます。' : r > .75 ? '⚠ 残りわずか。長い会話の後半は、最初の指示を忘れたような動きが増えます。区切りのいいところで新しい会話へ。' : '✅ 余裕があります。必要なファイルだけを読ませると、AIの注意が散らばりません。'); };
          $(el, '.sw').replaceWith(seg(['20万トークン', '100万トークン'], k => { cap = k ? 1000 : 200; draw(); }).el);
          $(el, '.ad').innerHTML = '<span class="kt-lbl">追加：</span>' + CTX.map(([n, v], i) => `<button type="button" class="kt-btn sm" data-i="${i}">＋${n}（${v}k）</button>`).join('');
          $$(el, '.ad button').forEach(b => b.onclick = () => { items.push(CTX[+b.dataset.i]); draw(); });
          $(el, '.cp').onclick = () => { const keep = items.filter(x => x[0] === 'CLAUDE.md・ルール'); items = keep.concat(items.length > keep.length ? [['要約', 6, '#64748b']] : []); draw(); };
          $(el, '.cl').onclick = () => { items = [CTX[0]]; draw(); }; items = [CTX[0]]; draw(); },
        desc:'AIは会話・読んだファイル・ツールの結果を、<b>決まった大きさの作業メモリ（コンテキスト）</b>に入れて考えます。いっぱいに近づくと、古い内容が要約されたり、注意が散らばったりします。<b>1つの会話で1つのタスク</b>、終わったら新しい会話、決めたことはファイル（CLAUDE.md・docs/）に残す、が基本です。',
        prompt:'会話が長くなってきたので、ここまでで決まったこと・変更したファイル・残っている課題・次にやることを、新しい会話に貼れる形でまとめて。重要な決定は docs/decisions.md にも追記して。' },
      { name:'良い依頼文の6つの要素', en:'Prompt builder for coding', h:520, wide:true, tags:['体験','テンプレ'],
        demo:'<div class="kt"><div class="kt-row kt-split" style="align-items:stretch;flex-wrap:nowrap;gap:10px;flex:1;min-height:0"><div class="wf-form fm" style="flex:1;align-content:start;overflow:auto"></div><div style="flex:1;display:flex;flex-direction:column;gap:5px;min-height:0"><div class="out" style="flex:1;display:flex;flex-direction:column;gap:4px;min-height:0"></div><div class="kt-verdict res"></div></div></div></div>',
        init:(el) => { const F = [['goal', '目的', 'レシピ一覧に「材料で絞り込む」機能を追加したい'], ['why', '背景・理由', '冷蔵庫にある材料から作れる料理を探したいという要望が多い'], ['what', 'やること', '一覧の上に材料の入力欄（複数可）を置き、すべての材料を含むレシピだけを表示する'], ['rule', '制約', '既存の SearchBar コンポーネントを使う。新しいパッケージは追加しない。DBの変更が必要なら先に相談'], ['done', '完了条件', '材料2つで絞り込める／0件のときの表示がある／既存の検索が壊れていない'], ['check', '確認方法', 'npm test と npm run typecheck が通ること。変更したファイルの一覧と要約を報告']];
          $(el, '.fm').innerHTML = F.map(([k, l, v]) => `<b>${l}</b><textarea class="kt-in" rows="2" data-k="${k}" aria-label="${l}">${esc(v)}</textarea>`).join('');
          const run = () => { const v = {}; let n = 0; $$(el, '.fm textarea').forEach(t => { v[t.dataset.k] = t.value.trim(); if (v[t.dataset.k]) n++; });
            const parts = [['目的', v.goal], ['背景', v.why], ['やること', v.what], ['制約', v.rule], ['完了条件', v.done], ['確認方法', v.check]].filter(x => x[1]);
            docOut($(el, '.out'), parts.map(([h, b]) => `## ${h}\n${b}`).join('\n') + '\n## 進め方\n実装の前に、変更するファイルと手順の計画を見せてください。', 'AIへの依頼文');
            verdict($(el, '.res'), n >= 6 ? 'ok' : n >= 4 ? 'warn' : 'bad', n >= 6 ? '✅ 6つそろった依頼です。AIが<b>自分で完了を確かめられる</b>ので、手戻りが減ります。' : `⚠ ${6 - n}つの要素が空です。特に「完了条件」と「確認方法」がないと、AIは「できました」と言うだけで止まります。`); };
          $$(el, '.fm textarea').forEach(t => t.oninput = run); run(); },
        desc:'コーディングの依頼は<b>目的・背景・やること・制約・完了条件・確認方法</b>の6つがそろうと、ぐっと正確になります。特に「完了条件」と「確認方法」を書くと、AIがテストを実行して自分で確かめてから報告してくれます。左を書き換えて試してください。',
        prompt:'次の依頼を、目的・背景・やること・制約・完了条件・確認方法の6つの要素に整理し直して、足りない要素があれば質問して：（依頼文）' },
      { name:'計画してから実装する（プランモード）', en:'Plan first', h:430, tags:['仕組み','おすすめ'],
        init:(el) => seq(el, { actors:[{ icon:'🧑', label:'あなた' }, { icon:'🤖', label:'AI' }, { icon:'📁', label:'コード' }], steps:[
          { f:0, t:1, label:'「〇〇を追加したい。まず計画を」', note:'いきなり実装させず、<b>計画だけ</b>を頼みます（Claude Code ならプランモード）。' },
          { f:1, t:2, label:'関係するファイルを読む', note:'AIが既存のコードを調べます。この段階ではファイルを書き換えません。' },
          { f:1, t:0, label:'計画：変更するファイル・手順・リスク', dash:true, note:'「どのファイルを・どう変え・どう確かめるか」が提示されます。' },
          { f:0, t:1, label:'修正：「DBは変えずに」「この部品を使って」', note:'<b>ここで直すのが一番安い</b>。コードになってからでは手戻りが大きい。' },
          { f:0, t:1, label:'承認', good:true, note:'計画に納得したら承認。' },
          { f:1, t:2, label:'ステップごとに実装', note:'計画に沿って実装。大きい場合は1ステップずつ。' },
          { f:1, t:2, label:'テスト・型チェックを実行', note:'完了条件を自分で確認します。' },
          { f:1, t:0, label:'結果と変更の要約を報告', dash:true, good:true, note:'あなたは差分と動作を確認して、コミット。' },
        ]}),
        desc:'<b>先に計画を見せてもらう</b>だけで、「思っていたのと違う」がほぼなくなります。計画の段階なら、修正は一言で済みます。Claude Code の<b>プランモード</b>や、他のツールの「計画・質問モード」がこのためにあります。',
        prompt:'まだコードは書かないで。〇〇を実現するために、変更が必要なファイル、各ファイルでの変更内容、実施の順番、影響を受けそうな既存機能、確認方法を計画として出して。私が承認してから実装を始めて。' },
      { name:'AIの「もっともらしい間違い」', en:'Spotting hallucinations', h:420, tags:['体験','注意'],
        demo:'<div class="kt"><div class="kt-lbl">AIの発言。クリックして本当か確かめる</div><div class="ls kt-grow" style="display:flex;flex-direction:column;gap:4px;overflow:auto;min-height:0"></div><div class="kt-verdict res">AIは自信満々に間違えることがあります。</div></div>',
        init:(el) => { $(el, '.ls').innerHTML = CLAIMS.map(([t], i) => `<button type="button" data-i="${i}" style="text-align:left;border:1px solid var(--border);background:var(--surface);color:var(--text);border-radius:8px;padding:6px 9px;font:12px var(--font);cursor:pointer">🤖 ${esc(t).replace(/`([^`]+)`/g, '<code>$1</code>')}</button>`).join('');
          $$(el, '.ls button').forEach(b => b.onclick = () => { const [, v, h] = CLAIMS[+b.dataset.i]; b.style.borderColor = v === 'ok' ? 'var(--ok)' : 'var(--bad)'; verdict($(el, '.res'), v, (v === 'ok' ? '✅ ' : '❌ ') + h); }); },
        desc:'AIの間違いは「明らかに変」ではなく、<b>存在しそうなパッケージ名・関数・オプション・古い書き方</b>として出てきます。対策は、①使っているバージョンを伝える ②公式ドキュメントのURLを渡す・読ませる ③型チェックやテストで機械的に確かめる ④新しい依存を入れる前に確認する。',
        prompt:'今の回答で使っているライブラリの関数・オプション・設定項目が、このプロジェクトのバージョン（package.json を確認）に本当に存在するか、公式ドキュメントを根拠に確認して。確認できないものは「未確認」と明記して。' },
      { name:'詰まったときの抜け出し方', en:'When AI gets stuck', h:380, tags:['手順'],
        init:(el) => stepper(el, ['<b>同じ修正を2〜3回頼んでも直らない</b>と気づく。それ以上同じ会話で粘らない。', '<b>動いていた状態に戻す</b>（git restore / 最後のコミット）。壊れたコードの上に修正を重ねない。', '<b>情報を足す</b>：エラー全文・再現手順・期待する動き・関係するファイル・試したこと。', '<b>原因の調査だけを頼む</b>：「直さなくていいので、原因の仮説を3つと確かめ方を」。', '<b>新しい会話で</b>、まとめた情報を渡してやり直す（古い会話の思い込みを持ち込まない）。', '<b>問題を小さくする</b>：最小の再現例を作る・機能を分けて1つずつ。', 'それでもだめなら<b>別のやり方</b>を検討（別のライブラリ・設計の変更・人に聞く）。'], { title:'「直して」を繰り返すループから抜ける' }),
        desc:'AIが同じ間違いを繰り返すときは、AIの能力ではなく<b>情報や前提が足りていない</b>ことがほとんどです。壊れた状態に修正を重ねるほど悪化するので、戻す → 情報を足す → 調査だけ頼む → 新しい会話、の順で立て直します。',
        prompt:'この問題は何度か修正を試しましたが直りません。まだ直さないでください。エラー全文と関係するコードを渡すので、原因の仮説を可能性の高い順に3つ挙げて、それぞれを確かめる方法（ログの追加・最小の再現）を教えて。' },
    ], null, true),
    S('AIとの開発のコツ', [
      T('1つの会話に1つのタスク', 'One task per session', '話題が混ざると、前の話の思い込みが残る。タスクが終わったら新しい会話へ。続きは要約を渡す。', null, ['基本']),
      T('動いたらコミット', 'Commit when it works', 'AIに次を頼む前に必ずコミット。壊れても数秒で戻れる。（Git辞典参照）', null, ['最重要']),
      T('差分を読む', 'Read the diff', '全部を理解できなくても、どのファイルが変わったか・何行変わったか・消えた部分はないかだけでも見る。分からない部分は「この変更を説明して」。'),
      T('完了条件と確認方法を渡す', 'Give a definition of done', '「できました」ではなく「テストが通りました」で終われるようにする。'),
      T('使っているバージョンを伝える', 'State versions', 'Next.js 15・React 19・Tailwind v4 など。AIの知識が古いと、昔の書き方を出してくる。CLAUDE.md に書いておくと毎回伝えなくて済む。'),
      T('公式ドキュメントを読ませる', 'Ground with docs', 'URLを渡したり、ドキュメント検索ツール（MCP）を使わせたりすると、作り話が大きく減る。'),
      T('新しい依存は確認してから', 'Approve new dependencies', 'AIは気軽にパッケージを追加する。「追加する前に名前・理由を見せて」とルールにしておく。'),
      T('画面はスクリーンショットで伝える', 'Show screenshots', '「ここがずれている」は画像を貼るのが最速。AIがブラウザを操作して自分で確認できるツールもある。'),
      T('エラーは全文を渡す', 'Paste full errors', '要約すると肝心な部分（ファイル名・行番号）が消える。（エラー辞典参照）'),
      T('調査と実装を分ける', 'Investigate first', '原因が分からないうちに直させると、症状だけ隠す修正になりがち。「まず原因の調査だけ」。'),
      T('AIに質問させる', 'Let AI ask questions', '「不明点があれば実装前に質問して」と一言添えるだけで、推測による作り直しが減る。'),
      T('並行作業は分けて', 'Parallel work safely', '複数のAIに同時に作業させるなら、ブランチ（ワークツリー）を分け、同じファイルを触らせない。'),
      T('最後は人が判断する', 'Human in the loop', '公開・削除・お金・個人情報に関わる操作は、AIの提案を人が確認してから実行する。'),
    ]),
  ]});

/* ================= 6. AIエージェントの使いこなし ================= */
const WHERE = [['📘', 'CLAUDE.md', 'いつも守ってほしいこと', '<b>CLAUDE.md</b>（プロジェクトのルートなど）：毎回の会話で最初に読まれる「プロジェクトの約束事」。コマンド・構成・書き方のルール・やってはいけないこと。短く保つ。'], ['🧰', 'スキル', '特定の作業の手順書', '<b>スキル</b>（<code>.claude/skills/名前/SKILL.md</code>）：「デプロイの手順」「記事の書き方」など、<b>必要なときだけ</b>読み込まれる手順書。台本やスクリプトも同梱できる。'], ['🧑‍🤝‍🧑', 'サブエージェント', '専門の助手に任せる', '<b>サブエージェント</b>（<code>.claude/agents/</code>）：調査・レビュー・テストなど、別のコンテキストで働く専門の助手。メインの会話を散らかさずに済む。'], ['🪝', 'フック', '必ず自動で実行する', '<b>フック</b>（設定ファイルの hooks）：「ファイルを編集したら必ず整形」「危険なコマンドは止める」など、<b>AIの判断に任せず必ず</b>実行したい処理。'], ['🔌', 'MCP', '外部の道具をつなぐ', '<b>MCPサーバー</b>：GitHub・データベース・ブラウザ・Notion・ドキュメント検索などを、AIが使える道具として接続する共通規格。'], ['🔐', '権限の設定', '自動で許す・必ず聞く', '<b>権限（settings.json）</b>：どのコマンドやファイル操作を自動で許可し、何を毎回確認し、何を禁止するか。'], ['⌨️', 'スラッシュコマンド', 'よく使う依頼を短縮', '<b>スラッシュコマンド</b>：<code>/review</code> のように、よく使う依頼文を短い名前で呼び出す（今はスキルとしても作れる）。']];
const PERM = [['ファイルを読む', '自動', '自動', '自動', '自動'], ['ファイルを編集', '確認', '自動', '不可（計画のみ）', '自動'], ['コマンドを実行', '確認', '確認', '不可', '自動'], ['インターネットに接続', '確認', '確認', '確認', '自動'], ['git push・デプロイ', '確認', '確認', '不可', '⚠ 自動']];
const MCPS = [['🐙', 'GitHub', 'Issue・プルリクエスト・Actionsの結果を読んだり作ったりできる。「Issue #12 を実装してPRを作って」が通じる。'], ['🗄', 'データベース', 'Supabase・PostgreSQLなどのテーブル構造やデータを読める。本番DBにつなぐときは<b>読み取り専用</b>に。'], ['🌐', 'ブラウザ', 'AIがブラウザを操作して画面を確認・テストできる（Playwright など）。見た目の不具合を自分で見つけられる。'], ['📚', 'ドキュメント検索', 'ライブラリの最新の公式ドキュメントを検索させる。古い書き方・作り話が減る。'], ['📝', 'Notion・Googleドライブ', '仕様書や議事録を読ませる。要件をそのまま実装に反映できる。'], ['🎨', 'Figma', 'デザインデータを読ませて、画面のコードに起こす。']];

TABS.push({ id:'agents', label:'AIエージェントの使いこなし', icon:'🤖',
  intro:'Claude Code・Cursor・Codex などの<b>AIコーディングエージェント</b>は、ファイルを読み書きし、コマンドを実行し、テストまで回します。プロジェクトの約束事を書く CLAUDE.md、手順書（スキル）、助手（サブエージェント）、自動処理（フック）、外部の道具（MCP）、権限の考え方をまとめました。（機能やコマンド名はツールやバージョンで変わることがあります）',
  sections:[
    C('触って理解する', [
      { name:'CLAUDE.md をつくる', en:'Project memory file', h:520, wide:true, tags:['体験','最重要'],
        demo:'<div class="kt"><div class="kt-row kt-split" style="align-items:stretch;flex-wrap:nowrap;gap:10px;flex:1;min-height:0"><div class="wf-form fm" style="flex:1;align-content:start;overflow:auto"></div><div class="out" style="flex:1;display:flex;flex-direction:column;gap:4px;min-height:0"></div></div></div>',
        init:(el) => { const F = [['about', 'アプリの概要', '一人暮らし向けの家計簿Webアプリ（スマホ優先）'], ['stack', '技術', 'Next.js 15（App Router）/ TypeScript / Tailwind CSS v4 / Supabase'], ['cmd', 'コマンド', 'npm run dev（開発）/ npm test / npm run typecheck / npm run lint'], ['dirs', 'フォルダ構成', 'app/（画面）components/（部品）lib/（処理）supabase/migrations/（DB変更）docs/（仕様）'], ['style', '書き方のルール', 'コンポーネントは関数で。サーバーで済む処理はServer Componentで。日付は lib/date.ts を使う'], ['dont', 'やってはいけないこと', '.env を読まない・書かない／依存の追加は事前に確認／main に直接コミットしない／マイグレーションを書き換えない'], ['done', '完了の条件', 'typecheck・lint・test が通る。変更の要約と確認方法を報告する']];
          $(el, '.fm').innerHTML = F.map(([k, l, v]) => `<b>${l}</b><textarea class="kt-in" rows="2" data-k="${k}" aria-label="${l}">${esc(v)}</textarea>`).join('');
          const run = () => { const v = {}; $$(el, '.fm textarea').forEach(t => v[t.dataset.k] = t.value.trim());
            docOut($(el, '.out'), `# CLAUDE.md\n## このプロジェクト\n${v.about}\n## 技術\n${v.stack}\n## よく使うコマンド\n${v.cmd.split(/\s*\/\s*/).map(x => '- ' + x).join('\n')}\n## フォルダ構成\n${v.dirs}\n## 書き方のルール\n${v.style.split(/。\s*/).filter(Boolean).map(x => '- ' + x).join('\n')}\n## やってはいけないこと\n${v.dont.split(/／/).map(x => '- ' + x).join('\n')}\n## 完了の条件\n${v.done}\n## 詳しい仕様\n- docs/prd.md（要件）\n- docs/screens.md（画面一覧）`, 'CLAUDE.md（プロジェクトのルートに置く）'); };
          $$(el, '.fm textarea').forEach(t => t.oninput = run); run(); },
        desc:'<b>CLAUDE.md</b> は、AIが会話の最初に読む「プロジェクトの約束事」です。毎回説明していたこと（コマンド・構成・ルール・禁止事項・完了条件）を書いておけば、新しい会話でもすぐに正しく動きます。<b>短く・具体的に</b>が鉄則。詳しい仕様は docs/ に置いて参照させます。Codex などは <code>AGENTS.md</code>、Cursor は <code>.cursor/rules</code> が同じ役割です。',
        prompt:'このリポジトリを調べて、CLAUDE.md を作って（Claude Code なら /init でも作れます）。概要・技術とバージョン・よく使うコマンド・フォルダ構成・書き方のルール・やってはいけないこと・完了の条件を、100行以内で簡潔に。推測した部分は確認させて。' },
      { name:'どこに書く？（7つの仕組み）', en:'Memory / skills / agents / hooks / MCP', h:380, tags:['体験','整理'],
        demo:'<div class="kt"><div class="wf-where ws"></div><div class="kt-verdict res kt-grow"></div></div>',
        init:(el) => { $(el, '.ws').innerHTML = WHERE.map(([ic, n, s], i) => `<button type="button" data-i="${i}"><i>${ic}</i>${n}<br><small style="font-weight:500;color:var(--muted)">${s}</small></button>`).join('');
          const pick = (i) => { $$(el, '.ws button').forEach((b, j) => b.classList.toggle('on', i === j)); $(el, '.res').innerHTML = WHERE[i][3]; }; $$(el, '.ws button').forEach(b => b.onclick = () => pick(+b.dataset.i)); pick(0); },
        desc:'AIエージェントへの指示は、置き場所で効き方が変わります。<b>いつも必要 → CLAUDE.md</b>、<b>ときどき必要な手順 → スキル</b>、<b>任せたい専門作業 → サブエージェント</b>、<b>必ず自動で実行 → フック</b>、<b>外部の道具 → MCP</b>、<b>許可・禁止 → 権限設定</b>。CLAUDE.md に全部詰め込むと、長すぎて大事なことが埋もれます。',
        prompt:'このプロジェクトで繰り返している作業（デプロイ前の確認・記事の追加・レビュー）を洗い出して、CLAUDE.md に書くもの・スキルにするもの・フックで自動化するものに分けて提案して。' },
      { name:'権限モードの違い', en:'Permission modes', h:340, tags:['安全','比較'],
        demo:'<div class="kt"><span class="sw"></span><div class="kt-tblwrap t"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const M = ['毎回確認（標準）', '編集は自動', 'プラン（計画のみ）', '確認なし'], N = ['基本の設定。編集やコマンドの前に確認されるので安全。慣れるまではこれで。', 'ファイルの編集は自動、コマンドは確認。ブランチで作業していれば、編集はGitで戻せる。', '読むだけで、変更はしない。計画を立てさせるときに使う。', '⚠ すべて自動。<b>隔離された環境（コンテナ・使い捨てのブランチ）以外では使わない</b>。git push や削除まで止まらない。'];
          $(el, '.sw').replaceWith(seg(M, i => { $(el, '.t').innerHTML = tbl(['操作', M[i]], PERM.map(r => [r[0], r[i + 1]]), { cls:(r) => /不可/.test(r[1]) ? 'dim' : /⚠/.test(r[1]) ? 'bad' : r[1] === '自動' ? 'ok' : '' }); verdict($(el, '.res'), i === 3 ? 'bad' : i === 0 ? 'ok' : '', N[i]); }).el); },
        desc:'エージェントに<b>どこまで自動で任せるか</b>の設定です。自由にさせるほど速いですが、間違えたときの被害も大きくなります。「よく使う安全なコマンド（テスト・型チェック）だけ自動許可」「git push と削除は必ず確認」のように、設定で細かく決められます。（モードの名前と切り替え方はツールごとに違います）',
        prompt:'Claude Code の権限設定（.claude/settings.json）を作って。npm test・npm run lint・npm run typecheck・git status・git diff は自動許可、git push・rm -rf・.env の読み書きは禁止、それ以外は確認する設定にして。' },
      { name:'MCP でつなげる道具', en:'Model Context Protocol', h:360, tags:['体験','拡張'],
        demo:'<div class="kt"><div class="wf-where ms"></div><div class="kt-verdict res kt-grow"></div></div>',
        init:(el) => { $(el, '.ms').innerHTML = MCPS.map(([ic, n], i) => `<button type="button" data-i="${i}"><i>${ic}</i>${n}</button>`).join('');
          const pick = (i) => { $$(el, '.ms button').forEach((b, j) => b.classList.toggle('on', i === j)); $(el, '.res').innerHTML = `<b>${MCPS[i][1]}</b>：${MCPS[i][2]}`; }; $$(el, '.ms button').forEach(b => b.onclick = () => pick(+b.dataset.i)); pick(0); },
        desc:'<b>MCP（Model Context Protocol）</b>は、AIと外部の道具をつなぐ共通の規格です。対応するサーバーを追加すると、AIがGitHub・データベース・ブラウザ・社内文書などを直接使えるようになります。<b>信頼できる提供元のものだけ</b>を入れ、書き込み権限は必要最小限に（外部の文章によるプロンプトインジェクションにも注意。セキュリティ辞典参照）。',
        prompt:'このプロジェクトで役立ちそうな MCP サーバー（GitHub・Supabase・ブラウザ操作・ドキュメント検索）を、目的・提供元・必要な権限・リスクの表にして提案して。追加するコマンド（claude mcp add など）も教えて。' },
    ], null, true),
    { title:'ツールごとの「約束事ファイル」', note:'AIコーディングツールは、プロジェクトのルールをファイルから読み込みます。複数のツールを使うなら、<code>AGENTS.md</code>（複数のツールが読む共通形式）にまとめて、他から参照する方法もあります。',
      table:{ head:['ツール', 'ルールを書く場所', 'メモ'], rows:[
        ['Claude Code', '<code>CLAUDE.md</code>（ルートやサブフォルダ）、<code>.claude/</code>（設定・スキル・エージェント）', '<code>/init</code> で雛形を作れる'],
        ['Cursor', '<code>.cursor/rules/</code>', 'ファイルの種類ごとにルールを分けられる'],
        ['OpenAI Codex など', '<code>AGENTS.md</code>', 'ほかのツールも対応が広がっている共通形式'],
        ['GitHub Copilot', '<code>.github/copilot-instructions.md</code>', 'リポジトリ全体への指示'],
        ['Gemini CLI', '<code>GEMINI.md</code>', ''],
      ]}},
    S('AIエージェントの基本操作と知識（Claude Code の例）', [
      T('プロジェクトで起動する', 'claude', 'プロジェクトのフォルダで <code>claude</code> と打つと起動。そのフォルダのファイルを読み書きできる。デスクトップアプリ・VS Code・JetBrains の拡張からも使える。'),
      T('雛形を作る（/init）', '/init', 'リポジトリを調べて CLAUDE.md を作ってくれる。作ったあとは自分で短く整える。'),
      T('会話を整理する（/clear・/compact）', '/clear /compact', '<code>/clear</code>＝新しい会話にする。<code>/compact</code>＝これまでの会話を要約して空きを作る。タスクが変わったら /clear が基本。'),
      T('前の会話に戻る', 'claude --continue / --resume', '直前の会話の続きから、または一覧から選んで再開できる。'),
      T('巻き戻す', 'Checkpoints / rewind', 'AIの変更前の状態に戻せるチェックポイント機能。Gitのコミットと併用すると確実。'),
      T('ファイルを指定する（@）', '@ mentions', '<code>@src/app/page.tsx</code> のようにファイルを指定して読ませる。必要なファイルだけを渡すとコンテキストの節約になる。'),
      T('モードの切り替え', 'Shift + Tab', '標準・編集の自動許可・プランモードなどを切り替える（ツール・バージョンで異なる）。'),
      T('画像を渡す', 'Images', 'スクリーンショットやラフを貼り付けて「この見た目に」「ここがずれている」と伝えられる。'),
      T('非対話で実行する', 'claude -p', '<code>claude -p "質問"</code> で1回だけ実行して結果を出力。スクリプトやCI（GitHub Actions）から使える。'),
      T('並行して作業させる', 'Worktrees / parallel sessions', 'Gitのワークツリーで別フォルダ・別ブランチを用意し、複数のAIに別々のタスクを任せる。同じファイルを同時に触らせない。'),
      T('サブエージェント', 'Subagents', '調査やレビューを別のAIに任せ、結果だけを受け取る。メインの会話のコンテキストを節約できる。'),
      T('スキル', 'Skills', '手順書（SKILL.md）とスクリプトをまとめたもの。説明文を見て、必要なときにAIが自分で読み込む。'),
      T('フック', 'Hooks', 'ツールの実行前後などに自動でスクリプトを動かす。整形・テスト・危険な操作のブロックに。'),
      T('モデルと考える深さ', 'Model / effort', '重い設計や難しいバグには高性能なモデルと深い思考、単純な作業には速いモデル。使い分けで速さと費用が変わる。'),
      T('GitHub との連携', 'GitHub integration', 'Issue やプルリクエストのコメントで AI に作業を頼み、PRを作らせる仕組みもある（GitHub Actions 連携）。'),
      T('安全に使うために', 'Safety', '.env など秘密のファイルを読ませない設定、危険なコマンドの禁止、本番環境の認証情報を渡さない、出所の分からないMCPやスキルを入れない。（セキュリティ辞典参照）', null, ['注意']),
    ]),
  ]});

/* ================= 7. 確認・テスト・レビュー ================= */
const PYR = [['E2E', '#dc2626', 'E2E（端から端まで）', '本物のブラウザで、利用者と同じ操作をして確かめる（Playwright）。一番安心できるが、遅くて壊れやすい。<b>大事な流れ（登録・購入）だけ</b>に。', 'Playwright で「会員登録 → ログイン → 投稿 → ログアウト」の流れのE2Eテストを書いて。'], ['結合', '#d97706', '結合テスト', '複数の部品（API＋DB、画面＋API）を組み合わせて確かめる。APIのテスト、フォームの送信など。', 'POST /api/posts の結合テストを書いて。未ログインは401、入力エラーは400、成功時はDBに保存されること。'], ['単体', '#16a34a', '単体テスト', '関数1つ・部品1つを確かめる（Vitest・Jest）。速く、たくさん書ける。<b>計算・変換・判定のロジック</b>に最適。', 'lib/price.ts の税込計算と端数処理の関数に、境界値（0円・1円・端数・大きな金額）を含む単体テストを Vitest で書いて。'], ['静的チェック', '#2563eb', '型チェック・リンター', 'コードを動かさずに間違いを見つける（TypeScript・ESLint）。<b>一番安くて速い</b>。AIのミス（存在しないプロパティなど）を大量に捕まえる。', '型チェック（tsc --noEmit）とリンターをCIで毎回実行するように設定して、今出ているエラーを全部直して。']];

TABS.push({ id:'quality', label:'確認・テスト・レビュー', icon:'✅',
  intro:'AIは「できました」と言いますが、<b>本当に動くかを確かめるのは人と仕組みの仕事</b>です。テストの種類、手で確認すべき項目、バグ報告の書き方、レビューの観点をまとめました。チェックリストはこのブラウザに保存されます。 テストの書き方を触って学ぶなら <a href="testing.html">テスト・品質辞典</a> へ。',
  sections:[
    C('触って理解する', [
      { name:'テストの種類（ピラミッド）', en:'Testing pyramid', h:380, tags:['体験','基本'],
        demo:'<div class="kt"><div class="wf-pyr py"></div><div class="kt-verdict res kt-grow"></div></div>',
        init:(el) => { const W = [38, 58, 78, 98]; $(el, '.py').innerHTML = PYR.map(([n, c], i) => `<button type="button" data-i="${i}" style="width:${W[i]}%;background:${c}">${n}</button>`).join('');
          const pick = (i) => { $$(el, '.py button').forEach((b, j) => b.classList.toggle('on', i === j)); const p = PYR[i]; $(el, '.res').innerHTML = `<b>${p[2]}</b>：${p[3]}<br><span style="color:var(--muted)">AIへの指示例：</span>${p[4]}`; };
          $$(el, '.py button').forEach(b => b.onclick = () => pick(+b.dataset.i)); pick(2); },
        desc:'下ほど<b>速くて安く、たくさん書く</b>、上ほど<b>本物に近いが遅い</b>。バイブコーディングでは、まず<b>型チェックとリンター</b>（一番下）を必ず通し、計算などのロジックに単体テスト、大事な流れにE2Eを数本、が現実的なバランスです。テストはAIに書かせるのが得意分野です。',
        prompt:'このプロジェクトにテストの仕組みがなければ、Vitest（単体）と Playwright（E2E）を導入して、package.json に test と test:e2e のコマンドを追加して。まずは一番大事な処理から3つテストを書いて。' },
      { name:'バグ報告をつくる', en:'Bug report builder', h:500, wide:true, tags:['体験','テンプレ'],
        demo:'<div class="kt"><div class="kt-row kt-split" style="align-items:stretch;flex-wrap:nowrap;gap:10px;flex:1;min-height:0"><div class="wf-form fm" style="flex:1;align-content:start;overflow:auto"></div><div class="out" style="flex:1;display:flex;flex-direction:column;gap:4px;min-height:0"></div></div></div>',
        init:(el) => { const F = [['what', '何が起きた', '投稿の保存ボタンを押すと、画面が真っ白になる'], ['steps', '再現手順', '1. ログイン\n2. 新規投稿を開く\n3. 画像を2枚選ぶ\n4. 保存を押す'], ['expect', '期待した動き', '投稿が保存され、詳細画面に移動する'], ['actual', '実際の動き', '真っ白。Console に TypeError: Cannot read properties of undefined (reading \'url\')'], ['env', '環境', 'iPhone 15 / Safari 18、PCのChromeでは起きない'], ['when', 'いつから', '昨日の「画像を複数枚にする」変更から'], ['tried', '試したこと', '画像1枚なら成功する']];
          $(el, '.fm').innerHTML = F.map(([k, l, v]) => `<b>${l}</b><textarea class="kt-in" rows="${k === 'steps' ? 4 : 2}" data-k="${k}" aria-label="${l}">${esc(v)}</textarea>`).join('');
          const run = () => { const v = {}; $$(el, '.fm textarea').forEach(t => v[t.dataset.k] = t.value.trim()); docOut($(el, '.out'), `## 何が起きた\n${v.what}\n## 再現手順\n${v.steps}\n## 期待した動き\n${v.expect}\n## 実際の動き\n${v.actual}\n## 環境\n${v.env}\n## いつから\n${v.when}\n## 試したこと\n${v.tried}\n## お願い\nまず原因を調べて、仮説と根拠を説明してください。直す前に、この現象を再現するテストを書いてください。`, 'バグ報告（Issue・AIにそのまま渡せる）'); };
          $$(el, '.fm textarea').forEach(t => t.oninput = run); run(); },
        desc:'良いバグ報告は、<b>再現手順・期待・実際・環境</b>の4点がそろったもの。「いつから」「試したこと」があると原因がすぐ絞れます。AIに渡すときは「<b>直す前に、再現するテストを書いて</b>」と添えると、同じバグの再発も防げます。',
        prompt:'このバグを直してください。直す前に、①原因の仮説と根拠を説明 ②現象を再現するテストを書いて失敗することを確認 ③修正 ④テストが通ることを確認、の順で進めて。（バグ報告を貼る）' },
      { name:'レビューの観点', en:'Code review checklist', h:400, tags:['体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="sc-res kt-grow ls" style="display:flex;flex-direction:column;gap:3px;overflow:auto;min-height:0"></div></div>',
        init:(el) => { const V = [['正しさ', ['受け入れ条件をすべて満たしている', 'エッジケース（空・長い・重複）を扱っている', 'エラー時の動きが決まっている', '既存の機能を壊していない（テストが通る）']], ['安全', ['ログインと権限の確認がサーバー側にある', '秘密情報がコードやログに出ていない', '入力を検証している', '新しい依存パッケージは信頼できる']], ['読みやすさ', ['名前から役割が分かる', '1つの関数が長すぎない', '同じ処理が何度も書かれていない', '不要なコード・デバッグ用のログが残っていない']], ['性能・保守', ['ループの中でDBやAPIを呼んでいない', '大きなデータを一度に読み込んでいない', '型が any だらけになっていない', '後で読む人のためのコメント・ドキュメントがある']]];
          $(el, '.sw').replaceWith(seg(V.map(v => v[0]), i => { $(el, '.ls').innerHTML = V[i][1].map(t => `<label style="display:flex;gap:8px;align-items:center;font-size:12px;padding:5px 9px;border-radius:7px;background:var(--surface);border:1px solid var(--border);cursor:pointer"><input type="checkbox">${t}</label>`).join(''); }).el); },
        desc:'コードを全部読めなくても、<b>観点を決めて確認する</b>ことはできます。正しさ・安全・読みやすさ・性能の4つ。AIにレビューを頼むときも、観点を指定すると具体的な指摘が返ってきます。',
        prompt:'今回の変更を、正しさ（受け入れ条件・エッジケース・既存機能）・安全（認証認可・秘密情報・入力検証）・読みやすさ・性能（N+1・大量データ）の観点でレビューして。指摘は重要度順に、該当箇所と修正案を添えて。' },
    ], null, true),
    { title:'公開前に手で確かめること', layout:'rows', items:[
      { name:'うまくいく流れを最初から最後まで', en:'Happy path', desc:'新規登録 → 主な機能 → ログアウトまで、利用者になりきって通す。', check:true },
      { name:'空・エラー・大量の状態', en:'Empty / error / overflow states', desc:'データ0件、通信エラー（開発者ツールでオフライン）、長い文字・大量データで崩れないか。', check:true },
      { name:'スマホの実機', en:'Real device', desc:'PCの画面幅を狭めるだけでなく、実際のスマホで。キーボードが出たときに入力欄が隠れないか。', check:true },
      { name:'戻る・再読み込み・2つのタブ', en:'Back / reload / tabs', desc:'ブラウザの戻るボタン、途中での再読み込み、同じ画面を2つのタブで開いて操作。', check:true },
      { name:'ログインしていない・権限がない', en:'Logged out / forbidden', desc:'ログアウト状態でURLを直接開く、他人のIDに書き換えて開く（セキュリティ辞典参照）。', check:true },
      { name:'遅い回線', en:'Slow network', desc:'開発者ツールの通信制限（Slow 4G）で、読み込み中の表示と二重送信の防止を確認。', check:true },
      { name:'キーボードだけで操作', en:'Keyboard only', desc:'Tabキーで移動・Enterで決定ができるか。フォーカスが見えるか。', check:true },
      { name:'本番ビルドで確認', en:'Production build', desc:'<code>npm run build</code> が通り、本番モードでも同じように動くか。', check:true },
    ]},
    S('テストと品質の用語', [
      T('単体テスト', 'Unit test', '関数・部品1つを確かめる。Vitest・Jest。速いのでたくさん書ける。'),
      T('結合テスト', 'Integration test', '複数の部品の組み合わせを確かめる。APIとDBなど。'),
      T('E2Eテスト', 'End-to-end test', '本物のブラウザで、利用者と同じ操作を自動で行う。Playwright・Cypress。'),
      T('テストを先に書く（TDD）', 'Test-driven development', '失敗するテストを先に書いてから実装する。AIとの相性がよく「このテストが通るように実装して」と頼める。', 'この機能は TDD で進めて。まず受け入れ条件をテストにして、失敗することを確認してから実装して、全部通ったら報告して。', ['おすすめ']),
      T('モック', 'Mock', 'テストのときに、外部API・決済・メール送信などを偽物に置き換える。本物を呼ばずに済む。'),
      T('スナップショットテスト', 'Snapshot test', '出力（画面の構造・JSON）を保存しておき、変わったら知らせる。意図した変更なら更新する。'),
      T('型チェック', 'Type check', 'TypeScript の <code>tsc --noEmit</code>。動かさずに型の間違いを見つける。AIのミスを最も安く捕まえる。', null, ['最優先']),
      T('リンター・フォーマッター', 'ESLint / Prettier / Biome', '怪しい書き方の指摘と、見た目の自動整形。'),
      T('CI', 'Continuous Integration', 'pushやPRのたびに、テスト・型チェック・リンターを自動で実行する（GitHub Actions）。（Git辞典参照）'),
      T('回帰テスト', 'Regression test', '前に直したバグが再発していないか確かめるテスト。バグを直すたびに1つ足すと、品質が積み上がる。'),
      T('カバレッジ', 'Coverage', 'テストで実行されたコードの割合。100%を目指すより、大事な部分が守られているかを見る。'),
      T('AIにレビューさせる', 'AI code review', '別の会話や別のAIにレビューさせると、書いたAIとは違う視点の指摘が出やすい。プルリクエストに自動でAIレビューを付ける仕組みもある。'),
      T('本番での見張り', 'Monitoring', 'エラー監視（Sentry）・アクセス解析・ログ。テストで見つからないバグは本番で見つかる。'),
      T('利用者の声を集める', 'Feedback', 'フィードバック用のフォームやボタンを置く。小さな不満が改善のヒント。'),
    ]),
  ]});

/* ================= 8. テンプレート集 ================= */
TABS.push({ id:'templates', label:'テンプレート集', icon:'📋',
  intro:'企画から公開後まで、そのまま使える<b>Markdownのテンプレート</b>です。コードの欄を開いてコピーし、<code>docs/</code> フォルダや GitHub の Issue に貼って使ってください。「AIへの指示例」は、テンプレートを埋めてもらうときの依頼文です。',
  sections:[
    S('企画・要件', [
      TP('1枚企画書', 'Product brief', '最初に作る。迷ったら立ち返る1枚。', '# 〇〇（アプリ名）\n\n## 誰のため\n\n## 困りごと\n\n## 今はどうしている\n\n## 解決のアイデア\n\n## 最初に作る1つの機能\n\n## 成功の目安（数字）\n\n## 今回やらないこと\n', 'このアイデアを1枚企画書のテンプレートに沿って埋めて。分からない項目は空欄のまま、質問を添えて：（アイデア）', ['最初に']),
      TP('PRD（要件定義書）', 'PRD', '作るものの全体像。個人開発なら1〜2ページ。', '# PRD：〇〇\n\n## 1. 概要\n## 2. 目的と成功の目安\n## 3. 利用者（ペルソナ）\n## 4. 機能要件（MVP）\n- [ ] \n## 5. 非機能要件\n- 対応端末：\n- 表示速度：\n- セキュリティ：\n## 6. 画面一覧\n## 7. データ（主なテーブル）\n## 8. スコープ外\n## 9. 未決事項\n', 'これまでの会話をもとに、PRDのテンプレートを埋めて docs/prd.md に保存して。未決事項は推測で埋めずに一覧に。'),
      TP('ユーザーストーリー（Issue）', 'User story issue', '1機能＝1Issue。受け入れ条件がそのままテストになる。', '## ユーザーストーリー\n〇〇として、〇〇したい。なぜなら〇〇だから。\n\n## 受け入れ条件\n- [ ] 前提：／操作：／結果：\n- [ ] 前提：／操作：／結果：\n\n## 画面・デザイン\n（スクリーンショット・ラフ）\n\n## メモ\n', 'この機能のユーザーストーリーと受け入れ条件（正常・入力エラー・0件・権限なし）を、Issueのテンプレートで書いて。'),
      TP('画面一覧', 'Screen list', 'ルーティングと権限の設計に。', '| 画面 | URL | ログイン | 主な要素 | 主な操作 |\n|---|---|---|---|---|\n| トップ | / | 不要 | | |\n| 一覧 | /items | 必要 | | |\n| 詳細 | /items/[id] | 必要 | | |\n', 'このアプリの画面一覧を表にして。URL・ログインの要否・主な要素・主な操作を入れて。'),
    ]),
    S('AIへの依頼', [
      TP('新機能の依頼', 'Feature request prompt', '6つの要素＋計画を先に。', '## 目的\n\n## 背景\n\n## やること\n\n## 制約\n- 新しいパッケージは追加しない（必要なら相談）\n- \n\n## 完了条件\n- [ ] \n\n## 確認方法\n- npm test と npm run typecheck が通る\n\n## 進め方\n実装の前に、変更するファイルと手順の計画を見せてください。', null, ['よく使う']),
      TP('バグ修正の依頼', 'Bug fix prompt', '直す前に原因とテスト。', '## 何が起きた\n\n## 再現手順\n1. \n\n## 期待した動き\n\n## 実際の動き（エラー全文）\n```\n\n```\n\n## 環境\n\n## 試したこと\n\n## お願い\n直す前に原因の仮説を説明し、再現するテストを書いてから修正してください。'),
      TP('リファクタリングの依頼', 'Refactor prompt', '動作を変えずに作り直す。', '## 対象\n\n## 目的（読みやすく・重複をなくす など）\n\n## 守ること\n- 動作を変えない\n- 既存のテストがすべて通る\n- 公開している関数の名前・引数は変えない\n\n## 進め方\n小さなステップに分けて、ステップごとにテストを実行してください。'),
      TP('調査だけの依頼', 'Investigation prompt', '原因が分からないとき。直させない。', '## 調べてほしいこと\n\n## 分かっていること\n\n## まだ直さないでください\n原因の仮説を可能性の高い順に3つ、それぞれの根拠と確かめ方を教えてください。'),
      TP('引き継ぎメモ（新しい会話へ）', 'Session handoff', '長い会話を区切るとき。', '## これまでにやったこと\n\n## 決めたこと\n\n## 変更したファイル\n\n## 残っている課題\n\n## 次にやること\n', '新しい会話に引き継ぐために、このテンプレートでここまでの内容をまとめて。'),
    ]),
    S('記録・振り返り', [
      TP('設計の決定記録（ADR）', 'Architecture Decision Record', '「なぜそうしたか」を残す。半年後の自分とAIのために。', '# ADR-001：〇〇を採用する\n\n## 日付\n\n## 状況（何を決める必要があったか）\n\n## 決定\n\n## 理由\n\n## 検討した他の案\n\n## 影響（良い点・悪い点）\n', 'いま決めた「〇〇」について、ADRのテンプレートで docs/decisions/ に記録して。検討した他の案も書いて。'),
      TP('作業ログ', 'Work log', '1日の終わりに3行でも。', '## 2026-10-27\n- やったこと：\n- 詰まったこと／解決方法：\n- 次にやること：\n'),
      TP('リリースノート', 'Release notes', '利用者向けの変更のお知らせ。', '# v1.2.0（2026-11-01）\n\n## 新機能\n- \n\n## 改善\n- \n\n## 修正\n- \n', '前回のリリースからのコミット履歴をもとに、利用者向けのリリースノートを、専門用語を使わずに書いて。'),
      TP('振り返り（KPT）', 'Keep / Problem / Try', '区切りごとに。続けること・問題・次に試すこと。', '## Keep（よかった・続けたい）\n- \n\n## Problem（困った・問題）\n- \n\n## Try（次に試すこと）\n- \n'),
      TP('CLAUDE.md の雛形', 'CLAUDE.md template', 'AIエージェント向けのプロジェクトの約束事。', '# CLAUDE.md\n\n## このプロジェクト\n\n## 技術（バージョン）\n\n## よく使うコマンド\n- 開発：\n- テスト：\n- 型チェック：\n\n## フォルダ構成\n\n## 書き方のルール\n- \n\n## やってはいけないこと\n- .env を読まない・書かない\n- 依存の追加は事前に確認\n\n## 完了の条件\n- 型チェック・テストが通る\n- 変更の要約を報告する\n', null, ['おすすめ']),
    ]),
  ]});
})();
