/* グラフ・データ可視化辞典 — B: ダッシュボードとKPI / データの準備 / ライブラリとツール / 地図と応用 */
(function(){
const { $, $$, esc, seg, tbl } = KIT;
const { keep, S, C, T, verdict, SER, SEQ, seq5, DIVR, DIVB, STATUS, isDark, nf, lin, ticks, niceMax, rng, gauss, quart, mean, size, rbar, tip, showTip, draw, sw, leg, gridY, barChart, lineChart, donut, scatter, corr, spark, PREF, tileMap } = DVH;
const MONTHS = Array.from({ length:12 }, (_, i) => `${i + 1}月`);

/* ================= 5. ダッシュボードとKPI ================= */
const KPIS = [
  ['今月の売上', [1142, 1284], (v) => '¥' + nf(v) + '万', false, [980, 1010, 1060, 1040, 1100, 1142, 1170, 1210, 1284]],
  ['新規会員', [3164, 3420], (v) => nf(v) + '人', false, [2700, 2900, 2850, 3050, 3164, 3220, 3300, 3420]],
  ['解約率', [2.5, 2.1], (v) => v.toFixed(1) + '%', true, [3.1, 2.9, 2.8, 2.7, 2.5, 2.4, 2.2, 2.1]],
  ['平均単価', [3850, 3760], (v) => '¥' + nf(v), false, [3600, 3700, 3820, 3900, 3850, 3800, 3790, 3760]],
];
const KPIDEF = [['PV（ページビュー）', '表示されたページの数', '多い＝良いとは限らない（迷って何ページも見ている場合も）'], ['UU（ユニークユーザー）', '訪れた人の数（重複なし）', '期間の決め方で数が変わる'], ['CVR（コンバージョン率）', '訪問のうち、購入・登録などに至った割合', '何を「成果」とするかを決めておく'], ['直帰率・離脱率', '1ページだけで帰った割合／そのページで去った割合', 'ページの役割によって良し悪しが違う'], ['CPA・ROAS', '1件の成果にかかった広告費／広告費に対する売上', '広告の効率を見る'], ['MRR・ARR', '毎月・毎年くり返し入る売上（サブスク）', '決済・収益化辞典も参照'], ['チャーン率（解約率）', '一定期間に解約した会員の割合', '<b>下がる方が良い</b>（色の向きに注意）'], ['LTV', '1人のお客さまが生涯でもたらす売上', 'LTV ＞ 獲得コスト になっているか'], ['ARPU', '1人あたりの平均売上', '値上げ・プラン構成の効果を見る'], ['DAU / MAU', '1日・1か月に使った人の数。DAU÷MAU で「毎日使われ度」', 'アプリ・SNSでよく使う'], ['継続率（リテンション）', '登録から◯日後・◯か月後に使い続けている割合', 'コホート表で見る'], ['NPS', '「人にすすめたいか」0〜10点で聞く満足度の指標', '推奨者−批判者の割合']];

TABS.push({ id:'dashboard', label:'ダッシュボード', icon:'🧭',
  intro:'ダッシュボードは「<b>状況を一目で判断して、次の行動を決める</b>」ための画面です。一番上に大事な数字（KPI）、次に推移、下に詳細、という<b>読む順番</b>が基本。目標との比較・継続率（コホート）・ファネルなど、サービス運営でよく使う見せ方をまとめます。',
  sections:[
    C('触って理解する', [
      { name:'KPIタイル', en:'KPI tiles', h:450, tags:['KPI','体験','定番'],
        demo:'<div class="kt"><span class="sw"></span><div class="dv-kpis ks"></div><div class="kt-verdict res">解約率は<b>下がると良い</b>指標なので、下がったときに緑になります。</div></div>',
        init:(el) => { $(el, '.sw').replaceWith(seg(['今月', '先月'], (p) => { $(el, '.ks').innerHTML = KPIS.map(([k, vals, f, inv, sp]) => { const cur = p ? vals[0] : vals[1], prev = p ? vals[0] * (1 - .05) : vals[0], d = (cur - prev) / prev * 100, up = d >= 0, good = inv ? !up : up, isPt = k === '解約率';
              return `<div class="dv-kpi"><span class="k">${k}</span><span class="v">${f(cur)}</span><span class="d ${good ? 'up' : 'down'}">${up ? '▲' : '▼'} ${isPt ? Math.abs(cur - prev).toFixed(1) + 'pt' : Math.abs(d).toFixed(1) + '%'} <span style="color:var(--dv-muted);font-weight:500">前月比</span></span>${spark(p ? sp.slice(0, -1) : sp, SER[0])}</div>`; }).join(''); }).el); },
        desc:'ダッシュボードの一番上に置く<b>大きな数字のカード</b>。<b>今の値・前と比べた変化・小さな推移の線（スパークライン）</b>の3点セットが定番です。変化の色は「上がったら緑」ではなく<b>「良くなったら緑」</b>。解約率やエラー数のように、下がる方が良い指標は色を逆にします。',
        prompt:'管理画面のトップに KPI タイルを4つ並べて（売上・新規会員・解約率・平均単価）。前月比を％で表示し、良くなったら緑の▲、悪くなったら赤の▼（解約率は下がる方が良い）、下にスパークラインを付けて。スマホでは2列に折り返して。' },
      { name:'ダッシュボードの配置', en:'Dashboard layout', h:440, tags:['レイアウト','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="dv-layout ly"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const L = [['良い配置', 'repeat(4, 1fr)', 'auto 2fr 1.2fr', [['KPI：売上', '1 / 1 / 2 / 2'], ['KPI：会員', '1 / 2 / 2 / 3'], ['KPI：解約率', '1 / 3 / 2 / 4'], ['KPI：単価', '1 / 4 / 2 / 5'], ['推移（主役のグラフ）', '2 / 1 / 3 / 4'], ['内訳（横棒）', '2 / 4 / 3 / 5'], ['明細（表）・ダウンロード', '3 / 1 / 4 / 5']], 'ok', '✓ <b>左上から右下へ（Zの順）</b>、大事な順に。KPI→推移→内訳→明細と、<b>大まかから細かく</b>。主役のグラフは大きく。'],
            ['悪い配置', 'repeat(4, 1fr)', '1fr 1fr 1fr', [['3Dの円グラフ', '1 / 1 / 3 / 3'], ['ゲージ', '1 / 3 / 2 / 4'], ['ゲージ', '1 / 4 / 2 / 5'], ['明細の表（100行）', '2 / 3 / 3 / 5'], ['推移のグラフ（小さい）', '3 / 1 / 4 / 2'], ['KPI（一番下）', '3 / 2 / 4 / 3'], ['凡例だけの枠', '3 / 3 / 4 / 5']], 'bad', '❌ 一番大事な数字が<b>一番下</b>、場所を取る円グラフとゲージが上に、推移のグラフは小さく…。<b>どこから見ればいいか分かりません</b>。']];
          $(el, '.sw').replaceWith(seg(L.map(l => l[0]), i => { const [, c, r, items, cls, msg] = L[i], ly = $(el, '.ly'); ly.style.gridTemplateColumns = c; ly.style.gridTemplateRows = r; ly.innerHTML = items.map(([t, a], j) => `<div style="grid-area:${a}">${i ? '' : `<b>${j + 1}</b>`}${t}</div>`).join(''); verdict($(el, '.res'), cls, msg); }).el); },
        desc:'人の視線は<b>左上から右下へ</b>動きます。一番大事なKPIを左上に、次に推移、最後に明細の表、という<b>大まか → 細かい</b>の順に並べると、数秒で状況がつかめます。1画面に詰め込みすぎず、<b>「誰が・何を判断するための画面か」</b>を決めてから作りましょう。',
        prompt:'営業チーム向けのダッシュボードを設計して。目的は「今月の目標に届きそうか、どの商品が足を引っぱっているか」を朝1分で判断すること。上から KPI タイル・目標との進み具合・商品別の内訳・明細の表の順に、Next.js と Recharts で作って。' },
      { name:'目標と実績（ゲージとバレット）', en:'Gauge vs bullet chart', h:420, tags:['目標','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="dv-surf dv-pad"><div class="dv-plot pl"></div></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const G = [['売上', 8200, 10000, '万円'], ['新規会員', 3420, 3300, '人'], ['問い合わせ対応', 86, 95, '%'], ['アプリ評価', 4.3, 4.5, '点']];
          const RD = (i) => { const box = $(el, '.pl'); keep(box, () => RD(i)); const { W, H } = size(box); let g = '';
            if (!i){ const n = G.length, cw = W / Math.min(n, W < 420 ? 2 : 4), rows = Math.ceil(n / Math.floor(W / cw)), ch = H / rows, R = Math.min(cw / 2 - 12, ch * .55);
              G.forEach(([k, v, t, u], j) => { const col = j % Math.floor(W / cw), row = Math.floor(j / Math.floor(W / cw)), cx = col * cw + cw / 2, cy = row * ch + ch * .62, p = Math.min(1.2, v / t) / 1.2, a = Math.PI * (1 - p), arc = (a0, a1, c, w) => `<path d="M${cx + Math.cos(a0) * R},${cy - Math.sin(a0) * R}A${R},${R} 0 0 1 ${cx + Math.cos(a1) * R},${cy - Math.sin(a1) * R}" style="fill:none;stroke:${c};stroke-width:${w}"/>`;
                g += arc(Math.PI, 0, 'var(--dv-grid)', 10) + arc(Math.PI, a, SER[0], 10) + `<text x="${cx}" y="${cy - 4}" text-anchor="middle" style="font-size:15px;font-weight:800;fill:var(--dv-ink)">${nf(v / t * 100)}%</text><text x="${cx}" y="${cy + 14}" text-anchor="middle" class="dv-lbl">${k}</text>`; });
              verdict($(el, '.res'), 'warn', '半円のゲージは<b>場所を取るわりに、目標までの差が読み取りにくい</b>。4つ並べると画面の大半を使います。'); }
            else { const m = { l:86, r:16, t:6, b:4 }, rh = (H - m.t - m.b) / G.length, iw = W - m.l - m.r;
              G.forEach(([k, v, t, u], j) => { const mx = t * 1.25, x = lin(0, mx, m.l, m.l + iw), y0 = m.t + j * rh, bh = Math.min(26, rh * .5), yc = y0 + rh / 2;
                g += [[mx, 'var(--dv-grid)'], [t, 'color-mix(in srgb, var(--dv-ink) 12%, var(--dv-surface))'], [t * .7, 'color-mix(in srgb, var(--dv-ink) 20%, var(--dv-surface))']].map(([e, c]) => `<rect x="${m.l}" y="${yc - bh / 2}" width="${x(e) - m.l}" height="${bh}" style="fill:${c}"/>`).join('');
                g += `<path d="${rbar(m.l, yc - bh / 6, x(Math.min(v, mx)) - m.l, bh / 3, 'r', 2)}" style="fill:${SER[0]}" data-tip="${esc(`<b>${k}</b><br>実績 <b>${nf(v, 1)}${u}</b><br>目標 <b>${nf(t, 1)}${u}</b>（${nf(v / t * 100)}%）`)}"/><line x1="${x(t)}" x2="${x(t)}" y1="${yc - bh / 2 - 2}" y2="${yc + bh / 2 + 2}" style="stroke:var(--dv-ink);stroke-width:2.5"/>`;
                g += `<text x="${m.l - 8}" y="${yc - 2}" text-anchor="end" style="font-weight:700;fill:var(--dv-ink)">${k}</text><text x="${m.l - 8}" y="${yc + 11}" text-anchor="end" class="dv-lbl">${nf(v / t * 100)}%</text>`; });
              verdict($(el, '.res'), 'ok', '✓ <b>バレットチャート</b>：青い棒＝実績、黒い縦線＝目標、背景の濃淡＝「悪い・普通・良い」の範囲。<b>コンパクトに並べて比べられます</b>。'); }
            draw(box, W, H, g); }; $(el, '.sw').replaceWith(seg(['ゲージ', 'バレットチャート'], RD).el); },
        desc:'目標に対する進み具合は、車のメーターのような<b>ゲージ</b>より、<b>バレットチャート</b>（棒＋目標線＋背景の範囲）の方が、少ない場所で正確に伝わります。複数の目標を縦に並べて比べられるのも利点。単純な進捗なら、細い<b>進捗バー</b>だけでも十分です。',
        prompt:'営業目標の達成状況をバレットチャートで表示して。各行に「実績の棒・目標の縦線・背景に3段階（未達・ほぼ達成・達成）の濃淡」、左に項目名と達成率、ホバーで実績と目標の数値を表示して。' },
      { name:'ファネル（どこで離脱しているか）', en:'Conversion funnel', h:430, tags:['分析','体験'],
        demo:'<div class="kt"><label class="kt-row" style="font-size:11.5px"><input type="checkbox" class="imp">カート→購入手続きを改善（+30%）したら？</label><div class="dv-surf dv-pad"><div class="dv-funnel fn" style="position:relative;display:flex;flex-direction:column;justify-content:space-around;flex:1"></div></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const ST = [['サイト訪問', 10000], ['商品を見た', 4200], ['カートに入れた', 1300], ['購入手続きへ', 620], ['購入完了', 410]];
          const run = () => { const imp = $(el, '.imp').checked, v = ST.map(s => s[1]); if (imp){ v[3] = Math.round(v[3] * 1.3); v[4] = Math.round(v[4] * 1.3); } const mx = v[0];
            $(el, '.fn').innerHTML = ST.map(([n], i) => `<div><span style="width:96px;flex:none;text-align:right;font-weight:700">${n}</span><i style="width:${Math.max(1, v[i] / mx * 100) * .62}%;${imp && i >= 3 ? 'background:var(--dv3)' : ''}" data-tip="${esc(`${n}：<b>${nf(v[i])}人</b>`)}"></i><span><b>${nf(v[i])}</b>人</span>${i ? `<span class="drop">${i === 2 || (i === 3 && !imp) ? '⚠ ' : ''}次へ ${nf(v[i] / v[i - 1] * 100)}%</span>` : ''}</div>`).join(''); tip($(el, '.fn'));
            verdict($(el, '.res'), imp ? 'ok' : 'warn', imp ? `購入は <b>${nf(v[4])}人</b>（+${nf(v[4] - 410)}人）。一番細くなっている段を改善すると、最後の数字が大きく変わります。` : '一番大きく減っているのは「商品を見た → カート」（31%）と「カート → 購入手続き」（48%）。<b>どこを直せば一番効くか</b>が分かります。'); };
          $(el, '.imp').onchange = run; run(); },
        desc:'訪問から購入までの<b>段階ごとの人数</b>を並べ、どこで多くの人が去っているか（離脱）を見つけるグラフ。各段の「次へ進んだ割合」を添えると、改善すべき場所がはっきりします。一番細くなっている段を直すと、最終的な成果が大きく変わります。',
        prompt:'ECサイトの購入ファネル（訪問→商品閲覧→カート→購入手続き→購入完了）を、アクセス解析のイベントから集計して横棒で表示して。各段に前の段からの通過率を表示し、通過率が一番低い段を強調して。' },
      { name:'継続率（コホート表）', en:'Cohort retention', h:440, tags:['分析','体験'],
        demo:'<div class="kt"><div class="dv-surf dv-pad"><div class="dv-title">登録月ごとの継続率（%）</div><div class="dv-plot pl"></div></div><div class="kt-verdict res">右へ行くほど登録からの経過月。<b>下の行（最近の登録）ほど色が濃い＝続いている</b>なら、改善が効いています。</div></div>',
        init:(el) => { const box = $(el, '.pl'), { W, H } = size(box), rows = ['1月', '2月', '3月', '4月', '5月', '6月'], cols = seq5(box), dark = isDark(box), m = { l:40, t:18 }, cw = (W - m.l) / 6, ch = (H - m.t) / 6;
          let g = Array.from({ length:6 }, (_, k) => `<text class="dv-lbl" x="${m.l + k * cw + cw / 2}" y="12" text-anchor="middle">${k}か月後</text>`).join('');
          rows.forEach((r, i) => { g += `<text class="dv-lbl" x="${m.l - 6}" y="${m.t + i * ch + ch / 2 + 4}" text-anchor="end">${r}登録</text>`; for (let k = 0; k < 6 - i; k++){ const v = k ? Math.round(100 * (0.42 + i * .025) * Math.pow(.86 + i * .012, k - 1)) : 100, c = Math.min(4, Math.floor(v / 21)), light = dark ? c >= 3 : c <= 1;
              g += `<rect x="${m.l + k * cw + 1}" y="${m.t + i * ch + 1}" width="${cw - 2}" height="${ch - 2}" rx="3" style="fill:${cols[c]}" data-tip="${esc(`${r}に登録した人の<br>${k}か月後の継続率：<b>${v}%</b>`)}"/>${cw > 30 ? `<text x="${m.l + k * cw + cw / 2}" y="${m.t + i * ch + ch / 2 + 4}" text-anchor="middle" style="fill:${light ? '#0b0b0b' : '#fff'};font-weight:700" pointer-events="none">${v}</text>` : ''}`; } });
          draw(box, W, H, g); },
        desc:'同じ月に登録した人たち（<b>コホート</b>）が、その後何%残っているかを並べた表。行が登録月、列が経過月です。サービスの改善が「最近の登録者ほど長く使ってくれる」形で効いているかが分かります。サブスク・アプリの健康診断に欠かせません。',
        prompt:'ユーザーの登録月ごとの継続率（コホート表）を作って。users テーブルの created_at と、activity テーブルの最終利用月から、登録月×経過月の継続率をSQLで集計し、1色の濃淡のヒートマップで表示して。' },
      { name:'小さなグラフを並べる', en:'Small multiples', h:460, tags:['比較','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="sm" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(150px, 1fr));gap:6px;flex:1;min-height:0"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const R = ['関東', '近畿', '中部', '九州', '東北', '北海道'], r = rng(23), D = R.map((n, i) => { let v = [260, 150, 110, 70, 45, 30][i]; return MONTHS.map(() => Math.round(v = v * (1 + gauss(r) * .04 + (i === 3 ? .03 : 0)))); }), mx = niceMax(Math.max(...D.flat()), 4);
          $(el, '.sw').replaceWith(seg(['目盛りをそろえる', 'バラバラの目盛り'], i => { $(el, '.sm').innerHTML = R.map(n => `<div class="dv-surf" style="display:flex;flex-direction:column;padding:4px 6px;min-height:84px"><div class="dv-sub" style="font-weight:700;color:var(--dv-ink)">${n}</div><div class="dv-plot"></div></div>`).join('');
            $$(el, '.sm .dv-plot').forEach((p, j) => lineChart(p, { xs:MONTHS, series:[{ n:R[j], c:SER[0], v:D[j] }], yMax:i ? undefined : mx, yMin:0, ml:30, lblW:60, unit:'百万円' }));
            verdict($(el, '.res'), i ? 'bad' : 'ok', i ? '❌ 目盛りがバラバラだと、北海道（3千万）と関東（2.6億）が<b>同じくらいの大きさに見えます</b>。形の比較だけが目的なら可だが、必ず明記を。' : '✓ 同じ目盛りなので、地域の<b>大きさの違い</b>と、九州だけが伸びていることが正しく比べられます。'); }).el); },
        desc:'系列が多いときは、1つのグラフに重ねずに<b>同じ形の小さなグラフを並べる</b>（スモールマルチプル）と、それぞれの動きが見やすくなります。比べるときは<b>目盛りをそろえる</b>のが基本。そろえないと、小さい地域が大きく見えてしまいます。',
        prompt:'都道府県別の月間売上を、小さな折れ線グラフのグリッド（スモールマルチプル）で表示して。全部のグラフで縦軸の範囲をそろえ、画面幅に合わせて列数が変わるようにし、上に並べ替え（売上順・伸び率順）の切り替えを付けて。' },
    ], null, true),
    { title:'Webサービスでよく見る指標（KPI）', note:'指標は「何を良くしたいか」から選びます。<b>増えると良い指標と、減ると良い指標</b>があるので、色の向きに注意。',
      table:{ head:['指標', '意味', '注意点'], rows:KPIDEF } },
    S('ダッシュボードの知識', [
      T('KPI と KGI', 'KPI / KGI', 'KGI＝最終目標（年間売上1億円）、KPI＝そこへ向かう途中の目安（月の新規会員数）。', null, ['基本']),
      T('北極星指標', 'North Star Metric', 'チーム全員が追う、たった1つの指標（例：週に1回以上使う人の数）。'),
      T('先行指標と遅行指標', 'Leading / lagging', '結果（売上）は遅れて分かる。その前に動く数字（問い合わせ数・試用開始数）も見ると、早く手を打てる。'),
      T('前月比・前年同月比', 'MoM / YoY', '季節で波があるサービスは、前年の同じ月と比べる方が正しい。'),
      T('ポイントとパーセント', 'pt vs %', '割合の差は「ポイント」。2.5%→2.1%は「0.4ポイント減」（16%減ではない言い方に注意）。'),
      T('しきい値とアラート', 'Thresholds / alerts', '「解約率が3%を超えたら通知」のように、見に行かなくても気づける仕組み。'),
      T('コホート', 'Cohort', '同じ時期に登録・購入した人のグループ。時期ごとの違いを比べる。'),
      T('セグメント', 'Segment', '年代・地域・プランなどで分けたグループ。平均だけでは見えない差が分かる。'),
      T('虚栄の指標', 'Vanity metrics', '増えると気分は良いが、判断に使えない数字（累計登録者数など）。行動につながる数字を選ぶ。', null, ['注意']),
      T('更新頻度', 'Refresh rate', 'リアルタイムが必要か、1日1回で十分か。必要以上に速いと費用と負荷が増える。'),
      T('データの鮮度表示', 'Last updated', '「◯時◯分時点」を画面に表示。古い数字で判断しないために。'),
      T('権限と見せる範囲', 'Access control', '売上や個人情報を含むダッシュボードは、見られる人を限定する（セキュリティ辞典）。', null, ['注意']),
    ]),
  ]});

