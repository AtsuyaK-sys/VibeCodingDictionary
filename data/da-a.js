/* データ分析・統計の基本辞典 — A: 共通ヘルパー / 分析の流れ / 平均とばらつき / 分布 / 相関と因果 */
(function(){
const { $, $$, seg, stepper } = KIT;
const S = (title, items, note) => ({ title, note, layout:'rows', items });
const C = (title, items, note, lg) => ({ title, note, layout:lg ? 'cards lg' : 'cards', items });
const T = (name, en, desc, prompt, tags, more) => Object.assign({ name, en, desc, prompt, tags }, more || {});
const verdict = (el, cls, html) => { el.classList.remove('ok', 'bad', 'warn'); if (cls) el.classList.add(cls); el.innerHTML = html; };
const cssv = (el, n) => getComputedStyle(el).getPropertyValue(n).trim();
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const f1 = (n, d = 1) => (Math.round(n * 10 ** d) / 10 ** d).toFixed(d);
const pct = (n, d = 0) => (isFinite(n) ? f1(n * 100, d) + '%' : '—');
const yen = (n) => Math.round(n).toLocaleString('ja-JP');
// キャンバス。後からボタンやスライダーが入って枠の大きさが変わったら、解像度を合わせて描き直す（c.redraw）
function cv(el, sel = '.da-cv'){ const box = $(el, sel), c = Object.assign(VD.canvas(box), { box, ink:cssv(el, '--stage-ink') || '#222', mut:cssv(el, '--muted') || '#888', acc:cssv(el, '--accent') || '#a16207', bd:cssv(el, '--border') || '#ddd', bad:cssv(el, '--bad') || '#d64545', ok:cssv(el, '--ok') || '#1f9d63' });
  new ResizeObserver(() => { const w = box.clientWidth, h = box.clientHeight; if (!w || !h || (w === c.w && h === c.h)) return; const dpr = Math.min(3, window.devicePixelRatio || 1); c.c.width = Math.round(w * dpr); c.c.height = Math.round(h * dpr); c.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); c.w = w; c.h = h; if (c.redraw) c.redraw(); }).observe(box);
  return c; }
function sliders(box, defs, on){ const st = {}; box.classList.add('da-ctl');
  box.innerHTML = defs.map(([k, l, a, b, s, v]) => (st[k] = v, `<b>${l}</b><input type="range" min="${a}" max="${b}" step="${s}" value="${v}" data-k="${k}" aria-label="${l}"><output data-o="${k}"></output>`)).join('');
  const show = () => defs.forEach(d => { $(box, `[data-o="${d[0]}"]`).textContent = d[6] ? d[6](st[d[0]]) : st[d[0]]; });
  $$(box, 'input').forEach(i => i.oninput = () => { st[i.dataset.k] = +i.value; show(); if (on) on(st, i.dataset.k); }); show();
  st.set = (k, v) => { st[k] = v; const i = $(box, `[data-k="${k}"]`); if (i) i.value = v; show(); }; return st; }
const dot = (g, x, y, r, col, hollow) => { g.beginPath(); g.arc(x, y, r, 0, 7); if (hollow){ g.strokeStyle = col; g.lineWidth = 2; g.stroke(); } else { g.fillStyle = col; g.fill(); } };
const line = (g, pts) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); };
const vline = (g, x, y0, y1, col, w = 2, dash) => { g.strokeStyle = col; g.lineWidth = w; g.setLineDash(dash || []); line(g, [[x, y0], [x, y1]]); g.setLineDash([]); };
const label = (g, s, x, y, col, align = 'center', font = '700 11px sans-serif') => { g.font = font; g.textAlign = align; g.fillStyle = col; g.fillText(s, x, y); g.textAlign = 'left'; };
// 毎回同じ並びになる乱数と、正規分布の乱数
const rng = (seed) => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const gauss = (r) => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
// 統計の計算
const sum = (a) => a.reduce((s, x) => s + x, 0), mean = (a) => sum(a) / a.length;
const sorted = (a) => [...a].sort((x, y) => x - y);
const median = (a) => { const b = sorted(a), m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; };
const quant = (a, q) => { const b = sorted(a), p = (b.length - 1) * q, i = Math.floor(p); return b[i] + (b[Math.min(i + 1, b.length - 1)] - b[i]) * (p - i); };
const sd = (a, s = 1) => { const m = mean(a); return Math.sqrt(sum(a.map(x => (x - m) ** 2)) / (a.length - s)); };
const corr = (x, y) => { const mx = mean(x), my = mean(y); let a = 0, b = 0, c = 0; x.forEach((v, i) => { a += (v - mx) * (y[i] - my); b += (v - mx) ** 2; c += (y[i] - my) ** 2; }); return a / Math.sqrt(b * c); };
const erf = (x) => { const s = Math.sign(x); x = Math.abs(x); const t = 1 / (1 + .3275911 * x); return s * (1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - .284496736) * t + .254829592) * t * Math.exp(-x * x)); };
const phi = (z) => .5 * (1 + erf(z / Math.SQRT2));
const COL = { blue:'#2563eb', orange:'#ea580c', green:'#16a34a', purple:'#9333ea', red:'#dc2626', gray:'#94a3b8' };
window.DAH = { S, C, T, verdict, clamp, f1, pct, yen, cv, sliders, dot, line, vline, label, rng, gauss, sum, mean, median, quant, sd, corr, phi, COL };

