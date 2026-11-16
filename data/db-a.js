/* データベース・データ設計辞典 — A: 共通ヘルパー（SQL実行・ER図）/ 基本 / テーブル設計 */
(function(){
const { $, $$, esc, tbl, seg } = KIT;
const S = (title, items, note) => ({ title, note, layout:'rows', items });
const C = (title, items, note, lg) => ({ title, note, layout:lg ? 'cards lg' : 'cards', items });
const T = (name, en, desc, prompt, tags, more) => Object.assign({ name, en, desc, prompt, tags }, more || {});

/* ---- SQLエンジン（sql.js = ブラウザで動く本物のSQLite） ---- */
const SQLJS = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/';
let ENGINE = null;
const engine = () => ENGINE || (ENGINE = window.initSqlJs ? initSqlJs({ locateFile:f => SQLJS + f }) : Promise.reject(new Error('sql.js not loaded')));
const SEED = `
CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, age INTEGER, city TEXT, created_at TEXT);
INSERT INTO users VALUES (1,'佐藤','sato@example.com',28,'東京','2026-01-05'),(2,'鈴木','suzuki@example.com',35,'大阪','2026-02-11'),(3,'高橋','takahashi@example.com',22,'東京','2026-03-20'),(4,'田中','tanaka@example.com',41,'福岡','2026-04-02'),(5,'伊藤','ito@example.com',NULL,'札幌','2026-05-15'),(6,'渡辺','watanabe@example.com',30,'大阪','2026-06-30');
CREATE TABLE posts (id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), title TEXT NOT NULL, likes INTEGER NOT NULL DEFAULT 0, published INTEGER NOT NULL DEFAULT 1, created_at TEXT);
INSERT INTO posts VALUES (1,1,'はじめてのバイブコーディング',42,1,'2026-06-01'),(2,1,'Supabaseで作るTODOアプリ',128,1,'2026-06-10'),(3,2,'CSSアニメーション入門',75,1,'2026-06-12'),(4,3,'下書き：AIとの付き合い方',0,0,'2026-06-20'),(5,2,'SQLは怖くない',210,1,'2026-07-01'),(6,4,'個人開発で月1万円',33,1,'2026-07-05'),(7,1,'RLSの落とし穴',96,1,'2026-07-12');
CREATE TABLE comments (id INTEGER PRIMARY KEY, post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE, user_id INTEGER NOT NULL REFERENCES users(id), body TEXT NOT NULL);
INSERT INTO comments VALUES (1,1,2,'参考になりました！'),(2,1,3,'私もやってみます'),(3,2,4,'RLSの説明が助かる'),(4,5,1,'分かりやすい'),(5,5,3,'JOINの例が欲しい'),(6,7,2,'ハマりました…');
CREATE TABLE tags (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE);
INSERT INTO tags VALUES (1,'AI'),(2,'CSS'),(3,'DB'),(4,'個人開発');
CREATE TABLE post_tags (post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE, tag_id INTEGER REFERENCES tags(id), PRIMARY KEY (post_id, tag_id));
INSERT INTO post_tags VALUES (1,1),(2,3),(2,4),(3,2),(4,1),(5,3),(6,4),(7,3);
CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT NOT NULL, price INTEGER NOT NULL CHECK (price >= 0), stock INTEGER NOT NULL DEFAULT 0, category TEXT);
INSERT INTO products VALUES (1,'コーヒー豆 200g',1200,30,'食品'),(2,'ドリッパー',2400,12,'器具'),(3,'マグカップ',1800,0,'食器'),(4,'電動ミル',9800,5,'器具'),(5,'紅茶セット',3200,18,'食品');
CREATE TABLE orders (id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), product_id INTEGER NOT NULL REFERENCES products(id), qty INTEGER NOT NULL CHECK (qty > 0), ordered_at TEXT);
INSERT INTO orders VALUES (1,1,1,2,'2026-07-01'),(2,1,2,1,'2026-07-03'),(3,2,4,1,'2026-07-04'),(4,3,1,3,'2026-07-08'),(5,2,5,2,'2026-07-10'),(6,4,3,1,'2026-07-15'),(7,1,5,1,'2026-07-20');`;
async function newDB(extra = '', base = SEED){ const SQL = await engine(); const db = new SQL.Database(); db.run('PRAGMA foreign_keys = ON;' + base + extra); return db; }
const ERRJA = [[/no such table: ([\w.]+)/, 'テーブル「$1」がありません（名前の打ち間違い・まだ作っていない）'], [/no such column: ([\w.]+)/, '列「$1」がありません（列名の間違い・どのテーブルの列か指定が必要）'], [/syntax error|near "/, 'SQLの文法エラー（カンマ・カッコ・引用符・キーワードの順番を確認）'], [/UNIQUE constraint failed: ([\w.]+)/, '「$1」は重複できません（同じ値がすでにある）'], [/NOT NULL constraint failed: ([\w.]+)/, '「$1」は空（NULL）にできません'], [/FOREIGN KEY constraint failed/, '参照先が存在しない、または他から参照されているので変更・削除できません（外部キー制約）'], [/CHECK constraint failed: ?(.*)/, 'CHECK制約（$1）の条件を満たしていません'], [/incomplete input/, 'SQLが途中で終わっています（閉じカッコ・引用符・セミコロンを確認）'], [/ambiguous column name: ([\w.]+)/, '列「$1」がどのテーブルのものか分かりません（テーブル名.列名 で指定）'], [/misuse of aggregate/, '集計関数の使い方が違います（集計の条件は WHERE ではなく HAVING）']];
function showResult(box, db, sql, opts = {}){
  try{ const rs = db.exec(sql), changed = db.getRowsModified(); let html = '';
    if (!rs.length) html = `<div class="okmsg">✓ 実行しました${/^\s*(insert|update|delete)/im.test(sql) ? `（直前の文で${changed}行が変更）` : ''}</div>`;
    rs.slice(-2).forEach(r => { html += `<div class="meta">${r.values.length}行${r.values.length > 60 ? '（先頭60行を表示）' : ''}</div>` + tbl(r.columns, r.values.slice(0, 60)); });
    if (opts.after){ const a = db.exec(opts.after)[0]; if (a) html += `<div class="meta">実行後の${opts.afterLabel || 'テーブル'}</div>` + tbl(a.columns, a.values.slice(0, 30), { cls:opts.afterCls }); }
    box.innerHTML = html; return true;
  }catch(e){ let ja = ''; ERRJA.forEach(([re, t]) => { const m = e.message.match(re); if (m && !ja) ja = t.replace('$1', m[1] || ''); }); box.innerHTML = `<div class="err">${esc(e.message)}${ja ? `<b>→ ${ja}</b>` : ''}</div>`; return false; }
}
// SQLプレイグラウンド：書き換えて実行できる。デモごとに新しいDBを使うので何をしても大丈夫
function sqlBox(el, sql, opts = {}){
  el.innerHTML = `<div class="kt"><textarea class="kt-in db-sql" rows="${opts.rows || Math.min(8, sql.split('\n').length + 1)}" spellcheck="false" aria-label="SQL">${esc(sql)}</textarea><div class="kt-row"><button type="button" class="kt-btn pri run">▶ 実行</button><button type="button" class="kt-btn sm rs">元に戻す</button><button type="button" class="kt-btn sm tb">テーブル一覧</button><span class="kt-lbl" style="margin-left:auto">Ctrl+Enterでも実行</span></div><div class="db-res kt-grow"><div class="db-loading">SQLエンジンを読み込み中…</div></div></div>`;
  const ta = $(el, 'textarea'), res = $(el, '.db-res'); let db = null;
  const reset = async () => { try{ db && db.close(); db = await newDB(opts.pre || '', opts.base); return true; }catch(e){ res.innerHTML = '<div class="err">SQLエンジン（sql.js）を読み込めませんでした。インターネットに接続してから再読み込みしてください。</div>'; return false; } };
  const run = () => { if (db) showResult(res, db, ta.value, opts); };
  reset().then(ok => { if (ok){ if (opts.autorun === false) res.innerHTML = '<div class="meta">「▶ 実行」を押すと結果が出ます</div>'; else run(); } });
  $(el, '.run').onclick = run;
  ta.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter'){ e.preventDefault(); run(); } });
  $(el, '.rs').onclick = async () => { ta.value = sql; if (await reset()) run(); };
  $(el, '.tb').onclick = () => { if (db) showResult(res, db, "SELECT name AS テーブル, (SELECT COUNT(*) FROM pragma_table_info(name)) AS 列の数 FROM sqlite_master WHERE type = 'table' ORDER BY name"); };
  return () => { db && db.close(); db = null; };
}
// Q(名前, 英語, SQL, 説明, AIへの指示, オプション)
const Q = (name, en, sql, desc, prompt, opts = {}) => ({ name, en, desc, prompt, tags:opts.tags, h:opts.h || 340, wide:opts.wide, init:(el) => sqlBox(el, sql, opts), search:sql });

/* ---- ER図 ---- */
function erd(el, spec){
  el.innerHTML = `<div class="kt"><div class="db-er"><svg></svg>${spec.ents.map(e => `<div class="db-ent" data-id="${e.id}" style="left:${e.x}%;top:${e.y}%"><b>${e.id}${e.ja ? ` <small style="font-weight:500;color:var(--muted)">${e.ja}</small>` : ''}</b>${e.f.map(f => { const pk = / PK$/.test(f), fk = / FK$/.test(f); return `<div class="${pk ? 'pk' : fk ? 'fk' : ''}">${esc(f.replace(/ (PK|FK)$/, ''))}${pk ? ' 🔑' : fk ? ' →' : ''}</div>`; }).join('')}</div>`).join('')}</div><div class="kt-note nt">${spec.note || '表をクリックすると、つながりが強調されます。🔑主キー　→外部キー'}</div></div>`;
  const box = $(el, '.db-er'), svg = $(el, 'svg');
  const edge = (r, tx, ty) => { const cx = r.x + r.w / 2, cy = r.y + r.h / 2, dx = tx - cx, dy = ty - cy; const k = Math.min(Math.abs(r.w / 2 / (dx || 1e-6)), Math.abs(r.h / 2 / (dy || 1e-6))); return [cx + dx * k, cy + dy * k]; };
  const rect = (id) => { const b = box.getBoundingClientRect(), r = $(box, `[data-id="${id}"]`).getBoundingClientRect(); return { x:r.left - b.left, y:r.top - b.top, w:r.width, h:r.height }; };
  let s = ''; spec.rels.forEach(([a, b, k], i) => { const A = rect(a), B = rect(b); const pa = edge(A, B.x + B.w / 2, B.y + B.h / 2), pb = edge(B, A.x + A.w / 2, A.y + A.h / 2);
    const la = k === 'N:M' ? 'N' : '1', lb = k === '1:1' ? '1' : k === 'N:M' ? 'M' : 'N', off = (p, q) => [p[0] + (q[0] - p[0]) * .12, p[1] + (q[1] - p[1]) * .12 - 4];
    const ta = off(pa, pb), tb2 = off(pb, pa);
    s += `<line data-a="${a}" data-b="${b}" x1="${pa[0]}" y1="${pa[1]}" x2="${pb[0]}" y2="${pb[1]}"></line><text x="${ta[0]}" y="${ta[1]}">${la}</text><text x="${tb2[0]}" y="${tb2[1]}">${lb}</text>`; });
  svg.innerHTML = s;
  $$(box, '.db-ent').forEach(en => en.onclick = () => { const id = en.dataset.id, on = !en.classList.contains('on'), rel = new Set([id]);
    $$(svg, 'line').forEach(l => { const hit = on && (l.dataset.a === id || l.dataset.b === id); l.classList.toggle('on', hit); if (hit){ rel.add(l.dataset.a); rel.add(l.dataset.b); } });
    $$(box, '.db-ent').forEach(x => { x.classList.toggle('on', on && x.dataset.id === id); x.classList.toggle('dim', on && !rel.has(x.dataset.id)); });
    $(el, '.nt').innerHTML = on && spec.notes && spec.notes[id] ? `<b>${id}</b>：${spec.notes[id]}` : (spec.note || '表をクリックすると、つながりが強調されます。🔑主キー　→外部キー'); });
}
window.DBH = { S, C, T, Q, sqlBox, newDB, showResult, erd, SEED };

/* ================= 1. データベースの基本 ================= */
const ANAT = { cols:['id', 'name', 'email', 'age'], rows:[[1, '佐藤', 'sato@example.com', 28], [2, '鈴木', 'suzuki@example.com', 35], [3, '高橋', 'takahashi@example.com', 22], [5, '伊藤', 'ito@example.com', null]] };
const KINDS = [
  { l:'リレーショナル', note:'<b>表（テーブル）と表を、IDでつなぐ</b>形。データの整合性を保ちやすく、複雑な集計も得意。迷ったらこれ。<br>例：PostgreSQL（Supabase・Neon）、MySQL、SQLite',
    html:() => `<div class="kt-row" style="align-items:flex-start;flex-wrap:nowrap;gap:6px"><div style="flex:1;min-width:0"><div class="kt-lbl">users</div>${tbl(['id', 'name'], [[1, '佐藤'], [2, '鈴木']])}</div><div style="flex:1.4;min-width:0"><div class="kt-lbl">posts</div>${tbl(['id', 'user_id', 'title'], [[1, 1, 'はじめての…'], [2, 1, 'Supabase…'], [3, 2, 'CSS入門']])}</div></div>` },
  { l:'ドキュメント', note:'<b>JSONのような入れ子のデータ</b>をそのまま保存。1回の読み込みで画面に必要なデータが揃う。項目を後から自由に足せる。<br>例：Firestore、MongoDB',
    html:() => `<div class="kt-code db-doc">users/sato {\n  name: "佐藤",\n  posts: [\n    { title: "はじめての…", likes: 42 },\n    { title: "Supabase…", likes: 128 }\n  ]\n}</div>` },
  { l:'キー・バリュー', note:'<b>「キー → 値」だけ</b>の超高速な保存場所。ログイン状態・キャッシュ・回数制限のカウンターなどに。<br>例：Redis（Upstash）、Cloudflare KV',
    html:() => `<div class="db-kv"><div><b>session:8f3a</b><i>→ user:1（30分で消える）</i></div><div><b>ratelimit:user1</b><i>→ 12（今日の回数）</i></div><div><b>cache:/api/posts</b><i>→ [{...},{...}]（60秒）</i></div></div>` },
  { l:'ベクトル', note:'文章や画像を<b>数値の並び（ベクトル）</b>に変換して保存し、「意味が近いもの」を探す。AIのRAG（資料検索）で使う。<br>例：pgvector（Supabase）、Pinecone',
    html:() => { const P = [[30, 30, 'CSS入門'], [42, 24, 'アニメ'], [70, 66, 'SQL'], [78, 56, 'RLS'], [64, 74, '設計'], [22, 70, '個人開発']], q = [72, 62]; return `<svg class="db-svg" viewBox="0 0 100 92" style="height:120px">${P.map(([x, y, t]) => { const hit = Math.hypot(x - q[0], y - q[1]) < 14; return `<circle class="dot ${hit ? 'hit' : ''}" cx="${x}" cy="${y}" r="4"/><text x="${x + 5}" y="${y + 3}">${t}</text>`; }).join('')}<circle class="q" cx="${q[0]}" cy="${q[1]}" r="3.5"/><circle cx="${q[0]}" cy="${q[1]}" r="14" fill="none" stroke="var(--bad)" stroke-dasharray="2 2"/><text x="50" y="90" text-anchor="middle">●「データベースの安全」に近い記事</text></svg>`; } },
  { l:'グラフ', note:'<b>点（人・物）と線（関係）</b>で保存。「友達の友達」「おすすめ」のような、つながりをたどる検索が得意。<br>例：Neo4j',
    html:() => { const N = [[20, 25, '佐藤'], [55, 15, '鈴木'], [82, 40, '高橋'], [40, 62, '田中'], [72, 75, '伊藤']], E = [[0, 1], [1, 2], [0, 3], [3, 4], [2, 4], [1, 3]]; return `<svg class="db-svg" viewBox="0 0 100 90" style="height:120px">${E.map(([a, b]) => `<line class="edge" x1="${N[a][0]}" y1="${N[a][1]}" x2="${N[b][0]}" y2="${N[b][1]}"/>`).join('')}${N.map(([x, y, t]) => `<circle class="node" cx="${x}" cy="${y}" r="7"/><text x="${x}" y="${y + 17}" text-anchor="middle">${t}</text>`).join('')}</svg>`; } },
];
const URLP = [['postgresql://', 'スキーム', 'DBの種類。postgres:// / mysql:// / file:（SQLite）など。'], ['postgres.abcdefgh', 'ユーザー名', 'DBに接続するユーザー。Supabaseのプーラー経由では「postgres.プロジェクトID」の形。'], [':', '', ''], ['パスワード', 'パスワード', '<b>秘密情報</b>。この文字列全体を .env に入れ、Gitに入れない。記号を含むとURLエンコードが必要なことがある。'], ['@aws-0-ap-northeast-1.pooler.supabase.com', 'ホスト', 'DBサーバーの住所。「pooler」が付くのは接続をまとめる中継（プーラー）。'], [':6543', 'ポート', 'Supabaseでは 6543＝プーラー（トランザクションモード、サーバーレス向け）、5432＝直接接続 or セッションモード。'], ['/postgres', 'DB名', '接続するデータベースの名前。'], ['?sslmode=require', 'オプション', '暗号化（SSL）を必須にするなどの追加設定。']];

TABS.push({ id:'basics', label:'データベースの基本', icon:'⛁',
  intro:'データベースは、アプリのデータを<b>なくさず・矛盾なく・速く</b>取り出すための保管庫です。スプレッドシートに似ていますが、「同時に何人が書き込んでも壊れない」「ルールに合わないデータを拒否できる」のが大きな違い。このページのSQLのデモは、<b>ブラウザの中で本物のSQLite</b>が動いています。',
  sections:[
    C('触って理解する', [
      { name:'表（テーブル）の部位', en:'Table anatomy', h:330, tags:['基本','体験'],
        demo:'<div class="kt"><div class="db-anat"><span class="tname">users</span><div class="t"></div></div><div class="kt-verdict res">表の名前・見出し・行・マスをクリックしてみてください。</div></div>',
        init:(el) => { const t = $(el, '.t'), res = $(el, '.res'); t.innerHTML = tbl(ANAT.cols, ANAT.rows);
          const clear = () => $$(el, '.sel').forEach(x => x.classList.remove('sel'));
          const say = (h) => res.innerHTML = h;
          $(el, '.tname').onclick = () => { clear(); $$(t, 'td, th').forEach(x => x.classList.add('sel')); say('<b>テーブル（表）</b>：同じ種類のデータの集まり。ユーザー・投稿・注文…と、ものごとごとに1つ作ります。名前は英小文字の複数形（users）が一般的。'); };
          $$(t, 'th').forEach((th, j) => th.onclick = () => { clear(); $$(t, 'tr').forEach(tr => tr.children[j].classList.add('sel')); say(j === 0 ? '<b>主キー（Primary Key）の列</b>：1行を確実に特定するための番号。重複も空も不可。他の表から「この行」を指すのに使います。' : `<b>列（カラム）「${ANAT.cols[j]}」</b>：データの項目。列ごとに<b>型</b>（数値・文字列・日付…）と<b>ルール</b>（空を許すか・重複を許すか）を決めます。`); });
          $$(t, 'td').forEach(td => td.onclick = () => { clear(); [...td.parentNode.children].forEach(x => x.classList.add('sel')); const v = td.textContent, j = [...td.parentNode.children].indexOf(td);
            say(td.querySelector('.null') ? '<b>NULL（ヌル）</b>：「値がない・不明」を表す特別な状態。0や空文字とは違います。この人は年齢を登録していません。' : j === 0 ? `<b>行（レコード）</b>：1件分のデータ。主キー ${v} でこの行を特定できます。` : `<b>行（レコード）</b>：1件分のデータ。その中の1マスが<b>値</b>（ここでは「${esc(v)}」）。`); }); },
        desc:'データベースのデータは<b>表（テーブル）</b>に入ります。横1行が<b>1件のデータ（行・レコード）</b>、縦1列が<b>項目（列・カラム）</b>。各行を特定する番号が<b>主キー</b>です。AIに設計を頼むときも、この言葉で会話します。',
        prompt:'このアプリで保存が必要なデータを洗い出して、テーブルごとに「列名・型・必須か・重複不可か・説明」の表にして提案して。' },
      { name:'データベースの種類', en:'Types of databases', h:330, tags:['選び方','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="v kt-grow" style="min-height:0;overflow:auto"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.sw').replaceWith(seg(KINDS.map(k => k.l), i => { $(el, '.v').innerHTML = KINDS[i].html(); $(el, '.res').innerHTML = KINDS[i].note; }).el); },
        desc:'同じ「ユーザーと投稿」のデータも、DBの種類によって保存の形が違います。Webアプリの中心にはまず<b>リレーショナルDB（PostgreSQLなど）</b>を選び、必要に応じてキャッシュ（Redis）や検索（ベクトル）を足すのが定番です。',
        prompt:'このアプリの要件（扱うデータ・利用者数・リアルタイム性・予算）から、リレーショナルDB・ドキュメントDB・BaaS（Supabase / Firebase）のどれが向いているか、理由とあわせて比較して。' },
      { name:'CRUD（作る・読む・更新・削除）', en:'Create / Read / Update / Delete', h:360, tags:['基本','体験'],
        demo:'<div class="kt"><div class="kt-row"><button type="button" class="kt-btn pri c">＋ 追加</button><button type="button" class="kt-btn r">読む</button><button type="button" class="kt-btn u">✎ 更新</button><button type="button" class="kt-btn bad d">削除</button></div><div class="kt-tblwrap t"></div><div class="kt-code code"></div></div>',
        init:(el) => { let rows = [[1, '牛乳を買う', '未完了'], [2, '請求書を払う', '完了']], next = 3, hl = null;
          const draw = (sql, http, sb) => { $(el, '.t').innerHTML = tbl(['id', 'title', 'status'], rows, { cls:(r) => r[0] === hl ? 'hl' : '' }); if (sql) $(el, '.code').innerHTML = `<span class="c">-- SQL</span>\n${KIT.hlSQL(sql)}\n<span class="c">-- API（HTTP）</span>\n${http}\n<span class="c">-- Supabase（JavaScript）</span>\n${esc(sb)}`; };
          $(el, '.c').onclick = () => { const t = ['歯医者を予約', '資料を作る', '花に水をやる'][next % 3]; rows.push([next, t, '未完了']); hl = next; draw(`INSERT INTO todos (title) VALUES ('${t}');`, 'POST /api/todos', `await supabase.from('todos').insert({ title: '${t}' })`); next++; };
          $(el, '.r').onclick = () => { hl = null; draw("SELECT * FROM todos WHERE status = '未完了';", 'GET /api/todos?status=未完了', "await supabase.from('todos').select('*').eq('status', '未完了')"); };
          $(el, '.u').onclick = () => { const r = rows.find(x => x[2] === '未完了'); if (!r) return; r[2] = '完了'; hl = r[0]; draw(`UPDATE todos SET status = '完了' WHERE id = ${r[0]};`, `PATCH /api/todos/${r[0]}`, `await supabase.from('todos').update({ status: '完了' }).eq('id', ${r[0]})`); };
          $(el, '.d').onclick = () => { const r = rows[0]; if (!r) return; rows = rows.slice(1); hl = null; draw(`DELETE FROM todos WHERE id = ${r[0]};`, `DELETE /api/todos/${r[0]}`, `await supabase.from('todos').delete().eq('id', ${r[0]})`); };
          $(el, '.r').click(); },
        desc:'アプリのデータ操作は、ほぼすべて<b>C（作る）R（読む）U（更新）D（削除）</b>の4つの組み合わせです。SQL・APIのHTTPメソッド・Supabaseのコードが、それぞれ対応しています。<code>UPDATE</code> と <code>DELETE</code> は <b>WHERE を忘れると全行が対象</b>になるので注意。',
        prompt:'todos テーブルのCRUDを、Next.js の Route Handler（GET/POST/PATCH/DELETE）と Supabase で実装して。更新と削除はログインユーザー本人の行だけにして。' },
      { name:'接続文字列の読み方', en:'Connection string (DATABASE_URL)', h:300, tags:['設定','秘密情報'],
        demo:'<div class="kt"><div class="db-url u"></div><div class="kt-verdict res">色の付いた部分をクリックしてください。</div></div>',
        init:(el) => { $(el, '.u').innerHTML = URLP.map((p, i) => `<span class="c${Math.min(i, 6)}" data-i="${i}">${esc(p[0])}</span>`).join('');
          $$(el, '.u span').forEach(s => s.onclick = () => { const p = URLP[+s.dataset.i]; if (!p[1]) return; $$(el, '.u span').forEach(x => x.classList.toggle('on', x === s)); $(el, '.res').innerHTML = `<b>${p[1]}</b>：${p[2]}`; }); },
        desc:'<code>DATABASE_URL</code> に入れる1行には、DBの種類・ユーザー・<b>パスワード</b>・住所・ポート・DB名が詰まっています。<b>丸ごと秘密情報</b>として扱い、ブラウザ側のコードや公開リポジトリに出さないこと。サーバーレス（Vercelなど）からは、接続をまとめる<b>プーラー経由</b>のURLを使うのが基本です。',
        prompt:'Supabase のデータベースに Prisma（または Drizzle）から接続したい。Vercel で使う場合の DATABASE_URL（プーラー経由）とマイグレーション用の DIRECT_URL の違いと、.env の書き方を教えて。' },
    ], null, true),
    { title:'どのデータベースを選ぶ？', note:'迷ったら <b>Supabase（PostgreSQL）</b> から始めるのがバイブコーディングでは定番です。DB・ログイン・ファイル保存・RLSが一式そろっています。',
      table:{ head:['作りたいもの', 'おすすめ', '理由'], rows:[
        ['ログイン付きのWebアプリ全般', 'Supabase（PostgreSQL）', 'SQLが使え、認証・ストレージ・RLSまで一式。AIも書き慣れている'],
        ['スマホアプリ・リアルタイム同期', 'Firebase（Firestore）', 'オフライン対応・リアルタイム更新・Googleのエコシステム'],
        ['リアルタイムに動く共同編集・チャット', 'Convex / Supabase Realtime / Firebase', '変更を自動で画面に反映する仕組みがある'],
        ['小さなツール・個人用・プロトタイプ', 'SQLite（Turso・Cloudflare D1）', 'ファイル1つで動く。安い・速い'],
        ['既存のPostgreSQLをサーバーレスで', 'Neon', 'ブランチ機能で開発用DBをすぐ作れる'],
        ['キャッシュ・回数制限・セッション', 'Redis（Upstash）', 'キー・バリューで超高速。期限付きで自動削除'],
        ['AIの資料検索（RAG）', 'pgvector（Supabase）など', 'いつものDBにベクトル検索を足せる'],
        ['ファイル（画像・動画・PDF）', 'ストレージ（Supabase Storage・R2・S3）', 'ファイル本体はDBに入れず、URLやパスだけDBに保存'],
      ]}},
    S('データベースの基本用語', [
      T('データベース／DBMS', 'Database / DBMS', 'データの保管庫と、それを管理するソフト（PostgreSQL・MySQLなど）。会話ではまとめて「DB」と呼ぶ。'),
      T('リレーショナルDB（RDB）', 'Relational Database', '表と表をIDでつないで管理するDB。SQLで操作する。PostgreSQL・MySQL・SQLiteなど。', null, ['定番']),
      T('SQL', 'Structured Query Language', 'DBに「取り出して」「書き込んで」と頼む言語。ほとんどのRDBで共通。発音は「エスキューエル」または「シークェル」。'),
      T('NoSQL', 'Not only SQL', 'RDB以外のDBの総称。ドキュメント・キーバリュー・グラフなど。'),
      T('スキーマ', 'Schema', 'DBの設計図。どんなテーブルがあり、どんな列・型・ルールを持つか。PostgreSQLでは表のグループ（public スキーマなど）の意味もある。'),
      T('主キー', 'Primary Key（PK）', '1行を確実に特定する列。重複・空は不可。通常は id。'),
      T('外部キー', 'Foreign Key（FK）', '他の表の主キーを指す列（posts.user_id → users.id）。存在しない相手を指せないようにDBがチェックしてくれる。'),
      T('制約', 'Constraint', 'データのルール。NOT NULL（空不可）・UNIQUE（重複不可）・CHECK（条件）・外部キーなど。<b>アプリのバグがあってもDBが変なデータを拒否</b>してくれる最後の砦。'),
      T('インデックス', 'Index', '本の索引のように、検索を速くする仕組み。（「速さ・インデックス」タブ参照）'),
      T('クエリ', 'Query', 'DBへの問い合わせ（SQL文1つ分）。'),
      T('トランザクション', 'Transaction', '複数の操作を「全部成功」か「全部なかったこと」にまとめる仕組み。（「データを守る」タブ参照）'),
      T('ORM', 'Object-Relational Mapping', 'SQLを書かずに、プログラムの書き方でDBを操作できる道具（Prisma・Drizzleなど）。型の補完が効いてミスが減る。'),
      T('マイグレーション', 'Migration', 'テーブルの作成・変更を、ファイルとして順番に記録・適用する仕組み。DBの変更履歴をGitで管理できる。'),
      T('シード', 'Seed', '開発・テスト用の初期データを入れること。'),
      T('BaaS', 'Backend as a Service', 'DB・認証・ストレージ・APIをまとめて提供するサービス（Supabase・Firebase）。サーバーを自分で作らずに済む。'),
      T('ビュー', 'View', '保存したSELECT文。よく使う集計や結合を、表のように呼び出せる。'),
      T('トリガー／DB関数', 'Trigger / Function', 'データが変わったときに自動で動く処理（例：登録時にプロフィール行を作る）。Supabaseでよく使う。'),
      T('コネクション（接続）', 'Connection / Pool', 'アプリとDBの通話回線。DBが同時に受けられる数には上限がある。プール（使い回し）やプーラーでまとめる。'),
      T('レプリカ／シャーディング', 'Replica / Sharding', 'レプリカ＝読み取り専用の複製で負荷分散。シャーディング＝データを複数のDBに分割。大規模になってから考えればよい。'),
      T('スプレッドシートとの違い', 'Spreadsheet vs DB', 'スプレッドシートは人が見て編集する道具。DBは<b>同時アクセス・型とルールの強制・大量データ・権限管理</b>に強い。小さな管理用途ならGoogleスプレッドシートをDB代わりにするのもあり。'),
    ]),
  ]});

/* ================= 2. テーブル設計 ================= */
const REL = [
  { l:'1対1', er:{ ents:[{ id:'users', x:4, y:12, f:['id PK', 'email'] }, { id:'profiles', x:56, y:12, f:['user_id PK', 'bio', 'avatar_url'] }], rels:[['users', 'profiles', '1:1']] },
    L:['users', ['id', 'email'], [[1, 'sato@…'], [2, 'suzuki@…']]], R:['profiles', ['user_id', 'bio'], [[1, 'コーヒー好き'], [2, 'デザイナー']]], key:(l, r) => l[0] === r[0],
    note:'<b>1人に1つ</b>。ユーザー本体と、プロフィールの詳細を分けたいときなど。主キーをそのまま外部キーにします。' },
  { l:'1対多', er:{ ents:[{ id:'users', x:4, y:12, f:['id PK', 'name'] }, { id:'posts', x:56, y:12, f:['id PK', 'user_id FK', 'title'] }], rels:[['users', 'posts', '1:N']] },
    L:['users', ['id', 'name'], [[1, '佐藤'], [2, '鈴木']]], R:['posts', ['id', 'user_id', 'title'], [[1, 1, 'はじめての…'], [2, 1, 'Supabase…'], [3, 2, 'CSS入門'], [4, 1, 'RLSの…']]], key:(l, r) => l[0] === r[1],
    note:'<b>1人が複数を持つ</b>、最もよく使う関係。「多」の側（posts）に、相手のID（user_id）を持たせます。' },
  { l:'多対多', er:{ ents:[{ id:'posts', x:2, y:12, f:['id PK', 'title'] }, { id:'post_tags', x:36, y:40, f:['post_id FK', 'tag_id FK'] }, { id:'tags', x:70, y:12, f:['id PK', 'name'] }], rels:[['posts', 'post_tags', '1:N'], ['tags', 'post_tags', '1:N']] },
    L:['posts', ['id', 'title'], [[1, 'はじめての…'], [2, 'Supabase…'], [3, 'CSS入門']]], R:['post_tags → tags', ['post_id', 'tag'], [[1, 'AI'], [2, 'DB'], [2, '個人開発'], [3, 'CSS']]], key:(l, r) => l[0] === r[0],
    note:'<b>お互いに複数</b>（1つの記事に複数のタグ、1つのタグに複数の記事）。間に<b>中間テーブル</b>（post_tags）を置いて、2つの1対多に分けます。' },
];
const NORM = [
  { t:'正規化前', note:'1マスに複数の商品が入っている、顧客の情報が毎回書かれている…。<b>スプレッドシートにありがちな形</b>です。', tables:[['注文', ['注文ID', '顧客', '電話', '商品（数量）'], [[101, '佐藤', '090-1111', '豆(2), ミル(1)'], [102, '鈴木', '080-2222', '豆(1)'], [103, '佐藤', '090-1111', 'カップ(3)']], [3]]] },
  { t:'第1正規形', note:'<b>1マスに1つの値</b>。商品ごとに行を分けました。でも「佐藤・090-1111」が何度も出てきます（重複）。', tables:[['注文', ['注文ID', '顧客', '電話', '商品', '単価', '数量'], [[101, '佐藤', '090-1111', '豆', 1200, 2], [101, '佐藤', '090-1111', 'ミル', 9800, 1], [102, '鈴木', '080-2222', '豆', 1200, 1], [103, '佐藤', '090-1111', 'カップ', 1800, 3]], [1, 2, 4]]] },
  { t:'第2正規形', note:'<b>商品の情報（単価）は商品表へ</b>。注文と明細も分けました。単価を変えるときは商品表の1か所だけ直せばよくなります。', tables:[['注文', ['注文ID', '顧客', '電話'], [[101, '佐藤', '090-1111'], [102, '鈴木', '080-2222'], [103, '佐藤', '090-1111']], [1, 2]], ['注文明細', ['注文ID', '商品ID', '数量'], [[101, 1, 2], [101, 2, 1], [102, 1, 1], [103, 3, 3]], []], ['商品', ['商品ID', '名前', '単価'], [[1, '豆', 1200], [2, 'ミル', 9800], [3, 'カップ', 1800]], []]] },
  { t:'第3正規形', note:'<b>顧客の情報（電話）は顧客表へ</b>。注文には顧客IDだけを持たせます。電話番号が変わっても1か所の修正で済み、矛盾が生まれません。', tables:[['顧客', ['顧客ID', '名前', '電話'], [[1, '佐藤', '090-1111'], [2, '鈴木', '080-2222']], []], ['注文', ['注文ID', '顧客ID'], [[101, 1], [102, 2], [103, 1]], []], ['注文明細', ['注文ID', '商品ID', '数量'], [[101, 1, 2], [101, 2, 1], [102, 1, 1], [103, 3, 3]], []], ['商品', ['商品ID', '名前', '単価'], [[1, '豆', 1200], [2, 'ミル', 9800], [3, 'カップ', 1800]], []]] },
];
// IDの生成（学習用の実装）
const CROCK = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const ulid = () => { let t = Date.now(), ts = ''; for (let i = 0; i < 10; i++){ ts = CROCK[t % 32] + ts; t = Math.floor(t / 32); } return ts + [...crypto.getRandomValues(new Uint8Array(16))].map(b => CROCK[b % 32]).join(''); };
const uuid7 = () => { const b = crypto.getRandomValues(new Uint8Array(16)); let t = Date.now(); for (let i = 5; i >= 0; i--){ b[i] = t % 256; t = Math.floor(t / 256); } b[6] = (b[6] & 15) | 0x70; b[8] = (b[8] & 63) | 0x80; const h = [...b].map(x => x.toString(16).padStart(2, '0')).join(''); return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`; };
const nano = () => { const A = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict'; return [...crypto.getRandomValues(new Uint8Array(21))].map(b => A[b & 63]).join(''); };
// よくあるアプリの設計図
const BP = [
  { name:'ブログ・メディア', en:'Blog / CMS', er:{ ents:[{ id:'users', x:1, y:4, f:['id PK', 'name', 'role'] }, { id:'posts', x:35, y:4, f:['id PK', 'author_id FK', 'title', 'slug', 'status', 'published_at'] }, { id:'comments', x:1, y:56, f:['id PK', 'post_id FK', 'user_id FK', 'body'] }, { id:'tags', x:68, y:56, f:['id PK', 'name'] }, { id:'post_tags', x:35, y:66, f:['post_id FK', 'tag_id FK'] }], rels:[['users', 'posts', '1:N'], ['posts', 'comments', '1:N'], ['users', 'comments', '1:N'], ['posts', 'post_tags', '1:N'], ['tags', 'post_tags', '1:N']], notes:{ posts:'status（下書き・公開）と published_at で予約投稿も表現。slug はURL用の文字列（UNIQUE）。' } },
    sql:'create table posts (\n  id bigint generated always as identity primary key,\n  author_id uuid not null references auth.users(id),\n  title text not null,\n  slug text not null unique,\n  status text not null default \'draft\' check (status in (\'draft\', \'published\')),\n  published_at timestamptz,\n  created_at timestamptz not null default now()\n);' },
  { name:'ECサイト（ネットショップ）', en:'E-commerce', er:{ ents:[{ id:'customers', x:1, y:4, f:['id PK', 'email', 'name'] }, { id:'orders', x:35, y:4, f:['id PK', 'customer_id FK', 'status', 'total', 'ordered_at'] }, { id:'order_items', x:35, y:56, f:['id PK', 'order_id FK', 'product_id FK', 'unit_price', 'qty'] }, { id:'products', x:68, y:30, f:['id PK', 'name', 'price', 'stock'] }, { id:'addresses', x:1, y:58, f:['id PK', 'customer_id FK', 'zip', 'line1'] }], rels:[['customers', 'orders', '1:N'], ['orders', 'order_items', '1:N'], ['products', 'order_items', '1:N'], ['customers', 'addresses', '1:N']], notes:{ order_items:'<b>購入時の単価（unit_price）をコピーして保存</b>するのがポイント。あとで商品の値段を変えても、過去の注文金額は変わらない。', orders:'status（未払い・支払済・発送済・キャンセル）で状態を管理。合計金額は明細から計算するか、確定時に保存。' } },
    sql:'create table order_items (\n  id bigint generated always as identity primary key,\n  order_id bigint not null references orders(id) on delete cascade,\n  product_id bigint not null references products(id),\n  unit_price integer not null check (unit_price >= 0),  -- 購入時の価格を保存\n  qty integer not null check (qty > 0)\n);' },
  { name:'SNS（フォロー・いいね）', en:'Social network', er:{ ents:[{ id:'users', x:1, y:8, f:['id PK', 'handle', 'name'] }, { id:'follows', x:35, y:2, f:['follower_id FK', 'followee_id FK', 'created_at'] }, { id:'posts', x:35, y:52, f:['id PK', 'user_id FK', 'body'] }, { id:'likes', x:68, y:30, f:['user_id FK', 'post_id FK'] }], rels:[['users', 'follows', '1:N'], ['users', 'posts', '1:N'], ['posts', 'likes', '1:N'], ['users', 'likes', '1:N']], notes:{ follows:'users 同士の多対多（自己参照）。(follower_id, followee_id) を主キーにして二重フォローを防ぐ。', likes:'(user_id, post_id) を主キーに → 同じ人が2回いいねできない。いいね数は数えるか、カウンター列を別に持つ。' } },
    sql:'create table follows (\n  follower_id uuid references users(id) on delete cascade,\n  followee_id uuid references users(id) on delete cascade,\n  created_at timestamptz default now(),\n  primary key (follower_id, followee_id),\n  check (follower_id <> followee_id)   -- 自分はフォローできない\n);' },
  { name:'予約システム', en:'Booking', er:{ ents:[{ id:'resources', x:1, y:6, f:['id PK', 'name', 'capacity'] }, { id:'slots', x:35, y:6, f:['id PK', 'resource_id FK', 'starts_at', 'ends_at'] }, { id:'reservations', x:35, y:58, f:['id PK', 'slot_id FK', 'user_id FK', 'status'] }, { id:'users', x:68, y:58, f:['id PK', 'name'] }], rels:[['resources', 'slots', '1:N'], ['slots', 'reservations', '1:N'], ['users', 'reservations', '1:N']], notes:{ reservations:'<b>二重予約を防ぐ</b>のが最重要。一意制約や排他制約（PostgreSQLの EXCLUDE）、トランザクションで同時予約に備える。', slots:'時刻は timestamptz（タイムゾーン付き）で保存。' } },
    sql:'-- 同じ枠を2人が予約できないように\ncreate unique index one_booking_per_slot\n  on reservations (slot_id) where status <> \'cancelled\';' },
  { name:'チームのタスク管理', en:'Team task manager', er:{ ents:[{ id:'orgs', x:1, y:4, f:['id PK', 'name'] }, { id:'members', x:1, y:54, f:['org_id FK', 'user_id FK', 'role'] }, { id:'projects', x:35, y:4, f:['id PK', 'org_id FK', 'name'] }, { id:'tasks', x:35, y:52, f:['id PK', 'project_id FK', 'assignee_id FK', 'status', 'due_on', 'position'] }, { id:'users', x:68, y:30, f:['id PK', 'name'] }], rels:[['orgs', 'members', '1:N'], ['users', 'members', '1:N'], ['orgs', 'projects', '1:N'], ['projects', 'tasks', '1:N'], ['users', 'tasks', '1:N']], notes:{ members:'組織とユーザーの多対多＋役割（owner・member）。RLSで「同じ組織のメンバーだけ見える」を作る基準。', tasks:'position でかんばんの並び順。status は todo・doing・done。' } },
    sql:'-- 同じ組織のメンバーだけがタスクを見られる（Supabase RLS）\ncreate policy "組織のメンバーだけ" on tasks for select using (\n  exists (select 1 from projects p join members m on m.org_id = p.org_id\n          where p.id = tasks.project_id and m.user_id = auth.uid())\n);' },
  { name:'チャット', en:'Chat / Messaging', er:{ ents:[{ id:'rooms', x:1, y:8, f:['id PK', 'name', 'is_direct'] }, { id:'room_members', x:35, y:56, f:['room_id FK', 'user_id FK', 'last_read_at'] }, { id:'messages', x:35, y:4, f:['id PK', 'room_id FK', 'user_id FK', 'body', 'created_at'] }, { id:'users', x:68, y:40, f:['id PK', 'name'] }], rels:[['rooms', 'room_members', '1:N'], ['users', 'room_members', '1:N'], ['rooms', 'messages', '1:N'], ['users', 'messages', '1:N']], notes:{ room_members:'last_read_at で「未読件数」を計算。参加者だけがメッセージを読めるRLSの基準にもなる。', messages:'(room_id, created_at) にインデックス。新しい順の読み込みはカーソル方式で。' } },
    sql:'create index messages_room_time on messages (room_id, created_at desc);' },
  { name:'会員制・サブスク', en:'Membership / Subscription', er:{ ents:[{ id:'users', x:1, y:8, f:['id PK', 'email'] }, { id:'subscriptions', x:35, y:4, f:['id PK', 'user_id FK', 'plan', 'status', 'current_period_end', 'stripe_sub_id'] }, { id:'invoices', x:35, y:58, f:['id PK', 'subscription_id FK', 'amount', 'paid_at'] }, { id:'webhook_events', x:68, y:58, f:['id PK', 'type', 'received_at'] }], rels:[['users', 'subscriptions', '1:N'], ['subscriptions', 'invoices', '1:N']], notes:{ subscriptions:'状態の正は決済サービス（Stripe）。Webhookで status・current_period_end を更新し、アプリはこの表を見て機能を開放。', webhook_events:'受け取ったイベントIDを保存して、<b>同じイベントを2回処理しない</b>ようにする。' } },
    sql:'create table webhook_events (\n  id text primary key,          -- Stripeのイベントid（重複を拒否）\n  type text not null,\n  received_at timestamptz default now()\n);' },
];

TABS.push({ id:'design', label:'テーブル設計', icon:'▦',
  intro:'良い設計は「<b>同じことを2か所に書かない</b>」「<b>関係はIDでつなぐ</b>」の2つが基本です。最初の設計がしっかりしていると、AIへの指示もぶれず、あとからの機能追加が楽になります。',
  sections:[
    C('関係（リレーション）と正規化', [
      { name:'リレーションの3種類', en:'1:1 / 1:N / N:M', h:400, tags:['基本','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="er" style="position:relative;height:120px"></div><div class="db-rel rel kt-grow"></div><div class="kt-note rn"></div></div>',
        init:(el) => { $(el, '.sw').replaceWith(seg(REL.map(r => r.l), i => { const R = REL[i]; erd($(el, '.er'), Object.assign({ note:' ' }, R.er)); $(el, '.er .kt').style.padding = '0';
          $(el, '.rel').innerHTML = `<div><div class="kt-lbl">${R.L[0]}</div>${tbl(R.L[1], R.L[2])}</div><div><div class="kt-lbl">${R.R[0]}</div>${tbl(R.R[1], R.R[2])}</div>`; $(el, '.rn').innerHTML = R.note + '<br>左の行をクリックすると、つながる行が光ります。';
          const lr = $$(el, '.rel > div:first-child tr').slice(1), rr = $$(el, '.rel > div:last-child tr').slice(1);
          lr.forEach((tr, a) => tr.onclick = () => { lr.forEach((x, k) => x.classList.toggle('hl', k === a)); rr.forEach((x, k) => x.classList.toggle('ok', R.key(R.L[2][a], R.R[2][k]))); }); }).el); },
        desc:'テーブル同士の関係は3種類だけ。<b>1対1</b>・<b>1対多</b>（最も多い）・<b>多対多</b>（中間テーブルで2つの1対多に分ける）。AIに設計を頼むときも「ユーザーと投稿は1対多」のように伝えると正確になります。',
        prompt:'このアプリのデータの関係を、1対1・1対多・多対多で整理して、多対多には中間テーブルを入れたER図を Mermaid の erDiagram で書いて。' },
      { name:'正規化を順番に見る', en:'Normalization', h:440, tags:['設計の基本','体験'],
        demo:'<div class="kt"><div class="kt-row"><span class="sw"></span></div><div class="kt-grow tb" style="min-height:0;overflow:auto;display:flex;flex-direction:column;gap:6px"></div><div class="kt-verdict nt"></div></div>',
        init:(el) => { $(el, '.sw').replaceWith(seg(NORM.map(n => n.t), i => { const N = NORM[i];
          $(el, '.tb').innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:flex-start">${N.tables.map(([name, head, rows, dupCols]) => `<div style="flex:1;min-width:150px"><div class="kt-lbl">${name}</div>${tbl(head, rows, { colCls:(j) => dupCols.includes(j) ? 'hl' : '' })}</div>`).join('')}</div>`;
          $(el, '.nt').innerHTML = N.note; }).el); },
        desc:'<b>正規化</b>は、データの重複をなくして矛盾を防ぐ手順です。色の付いた列が「同じ情報が何度も出てくる」場所。分けていくと、変更が1か所で済むようになります。実務では<b>第3正規形まで</b>が目安で、速さのためにあえて崩す（非正規化）こともあります。',
        prompt:'このスプレッドシートの列構成（〇〇・〇〇・〇〇）を、第3正規形のテーブル設計に分解して。それぞれのテーブルの主キー・外部キーと、分けた理由も説明して。' },
      { name:'外部キーと「消したらどうなる？」', en:'ON DELETE CASCADE / SET NULL / RESTRICT', h:400, tags:['体験','本物のSQL'],
        demo:'<div class="kt"><div class="kt-row"><span class="kt-lbl">posts.user_id の設定</span><span class="sw"></span></div><div class="kt-code q"></div><div class="kt-row"><button type="button" class="kt-btn bad del">佐藤（users.id = 1）を削除</button><button type="button" class="kt-btn sm rs">元に戻す</button></div><div class="db-res kt-grow out"></div></div>',
        init:(el) => { let mode = 0, db = null; const M = ['CASCADE', 'SET NULL', 'RESTRICT'], out = $(el, '.out');
          const base = (m) => `CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT); INSERT INTO users VALUES (1,'佐藤'),(2,'鈴木');
CREATE TABLE posts (id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE ${m}, title TEXT);
INSERT INTO posts VALUES (1,1,'はじめての…'),(2,1,'Supabase…'),(3,2,'CSS入門');`;
          const show = (msg) => { out.innerHTML = (msg || '') + '<div class="meta">users</div>' + tbl(['id', 'name'], db.exec('SELECT * FROM users')[0]?.values || []) + '<div class="meta">posts</div>' + tbl(['id', 'user_id', 'title'], db.exec('SELECT * FROM posts')[0]?.values || [], { cls:(r) => r[1] === null ? 'hl' : '' }); };
          const reset = async () => { try{ db && db.close(); db = await newDB('', base(M[mode])); $(el, '.q').innerHTML = KIT.hlSQL(`user_id INTEGER REFERENCES users(id)\n  ON DELETE ${M[mode]}`); show(); }catch(e){ out.innerHTML = '<div class="err">SQLエンジンを読み込めませんでした（インターネット接続が必要です）。</div>'; } };
          $(el, '.sw').replaceWith(seg(['CASCADE（一緒に消す）', 'SET NULL（空にする）', 'RESTRICT（拒否）'], k => { mode = k; reset(); }).el);
          $(el, '.del').onclick = () => { if (!db) return; try{ db.run('DELETE FROM users WHERE id = 1'); show(`<div class="okmsg">✓ DELETE FROM users WHERE id = 1 — ${['佐藤の投稿も一緒に消えました', '佐藤の投稿は残り、user_id が空（NULL）になりました'][mode] || ''}</div>`); }catch(e){ show(`<div class="err">${esc(e.message)}<b>→ 佐藤の投稿が残っているので、削除を拒否しました（RESTRICT）</b></div>`); } };
          $(el, '.rs').onclick = reset; return () => { db && db.close(); }; },
        desc:'外部キーには「<b>相手が消されたらどうするか</b>」を決められます。<b>CASCADE</b>＝一緒に消す（コメントや明細向け）、<b>SET NULL</b>＝つながりだけ外す（作成者が退会しても記事は残す）、<b>RESTRICT</b>＝消させない（注文履歴がある顧客など）。決めておかないと、退会処理などで想定外の事故が起きます。',
        prompt:'このスキーマのすべての外部キーについて、親が削除されたときの動作（CASCADE / SET NULL / RESTRICT）を、データの意味から提案して。退会したユーザーの投稿・注文・コメントをどう扱うかも決めて。' },
      { name:'主キー（ID）の種類', en:'Serial / UUID / ULID / nanoid', h:390, tags:['体験','設計'],
        demo:'<div class="kt"><div class="kt-row"><button type="button" class="kt-btn pri gen">IDを作る</button><span class="kt-lbl">押すたびに新しいIDが増えます</span></div><div class="db-ids ids kt-grow"></div><div class="kt-tblwrap cmp"></div></div>',
        init:(el) => { let n = 1000; const add = () => { n++; $(el, '.ids').insertAdjacentHTML('afterbegin', `<div><b>連番</b><span>${n}</span></div><div><b>UUID v4</b><span>${crypto.randomUUID()}</span></div><div><b>UUID v7</b><span>${uuid7()}</span></div><div><b>ULID</b><span>${ulid()}</span></div><div><b>nanoid</b><span>${nano()}</span></div>`); const d = $(el, '.ids'); while (d.children.length > 15) d.lastChild.remove(); };
          $(el, '.cmp').innerHTML = tbl(['種類', '推測されにくさ', '時間順に並ぶ', '向いている場面'], [['連番', '×', '○', '社内向け・URLに出さないID'], ['UUID v4', '◎', '×', '一般的な外部公開ID'], ['UUID v7', '○', '○', '新しめの定番（DBにも優しい）'], ['ULID', '○', '○', '短め・並び順が欲しい'], ['nanoid', '◎', '×', 'URL・共有コード（短い）']]);
          $(el, '.gen').onclick = add; add(); add(); },
        desc:'<b>連番</b>は小さく速いが、URLに出すと件数や他人のIDが推測される。<b>UUID</b>は推測されにくく、どこでも衝突せずに作れる。<b>UUID v7・ULID</b>は先頭が時刻なので作成順に並び、インデックスにも優しい。Supabaseのユーザーは UUID です。',
        prompt:'このアプリの各テーブルの主キーを、URLに出るもの・出ないもの、作成順に並べたいかで判断して、bigint の連番・UUID v4・UUID v7 のどれにするか提案して。' },
    ], null, true),
    C('よくあるアプリの設計図', BP.map(b => ({ name:b.name, en:b.en, h:340, wide:true, tags:['テンプレ'], init:(el) => erd(el, b.er),
      desc:Object.values(b.er.notes).join('<br>') + '<br><span style="color:var(--muted)">表をクリックすると、その表のポイントが出ます。</span>',
      prompt:`「${b.name}」を作りたい。図のテーブル構成をベースに、PostgreSQL（Supabase）のCREATE TABLE文、外部キーと削除時の動作、必要なインデックス、RLSポリシーまで作って。`, code:b.sql, codeLabel:'ポイントになるSQL' })), '表をクリックすると、その表の設計ポイントが表示されます。', true),
    S('設計のコツ', [
      T('名前の付け方', 'Naming', 'テーブルは<b>英小文字の複数形</b>（users・order_items）、列は<b>スネークケース</b>（created_at）。外部キーは「相手の単数形_id」（user_id）。真偽値は is_ / has_ で始める（is_public）。日本語の列名は避ける。', 'このスキーマの命名を、テーブル名は小文字の複数形、列名はスネークケース、外部キーは 単数形_id、真偽値は is_ で始まる形に統一して。'),
      T('どの表にも付ける列', 'Common columns', '<code>id</code>・<code>created_at</code>（作成日時）・<code>updated_at</code>（更新日時）は基本セット。必要に応じて <code>created_by</code>・<code>deleted_at</code>（論理削除）。updated_at はトリガーで自動更新すると漏れない。'),
      T('1つのマスに1つの値', 'Atomic values', '「タグ1,タグ2,タグ3」をカンマ区切りで1列に入れない。検索・集計・変更が難しくなる。別の表（中間テーブル）に分ける。', null, ['アンチパターン']),
      T('同じ列の繰り返しを作らない', 'No repeating columns', 'tag1・tag2・tag3 や phone1・phone2 のような列は、4つ目が必要になった瞬間に破綻する。行として別の表に持つ。', null, ['アンチパターン']),
      T('計算できる値は基本保存しない', 'Avoid derived data', '合計金額・年齢・いいね数などは、元データから計算できる。保存すると元データとずれる危険がある。ただし<b>性能のため・その時点の値を残すため</b>（注文時の価格）に、あえて保存することもある。'),
      T('お金は整数で', 'Money as integer', '円なら整数（integer）、小数が必要な通貨は最小単位（セント）の整数か numeric を使う。float は誤差が出る（「データ型・日付・お金」タブ参照）。', null, ['重要']),
      T('状態（ステータス）の持ち方', 'Status column', '「下書き・公開・削除」などは、文字列＋CHECK制約、ENUM型、または参照テーブルで。真偽値をいくつも並べる（is_draft・is_deleted…）と矛盾した組み合わせが生まれる。'),
      T('自己参照', 'Self reference', 'コメントへの返信（parent_id）、フォロー（users ↔ users）、カテゴリの階層など、同じ表の別の行を指す関係。'),
      T('JSON列の使いどころ', 'JSON / JSONB column', '設定値・外部APIの生データ・形が決まらない属性に便利。ただし<b>検索や集計に使う項目は普通の列</b>にする。なんでもJSONに入れるとDBの良さ（型・制約・JOIN）が消える。'),
      T('ファイルはDBに入れない', 'Store files in storage', '画像・動画・PDFはストレージ（Supabase Storage・S3・R2）に置き、DBにはパスやURLだけを保存する。'),
      T('ユーザー表と認証の表', 'auth.users と profiles', 'Supabaseではログイン情報は auth.users に入る。表示名やアイコンは自分の profiles 表を作り、auth.users.id と1対1でつなぐ。登録時にトリガーで自動作成するのが定番。', 'Supabase で auth.users と1対1の profiles テーブルを作り、新規登録時にトリガーで自動作成されるようにして。RLSは「誰でも閲覧可・本人だけ更新可」で。'),
      T('論理削除と物理削除', 'Soft delete vs hard delete', '物理削除＝行を消す。論理削除＝deleted_at に日時を入れて「消えたことにする」。復元や監査に便利だが、すべての検索に条件が必要になる（「データを守る」タブ参照）。'),
      T('多様な相手を指す関係に注意', 'Polymorphic association', '「コメントの対象が記事か動画か商品か」を type と id の2列で表す作りは、外部キー制約が効かない。対象ごとに列や表を分ける方が安全。'),
      T('設計をAIと詰める順番', 'Design workflow', '①画面と機能を書き出す → ②登場する「もの」を名詞で洗い出す → ③関係（1対多など）を決める → ④列と型と制約 → ⑤ER図で確認 → ⑥マイグレーションを作る。', 'これから作るアプリの画面一覧と機能一覧を渡すので、登場する「もの（エンティティ）」と関係を洗い出し、ER図（Mermaid）とテーブル定義を提案して。不明点は先に質問して。', ['おすすめ']),
    ]),
  ]});
})();
