/* UXライティング辞典 — A: 共通ヘルパー / 基本 / ボタン・ラベル / エラーメッセージ / 空・読み込み・完了 */
(function(){
const { $, $$, esc, tbl, seg } = KIT;
const S = (title, items, note) => ({ title, note, layout:'rows', items });
const C = (title, items, note, lg) => ({ title, note, layout:lg ? 'cards lg' : 'cards', items });
const T = (name, en, desc, prompt, tags, more) => Object.assign({ name, en, desc, prompt, tags }, more || {});
const verdict = (el, cls, html) => { el.classList.remove('ok', 'bad', 'warn'); if (cls) el.classList.add(cls); el.innerHTML = html; };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const ba = (bad, good) => `<div class="ux-ba"><div class="bad">${bad}</div><div class="good">${good}</div></div>`;
// 文章の中の指定範囲に印を付ける（重なりは先に見つかった方を優先）
function marks(text, spans){
  spans = spans.filter(s => s.e > s.s).sort((a, b) => a.s - b.s || b.e - a.e); let out = '', pos = 0;
  for (const s of spans){ if (s.s < pos) continue; out += esc(text.slice(pos, s.s)) + `<mark class="${s.c || ''}" title="${esc(s.m)}">${esc(text.slice(s.s, s.e))}</mark>`; pos = s.e; }
  return out + esc(text.slice(pos));
}
function findAll(text, re, c, m){ re = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g'); const out = []; let x; while ((x = re.exec(text))){ if (!x[0].length){ re.lastIndex++; continue; } out.push({ s:x.index, e:x.index + x[0].length, c, m:typeof m === 'function' ? m(x) : m }); } return out; }
window.UXH = { S, C, T, verdict, sleep, ba, marks, findAll };

/* ================= 1. UXライティングの基本 ================= */
const RULES = [
  [/させていただ[きくけこ]/g, 'warn', '「させていただく」は多用すると回りくどい。「します」で十分なことが多い'],
  [/ないわけではない|なくはない|ないことはない|なくもない/g, 'bad', '二重否定は意味が取りにくい。肯定文に'],
  [/(?:[^。、\s]{1,10}の){3,}/g, 'warn', '「の」が3回以上続くと読みにくい'],
  [/適宜|一部の|場合があります|しばらく|なるべく|可能な限り/g, 'info', 'あいまいな言葉。いつ・どれ・どのくらいを具体的に'],
  [/[Ａ-Ｚａ-ｚ０-９]/g, 'info', '全角の英数字。半角にそろえる'],
  [/実施|実行|処理|押下|入力値|当該|上記|下記/g, 'info', '硬い言葉。「する」「押す」「入力した内容」など日常の言葉に'],
];
function analyze(t){
  const spans = [], sents = []; let m; const re = /[^。！？!?\n]+[。！？!?]?/g;
  while ((m = re.exec(t))){ const s = m[0].trim(); if (!s) continue; const len = [...s].length; sents.push(len); if (len > 60) spans.push({ s:m.index, e:m.index + m[0].length, c:len > 80 ? 'bad' : '', m:`1文が${len}文字。40〜60文字以内が目安` }); }
  RULES.forEach(([r, c, msg]) => spans.push(...findAll(t, r, c, msg)));
  const chars = [...t.replace(/\s/g, '')], kanji = chars.filter(c => /[一-鿿々]/.test(c)).length, kata = (t.match(/[ァ-ヶー]{4,}/g) || []).length;
  return { spans, sents, kanjiRate:chars.length ? kanji / chars.length * 100 : 0, kata, avg:sents.length ? sents.reduce((a, b) => a + b, 0) / sents.length : 0 };
}
const SAMPLE = '本サービスのご利用に際しましては、当該アカウントの認証処理の実施が必要となりますので、上記のボタンを押下していただき、ログイン処理を実行させていただきますようお願い申し上げます。なお、通信状況により一部の機能がご利用いただけない場合があります。';
const VIEW = [['認証に失敗しました。', 'メールアドレスかパスワードが違います。もう一度入力してください。', 'システムの言葉（認証）ではなく、<b>利用者が直せること</b>を書く。'], ['データの同期処理を実行中です。', '最新の内容に更新しています…', '内部の仕組み（同期処理）ではなく、<b>利用者にとって何が起きているか</b>。'], ['セッションがタイムアウトしました。', 'しばらく操作がなかったため、安全のためログアウトしました。もう一度ログインしてください。', '理由と、<b>次にすること</b>まで伝える。'], ['アップロードされたファイルのサイズが上限値を超過しています。', '画像は10MBまでです。小さくしてからもう一度お試しください。', '具体的な数字と、<b>解決の方法</b>。']];
const PRIN = [['明確', 'Clear', '一度読んで意味が分かる。専門用語・社内用語・あいまいな言葉を使わない'], ['簡潔', 'Concise', '必要なことだけを短く。ただし短すぎて意味が欠けるのは本末転倒'], ['役に立つ', 'Useful', '読んだ人が<b>次に何をすればいいか</b>分かる'], ['人間らしい', 'Human', '機械的・冷たい・責める言い方をしない。状況に合ったトーンで'], ['一貫している', 'Consistent', '同じものはいつも同じ言葉で呼ぶ（「保存」と「登録」を混ぜない）']];

TABS.push({ id:'basics', label:'UXライティングの基本', icon:'✍',
  intro:'<b>UXライティング</b>は、ボタン・ラベル・エラー・通知など<b>画面の中の言葉</b>を設計することです。利用者は文章を読まず<b>拾い読み</b>します。だから「短く・具体的に・利用者の言葉で・次にすることが分かるように」。AIが作った画面の文言は、システム目線で硬くなりがちなので、ここで直し方を身につけましょう。',
  sections:[
    C('触って理解する', [
      { name:'読みやすさチェッカー', en:'Readability checker', h:540, tags:['体験','定番','最重要'], wide:true,
        demo:'<div class="kt"><textarea class="kt-in tx" rows="4" spellcheck="false" aria-label="文章"></textarea><div class="ux-stats st"></div><div class="ux-out out kt-grow"></div><div class="kt-note">印にマウスを乗せると理由が出ます。黄色＝注意、赤＝直したい、青＝確認。</div></div>',
        init:(el) => { const tx = $(el, '.tx'); tx.value = SAMPLE; const run = () => { const t = tx.value, a = analyze(t);
            const st = (c, html) => `<span class="${c}">${html}</span>`;
            $(el, '.st').innerHTML = st(a.avg > 60 ? 'bad' : a.avg > 45 ? 'warn' : 'ok', `1文の平均 <b>${Math.round(a.avg)}</b>字`) + st(Math.max(0, ...a.sents) > 80 ? 'bad' : 'ok', `最長 <b>${Math.max(0, ...a.sents)}</b>字`) + st(a.kanjiRate > 35 ? 'warn' : 'ok', `漢字 <b>${Math.round(a.kanjiRate)}</b>%（目安20〜30%）`) + st(a.kata > 5 ? 'warn' : 'ok', `長いカタカナ語 <b>${a.kata}</b>`) + st(a.spans.length > 6 ? 'bad' : a.spans.length ? 'warn' : 'ok', `気になる所 <b>${a.spans.length}</b>`);
            $(el, '.out').innerHTML = marks(t, a.spans) || '<span style="color:var(--muted)">文章を入力してください</span>'; };
          let tm; tx.oninput = () => { clearTimeout(tm); tm = setTimeout(run, 200); }; run(); },
        desc:'画面の文章は<b>1文を短く（40〜60文字以内）</b>、<b>漢字は2〜3割</b>くらいが読みやすい目安です。「させていただく」の連発、「〜の〜の〜の」、二重否定、「押下」「当該」のような硬い言葉、「場合があります」のようなあいまいな言葉は、拾い読みの邪魔になります。サンプルを書き直して、印が消えていくのを確かめましょう。',
        prompt:'このアプリの画面の文言（ボタン・説明文・エラー）を読みやすく直して。1文は40文字程度まで、硬い言葉（押下・実施・当該）は日常の言葉に、「させていただく」は使わない、利用者が次にすることが分かるように。直した前後を表にして。' },
      { name:'システムの言葉を、利用者の言葉に', en:'User-centered wording', h:400, tags:['体験','最重要'],
        demo:'<div class="kt"><span class="sw"></span><div class="pv"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.sw').replaceWith(seg(VIEW.map((v, i) => `例${i + 1}`), i => { $(el, '.pv').innerHTML = ba(esc(VIEW[i][0]), esc(VIEW[i][1])); verdict($(el, '.res'), '', VIEW[i][2]); }).el); },
        desc:'作る人は仕組みを知っているので、「認証」「同期」「セッション」のような<b>システムの言葉</b>で書いてしまいがちです。利用者が知りたいのは「何が起きたか」「自分は何をすればいいか」。<b>利用者が見ているもの・したいこと</b>を主語にして書き直します。',
        prompt:'アプリの中のメッセージのうち、技術用語（認証・同期・セッション・タイムアウト・API）が出てくるものを全部探して、利用者に伝わる言葉に書き換えて。何が起きたか・次に何をすればいいかが分かるように。' },
      { name:'大事なことを先に書く', en:'Front-loading', h:400, tags:['体験','通知'],
        demo:'<div class="kt"><span class="sw"></span><div class="ux-lock lk"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const V = [['いつもご利用いただきありがとうございます。さて、ご予約いただいております11月3日（月）15:00のカットのご予約について、担当者の都合により…', 'bad', '前置きが長く、通知では<b>大事な日時と用件が見えません</b>。'], ['【予約変更のお願い】11/3（月）15:00 のカットは担当の都合で変更が必要です。ご都合の良い日時を選んでください。', 'ok', '✓ <b>用件と日時を先頭</b>に。通知・メールの件名・ボタンは、最初の数文字しか読まれません。']];
          $(el, '.sw').replaceWith(seg(['前置きから書く', '用件を先に書く'], i => { $(el, '.lk').innerHTML = `<div class="ux-notif"><i>✂</i><b>ヘアサロン ABC</b><span>${esc(V[i][0])}</span></div>`; verdict($(el, '.res'), V[i][1], V[i][2]); }).el); },
        desc:'通知・メールの件名・ボタン・見出しは、<b>最初の数文字</b>で読むかどうかが決まります。日本語の手紙のような前置き（「いつも〜ありがとうございます」）は画面では後回しに。<b>結論・用件・数字</b>を先頭に置く（フロントローディング）と、途中で切れても意味が伝わります。',
        prompt:'このアプリのプッシュ通知とメールの件名を見直して、用件・日時・金額など大事な情報が最初の15文字以内に入るように書き直して。前置きのあいさつは本文に回して。' },
    ], null, true),
    { title:'UXライティングの5つの原則', note:'迷ったら「<b>この言葉を初めて見た人が、次に何をすればいいか分かるか？</b>」と考えます。',
      table:{ head:['原則', '英語', '意味'], rows:PRIN } },
    S('UXライティングの基本用語', [
      T('マイクロコピー', 'Microcopy', 'ボタン・ラベル・エラー・説明文など、画面の中の小さな言葉。小さいが使いやすさに大きく効く。', null, ['基本']),
      T('UXライター', 'UX writer', '画面の言葉を設計する仕事。デザイナー・開発者と一緒に、流れの中で言葉を決める。'),
      T('ボイス', 'Voice', 'サービスの「人柄」。どの画面でも変わらない話し方の性格（親しみやすい・誠実 など）。'),
      T('トーン', 'Tone', '状況に応じた話し方の調子。同じボイスでも、お祝いと謝罪では変える。（「トーン」タブ）'),
      T('CTA', 'Call to Action', '利用者に取ってほしい行動のボタンやリンク（「無料で始める」）。'),
      T('ラベル', 'Label', '入力欄やボタンの名前。短く、何を入れる・何が起きるかが分かるように。'),
      T('プレースホルダー', 'Placeholder', '入力欄の中に薄く出る例。入力すると消えるので、<b>ラベルの代わりにしない</b>。', null, ['よくある失敗']),
      T('ヘルパーテキスト', 'Helper text', '入力欄の下の補足（「8文字以上、英数字を含む」）。入力の前に条件を伝える。'),
      T('空の状態', 'Empty state', 'データがまだない画面。最初の一歩を案内するチャンス。（「空・読み込み・完了」タブ）'),
      T('拾い読み', 'Scanning', '利用者は文章を最初から読まず、目に入った言葉だけ拾う。見出し・太字・短い文で助ける。'),
      T('フロントローディング', 'Front-loading', '大事な言葉を文の先頭に置くこと。'),
      T('用語集（グロッサリー）', 'Glossary', 'サービス内で使う言葉の一覧と表記の決まり。「保存/登録」「ユーザー/お客さま」などを統一する。', null, ['おすすめ']),
      T('ジャーゴン', 'Jargon', '業界・社内の専門用語。作る側には当たり前でも、利用者には通じない。'),
    ]),
  ]});

