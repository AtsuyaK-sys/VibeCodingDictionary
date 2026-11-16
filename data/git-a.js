/* Git・ターミナル・開発環境辞典 — A: 共通ヘルパー / Gitの基本 / ブランチ・マージ / 元に戻す / GitHub */
(function(){
const { $, $$, esc, tbl, seg, seq, stepper } = KIT;
const S = (title, items, note) => ({ title, note, layout:'rows', items });
const C = (title, items, note, lg) => ({ title, note, layout:lg ? 'cards lg' : 'cards', items });
const T = (name, en, desc, prompt, tags, more) => Object.assign({ name, en, desc, prompt, tags }, more || {});
const verdict = (el, cls, html) => { el.classList.remove('ok', 'bad', 'warn'); if (cls) el.classList.add(cls); el.innerHTML = html; };
window.GTH = { S, C, T, verdict };

/* ---- 小さなGitの模型（コミットグラフ用） ---- */
class Repo {
  constructor(){ this.c = []; this.br = {}; this.lane = {}; this.head = 'main'; this.n = 0; this.lanes = 0; this.addBranch('main'); this.commit('最初のコミット'); }
  addBranch(b){ if (!(b in this.lane)) this.lane[b] = this.lanes++; }
  commit(msg, parents){ const p = parents || [this.br[this.head]].filter(x => x != null); const id = this.c.length; this.c.push({ id, p, lane:this.lane[this.head], msg, label:'C' + (++this.n) }); this.br[this.head] = id; return id; }
  anc(a, b){ const st = [b], seen = new Set(); while (st.length){ const x = st.pop(); if (x === a) return true; if (seen.has(x)) continue; seen.add(x); st.push(...this.c[x].p); } return false; }
  branch(b){ this.addBranch(b); this.br[b] = this.br[this.head]; this.head = b; }
  switch(b){ this.head = b; }
  merge(o){ const a = this.br[this.head], b = this.br[o]; if (this.anc(b, a)) return 'up'; if (this.anc(a, b)){ this.br[this.head] = b; return 'ff'; } this.commit(`Merge ${o}`, [a, b]); this.c[this.c.length - 1].merge = true; return 'merge'; }
  rebase(o){ const tip = this.br[this.head], base = this.br[o]; if (this.anc(base, tip)) return 'up'; if (this.anc(tip, base)){ this.br[this.head] = base; return 'ff'; }
    const mine = []; let x = tip; while (x != null && !this.anc(x, base)){ mine.unshift(x); x = this.c[x].p[0]; }
    let parent = base; mine.forEach(id => { const o2 = this.c[id]; o2.old = true; const nid = this.c.length; this.c.push({ id:nid, p:[parent], lane:o2.lane, msg:o2.msg, label:o2.label + "'" }); parent = nid; });
    this.br[this.head] = parent; return 'rebase'; }
  squash(o){ this.commit(`${o} をまとめて取り込み`); this.c[this.c.length - 1].squash = true; return 'squash'; }
}
const LANE = ['#2563eb', '#db2777', '#16a34a', '#d97706', '#7c3aed', '#0891b2'];
function drawGraph(box, r){
  const X = (i) => 26 + i * 42, Y = (l) => 44 + l * 38, W = X(r.c.length) + 110, H = Y(r.lanes) + 4;
  let s = '';
  r.c.forEach(c => c.p.forEach(p => { const a = r.c[p], x1 = X(p), y1 = Y(a.lane), x2 = X(c.id), y2 = Y(c.lane); const col = LANE[(c.merge && a.lane !== c.lane ? a.lane : c.lane) % LANE.length];
    s += `<path class="edge ${c.old ? 'old' : ''}" stroke="${col}" d="${y1 === y2 ? `M${x1} ${y1} L${x2} ${y2}` : `M${x1} ${y1} C${x1 + 24} ${y1}, ${x2 - 24} ${y2}, ${x2} ${y2}`}"/>`; }));
  r.c.forEach(c => { s += `<circle class="node ${c.old ? 'old' : ''}" cx="${X(c.id)}" cy="${Y(c.lane)}" r="${c.merge || c.squash ? 8 : 7}" fill="${c.merge ? 'var(--stage-ink)' : LANE[c.lane % LANE.length]}"><title>${esc(c.msg)}</title></circle><text x="${X(c.id)}" y="${Y(c.lane) + 20}" text-anchor="middle" ${c.old ? 'opacity=".35"' : ''}>${esc(c.label)}</text>`; });
  const tips = {}; Object.entries(r.br).forEach(([b, id]) => (tips[id] = tips[id] || []).push(b));
  Object.entries(tips).forEach(([id, bs]) => bs.forEach((b, k) => { const c = r.c[id], x = X(+id) + 11, y = Y(c.lane) - 15 - k * 17, w = b.length * 6.4 + 12, head = b === r.head;
    s += `<g class="tag"><rect x="${x}" y="${y - 10}" width="${w + (head ? 34 : 0)}" height="15" fill="${LANE[r.lane[b] % LANE.length]}" ${head ? 'stroke="var(--stage-ink)" stroke-width="1.5"' : ''}/><text x="${x + 6}" y="${y + 1}">${head ? 'HEAD→' : ''}${esc(b)}</text></g>`; }));
  box.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${s}</svg>`; box.scrollLeft = box.scrollWidth;
}
// LCSで行ごとの差分
function diffLines(a, b){ const A = a.split('\n'), B = b.split('\n'), n = A.length, m = B.length, L = Array.from({ length:n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out = []; let i = 0, j = 0; while (i < n || j < m){ if (i < n && j < m && A[i] === B[j]){ out.push([' ', A[i]]); i++; j++; } else if (j < m && (i >= n || L[i][j + 1] >= L[i + 1][j])){ out.push(['+', B[j]]); j++; } else { out.push(['-', A[i]]); i++; } } return out; }
// .gitignore の簡易判定（学習用）
function ignoreRe(p){ let dir = p.endsWith('/'); if (dir) p = p.slice(0, -1); const anchored = p.startsWith('/') || p.includes('/'); p = p.replace(/^\//, '');
  const rx = p.split('**').map(part => part.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*').replace(/\?/g, '[^/]')).join('.*');
  return { re:new RegExp((anchored ? '^' : '(^|/)') + rx + (dir ? '(/|$)' : '(/|$)')), dir }; }
function ignored(path, rules){ let res = false; rules.forEach(({ neg, re }) => { if (re.test(path)) res = !neg; }); return res; }
const GI_FILES = ['.env', '.env.local', '.env.example', '.gitignore', 'README.md', 'package.json', 'package-lock.json', 'src/app.js', 'src/secret.key', 'node_modules/react/index.js', 'dist/assets/app.js', 'logs/debug.log', 'error.log', '.DS_Store', 'coverage/index.html'];

/* ================= 1. Gitの基本 ================= */
TABS.push({ id:'git', label:'Gitの基本', icon:'⑂',
  intro:'Gitは<b>ファイルの変更履歴を保存する「セーブポイント」の仕組み</b>です。バイブコーディングでは、AIが大きく書き換える前にコミットしておけば、いつでもその時点に戻れます。まずは「作業ツリー → ステージ → リポジトリ → GitHub」の流れを触って覚えましょう。',
  sections:[
    C('触って覚える', [
      { name:'変更が通る4つの場所', en:'Working tree / Staging / Repository / Remote', h:430, tags:['最重要','体験'],
        demo:'<div class="kt"><div class="gt-areas"><div class="gt-area wd"><b>① 作業ツリー<i>編集中のファイル</i></b></div><div class="gt-area sg"><b>② ステージ<i>git add で置く</i></b></div><div class="gt-area rp"><b>③ ローカルの履歴<i>git commit で保存</i></b></div><div class="gt-area rm"><b>④ GitHub<i>git push で送る</i></b></div></div><div class="kt-row"><button type="button" class="kt-btn sm e1">✎ index.html を編集</button><button type="button" class="kt-btn sm e2">✎ style.css を編集</button></div><div class="kt-row"><button type="button" class="kt-btn pri sm add">git add .</button><button type="button" class="kt-btn pri sm cm">git commit</button><button type="button" class="kt-btn pri sm ps">git push</button><button type="button" class="kt-btn sm rs">git restore .</button></div><div class="gt-status kt-grow st"></div></div>',
        init:(el) => { const F = { 'index.html':{ w:0, s:0, h:0 }, 'style.css':{ w:0, s:0, h:0 } }, commits = ['C1 最初のコミット'], MSG = ['見出しを修正', '色を調整', 'ボタンを追加', '余白を調整']; let pushed = 1, last = '$ git status', fresh = -1;
          const draw = () => { const fs = Object.entries(F);
            $(el, '.wd').innerHTML = '<b>① 作業ツリー<i>編集中のファイル</i></b>' + fs.filter(([, f]) => f.w !== f.s).map(([n]) => `<div class="gt-file mod">${n}<button type="button" data-a="${n}" title="git add ${n}">＋</button></div>`).join('');
            $(el, '.sg').innerHTML = '<b>② ステージ<i>git add で置く</i></b>' + fs.filter(([, f]) => f.s !== f.h).map(([n]) => `<div class="gt-file stg">${n}</div>`).join('');
            $(el, '.rp').innerHTML = '<b>③ ローカルの履歴<i>git commit で保存</i></b>' + commits.slice().reverse().map((c, i) => `<div class="gt-commit ${commits.length - 1 - i === fresh ? 'new' : ''}">${c}</div>`).join('');
            $(el, '.rm').innerHTML = '<b>④ GitHub<i>git push で送る</i></b>' + commits.slice(0, pushed).reverse().map(c => `<div class="gt-commit">${c}</div>`).join('');
            const st = fs.filter(([, f]) => f.s !== f.h), un = fs.filter(([, f]) => f.w !== f.s), ahead = commits.length - pushed;
            let t = `<span class="d">${last}</span>\nOn branch main\n`; if (ahead) t += `<span class="y">Your branch is ahead of 'origin/main' by ${ahead} commit(s).</span> <span class="d">← pushしていないコミットがある</span>\n`;
            if (st.length) t += `Changes to be committed: <span class="d">← 次のコミットに入る</span>\n` + st.map(([n]) => `<span class="g">        modified:   ${n}</span>`).join('\n') + '\n';
            if (un.length) t += `Changes not staged for commit: <span class="d">← まだ add していない</span>\n` + un.map(([n]) => `<span class="r">        modified:   ${n}</span>`).join('\n') + '\n';
            if (!st.length && !un.length) t += 'nothing to commit, working tree clean <span class="d">← 全部保存済み</span>';
            $(el, '.st').innerHTML = t; $$(el, '[data-a]').forEach(b => b.onclick = () => { F[b.dataset.a].s = F[b.dataset.a].w; last = `$ git add ${b.dataset.a}`; draw(); }); };
          $(el, '.e1').onclick = () => { F['index.html'].w++; last = '（index.html を編集して保存）'; draw(); };
          $(el, '.e2').onclick = () => { F['style.css'].w++; last = '（style.css を編集して保存）'; draw(); };
          $(el, '.add').onclick = () => { Object.values(F).forEach(f => f.s = f.w); last = '$ git add .'; draw(); };
          $(el, '.cm').onclick = () => { const st = Object.values(F).filter(f => f.s !== f.h); if (!st.length){ last = '$ git commit -m "…"  → nothing to commit（先に git add）'; draw(); return; } const m = MSG[(commits.length - 1) % MSG.length]; commits.push(`C${commits.length + 1} ${m}`); fresh = commits.length - 1; Object.values(F).forEach(f => f.h = f.s); last = `$ git commit -m "${m}"`; draw(); };
          $(el, '.ps').onclick = () => { last = pushed === commits.length ? '$ git push  → Everything up-to-date' : `$ git push  → ${commits.length - pushed}個のコミットをGitHubへ送信`; pushed = commits.length; draw(); };
          $(el, '.rs').onclick = () => { Object.values(F).forEach(f => f.w = f.s); last = '$ git restore .  → add していない変更を捨てた'; draw(); };
          draw(); },
        desc:'編集したファイルは、<b>① 作業ツリー</b> → <code>git add</code> で <b>② ステージ</b>（次のコミットに入れるものを選ぶ場所）→ <code>git commit</code> で <b>③ ローカルの履歴</b>に保存 → <code>git push</code> で <b>④ GitHub</b> に送ります。下の黒い枠は <code>git status</code> の表示で、今どこに何があるかを教えてくれます。',
        prompt:'今の変更内容を確認して、意味のまとまりごとに分けてコミットして（1つのコミットには1つの目的）。コミットメッセージは日本語で「何を・なぜ」が分かるように書いて。' },
      { name:'差分（diff）の読み方', en:'git diff', h:360, tags:['体験'],
        demo:'<div class="kt"><div class="gt-two"><div><div class="kt-lbl">変更前</div><textarea class="kt-in a" rows="5" aria-label="変更前"></textarea></div><div><div class="kt-lbl">変更後（書き換えてみて）</div><textarea class="kt-in b" rows="5" aria-label="変更後"></textarea></div></div><div class="gt-diff kt-grow out"></div></div>',
        init:(el) => { $(el, '.a').value = '<h1>ようこそ</h1>\n<p>説明文</p>\n<button>送信</button>'; $(el, '.b').value = '<h1>ようこそ！</h1>\n<p>説明文</p>\n<button class="primary">送信する</button>\n<footer>©2026</footer>';
          const run = () => { const d = diffLines($(el, '.a').value, $(el, '.b').value); const add = d.filter(x => x[0] === '+').length, del = d.filter(x => x[0] === '-').length;
            $(el, '.out').innerHTML = `<div class="hd">index.html  <span style="color:var(--ok)">+${add}</span> <span style="color:var(--bad)">−${del}</span></div>` + d.map(([k, t]) => `<div class="${k === '+' ? 'add' : k === '-' ? 'del' : ''}">${k} ${esc(t)}</div>`).join(''); };
          $$(el, 'textarea').forEach(t => t.oninput = run); run(); },
        desc:'<code>git diff</code> は「何が変わったか」を行単位で見せます。<b>−（赤）が消えた行、＋（緑）が増えた行</b>。1文字の変更でも「行ごと削除して追加」と表示されます。AIが書き換えたあとは、<b>コミットする前に差分を見る</b>習慣をつけると、意図しない変更（関係ないファイルの書き換え・デバッグ用のコード）に気づけます。',
        prompt:'今の変更（git diff）を見て、何をどう変えたのかを要約して。依頼と関係ない変更や、消してはいけないコードを消している箇所があれば教えて。' },
      { name:'.gitignore（Gitに入れないもの）', en:'.gitignore patterns', h:420, tags:['体験','秘密を守る'],
        demo:'<div class="kt"><div class="gt-two" style="min-height:0;flex:1"><div style="display:flex;flex-direction:column;gap:4px;min-height:0"><div class="kt-lbl">.gitignore（書き換えてみて）</div><textarea class="kt-in mono gi" style="flex:1;min-height:120px" aria-label=".gitignore"></textarea></div><div style="display:flex;flex-direction:column;gap:4px;min-height:0"><div class="kt-lbl">プロジェクトのファイル</div><div class="gt-files kt-grow fl"></div></div></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.gi').value = '# 依存とビルド結果\nnode_modules/\ndist/\n\n# 秘密情報（見本は除く）\n.env*\n!.env.example\n*.key\n\n# ログとOSのゴミ\n*.log\n.DS_Store';
          const run = () => { const rules = $(el, '.gi').value.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#')).map(l => { const neg = l.startsWith('!'); return Object.assign({ neg }, ignoreRe(neg ? l.slice(1) : l)); });
            const res = GI_FILES.map(f => [f, ignored(f, rules)]); $(el, '.fl').innerHTML = res.map(([f, ig]) => `<div class="${ig ? 'ign' : 'trk'}">${f}<span class="st">${ig ? '除外' : '管理する'}</span></div>`).join('');
            const leak = res.filter(([f, ig]) => !ig && /(^|\/)(\.env(\.local)?|secret\.key)$/.test(f)).map(x => x[0]);
            verdict($(el, '.res'), leak.length ? 'bad' : 'ok', leak.length ? `❌ <b>${leak.join('・')}</b> がGitに入ります。秘密情報を除外してください。` : '✅ 秘密情報・依存・ビルド結果は除外され、必要なファイルだけが管理されます。'); };
          $(el, '.gi').oninput = run; run(); },
        desc:'<code>.gitignore</code> に書いたファイルは、Gitの管理から外れます（GitHubにも上がらない）。<code>node_modules/</code>（容量が大きく、package.jsonから再現できる）、<code>dist/</code>（ビルド結果）、<b><code>.env</code>（秘密情報）</b>、ログは必ず除外。<code>*</code> は「何でも」、<code>/</code> で終わるとフォルダ、<code>!</code> で「やっぱり含める」。すでにコミット済みのファイルは、書き足しても除外されない点に注意。',
        prompt:'このプロジェクト（Next.js / Python など）に合った .gitignore を作って。すでにGitで管理されてしまっている .env や node_modules があれば、管理から外すコマンド（git rm --cached）も教えて。' },
    ], null, true),
    { title:'コミットメッセージの書き方', note:'チームでもAIとでも通じる「接頭辞＋何をしたか」の形（Conventional Commits）が便利です。日本語でも構いません。',
      table:{ head:['接頭辞', '意味', '例'], rows:[
        ['feat', '新しい機能', 'feat: お気に入り登録ボタンを追加'], ['fix', 'バグ修正', 'fix: ログイン後にトップへ戻らない問題を修正'], ['docs', 'ドキュメントだけ', 'docs: READMEにセットアップ手順を追記'], ['style', '見た目・書式（動作は変わらない）', 'style: インデントを統一'],
        ['refactor', '動作を変えない作り直し', 'refactor: 認証処理を関数に分割'], ['perf', '速くする', 'perf: 一覧取得にインデックスを追加'], ['test', 'テスト', 'test: 決済処理のテストを追加'], ['chore', '設定・依存などの雑務', 'chore: 依存パッケージを更新'],
      ]}},
    S('Gitの基本用語とコマンド', [
      T('Git と GitHub の違い', 'Git vs GitHub', '<b>Git</b>＝自分のPCで履歴を管理する道具。<b>GitHub</b>＝Gitの履歴を置いておくWebサービス（共有・バックアップ・公開・自動化）。GitLab・Bitbucket も同じ種類。', null, ['基本']),
      T('リポジトリ', 'Repository（repo）', 'Gitで管理しているプロジェクトのフォルダと、その履歴一式。隠しフォルダ <code>.git</code> に履歴が入っている（消すと履歴も消える）。'),
      T('コミット', 'Commit', '「この時点の状態を保存」するセーブポイント。メッセージと、作者・日時・一意なID（ハッシュ）が付く。<b>小さく・こまめに</b>が基本。', null, ['基本']),
      T('ステージ（インデックス）', 'Staging area', '次のコミットに入れる変更を選んで置いておく場所。複数の変更を、目的ごとに別のコミットに分けられる。'),
      T('HEAD', 'HEAD', '「今いる場所」を指す目印。普通は今のブランチの最新コミットを指す。<code>HEAD~1</code> は1つ前のコミット。'),
      T('コミットハッシュ', 'Commit hash / SHA', '<code>a1b2c3d</code> のような、コミットごとの一意なID。最初の7文字ほどで指定できる。'),
      T('はじめる（init / clone）', 'git init / git clone', '<code>git init</code>＝今のフォルダでGitを始める。<code>git clone URL</code>＝GitHubなどのリポジトリを手元にコピーする。', null, null, { code:'git init                                   # 新しく始める\ngit clone https://github.com/user/repo.git  # コピーしてくる' }),
      T('最初の設定', 'git config', 'コミットに記録される名前とメールアドレス。GitHubに公開するなら、GitHubが用意する非公開用のメール（noreply）を使うこともできる。', null, null, { code:'git config --global user.name "Your Name"\ngit config --global user.email "you@example.com"\ngit config --global init.defaultBranch main' }),
      T('状態を見る（status）', 'git status', '今どのファイルが変更・ステージ済みかを見る。迷ったらまずこれ。'),
      T('履歴を見る（log）', 'git log', 'コミットの一覧。<code>git log --oneline --graph</code> で枝分かれも見やすく表示。', null, null, { code:'git log --oneline --graph --all   # 1行ずつ・枝分かれ付き\ngit show a1b2c3d                  # そのコミットの中身' }),
      T('差分を見る（diff）', 'git diff', '<code>git diff</code>＝まだaddしていない変更、<code>git diff --staged</code>＝add済みの変更。'),
      T('こまめにコミットする理由', 'Commit often', 'AIに大きな変更を頼む前・うまく動いた直後にコミットしておくと、失敗してもその時点に戻れる。<b>「動いたらコミット」</b>が合言葉。', 'ここまでの変更が正しく動いているので、今の状態をコミットして。そのあとで次の機能（〇〇）に取りかかって。', ['バイブコーディング']),
      T('タグ', 'git tag', 'リリースした時点など、特定のコミットに名前（v1.0.0）を付ける。'),
      T('README', 'README.md', 'リポジトリの説明書。何のアプリか・動かし方・必要な環境変数を書く。GitHubのトップに表示される。AIに作ってもらうと楽。', 'このプロジェクトのREADME.mdを作って。概要、スクリーンショットの置き場所、必要な環境（Nodeのバージョン）、セットアップ手順、環境変数（.env.example）、開発・ビルドのコマンドを含めて。'),
      T('GUIで使う', 'Git clients', 'コマンドが不安なら、VS Code・Cursor の「ソース管理」画面、GitHub Desktop、Fork、GitKraken などで、ボタン操作でコミット・差分確認ができる。'),
    ]),
  ]});

/* ================= 2. ブランチ・マージ ================= */
const BNAMES = ['feature/login', 'feature/design', 'fix/typo', 'feature/api', 'feature/search'];
const MR = (mode) => { const r = new Repo(); r.commit('トップページ'); r.branch('feature'); r.commit('ログイン画面'); r.commit('ログイン処理'); r.switch('main'); r.commit('バグ修正');
  if (mode === 1) r.merge('feature'); if (mode === 2){ r.switch('feature'); r.rebase('main'); } if (mode === 3) r.squash('feature'); return r; };
const MR_NOTE = ['main と feature が枝分かれした状態です。両方に新しいコミットがあります。', '<b>merge</b>：2本の歴史をそのまま残し、合流点に<b>マージコミット</b>を作ります。何が起きたか正確に残る。安全。', '<b>rebase</b>：feature のコミットを main の先端に<b>付け替え</b>て一直線にします（C3\' のようにIDが変わる・薄い点は古いコミット）。履歴はきれいだが、<b>共有済みのブランチではやらない</b>。', '<b>squash merge</b>：feature の変更を<b>1つのコミットにまとめて</b> main に入れます。GitHubのプルリクエストでよく使う。main の履歴が1機能1コミットで読みやすい。'];

TABS.push({ id:'branch', label:'ブランチ・マージ', icon:'⑃',
  intro:'<b>ブランチ</b>は、本線（main）に影響を与えずに作業するための「枝」です。AIに新しい機能を作らせるときは、ブランチを切ってから頼めば、うまくいかなくても枝ごと捨てるだけ。下のシミュレーターで、コミット・ブランチ・マージ・リベースを自由に試せます。',
  sections:[
    C('動かして理解する', [
      { name:'ブランチのシミュレーター', en:'Branch / merge / rebase playground', h:460, wide:true, tags:['体験','最重要'],
        demo:'<div class="kt"><div class="gt-ctl"><button type="button" class="kt-btn pri sm cm">コミット</button><button type="button" class="kt-btn sm br">＋ ブランチを作る</button><span class="kt-lbl">今いる</span><select class="sw" aria-label="今いるブランチ"></select><span class="kt-lbl">相手</span><select class="ot" aria-label="相手のブランチ"></select><button type="button" class="kt-btn sm mg">相手をマージ</button><button type="button" class="kt-btn sm rb">相手の上にリベース</button><button type="button" class="kt-btn sm rs">最初から</button></div><div class="gt-graph kt-grow g"></div><div class="kt-code log"></div><div class="kt-verdict res">「コミット」「ブランチを作る」から始めてみてください。</div></div>',
        init:(el) => { let r, bi, cmds; const MSGS = ['画面を追加', '処理を実装', '見た目を調整', 'テストを追加', 'バグ修正', '文言を修正'];
          const sync = () => { const bs = Object.keys(r.br); $(el, '.sw').innerHTML = bs.map(b => `<option ${b === r.head ? 'selected' : ''}>${b}</option>`).join(''); const others = bs.filter(b => b !== r.head); $(el, '.ot').innerHTML = others.map(b => `<option>${b}</option>`).join('') || '<option value="">（なし）</option>'; drawGraph($(el, '.g'), r); $(el, '.log').textContent = cmds.slice(-5).join('\n'); };
          const reset = () => { r = new Repo(); r.commit('トップページ'); bi = 0; cmds = ['$ git log --oneline --graph  （main に2つのコミット）']; sync(); verdict($(el, '.res'), '', '「コミット」「ブランチを作る」から始めてみてください。'); };
          $(el, '.cm').onclick = () => { const m = MSGS[r.n % MSGS.length]; r.commit(m); cmds.push(`$ git commit -m "${m}"   # ${r.head}`); sync(); verdict($(el, '.res'), '', `<b>${r.head}</b> にコミットを追加しました。ブランチの目印が新しいコミットに進みます。`); };
          $(el, '.br').onclick = () => { const b = BNAMES[bi++ % BNAMES.length] + (bi > BNAMES.length ? bi : ''); r.branch(b); cmds.push(`$ git switch -c ${b}`); sync(); verdict($(el, '.res'), '', `今いる場所から <b>${b}</b> を作って移動しました。ここでのコミットは main に影響しません。`); };
          $(el, '.sw').onchange = (e) => { r.switch(e.target.value); cmds.push(`$ git switch ${e.target.value}`); sync(); verdict($(el, '.res'), '', `<b>${e.target.value}</b> に移動しました（HEADが移る）。`); };
          $(el, '.mg').onclick = () => { const o = $(el, '.ot').value; if (!o) return; const k = r.merge(o); cmds.push(`$ git merge ${o}   # ${r.head} に取り込む`); sync();
            verdict($(el, '.res'), k === 'up' ? 'warn' : 'ok', { up:'すでに取り込み済みです（Already up to date）。', ff:'<b>早送り（fast-forward）</b>：枝分かれしていなかったので、目印を前に進めるだけで済みました。', merge:'<b>マージコミット</b>を作って、2本の歴史を合流させました（黒い点）。' }[k]); };
          $(el, '.rb').onclick = () => { const o = $(el, '.ot').value; if (!o) return; const k = r.rebase(o); cmds.push(`$ git rebase ${o}   # ${r.head} を付け替え`); sync();
            verdict($(el, '.res'), k === 'rebase' ? 'warn' : k === 'up' ? 'warn' : 'ok', { up:'すでに相手の先端の上にあります。', ff:'相手の先端まで進めました。', rebase:'<b>コミットを相手の先端に付け替えました</b>（\' 付きが新しいコミット、薄い点は元のコミット）。IDが変わるので、<b>push済みのブランチでは使わない</b>のが原則です。' }[k]); };
          $(el, '.rs').onclick = reset; reset(); },
        desc:'丸がコミット、線が「どのコミットから続いているか」、色付きの札がブランチ（の先端）、<b>HEAD→</b> が今いる場所です。ブランチを作ってコミットしてから main に戻り、「相手をマージ」すると合流します。main 側にもコミットしてからマージすると、マージコミット（黒い点）ができます。',
        prompt:'新機能（〇〇）を作るので、main から feature/〇〇 ブランチを作って、そこで実装して。完成してテストが通ったら main にマージする手順も教えて。main には直接コミットしないで。' },
      { name:'merge・rebase・squash の違い', en:'Merge vs rebase vs squash', h:360, tags:['比較'],
        demo:'<div class="kt"><span class="sw"></span><div class="gt-graph kt-grow g"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.sw').replaceWith(seg(['分岐した状態', 'merge', 'rebase', 'squash merge'], i => { drawGraph($(el, '.g'), MR(i)); $(el, '.res').innerHTML = MR_NOTE[i]; }).el); },
        desc:'ブランチを取り込む方法は3通り。迷ったら<b>merge（GitHubのプルリクエストなら squash merge）</b>を使えば安全です。rebase は履歴を書き換えるので、自分だけのブランチを整えるときに使います。',
        prompt:'このリポジトリのブランチの取り込み方を決めたい。個人開発で、GitHubのプルリクエストを使う前提で、merge・squash merge・rebase のどれをおすすめするか理由とともに教えて。GitHubのリポジトリ設定も合わせて。' },
      { name:'コンフリクト（衝突）の直し方', en:'Resolving merge conflicts', h:400, tags:['体験','ハマりどころ'],
        demo:'<div class="kt"><div class="kt-lbl">src/config.js（マージしたら衝突しました）</div><div class="gt-conf cf"></div><div class="kt-row"><button type="button" class="kt-btn sm a">今のブランチを採用</button><button type="button" class="kt-btn sm b">取り込む側を採用</button><button type="button" class="kt-btn sm both">両方残す</button><button type="button" class="kt-btn sm rs">元に戻す</button></div><div class="kt-code out kt-grow"></div></div>',
        init:(el) => { const A = 'const title = "Vibe Coding 辞典";', B = 'const title = "バイブコーディング辞典";', show = () => { $(el, '.cf').innerHTML = `<div class="m">&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD（今いるブランチ：main）</div><div class="a">${esc(A)}</div><div class="m">=======</div><div class="b">${esc(B)}</div><div class="m">&gt;&gt;&gt;&gt;&gt;&gt;&gt; feature/rename（取り込むブランチ）</div>`; $(el, '.out').textContent = '# 同じ行を両方のブランチで変えたので、Gitはどちらにするか決められません。\n# 印（<<<<<<< ======= >>>>>>>）の間を見て、正しい形に直します。'; };
          const done = (code) => { $(el, '.cf').innerHTML = code.split('\n').map(l => `<div>${esc(l)}</div>`).join(''); $(el, '.out').textContent = '# 印を消して正しい内容にしたら\ngit add src/config.js\ngit commit        # マージを完了（メッセージは自動で入る）'; };
          $(el, '.a').onclick = () => done(A); $(el, '.b').onclick = () => done(B); $(el, '.both').onclick = () => done(A + '\nconst subtitle = "バイブコーディング辞典";'); $(el, '.rs').onclick = show; show(); },
        desc:'2つのブランチで<b>同じファイルの同じ場所</b>を変えると、Gitはどちらを残すか決められず、ファイルに印（<code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code> <code>=======</code> <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code>）を付けて止まります。印の間を見比べて正しい形に直し、印を消して <code>git add</code> → <code>git commit</code>。VS Code・Cursor ではボタンで選べます。AIに任せるときは「両方の意図」を伝えるのがコツ。',
        prompt:'マージでコンフリクトが起きました。各ファイルのコンフリクト箇所について、両方のブランチが何をしようとしていたかを説明して、両方の意図を活かした解決案を出して。勝手に片方を消さないで。' },
    ], null, true),
    { title:'ブランチの運用ルール', table:{ head:['方式', '流れ', '向いている'], rows:[
      ['GitHub Flow', 'main から機能ごとにブランチ → プルリクエスト → レビュー・自動テスト → main にマージ → デプロイ', '個人〜小さなチーム・Webサービス（おすすめ）'],
      ['トランクベース', 'main に小さく頻繁にマージ。未完成の機能はフラグで隠す', '自動テストが充実したチーム'],
      ['Git Flow', 'main・develop・feature・release・hotfix を使い分ける', 'リリース日が決まったアプリ（やや複雑）'],
    ]}},
    S('ブランチの用語とコマンド', [
      T('ブランチ', 'Branch', '歴史の枝。実体は「あるコミットを指す目印」なので、作るのは一瞬で軽い。機能・修正ごとに作る。', null, ['基本'], { code:'git branch                 # 一覧\ngit switch -c feature/login  # 作って移動\ngit switch main            # 移動\ngit branch -d feature/login  # 削除（マージ済み）' }),
      T('main（master）', 'Default branch', '本線のブランチ。公開中のコードを置き、直接コミットせずにブランチからマージするのが安全。昔は master という名前が一般的だった。'),
      T('switch と checkout', 'git switch / git checkout', 'ブランチの移動は <code>git switch</code>（新しい書き方）。<code>git checkout</code> はブランチ移動とファイルの復元の両方ができる古いコマンド。'),
      T('マージ（早送り・3方向）', 'Fast-forward / 3-way merge', '枝分かれしていなければ目印を進めるだけ（早送り）。両方に進みがあればマージコミットを作る（3方向マージ）。'),
      T('リベース', 'git rebase', '自分のコミットを、相手の先端に付け替える。履歴が一直線になるが、<b>コミットIDが変わる</b>ので、共有済み（push済み）のブランチでは使わない。', null, ['注意']),
      T('チェリーピック', 'git cherry-pick', '別のブランチの<b>特定のコミットだけ</b>を、今のブランチにコピーする。修正だけを先に本番へ入れたいときなど。'),
      T('スカッシュ', 'Squash', '複数のコミットを1つにまとめる。プルリクエストの「Squash and merge」でよく使う。'),
      T('先端が分からなくなった（detached HEAD）', 'Detached HEAD', '過去のコミットを直接開いた状態。ここでコミットすると、どのブランチにも属さず迷子になる。<code>git switch -c 新しい名前</code> で枝にすれば保存できる。'),
      T('ワークツリー', 'git worktree', '1つのリポジトリから、<b>別のブランチを別のフォルダに同時に</b>開く機能。AIエージェントに複数の作業を並行してやらせるときに便利（Claude Code なども使う）。', null, ['AI活用'], { code:'git worktree add ../myapp-feature feature/search\ngit worktree list\ngit worktree remove ../myapp-feature' }),
      T('ブランチ名の付け方', 'Branch naming', '<code>feature/〇〇</code>（機能）・<code>fix/〇〇</code>（修正）・<code>chore/〇〇</code>（雑務）のように種類／内容で。英小文字とハイフン。'),
      T('保護されたブランチ', 'Branch protection', 'GitHubの設定で、main への直接push禁止・プルリクエスト必須・テスト合格必須にできる。うっかり本番を壊すのを防ぐ。'),
    ]),
  ]});

