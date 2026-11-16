/* 決済・収益化辞典 — A: 共通ヘルパー / 収益モデル / 価格の決め方 / 決済の仕組み（Stripe） / サブスクの管理 */
(function(){
const { $, $$, esc, tbl, seg, seq, stepper } = KIT;
const S = (title, items, note) => ({ title, note, layout:'rows', items });
const C = (title, items, note, lg) => ({ title, note, layout:lg ? 'cards lg' : 'cards', items });
const T = (name, en, desc, prompt, tags, more) => Object.assign({ name, en, desc, prompt, tags }, more || {});
const verdict = (el, cls, html) => { el.classList.remove('ok', 'bad', 'warn'); if (cls) el.classList.add(cls); el.innerHTML = html; };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const yen = (n) => '¥' + Math.round(n).toLocaleString();
const form = (box, defs, on) => { const st = {}; box.classList.add('py-form'); box.innerHTML = defs.map(([k, l, v, type]) => (st[k] = v, `<span>${l}</span><input class="kt-in" type="${type || 'number'}" data-k="${k}" value="${esc(v)}" aria-label="${l}">`)).join(''); $$(box, 'input').forEach(i => i.oninput = () => { st[i.dataset.k] = i.type === 'number' ? +i.value : i.value; on(st); }); on(st); return st; };
// 小さな折れ線（系列：{n, c, v:[]}）
function lines(svg, ser, o = {}){
  const W = svg.clientWidth || 300, H = svg.clientHeight || 120, m = { l:o.ml ?? 44, r:8, t:8, b:16 }, n = ser[0].v.length, mx = o.max || Math.max(...ser.flatMap(s => s.v), 1) * 1.08;
  const x = (i) => m.l + i / (n - 1) * (W - m.l - m.r), y = (v) => H - m.b - v / mx * (H - m.t - m.b);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = [0, .5, 1].map(f => `<line x1="${m.l}" x2="${W - m.r}" y1="${y(mx * f)}" y2="${y(mx * f)}" style="stroke:var(--border)"/><text x="${m.l - 4}" y="${y(mx * f) + 3}" text-anchor="end">${o.fmt ? o.fmt(mx * f) : Math.round(mx * f).toLocaleString()}</text>`).join('')
    + ser.map(s => `<path d="${s.v.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ',' + y(v).toFixed(1)).join('')}" style="fill:none;stroke:${s.c};stroke-width:2;${s.dash ? 'stroke-dasharray:5 4' : ''}"/>`).join('')
    + (o.xl || []).map(([i, t]) => `<text x="${x(i)}" y="${H - 3}" text-anchor="middle">${t}</text>`).join('') + (o.extra ? o.extra(x, y) : '');
}
window.PYH = { S, C, T, verdict, sleep, yen, form, lines };

/* ================= 1. 収益モデル ================= */
const MODELS = [
  ['買い切り', (i) => Math.round(900 * Math.exp(-i / 5) + 80), '一度払えばずっと使える。<b>最初に売上が集中</b>し、新しい人が来ないと減っていく。', 'アプリ・テンプレート・電子書籍'],
  ['サブスク', (i) => Math.round(60 * i + 40 * Math.min(i, 8)), '毎月払う。<b>積み上がって伸びる</b>（解約が少なければ）。売上の見通しが立てやすい。', 'SaaS・会員サービス・動画'],
  ['従量課金', (i) => Math.round((30 * i + 150) * (1 + .25 * Math.sin(i))), '使った分だけ払う。<b>使われるほど伸びる</b>が、月ごとの波が大きい。', 'API・ストレージ・AI機能'],
  ['フリーミアム', (i) => Math.round(i < 6 ? 15 * i : 90 + 75 * (i - 6)), '基本は無料、便利な機能は有料。<b>最初は伸びが遅い</b>。無料の人の数％が有料になる。', '個人向けアプリ・ツール'],
  ['広告', (i) => Math.round(40 + 22 * i), 'ページを見られた数（PV）で稼ぐ。<b>大量の人が来ないと小さい</b>。体験を損ねやすい。', 'メディア・ブログ・無料ゲーム'],
  ['手数料', (i) => Math.round(20 + 4 * i * i), '取引の◯％をもらう（マーケットプレイス）。<b>売り手と買い手が増えると一気に伸びる</b>。', 'フリマ・予約サイト・スキル売買'],
];
const UNIT = [['MRR', 'Monthly Recurring Revenue', '毎月くり返し入る売上。サブスクの一番大事な数字'], ['ARR', 'Annual Recurring Revenue', 'MRR × 12。年間の見込み'], ['チャーン率（解約率）', 'Churn rate', '1か月に解約する人の割合。<b>2%と5%で、数年後の売上は何倍も違う</b>'], ['LTV', 'Lifetime Value', '1人が生涯で払う金額の目安 ＝ 月額 ÷ 解約率（粗利で計算するとより正確）'], ['CAC', 'Customer Acquisition Cost', '1人を獲得するのにかかった費用（広告費など）'], ['LTV ÷ CAC', '', '<b>3倍以上</b>が健全とよく言われる目安'], ['回収期間', 'Payback period', '獲得費用を何か月で取り戻せるか ＝ CAC ÷ 月額'], ['ARPU', 'Average Revenue Per User', '1人あたりの平均売上']];

TABS.push({ id:'models', label:'収益モデル', icon:'💹',
  intro:'お金をもらう仕組み（<b>収益モデル</b>）には、買い切り・サブスク・従量課金・フリーミアム・広告・手数料などがあります。どれを選ぶかで、<b>売上の伸び方</b>も、作るべき機能（決済・会員管理・計測）も変わります。サブスクなら <b>MRR・解約率・LTV</b> の3つが命です。',
  sections:[
    C('触って理解する', [
      { name:'収益モデルの伸び方', en:'Revenue model shapes', h:430, tags:['基本','体験'],
        demo:'<div class="kt"><span class="sw"></span><svg class="py-chart ch" aria-hidden="true"></svg><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.sw').replaceWith(seg(MODELS.map(m => m[0]), i => { const [n, f, d, ex] = MODELS[i]; lines($(el, '.ch'), [{ n, c:'var(--accent)', v:Array.from({ length:24 }, (_, k) => f(k)) }], { xl:[[0, '1か月目'], [11, '12'], [23, '24か月目']], fmt:(v) => Math.round(v) + '万' }); verdict($(el, '.res'), '', `${d}<br><b>例：</b>${ex}<br><span style="color:var(--muted)">※グラフは月ごとの売上のイメージです。</span>`); }).el); },
        desc:'同じ人数が使っても、お金のもらい方で<b>売上の伸び方</b>が大きく違います。買い切りは最初に山があり、サブスクは積み上がり、広告は人数が多くないと小さい。モデルを組み合わせる（基本無料＋サブスク＋一部買い切り）ことも多いです。',
        prompt:'作っている家計簿アプリの収益モデルを考えたい。買い切り・サブスク・フリーミアム・広告それぞれの場合の、1年後の売上の目安、必要な機能（決済・会員管理）、利用者の受け止め方を比較して、おすすめを提案して。' },
      { name:'サブスクの数字（MRR・解約率・LTV）', en:'MRR / churn / LTV simulator', h:520, tags:['サブスク','体験','最重要'], wide:true,
        demo:'<div class="kt"><div class="py-two"><div><div class="fm"></div><div class="py-big bg"></div></div><div><svg class="py-chart ch" aria-hidden="true"></svg></div></div><div class="kt-verdict res"></div></div>',
        init:(el) => { form($(el, '.fm'), [['price', '月額（円）', 980], ['nw', '毎月の新規（人）', 120], ['churn', '解約率（%/月）', 5], ['cac', '1人の獲得費用（円）', 3000]], (st) => {
            const ch = Math.max(.1, st.churn) / 100, cs = [], cs2 = []; let c = 0, c2 = 0; for (let m = 0; m < 25; m++){ cs.push(c * st.price / 1e4); cs2.push(c2 * st.price / 1e4); c = c * (1 - ch) + st.nw; c2 = c2 * (1 - ch / 2) + st.nw; }
            const ltv = st.price / ch, ratio = ltv / Math.max(1, st.cac), pay = st.cac / Math.max(1, st.price), cap = st.nw / ch;
            $(el, '.bg').innerHTML = `<div><small>2年後のMRR</small><b>${Math.round(cs[24]).toLocaleString()}万円</b></div><div><small>LTV（1人の生涯）</small><b>${yen(ltv)}</b></div><div><small>LTV ÷ 獲得費用</small><b>${ratio.toFixed(1)}倍</b></div><div><small>頭打ちの人数</small><b>${Math.round(cap).toLocaleString()}人</b></div>`;
            lines($(el, '.ch'), [{ n:'今', c:'var(--accent)', v:cs }, { n:'半分', c:'var(--ok)', v:cs2, dash:true }], { xl:[[0, '0'], [12, '12か月'], [24, '24か月']], fmt:(v) => Math.round(v) + '万', extra:(x, y) => `<text x="${x(24) - 4}" y="${y(cs2[24]) - 5}" text-anchor="end" style="fill:var(--ok);font-weight:700">解約率が半分なら</text>` });
            verdict($(el, '.res'), ratio >= 3 ? 'ok' : ratio >= 1 ? 'warn' : 'bad', `解約率 ${st.churn}% なら、平均 <b>${(1 / ch).toFixed(0)}か月</b>使われ、LTV は <b>${yen(ltv)}</b>。獲得費用は <b>${pay.toFixed(1)}か月</b>で回収。<br>サブスクは「新規 ÷ 解約率」の人数で<b>頭打ち</b>になります。新規を増やすより<b>解約を減らす</b>方が効くことが多い（点線）。`); }); },
        desc:'サブスクの売上（MRR）は、<b>毎月の新規</b>と<b>解約率</b>で決まります。解約率5%なら平均20か月、2%なら50か月使われるので、1人の生涯の売上（<b>LTV</b>）が2.5倍に。獲得費用（CAC）がLTVの1/3以下なら健全、が目安。数字を変えて、2年後の売上を見てみましょう。',
        prompt:'Stripe のデータから、MRR・解約率・LTV・新規獲得数を毎月集計する管理画面を作って。customer.subscription の作成・削除イベントから月ごとの数字を計算し、グラフで推移を表示して。解約理由のアンケート結果も一緒に見られるように。' },
      { name:'無料から有料へ（フリーミアム）', en:'Freemium conversion', h:420, tags:['体験','判断'],
        demo:'<div class="kt"><div class="fm"></div><div class="py-big bg"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { form($(el, '.fm'), [['free', '無料の利用者（人）', 10000], ['cv', '有料になる割合（%）', 3], ['price', '月額（円）', 500], ['cost', '1人あたりのサーバー代（円/月）', 8]], (st) => { const paid = st.free * st.cv / 100, rev = paid * st.price, cost = st.free * st.cost;
            $(el, '.bg').innerHTML = `<div><small>有料の人</small><b>${Math.round(paid).toLocaleString()}人</b></div><div><small>売上</small><b>${yen(rev)}/月</b></div><div><small>無料の人の費用</small><b>${yen(cost)}/月</b></div><div><small>差し引き</small><b style="color:${rev - cost >= 0 ? 'var(--ok)' : 'var(--bad)'}">${yen(rev - cost)}</b></div>`;
            verdict($(el, '.res'), rev > cost ? 'ok' : 'bad', rev > cost ? '✓ 無料の人の費用を、有料の人がまかなえています。' : '❌ 無料の人のサーバー代が売上を上回っています。<b>AI機能など費用のかかる機能</b>を無料にしすぎていないか見直しましょう（回数制限・有料限定に）。'); }); },
        desc:'<b>フリーミアム</b>は、無料で多くの人に使ってもらい、その<b>数％</b>に有料プランを買ってもらうモデル。無料の人にもサーバー代がかかるので、「有料の人の売上 ＞ 無料の人の費用」になっているかが大事です。特に<b>AIの機能は1回ごとに費用</b>がかかるので、無料では回数を絞るのが定番です。',
        prompt:'このAIアプリの無料プランと有料プランの線引きを考えて。AI機能は1回あたりの原価がかかるので、無料は月◯回まで・有料は上限高め、のように原価と転換率から計算して提案して。回数の上限を超えたときの画面とアップグレードの導線も作って。' },
    ], null, true),
    { title:'サブスクの大事な数字', note:'<b>LTV ＞ CAC の3倍</b>、<b>月の解約率は低いほど良い</b>（個人向けは高くなりがち）。数字は会計ソフトや Stripe のダッシュボードでも確認できます。',
      table:{ head:['数字', '英語', '意味'], rows:UNIT } },
    S('収益モデルの用語', [
      T('買い切り', 'One-time purchase', '1回払えばずっと使える。アップデートの費用をどう回収するかが課題。'),
      T('サブスクリプション', 'Subscription', '毎月・毎年の定期払い。継続して価値を出し続ける必要がある。', null, ['定番']),
      T('従量課金', 'Usage-based pricing', '使った量に応じて払う。API・AI・ストレージ。上限の設定と見積もりのしやすさが大事。'),
      T('フリーミアム', 'Freemium', '基本無料＋有料機能。無料の範囲の決め方が成否を分ける。'),
      T('無料トライアル', 'Free trial', '一定期間、有料機能を無料で試せる。終了前のお知らせが親切（トラブル防止）。'),
      T('手数料モデル', 'Take rate', '取引額の一部を受け取る。売り手と買い手の両方を集める必要がある。'),
      T('粗利', 'Gross margin', '売上から直接の原価（サーバー・AI・決済手数料）を引いたもの。AIサービスは粗利が低くなりがち。', null, ['注意']),
      T('損益分岐点', 'Break-even', '売上と費用が同じになる点。何人の有料会員で黒字になるか。'),
      T('NRR', 'Net Revenue Retention', '既存のお客さまからの売上が1年でどれだけ増減したか。アップグレードで100%を超えるのが理想。'),
      T('アップセル・クロスセル', 'Upsell / Cross-sell', '上位プランへの移行・関連商品の購入。新規を探すより効率がよい。'),
    ]),
  ]});

