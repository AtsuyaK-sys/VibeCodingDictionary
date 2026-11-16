/* アプリ・配布形態辞典 — A: 共通ヘルパー / 形の選び方 / PWA / スマホアプリ / ストア公開 */
(function(){
const { $, $$, esc, tbl, seg, seq, stepper } = KIT;
const S = (title, items, note) => ({ title, note, layout:'rows', items });
const C = (title, items, note, lg) => ({ title, note, layout:lg ? 'cards lg' : 'cards', items });
const T = (name, en, desc, prompt, tags, more) => Object.assign({ name, en, desc, prompt, tags }, more || {});
const verdict = (el, cls, html) => { el.classList.remove('ok', 'bad', 'warn'); if (cls) el.classList.add(cls); el.innerHTML = html; };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const phone = (inner) => `<div class="ap-phone"><div class="notch"></div><div class="ap-scr">${inner}</div><div class="homebar"></div></div>`;
const bars = (rows, unit = '') => rows.map(([n, v, max, c]) => `<span>${n}</span><i style="width:${Math.max(1, v / max * 100)}%;${c ? 'background:' + c : ''}"></i><output>${v.toLocaleString()}${unit}</output>`).join('');
window.APH = { S, C, T, verdict, sleep, phone, bars };

/* ================= 1. 形の選び方 ================= */
const FORMS = ['Webサイト', 'PWA（ホーム画面に置けるWeb）', 'ネイティブ（Swift・Kotlin）', 'クロスプラットフォーム（React Native・Flutter）', 'デスクトップ（Electron・Tauri）', 'ブラウザ拡張', 'LINEミニアプリ・LIFF'];
const QS = [['スマホのホーム画面から毎日使ってほしい', [0, 2, 2, 2, 0, 0, 1]], ['プッシュ通知で呼び戻したい', [0, 1, 3, 3, 1, 0, 2]], ['Bluetooth・ヘルスケア・ウィジェットなど端末の機能を深く使う', [-1, -1, 3, 2, 1, -1, -1]], ['App Store・Google Play で見つけてほしい', [-1, 0, 3, 3, 0, 0, 0]], ['とにかく早く・安く出して反応を見たい', [3, 2, -2, 0, 0, 1, 2]], ['お客さまは LINE をよく使う（お店の会員証・予約）', [0, 0, 0, 0, -1, -1, 4]], ['PCで作業中のページやファイルを扱う', [1, 0, -1, -1, 3, 3, -1]], ['電波がなくても使いたい', [-1, 2, 2, 2, 2, 0, -1]]];
const FORMTBL = [['Webサイト', 'URLを開くだけ', '◎ すぐ・無料', '△ 通知・端末機能は限定', '何でもまずはここから'], ['PWA', 'ホーム画面に追加', '◎ Webのまま', '○ 通知・オフライン可（iPhoneは制限あり）', 'よく使う道具・社内アプリ'], ['ネイティブ（Swift・Kotlin）', 'ストアからインストール', '△ iPhone・Android 別々に作る', '◎ 全機能', '高性能・端末機能をフルに'], ['クロスプラットフォーム（Expo・Flutter）', 'ストアからインストール', '○ 1つのコードで両方', '○ ほぼ全機能', 'スマホアプリの第一候補'], ['デスクトップ（Electron・Tauri）', 'インストーラー', '○ Web技術で作れる', '○ ファイル・常駐', 'PC用の道具・オフライン作業'], ['ブラウザ拡張', 'Chrome ウェブストア', '◎ 小さく作れる', '○ 見ているページを操作', '作業の効率化・ページに機能を足す'], ['LINEミニアプリ・LIFF', 'LINEのトークやリンクから', '○ Web技術', '○ LINEのログイン・メッセージ', '店舗の会員証・予約・注文']];

TABS.push({ id:'choose', label:'形の選び方', icon:'🧭',
  intro:'作ったものを届ける形は、<b>Webサイト・PWA・スマホアプリ・デスクトップアプリ・ブラウザ拡張・LINEミニアプリ</b>などいろいろ。迷ったら<b>まずWeb（PWA）で出して反応を見る</b>のが基本です。通知・端末の機能・ストアでの見つけやすさが必要になったら、アプリを検討しましょう。',
  sections:[
    C('触って理解する', [
      { name:'どの形で出す？診断', en:'Which distribution form?', h:520, tags:['判断','体験','最重要'], wide:true,
        demo:'<div class="kt"><div class="qs" style="display:flex;flex-direction:column;gap:4px;flex:1.3 1 0;min-height:0;overflow:auto"></div><div class="ap-rank rk" style="flex:1 1 0;min-height:70px"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const ans = QS.map(() => 0);
          const run = () => { const sc = FORMS.map((_, i) => [3, 2, 0, 0, 0, 0, 0][i] + QS.reduce((a, q, k) => a + (ans[k] ? q[1][i] : 0), 0)), mx = Math.max(...sc, 1), order = FORMS.map((f, i) => [f, sc[i]]).sort((a, b) => b[1] - a[1]);
            $(el, '.rk').innerHTML = order.map(([f, s], i) => `<div class="${i === 0 ? 'top' : ''}"><span>${i === 0 ? '👑 ' : ''}${f}</span><i style="width:${Math.max(2, s / mx * 100)}%"></i><b class="kt-mono">${s}</b></div>`).join('');
            verdict($(el, '.res'), 'ok', `おすすめ：<b>${order[0][0]}</b>${order[1][1] >= order[0][1] - 1 ? `（次点：${order[1][0]}）` : ''}。迷ったら<b>Web（PWA）で出して反応を見てから</b>、必要な部分だけアプリにするのが失敗しにくい進め方です。`); };
          $(el, '.qs').innerHTML = ''; QS.forEach(([q], k) => { const row = document.createElement('div'); row.className = 'ap-q'; row.innerHTML = `<span>${q}</span>`; row.append(seg(['いいえ', 'はい'], v => { ans[k] = v; run(); }).el); $(el, '.qs').append(row); }); run(); },
        desc:'届け方は「何をしたいか」で決まります。<b>プッシュ通知・端末の深い機能・ストアでの発見</b>が必要ならアプリ、<b>早く安く</b>ならWeb（PWA）、<b>PCの作業</b>ならデスクトップアプリや拡張、<b>お店のお客さまがLINEを使っている</b>ならLINEミニアプリ。質問に答えて傾向を見てみましょう（目安の点数です）。',
        prompt:'作りたいサービス（ジムの予約と会員証）を、Webサイト・PWA・スマホアプリ・LINEミニアプリのどれで出すべきか比較して。費用・開発期間・通知・お客さまの使いやすさ・審査の有無で表にして、最初に作るべき形を提案して。' },
      { name:'使い始めるまでの手間', en:'Friction to first use', h:420, tags:['UX','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="ap-bars br kt-grow" style="align-content:center"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const F = [['Webサイト', [['リンクをタップ', 100], ['ページが開いて使える', 90]], '1タップで使い始められる。<b>新しい人に試してもらう</b>には最強。'], ['PWA', [['リンクをタップ', 100], ['使ってみる', 90], ['ホーム画面に追加', 20]], 'まず Web として使ってもらい、<b>気に入った人だけ</b>ホーム画面に追加。iPhone は共有メニューから手動で追加。'], ['ストアアプリ', [['リンクをタップ', 100], ['ストアが開く', 80], ['インストールする', 40], ['起動してログイン', 30]], '段階ごとに人が減る。そのかわり、一度入れた人は<b>通知で呼び戻しやすく</b>、ホーム画面に残る。']];
          $(el, '.sw').replaceWith(seg(F.map(f => f[0]), i => { $(el, '.br').innerHTML = bars(F[i][1].map(([n, v]) => [n, v, 100]), '人'); verdict($(el, '.res'), '', F[i][2] + '<br><span style="color:var(--muted)">※人数は100人が来たときのイメージです。</span>'); }).el); },
        desc:'利用者が<b>実際に使い始めるまでの手順</b>が多いほど、途中で人が減っていきます。Webはリンク1つで使えるので、最初の一歩が圧倒的に軽い。アプリは入れてもらうまでが大変ですが、入れた人とは長く付き合えます。<b>最初はWebで、熱心な人にはアプリで</b>という組み合わせも定番です。',
        prompt:'今のWebサービスをスマホアプリにするか迷っています。アクセス解析のどの数字（再訪率・ホーム画面からの起動・通知を求める声）を見れば判断できるか教えて。PWAにして様子を見る手順も。' },
    ], null, true),
    { title:'配布の形の比較', note:'1つのサービスで複数の形を組み合わせることもよくあります（Web＋アプリ、Web＋LINEミニアプリ など）。',
      table:{ head:['形', '届け方', '作りやすさ', 'できること', '向いている'], rows:FORMTBL } },
    S('配布の形の用語', [
      T('ネイティブアプリ', 'Native app', 'iPhone は Swift、Android は Kotlin で、それぞれ専用に作るアプリ。性能と機能が最高だが、2つ作る手間がかかる。'),
      T('クロスプラットフォーム', 'Cross-platform', '1つのコードから iPhone・Android 両方のアプリを作る。React Native（Expo）・Flutter が代表。', null, ['定番']),
      T('ハイブリッドアプリ', 'Hybrid app', 'Webページをアプリの中に入れて配る方式。Capacitor など。今あるWebを素早くアプリにできる。'),
      T('PWA', 'Progressive Web App', 'ホーム画面に追加でき、アプリのように動くWeb。オフライン・通知にも対応できる。（「PWA」タブ）'),
      T('WebView', 'WebView', 'アプリの中でWebページを表示する部品。中身がほぼWebなだけのアプリは、ストアの審査で落ちることがある。', null, ['注意']),
      T('デスクトップアプリ', 'Desktop app', 'Windows・Mac にインストールするアプリ。Electron・Tauri ならWeb技術で作れる。'),
      T('ブラウザ拡張機能', 'Browser extension', 'Chrome などに機能を追加する小さなプログラム。見ているページを操作できる。'),
      T('LINEミニアプリ', 'LINE MINI App', 'LINEの中で動くWebアプリ。インストール不要で、LINEのログインやメッセージと連携できる。'),
      T('MVP', 'Minimum Viable Product', '必要最小限の機能で早く出して、反応を見る最初の版。形はWebが向いている。'),
      T('ディープリンク', 'Deep link', 'リンクからアプリの特定の画面を直接開く仕組み。アプリが無ければWebで開くようにする。'),
    ]),
  ]});

/* ================= 2. PWA ================= */
const DISP = [['standalone', 'アプリのように（アドレスバーなし）'], ['minimal-ui', '戻る・更新などの最小限のボタン'], ['fullscreen', '画面全体（ゲーム向け）'], ['browser', '普通のブラウザのまま']];
const STRAT = [['Cache First', 'キャッシュ優先', '画像・フォント・CSSなど<b>めったに変わらない物</b>'], ['Network First', 'ネットワーク優先', 'ニュース・在庫など<b>最新であってほしい物</b>（オフライン時は保存した物）'], ['Stale-While-Revalidate', 'まず保存した物、裏で更新', 'アバター・設定など<b>速さ重視で、少し古くても良い物</b>'], ['Network Only', 'いつもネットワーク', '決済・ログインなど<b>キャッシュしてはいけない物</b>']];

TABS.push({ id:'pwa', label:'PWA', icon:'📲',
  intro:'<b>PWA（プログレッシブウェブアプリ）</b>は、Webサイトに<b>アプリの設定ファイル（manifest）</b>と<b>裏方のプログラム（Service Worker）</b>を足して、ホーム画面に追加・オフライン動作・通知をできるようにしたもの。ストアの審査なしで、今のWebをアプリらしくできます。',
  sections:[
    C('触って理解する', [
      { name:'manifest.json を作る', en:'Web App Manifest', h:540, tags:['PWA','体験','定番'], wide:true,
        demo:'<div class="kt"><div class="ap-wrap st"><div class="side" style="flex:1;min-width:0;display:flex;flex-direction:column;gap:6px;max-width:300px;align-self:stretch;overflow:auto"><div class="fm au-form" style="display:grid;grid-template-columns:auto 1fr;gap:4px 8px;align-items:center;font-size:11.5px"></div><span class="sw"></span><span class="vw"></span><div class="kt-code js" style="flex:1;overflow:auto;white-space:pre;min-height:60px"></div></div><div class="ph" style="height:100%;display:flex"></div></div></div>',
        init:(el) => { const st = { name:'まいにち家計簿', short:'家計簿', ic:'💰', theme:'#059669', bg:'#ecfdf5', disp:0, view:0 };
          $(el, '.fm').innerHTML = [['name', 'name（正式名）', 'text'], ['short', 'short_name（ホーム画面）', 'text'], ['ic', 'アイコン（絵文字で代用）', 'text'], ['theme', 'theme_color', 'color'], ['bg', 'background_color', 'color']].map(([k, l, t]) => `<span>${l}</span><input class="kt-in" type="${t}" data-k="${k}" value="${esc(st[k])}" style="${t === 'color' ? 'height:28px;padding:2px' : ''}" aria-label="${l}">`).join('');
          const run = () => { const d = DISP[st.disp][0]; let scr;
            if (st.view === 0) scr = `<div class="ap-home">${[['📷', 'カメラ'], ['🗓', 'カレンダー'], ['🎵', 'ミュージック'], ['🗺', 'マップ'], ['✉', 'メール'], [st.ic, st.short, 1], ['⚙', '設定'], ['☁', '天気']].map(([i, n, me]) => `<div class="ap-ic${me ? ' me' : ''}"><i style="${me ? `background:${st.theme}` : ''}">${esc(i)}</i><span>${esc(n)}</span></div>`).join('')}</div>`;
            else if (st.view === 1) scr = `<div class="ap-splash" style="background:${st.bg};color:#111"><i style="background:${st.theme};color:#fff">${esc(st.ic)}</i>${esc(st.name)}</div>`;
            else scr = `${d === 'browser' || d === 'minimal-ui' ? `<div class="ap-bar" style="padding-top:20px;font-weight:500;font-family:var(--mono);font-size:9px">${d === 'minimal-ui' ? '◀ ↻ ' : '🔒 '}kakeibo.example.com</div>` : ''}<div class="ap-bar" style="background:${st.theme};color:#fff;${d === 'standalone' || d === 'fullscreen' ? 'padding-top:' + (d === 'fullscreen' ? '8px' : '20px') : ''}">${esc(st.ic)} ${esc(st.name)}</div><div style="padding:8px;display:flex;flex-direction:column;gap:6px"><div style="height:46px;border-radius:8px;background:${st.bg}"></div><div style="height:12px;border-radius:4px;background:var(--surface-2)"></div><div style="height:12px;width:70%;border-radius:4px;background:var(--surface-2)"></div></div>`;
            $(el, '.ph').innerHTML = phone(scr);
            $(el, '.js').textContent = JSON.stringify({ name:st.name, short_name:st.short, start_url:'/', display:d, theme_color:st.theme, background_color:st.bg, icons:[{ src:'/icon-192.png', sizes:'192x192', type:'image/png' }, { src:'/icon-512.png', sizes:'512x512', type:'image/png' }, { src:'/icon-maskable.png', sizes:'512x512', type:'image/png', purpose:'maskable' }] }, null, 2); };
          $$(el, '.fm input').forEach(i => i.oninput = () => { st[i.dataset.k] = i.value; run(); });
          let vw = null;
          $(el, '.sw').replaceWith(seg(DISP.map(d => d[0]), i => { st.disp = i; if (vw){ st.view = 2; vw.set(2); } }).el);
          vw = seg(['ホーム画面', '起動画面', '起動後'], i => { st.view = i; run(); }); $(el, '.vw').replaceWith(vw.el); },
        desc:'<b>manifest.json</b> は「アプリとしての名前・アイコン・色・表示のしかた」を書いた設定ファイルです。<code>short_name</code> はホーム画面の名前、<code>background_color</code> と アイコンで起動画面、<code>display: standalone</code> でアドレスバーのないアプリらしい見た目に。アイコンは 192px と 512px、角を丸められても切れない <b>maskable</b> も用意します。',
        prompt:'このNext.jsのサイトをPWAにして。app/manifest.ts で名前・色・アイコン（192・512・maskable）を設定し、iPhone 用の apple-touch-icon とステータスバーの色も設定して。アイコン画像は今のロゴから各サイズを作る手順も教えて。',
        code:'// app/manifest.ts（Next.js App Router）\nimport type { MetadataRoute } from "next";\n\nexport default function manifest(): MetadataRoute.Manifest {\n  return {\n    name: "まいにち家計簿",\n    short_name: "家計簿",\n    start_url: "/",\n    display: "standalone",\n    theme_color: "#059669",\n    background_color: "#ecfdf5",\n    icons: [\n      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },\n      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },\n      { src: "/icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },\n    ],\n  };\n}' },
      { name:'Service Worker のキャッシュ戦略', en:'Caching strategies', h:500, tags:['PWA','体験','オフライン'],
        demo:'<div class="kt"><span class="sw"></span><div class="kt-row ck" style="font-size:11.5px;gap:12px"><label><input type="checkbox" class="on" checked>オンライン</label><label><input type="checkbox" class="ca" checked>キャッシュに保存済み</label><button type="button" class="kt-btn pri go">▶ ページを開く</button></div><div class="au-log lg kt-grow" style="font:11px/1.6 var(--mono);background:var(--code-bg);border:1px solid var(--border);border-radius:8px;padding:6px 8px;overflow:auto"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let k = 0, busy = 0; const L = (c, t) => { const g = $(el, '.lg'); g.insertAdjacentHTML('beforeend', `<div style="color:${c === 'ok' ? 'var(--ok)' : c === 'bad' ? 'var(--bad)' : c === 'warn' ? 'var(--warn)' : 'var(--text)'}">${t}</div>`); g.scrollTop = 1e6; };
          $(el, '.sw').replaceWith(seg(STRAT.map(s => s[0]), i => { k = i; verdict($(el, '.res'), '', `<b>${STRAT[i][1]}</b>：向いているのは ${STRAT[i][2]}`); }).el);
          $(el, '.go').onclick = async () => { const me = ++busy, on = $(el, '.on').checked, ca = $(el, '.ca').checked; $(el, '.lg').innerHTML = ''; const net = async () => { L('', '🌐 ネットワークに取りに行く…'); await sleep(500); if (!on){ L('bad', '× 電波なし：取得失敗'); return false; } L('ok', '✓ 最新を取得（300ミリ秒）→ キャッシュも更新'); $(el, '.ca').checked = true; return true; };
            L('', `📄 ページを要求（${STRAT[k][0]}）`); await sleep(250); if (me !== busy) return; let res = '';
            if (k === 0){ if (ca){ L('ok', '⚡ キャッシュから表示（5ミリ秒）'); res = 'ok:速い。ただし更新されていても古いまま'; } else res = (await net()) ? 'ok:初回はネットワーク' : 'bad:何も表示できない'; }
            if (k === 1){ if (await net()) res = 'ok:いつも最新。電波が弱いと遅い'; else if (ca){ L('warn', '↩ 保存しておいた物を表示（オフライン）'); res = 'warn:オフラインでも前回の内容を表示'; } else res = 'bad:オフラインで何もない'; }
            if (k === 2){ if (ca){ L('ok', '⚡ まず保存した物を表示（5ミリ秒）'); await sleep(200); if (on){ L('', '🔄 裏で最新を取得して、キャッシュを更新（次回反映）'); await sleep(400); L('ok', '✓ 更新完了'); } res = 'ok:速く表示し、次に開いたときは新しい'; } else res = (await net()) ? 'ok:初回はネットワーク' : 'bad:何も表示できない'; }
            if (k === 3) res = (await net()) ? 'ok:常に最新（キャッシュしない）' : 'bad:オフラインでは使えない（決済などはそれで正しい）';
            const [c, m] = res.split(':'); verdict($(el, '.res'), c, `${m}<br><span style="color:var(--muted)">向いている：${STRAT[k][2]}</span>`); }; },
        desc:'<b>Service Worker</b> はページとネットワークの間に立つ裏方で、取りに行ったファイルを<b>キャッシュ（保存）</b>して、速く・オフラインでも表示できるようにします。何を優先するかの<b>戦略</b>をファイルの種類ごとに選びます。決済やログインのように<b>キャッシュしてはいけない物</b>もあるので注意。',
        prompt:'このPWAに Service Worker を入れて。画像・フォント・CSSは Cache First、APIの応答は Network First（オフライン時は前回の結果）、ログイン・決済のAPIはキャッシュしない。Workbox（または Serwist）を使い、新しい版が出たら「更新があります」と表示して再読み込みできるようにして。' },
      { name:'ホーム画面に追加できる条件', en:'Installability', h:460, tags:['PWA','体験','iPhone'],
        demo:'<div class="kt"><div class="cks" style="display:flex;flex-direction:column;gap:3px;font-size:11.5px"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const I = [['https', 'HTTPS で配信している（localhost は例外）', true], ['mf', 'manifest に name・icons（192と512）・start_url・display がある', true], ['sw', 'Service Worker を登録している', false], ['link', 'HTMLに <code>&lt;link rel="manifest"&gt;</code> がある', true]];
          $(el, '.cks').innerHTML = I.map(([k, l, v]) => `<label style="display:flex;gap:6px;align-items:flex-start"><input type="checkbox" data-k="${k}"${v ? ' checked' : ''}><span>${l}</span></label>`).join('');
          const run = () => { const s = {}; $$(el, '.cks input').forEach(i => s[i.dataset.k] = i.checked); const base = s.https && s.mf && s.link;
            verdict($(el, '.res'), base ? (s.sw ? 'ok' : 'warn') : 'bad', (base ? `✓ <b>Android・PC の Chrome / Edge</b>：「インストール」の案内が出せます${s.sw ? '' : '（オフライン対応や通知には Service Worker が必要）'}。` : '× このままではアプリとしてインストールできません。') + `<br>🍎 <b>iPhone（Safari）</b>：自動の案内は出ません。利用者に<b>「共有 → ホーム画面に追加」</b>を教える必要があります。ホーム画面に追加したPWAなら Web Push も受け取れます（iOS 16.4以降）。`); };
          $$(el, '.cks input').forEach(i => i.onchange = run); run(); },
        desc:'PWAをインストールできるかは、<b>HTTPS・manifest・アイコン</b>などの条件で決まります。Android や PC の Chrome / Edge ではインストールの案内（ボタン）を出せますが、<b>iPhone は自動の案内がなく</b>、利用者が自分で「ホーム画面に追加」する必要があります。iPhone 向けには、追加のしかたを画面で案内しましょう。',
        prompt:'PWAのインストール案内を作って。Android/PC では beforeinstallprompt を使って自前の「アプリとして使う」ボタンを表示し、iPhone の Safari では「共有 → ホーム画面に追加」の手順を図で表示するバナーを出して。すでにインストール済み（display-mode: standalone）なら出さないで。' },
      { name:'Web Push 通知の流れ', en:'Web Push flow', h:500, tags:['PWA','通知','体験'],
        init:(el) => seq(el, { actors:[{ label:'利用者のスマホ', icon:'📱' }, { label:'自分のサーバー', icon:'🖥' }, { label:'プッシュサービス', icon:'📮' }], steps:[
          { f:0, t:0, label:'「お知らせを受け取る」をタップ', note:'<b>利用者が押したとき</b>に許可を求める。開いた瞬間に聞くと断られやすい。' },
          { f:0, t:0, label:'ブラウザが「通知を許可しますか？」', note:'許可されると、端末ごとの<b>宛先（購読情報）</b>が作られる。' },
          { f:0, t:1, label:'購読情報を送って保存', note:'サーバーのDBに、利用者IDと一緒に保存する。' },
          { f:1, t:2, label:'通知を送る（VAPIDの鍵で署名）', note:'送る時は、Apple・Google などの<b>プッシュサービス</b>に頼む。自分の鍵（VAPID）で署名する。' },
          { f:2, t:0, label:'端末に届ける', good:true, note:'アプリ（ページ）が閉じていても届く。' },
          { f:0, t:0, label:'Service Worker が通知を表示', note:'通知をタップしたら、関係するページを開くようにする。iPhone は<b>ホーム画面に追加したPWAのみ</b>（iOS 16.4以降）。' },
        ] }),
        desc:'Web Push は、ページを閉じていても通知を届けられる仕組みです。①利用者の操作で許可をもらう → ②端末の宛先（購読情報）をサーバーに保存 → ③送るときは<b>プッシュサービス</b>経由で届ける、の流れ。送りすぎると通知をオフにされるので、<b>本当に役立つときだけ</b>送りましょう。',
        prompt:'PWAに Web Push 通知を入れて。web-push ライブラリで VAPID 鍵を作り、「予約の前日にお知らせ」ボタンで許可を求めて購読情報を Supabase に保存、サーバーから送る API と、Service Worker で通知を表示・タップで予約ページを開く処理を書いて。' },
    ], null, true),
    S('PWAの用語', [
      T('Web App Manifest', 'manifest.json', 'アプリとしての名前・アイコン・色・表示方法の設定ファイル。', null, ['基本']),
      T('Service Worker', 'Service Worker', 'ページの裏で動くプログラム。キャッシュ・オフライン・通知を担当。HTTPSが必要。'),
      T('キャッシュ', 'Cache Storage', 'ファイルを端末に保存しておく場所。古いキャッシュを消す仕組みも必要。'),
      T('オフラインページ', 'Offline fallback', '電波がないときに表示する専用ページ。真っ白な画面よりずっと親切。'),
      T('standalone 表示', 'display: standalone', 'アドレスバーのない、アプリのような見た目で開く。'),
      T('maskable アイコン', 'Maskable icon', 'Androidで丸・角丸に切り抜かれても大事な部分が切れないよう、余白を取ったアイコン。'),
      T('Web Push', 'Web Push', 'Webから送る通知。iPhoneはホーム画面に追加したPWAだけ受け取れる（iOS 16.4以降）。'),
      T('VAPID', 'VAPID keys', 'Web Push を送るときに、送り主を証明するための鍵のペア。秘密鍵はサーバーだけに。'),
      T('更新の反映', 'Service Worker update', '新しい版の Service Worker は、開いているページを全部閉じるまで有効にならない。「更新があります」ボタンで切り替える。', null, ['よくある失敗']),
      T('Workbox / Serwist', 'Workbox / Serwist', 'Service Worker のキャッシュ戦略を簡単に書けるライブラリ。Next.js なら Serwist が使われる。'),
      T('TWA', 'Trusted Web Activity', 'PWA を Android アプリとして Google Play に出す仕組み。Bubblewrap・PWABuilder で作れる。'),
      T('バックグラウンド同期', 'Background Sync', 'オフライン中の送信を保存しておき、電波が戻ったら送る仕組み（対応ブラウザは限定的）。'),
    ]),
  ]});

