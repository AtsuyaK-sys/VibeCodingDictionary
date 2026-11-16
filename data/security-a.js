/* セキュリティ・認証辞典 — A: 共通ヘルパー / 基本の考え方 / 秘密情報・APIキー / 認証（ログイン） */
(function(){
const { $, $$, esc, tbl, seg, seq, stepper } = KIT;
const S = (title, items, note) => ({ title, note, layout:'rows', items });
const C = (title, items, note, lg) => ({ title, note, layout:lg ? 'cards lg' : 'cards', items });
const T = (name, en, desc, prompt, tags, more) => Object.assign({ name, en, desc, prompt, tags }, more || {});
const enc = new TextEncoder(), dec = new TextDecoder();
const hex = (b) => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
const sha256 = async (s) => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));
const b64 = (bytes) => { let s = ''; new Uint8Array(bytes).forEach(b => s += String.fromCharCode(b)); return btoa(s); };
const b64u = (bytes) => b64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64uStr = (s) => b64u(enc.encode(s));
const unb64u = (s) => { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return dec.decode(Uint8Array.from(atob(s), c => c.charCodeAt(0))); };
// 暗号の機能（crypto.subtle）は https / localhost / ファイル直開きでのみ使える
const noCrypto = (el) => { if (window.crypto && crypto.subtle) return false; el.innerHTML = '<div class="kt center"><div class="kt-verdict warn">このデモは https:// か localhost で開いたときに動きます（暗号の機能は安全な接続でだけ使えます）。</div></div>'; return true; };
const verdict = (el, cls, html) => { el.classList.remove('ok', 'bad', 'warn'); if (cls) el.classList.add(cls); el.innerHTML = html; };
const COMMON = ['password', '123456', '12345678', '123456789', 'qwerty', 'abc123', '111111', 'iloveyou', 'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'passw0rd', 'password1', '000000', 'sakura', 'sakura123', 'pokemon', 'asdfgh', 'qwerty123', '1q2w3e4r', 'hello123', 'test1234'];
window.SCH = { S, C, T, sha256, b64u, b64uStr, unb64u, noCrypto, verdict, COMMON };

/* ================= 1. 基本の考え方 ================= */
TABS.push({ id:'basics', label:'基本の考え方', icon:'🧭',
  intro:'バイブコーディングで作ったアプリも、公開した瞬間から<b>世界中から攻撃の対象</b>になります。といっても、守り方の基本は数えるほど。まずは「ブラウザは信用しない」「秘密は外に出さない」「確かめるのはサーバー」の3つを、触って体験してください。',
  sections:[
    C('まず体験する', [
      { name:'ブラウザの値は書き換えられる', en:'Never trust the client', h:310, tags:['最重要','体験'],
        demo:'<div class="kt"><div class="sc-card sc-price"><span>プロプラン（1年）</span><span class="p">¥12,000</span></div><div class="kt-lbl">ブラウザからサーバーへ送られるデータ</div><div class="kt-code req"></div><div class="kt-row"><button class="kt-btn tamper">🛠 開発者ツールで価格を ¥1 に書き換える</button></div><div class="kt-row"><span class="kt-lbl">サーバーの作り</span><span class="sw"></span></div><div class="kt-row"><button class="kt-btn pri buy">購入する</button><button class="kt-btn sm reset">元に戻す</button></div><div class="kt-verdict res">「購入する」を押すと、サーバーがどう処理するかが表示されます。</div></div>',
        init:(el) => { let price = 12000, check = 0; const req = $(el, '.req'), p = $(el, '.p'), res = $(el, '.res');
          const draw = () => { req.innerHTML = `POST /api/checkout\n{ "plan": "pro", "price": <span class="${price !== 12000 ? 'x' : 'g'}">${price}</span> }`; p.classList.toggle('x', price !== 12000); };
          $(el, '.sw').replaceWith(seg(['送られた価格を使う', 'サーバーで決め直す'], i => { check = i; verdict(res, '', '「購入する」を押すと、サーバーがどう処理するかが表示されます。'); }).el);
          $(el, '.tamper').onclick = () => { price = 1; draw(); };
          $(el, '.reset').onclick = () => { price = 12000; draw(); verdict(res, '', '元に戻しました。'); };
          $(el, '.buy').onclick = () => {
            if (check) verdict(res, 'ok', `✅ サーバーはDBの料金表から <b>¥12,000</b> を取り出して決済しました。${price !== 12000 ? `ブラウザから届いた ¥${price} は無視されます。` : ''}`);
            else if (price !== 12000) verdict(res, 'bad', '❌ <b>¥1 で1年分が買えてしまいました。</b> サーバーが、ブラウザから届いた価格をそのまま信じたためです。');
            else verdict(res, 'warn', '⚠ 今回は正しい価格でしたが、この作りだと誰でも価格を書き換えて送れます。'); };
          draw(); },
        desc:'ブラウザ（フロントエンド）で動くものは、利用者が<b>見ることも書き換えることも自由</b>です。価格・ポイント・ユーザーID・「管理者かどうか」などは、必ず<b>サーバー側で決め直す・確かめる</b>。これがすべてのセキュリティの出発点です。',
        prompt:'決済・ポイント・権限に関わる値は、ブラウザから送られた値を信用せず、サーバー側でDBから取得し直して計算するようにして。フロントエンドで計算・判定している箇所があれば一覧にして、サーバー側へ移して。' },
      { name:'エンコード・ハッシュ・暗号化の違い', en:'Encode / Hash / Encrypt', h:330, tags:['混同注意','体験'],
        demo:'<div class="kt"><input class="kt-in txt" value="ひみつのメモ" aria-label="元の文字"><div class="sc-out"><span class="t kt-badge warn">エンコード</span><div class="v e"></div><span class="t kt-badge">ハッシュ</span><div class="v hs"></div><span class="t kt-badge ok">暗号化</span><div class="v en"></div></div><div class="kt-row"><button class="kt-btn sm d1">エンコードを戻す</button><button class="kt-btn sm d2">正しい鍵で復号</button><button class="kt-btn sm d3">違う鍵で復号</button></div><div class="kt-verdict res">上の文字を書き換えると、3つの結果が変わります。</div></div>',
        init:(el) => { if (noCrypto(el)) return; const inp = $(el, '.txt'), res = $(el, '.res'); let k1, k2, last = null;
          const upd = async () => { const t = inp.value; $(el, '.e').textContent = b64(enc.encode(t)); $(el, '.hs').innerHTML = (await sha256(t)) + '<small>1文字変えるだけで全体が変わり、元には戻せない</small>';
            if (!k1) return; const iv = crypto.getRandomValues(new Uint8Array(12)); const ct = await crypto.subtle.encrypt({ name:'AES-GCM', iv }, k1, enc.encode(t)); last = { iv, ct }; $(el, '.en').innerHTML = b64(ct) + '<small>AES-256-GCM（毎回ちがう値になる）</small>'; };
          (async () => { k1 = await crypto.subtle.generateKey({ name:'AES-GCM', length:256 }, false, ['encrypt', 'decrypt']); k2 = await crypto.subtle.generateKey({ name:'AES-GCM', length:256 }, false, ['encrypt', 'decrypt']); upd(); })();
          inp.addEventListener('input', upd);
          $(el, '.d1').onclick = () => verdict(res, 'warn', `「${esc(dec.decode(Uint8Array.from(atob($(el, '.e').textContent), c => c.charCodeAt(0))))}」に戻りました。<b>エンコードは鍵なしで誰でも戻せる</b>ので、隠す目的には使えません。`);
          $(el, '.d2').onclick = async () => { const pt = await crypto.subtle.decrypt({ name:'AES-GCM', iv:last.iv }, k1, last.ct); verdict(res, 'ok', `「${esc(dec.decode(pt))}」に戻りました。<b>暗号化は鍵を持っている人だけ</b>が元に戻せます。`); };
          $(el, '.d3').onclick = async () => { try{ await crypto.subtle.decrypt({ name:'AES-GCM', iv:last.iv }, k2, last.ct); }catch(e){ verdict(res, 'bad', '❌ 復号に失敗しました。<b>違う鍵では元に戻せません</b>（改ざんも検知されます）。'); } }; },
        desc:'3つは目的がまったく違います。<b>エンコード</b>（Base64など）は形式を変えるだけで誰でも戻せる。<b>ハッシュ</b>（SHA-256など）は元に戻せない「指紋」で、パスワードの保存や改ざん検知に使う。<b>暗号化</b>（AESなど）は鍵がある人だけ戻せる。「Base64にしたから安全」は典型的な誤解です。',
        prompt:'このコードで「暗号化」と書かれている処理が、本当に暗号化（鍵が必要）なのか、エンコード（誰でも戻せる）なのか、ハッシュ（戻せない）なのかを確認して、目的に合っていなければ直して。' },
      { name:'電子署名で改ざんを見抜く', en:'Digital signature', h:320, tags:['仕組み','体験'],
        demo:'<div class="kt"><div class="kt-lbl">送るメッセージ</div><textarea class="kt-in msg" rows="2" aria-label="メッセージ">佐藤さんへ 10,000円を振り込みます</textarea><div class="kt-row"><button class="kt-btn pri sign">① 秘密鍵で署名</button><button class="kt-btn bad tamper">② 途中で改ざん</button><button class="kt-btn verify">③ 公開鍵で検証</button></div><div class="sc-out"><span class="t kt-lbl">署名</span><div class="v sg">まだ署名していません</div></div><div class="kt-verdict res">①で署名 → ③で検証すると成功。②で書き換えてから検証すると…？</div></div>',
        init:(el) => { if (noCrypto(el)) return; const msg = $(el, '.msg'), res = $(el, '.res'); let keys, sig = null;
          crypto.subtle.generateKey({ name:'ECDSA', namedCurve:'P-256' }, false, ['sign', 'verify']).then(k => keys = k);
          $(el, '.sign').onclick = async () => { sig = await crypto.subtle.sign({ name:'ECDSA', hash:'SHA-256' }, keys.privateKey, enc.encode(msg.value)); $(el, '.sg').textContent = b64(sig); verdict(res, '', '署名しました。メッセージと署名をいっしょに送ります。'); };
          $(el, '.tamper').onclick = () => { msg.value = msg.value.replace('10,000', '100,000').replace('佐藤', '田中'); verdict(res, 'warn', '途中の誰かがメッセージを書き換えました。署名はそのままです。'); };
          $(el, '.verify').onclick = async () => { if (!sig){ verdict(res, 'warn', '先に①で署名してください。'); return; } const ok = await crypto.subtle.verify({ name:'ECDSA', hash:'SHA-256' }, keys.publicKey, sig, enc.encode(msg.value));
            verdict(res, ok ? 'ok' : 'bad', ok ? '✅ 検証成功：<b>本人が書いた・途中で変わっていない</b>ことが確かめられました。' : '❌ 検証失敗：<b>署名と中身が合いません。改ざんされています</b>。'); }; },
        desc:'<b>秘密鍵で署名し、公開鍵で検証</b>します。1文字でも変わると検証に失敗するので、「誰が書いたか」と「途中で変わっていないか」が分かります。JWTトークン、Stripeなどの<b>Webhookの検証</b>、アプリのコード署名、HTTPSの証明書で使われています。',
        prompt:'外部サービスから届くWebhookは、公式ドキュメントの方法で署名を検証してから処理するようにして。検証に失敗したリクエストは400で拒否し、ログに残して。' },
    ], null, true),
    S('セキュリティの基本原則', [
      T('信頼境界：ブラウザは信用しない', 'Trust boundary', '「自分の管理下（サーバー）」と「利用者の手元（ブラウザ・スマホアプリ）」の境目を意識する。境目を越えて入ってくる値（フォーム・URL・Cookie・ヘッダー・ファイル）は、<b>すべて偽物かもしれない</b>前提で扱う。', 'このアプリの信頼境界（ブラウザとサーバーの境目）を図にして、外から入ってくる値をすべて洗い出し、それぞれサーバーで検証しているか表にして。', ['最重要']),
      T('入力は検証、出力はエスケープ', 'Validate input, escape output', '受け取るときは「型・長さ・形式・範囲」をチェック（zodなどのスキーマ検証）。画面やSQLに出すときは、その場所に合った方法でエスケープ（無害化）する。XSS・SQLインジェクションの大半はこれで防げる。', 'すべてのAPIの入力を zod でスキーマ検証して。文字列は長さの上限、数値は範囲、メールやURLは形式をチェックし、不正な入力は400で返して。', ['基本']),
      T('最小権限', 'Least privilege', 'ユーザー・APIキー・サーバー・DBユーザーには、<b>必要な最小限の権限だけ</b>を渡す。読み取りだけで済むなら書き込み権限は与えない。漏れたときの被害を小さくできる。', 'このアプリで使っているAPIキー・DBユーザー・サービスアカウントの権限を一覧にして、必要以上の権限がないか確認し、最小権限にする手順を教えて。'),
      T('多層防御', 'Defense in depth', '1つの対策が破られても次で止まるように、<b>守りを何層にも重ねる</b>。例：入力検証＋エスケープ＋CSP＋HttpOnly Cookie。「フロントで隠したから大丈夫」は1層だけ。'),
      T('デフォルトで拒否', 'Deny by default', '最初は全部ダメにして、必要なものだけ許可する。RLS・Firebaseのルール・CORS・ファイアウォールなどは「全部許可」から始めない。', 'アクセス制御を「デフォルト拒否・必要なものだけ許可」の形に書き直して。現在すべて許可になっている設定があれば教えて。'),
      T('秘密は最初から書かない', 'No secrets in code', 'APIキーやパスワードは<b>コードに直接書かず環境変数</b>へ。一度でもGitに入れると履歴に残り、消すのが大変。「あとで消す」は危険。', null, ['最重要']),
      T('暗号・認証は自作しない', 'Don\'t roll your own crypto/auth', '暗号やログインの仕組みは、専門家が何年もかけて穴を塞いだ<b>実績あるライブラリ・サービス</b>を使う（Supabase Auth・Clerk・Auth.js・bcryptなど）。AIに一から書かせると、もっともらしい穴があることが多い。', 'ログイン機能は自作せず、Supabase Auth（または Clerk / Auth.js）を使って実装して。パスワードの保存や確認を自分で書いている箇所があれば置き換えて。', ['おすすめ']),
      T('失敗したら安全側に', 'Fail securely', 'エラーが起きたときは「許可」ではなく「拒否」に倒す。権限チェックで例外が出たら通さない。エラー画面に内部情報（スタックトレース・SQL・パス）を出さない。'),
      T('攻撃面を減らす', 'Reduce attack surface', '使っていないAPI・ページ・ライブラリ・管理画面・開いているポートは消す。「念のため残しておく」機能が狙われる。'),
      T('記録して気づけるようにする', 'Logging & monitoring', 'ログイン失敗・権限エラー・大量アクセス・課金の急増などを記録し、異常に<b>気づける</b>ようにする。ただしパスワードやトークンはログに出さない。'),
      T('依存関係も自分のコード', 'Supply chain', 'npm・pipで入れたライブラリも、アプリの一部として攻撃面になる。不要なものは入れない、定期的に更新・脆弱性チェック（npm audit・Dependabot）。'),
      T('機密性・完全性・可用性', 'CIA triad', 'セキュリティで守る3つのもの。<b>機密性</b>＝見られてはいけない人に見られない、<b>完全性</b>＝勝手に書き換えられない、<b>可用性</b>＝使いたいときに使える（落ちない）。'),
    ]),
    { title:'よく狙われる弱点トップ10（OWASP）', note:'Webアプリの代表的な弱点をまとめた国際的なリスト「OWASP Top 10」の主な項目です（2025年版ではサプライチェーンと例外処理の項目が加わりました）。',
      table:{ head:['弱点', 'ざっくり言うと', 'バイブコーディングでの典型例', '見るタブ'], rows:[
        ['アクセス制御の不備', '見てはいけないデータが見える・操作できる', 'URLのIDを変えると他人のデータが出る／RLS未設定', '認可・アクセス制御'],
        ['設定ミス', '初期設定や「テストモード」のまま公開', 'Firebaseのルールが「全員読み書き可」、デバッグモードのまま公開', 'AIコードの危険パターン'],
        ['サプライチェーン', '使っている部品（ライブラリ）から攻撃される', '存在しないパッケージ名をAIが提案→偽物をインストール', 'Webの攻撃と対策'],
        ['暗号の失敗', '守るべきデータが平文・弱い方式', 'パスワードを平文やMD5で保存、HTTPで通信', '認証（ログイン）'],
        ['インジェクション', '入力がプログラムとして実行される', 'SQLの文字列連結、innerHTMLへの埋め込み（XSS）', 'Webの攻撃と対策'],
        ['安全でない設計', 'そもそも仕様に穴がある', 'クーポンの何回でも使える、マイナス個数で注文できる', 'Webの攻撃と対策'],
        ['認証の失敗', 'ログインまわりが弱い', 'パスワード総当たりし放題、トークンが期限なし', '認証（ログイン）'],
        ['データ・ソフトの改ざん', '検証せずに外部データを信じる', 'Webhookの署名を確認していない', '基本の考え方'],
        ['ログ・監視の不足', '攻撃されても気づかない', 'エラーも課金急増も誰も見ていない', '公開・運用チェック'],
        ['SSRF・例外処理', 'サーバーに外部URLを取りに行かせる／エラー時の扱いが雑', 'URLプレビュー機能で社内のURLを読まれる、エラーで認証を素通り', 'Webの攻撃と対策'],
      ]}},
    S('暗号まわりの言葉', [
      T('共通鍵暗号', 'Symmetric encryption（AESなど）', '暗号化と復号に<b>同じ鍵</b>を使う。速い。鍵をどう安全に渡すかが課題。保存データの暗号化などに使う。'),
      T('公開鍵暗号', 'Public-key cryptography（RSA・楕円曲線）', '<b>公開鍵と秘密鍵のペア</b>を使う。公開鍵は配ってよく、秘密鍵は絶対に渡さない。「公開鍵で暗号化→秘密鍵で復号」「秘密鍵で署名→公開鍵で検証」。', null, null),
      T('ハッシュ関数', 'Hash（SHA-256など）', '任意のデータから固定長の「指紋」を作る。元に戻せない・少しの違いで全く別の値になる。ファイルの改ざん検知、パスワード保存（専用の遅いハッシュ）に使う。'),
      T('HMAC', 'Hash-based Message Authentication Code', '秘密の鍵を混ぜて作るハッシュ。鍵を知っている人同士で「改ざんされていない」ことを確かめる。JWT（HS256）やWebhookの署名に使われる。'),
      T('ソルト／ペッパー', 'Salt / Pepper', 'ソルト＝パスワードごとに混ぜるランダムな値（DBに一緒に保存）。同じパスワードでも違うハッシュになる。ペッパー＝全体で共通の秘密の値（DBとは別に保管）。'),
      T('暗号学的に安全な乱数', 'CSPRNG', 'トークン・パスワードリセットURL・招待コードには、予測できない乱数を使う。JSなら <code>crypto.getRandomValues()</code> / <code>crypto.randomUUID()</code>。<code>Math.random()</code> は予測されうるので使わない。', 'トークンや招待コードの生成に Math.random() を使っている箇所を探して、crypto.randomUUID() か crypto.getRandomValues() に置き換えて。', null, { code:'// ✅ 安全\nconst token = crypto.randomUUID();\nconst bytes = crypto.getRandomValues(new Uint8Array(32));\n\n// ❌ 予測されうる\nconst bad = Math.random().toString(36).slice(2);' }),
      T('証明書・認証局', 'Certificate / CA', 'HTTPSで「このサーバーは本物の example.com です」と保証する電子的な身分証。認証局（CA）が発行する。Let\'s Encrypt で無料取得でき、Vercel・Netlifyなどは自動で設定される。'),
      T('エンドツーエンド暗号化', 'E2EE', '送信者と受信者だけが読める暗号化。途中のサーバー（運営者）も読めない。LINEやSignalのメッセージなど。'),
      T('鍵管理', 'Key management / KMS', '暗号の鍵を安全に作成・保管・交換・廃棄すること。クラウドのKMS（AWS KMS・Google Cloud KMS）を使うと、鍵そのものを触らずに暗号化できる。'),
    ]),
    S('知っておきたい用語', [
      T('脆弱性', 'Vulnerability', 'セキュリティ上の弱点・穴。バグの一種。'),
      T('攻撃面', 'Attack surface', '攻撃者が触れられる入口の総数（ページ・API・フォーム・ポート・ライブラリ）。少ないほど守りやすい。'),
      T('ゼロデイ', 'Zero-day', '修正方法がまだない（公表された当日の）脆弱性。'),
      T('CVE／CVSS', 'Common Vulnerabilities and Exposures', '公開された脆弱性につく通し番号（CVE-2025-xxxx）と、その深刻度の点数（CVSS：0〜10）。npm auditの結果にも出てくる。'),
      T('パッチ', 'Patch', '脆弱性やバグを直す修正版。ライブラリのアップデートで当てる。'),
      T('脆弱性診断・ペネトレーションテスト', 'Security assessment / Pentest', '専門家が実際に攻撃を試して弱点を探すこと。個人開発なら、AIによるコードレビュー＋自動ツールでも多くが見つかる。'),
      T('バグバウンティ', 'Bug bounty', '脆弱性を見つけて報告した人に報奨金を払う制度。'),
      T('ソーシャルエンジニアリング', 'Social engineering', '技術ではなく人をだまして情報を得る攻撃（なりすまし電話、偽サポート、パスワードの聞き出し）。'),
      T('フィッシング', 'Phishing', '本物そっくりの偽サイト・偽メールでパスワードや決済情報を盗む攻撃。パスキーはフィッシングに強い。'),
      T('個人情報（PII）', 'Personally Identifiable Information', '氏名・住所・メール・電話番号・顔写真など、個人を特定できる情報。漏えいすると法律上の報告義務が生じることがある。'),
    ]),
  ]});

/* ================= 2. 秘密情報・APIキー ================= */
const PLACES = [
  { l:'HTMLに直書き', see:[1, 1, -1], v:'bad', code:'<script>\n  const KEY = "sk-live-xxxx";\n</script>', note:'「ページのソースを表示」だけで誰でも見られます。GitHubに置けばそこからも見えます。' },
  { l:'フロントのJS', see:[1, 1, -1], v:'bad', code:'// src/api.js（ブラウザで動く）\nfetch(url, { headers: { Authorization: "Bearer sk-live-xxxx" } })', note:'ビルドしても文字列はそのまま残ります。開発者ツールの「ネットワーク」タブで通信を見れば丸見えです。' },
  { l:'NEXT_PUBLIC_ 付き', see:[1, 0, -1], v:'bad', code:'# .env.local（GitHubには上がらない）\nNEXT_PUBLIC_OPENAI_KEY=sk-live-xxxx', note:'.env 自体は公開されなくても、<b>NEXT_PUBLIC_ / VITE_ などが付いた変数はビルド時にブラウザ用のJSへ埋め込まれます</b>。公開してよい値専用です。' },
  { l:'サーバーの環境変数', see:[0, 0, 2], v:'ok', code:'# .env.local（.gitignore済み）\nOPENAI_API_KEY=sk-live-xxxx\n\n// app/api/chat/route.ts（サーバーで実行）\nconst key = process.env.OPENAI_API_KEY;', note:'サーバーの中だけで読み、ブラウザにはAIの<b>結果だけ</b>を返します。本番はVercelなどの管理画面に登録します。' },
  { l:'GitHubにコミット', see:[0, 1, -1], v:'bad', code:'git add .env\ngit commit -m "設定ファイル"\ngit push', note:'公開リポジトリなら、<b>数分で自動収集ボットに見つかる</b>こともあります。ファイルを消しても履歴に残るので、すぐキーを無効化します。' },
];
// 見本のキーはすべて架空の値。ソースに「キーの形」のまま書くと、GitHub のシークレットスキャンが本物と見なして push を止めることがあるので、分けて書いて実行時につなぐ
const FAKE = { openai:['sk-proj-', 'EXAMPLE', 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4'], stripe:['sk_', 'live_', 'EXAMPLE51HxKjLmNoPqRsTuVw'], maps:['AI', 'zaSy', 'EXAMPLE-abcdefghijklmnopqrstuvwxy'], aws:['AK', 'IA', 'EXAMPLE123456789'], gh:['gh', 'p_', 'EXAMPLEabcdefghijklmnopqrstuvwxyz012'], anon:['ey', 'JhbGciOiJIUzI1NiJ9.', 'ey', 'Jyb2xlIjoiYW5vbiJ9.', 'c2lnbmF0dXJl'], admin:['ey', 'JhbGciOiJIUzI1NiJ9.', 'ey', 'Jyb2xlIjoic2VydmljZV9yb2xlIn0.', 'c2lnbmF0dXJl'] };
const fk = (k) => FAKE[k].join('');
const SAMPLE = `// config.js（例：すべて架空の値）\nconst openai = "${fk('openai')}";\nconst stripe = "${fk('stripe')}";\nconst maps   = "${fk('maps')}";\nAWS_ACCESS_KEY_ID=${fk('aws')}\nconst gh = "${fk('gh')}";\nconst anon = "${fk('anon')}";\nconst admin = "${fk('admin')}";\npassword = "hunter2"`;
const SCAN = [
  [/sk-(?:proj-|ant-)?[A-Za-z0-9_\-]{20,}/g, 'AIのAPIキー（OpenAI / Anthropic など）', 'bad'],
  [/(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{10,}/g, 'Stripe の秘密キー', 'bad'],
  [/AIza[0-9A-Za-z_\-]{35}/g, 'Google APIキー（制限の設定を確認）', 'warn'],
  [/AKIA[0-9A-Z]{16}/g, 'AWS アクセスキー', 'bad'],
  [/gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{20,}/g, 'GitHub トークン', 'bad'],
  [/xox[baprs]-[A-Za-z0-9-]{10,}/g, 'Slack トークン', 'bad'],
  [/eyJ[A-Za-z0-9_\-]+\.eyJ[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+/g, 'JWT', 'jwt'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/g, '秘密鍵', 'bad'],
  [/(?:password|passwd|secret|api_?key|token)\s*[:=]\s*["']?[^\s"']{4,}/gi, 'パスワード・秘密の直書き', 'warn'],
];

TABS.push({ id:'secrets', label:'秘密情報・APIキー', icon:'🔑',
  intro:'バイブコーディングで<b>最も多い事故がAPIキーの流出</b>です。AIのAPIキーが漏れると、他人に使われて数日で数十万円の請求が来ることもあります。「どこに置けば誰に見えるのか」を触って確かめましょう。',
  sections:[
    C('どこに置くと、誰に見える？', [
      { name:'そのキー、誰に見える？', en:'Where secrets leak', h:330, tags:['最重要','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="sc-viewers"><div><i>🌍</i>サイトの訪問者</div><div><i>🐙</i>GitHubを見た人</div><div><i>🖥</i>あなたのサーバー</div></div><div class="kt-code cd"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const vs = $$(el, '.sc-viewers div');
          $(el, '.sw').replaceWith(seg(PLACES.map(p => p.l), i => { const p = PLACES[i];
            vs.forEach((v, j) => { v.className = p.see[j] === 1 ? 'see' : p.see[j] === 2 ? 'own' : p.see[j] === -1 ? '' : 'safe'; });
            $(el, '.cd').textContent = p.code; verdict($(el, '.res'), p.v, (p.v === 'ok' ? '✅ ' : '❌ ') + p.note); }).el); },
        desc:'APIキーを置く場所ごとに、<b>誰がキーを見られるか</b>が変わります。秘密のキーが安全なのは「サーバーの環境変数」だけ。フロントエンド（ブラウザで動くコード）に置いたものは、どんな書き方をしても見えると考えてください。',
        prompt:'このプロジェクトで、秘密のAPIキーがブラウザ側のコードや NEXT_PUBLIC_ / VITE_ 付きの環境変数に含まれていないか全部調べて。見つかったら、サーバー側（API Route / Server Action / Edge Function）から呼ぶ形に書き換えて。' },
      { name:'.env と .gitignore', en:'Keep .env out of Git', h:330, tags:['Git','体験'],
        demo:'<div class="kt"><div class="kt-row"><span class="kt-lbl">.gitignore</span><span class="sw"></span><button class="kt-btn pri push">git push する</button></div><div class="sc-tree tree"></div><div class="kt-code gi"></div><div class="kt-verdict res">「git push する」を押すと、GitHubに上がるファイルが分かります。</div></div>',
        init:(el) => { let on = 0; const F = [['📄', '.env', 1], ['📄', '.env.local', 1], ['📄', '.env.example', 0], ['📄', '.gitignore', 0], ['📁', 'node_modules/', 2], ['📁', 'src/', 0], ['📄', 'package.json', 0]];
          const draw = (pushed) => { $(el, '.tree').innerHTML = F.map(([ic, n, t]) => { const ig = on && t > 0; const st = !pushed ? (ig ? '除外' : '') : ig ? '上がらない' : t === 1 ? '⚠ 公開された' : 'アップロード'; const cls = pushed ? (ig ? 'ign' : t === 1 ? 'leak' : 'up') : ig ? 'ign' : ''; return `<div class="${cls}">${ic} ${n}<span class="st">${st}</span></div>`; }).join('');
            $(el, '.gi').textContent = on ? '# .gitignore\n.env\n.env.*\n!.env.example\nnode_modules/' : '# .gitignore が無い（または .env の記述が無い）'; };
          $(el, '.sw').replaceWith(seg(['なし', 'あり'], i => { on = i; draw(false); verdict($(el, '.res'), '', '「git push する」を押すと、GitHubに上がるファイルが分かります。'); }).el);
          $(el, '.push').onclick = () => { draw(true); verdict($(el, '.res'), on ? 'ok' : 'bad', on ? '✅ .env は手元に残り、見本の .env.example だけが共有されました。' : '❌ <b>.env（本物のキー）がGitHubに上がりました。</b> 消しても履歴に残るため、キーを無効化して作り直す必要があります。'); };
          draw(false); },
        desc:'<code>.env</code> はキーを書くファイル、<code>.gitignore</code> は「Gitに入れないファイル」の一覧です。<b>最初のコミットより前に</b> .gitignore に .env を書くのが鉄則。中身を空にした <code>.env.example</code> を代わりに共有すると、必要な変数名が仲間に伝わります。',
        prompt:'.gitignore に .env と .env.* を追加し（.env.example は除く）、すでにGitで追跡されている .env があれば追跡をやめて。必要な環境変数の名前だけを書いた .env.example も作って。',
        code:'# .gitignore\n.env\n.env.*\n!.env.example\n\n# すでにコミットしてしまった .env の追跡をやめる（ファイルは手元に残る）\ngit rm --cached .env' },
      { name:'キーっぽい文字列を探す', en:'Secret scanner', h:420, tags:['チェック','体験'],
        demo:'<div class="kt"><div class="kt-lbl">コードを貼り付け（このページの外には送信されません）</div><textarea class="kt-in mono src" rows="5" aria-label="調べるコード"></textarea><div class="sc-hits hits"></div><div class="sc-scan kt-grow out"></div></div>',
        init:(el) => { const src = $(el, '.src'); src.value = SAMPLE;
          const run = () => { const t = src.value, marks = []; const found = [];
            SCAN.forEach(([re, label, lv]) => { re.lastIndex = 0; let m; while ((m = re.exec(t))){ if (marks.some(x => m.index < x[1] && m.index + m[0].length > x[0])) continue; let lab = label, l2 = lv;
              if (lv === 'jwt'){ try{ const role = JSON.parse(unb64u(m[0].split('.')[1])).role; lab = role === 'service_role' ? 'Supabase service_role（絶対に公開NG）' : role === 'anon' ? 'Supabase anon（公開OK・RLS必須）' : 'JWT（中身を確認）'; l2 = role === 'anon' ? 'ok' : 'bad'; }catch(e){ l2 = 'warn'; } }
              marks.push([m.index, m.index + m[0].length]); found.push([lab, l2]); } });
            marks.sort((a, b) => a[0] - b[0]); let out = '', p = 0; marks.forEach(([a, b]) => { out += esc(t.slice(p, a)) + '<mark>' + esc(t.slice(a, b)) + '</mark>'; p = b; }); out += esc(t.slice(p));
            $(el, '.out').innerHTML = out; $(el, '.hits').innerHTML = found.length ? found.map(([l, v]) => `<span class="kt-badge ${v}">${l}</span>`).join('') : '<span class="kt-badge ok">キーらしき文字列は見つかりません</span>'; };
          src.addEventListener('input', run); run(); },
        desc:'APIキーには<b>サービスごとに決まった形</b>（<code>sk-</code>・<code>AKIA</code>・<code>ghp_</code> など）があり、パターンで見つけられます。GitHubの<b>シークレットスキャン（プッシュ保護）</b>や <code>gitleaks</code> も同じ仕組みで、コミット前に止めてくれます。SupabaseのキーはJWTなので、中身の role で公開してよいか判断できます。',
        prompt:'コミット前に秘密情報を検出するために、gitleaks を pre-commit フックで動くように設定して。GitHubリポジトリのシークレットスキャンとプッシュ保護を有効にする手順も教えて。' },
      { name:'キーはサーバー経由で使う', en:'Backend proxy (BFF)', h:360, tags:['定番の形'],
        init:(el) => seq(el, { actors:[{ icon:'🧑', label:'ブラウザ' }, { icon:'🖥', label:'自分のサーバー' }, { icon:'🤖', label:'AIのAPI' }], steps:[
          { f:0, t:1, label:'POST /api/chat「要約して」', note:'ブラウザは<b>自分のサーバー</b>にだけお願いします。リクエストにAPIキーは入っていません。' },
          { f:1, t:1, label:'ログイン・回数制限を確認', note:'サーバーで<b>ログインしているか・使いすぎていないか</b>を確認します（他人に使われ放題を防ぐ）。' },
          { f:1, t:1, label:'process.env からキーを読む', note:'キーはサーバーの環境変数にだけあります。ブラウザには一切届きません。' },
          { f:1, t:2, label:'キー付きでAPIを呼ぶ', note:'サーバーからAIのAPIを呼びます。この通信は利用者からは見えません。' },
          { f:2, t:1, label:'結果', dash:true, note:'AIの結果がサーバーに返ってきます。' },
          { f:1, t:0, label:'結果だけを返す', dash:true, good:true, note:'ブラウザには<b>結果だけ</b>を返します。キーもAIへの細かい指示（システムプロンプト）も見えません。' },
        ]}),
        desc:'秘密のキーが必要なAPIは、<b>ブラウザ → 自分のサーバー → 外部API</b> の順に呼びます。自分のサーバーの部分は、Next.jsのAPI Route／Server Action、SupabaseのEdge Function、Cloudflare Workersなどで簡単に作れます。ここでログイン確認と回数制限も入れると「他人に使われ放題」を防げます。',
        prompt:'ブラウザから直接 OpenAI のAPIを呼んでいる部分を、Next.js の Route Handler（app/api/chat/route.ts）経由に変えて。キーは process.env.OPENAI_API_KEY から読み、ログインしているユーザーだけが1日50回まで使えるように制限して。',
        code:'// app/api/chat/route.ts（サーバーで実行される）\nexport async function POST(req: Request) {\n  const user = await getUser(req);            // ログイン確認\n  if (!user) return new Response("Unauthorized", { status: 401 });\n  const { text } = await req.json();\n  const r = await fetch("https://api.openai.com/v1/responses", {\n    method: "POST",\n    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },\n    body: JSON.stringify({ model: "gpt-4.1-mini", input: `要約して：${text}` }),\n  });\n  return Response.json(await r.json());\n}' },
      { name:'キーが漏れたときの手順', en:'Leaked key response', h:330, tags:['緊急時'],
        init:(el) => stepper(el, ['<b>すぐにキーを無効化（削除・ローテーション）</b>する。ファイルを消すより先に。これが最優先。', '新しいキーを発行し、<b>環境変数を更新して再デプロイ</b>する（Vercelなどの管理画面も）。', 'そのサービスの<b>利用履歴・請求額</b>を確認する。不審な利用があればサポートに連絡。', 'コードから削除し、必要なら <b>Gitの履歴からも消す</b>（git filter-repo）。ただし無効化が先。', '<b>原因を塞ぐ</b>：.gitignore、シークレットスキャン、サーバー経由の呼び出しに変更。', '利用者の個人情報に影響する場合は、関係者・必要に応じて個人情報保護委員会へ報告する。'], { title:'上から順に。「消せば大丈夫」ではありません' }),
        desc:'キーが漏れたら、<b>ファイルを消すより先にキーを無効化</b>します。Gitの履歴やキャッシュ、収集ボットのコピーから使われ続けるからです。AIのAPIは<b>利用上限（予算アラート）</b>を設定しておくと、被害の上限を決められます。',
        prompt:'OpenAIのAPIキーをGitHubに公開してしまいました。今すぐやるべきことを優先順に教えて。そのあと、このリポジトリの履歴から .env を完全に削除する手順（git filter-repo）と、再発防止の設定もお願い。' },
    ], null, true),
    { title:'公開してよいキー・ダメなキー', note:'同じサービスでも「公開用」と「秘密用」のキーがあります。公開用のキーは、<b>ルールや制限とセットで</b>初めて安全になります。',
      table:{ head:['サービス', '公開してよい（ブラウザに置ける）', '絶対に秘密', 'ポイント'], rows:[
        ['Supabase', 'anon / publishable キー', 'service_role / secret キー', '公開キーは<b>RLSを有効にしている前提</b>。service_role はRLSを無視して全データを操作できる'],
        ['Firebase', 'firebaseConfig の apiKey など', 'サービスアカウントの秘密鍵（JSON）', '公開設定は識別用。守りは<b>セキュリティルール</b>で行う'],
        ['Stripe', 'pk_live_… / pk_test_…（公開可能キー）', 'sk_live_…（シークレットキー）・Webhook署名シークレット', '金額の決定・決済の作成は必ずサーバーで'],
        ['Google Maps など', 'ブラウザ用APIキー', 'サーバー用のキー', 'ブラウザ用は<b>HTTPリファラー制限・API制限</b>を必ず設定'],
        ['OpenAI / Anthropic / Gemini', '—（公開用はない）', 'APIキーすべて', '必ずサーバー経由。<b>利用上限と予算アラート</b>を設定'],
        ['Clerk / Auth0 など', 'Publishable Key・Client ID', 'Secret Key・Client Secret', '「Publishable」「Public」と書かれたものだけ公開可'],
        ['Cloudflare Turnstile / reCAPTCHA', 'サイトキー', 'シークレットキー', '確認（検証）はサーバー側で行う'],
        ['データベース', '—', '接続文字列（DATABASE_URL）・DBパスワード', 'ブラウザから直接DBにつながない'],
        ['GitHub・AWS など', '—', 'アクセストークン・アクセスキー', '権限を絞り、期限付きにする'],
      ]}},
    { title:'ブラウザに公開される環境変数の目印', note:'フレームワークごとに「この名前で始まる変数はブラウザに埋め込む」というルールがあります。秘密の値には<b>絶対に付けない</b>でください。',
      table:{ head:['フレームワーク', '公開される接頭辞', 'サーバーだけで読む例'], rows:[
        ['Next.js', '<code>NEXT_PUBLIC_</code>', '<code>process.env.OPENAI_API_KEY</code>（Server Component・Route Handler内）'],
        ['Vite（React・Vue など）', '<code>VITE_</code>', 'Viteはフロント専用。秘密はバックエンド側（別サーバー・Edge Function）へ'],
        ['Astro', '<code>PUBLIC_</code>', '<code>import.meta.env.SECRET_KEY</code>（サーバー側のみ）'],
        ['SvelteKit', '<code>PUBLIC_</code>（$env/static/public）', '<code>$env/static/private</code>'],
        ['Nuxt', '<code>NUXT_PUBLIC_</code>（runtimeConfig.public）', '<code>runtimeConfig</code>（public以外）'],
        ['Expo（React Native）', '<code>EXPO_PUBLIC_</code>', 'アプリに秘密は置けない。サーバー経由にする'],
        ['Create React App（旧）', '<code>REACT_APP_</code>', '全部ブラウザに入るので秘密は置けない'],
      ]}},
    S('秘密情報の扱い方', [
      T('環境変数', 'Environment variables', 'プログラムの外から渡す設定値。キーやパスワードをコードに書かずに済む。開発中は <code>.env</code> / <code>.env.local</code>、本番はホスティング（Vercel・Netlify・Render など）の管理画面で設定する。', null, ['基本']),
      T('.env.example', 'Template file', '変数名だけを書いた見本ファイル（値は空かダミー）。Gitに入れて、必要な設定をチームや未来の自分に伝える。'),
      T('本番の環境変数は管理画面へ', 'Hosting env settings', 'Vercel：Settings → Environment Variables。本番（Production）・プレビュー・開発で別々の値を設定できる。<b>変更後は再デプロイが必要</b>。'),
      T('キーの権限を絞る', 'Scoped / restricted keys', 'できるサービスでは、読み取り専用・特定の機能だけ・特定のドメインからだけ、など<b>制限付きのキー</b>を作る（Stripeの制限付きキー、Googleのリファラー制限、GitHubのFine-grained token）。'),
      T('利用上限・予算アラート', 'Usage limits / Budget alerts', 'AI APIやクラウドは、月の上限額とアラートを設定しておく。漏れたり無限ループしたりしても被害が上限で止まる。', 'OpenAI・Anthropic・Google Cloud・Vercel で、月の利用上限と予算アラートを設定する手順を教えて。', ['おすすめ']),
      T('キーのローテーション', 'Key rotation', 'キーを定期的に、または漏れた疑いがあるときに作り直して入れ替えること。入れ替えやすい作り（環境変数1か所）にしておく。'),
      T('シークレットスキャン', 'Secret scanning', 'GitHubの機能や gitleaks・TruffleHog で、コミットやリポジトリからキーを自動検出する。GitHubの<b>プッシュ保護</b>を有効にすると、キーを含むpushを止めてくれる。'),
      T('Gitの履歴から消す', 'git filter-repo / BFG', '一度コミットした秘密は、最新から消しても履歴に残る。<code>git filter-repo</code> で履歴ごと消せるが、<b>まずキーの無効化が先</b>。フォークやクローンには残る。', null, ['注意']),
      T('ログ・エラー・画面に出さない', 'Don\'t log secrets', '<code>console.log(process.env)</code>、エラー画面、スクリーンショット、画面共有・配信にキーが映る事故が多い。ログは秘密をマスクする。'),
      T('AIのチャットに本物のキーを貼らない', 'Keep secrets out of prompts', 'エラーを相談するときは、キーを <code>sk-xxxx</code> のように伏せてから貼る。AIツールの設定でも、.env を読み込ませない（除外する）設定を確認する。', null, ['バイブコーディング']),
      T('開発用と本番用でキーを分ける', 'Separate dev / prod keys', 'テスト用キー（Stripeの sk_test_ など）と本番キーを分ける。開発中の事故が本番データ・本番の請求に及ばない。'),
      T('パスワードマネージャー', 'Password manager', '1Password・Bitwarden などで、サービスごとに長いランダムなパスワードを管理する。キーの保管・共有にも使える。'),
      T('シークレット管理サービス', 'Secrets manager', 'Doppler・Infisical・1Password Secrets Automation・AWS Secrets Manager など。チームや複数環境でキーを一元管理できる。'),
    ]),
  ]});

/* ================= 3. 認証（ログイン） ================= */
const AUTHZ_RULES = { // [未ログイン, 一般, 管理者]
  '記事一覧を見る':[200, 200, 200], '自分の記事を編集':[401, 200, 200], '他人の記事を削除':[401, 403, 200], '管理画面を開く':[401, 403, 200] };
const STATUS = { 200:['ok', '200 OK', '許可されました。'], 401:['warn', '401 Unauthorized', '<b>誰か分からない</b>（ログインしていない）。ログイン画面へ案内します。'], 403:['bad', '403 Forbidden', '<b>誰かは分かったが、権限がない</b>。ログインしても操作できません。'] };
async function totp(secret, counter){
  const key = await crypto.subtle.importKey('raw', secret, { name:'HMAC', hash:'SHA-1' }, false, ['sign']);
  const buf = new ArrayBuffer(8), dv = new DataView(buf); dv.setUint32(0, Math.floor(counter / 2 ** 32)); dv.setUint32(4, counter >>> 0);
  const h = new Uint8Array(await crypto.subtle.sign('HMAC', key, buf)), o = h[19] & 15;
  return String((((h[o] & 127) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3]) % 1e6).padStart(6, '0');
}
const b32 = (bytes) => { const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; let bits = '', out = ''; bytes.forEach(b => bits += b.toString(2).padStart(8, '0')); for (let i = 0; i + 5 <= bits.length; i += 5) out += A[parseInt(bits.slice(i, i + 5), 2)]; return out; };
function strength(pw){
  if (!pw) return { e:0, s:0, checks:[0, 0, 0, 0, 0] };
  let pool = 0; const lo = /[a-z]/.test(pw), up = /[A-Z]/.test(pw), di = /\d/.test(pw), sy = /[!-\/:-@\[-`{-~]/.test(pw), jp = /[^\x00-\x7f]/.test(pw);
  pool += lo ? 26 : 0; pool += up ? 26 : 0; pool += di ? 10 : 0; pool += sy ? 33 : 0; pool += jp ? 100 : 0; if (/\s/.test(pw)) pool += 1;
  let e = [...pw].length * Math.log2(Math.max(pool, 2));
  const common = COMMON.includes(pw.toLowerCase()); if (common) e = Math.min(e, 8);
  if (/(.)\1{2,}/.test(pw)) e *= .75; if (/(0123|1234|2345|3456|4567|5678|6789|abcd|bcde|qwer|asdf)/i.test(pw)) e *= .8; if (/(19|20)\d\d/.test(pw)) e -= 6;
  e = Math.max(0, e); const s = e < 28 ? 0 : e < 36 ? 1 : e < 60 ? 2 : e < 80 ? 3 : 4;
  return { e, s, common, checks:[[...pw].length >= 12, lo && up, di, sy || jp, !common] };
}
const human = (sec) => sec < 1 ? '一瞬' : sec < 60 ? Math.round(sec) + '秒' : sec < 3600 ? Math.round(sec / 60) + '分' : sec < 86400 ? Math.round(sec / 3600) + '時間' : sec < 31536000 ? Math.round(sec / 86400) + '日' : sec < 31536000 * 1e4 ? Math.round(sec / 31536000).toLocaleString() + '年' : '1万年以上';
const COOKIE_RISK = (c) => [
  c.http ? ['ok', 'HttpOnly', 'JavaScriptから読めない → XSSで盗まれにくい'] : ['bad', 'HttpOnlyなし', '<code>document.cookie</code> で読める → XSSでログイン状態を盗まれる'],
  c.sec ? ['ok', 'Secure', 'HTTPSのときだけ送られる'] : ['bad', 'Secureなし', '暗号化されていない通信（http://）でも送られる'],
  c.ss === 'Strict' ? ['ok', 'SameSite=Strict', '他サイトからのアクセスでは一切送らない（外部リンクから来るとログアウト状態に見える）'] : c.ss === 'Lax' ? ['ok', 'SameSite=Lax', '他サイトからのPOSTなどでは送らない。ログインCookieの標準的な設定'] : c.ss === 'None' ? (c.sec ? ['warn', 'SameSite=None', '他サイトからも送られる（埋め込み用途）。CSRF対策が別途必要'] : ['bad', 'None に Secure なし', 'SameSite=None は Secure 必須。ブラウザに拒否される']) : ['warn', 'SameSite 未指定', 'ブラウザ任せ（多くは Lax 扱い）。明示しておく'],
  c.age ? ['', 'Max-Age=2592000', '30日間ログイン状態を保持。端末の共用には注意'] : ['', '期限なし（セッション）', 'ブラウザを閉じると消える'],
];

TABS.push({ id:'auth', label:'認証（ログイン）', icon:'🪪',
  intro:'「あなたは誰？」を確かめるのが<b>認証</b>、「あなたは何をしていい？」を決めるのが<b>認可</b>です。ログインは自作せず実績あるサービスを使うのが基本ですが、仕組みを知っているとAIへの指示とレビューの精度が上がります。',
  sections:[
    C('仕組みを触って理解する', [
      { name:'認証と認可（401と403）', en:'Authentication vs Authorization', h:320, tags:['基本','体験'],
        demo:'<div class="kt"><div class="kt-row"><span class="kt-lbl">あなたは</span><span class="sw"></span></div><div class="sc-admin acts"></div><div class="kt-verdict res">操作を選ぶと、サーバーの返事（HTTPステータス）が表示されます。</div></div>',
        init:(el) => { let who = 0; const acts = $(el, '.acts'), res = $(el, '.res');
          $(el, '.sw').replaceWith(seg(['未ログイン', '一般ユーザー', '管理者'], i => { who = i; verdict(res, '', '操作を選ぶと、サーバーの返事（HTTPステータス）が表示されます。'); }).el);
          acts.innerHTML = Object.keys(AUTHZ_RULES).map(a => `<button type="button">${a}</button>`).join('');
          $$(acts, 'button').forEach(b => b.onclick = () => { const [c, code, msg] = STATUS[AUTHZ_RULES[b.textContent][who]]; verdict(res, c, `<span class="kt-badge ${c}">${code}</span> ${msg}`); }); },
        desc:'<b>認証（Authentication）</b>＝本人確認。失敗すると <code>401</code>。<b>認可（Authorization）</b>＝権限の確認。本人だと分かっても権限がなければ <code>403</code>。管理画面などは、存在自体を隠すために <code>404</code> を返すこともあります。',
        prompt:'すべてのAPIで「ログインしているか（認証）」と「その操作をしてよいか（認可）」を分けてチェックし、未ログインは401、権限なしは403を返すように統一して。' },
      { name:'パスワードのハッシュとソルト', en:'Password hashing & salt', h:330, tags:['仕組み','体験'],
        demo:'<div class="kt"><div class="kt-row"><span class="kt-lbl">ソルト</span><span class="sw"></span></div><div class="sc-kv"><b>佐藤のパスワード</b><input class="kt-in mono p1" value="sakura123" aria-label="佐藤のパスワード"><b>鈴木のパスワード</b><input class="kt-in mono p2" value="sakura123" aria-label="鈴木のパスワード"></div><div class="kt-lbl">DBに保存される値</div><div class="sc-out"><span class="t kt-lbl">佐藤</span><div class="v h1"></div><span class="t kt-lbl">鈴木</span><div class="v h2"></div></div><div class="kt-verdict res"></div></div>',
        init:(el) => { if (noCrypto(el)) return; let salt = 0; const s1 = hex(crypto.getRandomValues(new Uint8Array(8))), s2 = hex(crypto.getRandomValues(new Uint8Array(8)));
          const run = async () => { const a = $(el, '.p1').value, b = $(el, '.p2').value; const h1 = await sha256((salt ? s1 : '') + a), h2 = await sha256((salt ? s2 : '') + b);
            $(el, '.h1').innerHTML = (salt ? `<small>ソルト ${s1}</small>` : '') + h1; $(el, '.h2').innerHTML = (salt ? `<small>ソルト ${s2}</small>` : '') + h2;
            const same = h1 === h2; $(el, '.h1').classList.toggle('same', same); $(el, '.h2').classList.toggle('same', same);
            const common = COMMON.includes(a.toLowerCase()) || COMMON.includes(b.toLowerCase());
            if (same) verdict($(el, '.res'), 'bad', '❌ <b>同じハッシュになりました。</b> どちらかのパスワードが分かれば、もう片方も同じだとバレます。');
            else if (!salt && common) verdict($(el, '.res'), 'bad', '❌ よく使われるパスワードは、ハッシュの<b>逆引き表（レインボーテーブル）</b>ですぐに元が分かります。');
            else if (salt) verdict($(el, '.res'), 'ok', '✅ ソルトのおかげで、同じパスワードでも別の値になりました。実際には <b>bcrypt / Argon2</b> などの「わざと遅い」ハッシュを使います。');
            else verdict($(el, '.res'), 'warn', '⚠ ソルトなしだと、同じパスワードの人が同じ値になります。'); };
          $(el, '.sw').replaceWith(seg(['なし', 'あり'], i => { salt = i; run(); }).el); $(el, '.p1').addEventListener('input', run); $(el, '.p2').addEventListener('input', run); },
        desc:'パスワードはDBに<b>そのまま保存せず、ハッシュ（元に戻せない値）にして保存</b>します。さらに人ごとに違う<b>ソルト</b>を混ぜると、同じパスワードでも別の値になり、逆引き表も使えません。このデモはSHA-256で説明していますが、実際には総当たりに強い <b>bcrypt・Argon2・scrypt</b> を使います（認証サービスを使えば自動）。',
        prompt:'パスワードの保存に bcrypt（コスト12）または Argon2id を使うように実装して。平文・MD5・SHA-256 で保存している箇所があれば置き換え、既存ユーザーは次回ログイン時に新しい方式で保存し直して。',
        code:'import bcrypt from "bcryptjs";\n// 登録時\nconst hash = await bcrypt.hash(password, 12);   // ソルトは自動で含まれる\n// ログイン時\nconst ok = await bcrypt.compare(password, user.password_hash);' },
      { name:'パスワードの強さ', en:'Password strength', h:300, tags:['体験'],
        demo:'<div class="kt"><input class="kt-in mono pw" value="Sakura2024!" aria-label="パスワード"><div class="sc-meter bar"><i></i><i></i><i></i><i></i><i></i></div><div class="kt-row"><b class="lv"></b><span class="kt-lbl ent"></span></div><div class="sc-checks chk"><span>12文字以上</span><span>大文字と小文字</span><span>数字</span><span>記号・日本語など</span><span>よくあるパスワードではない</span></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const COL = ['#d64545', '#e8590c', '#c27606', '#1f9d63', '#0f766e'], LV = ['とても弱い', '弱い', 'ふつう', '強い', 'とても強い'];
          const run = () => { const pw = $(el, '.pw').value, r = strength(pw);
            $$(el, '.bar i').forEach((b, i) => b.style.background = pw && i <= r.s ? COL[r.s] : '');
            $(el, '.lv').textContent = pw ? LV[r.s] : '—'; $(el, '.lv').style.color = COL[r.s]; $(el, '.ent').textContent = pw ? `約 ${Math.round(r.e)} ビット` : '';
            $$(el, '.chk span').forEach((s, i) => s.classList.toggle('on', !!r.checks[i]));
            const g = 2 ** r.e / 2; verdict($(el, '.res'), r.s >= 3 ? 'ok' : r.s >= 2 ? 'warn' : 'bad', r.common ? '❌ <b>漏えいリストに載っている定番のパスワード</b>です。一瞬で破られます。' : `総当たりにかかる時間の目安：<b>流出したハッシュを高速PCで解析 → ${human(g / 1e10)}</b>／回数制限ありのログイン画面 → ${human(g / 10)}`); };
          $(el, '.pw').addEventListener('input', run); run(); },
        desc:'強さを決めるのは<b>長さ</b>です。記号を1つ足すより、文字数を増やす方が効きます。今のガイドライン（NIST）では「定期的な変更の強制」「複雑さのルールの強制」より、<b>長さ（8文字以上、できれば15文字以上）と、漏えい済みパスワードの拒否</b>が推奨されています。',
        prompt:'新規登録のパスワードを、最低12文字・最大128文字、空白や日本語も可、Have I Been Pwned の漏えいパスワードと一致したら拒否する、という条件で検証して。強さメーターも表示して。' },
      { name:'セッション方式とトークン方式', en:'Session vs JWT', h:400, tags:['仕組み'],
        demo:'<div class="kt"><div class="kt-row c sw"></div><div class="kt-grow host" style="position:relative"></div></div>',
        init:(el) => { let stop = null; const host = $(el, '.host');
          const A = [{ icon:'🧑', label:'ブラウザ' }, { icon:'🖥', label:'サーバー' }, { icon:'🗄', label:'セッション保存' }];
          const SES = [{ f:0, t:1, label:'POST /login（ID・パスワード）', note:'ログインフォームを送信します。' }, { f:1, t:2, label:'セッション作成 sid=8f3a…', note:'サーバーは<b>ランダムなセッションID</b>を作り、「誰のものか」をDBやRedisに保存します。' }, { f:1, t:0, label:'Set-Cookie: sid=8f3a…', dash:true, note:'セッションIDだけをCookieで返します（HttpOnly・Secure・SameSite）。' }, { f:0, t:1, label:'GET /mypage（Cookie自動送信）', note:'次からはブラウザが<b>Cookieを自動で付けて</b>送ります。' }, { f:1, t:2, label:'sid を照会 → 佐藤', note:'サーバーは毎回、保存先に問い合わせて誰かを調べます。' }, { f:1, t:0, label:'佐藤さんのページ', dash:true, note:'本人のページを返します。' }, { f:1, t:2, label:'ログアウト：セッション削除', good:true, note:'<b>サーバー側で消せば即座に無効</b>。「全端末からログアウト」も簡単です。' }];
          const JWT = [{ f:0, t:1, label:'POST /login（ID・パスワード）', note:'ログインフォームを送信します。' }, { f:1, t:1, label:'秘密鍵で署名したJWTを作る', note:'「user=佐藤, 期限=1時間」などの<b>中身＋署名</b>のトークンを作ります。保存は不要。' }, { f:1, t:0, label:'トークンを返す', dash:true, note:'トークンを返します（HttpOnly Cookie に入れるのが安全）。' }, { f:0, t:1, label:'Authorization: Bearer eyJ…', note:'リクエストのたびにトークンを付けて送ります。' }, { f:1, t:1, label:'署名と期限を検証（DB不要）', note:'サーバーは<b>署名を計算し直すだけ</b>で本物か分かります。複数サーバーでも扱いやすい。' }, { f:1, t:0, label:'結果を返す', dash:true, note:'本人のデータを返します。' }, { f:0, t:0, label:'ログアウト：手元で捨てるだけ', bad:true, note:'<b>発行済みのトークンは期限まで有効</b>なまま。だから期限を短く（15分〜1時間）して、リフレッシュトークンで更新します。' }];
          $(el, '.sw').append(seg(['セッション（Cookie）', 'トークン（JWT）'], i => { stop && stop(); stop = seq(host, { actors:i ? A.slice(0, 2) : A, steps:i ? JWT : SES }); }).el);
          return () => stop && stop(); },
        desc:'ログイン状態の保ち方は2種類。<b>セッション方式</b>はサーバーに「誰がログイン中か」を保存し、Cookieには番号だけを渡す。すぐ無効化できる。<b>トークン方式（JWT）</b>は署名付きの「通行証」を渡し、サーバーは保存しない。拡張しやすいが、取り消しにくい。Supabase・Firebaseはトークン方式＋自動更新を使っています。',
        prompt:'このアプリのログイン状態の管理方法（セッションかJWTか）と、トークンの保存場所・有効期限・更新方法を説明して。localStorage にトークンを保存しているなら、HttpOnly Cookie に移すべきか判断して。' },
      { name:'JWTの中身と改ざん検知', en:'JWT inspector', h:420, tags:['体験','JWT'],
        demo:'<div class="kt"><div class="kt-lbl">トークン（ヘッダー.ペイロード.署名）</div><div class="sc-jwt tok"></div><div class="sc-jwtcols kt-grow"><div style="display:flex;flex-direction:column;gap:4px"><div class="kt-lbl">ヘッダー</div><div class="kt-code hd"></div></div><div style="display:flex;flex-direction:column;gap:4px;min-height:0"><div class="kt-lbl">ペイロード（書き換えてみて）</div><textarea class="kt-in pl" aria-label="ペイロード"></textarea></div></div><div class="kt-row"><button class="kt-btn pri ver">サーバーで検証</button><button class="kt-btn resign">秘密鍵で署名し直す</button><button class="kt-btn sm reset">リセット</button></div><div class="kt-verdict res">ペイロードの "role": "user" を "admin" に書き換えて、検証してみてください。</div></div>',
        init:(el) => { if (noCrypto(el)) return; const SECRET = 'server-only-secret-key', H = '{"alg":"HS256","typ":"JWT"}'; let sig = '', key;
          const P0 = () => JSON.stringify({ sub:'user_123', name:'佐藤', role:'user', exp:Math.floor(Date.now() / 1000) + 3600 }, null, 1);
          const sign = async (data) => b64u(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
          const parts = () => { let p; try{ p = JSON.stringify(JSON.parse($(el, '.pl').value)); }catch(e){ p = $(el, '.pl').value; } return [b64uStr(H), b64uStr(p)]; };
          const draw = () => { const [h, p] = parts(); $(el, '.tok').innerHTML = `<span class="h">${h}</span><span class="d">.</span><span class="p">${p}</span><span class="d">.</span><span class="s">${sig}</span>`; };
          const reset = async () => { $(el, '.pl').value = P0(); const [h, p] = parts(); sig = await sign(h + '.' + p); draw(); verdict($(el, '.res'), '', 'ペイロードの "role": "user" を "admin" に書き換えて、検証してみてください。'); };
          (async () => { key = await crypto.subtle.importKey('raw', enc.encode(SECRET), { name:'HMAC', hash:'SHA-256' }, false, ['sign']); $(el, '.hd').textContent = JSON.stringify(JSON.parse(H), null, 1); reset(); })();
          $(el, '.pl').addEventListener('input', draw);
          $(el, '.ver').onclick = async () => { const [h, p] = parts(); const ok = (await sign(h + '.' + p)) === sig; let body = {}; try{ body = JSON.parse($(el, '.pl').value); }catch(e){}
            verdict($(el, '.res'), ok ? 'ok' : 'bad', ok ? `✅ 署名が一致。中身は本物です（role: <b>${esc(body.role)}</b>）。` : '❌ <b>署名が一致しません。改ざんされたトークン</b>として拒否します。中身を書き換えても、秘密鍵がなければ正しい署名は作れません。'); };
          $(el, '.resign').onclick = async () => { const [h, p] = parts(); sig = await sign(h + '.' + p); draw(); verdict($(el, '.res'), 'warn', '⚠ 秘密鍵で署名し直しました。<b>秘密鍵が漏れると、誰でも好きな中身（管理者など）のトークンを作れてしまいます</b>。'); };
          $(el, '.reset').onclick = reset; },
        desc:'JWTは「ヘッダー.ペイロード.署名」の3つをBase64URLでつないだもの。<b>中身は暗号化されておらず誰でも読める</b>ので、パスワードや個人情報は入れません。改ざんは<b>署名</b>で見抜きます。サーバーでは <code>decode</code>（読むだけ）ではなく必ず <code>verify</code>（署名の検証）を使います。',
        prompt:'JWTを扱っている箇所で、署名を検証せずにデコードだけしている所がないか確認して（jwt.decode ではなく jwt.verify を使う）。アルゴリズムは固定し、"alg": "none" を受け付けないこと、exp（有効期限）を必ず確認することも徹底して。',
        code:'import { jwtVerify } from "jose";\nconst secret = new TextEncoder().encode(process.env.JWT_SECRET);\n// ✅ 署名・期限・アルゴリズムを検証する\nconst { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });' },
      { name:'Cookieの属性', en:'Cookie attributes', h:340, tags:['体験','Cookie'],
        demo:'<div class="kt"><div class="sc-checksrow"><label><input type="checkbox" class="c1" checked>HttpOnly</label><label><input type="checkbox" class="c2" checked>Secure</label><label><input type="checkbox" class="c3">30日保持</label></div><div class="kt-row"><span class="kt-lbl">SameSite</span><span class="sw"></span></div><div class="kt-code out"></div><div class="sc-res kt-grow risks"></div></div>',
        init:(el) => { let ss = 'Lax'; const run = () => { const c = { http:$(el, '.c1').checked, sec:$(el, '.c2').checked, age:$(el, '.c3').checked, ss };
            $(el, '.out').textContent = 'Set-Cookie: session=8f3a…; Path=/' + (c.age ? '; Max-Age=2592000' : '') + (c.http ? '; HttpOnly' : '') + (c.sec ? '; Secure' : '') + (ss !== '未指定' ? '; SameSite=' + ss : '');
            $(el, '.risks').innerHTML = COOKIE_RISK(c).map(([v, k, t]) => `<div><b class="kt-mono">${k}</b><span>${t}</span><span class="kt-badge ${v}">${v === 'ok' ? '安全' : v === 'bad' ? '危険' : v === 'warn' ? '注意' : '情報'}</span></div>`).join(''); };
          $(el, '.sw').replaceWith(seg(['Strict', 'Lax', 'None', '未指定'], i => { ss = ['Strict', 'Lax', 'None', '未指定'][i]; run(); }, 1).el);
          $$(el, 'input[type=checkbox]').forEach(x => x.onchange = run); run(); },
        desc:'ログインに使うCookieは、<b>HttpOnly（JSから読めない）・Secure（HTTPSだけ）・SameSite=Lax 以上</b>が基本。この3つで、XSSによる盗難・通信の盗聴・CSRFの多くを防げます。認証サービスを使えば自動で設定されますが、自作のCookieを作るときは必ず確認します。',
        prompt:'ログイン用Cookieの設定を確認して、HttpOnly・Secure・SameSite=Lax（または Strict）・適切な有効期限が付いているか表にして。足りないものがあれば修正して。' },
      { name:'Googleでログイン（OAuth）の流れ', en:'OAuth 2.0 + PKCE', h:420, tags:['仕組み','ソーシャルログイン'],
        init:(el) => seq(el, { actors:[{ icon:'🧑', label:'あなた' }, { icon:'📱', label:'アプリ' }, { icon:'G', label:'Google' }], steps:[
          { f:0, t:1, label:'「Googleでログイン」を押す', note:'ボタンを押すと、アプリはGoogleのログイン画面へ移動させます。' },
          { f:1, t:2, label:'認可リクエスト（state・PKCE付き）', dash:true, note:'アプリのID・戻り先URL・欲しい情報（scope）に加え、<b>state</b>（なりすまし防止の合言葉）と <b>code_challenge</b>（PKCE）を付けて送ります。' },
          { f:2, t:0, label:'ログイン画面と同意画面', note:'<b>パスワードはGoogleにだけ入力</b>されます。アプリはあなたのパスワードを知りません。' },
          { f:0, t:2, label:'ログイン・「許可」', note:'「このアプリにメールアドレスを教えてもよい」と同意します。' },
          { f:2, t:1, label:'戻り先URLへ ?code=…&state=…', dash:true, note:'Googleは<b>一度きりの引換券（認可コード）</b>を付けてアプリに戻します。' },
          { f:1, t:1, label:'state が一致するか確認', note:'自分が送った state と同じかを確認します。違えば偽のログインなので中止。' },
          { f:1, t:2, label:'code＋code_verifier をトークンと交換', note:'アプリのサーバーが、引換券とPKCEの答え（code_verifier）をGoogleに送ります。途中で引換券を盗まれても、答えがなければ使えません。' },
          { f:2, t:1, label:'IDトークン・アクセストークン', dash:true, note:'あなたが誰かを示す <b>IDトークン</b>（OpenID Connect）と、GoogleのAPIを使うための <b>アクセストークン</b>が届きます。' },
          { f:1, t:0, label:'ログイン完了（自分のセッション発行）', dash:true, good:true, note:'アプリはIDトークンを検証して、<b>自分のアプリ用のセッション</b>を作ります。' },
        ]}),
        desc:'「Googleでログイン」「GitHubでログイン」は <b>OAuth 2.0 と OpenID Connect</b> という仕組みです。あなたのパスワードはアプリに渡らず、Googleが「この人は本人です」と保証します。今は <b>PKCE（ピクシー）</b>と <b>state</b> を使うのが標準。Supabase・Firebase・Clerk・Auth.js などを使えば、この流れはすべて自動です。',
        prompt:'Supabase Auth で「Googleでログイン」を実装して。Google Cloud Console での OAuth クライアント作成、リダイレクトURLの設定、ログイン後のプロフィール作成まで手順を教えて。' },
      { name:'2段階認証（ワンタイムコード）', en:'TOTP (Authenticator app)', h:320, tags:['体験','2FA'],
        demo:'<div class="kt center"><div class="kt-lbl">認証アプリ（Google Authenticator など）と同じ計算をしています</div><div class="sc-totp"><span class="code">------</span><span class="ring"><b class="sec">30</b></span></div><div class="kt-mono kt-note sk"></div><div class="kt-row c"><input class="kt-in mono in" placeholder="6桁を入力" maxlength="6" inputmode="numeric" style="width:130px" aria-label="ワンタイムコード"><button class="kt-btn pri chk">確認</button></div><div class="kt-verdict res">表示されている6桁を入力して「確認」。30秒ごとに変わります。</div></div>',
        init:(el) => { if (noCrypto(el)) return; const sec = crypto.getRandomValues(new Uint8Array(20)); let last = -1;
          $(el, '.sk').textContent = '共有の秘密鍵：' + b32(sec).replace(/(.{4})/g, '$1 ').trim();
          const tick = async () => { const now = Date.now() / 1000, c = Math.floor(now / 30), left = 30 - (now % 30);
            $(el, '.ring').style.setProperty('--p', (left / 30 * 100).toFixed(1)); $(el, '.sec').textContent = Math.ceil(left);
            if (c !== last){ last = c; $(el, '.code').textContent = (await totp(sec, c)).replace(/(\d{3})/, '$1 '); } };
          const iv = setInterval(tick, 250); tick();
          $(el, '.chk').onclick = async () => { const v = $(el, '.in').value.replace(/\s/g, ''), c = Math.floor(Date.now() / 30000); const ok = v === await totp(sec, c) || v === await totp(sec, c - 1);
            verdict($(el, '.res'), ok ? 'ok' : 'bad', ok ? '✅ 一致しました。<b>パスワード＋この6桁</b>の両方がないとログインできません。' : '❌ 一致しません（時間切れのコードも1つ前までしか受け付けません）。'); };
          return () => clearInterval(iv); },
        desc:'認証アプリの6桁は、<b>共有した秘密鍵＋現在時刻（30秒ごと）</b>から計算されています（TOTP）。サーバーも同じ計算をして一致を確かめます。パスワードが漏れても、スマホがなければログインできません。SMSのコードより安全です。',
        prompt:'このアプリに、認証アプリ（TOTP）による2段階認証を追加して。設定画面でQRコードを表示し、最初に1回コードを確認してから有効化、リカバリーコード10個を発行して1回だけ表示するようにして（Supabase Auth のMFA機能があればそれを使って）。' },
      { name:'安全なパスワードリセット', en:'Password reset flow', h:360, tags:['手順'],
        init:(el) => stepper(el, ['「パスワードを忘れた」でメールアドレスを入力してもらう。', '登録の有無に関係なく<b>同じ画面</b>「メールを送信しました」を表示する（登録済みかどうかを教えない＝アカウント列挙の防止）。', '<b>推測できないランダムなトークン</b>（crypto）を作り、ハッシュ化してDBに保存。有効期限は15〜60分。', 'トークン入りのリンク（https）をメールで送る。', 'リンクが開かれたら、トークン・期限・使用済みかを確認する。', '新しいパスワードを設定したら、<b>トークンを無効化</b>する（1回限り）。', '他の端末のセッションをすべてログアウトし、「パスワードが変更されました」と通知メールを送る。'], { title:'認証サービスを使えば自動ですが、自作するならこの順番で' }),
        desc:'パスワードリセットは乗っ取りの入口になりやすい機能です。<b>登録の有無を教えない・推測できない使い捨てトークン・短い期限・変更後の全ログアウトと通知</b>が基本です。',
        prompt:'パスワードリセット機能を、登録有無を明かさない・crypto で作ったトークンをハッシュ化して保存・有効期限30分・1回限り・変更後に全セッションを無効化して通知メール、という条件で実装して。' },
    ], null, true),
    { title:'ログイン方式の比べ方', table:{ head:['方式', '手軽さ', '安全性', 'ポイント'], rows:[
      ['メール＋パスワード', '◎', '△', '使い回し・漏えいに弱い。2段階認証や漏えいチェックと組み合わせる'],
      ['マジックリンク', '◎', '○', 'メールのリンクを押すだけ。メールが届かない・迷惑メール行きに注意'],
      ['メールのワンタイムコード', '○', '○', '6桁のコードを入力。スマホでアプリとメールを行き来する手間'],
      ['SMSのワンタイムコード', '○', '△', 'SIMの乗っ取り・送信コスト。主要な方法にはしない'],
      ['ソーシャルログイン（Google等）', '◎', '○', 'パスワード不要。相手サービスのアカウントに依存する'],
      ['パスキー（指紋・顔）', '◎', '◎', 'フィッシングに強い最新の方式。対応端末・バックアップの説明が必要'],
      ['認証アプリ（TOTP）', '△', '◎', '2段階目として使う。リカバリーコードとセットで'],
      ['SSO（SAML・OIDC）', '—', '◎', '企業向け。会社のアカウントでまとめてログイン'],
    ]}},
    { title:'認証サービス', note:'ログインは自作せず、これらのサービスやライブラリを使うのが安全で早道です（料金・無料枠は変わるので公式で確認）。', table:{ head:['名前', '特徴', '向いている場面'], rows:[
      ['Supabase Auth', 'DB（Postgres）とRLSに直結。メール・ソーシャル・マジックリンク・MFA', 'Supabaseでデータも管理するアプリ'],
      ['Firebase Authentication', 'Googleのサービス。Firestore のルールと連携', 'Firebaseで作るアプリ・スマホアプリ'],
      ['Clerk', 'ログイン画面・ユーザー管理UIが最初から完成している', 'Next.jsなどで最速で作りたい'],
      ['Auth.js（NextAuth.js）', 'Next.js向けのオープンソース。プロバイダが豊富', '自分のDBで管理したい'],
      ['Better Auth', 'TypeScript製のオープンソース認証。2FA・組織機能など', '自前で持ちつつ機能は欲しい'],
      ['Auth0', '老舗の認証基盤。企業向け機能が豊富', '企業・大規模'],
      ['Amazon Cognito', 'AWSの認証サービス', 'AWSで構築する場合'],
      ['WorkOS など', '企業向けSSO（SAML）を簡単に追加', 'B2B SaaS'],
    ]}},
    S('認証の用語と注意点', [
      T('パスワードの保存方式', 'bcrypt / Argon2 / scrypt', 'パスワード専用の「わざと遅い」ハッシュ。総当たりを現実的に不可能にする。<b>平文・暗号化（戻せる）・MD5・SHA-1・ソルトなしSHA-256はNG</b>。', null, ['最重要']),
      T('総当たり・リスト型攻撃', 'Brute force / Credential stuffing', '総当たり＝パスワードを片っ端から試す。リスト型＝他サイトで漏れたID・パスワードの組をそのまま試す。<b>回数制限・2段階認証・漏えいパスワードの拒否</b>で防ぐ。'),
      T('アカウント列挙', 'Account enumeration', '「このメールアドレスは登録されていません」のような表示から、登録者を調べられてしまうこと。ログイン失敗やリセットでは<b>同じメッセージ</b>を返す。'),
      T('セッション固定攻撃', 'Session fixation', '攻撃者が用意したセッションIDのままログインさせて乗っ取る攻撃。<b>ログイン成功時にセッションIDを作り直す</b>。'),
      T('アクセストークンとリフレッシュトークン', 'Access / Refresh token', 'アクセストークン＝短命（数分〜1時間）の通行証。リフレッシュトークン＝長命で、新しいアクセストークンをもらうための券。リフレッシュトークンは使うたびに作り直す（ローテーション）。'),
      T('トークンの保存場所', 'Cookie vs localStorage', '<b>localStorage はJavaScriptから読める</b>ので、XSSがあると盗まれる。可能なら HttpOnly Cookie に入れる。SPAで難しい場合は、短い期限とCSPで守りを重ねる。'),
      T('ログアウト', 'Logout', 'ブラウザ側の情報を消すだけでなく、<b>サーバー側でもセッション／リフレッシュトークンを無効化</b>する。パスワード変更時は全端末をログアウト。'),
      T('OpenID Connect', 'OIDC', 'OAuth 2.0 の上に「ログイン（本人確認）」の仕組みを足したもの。IDトークン（JWT）で「誰がログインしたか」が分かる。ソーシャルログインの正体。'),
      T('PKCE と state', 'Proof Key for Code Exchange', 'OAuthの安全装置。PKCE＝引換券を盗まれても使えないようにする。state＝偽のログイン結果を混ぜ込まれないための合言葉。'),
      T('マジックリンク', 'Magic link', 'メールで届くログイン用リンク。パスワードが不要。リンクは1回限り・短い期限に。'),
      T('パスキー', 'Passkeys（WebAuthn / FIDO2）', '指紋・顔・PINで端末の鍵を使ってログイン。<b>パスワードがサーバーに存在せず、偽サイトでは使えない</b>ためフィッシングに強い。Supabase・Clerkなどで対応が進んでいる。', null, ['おすすめ']),
      T('多要素認証（MFA）', '2FA / MFA', '「知っているもの（パスワード）」「持っているもの（スマホ・鍵）」「本人そのもの（指紋）」から2つ以上を組み合わせる。'),
      T('リカバリーコード', 'Recovery codes', '2段階認証のスマホをなくしたとき用の、使い捨てのコード。発行時に1回だけ表示し、ハッシュ化して保存。'),
      T('メールアドレスの確認', 'Email verification', '登録時に確認メールのリンクを押してもらう。他人のメールアドレスでの登録やスパムを防ぐ。'),
      T('ボット対策', 'CAPTCHA / Cloudflare Turnstile', '登録・ログイン・問い合わせフォームへの機械的な大量送信を防ぐ。Turnstile は利用者にほぼ負担がない。検証はサーバーで。'),
      T('「ログイン状態を保持する」', 'Remember me', '長期間のセッションを発行する。共用PCを考え、重要な操作（パスワード変更・決済）では再認証を求める。'),
      T('再認証', 'Re-authentication / Step-up', '退会・メール変更・支払い情報の変更など重要な操作の直前に、もう一度パスワードや2段階認証を求める。'),
      T('セッションタイムアウト', 'Session timeout', '一定時間操作がなければログアウト。管理画面・金融系は短めに。'),
    ]),
  ]});
})();