/* ================= 2. 価格の決め方 ================= */
const PLANS = [['フリー', 0, ['メモ 100件まで', '端末1台', '広告あり']], ['スタンダード', 980, ['メモ 無制限', '端末3台', '広告なし', 'AI要約 月50回']], ['プロ', 2980, ['スタンダードの全機能', '端末 無制限', 'AI要約 無制限', 'チーム共有']]];
const PSY = [['総額表示', '消費者向けの価格は<b>税込で表示</b>する義務（税抜価格の併記は可）', '「¥980」だけで税抜だと違反の恐れ。「¥1,078（税込）」'], ['年払い割引', '1年分を前払いで少し安く（例：2か月分お得）', '解約が減り、先にお金が入る'], ['おすすめの強調', '真ん中のプランを「おすすめ」に', '迷いを減らす'], ['アンカー（基準）', '高いプランを並べると、他が手頃に見える', 'うそのない範囲で'], ['おとり（デコイ）', '明らかに損なプランを置いて、本命を選ばせる', '使いすぎるとダークパターンに'], ['端数価格', '¥1,000 より ¥980 の方が安く感じる', 'BtoBではきりのいい数字も'], ['シート課金', '使う人数×単価', 'チーム向けSaaSの定番'], ['返金保証', '「30日以内なら全額返金」', '購入の不安を減らす']];