/* ================= 1. 分析の流れ ================= */
TABS.push({ id:'flow', label:'分析の流れ', icon:'🧭',
  intro:'データ分析は、数式から始めるものではありません。<b>「何を知りたいか（問い）」から始めて、データを集め、整え、調べ、伝える</b>流れです。AIに分析を頼むときも、この流れのどこを頼んでいるのかを意識すると、結果を確かめやすくなります。グラフの作り方は <a href="dataviz.html">グラフ・データ可視化辞典</a> へ。',
  sections:[
    C('触って理解する', [
      { name:'データ分析の5つの段階', en:'From question to decision', h:430, tags:['基本','最重要'], demo:'<div class="stp"></div>',
        init:(el) => stepper($(el, '.stp'), [
          '<b>問いを決める</b>　「売上を上げたい」ではなく「<b>雨の日に</b>売上が下がるのは<b>本当か、どのくらいか</b>」のように、答えられる形にします。',
          '<b>データを集める</b>　手元の記録・アンケート・公開データ。<b>誰の・いつの・どう集めた</b>データかを書き残します。',
          '<b>データを整える（前処理）</b>　表記ゆれ・空欄・重複・入力ミスを直します。実は作業時間の大半がここです。',
          '<b>調べる</b>　まず<b>グラフで眺め</b>、平均・ばらつき・関係を数字で確かめます。比べるときは「たまたま」でないかも確かめます。',
          '<b>伝える・決める</b>　結論 → 根拠 → 限界（言えないこと）の順に伝えます。<b>次に何をするか</b>まで書いて完成です。',
        ], { title:'問い → 集める → 整える → 調べる → 伝える' }),
        desc:'いきなり「このデータを分析して」と頼むと、AIはそれらしいグラフと数字を並べますが、<b>何のための分析か</b>が抜けてしまいます。最初の「問い」を一文で書くだけで、集めるデータも、見るべき数字も、ぐっと絞られます。',
        prompt:'【売上データ】を分析したい。いきなり計算せず、まず私の目的を聞いて、それに答えるための「問い」を3つ提案して。それぞれ、どの列を使ってどんなグラフ・数字で答えるかも書いて。' },
    ], null, true),
    { title:'データの種類', note:'データの種類によって、使える計算とグラフが変わります。',
      table:{ head:['種類', '例', '使える計算', '向いているグラフ'], rows:[['数の大きさ（量的・連続）', '身長、売上、気温、時間', '平均・中央値・標準偏差', 'ヒストグラム、箱ひげ図、散布図'], ['数えた数（量的・離散）', '来店人数、クリック数', '合計・平均・割合', '棒グラフ'], ['種類・グループ（質的）', '店舗、性別、商品の分類', '件数・割合（平均は意味がない）', '棒グラフ、帯グラフ'], ['順番のある種類', '満足度（5段階）、学年', '中央値・割合（平均は注意して）', '帯グラフ、棒グラフ'], ['日付・時刻', '注文日時、ログイン時刻', '期間・曜日・月ごとの集計', '折れ線グラフ'], ['文章', '自由記述のアンケート、レビュー', '言葉の数え上げ、分類（AIが得意）', '棒グラフ（分類した結果）']] } },
    S('はじめに覚える言葉', [
      T('データセット', 'Dataset', 'ひとまとまりのデータ。表の形（行と列）で持つことが多い。', null, ['基本']),
      T('行と列（レコードと項目）', 'Row / column', '1行が1件（1人・1回の注文）、1列が1つの項目（日付・金額）。この形に整えると分析しやすい。'),
      T('記述統計', 'Descriptive statistics', '手元のデータの特徴を、平均やグラフでまとめること。'),
      T('推測統計', 'Inferential statistics', '一部（標本）のデータから、全体（母集団）のことを推し量ること。'),
      T('母集団と標本', 'Population / sample', '知りたい全体と、そこから実際に集めた一部。'),
      T('KPI', 'Key Performance Indicator', '目標に近づいているかを見るための、決めておいた数字（月の新規会員数など）。'),
      T('EDA（探索的データ分析）', 'Exploratory data analysis', '結論を決めずに、まずグラフや集計でデータを眺めて特徴をつかむこと。'),
      T('仮説', 'Hypothesis', '「雨の日は来客が減るのでは」のような、データで確かめたい予想。'),
    ]),
  ]});

