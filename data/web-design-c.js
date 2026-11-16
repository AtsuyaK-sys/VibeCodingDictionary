/* Webデザイン・アニメーション辞典 — C: イージング / レイアウト / CSSテクニック / ライブラリ */
(function(){
/* ---------- イージング ---------- */
const easeOutBounce = (x) => { const n = 7.5625, d = 2.75; if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x -= 1.5 / d) * x + .75; if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + .9375; return n * (x -= 2.625 / d) * x + .984375; };
const easeOutElastic = (x) => x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - .75) * (2 * Math.PI / 3)) + 1;
const spring = (x) => 1 - Math.exp(-6 * x) * Math.cos(x * 14);
const toLinear = (f, n = 48) => 'linear(' + Array.from({ length:n + 1 }, (_, i) => +f(i / n).toFixed(4)).join(', ') + ')';
const toPoly = (f, n = 60) => Array.from({ length:n + 1 }, (_, i) => `${(i / n * 90).toFixed(1)},${(90 - f(i / n) * 90).toFixed(1)}`).join(' ');
function curveSvg(shape){
  let body;
  if (shape.bez){ const [a, b, c, d] = shape.bez; body = `<path class="curve" d="M0,90 C${a * 90},${90 - b * 90} ${c * 90},${90 - d * 90} 90,0"/>`; }
  else if (shape.steps){ const s = shape.steps, pts = []; for (let i = 0; i < s; i++){ const y = 90 - i / s * 90, x0 = i / s * 90, x1 = (i + 1) / s * 90; pts.push(`${x0},${y}`, `${x1},${y}`); } pts.push('90,0'); body = `<polyline class="curve" points="${pts.join(' ')}"/>`; }
  else body = `<polyline class="curve" points="${toPoly(shape.fn)}"/>`;
  return `<svg viewBox="-6 -28 102 146"><rect class="axis" x="0" y="0" width="90" height="90"/>${body}</svg>`;
}
function ease(name, en, css, shape, desc, prompt, tags){
  return { name, en, tags, desc, prompt, stage:'free', h:130,
    demo:`<div class="ez">${curveSvg(shape)}<div class="track" style="--ez:${css}"><i></i></div></div>`,
    code:`transition: transform .6s ${css.length > 60 ? css.slice(0, 60) + ' …)' : css};`, search: css };
}
const BOUNCE = toLinear(easeOutBounce, 60), ELASTIC = toLinear(easeOutElastic, 60), SPRING = toLinear(spring, 60);

TABS.push({
  id:'easing', label:'イージング・時間', icon:'∿',
  intro:'イージング＝<b>動きの加速・減速のしかた</b>。同じ0.6秒の移動でも、イージングを変えるだけで「上品」「元気」「機械的」と印象が大きく変わります。左のグラフは横軸が時間・縦軸が進み具合。迷ったら <b>ease-out系（最後にゆっくり止まる）</b> を選べばまず失敗しません。 イージング関数や cubic-bezier の中身を触って確かめるなら <a href="motion-math.html#interp">動きの計算辞典</a> へ。',
  sections:[
    { title:'基本のイージング（CSSキーワード）', layout:'cards lg', items:[
      ease('リニア', 'linear', 'linear', { bez:[0,0,1,1] }, '一定速度。機械的で不自然に見えるため、UIの移動にはほぼ使わない。回転し続けるスピナーやマーキー向け。', 'スピナーの回転とマーキーはlinearで一定速度にして。', ['一定速度']),
      ease('イーズ', 'ease（初期値）', 'ease', { bez:[.25,.1,.25,1] }, 'CSSの初期値。ゆっくり始まり速くなり、ゆっくり止まる。何も指定しないとこれになる。', 'transitionのイージングは指定しない（ease）でいいです。', ['初期値']),
      ease('イーズイン', 'ease-in', 'ease-in', { bez:[.42,0,1,1] }, 'ゆっくり始まって加速し、急に止まる。<b>画面から出ていく（退場）動き</b>に向く。登場に使うともたつく。', 'モーダルを閉じるときはease-inで素早く消して。', ['退場向き']),
      ease('イーズアウト', 'ease-out', 'ease-out', { bez:[0,0,.58,1] }, '勢いよく始まってゆっくり止まる。<b>画面に入ってくる（登場）動きの基本</b>。反応が速く感じられる。', '要素の登場アニメーションはease-out系で、最後にゆっくり止まるようにして。', ['登場向き','おすすめ']),
      ease('イーズインアウト', 'ease-in-out', 'ease-in-out', { bez:[.42,0,.58,1] }, 'ゆっくり始まり、ゆっくり止まる。画面内での<b>位置移動・往復</b>に自然。', 'タブの下線が移動するときはease-in-outで滑らかに動かして。', ['移動向き']),
    ]},
    { title:'よく使うカスタムカーブ（cubic-bezier）', note:'名前は <a href="https://easings.net/ja" target="_blank" rel="noopener">easings.net</a> の呼び方。GSAPでは <code>power2.out</code> などの名前で同等のものが使えます。', layout:'cards lg', items:[
      ease('イーズアウト・キュービック', 'easeOutCubic', 'cubic-bezier(.33,1,.68,1)', { bez:[.33,1,.68,1] }, 'ease-outより少しキビキビ。迷ったらこれ。GSAPの power2.out に近い。', '全体のトランジションは cubic-bezier(.33,1,.68,1)（easeOutCubic）で統一して。', ['万能']),
      ease('イーズアウト・クイント', 'easeOutQuint', 'cubic-bezier(.22,1,.36,1)', { bez:[.22,1,.36,1] }, '最初が速く、最後に長くゆっくり減速する。<b>高級感・上品さ</b>が出る。Apple風のLPでよく見る。', '要素の登場は cubic-bezier(.22,1,.36,1) で、最初速く最後にゆっくり止まる上品な動きにして。', ['上品','おすすめ']),
      ease('イーズアウト・エクスポ', 'easeOutExpo', 'cubic-bezier(.16,1,.3,1)', { bez:[.16,1,.3,1] }, 'さらに極端に、一瞬で動いてじわーっと止まる。メニュー展開や大きな画面遷移に。', 'メニューの展開は easeOutExpo（cubic-bezier(.16,1,.3,1)）でシュッと開いて。', ['シャープ']),
      ease('イーズインアウト・キュービック', 'easeInOutCubic', 'cubic-bezier(.65,0,.35,1)', { bez:[.65,0,.35,1] }, '前後どちらもしっかり緩急がある。スライダーやページ遷移に。', 'スライダーの切り替えは easeInOutCubic で。', ['遷移']),
      ease('イーズインアウト・クォート', 'easeInOutQuart', 'cubic-bezier(.76,0,.24,1)', { bez:[.76,0,.24,1] }, 'ためてから一気に動き、ためて止まる。ドラマチックなカーテン遷移やマスク表示に。', 'カーテン遷移は cubic-bezier(.76,0,.24,1) でドラマチックに。', ['ドラマチック']),
      ease('イーズイン・バック', 'easeInBack', 'cubic-bezier(.36,0,.66,-.56)', { bez:[.36,0,.66,-.56] }, '一度後ろに下がってから進む（予備動作）。退場や「飛んでいく」動きに。', '削除したカードは、一瞬縮んでから飛んでいく easeInBack で消して。', ['予備動作']),
      ease('イーズアウト・バック', 'easeOutBack', 'cubic-bezier(.34,1.56,.64,1)', { bez:[.34,1.56,.64,1] }, '目標を少し行き過ぎて戻る（オーバーシュート）。ポップアップ、トグル、バッジに<b>元気さ</b>が出る。', 'ポップアップの登場を easeOutBack（cubic-bezier(.34,1.56,.64,1)）にして、少し行き過ぎて戻る元気な動きに。', ['弾む','元気']),
      ease('イーズインアウト・バック', 'easeInOutBack', 'cubic-bezier(.68,-.6,.32,1.6)', { bez:[.68,-.6,.32,1.6] }, '最初に少し戻り、最後に行き過ぎる。遊び心が強いのでポイント使いで。', 'キャラクターの移動は easeInOutBack でコミカルに。', ['コミカル']),
    ]},
    { title:'物理っぽい動き（linear() 関数）', note:'CSSの <code>linear()</code> 関数に多数の点を渡すと、バウンドやバネのような複雑なカーブも再現できます（主要ブラウザ対応済み）。点の列は関数から自動生成するのが普通です。', layout:'cards lg', items:[
      ease('バウンス', 'easeOutBounce', BOUNCE, { fn:easeOutBounce }, 'ボールが床で何度か跳ねて止まる。落下してくる通知やゲーム的な演出に。', '通知カードが上から落ちてきて、床で数回バウンドして止まるアニメーションにして（easeOutBounceをlinear()で）。', ['物理']),
      ease('エラスティック', 'easeOutElastic', ELASTIC, { fn:easeOutElastic }, 'ゴムのようにビヨンビヨンと振動して止まる。強い遊び心。', 'いいねボタンのハートを、ゴムのようにビヨンと振動して止まる easeOutElastic で拡大させて。', ['ゴム']),
      ease('スプリング（バネ）', 'spring', SPRING, { fn:spring }, 'バネのように少し揺れて落ち着く。iOSやFramer Motionの標準的な動き。<b>自然で心地よい</b>。', 'パネルの開閉をバネ（spring）のような動きにして。Framer Motionなら type: "spring", stiffness: 300, damping: 20 で。', ['iOS風','Motion']),
      ease('ステップ', 'steps(5)', 'steps(5)', { steps:5 }, '滑らかに補間せず、カクカクと段階的に進む。<b>パラパラ漫画（スプライトアニメ）</b>、時計の秒針、タイプライターに。', 'スプライトシート（横に8コマ並んだ画像）を steps(8) でパラパラ漫画のように再生して。', ['コマ送り']),
    ]},
    { title:'時間（duration）の目安', note:'UIのアニメーションは「速すぎて気づかない」より「遅すぎてイライラ」のほうが問題になりがちです。',
      table:{ head:['対象','目安の時間','メモ'], rows:[
        ['ボタンのホバー・押下','100〜150ms','即座に反応した感覚が大事'],
        ['トグル・チェックボックス','150〜200ms','小さい動きは短く'],
        ['ドロップダウン・ツールチップ','150〜250ms','閉じるときは開くより短く'],
        ['モーダル・ダイアログ','200〜300ms','背景の暗転も同時に'],
        ['ページ・画面遷移','300〜500ms','大きい移動ほど長く'],
        ['スクロールでの登場','500〜800ms','ease-out系でゆったり'],
        ['スタッガーの間隔','30〜100ms','全体で1秒以内に収める'],
        ['ループ（呼吸・浮遊）','2〜6秒','ゆっくりなほど上品'],
        ['ローディングを出す閾値','300ms以上','それより速い処理では出さない（チラつく）'],
      ]} },
    { title:'アニメーションの関連プロパティ', layout:'rows', items:[
      { name:'animation-fill-mode', en:'forwards / backwards / both', desc:'アニメーション<b>終了後に最後の状態を保つ</b>なら <code>forwards</code>、開始前（delay中）に最初の状態を適用するなら <code>backwards</code>、両方なら <code>both</code>。「終わったら元に戻ってしまう」ときはこれ。', prompt:'アニメーションが終わった後に元の位置に戻ってしまうので、animation-fill-mode: forwards（またはboth）にして。' },
      { name:'animation-direction', en:'normal / reverse / alternate', desc:'<code>alternate</code> で行って戻るを繰り返す。浮遊やパルスに便利。', prompt:'上下の浮遊は animation-direction: alternate で行って戻るを繰り返して。' },
      { name:'animation-delay / transition-delay', en:'delay', desc:'開始を遅らせる。<b>マイナス値</b>にすると「途中から始まる」ので、複数要素の動きを最初からバラけさせられる。', prompt:'花びらのアニメーションはマイナスのdelayをランダムに与えて、最初から舞っている状態にして。' },
      { name:'animation-play-state', en:'running / paused', desc:'一時停止・再開。ホバーでマーキーを止めるなどに。', prompt:'マーキーはホバー中に animation-play-state: paused で止めて。' },
      { name:'prefers-reduced-motion', en:'@media (prefers-reduced-motion: reduce)', desc:'OSで「視差効果を減らす」を設定しているユーザーには動きを止める・減らす。<b>酔いやすい人への配慮</b>としてアクセシビリティ上重要。', prompt:'prefers-reduced-motion: reduce のユーザーには、パララックスと自動再生のアニメーションを無効にして、フェードだけにして。', code:'@media (prefers-reduced-motion: reduce) {\n  *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }\n}' },
      { name:'will-change', en:'will-change: transform', desc:'これから動く要素をブラウザに予告して滑らかにする。<b>付けすぎると逆に重くなる</b>ので、カクつく要素にだけ使う。', prompt:'パララックスの背景がカクつくので、動く要素にだけ will-change: transform を付けて。' },
      { name:'transform と opacity だけを動かす', en:'compositor-only properties', desc:'<code>top/left/width/height/margin</code> を動かすと毎フレーム再レイアウトが走って重い。<b>transform（移動・拡大・回転）とopacityだけ</b>を動かすのが滑らかさの鉄則。', prompt:'アニメーションはtopやwidthではなく、transformとopacityだけで実装して、60fpsで滑らかに動くようにして。' },
    ]},
  ]
});