/* ================= 3. 元に戻す ================= */
const RESET = [
  { l:'--soft', cmd:'git reset --soft HEAD~1', box:['on', 'on', ''], h:'<span class="gt-chip">C1</span><span class="gt-chip">C2</span><span class="gt-chip gone">C3</span>', s:'<span class="gt-chip st">ボタン＝赤</span>', w:'<span class="gt-chip">ボタン＝赤</span>', note:'コミットだけを取り消し、<b>変更はステージに残ります</b>。「コミットメッセージを直したい」「コミットをまとめ直したい」とき。' },
  { l:'--mixed（標準）', cmd:'git reset HEAD~1', box:['on', '', ''], h:'<span class="gt-chip">C1</span><span class="gt-chip">C2</span><span class="gt-chip gone">C3</span>', s:'（空）', w:'<span class="gt-chip ch">ボタン＝赤</span>', note:'コミットとステージを取り消し、<b>変更は作業ツリーに残ります</b>（add前の状態）。何もつけない reset はこれ。' },
  { l:'--hard', cmd:'git reset --hard HEAD~1', box:['bad', 'bad', 'bad'], h:'<span class="gt-chip">C1</span><span class="gt-chip">C2</span><span class="gt-chip gone">C3</span>', s:'（空）', w:'<span class="gt-chip gone">ボタン＝赤</span> 消えた', note:'⚠ <b>変更そのものが消えます</b>。まだコミットしていない作業も消えるので要注意（reflog で戻せることもある）。' },
  { l:'revert', cmd:'git revert HEAD', box:['', '', 'on'], h:'<span class="gt-chip">C1</span><span class="gt-chip">C2</span><span class="gt-chip">C3</span><span class="gt-chip st">C4 Revert</span>', s:'（空）', w:'元の色に戻った', note:'C3 を<b>打ち消す新しいコミット</b>を作ります。履歴は消さないので、<b>push済みのコミットを取り消すならこれ</b>。' },
];
TABS.push({ id:'undo', label:'元に戻す', icon:'↺',
  intro:'「AIに頼んだら全部壊れた」「間違えてコミットした」——Gitを使っていれば、ほとんどの場合<b>元に戻せます</b>。状況ごとの戻し方を逆引きで探せるようにしました。消えたように見えても <code>git reflog</code> で救えることが多いので、焦って操作を重ねないこと。',
  sections:[
    C('仕組みを見る', [
      { name:'reset の3つのモードと revert', en:'reset --soft / --mixed / --hard, revert', h:380, tags:['体験','比較'],
        demo:'<div class="kt"><div class="kt-lbl">直前のコミット C3「ボタンの色を赤に」を取り消したい</div><span class="sw"></span><div class="kt-code cmd"></div><div class="gt-boxes"><div class="w"><b>作業ツリー</b><span></span></div><div class="s"><b>ステージ</b><span></span></div><div class="h"><b>コミット履歴</b><span></span></div></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.sw').replaceWith(seg(RESET.map(x => x.l), i => { const R = RESET[i]; $(el, '.cmd').textContent = '$ ' + R.cmd; ['w', 's', 'h'].forEach((k, j) => { const b = $(el, '.' + k); b.className = k + ' ' + (R.box[j] || ''); b.querySelector('span').innerHTML = R[k]; }); verdict($(el, '.res'), i === 2 ? 'bad' : i === 3 ? 'ok' : '', R.note); }, 1).el); },
        desc:'<code>git reset</code> は「どこまで巻き戻すか」が3段階。<b>soft</b>＝コミットだけ、<b>mixed</b>＝コミットとステージ、<b>hard</b>＝作業中の変更まで全部。公開済み（push済み）のコミットを取り消すときは、履歴を書き換えない <b>revert</b> を使います。',
        prompt:'直前のコミットを取り消したい。まだpushしていない／もうpushした、それぞれの場合で安全なコマンドを教えて。作業中の変更は消したくない。' },
      { name:'AIの変更を安全に試す手順', en:'Safe AI workflow', h:350, tags:['バイブコーディング','手順'],
        init:(el) => stepper(el, ['今の状態が動くことを確認して<b>コミット</b>する（<code>git add . && git commit -m "動く状態"</code>）。', '新しい<b>ブランチ</b>を作る（<code>git switch -c try/新機能</code>）。', 'AIに変更を頼む。大きな変更は小さく分けて、1つずつ。', '<b>差分を確認</b>（<code>git diff</code>）し、動作を確かめる。', 'うまくいったら<b>コミット</b>して main にマージ（<code>git switch main && git merge try/新機能</code>）。', 'だめなら<b>捨てる</b>：<code>git switch main</code> → <code>git branch -D try/新機能</code>。main は無傷。'], { title:'壊れても戻れる状態を先に作ってから頼む' }),
        desc:'AIは一度に多くのファイルを書き換えます。<b>「コミットしてから頼む」「ブランチで試す」</b>の2つを習慣にすれば、どんな失敗も数秒で取り消せます。Claude Code や Cursor のチェックポイント（巻き戻し）機能も便利ですが、Gitのコミットはそれより確実な保存です。',
        prompt:'これから大きめの変更を頼みます。始める前に今の状態をコミットして、try/〇〇 ブランチを作ってから作業して。終わったら差分の要約を見せて、マージするか私に確認して。' },
    ], null, true),
    { title:'困ったときの逆引き', note:'「pushしたかどうか」で安全な方法が変わります。<b>push済みなら履歴を書き換えない方法（revert）</b>を選ぶのが原則です。',
      table:{ head:['こんなとき', 'コマンド', 'ひとこと'], rows:[
        ['保存前（add前）の変更を捨てたい', '<code>git restore ファイル名</code>（全部なら <code>.</code>）', '変更は消える。迷ったら stash'],
        ['add を取り消したい', '<code>git restore --staged ファイル名</code>', '変更は残る'],
        ['直前のコミットメッセージを直したい', '<code>git commit --amend -m "新しいメッセージ"</code>', 'push前だけ'],
        ['直前のコミットに入れ忘れたファイルがある', '<code>git add 忘れたファイル</code> → <code>git commit --amend --no-edit</code>', 'push前だけ'],
        ['直前のコミットを取り消したい（変更は残す）', '<code>git reset --soft HEAD~1</code>', 'push前だけ'],
        ['push済みのコミットを取り消したい', '<code>git revert コミットID</code>', '打ち消すコミットを追加。安全'],
        ['AIが壊した。昨日の状態に戻したい', '<code>git log --oneline</code> で探す → <code>git switch -c rescue コミットID</code>', 'まず別ブランチで確認してから'],
        ['1つのファイルだけ過去の状態に戻したい', '<code>git restore --source=コミットID ファイル名</code>', 'ほかのファイルはそのまま'],
        ['作業を一時的にしまいたい', '<code>git stash</code> → 戻すときは <code>git stash pop</code>', '急ぎの修正を先にしたいとき'],
        ['間違ったブランチでコミットした', '<code>git switch 正しいブランチ</code> → <code>git cherry-pick コミットID</code> → 元のブランチで <code>git reset --hard HEAD~1</code>', 'push前なら'],
        ['reset --hard で消してしまった／ブランチを消した', '<code>git reflog</code> で行き先を探す → <code>git switch -c rescue HEAD@{2}</code>', '数十日は残っている'],
        ['pull したらコンフリクトした', 'ファイルを直して <code>git add</code> → <code>git commit</code>（やめるなら <code>git merge --abort</code>）', '「ブランチ・マージ」タブ参照'],
        ['秘密情報をpushしてしまった', 'まずキーを無効化 → <code>git filter-repo</code> で履歴から削除', 'セキュリティ辞典参照'],
        ['追跡していないファイルを全部消したい', '<code>git clean -n</code>（確認）→ <code>git clean -fd</code>', '⚠ 元に戻せない'],
      ]}},
    S('戻すためのコマンド', [
      T('restore', 'git restore', '作業ツリーやステージの変更を元に戻す。<code>--staged</code> で add の取り消し、<code>--source</code> で過去のコミットから取り出す。'),
      T('reset', 'git reset', 'ブランチの先端を過去に戻す。push済みのブランチで使うと、他の人と履歴が食い違う。', null, ['注意']),
      T('revert', 'git revert', '指定したコミットの変更を打ち消す新しいコミットを作る。履歴を壊さないので、共有済みのブランチでも安全。', null, ['安全']),
      T('stash', 'git stash', '作業中の変更を一時的に退避して、きれいな状態にする。<code>git stash list</code> で一覧、<code>pop</code> で戻す。', null, null, { code:'git stash push -m "作業途中"   # しまう\ngit stash list                  # 一覧\ngit stash pop                   # 戻す' }),
      T('reflog', 'git reflog', 'HEADが動いた記録（自分の手元だけ）。reset や削除で消えたように見えるコミットも、ここから見つけて戻せる。最後の砦。', null, ['救出']),
      T('amend', 'git commit --amend', '直前のコミットを作り直す。メッセージの修正・ファイルの追加。push後に使うと履歴の食い違いが起きる。'),
      T('clean', 'git clean', '追跡していないファイル（新しく作ったファイル）を削除する。<b>元に戻せない</b>ので、必ず <code>-n</code>（試し実行）で確認してから。', null, ['危険']),
      T('強制push', 'git push --force-with-lease', '履歴を書き換えたあとにリモートへ上書きする。<code>--force</code> より安全（他の人の更新を消さない）。main では使わない。', null, ['注意']),
      T('AIツールの巻き戻し', 'Checkpoints / rewind', 'Claude Code・Cursor などには、AIの変更前に戻すチェックポイント機能がある。Gitと併用すると安心。ただし外部への操作（DB・デプロイ）は戻らない。'),
    ]),
  ]});

