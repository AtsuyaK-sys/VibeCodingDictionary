/* テスト・品質辞典 — B: 表示速度 / 見た目のテスト / CIと自動化 / AIとテスト */
(function(){
const { $, $$, esc, tbl, seg, stepper } = KIT;
const { S, C, T, verdict, sleep, rng, runTests, showResults } = TSH;

/* ================= 5. 表示速度 ================= */
const CWV = [['LCP', '一番大きな部分が表示されるまで', 's', 0, 6, .1, 3.2, 2.5, 4], ['INP', '操作してから画面が反応するまで', 'ms', 0, 800, 10, 260, 200, 500], ['CLS', 'レイアウトのずれの大きさ', '', 0, .5, .01, .18, .1, .25]];

TABS.push({ id:'perf', label:'表示速度', icon:'⚡',
  intro:'表示の速さも<b>品質</b>の一部です。Google は <b>Core Web Vitals</b>（表示の速さ LCP・反応の速さ INP・ずれ CLS）で体験を測り、検索の評価にも使っています。遅さの原因は、<b>重い画像・大きなJavaScript・読み込み順</b>であることがほとんど。測って、直して、また測りましょう。',
  sections:[
    C('触って理解する', [
      { name:'Core Web Vitals の3つの数字', en:'LCP / INP / CLS', h:420, tags:['体験','定番','最重要'],
        demo:'<div class="kt"><div class="ts-meter mt"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const st = CWV.map(c => c[6]); const run = () => { const res = CWV.map((c, i) => st[i] <= c[7] ? 'good' : st[i] <= c[8] ? 'ni' : 'poor');
            $(el, '.mt').innerHTML = CWV.map(([k, d, u, mn, mx, sp], i) => `<b>${k}</b><span style="font-size:10.5px;color:var(--muted)">${d}</span><span></span><input type="range" min="${mn}" max="${mx}" step="${sp}" value="${st[i]}" data-i="${i}" aria-label="${k}" style="grid-column:1 / 3"><span class="kt-badge ${res[i] === 'good' ? 'ok' : res[i] === 'ni' ? 'warn' : 'bad'}">${(+st[i]).toFixed(u === 's' ? 1 : u === 'ms' ? 0 : 2)}${u}</span>`).join('');
            $$(el, '.mt input').forEach(x => x.oninput = () => { st[+x.dataset.i] = +x.value; run(); });
            const all = res.every(r => r === 'good'); verdict($(el, '.res'), all ? 'ok' : res.includes('poor') ? 'bad' : 'warn', `良い基準：<b>LCP 2.5秒以内・INP 200ミリ秒以内・CLS 0.1以下</b>。` + (all ? '✓ 3つとも「良い」です。' : `<br>${res.map((r, i) => r === 'good' ? '' : `${CWV[i][0]}：${r === 'ni' ? '改善が必要' : '悪い'}`).filter(Boolean).join('　')}`) + '<br>実際の利用者の75%がこの基準を満たしているかで判定されます（遅い端末・回線の人を含めて）。'); };
          run(); },
        desc:'<b>LCP</b>（一番大きな画像や見出しが表示されるまでの時間）、<b>INP</b>（クリックしてから反応するまでの時間）、<b>CLS</b>（読み込み中にレイアウトがずれる量）。この3つが良い基準を満たすと、利用者の体感も検索の評価も良くなります。スライダーで基準を確かめましょう。',
        prompt:'このサイトの Core Web Vitals を改善したい。PageSpeed Insights の結果（貼り付け）から、LCP・INP・CLS それぞれの原因を特定して、効果の大きい順に修正して。修正前後で Lighthouse のスコアと実際の数値を比べて。' },
      { name:'レイアウトのずれ（CLS）を体験', en:'Layout shift', h:460, tags:['体験','CLS'],
        demo:'<div class="kt"><label class="kt-row" style="font-size:11.5px"><input type="checkbox" class="fx">画像の大きさを先に確保（width・height／aspect-ratio）</label><div class="ts-mock pg kt-grow" style="display:flex;flex-direction:column;gap:6px"></div><div class="kt-row"><button type="button" class="kt-btn pri go">▶ ページを開いて「続きを読む」を押す</button></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let run = 0; const draw = (img, fx) => { $(el, '.pg').innerHTML = `<b style="font-size:13px">新しいカフェができました</b>${fx || img ? `<div style="border-radius:8px;${img ? 'background:linear-gradient(135deg, #fbbf24, #f472b6)' : 'background:var(--surface-2)'};aspect-ratio:16/6;display:grid;place-items:center;color:#fff;font-weight:800">${img ? '📷 写真' : ''}</div>` : ''}<div style="font-size:11.5px;color:var(--muted)">駅から徒歩3分の場所に、新しいカフェがオープン…</div><div style="display:flex;gap:6px"><button class="btn-read">続きを読む</button><button class="btn-ad" style="background:var(--warn)">広告：今すぐ購入</button></div>`; };
          $(el, '.fx').onchange = () => draw(false, $(el, '.fx').checked);
          $(el, '.go').onclick = async () => { const me = ++run, fx = $(el, '.fx').checked; draw(false, fx); verdict($(el, '.res'), '', '「続きを読む」を押そうとしています…'); await sleep(500); if (me !== run) return; const target = $(el, '.btn-read').getBoundingClientRect(); draw(true, fx); await sleep(80); const hitEl = document.elementFromPoint(target.left + target.width / 2, target.top + target.height / 2), wrong = !hitEl || !hitEl.closest('.btn-read');
            const tgt = wrong ? $(el, '.btn-ad') : $(el, '.btn-read'); if (tgt) tgt.style.outline = '3px solid var(--bad)';
            verdict($(el, '.res'), fx ? 'ok' : 'bad', fx ? '✓ 写真の場所を先に確保していたので、何もずれず<b>「続きを読む」</b>を押せました（CLS ≒ 0）。' : `❌ 写真が後から読み込まれて、ボタンが下にずれました。${wrong ? '<b>押したかった所に別のものが来て</b>、' : ''}誤って押す原因に（CLS が大きい）。`); }; draw(false, false); },
        desc:'画像や広告が<b>後から読み込まれて場所を押し広げる</b>と、読んでいた文章やボタンがずれます。押そうとした瞬間にずれて別の物を押してしまうのは、とてもストレスです。画像には <b>width・height</b>（または aspect-ratio）を指定し、広告や後から出る部品の<b>場所を先に確保</b>しましょう。',
        prompt:'このサイトの CLS（レイアウトのずれ）を直して。すべての画像に width/height を指定（next/image を使う）、広告・埋め込み・後から読み込む部品には min-height で場所を確保、Webフォントは font-display と大きさの調整でずれを減らして。' },
      { name:'読み込みの順番（ウォーターフォール）', en:'Loading waterfall', h:480, tags:['体験','LCP'],
        demo:'<div class="kt"><div class="kt-row ck" style="font-size:11.5px;gap:4px 12px;flex-wrap:wrap"><label><input type="checkbox" data-k="img">画像を WebP・適切な大きさに</label><label><input type="checkbox" data-k="js">JSを分割・後から読む</label><label><input type="checkbox" data-k="pre">一番大きな画像を優先して読む</label><label><input type="checkbox" data-k="font">フォントを先読み</label></div><div class="ts-wf wf kt-grow" style="align-content:start;overflow:auto"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const run = () => { const s = {}; $$(el, '.ck input').forEach(i => s[i.dataset.k] = i.checked); const bw = 400, lat = .15;
            const R = [['HTML', 30, 0, false], ['CSS', 60, 1, true], ['JavaScript', s.js ? 150 : 900, 1, !s.js], ['フォント', 120, s.font ? 1 : 2, true], ['ヒーロー画像', s.img ? 160 : 1400, s.pre ? 1 : 3, false], ['その他の画像', s.img ? 200 : 900, 3, false]];
            const t = [], st = []; R.forEach(([n, kb, dep], i) => { const start = dep === 0 ? 0 : dep === 1 ? t[0] : dep === 2 ? Math.max(t[1], t[0]) : Math.max(t[1], s.js ? t[0] : t[2]); st[i] = start; t[i] = start + lat + kb / bw; });
            const render = Math.max(t[1], s.js ? 0 : t[2], s.font ? t[3] : t[3] * .9), lcp = Math.max(render, t[4]), mx = Math.max(...t, lcp) * 1.05;
            $(el, '.wf').innerHTML = R.map(([n, kb, , blk], i) => `<span>${n} <span style="color:var(--muted)">${kb}KB</span></span><span class="b"><i class="${blk ? 'blk' : ''}" style="left:${st[i] / mx * 100}%;width:${(t[i] - st[i]) / mx * 100}%"></i></span>`).join('') + `<b>LCP</b><span class="b"><i style="left:${lcp / mx * 100}%;width:3px;background:var(--stage-ink)"></i></span>`;
            verdict($(el, '.res'), lcp <= 2.5 ? 'ok' : lcp <= 4 ? 'warn' : 'bad', `LCP の目安：<b>${lcp.toFixed(1)}秒</b>（4G回線のイメージ）。赤い棒は<b>表示を止める（ブロックする）</b>読み込み。` + (lcp > 2.5 ? '<br>一番効くのは<b>ヒーロー画像を軽くして優先して読む</b>ことと、<b>JSを減らす</b>こと。' : '')); };
          $$(el, '.ck input').forEach(i => i.onchange = run); run(); },
        desc:'ページは HTML → CSS・JavaScript → 画像…の順に読み込まれます。<b>表示を止める大きなJavaScript</b>と、<b>重いヒーロー画像</b>が LCP を遅くする二大原因。画像を WebP で適切な大きさに、一番大きな画像は<b>優先して</b>（fetchpriority="high"）、JSは<b>分割して必要なときに</b>読むと、ぐっと速くなります。',
        prompt:'トップページの LCP が4秒かかっています。Chrome の Performance パネルとネットワークのウォーターフォールで原因を調べ、ヒーロー画像の最適化（next/image・priority・適切なサイズ）、使っていないJSの削除と動的読み込み、フォントの最適化（next/font）で改善して。' },
    ], null, true),
    S('表示速度の用語', [
      T('Core Web Vitals', 'Core Web Vitals', 'Google が定める体験の指標。LCP・INP・CLS。', null, ['定番']),
      T('LCP', 'Largest Contentful Paint', '一番大きな要素（ヒーロー画像・見出し）が表示されるまで。2.5秒以内が良い。'),
      T('INP', 'Interaction to Next Paint', '操作してから画面が反応するまで。200ミリ秒以内が良い。重いJSの処理が原因になりやすい。'),
      T('CLS', 'Cumulative Layout Shift', 'レイアウトのずれの合計。0.1以下が良い。画像の大きさ指定で防ぐ。'),
      T('Lighthouse', 'Lighthouse', 'ページを診断して点数と改善点を出すツール。開発中の目安に。'),
      T('PageSpeed Insights', 'PageSpeed Insights', '実際の利用者のデータ（フィールドデータ）と診断結果を見られる Google のサービス。'),
      T('ラボデータとフィールドデータ', 'Lab vs field data', '自分の環境で測った値（ラボ）と、実際の利用者の値（フィールド）。最終的にはフィールドが大事。'),
      T('レンダリングブロック', 'Render-blocking', '読み込みが終わるまで表示を止めるCSS・JS。減らす・後回しにする。'),
      T('画像の最適化', 'Image optimization', 'WebP・AVIF、表示サイズに合った大きさ、遅延読み込み（loading="lazy"）。最初の画面の画像は遅延させない。'),
      T('バンドルサイズ', 'Bundle size', '配るJavaScriptの大きさ。大きなライブラリ・使っていないコードを減らす。'),
      T('パフォーマンス予算', 'Performance budget', '「JSは200KBまで」「LCPは2.5秒まで」と上限を決め、CIで超えたら知らせる。'),
    ]),
  ]});

