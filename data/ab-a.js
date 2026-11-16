/* AI・機械学習のしくみ辞典 — A: 共通ヘルパー / AIの地図 / 学習のしくみ / 分ける・まとめる / 評価のしかた */
(function(){
const { $, $$, seg } = KIT;
const S = (title, items, note) => ({ title, note, layout:'rows', items });
const C = (title, items, note, lg) => ({ title, note, layout:lg ? 'cards lg' : 'cards', items });
const T = (name, en, desc, prompt, tags, more) => Object.assign({ name, en, desc, prompt, tags }, more || {});
const verdict = (el, cls, html) => { el.classList.remove('ok', 'bad', 'warn'); if (cls) el.classList.add(cls); el.innerHTML = html; };
const cssv = (el, n) => getComputedStyle(el).getPropertyValue(n).trim();
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const f2 = (n, d = 2) => (Math.round(n * 10 ** d) / 10 ** d).toFixed(d);
const pct = (n) => (isFinite(n) ? Math.round(n * 100) + '%' : '—');
// キャンバス。後からボタンやスライダーが入って枠の大きさが変わったら、解像度を合わせて描き直す（c.redraw）
function cv(el, sel = '.ab-cv'){ const box = $(el, sel), c = Object.assign(VD.canvas(box), { box, ink:cssv(el, '--stage-ink') || '#222', mut:cssv(el, '--muted') || '#888', acc:cssv(el, '--accent') || '#0077b6', bd:cssv(el, '--border') || '#ddd', bad:cssv(el, '--bad') || '#d64545', ok:cssv(el, '--ok') || '#1f9d63' });
  new ResizeObserver(() => { const w = box.clientWidth, h = box.clientHeight; if (!w || !h || (w === c.w && h === c.h)) return; const dpr = Math.min(3, window.devicePixelRatio || 1); c.c.width = Math.round(w * dpr); c.c.height = Math.round(h * dpr); c.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); c.w = w; c.h = h; if (c.redraw) c.redraw(); }).observe(box);
  return c; }
function sliders(box, defs, on){ const st = {}; box.classList.add('ab-ctl');
  box.innerHTML = defs.map(([k, l, a, b, s, v]) => (st[k] = v, `<b>${l}</b><input type="range" min="${a}" max="${b}" step="${s}" value="${v}" data-k="${k}" aria-label="${l}"><output data-o="${k}"></output>`)).join('');
  const show = () => defs.forEach(d => { $(box, `[data-o="${d[0]}"]`).textContent = d[6] ? d[6](st[d[0]]) : st[d[0]]; });
  $$(box, 'input').forEach(i => i.oninput = () => { st[i.dataset.k] = +i.value; show(); if (on) on(st, i.dataset.k); }); show();
  st.set = (k, v) => { st[k] = v; const i = $(box, `[data-k="${k}"]`); if (i) i.value = v; show(); }; return st; }
const pos = (box, e) => { const r = box.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
const dot = (g, x, y, r, col, hollow) => { g.beginPath(); g.arc(x, y, r, 0, 7); if (hollow){ g.strokeStyle = col; g.lineWidth = 2; g.stroke(); } else { g.fillStyle = col; g.fill(); } };
const line = (g, pts) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); };
// 毎回同じ並びになる乱数（種を決めると結果が再現できる）と、正規分布の乱数
const rng = (seed) => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const gauss = (r) => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
const blob = (r, cx, cy, sd, n) => Array.from({ length:n }, () => [clamp(cx + gauss(r) * sd, .03, .97), clamp(cy + gauss(r) * sd, .04, .96)]);
const BLUE = '#2563eb', ORANGE = '#ea580c', COLS = ['#2563eb', '#ea580c', '#16a34a', '#9333ea', '#db2777', '#0891b2'];
window.ABH = { S, C, T, verdict, cssv, clamp, f2, pct, cv, sliders, pos, dot, line, rng, gauss, blob, BLUE, ORANGE, COLS };

/* ================= 1. AIの地図 ================= */
const RINGS = [['AI（人工知能）', '#64748b', 100, '人のように考えているように見える働きをする技術の<b>総称</b>。人がルールを書いたものも含みます（将棋の定跡、カーナビの経路探索、決まった返事をする昔のチャットボット）。'], ['機械学習', '#0ea5e9', 76, 'ルールを人が書くのではなく、<b>たくさんの例（データ）から決まりを見つけさせる</b>方法。迷惑メールの判定、売上の予測、おすすめの表示など。'], ['ディープラーニング', '#8b5cf6', 52, '機械学習のうち、<b>ニューラルネットを何層も重ねた</b>方法。画像・音声・文章のような複雑なデータが得意。顔認証、音声認識、翻訳。'], ['生成AI', '#e11d48', 28, 'ディープラーニングを使って、<b>文章・画像・音声・動画・コードを新しく作る</b>AI。対話AI（ChatGPT・Claude・Gemini など）や画像生成AIがここに入ります。']];
const SPAM = [['無料', '当選', '今すぐ', 'クリック'], ['当選', 'おめでとう', '賞金', '受け取り'], ['今だけ', '無料', 'プレゼント', 'クリック'], ['限定', '副業', '簡単', '稼げる'], ['賞金', '受け取り', '今すぐ', '口座'], ['簡単', '稼げる', '無料', '登録']];
const HAM = [['明日', '会議', '資料', 'お願い'], ['今日', 'ランチ', '行きませんか'], ['資料', '確認', 'ありがとう'], ['会議', '時間', '変更', 'お願い'], ['週末', '映画', '行きませんか'], ['無料', '相談会', 'ご案内']];
const MSGS = [['当選おめでとう！賞金の受け取りはこちら', 1], ['無料相談会のご案内です', 0], ['明日の会議の資料をお願いします', 0], ['簡単に稼げる副業、今すぐ登録', 1]];

