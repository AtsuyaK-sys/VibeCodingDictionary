/* 技術スタック・ライブラリ辞典 — 追加分：質問で選ぶ構成チャートと、料金の目安 */
(function(){
const $ = (el, s) => el.querySelector(s), $$ = (el, s) => [...el.querySelectorAll(s)];
const R = (nm, stack, host, cost, next) => ({ r:1, nm, stack, host, cost, next });
const NODES = {
  root:{ q:'何を作りますか？', opts:[['画面だけで動く小さなツール・ゲーム', 'tool'], ['お店や自分の紹介サイト・ブログ', 'site'], ['ログインやデータの保存があるWebアプリ', 'app'], ['スマホのアプリ', 'mobile'], ['AIを使う機能', 'ai'], ['データの集計・分析・自動化', 'data']] },
  tool:R('1ファイルのWebページ', 'HTML ＋ CSS ＋ JavaScript（ライブラリなし、または CDN で少しだけ）', 'GitHub Pages・Netlify Drop', '無料', 'サーバーもビルドもいらないので、いちばん失敗しにくい。データは localStorage に保存できます。'),
  site:{ q:'どのくらい更新しますか？', opts:[['ほとんど更新しない', 'site1'], ['自分で記事をよく書く', 'site2'], ['エンジニアでない人が更新する', 'site3']] },
  site1:R('静的サイト', 'HTML ＋ Tailwind CSS、または Astro', 'Netlify・Cloudflare Pages・GitHub Pages', '無料（独自ドメインは年1,000円〜数千円程度）', '表示が速く、SEO にも強い。お問い合わせフォームは Formspree などの外部サービスで。'),
  site2:R('記事を Markdown で書くサイト', 'Astro（Markdown で記事を書く）', 'Netlify・Cloudflare Pages・Vercel', '無料から', '記事はファイルで管理し、GitHub に push すると公開される流れが作れます。'),
  site3:R('管理画面のある CMS', 'microCMS などのヘッドレスCMS ＋ Astro / Next.js、または WordPress', 'Vercel・Netlify（WordPress はレンタルサーバー）', 'CMS の無料枠から。WordPress はサーバー代（月数百円〜）', '更新する人が触る画面を先に決めるのが大事。'),
  app:{ q:'どう作りたいですか？', opts:[['いちばん定番の組み合わせで、早く形にしたい', 'app1'], ['Python で作りたい', 'app2'], ['まずはAIのアプリ生成サービスで試したい', 'app3']] },
  app1:R('定番の Web アプリ構成', 'Next.js ＋ Supabase（DB・ログイン）＋ Tailwind CSS ＋ shadcn/ui', 'Vercel（商用なら有料プランが必要）', '無料で始められる。商用・利用者が増えたら月数千円〜', 'AIの知識がいちばん豊富な組み合わせの1つ。データの見られる範囲は RLS で必ず制限します（<a href="security.html">セキュリティ辞典</a>）。'),
  app2:R('Python の Web アプリ', '画面も Python で作るなら Streamlit、API を作るなら FastAPI', 'Streamlit Community Cloud・Render', '無料から', 'データ分析の結果を見せるアプリなら Streamlit がいちばん早い。'),
  app3:R('アプリ生成サービスで試作', 'v0・Bolt.new・Lovable などで作り、あとでコードを書き出す', '各サービスの公開機能、または Vercel', '無料枠あり。続けて使うなら月額課金', '試作には最速。本格的に育てるなら、GitHub にコードを移して自分で管理できるようにします（<a href="ai-tools.html#builder">AIツール辞典</a>）。'),
  mobile:{ q:'どんなアプリですか？', opts:[['Web の知識で、iPhone と Android の両方に', 'mob1'], ['ホーム画面に置ければ十分', 'mob2'], ['iPhone だけ、本格的に', 'mob3']] },
  mob1:R('React Native（Expo）', 'Expo ＋ TypeScript', 'App Store・Google Play（EAS で書き出し）', 'ストアの登録料（Apple は年額、Google は初回のみ）', 'ストアの審査があるので、公開まで日数に余裕を（<a href="app-distribution.html">アプリ配布辞典</a>）。'),
  mob2:R('PWA', 'ふつうの Web アプリ ＋ マニフェスト ＋ Service Worker', 'Web のホスティング', '無料から', 'ストアの審査なしで、すぐ配れて、すぐ更新できる。プッシュ通知などは端末によって制限あり。'),
  mob3:R('iPhone 専用アプリ', 'SwiftUI（Xcode が必要なので Mac が必須）', 'App Store', 'Apple Developer Program の年会費', 'iPhone ならではの機能をいちばん自由に使える。'),
  ai:{ q:'AIで何をしますか？', opts:[['チャットのような画面を作る', 'ai1'], ['社内の資料をもとに答えさせる', 'ai2'], ['まずは試すだけ', 'ai3']] },
  ai1:R('AIチャットの構成', 'Next.js ＋ Vercel AI SDK ＋ 各社の AI API（キーはサーバー側に置く）', 'Vercel', 'AI API は使った分だけの従量課金', '使用量の上限と、1人あたりの回数制限を必ず設定します（<a href="ai-integration.html">AI組み込み辞典</a>）。'),
  ai2:R('資料検索つきの AI（RAG）', 'Next.js ＋ Supabase（pgvector でベクトル検索）＋ AI API', 'Vercel ＋ Supabase', 'AI API とデータベースの利用量しだい', '資料の権限（誰がどの資料を見てよいか）も設計に入れます。'),
  ai3:R('ノーコードで試す', 'Google AI Studio・各社のチャット画面・Streamlit で小さく試す', '—', '無料枠で十分なことが多い', 'まず何ができるかを確かめてから、作り込むかを決めます。'),
  data:{ q:'どんな作業ですか？', opts:[['スプレッドシートの作業を自動化したい', 'd1'], ['本格的に分析したい', 'd2'], ['決まった時間に自動で動かしたい', 'd3']] },
  d1:R('Google Apps Script', 'Google スプレッドシート ＋ Apps Script', 'Google（サーバー不要）', '無料（実行時間などの上限あり）', '表の処理・メール送信・定期実行まで、スプレッドシートの中で完結します（<a href="automation.html">自動化辞典</a>）。'),
  d2:R('Python で分析', 'Python ＋ pandas ＋ Jupyter（または Google Colab）＋ グラフは matplotlib / Plotly', '自分のパソコン、または Google Colab', '無料から', '分析の考え方は <a href="data-analysis.html">データ分析・統計辞典</a> へ。'),
  d3:R('定期実行', 'GitHub Actions のスケジュール、または Apps Script のトリガー', 'GitHub / Google', '無料枠あり', '時刻はタイムゾーン（UTC と日本時間）に注意します。'),
};
function chart(el){ const hist = [];
  const go = (id, lbl) => { if (lbl) hist.push([id, lbl]); const n = NODES[id], body = $(el, '.tc-body');
    $(el, '.tc-path').innerHTML = hist.length ? hist.map(h => `<span>${h[1]}</span>`).join('') : '<span>スタート</span>';
    body.innerHTML = n.r ? `<div class="tc-res"><b>${n.nm}</b><dl><dt>構成</dt><dd>${n.stack}</dd><dt>公開先</dt><dd>${n.host}</dd><dt>費用の目安</dt><dd>${n.cost}</dd></dl><p>${n.next}</p><button type="button" class="tc-cp">この構成で AI に頼む指示をコピー</button></div>`
      : `<div class="tc-q">${n.q}</div><div class="tc-opts">${n.opts.map((o, i) => `<button type="button" data-i="${i}">${o[0]}</button>`).join('')}</div>`;
    if (n.r) $(body, '.tc-cp').onclick = () => VD.copyText(`【作りたいもの】を作りたい。構成は「${n.stack.replace(/<[^>]+>/g, '')}」、公開先は「${n.host.replace(/<[^>]+>/g, '')}」にして。まずフォルダ構成と手順を計画として出して、私の確認を待って。`);
    else $$(body, '.tc-opts button').forEach(b => b.onclick = () => { const o = n.opts[+b.dataset.i]; go(o[1], o[0].slice(0, 14)); });
    $(el, '.bk').disabled = !hist.length; };
  $(el, '.bk').onclick = () => { hist.pop(); go(hist.length ? hist[hist.length - 1][0] : 'root'); };
  $(el, '.rs').onclick = () => { hist.length = 0; go('root'); };
  go('root'); }

const combo = TABS.find(t => t.id === 'combo');
if (combo){
  combo.sections.unshift({ title:'質問に答えて選ぶ', items:[
    { name:'作りたいもの → おすすめ構成', en:'Stack chooser', h:420, wide:true, tags:['体験','最重要'], demo:'<div class="tc"><div class="tc-path"></div><div class="tc-body"></div><div class="tc-nav"><button type="button" class="bk">◀ 1つ戻る</button><button type="button" class="rs">最初から</button></div></div>', init:(el) => chart(el),
      desc:'2〜3問で、定番の組み合わせにたどり着きます。<b>答え方を変えれば別の道</b>も見られます。ここで出る構成は「AIの知識が豊富で、つまずいたときに情報が見つかりやすい」ものを優先しています。',
      prompt:'私が作りたいのは【作りたいもの】です。条件は【予算・自分の経験・公開したい時期・使う人数】。おすすめの技術の組み合わせを2案出して、それぞれの良い所・注意点・費用の目安を表で比べて。' },
  ] });
  combo.sections.push({ title:'料金の目安（2026年11月時点の一般的な形）', table:{ head:['かかるもの', '無料で始められる範囲', 'お金がかかり始めるとき'], rows:[
    ['静的サイトのホスティング', '多くのサービスで無料枠あり', 'アクセスが非常に多い、チームで使う、商用で使う（Vercel の無料プランは個人・非商用向け）'],
    ['データベース・ログイン（BaaS）', '無料枠あり（しばらく使わないと止まる・容量や人数の上限がある場合も）', '利用者・データ量が増えたとき、止まらない運用が必要なとき'],
    ['独自ドメイン', '—', '取得と毎年の更新（.com などで年1,000円〜数千円程度。初年度だけ安い場合も）'],
    ['AI の API', '無料枠や試用クレジットがある場合も', '使った分だけの従量課金。利用者が増えると急に増えるので上限の設定を'],
    ['地図・メール送信・画像の保存', '多くは月ごとの無料枠あり', '無料枠を超えたとき。超えたら止めるか課金するかを設定'],
    ['アプリのストア公開', 'Web・PWA なら不要', 'Apple は年会費、Google Play は初回の登録料'],
  ] }, note:'料金や無料枠は頻繁に変わります。必ず各サービスの公式の料金ページで確認し、使用量の上限・通知を設定してから公開してください。' });
}
})();
