/* サウンド・効果音辞典 — すべての音を Web Audio API でその場で合成する */
(function(){
const $ = (el, s) => el.querySelector(s), $$ = (el, s) => [...el.querySelectorAll(s)];
let ac = null, master = null;
function ctx(){
  if (!ac){ ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.gain.value = .6; master.connect(ac.destination); }
  if (ac.state === 'suspended') ac.resume();
  return ac;
}
// 音色1つ: 周波数を f→f2 へ変化させ、音量エンベロープを付ける
function tone(o){
  const a = ctx(), t = a.currentTime + (o.at || 0);
  const osc = a.createOscillator(), g = a.createGain();
  osc.type = o.type || 'sine';
  osc.frequency.setValueAtTime(o.f, t);
  if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t + (o.slide || o.dur || .2));
  if (o.vib){ const l = a.createOscillator(), lg = a.createGain(); l.frequency.value = o.vib; lg.gain.value = o.vibDepth || 30; l.connect(lg).connect(osc.frequency); l.start(t); l.stop(t + o.dur + .1); }
  const v = o.vol == null ? .3 : o.vol, A = o.attack || .005, D = o.dur || .2;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + A);
  if (o.sustain){ g.gain.setValueAtTime(v, t + D - (o.release || .05)); g.gain.linearRampToValueAtTime(0, t + D); }
  else g.gain.exponentialRampToValueAtTime(.0001, t + D);
  osc.connect(g).connect(o.dest || master); osc.start(t); osc.stop(t + D + .05);
}
let noiseBuf = null;
function noise(o){
  const a = ctx(), t = a.currentTime + (o.at || 0);
  if (!noiseBuf){ noiseBuf = a.createBuffer(1, a.sampleRate * 2, a.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  const src = a.createBufferSource(); src.buffer = noiseBuf;
  const fl = a.createBiquadFilter(); fl.type = o.filter || 'lowpass'; fl.frequency.setValueAtTime(o.f || 1000, t); fl.Q.value = o.q || 1;
  if (o.f2) fl.frequency.exponentialRampToValueAtTime(o.f2, t + (o.dur || .3));
  const g = a.createGain(); const v = o.vol == null ? .3 : o.vol;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + (o.attack || .003)); g.gain.exponentialRampToValueAtTime(.0001, t + (o.dur || .3));
  src.connect(fl).connect(g).connect(master); src.start(t); src.stop(t + (o.dur || .3) + .05);
}
const N = (n) => 440 * Math.pow(2, (n - 69) / 12); // MIDIノート番号 → 周波数

/* 効果音レシピ */
const SFX = {
  click:   () => tone({ f:1800, dur:.03, vol:.25, type:'square' }),
  pop:     () => tone({ f:350, f2:900, dur:.08, vol:.4 }),
  success: () => [72, 76, 79, 84].forEach((n, i) => tone({ f:N(n), at:i * .07, dur:.35, type:'triangle', vol:.25 })),
  error:   () => [0, .14].forEach(at => tone({ f:140, at, dur:.11, type:'square', vol:.18, sustain:true })),
  notify:  () => { tone({ f:N(81), dur:.25, vol:.25 }); tone({ f:N(88), at:.12, dur:.45, vol:.22 }); },
  coin:    () => { tone({ f:N(83), dur:.08, type:'square', vol:.15, sustain:true }); tone({ f:N(88), at:.08, dur:.35, type:'square', vol:.15 }); },
  jump:    () => tone({ f:250, f2:750, dur:.18, type:'square', vol:.15 }),
  powerup: () => [60, 64, 67, 72, 64, 67, 72, 76, 67, 72, 76, 79].forEach((n, i) => tone({ f:N(n), at:i * .045, dur:.07, type:'square', vol:.12, sustain:true })),
  gameover:() => [67, 66, 65, 64].forEach((n, i) => tone({ f:N(n), at:i * .28, dur:i === 3 ? .8 : .26, type:'triangle', vol:.25, vib:i === 3 ? 6 : 0, vibDepth:6 })),
  laser:   () => tone({ f:1600, f2:120, dur:.25, type:'sawtooth', vol:.15 }),
  explode: () => { noise({ f:1200, f2:60, dur:1.1, vol:.6 }); tone({ f:90, f2:30, dur:.6, vol:.5 }); },
  hit:     () => { noise({ f:2500, f2:300, dur:.12, vol:.45 }); tone({ f:160, f2:60, dur:.15, vol:.5 }); },
  whoosh:  () => noise({ filter:'bandpass', f:250, f2:3500, q:2.5, dur:.45, vol:.5, attack:.12 }),
  type:    () => noise({ filter:'highpass', f:3000, dur:.035, vol:.25 }),
  bell:    () => { tone({ f:N(84), dur:1.6, vol:.25 }); tone({ f:N(84) * 2.76, dur:.9, vol:.06 }); tone({ f:N(84) * 5.4, dur:.4, vol:.03 }); },
  drop:    () => tone({ f:1400, f2:300, dur:.12, vol:.35 }),
  warp:    () => tone({ f:200, f2:2200, dur:.7, type:'sine', vol:.25, vib:18, vibDepth:80 }),
  heart:   () => [0, .22, .9, 1.12].forEach((at, i) => tone({ f:i % 2 ? 50 : 60, f2:35, at, dur:.18, vol:.7 })),
  alarm:   () => [0, .2, .4, .6, .8, 1].forEach((at, i) => tone({ f:i % 2 ? 660 : 880, at, dur:.19, type:'square', vol:.1, sustain:true })),
  count:   () => { [0, .7, 1.4].forEach(at => tone({ f:N(81), at, dur:.15, vol:.25 })); tone({ f:N(93), at:2.1, dur:.7, vol:.25 }); },
  levelup: () => [67, 71, 74, 79, 83, 86].forEach((n, i) => tone({ f:N(n), at:i * .06, dur:.5, type:'triangle', vol:.18 })),
  cancel:  () => tone({ f:600, f2:300, dur:.12, type:'triangle', vol:.3 }),
  select:  () => tone({ f:N(76), dur:.06, type:'square', vol:.12, sustain:true }),
  cursor:  () => tone({ f:N(88), dur:.03, type:'square', vol:.1, sustain:true }),
  thunder: () => { noise({ f:600, f2:40, dur:2.2, vol:.7, attack:.02 }); noise({ f:3000, f2:200, dur:.25, vol:.4 }); },
  rain:    () => { for (let i = 0; i < 60; i++) noise({ filter:'highpass', f:2500 + Math.random() * 3000, at:Math.random() * 2, dur:.02, vol:.08 + Math.random() * .1 }); },
};
const sfxItem = (k, name, en, desc, prompt, tags) => ({ name, en, desc, prompt, tags, h:110, stage:'free',
  demo:`<div class="snd"><button class="snd-play" data-k="${k}" aria-label="${name}を再生">▶</button><span class="snd-wave"></span></div>`,
  init:(el) => { const b = $(el, '.snd-play'); b.onclick = () => { SFX[k](); b.classList.remove('on'); void b.offsetWidth; b.classList.add('on'); }; }, replay:false });

TABS.push({
  id:'sfx', label:'効果音（SE）', icon:'♪',
  intro:'▶を押すと、その場で合成した効果音が鳴ります（音量に注意）。<b>すべて音声ファイルなし・Web Audio APIだけ</b>で作っているので、同じ考え方でアプリやゲームに組み込めます。「レシピ」をAIに渡せば同じ系統の音を作ってもらえます。',
  sections:[
    { title:'UI・操作音', note:'UIの音は<b>短く・小さく・控えめ</b>が鉄則。鳴らす場面を絞り、オフにできる設定を付けましょう。', items:[
      sfxItem('click', 'クリック', 'click / tap', 'カチッという短い音。ボタンやキー入力の手応え。', 'ボタンを押したときに、30msの短い「カチッ」というクリック音をWeb Audio APIで鳴らして（音声ファイルなし）。', ['UI']),
      sfxItem('pop', 'ポップ', 'pop / bubble', '泡がはじけるような「ポンッ」。チャット送信、いいね、トグルON。', 'メッセージ送信時に周波数が上がる短い「ポンッ」という音を鳴らして。', ['UI']),
      sfxItem('select', '選択', 'select / blip', 'メニュー選択の「ピッ」。', 'メニューの項目を選んだら短い矩形波の「ピッ」を鳴らして。', ['UI']),
      sfxItem('cursor', 'カーソル移動', 'cursor move', 'ゲームのメニューでカーソルが動く小さな音。', 'キーボードで選択肢を移動するたびに、ごく短い高めの音を鳴らして。', ['ゲームUI']),
      sfxItem('cancel', 'キャンセル', 'cancel / back', '下がる音で「戻る」「取り消し」を表す。', 'キャンセル時は音程が下がる短い音にして、決定音と区別して。', ['UI']),
      sfxItem('success', '成功・完了', 'success chime', '上がっていく和音（ド・ミ・ソ・ド）。保存完了、正解、達成。', '送信成功時に、ド・ミ・ソ・ドと上がる明るい成功音を鳴らして。', ['フィードバック']),
      sfxItem('error', 'エラー', 'error buzz', '低い「ブブッ」。入力ミス、不正解。<b>不快すぎない音量</b>に。', '入力エラー時に、低い矩形波で「ブブッ」と2回鳴るエラー音を鳴らして。', ['フィードバック']),
      sfxItem('notify', '通知', 'notification', '「ピロン」と2音で上がる通知音。', '新着メッセージが届いたら、2音で上がる「ピロン」という通知音を鳴らして。', ['通知']),
      sfxItem('type', 'タイピング', 'keystroke / typewriter', '短いノイズの「カタ」。タイプライター演出や入力音に。', 'タイプライター演出の1文字ごとに、ハイパスしたノイズの短い打鍵音を鳴らして。', ['演出']),
      sfxItem('drop', '水滴', 'water drop / blip', '「ポチャ」と下がる音。やわらかい通知や、ドロップ操作に。', 'ファイルをドロップしたら、水滴のように音程が下がる「ポチャ」という音を鳴らして。', ['やさしい']),
    ]},
    { title:'ゲーム効果音（8bit風）', note:'矩形波（square）を使うとファミコン風になります。jsfxr などのツールでパラメータを探るのも定番です。', items:[
      sfxItem('coin', 'コイン取得', 'coin / pickup', '2音で上がる「チャリーン」。アイテム取得、ポイント加算。', 'コインを取ったら、矩形波で2音上がる8bit風のコイン音を鳴らして。', ['8bit']),
      sfxItem('jump', 'ジャンプ', 'jump', '音程が急上昇する「ピョン」。', 'ジャンプの瞬間に、矩形波の周波数を250Hzから750Hzに上げるジャンプ音を鳴らして。', ['8bit']),
      sfxItem('powerup', 'パワーアップ', 'power-up', '速いアルペジオで駆け上がる。', 'パワーアップアイテムを取ったら、速いアルペジオで駆け上がる効果音を鳴らして。', ['8bit']),
      sfxItem('levelup', 'レベルアップ', 'level up / fanfare', 'キラキラと上がる短いファンファーレ。', 'レベルアップ時に、三角波で6音駆け上がるキラキラした音を鳴らして。', ['達成']),
      sfxItem('gameover', 'ゲームオーバー', 'game over / lose', '下がっていく悲しい音。最後の音を揺らすと哀愁が出る。', 'ゲームオーバー時に、4音で下がっていき最後の音がビブラートする悲しい音を鳴らして。', ['8bit']),
      sfxItem('laser', 'レーザー', 'laser / shoot', 'のこぎり波が急降下する「ビュン」。シューティングの発射音。', '弾を撃つたびに、のこぎり波が1600Hzから120Hzへ急降下するレーザー音を鳴らして。', ['シューティング']),
      sfxItem('hit', 'ヒット・打撃', 'hit / punch', 'ノイズと低音を重ねた「バシッ」。攻撃が当たった瞬間に。', '攻撃が当たったら、ノイズの短いバーストと低い音を重ねた打撃音を鳴らして。', ['アクション']),
      sfxItem('explode', '爆発', 'explosion', 'ノイズのローパスを下げていく「ドカーン」。', '敵を倒したら、ホワイトノイズにローパスフィルターをかけて周波数を下げていく爆発音を鳴らして。', ['アクション']),
      sfxItem('warp', 'ワープ', 'warp / teleport', '揺れながら上昇する不思議な音。', 'ワープ時に、ビブラートしながら音程が上がっていく不思議な効果音を鳴らして。', ['SF']),
    ]},
    { title:'環境・演出', items:[
      sfxItem('whoosh', 'シュッ（風切り音）', 'whoosh / swoosh', 'バンドパスしたノイズの周波数を上げる。<b>画面遷移・テロップの出現</b>に合わせると動画が締まる。', '画面が切り替わるタイミングで、ノイズを使った「シュッ」という風切り音を鳴らして。', ['動画編集で多用']),
      sfxItem('bell', 'ベル・チーン', 'bell / ding', '倍音を重ねた余韻の長い音。オチ、時間切れ、仏壇の「チーン」。', 'クイズの正解発表で、余韻の長いベルの音（基音と倍音を重ねる）を鳴らして。', ['オチ']),
      sfxItem('count', 'カウントダウン', 'countdown beeps', '「ピッ・ピッ・ピッ・ポーン」。スタートの合図。', 'ゲーム開始前に、ピッ・ピッ・ピッ・ポーン（最後だけ高い音）のカウントダウン音を鳴らして。', ['合図']),
      sfxItem('alarm', 'アラーム', 'alarm / siren', '2つの音を交互に鳴らす。タイマー終了・警告。', 'タイマーが0になったら、2つの音を交互に鳴らすアラームを止めるボタンを押すまで繰り返して。', ['タイマー']),
      sfxItem('heart', '心音', 'heartbeat', '低い「ドクン、ドクン」。緊張・ホラー演出。', '緊張する場面で、低い音で「ドクン、ドクン」という心音を繰り返して。', ['ホラー']),
      sfxItem('thunder', '雷鳴', 'thunder', 'ノイズを長くゆっくり減衰させる。', '雷の演出で、画面のフラッシュに合わせてノイズで作った雷鳴を鳴らして。', ['天候']),
      sfxItem('rain', '雨音', 'rain drops', '短いノイズをランダムなタイミングで大量に鳴らす。', '背景に、短いノイズをランダムに重ねて作った雨音を流して。', ['環境音']),
    ]},
    { title:'実装のポイント', layout:'rows', items:[
      { name:'最初の音はユーザー操作の後', en:'Autoplay Policy', tags:['よくハマる'], desc:'ブラウザは<b>クリックなどの操作の前に音を鳴らすことを禁止</b>している。最初のクリックで AudioContext を作る（または resume する）。', prompt:'最初のクリックかキー入力でAudioContextをresumeして、それ以降に効果音が鳴るようにして。', code:"let ac;\naddEventListener('pointerdown', () => { ac ??= new AudioContext(); ac.resume(); }, { once: true });" },
      { name:'音量の調整・ミュート', en:'Master Volume / Mute', desc:'すべての音を1つの GainNode（マスター音量）に通すと、全体の音量調整やミュートが簡単。設定はlocalStorageに保存する。', prompt:'効果音とBGMの音量をそれぞれ調整できるスライダーとミュートボタンを設定画面に付けて、localStorageに保存して。' },
      { name:'音声ファイルで鳴らす場合', en:'Audio Files', desc:'リアルな音は録音素材（mp3/ogg/wav）を使う。連打する効果音は <code>new Audio()</code> より Web Audio（AudioBuffer）か Howler.js の方が遅延がなく重ねて鳴らせる。', code:"import { Howl } from 'howler';\nconst coin = new Howl({ src: ['coin.webm', 'coin.mp3'], volume: 0.5 });\ncoin.play();" },
    ]},
  ]
});

/* ---------- 楽器・音楽理論 ---------- */
TABS.push({
  id:'music', label:'音・音楽の仕組み', icon:'𝄞',
  intro:'音の基本要素（波形・音程・和音・音階・リズム）を、鳴らしながら確認できます。BGMの生成AIに指示したり、音楽アプリ・リズムゲームを作ったりするときの土台になります。',
  sections:[
    { title:'波形と音色', items:[
      { name:'4つの基本波形', en:'Sine / Square / Sawtooth / Triangle', h:200, stage:'free', wide:true,
        demo:'<div class="snd-grid">' + [['sine', 'サイン波', 'やわらかく純粋。時報・口笛・電子音'], ['square', '矩形波', 'ファミコン風。中空の明るい音'], ['sawtooth', 'のこぎり波', 'ギラギラ明るい。シンセのリード・ブラス'], ['triangle', '三角波', 'サインと矩形の中間。フルート的']].map(w => `<button class="snd-w" data-w="${w[0]}"><canvas width="160" height="60"></canvas><b>${w[1]}</b><small>${w[0]}</small><span>${w[2]}</span></button>`).join('') + '</div>',
        init:(el) => { $$(el, '.snd-w').forEach(b => { const c = $(b, 'canvas'), g = c.getContext('2d'), w = b.dataset.w; g.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent'); g.lineWidth = 2.5; g.beginPath(); for (let x = 0; x <= 160; x++){ const p = (x / 160 * 2) % 1; const y = w === 'sine' ? Math.sin(p * Math.PI * 2) : w === 'square' ? (p < .5 ? 1 : -1) : w === 'sawtooth' ? 1 - 2 * p : (p < .5 ? 4 * p - 1 : 3 - 4 * p); x ? g.lineTo(x, 30 - y * 22) : g.moveTo(x, 30 - y * 22); } g.stroke(); b.onclick = () => tone({ f:N(60), type:w, dur:.8, vol:w === 'sine' || w === 'triangle' ? .35 : .15, sustain:true, release:.2 }); }); },
        desc:'電子音の音色は波形で決まる。<b>倍音（高い成分）が多いほど明るく派手</b>な音になる（サイン＜三角＜矩形＜のこぎり）。押すと同じ高さ（ド）で鳴り比べられる。', prompt:'Web Audio APIのOscillatorNodeで、波形（sine/square/sawtooth/triangle）を切り替えられる簡単なシンセサイザーを作って。鍵盤はPCキーボードのA〜Kに割り当てて。' },
      { name:'エンベロープ（ADSR）', en:'Attack / Decay / Sustain / Release', h:200, stage:'free',
        demo:'<div class="snd-adsr"><svg viewBox="0 0 200 70"><polyline points="" /></svg><div class="snd-sl">' + [['A', 'アタック', .01, 1, .02], ['D', 'ディケイ', .01, 1, .2], ['S', 'サステイン', 0, 1, .5], ['R', 'リリース', .01, 2, .4]].map(s => `<label>${s[0]}<input type="range" min="${s[2]}" max="${s[3]}" step="0.01" value="${s[4]}" data-k="${s[0]}"></label>`).join('') + '</div><button class="snd-btn">▶ 鳴らす</button></div>',
        init:(el) => { const ins = $$(el, 'input'), pl = $(el, 'polyline'); const v = () => Object.fromEntries(ins.map(i => [i.dataset.k, +i.value])); const draw = () => { const p = v(); const tot = p.A + p.D + .4 + p.R, X = (t) => t / tot * 196 + 2; pl.setAttribute('points', `${X(0)},66 ${X(p.A)},4 ${X(p.A + p.D)},${66 - p.S * 62} ${X(p.A + p.D + .4)},${66 - p.S * 62} ${X(tot)},66`); }; ins.forEach(i => i.oninput = draw); draw(); $(el, '.snd-btn').onclick = () => { const a = ctx(), p = v(), t = a.currentTime, o = a.createOscillator(), g = a.createGain(); o.type = 'sawtooth'; o.frequency.value = N(57); const f = a.createBiquadFilter(); f.frequency.value = 1800; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.25, t + p.A); g.gain.linearRampToValueAtTime(.25 * p.S + .0001, t + p.A + p.D); g.gain.setValueAtTime(.25 * p.S + .0001, t + p.A + p.D + .4); g.gain.linearRampToValueAtTime(0, t + p.A + p.D + .4 + p.R); o.connect(f).connect(g).connect(master); o.start(t); o.stop(t + p.A + p.D + .5 + p.R); }; },
        desc:'音量の時間変化。<b>A</b>＝鳴り始めの速さ、<b>D</b>＝ピークから落ちる時間、<b>S</b>＝押している間の音量、<b>R</b>＝離した後の余韻。Aを短く＝ピアノ・打楽器的、Aを長く＝ストリングス・パッド的。', prompt:'シンセの音にADSRエンベロープを付けて、各値をスライダーで調整できるようにして。' },
    ]},
    { title:'和音（コード）', note:'すべてド（C）を根音にした和音です。<b>メジャー＝明るい、マイナー＝暗い・切ない</b>が基本。', items:[
      ['メジャー', 'C（major）', [0, 4, 7], '明るい・楽しい・前向き'],
      ['マイナー', 'Cm（minor）', [0, 3, 7], '暗い・切ない・悲しい'],
      ['セブンス', 'C7（dominant 7th）', [0, 4, 7, 10], 'ブルージー・次に進みたくなる緊張'],
      ['メジャーセブンス', 'Cmaj7', [0, 4, 7, 11], 'おしゃれ・都会的・シティポップ'],
      ['マイナーセブンス', 'Cm7', [0, 3, 7, 10], 'メロウ・Lo-fi・ジャズ'],
      ['サスフォー', 'Csus4', [0, 5, 7], '浮遊感・宙ぶらりん（解決を待つ）'],
      ['ディミニッシュ', 'Cdim', [0, 3, 6], '不安・不穏・ホラー'],
      ['オーギュメント', 'Caug', [0, 4, 8], '不思議・夢・ミステリアス'],
      ['アド・ナインス', 'Cadd9', [0, 4, 7, 14], '透明感・広がり・エモい'],
    ].map(c => ({ name:c[0], en:c[1], desc:c[3], h:100, stage:'free', replay:false, search:c[1],
      demo:`<div class="snd"><button class="snd-play" aria-label="${c[0]}を再生">▶</button><span class="snd-notes">${c[2].map(i => ['ド','ド#','レ','ミ♭','ミ','ファ','ファ#','ソ','ソ#','ラ','シ♭','シ','ド','レ♭','レ'][i]).join('・')}</span></div>`,
      init:(el) => { $(el, '.snd-play').onclick = () => c[2].forEach((i, k) => { tone({ f:N(60 + i), at:k * .03, dur:1.4, type:'triangle', vol:.16 }); }); } })) },
    { title:'音階（スケール）', note:'メロディに使う音の並び。<b>日本らしさ・沖縄らしさ</b>も音階で出せます。', items:[
      ['メジャースケール', 'Major（ドレミファソラシド）', [0, 2, 4, 5, 7, 9, 11, 12], '明るい。最も基本的な音階'],
      ['ナチュラルマイナー', 'Natural Minor', [0, 2, 3, 5, 7, 8, 10, 12], '暗い・哀愁'],
      ['ヨナ抜き長音階', 'Major Pentatonic（ファとシを抜く）', [0, 2, 4, 7, 9, 12], '演歌・童謡・J-POPの懐かしさ。ペンタトニック'],
      ['ブルーススケール', 'Blues', [0, 3, 5, 6, 7, 10, 12], 'ブルース・ロック・ジャズの泥臭さ'],
      ['都節音階（和風）', 'Miyako-bushi（Japanese In scale）', [0, 1, 5, 7, 8, 12], '琴・さくらさくら。<b>和風・和の怪談</b>'],
      ['琉球音階', 'Ryukyu scale', [0, 4, 5, 7, 11, 12], '沖縄民謡の明るく南国的な響き'],
      ['全音音階', 'Whole Tone', [0, 2, 4, 6, 8, 10, 12], '夢の中・魔法・回想'],
      ['クロマチック', 'Chromatic（半音階）', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], '緊張感・コミカルな動き'],
    ].map(s => ({ name:s[0], en:s[1], desc:s[3], h:100, stage:'free', replay:false, search:s[1],
      demo:`<div class="snd"><button class="snd-play" aria-label="${s[0]}を再生">▶</button><span class="snd-keys">${s[2].map(() => '<i></i>').join('')}</span></div>`,
      init:(el) => { const ks = $$(el, '.snd-keys i'); $(el, '.snd-play').onclick = () => s[2].forEach((i, k) => { tone({ f:N(62 + i), at:k * .2, dur:.35, type:'triangle', vol:.22 }); setTimeout(() => { ks[k].classList.add('on'); setTimeout(() => ks[k].classList.remove('on'), 200); }, k * 200); }); } })) },
    { title:'リズムとテンポ', items:[
      { name:'メトロノーム（BPM）', en:'Tempo / Beats Per Minute', h:170, stage:'free',
        demo:'<div class="snd-metro"><div class="beats"><i></i><i></i><i></i><i></i></div><label><b class="bpm">100</b> BPM <input type="range" min="50" max="200" value="100"></label><span class="tname">Moderato（中くらい）</span><button class="snd-btn">▶ スタート</button></div>',
        init:(el) => { let on = false, timer = null, k = 0; const r = $(el, 'input'), b = $(el, '.bpm'), tn = $(el, '.tname'), bs = $$(el, '.beats i'), btn = $(el, '.snd-btn'); const name = (v) => v < 66 ? 'Adagio（ゆっくり）' : v < 80 ? 'Andante（歩く速さ）' : v < 110 ? 'Moderato（中くらい）' : v < 150 ? 'Allegro（速く）' : 'Presto（とても速く）'; r.oninput = () => { b.textContent = r.value; tn.textContent = name(+r.value); if (on){ stop(); start(); } }; const tick = () => { tone({ f:k % 4 ? 1000 : 1600, dur:.04, type:'square', vol:.12, sustain:true }); bs.forEach((x, j) => x.classList.toggle('on', j === k % 4)); k++; }; const start = () => { on = true; btn.textContent = '■ ストップ'; tick(); timer = setInterval(tick, 60000 / r.value); }; const stop = () => { on = false; btn.textContent = '▶ スタート'; clearInterval(timer); bs.forEach(x => x.classList.remove('on')); k = 0; }; btn.onclick = () => on ? stop() : start(); return stop; },
        desc:'BPM＝1分間の拍の数。曲の速さの目安：<b>60〜80</b> バラード・Lo-fi、<b>90〜110</b> ヒップホップ・ポップ、<b>120〜130</b> ハウス・ダンス、<b>140〜180</b> ドラムンベース・速いロック。リズムゲームや動画のカット割りの基準にも。', prompt:'BPMを指定すると正確なタイミングで鳴るメトロノームを作って。setIntervalではなくAudioContextの時間で先読みスケジューリングして、ズレないようにして。' },
      { name:'ドラムマシン（ステップシーケンサー）', en:'Step Sequencer / Drum Machine', h:230, stage:'free', wide:true,
        demo:'<div class="snd-seq"><div class="rows"></div><div class="ctl"><button class="snd-btn">▶ 再生</button><label>BPM <input type="range" min="70" max="160" value="92"><b>92</b></label><button class="snd-btn ghost" data-p="lofi">Lo-fi</button><button class="snd-btn ghost" data-p="house">ハウス</button><button class="snd-btn ghost" data-p="rock">ロック</button><button class="snd-btn ghost" data-p="clear">クリア</button></div></div>',
        init:(el) => {
          const inst = [['キック', () => tone({ f:150, f2:40, dur:.35, vol:.9, slide:.12 })], ['スネア', () => { noise({ filter:'highpass', f:1200, dur:.18, vol:.5 }); tone({ f:220, f2:150, dur:.1, vol:.25 }); }], ['ハイハット', () => noise({ filter:'highpass', f:7000, dur:.05, vol:.3 })], ['クラップ', () => [0, .012, .024].forEach(at => noise({ filter:'bandpass', f:1500, q:1.5, at, dur:.09, vol:.5 }))]];
          const P = { lofi:['1000000010100000','0000100000001000','1010101010101011','0000000000000000'], house:['1000100010001000','0000100000001000','0010001000100010','0000000000001000'], rock:['1000000010100000','0000100000001000','1010101010101010','0000000000000000'], clear:['0'.repeat(16),'0'.repeat(16),'0'.repeat(16),'0'.repeat(16)] };
          const rows = $(el, '.rows'); rows.innerHTML = inst.map((x, r) => `<div class="r"><span>${x[0]}</span>${Array.from({ length:16 }, (_, c) => `<button data-r="${r}" data-c="${c}" class="${c % 4 === 0 ? 'q' : ''}"></button>`).join('')}</div>`).join('');
          const cells = $$(rows, 'button[data-r]'); const set = (p) => cells.forEach(b => b.classList.toggle('on', P[p][b.dataset.r][b.dataset.c] === '1')); set('lofi');
          cells.forEach(b => b.onclick = () => { b.classList.toggle('on'); if (b.classList.contains('on')) inst[b.dataset.r][1](); });
          $$(el, '[data-p]').forEach(b => b.onclick = () => set(b.dataset.p));
          const r = $(el, 'input'), bv = $(el, '.ctl b'); r.oninput = () => bv.textContent = r.value;
          let on = false, step = 0, t = null; const play = $(el, '.snd-btn');
          const tick = () => { cells.forEach(b => b.classList.toggle('now', +b.dataset.c === step)); cells.filter(b => +b.dataset.c === step && b.classList.contains('on')).forEach(b => inst[b.dataset.r][1]()); step = (step + 1) % 16; t = setTimeout(tick, 60000 / r.value / 4); };
          const stop = () => { on = false; clearTimeout(t); play.textContent = '▶ 再生'; cells.forEach(b => b.classList.remove('now')); step = 0; };
          play.onclick = () => { if (on) return stop(); on = true; play.textContent = '■ 停止'; ctx(); tick(); };
          return stop;
        },
        desc:'16個のマス（16分音符）で、どのタイミングで何を鳴らすかを決めるリズムマシン。<b>キック（低音）・スネア（タン）・ハイハット（チッ）</b>の組み合わせでジャンルが変わる。マスをクリックして自分でも打ち込める。', prompt:'4トラック×16ステップのドラムマシンをWeb Audio APIで作って。音はすべて合成（キック・スネア・ハイハット・クラップ）、BPM変更、パターン保存（localStorage）、再生位置のハイライト付きで。' },
      { name:'拍子', en:'Time Signature（4/4・3/4・6/8）', desc:'<b>4/4</b>＝ほとんどのポップス・ロック。<b>3/4</b>＝ワルツ（ズンチャッチャ）。<b>6/8</b>＝ゆったり揺れる感じ（バラード・アイリッシュ）。', prompt:'3/4拍子のワルツ風のBGMを作って。' },
      { name:'スウィング・シャッフル', en:'Swing / Shuffle', desc:'リズムを「タッ・タ、タッ・タ」と跳ねさせる。ジャズ・Lo-fi・ブルースの心地よいノリ。', prompt:'ドラムパターンにスウィング（2つ目の8分音符を少し遅らせる）を60%かけて、Lo-fiっぽいノリにして。' },
    ]},
    { title:'音の高さ', layout:'rows', items:[
      { name:'音名と周波数', en:'A4 = 440Hz', desc:'基準のラ（A4）＝440Hz。1オクターブ上がると周波数は2倍。半音上がるごとに約1.0595倍。<b>MIDIノート番号</b>（ド＝60）から <code>440 × 2^((n−69)/12)</code> で計算できる。', code:'const freq = (note) => 440 * Math.pow(2, (note - 69) / 12);\nfreq(60); // 261.6Hz（真ん中のド）' },
      { name:'音域の目安', en:'Frequency Range', desc:'人の耳はおよそ20Hz〜20kHz。<b>低音（〜250Hz）</b>＝ベース・キックの迫力、<b>中音（250Hz〜2kHz）</b>＝声・楽器の本体、<b>高音（2kHz〜）</b>＝明瞭さ・きらめき。スマホのスピーカーは低音がほぼ出ない。' },
    ]},
  ]
});

/* ---------- BGMの語彙 ---------- */
const G = (name, en, desc, prompt) => ({ name, en, desc, prompt });
TABS.push({
  id:'bgm', label:'BGMジャンル語彙', icon:'♬',
  intro:'BGMを探すとき・音楽生成AI（Suno・Udio など）に指示するときのジャンルと雰囲気の語彙。<b>ジャンル＋雰囲気＋テンポ＋楽器＋ボーカルの有無</b>を組み合わせて伝えます。「AIへの指示例」は日本語でそのまま使えます。英語の方が安定するサービスでは、下の表の英語の言い方を添えてください。',
  sections:[
    { title:'プロンプトの組み立て方', layout:'rows', items:[
      { name:'音楽プロンプトの型', en:'Genre + Mood + Tempo + Instruments + Vocals + Use', tags:['まずはこれ'], desc:'例：「ジャンル：Lo-fi hip hop／雰囲気：落ち着いた・少し切ない／テンポ：80BPM／楽器：エレピ・ビニールノイズ・柔らかいドラム／ボーカル：なし／用途：勉強用・ループ可能」。<b>アーティスト名の指定は規約で禁止</b>されていることが多いので、特徴を言葉で説明する。', prompt:'Lo-fiヒップホップ。落ち着いていて少し切ない雰囲気、テンポは80BPM。まろやかなエレクトリックピアノ、レコードのパチパチというノイズ、柔らかいブーンバップのドラム。ボーカルなしで、勉強用に継ぎ目なくループできる曲にして。' },
      { name:'動画BGMの選び方', en:'Picking Background Music', desc:'<b>話がメインの動画はボーカルなし</b>（声とぶつかる）。テンポはカット割りの速さに合わせる。冒頭とサビ（盛り上がり）の位置を編集の見せ場に合わせると気持ちいい。' },
    ]},
    { title:'定番ジャンル', layout:'rows', items:[
      G('Lo-fi Hip Hop', 'ローファイ・ヒップホップ', 'ゆったり・ノスタルジック。ビニールノイズとくぐもった音。勉強・作業用、Vlog。', 'Lo-fiヒップホップのビート。リラックスした懐かしい雰囲気で、ジャズっぽいコード、レコードのノイズ、テンポ75BPM、インストゥルメンタル。'),
      G('City Pop', 'シティポップ', '80年代日本の都会的でおしゃれなポップス。夜のドライブ、レトロな映像。', '80年代の日本のシティポップ。グルーヴィーなベースライン、明るいシンセブラス、アップテンポで、懐かしい夜のドライブの雰囲気。'),
      G('Chiptune / 8-bit', 'チップチューン', 'ファミコン風の電子音。ゲーム、レトロ、ポップな解説動画。', 'チップチューン（8bit）のゲーム音楽。元気で、矩形波のメロディ、レトロゲーム風、テンポ140BPM。'),
      G('Epic Orchestral', 'エピック・オーケストラ', '壮大なオーケストラと太鼓。予告編、ゲームのボス戦、感動的な場面。', '壮大な映画風オーケストラ。力強い太鼓、合唱、高まっていく緊張感、英雄的なクライマックス。'),
      G('Cinematic Ambient', 'シネマティック・アンビエント', '静かに広がる音の雲。ドキュメンタリー、自然、宇宙。', '映画的なアンビエント。ゆっくり変化するシンセパッド、やさしいピアノ、広がりのある感動的な曲。ドラムなし。'),
      G('Corporate Upbeat', 'コーポレート（企業VP風）', '明るく前向きなアコギ・ピアノ・手拍子。会社紹介、サービス紹介、YouTube解説の定番。', '明るく前向きな企業紹介向けBGM。アコースティックギター、軽やかなピアノ、手拍子、ポジティブでやる気が出る雰囲気。'),
      G('EDM / House', 'EDM・ハウス', '4つ打ちのダンスミュージック。スポーツ、イベント、テンポの速い動画。', 'エネルギッシュなハウスミュージック。4つ打ちのキック、高揚感のあるシンセ、テンポ124BPM、フェスのような雰囲気。'),
      G('Synthwave', 'シンセウェイブ', '80年代風シンセ。夜の都市、ネオン、レトロフューチャー。', 'シンセウェイブ。80年代レトロ、脈打つベース、厚みのあるアナログシンセ、ネオンの夜の街、テンポ100BPM。'),
      G('Acoustic Folk', 'アコースティック・フォーク', 'アコギとやさしい歌。旅、日常、手作り感。', '温かいアコースティック・フォーク。指弾きのギター、やさしく心のこもった、朝の日差しのような雰囲気。'),
      G('Jazz / Bossa Nova', 'ジャズ・ボサノバ', 'カフェの大人っぽいBGM。料理、カフェ、夜のくつろぎ。', 'なめらかなボサノバ。ナイロン弦のギター、やわらかいブラシのドラム、くつろいだカフェの雰囲気。'),
      G('Piano Ballad', 'ピアノバラード', 'ピアノ中心の切ない曲。感動、別れ、回想。', '感動的なピアノソロのバラード。ゆっくりで、やさしく、ほろ苦い。'),
      G('Kawaii Future Bass', 'カワイイ・フューチャーベース', 'キラキラしたシンセとかわいい声ネタ。かわいい系、アニメ、配信。', 'カワイイ・フューチャーベース。キラキラしたシンセ、かわいい声ネタ、弾むようでカラフルな曲。'),
      G('Japanese Traditional', '和風（和楽器）', '琴・尺八・三味線・和太鼓。和風の映像、旅館、時代劇風。', '伝統的な和風の音楽。琴と尺八、落ち着いた上品な雰囲気、禅の庭のような静けさ。'),
      G('Horror Ambient', 'ホラー・不穏', '不協和音、低いドローン、ささやき。ホラー、ミステリー。', '暗いホラーのアンビエント。低いドローン音、不協和音の弦楽器、不安をあおる雰囲気。'),
      G('RPG Town / Battle', 'RPG（町・戦闘）', 'ゲーム音楽の定番。町＝ほのぼの、戦闘＝速く緊迫。', 'ファンタジーRPGの町のテーマ。陽気なフルートと弦楽器、平和な村の雰囲気。'),
      G('Trap / Phonk', 'トラップ・フォンク', '重い808ベースと速いハイハット。かっこいい系ショート動画、車、スポーツ。', 'ダークなフォンク。重い808ベース、カウベルのメロディ、攻撃的なドリフトの雰囲気。'),
    ]},
    { title:'雰囲気・楽器の語彙', table:{ head:['日本語','英語での言い方','使いどころ'], rows:[
      ['明るい・元気','upbeat, cheerful, energetic','商品紹介、Vlog、子ども向け'],
      ['落ち着いた','calm, relaxed, laid-back','作業用、カフェ、解説'],
      ['切ない・エモい','melancholic, nostalgic, bittersweet','回想、青春、別れ'],
      ['壮大','epic, grand, cinematic','オープニング、予告編'],
      ['おしゃれ','chic, stylish, sophisticated','ファッション、インテリア'],
      ['かわいい','cute, playful, bubbly','キャラクター、子ども向け'],
      ['緊張・不穏','tense, suspenseful, ominous','ミステリー、ホラー'],
      ['神秘的','mystical, ethereal, dreamy','ファンタジー、宇宙'],
      ['ピアノ／エレピ','piano / electric piano (Rhodes)','バラード／Lo-fi・ジャズ'],
      ['アコギ／エレキ','acoustic guitar / electric guitar','フォーク／ロック'],
      ['ストリングス','strings, violin, cello','感動、映画'],
      ['シンセパッド','synth pads','アンビエント、SF'],
      ['808ベース','808 bass','ヒップホップ、トラップ'],
      ['ボーカルなし','instrumental, no vocals','トーク動画のBGM'],
      ['ループ可能','seamless loop','ゲーム、配信の待機画面'],
    ]} },
  ]
});

/* ---------- 用語・ツール ---------- */
TABS.push({
  id:'terms', label:'音響用語・ツール', icon:'⚙',
  intro:'音のデータ・加工・制作の用語と、アプリに音を組み込むためのライブラリ・素材・AIツール。動画の音の整え方は <a href="video.html#audio">動画制作辞典の「音・音響」</a> も参照してください。',
  sections:[
    { title:'音のデータの用語', layout:'rows', items:[
      { name:'デシベル（dB）', en:'Decibel', desc:'音の大きさの単位。デジタルでは0dBが最大で、それより小さい音はマイナスで表す（-6dBで約半分の振幅）。0dBを超えると音割れ（クリッピング）。' },
      { name:'サンプルレート', en:'Sample Rate（44.1kHz / 48kHz）', desc:'1秒間に音を何回記録するか。音楽CDは44.1kHz、動画は48kHz。' },
      { name:'ビットレート', en:'Bitrate（128 / 192 / 320 kbps）', desc:'圧縮音声の1秒あたりのデータ量。MP3なら192kbps以上で十分、効果音は小さくてよい。' },
      { name:'ファイル形式', en:'WAV / MP3 / AAC / OGG / Opus / WebM', desc:'<b>WAV</b>＝無圧縮・編集用。<b>MP3/AAC</b>＝互換性重視。<b>OGG/Opus/WebM</b>＝Webで軽量・高音質。Webゲームは webm＋mp3 の2種類を用意すると安全。' },
      { name:'モノラル／ステレオ／パン', en:'Mono / Stereo / Pan', desc:'ステレオは左右2チャンネル。パン＝左右の定位。ゲームで音源の位置に合わせて左右に振ると臨場感が出る（StereoPannerNode）。' },
      { name:'ループ／ステム', en:'Loop / Stems', desc:'ループ＝継ぎ目なく繰り返せる音源（ゲームBGM）。ステム＝ドラム・ベース・メロディなどパートごとに分けた音源（盛り上がりで重ねる演出に）。' },
    ]},
    { title:'加工・エフェクト', layout:'rows', items:[
      { name:'フィルター', en:'Lowpass / Highpass / Bandpass', desc:'特定の周波数だけを通す。ローパス＝こもった音（壁の向こう・水中）、ハイパス＝薄い音（電話・ラジオ）。', prompt:'ポーズ画面を開いている間は、BGMにローパスフィルターをかけてこもった音にして。' },
      { name:'リバーブ／ディレイ', en:'Reverb / Delay', desc:'リバーブ＝空間の残響（洞窟・ホール）。ディレイ＝やまびこのような繰り返し。Web AudioではConvolverNode／DelayNode。' },
      { name:'LFO（ゆらぎ）', en:'Low Frequency Oscillator', desc:'ゆっくりした波で音程や音量を揺らす。ビブラート・トレモロ・ワウ。' },
      { name:'コンプレッサー', en:'Compressor', desc:'大きい音を抑えて音量をそろえる。たくさんの効果音が重なっても音割れしにくくなる（DynamicsCompressorNode）。' },
      { name:'ピッチシフト／ランダム化', en:'Pitch Variation', desc:'同じ効果音でも<b>毎回少しだけ音程を変える</b>と、機械的な繰り返し感が消える（足音・打撃音）。', prompt:'足音の効果音を鳴らすたびに、再生速度を0.9〜1.1倍でランダムに変えて単調にならないようにして。' },
    ]},
    { title:'ライブラリ・ツール', layout:'rows', items:[
      { name:'Web Audio API', en:'ブラウザ標準', tags:['無料','標準'], url:'https://developer.mozilla.org/ja/docs/Web/API/Web_Audio_API', desc:'この辞典の音はすべてこれで合成。発振器・フィルター・エフェクト・解析（波形表示）まで可能。' },
      { name:'Howler.js', en:'howlerjs.com', tags:['効果音・BGM再生の定番'], url:'https://howlerjs.com/', desc:'音声ファイルの再生を簡単・確実にするライブラリ。スプライト（1ファイルに複数の効果音）、フェード、ループ、立体音響。' },
      { name:'Tone.js', en:'tonejs.github.io', tags:['音楽アプリ'], url:'https://tonejs.github.io/', desc:'シンセ・シーケンサー・エフェクトを音楽的に扱えるライブラリ。作曲ツールやリズムゲームに。', prompt:'Tone.jsで、Cメジャーのコード進行（C-Am-F-G）を自動で演奏するLo-fiビートを作って。' },
      { name:'ZzFX / jsfxr', en:'効果音ジェネレーター', tags:['8bit効果音'], url:'https://killedbyapixel.github.io/ZzFX/', desc:'パラメータの数値列だけでレトロな効果音を生成。ツール上で音を探してコードをコピーするだけ。ゲームジャムで人気。' },
      { name:'wavesurfer.js', en:'波形表示', url:'https://wavesurfer.xyz/', desc:'音声の波形を表示・再生・区間選択できる。ポッドキャスト・音声編集ツールに。' },
      { name:'Strudel', en:'ライブコーディング', url:'https://strudel.cc/', desc:'コードを書きながら音楽をリアルタイムに演奏するツール。コードで音楽を作る遊び・学習に。' },
    ]},
    { title:'AI音楽・音声生成', layout:'rows', items:[
      { name:'Suno / Udio', en:'歌・BGM生成', tags:['商用は規約確認'], desc:'テキストから歌詞付きの曲やBGMを生成。商用利用の可否はプランによる。', links:[['Suno', 'https://suno.com/']] },
      { name:'ElevenLabs Sound Effects', en:'効果音生成', desc:'「木のドアがきしむ音」のような説明から効果音を生成。' },
      { name:'Stable Audio / MusicGen', en:'音楽生成', desc:'Stable Audio（Stability AI）や、オープンソースのMusicGen（ローカルで動かせる）でBGMやループを生成。' },
    ]},
    { title:'無料の音素材サイト', layout:'rows', items:[
      { name:'効果音ラボ', en:'soundeffect-lab.info', url:'https://soundeffect-lab.info/', tags:['日本','商用可'], desc:'日本の定番効果音サイト。ボタン音・バラエティ・アニメ風・環境音まで豊富。' },
      { name:'OtoLogic', en:'otologic.jp', url:'https://otologic.jp/', tags:['日本'], desc:'効果音とBGM。クレジット表記で商用利用可。' },
      { name:'魔王魂 / DOVA-SYNDROME / 甘茶の音楽工房', en:'日本のBGM', url:'https://dova-s.jp/', tags:['日本','BGM'], desc:'動画・ゲーム向けの無料BGMの定番。曲ごとに利用規約を確認。' },
      { name:'Kenney Audio', en:'kenney.nl', url:'https://kenney.nl/assets/category:Audio', tags:['CC0'], desc:'ゲーム用のUI音・効果音パック。CC0（パブリックドメイン）で自由に使える。' },
      { name:'Freesound / Pixabay Music', en:'海外', url:'https://freesound.org/', desc:'Freesoundは膨大な効果音（ライセンスは音ごとに異なる）。Pixabay Musicは商用可のBGM。' },
    ]},
  ]
});
})();
