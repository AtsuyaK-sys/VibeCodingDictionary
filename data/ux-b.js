/* UXライティング辞典 — B: 通知・メール・案内 / トーン / 日本語の表記ルール / AI・多言語 */
(function(){
const { $, $$, esc, tbl, seg } = KIT;
const { S, C, T, verdict, sleep, ba, marks, findAll } = UXH;

/* ================= 5. 通知・メール・案内 ================= */
TABS.push({ id:'notices', label:'通知・メール・案内', icon:'🔔',
  intro:'プッシュ通知・メールの件名・オンボーディング（最初の案内）は、<b>読まれるかどうか</b>が勝負の文章です。表示される文字数は限られ、多くは途中で切れます。<b>用件を先に・具体的に・利用者にとっての得</b>を書きましょう。送りすぎは通知をオフにされる一番の原因です。',
  sections:[
    C('触って理解する', [
      { name:'プッシュ通知のプレビュー', en:'Push notification copy', h:470, tags:['体験','通知'],
        demo:'<div class="kt"><div class="fm" style="display:grid;grid-template-columns:auto 1fr;gap:4px 8px;align-items:center;font-size:11.5px"></div><div class="ux-lock lk"></div><div class="ux-stats st"></div><div class="kt-note">※表示される文字数は端末・設定で変わります。<b>最初の15〜20文字で用件が伝わる</b>ように書くのが目安です。</div></div>',
        init:(el) => { const F = [['t', 'タイトル', 'お知らせ'], ['b', '本文', 'いつもご利用ありがとうございます。新しい機能が追加されましたので、ぜひアプリを開いてご確認ください。']];
          $(el, '.fm').innerHTML = F.map(([k, l, v]) => `<span>${l}</span><input class="kt-in" data-k="${k}" value="${esc(v)}" aria-label="${l}">`).join('') + '<span></span><span class="kt-row" style="gap:4px"><button type="button" class="kt-btn sm ex">良い例を入れる</button></span>';
          const run = () => { const t = $(el, '[data-k=t]').value, b = $(el, '[data-k=b]').value;
            $(el, '.lk').innerHTML = `<div class="ux-notif"><i>📦</i><b>${esc(t)}</b><span>${esc(b)}</span></div><div class="ux-notif" style="opacity:.6"><i>💬</i><b>メッセージ</b><span>山田さん：明日の件、了解です！</span></div>`;
            const ck = [[!/^(お知らせ|通知|ご案内|重要)$/.test(t.trim()), 'タイトルが具体的'], [!/いつも|ありがとう|ぜひ|ご確認ください/.test([...b].slice(0, 20).join('')), '最初に前置きがない'], [/\d|[0-9０-９]|今日|明日|まで/.test(b + t), '数字・期限が入っている'], [[...b].length <= 60, '本文が60文字以内']];
            $(el, '.st').innerHTML = ck.map(([ok, l]) => `<span class="${ok ? 'ok' : 'warn'}">${ok ? '✓' : '△'} ${l}</span>`).join(''); };
          $$(el, '.fm input').forEach(i => i.oninput = run); $(el, '.ex').onclick = () => { $(el, '[data-k=t]').value = '📦 ご注文の品が今日届きます'; $(el, '[data-k=b]').value = '14〜16時にお届け予定です。不在の場合は、アプリから再配達の日時を選べます。'; run(); }; run(); },
        desc:'プッシュ通知は<b>ロック画面で一瞬見られるだけ</b>。「お知らせ」のようなタイトル、「いつもありがとうございます」から始まる本文では、用件が見える前に切れてしまいます。<b>何が・いつ・どうすれば</b>を先頭に、数字や期限を入れると開かれやすくなります。',
        prompt:'このアプリのプッシュ通知の文言を全部見直して。タイトルは用件が分かる具体的な言葉（「お知らせ」は使わない）、本文は最初の20文字に「何が・いつ」を入れ、60文字以内に。通知の種類ごとに、送る頻度の上限も提案して。' },
      { name:'メールの件名', en:'Email subject lines', h:430, tags:['体験','メール'],
        demo:'<div class="kt"><input class="kt-in sj" value="【ABCストア】いつもご利用いただき誠にありがとうございます。11月のお得なキャンペーンのお知らせ" aria-label="件名"><div class="ux-inbox ib"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const run = () => { const s = $(el, '.sj').value, n = [...s].length;
            $(el, '.ib').innerHTML = `<div><b>山田 花子</b><small style="color:var(--muted)">9:12</small><span>来週の打ち合わせについて</span></div><div class="me"><b>ABCストア</b><small style="color:var(--muted)">8:30</small><span>${esc([...s].slice(0, 22).join(''))}${n > 22 ? '…' : ''}</span></div><div><b>カード会社</b><small style="color:var(--muted)">昨日</small><span>ご利用代金確定のお知らせ</span></div>`;
            verdict($(el, '.res'), n > 30 || /いつも|誠に/.test([...s].slice(0, 15).join('')) ? 'bad' : 'ok', `件名 <b>${n}文字</b>。スマホの受信箱では<b>20文字前後</b>で切れることが多い（目安）。` + (/いつも|誠に/.test([...s].slice(0, 15).join('')) ? '<br>❌ あいさつで始まると、用件が見えません。<br>例：「<b>【11/30まで】冬物20%オフ｜ABCストア</b>」' : '<br>✓ 用件が先頭にあります。')); };
          $(el, '.sj').oninput = run; run(); },
        desc:'メールの件名は、受信箱で<b>最初の20文字前後</b>しか見えないことが多いです（目安）。あいさつや会社名から始めると、用件が見えません。<b>用件・期限・数字</b>を先に、送り主の名前は送信者名か件名の最後に。開封されるかは、ほぼ件名で決まります。',
        prompt:'サービスから送るメール（会員登録完了・パスワード再設定・注文確認・発送・キャンペーン）の件名を、用件が最初の15文字で分かる形に作り直して。それぞれ本文の最初の1行（プレビューに出る部分）も書いて。' },
      { name:'はじめての案内（オンボーディング）', en:'Onboarding copy', h:450, tags:['体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="st" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(150px, 1fr));gap:6px"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const V = [[['📊 高機能なグラフ機能', 'さまざまな種類のグラフに対応しています。'], ['☁ クラウド同期', '最新の同期エンジンを搭載。'], ['🔒 セキュリティ', '暗号化技術を採用しています。']], [['💰 お金の流れが一目で', '何にいくら使ったか、毎月自動でグラフにします。'], ['📱 どの端末でも続きから', 'スマホで入れた記録を、PCでもすぐ見られます。'], ['🔒 家族にも見られない', 'あなただけが見られるよう、しっかり守ります。']]];
          $(el, '.sw').replaceWith(seg(['機能の説明', '利用者の得'], i => { $(el, '.st').innerHTML = V[i].map(([h, p], k) => `<div class="ux-scr" style="padding:10px;gap:4px;flex:none"><span class="kt-lbl">${k + 1} / 3</span><b style="font-size:13px">${h}</b><span style="font-size:12px;color:var(--muted)">${p}</span></div>`).join('');
            verdict($(el, '.res'), i ? 'ok' : 'bad', i ? '✓ <b>使うと自分にどんな良いことがあるか</b>を書いています。読み飛ばされても、見出しだけで伝わる。最後の画面は「最初の記録をつける」など行動で終わる。' : '❌ <b>作り手の自慢</b>（機能・技術）になっています。利用者が知りたいのは「自分にとって何が良いか」。'); }).el); },
        desc:'はじめての案内は<b>読み飛ばされる</b>前提で、見出しだけで伝わるように書きます。「高機能なグラフ」「最新の同期エンジン」のような<b>機能の説明</b>ではなく、「お金の流れが一目で」のような<b>利用者の得</b>を。枚数は3枚程度まで、最後は最初の行動に誘います。',
        prompt:'このアプリの初回起動時の案内（3画面）を作り直して。各画面は「利用者にとっての得」を見出しに（機能名ではなく）、説明は1〜2行、いつでもスキップでき、最後の画面は最初の行動（「最初の記録をつける」）のボタンで終わるように。' },
    ], null, true),
    S('通知・メール・案内の用語', [
      T('プッシュ通知', 'Push notification', 'アプリを開いていないときに届くお知らせ。送りすぎるとオフにされる。'),
      T('通知の頻度', 'Frequency capping', '1日・1週間に送る上限を決める。大事な通知が埋もれないように。', null, ['注意']),
      T('件名とプレビュー', 'Subject / preheader', 'メールの件名と、受信箱で件名の横・下に出る本文の最初の部分。両方で用件を伝える。'),
      T('トランザクションメール', 'Transactional email', '登録完了・注文確認・パスワード再設定など、利用者の操作で届くメール。<b>最も読まれる</b>。'),
      T('オンボーディング', 'Onboarding', 'はじめての人が使い始められるようにする案内。説明より、最初の成功体験へ導く。'),
      T('ツールチップ', 'Tooltip', '部品の近くに出る短い説明。1〜2文で。大事な情報はツールチップに隠さない。'),
      T('コーチマーク', 'Coach marks', '画面の一部を指して説明する案内。多すぎると邪魔になる。'),
      T('許可の前置き', 'Permission priming', '通知・カメラなどの許可の前に、自分の画面で理由を説明する。（アプリ・配布形態辞典）'),
      T('配信停止', 'Unsubscribe', 'お知らせメールには分かりやすい配信停止のリンクを。法律（特定電子メール法）でも必要。', null, ['必須']),
    ]),
  ]});

