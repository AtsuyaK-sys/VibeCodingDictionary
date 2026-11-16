/* 決済・収益化辞典 — B: 日本の法律とルール / 支払い方法と決済代行 / 決済のセキュリティ / 広告・その他の収益 */
(function(){
const { $, $$, esc, tbl, seg, seq, stepper } = KIT;
const { S, C, T, verdict, sleep, yen, form, lines } = PYH;
const NOTE_LAW = '※この辞典は法律の助言ではありません。実際の表示・届出は、消費者庁などの公式資料と専門家（弁護士・税理士）に確認してください。';

/* ================= 5. 日本の法律とルール ================= */
const TOKU = [['name', '販売業者（事業者名）', '株式会社サンプル', true], ['boss', '運営責任者', '山田 太郎', true], ['addr', '所在地', '', true], ['tel', '電話番号', '', true], ['mail', 'メールアドレス', 'support@example.com', false], ['price', '販売価格', '各商品ページに税込で表示', true], ['extra', '商品代金以外の必要料金', '送料（全国一律550円）、振込手数料', true], ['pay', '支払方法', 'クレジットカード・PayPay・コンビニ払い', true], ['when', '支払時期', 'カード：注文時／コンビニ：注文から3日以内', true], ['deliv', '引渡時期', '入金確認後、3営業日以内に発送', true], ['ret', '返品・キャンセル', '', true]];
const KEIHYO = [['二重価格「通常価格 9,800円 → 4,980円」', '比べる元の価格（通常価格）で<b>実際に相当の期間売っていた</b>なら可。売った実績がない「通常価格」は<b>有利誤認</b>（景品表示法違反）の恐れ。', 'warn'], ['「今だけ半額！」（ずっと半額）', '実際はいつも同じ価格なのに期間限定を装うのは<b>有利誤認</b>。終了日を明記し、本当に終わらせる。', 'bad'], ['「満足度No.1」', '<b>客観的な調査の根拠</b>（調査機関・時期・対象）がないと優良誤認の恐れ。根拠を近くに表示する。', 'warn'], ['インフルエンサーに依頼した投稿（表示なし）', '2023年10月から<b>ステルスマーケティング</b>は景品表示法の規制対象。「#PR」「広告」など、広告と分かるように。', 'bad'], ['「効果には個人差があります」（小さく）', '打消し表示が小さすぎ・遠すぎると、表示全体として誤認させるとされる。<b>はっきり読める大きさ・場所</b>に。', 'warn']];
const INV = [['reg', '発行者の名称と登録番号（T＋13桁）'], ['date', '取引年月日'], ['item', '取引の内容（軽減税率の対象なら、その旨）'], ['rate', '税率ごとに区分した合計額と、適用税率'], ['tax', '税率ごとに区分した消費税額'], ['to', '受け取る事業者の名称（宛名）']];
const LAWS = [['特定商取引法', 'ネット販売（通信販売）の表示義務・最終確認画面・誇大広告の禁止', '「特定商取引法に基づく表記」ページ'], ['景品表示法', 'うその・大げさな表示（優良誤認・有利誤認）、景品の上限、ステマ規制', '価格・No.1・広告の表示'], ['資金決済法', '前払いのポイント・プリペイド、送金', '自社ポイント・チャージ式の残高'], ['消費者契約法', '消費者に一方的に不利な契約条項は無効', '利用規約の免責条項'], ['割賦販売法', 'クレジットカード情報の保護・不正利用対策', 'カード情報の非保持化・3Dセキュア'], ['消費税法（インボイス制度）', '適格請求書の発行', 'BtoBの請求書・領収書'], ['電子帳簿保存法', '電子でやりとりした請求書・領収書の電子保存', 'メールで受け取った請求書の保存'], ['個人情報保護法', '個人情報の取得・利用目的・第三者提供', 'プライバシーポリシー']];

TABS.push({ id:'law', label:'日本の法律とルール', icon:'⚖',
  intro:'日本でお金を受け取るサービスには、守るべきルールがあります。ネット販売の<b>特定商取引法の表記と最終確認画面</b>、うその表示を禁じる<b>景品表示法（ステマ規制を含む）</b>、ポイントや前払い残高の<b>資金決済法</b>、請求書の<b>インボイス制度</b>…。代表的なものを、作る側の目線でまとめます。<br><span style="color:var(--muted);font-size:.92em">' + NOTE_LAW + '</span>',
  sections:[
    C('触って理解する', [
      { name:'特定商取引法に基づく表記を作る', en:'Tokushoho disclosure', h:560, tags:['法律','体験','必須'], wide:true,
        demo:'<div class="kt"><div class="py-two"><div style="overflow:auto"><div class="fm"></div><label style="font-size:11.5px;margin-top:4px"><input type="checkbox" class="pv">個人事業者で、住所・電話は「請求があれば遅滞なく開示」とする</label></div><div class="py-doc dc"></div></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const st = {}; $(el, '.fm').classList.add('py-form'); $(el, '.fm').innerHTML = TOKU.map(([k, l, v]) => (st[k] = v, `<span>${l}</span><input class="kt-in" data-k="${k}" value="${esc(v)}" aria-label="${l}">`)).join('');
          const run = () => { const pv = $(el, '.pv').checked, miss = TOKU.filter(([k, , , req]) => req && !st[k] && !(pv && (k === 'addr' || k === 'tel')));
            $(el, '.dc').innerHTML = `<b>特定商取引法に基づく表記</b><table>${TOKU.map(([k, l]) => { const v = st[k] || (pv && (k === 'addr' || k === 'tel') ? 'ご請求があれば遅滞なく開示いたします' : ''); return `<tr><th>${l}</th><td class="${v ? '' : 'miss'}">${v ? esc(v) : '（未記入）'}</td></tr>`; }).join('')}</table>`;
            verdict($(el, '.res'), miss.length ? 'bad' : 'ok', miss.length ? `未記入：<b>${miss.map(m => m[1]).join('・')}</b>。特に<b>返品・キャンセル</b>の条件（できる・できない、期限、送料の負担）は必ず書く。デジタル商品なら「性質上、購入後の返品はできません」など。` : '✓ 主な項目がそろいました。サイトのフッターなど、<b>どのページからも行ける場所</b>にリンクを置きます。'); };
          $$(el, '.fm input').forEach(i => i.oninput = () => { st[i.dataset.k] = i.value.trim(); run(); }); $(el, '.pv').onchange = run; run(); },
        desc:'ネットで物やサービスを売るなら、<b>特定商取引法</b>で決められた事項（事業者名・住所・電話番号・価格・送料・支払方法と時期・引渡時期・返品やキャンセルの条件など）の表示が必要です。個人事業者は、住所・電話番号を「請求があれば遅滞なく開示する」形にする方法もよく使われます（条件は消費者庁の資料で確認）。',
        prompt:'このサイト（サブスクのWebサービス）の「特定商取引法に基づく表記」ページを作って。必要な項目を一覧にして、デジタルサービスの返品・解約の書き方、個人事業者の場合の住所・電話番号の扱いも説明して。最終的な内容は専門家に確認する前提で下書きを。' },
      { name:'申込みの最終確認画面', en:'Final confirmation screen', h:500, tags:['法律','体験','2022〜'],
        demo:'<div class="kt"><div class="py-two"><div><span class="kt-lbl">表示している項目にチェック</span><div class="cks" style="display:flex;flex-direction:column;gap:3px;font-size:11.5px"></div></div><div class="py-doc pvw" style="flex:1"></div></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const F = [['qty', '分量（数量・回数・期間）', 'スタンダードプラン（1か月ごとの自動更新）'], ['price', '価格（税込）・送料など', '月額 1,078円（税込）'], ['pay', '支払の時期と方法', '本日カード決済、以後毎月◯日に自動決済'], ['deliv', '提供の時期', '決済完了後すぐにご利用いただけます'], ['term', '申込みの期間（ある場合）', 'キャンペーン価格は11月30日まで'], ['cancel', '解約・キャンセルの条件と方法', 'マイページからいつでも解約可。次回更新日の前日までに解約すれば翌月分はかかりません']];
          $(el, '.cks').innerHTML = F.map(([k, l], i) => `<label><input type="checkbox" data-i="${i}"${i < 3 ? ' checked' : ''}> ${l}</label>`).join('');
          const run = () => { const on = $$(el, '.cks input').map(i => i.checked); $(el, '.pvw').innerHTML = `<b>ご注文内容の確認</b><table>${F.map(([, l, v], i) => on[i] ? `<tr><th>${l}</th><td>${v}</td></tr>` : '').join('')}</table><div style="text-align:center;margin-top:8px"><span class="kt-btn pri">この内容で申し込む</span></div>`;
            const miss = F.filter((f, i) => !on[i] && f[0] !== 'term'); verdict($(el, '.res'), miss.length ? 'bad' : 'ok', miss.length ? `不足：<b>${miss.map(m => m[1]).join('・')}</b>。<br>2022年6月施行の改正特定商取引法で、通信販売の<b>最終確認画面</b>にこれらを表示する義務ができました。定期購入なのに「お試し」だけを強調する表示などは禁止。` : '✓ 申込みボタンの直前で、契約の大事な条件がひと目で分かります。'); };
          $$(el, '.cks input').forEach(i => i.onchange = run); run(); },
        desc:'2022年6月の改正特定商取引法で、ネットの申込みの<b>最終確認画面</b>に、分量・価格・支払の時期と方法・提供の時期・申込期間・<b>解約やキャンセルの条件</b>を表示することが義務になりました。「初回だけ安い定期購入」を分かりにくくするような表示は禁止です。',
        prompt:'サブスクの申込みの最終確認画面を作って。プラン名・更新の周期・税込の金額・初回と2回目以降の金額の違い・決済日・解約方法と期限を、申込みボタンの直前にまとめて表示し、利用規約と特商法の表記へのリンクも置いて。' },
      { name:'その表示、大丈夫？（景品表示法）', en:'Misleading representations', h:420, tags:['法律','体験','広告'],
        demo:'<div class="kt"><span class="sw"></span><div class="kt-verdict res kt-grow"></div></div>',
        init:(el) => { $(el, '.sw').replaceWith(seg(KEIHYO.map((k, i) => ['二重価格', '今だけ', 'No.1', 'ステマ', '打消し表示'][i]), i => { const [ex, msg, cls] = KEIHYO[i]; verdict($(el, '.res'), cls, `<b>例：${ex}</b><br><br>${msg}`); }).el); },
        desc:'<b>景品表示法</b>は、実際より良く見せる表示（優良誤認）・お得に見せる表示（有利誤認）を禁じています。架空の「通常価格」、終わらない「今だけ」、根拠のない「No.1」はよくある違反例。2023年10月からは<b>ステルスマーケティング</b>（広告だと隠した宣伝）も規制対象になりました。',
        prompt:'このLPの文言を景品表示法の観点でチェックして。二重価格・期間限定・No.1・効果の表現・インフルエンサーの紹介文について、問題になりそうな箇所と、言い換えの案を出して（最終判断は専門家に確認する前提で）。' },
      { name:'ポイント・前払い残高のルール', en:'Prepaid payment instruments', h:420, tags:['法律','体験'],
        demo:'<div class="kt"><div class="fm"></div><div class="py-big bg"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { form($(el, '.fm'), [['issued', 'お金で買ったポイントの発行額（円）', 15000000], ['used', 'そのうち使われた額（円）', 3000000], ['months', '有効期限（か月）', 12]], (st) => { const left = Math.max(0, st.issued - st.used), over = left > 1e7, short = st.months > 0 && st.months <= 6;
            $(el, '.bg').innerHTML = `<div><small>基準日（3月末・9月末）の未使用残高</small><b>${yen(left)}</b></div><div><small>供託などが必要な額の目安（半分以上）</small><b>${over && !short ? yen(left / 2) : '—'}</b></div>`;
            verdict($(el, '.res'), short ? 'ok' : over ? 'bad' : 'warn', short ? '有効期限が<b>6か月以内</b>のものは、資金決済法の前払式支払手段の規制の対象外とされています。' : over ? `未使用残高が<b>1,000万円を超えている</b>ので、自社で使うポイント（自家型）でも<b>届出</b>と、残高の<b>半分以上の供託など</b>（発行保証金）が必要になります。` : '今は1,000万円以下ですが、<b>基準日の未使用残高</b>を毎回確認しましょう。<b>無料でもらったポイント</b>（おまけ）は対象外ですが、混ぜて管理すると分からなくなります。'); }); },
        desc:'<b>お金で買うポイント・チャージ式の残高・プリペイドカード</b>は、資金決済法の「前払式支払手段」に当たります。自社だけで使えるもの（自家型）でも、基準日（3月末・9月末）の未使用残高が<b>1,000万円を超える</b>と届出や供託などが必要に。<b>無料でもらうポイント</b>（購入のおまけ）は通常は対象外です。',
        prompt:'アプリ内で「お金でコインを買って、コンテンツを買う」仕組みを作りたい。資金決済法の前払式支払手段に当たるか、届出や供託が必要になる条件、有料コインと無料コインを分けて管理するデータ設計を教えて（専門家に確認する前提で）。' },
      { name:'インボイス（適格請求書）の項目', en:'Qualified invoice', h:480, tags:['税','体験','BtoB'],
        demo:'<div class="kt"><div class="py-two"><div><span class="kt-lbl">入っている項目にチェック</span><div class="cks" style="display:flex;flex-direction:column;gap:3px;font-size:11.5px"></div></div><div class="py-rcpt rc"></div></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.cks').innerHTML = INV.map(([k, l]) => `<label><input type="checkbox" data-k="${k}"${k !== 'reg' && k !== 'tax' ? ' checked' : ''}> ${l}</label>`).join('');
          const run = () => { const on = {}; $$(el, '.cks input').forEach(i => on[i.dataset.k] = i.checked); const m = (k, html) => on[k] ? html : `<span class="miss">${html.replace(/<[^>]+>/g, '')}（なし）</span>`;
            $(el, '.rc').innerHTML = `<div class="c">請求書</div>${m('to', '株式会社クライアント 御中')}<hr><div>${m('reg', '株式会社サンプル　登録番号 T1234567890123')}</div><div>${m('date', '取引日：2026年10月27日')}</div><hr><div class="r"><span>${m('item', 'Webサイト制作')}</span><span>110,000</span></div><div class="r"><span>${m('item', 'コーヒー豆 ※')}</span><span>2,160</span></div><hr><div class="r"><span>${m('rate', '10%対象 100,000円')}</span><span>${m('tax', '消費税 10,000円')}</span></div><div class="r"><span>${m('rate', '8%対象 2,000円')}</span><span>${m('tax', '消費税 160円')}</span></div><div class="r" style="font-weight:800"><span>合計</span><span>112,160円</span></div><div style="font-size:10px">※は軽減税率の対象</div>`;
            const miss = INV.filter(([k]) => !on[k]); verdict($(el, '.res'), miss.length ? 'bad' : 'ok', miss.length ? `不足：<b>${miss.map(x => x[1]).join('・')}</b>。これがないと、受け取った会社が消費税を差し引けません（仕入税額控除）。` : '✓ 適格請求書の6つの項目がそろっています。レジのレシートなど（適格簡易請求書）は宛名などを省略できます。'); };
          $$(el, '.cks input').forEach(i => i.onchange = run); run(); },
        desc:'2023年10月から始まった<b>インボイス制度</b>では、買い手の会社が消費税を差し引く（仕入税額控除）ために、<b>登録番号など6つの項目</b>が入った「適格請求書」が必要です。BtoB のサービスでは、請求書・領収書のPDFをこの形で出せるようにしましょう。Stripe の請求書にも登録番号を設定できます。',
        prompt:'BtoB向けSaaSの請求書PDFを、インボイス（適格請求書）の要件を満たす形で自動発行して。登録番号・取引日・内容・税率ごとの合計と税額（端数処理は税率ごとに1回）・宛名を入れ、Stripe の請求書の設定でも登録番号と宛名を出せるようにして。' },
    ], null, true),
    { title:'お金を扱うサービスに関係する主な法律', note:NOTE_LAW,
      table:{ head:['法律', '主な内容', '作る側で関係するところ'], rows:LAWS } },
    S('法律とルールの用語', [
      T('特定商取引法（特商法）', 'Act on Specified Commercial Transactions', '通信販売などのルール。表示義務・誇大広告の禁止・最終確認画面の表示。', null, ['必須']),
      T('返品特約', 'Return policy', '通信販売の返品の条件を表示していないと、商品到着から8日間は返品できる（送料は購入者負担）とされる。表示しておくことが大事。'),
      T('景品表示法（景表法）', 'Act against Unjustifiable Premiums and Misleading Representations', 'うそ・大げさな表示と、過大な景品を禁止。'),
      T('ステマ規制', 'Stealth marketing regulation', '2023年10月から。事業者の広告なのに、それを隠した表示は違反。「#PR」「広告」と明示。', null, ['2023〜']),
      T('総額表示', 'Tax-inclusive display', '消費者向けの価格は税込で表示する義務（消費税法）。'),
      T('前払式支払手段', 'Prepaid payment instruments', '前払いのポイント・残高・プリペイドカード。資金決済法の対象。'),
      T('適格請求書（インボイス）', 'Qualified invoice', '登録番号などが入った請求書。発行するには税務署への登録が必要。'),
      T('電子帳簿保存法', 'Electronic Books Maintenance Act', 'メール・Webで受け取った請求書・領収書は、電子データのまま決まった方法で保存する。'),
      T('消費者契約法', 'Consumer Contract Act', '「当社は一切責任を負いません」のような、消費者に一方的に不利な条項は無効になりうる。', null, ['注意']),
      T('利用規約', 'Terms of service', 'サービスのルール。決済・解約・返金・禁止事項を明記し、同意を得る。'),
      T('プライバシーポリシー', 'Privacy policy', '集める情報と使い道。決済サービスへの提供も書く。'),
    ]),
  ]});