/* ---------- レイアウト ---------- */
const U = (n, w) => Array.from({ length:n }, (_, i) => `<u style="width:${w ? w[i % w.length] : 100}%"></u>`).join('');
TABS.push({
  id:'layout', label:'レイアウト', icon:'▤',
  intro:'画面の骨組み（配置パターン）の名前。ワイヤーフレーム（灰色の箱）で構造だけを示しています。<b>「〇〇レイアウトで」</b>と伝えるだけで、AIは大まかな配置を理解します。',
  sections:[
    { title:'ページ・セクションの型', items:[
      { name:'ヒーローセクション', en:'hero section', demo:`<div class="wf wf-hero"><div class="nav"><b></b><span><b></b><b></b><b></b></span></div><div class="body"><div class="txt"><b style="height:16px;width:90%"></b><b style="height:16px;width:70%"></b>${U(2, [80, 60])}<i style="height:16px;width:50%;margin-top:4px"></i></div><b style="height:90%"></b></div></div>`, tags:['ファーストビュー'],
        desc:'ページを開いて最初に見える大きな領域。<b>キャッチコピー・サブコピー・CTAボタン・メインビジュアル</b>で構成する。ここで「何のサイトか」を3秒で伝える。', prompt:'ヒーローセクションを作って。左にキャッチコピー（大見出し）、サブコピー、「無料ではじめる」CTAボタン、右にメインビジュアル。スマホでは縦積みにして。',
        code:'.hero { display:grid; grid-template-columns: 1fr 1fr; align-items:center; min-height: 80vh; gap: 48px; }\n@media (max-width: 768px) { .hero { grid-template-columns: 1fr; } }' },
      { name:'ランディングページの構成', en:'landing page structure', h:260, demo:'<div class="wf wf-lp"><i>ヒーロー（キャッチ＋CTA）</i><b>導入企業ロゴ</b><b>課題提起・特徴</b><b>機能紹介</b><b>お客様の声</b><b>料金プラン</b><b>FAQ</b><i>最後のCTA＋フッター</i></div>', tags:['LP','定番の流れ'],
        desc:'LPの王道の流れ：<b>ヒーロー→社会的証明（ロゴ・実績）→課題→解決策（特徴）→機能→お客様の声→料金→FAQ→最後のCTA→フッター</b>。この順番を伝えるとAIは一気にLPを組み立てられる。', prompt:'以下の順でランディングページを作って：ヒーロー／導入企業ロゴ帯／こんな悩みありませんか／3つの特徴／機能紹介／お客様の声（3件）／料金プラン（3段階）／よくある質問（アコーディオン）／最後のCTA／フッター。',
        code:'<header>…</header>\n<main>\n  <section id="hero"></section> <section id="logos"></section>\n  <section id="features"></section> <section id="testimonials"></section>\n  <section id="pricing"></section> <section id="faq"></section> <section id="cta"></section>\n</main>\n<footer>…</footer>' },
      { name:'スプリットスクリーン', en:'split screen', demo:`<div class="wf wf-split"><b style="border-radius:6px 0 0 6px"></b><div class="txt"><b style="height:14px;width:80%"></b>${U(3, [95, 85, 60])}<i style="height:14px;width:45%"></i></div></div>`, tags:['左右二分割'],
        desc:'画面を左右半分に分け、片方に大きな画像、もう片方に文章やフォーム。ログイン画面や対比（Before/After）に。', prompt:'ログイン画面を左右2分割にして、左半分は全面写真、右半分にログインフォームを中央配置して。',
        code:'.split { display:grid; grid-template-columns: 1fr 1fr; min-height:100vh; }' },
      { name:'ジグザグ（交互配置）', en:'zigzag / alternating features', demo:`<div class="wf wf-zig">${[0,1,2].map(() => `<div><b style="height:100%"></b><div class="txt"><b style="height:9px;width:70%"></b>${U(2, [95, 75])}</div></div>`).join('')}</div>`, tags:['機能紹介'],
        desc:'「画像＋説明」の行を、左右を入れ替えながら並べる。機能や特徴を3〜4つ順に説明するときの定番。', prompt:'特徴紹介を3行のジグザグレイアウトにして。1行目は左画像・右テキスト、2行目は左テキスト・右画像、と交互に。',
        code:'.row:nth-child(even) .image { order: 2; } /* 偶数行だけ画像を右へ */' },
      { name:'料金表', en:'pricing table', demo:`<div class="wf wf-price">${[0,1,2].map(i => `<div class="${i === 1 ? 'hot' : ''}"><b style="height:8px;width:50%"></b><b style="height:16px;width:70%"></b>${U(3, [90, 80, 70])}<${i === 1 ? 'i' : 'b'} style="height:14px;margin-top:auto"></${i === 1 ? 'i' : 'b'}></div>`).join('')}</div>`, tags:['3プラン'],
        desc:'3つのプランを横に並べ、<b>真ん中（おすすめ）を強調</b>するのが定番。月額/年額の切替トグルを付けることも多い。', prompt:'料金表を3プラン（フリー／プロ／チーム）で作って。プロを「おすすめ」バッジ付きで少し大きく枠を強調し、上部に月払い/年払いの切替トグル（年払いは20%オフ表示）を付けて。',
        code:'.plans { display:grid; grid-template-columns:repeat(3,1fr); align-items:center; gap:16px; }\n.plan.featured { transform: scale(1.05); border:2px solid var(--accent); }' },
      { name:'タイムライン', en:'timeline', demo:'<div class="wf wf-time">' + '<div><b></b></div>'.repeat(4) + '</div>', tags:['沿革','手順'],
        desc:'縦線の左右に出来事を交互に配置。会社の沿革、ロードマップ、利用の流れに。', prompt:'会社の沿革を縦のタイムラインで表示して。中央に縦線、左右交互に年とできごとのカード、線上に丸いマーカー。スマホでは片側に寄せて。' },
      { name:'フルスクリーンセクション', en:'full-screen sections', demo:'<div class="wf wf-full"><i style="background:var(--accent)">SECTION 1（100vh）</i><b style="background:#ff6b9a">SECTION 2</b><b style="background:#ffb703">SECTION 3</b></div>', tags:['100vh','scroll-snap'],
        desc:'1セクション＝1画面の高さ。スクロールするたびに1画面ずつ切り替わる（scroll-snapやfullPage.js）。プレゼン型サイトや作品紹介に。', prompt:'各セクションを画面いっぱいの高さ（100dvh）にして、縦スクロールで1セクションずつピタッと止まるようにして（scroll-snap）。',
        code:'html { scroll-snap-type: y mandatory; }\nsection { height: 100dvh; scroll-snap-align: start; }' },
      { name:'フッター（大型）', en:'mega footer', demo:`<div class="wf wf-footer"><div class="cols"><div><i style="height:12px;width:60%"></i>${U(2, [90, 70])}</div>${[0,1,2,3].map(() => `<div><b style="height:7px;width:60%"></b>${U(3, [80, 60, 70])}</div>`).join('')}</div><u style="width:40%;margin:auto"></u></div>`, tags:['サイトマップ'],
        desc:'ロゴと説明、カテゴリ別のリンク列、SNS、コピーライトを並べた大きなフッター。', prompt:'フッターを作って。左にロゴと一言説明とSNSアイコン、右に「サービス／会社情報／サポート／法的情報」の4列のリンク、最下部にコピーライト。' },
    ]},
    { title:'グリッド・一覧の型', items:[
      { name:'ベントーグリッド', en:'bento grid', demo:'<div class="wf wf-bento"><i></i><b></b><b></b><b></b><b></b><b></b></div>', tags:['Apple風','流行'],
        desc:'大小のタイルを弁当箱のように組み合わせる。情報に強弱をつけながら一覧できる。', prompt:'機能紹介をベントーグリッドにして。4列×3行のグリッドで、メイン機能を2×2の大きなタイル、他を1×1や2×1で組み合わせて。',
        code:'.bento { display:grid; grid-template-columns:repeat(4,1fr); grid-auto-rows:160px; gap:12px; }\n.big { grid-column:span 2; grid-row:span 2; } .wide { grid-column:span 2; }' },
      { name:'カードグリッド', en:'card grid', demo:'<div class="wf wf-cards">' + '<b></b>'.repeat(6) + '</div>', tags:['最頻出'],
        desc:'同じサイズのカードを等間隔に並べる。画面幅に応じて列数が自動で変わるようにするのが基本。', prompt:'商品カードを、最小幅260pxで画面幅に合わせて列数が自動で変わるグリッドで並べて（repeat(auto-fill, minmax(260px, 1fr))）。',
        code:'.grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }' },
      { name:'メイソンリー', en:'masonry / Pinterest layout', demo:'<div class="wf wf-mason">' + [40, 70, 50, 30, 60, 45, 35, 55, 40, 65, 30, 50].map(v => `<b style="height:${v}px"></b>`).join('') + '</div>', tags:['Pinterest風','高さバラバラ'],
        desc:'高さの違うカードを隙間なく石積みのように詰める。写真ギャラリー、Pinterest風の一覧に。CSSの<code>columns</code>で簡易的に作れる（並び順は縦方向になる）。', prompt:'写真ギャラリーを、高さの違う画像が隙間なく並ぶメイソンリーレイアウトにして（CSS columnsで4列、スマホは2列）。',
        code:'.masonry { columns: 4 220px; column-gap: 12px; }\n.masonry > * { break-inside: avoid; margin-bottom: 12px; }' },
      { name:'マガジングリッド', en:'magazine / featured grid', demo:'<div class="wf wf-mag"><i></i><b></b><b></b><b></b><b></b></div>', tags:['ニュース','ブログ'],
        desc:'1つの注目記事を大きく、残りを小さく並べる。ニュースサイトやブログのトップに。', prompt:'ブログのトップで、最新記事1件を左に大きく、残り4件を右に2×2の小さなカードで並べて。' },
      { name:'ブロークングリッド', en:'broken grid / overlap', demo:'<div class="wf wf-broken"><b class="a"></b><div class="b"><b style="height:10px;width:60%"></b>' + U(3, [95, 85, 60]) + '</div></div>', tags:['おしゃれ','重なり'],
        desc:'グリッドをあえて崩し、画像とテキストを重ねたりずらしたりする。雑誌的でおしゃれ、ブランドサイト向け。', prompt:'About セクションをブロークングリッドにして。左上に大きな写真、右下にその写真に少し重なる白いテキストカード（影付き）を配置して。' },
    ]},
    { title:'アプリ画面の型', items:[
      { name:'サイドバー＋メイン（ダッシュボード）', en:'sidebar dashboard', demo:'<div class="wf wf-dash"><b></b><b></b><div class="stats"><i></i><b></b><b></b></div><b></b></div>', tags:['管理画面'],
        desc:'左に縦のナビゲーション、上にヘッダー、右のメイン領域に統計カードとグラフ。管理画面・SaaSの基本形。', prompt:'管理画面を作って。左に固定の縦サイドバー（アイコン＋ラベル、折りたたみ可）、上部にヘッダー（検索とユーザーアイコン）、メインに4つの統計カードと折れ線グラフ、最近の注文テーブル。',
        code:'.app { display:grid; grid-template-columns: 240px 1fr; grid-template-rows: 64px 1fr; height:100dvh; }\n.sidebar { grid-row: 1 / -1; }' },
      { name:'聖杯レイアウト', en:'holy grail layout', demo:'<div class="wf wf-grail"><i></i><b></b><b></b><b></b><b></b></div>', tags:['古典'],
        desc:'ヘッダー・フッターと、左サイド／メイン／右サイドの3カラム。ドキュメントサイトに多い。', prompt:'ドキュメントサイトを聖杯レイアウトで。ヘッダー、左に目次ナビ、中央に本文、右に「このページの見出し」、最下部にフッター。',
        code:'body { display:grid; grid-template: "head head head" 64px "nav main aside" 1fr "foot foot foot" auto / 220px 1fr 200px; }' },
      { name:'センター配置（ログイン等）', en:'centered card', demo:`<div class="wf wf-center"><div><b style="height:10px;width:50%;margin:0 auto"></b>${U(1)}<b style="height:14px"></b><b style="height:14px"></b><i style="height:16px"></i></div></div>`, tags:['ログイン','完了画面'],
        desc:'画面中央に1枚のカードだけを置く。ログイン、会員登録、エラー、完了画面に。<code>place-items:center</code>で一発。', prompt:'ログインページを、グラデーション背景の画面中央に白いカード（ロゴ、メール、パスワード、ログインボタン、新規登録リンク）を置くデザインにして。',
        code:'.page { min-height:100dvh; display:grid; place-items:center; }' },
      { name:'カンバンボード', en:'kanban board', demo:'<div class="wf wf-kanban">' + [3, 2, 4].map(n => `<div><u style="width:50%"></u>${'<b></b>'.repeat(n)}</div>`).join('') + '</div>', tags:['タスク管理','ドラッグ&ドロップ'],
        desc:'「未着手／進行中／完了」の列にカードを並べ、ドラッグで移動する。Trello風。', prompt:'タスク管理アプリをカンバンボードで作って。「未着手」「進行中」「完了」の3列で、カードをドラッグ&ドロップで列間移動でき、localStorageに保存されるようにして（SortableJS使用可）。' },
      { name:'チャット画面', en:'chat layout', demo:'<div class="wf wf-chat"><div class="msgs"><b></b><i></i><b style="width:40%"></b><i style="width:60%"></i></div><b style="border-radius:999px"></b></div>', tags:['AIチャット'],
        desc:'下に入力欄を固定し、メッセージは下から積み上がる。相手は左・自分は右の吹き出し。', prompt:'AIチャット画面を作って。入力欄は画面下に固定、自分のメッセージは右寄せの紫の吹き出し、AIは左寄せのグレーの吹き出し。新しいメッセージが来たら自動で最下部へスクロール。Enterで送信、Shift+Enterで改行。' },
      { name:'スマホアプリ（タブバー）', en:'mobile app with bottom tab bar', demo:'<div class="wf-phone"><b style="height:10px;width:50%"></b><b style="height:40px"></b><b style="height:24px"></b><b style="height:24px"></b><div class="tabbar"><i></i><b></b><b></b><b></b></div></div>', tags:['PWA','モバイル'],
        desc:'画面下部に4〜5個のタブ（ホーム・検索・投稿・通知・マイページ）。親指で押しやすい。iPhoneの下部の安全領域（セーフエリア）に注意。', prompt:'スマホ向けアプリ風に、画面下部に固定のタブバー（ホーム／検索／お気に入り／マイページのアイコン＋ラベル）を付けて。iPhoneのホームバーに被らないよう env(safe-area-inset-bottom) で余白を取って。',
        code:'.tabbar { position:fixed; bottom:0; left:0; right:0; padding-bottom: env(safe-area-inset-bottom); }\n/* <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"> */' },
      { name:'ドロワー（オフキャンバス）', en:'drawer / off-canvas menu', demo:'<div class="wf wf-drawer"><div class="shade"></div><div class="panel-d"><i style="height:10px;width:60%"></i>' + U(5, [80, 70, 85, 60, 75]) + '</div></div>', tags:['ハンバーガー'],
        desc:'普段は画面外に隠れていて、ハンバーガーボタンで横からスライドして出てくるメニュー。背景は暗くして、外側クリックで閉じる。', prompt:'スマホではナビをハンバーガーメニューにして、押すと左からドロワーがスライドインし、背景が半透明の黒になるように。背景クリック・Escキー・リンククリックで閉じて。' },
      { name:'記事（1カラム）', en:'single column article', demo:`<div class="wf wf-article"><b style="height:14px;width:80%"></b><u style="width:40%"></u><b style="height:44px"></b>${U(6, [100, 96, 100, 90, 98, 70])}</div>`, tags:['読みやすさ'],
        desc:'本文を中央の細いカラムに。1行の長さは<b>日本語で35〜45文字（約680px）</b>くらいが読みやすい。', prompt:'ブログ記事ページを、本文幅最大680pxの中央1カラムにして。行間1.9、段落間1.5em、見出しの上に十分な余白を。',
        code:'.article { max-width: 680px; margin-inline: auto; line-height: 1.9; }' },
    ]},
    { title:'レスポンシブ（画面幅への対応）', layout:'rows', items:[
      { name:'ブレークポイント', en:'breakpoints', desc:'レイアウトを切り替える画面幅。Tailwindの標準は <code>sm 640px / md 768px / lg 1024px / xl 1280px / 2xl 1536px</code>。スマホ〜タブレット〜PCの3段階で考えれば十分なことが多い。', tags:['基本'], prompt:'768px未満はスマホ用の1カラム、768〜1023pxは2カラム、1024px以上は3カラムにして。' },
      { name:'モバイルファースト', en:'mobile-first', desc:'まずスマホ向けにCSSを書き、<code>@media (min-width: …)</code> で画面が広い場合のスタイルを足していく考え方。Tailwindもこの方式（<code>md:grid-cols-2</code>）。', tags:['設計方針'], prompt:'モバイルファーストで作って。基本はスマホ表示、min-widthのメディアクエリでPC表示を追加する形で。' },
      { name:'流体タイポグラフィ', en:'clamp() fluid type', desc:'<code>font-size: clamp(最小, 推奨, 最大)</code> で、画面幅に合わせて文字サイズが滑らかに変わる。ブレークポイントごとの指定が不要になる。', tags:['clamp'], prompt:'見出しの文字サイズを clamp(28px, 5vw, 56px) で画面幅に合わせて滑らかに変わるようにして。', code:'h1 { font-size: clamp(28px, 5vw, 56px); }' },
      { name:'コンテナクエリ', en:'@container', desc:'画面幅ではなく<b>親要素の幅</b>に応じてスタイルを変える。同じカード部品をサイドバーにもメインにも置けるようになる。', tags:['新しいCSS'], prompt:'カードコンポーネントを、置かれた場所の幅が400px未満なら縦並び、以上なら横並びになるよう @container で作って。', code:'.wrap { container-type: inline-size; }\n@container (min-width: 400px) { .card { display:flex; } }' },
      { name:'dvh / svh（動的ビューポート）', en:'100dvh', desc:'スマホでは <code>100vh</code> がアドレスバーの分ずれてはみ出す問題がある。<code>100dvh</code>（動的）を使うと実際の表示領域に合う。', tags:['スマホの罠'], prompt:'スマホで画面いっぱいの高さにするとき、100vhではなく100dvhを使って、アドレスバーではみ出さないようにして。', code:'.hero { min-height: 100dvh; }' },
      { name:'画像のレスポンシブ', en:'srcset / object-fit', desc:'<code>max-width:100%; height:auto;</code> ではみ出し防止。<code>srcset</code> で画面に合ったサイズの画像を配信、<code>object-fit: cover</code> で枠に合わせて切り抜き。', tags:['画像'], prompt:'画像はすべて親の幅からはみ出さないようにし、サムネイルは object-fit: cover で16:9に切り抜いて、loading="lazy" を付けて。', code:'img { max-width:100%; height:auto; }\n.thumb { aspect-ratio:16/9; object-fit:cover; }' },
    ]},
  ]
});

