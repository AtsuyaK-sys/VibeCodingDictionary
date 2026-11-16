/* モーション・インタラクション辞典 — A: 共通ヘルパー / ボタンを押す / 状態が変わる */
(function(){
const $ = (el, s) => el.querySelector(s), $$ = (el, s) => [...el.querySelectorAll(s)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// クラスを付け直してCSSアニメーションを最初から再生する
function retrigger(el, cls){ el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
// 文字の差し替え：古い文字は上へ、新しい文字は下から（dir=-1で逆向き）
function swapText(box, html, dir = 1, blur = true){
  const nw = document.createElement('span'); nw.innerHTML = html;
  const f = (on) => blur && !on ? 'blur(3px)' : 'blur(0px)';
  [...box.children].forEach(old => {
    old.animate([{ transform:'translateY(0)', opacity:1, filter:f(true) }, { transform:`translateY(${-85 * dir}%)`, opacity:0, filter:f(false) }], { duration:260, easing:'cubic-bezier(.4,0,.2,1)', fill:'forwards' }).onfinish = () => old.remove();
  });
  box.append(nw);
  nw.animate([{ transform:`translateY(${85 * dir}%)`, opacity:0, filter:f(false) }, { transform:'translateY(0)', opacity:1, filter:f(true) }], { duration:340, easing:'cubic-bezier(.2,.8,.2,1)' });
}
// 桁ごとに回転する数字（同じ桁数の値どうしで使う）
function setNum(el, str){
  const chars = [...str];
  if (+el.dataset.len !== chars.length){
    el.innerHTML = chars.map(c => /\d/.test(c) ? `<span class="col"><span class="strip">${[...'0123456789'].map(d => `<span>${d}</span>`).join('')}</span></span>` : `<span>${c}</span>`).join('');
    el.dataset.len = chars.length;
  }
  let k = 0;
  chars.forEach((c, i) => { if (/\d/.test(c)){ const s = el.children[i].firstChild; s.style.transitionDelay = (k++ * 45) + 'ms'; s.style.transform = `translateY(${-c * 1.15}em)`; } });
}
// FLIP：変更前後の位置の差を、transformで滑らかにつなぐ
function flip(els, mutate, opt = {}){
  const first = new Map(els.map(e => [e, e.getBoundingClientRect()]));
  mutate();
  els.forEach(e => {
    const a = first.get(e), b = e.getBoundingClientRect();
    if (!b.width || !b.height) return;
    const dx = a.left - b.left, dy = a.top - b.top, sx = a.width / b.width, sy = a.height / b.height;
    if (Math.abs(dx) < .5 && Math.abs(dy) < .5 && Math.abs(sx - 1) < .01 && Math.abs(sy - 1) < .01) return;
    e.animate([{ transformOrigin:'0 0', transform:`translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` }, { transformOrigin:'0 0', transform:'none' }], { duration:opt.duration || 480, easing:opt.easing || 'cubic-bezier(.2,.8,.2,1)' });
  });
}
// 紙吹雪のレイヤー（ステージ全体に重ねるCanvas）
const CONF = ['#f472b6', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#fb7185'];
function confettiLayer(el){
  const { c, ctx, w, h } = VD.canvas(el);
  c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:9';
  const ps = [];
  const stop = VD.loop(el, (dt) => {
    ctx.clearRect(0, 0, w, h);
    for (let i = ps.length - 1; i >= 0; i--){
      const p = ps[i]; p.vy += 900 * dt; p.vx *= .985; p.vy *= .99; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt; p.life -= dt;
      if (p.life <= 0 || p.y > h + 30){ ps.splice(i, 1); continue; }
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.globalAlpha = Math.min(1, p.life * 2); ctx.fillStyle = p.c;
      if (p.round){ ctx.beginPath(); ctx.arc(0, 0, p.s / 3, 0, 7); ctx.fill(); } else ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2 * (.3 + Math.abs(Math.sin(p.r * 2))));
      ctx.restore();
    }
  });
  return { w, h, stop, burst(x, y, n = 60, angle = -90, spread = 70, speed = 560){
    for (let i = 0; i < n; i++){ const a = (angle + (Math.random() - .5) * spread) * Math.PI / 180, v = speed * (.45 + Math.random() * .75);
      ps.push({ x, y, vx:Math.cos(a) * v, vy:Math.sin(a) * v, r:Math.random() * 6, vr:(Math.random() - .5) * 14, s:6 + Math.random() * 7, c:CONF[i % CONF.length], life:1.4 + Math.random(), round:Math.random() < .25 }); }
  } };
}
window.MO = { $, $$, clamp, retrigger, swapText, setNum, flip, confettiLayer };

const ICON = {
  copy:'<svg class="a" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/></svg>',
  check:'<svg class="b" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  heart:'<svg viewBox="0 0 24 24"><path d="M12 20.6l-1.4-1.3C5.4 14.6 2 11.6 2 7.9 2 4.9 4.4 2.6 7.4 2.6c1.7 0 3.4.8 4.6 2.1 1.2-1.3 2.9-2.1 4.6-2.1 3 0 5.4 2.3 5.4 5.3 0 3.7-3.4 6.7-8.6 11.4L12 20.6z"/></svg>',
  cart:'<svg viewBox="0 0 24 24" class="mo-ic"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6"/><circle cx="10" cy="20" r="1.3"/><circle cx="17" cy="20" r="1.3"/></svg>',
  bell:'<svg viewBox="0 0 24 24" class="mo-ic"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/></svg>',
};

TABS.push({
  id:'press', label:'ボタンを押す', icon:'👆',
  intro:'押した瞬間の<b>手応え</b>を作るアニメーション。押したことが伝わる・処理中が分かる・完了が気持ちいい、の3つがそろうと、同じ機能でも体験の質が大きく上がります。見本はすべて実際に押せます。',
  sections:[
    { title:'押した手応え', items:[
      { name:'押し込み（縮む）', en:'Press scale', h:150, demo:'<button class="mo-btn mo-press">押してみて</button>', tags:['基本','CSSのみ'],
        desc:'押している間だけ<b>少し縮める</b>（0.94〜0.97倍）。最も簡単で効果の大きい手応え。影も小さくすると「沈んだ」感じが出る。', prompt:'すべてのボタンに、押している間だけ0.96倍に縮む押し込みアニメーションを付けて（:active と transition 0.15秒）。',
        code:'.btn { transition: transform .16s cubic-bezier(.3,.7,.4,1); }\n.btn:active { transform: scale(.95); }' },
      { name:'バネで戻る', en:'Spring back', h:150, demo:'<button class="mo-btn mo-spring">ぽよん</button>', tags:['弾む'],
        init:(el) => { const b = $(el, 'button'); b.onclick = () => retrigger(b, 'go'); },
        desc:'押したあと、少し<b>行き過ぎてから戻る</b>。元気でポジティブな操作（いいね・追加・決定）に。', prompt:'ボタンを押したら、0.86倍に縮んでから1.08倍に膨らみ、元の大きさに落ち着くバネのような動きを付けて。',
        code:'@keyframes spring { 20% { transform: scale(.86); } 50% { transform: scale(1.08); } 72% { transform: scale(.97); } }\n.btn.go { animation: spring .55s cubic-bezier(.3,.7,.4,1); }' },
      { name:'ぷるん（ゼリー）', en:'Jelly press', h:150, demo:'<button class="mo-btn mo-jelly">ぷるん</button>', tags:['かわいい'],
        init:(el) => { const b = $(el, 'button'); b.onclick = () => retrigger(b, 'go'); },
        desc:'縦横に伸び縮みしてゼリーのように揺れる。子ども向け・ゲーム・かわいい系のサービスに。', prompt:'ボタンを押したら、縦横にぷるんと伸び縮みするゼリーのようなアニメーションにして。' },
      { name:'光の輪が広がる', en:'Glow pulse', h:150, demo:'<button class="mo-btn mo-glow">クリック</button>', tags:['控えめ'],
        init:(el) => { const b = $(el, 'button'); b.onclick = () => retrigger(b, 'go'); },
        desc:'押した瞬間に、ボタンの形の光がふわっと外へ広がって消える。リップルより落ち着いた反応。', prompt:'ボタンを押したら、ボタンの外側に向かって半透明の光の輪が広がって消えるアニメーションを付けて（box-shadowで）。',
        code:'@keyframes glow { from { box-shadow: 0 0 0 0 rgb(192 38 211 / .6); } to { box-shadow: 0 0 0 16px transparent; } }' },
      { name:'長押しで確定', en:'Hold to confirm', h:150, demo:'<button class="mo-btn mo-hold"><span>長押しで削除</span><span class="fill" aria-hidden="true">長押しで削除</span></button>', tags:['誤操作防止','話題'],
        init:(el) => { const b = $(el, 'button'), base = b.firstElementChild, fill = $(b, '.fill'); let t = null, done = false;
          const start = () => { if (done) return; b.classList.add('holding'); t = setTimeout(() => { done = true; b.classList.add('done'); fill.textContent = '✓ 削除しました'; setTimeout(() => { done = false; b.classList.remove('done', 'holding'); fill.textContent = '長押しで削除'; }, 1500); }, 1200); };
          const cancel = () => { if (done) return; clearTimeout(t); b.classList.remove('holding'); };
          b.addEventListener('pointerdown', start); ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, cancel));
          b.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) start(); }); b.addEventListener('keyup', cancel); },
        desc:'押し続けると色が満ちていき、<b>満タンで実行</b>。途中で離すとすっと戻る。削除・送金など取り消せない操作の誤タップを、確認ダイアログなしで防げる。', prompt:'削除ボタンを「長押しで確定」にして。押している1.2秒の間に左から赤い色が満ちていき、満タンで削除を実行、途中で離したら0.25秒で戻る。キーボードのSpace長押しにも対応して。',
        code:'.btn .fill { clip-path: inset(0 100% 0 0); transition: clip-path .25s ease-out; }\n.btn.holding .fill { clip-path: inset(0); transition: clip-path 1.2s linear; }' },
      { name:'スライドして確定', en:'Slide to confirm', h:150, demo:'<div class="mo-slide"><i class="fill"></i><span class="txt">スライドして支払う</span><button class="knob" aria-label="スライドして支払う">→</button></div>', tags:['決済','誤操作防止'],
        init:(el) => { const tr = $(el, '.mo-slide'), k = $(el, '.knob'), fill = $(el, '.fill'), txt = $(el, '.txt'); let x = 0, x0 = 0, drag = false; const max = () => tr.clientWidth - 54;
          const set = (v) => { x = v; k.style.transform = `translateX(${v}px)`; fill.style.width = (54 + v) + 'px'; txt.style.opacity = 1 - v / max() * 1.2; };
          k.addEventListener('pointerdown', (e) => { if (tr.classList.contains('done')) return; drag = true; x0 = e.clientX - x; k.setPointerCapture(e.pointerId); });
          k.addEventListener('pointermove', (e) => { if (drag) set(clamp(e.clientX - x0, 0, max())); });
          k.addEventListener('pointerup', () => { if (!drag) return; drag = false;
            if (x > max() * .88){ set(max()); tr.classList.add('done'); txt.style.opacity = 1; txt.textContent = '✓ 支払いが完了しました'; setTimeout(() => { tr.classList.remove('done'); txt.textContent = 'スライドして支払う'; k.animate([{ transform:`translateX(${x}px)` }, { transform:'translateX(0)' }], { duration:400, easing:'cubic-bezier(.2,.8,.2,1)' }); set(0); }, 1800); }
            else { k.animate([{ transform:`translateX(${x}px)` }, { transform:'translateX(0)' }], { duration:500, easing:'cubic-bezier(.34,1.56,.64,1)' }); fill.animate([{ width:(54 + x) + 'px' }, { width:'54px' }], { duration:500, easing:'cubic-bezier(.34,1.56,.64,1)' }); set(0); } }); },
        desc:'つまみを最後まで動かすと実行。途中で離すと<b>バネで戻る</b>。iPhoneの「スライドで電源オフ」と同じ考え方で、決済や重要な操作に。', prompt:'「スライドして支払う」コンポーネントを作って。つまみを右端の88%以上までドラッグしたら完了状態（緑・チェック）、途中で離したらバネのように左へ戻る。文字は光が流れるシマー表示で。' },
    ]},
    { title:'処理中 → 完了を見せる', items:[
      { name:'送信ボタンの変形', en:'Submit → loading → success', h:150, demo:'<button class="mo-btn mo-submit"><span class="lbl">送信する</span><i class="spin"></i><svg class="ok" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></button>', tags:['定番','フォーム'],
        init:(el) => { const b = $(el, 'button'); b.onclick = () => { if (b.className.match(/loading|done/)) return; b.classList.add('loading'); setTimeout(() => { b.classList.replace('loading', 'done'); setTimeout(() => b.classList.remove('done'), 1400); }, 1400); }; },
        desc:'押すと<b>丸く縮んでスピナー</b>になり、終わると緑のチェックに変わる。1つのボタンの中で「送信中・完了」まで伝えられる。押せない状態になるので二重送信も防げる。', prompt:'送信ボタンを押したら、幅が縮んで丸いスピナーになり、送信が成功したら緑の丸にチェックマークが描かれ、1.4秒後に元のボタンに戻るアニメーションにして。失敗時は赤くなって左右に震えるように。',
        code:'.btn { width:150px; transition: width .35s cubic-bezier(.65,0,.35,1), border-radius .35s, background .3s; }\n.btn.loading, .btn.done { width:44px; border-radius:22px; }\n.btn.done { background:#16a34a; }' },
      { name:'ダウンロード（矢印→完了）', en:'Download progress', h:150, demo:'<button class="mo-btn mo-dl"><svg viewBox="0 0 24 24"><path class="arr" d="M12 4v10M7.5 9.5L12 14l4.5-4.5"/><path class="tray" d="M5 19h14"/><path class="chk" d="M6 12.5l4 4 8-8"/></svg><span class="mo-swap t"><span>ダウンロード</span></span><i class="bar"></i></button>', tags:['進捗'],
        init:(el) => { const b = $(el, 'button'), t = $(el, '.t'); b.onclick = () => { if (b.className.match(/loading|done/)) return; b.classList.add('loading'); swapText(t, 'ダウンロード中…'); setTimeout(() => { b.classList.replace('loading', 'done'); swapText(t, '完了'); setTimeout(() => { b.classList.remove('done'); swapText(t, 'ダウンロード', -1); }, 1600); }, 1500); }; },
        desc:'矢印が下へ落ち続け、下端の線が伸びて進捗を示し、終わるとチェックに。文字も上下にスライドして切り替わる。', prompt:'ダウンロードボタンを押したら、矢印アイコンが下に落ち続けるアニメーションと、ボタン下端に伸びる進捗バーを表示し、完了したら緑の背景にチェックマーク、文字は「ダウンロード中…」→「完了」と縦にスライドして切り替えて。' },
      { name:'コピー → コピー済み', en:'Copy feedback', h:150, demo:`<button class="mo-btn ghost mo-copy"><span class="ic">${ICON.copy}${ICON.check}</span><span class="mo-swap t"><span>コピー</span></span></button>`, tags:['定番'],
        init:(el) => { const b = $(el, 'button'), t = $(el, '.t'); let busy = false; b.onclick = () => { if (busy) return; busy = true; b.classList.add('done'); swapText(t, 'コピーしました'); setTimeout(() => { b.classList.remove('done'); swapText(t, 'コピー', -1); busy = false; }, 1600); }; },
        desc:'アイコンが<b>ぼかしながら縮んで消え、チェックが弾んで現れる</b>。文字も差し替わる。コピーボタン・保存ボタンの定番の反応。', prompt:'コピーボタンを押したら、コピーアイコンがぼかしながら縮んで消え、緑のチェックがバネのように現れ、文字が「コピーしました」に縦スライドで切り替わり、1.6秒後に戻るようにして。',
        code:'.ic .check { opacity:0; transform:scale(.3); filter:blur(4px); transition:.3s cubic-bezier(.3,1.4,.5,1); }\n.done .ic .copy { opacity:0; transform:scale(.3); filter:blur(4px); }\n.done .ic .check { opacity:1; transform:none; filter:none; }' },
      { name:'紙飛行機が飛ぶ送信', en:'Send with paper plane', h:150, demo:'<button class="mo-btn mo-plane"><span class="pl" style="display:inline-flex"><svg viewBox="0 0 24 24"><path d="M21 3L10 14M21 3l-6.5 18-4.5-7-7-4.5z"/></svg></span><span class="mo-swap t"><span>送信</span></span></button>', tags:['メッセージ'],
        init:(el) => { const b = $(el, 'button'), pl = $(el, '.pl'), t = $(el, '.t'); let busy = false; b.onclick = () => { if (busy) return; busy = true;
          pl.animate([{ transform:'none', opacity:1 }, { transform:'translate(-3px, 3px) rotate(-12deg)', opacity:1, offset:.15 }, { transform:'translate(70px, -40px) rotate(12deg) scale(.6)', opacity:0, offset:.55 }, { transform:'translate(-30px, 0)', opacity:0, offset:.56 }, { transform:'none', opacity:1 }], { duration:1300, easing:'cubic-bezier(.4,0,.2,1)' });
          swapText(t, '送信しました'); setTimeout(() => { swapText(t, '送信', -1); busy = false; }, 1900); }; },
        desc:'押すと紙飛行機が<b>一瞬タメてから</b>右上へ飛び去り、左から戻ってくる。予備動作（タメ）があると勢いが伝わる。', prompt:'送信ボタンを押したら、紙飛行機アイコンが一瞬後ろに下がってから右上へ飛んでいき、左から戻ってくるアニメーションにして。文字は「送信しました」に切り替えて。' },
      { name:'カートに飛んでいく', en:'Add to cart (fly)', h:190, stage:'free', demo:`<div class="mo-cartdemo"><div class="prod"><div class="img"></div><b>ハンドドリップ</b><button class="mo-btn sm add">カートに追加</button></div><div class="cart">${ICON.cart}<b class="badge"><span class="mo-swap n"><span>0</span></span></b></div></div>`, tags:['EC','定番'],
        init:(el) => { const add = $(el, '.add'), cart = $(el, '.cart'), n = $(el, '.n'); let cnt = 0;
          add.onclick = () => { const r0 = el.getBoundingClientRect(), a = add.getBoundingClientRect(), c = cart.getBoundingClientRect();
            const x0 = a.left + a.width / 2 - r0.left, y0 = a.top + a.height / 2 - r0.top, x1 = c.left + c.width / 2 - r0.left, y1 = c.top + c.height / 2 - r0.top;
            const fly = document.createElement('i'); fly.className = 'mo-fly'; fly.innerHTML = '<i></i>'; fly.style.transform = `translate(${x0}px, ${y0}px)`; el.append(fly);
            fly.animate([{ transform:`translate(${x0}px, ${y0}px)` }, { transform:`translate(${x1}px, ${y0}px)` }], { duration:650, easing:'linear', fill:'forwards' });
            fly.firstChild.animate([{ transform:'translateY(0) scale(1)', easing:'cubic-bezier(.2,.8,.4,1)' }, { transform:`translateY(${Math.min(-40, y1 - y0 - 50)}px) scale(.9)`, offset:.4, easing:'cubic-bezier(.6,0,.8,.4)' }, { transform:`translateY(${y1 - y0}px) scale(.5)` }], { duration:650, fill:'forwards' })
              .onfinish = () => { fly.remove(); retrigger(cart, 'bump'); swapText(n, String(++cnt)); }; }; },
        desc:'追加した商品の「玉」が<b>放物線を描いてカートに飛び込み</b>、カートが揺れて数字が増える。何がどこに入ったかが直感的に分かる。放物線は「横はまっすぐ・縦は加減速」の2つの動きの組み合わせで作る。', prompt:'「カートに追加」を押したら、ボタンの位置から小さな丸が放物線を描いて右上のカートアイコンへ飛んでいき、到着したらカートが少し揺れてバッジの数字が縦スライドで増えるようにして（横は linear、縦は ease-out→ease-in の2つのアニメーションを重ねる）。' },
    ]},
    { title:'アイコンボタンの反応', items:[
      { name:'いいね（ハートがはじける）', en:'Like burst', h:160, demo:`<div class="mo-row"><button class="mo-like" aria-label="いいね" aria-pressed="false">${ICON.heart}<i class="ring"></i><span class="dots">${['#f91880','#fbbf24','#34d399','#60a5fa','#a78bfa','#fb7185','#f91880','#22d3ee'].map((c, i) => `<b style="--r:${i * 45}deg;--c:${c}"></b>`).join('')}</span></button><span class="mo-count"><span class="mo-swap n"><span>128</span></span></span></div>`, tags:['SNSで定番','話題'],
        init:(el) => { const b = $(el, '.mo-like'), n = $(el, '.n'); let c = 128; b.onclick = () => { const on = !b.classList.contains('on'); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); c += on ? 1 : -1; swapText(n, String(c), on ? 1 : -1, false); }; },
        desc:'ハートが小さい状態から<b>はじけるように拡大</b>し、同時に輪が広がり、色とりどりの粒が飛び散る。数字は増えたら上へ、減ったら下へスライド。SNSで最もよく知られたマイクロインタラクション。', prompt:'いいねボタンを押したら、ハートが0.2倍から1.25倍に弾けて赤く塗られ、同時にピンクの輪が広がって消え、8方向に色とりどりの小さな丸が飛び散るアニメーションにして。いいね数は増えたら上へ、取り消したら下へスライドして変わるように。' },
      { name:'ブックマーク保存', en:'Bookmark', h:150, demo:'<div class="mo-row"><button class="mo-bm" aria-label="保存"><svg viewBox="0 0 24 24"><path d="M6.5 3.5h11v17l-5.5-3.8-5.5 3.8z"/></svg></button><span class="mo-chip-msg">保存しました</span></div>', tags:['保存'],
        init:(el) => { const b = $(el, '.mo-bm'), m = $(el, '.mo-chip-msg'); let t; b.onclick = () => { const on = b.classList.toggle('on'); m.textContent = on ? '保存しました' : '保存を解除しました'; m.classList.add('on'); clearTimeout(t); t = setTimeout(() => m.classList.remove('on'), 1300); }; },
        desc:'アイコンが<b>ぴょんと跳ねて</b>塗りつぶされ、横に小さなメッセージが出る。', prompt:'ブックマークボタンを押したら、アイコンが上にぴょんと跳ねてから着地して塗りつぶされ、横に「保存しました」のピルが1.3秒だけ表示されるようにして。' },
      { name:'ゴミ箱のふたが開く', en:'Trash lid', h:150, demo:'<button class="mo-trash" aria-label="削除"><svg viewBox="0 0 24 24"><g class="lid"><path d="M4 7h16M9.5 4h5"/></g><path d="M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg></button>', tags:['ホバー'], hint:'ホバー→クリック',
        init:(el) => { const b = $(el, 'button'); b.onclick = () => retrigger(b, 'go'); },
        desc:'ホバーで<b>ふたが少し開き</b>、押すと揺れる。アイコンの一部だけを動かすと、何が起きるかを予告できる。', prompt:'ゴミ箱アイコンのボタンにホバーしたら、ふたの部分だけが右端を支点に少し開いて赤くなり、クリックすると左右に揺れるようにして（SVGのふたをグループにして transform-origin を指定）。' },
      { name:'再生 ⇄ 一時停止', en:'Play / pause morph', h:150, demo:'<button class="mo-pp" aria-label="再生"><i class="l"></i><i class="r"></i></button>', tags:['メディア'],
        init:(el) => { const b = $(el, 'button'); b.onclick = () => { const on = b.classList.toggle('on'); b.setAttribute('aria-label', on ? '一時停止' : '再生'); }; },
        desc:'三角形（再生）が<b>2本の棒（一時停止）に変形</b>する。2つの図形の頂点を clip-path で動かすと、形が滑らかにつながる。', prompt:'再生ボタンを押すと、三角形のアイコンが2本の縦棒（一時停止）に滑らかに変形し、もう一度押すと戻るようにして（左右2つの要素の clip-path: polygon() を同じ頂点数で切り替える）。',
        code:'.l { clip-path: polygon(0 0, 100% 25%, 100% 75%, 0 100%); }\n.r { clip-path: polygon(0 25%, 100% 50%, 100% 50%, 0 75%); }\n.on .l, .on .r { clip-path: polygon(15% 0, 85% 0, 85% 100%, 15% 100%); }\n/* transition: clip-path .35s */' },
      { name:'数量の数字が転がる', en:'Directional number', h:150, demo:'<div class="mo-qty"><button aria-label="減らす">−</button><span class="mo-swap n"><span>1</span></span><button aria-label="増やす">＋</button></div>', tags:['カート','方向'],
        init:(el) => { const [m, p] = $$(el, 'button'), n = $(el, '.n'); let v = 1; m.onclick = () => { if (v <= 0) return; swapText(n, String(--v), -1, false); }; p.onclick = () => { if (v >= 99) return; swapText(n, String(++v), 1, false); }; },
        desc:'増やすと数字が<b>下から上へ</b>、減らすと<b>上から下へ</b>入れ替わる。動きの向きが操作の意味と一致していると、無意識に理解しやすい。', prompt:'数量ステッパーの数字を、＋で増えたときは下から上へ、−で減ったときは上から下へスライドして入れ替わるようにして。ボタンは押したとき0.85倍に縮むように。' },
      { name:'フォロー（幅も滑らかに）', en:'Follow toggle (width)', h:150, demo:'<button class="mo-btn mo-follow"><span class="mo-swap t"><span>フォローする</span></span></button>', tags:['SNS'],
        init:(el) => { const b = $(el, 'button'), t = $(el, '.t'); b.onclick = () => { const on = !b.classList.contains('on'); const next = on ? '✓ フォロー中' : 'フォローする';
          const clone = b.cloneNode(true); clone.classList.toggle('on', on); clone.querySelector('.t').innerHTML = `<span>${next}</span>`; clone.style.cssText = 'position:absolute;visibility:hidden;width:auto'; b.parentNode.append(clone); const w1 = clone.offsetWidth; clone.remove();
          b.style.width = b.offsetWidth + 'px'; void b.offsetWidth; b.style.width = w1 + 'px'; b.classList.toggle('on', on); swapText(t, next, on ? 1 : -1);
          b.addEventListener('transitionend', function te(e){ if (e.propertyName === 'width'){ b.style.width = ''; b.removeEventListener('transitionend', te); } }); }; },
        desc:'文字の長さが変わっても、ボタンの<b>幅がパッと変わらず滑らかに</b>伸び縮みする。<code>width: auto</code> は通常アニメーションできないので、変更後の幅を測ってから動かす。', prompt:'フォローボタンを押したら「フォローする」→「✓ フォロー中」に変わるようにして。文字が縦にスライドして入れ替わり、ボタンの幅は変更後の幅を測ってから0.3秒で滑らかに変化、見た目は塗り→枠線に切り替えて。' },
    ]},
    { title:'お祝い', items:[
      { name:'紙吹雪ボタン', en:'Confetti burst', h:200, stage:'free', demo:'<div style="position:absolute;inset:0;display:grid;place-items:center"><button class="mo-btn">🎉 完了！</button></div>', tags:['達成感'],
        init:(el) => { const L = confettiLayer(el), b = $(el, 'button'); b.onclick = () => { const r = el.getBoundingClientRect(), a = b.getBoundingClientRect(); L.burst(a.left + a.width / 2 - r.left, a.top - r.top, 70, -90, 80, 620); }; return L.stop; },
        desc:'押した場所から<b>紙吹雪がはじける</b>。目標達成・購入完了・初回登録など「おめでとう」の瞬間に。毎回出すとしつこいので、特別な場面だけに。canvas-confettiライブラリなら1行で使える。', prompt:'タスクを全部完了したら、完了ボタンの位置から上に向かって紙吹雪が70個はじけ、重力で落ちながら回転して消える演出を入れて（canvas-confetti を使ってもよい）。' },
    ]},
  ]
});