TABS.push({ id:'map', label:'AIの地図', icon:'🗺',
  intro:'「AI」という言葉はとても広く、<b>機械学習・ディープラーニング・生成AI</b>はその中の一部です。まずは全体の地図をつかみましょう。大事な考え方は1つだけ：今のAIのほとんどは、人がルールを書くのではなく、<b>たくさんの例から決まりを見つけている</b>ということです。対話AIをアプリに組み込む方法は <a href="ai-integration.html">AI組み込み辞典</a>、道具の選び方は <a href="ai-tools.html">AIツール・モデル辞典</a> へ。',
  sections:[
    C('触って理解する', [
      { name:'AI・機械学習・ディープラーニング・生成AIの関係', en:'AI ⊃ ML ⊃ deep learning ⊃ generative AI', h:440, tags:['基本','体験','最重要'],
        demo:'<div class="kt"><div class="ab-rings"></div><div class="ab-note out"></div></div>',
        init:(el) => { const box = $(el, '.ab-rings'); box.innerHTML = RINGS.map((r, i) => `<div class="ab-ring" data-i="${i}" style="--c:${r[1]};--s:${r[2]}" tabindex="0" role="button">${r[0]}</div>`).join('');
          const pick = (i) => { $$(box, '.ab-ring').forEach((d, j) => d.classList.toggle('on', i === j)); $(el, '.out').innerHTML = `<b style="color:${RINGS[i][1]}">${RINGS[i][0]}</b>：${RINGS[i][3]}`; };
          $$(box, '.ab-ring').forEach(d => { d.onclick = () => pick(+d.dataset.i); d.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); pick(+d.dataset.i); } }; }); pick(3); },
        desc:'4つの言葉は<b>入れ子</b>の関係です（輪を押すと説明が出ます）。ニュースで「AI」と言うとき、今はほとんどが一番内側の<b>生成AI</b>を指しています。ただし、売上の予測や不正の検知など、生成AIではない機械学習も社会のあちこちで使われています。',
        prompt:'「AI」「機械学習」「ディープラーニング」「生成AI」の違いを、中学生にも分かるように、それぞれ身近な例を2つずつ挙げて説明して。入れ子の関係が分かる図も文字で描いて。' },
      { name:'ルールを書く vs データから学ぶ', en:'Hand-written rules vs learning from data', h:540, tags:['体験','最重要'], wide:true,
        demo:'<div class="kt"><input class="ab-in msg" aria-label="判定するメッセージ"><div class="kt-row ex"></div><div class="ab-two"><div><b style="font-size:12px">① 人がルールを書く</b><div class="ab-f">もし 本文に「無料」が<br>含まれていたら → 迷惑メール</div><div class="kt-verdict r1"></div></div><div><b style="font-size:12px">② 12通の例から学ぶ（機械学習）</b><div class="ab-bars w"></div><div class="kt-verdict r2"></div></div></div></div>',
        init:(el) => { const W = {}; SPAM.flat().concat(HAM.flat()).forEach(w => { W[w] = 0; });
          // 言葉ごとに「迷惑メールに出た回数」と「普通のメールに出た回数」を数えて、重みにする
          Object.keys(W).forEach(w => { const s = SPAM.filter(m => m.includes(w)).length, h = HAM.filter(m => m.includes(w)).length; W[w] = Math.log((s + 1) / (h + 1)); });
          const inp = $(el, '.msg'); let truth = null;
          const run = () => { const m = inp.value, rule = m.includes('無料'), hits = Object.keys(W).filter(w => m.includes(w)).sort((a, b) => Math.abs(W[b]) - Math.abs(W[a])).slice(0, 6), score = hits.reduce((s, w) => s + W[w], 0), ml = score > 0;
            const mk = (isSpam) => (truth === null ? '' : (isSpam === !!truth ? '○ 正解　' : '× まちがい　')) + (isSpam ? '<b>迷惑メール</b>と判定' : '<b>普通のメール</b>と判定');
            verdict($(el, '.r1'), truth === null ? '' : (rule === !!truth ? 'ok' : 'bad'), mk(rule));
            $(el, '.w').innerHTML = hits.length ? hits.map(w => `<span>${w}</span><span class="bar"><i class="${W[w] > 0 ? 'neg' : ''}" style="width:${Math.min(100, Math.abs(W[w]) / 1.4 * 100)}%"></i></span><span>${W[w] > 0 ? '+' : ''}${f2(W[w], 1)}</span>`).join('') : '<span style="grid-column:1/-1;color:var(--muted)">知っている言葉が1つもありません</span>';
            verdict($(el, '.r2'), !hits.length ? 'warn' : truth === null ? '' : (ml === !!truth ? 'ok' : 'bad'), hits.length ? mk(ml) + `（重みの合計 ${score > 0 ? '+' : ''}${f2(score, 1)}。赤＝迷惑メール寄り）` : '学習した例にない言葉ばかりなので、<b>判断できません</b>。データにないことは分からないのが機械学習の弱点です。'); };
          $(el, '.ex').innerHTML = MSGS.map((m, i) => `<button type="button" class="kt-btn sm" data-i="${i}">例${i + 1}</button>`).join('') + '<span style="font-size:11px;color:var(--muted)">← 例を押すか、上に自由に入力</span>';
          $$(el, '.ex button').forEach(b => b.onclick = () => { inp.value = MSGS[b.dataset.i][0]; truth = MSGS[b.dataset.i][1]; run(); });
          inp.oninput = () => { truth = null; run(); }; inp.value = MSGS[1][0]; truth = MSGS[1][1]; run(); },
        desc:'これまでのプログラムは、人が「もし〜なら」という<b>ルール</b>を書きました。機械学習は、<b>正解の付いた例</b>をたくさん見せて、言葉ごとの重みを自分で数えさせます。例2では、ルールは「無料」という言葉だけで間違えますが、学習した方は「相談会」「ご案内」が普通のメールに多いことも知っているので正しく判定します。逆に、<b>例にない言葉</b>には弱いことも確かめてみてください。',
        prompt:'問い合わせメールを「至急」「通常」「営業」の3つに自動で振り分けたい。①キーワードのルールで分ける方法と、②AI（LLM）に分類させる方法の、それぞれの良い点・悪い点を表にして。どちらから始めるべきかも教えて。' },
    ], null, true),
    { title:'機械学習の3つのタイプ', note:'「何を手がかりに学ぶか」で大きく3つに分かれます。',
      table:{ head:['タイプ', '学び方', '例'], rows:[['教師あり学習', '<b>正解の付いた例</b>を見て、新しいものの答えを当てる', '迷惑メールの判定、家賃の予測、画像の分類'], ['教師なし学習', '正解なしで、<b>似たもの同士</b>や<b>かたより</b>を見つける', '顧客のグループ分け、異常の検知'], ['強化学習', '試して<b>ごほうび（報酬）</b>が多くなる動きを覚える', 'ゲームのAI、ロボットの制御'], ['自己教師あり学習', 'データ自身から問題を作って学ぶ（文の続きを当てる など）', '対話AI・画像生成AIの事前学習']] } },
    { title:'AIが得意なこと・苦手なこと', note:'道具としての向き不向きを知っておくと、頼み方と確かめ方が変わります。',
      table:{ head:['得意', '苦手・注意'], rows:[['大量の文章を読んで要約・分類・言い換えをする', '事実の正しさの保証（もっともらしい間違いを言う）'], ['下書き・たたき台・アイデアをすばやく出す', '最新のできごと（学習した時点より後は知らない）'], ['決まったパターンのコードや文章を書く', '正確な計算・数え上げ（道具を使わせると改善する）'], ['画像や音声の内容を言葉にする', '学習データにない特殊な社内ルール・専門知識'], ['24時間、同じ調子で繰り返す', '責任を取ること（最後に確かめるのは人）']] } },
    S('まず覚えたい用語', [
      T('AI（人工知能）', 'Artificial Intelligence', '人の知的な働きをコンピューターにさせる技術の総称。決まった定義はなく、時代によって指すものが変わる。', null, ['基本']),
      T('機械学習', 'Machine Learning (ML)', 'データから決まり（パターン）を見つけさせる方法。'),
      T('ディープラーニング（深層学習）', 'Deep Learning', '何層ものニューラルネットを使う機械学習。'),
      T('生成AI', 'Generative AI', '文章・画像・音声・動画・コードなどを新しく作るAI。'),
      T('モデル', 'Model', '学習の結果できあがった「入力→出力の計算のかたまり」。AIの本体。'),
      T('学習（訓練）', 'Training', 'データを見せて、モデルの中の数字（パラメータ）を調整すること。時間とお金がかかる。'),
      T('推論', 'Inference', '学習済みのモデルを使って答えを出すこと。私たちがAIを「使う」のはこちら。'),
      T('データセット', 'Dataset', '学習や評価に使うデータの集まり。'),
      T('特徴量', 'Feature', '予測の手がかりにする項目（広さ・築年数・駅からの距離 など）。'),
      T('ラベル', 'Label', '例に付けた正解（迷惑メール／普通、犬／猫）。'),
      T('パラメータ', 'Parameters', 'モデルの中の調整できる数字。大きな対話AIでは数千億個以上ある。'),
      T('基盤モデル', 'Foundation model', '大量のデータで学習し、いろいろな用途に使える大きなモデル。'),
      T('AGI', 'Artificial General Intelligence', '人と同じように何でもこなせるAIという考え方。定義も実現時期も、専門家の間で意見が分かれている。', null, ['言葉に注意']),
    ]),
  ]});