/* ================= 6. 見た目のテスト ================= */
function card(ctx, w, h, v){
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h); const s = Math.min(w / 220, h / 150), ox = (w - 220 * s) / 2, oy = (h - 150 * s) / 2; ctx.save(); ctx.translate(ox, oy); ctx.scale(s, s);
  ctx.fillStyle = '#f1f5f9'; ctx.fillRect(10, 10, 200, 130); ctx.fillStyle = v === 2 ? '#2563ec' : '#2563eb'; ctx.fillRect(20, 20, 60, 60);
  ctx.fillStyle = '#0f172a'; ctx.font = 'bold 15px sans-serif'; ctx.fillText(v === 3 ? 'プレミアムプラン' : 'スタンダード', 90, 42); ctx.fillStyle = '#64748b'; ctx.font = '12px sans-serif'; ctx.fillText('月額 ¥1,078（税込）', 90, 62);
  ctx.fillStyle = '#16a34a'; ctx.fillRect(20, v === 1 ? 98 : 96, 180, 30); ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif'; ctx.fillText('申し込む', 85, v === 1 ? 118 : 116); ctx.restore();
}
const SNAP0 = { id:1, name:'佐藤 花子', plan:'standard', price:1078, features:['AI要約', '端末3台'] };

TABS.push({ id:'visual', label:'見た目のテスト', icon:'🖼',
  intro:'CSS を少し直しただけで、<b>別のページのデザインが崩れる</b>ことはよくあります。<b>スクリーンショットを比べるテスト</b>（ビジュアルリグレッション）なら、前と比べて変わった所を自動で見つけられます。画面の幅・ブラウザ・端末の組み合わせの確認も含めて、見た目の品質の守り方をまとめます。',
  sections:[
    C('触って理解する', [
      { name:'スクリーンショットを比べる', en:'Visual regression test', h:480, tags:['体験','定番'],
        demo:'<div class="kt"><span class="sw"></span><div class="ts-cv"><div>前（正解の画像）<canvas class="a"></canvas></div><div>今回<canvas class="b"></canvas></div><div>違い（赤）<canvas class="c"></canvas></div></div><div class="kt-row"><span class="kt-lbl">許す違いの割合</span><input type="range" min="0" max="2" step="0.05" value="0.1" class="th" style="flex:1" aria-label="しきい値"><b class="kt-mono tv"></b></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let v = 1; const W = 220, H = 150, cv = (c) => { const k = $(el, c); k.width = W; k.height = H; return k.getContext('2d', { willReadFrequently:true }); };
          const run = () => { const a = cv('.a'), b = cv('.b'), c = cv('.c'); card(a, W, H, 0); card(b, W, H, v); const A = a.getImageData(0, 0, W, H).data, B = b.getImageData(0, 0, W, H), D = c.createImageData(W, H); let n = 0;
            for (let i = 0; i < A.length; i += 4){ const d = Math.abs(A[i] - B.data[i]) + Math.abs(A[i + 1] - B.data[i + 1]) + Math.abs(A[i + 2] - B.data[i + 2]); if (d > 30){ n++; D.data.set([230, 40, 40, 255], i); } else { const g = (A[i] + A[i + 1] + A[i + 2]) / 3 * .25 + 190; D.data.set([g, g, g, 255], i); } }
            c.putImageData(D, 0, 0); const pct = n / (W * H) * 100, th = +$(el, '.th').value; $(el, '.tv').textContent = th + '%';
            verdict($(el, '.res'), pct <= th ? 'ok' : 'bad', `違う画素：<b>${n}個（${pct.toFixed(2)}%）</b> → ${pct <= th ? '✓ 合格（許す範囲）' : '× 不合格：見た目が変わりました'}` + (v === 2 ? '<br>人の目ではほぼ分からない色の差。<b>許す範囲（しきい値）</b>の決め方が大事。' : v === 1 ? '<br>ボタンが<b>2px下</b>にずれただけでも見つけられます。意図した変更なら、正解の画像を更新します。' : v === 3 ? '<br>文言の変更。意図した変更か確認して、正解を更新します。' : '')); };
          $(el, '.sw').replaceWith(seg(['変更なし', 'ボタンが2px下へ', '色がほんの少し違う', '文字が変わった'], i => { v = i; run(); }, 1).el); $(el, '.th').oninput = run; },
        desc:'<b>ビジュアルリグレッションテスト</b>は、前に保存した「正解」のスクリーンショットと今の画面を<b>1画素ずつ比べて</b>、違いがあれば知らせます。人の目では見落とす2pxのずれも見つかります。フォントや画像の読み込みで少しずれることがあるので、<b>許す範囲（しきい値）</b>を決めておきます。',
        prompt:'Playwright の toHaveScreenshot で、主要なページ（トップ・料金・ログイン）のビジュアルリグレッションテストを作って。アニメーションを止め、日時など毎回変わる部分はマスク、スマホとPCの2つの幅で撮影、しきい値は maxDiffPixelRatio で設定して。正解画像の更新方法も教えて。' },
      { name:'出力をまるごと記録（スナップショット）', en:'Snapshot testing', h:420, tags:['体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="ts-diff df kt-grow"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const show = (obj) => { const a = JSON.stringify(SNAP0, null, 2).split('\n'), b = JSON.stringify(obj, null, 2).split('\n'); let html = ''; const n = Math.max(a.length, b.length); for (let i = 0; i < n; i++){ if (a[i] === b[i]) html += `<span>  ${esc(a[i] || '')}</span>\n`; else { if (a[i] !== undefined) html += `<span class="del">- ${esc(a[i])}</span>`; if (b[i] !== undefined) html += `<span class="add">+ ${esc(b[i])}</span>`; } } $(el, '.df').innerHTML = html; return a.join() !== b.join(); };
          $(el, '.sw').replaceWith(seg(['同じ', '値段が変わった', '項目が増えた'], i => { const o = i === 0 ? SNAP0 : i === 1 ? { ...SNAP0, price:1100 } : { ...SNAP0, features:[...SNAP0.features, 'チーム共有'] }; const ch = show(o);
            verdict($(el, '.res'), ch ? 'warn' : 'ok', ch ? '× スナップショットと違います。<b>意図した変更なら更新</b>（<code>vitest -u</code>）、意図していないならバグ。<b>中身を見ずに更新する</b>と、テストの意味がなくなります。' : '✓ 前回の記録と同じです。'); }).el); },
        desc:'<b>スナップショットテスト</b>は、関数の出力や画面の部品の HTML を<b>まるごと保存</b>しておき、変わったら差分を見せてくれます。手軽な反面、差分を確かめずに「全部更新」してしまいがち。大きすぎる出力は差分が読めないので、<b>小さく・大事な部分だけ</b>に使います。',
        prompt:'このAPIのレスポンスの形が意図せず変わったら気づけるように、Vitest のスナップショットテストを追加して。日時やIDのように毎回変わる値は expect.any で置き換え、スナップショットが大きくなりすぎないよう大事な項目だけを対象にして。' },
      { name:'どの画面・ブラウザで確かめる？', en:'Device & browser matrix', h:440, tags:['判断','体験'],
        demo:'<div class="kt"><div class="cks" style="display:flex;flex-direction:column;gap:3px;font-size:11.5px"></div><div class="kt-verdict res kt-grow"></div></div>',
        init:(el) => { const M = [['iPhone（Safari）・幅390px前後', 30, true], ['Android（Chrome）・幅360〜412px', 25, true], ['PC（Chrome）・幅1280px以上', 30, true], ['PC（Safari・Mac）', 6, false], ['PC（Edge）', 5, false], ['タブレット（iPad）・幅768〜1024px', 3, false], ['PC（Firefox）', 1, false]];
          $(el, '.cks').innerHTML = M.map(([n, p, on], i) => `<label style="display:flex;gap:6px;align-items:center"><input type="checkbox" data-i="${i}"${on ? ' checked' : ''}><span style="flex:1">${n}</span><b class="kt-mono">${p}%</b></label>`).join('');
          const run = () => { const c = $$(el, '.cks input').filter(i => i.checked).reduce((a, i) => a + M[+i.dataset.i][1], 0); verdict($(el, '.res'), c >= 85 ? 'ok' : 'warn', `確かめた組み合わせで、利用者の <b>約${c}%</b> をカバー（割合は例。<b>自分のサイトのアクセス解析</b>で確認）。<br>まず<b>利用者の多い組み合わせ</b>を、E2E・スクショ比較で自動化。<b>iPhone の Safari</b> は独自の不具合が多いので、実機での確認も。Playwright なら WebKit で Safari に近い動きを試せます。`); };
          $$(el, '.cks input').forEach(i => i.onchange = run); run(); },
        desc:'すべてのブラウザ・端末で確かめるのは無理なので、<b>利用者の多い組み合わせ</b>から優先します。日本では<b>iPhone の Safari</b> が多く、独自の表示の違いも多いので要注意。アクセス解析でブラウザと画面の幅の割合を見て、テストの対象を決めましょう。',
        prompt:'Playwright の設定で、iPhone 14（WebKit）・Pixel 7（Chromium）・デスクトップ Chrome の3つのプロジェクトを作り、主要なE2Eテストとスクリーンショット比較をすべてで実行できるようにして。実機での確認が必要な項目のチェックリストも作って。' },
    ], null, true),
    S('見た目のテストの用語', [
      T('ビジュアルリグレッションテスト', 'Visual regression testing', 'スクリーンショットを前と比べて、見た目の変化を見つけるテスト。'),
      T('toHaveScreenshot', 'Playwright screenshots', 'Playwright のスクショ比較。初回に正解を保存し、次から比べる。'),
      T('しきい値', 'Threshold', 'どれくらいの違いまで許すか。小さすぎると不安定、大きすぎると見逃す。'),
      T('マスク', 'Masking', '日時・広告・ランダムな画像など、毎回変わる部分を比較から除く。'),
      T('Storybook', 'Storybook', '部品をひとつずつ表示・確認できるカタログ。Chromatic と組み合わせて見た目のテスト。'),
      T('スナップショット', 'Snapshot', '出力をまるごと記録して比べる。'),
      T('クロスブラウザテスト', 'Cross-browser testing', '複数のブラウザで確認すること。BrowserStack などのサービスで実機も使える。'),
      T('レスポンシブの確認', 'Responsive testing', '画面の幅ごとの表示を確認。320px（小さいスマホ）・768px・1280px が目安。'),
      T('ダークモードの確認', 'Dark mode', 'ダークモードでも文字が読めるか、画像が浮かないか。'),
      T('フォントの差', 'Font rendering', 'OS によって文字の描かれ方が違い、スクショ比較がずれる原因に。CI では同じ環境で撮る。', null, ['注意']),
    ]),
  ]});

