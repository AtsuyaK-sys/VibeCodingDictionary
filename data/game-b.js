/* ゲーム制作辞典 — 追加分：実装パターン（敵の動き・移動・セーブ・HUD・レベルデザイン） */
(function(){
const $ = (el, s) => el.querySelector(s), $$ = (el, s) => [...el.querySelectorAll(s)];
const BG = '#151827', FG = '#e8eaf6', DIM = '#2a2f45';
const T = (name, en, desc, prompt, tags, more) => Object.assign({ name, en, desc, prompt, tags }, more || {});
const ctl = (box, labels, on, start = 0) => { box.innerHTML = labels.map((l, i) => `<button type="button" class="${i === start ? 'on' : ''}">${l}</button>`).join(''); $$(box, 'button').forEach((b, i) => b.onclick = () => { $$(box, 'button').forEach(x => x.classList.toggle('on', x === b)); on(i); }); on(start); };
const len = (x, y) => Math.hypot(x, y) || 1;
function pointer(el){ const m = { x:0, y:0, inside:false }; el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); m.x = e.clientX - r.left; m.y = e.clientY - r.top; m.inside = true; }); el.addEventListener('pointerdown', e => { const r = el.getBoundingClientRect(); m.x = e.clientX - r.left; m.y = e.clientY - r.top; m.inside = true; }); el.addEventListener('pointerleave', () => m.inside = false); return m; }
const label = (ctx, t, x, y, col) => { ctx.font = '700 11px "Noto Sans JP", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = col || FG; ctx.fillText(t, x, y); ctx.textAlign = 'left'; };

/* ---- 敵の動き ---- */
const AI = [
  ['追いかける', '<b>追跡（チェイス）</b>：毎フレーム、プレイヤーへの向きを求めて近づく。いちばん単純な敵。速すぎると逃げられないので、<b>プレイヤーより少し遅く</b>します。'],
  ['巡回する', '<b>巡回（パトロール）</b>：決めた地点を順番に回る。プレイヤーを気にしない「動く障害物」。動きが読めるので、タイミングを計る遊びになります。'],
  ['見張り（状態）', '<b>状態で切り替える</b>：「巡回 → 発見！ → 追跡 → 見失う → 探す → 戻る」。<b>視界（扇形）</b>に入ると見つかります。状態ごとに動きを分けると、賢そうな敵が作れます（ステートマシン）。'],
  ['逃げる', '<b>逃走</b>：プレイヤーと反対の向きに動く。捕まえるゲームや、弱った敵に使います。壁際で行き詰まらないよう、端では向きを変えます。'],
  ['先回りする', '<b>先回り（予測）</b>：プレイヤーの<b>今の速さから、少し先の位置</b>を予測して向かう。追いかけるだけの敵より、ぐっと手強く感じます。'],
];
function enemyDemo(el){ const cv = $(el, '.gb-cv'), { ctx, w, h } = VD.canvas(cv), m = pointer(cv); let mode = 0;
  const P = { x:w * .25, y:h * .5, vx:0, vy:0 }, WP = [[w * .2, h * .25], [w * .8, h * .25], [w * .8, h * .75], [w * .2, h * .75]];
  let E, t = 0;
  function reset(){ E = { x:w * .75, y:h * .5, ang:Math.PI, wp:1, st:'巡回', timer:0, lx:0, ly:0 }; }
  ctl($(el, '.gb-ctl'), AI.map(a => a[0]), (i) => { mode = i; reset(); $(el, '.gb-note').innerHTML = AI[i][1] + ' <span>（キャンバスの中でマウスや指を動かすと、プレイヤー（緑）を動かせます）</span>'; });
  const step = (sp, tx, ty, dt) => { const dx = tx - E.x, dy = ty - E.y, d = len(dx, dy); if (d < 2) return d; E.x += dx / d * sp * dt; E.y += dy / d * sp * dt; E.ang = Math.atan2(dy, dx); return d; };
  const sees = () => { const dx = P.x - E.x, dy = P.y - E.y, d = len(dx, dy); let a = Math.atan2(dy, dx) - E.ang; a = Math.atan2(Math.sin(a), Math.cos(a)); return d < 130 && Math.abs(a) < .55; };
  return VD.loop(cv, (dt) => { t += dt; dt = Math.min(dt, .05);
    const px = P.x, py = P.y;
    if (m.inside){ P.x += (m.x - P.x) * Math.min(1, dt * 6); P.y += (m.y - P.y) * Math.min(1, dt * 6); }
    else { P.x = w * .5 + Math.cos(t * .6) * w * .32; P.y = h * .5 + Math.sin(t * 1.1) * h * .3; }
    P.vx = (P.x - px) / dt; P.vy = (P.y - py) / dt;
    if (mode === 0) step(70, P.x, P.y, dt);
    if (mode === 1 || (mode === 2 && E.st === '巡回')){ const [tx, ty] = WP[E.wp]; if (step(80, tx, ty, dt) < 4) E.wp = (E.wp + 1) % WP.length; if (mode === 2 && sees()){ E.st = '発見！'; E.timer = .5; } }
    if (mode === 2 && E.st !== '巡回'){ E.timer -= dt;
      if (E.st === '発見！'){ E.ang = Math.atan2(P.y - E.y, P.x - E.x); if (E.timer <= 0) E.st = '追跡'; }
      else if (E.st === '追跡'){ step(95, P.x, P.y, dt); if (sees() || len(P.x - E.x, P.y - E.y) < 60){ E.lx = P.x; E.ly = P.y; E.timer = 1.6; } else if (E.timer <= 0){ E.st = '探す'; E.timer = 2; } }
      else if (E.st === '探す'){ if (step(60, E.lx, E.ly, dt) < 4) E.ang += dt * 3; if (sees()){ E.st = '発見！'; E.timer = .4; } else if (E.timer <= 0) E.st = '戻る'; }
      else if (E.st === '戻る'){ const [tx, ty] = WP[E.wp]; if (step(70, tx, ty, dt) < 4) E.st = '巡回'; if (sees()){ E.st = '発見！'; E.timer = .4; } } }
    if (mode === 3){ const dx = E.x - P.x, dy = E.y - P.y, d = len(dx, dy); if (d < 170){ E.x += dx / d * 85 * dt; E.y += dy / d * 85 * dt; } if (E.x < 20 || E.x > w - 20) E.y += (E.y < h / 2 ? 1 : -1) * 120 * dt; if (E.y < 20 || E.y > h - 20) E.x += (E.x < w / 2 ? 1 : -1) * 120 * dt; E.x = Math.max(14, Math.min(w - 14, E.x)); E.y = Math.max(14, Math.min(h - 14, E.y)); }
    if (mode === 4){ const lead = Math.min(1.2, len(P.x - E.x, P.y - E.y) / 120); const tx = P.x + P.vx * lead, ty = P.y + P.vy * lead; step(75, tx, ty, dt); ctx.__t = [tx, ty]; }
    // 描く
    ctx.fillStyle = BG; ctx.fillRect(0, 0, w, h);
    if (mode === 1 || mode === 2){ ctx.strokeStyle = DIM; ctx.setLineDash([4, 4]); ctx.beginPath(); WP.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.stroke(); ctx.setLineDash([]); }
    if (mode === 2){ ctx.fillStyle = E.st === '追跡' || E.st === '発見！' ? 'rgba(239,68,68,.22)' : 'rgba(251,191,36,.18)'; ctx.beginPath(); ctx.moveTo(E.x, E.y); ctx.arc(E.x, E.y, 130, E.ang - .55, E.ang + .55); ctx.closePath(); ctx.fill(); }
    if (mode === 4 && ctx.__t){ ctx.strokeStyle = '#fbbf24'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(E.x, E.y); ctx.lineTo(ctx.__t[0], ctx.__t[1]); ctx.stroke(); ctx.setLineDash([]); ctx.beginPath(); ctx.arc(ctx.__t[0], ctx.__t[1], 6, 0, 7); ctx.stroke(); }
    ctx.fillStyle = '#4ade80'; ctx.beginPath(); ctx.arc(P.x, P.y, 9, 0, 7); ctx.fill();
    ctx.fillStyle = '#f87171'; ctx.beginPath(); ctx.arc(E.x, E.y, 11, 0, 7); ctx.fill(); ctx.strokeStyle = FG; ctx.beginPath(); ctx.moveTo(E.x, E.y); ctx.lineTo(E.x + Math.cos(E.ang) * 15, E.y + Math.sin(E.ang) * 15); ctx.stroke();
    if (mode === 2) label(ctx, E.st, E.x, E.y - 18, E.st === '巡回' ? '#fbbf24' : '#fca5a5');
    const caught = len(P.x - E.x, P.y - E.y) < 20; if (caught && mode !== 3) label(ctx, 'つかまった！', P.x, P.y - 16, '#fca5a5'); });
}

/* ---- 斜め移動の正規化 ---- */
function diagDemo(el){ const cv = $(el, '.gb-cv'), { ctx, w, h } = VD.canvas(cv); let t = 0;
  return VD.loop(cv, (dt) => { t += dt; const cyc = t % 3.2, run = Math.min(cyc, 2.2), sp = Math.min(w, h) * .3;
    const a = { x:30 + run * sp, y:30 + run * sp }, n = 1 / Math.SQRT2, b = { x:30 + run * sp * n, y:30 + run * sp * n }, c = { x:30 + run * sp, y:h - 24 };
    ctx.fillStyle = BG; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = DIM; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.arc(30, 30, run * sp, 0, Math.PI / 2); ctx.stroke(); ctx.setLineDash([]);
    [[c, '#60a5fa', '右だけ（速さ 1.00）'], [a, '#f87171', '斜め・そのまま（速さ 1.41）'], [b, '#4ade80', '斜め・正規化（速さ 1.00）']].forEach(([p, col, tx], i) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(Math.min(p.x, w - 10), Math.min(p.y, h - 10), 8, 0, 7); ctx.fill(); ctx.font = '600 11px "Noto Sans JP", sans-serif'; ctx.fillText('● ' + tx, Math.max(60, w - 175), 16 + i * 15); });
    ctx.fillStyle = 'rgba(232,234,246,.6)'; ctx.font = '600 10.5px "Noto Sans JP", sans-serif'; ctx.fillText('点線の円＝本来進むべき距離', w - 150, h - 8); });
}

