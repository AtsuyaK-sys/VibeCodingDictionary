/* AI組み込み辞典 — B: RAG / 速さ・コスト・キャッシュ / 品質・評価・安全 / AI機能のUX */
(function(){
const { $, $$, esc, tbl, seg, seq, stepper } = KIT;
const { S, C, T, verdict, MODELS, roughTokens } = window.LMH;

/* ================= 5. RAG ================= */
const PIPE = [['資料を集める', '準備', 'FAQ・マニュアル・社内文書・商品データなどを集め、テキストにします（PDFや画像は文字に変換）。'], ['分割（チャンク）', '準備', '長い資料を、意味のまとまりごとに数百文字程度に分けます。大きすぎると検索がぼやけ、小さすぎると文脈が切れます。'], ['埋め込み（ベクトル化）', '準備', '各チャンクを、埋め込みモデルで<b>意味を表す数字の並び</b>に変換します。意味が近い文章は、近い数字になります。'], ['ベクトルDBに保存', '準備', 'チャンクの本文・ベクトル・メタデータ（出典・日付・閲覧権限）を保存します。Supabase なら pgvector で同じDBに入れられます。'], ['質問をベクトル化', '毎回', '利用者の質問も、同じ埋め込みモデルでベクトルにします。'], ['近いチャンクを検索', '毎回', '質問のベクトルに近いチャンクを上位数件（top-k）取り出します。<b>閲覧権限のないチャンクは除外</b>します。'], ['プロンプトに入れる', '毎回', '「次の資料だけを根拠に答えて。資料にないことは分からないと答えて」という指示と一緒に、検索結果をAIに渡します。'], ['出典付きで回答', '毎回', 'AIが資料をもとに答え、どの資料を使ったか（出典）を示します。利用者が確かめられます。']];
const DOC = '【返品について】商品到着から7日以内であれば、未使用品に限り返品を受け付けます。返品の送料はお客様のご負担となります。【返金について】返品された商品の到着を確認後、5営業日以内に返金いたします。クレジットカードの場合、カード会社の締め日によって反映が翌月になることがあります。【配送について】ご注文から通常2〜4日でお届けします。離島は追加で2日ほどかかります。配送状況はマイページの注文履歴から確認できます。【パスワード】パスワードを忘れた場合は、ログイン画面の「パスワードを忘れた方」から再設定してください。';
const MAP = [['返品の条件と期限', 16, 26, '返品'], ['返品の送料', 26, 18, '返品'], ['返金のタイミング', 22, 40, '返金'], ['カード返金の反映', 34, 34, '返金'], ['お届け日数', 70, 22, '配送'], ['離島への配送', 80, 30, '配送'], ['配送状況の確認', 66, 36, '配送'], ['パスワード再設定', 74, 74, 'パスワード'], ['メールアドレス変更', 84, 66, 'ログイン'], ['使えるカード', 26, 76, '支払い'], ['コンビニ払い', 18, 68, '支払い']];
// 文字で探す側は「質問に実際に含まれる言葉」だけで探す
const QUERIES = [['お金を返してほしい', 24, 32, ['お金', '返して']], ['荷物がまだ来ない', 72, 28, ['荷物', '来ない']], ['ログインできない', 79, 72, ['ログイン']], ['カードが使えない', 24, 72, ['カード']]];
const RAGQ = [['資料なし', 'bad', '🤖「通常は30日以内であれば返品できます。送料は当社が負担します。」', '❌ <b>もっともらしい作り話</b>。一般的な知識から推測して、実際のルール（7日・送料はお客様負担）と違うことを答えています。'], ['検索が外れた', 'warn', '🤖「配送は通常2〜4日でお届けします。返品については資料に記載がないため、お答えできません。」', '⚠ 検索で「配送」の資料しか見つからず、答えられません。<b>チャンクの分け方・検索の方法</b>を見直します。'], ['検索が当たった', 'ok', '🤖「商品到着から<b>7日以内</b>の未使用品であれば返品できます。返品の送料は<b>お客様のご負担</b>です。［出典：返品について］」', '✅ 資料にもとづいた正確な答えと出典。<b>RAGの品質は、検索の品質でほぼ決まります</b>。']];

TABS.push({ id:'rag', label:'RAG（資料を検索して答える）', icon:'📚',
  intro:'<b>RAG（検索拡張生成）</b>は、AIが知らない自社の情報（FAQ・マニュアル・商品データ）を、<b>質問のたびに検索して渡し、それを根拠に答えさせる</b>仕組みです。サポートのチャットボットや社内検索の定番。分割・意味で探す検索・出典の仕組みを触って確かめましょう。',
  sections:[
    C('触って理解する', [
      { name:'RAGの全体像', en:'RAG pipeline', h:380, tags:['仕組み','最重要'],
        demo:'<div class="kt"><div class="lm-pipe pp"></div><div class="kt-verdict res kt-grow"></div><div class="kt-row"><button type="button" class="kt-btn sm pv">◀</button><button type="button" class="kt-btn pri sm nx">次へ ▶</button><span class="kt-lbl ph" style="margin-left:auto"></span></div></div>',
        init:(el) => { let k = 0; $(el, '.pp').innerHTML = PIPE.map(([n], i) => `${i ? '<i>→</i>' : ''}<span>${i + 1}. ${n}</span>`).join('');
          const draw = () => { $$(el, '.pp span').forEach((s, i) => { s.className = i === k ? 'on' : i < k ? 'done' : ''; }); $(el, '.res').innerHTML = `<b>${k + 1}. ${PIPE[k][0]}</b>（${PIPE[k][1]}）：${PIPE[k][2]}`; $(el, '.ph').textContent = PIPE[k][1] === '準備' ? '事前に1回（資料が変わったら更新）' : '質問のたびに'; };
          $(el, '.nx').onclick = () => { k = (k + 1) % PIPE.length; draw(); }; $(el, '.pv').onclick = () => { k = (k + PIPE.length - 1) % PIPE.length; draw(); }; draw(); },
        desc:'RAGは<b>準備（資料を分割して、意味の数字に変換して保存）</b>と、<b>質問のたび（近い資料を探して、AIに渡して答えさせる）</b>の2段階です。AIを追加で学習させる必要がなく、資料を更新すればすぐに答えも変わります。',
        prompt:'Supabase（pgvector）を使って、FAQのRAGを実装して。資料の分割・埋め込みの作成・保存のスクリプト、質問を受けて上位5件を検索する関数（閲覧権限で絞り込み）、検索結果を根拠に出典付きで答えるAPIを作って。資料にないことは「分からない」と答えるようにして。' },
      { name:'チャンク（分割）の大きさ', en:'Chunk size & overlap', h:440, tags:['体験'],
        demo:'<div class="kt"><div class="kt-row"><span class="kt-lbl">大きさ</span><input type="range" min="60" max="260" value="120" class="sz" aria-label="チャンクの大きさ"><b class="kt-mono sv"></b><span class="kt-lbl">重なり</span><input type="range" min="0" max="50" value="20" class="ov" aria-label="重なり"><b class="kt-mono ovv"></b></div><div class="lm-chunks kt-grow tx"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const run = () => { const size = +$(el, '.sz').value, ov = Math.min(+$(el, '.ov').value, size - 10), L = DOC.length, ch = []; let s = 0; while (s < L){ const e = Math.min(L, s + size); ch.push([s, e]); if (e >= L) break; s = e - ov; }
            const cls = (i) => { const m = ch.map((c, k) => i >= c[0] && i < c[1] ? k : -1).filter(k => k >= 0); return m.length > 1 ? 'ov' : 'c' + (m[0] % 4); };
            let html = '', cur = null, buf = ''; [...DOC].forEach((c, i) => { const k = cls(i); if (k !== cur && buf){ html += `<span class="${cur}">${esc(buf)}</span>`; buf = ''; } cur = k; buf += c; }); html += `<span class="${cur}">${esc(buf)}</span>`;
            $(el, '.tx').innerHTML = html; $(el, '.sv').textContent = size + '字'; $(el, '.ovv').textContent = ov + '字';
            const split = ch.filter(([a, b]) => DOC.slice(a, b).includes('返品された') && !DOC.slice(a, b).includes('返金いたします')).length > 0 && !ch.some(([a, b]) => DOC.slice(a, b).includes('返品された商品の到着を確認後、5営業日以内に返金いたします'));
            verdict($(el, '.res'), split ? 'warn' : 'ok', `<b>${ch.length}個</b>のチャンク（紫は重なり）。` + (split ? '⚠「返金のタイミング」の文が2つに分かれてしまい、検索で片方しか取れないと答えが不完全になります。' : '✅ 返金の説明が1つのチャンクに収まっています。') + (size > 200 ? ' 大きすぎると、関係ない話も混ざって検索の精度が下がります。' : '')); };
          $$(el, 'input').forEach(x => x.oninput = run); run(); },
        desc:'資料を分ける大きさ（チャンクサイズ）と重なり（オーバーラップ）で、検索の精度が大きく変わります。文の途中で切れると、答えに必要な情報が2つに分かれてしまいます。<b>見出し・段落など意味の区切りで分け</b>、少し重ねるのが基本。色の境目と、紫（重なり）を見ながら調整してみてください。',
        prompt:'このマニュアル（Markdown）を、見出しと段落の区切りを優先して、400〜800文字程度・前後100文字重ねて分割するスクリプトを書いて。各チャンクに見出しのパス（章 > 節）と出典URLをメタデータとして付けて。' },
      { name:'意味で探す（ベクトル検索）', en:'Semantic vs keyword search', h:420, tags:['体験','仕組み'],
        demo:'<div class="kt"><div class="kt-row"><span class="kt-lbl">質問</span><span class="sw"></span></div><div class="lm-map mp"><svg></svg></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const mp = $(el, '.mp'); MAP.forEach(([n, x, y]) => mp.insertAdjacentHTML('beforeend', `<span class="d" style="left:${x}%;top:${y}%">${n}</span>`)); mp.insertAdjacentHTML('beforeend', '<span class="q"></span>');
          $(el, '.sw').replaceWith(seg(QUERIES.map(q => q[0]), i => { const [q, qx, qy, words] = QUERIES[i]; const qe = $(mp, '.q'); qe.textContent = '❓' + q; qe.style.left = qx + '%'; qe.style.top = qy + '%';
            const dist = MAP.map(([n, x, y], k) => [k, Math.hypot(x - qx, y - qy)]).sort((a, b) => a[1] - b[1]), top = dist.slice(0, 3);
            const kw = MAP.map(([n, , , tag], k) => words.some(w => n.includes(w) || tag.includes(w)) ? k : -1).filter(k => k >= 0);
            $$(mp, '.d').forEach((d, k) => { d.classList.toggle('hit', top.some(t => t[0] === k)); d.classList.toggle('kw', kw.includes(k)); });
            $(mp, 'svg').innerHTML = top.map(([k]) => `<line x1="${qx}%" y1="${qy}%" x2="${MAP[k][1]}%" y2="${MAP[k][2]}%"/>`).join('');
            verdict($(el, '.res'), kw.length ? '' : 'warn', `<b>意味で探す</b>：${top.map(([k, d]) => `${MAP[k][0]}（近さ ${Math.round((1 - d / 100) * 100)}%）`).join('・')}<br><b>文字で探す</b>：${kw.length ? kw.map(k => MAP[k][0]).join('・') + '（点線）' : '<span style="color:var(--bad)">0件</span> — 同じ言葉が資料にないと見つからない'}`); }).el); },
        desc:'<b>ベクトル検索</b>は、言葉が違っても<b>意味が近い</b>資料を見つけます（「お金を返してほしい」→「返金のタイミング」）。従来の文字の一致で探す検索は、同じ言葉がないと見つかりません。逆に、型番や固有名詞の検索は文字検索の方が得意なので、両方を組み合わせる<b>ハイブリッド検索</b>がよく使われます。',
        prompt:'FAQ検索を、ベクトル検索（pgvector）と全文検索（PostgreSQL の全文検索または pg_trgm）を組み合わせたハイブリッド検索にして。両方の結果を統合して上位5件を返す関数を書いて。' },
      { name:'検索が外れると、答えも外れる', en:'Retrieval quality', h:330, tags:['比較'],
        demo:'<div class="kt"><div class="kt-lbl">質問：「返品できますか？送料は？」</div><span class="sw"></span><div class="kt-code an"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.sw').replaceWith(seg(RAGQ.map(r => r[0]), i => { const [, v, a, n] = RAGQ[i]; $(el, '.an').innerHTML = a; verdict($(el, '.res'), v, n); }).el); },
        desc:'RAGの答えの良し悪しは、AIの賢さより<b>「正しい資料を渡せたか」</b>でほぼ決まります。答えがおかしいときは、まず検索結果（AIに渡した資料）を確認しましょう。資料がない・外れたときに「分からない」と答えさせる指示も大切です。',
        prompt:'RAGの回答の質を上げたい。質問と、そのとき検索された資料と、AIの回答をログに残して、検索が外れた例を集めて分析できるようにして。改善策（チャンクの見直し・ハイブリッド検索・リランキング・質問の言い換え）も提案して。' },
    ], null, true),
    S('RAGの用語とコツ', [
      T('埋め込みモデル', 'Embedding model', '文章を意味のベクトルに変換する専用のモデル。OpenAI・Google・Voyage AI・Cohere などが提供（Claude には埋め込み専用のモデルはない）。<b>保存時と検索時で同じモデル</b>を使う。'),
      T('ベクトルDB', 'Vector database', 'ベクトルを保存し、近いものを高速に探せるDB。Supabase / PostgreSQL の pgvector、Pinecone、Qdrant、Chroma、Weaviate など。小さな規模なら pgvector で十分。'),
      T('類似度', 'Cosine similarity', 'ベクトル同士の近さ。1に近いほど意味が近い。'),
      T('チャンクとオーバーラップ', 'Chunk / overlap', '分割の大きさと、前後の重なり。見出し・段落など意味の区切りで分けるのが基本。'),
      T('上位何件を渡すか（top-k）', 'Top-k', '多すぎると関係ない資料が混ざり、少なすぎると必要な情報が漏れる。3〜10件から試す。'),
      T('メタデータで絞り込む', 'Metadata filtering', 'カテゴリ・日付・言語・<b>閲覧権限</b>で検索対象を絞る。<b>見せてはいけない社内文書を検索結果に入れない</b>のは必須。', null, ['安全']),
      T('ハイブリッド検索', 'Hybrid search', 'ベクトル検索（意味）と全文検索（文字）を組み合わせる。型番・人名・専門用語に強くなる。'),
      T('リランキング', 'Reranking', '検索した候補を、より精密なモデルで並べ直して上位だけを使う。精度が上がる。'),
      T('質問の言い換え', 'Query rewriting', '会話の流れを含めて質問を検索しやすい形に書き直してから検索する（「それの送料は？」→「返品の送料は？」）。'),
      T('出典を示す', 'Citations', 'どの資料の何を根拠にしたかを示す。利用者が確かめられ、信頼につながる。'),
      T('資料の更新', 'Keeping indexes fresh', '資料が変わったら、該当するチャンクを作り直す。更新日時をメタデータに持つ。'),
      T('全部入れる、という選択', 'Long context instead of RAG', '資料が少ない（数十万トークン以内）なら、検索せずに<b>全部をプロンプトに入れる</b>方が簡単で正確なことも。プロンプトキャッシュを使えば費用も抑えられる。'),
      T('資料の中の悪意ある指示', 'Indirect prompt injection', '外部のWebページやメールを資料にすると、そこに仕込まれた指示にAIが従う危険がある。資料は「データ」として区切って渡し、ツールの権限を絞る。（セキュリティ辞典参照）', null, ['注意']),
      T('RAGの評価', 'Evaluating RAG', '「検索で正しい資料が取れたか」と「答えが資料に忠実か」を分けて測る。質問と正解の資料のセットを作っておく。'),
    ]),
  ]});

