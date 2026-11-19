/* 開発用語辞典 — 追加分：デザイン / データ・統計 / インフラとセキュリティの追加 / 逆引き */
(function(){
const T = (name, en, desc, ex) => ({ name, en, desc: desc + (ex ? `<br><span class="ex">たとえると：${ex}</span>` : '') });
const S = (title, items) => ({ title, layout:'rows', items });

/* ---- デザイン ---- */
const DESIGN = { id:'design', label:'デザイン', icon:'🎨', intro:'画面を作るときに、デザイナーやAIとの会話で出てくる用語。実際の配色やフォントは <a href="color-typography.html">配色・タイポグラフィ辞典</a>、部品の名前は <a href="ui-components.html">UIコンポーネント辞典</a> へ。', sections:[
  S('作る段階の言葉', [
    T('ワイヤーフレーム', 'Wireframe', '色や画像を入れず、<b>線と箱だけ</b>で画面の配置を描いた設計図。何をどこに置くかを決める段階。', '家の間取り図'),
    T('モックアップ', 'Mockup', '色・文字・画像まで入れた、<b>完成に近い見た目</b>の画面。動きはない。'),
    T('プロトタイプ', 'Prototype', '押すと画面が切り替わるなど、<b>試しに触れる</b>見本。使い勝手を確かめるために作る。', '模型の家'),
    T('Figma', 'Figma', 'ブラウザで使えるデザインツールの定番。複数人で同時に編集でき、デザインから CSS の値も確かめられる。'),
    T('デザインシステム', 'Design System', '色・文字・余白・部品の使い方をまとめた<b>ルール集と部品集</b>。サイト全体の見た目がそろう。'),
    T('デザイントークン', 'Design Tokens', '色や余白の値に名前を付けたもの（<code>--color-primary</code> など）。名前で指定しておくと、一か所で全体を変えられる。'),
    T('ペルソナ', 'Persona', '「30代の会社員、スマホで通勤中に見る」のような、<b>代表的な利用者像</b>。誰のために作るかを具体的にする。'),
    T('カスタマージャーニー', 'Customer Journey', '利用者が知る → 調べる → 使う → また使う、までの流れと、その時々の気持ちを図にしたもの。'),
    T('ユーザーテスト', 'Usability Testing', '実際の人に使ってもらい、迷う所・つまずく所を見つけること。数人でも多くの問題が見つかる。'),
  ]),
  S('見た目の言葉', [
    T('UI と UX', 'User Interface / User Experience', 'UI は画面や部品そのもの、UX は使ったときの<b>体験全体</b>（分かりやすさ・気持ちよさ・満足）。', 'UIはお店の棚と看板、UXは買い物した体験'),
    T('ユーザビリティ', 'Usability', '目的を、迷わず・早く・間違えずに達成できるかという<b>使いやすさ</b>。'),
    T('アフォーダンス', 'Affordance', '見ただけで「押せそう」「引っぱれそう」と分かること。ボタンは押せそうな見た目にする。', 'ドアの取っ手の形で、押すか引くかが分かる'),
    T('余白（マージン・パディング）', 'Margin / Padding', 'マージンは要素の<b>外側</b>の余白、パディングは<b>内側</b>の余白。余白を整えるだけで、ぐっと見やすくなる。'),
    T('グリッド', 'Grid', '画面を縦の列に区切って、要素の位置をそろえるための見えない線。12列が定番。'),
    T('ブレークポイント', 'Breakpoint', 'レイアウトを切り替える画面幅の境目。「768px 以上ならパソコン向けの配置」など。'),
    T('タイポグラフィ', 'Typography', '文字の書体・大きさ・太さ・行間・字間などの整え方。読みやすさの大半を決める。'),
    T('フォントウェイト', 'Font Weight', '文字の太さ。400 がふつう、700 が太字。数字で細かく指定できる。'),
    T('行間（ライン・ハイト）', 'Line Height', '行と行の間隔。日本語の本文は 1.6〜1.8 くらいが読みやすい。'),
    T('メインカラー・アクセントカラー', 'Primary / Accent Color', 'サイトを代表する色と、ボタンなど目立たせたい所に使う色。ベース（背景）70%・メイン25%・アクセント5% が目安。'),
    T('コントラスト', 'Contrast', '色や明るさの差。文字と背景のコントラストが低いと読みにくい（<a href="accessibility.html">アクセシビリティ辞典</a>）。'),
    T('ファビコン', 'Favicon', 'ブラウザのタブやブックマークに出る小さなアイコン。'),
    T('ダークモード', 'Dark Mode', '暗い背景に明るい文字の表示。OS の設定に合わせて切り替えるのが一般的。'),
    T('アニメーションのイージング', 'Easing', '動きの速さの変化のつけ方。ゆっくり始まって速くなる、など（<a href="motion-math.html">動きの計算辞典</a>）。'),
  ]),
] };

/* ---- データ・統計 ---- */
const DATA = { id:'data', label:'データ・統計', icon:'📊', intro:'データを集計したり、グラフにしたり、AIに分析を頼んだりするときの用語。数字を動かして学ぶなら <a href="data-analysis.html">データ分析・統計辞典</a>、グラフは <a href="dataviz.html">グラフ・データ可視化辞典</a> へ。', sections:[
  S('データを扱う', [
    T('データセット', 'Dataset', '分析のためにまとめたデータのかたまり。多くは表の形。'),
    T('CSV', 'Comma-Separated Values', 'カンマで区切った文字だけの表のファイル。Excel・スプレッドシート・プログラムのどれでも読める。文字化けしたら文字コード（UTF-8 か Shift_JIS か）を確認。'),
    T('前処理（データクレンジング）', 'Data Cleaning', '分析の前に、表記ゆれ・空欄・重複・入力ミスを直すこと。分析の時間の多くはここにかかる。', '料理の下ごしらえ'),
    T('表記ゆれ', 'Inconsistent notation', '「東京都」「東京」「ﾄｳｷｮｳ」のように、同じものが違う書き方になっていること。集計がばらばらになる原因。'),
    T('欠損値', 'Missing Value', '入っているはずの値が空になっていること。0 と空は意味が違うので注意。'),
    T('外れ値', 'Outlier', 'ほかと比べて極端に大きい・小さい値。入力ミスのこともあれば、大事な発見のこともある。'),
    T('ピボットテーブル', 'Pivot Table', '表計算ソフトで、「部署ごと・月ごとの合計」のような集計表をドラッグで作る機能。'),
    T('クロス集計', 'Cross Tabulation', '2つの項目を縦と横に置いて、組み合わせごとの件数や合計を出した表。'),
    T('時系列データ', 'Time Series', '日付・時刻の順に並んだデータ。売上の推移、気温の変化など。'),
    T('ETL', 'Extract / Transform / Load', 'データを取り出し、形を整え、分析用の場所に入れる、一連の流れ。'),
    T('BI ツール', 'Business Intelligence', 'データをグラフやダッシュボードにして見るための道具（Looker Studio・Tableau・Power BI など）。'),
  ]),
  S('統計の言葉', [
    T('平均と中央値', 'Mean / Median', '平均は合計を数で割った値。中央値は並べたときの真ん中の値。極端な値があると、平均は引っぱられるが中央値は動きにくい。', '年収の「平均」は一部のお金持ちで高くなる'),
    T('標準偏差', 'Standard Deviation', 'データが平均からどれくらい<b>ばらついているか</b>を表す数。大きいほど散らばっている。'),
    T('分布', 'Distribution', 'データがどの値にどれくらい集まっているかの形。ヒストグラムで見る。'),
    T('相関', 'Correlation', '一方が増えるともう一方も増える（減る）という<b>関係の強さ</b>。−1〜1 の数で表す。'),
    T('相関と因果', 'Correlation vs Causation', '一緒に動くからといって、一方が原因とは限らない。アイスの売上と水の事故はどちらも「暑さ」が原因。', '傘が売れる日に雨が降るのは、傘が雨を降らせるからではない'),
    T('標本と母集団', 'Sample / Population', '知りたい全体が母集団、実際に調べた一部が標本。標本が偏っていると、全体を見誤る。'),
    T('誤差（誤差の範囲）', 'Margin of Error', '標本から全体を推し量るときの「ぶれ」の大きさ。人数が多いほど小さくなる。'),
    T('A/B テスト', 'A/B Testing', '2つの案（AとB）を利用者に分けて見せ、どちらの成果がよいか比べる方法。'),
    T('有意差・p値', 'Statistical Significance / p-value', '差が「たまたま」ではなさそうか、を判断するための考え方と数字。p値が小さいほど、偶然とは考えにくい。'),
    T('KPI', 'Key Performance Indicator', '目標に近づいているかを見るために決めた、大事な数字（月の新規会員数など）。'),
    T('コンバージョン率', 'Conversion Rate (CVR)', 'サイトに来た人のうち、購入・登録など目的の行動をした人の割合。'),
  ]),
] };

/* ---- インフラとセキュリティの追加 ---- */
const INFRA_ADD = S('もう少しくわしく', [
  T('PaaS', 'Platform as a Service', 'サーバーの管理をしなくても、コードを置くだけで動かせるサービス（Vercel・Netlify・Render など）。初心者の公開はまずここ。'),
  T('VPS', 'Virtual Private Server', '仮想の専用サーバーを借りるサービス。自由度は高いが、設定・更新・セキュリティを自分で管理する。'),
  T('リージョン', 'Region', 'クラウドのサーバーがある地域（東京・大阪・米国など）。利用者に近いほど速い。'),
  T('ロードバランサー', 'Load Balancer', '大量のアクセスを、複数のサーバーに振り分ける仕組み。', '混んだレジを、空いているレジに案内する係'),
  T('オートスケール', 'Auto Scaling', 'アクセスが増えたら自動でサーバーを増やし、減ったら減らす仕組み。'),
  T('ロールバック', 'Rollback', '公開した新しい版に問題があったとき、前の版に戻すこと。多くのホスティングはボタン1つでできる。'),
  T('プレビュー環境', 'Preview Deployment', '本番に出す前に、変更ごとに専用のURLで確認できる環境。Vercel や Netlify はプルリクエストごとに自動で作る。'),
  T('バックアップ', 'Backup', 'データの写しを別の場所に取っておくこと。<b>戻せるか試しておく</b>までがバックアップ。'),
  T('稼働率（アップタイム）', 'Uptime / SLA', 'サービスが動いていた時間の割合。99.9% でも1年に約9時間止まる計算。'),
  T('従量課金', 'Pay-as-you-go', '使った分だけ料金がかかる方式。アクセスやAIの利用が急に増えると請求も増えるので、上限やアラートを設定する。'),
  T('転送量', 'Bandwidth / Egress', 'サーバーから送り出したデータの量。画像や動画が多いと増え、料金の対象になることがある。'),
]);
const SEC_ADD = S('もう少しくわしく', [
  T('フィッシング', 'Phishing', '本物そっくりのメールやサイトで、パスワードやカード番号を入力させる詐欺。'),
  T('APIキーの漏えい', 'Leaked API Keys', 'GitHub に公開したコードやブラウザのコードに書いたキーが他人に使われること。不正利用で高額請求になることも。'),
  T('シークレット管理', 'Secrets Management', 'APIキーやパスワードを、コードではなく環境変数や専用の保管場所で管理すること。'),
  T('パスキー', 'Passkey', 'パスワードの代わりに、スマホの指紋・顔認証などでログインする仕組み。フィッシングに強い。'),
  T('サプライチェーン攻撃', 'Supply Chain Attack', '使っているパッケージ（npm など）に悪いコードが入り込む攻撃。名前がそっくりな偽物のパッケージにも注意。'),
  T('脆弱性のアップデート', 'Security Patch', '見つかった弱点を直すための更新。依存パッケージは定期的に更新する（<code>npm audit</code> で確認）。'),
  T('CSP', 'Content Security Policy', 'ページで読み込んでよいスクリプトの場所をブラウザに伝える設定。XSS の被害を減らせる。'),
  T('暗号化（通信と保存）', 'Encryption in transit / at rest', '通信の途中で読まれないようにする（HTTPS）のと、保存されたデータを読めなくする（ディスクの暗号化）の2種類がある。'),
  T('ログイン試行の監視', 'Login monitoring', '同じアカウントへの大量のログイン失敗や、普段と違う場所からのログインを検知する。'),
  T('個人情報', 'Personal Information', '名前・メールアドレス・顔写真など、個人を特定できる情報。集めるなら利用目的を示し、安全に管理する（<a href="licenses.html#people">著作権・ライセンス辞典</a>）。'),
]);

/* ---- 逆引き ---- */
const REVERSE = { id:'reverse', label:'逆引き', icon:'🔁', intro:'「こういうことをしたいけど、何と呼ぶの？」から用語を探す逆引きと、よく見る略語の一覧です。用語が分かれば、検索やAIへの指示がぐっと楽になります。', sections:[
  { title:'やりたいこと → 用語', table:{ head:['やりたいこと', '用語', 'くわしくは'], rows:[
    ['作ったサイトをネットに出したい', 'デプロイ・ホスティング', '公開・インフラ'],
    ['自分のサイトの名前（〇〇.com）を使いたい', 'ドメイン・DNS', 'Webの仕組み'],
    ['ログインできるようにしたい', '認証・OAuth・BaaS', 'バックエンド・データ'],
    ['人によって見られる物を変えたい', '認可・RLS', 'セキュリティ'],
    ['データを保存しておきたい', 'データベース・localStorage', 'バックエンド・データ'],
    ['他のサービスの機能を使いたい', 'API', 'Webの仕組み'],
    ['何かが起きたら自動で知らせたい', 'Webhook', 'Webの仕組み'],
    ['決まった時間に自動で動かしたい', 'cron（定期実行）', 'バックエンド・データ'],
    ['チャットのように、すぐに画面に反映したい', 'WebSocket・リアルタイム', 'Webの仕組み'],
    ['スマホでもパソコンでも見やすくしたい', 'レスポンシブ・ブレークポイント', 'デザイン'],
    ['ホーム画面に置けるアプリにしたい', 'PWA', '<a href="app-distribution.html">アプリ配布辞典</a>'],
    ['ページを速く表示したい', 'キャッシュ・CDN', '公開・インフラ'],
    ['前の状態に戻したい', 'Git（コミット・リバート）・ロールバック', '開発の道具・流れ'],
    ['ほかの人と同じコードを触りたい', 'ブランチ・プルリクエスト', '開発の道具・流れ'],
    ['同じ部品を何度も使いたい', 'コンポーネント', 'フロントエンド'],
    ['画面の状態（開いている・選んでいる）を覚えたい', 'state（状態）', 'フロントエンド'],
    ['APIキーを安全に置きたい', '環境変数・シークレット管理', 'セキュリティ'],
    ['勝手に使われないよう回数を制限したい', 'レート制限', 'セキュリティ'],
    ['AIに社内の資料を元に答えさせたい', 'RAG', 'AI・LLM'],
    ['AIに決まった形（JSON）で答えさせたい', '構造化出力', 'AI・LLM'],
    ['AIに外部の道具を使わせたい', 'ツール使用・MCP', 'AI・LLM'],
    ['データの表記ゆれや空欄を直したい', '前処理（データクレンジング）', 'データ・統計'],
    ['2つの案のどちらがよいか確かめたい', 'A/Bテスト', 'データ・統計'],
    ['画面の配置をざっと決めたい', 'ワイヤーフレーム', 'デザイン'],
    ['色や余白を全体でそろえたい', 'デザインシステム・デザイントークン', 'デザイン'],
    ['自動でテストして、自動で公開したい', 'CI/CD', '開発の道具・流れ'],
  ] } },
  { title:'略語の一覧', table:{ head:['略語', '正式な名前', 'ひとことで'], rows:[
    ['API', 'Application Programming Interface', 'プログラム同士の窓口'],
    ['AI', 'Artificial Intelligence', '人工知能'],
    ['BaaS', 'Backend as a Service', 'バックエンドの機能をまとめて借りるサービス'],
    ['BI', 'Business Intelligence', 'データを見える化する道具'],
    ['CDN', 'Content Delivery Network', '世界中から速く配る仕組み'],
    ['CI/CD', 'Continuous Integration / Delivery', '自動でテストして自動で公開'],
    ['CLI', 'Command Line Interface', 'ターミナルで文字で操作するもの'],
    ['CMS', 'Content Management System', 'ブログなどの記事を管理する仕組み（WordPress など）'],
    ['CORS', 'Cross-Origin Resource Sharing', '別のサイトからのアクセスを許すかの決まり'],
    ['CRUD', 'Create / Read / Update / Delete', 'データの作成・読み・更新・削除'],
    ['CSP', 'Content Security Policy', '読み込んでよい場所をブラウザに伝える設定'],
    ['CSR / SSR / SSG', 'Client / Server Side Rendering / Static Site Generation', '画面をどこで作るか'],
    ['CSS', 'Cascading Style Sheets', '見た目を指定する言語'],
    ['CSV', 'Comma-Separated Values', 'カンマ区切りの表ファイル'],
    ['CVR', 'Conversion Rate', '目的の行動をした人の割合'],
    ['DB', 'Database', 'データベース'],
    ['DNS', 'Domain Name System', 'ドメインを住所に変える仕組み'],
    ['DOM', 'Document Object Model', 'ブラウザの中のページの構造'],
    ['ETL', 'Extract / Transform / Load', 'データを取り出して整えて入れる'],
    ['GUI', 'Graphical User Interface', 'マウスや指で操作する画面'],
    ['HTML', 'HyperText Markup Language', 'ページの骨組みを書く言語'],
    ['HTTP(S)', 'HyperText Transfer Protocol (Secure)', 'Webのやり取りの約束事'],
    ['IDE', 'Integrated Development Environment', '開発用の多機能エディタ'],
    ['JS / TS', 'JavaScript / TypeScript', 'Webで動く言語 / 型の付いた JavaScript'],
    ['JSON', 'JavaScript Object Notation', 'データをやり取りする形式'],
    ['JWT', 'JSON Web Token', 'ログイン状態を表す小さな証明書'],
    ['KPI', 'Key Performance Indicator', '目標を見るための大事な数字'],
    ['LLM', 'Large Language Model', '大規模言語モデル（ChatGPT・Claude など）'],
    ['LP', 'Landing Page', '広告などから最初に来る1枚の宣伝ページ'],
    ['MCP', 'Model Context Protocol', 'AIに外部の道具をつなぐ共通の規格'],
    ['MVP', 'Minimum Viable Product', '最小限の機能で出す最初の版'],
    ['OAuth', 'Open Authorization', 'Google などでログインする仕組み'],
    ['OGP', 'Open Graph Protocol', 'SNSで共有したときのカードの情報'],
    ['ORM', 'Object-Relational Mapping', 'データベースをコードの形で扱う道具'],
    ['OSS', 'Open Source Software', 'ソースが公開され自由に使えるソフト'],
    ['PaaS / IaaS / SaaS', 'Platform / Infrastructure / Software as a Service', 'クラウドで何を借りるか'],
    ['PR', 'Pull Request', '変更を取り込んでもらう依頼'],
    ['PWA', 'Progressive Web App', 'ホーム画面に置けるWebアプリ'],
    ['RAG', 'Retrieval-Augmented Generation', '資料を検索してから答えるAI'],
    ['REST', 'Representational State Transfer', 'APIの代表的な作り方'],
    ['RLS', 'Row Level Security', '行ごとに見られる人を制限する仕組み'],
    ['SEO', 'Search Engine Optimization', '検索で見つけてもらう工夫'],
    ['SPA', 'Single Page Application', '1ページで画面を切り替えるアプリ'],
    ['SQL', 'Structured Query Language', 'データベースへの命令の言語'],
    ['SSL / TLS', 'Secure Sockets Layer / Transport Layer Security', 'HTTPS の暗号化の仕組み'],
    ['UI / UX', 'User Interface / Experience', '画面 / 使ったときの体験'],
    ['URL', 'Uniform Resource Locator', 'Webの住所'],
    ['VPS', 'Virtual Private Server', '仮想の専用サーバー'],
    ['WCAG', 'Web Content Accessibility Guidelines', 'アクセシビリティの国際的なガイドライン'],
    ['XSS', 'Cross-Site Scripting', '他人のスクリプトを動かされる攻撃'],
  ] } },
] };

// 並び：Webの仕組み → フロント → デザイン → バック → データ・統計 → 開発の流れ → インフラ → AI → セキュリティ → 逆引き
const at = (id) => TABS.findIndex(t => t.id === id);
TABS.splice(at('front') + 1, 0, DESIGN);
TABS.splice(at('back') + 1, 0, DATA);
TABS.push(REVERSE);
const inf = TABS.find(t => t.id === 'infra'); if (inf) inf.sections.push(INFRA_ADD);
const sec = TABS.find(t => t.id === 'security'); if (sec) sec.sections.push(SEC_ADD);
})();