/* ---- セーブデータ ---- */
const KEY = 'vd-game-demo-save';
function saveDemo(el){ let st = { version:2, level:1, coins:0, items:[] }; const msg = $(el, '.msg');
  const show = (t, c) => { msg.textContent = t; msg.className = 'msg ' + (c || ''); };
  const draw = () => { $(el, '.lv').textContent = st.level; $(el, '.cn').textContent = st.coins; $(el, '.it').textContent = st.items.join('・') || '（なし）';
    let raw = null, view = '（まだありません）'; try{ raw = localStorage.getItem(KEY); }catch(e){}
    if (raw){ try{ view = JSON.stringify(JSON.parse(raw), null, 2); }catch(e){ view = raw + '\n\n← JSON として読めない（壊れている）'; } }
    $(el, 'pre').textContent = '保存されているデータ（localStorage）：\n' + view; };
  const migrate = (d) => { if (!d || typeof d !== 'object') throw new Error('形が違う'); if (!d.version){ d = { version:2, level:d.lv || 1, coins:d.gold || 0, items:[] }; show('古い形式（v1）のデータを、新しい形式（v2）に変換して読み込みました', 'ok'); } return d; };
  $(el, '.c1').onclick = () => { st.coins += 10; draw(); };
  $(el, '.c2').onclick = () => { st.level++; st.items.push(['木の剣', '回復薬', '地図', '鍵'][(st.level - 2) % 4]); draw(); };
  $(el, '.sv').onclick = () => { try{ localStorage.setItem(KEY, JSON.stringify(Object.assign({}, st, { savedAt:new Date().toISOString().slice(0, 19) }))); show('セーブしました', 'ok'); }catch(e){ show('保存できませんでした（ブラウザの設定で保存が禁止されているかも）', 'bad'); } draw(); };
  $(el, '.ld').onclick = () => { try{ const raw = localStorage.getItem(KEY); if (!raw) return show('セーブデータがありません', 'bad'); show('ロードしました', 'ok'); st = migrate(JSON.parse(raw)); delete st.savedAt; }catch(e){ st = { version:2, level:1, coins:0, items:[] }; show('データが壊れていたので、最初から始めます（ゲームは止まりません）', 'bad'); } draw(); };
  $(el, '.old').onclick = () => { try{ localStorage.setItem(KEY, JSON.stringify({ lv:5, gold:320 })); show('古い形式（v1）のデータを置きました。「ロード」を押してください', ''); }catch(e){} draw(); };
  $(el, '.brk').onclick = () => { try{ localStorage.setItem(KEY, '{"level": 3, "coins": '); show('壊れたデータを置きました。「ロード」を押してください', ''); }catch(e){} draw(); };
  $(el, '.del').onclick = () => { try{ localStorage.removeItem(KEY); }catch(e){} st = { version:2, level:1, coins:0, items:[] }; show('セーブデータを消しました', ''); draw(); };
  draw();
}

