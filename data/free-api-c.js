/* 無料API辞典 — C: バックエンド(BaaS) / 通知・連携 / 音声・画像AI / ブラウザ内蔵API */
(function(){
TABS.push({
  id:'baas', label:'DB・認証・ストレージ', icon:'⛁',
  intro:'ログイン機能・データ保存・ファイル保存を<b>自分でサーバーを作らずに</b>使えるサービス（BaaS：Backend as a Service）。多くは無料枠で個人アプリなら十分まかなえます。無料枠の条件（休止・上限）は変わるので公式で確認を。',
  sections:[
    { title:'まとめて使えるBaaS', layout:'rows', items:[
      API({ name:'Supabase', host:'supabase.com', key:'必要（プロジェクトのURLとキー）', free:'無料プランあり（一定期間アクセスがないと休止）', cors:'○（anonキー＋RLSで保護）', tags:['PostgreSQL','認証','ストレージ','リアルタイム'], url:'https://supabase.com/',
        desc:'PostgreSQLのDB・認証（メール/Google/GitHub）・ファイル保存・リアルタイム更新・Edge Functionsが揃ったオープンソースのBaaS。<b>RLS（行レベルセキュリティ）で「自分のデータだけ読める」設定</b>を必ず行う。AIツールとの相性も良い。', prompt:'Supabaseでメール認証付きのメモアプリを作って。テーブルはnotes（id, user_id, title, body, created_at）で、RLSで本人のメモだけ読み書きできるようにして。',
        code:"npm install @supabase/supabase-js\n\nimport { createClient } from '@supabase/supabase-js';\nconst supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);\nconst { data, error } = await supabase.from('notes').select('*').order('created_at', { ascending: false });" }),
      API({ name:'Firebase', host:'firebase.google.com', key:'必要（設定オブジェクト）', free:'Sparkプラン（無料）あり。一部機能は従量課金のBlazeプランが必要', cors:'○（セキュリティルールで保護）', tags:['Google','Firestore','認証','ホスティング'], url:'https://firebase.google.com/',
        desc:'Googleのアプリ開発基盤。Firestore（NoSQL DB）、Authentication、Hosting、Cloud Functionsなど。<b>セキュリティルールを「誰でも読み書き可」のまま公開しない</b>こと。', prompt:'FirebaseのAuthentication（Googleログイン）とFirestoreで、ログインした人だけが自分のToDoを読み書きできるアプリを作って。セキュリティルールも書いて。' }),
      API({ name:'PocketBase', host:'pocketbase.io', free:'無料（自分のPC・サーバーで動かす）', cors:'○', tags:['1ファイルで動く','SQLite'], url:'https://pocketbase.io/',
        desc:'<b>実行ファイル1つ</b>でDB・認証・ファイル保存・管理画面・リアルタイムAPIが立ち上がる。個人開発・社内ツール・プロトタイプに最適。', prompt:'PocketBaseをローカルで起動して、posts コレクションを作り、ReactからJS SDKで一覧表示・投稿できるようにして。' }),
      API({ name:'Appwrite', host:'appwrite.io', key:'必要', free:'クラウド無料プランあり／セルフホスト可', cors:'○', tags:['オープンソース'], url:'https://appwrite.io/', desc:'DB・認証・ストレージ・関数・メッセージングを備えたオープンソースBaaS。' }),
      API({ name:'Convex', host:'convex.dev', key:'必要', free:'無料プランあり', cors:'○', tags:['TypeScript','リアルタイム'], url:'https://www.convex.dev/', desc:'TypeScriptで書いた関数がそのままバックエンドになり、データ変更が画面に自動でリアルタイム反映される。React向け。' }),
    ]},
    { title:'データベース単体', layout:'rows', items:[
      API({ name:'Neon（PostgreSQL）', host:'neon.tech', key:'接続文字列', free:'無料プランあり', cors:'サーバーから', url:'https://neon.tech/', desc:'サーバーレスのPostgreSQL。ブランチ機能でDBを複製して試せる。Vercelとの連携が簡単。' }),
      API({ name:'Turso（SQLite）', host:'turso.tech', key:'トークン', free:'無料プランあり', cors:'サーバーから', url:'https://turso.tech/', desc:'SQLite互換の分散DB（libSQL）。軽量で、エッジ環境から速く読める。' }),
      API({ name:'MongoDB Atlas', host:'mongodb.com/atlas', key:'接続文字列', free:'無料クラスター（M0）', cors:'サーバーから', url:'https://www.mongodb.com/atlas', desc:'ドキュメント型（JSONのような）DBのクラウド版。' }),
      API({ name:'Upstash（Redis / キュー）', host:'upstash.com', key:'トークン', free:'無料枠あり', cors:'○（REST API）', url:'https://upstash.com/', desc:'サーバーレスのRedis。<b>キャッシュ・レート制限・ランキング・セッション</b>に。HTTPで呼べるのでサーバーレス関数と好相性。' }),
      API({ name:'Cloudflare D1 / KV / R2', host:'developers.cloudflare.com', key:'Cloudflareアカウント', free:'Workers無料プラン内で一定量', cors:'Workersから', tags:['エッジ'], url:'https://developers.cloudflare.com/', desc:'D1＝SQLite、KV＝キー値ストア、R2＝ファイル保存（転送量無料が特徴）。Workersと組み合わせて完全サーバーレスなアプリに。' }),
      { name:'ブラウザ内に保存する', en:'localStorage / IndexedDB', tags:['無料','サーバー不要'], desc:'個人用ツールなら、<b>ブラウザ内の保存領域</b>で十分なことも多い。ただし端末間で共有できず、ブラウザのデータ削除で消える。（「ブラウザ内蔵API」タブ参照）', prompt:'まずはサーバーなしでlocalStorageに保存する形で作って、後からSupabaseに移行しやすいように保存処理を1つのモジュールにまとめて。' },
    ]},
    { title:'認証（ログイン）', layout:'rows', items:[
      API({ name:'Clerk', host:'clerk.com', key:'必要', free:'一定のMAU（月間利用者）まで無料', cors:'○', tags:['UI付き','Next.js'], url:'https://clerk.com/', desc:'ログイン画面・ユーザー管理画面がコンポーネントで提供される認証サービス。数行でソーシャルログインが付く。' }),
      API({ name:'Auth0', host:'auth0.com', key:'必要', free:'無料プランあり', cors:'○', url:'https://auth0.com/', desc:'老舗の認証サービス。企業向け機能（SSO・多要素認証）も豊富。' }),
      API({ name:'Auth.js / Better Auth', host:'authjs.dev / better-auth.com', free:'無料（ライブラリ）', cors:'—', tags:['自前で持つ'], url:'https://authjs.dev/', try:false, desc:'外部サービスに頼らず、自分のアプリ内に認証を組み込むライブラリ。ユーザー情報は自分のDBに保存。' }),
    ]},
    { title:'ファイル・画像の保存と変換', layout:'rows', items:[
      API({ name:'Cloudinary', host:'cloudinary.com', key:'必要', free:'無料プラン（月ごとのクレジット）', cors:'○（署名なしアップロード設定）', tags:['画像変換','動画'], url:'https://cloudinary.com/', desc:'画像・動画の保存・配信に加え、<b>URLの指定だけでリサイズ・切り抜き・形式変換・背景除去</b>ができる。' }),
      API({ name:'UploadThing', host:'uploadthing.com', key:'必要', free:'無料枠あり', cors:'○', tags:['Next.js'], url:'https://uploadthing.com/', desc:'Next.js/Reactでのファイルアップロードを簡単にするサービス。' }),
      API({ name:'Supabase Storage / Firebase Storage / Cloudflare R2', host:'各社', key:'必要', free:'各サービスの無料枠', try:false, url:'https://supabase.com/docs/guides/storage', desc:'BaaSに付属するファイル保存。ユーザーのプロフィール画像や添付ファイルの保存先に。公開/非公開（署名付きURL）を使い分ける。' }),
    ]},
  ]
});

TABS.push({
  id:'notify', label:'通知・メール・連携', icon:'✉',
  intro:'メール送信、チャットへの通知、カレンダーやスプレッドシートとの連携。<b>「何かが起きたら自分に知らせる」仕組み</b>は、個人の自動化ツールで最もよく使われます。',
  sections:[
    { title:'チャット・プッシュ通知', layout:'rows', items:[
      API({ name:'Discord Webhook', host:'discord.com', key:'Webhook URL（チャンネル設定で発行）', free:'無料', cors:'サーバーから推奨（URLが漏れると誰でも投稿可能）', tags:['一番かんたん'], url:'https://support.discord.com/hc/ja/articles/228383668',
        desc:'チャンネルにWebhook URLを作り、そこへJSONをPOSTするだけでメッセージを投稿できる。<b>自分用の通知先として最も手軽</b>。', prompt:'毎朝8時にOpen-Meteoで天気を取得して、Discord Webhookに「今日の天気」として投稿するスクリプトをGitHub Actionsで定期実行して。',
        code:"await fetch(process.env.DISCORD_WEBHOOK_URL, {\n  method: 'POST', headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ content: '処理が完了しました ✅' })\n});" }),
      API({ name:'Slack Incoming Webhooks', host:'api.slack.com', key:'Webhook URL', free:'無料', cors:false, url:'https://api.slack.com/messaging/webhooks', desc:'Slackのチャンネルに通知を送る。Block Kitでボタンや画像付きのリッチなメッセージも作れる。' }),
      API({ name:'LINE Messaging API', host:'developers.line.biz', key:'必要（公式アカウント・チャネル作成）', jp:true, free:'無料プランは月200通程度まで', cors:false, tags:['LINE Notifyの後継'], url:'https://developers.line.biz/ja/services/messaging-api/',
        desc:'LINE公式アカウントからメッセージを送ったり、チャットボットを作ったりできる。<b>終了したLINE Notifyの代わり</b>に使う。', prompt:'LINE Messaging APIで、自分のLINE公式アカウントに話しかけるとGemini APIが返信するチャットボットを、Cloudflare Workersで作って。' }),
      API({ name:'Telegram Bot API', host:'core.telegram.org/bots', key:'ボットトークン', free:'無料', cors:'○', url:'https://core.telegram.org/bots/api', desc:'ボットの作成・メッセージ送信が無料・無制限に近い。海外では通知先の定番。' }),
      API({ name:'ntfy', host:'ntfy.sh', free:'無料（公開トピック）／セルフホスト可', cors:true, tags:['スマホに通知'], url:'https://ntfy.sh/', try:false,
        desc:'URLにPOSTするだけで<b>スマホにプッシュ通知</b>が届く（ntfyアプリで購読）。トピック名は推測されにくい文字列にする（公開されるため）。', code:"await fetch('https://ntfy.sh/my-secret-topic-8x2k', { method: 'POST', body: 'バックアップが完了しました' });" }),
      { name:'Web Push（ブラウザ通知）', en:'Push API + Service Worker', tags:['無料','PWA'], desc:'自分のWebアプリから、<b>ブラウザを閉じていても</b>通知を送れる仕組み。VAPIDキーとService Workerが必要。iPhoneはホーム画面に追加したPWAで対応。', prompt:'PWAにWeb Push通知を実装して。VAPIDキーの生成、購読情報の保存、サーバーからweb-pushライブラリで送信するところまで。' },
    ]},
    { title:'メール・フォーム', layout:'rows', items:[
      API({ name:'Resend', host:'resend.com', key:'必要', free:'月3,000通・1日100通程度', cors:false, tags:['開発者に人気','React Email'], url:'https://resend.com/', desc:'シンプルなメール送信API。独自ドメインの設定（DNS）で到達率を上げる。React Emailでメールのデザインを作れる。', prompt:'お問い合わせフォームの送信内容を、Resendで自分のメールアドレスに送るAPIをNext.jsで作って。' }),
      API({ name:'Brevo（旧Sendinblue）', host:'brevo.com', key:'必要', free:'1日300通', cors:false, url:'https://www.brevo.com/', desc:'メール送信とメールマガジン配信。管理画面からテンプレート作成も可能。' }),
      API({ name:'EmailJS', host:'emailjs.com', key:'公開キー', free:'月200通', cors:true, tags:['サーバー不要'], url:'https://www.emailjs.com/', desc:'<b>サーバーなしで、ブラウザから直接</b>メールを送れる（Gmail等と連携）。静的サイトの問い合わせフォームに。' }),
      API({ name:'Formspree', host:'formspree.io', free:'月50件', cors:'○', tags:['HTMLだけでOK'], url:'https://formspree.io/', desc:'HTMLフォームのaction先に指定するだけで、送信内容がメールで届く。', code:'<form action="https://formspree.io/f/あなたのID" method="POST">\n  <input name="email" type="email"><textarea name="message"></textarea><button>送信</button>\n</form>' }),
    ]},
    { title:'Google・Notionなどとの連携', layout:'rows', items:[
      API({ name:'Google Sheets API', host:'developers.google.com/sheets', key:'OAuth または サービスアカウント', free:'無料（回数制限あり）', cors:'○（OAuth）', url:'https://developers.google.com/sheets/api', desc:'スプレッドシートの読み書き。簡易DBやレポート出力先に。手軽さ重視なら「開発・テスト用」タブのApps Scriptを使う方法も。' }),
      API({ name:'Google Calendar API', host:'developers.google.com/calendar', key:'OAuth', free:'無料', url:'https://developers.google.com/calendar', desc:'予定の取得・作成。予約システムやシフト表との連携に。' }),
      API({ name:'Notion API', host:'developers.notion.com', key:'インテグレーションのトークン', free:'無料', cors:false, url:'https://developers.notion.com/', desc:'Notionのデータベースやページの読み書き。<b>NotionをCMS（ブログの管理画面）として使う</b>構成が人気。', prompt:'NotionのデータベースをCMSにして、公開ステータスの記事だけをNext.jsのブログに表示して。' }),
      API({ name:'Airtable API', host:'airtable.com/developers', key:'個人アクセストークン', free:'無料プランは回数制限あり', cors:'○', url:'https://airtable.com/developers/web/api/introduction', desc:'表計算とDBの中間のようなサービス。ノーコードで作った表をAPIで読み書きできる。' }),
      API({ name:'GitHub Actions（定期実行）', host:'docs.github.com/actions', free:'公開リポジトリは無料、非公開は月ごとの無料時間', try:false, tags:['cron','無料サーバー代わり'], url:'https://docs.github.com/actions', desc:'APIそのものではないが、<b>スクリプトを毎日決まった時間に無料で実行</b>できる。「APIで取得→通知」の自動化の実行場所として最適。', code:"# .github/workflows/daily.yml\non:\n  schedule: [{ cron: '0 23 * * *' }]   # 毎日 8:00 JST（UTCで指定）\njobs:\n  run:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: node daily.js\n        env: { DISCORD_WEBHOOK_URL: '${{ secrets.DISCORD_WEBHOOK_URL }}' }" }),
    ]},
  ]
});

TABS.push({
  id:'voice', label:'音声・画像AI', icon:'◉',
  intro:'音声合成（読み上げ）・音声認識（文字起こし）・画像認識・OCR・背景除去など。<b>ブラウザ内蔵機能やローカルで無料で動くもの</b>も多いので、まずはそちらから試すのがおすすめです。',
  sections:[
    { title:'音声合成（読み上げ）', layout:'rows', items:[
      { name:'Web Speech API（読み上げ）', en:'speechSynthesis（ブラウザ内蔵）', tags:['キー不要','無料','日本語OK'], desc:'ブラウザに最初から入っている読み上げ機能。<b>1行で日本語を読み上げられる</b>。声の種類はOS・ブラウザに依存。下の「ブラウザ内蔵API」タブで試せる。', code:"const u = new SpeechSynthesisUtterance('こんにちは');\nu.lang = 'ja-JP'; u.rate = 1.0;\nspeechSynthesis.speak(u);" },
      API({ name:'VOICEVOX', host:'voicevox.hiroshiba.jp', jp:true, free:'無料（ローカルで動作・クレジット表記必須）', cors:'○（localhost:50021）', tags:['キャラクターボイス','商用可（規約に従う）'], url:'https://voicevox.hiroshiba.jp/', try:false,
        desc:'無料の日本語音声合成ソフト。起動すると <code>http://localhost:50021</code> にAPIが立ち、自作アプリから<b>ずんだもん等のキャラクターボイス</b>で読み上げられる。動画のナレーションにも人気。「VOICEVOX:キャラ名」の表記が必要。', prompt:'ローカルのVOICEVOX ENGINE（localhost:50021）を使って、入力したテキストを指定のキャラクターで読み上げてWAVで保存するPythonスクリプトを書いて。',
        code:"// 1) 音声合成用のクエリを作る → 2) 合成する\nconst q = await (await fetch('http://localhost:50021/audio_query?speaker=3&text=' + encodeURIComponent('こんにちは'), { method:'POST' })).json();\nconst wav = await (await fetch('http://localhost:50021/synthesis?speaker=3', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(q) })).blob();\nnew Audio(URL.createObjectURL(wav)).play();" }),
      API({ name:'AivisSpeech / COEIROINK', host:'aivis-project.com / coeiroink.com', jp:true, free:'無料（ローカル）', cors:'○（localhost）', try:false, url:'https://aivis-project.com/', desc:'VOICEVOX互換のAPIを持つ日本語音声合成ソフト。感情豊かな声や別のキャラクターを使える。' }),
      API({ name:'ElevenLabs', host:'elevenlabs.io', key:'必要', free:'月ごとの無料クレジット（非商用・クレジット表記）', cors:false, tags:['高品質','多言語','声のクローン'], url:'https://elevenlabs.io/', desc:'非常に自然な多言語音声合成。効果音生成・音声の吹き替えも。商用利用は有料プラン。' }),
      API({ name:'Google Cloud Text-to-Speech / Azure AI Speech', host:'cloud.google.com / azure.microsoft.com', key:'必要（クラウドアカウント）', free:'毎月の無料枠あり', cors:false, tags:['△ カード登録'], try:false, url:'https://cloud.google.com/text-to-speech', desc:'大手クラウドの音声合成。日本語の声の種類が多い。無料枠を超えると課金されるので上限設定を。' }),
    ]},
    { title:'音声認識（文字起こし）', layout:'rows', items:[
      { name:'Web Speech API（音声認識）', en:'SpeechRecognition（Chrome・Edge・Safari）', tags:['キー不要','無料'], desc:'マイクの音声をリアルタイムで文字にするブラウザ機能。音声入力メモや音声コマンドに。Chromeではクラウドで処理される点に注意。', code:"const r = new (window.SpeechRecognition || window.webkitSpeechRecognition)();\nr.lang = 'ja-JP'; r.interimResults = true;\nr.onresult = e => console.log([...e.results].map(x => x[0].transcript).join(''));\nr.start();" },
      API({ name:'Whisper（ローカル・オープンソース）', host:'github.com/openai/whisper', free:'無料（自分のPCで動作）', cors:'—', tags:['高精度','日本語OK'], url:'https://github.com/SYSTRAN/faster-whisper', try:false, desc:'OpenAIが公開した高精度の音声認識モデル。faster-whisperやwhisper.cppを使えば普通のPCでも実用的な速度。動画の字幕作成に。' }),
      API({ name:'Gemini API（音声入力）', host:'ai.google.dev', key:'必要', free:'無料枠あり', cors:false, try:false, url:'https://ai.google.dev/', desc:'音声ファイルを渡して文字起こし・要約・話者ごとの整理まで一度に頼める。議事録アプリに。' }),
    ]},
    { title:'画像の認識・加工', layout:'rows', items:[
      API({ name:'Tesseract.js（OCR）', host:'tesseract.projectnaptha.com', free:'無料（ブラウザ内で動作）', cors:'—', tags:['日本語対応','サーバー不要'], url:'https://tesseract.projectnaptha.com/', try:false, desc:'画像の中の文字を読み取るOCRを<b>ブラウザ内だけで</b>実行できる。日本語（jpn）にも対応。レシート読み取りなどの試作に。精度重視ならAI（Gemini等）の画像入力の方が高い。', code:"import Tesseract from 'tesseract.js';\nconst { data } = await Tesseract.recognize(file, 'jpn');\nconsole.log(data.text);" }),
      API({ name:'MediaPipe（顔・手・姿勢の検出）', host:'ai.google.dev/edge/mediapipe', free:'無料（ブラウザ・スマホ内で動作）', cors:'—', tags:['リアルタイム','カメラ'], url:'https://ai.google.dev/edge/mediapipe/solutions/guide', try:false, desc:'カメラ映像から<b>顔のランドマーク・手の指の位置・体の姿勢</b>をリアルタイムで検出。フィルター、ジェスチャー操作、筋トレのフォーム判定に。', prompt:'MediaPipeのHand Landmarkerで、カメラに映した手の人差し指の先で画面に絵を描けるアプリを作って。' }),
      API({ name:'Google Cloud Vision', host:'cloud.google.com/vision', key:'必要（クラウドアカウント）', free:'毎月の無料枠', cors:false, tags:['△ カード登録'], url:'https://cloud.google.com/vision', try:false, desc:'ラベル検出・OCR・顔検出・不適切画像の判定など。' }),
      API({ name:'remove.bg（背景除去）', host:'remove.bg/api', key:'必要', free:'低解像度のプレビューは毎月一定数無料', cors:false, url:'https://www.remove.bg/api', desc:'写真の背景を自動で透明にする。ECの商品写真やプロフィール画像に。ローカルで無料にやるなら rembg（Python）も。' }),
    ]},
  ]
});

/* ---------- ブラウザ内蔵API（ライブデモ） ---------- */
const H = VD.h;
function box(el, html){ el.innerHTML = `<div class="ba">${html}<div class="ba-out" aria-live="polite"></div></div>`; return el.querySelector('.ba-out'); }
const say = (out, msg) => { out.textContent = msg; };
TABS.push({
  id:'browser', label:'ブラウザ内蔵API', icon:'⌘',
  intro:'<b>インストール不要・APIキー不要・完全無料</b>で、ブラウザに最初から入っている機能。カメラ・位置情報・読み上げ・通知・クリップボードなどをWebアプリから使えます。見本はその場で試せます（カメラや位置情報はブラウザが許可を求めます。データはどこにも送信されません）。',
  sections:[
    { title:'声・音', items:[
      { name:'読み上げ（音声合成）', en:'Web Speech API: speechSynthesis', h:190, stage:'free', tags:['キー不要','日本語OK'],
        init:(el) => { const out = box(el, '<textarea class="ba-in" rows="2">こんにちは。バイブコーディング辞典へようこそ。</textarea><div class="ba-row"><button class="ba-btn">▶ 読み上げる</button><label class="ba-mini">速さ <input type="range" min="0.5" max="2" step="0.1" value="1"></label></div>'); el.querySelector('.ba-btn').onclick = () => { if (!('speechSynthesis' in window)) return say(out, '未対応のブラウザです'); speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(el.querySelector('.ba-in').value); u.lang = 'ja-JP'; u.rate = +el.querySelector('input[type=range]').value; speechSynthesis.speak(u); say(out, '読み上げ中…（声はOSに依存）'); u.onend = () => say(out, '完了'); }; },
        desc:'テキストを音声で読み上げる。声の種類・速さ・高さを指定できる。アクセシビリティ、語学学習、通知の読み上げに。', prompt:'英単語帳アプリに、単語と例文をspeechSynthesisで読み上げるボタンを付けて。英語はen-US、日本語訳はja-JPの声で。',
        code:"const u = new SpeechSynthesisUtterance('こんにちは');\nu.lang = 'ja-JP'; u.rate = 1.2; u.pitch = 1;\nspeechSynthesis.speak(u);" },
      { name:'音声認識（音声入力）', en:'Web Speech API: SpeechRecognition', h:190, stage:'free', tags:['Chrome・Edge・Safari'],
        init:(el) => { const out = box(el, '<div class="ba-row"><button class="ba-btn">🎤 話してみる</button></div>'); const SR = window.SpeechRecognition || window.webkitSpeechRecognition; el.querySelector('.ba-btn').onclick = () => { if (!SR) return say(out, 'このブラウザは音声認識に未対応です（Chrome/Edge推奨）'); const r = new SR(); r.lang = 'ja-JP'; r.interimResults = true; r.onresult = (e) => say(out, [...e.results].map(x => x[0].transcript).join('')); r.onerror = (e) => say(out, 'エラー: ' + e.error); r.onend = () => out.textContent += '　（終了）'; r.start(); say(out, '聞き取り中… 話しかけてください'); }; },
        desc:'マイクの音声を文字にする。音声メモ、ハンズフリー操作、会議メモに。マイクの許可が必要。', prompt:'メモアプリに音声入力ボタンを付けて、話した内容がリアルタイムでテキストエリアに入るようにして（SpeechRecognition）。未対応ブラウザではボタンを非表示に。',
        code:"const r = new (window.SpeechRecognition || window.webkitSpeechRecognition)();\nr.lang = 'ja-JP'; r.interimResults = true;\nr.onresult = e => input.value = [...e.results].map(x => x[0].transcript).join('');\nr.start();" },
      { name:'音を鳴らす・作る', en:'Web Audio API', h:150, stage:'free', tags:['効果音','シンセ'], links:[['サウンド・効果音辞典で詳しく', 'sound.html']],
        init:(el) => { const out = box(el, '<div class="ba-row"><button class="ba-btn" data-f="523">ド</button><button class="ba-btn" data-f="659">ミ</button><button class="ba-btn" data-f="784">ソ</button><button class="ba-btn" data-f="1047">ド↑</button></div>'); let ac; el.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = +b.dataset.f; o.type = 'triangle'; g.gain.setValueAtTime(.3, ac.currentTime); g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + .6); o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + .6); say(out, b.dataset.f + ' Hz'); }); },
        desc:'音声ファイルなしで、プログラムから音を生成・加工できる。効果音、楽器、音声の可視化（波形）に。', prompt:'Web Audio APIで、ボタンを押すと「ピコン」と鳴る効果音を音声ファイルなしで作って。',
        code:"const ac = new AudioContext();\nconst o = ac.createOscillator(), g = ac.createGain();\no.frequency.value = 880; g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.3);\no.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + 0.3);" },
    ]},
    { title:'カメラ・画面・位置', items:[
      { name:'カメラ・マイク', en:'MediaDevices.getUserMedia', h:220, stage:'free', tags:['許可が必要','HTTPS必須'],
        init:(el) => { const out = box(el, '<video class="ba-video" autoplay playsinline muted></video><div class="ba-row"><button class="ba-btn">📷 カメラを起動</button><button class="ba-btn ghost">停止</button></div>'); const v = el.querySelector('video'); let st = null; const [on, off] = el.querySelectorAll('.ba-btn'); on.onclick = async () => { try { st = await navigator.mediaDevices.getUserMedia({ video:true }); v.srcObject = st; say(out, '映像はこのページ内だけで表示され、送信されません'); } catch(e){ say(out, '起動できません: ' + e.name); } }; off.onclick = () => { if (st) st.getTracks().forEach(t => t.stop()); v.srcObject = null; say(out, '停止しました'); }; return () => { if (st) st.getTracks().forEach(t => t.stop()); }; },
        desc:'Webカメラやマイクの映像・音声を取得。写真撮影、バーコード読み取り、ビデオ通話（WebRTC）、AIでの姿勢検出の入口。<b>HTTPSかlocalhostでのみ動作</b>。', prompt:'スマホのカメラ（外側）を起動して、シャッターボタンで写真を撮り、Canvasに表示してダウンロードできるようにして。',
        code:"const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });\nvideo.srcObject = stream;\n// 撮影: canvas.getContext('2d').drawImage(video, 0, 0);" },
      { name:'位置情報', en:'Geolocation API', h:170, stage:'free', tags:['許可が必要'],
        init:(el) => { const out = box(el, '<div class="ba-row"><button class="ba-btn">📍 現在地を取得</button></div>'); el.querySelector('.ba-btn').onclick = () => { if (!navigator.geolocation) return say(out, '未対応'); say(out, '取得中…'); navigator.geolocation.getCurrentPosition((p) => { out.innerHTML = `緯度 ${p.coords.latitude.toFixed(5)} / 経度 ${p.coords.longitude.toFixed(5)}<br>精度 約${Math.round(p.coords.accuracy)}m（このページ内でのみ表示）`; }, (e) => say(out, '取得できません: ' + e.message), { enableHighAccuracy:true, timeout:10000 }); }; },
        desc:'端末の現在地（緯度・経度・精度）。天気・近くのお店・地図アプリの起点。<code>watchPosition</code>で移動を追跡も。', prompt:'現在地を取得して、Open-Meteoでその場所の天気を表示して。位置情報が拒否されたら東京をデフォルトにして。',
        code:"navigator.geolocation.getCurrentPosition(\n  p => console.log(p.coords.latitude, p.coords.longitude),\n  e => console.error(e.message),\n  { enableHighAccuracy: true, timeout: 10000 }\n);" },
      { name:'画面の録画・共有', en:'Screen Capture API: getDisplayMedia', h:160, stage:'free', tags:['PCのみ'],
        init:(el) => { const out = box(el, '<div class="ba-row"><button class="ba-btn">🖥 共有する画面を選ぶ</button></div>'); el.querySelector('.ba-btn').onclick = async () => { try { const s = await navigator.mediaDevices.getDisplayMedia({ video:true }); const t = s.getVideoTracks()[0]; say(out, '選択: ' + t.label + '（すぐに停止しました）'); s.getTracks().forEach(x => x.stop()); } catch(e){ say(out, 'キャンセル/未対応: ' + e.name); } }; },
        desc:'画面・ウィンドウ・タブの映像を取得。MediaRecorderと組み合わせると<b>ブラウザだけの画面録画ツール</b>が作れる。', prompt:'getDisplayMediaとMediaRecorderで、ボタン1つで画面を録画してWebMをダウンロードできるツールを作って。' },
      { name:'スポイト（画面の色を取得）', en:'EyeDropper API', h:150, stage:'free', tags:['Chrome・Edge'],
        init:(el) => { const out = box(el, '<div class="ba-row"><button class="ba-btn">💧 画面から色を拾う</button><span class="ba-swatch"></span></div>'); el.querySelector('.ba-btn').onclick = async () => { if (!window.EyeDropper) return say(out, 'このブラウザは未対応です（Chrome/Edge）'); try { const r = await new EyeDropper().open(); el.querySelector('.ba-swatch').style.background = r.sRGBHex; say(out, r.sRGBHex); } catch(e){ say(out, 'キャンセルしました'); } }; },
        desc:'画面上の任意の場所の色をスポイトで取得。カラーパレット作成ツールやデザインツールに。', prompt:'EyeDropper APIで画面から色を拾って、パレットに追加・HEXをコピーできるツールを作って。' },
    ]},
    { title:'共有・通知・端末', items:[
      { name:'クリップボード', en:'Clipboard API', h:150, stage:'free', tags:['コピーボタン'],
        init:(el) => { const out = box(el, '<div class="ba-row"><input class="ba-in" value="コピーされるテキスト"><button class="ba-btn">📋 コピー</button></div>'); el.querySelector('.ba-btn').onclick = async () => { try { await navigator.clipboard.writeText(el.querySelector('input').value); say(out, 'コピーしました。どこかに貼り付けてみて'); } catch(e){ say(out, 'コピーできません: ' + e.name); } }; },
        desc:'テキストや画像をクリップボードへコピー（読み取りは許可が必要）。「コピー」ボタン、共有リンクの発行に。この辞典の［コピー］ボタンもこれ。', code:"await navigator.clipboard.writeText('コピーする文字');" },
      { name:'共有シート', en:'Web Share API', h:150, stage:'free', tags:['スマホで便利'],
        init:(el) => { const out = box(el, '<div class="ba-row"><button class="ba-btn">↗ 共有する</button></div>'); el.querySelector('.ba-btn').onclick = async () => { if (!navigator.share) return say(out, 'このブラウザは未対応（主にスマホ・Safari・Windowsの一部で対応）'); try { await navigator.share({ title:'Vibe Coding 辞典', text:'バイブコーディング用の辞典', url:location.href }); say(out, '共有しました'); } catch(e){ say(out, 'キャンセル: ' + e.name); } }; },
        desc:'OS標準の共有メニュー（LINE・メール・AirDropなど）を開く。SNSごとのボタンを並べる必要がなくなる。', prompt:'記事ページに「共有」ボタンを付けて、Web Share API対応端末では共有シートを、未対応ならURLのコピーにフォールバックして。', code:"await navigator.share({ title: document.title, url: location.href });" },
      { name:'通知', en:'Notifications API', h:150, stage:'free', tags:['許可が必要'],
        init:(el) => { const out = box(el, '<div class="ba-row"><button class="ba-btn">🔔 通知を出す</button></div>'); el.querySelector('.ba-btn').onclick = async () => { if (!('Notification' in window)) return say(out, '未対応'); const p = await Notification.requestPermission(); if (p === 'granted'){ new Notification('Vibe Coding 辞典', { body:'通知のテストです' }); say(out, '通知を出しました'); } else say(out, '許可されていません: ' + p); }; },
        desc:'デスクトップ・スマホに通知を表示。タイマー終了、チャットの新着など。ページを閉じても届けるにはService Worker＋Push APIが必要。', prompt:'ポモドーロタイマーで、25分経ったらNotifications APIで通知を出して音を鳴らして。', code:"if (await Notification.requestPermission() === 'granted') new Notification('時間です', { body: '休憩しましょう' });" },
      { name:'バイブレーション', en:'Vibration API', h:140, stage:'free', tags:['Androidのみ'],
        init:(el) => { const out = box(el, '<div class="ba-row"><button class="ba-btn">📳 振動させる</button></div>'); el.querySelector('.ba-btn').onclick = () => { if (!navigator.vibrate) return say(out, '未対応（iPhone・PCは非対応）'); navigator.vibrate([100, 60, 100, 60, 300]); say(out, 'ブルッ（対応端末のみ）'); }; },
        desc:'スマホを振動させる。ゲームの被ダメージ、タイマー、エラーのフィードバックに。iPhoneのSafariは非対応。', code:'navigator.vibrate([100, 50, 100]); // 振動100ms・停止50ms・振動100ms' },
      { name:'全画面表示', en:'Fullscreen API', h:140, stage:'free', tags:['ゲーム・スライド'],
        init:(el) => { const out = box(el, '<div class="ba-row"><button class="ba-btn">⛶ この枠を全画面に</button></div>'); el.querySelector('.ba-btn').onclick = async () => { try { await el.querySelector('.ba').requestFullscreen(); say(out, 'Escで戻ります'); } catch(e){ say(out, '未対応: ' + e.name); } }; },
        desc:'要素を画面いっぱいに表示。ゲーム、動画プレーヤー、プレゼン、写真ビューアに。', code:'await element.requestFullscreen();\nawait document.exitFullscreen();' },
      { name:'画面を消さない', en:'Screen Wake Lock API', h:140, stage:'free', tags:['レシピ・タイマー'],
        init:(el) => { const out = box(el, '<div class="ba-row"><button class="ba-btn">☀ 画面をつけたままにする</button></div>'); let lock = null; el.querySelector('.ba-btn').onclick = async () => { if (!('wakeLock' in navigator)) return say(out, '未対応'); try { if (lock){ await lock.release(); lock = null; return say(out, '解除しました'); } lock = await navigator.wakeLock.request('screen'); say(out, 'オン：このタブを表示中は画面がスリープしません（もう一度押すと解除）'); } catch(e){ say(out, 'できません: ' + e.name); } }; return () => lock && lock.release(); },
        desc:'スマホの画面が自動で消えないようにする。料理レシピ、筋トレタイマー、楽譜、カーナビ的アプリに。', prompt:'料理手順を表示している間は、Wake Lock APIで画面が消えないようにして。', code:"const lock = await navigator.wakeLock.request('screen');\n// 解除: lock.release();" },
    ]},
    { title:'データ・計算・保存', items:[
      { name:'日付・数値・通貨の書式', en:'Intl API', h:200, stage:'free', tags:['ライブラリ不要','多言語'],
        init:(el) => { const now = new Date(); const rows = [
          ['日付（和暦）', new Intl.DateTimeFormat('ja-JP-u-ca-japanese', { dateStyle:'full' }).format(now)],
          ['日付（英語）', new Intl.DateTimeFormat('en-US', { dateStyle:'long', timeStyle:'short' }).format(now)],
          ['通貨', new Intl.NumberFormat('ja-JP', { style:'currency', currency:'JPY' }).format(1234567) + ' / ' + new Intl.NumberFormat('en-US', { style:'currency', currency:'USD' }).format(1234.5)],
          ['大きな数', new Intl.NumberFormat('ja-JP', { notation:'compact' }).format(123456789)],
          ['相対時間', new Intl.RelativeTimeFormat('ja', { numeric:'auto' }).format(-1, 'day') + ' / ' + new Intl.RelativeTimeFormat('ja').format(3, 'hour')],
          ['並べ替え', ['りんご','バナナ','あんず','かき'].sort(new Intl.Collator('ja').compare).join('・')],
        ]; el.innerHTML = '<div class="ba"><table class="ba-tbl">' + rows.map(r => `<tr><th>${r[0]}</th><td>${r[1]}</td></tr>`).join('') + '</table></div>'; },
        desc:'日付・時刻・数値・通貨・相対時間（「昨日」「3時間後」）を、言語に合わせて正しく表示する。<b>和暦</b>にも対応。日付ライブラリが不要になる場面が多い。', prompt:'投稿日時を「3時間前」「昨日」のような相対表示にして、Intl.RelativeTimeFormatを使って。ライブラリは使わずに。',
        code:"new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(1234567); // ￥1,234,567\nnew Intl.DateTimeFormat('ja-JP-u-ca-japanese', { dateStyle: 'full' }).format(new Date()); // 令和…\nnew Intl.RelativeTimeFormat('ja', { numeric: 'auto' }).format(-1, 'day'); // 昨日" },
      { name:'ID生成・ハッシュ・暗号', en:'Web Crypto API', h:170, stage:'free', tags:['セキュア'],
        init:(el) => { const out = box(el, '<div class="ba-row"><button class="ba-btn">UUIDを作る</button></div><div class="ba-row"><input class="ba-in" value="password123"><button class="ba-btn ghost">SHA-256</button></div>'); const [u, s] = el.querySelectorAll('.ba-btn'); u.onclick = () => say(out, crypto.randomUUID ? crypto.randomUUID() : '未対応（HTTPSが必要）'); s.onclick = async () => { if (!crypto.subtle) return say(out, '未対応（HTTPSが必要）'); const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(el.querySelector('input').value)); say(out, [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('')); }; },
        desc:'重複しないID（UUID）、ハッシュ値、暗号化・署名を、安全な乱数で生成。<code>Math.random()</code> をID生成に使うのは避ける。', code:"crypto.randomUUID(); // 'b3f1…-…'\nconst hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));" },
      { name:'ブラウザに保存', en:'localStorage / IndexedDB', h:150, stage:'free', tags:['サーバー不要'],
        init:(el) => { const out = box(el, '<div class="ba-row"><button class="ba-btn">＋1 して保存</button><button class="ba-btn ghost">リセット</button></div>'); const K = 'vd-demo-count'; const get = () => { try { return +(localStorage.getItem(K) || 0); } catch(e){ return 0; } }; const put = (v) => { try { localStorage.setItem(K, v); } catch(e){} say(out, `保存された値: ${v}（ページを再読み込みしても残ります）`); }; put(get()); const [a, b] = el.querySelectorAll('.ba-btn'); a.onclick = () => put(get() + 1); b.onclick = () => put(0); },
        desc:'<b>localStorage</b>＝文字列を簡単に保存（約5MB）。<b>IndexedDB</b>＝大量のデータや画像も保存できる本格的なDB（Dexie.jsなどで扱いやすく）。設定や下書き、オフラインアプリに。', prompt:'ToDoをlocalStorageに保存して、再読み込みしても消えないようにして。データ量が増えたらIndexedDB（Dexie.js）に移行できる構造で。',
        code:"localStorage.setItem('todos', JSON.stringify(todos));\nconst todos = JSON.parse(localStorage.getItem('todos') || '[]');" },
      { name:'ファイルを読み込む', en:'File API / Drag and Drop', h:170, stage:'free', tags:['アップロード不要'],
        init:(el) => { const out = box(el, '<label class="ba-drop">ここに画像をドロップ / クリックして選択<input type="file" accept="image/*" hidden></label>'); const drop = el.querySelector('.ba-drop'), inp = el.querySelector('input'); const show = (f) => { if (!f) return; const url = URL.createObjectURL(f); out.innerHTML = `<img src="${url}" style="max-height:70px;border-radius:6px;vertical-align:middle"> ${f.name}（${Math.round(f.size / 1024)}KB・送信されません）`; }; inp.onchange = () => show(inp.files[0]); drop.ondragover = (e) => { e.preventDefault(); drop.classList.add('on'); }; drop.ondragleave = () => drop.classList.remove('on'); drop.ondrop = (e) => { e.preventDefault(); drop.classList.remove('on'); show(e.dataTransfer.files[0]); }; },
        desc:'ユーザーが選んだファイルを<b>サーバーに送らずブラウザ内で</b>読み込む。画像のプレビュー・圧縮・CSVの集計・PDF表示など、プライバシーに優しいツールが作れる。', prompt:'CSVファイルをドラッグ&ドロップすると、ブラウザ内で読み込んで表とグラフにするツールを作って（PapaParse使用、サーバーには送らない）。',
        code:"input.onchange = () => {\n  const file = input.files[0];\n  img.src = URL.createObjectURL(file);      // 画像プレビュー\n  file.text().then(t => console.log(t));     // テキストとして読む\n};" },
      { name:'お絵かき・画像生成', en:'Canvas API', h:180, stage:'free', tags:['グラフィック'],
        init:(el) => { el.innerHTML = '<div class="ba" style="padding:8px"><canvas class="ba-canvas"></canvas><div class="ba-row"><span class="ba-mini">マウス・指で描けます</span><button class="ba-btn ghost">消す</button></div></div>'; const c = el.querySelector('canvas'); const r = c.getBoundingClientRect(); c.width = r.width * 2; c.height = r.height * 2; const ctx = c.getContext('2d'); ctx.scale(2, 2); ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent'); let d = false; const p = (e) => { const b = c.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; }; c.onpointerdown = (e) => { d = true; ctx.beginPath(); ctx.moveTo(...p(e)); c.setPointerCapture(e.pointerId); }; c.onpointermove = (e) => { if (!d) return; ctx.lineTo(...p(e)); ctx.stroke(); }; c.onpointerup = () => d = false; el.querySelector('.ba-btn').onclick = () => ctx.clearRect(0, 0, c.width, c.height); },
        desc:'JavaScriptで絵・図形・文字・画像を描くキャンバス。ゲーム、お絵かき、グラフ、画像の加工・合成、OGP画像の生成に。', prompt:'Canvasでお絵かきアプリを作って。ペンの色と太さを選べて、消しゴム・元に戻す・PNGで保存ができるように。' },
    ]},
    { title:'その他の内蔵API（一覧）', layout:'rows', items:[
      { name:'Service Worker / PWA', en:'オフライン・ホーム画面に追加', tags:['アプリ化'], desc:'Webアプリをオフラインで動かしたり、スマホのホーム画面にアプリとして追加したりできる。manifest.json と Service Worker が必要。', prompt:'このWebアプリをPWAにして。manifest.json、アイコン、オフライン時もトップページが表示されるService Workerを追加して。' },
      { name:'WebSocket / Server-Sent Events', en:'リアルタイム通信', desc:'サーバーとつなぎっぱなしにして、チャットやゲーム、株価などを<b>リアルタイム</b>に受け取る。AIの文字が流れるように表示されるストリーミングはSSEが多い。' },
      { name:'WebRTC', en:'ブラウザ同士の直接通信', desc:'ビデオ通話・画面共有・ファイル転送をブラウザ同士で直接行う。接続の仲介（シグナリング）にはサーバーが必要。' },
      { name:'Web Workers', en:'重い処理を裏で実行', desc:'画像処理や大量計算を別スレッドで動かし、<b>画面が固まるのを防ぐ</b>。' },
      { name:'IntersectionObserver / ResizeObserver', en:'要素の表示・サイズの監視', desc:'要素が画面に入ったか（スクロール演出・無限スクロール・遅延読み込み）、サイズが変わったかを効率よく検知。（Webデザイン辞典のスクロール演出参照）' },
      { name:'Page Visibility API', en:'タブが見えているか', desc:'タブが裏に回ったら動画やゲームを一時停止、戻ったら再開。' },
      { name:'BroadcastChannel', en:'タブ間の通信', desc:'同じサイトを開いている複数のタブ間でメッセージをやり取り。ログアウトを全タブに反映するなど。' },
      { name:'Device Orientation / Motion', en:'傾き・加速度', desc:'スマホの傾きや振りを検知。傾けて操作するゲーム、歩数計、方位（コンパス）に。iPhoneは許可のリクエストが必要。' },
      { name:'Gamepad API', en:'ゲームコントローラー', desc:'USB/BluetoothのゲームパッドをWebゲームで使える。' },
      { name:'Web Bluetooth / WebUSB / Web Serial / Web MIDI', en:'機器との接続（主にChrome）', desc:'マイコン（Arduino・micro:bit）、センサー、MIDIキーボードなどとブラウザから直接通信できる。IoTやハードウェア連携に。' },
      { name:'Barcode Detection API', en:'バーコード・QR読み取り（一部ブラウザ）', desc:'カメラ映像からQRコードやバーコードを読み取る。未対応環境ではライブラリ（html5-qrcode、ZXing）を使う。' },
      { name:'Picture-in-Picture', en:'小窓再生', desc:'動画を小さなウィンドウで常に手前に表示。' },
      { name:'Media Session API', en:'ロック画面の再生コントロール', desc:'音楽・Podcastアプリで、ロック画面やイヤホンのボタンから再生・停止・曲送りを操作できるようにする。' },
      { name:'WebAuthn（パスキー）', en:'パスワードなしログイン', desc:'指紋・顔認証・端末のPINでログインする仕組み。フィッシングに強い。' },
      { name:'File System Access API', en:'ローカルファイルの直接編集（Chrome）', desc:'ユーザーのPCのファイルやフォルダを開いて上書き保存できる。Webでテキストエディタや画像編集ソフトを作れる。' },
      { name:'WebGPU / WebGL', en:'GPUで描画・計算', desc:'3Dグラフィックスや、ブラウザ内でのAI推論を高速化する。Three.jsやTransformers.jsが内部で使う。' },
      { name:'Popover API / <dialog>', en:'ポップアップ・モーダルを標準機能で', desc:'JSなし（またはわずか）でポップオーバーやモーダルダイアログを作れる。フォーカス管理やEscキーで閉じる動作も標準で付く。（UIコンポーネント辞典参照）' },
    ]},
  ]
});
})();