/* ================= 6. 速さ・コスト・キャッシュ ================= */
const BLOCKS = [['ツールの定義', 3], ['システムプロンプト', 2], ['資料', 20], ['これまでの会話', 8], ['新しい質問', .2]];
TABS.push({ id:'cost', label:'速さ・コスト・キャッシュ', icon:'¥',
  intro:'AI APIは<b>使った分だけ</b>料金がかかります。1回は数円でも、利用者が増えれば大きな額になり、悪用されれば一晩で高額請求も。料金の計算、同じ部分を安くする<b>プロンプトキャッシュ</b>、速さの内訳を触って確かめましょう。（料金は2026年10月時点のAnthropic API公式価格。最新は公式で確認）',
  sections:[
    C('触って計算する', [
      { name:'料金計算機', en:'Cost calculator', h:470, wide:true, tags:['体験','最重要'],
        demo:'<div class="kt"><div class="lm-calc cf"><b>モデル</b><select class="m" aria-label="モデル"></select><output></output><b>入力トークン/回</b><input type="range" min="200" max="50000" step="100" value="3000" class="in" aria-label="入力トークン"><output class="o1"></output><b>うち共通部分（キャッシュ）</b><input type="range" min="0" max="95" step="5" value="0" class="ca" aria-label="キャッシュの割合"><output class="o2"></output><b>出力トークン/回</b><input type="range" min="50" max="8000" step="50" value="500" class="out" aria-label="出力トークン"><output class="o3"></output><b>1日の回数</b><input type="range" min="10" max="20000" step="10" value="300" class="n" aria-label="1日の回数"><output class="o4"></output><b>為替（円/ドル）</b><input type="range" min="100" max="200" value="150" class="fx" aria-label="為替"><output class="o5"></output><b>バッチ（半額）</b><label style="display:flex;gap:6px;align-items:center;font-size:11.5px"><input type="checkbox" class="bt">急がない処理をまとめて送る</label><output></output></div><div class="lm-total tt"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.m').innerHTML = MODELS.map((m, i) => `<option value="${i}">${m.n}（入力$${m.inP}・出力$${m.outP}）</option>`).join('');
          const run = () => { const m = MODELS[+$(el, '.m').value], inT = +$(el, '.in').value, ca = +$(el, '.ca').value / 100, outT = +$(el, '.out').value, n = +$(el, '.n').value, fx = +$(el, '.fx').value, b = $(el, '.bt').checked ? .5 : 1;
            $(el, '.o1').textContent = inT.toLocaleString(); $(el, '.o2').textContent = Math.round(ca * 100) + '%'; $(el, '.o3').textContent = outT.toLocaleString(); $(el, '.o4').textContent = n.toLocaleString(); $(el, '.o5').textContent = fx + '円';
            const per = ((inT * (1 - ca)) * m.inP + inT * ca * m.cache + outT * m.outP) / 1e6 * b, perNo = (inT * m.inP + outT * m.outP) / 1e6;
            const yen = (d) => d * fx < 1 ? (d * fx).toFixed(2) + '円' : Math.round(d * fx).toLocaleString() + '円';
            $(el, '.tt').innerHTML = `<div>1回あたり<b>${yen(per)}</b></div><div>1日あたり<b>${yen(per * n)}</b></div><div class="main">1か月（30日）<b>${yen(per * n * 30)}</b></div>`;
            const outShare = outT * m.outP / (inT * m.inP + outT * m.outP);
            verdict($(el, '.res'), per * n * 30 * fx > 30000 ? 'warn' : '', `料金の<b>${Math.round(outShare * 100)}%</b>は出力（返事）の分。` + (ca ? `キャッシュで1回あたり約<b>${Math.round((1 - per / b / perNo) * 100)}%</b>節約。` : '毎回同じシステムプロンプトや資料を送るなら、キャッシュで大きく下がります。') + (per * n * 30 * fx > 30000 ? '<br>⚠ 月3万円を超えます。モデルの使い分け・出力を短く・キャッシュ・利用者ごとの回数制限を検討。' : '')); };
          $$(el, 'input, select').forEach(x => { x.oninput = run; x.onchange = run; }); run(); },
        desc:'料金＝<b>入力トークン×入力単価＋出力トークン×出力単価</b>。出力の単価は入力の5倍なので、<b>返事が長いほど高く</b>なります。毎回送る共通部分（システムプロンプト・資料）はキャッシュで約1/10〜1/20に。急がない処理はバッチで半額。数字を動かして、自分のアプリの月額を見積もってみてください。（キャッシュの書き込み料金は省略した目安です）',
        prompt:'このAI機能の月額費用を見積もって。1回あたりの入力・出力トークン数を実際のプロンプトから数え（messages.countTokens）、1日の想定回数から月額を計算し、モデルの使い分け・キャッシュ・出力の短縮・バッチでどこまで下げられるか試算して。' },
      { name:'プロンプトキャッシュの仕組み', en:'Prompt caching (prefix match)', h:420, tags:['体験','仕組み'],
        demo:'<div class="kt"><span class="sw"></span><div class="lm-blocks bk"></div><div class="wf-legend" style="display:flex;gap:10px;font-size:10.5px"><span><i style="display:inline-block;width:9px;height:9px;border-radius:3px;background:var(--ok)"></i> キャッシュから読む（安い）</span><span><i style="display:inline-block;width:9px;height:9px;border-radius:3px;background:var(--warn)"></i> 書き込む（少し高い）</span><span><i style="display:inline-block;width:9px;height:9px;border-radius:3px;background:#64748b"></i> 通常</span></div><div class="lm-total tt"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const P = 4, R = .2, W = 5; // Opus 5.5：入力$4、キャッシュ読み出し$0.20、5分キャッシュの書き込み$5（1.25倍）
          const S = [['1回目', 'write', -1, '最初の1回は、共通部分をキャッシュに<b>書き込みます</b>（通常の1.25倍）。'], ['2回目（5分以内）', 'read', -1, '前回と<b>先頭から同じ部分</b>はキャッシュから読みます（Opus 5.5では通常の1/20）。新しい質問だけが通常料金。'], ['途中を変えてしまった', 'read', 1, '❌ システムプロンプトに「現在時刻」を入れていたため、<b>そこから後ろが全部キャッシュ外れ</b>に。先頭から1文字でも変わると、それ以降は使えません。']];
          $(el, '.sw').replaceWith(seg(S.map(s => s[0]), i => { const [, mode, chg, note] = S[i]; let cost = 0, base = 0;
            $(el, '.bk').innerHTML = BLOCKS.map(([n, k], j) => { const last = j === BLOCKS.length - 1; let cls; if (last) cls = 'new'; else if (mode === 'write') cls = 'miss'; else cls = chg >= 0 && j >= chg ? 'miss' : 'hit';
              const price = cls === 'hit' ? R : cls === 'miss' ? W : P; cost += k * price; base += k * P; return `<span class="${cls}${j === chg ? ' chg' : ''}" style="flex:${Math.max(k, 1.5)}">${n}<br>${k}k</span>`; }).join('');
            $(el, '.tt').innerHTML = `<div>キャッシュなし<b>${(base / 1000 * 150).toFixed(1)}円</b></div><div class="main">今回<b>${(cost / 1000 * 150).toFixed(1)}円</b></div><div>差<b>${Math.round((1 - cost / base) * 100)}%</b></div>`;
            verdict($(el, '.res'), i === 2 ? 'bad' : i === 1 ? 'ok' : '', note); }).el); },
        desc:'<b>プロンプトキャッシュ</b>は、毎回送る<b>先頭の共通部分</b>（ツールの定義・システムプロンプト・資料・過去の会話）を一時的に保存し、次から安く速く読み込む仕組みです。ルールは「<b>先頭から完全に同じ部分だけ</b>」。変わるもの（現在時刻・利用者ごとの情報・新しい質問）は必ず後ろに置きます。有効期間は標準5分（1時間も選べる）で、使うたびに延長されます。',
        prompt:'このAI機能にプロンプトキャッシュを設定して。ツール定義とシステムプロンプトは変えずに先頭に固定し、日時や利用者ごとの情報は後ろに移して。2回目以降のレスポンスの usage.cache_read_input_tokens が0より大きくなっているか確認するログも入れて。',
        code:'// いちばん簡単：リクエスト全体に自動キャッシュ\nconst response = await client.messages.create({\n  model: "claude-opus-5-5",\n  max_tokens: 16000,\n  cache_control: { type: "ephemeral" }, // 最後のブロックまでを自動でキャッシュ\n  system: LONG_FIXED_SYSTEM_PROMPT,     // ← 毎回まったく同じ内容にする（日時などを入れない）\n  messages,\n});\nconsole.log(response.usage.cache_read_input_tokens); // 2回目以降に0より大きければ成功' },
      { name:'待ち時間の内訳', en:'Latency: TTFT vs generation', h:330, tags:['体験','速さ'],
        demo:'<div class="kt"><div class="kt-row"><span class="kt-lbl">返事の長さ</span><input type="range" min="50" max="3000" step="50" value="600" class="len" aria-label="返事の長さ"><b class="kt-mono lv"></b></div><div class="db-bars-like bs" style="display:flex;flex-direction:column;gap:6px"></div><div class="kt-verdict res"></div><div class="kt-note">※数値は仕組みを示すための<b>イメージ</b>です。実際の速さはモデル・混雑・入力の長さで変わります。</div></div>',
        init:(el) => { const run = () => { const L = +$(el, '.len').value, ttft = .8, gen = L / 70, tot = ttft + gen; $(el, '.lv').textContent = L + 'トークン';
            const bar = (lab, a, b, note) => `<div style="display:grid;grid-template-columns:120px 1fr 54px;gap:8px;align-items:center;font-size:11.5px"><span>${lab}</span><div style="height:16px;border-radius:5px;background:color-mix(in srgb, var(--stage-ink) 8%, transparent);overflow:hidden;display:flex"><i style="display:block;width:${a / 45 * 100}%;background:var(--warn)"></i><i style="display:block;width:${b / 45 * 100}%;background:var(--accent)"></i></div><b class="kt-mono">${note}</b></div>`;
            $(el, '.bs').innerHTML = bar('一括で受け取る', tot, 0, tot.toFixed(1) + '秒') + bar('ストリーミング', ttft, 0, ttft.toFixed(1) + '秒') + '<div style="font-size:10.5px;color:var(--muted)"><span style="color:var(--warn)">■</span> 最初の文字が出るまで　<span style="color:var(--accent)">■</span> 全部そろうまで待つ時間</div>';
            verdict($(el, '.res'), '', `一括だと <b>${tot.toFixed(1)}秒</b> 何も表示されませんが、ストリーミングなら <b>${ttft}秒</b> で表示が始まります。返事が長いほど差が大きく、<b>短く答えさせるのが一番の高速化</b>です。`); };
          $(el, '.len').oninput = run; run(); },
        desc:'待ち時間は「<b>最初の文字が出るまで（TTFT）</b>」と「<b>文章を作り続ける時間</b>」に分かれます。作る時間は返事の長さにほぼ比例するので、<b>短く答えさせる</b>・<b>ストリーミングで少しずつ見せる</b>・<b>軽いモデルや低い effort を使う</b>・<b>キャッシュで入力の処理を速くする</b>、が高速化の手段です。',
        prompt:'このAI機能の待ち時間を短くしたい。最初の文字が出るまでの時間と全体の時間を計測するログを入れて、出力の短縮（指示・max_tokens）、ストリーミング化、モデルと effort の見直し、プロンプトキャッシュで改善して、前後の数値を比較して。' },
    ], null, true),
    S('費用と速さを抑えるコツ', [
      T('出力を短く', 'Shorter outputs', '出力の単価は入力の5倍。「3行で」「箇条書き3つ」「JSONだけ」と指定する。前置きや繰り返しをやめさせる。', null, ['効果大']),
      T('モデルを使い分ける', 'Model routing', '分類・抽出・短い返事は軽いモデル（Haiku）、難しい判断だけ高性能なモデル。ただしまずは1つのモデルで effort を下げて試すのが簡単。'),
      T('考える深さ（effort）を下げる', 'Lower effort', 'チャットや分類は low〜medium で十分なことが多い。深く考えるほどトークンを使う。'),
      T('プロンプトキャッシュ', 'Prompt caching', '先頭の共通部分を保存して安く・速くする。書き込みは通常の1.25倍（5分）または2倍（1時間）、読み出しは約1/10（Opus 5.5 は1/20）。最低限の長さ（モデルにより512〜4,096トークン）より短いとキャッシュされない。', null, ['効果大']),
      T('キャッシュを壊さない', 'Cache invalidation', '現在時刻・ランダムなID・並び順が毎回変わるJSONをプロンプトの前半に入れると、キャッシュが毎回外れる。<code>usage.cache_read_input_tokens</code> で効いているか確認。'),
      T('バッチで半額', 'Batch API', '急がない処理（夜間の要約・大量の分類・翻訳）はまとめて送ると50%引き。'),
      T('入力を減らす', 'Trim inputs', '不要な会話履歴・長すぎる資料・使わないツールの定義を削る。RAGで必要な部分だけ渡す。'),
      T('トークン数を数えて見積もる', 'Count tokens', '<code>messages.countTokens</code> で正確に数えて、1回あたりの費用を見積もる。'),
      T('利用者ごとの上限', 'Per-user quotas', '1日の回数・トークン数の上限を設け、超えたら止める・有料プランへ案内する。悪用による高額請求の防止にも。（セキュリティ辞典参照）', null, ['必須']),
      T('予算アラート', 'Budget alerts', 'APIの管理画面で月の上限・通知を設定する。'),
      T('1件あたりの費用で考える', 'Cost per task', '1回のリクエストではなく「1つの作業を終えるまで」の費用で比べる。安いモデルで何度もやり直すと、結局高くつくことがある。'),
      T('結果をキャッシュする', 'Cache responses', '同じ質問に同じ答えでよいもの（FAQ・固定の要約）は、AIを呼ばずに保存した答えを返す。'),
      T('速度優先のモード', 'Fast mode', '一部の高性能モデルには、割高な代わりに出力が速いモード（研究プレビュー）もある。待ち時間が重要な場面で検討。'),
    ]),
  ]});