/* ================= 6. 支払い方法と決済代行 ================= */
const METHODS = [['クレジットカード', '★', '世界中で使える基本', 'ほぼ全員', 0], ['Apple Pay / Google Pay', '★', 'スマホでワンタップ。入力が少なく離脱が減る', 'スマホの人', 0], ['PayPay など QRコード決済', '★★', '日本で利用者が多い。若い人・カードを使わない人', '若い人・カードなし', 1], ['コンビニ払い', '★★', '後から店頭で払う。入金確認まで時間がかかる', 'カードなし・高齢', 2], ['銀行振込', '★★', '高額・BtoB。入金の確認・照合の手間', '会社・高額', 3], ['後払い（Paidy など）', '★★', '商品が届いてから払える。未回収のリスクは事業者側が持つ', '若い人・初めての店', 1], ['キャリア決済', '★★', '携帯料金とまとめて払う', 'カードなし', 1], ['請求書払い（掛け払い）', '★★★', '月末締め・翌月末払いなど。与信の確認が必要', '会社（BtoB）', 3]];
const PROVIDERS = [['Stripe', '開発者向けの定番。API・資料・テスト環境が充実。サブスク・請求書も', 'Webサービス・SaaS'], ['PAY.JP', '日本発のシンプルな決済API', '国内のWebサービス'], ['KOMOJU', 'コンビニ払い・PayPay など日本の支払い方法が豊富', 'ゲーム・デジタルコンテンツ'], ['Square', '店舗のレジとネット販売をまとめられる', 'お店＋ネット'], ['GMOペイメントゲートウェイ / SBペイメントサービス など', '大手の決済代行。審査・契約がしっかり', '中〜大規模のEC'], ['PayPal', '海外の利用者が多い', '海外向け'], ['Shopify Payments', 'Shopify のネットショップに組み込み', 'Shopify で作るEC'], ['Paddle / Lemon Squeezy（MoR）', '<b>販売代理（MoR）</b>として、世界の税金・請求書・返金対応まで引き受ける。手数料は高め', '海外に売るソフト・SaaS']];

