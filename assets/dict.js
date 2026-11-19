/* =========================================================
   Vibe Coding 辞典 — 共通スクリプト
   使い方: 各ページで VD.render({ ...辞典データ... }) を呼ぶ。

   辞典データの形:
   {
     id, title, en, icon, accent, lead,
     howto: [[見出し, 説明], ...]           // 任意
     tabs: [{
       id, label, intro,
       sections: [{
         title, note, layout: 'cards' | 'cards lg' | 'rows',
         custom: (el) => {},                  // 任意: 自由なHTMLを描画
         table: { head:[...], rows:[[...]] }, // 任意: 表
         items: [{
           name, en, desc, tags:[...],
           demo: 'HTML', init: (el) => cleanupFn, h: 170, stage: 'free', hint, replay:false, wide,
           prompt: '文字列' | ['複数'], code: '...', codeLabel,
           meta: [[ラベル, 値], ...], url, links:[[文字, URL]],
           try: { url, image, imageFrom: (json)=>url, label }
         }]
       }]
     }]
   }
   ========================================================= */
(function(){
'use strict';

/* ---- テーマ（ページ描画前に適用してちらつきを防ぐ） ---- */
const THEME_KEY = 'vd-theme';
try{
  const t = localStorage.getItem(THEME_KEY);
  if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
}catch(e){}

/* ---- 辞典の一覧（ポータル・メニュー共通） ---- */
const GROUPS = ['デザイン', 'メディア', '開発', 'AIとの対話', '公開・素材'];
const DICTS = [
  { file:'web-design.html',       icon:'✦', group:'デザイン',   accent:'#6d4cff', title:'Webデザイン・アニメーション辞典', short:'Webデザイン・アニメ', desc:'デザインスタイル、CSSアニメーション、ホバー、スクロール演出、テキスト・背景エフェクト、イージングを実際に動かして確認。' },
  { file:'motion.html',           icon:'◉', group:'デザイン',   accent:'#c026d3', title:'モーション・インタラクション辞典', short:'モーション・操作感', desc:'押す・切り替える・現れる・スクロールするときの動き。Xで話題の演出、CSS／JSで作る遊び心のあるおもちゃ、気持ちよく見せる調整のコツまで触って確認。' },
  { file:'ui-components.html',    icon:'▣', group:'デザイン',   accent:'#0f8b8d', title:'UIコンポーネント辞典', short:'UIコンポーネント', desc:'ボタン、フォーム、ナビ、モーダル、トースト、テーブル…画面部品の正式名称と動く見本。' },
  { file:'color-typography.html', icon:'◐', group:'デザイン',   accent:'#e2562b', title:'配色・タイポグラフィ辞典', short:'配色・フォント', desc:'配色理論、雰囲気別パレット、グラデーション、日本語/欧文フォント、余白・影・角丸のスケール。' },
  { file:'ux-writing.html',       icon:'✎', group:'デザイン',   accent:'#db2777', title:'UXライティング辞典', short:'UXライティング', desc:'ボタン・ラベル・エラー・空の状態・通知の文言、トーンと敬語、日本語の表記ゆれチェッカー、多言語化、AIへの文言の頼み方。' },
  { file:'motion-math.html',      icon:'∿', group:'デザイン',   accent:'#65a30d', title:'動きの計算辞典（数学・物理）', short:'動きの計算', desc:'座標とベクトル、lerpとイージング、重力と積分、ばね、波とノイズ、当たり判定、ベジェ曲線と等速移動、スクロール・FLIP・慣性などUIの計算。点をドラッグして式を確かめる。' },
  { file:'dataviz.html',          icon:'▥', group:'デザイン',   accent:'#2a78d6', title:'グラフ・データ可視化辞典', short:'グラフ・データ可視化', desc:'目的別のグラフの選び方、基本のグラフ、2軸・虹色などの失敗と直し方、操作できるグラフ、ダッシュボードとKPI、データの準備、ライブラリ、地図。' },
  { file:'video.html',            icon:'▶', group:'メディア',   accent:'#e0364f', title:'動画制作辞典', short:'動画制作', desc:'ショットサイズ、カメラワーク、トランジション、カラーグレーディング、テロップ、仕様、FFmpeg・AI動画プロンプト。' },
  { file:'sound.html',            icon:'♪', group:'メディア',   accent:'#c2410c', title:'サウンド・効果音辞典', short:'サウンド・効果音', desc:'その場で鳴らせる効果音・波形・和音・音階・BPM、BGMジャンル語彙、音響用語、Web Audioの実装。' },
  { file:'game-dev.html',         icon:'◆', group:'メディア',   accent:'#2f9e44', title:'ゲーム制作辞典', short:'ゲーム制作', desc:'ジャンル、メカニクス、手触り演出（ジュース）、物理・当たり判定をCanvasで動かして確認。' },
  { file:'image-prompts.html',    icon:'◩', group:'メディア',   accent:'#0ea5e9', title:'画像・イラスト表現辞典（画像生成プロンプト語彙）', short:'画像・イラスト表現', desc:'旧PDF「Qwen-Image-2.1 プロンプト語彙辞典」をHTML化。人物・背景・光・カメラ・画風・文字・編集など約1,400語＋組み立て機・ライティングや構図の見本。' },
  { file:'3d.html',               icon:'⬢', group:'メディア',   accent:'#7c3aed', title:'3D・WebGL・シェーダー辞典', short:'3D・WebGL・シェーダー', desc:'シーン・カメラ・ライト、PBRの質感、光と影、カメラ操作とクリック判定、シェーダーの遊び場、3Dモデルの軽量化、性能、商品ビューア。three.jsで実際に動かして確認。' },
  { file:'data-analysis.html',    icon:'∑', group:'開発',       accent:'#a16207', title:'データ分析・統計の基本辞典', short:'データ分析・統計', desc:'分析の流れ、平均と中央値・ばらつき、分布、相関と因果の取り違え、標本と誤差、A/Bテストとp値、データの前処理、スプレッドシート・pandas・SQLの早見表。数字を動かして確かめる。' },
  { file:'free-api.html',         icon:'⇄', group:'開発',       accent:'#1d6fe0', title:'無料API辞典', short:'無料API', desc:'キー不要・無料枠ありのWeb APIと、ブラウザに最初から入っているAPI。その場で呼び出して中身を確認。' },
  { file:'tech-stack.html',       icon:'⚙', group:'開発',       accent:'#475569', title:'技術スタック・ライブラリ辞典', short:'技術スタック', desc:'フロント・バック・DB・ホスティング・グラフ・3D・便利ライブラリの用途と導入コマンド。' },
  { file:'ai-tools.html',         icon:'✧', group:'開発',       accent:'#9333ea', title:'AIツール・モデル辞典', short:'AIツール', desc:'コーディングAI、LLM、画像・動画・音声生成AI、ローカルAI、AI機能の組み込み方。' },
  { file:'security.html',         icon:'⚿', group:'開発',       accent:'#be123c', title:'セキュリティ・認証辞典', short:'セキュリティ・認証', desc:'APIキーの置き場所、ログイン・権限の仕組み、XSS・SQLインジェクションなどの攻撃と対策をその場で再現。AIコードの危険パターンと公開前チェック付き。' },
  { file:'database.html',         icon:'⛁', group:'開発',       accent:'#4f46e5', title:'データベース・データ設計辞典', short:'データベース・設計', desc:'テーブル設計・ER図、ブラウザで実行できるSQL、インデックスとN+1、トランザクションと同時更新、型・日付・お金の落とし穴。' },
  { file:'git-terminal.html',     icon:'⑂', group:'開発',       accent:'#e8590c', title:'Git・ターミナル・開発環境辞典', short:'Git・ターミナル', desc:'Gitの仕組みと元に戻す逆引き、ブランチのシミュレーター、練習用ターミナル、パッケージ・環境変数・ポートの仕組み。' },
  { file:'start.html',            icon:'🔰', group:'AIとの対話', accent:'#16a34a', title:'はじめてガイド', short:'はじめてガイド', desc:'はじめての人の入口。バイブコーディングの流れ、作りたいもの別の読む順番、最初の1時間と指示文メーカー、まず覚える言葉、つまずいたときの対処、辞典の地図。' },
  { file:'ai-basics.html',        icon:'🧠', group:'AIとの対話', accent:'#0077b6', title:'AI・機械学習のしくみ辞典', short:'AI・機械学習のしくみ', desc:'AIの全体の地図、データから学ぶしくみ、分類とグループ分け、成績の測り方、ニューラルネット、LLMが文章を作るしくみ、画像生成、限界と付き合い方。小さなAIをその場で学習させて確かめる。' },
  { file:'ai-workflow.html',      icon:'▤', group:'AIとの対話', accent:'#0d9488', title:'要件定義・AI開発の進め方辞典', short:'要件定義・AI開発の進め方', desc:'1枚企画書・要件・画面設計・タスク分解、AIとの開発サイクル、CLAUDE.md とエージェントの使いこなし、テスト、テンプレート集。' },
  { file:'automation.html',       icon:'⟳', group:'開発',       accent:'#059669', title:'自動化・Bot辞典', short:'自動化・Bot', desc:'トリガーとアクション、Google Apps Script、ノーコード自動化、Webhookの署名と二重処理、cronとタイムゾーン、LINE・Slack・DiscordのBot、スクレイピングのルール、AI×自動化。' },
  { file:'payments.html',         icon:'¥', group:'開発',       accent:'#b45309', title:'決済・収益化辞典', short:'決済・収益化', desc:'収益モデルとサブスクの数字、料金表と総額表示、Stripeの決済とWebhook、サブスクの状態管理、特商法・景表法・資金決済法・インボイス、カード情報の非保持化と3Dセキュア、広告。' },
  { file:'ai-integration.html',   icon:'◈', group:'開発',       accent:'#0891b2', title:'AI組み込み辞典（LLMアプリ開発）', short:'AI組み込み（LLM）', desc:'トークン、APIの呼び方、構造化出力、ツールとエージェント、RAG、料金計算とプロンプトキャッシュ、評価と安全、AI機能のUX。' },
  { file:'prompts.html',          icon:'❝', group:'AIとの対話', accent:'#d97706', title:'バイブコーディング指示文辞典', short:'指示文テンプレ', desc:'作成依頼・修正依頼・デバッグ・デザイン指示・品質要求の伝え方テンプレート集。' },
  { file:'code-reading.html',     icon:'📖', group:'AIとの対話', accent:'#5b21b6', title:'コードの読み方辞典', short:'コードの読み方', desc:'AIが書いたコードを自分で読むための辞典。読み方のコツ、変数と型、条件とくり返し、関数とスコープ、配列・JSON、非同期、言語の見分け方、AIのコードの確認ポイント。1行ずつ実行して変数の中身を見る。' },
  { file:'errors.html',           icon:'⚠', group:'AIとの対話', accent:'#dc2626', title:'エラー・トラブル辞典', short:'エラー対処', desc:'よく出るエラーの意味と原因、AIへの伝え方。HTTPステータスコード一覧付き。' },
  { file:'glossary.html',         icon:'≡', group:'AIとの対話', accent:'#0369a1', title:'開発用語辞典', short:'開発用語', desc:'非エンジニアがAIと会話するための基本用語。Web・データ・Git・インフラ・AI用語。' },
  { file:'release.html',          icon:'✓', group:'公開・素材', accent:'#15803d', title:'公開・品質チェック辞典', short:'公開チェック', desc:'SEO・OGP・パフォーマンス・セキュリティ・アクセシビリティ・法務。チェックを付けながら確認。' },
  { file:'licenses.html',         icon:'©', group:'公開・素材', accent:'#1e3a8a', title:'著作権・ライセンス・AIのルール辞典', short:'著作権・ライセンス', desc:'著作物と保護期間、引用の条件、OSSライセンスの義務、自分の作品へのライセンスの付け方、素材・フォント・音楽の規約、生成AIと著作権、個人情報・肖像・商標、公開前チェックと困ったときの相談先。' },
  { file:'testing.html',          icon:'☑', group:'公開・素材', accent:'#4d7c0f', title:'テスト・品質辞典', short:'テスト・品質', desc:'テストの種類と書き方、ページ内で動くミニテストランナー、境界値・モック・カバレッジ、PlaywrightのE2E、アクセシビリティと表示速度、見た目のテスト、CI、AIが書きがちな悪いテスト。' },
  { file:'app-distribution.html', icon:'▯', group:'公開・素材', accent:'#0284c7', title:'スマホアプリ・配布形態辞典', short:'アプリ・配布形態', desc:'Web・PWA・スマホアプリ・デスクトップ・ブラウザ拡張・LINEミニアプリの選び方、許可の聞き方、ストア審査と日本の手数料、段階的公開と更新。' },
  { file:'resources.html',        icon:'❖', group:'公開・素材', accent:'#be185d', title:'無料素材・リソース辞典', short:'無料素材', desc:'アイコン、イラスト、写真、動画、音源、フォント、3D、ゲーム素材、デザインツールの入手先。' },
];
const EXTRA = [
];

/* ---- helpers ---- */
function h(tag, attrs){
  const el = document.createElement(tag);
  if (attrs) for (const k in attrs){
    const v = attrs[k];
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'text') el.textContent = v;
    else if (k.slice(0,2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (let i = 2; i < arguments.length; i++) append(el, arguments[i]);
  return el;
}
function append(el, c){
  if (c == null || c === false) return;
  if (Array.isArray(c)) { c.forEach(x => append(el, x)); return; }
  el.append(c.nodeType ? c : document.createTextNode(String(c)));
}
const strip = s => String(s == null ? '' : s).replace(/<[^>]+>/g, ' ');
const norm = s => strip(s).toLowerCase().normalize('NFKC');

let toastEl, toastTimer;
function toast(msg){
  if (!toastEl){ toastEl = h('div', { class:'toast', role:'status' }); document.body.append(toastEl); }
  toastEl.textContent = msg; toastEl.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1400);
}
async function copyText(text){
  let ok = false;
  try{ await navigator.clipboard.writeText(text); ok = true; }catch(e){}
  if (!ok){
    const ta = h('textarea', { style:'position:fixed;opacity:0;top:0;left:0' });
    ta.value = text; document.body.append(ta); ta.select();
    try{ ok = document.execCommand('copy'); }catch(e){}
    ta.remove();
  }
  toast(ok ? 'コピーしました' : 'コピーできませんでした');
}
function copyBtn(getText, label){
  return h('button', { class:'copy', type:'button', onclick:(e) => { e.stopPropagation(); e.preventDefault(); copyText(typeof getText === 'function' ? getText() : getText); } }, label || 'コピー');
}
function codeBlock(code, label){
  return h('details', { class:'code' },
    h('summary', null, h('span', { class:'lbl' }, label || 'コード'), copyBtn(code)),
    h('pre', null, h('code', { text:code })));
}

/* ---- テーマ切替・メニュー ---- */
function currentTheme(){
  const t = document.documentElement.getAttribute('data-theme');
  if (t) return t;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function toggleTheme(){
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try{ localStorage.setItem(THEME_KEY, next); }catch(e){}
}
function topbar(opts){
  const here = location.pathname.split('/').pop() || 'index.html';
  const pop = h('div', { class:'dict-pop', role:'menu' });
  pop.append(h('a', { href:'index.html', class: here === 'index.html' ? 'cur' : null }, h('span', { class:'ic' }, '⌂'), '辞典トップ（ポータル）'));
  GROUPS.forEach(g => {
    pop.append(h('div', { class:'grp' }, g));
    DICTS.concat(EXTRA).filter(d => d.group === g).forEach(d => {
      pop.append(h('a', { href:d.file, class: d.file === here ? 'cur' : null, target: d.external ? '_blank' : null }, h('span', { class:'ic' }, d.icon), d.short));
    });
  });
  const menu = h('div', { class:'dict-menu' },
    h('button', { type:'button', 'aria-haspopup':'true', onclick:(e) => { e.stopPropagation(); menu.classList.toggle('open'); } }, '辞典一覧 ▾'), pop);
  document.addEventListener('click', (e) => { if (!menu.contains(e.target)) menu.classList.remove('open'); });
  const input = h('input', { type:'search', placeholder: opts.searchPlaceholder || 'この辞典内を検索（/ キー）', 'aria-label':'辞典内を検索' });
  const bar = h('header', { class:'topbar' },
    h('div', { class:'wrap' },
      h('a', { class:'brand', href:'index.html' }, h('span', { class:'brand-mark' }, 'VC'), h('span', { class:'brand-text' }, 'Vibe Coding 辞典')),
      menu,
      h('div', { class:'search' }, input),
      h('button', { class:'icon-btn', type:'button', title:'ライト／ダーク切替', 'aria-label':'ライト／ダーク切替', onclick:toggleTheme }, '◐')));
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA'){ e.preventDefault(); input.focus(); }
    if (e.key === 'Escape' && document.activeElement === input){ input.value = ''; input.dispatchEvent(new Event('input')); input.blur(); }
  });
  return { bar, input };
}
function footer(){
  return h('footer', { class:'foot' }, h('div', { class:'wrap' },
    h('span', null, 'Vibe Coding 辞典 — 2026年10月版'),
    h('span', null, '料金・無料枠・仕様は変わることがあります。使う前に公式情報を確認してください。')));
}
function toTop(){
  const b = h('button', { class:'to-top', type:'button', title:'ページ上部へ', onclick:() => scrollTo({ top:0, behavior:'smooth' }) }, '↑');
  addEventListener('scroll', () => b.classList.toggle('show', scrollY > 800), { passive:true });
  return b;
}

/* ---- 項目 ---- */
function renderItem(it, layout){
  const isRow = layout === 'rows';
  const art = h('article', { class:'item' + (isRow ? ' row' : '') + (it.wide ? ' wide' : ''), id: it.id || null });
  const searchText = [it.name, it.en, it.desc, (it.tags || []).join(' '), [].concat(it.prompt || []).join(' '), it.search || '', (it.meta || []).map(m => m.join(' ')).join(' ')].join(' ');
  art.dataset.s = norm(searchText);

  let mount = null;
  if (it.demo != null || it.init){
    const stage = h('div', { class:'stage ' + (it.stage || ''), style: it.h ? '--stage-h:' + it.h + 'px' : null });
    let inner = h('div', { class:'stage-inner' }), cleanup = null, mountedW = -1, mountedDpr = 0;
    stage.append(inner);
    mount = () => {
      if (typeof cleanup === 'function'){ try{ cleanup(); }catch(e){} }
      cleanup = null;
      // 毎回まっさらな要素に差し替える（古いデモのイベントやループを確実に残さない）
      const fresh = h('div', { class:'stage-inner' });
      inner.replaceWith(fresh); inner = fresh;
      inner.innerHTML = it.demo || '';
      if (it.init){ try{ cleanup = it.init(inner) || null; }catch(e){ console.error(it.name, e); } }
      mountedW = stage.clientWidth; mountedDpr = window.devicePixelRatio || 1;
    };
    // JSで動くデモは、幅や拡大率が変わったら作り直す（Canvasの解像度・座標を合わせ直すため）
    if (it.init && it.resize !== false) watchResize(stage, () => {
      const w = stage.clientWidth;
      if (mountedW < 0 || !w) return;
      const dprChanged = (window.devicePixelRatio || 1) !== mountedDpr && inner.querySelector('canvas');
      if (Math.abs(w - mountedW) > 1 || dprChanged) mount();
    });
    if (it.hint) stage.append(h('span', { class:'hint' }, it.hint));
    if (it.replay !== false) stage.append(h('button', { class:'replay', type:'button', title:'もう一度再生', 'aria-label':'もう一度再生', onclick: mount }, '↻'));
    art.append(stage);
  }

  const head = h('div', { class:'item-head' }, h('h4', { html: it.name }), it.en ? h('span', { class:'en', html: it.en }) : null);
  if (it.check){
    // チェックリスト項目：状態はこのブラウザにだけ保存する
    const key = 'vd-chk:' + location.pathname + ':' + (it.id || strip(it.name));
    const cb = h('input', { type:'checkbox', class:'chk', 'aria-label':'完了にする' });
    try{ cb.checked = localStorage.getItem(key) === '1'; }catch(e){}
    art.classList.toggle('done', cb.checked);
    cb.addEventListener('change', () => {
      art.classList.toggle('done', cb.checked);
      try{ cb.checked ? localStorage.setItem(key, '1') : localStorage.removeItem(key); }catch(e){}
      document.dispatchEvent(new CustomEvent('vd-check'));
    });
    head.prepend(cb);
  }
  const tags = it.tags && it.tags.length ? h('div', { class:'tags' }, it.tags.map(t => {
    let cls = 'tag';
    if (/^[○◎✓]|不要|無料|おすすめ|定番/.test(t)) cls += ' good';
    else if (/^[△!]|注意|制限|要登録|非公式/.test(t)) cls += ' warn';
    else if (/^[×✕]|廃止|有料のみ/.test(t)) cls += ' bad';
    return h('span', { class: cls }, t);
  })) : null;

  const body = h('div', { class:'item-body' });
  if (isRow){
    const term = h('div', { class:'term' }, head, tags);
    art.insertBefore(term, art.firstChild);
  } else {
    body.append(head);
  }
  if (it.desc) body.append(h('p', { class:'desc', html: it.desc }));
  if (!isRow && tags) body.append(tags);
  if (it.meta && it.meta.length){
    body.append(h('dl', { class:'meta' }, it.meta.map(m => h('div', null, h('dt', null, m[0]), h('dd', { html: m[1] })))));
  }
  if (it.prompt){
    const ps = [].concat(it.prompt);
    body.append(h('div', { class:'prompt' },
      h('div', { class:'prompt-head' }, h('span', null, 'AIへの指示例'), copyBtn(() => ps.join('\n'))),
      ps.map(p => h('p', { text: p }))));
  }
  if (it.code) body.append(codeBlock(it.code, it.codeLabel));
  if (it.code2) body.append(codeBlock(it.code2, it.code2Label));
  if (it.try){
    const out = h('div', { hidden:true });
    const btn = h('button', { class:'try-btn', type:'button', onclick: () => runTry(it.try, out) }, it.try.label || '▶ 実際に呼び出す');
    body.append(btn, out);
  }
  const links = [];
  if (it.url) links.push(['公式・詳細 ↗', it.url]);
  (it.links || []).forEach(l => links.push(l));
  if (links.length) body.append(h('div', { class:'links' }, links.map(l => h('a', { href:l[1], target:'_blank', rel:'noopener' }, l[0]))));
  art.append(body);
  return { el: art, mount };
}

async function runTry(t, out){
  out.hidden = false; out.innerHTML = '';
  const pre = h('pre', { class:'out' }, '読み込み中… ' + t.url);
  out.append(pre);
  if (t.image){
    pre.remove();
    out.append(h('img', { class:'try-img', src: t.url + (t.url.includes('?') ? '&' : '?') + '_=' + Date.now(), alt:'APIの返した画像' }));
    return;
  }
  try{
    const r = await fetch(t.url, t.opts || {});
    const ct = r.headers.get('content-type') || '';
    let text, json = null;
    if (ct.includes('json')){ json = await r.json(); text = JSON.stringify(json, null, 2); }
    else text = await r.text();
    if (text.length > 2400) text = text.slice(0, 2400) + '\n…（以下省略）';
    pre.textContent = 'HTTP ' + r.status + '  ' + t.url + '\n\n' + text;
    if (json && t.imageFrom){
      const src = t.imageFrom(json);
      if (src) out.prepend(h('img', { class:'try-img', src, alt:'APIの返した画像', style:'margin-bottom:8px' }));
    }
  }catch(e){
    pre.textContent = '取得できませんでした: ' + e.message + '\n\n考えられる原因: ネットワーク未接続 / CORS（ブラウザから直接呼べない）/ サービス側の停止・仕様変更。';
  }
}

/* ---- タブで見た目を切り替えるプレビュー ---- */
function switcher(el, cfg){
  const box = h('div', { class:'switcher' });
  const tabs = h('div', { class:'sw-tabs', role:'tablist' });
  const preview = h('div', { class:'sw-preview ' + (cfg.previewClass || '') });
  const info = h('div', { class:'sw-info' });
  preview.innerHTML = cfg.preview || '';
  let cleanup = null;
  function select(i){
    const o = cfg.options[i];
    [...tabs.children].forEach((b, j) => b.setAttribute('aria-selected', String(i === j)));
    if (cleanup){ try{ cleanup(); }catch(e){} cleanup = null; }
    if (cfg.rerender) preview.innerHTML = cfg.preview || '';
    preview.className = 'sw-preview ' + (cfg.previewClass || '') + ' ' + (o.cls || '');
    if (o.style != null) preview.setAttribute('style', o.style); else preview.removeAttribute('style');
    if (o.apply) cleanup = o.apply(preview) || null;
    info.innerHTML = '';
    info.append(h('h4', null, o.label), o.en ? h('span', { class:'en', html:o.en }) : null);
    if (o.desc) info.append(h('p', { class:'desc', html:o.desc }));
    if (o.tags) info.append(h('div', { class:'tags' }, o.tags.map(t => h('span', { class:'tag' }, t))));
    if (o.prompt){
      const ps = [].concat(o.prompt);
      info.append(h('div', { class:'prompt' }, h('div', { class:'prompt-head' }, h('span', null, 'AIへの指示例'), copyBtn(() => ps.join('\n'))), ps.map(p => h('p', { text:p }))));
    }
    if (o.code) info.append(codeBlock(o.code, o.codeLabel));
  }
  cfg.options.forEach((o, i) => tabs.append(h('button', { class:'sw-tab', type:'button', role:'tab', onclick: () => select(i) }, o.label)));
  box.append(tabs, h('div', { class:'sw-body' }, preview, info));
  el.append(box);
  select(cfg.start || 0);
}

/* ---- ページ全体 ---- */
function render(cfg){
  if (cfg.accent) document.documentElement.style.setProperty('--accent', cfg.accent);
  document.title = cfg.title + ' | Vibe Coding 辞典';
  const tb = topbar(cfg);
  document.body.append(tb.bar);

  let total = 0;
  const panels = [];
  const tabBtns = [];
  const main = h('main');
  const tabsInner = h('div', { class:'wrap tabs-inner', role:'tablist' });
  const nav = h('nav', { class:'tabs', 'aria-label':'カテゴリ' }, tabsInner);

  cfg.tabs.forEach((tab, ti) => {
    const panel = h('section', { class:'panel', id:'panel-' + tab.id, role:'tabpanel' });
    const wrap = h('div', { class:'wrap' });
    panel.append(wrap);
    wrap.append(h('h2', { class:'panel-title' }, tab.label));
    if (tab.intro) wrap.append(h('p', { class:'intro', html: tab.intro }));
    const mounts = [];
    let count = 0;
    (tab.sections || []).forEach((sec, si) => {
      const s = h('div', { class:'sec' });
      if (sec.title) s.append(h('h3', { class:'sec-title' }, h('span', { class:'no' }, String(si + 1).padStart(2, '0')), h('span', { html: sec.title })));
      if (sec.note) s.append(h('p', { class:'sec-note', html: sec.note }));
      if (sec.custom){
        const c = h('div', { class:'custom-block' });
        s.append(c);
        mounts.push(() => sec.custom(c));
        s.dataset.custom = '1';
      }
      if (sec.html) s.append(h('div', { class:'custom-block', html: sec.html }));
      if (sec.table){
        const tbl = h('table', { class:'data' });
        tbl.append(h('thead', null, h('tr', null, sec.table.head.map(x => h('th', { html:x })))));
        const tb2 = h('tbody');
        sec.table.rows.forEach(r => {
          const tr = h('tr', null, r.map(x => h('td', { html: String(x) })));
          tr.dataset.s = norm(r.join(' '));
          tb2.append(tr); count++;
        });
        tbl.append(tb2);
        s.append(h('div', { class:'table-wrap' }, tbl));
      }
      if (sec.items && sec.items.length){
        const layout = sec.layout || 'cards';
        const grid = h('div', { class:'grid ' + layout });
        sec.items.forEach(it => {
          const r = renderItem(it, layout);
          grid.append(r.el);
          if (r.mount) mounts.push(r.mount);
          count++;
        });
        s.append(grid);
      }
      if (sec.after) s.append(h('div', { class:'note ' + (sec.after.type || 'point'), html: '<b>' + (sec.after.label || 'ポイント') + '</b>' + sec.after.text }));
      wrap.append(s);
    });
    total += count;
    main.append(panel);
    panels.push({ tab, panel, mounts, mounted:false });
    const b = h('button', { class:'tab', type:'button', role:'tab', 'aria-selected':'false', 'aria-controls':'panel-' + tab.id, onclick: () => { select(ti, true); } },
      tab.icon ? h('span', null, tab.icon) : null, tab.label, h('span', { class:'n' }, String(count)));
    tabBtns.push(b);
    tabsInner.append(b);
  });
  main.append(h('div', { class:'wrap empty-search' }, '該当する項目が見つかりませんでした。別の言い方（英語・ひらがな・カタカナ）でも試してみてください。'));

  const hero = h('section', { class:'hero' }, h('div', { class:'wrap' },
    h('p', { class:'eyebrow' }, (cfg.icon ? cfg.icon + '  ' : '') + (cfg.en || '')),
    h('h1', null, cfg.title),
    cfg.lead ? h('p', { class:'lead', html: cfg.lead }) : null,
    h('div', { class:'stats' },
      h('span', { class:'stat' }, h('b', null, String(total)), ' 項目'),
      h('span', { class:'stat' }, h('b', null, String(cfg.tabs.length)), ' カテゴリ'),
      (cfg.stats || []).map(s => h('span', { class:'stat', html:s }))),
    cfg.howto ? h('div', { class:'howto' }, cfg.howto.map(x => h('div', null, h('b', null, x[0]), h('span', { html:x[1] })))) : null));

  document.body.append(hero, nav, main, footer(), toTop());

  function mountPanel(p){
    if (p.mounted) return;
    p.mounted = true;
    p.mounts.forEach(fn => { try{ fn(); }catch(e){ console.error(e); } });
  }
  let active = 0;
  function select(i, scroll){
    active = i;
    panels.forEach((p, j) => p.panel.classList.toggle('on', i === j));
    tabBtns.forEach((b, j) => b.setAttribute('aria-selected', String(i === j)));
    mountPanel(panels[i]);
    try{ history.replaceState(null, '', '#' + panels[i].tab.id); }catch(e){}
    tabBtns[i].scrollIntoView({ block:'nearest', inline:'nearest' });
    if (scroll){
      const y = nav.getBoundingClientRect().top + scrollY - parseInt(getComputedStyle(document.documentElement).getPropertyValue('--topbar-h'));
      if (scrollY > y) scrollTo({ top:y });
    }
  }
  const startId = decodeURIComponent(location.hash.slice(1));
  const startIdx = Math.max(0, panels.findIndex(p => p.tab.id === startId));
  select(startIdx);
  addEventListener('hashchange', () => {
    const i = panels.findIndex(p => p.tab.id === decodeURIComponent(location.hash.slice(1)));
    if (i >= 0 && i !== active) select(i, true);
  });

  /* 検索 */
  let timer;
  tb.input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => runSearch(tb.input.value), 120);
  });
  function runSearch(q){
    const terms = norm(q).split(/\s+/).filter(Boolean);
    if (!terms.length){
      main.classList.remove('searching', 'allmiss');
      document.querySelectorAll('.nohit').forEach(x => x.classList.remove('nohit'));
      select(active);
      return;
    }
    main.classList.add('searching');
    let any = false;
    panels.forEach(p => {
      let pHit = false;
      p.panel.querySelectorAll('.sec').forEach(sec => {
        let sHit = false;
        sec.querySelectorAll('.item, tbody tr').forEach(it => {
          const ok = terms.every(t => it.dataset.s.includes(t));
          it.classList.toggle('nohit', !ok);
          if (ok) sHit = true;
        });
        sec.classList.toggle('nohit', !sHit);
        if (sHit) pHit = true;
      });
      p.panel.classList.toggle('nohit', !pHit);
      if (pHit){ any = true; mountPanel(p); }
    });
    main.classList.toggle('allmiss', !any);
  }
  // 一覧ページの横断検索から来たとき（?q=…）は、その言葉で検索した状態で開く。URL の ?q= は残さない
  try{
    const q0 = new URLSearchParams(location.search).get('q');
    if (q0){ tb.input.value = q0; runSearch(q0); history.replaceState(null, '', location.pathname + location.hash); }
  }catch(e){}
  return { select };
}

