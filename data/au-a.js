/* 自動化・Bot辞典 — A: 共通ヘルパー / 自動化の基本 / Google Apps Script / ノーコード自動化 / Webhook・API連携 */
(function(){
const { $, $$, esc, tbl, seg, seq } = KIT;
const S = (title, items, note) => ({ title, note, layout:'rows', items });
const C = (title, items, note, lg) => ({ title, note, layout:lg ? 'cards lg' : 'cards', items });
const T = (name, en, desc, prompt, tags, more) => Object.assign({ name, en, desc, prompt, tags }, more || {});
const verdict = (el, cls, html) => { el.classList.remove('ok', 'bad', 'warn'); if (cls) el.classList.add(cls); el.innerHTML = html; };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const rng = (s) => () => (s = (s * 16807) % 2147483647) / 2147483647;
const log = (box, cls, text) => { box.insertAdjacentHTML('beforeend', `<div class="${cls}">${text}</div>`); box.scrollTop = 1e6; };
const form = (box, defs, on) => { const st = {}; box.classList.add('au-form'); box.innerHTML = defs.map(([k, l, v, type]) => (st[k] = v, `<span>${l}</span><input class="kt-in" type="${type || 'number'}" data-k="${k}" value="${esc(v)}" aria-label="${l}">`)).join(''); $$(box, 'input').forEach(i => i.oninput = () => { st[i.dataset.k] = i.type === 'number' ? +i.value : i.value; on(st); }); on(st); return st; };
window.AUH = { S, C, T, verdict, sleep, rng, log, form };

/* ================= 1. 自動化の基本 ================= */
const TRIG = [['フォーム送信', '📝', 'フォームに回答が届いたら'], ['毎朝9時', '⏰', '毎朝9時になったら'], ['メール受信', '✉', '件名に「請求書」を含むメールが届いたら'], ['Webhook', '🔗', '決済サービスから「支払い完了」の通知が届いたら'], ['ボタン', '👆', 'スマホのボタンを押したら']];
const ACT = [['シートに追記', '📊', 'スプレッドシートに1行追加して'], ['Slackに通知', '💬', 'Slack の #通知 チャンネルに知らせて'], ['メール送信', '📧', '相手にお礼のメールを送って'], ['AIで要約', '✨', 'AIで内容を3行に要約して'], ['LINEに送る', '🟩', 'LINE に通知して'], ['カレンダー登録', '📅', 'Googleカレンダーに予定を入れて']];
const TOOL = (t, acts) => t === 1 || t === 0 ? 'Google Apps Script（無料・Googleのサービス同士なら一番手軽）' : t === 3 ? 'n8n / Make / Zapier、または自分のサーバー（署名の確認が必要）' : acts.includes(3) ? 'n8n / Make（AIのノードがある）または GAS ＋ AIのAPI' : 'Zapier / Make / Power Automate（ノーコード）';
const MEANS = [['ノーコード（Zapier・Make・n8n）', '画面でつなぐ', '★☆☆', 'サービス同士の連携。数分で作れる。回数で料金がかかる'], ['Google Apps Script', 'JavaScriptを少し書く', '★★☆', 'Googleのサービス（シート・Gmail・カレンダー）。無料'], ['自分のプログラム（Node.js・Python）', 'コードを書いてサーバーで動かす', '★★★', '複雑な処理・大量データ・独自のルール'], ['RPA（Power Automate Desktop など）', '画面の操作を記録して再生', '★★☆', 'APIがない古いシステム・社内ツール'], ['AIエージェント', 'やりたいことを文章で伝える', '★★☆', '毎回少しずつ違う作業。判断が要る作業（確認を挟む）']];

TABS.push({ id:'basics', label:'自動化の基本', icon:'⚙',
  intro:'自動化は<b>「いつ（トリガー）」→「何をする（アクション）」</b>の組み合わせです。「フォームが送られたら → シートに追記して → Slackに知らせる」のように、くり返しの作業を仕組みに任せます。作る前に<b>元が取れるか</b>、作った後に<b>失敗したら気づけるか</b>も考えましょう。',
  sections:[
    C('触って理解する', [
      { name:'トリガーとアクションを組み合わせる', en:'Trigger → Actions', h:500, tags:['基本','体験','最重要'],
        demo:'<div class="kt"><div class="kt-lbl">① いつ（トリガー）</div><span class="sw"></span><div class="kt-lbl">② 何をする（アクション・順番に実行）</div><div class="kt-row ac"></div><div class="au-flow fl kt-grow" style="align-content:center"></div><div class="kt-row"><button type="button" class="kt-btn pri go">▶ 動かしてみる</button></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let t = 0, acts = [0, 1], busy = 0;
          const draw = () => { $(el, '.ac').innerHTML = ACT.map((a, i) => `<button type="button" class="kt-btn sm${acts.includes(i) ? ' pri' : ''}" data-i="${i}">${a[1]} ${a[0]}</button>`).join('');
            $$(el, '.ac button').forEach(b => b.onclick = () => { const i = +b.dataset.i; acts = acts.includes(i) ? acts.filter(x => x !== i) : acts.length < 4 ? [...acts, i] : acts; draw(); });
            $(el, '.fl').innerHTML = `<div class="au-node trig"><i>${TRIG[t][1]}</i>${TRIG[t][0]}<small>トリガー</small></div>` + acts.map(i => `<span class="au-arr">→</span><div class="au-node"><i>${ACT[i][1]}</i>${ACT[i][0]}</div>`).join('');
            const sentence = `${TRIG[t][2]}、${acts.map(i => ACT[i][2]).join('、それから')}${acts.length ? '' : '（アクションを選んでください）'}。`;
            verdict($(el, '.res'), '', `<b>AIへの頼み方：</b>「${sentence}」<br><b>向いている道具：</b>${TOOL(t, acts)}`); };
          $(el, '.sw').replaceWith(seg(TRIG.map(x => x[1] + ' ' + x[0]), i => { t = i; draw(); }).el);
          $(el, '.go').onclick = async () => { const run = ++busy, ns = $$(el, '.fl .au-node'); ns.forEach(n => n.classList.remove('on', 'ok')); for (const n of ns){ if (run !== busy || !el.isConnected) return; n.classList.add('on'); await sleep(550); n.classList.remove('on'); n.classList.add('ok'); } }; },
        desc:'自動化は<b>トリガー（きっかけ）</b>と<b>アクション（やること）</b>の組み合わせで考えます。きっかけは「時間」「何かが届いた」「ボタン」のどれか。アクションは上から順に実行されます。この形で文章にすると、そのまま<b>AIへの頼み方</b>になります。',
        prompt:'Googleフォームに問い合わせが届いたら、①スプレッドシートに1行追加、②AIで内容を3行に要約、③要約を Slack の #問い合わせ に通知、する自動化を Google Apps Script で作って。Slack の Webhook URL はスクリプトプロパティに保存して。' },
      { name:'自動化すると元が取れる？', en:'Time-saved calculator', h:430, tags:['判断','体験'],
        demo:'<div class="kt"><div class="fm"></div><div class="au-big bg"></div><svg class="ch" style="flex:1;min-height:0;width:100%" aria-hidden="true"></svg><div class="kt-verdict res"></div></div>',
        init:(el) => { form($(el, '.fm'), [['min', '1回の作業（分）', 10], ['per', '1週間の回数', 15], ['build', '作るのにかかる時間（時間）', 4], ['keep', '直す・見守る（分/月）', 30]], (st) => {
            const wk = st.min * st.per / 60, mk = st.keep / 60 / 4.33, net = wk - mk, pay = net > 0 ? st.build / net : Infinity, year = Math.max(0, net * 52 - st.build);
            $(el, '.bg').innerHTML = `<div><small>手作業：1年で</small><b>${Math.round(wk * 52)}時間</b></div><div><small>元が取れるまで</small><b>${isFinite(pay) ? (pay < 1 ? '1週間以内' : Math.ceil(pay) + '週間') : '取れない'}</b></div><div><small>1年で浮く時間</small><b>${Math.round(year)}時間</b></div>`;
            const svg = $(el, '.ch'), W = svg.clientWidth || 300, H = svg.clientHeight || 90, wks = 26, mx = Math.max(wk * wks, st.build + mk * wks, 1), x = (w) => 6 + w / wks * (W - 12), y = (v) => H - 14 - v / mx * (H - 22);
            svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.innerHTML = `<path d="M${x(0)},${y(0)}L${x(wks)},${y(wk * wks)}" style="stroke:var(--bad);stroke-width:2;fill:none"/><path d="M${x(0)},${y(st.build)}L${x(wks)},${y(st.build + mk * wks)}" style="stroke:var(--ok);stroke-width:2;fill:none"/><text x="${x(wks) - 4}" y="${y(wk * wks) - 4}" text-anchor="end" style="font-size:10.5px;fill:var(--bad);font-weight:700">手作業の合計時間</text><text x="${x(wks) - 4}" y="${y(st.build + mk * wks) + 13}" text-anchor="end" style="font-size:10.5px;fill:var(--ok);font-weight:700">自動化（作る＋見守る）</text><text x="6" y="${H - 2}" style="font-size:10px;fill:var(--faint)">0週</text><text x="${W - 6}" y="${H - 2}" text-anchor="end" style="font-size:10px;fill:var(--faint)">26週</text>`;
            verdict($(el, '.res'), pay <= 8 ? 'ok' : pay < 52 ? 'warn' : 'bad', pay <= 8 ? '✓ すぐに元が取れます。<b>自動化しましょう</b>。' : pay < 52 ? '△ 元は取れますが時間がかかります。ミスが減る・気が楽になる効果も含めて判断を。' : '❌ 時間だけで見ると割に合いません。<b>回数が少ない作業は手作業のまま</b>の方が良いことも。'); }); },
        desc:'自動化は作る時間と、壊れたときに直す時間がかかります。<b>「1回の時間 × 回数」が「作る時間＋見守る時間」を上回るか</b>で判断しましょう。時間以外にも、<b>ミスがなくなる・忘れない・夜中でも動く</b>のが自動化の大きな価値です。',
        prompt:'毎週やっている作業（売上CSVをダウンロード → 集計 → 上司にメール）を自動化する価値があるか判断したい。1回20分・週1回です。作る手間と、壊れたときのリスクも含めて、自動化するならどの方法がいいか提案して。' },
      { name:'失敗したら気づけるか', en:'Retries & alerts', h:460, tags:['運用','体験','最重要'],
        demo:'<div class="kt"><div class="kt-row ck" style="font-size:11.5px;gap:12px"><label><input type="checkbox" class="rt">失敗したら3回まで再試行</label><label><input type="checkbox" class="nt">失敗をSlackに通知</label></div><div class="kt-row"><button type="button" class="kt-btn pri go">▶ 12日分を実行</button></div><div class="au-log lg kt-grow"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let run = 0;
          $(el, '.go').onclick = async () => { const me = ++run, lg = $(el, '.lg'), rt = $(el, '.rt').checked, nt = $(el, '.nt').checked, r = rng(7); lg.innerHTML = ''; let ok = 0, fail = 0, silent = 0;
            for (let d = 1; d <= 12; d++){ if (me !== run || !el.isConnected) return; let done = false, tries = rt ? 3 : 1;
              for (let k = 1; k <= tries; k++){ const f = r() < .3; if (!f){ log(lg, 'ok', `${d}日目 ${k > 1 ? `（${k}回目）` : ''}✓ 成功`); done = true; break; } log(lg, k < tries ? 'warn' : 'bad', `${d}日目 ${k > 1 ? `（${k}回目）` : ''}× 失敗：相手のサーバーが一時的に応答なし`); await sleep(60); }
              if (done) ok++; else { fail++; if (nt) log(lg, 'warn', '　→ 💬 Slackに「失敗しました」と通知'); else { silent++; log(lg, 'dim', '　→ （誰も気づかない…）'); } }
              await sleep(140); }
            verdict($(el, '.res'), silent ? 'bad' : fail ? 'warn' : 'ok', `成功 <b>${ok}</b>回 ／ 最終的に失敗 <b>${fail}</b>回` + (silent ? `<br>❌ そのうち <b>${silent}回は誰も気づいていません</b>。数日後に「データが入っていない！」と発覚するパターンです。` : fail ? '<br>△ 失敗はしたが、通知で気づけるので対応できます。' : '<br>✓ 一時的な失敗は、再試行でほとんど解決します。')); }; },
        desc:'自動化は<b>いつか必ず失敗します</b>（相手のサーバーの不調・パスワード変更・入力の形の変化）。一時的な失敗は<b>再試行</b>で、直らない失敗は<b>通知</b>で気づけるようにしておかないと、何日も止まったまま誰も気づきません。「静かに失敗する自動化」は手作業より危険です。',
        prompt:'このGASの自動化に、失敗したときの仕組みを入れて。一時的なエラーは間隔をあけて3回まで再試行、それでも失敗したら Slack とメールにエラー内容と時刻を通知、実行結果はシートの「ログ」タブに1行ずつ残すようにして。' },
    ], null, true),
    { title:'自動化の手段の比較', note:'迷ったら、<b>Googleのサービス同士 → GAS</b>、<b>いろいろなサービスをつなぐ → ノーコード（n8n・Make・Zapier）</b>、<b>複雑・大量 → 自分のプログラム</b>。',
      table:{ head:['手段', 'やり方', '難しさ', '向いている'], rows:MEANS } },
    S('自動化の基本用語', [
      T('トリガー', 'Trigger', '自動化が動き出すきっかけ。時間・何かが届いた・データが変わった・ボタン。', null, ['基本']),
      T('アクション', 'Action', 'トリガーの後に行う作業。追記・通知・送信・変換など。'),
      T('ワークフロー', 'Workflow', 'トリガーとアクションをつないだ一連の流れ。'),
      T('スケジュール実行', 'Scheduled job', '決まった時間に動かす。「毎朝9時」「15分ごと」。（「定期実行」タブ）'),
      T('イベント駆動', 'Event-driven', '何かが起きた瞬間に動く。Webhook・フォーム送信など。'),
      T('API', 'API', 'サービスをプログラムから操作する窓口。自動化はAPIを呼ぶことで成り立つ。'),
      T('Webhook', 'Webhook', '何かが起きたら、相手から自分のURLへ知らせてくれる仕組み。（「Webhook」タブ）'),
      T('認証情報（トークン・APIキー）', 'Credentials', '自動化がサービスを操作するための鍵。<b>コードに直接書かず</b>、設定（環境変数・スクリプトプロパティ）に保存する。', null, ['注意']),
      T('再試行（リトライ）', 'Retry', '一時的な失敗のときにもう一度試す。間隔を少しずつ空ける（バックオフ）。'),
      T('冪等性（べきとうせい）', 'Idempotency', '同じ処理を2回実行しても結果が同じになること。再試行・再送で二重登録しないために重要。', null, ['最重要']),
      T('ログ', 'Logs', 'いつ・何が・どうなったかの記録。失敗の原因を調べるのに必要。'),
      T('通知・アラート', 'Alerts', '失敗や異常を人に知らせる。Slack・メール・LINE。'),
      T('レート制限', 'Rate limit', 'APIを短時間に呼びすぎると断られる上限。間隔を空ける・まとめて送る。'),
      T('バッチ処理', 'Batch', 'まとめて一気に処理すること。1件ずつより速いが、途中で失敗したときの扱いに注意。'),
      T('キュー', 'Queue', 'やることを順番待ちの列に入れて、少しずつ処理する仕組み。大量・重い処理に。'),
      T('サービスアカウント・Bot用アカウント', 'Service account', '個人のアカウントではなく、自動化専用のアカウントで動かす。退職・異動で止まらないように。'),
    ]),
  ]});