TABS.push({ id:'pricing', label:'価格の決め方', icon:'🏷',
  intro:'価格は<b>見せ方</b>で受け取られ方が変わります。プランの並べ方・年払い割引・おすすめの強調…。日本では<b>消費者向けの価格は税込で表示（総額表示）</b>が義務。消費税の端数処理や、無料トライアルの設計も押さえましょう。',
  sections:[
    C('触って理解する', [
      { name:'料金表を作る', en:'Pricing table', h:500, tags:['UI','体験','定番'], wide:true,
        demo:'<div class="kt"><div class="kt-row"><span class="s1"></span><span class="s2"></span></div><div class="py-plans pl"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let yr = 0, tax = 0; const run = () => { $(el, '.pl').innerHTML = PLANS.map(([n, p, f], i) => { const mon = yr ? p * 10 / 12 : p, inc = Math.round(mon * 1.1), shown = tax ? mon : inc;
              return `<div class="py-plan${i === 1 ? ' rec' : ''}">${i === 1 ? '<span class="rb">おすすめ</span>' : ''}<h5>${n}</h5><div class="pr">${p ? yen(shown) : '¥0'}<small>/月</small></div><div class="tx">${p ? (tax ? '<span style="color:var(--bad);font-weight:700">（税抜）← 税込表示がない</span>' : `税込（税抜 ${yen(mon)}）`) : '無料'}${yr && p ? `<br>年額 ${yen(p * 10 * (tax ? 1 : 1.1))} で請求` : ''}</div>${yr && p ? `<span class="save">2か月分お得（${yen(p * 2 * (tax ? 1 : 1.1))}）</span>` : ''}<ul>${f.map(x => `<li>${x}</li>`).join('')}</ul><span class="kt-btn sm${i === 1 ? ' pri' : ''}" style="text-align:center;margin-top:auto">${p ? 'このプランにする' : '無料で始める'}</span></div>`; }).join('');
            verdict($(el, '.res'), tax ? 'bad' : 'ok', tax ? '❌ 消費者向けに<b>税抜価格だけ</b>を表示するのは、総額表示の義務に反します（BtoB向けで「税抜」と明記するのは可）。' : `✓ <b>税込の価格</b>を大きく、税抜は小さく併記。${yr ? '年払いは<b>月あたりの金額と、実際の請求額の両方</b>を見せると誤解がない。' : '真ん中を「おすすめ」にすると選びやすい。'}`); };
          $(el, '.s1').replaceWith(seg(['月払い', '年払い'], i => { yr = i; run(); }).el); $(el, '.s2').replaceWith(seg(['税込で表示', '税抜だけ（NG）'], i => { tax = i; run(); }).el); },
        desc:'料金表は、<b>3つ程度のプラン</b>を並べ、真ん中を「おすすめ」にするのが定番。年払いは「2か月分お得」のように割引を見せつつ、<b>実際に請求される金額</b>もはっきり書きます。日本では消費者向けの価格は<b>税込の表示が義務</b>（総額表示）です。',
        prompt:'SaaSの料金ページを作って。フリー・スタンダード・プロの3プランを横並び（スマホは縦）、月払い/年払いの切り替え（年払いは2か月分お得）、価格は税込で大きく・税抜を小さく併記、年払いは実際の請求額も表示、スタンダードを「おすすめ」で強調。機能の比較表も下に付けて。' },
      { name:'並べ方で選ばれ方が変わる', en:'Anchoring & decoy', h:440, tags:['心理','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="py-plans pl" style="flex:none"></div><div class="py-bars br" style="display:grid;grid-template-columns:auto 1fr auto;gap:4px 8px;align-items:center;font-size:11.5px"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const V = [[[['ベーシック', 500, '1GB'], ['プレミアム', 1500, '100GB']], [70, 30], '安い方に人が集まりやすい。'], [[['ベーシック', 500, '1GB'], ['プレミアム', 1500, '100GB'], ['プラス', 1400, '10GB']], [30, 60, 10], '「プラス」（1,400円で10GB）を置くと、たった100円差で10倍の<b>プレミアムが急にお得に見える</b>（おとり効果）。'], [[['ベーシック', 500, '1GB'], ['プレミアム', 1500, '100GB'], ['ビジネス', 9800, '1TB']], [35, 55, 10], '高い「ビジネス」を置くと、<b>プレミアムが手頃に見える</b>（アンカー効果）。']];
          $(el, '.sw').replaceWith(seg(['2プラン', '3プラン（おとり）', '3プラン（高い基準）'], i => { const [ps, sh, msg] = V[i];
            $(el, '.pl').innerHTML = ps.map(([n, p, g]) => `<div class="py-plan" style="padding:7px"><h5>${n}</h5><div class="pr" style="font-size:16px">${yen(p * 1.1)}<small>/月</small></div><div class="tx">容量 ${g}</div></div>`).join('');
            $(el, '.br').innerHTML = ps.map(([n], k) => `<span>${n}</span><i style="display:block;height:12px;border-radius:0 4px 4px 0;background:var(--accent);width:${sh[k]}%"></i><b class="kt-mono">${sh[k]}%</b>`).join('');
            verdict($(el, '.res'), '', msg + '<br><span style="color:var(--muted)">※割合は選ばれ方のイメージ。<b>だますための仕掛け</b>にならないよう、どのプランも価値に見合った内容に。</span>'); }).el); },
        desc:'人は価格を<b>絶対額ではなく比較</b>で判断します。高いプランを並べると他が手頃に見え（アンカー）、明らかに損なプランを置くと本命が得に見えます（おとり）。知っておくと料金表の設計に役立ちますが、<b>利用者をだます使い方</b>は信頼を失うのでやめましょう。',
        prompt:'今の料金プラン（2つ）を見直したい。上位プランを追加する案、年払いを推す案、機能の振り分けを変える案を、利用者にとっての分かりやすさを保ちながら提案して。ダークパターンにならない注意点も添えて。' },
      { name:'消費税と端数の計算', en:'Consumption tax & rounding', h:450, tags:['税','体験'],
        demo:'<div class="kt"><div class="kt-row"><span class="kt-lbl">単価（税抜）</span><input type="number" class="kt-in pr" value="98" style="width:90px" aria-label="単価"><span class="kt-lbl">個数</span><input type="number" class="kt-in qt" value="3" style="width:70px" aria-label="個数"></div><div class="kt-row"><span class="s1"></span><span class="s2"></span></div><div class="py-big bg"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let rate = 10, rd = 0; const RD = [Math.floor, Math.round, Math.ceil];
          const run = () => { const p = +$(el, '.pr').value || 0, q = Math.max(1, +$(el, '.qt').value || 1), f = RD[rd], each = f(p * rate / 100) * q, total = f(p * q * rate / 100);
            $(el, '.bg').innerHTML = `<div><small>1個ずつ税を計算して合計</small><b>${yen(p * q + each)}</b></div><div><small>合計に1回だけ税を計算</small><b>${yen(p * q + total)}</b></div>`;
            verdict($(el, '.res'), each !== total ? 'warn' : 'ok', `税額：1個ずつ ${yen(each)}／まとめて ${yen(total)}${each !== total ? ` → <b>${yen(Math.abs(each - total))}の差</b>` : '（同じ）'}<br>インボイス（適格請求書）では、<b>1枚の請求書で、税率ごとに1回だけ</b>端数処理します。切り捨て・四捨五入・切り上げのどれかは事業者が決めてよいが、<b>決めたら統一</b>。`); };
          $(el, '.s1').replaceWith(seg(['10%（標準）', '8%（軽減：食品など）'], i => { rate = i ? 8 : 10; run(); }).el); $(el, '.s2').replaceWith(seg(['切り捨て', '四捨五入', '切り上げ'], i => { rd = i; run(); }).el); $$(el, 'input').forEach(i => i.oninput = run); },
        desc:'消費税は<b>標準10%・軽減8%</b>（飲食料品など）。1円未満の端数をどう処理するか（切り捨て・四捨五入・切り上げ）は事業者が決められますが、<b>1個ずつ計算するか、合計で1回だけ計算するか</b>で金額がずれることがあります。インボイスでは「税率ごとに1回」がルールです。',
        prompt:'ECサイトの金額計算を見直して。商品は税抜単価で保存し、カートの合計で税率ごと（10%・8%）に1回だけ消費税を計算（端数は切り捨て）、表示は税込。金額は小数を使わず円の整数で扱い、計算のテストも書いて。' },
      { name:'無料トライアルの設計', en:'Free trial design', h:420, tags:['サブスク','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="br" style="display:grid;grid-template-columns:auto 1fr auto;gap:5px 8px;align-items:center;font-size:11.5px;flex:1;align-content:center"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const V = [['カード登録なし', [['試した人', 1000], ['有料になった人', 120]], '気軽に試せるので<b>試す人は多い</b>が、有料になる割合は低め。終了時に改めて支払い情報を入れてもらう。'], ['カード登録あり', [['試した人', 400], ['有料になった人', 200]], '試す人は減るが、<b>そのまま有料になりやすい</b>。終了前のお知らせメールは必須（「勝手に課金された」を防ぐ）。']];
          $(el, '.sw').replaceWith(seg(V.map(v => v[0]), i => { $(el, '.br').innerHTML = V[i][1].map(([n, v]) => `<span>${n}</span><i style="display:block;height:16px;border-radius:0 4px 4px 0;background:var(--accent);width:${v / 10}%"></i><b class="kt-mono">${v}人</b>`).join(''); verdict($(el, '.res'), '', V[i][2] + '<br><span style="color:var(--muted)">※人数は1,000人が興味を持ったときのイメージです。</span>'); }).el); },
        desc:'無料トライアルは「<b>カード登録なしで気軽に</b>」か「<b>カード登録ありで、終了後そのまま有料</b>」かで結果が変わります。カードありにする場合は、<b>終了の数日前にお知らせ</b>し、解約の方法を分かりやすくしておくのがトラブル防止の基本です（特商法の最終確認画面にも注意）。',
        prompt:'Stripe で7日間の無料トライアル付きのサブスクを作って。カード登録ありで、終了3日前にお知らせメール（customer.subscription.trial_will_end の Webhook）を送り、マイページからいつでも解約できるようにして。申込画面には、トライアル終了後の金額と課金日をはっきり表示して。' },
    ], null, true),
    { title:'価格の見せ方の手法', note:'どれも<b>正直に使う</b>ことが前提です。だます見せ方（隠れた料金・解約しにくい設計）は、法律違反や炎上につながります。',
      table:{ head:['手法', '内容', 'ポイント'], rows:PSY } },
    S('価格と税の用語', [
      T('総額表示', 'Tax-inclusive pricing', '消費者向けの価格は消費税込みで表示する義務。「¥1,078（税込）」「¥1,078（税抜¥980）」など。', null, ['義務']),
      T('消費税・軽減税率', 'Consumption tax', '標準10%、飲食料品（酒・外食を除く）と定期購読の新聞は8%。'),
      T('インボイス制度', 'Qualified invoice system', '仕入れ側が消費税を差し引くには、登録番号などが入った「適格請求書」が必要な制度。（「日本の法律」タブ）'),
      T('税抜価格での保存', 'Store net prices', 'データベースには税抜の単価を整数（円）で保存し、表示や請求のときに税を計算するのが扱いやすい。', null, ['実装']),
      T('小数を使わない', 'Integer money', 'お金はJavaScriptの小数で計算しない（0.1+0.2問題）。円の整数で扱う。（DB辞典参照）', null, ['よくある失敗']),
      T('年払い', 'Annual billing', '前払いで割引。解約が減り、資金繰りが良くなる。返金ルールを決めておく。'),
      T('価格改定', 'Price change', '既存のお客さまの扱い（据え置き・通知期間）を決めて、事前に知らせる。'),
      T('クーポン・プロモーションコード', 'Coupons', '割引の仕組み。Stripe では Coupon と Promotion Code で管理できる。'),
      T('地域別の価格', 'Regional pricing', '国によって価格を変える。為替や購買力に合わせる。'),
      T('返金ポリシー', 'Refund policy', 'どんなとき返金するかを決めて表示する。特商法の表記にも関係する。'),
    ]),
  ]});