/* ================= 7. CIと自動化 ================= */
const PIPE = [['インストール', 'npm ci'], ['Lint', 'eslint .'], ['型チェック', 'tsc --noEmit'], ['単体テスト', 'vitest run'], ['ビルド', 'next build'], ['E2Eテスト', 'playwright test'], ['プレビュー公開', 'vercel deploy']];
const YAML = [['name: CI', 'name', 'ワークフローの名前。GitHub の Actions タブに表示される。'], ['on:', 'on', '<b>いつ動くか</b>。下は「Pull Request を作ったとき」と「main に push したとき」。'], ['  pull_request:', ''], ['  push: { branches: [main] }', ''], ['jobs:', 'jobs', '仕事のまとまり。並列で動かすこともできる。'], ['  test:', ''], ['    runs-on: ubuntu-latest', 'runs-on', 'どのOSのマシンで動かすか（GitHub が用意してくれる）。'], ['    steps:', 'steps', '上から順番に実行する手順。'], ['      - uses: actions/checkout@v4', 'uses', '既製の部品（アクション）を使う。checkout はリポジトリのコードを取ってくる。'], ['      - uses: actions/setup-node@v4', ''], ['        with: { node-version: 22, cache: npm }', 'cache', 'npm のキャッシュで、毎回のインストールを速くする。'], ['      - run: npm ci', 'run', 'コマンドを実行。<b>どれか1つでも失敗すると止まる</b>。'], ['      - run: npm run lint && npm run typecheck', ''], ['      - run: npm test', ''], ['      - run: npx playwright install --with-deps && npx playwright test', '']];