/* ================= 7. 品質・評価・安全 ================= */
const EV = [['商品が届かない', '配送', '配送', '配送'], ['返品したい', '返品', '返品', '返品'], ['カードで払えない', '支払い', '支払い', '支払い'], ['届いた商品が壊れていた', '返品', '配送', '返品'], ['パスワードを変えたい', 'アカウント', 'その他', 'アカウント'], ['領収書がほしい', '支払い', '支払い', 'その他']];
const PII = '山田太郎です。注文の件で連絡しました。電話は 090-1234-5678、メールは taro.yamada@example.com です。カード番号 4111 1111 1111 1111 で払いました。住所は東京都渋谷区神南1-2-3です。';
const HALL = [['資料なし', 'bad', '🤖「当社の営業時間は平日9時〜18時、土日祝は休業です。」', '❌ 資料がないのに、それらしい答えを作りました（実際は10時〜19時・土曜営業）。'], ['資料あり', 'ok', '🤖「営業時間は10時〜19時です（日曜・祝日は休業、土曜は営業）。［出典：店舗案内］」', '✅ 資料にもとづいて答え、出典を示しています。'], ['資料あり・載っていない質問', 'ok', '🤖「申し訳ありません、年末年始の営業時間は資料に記載がないため分かりません。店舗に直接お問い合わせください。」', '✅ 「資料にないことは分からないと答える」と指示したので、推測で答えていません。']];

