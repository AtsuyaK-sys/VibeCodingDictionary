/* 画像・イラスト表現辞典 — B: 画風 / 雰囲気 / 人物以外 / 文字・透明画像 / 画像編集 / 品質・トラブル / テンプレート / Webで使う・他のAI */
(function(){
const { $, $$, esc, seg, tbl } = KIT;
const { C, S, T, verdict, codeify, lookHtml, stageTab, V } = IGH;

/* ---- 画風の見本：キャンバスに描いた絵を加工する ---- */
function paint(c){ const g = c.getContext('2d'), W = c.width, H = c.height;
  const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#60a5fa'); sky.addColorStop(1, '#fde68a'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
  g.fillStyle = '#fbbf24'; g.beginPath(); g.arc(W * .78, H * .25, H * .1, 0, 7); g.fill();
  g.fillStyle = '#64748b'; g.beginPath(); g.moveTo(0, H * .7); g.lineTo(W * .3, H * .35); g.lineTo(W * .6, H * .7); g.fill(); g.fillStyle = '#94a3b8'; g.beginPath(); g.moveTo(W * .35, H * .7); g.lineTo(W * .68, H * .42); g.lineTo(W, H * .7); g.fill();
  g.fillStyle = '#4d7c0f'; g.fillRect(0, H * .7, W, H * .3);
  g.fillStyle = '#fef3c7'; g.fillRect(W * .12, H * .55, W * .18, H * .2); g.fillStyle = '#dc2626'; g.beginPath(); g.moveTo(W * .1, H * .56); g.lineTo(W * .21, H * .42); g.lineTo(W * .32, H * .56); g.fill(); g.fillStyle = '#7c2d12'; g.fillRect(W * .19, H * .64, W * .04, H * .11);
  g.fillStyle = '#78350f'; g.fillRect(W * .74, H * .58, W * .03, H * .18); g.fillStyle = '#166534'; g.beginPath(); g.arc(W * .755, H * .52, H * .12, 0, 7); g.fill(); }
function styled(src, dst, kind){
  const W = src.width, H = src.height, d = dst.getContext('2d'); dst.width = W; dst.height = H; d.imageSmoothingEnabled = true;
  if (kind === 'pixel'){ const s = document.createElement('canvas'); s.width = 40; s.height = Math.round(40 * H / W); s.getContext('2d').drawImage(src, 0, 0, s.width, s.height); d.imageSmoothingEnabled = false; d.drawImage(s, 0, 0, W, H); return; }
  const img = src.getContext('2d').getImageData(0, 0, W, H), p = img.data, out = d.createImageData(W, H), o = out.data, L = (i) => .299 * p[i] + .587 * p[i + 1] + .114 * p[i + 2];
  if (kind === 'poster'){ for (let i = 0; i < p.length; i += 4){ for (let k = 0; k < 3; k++) o[i + k] = Math.round(p[i + k] / 255 * 3) / 3 * 255; o[i + 3] = 255; } d.putImageData(out, 0, 0); return; }
  if (kind === 'line'){ for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++){ const i = (y * W + x) * 4, gx = L(i + 4) - L(i - 4), gy = L(i + W * 4) - L(i - W * 4), e = Math.min(255, Math.hypot(gx, gy) * 3), v = 255 - e; o[i] = o[i + 1] = o[i + 2] = v > 200 ? 252 : v; o[i + 3] = 255; } d.putImageData(out, 0, 0); return; }
  if (kind === 'halftone'){ d.fillStyle = '#fffbeb'; d.fillRect(0, 0, W, H); const st = 7; for (let y = 0; y < H; y += st) for (let x = 0; x < W; x += st){ const i = (Math.min(H - 1, y + 3) * W + Math.min(W - 1, x + 3)) * 4, r = (1 - L(i) / 255) * st * .62; d.fillStyle = `rgb(${p[i] * .6},${p[i + 1] * .6},${p[i + 2] * .6})`; d.beginPath(); d.arc(x + st / 2, y + st / 2, Math.max(.4, r), 0, 7); d.fill(); } return; }
  if (kind === 'water'){ d.filter = 'blur(2.2px) saturate(.85)'; d.drawImage(src, 0, 0); d.filter = 'none'; d.globalAlpha = .18; for (let k = 0; k < 900; k++){ d.fillStyle = k % 2 ? '#fff' : '#d6d3d1'; d.fillRect((k * 97) % W, (k * 61) % H, 2, 2); } d.globalAlpha = 1; return; }
  d.drawImage(src, 0, 0);
}
const STY = [['元の絵', '', ''], ['ピクセルアート', 'pixel', 'pixel art'], ['線画', 'line', 'line art'], ['ハーフトーン', 'halftone', 'halftone'], ['ポスター風', 'poster', 'flat'], ['水彩風', 'water', 'watercolor']];
stageTab({ id:'style', label:'画風', icon:'🖌', si:5,
  intro:'画風は<b>プロンプトの冒頭で1つだけ宣言</b>するのが基本です。写真・絵画・イラスト・3D・デザインと、同じ被写体でもまったく違う絵になります。相反する語（photorealistic と anime）を同時に書くと画風が混ざります（第五段階）。',
  demos:[
    { name:'同じ絵を画風で変える', en:'Style comparison', h:460, tags:['体験'],
      demo:'<div class="kt"><span class="sw"></span><div class="ig-canvas"><div>元の絵<canvas class="a"></canvas></div><div class="lb">加工後<canvas class="b"></canvas></div></div><div class="kt-verdict res"></div></div>',
      init:(el) => { const a = $(el, '.a'), b = $(el, '.b'); a.width = 240; a.height = 160; paint(a);
        $(el, '.sw').replaceWith(seg(STY.map(s => s[0]), i => { styled(a, b, STY[i][1]); verdict($(el, '.res'), '', STY[i][2] ? lookHtml(5, STY[i][2]) + '<br><span style="color:var(--muted)">※見本はプログラムで近い雰囲気に加工したもの。実際の画像生成では、その画風で一から描かれます。</span>' : '元の絵です。画風のボタンを押して比べましょう。'); }, 1).el); },
      desc:'同じ「山と家と木の風景」でも、画風の語で印象が大きく変わります。<code>pixel art</code>（ドット絵）、<code>line art</code>（線画）、<code>halftone</code>（印刷の網点）、<code>flat illustration</code>（平塗り）、<code>watercolor</code>（水彩）…。画風は<b>文の最初</b>に置くと効きやすくなります。',
      prompt:'自分のアプリのアイコン（ねこと本）を、フラットイラスト・ピクセルアート・水彩画・3Dのクレイ風の4つの画風で作る英語プロンプトを書いて。画風の宣言は文の最初に置き、画風以外の説明は同じにして。' },
  ]});

/* ================= 6. 雰囲気 ================= */
const MOOD = [['穏やか', 'serene', ['#e0f2fe', '#bae6fd', '#d9f99d', '#fef9c3', '#f5f5f4'], ['serene', 'calm', 'peaceful', 'soft morning light', 'pastel tones']], ['懐かしい', 'nostalgic', ['#fde68a', '#fdba74', '#d6d3d1', '#a8a29e', '#78716c'], ['nostalgic', 'warm', 'faded film look', 'golden hour', 'grainy']], ['幻想的', 'ethereal', ['#e9d5ff', '#c4b5fd', '#a5f3fc', '#fbcfe8', '#f0abfc'], ['dreamy', 'ethereal', 'soft glow', 'floating particles', 'pastel haze']], ['不穏', 'eerie', ['#1e293b', '#334155', '#14532d', '#713f12', '#0f172a'], ['eerie', 'ominous', 'fog', 'low-key lighting', 'desaturated green tint']], ['活気', 'vibrant', ['#f43f5e', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7'], ['vibrant', 'energetic', 'bustling', 'saturated colors', 'bright daylight']], ['孤独', 'melancholic', ['#1e3a8a', '#475569', '#94a3b8', '#cbd5e1', '#0f172a'], ['melancholic', 'lonely', 'rain', 'blue hour', 'empty street']]];
stageTab({ id:'mood', label:'雰囲気・物語', icon:'🌫', si:6,
  intro:'雰囲気（ムード）の語は、<b>光・色・天候・時間帯とセット</b>で書くと効きます。ムード語だけでは弱いことが多いので、「なぜそう感じるか」の要素を足しましょう（第六段階・第十段階 第3章）。',
  demos:[
    { name:'ムードと色・言葉の組み合わせ', en:'Mood palettes', h:440, tags:['体験'],
      demo:'<div class="kt"><span class="sw"></span><div class="ig-pal pl"></div><div class="ig-words wd"></div><div class="gr" style="flex:1;min-height:0;border-radius:10px"></div><div class="kt-verdict res"></div></div>',
      init:(el) => { $(el, '.sw').replaceWith(seg(MOOD.map(m => m[0]), i => { const [, key, cols, words] = MOOD[i];
          $(el, '.pl').innerHTML = cols.map(c => `<i style="background:${c}">${c}</i>`).join(''); $(el, '.wd').innerHTML = words.map(w => `<span data-c="${w}" title="クリックでコピー">${w}</span>`).join('');
          $(el, '.gr').style.background = `linear-gradient(160deg, ${cols.join(', ')})`; verdict($(el, '.res'), '', lookHtml(6, key) + '<br>単語はクリックでコピーできます。'); }).el); },
      desc:'「懐かしい」を伝えたいなら <code>nostalgic</code> だけでなく、暖かい色（<code>warm</code>）、<code>golden hour</code>、<code>faded film look</code>、粒子感（<code>grainy</code>）を一緒に書くと、AIが「なぜ懐かしいのか」を絵にできます。ムードごとの<b>色の組み合わせ</b>と<b>言葉のセット</b>の例です。',
      prompt:'「雨の日の夕方、少し寂しいけれど温かい」雰囲気の画像を作りたい。ムード語・光・色調・天候・時間帯・小物（物語を感じさせる要素）を組み合わせた英語プロンプトを、日本語の解説付きで書いて。' },
  ]});

/* ================= 7. 人物以外 ================= */
stageTab({ id:'subject', label:'人物以外の被写体', icon:'🐈', si:7,
  intro:'動物・食べ物・物・乗り物・植物にも、それぞれ<b>質感と撮り方の定番の言葉</b>があります。商品写真なら「素材・置き台・背景・光・構図」、料理なら「湯気・照り・真上から」など（第七段階）。' });

/* ================= 8. 文字・透明画像 ================= */
const FONTS = [['bold sans-serif', '900 ', 'sans-serif'], ['elegant serif', '700 ', 'serif'], ['handwritten script', 'italic 600 ', 'cursive'], ['neon', '800 ', 'sans-serif']];
stageTab({ id:'text', label:'文字・透明画像', icon:'🔤', si:8,
  intro:'画像の中の文字は<b>引用符 "..." で囲み</b>、「何に・どこに・どんな書体と色で」書かれているかを指定します。背景が透明な画像（RGBA）は、ステッカー・アイコン・切り抜き素材に便利です（第八段階）。',
  demos:[
    { name:'文字入りポスターの指示', en:'Text rendering prompt', h:500, tags:['体験','定番'],
      demo:'<div class="kt"><div class="ig-two"><div><div class="ig-sel fm"></div><span class="s1"></span><span class="s2"></span><div class="ig-out out" style="flex:1"></div></div><div style="align-items:center"><div class="ig-poster ps"></div></div></div></div>',
      init:(el) => { let f = 0, pos = 0; $(el, '.fm').innerHTML = '<b>文字</b><input class="tx" value="VISIT JAPAN" aria-label="文字"><b>色</b><input type="color" class="cl" value="#b91c1c" aria-label="色">';
        const run = () => { const t = $(el, '.tx').value || 'SALE', col = $(el, '.cl').value, [fn, w, fam] = FONTS[f], P = ['At the top', 'In the center', 'At the bottom'][pos];
          const cname = { '#b91c1c':'red', '#ffffff':'white' }[col] || 'colored';
          el._t = `A minimalist vintage travel poster in flat illustration style. A red Mount Fuji rises above a calm blue lake. ${P}, ${fn} ${cname} text reads "${t}".`;
          $(el, '.out').textContent = el._t;
          $(el, '.ps').innerHTML = `<div style="flex:1;display:flex;flex-direction:column;justify-content:${['flex-start', 'center', 'flex-end'][pos]};align-items:center;position:relative;z-index:2"><span class="tx" style="font:${w}${Math.max(14, 34 - [...t].length)}px ${fam};color:${col};${f === 3 ? `text-shadow:0 0 6px ${col},0 0 14px ${col};` : ''}text-align:center">${esc(t)}</span></div><svg viewBox="0 0 100 150" style="position:absolute;inset:0;width:100%;height:100%"><path d="M10,110 L50,55 L90,110Z" fill="#dc2626"/><path d="M38,72 L50,55 L62,72 L56,70 L50,75 L44,70Z" fill="#fff"/><rect y="108" width="100" height="42" fill="#2563eb"/></svg>`; };
        $(el, '.s1').replaceWith(seg(FONTS.map(x => x[0].split(' ').pop()), i => { f = i; run(); }).el); $(el, '.s2').replaceWith(seg(['上', '中央', '下'], i => { pos = i; run(); }).el); $$(el, '.fm input').forEach(x => x.oninput = run); },
      desc:'文字を正確に描かせるコツは、①<b>引用符で囲む</b>、②<b>位置</b>（At the top）、③<b>書体</b>（bold sans-serif）と<b>色</b>、④<b>短く</b>。長い文や画数の多い漢字は崩れやすいので、大事な文字は英数字や短い語句にするのが安定します。崩れたらシードを変えて何枚か作りましょう。',
      prompt:'カフェの開店告知ポスターの英語プロンプトを作って。上部に大きく「GRAND OPEN」、下部に小さく「10.27 SAT」、それぞれ書体・色・大きさを指定し、文字は引用符で囲む。背景はコーヒーカップのフラットイラストで、文字の部分は余白にして。' },
    { name:'透明背景（RGBA）の画像', en:'Transparent images', h:420, tags:['体験'],
      demo:'<div class="kt"><span class="sw"></span><div class="bx" style="flex:1;min-height:0;border-radius:10px;display:grid;place-items:center;border:1px solid var(--border)"><div style="font-size:70px;filter:drop-shadow(0 4px 6px rgb(0 0 0 / .25))">🐈🍡</div></div><div class="ig-out out"></div><div class="kt-verdict res"></div></div>',
      init:(el) => { $(el, '.sw').replaceWith(seg(['普通に生成', '透明（RGBA）で生成'], i => { const bx = $(el, '.bx'); bx.className = 'bx' + (i ? ' ig-checker' : ''); bx.style.background = i ? '' : '#ffffff';
          $(el, '.out').textContent = (i ? 'This is an RGBA image with transparency. ' : '') + 'A chibi-style die-cut sticker of a sleepy calico cat curled up on a strawberry daifuku, thick white border, soft pastel colors, clean vector lines.';
          verdict($(el, '.res'), i ? 'ok' : '', i ? '✓ 背景が透明（市松模様は透明の印）。そのままWebやスライドに重ねられる。影を残したいときは <code>with a soft drop shadow</code>。' : '白い背景ごと描かれるので、使うときに切り抜きが必要。'); }).el); },
      desc:'Qwen-Image-2.1 は<b>背景が透明なRGBA画像</b>を直接作れます（作例7）。プロンプトの最初に <code>This is an RGBA image with transparency.</code> と書くのがポイント。ステッカー・アイコン・キャラクターの立ち絵・商品の切り抜き・エフェクト素材に便利です。',
      prompt:'アプリで使うキャラクターのスタンプ（喜ぶ・困る・眠る・驚く）を透明背景で作る英語プロンプトを4つ書いて。同じキャラクターに見えるよう外見の説明は共通にし、最初に RGBA の指定を入れて。' },
  ]});

/* ================= 9. 画像編集 ================= */
const EDT = [['her sweater', '服', 'to a deep burgundy turtleneck'], ['the background', '背景', 'to a snowy mountain cabin'], ['the season outside the window', '窓の外の季節', 'to winter with gentle snowfall'], ['the sky', '空', 'to a dramatic sunset'], ['her hair color', '髪の色', 'to silver']];
const KEEP = [['face', '顔'], ['pose', 'ポーズ'], ['the background', '背景'], ['the lighting', '光'], ['the composition', '構図']];
stageTab({ id:'edit', label:'画像編集', icon:'✂', si:9,
  intro:'画像編集の指示は<b>「動詞 ＋ 対象 ＋ 変更内容 ＋ 保持する要素」</b>の形で書くと安定します。変えたくない所（顔・ポーズ・背景）を<b>明記して守る</b>のがコツです（第九段階）。',
  demos:[
    { name:'編集の指示を組み立てる', en:'Edit instruction builder', h:460, tags:['体験','定番'],
      demo:'<div class="kt"><div class="ig-sel fm"></div><div class="ck" style="display:flex;flex-wrap:wrap;gap:4px 12px;font-size:11.5px"></div><div class="ig-out out kt-grow"></div><div class="kt-verdict res"></div></div>',
      init:(el) => { $(el, '.fm').innerHTML = `<b>変える対象</b><select class="tg" aria-label="対象">${EDT.map((e, i) => `<option value="${i}">${e[1]}</option>`).join('')}</select><b>変更内容</b><input class="to" aria-label="変更内容">`;
        $(el, '.ck').innerHTML = '<b style="font-size:11px;color:var(--muted)">変えない：</b>' + KEEP.map(([k, l], i) => `<label><input type="checkbox" data-k="${k}"${i < 3 ? ' checked' : ''}>${l}</label>`).join('');
        const run = () => { const e = EDT[+$(el, '.tg').value], keep = $$(el, '.ck input').filter(i => i.checked).map(i => i.dataset.k).filter(k => !(k === 'the background' && e[0].includes('background')));
          const ks = keep.length ? ` Keep ${keep.length > 1 ? keep.slice(0, -1).join(', ') + ' and ' + keep.slice(-1) : keep[0]} unchanged.` : '';
          $(el, '.out').textContent = `Change ${e[0]} ${$(el, '.to').value || e[2]}.${ks}`; verdict($(el, '.res'), keep.length ? 'ok' : 'warn', keep.length ? '✓ 「変える所」と「変えない所」が両方書かれています。' : '⚠ 変えない所を書かないと、顔や構図まで変わってしまうことがあります。'); };
        $(el, '.tg').onchange = () => { $(el, '.to').value = EDT[+$(el, '.tg').value][2]; run(); }; $(el, '.to').value = EDT[0][2]; $(el, '.to').oninput = run; $$(el, '.ck input').forEach(i => i.onchange = run); run(); },
      desc:'編集では「何を・どう変えるか」と同じくらい、「<b>何を変えないか</b>」が大事です。<code>Keep her face, pose and the background unchanged.</code> のように守る要素を書くと、人物の顔が別人になる・構図が崩れる、といった失敗を防げます。',
      prompt:'この商品写真（白い背景のスニーカー）を、背景だけ「朝の公園の芝生」に変える編集指示を英語で書いて。商品の形・色・ロゴ・影の向きは変えないことを明記して。' },
  ]});

/* ================= 10. 品質・トラブル ================= */
const NEGS = [['no people', 'an empty street, deserted, no one around'], ['no blur', 'sharp focus, everything in focus'], ['not smiling', 'serious expression'], ['no text', 'clean image without any lettering'], ['not cartoonish', 'photorealistic, real photograph'], ['no makeup', 'bare-faced, natural skin'], ['not crowded', 'minimal, lots of empty space']];
stageTab({ id:'quality', label:'品質・トラブル', icon:'🛠', si:10,
  intro:'Qwen-Image-2.1 は基本的にネガティブプロンプトの効きが限られる設計です。<b>入れてほしくないものは、本文で肯定形に言い換える</b>のが基本。失敗したら「シードを固定 → 1語だけ変える → 比べる」で原因を探します（第十段階）。',
  demos:[
    { name:'否定形を肯定形に言い換える', en:'Negative → positive', h:440, tags:['体験','最重要'],
      demo:'<div class="kt"><textarea class="kt-in tx" rows="3" spellcheck="false" aria-label="プロンプト">A street photo of a quiet alley at night, no people, not crowded, no blur.</textarea><div class="ig-out out kt-grow"></div><div class="kt-verdict res"></div></div>',
      init:(el) => { const run = () => { const t = $(el, '.tx').value; let o = t, hits = []; NEGS.forEach(([n, p]) => { const re = new RegExp('\\b' + n.replace(/ /g, '\\s+') + '\\b', 'gi'); if (re.test(o)){ hits.push([n, p]); o = o.replace(re, p); } });
          const rest = (o.match(/\b(no|not|without|never)\s+\w+/gi) || []);
          $(el, '.out').textContent = o; verdict($(el, '.res'), rest.length ? 'warn' : hits.length ? 'ok' : '', (hits.length ? `言い換え：${hits.map(([n, p]) => `<code>${n}</code> → <code>${p}</code>`).join('、')}` : '否定形は見つかりませんでした。') + (rest.length ? `<br>⚠ まだ否定形が残っています：${rest.map(r => `<code>${esc(r)}</code>`).join(' ')}。「どういう状態か」を肯定形で書きましょう。` : '')); };
        $(el, '.tx').oninput = run; run(); },
      desc:'「<code>no people</code>」と書くと、かえって人を呼び込むことがあります（否定語の中の単語に引っぱられる）。<b>どういう状態か</b>を肯定形で書くのが確実です：人がいない → <code>an empty street, deserted</code>、ぼかさない → <code>sharp focus</code>。下の表（第十段階 第2章）の言い換えを使って試してみましょう。',
      prompt:'このプロンプト（貼り付け）から「no〜」「not〜」「without〜」の否定形を探して、画像生成AIに伝わりやすい肯定形の表現に書き換えて。書き換えた理由も一言ずつ添えて。' },
  ]});

/* ================= 11. テンプレート ================= */
const TPL = (() => { const st = V[11]; if (!st || !st.ch[0]) return []; return st.ch[0].sec.map(s => [s.title.replace(/^第\d+節\s*/, ''), (s.items.find(i => i.e) || {}).e || '']).filter(t => t[1]); })();
stageTab({ id:'templates', label:'テンプレートと作例', icon:'📋', si:11,
  intro:'最初は<b>テンプレートの空欄を埋める</b>だけで十分です。慣れたら作例を1語ずつ書き換えて、自分の文体を作っていきましょう（第十一段階）。プロンプト例は「コピー」ボタンでそのまま使えます。',
  demos:[
    { name:'テンプレートの穴埋め', en:'Fill in a template', h:540, tags:['体験','定番'], wide:true,
      demo:'<div class="kt"><span class="sw"></span><div class="ig-two"><div class="ig-sel fm" style="align-content:start"></div><div><span class="kt-lbl">できあがり</span><div class="ig-out out" style="flex:1"></div><div class="kt-row"><button type="button" class="kt-btn pri cp">コピー</button></div></div></div></div>',
      init:(el) => { let k = 0; const run = () => { const tpl = TPL[k][1]; let i = 0; el._t = tpl.replace(/\[([^\]]+)\]/g, (m, inner) => { const inp = $$(el, '.fm input')[i++]; const v = inp && inp.value.trim(); return v || (inner.includes(':') ? inner.split(':').slice(1).join(':').trim().split(' / ')[0] : `[${inner}]`); }); $(el, '.out').textContent = el._t; };
        const build = () => { const slots = [...TPL[k][1].matchAll(/\[([^\]]+)\]/g)].map(m => m[1]); $(el, '.fm').innerHTML = slots.map((s, j) => { const [lab, ex] = s.includes(':') ? [s.split(':')[0], s.split(':').slice(1).join(':').trim()] : [s, '']; return `<b>${esc(lab)}</b><input data-j="${j}" placeholder="${esc(ex || lab)}" aria-label="${esc(lab)}">`; }).join(''); $$(el, '.fm input').forEach(x => x.oninput = run); run(); };
        if (!TPL.length){ $(el, '.fm').textContent = 'テンプレートを読み込めませんでした。'; return; }
        $(el, '.sw').replaceWith(seg(TPL.map(t => t[0].replace(/のテンプレート$/, '')), i => { k = i; build(); }).el); $(el, '.cp').onclick = () => VD.copyText(el._t); },
      desc:'第十一段階の4つのテンプレート（写実的な人物・アニメ・風景・商品写真）を、穴埋めで使えるようにしたものです。空欄は<b>空のままなら例の語</b>が入ります。埋めた後は、下の作例集と見比べて、足りない要素（光・カメラ・色調）を足していきましょう。',
      prompt:'このテンプレート（貼り付け）を使って、自分のブランド（北欧風の雑貨店）の商品写真のプロンプトを5種類作って。商品・素材・置き台・光・構図だけを変え、全体の雰囲気（明るく清潔・ミニマル）はそろえて。' },
  ]});

/* ================= 12. Webで使う・他のAI ================= */
const FMT = [['JPEG', '写真', '○', '×', '◎', '写真の定番。圧縮で細部が少しぼやける'], ['PNG', '図・スクショ・透明', '◎', '○', '△', '劣化なし・透明OK。写真だと重い'], ['WebP', '写真・透明・アニメ', '◎', '○', '◎', '<b>Webの標準</b>。JPEGより小さく、透明もOK'], ['AVIF', '写真', '◎', '○', '◎', 'さらに小さいが、書き出しに時間がかかる'], ['SVG', 'アイコン・ロゴ・図', '◎', '○', '◎', '拡大してもぼやけない（線と図形）。写真には向かない'], ['GIF', '簡単なアニメ', '△', '△', '×', '色数が少なく重い。動画（MP4）やWebPの方が小さい']];
const MODELS = [['Qwen-Image 系', '文章で書く。文字描画・透明画像・編集に強い', '重み記法は基本効かない。否定は肯定形に言い換える'], ['Midjourney', '短めの文＋パラメーター（<code>--ar 16:9</code>・<code>--style raw</code>・<code>--no</code>）', '比率や除外はパラメーターで指定'], ['Stable Diffusion / SDXL', 'タグ風の書き方も通じる。<code>(word:1.2)</code> の重み付け、ネガティブプロンプトが効く', 'モデル（チェックポイント）ごとに得意な書き方が違う'], ['FLUX', '自然な文章が得意。長い説明も読む', '文字描画も比較的得意'], ['ChatGPT（GPT Image）・Gemini など', '会話で頼める。「もっと明るく」と続けて直せる', '細かい指定は文章で。編集も会話で']];
const RIGHTS = [['AIの学習に使うこと', '日本の著作権法第30条の4で、原則として許諾なく学習に使える場合がある（例外あり）', '文化庁「AIと著作権に関する考え方について」を確認'], ['生成した画像の著作権', '人が<b>創作的に関わった</b>と言えるかで判断。指示が短いだけでは認められにくいとされる', '大事な作品は、加筆・修正の過程を記録'], ['他人の作品に似てしまったら', '既存の作品との<b>類似性と依拠性</b>で侵害かを判断。特定の作家名・作品名での生成は避ける', '公開前に似ていないか確認'], ['実在の人物・商標・ロゴ', '肖像権・パブリシティ権・商標の問題になりうる', '実在の人物・ブランドを使わない'], ['サービスの利用規約', '商用利用できるか、クレジット表記が必要かはサービスごとに違う', '使うサービスの規約を確認'], ['AI生成であることの表示', '求められる場面が増えている。C2PA などの来歴情報も広がっている', 'ニュース・広告では特に明記']];

TABS.push({ id:'web', label:'Webで使う・他のAI', icon:'🌐',
  intro:'作った画像をWebで使うときの<b>形式・大きさ・代替テキスト</b>、<b>他の画像生成AIとの書き方の違い</b>、そして<b>権利の注意</b>をまとめます。ここは元のPDFにはない、この辞典で追加した内容です。<br><span style="color:var(--muted)">※権利の話は一般的な情報で、法律の助言ではありません。仕様や規約は変わるので、各サービスと文化庁などの公式情報で確認してください。</span>',
  sections:[
    C('触って理解する', [
      { name:'画像の大きさと形式', en:'Image size & format', h:460, tags:['体験','Web'],
        demo:'<div class="kt"><div class="kt-row" style="font-size:11.5px"><label>表示する幅 <input type="number" class="kt-in w" value="800" style="width:80px" aria-label="幅">px</label><label>高さ <input type="number" class="kt-in h" value="533" style="width:80px" aria-label="高さ">px</label></div><div class="br" style="display:grid;grid-template-columns:auto 1fr auto;gap:5px 8px;align-items:center;font-size:11.5px;flex:1;align-content:center"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const run = () => { const w = +$(el, '.w').value || 1, h = +$(el, '.h').value || 1, px = w * 2 * h * 2, R = [['生成したままのPNG（2048px）', 2048 * 2048 * 1.4 / 1024], ['JPEG（2倍の大きさ）', px * .22 / 1024], ['WebP（2倍の大きさ）', px * .14 / 1024], ['AVIF（2倍の大きさ）', px * .1 / 1024]], mx = Math.max(...R.map(r => r[1]));
            $(el, '.br').innerHTML = R.map(([n, kb], i) => `<span>${n}</span><i style="display:block;height:14px;border-radius:0 4px 4px 0;background:${i ? 'var(--accent)' : 'var(--bad)'};width:${kb / mx * 100}%"></i><b class="kt-mono">${kb > 1024 ? (kb / 1024).toFixed(1) + 'MB' : Math.round(kb) + 'KB'}</b>`).join('');
            verdict($(el, '.res'), '', `表示する幅 ${w}px なら、くっきり見える<b>2倍の ${w * 2}×${h * 2}px</b> を用意し、<b>WebP</b> で書き出すのが目安（大きさは写真の内容で変わる概算）。生成したままの大きなPNGを置くと、ページが重くなります。<br><code>&lt;img src="hero.webp" width="${w}" height="${h}" alt="…"&gt;</code> のように大きさも指定してレイアウトのずれを防ぐ。`); };
          $$(el, 'input').forEach(i => i.oninput = run); run(); },
        desc:'画像生成AIの出力は2000px以上の大きなPNGが多く、そのままWebに置くと<b>ページがとても重く</b>なります。表示する大きさの<b>2倍</b>程度に縮め、<b>WebP</b>（またはAVIF）で書き出すのが基本。<code>width</code>・<code>height</code> を書いて、読み込み中のずれも防ぎましょう。',
        prompt:'public/images にあるAI生成の画像（PNG・2048px）を、表示サイズの2倍に縮小して WebP に変換するスクリプトを書いて（sharp を使用）。Next.js では next/image で表示し、ファーストビューの画像だけ priority を付けて。' },
      { name:'代替テキスト（alt）', en:'Alt text for generated images', h:400, tags:['体験','アクセシビリティ'],
        demo:'<div class="kt"><span class="sw"></span><div class="ig-out out kt-grow"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const A = [['alt="image"', 'bad', '何の画像か分かりません。'], ['alt="A cinematic photograph of a young woman with shoulder-length wavy chestnut hair, wearing a cream cable-knit sweater, sitting by the window…"', 'warn', '<b>プロンプトをそのまま</b>入れると長すぎ・英語・撮影の指示（85mmなど）まで読み上げられます。'], ['alt="窓辺で本を読みながら微笑む女性"', 'ok', '✓ ページの中で<b>その画像が伝えたいこと</b>を短い日本語で。飾りの画像なら <code>alt=""</code>。']];
          $(el, '.sw').replaceWith(seg(['適当', 'プロンプトのまま', '内容を短く'], i => { $(el, '.out').textContent = `<img src="hero.webp" ${A[i][0]}>`; verdict($(el, '.res'), A[i][1], A[i][2]); }).el); },
        desc:'生成した画像にも<b>代替テキスト</b>（alt）が必要です。プロンプトをそのまま入れるのは避け、<b>ページの中でその画像が伝えたいこと</b>を短い日本語で書きます。雰囲気づくりだけの飾りの画像なら、空の <code>alt=""</code> にして読み上げを省きます。',
        prompt:'このページの画像（AI生成）すべてに、ページの内容に合った日本語の代替テキストを付けて。飾りの画像は alt="" に、情報を伝える画像は何が写っていて何を伝えたいかを30〜60文字程度で。' },
    ], null, true),
    { title:'画像の形式の比較', note:'迷ったら<b>写真は WebP、アイコンやロゴは SVG</b>。透明が必要な写真風の画像も WebP で扱えます。',
      table:{ head:['形式', '向いている', '画質', '透明', '小ささ', '特徴'], rows:FMT } },
    { title:'他の画像生成AIとの書き方の違い', note:'この辞典の語彙（写真・映画・美術の用語）は、<b>どのモデルでも比較的よく通じます</b>。書き方の違いは主に「文章かタグか」「比率や除外をどこで指定するか」です。仕様は変わるので、最新は各サービスの公式で確認してください。',
      table:{ head:['モデル・サービス', '書き方', '注意'], rows:MODELS } },
    { title:'AI生成画像を使うときの権利の注意', note:'一般的な整理です。<b>商用で使う・公開する前には、使うサービスの規約と公式の情報を確認</b>し、必要なら専門家に相談してください。',
      table:{ head:['テーマ', '考え方（日本）', '実際の対応'], rows:RIGHTS } },
    S('画像・イラスト表現の用語', [
      T('プロンプト', 'Prompt', '画像生成AIへの指示文。英語の文章で、大事なものから書く。', null, ['基本']),
      T('シード値', 'Seed', '乱数の種。同じプロンプト＋同じシードなら同じ画像。1語だけ変えて比べるときは固定する。'),
      T('ネガティブプロンプト', 'Negative prompt', '出してほしくない要素の欄。モデルによって効き方が大きく違う。Qwen-Image-2.1 では限定的。'),
      T('CFG（ガイダンス）', 'Guidance scale', 'プロンプトにどれだけ従わせるかの強さ。モデルによっては使わない設計もある。'),
      T('ステップ数', 'Inference steps', '絵を仕上げるくり返しの回数。多いほど細部が安定するが時間がかかる。'),
      T('参照画像', 'Reference images', '人物や商品の見た目を保つために渡す画像。Qwen-Image-2.1 は最大10枚。'),
      T('インペイント・マスク', 'Inpainting / mask', '画像の一部だけを描き直す。変えたい範囲をマスクで指定する。'),
      T('アップスケール', 'Upscaling', '画像を大きく、細部をくっきりさせる処理。'),
      T('LoRA', 'LoRA', '特定の画風やキャラクターを追加で覚えさせた小さな追加データ（主に Stable Diffusion 系）。'),
      T('C2PA', 'Content Credentials', '画像がどう作られたか（AI生成か等）の来歴を記録する仕組み。'),
      T('alt テキスト', 'Alt text', '画像の内容を文字で伝える。生成画像にも必要。'),
      T('WebP / AVIF', 'Modern formats', 'Web向けの小さな画像形式。生成画像はこれに変換して使う。'),
    ]),
  ]});
})();