/* ================= 2. 学習のしくみ ================= */
// 最小二乗法で多項式を当てはめる（x は −1〜1 に直して計算を安定させる）
function polyfit(P, d){ const n = d + 1, A = Array.from({ length:n }, () => new Array(n + 1).fill(0));
  P.forEach(([x, y]) => { const u = x * 2 - 1, pw = [1]; for (let i = 1; i <= 2 * d; i++) pw.push(pw[i - 1] * u); for (let i = 0; i < n; i++){ for (let j = 0; j < n; j++) A[i][j] += pw[i + j]; A[i][n] += pw[i] * y; } });
  for (let i = 0; i < n; i++){ A[i][i] += 1e-9; let p = i; for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r; [A[i], A[p]] = [A[p], A[i]]; for (let r = 0; r < n; r++){ if (r === i) continue; const f = A[r][i] / A[i][i]; for (let k = i; k <= n; k++) A[r][k] -= f * A[i][k]; } }
  const co = A.map((r, i) => r[n] / r[i]); return (x) => { const u = x * 2 - 1; let s = 0, p = 1; for (const cf of co){ s += cf * p; p *= u; } return s; }; }

TABS.push({ id:'learn', label:'学習のしくみ', icon:'📈',
  intro:'機械学習の「学習」は、難しそうに聞こえますが、やっていることは<b>「予測と正解のずれ（誤差）を小さくするように、数字を少しずつ調整する」</b>のくり返しです。直線を1本引く例で、その流れを最後まで追ってみましょう。大きな対話AIも、規模が違うだけで同じ考え方で学習しています。',
  sections:[
    C('触って理解する', [
      { name:'直線を当てはめる（回帰）', en:'Linear regression', h:520, tags:['基本','体験','最重要'],
        demo:'<div class="kt"><div class="ab-cv"><span class="tip">クリックで点を追加</span></div><div class="sl"></div><div class="kt-row"><button type="button" class="kt-btn pri fit">▶ 学習させる</button><button type="button" class="kt-btn sm rs">最初から</button></div><div class="ab-f out"></div></div>',
        init:(el) => { const c = cv(el), g = c.ctx; let P, run = false;
          const seed = () => { const r = rng(7); P = Array.from({ length:14 }, () => { const x = .08 + r() * .84; return [x, clamp(.15 + x * .6 + (r() - .5) * .22, .03, .97)]; }); };
          const st = sliders($(el, '.sl'), [['a', '傾き', -1, 2, .01, 0], ['b', '切片', -.5, 1, .01, .5]], () => { run = false; draw(); });
          const X = (x) => 30 + x * (c.w - 42), Y = (y) => c.h - 22 - y * (c.h - 34), err = () => P.reduce((s, p) => s + (st.a * p[0] + st.b - p[1]) ** 2, 0) / P.length;
          const draw = () => { g.clearRect(0, 0, c.w, c.h); g.strokeStyle = c.bd; g.lineWidth = 1; g.beginPath(); g.moveTo(X(0), Y(1)); g.lineTo(X(0), Y(0)); g.lineTo(X(1), Y(0)); g.stroke(); g.fillStyle = c.mut; g.font = '10px sans-serif'; g.fillText('広さ →', c.w - 46, c.h - 6); g.fillText('家賃 ↑', 4, 12);
            g.strokeStyle = c.bad; g.lineWidth = 1; g.globalAlpha = .6; P.forEach(p => { g.beginPath(); g.moveTo(X(p[0]), Y(p[1])); g.lineTo(X(p[0]), Y(st.a * p[0] + st.b)); g.stroke(); }); g.globalAlpha = 1;
            g.save(); g.beginPath(); g.rect(X(0), Y(1), X(1) - X(0), Y(0) - Y(1)); g.clip(); g.strokeStyle = c.acc; g.lineWidth = 3; line(g, [[X(0), Y(st.b)], [X(1), Y(st.a + st.b)]]); g.restore(); P.forEach(p => dot(g, X(p[0]), Y(p[1]), 5, c.ink));
            $(el, '.out').innerHTML = `予測する式：家賃 = <b>${f2(st.a)}</b> × 広さ + <b>${f2(st.b)}</b>\n誤差（赤い線の長さの2乗の平均）= <b>${f2(err() * 100, 1)}</b>${run ? '　…学習中' : ''}`; };
          c.box.addEventListener('pointerdown', (e) => { const [x, y] = pos(c.box, e); P.push([clamp((x - 30) / (c.w - 42), 0, 1), clamp((c.h - 22 - y) / (c.h - 34), 0, 1)]); draw(); });
          $(el, '.fit').onclick = () => { run = true; }; $(el, '.rs').onclick = () => { run = false; seed(); st.set('a', 0); st.set('b', .5); draw(); };
          seed(); c.redraw = draw; draw();
          // 学習：誤差が小さくなる向きへ、傾きと切片を少しずつ動かす（勾配降下法）
          return VD.loop(c.box, () => { if (!run) return; let da = 0, db = 0; for (let k = 0; k < 1; k++){ da = 0; db = 0; P.forEach(p => { const d = st.a * p[0] + st.b - p[1]; da += 2 * d * p[0] / P.length; db += 2 * d / P.length; }); st.set('a', clamp(st.a - .35 * da, -1, 2)); st.set('b', clamp(st.b - .35 * db, -.5, 1)); } if (Math.abs(da) + Math.abs(db) < .0015) run = false; draw(); }); },
        desc:'点は「部屋の広さと家賃」のデータ、線はAIの<b>予測</b>です。スライダーで線を動かすと、点とのずれ（赤い線）＝<b>誤差</b>が変わります。「学習させる」を押すと、誤差が小さくなる向きへ傾きと切片が少しずつ自動で動きます。これが<b>学習</b>の正体。数字で値を当てる問題を<b>回帰</b>と呼びます。',
        prompt:'この売上データ（CSV）で、広告費から売上を予測する線形回帰を Python（scikit-learn）で作って。散布図に予測の直線を重ねて表示し、「広告費を1万円増やすと売上がいくら増える見込みか」を文章で説明して。' },
      { name:'坂を下って答えを探す（勾配降下法）', en:'Gradient descent & learning rate', h:480, tags:['体験'],
        demo:'<div class="kt"><div class="ab-cv"></div><div class="sl"></div><div class="kt-row"><button type="button" class="kt-btn pri go">▶ スタート</button></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const c = cv(el), g = c.ctx, f = (w) => (w - 1) ** 2, W0 = -1.7; let tr = [W0], on = false, acc = 0;
          const st = sliders($(el, '.sl'), [['lr', '学習率（1歩の大きさ）', .02, 1.1, .01, .2]], () => { tr = [W0]; on = false; draw(); });
          const X = (w) => 10 + (w + 2.2) / 6.4 * (c.w - 20), Y = (v) => c.h - 18 - Math.min(v, 11) / 11 * (c.h - 34);
          const draw = () => { g.clearRect(0, 0, c.w, c.h); g.strokeStyle = c.bd; g.lineWidth = 2; const cur = []; for (let w = -2.2; w <= 4.2; w += .05) cur.push([X(w), Y(f(w))]); line(g, cur); g.fillStyle = c.mut; g.font = '10px sans-serif'; g.fillText('誤差 ↑', 6, 12); g.fillText('← モデルの数字（重み）→', c.w / 2 - 60, c.h - 4); g.fillText('ここが一番小さい', X(1) - 40, Y(0) + 14);
            g.strokeStyle = c.acc; g.lineWidth = 1.5; line(g, tr.map(w => [X(clamp(w, -2.2, 4.2)), Y(f(w))])); tr.forEach((w, i) => dot(g, X(clamp(w, -2.2, 4.2)), Y(f(w)), i === tr.length - 1 ? 7 : 3.5, i === tr.length - 1 ? c.bad : c.acc));
            const w = tr[tr.length - 1], n = tr.length - 1, done = Math.abs(w - 1) < .02, out = Math.abs(w) > 6;
            verdict($(el, '.res'), out ? 'bad' : done ? 'ok' : st.lr >= 1 ? 'bad' : '', `${n} 歩目　誤差 = <b>${f2(f(w))}</b>　` + (out ? '❌ 学習率が大きすぎて、谷を飛び越えるたびに遠ざかっています（<b>発散</b>）。' : done ? `✓ ${n} 歩で谷の底に着きました。${st.lr < .08 ? '学習率が小さいと、着くまでに時間がかかります。' : ''}` : st.lr >= 1 ? '学習率が大きすぎて、谷の両側を行ったり来たりしています。' : '坂の傾きを見て、下る向きに「傾き × 学習率」だけ進みます。')); };
          $(el, '.go').onclick = () => { tr = [W0]; on = true; acc = 0; draw(); }; c.redraw = draw; draw();
          return VD.loop(c.box, (dt) => { if (!on) return; acc += dt; if (acc < .22) return; acc = 0; const w = tr[tr.length - 1]; tr.push(w - st.lr * 2 * (w - 1)); if (Math.abs(tr[tr.length - 1] - 1) < .02 || Math.abs(tr[tr.length - 1]) > 6 || tr.length > 40) on = false; draw(); }); },
        desc:'学習は、霧の中で<b>足元の傾きだけを頼りに谷底を目指す</b>ようなものです。1歩の大きさを決めるのが<b>学習率</b>。小さすぎるといつまでも着かず、大きすぎると谷を飛び越えて行ったり来たりし、さらに大きいとどんどん遠ざかります。スライダーを 0.05・0.5・1.05 にして比べてみてください。',
        prompt:'機械学習の「学習率」が大きすぎる場合と小さすぎる場合に何が起きるかを、図に描けるような例えで説明して。学習がうまく進んでいないときに、損失のグラフのどこを見れば分かるかも教えて。' },
      { name:'覚えすぎると外れる（過学習）', en:'Overfitting vs underfitting', h:520, tags:['体験','最重要'],
        demo:'<div class="kt"><div class="ab-cv"></div><div class="sl"></div><div class="ab-kpi k"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const c = cv(el), g = c.ctx, tru = (x) => .5 + .32 * Math.sin(x * 5.6), mk = (sd, n) => { const r = rng(sd); return Array.from({ length:n }, () => { const x = .04 + r() * .92; return [x, tru(x) + gauss(r) * .07]; }); }, TR = mk(3, 10), TE = mk(11, 12);
          const st = sliders($(el, '.sl'), [['d', 'モデルの複雑さ（式の次数）', 1, 9, 1, 3]], () => draw());
          const X = (x) => 10 + x * (c.w - 20), Y = (y) => c.h - 10 - y * (c.h - 20), rmse = (f, P) => Math.sqrt(P.reduce((s, p) => s + (f(p[0]) - p[1]) ** 2, 0) / P.length);
          const draw = () => { const f = polyfit(TR, st.d), a = rmse(f, TR), b = rmse(f, TE); g.clearRect(0, 0, c.w, c.h);
            g.strokeStyle = c.mut; g.setLineDash([4, 5]); g.lineWidth = 1.5; const t = []; for (let x = 0; x <= 1.001; x += .01) t.push([X(x), Y(tru(x))]); line(g, t); g.setLineDash([]);
            g.strokeStyle = c.acc; g.lineWidth = 3; const p = []; for (let x = 0; x <= 1.001; x += .005) p.push([X(x), Y(clamp(f(x), -.3, 1.3))]); line(g, p);
            TE.forEach(q => dot(g, X(q[0]), Y(q[1]), 5, ORANGE, true)); TR.forEach(q => dot(g, X(q[0]), Y(q[1]), 5, c.ink));
            g.fillStyle = c.mut; g.font = '10px sans-serif'; g.fillText('● 学習に使った点　○ 初めて見る点（テスト）　点線 = 本当の関係', 8, 12);
            $(el, '.k').innerHTML = `<div>学習データの誤差<b>${f2(a * 100, 1)}</b></div><div>テストの誤差<b>${f2(b * 100, 1)}</b></div><div>テスト ÷ 学習<b>${a < .0005 ? '∞' : f2(b / a, 1) + '倍'}</b></div><div>調整できる数字<b>${st.d + 1}個</b></div>`;
            const over = st.d >= 6 && b > a * 2.5, under = a > .1;
            verdict($(el, '.res'), over ? 'bad' : under ? 'warn' : 'ok', over ? '❌ <b>過学習</b>：学習に使った点にはぴったりなのに、初めて見る点では大きく外れます。点の<b>たまたまのゆれ</b>まで覚えてしまいました。' : under ? '単純すぎて、学習に使った点にも合っていません（<b>未学習</b>）。' : '✓ ちょうどよい複雑さ。初めて見る点にもよく合っています（<b>汎化</b>できている）。'); };
          c.redraw = draw; draw(); },
        desc:'モデルを複雑にするほど、<b>学習に使ったデータ</b>にはよく合います。でも、複雑にしすぎると、データのたまたまのゆれまで丸暗記してしまい、<b>初めて見るデータ</b>で外れます。これが<b>過学習</b>。だからデータを「学習用」と「テスト用」に分け、<b>テスト用での成績</b>で良し悪しを決めます。次数を 1 → 3 → 9 と動かしてみてください。',
        prompt:'機械学習のモデルで、学習データでは正解率98%なのにテストデータでは70%しか出ない。過学習だと思うので、考えられる原因と対策（データを増やす・モデルを単純にする・正則化・早期終了 など）を、試しやすい順に教えて。' },
    ], null, true),
    S('学習の用語', [
      T('回帰', 'Regression', '数値を予測する問題（家賃・売上・気温）。', null, ['基本']),
      T('損失（誤差）', 'Loss', '予測と正解のずれを1つの数字にしたもの。学習はこれを小さくする作業。'),
      T('勾配降下法', 'Gradient descent', '損失が小さくなる向きへ、パラメータを少しずつ動かす方法。'),
      T('学習率', 'Learning rate', '1回の更新でどれだけ動かすか。大きすぎると不安定、小さすぎると遅い。'),
      T('エポック', 'Epoch', '学習データ全体を1周すること。何周もくり返して学習する。'),
      T('バッチ', 'Batch', '一度にまとめて計算するデータのかたまり。'),
      T('過学習', 'Overfitting', '学習データを覚えすぎて、新しいデータで外れること。', null, ['最重要']),
      T('未学習', 'Underfitting', 'モデルが単純すぎて、学習データにも合わないこと。'),
      T('汎化', 'Generalization', '初めて見るデータにも当てはまること。機械学習のゴール。'),
      T('学習・検証・テストデータ', 'Train / validation / test split', '学習に使う分、調整の確認に使う分、最後の成績を測る分に分ける。テスト用は学習に絶対に混ぜない。'),
      T('正則化', 'Regularization', 'モデルが複雑になりすぎないよう、ブレーキをかける工夫。'),
      T('ハイパーパラメータ', 'Hyperparameter', '学習の前に人が決める設定（学習率・層の数・木の深さ）。'),
      T('ベースライン', 'Baseline', '比べるための単純な方法（いつも平均を答える、など）。これに勝てなければ意味がない。'),
      T('データリーク', 'Data leakage', '本番では手に入らない情報や、テスト用のデータが学習にまぎれ込むこと。成績が不自然に良くなる。', null, ['よくある失敗']),
    ]),
  ]});

