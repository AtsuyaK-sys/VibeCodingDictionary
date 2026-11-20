/* 公開・品質チェック辞典 — 追加分：公開の手順と、公開後の運用 */
(function(){
const $ = (el, s) => el.querySelector(s), $$ = (el, s) => [...el.querySelectorAll(s)];
const C = (name, en, desc, prompt, code, tags) => ({ name, en, desc, prompt, code, tags, check:true });
const S = (title, items, note) => ({ title, note, layout:'rows', items });
// 既存の進捗バー（タブの先頭に置く部品）を流用
const P = (TABS.find(t => t.sections && t.sections[0] && t.sections[0].custom) || { sections:[{}] }).sections[0];

const FLOW = [
  ['① 公開する前の確認', 'ほかのタブのチェックリスト（SEO・表示速度・セキュリティ・法務・直前チェック）を一通り。とくに<b>APIキーがコードに入っていないか</b>と<b>テスト用のデータ</b>を確認します。', ['このページのほかのタブ'], ''],
  ['② 置き場所（ホスティング）を選ぶ', '作ったものの種類で選びます。<b>道はいくつもあります</b>。', ['HTML・CSS・JS だけ → GitHub Pages・Netlify・Cloudflare Pages', 'Next.js など → Vercel・Netlify', 'Python のアプリ → Streamlit Community Cloud・Render', 'データベースも必要 → Supabase・Firebase と組み合わせる'], '<a href="tech-stack.html#host">技術スタック辞典</a>'],
  ['③ GitHub につなぐ', 'コードを GitHub に置き、ホスティングと連携すると、<b>push するたびに自動で公開</b>されます。手作業でファイルを上げる方法より、元に戻すのも簡単です。', ['GitHub と連携して自動公開（おすすめ）', 'ファイルをドラッグ＆ドロップで上げる（Netlify Drop など。手軽だが更新が手作業）'], '<a href="git-terminal.html">Git辞典</a>'],
  ['④ 環境変数を設定する', '手元の <code>.env</code> に書いた APIキーなどは、GitHub には上げず、<b>ホスティングの管理画面</b>に登録します。登録し忘れると「手元では動くのに公開すると動かない」になります。', ['ホスティングの設定画面の「Environment Variables」に登録', 'ブラウザに見えてよい値（NEXT_PUBLIC_ など）と、秘密の値を分ける'], '<a href="security.html">セキュリティ辞典</a>'],
  ['⑤ 公開して、本番のURLで確かめる', 'プレビュー（試しの公開）で確認してから本番へ。本番のURLで、<b>スマホ実機・フォーム・ログイン</b>を確かめます。', ['プレビュー環境で確認してから本番へ', 'いきなり本番に出して、すぐ確認する（小さなサイトなら十分）'], ''],
  ['⑥ 独自ドメインをつなぐ（必要なら）', '〇〇.com のような自分のドメインを使うなら、ドメインを取得して、DNS の設定でホスティングとつなぎます。HTTPS（鍵マーク）は多くのホスティングが自動で付けます。', ['ホスティングが用意する無料のURL（〇〇.vercel.app など）のまま使う', '独自ドメインを取得してつなぐ（年数千円程度〜）'], '<a href="glossary.html#web">開発用語辞典</a>'],
  ['⑦ 公開後の運用を始める', '公開はゴールではなくスタートです。動いているかを見守り、問い合わせに答え、定期的に更新します（下のチェックリスト）。', ['監視とエラー通知を入れる', '月に一度の点検日を決める'], ''],
];
function flow(el){ let k = 0; const box = $(el, '.rb-steps');
  box.innerHTML = FLOW.map(([t, d, ways, link]) => `<div><b>${t}</b><p>${d}</p>${ways.length ? `<ul>${ways.map(w => `<li>${w}</li>`).join('')}</ul>` : ''}${link ? `<small>くわしくは：${link}</small>` : ''}</div>`).join('');
  const ds = $$(box, ':scope > div');
  const draw = () => { ds.forEach((d, i) => { d.classList.toggle('on', i === k); d.classList.toggle('done', i < k); }); $(el, '.pg').textContent = `${k + 1} / ${ds.length}`; $(el, '.nx').textContent = k >= ds.length - 1 ? '最初から ↺' : '次へ ▶'; box.scrollTop = Math.max(0, ds[k].offsetTop - box.offsetTop - 8); };
  $(el, '.pv').onclick = () => { if (k > 0){ k--; draw(); } }; $(el, '.nx').onclick = () => { k = k >= ds.length - 1 ? 0 : k + 1; draw(); }; draw(); }

TABS.push({ id:'launch', label:'公開の手順と運用', icon:'🌐', intro:'チェックが終わったら、いよいよ公開です。ここでは<b>公開までの流れ</b>と、<b>公開したあとに続けること</b>をまとめます。ホスティングの選び方やドメインの設定は <a href="deploy.html">公開のしかた辞典</a> にくわしくまとめています。<b>チェックはこのブラウザに保存</b>されます。', sections:[ P,
  { title:'公開までの流れ', items:[
    { name:'公開までの7ステップ', en:'From checklist to launch', h:430, wide:true, tags:['全体像','最重要'], demo:'<div class="rb"><div class="rb-steps"></div><div class="rb-nav"><button type="button" class="pv">◀ 戻る</button><button type="button" class="pri nx">次へ ▶</button><span class="pg"></span></div></div>', init:(el) => flow(el),
      desc:'各ステップに<b>選べる道</b>を並べています。小さな個人サイトなら、無料のURLのまま・プレビューなしでも十分。お金や個人情報を扱うなら、プレビュー環境と監視までそろえます。',
      prompt:'私の作ったもの【種類：例 Next.js のWebアプリ、Supabase を使用】を公開したい。おすすめのホスティングを2つ比べて、GitHub との連携、環境変数の登録、独自ドメインの設定までの手順を、初心者向けに番号つきで教えて。料金がかかる所も示して。' },
  ] },
  S('公開後の運用チェック', [
    C('本番のURLで、主な操作を一通り試した', 'Smoke test', '公開直後に、トップ・主要ページ・フォーム・ログインを本番のURLで確認する。手元と本番の違い（環境変数・URL）による不具合はここで見つかる。', null, null, ['最重要']),
    C('止まったら気づける（稼働監視）', 'Uptime monitoring', '数分ごとにサイトにアクセスして、止まったらメールなどで知らせてくれるサービス（UptimeRobot・Better Stack など）を設定する。', '私のサイト【URL】が止まったときにメールで知らせてくれる稼働監視の設定方法を教えて。無料で使えるサービスを2つ比べて。'),
    C('エラーに気づける（エラー監視）', 'Error tracking', '利用者の画面で起きたエラーを集めて通知するサービス（Sentry など）を入れると、「動かない」と言われる前に気づける。', '私の Next.js アプリに Sentry を導入して、本番で起きたエラーだけを通知するように設定して。個人情報がエラー情報に含まれないようにして。'),
    C('利用量と料金の通知を設定した', 'Billing alerts', 'ホスティング・データベース・AI API の<b>使用量の上限や通知</b>を設定。急なアクセスや不正利用で高額請求になるのを防ぐ。', null, null, ['注意']),
    C('バックアップから戻せることを確かめた', 'Restore test', 'データベースのバックアップが取れているか、<b>実際に戻せるか</b>を一度試しておく。'),
    C('ドメインと証明書の更新日を把握した', 'Renewals', '独自ドメインは毎年の更新が必要。自動更新の設定と、支払い方法の期限切れに注意。'),
    C('問い合わせの受け口と返信の目安を決めた', 'Support', 'お問い合わせフォーム・メールアドレスと、誰が・何日以内に返すかを決める。'),
    C('障害のときの知らせ方を決めた', 'Incident communication', 'サイトが止まったとき、どこで（SNS・トップページのお知らせ）何を伝えるかを決めておく。'),
    C('依存パッケージを定期的に更新する日を決めた', 'Dependency updates', '月に一度など日を決めて、<code>npm outdated</code>・<code>npm audit</code> で確認する。GitHub の Dependabot に任せる方法もある。', 'このプロジェクトの依存パッケージで、更新が必要なものとセキュリティの問題があるものを確認する手順を教えて。更新は1つずつ、動作確認しながら進めたい。'),
    C('アクセス解析で「使われ方」を見る日を決めた', 'Analytics review', '数字を見るのは月1回でも十分。よく見られるページ・離脱が多いページ・検索で来た言葉を確認して、次の改善に。'),
    C('利用者の声を記録する場所を作った', 'Feedback log', '問い合わせやSNSの声を1か所（スプレッドシート・Issue）に集めると、次に直すべき所が見えてくる。'),
    C('規約・ポリシーを見直す時期を決めた', 'Policy review', '機能や使う外部サービスが増えたら、プライバシーポリシーや利用規約も更新する（<a href="licenses.html">著作権・ライセンス辞典</a>）。'),
  ], '公開してから毎月見直す項目です。'),
] });
})();