/* ================= 4. GitHub・共同作業 ================= */
TABS.push({ id:'github', label:'GitHub・共同作業', icon:'☁',
  intro:'GitHubは、コードの<b>バックアップ・共有・公開・自動化</b>の拠点です。push / pull の関係、プルリクエストの流れ、GitHub Actions による自動テストやデプロイを押さえれば、個人開発でもチーム開発でも困りません。',
  sections:[
    C('動かして理解する', [
      { name:'push・pull・fetch の関係', en:'Local vs remote', h:400, tags:['体験','基本'],
        demo:'<div class="kt"><div class="gt-lanes"><div class="gt-lane"><b>GitHub<br>（origin/main）</b><div class="gt-dots r"></div></div><div class="gt-lane"><b>PCが覚えている<br>GitHubの状態</b><div class="gt-dots o"></div></div><div class="gt-lane"><b>あなたのPC<br>（main）</b><div class="gt-dots l"></div></div></div><div class="kt-row"><button type="button" class="kt-btn sm lc">自分でコミット</button><button type="button" class="kt-btn sm rc">仲間がpush</button></div><div class="kt-row"><button type="button" class="kt-btn pri sm fe">git fetch</button><button type="button" class="kt-btn pri sm pl">git pull</button><button type="button" class="kt-btn pri sm ps">git push</button><button type="button" class="kt-btn sm rs">最初から</button></div><div class="gt-status kt-grow st"></div></div>',
        init:(el) => { let L, R, O, n, m, msg;
          const dots = (arr) => arr.map(c => `<i class="${c.startsWith('M') ? 'merge' : c.startsWith('B') ? 'other' : ''}">${c}</i>`).join('');
          const draw = () => { $(el, '.r').innerHTML = dots(R); $(el, '.o').innerHTML = dots(O); $(el, '.l').innerHTML = dots(L); const ahead = L.filter(c => !O.includes(c)).length, behind = O.filter(c => !L.includes(c)).length;
            $(el, '.st').innerHTML = `<span class="d">${msg}</span>\n$ git status\nOn branch main\n` + (ahead && behind ? `<span class="r">Your branch and 'origin/main' have diverged (${ahead} and ${behind})</span> <span class="d">← 両方に進みがある → pull で合流</span>` : ahead ? `<span class="y">Your branch is ahead of 'origin/main' by ${ahead} commit(s).</span> <span class="d">← push できる</span>` : behind ? `<span class="y">Your branch is behind 'origin/main' by ${behind} commit(s).</span> <span class="d">← pull で取り込む</span>` : `<span class="g">Your branch is up to date with 'origin/main'.</span>`) + (R.length !== O.length || R.some((c, i) => c !== O[i]) ? '\n<span class="d">（ただしGitHubには、まだ fetch していない新しいコミットがあります）</span>' : ''); };
          const reset = () => { L = ['A1', 'A2']; R = ['A1', 'A2']; O = ['A1', 'A2']; n = 2; m = 0; msg = '（全員が同じ状態）'; draw(); };
          $(el, '.lc').onclick = () => { L.push('A' + (++n)); msg = '（あなたがPCでコミット）'; draw(); };
          $(el, '.rc').onclick = () => { R.push('B' + (++m)); msg = '（仲間がGitHubにpush。あなたのPCはまだ知らない）'; draw(); };
          $(el, '.fe').onclick = () => { O = [...R]; msg = '$ git fetch  → GitHubの最新を確認（あなたのmainはそのまま）'; draw(); };
          $(el, '.pl').onclick = () => { O = [...R]; const mine = L.filter(c => !R.includes(c)); if (!mine.length){ L = [...R]; msg = '$ git pull  → 早送りで最新に'; } else if (R.every(c => L.includes(c))){ msg = '$ git pull  → Already up to date'; } else { L = [...R, ...mine, 'M' + (n + m)]; msg = '$ git pull  → 取り込んで、マージコミット M を作成'; } draw(); };
          $(el, '.ps').onclick = () => { if (R.every(c => L.includes(c))){ const cnt = L.length - R.length; R = [...L]; O = [...L]; msg = cnt ? `$ git push  → ${cnt}個のコミットを送信` : '$ git push  → Everything up-to-date'; } else msg = '$ git push\n<span class="r"> ! [rejected]  main -> main (fetch first)\nerror: failed to push some refs</span>\n→ GitHubに自分の知らないコミットがある。先に git pull'; draw(); };
          $(el, '.rs').onclick = reset; reset(); },
        desc:'<b>push</b>＝自分のコミットをGitHubへ送る。<b>fetch</b>＝GitHubの最新を確認するだけ（自分の作業は変わらない）。<b>pull</b>＝fetch＋取り込み。GitHubに自分の知らないコミットがあると push は拒否されるので、先に pull します。「仲間がpush」を押してから「自分でコミット」→「git push」で、拒否される様子が見られます。',
        prompt:'git push したら "rejected (fetch first)" と出ました。何が起きているのか説明して、自分の変更を消さずに安全に push する手順を教えて。' },
      { name:'プルリクエストの流れ', en:'Pull request lifecycle', h:430, tags:['仕組み','チーム'],
        init:(el) => seq(el, { actors:[{ icon:'🧑‍💻', label:'あなた' }, { icon:'🐙', label:'GitHub' }, { icon:'🤖', label:'自動テスト・レビュー' }], steps:[
          { f:0, t:0, label:'ブランチを作って開発', note:'<code>git switch -c feature/search</code> で作業用のブランチを作り、コミットを重ねます。' },
          { f:0, t:1, label:'git push -u origin feature/search', note:'ブランチをGitHubに送ります。' },
          { f:0, t:1, label:'プルリクエスト（PR）を作成', note:'「このブランチを main に取り込んでください」という依頼。何を・なぜ変えたかを書きます。<code>gh pr create</code> でも作れます。' },
          { f:1, t:2, label:'GitHub Actions が自動実行', dash:true, note:'テスト・型チェック・リンター・プレビュー環境のデプロイ（Vercelなど）が自動で走ります。' },
          { f:2, t:1, label:'❌ テスト失敗・レビューの指摘', bad:true, note:'失敗やレビューコメント（人やAIレビュー）が付きます。' },
          { f:0, t:1, label:'修正してもう一度push', note:'同じブランチに追加でpushすれば、PRに自動で反映されます。' },
          { f:2, t:1, label:'✓ すべて合格・承認', good:true, dash:true, note:'テストが通り、レビューで承認されました。' },
          { f:0, t:1, label:'Squash and merge → ブランチ削除', good:true, note:'main に取り込み、作業ブランチは削除。main への取り込みで本番デプロイが自動実行されることも。' },
          { f:1, t:0, label:'git switch main && git pull', dash:true, note:'手元の main を最新にして、次の作業へ。' },
        ]}),
        desc:'<b>プルリクエスト（PR）</b>は「この変更を main に入れてよいか」を確認する場です。個人開発でも、PRを通すと<b>自動テスト・プレビュー環境・AIレビュー</b>を挟めて、壊れたコードが本番に入るのを防げます。',
        prompt:'今のブランチの変更でプルリクエストを作って。タイトルは変更内容が分かる日本語で、本文には「何を・なぜ・どう確認したか・スクリーンショットの場所」を書いて。gh コマンドを使って。' },
    ], null, true),
    S('GitHubの用語と機能', [
      T('リモートと origin', 'Remote / origin', 'GitHubなど、手元以外にあるリポジトリ。clone すると元の場所が <code>origin</code> という名前で登録される。', null, ['基本'], { code:'git remote -v                                   # 確認\ngit remote add origin https://github.com/you/app.git\ngit push -u origin main                         # 初回' }),
      T('フォーク', 'Fork', '他人のリポジトリを、自分のアカウントにまるごとコピーする。オープンソースへの貢献や、テンプレートの改造に。'),
      T('プルリクエスト', 'Pull Request（PR）', '変更を取り込んでもらう依頼。差分の確認・コメント・自動テストがまとまる。GitLabでは Merge Request と呼ぶ。'),
      T('レビュー', 'Code review', 'PRの変更を読んでコメント・承認する。GitHub Copilot や Claude などのAIレビューを組み込むこともできる。'),
      T('Issue', 'Issues', 'やること・バグ・要望を管理するチケット。PRの本文に <code>Closes #12</code> と書くと、マージ時に自動で閉じる。'),
      T('GitHub Actions', 'CI/CD', 'pushやPRをきっかけに、テスト・ビルド・デプロイ・定期実行を自動で行う仕組み。<code>.github/workflows/*.yml</code> に書く。', 'GitHub Actions で、プルリクエストのたびに npm ci → 型チェック → リンター → テスト を実行するワークフローを作って。Node のバージョンは .nvmrc に合わせて。', ['自動化'], { code:'# .github/workflows/ci.yml\nname: CI\non: [pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version-file: .nvmrc, cache: npm }\n      - run: npm ci\n      - run: npm run lint\n      - run: npm test' }),
      T('Secrets（Actionsの秘密情報）', 'Actions secrets', 'ワークフローで使うAPIキーは、リポジトリの Settings → Secrets に登録し、<code>${{ secrets.NAME }}</code> で参照する。コードに書かない。'),
      T('Dependabot', 'Dependabot', '依存パッケージの脆弱性を知らせ、更新のPRを自動で作ってくれる。Settings → Code security で有効化。'),
      T('Releases', 'Releases', 'タグを付けたバージョンごとに、変更点とファイルを公開する機能。'),
      T('GitHub Pages', 'GitHub Pages', 'リポジトリのHTMLを無料でWebサイトとして公開できる。静的サイト・ポートフォリオ向け。'),
      T('Codespaces', 'GitHub Codespaces', 'ブラウザの中で動く開発環境。自分のPCに何も入れずに開発できる。'),
      T('認証（HTTPS・SSH）', 'Authentication', 'GitHubへのpushには、HTTPSなら<b>個人用アクセストークン</b>（パスワードは不可）、またはSSH鍵が必要。GitHub CLI（<code>gh auth login</code>）を使うと設定が簡単。'),
      T('公開・非公開', 'Public / Private', '公開リポジトリは誰でも読める（秘密情報に注意）。非公開でも、招待した人とGitHub上の連携アプリは読める。'),
      T('ライセンス', 'LICENSE', '公開したコードを他人がどう使ってよいかの宣言。MIT（ゆるい）・Apache-2.0・GPL（改変も公開が必要）など。書かないと「使ってよいか不明」になる。'),
      T('GitHub CLI', 'gh', 'ターミナルからPR作成・Issue・Actionsの確認などができる公式ツール。AIエージェントもよく使う。', null, null, { code:'gh auth login\ngh repo create my-app --private --source=. --push\ngh pr create --fill\ngh pr checks\ngh run watch' }),
      T('.github フォルダ', '.github', 'ワークフロー・PRやIssueのテンプレート・CODEOWNERS など、GitHub用の設定を置く場所。'),
    ]),
  ]});
})();
