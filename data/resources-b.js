/* 無料素材・リソース辞典 — 追加分：フォント・動画・ゲーム素材・ツールの追加と、AI生成素材の扱い */
(function(){
const R = (name, en, desc, tags, url) => ({ name, en, desc, tags, url });
const T = (name, en, desc, prompt, tags) => ({ name, en, desc, prompt, tags });
const S = (title, items, note) => ({ title, note, layout:'rows', items });
const add = (id, sec) => { const t = TABS.find(x => x.id === id); if (t) t.sections.push(sec); };

add('font', S('もっと探す', [
  R('LINE Seed JP', 'seed.line.me', 'LINE ヤフーのコーポレートフォント。親しみやすいゴシック体で、オープンなライセンス（SIL OFL）で配布されています。', ['日本語','OFL'], 'https://seed.line.me/'),
  R('源ノ角ゴシック / 源ノ明朝', 'github.com/adobe-fonts', 'Adobe と Google が共同開発した、日本語・中国語・韓国語に対応する大きなフォント。Noto Sans/Serif CJK と同じ中身です。', ['日本語','OFL'], 'https://github.com/adobe-fonts/source-han-sans'),
  R('Fontsource', 'fontsource.org', 'Google Fonts などのフォントを npm のパッケージとして入れ、<b>自分のサーバーから配信</b>できる。外部への通信を減らしたいときに。', ['開発者向け'], 'https://fontsource.org/'),
  R('Font Squirrel', 'fontsquirrel.com', '商用利用できる欧文フリーフォントを集めたサイト。フォントごとにライセンスを確認できます。', ['欧文'], 'https://www.fontsquirrel.com/'),
  R('UDEV Gothic / 白源（HackGen）', 'github.com/yuru7', 'プログラミング向けの日本語等幅フォント。0とO、1とlなど見間違えやすい文字が区別しやすい。エディタやコードの見本に。', ['等幅','OFL'], 'https://github.com/yuru7/udev-gothic'),
], 'フォントもライセンスで使える範囲が決まります（Web・アプリへの埋め込み・ロゴなど）。'));

add('video', S('もっと探す', [
  R('Videvo', 'videvo.net', '動画素材と効果音。無料の素材と有料の素材が混ざっていて、無料の中にもクレジット表記が必要なものがあります。', ['要確認'], 'https://www.videvo.net/'),
  R('動画AC', 'video-ac.com', '日本の動画素材サイト。日本の風景や人物の素材が見つけやすい。無料会員はダウンロード数に制限あり。', ['日本'], 'https://video-ac.com/'),
  R('Internet Archive', 'archive.org', '古い映画やニュース映像など、パブリックドメインの映像も多い。ただし資料ごとに権利の状態がちがうので、説明欄を確認。', ['パブリックドメイン','要確認'], 'https://archive.org/details/movies'),
  R('Wikimedia Commons（動画）', 'commons.wikimedia.org', '自由なライセンスの動画も多数。CC BY・CC BY-SA が多いので、クレジット表記の条件に従う。', ['CC'], 'https://commons.wikimedia.org/'),
]));

add('game', S('もっと探す', [
  R('Game-icons.net', 'game-icons.net', '剣・盾・魔法など、ゲーム向けのアイコンが4,000点以上。色や背景を変えて SVG / PNG で書き出せる（CC BY 3.0：クレジット表記が必要）。', ['アイコン','CC BY'], 'https://game-icons.net/'),
  R('CraftPix.net（無料素材）', 'craftpix.net/freebies', '2Dゲーム用のキャラクター・タイル・背景・UI。無料の素材コーナーがあり、商用利用の条件はサイトの規約で確認。', ['2D'], 'https://craftpix.net/freebies/'),
  R('Lospec', 'lospec.com', 'ドット絵用のカラーパレット集（「パレットリスト」）と、ドット絵のツール・チュートリアル。色数を決めると絵の統一感が出ます。', ['ドット絵','パレット'], 'https://lospec.com/palette-list'),
  R('Mixamo', 'mixamo.com', 'Adobe の無料サービス。3D キャラクターに、歩く・走る・踊るなどのアニメーションを自動で付けられる（Adobe アカウントが必要）。', ['3D','アニメーション'], 'https://www.mixamo.com/'),
]));

add('tool', S('モックアップ・配色・見せ方のツール', [
  R('Adobe Color', 'color.adobe.com', '色相環から配色を作る・写真から配色を取り出す・アクセシビリティ（色覚）の確認ができる。', ['配色'], 'https://color.adobe.com/'),
  R('WebAIM Contrast Checker', 'webaim.org', '文字と背景のコントラスト比を確かめる定番ツール（<a href="accessibility.html#color">アクセシビリティ辞典</a>でも体験できます）。', ['アクセシビリティ'], 'https://webaim.org/resources/contrastchecker/'),
  R('Shots.so', 'shots.so', 'スクリーンショットを、スマホやパソコンの画面にはめ込んだ「モックアップ画像」にできる。紹介ページや SNS 用に。', ['モックアップ'], 'https://shots.so/'),
  R('Carbon', 'carbon.now.sh', 'コードを、見やすい画像（スクリーンショット風）にする。説明資料や SNS でコードを見せるときに。', ['コード'], 'https://carbon.now.sh/'),
  R('Haikei', 'haikei.app', '波・ぼかし・図形などの SVG 背景を作れる。Webサイトの背景やヘッダーに。', ['背景','SVG'], 'https://haikei.app/'),
  R('fffuel', 'fffuel.co', 'ノイズ・グラデーション・パターンなど、SVG の素材を作るツールの詰め合わせ。', ['SVG'], 'https://www.fffuel.co/'),
]));

TABS.push({ id:'ai', label:'AI生成素材の扱い', icon:'✨', intro:'画像生成AIで素材を作る・素材サイトでAI生成の素材を選ぶ、が当たり前になってきました。便利な一方で、<b>素材サイトの規約・AIサービスの規約・既存作品との類似</b>の3つに気をつけます。くわしい考え方は <a href="licenses.html#ai">著作権・ライセンス・AIのルール辞典</a> へ。', sections:[
  S('使う前に', [
    T('素材サイトのAIに関する規約', 'Asset terms & AI', '「素材をAIの学習に使わない」「AIに入力して似た素材を作らない」と決めている素材サイトが増えています。<b>素材を画像生成AIに入れる前</b>に規約を確認します。', '次の素材サイトの利用規約から、AIに関するルール（学習への利用・AIへの入力・AI生成素材の扱い）を抜き出して要約して。\n【規約の本文やURL】', ['最重要']),
    T('素材サイトの中のAI生成素材', 'AI-generated stock', 'ストック素材サイトには、AIで作られた素材も並んでいます（「AI生成」の表示があるサイトも）。実在の場所や人物の写真として使うと誤解を招くことがあるので、用途に合うか考えます。'),
    T('AIサービスの商用利用', 'Commercial use of AI output', '画像生成AIは、<b>プランによって商用利用の可否</b>が違うことがあります。仕事で使う前に、使っているサービスとプランの規約を確認します。', null, ['注意']),
    T('既存の作品に似ていないか', 'Similarity check', '作家名や作品名を入れて作った画像、有名なキャラクターに似た画像は、権利の問題になりえます。画像検索で似たものがないか確かめます。'),
    T('人物とロゴ', 'People & logos', 'AIで作った人物が実在の人に似ていないか、知らない会社のロゴのようなものが紛れ込んでいないかを確認します。'),
  ]),
  S('使うとき・使ったあと', [
    T('作った記録を残す', 'Keep records', '使ったサービス・日付・プロンプト・元にした自分の素材を記録しておくと、あとで説明が必要になったときに役立ちます。'),
    T('AI生成であることの表示', 'Disclosure', '法律で一律に義務があるわけではありませんが、SNS・動画サイト・コンテストのルールで表示を求められることがあります（<a href="licenses.html#ai">AIと著作権</a>）。'),
    T('仕上げは人の手で', 'Human finishing', '文字の崩れ・手の形・細部の不自然さは、人の目で確認して直します。手を入れた部分は、あなたの創作として説明しやすくもなります。'),
    T('素材集として配らない', 'No redistribution', 'AIで作った素材でも、元にした素材サイトやAIサービスの規約で、素材としての再配布が禁止されていることがあります。'),
    T('画像の作り方の言葉', 'Prompt vocabulary', '狙った画像を作るための言葉（光・構図・画風）は <a href="image-prompts.html">画像・イラスト表現辞典</a> にまとまっています。'),
  ]),
] });
})();