TABS.push({ id:'quality', label:'品質・評価・安全', icon:'✅',
  intro:'AIの答えは毎回少しずつ違い、プロンプトを直すと<b>良くなった部分と悪くなった部分</b>が同時に出ます。「なんとなく良くなった気がする」ではなく、<b>テストのセット（評価）で数字を見る</b>のが品質管理の基本。個人情報の扱い、作り話の抑え方、安全への配慮もまとめました。',
  sections:[
    C('触って理解する', [
      { name:'評価（eval）で改善を確かめる', en:'Eval-driven development', h:430, tags:['体験','最重要'],
        demo:'<div class="kt"><div class="kt-lbl">問い合わせの分類。テストケース6件で、プロンプトAとBを比べる</div><div class="kt-row"><button type="button" class="kt-btn pri a">プロンプトAで実行</button><button type="button" class="kt-btn pri b">プロンプトB（改良版）で実行</button></div><div class="lm-eval kt-tblwrap kt-grow t"></div><div class="kt-verdict res">実行するとテストケースごとの正解・不正解が表示されます。</div></div>',
        init:(el) => { const res = { a:null, b:null };
          const draw = () => { $(el, '.t').innerHTML = tbl(['質問', '正解', 'A', 'B'], EV.map(([q, ans, a, b]) => [q, ans, res.a ? a : '—', res.b ? b : '—'])); $$(el, '.t tr').slice(1).forEach((tr, i) => { [2, 3].forEach((c, j) => { const td = tr.children[c], r = j ? res.b : res.a; if (r) td.className = td.textContent === EV[i][1] ? 'p' : 'f'; }); });
            const score = (k) => EV.filter(e => e[k] === e[1]).length; if (res.a && res.b) verdict($(el, '.res'), 'warn', `A：<b>${score(2)}/6</b>　B：<b>${score(3)}/6</b> — Bは2件良くなったが、<b>「領収書がほしい」が新しく間違いに</b>。改良のつもりで別の所を壊すことはよくあります。テストケースがあれば、すぐに気づけます。`); else if (res.a || res.b) verdict($(el, '.res'), '', `${res.a ? 'A' : 'B'}：<b>${score(res.a ? 2 : 3)}/6</b>。もう一方も実行して比べてください。`); };
          $(el, '.a').onclick = () => { res.a = true; draw(); }; $(el, '.b').onclick = () => { res.b = true; draw(); }; draw(); },
        desc:'<b>評価（eval）</b>は、AI機能のためのテストです。代表的な入力と期待する出力のセットを作り、プロンプトやモデルを変えるたびに全部流して、<b>正解率を数字で比べます</b>。採点は、正解が決まっていればコードで、文章の質ならAIに採点させる（LLM-as-a-judge）方法もあります。',
        prompt:'このAI機能の評価セットを作って。実際の利用に近い入力を30件（簡単・普通・紛らわしい・意地悪なものを含む）と期待する出力を用意し、プロンプトを変えたときに全件を実行して正解率と失敗例を表示するスクリプトを書いて。' },
      { name:'個人情報を送る前に隠す', en:'PII masking', h:360, tags:['体験','安全'],
        demo:'<div class="kt"><span class="sw"></span><div class="lm-mask kt-grow tx"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const R = [[/[\w.+-]+@[\w-]+\.[\w.]+/g, '[メール]'], [/0\d{1,4}-\d{1,4}-\d{3,4}/g, '[電話]'], [/\b(?:\d{4}[ -]?){3}\d{4}\b/g, '[カード番号]'], [/(東京都|大阪府|北海道|京都府|..県)[^\s。、]*?\d+(-\d+)*/g, '[住所]']];
          $(el, '.sw').replaceWith(seg(['そのまま送る', '隠してから送る'], i => { let t = esc(PII), n = 0; R.forEach(([re, rep]) => { t = t.replace(re, (m) => { n++; return i ? `<span class="msk">${rep}</span>` : `<span class="pii">${m}</span>`; }); }); $(el, '.tx').innerHTML = t;
            verdict($(el, '.res'), i ? 'ok' : 'bad', i ? `✅ ${n}か所を記号に置き換えてから送ります。答えに必要なら、戻ってきた答えの記号を元の値に戻します。` : `❌ メール・電話・<b>カード番号</b>・住所がそのまま外部のAIに送られます。必要のない個人情報は送らない。`); }).el); },
        desc:'AIに送る前に、<b>答えに必要のない個人情報は取り除くか記号に置き換えます</b>。特にカード番号・マイナンバー・健康情報は送らないこと。どのAIサービスにどんな情報を送るかは、プライバシーポリシーにも書いておきます。（このデモの判定は簡易的なものです）',
        prompt:'AIに送るテキストから、メールアドレス・電話番号・カード番号・住所・氏名を検出して記号に置き換える関数を作って、AIを呼ぶ前に必ず通すようにして。誤検出と見逃しを確認するテストも書いて。' },
      { name:'作り話を減らす', en:'Reducing hallucinations', h:330, tags:['比較'],
        demo:'<div class="kt"><div class="kt-lbl">質問：「お店の営業時間は？」</div><span class="sw"></span><div class="kt-code an"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.sw').replaceWith(seg(HALL.map(h => h[0]), i => { const [, v, a, n] = HALL[i]; $(el, '.an').innerHTML = a; verdict($(el, '.res'), v, n); }).el); },
        desc:'AIは知らないことも、もっともらしく答えてしまいます。<b>①根拠になる資料を渡す ②資料にないことは「分からない」と答えさせる ③出典を示させる ④重要な数字や事実はコードで確かめる</b>、の組み合わせで減らします。ゼロにはならないので、間違えても困らない画面の作り（下書き・確認）も大切です。',
        prompt:'このAI機能のシステムプロンプトに、渡した資料だけを根拠に答える・資料にないことは分からないと答える・答えの根拠となる資料名を示す、のルールを加えて。それが守られているか確かめる評価ケースも5つ作って。' },
    ], null, true),
    S('品質と安全の知識', [
      T('評価セット', 'Eval set', '代表的な入力と期待する出力のセット。<b>実際の利用ログから集める</b>のが一番。プロンプト・モデルを変えるたびに流す。', null, ['最重要']),
      T('AIに採点させる', 'LLM-as-a-judge', '文章の質のように正解が1つでないものは、採点基準を渡して別のAIに採点させる。採点の基準と結果を人が時々確認する。'),
      T('回帰テスト', 'Regression', '一度直した失敗例を評価セットに足していく。同じ失敗の再発を防げる。'),
      T('ログとトレース', 'Logging / tracing', '入力・出力・使ったツール・トークン数・時間を記録する。問題が起きたとき再現できる。個人情報の扱いに注意。'),
      T('利用者のフィードバック', 'User feedback', '👍👎ボタンやコメントで、実際の満足度を集める。低評価の例を評価セットに追加。'),
      T('データの扱いを確認する', 'Data usage terms', 'API に送ったデータが学習に使われるか・どのくらい保存されるかは、事業者の規約と設定で決まる。多くはAPIのデータを標準では学習に使わないとしているが、<b>必ず規約を確認</b>してプライバシーポリシーに書く。'),
      T('安全上の拒否への対応', 'Refusals', 'AIが安全のために応答を断ることがある（stop_reason: refusal）。エラーにせず、利用者に丁寧に伝える。'),
      T('利用ポリシー', 'Usage policies', 'AI事業者は、使ってよい用途・いけない用途（医療・法律の判断、未成年向けなど）を定めている。自分のサービスの用途が当てはまるか確認する。'),
      T('AIが作ったことを示す', 'Disclosure', '「AIが作成した下書きです」「AIによる回答のため誤りを含む可能性があります」と表示し、重要な判断は人が確認する導線を置く。'),
      T('生成物の権利', 'Copyright', '生成した文章・画像の扱い、他人の著作物を入力に使う場合の注意。用途によっては専門家に相談。'),
      T('プロンプトインジェクション', 'Prompt injection', '利用者の入力や外部の資料に仕込まれた指示でAIが操られる攻撃。完全には防げないので、権限を絞り、重要な操作に承認を挟む。（セキュリティ辞典参照）', null, ['注意']),
      T('出力のチェック（ガードレール）', 'Output guardrails', 'AIの出力を表示・保存する前に、形（スキーマ）・禁止語・個人情報・不審なリンクを確認する。'),
      T('お金の暴走を防ぐ', 'Cost guardrails', 'ログイン必須・回数制限・トークン上限・予算アラート。悪用されると一晩で高額請求になる。'),
    ]),
  ]});