/* ---- HUD の配置 ---- */
const HUDS = [['hp', 'HP'], ['score', 'スコア'], ['map', 'ミニマップ'], ['btn', 'スマホのボタン'], ['msg', 'お知らせ']];
function hudDemo(el){ const cv = $(el, '.gb-cv'), { ctx, w, h } = VD.canvas(cv), on = new Set(['hp', 'score']); let t = 0;
  $(el, '.gb-ctl').innerHTML = HUDS.map(([k, l]) => `<label><input type="checkbox" data-k="${k}" ${on.has(k) ? 'checked' : ''}>${l}</label>`).join('') + '<button type="button" class="mx">全部のせる</button>';
  $$(el, '.gb-ctl input').forEach(i => i.onchange = () => { i.checked ? on.add(i.dataset.k) : on.delete(i.dataset.k); note(); });
  $(el, '.mx').onclick = () => { $$(el, '.gb-ctl input').forEach(i => { i.checked = true; on.add(i.dataset.k); }); note(); };
  const note = () => { $(el, '.gb-note').innerHTML = on.size >= 5 ? '<b>のせすぎ</b>：遊ぶ場所（真ん中）が狭くなり、どこを見ればいいか分からなくなります。本当に毎秒見る情報だけを常に表示し、ほかはポーズ画面などへ。' : on.size <= 2 ? '<b>最小限</b>：HPとスコアを<b>画面の角</b>に。目は画面の真ん中（キャラクター）にあるので、HUD は端に置き、変化したときだけ目立たせます。' : '情報を足すほど、遊ぶ場所が狭くなります。スマホでは<b>親指で隠れる下の角</b>にボタンが来ることも考えます。'; };
  note();
  return VD.loop(cv, (dt) => { t += dt; ctx.fillStyle = BG; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 6; i++){ ctx.fillStyle = '#f87171'; ctx.beginPath(); ctx.arc(w * (.15 + i * .14) + Math.sin(t + i) * 10, h * .5 + Math.cos(t * 1.3 + i) * h * .25, 7, 0, 7); ctx.fill(); }
    ctx.fillStyle = '#4ade80'; ctx.beginPath(); ctx.arc(w / 2 + Math.sin(t * .8) * 30, h / 2, 10, 0, 7); ctx.fill();
    ctx.font = '700 12px "Noto Sans JP", sans-serif';
    if (on.has('hp')){ ctx.fillStyle = DIM; ctx.fillRect(10, 10, 110, 12); ctx.fillStyle = '#4ade80'; ctx.fillRect(10, 10, 110 * (.6 + .3 * Math.sin(t * .7)), 12); ctx.fillStyle = FG; ctx.fillText('HP', 124, 21); }
    if (on.has('score')){ ctx.textAlign = 'right'; ctx.fillStyle = FG; ctx.font = '800 16px "JetBrains Mono", monospace'; ctx.fillText(String(Math.floor(t * 37) * 10).padStart(6, '0'), w - 10, 24); ctx.textAlign = 'left'; ctx.font = '700 12px "Noto Sans JP", sans-serif'; }
    if (on.has('map')){ ctx.fillStyle = 'rgba(42,47,69,.9)'; ctx.fillRect(w - 80, h - 64, 70, 54); ctx.fillStyle = '#4ade80'; ctx.fillRect(w - 47, h - 39, 4, 4); }
    if (on.has('btn')){ ctx.fillStyle = 'rgba(232,234,246,.18)'; ctx.beginPath(); ctx.arc(40, h - 40, 26, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(w - (on.has('map') ? 120 : 40), h - 40, 22, 0, 7); ctx.fill(); ctx.fillStyle = FG; ctx.fillText('A', w - (on.has('map') ? 124 : 44), h - 36); }
    if (on.has('msg')){ ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(w / 2 - 90, 30, 180, 26); ctx.fillStyle = '#fbbf24'; ctx.textAlign = 'center'; ctx.fillText('ボーナスタイム中！', w / 2, 48); ctx.textAlign = 'left'; } });
}