/* ================= 2. ボタン・ラベル ================= */
const BTN = [['有料プランへの申し込み', [['OK', 'bad', '何が起きるか分かりません。'], ['送信', 'warn', '「何を送るのか」が不明。お金が動く操作なのに軽く見えます。'], ['申し込む', 'ok', '✓ 行動がはっきり。'], ['月額1,078円で申し込む', 'ok', '✓ さらに良い：<b>お金がかかること</b>をボタン自体で伝えています。']]], ['書いたメモを残す', [['はい', 'bad', '質問への答えのような言葉は、前の文を読まないと意味が分かりません。'], ['完了', 'warn', '保存されるのか、閉じるだけなのか分かりにくい。'], ['保存する', 'ok', '✓ 動詞で、結果が分かる。']]], ['アカウントの削除', [['OK', 'bad', '取り消せない操作に「OK」は危険。'], ['続ける', 'warn', '何を続けるのか分かりません。'], ['アカウントを削除する', 'ok', '✓ 取り消せない操作は、<b>何が消えるか</b>まで書き、赤い色で区別。']]]];
const WORDS = [['OK・はい', '保存する・送信する・削除する', '結果が分かる動詞にする'], ['送信', '申し込む・予約する・問い合わせる', '利用者がしたいことの言葉に'], ['キャンセル（2つの意味）', '予約を取り消す／閉じる', '「キャンセルをキャンセル」を避ける'], ['こちら・ここ', '料金プランを見る', 'リンク先が分かる言葉に'], ['詳細', '注文の詳細を見る', '何の詳細か'], ['エラー', '保存できませんでした', '何が起きたかを書く'], ['戻る（ブラウザと紛らわしい）', 'カートに戻る', 'どこへ戻るか'], ['登録（意味が広い）', '会員登録する・カードを登録する', '何を登録するか'], ['無料体験を開始', '7日間無料で試す', '期間・条件を具体的に']];