/* ================= 6. トーン ================= */
const TONE = { save:[['保存が完了いたしました。', '保存しました。', '保存しました！'], ['保存が完了いたしました。ご確認ください。', '保存しました。いつでも続きから書けます。', '保存できました！続きはいつでもどうぞ✨'], ['データは正常に保存されております。', '保存しました。', 'よし、保存完了！']], err:[['大変申し訳ございません。只今、保存処理を完了することができませんでした。', '保存できませんでした。もう一度お試しください。', 'あれ、保存できなかったみたい…もう一回やってみて！'], ['申し訳ございません。通信状況をご確認のうえ、再度お試しいただけますでしょうか。', 'ごめんなさい、保存できませんでした。電波の良い場所でもう一度お試しください。', 'ごめんね、保存できなかった…電波を確認してもう一回お願い！'], ['保存処理でエラーが発生しました。', '保存できませんでした。', '保存失敗！']] };
const ROWS = ['かしこまった', 'ふつう', 'くだけた'], COLS = ['淡々', 'やさしい', '元気'];
const KEIGO = [[/させていただ[きくけこ]/g, 'warn', '「させていただく」の多用。相手の許可や恩恵がないなら「〜します」'], [/おっしゃられ|ご覧になられ|お召し上がりになられ|お伺いさせていただ/g, 'bad', '二重敬語（敬語の重ねすぎ）'], [/よろしかったでしょうか/g, 'bad', '「よろしいでしょうか」に（過去形にしない）'], [/になります/g, 'warn', '「〜になります」は「〜です」で十分なことが多い'], [/のほう(?!が)/g, 'warn', '「〜のほう」はぼかす言い方。なくても意味は通じる'], [/大変申し訳ございません/g, 'info', '強い謝罪。サービス側の重大な不具合のときだけに']];