/* ================= 6. データの準備 ================= */
const CSV0 = '月,売上,広告費\n1月,120,30\n2月,135,32\n3月,150,40\n4月,160,38\n5月,155,35\n6月,170,45\n7月,190,52\n8月,210,60';
const ORD = [['1月', 'りんご', '東京', 1200], ['1月', 'みかん', '大阪', 800], ['1月', 'りんご', '大阪', 1500], ['2月', 'ぶどう', '東京', 2400], ['2月', 'りんご', '東京', 900], ['2月', 'みかん', '福岡', 700], ['3月', 'ぶどう', '大阪', 2100], ['3月', 'りんご', '福岡', 1300], ['3月', 'みかん', '東京', 600], ['3月', 'ぶどう', '東京', 2600]];
function parseCSV(text){ const rows = text.trim().split(/\r?\n/).map(l => l.split(',').map(c => c.trim())); const head = rows.shift() || []; const bad = []; const data = rows.filter((r, i) => { if (r.length !== head.length){ bad.push(i + 2); return false; } return true; }); const num = (s) => { const v = parseFloat(String(s).replace(/[¥,%円\s]/g, '')); return isNaN(v) ? null : v; }; const cols = head.map((h, j) => ({ h, j, numeric:j > 0 && data.length && data.every(r => num(r[j]) != null) })); return { head, data, bad, cols, num }; }

