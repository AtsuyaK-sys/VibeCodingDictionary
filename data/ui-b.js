/* UIコンポーネント辞典 — 追加分：スマホの部品 / 複雑な画面部品 */
(function(){
const $ = (el, s) => el.querySelector(s), $$ = (el, s) => [...el.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const T = (name, en, desc, prompt, tags, more) => Object.assign({ name, en, desc, prompt, tags }, more || {});
const ITEMS = ['朝ごはんの記録', '買い物リスト', '読みたい本', '旅行の計画', '週末の予定', '勉強ノート'];
const listHTML = (n = 6) => ITEMS.slice(0, n).map((t, i) => `<div class="ub-item"><span class="ub-thumb" style="filter:hue-rotate(${i * 45}deg)"></span><div><b>${t}</b><small>${i + 1}時間前に更新</small></div></div>`).join('');

/* ================= スマホの部品 ================= */
TABS.push({ id:'mobile', label:'スマホの部品', icon:'📱',
  intro:'スマホの画面は小さく、<b>指で操作し、マウスのホバーがない</b>のがパソコンとの大きな違いです。下から出るシート、スワイプ、引っぱって更新など、スマホならではの部品を集めました。見本は<b>マウスでドラッグ</b>しても試せます。スワイプなどの<b>ジェスチャーには、必ずボタンでの代わりの方法</b>を用意します（<a href="accessibility.html#keyboard">アクセシビリティ辞典</a>）。',
  sections:[
    { title:'下から出る部品', items:[
      { name:'ボトムシート', en:'Bottom Sheet', h:420, tags:['スマホ','最頻出'],
        demo:'<div class="ub-phone"><div class="ub-bar">お店をさがす<button class="uc-btn sm op" style="margin-left:auto">絞り込み</button></div><div class="ub-body">' + listHTML() + '<div class="ub-scrim"></div><div class="ub-sheet" role="dialog" aria-label="絞り込み"><button class="ub-grab" aria-label="シートの高さを切り替える"><i></i></button><div class="in"><b>絞り込み</b><div class="ub-chips"><span>営業中</span><span>駅から5分</span><span>予約できる</span><span>カード可</span></div><div class="ub-st">取っ手を上下にドラッグ（または押す）で高さが変わります。下まで下げると閉じます。</div><button class="uc-btn sm cl">閉じる</button></div></div></div></div>',
        init:(el) => { const sh = $(el, '.ub-sheet'), sc = $(el, '.ub-scrim'), body = $(el, '.ub-body'), SN = [35, 60, 92]; let snap = 1, open = false;
          const set = (o, s) => { open = o; if (s !== undefined) snap = s; sh.style.height = SN[snap] + '%'; sh.style.transform = o ? 'translateY(0)' : 'translateY(105%)'; sc.classList.toggle('on', o); };
          $(el, '.op').onclick = () => set(true, 1); sc.onclick = () => set(false); $(el, '.cl').onclick = () => set(false);
          const g = $(el, '.ub-grab'); let y0 = 0, h0 = 0, moved = false;
          g.onpointerdown = (e) => { g.setPointerCapture(e.pointerId); y0 = e.clientY; h0 = sh.getBoundingClientRect().height; moved = false; sh.classList.add('drag'); };
          g.onpointermove = (e) => { if (!g.hasPointerCapture(e.pointerId)) return; const dy = e.clientY - y0; if (Math.abs(dy) > 4) moved = true; const H = body.clientHeight; sh.style.height = Math.max(40, Math.min(H * .95, h0 - dy)) + 'px'; };
          g.onpointerup = (e) => { sh.classList.remove('drag'); if (!moved){ set(true, (snap + 1) % 3); return; } const pct = sh.getBoundingClientRect().height / body.clientHeight * 100; if (pct < 22) return set(false); let best = 0; SN.forEach((s, i) => { if (Math.abs(s - pct) < Math.abs(SN[best] - pct)) best = i; }); set(true, best); }; },
        desc:'画面の下から出てくるパネル。地図アプリの店の詳細、絞り込み、共有メニューなど。<b>決まった高さ（スナップ位置）に吸い付く</b>、下にスワイプで閉じる、背景を押しても閉じる、が定番の動きです。',
        prompt:'スマホ向けにボトムシートを作って。高さは「少し・半分・全画面」の3段階に吸い付き、取っ手を上下にドラッグして変えられる。下まで下げるか背景を押すと閉じる。Escキーと「閉じる」ボタンでも閉じられ、開いている間は後ろを操作できないようにして。' },
      { name:'アクションシート', en:'Action Sheet', h:380, tags:['スマホ','iOS'],
        demo:'<div class="ub-phone"><div class="ub-bar">写真<button class="uc-btn sm ghost op" style="margin-left:auto" aria-label="その他の操作">⋯</button></div><div class="ub-body"><div style="height:100%;background:linear-gradient(135deg,#fde68a,#f472b6 60%,#7c3aed)"></div><div class="ub-scrim"></div><div class="ub-as" role="dialog" aria-label="写真の操作"><div class="grp"><div class="t">この写真をどうしますか？</div><button>共有する</button><button>アルバムに追加</button><button class="red">削除する</button></div><button class="cancel">キャンセル</button></div></div></div>',
        init:(el) => { const as = $(el, '.ub-as'), sc = $(el, '.ub-scrim'); const set = (o) => { as.classList.toggle('on', o); sc.classList.toggle('on', o); };
          $(el, '.op').onclick = () => set(true); sc.onclick = () => set(false); $$(el, '.ub-as button').forEach(b => b.onclick = () => set(false)); },
        desc:'操作の選択肢を下から並べて出すメニュー（iOS でよく使われる形）。<b>危ない操作は赤</b>、<b>キャンセルは離して下に</b>置き、うっかり押しにくくします。Android ではボトムシートで同じ役割を果たすことが多いです。',
        prompt:'写真の「⋯」ボタンを押したら、下からアクションシートを出して。選択肢は「共有する」「アルバムに追加」「削除する（赤）」、少し離して「キャンセル」。削除を選んだら確認ダイアログを出して。' },
    ] },
    { title:'指の動き（ジェスチャー）', items:[
      { name:'スワイプで操作', en:'Swipe Actions', h:400, tags:['スマホ','ジェスチャー'],
        demo:'<div class="ub-phone"><div class="ub-bar">メモ</div><div class="ub-body lst"></div></div>',
        init:(el) => { const body = $(el, '.lst'); let removed = null, tm = null;
          const draw = () => { body.innerHTML = ITEMS.slice(0, 5).filter(t => t !== (removed && removed.t)).map(t => `<div class="ub-row" data-t="${esc(t)}"><div class="acts"><button class="ar">保管</button><button class="del">削除</button></div><div class="fg"><div class="ub-item"><span class="ub-thumb"></span><div><b>${t}</b><small>左にスワイプ</small></div><button class="more" aria-label="${t}の操作">⋯</button></div></div></div>`).join('');
            $$(body, '.ub-row').forEach(row => { const fg = $(row, '.fg'); let x0 = 0, dx = 0, on = false;
              const close = () => { fg.style.transform = ''; row.dataset.open = ''; };
              fg.onpointerdown = (e) => { if (e.target.closest('button')) return; on = true; x0 = e.clientX - (row.dataset.open ? -128 : 0); fg.setPointerCapture(e.pointerId); fg.classList.add('drag'); };
              fg.onpointermove = (e) => { if (!on) return; dx = Math.min(0, e.clientX - x0); fg.style.transform = `translateX(${dx}px)`; };
              fg.onpointerup = () => { if (!on) return; on = false; fg.classList.remove('drag'); if (dx < -row.clientWidth * .6) return del(row.dataset.t); if (dx < -50){ fg.style.transform = 'translateX(-128px)'; row.dataset.open = '1'; } else close(); dx = 0; };
              $(row, '.more').onclick = () => { if (row.dataset.open) close(); else { fg.style.transform = 'translateX(-128px)'; row.dataset.open = '1'; } };
              $(row, '.del').onclick = () => del(row.dataset.t); $(row, '.ar').onclick = () => del(row.dataset.t, '保管しました'); }); };
          const del = (t, msg = '削除しました') => { removed = { t }; draw(); clearTimeout(tm); body.insertAdjacentHTML('beforeend', `<div class="ub-toast">${msg}<button>元に戻す</button></div>`); $(body, '.ub-toast button').onclick = () => { removed = null; draw(); }; tm = setTimeout(() => { const t2 = $(body, '.ub-toast'); if (t2) t2.remove(); }, 4000); };
          draw(); return () => clearTimeout(tm); },
        desc:'行を左右にスワイプして、削除・保管などのボタンを出す（メールアプリでおなじみ）。大きくスワイプすると、そのまま実行。<b>「元に戻す」付きのトースト</b>を出すと、確認ダイアログなしでも安心です。スワイプできない人のために、<b>「⋯」ボタンでも同じ操作</b>ができるようにしています。',
        prompt:'リストの各行を左にスワイプすると「保管」「削除」ボタンが出るようにして。大きくスワイプしたら即削除し、「元に戻す」付きのトーストを4秒出して。スワイプできない人のために、各行に「⋯」ボタンを付けて同じ操作ができるようにして。' },
      { name:'引っぱって更新', en:'Pull to Refresh', h:400, tags:['スマホ','ジェスチャー'],
        demo:'<div class="ub-phone"><div class="ub-bar">タイムライン<button class="uc-btn sm ghost rf" style="margin-left:auto" aria-label="更新">↻</button></div><div class="ub-body"><div class="ub-pull"><span class="ub-spin"></span><span class="lb">引っぱって更新</span></div><div class="ub-list"></div></div></div>',
        init:(el) => { const list = $(el, '.ub-list'), pull = $(el, '.ub-pull'), sp = $(el, '.ub-spin'), lb = $(el, '.lb'); let n = 0, y0 = 0, dy = 0, on = false, busy = false, tm = null;
          const posts = ['新しいお知らせはありません'].concat(ITEMS.slice(0, 5)); list.innerHTML = posts.map(t => `<div class="ub-item"><span class="ub-thumb"></span><div><b>${t}</b><small>さっき</small></div></div>`).join('');
          const show = (h, txt) => { pull.style.height = h + 'px'; list.style.transform = `translateY(${h}px)`; lb.textContent = txt; sp.style.transform = `rotate(${h * 4}deg)`; };
          const refresh = () => { busy = true; sp.classList.add('go'); show(48, '読み込み中…'); tm = setTimeout(() => { n++; list.insertAdjacentHTML('afterbegin', `<div class="ub-item ub-new"><span class="ub-thumb"></span><div><b>新しい投稿 ${n}</b><small>たった今</small></div></div>`); sp.classList.remove('go'); busy = false; show(0, '引っぱって更新'); }, 1100); };
          list.onpointerdown = (e) => { if (busy) return; on = true; y0 = e.clientY; list.setPointerCapture(e.pointerId); list.classList.add('drag'); };
          list.onpointermove = (e) => { if (!on) return; dy = Math.max(0, (e.clientY - y0) * .5); show(Math.min(dy, 90), dy > 60 ? '離すと更新' : '引っぱって更新'); };
          list.onpointerup = () => { if (!on) return; on = false; list.classList.remove('drag'); dy > 60 ? refresh() : show(0, '引っぱって更新'); dy = 0; };
          $(el, '.rf').onclick = () => { if (!busy) refresh(); }; return () => clearTimeout(tm); },
        desc:'一番上で下に引っぱって離すと、新しい内容を読み込む。<b>引っぱる量に応じて矢印やくるくるが回り</b>、「離すと更新」に変わることで、いつ離せばよいか分かります。パソコンや、ジェスチャーが使えない人のために<b>更新ボタン</b>も置きます。',
        prompt:'タイムラインに「引っぱって更新」を付けて。一番上で下に引っぱると矢印が回り、一定以上で「離すと更新」と表示。離したら読み込み中のくるくるを出し、新しい投稿を上に追加して。ヘッダーに更新ボタンも付けて。' },
    ] },
    { title:'スマホの画面設計', items:[
      { name:'親指の届く範囲', en:'Thumb Zone', h:400, tags:['設計','スマホ'],
        demo:'<div style="display:flex;flex-direction:column;align-items:center;gap:6px;height:100%;padding:8px 0;box-sizing:border-box;width:100%"><div class="uc-seg sg"><button class="on">範囲を表示</button><button>隠す</button></div><div class="ub-phone" style="height:auto;flex:1"><div class="ub-bar"><span style="font-size:15px">☰</span>ホーム<span style="margin-left:auto;font-size:15px">🔔</span></div><div class="ub-body">' + listHTML(4) + '<div class="ub-zone"><span style="top:6%">届きにくい</span><span style="top:40%">まあまあ</span><span style="top:72%">届きやすい</span></div></div><div class="ub-tabbar"><span><b>⌂</b>ホーム</span><span><b>⌕</b>さがす</span><span><b>＋</b>投稿</span><span><b>☺</b>マイページ</span></div></div></div>',
        init:(el) => $$(el, '.sg button').forEach((b, i) => b.onclick = () => { $$(el, '.sg button').forEach(x => x.classList.toggle('on', x === b)); $(el, '.ub-zone').style.opacity = i ? 0 : 1; }),
        desc:'片手でスマホを持つと、<b>画面の上の方は親指が届きにくい</b>。よく使う操作（タブ・投稿・決定ボタン）は<b>下</b>に、たまにしか使わない設定やメニューは上に置きます。大きな画面のスマホほど差が大きくなります。',
        prompt:'このスマホ画面のレイアウトを、片手で使いやすいように見直して。よく使う操作は画面の下半分（ボトムタブバーや下に固定したボタン）に移し、押せる場所は 44px 以上にして。' },
    ] },
    { title:'スマホならではの注意', layout:'rows', items:[
      T('タップできる大きさ', 'Touch target', '指で押す部品は <b>44×44px 以上</b>が目安。小さなアイコンでも、押せる範囲（padding）は大きくします。隣との間隔も空けます。', 'スマホで押しにくい小さなボタンやリンクを探して、押せる範囲を44px以上に広げて。見た目の大きさは変えずに padding で調整して。', ['最重要']),
      T('ホバーがない', 'No hover', 'スマホには「マウスを乗せる」がありません。ホバーでしか出ない説明やメニューは、<b>タップでも出る</b>ようにします。CSS の <code>@media (hover: hover)</code> でホバーできる端末だけに効果を付けられます。'),
      T('セーフエリア', 'Safe area', '画面の角の丸みやノッチ（切り欠き）、下のホームバーに部品が隠れないよう、<code>env(safe-area-inset-bottom)</code> で余白を取ります。', null, null, { code:'.bottom-bar { padding-bottom: calc(12px + env(safe-area-inset-bottom)); }\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">' }),
      T('画面の高さ 100dvh', 'Dynamic viewport', 'スマホのブラウザは、アドレスバーが出たり消えたりして高さが変わります。<code>100vh</code> だと下が隠れることがあるので、<code>100dvh</code> を使います。'),
      T('キーボードの種類', 'inputmode', '<code>inputmode="numeric"</code> で数字のキーボード、<code>type="email"</code> で @ のあるキーボードが出ます。入力の手間が大きく減ります。', null, null, { code:'<input inputmode="numeric" autocomplete="one-time-code">\n<input type="email" autocomplete="email">\n<input type="tel" autocomplete="tel">' }),
      T('入力欄の文字は 16px 以上', 'iOS zoom', 'iPhone では、入力欄の文字が 16px より小さいと、入力のたびに画面が勝手に拡大されます。'),
      T('下に固定したボタン', 'Sticky bottom CTA', '「購入する」「次へ」などの決定ボタンを画面の下に固定すると、長いページでも押しやすくなります。キーボードが出たときに隠れないかも確認します。'),
      T('無限スクロールともっと見る', 'Infinite scroll vs Load more', '下までスクロールすると自動で読み込むのが無限スクロール。<b>フッターにたどり着けない・位置を覚えられない</b>欠点があるので、「もっと見る」ボタンやページ送りの方がよい場面も多いです。'),
      T('長押し', 'Long press', '長押しでメニューを出す操作は気づかれにくいので、<b>同じ操作をボタンからもできる</b>ようにします。'),
      T('振動（ハプティクス）', 'Haptics', 'Web では <code>navigator.vibrate()</code> で短く振動できます（Android の一部ブラウザのみ。iPhone の Safari は非対応）。大事な情報を振動だけで伝えないようにします。'),
      T('横向き', 'Landscape', 'スマホを横にしたときに、固定ヘッダーとキーボードで入力欄が隠れないか確認します。'),
    ] },
  ]});

/* ================= 複雑な画面部品 ================= */
const EVENTS = { 3:'チーム会議 10:00', 8:'歯医者 18:30', 15:'締め切り', 22:'友だちとランチ', 27:'勉強会 15:00' };
const KB0 = { todo:['企画書の下書き', '素材を集める'], doing:['トップページのデザイン'], done:['ドメインを取る'] };
const TREE = [['src', [['components', [['Button.tsx'], ['Card.tsx']]], ['pages', [['index.tsx'], ['about.tsx']]], ['App.tsx']]], ['public', [['logo.svg']]], ['package.json'], ['README.md']];
const REPLIES = ['なるほど、いいですね！', 'それなら明日の午後はどうですか？', '了解です。資料を送りますね。', '（見本の自動返信です）'];
TABS.push({ id:'complex', label:'複雑な画面部品', icon:'🧩',
  intro:'カレンダー・カンバン・ツリー・チャット・スケルトン・入力の手順分け。どれもアプリでよく使われるのに、<b>自作すると細かい動きが難しい</b>部品です。名前と定番の動きを知っておくと、AIへの頼み方が具体的になります。本格的に使うなら、実績のあるライブラリを指定するのが近道です。',
  sections:[
    { title:'予定・作業を管理する', items:[
      { name:'カレンダー（月表示）', en:'Calendar / Date Picker', h:400, tags:['予約','予定'],
        demo:'<div class="ub-cal"><div class="hd"><button class="pv" aria-label="前の月">‹</button><span class="ym"></span><button class="nx" aria-label="次の月">›</button></div><div class="g"></div><div class="ev">日付を押すと予定が出ます</div></div>',
        init:(el) => { const now = new Date(); let y = now.getFullYear(), m = now.getMonth(), sel = null;
          const draw = () => { $(el, '.ym').textContent = `${y}年${m + 1}月`; const first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate(), prevDays = new Date(y, m, 0).getDate(); let h = '日月火水木金土'.split('').map((w, i) => `<span class="w ${i === 0 ? 'sun' : i === 6 ? 'sat' : ''}">${w}</span>`).join('');
            for (let i = 0; i < 42; i++){ const d = i - first + 1, out = d < 1 || d > days, dd = out ? (d < 1 ? prevDays + d : d - days) : d, wd = i % 7, today = !out && d === now.getDate() && m === now.getMonth() && y === now.getFullYear();
              h += `<button class="d ${out ? 'out' : ''} ${wd === 0 ? 'sun' : wd === 6 ? 'sat' : ''} ${today ? 'today' : ''} ${!out && sel === d ? 'sel' : ''}" ${out ? 'tabindex="-1" disabled' : `data-d="${d}"`} aria-label="${out ? '' : `${m + 1}月${d}日${EVENTS[d] ? '、予定あり' : ''}`}">${dd}${!out && EVENTS[d] ? '<i></i>' : ''}</button>`; }
            $(el, '.g').innerHTML = h; $$(el, '.d[data-d]').forEach(b => b.onclick = () => { sel = +b.dataset.d; draw(); $(el, '.ev').textContent = `${m + 1}月${sel}日：${EVENTS[sel] || '予定はありません'}`; }); };
          $(el, '.pv').onclick = () => { m--; if (m < 0){ m = 11; y--; } sel = null; draw(); }; $(el, '.nx').onclick = () => { m++; if (m > 11){ m = 0; y++; } sel = null; draw(); }; draw(); },
        desc:'月ごとの日付を7列のマスで並べる。<b>今日の印・選んだ日・予定のある日の点</b>、前後の月への移動が基本。日本向けなら<b>日曜は赤・土曜は青</b>、祝日の扱い、週の始まり（日曜か月曜か）も決めておきます。',
        prompt:'予約サイト用に月表示のカレンダーを作って。今日に印、予約できる日だけ押せる、選んだ日は色を変える、前後の月に移動できる。週は日曜始まり、日曜は赤・土曜は青。日付の計算は日本時間で行い、キーボードの矢印キーでも日付を移動できるようにして（react-day-picker を使ってよい）。' },
      { name:'カンバン', en:'Kanban Board', h:380, wide:true, tags:['タスク管理','ドラッグ'],
        demo:'<div class="ub-kb"></div>',
        init:(el) => { const st = JSON.parse(JSON.stringify(KB0)), COLS = [['todo', 'やること'], ['doing', '作業中'], ['done', '完了']]; let drag = null;
          const move = (t, from, to) => { st[from] = st[from].filter(x => x !== t); st[to].push(t); draw(); };
          const draw = () => { const kb = $(el, '.ub-kb'); kb.innerHTML = COLS.map(([k, l], ci) => `<div class="col" data-k="${k}"><h4>${l}<span>${st[k].length}</span></h4>${st[k].map(t => `<div class="cd" draggable="true" data-t="${esc(t)}" data-k="${k}">${t}<div class="mv">${ci > 0 ? `<button data-to="${COLS[ci - 1][0]}" aria-label="${t}を${COLS[ci - 1][1]}へ">←</button>` : ''}${ci < 2 ? `<button data-to="${COLS[ci + 1][0]}" aria-label="${t}を${COLS[ci + 1][1]}へ">→</button>` : ''}</div></div>`).join('')}</div>`).join('');
            $$(kb, '.cd').forEach(c => { c.ondragstart = (e) => { drag = c; c.classList.add('dragging'); e.dataTransfer.setData('text/plain', c.dataset.t); }; c.ondragend = () => c.classList.remove('dragging');
              $$(c, '.mv button').forEach(b => b.onclick = () => move(c.dataset.t, c.dataset.k, b.dataset.to)); });
            $$(kb, '.col').forEach(col => { col.ondragover = (e) => { e.preventDefault(); col.classList.add('over'); }; col.ondragleave = () => col.classList.remove('over'); col.ondrop = (e) => { e.preventDefault(); col.classList.remove('over'); if (drag && drag.dataset.k !== col.dataset.k) move(drag.dataset.t, drag.dataset.k, col.dataset.k); }; }); };
          draw(); },
        desc:'作業を「やること・作業中・完了」の列に並べ、<b>ドラッグで列を移動</b>させる。Trello や GitHub Projects でおなじみ。ドラッグは、スマホやキーボード、手が動かしにくい人には難しいので、<b>← → ボタンでも移動</b>できるようにしています（WCAG 2.2 の 2.5.7）。',
        prompt:'タスク管理のカンバンを作って。列は「やること・作業中・完了」、カードはドラッグで列の間を移動でき、各カードに←→ボタンでも移動できる。スマホのタッチ操作とキーボード操作にも対応して（dnd-kit を使ってよい）。状態は localStorage に保存して。' },
      { name:'ツリービュー', en:'Tree View', h:360, tags:['フォルダ','階層'],
        demo:'<div class="ub-tree"><ul class="rt" role="tree"></ul><div class="ub-path">ファイルを選んでください</div></div>',
        init:(el) => { const open = new Set(['src']); let sel = '';
          const node = (n, path) => { const [name, kids] = n, p = path ? path + '/' + name : name;
            return kids ? `<li role="treeitem" aria-expanded="${open.has(p)}"><button data-p="${p}" data-f="1" aria-expanded="${open.has(p)}"><span class="car">▶</span>📁 ${name}</button>${open.has(p) ? `<ul role="group">${kids.map(k => node(k, p)).join('')}</ul>` : ''}</li>` : `<li role="treeitem"><button data-p="${p}" class="${sel === p ? 'sel' : ''}"><span class="car"></span>📄 ${name}</button></li>`; };
          const draw = () => { $(el, '.rt').innerHTML = TREE.map(n => node(n, '')).join(''); $$(el, '.rt button').forEach(b => b.onclick = () => { const p = b.dataset.p; if (b.dataset.f){ open.has(p) ? open.delete(p) : open.add(p); } else { sel = p; $(el, '.ub-path').textContent = '選択中：' + p; } draw(); }); };
          draw(); },
        desc:'フォルダの中のフォルダのような、<b>入れ子の階層</b>を開閉して見せる。ファイル一覧、組織図、カテゴリ、設定のメニューなど。<b>開いているかどうか（aria-expanded）</b>を伝え、キーボードの矢印キーで移動できるのが本来の作法です。',
        prompt:'商品カテゴリをツリービューで表示して。フォルダは押すと開閉し、矢印キーで上下移動・左右で開閉できる。選んだカテゴリの「パンくず（大分類 > 中分類 > 小分類）」を上に表示して。ARIA の tree の作法に沿って。' },
    ] },
    { title:'やり取り・読み込み・入力', items:[
      { name:'チャット画面', en:'Chat UI', h:420, tags:['メッセージ','AIチャット'],
        demo:'<div class="ub-phone"><div class="ub-bar">さくら</div><div class="ub-chat" role="log" aria-live="polite"></div><button class="ub-jump" hidden>↓ 新しいメッセージ</button><form class="ub-send"><input type="text" placeholder="メッセージを入力" aria-label="メッセージ"><button>送信</button></form></div>',
        init:(el) => { const box = $(el, '.ub-chat'), jump = $(el, '.ub-jump'); let k = 0, tm = [];
          const time = () => { const d = new Date(); return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`; };
          const atBottom = () => box.scrollHeight - box.scrollTop - box.clientHeight < 30;
          const add = (t, me) => { const stick = atBottom(); box.insertAdjacentHTML('beforeend', `<div class="ub-msg ${me ? 'me' : 'them'}">${esc(t)}<small>${me ? '既読 ' : ''}${time()}</small></div>`); if (me || stick) box.scrollTop = box.scrollHeight; else jump.hidden = false; };
          ['こんにちは！', '週末の勉強会、場所はどうしましょう？'].forEach(t => add(t, false));
          box.onscroll = () => { if (atBottom()) jump.hidden = true; }; jump.onclick = () => { box.scrollTop = box.scrollHeight; jump.hidden = true; };
          $(el, '.ub-send').onsubmit = (e) => { e.preventDefault(); const i = $(el, '.ub-send input'), v = i.value.trim(); if (!v) return; add(v, true); i.value = '';
            const ty = document.createElement('div'); ty.className = 'ub-typing'; ty.innerHTML = '<i></i><i></i><i></i>'; ty.setAttribute('aria-label', '入力中'); const stick = atBottom(); box.append(ty); if (stick) box.scrollTop = box.scrollHeight;
            tm.push(setTimeout(() => { ty.remove(); add(REPLIES[k++ % REPLIES.length], false); }, 1200)); };
          return () => tm.forEach(clearTimeout); },
        desc:'自分の発言は右、相手は左の吹き出し。送信したら<b>一番下まで自動でスクロール</b>しますが、<b>上の方を読んでいるときは勝手に下げず</b>「↓ 新しいメッセージ」ボタンを出すのがコツ（見本は、上にスクロールしてから送ると確かめられます）。入力中の「…」、時刻、既読も定番です。',
        prompt:'チャット画面を作って。自分は右・相手は左の吹き出し、時刻と既読表示、相手の入力中は「…」のアニメーション。新着が来たとき、一番下にいれば自動スクロールし、上を読んでいるときは「↓新しいメッセージ」ボタンを出す。Enterで送信、Shift+Enterで改行。メッセージ一覧には role="log" を付けて。' },
      { name:'スケルトン', en:'Skeleton Screen', h:330, tags:['読み込み中','体感速度'],
        demo:'<div class="ub-sk"><div class="uc-seg sg" style="align-self:center"><button class="on">読み込む</button></div><div class="bx"></div></div>',
        init:(el) => { let tm = null; const bx = $(el, '.bx');
          const real = () => ['山田 花子', '佐藤 健', '鈴木 一郎'].map((n, i) => `<div class="c"><span class="uc-av" style="width:36px;height:36px;font-size:13px;background:${['#0f8b8d', '#e2562b', '#6d4cff'][i]}">${n[0]}</span><div><b>${n}</b><small>新しい投稿をしました</small></div></div>`).join('');
          const skel = () => [0, 1, 2].map(() => '<div class="c" aria-hidden="true"><span class="ub-bone" style="width:36px;height:36px;border-radius:50%;flex:none"></span><div><span class="ub-bone" style="height:11px;width:55%"></span><span class="ub-bone" style="height:9px;width:80%"></span></div></div>').join('');
          const load = () => { clearTimeout(tm); bx.innerHTML = skel(); bx.setAttribute('aria-busy', 'true'); tm = setTimeout(() => { bx.innerHTML = real(); bx.removeAttribute('aria-busy'); }, 1600); };
          $(el, '.sg button').onclick = load; load(); return () => clearTimeout(tm); },
        desc:'読み込み中に、<b>これから出る内容の形</b>を灰色の箱で先に見せる。くるくる（スピナー）より「もうすぐ出る」感じがして、表示されたときのガタつき（レイアウトのずれ）も防げます。光が流れる動きは、動きを減らす設定のときは止めます。',
        prompt:'一覧の読み込み中に、実際のカードと同じ形・大きさのスケルトンを表示して。光が流れるアニメーション付きで、prefers-reduced-motion のときは止める。読み込み中は aria-busy="true" を付けて。' },
      { name:'入力を手順に分ける（ウィザード）', en:'Multi-step Form / Wizard', h:400, tags:['フォーム','申し込み'],
        demo:'<div class="ub-wz"><div class="ub-steps"></div><div class="bd"></div><div class="err" role="alert"></div><div class="nav"><button class="uc-btn sm out bk">← 戻る</button><button class="uc-btn sm nx">次へ →</button></div></div>',
        init:(el) => { let s = 0; const v = { name:'', email:'', plan:'ライト', pay:'カード' }, STEPS = ['お客さま情報', 'プラン', '確認'];
          const draw = () => { $(el, '.ub-steps').innerHTML = STEPS.map((t, i) => `<span class="${i === s ? 'on' : i < s ? 'done' : ''}">${i < s ? '✓ ' : ''}${i + 1}. ${t}</span>`).join('');
            $(el, '.bd').innerHTML = s === 0 ? `<label>お名前<input class="f" data-k="name" value="${esc(v.name)}" autocomplete="name"></label><label>メール<input class="f" data-k="email" type="email" value="${esc(v.email)}" autocomplete="email"></label>`
              : s === 1 ? `<label>プラン<select class="f" data-k="plan">${['ライト', 'スタンダード', 'プロ'].map(p => `<option ${v.plan === p ? 'selected' : ''}>${p}</option>`).join('')}</select></label><label>支払い<select class="f" data-k="pay">${['カード', 'コンビニ', '銀行振込'].map(p => `<option ${v.pay === p ? 'selected' : ''}>${p}</option>`).join('')}</select></label>`
              : `<dl><dt>お名前</dt><dd>${esc(v.name)}</dd><dt>メール</dt><dd>${esc(v.email)}</dd><dt>プラン</dt><dd>${v.plan}</dd><dt>支払い</dt><dd>${v.pay}</dd></dl>`;
            $$(el, '.f').forEach(f => f.oninput = f.onchange = () => { v[f.dataset.k] = f.value; });
            $(el, '.bk').disabled = s === 0; $(el, '.nx').textContent = s === 2 ? '申し込む' : '次へ →'; $(el, '.err').textContent = ''; };
          $(el, '.nx').onclick = () => { if (s === 0){ if (!v.name.trim()) return $(el, '.err').textContent = 'お名前を入力してください'; if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email)) return $(el, '.err').textContent = 'メールアドレスの形を確認してください'; }
            if (s === 2){ $(el, '.bd').innerHTML = '<b>申し込みを受け付けました（見本）</b>'; $(el, '.nx').disabled = true; $(el, '.bk').disabled = true; $(el, '.ub-steps').innerHTML = STEPS.map((t, i) => `<span class="done">✓ ${i + 1}. ${t}</span>`).join(''); return; } s++; draw(); };
          $(el, '.bk').onclick = () => { if (s > 0){ s--; draw(); } }; draw(); },
        desc:'長い入力を<b>いくつかの手順に分け</b>、今どこか（何ステップ中の何番目か）を上に示す。<b>戻っても入力が消えない</b>、手順ごとに確認する、最後に<b>確認画面</b>を出す、が基本。途中で離れても続きからできるよう、入力を一時保存することもあります。',
        prompt:'申し込みフォームを3ステップ（お客さま情報→プラン選択→確認）のウィザードにして。上に進捗を表示し、戻っても入力が消えない。各ステップで入力チェックをしてから次へ進み、最後の確認画面から各ステップに戻って修正できるようにして。入力途中は sessionStorage に保存して。' },
    ] },
    { title:'作るときの言葉と注意', layout:'rows', items:[
      T('日付ピッカーと範囲選択', 'Date range picker', '宿泊予約の「チェックイン〜チェックアウト」のように、2つの日付を選ぶ部品。選べない日（過去・満室）の見せ方、最短・最長の日数を決めておきます。'),
      T('週の始まりと祝日', 'Locale', '日本では日曜始まりが多く、仕事のツールでは月曜始まりも。祝日は年ごとに変わるので、データをどこから取るかを決めます（内閣府が祝日の一覧を公開しています）。', null, ['注意']),
      T('日付とタイムゾーン', 'Time zones', '予定や締め切りは、<b>どの国の時間か</b>で日付がずれます。保存は世界共通の時刻（UTC）、表示は日本時間、が基本です（<a href="database.html">データベース辞典</a>）。'),
      T('楽観的な更新', 'Optimistic update', 'カンバンでカードを動かしたとき、サーバーの返事を待たずに画面を先に変え、失敗したら元に戻す作り方。操作が軽く感じられます。'),
      T('仮想スクロール', 'Virtualized list', '何千件もの一覧は、<b>画面に見えている行だけ</b>を描画すると軽くなります（TanStack Virtual など）。'),
      T('チャットの既読と通知', 'Read receipts', '既読・入力中の表示はリアルタイムの通信（WebSocket など）が必要です。既読を出すかどうかは、使う人の気持ちへの影響も考えて決めます。'),
      T('スケルトンとスピナーの使い分け', 'Skeleton vs spinner', '内容の形が決まっている一覧・カードはスケルトン、何が出るか分からない処理や短い待ち時間はスピナー。1秒未満なら何も出さない方が落ち着くこともあります。'),
      T('定番ライブラリ', 'Libraries', 'カレンダー：FullCalendar・react-day-picker、ドラッグ：dnd-kit・SortableJS、ツリー・大きな表：TanStack Table、チャットのリアルタイム通信：Supabase Realtime・Socket.IO など。', '【作りたい部品】を作るのに使えるライブラリを3つ比べて。スマホ対応・キーボード操作・読み上げ対応・ライセンス・最近の更新状況を表にして。'),
    ] },
  ]});

// 「UIライブラリ」タブを最後に戻す
const li = TABS.findIndex(t => t.id === 'lib'); if (li >= 0) TABS.push(TABS.splice(li, 1)[0]);
})();