/* ================= 3. 決済の仕組み（Stripe） ================= */
const SCEN = [['すんなり成功', [['requires_payment_method', 'カード情報を待っている'], ['processing', 'カード会社に確認中'], ['succeeded', '✓ 支払い完了 → Webhook で注文を確定']]], ['カードが拒否', [['requires_payment_method', 'カード情報を待っている'], ['processing', 'カード会社に確認中'], ['requires_payment_method', '× 拒否された → 別のカードをお願いする（状態が戻る）']]], ['3Dセキュアで本人確認', [['requires_payment_method', 'カード情報を待っている'], ['requires_action', '本人確認が必要 → カード会社の画面（パスワード・アプリ）'], ['processing', '確認OK'], ['succeeded', '✓ 支払い完了']]], ['あとから入金（銀行振込など）', [['requires_payment_method', '支払い方法を選ぶ'], ['requires_action', '振込先を案内（まだ入金されていない）'], ['processing', '入金を待っている'], ['succeeded', '✓ 数日後に入金を確認 → Webhook で注文を確定']]]];
const PI_ST = ['requires_payment_method', 'requires_confirmation', 'requires_action', 'processing', 'succeeded', 'canceled'];
const TESTCARDS = { '4242424242424242':['ok', '成功'], '4000000000000002':['bad', '拒否（generic_decline）'], '4000000000009995':['bad', '残高不足（insufficient_funds）'], '4000002500003155':['3ds', '3Dセキュアの本人確認が必要'] };

