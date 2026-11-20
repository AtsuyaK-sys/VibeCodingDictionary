/* 無料API辞典 — 追加分：お金・経済のAPI、APIの動作点検（死活確認） */
(function(){
const $ = (el, s) => el.querySelector(s), $$ = (el, s) => [...el.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const T = (name, en, desc, prompt, tags) => ({ name, en, desc, prompt, tags });

/* ---- お金・経済の追加 ---- */
const money = TABS.find(t => t.id === 'money');
if (money) money.sections.push({ title:'経済の統計・推移', layout:'cards lg', items:[
  API({ name:'World Bank（世界銀行）オープンデータ', host:'api.worldbank.org', free:'無料・キー不要', cors:true, tags:['国の比較','統計'], url:'https://datahelpdesk.worldbank.org/knowledgebase/topics/125589', ep:'https://api.worldbank.org/v2/country/JP/indicator/NY.GDP.MKTP.CD?format=json&per_page=5',
    desc:'世界の国ごとの GDP・人口・物価・平均寿命など、数千の指標を年ごとに取れる。<code>country/JP</code> を <code>country/JP;US;CN</code> にすると国の比較も。<b>キー不要・CORS対応</b>。データは1年単位で、最新の年は空のこともあります。', prompt:'World Bank の API で、日本・アメリカ・ドイツの過去20年の GDP を取得して、折れ線グラフで比べるページを作って。値が空の年は線をつながないで。' }),
  API({ name:'Frankfurter（為替の推移）', host:'api.frankfurter.dev', free:'無料・キー不要', cors:true, tags:['時系列'], url:'https://frankfurter.dev/', ep:'https://api.frankfurter.dev/v1/2026-01-01..2026-01-31?base=USD&symbols=JPY',
    desc:'URL に <code>開始日..終了日</code> を入れると、期間の毎営業日のレートが取れる。グラフにすると円高・円安の流れが一目で分かります。', prompt:'Frankfurter API で、ドル円の過去1年の推移を取得して、月ごとの平均を棒グラフに、毎日の値を折れ線グラフにして。' }),
] });
if (money) money.sections.push({ title:'登録して使う日本の経済データ', layout:'rows', items:[
  T('EDINET API', 'disclosure2.edinet-fsa.go.jp', '金融庁の EDINET で公開されている、上場企業の有価証券報告書などの書類を取得できる（API キーの取得が必要・無料）。決算データの分析練習に。', '金融庁の EDINET API で、指定した会社の最新の有価証券報告書を探して、売上高と営業利益を取り出す手順を教えて。API キーはサーバー側の環境変数に置く前提で。', ['日本','決算']),
  T('FRED（米国の経済データ）', 'fred.stlouisfed.org', '米国セントルイス連銀の経済データベース。金利・失業率・物価など数十万の時系列（無料の API キーが必要）。', null, ['金利','時系列']),
] });

/* ---- APIの動作点検 ---- */
const CHECK = [
  ['天気', 'Open-Meteo 天気予報', 'https://api.open-meteo.com/v1/forecast?latitude=35.68&longitude=139.76&current=temperature_2m'],
  ['天気', '気象庁の予報 JSON', 'https://www.jma.go.jp/bosai/forecast/data/forecast/130000.json'],
  ['防災', 'P2P地震情報', 'https://api.p2pquake.net/v2/history?codes=551&limit=1'],
  ['宇宙', 'ISS の現在位置', 'https://api.wheretheiss.at/v1/satellites/25544'],
  ['地図', 'zipcloud（郵便番号）', 'https://zipcloud.ibsnet.co.jp/api/search?zipcode=1000001'],
  ['地図', '国土地理院 住所検索', 'https://msearch.gsi.go.jp/address-search/AddressSearch?q=%E6%9D%B1%E4%BA%AC%E9%83%BD'],
  ['日本', 'Nager.Date（祝日）', 'https://date.nager.at/api/v3/PublicHolidays/2026/JP'],
  ['日本', '国会会議録検索', 'https://kokkai.ndl.go.jp/api/speech?any=AI&maximumRecords=1&recordPacking=json'],
  ['知識', 'Wikipedia 検索', 'https://ja.wikipedia.org/w/api.php?action=query&list=search&srsearch=AI&format=json&origin=*&srlimit=1'],
  ['知識', 'openBD（書誌）', 'https://api.openbd.jp/v1/get?isbn=9784101010014'],
  ['知識', 'Google Books', 'https://www.googleapis.com/books/v1/volumes?q=isbn:9784101010014'],
  ['素材', 'Openverse', 'https://api.openverse.org/v1/images/?q=cat&page_size=1'],
  ['素材', 'シカゴ美術館', 'https://api.artic.edu/api/v1/artworks?limit=1&fields=id'],
  ['趣味', 'Jikan（アニメ）', 'https://api.jikan.moe/v4/anime?q=frieren&limit=1'],
  ['趣味', 'iTunes Search', 'https://itunes.apple.com/search?term=YOASOBI&country=jp&entity=song&limit=1'],
  ['趣味', 'TheSportsDB', 'https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=Arsenal'],
  ['お金', 'Frankfurter（為替）', 'https://api.frankfurter.dev/v1/latest?base=USD&symbols=JPY'],
  ['お金', 'ExchangeRate-API（オープン版）', 'https://open.er-api.com/v6/latest/USD'],
  ['お金', 'CoinGecko', 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=jpy'],
  ['お金', 'World Bank', 'https://api.worldbank.org/v2/country/JP/indicator/NY.GDP.MKTP.CD?format=json&per_page=1'],
  ['開発', 'JSONPlaceholder', 'https://jsonplaceholder.typicode.com/todos?_limit=1'],
  ['開発', 'DummyJSON', 'https://dummyjson.com/products?limit=1&select=title'],
  ['開発', 'httpbin', 'https://httpbin.org/get?hello=world'],
  ['開発', 'Hacker News', 'https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty&limitToFirst=1&orderBy=%22%24key%22'],
];
const why = (s) => s === 'OK' ? '' : s === 'TIMEOUT' ? '応答が遅い・止まっている可能性' : s === 'CORS' ? 'ブラウザから直接は呼べない（CORS）か、ネットワークで遮られている' : s === '429' ? '回数制限に達した（キーなしの共有枠など）' : /^HTTP/.test(s) ? 'サーバーがエラーを返した（仕様変更・終了の可能性も）' : '';
async function ping(u){ const c = new AbortController(), t = setTimeout(() => c.abort(), 10000), t0 = performance.now();
  try{ const r = await fetch(u, { signal:c.signal, cache:'no-store' }); return { s:r.ok ? 'OK' : r.status === 429 ? '429' : 'HTTP ' + r.status, ms:performance.now() - t0 }; }
  catch(e){ if (e.name === 'AbortError') return { s:'TIMEOUT', ms:10000 }; try{ await fetch(u, { mode:'no-cors', cache:'no-store' }); return { s:'CORS', ms:performance.now() - t0 }; }catch(e2){ return { s:'NETWORK', ms:performance.now() - t0 }; } }
  finally{ clearTimeout(t); } }
function checker(el){ const tb = $(el, 'tbody'), sum = $(el, '.fs-sum'), btn = $(el, '.go');
  tb.innerHTML = CHECK.map(([c, n]) => `<tr><td>${c}</td><td>${n}</td><td class="st">—</td><td class="ms">—</td></tr>`).join('');
  btn.onclick = async () => { btn.disabled = true; sum.textContent = '点検中…（最大10秒）'; const rows = $$(tb, 'tr'); rows.forEach(r => { $(r, '.st').textContent = '…'; $(r, '.st').className = 'st'; });
    const res = await Promise.all(CHECK.map(async ([, , u], i) => { const r = await ping(u); const row = rows[i]; $(row, '.st').textContent = r.s; $(row, '.st').className = 'st ' + (r.s === 'OK' ? 'ok' : r.s === 'TIMEOUT' || r.s === '429' ? 'warn' : 'bad'); $(row, '.st').title = why(r.s); $(row, '.ms').textContent = Math.round(r.ms) + 'ms'; return r; }));
    const ok = res.filter(r => r.s === 'OK').length; sum.innerHTML = `<b>${ok} / ${res.length}</b> が応答しました（${new Date().toLocaleString('ja-JP')}）。${ok < res.length ? '応答しなかったものは、マウスを乗せると考えられる理由が出ます。時間をおいてもう一度試すと変わることがあります。' : ''}`; btn.disabled = false; };
}

TABS.push({ id:'status', label:'APIの点検', icon:'🩺', intro:'無料のAPIは、<b>ある日突然、止まる・仕様が変わる・有料になる</b>ことがあります（たとえば LINE Notify は2025年3月末で終了しました）。このタブでは、この辞典で紹介しているキー不要のAPIが<b>いま応答するか</b>をその場で確かめられます。自分のアプリでも、止まったときに困らない作り方をしておきましょう。', sections:[
  { title:'その場で点検する', items:[
    { name:'キー不要APIの死活確認', en:'Live status check', h:520, wide:true, tags:['体験','定期点検'], demo:'<div class="fs"><div class="fs-row"><button type="button" class="go">▶ 点検する</button><span class="fs-sum">ボタンを押すと、下の24個のAPIに実際にアクセスします。</span></div><div class="fs-tbl"><table><thead><tr><th>分野</th><th>API</th><th>結果</th><th>時間</th></tr></thead><tbody></tbody></table></div></div>', init:(el) => checker(el),
      desc:'結果は、<b>あなたのブラウザとネットワークから見た</b>今の状態です。会社や学校のネットワーク、広告ブロッカー、アクセスの多い時間帯によって変わります。「CORS」は、サーバーは動いているがブラウザから直接は使えない状態で、自分のサーバー経由（プロキシ）で呼ぶ必要があります。',
      prompt:'私のアプリで使っている外部API（【一覧】）が、毎日動いているかを確かめる仕組みを作りたい。GitHub Actions で1日1回アクセスし、失敗したら Discord に通知するワークフローを書いて。' },
  ] },
  { title:'止まっても困らない作り方', layout:'rows', items:[
    T('タイムアウトを付ける', 'Timeout', '応答がないまま待ち続けないよう、数秒で打ち切る。<code>AbortController</code> を使います。', 'この fetch に5秒のタイムアウトを付けて、時間切れのときは「時間をおいて試してください」と表示して。', ['最重要']),
    T('失敗したときの表示を決める', 'Graceful failure', 'API が止まっても、画面全体が真っ白にならないように、その部分だけ「今は表示できません」と出す。'),
    T('前回の結果を保存しておく', 'Cache the last result', '天気や為替など、少し古くても役立つデータは、前回の結果を localStorage に残し、失敗したらそれを「〇時点」として表示する。'),
    T('代わりのAPIを用意する', 'Fallback provider', '為替なら Frankfurter が駄目なら別の API、のように、同じ種類のデータを出す別のサービスに切り替えられるようにしておく。'),
    T('回数制限を守る', 'Respect rate limits', '429（回数制限）が返ったら、すぐにやり直さず、少し待ってから。結果をキャッシュして、呼ぶ回数そのものを減らす。'),
    T('規約とお知らせを見る', 'Watch announcements', 'サービス終了や仕様変更は、公式ブログ・開発者向けのお知らせ・GitHub で事前に告知されることが多い。使っているAPIの告知先をメモしておく。'),
    T('定期的に点検する', 'Scheduled checks', 'GitHub Actions のスケジュール実行や、稼働監視サービスで、毎日アクセスして結果を通知する。この辞典も定期的に点検します。'),
  ] },
] });
})();