/* ---------- 状態が変わる ---------- */
function segPill(box, onChange){
  const pill = $(box, '.pill'), bs = $$(box, 'button');
  const go = (b, instant) => { if (instant) pill.style.transition = 'none'; pill.style.width = b.offsetWidth + 'px'; pill.style.transform = `translateX(${b.offsetLeft - 4}px)`; bs.forEach(x => x.classList.toggle('on', x === b)); if (instant){ void pill.offsetWidth; pill.style.transition = ''; } };
  bs.forEach((b, i) => b.onclick = () => { go(b); onChange && onChange(i); });
  requestAnimationFrame(() => go($(box, 'button.on') || bs[0], true));
}
TABS.push({
  id:'state', label:'状態が変わる', icon:'⇄',
  intro:'ON/OFF・選択・数値・入力結果など、<b>状態が変わったことを伝える</b>アニメーション。パッと切り替えるより、何がどう変わったかが目で追えるようになります。',
  sections:[
    { title:'切り替え', items:[
      { name:'伸びるつまみのスイッチ', en:'Stretchy toggle', h:150, demo:'<div class="mo-col"><label class="mo-sw"><input type="checkbox" role="switch" aria-label="通知"><span></span></label><span class="mo-lbl">押している間、つまみが伸びる</span></div>', tags:['iOS風','CSSのみ'],
        desc:'押している間は<b>つまみが横に伸び</b>、離すとバネで反対側へ。iOSのスイッチと同じ手触りで、指で押している感覚が出る。', prompt:'トグルスイッチを、押している間だけつまみが横に伸び、切り替わるときは少し行き過ぎて戻るバネの動きにして（:active で幅を変え、left を cubic-bezier(.3,1.4,.5,1) で動かす）。',
        code:'.knob { left:4px; width:24px; transition: left .32s cubic-bezier(.3,1.4,.5,1), width .2s; }\ninput:active + .track .knob { width:32px; }\ninput:checked + .track .knob { left:28px; }\ninput:checked:active + .track .knob { left:20px; }' },
      { name:'昼 ⇄ 夜のトグル', en:'Day / night switch', h:150, demo:'<label class="mo-dn" aria-label="ダークモード"><input type="checkbox"><span class="sky"><i class="sun"><i class="crater" style="left:8px;top:9px;width:7px;height:7px"></i><i class="crater" style="left:18px;top:19px;width:9px;height:9px"></i><i class="crater" style="left:20px;top:6px;width:4px;height:4px"></i></i><i class="star" style="left:16px;top:10px"></i><i class="star" style="left:28px;top:26px;transition-delay:.1s"></i><i class="star" style="left:40px;top:14px;transition-delay:.2s"></i><i class="star" style="left:22px;top:34px;transition-delay:.15s"></i><i class="cloud"></i></span></label>', tags:['テーマ切替','CSSのみ'],
        desc:'太陽が転がって<b>クレーターのある月</b>に変わり、空が夜になって星が現れ、雲が沈む。ダークモード切替を楽しい体験にする定番の演出。', prompt:'ダークモードの切り替えスイッチを、昼は水色の空に黄色い太陽と雲、押すと太陽が右へ転がりながらクレーターのある灰色の月に変わり、空が紺色になって星がふわっと現れるデザインにして。CSSだけで。' },
      { name:'チェックして線を引く', en:'Checkbox + strikethrough', h:170, demo:'<ul class="mo-todo">' + ['牛乳を買う', '資料を送る', 'ジムに行く'].map(t => `<li><label><input type="checkbox"><svg viewBox="0 0 24 24"><rect x="2.5" y="2.5" width="19" height="19" rx="6"/><path d="M7 12.5l3.5 3.5L17 8.5"/></svg><span>${t}</span></label></li>`).join('') + '</ul>', tags:['ToDo','CSSのみ'],
        desc:'チェックの印が<b>ペンで描くように</b>現れ、少し遅れて文字に取り消し線が左から引かれる。完了の気持ちよさが増す。', prompt:'ToDoのチェックボックスを、チェックすると枠が塗られてチェックマークが線を描くように現れ、その0.1秒後に文字に左から取り消し線が引かれてグレーになるアニメーションにして（SVGの stroke-dashoffset と ::after の scaleX）。' },
      { name:'滑るセグメント', en:'Sliding segmented control', h:140, demo:'<div class="mo-seg"><i class="pill"></i><button class="on">日</button><button>週</button><button>月</button><button>年</button></div>', tags:['選択'],
        init:(el) => segPill($(el, '.mo-seg')),
        desc:'選択中の白い背景が、<b>少し弾みながら</b>次の選択肢へ滑っていく。どこからどこへ切り替わったかが目で追える。', prompt:'セグメンテッドコントロールの選択中の背景（ピル）を、クリックした項目の位置と幅に合わせて、少し弾むイージングで滑らかに移動させて。' },
      { name:'伸び縮みするタブの下線', en:'Stretchy tab indicator', h:140, demo:'<div class="mo-tabs"><button class="on">ホーム</button><button>検索</button><button>通知</button><button>設定</button><i class="ind"></i></div>', tags:['タブ','細部'],
        init:(el) => { const box = $(el, '.mo-tabs'), ind = $(el, '.ind'), bs = $$(box, 'button'); let cur = 0;
          const place = (i, instant) => { const b = bs[i]; const dir = i > cur ? 1 : -1; ind.style.transitionDelay = instant ? '0s' : (dir > 0 ? '.1s, 0s' : '0s, .1s'); if (instant) ind.style.transition = 'none'; ind.style.left = b.offsetLeft + 'px'; ind.style.right = (box.clientWidth - b.offsetLeft - b.offsetWidth) + 'px'; bs.forEach((x, j) => x.classList.toggle('on', j === i)); cur = i; if (instant){ void ind.offsetWidth; ind.style.transition = ''; } };
          bs.forEach((b, i) => b.onclick = () => place(i)); requestAnimationFrame(() => place(0, true)); },
        desc:'下線が<b>進む方向の端から先に伸び</b>、あとから反対側が追いつく。ただ平行移動するより、生き物のような勢いが出る。左右の端を別々のタイミングで動かすだけで作れる。', prompt:'タブの下線インジケーターを、移動先の方向の端が先に伸び、0.1秒遅れて反対側の端が追いつく「伸び縮みする」動きにして（left と right を別々の transition-delay で動かす）。' },
      { name:'アコーディオン（高さ auto へ）', en:'Accordion height:auto', h:200, demo:'<div class="mo-acc">' + [['送料はいくら？', '5,000円以上のご注文で送料無料です。それ未満は全国一律550円です。'], ['返品できますか？', '到着後14日以内なら、未使用品に限り返品できます。'], ['支払い方法は？', 'クレジットカード・コンビニ払い・銀行振込に対応しています。']].map((q, i) => `<div class="it${i === 0 ? ' open' : ''}"><button class="hd">${q[0]}<svg class="chev mo-ic" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></button><div class="bd"><div><p>${q[1]}</p></div></div></div>`).join('') + '</div>', tags:['FAQ'],
        init:(el) => $$(el, '.it').forEach(it => $(it, '.hd').onclick = () => { const open = !it.classList.contains('open'); $$(el, '.it').forEach(x => x.classList.remove('open')); it.classList.toggle('open', open); }),
        desc:'中身の高さに合わせて<b>なめらかに開閉</b>し、中の文字が少し遅れてふわっと現れる。<code>grid-template-rows: 0fr → 1fr</code> の技で、高さを測らずに height:auto 相当のアニメーションができる（新しいChromeでは <code>interpolate-size</code> でも可）。', prompt:'FAQのアコーディオンを、開くときに中身の高さまで0.35秒でなめらかに広がり、文字は少し遅れてフェードインするようにして。grid-template-rows を 0fr→1fr に変える方法で、1つ開くと他は閉じるように。',
        code:'.body { display:grid; grid-template-rows:0fr; transition: grid-template-rows .35s; }\n.body > div { overflow:hidden; }\n.open .body { grid-template-rows:1fr; }\n/* 新しいCSS：:root { interpolate-size: allow-keywords; } で height:0 → auto も可 */' },
      { name:'ハンバーガー → 矢印 → ×', en:'Icon morph', h:150, demo:'<div class="mo-col"><button class="mo-burger" aria-label="メニュー"><i></i><i></i><i></i></button><span class="mo-lbl st">≡ メニュー</span></div>', tags:['アイコン変形'],
        init:(el) => { const b = $(el, '.mo-burger'), st = $(el, '.st'); const s = [['', '≡ メニュー'], ['arrow', '← 戻る'], ['close', '× 閉じる']]; let k = 0; b.onclick = () => { k = (k + 1) % 3; b.className = 'mo-burger ' + s[k][0]; st.textContent = s[k][1]; }; },
        desc:'3本線が<b>矢印や×に変形</b>する。メニューを開いた・戻れる、という状態の変化をアイコン自体が伝える。', prompt:'ハンバーガーアイコンを、メニューを開いたら3本線が×に変形し、詳細画面では←矢印に変形するようにして。線ごとに transform と幅をアニメーションさせて。' },
    ]},
    { title:'数値・量の変化', items:[
      { name:'数字が流れるように変わる', en:'Number flow / odometer', h:190, demo:'<div class="mo-price"><div class="mo-seg"><i class="pill"></i><button class="on">月払い</button><button>年払い</button></div><div class="big"><span class="mo-num p"></span><small>/ 月</small></div><span class="mo-lbl note">いつでも解約できます</span></div>', tags:['料金表','話題'],
        init:(el) => { const p = $(el, '.p'), note = $(el, '.note'); setNum(p, '¥1,480'); segPill($(el, '.mo-seg'), (i) => { setNum(p, i ? '¥1,180' : '¥1,480'); note.textContent = i ? '年払いで20%お得（¥14,160/年）' : 'いつでも解約できます'; }); },
        desc:'数字が<b>桁ごとにスロットのように回転</b>して新しい値になる。料金の月払い/年払い切替やカウンターで、変化の大きさが直感的に伝わる。NumberFlow などのライブラリでも作れる。', prompt:'料金表で「月払い／年払い」を切り替えたら、価格の数字が桁ごとに縦に回転して新しい金額になるアニメーションにして（各桁を0〜9の縦の列にして translateY で動かす。桁ごとに45msずつ遅らせる）。' },
      { name:'通知バッジがポンと増える', en:'Badge bump', h:150, demo:`<div class="mo-row"><div class="mo-bell">${ICON.bell}<b class="badge"><span class="mo-swap n"><span>0</span></span></b></div><button class="mo-btn sm">通知を受信</button></div>`, tags:['通知'],
        init:(el) => { const bell = $(el, '.mo-bell'), badge = $(el, '.badge'), n = $(el, '.n'); let c = 0; $(el, '.mo-btn').onclick = () => { c++; badge.classList.add('on'); swapText(n, String(c), 1, false); retrigger(badge, 'pop'); retrigger(bell, 'go'); }; },
        desc:'バッジが<b>弾んで現れ、数字が上に入れ替わり</b>、ベルが揺れる。新着があったことを、うるさすぎずに知らせる。', prompt:'新しい通知が届いたら、ベルアイコンが左右に揺れ、右上の赤いバッジが弾むように拡大して数字が下から上に入れ替わるようにして。0件のときはバッジを縮めて隠して。' },
      { name:'パスワード強度メーター', en:'Strength meter', h:170, demo:'<div class="mo-pw"><input type="text" placeholder="パスワードを入力してみて" aria-label="パスワード"><div class="segs"><i></i><i></i><i></i><i></i></div><div class="meta"><span class="mo-swap lv"><span>未入力</span></span><span class="hint">8文字以上・数字・大文字・記号</span></div></div>', tags:['フォーム'],
        init:(el) => { const inp = $(el, 'input'), segs = $$(el, '.segs i'), lv = $(el, '.lv'); const L = [['未入力', '#94a3b8'], ['弱い', '#ef4444'], ['ふつう', '#f97316'], ['強い', '#eab308'], ['とても強い', '#16a34a']]; let last = 0;
          inp.oninput = () => { const v = inp.value; const s = !v ? 0 : [v.length >= 8, /\d/.test(v), /[A-Z]/.test(v), /[^A-Za-z0-9]/.test(v)].filter(Boolean).length || 1;
            segs.forEach((g, i) => { g.style.setProperty('--c', L[s][1]); g.classList.toggle('on', i < s); });
            if (s !== last){ swapText(lv, `<b style="color:${L[s][1]}">${L[s][0]}</b>`, s > last ? 1 : -1); last = s; } }; },
        desc:'条件を満たすごとに<b>バーが1本ずつ伸びて色が変わり</b>、評価の文字も切り替わる。入力しながら改善できるので、エラーを出すより親切。', prompt:'パスワード入力欄の下に4本の強度バーを付けて。8文字以上・数字・大文字・記号を満たした数だけバーが左から伸び、弱い=赤→ふつう=橙→強い=黄→とても強い=緑と色が変わり、評価の文字も縦スライドで切り替わるように。' },
      { name:'音量スライダー', en:'Volume slider', h:140, demo:'<div class="mo-vol" data-lv="2"><svg viewBox="0 0 24 24"><path d="M4 9.5h3.5L12 5v14l-4.5-4.5H4z"/><path class="w w1" d="M15 9.5a3.5 3.5 0 0 1 0 5"/><path class="w w2" d="M17.5 7.5a6.5 6.5 0 0 1 0 9"/><path class="w w3" d="M20 5.5a9.5 9.5 0 0 1 0 13"/><path class="x" d="M16 9.5l5 5M21 9.5l-5 5"/></svg><input type="range" value="60" aria-label="音量"></div>', tags:['メディア'],
        init:(el) => { const box = $(el, '.mo-vol'), r = $(el, 'input'); const up = () => { box.style.setProperty('--v', r.value + '%'); box.dataset.lv = r.value == 0 ? 0 : r.value < 34 ? 1 : r.value < 67 ? 2 : 3; }; r.oninput = up; up(); },
        desc:'つかむと<b>バーが太くなり、つまみが大きく</b>なる。音量に合わせてスピーカーの音波の本数が変わり、0で×になる。', prompt:'音量スライダーを、ドラッグ中はバーが太くなってつまみが1.3倍になり、値に応じてスピーカーアイコンの音波が0〜3本に変わる（0のときは×印）ようにして。' },
    ]},
    { title:'進行・入力の結果', items:[
      { name:'ステップの線が伸びる', en:'Progress steps', h:160, demo:'<div class="mo-col" style="width:100%"><div class="mo-steps">' + [1, 2, 3, 4].map((n, i) => (i ? '<span class="line"><i></i></span>' : '') + `<span class="dot${i === 0 ? ' cur' : ''}">${n}<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>`).join('') + '</div><div class="mo-row"><button class="mo-btn sm ghost">戻る</button><button class="mo-btn sm">次へ</button></div></div>', tags:['手続き'],
        init:(el) => { const dots = $$(el, '.dot'), lines = $$(el, '.line'); let k = 0; const draw = () => { dots.forEach((d, i) => { d.classList.toggle('done', i < k); d.classList.toggle('cur', i === k); }); lines.forEach((l, i) => l.classList.toggle('on', i < k)); }; const [b, n] = $$(el, '.mo-btn'); b.onclick = () => { k = Math.max(0, k - 1); draw(); }; n.onclick = () => { k = Math.min(4, k + 1); draw(); }; },
        desc:'完了したステップに<b>チェックが描かれ</b>、次のステップへ向かって線が伸びる。どこまで進んだかと、達成感の両方を伝える。', prompt:'購入手続きのステッパーで「次へ」を押したら、現在の丸が塗られてチェックマークが描かれ、次の丸までの線が左から伸び、次の丸が強調されるアニメーションにして。' },
      { name:'スケルトン → 内容', en:'Skeleton to content', h:170, demo:'<div class="mo-col" style="width:100%"><div class="mo-skel loading"><div class="av" style="--avc:#c026d3">山</div><div class="lines"><div class="ln" style="width:55%"><b>山田 花子</b></div><div class="ln" style="width:90%"><span>新しいデザイン案を共有しました</span></div><div class="ln" style="width:35%"><small>2分前</small></div></div></div><button class="mo-btn sm ghost">再読み込み</button></div>', tags:['読み込み'],
        init:(el) => { const card = $(el, '.mo-skel'), parts = [$(el, '.av'), ...$$(el, '.ln')]; let t; const load = () => { card.classList.add('loading'); parts.forEach(p => p.classList.remove('reveal')); clearTimeout(t); t = setTimeout(() => { card.classList.remove('loading'); parts.forEach((p, i) => { p.style.setProperty('--i', i); p.classList.add('reveal'); }); }, 1400); }; $(el, '.mo-btn').onclick = load; load(); return () => clearTimeout(t); },
        desc:'読み込み中の灰色の形（スケルトン）から、<b>中身がぼかしを解きながら順番に</b>現れる。パッと入れ替わるより、待ち時間が短く感じる。', prompt:'データの読み込み中はシマー付きのスケルトンを表示し、読み込みが終わったら、アバター→名前→本文→時刻の順に70msずつ遅らせて、ぼかしが解けながら下からふわっと表示されるようにして。' },
      { name:'入力エラー（震え＋メッセージ）', en:'Validation error', h:170, demo:'<div class="mo-field"><div class="rowi"><input type="email" placeholder="メールアドレス" aria-label="メールアドレス"><button class="mo-btn sm">登録</button></div><div class="msg"><div>正しいメールアドレスを入力してください（例：name@example.com）</div></div></div>', tags:['フォーム'],
        init:(el) => { const f = $(el, '.mo-field'), inp = $(el, 'input'); const ok = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value); $(el, '.mo-btn').onclick = () => { if (ok()){ f.classList.remove('err'); f.classList.add('ok'); } else { f.classList.add('err'); f.classList.remove('ok'); retrigger(f, 'shake'); } }; inp.oninput = () => { if (f.classList.contains('err') && ok()){ f.classList.remove('err'); f.classList.add('ok'); } }; },
        desc:'送信時に間違いがあると、入力欄が<b>首を振るように震え</b>、赤枠になり、下からメッセージがせり出す。直すとすぐに緑に戻る。', prompt:'フォームの送信時に入力が不正なら、入力欄を左右に小刻みに震わせて赤い枠にし、欄の下にエラーメッセージを高さアニメーション付きでせり出させて。正しく直したら、その場で緑の枠に戻してメッセージを閉じて。' },
      { name:'自動保存のインジケーター', en:'Autosave status', h:170, demo:'<div class="mo-auto"><textarea placeholder="何か入力してみて（自動保存されます）" aria-label="メモ"></textarea><div class="st"><span class="mo-swap s"><span>変更はありません</span></span></div></div>', tags:['エディタ'],
        init:(el) => { const ta = $(el, 'textarea'), s = $(el, '.s'); let t, state = 0; ta.oninput = () => { if (state !== 1){ swapText(s, '<span style="display:inline-flex;gap:6px;align-items:center"><i class="pdot"></i>保存中…</span>'); state = 1; } clearTimeout(t); t = setTimeout(() => { swapText(s, '<span style="color:#16a34a">✓ 保存しました</span>'); state = 2; }, 900); }; return () => clearTimeout(t); },
        desc:'入力中は<b>点が脈打つ「保存中…」</b>、手を止めると「✓ 保存しました」に変わる。保存ボタンがなくても安心できる。', prompt:'メモ欄に自動保存を付けて。入力中は「保存中…」と点滅する丸を表示し、入力が0.9秒止まったら保存して「✓ 保存しました」に縦スライドで切り替えて（デバウンス）。' },
      { name:'星が波打つ評価', en:'Star rating wave', h:150, demo:'<div class="mo-col"><div class="mo-stars">' + [0, 1, 2, 3, 4].map(i => `<span style="--i:${i}">★</span>`).join('') + '</div><span class="mo-lbl v">ホバーしてクリック</span></div>', tags:['レビュー'],
        init:(el) => { const ss = $$(el, '.mo-stars span'), v = $(el, '.v'); let val = 0; ss.forEach((s, i) => { s.onmouseenter = () => ss.forEach((x, j) => x.classList.toggle('hot', j <= i)); s.onclick = () => { val = i + 1; ss.forEach((x, j) => { x.classList.toggle('on', j < val); x.classList.remove('pop'); }); ss.slice(0, val).forEach(x => retrigger(x, 'pop')); v.textContent = ['', 'いまいち', 'ふつう', 'よい', 'とてもよい', '最高！'][val]; }; }); $(el, '.mo-stars').onmouseleave = () => ss.forEach(x => x.classList.remove('hot')); },
        desc:'ホバーすると星が<b>左から順に波のように</b>持ち上がり、クリックで回転しながら確定する。順番の遅延（スタッガー）で生き生きとした印象に。', prompt:'星5つの評価で、ホバーした星までが左から35msずつ遅れて1.2倍に持ち上がり、クリックしたら選んだ星が順番に回転しながら弾んで確定するようにして。評価に応じた言葉も表示して。' },
      { name:'カードが広がる（レイアウト変化）', en:'Expand card (FLIP)', h:210, stage:'free', demo:'<div class="mo-cards">' + [['#c026d3', '企画', 'アイデアを整理して、作るものを決めます。ターゲットと目的をはっきりさせましょう。'], ['#0ea5e9', '実装', 'AIと一緒にコードを書きます。小さく作って動かすのがコツです。'], ['#16a34a', '公開', 'チェックリストで確認してから世に出します。']].map(c => `<div class="cd" style="background:${c[0]}"><b>${c[1]}</b><span>クリックで詳細</span><p>${c[2]}</p></div>`).join('') + '</div>', tags:['レイアウト','FLIP'],
        init:(el) => { const cds = $$(el, '.cd'); cds.forEach(c => c.onclick = () => flip(cds, () => { const on = !c.classList.contains('big'); cds.forEach(x => x.classList.remove('big')); c.classList.toggle('big', on); })); },
        desc:'クリックしたカードが<b>横いっぱいに広がり</b>、他のカードは押し出されるように滑らかに移動する。レイアウトが変わる前後の位置を測り、差を transform でつなぐ「FLIP」という手法。Motion（旧Framer Motion）の <code>layout</code> 属性なら自動。', prompt:'カードをクリックしたら横幅いっぱいに広がって詳細文が表示され、他のカードは新しい位置へ滑らかに移動するようにして。FLIP（変更前後の位置を測って transform でアニメーション）で実装して。Reactなら Motion の layout を使って。',
        code:"function flip(els, change) {\n  const first = els.map(e => e.getBoundingClientRect());\n  change();                                   // レイアウトを変える\n  els.forEach((e, i) => {\n    const last = e.getBoundingClientRect(), f = first[i];\n    e.animate([{ transform: `translate(${f.left - last.left}px, ${f.top - last.top}px)` }, { transform: 'none' }],\n      { duration: 480, easing: 'cubic-bezier(.2,.8,.2,1)' });\n  });\n}" },
    ]},
  ]
});
})();