/* ================= 3. スマホアプリ ================= */
const TECH = [['Swift / Kotlin（ネイティブ）', [['言語', 'Swift（iPhone）・Kotlin（Android）'], ['1つのコードで', '× それぞれ作る'], ['見た目・速さ', '◎ 最も自然で速い'], ['端末の機能', '◎ 全部・最新機能もすぐ'], ['AIで作りやすさ', '○ 情報は多いが2倍の作業'], ['向いている', '高性能なアプリ・端末機能を深く使う']]], ['React Native（Expo）', [['言語', 'TypeScript（React）'], ['1つのコードで', '◎ iPhone・Android（Webも）'], ['見た目・速さ', '○ 本物の部品で描くので自然'], ['端末の機能', '○ Expo の部品でほぼ揃う'], ['AIで作りやすさ', '◎ React の知識がそのまま使える'], ['向いている', '<b>Web開発の経験がある人のスマホアプリ</b>']]], ['Flutter', [['言語', 'Dart'], ['1つのコードで', '◎ iPhone・Android・Web・PC'], ['見た目・速さ', '○ 独自に描画。デザインを揃えやすい'], ['端末の機能', '○ プラグインで対応'], ['AIで作りやすさ', '○ 情報は多い。Dart を覚える'], ['向いている', 'デザイン重視・複数OSで同じ見た目']]], ['Capacitor（Webをアプリに）', [['言語', 'HTML・CSS・JavaScript（今のWeb）'], ['1つのコードで', '◎ 今のWebサイトを流用'], ['見た目・速さ', '△ 中身はWeb。凝った動きは苦手'], ['端末の機能', '○ プラグインで'], ['AIで作りやすさ', '◎ Webのまま'], ['向いている', '今あるWebを手早くアプリにしたい']]]];