/* ================= 2. 平均とばらつき ================= */
const BASE = [280, 320, 350, 380, 400, 420, 450, 500, 550];
TABS.push({ id:'summary', label:'平均とばらつき', icon:'⚖',
  intro:'たくさんの数字を1つで表すのが<b>代表値</b>（平均・中央値）、散らばり具合を表すのが<b>ばらつき</b>（標準偏差・四分位）です。どちらか片方だけでは、データの姿を見誤ります。数字を動かして、それぞれの性格を確かめましょう。',
  sections:[
    C('触って理解する', [
      { name:'平均と中央値（1人のお金持ち）', en:'Mean vs median', h:430, tags:['基本','体験','最重要'],
        demo:'<div class="kt"><div class="da-cv"></div><div class="sl"></div><div class="da-kpi k"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const c = cv(el), g = c.ctx; const st = sliders($(el, '.sl'), [['x', '10人目の年収', 300, 10000, 50, 3000, (v) => v.toLocaleString() + '万円']], () => draw());
          const draw = () => { const d = BASE.concat(st.x), mx = Math.max(1200, st.x * 1.06), X = (v) => 16 + v / mx * (c.w - 32), y = c.h * .55, m = mean(d), md = median(d); g.clearRect(0, 0, c.w, c.h);
            g.strokeStyle = c.bd; g.lineWidth = 1; line(g, [[X(0), y], [X(mx), y]]); for (let v = 0; v <= mx; v += mx > 4000 ? 2000 : 200){ vline(g, X(v), y, y + 5, c.bd, 1); label(g, v.toLocaleString(), X(v), y + 17, c.mut, 'center', '10px sans-serif'); }
            BASE.forEach((v, i) => dot(g, X(v), y - 10 - (i % 2) * 9, 6, COL.gray)); dot(g, X(st.x), y - 14, 8, COL.orange);
            vline(g, X(m), 18, y + 2, c.bad, 2.5, [5, 4]); label(g, `平均 ${yen(m)}`, clamp(X(m), 50, c.w - 50), 14, c.bad); vline(g, X(md), 34, y + 2, COL.blue, 2.5); label(g, `中央値 ${yen(md)}`, clamp(X(md), 54, c.w - 54), y + 34, COL.blue);
            const below = d.filter(v => v < m).length;
            $(el, '.k').innerHTML = `<div>平均<b>${yen(m)}</b></div><div>中央値<b>${yen(md)}</b></div><div>平均より下の人<b>${below} / 10人</b></div><div>平均 − 中央値<b>${yen(m - md)}</b></div>`;
            verdict($(el, '.res'), m - md > 150 ? 'warn' : 'ok', m - md > 150 ? `1人（オレンジ）に引っぱられて、平均が<b>${yen(m)}万円</b>に。10人中<b>${below}人</b>は平均より下です。こういう<b>かたよったデータ</b>では、中央値の方が「ふつうの人」の姿に近くなります。` : '極端な値がないときは、平均と中央値はほぼ同じです。'); };
          c.redraw = draw; draw(); },
        desc:'<b>平均</b>は全部を足して人数で割った値、<b>中央値</b>は小さい順に並べたときの真ん中の値です。年収・家の値段・待ち時間のように<b>一部に極端な値がある</b>データでは、平均は大きく引っぱられ、多くの人の感覚とずれます。ニュースで「平均」を見たら、中央値もあるかを確かめましょう。',
        prompt:'この【売上・年収などの列】について、平均と中央値の両方を計算して、差が大きい場合は理由（極端な値・分布のかたより）を説明して。報告にはどちらを使うべきかも教えて。' },
      { name:'ばらつき（標準偏差）', en:'Standard deviation', h:430, tags:['基本','体験'],
        demo:'<div class="kt"><div class="da-cv"></div><div class="sl"></div><div class="da-f out"></div></div>',
        init:(el) => { const c = cv(el), g = c.ctx, r = rng(3), Z = Array.from({ length:40 }, () => gauss(r)); const st = sliders($(el, '.sl'), [['s', 'ばらつき', 1, 22, 1, 10]], () => draw());
          const draw = () => { const d = Z.map(z => clamp(60 + z * st.s, 0, 100)), m = mean(d), s = sd(d, 0), X = (v) => 16 + v / 100 * (c.w - 32), y = c.h * .62; g.clearRect(0, 0, c.w, c.h);
            g.fillStyle = COL.blue; g.globalAlpha = .12; g.fillRect(X(m - s), 22, X(m + s) - X(m - s), y - 14); g.globalAlpha = 1;
            g.strokeStyle = c.bd; g.lineWidth = 1; line(g, [[X(0), y], [X(100), y]]); for (let v = 0; v <= 100; v += 20) label(g, v + '点', X(v), y + 16, c.mut, 'center', '10px sans-serif');
            const stack = {}; d.forEach(v => { const b = Math.round(v / 2), n = (stack[b] = (stack[b] || 0) + 1); dot(g, X(v), y - 6 - (n - 1) * 9, 4.2, Math.abs(v - m) <= s ? COL.blue : COL.gray); });
            vline(g, X(m), 20, y, c.bad, 2); label(g, '平均', X(m), 16, c.bad); label(g, '−1σ', X(m - s), y + 30, COL.blue); label(g, '+1σ', X(m + s), y + 30, COL.blue);
            const inside = d.filter(v => Math.abs(v - m) <= s).length;
            $(el, '.out').innerHTML = `平均 <b>${f1(m)}</b>点　標準偏差 σ = <b>${f1(s)}</b>点　範囲 ${f1(Math.min(...d), 0)}〜${f1(Math.max(...d), 0)}点\n平均 ± σ（青い帯）に入っている人：<b>${inside} / 40人</b>（${pct(inside / 40)}。山がひとつの形なら、だいたい7割）`; };
          c.redraw = draw; draw(); },
        desc:'同じ平均60点のテストでも、全員が55〜65点のクラスと、20〜100点に散らばるクラスでは、まったく様子が違います。散らばり具合を表すのが<b>標準偏差（σ）</b>。「平均からだいたいどのくらい離れているか」の目安で、山がひとつの形のデータなら、<b>平均 ± σ の中に約7割</b>が入ります。',
        prompt:'2つの店舗の日ごとの売上について、平均と標準偏差を計算して比べて。「どちらが安定しているか」を、専門用語を使わずに説明して。' },
      { name:'箱ひげ図の読み方', en:'Box plot & quartiles', h:430, tags:['体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="da-cv"></div><div class="da-f out"></div></div>',
        init:(el) => { let k = 0; const c = cv(el), g = c.ctx, r = rng(8), SETS = [Array.from({ length:60 }, () => clamp(50 + gauss(r) * 12, 5, 95)), Array.from({ length:60 }, () => clamp(18 + Math.exp(gauss(r) * .55 + 2.8), 5, 98)), Array.from({ length:58 }, () => clamp(48 + gauss(r) * 8, 5, 95)).concat([92, 96])];
          const draw = () => { const d = SETS[k], q1 = quant(d, .25), q2 = quant(d, .5), q3 = quant(d, .75), iq = q3 - q1, lo = Math.max(Math.min(...d), q1 - 1.5 * iq), hi = Math.min(Math.max(...d), q3 + 1.5 * iq), wl = Math.min(...d.filter(v => v >= lo)), wh = Math.max(...d.filter(v => v <= hi)), X = (v) => 16 + v / 100 * (c.w - 32), yb = c.h * .62, out = d.filter(v => v < q1 - 1.5 * iq || v > q3 + 1.5 * iq);
            g.clearRect(0, 0, c.w, c.h); const r2 = rng(5); d.forEach(v => dot(g, X(v), c.h * .22 + (r2() - .5) * c.h * .18, 3.4, out.includes(v) ? c.bad : COL.gray));
            g.strokeStyle = c.ink; g.lineWidth = 2; line(g, [[X(wl), yb], [X(q1), yb]]); line(g, [[X(q3), yb], [X(wh), yb]]); vline(g, X(wl), yb - 10, yb + 10, c.ink); vline(g, X(wh), yb - 10, yb + 10, c.ink);
            g.fillStyle = 'rgba(37,99,235,.15)'; g.fillRect(X(q1), yb - 20, X(q3) - X(q1), 40); g.strokeStyle = COL.blue; g.strokeRect(X(q1), yb - 20, X(q3) - X(q1), 40); vline(g, X(q2), yb - 20, yb + 20, c.bad, 3);
            out.forEach(v => dot(g, X(v), yb, 4.5, c.bad, true));
            [['Q1', q1], ['中央値', q2], ['Q3', q3]].forEach(([s, v], i) => label(g, s, X(v), yb + 36 + (i % 2) * 12, i === 1 ? c.bad : COL.blue, 'center', '700 10px sans-serif'));
            $(el, '.out').innerHTML = `最小 ${f1(wl, 0)} ｜ <b>Q1 ${f1(q1, 0)}</b> ｜ <b>中央値 ${f1(q2, 0)}</b> ｜ <b>Q3 ${f1(q3, 0)}</b> ｜ 最大 ${f1(wh, 0)}\n箱の中に、真ん中の半分（50%）の人が入る。${out.length ? `<b>赤い○ = 外れ値 ${out.length}個</b>（箱の幅の1.5倍より外）` : '外れ値はなし'}${k === 1 ? '\n右側（大きい方）のひげが長い＝右に長い分布' : ''}`; };
          c.redraw = draw; $(el, '.sw').replaceWith(seg(['左右対称', '右に長い', '外れ値あり'], i => { k = i; draw(); }).el); },
        desc:'<b>箱ひげ図</b>は、データを小さい順に並べて4つに区切った図です。箱の左端が <b>Q1（下から25%）</b>、真ん中の線が<b>中央値</b>、右端が <b>Q3（下から75%）</b>。箱の中に真ん中の半分が入ります。ひげの外の点は<b>外れ値</b>の候補。複数のグループを並べて比べるときにとても便利です。',
        prompt:'店舗ごとの客単価のデータで、箱ひげ図を店舗別に並べて描いて。外れ値があれば、その行を一覧にして、入力ミスか本当の値かを確かめる方法も教えて。' },
    ], null, true),
    { title:'代表値の使い分け', note:'データの形によって「ふつう」を表す数字が変わります。',
      table:{ head:['代表値', '求め方', '向いているとき', '注意'], rows:[['平均（算術平均）', '合計 ÷ 個数', '山がひとつで左右対称のデータ（身長・テストの点）', '極端な値に引っぱられる'], ['中央値', '並べたときの真ん中', '年収・価格・待ち時間などかたよったデータ', '全体の合計とは結びつかない'], ['最頻値', '一番多い値', '服のサイズ、よく売れる価格帯', '値がばらばらだと決まらない'], ['刈り込み平均', '上下の数%を除いて平均', '審査の点数など、極端な採点を除きたいとき', '何%除いたかを書く'], ['加重平均', '重みを付けて平均', '店ごとに客数が違う平均単価、成績の単位数', '単純な平均と混ぜない']] } },
    S('平均とばらつきの用語', [
      T('平均', 'Mean', '合計を個数で割った値。', null, ['基本']),
      T('中央値', 'Median', '小さい順に並べたときの真ん中の値。極端な値に強い。'),
      T('最頻値', 'Mode', '一番多く出てくる値。'),
      T('外れ値', 'Outlier', 'ほかから大きく離れた値。入力ミスのことも、大事な発見のこともある。消す前に確かめる。', null, ['よくある失敗']),
      T('標準偏差', 'Standard deviation (σ)', '平均からのばらつきの大きさ。'),
      T('分散', 'Variance', '標準偏差の2乗。計算の途中で使うことが多い。'),
      T('四分位数', 'Quartiles (Q1 / Q3)', '小さい順に4等分する区切りの値。'),
      T('四分位範囲', 'IQR', 'Q3 − Q1。真ん中の半分が入る幅。外れ値の判定に使う。'),
      T('変動係数', 'Coefficient of variation', '標準偏差 ÷ 平均。大きさの違うもの同士のばらつきを比べるときに使う。'),
      T('偏差値', 'T-score', '50 + 10 ×（点 − 平均）÷ 標準偏差。集団の中の位置を表す。'),
    ]),
  ]});