TABS.push({ id:'methods', label:'支払い方法', icon:'🏦',
  intro:'お客さまが<b>使いたい支払い方法がない</b>と、そこで購入をやめてしまいます。カードに加えて、日本では <b>PayPay・コンビニ払い・後払い</b>なども人気。どの決済代行サービスを選ぶかで、使える支払い方法・手数料・入金のタイミング・審査が変わります。',
  sections:[
    C('触って理解する', [
      { name:'お客さまに合う支払い方法', en:'Choosing payment methods', h:480, tags:['判断','体験'],
        demo:'<div class="kt"><span class="kt-lbl">お客さまの特徴（複数選べる）</span><div class="cks" style="display:flex;flex-wrap:wrap;gap:4px 12px;font-size:11.5px"></div><div class="py-risk ls kt-grow"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const A = [['young', '10〜20代が多い'], ['nocard', 'カードを持たない人も多い'], ['biz', '会社（BtoB）'], ['high', '高額（数万円〜）'], ['mobile', 'ほとんどスマホから']];
          $(el, '.cks').innerHTML = A.map(([k, l]) => `<label><input type="checkbox" data-k="${k}">${l}</label>`).join('');
          const run = () => { const s = {}; $$(el, '.cks input').forEach(i => s[i.dataset.k] = i.checked);
            const score = (m) => { const n = m[0]; let v = n === 'クレジットカード' ? 5 : 1; if (s.young && /PayPay|後払い|キャリア/.test(n)) v += 3; if (s.nocard && /PayPay|コンビニ|後払い|キャリア/.test(n)) v += 3; if (s.biz && /銀行振込|請求書/.test(n)) v += 4; if (s.biz && /PayPay|キャリア|コンビニ/.test(n)) v -= 2; if (s.high && /銀行振込|後払い/.test(n)) v += 2; if (s.mobile && /Apple Pay|PayPay/.test(n)) v += 3; return v; };
            const r = METHODS.map(m => [m, score(m)]).sort((a, b) => b[1] - a[1]);
            $(el, '.ls').innerHTML = r.map(([m, v], i) => `<span>${i < 3 ? '⭐ ' : ''}<b>${m[0]}</b><br><span style="color:var(--muted)">${m[2]}</span></span><span>${i < 3 ? '<span class="kt-badge ok">おすすめ</span>' : ''}</span>`).join('');
            verdict($(el, '.res'), '', `まずは <b>${r.slice(0, 3).map(x => x[0][0]).join('・')}</b>。支払い方法が多すぎると迷うので、<b>3〜4個</b>に絞って、よく使われる順に並べましょう。`); };
          $$(el, '.cks input').forEach(i => i.onchange = run); run(); },
        desc:'支払い方法は<b>お客さまに合わせて</b>選びます。若い人やカードを持たない人が多ければ PayPay・コンビニ・後払い、会社向けなら銀行振込・請求書払い、スマホ中心なら Apple Pay / Google Pay。ただし多すぎると迷うので、<b>3〜4個に絞る</b>のがコツです。',
        prompt:'このECサイトの客層（20代中心・スマホ9割）に合わせて、支払い方法を見直して。Stripe で使える支払い方法（カード・Apple Pay・Google Pay・PayPay・コンビニ）を有効にし、支払い画面ではよく使われる順に表示して。コンビニ払いは入金確認まで発送を待つ処理も入れて。' },
      { name:'自分で売るか、販売代理（MoR）か', en:'Merchant of Record', h:450, tags:['比較','体験','海外'],
        demo:'<div class="kt"><span class="sw"></span><div class="tb kt-tblwrap kt-grow"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const R = [['売り手（契約の相手）', '自分', '販売代理の会社'], ['消費税・海外の税金（VAT など）の計算と納付', '自分でする', '<b>代わりにやってくれる</b>'], ['請求書・領収書', '自分で発行', '代わりに発行'], ['返金・チャージバックの対応', '自分', '代わりに対応'], ['手数料', '低め（例：Stripe 国内カード3.6%）', '<b>高め</b>（税の手間を含むため）'], ['お客さまとの関係', '直接', '画面や明細に代理の会社名が出る']];
          $(el, '.sw').remove(); $(el, '.tb').innerHTML = tbl(['', '自分で販売（Stripe など）', '販売代理（Paddle など）'], R.map(r => r.map(x => x.replace(/<[^>]+>/g, '')))); verdict($(el, '.res'), '', '国内だけで売るなら<b>自分で販売</b>で十分。<b>世界中に売るソフト・SaaS</b>で、各国の税金の手続きを任せたいなら<b>販売代理（MoR）</b>が楽。'); },
        desc:'決済サービスには、<b>自分が売り手になって決済だけ任せる</b>もの（Stripe など）と、<b>販売代理（MoR）として売り手ごと引き受ける</b>もの（Paddle・Lemon Squeezy など）があります。MoR は海外の税金や請求書まで任せられる代わりに、手数料は高め。どこに売るかで選びましょう。',
        prompt:'個人開発のSaaSを日本と海外に売りたい。Stripe（＋Stripe Tax）で自分で販売する場合と、Paddle や Lemon Squeezy の販売代理（MoR）を使う場合を、手数料・税金の手続き・請求書・返金対応・日本の確定申告への影響で比較して（最新の公式情報で）。' },
    ], null, true),
    { title:'支払い方法の一覧', note:'支払い方法ごとに<b>手数料・入金までの日数・返金の方法</b>が違います。コンビニ払い・銀行振込は「入金されるまで発送しない」処理が必要です。',
      table:{ head:['支払い方法', '導入の手間', '特徴', '合うお客さま'], rows:METHODS.map(m => m.slice(0, 4)) } },
    { title:'主な決済代行サービス', note:'料率・入金サイクル・審査の条件は<b>サービスと契約内容で変わる</b>ので、各公式で確認してください。',
      table:{ head:['サービス', '特徴', '向いている'], rows:PROVIDERS } },
    S('支払い方法と決済代行の用語', [
      T('決済代行', 'Payment service provider', 'カード会社などとの契約をまとめて代行するサービス。1つの契約で複数の支払い方法が使える。'),
      T('加盟店審査', 'Merchant review', '決済サービスを使う前の審査。売る商品・特商法の表記・サイトの内容を見られる。', null, ['注意']),
      T('入金サイクル', 'Payout schedule', '売上が口座に入るタイミング。週1回・月1〜2回など。資金繰りに影響する。'),
      T('MoR（販売代理）', 'Merchant of Record', '契約上の売り手を代わりに引き受け、税金・請求・返金まで対応するサービス。'),
      T('ウォレット決済', 'Wallets', 'Apple Pay・Google Pay など。カード番号を入れずに払える。'),
      T('コード決済', 'QR code payments', 'PayPay・楽天ペイなど。日本で利用者が多い。'),
      T('後払い', 'Buy now, pay later', '商品を受け取ってから払う。未回収のリスクを決済会社が引き受ける形が多い。'),
      T('与信', 'Credit check', '後払い・掛け払いで、相手が払えるかを確認すること。'),
      T('売上の照合', 'Reconciliation', '入金と注文を突き合わせること。銀行振込は振込名義の違いで手間がかかる。'),
      T('返金の方法', 'Refund methods', 'カードは取り消しで返金、コンビニ払いは口座を聞いて振込…など方法が違う。'),
    ]),
  ]});

