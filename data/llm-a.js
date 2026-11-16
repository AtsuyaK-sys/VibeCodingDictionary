/* AI組み込み辞典 — A: 共通ヘルパー / LLMの基本 / APIの呼び方 / 出力を形にする / ツールとエージェント */
(function(){
const { $, $$, esc, tbl, seg, seq, stepper } = KIT;
const S = (title, items, note) => ({ title, note, layout:'rows', items });
const C = (title, items, note, lg) => ({ title, note, layout:lg ? 'cards lg' : 'cards', items });
const T = (name, en, desc, prompt, tags, more) => Object.assign({ name, en, desc, prompt, tags }, more || {});
const verdict = (el, cls, html) => { el.classList.remove('ok', 'bad', 'warn'); if (cls) el.classList.add(cls); el.innerHTML = html; };
// 料金（Anthropic API・2026年10月時点の公式価格。1Mトークンあたりのドル）
const MODELS = [
  { id:'claude-opus-5-5', n:'Claude Opus 5.5', inP:4, outP:20, cache:.20, note:'標準のおすすめ。賢さと価格のバランス' },
  { id:'claude-sonnet-5-5', n:'Claude Sonnet 5.5', inP:2, outP:10, cache:.20, note:'速くて安い。日常的な処理・チャット' },
  { id:'claude-haiku-5-5', n:'Claude Haiku 5.5', inP:.10, outP:.50, cache:.01, note:'とても速く安い。分類・抽出・大量処理（入力10万トークン以下の価格）' },
  { id:'claude-fable-5-1', n:'Claude Fable 5.1', inP:10, outP:50, cache:.25, note:'最も高性能。難しい推論・長い自律作業' },
];
// 見た目の目安としてのトークン分割（実際の分け方はモデルごとに違う）
function roughTokens(text){
  const out = []; const re = /( ?[A-Za-z]+| ?\d{1,3}|\s+|[぀-ゟ]{1,2}|[゠-ヿー]{1,2}|[一-鿿々]|[^\sA-Za-z\d])/gu; let m;
  while ((m = re.exec(text))){ const t = m[0]; if (/^ ?[A-Za-z]{8,}$/.test(t)){ for (let i = 0; i < t.length; i += 5) out.push(t.slice(i, i + 5)); } else out.push(t); }
  return out;
}
window.LMH = { S, C, T, verdict, MODELS, roughTokens };

/* ================= 1. LLMの基本 ================= */
const NEXT = { '今日の天気は':[['晴れ', .46], ['雨', .22], ['くもり', .17], ['雪', .06], ['最高', .05], ['分から', .04]], '晴れ':[['です', .52], ['の', .18], ['で', .16], ['！', .09], ['だけど', .05]], '雨':[['です', .41], ['が', .24], ['の', .2], ['なので', .15]], 'くもり':[['です', .5], ['のち', .3], ['で', .2]], '雪':[['です', .45], ['が', .3], ['の', .25]], '最高':[['です', .6], ['！', .4]], '分から':[['ない', .9], ['なかった', .1]], 'です':[['。', .7], ['ね。', .2], ['！', .1]], 'の':[['予報', .5], ['一日', .3], ['ようです', .2]], 'で':[['、', .6], ['しょう', .4]], 'のち':[['晴れ', .6], ['雨', .4]] };
const CTXP = [['システムプロンプト', 2, '#7c3aed'], ['ツールの定義', 3, '#0891b2'], ['資料（検索結果など）', 20, '#d97706'], ['これまでの会話', 15, '#2563eb'], ['今回の質問', 1, '#16a34a'], ['出力（返事）', 4, '#db2777']];

TABS.push({ id:'basics', label:'LLMの基本', icon:'🧠',
  intro:'LLM（大規模言語モデル）は、<b>文章の続きを1語ずつ予測する</b>仕組みです。料金も速さも上限も「トークン」という単位で決まります。まずはトークンと「次の言葉の予測」、1回のリクエストに何が入るのかを触って理解しましょう。',
  sections:[
    C('触って理解する', [
      { name:'トークンとは', en:'Tokens', h:380, tags:['基本','体験'],
        demo:'<div class="kt"><textarea class="kt-in tx" rows="3" aria-label="文章">バイブコーディングで、AIにアプリを作ってもらう。Vibe coding is building software by talking to AI.</textarea><div class="lm-tok kt-grow tk"></div><div class="lm-stats st"></div><div class="kt-note">※色分けは<b>見た目の目安</b>です。実際の分け方はモデルごとに違うので、正確な数はAPIの「トークン数を数える」機能で確認します。</div></div>',
        init:(el) => { const run = () => { const t = $(el, '.tx').value, toks = roughTokens(t); $(el, '.tk').innerHTML = toks.map(x => `<span>${esc(x)}</span>`).join('');
            const cost = toks.length / 1e6 * 4; $(el, '.st').innerHTML = `<div>文字数<b>${[...t].length}</b></div><div>トークン（目安）<b>${toks.length}</b></div><div>入力料金（Opus 5.5）<b>¥${(cost * 150).toFixed(3)}</b></div>`; };
          $(el, '.tx').oninput = run; run(); },
        desc:'LLMは文章を<b>トークン</b>という小さな単位に区切って扱います。英語はだいたい1単語＝1〜数トークン、日本語は1〜2文字で1トークン前後になることが多く、<b>同じ内容でも日本語の方がトークンが多め</b>になりがちです。料金・速さ・入れられる量の上限は、すべてトークンで数えます。',
        prompt:'このアプリでAIに送る文章（システムプロンプト・資料・会話）が、1回あたり何トークンくらいになるか見積もって、1日100回使ったときの月額の目安を計算して。正確な数は messages.countTokens で測るコードも付けて。' },
      { name:'次の言葉を予測する', en:'Next-token prediction', h:400, tags:['仕組み','体験'],
        demo:'<div class="kt"><div class="lm-gen g"></div><div class="kt-lbl">次に来る言葉の確率</div><div class="lm-probs ps"></div><div class="kt-row"><span class="kt-lbl">ばらつき（温度）</span><input type="range" min="1" max="20" value="10" class="tp" aria-label="温度"><b class="kt-mono tv"></b></div><div class="kt-row"><button type="button" class="kt-btn pri nx">1語進める</button><button type="button" class="kt-btn sm rs">最初から</button></div></div>',
        init:(el) => { let text, last;
          const probs = () => { const T2 = +$(el, '.tp').value / 10, base = NEXT[last] || [['。', 1]]; const w = base.map(([t, p]) => [t, Math.pow(p, 1 / T2)]), s = w.reduce((a, x) => a + x[1], 0); return w.map(([t, p]) => [t, p / s]); };
          const draw = (pick) => { $(el, '.g').innerHTML = text; $(el, '.tv').textContent = (+$(el, '.tp').value / 10).toFixed(1); $(el, '.ps').innerHTML = probs().map(([t, p]) => `<div class="${t === pick ? 'pick' : ''}"><span>${esc(t)}</span><i style="width:${p * 100}%"></i><b>${Math.round(p * 100)}%</b></div>`).join(''); };
          const reset = () => { text = '今日の天気は'; last = '今日の天気は'; draw(); };
          $(el, '.nx').onclick = () => { if (!NEXT[last]){ reset(); return; } const P = probs(); let r = Math.random(), pick = P[P.length - 1][0]; for (const [t, p] of P){ if ((r -= p) < 0){ pick = t; break; } } draw(pick); setTimeout(() => { text += `<span class="new">${esc(pick)}</span>`; last = pick; draw(); }, 450); };
          $(el, '.tp').oninput = () => draw(); $(el, '.rs').onclick = reset; reset(); },
        desc:'LLMは「これまでの文章」から<b>次に来る言葉の確率</b>を計算し、1つ選んで付け足す、を繰り返して文章を作ります。確率の高いものだけを選ぶと安定し、ばらつき（温度）を上げると意外な言葉が出やすくなります。同じ質問でも毎回少し違う答えになるのはこのためです。（Claudeの最新のAPIでは温度は指定できず、既定のばらつきで動きます。考える深さは effort で調整します）',
        prompt:'AIの返答が毎回ばらついて困っています。ばらつきを減らして安定させる方法（具体的な指示・例を見せる・出力の形をスキーマで固定する・要約や分類はルールを明示する）を、このアプリの用途に合わせて提案して。' },
      { name:'1回のリクエストの中身', en:'What fills the context', h:400, tags:['仕組み','体験'],
        demo:'<div class="kt"><div class="wf-ctx-like bar" style="display:flex;height:30px;border-radius:8px;overflow:hidden;background:color-mix(in srgb, var(--stage-ink) 7%, transparent);border:1px solid var(--border)"></div><div class="sl" style="display:grid;grid-template-columns:150px 1fr 60px;gap:4px 8px;align-items:center;font-size:11.5px"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const v = CTXP.map(x => x[1]), CAP = 200;
          $(el, '.sl').innerHTML = CTXP.map(([n, , c], i) => `<span><i style="display:inline-block;width:9px;height:9px;border-radius:3px;background:${c};margin-right:5px"></i>${n}</span><input type="range" min="0" max="${i === 2 ? 180 : i === 3 ? 120 : 30}" value="${v[i]}" data-i="${i}" aria-label="${n}"><b class="kt-mono" data-o="${i}"></b>`).join('');
          const run = () => { const used = v.reduce((a, b) => a + b, 0); $(el, '.bar').innerHTML = CTXP.map(([n, , c], i) => `<i style="display:block;height:100%;width:${v[i] / Math.max(CAP, used) * 100}%;background:${c}" title="${n}"></i>`).join(''); v.forEach((x, i) => $(el, `[data-o="${i}"]`).textContent = x + 'k');
            const inTok = used - v[5], cost = (inTok * 4 + v[5] * 20) / 1000; verdict($(el, '.res'), used > CAP ? 'bad' : used > CAP * .7 ? 'warn' : 'ok', `合計 <b>${used}k</b> / ${CAP}k トークン（例として20万で表示）　1回の料金の目安（Opus 5.5）：<b>約${(cost * 150).toFixed(1)}円</b>` + (used > CAP ? '<br>❌ 入りきりません。資料を絞る（RAG）・会話を要約する・古いやりとりを捨てる。' : '')); };
          $$(el, '.sl input').forEach(x => x.oninput = () => { v[+x.dataset.i] = +x.value; run(); }); run(); },
        desc:'AIへの1回のリクエストには、<b>システムプロンプト・ツールの定義・資料・これまでの会話・今回の質問</b>が全部入り、そこに<b>返事（出力）</b>が足されます。これを入れられる上限が<b>コンテキストウィンドウ</b>（最新のClaudeは100万トークン）。入れれば入れるほど料金が上がり、注意も散らばるので、必要なものだけを入れるのが基本です。',
        prompt:'このAI機能で毎回送っているもの（システムプロンプト・資料・会話履歴）のトークン数を内訳で出して、減らせる部分（会話の要約・資料の絞り込み・プロンプトキャッシュ）を提案して。' },
    ], null, true),
    { title:'Claude のモデルの選び方', note:'料金はAnthropic APIの公式価格（1Mトークン＝100万トークンあたり、2026年10月時点）。<b>最新の情報は公式の料金ページで確認</b>してください。迷ったら Opus 5.5 で作り、速さや費用が気になる部分だけ Sonnet・Haiku に切り替えるのがおすすめです。',
      table:{ head:['モデル', 'モデルID', '入力', '出力', '向いている用途'], rows:MODELS.map(m => [m.n, `<code>${m.id}</code>`, `$${m.inP}`, `$${m.outP}`, m.note]) }},
    S('LLMの基本用語', [
      T('LLM（大規模言語モデル）', 'Large Language Model', '大量の文章から学習し、文章の続きを予測するAI。Claude・GPT・Gemini など。'),
      T('トークン', 'Token', 'LLMが文章を扱う単位。料金・速さ・上限はトークンで数える。<b>入力より出力の方が単価が高い</b>（Claudeは5倍）。', null, ['基本']),
      T('コンテキストウィンドウ', 'Context window', '1回に入れられるトークンの上限（入力＋出力）。最新のClaudeは100万トークン。上限内でも、長すぎると細部を見落としやすくなる。'),
      T('プロンプト／システムプロンプト', 'Prompt / system prompt', 'プロンプト＝AIへの入力。システムプロンプト＝役割やルールなど、毎回の前提として渡す指示（「あなたはレシピの専門家です。日本語で…」）。'),
      T('考える深さ（effort・推論）', 'Thinking / effort', '答える前に内部で考えるかどうか・どのくらい考えるか。Claudeは <code>effort</code>（low〜max）で調整。深く考えるほど賢いが、遅く高くなる。'),
      T('ハルシネーション', 'Hallucination', 'もっともらしい作り話。<b>資料を渡す（RAG）・出典を示させる・分からなければ分からないと言わせる</b>で減らす。ゼロにはならない前提で設計する。', null, ['注意']),
      T('知識の締め切り', 'Knowledge cutoff', '学習したデータの最新の時点。それ以降のことは知らない。最新情報が必要なら検索結果や資料を渡す。'),
      T('マルチモーダル', 'Multimodal', '文章だけでなく、画像・PDF・音声なども扱えること。Claudeは画像とPDFを読める。'),
      T('ステートレス', 'Stateless', 'APIは前の会話を覚えていない。会話を続けるには、<b>毎回これまでのやりとりを全部送る</b>。（「APIの呼び方」タブ参照）'),
      T('プロンプト・RAG・ファインチューニング', 'Prompting vs RAG vs fine-tuning', '多くの場合は<b>プロンプトの工夫 → 資料を渡す（RAG）</b>で十分。ファインチューニング（追加学習）は手間と費用が大きく、最初の選択肢ではない。'),
      T('埋め込み（ベクトル）', 'Embedding', '文章の「意味」を数字の並びに変換したもの。意味の近い文章を探すのに使う。（「RAG」タブ参照）'),
      T('エージェント', 'Agent', 'AIが道具（ツール）を使いながら、自分で次の行動を決めて目的を達成する仕組み。（「ツールとエージェント」タブ参照）'),
      T('APIとチャットアプリの違い', 'API vs chat app', 'Claude.ai などのチャットアプリは人が使う画面。APIはプログラムから呼ぶ窓口で、<b>使った分だけ</b>料金がかかる（チャットアプリの月額とは別）。'),
    ]),
  ]});

/* ================= 2. APIの呼び方 ================= */
const ANAT = [['await client.messages.create({', ''], ['  model: "claude-opus-5-5",', 'model', '使うモデルのID。モデルによって賢さ・速さ・料金が違う。'], ['  max_tokens: 16000,', 'max_tokens', '<b>返事の長さの上限</b>（トークン）。小さすぎると途中で切れる（stop_reason が max_tokens）。長い出力ではストリーミングを使う。'], ['  system: "あなたはレシピの専門家です。日本語で簡潔に答えてください。",', 'system', '<b>システムプロンプト</b>。役割・口調・ルール・守ってほしいこと。会話の前提として毎回送る。'], ['  output_config: { effort: "medium" },', 'output_config', '出力の設定。<code>effort</code>＝考える深さ（low / medium / high / xhigh / max）。構造化出力の <code>format</code> もここ。'], ['  messages: [', 'messages', '会話の履歴。<b>APIは前の会話を覚えていない</b>ので、毎回全部送る。'], ['    { role: "user", content: "冷蔵庫に卵と玉ねぎがあります" },', 'role', '発言者。<code>user</code>（利用者）と <code>assistant</code>（AI）が交互に並ぶ。'], ['    { role: "assistant", content: "親子丼はいかがでしょう…" },', ''], ['    { role: "user", content: "鶏肉がない場合は？" },', 'content', '中身。文字のほか、画像・PDF・ツールの結果などのブロックの配列も入れられる。'], ['  ],', ''], ['  tools: [ /* 使わせる道具 */ ],', 'tools', 'AIに使わせるツール（関数）の一覧。（「ツールとエージェント」タブ参照）'], ['});', '']];
const REPLIES = ['いいですね！ 卵と玉ねぎなら、かき玉スープや玉子丼が作れます。', '玉ねぎを甘く炒めてから卵でとじると、ごはんが進みますよ。', '鶏肉がなければ、ツナ缶やちくわでも代用できます。', '冷蔵庫に残りそうなら、オムレツにして冷凍もできます。'];
const STREAM_TEXT = '親子丼の作り方です。まず玉ねぎを薄切りにして、だし・しょうゆ・みりんで煮ます。鶏肉を加えて火が通ったら、溶き卵を2回に分けて回し入れ、ふたをして半熟で火を止めます。ごはんにのせて完成です。';
const STOPS = [['end_turn', 'ok', '返事が自然に終わった', '普通に表示する。'], ['max_tokens', 'warn', '上限（max_tokens）で途中で切れた', '<b>max_tokens を増やす</b>か、続きを頼む。途中で切れたJSONをそのまま使わない。'], ['stop_sequence', '', '指定した区切り文字が出たので止めた', '区切りまでの内容を使う。'], ['tool_use', '', 'AIがツールを使いたがっている', 'ツールを実行して、結果（tool_result）を返して続きを頼む。'], ['pause_turn', 'warn', 'サーバー側のツール（Web検索など）の途中で一時停止', '返ってきた内容をそのまま会話に追加して、もう一度送ると続きから再開する。'], ['refusal', 'bad', '安全上の理由で応答を断った', '内容（content）を表示する前に必ず確認。利用者には丁寧に伝える。別モデルへの自動切り替え（fallbacks）も設定できる。']];

TABS.push({ id:'api', label:'APIの呼び方', icon:'⇄',
  intro:'AIの機能は、<b>自分のサーバーからAIのAPIを呼ぶ</b>ことで組み込みます（APIキーはサーバーに置く。セキュリティ辞典参照）。リクエストの中身、会話の続け方、ストリーミング、止まった理由（stop_reason）の扱いを押さえましょう。コード例は Anthropic の TypeScript SDK（<code>@anthropic-ai/sdk</code>）です。',
  sections:[
    C('触って理解する', [
      { name:'リクエストの中身', en:'Messages API anatomy', h:440, tags:['基本','体験'],
        demo:'<div class="kt"><div class="lm-anat kt-grow an"></div><div class="kt-verdict res">紫色の項目をクリックしてください。</div></div>',
        init:(el) => { $(el, '.an').innerHTML = ANAT.map(([l, k]) => { let h = esc(l).replace(/(&quot;[^&]*?&quot;)/g, '<span class="s">$1</span>').replace(/(\/\*.*\*\/)/, '<span class="c">$1</span>'); if (k) h = h.replace(new RegExp(`\\b${k}\\b`), `<span class="k" data-k="${k}">${k}</span>`); return h; }).join('\n');
          $$(el, '.k').forEach(s => s.onclick = () => { $$(el, '.k').forEach(x => x.classList.toggle('on', x === s)); $(el, '.res').innerHTML = `<b>${s.dataset.k}</b>：${ANAT.find(a => a[1] === s.dataset.k)[2]}`; }); },
        desc:'Claude の API（Messages API）への1回のお願いは、<b>モデル・返事の上限・システムプロンプト・会話の履歴</b>が基本です。必要に応じて、考える深さ（effort）、ツール、出力の形（format）を足します。返事には、本文・止まった理由（stop_reason）・使ったトークン数（usage）が入っています。',
        prompt:'Next.js の Route Handler（app/api/chat/route.ts）で、Anthropic の TypeScript SDK を使って Claude を呼ぶ最小のコードを書いて。モデルは claude-opus-5-5、APIキーは環境変数から読み、ログイン中のユーザーだけが使えるようにして。',
        code:'import Anthropic from "@anthropic-ai/sdk";\nconst client = new Anthropic(); // 環境変数 ANTHROPIC_API_KEY を自動で読む\n\nconst response = await client.messages.create({\n  model: "claude-opus-5-5",\n  max_tokens: 16000,\n  system: "あなたはレシピの専門家です。日本語で簡潔に答えてください。",\n  messages: [{ role: "user", content: "卵と玉ねぎで作れる料理は？" }],\n});\nfor (const block of response.content) {\n  if (block.type === "text") console.log(block.text);\n}\nconsole.log(response.stop_reason, response.usage); // 止まった理由・使ったトークン数' },
      { name:'会話は毎回ぜんぶ送る', en:'Stateless conversation', h:430, tags:['体験','最重要'],
        demo:'<div class="kt"><div class="lm-two kt-grow" style="min-height:0"><div class="lm-chat ch"></div><div class="lm-req rq"></div></div><div class="kt-row"><input class="kt-in ip" value="鶏肉がない場合は？" aria-label="メッセージ" style="flex:1"><button type="button" class="kt-btn pri sd">送信</button></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const msgs = [], SYS = 'あなたはレシピの専門家です。'; let n = 0;
          const draw = () => { $(el, '.ch').innerHTML = '<div class="b sys">（システム）' + SYS + '</div>' + msgs.map(m => `<div class="b ${m.role === 'user' ? 'u' : 'a'}">${esc(m.content)}</div>`).join(''); $(el, '.ch').scrollTop = 1e6;
            $(el, '.rq').innerHTML = `<span class="n">// ${msgs.filter(m => m.role === 'user').length}回目に送るリクエスト</span>\n{\n  "system": "${SYS}",\n  "messages": [\n` + msgs.map((m, i) => `    ${i === msgs.length - 1 ? '<span class="r">' : ''}{ "role": "${m.role}", "content": "${esc(m.content)}" }${i === msgs.length - 1 ? '</span>' : ''}`).join(',\n') + '\n  ]\n}'; $(el, '.rq').scrollTop = 1e6;
            const tok = roughTokens(SYS + msgs.map(m => m.content).join('')).length; verdict($(el, '.res'), msgs.length > 8 ? 'warn' : '', `送るトークン（目安）：<b>${tok}</b>。会話が長くなるほど、<b>毎回送る量と料金が増えていきます</b>。` + (msgs.length > 8 ? '古いやりとりの要約・削除を検討しましょう。' : '')); };
          $(el, '.sd').onclick = () => { const t = $(el, '.ip').value.trim() || '他には？'; msgs.push({ role:'user', content:t }); draw(); setTimeout(() => { msgs.push({ role:'assistant', content:REPLIES[n++ % REPLIES.length] }); draw(); }, 350); $(el, '.ip').value = ['他のアイデアは？', '10分で作れるものは？', 'お弁当向きなのは？'][n % 3]; };
          msgs.push({ role:'user', content:'冷蔵庫に卵と玉ねぎがあります' }, { role:'assistant', content:'親子丼や玉子丼はいかがでしょう。' }); draw(); },
        desc:'APIは<b>前の会話を覚えていません</b>。会話を続けるには、これまでのやりとりを全部まとめて毎回送ります（右側の赤い行が今回の追加分）。つまり会話が長くなるほど、1回の料金と待ち時間が増えます。長い会話は、要約して短くする・古い部分を捨てる・<b>プロンプトキャッシュ</b>で同じ部分を安くする、で対策します。',
        prompt:'チャット機能の会話履歴を、DBに保存して毎回 messages として送る形で実装して。20往復を超えたら古い部分を要約して短くし、システムプロンプトと過去の履歴はプロンプトキャッシュが効くようにして。' },
      { name:'ストリーミング（少しずつ表示）', en:'Streaming', h:400, tags:['体験','UX'],
        demo:'<div class="kt"><div class="lm-two"><div class="lm-pane a"><b>一括で受け取る</b><div class="t"></div></div><div class="lm-pane b"><b>ストリーミング</b><div class="t"></div></div></div><div class="lm-ev ev"></div><div class="kt-row"><button type="button" class="kt-btn pri go">同時に送信</button></div></div>',
        init:(el) => { let timers = []; const clear = () => { timers.forEach(clearTimeout); timers = []; };
          $(el, '.go').onclick = () => { clear(); const A = $(el, '.a .t'), B = $(el, '.b .t'), ev = $(el, '.ev'); A.innerHTML = '<span class="lm-spin"></span> 待っています…'; B.innerHTML = ''; ev.innerHTML = ''; const total = STREAM_TEXT.length * 45;
            const log = (t) => { ev.insertAdjacentHTML('beforeend', `<div class="on">${t}</div>`); const d = ev.children; if (d.length > 1) d[d.length - 2].classList.remove('on'); ev.scrollTop = 1e6; };
            timers.push(setTimeout(() => log('message_start'), 300)); timers.push(setTimeout(() => log('content_block_start（text）'), 450));
            [...STREAM_TEXT].forEach((c, i) => timers.push(setTimeout(() => { B.innerHTML = esc(STREAM_TEXT.slice(0, i + 1)) + '<span class="lm-caret"></span>'; if (i % 12 === 0) log(`content_block_delta（text_delta）"${esc(STREAM_TEXT.slice(i, i + 6))}…"`); }, 600 + i * 45)));
            timers.push(setTimeout(() => { B.innerHTML = esc(STREAM_TEXT); log('content_block_stop'); log('message_delta（stop_reason: end_turn, usage）'); log('message_stop'); A.innerHTML = esc(STREAM_TEXT); }, 700 + total)); };
          return clear; },
        desc:'長い返事は、全部できあがるまで待つと何秒も画面が止まって見えます。<b>ストリーミング</b>にすると、できた部分から少しずつ届くので、体感がずっと速くなります。チャット画面ではほぼ必須。届く順番は <code>message_start</code> → <code>content_block_delta</code>（文字の断片）… → <code>message_stop</code>。長い出力ではタイムアウト防止のためにも使います。',
        prompt:'AIの返事をストリーミングで画面に表示して。Next.js の Route Handler で Anthropic SDK の messages.stream を使い、テキストの断片をブラウザに順番に送る。画面側は届いた分から表示し、「停止」ボタンで途中で止められるようにして。',
        code:'const stream = client.messages.stream({\n  model: "claude-opus-5-5",\n  max_tokens: 64000,\n  messages: [{ role: "user", content: "親子丼の作り方を教えて" }],\n});\nfor await (const event of stream) {\n  if (event.type === "content_block_delta" && event.delta.type === "text_delta") {\n    send(event.delta.text); // 届いた断片を画面へ\n  }\n}\nconst message = await stream.finalMessage(); // 最後に全体（usage なども）' },
      { name:'止まった理由（stop_reason）', en:'Handling stop reasons', h:340, tags:['実装の注意'],
        demo:'<div class="kt"><span class="sw"></span><div class="kt-code c"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.sw').replaceWith(seg(STOPS.map(s => s[0]), i => { const [k, v, mean, todo] = STOPS[i]; $(el, '.c').textContent = `response.stop_reason === "${k}"`; verdict($(el, '.res'), v, `<b>意味：</b>${mean}<br><b>アプリの対応：</b>${todo}`); }).el); },
        desc:'返事には「なぜ止まったか」（<code>stop_reason</code>）が付いています。普通は <code>end_turn</code> ですが、<b>上限で切れた</b>（max_tokens）、<b>ツールを使いたい</b>（tool_use）、<b>安全上の理由で断った</b>（refusal）なども。これを見ずに本文だけ表示すると、途中で切れた文章や壊れたJSONをそのまま使ってしまいます。',
        prompt:'AIを呼んでいる処理で stop_reason を確認していない箇所を探して、end_turn・max_tokens・tool_use・refusal・pause_turn それぞれの場合の処理を追加して。refusal のときは利用者に分かりやすいメッセージを出して。' },
    ], null, true),
    { title:'APIのエラーと対処', note:'SDKは 429・5xx などを<b>自動で2回まで再試行</b>します（設定で変更可）。再試行しても失敗したときの、利用者への見せ方を決めておきましょう。',
      table:{ head:['ステータス', '種類', '再試行', '原因と対処'], rows:[
        ['400', 'invalid_request_error', '×', 'リクエストの形が違う。パラメータ名・モデルIDの打ち間違い、廃止されたパラメータなど'],
        ['401', 'authentication_error', '×', 'APIキーが違う・設定されていない。環境変数とデプロイ先の設定を確認'],
        ['402', 'billing_error', '×', '支払い・クレジットの問題。管理画面で残高・支払い方法を確認'],
        ['403', 'permission_error', '×', 'そのキーでは使えない機能・モデル'],
        ['404', 'not_found_error', '×', 'URLやモデルIDが存在しない、または組織で使えない'],
        ['413', 'request_too_large', '×', 'リクエストが大きすぎる（画像・PDF・長文）。分割・縮小する'],
        ['429', 'rate_limit_error', '○', '使いすぎ（回数・トークン数の上限）。少し待って再試行（retry-after ヘッダー）。上限の引き上げや利用者ごとの回数制限も'],
        ['500', 'api_error', '○', 'サービス側の問題。時間をおいて再試行'],
        ['529', 'overloaded_error', '○', '一時的な混雑。待って再試行。利用者には「混み合っています」と表示'],
      ]}},
    S('APIを使うときの知識', [
      T('APIキーはサーバーに', 'Keep keys server-side', 'ブラウザから直接呼ばない。自分のサーバー（API Route・Edge Function）を経由し、ログイン確認と回数制限を入れる。（セキュリティ辞典参照）', null, ['最重要']),
      T('SDK を使う', 'Official SDKs', 'Anthropic は TypeScript・Python・Java・Go・Ruby・C#・PHP の公式SDKを提供。再試行・型・ストリーミングの便利機能が入っている。自前で fetch するより安全。'),
      T('max_tokens', 'Output limit', '返事の上限。小さすぎると途中で切れる。普通の返事なら1万台、長い出力はストリーミングで大きめに。分類のような短い出力なら小さく。'),
      T('考える深さ（effort）', 'output_config.effort', 'low・medium・high・xhigh・max。深いほど賢く遅く高い。チャットや分類は low〜medium、難しい分析やコーディングは high 以上が目安。'),
      T('温度（temperature）について', 'Sampling parameters', '多くのLLMでは「ばらつき」を temperature で指定できるが、Claude の最新のAPIバージョン（2026-10-21）では temperature・top_p・top_k は送るとエラーになる。安定させたいときは、具体的な指示・例・出力の形の指定で調整する。', null, ['注意']),
      T('使ったトークン数（usage）', 'usage', '返事に、入力・出力・キャッシュのトークン数が入っている。<b>ログに残して</b>、利用者ごとの費用を把握する。'),
      T('トークン数を事前に数える', 'Token counting', '<code>client.messages.countTokens({...})</code> で、送る前に入力トークン数を正確に数えられる。長い資料を入れる前の確認に。'),
      T('画像を読ませる', 'Vision', 'content に画像のブロックを入れる。URL か Base64。レシートの読み取り・画面の説明・図の解説などに。', null, null, { code:'messages: [{ role: "user", content: [\n  { type: "image", source: { type: "url", url: "https://example.com/receipt.png" } },\n  { type: "text", text: "このレシートの店名・日付・合計金額を読み取って" },\n] }]' }),
      T('PDFを読ませる', 'PDF input', 'document ブロックでPDFを渡せる（目安：32MB・600ページまで）。図や表も読める。'),
      T('バッチ処理', 'Message Batches', '急がない大量の処理は、まとめて送ると<b>料金が半額</b>。結果は後で受け取る（数分〜最大24時間）。夜間の要約・分類・翻訳に。'),
      T('再試行とバックオフ', 'Retries / backoff', '429・500・529 は少し待って再試行。待ち時間を徐々に伸ばす（指数バックオフ）。SDKが自動で行うので、回数とタイムアウトだけ設定する。'),
      T('タイムアウト', 'Timeouts', '長い返事は数十秒〜数分かかることがある。サーバーレスの実行時間の上限（Vercel など）に注意し、ストリーミングやバックグラウンド処理を使う。'),
      T('安全上の拒否への備え', 'Refusals', '<code>stop_reason: "refusal"</code> を確認する。Claude の新しいモデルでは、拒否されたときに別のモデルで自動的に再試行するサーバー側のフォールバック（<code>fallbacks</code>）も使える。', null, null, { code:'const response = await client.beta.messages.create({\n  model: "claude-opus-5-5",\n  max_tokens: 16000,\n  betas: ["server-side-fallback-2026-07-01"],\n  fallbacks: "default", // 拒否されたら適切なモデルで自動再試行\n  messages: [{ role: "user", content: "…" }],\n});\nif (response.stop_reason === "refusal") {\n  // 本文を使わず、利用者に丁寧に伝える\n}' }),
      T('他社のAPI・共通化', 'Other providers', 'OpenAI・Google（Gemini）なども似た形のAPIを提供。複数を切り替えたいなら Vercel AI SDK などの共通化ライブラリもある。ただし細かい機能（キャッシュ・ツール・構造化出力）は各社で違う。'),
    ]),
  ]});

