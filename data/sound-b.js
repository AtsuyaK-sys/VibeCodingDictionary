/* サウンド・効果音辞典 — 追加分：自分で作る（Web Audio の音づくり・読み上げ・書き出し） */
(function(){
const $ = (el, s) => el.querySelector(s), $$ = (el, s) => [...el.querySelectorAll(s)];
const T = (name, en, desc, prompt, tags, more) => Object.assign({ name, en, desc, prompt, tags }, more || {});
let ac = null; const A = () => { if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); return ac; };

// 音を組み立てる（ctx と出力先を受け取るので、再生にも書き出しにも使える）
function voice(a, dest, p, t0 = a.currentTime){
  const o = a.createOscillator(), g = a.createGain(); o.type = p.type; o.frequency.setValueAtTime(p.f, t0);
  if (p.f2 !== p.f) o.frequency.exponentialRampToValueAtTime(Math.max(20, p.f2), t0 + p.a + p.d);
  const pk = p.vol, sus = pk * p.s;
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(pk, t0 + p.a); g.gain.linearRampToValueAtTime(sus, t0 + p.a + p.d);
  g.gain.setValueAtTime(sus, t0 + p.a + p.d + p.hold); g.gain.linearRampToValueAtTime(0, t0 + p.a + p.d + p.hold + p.r);
  o.connect(g).connect(dest); o.start(t0); o.stop(t0 + p.a + p.d + p.hold + p.r + .05); return p.a + p.d + p.hold + p.r;
}
const PRESETS = { 'コイン':{ type:'square', f:988, f2:1319, a:.005, d:.08, s:.6, hold:.08, r:.15, vol:.25 }, 'ジャンプ':{ type:'square', f:300, f2:700, a:.01, d:.15, s:.3, hold:0, r:.1, vol:.25 }, 'レーザー':{ type:'sawtooth', f:1400, f2:200, a:.005, d:.25, s:.1, hold:0, r:.05, vol:.2 }, 'ポップ':{ type:'sine', f:500, f2:900, a:.003, d:.05, s:0, hold:0, r:.05, vol:.5 }, 'ふわっと':{ type:'triangle', f:440, f2:440, a:.3, d:.3, s:.6, hold:.3, r:.8, vol:.3 } };
const KEYS = [['type', '波形'], ['f', '始めの高さ（Hz）', 60, 2000, 1], ['f2', '終わりの高さ（Hz）', 60, 2000, 1], ['a', 'アタック（秒）', 0, 1, .005], ['d', 'ディケイ（秒）', 0, 1, .01], ['s', 'サステイン（音量の割合）', 0, 1, .05], ['hold', '伸ばす長さ（秒）', 0, 1.5, .01], ['r', 'リリース（秒）', 0, 1.5, .01]];
const codeOf = (p) => `const ctx = new AudioContext();
const osc = ctx.createOscillator();
const gain = ctx.createGain();
const t = ctx.currentTime;
osc.type = '${p.type}';
osc.frequency.setValueAtTime(${p.f}, t);${p.f2 !== p.f ? `\nosc.frequency.exponentialRampToValueAtTime(${p.f2}, t + ${(p.a + p.d).toFixed(3)});` : ''}
gain.gain.setValueAtTime(0, t);
gain.gain.linearRampToValueAtTime(${p.vol}, t + ${p.a});            // アタック
gain.gain.linearRampToValueAtTime(${(p.vol * p.s).toFixed(3)}, t + ${(p.a + p.d).toFixed(3)});   // ディケイ
gain.gain.setValueAtTime(${(p.vol * p.s).toFixed(3)}, t + ${(p.a + p.d + p.hold).toFixed(3)});
gain.gain.linearRampToValueAtTime(0, t + ${(p.a + p.d + p.hold + p.r).toFixed(3)});  // リリース
osc.connect(gain).connect(ctx.destination);
osc.start(t);
osc.stop(t + ${(p.a + p.d + p.hold + p.r + .05).toFixed(3)});`;

function synth(el){ let p = Object.assign({}, PRESETS['コイン']);
  $(el, '.pre').innerHTML = Object.keys(PRESETS).map(k => `<button type="button">${k}</button>`).join('');
  const f = $(el, '.sb-form');
  f.innerHTML = KEYS.map(([k, l, mn, mx, st]) => k === 'type' ? `<span>${l}</span><select data-k="type">${['sine', 'square', 'sawtooth', 'triangle'].map(t => `<option value="${t}">${{ sine:'サイン（やわらか）', square:'矩形（ピコピコ）', sawtooth:'ノコギリ（ジリジリ）', triangle:'三角（まるい）' }[t]}</option>`).join('')}</select><i></i>` : `<span>${l}</span><input type="range" min="${mn}" max="${mx}" step="${st}" data-k="${k}" aria-label="${l}"><output data-o="${k}"></output>`).join('');
  const sync = () => { KEYS.forEach(([k]) => { const i = $(f, `[data-k="${k}"]`); i.value = p[k]; const o = $(f, `[data-o="${k}"]`); if (o) o.textContent = p[k]; }); $(el, '.sb-code').textContent = codeOf(p); drawEnv(); };
  const drawEnv = () => { const c = $(el, 'canvas'), g = c.getContext('2d'), w = c.width = c.clientWidth * 2, h = c.height = c.clientHeight * 2, tot = p.a + p.d + p.hold + p.r || .01, X = (t) => t / tot * (w - 8) + 4, Y = (v) => h - 4 - v * (h - 8);
    g.clearRect(0, 0, w, h); g.strokeStyle = getComputedStyle(el).getPropertyValue('--accent') || '#c2410c'; g.lineWidth = 3; g.beginPath(); g.moveTo(X(0), Y(0)); g.lineTo(X(p.a), Y(1)); g.lineTo(X(p.a + p.d), Y(p.s)); g.lineTo(X(p.a + p.d + p.hold), Y(p.s)); g.lineTo(X(tot), Y(0)); g.stroke();
    g.fillStyle = '#888'; g.font = '20px sans-serif'; [['A', p.a / 2], ['D', p.a + p.d / 2], ['S', p.a + p.d + p.hold / 2], ['R', p.a + p.d + p.hold + p.r / 2]].forEach(([t, x]) => g.fillText(t, X(x) - 6, h - 10)); };
  $$(f, 'input, select').forEach(i => i.oninput = i.onchange = () => { p[i.dataset.k] = i.dataset.k === 'type' ? i.value : +i.value; sync(); });
  $$(el, '.pre button').forEach(b => b.onclick = () => { p = Object.assign({}, PRESETS[b.textContent]); sync(); voice(A(), A().destination, p); });
  $(el, '.play').onclick = () => voice(A(), A().destination, p);
  $(el, '.cp').onclick = () => VD.copyText(codeOf(p));
  // WAV に書き出す（OfflineAudioContext で同じ音を計算して、ファイルにする）
  $(el, '.wav').onclick = async () => { const dur = p.a + p.d + p.hold + p.r + .1, sr = 44100, off = new OfflineAudioContext(1, Math.ceil(sr * dur), sr); voice(off, off.destination, p, 0); const buf = await off.startRendering(), d = buf.getChannelData(0);
    const v = new DataView(new ArrayBuffer(44 + d.length * 2)), ws = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
    ws(0, 'RIFF'); v.setUint32(4, 36 + d.length * 2, true); ws(8, 'WAVE'); ws(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); ws(36, 'data'); v.setUint32(40, d.length * 2, true);
    d.forEach((s, i) => v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, s)) * 0x7fff, true));
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([v], { type:'audio/wav' })); a.download = 'sound.wav'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); };
  sync();
}