/* ================= 2. Google Apps Script ================= */
const SHEET0 = [['佐藤', 'sato@example.com', '2026-10-20', 12000, '未払い'], ['', '', '', '', ''], ['鈴木', 'suzuki@example.com', '2026-11-05', 8000, '未払い'], ['高橋', 'takahashi@example.com', '2026-10-25', 15000, '支払い済み'], ['', '', '', '', ''], ['田中', 'tanaka@example.com', '2026-10-15', 6000, '未払い'], ['伊藤', 'ito@example.com', '2026-11-12', 9500, '未払い']];
const TODAY = '2026-10-27';
const GSCR = [
  ['空の行を削除', 'function deleteEmptyRows() {\n  const sheet = SpreadsheetApp.getActiveSheet();\n  const values = sheet.getDataRange().getValues();\n  // 下から消す（上から消すと行番号がずれる）\n  for (let i = values.length - 1; i >= 1; i--) {\n    if (values[i].join("") === "") sheet.deleteRow(i + 1);\n  }\n}'],
  ['期限切れに色を付ける', 'function markOverdue() {\n  const sheet = SpreadsheetApp.getActiveSheet();\n  const values = sheet.getDataRange().getValues();\n  const today = new Date();\n  values.forEach((row, i) => {\n    if (i === 0) return; // 見出し\n    const [name, mail, due, amount, status] = row;\n    if (status === "未払い" && due && new Date(due) < today) {\n      sheet.getRange(i + 1, 1, 1, row.length).setBackground("#fdd");\n    }\n  });\n}'],
  ['未払いの合計', 'function sumUnpaid() {\n  const values = SpreadsheetApp.getActiveSheet().getDataRange().getValues();\n  const total = values.slice(1)\n    .filter(r => r[4] === "未払い")\n    .reduce((sum, r) => sum + Number(r[3] || 0), 0);\n  SpreadsheetApp.getActiveSheet().appendRow(["合計（未払い）", "", "", total, ""]);\n}'],
  ['催促メールの下書き', 'function draftReminders() {\n  const values = SpreadsheetApp.getActiveSheet().getDataRange().getValues();\n  values.slice(1).forEach(([name, mail, due, amount, status]) => {\n    if (status !== "未払い" || new Date(due) >= new Date()) return;\n    GmailApp.createDraft(mail, "お支払いのお願い",\n      `${name}様\\n${amount}円のお支払い期限（${due}）を過ぎております。…`);\n  });\n  // いきなり送信せず「下書き」にして、人が確認してから送る\n}'],
];
const GTRIG = [['時間主導型', '毎日・毎時・指定日時に実行', 'ScriptApp.newTrigger("dailyReport")\n  .timeBased().everyDays(1).atHour(9).create(); // 毎朝9時台', [9]], ['フォーム送信時', 'フォームに回答が届いたとき', 'function onFormSubmit(e) {\n  const answers = e.namedValues; // { "お名前": ["佐藤"], ... }\n  notifySlack(`新しい問い合わせ：${answers["お名前"][0]}`);\n}', [8.5, 11.2, 14, 16.8, 20.3]], ['編集時', 'シートが編集されたとき', 'function onEdit(e) {\n  if (e.range.getColumn() === 5 && e.value === "完了") {\n    e.range.offset(0, 1).setValue(new Date()); // 完了日を自動で入れる\n  }\n}', [10, 10.3, 13.5, 15, 15.2, 17]], ['開いたとき', 'スプレッドシートを開いたとき', 'function onOpen() {\n  SpreadsheetApp.getUi().createMenu("自動化")\n    .addItem("催促メールを下書き", "draftReminders")\n    .addToUi(); // 独自のメニューを追加\n}', [9.2, 13.1]]];