/* ================= 3. 出力を形にする ================= */
const MAIL = '件名：注文の件\n山田と申します。先週注文したドリッパー（注文番号 A-1043）がまだ届きません。来週の土曜に使いたいので、急ぎで確認をお願いします。連絡先は yamada@example.com です。';
const FREE = ['山田さんから、注文番号A-1043のドリッパーが届いていないという問い合わせです。急ぎのようです。メールは yamada@example.com。', '■お名前：山田様\n■内容：配送遅延（A-1043）\n■優先度：高\n※来週土曜までに必要とのこと', 'この問い合わせは配送に関するもので、顧客の山田さんは商品の到着を急いでいます。注文番号はA-1043です。'];
const JSON_OUT = '{\n  "name": "山田",\n  "email": "yamada@example.com",\n  "order_id": "A-1043",\n  "category": "配送",\n  "urgency": "高",\n  "summary": "ドリッパーが未着。来週土曜までに必要"\n}';
const TYPES = ['string', 'number', 'boolean', 'enum', 'array'];

TABS.push({ id:'output', label:'出力を形にする', icon:'{}',
  intro:'AIの返事を<b>画面に表示するだけ</b>でなく、DBに保存したり、条件分岐に使ったりするなら、<b>決まった形（JSON）</b>で受け取る必要があります。自由な文章と、スキーマ（形の設計図）で受け取る場合の違いを触って確かめましょう。',
  sections:[
    C('触って理解する', [
      { name:'自由な文章とスキーマ付きJSON', en:'Free text vs structured output', h:460, tags:['最重要','体験'],
        demo:'<div class="kt"><div class="kt-lbl">問い合わせメール</div><div class="kt-code">' + esc(MAIL) + '</div><div class="kt-row"><span class="sw"></span><button type="button" class="kt-btn sm ag">もう一度生成</button></div><div class="kt-code kt-grow o" style="overflow:auto;min-height:0"></div><div class="kt-row"><button type="button" class="kt-btn pri ps">プログラムで読み取る（JSON.parse → 検証）</button></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let mode = 0, k = 0; const draw = () => { $(el, '.o').textContent = mode ? JSON_OUT : FREE[k % FREE.length]; verdict($(el, '.res'), '', mode ? '毎回この形で返ってきます。' : '同じお願いでも、生成するたびに書き方が変わります。'); };
          $(el, '.sw').replaceWith(seg(['自由に答えてもらう', 'スキーマで受け取る'], i => { mode = i; draw(); }).el);
          $(el, '.ag').onclick = () => { k++; draw(); };
          $(el, '.ps').onclick = () => { try{ const o = JSON.parse($(el, '.o').textContent); const okk = ['name', 'email', 'order_id', 'category', 'urgency'].every(x => x in o); verdict($(el, '.res'), okk ? 'ok' : 'warn', okk ? `✅ 読み取り成功。<code>urgency === "高"</code> なら担当者に通知、<code>category</code> で振り分け…と、<b>プログラムで扱えます</b>。` : '⚠ 必要な項目が足りません。'); }catch(e){ verdict($(el, '.res'), 'bad', `❌ <b>${esc(e.message.slice(0, 60))}</b> — 文章なので読み取れません。正規表現で無理やり抜き出すと、書き方が変わったときに壊れます。`); } }; },
        desc:'自由な文章は人が読むには良いですが、プログラムで扱うには不向きです。<b>構造化出力</b>（Claudeでは <code>output_config.format</code>）でJSONスキーマを指定すると、<b>必ずその形のJSON</b>で返ってきます。TypeScriptなら zod でスキーマを書き、<code>messages.parse</code> で検証済みのデータを受け取れます。',
        prompt:'問い合わせメールから、名前・メール・注文番号・分類（配送／返品／支払い／その他）・緊急度（高／中／低）・要約を抽出する処理を、Anthropic SDK の構造化出力（zod のスキーマと messages.parse）で実装して。',
        code:'import { z } from "zod";\nimport { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";\n\nconst Inquiry = z.object({\n  name: z.string(),\n  email: z.string(),\n  order_id: z.string().nullable(),\n  category: z.enum(["配送", "返品", "支払い", "その他"]),\n  urgency: z.enum(["高", "中", "低"]),\n  summary: z.string(),\n});\n\nconst response = await client.messages.parse({\n  model: "claude-opus-5-5",\n  max_tokens: 16000,\n  messages: [{ role: "user", content: `次のメールから情報を抽出して：\\n${mail}` }],\n  output_config: { format: zodOutputFormat(Inquiry) },\n});\nconst data = response.parsed_output; // 型付きのデータ（失敗時は null）' },
      { name:'スキーマを組み立てる', en:'Schema builder', h:480, wide:true, tags:['体験'],
        demo:'<div class="kt"><div class="kt-row kt-split" style="align-items:stretch;flex-wrap:nowrap;gap:10px;flex:1;min-height:0"><div style="flex:1;display:flex;flex-direction:column;gap:5px;min-height:0;overflow:auto"><div class="fs" style="display:flex;flex-direction:column;gap:4px"></div><button type="button" class="kt-btn sm add" style="align-self:flex-start">＋ 項目を追加</button></div><div style="flex:1;display:flex;flex-direction:column;gap:4px;min-height:0"><span class="sw"></span><div class="kt-code kt-grow o" style="overflow:auto;min-height:0;white-space:pre"></div></div></div></div>',
        init:(el) => { let view = 0; const F0 = [['title', 'string', true, 'レシピ名'], ['minutes', 'number', true, '調理時間（分）'], ['difficulty', 'enum', true, 'かんたん,ふつう,むずかしい'], ['ingredients', 'array', true, '材料の名前'], ['vegetarian', 'boolean', false, '肉・魚を使わないか']];
          const row = ([n, t, r, d]) => `<div style="display:grid;grid-template-columns:1fr 84px 1.2fr 20px 20px;gap:4px;align-items:center;font-size:11px"><input class="kt-in mono n" value="${esc(n)}" aria-label="項目名"><select class="t" style="font:12px var(--font);border-radius:7px;border:1px solid var(--border-strong);background:var(--surface);color:var(--text)">${TYPES.map(x => `<option ${x === t ? 'selected' : ''}>${x}</option>`).join('')}</select><input class="kt-in d" value="${esc(d)}" aria-label="説明" title="enum のときはカンマ区切りで選択肢"><input type="checkbox" class="r" ${r ? 'checked' : ''} title="必須"><button type="button" class="kt-btn sm x" title="削除" style="padding:1px 4px">×</button></div>`;
          const read = () => $$(el, '.fs > div').map(d => [$(d, '.n').value.trim() || 'field', $(d, '.t').value, $(d, '.r').checked, $(d, '.d').value.trim()]);
          const run = () => { const F = read(); let out;
            if (view === 0) out = 'const Recipe = z.object({\n' + F.map(([n, t, r, d]) => `  ${n}: ${t === 'enum' ? `z.enum([${d.split(/[,、]/).map(s => `"${s.trim()}"`).join(', ')}])` : t === 'array' ? 'z.array(z.string())' : `z.${t}()`}${t !== 'enum' && d ? `.describe("${d}")` : ''}${r ? '' : '.nullable()'},`).join('\n') + '\n});';
            else if (view === 1) out = JSON.stringify({ type:'object', properties:Object.fromEntries(F.map(([n, t, r, d]) => [n, t === 'enum' ? { type:'string', enum:d.split(/[,、]/).map(s => s.trim()) } : t === 'array' ? { type:'array', items:{ type:'string' }, description:d } : { type:t, description:d }])), required:F.filter(f => f[2]).map(f => f[0]), additionalProperties:false }, null, 2);
            else out = JSON.stringify(Object.fromEntries(F.map(([n, t, , d]) => [n, t === 'string' ? '親子丼' : t === 'number' ? 20 : t === 'boolean' ? false : t === 'enum' ? d.split(/[,、]/)[0].trim() : ['鶏もも肉', '玉ねぎ', '卵']])), null, 2);
            $(el, '.o').textContent = out; };
          const bind = () => { $$(el, '.fs input, .fs select').forEach(x => { x.oninput = run; x.onchange = run; }); $$(el, '.fs .x').forEach(b => b.onclick = () => { b.parentNode.remove(); run(); }); };
          $(el, '.fs').innerHTML = F0.map(row).join(''); bind();
          $(el, '.add').onclick = () => { $(el, '.fs').insertAdjacentHTML('beforeend', row(['new_field', 'string', false, ''])); bind(); run(); };
          $(el, '.sw').replaceWith(seg(['zod（TypeScript）', 'JSON Schema', '返ってくる例'], i => { view = i; run(); }).el); },
        desc:'項目名・型・必須かどうか・説明を決めると、TypeScriptの <b>zod</b>、汎用の <b>JSON Schema</b>、実際に返ってくるデータの例が同時にできあがります。<b>説明（description）</b>はAIへのヒントにもなるので、「単位は分」「日本語で」などを書くと精度が上がります。選択肢が決まっている項目は enum にすると、表記ゆれが起きません。',
        prompt:'AIに抽出させたい項目（項目名・型・必須・説明）の一覧を渡すので、zod のスキーマと、Anthropic SDK の messages.parse で使うコードを書いて。選択肢がある項目は enum に、分からない場合に null を許す項目も提案して。' },
    ], null, true),
    S('AIにやらせる処理の型', [
      T('分類', 'Classification', '問い合わせの種類・感情・優先度・スパムかどうか。<b>選択肢を enum で固定</b>すると安定する。軽いモデル（Haiku）でも得意。', '問い合わせを「配送・返品・支払い・アカウント・その他」に分類する処理を、構造化出力（enum）で実装して。判断に迷う例を5つ作って、テストも書いて。', ['定番']),
      T('抽出', 'Extraction', '文章や画像から、名前・日付・金額などを取り出す。レシート・名刺・請求書・メール。見つからない項目は null を許す。'),
      T('要約', 'Summarization', '長い文章を短く。<b>長さ・観点・形式</b>（箇条書き3つ・100字）を指定する。原文にないことを書かないよう指示する。'),
      T('変換・言い換え', 'Transformation', '敬語に・子ども向けに・箇条書きを文章に・英訳。元の意味を変えない制約を付ける。'),
      T('生成（下書き）', 'Generation', '商品説明・メール文・SNS投稿の下書き。<b>人が直してから使う</b>前提の画面にする。'),
      T('採点・評価', 'Scoring', '文章の質・回答の正しさを基準に沿って採点。基準（ルーブリック）を具体的に書く。'),
      T('正規化・表記ゆれの統一', 'Normalization', '住所・会社名・商品名の表記ゆれをそろえる。結果は人が確認できるようにする。'),
      T('質問応答（資料あり）', 'Grounded Q&A', '社内文書やFAQを根拠に答える。資料は「RAG」タブの方法で渡す。'),
    ]),
    S('出力の扱いのコツ', [
      T('構造化出力', 'output_config.format', 'JSONスキーマを指定して、必ずその形で返させる機能。古い <code>output_format</code> は非推奨。', null, ['おすすめ']),
      T('zod と messages.parse', 'Zod helper', 'TypeScriptなら zod でスキーマを書き、<code>zodOutputFormat()</code> で渡し、<code>messages.parse</code> で検証済みの <code>parsed_output</code> を受け取る。'),
      T('説明文を書く', 'Field descriptions', 'スキーマの各項目に説明を書くと、AIへの指示にもなる。単位・形式・判断基準を書く。'),
      T('null を許す', 'Nullable fields', '文章に情報がないとき、AIは無理に埋めようとする（作り話）。「分からなければ null」を許すと正直になる。'),
      T('検証して、だめなら再試行', 'Validate & retry', '受け取ったデータが業務ルールに合うか（日付が未来すぎないか等）をコードで確かめる。合わなければ理由を添えてやり直させる。'),
      T('Markdownを表示するときは無害化', 'Sanitize Markdown', 'AIの返事をMarkdownとしてHTMLに変換して表示するなら、DOMPurify などでサニタイズする（XSS対策。セキュリティ辞典参照）。'),
      T('引用（出典）を付けさせる', 'Citations', '資料を渡したときに、答えの根拠になった部分を示させる機能。Claudeは document ブロックで citations を有効にできる。利用者が確かめられる。'),
      T('長い出力は分ける', 'Chunk long outputs', '一度に大量の項目を生成させず、分けて頼む。途中で切れても被害が小さい。'),
    ]),
  ]});