TABS.push({ id:'tone', label:'トーン', icon:'🎚',
  intro:'<b>ボイス</b>（サービスの人柄）は変えず、<b>トーン</b>（話し方の調子）は場面で変えます。成功は明るく、失敗や謝罪は落ち着いて、お金や安全は正確に。日本語では<b>敬語の強さ</b>もトーンの大きな要素です。丁寧すぎると冷たく遠く、くだけすぎると軽く見えます。',
  sections:[
    C('触って理解する', [
      { name:'トーンの地図', en:'Tone matrix', h:500, tags:['体験','定番'],
        demo:'<div class="kt"><span class="sw"></span><div class="ux-grid gr"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let k = 'save', sel = [1, 1]; const draw = () => { $(el, '.gr').innerHTML = '<b></b>' + COLS.map(c => `<b>${c}</b>`).join('') + ROWS.map((r, i) => `<b>${r}</b>` + COLS.map((c, j) => `<button type="button" data-r="${i}" data-c="${j}" class="${sel[0] === i && sel[1] === j ? 'on' : ''}">${esc(TONE[k][j][i])}</button>`).join('')).join('');
            $$(el, '.gr button').forEach(b => b.onclick = () => { sel = [+b.dataset.r, +b.dataset.c]; draw(); }); const [r, c] = sel;
            verdict($(el, '.res'), '', `<b>${ROWS[r]} × ${COLS[c]}</b>：` + (k === 'err' && c === 2 ? '失敗のときに元気すぎると、<b>困っている人の気持ちとずれて</b>イラッとさせます。' : r === 0 && c === 0 ? '銀行・役所・法律の手続きなど、正確さと信頼が一番大事な場面に。' : r === 2 && c === 2 ? '若い人向けのゲームやSNS。お金・安全の場面では避ける。' : r === 1 && c === 1 ? '<b>多くのアプリの基本</b>。丁寧すぎず、冷たくない。' : r === 0 ? '丁寧だが、距離を感じる。高級店・BtoB向け。' : 'サービスの人柄（ボイス）に合わせて選ぶ。') + (k === 'err' ? '<br>失敗の場面は、ふだん元気なサービスでも<b>トーンを落ち着かせる</b>のが基本。' : ''));
          };
          $(el, '.sw').replaceWith(seg(['成功のとき', '失敗のとき'], i => { k = i ? 'err' : 'save'; draw(); }).el); },
        desc:'同じ「保存しました」でも、<b>丁寧さ</b>（かしこまった〜くだけた）と<b>温度</b>（淡々〜元気）の組み合わせで印象が大きく変わります。サービス全体の基本の位置を決めたうえで、<b>失敗や謝罪のときは落ち着かせる</b>など場面で調整します。マスをクリックして比べてみましょう。',
        prompt:'このアプリのボイス＆トーンのガイドを作って。サービスの人柄を3つの形容詞で定義し、場面（成功・失敗・お金・待ち時間・お祝い・謝罪）ごとのトーンの調整と、使う言葉・使わない言葉の例を表にして。既存の文言を3つ、このガイドで書き直した例も付けて。' },
      { name:'敬語のチェック', en:'Keigo checker', h:440, tags:['体験','日本語'],
        demo:'<div class="kt"><textarea class="kt-in tx" rows="3" spellcheck="false" aria-label="文章"></textarea><div class="ux-out out kt-grow"></div><div class="ux-list ls" style="max-height:30%"></div></div>',
        init:(el) => { const tx = $(el, '.tx'); tx.value = 'ご注文の商品は明日のお届けになります。お支払いのほうはカードでよろしかったでしょうか。担当者がおっしゃられたとおり、確認させていただきます。'; const run = () => { const t = tx.value, sp = []; KEIGO.forEach(([r, c, m]) => sp.push(...findAll(t, r, c, m))); $(el, '.out').innerHTML = marks(t, sp); $(el, '.ls').innerHTML = sp.length ? sp.map(s => `<div><b>「${esc(t.slice(s.s, s.e))}」</b>：${esc(s.m)}</div>`).join('') : '<div><i>✓ 気になる表現は見つかりませんでした</i></div>'; };
          let tm; tx.oninput = () => { clearTimeout(tm); tm = setTimeout(run, 200); }; run(); },
        desc:'丁寧にしようとして、<b>二重敬語</b>（おっしゃられる）、<b>「させていただく」の連発</b>、<b>アルバイト敬語</b>（〜になります・よろしかったでしょうか・〜のほう）になりがちです。画面の言葉は<b>「です・ます」で十分</b>なことがほとんど。丁寧さより、分かりやすさを優先しましょう。',
        prompt:'このアプリの文言から、二重敬語・「させていただく」の多用・「〜になります」「〜のほう」「よろしかったでしょうか」などの表現を探して、自然な「です・ます」に直して。謝罪の表現が強すぎる箇所も、状況に合った強さに調整して。' },
      { name:'場面ごとのトーン', en:'Tone by situation', h:420, tags:['体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="pv"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const V = [['お祝い', '目標を達成しました。', '🎉 30日連続で記録できました！すごい！', '<b>一緒に喜ぶ</b>。絵文字や「すごい」もここなら合う。'], ['謝罪', 'システム障害が発生しております。', '申し訳ありません。現在、ログインしにくい状態です。10時ごろの復旧を目指しています。入力中のデータは消えません。', '<b>言い訳より状況と見通し</b>。利用者が一番心配なこと（データは無事か）に答える。'], ['お金', 'お支払いが完了しました！🎉', 'お支払いが完了しました。1,078円（税込）をカードに請求します。領収書はメールでお送りしました。', '<b>正確さが最優先</b>。はしゃがず、金額・方法・控えの場所を明確に。'], ['警告', '注意してください。', 'このファイルを公開すると、リンクを知っている人なら誰でも見られます。', '何が・なぜ危険かを<b>具体的に</b>。「注意してください」だけでは何に注意するか分からない。']];
          $(el, '.sw').replaceWith(seg(V.map(v => v[0]), i => { $(el, '.pv').innerHTML = ba(esc(V[i][1]), esc(V[i][2])); verdict($(el, '.res'), '', V[i][3]); }).el); },
        desc:'トーンは<b>相手の気持ち</b>に合わせて変えます。うれしい場面は一緒に喜び、困っている場面は落ち着いて状況と見通しを、お金や安全の場面は正確に。同じサービスでも、場面によって絵文字や「！」を使う・使わないを決めておくと、文言がぶれません。',
        prompt:'障害が起きたときにアプリ内とSNSで出すお知らせの文面を作って。発生中・復旧見込み・復旧後の3段階で、状況・影響範囲・利用者のデータへの影響・次の更新時刻を書き、言い訳や専門用語は使わないで。' },
    ], null, true),
    { title:'ボイス＆トーンのガイドに書くこと', note:'チームやAIが書く文言がぶれないよう、短いガイドを1枚作って <b>CLAUDE.md</b> などにも入れておくと効果的です。',
      table:{ head:['項目', '例'], rows:[['人柄（ボイス）を3語で', '親しみやすい・誠実・頼れる'], ['呼びかけ', '「あなた」は使わない／「お客さま」に統一'], ['文体', '「です・ます」。「させていただく」は使わない'], ['絵文字・「！」', 'お祝いの場面だけ。エラー・お金の場面では使わない'], ['場面ごとの調整', '成功＝明るく、失敗＝落ち着いて、お金＝正確に'], ['使わない言葉', '不正・無効・押下・当該・処理'], ['用語集', '保存（登録とは言わない）・メモ（ノートとは言わない）'], ['書き直しの例', 'ガイドを当てはめた前後の例を3つ以上']] } },
    S('トーンと敬語の用語', [
      T('ボイスとトーン', 'Voice & tone', 'ボイス＝変わらない人柄。トーン＝場面で変える調子。', null, ['基本']),
      T('です・ます調', 'Polite form', '画面の文言の基本。尊敬語・謙譲語を重ねるより、です・ますで分かりやすく。'),
      T('二重敬語', 'Double honorifics', '「おっしゃられる」「ご覧になられる」など敬語を重ねた形。誤りとされる。'),
      T('アルバイト敬語', 'Service-industry speech', '「〜になります」「よろしかったでしょうか」「〜のほう」など。画面では避ける。'),
      T('呼びかけ', 'Addressing users', '「あなた」は日本語では強く響くことがある。主語を省く・「お客さま」などに統一。'),
      T('感嘆符と絵文字', 'Exclamation & emoji', '使う場面を決める。エラー・お金・謝罪では使わない。'),
      T('共感', 'Empathy', '困っている人には、まず状況を認め、次にできることを示す。'),
      T('誠実さ', 'Honesty', 'できないことはできないと言う。あいまいにごまかすと信頼を失う。'),
    ]),
  ]});