/* ================= 3. 分ける・まとめる ================= */
TABS.push({ id:'classify', label:'分ける・まとめる', icon:'🧩',
  intro:'「これは犬？猫？」のように<b>種類を当てる</b>のが分類、正解なしで<b>似たもの同士をまとめる</b>のがクラスタリングです。どちらも、データを点として並べて「近いものは似ている」と考えるのが基本。点を足したり設定を変えたりして、境界線やグループがどう変わるか確かめましょう。',
  sections:[
    C('触って理解する', [
      { name:'境界線を引く（分類）', en:'Classification with k-nearest neighbors', h:520, tags:['基本','体験','最重要'],
        demo:'<div class="kt"><span class="sw"></span><div class="ab-cv"><span class="tip">クリックで点を追加</span></div><div class="sl"></div><div class="ab-f out"></div></div>',
        init:(el) => { let cls = 0; const c = cv(el), g = c.ctx, r = rng(5), P = blob(r, .36, .6, .13, 18).map(p => [p[0], p[1], 0]).concat(blob(r, .64, .4, .13, 18).map(p => [p[0], p[1], 1]));
          const st = sliders($(el, '.sl'), [['k', '多数決に使う近くの点の数 k', 1, 15, 2, 3]], () => draw());
          const vote = (x, y) => { const d = P.map(p => [(p[0] - x) ** 2 + ((p[1] - y) * c.h / c.w) ** 2, p[2]]).sort((a, b) => a[0] - b[0]); let s = 0; for (let i = 0; i < Math.min(st.k, d.length); i++) s += d[i][1]; return s * 2 > Math.min(st.k, d.length) ? 1 : 0; };
          const draw = () => { g.clearRect(0, 0, c.w, c.h); const G = 10; g.globalAlpha = .2; for (let x = 0; x < c.w; x += G) for (let y = 0; y < c.h; y += G){ g.fillStyle = vote((x + G / 2) / c.w, (y + G / 2) / c.h) ? ORANGE : BLUE; g.fillRect(x, y, G, G); } g.globalAlpha = 1;
            P.forEach(p => { dot(g, p[0] * c.w, p[1] * c.h, 5.5, p[2] ? ORANGE : BLUE); g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.stroke(); });
            $(el, '.out').innerHTML = `新しい点は、<b>近くの ${st.k} 個</b>の多数決で色を決めます（背景の色 = その場所に来た点の予測）。\n${st.k === 1 ? 'k = 1：1個ずつの点に引っぱられて、境界がガタガタ（過学習ぎみ）。' : st.k >= 11 ? 'k が大きい：境界はなめらかだが、細かい違いを無視しがち。' : 'k を 1 と 15 に動かして、境界の形を比べてみましょう。'}`; };
          c.box.addEventListener('pointerdown', (e) => { const [x, y] = pos(c.box, e); P.push([x / c.w, y / c.h, cls]); draw(); });
          c.redraw = draw; $(el, '.sw').replaceWith(seg(['青い点を追加', 'オレンジの点を追加'], i => { cls = i; }).el); draw(); },
        desc:'青とオレンジの点が「正解の付いた例」です。新しい点がどちらの色かを当てるために、AIは<b>境界線</b>を引きます。ここでは一番分かりやすい「近くの k 個の多数決（k近傍法）」を使っています。相手の色の中に点を1つ置いて、k = 1 と k = 15 で境界がどう変わるか見てください。<b>1個の変な点に振り回されるかどうか</b>が変わります。',
        prompt:'顧客データ（年齢・利用回数・最終利用日からの日数）から「来月解約しそうか」を予測する分類モデルを Python で作りたい。まず単純な方法（ロジスティック回帰・決定木）から試し、正解率だけでなく適合率と再現率も表示して。どの項目が効いているかも見せて。' },
      { name:'似たもの同士をまとめる（クラスタリング）', en:'k-means clustering', h:500, tags:['体験'],
        demo:'<div class="kt"><div class="ab-cv"></div><div class="sl"></div><div class="kt-row"><button type="button" class="kt-btn pri one">1歩進める</button><button type="button" class="kt-btn au">▶ 自動で最後まで</button><button type="button" class="kt-btn sm rs">最初から</button></div><div class="ab-f out"></div></div>',
        init:(el) => { const c = cv(el), g = c.ctx, r0 = rng(21), P = blob(r0, .25, .3, .09, 20).concat(blob(r0, .72, .32, .1, 22), blob(r0, .5, .75, .1, 22)); let cen, as, phase, n, auto = false, acc = 0, seedN = 1;
          const st = sliders($(el, '.sl'), [['k', 'グループの数 k', 2, 6, 1, 3]], () => reset());
          const reset = () => { const r = rng(seedN++ * 13 + st.k); cen = Array.from({ length:st.k }, () => [.15 + r() * .7, .15 + r() * .7]); as = P.map(() => -1); phase = 0; n = 0; auto = false; draw('最初は、グループの中心（★）を<b>でたらめな場所</b>に置きます。'); };
          const step = () => { if (phase === 0){ let ch = 0; P.forEach((p, i) => { let b = 0, bd = 9; cen.forEach((q, j) => { const d = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2; if (d < bd){ bd = d; b = j; } }); if (as[i] !== b) ch++; as[i] = b; }); phase = 1; n++; if (!ch){ auto = false; draw(`✓ もう色が変わる点がありません。<b>${n - 1} 回</b>のくり返しでまとまりました。`); return false; } draw(`① 各点を、<b>一番近い中心</b>の色にする（${ch} 個の点の色が変わりました）`); }
            else { cen.forEach((q, j) => { const m = P.filter((p, i) => as[i] === j); if (m.length){ q[0] = m.reduce((s, p) => s + p[0], 0) / m.length; q[1] = m.reduce((s, p) => s + p[1], 0) / m.length; } }); phase = 0; draw('② 中心を、同じ色の点の<b>真ん中（平均）</b>へ動かす'); } return true; };
          const draw = (msg) => { g.clearRect(0, 0, c.w, c.h); P.forEach((p, i) => dot(g, p[0] * c.w, p[1] * c.h, 5, as[i] < 0 ? c.mut : COLS[as[i]])); cen.forEach((q, j) => { g.font = '700 24px sans-serif'; g.textAlign = 'center'; g.fillStyle = COLS[j]; g.strokeStyle = '#fff'; g.lineWidth = 3; g.strokeText('★', q[0] * c.w, q[1] * c.h + 8); g.fillText('★', q[0] * c.w, q[1] * c.h + 8); g.textAlign = 'left'; }); if (msg) $(el, '.out').innerHTML = msg; };
          $(el, '.one').onclick = () => { auto = false; step(); }; $(el, '.au').onclick = () => { auto = true; acc = 1; }; $(el, '.rs').onclick = reset; c.redraw = () => draw(); reset();
          return VD.loop(c.box, (dt) => { if (!auto) return; acc += dt; if (acc > .5){ acc = 0; step(); } }); },
        desc:'今度は点に<b>正解（色）がありません</b>。k-means は「①各点を一番近い中心の色にする → ②中心を同じ色の点の真ん中へ動かす」を、変化がなくなるまでくり返して、似た点同士をグループにします。顧客のタイプ分けや、アンケートの回答の整理に使われます。<b>グループの数 k は人が決める</b>点と、最初の中心の置き方で結果が変わることがある点に注意。',
        prompt:'ECサイトの購入データ（購入回数・平均単価・最終購入からの日数）で、顧客をいくつかのタイプに分けたい。k-means でクラスタリングし、適切なグループ数の決め方（エルボー法）と、各グループの特徴を「〇〇タイプ」と名前を付けて説明して。' },
    ], null, true),
    { title:'やりたいことから選ぶ', note:'機械学習でよく出てくる問題の種類です。「AIに何をさせたいか」を言葉にする手がかりになります。',
      table:{ head:['やりたいこと', '呼び名', '例'], rows:[['種類を当てたい', '分類', '迷惑メール、画像の中身、解約しそうな人'], ['数値を当てたい', '回帰', '売上・家賃・来客数の予測'], ['似たもの同士に分けたい', 'クラスタリング', '顧客のタイプ分け'], ['いつもと違うものを見つけたい', '異常検知', '不正な取引、機械の故障の前ぶれ'], ['好みに合うものを出したい', '推薦', 'おすすめの商品・動画'], ['この先の動きを知りたい', '時系列予測', '来月の需要、在庫'], ['たくさんの項目を少なくまとめたい', '次元削減', 'アンケート結果を2次元の地図にする'], ['新しく作りたい', '生成', '文章・画像・音声・コード']] } },
    S('分類とクラスタリングの用語', [
      T('分類', 'Classification', 'あらかじめ決めた種類（クラス）のどれかを当てる問題。', null, ['基本']),
      T('決定境界', 'Decision boundary', 'クラスを分ける境目。モデルが学習で引く線。'),
      T('k近傍法', 'k-nearest neighbors (k-NN)', '近くの k 個の例の多数決で決める、一番素朴な方法。'),
      T('ロジスティック回帰', 'Logistic regression', '「その種類である確率」を出す基本の分類方法。名前は回帰だが分類に使う。'),
      T('決定木', 'Decision tree', '「広さは50㎡以上？」のような質問を順にたどって決める方法。理由が読みやすい。'),
      T('ランダムフォレスト', 'Random forest', 'たくさんの決定木の多数決。表のデータで安定して強い。'),
      T('勾配ブースティング', 'Gradient boosting (XGBoost / LightGBM)', '前の木の間違いを次の木が直していく方法。表のデータの定番。', null, ['定番']),
      T('クラスタリング', 'Clustering', '正解なしで、似たデータをグループにまとめること。'),
      T('k-means', 'k-means', '中心を動かしながら k 個のグループを作るクラスタリングの定番。'),
      T('次元削減', 'Dimensionality reduction (PCA / t-SNE / UMAP)', 'たくさんの項目を、特徴を保ったまま少ない数にまとめる。地図のように見せるときに使う。'),
      T('異常検知', 'Anomaly detection', 'ほかと大きく違うデータを見つけること。'),
      T('特徴量エンジニアリング', 'Feature engineering', '予測の手がかりになる項目を作ること（日付→曜日、住所→最寄り駅までの距離）。'),
    ]),
  ]});