TABS.push({ id:'data', label:'データの準備', icon:'🧹',
  intro:'グラフの質は<b>データの準備</b>で決まります。CSVの形、集計（グループ化）、欠けたデータの扱い、平均と中央値の違い、%とポイント、相関と因果…。ここを間違えると、<b>見た目がきれいでも間違ったグラフ</b>になります。',
  sections:[
    C('触って理解する', [
      { name:'CSVを貼り付けてグラフに', en:'CSV to chart', h:500, tags:['体験','CSV'], wide:true,
        demo:'<div class="kt"><div class="dv-two" style="grid-template-columns:minmax(0, 2fr) minmax(0, 3fr)"><div style="padding:0"><span class="kt-lbl">CSV（1行目は見出し）</span><textarea class="kt-in dv-csv tx" spellcheck="false" style="flex:1" aria-label="CSV"></textarea></div><div class="dv-surf" style="padding:8px"><span class="sw"></span><div class="lg"></div><div class="dv-plot pl"></div></div></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let kind = 0, tm; const tx = $(el, '.tx'); tx.value = CSV0;
          const run = () => { const { head, data, bad, cols, num } = parseCSV(tx.value), nc = cols.filter(c => c.numeric).slice(0, 8); if (!data.length || !nc.length){ $(el, '.pl')._last = null; $(el, '.pl').innerHTML = ''; $(el, '.lg').innerHTML = ''; verdict($(el, '.res'), 'bad', '数値の列が見つかりません。1列目に項目名、2列目以降に数字を入れてください。'); return; }
            const ser = nc.map((c, i) => ({ n:c.h, c:SER[i], v:data.map(r => num(r[c.j])) })), cats = data.map(r => r[0]); $(el, '.lg').innerHTML = ser.length > 1 ? leg(ser) : `<div class="dv-title">${esc(ser[0].n)}</div>`;
            if (kind) barChart($(el, '.pl'), { cats, series:ser }); else lineChart($(el, '.pl'), { xs:cats, series:ser, direct:ser.length <= 4 });
            const skipped = cols.filter(c => c.j > 0 && !c.numeric).map(c => c.h); verdict($(el, '.res'), bad.length || skipped.length ? 'warn' : 'ok', `${data.length}行 × 数値の列 ${nc.length}個を読み込みました。` + (bad.length ? `<br>⚠ 列の数が合わない行を飛ばしました：${bad.join('・')}行目` : '') + (skipped.length ? `<br>⚠ 数字以外を含む列は使っていません：${skipped.map(esc).join('・')}` : '')); };
          $(el, '.sw').replaceWith(seg(['折れ線', '棒'], i => { kind = i; run(); }).el); tx.oninput = () => { clearTimeout(tm); tm = setTimeout(run, 250); }; },
        desc:'表計算ソフトやサービスから書き出した <b>CSV</b>（カンマ区切りの表）は、グラフの材料の基本形です。<b>1行目に見出し、1列目に項目名（月など）、2列目以降に数字</b>の形にしておくと、どのグラフツールでもそのまま使えます。数字に「円」「,」が混ざる・列の数がずれる、がよくあるつまずきです。',
        prompt:'CSVファイルをアップロードすると、自動でグラフを作る画面を作って。1列目を横軸、数値の列を系列として折れ線か棒を選べるようにし、「¥」「,」「%」は取り除いて数値にする。列数が合わない行や数値にできない値は、何行目かを表示して知らせて。' },
      { name:'集計（グループ化）', en:'Group by & aggregate', h:470, tags:['集計','体験'],
        demo:'<div class="kt"><div class="kt-row"><span class="g1"></span><span class="g2"></span></div><div class="kt-code cd"></div><div class="dv-two"><div class="kt-tblwrap tb" style="padding:0"></div><div class="dv-surf" style="padding:6px"><div class="dv-plot pl"></div></div></div></div>',
        init:(el) => { let by = 1, ag = 0; const BY = ['月', '商品', '地域'], AG = [['合計', 'SUM'], ['平均', 'AVG'], ['件数', 'COUNT']];
          const run = () => { const g = {}; ORD.forEach(r => { const k = r[by]; (g[k] = g[k] || []).push(r[3]); }); const keys = Object.keys(g), val = (a) => ag === 0 ? a.reduce((x, y) => x + y, 0) : ag === 1 ? Math.round(mean(a)) : a.length;
            $(el, '.cd').innerHTML = `<span class="k">SELECT</span> ${BY[by]}, <span class="k">${AG[ag][1]}</span>(${ag === 2 ? '*' : '金額'}) <span class="k">FROM</span> 注文 <span class="k">GROUP BY</span> ${BY[by]};`;
            $(el, '.tb').innerHTML = tbl(['月', '商品', '地域', '金額'], ORD, { colCls:(j) => j === by ? 'hl' : '' });
            barChart($(el, '.pl'), { cats:keys, series:[{ n:AG[ag][0], c:SER[0], v:keys.map(k => val(g[k])) }], vlab:true, unit:ag === 2 ? '件' : '円', ml:40 }); };
          $(el, '.g1').replaceWith(seg(BY.map(b => b + 'ごと'), i => { by = i; run(); }, 1).el); $(el, '.g2').replaceWith(seg(AG.map(a => a[0]), i => { ag = i; run(); }).el); },
        desc:'1件ずつの記録（注文）を、<b>切り口（商品・地域・月）ごとにまとめて</b>、合計・平均・件数を出すのが集計です。グラフの多くは「集計した結果」を描いたもの。SQL なら <code>GROUP BY</code>、表計算ならピボットテーブル、JavaScript なら <code>reduce</code> で行います。',
        prompt:'注文データ（日付・商品・地域・金額）を、選んだ切り口（月・商品・地域）と集計方法（合計・平均・件数）で集計して棒グラフにする関数を TypeScript で書いて。同じ集計を Supabase の SQL で行う版も付けて。' },
      { name:'欠けたデータの扱い', en:'Missing values', h:420, tags:['データ','体験','よくある失敗'],
        demo:'<div class="kt"><span class="sw"></span><div class="dv-surf dv-pad"><div class="dv-title">1日の注文数（5〜7日目は計測停止）</div><div class="dv-plot pl"></div></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const xs = Array.from({ length:14 }, (_, i) => `${i + 1}日`), raw = [42, 45, 40, 48, null, null, null, 50, 47, 52, 49, 55, 53, 58];
          const V = [['線を切る', raw, 'ok', '✓ <b>データがない所は線を切る</b>のが正直。ツールチップにも「データなし」と出します。'], ['0として扱う', raw.map(v => v ?? 0), 'bad', '❌ 注文が<b>0件だったかのよう</b>に見え、「何があった！？」と誤解されます。計測停止と0件は別物です。'], ['前後をつなぐ', raw.map((v, i) => v ?? Math.round(48 + (50 - 48) * (i - 3) / 4)), 'warn', '△ 線はなめらかですが、<b>推測の値</b>です。使うなら点線にする・注記を入れるなど、推測だと分かるように。']];
          $(el, '.sw').replaceWith(seg(V.map(v => v[0]), i => { lineChart($(el, '.pl'), { xs, series:[{ n:'注文数', c:SER[0], v:V[i][1], dash:i === 2 }], unit:'件', lblW:30 }); verdict($(el, '.res'), V[i][2], V[i][3]); }).el); },
        desc:'計測漏れ・停止などで<b>データが欠けている</b>とき、0で埋めると「本当に0だった」ように見えてしまいます。基本は<b>線を切って空白にする</b>。補う（前後から推測する）なら、点線や注記で推測だと分かるようにします。データベースでは NULL と 0 を区別して保存しましょう。',
        prompt:'日別の集計で、データがない日が0として表示されてしまいます。データがない日は null のままにして、グラフでは線を切って表示し、ツールチップに「データなし」と出るように直して（Recharts なら connectNulls={false}）。' },
      { name:'平均と中央値', en:'Mean vs median', h:400, tags:['統計','体験'],
        demo:'<div class="kt"><label class="kt-row" style="font-size:11.5px"><input type="checkbox" class="ad">年収5,000万円の社長を加える</label><div class="dv-surf dv-pad"><div class="dv-title">社員の年収（万円）</div><div class="dv-plot pl"></div></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const base = [320, 350, 380, 400, 420, 450, 480, 520, 600];
          const run = () => { keep($(el, '.pl'), run); const v = $(el, '.ad').checked ? [...base, 5000] : base, mu = mean(v), md = quart(v).med, box = $(el, '.pl'), { W, H } = size(box), m = { l:14, r:14 }, mx = niceMax(Math.max(...v) * 1.05, 5), x = lin(0, mx, m.l, W - m.r), cy = H * .5;
            let g = ticks(0, mx, Math.max(2, Math.floor(W / 80))).map(t => `<line class="dv-grid" x1="${x(t)}" x2="${x(t)}" y1="${cy - 30}" y2="${cy + 30}"/><text class="dv-lbl" x="${x(t)}" y="${cy + 44}" text-anchor="middle">${nf(t)}</text>`).join('');
            g += v.map((d, i) => `<circle cx="${x(d)}" cy="${cy + (i % 2 ? -7 : 7)}" r="6" class="mk" style="fill:${d > 1000 ? SER[1] : SER[0]}" data-tip="${esc(`年収 <b>${nf(d)}万円</b>`)}"/>`).join('');
            g += `<line x1="${x(mu)}" x2="${x(mu)}" y1="${cy - 40}" y2="${cy + 22}" style="stroke:var(--dv2);stroke-width:2;stroke-dasharray:4 3"/><text x="${x(mu)}" y="${cy - 44}" text-anchor="${x(mu) > W * .7 ? 'end' : 'middle'}" style="font-weight:800;fill:var(--dv-ink)">平均 ${nf(mu)}</text><line x1="${x(md)}" x2="${x(md)}" y1="${cy - 22}" y2="${cy + 26}" style="stroke:var(--dv-ink);stroke-width:2"/><text x="${x(md)}" y="${cy + 60}" text-anchor="middle" style="font-weight:800;fill:var(--dv-ink)">中央値 ${nf(md)}</text>`;
            draw(box, W, H, g); verdict($(el, '.res'), $(el, '.ad').checked ? 'warn' : '', $(el, '.ad').checked ? `1人加わっただけで<b>平均は${nf(mu)}万円</b>に跳ね上がりましたが、<b>中央値は${nf(md)}万円</b>とほぼ変わりません。「ふつうの人」を表すには中央値が向いています。` : `平均 ${nf(mu)}万円、中央値 ${nf(md)}万円。偏りがないと、ほぼ同じ値になります。`); };
          $(el, '.ad').onchange = run; run(); },
        desc:'<b>平均</b>は全部足して人数で割った値、<b>中央値</b>は小さい順に並べた真ん中の値。極端な値（外れ値）が1つあるだけで、平均は大きく動きますが、中央値はほとんど動きません。年収・購入金額・滞在時間など<b>偏りのあるデータは中央値</b>も一緒に見ましょう。',
        prompt:'購入金額の集計で、平均だけでなく中央値・上位10%の値も表示して。一部の大口注文で平均が引っぱられているか分かるよう、ヒストグラムと一緒にダッシュボードに出して。' },
      { name:'％とポイント', en:'Percent vs percentage points', h:380, tags:['計算','体験'],
        demo:'<div class="kt"><div class="kt-row"><label style="font-size:12px">前 <input type="number" class="kt-in a" value="10" step="0.1" style="width:80px">%</label><label style="font-size:12px">後 <input type="number" class="kt-in b" value="12" step="0.1" style="width:80px">%</label></div><div class="dv-surf dv-pad bars" style="justify-content:center;gap:8px"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const run = () => { const a = +$(el, '.a').value || 0, b = +$(el, '.b').value || 0, d = b - a, rel = a ? d / a * 100 : 0, mx = Math.max(a, b, 1);
            $(el, '.bars').innerHTML = [['前', a, SER[1]], ['後', b, SER[0]]].map(([n, v, c]) => `<div style="display:flex;align-items:center;gap:8px;font-size:12px"><span style="width:20px">${n}</span><i style="display:block;height:22px;border-radius:0 4px 4px 0;background:${c};width:${v / mx * 75}%"></i><b>${v}%</b></div>`).join('');
            verdict($(el, '.res'), '', `差は <b>${d >= 0 ? '+' : ''}${d.toFixed(1)}ポイント</b>（割合どうしの引き算）<br>前と比べると <b>${rel >= 0 ? '+' : ''}${rel.toFixed(1)}%</b>（変化の割合）<br>「${a}%から${b}%に<b>${Math.abs(rel).toFixed(0)}%${d >= 0 ? '増' : '減'}</b>」と言うと大げさに、「<b>${Math.abs(d).toFixed(1)}ポイント${d >= 0 ? '増' : '減'}</b>」と言うと控えめに聞こえます。`); };
          $$(el, 'input').forEach(i => i.oninput = run); run(); },
        desc:'割合どうしの差は<b>「ポイント」</b>で表します。10%→12%は「<b>2ポイント</b>増」であり、変化の割合で言えば「<b>20%</b>増」。どちらも正しいですが、印象が大きく違います。グラフや報告では<b>どちらの意味かをはっきり</b>書きましょう。',
        prompt:'ダッシュボードの前月比の表示で、率の指標（CVR・解約率）は「ポイント」、量の指標（売上・会員数）は「%」で表示し分けるようにして。表示の単位（pt / %）も明記して。' },
      { name:'相関と因果', en:'Correlation is not causation', h:430, tags:['統計','体験','注意'],
        demo:'<div class="kt"><label class="kt-row" style="font-size:11.5px"><input type="checkbox" class="cl">気温で色分けする</label><div class="dv-surf dv-pad"><div class="lg"></div><div class="dv-plot pl"></div></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const r = rng(55), P = Array.from({ length:30 }, () => { const t = 8 + r() * 26; return { t, x:Math.round(20 + t * 9 + gauss(r) * 25), y:Math.max(0, Math.round((t - 18) * 6 + gauss(r) * 12 + 10)) }; });
          const run = () => { const on = $(el, '.cl').checked, cs = [SEQ[250], SEQ[450], SEQ[650]], ci = (t) => t < 18 ? 0 : t < 27 ? 1 : 2;
            scatter($(el, '.pl'), { pts:P.map(p => ({ x:p.x, y:p.y, c:on ? cs[ci(p.t)] : SER[0], tip:`アイスの売上 <b>${p.x}</b>個<br>熱中症の人 <b>${p.y}</b>人<br>気温 <b>${p.t.toFixed(0)}℃</b>` })), xLab:'アイスの売上（個）', yLab:'熱中症の人（人）', trend:!on });
            $(el, '.lg').innerHTML = on ? `<div class="dv-leg">${['18℃未満', '18〜27℃', '27℃以上'].map((n, i) => `<span>${sw(cs[i])}${n}</span>`).join('')}</div>` : '';
            verdict($(el, '.res'), on ? 'ok' : 'warn', on ? '✓ 本当の原因は<b>気温</b>でした。暑い日ほど、アイスも熱中症も増えます（隠れた要因＝交絡）。' : `相関係数 r = <b>${corr(P).toFixed(2)}</b>。強い関係がありますが…<b>アイスを売ると熱中症が増える</b>のでしょうか？`); };
          $(el, '.cl').onchange = run; run(); },
        desc:'2つの数字が一緒に動いていても（相関）、<b>片方がもう片方の原因</b>（因果）とは限りません。裏に<b>共通の原因</b>（この例では気温）が隠れていることがよくあります。「この機能を使う人は解約しにくい」も、もともと熱心な人が使っているだけかもしれません。確かめるには<b>A/Bテスト</b>が確実です。',
        prompt:'「プッシュ通知をオンにしている人は継続率が高い」というデータがあります。これが因果関係かどうかを確かめる方法（交絡の可能性・A/Bテストの設計）を、非エンジニアにも分かるように教えて。' },
      { name:'移動平均でならす', en:'Moving average', h:400, tags:['データ','体験'],
        demo:'<div class="kt"><label class="kt-row" style="font-size:11.5px"><input type="checkbox" class="ma" checked>7日移動平均を表示</label><div class="dv-surf dv-pad"><div class="lg"></div><div class="dv-plot pl"></div></div></div>',
        init:(el) => { const r = rng(77), xs = Array.from({ length:90 }, (_, i) => `${i + 1}日`), v = xs.map((_, i) => Math.round(100 + i * .6 + (i % 7 >= 5 ? 35 : 0) + gauss(r) * 12)), ma = v.map((_, i) => i < 6 ? null : Math.round(mean(v.slice(i - 6, i + 1))));
          const run = () => { const on = $(el, '.ma').checked, ser = on ? [{ n:'毎日の値', c:'var(--dv-gray)', v, w:1.5 }, { n:'7日移動平均', c:SER[0], v:ma }] : [{ n:'毎日の値', c:SER[0], v }]; $(el, '.lg').innerHTML = ser.length > 1 ? leg(ser) : '<div class="dv-title">毎日の値（週末に跳ねる）</div>'; lineChart($(el, '.pl'), { xs, series:ser, lblW:40 }); };
          $(el, '.ma').onchange = run; run(); },
        desc:'毎日の値は、曜日や偶然で<b>ギザギザ</b>します。直近7日の平均を毎日計算してつなぐ<b>移動平均</b>にすると、週末の波が消えて<b>本当の傾向</b>が見えます。元の値は薄く残しておくと、ならし過ぎていないか確かめられます。',
        prompt:'日別のアクティブユーザー数のグラフに、7日移動平均の線を重ねて。元の値は薄い灰色の細い線、移動平均は太い色付きの線にして、最初の6日は移動平均を表示しない（null）ようにして。' },
    ], null, true),
    S('データの準備の用語', [
      T('CSV', 'Comma-separated values', 'カンマ区切りの表のファイル。Excel・スプレッドシートで書き出せる。<b>文字コード（UTF-8）</b>に注意。', null, ['基本']),
      T('整然データ（縦持ち）', 'Tidy / long data', '1行に1件の記録、1列に1つの項目。「月・商品・売上」の3列。グラフツールや集計に向く。', null, ['おすすめ']),
      T('横持ち', 'Wide data', '月を列に並べた表（1月・2月・3月…）。人には見やすいがツールでは扱いにくいことがある。'),
      T('欠損値（NULL）', 'Missing values', 'データがないこと。<b>0とは別</b>。グラフでは線を切る・注記を入れる。'),
      T('外れ値', 'Outliers', '極端な値。入力ミスなら直す、本物なら残して中央値などで見る。消すときは理由を記録する。'),
      T('正規化（人口あたり等）', 'Normalization', '大きさの違うものを比べるため、人口・会員数などで割る。「10万人あたり」など。'),
      T('指数化', 'Indexing', '最初を100にそろえて、伸び率を比べる。単位の違う量も1つのグラフで比べられる。'),
      T('累計', 'Cumulative', '足し続けた合計。必ず右上がりになるので、伸びが鈍っていても気づきにくい。', null, ['注意']),
      T('移動平均', 'Moving average', '直近◯日の平均。曜日のくせ・偶然のギザギザをならす。'),
      T('季節性', 'Seasonality', '毎年同じ時期にくり返す波（年末・夏休み）。前年同月比で比べる。'),
      T('対数軸', 'Log scale', '1→10→100のように、目盛りが掛け算で増える軸。桁の違う値や、倍々で増えるデータに。'),
      T('サンプル数', 'Sample size', 'データの件数。少ないと偶然の影響が大きい。割合を出すときは母数も表示する。'),
      T('タイムゾーンと日付の区切り', 'Time zones', 'UTCで保存したデータを日本時間で日別に集計すると、0時〜9時の分がずれる。'),
      T('A/Bテスト', 'A/B testing', '利用者をランダムに2つに分けて、違いが本当に効果かどうかを確かめる方法。因果を調べる王道。'),
    ]),
  ]});

