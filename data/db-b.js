/* データベース・データ設計辞典 — B: SQL入門（実行できる） / 速さ・インデックス */
(function(){
const { $, $$, esc, tbl, seg } = KIT;
const { S, C, T, Q, newDB } = window.DBH;

/* ---- JOINのベン図 ---- */
const JOIN_BASE = `CREATE TABLE members (id INTEGER PRIMARY KEY, name TEXT);
INSERT INTO members VALUES (1,'佐藤'),(2,'鈴木'),(3,'高橋');
CREATE TABLE entries (id INTEGER PRIMARY KEY, member_id INTEGER, event TEXT);
INSERT INTO entries VALUES (1,1,'セミナー'),(2,1,'勉強会'),(3,2,'セミナー'),(4,9,'勉強会');`;
const JOINS = [['INNER', '両方にあるものだけ', 'i'], ['LEFT', '左（会員）は全部＋合うもの', 'l'], ['RIGHT', '右（申込）は全部＋合うもの', 'r'], ['FULL', '両方全部', 'f']];
const venn = (k) => `<svg class="db-venn" viewBox="0 0 150 86"><defs><clipPath id="vcl${k}"><circle cx="58" cy="43" r="36"/></clipPath></defs>${k === 'l' || k === 'f' ? '<circle class="f" cx="58" cy="43" r="36"/>' : ''}${k === 'r' || k === 'f' ? '<circle class="f" cx="92" cy="43" r="36"/>' : ''}<circle class="f" cx="92" cy="43" r="36" clip-path="url(#vcl${k})" style="opacity:${k === 'i' ? .75 : 0}"/><circle cx="58" cy="43" r="36"/><circle cx="92" cy="43" r="36"/><text x="30" y="47" style="font:700 10px var(--font);fill:var(--stage-ink)">会員</text><text x="104" y="47" style="font:700 10px var(--font);fill:var(--stage-ink)">申込</text></svg>`;
/* ---- 実行順序 ---- */
const U = [['佐藤', 28, '東京'], ['鈴木', 35, '大阪'], ['高橋', 22, '東京'], ['田中', 41, '福岡'], ['伊藤', null, '札幌'], ['渡辺', 30, '大阪']];
const ORDER = [
  ['FROM users', 'まず<b>どの表から</b>取るかを決めます。全6行が対象。', () => [['name', 'age', 'city'], U]],
  ['WHERE age >= 25', '条件に合う<b>行だけを残します</b>。高橋（22）と、年齢がNULLの伊藤が外れます（NULLは比較できない）。', () => [['name', 'age', 'city'], U.filter(r => r[1] >= 25)]],
  ['GROUP BY city', '同じ city ごとに<b>グループにまとめます</b>。', () => [['city', '含まれる人'], [['東京', '佐藤'], ['大阪', '鈴木, 渡辺'], ['福岡', '田中']]]],
  ['HAVING COUNT(*) >= 1', '<b>グループに対する条件</b>。集計した結果で絞るときは WHERE ではなく HAVING。', () => [['city', '含まれる人'], [['東京', '佐藤'], ['大阪', '鈴木, 渡辺'], ['福岡', '田中']]]],
  ['SELECT city, COUNT(*) AS 人数', 'ここで初めて<b>表示する列が決まります</b>。AS で付けた名前は、この後の ORDER BY で使えます（WHERE では使えない）。', () => [['city', '人数'], [['東京', 1], ['大阪', 2], ['福岡', 1]]]],
  ['ORDER BY 人数 DESC', '<b>並べ替え</b>。DESC は大きい順。', () => [['city', '人数'], [['大阪', 2], ['東京', 1], ['福岡', 1]]]],
  ['LIMIT 2', '最後に<b>件数を絞ります</b>。', () => [['city', '人数'], [['大阪', 2], ['東京', 1]]]],
];

TABS.push({ id:'sql', label:'SQL入門（実行できる）', icon:'⌨',
  intro:'すべてのSQLは<b>書き換えて「▶ 実行」</b>できます（Ctrl+Enterでも実行）。中身はブラウザで動く本物のSQLiteで、デモごとに新しいデータベースを使うので、DELETEしても大丈夫。「元に戻す」で最初の状態に戻ります。使えるテーブル：<code>users</code>・<code>posts</code>・<code>comments</code>・<code>tags</code>・<code>post_tags</code>・<code>products</code>・<code>orders</code>。',
  sections:[
    C('まず全体像', [
      { name:'SQLが実行される順番', en:'Logical query order', h:400, tags:['理解のコツ'],
        demo:'<div class="kt"><div class="kt-code q"></div><div class="db-order ord"></div><div class="kt-tblwrap kt-grow t"></div><div class="kt-verdict nt"></div><div class="kt-row"><button type="button" class="kt-btn sm prev">◀ 戻る</button><button type="button" class="kt-btn sm pri next">次へ ▶</button></div></div>',
        init:(el) => { let k = 0; $(el, '.q').innerHTML = KIT.hlSQL('SELECT city, COUNT(*) AS 人数\nFROM users\nWHERE age >= 25\nGROUP BY city\nHAVING COUNT(*) >= 1\nORDER BY 人数 DESC\nLIMIT 2;');
          const draw = () => { $(el, '.ord').innerHTML = ORDER.map((o, i) => `<span class="${i === k ? 'on' : i < k ? 'done' : ''}">${i + 1}. ${o[0].split(' ')[0]}${o[0].startsWith('GROUP') || o[0].startsWith('ORDER') ? ' BY' : ''}</span>`).join(''); const [h, rows] = ORDER[k][2](); $(el, '.t').innerHTML = tbl(h, rows); $(el, '.nt').innerHTML = `<b>${ORDER[k][0]}</b>：${ORDER[k][1]}`; $(el, '.next').textContent = k === ORDER.length - 1 ? '最初から ↺' : '次へ ▶'; };
          $(el, '.prev').onclick = () => { if (k > 0){ k--; draw(); } }; $(el, '.next').onclick = () => { k = k === ORDER.length - 1 ? 0 : k + 1; draw(); }; draw(); },
        desc:'SQLは書く順番（SELECT が先頭）と、<b>DBが処理する順番</b>（FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT）が違います。これを知っていると「WHEREで集計結果が使えない」「別名がWHEREで使えない」理由が分かります。',
        prompt:'このSQLが、FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT の順でどう処理されるか、途中の結果の表を見せながら説明して：（SQLを貼る）' },
      { name:'JOIN（表をつなぐ）の種類', en:'INNER / LEFT / RIGHT / FULL JOIN', h:400, tags:['体験','本物のSQL'],
        demo:'<div class="kt"><div class="kt-row"><span class="sw"></span></div><div class="kt-row" style="flex-wrap:nowrap;align-items:center"><span class="vn"></span><div class="kt-code q" style="flex:1;min-width:0"></div></div><div class="db-res kt-grow out"></div><div class="kt-note nt"></div></div>',
        init:(el) => { let db = null, cur = 0;
          const run = () => { const [k, note, v] = JOINS[cur]; const sql = `SELECT m.name AS 会員, e.event AS 申込\nFROM members m\n${k} JOIN entries e ON e.member_id = m.id;`; $(el, '.vn').innerHTML = venn(v); $(el, '.q').innerHTML = KIT.hlSQL(sql); $(el, '.nt').innerHTML = `<b>${k} JOIN</b>：${note}。会員3人（高橋は申込なし）、申込4件（1件は退会した会員9の申込）。`;
            if (!db) return; try{ const r = db.exec(sql)[0]; $(el, '.out').innerHTML = `<div class="meta">${r.values.length}行</div>` + tbl(r.columns, r.values, { cls:(row) => row.includes(null) ? 'hl' : '' }); }catch(e){ $(el, '.out').innerHTML = `<div class="err">${esc(e.message)}</div>`; } };
          $(el, '.sw').replaceWith(seg(JOINS.map(j => j[0]), i => { cur = i; run(); }).el);
          newDB('', JOIN_BASE).then(d => { db = d; run(); }, () => $(el, '.out').innerHTML = '<div class="err">SQLエンジンを読み込めませんでした（インターネット接続が必要です）。</div>');
          return () => db && db.close(); },
        desc:'<b>INNER</b>＝両方に相手がいる行だけ。<b>LEFT</b>＝左の表は全部残し、相手がいなければNULL（「投稿0件のユーザーも一覧に出す」ときに使う）。<b>RIGHT</b>はその逆、<b>FULL</b>は両方全部。色の付いた行がNULLを含む行です。迷ったら INNER と LEFT だけ覚えれば十分です。',
        prompt:'ユーザー一覧に、投稿数と最新の投稿日を付けて表示したい。投稿が0件のユーザーも表示されるように LEFT JOIN と GROUP BY を使ったSQLと、Supabaseのクエリを書いて。' },
    ], null, true),
    C('SELECT：データを読む', [
      Q('全部取り出す', 'SELECT *', 'SELECT * FROM users;', '<code>*</code> は「全部の列」。動作確認には便利だが、アプリでは<b>必要な列だけ</b>を書く方が速く安全（パスワードのハッシュなどを誤って返さない）。', null, { tags:['基本'], h:300 }),
      Q('列を選んで名前を付ける', 'SELECT columns AS alias', 'SELECT name AS 名前, city AS 住まい\nFROM users;', '欲しい列だけをカンマ区切りで。<code>AS</code> で表示用の名前（別名）を付けられる。', null, { h:300 }),
      Q('条件で絞る（WHERE）', 'WHERE', 'SELECT name, age\nFROM users\nWHERE age >= 30;', '<code>=</code>・<code>&lt;&gt;</code>（等しくない）・<code>&gt;=</code> などで条件を書く。文字列はシングルクォートで囲む。', '30歳以上のユーザーの名前と年齢を、年齢の高い順に取得するSQLを書いて。', { h:300 }),
      Q('AND・OR・IN', 'Combining conditions', "SELECT name, city, age\nFROM users\nWHERE city IN ('東京', '大阪')\n  AND age < 35;", '<code>AND</code>（かつ）・<code>OR</code>（または）・<code>IN (…)</code>（どれか）。AND と OR を混ぜるときは<b>カッコで明示</b>しないと意図と違う結果になりやすい。', null, { h:320 }),
      Q('あいまい検索（LIKE）', 'LIKE / wildcard', "SELECT title\nFROM posts\nWHERE title LIKE '%SQL%'\n   OR title LIKE '%Supabase%';", '<code>%</code> は「何文字でも」、<code>_</code> は「1文字」。前後に % を付けた検索はインデックスが効かず、データが増えると遅い（全文検索を検討）。', null, { h:320 }),
      Q('期間で絞る（BETWEEN）', 'BETWEEN / dates', "SELECT title, created_at\nFROM posts\nWHERE created_at BETWEEN '2026-06-01' AND '2026-06-30';", '日付は <code>YYYY-MM-DD</code>（ISO 8601）形式で保存すると、文字列のままでも正しく比較・並べ替えできる。BETWEEN は両端を含む。', null, { h:320 }),
      Q('NULLの扱い', 'IS NULL / COALESCE', "SELECT name, age,\n  age IS NULL AS 年齢未登録,\n  COALESCE(age, 0) AS 年齢_0補完\nFROM users;\n-- WHERE age = NULL は常に「該当なし」になる。IS NULL を使う", '<b>NULLは「不明」</b>なので、<code>= NULL</code> では比較できない（必ず IS NULL / IS NOT NULL）。<code>COALESCE(列, 代わりの値)</code> でNULLを置き換えられる。', 'このクエリで、NULLの値があっても正しく比較・集計・表示されるように、IS NULL と COALESCE を使って直して。', { tags:['ハマりどころ'], h:340 }),
      Q('並べ替えと件数（ORDER BY・LIMIT）', 'ORDER BY / LIMIT / OFFSET', 'SELECT title, likes\nFROM posts\nORDER BY likes DESC\nLIMIT 3;', '<code>DESC</code>＝大きい順、<code>ASC</code>＝小さい順（省略時）。<code>LIMIT 3 OFFSET 3</code> で「4〜6件目」。ページ送りに使う（大量データでは「速さ」タブのカーソル方式も参照）。', null, { h:300 }),
      Q('重複を除く（DISTINCT）', 'DISTINCT', 'SELECT DISTINCT city\nFROM users\nORDER BY city;', '同じ値が何度も出るときに1つにまとめる。'),
      Q('場合分け（CASE）', 'CASE WHEN', "SELECT title, likes,\n  CASE WHEN likes >= 100 THEN '人気'\n       WHEN likes >= 50 THEN 'まずまず'\n       ELSE 'これから' END AS 評価\nFROM posts;", '条件によって表示する値を変える。SQLの中の if 文。', null, { h:340 }),
    ], 'すべて書き換えて実行できます。'),
    C('集計する', [
      Q('数える・合計・平均', 'COUNT / SUM / AVG / MAX / MIN', 'SELECT COUNT(*) AS 記事数,\n  SUM(likes) AS 合計いいね,\n  ROUND(AVG(likes), 1) AS 平均,\n  MAX(likes) AS 最高\nFROM posts\nWHERE published = 1;', '<b>集計関数</b>は、たくさんの行を1つの値にまとめる。<code>COUNT(*)</code> は行数、<code>COUNT(列)</code> はNULL以外の数。', 'ダッシュボードに表示する「総ユーザー数・今月の新規登録数・公開記事数・合計いいね数」を1回のクエリで取得するSQLを書いて。', { h:340 }),
      Q('グループごとに集計（GROUP BY）', 'GROUP BY', 'SELECT city, COUNT(*) AS 人数, AVG(age) AS 平均年齢\nFROM users\nGROUP BY city\nORDER BY 人数 DESC;', '同じ値ごとにまとめて集計する。<b>SELECT に書く列は、GROUP BY した列か集計関数だけ</b>（PostgreSQLはこのルールに厳しい）。', null, { h:320 }),
      Q('集計結果で絞る（HAVING）', 'HAVING', 'SELECT user_id, COUNT(*) AS 記事数\nFROM posts\nGROUP BY user_id\nHAVING COUNT(*) >= 2;', 'WHERE は集計<b>前</b>の行の条件、HAVING は集計<b>後</b>のグループの条件。「2件以上書いた人」はHAVING。', null, { h:320 }),
    ]),
    C('JOIN：表をつなぐ', [
      Q('2つの表をつなぐ', 'JOIN … ON', 'SELECT p.title, u.name AS 書いた人\nFROM posts p\nJOIN users u ON u.id = p.user_id\nORDER BY p.id;', '<code>ON</code> で「どの列とどの列が対応するか」を書く。<code>posts p</code> のように短い別名を付けると読みやすい。', null, { tags:['基本'], h:320 }),
      Q('3つの表をつなぐ（多対多）', 'Multiple JOINs', 'SELECT p.title, t.name AS タグ\nFROM posts p\nJOIN post_tags pt ON pt.post_id = p.id\nJOIN tags t ON t.id = pt.tag_id\nORDER BY p.id;', '中間テーブル（post_tags）を経由して、記事とタグをつなぐ。多対多の基本形。', null, { h:340 }),
      Q('つないで集計（0件も出す）', 'LEFT JOIN + GROUP BY', 'SELECT u.name, COUNT(p.id) AS 記事数,\n  COALESCE(SUM(p.likes), 0) AS いいね合計\nFROM users u\nLEFT JOIN posts p ON p.user_id = u.id\nGROUP BY u.id\nORDER BY いいね合計 DESC;', 'LEFT JOIN で投稿0件の人も残し、<code>COUNT(p.id)</code> で数える（<code>COUNT(*)</code> だと0件の人が1になる）。', null, { tags:['ハマりどころ'], h:360 }),
      Q('売上ランキング', 'JOIN + aggregate', 'SELECT pr.name AS 商品, SUM(o.qty) AS 個数,\n  SUM(o.qty * pr.price) AS 売上\nFROM orders o\nJOIN products pr ON pr.id = o.product_id\nGROUP BY pr.id\nORDER BY 売上 DESC;', '注文と商品をつないで、商品ごとの売上を計算する。（実際のECでは注文時の価格を明細に保存する。「テーブル設計」タブ参照）', '商品別・月別の売上ランキングを出すSQLを書いて。注文明細に保存した購入時の単価を使って。', { h:340 }),
    ]),
    C('書き込む・変更する', [
      Q('行を追加（INSERT）', 'INSERT', "INSERT INTO users (name, email, age, city)\nVALUES ('小林', 'kobayashi@example.com', 26, '名古屋');", '列名と値を順番に対応させる。id を省略すると自動で採番される。複数行は <code>VALUES (…), (…)</code>。', null, { tags:['基本'], h:340, after:'SELECT id, name, email, city FROM users', afterLabel:'users' }),
      Q('行を更新（UPDATE）', 'UPDATE … WHERE', "UPDATE products\nSET price = price * 11 / 10\nWHERE category = '器具';\n-- WHERE を消して実行すると、全商品が値上がりします", '<b>WHERE を忘れると全行が更新されます</b>。本番では、先に同じ WHERE で SELECT して対象を確認してから実行する。', null, { tags:['事故注意'], h:360, after:'SELECT name, price, category FROM products', afterLabel:'products' }),
      Q('行を削除（DELETE）', 'DELETE … WHERE', 'DELETE FROM comments\nWHERE post_id = 1;', 'これも WHERE 必須。消したものは戻らない（バックアップか論理削除で備える）。外部キーの設定によっては、関連する行も一緒に消える。', null, { tags:['事故注意'], h:320, after:'SELECT * FROM comments', afterLabel:'comments' }),
      Q('あれば更新・なければ追加（UPSERT）', 'INSERT … ON CONFLICT', "INSERT INTO products (id, name, price, stock)\nVALUES (3, 'マグカップ', 1800, 20)\nON CONFLICT (id) DO UPDATE SET stock = excluded.stock;", '一意な列がぶつかったときの動作を指定する。在庫の同期・設定の保存・外部APIのデータ取り込みで便利。Supabaseでは <code>upsert()</code>。', null, { h:340, after:'SELECT id, name, stock FROM products', afterLabel:'products' }),
      Q('ルール違反を試す（制約）', 'Constraint errors', "-- メールアドレスは UNIQUE（重複不可）\nINSERT INTO users (name, email) VALUES ('重複さん', 'sato@example.com');\n-- ほかにも試せます\n-- INSERT INTO users (email) VALUES ('x@example.com');          -- 名前が空\n-- INSERT INTO products (name, price) VALUES ('謎', -100);       -- 価格がマイナス\n-- INSERT INTO posts (user_id, title) VALUES (99, '幽霊の投稿'); -- 存在しないユーザー", 'テーブルに付けたルール（制約）に合わないデータは、DBが拒否します。<b>アプリにバグがあっても変なデータが入らない</b>のが制約の価値。コメントの <code>--</code> を外して1つずつ試してみてください。', '各テーブルに必要な制約（NOT NULL・UNIQUE・CHECK・外部キー）を、データの意味から提案してマイグレーションにして。', { tags:['体験'], h:360 }),
    ]),
    C('定義する・応用', [
      Q('表を作る（CREATE TABLE）', 'CREATE TABLE', "CREATE TABLE bookmarks (\n  id INTEGER PRIMARY KEY,\n  user_id INTEGER NOT NULL REFERENCES users(id),\n  url TEXT NOT NULL,\n  created_at TEXT DEFAULT CURRENT_TIMESTAMP,\n  UNIQUE (user_id, url)\n);\nINSERT INTO bookmarks (user_id, url) VALUES (1, 'https://example.com');\nSELECT * FROM bookmarks;", '列名・型・制約を並べる。<code>UNIQUE (user_id, url)</code> は「同じ人が同じURLを2回登録できない」という<b>組み合わせの重複禁止</b>。', null, { h:380 }),
      Q('列を追加（ALTER TABLE）', 'ALTER TABLE', "ALTER TABLE users ADD COLUMN plan TEXT NOT NULL DEFAULT 'free';\nSELECT id, name, plan FROM users;", '公開後のテーブル変更は、直接実行せず<b>マイグレーション</b>として記録する（「データを守る」タブ参照）。既存の行があるので、NOT NULL の列にはDEFAULTが必要。', null, { h:320 }),
      Q('サブクエリ', 'Subquery', 'SELECT title, likes\nFROM posts\nWHERE likes > (SELECT AVG(likes) FROM posts);', 'SQLの中にSQLを入れる。「平均より多い」のように、別の計算結果を条件に使える。'),
      Q('存在するか（EXISTS）', 'EXISTS / NOT EXISTS', 'SELECT name\nFROM users u\nWHERE NOT EXISTS (\n  SELECT 1 FROM posts p WHERE p.user_id = u.id\n);', '「まだ一度も投稿していない人」のような条件。LEFT JOIN＋IS NULL でも書ける。', null, { h:320 }),
      Q('名前を付けた途中結果（WITH）', 'CTE', 'WITH ranking AS (\n  SELECT user_id, SUM(likes) AS total\n  FROM posts GROUP BY user_id\n)\nSELECT u.name, r.total\nFROM ranking r JOIN users u ON u.id = r.user_id\nORDER BY r.total DESC;', '複雑なSQLを、<b>途中結果に名前を付けて段階的に</b>書ける。読みやすさが大きく上がる。', null, { h:360 }),
      Q('順位を付ける（ウィンドウ関数）', 'Window functions', 'SELECT title, user_id, likes,\n  RANK() OVER (ORDER BY likes DESC) AS 全体順位,\n  ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY likes DESC) AS 本人内順位\nFROM posts;', '行をまとめずに、各行に順位・累計・前の行との差などを付けられる。ランキング、各ユーザーの最新1件の取得などに便利。', '各ユーザーの最新の投稿1件だけを取り出すSQLを、ウィンドウ関数（ROW_NUMBER）で書いて。', { h:340 }),
      Q('保存した問い合わせ（VIEW）', 'VIEW', 'CREATE VIEW popular_posts AS\n  SELECT * FROM posts WHERE likes >= 50 AND published = 1;\nSELECT title, likes FROM popular_posts;', 'よく使うSELECTに名前を付けて、表のように使える。Supabaseでは、VIEWにもRLSの考慮が必要（security_invoker）。', null, { h:320 }),
      Q('日付と文字列の関数', 'Functions', "SELECT name,\n  UPPER(email) AS 大文字,\n  LENGTH(name) AS 文字数,\n  strftime('%m', created_at) AS 登録月,\n  date(created_at, '+30 days') AS 登録30日後\nFROM users;", '関数の名前や書き方は<b>DBごとに違う</b>（ここはSQLite。PostgreSQLなら <code>to_char(created_at, \'MM\')</code>・<code>created_at + interval \'30 days\'</code>）。AIに頼むときは使っているDBを伝える。', null, { h:360 }),
      Q('JSONの中身を取り出す', 'JSON functions', "SELECT user_id,\n  json_extract(data, '$.theme') AS テーマ,\n  json_extract(data, '$.notify.email') AS メール通知\nFROM settings;", 'JSON列の中の値を取り出す。PostgreSQLでは <code>data-&gt;&gt;\'theme\'</code>、<code>data-&gt;\'notify\'-&gt;&gt;\'email\'</code> と書く。', null, { h:330, pre:"CREATE TABLE settings (user_id INTEGER, data TEXT); INSERT INTO settings VALUES (1, '{\"theme\":\"dark\",\"notify\":{\"email\":true}}'), (2, '{\"theme\":\"light\",\"notify\":{\"email\":false}}');" }),
    ]),
  ]});

/* ================= 4. 速さ・インデックス ================= */
const BIG = `CREATE TABLE big_users (id INTEGER PRIMARY KEY, email TEXT, city TEXT, score INTEGER);
WITH RECURSIVE c(x) AS (SELECT 1 UNION ALL SELECT x + 1 FROM c WHERE x < 60000)
INSERT INTO big_users SELECT x, 'user' || x || '@example.com', CASE x % 5 WHEN 0 THEN '東京' WHEN 1 THEN '大阪' WHEN 2 THEN '福岡' WHEN 3 THEN '札幌' ELSE '名古屋' END, (x * 37) % 1000 FROM c;`;
TABS.push({ id:'perf', label:'速さ・インデックス', icon:'⚡',
  intro:'データが少ないうちはどんな書き方でも速いですが、<b>数万件を超えると差が一気に出ます</b>。遅くなる原因の大半は「インデックスがない」「同じ問い合わせを何度も繰り返している（N+1）」「全部読んでから絞っている」の3つです。',
  sections:[
    C('なぜ遅くなるのかを見る', [
      { name:'インデックスのあり・なし', en:'Full scan vs index', h:400, tags:['体験','最重要'],
        demo:'<div class="kt"><div class="kt-row"><span class="sw"></span><button type="button" class="kt-btn pri go">探す</button><b class="kt-mono tgt"></b></div><div class="db-cells cells"></div><div class="kt-verdict res"></div><div class="kt-row"><span class="kt-lbl">データが</span><span class="sw2"></span></div><div class="kt-note big"></div></div>',
        init:(el) => { let mode = 0, timer = null, nIdx = 0; const N = 64, vals = Array.from({ length:N }, (_, i) => (i + 1) * 3), shuffled = [...vals].sort(() => Math.random() - .5);
          const draw = () => { const arr = mode ? vals : shuffled; $(el, '.cells').innerHTML = arr.map(v => `<i>${v}</i>`).join(''); };
          const stop = () => { clearInterval(timer); timer = null; };
          $(el, '.sw').replaceWith(seg(['インデックスなし', 'インデックスあり'], k => { mode = k; stop(); draw(); $(el, '.res').innerHTML = mode ? '並んでいる（索引がある）ので、真ん中を見て半分ずつ捨てながら探せます。' : 'データは追加した順にバラバラに並んでいます。'; }).el);
          const sizes = [[1e4, '1万件'], [1e6, '100万件'], [1e8, '1億件']];
          $(el, '.sw2').replaceWith(seg(sizes.map(s => s[1]), k => { nIdx = k; const n = sizes[k][0]; $(el, '.big').innerHTML = `目的の1件を探すのに調べる数：インデックスなし <b>平均 ${(n / 2).toLocaleString()} 件</b> ／ あり <b>約 ${Math.ceil(Math.log2(n))} 回</b>`; }).el);
          $(el, '.go').onclick = () => { stop(); draw(); const arr = mode ? vals : shuffled, target = vals[Math.floor(Math.random() * N)], cells = $$(el, '.cells i'); $(el, '.tgt').textContent = `目標：${target}`; let seen = 0;
            if (!mode){ let i = 0; timer = setInterval(() => { cells[i].classList.add('seen'); seen++; if (arr[i] === target){ cells[i].className = 'hit'; stop(); $(el, '.res').innerHTML = `<b>${seen}件</b>を1つずつ調べて、やっと見つかりました（全件スキャン）。`; } i++; }, 45); }
            else { let lo = 0, hi = N - 1; timer = setInterval(() => { const mid = (lo + hi) >> 1; seen++; cells.forEach((c, j) => { if (j < lo || j > hi) c.classList.add('out'); }); cells[mid].classList.add('seen');
              if (arr[mid] === target){ cells[mid].className = 'hit'; stop(); $(el, '.res').innerHTML = `<b>${seen}回</b>で見つかりました（半分ずつ絞り込み）。`; } else if (arr[mid] < target) lo = mid + 1; else hi = mid - 1; }, 420); } };
          draw(); return stop; },
        desc:'インデックスがないと、DBは<b>全行を1つずつ調べます（全件スキャン）</b>。インデックス（B-tree）は本の索引のように並べた目次で、100万件でも20回ほどで見つかります。<b>WHERE・JOIN・ORDER BY でよく使う列</b>に作るのが基本。主キーと UNIQUE の列には自動で作られます。',
        prompt:'このアプリでよく実行されるクエリ（WHERE・JOIN・ORDER BY に使っている列）を洗い出して、必要なインデックスを提案し、マイグレーションを作って。作りすぎて書き込みが遅くならないよう、理由も添えて。' },
      { name:'実行計画とスピードを測る', en:'EXPLAIN QUERY PLAN', h:400, tags:['体験','本物のSQL'],
        demo:'<div class="kt"><div class="kt-code q"></div><div class="kt-row"><button type="button" class="kt-btn pri a">① 検索する</button><button type="button" class="kt-btn b">② インデックスを作る</button><button type="button" class="kt-btn sm rs">最初から</button></div><div class="db-res kt-grow out"><div class="db-loading">6万件のテストデータを作成中…</div></div></div>',
        init:(el) => { let db = null, idx = false; const SQL = "SELECT COUNT(*) FROM big_users WHERE city = '福岡' AND score > 900;"; $(el, '.q').innerHTML = KIT.hlSQL(SQL);
          const reset = async () => { try{ db && db.close(); db = await newDB('', BIG); idx = false; $(el, '.out').innerHTML = '<div class="meta">6万件の big_users を用意しました。「① 検索する」を押してください。</div>'; }catch(e){ $(el, '.out').innerHTML = '<div class="err">SQLエンジンを読み込めませんでした（インターネット接続が必要です）。</div>'; } };
          $(el, '.a').onclick = () => { if (!db) return; const plan = db.exec('EXPLAIN QUERY PLAN ' + SQL)[0].values.map(r => r[r.length - 1]).join(' / '); const t0 = performance.now(); let cnt; for (let i = 0; i < 30; i++) cnt = db.exec(SQL)[0].values[0][0]; const ms = (performance.now() - t0) / 30;
            $(el, '.out').insertAdjacentHTML('afterbegin', `<div class="${idx ? 'okmsg' : 'err'}" style="font-family:var(--mono)">${idx ? '✓ インデックスあり' : '✗ インデックスなし'}：${cnt}件・1回あたり <b>${ms.toFixed(2)} ms</b><br>実行計画：${esc(plan)}</div>`); };
          $(el, '.b').onclick = () => { if (!db || idx) return; db.run('CREATE INDEX idx_big_city_score ON big_users (city, score);'); idx = true; $(el, '.out').insertAdjacentHTML('afterbegin', '<div class="meta">CREATE INDEX idx_big_city_score ON big_users (city, score); を実行。もう一度「① 検索する」を押してください。</div>'); };
          $(el, '.rs').onclick = reset; reset(); return () => db && db.close(); },
        desc:'<code>EXPLAIN</code> を付けると、DBが<b>どうやって探すつもりか（実行計画）</b>が見えます。<code>SCAN</code>＝全件、<code>SEARCH … USING INDEX</code>＝索引を使用。ブラウザの中の6万件でも差が出ます。PostgreSQLでは <code>EXPLAIN ANALYZE</code>、Supabaseでは「Query Performance」画面で遅いクエリを確認できます。',
        prompt:'このクエリが遅いです。EXPLAIN ANALYZE の結果を貼るので、どこで時間がかかっているか説明して、インデックスやクエリの書き換えを提案して：（結果を貼る）' },
      { name:'N+1問題', en:'N+1 queries', h:360, tags:['体験','AIがやりがち'],
        demo:'<div class="kt"><div class="kt-row"><span class="kt-lbl">記事の数</span><input type="range" min="5" max="100" value="20" class="n" aria-label="記事の数"><b class="kt-mono nv"></b></div><div class="kt-row"><span class="kt-lbl">1回の往復</span><input type="range" min="1" max="80" value="20" class="l" aria-label="1回の往復時間"><b class="kt-mono lv"></b></div><div class="db-bars"><div class="r"><span>N+1（ループで取得）</span><div class="bar"><i class="bad a"></i></div><b class="at"></b></div><div class="r"><span>JOIN / IN でまとめて</span><div class="bar"><i class="ok b"></i></div><b class="bt"></b></div></div><div class="kt-lbl">送られる問い合わせ</div><div class="db-q qs"></div><div class="kt-code code"></div></div>',
        init:(el) => { const run = () => { const n = +$(el, '.n').value, l = +$(el, '.l').value, a = (n + 1) * l, b = 2 * l; $(el, '.nv').textContent = n + '件'; $(el, '.lv').textContent = l + 'ms';
            $(el, '.a').style.width = '100%'; $(el, '.b').style.width = (b / a * 100) + '%'; $(el, '.at').textContent = a.toLocaleString() + 'ms'; $(el, '.bt').textContent = b + 'ms';
            $(el, '.qs').innerHTML = '<i></i>' + '<i class="bad"></i>'.repeat(n) + `<span class="kt-lbl" style="margin-left:6px">${n + 1}回 → まとめれば2回</span>`; };
          $(el, '.code').textContent = '// ❌ N+1：記事ごとに作者を取りに行く\nconst posts = await db.post.findMany();\nfor (const p of posts) p.author = await db.user.findUnique({ where: { id: p.userId } });\n\n// ✅ 1回でつないで取る\nconst posts = await db.post.findMany({ include: { author: true } });';
          $$(el, 'input').forEach(x => x.oninput = run); run(); },
        desc:'一覧を取ったあと、<b>1件ずつループの中で関連データを取りに行く</b>と、件数分の問い合わせが発生します（1＋N回）。ローカルでは気づかず、本番（DBが離れた場所）で急に遅くなる典型。<b>JOIN・include・IN でまとめて取得</b>します。AIが書いたコードの <code>for</code> や <code>map</code> の中の <code>await</code> は要チェック。',
        prompt:'このコードにN+1問題がないか確認して。ループの中でDBやAPIを呼んでいる箇所を探し、JOIN・include（Prisma）・select の埋め込み（Supabase）・IN 句でまとめて取得する形に直して。' },
      { name:'ページ送りの2つの方式', en:'OFFSET vs cursor pagination', h:340, tags:['体験'],
        demo:'<div class="kt"><div class="kt-row"><span class="kt-lbl">ページ</span><input type="range" min="1" max="5000" value="1" class="p" aria-label="ページ番号"><b class="kt-mono pv"></b></div><div class="db-bars"><div class="r"><span>OFFSET方式</span><div class="bar"><i class="bad a"></i></div><b class="at"></b></div><div class="r"><span>カーソル方式</span><div class="bar"><i class="ok b"></i></div><b class="bt"></b></div></div><div class="kt-code code"></div></div>',
        init:(el) => { const run = () => { const p = +$(el, '.p').value, off = (p - 1) * 20, read = off + 20; $(el, '.pv').textContent = p + 'ページ目';
            $(el, '.a').style.width = Math.max(2, read / (5000 * 20) * 100) + '%'; $(el, '.b').style.width = Math.max(2, 20 / (5000 * 20) * 100) + '%'; $(el, '.at').textContent = read.toLocaleString() + '行'; $(el, '.bt').textContent = '20行';
            $(el, '.code').innerHTML = KIT.hlSQL(`-- OFFSET：${off.toLocaleString()}行を読み飛ばしてから20行\nSELECT * FROM posts ORDER BY id DESC LIMIT 20 OFFSET ${off};\n\n-- カーソル：前のページの最後のidより後ろから20行\nSELECT * FROM posts WHERE id < 123456 ORDER BY id DESC LIMIT 20;`); };
          $(el, '.p').oninput = run; run(); },
        desc:'<b>OFFSET方式</b>は「何ページ目」に飛べて簡単ですが、後ろのページほど読み飛ばす行が増えて遅くなり、途中で追加があると重複・抜けも起きます。<b>カーソル方式</b>は「前回の最後の行の次から」取るので、何ページ目でも一定の速さ。無限スクロールやタイムラインに向いています。',
        prompt:'記事一覧の無限スクロールを、OFFSETではなくカーソル方式（created_at と id の組み合わせ）のページネーションで実装して。' },
    ], null, true),
    S('速くするための知識', [
      T('インデックスを作る列', 'What to index', 'WHERE の条件・JOIN の結合キー（外部キー）・ORDER BY の列。PostgreSQLは<b>外部キーに自動でインデックスを作らない</b>ので、JOINが遅いときはまずここ。', 'このスキーマで、外部キーなのにインデックスがない列を探して、インデックスを追加するマイグレーションを作って。', ['最重要']),
      T('複合インデックスの順番', 'Composite index order', '<code>(user_id, created_at)</code> のように複数列のインデックスは、<b>左の列から順に</b>使われる。「user_id で絞って created_at で並べる」クエリに最適。順番が逆だと効かないことがある。'),
      T('インデックスの副作用', 'Index trade-offs', '追加・更新・削除のたびにインデックスも更新されるので、書き込みが少し遅くなり、容量も使う。使われないインデックスは消す。'),
      T('インデックスが効かない書き方', 'Non-sargable queries', '<code>LIKE \'%語%\'</code>（前方に%）、列に関数をかける（<code>WHERE lower(email) = …</code>）、型の違う比較など。関数インデックスや全文検索で対応する。'),
      T('必要な列・行だけ取る', 'Select only what you need', '<code>SELECT *</code> で大きな列（本文・画像データ）まで取らない。一覧では件数を LIMIT で絞る。全件を取ってからJavaScriptで絞るのは最悪のパターン。', null, ['AIがやりがち']),
      T('キャッシュ', 'Caching', '何度も同じ結果を返すデータは、メモリ・Redis・CDN・Next.jsのキャッシュに一時保存する。「更新したのに反映されない」原因にもなるので、消すタイミングを決めておく。'),
      T('非正規化・集計の保存', 'Denormalization', 'いいね数のような頻繁に表示する集計値を、別の列やテーブルに保存しておく。トリガーやバッチで更新し、ずれたときに作り直せるようにする。'),
      T('マテリアライズドビュー', 'Materialized view', '重い集計の結果を表として保存しておくVIEW。定期的に REFRESH する。ランキング・ダッシュボード向け。'),
      T('接続数の上限とプーラー', 'Connection pooling', 'サーバーレス（Vercel・Netlify Functions）はアクセスごとに接続を作るので、DBの接続上限にすぐ達する。Supabaseの Supavisor（ポート6543）や PgBouncer、Prisma Accelerate などのプーラーを経由する。', '"too many connections" エラーが出ます。Vercel から Supabase に接続しているので、プーラー経由の接続に切り替える設定（Prisma なら DATABASE_URL と DIRECT_URL）を教えて。'),
      T('全文検索', 'Full-text search', '文章の中から単語で探す専用の仕組み。PostgreSQLの tsvector・pg_trgm（部分一致を速く）・pgroonga（日本語向け）、外部サービスの Algolia・Meilisearch など。'),
      T('大量データの一括処理', 'Batch processing', '数万件の更新は、1件ずつではなく数百〜数千件ずつまとめて。長時間のトランザクションはロックの原因になる。'),
      T('タイムアウト', 'Statement timeout', '重いクエリが永遠に走らないように、実行時間の上限を設定する。Supabaseでは役割ごとに設定されている。'),
      T('遅いクエリを見つける', 'Query monitoring', 'PostgreSQLの pg_stat_statements、Supabaseの「Query Performance」「Advisors」、Prismaのクエリログで、時間がかかっている・回数が多いクエリを特定する。推測より計測。'),
      T('読み取り専用レプリカ', 'Read replica', '読み込みが多いサービスで、コピーのDBに読み取りを分散する。書き込み直後は反映が少し遅れることがある。'),
    ]),
  ]});
})();