TABS.push({ id:'native', label:'スマホアプリ', icon:'📱',
  intro:'スマホアプリは、iPhone・Android 専用に作る<b>ネイティブ</b>か、1つのコードで両方を作る<b>クロスプラットフォーム</b>（React Native / Expo・Flutter）が主流。Web開発に慣れているなら <b>Expo</b> が近道です。通知の許可の聞き方・画面の切り欠き（セーフエリア）など、スマホならではの作法も押さえましょう。',
  sections:[
    C('触って理解する', [
      { name:'作り方の選び方', en:'Native vs cross-platform', h:430, tags:['判断','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="tb kt-tblwrap kt-grow"></div></div>',
        init:(el) => { $(el, '.sw').replaceWith(seg(TECH.map(t => t[0].split('（')[0]), i => { $(el, '.tb').innerHTML = `<table class="kt-tbl">${TECH[i][1].map(([k, v]) => `<tr><th style="width:30%">${k}</th><td style="white-space:normal">${v}</td></tr>`).join('')}</table>`; }, 1).el); },
        desc:'1つのコードで iPhone・Android の両方を作れる<b>クロスプラットフォーム</b>が、個人や小さなチームの定番です。React を使ったことがあれば <b>Expo（React Native）</b>、デザインを揃えたいなら <b>Flutter</b>、今のWebを手早くアプリにするなら <b>Capacitor</b>。最高の性能や最新の端末機能が必要なときだけネイティブを選びます。',
        prompt:'Expo（React Native）で、TODOアプリを作って。Expo Router で画面を分け、データは端末に保存（expo-sqlite）、iPhone と Android の両方で動くように。開発中は Expo Go で実機確認する手順も教えて。' },
      { name:'許可を求めるタイミング', en:'Permission priming', h:470, tags:['UX','体験','最重要'],
        demo:'<div class="kt"><span class="sw"></span><div class="ap-wrap ph"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.sw').replaceWith(seg(['起動直後にいきなり', '使う瞬間に理由を伝えてから'], i => {
            $(el, '.ph').innerHTML = i ? phone(`<div class="ap-bar" style="padding-top:20px">予約の確認</div><div style="padding:10px;display:flex;flex-direction:column;gap:8px;font-size:10.5px"><div style="border:1px solid var(--border);border-radius:8px;padding:8px">✓ 11/3（月）15:00<br>カット ＋ カラー</div><div style="border-radius:8px;padding:8px;background:color-mix(in srgb, var(--accent) 10%, var(--surface))">🔔 <b>前日にお知らせしますか？</b><br>うっかり忘れを防ぎます。</div><button type="button" class="ap-btn" style="background:var(--accent)">お知らせを受け取る</button><span style="text-align:center;color:var(--muted)">今はしない</span></div><div class="ap-dim"></div><div class="ap-dlg"><b>“予約アプリ”は通知を送信します。よろしいですか？</b>通知には予約の前日のお知らせが入ります。<div class="bts"><span>許可しない</span><span>許可</span></div></div>`) : phone(`<div class="ap-splash" style="background:linear-gradient(160deg, #0ea5e9, #6366f1);color:#fff"><i style="background:#fff">✂</i>予約アプリ</div><div class="ap-dim"></div><div class="ap-dlg"><b>“予約アプリ”は通知を送信します。よろしいですか？</b>通知には、テキスト・サウンド・アイコンバッジが含まれる場合があります。<div class="bts"><span>許可しない</span><span>許可</span></div></div>`);
            verdict($(el, '.res'), i ? 'ok' : 'bad', i ? '✓ 予約が終わった瞬間に、<b>何の役に立つか</b>を自分の画面で説明してから OS の確認を出す。「今はしない」も用意しておけば、OSの確認は<b>1回きりのチャンス</b>を無駄にしません。' : '❌ まだ何のアプリかも分からないうちに聞かれると、多くの人は<b>「許可しない」</b>を押します。OSの確認は基本的に<b>一度断られると、設定アプリからしか戻せません</b>。'); }).el); },
        desc:'通知・カメラ・位置情報などの許可は、<b>OS の確認画面を出せるのが基本的に1回だけ</b>。起動直後にいきなり聞くと断られやすく、取り返しがつきません。<b>その機能を使う瞬間</b>に、自分の画面で「何のために使うか」を説明してから OS の確認を出すのが定番です（プライミング）。',
        prompt:'このアプリで、通知の許可を起動直後に求めているのをやめて、予約が完了した画面で「前日にお知らせしますか？」という説明カードを出し、「受け取る」を押したときだけ OS の許可ダイアログを出すように変えて。断られた場合に設定アプリへ案内する導線も付けて。' },
      { name:'画面の切り欠き（セーフエリア）', en:'Safe area insets', h:470, tags:['レイアウト','体験'],
        demo:'<div class="kt"><label class="kt-row" style="font-size:11.5px"><input type="checkbox" class="sa">セーフエリアを考慮する（<code>env(safe-area-inset-*)</code>）</label><div class="ap-wrap ph"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const run = () => { const on = $(el, '.sa').checked; $(el, '.ph').innerHTML = phone(`<div class="ap-safe" style="left:0;right:0;top:0;height:26px"></div><div class="ap-safe" style="left:0;right:0;bottom:0;height:16px"></div><div class="ap-bar" style="background:var(--accent);color:#fff;padding-top:${on ? 26 : 6}px">☰ 家計簿</div><div style="flex:1;padding:8px;display:flex;flex-direction:column;gap:6px"><div style="height:30px;border-radius:6px;background:var(--surface-2)"></div><div style="height:30px;border-radius:6px;background:var(--surface-2)"></div></div><div style="display:flex;justify-content:space-around;padding:6px 0 ${on ? 18 : 4}px;border-top:1px solid var(--border);background:var(--surface-2);font-size:14px"><span>🏠</span><span>📊</span><span>⚙</span></div>`);
            verdict($(el, '.res'), on ? 'ok' : 'bad', on ? '✓ 上はカメラの切り欠き、下はホームバーを避けて表示。斜線の部分（セーフエリアの外）には背景色だけを伸ばします。' : '❌ 見出しが<b>カメラの切り欠きに隠れ</b>、下のボタンが<b>ホームバーと重なって</b>押しにくい。'); };
          $(el, '.sa').onchange = run; run(); },
        desc:'最近のスマホは、画面の上に<b>カメラの切り欠き</b>、下に<b>ホームバー</b>があります。そこに文字やボタンを置くと隠れたり押しにくくなるので、<b>セーフエリア</b>（安全に使える範囲）の内側に置きます。Webでは <code>viewport-fit=cover</code> と <code>env(safe-area-inset-top)</code>、Expo では <code>SafeAreaView</code> を使います。',
        prompt:'このPWAをホーム画面から開くと、ヘッダーがiPhoneの切り欠きに隠れ、下のタブバーがホームバーと重なります。viewport-fit=cover を設定し、ヘッダーとタブバーの余白を env(safe-area-inset-top / bottom) で調整して直して。',
        code:'<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n\n.header { padding-top: calc(12px + env(safe-area-inset-top)); }\n.tabbar { padding-bottom: calc(8px + env(safe-area-inset-bottom)); }' },
      { name:'pt・px・解像度の倍率', en:'Points, pixels & density', h:400, tags:['画像','体験'],
        demo:'<div class="kt"><div class="kt-row"><span class="kt-lbl">デザイン上の大きさ</span><input type="number" class="kt-in sz" value="44" style="width:90px" aria-label="大きさ"><span class="kt-lbl">pt / dp</span></div><div class="ap-bars br kt-grow" style="align-content:center"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const run = () => { const v = Math.max(1, +$(el, '.sz').value || 1); $(el, '.br').innerHTML = bars([['@1x（昔の画面）', v, v * 3], ['@2x（多くのiPhone・Android）', v * 2, v * 3], ['@3x（大きめのiPhone）', v * 3, v * 3, 'var(--ok)']], 'px');
            verdict($(el, '.res'), v < 44 ? 'warn' : 'ok', `${v}pt のボタンは、画面の細かさによって <b>${v}・${v * 2}・${v * 3}px</b> で描かれます。画像は<b>一番細かい3倍</b>で用意するか、SVG にするとぼやけません。` + (v < 44 ? '<br>⚠ 指で押すボタンは <b>44pt（Androidは48dp）以上</b>が目安です。' : '')); };
          $(el, '.sz').oninput = run; run(); },
        desc:'スマホのデザインは <b>pt（iPhone）・dp（Android）</b>という「見た目の大きさ」で考え、実際の画素（px）は画面の細かさ（2倍・3倍）で変わります。画像を1倍で用意するとぼやけるので、<b>3倍の大きさ</b>か <b>SVG</b> で。押せる部品は<b>44pt以上</b>が目安です。',
        prompt:'アプリのアイコンと画面内の画像を、iPhone・Android 両方でぼやけないように用意したい。必要なサイズの一覧（アプリアイコン・スプラッシュ・画面内画像の @2x/@3x）と、Expo の app.json での設定方法を教えて。' },
    ], null, true),
    { title:'アプリの作り方の比較', note:'Webの経験があるなら <b>Expo</b> が最短ルート。Expo は <b>EAS</b>（クラウドでのビルド・提出・更新）まで揃っていて、Mac がなくても iPhone アプリを作れます。',
      table:{ head:['方法', '言語', '1つのコードで', '向いている'], rows:TECH.map(([n, r]) => [n, r[0][1], r[1][1], r[5][1]]) } },
    S('スマホアプリの用語', [
      T('Expo', 'Expo', 'React Native でのアプリ作りを簡単にする道具一式。Expo Go アプリで実機確認、EAS でビルド・提出。', null, ['定番']),
      T('EAS Build / Submit / Update', 'Expo Application Services', 'クラウドでアプリを作り（Build）、ストアに提出し（Submit）、小さな修正を配信（Update）するサービス。'),
      T('Xcode / Android Studio', 'IDEs', 'Apple・Google 公式の開発ツール。iPhone アプリを手元でビルドするには Mac と Xcode が必要。'),
      T('シミュレーター・エミュレーター', 'Simulator / Emulator', 'パソコンの中で動く仮想のスマホ。最後は必ず実機でも確認する。'),
      T('バンドルID・パッケージ名', 'Bundle ID', 'アプリを区別する一意の名前（com.example.kakeibo）。後から変えられないので慎重に。', null, ['注意']),
      T('プッシュ通知（APNs・FCM）', 'APNs / FCM', 'iPhone は Apple の APNs、Android は Google の FCM を通して通知を届ける。Expo の通知サービスでまとめて扱える。'),
      T('ディープリンク・ユニバーサルリンク', 'Deep links / Universal Links', 'URL からアプリの特定の画面を開く。アプリがなければ Web で開く設定に。'),
      T('OTAアップデート', 'Over-the-air update', '審査なしで JavaScript 部分の小さな修正を配信する（EAS Update）。<b>機能を大きく変えるのはNG</b>（審査のルール）。', null, ['注意']),
      T('アプリ内課金', 'In-app purchase', 'アプリ内でデジタルの物（機能・コイン）を売る仕組み。ストアの手数料がかかる。（「ストア公開」タブ・決済辞典）'),
      T('セーフエリア', 'Safe area', '切り欠きやホームバーを避けた、安全に使える範囲。'),
      T('プライミング', 'Permission priming', 'OS の許可ダイアログの前に、自分の画面で理由を説明すること。'),
      T('オフライン対応', 'Offline-first', '端末にデータを保存して、電波がなくても使えるようにし、つながったら同期する設計。'),
    ]),
  ]});