/* ---------- CSSテクニック ---------- */
TABS.push({
  id:'css', label:'CSSの道具箱', icon:'{ }',
  intro:'デザインやアニメーションを形づくる<b>CSSの部品（プロパティ）</b>の見本帳。この名前を知っていると、AIへの指示がぐっと正確になります。',
  sections:[
    { title:'形・切り抜き・重なり', items:[
      { name:'clip-path（切り抜き）', en:'clip-path', demo:'<div class="c-shapes"><i></i><i></i><i></i><i></i></div>', tags:['図形'],
        desc:'要素を円・三角形・六角形・星などの形に切り抜く。アニメーションも可能。<a href="https://bennettfeely.com/clippy/" target="_blank" rel="noopener">Clippy</a>で形を作れる。', prompt:'プロフィール画像を六角形に切り抜いて（clip-path: polygon）。',
        code:'.circle  { clip-path: circle(50%); }\n.hexagon { clip-path: polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%); }' },
      { name:'border-radius（角丸）', en:'border-radius', demo:'<div class="c-radius"><i style="border-radius:6px"></i><i style="border-radius:999px;width:80px"></i><i style="border-radius:50%"></i><i style="border-radius:0 50% 0 50%"></i><i style="border-radius:42% 58% 70% 30% / 45% 45% 55% 55%"></i></div>', tags:['角丸'],
        desc:'角を丸める。<code>999px</code>で錠剤型（ピル）、<code>50%</code>で円、8つの値で有機的な形。角丸の大きさはデザインの印象を大きく左右する（小＝堅実、大＝親しみ）。', prompt:'ボタンは完全な丸角（border-radius: 999px）、カードは16pxの角丸で統一して。',
        code:'.pill { border-radius: 999px; }\n.circle { border-radius: 50%; }\n.leaf { border-radius: 0 50% 0 50%; }' },
      { name:'mask（マスク）', en:'mask-image', demo:'<div class="c-mask wd-art"></div>', tags:['フェード'],
        desc:'グラデーションや画像の形で要素を透かす。端をフェードアウトさせる、横スクロールの両端をぼかすなどに。', prompt:'横スクロールのリストの左右端を、mask-imageのグラデーションでフェードアウトさせて。',
        code:'.fade-edges { mask-image: linear-gradient(90deg, transparent, #000 15%, #000 85%, transparent); }' },
      { name:'z-index（重なり順）', en:'z-index / stacking context', demo:'<div class="c-z"><div style="background:#6d4cff;left:0;top:0;z-index:1">z-index:1</div><div style="background:#ff6b9a;left:45px;top:25px;z-index:3">z-index:3</div><div style="background:#ffb703;left:90px;top:50px;z-index:2">z-index:2</div></div>', tags:['よくハマる'],
        desc:'大きい数字ほど手前。ただし<code>position</code>指定がないと効かず、親に<code>transform</code>や<code>opacity</code>があると新しい重なりのグループ（スタッキングコンテキスト）ができて外に出られない。<b>「モーダルが後ろに隠れる」原因の大半</b>。', prompt:'モーダルが他の要素の後ろに隠れてしまう。z-indexとスタッキングコンテキストの問題を調べて、モーダルをbody直下に移す（ポータル）などで直して。' },
      { name:'position（配置方法）', en:'static / relative / absolute / fixed / sticky', demo:'<div class="c-pos"><i style="left:8px;top:8px">relative（基準）</i><i style="right:8px;bottom:8px;background:#ff6b9a">absolute（基準から配置）</i><i style="right:8px;top:8px;background:#22c55e">fixed/sticky</i></div>', tags:['基本'],
        desc:'<b>relative</b>＝基準になる／<b>absolute</b>＝基準の親の中で自由配置／<b>fixed</b>＝画面に固定／<b>sticky</b>＝スクロールで貼り付く。「absoluteがずれる」ときは親にrelativeを付け忘れていることが多い。', prompt:'カード右上に「NEW」バッジを重ねて。カードを position: relative、バッジを position: absolute; top: 8px; right: 8px で。' },
      { name:'mix-blend-mode（描画モード）', en:'mix-blend-mode', demo:'<div class="c-blend"><b>BLEND</b></div>', tags:['Photoshop的'],
        desc:'Photoshopのレイヤー描画モードと同じ。<code>difference</code>で背景に応じて文字色が反転、<code>multiply</code>で白を透過、<code>screen</code>で黒を透過。', prompt:'固定ヘッダーのロゴを mix-blend-mode: difference にして、白い背景でも黒い背景でも見えるようにして。', code:'.logo { mix-blend-mode: difference; color: #fff; }' },
    ]},
    { title:'色・光・質感', items:[
      { name:'グラデーション3種', en:'linear / radial / conic', demo:'<div class="c-grads"><div><span style="background:linear-gradient(135deg,#6d4cff,#ff6b9a)"></span>linear</div><div><span style="background:radial-gradient(circle,#ffd166,#ff6b9a)"></span>radial</div><div><span style="background:conic-gradient(#6d4cff,#00d4ff,#22c55e,#ffd166,#ff6b9a,#6d4cff)"></span>conic</div></div>', tags:['背景'],
        desc:'<b>linear</b>＝直線方向／<b>radial</b>＝中心から放射状／<b>conic</b>＝中心の周りを回る（円グラフ・色相環）。', prompt:'ボタンの背景を135度の紫→ピンクの線形グラデーションにして。',
        code:'linear-gradient(135deg, #6d4cff, #ff6b9a)\nradial-gradient(circle at center, #ffd166, #ff6b9a)\nconic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)' },
      { name:'box-shadow（影の段階）', en:'elevation / shadow scale', demo:'<div class="c-shadows"><i></i><i></i><i></i><i></i></div>', tags:['奥行き'],
        desc:'影は「小さく濃い影＋大きく薄い影」の<b>2層重ね</b>にすると自然。影の大きさを3〜4段階に決めて使い分けると統一感が出る。', prompt:'影は4段階（sm/md/lg/xl）のデザイントークンとして定義して、カード=md、ドロップダウン=lg、モーダル=xlで使い分けて。',
        code:'--shadow-sm: 0 1px 2px rgb(0 0 0 / .12);\n--shadow-md: 0 2px 6px rgb(0 0 0 / .12), 0 1px 2px rgb(0 0 0 / .08);\n--shadow-lg: 0 8px 20px rgb(0 0 0 / .15), 0 2px 6px rgb(0 0 0 / .08);\n--shadow-xl: 0 20px 44px rgb(0 0 0 / .22), 0 6px 14px rgb(0 0 0 / .1);' },
      { name:'filter（画像の加工）', en:'filter', demo:'<div class="c-filters">' + [['none',''],['blur(3px)','blur'],['grayscale(1)','grayscale'],['sepia(1)','sepia'],['hue-rotate(90deg)','hue-rotate'],['saturate(2.5)','saturate'],['contrast(1.8)','contrast'],['invert(1)','invert']].map(f => `<div><span class="wd-art" style="filter:${f[0]}"></span>${f[1] || 'なし'}</div>`).join('') + '</div>', tags:['画像加工'],
        desc:'ぼかし・白黒・セピア・色相回転・彩度・コントラスト・反転などを画像や要素に適用する。複数を組み合わせて写真の雰囲気を変えられる。', prompt:'アーカイブページの古い写真には filter: sepia(.6) contrast(1.1) をかけてレトロな雰囲気にして。', code:'img { filter: grayscale(1) contrast(1.1); }\nimg:hover { filter: none; }' },
      { name:'backdrop-filter（背景ぼかし）', en:'backdrop-filter', stage:'free', demo:'<div class="c-backdrop"><div>Frosted Glass</div></div>', tags:['すりガラス'],
        desc:'要素の<b>後ろにあるもの</b>をぼかす。グラスモーフィズムや、半透明の固定ヘッダーに。', prompt:'固定ヘッダーを半透明の白（rgba(255,255,255,.7)）にして、backdrop-filter: blur(12px) で後ろのコンテンツをぼかして。', code:'.header { background: rgb(255 255 255 / .7); backdrop-filter: blur(12px); }' },
      { name:'CSS変数（カスタムプロパティ）', en:'custom properties', demo:'<div class="c-vars"><div class="chip">CSS変数で変わる</div><label style="font-size:12px">色相 <input type="range" min="0" max="360" value="255" class="hue"></label><label style="font-size:12px">角丸 <input type="range" min="0" max="30" value="10" class="rad"></label></div>', tags:['テーマ','おすすめ'],
        init:(el) => { const c = el.querySelector('.chip'); el.querySelector('.hue').oninput = (e) => c.style.setProperty('--hue', e.target.value); el.querySelector('.rad').oninput = (e) => c.style.setProperty('--r', e.target.value + 'px'); },
        desc:'<code>--color-primary: #6d4cff;</code> のように値に名前を付けて使い回す。色やサイズを1か所変えるだけで全体が変わる。<b>ダークモードやテーマ切替の基礎</b>。', prompt:'色・角丸・余白をすべてCSS変数（:rootにデザイントークンとして定義）で管理して、後からブランドカラーを1か所変えるだけで全体が変わるようにして。',
        code:':root { --primary: #6d4cff; --radius: 12px; }\n.btn { background: var(--primary); border-radius: var(--radius); }' },
      { name:'accent-color', en:'accent-color', demo:'<div class="c-accent"><label><input type="checkbox" checked> チェック</label><label><input type="radio" checked> ラジオ</label><input type="range" value="60"></div>', tags:['フォーム','1行'],
        desc:'チェックボックス・ラジオ・スライダーなどの標準部品の色を<b>1行で</b>ブランドカラーにする。', prompt:'フォームのチェックボックスやラジオボタンの色を accent-color でブランドカラーにして。', code:'body { accent-color: #6d4cff; }' },
    ]},
    { title:'立体・配置', items:[
      { name:'transform（変形）', en:'translate / scale / rotate / skew', demo:'<div class="wd-row"><div class="wd-box" style="width:40px;height:40px;transform:translateY(-10px)"></div><div class="wd-box" style="width:40px;height:40px;transform:scale(1.25)"></div><div class="wd-box" style="width:40px;height:40px;transform:rotate(25deg)"></div><div class="wd-box" style="width:40px;height:40px;transform:skewX(-15deg)"></div></div>', tags:['基本'],
        desc:'<b>translate</b>＝移動、<b>scale</b>＝拡大縮小、<b>rotate</b>＝回転、<b>skew</b>＝傾斜。アニメーションはこれとopacityで作るのが基本。', prompt:'ホバーでアイコンを15度回転して1.1倍に拡大して。', code:'transform: translateY(-10px) scale(1.25) rotate(25deg);' },
      { name:'perspective（3D・遠近）', en:'perspective / rotateX / rotateY', demo:'<div class="c-3d"><div>3D CARD</div></div>', tags:['3D'],
        desc:'親に<code>perspective</code>を付けると、子の3D回転に遠近感が出る。値が小さいほど強いパース。', prompt:'ヒーローのスマホ画像を、perspectiveを付けて少し斜めに傾けた3D表示にして、ゆっくり角度を変えて。', code:'.scene { perspective: 500px; }\n.card { transform: rotateX(25deg) rotateY(-30deg); }' },
      { name:'aspect-ratio（縦横比）', en:'aspect-ratio', demo:'<div class="c-ratio"><div style="width:96px;aspect-ratio:16/9">16:9</div><div style="width:60px;aspect-ratio:1">1:1</div><div style="width:64px;aspect-ratio:4/3">4:3</div><div style="width:40px;aspect-ratio:9/16">9:16</div></div>', tags:['動画・画像'],
        desc:'幅に対して高さを比率で決める。動画の埋め込み、サムネイル、正方形のアイコン枠に。', prompt:'YouTube埋め込みを横幅100%・16:9の比率で表示して（aspect-ratio）。', code:'.video { width:100%; aspect-ratio: 16 / 9; }' },
      { name:'Flexbox（一列に並べる）', en:'display: flex', demo:'<div class="c-flex">' + [['flex-start','flex-start'],['center','center'],['space-between','space-between'],['space-around','space-around']].map(j => `<div style="justify-content:${j[0]}" data-l="${j[1]}"><i></i><i></i><i></i></div>`).join('') + '</div>', tags:['基本','1次元'],
        desc:'要素を<b>横または縦の一列</b>に並べる。<code>justify-content</code>で主軸方向の配置、<code>align-items</code>で交差方向の揃え、<code>gap</code>で間隔。ナビ、ボタン群、カード内の配置に。', prompt:'ヘッダーの中身をflexで、ロゴは左、メニューは中央、ボタンは右に配置して、縦方向は中央揃えに。', code:'.nav { display:flex; justify-content: space-between; align-items: center; gap: 16px; }' },
      { name:'CSS Grid（格子に並べる）', en:'display: grid / grid-template-areas', demo:'<div class="c-areas"><div style="grid-area:head">head</div><div style="grid-area:side">side</div><div style="grid-area:main">main</div><div style="grid-area:foot">foot</div></div>', tags:['基本','2次元'],
        desc:'縦横の<b>格子（2次元）</b>で配置する。<code>grid-template-areas</code>を使うと、領域に名前を付けて図のようにレイアウトを書ける。', prompt:'ページ全体をCSS Gridのgrid-template-areasで「head head / side main / foot foot」の配置にして。',
        code:'.page { display:grid; grid-template-columns: 200px 1fr; grid-template-rows: 64px 1fr auto;\n  grid-template-areas: "head head" "side main" "foot foot"; }\nheader { grid-area: head; }' },
      { name:'コンテナクエリ', en:'@container', demo:'<div class="c-cq"><div class="in"><i></i><span>枠の右下をドラッグして幅を変えてみて</span></div></div>', hint:'右下をドラッグ', tags:['新しいCSS'],
        desc:'親の幅に応じてレイアウトを変える。見本は枠が200px未満になると縦並びに切り替わる。', prompt:'商品カードを、親の幅が200px未満なら縦並び・それ以上なら横並びになるよう、コンテナクエリで作って。',
        code:'.wrap { container-type: inline-size; }\n@container (max-width: 200px) { .card { flex-direction: column; } }' },
    ]},
    { title:'セレクタ・テキスト', items:[
      { name:':has()（親を条件で選ぶ）', en:':has()', demo:'<div class="c-has"><label><input type="radio" name="hasd" checked>プランA</label><label><input type="radio" name="hasd">プランB</label><label><input type="radio" name="hasd">プランC</label></div>', hint:'選んでみて', tags:['新しいCSS','JS不要'],
        desc:'「〇〇を含む要素」を選べる。見本は<b>チェックされたラジオを含むカードだけ</b>を強調している。以前はJSが必要だった処理がCSSだけで書ける。', prompt:'プラン選択のカードは、中のラジオボタンが選ばれたらカード全体の枠線を紫にして少し浮かせて（:has(input:checked) で、JSなしで）。',
        code:'.card:has(input:checked) { border-color: #6d4cff; transform: translateY(-3px); }' },
      { name:'省略記号（…）', en:'text-overflow / line-clamp', demo:'<div class="c-clamp"><p class="one">1行で収まらない長いタイトルはこのように末尾が省略記号になります。</p><p>複数行の場合は -webkit-line-clamp を使うと、指定した行数（この見本では2行）で切って末尾を「…」にできます。カード内の説明文の高さを揃えるのに便利です。</p></div>', tags:['カード'],
        desc:'長い文章を指定行数で切って「…」を付ける。カードの高さを揃えるのに必須。', prompt:'カードのタイトルは1行、説明文は2行で切って、はみ出した分は「…」で省略して。',
        code:'.title { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }\n.desc  { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }' },
      { name:'@property（型付きCSS変数）', en:'@property', demo:'<div class="h-gborder" style="animation-play-state:running">回り続ける枠</div>', tags:['アニメーション拡張'],
        desc:'CSS変数に型（角度・色・長さ）を登録すると、<b>グラデーションの角度や色</b>までアニメーションできるようになる。', prompt:'@propertyで角度の変数を登録して、ボタンのグラデーションがぐるぐる回転するアニメーションを作って。',
        code:'@property --angle { syntax: "<angle>"; initial-value: 0deg; inherits: false; }\n.el { background: conic-gradient(from var(--angle), …); animation: spin 3s linear infinite; }\n@keyframes spin { to { --angle: 360deg; } }' },
      { name:'ダークモード対応', en:'prefers-color-scheme', demo:'<div class="wd-row"><div class="wd-card" style="background:#fff;color:#111;width:110px">ライト</div><div class="wd-card" style="background:#111;color:#eee;border-color:#333;width:110px">ダーク</div></div>', tags:['テーマ'],
        desc:'OSの設定がダークなら自動でダーク配色にする。CSS変数で色を定義し、メディアクエリで上書きするのが基本。手動切替ボタンも付けると親切。', prompt:'OSのダークモード設定に自動で合わせて配色を切り替えて。さらに右上に手動の切替ボタンも付けて、選択はlocalStorageに保存して。',
        code:':root { --bg:#fff; --text:#111; }\n@media (prefers-color-scheme: dark) { :root { --bg:#111; --text:#eee; } }\n:root[data-theme="dark"] { --bg:#111; --text:#eee; }' },
    ]},
  ]
});

