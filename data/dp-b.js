/* 公開のしかた辞典 — B: 環境変数と秘密 / ドメインとDNS / 公開のトラブル / サーバーが必要なもの */
(function(){
const { $, $$, esc, seg } = KIT;
const { S, C, T, L, verdict, MK } = DPH;

/* ================= 5. 環境変数と秘密 ================= */
// a：正解（pub＝ブラウザに出てよい / srv＝サーバーだけ）
const VARS = [
  ['NEXT_PUBLIC_SITE_URL', 'pub', 'サイトの URL は誰に見られても困らない。ブラウザで使うので <code>NEXT_PUBLIC_</code> を付ける。'],
  ['OPENAI_API_KEY', 'srv', 'AI の API キーが漏れると、他人に使われて請求が来る。<b>サーバー側（API ルート）からだけ</b>使う。'],
  ['VITE_SUPABASE_URL', 'pub', 'Supabase のプロジェクトの URL は、ブラウザから接続するので公開される前提。'],
  ['VITE_SUPABASE_ANON_KEY', 'pub', 'anon（公開用）キーは<b>ブラウザに出る前提のキー</b>。そのかわり、データベースの RLS（行ごとの権限）で必ず守る。'],
  ['SUPABASE_SERVICE_ROLE_KEY', 'srv', '<b>すべてのデータを読み書きできる</b>管理者のキー。ブラウザに出たら終わり。サーバーだけで使う。'],
  ['DATABASE_URL', 'srv', 'データベースの接続先とパスワードが入っている。サーバーだけ。'],
  ['STRIPE_SECRET_KEY', 'srv', '決済のシークレットキー。サーバーだけ（<a href="payments.html">決済辞典</a>）。'],
  ['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'pub', 'Stripe の「公開可能キー」は、ブラウザで決済画面を出すためのもので、公開される前提。'],
  ['NEXT_PUBLIC_OPENAI_API_KEY', 'srv', '<b>ひっかけ</b>：秘密のキーなのに <code>NEXT_PUBLIC_</code> を付けた時点で、ブラウザのコードに埋め込まれて誰でも見られる。名前から <code>NEXT_PUBLIC_</code> を外して、サーバー経由で使う。'],
];
TABS.push({ id:'env', label:'環境変数と秘密', icon:'🔑',
  intro:'API キーやデータベースの接続先は、コードに直接書かず<b>環境変数</b>に入れます。手元では <code>.env</code> ファイル、公開先では<b>ホスティングの管理画面</b>に登録します。いちばん大事なのは、<b>ブラウザに出てよい値</b>と<b>サーバーだけで使う秘密の値</b>を分けることです。くわしくは <a href="security.html">セキュリティ辞典</a> へ。',
  sections:[
    C('触って理解する', [
      { name:'ブラウザに出てよい？サーバーだけ？', en:'Public vs secret variables', h:500, wide:true, tags:['体験','最重要'],
        demo:'<div class="kt"><div class="kt-row"><span class="kt-lbl">それぞれ、どちらに置く？</span><span class="kt-lbl sc" style="margin-left:auto"></span></div><div class="dp-vars"></div></div>',
        init:(el) => { const got = {};
          $(el, '.dp-vars').innerHTML = VARS.map(([n], i) => `<div class="dp-var" data-i="${i}"><code>${n}</code><span class="pk"><button type="button" data-v="pub">ブラウザに出てよい</button><button type="button" data-v="srv">サーバーだけ</button></span><span class="why"></span></div>`).join('');
          const score = () => { $(el, '.sc').textContent = `正解 ${Object.values(got).filter(Boolean).length} / ${Object.keys(got).length}`; };
          $$(el, '.dp-var').forEach(row => $$(row, 'button').forEach(b => b.onclick = () => { const i = +row.dataset.i, [, a, w] = VARS[i]; if (!(i in got)) got[i] = b.dataset.v === a;
            $$(row, 'button').forEach(x => { x.classList.toggle('ok', x.dataset.v === a); x.classList.remove('ng'); }); if (b.dataset.v !== a) b.classList.add('ng');
            row.classList.add('done'); $(row, '.why').innerHTML = `${MK(b.dataset.v === a ? 'ok' : 'bad')} ${w}`; score(); }));
          score(); },
        desc:'フレームワークは、<b>決まった頭文字の付いた変数だけ</b>をブラウザ用のコードに埋め込みます（Next.js なら <code>NEXT_PUBLIC_</code>、Vite なら <code>VITE_</code>）。頭文字は「公開してよい」という<b>宣言</b>なので、秘密の値に付けてはいけません。',
        prompt:'このプロジェクトの環境変数を一覧にして、それぞれ「ブラウザに出てよい」「サーバーだけ」に分けて。秘密の値なのにブラウザ用の頭文字（NEXT_PUBLIC_ / VITE_ など）が付いているもの、コードに直接書かれているものがあれば指摘して、サーバー経由で使うように直して。' },
    ], null, true),
    { title:'ブラウザ用の頭文字（フレームワーク別）', note:'この頭文字が付いた変数は、ビルドのときにブラウザ用のコードへ埋め込まれ、誰でも見られます。',
      table:{ head:['フレームワーク', 'ブラウザに出す変数', 'サーバーだけの変数'], rows:[
        ['Next.js', '<code>NEXT_PUBLIC_〇〇</code>', '頭文字なし（API ルート・サーバーコンポーネントで使う）'],
        ['Vite（React・Vue）', '<code>VITE_〇〇</code>', 'Vite だけではサーバーがないので、秘密は別のサーバーや関数へ'],
        ['Astro', '<code>PUBLIC_〇〇</code>', '頭文字なし'],
        ['SvelteKit', '<code>PUBLIC_〇〇</code>（<code>$env/…/public</code>）', '<code>$env/…/private</code>'],
        ['Nuxt', '<code>runtimeConfig.public</code>（<code>NUXT_PUBLIC_〇〇</code>）', '<code>runtimeConfig</code> の public 以外'],
        ['Create React App（古い）', '<code>REACT_APP_〇〇</code>', '—'],
      ] } },
    S('環境変数の扱い方', [
      T('.env は Git に入れない', 'Ignore .env', '<code>.gitignore</code> に <code>.env</code>（<code>.env.local</code> なども）が入っているか確認。代わりに、値を空にした <code>.env.example</code> を入れておくと、何が必要か分かります。', null, ['最重要'], { code:'# .env.example（値は空でコミットする）\nNEXT_PUBLIC_SITE_URL=\nOPENAI_API_KEY=\nDATABASE_URL=' }),
      T('管理画面に登録する', 'Set in the dashboard', 'Vercel・Netlify・Cloudflare の「Environment Variables」に、名前と値を登録します。本番（Production）・プレビュー（Preview）で別の値にもできます。'),
      T('変えたら、もう一度デプロイ', 'Redeploy after changes', 'ブラウザ用の変数はビルドのときに埋め込まれるので、値を変えたら<b>再デプロイ</b>しないと反映されません。'),
      T('秘密はサーバー経由で使う', 'Proxy through the server', 'AI や決済のキーは、ブラウザから直接使わず、自分のサーバー（API ルート・関数）を経由して使います。ブラウザは自分のサーバーを呼ぶだけ。', 'このコードでは、ブラウザから直接 AI の API をキー付きで呼んでいます。Next.js の API ルート（またはサーバーレス関数）を経由する形に直して、キーはサーバーの環境変数から読むようにして。', ['最重要']),
      T('公開前提のキーは制限をかける', 'Restrict public keys', '地図の API キーなど、ブラウザで使うしかないキーは、<b>使えるサイトのドメインを制限</b>する設定をします。Supabase の公開キーは RLS で守ります。'),
      T('漏れたら、すぐ無効にする', 'Rotate leaked keys', 'GitHub に上げてしまったら、ファイルを消すだけでは不十分（履歴に残る）。<b>すぐにキーを無効化して作り直す</b>。', null, ['注意']),
    ]),
  ]});

/* ================= 6. ドメインとDNS ================= */
const DNS = {
  'GitHub Pages':{ apex:[['A', '@', '185.199.108.153'], ['A', '@', '185.199.109.153'], ['A', '@', '185.199.110.153'], ['A', '@', '185.199.111.153']], sub:[['CNAME', 'www', 'ユーザー名.github.io']], note:'リポジトリの Settings → Pages の「Custom domain」にドメインを入れ、DNS が反映されたら「Enforce HTTPS」にチェック。' },
  'Netlify':{ apex:[['A', '@', '75.2.60.5'], ['ALIAS（使えるなら）', '@', 'apex-loadbalancer.netlify.com']], sub:[['CNAME', 'www', 'サイト名.netlify.app']], note:'Netlify の「Domain management」でドメインを追加。DNS ごと Netlify に任せる（ネームサーバーを変える）方法もあります。古い AAAA レコードは消します。' },
  'Vercel':{ apex:[['A', '@', '76.76.21.21（多くのプロジェクトの値）']], sub:[['CNAME', 'www', '管理画面に表示される値（プロジェクトごとに違う）']], note:'Vercel の「Domains」でドメインを追加すると、設定すべき値が表示されます。<b>この表より管理画面の表示を優先</b>してください。' },
  'Cloudflare Pages':{ apex:[['（ネームサーバーを Cloudflare に移す）', '@', 'Cloudflare の管理画面で設定']], sub:[['CNAME', 'www', 'プロジェクト名.pages.dev']], note:'ルートのドメインで使うには、ドメインの DNS を Cloudflare で管理する（ネームサーバーを Cloudflare に変える）必要があります。サブドメインなら CNAME だけで設定できます。' },
};
TABS.push({ id:'domain', label:'ドメインとDNS', icon:'🌐',
  intro:'<code>〇〇.com</code> のような自分のドメインを使うには、①ドメインを取得し、②DNS の設定で「このドメインはこのホスティングに向ける」と登録し、③ホスティング側でもドメインを追加します。HTTPS（鍵マーク）は多くのホスティングが自動で付けてくれます。',
  sections:[
    C('触って理解する', [
      { name:'設定する DNS レコードを調べる', en:'DNS records', h:430, wide:true, tags:['体験','最重要'],
        demo:'<div class="kt"><div class="dp-form"><span>ドメイン</span><input class="kt-in dm" value="example.com" aria-label="ドメイン"></div><div class="kt-row"><span class="kt-lbl">公開先</span><span class="s1"></span></div><div class="kt-row"><span class="kt-lbl">使い方</span><span class="s2"></span></div><div class="dp-tbl"><table><thead><tr><th>種類</th><th>名前（ホスト）</th><th>値</th></tr></thead><tbody class="tb"></tbody></table></div><div class="kt-verdict note"></div></div>',
        init:(el) => { let h = 'Netlify', k = 'sub';
          const up = () => { const d = ($(el, '.dm').value.trim() || 'example.com').replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, ''), x = DNS[h];
            $(el, '.tb').innerHTML = x[k].map(([t, n, v]) => `<tr><td>${t}</td><td><code>${n === '@' ? esc(d) + '（@）' : esc(n + '.' + d)}</code></td><td><code>${v}</code></td></tr>`).join('');
            verdict($(el, '.note'), '', (k === 'sub' ? `<b>www.${esc(d)}</b> で公開する設定です。` : `<b>${esc(d)}</b>（www なし）で公開する設定です。ルートのドメインには CNAME が使えないので、A レコードなどを使います。`) + x.note); };
          $(el, '.s1').append(seg(Object.keys(DNS), (i) => { h = Object.keys(DNS)[i]; up(); }, 1).el);
          $(el, '.s2').append(seg(['www 付き（サブドメイン）', 'ルート（www なし）'], (i) => { k = i ? 'apex' : 'sub'; up(); }, 0).el);
          $(el, '.dm').oninput = up; },
        desc:'値は各サービスの公式ドキュメントにある一般的なもの（2026年11月時点）です。<b>実際に設定するときは、ホスティングの管理画面に表示される値を優先</b>してください。www とルートの両方を設定して、片方からもう片方へ転送するのが定番です。',
        prompt:'ドメイン【〇〇.com】を【ホスティング名】で公開したサイトにつなぎたい。ドメインは【取得したサービス】で管理しています。設定する DNS レコード（種類・名前・値）と、ホスティング側の設定手順、www とルートの転送のさせ方を教えて。メールも使っているので、MX レコードは消さない前提で。' },
    ], null, true),
    S('ドメインの基本', [
      T('ドメインの取得', 'Registrar', 'ドメインは「レジストラ」と呼ばれるサービスで取得します（お名前.com・ムームードメイン・Cloudflare Registrar など）。<b>初年度だけ安く、更新料が高い</b>ことがあるので、更新料も確認します。', null, ['基本']),
      T('ルートとサブドメイン', 'Apex / subdomain', '<code>example.com</code> がルート（apex）、<code>www.example.com</code> や <code>blog.example.com</code> がサブドメイン。ルートには CNAME レコードが使えないなどの違いがあります。'),
      T('DNS レコードの種類', 'Record types', '<b>A</b>：IP アドレスに向ける。<b>CNAME</b>：別の名前に向ける。<b>MX</b>：メールの受け取り先。<b>TXT</b>：所有の確認などの文字情報。'),
      T('反映には時間がかかる', 'Propagation / TTL', 'DNS の変更は、すぐ反映されることもあれば、数時間〜最大1日ほどかかることもあります（TTL という保存時間による）。焦って何度も変えないこと。'),
      T('HTTPS は自動で', 'Automatic HTTPS', '多くのホスティングは、DNS が正しく向いたら、無料の証明書（Let\'s Encrypt など）を自動で発行します。設定直後は少し待ちます。'),
      T('.jp ドメイン', '.jp domain', '<code>.jp</code> を取るには、日本国内の住所が必要です。<code>.co.jp</code> は日本の会社が1つだけ持てるなど、種類ごとに条件があります。'),
      T('住所の公開（WHOIS）', 'WHOIS privacy', 'ドメインの持ち主の情報は公開される仕組みがあります。個人なら、レジストラの「情報公開代行」を使います。', null, ['注意']),
      T('更新を忘れない', 'Auto-renew', '更新を忘れると、サイトが止まるだけでなく、<b>他人に取られる</b>こともあります。自動更新と、登録したカードの期限を確認。', null, ['注意']),
      T('メールも使うなら', 'Keep MX records', 'ドメインでメール（〇〇@example.com）も使っているなら、DNS を変えるときに MX レコードを消さないように。ネームサーバーを移すときは特に注意。'),
    ]),
  ]});

/* ================= 7. 公開のトラブル ================= */
const SYM = [
  { l:'真っ白のページ', c:['JavaScript のエラーで止まっている（開発者ツール F12 の Console を見る）', '環境変数が本番に登録されていない', 'GitHub Pages で、ファイルの場所（パス・base の設定）がずれている'], p:'公開したページが真っ白です。Console に次のエラーが出ています。手元では動きます。原因の候補を、環境変数・パス・ビルド設定の観点で挙げて、確かめる順番を教えて。\n【エラー全文】' },
  { l:'CSS・画像が読み込まれない', c:['<code>/</code> から始まるパスで、GitHub Pages のリポジトリ名が飛ばされている（「GitHub Pages」タブの見本）', 'ファイル名の大文字・小文字が違う（本番は区別する）', 'http の画像を https のページで読み込んでいる'], p:'公開したサイトで画像と CSS が読み込まれません。開発者ツールの Network タブで 404 になっているファイルの URL は【URL】です。パスの書き方とファイル名の大文字小文字を確認して直して。' },
  { l:'再読み込みすると 404', c:['React などの SPA で、<code>/about</code> のような URL を直接開くと、そのファイルがないため 404 になる', 'どの URL でも <code>index.html</code> を返す「リライト」の設定が必要'], p:'Vite で作った SPA を【ホスティング名】で公開したら、トップ以外のページで再読み込みすると 404 になります。SPA のリライト設定を追加して。', code:'# Netlify の public/_redirects\n/*  /index.html  200\n\n// Vercel の vercel.json\n{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }' },
  { l:'ビルドが失敗する', c:['手元では警告だった型エラー・Lint エラーが、本番のビルドではエラー扱い', 'Node.js の版が手元と違う', 'package.json に入っていないパッケージを使っている（手元にだけ入っている）', '環境変数がなくて、ビルド中に止まる'], p:'【ホスティング名】でビルドが失敗します。手元の npm run build は成功します。次のビルドログの最後の部分から原因を特定して、直し方を教えて。\n【ビルドログ】' },
  { l:'APIやログインが動かない', c:['サーバー側の環境変数が登録されていない', 'API の URL が localhost のまま', 'Supabase・Firebase・Google ログインなどの「許可するURL（リダイレクトURL）」に本番の URL を追加していない', 'CORS（別のドメインからのアクセス）が許可されていない'], p:'公開したサイトでログインだけが失敗します。手元では動きます。認証サービス【Supabase / Firebase など】側で本番の URL を許可する設定が必要か、確認する場所を教えて。' },
  { l:'更新したのに変わらない', c:['ブラウザのキャッシュ（強制再読み込み：Ctrl＋Shift＋R）', 'まだデプロイが終わっていない（ホスティングのデプロイ一覧を確認）', '本番のブランチ以外に push している', 'CDN のキャッシュ（しばらく待つか、管理画面で削除）'], p:null },
  { l:'独自ドメインで開けない', c:['DNS の反映を待っている（数時間かかることも）', 'レコードの値の打ち間違い、古い A・AAAA レコードが残っている', 'ホスティング側にドメインを追加していない', '鍵マークがない：証明書の発行待ち、または「HTTPS を強制」の設定がオフ'], p:'独自ドメイン【〇〇.com】でサイトが開けません。設定した DNS レコードは次のとおりです。間違いや足りないものがないか確認して。\n【レコードの一覧】' },
  { l:'手元では動くのに本番だけ動かない', c:['環境変数（いちばん多い）', 'ファイル名の大文字・小文字', 'http と https の違い', 'サーバーの処理が、静的サイトのホスティングでは動かない'], p:'手元では動くのに、公開すると【症状】になります。手元と本番の違い（環境変数・URL・ファイル名・ビルド設定・サーバーの有無）を1つずつ確かめる手順を作って。' },
];
TABS.push({ id:'trouble', label:'公開のトラブル', icon:'🩹',
  intro:'公開で起きるトラブルは、ほとんどが<b>決まったパターン</b>です。症状を選ぶと、よくある原因と確かめ方が出ます。困ったら、まず<b>前の版に戻して</b>（ロールバック）、落ち着いて原因を探します。',
  sections:[
    C('症状から探す', [
      { name:'症状 → よくある原因', en:'Troubleshooting', h:460, wide:true, tags:['体験','最重要'],
        demo:'<div class="kt"><div class="sg"></div><div class="dp-sym"></div></div>',
        init:(el) => $(el, '.sg').append(seg(SYM.map(s => s.l), (i) => { const s = SYM[i];
          $(el, '.dp-sym').innerHTML = `<div><b>よくある原因（上から順に確かめる）</b><ol style="margin:4px 0 0;padding-left:1.3em">${s.c.map(c => `<li>${c}</li>`).join('')}</ol></div>${s.code ? `<div><b>設定の例</b><pre>${esc(s.code)}</pre></div>` : ''}${s.p ? `<div><b>AIへの聞き方</b><pre>${esc(s.p)}</pre></div>` : ''}`; }, 0).el),
        desc:'エラーの読み方は <a href="errors.html">エラー・トラブル辞典</a>、AIへの聞き方は <a href="prompts.html#debug">指示文テンプレ辞典</a> の「症状別の頼み方」にもあります。',
        prompt:null },
    ], null, true),
    S('落ち着いて対応するコツ', [
      T('まず戻す', 'Roll back first', '利用者がいるなら、原因探しより先に、前の動いていた版に戻します（Vercel・Netlify は管理画面で数クリック）。', null, ['最重要']),
      T('ビルドログと Console を読む', 'Read the logs', 'ビルドの失敗はビルドログ、画面の不具合はブラウザの Console と Network タブに、ほぼ必ず手がかりがあります。'),
      T('プレビューで確かめてから本番へ', 'Test in preview', '大きな変更は、ブランチで push してプレビューの URL で確かめてから main へ。'),
      T('1つずつ変えて確かめる', 'One change at a time', '設定を一度に何か所も変えると、どれが効いたか分からなくなります。'),
    ]),
  ]});

/* ================= 8. サーバーが必要なもの ================= */
TABS.push({ id:'server', label:'サーバーが必要なもの', icon:'⚙',
  intro:'ログイン・データの保存・AI の呼び出し・定期実行など、<b>サーバー側の処理</b>が必要なものの公開方法です。今は「自分でサーバーを持たない」作り方が主流で、<b>サーバーレス関数</b>と<b>BaaS（Supabase・Firebase など）</b>の組み合わせが定番です。',
  sections:[
    { title:'やりたいこと → 置き方', note:'代表的な組み合わせです。くわしい比較は <a href="tech-stack.html">技術スタック辞典</a> へ。',
      table:{ head:['やりたいこと', '定番の置き方', '注意'], rows:[
        ['API キーを隠して AI や外部 API を呼ぶ', 'サーバーレス関数（Vercel Functions・Netlify Functions・Cloudflare Workers）', '関数の実行時間・回数に上限あり'],
        ['ログインとデータの保存', 'Supabase・Firebase（BaaS）＋ 静的サイトや Next.js', 'RLS・セキュリティルールで権限を必ず設定'],
        ['Python で作った分析アプリ', 'Streamlit Community Cloud・Hugging Face Spaces', '使われないと休止する'],
        ['Node.js や Python の API サーバー', 'Render・Railway・Fly.io', '無料枠は止まる・上限がある。有料なら常に動く'],
        ['決まった時間に処理を動かす', 'GitHub Actions のスケジュール・Vercel Cron Jobs・Cloudflare Cron Triggers', '時刻は UTC 基準のことが多い（日本時間との差に注意）'],
        ['大きなファイル・画像の保存', 'Supabase Storage・Cloudflare R2・Cloudinary', '公開・非公開の設定を確認'],
      ] } },
    S('サーバー側を公開するときの言葉', [
      T('サーバーレス関数', 'Serverless functions', 'サーバーを自分で用意せず、呼ばれたときだけ動く小さなプログラム。API キーを隠して外部の API を呼ぶ「中継役」によく使います。', null, ['基本','最重要']),
      T('BaaS', 'Backend as a Service', 'ログイン・データベース・ファイル保存などを、まとめて借りられるサービス（Supabase・Firebase など）。サーバーを書かずにアプリが作れます。'),
      T('コールドスタート', 'Cold start', 'しばらく使われていない関数やサーバーが、最初に呼ばれたときに起動に時間がかかること。無料のサーバーが止まっている（スリープ）ときも同じ。'),
      T('Docker（コンテナ）', 'Docker', 'アプリと動く環境をひとまとめにした箱。Render や Fly.io は Docker でそのまま動かせるので、「手元では動く」問題が減ります。'),
      T('データベースの場所', 'Region', 'サーバーとデータベースが遠い地域にあると、表示が遅くなります。日本向けなら東京など近い地域を選びます。'),
      T('ログを見る', 'Logs', 'サーバー側のエラーはブラウザには出ません。ホスティングの「Logs」画面でエラーを確認します。'),
      T('料金の上限と通知', 'Spending limits', 'サーバーや AI の利用は使った分だけ請求されることがあります。上限と通知を設定してから公開（<a href="release.html#launch">公開後の運用</a>）。', null, ['注意']),
      T('サーバーの処理を AI に頼むとき', 'Ask AI', 'どこで動くコードか（ブラウザ・関数・サーバー）を指定すると、秘密の値の置き場所を間違えにくくなります。', 'この機能【内容】を作りたい。ブラウザで動く部分と、サーバー（関数）で動く部分に分けて設計して。API キーはサーバー側の環境変数に置き、公開先は【ホスティング名】で動く形にして。'),
    ]),
  ]});
})();