/* ================= 7. 日本語の表記ルール ================= */
const YURE = [['サーバー', 'サーバ'], ['ユーザー', 'ユーザ'], ['コンピューター', 'コンピュータ'], ['メールアドレス', 'メアド'], ['ログイン', 'ログオン'], ['ダウンロード', 'DL']];
const HIRAKU = [[/出来(る|ます|ない|ません)/g, 'でき$1'], [/下さい/g, 'ください'], [/(して|て)頂(く|き|け)/g, '$1いただ$2'], [/(?<=[るた])事(?=[がをはもに])/g, 'こと'], [/(?<=[るた])時(?=[はにの])/g, 'とき'], [/予め/g, 'あらかじめ'], [/全て/g, 'すべて'], [/又は/g, 'または'], [/及び/g, 'および'], [/様に/g, 'ように'], [/(?<=て)見る/g, 'みる'], [/(?<=て)置く/g, 'おく'], [/(?<=て)行く/g, 'いく']];
const SAMPLE2 = '会員登録が出来ます。ﾛｸﾞｲﾝしたらメールアドレスを入力して下さい。全てのユーザが使える様に、サーバーを更新しました！！詳しくはＦＡＱをご覧下さい，よろしくお願いします．';

TABS.push({ id:'japanese', label:'日本語の表記', icon:'あ',
  intro:'日本語は、同じ言葉を<b>漢字・ひらがな・カタカナ</b>のどれでも書けるので、表記がぶれやすい言語です。「サーバー／サーバ」「下さい／ください」「出来る／できる」が混ざると、雑な印象になります。<b>サービス内でルールを決めて統一</b>し、数字・日付・記号の書き方もそろえましょう。',
  sections:[
    C('触って理解する', [
      { name:'表記ゆれチェッカー', en:'Notation consistency checker', h:540, tags:['体験','定番','最重要'], wide:true,
        demo:'<div class="kt"><textarea class="kt-in tx" rows="4" spellcheck="false" aria-label="文章"></textarea><div class="ux-two"><div><span class="kt-lbl">印を付けた文章</span><div class="ux-out out" style="flex:1"></div></div><div><span class="kt-lbl">見つかったこと</span><div class="ux-list ls" style="flex:1"></div></div></div><div class="kt-row"><button type="button" class="kt-btn pri fx">ルールどおりに直す</button></div></div>',
        init:(el) => { const tx = $(el, '.tx'); tx.value = SAMPLE2;
          // 好ましい表記 a に対する、ゆれた表記 b（サーバ のように a の途中までの場合は、後ろに「ー」が続かないものだけ）
          const varRe = (a, b) => new RegExp(b + (a.startsWith(b) ? `(?!${a.slice(b.length)})` : ''), 'g');
          const check = (t) => { const sp = [];
            YURE.forEach(([a, b]) => { const mixed = t.includes(a); sp.push(...findAll(t, varRe(a, b), mixed ? 'bad' : 'warn', mixed ? `「${a}」と「${b}」が混ざっています → 「${a}」に統一` : `表記ルールでは「${a}」`)); });
            // 説明文を作るときは別の正規表現を使う（同じものを使うと検索の位置が戻って止まらなくなる）
            HIRAKU.forEach(([r, to]) => sp.push(...findAll(t, r, 'warn', (m) => `ひらがなに開く：「${m[0]}」→「${/\$\d/.test(to) ? m[0].replace(new RegExp(r.source), to) : to}」`)));
            sp.push(...findAll(t, /[ｦ-ﾟ]+/g, 'bad', '半角カタカナは使わない')); sp.push(...findAll(t, /[Ａ-Ｚａ-ｚ０-９]+/g, 'warn', '英数字は半角に'));
            sp.push(...findAll(t, /[，．]/g, 'bad', '句読点は「、」「。」に統一')); sp.push(...findAll(t, /[!！]{2,}|[?？]{2,}/g, 'warn', '「！！」など記号の重ね使いは避ける')); return sp; };
          const fix = (t) => { YURE.forEach(([a, b]) => { t = t.replace(varRe(a, b), a); }); HIRAKU.forEach(([r, to]) => { t = t.replace(r, to); }); return t.replace(/[ｦ-ﾟ]+|[Ａ-Ｚａ-ｚ０-９]+/g, (s) => s.normalize('NFKC')).replace(/，/g, '、').replace(/．/g, '。').replace(/[!！]{2,}/g, '！').replace(/[?？]{2,}/g, '？'); };
          const run = () => { const t = tx.value, sp = check(t); $(el, '.out').innerHTML = marks(t, sp); $(el, '.ls').innerHTML = sp.length ? sp.map(s => `<div><b>「${esc(t.slice(s.s, s.e))}」</b> ${esc(s.m)}</div>`).join('') : '<div><i>✓ 表記ゆれは見つかりませんでした</i></div>'; };
          let tm; tx.oninput = () => { clearTimeout(tm); tm = setTimeout(run, 200); }; $(el, '.fx').onclick = () => { tx.value = fix(tx.value); run(); }; run(); },
        desc:'1つの画面に「サーバー」と「サーバ」、「下さい」と「ください」が混ざると、読む人は無意識に引っかかります。<b>長音（ー）を付けるか</b>、<b>補助動詞・形式名詞はひらがな</b>（〜してください・ことができる・ときは）、<b>英数字は半角</b>、<b>句読点は「、。」</b>、<b>半角カタカナは使わない</b>、などのルールを決めて統一します。',
        prompt:'このリポジトリの画面の文言（日本語）から表記ゆれを洗い出して。長音の有無（サーバー/サーバ）、補助動詞・形式名詞の漢字（下さい・出来る・事・時）、全角英数字、半角カタカナ、句読点の種類をチェックし、表記ルールを1つ決めて統一して。決めたルールは docs/writing-rules.md にまとめて。' },
      { name:'数字・日付・時刻の書き方', en:'Numbers, dates & times', h:440, tags:['体験'],
        demo:'<div class="kt"><div class="kt-row"><input type="datetime-local" class="kt-in dt" style="max-width:220px" aria-label="日時"><input type="number" class="kt-in nm" value="12345678" style="max-width:150px" aria-label="数"></div><div class="tb kt-tblwrap kt-grow"></div></div>',
        init:(el) => { const d0 = new Date(2026, 10, 3, 19, 30); $(el, '.dt').value = '2026-11-03T19:30';
          const run = () => { const d = new Date($(el, '.dt').value || d0), n = +$(el, '.nm').value || 0, wd = '日月火水木金土'[d.getDay()], today = new Date(2026, 9, 27), diff = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - today) / 864e5);
            const R = [['日付（本文）', `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${wd}）`, '曜日は全角かっこで'], ['日付（短く）', `${d.getMonth() + 1}/${d.getDate()}（${wd}）`, '表・カード・通知に。今年なら年は省く'], ['日時', `${d.getMonth() + 1}月${d.getDate()}日（${wd}）${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`, '時刻は24時間制が誤解が少ない'], ['相対表示', diff === 0 ? '今日' : diff === 1 ? '明日' : diff === -1 ? '昨日' : diff > 0 ? `${diff}日後` : `${-diff}日前`, '近い日付は「明日」「3日前」が分かりやすい。正確な日時はマウスを乗せたら出す'], ['金額', `${n.toLocaleString('ja-JP')}円`, '3桁区切り。「¥」か「円」かを統一'], ['大きな数', n >= 1e8 ? `${(n / 1e8).toFixed(1).replace(/\.0$/, '')}億` : n >= 1e4 ? `${(n / 1e4).toFixed(1).replace(/\.0$/, '')}万` : `${n}`, '「1.2万人」のように丸めると読みやすい（正確さが必要な所は除く）'], ['範囲', `${Math.round(n / 1000).toLocaleString()}〜${Math.round(n / 500).toLocaleString()}件`, '範囲は「〜」。「-」は引き算と紛らわしい'], ['単位', '3MB・10分・25℃', '数字と単位の間はあけない（またはルールで統一）']];
            $(el, '.tb').innerHTML = tbl(['用途', '表示', 'ポイント'], R); };
          $(el, '.dt').oninput = run; $(el, '.nm').oninput = run; run(); },
        desc:'数字・日付・時刻は、<b>書き方を1つに決める</b>だけで画面がすっきりします。日付は「11月3日（月）」、時刻は24時間制、金額は3桁区切り、近い日付は「明日」「3日前」のような相対表示…。プログラムでは <code>Intl.DateTimeFormat</code> や <code>toLocaleString</code> を使うと、書き方をそろえやすくなります。',
        prompt:'アプリ内の日付・時刻・金額・数量の表示を、共通の関数（formatDate・formatPrice・formatRelative）にまとめて統一して。日付は「11月3日（月）」、時刻は24時間制、3日以内は「明日」「2日前」の相対表示、金額は3桁区切り＋円。Intl を使ってタイムゾーンは日本時間に固定して。' },
    ], null, true),
    { title:'表記ルールの例', note:'正解は1つではありません。<b>決めて、書き残して、守る</b>ことが大事です。公的な文書なら文化庁の「公用文作成の考え方」、Web ならよく使われる表記に合わせると自然です。',
      table:{ head:['対象', 'ルールの例', '例'], rows:[['長音（ー）', '語尾の長音は付ける', 'サーバー・ユーザー・コンピューター'], ['補助動詞', 'ひらがな', '〜してください・〜していただく・〜してみる'], ['形式名詞', 'ひらがな', 'こと・とき・もの・ところ'], ['副詞・接続詞', 'ひらがなが多め', 'すべて・あらかじめ・または・および'], ['英数字', '半角', 'ID・3件・10MB'], ['カタカナ', '全角（半角カナは使わない）', 'ログイン'], ['句読点', '「、」「。」', 'ボタンやラベルの末尾には「。」を付けない'], ['かっこ', '全角（ ）「 」', '補足（任意）・「保存」ボタン'], ['記号', '「！」「？」は全角。重ねない', '完了しました！'], ['数字の範囲', '「〜」', '3〜5日']] } },
    S('日本語表記の用語', [
      T('表記ゆれ', 'Inconsistent notation', '同じ言葉が違う書き方で混ざること。信頼感を下げる。', null, ['最重要']),
      T('ひらく・とじる', 'Kana vs kanji', '漢字で書く＝とじる、ひらがなで書く＝ひらく。補助的な言葉はひらくと読みやすい。'),
      T('漢字の割合', 'Kanji ratio', '2〜3割が読みやすい目安。多いと硬く、少なすぎると読みにくい。'),
      T('全角・半角', 'Full / half width', '英数字は半角、カタカナは全角が一般的。混ぜない。'),
      T('長音符', 'Prolonged sound mark', 'サーバー／サーバのように語尾の「ー」の有無。現在は付ける表記が一般的。'),
      T('用語集', 'Glossary', 'サービス内の言葉と表記の一覧。新しい人やAIにも共有する。'),
      T('textlint', 'textlint', '日本語の文章を自動でチェックする道具。表記ゆれ・文の長さ・二重否定などのルールを入れられる。', null, ['道具']),
      T('Intl', 'Intl API', 'JavaScript の地域に合わせた書式の機能。日付・数・通貨・相対時間をそろえて表示できる。'),
    ]),
  ]});