/* ================= 4. ツールとエージェント ================= */
const AGENT = [
  { st:'—', m:'利用者：「東京と大阪の明日の天気を比べて、傘が必要か教えて」', note:'AIに渡すツール：<code>get_weather(city)</code>・<code>send_email(to, body)</code>' },
  { st:'tool_use', m:'🤖 get_weather("東京") と get_weather("大阪") を同時に呼びたい', note:'AIは自分で天気を知らないので、<b>ツールを使いたい</b>と返します（2つ同時＝並列ツール呼び出し）。' },
  { st:'（アプリ）', m:'🖥 天気APIを呼んで結果を返す：東京「雨 80%」／大阪「晴れ 10%」', note:'ツールを実行するのは<b>あなたのアプリ</b>。結果を tool_result として会話に足し、もう一度AIに送ります。' },
  { st:'tool_use', m:'🤖 send_email("me@example.com", "明日は東京で傘が必要です")', note:'AIが「メールでも知らせよう」と判断。<b>送信のような外に影響する操作</b>は、承認を挟むのが安全です。', gate:true },
  { st:'end_turn', m:'🤖「明日の東京は雨（降水確率80%）なので傘が必要です。大阪は晴れの予報です。」', note:'必要な情報がそろったので、最終的な答えを返して終了（end_turn）。これが<b>エージェントのループ</b>です。' },
];
const TIERS = [['1回の呼び出し', '<span class="n">入力</span><i>→</i><span class="n ai">AI</span><i>→</i><span class="n">出力</span>', '要約・分類・抽出・翻訳など。<b>まずはこれで済まないか考える</b>。速く安く、結果も安定。'], ['ワークフロー', '<span class="n">入力</span><i>→</i><span class="n ai">AI①抽出</span><i>→</i><span class="n tool">コードで判定</span><i>→</i><span class="n ai">AI②返信文</span><i>→</i><span class="n">出力</span>', '手順が決まっている処理を、<b>コードが順番を制御</b>して、途中にAIを挟む。予測しやすく、テストしやすい。'], ['エージェント', '<span class="n">目的</span><i>→</i><span class="n ai">AI</span><i>⇄</i><span class="n tool">ツール</span><i>⇄</i><span class="n tool">ツール</span><i>→</i><span class="n">結果</span>', '何をどの順でやるかを<b>AIが自分で決める</b>。調査・コーディングなど手順を書ききれない作業向け。費用・時間・失敗の幅が大きいので、価値と取り返しのつきやすさを確認してから。']];

