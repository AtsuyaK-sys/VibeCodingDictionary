/* テスト・品質辞典 — A: 共通ヘルパー（ミニテストランナー） / テストの基本 / 単体テスト / E2Eテスト / アクセシビリティ */
(function(){
const { $, $$, esc, tbl, seg, stepper } = KIT;
const S = (title, items, note) => ({ title, note, layout:'rows', items });
const C = (title, items, note, lg) => ({ title, note, layout:lg ? 'cards lg' : 'cards', items });
const T = (name, en, desc, prompt, tags, more) => Object.assign({ name, en, desc, prompt, tags }, more || {});
const verdict = (el, cls, html) => { el.classList.remove('ok', 'bad', 'warn'); if (cls) el.classList.add(cls); el.innerHTML = html; };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const rng = (s) => () => (s = (s * 16807) % 2147483647) / 2147483647;

/* ---- ブラウザの中だけで動く、小さなテストランナー（Vitest / Jest に似た書き方） ---- */
function runTests(srcFn, srcTests){
  const tests = [], fmt = (v) => typeof v === 'function' ? '関数' : JSON.stringify(v); let cnt = 0;
  const test = (name, fn) => tests.push({ name, fn });
  const make = (a, neg) => { const chk = (ok, msg) => { cnt++; if (neg ? ok : !ok) throw new Error((neg ? '（not）' : '') + msg); };
    return { toBe:(b) => chk(Object.is(a, b), `期待：${fmt(b)}　実際：${fmt(a)}`), toEqual:(b) => chk(fmt(a) === fmt(b), `期待：${fmt(b)}　実際：${fmt(a)}`), toBeTruthy:() => chk(!!a, `真のはずが ${fmt(a)}`), toBeFalsy:() => chk(!a, `偽のはずが ${fmt(a)}`), toBeGreaterThan:(b) => chk(a > b, `${fmt(a)} は ${fmt(b)} より大きいはず`), toContain:(b) => chk(a != null && a.includes(b), `${fmt(a)} に ${fmt(b)} が含まれるはず`), toThrow:() => { let threw = false; try { a(); } catch (e){ threw = true; } chk(threw, 'エラーになるはずが、ならなかった'); } }; };
  const expect = (a) => Object.assign(make(a, false), { not:make(a, true) });
  try { new Function('test', 'expect', `"use strict";\n${srcFn}\n${srcTests}`)(test, expect); } catch (e){ return { error:'コードの読み込みでエラー：' + e.message, results:[] }; }
  return { results:tests.map(t => { cnt = 0; try { t.fn(); return cnt ? { name:t.name, ok:true } : { name:t.name, ok:true, warn:'expect がありません（何も確かめていない）' }; } catch (e){ return { name:t.name, ok:false, msg:e.message }; } }) };
}
function showResults(box, r){
  if (r.error){ box.innerHTML = `<div class="bad"><b>×</b><span>${esc(r.error)}</span></div>`; return { pass:0, fail:1 }; }
  const pass = r.results.filter(x => x.ok).length, fail = r.results.length - pass;
  box.innerHTML = `<span class="ts-sum"><span class="p">✓ ${pass}件 成功</span>　<span class="f">${fail ? `× ${fail}件 失敗` : ''}</span></span>` + r.results.map(x => `<div class="${x.ok ? (x.warn ? 'warn' : 'ok') : 'bad'}"><b>${x.ok ? (x.warn ? '△' : '✓') : '×'}</b><span>${esc(x.name)}${x.msg || x.warn ? `<small>${esc(x.msg || x.warn)}</small>` : ''}</span></div>`).join('');
  return { pass, fail };
}
window.TSH = { S, C, T, verdict, sleep, rng, runTests, showResults };

/* ================= 1. テストの基本 ================= */
const LAYERS = [['静的解析・型', 'Static', '#64748b', 'TypeScript の型チェック・ESLint。<b>書いた瞬間</b>に打ち間違い・型の間違いを見つける。一番安くて速い。', '毎回（保存・コミット時）'], ['単体テスト', 'Unit', '#16a34a', '関数1つ・部品1つを単独で確かめる。<b>速い（数ミリ秒）・たくさん書ける</b>。計算・変換・判定のロジックに。', '数百〜数千'], ['結合テスト', 'Integration', '#0ea5e9', '複数の部品・DB・APIを組み合わせて確かめる。画面の部品＋状態、APIのルート＋DB など。', '数十〜数百'], ['E2Eテスト', 'End-to-End', '#a855f7', '本物のブラウザで、利用者と同じ操作（ログイン→購入）を通しで確かめる。<b>遅く壊れやすい</b>ので、大事な流れだけ。', '数個〜数十']];
const AAA = [['test("5000円以上は1割引き", () => {', ''], ['  // Arrange（準備）', 'a'], ['  const cart = { items: [{ price: 6000 }] };', 'a'], ['', ''], ['  // Act（実行）', 'b'], ['  const total = calcTotal(cart);', 'b'], ['', ''], ['  // Assert（確認）', 'c'], ['  expect(total).toBe(5400);', 'c'], ['});', '']];
const KINDS = [['静的解析', 'ESLint・TypeScript', '書いた瞬間', '型・打ち間違い・よくない書き方'], ['単体テスト', 'Vitest・Jest', '数ミリ秒', '計算・判定・変換の関数'], ['コンポーネントテスト', 'Testing Library・Storybook', '数十ミリ秒', '画面の部品の表示と操作'], ['結合テスト', 'Vitest＋テスト用DB・MSW', '数百ミリ秒', 'API・DB・外部サービスとのつながり'], ['E2Eテスト', 'Playwright・Cypress', '数秒〜', '大事な操作の流れ（登録・購入）'], ['見た目のテスト', 'Playwright のスクショ比較・Chromatic', '数秒', 'デザインの崩れ'], ['アクセシビリティ', 'axe・Lighthouse', '数秒', 'コントラスト・ラベル・キーボード操作'], ['手動テスト', '人が触る', '分〜', '使い心地・新機能の確認']];

TABS.push({ id:'basics', label:'テストの基本', icon:'🧪',
  intro:'<b>テスト</b>は「プログラムが思った通りに動くか」を自動で確かめるプログラムです。AIにコードを書いてもらうほど、<b>直したら別の所が壊れた</b>を防ぐテストが大事になります。テストには種類（単体・結合・E2E）があり、<b>速くて安いものをたくさん、遅いものは大事な所だけ</b>が基本です。',
  sections:[
    C('触って理解する', [
      { name:'テストの種類と割合', en:'Testing pyramid / trophy', h:440, tags:['基本','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="ts-pyr py"></div><div class="kt-verdict res">段をクリックしてください。</div></div>',
        init:(el) => { const show = (i) => { const [n, en, c, d, cnt] = LAYERS[i]; $$(el, '.py button').forEach((b, j) => b.classList.toggle('on', +b.dataset.i === i)); verdict($(el, '.res'), '', `<b>${n}（${en}）</b>：${d}<br>数の目安：${cnt}`); };
          $(el, '.sw').replaceWith(seg(['ピラミッド型', 'トロフィー型'], k => { const W = k ? [55, 70, 95, 45] : [100, 85, 60, 35], order = [3, 2, 1, 0];
            $(el, '.py').innerHTML = order.map(i => `<button type="button" data-i="${i}" style="width:${W[i]}%;background:${LAYERS[i][2]}">${LAYERS[i][0]}</button>`).join('');
            $$(el, '.py button').forEach(b => b.onclick = () => show(+b.dataset.i)); verdict($(el, '.res'), '', k ? '<b>トロフィー型</b>：画面中心のWebアプリでは、<b>結合テスト</b>（部品を組み合わせた確認）を厚くするのが費用対効果が高い、という考え方。' : '<b>ピラミッド型</b>：下ほど速く安いので<b>たくさん</b>、上ほど遅く壊れやすいので<b>少なく</b>。古くからの基本の形。'); }).el); },
        desc:'テストには、関数1つを確かめる<b>単体テスト</b>、部品を組み合わせる<b>結合テスト</b>、ブラウザで通しで操作する<b>E2Eテスト</b>などがあります。下の方ほど速く安く、上ほど遅く壊れやすい。<b>型チェック（TypeScript）と静的解析</b>も、最も安いテストの一種です。',
        prompt:'このNext.jsのプロジェクトにテストの仕組みを入れて。単体・結合テストは Vitest、画面の部品は Testing Library、E2E は Playwright。まず「価格計算」「ログイン」「購入」の大事な部分に最低限のテストを書いて、npm test で全部動くようにして。' },
      { name:'テストの形（AAA）', en:'Arrange / Act / Assert', h:400, tags:['基本','書き方'],
        demo:'<div class="kt"><div class="ts-lines ln kt-grow"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.ln').innerHTML = AAA.map(([l, c]) => `<div class="${c}">${esc(l) || ' '}</div>`).join(''); verdict($(el, '.res'), '', '<b style="color:#0ea5e9">準備</b>：テストに使うデータを用意 → <b style="color:#a855f7">実行</b>：確かめたい関数を1回呼ぶ → <b style="color:var(--ok)">確認</b>：結果が期待通りか <code>expect</code> で調べる。<br>テストの名前は「<b>何をしたら、どうなるべきか</b>」を日本語で書くと、失敗したときに意味が分かります。'); },
        desc:'1つのテストは<b>「準備（Arrange）→ 実行（Act）→ 確認（Assert）」</b>の3段で書くと読みやすくなります。1つのテストで確かめることは<b>1つ</b>。名前には「5000円以上は1割引き」のように<b>仕様</b>を書くと、テストが仕様書の代わりにもなります。',
        prompt:'この関数のテストを、Arrange / Act / Assert の形で、テスト名は日本語の仕様の文（「〜のとき、〜になる」）で書いて。1テスト1確認にして、正常な場合・境界・エラーの場合をそれぞれ用意して。' },
      { name:'テストがあると直すのが怖くない', en:'Regression safety net', h:460, tags:['体験','最重要'],
        demo:'<div class="kt"><label class="kt-row" style="font-size:11.5px"><input type="checkbox" class="hv" checked>テストがある</label><div class="kt-row"><button type="button" class="kt-btn pri go">▶ AIに「コードを整理して」と頼む</button></div><div class="ts-res lg kt-grow"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let run = 0; $(el, '.go').onclick = async () => { const me = ++run, hv = $(el, '.hv').checked, lg = $(el, '.lg'), L = (c, t) => { lg.insertAdjacentHTML('beforeend', `<div class="${c}"><b>${c === 'ok' ? '✓' : c === 'bad' ? '×' : '・'}</b><span>${t}</span></div>`); lg.scrollTop = 1e6; }; lg.innerHTML = '';
            L('', 'AI：「重複していた割引の計算を1つの関数にまとめました」'); await sleep(500); if (me !== run) return;
            L('', '（実は「5000円<b>以上</b>」が「5000円<b>より大きい</b>」に変わってしまった）'); await sleep(500);
            if (hv){ L('', 'テストを実行…'); await sleep(500); L('ok', '1000円は割引なし'); L('bad', '5000円ちょうどは1割引きで4500円 <small>期待：4500　実際：5000</small>'); L('ok', '6000円は1割引きで5400円'); await sleep(300); verdict($(el, '.res'), 'ok', '✓ <b>公開する前に</b>テストが壊れたことを教えてくれました。AIに「このテストが失敗したので直して」と頼めば、すぐ直ります。'); }
            else { L('', 'そのまま公開…'); await sleep(600); L('bad', '3日後：お客さまから「5000円ちょうど買ったのに割引されない」と問い合わせ'); verdict($(el, '.res'), 'bad', '❌ 動作確認で目についた所は動いていたので、誰も気づけませんでした。<b>境界（ちょうど5000円）</b>のような細かい所ほど、人の確認では漏れます。'); } }; },
        desc:'AIにコードの整理や修正を頼むと、<b>目的の所は直っても、別の所が静かに壊れる</b>ことがあります（デグレ）。テストがあれば、変更のたびに<b>全部の仕様を数秒で確かめ直せる</b>ので、安心して直せます。AIとの開発では、テストは「安全ネット」です。',
        prompt:'これから AI にリファクタリングを頼む前に、今の動きを守るテストを書いて（今の実装が正しい前提で、主な入力と境界の値の結果を記録する）。そのテストが全部通ることを確認してから、リファクタリングして、もう一度テストを実行して。' },
      { name:'テストから書く（TDD）', en:'Red → Green → Refactor', h:440, tags:['書き方'],
        init:(el) => stepper(el, ['<b style="color:var(--bad)">Red（失敗するテストを書く）</b><br><code>expect(withTax(15)).toBe(16)</code>：まだ関数がないので失敗。<b>仕様を先にテストで決める</b>。', '<b style="color:var(--ok)">Green（最小限のコードで通す）</b><br><code>return Math.floor(price * 1.1)</code>：とにかく通るように書く。', '<b style="color:#0ea5e9">Refactor（きれいに整える）</b><br>税率を引数に、マイナスはエラーに。<b>テストが通り続けることを確かめながら</b>整理する。', '<b>くり返す</b><br>次の仕様（軽減税率8%）のテストを書いて Red から。小さく回すのがコツ。', '<b>AIとのTDD</b><br>「まずテストだけ書いて。実装はまだしないで」→ 人がテストを確認 → 「このテストが通るように実装して」。<b>テスト＝AIへの正確な指示書</b>になる。'], { title:'テスト駆動開発（TDD）の流れ' }),
        desc:'<b>TDD（テスト駆動開発）</b>は、先にテストを書いて（失敗＝Red）、通るように実装し（Green）、整える（Refactor）のをくり返す進め方。AIとの開発では特に相性がよく、<b>テストを先に人が確認しておけば、AIの実装が仕様通りか自動で判定</b>できます。',
        prompt:'これから「送料の計算」機能を作ります。まず仕様（3000円未満は500円、3000円以上は300円、1万円以上は無料、離島は+1000円）のテストだけを Vitest で書いて。実装はまだ書かないで。テストを確認したら、次に実装をお願いします。' },
    ], null, true),
    { title:'テストの種類と道具', note:'全部を一度に入れる必要はありません。<b>型チェック → 大事なロジックの単体テスト → 一番大事な流れのE2E</b>の順で始めるのがおすすめです。',
      table:{ head:['種類', '道具', '速さ', '向いている確認'], rows:KINDS } },
    S('テストの基本用語', [
      T('テストコード', 'Test code', '動きを確かめるためのプログラム。本番のコードとは別のファイル（*.test.ts）に書く。'),
      T('テストランナー', 'Test runner', 'テストを実行して結果を表示する道具。Vitest・Jest・Playwright Test など。'),
      T('アサーション', 'Assertion', '「こうなるはず」を確かめる文。<code>expect(結果).toBe(期待値)</code>。'),
      T('マッチャー', 'Matcher', '<code>toBe</code>・<code>toEqual</code>・<code>toThrow</code> など、確かめ方の種類。'),
      T('テストケース', 'Test case', '1つの確認。入力と期待する結果の組。'),
      T('リグレッション（デグレ）', 'Regression', '直したつもりが、前は動いていた所が壊れること。テストで防ぐ。', null, ['最重要']),
      T('正常系・異常系', 'Happy path / edge cases', '正しい入力のときと、おかしな入力（空・マイナス・巨大）のとき。異常系こそテストする。'),
      T('境界値', 'Boundary values', '「5000円以上」なら 4999・5000・5001 のような境目。バグが一番多い場所。（「単体テスト」タブ）'),
      T('TDD', 'Test-Driven Development', 'テストを先に書く開発の進め方。'),
      T('テストの独立性', 'Isolation', 'テストは順番に関係なく、1つずつでも通るように。前のテストの結果に頼らない。'),
      T('CI', 'Continuous Integration', '変更のたびに自動でテストを実行する仕組み。（「CIと自動化」タブ）'),
      T('品質の目安', 'Quality signals', 'テストの数より、<b>大事な所が守られているか</b>。お金・ログイン・データ削除は必ず。'),
    ]),
  ]});