TABS.push({ id:'gas', label:'Google Apps Script', icon:'📗',
  intro:'<b>Google Apps Script（GAS）</b>は、スプレッドシート・Gmail・カレンダー・フォームなどを<b>JavaScriptで自動化できる無料の仕組み</b>です。サーバーもいらず、スプレッドシートの「拡張機能 → Apps Script」からすぐ書けます。AIにコードを書いてもらい、貼り付けて動かすのが一番の近道です。',
  sections:[
    C('触って理解する', [
      { name:'スプレッドシートを自動で整える', en:'Spreadsheet automation', h:520, tags:['GAS','体験','定番'], wide:true,
        demo:'<div class="kt"><div class="kt-row bts"></div><div class="au-two"><div style="overflow:auto" class="sh"></div><div><div class="kt-code cd" style="flex:1;overflow:auto;white-space:pre"></div></div></div><div class="kt-verdict res">ボタンを押すと、右のコードを実行したときの結果が左の表に反映されます。</div></div>',
        init:(el) => { let rows = SHEET0.map(r => ({ v:[...r], cls:'' })), drafts = [];
          const draw = () => { $(el, '.sh').innerHTML = `<table class="au-sheet"><tr><th class="rn"></th>${['A 名前', 'B メール', 'C 期限', 'D 金額', 'E 状態'].map(h => `<th>${h}</th>`).join('')}</tr>${rows.map((r, i) => `<tr class="${r.cls}"><td class="rn">${i + 2}</td>${r.v.map((c, j) => `<td class="${j === 3 ? 'n' : ''}">${c === '' ? '' : j === 3 && typeof c === 'number' ? c.toLocaleString() : esc(c)}</td>`).join('')}</tr>`).join('')}</table>`; };
          $(el, '.bts').innerHTML = GSCR.map((g, i) => `<button type="button" class="kt-btn sm" data-i="${i}">▶ ${g[0]}</button>`).join('') + '<button type="button" class="kt-btn sm rs">元に戻す</button>';
          $$(el, '.bts [data-i]').forEach(b => b.onclick = async () => { const i = +b.dataset.i; $(el, '.cd').textContent = GSCR[i][1];
            if (i === 0){ rows.forEach(r => { if (r.v.join('') === '') r.cls = 'gone'; }); draw(); await sleep(450); rows = rows.filter(r => r.cls !== 'gone'); draw(); verdict($(el, '.res'), 'ok', '空の行を削除しました。<b>下から順に消す</b>のがコツ（上から消すと行番号がずれて、消し残しが出ます）。'); }
            if (i === 1){ rows.forEach(r => { if (r.v[4] === '未払い' && r.v[2] && r.v[2] < TODAY) r.cls = 'late'; }); draw(); verdict($(el, '.res'), 'warn', `今日（${TODAY}）より期限が前で、未払いの行に色を付けました。`); }
            if (i === 2){ rows = rows.filter(r => r.cls !== 'tot'); const t = rows.filter(r => r.v[4] === '未払い').reduce((a, r) => a + Number(r.v[3] || 0), 0); rows.push({ v:['合計（未払い）', '', '', t, ''], cls:'tot' }); draw(); verdict($(el, '.res'), 'ok', `未払いの合計 <b>${t.toLocaleString()}円</b> を最後の行に追加しました。`); }
            if (i === 3){ drafts = rows.filter(r => r.v[4] === '未払い' && r.v[2] && r.v[2] < TODAY).map(r => `📧 ${r.v[1]}：「${r.v[0]}様 ${Number(r.v[3]).toLocaleString()}円のお支払い期限（${r.v[2]}）を過ぎております…」`); verdict($(el, '.res'), drafts.length ? 'ok' : '', drafts.length ? `<b>${drafts.length}件の下書き</b>を作りました（送信はしていません）。<br>${drafts.map(esc).join('<br>')}` : '対象がありません。'); } });
          $(el, '.rs').onclick = () => { rows = SHEET0.map(r => ({ v:[...r], cls:'' })); draw(); verdict($(el, '.res'), '', '元に戻しました。'); };
          $(el, '.cd').textContent = GSCR[0][1]; draw(); },
        desc:'スプレッドシートの面倒な作業は、GAS の数行のコードで自動化できます。<code>getDataRange().getValues()</code> で表を配列として読み、ループで調べて、色を付ける・行を消す・追記する。メールは<b>いきなり送らず下書き</b>にして、人が確認してから送ると安全です。',
        prompt:'このスプレッドシート（A:名前 B:メール C:期限 D:金額 E:状態）用の GAS を書いて。期限切れで未払いの行に色を付け、その人あての催促メールを Gmail の下書きに作る。シートを開いたときに「自動化」メニューから実行できるようにして。' },
      { name:'トリガーの種類', en:'Apps Script triggers', h:420, tags:['GAS','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="kt-lbl">1日の中でいつ動くか（例）</div><div class="au-tl tl"></div><div class="kt-code cd" style="white-space:pre;overflow:auto"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.sw').replaceWith(seg(GTRIG.map(g => g[0]), i => { const [n, when, code, hs] = GTRIG[i]; $(el, '.cd').textContent = code;
            $(el, '.tl').innerHTML = [0, 6, 12, 18, 24].map(h => `<span style="left:${h / 24 * 100}%">${h}時</span>`).join('') + hs.map(h => `<i style="left:${h / 24 * 100}%"></i>`).join('');
            verdict($(el, '.res'), '', `<b>${n}</b>：${when}。` + (i === 0 ? '時間は「9時台のどこか」で、ぴったり9:00ではありません。' : i === 1 ? '<b>フォームの回答と同時</b>に動きます。トリガーの設定画面で「フォーム送信時」を選ぶ。' : i === 2 ? '<b>人が手で編集したときだけ</b>動きます（スクリプトやAPIからの変更では動かない）。' : 'ファイルを開いた人に独自のメニューを表示できます。')); }).el); },
        desc:'GAS は<b>トリガー</b>で動き出します。決まった時間に動く「時間主導型」、フォームの回答・シートの編集・ファイルを開いたときに動くものがあります。<code>onEdit</code> や <code>onOpen</code> のように<b>名前を決めるだけで動く</b>もの（シンプルトリガー）と、設定画面で登録するもの（インストール型）があります。',
        prompt:'GASで、毎朝9時にスプレッドシートの「今日の予定」をまとめて Slack に送る自動化を作って。時間主導型トリガーをコードで1回だけ作る関数（setupTrigger）も用意して、重複して作られないように既存のトリガーを確認して。' },
      { name:'6分の壁（実行時間の上限）', en:'Execution time limit', h:400, tags:['GAS','制限','体験'],
        demo:'<div class="kt"><div class="fm"></div><div class="au-tl tl" style="height:40px"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { form($(el, '.fm'), [['rows', '処理する行数', 3000], ['ms', '1行あたりの時間（ミリ秒）', 150]], (st) => {
            const sec = st.rows * st.ms / 1000, lim = 360, batches = Math.ceil(sec / (lim * .8)), pct = Math.min(1, lim / Math.max(sec, 1));
            $(el, '.tl').innerHTML = `<b style="left:0;width:${Math.min(100, sec / Math.max(sec, lim) * 100)}%;background:${sec > lim ? 'var(--bad)' : 'var(--ok)'}">${Math.round(sec)}秒</b><i style="left:${lim / Math.max(sec, lim) * 100}%;background:var(--stage-ink);width:2px"></i><span style="left:${Math.min(96, lim / Math.max(sec, lim) * 100)}%">6分</span>`;
            verdict($(el, '.res'), sec > lim ? 'bad' : sec > lim * .7 ? 'warn' : 'ok', sec > lim ? `❌ ${Math.round(sec / 60 * 10) / 10}分かかり、<b>6分で強制終了</b>します（途中までしか処理されない）。<br>対策：①<b>getValues / setValues でまとめて読み書き</b>（1行ずつのアクセスは遅い）②${batches}回に分けて、続きを次のトリガーで処理（どこまで終わったかを PropertiesService に保存）。` : sec > lim * .7 ? '△ ぎりぎりです。データが増えると止まります。' : '✓ 余裕があります。'); }); },
        desc:'GAS には<b>1回の実行は6分まで</b>などの上限があります（無料のGoogleアカウントの場合。上限は公式の「割り当て」を確認）。1行ずつシートを読み書きするととても遅いので、<b>まとめて読んでまとめて書く</b>のが基本。それでも長いときは、何回かに分けて続きから処理します。',
        prompt:'このGASが「最大実行時間を超えました」で止まります。シートの読み書きを getValues / setValues でまとめて行うように直し、それでも5分を超えそうなら途中で止めて、続きの行番号を PropertiesService に保存し、1分後のトリガーで続きから再開するようにして。' },
    ], null, true),
    { title:'GASでよく使う部品', note:'AIに「GASで」と頼むと、これらを組み合わせたコードを書いてくれます。<b>秘密の値（APIキー・Webhook URL）はスクリプトプロパティ</b>に保存しましょう。',
      table:{ head:['部品', 'できること'], rows:[['<code>SpreadsheetApp</code>', 'スプレッドシートの読み書き・色・シートの追加'], ['<code>GmailApp</code> / <code>MailApp</code>', 'メールの送信・下書き・検索・ラベル'], ['<code>CalendarApp</code>', '予定の作成・取得'], ['<code>FormApp</code>', 'フォームの作成・回答の取得'], ['<code>DriveApp</code>', 'ファイル・フォルダの作成・移動・PDF化'], ['<code>UrlFetchApp</code>', '外部のAPIを呼ぶ（Slack・LINE・AI など）'], ['<code>PropertiesService</code>', '設定や秘密の値を保存（コードに書かない）'], ['<code>ScriptApp</code>', 'トリガーの作成・削除'], ['<code>LockService</code>', '同時に動いて二重に処理しないようにする'], ['<code>doGet</code> / <code>doPost</code>', 'Webアプリとして公開し、URLでデータを受け取る（Webhookの受け口）']] } },
    S('GASの知識', [
      T('スクリプトエディタ', 'Apps Script editor', 'スプレッドシートの「拡張機能 → Apps Script」で開く。ここにコードを貼って保存・実行。', null, ['基本']),
      T('権限の承認', 'Authorization', '初回実行時に「このアプリは確認されていません」と出る。自分で作ったものなら「詳細 → 移動」で許可。<b>人からもらったスクリプトは中身を確認してから</b>。', null, ['注意']),
      T('実行ログ', 'Logger / console.log', '<code>console.log()</code> の結果は「実行数」画面で見られる。エラーの原因調べに。'),
      T('スクリプトプロパティ', 'Script properties', 'APIキーなどの秘密を保存する場所。<code>PropertiesService.getScriptProperties().getProperty("KEY")</code>。', null, ['セキュリティ']),
      T('UrlFetchApp', 'UrlFetchApp', '外部のAPIを呼ぶ。Slack・LINE・AIのAPIと連携できる。'),
      T('Webアプリとしてデプロイ', 'Deploy as web app', '<code>doPost(e)</code> を書いて公開すると、URLでデータを受け取れる（Webhook の受け口）。誰がアクセスできるかの設定に注意。'),
      T('シンプルトリガー', 'Simple triggers', '<code>onOpen</code>・<code>onEdit</code> など名前だけで動く。ただしメール送信など権限が必要な処理はできない → インストール型トリガーを使う。'),
      T('割り当て（クォータ）', 'Quotas', '1日に送れるメールの数・実行時間などの上限。アカウントの種類で違う。公式の一覧で確認。', null, ['制限']),
      T('LockService', 'LockService', '同時に2回動いて二重処理になるのを防ぐ。フォームの同時送信などで使う。'),
      T('clasp', 'clasp', 'GAS のコードを手元のパソコンで書いて、コマンドでアップロードする道具。Git で管理できる。'),
      T('Googleフォーム × GAS', 'Forms + GAS', 'フォームの回答で動く自動化の定番。自動返信メール・通知・シートの整形。'),
    ]),
  ]});

