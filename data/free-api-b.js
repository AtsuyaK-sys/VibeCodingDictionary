/* 無料API辞典 — B: 知識・言語 / 画像・素材 / エンタメ / お金 / 開発・テスト */
(function(){
TABS.push({
  id:'knowledge', label:'知識・言語・本', icon:'❡',
  intro:'百科事典・辞書・翻訳・書籍・論文・国のデータ。学習アプリ、クイズ、単語帳、読書記録アプリの材料になります。',
  sections:[
    { title:'百科事典・知識', layout:'cards lg', items:[
      API({ name:'Wikipedia 要約API', host:'ja.wikipedia.org/api/rest_v1', jp:true, free:'無料（常識的な頻度で）', cors:true, tags:['おすすめ'], url:'https://ja.wikipedia.org/api/rest_v1/',
        ep:'https://ja.wikipedia.org/api/rest_v1/page/summary/%E5%AF%8C%E5%A3%AB%E5%B1%B1', try:{ url:'https://ja.wikipedia.org/api/rest_v1/page/summary/%E5%AF%8C%E5%A3%AB%E5%B1%B1', imageFrom:(j) => j.thumbnail && j.thumbnail.source },
        desc:'記事名を渡すと、<b>冒頭の要約文・サムネイル画像・URL</b>を返す。用語集やクイズの解説表示に便利。', prompt:'入力した単語のWikipedia日本語版の要約とサムネイル画像を表示するミニ辞書アプリを作って。見つからない場合は検索候補を出して。' }),
      API({ name:'Wikipedia 検索（MediaWiki API）', host:'ja.wikipedia.org/w/api.php', jp:true, free:'無料', cors:'○（origin=* を付ける）', url:'https://www.mediawiki.org/wiki/API:Main_page',
        ep:'https://ja.wikipedia.org/w/api.php?action=query&list=search&srsearch=%E3%83%90%E3%82%A4%E3%83%96%E3%82%B3%E3%83%BC%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0&format=json&origin=*&srlimit=3', try:{ url:'https://ja.wikipedia.org/w/api.php?action=query&list=search&srsearch=%E3%83%90%E3%82%A4%E3%83%96%E3%82%B3%E3%83%BC%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0&format=json&origin=*&srlimit=3' },
        desc:'キーワード検索、ランダム記事、カテゴリ一覧など多機能。ブラウザから呼ぶときは <code>origin=*</code> を付ける。' }),
      API({ name:'Wikidata（構造化データ）', host:'query.wikidata.org', free:'無料', cors:true, tags:['SPARQL'], url:'https://query.wikidata.org/', try:false,
        desc:'「日本の都道府県と人口」「ノーベル賞受賞者の一覧」のような<b>事実データを条件で抽出</b>できる知識ベース。SPARQLという問い合わせ言語を使う（AIに書かせると楽）。', prompt:'Wikidataの SPARQL で、日本の世界遺産の名前・登録年・緯度経度を取得して地図に表示して。' }),
      API({ name:'REST Countries（国情報）', host:'restcountries.com', key:'新バージョンはアカウント登録・APIキー方式', free:'公式の料金・制限ページで確認', cors:'○（公式にブラウザ利用の案内あり）', tags:['△ 旧v3.1は廃止'], url:'https://restcountries.com/', try:false,
        desc:'世界の国の首都・人口・国旗画像・通貨・言語・タイムゾーン。国旗クイズや国選択フォームに。<b>以前のキー不要の v3.1 は廃止</b>されたため、ネット上の古いサンプルコード（<code>/v3.1/name/…</code>）はそのままでは動かない。', prompt:'REST Countriesの現行APIのドキュメントに沿って、国旗クイズアプリを作って。古いv3.1のエンドポイントは使わないで。' }),
    ]},
    { title:'辞書・言葉', layout:'cards lg', items:[
      API({ name:'Free Dictionary API（英英辞典）', host:'dictionaryapi.dev', free:'無料（個人運営・停止することがある）', cors:true, tags:['△ 不安定なことあり'], url:'https://dictionaryapi.dev/', ep:'https://api.dictionaryapi.dev/api/v2/entries/en/serendipity',
        desc:'英単語の意味・品詞・例文・発音記号・<b>発音音声のURL</b>を返す。英単語帳アプリに最適。', prompt:'Free Dictionary APIで英単語を調べて、意味・例文・発音（音声再生ボタン）を表示する単語帳アプリを作って。覚えた単語はlocalStorageに保存。' }),
      API({ name:'Datamuse（類語・連想語）', host:'api.datamuse.com', free:'無料（1日10万回まで）', cors:true, url:'https://www.datamuse.com/api/', ep:'https://api.datamuse.com/words?ml=happy&max=6',
        desc:'英語の類義語・韻を踏む語・連想語・続く語を検索できる。作詞・ネーミング・ワードゲームに。' }),
      API({ name:'KanjiAPI（漢字辞典）', host:'kanjiapi.dev', jp:true, free:'無料', cors:true, url:'https://kanjiapi.dev/', ep:'https://kanjiapi.dev/v1/kanji/%E8%9B%8D',
        desc:'漢字1文字の音読み・訓読み・意味（英語）・画数・学年・JLPTレベル。漢字学習アプリに。' }),
      API({ name:'Jisho.org（和英辞書）', host:'jisho.org', unofficial:true, free:'無料', cors:'×（ブラウザから直接は不可の場合あり）', url:'https://jisho.org/', try:false,
        desc:'和英辞書サイトの検索API（正式公開ではない）。日本語学習者向けアプリでよく使われるが、仕様変更の可能性がある。' }),
    ]},
    { title:'翻訳', layout:'rows', items:[
      API({ name:'DeepL API Free', host:'deepl.com/pro-api', key:'必要（カード登録あり）', free:'毎月50万文字まで無料', cors:false, tags:['高品質','日本語に強い'], url:'https://www.deepl.com/pro-api',
        desc:'自然な翻訳で定評のあるDeepLのAPI。無料プランでも月50万文字と実用的。ブラウザから直接は呼べないのでサーバー経由で。', prompt:'DeepL API Freeを使って、入力した日本語を英語に翻訳するAPIをサーバーレス関数で作って。キーは環境変数で。',
        code:"const r = await fetch('https://api-free.deepl.com/v2/translate', {\n  method: 'POST',\n  headers: { 'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_KEY}`, 'Content-Type': 'application/json' },\n  body: JSON.stringify({ text: ['こんにちは'], target_lang: 'EN' })\n});\nconsole.log((await r.json()).translations[0].text);" }),
      API({ name:'MyMemory 翻訳API', host:'mymemory.translated.net', free:'匿名で1日5,000文字程度', cors:true, url:'https://mymemory.translated.net/doc/spec.php', ep:'https://api.mymemory.translated.net/get?q=Hello%20world&langpair=en%7Cja',
        desc:'キー不要で使える翻訳API。精度はDeepLやAIに劣るが、試作には手軽。' }),
      API({ name:'LibreTranslate', host:'libretranslate.com', key:'公式サーバーは有料キー（自分で立てれば無料）', cors:'○', tags:['オープンソース','自前サーバー可'], url:'https://libretranslate.com/', try:false,
        desc:'オープンソースの翻訳エンジン。Dockerで自分のPCやサーバーに立てれば無料・無制限・オフラインで使える。' }),
      { name:'AIで翻訳する', en:'LLM translation', tags:['柔軟'], desc:'Gemini・Claude・GPTなどのLLMに翻訳させると、<b>口調（敬語・カジュアル）や用語の統一</b>まで指示できる。翻訳APIより柔軟。', prompt:'UIの文言を、用語集（「保存=Save」「下書き=Draft」）に従って英語に翻訳するスクリプトを、Gemini APIで作って。' },
    ]},
    { title:'本・論文', layout:'cards lg', items:[
      API({ name:'Google Books API', host:'googleapis.com/books', free:'キーなしでも検索できるが共有の回数制限（429）にかかりやすい。無料のAPIキー推奨', cors:true, url:'https://developers.google.com/books', ep:'https://www.googleapis.com/books/v1/volumes?q=isbn:9784101010014',
        try:{ url:'https://www.googleapis.com/books/v1/volumes?q=isbn:9784101010014', imageFrom:(j) => j.items && j.items[0].volumeInfo.imageLinks && j.items[0].volumeInfo.imageLinks.thumbnail },
        desc:'ISBN・タイトル・著者で本を検索し、表紙画像・あらすじ・ページ数を取得。<b>読書記録アプリ</b>の定番。バーコード読み取りと組み合わせると便利。', prompt:'本のバーコード（ISBN）をカメラで読み取って、Google Books APIで書名・著者・表紙を取得し、読書リストに追加するアプリを作って。' }),
      API({ name:'openBD（日本の書誌）', host:'openbd.jp', jp:true, free:'無料（提供状況は要確認）', cors:true, url:'https://openbd.jp/', ep:'https://api.openbd.jp/v1/get?isbn=9784101010014',
        desc:'日本の出版物の書誌情報・書影（表紙）・内容紹介をISBNで取得。版元ドットコムによる提供。' }),
      API({ name:'Open Library', host:'openlibrary.org', free:'無料', cors:true, url:'https://openlibrary.org/developers/api', ep:'https://openlibrary.org/search.json?q=harry+potter&limit=2&fields=title,author_name,first_publish_year,cover_i',
        desc:'インターネット・アーカイブによる世界の書籍データベース。表紙画像は <code>covers.openlibrary.org</code> から取得。' }),
      API({ name:'Crossref（論文情報）', host:'api.crossref.org', free:'無料', cors:true, url:'https://api.crossref.org/', ep:'https://api.crossref.org/works?query=large+language+model&rows=2&select=title,author,DOI,published',
        desc:'論文のタイトル・著者・DOI・引用数のメタデータ。文献管理ツールや参考文献の自動整形に。' }),
      API({ name:'arXiv API', host:'export.arxiv.org', free:'無料（3秒に1回程度）', cors:'×（XML・サーバー経由推奨）', url:'https://info.arxiv.org/help/api/', try:false,
        desc:'AI・物理・数学などのプレプリント論文を検索。Atom（XML）形式で返る。最新AI論文の要約ボットなどに。', prompt:'arXiv APIで「LLM agent」の最新論文10件を毎朝取得し、Gemini APIで日本語の3行要約を作ってDiscordに投稿するスクリプトを作って。' }),
    ]},
  ]
});

TABS.push({
  id:'media', label:'画像・素材・アート', icon:'▨',
  intro:'写真・ダミー画像・アバター・アイコン・美術作品の画像API。<b>URLを &lt;img&gt; に書くだけで使えるもの</b>は試作で大活躍します。',
  sections:[
    { title:'URLだけで画像が出る（試作の味方）', layout:'cards lg', items:[
      API({ name:'Lorem Picsum（ダミー写真）', host:'picsum.photos', free:'無料', cors:true, tags:['おすすめ'], url:'https://picsum.photos/', try:{ url:'https://picsum.photos/400/220', image:true },
        desc:'URLのサイズ指定だけで、きれいなランダム写真が出る。<code>?grayscale</code>、<code>?blur=2</code>、<code>/seed/文字列/</code> で固定も可能。', prompt:'カード一覧のダミー画像に Lorem Picsum を使って、カードごとに seed を変えて別の写真にして。',
        code:'<img src="https://picsum.photos/400/220">\n<img src="https://picsum.photos/seed/cafe/400/220">   <!-- いつも同じ写真 -->\n<img src="https://picsum.photos/400/220?grayscale&blur=2">' }),
      API({ name:'placehold.co（プレースホルダー）', host:'placehold.co', free:'無料', cors:true, url:'https://placehold.co/', try:{ url:'https://placehold.co/400x200/6d4cff/ffffff/png?text=Vibe+Coding', image:true },
        desc:'指定サイズ・色・文字入りの仮画像。デザインの枠組みを確認するときに。', code:'<img src="https://placehold.co/600x400/6d4cff/ffffff/png?text=Hello">' }),
      API({ name:'DiceBear（アバター生成）', host:'dicebear.com', free:'無料（スタイルごとのライセンス確認）', cors:true, tags:['ユーザーアイコン'], url:'https://www.dicebear.com/', try:{ url:'https://api.dicebear.com/9.x/adventurer/svg?seed=Vibe', image:true },
        desc:'文字列（ユーザー名など）から、<b>毎回同じキャラクターのアバター</b>を生成。30以上の絵柄。初期アイコンに最適。', prompt:'ユーザー登録時の初期アイコンを、DiceBearのadventurerスタイルでユーザー名をseedにして生成して。',
        code:'<img src="https://api.dicebear.com/9.x/adventurer/svg?seed=山田太郎">' }),
      API({ name:'RoboHash（ロボット・モンスター画像）', host:'robohash.org', free:'無料', cors:true, url:'https://robohash.org/', try:{ url:'https://robohash.org/vibecoding?set=set4&size=200x200', image:true },
        desc:'文字列からロボット・モンスター・猫などのユニークな画像を生成。set1〜set5で絵柄変更。' }),
      API({ name:'QRコード生成（goQR）', host:'api.qrserver.com', free:'無料', cors:true, tags:['QR'], url:'https://goqr.me/api/', try:{ url:'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https%3A%2F%2Fexample.com', image:true },
        desc:'URLや文字をQRコード画像にする。読み取り用のAPIもある。ライブラリ（qrcode.js）を使えばオフラインでも作れる。', code:'<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://example.com">' }),
      API({ name:'QuickChart（グラフ画像）', host:'quickchart.io', free:'無料枠あり', cors:true, url:'https://quickchart.io/', try:{ url:"https://quickchart.io/chart?w=400&h=220&c=%7Btype%3A'bar'%2Cdata%3A%7Blabels%3A%5B'1%E6%9C%88'%2C'2%E6%9C%88'%2C'3%E6%9C%88'%5D%2Cdatasets%3A%5B%7Blabel%3A'%E5%A3%B2%E4%B8%8A'%2Cdata%3A%5B12%2C19%2C8%5D%7D%5D%7D%7D", image:true },
        desc:'Chart.jsの設定をURLに入れると、<b>グラフをPNG画像</b>で返す。メール・Slack・PDFなどJSが使えない場所にグラフを載せるのに便利。', prompt:'毎週の売上をQuickChartでグラフ画像にして、Slackに画像付きで投稿するスクリプトを作って。' }),
      API({ name:'Iconify API（アイコン20万点）', host:'api.iconify.design', free:'無料', cors:true, tags:['アイコン'], url:'https://iconify.design/', try:{ url:'https://api.iconify.design/mdi/rocket-launch.svg?color=%236d4cff&height=96', image:true },
        desc:'Material・Lucide・Tablerなど150以上のアイコンセットを横断してSVGで取得できる。検索APIもある。', code:'<img src="https://api.iconify.design/mdi/home.svg?color=%23333&height=24">\n<!-- 検索: https://api.iconify.design/search?query=home -->' }),
      API({ name:'サイトのファビコン取得', host:'google.com/s2/favicons', unofficial:true, free:'無料', cors:true, url:'https://www.google.com/s2/favicons?domain=github.com&sz=64', try:{ url:'https://www.google.com/s2/favicons?domain=github.com&sz=64', image:true },
        desc:'ドメイン名からサイトのアイコンを取得。ブックマーク管理・リンク集アプリに。', code:'<img src="https://www.google.com/s2/favicons?domain=github.com&sz=64">' }),
    ]},
    { title:'写真素材の検索API', layout:'rows', items:[
      API({ name:'Unsplash API', host:'unsplash.com/developers', key:'必要', free:'デモは1時間50回（申請で拡大）', cors:'○', terms:'撮影者のクレジット表記・ダウンロード通知が必要', url:'https://unsplash.com/developers', desc:'高品質なフリー写真を検索。キーワードで背景画像を自動で変えるアプリなどに。' }),
      API({ name:'Pexels API', host:'pexels.com/api', key:'必要', free:'1時間200回・月2万回', cors:'○', tags:['動画素材も'], terms:'Pexelsと撮影者のクレジット推奨', url:'https://www.pexels.com/api/', desc:'写真に加えて<b>フリー動画素材</b>も検索できる。動画の背景素材の自動取得に。' }),
      API({ name:'Pixabay API', host:'pixabay.com/api/docs', key:'必要', free:'1分100回', cors:'○', tags:['イラスト・ベクターも'], url:'https://pixabay.com/api/docs/', desc:'写真・イラスト・ベクター・動画を検索。日本語のキーワード検索も可。結果は24時間キャッシュするのがルール。' }),
      API({ name:'Openverse', host:'openverse.org', free:'匿名は回数制限あり', cors:true, tags:['CCライセンス'], url:'https://api.openverse.org/', ep:'https://api.openverse.org/v1/images/?q=cat&page_size=2',
        desc:'クリエイティブ・コモンズの画像・音源を横断検索（WordPress財団運営）。ライセンス情報付きで返る。' }),
    ]},
    { title:'美術館・アーカイブ', layout:'cards lg', items:[
      API({ name:'メトロポリタン美術館 API', host:'collectionapi.metmuseum.org', free:'無料（1秒80回まで）', cors:true, tags:['パブリックドメイン画像'], url:'https://metmuseum.github.io/',
        ep:'https://collectionapi.metmuseum.org/public/collection/v1/objects/45434', try:{ url:'https://collectionapi.metmuseum.org/public/collection/v1/objects/45434', imageFrom:(j) => j.primaryImageSmall },
        desc:'47万点以上の収蔵品データ。パブリックドメインの作品は高解像度画像も自由に使える。浮世絵も多数（見本は北斎）。', prompt:'メトロポリタン美術館APIで「Hokusai」の作品を検索し、画像があるものだけをギャラリー表示して。' }),
      API({ name:'シカゴ美術館 API', host:'api.artic.edu', free:'無料', cors:'要確認（環境によりブラウザから拒否されることあり）', try:false, url:'https://api.artic.edu/docs/', ep:'https://api.artic.edu/api/v1/artworks?limit=2&fields=id,title,artist_display,image_id',
        desc:'作品情報と、IIIF形式の高画質画像。「今日の名画」ウィジェットなどに。画像URLは <code>https://www.artic.edu/iiif/2/{image_id}/full/843,/0/default.jpg</code>。' }),
    ]},
  ]
});

TABS.push({
  id:'fun', label:'エンタメ・趣味', icon:'☺',
  intro:'ゲーム・アニメ・音楽・料理・動物・クイズなど、<b>作っていて楽しい</b>題材のAPI。プログラミング学習の最初の一歩にも向いています。',
  sections:[
    { title:'ゲーム・アニメ・映画', layout:'cards lg', items:[
      API({ name:'PokéAPI（ポケモン）', host:'pokeapi.co', free:'無料（キャッシュ推奨）', cors:true, tags:['入門に人気','日本語名あり'], url:'https://pokeapi.co/',
        ep:'https://pokeapi.co/api/v2/pokemon/pikachu', try:{ url:'https://pokeapi.co/api/v2/pokemon/pikachu', imageFrom:(j) => j.sprites && (j.sprites.other && j.sprites.other['official-artwork'].front_default || j.sprites.front_default) },
        desc:'ポケモンの種類・タイプ・能力値・技・画像。日本語名は <code>/pokemon-species/</code> の names から取得できる。図鑑アプリの練習題材として定番。', prompt:'PokéAPIで図鑑アプリを作って。番号1〜151を一覧表示し、日本語名・タイプ・画像を出して、タイプで絞り込めるようにして。' }),
      API({ name:'Jikan（MyAnimeListの非公式API）', host:'api.jikan.moe', unofficial:true, free:'無料（1秒3回・1分60回）', cors:true, tags:['アニメ・漫画'], url:'https://jikan.moe/',
        ep:'https://api.jikan.moe/v4/anime?q=frieren&limit=1', try:{ url:'https://api.jikan.moe/v4/anime?q=frieren&limit=1', imageFrom:(j) => j.data && j.data[0] && j.data[0].images.jpg.image_url },
        desc:'アニメ・漫画の作品情報・スコア・放送時期・キャラクター。今期アニメ一覧や視聴記録アプリに。', prompt:'Jikan APIで今期（season now）のアニメ一覧を取得し、スコア順にカード表示して。見たい作品にチェックを付けられるように。' }),
      API({ name:'AniList（GraphQL）', host:'graphql.anilist.co', free:'無料（1分90回）', cors:true, tags:['GraphQL'], url:'https://docs.anilist.co/', try:false,
        desc:'アニメ・漫画のデータベース。GraphQLで必要な項目だけ取れる。日本語タイトル（native）も取得可。', code:"const query = `query ($s: String) { Media(search: $s, type: ANIME) { title { native romaji } coverImage { large } averageScore } }`;\nconst r = await fetch('https://graphql.anilist.co', { method:'POST', headers:{ 'Content-Type':'application/json' },\n  body: JSON.stringify({ query, variables: { s: 'Frieren' } }) });\nconsole.log(await r.json());" }),
      API({ name:'TMDB（映画・ドラマ）', host:'themoviedb.org', key:'必要（無料登録）', free:'非商用は無料', cors:'○', tags:['日本語対応'], url:'https://developer.themoviedb.org/', terms:'TMDBのロゴ表記が必要',
        desc:'映画・ドラマのあらすじ・ポスター・出演者・配信サービス。<code>language=ja-JP</code> で日本語情報。', prompt:'TMDB APIで今週のトレンド映画を日本語で取得し、ポスター付きの一覧と詳細ページを作って。' }),
      API({ name:'RAWG（ゲームDB）', host:'rawg.io/apidocs', key:'必要', free:'月2万回', cors:'○', url:'https://rawg.io/apidocs', desc:'50万本以上のゲームの情報・スクリーンショット・対応機種・評価。' }),
      API({ name:'Studio Ghibli API（コミュニティ版）', host:'ghibliapi.vercel.app', unofficial:true, free:'無料', cors:true, url:'https://ghibliapi.vercel.app/', ep:'https://ghibliapi.vercel.app/films?fields=title,original_title,release_date,director&limit=3',
        desc:'ジブリ作品の公開年・監督・あらすじ（英語）・日本語原題。練習用の小さなAPI。' }),
      API({ name:'Rick and Morty API', host:'rickandmortyapi.com', free:'無料', cors:true, tags:['ページネーション練習'], url:'https://rickandmortyapi.com/',
        ep:'https://rickandmortyapi.com/api/character/1', try:{ url:'https://rickandmortyapi.com/api/character/1', imageFrom:(j) => j.image },
        desc:'キャラクター・エピソード・場所。ページ送り・検索・フィルタの練習題材として人気。' }),
      API({ name:'Chess.com / Lichess', host:'api.chess.com / lichess.org/api', free:'無料', cors:true, url:'https://www.chess.com/news/view/published-data-api', ep:'https://api.chess.com/pub/player/hikaru/stats',
        desc:'チェスのプレイヤー成績・対局履歴。Lichessは対局の実行やボット作成も可能。' }),
    ]},
    { title:'音楽', layout:'rows', items:[
      API({ name:'iTunes Search API', host:'itunes.apple.com/search', jp:true, free:'無料（1分20回程度）', cors:'要確認', url:'https://performance-partners.apple.com/search-api',
        ep:'https://itunes.apple.com/search?term=YOASOBI&country=jp&entity=song&limit=2', try:{ url:'https://itunes.apple.com/search?term=YOASOBI&country=jp&entity=song&limit=2', imageFrom:(j) => j.results && j.results[0] && j.results[0].artworkUrl100 },
        desc:'Apple Music/iTunesの曲・アルバム・アーティスト・Podcast・アプリを検索。ジャケット画像と<b>30秒の試聴URL</b>も取れる。日本のストア（country=jp）を指定できる。', prompt:'iTunes Search APIで曲を検索し、ジャケット画像と30秒試聴の再生ボタンが付いた一覧を作って。' }),
      API({ name:'Spotify Web API', host:'developer.spotify.com', key:'必要（アプリ登録・OAuth）', free:'無料（開発モードは利用者数制限）', cors:'○', url:'https://developer.spotify.com/documentation/web-api', desc:'曲・アーティスト・プレイリストの検索、ユーザーの再生履歴やプレイリスト操作（ログインが必要）。一部の機能（おすすめ・音響特徴など）は新規アプリでは使えなくなっているので注意。' }),
      API({ name:'MusicBrainz', host:'musicbrainz.org/doc/MusicBrainz_API', free:'無料（1秒1回・User-Agent必須）', cors:'○', url:'https://musicbrainz.org/doc/MusicBrainz_API', try:false, desc:'オープンな音楽データベース。アーティスト・リリース・曲の詳細なメタデータ。' }),
    ]},
    { title:'食べ物・料理', layout:'cards lg', items:[
      API({ name:'TheMealDB（レシピ）', host:'themealdb.com', free:'テスト用キー「1」で無料', cors:true, url:'https://www.themealdb.com/api.php',
        ep:'https://www.themealdb.com/api/json/v1/1/random.php', try:{ url:'https://www.themealdb.com/api/json/v1/1/random.php', imageFrom:(j) => j.meals && j.meals[0].strMealThumb },
        desc:'世界の料理レシピ（材料・手順・写真・YouTube動画）。ランダムレシピ、材料から検索も。英語。', prompt:'TheMealDBで「今日の晩ごはんガチャ」アプリを作って。ボタンを押すとランダムなレシピの写真・材料・手順を表示して、手順はAPIで日本語に翻訳して。' }),
      API({ name:'TheCocktailDB（カクテル）', host:'thecocktaildb.com', free:'テスト用キー「1」で無料', cors:true, url:'https://www.thecocktaildb.com/api.php', ep:'https://www.thecocktaildb.com/api/json/v1/1/search.php?s=margarita', desc:'カクテルのレシピ・材料・グラス・写真。ノンアルコールでの絞り込みも可能。' }),
      API({ name:'Open Food Facts（食品成分）', host:'openfoodfacts.org', free:'無料（User-Agentの設定を推奨）', cors:true, tags:['バーコード'], url:'https://openfoodfacts.github.io/openfoodfacts-server/api/', ep:'https://world.openfoodfacts.org/api/v2/product/3017624010701.json?fields=product_name,brands,nutriments,image_front_small_url',
        try:{ url:'https://world.openfoodfacts.org/api/v2/product/3017624010701.json?fields=product_name,brands,nutriments,image_front_small_url', imageFrom:(j) => j.product && j.product.image_front_small_url },
        desc:'世界の食品の成分・栄養・アレルゲンをバーコードで検索できるオープンデータ（日本の商品は少なめ）。' }),
    ]},
    { title:'動物・ランダム・クイズ', layout:'cards lg', items:[
      API({ name:'Dog CEO（犬の画像）', host:'dog.ceo', free:'無料', cors:true, tags:['入門に最適'], url:'https://dog.ceo/dog-api/',
        ep:'https://dog.ceo/api/breeds/image/random', try:{ url:'https://dog.ceo/api/breeds/image/random', imageFrom:(j) => j.message },
        desc:'ランダムな犬の写真（犬種指定も可）。<b>初めてのAPI練習</b>に最適なシンプルさ。', prompt:'ボタンを押すたびにDog CEO APIからランダムな犬の写真を表示する、1ファイルのHTMLを作って。' }),
      API({ name:'TheCatAPI（猫の画像）', host:'thecatapi.com', free:'キーなしでも少量可（登録で拡大）', cors:true, url:'https://thecatapi.com/',
        ep:'https://api.thecatapi.com/v1/images/search', try:{ url:'https://api.thecatapi.com/v1/images/search', imageFrom:(j) => j[0] && j[0].url },
        desc:'ランダムな猫の画像。登録すると品種情報・お気に入り・投票機能も使える。' }),
      API({ name:'HTTP Cats（ステータスコード猫）', host:'http.cat', free:'無料', cors:true, url:'https://http.cat/', try:{ url:'https://http.cat/404.jpg', image:true },
        desc:'HTTPステータスコードを猫の写真で表す。エラーページのユーモアに。', code:'<img src="https://http.cat/404.jpg">' }),
      API({ name:'Open Trivia DB（クイズ）', host:'opentdb.com', free:'無料', cors:true, url:'https://opentdb.com/api_config.php', ep:'https://opentdb.com/api.php?amount=1&type=multiple',
        desc:'ジャンル・難易度別の4択／○×クイズ（英語）。クイズゲームの問題データに。', prompt:'Open Trivia DBの問題で10問の4択クイズゲームを作って。正解数を数えて最後にスコアを表示して。' }),
      API({ name:'Deck of Cards（トランプ）', host:'deckofcardsapi.com', free:'無料', cors:true, url:'https://deckofcardsapi.com/', ep:'https://deckofcardsapi.com/api/deck/new/draw/?count=2',
        try:{ url:'https://deckofcardsapi.com/api/deck/new/draw/?count=1', imageFrom:(j) => j.cards && j.cards[0].image },
        desc:'山札のシャッフル・カードを引く・手札管理をAPIで。カード画像付き。ブラックジャックなどの練習に。' }),
      API({ name:'Random User（ダミー人物）', host:'randomuser.me', free:'無料', cors:true, tags:['ダミーデータ'], url:'https://randomuser.me/',
        ep:'https://randomuser.me/api/?results=1&nat=us', try:{ url:'https://randomuser.me/api/?results=1&nat=us', imageFrom:(j) => j.results[0].picture.large },
        desc:'名前・顔写真・住所・メールなどの架空の人物データ。ユーザー一覧画面の試作に。' }),
      API({ name:'Advice Slip（ひとことアドバイス）', host:'api.adviceslip.com', free:'無料', cors:true, url:'https://api.adviceslip.com/', ep:'https://api.adviceslip.com/advice', desc:'ランダムな英語の格言・アドバイス。おみくじ風アプリや「今日のひとこと」に。' }),
      API({ name:'TheSportsDB（スポーツ）', host:'thesportsdb.com', free:'テスト用キー「3」で無料（地域・環境によりアクセス制限あり）', cors:'要確認', try:false, url:'https://www.thesportsdb.com/free_sports_api', ep:'https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=Arsenal',
        desc:'サッカー・野球・バスケなどのチーム情報・ロゴ・試合結果。' }),
    ]},
  ]
});

TABS.push({
  id:'money', label:'お金・経済', icon:'¥',
  intro:'為替レート・暗号資産・株価などのデータ。<b>表示用途（家計簿の外貨換算、ポートフォリオの可視化）</b>に使えます。データは遅延していることがあり、投資判断の根拠にはしないでください。',
  sections:[
    { title:'為替・暗号資産', layout:'cards lg', items:[
      API({ name:'Frankfurter（為替レート）', host:'frankfurter.dev', free:'無料・制限なし（常識的な範囲で）', cors:true, tags:['おすすめ','欧州中央銀行のデータ'], url:'https://frankfurter.dev/', ep:'https://api.frankfurter.dev/v1/latest?base=USD&symbols=JPY,EUR',
        desc:'欧州中央銀行の参考レート（営業日ごと更新）。過去の日付や期間の推移も取れる。<b>キー不要・CORS対応</b>。', prompt:'Frankfurter APIで、円と主要通貨の換算ができる計算機を作って。過去30日のドル円の推移を折れ線グラフでも表示して。' }),
      API({ name:'ExchangeRate-API（オープン版）', host:'open.er-api.com', free:'無料（1日1回更新・クレジット表記）', cors:true, url:'https://www.exchangerate-api.com/docs/free', ep:'https://open.er-api.com/v6/latest/JPY',
        desc:'160以上の通貨の最新レート。キー不要のオープン版は1日1回の更新。' }),
      API({ name:'CoinGecko（暗号資産）', host:'coingecko.com/api', free:'公開APIは回数制限あり（無料のDemoキー推奨）', cors:true, url:'https://www.coingecko.com/en/api', ep:'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=jpy,usd',
        desc:'暗号資産の価格・時価総額・チャート用データ。円建ての価格も取れる。' }),
    ]},
    { title:'株価・経済指標', layout:'rows', items:[
      API({ name:'Alpha Vantage', host:'alphavantage.co', key:'必要（無料）', free:'1日25回程度', cors:'○', url:'https://www.alphavantage.co/', desc:'米国株を中心とした株価・為替・暗号資産・経済指標。テクニカル指標の計算済みデータも。' }),
      API({ name:'Finnhub', host:'finnhub.io', key:'必要（無料）', free:'1分60回', cors:'○', url:'https://finnhub.io/', desc:'株価・企業ニュース・決算予定。WebSocketでリアルタイム価格（米国株）。' }),
      API({ name:'J-Quants API', host:'jpx-jquants.com', key:'必要（登録）', jp:true, free:'無料プランは過去データ（数か月遅延）', url:'https://jpx-jquants.com/', desc:'日本取引所グループ公式の日本株データ（株価・財務・上場銘柄一覧）。無料プランは遅延データで、学習・分析の練習向き。' }),
      API({ name:'e-Stat（物価・家計調査など）', host:'e-stat.go.jp', key:'必要（無料）', jp:true, url:'https://www.e-stat.go.jp/api/', desc:'消費者物価指数・家計調査・賃金などの公的統計。家計簿アプリで「全国平均との比較」などに。（「日本の公共データ」タブも参照）' }),
    ]},
    { title:'決済（お金を受け取る）', layout:'rows', items:[
      API({ name:'Stripe', host:'stripe.com', key:'必要', free:'テストモードは無料、本番は決済ごとの手数料', cors:'公開キーのみブラウザ可', tags:['決済の定番','テストカードあり'], url:'https://docs.stripe.com/',
        desc:'クレジットカード・Apple Pay・Google Pay・サブスクリプションの決済。<b>テストモードとテスト用カード番号</b>で、実際のお金を動かさずに決済フローを開発できる。秘密キーは必ずサーバー側に。', prompt:'StripeのCheckoutで月額サブスクリプションの購入ページを作って。テストモードで動作確認し、決済完了はWebhookで受けてDBの会員ステータスを更新して。' }),
      API({ name:'PayPal / PAY.JP / Square', host:'各社開発者サイト', key:'必要', free:'サンドボックス（テスト環境）は無料', url:'https://pay.jp/docs', try:false, desc:'Stripe以外の選択肢。PAY.JPは国内向けでドキュメントが日本語。どれもテスト環境で開発してから本番申請を行う。' }),
    ]},
  ]
});

TABS.push({
  id:'dev', label:'開発・テスト用', icon:'</>',
  intro:'まだバックエンドがない段階で<b>画面を作るためのダミーAPI</b>や、開発に役立つ情報API。「とりあえず動く画面」を作るのに重宝します。',
  sections:[
    { title:'ダミーデータ（モックAPI）', layout:'cards lg', items:[
      API({ name:'JSONPlaceholder', host:'jsonplaceholder.typicode.com', free:'無料', cors:true, tags:['定番','CRUD練習'], url:'https://jsonplaceholder.typicode.com/', ep:'https://jsonplaceholder.typicode.com/todos?_limit=3',
        desc:'投稿・コメント・ToDo・ユーザーの<b>偽データ</b>。POST/PUT/DELETEも受け付ける（実際には保存されない）ので、CRUDの練習に最適。', prompt:'JSONPlaceholderの/todosを使って、一覧表示・追加・完了切替・削除ができるToDoアプリを作って。（APIは保存しないので画面上の状態で管理して）' }),
      API({ name:'DummyJSON', host:'dummyjson.com', free:'無料', cors:true, tags:['商品・画像付き','ログイン練習'], url:'https://dummyjson.com/',
        ep:'https://dummyjson.com/products?limit=2&select=title,price,thumbnail', try:{ url:'https://dummyjson.com/products?limit=2&select=title,price,thumbnail', imageFrom:(j) => j.products && j.products[0].thumbnail },
        desc:'商品・カート・ユーザー・レシピ・投稿など。<b>画像付きの商品データ</b>や、<b>ログイン（JWT）の練習用エンドポイント</b>もある。ECサイトの試作に。' }),
      API({ name:'Fake Store API', host:'fakestoreapi.com', free:'無料', cors:true, url:'https://fakestoreapi.com/', ep:'https://fakestoreapi.com/products/1', desc:'ECサイト用の商品・カテゴリ・カート・ユーザーのダミーデータ。' }),
      API({ name:'Faker API（日本語の偽データ）', host:'fakerapi.it', free:'無料（停止することがある）', cors:true, jp:true, tags:['△ 不安定なことあり'], url:'https://fakerapi.it/', ep:'https://fakerapi.it/api/v2/persons?_quantity=2&_locale=ja_JP',
        desc:'人物・住所・会社・テキストなどの偽データ。<code>_locale=ja_JP</code> で<b>日本語の名前や住所</b>が生成できる。' }),
      API({ name:'httpbin（リクエスト確認）', host:'httpbin.org', free:'無料', cors:true, url:'https://httpbin.org/', ep:'https://httpbin.org/get?hello=world',
        desc:'送ったリクエスト（ヘッダー・パラメータ・ボディ）をそのまま返す。<b>自分のコードが正しく送れているか</b>の確認や、遅延・エラーの再現に。', code:"// 3秒遅れて返す / 500エラーを返す\nfetch('https://httpbin.org/delay/3');\nfetch('https://httpbin.org/status/500');" }),
      API({ name:'ReqRes', host:'reqres.in', key:'無料のAPIキーをヘッダーに付ける方式に変更', free:'無料', cors:'○', url:'https://reqres.in/', try:false, desc:'ユーザー一覧・ログイン・登録のダミーAPI。古い記事のコードはキーなしで書かれていて動かないことがある。' }),
    ]},
    { title:'自分でモックを作る', layout:'rows', items:[
      { name:'json-server', en:'npm i -D json-server', tags:['ローカル','保存もされる'], desc:'<code>db.json</code> を用意するだけで、<b>本当に保存されるREST API</b>がローカルに立つ。フロントエンドを先に作るときに最強。', prompt:'json-serverでdb.jsonを作って、商品のCRUD APIをローカルで動かし、Reactの画面から呼ぶようにして。', code:'npx json-server db.json --port 3001\n# → GET/POST/PUT/DELETE http://localhost:3001/products' },
      { name:'MSW（Mock Service Worker）', en:'mswjs.io', tags:['テスト','フロントのみ'], desc:'ブラウザ内でAPIのリクエストを横取りして偽の応答を返す。<b>本番と同じコードのまま</b>開発・テストできる。' },
      { name:'Google Apps Script で自作API', en:'script.google.com', tags:['無料','スプレッドシートがDB'], desc:'Googleスプレッドシートをデータベースにして、<b>無料でJSONを返すAPI</b>を公開できる。フォームの保存先や小さな管理画面に。', prompt:'Googleスプレッドシートの「商品」シートの内容をJSONで返すWebアプリをApps Scriptで作って。GETで一覧、POSTで行の追加ができるように。',
        code:"function doGet() {\n  const rows = SpreadsheetApp.getActive().getSheetByName('商品').getDataRange().getValues();\n  const [head, ...data] = rows;\n  const json = data.map(r => Object.fromEntries(head.map((h, i) => [h, r[i]])));\n  return ContentService.createTextOutput(JSON.stringify(json)).setMimeType(ContentService.MimeType.JSON);\n}" },
      { name:'webhook.site', en:'webhook.site', tags:['Webhook確認'], url:'https://webhook.site/', desc:'一時的な受信用URLを発行し、届いたWebhookの中身を画面で確認できる。Stripeなどの通知内容を調べるときに。' },
    ]},
    { title:'開発に役立つ情報API', layout:'cards lg', items:[
      API({ name:'GitHub REST API', host:'api.github.com', free:'未認証は1時間60回（トークンで5,000回）', cors:true, url:'https://docs.github.com/rest', ep:'https://api.github.com/repos/anthropics/claude-code',
        desc:'リポジトリ・Issue・PR・ユーザー・スター数など。ポートフォリオに自分のリポジトリ一覧を自動表示するなどに。', prompt:'GitHub APIで自分の公開リポジトリをスター数順に取得して、ポートフォリオサイトにカードで表示して。' }),
      API({ name:'npm Registry API', host:'registry.npmjs.org', free:'無料', cors:true, url:'https://github.com/npm/registry/blob/main/docs/REGISTRY-API.md', ep:'https://registry.npmjs.org/react/latest', desc:'npmパッケージの最新バージョン・依存関係・説明。ダウンロード数は api.npmjs.org で取得。' }),
      API({ name:'Hacker News API', host:'hacker-news.firebaseio.com', free:'無料・制限なし', cors:true, url:'https://github.com/HackerNews/API', ep:'https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty&limitToFirst=5&orderBy=%22%24key%22',
        desc:'海外の技術ニュースサイトのトップ記事・コメント。技術トレンドの収集ボットに。' }),
      API({ name:'Microlink（URLのプレビュー情報）', host:'microlink.io', free:'1日50回まで無料', cors:true, tags:['OGP','スクリーンショット'], url:'https://microlink.io/docs/api/getting-started/overview', ep:'https://api.microlink.io/?url=https%3A%2F%2Fgithub.com',
        desc:'URLを渡すと<b>タイトル・説明・OGP画像・ファビコン</b>を返す。リンクカード（SNSのようなプレビュー）を作るのに便利。スクリーンショット撮影も可能。', prompt:'貼り付けたURLをMicrolink APIでリンクカード（OGP画像・タイトル・説明・ドメイン）にして表示して。' }),
      API({ name:'Shields.io（バッジ）', host:'shields.io', free:'無料', cors:true, url:'https://shields.io/', try:{ url:'https://img.shields.io/badge/Vibe-Coding-6d4cff?style=for-the-badge', image:true },
        desc:'READMEに貼る「build passing」「version 1.2」などのバッジ画像。', code:'![badge](https://img.shields.io/badge/Vibe-Coding-6d4cff?style=for-the-badge)' }),
    ]},
  ]
});
})();