TABS.push({ id:'buttons', label:'ボタン・ラベル', icon:'🔘',
  intro:'ボタンは<b>押したら何が起きるか</b>が分かる言葉にします。「OK」「はい」「送信」より「保存する」「申し込む」「削除する」。取り消せない操作は<b>何が消えるか</b>まで書き、色でも区別します。リンクは「こちら」ではなく<b>行き先</b>を、入力欄にはプレースホルダーではなく<b>ラベル</b>を。',
  sections:[
    C('触って理解する', [
      { name:'ボタンの言葉を選ぶ', en:'Button labels', h:430, tags:['体験','定番'],
        demo:'<div class="kt"><span class="sw"></span><div class="kt-lbl ctx"></div><div class="ux-btnrow bs"></div><div class="kt-verdict res kt-grow"></div></div>',
        init:(el) => { let k = 0; const draw = () => { const [ctx, opts] = BTN[k]; $(el, '.ctx').textContent = `場面：${ctx}`; $(el, '.bs').innerHTML = opts.map(([l, c], i) => `<button type="button" class="ux-b${c === 'ok' && /削除/.test(l) ? ' danger' : ''}" data-i="${i}">${l}</button>`).join('');
            $$(el, '.bs button').forEach(b => b.onclick = () => { const o = opts[+b.dataset.i]; verdict($(el, '.res'), o[1], `「<b>${o[0]}</b>」：${o[2]}`); }); verdict($(el, '.res'), '', 'ボタンを押して、言葉ごとの評価を見てみましょう。'); };
          $(el, '.sw').replaceWith(seg(BTN.map(b => b[0]), i => { k = i; draw(); }).el); },
        desc:'ボタンの言葉は<b>動詞（〜する）</b>で、押した後に何が起きるかを表します。「OK」「はい」は前の文を読まないと意味が分からず、拾い読みでは伝わりません。お金がかかる操作・取り消せない操作は、<b>金額や対象</b>までボタンに書くと、誤操作とトラブルが減ります。',
        prompt:'このアプリのボタンの文言を全部洗い出して、「OK」「はい」「送信」「完了」のような曖昧なものを、押した結果が分かる動詞（保存する・申し込む・削除する）に変えて。お金がかかるボタンには金額を、削除のボタンには対象を入れて。' },
      { name:'確認ダイアログ', en:'Confirmation dialogs', h:430, tags:['体験','最重要'],
        demo:'<div class="kt"><span class="sw"></span><div class="ux-scr sc"><div class="bar">旅行プラン一覧</div><div style="padding:10px;font-size:12px;color:var(--muted)">・沖縄 3泊4日<br>・京都 日帰り</div></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const V = [['本当によろしいですか？', '', [['いいえ', ''], ['はい', 'pri']], 'bad', '❌ 何を確認されているのか分かりません。「はい」「いいえ」は質問文を読まないと押せない。'], ['キャンセルしますか？', '予約のキャンセル手続きを中止しますか？', [['キャンセル', ''], ['OK', 'pri']], 'bad', '❌ 「キャンセル」が2つの意味（予約の取り消し／この画面を閉じる）で使われ、どちらを押せばいいか分かりません。'], ['「沖縄 3泊4日」を削除しますか？', '削除すると元に戻せません。共有している2人も見られなくなります。', [['やめる', ''], ['削除する', 'danger']], 'ok', '✓ <b>何が・どうなるか</b>を見出しに。取り消せないことと影響範囲を説明。ボタンは「削除する」と赤色で、もう一方は「やめる」。']];
          $(el, '.sw').replaceWith(seg(['よくある例', '紛らわしい例', '良い例'], i => { const [h, p, bs, c, msg] = V[i]; $$(el, '.ux-dim').forEach(x => x.remove()); $(el, '.sc').insertAdjacentHTML('beforeend', `<div class="ux-dim"><div class="ux-dlg"><h5>${h}</h5>${p ? `<div>${p}</div>` : ''}<div class="bt">${bs.map(([l, k]) => `<span class="ux-b ${k}">${l}</span>`).join('')}</div></div></div>`); verdict($(el, '.res'), c, msg); }).el); },
        desc:'確認ダイアログは、<b>見出しだけで何を確認しているか</b>分かるように書きます。ボタンは「はい／いいえ」ではなく「削除する／やめる」のように<b>動作</b>で。取り消せない操作は、影響（元に戻せない・共有相手も見られなくなる）も添えます。そもそも確認が多すぎると読まずに押されるので、<b>取り消し（元に戻す）</b>で済むなら確認自体をなくすのも手です。',
        prompt:'このアプリの確認ダイアログを全部見直して、見出しに対象と操作（「〇〇を削除しますか？」）、本文に影響（元に戻せない等）、ボタンは動作の言葉（削除する／やめる）にして。取り消し（元に戻す）で済む操作は、確認をやめてトーストの「元に戻す」に置き換えて。' },
      { name:'「こちら」をやめる', en:'Descriptive link text', h:430, tags:['体験','アクセシビリティ'],
        demo:'<div class="kt"><span class="sw"></span><div class="ux-out pg"></div><div class="kt-lbl">スクリーンリーダーの「リンク一覧」で聞こえる言葉</div><div class="ux-list ls"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const V = [['料金については<u>こちら</u>をご覧ください。解約の方法は<u>こちら</u>。よくある質問は<u>ここ</u>をクリック。', ['こちら', 'こちら', 'ここ'], 'bad', '❌ リンクだけを読み上げる機能で聞くと、全部「こちら」で<b>区別できません</b>。拾い読みでも行き先が分からない。'], ['<u>料金プランを見る</u>。<u>解約の方法</u>も確認できます。困ったときは<u>よくある質問</u>へ。', ['料金プランを見る', '解約の方法', 'よくある質問'], 'ok', '✓ リンクの文字だけで<b>行き先が分かる</b>。目の不自由な人にも、拾い読みする人にも親切。']];
          $(el, '.sw').replaceWith(seg(['「こちら」型', '行き先を書く'], i => { $(el, '.pg').innerHTML = V[i][0]; $(el, '.ls').innerHTML = V[i][1].map((l, k) => `<div>リンク ${k + 1}：「${l}」</div>`).join(''); verdict($(el, '.res'), V[i][2], V[i][3]); }).el); },
        desc:'「詳しくは<b>こちら</b>」のリンクは、リンクの部分だけ見ても行き先が分かりません。スクリーンリーダーにはリンクだけを一覧で読み上げる機能があり、そこでは「こちら、こちら、ここ」としか聞こえません。<b>リンクの文字そのものに行き先</b>を書きましょう。',
        prompt:'サイト内の「こちら」「ここ」「詳細」だけのリンクを探して、リンクの文字だけで行き先が分かる言葉（「料金プランを見る」など）に書き換えて。文章の流れも自然になるように前後も直して。' },
      { name:'ラベルとプレースホルダー', en:'Labels vs placeholders', h:460, tags:['体験','フォーム'],
        demo:'<div class="kt"><span class="sw"></span><div class="ux-scr fm" style="padding:10px;gap:8px;justify-content:flex-start"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.sw').replaceWith(seg(['プレースホルダーだけ', 'ラベル＋補足'], i => {
            $(el, '.fm').innerHTML = i ? '<div class="ux-field"><label for="ux-pw">パスワード</label><input id="ux-pw" type="text" placeholder="例：sakura2026"><span class="help">8文字以上で、英字と数字を両方入れてください</span></div><div class="ux-field"><label for="ux-tel">電話番号（ハイフンなし）</label><input id="ux-tel" type="text" placeholder="09012345678"></div>' : '<div class="ux-field"><input type="text" placeholder="パスワード（8文字以上・英数字を含む）" aria-label="パスワード"></div><div class="ux-field"><input type="text" placeholder="電話番号（ハイフンなし）" aria-label="電話番号"></div>';
            $$(el, '.fm input').forEach(x => x.oninput = () => { if (!i) verdict($(el, '.res'), 'bad', '❌ 入力し始めた瞬間に<b>条件が消えました</b>。「何文字以上だっけ？」と分からなくなり、入力済みの欄は何の欄かも見えません。'); });
            verdict($(el, '.res'), i ? 'ok' : 'warn', i ? '✓ ラベルは常に表示、条件は<b>入力前に</b>補足で。プレースホルダーは入力例だけ。' : '入力欄に何か打ってみましょう。'); }).el); },
        desc:'入力欄の中の薄い文字（プレースホルダー）は、<b>入力すると消えます</b>。条件やラベルをそこに書くと、入力中に見えなくなり、見直しもできません。また薄い文字は読みにくく、入力済みと見間違えることも。<b>ラベルは欄の上に常に表示</b>し、条件は欄の下に補足として書きます。',
        prompt:'このフォームで、プレースホルダーをラベル代わりにしている入力欄を、上に常に表示するラベル（label要素で関連付け）に直して。入力の条件（文字数・形式）は欄の下の補足テキストに出し、aria-describedby で結びつけて。' },
    ], null, true),
    { title:'よく使う言葉の言い換え', note:'同じ画面・同じサービスの中では、<b>同じものはいつも同じ言葉</b>で。用語集にまとめておきましょう。',
      table:{ head:['こうなりがち', 'こう書く', '理由'], rows:WORDS } },
    S('ボタン・ラベルの用語', [
      T('動詞のボタン', 'Verb-first buttons', '「保存する」「申し込む」のように、押した結果を動詞で書く。'),
      T('主ボタンと副ボタン', 'Primary / secondary', '一番してほしい操作を目立たせ、もう一方は控えめに。1画面に主ボタンは1つが基本。'),
      T('破壊的な操作', 'Destructive actions', '削除・解約など取り消せない操作。赤色・具体的な言葉・確認で区別する。', null, ['注意']),
      T('取り消し（元に戻す）', 'Undo', '確認ダイアログの代わりに、実行後すぐ「元に戻す」を出す方法。操作が軽くなる。', null, ['おすすめ']),
      T('リンクテキスト', 'Link text', 'リンクの文字だけで行き先が分かるように。「こちら」を避ける。'),
      T('ラベル', 'Label', '入力欄の名前。常に表示し、label 要素で欄と結びつける。'),
      T('補足テキスト', 'Helper text', '入力の条件や例。エラーになる前に伝える。'),
      T('必須・任意の表示', 'Required / optional', '必須が多いなら「任意」の方だけに印を付けると、すっきりする。'),
      T('入力例', 'Examples', '「例：山田 太郎」のように形を見せる。本物っぽすぎる例（実在の番号）は避ける。'),
      T('ボタンの長さ', 'Button length', '2〜6文字程度が目安。長くなるなら、ボタンの外に説明を置く。'),
    ]),
  ]});