/* ================= 2. 単体テスト ================= */
const PRE = [
  ['税込計算', '// 税込価格を返す（1円未満は切り捨て。マイナスはエラー）\nfunction withTax(price, rate = 0.1) {\n  return Math.round(price * (1 + rate));\n}', '// 税込価格を返す（1円未満は切り捨て。マイナスはエラー）\nfunction withTax(price, rate = 0.1) {\n  if (price < 0) throw new Error("金額がマイナスです");\n  return Math.floor(price * (1 + rate));\n}', 'test("1000円は1100円", () => {\n  expect(withTax(1000)).toBe(1100);\n});\ntest("15円は16円（16.5円を切り捨て）", () => {\n  expect(withTax(15)).toBe(16);\n});\ntest("軽減税率8%：250円は270円", () => {\n  expect(withTax(250, 0.08)).toBe(270);\n});\ntest("マイナスの金額はエラー", () => {\n  expect(() => withTax(-1)).toThrow();\n});'],
  ['メールの形式', '// メールアドレスの形か判定する\nfunction isEmail(s) {\n  return s.includes("@");\n}', '// メールアドレスの形か判定する\nfunction isEmail(s) {\n  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(s);\n}', 'test("普通のアドレスはOK", () => {\n  expect(isEmail("hanako@example.com")).toBe(true);\n});\ntest("@がないとNG", () => {\n  expect(isEmail("hanako")).toBe(false);\n});\ntest("@の前が空だとNG", () => {\n  expect(isEmail("@example.com")).toBe(false);\n});\ntest("空白が入っているとNG", () => {\n  expect(isEmail("hana ko@example.com")).toBe(false);\n});\ntest("ドメインに点がないとNG", () => {\n  expect(isEmail("hanako@example")).toBe(false);\n});'],
  ['割引とクーポン', '// 5000円以上で1割引き。そのあとクーポン（500円引き）。0円未満にはしない\nfunction total(price, coupon = false) {\n  let t = price;\n  if (price > 5000) t = t * 0.9;\n  if (coupon) t = t - 500;\n  return t;\n}', '// 5000円以上で1割引き。そのあとクーポン（500円引き）。0円未満にはしない\nfunction total(price, coupon = false) {\n  let t = price;\n  if (price >= 5000) t = Math.round(t * 0.9);\n  if (coupon) t = t - 500;\n  return Math.max(0, t);\n}', 'test("4999円は割引なし", () => {\n  expect(total(4999)).toBe(4999);\n});\ntest("5000円ちょうどは1割引き", () => {\n  expect(total(5000)).toBe(4500);\n});\ntest("6000円＋クーポンは4900円", () => {\n  expect(total(6000, true)).toBe(4900);\n});\ntest("300円＋クーポンは0円（マイナスにしない）", () => {\n  expect(total(300, true)).toBe(0);\n});'],
];
const SHIP = (t) => t < 3000 ? 500 : t < 10000 ? 300 : 0;