/* ================= 7. ライブラリとツール ================= */
const LIBCODE = [
  ['Chart.js', 'import Chart from "chart.js/auto";\n\nnew Chart(document.getElementById("c"), {\n  type: "line",\n  data: {\n    labels: ["1月", "2月", "3月", "4月"],\n    datasets: [{ label: "売上", data: [120, 135, 150, 160], borderColor: "#2a78d6" }],\n  },\n  options: {\n    interaction: { mode: "index", intersect: false }, // 同じ月をまとめて表示\n    plugins: { legend: { display: false } },\n    scales: { y: { beginAtZero: true } },\n  },\n});', '設定だけで描ける。Canvas 描画で軽い。まず試すならこれ'],
  ['Recharts', 'import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";\n\nconst data = [{ m: "1月", v: 120 }, { m: "2月", v: 135 }, { m: "3月", v: 150 }];\n\nexport function Sales() {\n  return (\n    <ResponsiveContainer width="100%" height={240}>\n      <LineChart data={data}>\n        <CartesianGrid vertical={false} stroke="#e1e0d9" />\n        <XAxis dataKey="m" />\n        <YAxis />\n        <Tooltip />\n        <Line dataKey="v" name="売上" stroke="#2a78d6" strokeWidth={2} dot={false} />\n      </LineChart>\n    </ResponsiveContainer>\n  );\n}', 'React の部品として書ける。Next.js で定番。shadcn/ui の Chart もこれ'],
  ['ECharts', 'import * as echarts from "echarts";\n\nconst chart = echarts.init(document.getElementById("c"));\nchart.setOption({\n  xAxis: { type: "category", data: ["1月", "2月", "3月"] },\n  yAxis: { type: "value" },\n  tooltip: { trigger: "axis" },\n  dataZoom: [{ type: "slider" }],   // 範囲選択も1行\n  series: [{ type: "line", data: [120, 135, 150], color: "#2a78d6" }],\n});', '高機能・大量データに強い。地図・ズーム・3Dも'],
  ['D3', 'import * as d3 from "d3";\n\nconst x = d3.scalePoint().domain(months).range([40, width - 10]);\nconst y = d3.scaleLinear().domain([0, d3.max(values)]).nice().range([height - 20, 10]);\nconst line = d3.line().x((d, i) => x(months[i])).y(d => y(d));\n\nconst svg = d3.select("#c").append("svg").attr("viewBox", [0, 0, width, height]);\nsvg.append("path").attr("d", line(values))\n   .attr("fill", "none").attr("stroke", "#2a78d6").attr("stroke-width", 2);\nsvg.append("g").attr("transform", `translate(0,${height - 20})`).call(d3.axisBottom(x));\nsvg.append("g").attr("transform", "translate(40,0)").call(d3.axisLeft(y));', '何でも作れる部品集。自由だが手間がかかる。独自の表現に'],
  ['Observable Plot', 'import * as Plot from "@observablehq/plot";\n\nconst chart = Plot.plot({\n  y: { grid: true, label: "売上" },\n  marks: [\n    Plot.lineY(data, { x: "month", y: "sales", stroke: "#2a78d6" }),\n    Plot.ruleY([0]),\n    Plot.tip(data, Plot.pointerX({ x: "month", y: "sales" })),\n  ],\n});\ndocument.getElementById("c").append(chart);', 'D3 の作者たちによる短く書ける版。分析・試作に'],
  ['Vega-Lite', '{\n  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",\n  "data": { "values": [{ "m": "1月", "v": 120 }, { "m": "2月", "v": 135 }] },\n  "mark": { "type": "line", "tooltip": true },\n  "encoding": {\n    "x": { "field": "m", "type": "ordinal", "title": "月" },\n    "y": { "field": "v", "type": "quantitative", "title": "売上" }\n  }\n}', 'JSONでグラフを宣言。AIに作らせやすく、保存・共有も簡単'],
];
const LIBS = [['Chart.js', 'JS', 'Canvas', '設定だけで手軽。基本のグラフはひと通り', '◎ 入門'], ['Recharts', 'React', 'SVG', 'React部品。Next.js・shadcn/ui と相性◎', '◎ React'], ['Nivo / Victory / visx', 'React', 'SVG・Canvas', 'デザイン性が高い・細かく作り込める', '○'], ['Apache ECharts', 'JS', 'Canvas・SVG', '高機能。大量データ・地図・ズーム', '◎ 大規模'], ['ApexCharts', 'JS', 'SVG', 'ダッシュボード向けの見た目がそろっている', '○'], ['uPlot', 'JS', 'Canvas', '<b>とても速い</b>時系列グラフ（数十万点）', '○ 性能'], ['D3.js', 'JS', 'SVG・Canvas', '部品から自由に組み立てる。学習コスト高', '△ 上級'], ['Observable Plot', 'JS', 'SVG', 'D3 を短く書ける。分析向け', '○'], ['Vega-Lite', 'JSON', 'SVG・Canvas', '宣言型。AIに書かせやすい', '○'], ['Plotly', 'JS・Python', 'SVG・WebGL', '科学・分析向け。Python と同じ書き方', '○'], ['Highcharts', 'JS', 'SVG', '高機能・高品質。<b>商用は有料ライセンス</b>', '△ 有料'], ['Tremor / shadcn Charts', 'React', 'SVG', 'ダッシュボード部品がそろった Tailwind 製', '◎ 管理画面']];
const BI = [['Looker Studio', '無料', 'Googleのサービス・スプレッドシートと連携。共有が簡単'], ['Metabase', '無料（自分で設置）', 'データベースにつないで質問形式でグラフ。社内向け'], ['Grafana', '無料あり', 'サーバー監視・時系列。アラートも'], ['Tableau', '有料', '本格的な分析・可視化。表現力が高い'], ['Power BI', '有料（無料版あり）', 'Excel・Microsoft 製品と連携'], ['Evidence', '無料', 'SQL と Markdown でレポートサイトを作る'], ['Streamlit', '無料', 'Python だけでデータアプリ・ダッシュボード']];
function lttb(d, th){ const n = d.length; if (th >= n || th < 3) return d; const out = [d[0]], every = (n - 2) / (th - 2); let a = 0;
  for (let i = 0; i < th - 2; i++){ const s = Math.floor((i + 1) * every) + 1, e = Math.min(n, Math.floor((i + 2) * every) + 1); let ax = 0, ay = 0; for (let j = s; j < e; j++){ ax += d[j][0]; ay += d[j][1]; } ax /= (e - s) || 1; ay /= (e - s) || 1;
    const rs = Math.floor(i * every) + 1, re = Math.floor((i + 1) * every) + 1; let best = -1, nx = rs; for (let j = rs; j < re; j++){ const ar = Math.abs((d[a][0] - ax) * (d[j][1] - d[a][1]) - (d[a][0] - d[j][0]) * (ay - d[a][1])); if (ar > best){ best = ar; nx = j; } } out.push(d[nx]); a = nx; }
  out.push(d[n - 1]); return out; }