/* ================= 8. AI機能のUX ================= */
const ANS = '材料の中では「親子丼」がおすすめです。卵2個と玉ねぎ半分で作れて、調理時間は約15分です。鶏肉がない場合は、ツナ缶でも代用できます。';
const IDEAS = [['要約', '長い記事・会議メモ・レビューを3行に', '記事の本文から「3行の要約」と「重要なポイント3つ」を生成して、記事の上に表示して。'], ['分類・タグ付け', '問い合わせや投稿を自動で分類', '新しい投稿に、決められたタグ一覧の中から最大3つを自動で付けて（構造化出力で）。'], ['下書き作成', '返信メール・商品説明・SNS投稿', '問い合わせへの返信の下書きをAIで作り、担当者が編集してから送信する画面にして。'], ['自然な言葉で検索', '「安くて辛くないカレー」で探せる', '利用者の自然な言葉の検索を、AIでカテゴリ・価格帯・キーワードの条件に変換してから検索して。'], ['画像の読み取り', 'レシート・名刺・手書きメモ', 'アップロードされたレシート画像から、店名・日付・合計金額を読み取って入力欄に自動で入れて（修正できるように）。'], ['チャットでサポート', 'FAQにもとづいて回答', 'FAQを根拠に答えるサポートチャットを作って。分からないときは問い合わせフォームに案内して。'], ['文章の改善', '敬語に・やさしく・短く', '入力欄の文章を「丁寧に」「短く」「やさしく」に書き換えるボタンを付けて。'], ['データの読み解き', 'グラフや表の要点を文章で', '売上データから今月の傾向と気になる点を3つ、文章で説明する機能を作って。']];

