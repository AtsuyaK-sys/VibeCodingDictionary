/* 画像・イラスト表現辞典 — A: 共通ヘルパー（旧PDFの語彙データを表に変換） / 基本と組み立て方 / 人物 / 背景 / 光と色 / カメラと構図 */
(function(){
const { $, $$, esc, seg } = KIT;
const C = (title, items, note, lg) => ({ title, note, layout:lg ? 'cards lg' : 'cards', items });
const S = (title, items, note) => ({ title, note, layout:'rows', items });
const T = (name, en, desc, prompt, tags, more) => Object.assign({ name, en, desc, prompt, tags }, more || {});
const verdict = (el, cls, html) => { el.classList.remove('ok', 'bad', 'warn'); if (cls) el.classList.add(cls); el.innerHTML = html; };
const V = window.IGV || [];

/* ---- 変換のときに崩れた所を直す（元のPDFの文に合わせる） ---- */
(function patch(){
  const fix = { '・文字は引用符で囲む：看板・タイトルなど画像内の文字はで囲む（第八段階）。':'・文字は引用符で囲む：看板・タイトルなど画像内の文字は "..." で囲む（第八段階）。', '・描きたい文字は必ず引用符で囲む。例：。onawoodensignboardatthetopofthe':'・描きたい文字は必ず引用符 "..." で囲む。例：a neon sign that reads "OPEN 24H"。', '・「何に」「どこに」書かれているかを明示する：posterprinted on the T-shirt。':'・「何に」「どこに」書かれているかを明示する：on a wooden signboard、at the top of the poster、printed on the T-shirt。' };
  const NEG = { t:{ h:['否定形', '肯定形の言い換え', '解説'], r:[['no people', 'an empty street, deserted, no one around', '人がいない → 誰もいない通り。empty・deserted のように状態で書く。'], ['no blur', 'sharp focus, everything in focus', 'ぼかさない → 全面にピント。被写界深度の語で指定。'], ['not smiling', 'serious expression', '笑っていない → 真剣な表情。感情を肯定形で。'], ['no text', 'clean image without any lettering', '文字なし → 文字のない画像。それでも文字が出る場合は看板などの要素自体を減らす。'], ['not cartoonish', 'photorealistic, real photograph', '漫画っぽくない → 写実的な写真。画風を冒頭で宣言。'], ['no makeup', 'bare-faced, natural skin', 'ノーメイク → すっぴん、自然な肌。状態を描写。'], ['not crowded', 'minimal, lots of empty space', 'ごちゃごちゃしない → ミニマルで余白が多い。構図の語で指定。']] } };
  const walk = (items, si) => { const out = []; let negDone = false;
    items.forEach(it => { if (it.p){ const s = it.p.replace(/"\.\.\."$/, ''); if (s === '"..."a neon sign that reads "OPEN 24H"') return;
        if (si === 10 && /→/.test(s)){ if (!negDone){ out.push(NEG); negDone = true; } return; }
        const last = out[out.length - 1]; if (last && last.n && s.length < 60 && /^[ぁ-ん]/.test(s)){ last.x += s; return; }
        out.push({ p:fix[s] || s }); return; }
      out.push(it); });
    return out; };
  V.forEach((st, si) => { st.items = walk(st.items, si); st.ch.forEach(ch => { ch.items = walk(ch.items, si); ch.sec.forEach(s => { s.items = walk(s.items, si); }); }); });
})();

/* ---- 表・文章のHTML ---- */
// 説明文の中の英語のまとまりを <code> にする
function codeify(raw){ let out = '', last = 0; const re = /[A-Za-z][A-Za-z0-9'’\-]*(?:[ ,./:]+[A-Za-z0-9'’\-]+)*/g; let m;
  while ((m = re.exec(raw))){ out += esc(raw.slice(last, m.index)); const w = m[0]; out += /[a-z]/.test(w) && w.length > 1 ? `<code>${esc(w)}</code>` : esc(w); last = m.index + w.length; }
  return out + esc(raw.slice(last)); }
const enCell = (s) => `<span class="ig-en" data-c="${esc(s)}" title="クリックでコピー">${esc(s)}</span>`;
function tableOf(t){
  const h = t.h;
  if (h[0] === '英語プロンプト') return { head:['英語（クリックでコピー）', '日本語', '効果・使い方'], rows:t.r.map(([en, ja, ef]) => [enCell(en), esc(ja), codeify(ef)]) };
  if (h[0] === '否定形') return { head:h, rows:t.r.map(([a, b, c]) => [`<code>${esc(a)}</code>`, enCell(b), esc(c)]) };
  return { head:h, rows:t.r.map(r => r.map(codeify)) };
}
function blockHtml(it){
  if (it.p) return `<p class="ig-p">${codeify(it.p)}</p>`;
  if (it.n) return `<div class="note ${it.n === '注意' ? 'caution' : 'point'}"><b>${esc(it.n)}</b>${codeify(it.x)}</div>`;
  if (it.e) return `<div class="ig-ex"><div class="hd"><span>プロンプト例</span><button type="button" class="kt-btn sm" data-copy="${esc(it.e)}">コピー</button></div><pre>${esc(it.e)}</pre>${it.c ? `<p>${esc(it.c)}</p>` : ''}</div>`;
  return '';
}
function emit(out, title, items){
  let cur = { title }, paras = [], html = '';
  const closeCur = () => { if (cur){ if (paras.length) cur.note = paras.join('<br>'); out.push(cur); cur = null; paras = []; } };
  const flush = () => { if (html){ out.push({ html }); html = ''; } };
  items.forEach(it => {
    if (it.t){ if (cur && !cur.table && !html) cur.table = tableOf(it.t); else { closeCur(); flush(); cur = { table:tableOf(it.t) }; } }
    else if (it.p && cur && !cur.table && !html) paras.push(codeify(it.p));
    else html += blockHtml(it);
  });
  closeCur(); flush();
}
// 段階（PDFの章立て）をそのままタブの中身にする
function stageSections(si){ const st = V[si], out = []; if (!st) return out;
  st.ch.forEach(ch => { emit(out, ch.title, ch.items); ch.sec.forEach(s => emit(out, s.title, s.items)); });
  return out; }
const stageIntro = (si) => V[si] ? V[si].items.filter(i => i.p).map(i => codeify(i.p)).join('') : '';
// 語彙表から、英語に key を含む行を探す
const ROWS = V.map(st => { const r = []; const add = (items) => items.forEach(i => { if (i.t && i.t.h[0] === '英語プロンプト') r.push(...i.t.r); }); add(st.items); st.ch.forEach(c => { add(c.items); c.sec.forEach(s => add(s.items)); }); return r; });
const look = (si, key) => (ROWS[si] || []).find(r => r[0].toLowerCase().includes(key.toLowerCase()));
const lookHtml = (si, key) => { const r = look(si, key); return r ? `<code>${esc(r[0])}</code>（${esc(r[1])}）：${codeify(r[2])}` : `<code>${esc(key)}</code>`; };
const chapterRows = (si, ci, k = 0) => { const ch = V[si] && V[si].ch[ci]; if (!ch) return []; const items = [...ch.items, ...ch.sec.flatMap(s => s.items)].filter(i => i.t && i.t.h[0] === '英語プロンプト'); return items[k] ? items[k].t.r : []; };
const first = (en) => en.split(' / ')[0].replace(/\s*\(.*?\)\s*/g, ' ').trim();
// クリックでコピー（表の英語・単語のチップ・ボタン）
document.addEventListener('click', (e) => { const t = e.target.closest && e.target.closest('.ig-en, .ig-words span, [data-copy]'); if (!t) return; VD.copyText(t.dataset.c || t.dataset.copy || t.textContent); });
const stageTab = (o) => TABS.push({ id:o.id, label:o.label, icon:o.icon, intro:o.intro + (stageIntro(o.si) ? `<br><span style="color:var(--muted)">${stageIntro(o.si)}</span>` : ''), sections:[...(o.demos && o.demos.length ? [C('触って理解する', o.demos, null, true)] : []), ...stageSections(o.si), ...(o.extra || [])] });
window.IGH = { C, S, T, verdict, codeify, enCell, look, lookHtml, chapterRows, first, stageTab, V };

/* ---- 絵の部品（SVG） ---- */
// 人物と景色。viewBox を変えるとショットサイズになる（座標は 1000×700 が基準）
const SCENE = (sky1 = '#7dd3fc', sky2 = '#fef3c7') => `<defs><linearGradient id="igsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky1}"/><stop offset="1" stop-color="${sky2}"/></linearGradient></defs>
  <rect x="-6000" y="-4000" width="13000" height="4560" fill="url(#igsky)"/><rect x="-6000" y="560" width="13000" height="5000" fill="#65a30d"/>
  ${[-3000, -1800, -600, 600, 1800, 3000].map((x, i) => `<path d="M${x - 700},560 L${x},${200 - i % 2 * 80} L${x + 700},560Z" fill="${i % 2 ? '#64748b' : '#94a3b8'}"/>`).join('')}
  <circle cx="820" cy="140" r="46" fill="#fde047"/>
  ${[-2400, -1500, 150, 1600, 2600].map(x => `<g><rect x="${x - 10}" y="470" width="20" height="90" fill="#78350f"/><circle cx="${x}" cy="440" r="60" fill="#166534"/></g>`).join('')}
  <g id="igman"><rect x="455" y="400" width="34" height="200" rx="14" fill="#1e3a8a"/><rect x="511" y="400" width="34" height="200" rx="14" fill="#1e3a8a"/><rect x="448" y="594" width="44" height="18" rx="8" fill="#111827"/><rect x="508" y="594" width="44" height="18" rx="8" fill="#111827"/>
  <rect x="440" y="232" width="120" height="190" rx="34" fill="#dc2626"/><rect x="412" y="246" width="30" height="150" rx="14" fill="#b91c1c"/><rect x="558" y="246" width="30" height="150" rx="14" fill="#b91c1c"/><circle cx="427" cy="404" r="14" fill="#e0a98a"/><circle cx="573" cy="404" r="14" fill="#e0a98a"/>
  <rect x="487" y="206" width="26" height="34" fill="#e0a98a"/><circle cx="500" cy="180" r="40" fill="#f1c4a5"/><path d="M460,178 a40,40 0 0 1 80,0 q-14,-14 -40,-12 q-26,-2 -40,12Z" fill="#1f2937"/>
  <circle cx="486" cy="182" r="4.5" fill="#1f2937"/><circle cx="514" cy="182" r="4.5" fill="#1f2937"/><circle cx="486" cy="180.5" r="1.4" fill="#fff"/><circle cx="514" cy="180.5" r="1.4" fill="#fff"/><path d="M490,200 q10,7 20,0" stroke="#9a3412" stroke-width="2.5" fill="none" stroke-linecap="round"/></g>`;
window.IGH.SCENE = SCENE;

/* ================= 0. 基本と組み立て方 ================= */
const SLOTS = [
  ['① 画像の種類', [['A cinematic photograph of', '映画のような写真'], ['A candid street photo of', '街角のスナップ写真'], ['An anime-style illustration of', 'アニメ風イラスト'], ['A watercolor painting of', '水彩画'], ['A 3D render of', '3DCG']]],
  ['② 主役', [['a young woman', '若い女性'], ['an elderly man', '高齢の男性'], ['a little girl', '小さな女の子'], ['a calico cat', '三毛猫'], ['a steaming cup of coffee', '湯気の立つコーヒー']]],
  ['③ 外見', [['with shoulder-length wavy chestnut hair', '肩までの栗色のウェーブヘア'], ['with a silver undercut and freckles', '銀髪のツーブロックとそばかす'], ['with long black hair tied in a ponytail', '黒髪のポニーテール'], ['', '（なし）']]],
  ['④ 服装', [['wearing a cream cable-knit sweater', 'クリーム色のケーブルニット'], ['wearing a black techwear jacket', '黒のテックウェア'], ['wearing a navy school blazer', '紺のブレザー'], ['', '（なし）']]],
  ['⑤ ポーズ・表情', [['sitting by the window, smiling softly', '窓辺に座り、やわらかく微笑む'], ['walking toward the camera, laughing', 'こちらへ歩きながら笑う'], ['looking over her shoulder with a calm expression', '振り返る、落ち着いた表情'], ['', '（なし）']]],
  ['⑥ 背景・場所', [['in a cozy cafe with wooden tables', '木のテーブルのある居心地の良いカフェ'], ['on a rain-soaked neon-lit street at night', '雨にぬれた夜のネオン街'], ['in a sunflower field', 'ひまわり畑'], ['in a quiet Japanese shrine', '静かな神社']]],
  ['⑦ 光・時間帯', [['Warm golden hour sunlight from the left.', '左からの暖かいゴールデンアワーの光'], ['Soft diffused window light.', 'やわらかい窓の光'], ['Neon rim light in pink and blue.', 'ピンクと青のネオンのリムライト'], ['Rembrandt lighting.', 'レンブラント・ライティング']]],
  ['⑧ カメラ・構図', [['Close-up, 85mm lens, shallow depth of field.', 'クローズアップ・85mm・背景ぼけ'], ['Medium shot, eye-level, rule of thirds.', 'ミディアムショット・目線の高さ・三分割'], ['Wide shot, 24mm, low angle.', '引きの画・24mm・あおり'], ['Overhead flat lay.', '真上からの平置き']]],
  ['⑨ 色調・雰囲気', [['Warm, nostalgic mood with muted pastel tones.', '懐かしく暖かい、くすんだパステル'], ['Moody cinematic teal and orange color grading.', '映画風のティール＆オレンジ'], ['Bright, airy, clean.', '明るく軽やか'], ['Dreamy, ethereal atmosphere with soft glow.', '夢のような柔らかい光']]],
  ['⑩ 品質', [['Highly detailed, sharp focus.', '精細・シャープ'], ['Realistic skin texture, natural imperfections.', 'リアルな肌の質感'], ['', '（なし）']]],
];
const RATIOS = [['1:1', 2048, 2048, 'SNSアイコン・商品・ポートレートの基本'], ['4:3', 2400, 1792, '一般的な写真の比率'], ['3:4', 1792, 2400, '縦長の写真'], ['3:2', 2528, 1696, '一眼レフの比率'], ['2:3', 1696, 2528, '全身のポートレートが収まりやすい'], ['16:9', 2752, 1536, '風景・映画風'], ['9:16', 1536, 2752, 'スマホ壁紙・縦動画のサムネ']];

stageTab({ id:'start', label:'基本と組み立て方', icon:'🧭', si:0,
  intro:'画像生成AIへの指示（プロンプト）は、<b>英語の文章で、大事なものから順に</b>書くのが基本です。この辞典は、以前PDFで作った「Qwen-Image-2.1 画像生成プロンプト完全語彙辞典」（約1,400語）をそのまま収録し、組み立て機や光・カメラの見本などの<b>触って分かるデモ</b>を加えたものです。語彙表の英語は<b>クリックでコピー</b>できます。',
  demos:[
    { name:'プロンプトの組み立て機', en:'Prompt builder', h:600, tags:['体験','定番','最重要'], wide:true,
      demo:'<div class="kt"><div class="ig-two"><div class="ig-sel sl"></div><div><span class="kt-lbl">できあがった英文</span><div class="ig-out en" style="flex:1"></div><span class="kt-lbl">日本語の意味</span><div class="kt-note ja"></div><div class="kt-row"><button type="button" class="kt-btn pri cp">英文をコピー</button><button type="button" class="kt-btn sm rnd">おまかせ</button></div></div></div></div>',
      init:(el) => { $(el, '.sl').innerHTML = SLOTS.map(([l, opts], i) => `<b>${l}</b><select data-i="${i}" aria-label="${l}">${opts.map(([en, ja], k) => `<option value="${k}">${esc(ja)}</option>`).join('')}</select>`).join('');
        const run = () => { const pick = $$(el, '.sl select').map(s => SLOTS[+s.dataset.i][1][+s.value]); const [ty, su, lo, cl, po, bg, li, ca, mo, qu] = pick.map(p => p[0]);
          const sent1 = [ty, su, lo, cl && (lo ? ', ' : ' ') + cl].filter(Boolean).join(' ').replace(/ ,/g, ','), sent = `${sent1}${po ? ', ' + po : ''} ${bg}.`;
          const text = [sent, li, ca, mo, qu].filter(Boolean).join(' ').replace(/\s+/g, ' ');
          $(el, '.en').innerHTML = esc(text).replace(/(A [^,]*? of|An [^,]*? of)/, '<b>$1</b>'); $(el, '.ja').textContent = pick.map(p => p[1]).filter(x => x !== '（なし）').join(' ／ '); el._t = text; };
        $$(el, '.sl select').forEach(s => s.onchange = run); $(el, '.cp').onclick = () => VD.copyText(el._t);
        $(el, '.rnd').onclick = () => { $$(el, '.sl select').forEach(s => { s.value = Math.floor(Math.random() * s.options.length); }); run(); }; run(); },
      desc:'プロンプトは「<b>①種類 → ②主役 → ③外見 → ④服装 → ⑤ポーズ・表情 → ⑥背景 → ⑦光 → ⑧カメラ → ⑨雰囲気 → ⑩品質</b>」の順に書くと、意図が伝わりやすくなります（序章 第3章）。それぞれの欄を選ぶと英文ができあがります。気に入った形ができたら、1語ずつ別の語彙に差し替えて違いを比べるのが上達の近道です。',
      prompt:'作りたい画像（雨の夜のネオン街に立つ、銀髪の女性のサイバーパンク風ポートレート）を、画像生成AI向けの英語プロンプトにして。「種類→主役→外見→服装→ポーズ→背景→光→カメラ→雰囲気」の順に文章で書き、日本語訳も付けて。' },
    { name:'解像度と縦横比', en:'Resolution & aspect ratio', h:470, tags:['体験','設定'],
      demo:'<div class="kt"><span class="sw"></span><div class="kt-row" style="font-size:11.5px"><label>幅 <input type="number" class="kt-in w" style="width:90px" aria-label="幅"></label><label>高さ <input type="number" class="kt-in h" style="width:90px" aria-label="高さ"></label></div><div class="pv" style="flex:1;min-height:0;display:grid;place-items:center"></div><div class="kt-verdict res"></div></div>',
      init:(el) => { const run = () => { const w = +$(el, '.w').value || 1, h = +$(el, '.h').value || 1, r = Math.max(w / h, h / w), ok32 = w % 32 === 0 && h % 32 === 0, mp = w * h / 1e6, hit = RATIOS.find(x => x[1] === w && x[2] === h);
          $(el, '.pv').innerHTML = `<div style="aspect-ratio:${w} / ${h};${w >= h ? 'width:min(100%, 260px)' : 'height:min(100%, 220px)'};max-height:100%;max-width:100%;border-radius:6px;background:linear-gradient(135deg, var(--accent), #f472b6);display:grid;place-items:center;color:#fff;font:800 13px var(--mono)">${w}×${h}</div>`;
          verdict($(el, '.res'), !ok32 || r > 2.2 ? 'warn' : 'ok', `${hit ? `<b>${hit[0]}</b>：${hit[3]}。` : ''}約 <b>${mp.toFixed(1)}</b>メガピクセル。` + (ok32 ? '✓ 幅・高さとも32の倍数。' : `⚠ <b>32の倍数</b>にするのが推奨（例：${Math.round(w / 32) * 32}×${Math.round(h / 32) * 32}）。`) + (r > 2.2 ? '<br>⚠ 縦横比が極端すぎると、人物が引き伸ばされたり、複数人に分裂したりしやすくなります。' : '')); };
        $(el, '.sw').replaceWith(seg(RATIOS.map(r => r[0]), i => { $(el, '.w').value = RATIOS[i][1]; $(el, '.h').value = RATIOS[i][2]; run(); }, 4).el); $$(el, 'input').forEach(x => x.oninput = run); },
      desc:'Qwen-Image-2.1 の公式サンプルの推奨解像度は、1:1 なら 2048×2048、16:9 なら 2752×1536 など（序章 第2章の表）。<b>幅と高さは32の倍数</b>にし、<b>縦横比は極端にしない</b>のが基本です。全身の人物は縦長（2:3）、風景は横長（16:9）が収まりやすくなります。',
      prompt:'Qwen-Image-2.1 を diffusers で動かすPythonのコードを書いて。縦横比（1:1・3:2・16:9・9:16）を選ぶと公式推奨の解像度になり、シード値を固定して同じプロンプトで1語だけ変えた画像を並べて比較できるようにして。' },
    { name:'タグの羅列と、文章で書くプロンプト', en:'Tags vs sentences', h:400, tags:['体験','書き方'],
      demo:'<div class="kt"><span class="sw"></span><div class="ig-out out kt-grow"></div><div class="kt-verdict res"></div></div>',
      init:(el) => { const Vv = [['1girl, blue hair, school uniform, classroom, window, smile, sunlight, masterpiece, best quality', 'warn', 'タグの羅列でも動きますが、<b>誰が何を着て、どこで何をしているか</b>の関係が伝わりにくい。旧来のモデル向けの書き方。'], ['A young woman with shoulder-length blue hair, wearing a navy school blazer, stands by a classroom window, smiling softly in the warm afternoon sunlight.', 'ok', '✓ 主語・動詞・修飾語のある<b>文章</b>。Qwen系のように「文章の意味」を理解するモデルでは、関係が正確に伝わります（序章 第3章 第1節）。']];
        $(el, '.sw').replaceWith(seg(['タグを並べる', '文章で書く'], i => { $(el, '.out').textContent = Vv[i][0]; verdict($(el, '.res'), Vv[i][1], Vv[i][2]); }, 1).el); },
      desc:'最近の画像生成AIは、キーワードの羅列より<b>文章</b>をよく理解します。「映画監督が撮影監督に指示を出すように」、被写体・服装・場所・光・カメラ・雰囲気を順に書き込んでいきましょう。<code>(word:1.3)</code> のような重み付けの記法は、Qwen-Image系では基本的に効きません。',
      prompt:'このタグ形式のプロンプト（貼り付け）を、画像生成AI向けの自然な英語の文章に書き直して。人物の位置関係・服の色と物の対応・光の方向が正確に伝わるように。' },
  ]});

/* ================= 1. 人物 ================= */
stageTab({ id:'person', label:'人物', icon:'🧑', si:1,
  intro:'人物は<b>「人数・年齢・体型 → 顔 → 髪 → 表情 → 服装 → 素材 → ポーズ → メイク・装飾」</b>の順に細かくしていくと、狙ったキャラクターに近づきます（第一段階）。',
  demos:[
    { name:'複数の人物を書き分ける', en:'Avoid attribute leakage', h:450, tags:['体験','よくある失敗'],
      demo:'<div class="kt"><span class="sw"></span><div class="ig-out out"></div><div class="pv" style="flex:1;min-height:0;display:flex;gap:10px;justify-content:center;align-items:center"></div><div class="kt-verdict res"></div></div>',
      init:(el) => { const fig = (hair, coat, label) => `<div style="text-align:center;font-size:11px"><svg viewBox="0 0 80 120" width="70"><circle cx="40" cy="30" r="18" fill="#f1c4a5"/><path d="M22,28 a18,18 0 0 1 36,0 q-8,-8 -18,-6 q-10,-2 -18,6Z" fill="${hair}"/><rect x="20" y="50" width="40" height="52" rx="12" fill="${coat}"/></svg><br>${label}</div>`;
        const Vv = [['Two women, one with red hair and one with blonde hair, wearing a green coat and a white dress, in a park.', `${fig('#dc2626', '#16a34a', '左の人？')}${fig('#facc15', '#16a34a', '右の人？')}`, 'bad', '❌ 色と物の対応があいまいで、<b>属性が混ざる（漏れる）</b>。2人とも緑のコートになる・髪色が入れ替わる、といった失敗が起きやすい。'], ['Two women in a park. On the left, a woman with short red hair wears a green coat. On the right, a woman with long blonde hair wears a white dress.', `${fig('#dc2626', '#16a34a', '左：赤い短髪・緑のコート')}${fig('#facc15', '#f5f5f4', '右：金髪・白いワンピース')}`, 'ok', '✓ <b>人物ごとに文を分け</b>、<code>On the left... On the right...</code> で位置を指定（第一段階 第1章 第1節のポイント）。']];
        $(el, '.sw').replaceWith(seg(['まとめて書く', '一人ずつ書く'], i => { $(el, '.out').textContent = Vv[i][0]; $(el, '.pv').innerHTML = Vv[i][1]; verdict($(el, '.res'), Vv[i][2], Vv[i][3]); }).el); },
      desc:'複数の人物を1つの文でまとめて書くと、髪の色や服が別の人に移る「<b>属性の漏れ</b>」が起きやすくなります。<b>一人ずつ文を分け</b>、左右などの<b>位置</b>と一緒に書くのがいちばん効く対策です。',
      prompt:'3人の人物が登場する画像のプロンプトを英語で書いて。左・中央・右に立つ人物それぞれの髪型・服・表情を1人1文で書き分け、特徴が混ざらないようにして。' },
    { name:'人物ミキサー（語彙表から選ぶ）', en:'Character mixer', h:480, tags:['体験'],
      demo:'<div class="kt"><div class="ig-sel sl"></div><div class="ig-out out kt-grow"></div><div class="kt-row"><button type="button" class="kt-btn pri cp">コピー</button><button type="button" class="kt-btn sm rnd">おまかせ</button></div></div>',
      init:(el) => { const F = [['年齢', chapterRows(1, 0, 1)], ['体型', chapterRows(1, 0, 3)], ['髪型', chapterRows(1, 2, 0)], ['表情', chapterRows(1, 3, 0)], ['服装', chapterRows(1, 4, 0)]].filter(f => f[1].length);
        $(el, '.sl').innerHTML = F.map(([l, rows], i) => `<b>${l}</b><select data-i="${i}" aria-label="${l}">${rows.map((r, k) => `<option value="${k}">${esc(r[1])}（${esc(first(r[0]))}）</option>`).join('')}</select>`).join('');
        const run = () => { const p = $$(el, '.sl select').map(s => first(F[+s.dataset.i][1][+s.value][0])); el._t = `A portrait photograph of a ${p[0] || 'young'} person, ${p[1] || ''}, with ${p[2] || 'short hair'}, ${p[3] || ''}, wearing ${p[4] || 'casual clothes'}.`.replace(/\s+,/g, ',').replace(/,\s*,/g, ','); $(el, '.out').textContent = el._t + '\n\n※語彙表の語をそのまま差し込んだ下書きです。文法が不自然な所は整えて使いましょう。'; };
        $$(el, '.sl select').forEach(s => s.onchange = run); $(el, '.cp').onclick = () => VD.copyText(el._t); $(el, '.rnd').onclick = () => { $$(el, '.sl select').forEach(s => { s.value = Math.floor(Math.random() * s.options.length); }); run(); }; run(); },
      desc:'下の語彙表（第一段階）から、年齢・体型・髪型・表情・服装の語を選んで組み合わせる練習です。語彙は単独で覚えるより<b>組み合わせ</b>で覚えるのが効果的。気になった語は表で効果を確かめ、1語ずつ差し替えて比べましょう。',
      prompt:'このキャラクター設定（年齢・性格・職業）から、画像生成用の英語プロンプトを作って。外見は「顔の輪郭・目・髪・肌の特徴」まで具体的に、服装は素材と色まで書き、同じ人物を別の場面でも描けるよう固定の説明文と場面の説明文を分けて。' },
  ]});

/* ================= 2. 背景 ================= */
const SKY = [['dawn', '夜明け', '#1e3a8a', '#fda4af', '#475569'], ['morning', '朝', '#7dd3fc', '#fef9c3', '#4d7c0f'], ['midday', '真昼', '#38bdf8', '#e0f2fe', '#65a30d'], ['golden hour', 'ゴールデンアワー', '#f59e0b', '#fde68a', '#a16207'], ['sunset', '夕焼け', '#7c2d12', '#fb923c', '#3f3f46'], ['blue hour', 'ブルーアワー', '#1e3a8a', '#6366f1', '#1e293b'], ['night', '夜', '#020617', '#1e293b', '#0f172a']];
stageTab({ id:'scene', label:'背景・舞台', icon:'🏙', si:2,
  intro:'背景は<b>「大分類（屋外・屋内・架空）→ 具体的な場所 → 時代・地域 → 天候・季節・時間帯 → 細部」</b>の順に書くと情景がはっきりします（第二段階）。',
  demos:[
    { name:'時間帯で変わる空と光', en:'Time of day', h:440, tags:['体験'],
      demo:'<div class="kt"><span class="sw"></span><div class="ig-art art"></div><div class="kt-verdict res"></div></div>',
      init:(el) => { $(el, '.sw').replaceWith(seg(SKY.map(s => s[1]), i => { const [en, ja, a, b, g] = SKY[i], night = i >= 5;
          $(el, '.art').innerHTML = `<svg viewBox="0 0 600 300" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="igs${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="600" height="300" fill="url(#igs${i})"/>${night ? Array.from({ length:40 }, (_, k) => `<circle cx="${(k * 97) % 600}" cy="${(k * 53) % 150}" r="${k % 3 ? .8 : 1.4}" fill="#fff" opacity=".8"/>`).join('') + '<circle cx="470" cy="70" r="20" fill="#f8fafc"/>' : `<circle cx="${[90, 160, 300, 470, 520, 0, 0][i]}" cy="${[230, 120, 50, 190, 240, 0, 0][i]}" r="30" fill="#fef08a" opacity=".95"/>`}<path d="M0,230 L120,150 L240,230 L360,140 L480,230 L600,170 L600,300 L0,300Z" fill="${g}"/><rect y="255" width="600" height="45" fill="${g}" opacity=".85"/>${night || i === 5 ? [60, 150, 420, 530].map(x => `<rect x="${x}" y="215" width="34" height="40" fill="#0f172a"/><rect x="${x + 8}" y="225" width="8" height="8" fill="#fde047"/>`).join('') : ''}</svg><span class="cap">${en}</span>`;
          verdict($(el, '.res'), '', lookHtml(2, en) ); }, 3).el); },
      desc:'同じ場所でも、<b>時間帯</b>を1語変えるだけで光の色・影の長さ・空の色・雰囲気がまったく変わります。特に <code>golden hour</code>（日の出・日の入り前後の暖かい光）と <code>blue hour</code>（日没直後の青い時間）は、写真らしさを出す定番の語です。',
      prompt:'同じ構図（湖のほとりの小屋）で、夜明け・真昼・ゴールデンアワー・ブルーアワー・夜の5枚を作るための英語プロンプトを書いて。時間帯以外の文は同じにして、光と空の色の書き方だけを変えて。' },
  ]});

/* ================= 3. 光と色 ================= */
const LIGHT = [['Rembrandt', 'Rembrandt lighting', 26, 18, 'linear-gradient(110deg, #f4cfb3 0 48%, #6b4a3a 52%)'], ['butterfly', 'butterfly lighting', 50, 4, 'radial-gradient(circle at 50% 20%, #ffe2cc, #b9876a 80%)'], ['split', 'split lighting', 2, 40, 'linear-gradient(90deg, #f4cfb3 0 50%, #3b2a22 50%)'], ['loop', 'loop lighting', 30, 14, 'linear-gradient(120deg, #f6d6bf 0 55%, #8b6450 85%)'], ['rim light', 'rim light', 92, 30, 'radial-gradient(circle at 50% 50%, #3b2a22 60%, #fde68a 75%, #3b2a22 82%)'], ['backlight', 'backlighting', 50, -6, 'radial-gradient(circle at 50% 40%, #4b382d, #2a1f19)'], ['high-key', 'high-key lighting', 50, 10, 'radial-gradient(circle at 50% 40%, #fff1e6, #f0c9ad)'], ['low-key', 'low-key lighting', 10, 30, 'radial-gradient(circle at 18% 40%, #c99a7a 0, #2a1f19 55%)'], ['underlighting', 'underlighting', 50, 98, 'linear-gradient(0deg, #f4cfb3, #3b2a22 80%)']];
const GRADE = [['なし', '', 'none'], ['teal and orange', 'teal and orange', 'saturate(1.3) contrast(1.1)', 'linear-gradient(180deg, rgb(0 128 128 / .35), rgb(255 140 0 / .25))'], ['sepia tone', 'sepia', 'sepia(.85) contrast(1.05)'], ['black and white', 'monochrome / black and white', 'grayscale(1) contrast(1.15)'], ['muted colors', 'muted colors', 'saturate(.45) brightness(1.05)'], ['pastel colors', 'pastel', 'saturate(.6) brightness(1.18) contrast(.85)'], ['neon color palette', 'neon color palette', 'saturate(2.2) hue-rotate(250deg) contrast(1.2)'], ['faded film look', 'faded film look', 'contrast(.8) brightness(1.08) saturate(.8) sepia(.2)'], ['bleach bypass', 'bleach bypass', 'saturate(.35) contrast(1.45)'], ['noir', 'noir', 'grayscale(1) contrast(1.6) brightness(.85)']];
stageTab({ id:'light', label:'光と色', icon:'💡', si:3,
  intro:'光は<b>「光源 → 質（硬い・柔らかい）→ 方向 → 色」</b>の順に書くと、狙った雰囲気になります。写真・映画の照明用語は、名前を1つ書くだけで光の方向と影の形が決まります（第三段階）。',
  demos:[
    { name:'ライティングのパターン', en:'Lighting patterns', h:460, tags:['体験','定番'],
      demo:'<div class="kt"><span class="sw"></span><div class="ig-art art" style="background:#18181b"><div class="ig-face fc"><div class="lamp"></div><div class="body"></div><div class="neck"></div><div class="head"></div><div class="eye" style="left:31%"></div><div class="eye" style="right:31%"></div><div class="nose"></div></div></div><div class="kt-verdict res"></div></div>',
      init:(el) => { $(el, '.sw').replaceWith(seg(LIGHT.map(l => l[0]), i => { const [, key, lx, ly, bg] = LIGHT[i]; const f = $(el, '.fc'); f.querySelector('.head').style.background = bg; f.querySelector('.head').style.boxShadow = i === 4 ? '0 0 0 3px #fde68a, 0 0 18px 4px rgb(253 230 138 / .7)' : i === 6 ? '0 0 0 1px #fff' : 'none'; const lamp = f.querySelector('.lamp'); lamp.style.left = lx + '%'; lamp.style.top = ly + '%'; el.querySelector('.art').style.background = i === 6 ? '#f4f4f5' : i === 5 ? 'radial-gradient(circle at 50% 30%, #fef3c7, #18181b 60%)' : '#18181b';
          verdict($(el, '.res'), '', lookHtml(3, key)); }).el); },
      desc:'光源の<b>位置</b>が変わると、顔の影の形が変わります。斜め上45°からで頬に三角の光ができる <code>Rembrandt lighting</code>、正面の上からで鼻の下に蝶の形の影ができる <code>butterfly lighting</code>、真横から顔を半分に分ける <code>split lighting</code>…。名前を書くだけで、AIはその光を再現します。',
      prompt:'ポートレートの画像生成で、同じ人物・同じ服で照明だけを変えた5枚（Rembrandt・butterfly・split・rim light・low-key）を作る英語プロンプトを書いて。照明の部分以外は同じ文にして、比較しやすくして。' },
    { name:'カラーグレーディング', en:'Color grading', h:460, tags:['体験'],
      demo:'<div class="kt"><span class="sw"></span><div class="ig-art art"><div class="ig-frame fr" style="aspect-ratio:3 / 2;height:auto;width:min(100%, 420px)"><svg viewBox="200 120 600 400" preserveAspectRatio="xMidYMid slice">' + SCENE() + '</svg><div class="ov" style="position:absolute;inset:0;mix-blend-mode:soft-light"></div></div></div><div class="kt-verdict res"></div></div>',
      init:(el) => { $(el, '.sw').replaceWith(seg(GRADE.map(g => g[0]), i => { const [, key, f, ov] = GRADE[i]; $(el, '.fr svg').style.filter = f; $(el, '.ov').style.background = ov || 'none'; verdict($(el, '.res'), '', i ? lookHtml(3, key) : '元の色。下のボタンで色調の語を切り替えて、印象の違いを比べましょう。'); }).el); },
      desc:'色調の語（<b>カラーグレーディング</b>）は、写真全体の印象を一気に変えます。映画風の <code>teal and orange</code>、懐かしい <code>faded film look</code>、重厚な <code>bleach bypass</code>…。見本はCSSのフィルターで近い雰囲気を出したもので、実際の画像生成ではもっと自然に仕上がります。',
      prompt:'同じ街の夜景の写真プロンプトを、カラーグレーディングの語だけ変えて5パターン（teal and orange・Cinestill 800T look・bleach bypass・pastel・noir）作って。それぞれどんな印象になるかも一言添えて。' },
  ]});

/* ================= 4. カメラと構図 ================= */
// [語, 名前, 中心x, 中心y, 写す幅]（人物は頭の上が約y130、足が約y612）
const SHOTS = [['extreme close-up', '超クローズアップ', 500, 182, 90], ['close-up', 'クローズアップ', 500, 192, 190], ['medium close-up', 'バストショット', 500, 224, 300], ['medium shot', 'ミディアムショット', 500, 276, 470], ['cowboy shot', 'カウボーイショット', 500, 314, 600], ['full-body shot', '全身', 500, 374, 810], ['wide shot', '引きの画', 500, 380, 1600], ['extreme wide shot', '超ロング', 500, 330, 3600]];
const LENS = [[14, 'ultra-wide angle lens'], [24, 'wide-angle lens'], [35, '35mm'], [50, '50mm'], [85, '85mm'], [135, 'telephoto'], [200, 'telephoto']];
const COMP = [['三分割法', 'rule of thirds', 667, 'thirds'], ['日の丸（中央）', 'centered composition', 500, 'center'], ['黄金比', 'golden ratio', 618, 'golden'], ['対角線', 'diagonal composition', 667, 'diag'], ['導線', 'leading lines', 500, 'lines'], ['余白を多く', 'negative space', 820, 'space']];
stageTab({ id:'camera', label:'カメラと構図', icon:'📷', si:4,
  intro:'被写体をどのくらいの大きさで写すか（<b>ショットサイズ</b>）、どこから見るか（<b>アングル</b>）、どのレンズで撮るか（<b>焦点距離</b>）、画面のどこに置くか（<b>構図</b>）を、写真・映画の用語で指定します（第四段階）。',
  demos:[
    { name:'ショットサイズ', en:'Shot sizes', h:460, tags:['体験','定番'],
      demo:'<div class="kt"><span class="sw"></span><div class="ig-art art"><div class="ig-frame fr" style="aspect-ratio:3 / 2;height:auto;width:min(100%, 440px)"><svg class="sv" preserveAspectRatio="xMidYMid slice">' + SCENE() + '</svg></div></div><div class="kt-verdict res"></div></div>',
      init:(el) => { $(el, '.sw').replaceWith(seg(SHOTS.map(s => s[1]), i => { const [key, , cx, cy, w] = SHOTS[i], h = w / 1.5; $(el, '.sv').setAttribute('viewBox', `${cx - w / 2} ${cy - h / 2} ${w} ${h}`); verdict($(el, '.res'), '', lookHtml(4, key)); }, 3).el); },
      desc:'<b>ショットサイズ</b>は、被写体を画面にどのくらいの大きさで入れるか。目元だけの <code>extreme close-up</code> から、人物が景色の点になる <code>extreme wide shot</code> まで。全身を描きたいのに足が切れるときは <code>full-body shot, head to toe</code> と縦長の比率をセットで（第十段階 第3章）。',
      prompt:'同じ人物（赤いコートの男性が山道に立つ）を、クローズアップ・バストショット・全身・引きの画の4つのショットサイズで描く英語プロンプトを書いて。全身のときは足が切れないための書き方と縦横比も指定して。' },
    { name:'レンズの焦点距離と画角', en:'Focal length & field of view', h:470, tags:['体験'],
      demo:'<div class="kt"><div class="kt-row"><span class="kt-lbl">焦点距離</span><input type="range" min="14" max="200" value="50" class="f" style="flex:1" aria-label="焦点距離"><b class="kt-mono fv"></b></div><div class="ig-art art" style="background:var(--surface-2)"><svg class="sv" viewBox="0 0 400 260"></svg></div><div class="kt-verdict res"></div></div>',
      init:(el) => { const TREES = [[200, 60], [120, 90], [290, 100], [60, 140], [340, 150], [170, 130], [240, 170], [30, 200], [380, 210]];
        const run = () => { const f = +$(el, '.f').value, fov = 2 * Math.atan(36 / (2 * f)), cam = [200, 245], L = 260, a1 = -Math.PI / 2 - fov / 2, a2 = -Math.PI / 2 + fov / 2; $(el, '.fv').textContent = f + 'mm';
          const inside = ([x, y]) => { const ang = Math.atan2(y - cam[1], x - cam[0]); return ang >= a1 && ang <= a2; };
          $(el, '.sv').innerHTML = `<path d="M${cam[0]},${cam[1]} L${cam[0] + Math.cos(a1) * L},${cam[1] + Math.sin(a1) * L} L${cam[0] + Math.cos(a2) * L},${cam[1] + Math.sin(a2) * L}Z" style="fill:color-mix(in srgb, var(--accent) 18%, transparent);stroke:var(--accent)"/>` + TREES.map(t => `<circle cx="${t[0]}" cy="${t[1]}" r="9" fill="${inside(t) ? '#16a34a' : '#a3a3a3'}"/>`).join('') + `<rect x="${cam[0] - 12}" y="${cam[1] - 8}" width="24" height="14" rx="3" fill="var(--stage-ink)"/><text x="8" y="16" style="font:700 11px var(--mono);fill:var(--muted)">画角 ${Math.round(fov * 180 / Math.PI)}°（横・フルサイズ換算）</text>`;
          const l = LENS.reduce((a, b) => Math.abs(b[0] - f) < Math.abs(a[0] - f) ? b : a); verdict($(el, '.res'), '', lookHtml(4, l[1]) + `<br>写る木：<b>${TREES.filter(inside).length}本</b>／${TREES.length}本。`); };
        $(el, '.f').oninput = run; run(); },
      desc:'焦点距離（mm）が短いほど<b>広く写り</b>、遠近感が強調されます（広角）。長いほど<b>狭く大きく写り</b>、背景が圧縮されてぼけやすくなります（望遠）。人物のポートレートは <code>85mm</code>、風景や室内の広がりは <code>24mm</code>、自然な見た目は <code>50mm</code> が定番です。',
      prompt:'ポートレート・風景・料理・建物の4種類について、画像生成のプロンプトに書くと効果的なレンズの焦点距離と絞り（f値）の組み合わせを、理由と英語の例文付きで表にして。' },
    { name:'構図の補助線', en:'Composition guides', h:470, tags:['体験','定番'],
      demo:'<div class="kt"><span class="sw"></span><div class="ig-art art"><div class="ig-frame fr" style="aspect-ratio:3 / 2;height:auto;width:min(100%, 440px)"><svg class="sv" viewBox="0 0 1000 667" preserveAspectRatio="xMidYMid slice"></svg></div></div><div class="kt-verdict res"></div></div>',
      init:(el) => { $(el, '.sw').replaceWith(seg(COMP.map(c => c[0]), i => { const [, key, sx, kind] = COMP[i], W = 1000, H = 667, g = 'stroke="#fff" stroke-width="3" stroke-dasharray="10 8" fill="none" opacity=".9"';
          let guides = ''; if (kind === 'thirds' || kind === 'space') guides = `<path d="M333,0V667M667,0V667M0,222H1000M0,445H1000" ${g}/>`; if (kind === 'center') guides = `<path d="M500,0V667M0,333H1000" ${g}/>`; if (kind === 'golden') guides = `<path d="M618,0V667M0,412H1000" ${g}/><path d="M618,412 A206,206 0 0 1 412,206 A206,206 0 0 1 618,0 A382,382 0 0 1 1000,382" ${g}/>`; if (kind === 'diag') guides = `<path d="M0,667L1000,0" ${g}/>`; if (kind === 'lines') guides = `<path d="M150,667L470,420M850,667L530,420" stroke="#fde047" stroke-width="6" fill="none"/>`;
          const sy = kind === 'diag' ? 222 : 300, road = kind === 'lines' ? '<path d="M150,667 L470,420 L530,420 L850,667Z" fill="#57534e"/><path d="M500,667 L500,430" stroke="#fff" stroke-width="6" stroke-dasharray="30 24"/>' : '';
          $(el, '.sv').innerHTML = `<rect width="${W}" height="${H}" fill="${kind === 'space' ? '#bae6fd' : '#7dd3fc'}"/><rect y="420" width="${W}" height="247" fill="${kind === 'space' ? '#e0f2fe' : '#65a30d'}"/>${road}<g transform="translate(${sx - 500 * .5},${sy - 120}) scale(.5)"><use href="#igman2"/></g>${guides}<defs><g id="igman2">${SCENE().split('<g id="igman">')[1].replace(/<\/g>$/, '')}</g></defs>`;
          verdict($(el, '.res'), '', lookHtml(4, key)); }).el); },
      desc:'<b>構図</b>は、主役を画面のどこに置くか。縦横を3等分した線の交点に置く <code>rule of thirds</code>（三分割法）、真ん中に置いて安定させる <code>centered composition</code>、道や線で視線を導く <code>leading lines</code>、余白で静けさを出す <code>negative space</code>…。白い点線が補助線です。',
      prompt:'商品（腕時計）の広告写真を、三分割法・中央構図・余白を多く取った構図の3パターンで作る英語プロンプトを書いて。文字を後から入れる余白の位置も指定して。' },
  ]});
})();