/* ================= 4. 評価のしかた ================= */
const SCN = [{ pos:'迷惑メール', neg:'普通のメール', fp:'大事なメールが迷惑フォルダへ', fn:'迷惑メールが受信箱に届く', tip:'大事なメールを見逃すと困るので、<b>しきい値を高め</b>にして「迷惑メールと決めつける間違い」を減らします（適合率を重視）。' }, { pos:'病気あり', neg:'病気なし', fp:'健康な人を再検査に呼ぶ', fn:'病気を見逃す', tip:'見逃しが一番こわいので、<b>しきい値を低め</b>にして、あやしい人を広く拾います（再現率を重視）。再検査が増えるのは受け入れます。' }];

TABS.push({ id:'eval', label:'評価のしかた', icon:'🎯',
  intro:'AIの成績を「正解率 95%」とだけ聞いて安心するのは危険です。<b>どんな間違い方をしているか</b>で、使えるかどうかが決まります。間違いには「あるのに見逃す」と「ないのに騒ぐ」の2種類があり、どちらを減らすべきかは使い道しだい。しきい値を動かして、2つの間違いが入れ替わる様子を見てみましょう。',
  sections:[
    C('触って理解する', [
      { name:'しきい値と混同行列', en:'Threshold & confusion matrix', h:580, tags:['体験','最重要'], wide:true,
        demo:'<div class="kt"><span class="sw"></span><div class="ab-two"><div><div class="ab-cv"></div><div class="sl"></div></div><div><div class="ab-cm cm"></div><div class="ab-kpi k"></div><div class="kt-verdict res"></div></div></div></div>',
        init:(el) => { let sc = 0; const c = cv(el), g = c.ctx, r = rng(9), D = Array.from({ length:30 }, () => [clamp(.66 + gauss(r) * .15, .02, .98), 1]).concat(Array.from({ length:70 }, () => [clamp(.36 + gauss(r) * .15, .02, .98), 0]));
          const st = sliders($(el, '.sl'), [['t', 'しきい値', .05, .95, .01, .5]], () => draw());
          const draw = () => { const S0 = SCN[sc], X = (s) => 8 + s * (c.w - 16), mid = c.h / 2; g.clearRect(0, 0, c.w, c.h); g.fillStyle = c.bad; g.globalAlpha = .08; g.fillRect(X(st.t), 0, c.w, c.h); g.globalAlpha = 1;
            const stack = {}; D.forEach(([s, y]) => { const b = Math.round(s * 34), key = b + '_' + y, n = (stack[key] = (stack[key] || 0) + 1), hit = s >= st.t; dot(g, X(b / 34), y ? mid - 8 - n * 9 : mid + 8 + n * 9, 3.8, y ? c.bad : BLUE, hit !== !!y); });
            g.strokeStyle = c.bd; g.lineWidth = 1; g.beginPath(); g.moveTo(0, mid); g.lineTo(c.w, mid); g.stroke(); g.strokeStyle = c.ink; g.lineWidth = 2; g.setLineDash([5, 4]); g.beginPath(); g.moveTo(X(st.t), 0); g.lineTo(X(st.t), c.h); g.stroke(); g.setLineDash([]);
            g.fillStyle = c.mut; g.font = '10px sans-serif'; g.fillText(`本当は「${S0.pos}」`, 6, 12); g.fillText(`本当は「${S0.neg}」`, 6, c.h - 6); g.fillText('AIの点数 低い ← → 高い', c.w - 126, mid - 3); g.fillText('白抜き = AIの間違い', c.w - 104, 12);
            const TP = D.filter(d => d[1] && d[0] >= st.t).length, FN = 30 - TP, FP = D.filter(d => !d[1] && d[0] >= st.t).length, TN = 70 - FP, pr = TP / (TP + FP), rc = TP / 30;
            $(el, '.cm').innerHTML = `<div class="h"></div><div class="h">AI「${S0.pos}」</div><div class="h">AI「${S0.neg}」</div><div class="h">本当は<br>${S0.pos}</div><div class="c ok">当たり<b>${TP}</b></div><div class="c ng">見逃し<b>${FN}</b>${S0.fn}</div><div class="h">本当は<br>${S0.neg}</div><div class="c ng">空振り<b>${FP}</b>${S0.fp}</div><div class="c ok">当たり<b>${TN}</b></div>`;
            $(el, '.k').innerHTML = `<div>正解率<b>${pct((TP + TN) / 100)}</b></div><div>適合率<b>${pct(pr)}</b></div><div>再現率<b>${pct(rc)}</b></div><div>F1<b>${isFinite(2 * pr * rc / (pr + rc)) ? f2(2 * pr * rc / (pr + rc)) : '—'}</b></div>`;
            verdict($(el, '.res'), '', `<b>適合率</b>＝AIが「${S0.pos}」と言ったうち本当だった割合。<b>再現率</b>＝本当の「${S0.pos}」のうち見つけられた割合。<br>${S0.tip}`); };
          c.redraw = draw; $(el, '.sw').replaceWith(seg(['迷惑メールの判定', '病気の検査'], i => { sc = i; draw(); }).el); },
        desc:'AIは多くの場合、「はい／いいえ」ではなく<b>点数（確率）</b>を出します。どこから「はい」とするかの線が<b>しきい値</b>。しきい値を上げると「空振り」が減って「見逃し」が増え、下げるとその逆になります。<b>両方を同時にゼロにはできません</b>。4つのマス（混同行列）を見て、自分の使い道ではどちらの間違いが困るかで決めます。',
        prompt:'この分類モデルの評価結果について、混同行列を表示し、正解率・適合率・再現率・F1 を計算して。今回は「見逃し」を減らしたいので、再現率が90%以上になるしきい値を探して、そのとき適合率がどこまで下がるかも教えて。' },
      { name:'正解率99%でも役に立たない', en:'Accuracy paradox with imbalanced data', h:470, tags:['体験','よくある失敗'],
        demo:'<div class="kt"><div class="ab-cv"></div><div class="sl"></div><div class="ab-kpi k"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const c = cv(el), g = c.ctx, r = rng(4), ORD = Array.from({ length:1000 }, (_, i) => [r(), i]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
          const st = sliders($(el, '.sl'), [['p', '不正な取引の割合', .5, 30, .5, 1, (v) => v + '%']], () => draw());
          const draw = () => { const n = Math.round(st.p * 10), bad = new Set(ORD.slice(0, n)), cols = 50, sx = (c.w - 12) / cols, sy = (c.h - 12) / 20, rad = Math.max(1.6, Math.min(sx, sy) * .32); g.clearRect(0, 0, c.w, c.h);
            for (let i = 0; i < 1000; i++) dot(g, 6 + (i % cols + .5) * sx, 6 + (Math.floor(i / cols) + .5) * sy, bad.has(i) ? rad * 1.5 : rad, bad.has(i) ? c.bad : c.bd);
            $(el, '.k').innerHTML = `<div>取引の数<b>1,000</b></div><div>不正（赤）<b>${n}</b></div><div>正解率<b>${f2(100 - st.p, 1)}%</b></div><div>見つけた不正<b>0 / ${n}</b></div>`;
            verdict($(el, '.res'), 'bad', `このAIは<b>何も考えず、全部に「正常」と答えている</b>だけです。それでも正解率は <b>${f2(100 - st.p, 1)}%</b>。一方、不正は<b>1件も見つけていません</b>（再現率 0%）。めったに起きないことを見つけたいときは、正解率ではなく再現率と適合率を見ます。`); };
          c.redraw = draw; draw(); },
        desc:'不正な取引・病気・故障のように、<b>めったに起きないこと</b>を見つけるAIでは、正解率は当てになりません。1,000件中10件しかない不正を1件も見つけなくても、「全部正常」と答えれば正解率は99%になるからです。数字を聞いたら、<b>「何もしない場合と比べてどれくらい良いのか」</b>を必ず確かめましょう。',
        prompt:'不正検知のモデルを作ったら正解率が99.2%と出た。でも不正はデータ全体の0.8%しかない。この数字が意味を持つかどうかを確認するために、見るべき指標と、不均衡なデータで学習するときの対策（重み付け・サンプリング・しきい値の調整）を教えて。' },
    ], null, true),
    { title:'指標の使い分け', note:'「どの間違いが困るか」から、見る数字を選びます。',
      table:{ head:['指標', '意味', '重視する場面'], rows:[['正解率', '全体のうち当たった割合', '種類の数がほぼ同じで、どの間違いも同じくらい困るとき'], ['適合率', 'AIが「はい」と言ったうち、本当だった割合', '空振りが困るとき（迷惑メール判定、おすすめ表示）'], ['再現率', '本当の「はい」のうち、見つけられた割合', '見逃しが困るとき（病気の検査、不正検知、危険物）'], ['F1', '適合率と再現率のバランスを1つの数字に', '両方をそこそこ保ちたいとき'], ['AUC', 'しきい値を全部動かしたときの総合的な見分ける力', 'モデル同士を比べるとき'], ['誤差（MAE・RMSE）', '予測の数値が平均でどれくらいずれるか', '売上・気温など数値を当てるとき']] } },
    S('評価の用語', [
      T('混同行列', 'Confusion matrix', '「本当」と「AIの答え」の組み合わせを数えた表。当たり2種類と間違い2種類が分かる。', null, ['最重要']),
      T('偽陽性（空振り）', 'False positive', '本当は違うのに「はい」と答えた間違い。'),
      T('偽陰性（見逃し）', 'False negative', '本当はそうなのに「いいえ」と答えた間違い。'),
      T('しきい値', 'Threshold', '点数がいくつ以上なら「はい」とするかの線。'),
      T('不均衡データ', 'Imbalanced data', '片方の種類が極端に少ないデータ。正解率が当てにならない。', null, ['よくある失敗']),
      T('交差検証', 'Cross-validation', 'データをいくつかに分け、テスト用の部分を順に入れ替えて何度も評価する方法。'),
      T('ベンチマーク', 'Benchmark', 'モデルの力を比べるための共通の問題集。点数が高くても、自分の用途で良いとは限らない。'),
      T('A/Bテスト', 'A/B test', '実際の利用者を2つに分けて、新旧のどちらが良いかを本番で比べる方法。'),
      T('バイアス（かたより）', 'Bias', '学習データのかたよりが、AIの判断のかたよりになること。特定の人たちに不利にならないか確認する。'),
      T('評価セット（eval）', 'Evaluation set', '生成AIの良し悪しを確かめるために用意した問題と期待する答えの集まり。'),
    ]),
  ]});
})();
