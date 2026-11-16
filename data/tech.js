/* 技術スタック・ライブラリ辞典 — L(名前, 分類, 説明, タグ, URL, 導入コマンド, 指示例) */
(function(){
const L = (name, en, desc, tags, url, code, prompt) => ({ name, en, desc, tags, url, code, codeLabel:'導入', prompt });
const S = (title, items, note) => ({ title, note, layout:'rows', items });

TABS.push({
  id:'combo', label:'おすすめ構成', icon:'★',
  intro:'何を作るかで、使う技術の組み合わせ（スタック）を選びます。<b>迷ったら下の表の定番構成</b>を指定すると、AIの知識も豊富で、エラーも解決しやすくなります。',
  sections:[
    { title:'作りたいもの別の定番構成', table:{ head:['作りたいもの','おすすめ構成','公開先','ひとこと'], rows:[
      ['ちょっとしたツール・ゲーム','HTML＋CSS＋JavaScript（1ファイル）','GitHub Pages / Netlify Drop','サーバー不要。ダブルクリックで開ける'],
      ['LP・紹介サイト','HTML＋Tailwind CSS、または Astro','Netlify / Vercel / Cloudflare Pages','表示が速く、SEOにも強い'],
      ['ブログ・ドキュメント','Astro / Next.js ＋ Markdown','Vercel / Cloudflare Pages','記事はMarkdownで書ける'],
      ['ログイン付きWebアプリ','Next.js ＋ Supabase ＋ shadcn/ui','Vercel','AIツールの定番構成。認証・DBが一気に揃う'],
      ['管理画面・社内ツール','React（Vite）＋ shadcn/ui ＋ Supabase、または Streamlit（Python）','Vercel / Streamlit Community Cloud','データを見て操作するだけならStreamlitが最速'],
      ['スマホアプリ','Expo（React Native）＋ Supabase','App Store / Google Play（EAS）','Webの知識で iOS/Android を作れる'],
      ['デスクトップアプリ','Tauri（またはElectron）＋ React','配布ファイル（exe/dmg）','Tauriは軽量、Electronは情報が多い'],
      ['AIチャット・AI機能','Next.js ＋ Vercel AI SDK ＋ 各社AI API','Vercel','ストリーミング表示が簡単'],
      ['APIサーバー','Hono（TypeScript）／ FastAPI（Python）','Cloudflare Workers / Render / Railway','軽くて速い'],
      ['データ分析・自動化','Python ＋ pandas ＋（Jupyter / Streamlit）','手元のPC / GitHub Actions','集計・可視化・定期実行'],
      ['Chrome拡張','Manifest V3 ＋ TypeScript（WXT / Plasmo）','Chrome ウェブストア','フレームワークを使うと開発が楽'],
      ['ブラウザゲーム','Canvas＋JS、Phaser、Three.js','itch.io / GitHub Pages','ゲーム制作辞典も参照'],
    ]} },
    S('選び方のコツ', [
      L('「有名で枯れた」ものを選ぶ', 'Popular & stable', 'AIは学習データの多い技術ほど正確にコードを書ける。<b>新しすぎる・マイナーな技術は、AIが古い書き方や存在しない機能を出しやすい</b>。', ['AI時代の鉄則']),
      L('最初は少なく', 'Start small', '最初から多くの技術を組み合わせない。まず1ファイルや最小構成で動かし、必要になったら足す。'),
      L('バージョンを指定する', 'Pin versions', '「Next.js 15のApp Routerで」「Tailwind CSS v4で」のようにバージョンを伝えると、古い書き方が混ざるのを防げる。', [], null, null, 'Next.jsはApp Router、Tailwind CSSはv4、React 19の書き方で統一して。古いPages Routerやv3の書き方は使わないで。'),
    ]),
  ]
});

TABS.push({ id:'front', label:'フロントエンド', icon:'▣', intro:'画面を作るためのフレームワーク・ツール。', sections:[
  S('フレームワーク', [
    L('React', 'UIライブラリ（Meta）', 'コンポーネントで画面を組み立てる、世界で最も使われているUIライブラリ。情報・部品・AIの知識が最も豊富。', ['定番','AIと相性◎'], 'https://react.dev/', 'npm create vite@latest my-app -- --template react-ts'),
    L('Next.js', 'Reactのフルスタックフレームワーク（Vercel）', 'ルーティング・サーバー処理・API・SEO対応が揃ったReactの決定版。Vercelにそのまま公開できる。', ['定番','フルスタック'], 'https://nextjs.org/', 'npx create-next-app@latest'),
    L('Vue.js / Nuxt', 'UIフレームワーク', 'HTMLに近い書き方で分かりやすい。日本でも人気。Nuxtはフルスタック版。', ['書きやすい'], 'https://vuejs.org/', 'npm create vue@latest'),
    L('Svelte / SvelteKit', 'UIフレームワーク', 'コード量が少なく、動作が軽い。コンパイル時に最適化する。', ['軽量'], 'https://svelte.dev/', 'npx sv create my-app'),
    L('Astro', 'コンテンツサイト向け', 'ブログ・LP・ドキュメントなど<b>表示が中心のサイト</b>に最適。必要な部分だけJSを動かすので非常に速い。React等の部品も混ぜて使える。', ['速い','SEO'], 'https://astro.build/', 'npm create astro@latest'),
    L('素のHTML/CSS/JS', 'Vanilla', 'フレームワークなし。小さなツールなら最速で、学習にも最適。', ['依存なし']),
    L('Vite', 'ビルドツール・開発サーバー', '起動が一瞬の開発サーバーとビルドツール。React/Vue/Svelteどれでも使う。', ['ほぼ必須'], 'https://vite.dev/', 'npm create vite@latest'),
  ]),
  S('状態管理・データ取得', [
    L('TanStack Query', 'サーバーデータの取得・キャッシュ', 'APIからのデータ取得・キャッシュ・再取得・読み込み中/エラー状態をまとめて面倒見てくれる。', ['おすすめ'], 'https://tanstack.com/query', 'npm i @tanstack/react-query'),
    L('Zustand', 'グローバル状態管理', 'シンプルで小さい状態管理。Reduxより圧倒的に書くことが少ない。', [], 'https://zustand.docs.pmnd.rs/', 'npm i zustand'),
    L('React Hook Form ＋ Zod', 'フォームと入力チェック', 'フォームの値管理と、型安全な入力チェック。Zodはサーバー側の検証にも使える。', ['フォームの定番'], 'https://react-hook-form.com/', 'npm i react-hook-form zod @hookform/resolvers', 'React Hook FormとZodで、会員登録フォーム（名前・メール・パスワード8文字以上・確認一致）を作って。'),
  ]),
]});

TABS.push({ id:'style', label:'CSS・UI', icon:'◐', intro:'見た目を作る道具。部品の詳細は <a href="ui-components.html">UIコンポーネント辞典</a>、デザインは <a href="web-design.html">Webデザイン辞典</a> へ。', sections:[
  S('CSSの道具', [
    L('Tailwind CSS', 'ユーティリティCSS', '<code>class="flex gap-4 p-6 rounded-xl bg-white"</code> のようにクラスを並べてデザイン。AIとの相性が非常に良い。v4はCSSファイル1行で導入できる。', ['定番','AIと相性◎'], 'https://tailwindcss.com/', 'npm i tailwindcss @tailwindcss/vite\n/* CSSに */ @import "tailwindcss";'),
    L('shadcn/ui', 'Reactコンポーネント集', 'ボタン・ダイアログ・表などを、コードごと自分のプロジェクトにコピーして使う。自由に改造できる。', ['定番'], 'https://ui.shadcn.com/', 'npx shadcn@latest init'),
    L('CSS Modules / 素のCSS', '標準', 'クラス名がファイルごとに分離されるCSS（Next.js/Viteに標準対応）。素のCSSも、変数・ネスト・:has()などで十分強力になった。'),
    L('Sass', 'CSSの拡張言語', '変数・ネスト・ミックスイン。古くからの定番。'),
    L('Bootstrap / daisyUI / Pico.css', 'すぐ使えるCSS', 'クラスを付けるだけで整った見た目。プロトタイプや管理画面に。', [], 'https://daisyui.com/'),
  ]),
  S('アイコン・アニメーション', [
    L('Lucide', 'アイコン', '線のシンプルで統一感のあるアイコン集。shadcn/uiの標準。', [], 'https://lucide.dev/', 'npm i lucide-react'),
    L('Motion（旧Framer Motion）/ GSAP', 'アニメーション', '詳しくはWebデザイン辞典の「アニメ系ライブラリ」へ。', [], 'web-design.html#libs'),
  ]),
]});

TABS.push({ id:'back', label:'バックエンド', icon:'⚙', intro:'サーバー側の処理・APIを作る技術。', sections:[
  S('JavaScript / TypeScript', [
    L('Hono', '軽量Webフレームワーク', 'とても軽く速い。Cloudflare Workers・Bun・Node・Denoどこでも動く。日本発。', ['おすすめ','エッジ対応'], 'https://hono.dev/', 'npm create hono@latest'),
    L('Express', '定番Webフレームワーク', '最も古くからある定番。情報が非常に多い。', ['情報量◎'], 'https://expressjs.com/', 'npm i express'),
    L('Next.js Route Handlers / Server Actions', 'Next.js内のAPI', '別サーバーを立てずに、Next.jsの中にAPIやサーバー処理を書ける。', [], 'https://nextjs.org/docs'),
    L('NestJS', '大規模向けフレームワーク', '構造がきっちり決まっていて、大きなチーム開発向け。'),
    L('tRPC', '型安全なAPI', 'フロントとバックエンドで型を共有し、APIの呼び出しミスをなくす。'),
    L('Bun / Deno', 'JavaScriptランタイム', 'Node.jsの代わりに使える高速な実行環境。Bunはパッケージ管理も高速。', [], 'https://bun.sh/'),
  ]),
  S('Python', [
    L('FastAPI', 'Python Webフレームワーク', '型ヒントからAPIとドキュメントを自動生成。AI・データ処理のAPIに最適。', ['おすすめ'], 'https://fastapi.tiangolo.com/', 'pip install "fastapi[standard]"\nfastapi dev main.py'),
    L('Flask', '軽量フレームワーク', '小さく始められる定番。'),
    L('Django', 'フルスタック', '管理画面・認証・ORMなど全部入り。大きなWebサービス向け。'),
    L('Streamlit / Gradio', 'データアプリ・AIデモ', 'Pythonだけで<b>画面付きのアプリ</b>が作れる。データ可視化・AIのデモに最速。', ['画面もPythonで'], 'https://streamlit.io/', 'pip install streamlit\nstreamlit run app.py', 'StreamlitでCSVをアップロードすると集計表とグラフが出るアプリを作って。'),
  ]),
  S('その他の言語', [
    L('Go', 'Go言語', 'シンプルで高速、並行処理が得意。サーバー・CLIツール。'),
    L('Ruby on Rails', 'Ruby', '少ないコードで素早くWebサービスを作れる。日本のスタートアップで多用。'),
    L('Laravel', 'PHP', 'PHPの定番フレームワーク。レンタルサーバーでも動かしやすい。'),
    L('Rust', 'Rust', '高速・安全。Tauri、WebAssembly、高性能なツールに。学習難度は高め。'),
  ]),
]});

TABS.push({ id:'db', label:'DB・ORM', icon:'⛁', intro:'データの保存先とその扱い方。BaaS（Supabase/Firebase）の詳細は <a href="free-api.html#baas">無料API辞典</a> に、設計やSQLは <a href="database.html">データベース・データ設計辞典</a> にも。', sections:[
  S('データベース', [
    L('PostgreSQL', 'リレーショナルDB', '高機能で信頼性の高い定番DB。Supabase・Neonで手軽に使える。', ['定番'], 'https://www.postgresql.org/'),
    L('SQLite', 'ファイル1つのDB', 'サーバー不要で、ファイル1つにデータを保存。小さなアプリ・デスクトップアプリ・試作に最適。Turso・Cloudflare D1でクラウド化も。', ['手軽'], 'https://sqlite.org/'),
    L('MySQL', 'リレーショナルDB', 'WordPressなどで広く使われる。'),
    L('Supabase', 'PostgreSQL＋認証＋ストレージ', 'Firebaseのオープンソース代替。SQLが使え、AIツールとの相性も良い。', ['おすすめ'], 'https://supabase.com/'),
    L('Firebase Firestore', 'NoSQL', 'Googleのリアルタイムデータベース。モバイルアプリで人気。', [], 'https://firebase.google.com/'),
    L('Redis', 'インメモリDB', '超高速なキー・値の保存。キャッシュ・ランキング・セッションに。Upstashならサーバーレスで。'),
    L('IndexedDB / localStorage', 'ブラウザ内保存', 'サーバーなしでブラウザに保存。Dexie.js を使うとIndexedDBが簡単に。', [], 'https://dexie.org/', 'npm i dexie'),
  ]),
  S('ORM（DBを扱う道具）', [
    L('Prisma', 'TypeScript ORM', 'スキーマ（表の定義）を書くと、型付きのDB操作関数とマイグレーションが自動生成される。', ['定番'], 'https://www.prisma.io/', 'npm i prisma @prisma/client\nnpx prisma init'),
    L('Drizzle ORM', 'TypeScript ORM', 'SQLに近い書き方で軽量・高速。サーバーレス・エッジ環境と相性が良い。', ['軽量'], 'https://orm.drizzle.team/', 'npm i drizzle-orm\nnpm i -D drizzle-kit'),
    L('SQLAlchemy / SQLModel', 'Python ORM', 'Pythonの定番ORM。SQLModelはFastAPIと相性が良い。'),
  ]),
]});

TABS.push({ id:'app', label:'スマホ・デスクトップ', icon:'📱', intro:'Webの知識で、スマホアプリやデスクトップアプリを作る技術。 届け方の選び方・PWA・ストア審査は <a href="app-distribution.html">スマホアプリ・配布形態辞典</a> へ。', sections:[
  S('スマホアプリ', [
    L('Expo（React Native）', 'iOS / Android', 'Reactの書き方でiPhone・Androidアプリを作れる。実機確認はExpo Goアプリで即座に。ストア公開もEASで簡単に。', ['おすすめ'], 'https://expo.dev/', 'npx create-expo-app@latest'),
    L('Flutter', 'iOS / Android / Web（Google）', 'Dart言語で、見た目が統一された美しいアプリ。動作が滑らか。', [], 'https://flutter.dev/'),
    L('Capacitor', 'Webアプリをアプリ化', '作ったWebアプリをそのままiOS/Androidアプリとして包める。', [], 'https://capacitorjs.com/'),
    L('PWA', 'Progressive Web App', 'ストアを通さず、Webアプリをホーム画面に追加して使う方式。最も手軽。'),
    L('SwiftUI / Jetpack Compose', 'ネイティブ', 'Apple（Swift）・Android（Kotlin）の公式。性能と最新機能を最大限使える。'),
  ]),
  S('デスクトップアプリ', [
    L('Tauri', 'Rust＋Web', '画面はWeb技術、裏側はRust。<b>配布ファイルが小さく軽い</b>。', ['軽量'], 'https://tauri.app/', 'npm create tauri-app@latest'),
    L('Electron', 'Node.js＋Chromium', 'VS Code・Slack・Discordなどで使われる定番。情報が多いがファイルが大きい。', ['情報量◎'], 'https://www.electronjs.org/'),
  ]),
]});

TABS.push({ id:'host', label:'ホスティング', icon:'☁', intro:'作ったものを公開する場所。個人開発なら<b>無料枠で十分</b>なことがほとんどです（商用利用の可否は各規約を確認）。', sections:[
  S('静的サイト・フロントエンド', [
    L('Vercel', 'Next.jsの開発元', 'GitHubと連携してpushするだけで自動公開。Next.jsとの相性は最高。無料のHobbyプランは非商用向け。', ['定番'], 'https://vercel.com/'),
    L('Netlify', '静的サイト・フォーム', 'フォーム受付・リダイレクト設定が簡単。フォルダをドラッグ&ドロップでも公開できる（Netlify Drop）。', ['手軽'], 'https://www.netlify.com/'),
    L('Cloudflare Pages / Workers', 'エッジ', '高速・無料枠が大きく、商用利用もしやすい。Workers・D1・R2と組み合わせて完全サーバーレスに。', ['無料枠◎'], 'https://pages.cloudflare.com/'),
    L('GitHub Pages', 'GitHub', 'リポジトリからそのまま静的サイトを無料公開。ポートフォリオやドキュメントに。', ['無料'], 'https://pages.github.com/'),
    L('Firebase Hosting', 'Google', 'Firebaseの他の機能と一緒に使うなら便利。'),
  ]),
  S('サーバー・バックエンド', [
    L('Render / Railway / Fly.io', 'アプリサーバー', 'Node・Python・Dockerのサーバーを手軽に動かせる。無料枠や料金体系はサービスごとに異なり、変更も多い。', [], 'https://render.com/'),
    L('Streamlit Community Cloud', 'Streamlit専用', 'GitHubのStreamlitアプリを無料で公開。'),
    L('Hugging Face Spaces', 'AIデモ', 'Gradio/StreamlitのAIデモを無料で公開。'),
    L('VPS / AWS / Google Cloud', '本格インフラ', '自由度が高いが設定と費用管理が必要。<b>予算アラートの設定は必須</b>。'),
  ]),
]});

TABS.push({ id:'viz', label:'グラフ・可視化', icon:'📈', intro:'データをグラフ・地図・図にするライブラリ。 グラフの選び方・見やすくするルールは <a href="dataviz.html">グラフ・データ可視化辞典</a>、3D表現は <a href="3d.html">3D・WebGL・シェーダー辞典</a> へ。', sections:[
  S('グラフ', [
    L('Chart.js', '定番グラフ', '折れ線・棒・円・レーダーなど。設定だけで簡単に作れ、CDNでも使える。', ['手軽'], 'https://www.chartjs.org/', '<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>', 'Chart.jsで月別売上の棒グラフと、前年比の折れ線グラフを重ねて表示して。'),
    L('Recharts', 'React向けグラフ', 'Reactのコンポーネントとしてグラフを書ける。shadcn/uiのChartもこれがベース。', [], 'https://recharts.org/', 'npm i recharts'),
    L('Apache ECharts', '高機能グラフ', '大量データ・地図・3D・アニメーション付きのグラフに強い。', ['高機能'], 'https://echarts.apache.org/'),
    L('D3.js', '自由自在な可視化', 'データとSVGを結びつけて、どんな図でも作れる。学習コストは高い。', [], 'https://d3js.org/'),
    L('Plotly', 'インタラクティブ', 'ズーム・ホバーできるグラフ。PythonでもJSでも使える。'),
    L('Observable Plot', '手軽なD3', 'D3チームによる、短いコードで分析用グラフを作れるライブラリ。'),
  ]),
  S('図・地図・その他', [
    L('Mermaid', '文字から図', 'テキストでフローチャート・シーケンス図・ガントチャートを書ける。GitHubやNotionでも表示される。AIに図を書かせるのに最適。', ['AIと相性◎'], 'https://mermaid.js.org/', null, 'このアプリの画面遷移をMermaidのフローチャートで図にして。'),
    L('Leaflet / MapLibre', '地図', '無料API辞典の「地図・位置」タブ参照。', [], 'free-api.html#map'),
    L('React Flow', 'ノード図', 'ノードと線をドラッグで編集できる図（ワークフロー・マインドマップ）。', [], 'https://reactflow.dev/'),
  ]),
]});

TABS.push({ id:'util', label:'便利ライブラリ', icon:'🧰', intro:'「ちょっとした機能」を自分で書かずに済ませるライブラリ。', sections:[
  S('データ・ファイル', [
    L('Papa Parse', 'CSV読み書き', 'CSVを高速・正確に読み込む（文字コード・改行・引用符の扱いも）。', [], 'https://www.papaparse.com/', 'npm i papaparse'),
    L('SheetJS', 'Excel読み書き', 'Excelファイル（xlsx）の読み込み・書き出しをブラウザで。', [], 'https://sheetjs.com/'),
    L('jsPDF / pdf-lib / react-pdf', 'PDF', 'PDFの生成・編集・表示。請求書や証明書の発行に。'),
    L('html2canvas / html-to-image', '画面を画像に', 'ページの一部をPNG画像にする。SNSシェア用の画像作成などに。'),
    L('Day.js / date-fns', '日付', '日付の計算・書式。標準のIntlで足りない計算（何日後、月末など）に。', [], 'https://day.js.org/', 'npm i dayjs'),
    L('Fuse.js', 'あいまい検索', '多少の打ち間違いでもヒットする検索。', [], 'https://www.fusejs.io/'),
    L('nanoid', 'ID生成', '短くて衝突しにくいIDを生成。', [], null, 'npm i nanoid'),
  ]),
  S('入力・操作', [
    L('SortableJS / dnd-kit', 'ドラッグ&ドロップ', 'リストの並べ替え・カンバンボード。dnd-kitはReact向け。', [], 'https://sortablejs.github.io/Sortable/'),
    L('Tiptap / Quill', 'リッチテキストエディタ', '太字・見出し・画像などを入力できるエディタ。'),
    L('Marked / markdown-it', 'Markdown表示', 'MarkdownをHTMLに変換。サニタイズ（DOMPurify）と組み合わせる。'),
    L('Shiki / Prism', 'コードの色分け', 'ブログのコードブロックをシンタックスハイライト。'),
    L('html5-qrcode / qrcode', 'QRコード', 'カメラでQRを読み取る／QRを生成する。'),
    L('i18next / next-intl', '多言語化', 'アプリの文言を言語ごとに切り替える。'),
  ]),
  S('通信・リアルタイム', [
    L('Socket.IO', 'リアルタイム通信', 'チャット・共同編集・対戦ゲーム。', [], 'https://socket.io/'),
    L('Vercel AI SDK', 'AI連携', 'AIのストリーミング応答・ツール呼び出し・チャットUIを簡単に。複数のAI APIに対応。', ['AIアプリに'], 'https://ai-sdk.dev/', 'npm i ai'),
    L('Axios / ky', 'HTTP通信', 'fetchをより便利にしたライブラリ（自動JSON変換・リトライ等）。今は標準のfetchで十分なことも多い。'),
  ]),
]});

TABS.push({ id:'tools', label:'開発ツール', icon:'⌨', intro:'開発をする上で手元に入れておく道具。', sections:[
  S('必須ツール', [
    L('VS Code', 'コードエディタ', '無料で拡張機能が豊富な定番エディタ。日本語化も可能。', ['定番'], 'https://code.visualstudio.com/'),
    L('Git / GitHub Desktop', 'バージョン管理', 'コマンドが苦手ならGitHub Desktop（画面操作）から始めても良い。', [], 'https://desktop.github.com/'),
    L('Node.js（LTS版）', 'JS実行環境', '偶数のLTS（長期サポート）版を入れる。複数バージョンを切り替えるなら fnm / Volta / nvm。', [], 'https://nodejs.org/'),
    L('Python ＋ uv', 'Python環境', 'uvは仮想環境・パッケージ管理を高速にまとめて行える新しい定番ツール。', [], 'https://docs.astral.sh/uv/', 'uv init my-app\nuv add pandas'),
    L('pnpm', 'パッケージ管理', 'npmより高速でディスクを節約。', [], 'https://pnpm.io/'),
    L('GitHub CLI（gh）', 'GitHub操作', 'ログイン・PR作成・リポジトリ作成をコマンドで。認証トラブルも減る。', [], 'https://cli.github.com/'),
  ]),
  S('品質・テスト', [
    L('ESLint / Prettier / Biome', 'コードチェック・整形', 'Biomeは両方の機能を1つにまとめた高速ツール。'),
    L('Vitest / Jest', '単体テスト', '関数や部品の動作を自動でテスト。Vite環境ならVitest。', [], 'https://vitest.dev/'),
    L('Playwright', 'E2Eテスト・ブラウザ自動操作', '実際のブラウザを自動で操作してテスト。スクリーンショット撮影や作業の自動化にも。', ['おすすめ'], 'https://playwright.dev/', 'npm init playwright@latest'),
    L('Lighthouse', '品質診断', 'Chromeに内蔵。表示速度・アクセシビリティ・SEOを点数で診断。', [], 'https://developer.chrome.com/docs/lighthouse'),
  ]),
  S('Pythonのデータ・自動化ライブラリ', [
    L('pandas / Polars', '表データ処理', 'CSV・Excelの集計・加工。Polarsは大きなデータでも高速。'),
    L('matplotlib / seaborn / Plotly', 'グラフ', 'データ分析のグラフ。日本語表示は japanize-matplotlib。'),
    L('Requests / httpx', 'HTTP通信', 'APIを呼ぶ定番。'),
    L('BeautifulSoup / Playwright', 'Webページの解析・自動操作', 'HTMLから情報を取り出す／ブラウザを自動操作する（利用規約を守る）。'),
    L('Pillow / OpenCV', '画像処理', 'リサイズ・変換（Pillow）、顔検出や映像解析（OpenCV）。'),
    L('openpyxl / python-docx / python-pptx', 'Office文書', 'Excel・Word・PowerPointをPythonで作成・編集。'),
    L('schedule / APScheduler', '定期実行', 'Pythonスクリプトを決まった時間に実行。'),
  ]),
]});
})();