/* ================= 3. エラーメッセージ ================= */
const BLAME = [['不正な値が入力されました。', '電話番号は数字だけで入力してください（ハイフンなし）。', '「不正」は利用者を責める響き。<b>どう直せばいいか</b>を書く。'], ['エラーが発生しました。（E-1023）', '保存できませんでした。通信が不安定な可能性があります。もう一度お試しください。（エラーコード：E-1023）', '何が起きたか・理由・次にすること。<b>コードは問い合わせ用に最後に</b>。'], ['パスワードが間違っています。', 'メールアドレスかパスワードが違います。', 'どちらが違うかを言わないのは<b>セキュリティのため</b>（登録の有無を知られない）。'], ['ファイル形式がサポートされていません。', 'PDF・JPG・PNG のファイルを選んでください。', '「できない」より<b>「何ならできるか」</b>。'], ['入力内容に誤りがあります。', '2か所の入力を確認してください：メールアドレス・郵便番号', 'どこが違うかを<b>具体的に</b>。該当の欄にも印を。']];
const SIT = [['通信できない', '接続できませんでした。電波の良い場所で、もう一度お試しください。', '再試行ボタン。入力した内容は消さない'], ['権限がない', 'このページを見るには、管理者の許可が必要です。', '誰に頼めばいいか'], ['見つからない', 'お探しのページは見つかりませんでした。URLが変わったか、削除された可能性があります。', '検索・トップへの道'], ['サーバーの不具合', '申し訳ありません。ただいま不具合が起きています。少し時間をおいてお試しください。', '謝る・時間の目安・状況ページ'], ['期限切れ', 'このリンクは有効期限（24時間）が切れています。新しいリンクを送りますか？', 'その場で解決できるボタン'], ['支払いに失敗', 'カードでのお支払いができませんでした。別のカードを使うか、カード会社にお問い合わせください。', '詳しい理由は出さない（不正の手がかりになる）'], ['容量オーバー', '保存できる容量（5GB）がいっぱいです。不要なファイルを削除するか、プランを変更してください。', '選択肢を示す'], ['二重送信', 'この注文はすでに受け付けています。ご注文の確認メールをご確認ください。', '利用者を安心させる']];