/* ================= 7. 決済のセキュリティ ================= */
const ORDERS = [['A-101', 4980, '東京', '東京', 1, 'JP', 0], ['A-102', 128000, '大阪', '沖縄', 1, 'JP', 0], ['A-103', 39800, '東京', '東京', 5, 'JP', 1], ['A-104', 2980, '福岡', '福岡', 1, 'JP', 0], ['A-105', 89800, '北海道', '海外の転送業者', 3, 'XX', 1], ['A-106', 15800, '愛知', '愛知', 1, 'JP', 0]];

TABS.push({ id:'security', label:'決済のセキュリティ', icon:'🔒',
  intro:'決済で一番大事なのは、<b>カード番号を自分のサーバーで扱わない</b>こと（非保持化）。そして<b>金額は必ずサーバーで決める</b>、<b>3Dセキュアで本人確認</b>、<b>不正な注文に気づく</b>。日本では、ネットショップは2025年3月末までに EMV 3-Dセキュアを導入することが原則とされました。',
  sections:[
    C('触って理解する', [
      { name:'カード番号はどこを通る？', en:'Card data non-retention', h:440, tags:['セキュリティ','体験','最重要'],
        demo:'<div class="kt"><span class="sw"></span><div class="kt-flow fl kt-grow" style="align-content:center"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.sw').replaceWith(seg(['自分のサーバーを通す（NG）', '決済サービスの部品で入力（OK）'], i => {
            $(el, '.fl').innerHTML = i ? '<div class="kt-box">🧑 お客さま<small>カード番号を入力</small></div><span class="kt-arrow">→</span><div class="kt-box ok">💳 決済サービス<small>Stripe の部品・画面</small></div><span class="kt-arrow">→ トークンだけ</span><div class="kt-box">🖥 自分のサーバー<small>番号は見えない</small></div>' : '<div class="kt-box">🧑 お客さま<small>カード番号を入力</small></div><span class="kt-arrow">→ 番号そのもの</span><div class="kt-box bad">🖥 自分のサーバー<small>番号が通る・ログに残る</small></div><span class="kt-arrow">→</span><div class="kt-box">💳 決済サービス</div>';
            verdict($(el, '.res'), i ? 'ok' : 'bad', i ? '✓ カード番号は<b>決済サービスに直接</b>送られ、自分のサーバーには使い捨ての印（トークン）だけが来る。これが<b>非保持化</b>。日本の EC では原則として求められます。' : '❌ 自分のサーバーにカード番号が通ると、<b>PCI DSS</b> という厳しい基準を満たす必要があり、漏れたときの責任も重大。ログやエラー通知に番号が残る事故も多い。'); }).el); },
        desc:'カード番号を<b>自分のサーバーに通さない・保存しない</b>（非保持化）のが今の基本です。Stripe Checkout や Payment Element のように、<b>決済サービスの画面や部品</b>で入力してもらえば、番号は決済サービスに直接送られ、自分のところには「トークン」という使い捨ての印だけが届きます。',
        prompt:'このサイトの決済フォームで、カード番号が自分のサーバーを通っていないか確認して。もし通っていたら、Stripe の Payment Element（または Checkout）に置き換え、サーバーのログ・エラー監視（Sentry など）にカード情報が残らないことも確かめて。' },
      { name:'3Dセキュア（本人確認）', en:'EMV 3-D Secure', h:480, tags:['セキュリティ','体験'],
        init:(el) => seq(el, { actors:[{ label:'お客さま', icon:'🧑' }, { label:'ショップ（決済サービス）', icon:'🛒' }, { label:'カード会社', icon:'🏦' }], steps:[
          { f:0, t:1, label:'カード情報を入力して購入', note:'見た目はいつもの購入と同じ。' },
          { f:1, t:2, label:'端末・購入の情報を送ってリスク判定', note:'EMV 3-Dセキュアは、端末・購入履歴などの<b>多くの情報</b>でリスクを判定する。' },
          { f:2, t:1, label:'低リスク → そのまま承認', dash:true, good:true, note:'多くの購入は<b>追加の操作なし</b>で通る（フリクションレス）。' },
          { f:2, t:0, label:'高リスク → 本人確認（パスワード・アプリ）', note:'怪しいときだけ、カード会社の画面やアプリで本人確認をお願いする。' },
          { f:0, t:2, label:'本人確認OK' },
          { f:2, t:1, label:'承認', dash:true, good:true, note:'本人確認を通った取引で不正利用があっても、<b>ショップの負担になりにくい</b>（責任の移転）。日本の EC は2025年3月末までに導入が原則とされた。' },
        ] }),
        desc:'<b>3Dセキュア</b>は、カード会社が「本当に本人か」を確認する仕組み。今の <b>EMV 3-Dセキュア</b>は、怪しい取引のときだけ追加の本人確認を求めるので、多くのお客さまは手間が増えません。日本のクレジットカード・セキュリティガイドラインで、<b>EC加盟店は2025年3月末までに導入</b>が原則とされました。Stripe などは自動で対応します。',
        prompt:'このECサイトで EMV 3-Dセキュアが有効になっているか確認して。Stripe の場合、Radar のルールや payment_method_options で3Dセキュアの扱いを確認し、本人確認の画面が出たときと失敗したときの表示を、テストカードで試せるようにして。' },
      { name:'金額は必ずサーバーで決める', en:'Never trust client prices', h:430, tags:['セキュリティ','体験','よくある失敗'],
        demo:'<div class="kt"><label class="kt-row" style="font-size:11.5px"><input type="checkbox" class="sv">サーバーで商品IDから価格を調べ直す</label><div class="kt-code cd" style="white-space:pre"></div><div class="kt-row"><button type="button" class="kt-btn bad go">金額を1円に書き換えて送信</button></div><div class="kt-verdict res kt-grow"></div></div>',
        init:(el) => { const run = () => { const sv = $(el, '.sv').checked; $(el, '.cd').textContent = `POST /api/checkout\n{ "productId": "bag-01", "price": 1 }   ← ブラウザから送られた値\n\n// サーバー\n${sv ? 'const product = await db.products.find(body.productId);\nconst amount = product.price;   // 49800（DBの正しい価格）' : 'const amount = body.price;      // ❌ 送られてきた金額をそのまま使う'}`; };
          $(el, '.sv').onchange = run; $(el, '.go').onclick = () => { const sv = $(el, '.sv').checked; verdict($(el, '.res'), sv ? 'ok' : 'bad', sv ? '✓ 送られた price は無視して、<b>DBの価格（49,800円）</b>で請求。書き換えは効きません。' : '❌ <b>1円で4万9,800円のバッグが買えてしまいました</b>。ブラウザから送られる値は、誰でも自由に書き換えられます。'); }; run(); },
        desc:'ブラウザから送られてくる値は、<b>開発者ツールで誰でも書き換えられます</b>。金額・割引率・送料・数量の上限などをブラウザから受け取ってそのまま使うと、1円で買われてしまいます。サーバーは<b>商品IDだけ</b>を受け取り、<b>価格はDBから</b>調べ直すのが鉄則です。',
        prompt:'このECサイトの決済処理で、ブラウザから送られた金額・割引・送料を信じている箇所を探して、すべてサーバー側でDBの値から計算し直すように直して。クーポンの有効性・在庫数・購入数の上限もサーバーで確認して。' },
      { name:'怪しい注文に気づく', en:'Fraud signals', h:470, tags:['不正対策','体験'],
        demo:'<div class="kt"><div class="kt-row"><span class="kt-lbl">保留にするリスクの下限</span><input type="range" min="1" max="6" value="3" class="th" style="flex:1" aria-label="しきい値"><b class="kt-mono tv"></b></div><div class="py-risk ls kt-grow"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const run = () => { const th = +$(el, '.th').value; $(el, '.tv').textContent = th + '点'; let held = 0;
            $(el, '.ls').innerHTML = ORDERS.map(([id, amt, bill, ship, cards, ip, newAcc]) => { const sig = []; if (amt >= 50000) sig.push('高額'); if (bill !== ship) sig.push('請求先と届け先が違う'); if (cards > 1) sig.push(`短時間に${cards}枚のカードを試した`); if (ip !== 'JP') sig.push('海外からのアクセス'); if (newAcc) sig.push('作ったばかりのアカウント'); if (/転送/.test(ship)) sig.push('転送業者の住所'); const sc = sig.length, h = sc >= th; if (h) held++;
              return `<span><b>${id}</b> ${yen(amt)}<br><span style="color:var(--muted);font-size:10.5px">${sig.join('・') || 'とくになし'}</span></span><span>${h ? '<span class="kt-badge bad">保留して確認</span>' : '<span class="kt-badge ok">発送</span>'} <b class="kt-mono">${sc}点</b></span>`; }).join('');
            verdict($(el, '.res'), '', `保留 <b>${held}件</b>。下限を下げるほど不正は減るが、<b>普通のお客さまも待たせる</b>。Stripe Radar などは、機械学習でこうした判定を自動で行います。転売されやすい高額品・ゲーム内通貨・ギフトカードは特に狙われます。`); };
          $(el, '.th').oninput = run; run(); },
        desc:'盗まれたカードによる不正な注文には、<b>高額・請求先と届け先が違う・短時間に何枚もカードを試す・海外から・作ったばかりのアカウント</b>などの兆候があります。点数を付けて、高いものは<b>発送前に保留して確認</b>。不正に使われると、売上の取り消し（チャージバック）と商品の両方を失います。',
        prompt:'ECの注文に不正リスクの判定を入れて。Stripe Radar の結果（risk_level）に加えて、届け先と請求先の違い・同じ端末からのカードの失敗回数・アカウント作成からの時間で点数を付け、一定以上は「確認待ち」にして管理画面に表示、発送を止めるようにして。' },
      { name:'チャージバックの流れ', en:'Chargebacks', h:420, tags:['不正対策'],
        init:(el) => stepper(el, ['<b>カードの持ち主が「身に覚えがない」と申し出る</b><br>カード会社が支払いを取り消す手続きを始める。', '<b>売上が差し戻される</b><br>決済サービスから通知。売上が引かれ、手数料がかかることも。', '<b>証拠を出す（反論）</b><br>注文日時・配送の記録（追跡番号・受け取りのサイン）・利用ログ・やりとりのメールなど。期限がある。', '<b>カード会社が判断</b><br>認められれば売上が戻る。3Dセキュアを通った取引は有利になりやすい。', '<b>再発防止</b><br>不正の兆候の判定・3Dセキュア・高額品の確認を強化。チャージバックが多いと決済サービスを使えなくなることも。'], { title:'チャージバックが起きたら' }),
        desc:'<b>チャージバック</b>は、カードの持ち主の申し出で、売上が取り消されること。不正利用だと、<b>商品も売上も失う</b>のはショップ側です。反論には配送や利用の<b>記録</b>が必要なので、日頃から残しておきましょう。多すぎると決済サービスの契約に影響します。',
        prompt:'チャージバックに備えて、注文ごとに証拠となる記録（IPアドレス・端末情報・配送の追跡番号・受け取り確認・利用ログ・メールのやりとり）を保存する仕組みを作って。Stripe の dispute の Webhook を受けたら、管理画面に通知して証拠をまとめて提出できるように。' },
    ], null, true),
    S('決済のセキュリティ用語', [
      T('非保持化', 'Card data non-retention', 'カード番号を自分のサーバーで扱わない・保存しないこと。日本のECでは原則。', null, ['最重要']),
      T('トークン化', 'Tokenization', 'カード番号を、使い捨ての別の文字列（トークン）に置き換えて扱う。'),
      T('PCI DSS', 'PCI DSS', 'カード情報を扱う事業者のための国際的なセキュリティ基準。自分でカード情報を扱うなら必須。'),
      T('クレジットカード・セキュリティガイドライン', 'Credit Card Security Guidelines (Japan)', '日本の業界の指針。非保持化・3Dセキュア・脆弱性対策などを求める。'),
      T('EMV 3-Dセキュア', 'EMV 3-D Secure', 'リスクに応じて本人確認する仕組み。日本のECは2025年3月末までに導入が原則。'),
      T('チャージバック', 'Chargeback', 'カードの持ち主の申し出による売上の取り消し。'),
      T('カードテスティング', 'Card testing', '盗んだカード番号が使えるか、少額決済で大量に試す攻撃。CAPTCHA・回数制限・Radar で防ぐ。', null, ['注意']),
      T('Stripe Radar', 'Radar', 'Stripe の不正検知。機械学習で怪しい取引を止める。ルールを追加できる。'),
      T('金額の改ざん', 'Price tampering', 'ブラウザから送る金額を書き換える攻撃。サーバーで価格を決めれば防げる。'),
      T('Webhook の署名', 'Webhook signatures', '決済の通知が本物かを確かめる。偽の「支払い完了」で商品を取られないために。（自動化辞典）'),
      T('脆弱性対策', 'Vulnerability management', 'ECサイトの管理画面への不正ログイン・改ざんで、カード情報を盗まれる事件が多い。管理画面の保護・更新・診断を。'),
    ]),
  ]});