TABS.push({ id:'stripe', label:'決済の仕組み', icon:'💳',
  intro:'Webでの決済は、<b>Stripe</b> などの決済サービスを使うのが定番です。カード番号は<b>自分のサーバーを通さず</b>、決済サービスの画面や部品で入力してもらいます。そして注文の確定は「完了ページが表示されたら」ではなく、<b>Webhook（支払い完了の通知）を受けてから</b>。ここが一番大事なポイントです。',
  sections:[
    C('触って理解する', [
      { name:'Stripe Checkout の流れ', en:'Checkout flow', h:540, tags:['Stripe','体験','最重要'],
        init:(el) => seq(el, { actors:[{ label:'お客さま', icon:'🧑' }, { label:'自分のサイト', icon:'🖥' }, { label:'Stripe', icon:'💳' }], steps:[
          { f:0, t:1, label:'「購入する」をクリック', note:'ブラウザから自分のサーバーへ。<b>金額は送らない</b>（商品IDだけ）。' },
          { f:1, t:2, label:'Checkout Session を作成', note:'サーバーが<b>データベースの正しい価格</b>で、Stripe に支払い画面を作ってもらう（シークレットキーはサーバーだけ）。' },
          { f:2, t:1, label:'支払い画面のURL', dash:true },
          { f:1, t:0, label:'Stripe の画面へ移動', note:'カード番号は <b>Stripe の画面</b>で入力するので、自分のサーバーには来ない（カード情報の非保持）。' },
          { f:0, t:2, label:'カード情報を入力・支払い', note:'必要なら3Dセキュアの本人確認もここで。' },
          { f:2, t:0, label:'完了ページへ戻す', dash:true, note:'⚠ 完了ページは<b>URLを直接開くだけでも表示できる</b>。ここで注文を確定してはいけない。' },
          { f:2, t:1, label:'Webhook：checkout.session.completed', good:true, note:'<b>本当に支払われたことの証拠</b>。署名を確認してから、注文を「支払い済み」にして発送・権限付与。' },
          { f:1, t:2, label:'200 OK', dash:true, note:'すぐ返事をする（重い処理は後で）。同じ通知が2回来ても二重処理しない。' },
        ] }),
        desc:'Stripe Checkout は、<b>支払い画面ごと Stripe に任せる</b>方法で、一番簡単で安全です。自分のサーバーは「どの商品をいくらで売るか」を Stripe に伝え、お客さまは Stripe の画面で支払います。注文の確定は、<b>Webhook で支払い完了の通知を受け取ってから</b>行います。',
        prompt:'Next.js で、Stripe Checkout を使った商品の購入を実装して。購入ボタンは商品IDだけをサーバーに送り、サーバーはDBの価格で Checkout Session を作成、checkout.session.completed の Webhook（署名検証あり）で注文を支払い済みにする。完了ページでは注文の状態をサーバーに問い合わせて表示するだけにして。',
        code:'// app/api/checkout/route.ts\nimport Stripe from "stripe";\nconst stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);\n\nexport async function POST(req: Request) {\n  const { productId } = await req.json();          // 金額は受け取らない\n  const product = await db.products.find(productId); // 正しい価格はDBから\n  const session = await stripe.checkout.sessions.create({\n    mode: "payment",\n    line_items: [{ price: product.stripePriceId, quantity: 1 }],\n    success_url: `${origin}/thanks?session_id={CHECKOUT_SESSION_ID}`,\n    cancel_url: `${origin}/products/${productId}`,\n    metadata: { userId: user.id, productId },\n  });\n  return Response.json({ url: session.url });\n}\n\n// app/api/stripe/webhook/route.ts\nexport async function POST(req: Request) {\n  const event = stripe.webhooks.constructEvent(\n    await req.text(), req.headers.get("stripe-signature")!, process.env.STRIPE_WEBHOOK_SECRET!);\n  if (event.type === "checkout.session.completed") {\n    await markOrderPaid(event.data.object);       // 同じイベントが2回来ても大丈夫なように\n  }\n  return new Response("ok");\n}' },
      { name:'支払いの状態の移り変わり', en:'PaymentIntent statuses', h:440, tags:['Stripe','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="py-sm sm kt-grow"></div><div class="au-log lg" style="font:11.5px/1.6 var(--mono);background:var(--code-bg);border:1px solid var(--border);border-radius:8px;padding:6px 8px;height:96px;overflow:auto"></div></div>',
        init:(el) => { let run = 0; const draw = (cur, seen) => { $(el, '.sm').innerHTML = PI_ST.map(s => `<span class="py-st ${s === 'succeeded' ? 'ok' : s === 'canceled' ? 'bad' : s === 'requires_action' ? 'warn' : ''}${s === cur ? ' on' : seen.has(s) ? ' was' : ''}">${s}</span>`).join(''); };
          $(el, '.sw').replaceWith(seg(SCEN.map(s => s[0]), async (i) => { const me = ++run, seen = new Set(); $(el, '.lg').innerHTML = ''; for (const [s, msg] of SCEN[i][1]){ if (me !== run || !el.isConnected) return; seen.add(s); draw(s, seen); $(el, '.lg').insertAdjacentHTML('beforeend', `<div><b>${s}</b>：${msg}</div>`); $(el, '.lg').scrollTop = 1e6; await sleep(900); } }).el); },
        desc:'Stripe の支払い（<b>PaymentIntent</b>）は、<b>状態</b>を順番に移り変わります。カードの拒否なら状態が戻り、3Dセキュアなら「本人確認待ち（requires_action）」を通り、銀行振込なら入金まで「処理中」が続きます。どの状態でも、<b>最終的な結果は Webhook で受け取る</b>のが基本です。',
        prompt:'Stripe の Payment Element を使って、自分のサイト内に支払いフォームを埋め込んで。PaymentIntent はサーバーで作成し、confirmPayment の結果（3Dセキュアを含む）を画面に分かりやすく表示、注文の確定は payment_intent.succeeded の Webhook で行って。' },
      { name:'テスト用カードで試す', en:'Test cards', h:470, tags:['Stripe','体験','テスト'],
        demo:'<div class="kt"><div class="kt-note">⚠ 本物のカード番号は入れないでください。このデモはどこにも送信しません。下のテスト用の番号を押すと入力されます。</div><div class="kt-row tc"></div><div class="py-card"><label>カード番号</label><input class="kt-in no" inputmode="numeric" placeholder="4242 4242 4242 4242" aria-label="カード番号"><div class="row"><div><label>有効期限</label><input class="kt-in" value="12 / 30" aria-label="有効期限"></div><div><label>セキュリティコード</label><input class="kt-in" value="123" aria-label="セキュリティコード"></div></div><button type="button" class="py-paybtn pay">¥1,078 を支払う（テスト）</button><div class="ds"></div><div class="lock">🔒 Stripe の部品で入力（自分のサーバーには届かない）</div></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.tc').innerHTML = Object.entries(TESTCARDS).map(([n, [, l]]) => `<button type="button" class="kt-btn sm" data-n="${n}">${n.replace(/(\d{4})(?=\d)/g, '$1 ')}<br><small>${l}</small></button>`).join('');
          $$(el, '.tc button').forEach(b => b.onclick = () => { $(el, '.no').value = b.dataset.n.replace(/(\d{4})(?=\d)/g, '$1 '); });
          $(el, '.pay').onclick = async () => { const n = $(el, '.no').value.replace(/\s/g, ''), r = TESTCARDS[n], btn = $(el, '.pay'); $(el, '.ds').innerHTML = ''; if (!r){ verdict($(el, '.res'), 'warn', 'テスト用のカード番号を使ってください（本物の番号は入れない）。テストモードでは、決められた番号だけが使えます。'); return; }
            btn.disabled = true; verdict($(el, '.res'), '', '処理中…'); await sleep(700); btn.disabled = false;
            if (r[0] === 'ok') verdict($(el, '.res'), 'ok', '✓ 支払い成功（テスト）。<b>status: succeeded</b> → Webhook で注文を確定。');
            else if (r[0] === 'bad') verdict($(el, '.res'), 'bad', `× ${r[1]}。お客さまには「別のカードをお試しください」と表示。<b>詳しい拒否理由は画面に出さない</b>（不正利用の手がかりになる）。`);
            else { $(el, '.ds').innerHTML = '<div class="py-3ds"><b>🏦 カード会社の本人確認（テスト）</b><br>ワンタイムパスワードを入力してください<div class="kt-row c" style="margin-top:6px"><button type="button" class="kt-btn sm pri ok">認証する</button><button type="button" class="kt-btn sm bad ng">失敗させる</button></div></div>'; verdict($(el, '.res'), 'warn', '<b>status: requires_action</b> → 3Dセキュアの本人確認画面が出ました。');
              $(el, '.ds .ok').onclick = () => { $(el, '.ds').innerHTML = ''; verdict($(el, '.res'), 'ok', '✓ 本人確認OK → 支払い成功。'); }; $(el, '.ds .ng').onclick = () => { $(el, '.ds').innerHTML = ''; verdict($(el, '.res'), 'bad', '× 本人確認に失敗 → 支払いできません（requires_payment_method に戻る）。'); }; } }; },
        desc:'Stripe の<b>テストモード</b>では、決められた<b>テスト用のカード番号</b>で、成功・拒否・残高不足・3Dセキュアなどの場面を再現できます。本番に切り替える前に、すべての場面で画面とWebhookの処理が正しく動くか確かめましょう。<b>本物のカードはテストに使わない</b>こと。',
        prompt:'決済まわりのテスト計画を作って。Stripe のテストカード（成功・拒否・残高不足・3Dセキュア必須）と Stripe CLI の stripe trigger で Webhook を送るテストを使い、それぞれで画面表示・注文の状態・メール送信が正しいか確認する手順を一覧にして。' },
      { name:'二重に請求しない（冪等キー）', en:'Idempotency keys', h:420, tags:['Stripe','体験','よくある失敗'],
        demo:'<div class="kt"><label class="kt-row" style="font-size:11.5px"><input type="checkbox" class="ik">冪等キー（Idempotency-Key）を付ける＋ボタンを連打できないようにする</label><div class="kt-row"><button type="button" class="kt-btn pri go">「購入」を2回すばやく押す</button></div><div class="au-log lg kt-grow" style="font:11.5px/1.6 var(--mono);background:var(--code-bg);border:1px solid var(--border);border-radius:8px;padding:6px 8px;overflow:auto"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let run = 0; $(el, '.go').onclick = async () => { const me = ++run, ik = $(el, '.ik').checked, lg = $(el, '.lg'), L = (t) => { lg.insertAdjacentHTML('beforeend', `<div>${t}</div>`); lg.scrollTop = 1e6; }; lg.innerHTML = ''; const done = new Map(); let charges = 0; const key = 'order_A-2001';
            const req = async (k) => { L(`→ 請求 #${k}${ik ? `（Idempotency-Key: ${key}）` : ''}`); await sleep(400 + k * 120); if (me !== run) return; if (ik && done.has(key)){ L(`← #${k}：同じキーなので<b>前回と同じ結果</b>を返す（請求しない）`); return; } charges++; if (ik) done.set(key, 1); L(`← #${k}：<b>¥1,078 を請求</b>`); };
            if (ik){ L('ボタンを押した瞬間に無効化（2回目のクリックは届かない）… でも通信のやり直しで2回送られた場合も：'); }
            await Promise.all([req(1), sleep(150).then(() => req(2))]); if (me !== run) return;
            verdict($(el, '.res'), charges > 1 ? 'bad' : 'ok', charges > 1 ? `❌ <b>${charges}回</b>請求されてしまいました。通信が遅いとき・再試行のときに起こります。` : '✓ 同じ注文には同じキーを付けるので、何回送られても<b>請求は1回だけ</b>。'); }; },
        desc:'通信が遅いとボタンを2回押されたり、エラーのあと自動で再試行されたりして、<b>同じ支払いが2回</b>送られることがあります。Stripe の API には<b>冪等キー（Idempotency-Key）</b>を付けると、同じキーのリクエストは1回分として扱われます。ボタンを押したら無効にする、も合わせて行いましょう。',
        prompt:'決済のAPI呼び出しに冪等キーを付けて。注文IDから作った idempotencyKey を stripe の create 呼び出しに渡し、購入ボタンは押したら処理が終わるまで無効化、ネットワークエラー時の再試行でも二重請求にならないことをテストで確認して。' },
      { name:'手数料と手取り', en:'Fees & payouts', h:400, tags:['手数料','体験'],
        demo:'<div class="kt"><div class="fm"></div><div class="py-big bg"></div><div class="kt-note">※Stripe の日本の国内カードの基本料率 3.6%（2026年10月時点の目安）。海外カード・通貨換算・一部の支払い方法は別料率。<b>最新は Stripe の公式で確認</b>。手数料にかかる消費税の扱いも公式の案内を確認してください。</div></div>',
        init:(el) => { form($(el, '.fm'), [['p', '1回の金額（円）', 1078], ['n', '1か月の件数', 300], ['rate', '手数料率（%）', 3.6]], (st) => { const fee = st.p * st.rate / 100, gross = st.p * st.n;
            $(el, '.bg').innerHTML = `<div><small>1回の手数料</small><b>${yen(fee)}</b></div><div><small>1か月の売上</small><b>${yen(gross)}</b></div><div><small>1か月の手数料</small><b>${yen(fee * st.n)}</b></div><div><small>手取り（手数料のみ引いた額）</small><b>${yen(gross - fee * st.n)}</b></div>`; }); },
        desc:'決済サービスは<b>売上の数％</b>を手数料として引きます（Stripe の国内カードは3.6%が基本）。月額サービスなら「月額 × 件数 × 料率」が毎月かかる費用です。売上がいつ口座に入るか（<b>入金サイクル</b>）もサービスごとに違うので、資金繰りの計画に入れておきましょう。',
        prompt:'月の売上と件数から、Stripe の手数料（国内カード・海外カード・返金時の扱い）と入金日を計算して表示する管理画面を作って。料率は設定ファイルで変えられるようにして、最新の公式料率を確認してから初期値を入れて。' },
    ], null, true),
    S('決済の仕組みの用語', [
      T('Stripe', 'Stripe', '世界的な決済サービス。開発者向けの資料とテスト環境が充実。日本でも広く使われる。', null, ['定番']),
      T('Stripe Checkout', 'Checkout', 'Stripe が用意した支払い画面に移動して払う方式。一番簡単で安全。'),
      T('Payment Element', 'Payment Element', '自分のサイトの中に埋め込む支払いフォームの部品。見た目を合わせたいときに。'),
      T('PaymentIntent', 'PaymentIntent', '1回の支払いを表すもの。状態（status）が順に変わる。'),
      T('Customer / Product / Price', 'Stripe objects', 'お客さま・商品・価格。サブスクは Price に「月ごと」などの周期を持たせる。'),
      T('公開可能キーとシークレットキー', 'Publishable / secret key', 'pk_ はブラウザに置いてよい、<b>sk_ はサーバーだけ</b>。テスト用と本番用で別。', null, ['セキュリティ']),
      T('テストモード', 'Test mode', '本物のお金が動かない練習環境。テスト用カードで全部の場面を試す。'),
      T('Webhook（決済）', 'Webhooks', '支払い完了・失敗・返金などを知らせる通知。<b>注文の確定はこれで行う</b>。（自動化辞典）', null, ['最重要']),
      T('Stripe CLI', 'Stripe CLI', '手元の開発環境に Webhook を転送したり、イベントを発生させたりできる道具。'),
      T('返金', 'Refund', '全額・一部の返金。手数料が戻らない場合があるので条件を確認。'),
      T('入金（ペイアウト）', 'Payout', '売上が自分の銀行口座に振り込まれること。'),
      T('Stripe Connect', 'Connect', 'マーケットプレイスなど、売り手にお金を分配する仕組み。'),
      T('Stripe Tax', 'Stripe Tax', '国・地域ごとの税金を自動計算する機能。海外に売るときに。'),
    ]),
  ]});