TABS.push({ id:'errors', label:'エラーメッセージ', icon:'⚠',
  intro:'エラーメッセージは、困っている人への<b>道案内</b>です。「<b>何が起きたか</b>・<b>なぜか</b>・<b>どうすればいいか</b>」の3つを、<b>責めない言葉</b>で書きます。エラーコードだけ・「不正な入力」・赤い文字だけ、は利用者を迷子にします。',
  sections:[
    C('触って理解する', [
      { name:'エラーメッセージを組み立てる', en:'Error message builder', h:500, tags:['体験','最重要'],
        demo:'<div class="kt"><div class="fm" style="display:grid;grid-template-columns:auto 1fr;gap:4px 8px;align-items:center;font-size:11.5px"></div><div class="ux-scr" style="flex:none;padding:10px"><div class="pv" style="border-radius:9px;padding:9px 11px;font-size:12.5px;line-height:1.6;background:color-mix(in srgb, var(--bad) 8%, var(--surface));border:1px solid color-mix(in srgb, var(--bad) 35%, var(--border))"></div></div><div class="ux-stats st"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const F = [['what', '何が起きた', '画像をアップロードできませんでした。'], ['why', 'なぜ', '画像の大きさが10MBを超えています。'], ['how', 'どうすれば', '10MB以下に小さくしてから、もう一度選んでください。'], ['code', 'コード（任意）', 'IMG-413']];
          $(el, '.fm').innerHTML = F.map(([k, l, v]) => `<span>${l}</span><input class="kt-in" data-k="${k}" value="${esc(v)}" aria-label="${l}">`).join('');
          const run = () => { const v = {}; $$(el, '.fm input').forEach(i => v[i.dataset.k] = i.value.trim()); const all = v.what + v.why + v.how;
            $(el, '.pv').innerHTML = `<b>⚠ ${esc(v.what || '（何が起きたか）')}</b><br>${esc(v.why)} ${esc(v.how)}${v.code ? `<br><span style="font-size:11px;color:var(--muted)">エラーコード：${esc(v.code)}</span>` : ''}`;
            const ck = [[!!v.what, '何が起きたか'], [!!v.why, '理由'], [!!v.how, '次にすること'], [!/不正|無効|違反|禁止|失敗しました。$/.test(all), '責める言葉なし'], [!/^[A-Z0-9\-]+$/.test(v.what), 'コードだけにしない']];
            $(el, '.st').innerHTML = ck.map(([ok, l]) => `<span class="${ok ? 'ok' : 'bad'}">${ok ? '✓' : '×'} ${l}</span>`).join('');
            const n = ck.filter(c => c[0]).length; verdict($(el, '.res'), n === 5 ? 'ok' : n >= 3 ? 'warn' : 'bad', n === 5 ? '✓ 困っている人が、自分で解決できるメッセージです。' : '欠けている要素を足してみましょう。特に<b>「どうすれば」</b>が一番大事です。'); };
          $$(el, '.fm input').forEach(i => i.oninput = run); run(); },
        desc:'良いエラーメッセージは<b>3つの部品</b>でできています。①何が起きたか（見出し）②なぜか（分かる範囲で）③どうすればいいか（次の行動）。エラーコードは問い合わせのときに役立つので消さずに、<b>最後に小さく</b>。欄を書き換えて、チェックがどう変わるか試してみましょう。',
        prompt:'このアプリのエラーメッセージを全部一覧にして、「何が起きたか・なぜか・どうすればいいか」の3つがそろうように書き直して。技術的なエラーコードは最後に小さく残し、「不正」「無効」のような責める言葉は使わないで。' },
      { name:'フォームのエラーの出し方', en:'Inline validation', h:470, tags:['体験','フォーム'],
        demo:'<div class="kt"><div class="kt-row"><span class="s1"></span></div><div class="kt-row"><span class="s2"></span></div><div class="ux-scr" style="padding:10px;gap:6px;flex:none"><div class="ux-field"><label for="ux-em">メールアドレス</label><input id="ux-em" class="em" type="text" value="hanako.example.com" autocomplete="off"><span class="err ms"></span></div><button type="button" class="ux-b pri sb" style="align-self:flex-start">登録する</button></div><div class="kt-verdict res kt-grow"></div></div>',
        init:(el) => { let when = 1, good = 1; const msg = (v) => !v ? (good ? 'メールアドレスを入力してください' : '必須項目です') : !v.includes('@') ? (good ? 'メールアドレスに「@」が入っていません（例：hanako@example.com）' : '無効な形式です') : !/\.[a-z]{2,}$/i.test(v) ? (good ? '「@」のあとが途中で終わっているようです（例：@example.com）' : '無効な形式です') : '';
          const show = () => { const v = $(el, '.em').value.trim(), m = msg(v); $(el, '.ms').textContent = m ? '⚠ ' + m : ''; $(el, '.em').classList.toggle('bad', !!m); return m; };
          const hide = () => { $(el, '.ms').textContent = ''; $(el, '.em').classList.remove('bad'); };
          const desc = () => verdict($(el, '.res'), when === 0 ? 'bad' : 'ok', (when === 0 ? '❌ <b>入力の途中</b>でエラーを出すと、まだ打っている最中なのに怒られている気分に。' : when === 1 ? '✓ <b>欄を離れたとき</b>に確認するのが基本。直し始めたら、正しくなった時点ですぐ消す。' : '△ 送信時だけだと、最後にまとめて直すことになる。<b>送信時にも全体を確認</b>し、最初のエラーの欄に移動する。') + (good ? '' : '<br>「無効な形式です」は<b>どう直せばいいか</b>が分かりません。'));
          $(el, '.s1').replaceWith(seg(['入力中すぐ', '欄を離れたとき', '送信したとき'], i => { when = i; hide(); desc(); }, 1).el); $(el, '.s2').replaceWith(seg(['不親切な文', '具体的な文'], i => { good = i; if ($(el, '.ms').textContent) show(); desc(); }, 1).el);
          $(el, '.em').oninput = () => { if (when === 0 || $(el, '.ms').textContent) show(); }; $(el, '.em').onblur = () => { if (when === 1) show(); }; $(el, '.sb').onclick = () => { if (show()) $(el, '.em').focus(); else verdict($(el, '.res'), 'ok', '✓ 登録できる形です。'); }; },
        desc:'フォームのエラーは、<b>いつ出すか</b>と<b>何と書くか</b>で使い心地が大きく変わります。入力の途中で出すと邪魔、送信時だけだと手戻りが大きい。<b>欄を離れたときに確認し、直ったらすぐ消す</b>のが基本です。文は「無効な形式です」ではなく、<b>何が足りないか・例</b>を書きます。',
        prompt:'登録フォームのバリデーションを見直して。各欄は入力欄を離れたとき（blur）に確認し、エラーが出ている欄は入力が正しくなった時点ですぐ消す。メッセージは「何が足りないか＋例」の形に、送信時は最初のエラーの欄にフォーカスを移して、エラーの数を上にまとめて表示して。' },
      { name:'責めない言い方', en:'Blame-free wording', h:420, tags:['体験','トーン'],
        demo:'<div class="kt"><span class="sw"></span><div class="pv"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.sw').replaceWith(seg(BLAME.map((b, i) => `例${i + 1}`), i => { $(el, '.pv').innerHTML = ba(esc(BLAME[i][0]), esc(BLAME[i][1])); verdict($(el, '.res'), '', BLAME[i][2]); }).el); },
        desc:'「不正な値」「無効な操作」「間違っています」は、利用者を<b>責める</b>響きがあります。悪いのは多くの場合、分かりにくい画面の方。<b>何をすれば先に進めるか</b>を、やわらかく具体的に書きましょう。ただしログインのエラーは、どちらが違うかを言わないのがセキュリティ上の決まりです。',
        prompt:'このアプリのエラー文言から、「不正」「無効」「失敗しました」「間違っています」など利用者を責める言葉を探して、次にどうすればいいかが分かる、やわらかい言い方に書き直して。ログインのエラーはセキュリティのため「メールアドレスかパスワードが違います」のままにして。' },
    ], null, true),
    { title:'状況別のエラーの文例', note:'同じ種類のエラーは、<b>どの画面でも同じ書き方</b>にそろえると、利用者が慣れて対処しやすくなります。',
      table:{ head:['状況', '文例', 'ポイント'], rows:SIT } },
    S('エラーメッセージの用語', [
      T('エラーの3要素', 'What / why / how', '何が起きたか・なぜか・どうすればいいか。', null, ['最重要']),
      T('インラインバリデーション', 'Inline validation', '入力欄のすぐ下にエラーを出す方式。送信してから上にまとめて出すより直しやすい。'),
      T('エラーの要約', 'Error summary', '送信時に、エラーの数と一覧を上に出し、各欄へのリンクを付ける。長いフォームで親切。'),
      T('色だけに頼らない', 'Not color alone', '赤い枠だけでなく、アイコンと文字でもエラーを伝える。'),
      T('入力内容を消さない', 'Preserve input', 'エラーのときに入力した内容を消すのは最悪の体験。必ず残す。', null, ['よくある失敗']),
      T('エラーコード', 'Error codes', '問い合わせのときに役立つ。メッセージの最後に小さく。コードだけの表示はしない。'),
      T('謝るべきとき', 'When to apologize', 'サービス側の不具合なら「申し訳ありません」。利用者の入力の問題なら謝りすぎない（かえって分かりにくい）。'),
      T('セキュリティとエラー', 'Secure error messages', 'ログイン・パスワード再設定では、登録の有無が分からない言い方にする。'),
      T('防ぐ設計', 'Prevention', '一番良いエラーは起きないエラー。入力の形式を自動で整える・選択肢から選ばせる。'),
    ]),
  ]});

