/* 開発用語辞典 — T(用語, 英語・読み, 説明, たとえ) */
(function(){
const T = (name, en, desc, ex) => ({ name, en, desc: desc + (ex ? `<br><span class="ex">たとえると：${ex}</span>` : '') });
const S = (title, items) => ({ title, layout:'rows', items });

TABS.push({ id:'web', label:'Webの仕組み', icon:'🌐', intro:'Webサイトやアプリが<b>どうやって表示されているか</b>の基本用語。', sections:[
  S('基本', [
    T('フロントエンド', 'Frontend', 'ユーザーの画面（ブラウザ・アプリ）側で動く部分。見た目と操作を担当。HTML・CSS・JavaScript。', 'お店の「売り場」'),
    T('バックエンド', 'Backend', 'サーバー側で動く部分。データの保存・計算・ログイン・他サービスとの連携を担当。', 'お店の「倉庫と事務所」'),
    T('サーバー', 'Server', 'リクエストを受け取って、データやページを返すコンピューター（またはプログラム）。'),
    T('クライアント', 'Client', 'サーバーにお願いする側。ブラウザやスマホアプリのこと。'),
    T('ブラウザ', 'Browser', 'Webページを表示するソフト（Chrome・Safari・Edge・Firefox）。'),
    T('HTML', 'HyperText Markup Language', 'ページの<b>骨組み・内容</b>を書く言語（見出し・段落・画像・ボタン）。', '家の柱と部屋'),
    T('CSS', 'Cascading Style Sheets', 'ページの<b>見た目</b>を指定する言語（色・大きさ・配置・アニメーション）。', '内装とペンキ'),
    T('JavaScript（JS）', 'JavaScript', 'ページに<b>動き・処理</b>を付ける言語。ブラウザでもサーバー（Node.js）でも動く。', '電気・水道などの設備'),
    T('URL', 'Uniform Resource Locator', 'Web上の住所。<code>https://example.com/blog?page=2#top</code> は「プロトコル／ドメイン／パス／クエリ／ハッシュ」に分かれる。'),
    T('ドメイン', 'Domain', '<code>example.com</code> のようなサイトの名前。お金を払って取得・更新する（年数千円程度〜）。'),
    T('DNS', 'Domain Name System', 'ドメイン名を、実際のサーバーの番号（IPアドレス）に変換する仕組み。独自ドメインを設定するときに触る。', 'インターネットの電話帳'),
    T('HTTP / HTTPS', 'HyperText Transfer Protocol (Secure)', 'ブラウザとサーバーがやり取りする約束事。HTTPSは暗号化されていて安全。今はHTTPSが必須。'),
    T('リクエスト／レスポンス', 'Request / Response', 'ブラウザからの「ちょうだい」がリクエスト、サーバーからの返事がレスポンス。'),
    T('静的サイト／動的サイト', 'Static / Dynamic', '静的＝あらかじめ作ったファイルをそのまま返す（速い・安い・安全）。動的＝アクセスごとにサーバーで中身を作る（ログイン・検索など）。'),
    T('レスポンシブ', 'Responsive Design', '画面の幅（スマホ・タブレット・PC）に合わせてレイアウトが変わる作り。'),
  ]),
  S('データのやり取り', [
    T('API', 'Application Programming Interface', 'プログラム同士がやり取りする窓口。天気・地図・AIなどの機能を自分のアプリから使える。（無料API辞典参照）', 'レストランの注文窓口'),
    T('JSON', 'JavaScript Object Notation', 'データを書く形式。<code>{"name":"山田","age":20}</code>。APIのやり取りで最もよく使われる。'),
    T('REST API', 'RESTful API', 'URLとHTTPメソッド（GET/POST/PUT/DELETE）でデータを操作する、最も一般的なAPIの設計。'),
    T('GraphQL', 'GraphQL', '欲しい項目を指定して問い合わせるAPIの方式。必要なデータだけを1回で取れる。'),
    T('Webhook', 'Webhook', '何かが起きたとき、相手のサービスから自動で通知が届く仕組み（決済完了など）。', '「届いたら電話してね」'),
    T('WebSocket', 'WebSocket', 'サーバーとつなぎっぱなしにして、リアルタイムにやり取りする通信（チャット・対戦ゲーム）。'),
    T('CORS', 'Cross-Origin Resource Sharing', '別のサイトのAPIをブラウザから呼ぶときの許可の仕組み。許可がないとCORSエラーになる。'),
    T('Cookie／セッション', 'Cookie / Session', 'ブラウザに小さな情報を保存する仕組み。ログイン状態の維持などに使う。'),
    T('キャッシュ', 'Cache', '一度取得したデータを一時保存して、次から速く表示する仕組み。「変更が反映されない」原因にもなる。'),
  ]),
]});

TABS.push({ id:'front', label:'フロントエンド', icon:'▣', intro:'画面を作るときに出てくる用語。React・Vue・Next.jsなどを使うと頻繁に登場します。', sections:[
  S('作り方・仕組み', [
    T('フレームワーク／ライブラリ', 'Framework / Library', 'よく使う機能をまとめた道具箱。ライブラリは「部品」、フレームワークは「骨組みごと決めてくれる土台」。'),
    T('コンポーネント', 'Component', '画面の部品（ボタン・カード・ヘッダー）を、再利用できる単位にしたもの。Reactなどの基本。', 'レゴブロック'),
    T('props', 'properties', '親のコンポーネントから子に渡す値。「このボタンの文字は〇〇」のような設定。'),
    T('state（状態）', 'State', 'コンポーネントが覚えている、変化する値（入力中の文字、開閉状態、カウント）。変わると画面が自動で更新される。'),
    T('フック', 'Hooks（useState, useEffect…）', 'Reactで状態や処理を扱うための関数。<code>use</code> で始まる。'),
    T('DOM', 'Document Object Model', 'ブラウザが持っている、ページの要素の木構造。JavaScriptはDOMを操作して画面を変える。'),
    T('SPA', 'Single Page Application', '最初に1ページだけ読み込み、あとはJavaScriptで画面を切り替えるアプリ。動きが速い。'),
    T('SSR／SSG／CSR', 'Server-Side Rendering / Static Site Generation / Client-Side Rendering', 'HTMLを「アクセスごとにサーバーで作る（SSR）」「事前に作っておく（SSG）」「ブラウザで作る（CSR）」の違い。表示速度やSEOに影響する。'),
    T('ハイドレーション', 'Hydration', 'サーバーで作ったHTMLに、ブラウザでJavaScriptの動きを後から付ける処理。'),
    T('ルーティング', 'Routing', 'URLごとにどの画面を表示するかの仕組み。'),
    T('ビルド', 'Build', '書いたコードを、ブラウザで速く動く形にまとめて変換する作業。<code>npm run build</code>。'),
    T('バンドラー', 'Bundler（Vite, webpack）', '多数のファイルを、ブラウザ用にまとめる道具。今はViteが主流。'),
    T('開発サーバー', 'Dev Server', '開発中に手元で動かすサーバー。保存すると自動で画面が更新される（ホットリロード）。<code>npm run dev</code>。'),
    T('TypeScript', 'TypeScript', 'JavaScriptに「型」（この変数は数字、など）を付けた言語。ミスを事前に見つけやすく、AIのコードの品質も上がる。'),
    T('Tailwind CSS', 'Tailwind CSS', '<code>class="p-4 text-lg bg-blue-500"</code> のように、小さなクラスを組み合わせてデザインするCSSの道具。AIとの相性が良い。'),
    T('アクセシビリティ', 'Accessibility（a11y）', '障害の有無や環境にかかわらず、誰でも使えるようにすること（読み上げ・キーボード操作・色のコントラスト）。'),
  ]),
]});

TABS.push({ id:'back', label:'バックエンド・データ', icon:'⛁', intro:'データの保存・処理・ログインに関する用語。テーブル設計やSQLを触って学ぶなら <a href="database.html">データベース・データ設計辞典</a> へ。', sections:[
  S('データベース', [
    T('データベース（DB）', 'Database', 'データを整理して保存・検索する仕組み。', '整理された巨大な棚'),
    T('SQL／RDB', 'SQL / Relational Database', '表（テーブル）形式でデータを管理し、SQLという言語で操作するDB（PostgreSQL・MySQL・SQLite）。'),
    T('NoSQL', 'NoSQL（Firestore, MongoDB）', '表形式にこだわらない柔軟なDB。JSONのようなデータをそのまま保存できる。'),
    T('テーブル／レコード／カラム', 'Table / Row / Column', 'テーブル＝表、レコード（行）＝1件のデータ、カラム（列）＝項目。'),
    T('主キー／外部キー', 'Primary Key / Foreign Key', '主キー＝1件を特定するID。外部キー＝別の表のデータとのつながり（注文→ユーザー）。'),
    T('CRUD', 'Create / Read / Update / Delete', 'データの基本操作「作成・読み取り・更新・削除」の頭文字。ほとんどのアプリはこの組み合わせ。'),
    T('ORM', 'Object-Relational Mapping（Prisma, Drizzle）', 'SQLを直接書かずに、プログラムの書き方でDBを操作できる道具。'),
    T('マイグレーション', 'Migration', 'DBの表の構造の変更を、手順として記録・適用する仕組み。'),
    T('インデックス', 'Index', '検索を速くするための索引。データが増えると重要になる。'),
    T('BaaS', 'Backend as a Service（Supabase, Firebase）', 'DB・認証・ストレージなどのバックエンド機能をまとめて提供するサービス。サーバーを作らずに済む。'),
  ]),
  S('認証・処理', [
    T('認証／認可', 'Authentication / Authorization', '認証＝「あなたは誰か」の確認（ログイン）。認可＝「何をしてよいか」の許可（管理者だけ削除できる）。'),
    T('OAuth／ソーシャルログイン', 'OAuth / Social Login', '「Googleでログイン」のように、他のサービスのアカウントでログインする仕組み。'),
    T('JWT', 'JSON Web Token', 'ログインしたことを証明する、署名付きの文字列（チケット）。'),
    T('ハッシュ化', 'Hashing', 'パスワードなどを元に戻せない形に変換して保存すること。パスワードをそのまま保存してはいけない。'),
    T('サーバーレス', 'Serverless（Vercel Functions, Cloudflare Workers）', 'サーバーを自分で管理せず、関数単位でコードを置いて動かす方式。使った分だけ・無料枠も大きい。'),
    T('エンドポイント', 'Endpoint', 'APIの個々の窓口（URL）。<code>/api/users</code> など。'),
    T('ミドルウェア', 'Middleware', 'リクエストが本処理に届く前後に挟む共通処理（ログイン確認・ログ記録）。'),
    T('非同期処理', 'Async / Await / Promise', '時間のかかる処理（通信・ファイル読み込み）を待つ間、他の処理を止めない仕組み。<code>await</code> で結果を待つ。'),
    T('cron（定期実行）', 'Cron Job', '「毎日8時に実行」のように決まった時刻に処理を動かす仕組み。'),
    T('キュー', 'Queue', '重い処理を順番待ちの列に入れて、裏で少しずつ処理する仕組み（メール大量送信など）。'),
  ]),
]});

TABS.push({ id:'devflow', label:'開発の道具・流れ', icon:'⑂', intro:'コードを書く・管理する・チームで進めるための道具と用語。Git・ターミナルを詳しく・触って学ぶなら <a href="git-terminal.html">Git・ターミナル・開発環境辞典</a> へ。', sections:[
  S('道具', [
    T('エディタ／IDE', 'Editor / IDE（VS Code, Cursor）', 'コードを書くソフト。VS Codeが定番、CursorなどはAI機能を強化したエディタ。'),
    T('ターミナル／コマンドライン', 'Terminal / CLI', '文字でコンピューターに命令する画面。Windowsは PowerShell、Macは ターミナル。'),
    T('Node.js', 'Node.js', 'ブラウザの外でJavaScriptを動かす環境。多くのWeb開発ツールの土台。'),
    T('npm／パッケージ', 'npm / Package', 'ライブラリ（パッケージ）をインストール・管理する道具。<code>npm install 名前</code>。pnpm・yarn・bunも同様の道具。'),
    T('package.json', 'package.json', 'プロジェクトの設定ファイル。使っているパッケージの一覧と、<code>npm run dev</code> などのコマンドが書いてある。'),
    T('node_modules', 'node_modules', 'インストールしたパッケージが入るフォルダ。巨大なのでGitには含めない（消しても npm install で戻る）。'),
    T('pip／仮想環境', 'pip / venv', 'Pythonのパッケージ管理と、プロジェクトごとに環境を分ける仕組み。最近はuvという高速な道具も人気。'),
    T('環境変数／.env', 'Environment Variables', 'APIキーなど、コードに直接書きたくない設定値。<code>.env</code> ファイルに書き、Gitには含めない。'),
    T('Docker／コンテナ', 'Docker / Container', 'アプリと動作環境を箱（コンテナ）ごとまとめて、どこでも同じように動かす仕組み。'),
    T('リンター／フォーマッター', 'Linter / Formatter（ESLint, Prettier, Biome）', 'コードの問題を指摘する道具（リンター）と、書き方を自動で整える道具（フォーマッター）。'),
  ]),
  S('Git・GitHub', [
    T('Git', 'Git', 'ファイルの変更履歴を記録・管理する道具。いつでも過去の状態に戻せる。', 'ゲームのセーブ機能'),
    T('リポジトリ', 'Repository（repo）', 'Gitで管理しているプロジェクトのまとまり。'),
    T('コミット', 'Commit', '変更をひとまとまりとして履歴に記録すること。', 'セーブポイント'),
    T('ブランチ', 'Branch', '本流から枝分かれして作業する仕組み。本流を壊さずに新機能を試せる。', 'パラレルワールド'),
    T('マージ', 'Merge', 'ブランチの変更を本流に取り込むこと。'),
    T('プッシュ／プル', 'Push / Pull', 'プッシュ＝手元の変更をGitHubに送る。プル＝GitHubの変更を手元に取り込む。'),
    T('クローン', 'Clone', 'GitHubのリポジトリを手元にまるごとコピーすること。'),
    T('プルリクエスト（PR）', 'Pull Request', '「この変更を取り込んでください」という提案。コードレビューの場になる。'),
    T('コンフリクト', 'Conflict', '同じ場所を別々に変更していて、自動でまとめられない状態。'),
    T('.gitignore', '.gitignore', 'Gitで管理しないファイル（.env・node_modules）を指定するファイル。'),
    T('GitHub', 'GitHub', 'Gitのリポジトリをネット上で共有・管理するサービス。Issue（課題管理）・Actions（自動化）・Pages（公開）も。'),
  ]),
  S('進め方', [
    T('MVP', 'Minimum Viable Product', '必要最小限の機能だけを持った最初の製品。まず小さく作って反応を見る。'),
    T('リファクタリング', 'Refactoring', '動作を変えずに、コードを読みやすく整理すること。'),
    T('テスト', 'Test（単体・結合・E2E）', 'プログラムが正しく動くかを自動で確かめるコード。単体＝部品ごと、E2E＝実際の操作を自動で再現。'),
    T('デバッグ', 'Debug', 'バグ（不具合）の原因を探して直すこと。'),
    T('CI／CD', 'Continuous Integration / Delivery', 'コードを送るたびに自動でテスト（CI）、自動で公開（CD）する仕組み。'),
    T('技術的負債', 'Technical Debt', '急いで作った結果、後で直す手間が増えた状態。早めに返済（リファクタリング）しないと開発が遅くなる。'),
    T('ドキュメント', 'Documentation', '使い方・仕組みの説明書。README.md はプロジェクトの最初の説明書。'),
  ]),
]});

TABS.push({ id:'infra', label:'公開・インフラ', icon:'☁', intro:'作ったものをインターネットに公開し、動かし続けるための用語。 定期実行・Webhook・Bot は <a href="automation.html">自動化・Bot辞典</a> へ。', sections:[
  S('公開', [
    T('デプロイ', 'Deploy', '作ったものをサーバーに置いて、公開・稼働させること。'),
    T('ホスティング', 'Hosting（Vercel, Netlify, Cloudflare Pages, GitHub Pages）', 'Webサイトやアプリを置いて公開してくれるサービス。静的サイトなら無料で十分なことが多い。'),
    T('本番環境／開発環境／ステージング', 'Production / Development / Staging', '本番＝ユーザーが使う環境。開発＝手元。ステージング＝本番そっくりのテスト環境。'),
    T('CDN', 'Content Delivery Network', '世界中のサーバーにコピーを置いて、近い場所から速く配信する仕組み。'),
    T('SSL証明書', 'SSL/TLS Certificate', 'HTTPSで通信するための証明書。主要なホスティングでは自動・無料で設定される。'),
    T('クラウド', 'Cloud（AWS, Google Cloud, Azure）', 'ネット経由でサーバー・DB・AIなどを借りて使う仕組み。従量課金に注意。'),
    T('ログ', 'Log', 'プログラムの動作の記録。エラー調査の手がかり。'),
    T('監視', 'Monitoring（Sentry など）', 'エラーや障害を自動で検知して知らせる仕組み。'),
    T('スケール', 'Scale', '利用者が増えても耐えられるように、処理能力を増やすこと。'),
    T('ダウンタイム', 'Downtime', 'サービスが止まっている時間。'),
  ]),
]});

TABS.push({ id:'ai', label:'AI・LLM', icon:'✧', intro:'AIを使う・アプリに組み込むときの用語。仕組みを触って学ぶなら <a href="ai-integration.html">AI組み込み辞典</a> へ。', sections:[
  S('基本', [
    T('LLM（大規模言語モデル）', 'Large Language Model', '大量の文章で学習し、文章を理解・生成するAI（Claude・GPT・Geminiなど）。'),
    T('プロンプト', 'Prompt', 'AIへの指示・質問の文章。（バイブコーディング指示文辞典参照）'),
    T('システムプロンプト', 'System Prompt', 'AIの役割やルールを最初に設定する、ユーザーには見えない指示。'),
    T('トークン', 'Token', 'AIが文章を処理する単位（単語や文字の断片）。料金や上限はトークン数で決まる。日本語は1文字≒1〜2トークン程度。'),
    T('コンテキストウィンドウ', 'Context Window', 'AIが一度に読める量の上限（会話履歴・資料を含む）。超えると古い内容を忘れる・エラーになる。'),
    T('ハルシネーション', 'Hallucination', 'AIがもっともらしい嘘（存在しない関数・事実）を作ってしまうこと。必ず確認が必要。'),
    T('温度（temperature）', 'Temperature', '回答のランダムさの設定。低い＝安定・正確、高い＝多様・創造的。'),
    T('マルチモーダル', 'Multimodal', '文章だけでなく、画像・音声・動画も入力・出力できること。'),
    T('ストリーミング', 'Streaming', 'AIの回答を、完成を待たずに少しずつ表示する方式。体感速度が上がる。'),
  ]),
  S('組み込み・応用', [
    T('RAG（検索拡張生成）', 'Retrieval-Augmented Generation', '質問に関係する資料を検索してAIに渡し、資料に基づいて答えさせる仕組み。社内文書チャットボットなど。'),
    T('エンベディング（埋め込み）', 'Embedding', '文章の意味を数値の並び（ベクトル）に変換したもの。意味の近い文章を探せる（ベクトル検索）。'),
    T('ファインチューニング', 'Fine-tuning', '既存のモデルを、自分のデータで追加学習させること。多くの場合はプロンプトやRAGで十分。'),
    T('関数呼び出し／ツール使用', 'Function Calling / Tool Use', 'AIが「天気APIを呼ぶ」などの外部の機能を使えるようにする仕組み。'),
    T('構造化出力', 'Structured Output / JSON Mode', 'AIの回答を決まったJSONの形で返させること。プログラムで扱いやすくなる。'),
    T('AIエージェント', 'AI Agent', '目標を与えると、自分で計画を立て、ツールを使い、結果を確認しながら作業を進めるAI。Claude Codeなどのコーディングエージェントもこれ。'),
    T('MCP', 'Model Context Protocol', 'AIアプリと外部のツール・データ（GitHub・ファイル・DBなど）をつなぐための共通規格。'),
    T('バイブコーディング', 'Vibe Coding', 'コードを細かく書く代わりに、AIに自然な言葉で指示して、対話しながらソフトウェアを作るスタイル。'),
    T('ローカルLLM', 'Local LLM', '自分のPCで動かすAI。無料・オフライン・データが外に出ない（Ollama・LM Studio）。'),
    T('プロンプトインジェクション', 'Prompt Injection', 'Webページや文書に紛れた悪意ある指示で、AIを操ろうとする攻撃。外部のデータをAIに読ませるときに注意。'),
  ]),
]});

TABS.push({ id:'security', label:'セキュリティ', icon:'🔒', intro:'公開するなら最低限知っておきたい用語。仕組みと対策を体験しながら学ぶなら <a href="security.html">セキュリティ・認証辞典</a> へ。（公開・品質チェック辞典も参照）', sections:[
  S('攻撃と対策', [
    T('XSS（クロスサイトスクリプティング）', 'Cross-Site Scripting', 'ユーザーが入力した文字に悪意あるスクリプトが含まれ、それがページで実行されてしまう攻撃。入力をそのままHTMLに入れない（エスケープする）。'),
    T('SQLインジェクション', 'SQL Injection', '入力欄からSQL文を紛れ込ませてDBを操作する攻撃。プレースホルダー（パラメータ化クエリ）やORMで防ぐ。'),
    T('CSRF', 'Cross-Site Request Forgery', '別サイトから、ログイン中のユーザーになりすまして操作させる攻撃。トークンやSameSite Cookieで防ぐ。'),
    T('ブルートフォース攻撃', 'Brute Force', 'パスワードを総当たりで試す攻撃。ログイン試行の回数制限で防ぐ。'),
    T('レート制限', 'Rate Limiting', '短時間の大量アクセスを制限すること。攻撃やAPI料金の暴走を防ぐ。'),
    T('最小権限の原則', 'Principle of Least Privilege', '必要最小限の権限だけを与えること。APIキーも読み取り専用などに絞る。'),
    T('RLS（行レベルセキュリティ）', 'Row Level Security', 'DBの行ごとに「誰が読み書きできるか」を設定する仕組み。Supabaseでは必須。'),
    T('2要素認証', '2FA / MFA', 'パスワードに加え、スマホのコードなど2つ目の確認を求める仕組み。'),
    T('脆弱性', 'Vulnerability', 'セキュリティ上の弱点。使っているパッケージにも見つかることがある（<code>npm audit</code> で確認）。'),
  ]),
]});
})();
