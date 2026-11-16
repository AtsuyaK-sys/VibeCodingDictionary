/* データベース・データ設計辞典 — C: データを守る / データ型・日付・お金 / サービス・道具 / AIへの頼み方・エラー */
(function(){
const { $, $$, esc, tbl, seg, seq } = KIT;
const { S, C, T, newDB } = window.DBH;
const E = (msg, where, mean, fix, prompt) => ({ name:`<code class="err">${esc(msg)}</code>`, en:where, search:msg, desc:`<b>意味：</b>${mean}<br><b>対処：</b>${fix}`, prompt });

/* ================= 5. データを守る・変更する ================= */
const MIGS = [
  ['001_create_users.sql', 'CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE);', 'DROP TABLE users;'],
  ['002_add_users_name.sql', 'ALTER TABLE users ADD COLUMN name TEXT;', 'ALTER TABLE users DROP COLUMN name;'],
  ['003_create_posts.sql', 'CREATE TABLE posts (id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), title TEXT NOT NULL);', 'DROP TABLE posts;'],
  ['004_index_posts_user.sql', 'CREATE INDEX posts_user_id_idx ON posts (user_id);', 'DROP INDEX posts_user_id_idx;'],
];
TABS.push({ id:'safety', label:'データを守る・変更する', icon:'🛡',
  intro:'データは<b>アプリの中で一番失ってはいけないもの</b>です。お金の移動のような「途中で止まると困る処理」、同時に押されたときの競合、公開後のテーブル変更、削除とバックアップ。ここを押さえると、事故の多くを防げます。',
  sections:[
    C('触って理解する', [
      { name:'トランザクション（全部か、なかったことに）', en:'Transaction / ROLLBACK', h:400, tags:['最重要','本物のSQL'],
        demo:'<div class="kt"><div class="kt-row"><span class="sw"></span><label class="kt-lbl" style="display:flex;gap:4px;align-items:center"><input type="checkbox" class="er" checked>途中でエラーを起こす</label></div><div class="db-acc"><div class="a">Aさん<b>-</b></div><div class="b">Bさん<b>-</b></div><div class="t">合計<b>-</b></div></div><div class="kt-row"><button type="button" class="kt-btn pri go">AからBへ1,000円送る</button><button type="button" class="kt-btn sm rs">最初から</button></div><div class="db-log kt-grow log"></div></div>',
        init:(el) => { let db = null, tx = 0; const log = (cls, t) => $(el, '.log').insertAdjacentHTML('beforeend', `<div class="${cls}">${esc(t)}</div>`);
          const show = () => { const r = Object.fromEntries(db.exec('SELECT name, balance FROM accounts')[0].values); const tot = r.A + r.B; $(el, '.a b').textContent = r.A.toLocaleString(); $(el, '.b b').textContent = r.B.toLocaleString(); $(el, '.t b').textContent = tot.toLocaleString(); $(el, '.t').classList.toggle('bad', tot !== 15000); };
          const reset = async () => { try{ db && db.close(); db = await newDB('', "CREATE TABLE accounts (name TEXT PRIMARY KEY, balance INTEGER NOT NULL CHECK (balance >= 0)); INSERT INTO accounts VALUES ('A', 10000), ('B', 5000);"); $(el, '.log').innerHTML = '<div class="dim">-- 合計は常に15,000円のはず</div>'; show(); }catch(e){ $(el, '.log').innerHTML = '<div class="bad">SQLエンジンを読み込めませんでした（インターネット接続が必要です）。</div>'; } };
          const step = (sql) => { try{ db.run(sql); log('ok', '✓ ' + sql); return true; }catch(e){ log('bad', '✗ ' + sql + '  → ' + e.message); return false; } };
          $(el, '.sw').replaceWith(seg(['トランザクションなし', 'トランザクションあり'], k => { tx = k; }).el);
          $(el, '.go').onclick = () => { if (!db) return; const err = $(el, '.er').checked; log('dim', '--------');
            if (tx) step('BEGIN;'); step("UPDATE accounts SET balance = balance - 1000 WHERE name = 'A';");
            const ok = err ? step("UPDATE accounts SET balance = balance + 1000 WHERE nme = 'B';  -- 打ち間違い") : step("UPDATE accounts SET balance = balance + 1000 WHERE name = 'B';");
            if (tx) step(ok ? 'COMMIT;' : 'ROLLBACK;  -- 途中で失敗したので全部取り消し');
            show(); const tot = db.exec('SELECT SUM(balance) FROM accounts')[0].values[0][0];
            log(tot === 15000 ? 'ok' : 'bad', tot === 15000 ? (ok ? '→ 送金完了。合計は15,000円のまま' : '→ 取り消されたので、お金は消えていない') : `→ ❌ 1,000円が消えた！（合計 ${tot.toLocaleString()}円）`); $(el, '.log').scrollTop = 1e6; };
          $(el, '.rs').onclick = reset; reset(); return () => db && db.close(); },
        desc:'「Aの残高を減らす」と「Bの残高を増やす」の間で失敗すると、<b>お金が消えます</b>。<b>トランザクション</b>でまとめると、途中で失敗したら <code>ROLLBACK</code> で全部なかったことにでき、成功したら <code>COMMIT</code> で確定します。注文と在庫、ポイントの付与と消費など、<b>2つ以上の書き込みがセットの処理</b>には必ず使います。',
        prompt:'注文の確定処理（注文の作成・在庫の減算・ポイントの消費）を1つのトランザクションにまとめて、どこかで失敗したら全部取り消されるようにして。Supabaseなら、この処理をPostgreSQLの関数（RPC）にして呼び出す形で。' },
      { name:'同時に押されたら（在庫の取り合い）', en:'Race condition / lost update', h:420, tags:['最重要','仕組み'],
        demo:'<div class="kt"><div class="kt-row c sw"></div><div class="kt-grow host" style="position:relative"></div></div>',
        init:(el) => { let stop = null; const host = $(el, '.host'), A = [{ icon:'🙋', label:'Aさん' }, { icon:'🗄', label:'DB（在庫1）' }, { icon:'🙋‍♂️', label:'Bさん' }];
          const BAD = [{ f:0, t:1, label:'在庫は？', note:'Aさんが「購入」を押し、アプリが在庫を読みます。' }, { f:1, t:0, label:'1個あります', dash:true, note:'在庫は1。購入できると判断します。' }, { f:2, t:1, label:'在庫は？', note:'<b>ほぼ同時に</b>Bさんも「購入」。まだAさんの更新前です。' }, { f:1, t:2, label:'1個あります', dash:true, note:'Bさんにも「1個ある」と返します。' }, { f:0, t:1, label:'在庫を0にして注文', note:'Aさんの注文を確定し、在庫を 1−1＝0 で保存。' }, { f:2, t:1, label:'在庫を0にして注文', bad:true, note:'Bさんも、自分が読んだ「1」から計算して 0 を保存。' }, { f:1, t:1, label:'1個なのに注文が2件', bad:true, note:'<b>売り越し</b>。クーポンの二重使用、ポイントの二重付与も同じ仕組みで起きます。' }];
          const GOOD = [{ f:0, t:1, label:'在庫が1以上なら1減らす', note:'読んでから書くのではなく、<code>UPDATE … SET stock = stock - 1 WHERE id = 3 AND stock &gt; 0</code> を<b>1回で</b>送ります。' }, { f:1, t:0, label:'1行更新 → 注文確定', dash:true, good:true, note:'条件に合ったので更新され、Aさんの注文を確定します。' }, { f:2, t:1, label:'在庫が1以上なら1減らす', note:'Bさんも同じ命令を送ります。' }, { f:1, t:2, label:'0行更新 → 売り切れ', dash:true, good:true, note:'もう stock &gt; 0 ではないので<b>更新されません</b>。0行なら「売り切れ」と表示。' }, { f:1, t:1, label:'在庫0・注文1件（正しい）', good:true, note:'DBが1行ずつ順番に処理するので、矛盾が起きません。ほかに一意制約・行ロック（FOR UPDATE）・楽観ロック（version列）も使えます。' }];
          $(el, '.sw').append(seg(['読んでから書く', '条件付きで1回で更新'], i => { stop && stop(); stop = seq(host, { actors:A, steps:i ? GOOD : BAD }); }).el);
          return () => stop && stop(); },
        desc:'「読む → アプリで計算 → 書く」の間に、他の人の書き込みが割り込むと、<b>後から書いた方が前の更新を上書き</b>します。ローカルでは1人なので気づけず、公開後に起きる典型的なバグ。<b>条件付きの1回の更新・一意制約・トランザクションとロック</b>で防ぎます。',
        prompt:'在庫・残高・ポイント・クーポンの使用回数を更新している処理で、同時実行されたときに矛盾が起きないか確認して。「読んでから書く」になっている箇所は、条件付きUPDATE・一意制約・トランザクション（SELECT … FOR UPDATE）のいずれかで直して。' },
      { name:'マイグレーション（変更の履歴）', en:'Schema migrations', h:420, tags:['体験','本物のSQL'],
        demo:'<div class="kt"><div class="db-mig ms"></div><div class="kt-row"><button type="button" class="kt-btn pri up">▲ 1つ適用（up）</button><button type="button" class="kt-btn dn">▼ 1つ戻す（down）</button></div><div class="kt-code q"></div><div class="db-res kt-grow out"></div></div>',
        init:(el) => { let db = null, v = 0;
          const draw = (sql) => { $(el, '.ms').innerHTML = MIGS.map((m, i) => `<div class="${i < v ? 'done' : 'todo'}${i === v - 1 ? ' cur' : ''}">${m[0]}</div>`).join('') ; $(el, '.q').innerHTML = sql ? KIT.hlSQL(sql) : '<span class="c">-- まだ何も適用していません（空のDB）</span>';
            if (!db) return; const ts = db.exec("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")[0]; const ix = db.exec("SELECT name FROM sqlite_master WHERE type = 'index' AND sql IS NOT NULL")[0];
            $(el, '.out').innerHTML = `<div class="meta">現在のDB（バージョン ${v}）</div>` + (ts ? ts.values.map(([t]) => `<div class="meta"><b style="color:var(--stage-ink)">${t}</b>：${db.exec(`SELECT group_concat(name, ', ') FROM pragma_table_info('${t}')`)[0].values[0][0]}</div>`).join('') : '<div class="meta">テーブルなし</div>') + (ix ? `<div class="meta">インデックス：${ix.values.map(x => x[0]).join(', ')}</div>` : ''); };
          newDB('', '').then(d => { db = d; draw(); }, () => $(el, '.out').innerHTML = '<div class="err">SQLエンジンを読み込めませんでした（インターネット接続が必要です）。</div>');
          $(el, '.up').onclick = () => { if (!db || v >= MIGS.length) return; db.run(MIGS[v][1]); v++; draw(MIGS[v - 1][1]); };
          $(el, '.dn').onclick = () => { if (!db || v <= 0) return; v--; db.run(MIGS[v][2]); draw(MIGS[v][2]); };
          return () => db && db.close(); },
        desc:'公開後のテーブル変更は、管理画面で直接いじらず、<b>変更をSQLファイルとして順番に記録</b>して適用します（マイグレーション）。Gitで履歴が残り、開発・本番で同じ変更を再現でき、問題があれば戻せます。Supabase CLI・Prisma Migrate・Drizzle Kit などが管理してくれます。',
        prompt:'users テーブルに「表示名（display_name）」列を追加したい。Supabase CLI でマイグレーションファイルを作り、既存ユーザーには email の@より前を初期値として入れ、ローカルで試してから本番に適用する手順を教えて。' },
      { name:'物理削除と論理削除', en:'Hard delete vs soft delete', h:380, tags:['体験','設計'],
        demo:'<div class="kt"><div class="kt-row"><span class="sw"></span></div><div class="kt-row" style="align-items:flex-start;flex-wrap:nowrap;gap:8px"><div style="flex:1;min-width:0"><div class="kt-lbl">アプリの一覧に出るもの</div><div class="list"></div></div><div style="flex:1.3;min-width:0"><div class="kt-lbl">DBに残っているもの</div><div class="dbt"></div></div></div><div class="kt-code q kt-grow"></div></div>',
        init:(el) => { let soft = 0, rows; const init = () => { rows = [[1, '牛乳を買う', null], [2, '請求書を払う', null], [3, '歯医者を予約', null]]; };
          const draw = (sql) => { const live = rows.filter(r => !r[2]); $(el, '.list').innerHTML = tbl(['id', 'title', ''], live.map(r => [r[0], r[1], '🗑'])); $(el, '.dbt').innerHTML = tbl(['id', 'title', 'deleted_at'], rows, { cls:(r) => r[2] ? 'dim' : '' });
            $$(el, '.list tr').slice(1).forEach((tr, i) => { tr.style.cursor = 'pointer'; tr.onclick = () => { const r = live[i]; if (soft){ r[2] = '2026-10-27'; draw(`UPDATE todos SET deleted_at = now() WHERE id = ${r[0]};\n-- 一覧：SELECT * FROM todos WHERE deleted_at IS NULL;`); } else { rows = rows.filter(x => x !== r); draw(`DELETE FROM todos WHERE id = ${r[0]};  -- 元に戻せない`); } }; });
            $$(el, '.dbt tr').slice(1).forEach((tr, i) => { if (rows[i][2]){ tr.style.cursor = 'pointer'; tr.title = 'クリックで復元'; tr.onclick = () => { rows[i][2] = null; draw(`UPDATE todos SET deleted_at = NULL WHERE id = ${rows[i][0]};  -- 復元`); }; } });
            $(el, '.q').innerHTML = sql ? KIT.hlSQL(sql) : '<span class="c">-- 左の一覧の行をクリックすると削除します</span>'; };
          $(el, '.sw').replaceWith(seg(['物理削除（DELETE）', '論理削除（deleted_at）'], k => { soft = k; init(); draw(); }).el); },
        desc:'<b>物理削除</b>は行を本当に消す（容量が減る・戻せない）。<b>論理削除</b>は <code>deleted_at</code> に日時を入れて「消えたことにする」（復元・監査ができる）。論理削除は<b>すべての検索に「deleted_at IS NULL」の条件が必要</b>で、一意制約やRLSとの相性も考える必要があります。個人情報は、退会後一定期間で物理削除するのが一般的です。',
        prompt:'投稿の削除を論理削除（deleted_at）にして、通常の一覧・検索では削除済みを除外し、管理画面からは30日以内なら復元できるようにして。30日を過ぎたものは定期処理で物理削除して。' },
    ], null, true),
    S('データを守る知識', [
      T('ACID', 'Atomicity / Consistency / Isolation / Durability', 'トランザクションが守る4つの性質。<b>原子性</b>（全部か無か）・<b>一貫性</b>（ルール違反の状態にならない）・<b>独立性</b>（同時実行が干渉しない）・<b>永続性</b>（確定したら消えない）。'),
      T('分離レベル', 'Isolation level', '同時に動くトランザクションが、お互いの途中の変更をどこまで見えるか。PostgreSQLの標準は Read Committed。厳しくするほど安全だが、待ちや失敗（再試行）が増える。'),
      T('ロック', 'Lock / SELECT … FOR UPDATE', '更新中の行を他の処理が触れないようにする。<code>SELECT … FOR UPDATE</code> で「これから更新する行」を確保する（悲観ロック）。'),
      T('楽観ロック', 'Optimistic locking', '行に version 列を持たせ、更新時に「読んだときの version と同じなら更新」とする。違えば誰かが先に更新したので、利用者に知らせてやり直す。共同編集・管理画面向け。', '管理画面の商品編集に楽観ロックを入れて。version 列を追加し、保存時に version が変わっていたら「他の人が更新しました」と表示して再読み込みさせて。'),
      T('デッドロック', 'Deadlock', '2つの処理が、お互いの持っているロックを待ち合って止まる状態。DBが片方を失敗させるので、再試行の処理を入れる。更新する順番をそろえると起きにくい。'),
      T('べき等性', 'Idempotency', '同じ処理が2回実行されても結果が変わらないこと。Webhookの再送・二重クリック・通信のリトライに備え、<b>一意なID（イベントID・注文番号）に一意制約</b>を付ける。', null, ['重要']),
      T('マイグレーションのルール', 'Migration rules', '①本番を管理画面で直接いじらない ②一度適用したファイルは書き換えず、新しいファイルで直す ③down（戻し方）も考える ④データが入ったテーブルへの NOT NULL 追加は既定値とセットで ⑤先にローカル・ステージングで試す。'),
      T('止めずに変更する', 'Expand and contract', '列の名前変更などは「新しい列を足す → 両方に書く → 読み取りを切り替える → 古い列を消す」と段階的に行うと、公開中のアプリを止めずに済む。'),
      T('バックアップ', 'Backup', 'Supabaseなどは自動で毎日バックアップ（保存期間はプランによる）。<b>PITR</b>（Point-in-Time Recovery）があれば「何時何分の状態」に戻せる。重要なデータは自分でも定期的にエクスポートしておく。', '本番DBのバックアップ状況（頻度・保存期間・復元方法）を確認して、足りなければ毎日の自動エクスポート（pg_dump を GitHub Actions で実行して別の場所に保存）を設定して。'),
      T('復元の練習', 'Restore drill', 'バックアップは「戻せる」と確認して初めて意味がある。年に一度は、別のDBに復元してアプリが動くか試す。'),
      T('本番DBを触るときの作法', 'Production safety', '①まず同じ条件で SELECT して対象件数を確認 ②<code>BEGIN;</code> で始めて結果を見てから <code>COMMIT;</code>（違えば <code>ROLLBACK;</code>）③直前にバックアップ ④AIが提案したSQLをそのまま本番で実行しない。', null, ['事故注意']),
      T('開発・本番のDBを分ける', 'Separate environments', 'ローカル（Supabase CLI・Docker）・ステージング・本番で別のDBを使う。本番のデータでテストしない。Neon・Supabaseのブランチ機能も便利。'),
      T('シードデータ', 'Seed data', '開発用の架空のデータを、スクリプトで何度でも入れ直せるようにしておく。本物の個人情報をコピーして使わない。', 'ローカル開発用のシードデータを作って。ユーザー10人・投稿50件・コメント100件を、日本語の自然なダミーデータで、何度実行しても同じ状態になるように。'),
      T('監査ログ・履歴テーブル', 'Audit log / history', '「誰が・いつ・何を・どう変えたか」を別テーブルに記録する。トリガーで自動記録できる。お金・権限・個人情報の変更は特に。'),
      T('個人情報の保護', 'Protecting personal data', '必要な情報だけ保存する、アクセスできる人を絞る（RLS）、重要なものは暗号化（pgsodium・アプリ側暗号化）、ログやバックアップにも残ることを意識する。'),
      T('データのエクスポートと削除依頼', 'Export / deletion requests', '利用者から「自分のデータが欲しい・消してほしい」と言われたときに、関連テーブルを漏れなく出力・削除できるようにしておく。外部キーの設計が効いてくる。'),
    ]),
  ]});

/* ================= 6. データ型・日付・お金 ================= */
TABS.push({ id:'types', label:'データ型・日付・お金', icon:'🔢',
  intro:'「1円ずれる」「9時間ずれる」「絵文字で文字数がおかしい」——データの<b>型</b>を正しく選ぶだけで防げるバグがたくさんあります。特に<b>お金・日時・文字数</b>は、AIもよく間違えるポイントです。',
  sections:[
    C('ずれる・おかしくなる理由を見る', [
      { name:'お金を小数で計算すると', en:'Floating point money', h:330, tags:['体験','事故注意'],
        demo:'<div class="kt"><div class="kt-row"><button type="button" class="kt-btn pri add">0.1ドルの商品をカートに追加</button><button type="button" class="kt-btn sm rs">空にする</button></div><div class="db-len"><div><span>小数（float）で合計</span><b class="f">0</b></div><div><span>整数（セント）で合計</span><b class="i">0</b></div></div><div class="kt-code js"></div><div class="kt-verdict res">何回か押してみてください。</div></div>',
        init:(el) => { let f = 0, c = 0, n = 0; const draw = () => { $(el, '.f').textContent = String(f); $(el, '.i').textContent = (c / 100).toFixed(2) + `（${c}セント）`; $(el, '.js').textContent = `// JavaScript\n0.1 + 0.2        // → ${0.1 + 0.2}\n0.1 * 3 === 0.3  // → ${0.1 * 3 === 0.3}`; const bad = Math.abs(f - c / 100) > 0 && String(f) !== (c / 100).toString(); $(el, '.res').className = 'kt-verdict res ' + (bad ? 'bad' : ''); $(el, '.res').innerHTML = n ? (bad ? `❌ ${n}個で <b>${f}</b>。小数は2進数で正確に表せないため、ごくわずかにずれます。合計・比較・端数処理で事故になります。` : `${n}個。今はたまたま一致していますが、もう少し押すと…`) : '何回か押してみてください。'; };
          $(el, '.add').onclick = () => { f += 0.1; c += 10; n++; draw(); }; $(el, '.rs').onclick = () => { f = 0; c = 0; n = 0; draw(); }; draw(); },
        desc:'コンピューターの小数（float / double / JavaScriptのnumber）は、<b>0.1 を正確に表せません</b>。お金は<b>最小単位の整数</b>（円・セント）で持つか、DBでは <code>numeric</code> / <code>decimal</code> 型を使います。消費税などの<b>端数処理（切り捨て・四捨五入）をいつ・どこで行うか</b>も決めて、計算結果を保存します。',
        prompt:'金額を扱っている箇所をすべて確認して、DBは integer（円）または numeric、JavaScript側も整数で計算するように直して。消費税の端数処理（切り捨て）のタイミングを統一し、関数にまとめて。' },
      { name:'タイムゾーンで9時間ずれる', en:'timestamp vs timestamptz', h:360, tags:['体験','事故注意'],
        demo:'<div class="kt"><div class="kt-row"><span class="kt-lbl">日本で入力した予約時刻</span><input type="datetime-local" class="kt-in dt" value="2026-11-03T10:00" style="width:auto" aria-label="予約時刻"></div><div class="kt-row"><span class="kt-lbl">DBの型</span><span class="sw"></span></div><div class="kt-code st"></div><div class="db-tz tz"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let tz = 1; const C3 = [['東京', 'Asia/Tokyo'], ['ロンドン', 'Europe/London'], ['ニューヨーク', 'America/New_York']];
          const fmt = (ms, zone) => new Intl.DateTimeFormat('ja-JP', { timeZone:zone, month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit' }).format(ms);
          const run = () => { const v = $(el, '.dt').value; if (!v) return; const [d, t] = v.split('T'), [y, mo, da] = d.split('-').map(Number), [h, mi] = t.split(':').map(Number);
            const real = Date.UTC(y, mo - 1, da, h - 9, mi); const shown = tz ? real : Date.UTC(y, mo - 1, da, h, mi); // タイムゾーンなしの値を、サーバー（UTC）がUTCとして読んでしまう
            $(el, '.st').textContent = tz ? `保存される値：${new Date(real).toISOString().replace('.000', '')}（UTCに直して保存。いつの時点かが一意に決まる）` : `保存される値：${d} ${t}:00（ゾーン情報なし）\n→ UTCで動くサーバーは「UTCの${t}」と解釈する`;
            $(el, '.tz').innerHTML = C3.map(([n, z], i) => `<div class="${!tz && i === 0 ? 'bad' : ''}">${n}<b>${fmt(shown, z)}</b></div>`).join('');
            $(el, '.res').className = 'kt-verdict res ' + (tz ? 'ok' : 'bad'); $(el, '.res').innerHTML = tz ? '✅ 東京では入力どおりの時刻、ほかの国ではその国の時刻で正しく表示されます。' : `❌ 東京の表示が <b>9時間後</b> にずれました。日本時間のつもりの値が、UTCとして扱われたためです。`; };
          $(el, '.sw').replaceWith(seg(['timestamp（ゾーンなし）', 'timestamptz'], k => { tz = k; run(); }, 1).el); $(el, '.dt').oninput = run; },
        desc:'日時は<b>「いつの瞬間か」が一意に決まる形</b>で保存します。PostgreSQLでは <code>timestamptz</code>（timestamp with time zone）を使い、内部的にはUTCで保存、表示するときに利用者のタイムゾーンに変換します。サーバー（Vercelなど）は普通UTCで動くので、ゾーンなしの値は日本時間とずれる原因になります。',
        prompt:'日時を扱う列をすべて timestamptz に統一し、保存はUTC、画面表示は利用者のタイムゾーン（日本なら Asia/Tokyo）で行うようにして。日付だけを扱う誕生日のような列は date 型にして。' },
      { name:'文字数の数え方', en:'String length & encoding', h:330, tags:['体験'],
        demo:'<div class="kt"><input class="kt-in s" value="Café👨‍👩‍👧🇯🇵ｶﾞ漢字" aria-label="文字列"><div class="db-len lens"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const run = () => { const s = $(el, '.s').value, seg2 = window.Intl && Intl.Segmenter ? [...new Intl.Segmenter('ja', { granularity:'grapheme' }).segment(s)].length : '—';
            $(el, '.lens').innerHTML = [['見た目の文字数', seg2], ['JavaScriptの .length', s.length], ['コードポイント数（PostgreSQLの length）', [...s].length], ['UTF-8のバイト数', new TextEncoder().encode(s).length]].map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('');
            $(el, '.res').innerHTML = '絵文字の家族（👨‍👩‍👧）や国旗は、<b>見た目1文字でも中身は複数</b>。「20文字以内」の判定は、何で数えるかを決めておきます。'; };
          $(el, '.s').oninput = run; run(); },
        desc:'同じ文字列でも、数え方で長さが変わります。JavaScriptの <code>.length</code> はUTF-16の単位、PostgreSQLの <code>length()</code> はコードポイント、MySQLの古い <code>utf8</code> は絵文字を保存できない（<code>utf8mb4</code> が必要）。入力の文字数制限は、<b>フロントとDBで同じ数え方</b>にそろえます。',
        prompt:'ニックネームの文字数制限（20文字）を、絵文字や結合文字も見た目どおり1文字として数えるようにして（Intl.Segmenter を使用）。DB側の制限（varchar や CHECK）とずれないようにして。' },
      { name:'NULL・空文字・0の違い', en:'NULL vs empty string vs zero', h:310, tags:['基本'],
        demo:'<div class="kt"><div class="db-cells3"><div><b class="null">NULL</b>値がない・不明</div><div><b>\'\'</b>空の文字列</div><div><b>0</b>ゼロという値</div></div><div class="kt-tblwrap t"></div></div>',
        init:(el) => { $(el, '.t').innerHTML = tbl(['調べ方', 'NULL', "''", '0'], [['= で比較', '× 常に不明', '○', '○'], ['IS NULL', '○', '×', '×'], ['COUNT(列)', '数えない', '数える', '数える'], ['SUM・AVG', '無視される', '—', '0として計算'], ['画面に出すと', '（空欄）null', '（空欄）', '0']]); },
        desc:'「電話番号が未登録」はNULL、「入力欄を空で送った」は空文字、「いいね0件」は0。<b>意味が違う</b>ので混ぜないこと。どれを使うか決めておかないと、検索や集計の結果がずれます。未入力を表すならNULLに統一するのが一般的。',
        prompt:'このテーブルの各列について、未入力のときに NULL・空文字・0 のどれを入れるかを統一して。フォームから空文字が送られてきたら NULL に変換する処理も入れて。' },
    ], null, true),
    { title:'よく使うデータ型', note:'名前はDBごとに少し違います。迷ったら PostgreSQL（Supabase）の型で考えると、AIへの指示もぶれません。',
      table:{ head:['用途', 'PostgreSQL', 'MySQL', 'SQLite', 'メモ'], rows:[
        ['ID（連番）', 'bigint identity', 'BIGINT AUTO_INCREMENT', 'INTEGER PRIMARY KEY', 'int（約21億まで）より bigint が安心'],
        ['ID（UUID）', 'uuid', 'CHAR(36) / BINARY(16)', 'TEXT', 'Supabaseのユーザーはuuid'],
        ['整数', 'integer / bigint', 'INT / BIGINT', 'INTEGER', '個数・円の金額'],
        ['お金・正確な小数', 'numeric(12, 2)', 'DECIMAL(12, 2)', 'INTEGER（最小単位で）', 'floatは使わない'],
        ['小数（誤差OK）', 'double precision', 'DOUBLE', 'REAL', '緯度経度・スコアなど'],
        ['文字列', 'text', 'VARCHAR(n) / TEXT', 'TEXT', 'PostgreSQLはtextで十分（長さはCHECKで）'],
        ['真偽値', 'boolean', 'TINYINT(1)', 'INTEGER（0/1）', 'is_ で始まる列名に'],
        ['日付', 'date', 'DATE', 'TEXT（YYYY-MM-DD）', '誕生日・締め切り日'],
        ['日時', 'timestamptz', 'DATETIME / TIMESTAMP', 'TEXT（ISO 8601）', 'UTCで保存'],
        ['JSON', 'jsonb', 'JSON', 'TEXT（json関数）', '検索するなら jsonb'],
        ['選択肢', 'text + CHECK / enum', 'ENUM', 'TEXT + CHECK', '値の追加のしやすさで選ぶ'],
        ['配列', 'text[] など', '—（JSON）', '—（JSON）', '本格的に使うなら別テーブル'],
        ['ファイル', '—（ストレージへ）', '—', '—', 'DBにはURL・パスだけ'],
      ]}},
    S('型と形式の注意点', [
      T('IDは bigint で', 'int overflow', 'int（integer）の上限は約21億。ログやイベントのように増え続ける表では足りなくなることがある。連番IDは最初から bigint に。'),
      T('先頭が0の番号は文字列で', 'Leading zeros', '郵便番号（012-3456）・電話番号・会員番号を数値型にすると、先頭の0が消える。計算しない番号は文字列で保存する。', null, ['ハマりどころ']),
      T('日時の書き方は ISO 8601', 'ISO 8601', '<code>2026-10-27T09:00:00+09:00</code> の形。並べ替え・比較・APIのやり取りで誤解が起きない。'),
      T('Unix時間', 'Unix time / epoch', '1970年1月1日からの秒数（またはミリ秒）。JavaScriptの Date.now() はミリ秒、多くのAPIは秒。単位の取り違えに注意。'),
      T('2038年問題', 'Year 2038 problem', '秒数を32ビットで保存すると、2038年1月19日に桁あふれする。今の主なDB・言語は対策済みだが、古い仕組みとの連携で注意。'),
      T('文字コードは UTF-8（utf8mb4）', 'Character encoding', '日本語・絵文字を扱うならUTF-8。MySQLは utf8mb4 を選ぶ。CSVを書き出すときは、Excel向けにBOM付きUTF-8にすると文字化けしにくい。'),
      T('照合順序', 'Collation', '並べ替えや比較のルール（大文字小文字・アクセント記号・ひらがなカタカナを同じ扱いにするか）。メールアドレスの重複チェックは小文字にそろえてから。'),
      T('ENUM か参照テーブルか', 'Enum vs lookup table', '値の種類が固定（status）なら CHECK制約やENUM、管理画面から増やしたい（カテゴリ）なら参照テーブルにする。'),
      T('JSONB', 'Binary JSON', 'PostgreSQLのJSON型。中の値で検索・インデックス作成ができる。設定や外部APIの生データ向け。'),
      T('緯度経度・地図データ', 'Geo data', '単純な表示なら double precision 2列。距離での検索・範囲検索が必要なら PostGIS（Supabaseで有効化できる）。'),
      T('大きな文章・HTML', 'Large text', 'text に保存できるが、一覧では本文を取らない（SELECT * をしない）。Markdownで保存して表示時に変換するのが扱いやすい。'),
    ]),
  ]});

/* ================= 7. サービス・道具 ================= */
const FS = [['users', 'col', [['sato', 'doc', [['name: "佐藤"', 'fld'], ['todos', 'col', [['t1', 'doc', [['title: "牛乳を買う"', 'fld'], ['done: false', 'fld']]], ['t2', 'doc', [['title: "歯医者"', 'fld']]]]]]], ['suzuki', 'doc', [['name: "鈴木"', 'fld']]]]], ['posts', 'col', [['p1', 'doc', [['title: "はじめての…"', 'fld'], ['authorId: "sato"', 'fld'], ['authorName: "佐藤"', 'fld']]]]]];
TABS.push({ id:'services', label:'サービス・道具', icon:'☁',
  intro:'DBは自分でサーバーを立てなくても、クラウドのサービスを使えばすぐに使えます。よく使うサービス、DBを操作するライブラリ（ORM）、中身を見る道具をまとめました。（料金・無料枠は変わるので公式で確認してください）',
  sections:[
    C('サービスごとの考え方', [
      { name:'Firestore（ドキュメント型）の形', en:'Collections & documents', h:360, tags:['Firebase','体験'],
        demo:'<div class="kt"><div class="db-tree kt-grow t"></div><div class="kt-note">▶ をクリックで開く／閉じる。<b>コレクション</b>（青）の中に<b>ドキュメント</b>（紫）、その中にフィールドやサブコレクション。</div></div>',
        init:(el) => { const render = (nodes, d) => nodes.map(([n, k, ch], i) => { const id = `${d}-${i}`; return `<div style="padding-left:${d * 14}px">${ch ? `<span class="tg" data-id="${id}" style="cursor:pointer">▾</span> ` : '　'}<span class="${k}">${k === 'col' ? '📁 ' : k === 'doc' ? '📄 ' : ''}${esc(n)}</span></div>${ch ? `<div data-k="${id}">${render(ch, d + 1)}</div>` : ''}`; }).join('');
          $(el, '.t').innerHTML = render(FS, 0); $$(el, '.tg').forEach(t => t.onclick = () => { const box = $(el, `[data-k="${t.dataset.id}"]`), open = box.style.display !== 'none'; box.style.display = open ? 'none' : ''; t.textContent = open ? '▸' : '▾'; }); },
        desc:'Firestoreは表ではなく、<b>コレクション（フォルダ）とドキュメント（JSONのファイル）</b>の入れ子でデータを持ちます。JOINがないので、画面に必要な情報（authorName など）を<b>あえて重複して持たせる</b>のが普通。読み取り回数で課金されるので、「1画面で何回読むか」を意識して設計します。',
        prompt:'このアプリのデータを Firestore で設計して。コレクション構成、サブコレクションにするか別コレクションにするか、非正規化して持たせる項目、必要な複合インデックス、セキュリティルールまで提案して。' },
    ]),
    { title:'データベースのサービス', table:{ head:['サービス', '種類', '特徴', '向いている用途'], rows:[
      ['Supabase', 'PostgreSQL＋認証・ストレージ・Realtime', 'SQL・RLS・管理画面・Edge Functions が一式。オープンソース', 'Webアプリ全般（バイブコーディングの定番）'],
      ['Firebase（Firestore）', 'ドキュメント型', 'リアルタイム同期・オフライン対応・Googleの各種サービス', 'スマホアプリ・チャット'],
      ['Neon', 'サーバーレス PostgreSQL', 'ブランチ（DBの複製）を一瞬で作れる。使わない間は停止', 'Vercelと組み合わせたWebアプリ'],
      ['Turso / Cloudflare D1', 'SQLite（エッジ）', '軽くて安い。利用者の近くで動く', '小〜中規模・読み取り中心'],
      ['PlanetScale', 'MySQL互換（Vitess）・PostgreSQL', '大規模向けのブランチ・スキーマ変更の仕組み', '本格的なサービス'],
      ['MongoDB Atlas', 'ドキュメント型', '柔軟なJSONデータ・全文検索・ベクトル検索', 'データの形が変わりやすいもの'],
      ['Upstash（Redis）', 'キー・バリュー', 'サーバーレスで使えるRedis。回数制限ライブラリも', 'キャッシュ・回数制限・キュー'],
      ['Convex', 'リアクティブなバックエンド', 'TypeScriptで関数を書くとDBと画面が自動で同期', 'リアルタイムな共同作業アプリ'],
      ['PocketBase', 'SQLite＋認証の単体アプリ', 'ファイル1つで起動する小さなBaaS', '個人ツール・社内向け'],
    ]}},
    { title:'DBを操作するライブラリ（ORMなど）', table:{ head:['名前', '言語', '特徴'], rows:[
      ['Supabase クライアント', 'JavaScript / Python / Dart など', 'SQLを書かずに .from().select() で操作。RLSと組み合わせてブラウザからも使える'],
      ['Prisma', 'TypeScript', 'schema.prisma に定義を書くと、型付きのクライアントとマイグレーションを生成。AIも書き慣れている'],
      ['Drizzle ORM', 'TypeScript', 'SQLに近い書き方で軽量。サーバーレス・エッジと相性がよい'],
      ['Kysely', 'TypeScript', '型安全なクエリビルダー（SQLを組み立てる道具）'],
      ['SQLAlchemy', 'Python', 'Pythonの定番。FastAPIと組み合わせることが多い'],
      ['Django ORM', 'Python', 'Djangoに内蔵。モデルを書くと管理画面まで自動'],
      ['Firebase SDK', 'JavaScript / Swift / Kotlin など', 'Firestore・Authentication を操作'],
    ]}},
    { title:'中身を見る・設計する道具', table:{ head:['道具', '用途'], rows:[
      ['Supabase Studio（管理画面）', 'テーブル編集・SQLエディタ・RLSポリシー・ログ'],
      ['Prisma Studio / Drizzle Studio', 'ORMの定義に沿ってデータを閲覧・編集'],
      ['TablePlus / DBeaver / pgAdmin', 'いろいろなDBにつないで中身を見るアプリ'],
      ['DB Browser for SQLite', 'SQLiteファイルを開いて見る'],
      ['dbdiagram.io / drawSQL', 'ER図を描いてSQLを出力'],
      ['Mermaid（erDiagram）', 'テキストでER図を書ける。GitHubのREADMEやAIとのやり取りで便利'],
    ]}},
    S('コードの書き方の例', [
      T('Supabaseで読む・書く', 'supabase-js', '関連テーブルは select の中に書くと、JOINのように一緒に取得できる。', 'Supabaseで、記事一覧を作者名とタグ付きで、公開済み・新しい順に20件取得するコードを書いて。', null, { code:"// 記事と作者とタグをまとめて取得（外部キーをたどる）\nconst { data, error } = await supabase\n  .from('posts')\n  .select('id, title, created_at, author:users(name), tags(name)')\n  .eq('published', true)\n  .order('created_at', { ascending: false })\n  .limit(20);\n\nawait supabase.from('posts').insert({ title: '新しい記事' });\nawait supabase.from('posts').update({ title: '修正' }).eq('id', 1);\nawait supabase.from('posts').delete().eq('id', 1);" }),
      T('Prismaのスキーマ', 'schema.prisma', 'モデルを書くと型・マイグレーション・クライアントが作られる。', null, null, { code:'model User {\n  id        String   @id @default(uuid())\n  email     String   @unique\n  posts     Post[]\n  createdAt DateTime @default(now())\n}\n\nmodel Post {\n  id        Int      @id @default(autoincrement())\n  title     String\n  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)\n  authorId  String\n  @@index([authorId])\n}' }),
      T('DrizzleのスキーマとSQL風の書き方', 'Drizzle ORM', 'TypeScriptでテーブルを定義し、SQLに近い形で問い合わせる。', null, null, { code:"export const posts = pgTable('posts', {\n  id: serial('id').primaryKey(),\n  userId: uuid('user_id').notNull().references(() => users.id),\n  title: text('title').notNull(),\n});\n\nconst rows = await db.select().from(posts)\n  .where(eq(posts.userId, userId))\n  .orderBy(desc(posts.id)).limit(20);" }),
      T('MermaidでER図を書く', 'Mermaid erDiagram', 'テキストで書けるER図。AIに「Mermaidで」と頼むと、GitHubやNotionでそのまま図になる。', 'このアプリのテーブル設計を Mermaid の erDiagram で書いて。主キー・外部キー・関係（1対多など）も入れて。', ['おすすめ'], { code:'erDiagram\n  users ||--o{ posts : "書く"\n  posts ||--o{ comments : "持つ"\n  posts }o--o{ tags : "付く"\n  users {\n    uuid id PK\n    text email\n  }\n  posts {\n    bigint id PK\n    uuid user_id FK\n    text title\n  }' }),
      T('型を自動生成する', 'Generated types', 'Supabaseは <code>supabase gen types typescript</code> でDBの型定義を作れる。テーブル名・列名の打ち間違いをエディタが教えてくれる。', 'Supabase CLI でデータベースの型定義（TypeScript）を生成し、supabase クライアントに型を付けて。スキーマ変更時に再生成するスクリプトも package.json に追加して。'),
      T('リアルタイムに受け取る', 'Realtime subscription', 'DBの変更を画面に即反映。チャット・通知・共同編集で使う。', null, null, { code:"supabase.channel('room-1')\n  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'room_id=eq.1' },\n      (payload) => addMessage(payload.new))\n  .subscribe();" }),
      T('DBの関数を呼ぶ（RPC）', 'Postgres function / rpc', '複数のテーブルをまとめて更新する処理（トランザクション）を、DBの関数にして1回で呼ぶ。', null, null, { code:"-- SQL（DBに関数を作る）\ncreate function place_order(p_product bigint, p_qty int) returns bigint\nlanguage plpgsql security invoker as $$\ndeclare oid bigint;\nbegin\n  update products set stock = stock - p_qty where id = p_product and stock >= p_qty;\n  if not found then raise exception 'out of stock'; end if;\n  insert into orders (user_id, product_id, qty) values (auth.uid(), p_product, p_qty) returning id into oid;\n  return oid;\nend $$;\n\n// JavaScript\nconst { data, error } = await supabase.rpc('place_order', { p_product: 3, p_qty: 1 });" }),
    ]),
  ]});

/* ================= 8. AIへの頼み方・エラー ================= */
TABS.push({ id:'ai', label:'AIへの頼み方・エラー', icon:'✎',
  intro:'DBまわりをAIに頼むときは、<b>使っているDB（PostgreSQL / Supabase など）・今のテーブル構成・やりたいこと</b>の3つを渡すと精度が上がります。よく出るエラーの意味も、メッセージで検索できます。',
  sections:[
    S('AIへの頼み方', [
      T('設計を一緒に考えてもらう', 'Schema design', 'いきなりコードを書かせず、まず設計を出してもらってレビューする。', 'これから作るアプリの機能一覧を渡します。PostgreSQL（Supabase）で、テーブル・列・型・制約・関係を提案して、Mermaid のER図も付けて。不明点や決めるべきことがあれば、先に質問して：（機能一覧）', ['おすすめ']),
      T('今の構成を伝える', 'Share your schema', 'AIは今のDBの形を知らない。スキーマを貼るのが一番の近道。', '現在のスキーマを貼ります（supabase db dump --schema-only の結果、または schema.prisma）。これを前提に、〇〇機能に必要な変更をマイグレーションで提案して。'),
      T('マイグレーションを作ってもらう', 'Write a migration', '変更は必ずファイルとして。', 'posts テーブルに「予約投稿」のための published_at（timestamptz, null可）を追加するマイグレーションを、Supabase CLI の形式で作って。既存データの扱いと、戻すためのSQLも書いて。'),
      T('RLSポリシーを書いてもらう', 'RLS policies', '「誰が・何を・どうできるか」を言葉で渡す。', '次のルールでRLSポリシーを書いて：投稿は公開済みなら誰でも閲覧可、下書きは本人だけ閲覧可、作成・更新・削除は本人だけ。管理者（profiles.role = admin）はすべて可。'),
      T('遅いクエリを直してもらう', 'Query optimization', 'EXPLAIN ANALYZE の結果が一番のヒント。', 'このクエリが遅いです（データ件数：約〇万件）。EXPLAIN ANALYZE の結果を貼るので、原因と、インデックス追加またはクエリの書き換えを提案して。'),
      T('SQLを説明してもらう', 'Explain SQL', 'AIが書いたSQLは、実行前に説明してもらう。', 'このSQLが何をするか、どのテーブルのどの行に影響するかを、実行前に日本語で説明して。データが消えたり大量に更新されたりする危険があれば教えて。', ['事故防止']),
      T('ダミーデータを作ってもらう', 'Seed data', '画面の確認・性能テスト用。', '開発用のシードSQLを作って。ユーザー20人、投稿100件（日付は過去3か月に分散）、コメント300件。日本語の自然な内容で、外部キーの整合性を保って。'),
      T('データ移行を計画してもらう', 'Data migration', 'スプレッドシートや別サービスからの移行。', 'Googleスプレッドシートの顧客リスト（列：…）を、Supabase の customers テーブルに移行したい。重複・表記ゆれ（全角半角・空白）の整理方法と、移行スクリプト（Node.js）を作って。'),
      T('ER図にしてもらう', 'Diagram', '設計の確認・共有に。', '今のスキーマを Mermaid の erDiagram にして。テーブルが多いので、機能ごと（認証・投稿・決済）に分けて描いて。'),
    ]),
    S('よく出るエラー', [
      E('relation "posts" does not exist', 'PostgreSQL / Supabase', 'テーブル（またはビュー）が見つからない。', 'テーブル名の打ち間違い、マイグレーション未適用、スキーマ（public 以外）の指定漏れ、大文字を含む名前（"Posts" はダブルクォートが必要）を確認。', 'relation "xxx" does not exist というエラーが出ます。マイグレーションの適用状況とテーブル名を確認して、原因を特定して。'),
      E('column "user_id" does not exist', 'PostgreSQL', '列が見つからない。', '列名の打ち間違い、別のテーブルの列を指している、文字列の値をダブルクォートで囲んでいる（PostgreSQLでは文字列はシングルクォート）。'),
      E('duplicate key value violates unique constraint', 'PostgreSQL', '重複してはいけない列に、同じ値を入れようとした。', '既存データを確認。登録済みなら更新する（upsert）。連番がずれている場合はシーケンスの調整。二重送信ならボタンの連打防止とべき等性。'),
      E('insert or update on table "posts" violates foreign key constraint', 'PostgreSQL', '参照先（例：users）に存在しないIDを入れようとした。', '親のデータを先に作る、IDの取り違え、テストデータの順番を確認。'),
      E('update or delete on table "users" violates foreign key constraint', 'PostgreSQL', '他のテーブルから参照されている行を消そうとした。', '子のデータを先に消すか、外部キーに ON DELETE CASCADE / SET NULL を設定するか決める（「テーブル設計」タブ参照）。'),
      E('null value in column "title" violates not-null constraint', 'PostgreSQL', '空にできない列に値を入れていない。', 'フォームの送信内容、列名の打ち間違い、DEFAULT の設定を確認。'),
      E('new row violates row-level security policy for table', 'Supabase', 'RLSのポリシーで、その追加・更新が許可されていない。', 'INSERT用のポリシー（with check）があるか、user_id に auth.uid() と同じ値を入れているか、ログイン状態で呼んでいるかを確認。', 'Supabase で new row violates row-level security policy というエラーが出ます。テーブルのポリシーと、insert しているコードを見て原因を教えて。'),
      E('permission denied for table', 'PostgreSQL / Supabase', 'そのDBユーザー（ロール）にテーブルの権限がない。', '新しく作ったテーブルの権限（GRANT）、スキーマの設定、anon / authenticated ロールへの権限を確認。'),
      E('JSON object requested, multiple (or no) rows returned', 'Supabase（PGRST116）', '.single() を使ったのに、結果が0件または2件以上だった。', '0件があり得るなら .maybeSingle() を使う。RLSで見えていないだけの場合もある。'),
      E('remaining connection slots are reserved / too many connections', 'PostgreSQL', 'DBへの同時接続数が上限に達した。', 'サーバーレス環境ではプーラー（Supabaseなら6543番ポート）を使う。接続を閉じ忘れていないか、クライアントを毎回作り直していないか確認。'),
      E('deadlock detected', 'PostgreSQL', '2つの処理がお互いのロックを待って止まった。', '更新する順番をそろえる、トランザクションを短くする、失敗したら再試行する。'),
      E('value too long for type character varying(50)', 'PostgreSQL', '文字数の上限を超えた。', '入力側で文字数を制限する（同じ数え方で）。上限自体を見直すなら text 型＋CHECK制約に。'),
      E('invalid input syntax for type uuid', 'PostgreSQL', 'uuid型の列に、uuidの形でない値（"undefined" や数値）を入れた。', 'URLのパラメータが取れていない、ログイン前で user.id が空、などを確認。'),
      E('SQLITE_BUSY: database is locked', 'SQLite', '別の処理が書き込み中でロックされている。', '書き込みを1か所にまとめる、WALモードを有効にする、同時書き込みが多いならPostgreSQLを検討。'),
      E('P2002 Unique constraint failed', 'Prisma', '一意制約違反（重複）。', '上の duplicate key と同じ。upsert や事前チェックを使う。'),
      E('P2025 Record to update not found', 'Prisma', '更新・削除しようとした行が存在しない。', 'IDの取り違え、すでに削除済み、where条件（所有者チェック）で除外されている。'),
      E('P1001 Can\'t reach database server', 'Prisma', 'DBに接続できない。', 'DATABASE_URL の打ち間違い、パスワードの記号のURLエンコード、DBが停止中（無料プランの一時停止）、ネットワーク制限を確認。'),
      E('The query requires an index', 'Firestore', '複数条件の並べ替え・絞り込みに必要な複合インデックスがない。', 'エラーメッセージのリンクから、そのまま作成できる。'),
      E('Missing or insufficient permissions', 'Firestore', 'セキュリティルールで拒否された。', 'ルールの条件、ログイン状態、読もうとしているパスを確認。テストモードの期限切れでも起きる。'),
      E('Drift detected: Your database schema is not in sync with your migration history', 'Prisma / マイグレーション', 'DBを直接変更したため、マイグレーションの履歴と実際のDBがずれた。', '開発DBならリセット。本番なら差分を確認し、ずれを解消するマイグレーションを作る。DBを管理画面で直接変更しない。', 'Prisma で Drift detected のエラーが出ます。本番データを消さずに、マイグレーション履歴とDBのずれを解消する手順を教えて。'),
    ]),
  ]});
})();