/* ================= 3. 分布 ================= */
const SHAPES = [['山がひとつ（正規分布）', (r) => 50 + gauss(r) * 12, '左右対称で、平均・中央値・最頻値がほぼ同じ。身長やテストの点、測定の誤差など。'], ['右に長い', (r) => 12 + Math.exp(gauss(r) * .6 + 3), '少しだけ大きな値があり、右にすそが伸びる。年収・価格・待ち時間・アクセス数。<b>平均が中央値より大きくなる</b>。'], ['山がふたつ', (r) => (r() < .5 ? 34 : 68) + gauss(r) * 7, '2つのグループが混ざっている合図。平均は<b>どちらの山にもいない値</b>になる。グループに分けて見直す。'], ['平ら（一様）', (r) => 5 + r() * 90, 'どの値も同じくらい出る。サイコロや、くじ引きの番号など。']];
TABS.push({ id:'dist', label:'分布', icon:'📶',
  intro:'データが「どのあたりに、どれくらい集まっているか」の形を<b>分布</b>と言います。平均を計算する前に、まずヒストグラムで形を見る習慣をつけましょう。形によって、使うべき数字や、気をつけることが変わります。',
  sections:[
    C('触って理解する', [
      { name:'分布の形とヒストグラム', en:'Shapes of distributions', h:470, tags:['基本','体験','最重要'],
        demo:'<div class="kt"><span class="sw"></span><div class="da-cv"></div><div class="sl"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let k = 0, D = []; const c = cv(el), g = c.ctx; const st = sliders($(el, '.sl'), [['b', '棒の数（区切り）', 3, 40, 1, 16]], () => draw());
          const draw = () => { const n = st.b, W = (c.w - 24) / n, cnt = new Array(n).fill(0); D.forEach(v => cnt[clamp(Math.floor(v / 100 * n), 0, n - 1)]++); const mx = Math.max(...cnt), X = (v) => 12 + v / 100 * (c.w - 24), base = c.h - 20; g.clearRect(0, 0, c.w, c.h);
            cnt.forEach((v, i) => { const h = v / mx * (base - 30); g.fillStyle = COL.blue; g.globalAlpha = .75; g.fillRect(12 + i * W + 1, base - h, W - 2, h); }); g.globalAlpha = 1; g.strokeStyle = c.bd; line(g, [[12, base], [c.w - 12, base]]);
            const m = mean(D), md = median(D); vline(g, X(m), 16, base, c.bad, 2.5, [5, 4]); vline(g, X(md), 26, base, COL.orange, 2.5); label(g, '平均', X(m), 12, c.bad); label(g, '中央値', X(md) + (md < m ? -22 : 22), 24, COL.orange);
            verdict($(el, '.res'), '', SHAPES[k][2] + (n <= 5 ? '<br>棒が少なすぎると、形がつぶれて見えません。' : n >= 32 ? '<br>棒が多すぎると、たまたまのでこぼこが目立ちます。' : '')); };
          c.redraw = draw; $(el, '.sw').replaceWith(seg(SHAPES.map(s => s[0]), i => { k = i; const r = rng(30 + i); D = Array.from({ length:500 }, () => clamp(SHAPES[i][1](r), .5, 99.5)); draw(); }).el); },
        desc:'<b>ヒストグラム</b>は、値を区切りごとに数えて棒にしたグラフです。同じ平均でも形はさまざまで、とくに<b>右に長い形</b>と<b>山がふたつ</b>の形は、平均だけ見ると判断を誤ります。棒の数（区切り）を変えると見え方が変わるので、いくつか試して形を確かめます。',
        prompt:'このデータの【列名】の分布を、ヒストグラムで見せて。山がいくつあるか、どちらにかたよっているか、外れ値があるかを文章で説明して。山がふたつあれば、どの列で分けると説明できそうかも探して。' },
      { name:'正規分布と「7割・95%」', en:'Normal distribution: 68-95-99.7', h:430, tags:['体験'],
        demo:'<div class="kt"><div class="da-cv"></div><div class="sl"></div><div class="da-f out"></div></div>',
        init:(el) => { const c = cv(el), g = c.ctx; const st = sliders($(el, '.sl'), [['k', '平均から ± 何σ', .5, 3, .1, 1, (v) => '± ' + f1(v) + 'σ'], ['x', 'あなたの点数', 20, 100, 1, 72, (v) => v + '点']], () => draw());
          const draw = () => { const m = 60, s = 12, X = (v) => 12 + (v - 12) / 96 * (c.w - 24), base = c.h - 22, pdf = (v) => Math.exp(-(((v - m) / s) ** 2) / 2), Y = (p) => base - p * (base - 26); g.clearRect(0, 0, c.w, c.h);
            g.fillStyle = COL.blue; g.globalAlpha = .2; g.beginPath(); g.moveTo(X(m - st.k * s), base); for (let v = m - st.k * s; v <= m + st.k * s; v += .5) g.lineTo(X(v), Y(pdf(v))); g.lineTo(X(m + st.k * s), base); g.fill(); g.globalAlpha = 1;
            g.strokeStyle = COL.blue; g.lineWidth = 2.5; const pts = []; for (let v = 12; v <= 108; v += .5) pts.push([X(v), Y(pdf(v))]); line(g, pts); g.strokeStyle = c.bd; g.lineWidth = 1; line(g, [[12, base], [c.w - 12, base]]);
            for (let i = -3; i <= 3; i++) label(g, i ? (i > 0 ? '+' : '') + i + 'σ' : '平均', X(m + i * s), base + 14, c.mut, 'center', '10px sans-serif');
            vline(g, X(st.x), 18, base, COL.orange, 2.5); label(g, 'あなた', clamp(X(st.x), 24, c.w - 24), 14, COL.orange);
            const z = (st.x - m) / s, inside = phi(st.k) - phi(-st.k);
            $(el, '.out').innerHTML = `平均 60点・標準偏差 12点のテストで、平均 ± ${f1(st.k)}σ（${f1(m - st.k * s, 0)}〜${f1(m + st.k * s, 0)}点）に入るのは <b>${pct(inside, 1)}</b>\nあなたの ${st.x}点 → 偏差値 <b>${f1(50 + 10 * z)}</b>・上位 <b>${pct(1 - phi(z), 1)}</b>（100人中 約${Math.max(1, Math.round((1 - phi(z)) * 100))}位）`; };
          c.redraw = draw; draw(); },
        desc:'左右対称の釣り鐘の形を<b>正規分布</b>と言います。この形なら、<b>平均 ± 1σ に約68%、± 2σ に約95%、± 3σ に約99.7%</b>が入ります。「平均から2σ以上離れていたら珍しい」という目安は、品質管理や異常の検知でよく使われます。<b>偏差値</b>もこの考え方で、集団の中の位置を表したものです。',
        prompt:'毎日のアクセス数のデータで、平均から2標準偏差以上離れた「いつもと違う日」を見つけて一覧にして。ただし曜日による差があるので、曜日ごとに平均と標準偏差を出してから判定して。' },
    ], null, true),
    S('分布の用語', [
      T('分布', 'Distribution', 'データがどの値に、どれくらい集まっているかの形。', null, ['基本']),
      T('ヒストグラム', 'Histogram', '値を区切りごとに数えて棒にしたグラフ。棒の間はすき間を空けないのが基本。'),
      T('正規分布', 'Normal distribution', '左右対称の釣り鐘の形。多くの統計の方法がこの形を前提にしている。'),
      T('ゆがみ（歪度）', 'Skewness', '分布が左右どちらにかたよっているか。右に長いと平均＞中央値。'),
      T('多峰性', 'Multimodal', '山が2つ以上あること。別々のグループが混ざっている合図。'),
      T('対数変換', 'Log transform', '右に長いデータ（年収・アクセス数）の対数を取って、形を整えること。'),
      T('べき分布・ロングテール', 'Power law / long tail', '一部が極端に大きく、多くは小さい分布。売れ筋とそれ以外、人気の記事など。'),
      T('z スコア（標準化）', 'z-score', '（値 − 平均）÷ 標準偏差。単位の違うもの同士を比べるために使う。'),
    ]),
  ]});