TABS.push({ id:'patterns', label:'実装パターン', icon:'🧭',
  intro:'ゲームを「遊べる形」にするための、よく使う作り方の型です。<b>敵の動き・移動・セーブ・HUD・ステージの組み立て</b>。見本はキャンバスで動きます。名前と型を知っていると、AIへの頼み方が具体的になり、作ったものの直し方も分かります。',
  sections:[
    { title:'敵と移動', items:[
      { name:'敵の動き（5つの型）', en:'Enemy AI: chase / patrol / state / flee / intercept', h:400, wide:true, tags:['敵','ステートマシン','最重要'], demo:'<div class="gb"><div class="gb-ctl"></div><div class="gb-cv"></div><div class="gb-note"></div></div>',
        init:(el) => enemyDemo(el),
        desc:'敵の「頭のよさ」は、ほとんどが<b>この5つの組み合わせ</b>です。いちばん大事なのは、強さより<b>プレイヤーが動きを読めること</b>。見つかる前に視界が見える、攻撃の前に予兆（テレグラフ）がある、と公平に感じられます。',
        prompt:'見下ろし型のゲームの敵を、状態で切り替わるAIにして。状態は「巡回→発見（0.5秒止まって「！」を出す）→追跡→見失う→最後に見た場所を探す→巡回に戻る」。視界は前方の扇形（半径130px、角度60度くらい）で、壁の向こうは見えないようにして。状態の名前を敵の頭の上にデバッグ表示できるようにして。' },
      { name:'斜め移動の正規化', en:'Normalizing diagonal movement', h:300, tags:['移動','よくあるバグ'], demo:'<div class="gb"><div class="gb-cv"></div><div class="gb-note">右キーで (1, 0)、右＋下で (1, 1) と足すと、斜めだけ<b>約1.41倍速く</b>なります。向きの長さを1にそろえる（正規化）と、どの向きも同じ速さに。</div></div>',
        init:(el) => diagDemo(el),
        desc:'見下ろし型のゲームで「斜めに歩くと速い」のは定番のバグ。入力から作った向き <code>(dx, dy)</code> を、<b>長さで割って</b>から速さを掛けます。くわしくは <a href="motion-math.html">動きの計算辞典</a> の「座標とベクトル」。',
        prompt:'キーボードの矢印（WASD）で8方向に動く見下ろし型の移動を作って。斜めでも速さが同じになるよう、入力の向きを正規化してから速さを掛けて。ゲームパッドのスティックにも対応して。',
        code:'let dx = right - left, dy = down - up;\nconst len = Math.hypot(dx, dy);\nif (len > 0) { dx /= len; dy /= len; }\nplayer.x += dx * SPEED * dt;\nplayer.y += dy * SPEED * dt;' },
    ] },
    { title:'記録と画面', items:[
      { name:'セーブデータの設計', en:'Save data: versioning & recovery', h:380, wide:true, tags:['セーブ','localStorage'], demo:'<div class="gb"><div class="gb-ctl"><button type="button" class="c1">＋10コイン</button><button type="button" class="c2">レベルアップ</button><button type="button" class="sv on">セーブ</button><button type="button" class="ld">ロード</button><button type="button" class="old">古い形式を置く</button><button type="button" class="brk">壊れたデータを置く</button><button type="button" class="del">消す</button></div><div class="gb-save"><div class="st"><div>レベル <span class="v lv"></span></div><div>コイン <span class="v cn"></span></div><div>持ち物：<span class="it"></span></div><div class="msg"></div></div><pre></pre></div></div>',
        init:(el) => saveDemo(el),
        desc:'セーブデータには<b>バージョン番号</b>を入れておき、アップデートで形が変わったら<b>読み込むときに新しい形に変換</b>します。読み込みは必ず <code>try / catch</code> で包み、<b>壊れていてもゲームが止まらない</b>ように。見本はこのブラウザの localStorage を実際に使っています（「消す」で消せます）。',
        prompt:'ゲームのセーブ機能を作って。保存先は localStorage、データには version を入れる。読み込み時に古い version なら新しい形に変換し、JSON が壊れていたら最初から始める（エラーで止まらない）。オートセーブはステージクリア時。セーブデータの書き出し・読み込み（JSONファイル）もできるように。' },
      { name:'HUD の配置', en:'HUD layout', h:340, tags:['UI','見やすさ'], demo:'<div class="gb"><div class="gb-ctl"></div><div class="gb-cv"></div><div class="gb-note"></div></div>',
        init:(el) => hudDemo(el),
        desc:'HUD は<b>画面の角</b>に、<b>本当に常に必要なものだけ</b>。プレイヤーの目は画面の真ん中にあるので、変化したときだけ光らせる・揺らすと気づきやすくなります。スマホでは、指で隠れる位置と、画面の切り欠き（セーフエリア）にも注意。',
        prompt:'ゲームのHUDを作って。左上にHPバー、右上にスコア。HPが減ったときはバーを揺らし、スコアが増えたときは数字を弾ませる。スマホのときだけ左下に移動パッド、右下にジャンプボタンを表示し、セーフエリアの余白を取って。' },
    ] },
    { title:'ステージと敵の作り方', layout:'rows', items:[
      T('教える → 試す → ひねる', 'Teach, test, twist', '新しい仕掛けは、①安全な場所で見せる（教える）、②少し危ない場所で使わせる（試す）、③別の仕掛けと組み合わせる（ひねる）、の順に出すと、説明なしで覚えてもらえます。', 'このステージを「教える→試す→ひねる」の流れで組み直して。新しい仕掛け【ジャンプ台】を最初は落ちても大丈夫な場所で見せ、次に穴の上で使わせ、最後に動く足場と組み合わせて。', ['最重要']),
      T('予兆（テレグラフ）', 'Telegraphing', '敵の攻撃の前に、<b>光る・構える・音を出す</b>などの合図を入れる。避けられる攻撃は「理不尽」ではなく「挑戦」になります。'),
      T('攻撃のあとのスキ', 'Recovery window', '大きな攻撃のあとに、少し動けない時間を作ると、反撃のチャンスになり、メリハリが生まれます。'),
      T('当たり判定は見た目より小さく', 'Forgiving hitboxes', 'プレイヤーのやられ判定は<b>見た目より小さく</b>、アイテムの取得判定は<b>大きく</b>。「今のは当たってない！」というストレスが減ります。'),
      T('難しい所の前にセーブ地点', 'Checkpoints', '難しい場所の直前にチェックポイントを置くと、何度でも気軽に挑戦できます。長い道のりを戻らせるのは、難しさではなく面倒さです。'),
      T('視線の誘導', 'Guiding the eye', '行ってほしい方向に、明るい色・コイン・光・動くものを置きます。看板で説明するより自然に伝わります。'),
      T('ボスのフェーズ', 'Boss phases', '体力が減るごとに攻撃のパターンを増やす・変える。前の段階で覚えたことを使わせると、成長を実感できます。'),
      T('敵の組み合わせ', 'Enemy mix', '近づく敵＋遠くから撃つ敵、のように<b>役割の違う敵</b>を混ぜると、同じ敵を増やすより面白くなります。'),
      T('横スクロールの定番の足場', 'Platforms', '下から通り抜けられる足場（一方通行）、動く足場、乗ると崩れる足場、はしご、坂。足場ごとに当たり判定の書き方が違います。'),
      T('見下ろし型の壁ずり', 'Wall sliding', '斜めに壁にぶつかったとき、止まるのではなく<b>壁に沿って滑る</b>ようにすると、操作が引っかからずに気持ちよくなります（x と y を別々に判定する）。'),
      T('オートセーブとセーブスロット', 'Autosave & slots', 'ステージクリア・設定の変更時に自動で保存。複数のデータを分けて残すならスロットを用意します。保存中は電源を切らないよう表示するのが家庭用ゲームの作法。'),
      T('ポーズ中は時間を止める', 'Pausing time', 'ポーズ中やタブが裏に回ったときは、ゲームの時間（dt）を進めない。戻ったときに敵が一気に動く事故を防げます。'),
      T('遊んでもらって確かめる', 'Playtesting', '作った本人は難しさが分かりません。他の人に、何も説明せずに遊んでもらい、<b>どこで止まったか・迷ったか</b>を黙って見るのがいちばんの調整方法です。', '私のゲームのテストプレイの記録（どこで何回やられたか、どこで迷ったか）を渡します。難易度曲線として問題のある所を挙げて、直し方を提案して。\n【記録】'),
    ] },
  ]});

// 「エンジン・ツール」タブを最後に戻す
const ei = TABS.findIndex(t => t.id === 'engine'); if (ei >= 0) TABS.push(TABS.splice(ei, 1)[0]);
})();