/* ================= 3. ノーコード自動化 ================= */
const NODES = [{ id:'wh', x:12, y:50, i:'🔗', n:'Webhook', s:'注文が届く' }, { id:'set', x:34, y:50, i:'🧮', n:'データ整形', s:'税込にする' }, { id:'if', x:56, y:50, i:'🔀', n:'IF', s:'1万円以上？' }, { id:'sl', x:82, y:24, i:'💬', n:'Slack', s:'大口注文を通知' }, { id:'sh', x:82, y:76, i:'📊', n:'シート', s:'記録だけ' }];
const EDGES = [['wh', 'set'], ['set', 'if'], ['if', 'sl', 'true'], ['if', 'sh', 'false']];
const ORDERS = [{ id:'A-1001', name:'佐藤', price:12000, item:'レザーバッグ' }, { id:'A-1002', name:'鈴木', price:1800, item:'ハンカチ' }];
const NOCODE = [['Zapier', 'とても簡単。連携できるサービスが最多（数千）', '「タスク」（実行したアクション数）で料金', '英語が中心。単純な連携をすぐ作りたい'], ['Make', '画面で分岐・くり返しを組める。表現力が高い', '「オペレーション」数で料金', '少し複雑な流れ・コスパ重視'], ['n8n', 'ノード型。<b>自分のサーバーで無料で動かせる</b>（公式クラウドは有料）', 'クラウドは実行回数、自前なら自分のサーバー代', 'AI連携・社内データ・コード併用'], ['Power Automate', 'Microsoft 365 との連携が強い。デスクトップ操作（RPA）も', 'Microsoft のライセンス', 'Excel・Teams・Outlook の会社'], ['IFTTT', 'スマホ・家電・SNS の簡単な「もし〜なら」', '無料枠あり・有料プラン', '個人の生活の自動化'], ['Pipedream', 'コード（JS・Python）も書ける開発者向け', '実行回数・時間', 'エンジニアの素早い連携']];