TABS.push({ id:'libs', label:'ライブラリとツール', icon:'📚',
  intro:'Webでグラフを描く方法は、<b>ライブラリを使う</b>（Chart.js・Recharts・ECharts など）か、<b>BIツールを使う</b>（Looker Studio など）かの大きく2つ。描き方（SVG / Canvas）による速さの違い、データが多いときの<b>間引き</b>、スマホでの見せ方も押さえましょう。',
  sections:[
    C('触って理解する', [
      { name:'同じグラフを各ライブラリで', en:'Same chart, six libraries', h:520, tags:['ライブラリ','比較'], wide:true,
        demo:'<div class="kt"><span class="sw"></span><div class="dv-two" style="grid-template-columns:minmax(0, 3fr) minmax(0, 2fr)"><div class="kt-code cd" style="overflow:auto;white-space:pre;padding:8px 10px"></div><div class="dv-surf"><div class="dv-title">できあがり（イメージ）</div><div class="dv-plot pl"></div></div></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.sw').replaceWith(seg(LIBCODE.map(l => l[0]), i => { $(el, '.cd').textContent = LIBCODE[i][1]; verdict($(el, '.res'), '', `<b>${LIBCODE[i][0]}</b>：${LIBCODE[i][2]}`); if (!$(el, '.pl svg')) lineChart($(el, '.pl'), { xs:['1月', '2月', '3月', '4月'], series:[{ n:'売上', c:SER[0], v:[120, 135, 150, 160] }] }); }).el); },
        desc:'同じ「4か月の売上の折れ線」を、代表的なライブラリで書いた例です。<b>設定を渡すだけ</b>（Chart.js・ECharts）、<b>Reactの部品</b>（Recharts）、<b>部品から組み立てる</b>（D3）、<b>JSONで宣言</b>（Vega-Lite）と書き方はさまざま。React のサイトなら Recharts、大量データなら ECharts、が迷ったときの目安です。',
        prompt:'Next.js（App Router）のダッシュボードにグラフを入れたい。Recharts と ECharts のどちらが合うか、データ量（最大5万点）・必要な操作（ズーム・ツールチップ）・SSR の扱いを踏まえて比較して、選んだ方で売上の折れ線グラフを実装して。' },
      { name:'SVG と Canvas の速さ', en:'SVG vs Canvas rendering', h:440, tags:['性能','体験'],
        demo:'<div class="kt"><div class="kt-row"><span class="kt-lbl">点の数</span><span class="sw"></span></div><div class="kt-row"><button type="button" class="kt-btn pri s1">SVGで描く</button><button type="button" class="kt-btn pri s2">Canvasで描く</button></div><div class="dv-surf dv-plot pl"></div><div class="kt-verdict res">ボタンを押すと、描くのにかかった時間を測ります。</div></div>',
        init:(el) => { let n = 5000; const box = $(el, '.pl'), r = rng(3);
          $(el, '.sw').replaceWith(seg(['1,000', '5,000', '20,000', '50,000'], i => { n = [1000, 5000, 20000, 50000][i]; }, 1).el);
          const pts = () => Array.from({ length:n }, () => [r(), Math.min(1, Math.max(0, .5 + gauss(r) * .18))]);
          $(el, '.s1').onclick = () => { const { W, H } = size(box), p = pts(), t0 = performance.now(); box.innerHTML = `<svg width="${W}" height="${H}" style="position:absolute;inset:0">${p.map(([x, y]) => `<circle cx="${(x * W).toFixed(1)}" cy="${(y * H).toFixed(1)}" r="1.6" fill="#2a78d6" fill-opacity=".5"/>`).join('')}</svg>`; box.getBoundingClientRect(); requestAnimationFrame(() => { const ms = performance.now() - t0; verdict($(el, '.res'), ms > 200 ? 'bad' : ms > 60 ? 'warn' : 'ok', `SVG：${nf(n)}個の点に <b>${nf(ms)}ミリ秒</b>（要素も${nf(n)}個増えます）`); }); };
          $(el, '.s2').onclick = () => { box.innerHTML = ''; const t0 = performance.now(), p = pts(), { ctx, w, h } = VD.canvas(box); ctx.fillStyle = 'rgba(42,120,214,.5)'; p.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x * w, y * h, 1.6, 0, 6.3); ctx.fill(); }); requestAnimationFrame(() => { const ms = performance.now() - t0; verdict($(el, '.res'), ms > 200 ? 'bad' : ms > 60 ? 'warn' : 'ok', `Canvas：${nf(n)}個の点に <b>${nf(ms)}ミリ秒</b>（要素は1個だけ）`); }); }; },
        desc:'グラフの描き方には、点や線を1つずつ部品（要素）にする <b>SVG</b> と、1枚の絵として描く <b>Canvas</b> があります。SVG は<b>くっきり・操作しやすい・数千点まで</b>、Canvas は<b>数万点以上でも速い</b>。さらに多い（数十万〜）なら WebGL を使うライブラリを選びます。',
        prompt:'センサーの10万点の時系列データをブラウザで表示したい。SVG のライブラリだと重いので、Canvas か WebGL で描くライブラリ（uPlot・ECharts など）を比べて選び、ズーム操作付きで実装して。' },
      { name:'間引いて軽くする（ダウンサンプリング）', en:'Downsampling (LTTB)', h:440, tags:['性能','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="dv-surf dv-pad"><div class="lg"></div><div class="dv-plot pl"></div></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const r = rng(91), N = 20000; let v = 50; const raw = Array.from({ length:N }, (_, i) => [i, v = v + gauss(r) * .8 + (i % 4000 === 2000 ? 25 : 0) - (i % 4000 === 2400 ? 25 : 0)]);
          const M = [['元のデータ（2万点）', () => raw], ['単純に間引く', () => raw.filter((_, i) => i % Math.ceil(N / 300) === 0)], ['形を残す（LTTB）', () => lttb(raw, 300)]];
          const RD = (i) => { keep($(el, '.pl'), () => RD(i)); const d = M[i][1](), box = $(el, '.pl'), { W, H } = size(box), ys = raw.map(p => p[1]), mn = Math.min(...ys), mx = Math.max(...ys), x = lin(0, N - 1, 6, W - 6), y = lin(mn, mx, H - 6, 6);
            const ghost = i ? `<path d="${lttb(raw, Math.min(2000, W * 2)).map((p, j) => (j ? 'L' : 'M') + x(p[0]).toFixed(1) + ',' + y(p[1]).toFixed(1)).join('')}" style="fill:none;stroke:var(--dv-gray);stroke-width:1"/>` : '';
            draw(box, W, H, ghost + `<path d="${d.map((p, j) => (j ? 'L' : 'M') + x(p[0]).toFixed(1) + ',' + y(p[1]).toFixed(1)).join('')}" style="fill:none;stroke:${SER[0]};stroke-width:${i ? 1.5 : .6}"/>`);
            $(el, '.lg').innerHTML = i ? leg([{ n:'元のデータ', c:'var(--dv-gray)' }, { n:'間引いた後', c:SER[0] }]) : ''; verdict($(el, '.res'), i === 1 ? 'bad' : 'ok', i === 0 ? `2万点。画面の幅は${W}ピクセルなので、<b>1ピクセルに何十点も</b>重なっています。` : i === 1 ? '❌ 300点まで一定間隔で拾うと、<b>山や谷（急な変化）を見落とします</b>。' : '✓ LTTB は「形が変わらないように」点を選ぶ方法。<b>300点でも急な山がちゃんと残ります</b>。'); }; $(el, '.sw').replaceWith(seg(M.map(m => m[0]), RD).el); },
        desc:'画面の幅は数百〜千数百ピクセルしかないので、何万点も描いても見た目は変わらず、重くなるだけです。点を減らす（<b>ダウンサンプリング</b>）と軽くなりますが、単純に間引くと大事な山や谷を見落とします。<b>LTTB</b> などの「形を残す」方法を使いましょう。ECharts には組み込まれています。',
        prompt:'1日分の秒単位のデータ（8万点）を折れ線グラフで表示するとブラウザが重いです。サーバー側で LTTB アルゴリズムを使って画面の幅に合わせた点数（約1000点）に間引いてから返すAPIにして、ズームしたら細かいデータを取り直すようにして。' },
      { name:'スマホでのグラフ', en:'Responsive charts', h:430, tags:['スマホ','体験'],
        demo:'<div class="kt"><span class="sw"></span><div style="flex:1;display:grid;place-items:center;min-height:0"><div class="ph" style="width:min(230px, 100%);height:100%;border:6px solid var(--stage-ink);border-radius:22px;padding:8px 6px;display:flex;flex-direction:column;gap:4px;background:var(--dv-surf, var(--dv-surface))"><div class="dv-title" style="font-size:11px">月別の売上</div><div class="dv-plot pl"></div></div></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const v = [120, 135, 150, 160, 155, 170, 190, 210, 200, 215, 230, 260];
          $(el, '.sw').replaceWith(seg(['PCのまま縮小', 'スマホ向けに作り直し'], i => { const box = $(el, '.pl');
            if (!i){ const { W, H } = size(box), m = { l:34, b:30 }, bw = (W - m.l - 4) / 12, y = lin(0, 300, H - m.b, 6); let g = gridY(y, [0, 100, 200, 300], m.l, W - 2, nf); v.forEach((d, j) => { g += `<rect x="${m.l + j * bw + 1}" y="${y(d)}" width="${bw - 2}" height="${y(0) - y(d)}" style="fill:${SER[0]}"/><text x="${m.l + j * bw + bw / 2}" y="${H - m.b + 10}" transform="rotate(55 ${m.l + j * bw + bw / 2} ${H - m.b + 10})" style="font-size:7px">2025年${j + 1}月</text>`; }); draw(box, W, H, g); verdict($(el, '.res'), 'bad', '❌ 文字が小さく斜めで読めない、棒が細すぎて<b>指でタップできない</b>。'); }
            else { barChart(box, { cats:MONTHS, series:[{ n:'売上', c:SER[0], v }], horiz:true, vlab:true, lw:30 }); verdict($(el, '.res'), 'ok', '✓ <b>横棒</b>にして縦にスクロール、ラベルは短く（「1月」）、値は棒の横に。<b>指で押せる大きさ</b>になります。'); } }).el); },
        desc:'PC向けのグラフをそのまま縮めると、文字が読めず指でも押せません。スマホでは<b>横棒に変える・ラベルを短くする・表示する期間や系列を減らす・値は直接書く</b>などの作り直しが必要です。画面幅に応じて、グラフの種類や設定を切り替えましょう。',
        prompt:'このダッシュボードのグラフをスマホ対応にして。画面幅が600px未満のときは、縦棒を横棒に、凡例は下に、ラベルは短縮形に、表示期間は直近6か月に切り替えて。ツールチップはタップで表示されるように。' },
    ], null, true),
    { title:'グラフライブラリの比較', note:'<b>React なら Recharts（または shadcn/ui の Chart）</b>、React 以外は Chart.js、大量データ・高機能なら ECharts、が迷ったときの目安。Highcharts は<b>商用利用が有料</b>なので注意。',
      table:{ head:['名前', '書き方', '描画', '特徴', '向き'], rows:LIBS } },
    { title:'BI・ノーコードのツール', note:'社内の数字を見るだけなら、<b>自分でグラフを作らずBIツール</b>を使う方が早くて安全なことも多いです。',
      table:{ head:['ツール', '料金', '特徴'], rows:BI } },
    S('ライブラリと実装の用語', [
      T('SVG', 'Scalable Vector Graphics', '図形を要素として描く。拡大してもくっきり・CSSで色を変えられる・1つずつ操作できる。数千点まで。'),
      T('Canvas', 'Canvas 2D', '1枚の絵として描く。数万点でも速いが、拡大でぼやけないよう解像度の調整が必要。'),
      T('WebGL のグラフ', 'WebGL charts', 'GPUで描く。数十万〜数百万点。deck.gl・Plotly（scattergl）・ECharts GL など。'),
      T('レスポンシブ', 'Responsive charts', '画面の幅に合わせて大きさ・設定を変える。Recharts は ResponsiveContainer で。'),
      T('SSR とグラフ', 'Server-side rendering', 'Next.js のサーバー側ではブラウザの機能が使えない。グラフ部品は "use client" にする・動的読み込みにする。', null, ['よくある失敗']),
      T('ダウンサンプリング', 'Downsampling', '点を減らして軽くする。LTTB は形を残す方法の定番。'),
      T('ツリーシェイク', 'Tree shaking', '使う部品だけを読み込んでファイルを小さくする。ECharts は必要なグラフだけ import する。'),
      T('テーマ', 'Theming', '色・文字・線の太さをまとめて設定。ダークモードに合わせて切り替える。'),
      T('アクセシビリティ', 'Accessible charts', 'グラフに説明文（aria-label）、データの表、キーボード操作。Highcharts などは機能が充実。'),
      T('画像として書き出す', 'Export', 'Canvas は toDataURL で PNG に。SVG はそのまま保存できる。資料に貼る用途に。'),
      T('ライセンス', 'License', 'Chart.js・ECharts・Recharts は MIT/Apache で無料。Highcharts・amCharts は商用有料。', null, ['注意']),
    ]),
  ]});