TABS.push({ id:'unit', label:'単体テスト', icon:'✅',
  intro:'<b>単体テスト</b>は、関数1つに入力を渡して、結果が期待通りかを確かめるテストです。下の<b>ミニテストランナー</b>は、このページの中だけで実際にテストを実行します（Vitest・Jest とほぼ同じ書き方）。わざとバグのある関数を、テストを見ながら直してみましょう。',
  sections:[
    C('触って理解する', [
      { name:'ミニテストランナー', en:'Write & run unit tests', h:600, tags:['体験','定番','最重要'], wide:true,
        demo:'<div class="kt"><div class="kt-row"><span class="sw"></span><button type="button" class="kt-btn pri go">▶ テストを実行</button><button type="button" class="kt-btn sm fx">直した版を見る</button></div><div class="ts-two"><div><span class="kt-lbl">テストされるコード（書き換えられます）</span><textarea class="kt-in ts-code fn" spellcheck="false" aria-label="コード"></textarea></div><div><span class="kt-lbl">テスト</span><textarea class="kt-in ts-code ts" spellcheck="false" aria-label="テスト"></textarea></div></div><div class="ts-res rs" style="max-height:34%"></div></div>',
        init:(el) => { let k = 0; const run = () => { const r = showResults($(el, '.rs'), runTests($(el, '.fn').value, $(el, '.ts').value)); return r; };
          $(el, '.sw').replaceWith(seg(PRE.map(p => p[0]), i => { k = i; $(el, '.fn').value = PRE[i][1]; $(el, '.ts').value = PRE[i][3]; run(); }).el);
          $(el, '.go').onclick = run; $(el, '.fx').onclick = () => { $(el, '.fn').value = PRE[k][2]; run(); }; },
        desc:'テストは <code>test("名前", () => { expect(結果).toBe(期待値) })</code> の形で書きます。最初はわざと<b>バグのある関数</b>になっているので、失敗したテストのメッセージ（期待と実際の値）を見て、左のコードを直して ▶ を押してみましょう。全部 ✓ になれば完成です。<b>テストは「仕様」</b>なので、コードが変わっても守られます。',
        prompt:'この関数（貼り付け）の単体テストを Vitest で書いて。正常な値・境界の値（ちょうど・1つ手前・1つ後）・異常な値（空・マイナス・null）を網羅し、テスト名は日本語の仕様の文にして。テストを実行して失敗したものがあれば、関数のバグかテストの間違いかを説明して。',
        code:'// price.test.ts（Vitest）\nimport { describe, test, expect } from "vitest";\nimport { withTax } from "./price";\n\ndescribe("withTax（税込計算）", () => {\n  test("1000円は1100円", () => {\n    expect(withTax(1000)).toBe(1100);\n  });\n  test("15円は16円（切り捨て）", () => {\n    expect(withTax(15)).toBe(16);\n  });\n  test("マイナスはエラー", () => {\n    expect(() => withTax(-1)).toThrow();\n  });\n});\n\n// 実行：npx vitest' },
      { name:'境目を狙う（境界値と同値分割）', en:'Boundary value analysis', h:470, tags:['体験','設計'],
        demo:'<div class="kt"><div class="kt-code">送料：3,000円未満 → 500円 ／ 3,000〜9,999円 → 300円 ／ 10,000円以上 → 無料</div><div class="kt-row"><input type="number" class="kt-in v" value="1500" style="width:100px" aria-label="合計金額"><button type="button" class="kt-btn pri ad">テストに追加</button><button type="button" class="kt-btn sm rs">空にする</button></div><div class="kt-row pr"></div><div class="ts-axis ax"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let cases = [1500]; const MX = 13000, x = (v) => Math.min(100, Math.max(0, v / MX * 100)), BD = [2999, 3000, 9999, 10000];
          $(el, '.pr').innerHTML = [0, 2999, 3000, 5000, 9999, 10000, 12000].map(v => `<button type="button" class="kt-btn sm" data-v="${v}">${v.toLocaleString()}</button>`).join('');
          const run = () => { const cov = [cases.some(v => v < 3000), cases.some(v => v >= 3000 && v < 10000), cases.some(v => v >= 10000)], bd = BD.filter(b => cases.includes(b));
            $(el, '.ax').innerHTML = [[0, 3000, '#d03b3b', 0], [3000, 10000, '#fab219', 1], [10000, MX, '#0ca30c', 2]].map(([a, b, c, i]) => `<span class="seg${cov[i] ? ' cov' : ''}" style="left:${x(a)}%;width:${x(b) - x(a)}%;background:${c}"></span>`).join('') + cases.map(v => `<span class="pt${BD.includes(v) ? ' bd' : ''}" style="left:${x(v)}%" title="${v}"></span>`).join('') + [0, 3000, 10000].map(v => `<span class="lb" style="left:${x(v)}%">${v.toLocaleString()}</span>`).join('');
            const n = cov.filter(Boolean).length; verdict($(el, '.res'), n === 3 && bd.length === 4 ? 'ok' : n === 3 ? 'warn' : 'bad', `テスト：${cases.map(v => `${v.toLocaleString()}円→${SHIP(v)}円`).join('、') || 'なし'}<br>3つの区間のうち <b>${n}つ</b>を確認、境目（2,999 / 3,000 / 9,999 / 10,000）は <b>${bd.length}/4</b>。` + (n === 3 && bd.length === 4 ? ' ✓ 完璧。' : bd.length < 4 ? ' <b>境目</b>の値を足しましょう。「未満」と「以下」の間違いはここでしか見つかりません。' : '')); };
          $$(el, '.pr button').forEach(b => b.onclick = () => { const v = +b.dataset.v; if (!cases.includes(v)) cases.push(v); run(); });
          $(el, '.ad').onclick = () => { const v = +$(el, '.v').value; if (!isNaN(v) && !cases.includes(v)) cases.push(v); run(); }; $(el, '.rs').onclick = () => { cases = []; run(); }; run(); },
        desc:'すべての値を試すことはできないので、<b>同じ扱いになる範囲（同値分割）</b>から1つずつと、<b>範囲の境目（境界値）</b>を選んでテストします。バグは境目に集まります（「以上」と「より大きい」の間違いなど）。2,999円・3,000円のような<b>境目の両側</b>を必ず入れましょう。',
        prompt:'送料の計算関数（3000円未満500円、3000〜9999円300円、1万円以上無料）のテストケースを、同値分割と境界値分析で洗い出して表にして。その上で Vitest の test.each を使って、表のまま書けるテストにして。' },
      { name:'外の世界を偽物に置き換える（モック）', en:'Mocking external APIs', h:440, tags:['体験','モック'],
        demo:'<div class="kt"><label class="kt-row" style="font-size:11.5px"><input type="checkbox" class="mk">天気APIをモック（いつも25℃を返す偽物）にする</label><div class="kt-code" style="white-space:pre">test("25℃なら「半袖で大丈夫」", async () => {\n  expect(await clothesAdvice("東京")).toBe("半袖で大丈夫");\n});</div><div class="kt-row"><button type="button" class="kt-btn pri go">▶ テストを10回実行</button></div><div class="ts-dots dt"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.go').onclick = async () => { const mk = $(el, '.mk').checked, r = rng(Date.now() % 1000 + 3); let pass = 0, html = '';
            for (let i = 0; i < 10; i++){ const fail = !mk && (r() < .12), temp = mk ? 25 : Math.round(10 + r() * 22); const ok = !fail && temp >= 24; if (ok) pass++; html += `<i class="${ok ? '' : 'f'}" title="${fail ? '通信エラー' : temp + '℃'}"></i>`; $(el, '.dt').innerHTML = html; await sleep(70); }
            verdict($(el, '.res'), pass === 10 ? 'ok' : 'bad', mk ? '✓ 偽物（モック）が<b>いつも同じ値</b>を返すので、テストは毎回同じ結果に。速く、ネットにもつながない。' : `❌ ${pass}/10回だけ成功。<b>本物の天気</b>や<b>通信エラー</b>で結果が変わるので、テストが当てになりません（不安定なテスト）。お金のかかるAPIなら料金も発生します。`); }; },
        desc:'天気・決済・AI・メールなど<b>外部のサービス</b>を呼ぶ関数は、そのままテストすると結果が毎回変わり、遅く、料金もかかります。テストのときだけ<b>偽物（モック）</b>に置き換えて、決まった値を返させるのが定番です。Vitest なら <code>vi.mock</code>、APIなら MSW がよく使われます。',
        prompt:'外部APIを呼んでいる関数のテストを書いて。Vitest の vi.mock（または MSW）でAPIを偽物に置き換え、正常な応答・エラー（500）・タイムアウトのそれぞれで関数が正しく振る舞うか確かめて。本物のAPIキーがテストで使われないようにして。' },
      { name:'どこまで確かめた？（カバレッジ）', en:'Code coverage', h:470, tags:['体験','品質'],
        demo:'<div class="kt"><div class="ck kt-row" style="font-size:11.5px;gap:4px 12px"></div><div class="ts-lines ln kt-grow"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const CODE = [['function shipping(total, island) {'], ['  if (total < 0) {'], ['    throw new Error("金額が不正");', [3]], ['  }'], ['  let fee = 500;', [0, 1, 2, 4]], ['  if (total >= 10000) {'], ['    fee = 0;', [0]], ['  } else if (total >= 3000) {'], ['    fee = 300;', [1]], ['  }'], ['  if (island) {'], ['    fee += 1000;', [4]], ['  }'], ['  return fee;', [0, 1, 2, 4]], ['}']];
          const TS = ['12,000円', '5,000円', '1,000円', 'マイナスの金額', '1,000円・離島'];
          $(el, '.ck').innerHTML = TS.map((n, i) => `<label><input type="checkbox" data-i="${i}"${i < 2 ? ' checked' : ''}>テスト：${n}</label>`).join('');
          const run = () => { const on = $$(el, '.ck input').filter(i => i.checked).map(i => +i.dataset.i); let hit = 0, tot = 0;
            $(el, '.ln').innerHTML = CODE.map(([l, by]) => { if (!by) return `<div>${esc(l)}</div>`; tot++; const h = by.some(t => on.includes(t)); if (h) hit++; return `<div class="${h ? 'hit' : 'miss'}">${esc(l)}</div>`; }).join('');
            const pct = Math.round(hit / tot * 100); verdict($(el, '.res'), pct === 100 ? 'ok' : pct >= 70 ? 'warn' : 'bad', `命令のカバレッジ：<b>${pct}%</b>（緑＝実行された、赤＝一度も実行されていない）。<br>赤い行は<b>テストで一度も確かめていない</b>所。ただし<b>100%でも正しいとは限らない</b>（期待値が間違っていれば意味がない）。`); };
          $$(el, '.ck input').forEach(i => i.onchange = run); run(); },
        desc:'<b>カバレッジ</b>は、テストを実行したときに<b>コードのどの行・分岐が実行されたか</b>の割合です。一度も通っていない行（赤）が分かるので、テストの抜けを探すのに便利。ただし数字を上げることが目的になると意味のないテストが増えるので、<b>大事な所が赤くないか</b>を見るのに使いましょう。',
        prompt:'Vitest でカバレッジを計測できるようにして（@vitest/coverage-v8）。レポートを見て、お金の計算・権限チェック・データ削除のファイルで実行されていない行や分岐があれば、そこを確かめるテストを追加して。' },
    ], null, true),
    S('単体テストの用語', [
      T('Vitest / Jest', 'Vitest / Jest', 'JavaScript・TypeScript の定番のテストランナー。Vite を使うなら Vitest が速くて設定が少ない。', null, ['定番']),
      T('describe / test（it）', 'describe / test', 'describe でまとめ、test（it）で1つの確認を書く。'),
      T('toBe と toEqual', 'toBe vs toEqual', 'toBe は「同じもの」（数字・文字）、toEqual は「中身が同じ」（配列・オブジェクト）。', null, ['よくある失敗']),
      T('test.each', 'Parameterized tests', '入力と期待値の表から、同じ形のテストをまとめて作る。境界値のテストに便利。'),
      T('beforeEach / afterEach', 'Setup / teardown', '各テストの前後に毎回行う準備と後片付け。'),
      T('モック・スタブ・スパイ', 'Mock / stub / spy', '偽物に置き換える（モック・スタブ）、呼ばれたかを記録する（スパイ）。'),
      T('MSW', 'Mock Service Worker', 'ネットワークの通信を横取りして偽の応答を返す。APIのモックの定番。'),
      T('フィクスチャ', 'Fixtures', 'テストで使う決まったデータ。ファイルや関数にまとめて使い回す。'),
      T('時刻の固定', 'Fake timers', '「今日」で結果が変わる処理は、テストでは時計を固定する（vi.useFakeTimers）。', null, ['よくある失敗']),
      T('スナップショットテスト', 'Snapshot test', '出力をまるごと保存して、変わったら知らせる。変更を確認せずに更新すると意味がない。'),
      T('カバレッジ', 'Coverage', 'テストで実行された行・分岐の割合。抜けを探す道具で、目標の数字ではない。'),
      T('テストしやすい書き方', 'Testable code', '入力を受け取って結果を返すだけの関数（外の世界に触らない）は、テストが簡単。ロジックを画面やAPIから切り出す。', null, ['コツ']),
    ]),
  ]});