/* ================= 8. AI・多言語 ================= */
const STRINGS = [['ボタン', 'OK'], ['エラー', '不正な入力です'], ['通知', 'お知らせ'], ['空の状態', 'データがありません'], ['確認', '本当によろしいですか？'], ['完了', '処理が正常に完了しました'], ['ボタン', '月額980円で申し込む'], ['説明', 'ログインしてください'], ['エラー', 'エラーが発生しました'], ['リンク', '詳細はこちら']];
const LINT = [[/^(OK|はい|いいえ|送信)$/, '押した結果が分からないボタン'], [/不正|無効/, '利用者を責める言葉'], [/^(お知らせ|通知)$/, '用件が分からない'], [/^データがありません$/, '次にすることがない空の状態'], [/本当によろしいですか/, '何を確認しているか分からない'], [/正常に|処理/, '何が完了したか分からない'], [/^エラーが発生しました$/, '何が・どうすればが分からない'], [/こちら|ここ/, '行き先が分からないリンク']];
const I18N = [['ja', '保存する', '設定'], ['en', 'Save', 'Settings'], ['de', 'Speichern', 'Einstellungen'], ['fr', 'Enregistrer', 'Paramètres'], ['ru', 'Сохранить', 'Настройки'], ['fi', 'Tallenna', 'Asetukset']];