/* ================= 4. 相関と因果 ================= */
const STONES = { A:{ small:[81, 87], large:[192, 263] }, B:{ small:[234, 270], large:[55, 80] } };
TABS.push({ id:'relation', label:'相関と因果', icon:'🔗',
  intro:'「一方が増えると、もう一方も増える」関係を<b>相関</b>と言います。とても便利な見方ですが、<b>相関があっても、片方が原因とは限りません</b>。データ分析で一番多い勘違いがここです。3つの見本で、だまされ方と見抜き方を体験しましょう。',
  sections:[
    C('触って理解する', [
      { name:'相関係数を動かす', en:'Correlation coefficient (r)', h:470, tags:['基本','体験'],
        demo:'<div class="kt"><div class="da-cv"></div><div class="sl"></div><div class="da-f out"></div></div>',
        init:(el) => { const c = cv(el), g = c.ctx, r0 = rng(17), A = Array.from({ length:70 }, () => [gauss(r0), gauss(r0)]); const st = sliders($(el, '.sl'), [['r', '関係の強さ', -1, 1, .05, .6, (v) => f1(v, 2)]], () => draw());
          const draw = () => { const x = A.map(p => p[0]), y = A.map(p => st.r * p[0] + Math.sqrt(Math.max(0, 1 - st.r * st.r)) * p[1]), r = corr(x, y), X = (v) => c.w / 2 + v / 3.2 * (c.w / 2 - 14), Y = (v) => c.h / 2 - v / 3.2 * (c.h / 2 - 14); g.clearRect(0, 0, c.w, c.h);
            g.strokeStyle = c.bd; g.lineWidth = 1; line(g, [[10, c.h / 2], [c.w - 10, c.h / 2]]); line(g, [[c.w / 2, 10], [c.w / 2, c.h - 10]]);
            x.forEach((v, i) => dot(g, X(v), Y(y[i]), 4, COL.blue)); const b = r * sd(y) / sd(x); g.strokeStyle = c.bad; g.lineWidth = 2.5; line(g, [[X(-3.2), Y(-3.2 * b)], [X(3.2), Y(3.2 * b)]]);
            const a = Math.abs(r), word = a >= .7 ? '強い' : a >= .4 ? 'ふつうの' : a >= .2 ? '弱い' : 'ほとんどない';
            $(el, '.out').innerHTML = `相関係数 r = <b>${f1(r, 2)}</b> → ${r >= 0 ? '正の' : '負の'}<b>${word}</b>相関${a < .2 ? '（関係はほとんどない）' : ''}\n${r >= 0 ? '一方が大きいと、もう一方も大きい傾向' : '一方が大きいと、もう一方は小さい傾向'}　r² = ${f1(r * r, 2)}（${pct(r * r)}が直線で説明できる）`; };
          c.redraw = draw; draw(); },
        desc:'<b>相関係数 r</b> は −1〜1 の数字で、2つの量の<b>直線的な関係の強さ</b>を表します。1に近いほど「右上がり」、−1に近いほど「右下がり」、0に近いと関係なし。目安は、0.7以上で強い、0.4前後でふつう、0.2以下はほぼなし。ただし、<b>曲がった関係（山なり）は 0 に近く出る</b>ので、必ず散布図も見ます。',
        prompt:'このデータの数値の列どうしの相関係数を計算して、関係の強い組み合わせを上から5つ挙げて。それぞれ散布図も描き、「相関があっても因果とは限らない」点で注意すべきことがあれば書いて。' },
      { name:'アイスが売れると水の事故が増える？', en:'Confounding variable', h:470, tags:['体験','最重要'],
        demo:'<div class="kt"><span class="sw"></span><div class="da-cv"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let k = 0; const c = cv(el), g = c.ctx, r = rng(2), D = Array.from({ length:90 }, () => { const t = 4 + r() * 30; return [t, 20 + t * 9 + gauss(r) * 30, Math.max(0, t * .3 + gauss(r) * 1.6)]; }), GRP = [[0, 15, COL.blue, '寒い日'], [15, 25, COL.green, 'ふつうの日'], [25, 99, COL.orange, '暑い日']];
          const draw = () => { const xs = D.map(d => d[1]), ys = D.map(d => d[2]), X = (v) => 30 + (v - 40) / 300 * (c.w - 44), Y = (v) => c.h - 22 - v / 12 * (c.h - 40); g.clearRect(0, 0, c.w, c.h); label(g, 'アイスの売上 →', c.w - 54, c.h - 6, c.mut, 'center', '10px sans-serif'); label(g, '水の事故 ↑', 34, 12, c.mut, 'center', '10px sans-serif');
            D.forEach(d => { const gr = GRP.find(q => d[0] >= q[0] && d[0] < q[1]); dot(g, X(d[1]), Y(d[2]), 4.2, k ? gr[2] : COL.gray); });
            if (k) GRP.forEach((q, i) => label(g, '■ ' + q[3], 40 + i * 76, 28, q[2], 'left', '700 10.5px sans-serif'));
            const all = corr(xs, ys), within = GRP.map(q => { const s = D.filter(d => d[0] >= q[0] && d[0] < q[1]); return corr(s.map(d => d[1]), s.map(d => d[2])); });
            verdict($(el, '.res'), k ? 'ok' : 'warn', k ? `同じ気温どうしで比べると、相関は <b>${within.map(v => f1(v, 2)).join('・')}</b> とほぼ消えます。本当の原因は<b>気温（暑さ）</b>。暑いとアイスも売れるし、泳ぐ人も増える。このような隠れた原因を<b>交絡因子</b>と言います。` : `アイスの売上と水の事故の相関は <b>r = ${f1(all, 2)}</b>。強い相関ですが、「アイスを売るのをやめれば事故が減る」は<b>まちがい</b>です。下の「気温で分ける」を押してみてください。`); };
          c.redraw = draw; $(el, '.sw').replaceWith(seg(['全体で見る', '気温で分ける'], i => { k = i; draw(); }).el); },
        desc:'2つの数字が一緒に動いていても、<b>第3の原因</b>が両方を動かしていることがよくあります。これが<b>交絡（こうらく）</b>。「朝ごはんを食べる子は成績が良い」「広告を出した月は売上が高い」なども、生活習慣や季節が隠れた原因かもしれません。原因を確かめるには、条件をそろえて比べるか、<b>ランダムに分けて試す（A/Bテスト）</b>のが確実です。',
        prompt:'「【施策】をした店舗は売上が高い」というデータがある。これが本当に施策の効果なのか、ほかの原因（店の規模・立地・季節など）で説明できてしまわないかを確かめたい。考えられる交絡因子を挙げて、それをそろえて比べる分析をして。' },
      { name:'全体と部分で結果が逆になる', en:'Simpson\'s paradox', h:470, tags:['体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="da-bars bs" style="flex:1;align-content:start"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const bar = (n, d, col) => `<span class="bar"><i style="width:${n / d * 100}%;background:${col}"></i></span><span>${pct(n / d)}（${n}/${d}）</span>`;
          $(el, '.sw').replaceWith(seg(['全体で比べる', '石の大きさで分ける'], k => { const tot = (t) => [STONES[t].small[0] + STONES[t].large[0], STONES[t].small[1] + STONES[t].large[1]];
            $(el, '.bs').innerHTML = k ? ['small', 'large'].map(s => `<span class="h">${s === 'small' ? '小さい石の人' : '大きい石の人'}</span><span>治療A</span>${bar(...STONES.A[s], COL.blue)}<span>治療B</span>${bar(...STONES.B[s], COL.orange)}`).join('') : `<span class="h">全員</span><span>治療A</span>${bar(...tot('A'), COL.blue)}<span>治療B</span>${bar(...tot('B'), COL.orange)}`;
            verdict($(el, '.res'), k ? 'ok' : 'warn', k ? '石の大きさで分けると、<b>どちらのグループでも治療Aの方が成功率が高い</b>のに、全体ではBが上回っていました。Aは<b>治りにくい大きな石の人</b>を多く担当していたためです。' : '全体で見ると、<b>治療Bの方が成功率が高く</b>見えます。では、Bの方が良い治療なのでしょうか？'); }).el); },
        desc:'グループ分けをすると傾向が逆転することを<b>シンプソンのパラドックス</b>と言います（実際の腎臓結石の研究データが元になった有名な例です）。グループごとの人数のかたよりが原因。「全体の数字」だけで比べるときは、<b>中身の構成が同じかどうか</b>を必ず確かめましょう。',
        prompt:'キャンペーンAとBの成約率を比べたら、全体ではBが高かった。でも顧客の種類（新規・既存）で分けると逆になる気がする。属性ごとに分けた成約率と人数の表を作って、全体の結果をそのまま信じてよいか判断して。' },
    ], null, true),
    { title:'因果を確かめる方法', note:'「本当に原因か」を確かめる強さの順です。',
      table:{ head:['方法', 'やり方', '強さ'], rows:[['ランダムに分けて試す（A/Bテスト）', '対象をくじ引きで2つに分け、片方だけに施策をする', '◎ 一番確実'], ['前後で比べる＋比べる相手', '施策をした所としない所の、前後の変化の差を見る（差の差）', '○'], ['条件をそろえて比べる', '規模・地域・季節などが同じもの同士で比べる', '△ そろえきれない原因が残る'], ['相関を見るだけ', '2つの数字が一緒に動くかを見る', '× 原因かどうかは分からない']] } },
    S('相関と因果の用語', [
      T('相関', 'Correlation', '2つの量が一緒に増えたり減ったりする関係。', null, ['基本']),
      T('相関係数', 'Correlation coefficient (r)', '−1〜1 で直線的な関係の強さを表す数字。'),
      T('散布図', 'Scatter plot', '2つの量を縦と横にとって点を打ったグラフ。相関を見る基本。'),
      T('因果関係', 'Causation', '一方が原因で、もう一方が結果になる関係。'),
      T('交絡因子', 'Confounding variable', '両方に影響して、見かけの相関を作る隠れた原因。', null, ['最重要']),
      T('擬似相関', 'Spurious correlation', '因果のない、たまたま・交絡による相関。'),
      T('シンプソンのパラドックス', 'Simpson\'s paradox', 'グループに分けると、全体の傾向が逆転すること。'),
      T('逆の因果', 'Reverse causation', '原因と結果を取り違えること（「病院に行く人ほど病気」）。'),
      T('回帰分析', 'Regression analysis', 'ある量を、ほかの量で説明・予測する式を作る方法。'),
    ]),
  ]});
})();