TABS.push({ id:'ux', label:'AI機能のUX', icon:'✨',
  intro:'AI機能は、<b>間違えることがある・時間がかかる・毎回少し違う</b>という性質があります。それを前提に画面を作ると、利用者が安心して使えるものになります。チャット画面の基本操作、待ち時間の見せ方、組み込みやすいAI機能のアイデアをまとめました。',
  sections:[
    C('触って理解する', [
      { name:'チャット画面の基本操作', en:'Chat UI patterns', h:440, tags:['体験'],
        demo:'<div class="kt"><div class="lm-ui"><div class="lm-chat kt-grow ch"></div><div class="tools tl" style="display:none"><button type="button" class="stop">■ 停止</button><button type="button" class="re">↻ 作り直す</button><button type="button" class="cp">コピー</button><button type="button" class="gd">👍</button><button type="button" class="bd">👎</button></div><div class="kt-row sg"></div><div class="in"><input class="kt-in ip" value="卵と玉ねぎで何が作れる？" aria-label="質問"><button type="button" class="kt-btn pri sd">送信</button></div></div><div class="kt-verdict res">例文を選ぶか、送信してみてください。</div></div>',
        init:(el) => { let timer = null, n = 0; const ch = $(el, '.ch'); const stop = () => { clearInterval(timer); timer = null; };
          const reply = () => { stop(); const b = document.createElement('div'); b.className = 'b a'; ch.append(b); let i = 0; const txt = n++ % 2 ? '玉ねぎを甘く炒めて、卵でとじる「玉子丼」はいかがでしょう。だしの代わりにめんつゆでも作れます。' : ANS; $(el, '.tl').style.display = '';
            timer = setInterval(() => { i += 2; b.innerHTML = esc(txt.slice(0, i)) + (i < txt.length ? '<span class="lm-caret"></span>' : ''); ch.scrollTop = 1e6; if (i >= txt.length) stop(); }, 40); };
          const send = () => { const t = $(el, '.ip').value.trim(); if (!t) return; ch.insertAdjacentHTML('beforeend', `<div class="b u">${esc(t)}</div>`); $(el, '.ip').value = ''; $(el, '.sg').innerHTML = ''; reply(); verdict($(el, '.res'), '', '返事は少しずつ表示されます（ストリーミング）。途中で「停止」もできます。'); };
          $(el, '.sg').innerHTML = '<span class="kt-lbl">例：</span>' + ['10分で作れる夕飯', 'お弁当のおかず', '卵を使わないレシピ'].map(s => `<button type="button" class="kt-btn sm">${s}</button>`).join(''); $$(el, '.sg button').forEach(b => b.onclick = () => { $(el, '.ip').value = b.textContent; send(); });
          $(el, '.sd').onclick = send; $(el, '.ip').onkeydown = (e) => { if (e.key === 'Enter' && !e.isComposing) send(); };
          $(el, '.stop').onclick = () => { stop(); verdict($(el, '.res'), '', '■ 途中で止めました。長すぎる・方向が違うときに便利。止めた分の料金はかかりません（生成済みの分まで）。'); };
          $(el, '.re').onclick = () => { const last = $$(ch, '.b.a').pop(); if (last) last.remove(); reply(); verdict($(el, '.res'), '', '↻ 同じ質問でもう一度。毎回少し違う答えになります。'); };
          $(el, '.cp').onclick = () => verdict($(el, '.res'), 'ok', '答えをコピーしました（という動き）。'); $(el, '.gd').onclick = () => verdict($(el, '.res'), 'ok', '👍 フィードバックを記録しました。品質改善のデータになります。'); $(el, '.bd').onclick = () => verdict($(el, '.res'), 'warn', '👎 理由を選んでもらう（間違い・役に立たない・不適切）と、評価セットの材料になります。');
          return stop; },
        desc:'AIのチャット画面には、<b>ストリーミング表示・停止・作り直し・コピー・👍👎</b>がほぼ必須です。入力欄が空だと何を聞けばいいか迷うので、<b>例文のボタン</b>を置きます。Enterでの送信は、日本語入力の変換確定（isComposing）で誤送信しないように。',
        prompt:'AIチャット画面を作って。ストリーミング表示、生成中の停止ボタン、最後の返事の作り直し、コピー、👍👎のフィードバック（DBに保存）、最初に表示する例文ボタン、日本語変換中のEnterでは送信しない処理を入れて。' },
      { name:'待ち時間の見せ方', en:'Progress feedback', h:360, tags:['体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="kt-grow v" style="display:grid;place-items:center;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:10px;min-height:0"></div><div class="kt-row"><button type="button" class="kt-btn pri go">質問する</button></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let mode = 0, timers = []; const clear = () => { timers.forEach(clearTimeout); timers = []; };
          const N = ['<b>スピナーだけ</b>：何が起きているか分からず、長いと「止まった？」と不安になる。', '<b>ストリーミング</b>：最初の文字がすぐ出るので、体感の待ち時間が短い。', '<b>段階の表示</b>：AIが検索やツールを使う機能では、今どの段階かを見せると安心感がある。'];
          $(el, '.sw').replaceWith(seg(['スピナーだけ', 'ストリーミング', '段階を見せる'], i => { mode = i; clear(); $(el, '.v').innerHTML = '「質問する」を押してください'; $(el, '.res').innerHTML = N[i]; }).el);
          $(el, '.go').onclick = () => { clear(); const v = $(el, '.v');
            if (mode === 0){ v.innerHTML = '<span class="lm-spin" style="width:26px;height:26px"></span>'; timers.push(setTimeout(() => v.innerHTML = `<div style="font-size:12.5px">${esc(ANS)}</div>`, 4000)); }
            else if (mode === 1){ v.innerHTML = '<div style="font-size:12.5px;width:100%" class="tx"></div>'; [...ANS].forEach((c, i) => timers.push(setTimeout(() => $(v, '.tx').innerHTML = esc(ANS.slice(0, i + 1)) + '<span class="lm-caret"></span>', 600 + i * 45))); }
            else { const st = ['質問を理解しています', 'レシピを検索しています（3件）', '答えをまとめています']; v.innerHTML = '<div class="lm-status">' + st.map(s => `<div>${s}</div>`).join('') + '</div>'; const ds = $$(v, '.lm-status div'); st.forEach((_, i) => timers.push(setTimeout(() => ds.forEach((d, j) => d.className = j < i ? 'done' : j === i ? 'on' : ''), i * 1200))); timers.push(setTimeout(() => v.innerHTML = `<div style="font-size:12.5px">${esc(ANS)}</div>`, 3800)); } };
          return clear; },
        desc:'AIの処理は数秒〜数十秒かかります。<b>何が起きているかを見せる</b>だけで、同じ待ち時間でも感じ方が大きく変わります。文章はストリーミング、検索やツールを使う処理は段階の表示、終わったら通知、が基本です。（モーション辞典のローディング演出も参照）',
        prompt:'AIの処理中の表示を改善して。テキストはストリーミングで表示し、検索やツール実行の段階（理解中→検索中→まとめ中）を表示して、10秒を超える処理は「バックグラウンドで続けて、完了したら通知」できるようにして。' },
    ], null, true),
    S('組み込みやすいAI機能のアイデア', IDEAS.map(([n, d, p]) => T(n, '', d, p))),
    { title:'AIを使えるAPI・サービス', note:'料金・機能・規約はそれぞれ違い、変化も速いので、採用前に公式で確認しましょう。（AIツール辞典も参照）',
      table:{ head:['サービス', '主なモデル', 'ポイント'], rows:[
        ['Anthropic（Claude）', 'Claude Opus / Sonnet / Haiku / Fable', '長い文章・コーディング・ツール利用・安全性。プロンプトキャッシュ、構造化出力、バッチ'],
        ['OpenAI', 'GPT シリーズ', '幅広い機能。埋め込み・音声・画像生成のAPIもある'],
        ['Google', 'Gemini シリーズ', 'Google Cloud・Firebase との連携。長い入力・マルチモーダル'],
        ['クラウド経由', 'Amazon Bedrock・Google Cloud Vertex AI・Microsoft Foundry', '会社のクラウド契約の中で各社のモデルを使える'],
        ['ローカル実行', 'Ollama・LM Studio（オープンなモデル）', 'PCの中で動く。費用がかからず外部に送らないが、性能はPC次第'],
      ]}},
    S('AI機能を使いやすくするコツ', [
      T('間違えうることを伝える', 'Set expectations', '「AIによる回答です。重要な内容は確認してください」と、邪魔にならない場所に表示する。'),
      T('下書きとして出す', 'Draft, then edit', 'AIの出力をそのまま確定せず、利用者が直せる形で出す。メール・説明文・入力の自動補完など。', null, ['おすすめ']),
      T('根拠を見せる', 'Show sources', '出典・元の資料へのリンクを付ける。利用者が確かめられると信頼される。'),
      T('取り消せるように', 'Undo', 'AIが入力欄を書き換えたり分類したりしたら、元に戻せるようにする。'),
      T('重要な操作は確認', 'Confirm actions', '送信・購入・削除をAIが提案したら、実行前に利用者が確認する。'),
      T('例文・使い方を見せる', 'Onboarding prompts', '空の入力欄は迷わせる。例文ボタン・「こんなことができます」を置く。'),
      T('失敗時の逃げ道', 'Fallbacks', 'AIが失敗した・混雑しているときは、普通の検索・問い合わせフォーム・後で再試行、に案内する。'),
      T('回数や費用の見える化', 'Usage visibility', '無料枠の残り回数などを表示し、急に使えなくなる驚きを避ける。'),
      T('個人データの扱いを説明', 'Privacy notice', '入力した内容がAIの事業者に送られること、学習に使われるかどうかを分かりやすく書く。'),
      T('読み上げにも配慮', 'Accessibility', 'ストリーミングの表示は、読み上げソフトが1文字ずつ読まないよう、完了時にまとめて知らせる（aria-live の使い方）。'),
      T('AIらしさを出しすぎない', 'Don\'t over-AI', '「AI」を前面に出すより、利用者の目的（早く探せる・楽に書ける）を前面に。AIは手段。'),
    ]),
  ]});
})();
