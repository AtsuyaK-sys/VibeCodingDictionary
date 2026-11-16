/* 公開・品質チェック辞典 — チェックリスト（状態はブラウザに保存） */
(function(){
const C = (name, en, desc, prompt, code, tags) => ({ name, en, desc, prompt, code, tags, check:true });
const S = (title, items, note) => ({ title, note, layout:'rows', items });
function progress(el){
  const panel = el.closest('.panel');
  el.innerHTML = '<div class="progress-box"><span>このカテゴリの達成度</span><div class="bar"><i></i></div><b class="n"></b><button class="copy rs">チェックをすべて外す</button></div>';
  const upd = () => { const all = panel.querySelectorAll('.chk'), on = panel.querySelectorAll('.chk:checked'); el.querySelector('.bar i').style.width = (all.length ? on.length / all.length * 100 : 0) + '%'; el.querySelector('.n').textContent = `${on.length} / ${all.length}`; };
  document.addEventListener('vd-check', upd); upd();
  el.querySelector('.rs').onclick = () => { panel.querySelectorAll('.chk:checked').forEach(c => { c.checked = false; c.dispatchEvent(new Event('change')); }); };
}
const P = { title:'', custom: progress };

TABS.push({ id:'seo', label:'SEO・基本情報', icon:'⌕', intro:'検索エンジンに正しく理解してもらい、見つけてもらうための基本。<b>チェックはこのブラウザに保存</b>されます。', sections:[ P,
  S('ページの基本', [
    C('ページごとに固有のタイトル', '<title>', '各ページに内容を表す30字前後のタイトル。「ページ名｜サイト名」の形が定番。検索結果の見出しになる。', 'すべてのページに、内容に合った固有の<title>（30字前後、「ページ名｜サイト名」）を設定して。', '<title>料金プラン｜Lumen</title>', ['必須']),
    C('説明文（meta description）', 'meta description', '検索結果のタイトルの下に表示される説明（80〜120字）。クリックしたくなる要約を書く。', 'すべてのページにmeta descriptionを、内容を要約した80〜120字で設定して。', '<meta name="description" content="AIと一緒にアプリを作る新しいワークスペース。無料ではじめられます。">'),
    C('言語とビューポート', 'lang / viewport', '<code>&lt;html lang="ja"&gt;</code> と、スマホ表示用のviewport指定。忘れるとスマホで縮小表示になる。', null, '<html lang="ja">\n<meta name="viewport" content="width=device-width, initial-scale=1">'),
    C('見出しの構造', 'h1〜h6', '1ページにh1は1つ、その下にh2・h3と階層順に。見た目のためだけに見出しタグを使わない。', 'ページの見出し構造を確認して、h1は1つ、h2→h3の順番が飛ばないように直して。'),
    C('画像の代替テキスト', 'alt', '画像に内容を説明するalt属性。検索エンジンと読み上げソフトが画像を理解できる。飾りの画像は <code>alt=""</code>。', 'すべてのimgに内容を説明するalt属性を付けて。装飾目的の画像は alt="" にして。'),
    C('意味のあるHTML', 'Semantic HTML', 'header・nav・main・article・footer・button などを正しく使う。divだらけにしない。'),
    C('分かりやすいURL', 'Clean URL', '<code>/blog/vibe-coding-guide</code> のように内容が分かる短いURL。日本語URLは共有時に長い記号列になるので英数字推奨。'),
  ]),
  S('検索エンジン向けファイル', [
    C('sitemap.xml', 'Sitemap', 'サイト内のページ一覧。検索エンジンに全ページを伝える。多くのフレームワークで自動生成できる。', 'sitemap.xmlを自動生成するようにして、robots.txtにその場所を書いて。'),
    C('robots.txt', 'robots.txt', 'クロール（巡回）してよい範囲の指定。管理画面など見せたくないパスを除外。', null, 'User-agent: *\nDisallow: /admin/\nSitemap: https://example.com/sitemap.xml'),
    C('canonical（正規URL）', 'rel="canonical"', '同じ内容のページが複数のURLで見られる場合に、正式なURLを指定する。', null, '<link rel="canonical" href="https://example.com/pricing">'),
    C('構造化データ', 'JSON-LD / schema.org', '記事・商品・FAQ・パンくず・店舗情報などを機械が読める形で書くと、検索結果がリッチに表示されることがある。', 'このFAQページにschema.orgのFAQPageの構造化データ（JSON-LD）を追加して。'),
    C('Google Search Console に登録', 'Search Console', '検索での表示回数・クリック・エラーを確認できる無料ツール。サイトマップの送信もここから。'),
  ]),
]});

TABS.push({ id:'share', label:'SNS共有・アイコン', icon:'↗', intro:'URLをSNSやチャットに貼ったときの見え方（OGP）と、ブラウザのタブ・ホーム画面のアイコン。', sections:[ P,
  S('OGP（シェア時のカード）', [
    C('OGPの基本タグ', 'Open Graph', 'SNSにURLを貼ったときに表示されるタイトル・説明・画像。', 'OGPタグ（og:title, og:description, og:image, og:url, og:type）とTwitterカード（summary_large_image）を全ページに設定して。', '<meta property="og:title" content="Lumen — アイデアをすぐカタチに">\n<meta property="og:description" content="AIと一緒にアプリをつくるワークスペース">\n<meta property="og:image" content="https://example.com/ogp.png">\n<meta property="og:url" content="https://example.com/">\n<meta property="og:type" content="website">\n<meta name="twitter:card" content="summary_large_image">', ['必須']),
    C('OGP画像（1200×630px）', 'og:image', '横1200×縦630pxが標準。文字は中央寄りに大きく（端は切れることがある）。<b>絶対URL</b>（https://〜）で指定する。ページごとに自動生成する方法も（Vercel OG等）。', 'ブログ記事ごとに、タイトル入りのOGP画像（1200×630）を自動生成するようにして。'),
    C('シェアの見え方を確認', 'Preview', '各SNSのカード確認ツールや、チャットに自分宛てに貼って確認。キャッシュが残るので、変更後は再取得させる。'),
  ]),
  S('アイコン', [
    C('ファビコン', 'favicon', 'ブラウザのタブに表示される小さなアイコン。SVGなら1つで済む。', 'favicon.svg と、32px・180pxのPNGアイコンを用意して、headに設定して。', '<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n<link rel="icon" href="/favicon-32.png" sizes="32x32">'),
    C('Apple Touch Icon', 'apple-touch-icon', 'iPhoneのホーム画面に追加したときのアイコン（180×180px）。', null, '<link rel="apple-touch-icon" href="/apple-touch-icon.png">'),
    C('Web App Manifest', 'manifest.json', 'PWA（ホーム画面に追加するアプリ）用の名前・アイコン・テーマ色。', null, '{\n  "name": "Lumen", "short_name": "Lumen",\n  "icons": [{ "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }],\n  "start_url": "/", "display": "standalone", "theme_color": "#15803d", "background_color": "#ffffff"\n}'),
    C('テーマカラー', 'theme-color', 'スマホのブラウザのアドレスバーの色。', null, '<meta name="theme-color" content="#15803d">'),
  ]),
]});

TABS.push({ id:'perf', label:'表示速度', icon:'⚡', intro:'表示が1秒遅れるごとに離脱が増えると言われます。<b>Lighthouse</b>（Chromeの開発者ツール内）で計測しながら改善しましょう。 Core Web Vitals やレイアウトのずれを体験しながら学ぶなら <a href="testing.html#perf">テスト・品質辞典</a> へ。', sections:[ P,
  S('画像・フォント', [
    C('画像を適切なサイズ・形式に', 'WebP / AVIF', '表示サイズより大きすぎる画像を使わない。WebP/AVIFで軽量化。写真は1枚数百KB以内が目安。', 'すべての画像をWebPに変換して、表示サイズに合わせて縮小し、srcsetで画面幅に応じて出し分けて。'),
    C('画像の遅延読み込み', 'loading="lazy"', '画面外の画像は、スクロールで近づいてから読み込む。ただし最初に見える大きな画像（ヒーロー）には付けない。', null, '<img src="photo.webp" alt="..." loading="lazy" width="800" height="600">'),
    C('画像に幅と高さを指定', 'width / height', '読み込み時にレイアウトがガクッとずれるのを防ぐ（CLS対策）。', 'すべての画像にwidthとheight（またはaspect-ratio）を指定して、読み込み時のレイアウトのずれを防いで。'),
    C('Webフォントを絞る', 'Font loading', '日本語フォントは重い。書体・太さを絞り、<code>display=swap</code> と preconnect を指定する。'),
  ]),
  S('コード・配信', [
    C('Core Web Vitals を確認', 'LCP / INP / CLS', '<b>LCP</b>＝一番大きな要素の表示時間（2.5秒以内）、<b>INP</b>＝操作への反応の速さ（200ms以内）、<b>CLS</b>＝表示中のレイアウトのずれ（0.1以下）。Googleの評価指標。', 'Lighthouseのスコアを計測して、LCP・INP・CLSのうち悪いものを改善して。'),
    C('不要なJavaScriptを減らす', 'Bundle size', '使っていないライブラリを削除、大きなライブラリは必要なときだけ読み込む（動的import）。'),
    C('キャッシュ・CDN', 'Caching', 'ホスティング（Vercel/Cloudflare/Netlify）を使えば基本的に自動。APIの結果も必要に応じてキャッシュ。'),
    C('APIの呼び出しを減らす', 'Fewer requests', '同じデータを何度も取得しない、まとめて取得する、読み込み中はスケルトン表示。'),
  ]),
]});

TABS.push({ id:'security', label:'セキュリティ', icon:'🔒', intro:'公開前に必ず確認したい項目。<b>AIが作ったコードでも、ここは人間が確認</b>しましょう。攻撃の仕組みやAIコードの危険パターンは <a href="security.html">セキュリティ・認証辞典</a> で詳しく。', sections:[ P,
  S('秘密情報', [
    C('APIキーをフロントに置かない', 'No secrets in client', 'HTML・ブラウザ用JS・VITE_/NEXT_PUBLIC_付きの環境変数に秘密のキーを入れると、誰でも見られる。サーバー側から呼ぶ。', 'コード全体を確認して、ブラウザに露出しているAPIキーや秘密情報がないか調べて。あればサーバー側に移して。', null, ['最重要']),
    C('.env をGitに入れない', '.gitignore', '.env を .gitignore に追加。リポジトリに <code>.env.example</code>（値は空）を置いて必要な項目だけ共有。', null, '# .gitignore\n.env\n.env.local'),
    C('漏れたキーは無効化', 'Rotate keys', 'キーを公開してしまったら、削除して終わりではなく<b>発行元で無効化して再発行</b>する。'),
  ]),
  S('入力とデータ', [
    C('入力値をサーバーでも検証', 'Server-side validation', 'フロントのチェックは回避できる。サーバー側でも型・長さ・形式を検証する（Zodなど）。'),
    C('XSS対策', 'Escape output', 'ユーザーの入力をそのままHTMLに入れない（innerHTMLに直接入れない）。Markdownを表示するならDOMPurifyでサニタイズ。', 'ユーザー入力を表示している箇所でXSSの危険がないか確認して、innerHTMLを使っている箇所はtextContentかサニタイズに直して。'),
    C('SQLインジェクション対策', 'Parameterized queries', 'SQLを文字列連結で作らない。ORMやプレースホルダーを使う。'),
    C('DBのアクセス制御', 'RLS / Security Rules', 'Supabaseは全テーブルでRLSを有効化しポリシーを設定。Firebaseはセキュリティルールを「誰でも読み書き可」のまま公開しない。', '全テーブルのRLSポリシーを確認して、本人のデータしか読み書きできないことをテストして。', null, ['頻出事故']),
    C('権限チェック', 'Authorization', '「ログインしているか」だけでなく、「その人がそのデータを操作してよいか」をサーバーで確認する（他人のIDを指定した削除を防ぐ）。'),
  ]),
  S('運用', [
    C('HTTPS', 'HTTPS only', '主要ホスティングでは自動。独自ドメインでも証明書が有効か確認。'),
    C('依存パッケージの脆弱性', 'npm audit', '<code>npm audit</code> で既知の脆弱性を確認。GitHubのDependabotで自動通知も。'),
    C('レート制限', 'Rate limiting', 'ログイン・問い合わせ・AI APIを呼ぶエンドポイントに回数制限。スパムや料金の暴走を防ぐ。', 'お問い合わせフォームとAIチャットのAPIに、IPごとのレート制限（1分5回など）を入れて。'),
    C('外部サービスの利用上限', 'Budget alerts', 'クラウド・AI APIに予算アラートと利用上限を設定。', null, null, ['お金を守る']),
    C('セキュリティヘッダー', 'CSP / X-Frame-Options など', 'Content-Security-Policy などのヘッダーで、攻撃の被害を減らす。ホスティングの設定ファイルで指定できる。'),
  ]),
]});

TABS.push({ id:'a11y', label:'アクセシビリティ', icon:'♿', intro:'誰でも使えるようにするための確認。結果的に、すべてのユーザーにとって使いやすくなります。 コントラストや自動チェックを試すなら <a href="testing.html#a11y">テスト・品質辞典</a> へ。', sections:[ P,
  S('見る・読む', [
    C('文字と背景のコントラスト', 'Contrast 4.5:1', '本文は4.5:1以上。薄いグレーの文字に注意。（配色・タイポグラフィ辞典のチェッカーで確認できる）', null, null, ['必須']),
    C('色だけで情報を伝えない', 'Not color alone', 'エラーを赤色だけで示さず、アイコンや文字でも示す。グラフは色＋模様やラベル。'),
    C('文字サイズを拡大しても崩れない', 'Zoom 200%', 'ブラウザで200%に拡大しても読める。文字サイズにpxを固定しすぎない。'),
    C('動きを減らす設定に対応', 'prefers-reduced-motion', '視差効果や自動再生のアニメーションを、OSの設定に応じて止める。'),
  ]),
  S('操作する', [
    C('キーボードだけで操作できる', 'Keyboard', 'Tabキーで全てのボタン・リンク・入力欄に移動でき、Enter/Spaceで操作できる。', 'キーボード（Tab・Enter・Esc・矢印キー）だけで全機能を操作できるか確認して、できない箇所を直して。'),
    C('フォーカスが見える', 'Focus visible', '今どこを選択しているかの枠が見える。<code>outline: none</code> で消さない（消すなら代わりを用意）。'),
    C('フォームにラベル', 'Labels', '入力欄に <code>&lt;label&gt;</code> を関連付ける。placeholderだけで済ませない。'),
    C('ボタンとリンクに分かりやすい名前', 'Accessible names', 'アイコンだけのボタンには aria-label。「こちら」ではなく内容が分かるリンク文。'),
    C('タップしやすい大きさ', 'Touch target', 'スマホのボタン・リンクは44×44px程度以上。'),
  ]),
]});

TABS.push({ id:'legal', label:'法務・運用', icon:'§', intro:'個人開発でも、公開・収益化するなら確認したいこと。<b>具体的な判断は専門家や公式の情報で確認</b>してください。 お金を受け取るなら <a href="payments.html#law">決済・収益化辞典の「日本の法律とルール」</a> も確認を。', sections:[ P,
  S('ページ・表記', [
    C('プライバシーポリシー', 'Privacy Policy', '個人情報（メール・名前）やアクセス解析・Cookieを使うなら、何を・何のために・どう扱うかを示す。'),
    C('利用規約', 'Terms of Service', 'ユーザー登録や投稿機能があるサービスは、禁止事項・免責・アカウント停止などを定める。'),
    C('特定商取引法に基づく表記', '特商法表記', 'ネットで商品やサービスを<b>販売する</b>場合に必要（事業者名・連絡先・価格・返品条件など）。'),
    C('お問い合わせ窓口', 'Contact', 'ユーザーが連絡できる手段（フォーム・メール）。'),
    C('著作権・ライセンス表記', 'Credits / Licenses', '使った素材（画像・フォント・音楽・アイコン）や、データ提供元（地図・API）のクレジット表記。オープンソースのライセンス表示。'),
    C('Cookie同意', 'Cookie Consent', '広告や解析のCookieを使う場合、特に海外ユーザーがいるなら同意の取得を検討。'),
  ]),
  S('運用の準備', [
    C('アクセス解析', 'Analytics（GA4 / Cloudflare Web Analytics / Plausible）', 'どのページがどれだけ見られているか。プライバシーに配慮した軽量な解析ツールもある。'),
    C('エラー監視', 'Error monitoring（Sentry）', '本番で起きたエラーを自動で通知・記録。ユーザーに言われる前に気づける。'),
    C('404ページ', 'Custom 404', 'ページが見つからないときに、トップや検索への導線がある親切なページ。'),
    C('バックアップ', 'Backup', 'DBのバックアップ設定、コードはGitHubに。ユーザーデータを失わない仕組み。'),
    C('独自ドメイン', 'Custom Domain', '信頼感と覚えやすさ。ホスティングの設定画面からDNSを設定。更新忘れに注意（自動更新に）。'),
    C('問い合わせ・障害時の連絡方法', 'Status / Support', '障害時にお知らせする場所（SNS・ステータスページ）を決めておく。'),
  ]),
]});

TABS.push({ id:'final', label:'公開直前チェック', icon:'🚀', intro:'最後にざっと確認するリスト。AIに「公開前チェックをして」と頼むときにも使えます。', sections:[ P,
  S('動作確認', [
    C('スマホ実機で確認', 'Real devices', 'iPhone（Safari）とAndroid（Chrome）の実機で、表示・操作・フォーム入力を確認。'),
    C('主要ブラウザで確認', 'Cross-browser', 'Chrome・Safari・Edge・Firefoxで表示崩れがないか。'),
    C('全リンク・ボタンの確認', 'Links', 'リンク切れ、押しても何も起きないボタンがないか。'),
    C('フォームの送信テスト', 'Forms', '正常な送信、エラー時の表示、送信完了メールが届くか。'),
    C('ログイン・ログアウト・パスワード再設定', 'Auth flows', '新規登録から退会まで一通り。'),
    C('空の状態・エラー状態', 'Edge states', 'データ0件・通信失敗・長すぎる文字列でも崩れないか。'),
    C('本番の環境変数', 'Production env', '本番の管理画面に環境変数を設定したか。テスト用のキーのままになっていないか。'),
    C('テスト用データ・デバッグ表示の削除', 'Cleanup', 'console.log、テスト用アカウント、ダミーデータ、TODOコメントの残り。'),
  ]),
  S('AIに頼む', [
    { name:'公開前の総点検を依頼する', en:'Pre-launch review prompt', desc:'このページのチェック項目をまとめてAIに確認させる指示文。結果は必ず自分でも確認する。', prompt:'このプロジェクトを公開する前の総点検をして。以下の観点で問題を洗い出し、重要度（高・中・低）付きの表にして：\n1. セキュリティ（APIキーの露出、RLS、入力検証、XSS）\n2. SEO（title、description、OGP、h1、alt、sitemap）\n3. 表示速度（画像サイズ、遅延読み込み、不要なJS）\n4. アクセシビリティ（コントラスト、キーボード操作、ラベル）\n5. スマホ表示（375px幅での崩れ）\n6. 法務（プライバシーポリシー、クレジット表記）\n修正は私が確認してから行って。' },
  ]),
]});
})();
