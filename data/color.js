/* 配色・タイポグラフィ辞典 */
(function(){
const $ = (el, s) => el.querySelector(s), $$ = (el, s) => [...el.querySelectorAll(s)];
function hsl2hex(h, s, l){ s /= 100; l /= 100; const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l); const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return '#' + [f(0), f(8), f(4)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join(''); }
function lum(hex){ const c = hex.replace('#', '').match(/../g).map(x => parseInt(x, 16) / 255).map(v => v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4)); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; }
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
const sw = (cols, tall) => `<div class="sw ${tall ? 'tall' : ''}">${cols.map(c => `<div style="background:${c}" data-c="${c}" title="クリックでコピー">${c}</div>`).join('')}</div>`;
const bindCopy = (el) => $$(el, '[data-c]').forEach(d => d.onclick = () => VD.copyText(d.dataset.c));
const H = (h) => hsl2hex(((h % 360) + 360) % 360, 70, 55);
const harmony = (offsets, base = 200) => ({ demo:`<div class="c-split"><div class="wheel">${offsets.map(o => { const a = (base + o - 90) * Math.PI / 180; return `<i style="background:${H(base + o)};transform:translate(${Math.cos(a) * 46}px, ${Math.sin(a) * 46}px)"></i>`; }).join('')}</div>${sw(offsets.map(o => H(base + o)))}</div>`, init: bindCopy });

TABS.push({
  id:'theory', label:'配色の基本', icon:'◐',
  intro:'色は<b>色相（H：何色か）・彩度（S：鮮やかさ）・明度（L：明るさ）</b>の3つで考えると扱いやすくなります。配色の型を知っていると「ブランドカラーに合う色を足して」とAIに具体的に頼めます。色見本はクリックでHEXをコピーできます。',
  sections:[
    { title:'色の3要素を触ってみる', items:[
      { name:'HSL（色相・彩度・明度）', en:'Hue / Saturation / Lightness', h:190, wide:true, stage:'free',
        demo:'<div style="position:absolute;inset:0;display:grid;place-items:center"><div class="hsl"><div class="chip"></div><div style="display:flex;flex-direction:column;gap:6px"><label>H<input type="range" min="0" max="360" value="168" data-k="h"><span></span></label><label>S<input type="range" min="0" max="100" value="80" data-k="s"><span></span></label><label>L<input type="range" min="0" max="100" value="38" data-k="l"><span></span></label></div><div class="hex"></div></div></div>',
        init:(el) => { const ins = $$(el, 'input'), chip = $(el, '.chip'), hex = $(el, '.hex'); const up = () => { const [h, s, l] = ins.map(i => +i.value); ins.forEach(i => i.nextElementSibling.textContent = i.value); const x = hsl2hex(h, s, l); chip.style.background = x; hex.textContent = `hsl(${h} ${s}% ${l}%)  =  ${x}`; }; ins.forEach(i => i.oninput = up); up(); hex.style.cursor = 'pointer'; hex.onclick = () => VD.copyText(hex.textContent.split('=  ')[1]); },
        desc:'<b>H</b>＝色の種類（0赤→120緑→240青→360赤）、<b>S</b>＝鮮やかさ（0で灰色）、<b>L</b>＝明るさ（0黒〜100白）。CSSでは <code>hsl(168 80% 38%)</code> と書ける。<b>色相を固定して明度だけ変えると、同じ系統の色の段階（50〜900）が作れる</b>。', prompt:'ブランドカラー hsl(168 80% 38%) を基準に、明度だけを変えた10段階（50〜900）のカラースケールをCSS変数で作って。' },
    ]},
    { title:'配色の型（カラーハーモニー）', note:'色相環（色の輪）の上での位置関係で、相性の良い組み合わせが決まります。', items:[
      Object.assign({ name:'補色', en:'Complementary', tags:['強い対比'], desc:'色相環で<b>正反対</b>の2色。互いを引き立て合い目立つ。アクセント（CTAボタン）に1色だけ使うのが効果的。使いすぎるとギラつく。', prompt:'メインカラーの補色をCTAボタンの色にして、ボタンだけが目立つようにして。' }, harmony([0, 180])),
      Object.assign({ name:'類似色', en:'Analogous', tags:['まとまり','自然'], desc:'色相環で<b>隣り合う</b>2〜3色。調和しやすく、穏やかで自然な印象。グラデーションにも向く。', prompt:'青緑を中心に、類似色（色相±30度）の3色で落ち着いた配色にして。' }, harmony([-30, 0, 30])),
      Object.assign({ name:'トライアド', en:'Triadic', tags:['にぎやか','バランス'], desc:'色相環を<b>3等分</b>した3色。カラフルでもバランスが取れる。子ども向け・ポップなデザインに。1色を主役、他を控えめに。', prompt:'トライアド配色（色相120度ずつ）で、1色をメイン、残り2色をアクセントにしたポップなデザインにして。' }, harmony([0, 120, 240])),
      Object.assign({ name:'スプリット・コンプリメンタリー', en:'Split Complementary', tags:['補色より穏やか'], desc:'基本色と、その補色の<b>両隣</b>の2色。補色の対比を保ちつつ、きつくなりすぎない。', prompt:'スプリット・コンプリメンタリー配色で、メインカラーと2つのアクセントカラーを決めて。' }, harmony([0, 150, 210])),
      Object.assign({ name:'テトラード（4色）', en:'Tetradic / Square', tags:['上級'], desc:'色相環上の<b>四角形</b>の4色。色数が多く華やかだが、まとめるのが難しい。1色を主役に、他は面積を小さく。' }, harmony([0, 90, 180, 270])),
      { name:'モノクロマティック（単色）', en:'Monochromatic', tags:['統一感','上品'], h:150, demo: sw([hsl2hex(168,70,90), hsl2hex(168,70,75), hsl2hex(168,70,55), hsl2hex(168,70,38), hsl2hex(168,70,22)]), init: bindCopy,
        desc:'<b>1つの色相</b>で明度・彩度だけを変える。失敗しにくく上品。迷ったらこれ＋グレーで始めるとよい。', prompt:'ブランドカラー1色の明度違いだけで配色して、背景は薄い色、文字は濃い色、ボタンは中間の色にして。' },
    ]},
    { title:'配色の実践ルール', items:[
      { name:'60:30:10の法則', en:'60-30-10 Rule', h:140, demo:'<div class="rule603010"><div style="flex:60;background:#f1ede4;color:#555">60% ベース</div><div style="flex:30;background:#264653">30% メイン</div><div style="flex:10;background:#e76f51">10%</div></div>', tags:['面積比'],
        desc:'<b>ベースカラー60%（背景）、メインカラー30%（見出し・面）、アクセント10%（ボタン・強調）</b>の面積比にすると、まとまりつつメリハリが出る。', prompt:'配色を60:30:10の法則で組んで。ベース=オフホワイト、メイン=濃い青緑、アクセント=オレンジ（ボタンと重要な数字だけ）。' },
      { name:'コントラスト比（読みやすさ）', en:'WCAG Contrast Ratio', h:210, stage:'free', wide:true,
        demo:'<div style="position:absolute;inset:0;display:grid;place-items:center"><div class="cc"><div class="pv">この文字は読みやすいですか？<small>小さな文字は特にコントラストが必要です（14px）</small></div><div class="ctrl"><label>文字 <input type="color" value="#7c8a99" data-k="fg"></label><label>背景 <input type="color" value="#ffffff" data-k="bg"></label><span class="ratio"></span><span class="res"></span></div></div></div>',
        init:(el) => { const fg = $(el, '[data-k=fg]'), bg = $(el, '[data-k=bg]'), pv = $(el, '.pv'), r = $(el, '.ratio'), res = $(el, '.res'); const up = () => { pv.style.color = fg.value; pv.style.background = bg.value; const x = ratio(fg.value, bg.value); r.textContent = x.toFixed(2) + ' : 1'; const p = (ok, t) => `<span class="pass ${ok ? 'y' : 'n'}">${t} ${ok ? '合格' : '不合格'}</span>`; res.innerHTML = p(x >= 4.5, 'AA') + p(x >= 7, 'AAA') + p(x >= 3, '大きな文字AA'); }; fg.oninput = bg.oninput = up; up(); },
        tags:['アクセシビリティ','超重要'],
        desc:'文字と背景の明るさの差。<b>本文は4.5:1以上（WCAG AA）</b>、大きな文字（18px以上の太字等）は3:1以上が基準。薄いグレーの文字はおしゃれに見えても読めない人が多い。見本の色を変えて確かめられる。', prompt:'サイト全体の文字色と背景色の組み合わせが、WCAG AAのコントラスト比（本文4.5:1以上）を満たしているかチェックして、満たしていない箇所を修正して。' },
      { name:'トーン（色の調子）', en:'Tone: Vivid / Pastel / Dull / Dark', h:160, demo:'<div class="tones">' + [['ビビッド', 90, 50], ['パステル', 70, 85], ['ダル（くすみ）', 25, 55], ['ダーク', 60, 25]].map(t => `<div>${[0, 45, 160, 220, 280].map(h => `<span style="background:${hsl2hex(h, t[1], t[2])}"></span>`).join('')}${t[0]}</div>`).join('') + '</div>', tags:['雰囲気'],
        desc:'彩度と明度の組み合わせ（トーン）を揃えると、色相が違ってもまとまる。<b>ビビッド</b>＝元気、<b>パステル</b>＝やさしい、<b>ダル（くすみ）</b>＝落ち着き・大人っぽい、<b>ダーク</b>＝重厚。', prompt:'くすみカラー（彩度を落としたダルトーン）で統一した、大人っぽく落ち着いた配色にして。' },
      { name:'色が与える印象', en:'Color Psychology', layout:'rows', h:0, tags:['ブランド'],
        desc:'<b>赤</b>＝情熱・緊急・食欲／<b>オレンジ</b>＝親しみ・元気／<b>黄</b>＝明るさ・注意／<b>緑</b>＝自然・安心・成功／<b>青</b>＝信頼・誠実・冷静（金融・IT・医療に多い）／<b>紫</b>＝高貴・神秘・創造／<b>ピンク</b>＝やさしさ・かわいさ／<b>黒</b>＝高級・力強さ／<b>白</b>＝清潔・シンプル。', prompt:'「信頼できるけど堅すぎない」家計簿アプリにしたいので、それに合う配色を理由付きで3案出して。' },
    ]},
  ]
});

/* ---------- パレット（切替プレビュー） ---------- */
const PAL = [
  ['ナチュラル', 'Natural', ['#f5f1e8', '#ffffff', '#6b8e4e', '#d4a373', '#2f3e2c'], 'オーガニック・カフェ・雑貨。緑とベージュの穏やかな組み合わせ。'],
  ['北欧', 'Scandinavian', ['#f7f7f2', '#ffffff', '#4a6fa5', '#f2c14e', '#2b2d42'], '明るい白地に、くすんだ青と黄色のアクセント。インテリア・暮らし系。'],
  ['ポップ', 'Pop', ['#fff8e7', '#ffffff', '#ff4f81', '#3ec1d3', '#1f1f1f'], '元気なピンクと水色。若者向け・イベント・SNS系。'],
  ['レトロ', 'Retro', ['#f4e9d8', '#fffaf0', '#d1495b', '#edae49', '#3d405b'], '昭和〜70年代風の赤・からし色・紺。喫茶店・古着・レコード。'],
  ['ラグジュアリー', 'Luxury', ['#111111', '#1c1c1c', '#c9a96e', '#8a6e3e', '#f2ece0'], '黒と金。ホテル・ジュエリー・高級レストラン。'],
  ['テック（ダーク）', 'Tech Dark', ['#0b1020', '#141b2f', '#3b82f6', '#22d3ee', '#e5e7eb'], '紺黒に青とシアン。SaaS・開発者向け・AIプロダクト。'],
  ['和モダン', 'Japanese', ['#f4efe6', '#fbf8f2', '#b7282e', '#1e50a2', '#2b2b2b'], '生成りに臙脂と瑠璃色。和菓子・旅館・伝統工芸。'],
  ['パステル', 'Pastel', ['#fdf6fb', '#ffffff', '#b39ddb', '#f8bbd0', '#4a4458'], 'ラベンダーと桜色。美容・子育て・かわいい系。'],
  ['アース', 'Earth', ['#efe6dd', '#fffaf5', '#a0522d', '#6b8e23', '#3e2c23'], 'テラコッタとオリーブ。アウトドア・陶器・サステナブル。'],
  ['ネオン', 'Neon', ['#0a0014', '#160828', '#ff2bd6', '#00f0ff', '#f5f3ff'], '暗闇に光るマゼンタとシアン。ゲーム・音楽・ナイトイベント。'],
  ['モノトーン', 'Monotone', ['#fafafa', '#ffffff', '#111111', '#888888', '#111111'], '白黒とグレーのみ。写真やプロダクトを主役にしたいポートフォリオ・建築。'],
  ['オーシャン', 'Ocean', ['#eef7fb', '#ffffff', '#0077b6', '#00b4d8', '#023047'], '海の青のグラデーション。旅行・マリンスポーツ・爽やかさ。'],
  ['フォレスト', 'Forest', ['#eef3ec', '#ffffff', '#2d6a4f', '#95d5b2', '#1b2d24'], '深い緑とミント。環境・健康・農業。'],
  ['サンセット', 'Sunset', ['#fff4ec', '#ffffff', '#ff6b35', '#f7c59f', '#2e1f27'], '夕焼けのオレンジとピーチ。温かさ・食・コミュニティ。'],
  ['コーポレート', 'Corporate', ['#f5f7fa', '#ffffff', '#1d4ed8', '#0ea5e9', '#0f172a'], '信頼感の青。企業サイト・金融・BtoBサービス。'],
  ['キッズ', 'Kids', ['#fffbe6', '#ffffff', '#ff595e', '#8ac926', '#22223b'], '赤・黄緑など原色寄りの明るい色。教育・子ども向け。'],
  ['カフェ', 'Cafe', ['#f6efe7', '#fffaf4', '#6f4e37', '#c08552', '#2b1d14'], 'コーヒーとミルクの茶色。カフェ・ベーカリー・本屋。'],
  ['くすみカラー', 'Muted', ['#f3f1ee', '#ffffff', '#8e9aaf', '#cbc0d3', '#3d3a4b'], '灰色がかったやさしい色。ファッション・雑貨・大人向けのかわいさ。'],
  ['クリニック', 'Clinic', ['#f2f8f8', '#ffffff', '#0f766e', '#38bdf8', '#12302e'], '清潔感のある青緑と水色。病院・歯科・薬局・ヘルスケア。'],
  ['スポーツ', 'Sports', ['#f4f6f8', '#ffffff', '#e11d48', '#111827', '#0b0f19'], '赤と黒の力強い組み合わせ。ジム・スポーツチーム・イベント。'],
  ['春', 'Spring', ['#fbf7f2', '#ffffff', '#e48ab0', '#a3c97d', '#3b3433'], '桜色と若葉の黄緑。新生活・季節のキャンペーン。'],
  ['夏', 'Summer', ['#f0fbff', '#ffffff', '#0284c7', '#facc15', '#0c2233'], '空の青とひまわりの黄色。夏祭り・海・アウトドア。'],
  ['秋', 'Autumn', ['#faf3eb', '#fffaf4', '#b45309', '#7c2d12', '#2d1b10'], '紅葉のオレンジと栗色。食欲の秋・アート・読書。'],
  ['冬', 'Winter', ['#f1f5f9', '#ffffff', '#1e3a8a', '#94a3b8', '#0f172a'], '雪の白と深い紺、銀色。年末年始・ギフト・静かな高級感。'],
];
const PAL_MOCK = `<div class="pal-mock"><div class="pal-nav"><b>◆ Palette</b><span>サービス</span><span>料金</span><button class="btn">はじめる</button></div>
  <div><h5>色で、<em>印象</em>は変わる。</h5><p>同じレイアウトでも、パレットを変えるだけで雰囲気が切り替わります。</p></div>
  <div style="display:flex;gap:8px"><button class="btn">無料で試す</button><button class="btn alt">詳しく見る</button></div>
  <div class="pal-cards"><div><i>NEW</i><b>カード 1</b>サーフェス色</div><div><i>人気</i><b>カード 2</b>アクセントのタグ</div><div><i>限定</i><b>カード 3</b>本文テキスト</div></div>
  <div class="pal-chips"></div></div>`;
const palOpts = PAL.map(p => { const [bg, sf, pr, ac, tx] = p[2]; const on = lum(pr) > .45 ? '#111' : '#fff'; return { label:p[0], en:p[1], desc:p[3] + `<br><br><b>背景</b> ${bg}　<b>面</b> ${sf}<br><b>メイン</b> ${pr}　<b>アクセント</b> ${ac}<br><b>文字</b> ${tx}`, style:`--c-bg:${bg};--c-surface:${sf};--c-primary:${pr};--c-accent:${ac};--c-text:${tx};--c-on:${on}`,
  apply:(pv) => { const box = $(pv, '.pal-chips'); box.innerHTML = p[2].map(c => `<span style="background:${c}" title="クリックでコピー">${c}</span>`).join(''); $$(box, 'span').forEach((s, i) => s.onclick = () => VD.copyText(p[2][i])); },
  prompt:`配色を「${p[0]}」の雰囲気で、背景${bg}・カード${sf}・メインカラー${pr}・アクセント${ac}・文字${tx}にして。CSS変数で定義して。`,
  code:`:root {\n  --color-bg: ${bg};\n  --color-surface: ${sf};\n  --color-primary: ${pr};\n  --color-accent: ${ac};\n  --color-text: ${tx};\n}` }; });

TABS.push({
  id:'palette', label:'雰囲気別パレット', icon:'▥',
  intro:'タブを押すと<b>同じ画面の配色が切り替わります</b>。「背景・面・メイン・アクセント・文字」の5色セットなので、CSS変数のコードをそのまま使えます。色のチップはクリックでコピーできます。',
  sections:[
    { title:'パレット切替プレビュー', custom:(el) => VD.switcher(el, { preview: PAL_MOCK, options: palOpts }) },
    { title:'配色を作る・探すツール', layout:'rows', items:[
      { name:'Coolors', en:'coolors.co', url:'https://coolors.co/', tags:['定番'], desc:'スペースキーで次々にパレットを生成。気に入った色をロックして残りを変えられる。' },
      { name:'Adobe Color', en:'color.adobe.com', url:'https://color.adobe.com/', desc:'色相環で補色・トライアドなどのハーモニーを作れる。写真から配色を抽出する機能も。' },
      { name:'Realtime Colors', en:'realtimecolors.com', url:'https://www.realtimecolors.com/', tags:['実際のサイトで確認'], desc:'選んだ色をその場でWebサイトのモックに当てはめて確認できる。CSS変数も出力。' },
      { name:'Tailwind CSS のカラーパレット', en:'tailwindcss.com/docs/colors', url:'https://tailwindcss.com/docs/colors', desc:'よく調整された22色×11段階の色見本。「slate-900」「emerald-500」のように名前で指定できるのでAIとの会話で便利。', prompt:'色はTailwindの標準パレットから選んで。メインはemerald-600、背景はstone-50、文字はstone-900で。' },
      { name:'uicolors.app / tints.dev', en:'カラースケール生成', url:'https://uicolors.app/', desc:'1色から50〜950の段階のスケールを自動生成し、Tailwindの設定やCSS変数で出力できる。' },
    ]},
  ]
});

/* ---------- 和色 ---------- */
const WA = [['桜色','sakura-iro','#fef4f4'],['撫子色','nadeshiko-iro','#eebbcb'],['鴇色','toki-iro','#f4b3c2'],['紅梅色','kōbai-iro','#f2a0a1'],['東雲色','shinonome-iro','#f19072'],['茜色','akane-iro','#b7282e'],['臙脂色','enji-iro','#b94047'],['蘇芳','suō','#9e3d3f'],['朱色','shu-iro','#eb6101'],['柿色','kaki-iro','#ed6d3d'],['金茶','kincha','#f39800'],['山吹色','yamabuki-iro','#f8b500'],['黄金色','kogane-iro','#e6b422'],['丁子色','chōji-iro','#efcd9a'],['栗色','kuri-iro','#762f07'],['萌黄','moegi','#aacf53'],['若草色','wakakusa-iro','#c3d825'],['抹茶色','maccha-iro','#c5c56a'],['鶯色','uguisu-iro','#928c36'],['白緑','byakuroku','#d6e9ca'],['若竹色','wakatake-iro','#68be8d'],['青磁色','seiji-iro','#7ebea5'],['常磐色','tokiwa-iro','#007b43'],['千歳緑','chitose-midori','#316745'],['浅葱色','asagi-iro','#00a3af'],['露草色','tsuyukusa-iro','#38a1db'],['勿忘草色','wasurenagusa-iro','#89c3eb'],['瑠璃色','ruri-iro','#1e50a2'],['群青色','gunjō-iro','#4c6cb3'],['藍色','ai-iro','#165e83'],['紺色','kon-iro','#223a70'],['鉄紺','tetsukon','#17184b'],['藤色','fuji-iro','#bbbcde'],['菖蒲色','shōbu-iro','#cc7eb1'],['江戸紫','edo-murasaki','#745399'],['利休鼠','rikyū-nezumi','#888e7e'],['墨','sumi','#595857'],['生成り色','kinari-iro','#fbfaf5'],['象牙色','zōge-iro','#f8f4e6'],['胡粉色','gofun-iro','#fffffc']];
TABS.push({
  id:'wairo', label:'和色（日本の伝統色）', icon:'和',
  intro:'日本の伝統色の名前とカラーコード。和風サイトの配色や、AI画像生成・デザイン指示で<b>「臙脂色」「浅葱色」のように名前で雰囲気を伝える</b>のに使えます。カードをクリックするとHEXをコピーできます（値は代表的なものの一例です）。',
  sections:[
    { title:'赤・橙・黄・茶・緑・青・紫・無彩色', items: WA.map(w => ({ name:w[0], en:w[1] + '　' + w[2], h:110, stage:'free', search:w[2],
      demo:`<div class="wa" data-c="${w[2]}" style="cursor:pointer"><div class="c" style="background:${w[2]}"></div></div>`, init: bindCopy })) },
    { title:'和色を使った配色例', layout:'rows', items:[
      { name:'藍 × 生成り × 朱', en:'#165e83 / #fbfaf5 / #eb6101', desc:'藍染めと和紙に朱印。伝統的で引き締まった和の定番。', prompt:'藍色(#165e83)をメイン、生成り色(#fbfaf5)を背景、朱色(#eb6101)をアクセントにした和風の配色にして。' },
      { name:'桜色 × 若竹色 × 墨', en:'#fef4f4 / #68be8d / #595857', desc:'春らしくやわらかい。和菓子・花屋・春のキャンペーン。', prompt:'桜色の背景に若竹色のアクセント、文字は墨色(#595857)の春らしい配色にして。' },
      { name:'鉄紺 × 黄金色 × 象牙色', en:'#17184b / #e6b422 / #f8f4e6', desc:'夜空と月・金屏風のような格調高さ。旅館・日本酒・高級和食。', prompt:'鉄紺の背景に黄金色の細い罫線とロゴ、本文は象牙色の上品な和風ラグジュアリー配色にして。' },
      { name:'抹茶色 × 栗色 × 胡粉色', en:'#c5c56a / #762f07 / #fffffc', desc:'お茶と和菓子の落ち着いた色。カフェ・茶屋・和雑貨。' },
    ]},
  ]
});

/* ---------- グラデーション ---------- */
const GR = [['サンセット','linear-gradient(135deg, #ff7e5f, #feb47b)'],['オーシャン','linear-gradient(135deg, #2193b0, #6dd5ed)'],['コットンキャンディ','linear-gradient(135deg, #fbc2eb, #a6c1ee)'],['ピーチ','linear-gradient(135deg, #ffecd2, #fcb69f)'],['ノーザンライツ','linear-gradient(135deg, #43cea2, #185a9d)'],['グレープ','linear-gradient(135deg, #8e2de2, #4a00e0)'],['ファイア','linear-gradient(135deg, #f12711, #f5af19)'],['ネオン','linear-gradient(135deg, #00f260, #0575e6)'],['桜','linear-gradient(135deg, #ffdde1, #ee9ca7)'],['ミッドナイト','linear-gradient(135deg, #232526, #414345)'],['ロイヤル','linear-gradient(135deg, #141e30, #243b55)'],['スカイ','linear-gradient(135deg, #89f7fe, #66a6ff)'],['オーロラ','linear-gradient(135deg, #00c9ff, #92fe9d)'],['インスタ風','linear-gradient(45deg, #f58529, #dd2a7b, #8134af, #515bd4)'],['ゴールド（金属）','linear-gradient(135deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)'],['シルバー（金属）','linear-gradient(135deg, #8e9eab, #eef2f3 50%, #8e9eab)'],['レインボー','linear-gradient(90deg, #ff0018, #ffa52c, #ffff41, #008018, #0000f9, #86007d)'],['メッシュ（パステル）','radial-gradient(at 20% 20%, #ff9a9e 0, transparent 50%), radial-gradient(at 80% 20%, #a18cd1 0, transparent 50%), radial-gradient(at 50% 90%, #84fab0 0, transparent 55%), #fdfbfb'],['コニック（色相環）','conic-gradient(from 90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #ff6b6b)'],['放射（スポットライト）','radial-gradient(circle at 30% 30%, #fff6, transparent 40%), radial-gradient(circle, #6d4cff, #1a103d)']];
TABS.push({
  id:'gradient', label:'グラデーション集', icon:'▧',
  intro:'背景・ボタン・文字に使えるグラデーション。<b>同系色の2色</b>なら上品に、<b>色相が離れた多色</b>なら華やかになります。2色の間がくすむ場合は中間色を1つ足すと鮮やかさを保てます。',
  sections:[
    { title:'コピーして使えるグラデーション', items: GR.map(g => ({ name:g[0], h:110, stage:'free', demo:`<div class="grad" style="background:${g[1]}"></div>`, code:`background: ${g[1]};`, codeLabel:'CSS', search:g[1] })) },
    { title:'グラデーションのコツ', layout:'rows', items:[
      { name:'角度と方向', en:'135deg / to right', desc:'<code>135deg</code>（左上→右下）が最も自然に見えやすい。<code>to right</code> は左→右。', prompt:'ボタンの背景を135度の2色グラデーションにして、ホバーで角度が少し回転するようにして。' },
      { name:'くすみを防ぐ', en:'Avoid gray dead zone', desc:'補色同士（青→黄など）をそのままつなぐと中間が灰色っぽくなる。<b>中間色を足す</b>か、<code>in oklch</code> で補間すると鮮やかなまま。', code:'background: linear-gradient(in oklch 90deg, blue, yellow);' },
      { name:'グラデーション文字', en:'background-clip: text', desc:'見出しの一部に使うと印象的。Webデザイン辞典の「テキストエフェクト」も参照。', links:[['Webデザイン辞典：テキストエフェクト', 'web-design.html#text']] },
      { name:'生成ツール', en:'cssgradient.io / Mesh Gradient', desc:'cssgradient.io で線形・放射のグラデーションを作成、メッシュグラデーションは専用ジェネレーター（csshero mesh 等）が便利。', url:'https://cssgradient.io/' },
    ]},
  ]
});

/* ---------- フォント ---------- */
const JP = [
  ['Noto Sans JP','ゴシック','Googleの標準ゴシック。<b>迷ったらこれ</b>。太さが9段階あり、本文・見出しどちらにも使える。','400;700;900'],
  ['Noto Serif JP','明朝','標準的な明朝体。上品で読み物向き。','400;700'],
  ['Zen Kaku Gothic New','ゴシック','すっきり現代的なゴシック。Noto Sansより少し柔らかい印象。','400;700'],
  ['M PLUS 1p','ゴシック','モダンで幾何学的。テック・スタートアップ系に。','400;800'],
  ['IBM Plex Sans JP','ゴシック','IBMの書体。英字と相性が良く、知的でかっちり。','400;700'],
  ['Murecho','ゴシック','細身でスタイリッシュ。見出しにおしゃれ感。','400;700'],
  ['BIZ UDPGothic','UDゴシック','読み間違いにくいユニバーサルデザイン書体。行政・教育・高齢者向けに。','400;700'],
  ['Sawarabi Gothic','ゴシック','軽くて素朴なゴシック。','400'],
  ['M PLUS Rounded 1c','丸ゴシック','やわらかく親しみやすい丸ゴシック。アプリ・子ども向け・テロップに大人気。','400;800'],
  ['Zen Maru Gothic','丸ゴシック','上品で落ち着いた丸ゴシック。女性向け・暮らし系に。','500;700'],
  ['Kosugi Maru','丸ゴシック','クセのない丸ゴシック。','400'],
  ['Kiwi Maru','丸ゴシック','少し手書き感のある丸文字。やさしく温かい。','400'],
  ['Shippori Mincho','明朝','品のある本格的な明朝体。和モダン・高級感に最適。','400;700'],
  ['Zen Old Mincho','明朝','クラシックで格調高い明朝。','400;700'],
  ['BIZ UDPMincho','UD明朝','読みやすさ重視の明朝体。','400'],
  ['Sawarabi Mincho','明朝','素朴で軽い明朝。','400'],
  ['Hina Mincho','明朝','やわらかく繊細な明朝。','400'],
  ['Kaisei Decol','明朝（装飾）','優雅な装飾を持つ明朝。ブランドのロゴ・見出しに。','400;700'],
  ['Shippori Antique','アンティーク','古風で味わいのある書体。','400'],
  ['Klee One','手書き（教科書体）','鉛筆で書いたような教科書体。教育・ノート・Vlog。','400;600'],
  ['Yomogi','手書き','ゆるい手書き文字。日記・メモ風。','400'],
  ['Zen Kurenaido','手書き（筆ペン）','筆ペンのような手書き。','400'],
  ['Hachi Maru Pop','手書き（丸文字）','80年代の女子高生の丸文字。ポップでかわいい。','400'],
  ['Yusei Magic','手書き（マジック）','油性マジックで書いたような文字。手書きPOP・テロップに。','400'],
  ['Yuji Syuku','筆文字','毛筆の楷書風。和風・伝統・書道。','400'],
  ['Dela Gothic One','デザイン（極太）','極太で力強いゴシック。インパクトのある見出し・バナー・テロップ。','400'],
  ['Mochiy Pop One','デザイン（ポップ）','ぽってり丸いポップ体。キッズ・食べ物・ゲーム。','400'],
  ['Reggae One','デザイン','角ばった個性的な書体。ストリート・音楽。','400'],
  ['RocknRoll One','デザイン','角の丸いワイルドな書体。','400'],
  ['Rampart One','デザイン（立体）','立体的な縁取りが付いた書体。ポップなタイトルに。','400'],
  ['Train One','デザイン（二重線）','二重線の書体。レトロポップ。','400'],
  ['Potta One','デザイン（筆）','筆で描いたような太いポップ体。','400'],
  ['Stick','デザイン（直線）','直線だけでできた書体。レトロゲーム風。','400'],
  ['DotGothic16','ドット','ドット絵（ピクセル）の書体。<b>レトロゲーム</b>風UIに。','400'],
  ['Darumadrop One','デザイン（丸）','だるまのように丸くて太い。かわいいロゴに。','400'],
];
const EN = [
  ['Inter','サンセリフ','UI用に設計された定番。迷ったらこれ（Figmaやshadcn/uiでも多用）。','400;700'],['Roboto','サンセリフ','Androidの標準書体。癖がなく読みやすい。','400;700'],['Poppins','サンセリフ（幾何学）','丸みのある幾何学的な書体。スタートアップ・LPで人気。','400;700'],['Montserrat','サンセリフ（幾何学）','都会的で幅広。見出し向き。','400;800'],['DM Sans','サンセリフ','小さくても読みやすいモダンな書体。','400;700'],['Plus Jakarta Sans','サンセリフ','今風でSaaSに人気。','400;700'],['Manrope','サンセリフ','すっきりしたモダン。','400;700'],['Outfit','サンセリフ（幾何学）','丸く親しみやすい。','400;700'],['Space Grotesk','サンセリフ（個性）','少し癖のあるテック感。ネオブルータリズムにも。','400;700'],['Sora','サンセリフ','テック・暗号資産系で人気。','400;700'],['Unbounded','サンセリフ（ワイド）','横に広く大胆な見出し用。','400;800'],['Syne','サンセリフ（アート）','アート系の尖った見出し。','400;800'],['Bricolage Grotesque','サンセリフ（個性）','手作り感のあるグロテスク。','400;800'],['Nunito','サンセリフ（丸）','角が丸くやさしい。','400;800'],['Quicksand','サンセリフ（丸・細）','細く丸い。かわいい・やさしい。','400;700'],['Rubik','サンセリフ（丸）','少し丸い角。カジュアル。','400;700'],
  ['Playfair Display','セリフ（見出し）','コントラストの強い優雅なセリフ。雑誌・ラグジュアリー。','400;700'],['Lora','セリフ','読みやすいセリフ。ブログ本文に。','400;700'],['Merriweather','セリフ','画面で読みやすい本文用セリフ。','400;700'],['Cormorant Garamond','セリフ（細）','繊細で上品。高級感。','400;600'],['DM Serif Display','セリフ（見出し）','太くて存在感のある見出し用。','400'],['Abril Fatface','セリフ（極太）','ポスターのような極太。','400'],
  ['Bebas Neue','ディスプレイ（縦長）','縦長で力強い大文字だけの書体。スポーツ・見出し。','400'],['Oswald','ディスプレイ（縦長）','縦長で引き締まった見出し。','400;700'],['Anton','ディスプレイ（極太）','極太で縦長。インパクト重視。','400'],['Archivo Black','ディスプレイ','太くどっしり。','400'],['Righteous','ディスプレイ（レトロ）','70年代風の丸いレトロ。','400'],['Orbitron','ディスプレイ（SF）','近未来・SF・ゲーム。','400;800'],
  ['Pacifico','スクリプト','ゆるい筆記体。サーフ・カフェ。','400'],['Caveat','手書き','ペンで書いたような手書き。','400;700'],['Dancing Script','スクリプト','エレガントな筆記体。ウェディング。','400;700'],['Lobster','スクリプト（太）','太い筆記体。レトロな看板風。','400'],
  ['Press Start 2P','ピクセル','8ビットゲーム風のドット書体。','400'],['VT323','ピクセル（端末）','古い端末画面風。','400'],['JetBrains Mono','等幅','プログラミング用の読みやすい等幅。','400;700'],['Fira Code','等幅（合字）','=> や != が1文字に見える合字付き等幅。','400;700'],['Space Mono','等幅（個性）','レトロで個性的な等幅。','400;700'],
];
let fontsLoaded = false;
function loadFonts(){
  if (fontsLoaded) return; fontsLoaded = true;
  const fam = (arr) => arr.map(f => 'family=' + f[0].replace(/ /g, '+') + ':wght@' + f[3]).join('&');
  [JP.slice(0, 18), JP.slice(18), EN.slice(0, 20), EN.slice(20)].forEach(chunk => {
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?' + fam(chunk) + '&display=swap'; document.head.append(l);
  });
}
const DEF_JP = '吾輩は猫である。名前はまだ無い。', DEF_EN = 'The quick brown fox jumps over the lazy dog. 0123';
function fontItem(f, jp){
  const fam = `'${f[0]}'`;
  return { name:f[0], en:f[1], h:130, stage:'free', search:f[1] + ' ' + f[2], tags:[f[1]],
    demo:`<div class="ff"><div class="big ffs ${jp ? 'jp' : 'en'}" style="font-family:${fam}, sans-serif">${jp ? DEF_JP : DEF_EN}</div>${jp ? `<div class="sm" style="font-family:${fam}, sans-serif">あいうえお アイウエオ 漢字 ABC abc 123</div>` : ''}</div>`,
    desc:f[2], prompt:`見出しのフォントをGoogle Fontsの「${f[0]}」にして。本文は読みやすさを優先して${jp ? 'Noto Sans JP' : 'Inter'}のままで。`,
    code:`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${f[0].replace(/ /g, '+')}:wght@${f[3]}&display=swap">\n\nh1 { font-family: "${f[0]}", ${/明朝|セリフ|Mincho/.test(f[1]) ? 'serif' : 'sans-serif'}; }`, codeLabel:'読み込み方' };
}
function fontControl(el, jp){
  loadFonts();
  el.innerHTML = `<div class="ff-ctl"><input type="text" value="${jp ? DEF_JP : DEF_EN}" aria-label="見本の文字"><label>サイズ <input type="range" min="16" max="56" value="30"></label></div>`;
  const t = $(el, 'input[type=text]'), s = $(el, 'input[type=range]'), panel = el.closest('.panel');
  t.oninput = () => $$(panel, '.ffs').forEach(x => x.textContent = t.value || (jp ? DEF_JP : DEF_EN));
  s.oninput = () => $$(panel, '.ffs').forEach(x => x.style.fontSize = s.value + 'px');
}
TABS.push({
  id:'jpfont', label:'日本語フォント', icon:'あ',
  intro:'Google Fontsで<b>無料・商用利用可</b>の日本語フォント。上の入力欄に好きな文字を入れると、全フォントの見本が書き換わります。日本語フォントはデータが大きいので、<b>1サイトで使うのは2〜3書体まで</b>が目安です。',
  sections:[
    { title:'見本の文字を変える', custom:(el) => fontControl(el, true) },
    { title:'ゴシック・UD', items: JP.slice(0, 8).map(f => fontItem(f, true)) },
    { title:'丸ゴシック', items: JP.slice(8, 12).map(f => fontItem(f, true)) },
    { title:'明朝・アンティーク', items: JP.slice(12, 19).map(f => fontItem(f, true)) },
    { title:'手書き・筆', items: JP.slice(19, 25).map(f => fontItem(f, true)) },
    { title:'デザイン・ディスプレイ', items: JP.slice(25).map(f => fontItem(f, true)) },
  ]
});
TABS.push({
  id:'enfont', label:'欧文フォント', icon:'Aa',
  intro:'英数字用のGoogle Fonts。日本語フォントと組み合わせるときは、<code>font-family: "Inter", "Noto Sans JP", sans-serif;</code> のように<b>欧文フォントを先に</b>書くと、英数字だけが欧文フォントになります。',
  sections:[
    { title:'見本の文字を変える', custom:(el) => fontControl(el, false) },
    { title:'サンセリフ（ゴシック系）', items: EN.slice(0, 16).map(f => fontItem(f, false)) },
    { title:'セリフ（明朝系）', items: EN.slice(16, 22).map(f => fontItem(f, false)) },
    { title:'ディスプレイ・スクリプト', items: EN.slice(22, 32).map(f => fontItem(f, false)) },
    { title:'ピクセル・等幅', items: EN.slice(32).map(f => fontItem(f, false)) },
    { title:'おすすめの組み合わせ', layout:'rows', items:[
      { name:'Inter ＋ Noto Sans JP', en:'王道・SaaS・アプリ', desc:'最も無難で読みやすい。迷ったらこれ。', code:'font-family: "Inter", "Noto Sans JP", sans-serif;' },
      { name:'Poppins ＋ M PLUS Rounded 1c', en:'親しみ・ポップ', desc:'丸みのある組み合わせ。かわいい・やさしい印象のサービスに。', code:'font-family: "Poppins", "M PLUS Rounded 1c", sans-serif;' },
      { name:'Playfair Display ＋ Shippori Mincho', en:'上品・ラグジュアリー', desc:'見出しをセリフと明朝で揃え、本文はゴシックにすると読みやすい。', code:'h1, h2 { font-family: "Playfair Display", "Shippori Mincho", serif; }\nbody { font-family: "Inter", "Noto Sans JP", sans-serif; }' },
      { name:'Space Grotesk ＋ Zen Kaku Gothic New', en:'テック・個性', desc:'少し癖のある欧文で、モダンなテック感。', code:'font-family: "Space Grotesk", "Zen Kaku Gothic New", sans-serif;' },
      { name:'JetBrains Mono ＋ Noto Sans JP', en:'開発者向け', desc:'コードや数字を等幅で揃えたいダッシュボードやドキュメントに。', code:'code, .num { font-family: "JetBrains Mono", "Noto Sans JP", monospace; }' },
    ]},
  ]
});

/* ---------- タイポグラフィ用語 ---------- */
TABS.push({
  id:'typo', label:'文字組みの用語', icon:'¶',
  intro:'文字の大きさ・太さ・行間・字間の調整（タイポグラフィ）。<b>読みやすさの9割は行間と文字サイズで決まる</b>と言われます。',
  sections:[
    { title:'サイズ・太さ・間隔', items:[
      { name:'タイプスケール（文字サイズの段階）', en:'Type Scale', h:200, stage:'free', demo:'<div class="ty">' + [[48, 'H1'], [38, 'H2'], [30, 'H3'], [24, 'H4'], [19, 'Large'], [15, 'Body'], [12, 'Small']].map(s => `<div class="row"><small>${s[1]} ${s[0]}px</small><span style="font-size:${s[0] * .62}px;font-weight:${s[0] > 20 ? 800 : 400}">見出しと本文</span></div>`).join('') + '</div>', tags:['設計'],
        desc:'文字サイズを<b>一定の比率（1.25倍など）で段階的に</b>決める。バラバラなサイズを使わないことで統一感が出る。', prompt:'文字サイズを1.25倍のタイプスケール（12/15/19/24/30/38/48px）でCSS変数として定義して、見出しと本文に割り当てて。' },
      { name:'ウェイト（太さ）', en:'Font Weight 100–900', h:200, stage:'free', demo:'<div class="ty" style="font-family:\'Noto Sans JP\'">' + [100, 300, 400, 500, 700, 900].map(w => `<div class="row"><small>${w}</small><span style="font-weight:${w};font-size:20px">文字の太さ Weight</span></div>`).join('') + '</div>', tags:['強弱'],
        desc:'100（Thin）〜900（Black）。本文は400（Regular）、強調は700（Bold）が基本。<b>使う太さは2〜3種類</b>に絞ると締まる。フォントに無い太さは擬似的に太らされて汚くなる。', prompt:'太さは400（本文）・700（見出し・強調）・900（ヒーローの大見出し）の3種類だけを使って。' },
      { name:'行間（行の高さ）', en:'Line Height', h:180, stage:'free', demo:'<div class="ty"><div class="ty-lh">' + [1.2, 1.7, 2.2].map(l => `<p style="line-height:${l}"><small>line-height: ${l}</small>行間が狭すぎると読みにくく、広すぎると行のつながりが分かりにくくなります。</p>`).join('') + '</div></div>', tags:['読みやすさ最重要'],
        desc:'日本語の本文は<b>1.7〜2.0</b>が読みやすい（英語は1.5前後）。見出しは1.2〜1.4と詰める。', prompt:'本文の行間を1.8、見出しの行間を1.3にして、段落の間に1.2emの余白を入れて。', code:'body { line-height: 1.8; }\nh1, h2 { line-height: 1.3; }' },
      { name:'字間（文字の間隔）', en:'Letter Spacing / Tracking', h:170, stage:'free', demo:'<div class="ty">' + [['-0.02em', '詰める（大見出し）'], ['0', '標準'], ['0.08em', '少し広げる（本文・和文）'], ['0.3em', '広げる（ロゴ・ラベル）']].map(s => `<div class="row"><small>${s[0]}</small><span style="letter-spacing:${s[0]};font-size:16px">${s[1]} DESIGN</span></div>`).join('') + '</div>', tags:['上品さ'],
        desc:'大きな見出しは少し詰め、小さな英字ラベルやロゴは広げると洗練される。和文の本文は <code>0.04〜0.08em</code> 程度広げると読みやすいことが多い。', code:'h1 { letter-spacing: -0.02em; }\n.label { letter-spacing: .2em; text-transform: uppercase; }' },
      { name:'プロポーショナル字詰め（palt）', en:'font-feature-settings: "palt"', h:160, stage:'free', demo:'<div class="ty"><div class="ty-cmp" style="font-family:\'Noto Sans JP\';font-size:17px;font-weight:700"><div><small>通常（全角の幅のまま）</small>「アップデート」のお知らせ。</div><div style="font-feature-settings:\'palt\'"><small>palt（詰め組み）</small>「アップデート」のお知らせ。</div></div></div>', tags:['日本語特有','見出しに'],
        desc:'日本語は1文字ずつ同じ幅で並ぶため、カタカナや括弧の周りが空いて見える。<code>palt</code> を指定すると<b>文字ごとの幅で詰めて</b>、見出しが引き締まる（本文には使わない方が読みやすい）。', prompt:'見出しにだけ font-feature-settings: "palt" を指定して、カタカナや括弧の周りの余分な空きを詰めて。', code:'h1, h2 { font-feature-settings: "palt"; letter-spacing: .02em; }' },
      { name:'ジャンプ率', en:'Jump Ratio (heading vs body size)', h:170, stage:'free', demo:'<div class="ty"><div class="ty-cmp"><div><small>ジャンプ率 低（上品・落ち着き）</small><b style="font-size:17px">見出しテキスト</b><div style="font-size:12px">本文テキストが続きます。</div></div><div><small>ジャンプ率 高（元気・インパクト）</small><b style="font-size:30px;line-height:1.1">見出し</b><div style="font-size:11px">本文テキストが続きます。</div></div></div></div>', tags:['印象'],
        desc:'本文に対する見出しの大きさの比率。<b>高い＝元気・インパクト（LP・広告）</b>、<b>低い＝上品・落ち着き（高級ブランド・文学）</b>。', prompt:'ヒーローの見出しを本文の4倍くらいの大きさにして、ジャンプ率を高くしてインパクトを出して。' },
    ]},
    { title:'用語集', layout:'rows', items:[
      { name:'セリフ／サンセリフ', en:'Serif / Sans-serif', desc:'セリフ＝文字の端に飾り（うろこ）がある書体（欧文のTimes、和文の明朝体に相当）。サンセリフ＝飾りがない書体（Arial、和文のゴシック体に相当）。画面では<b>サンセリフ・ゴシックが読みやすい</b>。' },
      { name:'等幅フォント', en:'Monospace', desc:'すべての文字が同じ幅。コード、数字の表、ターミナルに。' },
      { name:'可変フォント', en:'Variable Font', desc:'1つのファイルで太さ（100〜900）などを連続的に変えられるフォント。読み込みが軽く、太さのアニメーションもできる。Noto Sans JP、Inter などが対応。' },
      { name:'行長（1行の文字数）', en:'Measure / Line Length', desc:'日本語は<b>1行35〜45文字</b>程度が読みやすい。横幅いっぱいに文字を流すと目が疲れるので、本文の最大幅を決める（例：<code>max-width: 40em</code>）。' },
      { name:'禁則処理', en:'Line Breaking Rules', desc:'行頭に「。」「、」「）」が来ないようにするなどの日本語の改行ルール。ブラウザは基本対応している。<code>line-break: strict</code> でより厳格に。' },
      { name:'約物（やくもの）', en:'Punctuation', desc:'「」（）、。・！？などの記号。全角の約物は前後の空きが大きいので、見出しでは palt で詰めると美しい。' },
      { name:'カーニング', en:'Kerning', desc:'特定の文字の組み合わせ（AV、To など）の間隔を調整すること。<code>font-kerning: normal</code>。' },
      { name:'font-display: swap', en:'Webフォントの読み込み', desc:'Webフォントの読み込み中は代わりのフォントで表示し、読み込めたら入れ替える指定。文字が見えない時間をなくす。Google Fontsのリンクの <code>&display=swap</code> がこれ。' },
      { name:'フォールバック', en:'Font Stack', desc:'指定フォントが無い場合の代替を並べる。<code>"Noto Sans JP", "Hiragino Sans", "Yu Gothic UI", Meiryo, sans-serif</code> のようにOS標準フォントを後ろに書いておく。' },
      { name:'ルビ・縦書き', en:'ruby / writing-mode', desc:'ふりがなは <code>&lt;ruby&gt;</code>、縦書きは <code>writing-mode: vertical-rl</code>。（Webデザイン辞典の「日本語ならではの組版」参照）', links:[['Webデザイン辞典へ', 'web-design.html#text']] },
    ]},
  ]
});

/* ---------- デザイントークン ---------- */
TABS.push({
  id:'tokens', label:'余白・角丸・トークン', icon:'▢',
  intro:'色・余白・角丸・影などの値に名前を付けて管理するのが<b>デザイントークン</b>。最初に決めておくと、AIに作らせる画面の統一感が劇的に上がります。',
  sections:[
    { title:'スケールの見本', items:[
      { name:'余白のスケール（8pxグリッド）', en:'Spacing Scale / 8pt Grid', h:200, stage:'free', demo:'<div class="tk">' + [4, 8, 12, 16, 24, 32, 48, 64].map(s => `<div class="r"><span style="width:44px">${s}px</span><i style="width:${s * 2.4}px"></i></div>`).join('') + '</div>', tags:['統一感'],
        desc:'余白を<b>4や8の倍数</b>だけで決める。バラバラな値（13px、22px）を使わないことで整って見える。Tailwindの <code>p-4</code>（16px）なども4px単位。', prompt:'余白は4pxの倍数（4/8/12/16/24/32/48/64）だけを使うようにCSS変数で定義して、全体の余白をそれに揃えて。' },
      { name:'角丸のスケール', en:'Border Radius Scale', h:160, stage:'free', demo:'<div class="tk"><div class="tk-rad">' + [0, 4, 8, 12, 16, 24, 999].map(r => `<div><span style="border-radius:${r === 999 ? 23 : r}px"></span>${r === 999 ? 'full' : r}</div>`).join('') + '</div></div>', tags:['印象'],
        desc:'角丸が<b>小さいほど堅実・ビジネス的、大きいほど親しみ・やさしさ</b>。ボタン・カード・入力欄で値を揃える。中の要素の角丸は外側より小さくする（外側 − 余白）。', prompt:'角丸を sm=6px / md=10px / lg=16px / full=999px のトークンにして、ボタンはfull、カードはlg、入力欄はmdに統一して。' },
      { name:'ダークモードの配色', en:'Dark Mode Colors', h:170, demo:'<div class="tk-dark"><div style="background:#ffffff;color:#111;border:1px solid #e5e7eb"><b>ライト</b><div class="card" style="background:#f4f4f5">面 #f4f4f5</div><span style="color:#2563eb">リンク #2563eb</span></div><div style="background:#0f0f12;color:#ececf0"><b>ダーク</b><div class="card" style="background:#1c1c21">面 #1c1c21</div><span style="color:#60a5fa">リンク #60a5fa</span></div></div>', tags:['単純反転はNG'],
        desc:'ダークモードは<b>白黒を反転するだけでは不十分</b>。真っ黒（#000）より少し明るい黒、純白より少し暗い文字、鮮やかな色は明るめに調整する。影の代わりに面の明るさで階層を表す。', prompt:'ダークモードの配色を作って。背景#0f0f12、カードは少し明るい#1c1c21、文字は#ececf0、アクセントカラーはライトより明るい色味に調整して。' },
    ]},
    { title:'デザイントークンの考え方', layout:'rows', items:[
      { name:'デザイントークン', en:'Design Tokens', desc:'「--color-primary」「--space-4」「--radius-lg」のように、デザインの値に<b>意味のある名前</b>を付けたもの。値を変えると全体に反映される。', prompt:'まず色・文字サイズ・余白・角丸・影のデザイントークンをCSS変数で定義してから、コンポーネントはすべてトークンを参照して作って。', code:':root {\n  --color-primary: #e2562b;  --color-text: #1a1a1e;  --color-bg: #ffffff;\n  --space-1: 4px; --space-2: 8px; --space-4: 16px; --space-6: 24px;\n  --radius-md: 10px; --radius-lg: 16px;\n  --shadow-md: 0 4px 12px rgb(0 0 0 / .1);\n  --font-sans: "Inter", "Noto Sans JP", sans-serif;\n}' },
      { name:'意味で名前を付ける', en:'Semantic Naming', desc:'「--blue-500」より「--color-primary」「--color-danger」のように<b>役割で名前を付ける</b>と、後からブランドカラーを変えたりダークモードにしたりしやすい。' },
      { name:'デザインシステム', en:'Design System', desc:'トークン・コンポーネント・使い方のルールをまとめたもの。有名な例：Material Design（Google）、Human Interface Guidelines（Apple）、Fluent（Microsoft）、Primer（GitHub）、SmartHR Design System（日本）。', links:[['Material Design 3', 'https://m3.material.io/'], ['Apple HIG', 'https://developer.apple.com/design/human-interface-guidelines/']] },
      { name:'Tailwindの設定にまとめる', en:'Tailwind theme', desc:'Tailwind CSS v4 では CSS の <code>@theme</code> にトークンを書くと、<code>bg-primary</code> などのクラスとして使える。', code:'@import "tailwindcss";\n@theme {\n  --color-primary: #e2562b;\n  --font-sans: "Inter", "Noto Sans JP", sans-serif;\n  --radius-card: 16px;\n}' },
    ]},
  ]
});
})();