TABS.push({ id:'ai', label:'AI・多言語', icon:'🌐',
  intro:'AIは文言を大量に書いてくれますが、<b>システム目線・曖昧・表記ゆれ</b>が混ざりがちです。ルールを渡して書かせ、まとめてチェックしましょう。海外向けにするなら、文言を<b>コードから切り出し</b>（多言語化）、言語ごとに<b>長さ</b>や<b>数の数え方</b>が変わることも考えておきます。',
  sections:[
    C('触って理解する', [
      { name:'文言をまとめてレビュー', en:'Microcopy lint', h:470, tags:['体験','AI'],
        demo:'<div class="kt"><div class="ux-list ls kt-grow"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let n = 0; $(el, '.ls').innerHTML = STRINGS.map(([k, s]) => { const hit = LINT.find(([r]) => r.test(s)); if (hit) n++; return `<div style="display:flex;gap:8px;justify-content:space-between;flex-wrap:wrap"><span><span class="kt-badge">${k}</span> 「${esc(s)}」</span>${hit ? `<b>⚠ ${hit[1]}</b>` : '<i>✓ OK</i>'}</div>`; }).join('');
          verdict($(el, '.res'), 'warn', `10個のうち <b>${n}個</b>に改善の余地。こうした機械的なチェックはルール化して、<b>textlint</b> や AIのレビューで自動化できます。最後は実際の画面の流れの中で読んで確かめましょう。`); },
        desc:'文言を1つずつ見るより、<b>画面の文言を全部一覧にしてまとめて見る</b>と、曖昧なボタン・責める言葉・こちらリンクなどのパターンがすぐ見つかります。ルールが決まったら、<b>AIにルールごと渡して</b>レビューと書き直しを頼むのが効率的です。',
        prompt:'このリポジトリの画面に表示される日本語の文字列を全部抜き出して表にして（ファイル・種類・文言）。その上で、UXライティングのルール（押した結果が分かるボタン・エラーは何が/なぜ/どうする・こちらリンク禁止・責める言葉禁止・表記ルール）に照らして問題のある文言と書き直し案を出して。' },
      { name:'言語で長さが変わる', en:'Text expansion in i18n', h:430, tags:['体験','多言語'],
        demo:'<div class="kt"><label class="kt-row" style="font-size:11.5px"><input type="checkbox" class="fl">ボタンの幅を文字に合わせる（固定しない）</label><div class="rw" style="display:flex;flex-direction:column;gap:6px;flex:1;overflow:auto"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const run = () => { const flex = $(el, '.fl').checked; $(el, '.rw').innerHTML = I18N.map(([l, a, b]) => `<div style="display:flex;gap:8px;align-items:center;font-size:11.5px"><b class="kt-mono" style="width:24px">${l}</b><span class="ux-fix" style="${flex ? '' : 'width:84px'}">${esc(a)}</span><span class="ux-fix" style="${flex ? '' : 'width:84px'};background:var(--surface-2);color:var(--text)">${esc(b)}</span></div>`).join('');
            verdict($(el, '.res'), flex ? 'ok' : 'bad', flex ? '✓ 文字に合わせて広がるので、どの言語でも切れません。日本語の画面を基準に作ると、<b>英語は1.5〜2倍、ドイツ語はさらに長く</b>なりがち。' : '❌ 日本語に合わせた固定の幅だと、ドイツ語やフランス語で<b>文字が切れます</b>。'); };
          $(el, '.fl').onchange = run; run(); },
        desc:'日本語は短く書けるので、日本語に合わせて作った画面は、<b>翻訳すると文字があふれる</b>ことがよくあります。ボタン・タブ・表の見出しは<b>幅を固定しない</b>、改行や省略を想定しておく、翻訳前に<b>わざと長い仮の文字（疑似翻訳）</b>で崩れないか確かめる、が定番の対策です。',
        prompt:'このアプリを英語にも対応させたい。画面の文字列を next-intl（または i18next）の辞書ファイル（ja.json / en.json）に切り出し、日時・数・通貨は Intl で言語に合わせて表示。ボタンやタブの幅が固定されている所を、英語・ドイツ語でも崩れないように直して。' },
      { name:'数や変数の入った文', en:'Plurals & placeholders', h:430, tags:['体験','多言語'],
        demo:'<div class="kt"><div class="kt-row"><span class="kt-lbl">件数</span><input type="range" min="0" max="12" value="1" class="n" style="flex:1" aria-label="件数"><b class="kt-mono nv"></b></div><div class="tb kt-tblwrap kt-grow"></div><div class="kt-code">{count, plural, =0 {No new messages} one {# new message} other {# new messages}}</div></div>',
        init:(el) => { const run = () => { const n = +$(el, '.n').value; $(el, '.nv').textContent = n; const en = n === 0 ? 'No new messages' : n === 1 ? '1 new message' : `${n} new messages`;
            $(el, '.tb').innerHTML = tbl(['書き方', '表示'], [['❌ 文字をつなげるだけ（英語）', `${n} new message(s)`], ['✓ 複数形のルール（英語）', en], ['❌ 0件でも数字（日本語）', `新しいメッセージが${n}件あります`], ['✓ 0件は別の文（日本語）', n === 0 ? '新しいメッセージはありません' : `新しいメッセージが${n}件あります`]]); };
          $(el, '.n').oninput = run; run(); },
        desc:'「新しいメッセージが{数}件」のような<b>変数入りの文</b>は、言語によって数の扱いが違います。英語は1つと複数で形が変わり、ロシア語やアラビア語はさらに細かい。<b>文字をつなげて文を作らず</b>、ICU メッセージ形式などで<b>文全体を言語ごとに用意</b>します。日本語でも0件のときは別の言い方にすると自然です。',
        prompt:'通知の件数・カートの商品数など、数が入る文言を ICU メッセージ形式（plural）で書き直して。日本語・英語の辞書ファイルを用意し、0件のときは別の文、英語は単数・複数を正しく出し分けて。文字列の連結で文を作っている箇所もなくして。' },
      { name:'AIに文言を頼むとき', en:'Prompting for microcopy', h:450, tags:['AI','体験'],
        demo:'<div class="kt"><div class="ck" style="display:flex;flex-wrap:wrap;gap:4px 12px;font-size:11.5px"></div><div class="kt-code out kt-grow" style="white-space:pre-wrap;overflow:auto"></div><div class="kt-row"><button type="button" class="kt-btn sm cp">コピー</button></div></div>',
        init:(el) => { const O = [['who', '誰が使うか（利用者像）を書く', true], ['where', 'どの画面の、どの場面か', true], ['tone', 'トーン（です・ます、絵文字なし など）', true], ['len', '文字数の上限（ボタン6文字・通知60文字）', true], ['rule', '表記ルール（サーバー・ください 等）', true], ['err', 'エラーは「何が/なぜ/どうする」', false], ['alt', '案を3つ出して、理由も書く', true]];
          $(el, '.ck').innerHTML = O.map(([k, l, v]) => `<label><input type="checkbox" data-k="${k}"${v ? ' checked' : ''}>${l}</label>`).join('');
          const run = () => { const on = new Set($$(el, '.ck input').filter(i => i.checked).map(i => i.dataset.k));
            $(el, '.out').textContent = ['次の画面の文言を考えてください。', on.has('who') ? '【利用者】家計簿をつけ始めたばかりの20〜40代。スマホで片手操作が多い。' : '', on.has('where') ? '【場面】レシートの写真を読み取ったあと、金額を確認して保存する画面。保存ボタンと、読み取れなかったときのエラー。' : '', on.has('tone') ? '【トーン】親しみやすく、です・ます調。絵文字・「！」は使わない。' : '', on.has('len') ? '【長さ】ボタンは6文字以内、エラーは2文・60文字以内。' : '', on.has('rule') ? '【表記】docs/writing-rules.md に従う（例：〜してください、ユーザー）。' : '', on.has('err') ? '【エラー】何が起きたか・なぜか・どうすればいいかを含め、責める言葉は使わない。' : '', on.has('alt') ? '【出し方】それぞれ案を3つ出し、おすすめと理由を1行で。' : ''].filter(Boolean).join('\n'); };
          $$(el, '.ck input').forEach(i => i.onchange = run); $(el, '.cp').onclick = () => VD.copyText($(el, '.out').textContent); run(); },
        desc:'AIに「いい感じの文言にして」と頼むと、無難でぼんやりした言葉になりがちです。<b>誰が・どの場面で</b>読むか、<b>トーン・文字数・表記ルール</b>を渡し、<b>案を複数</b>出させて選ぶと質が上がります。チェックを付けて、頼み方の文章を作ってみましょう。',
        prompt:'このアプリのUXライティングのルール（ボイス、トーン、表記、ボタン・エラー・通知の書き方、文字数の上限）を CLAUDE.md に短くまとめて追記して。今後画面を作るときは、このルールに沿って文言を書くように。' },
    ], null, true),
    S('AIと多言語の用語', [
      T('i18n・l10n', 'Internationalization / localization', 'i18n＝多言語にできる作りにすること。l10n＝実際にある言語・地域に合わせること。'),
      T('文字列の切り出し', 'String externalization', '画面の文言をコードに直接書かず、辞書ファイル（JSON）にまとめる。翻訳・修正がしやすい。', null, ['基本']),
      T('ICUメッセージ形式', 'ICU MessageFormat', '数・性別・選択肢による言い回しの違いを書ける書式。多くの多言語ライブラリが対応。'),
      T('疑似翻訳', 'Pseudo-localization', '文字を長く・記号付きにした仮の翻訳で、崩れや切り出し漏れを見つける方法。'),
      T('翻訳の文脈', 'Translator context', '同じ「Save」でも意味は場面で違う。翻訳する人（AI）に、どの画面のどのボタンかを伝える。'),
      T('右から左の言語', 'RTL', 'アラビア語・ヘブライ語は右から左に書く。レイアウトも反転が必要。'),
      T('地域の書式', 'Locale formats', '日付の順番・小数点・通貨記号は地域で違う。Intl に任せる。'),
      T('AIへのルールの共有', 'Style guide for AI', 'ボイス・トーン・表記ルールを CLAUDE.md などに書き、毎回の指示で使えるようにする。'),
      T('文言のテスト', 'Copy testing', '実際の利用者に読んでもらう・A/Bテストで比べる。作った人の感覚だけで決めない。'),
    ]),
  ]});
})();