TABS.push({ id:'nocode', label:'ノーコード自動化', icon:'🧩',
  intro:'<b>Zapier・Make・n8n</b> などのノーコードツールは、サービス同士を<b>画面上でつなぐだけ</b>で自動化できます。データは「前のステップの出力」を次のステップの入力に<b>差し込んで</b>使います。分岐（IF）を入れると、条件で行き先を変えられます。',
  sections:[
    C('触って理解する', [
      { name:'ノードをつないだ流れ（n8n 風）', en:'Node-based workflow', h:500, tags:['ノーコード','体験','定番'], wide:true,
        demo:'<div class="kt"><div class="kt-row"><span class="kt-lbl">届くデータ</span><span class="sw"></span><button type="button" class="kt-btn pri go">▶ 実行</button></div><div class="au-canvas cv"><svg></svg></div><div class="kt-code out" style="max-height:110px;overflow:auto;white-space:pre"></div></div>',
        init:(el) => { const cv = $(el, '.cv'); let k = 0, outs = {}, busy = 0;
          cv.insertAdjacentHTML('beforeend', NODES.map(n => `<div class="au-node${n.id === 'wh' ? ' trig' : ''}" data-id="${n.id}" style="left:${n.x}%;top:${n.y}%"><i>${n.i}</i>${n.n}<small>${n.s}</small></div>`).join(''));
          const pos = (id) => { const n = $(cv, `[data-id="${id}"]`), r = cv.getBoundingClientRect(), b = n.getBoundingClientRect(); return { l:b.left - r.left, r:b.right - r.left, y:b.top - r.top + b.height / 2 }; };
          const lines = () => { $(cv, 'svg').innerHTML = EDGES.map(([a, b, lab]) => { const A = pos(a), B = pos(b), mx = (A.r + B.l) / 2; return `<path data-e="${a}-${b}" d="M${A.r},${A.y}C${mx},${A.y} ${mx},${B.y} ${B.l},${B.y}"/>${lab ? `<text x="${mx}" y="${(A.y + B.y) / 2 - 4}" text-anchor="middle" style="font:700 10px var(--mono);fill:var(--muted)">${lab}</text>` : ''}`; }).join(''); };
          const show = (id) => { $$(cv, '.au-node').forEach(n => n.classList.toggle('sel', n.dataset.id === id)); $(el, '.out').textContent = outs[id] ? `// ${NODES.find(n => n.id === id).n} の出力\n${JSON.stringify(outs[id], null, 2)}` : '// まだ実行されていません（▶ 実行 を押す）'; };
          $$(cv, '.au-node').forEach(n => n.onclick = () => show(n.dataset.id));
          const flow = async (a, b) => { const p = $(cv, `[data-e="${a}-${b}"]`); p.classList.add('hot'); const L = p.getTotalLength(), dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); dot.setAttribute('r', 5); $(cv, 'svg').append(dot); for (let t = 0; t <= 1; t += .08){ const q = p.getPointAtLength(L * t); dot.setAttribute('cx', q.x); dot.setAttribute('cy', q.y); await sleep(24); } dot.remove(); };
          const on = async (id) => { const n = $(cv, `[data-id="${id}"]`); n.classList.add('on'); await sleep(350); n.classList.remove('on'); };
          $(el, '.go').onclick = async () => { const me = ++busy, o = ORDERS[k]; outs = {}; $$(cv, 'path').forEach(p => p.classList.remove('hot')); $$(cv, '.au-node').forEach(n => n.classList.remove('ok'));
            outs.wh = { body:o }; await on('wh'); if (me !== busy) return; await flow('wh', 'set'); outs.set = { ...o, priceWithTax:Math.round(o.price * 1.1) }; await on('set'); await flow('set', 'if');
            const big = outs.set.priceWithTax >= 10000; outs.if = { ...outs.set, '条件': 'priceWithTax >= 10000', '結果':big }; await on('if'); const to = big ? 'sl' : 'sh'; await flow('if', to);
            outs[to] = big ? { channel:'#大口注文', text:`🎉 ${o.name}様から ${outs.set.priceWithTax.toLocaleString()}円（${o.item}）のご注文` } : { sheet:'注文ログ', row:[o.id, o.name, o.item, outs.set.priceWithTax] }; await on(to); if (me === busy){ $(cv, `[data-id="${to}"]`).classList.add('ok'); show(to); } };
          $(el, '.sw').replaceWith(seg(ORDERS.map(o => `${o.item}（${o.price.toLocaleString()}円）`), i => { k = i; }).el); requestAnimationFrame(lines); show('wh'); },
        desc:'n8n や Make では、1つ1つの処理を<b>ノード（箱）</b>にして線でつなぎます。前のノードの<b>出力（JSON）</b>が次のノードに渡され、IF ノードで条件分岐。ノードをクリックすると、その時点のデータが見られます。うまく動かないときは、<b>どのノードでデータが想定と違うか</b>を1つずつ確かめるのがコツです。',
        prompt:'n8n で、Shopify の注文の Webhook を受けて、税込金額が1万円以上なら Slack の #大口注文 に通知、それ以外はスプレッドシートに記録するワークフローを作りたい。必要なノードと、各ノードの設定（式の書き方）を順番に教えて。' },
      { name:'前のデータを差し込む（マッピング）', en:'Field mapping', h:440, tags:['ノーコード','体験'],
        demo:'<div class="kt"><div class="au-two"><div><span class="kt-lbl">トリガーの出力（フォームの回答）</span><div class="kt-code" style="white-space:pre;flex:1">{\n  "name": "佐藤 花子",\n  "email": "hanako@example.com",\n  "plan": "スタンダード",\n  "amount": 4980,\n  "date": "2026-10-27"\n}</div></div><div><span class="kt-lbl">メールの文面（差し込む項目を選ぶ）</span><div class="mp au-form"></div></div></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const D = { name:'佐藤 花子', email:'hanako@example.com', plan:'スタンダード', amount:4980, date:'2026-10-27' }, F = Object.keys(D), sl = [['宛名', 'name'], ['プラン', 'plan'], ['金額', 'amount']];
          $(el, '.mp').innerHTML = sl.map(([l, v], i) => `<span>{{${l}}}</span><select class="kt-in" data-i="${i}">${F.map(f => `<option${f === v ? ' selected' : ''}>${f}</option>`).join('')}</select>`).join('');
          const run = () => { const m = $$(el, '.mp select').map(s => s.value), val = (f) => f === 'amount' ? Number(D[f]).toLocaleString() + '円' : D[f], wrong = m[0] !== 'name' || m[2] !== 'amount';
            verdict($(el, '.res'), wrong ? 'warn' : 'ok', `<b>件名：</b>ご登録ありがとうございます<br>${esc(val(m[0]))} 様<br>${esc(val(m[1]))}プランへのご登録を受け付けました。月額 ${esc(val(m[2]))} です。` + (wrong ? '<br><b>⚠ 差し込む項目がずれています。</b>テスト送信で必ず確認しましょう。' : '<br><span style="color:var(--muted)">Zapier なら項目を選ぶだけ、n8n なら <code>{{ $json.name }}</code> のような式で差し込みます。</span>')); };
          $$(el, '.mp select').forEach(s => s.onchange = run); run(); },
        desc:'ノーコードツールの肝は、<b>前のステップの出力を、次のステップの入力に差し込む</b>こと（マッピング）。「宛名」に name、「金額」に amount のように対応させます。項目を取り違えると、他人の名前でメールが届くような事故になるので、<b>テスト実行で中身を確認</b>してから本番に切り替えましょう。',
        prompt:'Zapier で、Googleフォームの申し込み（名前・メール・プラン・金額）が届いたら、申込者に確認メールを送る Zap を作りたい。各項目をどうマッピングするか、金額を「4,980円」の形に整える方法、テストの手順を教えて。' },
      { name:'実行回数（タスク数）の計算', en:'Task / operation count', h:380, tags:['料金','体験'],
        demo:'<div class="kt"><div class="fm"></div><div class="au-big bg"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { form($(el, '.fm'), [['day', '1日に動く回数', 40], ['steps', '1回あたりのアクション数', 4], ['poll', 'ポーリング（何分ごとに確認）', 15]], (st) => { const m = st.day * 30 * st.steps, chk = st.poll > 0 ? Math.round(30 * 24 * 60 / st.poll) : 0;
            $(el, '.bg').innerHTML = `<div><small>1か月のアクション数</small><b>${m.toLocaleString()}</b></div><div><small>空振りの確認（ポーリング）</small><b>${chk.toLocaleString()}回</b></div>`;
            verdict($(el, '.res'), m > 10000 ? 'warn' : '', '多くのノーコードツールは<b>「動いたアクションの数」で料金</b>が決まります（呼び方はタスク・オペレーションなど。<b>数え方と料金は各サービスの公式で確認</b>）。' + (m > 10000 ? '<br>回数が多いなら、<b>n8n を自分のサーバーで動かす</b>・GAS や自前のプログラムにする方が安くなることも。' : '') + (chk ? '<br>「新しいデータがあるか」を定期的に見に行くポーリング型のトリガーは、空振りでも回数を使うことがあります。Webhook 型なら届いたときだけ動きます。' : '')); }); },
        desc:'ノーコードの自動化は<b>使った分だけ料金</b>がかかるのが普通です。「1日の実行回数 × アクションの数 × 30日」で、1か月にどれくらい使うか見積もってからプランを選びましょう。回数が多いと、自前のプログラムの方が安くなる分岐点があります。',
        prompt:'今の自動化（1日40回・1回4アクション）を Zapier・Make・n8n（自前サーバー）・GAS で動かした場合の月額の目安を比べて。料金は各社の最新の公式ページを確認した上で、表にまとめて。' },
    ], null, true),
    { title:'ノーコード自動化ツールの比較', note:'料金体系は変わりやすいので<b>最新は各公式</b>で確認してください。社内のデータや個人情報を扱うなら、<b>データがどこに保存されるか</b>も確認しましょう。',
      table:{ head:['ツール', '特徴', '料金の数え方', '向いている'], rows:NOCODE } },
    S('ノーコード自動化の用語', [
      T('Zap / シナリオ / ワークフロー', 'Zap / Scenario / Workflow', 'ツールごとの「自動化1つ」の呼び名。Zapier は Zap、Make はシナリオ、n8n はワークフロー。'),
      T('コネクタ（アプリ連携）', 'Connector', 'サービスごとの接続部品。ログインを許可（OAuth）して使う。'),
      T('ポーリング', 'Polling', '数分おきに「新しいのある？」と見に行くトリガー。反映まで時間がかかる。'),
      T('インスタントトリガー', 'Instant trigger', 'Webhook を使い、起きた瞬間に動くトリガー。'),
      T('マッピング', 'Mapping', '前のステップの項目を、次のステップの入力に対応させること。'),
      T('式（エクスプレッション）', 'Expressions', 'n8n の <code>{{ $json.price * 1.1 }}</code> のように、値を計算・加工する書き方。'),
      T('フィルター・分岐', 'Filter / Router / IF', '条件で止める・行き先を分ける。'),
      T('くり返し（イテレーター）', 'Iterator / Loop', '配列の1件ずつに同じ処理をする。件数ぶんアクション数が増えるので料金に注意。', null, ['注意']),
      T('エラーハンドラー', 'Error handling', '失敗したときの流れ。再試行・通知・スキップを設定する。'),
      T('テスト実行', 'Test run', '本物のデータで1回だけ動かして、各ステップの中身を確認する。<b>本番に入れる前に必ず</b>。', null, ['最重要']),
      T('セルフホスト', 'Self-hosting', 'n8n などを自分のサーバーで動かすこと。データを外に出さない・回数無制限だが、管理は自分で。'),
      T('接続の切れ', 'Expired connections', 'パスワード変更や権限の期限切れで、ある日突然止まる。通知を設定しておく。'),
    ]),
  ]});