/* ================= 3. E2Eテスト ================= */
const V1 = '<div class="card"><h2>ログイン</h2><input id="email" class="in-3f2a" placeholder="メールアドレス"><input id="pw" type="password" class="in-3f2a" placeholder="パスワード"><button class="btn btn-3f2a" data-testid="login-button">ログイン</button></div>';
const V2 = '<div class="card v2"><div class="hd"><h2>おかえりなさい</h2></div><div class="body"><input id="email" class="field-9c1d" placeholder="メールアドレス"><input id="pw" type="password" class="field-9c1d" placeholder="パスワード"><div class="act"><a href="/forgot">パスワードを忘れた</a><button class="button button--primary" data-testid="login-button">ログインする</button></div></div></div>';
const LOC = [['CSSのクラス名', '.btn-3f2a', (d) => d.querySelector('.btn-3f2a'), 'bad'], ['XPath（場所）', '/html/body/div/button', (d) => d.evaluate('/html/body/div/button', d, null, 9, null).singleNodeValue, 'bad'], ['テキスト', 'text=ログイン', (d) => [...d.querySelectorAll('button, a')].find(e => e.textContent.includes('ログイン')), ''], ['役割と名前（おすすめ）', "getByRole('button', { name: 'ログイン' })", (d) => [...d.querySelectorAll('button, [role=button]')].find(e => (e.getAttribute('aria-label') || e.textContent).includes('ログイン')), 'ok'], ['テスト用ID', "getByTestId('login-button')", (d) => d.querySelector('[data-testid="login-button"]'), 'ok']];