/* ================= 8. 地図と応用 ================= */
function squarify(items, x, y, w, h){
  const out = [], total = items.reduce((a, b) => a + b.v, 0), sc = w * h / total; let rest = items.map(it => ({ ...it, a:it.v * sc }));
  while (rest.length){ const short = Math.min(w, h), worst = (r) => { const s = r.reduce((a, b) => a + b.a, 0), mx = Math.max(...r.map(z => z.a)), mn = Math.min(...r.map(z => z.a)); return Math.max(short * short * mx / (s * s), s * s / (short * short * mn)); };
    let row = [rest[0]], i = 1; while (i < rest.length && worst([...row, rest[i]]) <= worst(row)){ row.push(rest[i]); i++; }
    const s = row.reduce((a, b) => a + b.a, 0);
    if (w >= h){ const cw = s / h; let yy = y; row.forEach(r => { const rh = r.a / cw; out.push({ ...r, x, y:yy, w:cw, h:rh }); yy += rh; }); x += cw; w -= cw; }
    else { const rh = s / w; let xx = x; row.forEach(r => { const rw = r.a / rh; out.push({ ...r, x:xx, y, w:rw, h:rh }); xx += rw; }); y += rh; h -= rh; }
    rest = rest.slice(row.length); }
  return out;
}
const BUDGET = [['広告', 'マーケ', 420], ['SNS運用', 'マーケ', 160], ['イベント', 'マーケ', 90], ['サーバー', '開発', 260], ['外注開発', '開発', 220], ['ツール代', '開発', 80], ['人件費', '運営', 520], ['オフィス', '運営', 140], ['その他', '運営', 60]];