/* ================= 4. Webhook・API連携 ================= */
const enc = new TextEncoder(), hex = (buf) => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
async function hmac(secret, msg){ const k = await crypto.subtle.importKey('raw', enc.encode(secret), { name:'HMAC', hash:'SHA-256' }, false, ['sign']); return hex(await crypto.subtle.sign('HMAC', k, enc.encode(msg))); }

TABS.push({ id:'webhook', label:'Webhook・API連携', icon:'🔗',
  intro:'<b>Webhook</b> は「何かが起きたら、相手のサービスが自分のURLに知らせてくれる」仕組みです。決済完了・フォーム送信・GitHubの更新などを<b>その瞬間に</b>受け取れます。受け取る側では<b>本物か確かめる（署名）・二重に処理しない（冪等性）・すぐ返事をする</b>の3つが鉄則です。',
  sections:[
    C('触って理解する', [
      { name:'ポーリングと Webhook', en:'Polling vs Webhook', h:460, tags:['基本','体験'],
        demo:'<div class="kt" style="padding:0"><div style="padding:10px 12px 0"><span class="sw"></span></div><div class="sq" style="position:relative;flex:1;min-height:0"></div></div>',
        init:(el) => { let stop = null; const A = [{ label:'自分のサーバー', icon:'🖥' }, { label:'決済サービス', icon:'💳' }];
          const P = [{ f:0, t:1, label:'支払い終わった？', note:'<b>ポーリング</b>：自分から何度も聞きに行く。' }, { f:1, t:0, label:'まだです', dash:true }, { f:0, t:1, label:'（1分後）終わった？' }, { f:1, t:0, label:'まだです', dash:true }, { f:0, t:1, label:'（1分後）終わった？' }, { f:1, t:0, label:'終わりました！', dash:true, good:true, note:'気づくのが最大1分遅れ、ほとんどの問い合わせは<b>空振り</b>。' }];
          const W = [{ f:1, t:1, label:'お客さまが支払い完了', note:'<b>Webhook</b>：何かが起きたら相手から知らせてくれる。' }, { f:1, t:0, label:'POST /api/webhook（支払い完了）', good:true, note:'<b>その瞬間に</b>届く。事前に「知らせてほしいURL」を相手に登録しておく。' }, { f:0, t:0, label:'署名を確認・記録', note:'本物か確かめてから処理する（次のデモ）。' }, { f:0, t:1, label:'200 OK（受け取りました）', dash:true, note:'すぐに返事をする。返事がないと、相手は<b>失敗したと思って再送</b>してくる。' }];
          $(el, '.sw').replaceWith(seg(['ポーリング（何度も聞く）', 'Webhook（知らせてもらう）'], i => { if (stop) stop(); stop = seq($(el, '.sq'), { actors:A, steps:i ? W : P }); }).el); return () => stop && stop(); },
        desc:'新しいことが起きたかを知る方法は2つ。自分から何度も聞きに行く<b>ポーリング</b>と、相手から知らせてもらう<b>Webhook</b>。Webhook の方が<b>速くて無駄がない</b>ので、決済・チャット・Gitの連携の多くはこちらです。そのかわり、受け取るための<b>公開されたURL</b>が必要です。',
        prompt:'Stripe の「支払い完了」を Webhook で受け取って、注文を「支払い済み」に更新する仕組みを Next.js の Route Handler で作って。Stripe の管理画面での Webhook の登録方法と、ローカル開発で試す方法（Stripe CLI）も教えて。' },
      { name:'Webhook の受け取り方（署名・二重処理）', en:'Signature & idempotency', h:540, tags:['セキュリティ','体験','最重要'], wide:true,
        demo:'<div class="kt"><div class="kt-row bts"></div><div class="au-two"><div><span class="kt-lbl">届いたリクエスト</span><div class="kt-code rq" style="flex:1;overflow:auto;white-space:pre"></div></div><div><span class="kt-lbl">受け取る側のチェック</span><div class="au-log lg" style="flex:1"></div></div></div><div class="kt-verdict res">ボタンを押して、いろいろなリクエストを送ってみましょう。</div></div>',
        init:(el) => { const SECRET = 'whsec_demo_秘密の値', seen = new Set(); let n = 0, last = null;
          const B = [['✓ 正しいイベント', 'ok'], ['✎ 中身を改ざん', 'tamper'], ['↻ 同じイベントを再送', 'dup'], ['⌛ 10分前のイベント', 'old'], ['🔑 署名なし', 'nosig']];
          $(el, '.bts').innerHTML = B.map((b, i) => `<button type="button" class="kt-btn sm" data-i="${i}">${b[0]}</button>`).join('');
          $$(el, '.bts button').forEach(btn => btn.onclick = async () => { const kind = B[+btn.dataset.i][1], now = Math.floor(Date.now() / 1000);
            let ev = kind === 'dup' && last ? last : { id:`evt_${1000 + (++n)}`, type:'payment.succeeded', amount:4980, order:`A-${2000 + n}` };
            const ts = kind === 'old' ? now - 600 : now, body = JSON.stringify(ev), sig = kind === 'nosig' ? '' : await hmac(SECRET, `${ts}.${body}`), sentBody = kind === 'tamper' ? body.replace('4980', '1') : body; if (kind === 'ok') last = ev;
            $(el, '.rq').textContent = `POST /api/webhook\nX-Signature: ${sig ? 't=' + ts + ',v1=' + sig.slice(0, 24) + '…' : '（なし）'}\n\n${JSON.stringify(JSON.parse(sentBody), null, 2)}`;
            const lg = $(el, '.lg'); lg.innerHTML = ''; const fail = (m) => { log(lg, 'bad', '× ' + m); log(lg, 'bad', '→ 400 を返して処理しない'); verdict($(el, '.res'), 'bad', '処理を拒否しました。'); };
            log(lg, 'dim', '1. 署名を、自分の秘密の値で計算し直して比べる'); await sleep(250);
            if (!sig) return fail('署名がありません（誰でも送れる偽物かも）');
            const mine = await hmac(SECRET, `${ts}.${sentBody}`); if (mine !== sig) return fail('署名が一致しません（途中で中身が書き換えられた）'); log(lg, 'ok', '✓ 署名が一致：本物の相手から、改ざんされずに届いた'); await sleep(250);
            log(lg, 'dim', '2. 時刻が新しいか（5分以内）'); await sleep(200); if (now - ts > 300) return fail(`${Math.round((now - ts) / 60)}分前のリクエスト（盗んだものの使い回し＝リプレイ攻撃かも）`); log(lg, 'ok', '✓ 新しいリクエスト'); await sleep(250);
            log(lg, 'dim', `3. イベントID ${ev.id} は処理済み？`); await sleep(200); if (seen.has(ev.id)){ log(lg, 'warn', '△ もう処理済み → 何もせず 200 を返す（二重に発送しない）'); verdict($(el, '.res'), 'warn', '<b>同じイベントの再送</b>でした。もう一度処理すると二重に発送・二重に課金してしまうので、<b>処理済みのIDを記録して無視</b>します。'); return; }
            seen.add(ev.id); log(lg, 'ok', `✓ 初めてのイベント → 注文 ${ev.order} を「支払い済み」に`); log(lg, 'ok', '→ すぐに 200 OK を返す（重い処理は後回し）'); verdict($(el, '.res'), 'ok', '正しく処理しました。'); }); },
        desc:'Webhook の受け口は<b>誰でもアクセスできるURL</b>なので、偽物も届きます。①<b>署名の確認</b>（共有した秘密の値で計算し直して一致するか）②<b>時刻の確認</b>（古いものの使い回しを防ぐ）③<b>処理済みIDの記録</b>（再送で二重に処理しない）、そして<b>すぐに200を返す</b>。この4つが鉄則です。',
        prompt:'Webhook の受け口（Next.js の app/api/webhook/route.ts）を安全にして。ヘッダーの署名を HMAC-SHA256 で検証（比較はタイミング攻撃に強い方法で）、5分より古いものは拒否、イベントIDをDBに保存して二重処理を防ぎ、重い処理はキューに入れてすぐ200を返して。',
        code:'// Next.js の Route Handler（例：Stripe の場合は公式SDKの constructEvent を使う）\nimport crypto from "node:crypto";\n\nexport async function POST(req: Request) {\n  const body = await req.text();                 // 署名の確認には「生の文字列」が必要\n  const [t, v1] = parseSig(req.headers.get("x-signature"));\n  const expected = crypto.createHmac("sha256", process.env.WEBHOOK_SECRET!)\n    .update(`${t}.${body}`).digest("hex");\n  if (!v1 || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1)))\n    return new Response("bad signature", { status: 400 });\n  if (Date.now() / 1000 - Number(t) > 300) return new Response("too old", { status: 400 });\n\n  const event = JSON.parse(body);\n  const fresh = await db.processedEvents.insertIfAbsent(event.id); // 二重処理を防ぐ\n  if (fresh) await queue.enqueue(event);          // 重い処理は後で\n  return new Response("ok");                      // すぐ 200 を返す\n}' },
      { name:'返事が遅いと再送される', en:'Retries & timeouts', h:430, tags:['運用','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="au-tl tl" style="height:44px"></div><div class="au-log lg kt-grow"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.sw').replaceWith(seg(['すぐ200を返す', 'エラー（500）', '重い処理で30秒かかる'], i => { const at = [0, 1, 5, 30, 120, 360], lab = ['0分', '1分後', '5分後', '30分後', '2時間後', '6時間後'], lg = $(el, '.lg'); lg.innerHTML = ''; let html = '';
            const tries = i === 0 ? 1 : at.length; for (let k = 0; k < tries; k++){ html += `<i style="left:${2 + at[k] / 360 * 94}%;background:${i === 0 ? 'var(--ok)' : 'var(--bad)'}"></i>`; log(lg, i === 0 ? 'ok' : 'bad', `${lab[k]}：送信 → ${i === 0 ? '200 OK（受け取り完了）' : i === 1 ? '500 エラー → 相手は「届かなかった」と判断' : '30秒待っても返事なし → タイムアウト → 失敗扱い'}`); }
            if (i === 2) log(lg, 'warn', '⚠ でも処理自体は裏で完了していた → <b>同じ注文が6回処理される</b>危険');
            $(el, '.tl').innerHTML = html + ['0', '1h', '3h', '6h'].map((t, j) => `<span style="left:${2 + [0, 60, 180, 360][j] / 360 * 94}%">${t}</span>`).join('');
            verdict($(el, '.res'), i === 0 ? 'ok' : 'bad', i === 0 ? '✓ 1回で終わります。' : i === 1 ? '相手は<b>時間を空けながら何度も再送</b>してきます（間隔や回数はサービスごとに違う）。何日も失敗が続くと、Webhook 自体を止められることも。' : '<b>返事が遅いとタイムアウト</b>で失敗扱い。処理は終わっているのに再送され、二重処理の原因に。<b>先に200を返し、重い処理は後で</b>（キュー）。'); }).el); },
        desc:'Webhook を送る側は、<b>2xx（成功）の返事が来ないと失敗とみなして再送</b>します。エラーはもちろん、<b>処理が遅くてタイムアウト</b>した場合も再送されます。だから受け取る側は「すぐ返事」と「二重処理の防止」がセットで必要です。',
        prompt:'Webhook を受けたあとにメール送信とPDF作成をしていて、タイムアウトで再送が起きています。受け取ったら記録してすぐ200を返し、重い処理はキュー（Vercel なら Queue／Inngest／Supabase のジョブなど）で後から実行する形に作り直して。' },
      { name:'使いすぎたら待つ（バックオフ）', en:'Rate limits & backoff', h:420, tags:['運用','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="au-tl tl" style="height:44px"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.sw').replaceWith(seg(['すぐ再試行', '毎回1秒待つ', '指数バックオフ＋ゆらぎ'], i => { const r = rng(3), at = []; let t = 0; for (let k = 0; k < 7; k++){ at.push(t); t += i === 0 ? .15 : i === 1 ? 1 : Math.pow(2, k) * .5 * (.6 + r() * .8); }
            const mx = Math.max(16, t), okAt = i === 2 ? 4 : -1;
            $(el, '.tl').innerHTML = at.map((a, k) => `<i style="left:${2 + a / mx * 94}%;background:${k === okAt ? 'var(--ok)' : 'var(--bad)'}"></i>`).join('') + [0, 4, 8, 12, 16].map(s => `<span style="left:${2 + s / mx * 94}%">${s}秒</span>`).join('');
            verdict($(el, '.res'), i === 2 ? 'ok' : 'bad', i === 0 ? '❌ 「429：多すぎます」と言われているのに連打。<b>さらに制限が延びる</b>・ブロックされることも。' : i === 1 ? '△ 少しはましですが、みんなが同じ間隔で再試行すると<b>同時に押し寄せて</b>また失敗します。' : '✓ 待つ時間を <b>0.5 → 1 → 2 → 4秒…と倍に</b>し、少しずつ<b>ランダムにずらす</b>。相手の回復を待てて、同時アクセスも避けられます。<code>Retry-After</code> ヘッダーがあればその秒数を待つ。'); }).el); },
        desc:'APIには<b>短時間に呼べる回数の上限（レート制限）</b>があり、超えると <code>429 Too Many Requests</code> が返ります。すぐ再試行するのは逆効果。待ち時間を倍々に増やす<b>指数バックオフ</b>と、少しずらす<b>ゆらぎ（ジッター）</b>が定番の対策です。大量に送るなら、そもそも間隔を空けて送りましょう。',
        prompt:'外部APIを1000件連続で呼ぶ処理で 429 エラーが出ます。1秒あたりの呼び出し数を制限し、429 や 5xx のときは Retry-After ヘッダーを優先、なければ指数バックオフ＋ジッターで最大5回再試行する関数を TypeScript で書いて。' },
    ], null, true),
    S('Webhook・API連携の用語', [
      T('エンドポイント', 'Endpoint', 'リクエストを受け取るURL。Webhook なら「知らせてほしい宛先」。'),
      T('ペイロード', 'Payload', 'リクエストの中身（JSON）。何が起きたかの情報。'),
      T('署名', 'Signature', '送る側と受ける側だけが知る<b>秘密の値</b>で計算した印。一致すれば本物で改ざんなし。', null, ['最重要']),
      T('HMAC', 'HMAC-SHA256', '秘密の値と中身から署名を作る計算方法。Webhook の署名で最もよく使われる。'),
      T('リプレイ攻撃', 'Replay attack', '盗んだ本物のリクエストを後から送り直す攻撃。時刻のチェックとIDの記録で防ぐ。'),
      T('冪等キー', 'Idempotency key', 'このリクエストは何回来ても1回分として扱う、という印。決済APIなどで使う。'),
      T('2xx を返す', 'Acknowledge', '受け取ったら 200 などの成功を返す。返さないと再送される。'),
      T('タイムアウト', 'Timeout', '決まった時間内に返事がないと失敗扱い。Webhook は数秒〜数十秒のことが多い。'),
      T('キュー・ジョブ', 'Queue / background jobs', '重い処理を後回しにする仕組み。Inngest・Trigger.dev・Supabase Queues など。'),
      T('レート制限', 'Rate limiting', '回数の上限。429 が返ったら待つ。'),
      T('指数バックオフ', 'Exponential backoff', '再試行の間隔を倍々に延ばす。ゆらぎ（ジッター）も加える。'),
      T('トンネル（ローカルで受け取る）', 'Tunneling', '自分のパソコンで開発中に Webhook を受けるための仕組み。ngrok・Cloudflare Tunnel・Stripe CLI など。'),
      T('OAuth', 'OAuth', '他人のサービスのアカウントを、パスワードを渡さずに操作する許可の仕組み。「Googleでログインして許可」。'),
      T('APIキーの保管', 'Secret storage', 'コードやスプレッドシートに書かない。環境変数・スクリプトプロパティ・シークレット管理へ。', null, ['セキュリティ']),
    ]),
  ]});
})();