/* ---------- ライブラリ ---------- */
TABS.push({
  id:'libs', label:'アニメ系ライブラリ', icon:'⧉',
  intro:'自分で書くと大変な動きを、少ないコードで実現できるライブラリ・素材集。<b>「〇〇（ライブラリ名）を使って」</b>と指定すると、AIは実績のある書き方をしてくれるのでバグが減ります。',
  sections:[
    { title:'総合アニメーション', layout:'rows', items:[
      { name:'GSAP', en:'GreenSock Animation Platform', tags:['定番','無料（2025〜全プラグイン）','ScrollTrigger'], url:'https://gsap.com/',
        desc:'プロの現場で最も使われるJSアニメーションライブラリ。<b>ScrollTrigger（スクロール連動）、SplitText（文字分割）、MorphSVG</b>などのプラグインも含めて無料で使える。タイムラインで複雑な演出を順番に組める。', prompt:'GSAPとScrollTriggerを使って、セクションに入ったら見出し→本文→画像の順にタイムラインでフェードアップさせて。',
        code:'<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>\n<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js"></script>\n<script>\n  gsap.registerPlugin(ScrollTrigger);\n  gsap.from(".card", { y: 40, opacity: 0, stagger: .1, scrollTrigger: ".cards" });\n</script>' },
      { name:'Motion（旧 Framer Motion）', en:'motion.dev', tags:['React定番','Vueも可','バネ'], url:'https://motion.dev/',
        desc:'Reactで最もよく使われるアニメーションライブラリ。<code>&lt;motion.div animate={{…}}&gt;</code> のように宣言的に書ける。レイアウトの変化を自動でアニメーションする <code>layout</code>、退場アニメの <code>AnimatePresence</code> が強力。素のJS版もある。', prompt:'Reactのリストで、項目の追加・削除・並べ替えがアニメーションするように Motion（motion/react）の layout と AnimatePresence を使って。',
        code:'npm i motion\n\nimport { motion } from "motion/react";\n<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}\n  transition={{ type: "spring", stiffness: 300, damping: 24 }} />' },
      { name:'Anime.js', en:'animejs', tags:['軽量','SVG'], url:'https://animejs.com/',
        desc:'軽量で書きやすいJSアニメーションライブラリ。SVGや数値のアニメーション、スタッガーが簡単。v4で大幅刷新。', prompt:'Anime.jsで、グリッドの点が中心から波紋のように時間差で拡大するアニメーションを作って（stagger の grid と from: "center" を使用）。',
        code:"import { animate, stagger } from 'animejs';\nanimate('.dot', { scale: [0, 1], delay: stagger(50, { grid: [10, 10], from: 'center' }) });" },
      { name:'Animate.css', en:'animate.css', tags:['CSSのみ','クラスを付けるだけ'], url:'https://animate.style/',
        desc:'クラス名を付けるだけで、bounce・fadeInUp・tada など80種以上のアニメーションが使えるCSSライブラリ。この辞典の「CSSアニメーション」の多くが入っている。', prompt:'Animate.cssを読み込んで、タイトルに animate__animated animate__fadeInDown を付けて。',
        code:'<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">\n<h1 class="animate__animated animate__bounce">Hello</h1>' },
      { name:'AutoAnimate', en:'@formkit/auto-animate', tags:['1行','リスト'], url:'https://auto-animate.formkit.com/',
        desc:'親要素に1行追加するだけで、子要素の追加・削除・並べ替えが自動でアニメーションする。手軽さ最強。', prompt:'ToDoリストに AutoAnimate を使って、追加・削除時に自動でアニメーションするようにして。',
        code:"import autoAnimate from '@formkit/auto-animate';\nautoAnimate(document.querySelector('ul'));" },
      { name:'React Spring', en:'react-spring', tags:['React','物理ベース'], url:'https://www.react-spring.dev/', desc:'バネの物理モデルで動かすReact用ライブラリ。ドラッグ操作と組み合わせた自然な動きが得意。', prompt:'React Springと@use-gesture/reactで、カードをドラッグして離すとバネで元の位置に戻るようにして。' },
    ]},
    { title:'スクロール', layout:'rows', items:[
      { name:'AOS', en:'Animate On Scroll', tags:['超かんたん','HTML属性だけ'], url:'https://michalsnik.github.io/aos/',
        desc:'HTMLに <code>data-aos="fade-up"</code> と書くだけで、スクロールで表示されたときにアニメーションする。初心者のLP制作に最適。', prompt:'AOSライブラリを使って、各セクションの要素に data-aos="fade-up" を付けてスクロールでふわっと出るようにして。',
        code:'<link rel="stylesheet" href="https://unpkg.com/aos@2.3.4/dist/aos.css">\n<script src="https://unpkg.com/aos@2.3.4/dist/aos.js"></script>\n<div data-aos="fade-up" data-aos-delay="100">…</div>\n<script>AOS.init({ once: true, duration: 700 });</script>' },
      { name:'Lenis', en:'smooth scroll', tags:['慣性スクロール','受賞サイト系'], url:'https://lenis.darkroom.engineering/',
        desc:'マウスホイールのスクロールを、慣性のあるヌルッとした滑らかな動きにする。GSAP ScrollTriggerと組み合わせるのが定番。', prompt:'Lenisでページ全体を慣性のある滑らかなスクロールにして、GSAP ScrollTriggerと同期させて。',
        code:"const lenis = new Lenis();\nfunction raf(t){ lenis.raf(t); requestAnimationFrame(raf); }\nrequestAnimationFrame(raf);" },
      { name:'Locomotive Scroll', en:'locomotive-scroll', tags:['パララックス'], url:'https://scroll.locomotive.ca/', desc:'スムーススクロールとパララックス、スクロール検出をまとめて提供。v5はLenisベース。', prompt:'Locomotive Scrollを使って、data-scroll-speed属性で要素ごとに違う速さのパララックスを付けて。' },
      { name:'Swiper', en:'swiper.js', tags:['スライダー定番','タッチ対応'], url:'https://swiperjs.com/',
        desc:'スライダー（カルーセル）の定番。スワイプ、ループ、自動再生、ページネーション、エフェクト（フェード・キューブ・カード）など全部入り。', prompt:'Swiperでお客様の声のスライダーを作って。自動再生5秒、ループ、下にドット、PCでは3枚・スマホでは1枚表示。',
        code:'<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css">\n<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>\nnew Swiper(".swiper", { loop:true, autoplay:{ delay:5000 }, pagination:{ el:".swiper-pagination" },\n  slidesPerView:1, spaceBetween:16, breakpoints:{ 768:{ slidesPerView:3 } } });' },
      { name:'Splide', en:'splidejs', tags:['軽量スライダー','アクセシブル'], url:'https://splidejs.com/', desc:'軽量でアクセシビリティに配慮したスライダー。Swiperより小さく済ませたいときに。', prompt:'Splideで画像ギャラリーのスライダーとサムネイルナビを連動させて作って。' },
    ]},
    { title:'演出素材・特殊効果', layout:'rows', items:[
      { name:'Lottie', en:'lottie-web / dotLottie', tags:['AE製アニメ','軽量ベクター'], url:'https://lottiefiles.com/',
        desc:'After Effectsで作ったアニメーションをJSONにして、Webやアプリで軽量に再生する。<b>LottieFilesで無料素材が大量に手に入る</b>。ローディング、成功、空状態のイラストに。', prompt:'LottieFilesの成功アニメーション（JSON）を、送信完了時に一度だけ再生して表示して。',
        code:'<script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js"></script>\nlottie.loadAnimation({ container: el, path: "success.json", loop: false, autoplay: true });' },
      { name:'Rive', en:'rive.app', tags:['インタラクティブ','状態遷移'], url:'https://rive.app/', desc:'エディタで作った、操作に反応するベクターアニメーション（ステートマシン）を再生する。ボタンに反応するキャラクターなど。', prompt:'Riveで作ったキャラクターのアニメーションを読み込み、ホバーとクリックでステートマシンの入力を切り替えて反応させて。' },
      { name:'Three.js', en:'three.js', tags:['3D','WebGL'], url:'https://threejs.org/',
        desc:'ブラウザで3Dを描く定番ライブラリ。3Dモデル（glTF）の表示、パーティクル、シェーダー背景など。Reactなら React Three Fiber。', prompt:'Three.jsで、ヒーローの背景にゆっくり回転するワイヤーフレームの球体と、マウスに少し追従するカメラを作って。',
        code:'<script type="importmap">{ "imports": { "three": "https://unpkg.com/three@0.160.0/build/three.module.js" } }</script>\n<script type="module">\n  import * as THREE from "three";\n  // scene, camera, renderer を作って requestAnimationFrame で描画\n</script>' },
      { name:'Spline', en:'spline.design', tags:['3Dデザインツール','埋め込み'], url:'https://spline.design/', desc:'ブラウザ上で3Dシーンを作り、URLやコードでそのままWebに埋め込めるツール。コードなしで立体的なヒーローが作れる。', prompt:'SplineでエクスポートしたシーンのURLを、@splinetool/viewer でヒーローの右側に埋め込んで。' },
      { name:'tsParticles', en:'tsparticles', tags:['パーティクル','紙吹雪'], url:'https://particles.js.org/', desc:'パーティクル、星、雪、紙吹雪（confetti）などを設定だけで作れる。', prompt:'購入完了時に tsParticles の confetti で紙吹雪を画面いっぱいに降らせて。' },
      { name:'canvas-confetti', en:'canvas-confetti', tags:['お祝い','1行'], url:'https://github.com/catdad/canvas-confetti', desc:'1行で紙吹雪を飛ばせる超軽量ライブラリ。達成・購入完了・誕生日に。', prompt:'目標を達成したら canvas-confetti で紙吹雪を左右から打ち上げて。', code:'<script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"></script>\nconfetti({ particleCount: 150, spread: 70, origin: { y: .6 } });' },
      { name:'Vanta.js', en:'vanta', tags:['3D背景','設定だけ'], url:'https://www.vantajs.com/', desc:'波・霧・鳥の群れ・ネットワークなどの動く3D背景を数行で設置できる（Three.jsベース）。', prompt:'Vanta.jsのNET効果をヒーローの背景に設定して、色をブランドカラーに合わせて。' },
      { name:'Typed.js', en:'typed.js', tags:['タイプライター'], url:'https://mattboldt.com/demos/typed-js/', desc:'タイプライター演出専用ライブラリ。複数文の打ち込み・削除・ループを設定だけで。', prompt:'Typed.jsで、キャッチコピーの後半を3つの単語で打っては消すループにして。', code:"new Typed('#el', { strings: ['作る。', '試す。', '届ける。'], typeSpeed: 60, backSpeed: 30, loop: true });" },
      { name:'Barba.js / Swup', en:'page transitions', tags:['ページ遷移','静的サイト'], url:'https://barba.js.org/', desc:'普通の複数ページのサイトでも、ページ遷移をアプリのように滑らかにアニメーションできる。', prompt:'Barba.jsとGSAPで、ページ遷移時にカーテンが画面を覆って切り替わるトランジションを付けて。' },
    ]},
    { title:'コピペで使えるUI演出集（AIとの相性◎）', note:'見た目の良いアニメーション付き部品を、コードごとコピーして使えるサイト。「このサイトの〇〇みたいに」とAIに伝えるのにも便利です。', layout:'rows', items:[
      { name:'shadcn/ui', en:'ui.shadcn.com', tags:['React定番','Tailwind'], url:'https://ui.shadcn.com/', desc:'コピーして自分のプロジェクトに取り込む方式のReactコンポーネント集。AIコーディングツールの多くが標準的に使う。', prompt:'UIはshadcn/uiのコンポーネント（Button, Card, Dialog, Tabs）で組んで。' },
      { name:'Magic UI', en:'magicui.design', tags:['React','派手め'], url:'https://magicui.design/', desc:'マーキー、光る枠、数字のカウントアップ、粒子など、LP向けのアニメーション部品集（shadcn/uiと併用可）。', prompt:'Magic UIのMarqueeとNumberTickerを使って、導入企業ロゴ帯と実績数字のセクションを作って。' },
      { name:'Aceternity UI', en:'ui.aceternity.com', tags:['React','Framer Motion'], url:'https://ui.aceternity.com/', desc:'スポットライト、3Dカード、オーロラ背景など、印象的なエフェクト部品を多数掲載。', prompt:'Aceternity UIのSpotlightとBackground Beamsのようなヒーローセクションを作って。' },
      { name:'React Bits', en:'reactbits.dev', tags:['React','テキスト演出'], url:'https://reactbits.dev/', desc:'文字の分割アニメ、背景、カーソル演出などの部品集。CSS/Tailwind版も選べる。', prompt:'React BitsのSplit Textのような見出しアニメーションを実装して。' },
      { name:'Uiverse', en:'uiverse.io', tags:['HTML/CSSのみ','ボタン・ローダー'], url:'https://uiverse.io/', desc:'ボタン・ローダー・トグル・カードなどのHTML/CSSだけで作られた部品がオープンソースで大量に公開されている。', prompt:'Uiverseにあるようなネオンのトグルスイッチを、HTMLとCSSだけで作って。' },
      { name:'CodePen', en:'codepen.io', tags:['参考実装'], url:'https://codepen.io/', desc:'世界中の作者のデモが見られる。「codepen ○○ effect」で検索すると実装例が見つかる。ライセンスに注意。', prompt:'（CodePenで見つけたデモのURLやコードを貼り付けて）これと同じ動きを、自分のサイトの配色で作り直して。' },
    ]},
  ]
});
})();