/* ================= 4. 空・読み込み・完了 ================= */
TABS.push({ id:'states', label:'空・読み込み・完了', icon:'⏳',
  intro:'画面には「普通の状態」以外に、<b>まだ何もない</b>・<b>読み込み中</b>・<b>終わった</b>・<b>見つからない</b>といった状態があります。ここの言葉が雑だと「壊れた？」「できた？」と不安になります。それぞれの状態で、<b>今どうなっているか</b>と<b>次にできること</b>を伝えましょう。',
  sections:[
    C('触って理解する', [
      { name:'空の状態（エンプティステート）', en:'Empty states', h:440, tags:['体験','定番'],
        demo:'<div class="kt"><span class="sw"></span><div class="ux-scr sc"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const V = [['はじめて', '📝', 'まだメモがありません', '思いついたことを、すぐに書き留めましょう。', '最初のメモを書く', '✓ <b>はじめての人</b>には、何ができるかと最初の一歩のボタン。'], ['検索で0件', '🔍', '「ぶどう」に一致するメモはありません', '言葉を短くするか、別の言葉で探してみてください。', '検索条件をクリア', '✓ <b>なぜ0件か</b>と、次に試すこと。入力した言葉も表示する。'], ['全部終わった', '🎉', 'すべてのタスクが完了しました', 'おつかれさまでした。明日のタスクを追加しますか？', 'タスクを追加', '✓ <b>達成</b>を一緒に喜ぶ。空っぽでもうれしい状態。'], ['悪い例', '', 'データがありません', '', '', '❌ 何もない理由も、次にすることも分かりません。壊れているのかと不安になります。']];
          $(el, '.sw').replaceWith(seg(V.map(v => v[0]), i => { const [, ic, h, p, b, msg] = V[i]; $(el, '.sc').innerHTML = `<div class="bar">メモ</div><div class="ux-empty">${ic ? `<span class="ic">${ic}</span>` : ''}<b>${h}</b>${p ? `<span>${p}</span>` : ''}${b ? `<span class="ux-b pri" style="margin-top:4px">${b}</span>` : ''}</div>`; verdict($(el, '.res'), i === 3 ? 'bad' : 'ok', msg); }).el); },
        desc:'データがまだない画面（<b>空の状態</b>）は、ただ「データがありません」と出すと不安になります。<b>はじめて</b>なら何ができるかと最初の一歩、<b>検索で0件</b>なら理由と別の探し方、<b>全部終わった</b>ならお祝い。状況に合わせて言葉を変えます。',
        prompt:'このアプリの一覧画面すべてに、空の状態を作って。初めて使う人向け（説明と最初の一歩のボタン）、検索・絞り込みで0件のとき（入力した条件と、条件をクリアするボタン）、全部完了したとき（お祝い）の3種類を、イラスト（絵文字でも可）付きで。' },
      { name:'待ち時間に合わせた伝え方', en:'Loading feedback', h:440, tags:['体験','読み込み'],
        demo:'<div class="kt"><div class="kt-row"><span class="kt-lbl">待ち時間</span><input type="range" min="0" max="30" step="0.5" value="0.5" class="t" style="flex:1" aria-label="待ち時間"><b class="kt-mono tv"></b></div><div class="ux-scr sc"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const run = () => { const t = +$(el, '.t').value; $(el, '.tv').textContent = t + '秒'; let html, msg;
            if (t < 1){ html = '<div class="ux-empty"><b>すぐに表示</b></div>'; msg = '<b>1秒未満</b>：何も出さない。くるくるが一瞬だけ出ると、かえってチカチカする。'; }
            else if (t < 3){ html = '<div style="padding:10px;display:flex;flex-direction:column;gap:6px">' + '<div style="height:12px;border-radius:5px;background:var(--surface-2)"></div>'.repeat(4) + '</div>'; msg = '<b>1〜3秒</b>：形だけの灰色の枠（スケルトン）や小さな回転マーク。言葉はいらない。'; }
            else if (t < 10){ html = '<div class="ux-empty"><span class="ic">⏳</span><b>写真を読み込んでいます…</b></div>'; msg = '<b>3〜10秒</b>：<b>何をしているか</b>を言葉で。「読み込み中」より「写真を読み込んでいます」。'; }
            else { const p = Math.min(95, Math.round(t / 30 * 100)); html = `<div class="ux-empty"><b>動画を書き出しています（${p}%）</b><div style="width:80%;height:8px;border-radius:5px;background:var(--surface-2);overflow:hidden"><div style="width:${p}%;height:100%;background:var(--accent)"></div></div><span>あと${Math.max(1, Math.round(30 - t))}秒ほどかかります。画面を閉じても続きます。</span><span class="ux-b" style="margin-top:4px">キャンセル</span></div>`; msg = '<b>10秒以上</b>：進み具合（％）・残り時間の目安・<b>閉じても大丈夫か</b>・キャンセルの方法。'; }
            $(el, '.sc').innerHTML = `<div class="bar">アルバム</div>${html}`; verdict($(el, '.res'), '', msg); };
          $(el, '.t').oninput = run; run(); },
        desc:'待っている間の伝え方は、<b>待ち時間</b>で変えます。1秒未満なら何も出さず、数秒なら形だけの枠（スケルトン）、それ以上なら<b>何をしているか</b>を言葉で、さらに長ければ<b>進み具合・残り時間・キャンセル</b>。「読み込み中…」だけが長く続くと、止まったのかと不安になります。',
        prompt:'このアプリの読み込み表示を、待ち時間に応じて出し分けて。1秒未満は表示しない（遅延して出す）、1〜3秒はスケルトン、3秒以上は何を処理しているかの文言、10秒以上かかる書き出し処理は進み具合・残り時間・キャンセルボタン・「閉じても続きます」の説明を表示して。' },
      { name:'完了とお知らせ（トースト）', en:'Success & toasts', h:430, tags:['体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="ux-scr sc"><div class="bar">受信箱</div><div style="padding:10px;font-size:12px;color:var(--muted)">・請求書のお知らせ<br>・ミーティングの件</div></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const V = [['処理が正常に完了しました。', '', 'bad', '❌ 何が完了したのか分かりません。「正常に」も不要な言葉。'], ['メールを1件削除しました', '元に戻す', 'ok', '✓ <b>何をしたか</b>を具体的に。取り消せる操作は「元に戻す」を付けると、確認ダイアログがいらなくなる。'], ['送信できませんでした', 'もう一度送る', 'warn', '失敗のトーストは<b>自動で消さない</b>か長めに表示し、再試行の方法を付ける。']];
          $(el, '.sw').replaceWith(seg(['よくある完了', '取り消し付き', '失敗'], i => { const [t, a, c, msg] = V[i]; $$(el, '.ux-toast').forEach(x => x.remove()); $(el, '.sc').insertAdjacentHTML('beforeend', `<div class="ux-toast ${c === 'warn' ? 'err' : ''}">${c === 'ok' ? '✓ ' : c === 'warn' ? '⚠ ' : ''}${t}${a ? `<u>${a}</u>` : ''}</div>`); verdict($(el, '.res'), c === 'warn' ? 'warn' : c, msg); }).el); },
        desc:'操作が終わったことを知らせる小さな通知（<b>トースト</b>）は、<b>何をしたか</b>を具体的に書きます。「処理が正常に完了しました」より「メールを1件削除しました」。取り消せる操作には「<b>元に戻す</b>」を付けると、確認ダイアログを減らせます。失敗のお知らせは、すぐ消えないように。',
        prompt:'このアプリのトースト通知の文言を「何をしたか」が分かる形にそろえて（例：「メモを保存しました」「1件削除しました」）。削除・アーカイブには「元に戻す」ボタンを付け、失敗のトーストは自動で消さずに再試行ボタンを表示して。' },
      { name:'404ページ', en:'Not found page', h:420, tags:['体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="ux-scr sc"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.sw').replaceWith(seg(['不親切', '親切'], i => { $(el, '.sc').innerHTML = i ? '<div class="ux-empty"><span class="ic">🧭</span><b>ページが見つかりませんでした</b><span>URLが変わったか、ページが削除された可能性があります。</span><input class="kt-in" placeholder="サイト内を検索" style="max-width:220px" aria-label="検索"><span style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center"><span class="ux-b pri">トップページへ</span><span class="ux-b">人気の記事を見る</span></span></div>' : '<div class="ux-empty"><b style="font-size:26px">404 Not Found</b><span>The requested URL was not found on this server.</span></div>'; verdict($(el, '.res'), i ? 'ok' : 'bad', i ? '✓ 何が起きたかをやさしく説明し、<b>検索・トップ・人気のページ</b>への道を用意。サイトのデザインのまま表示する。' : '❌ 英語の技術的な表示だけで、どこにも行けません。多くの人はここでサイトを離れます。'); }).el); },
        desc:'リンク切れや入力ミスでたどり着く<b>404ページ</b>は、迷子の案内所です。何が起きたかを分かりやすく伝え、<b>検索・トップページ・よく見られているページ</b>への道を用意しましょう。サイトの見た目のまま表示するのも大事です（技術的な英語の画面だと、サイトが壊れたように見えます）。',
        prompt:'Next.js の app/not-found.tsx で、サイトのデザインに合わせた404ページを作って。やさしい説明文、サイト内検索、トップページと人気記事へのリンクを置き、どのURLで404になったかをアクセス解析に送るようにして。' },
    ], null, true),
    S('状態ごとの用語', [
      T('空の状態', 'Empty state', 'データがまだない状態。はじめて・0件・完了の3種類を作り分ける。', null, ['定番']),
      T('スケルトン', 'Skeleton screen', '読み込み中に、内容の形だけを灰色で出す表示。待ち時間が短く感じる。'),
      T('スピナー', 'Spinner', '回転する読み込みマーク。長く続くと不安になるので、言葉や進み具合も添える。'),
      T('プログレスバー', 'Progress bar', '進み具合の棒。％と残り時間があると安心。'),
      T('楽観的UI', 'Optimistic UI', 'サーバーの返事を待たず、成功した前提で画面を先に変える。失敗したら元に戻して知らせる。'),
      T('トースト', 'Toast', '画面の端に一時的に出る小さなお知らせ。大事なことは自動で消さない。'),
      T('元に戻す', 'Undo', 'トーストに付ける取り消しボタン。誤操作の不安を減らす。', null, ['おすすめ']),
      T('404・500ページ', 'Error pages', '見つからない・サーバーの不具合のときの画面。案内と謝罪を。'),
      T('オフラインの表示', 'Offline state', '電波がないことと、つながったら自動で再開するかを伝える。'),
      T('メンテナンスの告知', 'Maintenance notice', 'いつからいつまで・何が使えないか・代わりの方法。事前に知らせる。'),
    ]),
  ]});
})();
