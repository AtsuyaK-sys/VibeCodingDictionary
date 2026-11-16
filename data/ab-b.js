/* AI・機械学習のしくみ辞典 — B: ニューラルネット / 文章を作るAI / 画像・音声を作るAI / 限界と付き合い方 */
(function(){
const { $, $$, seg } = KIT;
const { S, C, T, verdict, clamp, f2, pct, cv, sliders, pos, dot, line, rng, gauss, BLUE, ORANGE } = ABH;

/* ================= 5. ニューラルネット ================= */
const ACT = [['階段', (z) => (z > 0 ? 1 : 0), '0 より大きければ 1、そうでなければ 0'], ['シグモイド', (z) => 1 / (1 + Math.exp(-z)), '1 ÷ (1 + e^(−z))。0〜1 のなめらかな値'], ['ReLU', (z) => Math.max(0, z), 'マイナスは 0、プラスはそのまま。今の主流']];
// 2入力 → 隠れ層 H個（tanh）→ 1出力（シグモイド）の小さなニューラルネット
function makeNet(H, r){ return { H, w1:Array.from({ length:H }, () => [gauss(r) * 1.2, gauss(r) * 1.2, gauss(r) * .3]), w2:Array.from({ length:H + 1 }, () => gauss(r) * .8) }; }
function forward(net, x, y){ const h = net.w1.map(w => Math.tanh(w[0] * x + w[1] * y + w[2])); let z = net.w2[net.H]; for (let i = 0; i < net.H; i++) z += net.w2[i] * h[i]; return { h, o:1 / (1 + Math.exp(-z)) }; }
function trainStep(net, D, lr){ let loss = 0; D.forEach(([x, y, t]) => { const { h, o } = forward(net, x, y), d = o - t; loss += -(t ? Math.log(o + 1e-9) : Math.log(1 - o + 1e-9));
    for (let i = 0; i < net.H; i++){ const dh = d * net.w2[i] * (1 - h[i] * h[i]); net.w2[i] -= lr * d * h[i]; net.w1[i][0] -= lr * dh * x; net.w1[i][1] -= lr * dh * y; net.w1[i][2] -= lr * dh; } net.w2[net.H] -= lr * d; }); return loss / D.length; }
const DATA = [(r) => Array.from({ length:80 }, () => { const x = r() * 2 - 1, y = r() * 2 - 1; return [x, y, x * y > 0 ? 1 : 0]; }).filter(p => Math.abs(p[0]) > .08 && Math.abs(p[1]) > .08), (r) => Array.from({ length:90 }, () => { const x = r() * 2 - 1, y = r() * 2 - 1, d = Math.hypot(x, y); return [x, y, d < .55 ? 1 : 0, d]; }).filter(p => Math.abs(p[3] - .55) > .08), (r) => Array.from({ length:70 }, () => { const x = r() * 2 - 1, y = r() * 2 - 1; return [x, y, x + y > 0 ? 1 : 0]; }).filter(p => Math.abs(p[0] + p[1]) > .12)];

TABS.push({ id:'nn', label:'ニューラルネット', icon:'🕸',
  intro:'今のAIの中心にあるのが<b>ニューラルネット</b>です。部品は「入力に重みを掛けて足し、ある形に変えて出す」だけの<b>ニューロン</b>。1個では直線でしか分けられませんが、<b>たくさん並べて層を重ねる</b>と、曲がった境界も引けるようになります。対話AIも画像生成AIも、この部品を数千億個の規模でつないだものです。',
  sections:[
    C('触って理解する', [
      { name:'ニューロン1個の計算', en:'A single neuron', h:520, tags:['基本','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="ab-neuron"></div><div class="sl"></div><div class="ab-f out"></div></div>',
        init:(el) => { let a = 1; const st = sliders($(el, '.sl'), [['x1', '入力 x₁', -1, 1, .05, .8], ['x2', '入力 x₂', -1, 1, .05, -.4], ['w1', '重み w₁', -3, 3, .1, 1.5], ['w2', '重み w₂', -3, 3, .1, -2], ['b', 'バイアス b', -2, 2, .1, .2]], () => draw());
          const wline = (w) => `stroke="${w >= 0 ? 'var(--accent)' : 'var(--bad)'}" stroke-width="${1 + Math.abs(w) * 2.2}"`;
          const draw = () => { const z = st.x1 * st.w1 + st.x2 * st.w2 + st.b, o = ACT[a][1](z);
            $(el, '.ab-neuron').innerHTML = `<svg viewBox="0 0 400 170" preserveAspectRatio="xMidYMid meet"><g font-family="sans-serif" font-size="12" text-anchor="middle"><line x1="70" y1="45" x2="200" y2="85" ${wline(st.w1)}/><line x1="70" y1="125" x2="200" y2="85" ${wline(st.w2)}/><line x1="236" y1="85" x2="330" y2="85" stroke="var(--border-strong)" stroke-width="3"/>
              <circle cx="50" cy="45" r="24" fill="var(--surface)" stroke="var(--border-strong)" stroke-width="2"/><text x="50" y="42" fill="var(--muted)" font-size="10">x₁</text><text x="50" y="56" font-weight="700" fill="var(--stage-ink)">${f2(st.x1)}</text>
              <circle cx="50" cy="125" r="24" fill="var(--surface)" stroke="var(--border-strong)" stroke-width="2"/><text x="50" y="122" fill="var(--muted)" font-size="10">x₂</text><text x="50" y="136" font-weight="700" fill="var(--stage-ink)">${f2(st.x2)}</text>
              <text x="132" y="52" fill="var(--muted)">× ${f2(st.w1, 1)}</text><text x="132" y="128" fill="var(--muted)">× ${f2(st.w2, 1)}</text>
              <circle cx="200" cy="85" r="36" fill="color-mix(in srgb, var(--accent) 14%, var(--surface))" stroke="var(--accent)" stroke-width="2.5"/><text x="200" y="76" fill="var(--muted)" font-size="10">足して + b</text><text x="200" y="94" font-weight="700" font-size="15" fill="var(--stage-ink)">${f2(z)}</text><text x="200" y="108" fill="var(--muted)" font-size="9">→ ${ACT[a][0]}</text>
              <circle cx="350" cy="85" r="${10 + clamp(Math.abs(o), 0, 2) * 9}" fill="var(--accent)" opacity="${.25 + clamp(o, 0, 1) * .75}"/><text x="350" y="89" font-weight="800" font-size="13" fill="var(--stage-ink)">${f2(o)}</text><text x="350" y="150" fill="var(--muted)" font-size="10">出力</text></g></svg>`;
            $(el, '.out').innerHTML = `① 足し合わせ：${f2(st.x1)} × ${f2(st.w1, 1)} + ${f2(st.x2)} × ${f2(st.w2, 1)} + ${f2(st.b, 1)} = <b>${f2(z)}</b>\n② 活性化関数（${ACT[a][0]}：${ACT[a][2]}）→ 出力 <b>${f2(o)}</b>`; };
          $(el, '.sw').replaceWith(seg(ACT.map(x => x[0]), i => { a = i; draw(); }, 1).el); },
        desc:'ニューロンの計算は2段階だけです。①入力に<b>重み</b>を掛けて足し、<b>バイアス</b>を加える。②その結果を<b>活性化関数</b>に通す。線の太さが重みの大きさ、赤い線はマイナスの重みです。学習とは、この<b>重みとバイアスを少しずつ直すこと</b>。活性化関数がないと、何層重ねても直線しか表せません。',
        prompt:'ニューラルネットのニューロン1個が何を計算しているかを、「入力」「重み」「バイアス」「活性化関数」の言葉を使って、具体的な数字の例で説明して。JavaScript で10行以内のコードにもして。',
        code:'// ニューロン1個（ReLU）\nfunction neuron(inputs, weights, bias) {\n  let z = bias;\n  for (let i = 0; i < inputs.length; i++) z += inputs[i] * weights[i];\n  return Math.max(0, z);          // 活性化関数\n}\nneuron([0.8, -0.4], [1.5, -2.0], 0.2);   // → 2.2' },
      { name:'層を重ねると曲がった境界が引ける', en:'A tiny neural network you can train', h:480, tags:['体験','最重要'], wide:true,
        demo:'<div class="kt"><span class="sw"></span><div class="ab-two"><div><div class="ab-cv"></div></div><div><div class="sl"></div><div class="kt-row"><button type="button" class="kt-btn pri go">▶ 学習する</button><button type="button" class="kt-btn sm rs">重みを作り直す</button></div><div class="ab-kpi k" style="grid-template-columns:repeat(3, 1fr)"></div><div class="kt-verdict res"></div></div></div></div>',
        init:(el) => { let di = 0, D, net, on = false, ep = 0, loss = 0, sd = 1, good = false; const c = cv(el), g = c.ctx;
          const st = sliders($(el, '.sl'), [['h', '隠れ層のニューロンの数', 1, 8, 1, 4]], () => reset());
          const reset = () => { net = makeNet(st.h, rng(sd++ * 7 + st.h)); ep = 0; on = false; loss = 0; draw(); };
          const setData = (i) => { di = i; D = DATA[i](rng(40 + i)); reset(); };
          const draw = () => { g.clearRect(0, 0, c.w, c.h); const G = 9, S0 = Math.min(c.w, c.h), ox = (c.w - S0) / 2, oy = (c.h - S0) / 2;
            for (let x = 0; x < S0; x += G) for (let y = 0; y < S0; y += G){ const o = forward(net, (x + G / 2) / S0 * 2 - 1, (y + G / 2) / S0 * 2 - 1).o; g.globalAlpha = .08 + Math.abs(o - .5) * .6; g.fillStyle = o > .5 ? ORANGE : BLUE; g.fillRect(ox + x, oy + y, G, G); } g.globalAlpha = 1;
            let ok = 0; D.forEach(p => { const o = forward(net, p[0], p[1]).o; if ((o > .5) === !!p[2]) ok++; dot(g, ox + (p[0] + 1) / 2 * S0, oy + (p[1] + 1) / 2 * S0, 4, p[2] ? ORANGE : BLUE); g.strokeStyle = '#fff'; g.lineWidth = 1.2; g.stroke(); });
            $(el, '.k').innerHTML = `<div>学習の回数<b>${ep}</b></div><div>誤差<b>${ep ? f2(loss) : '—'}</b></div><div>正解率<b>${pct(ok / D.length)}</b></div>`;
            const acc = ok / D.length, few = di < 2 && st.h < (di === 1 ? 3 : 2); good = acc > .95;
            verdict($(el, '.res'), good ? 'ok' : (ep > 400 ? 'warn' : ''), good ? `✓ ニューロン ${st.h} 個で、点をほぼ分けられました。背景の色の境目が、AIが引いた境界です。` : ep > 400 ? (few ? `ニューロンが ${st.h} 個では、この形は<b>分けきれません</b>（引ける線の数が足りない）。数を増やして、もう一度学習してみましょう。` : 'なかなか進まないときは「重みを作り直す」を押して、別のスタート地点から試してみましょう。最初の重みしだいで、うまくいかないこともあります。') : ep ? '学習中… 重みが少しずつ直されて、境界の形が変わっていきます。' : '「学習する」を押すと、でたらめな重みから始めて、点の色を当てられるように直していきます。'); };
          $(el, '.go').onclick = () => { on = true; }; $(el, '.rs').onclick = reset; c.redraw = draw;
          $(el, '.sw').replaceWith(seg(['市松もよう', '円の内と外', 'ななめに2つ'], setData).el);
          // 1コマに1周だけ学習して、境界が変わっていく様子を見せる
          return VD.loop(c.box, () => { if (!on) return; loss = trainStep(net, D, .03); ep++; draw(); if (ep >= 1500 || (good && loss < .12)) on = false; }); },
        desc:'青とオレンジの点を分ける問題です。「ななめに2つ」はニューロン1個（直線1本）で分けられますが、「市松もよう」「円の内と外」は<b>直線1本では絶対に分けられません</b>。隠れ層のニューロンを増やすと、直線を何本も組み合わせた<b>曲がった境界</b>が引けるようになります。数を 1 → 2 → 4 と増やして学習し直してみてください。',
        prompt:'ニューラルネットで「層やニューロンを増やすと何ができるようになるのか」を、直線で分けられる問題と分けられない問題（XOR）の例を使って説明して。増やしすぎた場合の欠点も教えて。' },
    ], null, true),
    { title:'ニューラルネットの種類', note:'扱うデータに合わせて、つなぎ方を工夫した仲間があります。',
      table:{ head:['種類', '得意なこと', '使われている所'], rows:[['全結合（MLP）', '表のデータ、基本の形', '小さな予測、ほかのモデルの部品'], ['CNN（畳み込み）', '画像の中の形・模様を見つける', '画像の分類、物の検出、医療画像'], ['RNN・LSTM', '順番のあるデータを1つずつ読む', '以前の翻訳・音声認識（今はTransformerが主流）'], ['Transformer', '文中の<b>どの言葉とどの言葉が関係するか</b>に注目する', '対話AI（LLM）、翻訳、最近の画像・音声AI'], ['拡散モデル', 'ノイズから少しずつ画像を作る', '画像生成・動画生成'], ['GNN（グラフ）', 'つながりのあるデータ', '分子、SNS、路線図']] } },
    S('ニューラルネットの用語', [
      T('ニューロン（ユニット）', 'Neuron', '入力に重みを掛けて足し、活性化関数を通して出力する部品。', null, ['基本']),
      T('重み', 'Weight', '入力をどれだけ重視するかの数字。学習で調整される。'),
      T('バイアス', 'Bias (neuron)', '足し合わせの結果をずらす数字。「かたより」の意味のバイアスとは別の言葉。'),
      T('活性化関数', 'Activation function', '足した結果を曲げる関数（ReLU・シグモイド・tanh）。これがあるから複雑な形を表せる。'),
      T('層（レイヤー）', 'Layer', 'ニューロンを横に並べたまとまり。入力層・隠れ層・出力層。'),
      T('順伝播', 'Forward pass', '入力から出力へ、順に計算していくこと。'),
      T('誤差逆伝播法', 'Backpropagation', '出力の間違いを後ろから前へたどって、どの重みをどれだけ直すかを計算する方法。'),
      T('パラメータ数', 'Parameter count', '重みとバイアスの総数。モデルの大きさの目安。'),
      T('Transformer', 'Transformer', '注意機構を中心にしたネットワークの形。今の生成AIの土台。', null, ['最重要']),
      T('注意機構', 'Attention', '文の中の関係の深い部分に、重みを付けて注目するしくみ。'),
      T('GPU', 'Graphics Processing Unit', '同じ計算を大量に並べて行うのが得意な部品。ニューラルネットの学習と推論に使う。'),
      T('ファインチューニング', 'Fine-tuning', '学習済みのモデルに、自分のデータで追加の学習をして特化させること。'),
      T('転移学習', 'Transfer learning', '別の課題で学んだことを、新しい課題に使い回すこと。'),
      T('量子化・蒸留', 'Quantization / distillation', 'モデルを小さく・速くする技術。数字を粗くする／大きいモデルの答えを小さいモデルに真似させる。'),
    ]),
  ]});

/* ================= 6. 文章を作るAI（LLM） ================= */
// 見本用の小さな文章の集まり（単語で区切ってある）。ここから「次に来やすい言葉」を数える
const CORPUS = ['今日 は 天気 が いい ので 散歩 に 行き ます 。', '今日 は 雨 が 降っ て いる ので 家 で 本 を 読み ます 。', '明日 は 天気 が いい ので 公園 に 行き ます 。', '猫 は 窓 の そば で 寝 て い ます 。', '猫 は 魚 が 好き です 。', '犬 は 散歩 が 好き です 。', '犬 は 公園 で 走っ て い ます 。', '私 は コーヒー が 好き です 。', '私 は 朝 に コーヒー を 飲み ます 。', '私 は 家 で 猫 と 遊び ます 。', '朝 は 天気 が いい ので 散歩 に 行き ます 。', '雨 が 降っ て いる ので 傘 を 持っ て 行き ます 。', '明日 は 雨 が 降る ので 家 で 映画 を 見 ます 。', '公園 で 犬 と 遊び ます 。', '本 を 読む の が 好き です 。'].map(s => s.split(' '));
const BI = {}; CORPUS.forEach(s => { for (let i = 0; i < s.length - 1; i++){ (BI[s[i]] = BI[s[i]] || {})[s[i + 1]] = ((BI[s[i]] || {})[s[i + 1]] || 0) + 1; } });
const STARTS = ['今日', '猫', '私', '明日', '犬'];
const nextDist = (w, temp) => { const m = BI[w] || {}, ks = Object.keys(m); if (!ks.length) return []; const p = ks.map(k => Math.pow(m[k], 1 / Math.max(.05, temp))), sum = p.reduce((a, b) => a + b, 0); return ks.map((k, i) => [k, p[i] / sum]).sort((a, b) => b[1] - a[1]); };
const sample = (dist) => { let r = Math.random(); for (const [k, p] of dist){ if ((r -= p) <= 0) return k; } return dist[dist.length - 1][0]; };
const bars = (dist, cls) => dist.map(([k, p], i) => `<span>${k}</span><span class="bar"><i class="${cls ? cls(i, k) : ''}" style="width:${Math.max(1.5, p * 100)}%"></i></span><span>${pct(p)}</span>`).join('');
// 見本用に作った「言葉の地図」（本物の埋め込みは数百〜数千次元ある）
const EMB = [['犬', .2, .28, 0], ['猫', .27, .2, 0], ['うさぎ', .15, .16, 0], ['ライオン', .31, .34, 0], ['車', .78, .22, 1], ['電車', .85, .3, 1], ['バス', .8, .36, 1], ['自転車', .7, .3, 1], ['りんご', .22, .76, 2], ['みかん', .3, .82, 2], ['バナナ', .16, .86, 2], ['ぶどう', .28, .7, 2], ['うれしい', .74, .72, 3], ['楽しい', .8, .78, 3], ['悲しい', .68, .86, 3], ['さびしい', .62, .8, 3]];
const TOPP = [['公園', .34], ['学校', .22], ['海', .15], ['山', .11], ['図書館', .07], ['宇宙', .05], ['冷蔵庫', .04], ['過去', .02]];

TABS.push({ id:'llm', label:'文章を作るAI', icon:'💬',
  intro:'ChatGPT・Claude・Gemini のような対話AIの中身は <b>LLM（大規模言語モデル）</b>です。やっていることは驚くほど単純で、<b>「ここまでの文章の続きに来そうな言葉を、1つずつ選んで足していく」</b>だけ。この単純なしくみを、とてつもない量の文章と計算で鍛えた結果、質問に答えたりコードを書いたりできるようになりました。しくみを知ると、<b>なぜもっともらしい間違いを言うのか</b>も分かります。',
  sections:[
    C('触って理解する', [
      { name:'次の言葉を1つずつ選ぶ', en:'Next-token prediction', h:540, tags:['基本','体験','最重要'],
        demo:'<div class="kt"><span class="sw"></span><div class="ab-toks tx"></div><div class="ab-bars br" style="flex:1;align-content:start;overflow:auto"></div><div class="sl"></div><div class="kt-row"><button type="button" class="kt-btn pri nx">次の言葉を選ぶ</button><button type="button" class="kt-btn au">▶ 文の終わりまで</button><button type="button" class="kt-btn sm rs">最初から</button></div></div>',
        init:(el) => { let seq, auto = false, acc = 0, si = 0; const st = sliders($(el, '.sl'), [['t', '温度（選び方のばらつき）', .1, 2, .1, 1]], () => show());
          const show = (isNew) => { const d = nextDist(seq[seq.length - 1], st.t); $(el, '.tx').innerHTML = seq.map((w, i) => `<span class="${isNew && i === seq.length - 1 ? 'new' : ''}">${w}</span>`).join('');
            $(el, '.br').innerHTML = d.length ? `<span style="grid-column:1/-1;color:var(--muted);font-size:11px">「${seq[seq.length - 1]}」の次に来る言葉の確率（15個の例文から数えたもの）</span>` + bars(d) : '<span style="grid-column:1/-1;color:var(--muted)">文が終わりました。「最初から」でもう一度。</span>'; return d; };
          const step = () => { const d = nextDist(seq[seq.length - 1], st.t); if (!d.length || seq.length > 22){ auto = false; show(); return; } seq.push(sample(d)); show(true); if (seq[seq.length - 1] === '。') auto = false; };
          const reset = () => { seq = [STARTS[si]]; auto = false; show(); };
          $(el, '.nx').onclick = () => { auto = false; step(); }; $(el, '.au').onclick = () => { if (!(BI[seq[seq.length - 1]])) reset(); auto = true; acc = 1; }; $(el, '.rs').onclick = reset;
          $(el, '.sw').replaceWith(seg(STARTS.map(s => `「${s}」から`), i => { si = i; reset(); }).el);
          return VD.loop($(el, '.tx'), (dt) => { if (!auto) return; acc += dt; if (acc > .35){ acc = 0; step(); } }); },
        desc:'これは15個の例文から「ある言葉の次に来た言葉」を数えただけの、世界一小さな言語モデルです。棒は次の言葉の<b>確率</b>。ボタンを押すたびに、確率に従って1つ選んで文に足します。<b>意味を理解して書いているのではなく、続きそうな言葉をつないでいる</b>ので、「猫は散歩が好きです」のような、例文にない（でもありそうな）文も出てきます。本物のLLMは、直前の1語ではなく<b>何万語も前まで</b>見て、はるかに賢く確率を出しています。',
        prompt:'LLM が文章を作るしくみを、「次のトークンの確率を出して1つ選ぶ、をくり返す」という流れで、プログラミングを知らない人向けに説明して。なぜ同じ質問でも毎回少し違う答えになるのかも含めて。' },
      { name:'温度と top-p（選び方の調整）', en:'Temperature & top-p sampling', h:540, tags:['体験'],
        demo:'<div class="kt"><div class="ab-note">「週末は ＿＿ に行きたい」の ＿＿ に入る言葉</div><div class="ab-bars br" style="flex:1;align-content:start"></div><div class="sl"></div><div class="kt-row"><button type="button" class="kt-btn pri go">この設定で20回選ぶ</button></div><div class="ab-toks tx"></div></div>',
        init:(el) => { const st = sliders($(el, '.sl'), [['t', '温度', .1, 2, .1, 1], ['p', 'top-p（上位の合計）', .1, 1, .05, 1, (v) => pct(v)]], () => show());
          const dist = () => { const q = TOPP.map(([k, p]) => [k, Math.pow(p, 1 / st.t)]), s = q.reduce((a, b) => a + b[1], 0); let cum = 0; const out = q.map(([k, v]) => [k, v / s]).map(([k, v]) => { const keep = cum < st.p - 1e-9; cum += v; return [k, v, keep]; }); const ks = out.filter(o => o[2]).reduce((a, b) => a + b[1], 0); return out.map(([k, v, keep]) => [k, v, keep, keep ? v / ks : 0]); };
          const show = () => { const d = dist(); $(el, '.br').innerHTML = d.map(([k, v, keep]) => `<span style="${keep ? '' : 'opacity:.45'}">${k}</span><span class="bar"><i class="${keep ? '' : 'cut'}" style="width:${Math.max(1.5, v * 100)}%"></i></span><span>${keep ? pct(v) : '除外'}</span>`).join(''); $(el, '.tx').innerHTML = `<span style="background:none;border:0;color:var(--muted);font-size:11.5px">${st.t <= .3 ? '温度が低い：いつも一番ありそうな言葉を選ぶ（安定・単調）' : st.t >= 1.6 ? '温度が高い：めずらしい言葉も選ばれやすい（多様・不安定）' : 'ボタンを押すと、今の設定で20回選んだ結果が並びます'}</span>`; };
          $(el, '.go').onclick = () => { const d = dist().filter(o => o[2]).map(o => [o[0], o[3]]), odd = new Set(['宇宙', '冷蔵庫', '過去']); $(el, '.tx').innerHTML = Array.from({ length:20 }, () => sample(d)).map(w => `<span class="${odd.has(w) ? 'new' : ''}">${w}</span>`).join(''); };
          show(); },
        desc:'<b>温度</b>は確率の差を強めたり弱めたりするつまみです。低いと「公園」ばかり、高いと「冷蔵庫」のような変わった言葉も出てきます。<b>top-p</b> は「確率の高い順に合計が p になるまで」だけを候補に残し、変な言葉を足切りします。正確さが欲しい作業（データの抜き出し・分類）は低め、アイデア出しや創作は高めが目安です。',
        prompt:'LLM の API を使うとき、temperature と top_p をどう設定すればいいか教えて。「請求書から項目を抜き出す」「キャッチコピーを10案出す」「コードを書く」の3つの場面で、おすすめの値と理由を表にして。' },
      { name:'言葉を数の並びにする（埋め込み）', en:'Embeddings', h:500, tags:['体験'],
        demo:'<div class="kt"><div class="ab-cv"><span class="tip">言葉をクリック</span></div><div class="ab-f out"></div></div>',
        init:(el) => { const c = cv(el), g = c.ctx, CL = ['#2563eb', '#ea580c', '#16a34a', '#9333ea']; let sel = 0;
          const draw = () => { g.clearRect(0, 0, c.w, c.h); const me = EMB[sel], near = EMB.map((e, i) => [Math.hypot(e[1] - me[1], e[2] - me[2]), i]).filter(x => x[1] !== sel).sort((a, b) => a[0] - b[0]);
            near.slice(0, 3).forEach(([, i]) => { g.strokeStyle = c.mut; g.lineWidth = 1.5; g.setLineDash([3, 3]); line(g, [[me[1] * c.w, me[2] * c.h], [EMB[i][1] * c.w, EMB[i][2] * c.h]]); g.setLineDash([]); });
            EMB.forEach((e, i) => { const x = e[1] * c.w, y = e[2] * c.h; dot(g, x, y, i === sel ? 8 : 5, CL[e[3]]); g.fillStyle = c.ink; g.font = `${i === sel ? '800 13px' : '12px'} sans-serif`; g.fillText(e[0], x + 9, y + 4); });
            $(el, '.out').innerHTML = `「<b>${me[0]}</b>」に近い言葉：${near.slice(0, 3).map(([d, i]) => `${EMB[i][0]}（距離 ${f2(d)}）`).join('、')}\n一番遠い言葉：${EMB[near[near.length - 1][1]][0]}　※ 見本用に作った2次元の地図です`; };
          c.box.addEventListener('pointerdown', (e) => { const [x, y] = pos(c.box, e); let b = 0, bd = 1e9; EMB.forEach((m, i) => { const d = Math.hypot(m[1] * c.w - x, m[2] * c.h - y); if (d < bd){ bd = d; b = i; } }); sel = b; draw(); });
          c.redraw = draw; draw(); },
        desc:'AIは言葉をそのまま扱えないので、<b>数の並び（ベクトル）</b>に直します。これが<b>埋め込み</b>。うまく学習すると、<b>意味の近い言葉が近い場所</b>に集まります（動物・乗り物・果物・気持ち）。この「近さ」を使うと、言葉が一致しなくても意味の近い文章を探せます。社内資料を検索して答えさせる <b>RAG</b> は、このしくみを使っています（<a href="ai-integration.html#rag">AI組み込み辞典</a>）。',
        prompt:'FAQ の質問文を埋め込み（embedding）に変換して保存し、利用者の質問に意味が近いものを上から3件返す検索を作りたい。しくみを図で説明し、Supabase の pgvector を使った実装の手順を教えて。' },
    ], null, true),
    { title:'なぜ間違えるのか・どう防ぐか', note:'LLMの間違いは「バグ」というより、しくみから来る<b>性質</b>です。',
      table:{ head:['起きること', 'なぜ起きるか', '防ぎ方'], rows:[['もっともらしい嘘を言う（ハルシネーション）', '「続きそうな言葉」を選ぶしくみなので、知らないことでも文章は作れてしまう', '出典を求める、資料を渡して「この中から答えて」と頼む、自分で確かめる'], ['最新のことを知らない', '学習に使ったデータは、ある時点までのもの', 'Web検索の機能を使う、最新の情報を貼り付けて渡す'], ['計算や数え上げを間違える', '言葉として扱っていて、筆算をしているわけではない', 'コードを実行する機能を使わせる、表計算で確かめる'], ['同じ質問でも答えが変わる', '確率で言葉を選んでいる', '温度を下げる、出力の形式を指定する、何度か聞いて比べる'], ['長い会話の最初の方を忘れる', '一度に読める量（コンテキスト）に上限がある', '大事な条件は最後にもう一度書く、会話を区切って新しく始める'], ['こちらの言うことに合わせすぎる', '相手に合わせた続きを作りやすい', '「反対意見も挙げて」「間違いがあれば指摘して」と頼む']] } },
    S('LLMの用語', [
      T('LLM（大規模言語モデル）', 'Large Language Model', '大量の文章で学習し、文章の続きを予測するモデル。対話AIの中身。', null, ['基本']),
      T('トークン', 'Token', 'LLMが文章を扱う単位。単語より少し細かい。料金と長さの上限はトークンで数える。'),
      T('コンテキストウィンドウ', 'Context window', '一度に読める量の上限。会話の履歴・資料・指示がすべてここに入る。'),
      T('プロンプト', 'Prompt', 'AIへの入力（指示・質問・資料）。'),
      T('システムプロンプト', 'System prompt', '会話の前に与える、AIの役割や決まりの指示。'),
      T('事前学習', 'Pre-training', '大量の文章で「続きを当てる」練習をさせる最初の学習。'),
      T('知識のカットオフ', 'Knowledge cutoff', '学習データが集められた最後の時期。それ以降のことは知らない。'),
      T('温度', 'Temperature', '次の言葉の選び方のばらつき。低いと安定、高いと多様。'),
      T('埋め込み', 'Embedding', '文章を、意味の近さが距離になる数の並びに変えたもの。検索や分類に使う。'),
      T('ハルシネーション', 'Hallucination', '事実と違うことを、もっともらしく答えてしまうこと。', null, ['最重要']),
      T('RAG', 'Retrieval-Augmented Generation', '関係のある資料を先に検索して渡し、それをもとに答えさせる方法。'),
      T('推論モデル（思考モード）', 'Reasoning / extended thinking', '答える前に、下書きの考えを長く書いてから答えるモデルや設定。難しい問題に強いが遅くて高い。'),
      T('マルチモーダル', 'Multimodal', '文章だけでなく、画像・音声・動画も扱えること。'),
      T('エージェント', 'Agent', 'LLMが道具（検索・ファイル操作・コードの実行）を自分で選んで使い、何段階もの作業を進めるしくみ。'),
      T('オープンウェイト', 'Open weights', 'モデルの中身（重み）が公開されていて、自分のパソコンやサーバーで動かせること。'),
    ]),
  ]});

/* ================= 7. 画像・音声を作るAI ================= */
// 見本の絵（夕日と山）。本物の画像生成AIの絵ではなく、手続きで描いている
function scene(g, w, h, r){ const sky = g.createLinearGradient(0, 0, 0, h * .7); sky.addColorStop(0, '#1e3a8a'); sky.addColorStop(.6, '#f97316'); sky.addColorStop(1, '#fde68a'); g.fillStyle = sky; g.fillRect(0, 0, w, h);
  const sx = w * (.3 + r() * .4); g.fillStyle = '#fef08a'; g.beginPath(); g.arc(sx, h * .52, Math.min(w, h) * .11, 0, 7); g.fill();
  [['#7c2d12', .62, .2], ['#431407', .72, .14]].forEach(([col, base, amp]) => { g.fillStyle = col; g.beginPath(); g.moveTo(0, h); const ph = r() * 6, f1 = 1.5 + r() * 2; for (let x = 0; x <= w; x += 6) g.lineTo(x, h * (base - amp * Math.abs(Math.sin(x / w * f1 * 3 + ph)) * (.5 + .5 * Math.sin(x / w * 9 + ph * 2)))); g.lineTo(w, h); g.fill(); });
  g.fillStyle = '#1c1917'; g.fillRect(0, h * .86, w, h * .14); }

TABS.push({ id:'gen', label:'画像・音声を作るAI', icon:'🎨',
  intro:'画像生成AIの多くは<b>拡散モデル</b>というしくみで動いています。考え方は「<b>ノイズだらけの画像から、ノイズを少しずつ取り除いて絵にしていく</b>」。言葉（プロンプト）は、その取り除き方の道しるべになります。指示に使う言葉は <a href="image-prompts.html">画像・イラスト表現辞典</a> に約1,400語あります。音声・動画も、同じ考え方の仲間で作られています。',
  sections:[
    C('触って理解する', [
      { name:'ノイズから絵ができるまで', en:'Diffusion: denoising step by step', h:500, tags:['体験','最重要'],
        demo:'<div class="kt"><div class="ab-cv"></div><div class="sl"></div><div class="kt-row"><button type="button" class="kt-btn pri go">▶ 生成する</button></div><div class="ab-f out"></div></div>',
        init:(el) => { const c = cv(el), g = c.ctx, off = document.createElement('canvas'), N = 30; let on = false, acc = 0, img = null, noise = null;
          const st = sliders($(el, '.sl'), [['s', 'ステップ', 0, N, 1, 0, (v) => `${v} / ${N}`]], () => { on = false; draw(); });
          const prep = () => { const w = Math.max(40, Math.round(c.w / 3)), h = Math.max(30, Math.round(c.h / 3)); off.width = w; off.height = h; const og = off.getContext('2d'); scene(og, w, h, rng(12)); img = og.getImageData(0, 0, w, h); const r = rng(99); noise = new Uint8ClampedArray(w * h * 3); for (let i = 0; i < noise.length; i++) noise[i] = r() * 255; };
          const draw = () => { if (!img || off.width !== Math.max(40, Math.round(c.w / 3))) prep(); const t = st.s / N, k = t * t * (3 - 2 * t), out = new ImageData(img.width, img.height), d = out.data, s = img.data;
            for (let i = 0, j = 0; i < d.length; i += 4, j += 3){ d[i] = s[i] * k + noise[j] * (1 - k); d[i + 1] = s[i + 1] * k + noise[j + 1] * (1 - k); d[i + 2] = s[i + 2] * k + noise[j + 2] * (1 - k); d[i + 3] = 255; }
            off.getContext('2d').putImageData(out, 0, 0); g.imageSmoothingEnabled = t > .9; g.drawImage(off, 0, 0, c.w, c.h); off.getContext('2d').putImageData(img, 0, 0);
            $(el, '.out').innerHTML = st.s === 0 ? 'ステップ 0：ただのノイズ（砂嵐）から始めます。' : st.s < N ? `ステップ ${st.s}：ノイズを少し取り除いた所。${t < .4 ? 'まず<b>大まかな形と色</b>が決まります。' : '後半は<b>細かい部分</b>が整っていきます。'}` : `ステップ ${N}：完成。ステップ数が多いほどていねいですが、時間がかかります。`; };
          $(el, '.go').onclick = () => { st.set('s', 0); on = true; acc = 0; draw(); }; c.redraw = () => { img = null; draw(); }; draw();
          return VD.loop(c.box, (dt) => { if (!on) return; acc += dt; if (acc < .09) return; acc = 0; st.set('s', st.s + 1); if (st.s >= N) on = false; draw(); }); },
        desc:'拡散モデルは、学習のときに「きれいな画像にノイズを足していった過程」を大量に見て、<b>ノイズを取り除く方法</b>を覚えます。作るときは逆に、砂嵐のようなノイズから始めて、少しずつノイズを取り除きます。最初の数ステップで<b>構図や色</b>が決まり、後半で細部が整います（この見本は考え方を見せるための簡単な再現で、本物のAIの計算ではありません）。',
        prompt:'画像生成AIの「ステップ数」「シード」「ガイダンス（CFG）スケール」が、出来上がる画像にそれぞれどう影響するかを説明して。きれいに出ないときに、どれから調整すればいいかの順番も教えて。' },
      { name:'シード（同じ種からは同じ絵）', en:'Seed', h:460, tags:['体験'],
        demo:'<div class="kt"><div class="ab-cv"></div><div class="sl"></div><div class="kt-row"><button type="button" class="kt-btn pri rd">🎲 シードをランダムに</button></div><div class="ab-f out"></div></div>',
        init:(el) => { const c = cv(el), g = c.ctx; const st = sliders($(el, '.sl'), [['seed', 'シード', 1, 60, 1, 12]], () => draw());
          const draw = () => { g.save(); scene(g, c.w, c.h, rng(st.seed)); g.restore(); $(el, '.out').innerHTML = `プロンプト「夕日と山、シルエット」＋ シード <b>${st.seed}</b>\n同じシードに戻すと、<b>毎回まったく同じ絵</b>になります。`; };
          $(el, '.rd').onclick = () => { st.set('seed', 1 + Math.floor(Math.random() * 60)); draw(); }; c.redraw = draw; draw(); },
        desc:'画像生成は「でたらめなノイズ」から始めるので、同じプロンプトでも毎回違う絵になります。その<b>最初のノイズを決める番号がシード</b>。同じシード・同じ設定なら同じ絵が出るので、<b>気に入った絵の構図を保ったまま、プロンプトだけ少し変えて比べる</b>ことができます。スライダーを動かして、戻して、同じ絵に戻ることを確かめてください。',
        prompt:'画像生成で気に入った1枚ができた。この構図と雰囲気を保ったまま、服の色だけ変えた別バージョンを作りたい。シードを固定する方法と、プロンプトのどこを変えればいいかを教えて。' },
      { name:'読み上げ（音声合成）を試す', en:'Text-to-speech in your browser', h:330, tags:['体験','音が出ます'],
        demo:'<div class="kt"><input class="ab-in tx" value="こんにちは。これはブラウザに入っている音声合成です。" aria-label="読み上げる文章"><div class="sl"></div><div class="kt-row"><button type="button" class="kt-btn pri sp">🔊 読み上げる</button><button type="button" class="kt-btn sm stp">止める</button></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const st = sliders($(el, '.sl'), [['r', '速さ', .5, 2, .1, 1], ['p', '高さ', 0, 2, .1, 1]]), ok = 'speechSynthesis' in window;
          verdict($(el, '.res'), ok ? '' : 'warn', ok ? 'お使いのパソコンやスマホに入っている声で読み上げます（音が出ます）。AIの読み上げサービスは、これよりずっと自然な声や感情の表現ができます。' : 'このブラウザは音声合成に対応していません。');
          $(el, '.sp').onclick = () => { if (!ok) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance($(el, '.tx').value); u.lang = 'ja-JP'; u.rate = st.r; u.pitch = st.p; speechSynthesis.speak(u); };
          $(el, '.stp').onclick = () => { if (ok) speechSynthesis.cancel(); }; return () => { if (ok) speechSynthesis.cancel(); }; },
        desc:'文章を声にするのが<b>音声合成（TTS）</b>、声を文章にするのが<b>音声認識</b>です。ここで鳴るのは端末に入っている昔ながらの合成音声ですが、最近のAIは、数秒の声の見本から<b>その人そっくりの声</b>を作れるほど自然になりました。便利な反面、<b>なりすまし</b>にも使われるので、電話やボイスメッセージの声だけで本人だと信じないことが大切です。',
        prompt:'ブログ記事を自動で音声にして、ページに再生ボタンを付けたい。ブラウザ内蔵の Web Speech API を使う方法と、AIの音声合成 API を使う方法を、音の自然さ・料金・実装の手間で比べて。まずは無料でできる方法のコードを書いて。' },
    ], null, true),
    { title:'作れるものと、気をつけること', note:'できることは急速に増えています。使う前に、各サービスの利用規約（商用利用・学習への利用）を確認しましょう。',
      table:{ head:['種類', 'できること', '気をつけること'], rows:[['画像生成', '文章から絵・写真風の画像、画像の一部の描き直し', '実在の人物・キャラクター・ロゴ、作風のまね、商用利用の条件'], ['画像の理解', '写真や図・スクリーンショットの内容を説明、文字の読み取り', '読み間違い（特に細かい数字や手書き）'], ['音声合成', '文章の読み上げ、声の見本からのそっくりな声', '本人の許可のない声のまね、なりすまし'], ['音声認識', '会議や動画の文字起こし、字幕', '固有名詞・専門用語の聞き間違い、録音の同意'], ['音楽生成', '歌詞や雰囲気からBGM・歌', '既存の曲に似すぎていないか、利用条件'], ['動画生成', '文章や画像から短い動画', '本物と見分けがつかない映像（ディープフェイク）の扱い']] } },
    S('画像・音声生成の用語', [
      T('拡散モデル', 'Diffusion model', 'ノイズを少しずつ取り除いて画像を作るしくみ。今の画像生成の主流。', null, ['基本']),
      T('ステップ数', 'Steps', 'ノイズを取り除く回数。多いほどていねいだが遅い。'),
      T('シード', 'Seed', '最初のノイズを決める番号。同じシードなら同じ結果を再現できる。'),
      T('ガイダンス（CFG）', 'Classifier-free guidance scale', 'プロンプトにどれだけ強く従わせるか。強すぎると不自然になる。'),
      T('ネガティブプロンプト', 'Negative prompt', '入れたくない要素の指定。対応していないモデルもある。'),
      T('潜在空間', 'Latent space', '画像を小さな数の並びに圧縮した世界。計算を軽くするため、ここで絵を作ってから元に戻す。'),
      T('LoRA', 'Low-Rank Adaptation', '少ない画像で、特定の絵柄やキャラクターを追加で覚えさせる小さな追加データ。'),
      T('ControlNet', 'ControlNet', 'ポーズ・輪郭・奥行きなどの下絵で、構図を指定する技術。'),
      T('image-to-image', 'img2img', '元の画像をもとに、雰囲気や内容を変えた画像を作ること。'),
      T('インペイント', 'Inpainting', '画像の一部だけを選んで描き直すこと。'),
      T('アップスケール', 'Upscaling', '画像を、細部を補いながら大きくすること。'),
      T('音声合成・音声認識', 'TTS / ASR (speech-to-text)', '文章→声、声→文章の変換。'),
      T('ディープフェイク', 'Deepfake', '実在の人が言っていない・していないことを、本物そっくりに作った映像や音声。'),
      T('来歴情報（C2PA）', 'Content credentials', '画像や動画に「どう作られたか」を記録するしくみ。AIで作ったことを示すのに使われる。'),
    ]),
  ]});

/* ================= 8. 限界と付き合い方 ================= */
const QUIZ = [['AIは、学習が終わった後に起きた出来事も知っている。', 0, '学習データには締め切り（カットオフ）があります。検索機能がなければ、それより後のことは知りません。'], ['同じ質問をすれば、AIは必ず同じ答えを返す。', 0, '言葉を確率で選んでいるので、毎回少し変わります。大事なことは何度か聞いて比べましょう。'], ['AIが出典やURLを挙げていても、実在しないことがある。', 1, '存在しない論文やURLを、もっともらしく作ることがあります。リンクは必ず自分で開いて確かめます。'], ['学習データにかたよりがあると、AIの判断もかたよる。', 1, 'AIはデータの中のかたよりもそのまま学びます。特定の人たちに不利になっていないか確認が必要です。'], ['AIに入力した内容は、どのサービスでも学習に使われない。', 0, 'サービスや設定によって違います。仕事の機密や個人情報を入れる前に、規約と設定を確認しましょう。'], ['自信たっぷりな答えほど、正しい可能性が高い。', 0, '文章の調子と正しさは関係ありません。間違っているときも同じ調子で答えます。'], ['AIが書いたコードは、動いたら安全だと考えてよい。', 0, '動くことと安全なことは別です。APIキーの扱い・権限・入力のチェックは人が確認します。'], ['AIを使って作ったものの責任は、使った人にある。', 1, '公開する・提出する・判断に使うのは人です。最後に確かめる責任も人にあります。']];
const CK = (name, en, desc, prompt, tags) => ({ name, en, desc, prompt, tags, check:true });

TABS.push({ id:'risk', label:'限界と付き合い方', icon:'🧭',
  intro:'AIはとても便利ですが、<b>万能ではなく、間違いもします</b>。大切なのは「信じる／信じない」の二択ではなく、<b>どこを任せて、どこを自分で確かめるか</b>を決めること。しくみを知った今なら、その線引きができます。まずはクイズで、よくある思い込みを確かめましょう。',
  sections:[
    C('触って理解する', [
      { name:'AIの○×クイズ', en:'True or false: how AI really works', h:420, tags:['体験','基本'],
        demo:'<div class="kt"><div class="ab-quiz"><div class="q"></div><div class="ans"><button type="button" class="kt-btn" data-a="1">○ 正しい</button><button type="button" class="kt-btn" data-a="0">× まちがい</button></div><div class="kt-verdict res" style="flex:1"></div><div class="kt-row"><button type="button" class="kt-btn pri nx">次の問題 →</button><span class="sc" style="font-size:12px;color:var(--muted)"></span></div></div></div>',
        init:(el) => { let i = 0, ok = 0, done = false;
          const show = () => { done = false; $(el, '.q').innerHTML = `<small>第 ${i + 1} 問 / ${QUIZ.length}</small>${QUIZ[i][0]}`; verdict($(el, '.res'), '', '○ か × を選んでください。'); $(el, '.sc').textContent = `正解 ${ok} 問`; $(el, '.nx').textContent = i === QUIZ.length - 1 ? '最初からもう一度' : '次の問題 →'; };
          $$(el, '.ans button').forEach(b => b.onclick = () => { if (done) return; done = true; const right = +b.dataset.a === QUIZ[i][1]; if (right) ok++; verdict($(el, '.res'), right ? 'ok' : 'bad', `${right ? '✓ 正解！' : '× ざんねん。'}答えは「<b>${QUIZ[i][1] ? '○ 正しい' : '× まちがい'}</b>」。<br>${QUIZ[i][2]}`); $(el, '.sc').textContent = `正解 ${ok} 問` + (i === QUIZ.length - 1 ? ` ／ ${QUIZ.length} 問中` : ''); });
          $(el, '.nx').onclick = () => { if (i === QUIZ.length - 1){ i = 0; ok = 0; } else i++; show(); }; show(); },
        desc:'8問の○×クイズです。どれも、AIを使い始めた人が思い込みやすい点を集めました。間違えた問題は、この辞典の「文章を作るAI」「評価のしかた」タブに理由が載っています。',
        prompt:'AIを初めて使う人向けに、「AIについてのよくある誤解」を10個挙げて、それぞれ本当はどうなのかを2〜3文で説明して。社内の勉強会で配れるよう、○×クイズの形式にして。' },
    ], null, true),
    { title:'AIの答えを使う前のチェック', note:'チェックを付けながら確認できます（チェックの状態はこのブラウザにだけ保存されます）。', layout:'rows', items:[
      CK('事実は自分で確かめたか', 'Verify facts', '数字・日付・人名・法律・引用は、公式の情報源で確かめる。リンクは実際に開いて、書いてある内容まで見る。', 'さっきの回答のうち、事実として確認が必要な点を箇条書きにして。それぞれ、どこで確かめればよいか（公式サイト・法律の条文・一次資料）も教えて。', ['最重要']),
      CK('入れてはいけない情報を入れていないか', 'Sensitive data', '個人情報・顧客の情報・社外秘・パスワードやAPIキーは、許可された環境以外に入力しない。', 'この文章を外部のAIサービスに入力しても問題ないか確認したい。個人情報や機密にあたりそうな部分を指摘して、伏せ字にした版を作って。'),
      CK('そのまま出して問題ないか', 'Copyright & originality', '他人の文章や絵に似すぎていないか。画像は実在の人物・キャラクター・ロゴが入っていないか。利用規約で商用利用が許されているか。', null),
      CK('かたよりや決めつけがないか', 'Bias check', '性別・年齢・国籍・職業などについて、根拠のない決めつけが入っていないか読み直す。', 'この文章に、特定の人たちへの思い込みや不公平な表現がないか確認して。あれば、言い換えの案を出して。'),
      CK('重要な判断を任せきりにしていないか', 'Human in the loop', '採用・評価・医療・法律・お金に関わる判断は、AIの答えを参考にとどめ、人が最終的に決める。', null, ['最重要']),
      CK('AIを使ったことを伝えるべき場面か', 'Disclosure', '学校の課題・仕事の成果物・公開する記事などは、ルールに従ってAIの利用を明記する。', null),
      CK('別の方法でも確かめたか', 'Cross-check', '大事な内容は、別のAIや検索・詳しい人にも確認する。1つの答えだけで決めない。', '同じ質問に対する別の見方や、反対の意見も挙げて。あなたの最初の回答の弱い点も指摘して。'),
    ] },
    { title:'リスクと対策の早見表', note:'起きやすい問題と、ふだんからできる対策です。',
      table:{ head:['リスク', 'どんなこと', 'ふだんの対策'], rows:[['ハルシネーション', 'もっともらしい間違い・存在しない出典', '資料を渡して答えさせる、出典を確かめる'], ['情報の流出', '入力した機密や個人情報が外に残る', '入力してよい情報を決める、学習に使わない設定・契約を選ぶ'], ['著作権・肖像権', '他人の作品に似る、実在の人物を使う', '利用規約を確認、似すぎていないか見る、人物は許可を取る'], ['かたより（バイアス）', '特定の人たちに不利な判断', '結果を属性ごとに比べる、人が見直す'], ['使いすぎ・任せきり', '自分で考えなくなる、間違いに気づけない', '大事な所は自分で説明できるか確かめる'], ['プロンプトインジェクション', '読み込ませた文書やWebページの中の指示に、AIが従ってしまう', '外部の文章を「命令」として扱わせない、権限を絞る（<a href="security.html">セキュリティ辞典</a>）'], ['なりすまし', '声や顔をまねた詐欺', '声や映像だけで信じず、別の手段で本人に確認する'], ['料金', '使った分だけ課金される', '上限を設定する、小さいモデルから試す（<a href="ai-integration.html#cost">AI組み込み辞典</a>）']] } },
    S('上手に頼むための言い方', [
      T('根拠と確かさを分けて答えさせる', 'Ask for evidence and confidence', '「分かっていること」と「推測」を分けさせると、どこを確かめればよいかが見える。', 'この質問に答えるとき、「確かなこと」「おそらくそうだと思うこと」「分からないこと」の3つに分けて書いて。確かなことには根拠も付けて。', ['おすすめ']),
      T('分からないときは分からないと言わせる', 'Allow "I don\'t know"', '無理に答えを作らせない。', '分からない場合や情報が足りない場合は、推測で埋めずに「分からない」と答えて。追加でどんな情報があれば答えられるかも教えて。'),
      T('資料を渡して、その中から答えさせる', 'Ground the answer in a source', '手元の資料を貼り付けて、根拠にした部分を引用させる。', '以下の資料だけをもとに答えて。資料に書かれていないことは「資料にはありません」と答え、根拠にした部分を引用して。\n\n【資料】'),
      T('反対の立場からも見させる', 'Ask for counterarguments', '自分の考えに合わせた答えばかりにならないようにする。', '私の案に賛成する理由だけでなく、反対する立場からの指摘を3つ挙げて。その中で一番深刻なものはどれかも教えて。'),
      T('手順を見せてもらう', 'Show the steps', '計算や判断は、途中の手順を書かせると間違いを見つけやすい。', '結論だけでなく、そこに至るまでの手順を番号付きで書いて。計算がある場合は式も見せて。'),
      T('自分の言葉で説明し直す', 'Explain it back', 'AIの答えを自分で説明できなければ、まだ理解できていない合図。', '今の説明を、私が理解できているか確かめたい。理解度を確かめる質問を3つ出して。私の答えが間違っていたら、どこが違うかを教えて。'),
    ]),
    S('付き合い方の用語', [
      T('AIリテラシー', 'AI literacy', 'AIのしくみ・得意と苦手・リスクを知ったうえで、適切に使える力。', null, ['基本']),
      T('人による確認', 'Human in the loop', '大事な判断の前に、必ず人が確認・承認する流れを入れること。'),
      T('学習への利用（オプトアウト）', 'Training data opt-out', '入力した内容を、サービスがモデルの改善に使うかどうか。設定や契約で変えられることが多い。'),
      T('説明可能性', 'Explainability', 'AIがなぜその答えを出したかを、人が理解できること。重要な判断ほど求められる。'),
      T('ガードレール', 'Guardrails', 'AIが危険な内容や決まりに反することをしないようにする制限や確認のしくみ。'),
      T('プロンプトインジェクション', 'Prompt injection', '読み込ませた文書やWebページに仕込まれた指示に、AIが従ってしまう攻撃。'),
      T('責任あるAI', 'Responsible AI', '安全・公平・透明・プライバシーに配慮してAIを作り、使おうという考え方。各国でルール作りが進んでいる。'),
      T('シャドーAI', 'Shadow AI', '会社や学校が認めていないAIサービスを、こっそり仕事や課題に使うこと。情報流出の原因になる。'),
    ]),
  ]});
})();