function tts(el){ const ok = 'speechSynthesis' in window, sel = $(el, 'select'), st = $(el, '.st');
  if (!ok){ st.textContent = 'このブラウザは読み上げ（音声合成）に対応していません。'; return; }
  const load = () => { const vs = speechSynthesis.getVoices(), ja = vs.filter(v => /^ja/i.test(v.lang)), list = ja.length ? ja : vs; sel.innerHTML = list.map(v => `<option value="${v.name}">${v.name}（${v.lang}）</option>`).join('') || '<option>（標準の声）</option>'; st.textContent = `この端末で使える声：全部で ${vs.length} 個、そのうち日本語 ${ja.length} 個`; };
  load(); speechSynthesis.onvoiceschanged = load;
  const rg = (c) => +$(el, c).value; $$(el, 'input[type=range]').forEach(i => i.oninput = () => { i.nextElementSibling.textContent = i.value; });
  $(el, '.go').onclick = () => { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance($(el, 'textarea').value); const v = speechSynthesis.getVoices().find(x => x.name === sel.value); if (v) u.voice = v; u.lang = v ? v.lang : 'ja-JP'; u.rate = rg('.rt'); u.pitch = rg('.pt'); u.volume = rg('.vl'); speechSynthesis.speak(u); };
  $(el, '.stop').onclick = () => speechSynthesis.cancel();
  return () => { try{ speechSynthesis.cancel(); }catch(e){} };
}