TABS.push({ id:'ci', label:'CIと自動化', icon:'🔄',
  intro:'<b>CI（継続的インテグレーション）</b>は、変更をGitHubに送るたびに、<b>Lint・型チェック・テスト・ビルド</b>を自動で実行する仕組みです。失敗したら<b>マージできない</b>ようにしておけば、壊れたコードが本番に出ません。AIが大量にコードを書く時代ほど、この自動の門番が効きます。',
  sections:[
    C('触って理解する', [
      { name:'CIのパイプライン', en:'CI pipeline', h:470, tags:['体験','定番','最重要'],
        demo:'<div class="kt"><span class="kt-lbl">わざと失敗させる段</span><div class="ck kt-row" style="font-size:11.5px;gap:4px 10px;flex-wrap:wrap"></div><div class="kt-row"><button type="button" class="kt-btn pri go">▶ Pull Request を作る</button></div><div class="ts-pipe pp"></div><div class="kt-code lg kt-grow" style="overflow:auto;white-space:pre"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let run = 0; $(el, '.ck').innerHTML = PIPE.slice(1, 6).map(([n], i) => `<label><input type="checkbox" data-i="${i + 1}"${i === 2 ? ' checked' : ''}>${n}</label>`).join('');
          const draw = (st) => { $(el, '.pp').innerHTML = PIPE.map(([n], i) => `<span class="s ${st[i] || ''}">${st[i] === 'ok' ? '✓ ' : st[i] === 'bad' ? '× ' : ''}${n}</span>`).join('<i>→</i>'); }; draw([]);
          $(el, '.go').onclick = async () => { const me = ++run, fail = new Set($$(el, '.ck input').filter(i => i.checked).map(i => +i.dataset.i)), st = []; $(el, '.lg').textContent = ''; verdict($(el, '.res'), '', '実行中…');
            for (let i = 0; i < PIPE.length; i++){ if (me !== run || !el.isConnected) return; st[i] = 'run'; draw(st); $(el, '.lg').textContent += `$ ${PIPE[i][1]}\n`; await sleep(420);
              if (fail.has(i)){ st[i] = 'bad'; for (let j = i + 1; j < PIPE.length; j++) st[j] = 'skip'; draw(st); $(el, '.lg').textContent += i === 3 ? '  FAIL  price.test.ts > 5000円ちょうどは1割引き\n    期待：4500　実際：5000\n' : i === 2 ? "  src/cart.ts:12:5 - error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.\n" : i === 1 ? "  src/api.ts  8:7  error  'user' is assigned a value but never used\n" : i === 4 ? '  Build error: Module not found: Can\'t resolve \'@/lib/stripe\'\n' : '  1 failed: [chromium] checkout.spec.ts › 購入できる\n'; $(el, '.lg').scrollTop = 1e6;
                verdict($(el, '.res'), 'bad', `❌ <b>${PIPE[i][0]}</b>で失敗 → 以降は実行されず、Pull Request に赤い×。<b>マージできません</b>。ログをAIに貼れば、原因と直し方を教えてくれます。`); return; }
              st[i] = 'ok'; draw(st); $(el, '.lg').textContent += '  ✓ ok\n'; $(el, '.lg').scrollTop = 1e6; }
            verdict($(el, '.res'), 'ok', '✓ すべて成功。Pull Request に緑のチェック、プレビュー用のURLも発行されました。レビューしてマージできます。'); }; },
        desc:'CI は、<b>インストール → Lint → 型チェック → テスト → ビルド → E2E</b> を毎回自動で実行します。どこかで失敗すると止まり、Pull Request に赤い×が付きます。<b>速い確認を先に</b>並べると、失敗が早く分かります。失敗のログはそのままAIに貼って直してもらえます。',
        prompt:'このリポジトリに GitHub Actions のCIを作って。Pull Request と main への push で、npm ci → lint → 型チェック → Vitest → next build → Playwright（失敗時はレポートを成果物として保存）を実行。node_modules と Playwright のブラウザはキャッシュして速くして。' },
      { name:'GitHub Actions の設定ファイル', en:'Workflow YAML', h:470, tags:['体験','GitHub'],
        demo:'<div class="kt"><div class="kt-code an kt-grow" style="white-space:pre;overflow:auto"></div><div class="kt-verdict res">紫色の項目をクリックしてください。</div></div>',
        init:(el) => { $(el, '.an').innerHTML = YAML.map(([l, k]) => k ? esc(l).replace(k, `<span class="k" data-k="${k}" style="cursor:pointer;text-decoration:underline dotted">${k}</span>`) : esc(l)).join('\n');
          $$(el, '.an [data-k]').forEach(s => s.onclick = () => verdict($(el, '.res'), '', `<b>${s.dataset.k}</b>：${YAML.find(y => y[1] === s.dataset.k)[2]}`)); },
        desc:'GitHub Actions は、リポジトリの <code>.github/workflows/</code> に置いた <b>YAML ファイル</b>で動きます。<b>on</b>（いつ）・<b>jobs</b>（仕事）・<b>steps</b>（手順）の3つが基本。既製の部品（actions/checkout など）を組み合わせ、最後に自分のコマンド（npm test など）を書きます。',
        prompt:'.github/workflows/ci.yml を作って、どの行が何をしているか日本語のコメントを付けて。Node 22、npm のキャッシュ、Pull Request のときだけ E2E を実行、main への push のときは本番にデプロイする前に全テストを通す形にして。' },
      { name:'通ったり落ちたりするテスト', en:'Flaky test detection', h:420, tags:['体験','運用','よくある失敗'],
        demo:'<div class="kt"><span class="sw"></span><div class="kt-row"><button type="button" class="kt-btn pri go">▶ 同じテストを30回実行</button></div><div class="ts-dots dt"></div><div class="kt-verdict res kt-grow"></div></div>',
        init:(el) => { let p = .1; $(el, '.sw').replaceWith(seg(['時間で待つテスト', '現在時刻に頼るテスト', '安定したテスト'], i => { p = [.12, .07, 0][i]; $(el, '.dt').innerHTML = ''; verdict($(el, '.res'), '', ['表示を「1秒待つ」で待っているテスト。', '「今日が月末かどうか」で結果が変わるテスト。', '条件で待ち、時刻を固定したテスト。'][i]); }).el);
          $(el, '.go').onclick = async () => { const r = rng(Date.now() % 991 + 7); let f = 0, html = ''; for (let i = 0; i < 30; i++){ const bad = r() < p; if (bad) f++; html += `<i class="${bad ? 'f' : ''}"></i>`; $(el, '.dt').innerHTML = html; await sleep(30); }
            verdict($(el, '.res'), f ? 'bad' : 'ok', f ? `❌ 30回中 <b>${f}回</b>失敗。コードは何も変えていないのに結果が変わる<b>不安定なテスト（flaky）</b>です。「また落ちた、再実行しよう」が習慣になると、<b>本物の失敗も見逃す</b>ようになります。原因（待ち方・時刻・順番・外部API）を直しましょう。` : '✓ 30回とも成功。安定しています。'); }; },
        desc:'コードを変えていないのに<b>通ったり落ちたりする</b>テストを flaky（不安定）と呼びます。原因は、時間で待つ・現在時刻や乱数に頼る・テストの順番に頼る・本物の外部APIを呼ぶ、など。放っておくと「どうせまた落ちただけ」と本物の失敗まで無視されるようになるので、<b>見つけたら最優先で直します</b>。',
        prompt:'CIでたまに失敗するテストを見つけて直したい。Playwright は --repeat-each=20、Vitest は同じテストを何回も実行して不安定なテストを洗い出し、原因（固定の待ち時間・現在時刻・テスト間のデータ共有・外部API）ごとに直して。' },
      { name:'マージの前に必ずチェック', en:'Required status checks', h:420, tags:['体験','GitHub'],
        demo:'<div class="kt"><div class="ts-res ck kt-grow"></div><div class="kt-row"><button type="button" class="kt-btn sm rr">失敗したチェックを直して再実行</button><button type="button" class="kt-btn pri mg">Merge pull request</button></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let st = ['ok', 'ok', 'bad', 'run']; const N = ['CI / lint', 'CI / typecheck', 'CI / unit-test', 'CI / e2e'];
          const draw = () => { $(el, '.ck').innerHTML = N.map((n, i) => `<div class="${st[i] === 'ok' ? 'ok' : st[i] === 'bad' ? 'bad' : 'warn'}"><b>${st[i] === 'ok' ? '✓' : st[i] === 'bad' ? '×' : '…'}</b><span>${n}<small>${st[i] === 'ok' ? '成功' : st[i] === 'bad' ? '失敗：price.test.ts' : '実行中'}（必須）</small></span></div>`).join(''); const all = st.every(s => s === 'ok'); $(el, '.mg').disabled = !all; verdict($(el, '.res'), all ? 'ok' : 'warn', all ? '✓ 必須のチェックがすべて成功。マージできます。' : '<b>ブランチ保護</b>で「必須のチェック」に設定しているので、全部成功するまで<b>マージボタンが押せません</b>。急いでいても、壊れたまま main に入らない。'); };
          $(el, '.rr').onclick = async () => { st = st.map(s => s === 'ok' ? 'ok' : 'run'); draw(); await sleep(900); st = st.map(() => 'ok'); draw(); };
          $(el, '.mg').onclick = () => verdict($(el, '.res'), 'ok', '🎉 マージしました。main にはテストを通ったコードだけが入ります。'); draw(); setTimeout(() => { if (st[3] === 'run'){ st[3] = 'ok'; draw(); } }, 1200); },
        desc:'GitHub の<b>ブランチ保護</b>で、「CI が成功しないとマージできない」設定にしておくと、急いでいるときやAIが大量に変更したときでも、<b>壊れたコードが main（本番）に入りません</b>。レビューの承認を必須にすることもできます。',
        prompt:'GitHub のブランチ保護（またはルールセット）で、main へのマージに「CI の lint・typecheck・test・e2e がすべて成功」「1人以上の承認」を必須にする設定手順を教えて。直接 main に push できないようにもして。' },
    ], null, true),
    S('CIと自動化の用語', [
      T('CI / CD', 'Continuous Integration / Delivery', 'CI＝変更のたびに自動でテスト。CD＝テストを通ったら自動で公開。', null, ['基本']),
      T('GitHub Actions', 'GitHub Actions', 'GitHub に入っている CI の仕組み。公開リポジトリは無料、非公開は無料枠あり。'),
      T('ワークフロー・ジョブ・ステップ', 'Workflow / job / step', 'ワークフローの中にジョブ、ジョブの中にステップ。'),
      T('Lint', 'Linting', 'コードの書き方の問題を見つける（ESLint・Biome）。'),
      T('型チェック', 'Type checking', 'TypeScript の型の間違いを見つける（tsc --noEmit）。最も安いテスト。'),
      T('ブランチ保護', 'Branch protection', 'main への直接の push を禁止し、CI の成功やレビューを必須にする設定。'),
      T('プレビュー環境', 'Preview deployments', 'Pull Request ごとに確認用のURLを自動で作る（Vercel・Netlify）。見た目の確認やレビューに。'),
      T('キャッシュ', 'Caching', '依存関係などを保存して、CI を速くする。'),
      T('成果物（アーティファクト）', 'Artifacts', 'テストのレポート・スクショ・ビルド結果を保存してダウンロードできるようにする。'),
      T('pre-commit フック', 'Pre-commit hooks', 'コミットの前に Lint・整形を自動で実行（husky・lint-staged）。CI の前に手元で気づける。'),
      T('Dependabot・Renovate', 'Dependency updates', 'ライブラリの更新を自動で Pull Request にしてくれる。CI が通るかで安全か判断できる。'),
    ]),
  ]});

