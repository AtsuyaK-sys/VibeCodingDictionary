/* 公開のしかた辞典 — A: 部品 / 公開の全体像 / 置き場所を選ぶ / GitHub Pages / Vercel・Netlify・Cloudflare */
(function(){
const { $, $$, esc, seg, stepper } = KIT;
const S = (title, items, note) => ({ title, note, layout:'rows', items });
const C = (title, items, note, lg) => ({ title, note, layout:lg ? 'cards lg' : 'cards', items });
const T = (name, en, desc, prompt, tags, more) => Object.assign({ name, en, desc, prompt, tags }, more || {});
const L = (...a) => a.join('\n');
const verdict = (el, cls, html) => { el.classList.remove('ok', 'bad', 'warn'); if (cls) el.classList.add(cls); el.innerHTML = html; };
const MK = (a) => `<span class="dp-mk ${a}">${{ ok:'○', warn:'△', bad:'×' }[a]}</span>`;
window.DPH = { S, C, T, L, verdict, MK };

/* ================= 1. 公開の全体像 ================= */
const NODES = [['💻', '手元で作る', 'localhost'], ['🐙', 'GitHub に保存', 'push'], ['🔧', 'ビルド', '本番用に変換'], ['☁', 'ホスティング', 'CDN で配る'], ['🗄', 'サーバー・DB', 'データ・処理'], ['🌐', '利用者のブラウザ', 'URL で開く']];
const KINDS = [
  { l:'静的サイト（HTML・CSS・JS）', on:[0, 1, 3, 5], note:'作ったファイルを<b>そのまま配る</b>だけ。ビルドもサーバーもいらないので、いちばん簡単で、速く、安く、安全です。この辞典そのものもこの形です。' },
  { l:'Webアプリ（Next.js・React など）', on:[0, 1, 2, 3, 5], note:'公開する前に<b>ビルド</b>（本番用のファイルに変換・圧縮）が必要です。ホスティングが GitHub から取ってきて、自動でビルドしてくれます。' },
  { l:'サーバーやDBが必要なもの', on:[0, 1, 2, 3, 4, 5], note:'ログイン・保存・AI の呼び出しなど、<b>サーバー側の処理</b>があるもの。サーバーレス関数や、Supabase などのサービス、Python のサーバーを組み合わせます（「サーバーが必要なもの」タブ）。' },
];
TABS.push({ id:'basics', label:'公開の全体像', icon:'🗺',
  intro:'「公開」とは、自分のパソコンの中（localhost）でしか見られないものを、<b>インターネットの住所（URL）で誰でも見られる場所に置く</b>ことです。作ったものの種類によって、必要な段階が変わります。公開前のチェックは <a href="release.html">公開・品質チェック辞典</a>、言葉は <a href="glossary.html#infra">開発用語辞典</a> へ。<br><small>※サービスの料金・無料枠・設定画面は2026年11月時点のもので、変わることがあります。</small>',
  sections:[
    C('触って理解する', [
      { name:'作ったものの種類と、公開までの道のり', en:'Deploy pipeline', h:330, wide:true, tags:['基本','最重要'],
        demo:'<div class="kt"><div class="sg"></div><div class="dp-flow"></div><div class="kt-verdict note"></div></div>',
        init:(el) => $(el, '.sg').append(seg(KINDS.map(k => k.l), (i) => { const k = KINDS[i];
          $(el, '.dp-flow').innerHTML = NODES.map((n, j) => `<div class="dp-node ${k.on.includes(j) ? 'on' : 'off'}"><i>${n[0]}</i><b>${n[1]}</b><small>${n[2]}</small></div>`).join('<span class="dp-arrow">›</span>');
          verdict($(el, '.note'), '', k.note); }, 0).el),
        desc:'薄くなった段階は、その種類では必要ないもの。<b>まずは静的サイトとして公開できないか</b>を考えると、失敗が少なくなります。データの保存が必要なら、サーバーを自分で持たずに済むサービス（Supabase・Firebase）を組み合わせるのが今の定番です。',
        prompt:'私が作ったもの【内容と使っている技術】を公開したい。これは静的サイト・ビルドが必要なWebアプリ・サーバーが必要なもの、のどれにあたる？ 理由と、いちばん簡単な公開先の候補を2つ教えて。' },
    ], null, true),
    { title:'手元と本番のちがい', note:'「手元では動くのに、公開すると動かない」の原因は、たいていこの表のどれかです。',
      table:{ head:['', '手元（開発）', '本番（公開後）'], rows:[
        ['URL', '<code>http://localhost:3000</code>', '<code>https://〇〇.vercel.app</code> や独自ドメイン'],
        ['HTTPS', 'なし（http）', 'あり（鍵マーク）。http の画像や API は読み込めない'],
        ['環境変数', '手元の <code>.env</code> ファイル', 'ホスティングの管理画面に登録したもの'],
        ['ファイル名', 'Windows・Mac は大文字小文字を区別しないことが多い', '<b>区別する</b>（Logo.png と logo.png は別）'],
        ['置き場所', 'フォルダのいちばん上', 'GitHub Pages では <code>/リポジトリ名/</code> の下になることも'],
        ['コード', '開発用（読みやすい・遅い）', 'ビルドされた本番用（圧縮・速い）'],
      ] } },
    S('まず覚える言葉', [
      T('デプロイ', 'Deploy', '作ったものを本番の環境に置いて、使える状態にすること。「公開する」とほぼ同じ意味で使われます。', null, ['基本']),
      T('ホスティング', 'Hosting', '作ったファイルやプログラムを置いて、インターネットに公開してくれるサービス。'),
      T('ビルド', 'Build', 'TypeScript や React のコードを、ブラウザがそのまま読める HTML・CSS・JS に変換・圧縮すること。<code>npm run build</code> で行うことが多い。'),
      T('静的サイトと動的なアプリ', 'Static / Dynamic', '静的＝決まったファイルを配るだけ。動的＝アクセスのたびにサーバーで中身を作る（ログイン・検索など）。'),
      T('CDN', 'Content Delivery Network', '世界中のサーバーにファイルのコピーを置いて、利用者の近くから配る仕組み。多くのホスティングは最初から CDN で配ってくれます。'),
      T('本番・プレビュー', 'Production / Preview', '本番は利用者が見る正式な版。プレビューは、変更ごとに作られる確認用の版（別の URL）。'),
      T('Git 連携で自動公開', 'Git-based deploys', 'GitHub に push すると、ホスティングが自動でビルドして公開する仕組み。<b>手作業でファイルを上げるより、戻すのも簡単</b>です。', null, ['最重要']),
    ]),
  ]});

/* ================= 2. 置き場所を選ぶ ================= */
const SITS = [['free', '無料で始めたい'], ['easy', 'とにかく簡単に'], ['commercial', '仕事・お金に関わる'], ['server', 'サーバーの処理がある'], ['python', 'Python で作った']];
const HOSTS = [
  { nm:'GitHub Pages', fit:['free', 'easy'], kind:'静的サイト', good:'GitHub だけで完結。リポジトリの設定で公開できる。', note:'静的サイトのみ。無料で使えるのは公開リポジトリ（非公開は有料プラン）。規約上、ネットショップなど商取引が主目的のサイトには向かない。' },
  { nm:'Netlify', fit:['free', 'easy', 'commercial', 'server'], kind:'静的＋関数・フォーム', good:'ドラッグ＆ドロップでも公開できる。フォーム受付・サーバーレス関数もある。', note:'無料プランはクレジット制で、使い切ると翌月までサイトが止まる。無料プランでも商用利用はできる。' },
  { nm:'Vercel', fit:['free', 'easy', 'server'], kind:'Next.js・関数', good:'Next.js の開発元で、Next.js との相性が最もよい。プレビューとロールバックが簡単。', note:'無料の Hobby プランは個人・非商用向け。仕事で使うなら有料の Pro プラン。' },
  { nm:'Cloudflare Pages / Workers', fit:['free', 'commercial', 'server'], kind:'静的＋関数', good:'無料枠が大きく、商用でも使える。CDN が速い。', note:'設定や用語が少し専門的。Next.js などは対応のための手順（アダプター）が必要。' },
  { nm:'Firebase Hosting', fit:['free', 'server'], kind:'静的＋Firebase', good:'Firebase の認証・データベースと一緒に使いやすい。', note:'コマンド（Firebase CLI）での操作が中心。' },
  { nm:'Render', fit:['python', 'server', 'commercial'], kind:'サーバー・DB', good:'Node.js や Python のサーバー、データベースもまとめて置ける。', note:'無料のWebサービスは、しばらくアクセスがないと止まり、次に開くときに時間がかかる。' },
  { nm:'Streamlit Community Cloud', fit:['python', 'free', 'easy'], kind:'Streamlit アプリ', good:'Python だけで作ったデータのアプリを、GitHub から無料で公開できる。', note:'しばらく使われないと休止する。社外秘のデータを扱うアプリには向かない。' },
  { nm:'Hugging Face Spaces', fit:['python', 'free'], kind:'AIデモ', good:'Gradio・Streamlit・Docker で作ったAIのデモを公開できる。', note:'無料の環境は性能に限りがあり、使われないと休止する。' },
];
TABS.push({ id:'choose', label:'置き場所を選ぶ', icon:'🧭',
  intro:'公開先（ホスティング）は1つではありません。<b>作ったものの種類</b>と、<b>無料か・商用か・サーバーの処理があるか</b>で選びます。状況を選ぶと、合いそうなサービスが目立ちます（合わないものも消さずに残します）。',
  sections:[
    C('道を選ぶ', [
      { name:'状況からホスティングを選ぶ', en:'Choosing a host', h:520, wide:true, tags:['体験','最重要'],
        demo:'<div class="kt"><span class="kt-lbl">あなたの状況（いくつでも）</span><div class="dp-chips"></div><div class="dp-cards"></div></div>',
        init:(el) => { const on = new Set();
          const draw = () => { $(el, '.dp-chips').innerHTML = SITS.map(([k, l]) => `<button type="button" class="dp-chip ${on.has(k) ? 'on' : ''}" data-k="${k}" aria-pressed="${on.has(k)}">${l}</button>`).join('');
            const sc = (h) => h.fit.filter(k => on.has(k)).length, list = HOSTS.slice().sort((a, b) => on.size ? sc(b) - sc(a) : 0);
            $(el, '.dp-cards').innerHTML = list.map(h => { const m = sc(h); return `<div class="dp-card ${on.size ? (m ? 'fit' : 'dim') : ''}">${on.size && m ? `<span class="fit">合いそう${'●'.repeat(m)}</span>` : ''}<b>${h.nm}</b><dl><dt>向き</dt><dd>${h.kind}</dd><dt>よい所</dt><dd>${h.good}</dd><dt>注意</dt><dd>${h.note}</dd></dl></div>`; }).join('');
            $$(el, '.dp-chip').forEach(b => b.onclick = () => { const k = b.dataset.k; on.has(k) ? on.delete(k) : on.add(k); draw(); }); };
          draw(); },
        desc:'迷ったら、<b>静的サイトは Netlify か GitHub Pages、Next.js は Vercel、Python のデータアプリは Streamlit Community Cloud</b>が定番です。無料プランの条件（商用利用・止まる条件）は変わることがあるので、公式の料金ページで確認してください。',
        prompt:'私のサイト【種類・使う技術・商用かどうか・想定アクセス数】に合うホスティングを3つ比べて。無料プランの条件（商用利用の可否・止まる条件・上限）、独自ドメインの設定のしやすさ、GitHub 連携を表にして。最新の条件は公式サイトで確認するよう、確認先も示して。' },
    ], null, true),
    S('選ぶときの観点', [
      T('作ったものの種類', 'What you built', '静的サイトならどこでも置ける。サーバーの処理（API・ログイン）があるなら、関数が動くサービスか、別にサーバーが必要。', null, ['基本']),
      T('商用利用の条件', 'Commercial use', '無料プランを「個人・非商用」に限るサービスがあります（例：Vercel の Hobby）。仕事・お店・収益のあるサイトは、規約を必ず確認。', null, ['注意']),
      T('止まる条件', 'Limits & sleeping', '無料枠を使い切ると止まる、しばらくアクセスがないと休止する、などの条件があります。利用者がいるサービスでは、止まったときの影響を考えます。'),
      T('GitHub 連携とプレビュー', 'Git integration', 'push で自動公開・プルリクエストごとのプレビューがあると、確認と戻しが楽になります。'),
      T('引っ越しやすさ', 'Portability', '静的サイトや、標準的なフレームワークで作ったものは、別のホスティングに移しやすい。特定のサービスの独自機能に頼りすぎないのも大事。'),
    ]),
  ]});

/* ================= 3. GitHub Pages ================= */
const GP = [
  '<b>① 公開リポジトリに置く</b>　HTML・CSS・JS を GitHub のリポジトリに push します（無料プランでは公開リポジトリが必要）。<code>index.html</code> がいちばん上にあるか確認。',
  '<b>② Settings → Pages を開く</b>　リポジトリの「Settings」タブ → 左のメニューの「Pages」。',
  '<b>③ 公開する場所を選ぶ</b>　「Source」で <b>Deploy from a branch</b> を選び、ブランチ（main）とフォルダ（/ (root) か /docs）を選んで Save。ビルドが必要なサイトは「GitHub Actions」を選びます。',
  '<b>④ 数分待つ</b>　Actions タブで公開の処理が動き、終わると Pages の画面に URL が出ます。<code>https://ユーザー名.github.io/リポジトリ名/</code> の形です。',
  '<b>⑤ 開いて確かめる</b>　画像や CSS が読み込めていない場合は、ほとんどが<b>パス（ファイルの場所の書き方）</b>の問題です。下の見本で確かめられます。',
  '<b>⑥ 更新は push するだけ</b>　main に push すると、自動で公開し直されます。反映まで数分かかることがあります。',
];
const HREFS = ['style.css', './images/logo.png', '/style.css', '/images/logo.png', '../index.html', 'https://cdn.jsdelivr.net/npm/chart.js'];
TABS.push({ id:'pages', label:'GitHub Pages', icon:'🐙',
  intro:'GitHub Pages は、GitHub のリポジトリをそのまま Web サイトとして公開できる無料の機能です。<b>静的サイト（HTML・CSS・JS）</b>ならいちばん手軽。この「Vibe Coding 辞典」も、GitHub Pages で公開できる作りになっています。',
  sections:[
    C('触って理解する', [
      { name:'GitHub Pages で公開する6ステップ', en:'Publishing with GitHub Pages', h:380, tags:['基本','最重要'], demo:'<div class="stp"></div>', init:(el) => stepper($(el, '.stp'), GP, { title:'リポジトリ → 設定 → 公開' }),
        desc:'<code>ユーザー名.github.io</code> という名前のリポジトリを作ると、<code>https://ユーザー名.github.io/</code> の直下に公開される「ユーザーサイト」になります。それ以外のリポジトリは <code>/リポジトリ名/</code> の下に公開される「プロジェクトサイト」です。',
        prompt:'このリポジトリを GitHub Pages で公開したい。必要な設定の手順と、公開後に画像や CSS が読み込めなくなりそうな所（パスの書き方）を確認して。ビルドが必要なら GitHub Actions のワークフローも用意して。' },
      { name:'パスの書き方で、読み込めるかが変わる', en:'Relative vs absolute paths', h:470, wide:true, tags:['体験','よくある失敗'],
        demo:'<div class="kt"><div class="dp-form"><span>ユーザー名</span><input class="kt-in u" value="atsuya"><span>リポジトリ名</span><input class="kt-in r" value="my-site"><span>開いているページ</span><input class="kt-in p" value="blog/index.html"></div><div class="kt-note base"></div><ul class="dp-urls"></ul></div>',
        init:(el) => { const up = () => { const u = $(el, '.u').value.trim() || 'user', r = $(el, '.r').value.trim() || 'repo', p = $(el, '.p').value.trim().replace(/^\//, ''), user = r.toLowerCase() === `${u.toLowerCase()}.github.io`, root = `https://${u}.github.io/${user ? '' : r + '/'}`;
            let page; try{ page = new URL(p, root); }catch(e){ page = new URL(root); }
            $(el, '.base').innerHTML = `このページの URL：<code>${esc(page.href)}</code>　サイトのいちばん上：<code>${esc(root)}</code>`;
            $(el, '.dp-urls').innerHTML = HREFS.map(h => { const to = new URL(h, page), ext = to.origin !== page.origin, ok = ext || to.href.startsWith(root);
              const tip = ext ? '外部のサイトなのでそのまま読み込める' : ok ? (h.startsWith('/') ? 'ユーザーサイトなので、/ から始めても大丈夫' : '相対パスなので、ページの場所から正しくたどれる') : (h.startsWith('/') ? '<b>/ から始めると、リポジトリ名の部分が飛ばされます</b>。プロジェクトサイトでは読み込めません' : 'サイトの外に出てしまいます');
              return `<li class="${ok ? 'ok' : 'bad'}">${ok ? '○' : '×'}<span><code>${esc(h)}</code> → <code>${esc(to.href)}</code><small>${tip}</small></span></li>`; }).join(''); };
          $$(el, 'input').forEach(i => i.oninput = up); up(); },
        desc:'URL の計算は、ブラウザと同じ仕組み（<code>new URL()</code>）で行っています。プロジェクトサイトでは、<b><code>/</code> から始まるパス</b>はリポジトリ名を飛ばしてしまうので、相対パス（<code>./</code> や何も付けない）を使うか、ビルドツールの「base」の設定にリポジトリ名を入れます。リポジトリ名を「<code>ユーザー名.github.io</code>」にすると違いを確かめられます。',
        prompt:'このサイトを GitHub Pages（https://【ユーザー名】.github.io/【リポジトリ名】/）で公開すると、/ から始まるパスで画像や CSS が読み込めなくなります。全ファイルのパスを確認して、相対パスに直すか、Vite の base 設定で対応して。',
        code:'// vite.config.js（Vite で作ったサイトを GitHub Pages に置くとき）\nexport default {\n  base: "/my-site/",   // ← リポジトリ名\n};' },
    ], null, true),
    S('GitHub Pages の注意', [
      T('.nojekyll', '.nojekyll', 'GitHub Pages は標準で Jekyll という仕組みでファイルを処理し、<code>_</code> で始まるフォルダを公開しません。空の <code>.nojekyll</code> ファイルを置くと、そのまま公開されます。'),
      T('404.html', 'Custom 404', '<code>404.html</code> を置くと、存在しない URL のときに表示されます。React などの SPA で画面の切り替えに URL を使うときにも関係します。'),
      T('ビルドが必要なサイト', 'GitHub Actions', 'React・Vite・Astro などは、GitHub Actions でビルドしてから公開します。Pages の設定で Source を「GitHub Actions」にし、フレームワークごとのワークフローのひな形を使います。'),
      T('独自ドメインと HTTPS', 'Custom domain', 'Pages の設定で独自ドメインを入れると、<code>CNAME</code> ファイルが作られます。DNS を設定したら「Enforce HTTPS」にチェック（「ドメインとDNS」タブ）。'),
      T('容量と転送量の目安', 'Usage limits', '公開できるサイトは1GBまで、転送量は月100GBが目安（ソフトな上限）とされています。大きな動画やファイルの配布には向きません。'),
      T('公開されるのはリポジトリの中身', 'Everything is public', '公開リポジトリのファイルは、サイトに載せていなくても誰でも見られます。<code>.env</code> や秘密の情報は絶対に入れない（<a href="security.html">セキュリティ辞典</a>）。', null, ['注意']),
    ]),
  ]});

/* ================= 4. Vercel・Netlify・Cloudflare ================= */
const FW = [
  { l:'素の HTML', build:'なし（空欄）', out:'リポジトリのいちばん上（または index.html のあるフォルダ）', note:'Netlify はフォルダをドラッグ＆ドロップするだけでも公開できます（Netlify Drop）。' },
  { l:'Vite（React・Vue）', build:'<code>npm run build</code>', out:'<code>dist</code>', note:'画面の切り替えに URL を使う SPA は、どの URL でも <code>index.html</code> を返す設定（リライト）が必要。Netlify は <code>_redirects</code>、Vercel は <code>vercel.json</code>。Cloudflare Pages は <code>404.html</code> がなければ自動で SPA として扱います。' },
  { l:'Next.js', build:'<code>npm run build</code>（next build）', out:'<code>.next</code>（自動で判別）', note:'Vercel は設定不要。Netlify は自動で対応。Cloudflare では OpenNext というアダプターを使います。静的に書き出す（<code>output: "export"</code>）なら <code>out</code> フォルダをどこにでも置けます。' },
  { l:'Astro', build:'<code>npm run build</code>', out:'<code>dist</code>', note:'標準は静的サイト。サーバーの処理を使うときは、ホスティングに合わせたアダプターを追加します。' },
  { l:'SvelteKit', build:'<code>npm run build</code>', out:'アダプターによる', note:'<code>adapter-auto</code> が主なホスティングを判別。静的にするなら <code>adapter-static</code>。' },
  { l:'Nuxt', build:'<code>npm run build</code>（静的なら <code>npm run generate</code>）', out:'<code>.output</code>（静的なら <code>.output/public</code>）', note:'主なホスティングは自動で判別します。' },
];
const PF = [
  ['プレビュー', 'プルリクエストやブランチごとに確認用の URL', 'デプロイプレビュー', 'プレビュー（ブランチごと）'],
  ['元に戻す', '「Instant Rollback」で前の版に即戻す', '過去のデプロイを選んで「公開」', '過去のデプロイに戻す'],
  ['関数', 'Vercel Functions', 'Netlify Functions', 'Workers / Pages Functions'],
  ['コマンド', '<code>vercel</code>（本番は <code>vercel --prod</code>）', '<code>netlify deploy --prod</code>', '<code>wrangler pages deploy</code>'],
  ['無料プランの商用利用', '不可（Hobby は個人・非商用）', '可（クレジット制）', '可'],
];
TABS.push({ id:'platforms', label:'Vercel・Netlify・Cloudflare', icon:'▲',
  intro:'Vercel・Netlify・Cloudflare Pages は、<b>GitHub のリポジトリをつなぐだけで、ビルドと公開を自動でやってくれる</b>サービスです。最初に「ビルドのコマンド」と「出力フォルダ」を正しく設定すれば、あとは push するだけ。',
  sections:[
    C('触って理解する', [
      { name:'フレームワークごとのビルド設定', en:'Build settings', h:420, wide:true, tags:['体験','最重要'],
        demo:'<div class="kt"><div class="sg"></div><div class="dp-tbl"><table><tbody class="tb"></tbody></table></div><div class="kt-verdict note"></div></div>',
        init:(el) => $(el, '.sg').append(seg(FW.map(f => f.l), (i) => { const f = FW[i];
          $(el, '.tb').innerHTML = `<tr><td>ビルドのコマンド</td><td>${f.build}</td></tr><tr><td>出力フォルダ</td><td>${f.out}</td></tr><tr><td>インストール</td><td><code>npm install</code>（自動）</td></tr><tr><td>Node.js の版</td><td>package.json の <code>engines</code> などで指定（手元と合わせる）</td></tr>`;
          verdict($(el, '.note'), '', f.note); }, 0).el),
        desc:'多くの場合、リポジトリをつなぐとフレームワークを自動で判別して、ここの値を入れてくれます。<b>ビルドが失敗したら、まずビルドログの最後の数行</b>を読みます（「公開のトラブル」タブ）。',
        prompt:'このリポジトリを【Vercel / Netlify / Cloudflare Pages】で公開したい。フレームワークを判別して、ビルドのコマンド・出力フォルダ・必要な環境変数・SPA のリライト設定を教えて。設定ファイル（vercel.json / netlify.toml）が必要なら作って。' },
    ], null, true),
    { title:'3つのサービスの言葉の対応', note:'2026年11月時点。呼び方や条件は変わることがあります。', table:{ head:['', 'Vercel', 'Netlify', 'Cloudflare'], rows:PF } },
    S('公開を楽にする機能', [
      T('プレビューデプロイ', 'Preview deployments', 'プルリクエストを作ると、その変更だけを反映した確認用の URL ができます。本番に出す前に、スマホや他の人に見てもらえます。', null, ['最重要']),
      T('本番のブランチ', 'Production branch', '通常は main に push したものが本番になります。作業用のブランチで試して、確かめてから main にマージ。'),
      T('すぐ元に戻す', 'Rollback', '公開した版に問題があったら、管理画面で前の版を選んで戻せます。コードを直すより先に、まず戻すのが安全です。', null, ['最重要']),
      T('ビルドログ', 'Build logs', 'ビルドの途中経過の記録。失敗したら赤い行と最後の数行を読みます。AI に貼って原因を聞くのも有効です。', 'Vercel（Netlify）でのビルドが失敗しました。次のビルドログから原因を特定して、直し方を教えて。手元ではビルドできています。\n【ビルドログの最後の50行】'),
      T('Node.js の版をそろえる', 'Node version', '手元と公開先で Node.js の版が違うと、ビルドが失敗することがあります。package.json の <code>engines</code> や <code>.nvmrc</code> で指定します。'),
      T('サブフォルダにあるとき', 'Root directory', 'リポジトリの中のフォルダ（例：<code>web/</code>）にアプリがあるなら、設定の「Root Directory」にそのフォルダを指定します。'),
      T('ドラッグ＆ドロップで公開', 'Netlify Drop', 'Netlify は、フォルダをブラウザにドラッグするだけで公開できます。お試しには最速ですが、更新も手作業になります。'),
      T('コマンドで公開', 'CLI deploys', '各サービスのコマンドラインツールで、手元から直接公開することもできます。CI（自動化）に組み込むときに使います。'),
    ]),
  ]});
})();