TABS.push({ id:'tools', label:'ツールとエージェント', icon:'🛠',
  intro:'AIは文章を作るだけでなく、<b>ツール（関数）を呼び出す</b>ことで、天気を調べる・DBを検索する・メールを送る、といった行動ができます。ツールを使いながら自分で次の行動を決める仕組みが<b>エージェント</b>です。ただし、まずは一番シンプルな形で済まないかを考えましょう。',
  sections:[
    C('触って理解する', [
      { name:'ツール呼び出しの流れ', en:'Tool use flow', h:430, tags:['仕組み','最重要'],
        init:(el) => seq(el, { actors:[{ icon:'🧑', label:'利用者' }, { icon:'🖥', label:'あなたのアプリ' }, { icon:'🤖', label:'Claude' }, { icon:'☁', label:'天気API' }], steps:[
          { f:0, t:1, label:'「明日の東京の天気は？」', note:'利用者が質問します。' },
          { f:1, t:2, label:'質問＋ツールの定義を送る', note:'アプリは質問と一緒に、<b>使えるツールの説明</b>（名前・説明・引数の形）を送ります。' },
          { f:2, t:1, label:'tool_use：get_weather("東京")', dash:true, note:'AIは「天気は自分では分からないので、このツールを使いたい」と返します（stop_reason が tool_use）。<b>AI自身は実行しません</b>。' },
          { f:1, t:3, label:'天気APIを呼ぶ', note:'実際にツールを実行するのは、あなたのアプリです。ここで権限の確認もできます。' },
          { f:3, t:1, label:'雨・降水確率80%', dash:true, note:'結果を受け取ります。' },
          { f:1, t:2, label:'tool_result を付けてもう一度送る', note:'これまでの会話＋ツールの結果を送ります。' },
          { f:2, t:1, label:'「明日は雨です。傘を…」', dash:true, good:true, note:'AIが結果を使って答えます（end_turn）。' },
          { f:1, t:0, label:'答えを表示', dash:true, good:true, note:'利用者には最終的な答えだけを見せます。' },
        ]}),
        desc:'ツール呼び出し（function calling / tool use）では、<b>AIは「このツールをこの引数で使いたい」と頼むだけ</b>で、実行するのはあなたのアプリです。だからこそ、実行前に権限や内容を確認できます。ツールの<b>説明文</b>が、AIがいつ・どう使うかを決める一番大事な情報です。',
        prompt:'このアプリに「注文状況を調べる」ツールを持つAIアシスタントを実装して。ツールの定義（name・description・input_schema）を書き、AIが tool_use を返したらサーバーでログイン中のユーザーの注文だけを検索して tool_result を返し、最終的な答えを表示するループを Anthropic SDK で作って。',
        code:'const tools: Anthropic.Tool[] = [{\n  name: "get_weather",\n  description: "指定した都市の明日の天気と降水確率を返す。天気や傘の必要性を聞かれたときに使う。",\n  input_schema: {\n    type: "object",\n    properties: { city: { type: "string", description: "都市名（例：東京）" } },\n    required: ["city"],\n  },\n}];\n\nlet messages: Anthropic.MessageParam[] = [{ role: "user", content: question }];\nwhile (true) {\n  const res = await client.messages.create({ model: "claude-opus-5-5", max_tokens: 16000, tools, messages });\n  if (res.stop_reason !== "tool_use") break; // end_turn などで終了\n  messages.push({ role: "assistant", content: res.content });\n  const results = [];\n  for (const b of res.content) if (b.type === "tool_use") {\n    results.push({ type: "tool_result", tool_use_id: b.id, content: await runTool(b.name, b.input) });\n  }\n  messages.push({ role: "user", content: results }); // 結果はまとめて1つのメッセージで\n}' },
      { name:'エージェントのループ', en:'Agent loop', h:440, tags:['体験'],
        demo:'<div class="kt"><div class="kt-row"><label class="kt-lbl" style="display:flex;gap:4px;align-items:center"><input type="checkbox" class="gt" checked>メール送信は人の承認が必要</label><span class="kt-lbl lp" style="margin-left:auto"></span></div><div class="lm-chat kt-grow ch"></div><div class="kt-verdict res"></div><div class="kt-row"><button type="button" class="kt-btn pri nx">次へ ▶</button><button type="button" class="kt-btn sm ok" style="display:none">✓ 承認する</button><button type="button" class="kt-btn sm bad ng" style="display:none">✕ 却下する</button><button type="button" class="kt-btn sm rs">最初から</button></div></div>',
        init:(el) => { let k = 0, loops = 0; const ch = $(el, '.ch');
          const show = () => { const s = AGENT[k]; ch.insertAdjacentHTML('beforeend', `<div class="b ${k === 0 ? 'u' : /🖥/.test(s.m) ? 'sys' : 'a'}">${s.m}${s.st !== '—' ? `<br><small style="opacity:.7">stop_reason: ${s.st}</small>` : ''}</div>`); ch.scrollTop = 1e6; if (s.st === 'tool_use') loops++; $(el, '.lp').textContent = `ループ ${loops} 回目`; $(el, '.res').innerHTML = s.note;
            const gate = s.gate && $(el, '.gt').checked; $(el, '.nx').style.display = gate ? 'none' : ''; $(el, '.ok').style.display = $(el, '.ng').style.display = gate ? '' : 'none'; };
          const reset = () => { k = 0; loops = 0; ch.innerHTML = ''; show(); };
          $(el, '.nx').onclick = () => { if (k >= AGENT.length - 1){ reset(); return; } k++; show(); };
          $(el, '.ok').onclick = () => { ch.insertAdjacentHTML('beforeend', '<div class="b sys">✓ 人が承認 → メールを送信しました</div>'); k++; show(); };
          $(el, '.ng').onclick = () => { ch.insertAdjacentHTML('beforeend', '<div class="b sys">✕ 却下 → tool_result に「利用者が送信を断りました」と返す</div>'); k++; show(); };
          $(el, '.rs').onclick = reset; reset(); },
        desc:'エージェントは「<b>AIが考える → ツールを頼む → アプリが実行して結果を返す</b>」を、AIが「もう十分」と判断するまで繰り返します。便利な反面、どこまでも続いたり、意図しない操作をしたりするので、<b>ループの上限・使えるツールの限定・外に影響する操作の承認</b>が欠かせません。',
        prompt:'エージェント機能に安全装置を付けて。ループは最大10回、1回の実行あたりのトークン上限、使えるツールはこの3つだけ、メール送信と削除は実行前に利用者の承認を求める（却下されたら tool_result でそれを伝える）、すべてのツール呼び出しをログに残す。' },
      { name:'1回・ワークフロー・エージェント', en:'Choosing the simplest tier', h:340, tags:['設計','比較'],
        demo:'<div class="kt"><span class="sw"></span><div class="lm-tier tr" style="min-height:70px"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.sw').replaceWith(seg(TIERS.map(t => t[0]), i => { $(el, '.tr').innerHTML = TIERS[i][1]; $(el, '.res').innerHTML = TIERS[i][2]; }).el); },
        desc:'AI機能は<b>単純な形から考えます</b>。1回の呼び出しで済むならそれが一番。手順が決まっているなら、コードが順番を決める「ワークフロー」。エージェントは、手順を書ききれない・価値が費用に見合う・AIが得意・失敗しても取り返せる、の4つがそろうときに選びます。',
        prompt:'作りたいAI機能（〇〇）について、1回の呼び出し・ワークフロー・エージェントのどれで作るべきか、理由とともに提案して。エージェントにするなら、ツールの一覧と安全装置も設計して。' },
    ], null, true),
    S('ツールとエージェントの知識', [
      T('ツールの定義', 'Tool definition', 'name（名前）・description（いつ・何に使うか）・input_schema（引数の形）。<b>説明文が最重要</b>。「こういうときに使う／使わない」まで書く。', null, ['最重要']),
      T('引数を厳密にする（strict）', 'strict: true', 'ツールの定義に <code>strict: true</code> を付けると、引数が必ずスキーマどおりになる（additionalProperties: false と required が必要）。'),
      T('並列ツール呼び出し', 'Parallel tool use', 'AIは1回の返事で複数のツールを同時に頼むことがある。全部実行して、<b>結果は1つのメッセージにまとめて</b>返す。'),
      T('ツールの失敗を伝える', 'is_error', 'ツールが失敗したら、捨てずに <code>is_error: true</code> の tool_result で理由を返す。AIが別の方法を考えられる。'),
      T('ループの上限と予算', 'Loop limits', 'エージェントは止まらないことがある。最大回数・トークン上限・時間制限を必ず付ける。'),
      T('人の承認', 'Human-in-the-loop', '送信・購入・削除・公開など、取り消せない操作は実行前に人が確認する。', null, ['安全']),
      T('ツールの権限は最小限', 'Least privilege for tools', 'エージェントに渡すツールは必要なものだけ。DBは読み取り専用、メールは下書きまで、など。外部の文章によるプロンプトインジェクションへの備えにもなる。（セキュリティ辞典参照）'),
      T('サーバー側のツール', 'Server tools', 'Web検索・Webページの取得・コード実行など、Anthropic 側で実行されるツール。定義に入れるだけで使え、自分で実行する必要がない。'),
      T('MCP', 'Model Context Protocol', '外部のツールやデータをAIにつなぐ共通規格。既存のMCPサーバーを、API経由のAIからも使える。'),
      T('Tool Runner（SDKの便利機能）', 'Tool runner', 'ツールの関数を書くだけで、「AIを呼ぶ → ツールを実行 → 結果を返す」のループをSDKが回してくれる。自分でループを書くより簡単。'),
      T('Claude Agent SDK', 'Agent SDK', 'Claude Code の仕組み（ファイル操作・コマンド実行・検索などの道具とループ）を、自分のアプリに組み込めるライブラリ。コーディングやファイル作業のエージェントを作るなら。'),
      T('Managed Agents', 'Hosted agents', 'エージェントのループと作業用の環境を Anthropic 側で動かしてくれる仕組み（ベータ）。長時間の作業・定期実行のエージェント向け。'),
      T('マルチエージェント', 'Multi-agent', '調査役・まとめ役のように、複数のAIに分担させる。情報が多い調査で有効だが、費用と複雑さが増える。'),
      T('評価してから広げる', 'Evaluate agents', 'エージェントは結果がばらつくので、代表的なタスクで成功率・費用・時間を測ってから本番に出す。（「品質・評価・安全」タブ参照）'),
    ]),
  ]});
})();
