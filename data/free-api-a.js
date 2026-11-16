/* 無料API辞典 — A: 基本 / AI / 天気・自然 / 地図・位置 / 日本の公共データ */
(function(){
// APIの項目を作るヘルパー
window.API = function(o){
  const tags = [];
  tags.push(o.key ? '要登録・キー' : 'キー不要');
  if (o.cors === true) tags.push('ブラウザから直接OK');
  if (o.cors === false) tags.push('△ サーバー経由');
  if (o.jp) tags.push('日本語・日本向け');
  if (o.unofficial) tags.push('非公式');
  (o.tags || []).forEach(t => tags.push(t));
  const meta = [['APIキー', o.key || '不要']];
  if (o.free) meta.push(['無料枠・制限', o.free]);
  meta.push(['ブラウザ直接', o.cors === true ? '○（CORS対応）' : o.cors === false ? '×（サーバー・バックエンドから呼ぶ）' : (o.cors || '要確認')]);
  if (o.terms) meta.push(['条件', o.terms]);
  let code = o.code;
  if (!code && o.ep) code = `const res = await fetch('${o.ep}');\nconst data = await res.json();\nconsole.log(data);`;
  const it = { name:o.name, en:o.host, desc:o.desc, tags, meta, url:o.url, prompt:o.prompt, code, codeLabel:o.codeLabel || '呼び出し例', links:o.links };
  if (o.try) it.try = typeof o.try === 'string' ? { url:o.try } : o.try;
  else if (o.try !== false && o.ep && !o.key && o.cors === true) it.try = { url:o.ep };
  return it;
};

TABS.push({
  id:'basics', label:'APIの基本', icon:'?',
  intro:'API（エーピーアイ）＝<b>他のサービスの機能やデータを、プログラムから呼び出す窓口</b>。天気・地図・翻訳・AIなどを自分のアプリに組み込めます。まずは用語を押さえると、AIへの指示やエラーの意味が分かりやすくなります。世界中の無料APIの一覧は <a href="https://github.com/public-apis/public-apis" target="_blank" rel="noopener">public-apis</a> も便利です。',
  sections:[
    { title:'知っておくべき用語', layout:'rows', items:[
      { name:'エンドポイント', en:'Endpoint', desc:'APIの住所（URL）。例：<code>https://api.open-meteo.com/v1/forecast</code>。末尾に <code>?latitude=35.68&longitude=139.76</code> のように<b>パラメータ（条件）</b>を付けて呼ぶ。' },
      { name:'リクエストとレスポンス', en:'Request / Response', desc:'こちらから送るお願いがリクエスト、返ってくる答えがレスポンス。<b>GET</b>＝取得、<b>POST</b>＝送信・作成、<b>PUT/PATCH</b>＝更新、<b>DELETE</b>＝削除。', prompt:'このAPIのドキュメントを読んで、GETで一覧取得・POSTで新規作成する関数を作って。' },
      { name:'JSON', en:'JavaScript Object Notation', desc:'ほとんどのAPIが返すデータの形式。<code>{"name": "東京", "temp": 21.5}</code> のように<b>名前と値の組</b>で表す。', prompt:'このAPIのレスポンス（JSON）を貼るので、画面に表示するのに必要な項目だけ取り出す処理を書いて。' },
      { name:'APIキー', en:'API Key / Token', desc:'利用者を識別する合言葉。<b>他人に知られると勝手に使われ、課金されることもある</b>。GitHubに上げない、HTMLやフロントのJSに直接書かない。', tags:['超重要'], prompt:'APIキーをコードに直接書かず、.envファイルから読み込むようにして。.envは.gitignoreに追加して。' },
      { name:'環境変数（.env）', en:'Environment Variables', desc:'APIキーなどの秘密情報をコードの外に置く仕組み。<code>.env</code> に <code>OPENWEATHER_KEY=xxxx</code> と書き、コードからは <code>process.env.OPENWEATHER_KEY</code> で読む。Viteでブラウザに出す値は <code>VITE_</code> で始める（＝公開される）点に注意。', code:'# .env（Gitには含めない）\nOPENWEATHER_KEY=xxxxxxxx\n\n// Node.js\nconst key = process.env.OPENWEATHER_KEY;' },
      { name:'CORS（コルス）', en:'Cross-Origin Resource Sharing', desc:'ブラウザのセキュリティ機能。<b>APIが許可していないと、ブラウザのJSから直接呼べない</b>（サーバーからなら呼べる）。この辞典では「ブラウザ直接」欄で対応状況を示している。エラーに「CORS」と出たらこれ。', tags:['よくハマる'], prompt:'ブラウザからこのAPIを呼ぶとCORSエラーになるので、Vercel（またはCloudflare Workers）にサーバーレス関数を作って、そこ経由で呼ぶように変更して。' },
      { name:'プロキシ／バックエンド経由', en:'Proxy / Serverless Function', desc:'APIキーを隠す・CORSを回避するために、<b>自分のサーバー（またはサーバーレス関数）を間に挟む</b>構成。Vercel Functions、Cloudflare Workers、Netlify Functions、Firebase Functions などで無料で作れる。', code:"// Cloudflare Workers の例：キーを隠してAPIを中継\nexport default {\n  async fetch(req, env) {\n    const q = new URL(req.url).searchParams.get('q');\n    const r = await fetch(`https://api.example.com/search?q=${q}&key=${env.API_KEY}`);\n    return new Response(r.body, { headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' } });\n  }\n};" },
      { name:'レート制限', en:'Rate Limit', desc:'「1分に60回まで」「1日1,000回まで」などの回数制限。超えると <b>429 Too Many Requests</b> エラー。キャッシュ（結果を一時保存）して呼ぶ回数を減らすのが基本。', prompt:'APIのレート制限（1分60回）を超えないように、同じ検索の結果を10分間localStorageにキャッシュして。' },
      { name:'無料枠の落とし穴', en:'Free Tier Pitfalls', desc:'「無料枠あり」でも<b>クレジットカード登録が必須で、超過すると自動課金</b>されるサービス（Google Cloud、AWS、Google Maps など）がある。予算アラート・上限設定を必ずする。商用利用不可・クレジット表記必須の無料APIも多い。', tags:['注意'] },
      { name:'REST と GraphQL', en:'REST / GraphQL', desc:'<b>REST</b>＝URLごとにデータの種類が決まっている一般的な方式。<b>GraphQL</b>＝1つのURLに「欲しい項目」を書いて問い合わせる方式（AniList、GitHub v4、Shopify など）。' },
      { name:'Webhook（ウェブフック）', en:'Webhook', desc:'こちらから聞きに行くのではなく、<b>何か起きたときに相手から通知（POST）が届く</b>仕組み。決済完了、フォーム送信、GitHubのpushなど。' },
      { name:'SDK', en:'Software Development Kit', desc:'APIを簡単に使うための公式ライブラリ。<code>npm install openai</code> のように入れると、URLを直接書かなくても関数で呼べる。' },
      { name:'利用規約・クレジット表記', en:'Terms / Attribution', desc:'無料APIの多くは<b>「データ提供元の表記」</b>（例：© OpenStreetMap contributors、出典：国土地理院）が条件。商用利用の可否も必ず確認する。' },
    ]},
  ]
});

TABS.push({
  id:'ai', label:'AI・LLM', icon:'✧',
  intro:'文章生成・要約・翻訳・画像認識などのAIをアプリに組み込むAPI。<b>完全無料は少なく、多くは「回数制限付きの無料枠」</b>です。APIキーはブラウザに置かず、必ずサーバー経由で呼びます。モデル名や無料枠は頻繁に変わるため、利用前に公式ページを確認してください。',
  sections:[
    { title:'無料枠のあるAI API', layout:'rows', items:[
      API({ name:'Google Gemini API', host:'ai.google.dev（Google AI Studio）', key:'必要（Googleアカウントで即発行）', free:'モデルごとに1分・1日あたりの回数制限付きで無料', cors:false, tags:['無料枠が大きい','画像・音声も可'], url:'https://ai.google.dev/',
        desc:'GoogleのGeminiモデルを使えるAPI。<b>無料枠が比較的大きく、個人開発の入門に最適</b>。テキスト・画像・音声・PDFの入力に対応。無料枠では入力データがサービス改善に使われる場合がある点に注意。',
        prompt:'Gemini APIを使って、入力した文章を3行に要約するAPIエンドポイントをNext.jsのRoute Handlerで作って。APIキーは環境変数 GEMINI_API_KEY から読んで。',
        code:"npm install @google/genai\n\nimport { GoogleGenAI } from '@google/genai';\nconst ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });\nconst res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: 'こんにちは' });\nconsole.log(res.text);" }),
      API({ name:'Groq', host:'console.groq.com', key:'必要', free:'レート制限付きの無料枠', cors:false, tags:['超高速','OpenAI互換'], url:'https://console.groq.com/',
        desc:'専用チップでオープンモデル（Llama など）を<b>非常に高速</b>に動かすサービス。OpenAI互換のAPIなので、OpenAIのSDKのURLを差し替えるだけで使える。', prompt:'OpenAI SDKのbaseURLをGroqに向けて、オープンモデルでチャットボットを作って。' }),
      API({ name:'OpenRouter', host:'openrouter.ai', key:'必要', free:'「:free」付きの無料モデルあり（1日の回数制限）', cors:'○（ただしキーが漏れるのでサーバー推奨）', tags:['多数のモデルを1つのキーで','OpenAI互換'], url:'https://openrouter.ai/',
        desc:'数百種類のAIモデル（Claude、GPT、Gemini、Llama、Qwen、DeepSeek など）を<b>1つのAPIキー・同じ書き方で切り替えて</b>使える中継サービス。無料モデルで試してから有料モデルへ移行しやすい。' }),
      API({ name:'GitHub Models', host:'github.com/marketplace/models', key:'GitHubのトークン', free:'試作向けの無料レート制限', cors:false, tags:['GitHubアカウントで使える'], url:'https://github.com/marketplace/models',
        desc:'GitHubアカウントだけで主要なAIモデルを<b>試作用に無料で</b>呼べる。プレイグラウンドで比較してからコードに組み込める。' }),
      API({ name:'Cloudflare Workers AI', host:'developers.cloudflare.com/workers-ai', key:'Cloudflareアカウント', free:'1日あたりの無料枠（Neurons単位）', cors:'Workers内から呼ぶ', tags:['エッジで動く','画像生成・翻訳も'], url:'https://developers.cloudflare.com/workers-ai/',
        desc:'Cloudflare Workers（サーバーレス）の中からAIモデル（テキスト・画像生成・音声認識・翻訳・埋め込み）を呼べる。サーバー不要でAI付きAPIを公開できる。' }),
      API({ name:'Mistral AI', host:'console.mistral.ai', key:'必要', free:'無料の試用プラン（回数制限）', cors:false, url:'https://console.mistral.ai/', desc:'フランスのMistralのモデルを使えるAPI。軽量で速いモデルが多い。' }),
      API({ name:'Hugging Face Inference', host:'huggingface.co', key:'必要（アクセストークン）', free:'毎月の少額無料クレジット', cors:false, tags:['モデル数が膨大'], url:'https://huggingface.co/docs/inference-providers',
        desc:'オープンソースのAIモデルの集積地。画像分類・感情分析・翻訳・音声認識など専門的なモデルを呼べる。' }),
      API({ name:'Anthropic Claude API', host:'console.anthropic.com', key:'必要', free:'従量課金（少額から）', cors:false, tags:['有料','高品質'], url:'https://docs.anthropic.com/',
        desc:'Claudeモデルを使うAPI。無料枠はないが、使った分だけの従量課金で少額から始められる。長文の読解・コード生成・エージェントに強い。', prompt:'Anthropic SDKで、ユーザーの質問に答えるチャットAPIをNode.jsで作って。ストリーミングで返して。' }),
      API({ name:'OpenAI API', host:'platform.openai.com', key:'必要', free:'従量課金', cors:false, tags:['有料'], url:'https://platform.openai.com/', desc:'GPTシリーズ、画像生成、音声認識（Whisper）、音声合成を提供。業界で最も使われる形式（OpenAI互換）の元祖。' }),
    ]},
    { title:'無料で動かせる「ローカルAI」', note:'自分のPCでAIを動かせば、<b>回数制限も料金もなく、データも外に出ません</b>（PCの性能は必要）。', layout:'rows', items:[
      API({ name:'Ollama', host:'ollama.com', free:'完全無料（自分のPCで動作）', cors:'○（localhostのAPI）', tags:['オフライン','OpenAI互換'], url:'https://ollama.com/', try:false,
        desc:'コマンド1つでオープンモデル（Llama、Gemma、Qwen、Mistralなど）をダウンロードして動かせる。<code>http://localhost:11434</code> にAPIが立つので、自作アプリからそのまま呼べる。',
        prompt:'ローカルのOllama（gemma3モデル）を呼び出して、メモを要約するデスクトップアプリをElectronで作って。',
        code:"ollama run gemma3\n\n// アプリから呼ぶ\nconst r = await fetch('http://localhost:11434/api/chat', { method:'POST',\n  body: JSON.stringify({ model:'gemma3', messages:[{ role:'user', content:'こんにちは' }], stream:false }) });\nconsole.log((await r.json()).message.content);" }),
      API({ name:'LM Studio', host:'lmstudio.ai', free:'無料（個人・業務利用可）', cors:'○（localhost）', tags:['GUIで簡単'], url:'https://lmstudio.ai/', try:false, desc:'画面操作でモデルを探して動かせるアプリ。OpenAI互換のローカルサーバーを起動できる。' }),
      API({ name:'Transformers.js / WebLLM', host:'huggingface.co/docs/transformers.js', free:'無料（ブラウザ内で動作）', cors:'—（ブラウザ内で完結）', tags:['サーバー不要'], url:'https://huggingface.co/docs/transformers.js', try:false,
        desc:'<b>ブラウザの中で</b>AIモデルを動かすライブラリ。感情分析・翻訳・音声認識・小型LLMなどを、サーバーなし・APIキーなしで実行できる（初回にモデルをダウンロード）。', prompt:'Transformers.jsを使って、ブラウザ内だけで日本語の文章の感情（ポジティブ/ネガティブ）を判定するページを作って。' }),
    ]},
  ]
});

TABS.push({
  id:'weather', label:'天気・自然・宇宙', icon:'☂',
  intro:'天気予報・地震・日の出・宇宙のデータ。<b>Open-Meteo はキー不要・ブラウザから直接呼べる</b>ので、最初の1つに最適です。「▶ 実際に呼び出す」で本物のレスポンスを確認できます。',
  sections:[
    { title:'天気・気象', layout:'cards lg', items:[
      API({ name:'Open-Meteo（天気予報）', host:'open-meteo.com', free:'非商用は1日10,000回程度まで無料', cors:true, tags:['おすすめ','世界対応'], url:'https://open-meteo.com/',
        ep:'https://api.open-meteo.com/v1/forecast?latitude=35.68&longitude=139.76&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FTokyo&forecast_days=3',
        desc:'緯度・経度を渡すと、現在の天気・時間ごと・日ごとの予報（気温・降水・風・天気コード）が返る。<b>キー不要・CORS対応</b>で、天気アプリ入門の定番。', prompt:'Open-Meteo APIを使って、現在地（Geolocation API）の今日の天気と3日間の最高・最低気温を表示する天気アプリを作って。weather_codeは日本語の天気とアイコンに変換して。' }),
      API({ name:'Open-Meteo 地名検索（ジオコーディング）', host:'geocoding-api.open-meteo.com', free:'無料（非商用）', cors:true, url:'https://open-meteo.com/en/docs/geocoding-api',
        ep:'https://geocoding-api.open-meteo.com/v1/search?name=%E5%A4%A7%E9%98%AA&count=1&language=ja',
        desc:'地名（日本語可）から緯度・経度を調べる。天気APIと組み合わせて「都市名で天気検索」ができる。', prompt:'都市名を入力すると、Open-Meteoのジオコーディングで緯度経度を調べてから天気を表示するようにして。' }),
      API({ name:'Open-Meteo 大気質', host:'air-quality-api.open-meteo.com', free:'無料（非商用）', cors:true, url:'https://open-meteo.com/en/docs/air-quality-api',
        ep:'https://air-quality-api.open-meteo.com/v1/air-quality?latitude=35.68&longitude=139.76&current=pm2_5,pm10,uv_index',
        desc:'PM2.5・花粉（欧州）・UV指数などの大気のデータ。', prompt:'Open-Meteoの大気質APIで、今日のPM2.5とUV指数を表示して、値に応じて「注意」などの色を付けて。' }),
      API({ name:'天気予報API（livedoor天気互換）', host:'weather.tsukumijima.net', jp:true, unofficial:true, free:'無料（個人運営）', cors:true, url:'https://weather.tsukumijima.net/',
        ep:'https://weather.tsukumijima.net/api/forecast/city/130010',
        desc:'気象庁のデータを元に、<b>日本語の天気予報</b>（今日・明日・明後日、降水確率）を返す。都市はID（東京=130010）で指定。個人運営のため、重要なサービスでは公式データも検討。', prompt:'天気予報API（livedoor天気互換）を使って、東京の今日・明日の天気と降水確率を日本語で表示して。' }),
      API({ name:'気象庁の防災情報JSON', host:'www.jma.go.jp/bosai', jp:true, unofficial:true, free:'無料（仕様は公開されていない）', cors:'要確認', url:'https://www.jma.go.jp/bosai/forecast/', try:'https://www.jma.go.jp/bosai/forecast/data/forecast/130000.json',
        desc:'気象庁ホームページが内部で使っているJSON。予報・警報などを取得できるが<b>正式なAPIではなく予告なく変わる可能性</b>がある。利用規約（出典の明記）を守る。' }),
      API({ name:'OpenWeatherMap', host:'openweathermap.org', key:'必要', free:'無料プランあり（1分・1日の回数制限）', cors:'○（キーが見えるので注意）', url:'https://openweathermap.org/api',
        desc:'世界中の現在の天気・予報・天気アイコンを提供する老舗。チュートリアル記事が非常に多い。', prompt:'OpenWeatherMapのCurrent Weather APIで、都市名から現在の天気を日本語（lang=ja）で取得して。キーはサーバー側で。' }),
    ]},
    { title:'地震・災害・自然', layout:'cards lg', items:[
      API({ name:'P2P地震情報 API', host:'api.p2pquake.net', jp:true, free:'無料（回数制限あり）', cors:true, tags:['地震速報'], url:'https://www.p2pquake.net/develop/json_api_v2/',
        ep:'https://api.p2pquake.net/v2/history?codes=551&limit=3',
        desc:'気象庁の<b>地震情報（震度・震源・津波の有無）</b>をJSONで取得できる。WebSocketでリアルタイム受信も可能。', prompt:'P2P地震情報APIで直近の地震5件を取得して、震度・震源地・発生時刻を一覧表示して。震度に応じて色分けして。' }),
      API({ name:'USGS 地震データ', host:'earthquake.usgs.gov', free:'無料', cors:true, tags:['世界の地震'], url:'https://earthquake.usgs.gov/earthquakes/feed/',
        ep:'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson',
        desc:'米国地質調査所による世界の地震データ（GeoJSON形式）。地図ライブラリにそのまま載せられる。', prompt:'USGSの過去24時間のM4.5以上の地震をLeafletの地図に円で表示して、マグニチュードで円の大きさを変えて。' }),
      API({ name:'日の出・日の入り', host:'sunrise-sunset.org', free:'無料（クレジット表記）', cors:true, url:'https://sunrise-sunset.org/api',
        ep:'https://api.sunrise-sunset.org/json?lat=35.68&lng=139.76&formatted=0',
        desc:'緯度経度と日付から、日の出・日の入り・薄明（ゴールデンアワー計算にも）の時刻を返す。時刻はUTCなので日本時間に変換する。', prompt:'日の出・日の入りAPIで今日の東京の時刻を取得し、日本時間に変換して、ゴールデンアワー（日の入り前1時間）も表示して。' }),
    ]},
    { title:'宇宙', layout:'cards lg', items:[
      API({ name:'NASA APOD（今日の天体写真）', host:'api.nasa.gov', key:'DEMO_KEYで試せる（本番は無料登録）', free:'登録キーで1時間1,000回', cors:true, tags:['画像'], url:'https://api.nasa.gov/',
        ep:'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY', try:{ url:'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY', imageFrom:(j) => j.media_type === 'image' ? j.url : null },
        desc:'NASAが毎日1枚選ぶ天体写真と解説（英語）。火星探査車の写真、小惑星情報などのAPIも同じキーで使える。', prompt:'NASAのAPOD APIで今日の天体写真を大きく表示し、英語の解説を翻訳APIで日本語にして下に表示して。' }),
      API({ name:'ISSの現在位置', host:'wheretheiss.at', free:'無料（1秒1回程度）', cors:true, url:'https://wheretheiss.at/w/developer',
        ep:'https://api.wheretheiss.at/v1/satellites/25544',
        desc:'国際宇宙ステーションのリアルタイムの緯度・経度・高度・速度。', prompt:'ISSの現在位置を5秒ごとに取得して、Leafletの地図上でアイコンを動かして軌跡を線で描いて。' }),
      API({ name:'NASA 画像・動画ライブラリ', host:'images-api.nasa.gov', free:'無料・キー不要', cors:true, url:'https://images.nasa.gov/',
        ep:'https://images-api.nasa.gov/search?q=moon&media_type=image&page_size=2',
        desc:'NASAが公開している14万点以上の画像・動画・音声を検索できる。多くはパブリックドメイン。' }),
    ]},
  ]
});

TABS.push({
  id:'map', label:'地図・位置・住所', icon:'⌖',
  intro:'地図の表示、住所⇔緯度経度の変換、郵便番号、IPアドレスからの位置推定など。<b>地図の表示はLeaflet＋OpenStreetMap（または国土地理院）なら無料・キー不要</b>で始められます。',
  sections:[
    { title:'地図を表示する', layout:'rows', items:[
      API({ name:'OpenStreetMap ＋ Leaflet', host:'leafletjs.com / openstreetmap.org', free:'無料（タイル利用ポリシーを守る）', cors:'○', tags:['定番','クレジット表記必須'], url:'https://leafletjs.com/', try:false,
        desc:'みんなで作る世界地図（OSM）を、軽量ライブラリLeafletで表示する王道の組み合わせ。ピン・ポップアップ・線・円を簡単に描ける。大量アクセスのサービスでは自前や商用のタイル配信を使う。',
        prompt:'Leafletで東京駅を中心にOpenStreetMapの地図を表示し、クリックした場所にピンを立てて緯度経度をポップアップで表示して。',
        code:'<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">\n<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>\n<div id="map" style="height:400px"></div>\n<script>\n  const map = L.map("map").setView([35.681, 139.767], 15);\n  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {\n    attribution: "&copy; OpenStreetMap contributors" }).addTo(map);\n  L.marker([35.681, 139.767]).addTo(map).bindPopup("東京駅");\n</script>' }),
      API({ name:'国土地理院 地図タイル', host:'maps.gsi.go.jp', jp:true, free:'無料（出典の明記）', cors:'○', tags:['日本の地図','航空写真'], url:'https://maps.gsi.go.jp/development/ichiran.html', try:false,
        desc:'日本の公式地図。標準地図・淡色地図・航空写真・陰影起伏図など。Leafletのタイルとしてそのまま使える。', prompt:'Leafletで国土地理院の淡色地図と航空写真を切り替えられる地図を作って。出典表記も入れて。',
        code:'L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png", {\n  attribution: "<a href=\'https://maps.gsi.go.jp/development/ichiran.html\'>地理院タイル</a>" }).addTo(map);\n// 航空写真: https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg' }),
      API({ name:'MapLibre GL ＋ OpenFreeMap', host:'maplibre.org / openfreemap.org', free:'無料・キー不要', cors:'○', tags:['ベクター地図','おしゃれ'], url:'https://openfreemap.org/', try:false,
        desc:'ベクタータイルで<b>滑らかに拡大・回転・傾けられる</b>モダンな地図。OpenFreeMapはキー不要でスタイル付きの地図を提供。Google Maps風の見た目を無料で作れる。', prompt:'MapLibre GLとOpenFreeMapのlibertyスタイルで、3Dに傾けられる地図を表示して。' }),
      API({ name:'Google Maps Platform', host:'developers.google.com/maps', key:'必要（課金アカウント登録必須）', free:'APIごとに毎月の無料利用枠', cors:'○', tags:['△ 自動課金に注意','日本の情報が豊富'], url:'https://developers.google.com/maps', try:false,
        desc:'最も情報が豊富な地図。店舗検索（Places）やルート案内も強力。ただし<b>クレジットカード登録が必須</b>で、無料枠を超えると課金される。予算アラートと割り当て上限の設定を忘れずに。' }),
    ]},
    { title:'住所・位置の変換', layout:'cards lg', items:[
      API({ name:'zipcloud（郵便番号→住所）', host:'zipcloud.ibsnet.co.jp', jp:true, free:'無料', cors:true, tags:['フォーム入力に必須'], url:'https://zipcloud.ibsnet.co.jp/doc/api',
        ep:'https://zipcloud.ibsnet.co.jp/api/search?zipcode=1000001',
        desc:'郵便番号から都道府県・市区町村・町域を返す。<b>入力フォームの住所自動入力</b>の定番。', prompt:'郵便番号を7桁入力したら、zipcloud APIで住所を取得して、都道府県・市区町村・番地の入力欄に自動で入れて。' }),
      API({ name:'国土地理院 住所検索', host:'msearch.gsi.go.jp', jp:true, free:'無料', cors:true, url:'https://msearch.gsi.go.jp/',
        ep:'https://msearch.gsi.go.jp/address-search/AddressSearch?q=%E6%9D%B1%E4%BA%AC%E9%83%BD%E5%8D%83%E4%BB%A3%E7%94%B0%E5%8C%BA%E4%B8%B8%E3%81%AE%E5%86%85',
        desc:'日本の住所や地名から緯度経度を求める（ジオコーディング）。', prompt:'入力した住所を国土地理院の住所検索APIで緯度経度に変換して、地図の中心をそこへ移動して。' }),
      API({ name:'Nominatim（OSMの住所検索）', host:'nominatim.openstreetmap.org', free:'無料（1秒1回まで、利用ポリシー厳守）', cors:true, tags:['世界対応','逆ジオコーディング'], url:'https://nominatim.org/release-docs/latest/api/Overview/',
        ep:'https://nominatim.openstreetmap.org/search?q=%E6%9D%B1%E4%BA%AC%E3%82%BF%E3%83%AF%E3%83%BC&format=json&limit=1',
        desc:'施設名・住所 → 緯度経度（検索）と、緯度経度 → 住所（逆ジオコーディング）。大量の一括変換は禁止。', prompt:'地図をクリックした場所の住所を、Nominatimの逆ジオコーディング（reverse）で日本語表示して。連打しないよう1秒の間隔をあけて。' }),
      API({ name:'国土地理院 標高API', host:'cyberjapandata2.gsi.go.jp', jp:true, free:'無料', cors:'要確認', url:'https://maps.gsi.go.jp/development/elevation_s.html',
        ep:'https://cyberjapandata2.gsi.go.jp/general/dem/scripts/getelevation.php?lon=138.7274&lat=35.3606&outtype=JSON', try:{ url:'https://cyberjapandata2.gsi.go.jp/general/dem/scripts/getelevation.php?lon=138.7274&lat=35.3606&outtype=JSON' },
        desc:'緯度経度の地点の標高（m）を返す。登山・防災（浸水リスク）アプリに。見本は富士山頂付近。' }),
      API({ name:'HeartRails Geo API（市区町村・町域）', host:'geoapi.heartrails.com', jp:true, free:'無料', cors:'要確認', url:'https://geoapi.heartrails.com/',
        ep:'https://geoapi.heartrails.com/api/json?method=getTowns&city=%E6%B8%8B%E8%B0%B7%E5%8C%BA', try:{ url:'https://geoapi.heartrails.com/api/json?method=getTowns&city=%E6%B8%8B%E8%B0%B7%E5%8C%BA' },
        desc:'都道府県→市区町村→町域の一覧、緯度経度から最寄りの町域などを取得できる。住所の選択式フォームに。' }),
      API({ name:'HeartRails Express（駅・路線）', host:'express.heartrails.com', jp:true, free:'無料', cors:'要確認', url:'https://express.heartrails.com/api.html',
        ep:'https://express.heartrails.com/api/json?method=getStations&x=139.7671&y=35.6812', try:{ url:'https://express.heartrails.com/api/json?method=getStations&x=139.7671&y=35.6812' },
        desc:'駅名・路線・緯度経度から<b>最寄り駅</b>を検索できる。見本は東京駅付近の最寄り駅。', prompt:'現在地から最寄り駅を3つ、HeartRails Express APIで取得して距離と路線名を表示して。' }),
      API({ name:'Overpass API（OSMの施設検索）', host:'overpass-api.de', free:'無料（重いクエリは避ける）', cors:'○', url:'https://wiki.openstreetmap.org/wiki/Overpass_API', try:false,
        desc:'OSMのデータから「この範囲のカフェ」「トイレ」「自販機」などの施設を条件で抽出できる。独自の問い合わせ言語を使う。', prompt:'Overpass APIで、地図の表示範囲内にある公衆トイレを取得してピンで表示して。' }),
    ]},
    { title:'IPアドレス・ネットワーク', layout:'cards lg', items:[
      API({ name:'ipify（自分のIPアドレス）', host:'api.ipify.org', free:'無料・無制限', cors:true, url:'https://www.ipify.org/', ep:'https://api.ipify.org?format=json', desc:'アクセス元のグローバルIPアドレスを返すだけのシンプルなAPI。' }),
      API({ name:'ipapi.co（IPから地域推定）', host:'ipapi.co', free:'無料枠（1日の回数制限）', cors:true, url:'https://ipapi.co/api/', ep:'https://ipapi.co/json/',
        desc:'IPアドレスから国・都市・タイムゾーン・通貨をおおまかに推定。<b>位置情報の許可なしで</b>言語や通貨の初期値を決めるのに使える（精度は市区町村レベルで不正確なことも）。', prompt:'初回アクセス時にipapi.coで国を判定して、日本なら日本語・円、それ以外は英語・ドルを初期表示にして。' }),
    ]},
  ]
});

TABS.push({
  id:'japan', label:'日本の公共データ', icon:'⛩',
  intro:'国・自治体・公的機関が公開しているデータやAPI。<b>無料で信頼性が高い</b>ものが多い一方、利用登録（アプリケーションID）が必要なものもあります。出典の明記を忘れずに。',
  sections:[
    { title:'すぐ使える（キー不要）', layout:'cards lg', items:[
      API({ name:'祝日API（holidays-jp）', host:'holidays-jp.github.io', jp:true, free:'無料', cors:true, tags:['カレンダーに必須'], url:'https://holidays-jp.github.io/',
        ep:'https://holidays-jp.github.io/api/v1/date.json',
        desc:'日本の祝日（前年〜翌年）を「日付: 祝日名」のJSONで返す。内閣府のデータが元。', prompt:'カレンダーアプリで、holidays-jpのAPIから祝日を取得して、祝日の日付を赤字にして祝日名を表示して。' }),
      API({ name:'Nager.Date（世界の祝日）', host:'date.nager.at', free:'無料', cors:true, url:'https://date.nager.at/', ep:'https://date.nager.at/api/v3/PublicHolidays/2026/JP', desc:'100以上の国の祝日を返す。海外ユーザー向けのカレンダーやシフト管理に。' }),
      API({ name:'国会会議録検索システム API', host:'kokkai.ndl.go.jp', jp:true, free:'無料（短時間の大量アクセス禁止）', cors:false, url:'https://kokkai.ndl.go.jp/api.html',
        ep:'https://kokkai.ndl.go.jp/api/speech?any=%E7%94%9F%E6%88%90AI&maximumRecords=3&recordPacking=json',
        desc:'国会の本会議・委員会の<b>発言内容</b>をキーワード・発言者・日付で検索できる。テキスト分析やAI要約の題材に。', prompt:'国会会議録APIで「生成AI」を含む発言を検索し、発言者ごとの回数をグラフにして、各発言をAIで1行要約して。' }),
      API({ name:'NDLサーチ（国立国会図書館）', host:'ndlsearch.ndl.go.jp', jp:true, free:'無料（商用利用は要申請）', cors:'要確認', tags:['書籍検索'], url:'https://ndlsearch.ndl.go.jp/help/api', try:false,
        desc:'国内の書籍・雑誌などの書誌情報を検索。OpenSearch（RSS/XML）形式で返る。' }),
      API({ name:'ジャパンサーチ API', host:'jpsearch.go.jp', jp:true, free:'無料', cors:'○', tags:['文化財・アーカイブ'], url:'https://jpsearch.go.jp/api', try:false,
        desc:'全国の博物館・図書館・公文書館のデジタルアーカイブ（浮世絵・古地図・写真など）を横断検索。教育・観光アプリに。' }),
    ]},
    { title:'利用登録が必要（無料）', layout:'rows', items:[
      API({ name:'e-Stat API（政府統計）', host:'e-stat.go.jp', key:'必要（無料のアプリケーションID）', jp:true, url:'https://www.e-stat.go.jp/api/',
        desc:'国勢調査・人口推計・家計調査・経済センサスなど<b>政府統計の総合窓口</b>。地域別のデータを可視化するアプリに。', prompt:'e-Stat APIで都道府県別の人口を取得して、日本地図のコロプレス図（色の濃淡）で表示して。' }),
      API({ name:'e-Gov 法令API', host:'laws.e-gov.go.jp', jp:true, free:'無料', url:'https://laws.e-gov.go.jp/', try:false,
        desc:'日本の法令（法律・政令・省令）の本文や一覧を取得できる。条文検索ツールや、AIに法令を参照させる仕組みに。' }),
      API({ name:'不動産情報ライブラリ API', host:'reinfolib.mlit.go.jp', key:'必要（申請制）', jp:true, url:'https://www.reinfolib.mlit.go.jp/', desc:'国土交通省の不動産取引価格・地価公示・都市計画・ハザード情報などを取得できる。' }),
      API({ name:'法人番号システム Web-API', host:'houjin-bangou.nta.go.jp', key:'必要（申請制）', jp:true, url:'https://www.houjin-bangou.nta.go.jp/webapi/', desc:'国税庁の法人番号・商号・所在地を検索できる。取引先の確認や入力補完に。' }),
      API({ name:'gBizINFO API', host:'info.gbiz.go.jp', key:'必要（APIトークン）', jp:true, url:'https://info.gbiz.go.jp/', desc:'経済産業省の法人情報（補助金・表彰・調達・財務など）を取得できる。' }),
      API({ name:'公共交通オープンデータ（ODPT）', host:'developer.odpt.org', key:'必要（登録）', jp:true, url:'https://developer.odpt.org/', desc:'鉄道・バスの時刻表・運行情報・駅情報など。事業者ごとに提供範囲が異なる。' }),
      API({ name:'NHK番組表API', host:'api-portal.nhk.or.jp', key:'必要（登録）', jp:true, url:'https://api-portal.nhk.or.jp/', desc:'NHKの番組表（地域・チャンネル・日付指定）を取得できる。' }),
    ]},
    { title:'民間の日本向けAPI（登録・無料）', layout:'rows', items:[
      API({ name:'楽天ウェブサービス', host:'webservice.rakuten.co.jp', key:'必要（アプリID）', jp:true, url:'https://webservice.rakuten.co.jp/', desc:'楽天市場の商品検索・ランキング、楽天トラベル、楽天ブックスなどのAPI。アフィリエイトIDと組み合わせて収益化も可能。', prompt:'楽天市場の商品検索APIで、キーワードの商品を価格順に一覧表示するページを作って。アプリIDはサーバー側で管理して。' }),
      API({ name:'Yahoo!ショッピング 商品検索', host:'developer.yahoo.co.jp', key:'必要（Client ID）', jp:true, url:'https://developer.yahoo.co.jp/webapi/shopping/', desc:'Yahoo!ショッピングの商品を検索できるAPI。価格比較アプリに。' }),
      API({ name:'ホットペッパー グルメサーチAPI', host:'webservice.recruit.co.jp', key:'必要（登録）', jp:true, url:'https://webservice.recruit.co.jp/', desc:'飲食店を、エリア・ジャンル・予算・緯度経度で検索できる。「近くのお店」アプリに（クレジット表記が必要）。', prompt:'現在地から半径1km以内の居酒屋を、ホットペッパーグルメサーチAPIで検索して地図と一覧で表示して。' }),
      API({ name:'Qiita API v2', host:'qiita.com/api/v2/docs', jp:true, free:'未認証は1時間60回', cors:true, tags:['技術記事'], url:'https://qiita.com/api/v2/docs', ep:'https://qiita.com/api/v2/items?per_page=3&query=tag%3AClaude',
        desc:'Qiitaの技術記事・タグ・ユーザーを取得できる。トークンを使うと回数制限が増え、投稿もできる。' }),
      API({ name:'connpass API', host:'connpass.com/about/api', key:'必要（申請制・現行v2）', jp:true, url:'https://connpass.com/about/api/', desc:'ITイベントの検索。<b>現在は申請してAPIキーを取得する方式</b>に変わっているため、古い記事のコードはそのまま動かないことがある。' }),
    ]},
    { title:'終了・変更に注意', after:{ type:'caution', label:'注意', text:'AIは学習時点の古い情報で「このAPIを使いましょう」と提案することがあります。終了したAPIを使うコードが出てきたら、公式サイトで現状を確認し、代替サービスへの書き換えを指示してください。' }, layout:'rows', items:[
      { name:'LINE Notify', en:'2025年3月末で提供終了', tags:['× 終了'], desc:'手軽な通知APIとして人気だったが終了。代わりに <b>LINE Messaging API</b>（公式アカウント経由）や、Discord・Slack・メール通知を使う。', prompt:'LINE Notifyを使っている部分を、LINE Messaging APIのプッシュメッセージに置き換えて。' },
      { name:'RESAS API', en:'地域経済分析システム', tags:['× API提供終了'], desc:'地域経済データのAPIとして教材でよく使われていたが、API提供は終了。同様のデータは <b>e-Stat</b> などから取得する。' },
      { name:'livedoor 天気', en:'Weather Hacks', tags:['× 終了'], desc:'本家は終了。互換APIとして天気予報API（weather.tsukumijima.net）が個人運営で提供されている。' },
    ]},
  ]
});
})();
