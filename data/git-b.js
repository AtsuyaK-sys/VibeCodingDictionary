/* Git・ターミナル・開発環境辞典 — B: ターミナル / パッケージ・実行環境 / 環境変数・設定ファイル / ローカル開発 */
(function(){
const { $, $$, esc, tbl, seg, seq, stepper } = KIT;
const { S, C, T, verdict } = window.GTH;

/* ---- 練習用ターミナル（仮想のファイル） ---- */
const F = (c) => ({ t:'f', c }), D = (c) => ({ t:'d', c });
const mkFS = () => D({ home:D({ you:D({ 'memo.txt':F('買い物：牛乳・コーヒー豆'), myapp:D({ 'package.json':F('{\n  "name": "myapp",\n  "scripts": { "dev": "next dev", "build": "next build" }\n}'), 'README.md':F('# myapp\nバイブコーディングで作ったアプリ'), '.env':F('OPENAI_API_KEY=sk-xxxx  ← 本物のキーはここ。Gitには入れない'), '.gitignore':F('node_modules/\n.env*'), src:D({ 'index.js':F('console.log("hello")'), components:D({ 'Button.jsx':F('export default function Button() { … }') }) }), public:D({ 'logo.png':F('（画像のデータ）') }) }) }) }) });
const HELP = [['pwd', '今いる場所を表示'], ['ls [-a]', '中身を一覧（-a で隠しファイルも）'], ['cd 場所', '移動（.. で1つ上、~ でホーム）'], ['mkdir 名前', 'フォルダを作る'], ['touch 名前', '空のファイルを作る'], ['cat ファイル', '中身を表示'], ['echo 文字 > ファイル', 'ファイルに書く（>> で追記）'], ['cp / mv', 'コピー／移動・名前変更'], ['rm [-r]', '削除（ゴミ箱に行かない！）'], ['tree', '階層を表示'], ['history / clear', '履歴／画面をきれいに'], ['npm run dev / node -v / git status', '開発でよく打つもの（雰囲気だけ）']];
function terminal(el){
  el.innerHTML = '<div class="kt"><div class="gt-term"><div class="gt-shell sh"><div class="out"></div><div class="inrow"><span class="p pr"></span><input class="in" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="コマンド入力"></div></div><div class="gt-tree tr"></div></div><div class="kt-row ps"></div></div>';
  const fs = mkFS(), HOME = ['home', 'you']; let cwd = ['home', 'you', 'myapp']; const hist = []; let hi = 0;
  const out = $(el, '.out'), inp = $(el, '.in'), sh = $(el, '.sh');
  const node = (p) => p.reduce((n, k) => n && n.t === 'd' ? n.c[k] : undefined, fs);
  const resolve = (p) => { if (!p) return [...cwd]; let base = p.startsWith('/') ? [] : p.startsWith('~') ? [...HOME] : [...cwd]; p.replace(/^~\/?/, '').split('/').forEach(s => { if (!s || s === '.') return; if (s === '..') base.pop(); else base.push(s); }); return base; };
  const prompt = () => `<span class="p">you@mac <b>${cwd.join('/') === HOME.join('/') ? '~' : esc(cwd[cwd.length - 1] || '/')}</b> %</span>`;
  const print = (h, cls) => { out.insertAdjacentHTML('beforeend', `<div class="ln ${cls || ''}">${h}</div>`); };
  const tree = (n, pre, depth) => Object.keys(n.c).sort().map((k, i, a) => { const ch = n.c[k], last = i === a.length - 1; return esc(pre + (last ? '└─ ' : '├─ ')) + (ch.t === 'd' ? `<span class="dir">${esc(k)}/</span>` : esc(k)) + '\n' + (ch.t === 'd' && depth < 4 ? tree(ch, pre + (last ? '   ' : '│  '), depth + 1) : ''); }).join('');
  const side = () => { const rows = []; const walk = (n, path, d) => Object.keys(n.c).sort().forEach(k => { const ch = n.c[k], p = [...path, k]; rows.push(`<div class="${ch.t === 'd' ? 'dir' : ''} ${p.join('/') === cwd.join('/') ? 'cwd' : ''} ${k.startsWith('.') ? 'hid' : ''}" style="padding-left:${d * 10 + 3}px">${ch.t === 'd' ? '📁' : '📄'} ${esc(k)}</div>`); if (ch.t === 'd') walk(ch, p, d + 1); }); rows.push(`<div class="dir ${cwd.join('/') === HOME.join('/') ? 'cwd' : ''}">🏠 ~（you）</div>`); walk(node(HOME), HOME, 1); $(el, '.tr').innerHTML = rows.join(''); };
  const run = (line) => { const raw = line.trim(); print(`${prompt()} ${esc(raw)}`); if (!raw) return; hist.push(raw); hi = hist.length;
    const red = raw.match(/^(.*?)\s*(>>?)\s*(\S+)$/), parts = (red ? red[1] : raw).split(/\s+/), cmd = parts[0], args = parts.slice(1), flags = args.filter(a => a.startsWith('-')).join(''), pos = args.filter(a => !a.startsWith('-'));
    const parent = (p) => node(p.slice(0, -1));
    const err = (m) => print(esc(m), 'e');
    switch (cmd){
      case 'help': print(HELP.map(([a, b]) => `${esc(a.padEnd(22))}<span class="c">${esc(b)}</span>`).join('\n')); break;
      case 'pwd': print('/' + cwd.join('/')); break;
      case 'ls': { const p = resolve(pos[0]), n = node(p); if (!n) return err(`ls: ${pos[0]}: No such file or directory`); if (n.t === 'f') return print(esc(pos[0])); const ks = Object.keys(n.c).sort().filter(k => flags.includes('a') || !k.startsWith('.')); print((flags.includes('a') ? '<span class="dir">./</span>  <span class="dir">../</span>  ' : '') + ks.map(k => n.c[k].t === 'd' ? `<span class="dir">${esc(k)}/</span>` : esc(k)).join('  ') || '<span class="c">（空っぽ）</span>'); break; }
      case 'cd': { const p = pos[0] ? resolve(pos[0]) : [...HOME], n = node(p); if (!n) return err(`cd: no such file or directory: ${pos[0]}`); if (n.t !== 'd') return err(`cd: not a directory: ${pos[0]}`); cwd = p; side(); break; }
      case 'mkdir': { if (!pos[0]) return err('usage: mkdir 名前'); const p = resolve(pos[0]), par = parent(p); if (!par || par.t !== 'd') return err(`mkdir: ${pos[0]}: No such file or directory`); if (par.c[p[p.length - 1]]) return err(`mkdir: ${pos[0]}: File exists`); par.c[p[p.length - 1]] = D({}); side(); break; }
      case 'touch': { if (!pos[0]) return err('usage: touch ファイル名'); const p = resolve(pos[0]), par = parent(p); if (!par) return err(`touch: ${pos[0]}: No such file or directory`); if (!par.c[p[p.length - 1]]) par.c[p[p.length - 1]] = F(''); side(); break; }
      case 'cat': { const n = node(resolve(pos[0])); if (!pos[0]) return err('usage: cat ファイル'); if (!n) return err(`cat: ${pos[0]}: No such file or directory`); if (n.t === 'd') return err(`cat: ${pos[0]}: Is a directory`); print(esc(n.c) || '<span class="c">（空のファイル）</span>'); break; }
      case 'echo': { const text = (red ? red[1] : raw).replace(/^echo\s*/, '').replace(/^["']|["']$/g, ''); if (!red){ print(esc(text)); break; } const p = resolve(red[3]), par = parent(p); if (!par || par.t !== 'd') return err(`zsh: no such file or directory: ${red[3]}`); const k = p[p.length - 1], ex = par.c[k]; par.c[k] = F(red[2] === '>>' && ex && ex.t === 'f' && ex.c ? ex.c + '\n' + text : text); side(); break; }
      case 'rm': { if (!pos[0]) return err('usage: rm [-r] 名前'); const p = resolve(pos[0]); if (p.length <= 2 || (pos[0] === '/' || pos[0] === '~' || pos[0] === '*')) return print('⚠ これは大事な場所をまるごと消すコマンドです。<b>このデモでは実行しません。</b>本物のターミナルでは確認なしで消えます。', 'w'); const par = parent(p), n = node(p); if (!n) return err(`rm: ${pos[0]}: No such file or directory`); if (n.t === 'd' && !flags.includes('r')) return err(`rm: ${pos[0]}: is a directory（フォルダは rm -r）`); delete par.c[p[p.length - 1]]; if (cwd.join('/').startsWith(p.join('/'))) cwd = p.slice(0, -1); print('<span class="c">（削除しました。rm はゴミ箱に入らず、元に戻せません）</span>'); side(); break; }
      case 'cp': case 'mv': { if (pos.length < 2) return err(`usage: ${cmd} 元 先`); const a = resolve(pos[0]), b = resolve(pos[1]), n = node(a); if (!n) return err(`${cmd}: ${pos[0]}: No such file or directory`); if (n.t === 'd' && cmd === 'cp' && !flags.includes('r')) return err(`cp: ${pos[0]} is a directory（cp -r）`); let dest = node(b), destPar, name; if (dest && dest.t === 'd'){ destPar = dest; name = a[a.length - 1]; } else { destPar = parent(b); name = b[b.length - 1]; } if (!destPar) return err(`${cmd}: ${pos[1]}: No such file or directory`); destPar.c[name] = JSON.parse(JSON.stringify(n)); if (cmd === 'mv') delete parent(a).c[a[a.length - 1]]; side(); break; }
      case 'tree': print(`<span class="dir">.</span>\n` + tree(node(cwd), '', 0)); break;
      case 'clear': out.innerHTML = ''; break;
      case 'history': print(hist.map((h, i) => `${String(i + 1).padStart(3)}  ${esc(h)}`).join('\n')); break;
      case 'whoami': print('you'); break;
      case 'date': print(new Date().toString()); break;
      case 'node': print(args[0] === '-v' || args[0] === '--version' ? 'v22.11.0' : '<span class="c">（Node.jsでJavaScriptを実行。例：node index.js）</span>'); break;
      case 'npm': print(args[0] === '-v' ? '10.9.0' : args[0] === 'run' && args[1] === 'dev' ? (cwd.includes('myapp') ? '<span class="c">> myapp dev\n> next dev</span>\n  ▲ Next.js 15\n  - Local:   <span class="dir">http://localhost:3000</span>\n<span class="g">✓ Ready</span> <span class="c">（止めるときは Ctrl + C）</span>' : '<span class="e">npm error enoent Could not read package.json</span>\n<span class="w">→ package.json がある場所（cd myapp）で実行します</span>') : '<span class="c">（npm install / npm run … など。「パッケージ」タブ参照）</span>'); break;
      case 'git': print(cwd.includes('myapp') ? 'On branch main\nnothing to commit, working tree clean' : '<span class="e">fatal: not a git repository</span>\n<span class="w">→ Gitで管理しているフォルダ（myapp）に移動してから</span>'); break;
      case 'which': print(['node', 'npm', 'git'].includes(pos[0]) ? `/usr/local/bin/${pos[0]}` : `${esc(pos[0] || '')} not found`); break;
      case 'code': print('<span class="c">（VS Code でこのフォルダが開きます）</span>'); break;
      case 'sudo': print('⚠ sudo は<b>パソコン全体の管理者権限</b>で実行するコマンドです。AIに言われても、何をするか分からないまま使わないこと。', 'w'); break;
      case 'exit': print('<span class="c">（ターミナルを閉じます…という雰囲気だけ）</span>'); break;
      default: err(`zsh: command not found: ${cmd}`); print('<span class="c">help で使えるコマンドを表示します</span>');
    }
  };
  print('<span class="c">練習用のターミナルです（本物のPCには影響しません）。help と入力してEnter。Tabキーで名前を補完、↑↓で履歴。</span>');
  $(el, '.pr').innerHTML = prompt(); side();
  inp.addEventListener('keydown', (e) => {
    if (e.key === 'Enter'){ run(inp.value); inp.value = ''; $(el, '.pr').innerHTML = prompt(); sh.scrollTop = sh.scrollHeight; }
    else if (e.key === 'ArrowUp'){ e.preventDefault(); if (hi > 0){ hi--; inp.value = hist[hi]; } }
    else if (e.key === 'ArrowDown'){ e.preventDefault(); if (hi < hist.length){ hi++; inp.value = hist[hi] || ''; } }
    else if (e.key === 'Tab'){ e.preventDefault(); const m = inp.value.match(/(\S*)$/), word = m[1], dirPart = word.includes('/') ? word.slice(0, word.lastIndexOf('/') + 1) : '', stem = word.slice(dirPart.length), n = node(resolve(dirPart || '.'));
      if (n && n.t === 'd'){ const hits = Object.keys(n.c).filter(k => k.startsWith(stem)); if (hits.length === 1) inp.value = inp.value.slice(0, inp.value.length - stem.length) + hits[0] + (n.c[hits[0]].t === 'd' ? '/' : ''); else if (hits.length > 1) print(hits.join('  '), 'c'); } } });
  sh.addEventListener('click', (e) => { if (!window.getSelection().toString()) inp.focus({ preventScroll:true }); });
  const P = ['ls', 'ls -a', 'cd src', 'cd ..', 'pwd', 'tree', 'cat .env', 'mkdir docs', 'npm run dev', 'help'];
  $(el, '.ps').innerHTML = '<span class="kt-lbl">試す：</span>' + P.map(c => `<button type="button" class="kt-btn sm">${esc(c)}</button>`).join('');
  $$(el, '.ps button').forEach(b => b.onclick = () => { run(b.textContent); $(el, '.pr').innerHTML = prompt(); sh.scrollTop = sh.scrollHeight; });
}
/* ---- パスの解決 ---- */
const PFS = ['myapp/', 'myapp/package.json', 'myapp/.env', 'myapp/src/', 'myapp/src/index.js', 'myapp/src/utils.js', 'myapp/src/components/', 'myapp/src/components/Button.jsx', 'myapp/src/components/Icon.jsx', 'myapp/public/', 'myapp/public/logo.png'];
/* ---- semver ---- */
const pv = (s) => { const m = String(s).trim().replace(/^v/, '').match(/^(\d+|x|\*)(?:\.(\d+|x|\*))?(?:\.(\d+|x|\*))?$/i); return m ? [m[1], m[2], m[3]].map(x => x === undefined || /x|\*/i.test(x) ? null : +x) : null; };
const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
function sat(v, range){ const V = pv(v); return range.split('||').some(part => part.trim().split(/\s+/).filter(Boolean).every(tok => {
  if (tok === '*' || tok === 'x' || tok === 'latest') return true; const m = tok.match(/^(\^|~|>=|<=|>|<|=)?(.+)$/), op = m[1] || '', r = pv(m[2]); if (!r) return false;
  const lo = r.map(x => x ?? 0); let hi;
  if (op === '^'){ hi = lo[0] > 0 ? [lo[0] + 1, 0, 0] : lo[1] > 0 ? [0, lo[1] + 1, 0] : [0, 0, lo[2] + 1]; return cmp(V, lo) >= 0 && cmp(V, hi) < 0; }
  if (op === '~'){ hi = r[1] === null ? [lo[0] + 1, 0, 0] : [lo[0], lo[1] + 1, 0]; return cmp(V, lo) >= 0 && cmp(V, hi) < 0; }
  if (op === '>=') return cmp(V, lo) >= 0; if (op === '>') return cmp(V, lo) > 0; if (op === '<=') return cmp(V, lo) <= 0; if (op === '<') return cmp(V, lo) < 0;
  if (r[1] === null) return V[0] === r[0]; if (r[2] === null) return V[0] === r[0] && V[1] === r[1]; return cmp(V, r) === 0; })); }
const VERS = ['0.2.3', '0.2.9', '0.3.0', '1.2.2', '1.2.3', '1.2.9', '1.3.0', '1.9.9', '2.0.0', '2.1.0'];
const RANGES = [['^1.2.3', '1.x の中で 1.2.3 以上（2.0.0 未満）。npm install の標準。<b>機能追加・修正は受け入れ、壊れる変更（メジャー）は受け入れない</b>'], ['~1.2.3', '1.2.x の中で 1.2.3 以上。<b>修正（パッチ）だけ</b>受け入れる'], ['1.2.3', 'このバージョンだけ（固定）'], ['>=1.2.0 <2.0.0', '範囲を直接書く'], ['^0.2.3', '0.x は特別扱い：0.2.x の中だけ（0.x の間は小さな変更でも壊れうるため）'], ['1.x', '1 で始まるもの全部'], ['*', '何でもよい（危険）']];
/* ---- package.json ---- */
const PKG = [['{', ''], ['  "name": "myapp",', 'name', 'パッケージの名前。公開しないアプリなら何でもよい。'], ['  "version": "0.1.0",', 'version', 'バージョン番号（メジャー.マイナー.パッチ）。'], ['  "private": true,', 'private', 'npmに誤って公開しないための印。アプリには付けておく。'], ['  "type": "module",', 'type', '"module" だと import / export の書き方（ESM）になる。ないと昔の require 方式（CommonJS）。'], ['  "scripts": {', 'scripts', '<code>npm run 名前</code> で実行できるコマンドの一覧。dev（開発サーバー）・build（本番用に変換）・start（本番起動）・lint・test が定番。'], ['    "dev": "next dev",', ''], ['    "build": "next build",', ''], ['    "lint": "eslint ."', ''], ['  },', ''], ['  "dependencies": {', 'dependencies', 'アプリが<b>動くのに必要</b>なパッケージ。<code>npm install 名前</code> で追加される。'], ['    "next": "^15.0.0",', ''], ['    "react": "^19.0.0"', ''], ['  },', ''], ['  "devDependencies": {', 'devDependencies', '<b>開発中だけ</b>使うもの（TypeScript・リンター・テスト）。<code>npm install -D 名前</code>。本番の容量や攻撃面を減らせる。'], ['    "typescript": "^5.6.0"', ''], ['  },', ''], ['  "engines": { "node": ">=20" }', 'engines', '動かすのに必要なNode.jsのバージョン。ホスティングもこれを見ることがある。'], ['}', '']];
/* ---- .env の優先順位 ---- */
const ENVF = [['ホスティング／OSの環境変数', 'https://api.example.com（Vercelの設定）', 'all', 'Vercel の管理画面や、ターミナルで export したもの。<b>ファイルより優先</b>。'], ['.env.[mode].local', 'http://localhost:9999', 'mode', '自分のPCだけ・そのモードだけの上書き。Gitに入れない。'], ['.env.local', 'http://localhost:8787', 'all', '自分のPCだけの設定（秘密を書く場所）。Gitに入れない。'], ['.env.[mode]', 'https://dev-api.example.com', 'mode', '開発用・本番用など、モードごとの共通設定。'], ['.env', 'https://api.example.com', 'all', '全員共通の基本値。']];
/* ---- PATH ---- */
const PATHS = [['/opt/homebrew/bin', ['brew', 'git', 'python3']], ['/usr/local/bin', ['node', 'npm', 'npx', 'claude']], ['/usr/bin', ['git', 'python3', 'ssh', 'curl']], ['/bin', ['ls', 'cp', 'mv', 'rm']], ['~/.local/bin', ['uv', 'mytool']]];
/* ---- ポート ---- */
const SERV = [['Next.js', 3000], ['Vite', 5173], ['FastAPI', 8000], ['PostgreSQL', 5432], ['Supabase', 54321]];

/* ================= 5. ターミナル ================= */
TABS.push({ id:'terminal', label:'ターミナル', icon:'⌨',
  intro:'ターミナルは、<b>文字でパソコンに命令する画面</b>です。AIが「このコマンドを実行してください」と言ってくるのは、ほとんどがここ。下の練習用ターミナルは本物のPCに影響しないので、自由に打って慣れてください。',
  sections:[
    C('触って慣れる', [
      { name:'練習用ターミナル', en:'Shell playground', h:460, wide:true, tags:['体験','最重要'], init:(el) => terminal(el),
        desc:'右側の図が、今いる場所（青）を示します。<code>ls</code> で中を見る → <code>cd</code> で移動 → <code>pwd</code> で現在地を確認、が基本の3つ。名前の途中で <b>Tabキー</b> を押すと補完、<b>↑キー</b>で前のコマンドを呼び出せます。止まらないコマンドは <b>Ctrl + C</b> で中断します。',
        prompt:'ターミナルの使い方に慣れていません。これから実行してほしいコマンドは、1つずつ「何をするコマンドか」「どこで（どのフォルダで）実行するか」「実行後に何が表示されれば成功か」を添えて教えて。' },
      { name:'パス（場所の書き方）', en:'Absolute & relative paths', h:400, tags:['体験','ハマりどころ'],
        demo:'<div class="kt"><div class="kt-lbl">今のファイル：myapp/src/components/<b>Button.jsx</b> から import する</div><div class="kt-row ps"></div><div class="kt-code st"></div><div class="gt-files kt-grow fl"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const START = ['myapp', 'src', 'components'];
          const draw = (hit, trail) => { $(el, '.fl').innerHTML = PFS.map(p => { const d = p.split('/').filter(Boolean).length - 1, nm = p.split('/').filter(Boolean).pop() + (p.endsWith('/') ? '/' : ''); const cls = p === hit ? 'hit' : p === 'myapp/src/components/Button.jsx' ? 'cur' : (trail || []).includes(p) ? 'on' : ''; return `<div class="${cls}" style="padding-left:${d * 14 + 4}px">${p.endsWith('/') ? '📁' : '📄'} ${esc(nm)}${p === 'myapp/src/components/Button.jsx' ? '<span class="st">← 今ここ</span>' : ''}</div>`; }).join(''); };
          const go = (rel) => { let cur = [...START], steps = [`出発：${START.join('/')}/`], trail = []; let note = '';
            if (rel.startsWith('/')){ cur = ['myapp', 'public']; steps.push('「/」で始まる → Webでは<b>サイトのルート</b>（Next.js・Viteでは public フォルダ）から'); note = 'Webの画像やリンクで使う「/」は、パソコンの一番上ではなく<b>サイトのいちばん上</b>のこと。'; rel = rel.slice(1); }
            else if (rel.startsWith('@/')){ cur = ['myapp', 'src']; steps.push('「@/」→ 設定（tsconfig の paths）で決めた別名。多くは src/ を指す'); rel = rel.slice(2); note = '<code>@/</code> はプロジェクトごとの<b>別名</b>。tsconfig.json や vite.config で設定されています。'; }
            rel.split('/').forEach(s => { if (!s || s === '.'){ if (s === '.') steps.push('「./」→ 今のフォルダのまま'); return; } if (s === '..'){ cur.pop(); steps.push(`「../」→ 1つ上へ：${cur.join('/')}/`); } else { cur.push(s); steps.push(`「${s}」→ ${cur.join('/')}${s.includes('.') ? '' : '/'}`); } trail.push(cur.join('/') + (s.includes('.') ? '' : '/')); });
            const target = cur.join('/'), exists = PFS.includes(target) || PFS.includes(target + '/'); draw(exists ? (PFS.includes(target) ? target : target + '/') : null, trail);
            $(el, '.st').innerHTML = steps.join('\n'); verdict($(el, '.res'), exists ? 'ok' : 'bad', exists ? `✅ <b>${esc(target)}</b> が見つかりました。${note}` : `❌ <b>${esc(target)}</b> はありません（Module not found の原因）。${note}`); };
          $(el, '.ps').innerHTML = ['./Icon.jsx', '../index.js', '../utils.js', '../../public/logo.png', '../../../README.md', '/logo.png', '@/utils.js'].map(p => `<button type="button" class="kt-btn sm">${p}</button>`).join('');
          $$(el, '.ps button').forEach(b => b.onclick = () => go(b.textContent)); go('../utils.js'); },
        desc:'<b>相対パス</b>は「今のファイルから見た場所」。<code>./</code>＝同じフォルダ、<code>../</code>＝1つ上。<b>絶対パス</b>はいちばん上から書く場所（PCなら <code>/Users/you/…</code> や <code>C:\\Users\\…</code>）。Webのコードで <code>/</code> から始まるものはサイトのルート（public）。「Module not found」「画像が表示されない」の多くはパスの間違いです。',
        prompt:'"Module not found: Can\'t resolve \'../components/Button\'" というエラーが出ます。ファイルの構成を見て、正しいimportのパスに直して。@/ のような別名が設定されているなら、それを使った書き方にそろえて。' },
    ], null, true),
    { title:'OSごとのコマンド対応表', note:'AIは Mac / Linux のコマンドを出しがちです。Windows の PowerShell では書き方が違うものがあります（PowerShellでも ls・cd・pwd などは使えます）。',
      table:{ head:['やりたいこと', 'Mac・Linux（zsh・bash）', 'Windows PowerShell', 'Windows コマンドプロンプト'], rows:[
        ['今いる場所', '<code>pwd</code>', '<code>pwd</code>（Get-Location）', '<code>cd</code>'],
        ['中身の一覧', '<code>ls -la</code>', '<code>ls</code> / <code>dir</code> / <code>ls -Force</code>（隠し）', '<code>dir</code>'],
        ['移動', '<code>cd フォルダ</code>', '<code>cd フォルダ</code>', '<code>cd フォルダ</code>'],
        ['フォルダを作る', '<code>mkdir -p a/b</code>', '<code>mkdir a\\b</code>（New-Item）', '<code>mkdir a\\b</code>'],
        ['空ファイルを作る', '<code>touch a.txt</code>', '<code>New-Item a.txt</code>', '<code>type nul &gt; a.txt</code>'],
        ['中身を表示', '<code>cat a.txt</code>', '<code>cat a.txt</code>（Get-Content）', '<code>type a.txt</code>'],
        ['削除（フォルダごと）', '<code>rm -rf フォルダ</code>', '<code>Remove-Item -Recurse -Force フォルダ</code>', '<code>rmdir /s /q フォルダ</code>'],
        ['コピー・移動', '<code>cp -r</code> / <code>mv</code>', '<code>Copy-Item -Recurse</code> / <code>Move-Item</code>', '<code>xcopy</code> / <code>move</code>'],
        ['画面をきれいに', '<code>clear</code>', '<code>clear</code> / <code>cls</code>', '<code>cls</code>'],
        ['コマンドの場所', '<code>which node</code>', '<code>(Get-Command node).Source</code>', '<code>where node</code>'],
        ['環境変数を見る', '<code>echo $PATH</code>', '<code>$env:PATH</code>', '<code>echo %PATH%</code>'],
        ['環境変数を一時的に設定', '<code>export KEY=value</code>', '<code>$env:KEY = "value"</code>', '<code>set KEY=value</code>'],
        ['続けて実行', '<code>a && b</code>', '<code>a; if ($?) { b }</code>（PowerShell 7 は &&）', '<code>a && b</code>'],
        ['文字を探す', '<code>grep 語 ファイル</code>', '<code>Select-String 語 ファイル</code>', '<code>findstr 語 ファイル</code>'],
        ['フォルダをエクスプローラーで開く', '<code>open .</code>', '<code>start .</code> / <code>ii .</code>', '<code>start .</code>'],
      ]}},
    S('ターミナルの基本', [
      T('ターミナル・シェル・コンソール', 'Terminal / Shell', 'ターミナル＝文字を打つ画面（アプリ）。シェル＝打った命令を解釈するプログラム（Macは zsh、Linuxは bash、Windowsは PowerShell）。会話ではほぼ同じ意味で使われる。', null, ['基本']),
      T('プロンプト記号', '$ % > #', '行の先頭の <code>$</code>・<code>%</code>・<code>&gt;</code> は「入力待ち」の印で、<b>打つ必要はない</b>。<code>#</code> は管理者のときに出ることが多い。AIの説明の <code>$ npm install</code> は「npm install」と打つ。'),
      T('カレントディレクトリ', 'Current directory', '今いるフォルダ。コマンドはここを基準に動く。「package.json がない」系のエラーは、たいてい<b>違う場所で実行している</b>。VS Code のターミナルは開いているフォルダから始まる。', null, ['ハマりどころ']),
      T('ホーム（~）', 'Home directory', '自分のユーザーのフォルダ。<code>cd</code> だけ、または <code>cd ~</code> で戻れる。'),
      T('便利なキー', 'Shortcuts', '<b>Tab</b>＝補完、<b>↑</b>＝前のコマンド、<b>Ctrl + C</b>＝実行中のコマンドを止める、<b>Ctrl + L</b>＝画面をきれいに、<b>Ctrl + R</b>＝履歴を検索。Macでも止めるのは Ctrl + C。'),
      T('止まらないコマンドを止める', 'Ctrl + C', '<code>npm run dev</code> などの開発サーバーは、動いている間は戻ってこない。終了は Ctrl + C。別の作業はターミナルを新しく開く（タブ・分割）。'),
      T('パイプとリダイレクト', '| > >>', '<code>|</code>＝前のコマンドの結果を次に渡す（<code>ls | grep .js</code>）。<code>&gt;</code>＝ファイルに書き出す（上書き）、<code>&gt;&gt;</code>＝追記。'),
      T('&& と ;', 'Chaining', '<code>a && b</code>＝aが成功したらbを実行。<code>a; b</code>＝成功失敗に関係なく順番に。'),
      T('引数とオプション', 'Arguments / flags', '<code>npm install -D typescript</code> の <code>-D</code> がオプション（短い形）、<code>--save-dev</code> が長い形。<code>--help</code> で使い方を表示。'),
      T('スペースを含む名前', 'Quoting', 'フォルダ名に空白があるときは <code>cd "My Projects"</code> のように引用符で囲む。日本語や空白のないフォルダ名にしておくとトラブルが減る。'),
      T('終了コード', 'Exit code', 'コマンドの成功（0）・失敗（0以外）を表す数字。CIやスクリプトはこれで成否を判断する。'),
      T('rm は元に戻せない', 'rm is permanent', 'ターミナルで消したファイルはゴミ箱に入らない。<code>rm -rf</code> は特に慎重に。AIの提案でも、消す対象を必ず確認する。', null, ['危険']),
      T('sudo（管理者権限）', 'sudo', 'パソコン全体に関わる操作を管理者として実行する。npm のグローバルインストールで sudo が必要になったら、Node のバージョン管理ツール（nvm など）を使う方が安全。', null, ['注意']),
      T('インターネットのスクリプトを直接実行', 'curl | sh', '<code>curl https://… | sh</code> はダウンロードした内容をそのまま実行する。公式サイトに書かれているものだけにする。', null, ['危険']),
      T('ターミナルのアプリ', 'Terminal apps', 'Mac：ターミナル・iTerm2・Warp・Ghostty。Windows：Windows Terminal（PowerShell）・WSL（Linuxを動かす）。VS Code・Cursor にも内蔵。'),
      T('WSL', 'Windows Subsystem for Linux', 'Windowsの中でLinuxを動かす機能。Mac・Linux前提の手順（AIの説明の多く）がそのまま使えるようになる。'),
    ]),
  ]});

/* ================= 6. パッケージ・実行環境 ================= */
TABS.push({ id:'packages', label:'パッケージ・実行環境', icon:'⬢',
  intro:'<b>パッケージ</b>は、他の人が作ってくれた部品（ライブラリ）です。npm（JavaScript）や pip（Python）で入れて使います。バージョンの書き方、lockファイル、node_modules の役割が分かると、「動かない」「人のPCでは動くのに」の多くが解決できます。',
  sections:[
    C('触って理解する', [
      { name:'バージョン指定の読み方（^ と ~）', en:'Semantic versioning', h:360, tags:['体験'],
        demo:'<div class="kt"><div class="kt-row"><span class="kt-lbl">package.json の指定</span><input class="kt-in mono rg" style="width:160px" aria-label="バージョン範囲"></div><div class="kt-row ps"></div><div class="kt-lbl">公開されているバージョン（緑＝インストールされうる）</div><div class="gt-vers vs"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const run = () => { const r = $(el, '.rg').value; $(el, '.vs').innerHTML = VERS.map(v => { let ok = false; try{ ok = sat(v, r); }catch(e){} return `<span class="${ok ? 'ok' : ''}">${v}</span>`; }).join(''); const d = RANGES.find(x => x[0] === r.trim()); $(el, '.res').innerHTML = d ? `<b>${esc(d[0])}</b>：${d[1]}` : '自由に書き換えてみてください（例：>=1.2.0 &lt;1.9.0、^0.3.0）'; };
          $(el, '.ps').innerHTML = RANGES.map(([r]) => `<button type="button" class="kt-btn sm">${esc(r)}</button>`).join(''); $$(el, '.ps button').forEach(b => b.onclick = () => { $(el, '.rg').value = b.textContent; run(); });
          $(el, '.rg').value = '^1.2.3'; $(el, '.rg').oninput = run; run(); },
        desc:'バージョンは <b>メジャー.マイナー.パッチ</b>（1.2.3）。メジャーが上がると<b>互換性が壊れる</b>変更、マイナーは機能追加、パッチは修正、という約束です（セマンティック バージョニング）。<code>^1.2.3</code> は「1.x の範囲で新しいもの」。実際に入るバージョンは <b>lockファイル</b>で固定されます。',
        prompt:'package.json の依存パッケージのうち、メジャーバージョンが古いもの（更新すると壊れる可能性があるもの）を一覧にして、それぞれの変更点（移行ガイド）の要点と、更新の優先度を教えて。' },
      { name:'package.json の中身', en:'package.json anatomy', h:430, tags:['体験'],
        demo:'<div class="kt"><div class="gt-anat kt-grow an"></div><div class="kt-verdict res">紫色の項目をクリックしてください。</div></div>',
        init:(el) => { $(el, '.an').innerHTML = PKG.map(([l, k]) => k ? esc(l).replace(`&quot;${k}&quot;`, `<span class="k" data-k="${k}">"${k}"</span>`) : esc(l)).join('\n');
          $$(el, '.k').forEach(s => s.onclick = () => { $$(el, '.k').forEach(x => x.classList.toggle('on', x === s)); $(el, '.res').innerHTML = `<b>${s.dataset.k}</b>：${PKG.find(p => p[1] === s.dataset.k)[2]}`; }); },
        desc:'<code>package.json</code> は、プロジェクトの<b>名札と部品表と操作盤</b>です。どのパッケージを使うか（dependencies）、どんなコマンドがあるか（scripts）が書かれています。<code>npm install</code> は、ここを読んで必要な部品を揃えます。',
        prompt:'このプロジェクトの package.json を説明して。scripts の各コマンドが何をするか、dependencies と devDependencies の分け方が正しいか、不要そうな依存があるかも確認して。' },
      { name:'npm install で起きていること', en:'What npm install does', h:400, tags:['仕組み'],
        init:(el) => seq(el, { actors:[{ icon:'🧑‍💻', label:'あなた' }, { icon:'⬢', label:'npm' }, { icon:'🌐', label:'npmレジストリ' }, { icon:'📁', label:'node_modules' }], steps:[
          { f:0, t:1, label:'npm install', note:'<code>npm install</code>（または npm i）を実行します。' },
          { f:1, t:1, label:'package.json と lockファイルを読む', note:'必要なパッケージと、<b>package-lock.json に記録された正確なバージョン</b>を確認します。' },
          { f:1, t:2, label:'足りない部品をダウンロード', note:'npmjs.com から、パッケージと<b>その依存（さらにその依存…）</b>をダウンロードします。数百個になることも。' },
          { f:2, t:1, label:'.tgz（圧縮ファイル）', dash:true, note:'ダウンロードしたファイルの整合性（ハッシュ）を確認します。' },
          { f:1, t:3, label:'展開して配置', note:'<b>node_modules</b> フォルダに展開します。ここはGitに入れません（容量が大きく、いつでも再現できるため）。' },
          { f:1, t:1, label:'インストールスクリプト実行', bad:true, note:'パッケージによっては、インストール時にスクリプトが動きます。<b>悪意のあるパッケージはここで動く</b>ので、知らないパッケージは入れない。' },
          { f:1, t:1, label:'package-lock.json を更新', note:'実際に入れたバージョンを記録します。<b>lockファイルはGitにコミット</b>して、全員・本番で同じバージョンにそろえます。' },
          { f:1, t:0, label:'added 312 packages', dash:true, good:true, note:'完了。<code>npm ci</code> は lockファイルどおりに入れ直すコマンドで、CIや本番のビルドで使います。' },
        ]}),
        desc:'<code>npm install</code> は、package.json（欲しいもの）と package-lock.json（実際のバージョンの記録）を見て、部品を <code>node_modules</code> に揃えます。「人のPCでは動く」問題の多くは、lockファイルをコミットしていない・Nodeのバージョンが違う、のどちらかです。',
        prompt:'npm install でエラーが出ます。エラー全文を貼るので、原因（Nodeのバージョン・依存の衝突・ネットワーク・権限）を切り分けて、安全な直し方を教えて。--force や --legacy-peer-deps を使う前に、何が起きるかも説明して。' },
    ], null, true),
    { title:'パッケージマネージャーの対応表（JavaScript）', note:'どれか1つに統一します。<b>lockファイルの種類</b>（package-lock.json / pnpm-lock.yaml / yarn.lock / bun.lock）で、そのプロジェクトが何を使っているか分かります。',
      table:{ head:['やりたいこと', 'npm', 'pnpm', 'yarn', 'bun'], rows:[
        ['全部インストール', '<code>npm install</code>', '<code>pnpm install</code>', '<code>yarn</code>', '<code>bun install</code>'],
        ['追加', '<code>npm i zod</code>', '<code>pnpm add zod</code>', '<code>yarn add zod</code>', '<code>bun add zod</code>'],
        ['開発用に追加', '<code>npm i -D vitest</code>', '<code>pnpm add -D vitest</code>', '<code>yarn add -D vitest</code>', '<code>bun add -d vitest</code>'],
        ['削除', '<code>npm uninstall zod</code>', '<code>pnpm remove zod</code>', '<code>yarn remove zod</code>', '<code>bun remove zod</code>'],
        ['scriptsを実行', '<code>npm run dev</code>', '<code>pnpm dev</code>', '<code>yarn dev</code>', '<code>bun dev</code>'],
        ['入れずに1回実行', '<code>npx create-next-app</code>', '<code>pnpm dlx …</code>', '<code>yarn dlx …</code>', '<code>bunx …</code>'],
        ['lock どおりに入れ直す', '<code>npm ci</code>', '<code>pnpm i --frozen-lockfile</code>', '<code>yarn --immutable</code>', '<code>bun install --frozen-lockfile</code>'],
        ['古いものを確認', '<code>npm outdated</code>', '<code>pnpm outdated</code>', '<code>yarn outdated</code>', '<code>bun outdated</code>'],
        ['脆弱性チェック', '<code>npm audit</code>', '<code>pnpm audit</code>', '<code>yarn npm audit</code>', '—'],
      ]}},
    { title:'Python の場合', table:{ head:['やりたいこと', 'pip＋venv', 'uv（新しく速い）'], rows:[
      ['プロジェクト用の環境を作る', '<code>python -m venv .venv</code>', '<code>uv init</code> / <code>uv venv</code>'],
      ['環境を有効にする', 'Mac：<code>source .venv/bin/activate</code><br>Windows：<code>.venv\\Scripts\\activate</code>', '（uv run が自動で使う）'],
      ['追加', '<code>pip install requests</code>', '<code>uv add requests</code>'],
      ['依存の一覧を保存', '<code>pip freeze &gt; requirements.txt</code>', '（pyproject.toml と uv.lock に自動記録）'],
      ['一覧から入れる', '<code>pip install -r requirements.txt</code>', '<code>uv sync</code>'],
      ['実行', '<code>python main.py</code>', '<code>uv run main.py</code>'],
    ]}},
    S('パッケージと実行環境の用語', [
      T('Node.js', 'Node.js', 'ブラウザの外（PC・サーバー）でJavaScriptを動かす実行環境。npm も一緒に入る。<b>LTS（長期サポート版）</b>の偶数バージョンを使うのが無難。', null, ['基本']),
      T('npm と npx', 'npm / npx', 'npm＝パッケージを入れる・scriptsを実行する。npx＝パッケージを<b>インストールせずに1回だけ</b>実行する（<code>npx create-next-app@latest</code>）。'),
      T('node_modules', 'node_modules', 'インストールした部品の置き場。巨大になるが、package.json と lockファイルから再現できるので<b>Gitに入れない</b>。調子が悪いときは消して <code>npm install</code> し直すと直ることがある。'),
      T('lockファイル', 'package-lock.json など', '実際に入ったバージョンを正確に記録したファイル。<b>Gitにコミットする</b>。手で編集しない。'),
      T('dependencies と devDependencies', 'Runtime vs dev deps', '本番で動くのに必要なもの／開発中だけ使うもの。本番のビルドでは devDependencies を入れないことも。'),
      T('scripts', 'npm scripts', '<code>npm run dev</code> などの短い名前で、長いコマンドを実行できる。AIに「どのコマンドで起動しますか？」と聞かれたら、ここを見る。'),
      T('Nodeのバージョン管理', 'nvm / fnm / Volta / mise', 'プロジェクトごとに違うNodeのバージョンを切り替える道具。<code>.nvmrc</code> にバージョンを書いておくと揃えやすい。', '.nvmrc を作ってこのプロジェクトのNodeのバージョン（LTS）を固定し、package.json の engines にも書いて。nvm（Windowsなら nvm-windows か fnm）での切り替え方も教えて。'),
      T('グローバルインストール', 'npm i -g', 'PC全体に入れて、どこでも使えるようにする。プロジェクトのバージョンとずれる原因になるので、なるべく npx やプロジェクト内のインストールを使う。'),
      T('ランタイムの種類', 'Node.js / Bun / Deno', 'JavaScriptを動かす環境。Bun は速さと一体型ツール、Deno は安全性とTypeScript標準対応が特徴。迷ったら Node.js。'),
      T('Python の仮想環境', 'venv', 'プロジェクトごとにPythonのパッケージを分ける仕組み。有効にし忘れると「入れたのに見つからない」になる。'),
      T('requirements.txt と pyproject.toml', 'Python dependency files', 'Pythonの部品表。新しいプロジェクトは pyproject.toml（＋uv）が主流になりつつある。'),
      T('ビルドとバンドラー', 'Build / Vite / webpack', '書いたコード（TypeScript・JSX・CSS）を、ブラウザが読める小さなファイルに変換・まとめる工程。<code>npm run build</code> の正体。'),
      T('TypeScript とトランスパイル', 'TypeScript', '型（データの形）を書けるJavaScript。そのままでは動かないので、JavaScriptに変換（トランスパイル）して実行する。型のおかげでAIのミスにも気づきやすい。'),
      T('Docker', 'Image / Container / Compose', 'アプリと動く環境をまるごと「箱（コンテナ）」に入れて、どのPCでも同じように動かす仕組み。<code>Dockerfile</code>＝箱の作り方、<code>docker compose</code>＝DBなど複数の箱をまとめて起動。'),
      T('OSのパッケージ管理', 'Homebrew / winget', 'Node・Git・Pythonなどのソフト自体を入れる道具。Mac は Homebrew（brew）、Windows は winget。'),
      T('モノレポ', 'Monorepo', '複数のアプリ・パッケージを1つのリポジトリで管理する形（pnpm workspaces・Turborepo）。'),
      T('依存の脆弱性', 'npm audit', '入れた部品に既知の脆弱性がないか確認する。<code>npm audit fix --force</code> はメジャー更新で壊れることがあるので、内容を見てから。（セキュリティ辞典参照）'),
    ]),
  ]});

/* ================= 7. 環境変数・設定ファイル ================= */
TABS.push({ id:'env', label:'環境変数・設定ファイル', icon:'⚙',
  intro:'同じコードでも、<b>環境変数</b>を変えるだけで「開発用のDB」「本番用のDB」を切り替えられます。どのファイルの値が使われるのか、なぜ「設定したのに反映されない」のかを触って確かめましょう。',
  sections:[
    C('触って理解する', [
      { name:'.env ファイルの優先順位', en:'Which .env wins?', h:380, tags:['体験','ハマりどころ'],
        demo:'<div class="kt"><div class="kt-row"><span class="kt-lbl">起動のしかた</span><span class="sw"></span></div><div class="gt-env ev"></div><div class="kt-code cd"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let mode = 'development'; const on = [false, false, true, true, true];
          const run = () => { let win = -1; const lab = (n) => n.replace('[mode]', mode); ENVF.forEach((f, i) => { if (win < 0 && on[i]) win = i; });
            $(el, '.ev').innerHTML = ENVF.map(([n, v, sc], i) => `<label class="${!on[i] ? 'off' : i === win ? 'win' : 'lose'}"><input type="checkbox" data-i="${i}" ${on[i] ? 'checked' : ''}><span>${esc(lab(n))}</span><span>API_URL=${esc(v)}</span><span class="kt-badge ${i === win ? 'ok' : ''}">${i === win ? '採用' : on[i] ? '負け' : 'なし'}</span></label>`).join('');
            $$(el, '.ev input').forEach(x => x.onchange = () => { on[+x.dataset.i] = x.checked; run(); });
            $(el, '.cd').textContent = mode === 'development' ? '$ npm run dev        # mode = development' : '$ npm run build && npm start   # mode = production';
            $(el, '.res').innerHTML = win < 0 ? 'どこにも設定がないので、API_URL は <b>undefined</b>（「環境変数が読めない」エラーの典型）' : `アプリが使う値：<b>${esc(ENVF[win][1])}</b>（${esc(lab(ENVF[win][0]))}）— ${ENVF[win][3]}`; };
          $(el, '.sw').replaceWith(seg(['npm run dev（開発）', 'build → start（本番）'], k => { mode = k ? 'production' : 'development'; run(); }).el); },
        desc:'Next.js・Vite などは、複数の .env ファイルを<b>決まった優先順位</b>で読みます（上ほど強い）。ホスティングの管理画面の値はファイルより優先され、<code>.env.local</code> は自分のPC専用（Gitに入れない）。チェックを外したり、起動のしかたを変えたりして、採用される値を確かめてください。<b>値を変えたら開発サーバーの再起動が必要</b>です。',
        prompt:'環境変数を変えたのに反映されません。このプロジェクトの .env ファイルの構成と読み込まれる優先順位、ブラウザ側で読めるようにする接頭辞（NEXT_PUBLIC_ など）の有無、再起動・再デプロイが必要かを確認して原因を教えて。' },
      { name:'コマンドが見つかる仕組み（PATH）', en:'How PATH works', h:380, tags:['体験','ハマりどころ'],
        demo:'<div class="kt"><div class="kt-row"><span class="kt-lbl">打ったコマンド</span><span class="ps"></span></div><div class="gt-path pt"></div><div class="kt-verdict res">コマンドを選ぶと、PATHのフォルダを上から順に探します。</div></div>',
        init:(el) => { let timer = null; const stop = () => clearTimeout(timer);
          const draw = () => { $(el, '.pt').innerHTML = PATHS.map(([d]) => `<div><span>📁 ${d}</span><span></span></div>`).join(''); };
          const go = (cmd) => { stop(); draw(); const rows = $$(el, '.pt div'); let i = 0; verdict($(el, '.res'), '', `「${cmd}」を探しています…`);
            const step = () => { if (i > 0) rows[i - 1].classList.replace('look', 'miss'); if (i >= PATHS.length){ verdict($(el, '.res'), 'bad', `❌ <b>zsh: command not found: ${cmd}</b> — どのフォルダにもありません。インストールされていないか、入れた場所がPATHに入っていません。`); return; }
              rows[i].classList.add('look'); rows[i].lastChild.textContent = '探し中…';
              timer = setTimeout(() => { if (PATHS[i][1].includes(cmd)){ rows[i].className = 'hit'; rows[i].lastChild.textContent = '見つかった！'; verdict($(el, '.res'), 'ok', `✅ <b>${PATHS[i][0]}/${cmd}</b> を実行します。<b>最初に見つかったもの</b>が使われるので、同じ名前が別の場所にあっても無視されます（例：git は1つ目の場所のもの）。`); return; } rows[i].lastChild.textContent = 'なし'; i++; step(); }, 380); };
            step(); };
          $(el, '.ps').innerHTML = ['node', 'git', 'uv', 'claude', 'mycli'].map(c => `<button type="button" class="kt-btn sm">${c}</button>`).join(''); $$(el, '.ps button').forEach(b => b.onclick = () => go(b.textContent)); draw(); return stop; },
        desc:'ターミナルで <code>node</code> と打つと、シェルは<b>環境変数 PATH に並んだフォルダを順番に探して</b>、最初に見つかったものを実行します。「インストールしたのに command not found」は、入れた場所がPATHに入っていないか、<b>ターミナルを開き直していない</b>のが原因のことが多いです。',
        prompt:'"command not found: xxx" と出ます。インストール方法（Homebrew / npm -g / pip / 公式インストーラー）と使っているシェル（zsh / bash / PowerShell）を伝えるので、PATHの確認方法と、設定ファイル（.zshrc など）への追加方法を教えて。' },
    ], null, true),
    { title:'よく見る設定ファイル', note:'プロジェクトのいちばん上（ルート）に置かれることが多いファイルです。AIに頼むときは「どのファイルを変えるか」を確認しましょう。',
      table:{ head:['ファイル', '役割'], rows:[
        ['package.json', '依存パッケージとコマンド（scripts）'], ['package-lock.json など', '依存の正確なバージョンの記録（手で編集しない）'], ['.env / .env.local / .env.example', '環境変数（秘密は .env.local、見本は .env.example）'],
        ['.gitignore', 'Gitに入れないファイルの一覧'], ['tsconfig.json', 'TypeScriptの設定（厳しさ・パスの別名 @/ など）'], ['next.config.js / vite.config.ts', 'フレームワークの設定（画像・リダイレクト・プロキシなど）'],
        ['eslint.config.js', 'コードの書き方チェック（リンター）のルール'], ['.prettierrc', 'コードの自動整形のルール'], ['.editorconfig', 'インデント・改行コードなどエディタ共通の設定'],
        ['.nvmrc / .node-version', '使うNode.jsのバージョン'], ['Dockerfile / compose.yaml', 'Dockerの箱の作り方・まとめて起動'], ['vercel.json / netlify.toml', 'ホスティングの設定（ヘッダー・リダイレクト）'],
        ['.github/workflows/*.yml', 'GitHub Actions（自動テスト・デプロイ）'], ['CLAUDE.md / AGENTS.md / .cursor/rules', 'AIエージェントへの常設の指示（プロジェクトの約束事）'], ['README.md', 'プロジェクトの説明書'],
      ]}},
    S('環境変数と設定の知識', [
      T('環境変数', 'Environment variables', 'プログラムの外から渡す設定値。APIキー・DBの接続先・機能のON/OFFを、コードを変えずに切り替えられる。', null, ['基本']),
      T('読み方', 'process.env / import.meta.env', 'Node.js・Next.js は <code>process.env.KEY</code>、Vite は <code>import.meta.env.VITE_KEY</code>、Python は <code>os.environ["KEY"]</code>。'),
      T('ブラウザに出る変数の接頭辞', 'NEXT_PUBLIC_ / VITE_', 'この接頭辞が付いた変数だけがブラウザ用のコードに埋め込まれる。<b>秘密には付けない</b>（セキュリティ辞典参照）。'),
      T('変えたら再起動・再デプロイ', 'Restart to apply', '.env の変更は、開発サーバーの再起動まで反映されない。本番（Vercelなど）は<b>再デプロイ</b>が必要。ビルド時に埋め込まれる値も多い。', null, ['ハマりどころ']),
      T('NODE_ENV', 'NODE_ENV', '<code>development</code> / <code>production</code> / <code>test</code>。フレームワークが自動で設定することが多く、手で変えると動きがおかしくなることがある。'),
      T('PATH', 'PATH', 'コマンドを探すフォルダの一覧（Mac・Linuxは <code>:</code>、Windowsは <code>;</code> 区切り）。'),
      T('シェルの設定ファイル', '.zshrc / .bashrc / $PROFILE', 'ターミナルを開くたびに読み込まれる設定。PATHの追加やエイリアス（短縮コマンド）を書く。変更したら <code>source ~/.zshrc</code> か開き直す。'),
      T('一時的な設定と永続的な設定', 'export vs config file', 'ターミナルで <code>export KEY=…</code> した値は、そのウィンドウを閉じると消える。ずっと使うなら設定ファイルへ。'),
      T('改行コード', 'LF / CRLF', 'Mac・Linuxは LF、Windowsは CRLF。混ざるとGitの差分が全行変わったように見えたり、シェルスクリプトが動かなかったりする。.gitattributes や .editorconfig でそろえる。'),
      T('大文字・小文字の区別', 'Case sensitivity', 'Mac・Windowsは普通区別しないが、Linux（本番サーバー）は区別する。<code>import Button from "./button"</code>（実際は Button.jsx）が手元では動いて本番で失敗する定番の原因。', null, ['ハマりどころ']),
      T('パスの別名', 'Path alias（@/）', '<code>import x from "@/lib/x"</code> の <code>@/</code> は tsconfig の paths で決めた別名。深い <code>../../../</code> を避けられる。'),
      T('リンターとフォーマッター', 'ESLint / Prettier / Biome', 'リンター＝怪しい書き方を指摘、フォーマッター＝見た目を自動で整える。AIが書いたコードの品質をそろえるのに便利。', 'このプロジェクトに ESLint と Prettier（または Biome）を設定して、保存時に自動整形されるように VS Code の設定も追加して。scripts に lint と format も追加して。'),
      T('AIエージェントへの常設メモ', 'CLAUDE.md / AGENTS.md', 'プロジェクトのルール（使うコマンド・コードの書き方・やってはいけないこと）を書いておくファイル。毎回同じ説明をしなくて済む。', 'このプロジェクト用の CLAUDE.md を作って。起動・テスト・ビルドのコマンド、フォルダ構成、コードの書き方のルール、触ってはいけないファイル、コミット前に確認すること、を簡潔にまとめて。', ['AI活用']),
    ]),
  ]});

/* ================= 8. ローカル開発・サーバー ================= */
TABS.push({ id:'local', label:'ローカル開発', icon:'🖥',
  intro:'<b>localhost</b> は「自分のパソコン自身」のこと。開発サーバーは、自分のPCの中に小さなWebサーバーを立ち上げて、ブラウザで確認できるようにしています。ポート番号、ホットリロード、スマホでの確認、「動かないときの順番」をまとめました。',
  sections:[
    C('触って理解する', [
      { name:'localhost とポート番号', en:'localhost & ports', h:420, tags:['体験','基本'],
        demo:'<div class="kt"><div class="gt-pc"><b>🖥 あなたのPC（localhost = 127.0.0.1）の中の「ドア」</b><div class="gt-doors drs"></div></div><div class="kt-row sv"></div><div class="kt-row"><button type="button" class="kt-btn sm dup">もう1つ npm run dev（Next.js）</button><span class="kt-lbl">ブラウザで開く</span><span class="sc-url" style="display:inline-flex;gap:4px;align-items:center;padding:3px 8px;border:1px solid var(--border-strong);border-radius:999px;background:var(--surface);font:12px var(--mono)">localhost:<input class="pt" value="3000" style="width:56px;border:0;background:transparent;font:inherit;color:var(--text);outline:none" aria-label="ポート番号"></span><button type="button" class="kt-btn pri sm op">開く</button></div><div class="kt-verdict res">サービスを起動（クリック）して、ブラウザで開いてみてください。</div></div>',
        init:(el) => { const run = new Map([[3000, 'Next.js']]);
          const draw = (clash) => { const ports = [...new Set([...SERV.map(s => s[1]), ...run.keys()])].sort((a, b) => a - b); $(el, '.drs').innerHTML = ports.map(p => `<div class="${p === clash ? 'clash' : run.has(p) ? 'on' : ''}"><b>${p}</b>${run.has(p) ? esc(run.get(p)) : '（空き）'}</div>`).join(''); };
          $(el, '.sv').innerHTML = '<span class="kt-lbl">起動／停止：</span>' + SERV.map(([n, p]) => `<button type="button" class="kt-btn sm" data-p="${p}" data-n="${n}">${n}</button>`).join('');
          $$(el, '.sv button').forEach(b => b.onclick = () => { const p = +b.dataset.p; if (run.has(p)){ run.delete(p); verdict($(el, '.res'), '', `${b.dataset.n} を停止しました（Ctrl + C）。ドア ${p} が空きました。`); } else { run.set(p, b.dataset.n); verdict($(el, '.res'), 'ok', `${b.dataset.n} が <b>localhost:${p}</b> で待ち受けを始めました。`); } draw(); });
          $(el, '.dup').onclick = () => { let p = 3000; if (!run.has(p)){ run.set(p, 'Next.js'); draw(); verdict($(el, '.res'), 'ok', 'localhost:3000 で起動しました。'); return; } while (run.has(p)) p++; run.set(p, 'Next.js（2つ目）'); draw(3000); verdict($(el, '.res'), 'warn', `⚠ <code>Port 3000 is in use, trying ${p} instead.</code> — 3000番はもう使われていたので、<b>${p}番</b>で起動しました。古いサーバーが残っていないか確認しましょう。`); };
          $(el, '.op').onclick = () => { const p = +$(el, '.pt').value; verdict($(el, '.res'), run.has(p) ? 'ok' : 'bad', run.has(p) ? `✅ localhost:${p} → <b>${esc(run.get(p))}</b> が応答しました。` : `❌ <b>このサイトにアクセスできません（ERR_CONNECTION_REFUSED）</b> — ポート ${p} では何も動いていません。サーバーが起動しているか、番号が合っているかを確認。`); };
          draw(); },
        desc:'1台のPCの中で、複数のサーバーを<b>ポート番号（ドアの番号）</b>で区別しています。Next.jsは3000、Viteは5173…と決まった番号を使い、使用中なら別の番号に逃げます。「ポートが使用中（EADDRINUSE）」は、前に起動したサーバーが残っているのが原因のことが多いです。',
        prompt:'"Error: listen EADDRINUSE: address already in use :::3000" と出ます。3000番ポートを使っているプロセスを調べて止めるコマンドを、Mac と Windows（PowerShell）の両方で教えて。' },
      { name:'「動かない」ときに試す順番', en:'Troubleshooting order', h:380, tags:['手順'],
        init:(el) => stepper(el, ['<b>エラー文を全部読む</b>：ターミナル（サーバー側）とブラウザの開発者ツールのConsole（画面側）の両方を見る。', '<b>正しいフォルダで実行しているか</b>：<code>pwd</code> と <code>ls</code> で package.json がある場所か確認。', '<b>開発サーバーを止めて再起動</b>：Ctrl + C → <code>npm run dev</code>。.env を変えたときは必須。', '<b>ブラウザのキャッシュを無視して再読み込み</b>：Ctrl + Shift + R（Mac：⌘ + Shift + R）。', '<b>依存を入れ直す</b>：node_modules と .next（など）を消して <code>npm install</code>。', '<b>Nodeのバージョン</b>を確認：<code>node -v</code> と .nvmrc / engines を比べる。', '<b>最後に動いたコミットとの差分</b>を見る：<code>git diff</code>。だめなら戻して小さくやり直す。', '<b>AIに渡す</b>：エラー全文・何をしたら起きたか・期待した動作・試したこと・OSとバージョン。'], { title:'上から順に、1つずつ確認' }),
        desc:'「動かない」の原因は、コードのバグより<b>環境のずれ</b>（場所・再起動忘れ・キャッシュ・バージョン）のことが意外と多いです。上から順に潰すと、AIに相談する前に解決することもよくあります。',
        prompt:'開発サーバーが起動しません（または画面が真っ白です）。ターミナルのエラー全文とブラウザのConsoleのエラーを貼るので、環境の問題（フォルダ・Nodeのバージョン・依存・キャッシュ・環境変数）とコードの問題に分けて、原因の候補を可能性の高い順に挙げて。' },
    ], null, true),
    { title:'よく使うポート番号', table:{ head:['番号', 'よく使うもの'], rows:[
      ['3000', 'Next.js・React（Create React App）・Express・Rails'], ['5173', 'Vite（React・Vue・Svelte）'], ['4321', 'Astro'], ['8000', 'Django・FastAPI（uvicorn）・PHPの簡易サーバー'], ['5000', 'Flask（MacではAirPlayと衝突することがある）'], ['8080', '汎用の開発サーバー・Java'], ['4200', 'Angular'], ['8787', 'Cloudflare Workers（wrangler dev）'], ['5432', 'PostgreSQL'], ['3306', 'MySQL'], ['6379', 'Redis'], ['27017', 'MongoDB'], ['54321〜54324', 'Supabase のローカル環境（API・DB・Studio）'], ['9229', 'Node.js のデバッガ'],
    ]}},
    S('ローカル開発の知識', [
      T('localhost・127.0.0.1・0.0.0.0', 'Loopback address', 'localhost と 127.0.0.1 は「このPC自身」。サーバーを 0.0.0.0 で起動すると、同じWi-Fiの別の機器（スマホ）からもアクセスできる。', null, ['基本']),
      T('開発サーバー', 'Dev server', '<code>npm run dev</code> で起動する、開発用のWebサーバー。保存すると自動で反映される。<b>本番の動きとは違う</b>ことがある（速度・エラー表示・キャッシュ）。'),
      T('ホットリロード（HMR）', 'Hot Module Replacement', 'ファイルを保存すると、ページを再読み込みせずに変更だけを反映する仕組み。反映されないときは手動で再読み込み・再起動。'),
      T('本番ビルドを手元で確認', 'Build & preview', '<code>npm run build</code> で本番用に変換し、<code>npm start</code>（Next.js）や <code>npm run preview</code>（Vite）で確認。<b>開発では動くのにビルドで失敗</b>する問題を公開前に見つけられる。', '公開前の確認として、本番ビルド（npm run build）を実行して、型エラー・ビルドエラー・警告を全部直して。そのあと本番モードで起動して動作確認する手順も教えて。', ['公開前']),
      T('スマホで確認する', 'Test on phone', '同じWi-FiにつないだスマホからPCのIPアドレス（<code>http://192.168.x.x:5173</code>）で開く。Viteは <code>--host</code>、Next.jsは <code>-H 0.0.0.0</code> を付けて起動。'),
      T('外から見られるURLを一時的に作る', 'Tunnel（ngrok・cloudflared）', '手元のサーバーにインターネットからアクセスできるURLを作る。Webhookの受信テストや、人に一時的に見せるときに。<b>公開されることを忘れない</b>。'),
      T('ローカルでHTTPS', 'mkcert', 'カメラ・位置情報・一部の決済など、HTTPSが必要な機能を手元で試すときに、ローカル用の証明書を作る道具。localhost は多くの機能で例外的に安全扱いされる。'),
      T('プロキシでCORSを避ける', 'Dev proxy', '開発中だけ、フロントのサーバーがAPIへの通信を中継する設定（Viteの server.proxy など）。CORSエラーを開発中に回避できる（本番は別途設定）。'),
      T('ポートを使っているプロセスを止める', 'Kill port', 'Mac・Linux：<code>lsof -i :3000</code> → <code>kill -9 PID</code>。Windows：<code>netstat -ano | findstr :3000</code> → <code>taskkill /PID 番号 /F</code>。どちらでも <code>npx kill-port 3000</code>。'),
      T('ブラウザの開発者ツール', 'DevTools', 'F12。<b>Console</b>（エラー）・<b>Network</b>（通信の中身とステータス）・<b>Elements</b>（HTML/CSS）・<b>Application</b>（Cookie・保存データ）。画面のトラブルはまずここ。'),
      T('ログとデバッガ', 'console.log / debugger', 'console.log で値を出して確かめるのが基本。VS Code のデバッガを使うと、止めた場所で変数の中身を見られる。'),
      T('Dockerでデータベースを動かす', 'Local DB with Docker', '<code>docker run -p 5432:5432 -e POSTGRES_PASSWORD=pass postgres</code> で手元にPostgreSQL。Supabase CLI（<code>supabase start</code>）ならSupabase一式がローカルで動く。'),
      T('エディタ', 'VS Code / Cursor / Zed', 'VS Code が定番。Cursor・Windsurf などAI内蔵のエディタも。拡張機能：ESLint・Prettier・GitLens・Tailwind CSS IntelliSense・日本語化パック。'),
      T('開発用のURLとキーを本番と分ける', 'Separate environments', 'ローカルは開発用のDB・テスト用の決済キー。本番の値を手元の .env.local に入れっぱなしにしない。'),
    ]),
  ]});
})();