TABS.push({ id:'e2e', label:'E2Eテスト', icon:'🎭',
  intro:'<b>E2E（エンドツーエンド）テスト</b>は、本物のブラウザを自動で操作して、<b>利用者と同じ流れ</b>（ログイン → 商品を選ぶ → 購入）を通しで確かめます。定番は <b>Playwright</b>。壊れにくいテストにする鍵は、<b>要素の探し方（ロケーター）</b>と<b>待ち方</b>です。',
  sections:[
    C('触って理解する', [
      { name:'デザインを変えても壊れない探し方', en:'Resilient locators', h:500, tags:['Playwright','体験','最重要'],
        demo:'<div class="kt"><span class="sw"></span><div class="ts-mock mk" style="max-height:120px;overflow:auto"></div><div class="kt-tblwrap tb kt-grow"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const P = new DOMParser(), d1 = P.parseFromString(`<html><body>${V1}</body></html>`, 'text/html'), d2 = P.parseFromString(`<html><body>${V2}</body></html>`, 'text/html');
          $(el, '.sw').replaceWith(seg(['変更前の画面', 'デザインを変更した後'], i => { $(el, '.mk').innerHTML = (i ? V2 : V1).replace(/<a /, '<a onclick="return false" '); $$(el, '.mk input').forEach(x => x.tabIndex = -1);
            $(el, '.tb').innerHTML = `<table class="kt-tbl"><tr><th>探し方</th><th>書き方</th><th>前</th><th>後</th></tr>${LOC.map(([n, code, f, c]) => { const a = !!f(d1), b = !!f(d2); return `<tr class="${i ? (b ? 'ok' : 'bad') : ''}"><td>${n}</td><td style="font-family:var(--mono);font-size:10.5px">${esc(code)}</td><td>${a ? '✓' : '×'}</td><td>${i ? (b ? '✓' : '× 見つからない') : '—'}</td></tr>`; }).join('')}</table>`;
            verdict($(el, '.res'), i ? 'warn' : '', i ? 'クラス名と XPath（場所）は<b>デザインの変更で壊れました</b>。<b>役割と名前</b>（利用者に見えている情報）や<b>テスト用ID</b>で探すと、見た目が変わっても動き続けます。役割で見つからない部品は、アクセシビリティにも問題があるサイン。' : '今はどの探し方でも見つかります。「デザインを変更した後」を押してみましょう。'); }).el); },
        desc:'E2Eテストで一番多い失敗は「<b>デザインを少し変えただけでテストが全部壊れる</b>」こと。原因は、クラス名や場所（XPath）で要素を探していることです。Playwright では<b>「ボタンで、名前がログイン」</b>のように、利用者に見えている情報で探す <code>getByRole</code> が推奨されています。',
        prompt:'このE2Eテストで CSS のクラス名や XPath で要素を探している箇所を、Playwright の getByRole・getByLabel・getByText（必要なら getByTestId）に書き換えて。役割で見つけられない部品があれば、アクセシビリティの改善（ラベルの追加など）も提案して。',
        code:'import { test, expect } from "@playwright/test";\n\ntest("ログインしてマイページが表示される", async ({ page }) => {\n  await page.goto("/login");\n  await page.getByLabel("メールアドレス").fill("test@example.com");\n  await page.getByLabel("パスワード").fill(process.env.TEST_PASSWORD!);\n  await page.getByRole("button", { name: "ログイン" }).click();\n  await expect(page.getByRole("heading", { name: "マイページ" })).toBeVisible();\n});' },
      { name:'待ち方で結果が変わる', en:'Auto-waiting vs sleep', h:450, tags:['Playwright','体験','よくある失敗'],
        demo:'<div class="kt"><span class="sw"></span><div class="kt-row"><button type="button" class="kt-btn pri go">▶ 10回実行</button></div><div class="ts-dots dt"></div><div class="kt-verdict res kt-grow"></div></div>',
        init:(el) => { let k = 0; $(el, '.sw').replaceWith(seg(['1秒待ってからクリック（sleep）', '現れるまで自動で待つ'], i => { k = i; $(el, '.dt').innerHTML = ''; verdict($(el, '.res'), '', '「検索結果」が表示されるまで、通信によって 0.3〜1.5秒かかるページです。'); }).el);
          $(el, '.go').onclick = async () => { let pass = 0, time = 0, html = ''; const r = rng(Date.now() % 997 + 1);
            for (let n = 0; n < 10; n++){ const appear = 300 + r() * 1200, ok = k ? true : appear <= 1000; if (ok) pass++; time += k ? appear : 1000; html += `<i class="${ok ? '' : 'f'}" title="${Math.round(appear)}ms"></i>`; $(el, '.dt').innerHTML = html; await sleep(60); }
            verdict($(el, '.res'), pass === 10 ? 'ok' : 'bad', k ? `✓ 10回とも成功。平均 <b>${Math.round(time / 10)}ms</b>。Playwright の操作と <code>expect</code> は、<b>要素が現れて押せる状態になるまで自動で待つ</b>ので、sleep は不要です。` : `❌ ${pass}/10回成功。表示が1秒より遅いと失敗し、速いときも<b>無駄に1秒待つ</b>。通ったり落ちたりする<b>不安定なテスト（flaky）</b>の典型です。`); }; },
        desc:'E2Eテストで「<b>1秒待ってからクリック</b>」のように時間で待つと、遅いときは失敗し、速いときは無駄に待ちます。Playwright は<b>要素が表示されて操作できるようになるまで自動で待つ</b>ので、<code>waitForTimeout</code>（sleep）は基本的に使いません。待つなら「〜が表示されるまで」と<b>条件</b>で待ちます。',
        prompt:'このPlaywrightのテストにある waitForTimeout（固定の待ち時間）を全部なくして、「要素が表示されるまで」「通信が終わるまで（waitForResponse）」「URLが変わるまで」など条件で待つ形に書き換えて。不安定なテストがなくなったか、--repeat-each=10 で確認して。' },
      { name:'E2Eテストの作り方', en:'Writing an E2E scenario', h:460, tags:['Playwright','流れ'],
        init:(el) => stepper(el, ['<b>守りたい流れを決める</b><br>会員登録・ログイン・購入・予約など、<b>壊れたら一番困る流れ</b>を3〜5本。全部をE2Eにしない。', '<b>テスト用のデータと環境</b><br>テスト専用のアカウント・DB・決済のテストモード。本番のデータを触らない。', '<b>操作を記録して下書き</b><br><code>npx playwright codegen</code> でブラウザを操作すると、コードが自動で書かれる。', '<b>探し方と確認を直す</b><br>getByRole に整え、「画面に◯◯が表示される」の <code>expect</code> を足す。', '<b>ログインは1回だけ</b><br>ログイン済みの状態（storageState）を保存して使い回すと速い。', '<b>失敗したら記録を見る</b><br>トレースビューアで、失敗した瞬間のスクショ・通信・操作を再生できる。', '<b>CIで毎回実行</b><br>変更のたびに自動で実行（「CIと自動化」タブ）。'], { title:'E2Eテストを入れる手順' }),
        desc:'E2Eテストは遅く手間もかかるので、<b>壊れたら一番困る流れ</b>（登録・ログイン・購入）に絞ります。Playwright の <b>codegen</b> でブラウザを操作すればコードの下書きができ、失敗したときは<b>トレースビューア</b>で、その瞬間の画面と通信を再生して原因を探せます。',
        prompt:'このECサイトに Playwright を入れて、①会員登録 ②ログイン ③商品をカートに入れてテスト用カードで購入、の3本のE2Eテストを書いて。ログイン状態は storageState で使い回し、テスト用のDBを毎回初期化、失敗時はトレースとスクショを保存する設定にして。' },
    ], null, true),
    { title:'E2Eテストの道具', note:'迷ったら <b>Playwright</b>。Chrome・Firefox・Safari（WebKit）をまとめて動かせ、記録・トレース・並列実行まで揃っています。',
      table:{ head:['道具', '特徴'], rows:[['Playwright', 'Microsoft 製。主要ブラウザ対応・自動で待つ・codegen・トレースビューア・並列実行。<b>今の定番</b>'], ['Cypress', '画面を見ながらテストを書ける。開発体験が良い'], ['Selenium', '昔からの定番。多くの言語に対応'], ['Testing Library', 'E2Eではなく部品のテスト。getByRole の考え方は同じ'], ['Storybook ＋ テスト', '部品ごとの見た目と操作をテスト'], ['Maestro / Detox', 'スマホアプリのE2Eテスト']] } },
    S('E2Eテストの用語', [
      T('Playwright', 'Playwright', '本物のブラウザを自動操作してテストする道具。', null, ['定番']),
      T('ロケーター', 'Locator', '要素の探し方。getByRole・getByLabel・getByText・getByTestId。'),
      T('getByRole', 'getByRole', '「ボタンで、名前がログイン」のように役割と名前で探す。見た目の変更に強い。', null, ['おすすめ']),
      T('data-testid', 'Test IDs', 'テスト用に付ける目印の属性。役割で探せないときの最後の手段。'),
      T('自動待機', 'Auto-waiting', '要素が操作できるまで自動で待つ仕組み。固定の sleep は使わない。'),
      T('不安定なテスト（flaky）', 'Flaky test', '同じコードなのに通ったり落ちたりするテスト。信頼をなくすので、見つけたらすぐ直す。', null, ['よくある失敗']),
      T('codegen', 'Codegen', 'ブラウザを操作すると、テストのコードを自動で書いてくれる機能。'),
      T('トレースビューア', 'Trace viewer', '失敗したテストを、スクショ・通信・操作の記録で再生できる。'),
      T('storageState', 'Auth state reuse', 'ログイン済みの状態を保存して、各テストで使い回す。'),
      T('ヘッドレス', 'Headless', '画面を表示せずにブラウザを動かす。CIではこちら。'),
      T('テストデータの初期化', 'Test data reset', 'テストのたびにDBを決まった状態に戻す。前のテストの結果に左右されないように。'),
    ]),
  ]});

