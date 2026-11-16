/* データ分析・統計の基本辞典 — B: 標本と推定 / 比べる（A/Bテスト）/ データを整える / 道具とAIへの頼み方 */
(function(){
const { $, $$, seg } = KIT;
const { S, C, T, verdict, clamp, f1, pct, yen, cv, sliders, dot, line, vline, label, rng, gauss, sum, mean, median, sd, phi, COL } = DAH;
const CK = (name, en, desc, prompt, tags) => ({ name, en, desc, prompt, tags, check:true });

/* ================= 5. 標本と推定 ================= */
TABS.push({ id:'sample', label:'標本と推定', icon:'🎯',
  intro:'全員に聞くことはできないので、<b>一部（標本）</b>に聞いて<b>全体（母集団）</b>を推し量ります。このとき必ず「ぶれ」が出ます。何人に聞けば、どのくらいの精度になるのか。そして、<b>人数を増やしても直らない間違い（かたより）</b>があることを確かめましょう。',
  sections:[
    C('触って理解する', [
      { name:'何人に聞けばいい？（誤差の範囲）', en:'Sample size & confidence interval', h:520, tags:['基本','体験','最重要'],
        demo:'<div class="kt"><div class="da-cv"></div><div class="sl"></div><div class="kt-row"><button type="button" class="kt-btn pri go">🎲 アンケートを20回やり直す</button></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const c = cv(el), g = c.ctx, P = .4; let runs = [], seed = 1; const st = sliders($(el, '.sl'), [['n', '1回に聞く人数', 10, 2000, 10, 100, (v) => v + '人']], () => { runs = []; draw(); });
          const go = () => { const r = rng(seed++ * 101 + st.n); runs = Array.from({ length:20 }, () => { let k = 0; for (let i = 0; i < st.n; i++) if (r() < P) k++; const p = k / st.n, e = 1.96 * Math.sqrt(p * (1 - p) / st.n); return [p, e]; }); draw(); };
          const draw = () => { const X = (v) => 14 + v * (c.w - 28), rowH = (c.h - 30) / 20; g.clearRect(0, 0, c.w, c.h); for (let v = 0; v <= 1.001; v += .2) label(g, pct(v), X(v), c.h - 6, c.mut, 'center', '10px sans-serif');
            vline(g, X(P), 4, c.h - 18, c.ok, 2, [4, 4]); label(g, '本当の支持率 40%', clamp(X(P), 60, c.w - 60), 12, c.ok, 'center', '700 10px sans-serif');
            runs.forEach(([p, e], i) => { const y = 20 + (i + .5) * rowH, hit = Math.abs(p - P) <= e, col = hit ? COL.blue : c.bad; g.strokeStyle = col; g.lineWidth = 2; line(g, [[X(clamp(p - e, 0, 1)), y], [X(clamp(p + e, 0, 1)), y]]); dot(g, X(p), y, 3.5, col); });
            const e0 = 1.96 * Math.sqrt(P * (1 - P) / st.n), hits = runs.filter(([p, e]) => Math.abs(p - P) <= e).length;
            verdict($(el, '.res'), '', `${st.n}人に聞くと、誤差はおよそ <b>±${pct(e0, 1)}</b>（95%の範囲）。` + (runs.length ? `20回のうち <b>${hits}回</b> で、横線（推定の範囲）が本当の値をふくみました（<span style="color:var(--bad)">赤</span>は外れ）。95%の範囲なので、20回に1回くらいは外れるのが普通です。` : 'ボタンを押すと、同じ調査を20回くり返した結果が並びます。') + (st.n >= 400 ? '' : '<br>人数を4倍にすると、誤差は半分になります。')); };
          $(el, '.go').onclick = go; c.redraw = draw; go(); },
        desc:'本当の支持率が40%の町で、100人に聞いたアンケートを20回やり直すと、結果は毎回少しずつ違います。この<b>ぶれの大きさ</b>を表すのが<b>信頼区間</b>（横線）。<b>人数を4倍にすると、誤差はやっと半分</b>になります。「35%と38%で3ポイント上がった！」という報道も、何人に聞いた結果かで意味が変わります。',
        prompt:'社内アンケートで満足度を調べたい。結果を ±5% くらいの精度で知るには何人に回答してもらえばよいか計算して。回答率が30%だとすると、何人に配ればいいかも教えて。' },
      { name:'平均を集めると山の形になる', en:'Central limit theorem', h:470, tags:['体験'],
        demo:'<div class="kt"><div class="da-cv"></div><div class="sl"></div><div class="da-f out"></div></div>',
        init:(el) => { const c = cv(el), g = c.ctx; const st = sliders($(el, '.sl'), [['n', '1回に平均する数', 1, 40, 1, 1]], () => draw());
          const draw = () => { const r = rng(9 + st.n), mk = () => -Math.log(1 - r()) * 20, means = Array.from({ length:1500 }, () => { let s = 0; for (let i = 0; i < st.n; i++) s += mk(); return s / st.n; }), B = 40, mx = 80, cnt = new Array(B).fill(0); means.forEach(v => { if (v < mx) cnt[Math.floor(v / mx * B)]++; });
            const top = Math.max(...cnt), W = (c.w - 24) / B, base = c.h - 20; g.clearRect(0, 0, c.w, c.h); cnt.forEach((v, i) => { const h = v / top * (base - 24); g.fillStyle = COL.purple; g.globalAlpha = .7; g.fillRect(12 + i * W + .5, base - h, W - 1, h); }); g.globalAlpha = 1;
            g.strokeStyle = c.bd; line(g, [[12, base], [c.w - 12, base]]); vline(g, 12 + 20 / mx * (c.w - 24), 10, base, c.bad, 2, [4, 4]); label(g, '本当の平均 20分', 12 + 20 / mx * (c.w - 24) + 4, 12, c.bad, 'left', '700 10px sans-serif');
            $(el, '.out').innerHTML = `元のデータ：窓口の待ち時間（平均20分・右に長い形）\n${st.n === 1 ? '1人ずつの値をそのまま並べると、<b>右に長い形</b>のまま。' : `${st.n}人ずつの平均を1,500回集めると → <b>${st.n >= 10 ? '左右対称の山の形' : 'だんだん山の形'}</b>に近づく。ばらつき ${f1(sd(means))}分`}`; };
          c.redraw = draw; draw(); },
        desc:'元のデータがどんな形でも、<b>何人分かの平均</b>をたくさん集めると、その分布は左右対称の山（正規分布）に近づきます。これが<b>中心極限定理</b>。平均する人数が多いほど山は細くなり、推定が正確になります。アンケートやA/Bテストで「誤差 ±何%」と計算できるのは、この性質のおかげです。',
        prompt:'統計の「中心極限定理」が、アンケートの誤差やA/Bテストの計算でなぜ大事なのかを、数式を使わずに例え話で説明して。' },
    ], null, true),
    { title:'人数と誤差の目安', note:'割合（%）を調べる場合、本当の値が50%前後のときの誤差の目安です（95%の範囲）。',
      table:{ head:['聞く人数', '誤差の目安', '使いどころ'], rows:[['100人', '約 ±10%', '大まかな傾向をつかむ'], ['400人', '約 ±5%', '社内アンケート・小さな調査'], ['1,000人', '約 ±3%', '世論調査・市場調査'], ['2,500人', '約 ±2%', '細かい差を見たいとき'], ['10,000人', '約 ±1%', 'Webサービスの大きなA/Bテスト']] } },
    { title:'人数を増やしても直らない「かたより」', note:'誤差は人数を増やせば小さくなりますが、<b>聞く相手のかたより</b>は人数では直りません。',
      table:{ head:['かたより', '例', '対策'], rows:[['選び方のかたより（選択バイアス）', 'SNSでアンケート → そのサービスが好きな人ばかり答える', '対象をくじ引きで選ぶ、属性ごとの割合を確かめる'], ['答えた人だけのかたより（無回答バイアス）', '不満がある人ほど答えない（または答える）', '回答率を上げる、答えなかった人の特徴を見る'], ['生き残りのかたより（生存者バイアス）', '成功した会社だけを調べて「成功の秘訣」を語る', 'やめた人・失敗した例も集める'], ['聞き方のかたより', '「〇〇に賛成ですよね？」と誘導する', '中立な聞き方、選択肢の順番を入れ替える'], ['覚え違い（想起バイアス）', '「先月何回使いましたか」の答えはあいまい', '記録（ログ）のデータを使う']] } },
    S('標本と推定の用語', [
      T('母集団', 'Population', '本当に知りたい全体（日本の全員、すべての利用者）。', null, ['基本']),
      T('標本（サンプル）', 'Sample', '母集団から実際に集めた一部。'),
      T('無作為抽出', 'Random sampling', 'くじ引きのように、だれもが同じ確率で選ばれるように集めること。かたよりを防ぐ基本。'),
      T('標本誤差', 'Sampling error', '一部だけを調べたことによる、たまたまのぶれ。人数を増やすと小さくなる。'),
      T('信頼区間', 'Confidence interval', '本当の値が入っていそうな範囲。「95%信頼区間」がよく使われる。', null, ['最重要']),
      T('誤差の範囲（マージン）', 'Margin of error', '「±3%」のように表す、推定のぶれの大きさ。'),
      T('中心極限定理', 'Central limit theorem', '平均をたくさん集めると、その分布は正規分布に近づくという性質。'),
      T('標準誤差', 'Standard error', '平均や割合の推定のぶれの大きさ。標準偏差 ÷ √人数。'),
      T('バイアス', 'Bias', '人数を増やしても消えない、一方向へのずれ。'),
    ]),
  ]});

/* ================= 6. 比べる（A/Bテスト） ================= */
function abtest(nA, rA, nB, rB){ const xA = Math.round(nA * rA), xB = Math.round(nB * rB), pA = xA / nA, pB = xB / nB, pp = (xA + xB) / (nA + nB), se0 = Math.sqrt(pp * (1 - pp) * (1 / nA + 1 / nB)), z = se0 ? (pB - pA) / se0 : 0, p = 2 * (1 - phi(Math.abs(z))), se = Math.sqrt(pA * (1 - pA) / nA + pB * (1 - pB) / nB); return { xA, xB, pA, pB, z, p, lo:pB - pA - 1.96 * se, hi:pB - pA + 1.96 * se }; }
TABS.push({ id:'test', label:'比べる（A/Bテスト）', icon:'🆚',
  intro:'「新しいボタンの方が押される？」のように2つを比べるとき、差が出ても<b>たまたまかもしれません</b>。その「たまたま」の可能性を数字で確かめるのが<b>統計的な検定</b>です。Webでは、利用者をランダムに2つに分けて比べる<b>A/Bテスト</b>がよく使われます。',
  sections:[
    C('触って理解する', [
      { name:'A/Bテスト計算機', en:'A/B test significance', h:560, tags:['基本','体験','最重要'], wide:true,
        demo:'<div class="kt"><div class="sl"></div><div class="da-bars bs"></div><div class="da-kpi k"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const st = sliders($(el, '.sl'), [['n', '各パターンの訪問者数', 100, 20000, 100, 1000, (v) => v.toLocaleString() + '人'], ['a', 'A（今のボタン）の成約率', .5, 20, .1, 5, (v) => f1(v) + '%'], ['b', 'B（新しいボタン）の成約率', .5, 20, .1, 6, (v) => f1(v) + '%']], () => draw());
          const draw = () => { const t = abtest(st.n, st.a / 100, st.n, st.b / 100), mx = Math.max(t.pA, t.pB) * 1.4, d = st.b / 100 - st.a / 100, need = d ? Math.ceil(7.85 * ((st.a / 100) * (1 - st.a / 100) + (st.b / 100) * (1 - st.b / 100)) / d / d) : Infinity;
            $(el, '.bs').innerHTML = `<span>A</span><span class="bar"><i style="width:${t.pA / mx * 100}%;background:${COL.blue}"></i></span><span>${pct(t.pA, 1)}（${t.xA}件）</span><span>B</span><span class="bar"><i style="width:${t.pB / mx * 100}%;background:${COL.orange}"></i></span><span>${pct(t.pB, 1)}（${t.xB}件）</span>`;
            $(el, '.k').innerHTML = `<div>差（B − A）<b>${d >= 0 ? '+' : ''}${f1(d * 100, 1)}pt</b></div><div>p値<b>${t.p < .001 ? '<0.001' : f1(t.p, 3)}</b></div><div>差の95%範囲<b>${f1(t.lo * 100, 1)}〜${f1(t.hi * 100, 1)}</b></div><div>必要な人数の目安<b>${isFinite(need) ? need.toLocaleString() : '—'}</b></div>`;
            const sig = t.p < .05; verdict($(el, '.res'), sig ? 'ok' : 'warn', sig ? `✓ p値が0.05より小さいので、この差が<b>たまたまとは考えにくい</b>（統計的に有意）。差の範囲は <b>${f1(t.lo * 100, 1)}〜${f1(t.hi * 100, 1)}ポイント</b>。<b>範囲の下限でも意味のある改善か</b>も確かめましょう。` : `まだ<b>たまたまの差かもしれません</b>（p値 ${f1(t.p, 3)}）。差の範囲が0をまたいでいます。この差を見分けるには、各 <b>${isFinite(need) ? need.toLocaleString() : '—'}人</b> くらいが目安です。途中で何度ものぞいて、有意になった瞬間に止めるのは禁物です。`); };
          draw(); },
        desc:'成約率5%と6%、差は1ポイント。各1,000人だと<b>たまたまの差かもしれない</b>と出ますが、各10,000人なら<b>本当の差</b>と言えます。<b>p値</b>は「本当は差がないのに、これくらいの差がたまたま出る確率」。0.05（5%）より小さいと「有意」とするのが慣例です。必要な人数は、<b>テストを始める前に</b>決めておきます。',
        prompt:'A/Bテストの結果は、Aが訪問【 】人中【 】件、Bが訪問【 】人中【 】件の成約だった。この差が統計的に有意か、2つの割合の差の検定で判定して。差の95%信頼区間と、結論として言ってよいこと・言えないことも書いて。' },
      { name:'何度も比べると「たまたま」当たる', en:'Multiple comparisons', h:470, tags:['体験','よくある失敗'],
        demo:'<div class="kt"><div class="da-cv"></div><div class="kt-row"><button type="button" class="kt-btn pri go">🎲 差のない比較を20回する</button></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const c = cv(el), g = c.ctx; let ps = [], seed = 1, total = 0, hitsAll = 0;
          const go = () => { const r = rng(seed++ * 7919); ps = Array.from({ length:20 }, () => { let a = 0, b = 0; for (let i = 0; i < 1000; i++){ if (r() < .05) a++; if (r() < .05) b++; } return abtest(1000, a / 1000, 1000, b / 1000).p; }); total += 20; hitsAll += ps.filter(p => p < .05).length; draw(); };
          const draw = () => { const W = (c.w - 24) / 20, base = c.h - 22, Y = (p) => base - (1 - p) * (base - 18); g.clearRect(0, 0, c.w, c.h); g.fillStyle = c.bad; g.globalAlpha = .1; g.fillRect(12, Y(.05), c.w - 24, base - Y(.05)); g.globalAlpha = 1;
            ps.forEach((p, i) => { const sig = p < .05; g.fillStyle = sig ? c.bad : COL.gray; g.fillRect(12 + i * W + 2, Y(p), W - 4, base - Y(p)); if (sig) label(g, '★', 12 + (i + .5) * W, Y(p) - 4, c.bad); });
            g.strokeStyle = c.bd; line(g, [[12, base], [c.w - 12, base]]); vline(g, 12, Y(.05), Y(.05), c.bad); g.strokeStyle = c.bad; g.setLineDash([4, 4]); line(g, [[12, Y(.05)], [c.w - 12, Y(.05)]]); g.setLineDash([]); label(g, 'p = 0.05', c.w - 40, Y(.05) - 4, c.bad, 'center', '10px sans-serif'); label(g, '↓ 低い所に届くと「有意」', 16, 12, c.mut, 'left', '10px sans-serif');
            const n = ps.filter(p => p < .05).length; verdict($(el, '.res'), n ? 'bad' : '', `AとBは<b>まったく同じ</b>（どちらも成約率5%）なのに、20回中 <b>${n}回</b> が「有意な差あり」（★）になりました。これまでの合計：${total}回中 ${hitsAll}回（${pct(hitsAll / total, 1)}）。<br>5%の基準で20個も比べれば、<b>1つくらいは偶然当たる</b>のが当然です。たくさん比べて当たったものだけを報告するのはやめましょう。`); };
          $(el, '.go').onclick = go; c.redraw = draw; go(); },
        desc:'p < 0.05 は「差がなくても5%（20回に1回）は偶然この結果になる」という意味です。だから、<b>色・文言・ボタンの位置…と20個試して1つ当たった</b>のは、偶然かもしれません。年代別・地域別・曜日別と分析を細かく分けていくのも同じです。調べる前に<b>何を比べるかを決めておく</b>こと、たくさん比べたときは基準を厳しくすることが大切です。',
        prompt:'このA/Bテストでは、ボタンの色・文言・位置の組み合わせを8パターン比べた。複数の比較をしたことを考えて結果を判定して（ボンフェローニ補正など）。補正しない場合とした場合で、結論がどう変わるかも見せて。' },
    ], null, true),
    { title:'p値のよくある誤解', note:'p値は便利ですが、誤解されやすい数字です。',
      table:{ head:['誤解', '本当は'], rows:[['p値は「仮説が正しい確率」', '「差がないとしたら、これほどの差が偶然出る確率」。仮説そのものの確率ではない'], ['有意 ＝ 大きな差・大事な差', '人数がとても多ければ、ごく小さな差でも有意になる。<b>差の大きさ</b>も必ず見る'], ['有意でない ＝ 差がない', '人数が足りなくて見分けられないだけかもしれない'], ['p = 0.049 と 0.051 は別物', 'ほとんど同じ。0.05 はただの慣例の目安'], ['有意になるまで続ければいい', '途中で何度ものぞいて止めると、偶然の当たりを拾いやすくなる。人数は先に決める']] } },
    S('検定とA/Bテストの用語', [
      T('A/Bテスト', 'A/B test', '利用者をランダムに2つに分け、違う案を見せて結果を比べる方法。', null, ['基本']),
      T('帰無仮説', 'Null hypothesis', '「差はない」という仮の前提。これを否定できるかを調べる。'),
      T('p値', 'p-value', '帰無仮説が正しいとき、今の結果以上の差が偶然出る確率。', null, ['最重要']),
      T('有意水準', 'Significance level (α)', '「有意」と判断する基準。0.05（5%）がよく使われる。'),
      T('統計的に有意', 'Statistically significant', '偶然とは考えにくい差。大事な差かどうかは別に考える。'),
      T('効果量', 'Effect size', '差の大きさそのもの。「何ポイント上がったか」。'),
      T('検出力', 'Statistical power', '本当に差があるときに、それを見つけられる確率。人数が多いほど高い。'),
      T('第1種・第2種の誤り', 'Type I / Type II error', '差がないのに「ある」と言う誤り／差があるのに見逃す誤り。'),
      T('多重比較', 'Multiple comparisons', 'たくさん比べるほど、偶然の「有意」が出やすくなる問題。'),
      T('p ハッキング', 'p-hacking', '有意になるまで分析のしかたを変え続けること。やってはいけない。', null, ['よくある失敗']),
      T('t検定・カイ二乗検定', 't-test / chi-squared test', '平均の差を比べる検定と、割合・件数の差を比べる検定の代表。'),
    ]),
  ]});