/* ================= 8. 広告・その他の収益 ================= */
const OTHERS = [['広告（AdSense など）', 'ページの表示・クリックで収益', '大量のPVが必要。体験と表示速度に影響'], ['アフィリエイト', '紹介した商品が売れたら報酬', '<b>広告である表示（#PR）</b>が必要。信頼が大事'], ['投げ銭・応援', '読者・視聴者からの少額の支援', '熱心なファンがいると強い'], ['クラウドファンディング', '作る前に支援を集める', '目標額・リターンの設計。手数料に注意'], ['スポンサー', '企業から定額の支援', '読者層とスポンサーの相性'], ['有料記事・有料コミュニティ', 'note・Discord などで有料にする', 'プラットフォームの手数料'], ['寄付（GitHub Sponsors など）', 'オープンソースの支援', '安定はしにくい'], ['データ・API の販売', '集めた・作ったデータを売る', '権利と個人情報に注意']];

TABS.push({ id:'ads', label:'広告・その他', icon:'📣',
  intro:'自分で決済を作らなくても、<b>広告・アフィリエイト・投げ銭・クラウドファンディング</b>などで収益を得る方法があります。ただし広告は<b>体験と表示速度</b>を損ねやすく、アフィリエイトは<b>広告であることの表示</b>（ステマ規制）が必須です。',
  sections:[
    C('触って理解する', [
      { name:'広告とアフィリエイトの収益計算', en:'Ad & affiliate revenue', h:470, tags:['計算','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="fm"></div><div class="py-big bg"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let k = 0, st = null; const box = $(el, '.fm');
          const F = [[['pv', '1か月のページビュー', 100000], ['rpm', '1,000PVあたりの収益（円）', 300]], [['pv', '1か月のページビュー', 100000], ['ctr', 'リンクのクリック率（%）', 1.5], ['cvr', '購入率（%）', 3], ['price', '商品の価格（円）', 5000], ['rate', '報酬率（%）', 4]]];
          const run = (s) => { st = s; if (k === 0){ const r = s.pv / 1000 * s.rpm; $(el, '.bg').innerHTML = `<div><small>1か月の広告収益</small><b>${yen(r)}</b></div><div><small>1万円に必要なPV</small><b>${Math.round(10000 / Math.max(1, s.rpm) * 1000).toLocaleString()}</b></div>`; verdict($(el, '.res'), '', '広告は<b>大量のPV</b>があって初めて大きくなります。RPM（1,000PVあたり）はジャンル・季節・国で大きく変わります。'); }
            else { const clicks = s.pv * s.ctr / 100, buys = clicks * s.cvr / 100, r = buys * s.price * s.rate / 100; $(el, '.bg').innerHTML = `<div><small>クリック</small><b>${Math.round(clicks).toLocaleString()}</b></div><div><small>購入</small><b>${Math.round(buys).toLocaleString()}件</b></div><div><small>報酬</small><b>${yen(r)}</b></div>`; verdict($(el, '.res'), '', 'アフィリエイトは<b>読者の役に立つ紹介</b>かどうかでクリック率と購入率が大きく変わります。紹介する記事には<b>「広告」「PR」</b>の表示を。'); } };
          $(el, '.sw').replaceWith(seg(['広告（表示型）', 'アフィリエイト'], i => { k = i; form(box, F[i], run); }).el); },
        desc:'表示型の広告は「<b>PV ÷ 1000 × RPM</b>」、アフィリエイトは「<b>PV × クリック率 × 購入率 × 価格 × 報酬率</b>」で見積もれます。どちらも数字は分野で大きく変わりますが、<b>1万PVでは大きな収益にならない</b>ことが多い、という感覚を持っておくと計画が立てやすくなります。',
        prompt:'このブログ（月10万PV・ガジェット系）の収益を、表示型広告とアフィリエイトでそれぞれ試算して。仮の数字（RPM・クリック率・購入率・報酬率）を明示した上で、収益を増やすために記事・導線で改善できる点を提案して。' },
      { name:'アフィリエイトの仕組みと表示', en:'Affiliate flow & disclosure', h:480, tags:['仕組み','法律'],
        init:(el) => seq(el, { actors:[{ label:'読者', icon:'🧑' }, { label:'あなたの記事', icon:'📝' }, { label:'ASP', icon:'🔗' }, { label:'ショップ', icon:'🛒' }], steps:[
          { f:1, t:0, label:'「PR」表示のある紹介記事', good:true, note:'2023年10月から、広告なのに広告と分からない表示（ステマ）は景品表示法違反。<b>記事の冒頭など分かる場所に「広告」「PR」</b>。' },
          { f:0, t:2, label:'紹介リンクをクリック（ID付き）', note:'リンクには、紹介した人を表す ID が入っている。' },
          { f:2, t:3, label:'ショップへ移動（記録）', note:'ASP（アフィリエイトの仲介会社）が、誰の紹介で来たかを記録する。' },
          { f:0, t:3, label:'購入', note:'一定期間内に買われると成果になる（期間はプログラムごと）。' },
          { f:3, t:2, label:'成果を報告', dash:true },
          { f:2, t:1, label:'報酬（確定後に支払い）', dash:true, good:true, note:'キャンセル・返品が除かれてから確定。支払いは数か月後のことも。' },
        ] }),
        desc:'アフィリエイトは、<b>紹介した商品が売れたら報酬</b>がもらえる仕組み。仲介する <b>ASP</b> が、誰の紹介で売れたかを記録します。報酬をもらう紹介は<b>広告</b>なので、記事に「広告」「PR」と<b>分かるように表示</b>する必要があります（ステマ規制）。',
        prompt:'ブログの記事テンプレートに、アフィリエイトリンクを含む記事では冒頭に「本記事はプロモーションを含みます」の表示を自動で入れる仕組みを作って。リンクには rel="sponsored" を付け、比較表の書き方は景品表示法に配慮して。' },
      { name:'広告の入れすぎ', en:'Ad density & UX', h:430, tags:['UX','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="py-page pg"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.sw').replaceWith(seg(['入れすぎ', 'ほどほど'], i => { const ad = (h) => `<div class="ad" style="min-height:${h}px">広告</div>`, tx = '<div class="tx"></div><div class="tx"></div><div class="tx" style="width:80%"></div>';
            $(el, '.pg').innerHTML = i ? `<div class="h"></div>${tx}${tx}${ad(36)}${tx}${tx}<div class="tx" style="width:60%"></div>` : `${ad(28)}<div class="h"></div>${ad(40)}${tx}${ad(30)}<div class="tx"></div>${ad(36)}`;
            verdict($(el, '.res'), i ? 'ok' : 'bad', i ? '✓ 本文を読む流れを邪魔しない場所に、<b>枠の大きさを先に確保して</b>表示。読者が戻ってきてくれる。' : '❌ 本文より広告が目立ち、読み込みのたびに広告が差し込まれて<b>文字がずれる（CLS）</b>。検索の評価（Core Web Vitals）も、読者の信頼も下がります。'); }).el); },
        desc:'広告を増やすほど短期の収益は増えますが、<b>読みにくさ・表示の遅さ・レイアウトのずれ</b>で読者が離れ、検索の評価も下がります。広告の枠は<b>先に大きさを確保</b>してずれを防ぎ、本文を読む流れを邪魔しない場所に置きましょう。',
        prompt:'このブログの広告の配置を見直して。本文の最初の画面には広告を置かず、記事の途中と末尾に最大2つ、広告枠は min-height で大きさを先に確保して CLS を防ぎ、自動広告は無効にして。Core Web Vitals を計測して改善前後を比べて。' },
    ], null, true),
    { title:'その他の収益の方法', note:'プラットフォームを使うと始めやすい反面、<b>手数料とルール</b>はそのサービス次第です。規約と手数料を確認しましょう。',
      table:{ head:['方法', '仕組み', 'ポイント'], rows:OTHERS } },
    S('広告・その他の用語', [
      T('PV・UU', 'Pageviews / Unique users', 'ページの表示回数と、訪れた人の数。'),
      T('RPM', 'Revenue per mille', '1,000PVあたりの広告収益。分野・季節・国で大きく変わる。'),
      T('CPC・CPM', 'Cost per click / per mille', '広告主が払う、1クリック・1,000表示あたりの料金。'),
      T('CTR', 'Click-through rate', 'クリック率。表示された回数のうち、クリックされた割合。'),
      T('ASP', 'Affiliate Service Provider', 'アフィリエイトの仲介会社。広告主との提携・成果の記録・報酬の支払い。'),
      T('rel="sponsored"', 'Link attributes', '報酬をもらうリンクに付ける印。検索エンジンへの申告。'),
      T('ステマ規制', 'Stealth marketing', '広告だと分からない宣伝の禁止（2023年10月〜）。「広告」「PR」の表示を。', null, ['必須']),
      T('Cookie の同意', 'Consent', '広告や計測で Cookie を使う場合、地域によっては同意の取得が必要（EUなど）。日本でも外部送信の公表が求められる場面がある（電気通信事業法の外部送信規律）。'),
      T('投げ銭', 'Tips', '少額の支援。手数料と、受け取った側の税金の扱いを確認。'),
      T('クラウドファンディング', 'Crowdfunding', '先に支援を集める。購入型・寄付型など。リターンの発送まで責任を持つ。'),
    ]),
  ]});
})();
