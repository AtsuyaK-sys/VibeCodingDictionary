/* エラー・トラブル辞典 */
(function(){
// E(メッセージ, 分類, 意味, 主な原因（配列）, 対処, AIへの伝え方)
const E = (msg, cat, mean, causes, fix, prompt, tags) => ({ name:`<code class="err">${msg.replace(/</g, '&lt;')}</code>`, en:cat, tags, search:msg,
  desc:`<b>意味：</b>${mean}<br><b>よくある原因：</b><ul>${causes.map(c => `<li>${c}</li>`).join('')}</ul><b>対処：</b>${fix}`, prompt });

TABS.push({
  id:'howto', label:'向き合い方', icon:'?',
  intro:'エラーは「どこで・何が・なぜ」起きたかを教えてくれる<b>ヒント</b>です。怖がらずに、まずは全文をコピーしてAIに渡しましょう。このページで検索（<kbd>/</kbd>キー）すると、エラー文の一部からでも探せます。',
  sections:[
    { title:'エラーを見つける・読む', layout:'rows', items:[
      { name:'ブラウザの開発者ツールを開く', en:'DevTools（F12 / Ctrl+Shift+I / ⌘+Option+I）', tags:['まずはここ'], desc:'Webページの不具合は、<b>Console（コンソール）タブ</b>に赤字でエラーが出ている。<b>Network（ネットワーク）タブ</b>ではAPIの通信が失敗していないか（赤い行、ステータスコード）が分かる。', prompt:'（コンソールの赤いエラーをすべてコピーして貼る）このエラーの原因と直し方を教えて。' },
      { name:'ターミナルのエラーを読む', en:'Terminal / Stack trace', desc:'エラーは<b>一番上（何のエラーか）と、自分のファイル名が出てくる行（どこで起きたか）</b>が重要。ライブラリ内部の行がたくさん続くのは「スタックトレース」で、自分のファイルの行を探す。', prompt:'（ターミナルの出力を最初から最後まで貼る）npm run dev を実行したらこうなりました。原因と直し方を教えて。' },
      { name:'AIに渡す情報', en:'What to share', desc:'<b>①エラー全文（要約しない）②何をしたら起きたか③期待した動作④環境（OS・ブラウザ・Node/Pythonのバージョン）⑤試したこと</b>。スクリーンショットも有効。', prompt:'【操作】〇〇したら\n【エラー全文】\n（ここに貼る）\n【期待】〇〇になるはず\n【環境】Windows 11 / Chrome / Node 22\n【試したこと】〇〇', tags:['テンプレ'] },
      { name:'まず試す基本の3つ', en:'Restart / Clear cache / Reinstall', desc:'①<b>開発サーバーを止めて再起動</b>（Ctrl+C → もう一度起動）②<b>ブラウザのスーパーリロード</b>（Ctrl+Shift+R）③<b>依存の入れ直し</b>（node_modules を削除して npm install）。意外とこれで直る。' },
      { name:'警告（Warning）とエラー（Error）', en:'Warning vs Error', desc:'黄色の<b>Warning（警告）</b>は「動くけど直した方がよい」、赤の<b>Error</b>は「動かない」。まずErrorから直す。' },
    ]},
  ]
});

TABS.push({
  id:'js', label:'ブラウザ・JavaScript', icon:'JS',
  intro:'Webページやフロントエンドで出る代表的なエラー。ブラウザのConsoleタブに表示されます。',
  sections:[
    { title:'値・型のエラー', layout:'rows', items:[
      E("TypeError: Cannot read properties of undefined (reading 'xxx')", 'JavaScript', '「存在しない（undefined）もの」の中の xxx を読もうとした。', ['APIのデータがまだ届いていないのに表示しようとした', 'オブジェクトの名前やキー名のタイプミス', '配列が空なのに [0] を参照した'], '<code>data?.user?.name</code> のようなオプショナルチェーンで安全に読む／データが届くまで「読み込み中」を表示する／<code>console.log</code> で中身を確認する。', 'このエラーが出ます。どの変数がundefinedになっているか特定して、データが未取得のときも落ちないように修正して。', ['最頻出']),
      E('TypeError: xxx is not a function', 'JavaScript', '関数ではないものを関数として呼び出した。', ['名前のタイプミス（関数名の打ち間違い）', 'importの書き方の間違い（default と named の取り違え）', '配列ではないものに .map() を使った'], 'その変数の中身を <code>console.log(typeof xxx, xxx)</code> で確認。import文が <code>import x from</code> か <code>import { x } from</code> か確認。', 'この「is not a function」エラーの原因を調べて。import の仕方やデータの型を確認して直して。'),
      E('ReferenceError: xxx is not defined', 'JavaScript', '定義されていない名前を使った。', ['変数・関数の宣言忘れ、スペルミス', 'スコープ（範囲）の外から使った', 'ライブラリのscriptタグを読み込む前に使った'], '宣言・import・読み込み順を確認する。', 'ReferenceError が出ます。どこで定義されるべき名前か調べて、宣言や読み込み順を直して。'),
      E('Uncaught (in promise) ...', 'JavaScript', '非同期処理（Promise）のエラーをどこでも受け止めていない。', ['fetchの失敗をcatchしていない', 'async関数の中の例外'], '<code>try { await ... } catch (e) { ... }</code> で囲み、ユーザーにエラーを表示する。', '非同期処理のエラーがすべてcatchされるようにして、失敗したら画面に分かりやすいエラーメッセージを出して。'),
      E('RangeError: Maximum call stack size exceeded', 'JavaScript', '関数が自分自身を無限に呼び続けた（無限再帰）。', ['終了条件のない再帰関数', 'setterが自分自身を呼ぶ', 'Reactで状態更新がループ'], '再帰の終了条件、呼び出しの流れを確認する。', 'Maximum call stack size exceeded が出ます。無限ループしている呼び出しの流れを特定して直して。'),
      E("SyntaxError: Unexpected token '<', \"<!DOCTYPE \"... is not valid JSON", 'JavaScript', 'JSONを受け取るつもりが、<b>HTML（エラーページや404ページ）</b>が返ってきた。', ['APIのURLが間違っていて404ページが返った', 'サーバー側でエラーが起きてHTMLのエラーページが返った', '開発サーバーのプロキシ設定の漏れ'], 'NetworkタブでそのリクエストのURLとレスポンスの中身を確認する。', 'fetchで「is not valid JSON」エラーが出ます。Networkタブの内容を貼るので、どのURLにリクエストしていて何が返っているか確認して直して。', ['よくハマる']),
      E('SyntaxError: Unexpected token / Unexpected end of input', 'JavaScript', '文法の間違い。', ['かっこ { } ( ) の閉じ忘れ・多すぎ', 'カンマやクォートの抜け', 'コピペの途中切れ'], 'エディタの赤い波線の場所を見る。AIが出力したコードが途中で切れていないか確認。', 'SyntaxErrorが出ます。かっこの対応やカンマの抜けを確認して、ファイル全体を正しい文法に直して。'),
    ]},
    { title:'読み込み・通信のエラー', layout:'rows', items:[
      E("Access to fetch at '...' from origin '...' has been blocked by CORS policy", 'ブラウザ・通信', 'API側がこのサイトからのアクセスを許可していないため、<b>ブラウザが結果を受け取るのを止めた</b>（セキュリティ機能）。', ['ブラウザから直接呼べないAPIを呼んだ', '自分のAPIサーバーでCORSの許可設定をしていない', 'file:// でHTMLを開いている'], '自分のサーバーなら許可するオリジンを設定（CORSヘッダー）。他社のAPIならサーバー側（サーバーレス関数）から呼ぶ。', 'CORSエラーが出ます。このAPIはブラウザから直接呼べないようなので、Vercel Functions（またはCloudflare Workers）で中継するAPIを作って、そこ経由で呼ぶように変えて。', ['最頻出']),
      E('Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/html"', 'ブラウザ', 'JSファイルを読もうとしたが、HTMLが返ってきた。', ['ファイルのパスが間違っていて404ページが返った', 'ビルド後のファイルの置き場所（base）設定の誤り', 'SPAの設定ですべてのURLにindex.htmlを返している'], 'NetworkタブでJSファイルのURLを確認。Viteなら <code>base</code> 設定を確認。', 'デプロイ後に「Failed to load module script」が出て真っ白になります。ビルド設定（baseパス）と配置を確認して直して。'),
      E('Cannot use import statement outside a module', 'ブラウザ・Node', '<code>import</code> 文を、モジュールとして読み込まれていないファイルで使った。', ['scriptタグに type="module" がない', 'Node.jsでpackage.jsonに "type": "module" がない'], '<code>&lt;script type="module" src="..."&gt;</code> にする。Nodeは package.json に <code>"type": "module"</code> を追加するか、拡張子を .mjs に。', 'import文のエラーが出ます。ESモジュールとして読み込まれるように設定を直して。'),
      E('Mixed Content: The page at \'https://...\' was loaded over HTTPS, but requested an insecure resource \'http://...\'', 'ブラウザ', 'HTTPSのページから、HTTP（暗号化なし）の画像やAPIを読み込もうとしてブロックされた。', ['APIや画像のURLが http:// のまま', 'HTTPしか提供していないAPIを使っている'], 'URLを https:// に変える。HTTPしかないAPIはサーバー経由で呼ぶ。', 'Mixed Contentエラーが出ます。http:// で読み込んでいる箇所をすべてhttps://に直して。'),
      E('net::ERR_CONNECTION_REFUSED / ERR_NAME_NOT_RESOLVED', 'ネットワーク', '接続先が応答しない（サーバーが起動していない）／ドメイン名が見つからない。', ['バックエンドのサーバーを起動し忘れ', 'ポート番号やURLのタイプミス', 'ネットワーク未接続'], 'サーバーが起動しているか、URL・ポートが正しいか確認。', 'フロントからAPIを呼ぶと ERR_CONNECTION_REFUSED になります。バックエンドの起動方法とURL・ポートの設定を確認して。'),
      E('Refused to execute inline script because it violates the following Content Security Policy directive', 'ブラウザ', 'セキュリティ設定（CSP）で、ページ内に直接書いたスクリプトの実行が禁止されている。', ['Chrome拡張機能（Manifest V3）でonclick属性などを使った', 'サーバーでCSPヘッダーを設定している'], 'スクリプトは別ファイルにし、onclick属性ではなく addEventListener を使う。', 'CSPエラーが出ます。インラインのスクリプトとonclick属性を、外部JSファイルとaddEventListenerに書き換えて。'),
    ]},
    { title:'権限・ブラウザ機能', layout:'rows', items:[
      E("NotAllowedError: play() failed because the user didn't interact with the document first", 'ブラウザ', 'ユーザーが操作する前に、音の出る動画や音声を再生しようとした（自動再生ポリシー）。', ['ページを開いた瞬間にBGMを鳴らそうとした'], '最初のクリックなどの操作の後に再生する。動画の自動再生は <code>muted</code> を付ける。', '音が鳴らないエラーが出ます。最初のクリック後にAudioContextを開始して再生するように直して。'),
      E('NotAllowedError: Permission denied（カメラ・マイク・位置情報）', 'ブラウザ', 'ユーザーが許可しなかった、またはブラウザ・OSの設定でブロックされている。', ['許可ダイアログで「ブロック」を選んだ', 'HTTPSではない（http://でカメラは使えない。localhostは例外）', 'OSのプライバシー設定でブラウザに許可していない'], 'アドレスバーの鍵アイコンから許可をリセット。HTTPSで配信する。拒否されたときの代わりの画面も用意する。', 'カメラが起動しません。HTTPSかどうか、許可状態の確認、拒否されたときの案内表示を追加して。'),
      E('QuotaExceededError: Failed to execute \'setItem\' on \'Storage\'', 'ブラウザ', 'localStorageの容量（約5MB）を超えた。', ['画像（Base64）をlocalStorageに保存した', 'データを消さずに溜め続けた'], '大きなデータはIndexedDBへ。古いデータを削除する仕組みを入れる。', 'localStorageの容量オーバーエラーが出ます。画像などの大きなデータはIndexedDB（Dexie.js）に移して。'),
    ]},
    { title:'エラーは出ないけどおかしい', layout:'rows', items:[
      { name:'画面が真っ白になる', en:'White screen', tags:['症状'], desc:'ほとんどの場合、JavaScriptのエラーで描画が止まっている。<b>まずConsoleタブを見る</b>。デプロイ後だけなら、JS/CSSのパスや環境変数を疑う。', prompt:'画面が真っ白になります。Consoleのエラーはこれです：（貼る）。原因を調べて直して。' },
      { name:'変更が反映されない', en:'Changes not showing', tags:['症状'], desc:'①ファイルを保存していない ②別のファイルを編集している ③ブラウザのキャッシュ（Ctrl+Shift+Rで再読み込み）④開発サーバーが止まっている／別のポートで動いている ⑤Service Worker（PWA）が古いファイルを返している。' },
      { name:'ボタンを押しても何も起きない', en:'Nothing happens', tags:['症状'], desc:'イベントが登録されていない、別の要素が上に重なってクリックを奪っている（z-index）、フォームが送信されてページが再読み込みされている（<code>e.preventDefault()</code> 忘れ）などが多い。', prompt:'ボタンを押しても何も起きません。クリックイベントが登録されているか、上に透明な要素が重なっていないか、フォーム送信でリロードされていないか確認して。' },
      { name:'文字化けする', en:'Mojibake', tags:['症状','日本語'], desc:'文字コードの不一致。HTMLに <code>&lt;meta charset="utf-8"&gt;</code>、ファイルはUTF-8で保存。CSVをExcelで開くと化けるのは、Excelが UTF-8（BOMなし）を正しく判定しないため → BOM付きUTF-8で書き出す。', prompt:'書き出したCSVをExcelで開くと文字化けします。BOM付きUTF-8で出力するように直して。' },
    ]},
  ]
});

TABS.push({
  id:'http', label:'HTTPステータス', icon:'#',
  intro:'APIやWebページにアクセスしたときに返ってくる3桁の数字。<b>2xx＝成功、3xx＝転送、4xx＝こちら（リクエスト側）の問題、5xx＝サーバー側の問題</b>と覚えると、原因の切り分けが速くなります。',
  sections:[
    { title:'ステータスコード一覧', table:{ head:['コード','名前','意味','よくある原因・対処'], rows:[
      ['200','OK','成功','—'],
      ['201','Created','作成成功','POSTで新しいデータができた'],
      ['204','No Content','成功（返す中身なし）','削除成功など。response.json() するとエラーになるので注意'],
      ['301 / 308','Moved Permanently','恒久的な転送','URL変更。SEO的にはこちらを使う'],
      ['302 / 307','Found / Temporary Redirect','一時的な転送','ログインページへの転送など'],
      ['304','Not Modified','変更なし（キャッシュを使って）','正常。ブラウザのキャッシュが使われた'],
      ['400','Bad Request','リクエストの形式が不正','送ったJSONの形・必須項目の不足・Content-Typeの指定漏れ'],
      ['401','Unauthorized','認証されていない','APIキーやトークンがない・間違い・期限切れ。ヘッダーの書き方（Bearer）を確認'],
      ['403','Forbidden','権限がない','ログインはしているが許可されていない。RLS・権限設定・IP制限'],
      ['404','Not Found','見つからない','URLの間違い、データが存在しない、SPAの直リンク（後述）'],
      ['405','Method Not Allowed','その方法は使えない','GETしか受け付けない所にPOSTした'],
      ['408','Request Timeout','時間切れ','通信が遅い・重い処理'],
      ['409','Conflict','競合','同じデータを同時に更新、すでに存在するIDで作成'],
      ['413','Payload Too Large','送るデータが大きすぎる','ファイルアップロードのサイズ制限'],
      ['415','Unsupported Media Type','形式が対応していない','Content-Type ヘッダーの指定漏れ・間違い'],
      ['422','Unprocessable Entity','内容の検証エラー','メール形式不正など、項目の値がルール違反'],
      ['429','Too Many Requests','回数制限を超えた','レート制限・無料枠超過。待つ、キャッシュする、プランを上げる'],
      ['500','Internal Server Error','サーバー内部のエラー','サーバー側のコードのバグ。サーバーのログを見る'],
      ['502','Bad Gateway','中継先から不正な応答','裏側のサーバーが落ちている・起動中'],
      ['503','Service Unavailable','一時的に利用不可','メンテナンス・過負荷。時間をおく'],
      ['504','Gateway Timeout','中継先が時間切れ','裏側の処理が長すぎる（サーバーレス関数の時間制限など）'],
      ['529 など','（サービス独自）','混雑・過負荷','AI APIなどが混雑。少し待って再試行（リトライ）する'],
    ]} },
    { title:'ステータスコードの扱い方', layout:'rows', items:[
      { name:'fetchは404や500でもエラーにならない', en:'response.ok', tags:['よくハマる'], desc:'JavaScriptの <code>fetch</code> は、通信自体が成功すれば404や500でも例外を投げない。<b><code>response.ok</code>（200〜299ならtrue）を必ずチェック</b>する。', code:"const res = await fetch(url);\nif (!res.ok) throw new Error(`HTTP ${res.status}`);\nconst data = await res.json();", prompt:'fetchのレスポンスでresponse.okを確認して、失敗時はステータスコードに応じたメッセージ（401ならログインし直し、429なら時間をおいて、など）を表示して。' },
      { name:'リトライ（再試行）', en:'Retry with backoff', desc:'429や503などの一時的なエラーは、<b>少し待ってから再試行</b>する。待ち時間を1秒→2秒→4秒と伸ばす（指数バックオフ）。', prompt:'API呼び出しが429や5xxで失敗したら、1秒・2秒・4秒と待ち時間を伸ばしながら最大3回までリトライして。' },
    ]},
  ]
});

TABS.push({
  id:'framework', label:'React・Next.js', icon:'⚛',
  intro:'React・Next.js・Vueでよく出るエラーと警告。AIが書いたコードでも頻繁に出ます。',
  sections:[
    { title:'React', layout:'rows', items:[
      E('Warning: Each child in a list should have a unique "key" prop.', 'React（警告）', '配列から画面を作るとき、各要素に一意の <code>key</code> が付いていない。', ['map() で作った要素に key を付け忘れた', 'key に配列の番号（index）を使っていて並べ替えでおかしくなる'], 'データのIDなど、変わらない一意の値を key に指定する。', 'リストのkey警告が出ます。各アイテムのidをkeyに設定して。idがなければ生成して持たせて。'),
      E('Error: Too many re-renders. React limits the number of renders to prevent an infinite loop.', 'React', '描画のたびに状態を更新して、無限に再描画している。', ['onClick={setCount(1)} のように、関数を渡さず実行してしまっている', 'コンポーネントの本体で直接 setState している'], '<code>onClick={() => setCount(1)}</code> のように関数で包む。', 'Too many re-renders エラーが出ます。レンダリング中にstateを更新している箇所を探して直して。'),
      E('Error: Hydration failed because the server rendered HTML didn\'t match the client.', 'Next.js', 'サーバーで作ったHTMLと、ブラウザで作り直したHTMLが一致しない。', ['日時・乱数など、実行するたびに変わる値を表示した', 'localStorage や window の値を最初の描画で使った', '<p>の中に<div>を入れるなど不正なHTMLの入れ子'], 'ブラウザでしか分からない値は useEffect の中で読む、またはそのコンポーネントをクライアント側だけで描画する。', 'Hydrationエラーが出ます。サーバーとブラウザで表示が変わる部分（日時・localStorage等）を特定して、useEffect内で設定するように直して。'),
      E('Error: Objects are not valid as a React child', 'React', 'オブジェクトをそのまま画面に表示しようとした。', ['{user} のようにオブジェクトを丸ごと表示した', 'Dateオブジェクトをそのまま表示した'], '<code>{user.name}</code> のように中の値を表示する。日付は文字列に変換。', '「Objects are not valid as a React child」エラーが出ます。オブジェクトを表示している箇所を、適切なプロパティの表示に直して。'),
      E('Error: Invalid hook call. Hooks can only be called inside of the body of a function component.', 'React', 'useState などのフックを、使ってはいけない場所で呼んだ。', ['if文やループの中、普通の関数の中でフックを呼んだ', 'Reactが2重にインストールされている'], 'フックはコンポーネント（またはカスタムフック）の一番上でだけ呼ぶ。', 'Invalid hook call エラーが出ます。フックの呼び出し位置を確認して、ルールに従うように直して。'),
      E('React Hook useEffect has a missing dependency', 'React（ESLint警告）', 'useEffectの中で使っている値が、依存配列に入っていない。', ['依存配列 [] に必要な値を書き忘れた'], '使っている値を依存配列に入れる。入れると無限ループになる場合は、関数を useCallback で包むなど設計を見直す。', 'useEffectの依存配列の警告が出ます。正しい依存関係にして、無限ループにならないように直して。'),
    ]},
    { title:'Next.js・SSR', layout:'rows', items:[
      E('ReferenceError: window is not defined / document is not defined', 'Next.js（SSR）', 'サーバー（Node.js）にはブラウザの window や document がない。', ['サーバーで実行される場所でブラウザの機能を使った', 'ブラウザ専用のライブラリ（地図・グラフ等）を普通にimportした'], '<code>"use client"</code> を付ける、useEffect内で使う、<code>dynamic(() => import(...), { ssr: false })</code> で読み込む。', 'window is not defined エラーが出ます。ブラウザ専用の処理がクライアント側だけで実行されるように直して。'),
      E('You\'re importing a component that needs useState. This React Hook only works in a Client Component.', 'Next.js App Router', 'サーバーコンポーネントで useState などを使った。', ['ファイルの先頭に "use client" がない'], 'インタラクティブな部品のファイルの先頭に <code>"use client";</code> を書く。ページ全体ではなく、必要な部品だけに付けるのが理想。', 'このエラーが出ます。useStateを使う部品を切り出して"use client"を付けて。ページ自体はサーバーコンポーネントのままにして。'),
      E('Error: Invalid src prop ... hostname "xxx" is not configured under images in your `next.config.js`', 'Next.js', 'next/image で外部の画像を表示するには、ドメインの許可が必要。', ['外部サイトの画像URLをImageで表示した'], 'next.config の <code>images.remotePatterns</code> にドメインを追加する。', 'next/imageの外部画像エラーが出ます。next.configのremotePatternsに必要なドメインを追加して。'),
      E("Module not found: Can't resolve 'xxx'", 'ビルド', 'importしたファイルやパッケージが見つからない。', ['npm install していない', 'パスや大文字小文字の間違い（WindowsではOKでもLinuxのサーバーで失敗）', 'エイリアス（@/）の設定漏れ'], 'パッケージなら <code>npm install xxx</code>、ファイルならパスと大文字小文字を確認。', 'Module not found エラーが出ます。パッケージの不足かパスの間違いかを確認して直して。'),
    ]},
  ]
});

TABS.push({
  id:'node', label:'Node.js・npm', icon:'⬢',
  intro:'Node.js・npm（パッケージ管理）で出るエラー。<b>Windows特有のつまずき</b>も含みます。',
  sections:[
    { title:'環境・インストール', layout:'rows', items:[
      E("'node' は、内部コマンドまたは外部コマンド、操作可能なプログラムまたはバッチ ファイルとして認識されていません。 / command not found: node", 'Node.js', 'Node.jsがインストールされていない、またはパス（PATH）が通っていない。', ['Node.jsを未インストール', 'インストール後にターミナルを開き直していない'], '公式サイトかバージョン管理ツール（fnm・nvm-windows・Volta）でインストールし、ターミナルを開き直す。', 'Node.jsが見つからないと言われます。Windowsで、バージョン管理ができる方法でNode.jsのLTS版をインストールする手順を教えて。'),
      E('このシステムではスクリプトの実行が無効になっているため、ファイル ...ps1 を読み込むことができません。', 'Windows PowerShell', 'PowerShellの安全設定（実行ポリシー）で、npm・npx などのスクリプトがブロックされた。', ['Windowsの初期設定のまま npm や venv の activate を実行した'], '自分のユーザーだけ許可する：<code>Set-ExecutionPolicy -Scope CurrentUser RemoteSigned</code>（内容を理解した上で）。またはコマンドプロンプト（cmd）を使う。', 'PowerShellで「スクリプトの実行が無効」と出てnpmが使えません。安全に解決する方法と、その設定の意味を教えて。', ['Windows頻出']),
      E('npm ERR! code ERESOLVE  unable to resolve dependency tree', 'npm', 'パッケージ同士のバージョンの要求がぶつかっている（依存関係の衝突）。', ['古いライブラリが新しいReactに対応していない'], '対応バージョンのライブラリに更新する。急ぎなら <code>npm install --legacy-peer-deps</code>（根本解決ではない）。', 'npm install でERESOLVEエラーが出ます。どのパッケージ同士が衝突しているか説明して、正しいバージョンの組み合わせを提案して。'),
      E("npm ERR! enoent Could not read package.json", 'npm', 'package.json が見つからない。', ['プロジェクトのフォルダではない場所でコマンドを実行した'], '<code>cd</code> でプロジェクトのフォルダへ移動してから実行する。', 'package.jsonが見つからないと言われます。今いるフォルダの確認方法と、正しいフォルダへの移動方法を教えて。'),
      E('gyp ERR! / node-gyp rebuild failed', 'npm', 'C++でできたパッケージのビルドに失敗した。', ['ビルドツール（Visual Studio Build Tools、Python）がない', 'Node.jsのバージョンが新しすぎてパッケージが未対応'], 'Node.jsをLTS版にする、ビルド済みの代替パッケージを使う（例：bcrypt → bcryptjs）。', 'node-gypのビルドエラーが出ます。Node.jsのバージョンとパッケージの対応を確認して、ビルド不要の代替があれば提案して。'),
    ]},
    { title:'実行時', layout:'rows', items:[
      E('Error: listen EADDRINUSE: address already in use :::3000', 'Node.js', 'そのポート番号（3000）は、別のプログラムがすでに使っている。', ['前回起動した開発サーバーが残っている', '別のアプリが同じポートを使っている'], '前のサーバーを Ctrl+C で止める、または別のポートで起動する。Windowsは <code>netstat -ano | findstr :3000</code> で使っているプロセスを確認できる。', 'ポート3000が使用中と言われます。使っているプロセスを確認して止める方法（Windows）と、別ポートで起動する方法を教えて。', ['頻出']),
      E("Error: Cannot find module 'xxx'", 'Node.js', '指定したモジュールが見つからない。', ['npm install していない／失敗している', 'ファイルパスの間違い'], '<code>npm install</code> を実行。それでもダメなら node_modules と package-lock.json を削除して入れ直す。', 'Cannot find module エラーが出ます。依存関係を入れ直す手順と、パスの確認をして。'),
      E('Error [ERR_REQUIRE_ESM]: require() of ES Module ... not supported', 'Node.js', 'ESモジュール専用のパッケージを、古い書き方（require）で読み込んだ。', ['新しいバージョンのパッケージがESM専用になった'], 'import文に書き換える（package.jsonに "type": "module"）、または対応する古いバージョンを使う。', 'ERR_REQUIRE_ESMエラーが出ます。このプロジェクトをESモジュール（import/export）に統一して。'),
      E('FATAL ERROR: ... JavaScript heap out of memory', 'Node.js', 'メモリ不足。', ['巨大なデータを一度に読み込んだ', 'ビルドが大きすぎる', '無限に配列が増えている'], 'データを分割して処理する。一時的に <code>NODE_OPTIONS=--max-old-space-size=4096</code> で上限を上げる。', 'heap out of memory が出ます。どこでメモリを使いすぎているか調べて、分割して処理するように直して。'),
      E('process.env.XXX が undefined になる', 'Node.js・環境変数', '環境変数が読み込まれていない。', ['.env ファイルの場所・名前が違う', 'dotenv を読み込んでいない', 'Vite では VITE_、Next.js のブラウザ側では NEXT_PUBLIC_ の接頭辞が必要', '.env を変更した後にサーバーを再起動していない'], 'ファイル名・場所・接頭辞を確認し、サーバーを再起動する。本番（Vercel等）では管理画面で環境変数を設定する。', '環境変数がundefinedになります。.envの場所と書き方、フレームワークごとの接頭辞（VITE_ / NEXT_PUBLIC_）、読み込み方法を確認して直して。', ['頻出']),
    ]},
  ]
});

TABS.push({
  id:'python', label:'Python', icon:'Py',
  intro:'Pythonでよく出るエラー。Windowsの日本語環境ならではの<b>文字コード（cp932）エラー</b>は特に頻出です。',
  sections:[
    { title:'環境・インストール', layout:'rows', items:[
      E("ModuleNotFoundError: No module named 'xxx'", 'Python', 'ライブラリがインストールされていない、または別のPython環境に入っている。', ['pip install していない', '仮想環境（venv）を有効化していない／別の環境で実行している', 'パッケージ名とimport名が違う（例：pip install opencv-python → import cv2）'], '<code>python -m pip install xxx</code>（実行するPythonと同じ環境に入れる）。仮想環境を有効化してから実行。', 'ModuleNotFoundErrorが出ます。どのPythonで実行されていて、どこにパッケージが入っているか確認する方法と、正しく入れる手順を教えて。', ['最頻出']),
      E("Python was not found; run without arguments to install from the Microsoft Store", 'Windows', 'Windowsの「アプリ実行エイリアス」がMicrosoft Storeに案内している（Pythonが入っていないか、パスが通っていない）。', ['python.org からインストールした際に「Add to PATH」にチェックしなかった'], 'Pythonを入れ直して「Add python.exe to PATH」にチェック。または <code>py</code> コマンドを使う。設定の「アプリ実行エイリアス」でpythonをオフにする。', 'Windowsでpythonコマンドが使えません。PATHの確認方法と、pyランチャーを使う方法を教えて。'),
      E('error: externally-managed-environment', 'Python（Mac/Linux）', 'OSが管理しているPythonに直接パッケージを入れることが禁止されている。', ['システムのPythonに pip install した'], '仮想環境を作る：<code>python3 -m venv .venv</code> → <code>source .venv/bin/activate</code> → pip install。またはuvを使う。', 'externally-managed-environmentエラーが出ます。プロジェクト用の仮想環境（またはuv）でパッケージを管理する手順を教えて。'),
    ]},
    { title:'文法・実行時', layout:'rows', items:[
      E('IndentationError: unexpected indent / expected an indented block', 'Python', '字下げ（インデント）がおかしい。Pythonでは字下げが文法の一部。', ['スペースとタブが混ざっている', 'コピペで字下げがずれた', 'if や def の次の行を字下げしていない'], 'エディタでスペース4つに統一する。', 'IndentationErrorが出ます。ファイル全体の字下げをスペース4つに統一して直して。'),
      E("UnicodeDecodeError: 'cp932' codec can't decode byte ...", 'Python（Windows）', 'ファイルを読むとき、Windowsの日本語の文字コード（cp932=Shift_JIS）として読もうとして失敗した。', ['UTF-8のファイルを encoding 指定なしで open() した'], '<code>open(path, encoding="utf-8")</code> と明示する。CSVなら <code>pd.read_csv(path, encoding="utf-8")</code>（Excel由来なら "cp932" や "utf-8-sig"）。', "cp932のUnicodeDecodeErrorが出ます。ファイルを開くすべての箇所でencodingを明示して直して。", ['Windows頻出']),
      E("UnicodeEncodeError: 'cp932' codec can't encode character", 'Python（Windows）', '絵文字などをWindowsのコンソールに表示・保存しようとして失敗した。', ['print() で絵文字を出力した', 'ファイルにencoding指定なしで書き込んだ'], '書き込みは <code>encoding="utf-8"</code>。表示は環境変数 <code>PYTHONUTF8=1</code> を設定（UTF-8モード）。', 'UnicodeEncodeErrorが出ます。WindowsでもUTF-8で入出力されるように直して。'),
      E("TypeError: 'NoneType' object is not subscriptable", 'Python', '中身が None（何もない）のものに [ ] でアクセスした。', ['関数がreturnし忘れてNoneを返した', '検索結果が見つからずNoneが返った（BeautifulSoupのfind等）'], 'Noneかどうか確認してから使う：<code>if result is not None:</code>', 'NoneTypeのエラーが出ます。どの値がNoneになっているか調べて、見つからない場合も落ちないように直して。'),
      E("KeyError: 'xxx' / IndexError: list index out of range", 'Python', '辞書に存在しないキー、リストに存在しない番号を指定した。', ['APIの返す形が想定と違う', '空のリストの[0]'], '<code>dict.get("xxx")</code> を使う、長さを確認してから参照する。', 'KeyErrorが出ます。実際のデータの形を確認するprintを入れて、キーがない場合も安全に処理するように直して。'),
      E('グラフの日本語が □□□（豆腐）になる', 'Python（matplotlib）', 'matplotlibの標準フォントに日本語が含まれていない。', ['日本語フォントを指定していない'], '<code>pip install japanize-matplotlib</code> して <code>import japanize_matplotlib</code>、または日本語フォントを指定する。', 'matplotlibのグラフで日本語が豆腐になります。日本語が表示されるように設定して。'),
      E('ssl.SSLCertVerificationError: CERTIFICATE_VERIFY_FAILED', 'Python', 'HTTPS通信の証明書を確認できなかった。', ['Macで証明書がインストールされていない（Install Certificates.command）', '社内ネットワークのプロキシ'], 'Macは同梱の「Install Certificates.command」を実行。<b>verify=False で無効化するのは危険</b>なので避ける。', 'SSL証明書のエラーが出ます。証明書の検証を無効にせずに解決する方法を教えて。'),
    ]},
  ]
});

TABS.push({
  id:'git', label:'Git・GitHub', icon:'⑂',
  intro:'Git（変更履歴の管理）とGitHubでよく出るエラー。<b>焦って強制的なコマンド（--force）を使う前に</b>、AIに状況を見せて相談しましょう。状況別の戻し方は <a href="git-terminal.html#undo">Git・ターミナル・開発環境辞典</a> の逆引き表も。',
  sections:[
    { title:'よくあるエラー', layout:'rows', items:[
      E('fatal: not a git repository (or any of the parent directories): .git', 'Git', 'Gitで管理されていないフォルダでgitコマンドを使った。', ['プロジェクト外のフォルダにいる', 'まだ git init していない'], '正しいフォルダへ移動するか、<code>git init</code> で管理を始める。', 'not a git repository と言われます。今のフォルダの確認と、Gitで管理を始める手順を教えて。'),
      E("! [rejected] main -> main (fetch first)  error: failed to push some refs", 'Git', 'GitHub側に、手元にない新しい変更がある（他の人やGitHub上で編集した）。', ['GitHubのWeb上でREADMEを編集した', '別のPCからpushした'], '<code>git pull</code> で取り込んでから push。<b>git push --force は他の変更を消すので使わない</b>。', 'pushがrejectedになります。リモートの変更を安全に取り込んでからpushする手順を教えて。force pushは使わないで。', ['頻出']),
      E('CONFLICT (content): Merge conflict in xxx', 'Git', '同じ場所が両方で変更されていて、自動でまとめられない（コンフリクト）。', ['同じファイルの同じ行を、別々に編集した'], 'ファイル内の <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code> 〜 <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code> の部分を見て、残す内容を選んで編集し、add・commitする。', 'マージコンフリクトが起きました。両方の変更内容を説明して、両方の意図を残す形で解決して。'),
      E('Permission denied (publickey) / remote: Support for password authentication was removed', 'GitHub', 'GitHubへの認証に失敗した。パスワードでのpushは使えない。', ['SSHキーを登録していない', 'HTTPSでパスワードを入力した'], 'GitHub CLI（<code>gh auth login</code>）でログインするのが最も簡単。またはSSHキー・Personal Access Tokenを使う。', 'GitHubへのpushで認証エラーになります。GitHub CLIでログインする手順を教えて。'),
      E('remote: error: File xxx is 123.45 MB; this exceeds GitHub\'s file size limit of 100.00 MB', 'GitHub', '100MBを超えるファイルはpushできない。', ['動画・データセット・node_modules をコミットした'], '<code>.gitignore</code> に追加し、履歴から取り除く。大きなファイルは Git LFS や外部ストレージへ。', '大きなファイルがpushできません。そのファイルを履歴から取り除いて、.gitignoreに追加する安全な手順を教えて。'),
      E('fatal: refusing to merge unrelated histories', 'Git', '関係のない2つの履歴をまとめようとした。', ['GitHubで「READMEあり」でリポジトリを作り、手元の別の履歴をpushしようとした'], '意図通りなら <code>git pull origin main --allow-unrelated-histories</code>。', 'unrelated histories エラーが出ます。状況を説明するので、安全な対処法を教えて。'),
      { name:'APIキーなどの秘密情報をpushしてしまった', en:'Leaked secret', tags:['緊急'], desc:'<b>まず、そのキーを発行元で無効化（再発行）する</b>のが最優先。ファイルを消してコミットし直しても、履歴やコピーには残っている。その後 .env を .gitignore に入れ、履歴からの削除も検討する。', prompt:'APIキーをGitHubにpushしてしまいました。今すぐやるべきことを優先順に教えて（キーの無効化→コードの修正→履歴の扱い）。' },
      { name:'LF will be replaced by CRLF（警告）', en:'Line endings', desc:'改行コードの違い（Windows＝CRLF、Mac/Linux＝LF）の警告。動作には通常問題ない。<code>.gitattributes</code> で統一するとよい。' },
    ]},
  ]
});

TABS.push({
  id:'deploy', label:'公開・サービス連携', icon:'☁',
  intro:'デプロイ（公開）後や、外部サービス（Supabase・Firebase・AI API）との連携で起きる問題。<b>「手元では動くのに本番で動かない」</b>の多くは環境変数とパスです。',
  sections:[
    { title:'デプロイ', layout:'rows', items:[
      { name:'手元では動くのに本番で動かない', en:'Works locally, fails in production', tags:['頻出'], desc:'①<b>環境変数を本番の管理画面に設定していない</b>（Vercel/Netlifyの設定画面）②ファイル名の大文字小文字（Windowsは区別しない、本番のLinuxは区別する）③APIのURLが localhost のまま ④ビルド時と実行時の環境変数の違い。', prompt:'ローカルでは動くのにVercelにデプロイすると動きません。環境変数の設定、ファイル名の大文字小文字、localhostのURLの残りなどを確認して。ビルドログはこれです：（貼る）' },
      E('Error: Command "npm run build" exited with 1', 'Vercel / Netlify', 'ビルド中にエラーが起きた。', ['TypeScriptの型エラー・ESLintのエラー（開発中は無視されていた）', '環境変数の不足', 'Node.jsのバージョン違い'], 'ビルドログの最初のエラーを探す。手元で <code>npm run build</code> を実行して同じエラーが出るか確認。', 'デプロイのビルドが失敗します。ログを貼るので原因を特定して、手元でも npm run build が通るように直して。'),
      { name:'ページを再読み込みすると404になる', en:'SPA routing 404', desc:'Reactなどの1ページアプリで、<code>/about</code> を直接開くとサーバーにそのファイルがなく404になる。<b>すべてのURLで index.html を返す設定</b>（Netlifyの _redirects、Vercelの rewrites、GitHub Pagesは 404.html の工夫）が必要。', prompt:'デプロイしたReactアプリで、/about などのページを再読み込みすると404になります。ホスティング先に合わせたリライト設定を追加して。' },
      { name:'GitHub Pagesで画像やCSSが読み込まれない', en:'Base path', desc:'GitHub Pagesは <code>https://ユーザー名.github.io/リポジトリ名/</code> で公開されるため、<code>/style.css</code> のような絶対パスがずれる。相対パスにするか、Viteなら <code>base: "/リポジトリ名/"</code> を設定。', prompt:'GitHub Pagesに公開したら画像とCSSが読み込まれません。パスの設定（Viteのbase）を直して。' },
    ]},
    { title:'BaaS・データベース', layout:'rows', items:[
      E('new row violates row-level security policy for table "xxx"', 'Supabase', 'RLS（行レベルセキュリティ）のルールで、その書き込みが許可されていない。', ['RLSを有効にしたがポリシー（許可ルール）を作っていない', 'user_id を入れずにinsertした', 'ログインしていない状態で書き込んだ'], '「ログインユーザーは自分のuser_idの行を作成できる」などのポリシーを作る。<b>RLSを無効にして解決しない</b>こと。', 'Supabaseでrow-level securityのエラーが出ます。テーブル定義を貼るので、本人だけが読み書きできる適切なRLSポリシーを作って。RLSは無効にしないで。'),
      E('FirebaseError: Missing or insufficient permissions.', 'Firebase', 'Firestoreのセキュリティルールで拒否された。', ['ルールが初期のまま（すべて拒否）', 'ログイン前に読み書きした', 'ルールのパスとコードのパスが違う'], 'ログイン状態とセキュリティルールを確認。テスト用の「誰でも読み書き可」のまま公開しない。', 'Firestoreで権限エラーが出ます。ログインユーザーが自分のデータだけ読み書きできるセキュリティルールを書いて。'),
      { name:'データベースに接続できない', en:'Connection refused / timeout / too many connections', desc:'接続文字列（URL・パスワード）の間違い、DBが休止中（無料プランは一定期間で一時停止することがある）、サーバーレス環境で接続を開きすぎ（接続プールを使う）など。', prompt:'データベースに接続できません。接続文字列の形式、DBの稼働状態、サーバーレス環境での接続プールの設定を確認して。' },
    ]},
    { title:'AI API・外部API', layout:'rows', items:[
      E('401 Unauthorized / invalid_api_key / authentication_error', 'API共通', 'APIキーが無効・間違い・未設定。', ['キーのコピーミス（前後の空白）', '環境変数が読み込まれていない', 'キーを無効化（再発行）した'], 'キーを再確認し、環境変数が読めているか（値は表示せず）長さだけログに出して確認する。', 'APIで401エラーになります。APIキーが正しく読み込まれているか、値を表示せずに確認する方法で調べて。'),
      E('429 rate_limit_exceeded / RESOURCE_EXHAUSTED / quota exceeded', 'API共通', '回数・トークン数の制限、または無料枠・残高を使い切った。', ['短時間に連続で呼び出した', '無料枠の上限に達した', '課金設定・クレジット残高がない'], '待ってから再試行（指数バックオフ）、結果のキャッシュ、プラン・上限の確認。', '429エラーが出ます。リトライ（指数バックオフ）とキャッシュを実装して、呼び出し回数を減らして。'),
      E('overloaded_error / 503 / 529', 'AI API', 'サービス側が混雑している。', ['アクセスが集中している時間帯'], '少し待って再試行。ユーザーには「混雑しています」と表示する。別モデルへの切り替えも検討。', 'AI APIが混雑エラーを返すことがあるので、自動リトライと、失敗時のユーザー向けメッセージを実装して。'),
      E('context_length_exceeded / maximum context length', 'AI API', '入力（会話履歴＋資料）が、モデルが一度に読める量を超えた。', ['会話履歴を全部送り続けた', '長い文書をそのまま入れた'], '古い履歴を要約・削除する、文書を分割する、必要な部分だけ検索して渡す（RAG）。', 'コンテキスト長の上限エラーが出ます。会話履歴が長くなったら古い部分を要約して短くする仕組みを入れて。'),
    ]},
  ]
});
})();