/* ================= 4. サブスクの管理 ================= */
const SUB_EV = { trialing:[['トライアル終了 → 支払い成功', 'active'], ['トライアル終了 → 支払い失敗', 'past_due'], ['トライアル中に解約', 'canceled']], active:[['更新日 → 支払い成功', 'active'], ['更新日 → 支払い失敗', 'past_due'], ['解約を予約（期間の終わりに解約）', 'active*'], ['期間が終わる（解約予約あり）', 'canceled']], past_due:[['再試行 → 成功（カード更新）', 'active'], ['再試行が全部失敗', 'canceled']], canceled:[['もう一度申し込む', 'active']] };
const SUB_ACC = { trialing:['○ 全機能', 'ok'], active:['○ 全機能', 'ok'], past_due:['△ 猶予期間（数日は使える・カード更新をお願い）', 'warn'], canceled:['× 有料機能は使えない（データは一定期間保管）', 'bad'] };

TABS.push({ id:'subscription', label:'サブスクの管理', icon:'🔁',
  intro:'サブスクは「申し込んで終わり」ではなく、<b>トライアル・更新・支払い失敗・プラン変更・解約</b>と、状態がずっと変わり続けます。自分のアプリの「使える・使えない」を、決済サービスの状態と<b>Webhook で同期</b>するのが基本の作り。解約の導線を<b>分かりやすく</b>することは法律上も大事です。',
  sections:[
    C('触って理解する', [
      { name:'サブスクの状態', en:'Subscription lifecycle', h:470, tags:['サブスク','体験','最重要'],
        demo:'<div class="kt"><div class="py-sm sm"></div><div class="kt-row ev" style="justify-content:center"></div><div class="kt-verdict res"></div><div class="au-log lg kt-grow" style="font:11px/1.6 var(--mono);background:var(--code-bg);border:1px solid var(--border);border-radius:8px;padding:6px 8px;overflow:auto"></div></div>',
        init:(el) => { let cur = 'trialing', pend = false; const WH = { active:'customer.subscription.updated / invoice.paid', past_due:'invoice.payment_failed', canceled:'customer.subscription.deleted' };
          const draw = () => { $(el, '.sm').innerHTML = ['trialing', 'active', 'past_due', 'canceled'].map(s => `<span class="py-st ${s === 'active' ? 'ok' : s === 'past_due' ? 'warn' : s === 'canceled' ? 'bad' : ''}${s === cur ? ' on' : ''}">${s}</span>`).join('');
            $(el, '.ev').innerHTML = SUB_EV[cur].filter(([, to]) => cur !== 'active' || (pend ? to === 'canceled' : to !== 'canceled')).map(([l, to], i) => `<button type="button" class="kt-btn sm" data-to="${to}">${l}</button>`).join('');
            $$(el, '.ev button').forEach(b => b.onclick = () => { const to = b.dataset.to; if (to === 'active*'){ pend = true; L(`解約を予約 → <b>cancel_at_period_end: true</b>（期間の終わりまでは使える）`); } else { pend = false; L(`${b.textContent} → <b>${to}</b>　Webhook：${WH[to] || ''}`); cur = to; } draw(); });
            const [acc, c] = SUB_ACC[cur]; verdict($(el, '.res'), c, `<b>${cur}</b>${pend && cur === 'active' ? '（期間の終わりに解約予定）' : ''}：アプリの機能は ${acc}`); };
          const L = (t) => { $(el, '.lg').insertAdjacentHTML('beforeend', `<div>${t}</div>`); $(el, '.lg').scrollTop = 1e6; }; L('無料トライアルを開始 → trialing'); draw(); },
        desc:'サブスクは <b>trialing（お試し）→ active（有効）→ past_due（支払い失敗）→ canceled（解約）</b>のように状態が変わります。アプリ側では、<b>Webhook を受けて自分のDBの状態を更新</b>し、その状態で機能を使えるか判断します。「解約の予約」は期間の終わりまで使えるのが一般的です。',
        prompt:'Stripe のサブスクの状態を、自分のDB（users テーブルの plan と subscription_status）と同期して。customer.subscription.created / updated / deleted と invoice.payment_failed の Webhook を処理し、past_due は3日間の猶予で機能を使えるように、canceled なら無料プランに戻して。' },
      { name:'プラン変更と日割り', en:'Proration', h:420, tags:['サブスク','体験'],
        demo:'<div class="kt"><div class="fm"></div><div class="tl" style="position:relative;height:40px;border-radius:8px;overflow:hidden;display:flex;border:1px solid var(--border)"></div><div class="py-big bg"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { form($(el, '.fm'), [['a', '今のプラン（円/月）', 980], ['b', '新しいプラン（円/月）', 2980], ['d', '変更する日（30日のうち何日目）', 10]], (st) => { const d = Math.min(30, Math.max(0, st.d)), used = d / 30, credit = st.a * (1 - used), charge = st.b * (1 - used), diff = charge - credit;
            $(el, '.tl').innerHTML = `<div style="width:${used * 100}%;background:color-mix(in srgb, var(--accent) 30%, var(--surface));display:grid;place-items:center;font-size:10.5px;font-weight:700">旧プラン ${d}日</div><div style="flex:1;background:color-mix(in srgb, var(--ok) 30%, var(--surface));display:grid;place-items:center;font-size:10.5px;font-weight:700">新プラン ${30 - d}日</div>`;
            $(el, '.bg').innerHTML = `<div><small>使わなかった旧プランの分（返金・充当）</small><b>−${yen(credit)}</b></div><div><small>新プランの残り期間の分</small><b>+${yen(charge)}</b></div><div><small>今回の差額</small><b>${diff >= 0 ? '+' : '−'}${yen(Math.abs(diff))}</b></div>`;
            verdict($(el, '.res'), '', diff >= 0 ? `アップグレード：差額 ${yen(diff)} を<b>今すぐ請求</b>（または次回の請求に上乗せ）し、すぐに新しい機能を使えるように。` : `ダウングレード：差額は<b>次回以降の請求から差し引く</b>のが一般的。多くのサービスは「次の更新日から下位プラン」にします。`); }); },
        desc:'月の途中でプランを変えると、<b>使った日数ぶん</b>で料金を計算し直す（日割り・プロレーション）のが一般的です。アップグレードはすぐに差額を請求して機能を開放、ダウングレードは次の更新日から、が分かりやすい設計。Stripe はこの計算を自動で行ってくれます。',
        prompt:'プラン変更の画面を作って。アップグレードは即時に反映して日割りの差額を請求（Stripe の proration_behavior: always_invoice）、ダウングレードは次の更新日に反映（スケジュール）。変更前に「今回の請求額・次回からの金額」を確認画面で表示して。' },
      { name:'支払い失敗からの回復', en:'Dunning', h:440, tags:['サブスク','体験','売上'],
        demo:'<div class="kt"><div class="kt-row ck" style="font-size:11.5px;gap:12px;flex-wrap:wrap"><label><input type="checkbox" class="r1" checked>賢い再試行（数日おきに）</label><label><input type="checkbox" class="r2" checked>カード更新のお願いメール</label><label><input type="checkbox" class="r3">期限切れ前のお知らせ</label></div><div class="br" style="display:grid;grid-template-columns:auto 1fr auto;gap:5px 8px;align-items:center;font-size:11.5px;flex:1;align-content:center"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const run = () => { const a = $(el, '.r1').checked, b = $(el, '.r2').checked, c = $(el, '.r3').checked, fail = c ? 70 : 100, rec = Math.round(fail * Math.min(.85, (a ? .35 : .05) + (b ? .3 : 0))), lost = fail - rec;
            $(el, '.br').innerHTML = [['支払いに失敗した人', fail, 'var(--warn)'], ['回復した人', rec, 'var(--ok)'], ['そのまま解約になった人', lost, 'var(--bad)']].map(([n, v, col]) => `<span>${n}</span><i style="display:block;height:16px;border-radius:0 4px 4px 0;background:${col};width:${v}%"></i><b class="kt-mono">${v}人</b>`).join('');
            verdict($(el, '.res'), lost > 50 ? 'bad' : lost > 25 ? 'warn' : 'ok', `本人は解約するつもりがないのに、<b>カードの期限切れ・残高不足</b>で解約になる「意図しない解約」は少なくありません。再試行・お知らせメール・カード更新ページで、${rec}人を取り戻せています。<br><span style="color:var(--muted)">※人数はイメージです。</span>`); };
          $$(el, 'input').forEach(i => i.onchange = run); run(); },
        desc:'サブスクの解約には、<b>本人が望んでいない解約</b>（カードの期限切れ・残高不足）がかなり含まれます。支払いに失敗したら<b>数日おきに再試行</b>し、<b>カード更新のお願い</b>をメールで送り、期限切れの前にお知らせする。これだけで売上がかなり守れます（ダニング）。',
        prompt:'サブスクの支払い失敗への対応を作って。Stripe の Smart Retries を有効にし、invoice.payment_failed で「カードを更新してください」メール（Customer Portal へのリンク付き）を送り、カードの期限切れ1か月前にもお知らせ。3回失敗したら解約して、データは30日間保管する流れにして。' },
      { name:'解約の導線', en:'Cancellation flow', h:470, tags:['法律','UX','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="fl kt-grow" style="display:flex;flex-direction:column;gap:5px;overflow:auto;font-size:11.5px"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.sw').replaceWith(seg(['解約しにくい（NG）', '分かりやすい'], i => { const steps = i ? ['マイページ → 「プランと支払い」', '「解約する」ボタン（目立つ場所に）', '任意：解約理由のアンケート（スキップ可）', '確認：「◯月◯日まで使えます。データは30日間保管します」', '「解約しました」画面とメール'] : ['設定 → アカウント → その他 → 詳細設定…（奥深く）', '「本当に解約しますか？」×3回', '割引の提案を断らないと進めない', '電話でのみ受付（平日10〜17時）', 'どこで完了したか分からない'];
            $(el, '.fl').innerHTML = steps.map((s, k) => `<div class="kt-box ${i ? 'ok' : 'bad'}" style="text-align:left;font-weight:600">${k + 1}. ${s}</div>`).join('');
            verdict($(el, '.res'), i ? 'ok' : 'bad', i ? '✓ <b>申し込みと同じくらい簡単に</b>解約できる。いつまで使えるか・データがどうなるかを最後に明示。' : '❌ わざと解約しにくくするのは<b>ダークパターン</b>。2022年施行の改正特定商取引法では、申込みの<b>最終確認画面</b>で解約の条件などを分かりやすく表示する義務があり、誤認させる表示は禁止。消費者の信頼も失います。'); }).el); },
        desc:'解約を難しくして引き止めるのは、<b>ダークパターン</b>と呼ばれる悪い設計です。日本では特定商取引法で、通販の申込み画面（最終確認画面）に<b>解約の条件・方法</b>などを分かりやすく表示することが義務になっています。解約は<b>申し込みと同じくらい簡単に</b>、が信頼につながります。',
        prompt:'マイページに解約の導線を作って。「プランと支払い」から2クリック以内で解約でき、解約前に「◯月◯日まで使える・データは30日保管」を表示、理由のアンケートは任意。解約後にメールでお知らせして、期間内なら1クリックで解約を取り消せるようにして（Stripe Customer Portal を使ってもよい）。' },
    ], null, true),
    S('サブスク管理の用語', [
      T('更新日', 'Billing cycle anchor', '毎月・毎年の請求日。月末（31日）に申し込んだ人の扱いに注意。'),
      T('トライアル', 'Trial period', 'お試し期間。終了前のお知らせ（Stripe の trial_will_end）を送る。'),
      T('解約予約', 'cancel_at_period_end', '今の期間の終わりで解約する設定。それまでは使える。'),
      T('日割り（プロレーション）', 'Proration', '途中でのプラン変更を日数で計算し直すこと。'),
      T('past_due', 'Past due', '支払いに失敗して、再試行を待っている状態。猶予期間を設けることが多い。'),
      T('ダニング', 'Dunning', '支払いに失敗した人へのお知らせと再試行で、売上を取り戻すこと。'),
      T('Customer Portal', 'Stripe Customer Portal', 'Stripe が用意する、お客さま自身がカード更新・プラン変更・解約・領収書の取得をできる画面。作る手間が省ける。', null, ['おすすめ']),
      T('請求書・領収書', 'Invoices / receipts', 'サブスクの毎回の請求。インボイス（適格請求書）の要件を満たすか確認。（「日本の法律」タブ）'),
      T('一時停止', 'Pause', '解約ではなく、しばらく止める選択肢。解約を減らす効果がある。'),
      T('権限（エンタイトルメント）', 'Entitlements', 'プランごとに使える機能の一覧。コードの中に散らばらせず、1か所で管理する。'),
      T('Webhook での同期', 'Syncing via webhooks', '決済サービスの状態を、自分のDBに反映する。<b>ブラウザからの申告を信じない</b>。', null, ['最重要']),
    ]),
  ]});
})();