/* ================= 7. データを整える ================= */
const RAW = [
  ['2026/10/01', '渋谷店', '12000'], ['2026-10-01', '新宿店', '9800'], ['2026/10/02', '渋谷 店', '１１５００'], ['2026/10/02', '新宿店', ''],
  ['2026/10/03', 'しぶや店', '13200'], ['2026/10/03', '新宿店', '10400'], ['2026/10/03', '新宿店', '10400'], ['2026/10/04', '渋谷店', '1250000'], ['2026/10/04', '新宿店', '9900'],
];
const FIXES = [['ws', '店名の表記をそろえる'], ['zen', '全角数字を半角に'], ['date', '日付の形をそろえる'], ['dup', '重複行を消す'], ['na', '空欄の行を除く'], ['out', '桁違いの値を確認・除く']];
TABS.push({ id:'clean', label:'データを整える', icon:'🧹',
  intro:'実際のデータは、そのままでは計算できないことがほとんどです。<b>表記ゆれ・全角半角・空欄・重複・入力ミス</b>…。分析の時間の大半はこの<b>前処理</b>に使われます。直し方を1つずつ有効にして、集計の結果がどれだけ変わるか見てみましょう。',
  sections:[
    C('触って理解する', [
      { name:'汚れたデータをきれいにする', en:'Data cleaning, step by step', h:560, tags:['基本','体験','最重要'], wide:true,
        demo:'<div class="kt"><div class="da-fix fx"></div><div class="da-tbl tb"></div><div class="da-f out"></div></div>',
        init:(el) => { const on = {}; $(el, '.fx').innerHTML = FIXES.map(([k, l]) => `<button type="button" class="kt-btn sm" data-k="${k}" aria-pressed="false">${l}</button>`).join('');
          const toHalf = (s) => s.replace(/[０-９]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0xFEE0));
          const draw = () => { const seen = new Set(), rows = RAW.map((r, i) => { let [d, s, v] = r; const prob = []; const fx = [];
              if (/-/.test(d)){ if (on.date){ d = d.replace(/-/g, '/'); fx.push(0); } else prob.push(0); }
              if (s !== '渋谷店' && s !== '新宿店'){ if (on.ws){ s = s.includes('新宿') ? '新宿店' : '渋谷店'; fx.push(1); } else prob.push(1); }
              if (/[０-９]/.test(v)){ if (on.zen){ v = toHalf(v); fx.push(2); } else prob.push(2); }
              let gone = false; const key = d + s + v; if (on.dup && seen.has(key)) gone = 'dup'; seen.add(key); if (!gone && RAW.findIndex((x, j) => j < i && x.join() === r.join()) >= 0 && !on.dup) prob.push(9);
              if (v === ''){ if (on.na) gone = 'na'; else prob.push(2); }
              if (+v > 100000){ if (on.out) gone = 'out'; else prob.push(2); }
              return { d, s, v, prob, fx, gone }; });
            $(el, '.tb').innerHTML = `<table><thead><tr><th>日付</th><th>店舗</th><th>売上（円）</th></tr></thead><tbody>${rows.map(r => `<tr class="${r.gone ? 'gone' : ''}">${[r.d, r.s, r.v || '（空欄）'].map((x, j) => `<td class="${j === 2 ? 'num ' : ''}${r.prob.includes(j) || (r.prob.includes(9)) ? 'bad' : r.fx.includes(j) ? 'fixed' : ''}">${x}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
            const live = rows.filter(r => !r.gone), stores = {}; live.forEach(r => { const n = Number(r.v); (stores[r.s] = stores[r.s] || []).push(isNaN(n) || r.v === '' ? NaN : n); });
            const lines = Object.entries(stores).map(([k, a]) => { const ok = a.filter(x => !isNaN(x)); return `${k.padEnd(4, '　')}：${ok.length ? `平均 <b>${yen(mean(ok))}円</b>（${ok.length}日分）` : '計算できない'}${a.length - ok.length ? `　<span style="color:var(--bad)">数値でない値 ${a.length - ok.length}件</span>` : ''}`; });
            const done = FIXES.filter(([k]) => on[k]).length; $(el, '.out').innerHTML = `店舗の数：<b>${Object.keys(stores).length}</b>（本当は2店舗）\n` + lines.join('\n') + (done === FIXES.length ? '\n✓ すべて整いました。渋谷店の平均が、入力ミス1件でどれだけ狂っていたか比べてみてください。' : ''); };
          $$(el, '.fx button').forEach(b => b.onclick = () => { on[b.dataset.k] = !on[b.dataset.k]; b.setAttribute('aria-pressed', String(!!on[b.dataset.k])); draw(); }); draw(); },
        desc:'わずか9行でも、「渋谷店」「渋谷 店」「しぶや店」が<b>別の店</b>として集計され、全角の「１１５００」は<b>数字として読めず</b>、桁を間違えた「1250000」が<b>平均を大きく狂わせます</b>。赤いマスが問題、緑が直した所。<b>直した内容は必ず記録</b>し、消した行は「なぜ消したか」を説明できるようにします。',
        prompt:'このCSVの前処理をして。①店舗名などの表記ゆれを一覧にして統一案を出す ②全角数字・カンマ付き数字を数値に直す ③日付の形をそろえる ④完全に同じ行（重複）を数える ⑤空欄と、ほかと桁が違う値を一覧にする。削除や修正をする前に、何件をどう直すかの一覧を見せて、私が確認してから実行して。' },
    ], null, true),
    S('よくある汚れと直し方', [
      T('表記ゆれ', 'Inconsistent labels', '「株式会社ABC」「(株)ABC」「ABC」など、同じものが別の書き方になっている。一覧を作って、対応表で統一する。', 'この列の値の種類と件数を一覧にして。同じものを指していそうな表記ゆれのグループを提案して。統一はまだしないで。', ['最重要']),
      T('全角・半角', 'Full-width / half-width', '数字・英字・カタカナ・スペースの全角半角が混ざる。数値として計算できなくなる原因の代表。'),
      T('空欄（欠損値）', 'Missing values', '空欄・「なし」・「-」・0 など、表し方がばらばらなことも。消す・平均で埋める・そのまま残す、のどれにするかは理由と一緒に決める。', '欠損値のある列と件数を一覧にして。それぞれ「行ごと消す」「別の値で埋める」「そのまま」のどれが良いか、理由と一緒に提案して。'),
      T('重複', 'Duplicates', '同じ行が2回入っている。送信ボタンの二度押しや、ファイルの結合ミスで起きる。'),
      T('外れ値・入力ミス', 'Outliers / typos', '桁の打ち間違い、単位の違い（円と千円）。<b>自動で消さず、まず一覧にして確かめる</b>。本当に大きな値の可能性もある。', null, ['よくある失敗']),
      T('日付の形', 'Date formats', '「2026/10/1」「2026-10-01」「10月1日」「45931（Excelの内部の数字）」などが混ざる。タイムゾーンにも注意。'),
      T('単位の混在', 'Mixed units', '「1.5kg」と「1500g」、税込と税抜。単位の列を分けるか、そろえる。'),
      T('1つのマスに複数の値', 'Multiple values in a cell', '「赤,青,緑」のようにまとめて入っている。分析しやすいよう、行や列に分ける。'),
      T('横長の表（集計済みの表）', 'Wide vs long format', '「1月」「2月」…が列になった表は、グラフや集計がしにくい。「月・値」の縦長の形に直すと扱いやすい。'),
    ]),
  ]});

/* ================= 8. 道具とAIへの頼み方 ================= */
TABS.push({ id:'tools', label:'道具とAIへの頼み方', icon:'🧰',
  intro:'分析はスプレッドシート（Excel・Googleスプレッドシート）だけでも十分始められます。データが大きくなったら Python（pandas）や SQL へ。AIは<b>計算を自分で暗算させず、表計算やコードを使わせる</b>のが正確に分析させるコツです。',
  sections:[
    { title:'スプレッドシートの関数', note:'Excel と Googleスプレッドシートでほぼ同じように使えます。',
      table:{ head:['やりたいこと', '関数', '例'], rows:[['合計・平均', 'SUM / AVERAGE', '<code>=AVERAGE(C2:C100)</code>'], ['中央値', 'MEDIAN', '<code>=MEDIAN(C2:C100)</code>'], ['標準偏差', 'STDEV.S（標本）', '<code>=STDEV.S(C2:C100)</code>'], ['四分位数', 'QUARTILE.INC', '<code>=QUARTILE.INC(C2:C100, 1)</code>'], ['条件付きの件数・合計・平均', 'COUNTIF / SUMIFS / AVERAGEIFS', '<code>=AVERAGEIFS(C:C, B:B, "渋谷店")</code>'], ['相関係数', 'CORREL', '<code>=CORREL(B2:B100, C2:C100)</code>'], ['別の表から引く', 'XLOOKUP', '<code>=XLOOKUP(A2, 商品!A:A, 商品!B:B)</code>'], ['全角を半角に', 'ASC（Excel）', '<code>=ASC(B2)</code>'], ['前後の空白を消す', 'TRIM', '<code>=TRIM(B2)</code>'], ['重複を消す', 'UNIQUE', '<code>=UNIQUE(B2:B100)</code>'], ['グループごとに集計', 'ピボットテーブル', 'メニューの「挿入」→「ピボットテーブル」'], ['検定（2群の平均の差）', 'T.TEST', '<code>=T.TEST(A2:A50, B2:B50, 2, 3)</code>']] } },
    { title:'同じことを Python（pandas）と SQL で', note:'データが数十万行を超えたり、作業をくり返したりするときに。',
      table:{ head:['やりたいこと', 'pandas', 'SQL'], rows:[['読み込む', '<code>df = pd.read_csv("sales.csv")</code>', '—'], ['ざっと眺める', '<code>df.describe()</code>', '<code>SELECT COUNT(*), AVG(売上) FROM sales</code>'], ['グループごとに平均', '<code>df.groupby("店舗")["売上"].mean()</code>', '<code>SELECT 店舗, AVG(売上) FROM sales GROUP BY 店舗</code>'], ['条件でしぼる', '<code>df[df["売上"] > 10000]</code>', '<code>WHERE 売上 > 10000</code>'], ['欠損値を数える', '<code>df.isna().sum()</code>', '<code>SUM(CASE WHEN 売上 IS NULL THEN 1 ELSE 0 END)</code>'], ['重複を消す', '<code>df.drop_duplicates()</code>', '<code>SELECT DISTINCT …</code>'], ['相関', '<code>df.corr(numeric_only=True)</code>', '<code>CORR(x, y)</code>（PostgreSQL）']] } },
    S('AIに分析を頼むときの言い方', [
      T('先にデータの中身を確かめさせる', 'Profile the data first', 'いきなり結論を出させず、列の意味・件数・欠損・おかしな値を先に報告させる。', 'このデータを分析する前に、各列の意味の推測・データの型・件数・欠損値の数・おかしな値（外れ値・表記ゆれ）を表にまとめて。分析はまだしないで。', ['最重要']),
      T('計算はコードで実行させる', 'Make it compute, not guess', 'AIは暗算や数え上げを間違えることがある。コードを実行できる機能を使わせ、使った式も見せてもらう。', 'この集計は、頭の中で計算せずに必ずコード（Python）を実行して求めて。使ったコードと、途中の件数も見せて。'),
      T('問いと比べる相手をはっきり書く', 'State the question', '「分析して」ではなく、何と何を比べて、何を知りたいかを書く。', '【施策の前の3か月】と【後の3か月】で、1日あたりの売上が変わったかを知りたい。曜日の違いをそろえて比べて、差がたまたまでないかも確かめて。'),
      T('結論の強さを分けて書かせる', 'Separate findings from guesses', '「データから言えること」「推測」「このデータでは言えないこと」を分けさせる。', '分析の結果を、①データから確実に言えること ②可能性があるが確かめが必要なこと ③このデータでは言えないこと、の3つに分けて報告して。'),
      T('グラフを先に見せてもらう', 'Plot before you summarize', '平均などの数字だけでは、分布の形や外れ値に気づけない。', '集計する前に、主な列のヒストグラムと、2つの列の散布図を描いて見せて。気になる点があれば先に教えて。'),
      T('個人情報を渡さない', 'Remove personal data', '名前・メール・電話番号などは、分析に不要なら削ってから渡す。IDに置き換える。', 'このデータから個人を特定できる列を見つけて、分析に必要ない列は削除、必要な列はIDに置き換えた版を作って。元の対応表は別に保存して。'),
    ]),
    { title:'結果を報告する前のチェック', note:'チェックを付けながら確認できます（このブラウザにだけ保存されます）。', layout:'rows', items:[
      CK('データの出どころと期間を書いたか', 'Source & period', 'いつからいつまでの、誰の、どうやって集めたデータか。'),
      CK('件数を書いたか', 'Sample size', '割合だけでなく「何人中何人」を書く。少ない件数の割合は大きくぶれる。'),
      CK('平均だけで語っていないか', 'Not just the mean', 'かたよったデータなら中央値も。ばらつきや分布の形も一緒に。'),
      CK('「たまたま」でないか確かめたか', 'Not just chance', '差を主張するなら、件数と誤差の範囲（検定）を確かめる。'),
      CK('相関を因果のように書いていないか', 'Correlation ≠ causation', '「〜したから増えた」と書くなら、本当にそう言える比べ方をしたか。', null, ['最重要']),
      CK('グラフでごまかしていないか', 'Honest charts', `縦軸を0から始めていない棒グラフ、2つの軸のグラフなどで、差を大きく見せていないか（<a href="dataviz.html#rules">グラフの見やすくするルール</a>）。`),
      CK('前処理で何を直し・何を消したか書いたか', 'Document cleaning', '消した行の数と理由。あとで同じ分析をくり返せるように。'),
    ] },
    S('道具の用語', [
      T('ピボットテーブル', 'Pivot table', '表をグループごとに集計し直す機能。スプレッドシートでの分析の主役。', null, ['基本']),
      T('pandas', 'pandas', 'Python で表のデータを扱う定番のライブラリ。'),
      T('Jupyter Notebook・Google Colab', 'Notebook', 'コードと結果とグラフを並べて書ける環境。Colab はブラウザだけで無料で使える。'),
      T('BIツール', 'Business intelligence tools', 'Looker Studio・Tableau・Power BI など。データをつないでダッシュボードを作る道具。'),
      T('CSV', 'Comma-separated values', 'カンマで区切った表のファイル。文字化けしたら文字コード（UTF-8 / Shift_JIS）を疑う。'),
      T('再現性', 'Reproducibility', '同じデータと手順で、だれがやっても同じ結果になること。手作業より、コードや手順書で残す。'),
    ]),
  ]});
})();