/* ---- サイズ・拡大率の変化を見張る（まとめて1回だけ確認する） ---- */
const RESIZE_CHECKS = new Set();
let resizeTimer = null;
function resizeSoon(){ clearTimeout(resizeTimer); resizeTimer = setTimeout(() => RESIZE_CHECKS.forEach(fn => { try{ fn(); }catch(e){ console.error(e); } }), 180); }
const resizeObs = 'ResizeObserver' in window ? new ResizeObserver(resizeSoon) : null;
addEventListener('resize', resizeSoon);   // ブラウザの拡大・縮小でも発生する
function watchResize(el, fn){ RESIZE_CHECKS.add(fn); if (resizeObs) resizeObs.observe(el); }

/* ---- ちょっとしたデモ用ユーティリティ ---- */
// requestAnimationFrame ループ。画面外・非表示中は描画をスキップし、戻り値で停止できる。
// 要素がページから取り除かれたら（デモの作り直しなど）自動で止まる。
function loop(el, fn){
  let id, last = performance.now(), alive = true, seen = false;
  function frame(now){
    if (!alive) return;
    if (el.isConnected) seen = true; else if (seen){ alive = false; return; }
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (el.isConnected && el.offsetParent !== null) fn(dt, now / 1000);
    id = requestAnimationFrame(frame);
  }
  id = requestAnimationFrame(frame);
  return () => { alive = false; cancelAnimationFrame(id); };
}
// ステージの実寸に合わせた高解像度キャンバスを作る（拡大表示でもにじまないよう最大3倍）
function canvas(el, w, hgt){
  w = el.clientWidth || w || 300; hgt = el.clientHeight || hgt || 170;
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const c = h('canvas', { width: Math.round(w * dpr), height: Math.round(hgt * dpr), style: 'width:100%;height:100%;display:block' });
  el.append(c);
  const ctx = c.getContext('2d');
  ctx.scale(dpr, dpr);
  return { c, ctx, w, h: hgt };
}

window.VD = { render, switcher, h, copyText, copyBtn, codeBlock, toast, loop, canvas, DICTS, EXTRA, GROUPS, toggleTheme };
})();