TABS.push({ id:'more', label:'地図と応用', icon:'🗾',
  intro:'地域の違いを見せる<b>地図</b>、内訳を面積で見せる<b>ツリーマップ</b>、毎日の記録の<b>カレンダー</b>、増減の理由を見せる<b>ウォーターフォール</b>、流れを見せる<b>サンキー</b>、順位の変化の<b>スロープ</b>。目的がはっきりしたときに効く、一歩進んだグラフです。',
  sections:[
    C('触って理解する', [
      { name:'タイルグリッド地図', en:'Tile grid map of Japan', h:500, tags:['地図','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="dv-surf dv-pad"><div class="dv-plot pl"></div></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const r = rng(5), STORES = PREF.map(p => Math.round(p[3] * (0.6 + r() * .9) / 10)), PER = PREF.map((p, i) => STORES[i] / p[3] * 10);
          const V = [['人口', { label:'人口', unit:'万人' }, '', '2020年国勢調査の人口（概数）。<b>大都市圏が濃く</b>なります。'], ['架空：店舗数', { vals:STORES, label:'店舗数（架空）', fmt:(v) => nf(v) + '店' }, 'warn', '店舗数をそのまま塗ると、<b>人口の地図とほぼ同じ</b>に。「人が多い所に店が多い」以上のことは分かりません。'], ['架空：人口10万人あたり', { vals:PER, label:'10万人あたりの店舗数（架空）', fmt:(v) => v.toFixed(1) + '店' }, 'ok', '✓ <b>人口で割る（正規化）</b>と、本当に店が「多い・少ない」地域が見えます。']];
          $(el, '.sw').replaceWith(seg(V.map(v => v[0]), i => { tileMap($(el, '.pl'), V[i][1]); verdict($(el, '.res'), V[i][2], V[i][3] + '<br>本物の形の地図だと面積の大きい北海道が目立つので、<b>全都道府県を同じ大きさのマス</b>にしています。'); }).el); },
        desc:'都道府県ごとの違いは地図で見せると直感的ですが、普通の地図だと<b>面積の大きい県が目立ちすぎ</b>ます。全都道府県を同じ大きさのマスに置いた<b>タイルグリッド地図</b>なら、公平に比べられます。色を付ける値は、人口などで割った<b>割合</b>にするのが基本です。',
        prompt:'都道府県別の会員数を、タイルグリッド地図（47個の同じ大きさのマス）で表示して。値は人口10万人あたりに直して、1色の濃淡5段階で塗り、マスにマウスを乗せると県名と実数・割合を表示して。' },
      { name:'ツリーマップ', en:'Treemap', h:440, tags:['内訳','体験'],
        demo:'<div class="kt"><div class="dv-surf dv-pad"><div class="lg"></div><div class="dv-plot pl"></div></div></div>',
        init:(el) => { const G = ['マーケ', '開発', '運営'], col = (g) => SER[G.indexOf(g)], box = $(el, '.pl'), { W, H } = size(box), tot = BUDGET.reduce((a, b) => a + b[2], 0);
          const rects = squarify([...BUDGET].sort((a, b) => b[2] - a[2]).map(([n, g, v]) => ({ n, g, v })), 0, 0, W, H);
          draw(box, W, H, rects.map(r => `<rect x="${r.x + 1}" y="${r.y + 1}" width="${Math.max(0, r.w - 2)}" height="${Math.max(0, r.h - 2)}" rx="4" style="fill:${col(r.g)}" data-tip="${esc(`${sw(col(r.g))}${r.g} › <b>${r.n}</b><br>${nf(r.v)}万円（${nf(r.v / tot * 100, 1)}%）`)}"/>${r.w > 54 && r.h > 30 ? `<text x="${r.x + 7}" y="${r.y + 17}" style="fill:#fff;font-weight:800;font-size:11.5px" pointer-events="none">${r.n}</text><text x="${r.x + 7}" y="${r.y + 31}" style="fill:#fff;font-size:10.5px" pointer-events="none">${nf(r.v)}万円</text>` : ''}`).join(''));
          $(el, '.lg').innerHTML = leg(G.map(g => ({ n:g, c:col(g) }))); },
        desc:'内訳を<b>面積</b>で表すグラフ。項目が多くても1つの四角に収まり、「何が大きな割合を占めているか」が一目で分かります。色でグループ（部門）を分けると、階層も表せます。細かい値の比較は苦手なので、ツールチップで数字を補います。',
        prompt:'予算の内訳（部門 › 項目 › 金額）をツリーマップで表示して。部門ごとに色を分け、四角の中に項目名と金額（小さすぎる四角は省略）、マウスを乗せると割合も表示。クリックするとその部門だけに拡大できるようにして。' },
      { name:'カレンダーのヒートマップ', en:'Calendar heatmap', h:330, tags:['時系列','体験'],
        demo:'<div class="kt"><div class="dv-surf dv-pad" style="justify-content:center"><div class="dv-title">1年間の学習記録（日ごとの分数）</div><div class="cal" style="position:relative;overflow-x:auto;padding-bottom:4px"></div><div class="dv-ramp rp"></div></div></div>',
        init:(el) => { const r = rng(13), cols = seq5(el), dark = isDark(el), start = new Date(2025, 0, 1), off = start.getDay(); let cells = '';
          for (let i = 0; i < off; i++) cells += '<i style="visibility:hidden"></i>';
          for (let d = 0; d < 365; d++){ const dt = new Date(2025, 0, 1 + d), we = dt.getDay() % 6 === 0, v = r() < (we ? .45 : .2) ? 0 : Math.round(r() * (we ? 90 : 60) + (d > 200 ? 20 : 0)), c = v === 0 ? 'var(--dv-grid)' : cols[Math.min(4, Math.floor(v / 22))];
            cells += `<i style="background:${c}" data-tip="${esc(`${dt.getMonth() + 1}月${dt.getDate()}日：<b>${v}分</b>`)}"></i>`; }
          $(el, '.cal').innerHTML = `<div class="dv-cal" style="grid-auto-columns:minmax(9px, 1fr);min-width:${53 * 11}px">${cells}</div>`; tip($(el, '.cal'));
          $(el, '.rp').innerHTML = `0分<span><i style="background:var(--dv-grid)"></i>${cols.map(c => `<i style="background:${c}"></i>`).join('')}</span>90分以上`; },
        desc:'1マス＝1日で、1年分の記録を色の濃さで並べるグラフ（GitHub の草でおなじみ）。<b>続いている時期・休んだ時期・曜日のくせ</b>が一目で分かります。学習・運動・投稿などの習慣づくりアプリにぴったりです。',
        prompt:'習慣記録アプリに、GitHub の草のようなカレンダーのヒートマップを付けて。1年分を週ごとの列に並べ、記録の量で5段階の濃淡、記録がない日は薄い灰色、マスにマウスを乗せると日付と量を表示して。' },
      { name:'ウォーターフォール（増減の内訳）', en:'Waterfall chart', h:430, tags:['増減','体験'],
        demo:'<div class="kt"><div class="dv-surf dv-pad"><div class="dv-title">先月から今月へ、売上はなぜ変わった？（万円）</div><div class="dv-plot pl"></div></div></div>',
        init:(el) => { const ST = [['先月', 1000, 't'], ['新規', 180], ['既存の増加', 90], ['解約', -120], ['値引き', -40], ['今月', null, 't']], box = $(el, '.pl'), { W, H } = size(box), m = { l:44, r:8, t:18, b:22 }, iw = W - m.l - m.r, ih = H - m.t - m.b, bw = iw / ST.length, y = lin(0, 1200, m.t + ih, m.t);
          let acc = 0, g = gridY(y, ticks(0, 1200, 4), m.l, W - m.r, nf), prevTop = null;
          ST.forEach(([n, v, t], i) => { const x = m.l + i * bw + bw * .18, w = bw * .64; let a, b, c, lab;
            if (t){ if (v != null) acc = v; a = 0; b = acc; c = 'var(--dv-ink2)'; lab = nf(acc); } else { a = acc; b = acc + v; acc = b; c = v >= 0 ? DIVB[3] : DIVR[2]; lab = (v > 0 ? '+' : '') + v; }
            const top = Math.max(a, b), bot = Math.min(a, b); g += `<path d="${rbar(x, y(top), w, y(bot) - y(top), t ? 't' : v >= 0 ? 't' : 'b', 3)}" style="fill:${c}" data-tip="${esc(`<b>${n}</b>：${lab}万円`)}"/><text class="dv-dl" x="${x + w / 2}" y="${(t || v >= 0 ? y(top) - 5 : y(bot) + 13)}" text-anchor="middle">${lab}</text><text class="dv-lbl" x="${x + w / 2}" y="${H - 6}" text-anchor="middle">${n}</text>`;
            if (prevTop != null) g += `<line x1="${x - bw * .36}" x2="${x}" y1="${y(prevTop)}" y2="${y(prevTop)}" style="stroke:var(--dv-muted);stroke-dasharray:3 3"/>`; prevTop = acc; });
          draw(box, W, H, g + `<line class="dv-base" x1="${m.l}" x2="${W - m.r}" y1="${y(0)}" y2="${y(0)}"/>`); },
        desc:'「先月1,000万円 → 今月1,110万円」の<b>差がどこから生まれたか</b>を、増えた分（青）と減った分（赤）の積み重ねで見せるグラフ。最初と最後の合計の間に、増減の内訳が階段状に並びます。売上・利益・会員数の変化の説明に便利です。',
        prompt:'月次報告に、前月の売上から今月の売上までの増減を説明するウォーターフォールチャートを入れて。増加は青、減少は赤、合計は濃い灰色、各棒の上に増減額、棒と棒を点線でつないで。' },
      { name:'サンキー（流れ）', en:'Sankey diagram', h:460, tags:['流れ','体験'],
        demo:'<div class="kt"><div class="dv-surf dv-pad"><div class="dv-title">流入元 → 見たページ → 結果（1万人）</div><div class="dv-plot pl"></div></div></div>',
        init:(el) => { const N = [['検索', 0], ['SNS', 0], ['広告', 0], ['商品ページ', 1], ['ブログ', 1], ['すぐ離脱', 1], ['購入', 2], ['離脱', 2]], L = [[0, 3, 3000], [0, 4, 1200], [0, 5, 800], [1, 3, 1200], [1, 4, 1000], [1, 5, 800], [2, 3, 1300], [2, 4, 200], [2, 5, 500], [3, 6, 900], [3, 7, 4600], [4, 6, 200], [4, 7, 2200]];
          const box = $(el, '.pl'), { W, H } = size(box), nw = 12, pad = 10, colX = [70, W / 2 - nw / 2, W - 60 - nw], val = N.map((_, i) => Math.max(L.filter(l => l[0] === i).reduce((a, l) => a + l[2], 0), L.filter(l => l[1] === i).reduce((a, l) => a + l[2], 0)));
          const k = Math.min(...[0, 1, 2].map(c => (H - pad * (N.filter(n => n[1] === c).length - 1) - 4) / N.filter(n => n[1] === c).reduce((a, n) => a + val[N.indexOf(n)], 0))), pos = []; [0, 1, 2].forEach(c => { let yy = 2; N.forEach((n, i) => { if (n[1] === c){ pos[i] = { x:colX[c], y:yy, h:val[i] * k, o:0, ii:0 }; yy += val[i] * k + pad; } }); });
          const NC = (i) => i < 3 ? SER[i] : i === 6 ? SER[2] : 'var(--dv-gray)'; let g = '';
          L.forEach(([a, b, v]) => { const s = pos[a], t = pos[b], h = v * k, y0 = s.y + s.o, y1 = t.y + t.ii, x0 = s.x + nw, x1 = t.x, xm = (x0 + x1) / 2; s.o += h; t.ii += h; const src = a < 3 ? a : N[a][0] === '商品ページ' ? 3 : 4;
            g += `<path d="M${x0},${y0}C${xm},${y0} ${xm},${y1} ${x1},${y1}L${x1},${y1 + h}C${xm},${y1 + h} ${xm},${y0 + h} ${x0},${y0 + h}Z" style="fill:${a < 3 ? SER[a] : 'var(--dv-gray)'};opacity:.38" class="lk" data-tip="${esc(`${N[a][0]} → ${N[b][0]}：<b>${nf(v)}人</b>`)}"/>`; });
          N.forEach((n, i) => { const p = pos[i]; g += `<rect x="${p.x}" y="${p.y}" width="${nw}" height="${Math.max(1, p.h)}" rx="3" style="fill:${NC(i)}" data-tip="${esc(`<b>${n[0]}</b>：${nf(val[i])}人`)}"/><text x="${n[1] === 0 ? p.x - 5 : p.x + nw + 5}" y="${p.y + p.h / 2 + 4}" text-anchor="${n[1] === 0 ? 'end' : 'start'}" style="fill:var(--dv-ink);font-weight:700;font-size:11px">${n[0]}</text>`; });
          const svg = draw(box, W, H, g); svg.insertAdjacentHTML('afterbegin', '<style>.lk:hover{opacity:.75 !important}</style>'); },
        desc:'「どこから来て、どこへ流れたか」を、<b>帯の太さ＝人数</b>で表す図。流入元ごとに、商品ページに進んだ人・ブログを読んだ人・すぐ帰った人の流れが一目で分かります。お金の流れ・エネルギーの流れにも使われます。段が多すぎると読めなくなるので3段くらいまでに。',
        prompt:'アクセス解析のデータから「流入元 → 最初に見たページ → 購入/離脱」の流れをサンキー図で表示して。ECharts の sankey を使い、帯にマウスを乗せると人数と割合を表示し、流入元ごとに色を分けて。' },
      { name:'スロープグラフ（順位の変化）', en:'Slope chart', h:440, tags:['比較','体験'],
        demo:'<div class="kt"><div class="dv-surf dv-pad"><div class="dv-title">人気の機能ランキング　2024年 → 2025年（利用率%）</div><div class="dv-plot pl"></div></div></div>',
        init:(el) => { const D = [['検索', 62, 58], ['お気に入り', 48, 55], ['通知', 45, 31], ['ダークモード', 22, 41], ['共有', 30, 34], ['レビュー', 26, 19]], box = $(el, '.pl'), { W, H } = size(box), m = { t:22, b:10 }, nar = W < 380, lw = Math.min(110, W * .3), x0 = nar ? 30 : lw, x1 = W - (nar ? Math.min(110, W * .45) : lw), y = lin(10, 65, H - m.b, m.t);
          const place = (vals) => { const o = vals.map((v, i) => ({ i, y:y(v) })).sort((a, b) => a.y - b.y); for (let i = 1; i < o.length; i++) if (o[i].y - o[i - 1].y < 14) o[i].y = o[i - 1].y + 14; const r = []; o.forEach(z => r[z.i] = z.y); return r; };
          const la = place(D.map(d => d[1])), lb = place(D.map(d => d[2]));
          let g = `<text class="dv-lbl" x="${x0}" y="12" text-anchor="middle">2024年</text><text class="dv-lbl" x="${x1}" y="12" text-anchor="middle">2025年</text><line class="dv-base" x1="${x0}" x2="${x0}" y1="${m.t - 4}" y2="${H - m.b}"/><line class="dv-base" x1="${x1}" x2="${x1}" y1="${m.t - 4}" y2="${H - m.b}"/>`;
          D.forEach(([n, a, b], i) => { const d = b - a, c = Math.abs(d) < 5 ? 'var(--dv-gray)' : d > 0 ? DIVB[3] : DIVR[2], tp = esc(`<b>${n}</b><br>${a}% → ${b}%（${d > 0 ? '+' : ''}${d}ポイント）`);
            g += `<line x1="${x0}" y1="${y(a)}" x2="${x1}" y2="${y(b)}" style="stroke:${c};stroke-width:${Math.abs(d) < 5 ? 1.5 : 2.5}" data-tip="${tp}"/><circle cx="${x0}" cy="${y(a)}" r="4" class="mk" style="fill:${c}"/><circle cx="${x1}" cy="${y(b)}" r="4" class="mk" style="fill:${c}"/><text x="${x0 - 8}" y="${la[i] + 4}" text-anchor="end" style="font-size:11px">${nar ? '' : n + ' '}<tspan style="font-weight:700;fill:var(--dv-ink)">${a}</tspan></text><text x="${x1 + 8}" y="${lb[i] + 4}" style="font-size:11px"><tspan style="font-weight:700;fill:var(--dv-ink)">${b}</tspan> ${n}</text>`; });
          draw(box, W, H, g); },
        desc:'2つの時点の値を左右に置いて線で結ぶグラフ。<b>線の傾き</b>で、増えた（青）・減った（赤）・ほぼ同じ（灰色）が一目で分かり、<b>順位の入れ替わり</b>も見えます。ビフォー・アフターや、前年との比較に便利です。',
        prompt:'アンケートの「よく使う機能」の結果を、昨年と今年のスロープグラフで比較して。5ポイント以上増えた線は青、減った線は赤、それ以外は灰色の細い線にして、左右に機能名と値を、重ならないように並べて。' },
    ], null, true),
    S('地図と応用の用語', [
      T('コロプレス地図（塗り分け地図）', 'Choropleth', '地域を値で塗り分けた地図。<b>実数ではなく割合</b>（人口あたり等）で塗るのが基本。', null, ['定番']),
      T('タイルグリッド地図', 'Tile grid map', '地域を同じ大きさのマスで並べた地図。面積の差に引っぱられない。'),
      T('バブルマップ', 'Bubble map', '地図上に、量に比例した大きさの円を置く。実数を見せたいときに。'),
      T('GeoJSON / TopoJSON', 'Geo data formats', '地図の形のデータ形式。都道府県・市区町村の境界データが公開されている。TopoJSON は軽い。'),
      T('地図ライブラリ', 'Map libraries', '<b>Leaflet</b>（軽い）、<b>MapLibre</b>（無料のベクター地図）、Mapbox・Google Maps（有料枠あり）、deck.gl（大量データ）。'),
      T('ツリーマップ', 'Treemap', '内訳を面積で表す。階層のある大量の項目に。'),
      T('サンキー図', 'Sankey', '流れを帯の太さで表す。お金・人・エネルギーの流れ。'),
      T('ウォーターフォール', 'Waterfall', '増減の積み重ねで、最初から最後への変化の内訳を見せる。'),
      T('スロープグラフ', 'Slope chart', '2時点の比較を線の傾きで見せる。'),
      T('ワッフルチャート', 'Waffle chart', '10×10のマスで割合を表す。円グラフより数えやすい。'),
      T('バンプチャート', 'Bump chart', '順位の推移を線で見せる。ランキングの変化に。'),
      T('スパークライン', 'Sparkline', '文字や表の中に入れる小さな折れ線。軸は省略して形だけ。'),
      T('スモールマルチプル', 'Small multiples', '同じ形の小さなグラフを並べる。目盛りはそろえる。'),
    ]),
  ]});
})();