TABS.push({ id:'make', label:'自分で作る', icon:'🎛',
  intro:'ここまでの効果音は、すべてブラウザの <b>Web Audio API</b> でその場で作っています。このタブでは、<b>自分で音を組み立て</b>、そのまま使えるコードや WAV ファイルにする方法と、<b>文字を読み上げる</b>（音声合成）方法を扱います。最初の音は、ボタンを押したあとにしか鳴らせない決まりがあります。',
  sections:[
    { title:'触って作る', items:[
      { name:'効果音を組み立てる', en:'Synth builder (Web Audio)', h:540, wide:true, tags:['Web Audio','体験','最重要'],
        demo:'<div class="sb"><div class="sb-row"><span class="sb-lbl">ひな形</span><span class="pre sb-pre"></span></div><div class="sb-two"><div class="sb-left"><div class="sb-form"></div><canvas class="sb-env" aria-label="音量の変化（エンベロープ）"></canvas><div class="sb-row"><button type="button" class="snd-btn play">▶ 鳴らす</button><button type="button" class="snd-btn ghost wav">WAV で保存</button><button type="button" class="snd-btn ghost cp">コードをコピー</button></div></div><pre class="sb-code"></pre></div></div>',
        init:(el) => synth(el),
        desc:'音は「<b>どんな波形で（音色）・どの高さから・どう音量が変わるか（エンベロープ ADSR）</b>」でほぼ決まります。数値を動かすと、右のコードもその場で変わります。「WAV で保存」は、同じ音をブラウザの中で計算してファイルにします（外部に送信しません）。',
        prompt:'Web Audio API で、ゲーム用の効果音（コイン取得・ジャンプ・被弾・ゲームオーバー）を鳴らす関数を作って。音声ファイルは使わず、オシレーターとゲインで作る。最初のクリックで AudioContext を開始し、全体の音量とミュートを1か所で変えられるようにして。' },
      { name:'文字を読み上げる（音声合成）', en:'Speech synthesis', h:400, tags:['読み上げ','体験'],
        demo:'<div class="sb"><textarea class="sb-ta" aria-label="読み上げる文">こんにちは。サンプル商店へようこそ。本日のおすすめは、焼きたてのクロワッサンです。</textarea><div class="sb-form2"><span>声</span><select aria-label="声"></select><span>速さ</span><span class="r"><input type="range" class="rt" min="0.5" max="2" step="0.1" value="1" aria-label="速さ"><output>1</output></span><span>高さ</span><span class="r"><input type="range" class="pt" min="0" max="2" step="0.1" value="1" aria-label="高さ"><output>1</output></span><span>音量</span><span class="r"><input type="range" class="vl" min="0" max="1" step="0.1" value="1" aria-label="音量"><output>1</output></span></div><div class="sb-row"><button type="button" class="snd-btn go">🔊 読み上げる</button><button type="button" class="snd-btn ghost stop">■ 止める</button></div><div class="sb-st st"></div></div>',
        init:(el) => tts(el),
        desc:'ブラウザに入っている <b>Web Speech API</b> の音声合成です。無料・登録不要ですが、<b>使える声は端末（OS）によって違い</b>、同じ文でも聞こえ方が変わります。キャラクターの声や商用の音声が必要なら、VOICEVOX などの音声合成ソフトや有料の API を使います（利用規約とクレジット表記を確認）。',
        prompt:'Web Speech API で、ページの本文を読み上げるボタンを作って。日本語の声を優先して選び、速さ・高さを変えられるようにし、読み上げ中の段落に色を付けて。対応していないブラウザではボタンを隠して。',
        code:'const u = new SpeechSynthesisUtterance("こんにちは");\nu.lang = "ja-JP";\nu.rate = 1;   // 0.1〜10（1が標準）\nu.pitch = 1;  // 0〜2\nspeechSynthesis.speak(u);' },
    ] },
    { title:'実装のコツ', layout:'rows', items:[
      T('AudioContext は1つだけ', 'One AudioContext', '音を鳴らすたびに作らず、<b>最初に1つ作って使い回す</b>。たくさん作ると、ブラウザの上限に達して鳴らなくなります。', null, ['最重要']),
      T('ユーザー操作のあとで開始', 'Autoplay policy', 'ブラウザは、クリックやタップの前に音を出せないようにしています。最初の操作で <code>ctx.resume()</code> を呼びます。', null, null, { code:'document.addEventListener("pointerdown", () => ctx.resume(), { once: true });' }),
      T('全体の音量はゲインで', 'Master gain', 'すべての音を1つの GainNode につないでから出力すると、全体の音量とミュートを1か所で変えられます。'),
      T('音声ファイルは先に読み込む', 'Preload & decode', 'mp3 などは、最初に <code>decodeAudioData</code> で読み込んでおき、鳴らすときは使い回します。押した瞬間に読み込むと遅れます。'),
      T('同じ音の重なりすぎに注意', 'Voice limiting', '連打で同じ音が何十個も重なると、音が割れたり重くなったりします。同時に鳴らす数に上限を設けます。'),
      T('毎回少し変える', 'Randomize', '同じ効果音でも、高さを ±5% くらいランダムに変えると、機械的な感じが減ります。'),
      T('スマホの消音スイッチ', 'Mobile mute switch', 'iPhone では、本体の消音（マナー）設定のときに Web Audio の音が鳴らないことがあります。「音が出ない」と言われたら確認してもらいます。'),
      T('Howler.js・Tone.js', 'Libraries', '音声ファイルの再生と管理なら Howler.js、音楽的な作り込み（シーケンス・エフェクト）なら Tone.js が定番です（「音響用語・ツール」タブ）。'),
      T('読み上げの声は端末しだい', 'Voices vary', '<code>speechSynthesis.getVoices()</code> の結果は端末ごとに違い、読み込みに時間がかかることも（<code>voiceschanged</code> イベントで再取得）。'),
      T('音声合成ソフトの規約', 'TTS licenses', 'VOICEVOX などは、キャラクターごとに利用規約とクレジット表記の決まりがあります。動画やアプリで使う前に確認します（<a href="licenses.html#assets">著作権・ライセンス辞典</a>）。', null, ['注意']),
      T('音だけで伝えない', 'Accessibility', '音が聞こえない人・消音にしている人のために、大事な合図は<b>画面の表示でも</b>伝えます。自動で鳴る音には停止の手段を（<a href="accessibility.html#media">アクセシビリティ辞典</a>）。'),
    ] },
  ]});
})();