/* ================= 8. AIとテスト ================= */
const BUGGY = '// 5000円以上で1割引き（バグ：5000円ちょうどが割引されない）\nfunction total(price) {\n  return price > 5000 ? price * 0.9 : price;\n}';
const BADTESTS = [['期待値を実装からコピー', 'test("6000円の合計", () => {\n  const price = 6000;\n  // 期待値を実装と同じ式で計算してしまう\n  expect(total(price)).toBe(price > 5000 ? price * 0.9 : price);\n});\ntest("5000円の合計", () => {\n  expect(total(5000)).toBe(5000 > 5000 ? 5000 * 0.9 : 5000);\n});'], ['expect がない', 'test("割引の計算が動く", () => {\n  total(5000);\n  total(6000);\n  // 何も確かめていない（エラーにならないことしか分からない）\n});'], ['都合のいい値だけ', 'test("1000円は割引なし", () => {\n  expect(total(1000)).toBe(1000);\n});\ntest("10000円は1割引き", () => {\n  expect(total(10000)).toBe(9000);\n});'], ['仕様から書いた良いテスト', 'test("4999円は割引なし", () => {\n  expect(total(4999)).toBe(4999);\n});\ntest("5000円ちょうどは1割引き（仕様：以上）", () => {\n  expect(total(5000)).toBe(4500);\n});\ntest("6000円は1割引き", () => {\n  expect(total(6000)).toBe(5400);\n});']];
const MUT = [['>= を > に', (s) => s.replace('>=', '>')], ['0.9 を 0.8 に', (s) => s.replace('0.9', '0.8')], ['500 を 300 に', (s) => s.replace('return 500', 'return 300')], ['条件を逆に', (s) => s.replace('price >= 5000 ?', 'price < 5000 ?')]];
const MSRC = 'function total(price) {\n  if (price < 3000) return 500 + price;\n  return price >= 5000 ? price * 0.9 : price;\n}';
const MTESTS = [['3000円未満は送料500円', 'expect(total(1000)).toBe(1500);'], ['6000円は1割引き', 'expect(total(6000)).toBe(5400);'], ['5000円ちょうどは1割引き', 'expect(total(5000)).toBe(4500);'], ['4000円は割引なし・送料なし', 'expect(total(4000)).toBe(4000);']];