/* ================= 4. アクセシビリティ ================= */
const lum = (hex) => { const n = parseInt(hex.slice(1), 16), c = [n >> 16 & 255, n >> 8 & 255, n & 255].map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
const SNIP = '<h1>お問い合わせ</h1>\n<img src="map.png">\n<h3>入力フォーム</h3>\n<input type="text" placeholder="お名前">\n<label for="mail">メール</label>\n<input id="mail" type="email">\n<button><svg viewBox="0 0 10 10"></svg></button>\n<a href="/privacy">こちら</a>';
function axeLite(html){
  const d = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html'), out = [];
  d.querySelectorAll('img').forEach(i => { if (!i.hasAttribute('alt')) out.push(['画像に代替テキスト（alt）がない', `<img src="${i.getAttribute('src')}">`, '内容を表す alt を付ける。飾りなら alt=""']); });
  d.querySelectorAll('input, select, textarea').forEach(i => { const id = i.id, lab = id && d.querySelector(`label[for="${id}"]`); if (!lab && !i.closest('label') && !i.getAttribute('aria-label') && !i.getAttribute('aria-labelledby')) out.push(['入力欄にラベルがない', i.outerHTML, '&lt;label for&gt; を付ける（placeholder はラベルの代わりにならない）']); });
  d.querySelectorAll('button, a').forEach(b => { if (!b.textContent.trim() && !b.getAttribute('aria-label')) out.push([`${b.tagName === 'A' ? 'リンク' : 'ボタン'}に名前がない`, b.outerHTML.slice(0, 60), '見える文字か aria-label を付ける（アイコンだけのボタンに多い）']); else if (b.tagName === 'A' && /^(こちら|ここ|詳細|click here)$/i.test(b.textContent.trim())) out.push(['リンクの文字が「こちら」だけ', b.outerHTML, '「プライバシーポリシー」のように行き先が分かる文字に']); });
  let last = 0; d.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(h => { const lv = +h.tagName[1]; if (last && lv > last + 1) out.push([`見出しのレベルが飛んでいる（h${last} → h${lv}）`, h.outerHTML, '順番に（h1 → h2 → h3）']); last = lv; });
  return out;
}

TABS.push({ id:'a11y', label:'アクセシビリティ', icon:'♿',
  intro:'<b>アクセシビリティ</b>は、目が見えにくい人・キーボードだけで操作する人・色の見分けが難しい人も含めて、<b>誰でも使えるか</b>ということ。文字のコントラスト・キーボード操作・画像の代替テキスト・入力欄のラベルなどは、<b>自動のチェック</b>でかなり見つけられます。',
  sections:[
    C('触って理解する', [
      { name:'文字のコントラストを測る', en:'Contrast checker', h:460, tags:['体験','色','定番'],
        demo:'<div class="kt"><div class="kt-row" style="font-size:11.5px"><label>文字色 <input type="color" class="fg" value="#8a8a8a"></label><label>背景色 <input type="color" class="bg" value="#ffffff"></label><span class="sw"></span></div><div class="ts-sample sp"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let big = 0; const run = () => { const f = $(el, '.fg').value, b = $(el, '.bg').value, r = ratio(f, b), aa = big ? 3 : 4.5, aaa = big ? 4.5 : 7;
            $(el, '.sp').style.cssText = `background:${b};color:${f}`; $(el, '.sp').innerHTML = `<div style="font-size:${big ? 22 : 14}px;font-weight:${big ? 700 : 400}">予約は前日の18時までです</div>`;
            verdict($(el, '.res'), r >= aa ? 'ok' : 'bad', `コントラスト比 <b>${r.toFixed(2)} : 1</b>　<span class="kt-badge ${r >= aa ? 'ok' : 'bad'}">AA ${r >= aa ? '合格' : '不合格'}（${aa}以上）</span> <span class="kt-badge ${r >= aaa ? 'ok' : 'warn'}">AAA ${r >= aaa ? '合格' : '未達'}（${aaa}以上）</span><br>${big ? '大きい文字（18pt以上、または14pt以上の太字）' : '普通の文字'}の基準。ボタンの枠や入力欄の線など<b>文字以外の部品は3:1以上</b>。`); };
          $(el, '.sw').replaceWith(seg(['普通の文字', '大きい文字'], i => { big = i; run(); }).el); $$(el, 'input[type=color]').forEach(i => i.oninput = run); },
        desc:'文字と背景の明るさの差を<b>コントラスト比</b>で測ります。国際的な基準（WCAG）の <b>AA</b> は、普通の文字で <b>4.5:1</b> 以上、大きい文字で 3:1 以上。薄い灰色の文字はおしゃれに見えても、屋外のスマホや目の疲れた人には読めません。',
        prompt:'このサイトの配色で、文字と背景のコントラスト比が WCAG AA（4.5:1、大きい文字は3:1）を満たしていない箇所をすべて探して、デザインの雰囲気を保ったまま基準を満たす色に直して。ダークモードの配色も同じく確認して。' },
      { name:'キーボードだけで操作できる？', en:'Keyboard navigation', h:470, tags:['体験','操作'],
        demo:'<div class="kt"><span class="sw"></span><div class="ts-mock mk kt-grow"></div><div class="kt-row"><button type="button" class="kt-btn pri tab">Tab キーを押す</button><span class="kt-lbl ps"></span></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let mode = 0, idx = -1; const BAD = '<div style="display:flex;gap:8px;align-items:center;margin-bottom:8px"><span data-f="0" style="cursor:pointer">🏠 ホーム</span><span style="cursor:pointer">📦 商品</span><span style="cursor:pointer">🛒 カート</span></div><input data-f="1" placeholder="お名前" tabindex="3"><input data-f="2" placeholder="メール" tabindex="1"><div style="display:inline-block;padding:5px 12px;border-radius:6px;background:var(--accent);color:#fff;cursor:pointer">送信</div>', GOOD = '<nav style="display:flex;gap:8px;margin-bottom:8px"><a href="#" data-f="0" onclick="return false">ホーム</a><a href="#" data-f="1" onclick="return false">商品</a><a href="#" data-f="2" onclick="return false">カート</a></nav><input data-f="3" placeholder="お名前"><input data-f="4" placeholder="メール"><button data-f="5">送信</button>';
          const ORDER = { 0:[2, 1], 1:[0, 1, 2, 3, 4, 5] };
          const draw = () => { $(el, '.mk').innerHTML = mode ? GOOD : BAD; $$(el, '.mk input, .mk button, .mk a').forEach(x => x.tabIndex = -1); const ord = ORDER[mode], cur = idx >= 0 ? ord[idx % ord.length] : null;
            if (cur != null){ const t = $(el, `.mk [data-f="${cur}"]`); if (t){ if (mode) t.classList.add('ring'); const mr = $(el, '.mk').getBoundingClientRect(), r = t.getBoundingClientRect(); $(el, '.mk').insertAdjacentHTML('beforeend', `<span class="ord" style="left:${r.left - mr.left}px;top:${r.top - mr.top}px">${idx % ord.length + 1}</span>`); } }
            $(el, '.ps').textContent = idx < 0 ? '' : `${idx + 1}回目`; };
          $(el, '.sw').replaceWith(seg(['悪い例', '良い例'], i => { mode = i; idx = -1; draw(); verdict($(el, '.res'), '', 'Tab キーで、フォーカス（操作の対象）がどう移るか見てみましょう。'); }).el);
          $(el, '.tab').onclick = () => { idx++; draw(); verdict($(el, '.res'), mode ? 'ok' : 'bad', mode ? '✓ 上から順に、<b>すべての操作できる部品</b>に移動し、どこにいるか<b>枠で見える</b>。' : '❌ メニューと送信ボタンが <code>&lt;div&gt;</code>・<code>&lt;span&gt;</code> で作られていて<b>Tabで止まらない</b>。tabindex の数字で順番がばらばら（メール→名前）。フォーカスの枠も消されていて<b>どこにいるか分からない</b>。'); }; draw(); },
        desc:'マウスが使えない人は、<b>Tab キー</b>で部品を移動して Enter で押します。ボタンを <code>&lt;div&gt;</code> で作る・tabindex に数字を入れて順番を変える・フォーカスの枠を消す（outline: none）と、キーボードでは使えなくなります。<b>本物の &lt;button&gt;・&lt;a&gt;</b> を使うのが一番の近道です。',
        prompt:'このサイトをキーボードだけで操作できるか確認して直して。div や span で作ったボタンは button に、Tab の順番は見た目の順に（正の tabindex は削除）、フォーカスの枠は見えるように（:focus-visible）、モーダルを開いたらフォーカスを中に閉じ込めて Esc で閉じられるようにして。' },
      { name:'自動チェック（axe 風）', en:'Automated a11y checks', h:500, tags:['体験','自動化'], wide:true,
        demo:'<div class="kt"><div class="ts-two"><div><span class="kt-lbl">HTML（書き換えて直してみる）</span><textarea class="kt-in ts-code sn" spellcheck="false" aria-label="HTML"></textarea></div><div><span class="kt-lbl">見つかった問題</span><div class="ts-res rs" style="flex:1"></div></div></div></div>',
        init:(el) => { $(el, '.sn').value = SNIP; const run = () => { const v = axeLite($(el, '.sn').value); $(el, '.rs').innerHTML = v.length ? `<span class="ts-sum"><span class="f">${v.length}件の問題</span></span>` + v.map(([t, code, fix]) => `<div class="bad"><b>×</b><span>${t}<small>${esc(code)}</small><small style="color:var(--ok)">→ ${fix}</small></span></div>`).join('') : '<span class="ts-sum"><span class="p">✓ 問題は見つかりませんでした</span></span>'; };
          let tm; $(el, '.sn').oninput = () => { clearTimeout(tm); tm = setTimeout(run, 250); }; run(); },
        desc:'画像の代替テキスト・入力欄のラベル・名前のないボタン・見出しの順番などは、<b>自動のチェック</b>で見つけられます。左のHTMLを直すと、右の問題が消えていきます。実際には <b>axe</b>（ブラウザ拡張・Playwright と組み合わせ）や <b>Lighthouse</b> で、サイト全体をまとめてチェックできます。',
        prompt:'Playwright と @axe-core/playwright で、主要なページ（トップ・商品一覧・商品詳細・カート・ログイン）のアクセシビリティを自動チェックするテストを書いて。違反が見つかったらテストを失敗させ、どの要素が何の問題かを分かりやすく表示して。' },
    ], null, true),
    S('アクセシビリティの用語', [
      T('WCAG', 'Web Content Accessibility Guidelines', 'Webのアクセシビリティの国際的な基準。A・AA・AAA の3段階。日本の JIS X 8341-3 も同じ内容。'),
      T('コントラスト比', 'Contrast ratio', '文字と背景の明るさの差。AAは普通の文字で4.5:1以上。'),
      T('代替テキスト（alt）', 'Alt text', '画像の内容を文字で説明する。スクリーンリーダーが読み上げる。飾りの画像は alt=""。', null, ['基本']),
      T('ラベル', 'Labels', '入力欄の名前。&lt;label for&gt; で結びつける。placeholder はラベルの代わりにならない。'),
      T('アクセシブルな名前', 'Accessible name', 'スクリーンリーダーが読み上げる部品の名前。見える文字・aria-label・label で決まる。'),
      T('フォーカス', 'Focus', 'キーボードで操作する対象。見えるように枠（:focus-visible）を出す。'),
      T('スクリーンリーダー', 'Screen reader', '画面を読み上げるソフト。iPhone・Mac の VoiceOver、Windows の NVDA・ナレーター。'),
      T('ARIA', 'WAI-ARIA', '役割や状態を補う属性（aria-label・aria-expanded など）。<b>本物のHTML要素で済むならARIAは使わない</b>。', null, ['注意']),
      T('axe', 'axe-core', 'アクセシビリティの自動チェックの定番エンジン。ブラウザ拡張・テストに組み込める。'),
      T('Lighthouse', 'Lighthouse', 'Chrome に入っている、速さ・アクセシビリティ・SEO の診断ツール。'),
      T('自動チェックの限界', 'Limits of automation', '自動で見つかるのは問題の一部。実際にキーボードとスクリーンリーダーで触ってみるのが確実。'),
    ]),
  ]});
})();