/* ================= 4. ストア公開 ================= */
const APPLE_STEPS = ['<b>開発者登録</b><br>Apple Developer Program（年額99ドル）。個人か法人か。法人は D-U-N-S 番号が必要。', '<b>アプリの情報を用意</b><br>名前・説明・キーワード・カテゴリ・年齢区分・<b>プライバシーポリシーのURL</b>・サポートURL。', '<b>スクリーンショット</b><br>決められたサイズで数枚。最初の2〜3枚が勝負（ダウンロードされるかが決まる）。', '<b>プライバシーの申告</b><br>集めるデータ・使い道（プライバシー「栄養ラベル」）。使っているSDKの分も含める。', '<b>TestFlight でテスト配信</b><br>知り合いに実機で試してもらう。外部テストには簡単な審査あり。', '<b>審査に提出</b><br>多くは1〜2日程度。ログインが必要ならテスト用アカウントを渡す。', '<b>公開</b><br>手動・自動・段階的に公開を選べる。公開後もレビューとクラッシュを見守る。'];
const REJECT = [['テスト用のログイン情報を渡していない', 'ログインが必要なのに審査用アカウントがない'], ['クラッシュする・未完成の画面がある', '「準備中」「Lorem ipsum」のまま'], ['中身がほぼWebサイトのまま', 'アプリならではの価値がない（WebViewだけ）'], ['アカウント削除の機能がない', 'アカウントを作れるなら、アプリ内で削除もできるように'], ['デジタル商品を独自の決済で売っている', '決まったルール以外の方法で支払いを誘導'], ['プライバシーの申告と実態が違う', '使っているSDKが集めるデータの申告漏れ'], ['説明・スクリーンショットが実際と違う', '入っていない機能を載せている'], ['許可を求める理由の説明がない', 'カメラ・位置情報の使い道の文言（Info.plist）が空']];
const ROUTES = [['App Store の決済（アプリ内課金）', 26, 15, 'Appleの決済を使う標準の方法。<b>条件（小規模事業者など）で低い率</b>が適用される場合あり。'], ['代替のアプリ内決済', 21, 10, 'アプリ内で他社の決済を使う。決済会社の手数料が別にかかる。'], ['Webの決済ページへリンク', 15, 10, 'アプリから自社サイトに誘導して購入。<b>Stripeなどの手数料（例3.6%）も別にかかる</b>。'], ['代替アプリストアで配布', 5, 5, 'App Store 以外のストアから配布（日本では2025年12月から）。']];

