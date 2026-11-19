/* 著作権・ライセンス・AIのルール辞典 — A: 共通の部品 / 著作権の基本 / 他人の作品を使う / OSSライセンス / 自分の作品に付ける */
(function(){
const { $, $$, esc, seg, stepper } = KIT;
const S = (title, items, note) => ({ title, note, layout:'rows', items });
const C = (title, items, note, lg) => ({ title, note, layout:lg ? 'cards lg' : 'cards', items });
const T = (name, en, desc, prompt, tags, more) => Object.assign({ name, en, desc, prompt, tags }, more || {});
const L = (...a) => a.join('\n');
const verdict = (el, cls, html) => { el.classList.remove('ok', 'bad', 'warn'); if (cls) el.classList.add(cls); el.innerHTML = html; };
const MK = (a) => `<span class="lc-mk ${a}">${{ ok:'○', warn:'△', bad:'×' }[a]}</span>`;
const NOW = new Date().getFullYear();

/* ---------- 部品1：めくりカード。list:[[問い, 'ok'|'warn'|'bad', 理由]], labels で ○△× の言葉 ---------- */
function flip(el, list, labels){
  el.innerHTML = `<div class="kt"><div class="kt-row"><span class="kt-lbl">予想してからカードを押す</span><button type="button" class="kt-btn sm all" style="margin-left:auto">全部めくる</button></div><div class="lc-cards">${list.map(([q, a, w]) => `<button type="button" class="lc-card"><span class="q">${q}</span><span class="hint">？ 押してめくる</span><span class="a">${MK(a)}<span><b>${labels[a]}</b>　${w}</span></span></button>`).join('')}</div></div>`;
  $$(el, '.lc-card').forEach(b => b.onclick = () => b.classList.toggle('open'));
  $(el, '.all').onclick = () => $$(el, '.lc-card').forEach(b => b.classList.add('open'));
}

/* ---------- 部品2：判定クイズ。cases:[{ q, sub, a, why, how }] ---------- */
const PICK = { ok:'大丈夫', warn:'条件しだい', bad:'だめ' };
function judge(el, cases, labels = PICK){
  el.innerHTML = `<div class="kt"><div class="kt-row"><span class="kt-lbl n"></span><span class="kt-lbl sc" style="margin-left:auto"></span></div><div class="lc-case"></div>
    <div class="lc-pick">${['ok', 'warn', 'bad'].map(v => `<button type="button" data-v="${v}"><b>${{ ok:'○', warn:'△', bad:'×' }[v]}</b>${labels[v]}</button>`).join('')}</div>
    <div class="kt-verdict lc-ans"></div><div class="kt-row"><button type="button" class="kt-btn sm prev">◀ 前へ</button><button type="button" class="kt-btn sm pri nx">次へ ▶</button></div></div>`;
  let k = 0; const got = {};
  const show = () => { const c = cases[k]; $(el, '.n').textContent = `ケース ${k + 1} / ${cases.length}`; $(el, '.sc').textContent = `正解 ${Object.values(got).filter(Boolean).length} / ${Object.keys(got).length}`;
    $(el, '.lc-case').innerHTML = c.q + (c.sub ? `<small>${c.sub}</small>` : ''); $$(el, '.lc-pick button').forEach(b => b.classList.remove('ok', 'ng'));
    verdict($(el, '.lc-ans'), '', '○・△・× のどれだと思いますか？'); };
  $$(el, '.lc-pick button').forEach(b => b.onclick = () => { const c = cases[k], v = b.dataset.v; if (!(k in got)) got[k] = v === c.a;
    $$(el, '.lc-pick button').forEach(x => x.classList.toggle('ok', x.dataset.v === c.a)); if (v !== c.a) b.classList.add('ng');
    $(el, '.sc').textContent = `正解 ${Object.values(got).filter(Boolean).length} / ${Object.keys(got).length}`;
    verdict($(el, '.lc-ans'), c.a, `${MK(c.a)} <b>${labels[c.a]}</b>　${c.why}${c.how ? `<div class="how"><b>確かめ方・対処：</b>${c.how}</div>` : ''}`); });
  $(el, '.nx').onclick = () => { k = (k + 1) % cases.length; show(); };
  $(el, '.prev').onclick = () => { k = (k + cases.length - 1) % cases.length; show(); };
  show();
}

/* ---------- 部品3：質問チャート。nodes:{ id:{ q, opts:[[文, 次のid, 補足]] } | { r, nm, d } } ---------- */
function tree(el, nodes, start = 'root'){
  el.innerHTML = '<div class="kt"><div class="lc-path"></div><div class="body kt-grow kt-scroll" style="display:flex;flex-direction:column;gap:8px"></div><div class="kt-row"><button type="button" class="kt-btn sm back">◀ 1つ戻る</button><button type="button" class="kt-btn sm reset">最初から</button></div></div>';
  const hist = [];
  const go = (id, label) => { if (label !== undefined) hist.push([id, label]); const n = nodes[id], body = $(el, '.body');
    $(el, '.lc-path').innerHTML = hist.length ? hist.map(h => `<span>${h[1]}</span>`).join('') : '<span>スタート</span>';
    if (n.r){ body.innerHTML = `<div class="lc-res"><span class="nm">${n.nm}</span>${n.d}</div>`; }
    else { body.innerHTML = `<div class="lc-q">${n.q}</div><div class="lc-opts">${n.opts.map((o, i) => `<button type="button" data-i="${i}">${o[0]}${o[2] ? `<small>${o[2]}</small>` : ''}</button>`).join('')}</div>`;
      $$(body, '.lc-opts button').forEach(b => b.onclick = () => { const o = n.opts[+b.dataset.i]; go(o[1], o[0].replace(/<[^>]+>/g, '').slice(0, 18)); }); }
    $(el, '.back').disabled = !hist.length; };
  $(el, '.back').onclick = () => { hist.pop(); const prev = hist.length ? hist[hist.length - 1][0] : start; const keep = hist.slice(); hist.length = 0; keep.forEach(h => hist.push(h)); go(prev); };
  $(el, '.reset').onclick = () => { hist.length = 0; go(start); };
  go(start);
}

/* ---------- 部品4：文章の部位を光らせる。text の ⟦key|文⟧ が部位 ---------- */
function marks(el, { text, parts, title }){
  const html = text.split(/(⟦\w+\|[\s\S]*?⟧)/).map(s => { const m = s.match(/^⟦(\w+)\|([\s\S]*)⟧$/); return m ? `<span class="lc-p" data-p="${m[1]}">${esc(m[2])}</span>` : esc(s); }).join('');
  el.innerHTML = `<div class="kt">${title ? `<div class="kt-lbl">${title}</div>` : ''}<div class="sg"></div><pre class="lc-doc">${html}</pre><div class="kt-verdict note"></div></div>`;
  $(el, '.sg').append(seg(parts.map(p => p[1]), (i) => { let first = null; $$(el, '.lc-p').forEach(x => { const on = x.dataset.p === parts[i][0]; x.classList.toggle('on', on); if (on && !first) first = x; }); $(el, '.note').innerHTML = parts[i][2];
    if (first){ const box = $(el, '.lc-doc'), r = first.getBoundingClientRect(), b = box.getBoundingClientRect(); if (r.top < b.top || r.bottom > b.bottom) box.scrollTop += r.top - b.top - 16; } }, 0).el);
}

window.LCH = { S, C, T, L, verdict, MK, flip, judge, tree, marks, NOW };

/* ================= 1. 著作権の基本 ================= */
const WORKS = [
  ['小説・ブログ記事の文章', 'ok', '考えや気持ちを、その人なりに表現したもの。プロでなくても、短い日記でも著作物になりえます（第2条1項1号）。'],
  ['自分のスマホで撮った写真', 'ok', '構図・タイミング・明るさなどの選び方に個性が出るので、一般に著作物です。撮った人が著作者です。'],
  ['プログラムのソースコード', 'ok', 'プログラムは著作物の例として法律に書かれています（第10条1項9号）。ただし<b>プログラム言語・規約・解法（アルゴリズム）</b>そのものは守られません（同条3項）。'],
  ['「今月の売上は前月比10%増」という事実', 'bad', '事実やデータそのものは表現ではないので、著作物ではありません。それを説明した文章やグラフのデザインは別です。'],
  ['「猫が探偵をする物語」というアイデア', 'bad', 'アイデアは守られません。守られるのは<b>具体的な表現</b>（実際の文章・絵）です。同じアイデアで別の物語を書くのは自由です。'],
  ['「いつもありがとうございます」', 'bad', '誰が書いても同じになる、ありふれた短い表現は著作物になりません。'],
  ['商品のキャッチコピー', 'warn', '短いコピーは著作物と認められにくい一方、ある程度の長さと工夫があれば認められることも。<b>商標</b>として登録されていれば別の権利で守られます。'],
  ['文字だけのシンプルなロゴ', 'warn', '文字をデザインしただけのロゴは著作物と認められにくいですが、<b>商標権</b>や<b>不正競争防止法</b>で守られていることが多く、勝手に使えません。'],
  ['書体（フォントのデザイン）', 'bad', '文字のデザインは、原則として著作物ではないとされています（最高裁 2000年9月・ゴナ書体事件）。ただし<b>フォントのファイル（ソフト）</b>は利用許諾（ライセンス）に従って使う必要があります。'],
  ['プロンプトを1回入れただけのAI画像', 'bad', '人の創作的な関わりがない AI 生成物は、著作物にならない可能性が高いとされています（文化庁「AIと著作権に関する考え方について」2024年3月）。くわしくは「AIと著作権」タブ。'],
  ['料理のレシピ', 'warn', '材料と手順そのものは事実・アイデアに近く守られにくい一方、<b>説明の文章や写真</b>は著作物になります。'],
  ['商品データベース', 'warn', '情報の<b>選び方や並べ方（体系）</b>に工夫があれば、データベースの著作物になります（第12条の2）。中のデータ1件1件は別。'],
  ['手描きの地図・イラスト', 'ok', '地図・図形も著作物の例です（第10条1項6号）。ネットの地図の画面をそのまま使うときは、サービスの規約（出典表示など）も確認します。'],
];
const KIND = [
  { l:'個人の作品', y:'作者が亡くなった年', d:1985, note:(y, e) => y <= 1967 ? '1967年以前に亡くなった人の作品は、2018年12月30日に保護期間が延びる前に（死後50年で）保護が終わっています。延長で復活はしません。' : '作者の<b>死後70年</b>。亡くなった翌年の1月1日から数えるので、ちょうど70年後の12月31日まで（第51条・第57条）。共同で作った作品は、最後に亡くなった人から数えます。' },
  { l:'会社・団体名義', y:'公表した年', d:1990, note:(y, e) => y <= 1967 ? '2018年の延長前に保護が終わっています（公表後50年）。' : '会社の名義で公表した作品（職務著作など）は<b>公表後70年</b>（第53条）。ペンネームだけで正体が分からない作品も公表後70年です。' },
  { l:'映画', y:'公表した年', d:1960, note:(y, e) => y <= 1953 ? '1953年までに公表された映画は、2004年に保護期間が延びる前に保護が終わっています（いわゆる「1953年問題」最高裁 2007年）。' : '映画は<b>公表後70年</b>（第54条、2004年に50年から延長）。古い日本映画は、旧著作権法により監督などの<b>死後38年</b>の方が長くなる場合があり、さらに長く守られていることがあります。' },
];
const QUOTE = [
  ['公表されている作品から引用している', '未発表の原稿や、非公開のメッセージは引用できません。'],
  ['引用する必要がある', '自分の説明・批評のために、その部分がないと伝わらない。飾りや「話題作り」のためではない。'],
  ['自分の文章が「主」、引用は「従」', '分量も内容も、自分の文章がメイン。引用だけで成り立つページは引用ではなく転載です。'],
  ['引用部分がはっきり区別されている', 'かぎかっこ「」や、Webなら <code>&lt;blockquote&gt;</code> で、どこからどこまでが他人の文かが分かる。'],
  ['出所（作者・作品名・URL）を書いている', '第48条で義務になっています。書籍なら作者名と書名、Webならページ名とURL。'],
  ['勝手に書き換えていない', '原文のまま引用します。省略するときは「（中略）」と明記し、意味が変わらないようにします。'],
];
TABS.push({ id:'basics', label:'著作権の基本', icon:'©',
  intro:'著作権は、文章・写真・絵・音楽・プログラムなどの<b>作品を作った人に、作った瞬間に自動で</b>生まれる権利です。登録も ©マークも必要ありません。一方で、<b>アイデア・事実・ありふれた表現</b>は守られません。何が守られて何が守られないかの線引きが、すべての出発点です。<br><small>※この辞典は2026年11月時点の一般的な情報で、法律相談ではありません。具体的な判断が必要なときは、専門家や公的な相談窓口に確認してください（「公開前チェックと困ったとき」タブ）。</small>',
  sections:[
    C('触って理解する', [
      { name:'これは著作物？', en:'Is it copyrightable?', h:440, wide:true, tags:['基本','体験','最重要'], demo:'<div class="f"></div>',
        init:(el) => flip($(el, '.f'), WORKS, { ok:'著作物', warn:'場合による', bad:'原則ならない' }),
        desc:'著作物かどうかは「<b>思想または感情を創作的に表現したもの</b>」（第2条1項1号）かで決まります。プロかどうか、上手かどうかは関係ありません。著作物でなくても、商標・不正競争防止法・契約（利用規約）など<b>別のルール</b>で使えないことがある点に注意。',
        prompt:'次のものが日本の著作権法で著作物にあたるか、理由と根拠（条文や判例の名前）つきで教えて。著作物でない場合でも、ほかの権利（商標・不正競争防止法・利用規約など）で使えない可能性があれば挙げて。最後に、私が自分で確認すべき一次情報も教えて。\n【対象】' },
      { name:'保護期間の計算機', en:'Copyright term', h:360, tags:['体験'],
        demo:'<div class="kt"><div class="sg"></div><div class="lc-ctl"><b class="yl"></b><input type="range" min="1900" max="' + NOW + '" step="1" aria-label="年"><output></output></div><div class="lc-big res"></div><div class="lc-line"><i></i><b></b></div><div class="kt-verdict note"></div></div>',
        init:(el) => { let t = 0; const r = $(el, 'input'), o = $(el, 'output');
          const draw = () => { const y = +r.value, k = KIND[t]; o.textContent = y + '年';
            const end = t === 2 ? (y <= 1953 ? y + 50 : y + 70) : (y <= 1967 ? y + 50 : y + 70), alive = NOW <= end;
            $(el, '.res').innerHTML = alive ? `${end}年12月31日まで保護<small>${end > NOW ? `あと約 ${end - NOW} 年` : '今年いっぱい'}</small>` : `保護期間は終了<small>${end}年12月31日に終了 → パブリックドメイン</small>`;
            const X = (v) => Math.max(0, Math.min(100, (v - 1900) / 230 * 100)), ln = $(el, '.lc-line');
            $(ln, 'i').style.left = X(y) + '%'; $(ln, 'i').style.width = (X(end + 1) - X(y)) + '%'; $(ln, 'b').style.left = X(NOW) + '%';
            ln.querySelectorAll('span').forEach(s => s.remove()); [[y, ''], [NOW, '今'], [end, '終了']].forEach(([v, n]) => ln.insertAdjacentHTML('beforeend', `<span style="left:${Math.min(92, Math.max(8, X(v)))}%;top:${n === '今' ? 14 : 2}px">${n}${n ? ' ' : ''}${v}</span>`));
            verdict($(el, '.note'), alive ? 'warn' : 'ok', k.note(y, end) + (alive ? '' : '<br>保護が終わった作品は自由に使えます。ただし<b>新しい翻訳・演奏の録音・写真の撮り下ろし</b>などには、それぞれ別の権利が残っていることがあります。')); };
          $(el, '.sg').append(seg(KIND.map(k => k.l), (i) => { t = i; $(el, '.yl').textContent = KIND[i].y; r.value = KIND[i].d; draw(); }, 0).el);
          r.oninput = draw; },
        desc:'第二次世界大戦の連合国（アメリカ・イギリス・フランスなど）の人の古い作品には、<b>戦時加算</b>で約10年が上乗せされることがあります。海外の作品は国ごとに保護期間も違うので、古い作品を使うときは個別に確認します。',
        prompt:'【作品名・作者】の日本での著作権の保護期間がいつまでか、計算の根拠（死亡年・公表年・戦時加算の有無）を示して教えて。分からない部分は推測せず「確認が必要」と書いて。' },
    ], null, true),
    S('まず覚える言葉', [
      T('著作物', 'Copyrighted work', '思想または感情を創作的に表現したもの。文章・音楽・絵・写真・映像・建築・地図・プログラムなど（第10条）。', null, ['基本']),
      T('著作者と著作権者', 'Author / owner', '作った人が著作者。著作権（お金に関わる権利）は売ったり譲ったりできるので、今の<b>権利を持っている人（著作権者）</b>が別の人のこともあります。'),
      T('無方式主義（©は不要）', 'No formalities', '著作権は作った瞬間に自動で生まれます。登録も ©マークもいりません。<b>「©がないから使っていい」は間違い</b>です。', null, ['最重要']),
      T('著作権（財産権）の中身', 'Economic rights', 'コピーする権利（複製権）、ネットに上げる権利（公衆送信権）、作り変える権利（翻案権）、翻訳・上演・展示・配る権利など、<b>使い方ごとの権利の束</b>です（第21〜28条）。'),
      T('著作者人格権', 'Moral rights', '公表するかを決める権利、名前を表示する権利、<b>勝手に改変されない権利（同一性保持権）</b>。人に譲ることができません（第18〜20条・第59条）。'),
      T('職務著作', 'Work for hire', '会社の仕事として作り、会社の名前で公表するものは、会社が著作者になります（第15条）。プログラムは公表しなくても同じです。仕事で作ったコードを勝手に公開できないのはこのためです。', null, ['注意']),
      T('著作隣接権', 'Neighboring rights', '作品を伝える人の権利。歌手・演奏者、レコード（音源）会社、放送局など。曲の著作権とは別に、<b>録音そのもの</b>にも権利があります。'),
      T('二次的著作物', 'Derivative work', '翻訳・編曲・映画化・小説の漫画化など、元の作品を作り変えたもの。作るにも使うにも、<b>元の作品の権利者の許可</b>が必要です（第27・28条）。'),
      T('パブリックドメイン', 'Public domain', '保護期間が終わった・権利が放棄されたなどで、誰でも自由に使える状態。'),
    ]),
    S('侵害と、例外として使える場面', [
      T('侵害の2つの条件', 'Similarity & reliance', '<b>①似ている（類似性）</b>：表現の本質的な特徴が感じ取れる。<b>②元の作品をもとにした（依拠性）</b>：知っていて使った。偶然そっくりになっただけなら侵害ではありません。', null, ['最重要']),
      T('私的使用のための複製', 'Private use (Art.30)', '自分や家族など<b>ごく限られた範囲</b>で使うためのコピーはできます。ネットに上げる・会社で配るのは私的使用ではありません。違法アップロードと知りながらのダウンロードは対象外。'),
      T('写り込み', 'Incidental inclusion (Art.30-2)', '写真や動画を撮るときに、背景に<b>付随的に</b>ポスターやBGMが入ってしまうのは、一般に問題になりません。わざと大きく映すのは別です。'),
      T('引用', 'Quotation (Art.32)', '決まった条件を満たせば、許可なく使えます。条件は「他人の作品を使う」タブの見本で確認できます。'),
      T('情報解析（AIの学習など）', 'Data analysis (Art.30-4)', '作品を「楽しむ」ためではなく、解析や AI の学習に使う場合は、原則として許可なく利用できます。ただし例外があります（「AIと著作権」タブ）。'),
      T('学校の授業', 'Education (Art.35)', '授業で必要な範囲のコピーや配信は認められています（配信は補償金の制度あり）。部活・社内研修は対象外なので注意。'),
      T('侵害したときの責任', 'Liability', '削除などの<b>差止め</b>と<b>損害賠償</b>を求められます。悪質なものは刑事罰（10年以下の拘禁刑・1000万円以下の罰金、会社は3億円以下の罰金。2025年6月から「懲役」は「拘禁刑」に）。', null, ['注意']),
      T('親告罪', 'Complaint required', '著作権侵害の多くは、権利者が訴えないと刑事事件になりません。ただし海賊版をそのまま有償で配るような悪質なものは、訴えがなくても起訴できます。「訴えられなければよい」という話ではありません。'),
    ]),
  ]});

/* ================= 2. 他人の作品を使う ================= */
const USE = [
  { q:'ネットで見つけた画像を、ブログのアイキャッチに使う', sub:'検索結果に出てきた、ほかの人のブログの写真', a:'bad', why:'ネットに公開されている＝自由に使ってよい、ではありません。写真には撮った人の著作権があります。', how:'許可をもらうか、商用OKの素材サイトの画像・自分で撮った写真・AI生成画像（規約を確認）に置き換えます。' },
  { q:'YouTube の動画を、公式の「埋め込み」機能で自分のサイトに貼る', a:'ok', why:'公式の埋め込み機能は、動画を自分のサーバーにコピーせず、元の場所から表示する仕組みなので、一般に問題になりにくいとされます。', how:'元の動画が<b>違法アップロード</b>らしいときは貼らない。埋め込みを無効にしている動画は使わない。' },
  { q:'参考になる記事へのリンクを張る', a:'ok', why:'リンクを張るだけなら、作品をコピーしていないので著作権の問題は原則ありません。', how:'自分の作品のように見せる（フレームで囲って自サイトの一部に見せる）、違法サイトに誘導する、は避けます。' },
  { q:'好きな曲の歌詞を全部、Webページに載せる', a:'bad', why:'歌詞は著作物です。全文の掲載は引用の範囲を超えます。', how:'曲名と公式の配信・歌詞サイトへのリンクにとどめる。歌詞サイトは権利者と許諾契約を結んで載せています。' },
  { q:'曲の感想記事の中で、歌詞の一節を引用して解説する', a:'warn', why:'引用の条件（必要性・主従・区別・出所）を満たせば可能です。', how:'自分の解説がメインで、引用は必要な部分だけ。「」で区別し、曲名・作詞者を書く。' },
  { q:'人気アニメのキャラクターを、自作アプリのアイコンに使う', a:'bad', why:'キャラクターの絵は著作権、名前やロゴは商標権で守られていることが多く、ファン活動の範囲を超えます。', how:'オリジナルのアイコンを作る。公式がライセンス（使用許諾）を出していないか確認する。' },
  { q:'好きな作品のファンアートを描いて SNS に投稿する', a:'warn', why:'二次創作は本来、元の作品の権利者の許可が必要です。多くの作品は<b>公式のガイドライン</b>で条件つきで認めています。', how:'作品の公式サイトで「二次創作ガイドライン」を確認。営利目的・公式と誤解される表現・AI での生成は禁止されていることが多い。' },
  { q:'アプリのレビュー記事で、画面のスクリーンショットを載せる', a:'warn', why:'画面にも著作物（デザイン・イラスト・文章）が含まれます。レビュー・解説のために必要な範囲なら引用として認められる場合が多いです。', how:'自分の評価・説明がメイン、必要な枚数だけ、アプリ名と出所を書く。公式がプレス素材を出していればそれを使う。' },
  { q:'他社の公式サイトの説明文をそのままコピーして、自分のサイトに載せる', a:'bad', why:'文章の転載で、引用にもあたりません。検索エンジンでも重複コンテンツとして評価が下がります。', how:'自分の言葉で書く。AI に「書き換えて」と頼んでも、元の文と似すぎていれば同じ問題です。' },
  { q:'「フリー素材」と書かれた画像を、自社のロゴに使う', a:'warn', why:'「フリー」は「無料」の意味のことが多く、<b>何に使ってもよいとは限りません</b>。ロゴ・商標登録への利用は多くのサイトが禁止しています。', how:'素材サイトの利用規約で「ロゴ」「商標」「独占的な利用」の項目を確認する。' },
  { q:'100年以上前に亡くなった画家の絵を、美術館のサイトの写真で使う', a:'warn', why:'絵の著作権は切れています。平面の絵をそのまま写した写真は、一般に新しい著作物にならないとされますが、<b>サイトの利用規約</b>で使い方が決められていることがあります。', how:'美術館のオープンデータ（自由に使える画像の公開）を探す。利用条件とクレジットの書き方に従う。' },
  { q:'GitHub で見つけた、ライセンスが書かれていないコードをコピーして使う', a:'bad', why:'ライセンスがない＝<b>すべての権利が作者に残っている</b>状態です。公開されていても、コピーして使う許可はありません。', how:'作者に許可を求める（Issue でライセンスの追加をお願いする）か、ライセンスのある別のコードを使う。' },
];
TABS.push({ id:'use', label:'他人の作品を使う', icon:'📎',
  intro:'他人の作品を使ってよいのは、基本的に<b>①許可（ライセンス）がある　②保護期間が終わっている　③引用など法律の例外にあたる</b>のどれかのときだけです。「ネットにあった」「無料だった」「クレジットを書いた」だけでは使えません。',
  sections:[
    C('触って理解する', [
      { name:'これ、使っていい？', en:'Can I use this?', h:440, tags:['体験','最重要'], demo:'<div class="j"></div>', init:(el) => judge($(el, '.j'), USE),
        desc:'迷ったら「<b>許可・保護期間・例外</b>のどれで使えるのか」を一言で説明できるかを考えます。説明できなければ、使わないか、確かめます。',
        prompt:'【使いたいもの】を【使い方（Webサイト・アプリ・SNS・商用かどうか）】で使いたい。日本の著作権法と一般的な利用規約の考え方で、使える条件・必要な許可・注意点を整理して。判断に必要な情報が足りなければ質問して。断定できない点は「確認が必要」と明記して。' },
      { name:'引用の条件チェッカー', en:'Quotation checklist', h:470, tags:['体験','最重要'],
        demo:'<div class="kt"><div class="lc-checks"></div><div class="kt-verdict res"></div><pre class="lc-out" style="flex:none;max-height:92px"></pre></div>',
        init:(el) => { const box = $(el, '.lc-checks');
          box.innerHTML = QUOTE.map(([a, b], i) => `<label><input type="checkbox" data-i="${i}"><span>${a}<small>${b}</small></span></label>`).join('');
          $(el, '.lc-out').textContent = L('<p>筆者は次のように述べている。</p>', '<blockquote>', '  <p>（引用する文章）</p>', '</blockquote>', '<p>出典：作者名『作品名』（出版社、2025年）', '  / <cite><a href="https://…">ページ名</a></cite></p>', '<p>この指摘について、私は…（自分の意見が主）</p>');
          const up = () => { const cs = $$(box, 'input'), miss = cs.filter(c => !c.checked).map(c => QUOTE[+c.dataset.i][0]);
            cs.forEach(c => c.closest('label').classList.toggle('on', c.checked));
            verdict($(el, '.res'), miss.length ? (miss.length > 2 ? 'bad' : 'warn') : 'ok', miss.length ? `<b>まだ引用とはいえません。</b>足りない条件：${miss.map(m => '「' + m + '」').join('')}` : '<b>6つの条件をすべて満たしています。</b>引用として使える可能性が高い状態です（最終的には「公正な慣行」「正当な範囲」かで判断されます。第32条）。下は HTML での書き方の例。'); };
          box.onchange = up; up(); },
        desc:'条件は著作権法第32条（引用）・第48条（出所の明示）と、最高裁の判例（1980年・パロディ・モンタージュ事件など）で示された考え方です。画像の引用も同じ条件ですが、<b>サムネイル代わりに大きく使う</b>のは主従が逆転しやすく注意。',
        prompt:'私の記事の中の引用部分が、日本の著作権法の引用の条件（必要性・主従関係・明瞭な区別・出所の明示・改変しない）を満たしているか、条件ごとにチェックして。足りない点の直し方も教えて。\n【記事】' },
    ], null, true),
    S('使い方ごとの考え方', [
      T('引用と転載', 'Quotation vs reprint', '引用は自分の文章の中で必要な部分を借りること。<b>転載</b>は作品をそのまま載せることで、許可が必要です。「引用元：〜」と書いても、条件を満たさなければ転載です。', null, ['最重要']),
      T('リンク', 'Linking', 'リンクを張るのは原則自由。「リンクには許可が必要」という規約があっても、法的な強制力は限定的とされます。ただし誤解を招く見せ方や、違法サイトへの誘導は避けます。'),
      T('埋め込み', 'Embedding', 'YouTube・X・Instagram などの公式の埋め込み機能は、サービスの規約で認められた使い方です。元の投稿が消えれば表示も消えます。'),
      T('スクリーンショット', 'Screenshots', '画面の中の作品（他人の投稿・画像・デザイン）を写したものなので、元の作品の権利が及びます。解説・批評のための引用か、許可が必要です。<b>他人の投稿のスクショには、個人情報や肖像</b>も含まれます。'),
      T('二次創作とガイドライン', 'Fan works', '作品の権利者が「ここまでならOK」と示すルール。営利禁止・公式素材の使用禁止・AI生成の禁止などが定められていることが多いので、必ず読んでから作ります。'),
      T('パロディ・オマージュ', 'Parody / homage', '日本にはパロディを特別に認める規定がなく、元の表現が感じ取れれば侵害になりえます。「パロディだから大丈夫」は通用しません。'),
      T('トレースと模写', 'Tracing', '他人の絵や写真をなぞった絵（トレース）は複製・翻案にあたりえます。練習で描くのは私的使用でも、<b>公開すると問題</b>になります。', null, ['注意']),
      T('「フリー素材」の意味', 'Free assets', '「無料で使える」の意味が多く、<b>著作権が放棄されているとは限りません</b>。クレジット必須・商用不可・加工禁止・点数制限などの条件があります。'),
      T('商用利用', 'Commercial use', 'お金をもうける目的での利用。広告のあるブログ、会社のサイト、有料アプリ、仕事の資料も「商用」とされることが多いです。範囲はサービスごとの規約で確認します。'),
      T('改変', 'Modification', '切り抜き・色の変更・文字入れ・合成など。許可されていても、作者の意図をゆがめる改変は同一性保持権の問題になりえます。'),
      T('許可のもらい方', 'Asking permission', '誰が権利者かを確かめ、<b>何を・どこで・どのくらいの期間・有料か無料か</b>を具体的に伝えます。返事は記録に残る形（メール）でもらいます。', '【作品】の作者に、【使い方】での利用許可をお願いするメールの下書きを書いて。使う範囲・期間・クレジットの表記・お礼（有償・無償）を具体的に書いて、断られても大丈夫な丁寧な文面にして。'),
    ]),
  ]});

/* ================= 3. OSSライセンス ================= */
const LIC = [
  { id:'MIT', nm:'MIT', kind:'ゆるい（パーミッシブ）', can:['商用利用', '改変', '配布', '私的利用'], must:['著作権表示とライセンス文を残す'], lim:['無保証', '作者は責任を負わない'], sum:'いちばん短く、条件のゆるいライセンス。<b>表示さえ残せば</b>何に使ってもよい。', ex:'React、Vue.js、jQuery、Next.js など' },
  { id:'Apache-2.0', nm:'Apache 2.0', kind:'ゆるい（パーミッシブ）', can:['商用利用', '改変', '配布', '私的利用', '<b>特許の利用許諾</b>'], must:['著作権表示とライセンス文を残す', 'NOTICE ファイルがあれば、その内容も表示', '改変したファイルには変更した旨を書く'], lim:['無保証', '責任を負わない', '<b>商標（名前・ロゴ）は使えない</b>'], sum:'MIT に近いが、<b>特許</b>の扱いが明記されていて、会社がよく選ぶ。', ex:'Kubernetes、TypeScript、Android（多くの部分）など' },
  { id:'BSD-3-Clause', nm:'BSD 3条項', kind:'ゆるい（パーミッシブ）', can:['商用利用', '改変', '配布', '私的利用'], must:['著作権表示とライセンス文を残す'], lim:['無保証', '責任を負わない', '<b>作者の名前を宣伝に使わない</b>'], sum:'MIT とほぼ同じ。作者や組織の名前を、許可なく推薦・宣伝に使わない条件付き。', ex:'Django、NumPy など' },
  { id:'MPL-2.0', nm:'MPL 2.0', kind:'弱いコピーレフト（ファイル単位）', can:['商用利用', '改変', '配布', '私的利用', '特許の利用許諾'], must:['ライセンス文を残す', '<b>MPL のファイルを改変したら、そのファイルのソースを公開</b>（同じ MPL で）'], lim:['無保証', '責任を負わない', '商標は使えない'], sum:'変えた<b>ファイルだけ</b>公開が必要。自分で書いた別のファイルは自由なライセンスにできる。', ex:'Firefox など' },
  { id:'LGPL-3.0', nm:'LGPL 3.0', kind:'弱いコピーレフト（ライブラリ）', can:['商用利用', '改変', '配布', '私的利用', '特許の利用許諾'], must:['ライセンス文と著作権表示', 'ライブラリ自体を改変したら、その部分のソースを公開', '利用者がライブラリを<b>差し替えられる</b>ようにする', '変更点を明示'], lim:['無保証', '責任を負わない'], sum:'ライブラリとして<b>使うだけ</b>なら、自分のアプリのソースは公開しなくてよい。', ex:'FFmpeg（標準の構成）、Qt（商用ライセンスとの選択制）など' },
  { id:'GPL-3.0', nm:'GPL 3.0', kind:'強いコピーレフト', can:['商用利用', '改変', '配布', '私的利用', '特許の利用許諾'], must:['<b>配るときは、組み合わせた全体を GPL で公開</b>（ソースコードを提供）', 'ライセンス文と著作権表示', '変更点を明示'], lim:['無保証', '責任を負わない'], sum:'GPL のコードを組み込んだソフトを<b>配る</b>と、自分のコードも含めて GPL でソースを公開する義務が生じる。', ex:'GIMP、WordPress（GPL 2.0 以降）、Linux カーネル（GPL 2.0）など' },
  { id:'AGPL-3.0', nm:'AGPL 3.0', kind:'もっとも強いコピーレフト', can:['商用利用', '改変', '配布', '私的利用', '特許の利用許諾'], must:['GPL の条件すべて', '<b>改変版をネット経由で使わせる場合も、利用者にソースを提供</b>'], lim:['無保証', '責任を負わない'], sum:'Webサービスとして提供するだけでもソース公開の義務が生じうる。会社によっては利用を禁止しているほど注意が必要。', ex:'Mastodon、Grafana など' },
  { id:'CC0-1.0', nm:'CC0 / Unlicense', kind:'権利放棄（パブリックドメイン相当）', can:['商用利用', '改変', '配布', '私的利用'], must:['なし（表示は任意）'], lim:['無保証', '特許の許諾はない（CC0）'], sum:'作者ができる限り権利を手放す宣言。条件なしで使える。', ex:'CC0 は画像・データで多い。SQLite は独自にパブリックドメインを宣言' },
  { id:'NONE', nm:'ライセンスなし', kind:'— すべての権利が作者に残る', can:['見ること（GitHub の公開リポジトリならフォークも可）'], must:['<b>コピー・改変・配布には作者の許可が必要</b>'], lim:['使う権利は何も与えられていない'], sum:'公開されていても、<b>使ってよいという意味ではない</b>。作者にライセンスの追加をお願いするか、別のものを使う。', ex:'個人の公開リポジトリによくある' },
];
// 使い方別の義務。mode: 0 配る / 1 ブラウザに配信 / 2 サーバーの中だけ / 3 自分だけ
function duties(id, mode, mod){
  const dist = mode <= 1, D = [], add = (cls, t) => D.push([cls, t]);
  if (mode === 3){ if (id === 'NONE') add('warn', '自分ひとりで試すだけなら私的使用の範囲ですが、<b>会社の中で使う・自分の作品に組み込む</b>には作者の許可が必要です（ライセンスがない＝使う許可が出ていない）。'); else add('ok', '自分や社内だけで使い、外に配らないなら、ほとんどのライセンスで特別な義務はありません。'); return D; }
  if (id === 'NONE'){ add('bad', '<b>使えません。</b>作者に許可をもらうか、ライセンスのある別のコードを使います。'); return D; }
  if (id === 'CC0-1.0'){ add('ok', '義務はありません。出典を書いておくと、あとで確認しやすく親切です。'); return D; }
  if (mode === 1) add('warn', '<b>ブラウザに JavaScript を送る＝利用者にコードを「配っている」</b>と考えます。ビルドで消えがちなライセンスのコメントを残すか、「使用しているライブラリとライセンス」のページを用意します。');
  if (mode === 2 && id !== 'AGPL-3.0'){ add('ok', 'サーバーの中だけで動かし、プログラム自体を利用者に渡さないなら、一般に「配布」にあたらず、表示やソース公開の義務は生じません（表示しておくのは親切）。'); return D; }
  if (id === 'MIT' || id === 'BSD-3-Clause'){ if (dist) add('ok', '著作権表示とライセンス文を一緒に配ります（アプリ内の「ライセンス」画面、同梱のテキストなど）。'); if (id === 'BSD-3-Clause') add('ok', '作者・組織の名前を、許可なく宣伝・推薦に使いません。'); }
  if (id === 'Apache-2.0'){ add('ok', 'LICENSE の文面を一緒に配ります。'); add('ok', 'NOTICE ファイルがあれば、その内容も表示します。'); if (mod) add('warn', '改変したファイルには「変更した」ことを書きます。'); add('ok', 'プロジェクトの名前やロゴは、許可なく自分の製品名に使いません。'); }
  if (id === 'MPL-2.0'){ add('ok', 'ライセンス文と、MPL のコードを使っていることを示します。'); add(mod ? 'warn' : 'ok', mod ? '<b>改変した MPL のファイルは、ソースを MPL で公開</b>します（利用者が入手できるようにする）。自分で書いた別のファイルは公開不要。' : '改変していなければ、元のソースの入手先を示せば足ります。'); }
  if (id === 'LGPL-3.0'){ add('ok', 'ライセンス文・著作権表示と、ライブラリのソースの入手方法を示します。'); add('warn', '利用者がライブラリを<b>新しい版に差し替えられる</b>形で組み込みます（動的リンクなど）。'); if (mod) add('warn', '<b>ライブラリ自体を改変した部分は、ソースを公開</b>します。'); add('ok', '自分のアプリのコードは公開しなくて構いません。'); }
  if (id === 'GPL-3.0' || id === 'AGPL-3.0'){
    if (mode === 2){ add(mod ? 'bad' : 'warn', mod ? '<b>改変した（自分のコードと組み合わせた場合も含むと考えるのが一般的）AGPL のプログラムを、ネット経由で使わせるなら、利用者にソースコードを提供</b>する義務があります。' : '改変せずにそのまま動かしているだけなら、ネット経由の提供によるソース提供の義務は限られます。自分のコードと組み合わせた時点で「改変」とみなされうるので、慎重に判断します。'); add('warn', 'GPL ならサーバーの中だけでの利用は配布にあたりませんが、AGPL はここが違います。'); return D; }
    add('bad', '<b>組み合わせたプログラム全体を、同じライセンスで公開</b>する必要があります。自分で書いたコードも含めて、ソースコードを受け取れるようにします。'); add('ok', 'ライセンス文と著作権表示を一緒に配ります。'); if (mod) add('warn', '変更した点と日付を明示します。'); add('warn', '公開したくないアプリなら、GPL のコードは使わず、MIT などの代わりを探します。');
  }
  return D;
}
TABS.push({ id:'oss', label:'OSSライセンス', icon:'📜',
  intro:'npm や pip で入れるパッケージ、GitHub のコード、AI が持ってきたコードの多くは<b>オープンソース（OSS）</b>です。自由に使えますが、<b>ライセンスごとに守るべき条件</b>があります。大きく分けて、表示さえすれば自由な<b>パーミッシブ</b>（MIT など）と、配るときにソース公開を求める<b>コピーレフト</b>（GPL など）の2種類です。',
  sections:[
    C('触って理解する', [
      { name:'主なライセンスを比べる', en:'Compare licenses', h:440, wide:true, tags:['基本','体験','最重要'],
        demo:'<div class="kt"><div class="sg"></div><div class="lc-sum sm"></div><div class="lc-cols"><div><h4>✅ できること</h4><ul class="c1"></ul></div><div><h4>📝 条件（守ること）</h4><ul class="c2"></ul></div><div><h4>⚠ 制限</h4><ul class="c3"></ul></div></div></div>',
        init:(el) => $(el, '.sg').append(seg(LIC.map(l => l.nm), (i) => { const l = LIC[i];
          $(el, '.sm').innerHTML = `<b>${l.nm}</b>　<code>${l.id === 'NONE' ? '（なし）' : 'SPDX: ' + l.id}</code>　${l.kind}<br>${l.sum}<br><span class="kt-note">例：${l.ex}</span>`;
          $(el, '.c1').innerHTML = l.can.map(x => `<li>${x}</li>`).join(''); $(el, '.c2').innerHTML = l.must.map(x => `<li>${x}</li>`).join(''); $(el, '.c3').innerHTML = l.lim.map(x => `<li>${x}</li>`).join(''); }, 0).el),
        desc:'分類は <a href="https://choosealicense.com/licenses/" target="_blank" rel="noopener">choosealicense.com</a>（GitHub が運営）にならっています。正確な条件は、必ず各ライセンスの本文で確認してください。',
        prompt:'このプロジェクトの依存パッケージのライセンスを一覧にして、GPL・AGPL・LGPL・ライセンス不明のものがあれば目立つように分けて。それぞれ、私の使い方（【Webアプリをブラウザに配信／アプリを配布／サーバーのみ】）で必要な対応も書いて。' },
      { name:'使い方で変わる義務', en:'What do I have to do?', h:470, wide:true, tags:['体験','最重要'],
        demo:'<div class="kt"><div class="lc-row"><span class="kt-lbl">ライセンス</span><span class="s1"></span></div><div class="lc-row"><span class="kt-lbl">使い方</span><span class="s2"></span></div><div class="lc-row"><span class="kt-lbl">改変</span><span class="s3"></span></div><ul class="lc-todo"></ul></div>',
        init:(el) => { let id = 'MIT', mode = 1, mod = 0; const L2 = LIC.filter(l => l.id !== 'BSD-3-Clause');
          const up = () => { $(el, '.lc-todo').innerHTML = duties(id, mode, mod).map(([c, t]) => `<li class="${c}">${MK(c)}<span>${t}</span></li>`).join(''); };
          $(el, '.s1').append(seg(L2.map(l => l.nm), (i) => { id = L2[i].id; up(); }, 0).el);
          $(el, '.s2').append(seg(['アプリ・ソフトを配る', 'Webでブラウザに配信', 'サーバーの中だけ', '自分・社内だけ'], (i) => { mode = i; up(); }, 1).el);
          $(el, '.s3').append(seg(['そのまま使う', '改変した'], (i) => { mod = i; up(); }, 0).el); },
        desc:'ポイントは「<b>配っているか</b>」。アプリのダウンロード配布はもちろん、<b>Webページでブラウザに送る JavaScript も配布</b>と考えます。一方、サーバーの中だけで動くコードは利用者に渡らないので、GPL でもソース公開の義務は生じません（AGPL は例外）。',
        prompt:'私のプロジェクトは【構成：例 Next.js のWebアプリ、サーバーは Vercel】です。依存パッケージのライセンスごとに、表示・ソース公開などの義務があるかを表にして。ブラウザに送られるコードとサーバーだけで動くコードを分けて考えて。' },
    ], null, true),
    { title:'主なライセンスの早見表', note:'2026年11月時点。名前の横の記号は SPDX 識別子（ライセンスを表す世界共通の短い名前）です。',
      table:{ head:['ライセンス', '種類', '配るときの主な条件', '向いている用途'], rows:[
        ['MIT（<code>MIT</code>）', 'パーミッシブ', '著作権表示とライセンス文', '小さなライブラリ・個人の作品。迷ったらこれ'],
        ['Apache 2.0（<code>Apache-2.0</code>）', 'パーミッシブ', '表示＋NOTICE＋変更の明示', '会社のOSS、特許が絡むもの'],
        ['BSD 2条項/3条項', 'パーミッシブ', '表示（3条項は名前の宣伝利用の禁止も）', 'MIT と同様'],
        ['ISC・0BSD', 'パーミッシブ', 'ISC は表示、0BSD は条件なし', 'npm の小さなパッケージに多い'],
        ['MPL 2.0（<code>MPL-2.0</code>）', 'ファイル単位のコピーレフト', '改変したファイルのソース公開', '改良は還元してほしいが、組み込みは自由にしたい'],
        ['LGPL 3.0（<code>LGPL-3.0</code>）', 'ライブラリのコピーレフト', 'ライブラリ部分のソース・差し替え可能に', 'ライブラリ'],
        ['GPL 3.0（<code>GPL-3.0</code>）', '強いコピーレフト', '全体を GPL でソース公開', '改良版もずっと自由にしておきたいアプリ'],
        ['AGPL 3.0（<code>AGPL-3.0</code>）', '最も強いコピーレフト', 'ネット経由の提供でもソース公開', 'Webサービスの改良版も公開させたいとき'],
        ['CC BY 4.0 など', 'コンテンツ用', '表示（ライセンスによって継承・非営利など）', '文章・画像・データ（コードには非推奨）'],
        ['ライセンスなし', '—', '使えない', '—'],
      ] } },
    S('ライセンスの言葉', [
      T('OSS（オープンソース）', 'Open source', 'ソースコードが公開され、決められた条件で誰でも使い・改変し・配れるソフト。条件を定めたものが OSS ライセンスです（OSI が認定したものが代表的）。', null, ['基本']),
      T('パーミッシブ', 'Permissive', '表示さえ残せば、改変・商用・非公開の製品への組み込みも自由なライセンス。MIT・Apache・BSD など。'),
      T('コピーレフト', 'Copyleft', '改変版や組み込んだものを配るとき、<b>同じライセンスでソースを公開</b>することを求める考え方。GPL が代表。「自由を受け継がせる」仕組みです。', null, ['最重要']),
      T('SPDX 識別子', 'SPDX identifier', '<code>MIT</code>・<code>Apache-2.0</code>・<code>GPL-3.0-or-later</code> のような、ライセンスを表す世界共通の短い名前。package.json の <code>"license"</code> や、ファイル先頭のコメントに書きます。'),
      T('-only と -or-later', 'Version clause', '<code>GPL-2.0-only</code> は「2.0だけ」、<code>GPL-2.0-or-later</code> は「2.0か、それ以降の版を選べる」。組み合わせられるかの判断に影響します。'),
      T('ライセンスの互換性', 'Compatibility', '違うライセンスのコードを1つにまとめられるか。例：Apache 2.0 のコードは GPL 3.0 の作品に入れられますが、GPL 2.0 だけ（only）とは組み合わせられません。'),
      T('デュアルライセンス', 'Dual licensing', '「GPL か、お金を払って商用ライセンスか」のように、使う人が選べる形。Qt などで見かけます。'),
      T('NOTICE とサードパーティー表示', 'Third-party notices', '使っている OSS の著作権表示とライセンスをまとめたもの。スマホアプリの「ライセンス」画面や、<code>THIRD_PARTY_NOTICES</code> というファイルがこれです。'),
      T('依存パッケージのライセンスを調べる', 'License audit', 'npm なら <code>npx license-checker --summary</code>、Python なら <code>pip-licenses</code> で一覧にできます。直接入れたものだけでなく、<b>その下の依存</b>も含めて確認します。', 'このプロジェクトの依存パッケージ（下の依存も含む）のライセンスを調べるコマンドを教えて。結果のうち、GPL・AGPL・ライセンス不明のものを見つける方法と、見つかったときの選択肢（別のパッケージに替える等）も。', ['実践']),
      T('ビルドでライセンス表示が消える', 'Stripped notices', 'JavaScript を圧縮（ミニファイ）すると、ライセンスのコメントが消えることがあります。バンドラーの設定でライセンスを別ファイルに書き出すか、ライセンス一覧ページを作ります。'),
      T('コードのコピペ', 'Copy & paste', 'Stack Overflow の回答は CC BY-SA ライセンス、ブログのコードはブログの規約に従います。数行のありふれたコードは著作物にあたらないことも多いですが、まとまった量は出典とライセンスを確認します。'),
      T('ソースを公開している ≠ OSS', 'Source-available', '「ソースは見られるが、商用利用や競合サービスでの利用は禁止」というライセンスもあります（BSL・SSPL など）。名前だけで判断せず、条件を読みます。', null, ['注意']),
    ]),
  ]});

/* ================= 4. 自分の作品に付ける ================= */
const CHOOSE = {
  root:{ q:'何を公開しますか？', opts:[['プログラム（コード）', 'code'], ['文章・画像・動画・データ', 'content'], ['フォント', 'font']] },
  code:{ q:'ほかの人があなたのコードを改良して配るとき、改良版のソースも公開してほしいですか？', opts:[['いいえ。自由に使ってもらえればよい', 'perm', '会社の非公開の製品に組み込まれても構わない'], ['はい。改良したら公開してほしい', 'copy'], ['条件は一切いらない', 'zero', '作者名の表示もなしでよい']] },
  perm:{ q:'特許の扱いや、大きな会社での利用を意識しますか？', opts:[['気にしない。短くて分かりやすいのがいい', 'mit'], ['はい。特許の扱いもはっきりさせたい', 'apache']] },
  copy:{ q:'どこまで公開を求めますか？', opts:[['変えたファイルだけでよい', 'mpl', 'ライブラリとして組み込むのは自由'], ['組み合わせたプログラム全体（配る場合）', 'gpl'], ['Webサービスとして提供する場合も', 'agpl']] },
  content:{ q:'使う人に、作者名（クレジット）の表示を求めますか？', opts:[['求めない。完全に自由に使ってほしい', 'cc0'], ['求める', 'by']] },
  by:{ q:'ほかに付けたい条件は？', opts:[['なし', 'ccby', 'いちばん広まりやすい'], ['改変した作品も同じライセンスで公開してほしい', 'ccbysa'], ['お金もうけ（営利）には使わせたくない', 'ccbync'], ['改変は不可', 'ccbynd']] },
  mit:{ r:1, nm:'MIT License', d:'表示さえ残せば何にでも使える、いちばん定番のライセンス。この辞典もMITです。GitHub でリポジトリを作るときに「Add a license」から選べます。' },
  apache:{ r:1, nm:'Apache License 2.0', d:'MIT に、特許の利用許諾と、商標を使わせない条件が加わったもの。会社が公開する OSS によく使われます。' },
  mpl:{ r:1, nm:'MPL 2.0', d:'あなたのファイルを改変したら公開が必要ですが、ほかのプログラムへの組み込みは自由。中間的な選択肢です。' },
  gpl:{ r:1, nm:'GPL 3.0', d:'改良版を配るときは、全体をGPLでソース公開する必要があります。会社の製品には組み込みにくくなるため、使ってもらえる範囲は狭まります。' },
  agpl:{ r:1, nm:'AGPL 3.0', d:'Webサービスとして提供する改良版にもソース公開を求めます。会社によっては利用を禁止しているので、広く使われたいなら慎重に。' },
  zero:{ r:1, nm:'0BSD（または Unlicense）', d:'表示の義務もない、ほぼ権利放棄のライセンス。コードには、CC0 より OSS として認められた 0BSD などが選ばれることが多いです。' },
  cc0:{ r:1, nm:'CC0 1.0', d:'できる限り権利を手放して、パブリックドメインと同じ状態にします。画像・データの公開に向いています。' },
  ccby:{ r:1, nm:'CC BY 4.0（表示）', d:'作者名などを表示すれば、商用・改変も含めて自由に使えます。文章や画像を広めたいときの定番。' },
  ccbysa:{ r:1, nm:'CC BY-SA 4.0（表示・継承）', d:'改変した作品も同じ CC BY-SA で公開してもらう条件。Wikipedia の文章がこのライセンスです。' },
  ccbync:{ r:1, nm:'CC BY-NC 4.0（表示・非営利）', d:'営利目的の利用を禁止します。ただし「営利」の範囲はあいまいで、使う人が迷いやすく、広まりにくくなります。OSS の定義には当てはまりません。' },
  ccbynd:{ r:1, nm:'CC BY-ND 4.0（表示・改変禁止）', d:'そのままの形でだけ使えます。翻訳や切り抜きもできなくなるので、教材などには不向き。' },
  font:{ r:1, nm:'SIL Open Font License 1.1', d:'フォント用の定番ライセンス。アプリや PDF への埋め込み・商用利用は自由、フォント単体での販売は不可。Google Fonts の多くがこれです。' },
};
const MIT_TXT = (y, n) => L('MIT License', '', `Copyright (c) ${y} ${n}`, '', 'Permission is hereby granted, free of charge, to any person obtaining a copy', 'of this software and associated documentation files (the "Software"), to deal', 'in the Software without restriction, including without limitation the rights', 'to use, copy, modify, merge, publish, distribute, sublicense, and/or sell', 'copies of the Software, and to permit persons to whom the Software is', 'furnished to do so, subject to the following conditions:', '', 'The above copyright notice and this permission notice shall be included in all', 'copies or substantial portions of the Software.', '', 'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR', 'IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,', 'FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE', 'AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER', 'LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,', 'OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE', 'SOFTWARE.');
const GEN = [
  ['MIT（LICENSE）', 'LICENSE というファイル名で、リポジトリのいちばん上に置きます。', (y, n) => MIT_TXT(y, n)],
  ['CC BY 4.0（README）', '文章・画像を CC BY で公開するときの表記例。README やページの下に書きます。', (y, n, t) => L(`「${t}」（${n}、${y}年）は、クリエイティブ・コモンズ 表示 4.0 国際 ライセンス（CC BY 4.0）の下に提供されています。`, 'https://creativecommons.org/licenses/by/4.0/deed.ja', '', '使うときは、作者名・作品名・このライセンスへのリンクを表示してください。')],
  ['CC0（README）', '権利を放棄して公開するときの表記例。', (y, n, t) => L(`「${t}」（${n}、${y}年）は、CC0 1.0 によりパブリックドメインとして提供されています。`, 'https://creativecommons.org/publicdomain/zero/1.0/deed.ja', '', '表示は不要です。自由に使ってください。')],
  ['package.json', 'npm のパッケージやプロジェクトでは、ここにも SPDX 識別子を書きます。', (y, n) => L('{', '  "name": "my-app",', '  "version": "1.0.0",', '  "license": "MIT",', `  "author": "${n}"`, '}')],
  ['ファイル先頭', '1つ1つのファイルにライセンスを示したいときの書き方（SPDX ヘッダー）。', (y, n) => L(`// SPDX-FileCopyrightText: ${y} ${n}`, '// SPDX-License-Identifier: MIT')],
];
TABS.push({ id:'mine', label:'自分の作品に付ける', icon:'🏷',
  intro:'作ったものを公開するとき、ライセンスを書かないと、<b>ほかの人は（法律上）使えません</b>。「自由に使ってほしい」なら、その気持ちをライセンスとして書いておく必要があります。逆に「ここまではいいけど、これはだめ」も、ライセンスで伝えられます。',
  sections:[
    C('触って理解する', [
      { name:'質問に答えてライセンスを選ぶ', en:'License chooser', h:420, tags:['体験','最重要'], demo:'<div class="t"></div>', init:(el) => tree($(el, '.t'), CHOOSE),
        desc:'迷ったら、コードは <b>MIT</b>、文章・画像は <b>CC BY 4.0</b> が定番です。コードと文章・画像でライセンスを分けることもできます（例：コードは MIT、イラストは CC BY）。',
        prompt:'私は【作ったもの】を公開したい。【希望：例 誰でも自由に使ってほしい／改良版も公開してほしい／商用は避けたい】。合いそうなライセンスを2〜3個、メリット・デメリットを比べて提案して。コード部分と画像・文章部分で分けるべきかも教えて。' },
      { name:'LICENSE・表記メーカー', en:'License text generator', h:450, tags:['体験','実践'],
        demo:'<div class="kt"><div class="sg"></div><div class="lc-form"><span>年</span><input class="kt-in y" type="number" min="1990" max="2100"><span>名前</span><input class="kt-in n" type="text" value="あなたの名前（ハンドル名でも可）"><span>作品名</span><input class="kt-in t" type="text" value="作品名"></div><div class="kt-note hint"></div><pre class="lc-out"></pre><div class="kt-row"><button type="button" class="kt-btn sm pri cp">コピー</button></div></div>',
        init:(el) => { let g = 0; $(el, '.y').value = NOW;
          const up = () => { const [, hint, f] = GEN[g]; $(el, '.hint').textContent = hint; $(el, '.lc-out').textContent = f($(el, '.y').value, $(el, '.n').value.trim() || 'あなたの名前', $(el, '.t').value.trim() || '作品名'); };
          $(el, '.sg').append(seg(GEN.map(x => x[0]), (i) => { g = i; up(); }, 0).el);
          $$(el, 'input').forEach(i => i.oninput = up); $(el, '.cp').onclick = () => VD.copyText($(el, '.lc-out').textContent); },
        desc:'MIT の本文は英語のまま使うのが基本です（翻訳は参考扱い）。名前は本名でなくても、GitHub のユーザー名などで構いません。',
        prompt:'このリポジトリに【ライセンス名】を付けたい。LICENSE ファイル、README のライセンス欄（日本語で、できること・条件を分かりやすく）、package.json の license を用意して。外部から読み込んでいるフォントやライブラリは対象外であることも書いて。' },
    ], null, true),
    S('付けるときの言葉と注意', [
      T('付けないとどうなるか', 'No license', 'ほかの人には<b>見ることしかできない</b>状態です。「使っていいよ」と思っていても伝わらず、きちんとした会社や学校ほど使えません。', null, ['最重要']),
      T('LICENSE ファイル', 'LICENSE file', 'リポジトリのいちばん上に <code>LICENSE</code>（または LICENSE.md）として置くと、GitHub が自動で認識して、ページの右側にライセンス名を表示します。'),
      T('著作権者の名前と年', 'Copyright line', '<code>Copyright (c) 2026 名前</code>。名前はハンドル名や団体名でも構いません。年は最初に公開した年（更新した年を「2025-2026」と書く方法も）。'),
      T('README のライセンス欄', 'README section', 'LICENSE は英語で読みにくいので、README に<b>日本語で「何をしてよいか・守ってほしいこと」</b>を書くと親切です。'),
      T('コードと文章・画像で分ける', 'Separate licenses', 'コードは MIT、イラストや文章は CC BY のように分けられます。README に「どのファイルにどのライセンスか」を書きます。CC ライセンスはソフトウェアには向かないと、CC 自身が案内しています。'),
      T('名前・ロゴは商標で別', 'Trademarks', 'コードを MIT にしても、プロジェクトの<b>名前やロゴ</b>まで自由に使わせる意味ではありません（Apache 2.0 は明記）。守りたいなら商標登録を検討します。'),
      T('ライセンスの変更', 'Relicensing', 'あとから変えられますが、<b>すでに前のライセンスで配ったものは、前のライセンスのまま</b>使い続けられます。ほかの人が貢献したコードを含むなら、その人たちの同意も必要です。'),
      T('貢献のルール（DCO・CLA）', 'DCO / CLA', 'ほかの人の変更を受け入れるとき、その人のコードも同じライセンスで出してよいかを確かめる仕組み。DCO はコミットに署名行を付ける軽い方法、CLA は契約書に同意してもらう方法です。'),
      T('利用規約との違い', 'Terms of service', 'ライセンスは「作品の使い方の許可」、利用規約は「サービスを使うときの約束」。Webサービスを公開するなら、ソースのライセンスとは別に利用規約が必要になることがあります。'),
      T('仕事で作ったものは会社のもの', 'Employer ownership', '職務著作として会社が著作者になる場合、<b>自分の判断ではライセンスを付けて公開できません</b>。副業・学校の課題も、規則を確認します。', null, ['注意']),
      T('AI が書いたコードにライセンスを付けてよい？', 'AI-written code', '付けること自体はできます。AI だけで作った部分は著作物にならない可能性がありますが、人が設計・修正した部分には著作権が生まれえます。既存の OSS のコードがそのまま出ていないかは確認しておきます（「AIと著作権」タブ）。'),
    ]),
  ]});
})();
