/* 無料素材・リソース辞典 — R(名前, URL表示, 説明, タグ, URL) */
(function(){
const R = (name, en, desc, tags, url) => ({ name, en, desc, tags, url });
const S = (title, items, note) => ({ title, note, layout:'rows', items });
const LIC = { type:'caution', label:'注意', text:'「無料」でも、商用利用の可否・クレジット表記の要否・加工の可否・再配布の禁止などの条件は素材サイトごと、素材ごとに異なります。使う前に必ず各サイトの利用規約を確認し、出典をメモしておきましょう。' };

TABS.push({ id:'icon', label:'アイコン', icon:'☆', intro:'Webやアプリで使うアイコン。<b>1つのサイトでは1つのアイコンセットに統一</b>すると、線の太さや雰囲気が揃ってきれいに見えます。', sections:[
  S('アイコンセット', [
    R('Lucide', 'lucide.dev', '線のシンプルなアイコン1,500点以上。shadcn/uiの標準。React・Vue・素のSVGで使える。', ['ISCライセンス','定番'], 'https://lucide.dev/'),
    R('Heroicons', 'heroicons.com', 'Tailwind CSSの開発元によるアイコン。線・塗りの2種類。', ['MIT'], 'https://heroicons.com/'),
    R('Material Symbols', 'fonts.google.com/icons', 'Googleのアイコン。太さ・塗り・角丸を可変フォントで調整できる。数が非常に多い。', ['Apache 2.0'], 'https://fonts.google.com/icons'),
    R('Tabler Icons', 'tabler.io/icons', '5,000点以上の線アイコン。統一感が高い。', ['MIT'], 'https://tabler.io/icons'),
    R('Phosphor Icons', 'phosphoricons.com', '6種類の太さ・スタイル（細線〜塗り〜2色）を切り替えられる。', ['MIT'], 'https://phosphoricons.com/'),
    R('Font Awesome', 'fontawesome.com', '老舗のアイコン集。無料版と有料版がある。ブランドロゴ（SNSなど）も充実。', ['無料版あり'], 'https://fontawesome.com/'),
    R('Bootstrap Icons', 'icons.getbootstrap.com', 'Bootstrap公式のアイコン。フレームワークなしでも使える。', ['MIT'], 'https://icons.getbootstrap.com/'),
    R('Iconify / Icônes', 'icones.js.org', '150以上のアイコンセットを横断検索して、SVGやコンポーネントのコードをコピーできる。', ['横断検索'], 'https://icones.js.org/'),
    R('Simple Icons', 'simpleicons.org', '有名ブランド・サービスのロゴアイコン（各ブランドの商標ガイドラインに従う）。', ['ロゴ'], 'https://simpleicons.org/'),
  ]),
  S('日本のアイコン素材', [
    R('ICOOON MONO', 'icooon-mono.com', '日本の単色アイコン素材。商用利用可。', ['日本'], 'https://icooon-mono.com/'),
    R('Flaticon', 'flaticon.com', '大量のアイコン。無料素材はクレジット表記が必要。', ['要クレジット'], 'https://www.flaticon.com/'),
  ], null),
]});

TABS.push({ id:'illust', label:'イラスト', icon:'✎', intro:'Webサイト・資料・アプリの空の状態などに使えるイラスト素材。', sections:[
  S('海外のイラスト素材', [
    R('unDraw', 'undraw.co', 'フラットなイラスト。<b>メインカラーを自由に変えられる</b>ので、サイトの配色に合わせやすい。', ['帰属不要'], 'https://undraw.co/'),
    R('Storyset', 'storyset.com', 'アニメーション付きにもできるイラスト。スタイルを選べる。', ['要クレジット（無料）'], 'https://storyset.com/'),
    R('Open Peeps / Humaaans', 'openpeeps.com', '人物を組み合わせて作れる手描き風／フラットなイラスト。', ['CC0'], 'https://www.openpeeps.com/'),
    R('DrawKit', 'drawkit.com', '統一感のあるイラストパック。', ['無料あり'], 'https://www.drawkit.com/'),
    R('LottieFiles', 'lottiefiles.com', '動くイラスト（Lottieアニメーション）。ローディング・成功・空の状態に。', ['動く'], 'https://lottiefiles.com/'),
  ]),
  S('日本のイラスト素材', [
    R('いらすとや', 'irasutoya.com', '日本で最も有名なフリーイラスト。あらゆる場面がある。<b>商用利用は1つの制作物に20点まで</b>などの規約あり。', ['日本','規約確認'], 'https://www.irasutoya.com/'),
    R('ちょうどいいイラスト', 'tyoudoii-illust.com', 'シンプルで使いやすい人物などのイラスト。', ['日本'], 'https://tyoudoii-illust.com/'),
    R('Loose Drawing', 'loosedrawing.com', 'ゆるい線画の人物イラスト。色を変えて使える。', ['日本'], 'https://loosedrawing.com/'),
    R('ソコスト', 'socost.app', 'ゆるくておしゃれなイラスト素材。', ['日本'], 'https://socost.app/'),
  ]),
]});

TABS.push({ id:'photo', label:'写真', icon:'◫', intro:'商用利用できる写真素材。写真素材の検索APIは <a href="free-api.html#media">無料API辞典</a> を参照。', sections:[
  S('写真素材', [
    R('Unsplash', 'unsplash.com', '高品質でおしゃれな写真。商用利用可・クレジット任意（推奨）。', ['定番'], 'https://unsplash.com/'),
    R('Pexels', 'pexels.com', '写真と動画。商用利用可。', ['動画も'], 'https://www.pexels.com/'),
    R('Pixabay', 'pixabay.com', '写真・イラスト・ベクター・動画・音楽。', [], 'https://pixabay.com/'),
    R('ぱくたそ', 'pakutaso.com', '日本人モデルや日本の風景が豊富な写真素材。', ['日本'], 'https://www.pakutaso.com/'),
    R('写真AC', 'photo-ac.com', '日本の写真素材サイト（会員登録・ダウンロード数制限あり）。', ['日本','要登録'], 'https://www.photo-ac.com/'),
    R('Wikimedia Commons', 'commons.wikimedia.org', 'ウィキペディアの画像庫。ライセンスは画像ごとに異なる。', ['CC各種'], 'https://commons.wikimedia.org/'),
  ]),
  S('ダミー画像（開発中）', [
    R('Lorem Picsum / placehold.co', 'picsum.photos', 'URLだけで仮画像。無料API辞典の「画像・素材」にライブ見本あり。', [], 'free-api.html#media'),
  ]),
]});

TABS.push({ id:'video', label:'動画素材', icon:'▶', intro:'背景動画・Bロール・エフェクト素材。動画の作り方は <a href="video.html">動画制作辞典</a> へ。', sections:[
  S('動画素材', [
    R('Pexels Videos', 'pexels.com/videos', '商用利用可の動画素材。4Kも多い。', [], 'https://www.pexels.com/videos/'),
    R('Mixkit', 'mixkit.co', '動画・音楽・効果音・テンプレート。', [], 'https://mixkit.co/'),
    R('Coverr', 'coverr.co', 'Webサイトの背景動画向けの素材。', [], 'https://coverr.co/'),
    R('Pixabay Videos', 'pixabay.com/videos', '動画素材。', [], 'https://pixabay.com/videos/'),
    R('NASA Image and Video Library', 'images.nasa.gov', '宇宙の映像（多くはパブリックドメイン）。', ['PD'], 'https://images.nasa.gov/'),
  ]),
]});

TABS.push({ id:'audio', label:'音楽・効果音', icon:'♪', intro:'BGMと効果音。<a href="sound.html">サウンド・効果音辞典</a> ではその場で効果音を合成して試せます。', sections:[
  S('日本の音素材', [
    R('効果音ラボ', 'soundeffect-lab.info', '定番の効果音サイト。ボタン・バラエティ・アニメ・環境音。', ['日本','商用可'], 'https://soundeffect-lab.info/'),
    R('OtoLogic', 'otologic.jp', '効果音とBGM。クレジット表記で商用可。', ['日本'], 'https://otologic.jp/'),
    R('DOVA-SYNDROME', 'dova-s.jp', '多数の作曲者によるフリーBGM。曲ごとに規約を確認。', ['日本','BGM'], 'https://dova-s.jp/'),
    R('魔王魂', 'maou.audio', 'ゲーム・動画向けのBGMと効果音。', ['日本'], 'https://maou.audio/'),
    R('甘茶の音楽工房', 'amachamusic.chagasi.com', 'やさしい雰囲気のBGM。', ['日本','BGM'], 'https://amachamusic.chagasi.com/'),
  ]),
  S('海外の音素材', [
    R('YouTube オーディオライブラリ', 'studio.youtube.com', 'YouTubeで安全に使えるBGM・効果音（YouTube Studioから）。', ['YouTube向け'], 'https://studio.youtube.com/'),
    R('Pixabay Music', 'pixabay.com/music', '商用利用可のBGM・効果音。', [], 'https://pixabay.com/music/'),
    R('Freesound', 'freesound.org', '膨大な効果音。ライセンスは音ごとに異なる（CC0・CC BYなど）。', ['CC各種'], 'https://freesound.org/'),
    R('Kenney Audio', 'kenney.nl', 'ゲーム用のUI音・効果音パック。', ['CC0'], 'https://kenney.nl/assets/category:Audio'),
  ]),
]});

TABS.push({ id:'font', label:'フォント', icon:'あ', intro:'無料で使えるフォント。見比べは <a href="color-typography.html#jpfont">配色・タイポグラフィ辞典</a> でできます。', sections:[
  S('フォント配布', [
    R('Google Fonts', 'fonts.google.com', '無料・商用可のWebフォント。日本語フォントも多数。Webにそのまま読み込める。', ['定番','OFL'], 'https://fonts.google.com/'),
    R('Fontshare', 'fontshare.com', 'モダンでおしゃれな欧文フォント（個人・商用無料）。', [], 'https://www.fontshare.com/'),
    R('フォントフリー', 'fontfree.me', '日本語フリーフォントのまとめサイト。フォントごとに規約を確認。', ['日本'], 'https://fontfree.me/'),
    R('モリサワ BIZ UD / Morisawa Fonts', 'morisawa.co.jp', 'BIZ UDゴシック・明朝などは無料で配布（Google Fontsにもある）。', ['日本'], 'https://www.morisawa.co.jp/'),
  ]),
]});

TABS.push({ id:'3d', label:'3Dモデル', icon:'◆', intro:'Three.jsやゲーム、AR、デザインで使える3D素材。Web用には軽いglTF/GLB形式が便利です。 表示のしかた・軽量化は <a href="3d.html#models">3D・WebGL・シェーダー辞典</a> へ。', sections:[
  S('3D素材', [
    R('Sketchfab', 'sketchfab.com', '膨大な3Dモデル。ダウンロード可能なもの・ライセンスはモデルごと。', ['CC各種'], 'https://sketchfab.com/'),
    R('Poly Pizza', 'poly.pizza', 'ローポリの3Dモデル。ゲームやWebに最適。', ['CC0中心'], 'https://poly.pizza/'),
    R('Kenney 3D', 'kenney.nl', 'ゲーム用の統一感ある3Dアセット。', ['CC0'], 'https://kenney.nl/assets/category:3D'),
    R('Quaternius', 'quaternius.com', 'ゲーム用のローポリモデル・キャラクターパック。', ['CC0'], 'https://quaternius.com/'),
    R('Poly Haven', 'polyhaven.com', '3Dモデル・テクスチャ・HDRI（背景光源）。', ['CC0'], 'https://polyhaven.com/'),
    R('Spline', 'spline.design', 'ブラウザで3Dデザインを作ってWebに埋め込めるツール（テンプレートも豊富）。', ['ツール'], 'https://spline.design/'),
  ]),
]});

TABS.push({ id:'game', label:'ゲーム素材', icon:'🎮', intro:'2D/3Dのグラフィック・タイル・キャラクター・UI・音。作り方は <a href="game-dev.html">ゲーム制作辞典</a> へ。', sections:[
  S('ゲーム素材', [
    R('Kenney', 'kenney.nl', '数万点のゲーム素材（2D・3D・UI・音）。すべてCC0で自由に使える。迷ったらまずここ。', ['CC0','定番'], 'https://kenney.nl/'),
    R('itch.io アセット', 'itch.io/game-assets', 'インディー作者のゲーム素材。無料・有料が混在。', [], 'https://itch.io/game-assets/free'),
    R('OpenGameArt', 'opengameart.org', 'オープンなゲーム素材の共有サイト。', ['CC各種'], 'https://opengameart.org/'),
    R('ぴぽや倉庫', 'pipoya.net', 'RPG向けのキャラ・マップチップ・エフェクト（日本）。規約を確認して利用。', ['日本'], 'https://pipoya.net/'),
  ]),
]});

TABS.push({ id:'design', label:'UIキット・参考サイト', icon:'❖', intro:'デザインの参考集とUI素材。AIへの指示で「このサイトの〇〇の部分のように」と伝えるときの参照元にも。', sections:[
  S('UIキット・コンポーネント', [
    R('Figma Community', 'figma.com/community', '無料のUIキット・デザインシステム・ワイヤーフレーム。', [], 'https://www.figma.com/community'),
    R('shadcn/ui / Magic UI / Aceternity UI', 'コンポーネント集', 'コードごとコピーできるUI部品。UIコンポーネント辞典・Webデザイン辞典も参照。', [], 'https://ui.shadcn.com/'),
    R('Uiverse', 'uiverse.io', 'HTML/CSSのボタン・ローダーなどのオープンソース部品。', ['MIT'], 'https://uiverse.io/'),
  ]),
  S('デザインの参考（ギャラリー）', [
    R('SANKOU!', 'sankoudesign.com', '日本のWebデザインの参考集。業種・色で探せる。', ['日本'], 'https://sankoudesign.com/'),
    R('MUUUUU.ORG', 'muuuuu.org', '日本の縦長Webデザインのギャラリー。', ['日本'], 'https://muuuuu.org/'),
    R('Land-book', 'land-book.com', 'ランディングページのギャラリー。', [], 'https://land-book.com/'),
    R('Awwwards', 'awwwards.com', '世界の受賞Webサイト。アニメーション演出の参考に。', ['演出'], 'https://www.awwwards.com/'),
    R('Mobbin', 'mobbin.com', '実在するアプリの画面集（ログイン・設定・決済など画面単位で探せる）。', ['アプリUI'], 'https://mobbin.com/'),
    R('Dribbble / Behance', 'dribbble.com', 'デザイナーの作品集。トレンドの把握に。', [], 'https://dribbble.com/'),
  ]),
]});

TABS.push({ id:'tool', label:'便利ツール', icon:'⚒', intro:'素材を加工・最適化・確認するための無料ツール。', sections:[
  S('画像の加工・最適化', [
    R('Squoosh', 'squoosh.app', 'ブラウザで画像を圧縮・WebP/AVIF変換。画質を見比べながら調整できる（Google製）。', ['無料'], 'https://squoosh.app/'),
    R('TinyPNG', 'tinypng.com', 'PNG/JPEG/WebPを見た目そのままに軽量化。', [], 'https://tinypng.com/'),
    R('remove.bg / Photoroom', 'remove.bg', '写真の背景を自動で除去。', [], 'https://www.remove.bg/'),
    R('SVGOMG', 'jakearchibald.github.io/svgomg', 'SVGファイルの不要なデータを削って軽量化。', [], 'https://jakearchibald.github.io/svgomg/'),
    R('RealFaviconGenerator', 'realfavicongenerator.net', 'ファビコン一式（各サイズ・manifest）を生成。', [], 'https://realfavicongenerator.net/'),
  ]),
  S('デザイン・図解', [
    R('Figma', 'figma.com', 'デザインツールの定番（無料プランあり）。AIへの指示用のラフ作りにも。', ['定番'], 'https://www.figma.com/'),
    R('Penpot', 'penpot.app', 'オープンソースのデザインツール。', ['OSS'], 'https://penpot.app/'),
    R('Excalidraw', 'excalidraw.com', '手描き風の図をすぐ描けるホワイトボード。画面のラフや構成図に。', ['無料'], 'https://excalidraw.com/'),
    R('draw.io（diagrams.net）', 'app.diagrams.net', 'フローチャート・構成図・ER図を描く無料ツール。', ['無料'], 'https://app.diagrams.net/'),
    R('Coolors / Realtime Colors', 'coolors.co', '配色づくり。配色・タイポグラフィ辞典も参照。', [], 'https://coolors.co/'),
  ]),
  S('確認・計測', [
    R('PageSpeed Insights', 'pagespeed.web.dev', '公開したページの表示速度とCore Web Vitalsを計測。', [], 'https://pagespeed.web.dev/'),
    R('WAVE', 'wave.webaim.org', 'アクセシビリティの問題を可視化。', [], 'https://wave.webaim.org/'),
    R('Responsively App', 'responsively.app', '複数の画面サイズで同時に表示確認できるブラウザ。', [], 'https://responsively.app/'),
  ]),
  { title:'', html:'', after: LIC },
]});
})();