TABS.push({ id:'store', label:'ストア公開', icon:'🏪',
  intro:'スマホアプリは <b>App Store（Apple）</b>と <b>Google Play</b> に、<b>審査</b>を通して公開します。開発者登録・スクリーンショット・プライバシーの申告・テスト配信と、準備することがたくさんあります。日本では2025年12月に<b>スマホ新法</b>が全面施行され、アプリ内の決済のルールと手数料も変わりました。',
  sections:[
    C('触って理解する', [
      { name:'App Store に出すまで', en:'App Store release steps', h:440, tags:['流れ','iPhone'],
        init:(el) => stepper(el, APPLE_STEPS, { title:'App Store 公開の流れ（Google Play もほぼ同じ）' }),
        desc:'ストアに出すには、<b>開発者登録 → アプリの情報 → スクリーンショット → プライバシーの申告 → テスト配信 → 審査 → 公開</b>の順に進みます。一番時間がかかるのは情報と画像の準備。Google Play は登録料が1回25ドルで、<b>個人の新しいアカウントは一定人数・一定期間のクローズドテスト</b>が必要です（条件は公式で確認）。',
        prompt:'Expo で作ったアプリを App Store と Google Play に初めて出したい。EAS Build と EAS Submit を使った手順、必要な画像サイズ、プライバシーポリシーに書くこと、審査で落ちないためのチェックリストを順番に教えて。' },
      { name:'審査で落ちやすいポイント', en:'Common rejection reasons', h:470, tags:['審査','体験','チェック'],
        demo:'<div class="kt"><span class="kt-lbl">対策済みの項目にチェック</span><div class="cks kt-grow" style="display:flex;flex-direction:column;gap:3px;font-size:11.5px;overflow:auto"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.cks').innerHTML = REJECT.map(([a, b], i) => `<label style="display:flex;gap:6px;align-items:flex-start"><input type="checkbox" data-i="${i}"><span><b>${a}</b><br><span style="color:var(--muted)">${b}</span></span></label>`).join('');
          const run = () => { const n = $$(el, '.cks input:checked').length, left = REJECT.length - n; verdict($(el, '.res'), left === 0 ? 'ok' : left <= 2 ? 'warn' : 'bad', left === 0 ? '✓ よくある落ちる理由はすべて対策済み。提出しましょう。' : `あと <b>${left}項目</b>。落ちても理由が書かれたメッセージが届くので、直して再提出できます（ただし数日ずつ遅れる）。`); };
          $$(el, '.cks input').forEach(i => i.onchange = run); run(); },
        desc:'審査で多い不合格の理由は、<b>ログインできない・未完成・中身がWebサイトのまま・アカウント削除がない・決済のルール違反・プライバシーの申告漏れ</b>など。どれも事前に確認できることばかりです。落ちても理由が届くので、直して出し直せます。',
        prompt:'このアプリを App Store に出す前に、審査ガイドラインに照らしてリジェクトされそうな点をチェックして。特にログイン・アカウント削除・アプリ内課金・プライバシーの申告・許可の説明文（Info.plist）を確認し、直すべき点を一覧にして。' },
      { name:'デジタル商品の手数料（日本・スマホ新法後）', en:'App Store commission in Japan', h:470, tags:['手数料','体験','2025〜'],
        demo:'<div class="kt"><div class="kt-row"><span class="kt-lbl">価格</span><input type="number" class="kt-in pr" value="1000" style="width:100px" aria-label="価格"><span class="kt-lbl">円</span><label style="font-size:11.5px"><input type="checkbox" class="cd">条件を満たして低い率</label></div><div class="ap-bars br kt-grow" style="align-content:start;overflow:auto;grid-template-columns:minmax(0, 46%) 1fr auto"></div><div class="kt-verdict res" style="max-height:40%;overflow:auto"></div><div class="kt-note">※日本の App Store の主な料率（報道ベース・目安）。<b>適用条件・最新の料率は Apple の公式で必ず確認</b>してください。Webの決済手数料は Stripe の国内カード 3.6% で計算。</div></div>',
        init:(el) => { const run = () => { const p = Math.max(0, +$(el, '.pr').value || 0), low = $(el, '.cd').checked;
            const rows = ROUTES.map(([n, std, lo]) => { const pct = low ? lo : std, web = n.startsWith('Web') ? 3.6 : 0, take = Math.round(p * (1 - (pct + web) / 100)); return [n, take, p, take / p > .8 ? 'var(--ok)' : '']; });
            $(el, '.br').innerHTML = bars(rows, '円');
            verdict($(el, '.res'), '', `${p.toLocaleString()}円の売上で、手元に残る金額（${low ? '条件を満たした低い率' : '標準の率'}）。<br>${ROUTES.map(([n, s, l, d]) => `・<b>${n}</b>：${low ? l : s}%${n.startsWith('Web') ? '＋決済手数料' : ''}。${d}`).join('<br>')}`); };
          $(el, '.pr').oninput = run; $(el, '.cd').onchange = run; run(); },
        desc:'アプリの中で<b>デジタルの物（機能・コイン・サブスク）</b>を売ると、ストアに手数料を払います。日本では2025年12月の<b>スマホ新法</b>で、Apple の決済以外の方法（代替決済・Webへのリンク・代替ストア）も選べるようになり、料率が分かれました。<b>物の販売（ECの商品・飲食）</b>はこの手数料の対象外で、普通の決済を使います。',
        prompt:'日本向けのiPhoneアプリでサブスク（月額500円）を売りたい。スマホ新法の施行後に選べる方法（App Store の決済・代替決済・Webの購入ページへのリンク）それぞれの手数料と手取り、実装の手間、利用者の使いやすさを最新の公式情報で比較して。' },
    ], null, true),
    { title:'App Store と Google Play の違い', note:'料金・ルールは変わることがあります。<b>最新は各公式（App Store Connect・Play Console のヘルプ）</b>で確認しましょう。',
      table:{ head:['', 'App Store（Apple）', 'Google Play'], rows:[['開発者登録', '年額99ドル', '1回だけ25ドル'], ['必要なもの', 'iPhone アプリのビルドに Mac（EAS なら不要）', 'Windows・Mac どちらでも'], ['テスト配信', 'TestFlight', '内部テスト・クローズドテスト（個人の新規アカウントは条件あり）'], ['審査', '人による審査。多くは1〜2日', '自動＋人。数時間〜数日'], ['手数料（デジタル商品）', '日本は経路により5〜26%（条件で低い率あり）', '15%または30%が基本（条件・地域で異なる）'], ['プライバシー', 'プライバシーラベル・トラッキングの許可（ATT）', 'データセーフティ セクション'], ['公開の方法', '手動・自動・段階的', '段階的公開（％を指定）']] } },
    S('ストア公開の用語', [
      T('App Store Connect', 'App Store Connect', 'Apple のアプリ管理画面。情報の登録・審査の提出・売上の確認。'),
      T('Google Play Console', 'Play Console', 'Google のアプリ管理画面。'),
      T('TestFlight', 'TestFlight', 'iPhone アプリを公開前にテスターへ配る Apple の仕組み。'),
      T('審査ガイドライン', 'App Review Guidelines', 'Apple のアプリ審査のルール。提出前に一度は目を通す。'),
      T('リジェクト', 'Rejection', '審査に落ちること。理由が届くので、直して再提出する。'),
      T('スマホ新法', 'Mobile Software Competition Act', '日本の「スマートフォンソフトウェア競争促進法」。2025年12月18日に全面施行。代替アプリストア・代替決済などが認められた。', null, ['2025〜']),
      T('アプリ内課金', 'In-app purchase', 'アプリ内でデジタル商品を売ること。物の販売・サービスの予約は対象外。'),
      T('プライバシーラベル', 'Privacy Nutrition Label', 'アプリが集めるデータを申告する App Store の欄。SDK が集める分も含める。'),
      T('ATT', 'App Tracking Transparency', '他社のアプリ・サイトをまたいで追跡するときに、利用者の許可を求める iPhone のルール。'),
      T('アカウント削除', 'Account deletion', 'アプリでアカウントを作れるなら、アプリ内で削除もできる必要がある（App Store）。', null, ['よくある失敗']),
      T('ASO', 'App Store Optimization', 'ストアの検索で見つけてもらう工夫。名前・サブタイトル・キーワード・スクリーンショット・評価。'),
      T('段階的公開', 'Phased release', '新しい版を一部の利用者から少しずつ配る。問題があれば止められる。（「配布と更新」タブ）'),
    ]),
  ]});
})();