TABS.push({ id:'ai', label:'AIとテスト', icon:'🤖',
  intro:'AIはテストを書くのも得意ですが、<b>「とにかく通るテスト」</b>を書いてしまうことがあります。期待値を実装からコピーする・何も確かめない・都合のいい値だけ。テストは<b>仕様（こうあるべき）から</b>書くもの。テストの質を確かめる<b>ミューテーションテスト</b>や、たくさんの入力で試す<b>プロパティベーステスト</b>も紹介します。',
  sections:[
    C('触って理解する', [
      { name:'バグを見逃すテスト・見つけるテスト', en:'Tests that always pass', h:540, tags:['AI','体験','最重要'], wide:true,
        demo:'<div class="kt"><span class="sw"></span><div class="ts-two"><div><span class="kt-lbl">テストされる関数（バグあり）</span><div class="kt-code" style="white-space:pre;flex:1">' + esc(BUGGY) + '</div></div><div><span class="kt-lbl">AIが書いたテスト</span><div class="kt-code tc" style="white-space:pre;flex:1;overflow:auto"></div></div></div><div class="ts-res rs" style="max-height:32%"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.sw').replaceWith(seg(BADTESTS.map(b => b[0]), i => { $(el, '.tc').textContent = BADTESTS[i][1]; const r = showResults($(el, '.rs'), runTests(BUGGY, BADTESTS[i][1]));
            verdict($(el, '.res'), i === 3 ? 'ok' : 'bad', i === 3 ? '✓ <b>仕様（5000円以上）から</b>境目の値で書いたので、バグを見つけました。' : i === 0 ? '❌ 期待値を実装と同じ式で計算しているので、<b>実装が間違っていても必ず通ります</b>。AIがよく書くパターン。' : i === 1 ? '❌ expect がないので、何も確かめていません。カバレッジは上がるのに、意味はゼロ。' : '❌ 境目（5000円ちょうど）を試していないので、バグがすり抜けます。'); }).el); },
        desc:'バグのある関数に、AIがよく書く「悪いテスト」を当ててみると、<b>全部通ってしまいます</b>。期待値は<b>仕様から</b>（人が決めた正解を）書くこと、<b>境目の値</b>を必ず入れること、テストがちゃんと<b>失敗することも確かめる</b>こと。テストの中身は、人が一度読んで確認しましょう。',
        prompt:'このテストファイルをレビューして。期待値を実装と同じ計算で求めているテスト、expect のないテスト、境界値を試していないテストを指摘して、仕様（貼り付け）から期待値を決めて書き直して。書き直したテストが、わざと実装を壊したときに失敗することも確認して。' },
      { name:'テストの強さを測る（ミューテーション）', en:'Mutation testing', h:500, tags:['品質','体験'],
        demo:'<div class="kt"><div class="kt-code" style="white-space:pre">' + esc(MSRC) + '</div><span class="kt-lbl">使うテスト</span><div class="ck" style="display:flex;flex-direction:column;gap:2px;font-size:11.5px"></div><div class="ts-res rs kt-grow"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.ck').innerHTML = MTESTS.map(([n], i) => `<label><input type="checkbox" data-i="${i}"${i < 2 ? ' checked' : ''}> ${n}</label>`).join('');
          const run = () => { const on = $$(el, '.ck input').filter(i => i.checked).map(i => MTESTS[+i.dataset.i]), tests = on.map(([n, e]) => `test(${JSON.stringify(n)}, () => { ${e} });`).join('\n'); let killed = 0;
            const rows = MUT.map(([n, f]) => { const r = runTests(f(MSRC), tests), dead = r.results.some(x => !x.ok); if (dead) killed++; return `<div class="${dead ? 'ok' : 'bad'}"><b>${dead ? '✓' : '×'}</b><span>変異：${n}<small>${dead ? 'テストが失敗した → このバグは見つけられる（変異を倒した）' : 'テストが全部通ってしまった → このバグは見逃す（変異が生き残った）'}</small></span></div>`; });
            $(el, '.rs').innerHTML = rows.join(''); const sc = Math.round(killed / MUT.length * 100); verdict($(el, '.res'), sc === 100 ? 'ok' : sc >= 50 ? 'warn' : 'bad', `ミューテーションスコア <b>${sc}%</b>（${killed}/${MUT.length}個の「わざと入れたバグ」を見つけられた）。生き残った変異が、<b>テストの抜け</b>を教えてくれます。`); };
          $$(el, '.ck input').forEach(i => i.onchange = run); run(); },
        desc:'<b>ミューテーションテスト</b>は、コードに<b>わざと小さなバグ</b>（>= を > に、0.9 を 0.8 に…）を入れて、テストが失敗するかを確かめます。失敗すれば「このバグは見つけられる」、通ってしまえば「テストが弱い」。カバレッジ100%でも見逃しはあるので、本当の強さを測れます。JavaScript なら <b>Stryker</b> が定番です。',
        prompt:'このプロジェクトに Stryker（ミューテーションテスト）を入れて、お金の計算と権限チェックのファイルを対象に実行して。生き残った変異（テストで見つけられないバグ）を一覧にして、それを見つけるテストを追加して。' },
      { name:'たくさんの入力で性質を確かめる', en:'Property-based testing', h:500, tags:['品質','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="kt-code cd" style="white-space:pre"></div><div class="kt-row"><button type="button" class="kt-btn pri go">▶ ランダムな配列で100回試す</button></div><div class="au-log lg kt-grow" style="font:11.5px/1.6 var(--mono);background:var(--code-bg);border:1px solid var(--border);border-radius:8px;padding:6px 8px;overflow:auto"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let k = 0; const F = [['よくある書き方', (a) => [...a].sort(), 'const sortNumbers = (a) => [...a].sort();'], ['正しい書き方', (a) => [...a].sort((x, y) => x - y), 'const sortNumbers = (a) => [...a].sort((x, y) => x - y);']];
          const prop = (f, a) => { const s = f(a); return s.length === a.length && s.every((v, i) => i === 0 || s[i - 1] <= v); };
          $(el, '.sw').replaceWith(seg(F.map(f => f[0]), i => { k = i; $(el, '.cd').textContent = `${F[i][2]}\n\n// 性質：結果は「小さい順」で、長さが同じ\nfc.assert(fc.property(fc.array(fc.integer()), (a) => isSorted(sortNumbers(a))));`; $(el, '.lg').innerHTML = ''; verdict($(el, '.res'), '', '例を1つずつ書く代わりに、<b>どんな入力でも成り立つ性質</b>を書いて、ランダムな入力で何百回も試します。'); }).el);
          $(el, '.go').onclick = async () => { const r = rng(Date.now() % 977 + 3), lg = $(el, '.lg'), L = (t) => { lg.insertAdjacentHTML('beforeend', `<div>${t}</div>`); lg.scrollTop = 1e6; }; lg.innerHTML = ''; const f = F[k][1]; let bad = null;
            for (let i = 1; i <= 100; i++){ const a = Array.from({ length:Math.floor(r() * 6) }, () => Math.floor(r() * 40) - 5); if (!prop(f, a)){ bad = a; L(`${i}回目：<b style="color:var(--bad)">反例</b> [${a.join(', ')}] → [${f(a).join(', ')}]`); break; } if (i % 20 === 0){ L(`${i}回… すべて成功`); await sleep(60); } }
            if (!bad){ verdict($(el, '.res'), 'ok', '✓ 100回すべてで性質が成り立ちました。'); return; }
            let cur = bad; for (let changed = true; changed;){ changed = false; for (let i = 0; i < cur.length; i++){ const c = cur.filter((_, j) => j !== i); if (!prop(f, c)){ cur = c; changed = true; break; } } for (let i = 0; i < cur.length && !changed; i++){ const c = [...cur]; c[i] = Math.trunc(c[i] / 2); if (c[i] !== cur[i] && !prop(f, c)){ cur = c; changed = true; } } }
            L(`縮小（シュリンク）→ 最小の反例 <b>[${cur.join(', ')}]</b> → [${f(cur).join(', ')}]`); verdict($(el, '.res'), 'bad', `❌ JavaScript の <code>sort()</code> は、何も渡さないと<b>文字として並べる</b>ので、10 が 9 より前に来ます。人が思いつく例（[3, 1, 2]）では見つからないバグを、ランダムな入力が見つけ、<b>一番小さい反例</b>まで縮めて見せてくれます。`); }; },
        desc:'<b>プロパティベーステスト</b>は、「並べ替えた結果は小さい順」「2回反転すると元に戻る」のような<b>性質</b>を書いて、ランダムな入力で何百回も試す方法です。人が思いつかない入力でバグを見つけ、<b>最小の反例</b>に縮めて教えてくれます。JavaScript なら <b>fast-check</b> を使います。',
        prompt:'この関数（貼り付け）に fast-check を使ったプロパティベーステストを追加して。どんな入力でも成り立つ性質（結果の範囲・元に戻せる・順番に関係ない など）を3つ考えて説明し、Vitest で実行できるように書いて。' },
      { name:'AIへのテストの頼み方', en:'Prompting for good tests', h:460, tags:['AI','体験'],
        demo:'<div class="kt"><div class="ck" style="display:flex;flex-wrap:wrap;gap:4px 12px;font-size:11.5px"></div><div class="kt-code out kt-grow" style="white-space:pre-wrap;overflow:auto"></div><div class="kt-row"><button type="button" class="kt-btn sm cp">コピー</button></div></div>',
        init:(el) => { const O = [['spec', '仕様を貼って、期待値は仕様から決めてもらう', true], ['bd', '境界値（ちょうど・1つ手前・1つ後）', true], ['err', '異常な入力（空・null・マイナス・巨大な値）', true], ['ja', '日本語・全角・絵文字の入力', false], ['date', '日付・時刻・タイムゾーン（時計を固定）', false], ['auth', '権限（他人のデータにアクセスできない）', false], ['fail', 'わざと実装を壊して、テストが失敗するか確認', true], ['nocopy', '実装をコピーした期待値・expect のないテストは禁止', true]];
          $(el, '.ck').innerHTML = O.map(([k, l, v]) => `<label><input type="checkbox" data-k="${k}"${v ? ' checked' : ''}>${l}</label>`).join('');
          const run = () => { const on = $$(el, '.ck input').filter(i => i.checked).map(i => O.find(o => o[0] === i.dataset.k)[1]);
            $(el, '.out').textContent = `次の関数の単体テストを Vitest で書いてください。\n\n【仕様】\n（ここに仕様を箇条書きで貼る）\n\n【テストに含めること】\n${on.map(x => '・' + x).join('\n')}\n\n【書き方】\n・テスト名は「〜のとき、〜になる」という日本語の仕様の文にする\n・1つのテストで確かめることは1つ\n・まずテストだけを書き、実装はまだ変更しないこと\n・最後に、どの仕様をどのテストで確かめたかを表にまとめる`; };
          $$(el, '.ck input').forEach(i => i.onchange = run); $(el, '.cp').onclick = () => VD.copyText($(el, '.out').textContent); run(); },
        desc:'AIにテストを頼むときは、<b>仕様を渡して期待値はそこから決める</b>・<b>境界値と異常な入力を含める</b>・<b>実装をコピーした期待値を禁止する</b>・<b>わざと壊して失敗するか確かめる</b>、を明記すると、質がぐっと上がります。チェックを付けて、頼み方の文章を作ってみましょう。',
        prompt:'今後このプロジェクトでテストを書くときのルールを CLAUDE.md に追記して。仕様から期待値を決める、境界値と異常系を含める、外部APIはモック、時刻は固定、テストを書いたら実装をわざと壊して失敗することを確認、の5点を短くまとめて。' },
    ], null, true),
    S('AIとテストの用語', [
      T('仕様から書く', 'Spec-first tests', '期待値は「こうあるべき」から決める。実装を見て期待値を作ると、バグごと固定してしまう。', null, ['最重要']),
      T('いつも通るテスト', 'Tautological tests', '実装をコピーした期待値・expect なし・都合のいい値だけ。カバレッジだけ上がって何も守らない。', null, ['よくある失敗']),
      T('ミューテーションテスト', 'Mutation testing', 'わざと小さなバグを入れて、テストが見つけられるかでテストの強さを測る。Stryker。'),
      T('プロパティベーステスト', 'Property-based testing', '性質を書いて、ランダムな入力で大量に試す。fast-check。'),
      T('シュリンク', 'Shrinking', '見つかった反例を、同じ失敗を起こす一番小さい入力まで縮めること。'),
      T('テストを壊して確かめる', 'Make it fail first', '新しいテストが本当に失敗できるか、実装をわざと壊して確認する。失敗できないテストは意味がない。'),
      T('ゴールデンテスト', 'Golden tests', '正解の出力（ファイル）を用意して比べる。変換・帳票・AIの出力の形の確認に。'),
      T('AI機能の評価（eval）', 'Evals', 'AIの答えの品質を、たくさんの例で測る。普通のテストとは別に用意する。（AI組み込み辞典）'),
      T('回帰テストの追加', 'Bug → test', 'バグを直したら、そのバグを再現するテストを必ず追加する。同じバグが二度と戻らない。', null, ['習慣']),
      T('テストのレビュー', 'Reviewing tests', 'AIが書いたテストこそ、人が読む。名前と期待値を見れば、仕様と合っているか分かる。'),
    ]),
  ]});
})();
