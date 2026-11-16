/* 3D・WebGL・シェーダー辞典 — B: シェーダー / モデルと制作 / ライブラリと性能 / Webでの使いどころ */
(function(){
const { $, $$, esc, seg, stepper } = KIT;
const { S, C, T, verdict, cssv, load3, view3, floor3, lights3, checks, sliders, vase } = T3H;

/* ================= 5. シェーダー ================= */
const HEAD = 'uniform vec2 u_resolution;\nuniform float u_time;\nuniform vec2 u_mouse;\nvarying vec2 vUv;\n';
const PRE = '#version 300 es\nprecision highp float;\nprecision highp int;\n#define varying in\nlayout(location = 0) out highp vec4 pc_fragColor;\n#define gl_FragColor pc_fragColor\n#define texture2D texture\n';
const PRE_LINES = (PRE + HEAD).split('\n').length - 1;
const VERT = 'varying vec2 vUv;\nvoid main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
const PRESETS = [
  ['グラデーション', 'void main(){\n  vec2 st = gl_FragCoord.xy / u_resolution; // 画面の左下0〜右上1\n  gl_FragColor = vec4(st.x, st.y, 0.6, 1.0);  // 横→赤 縦→緑\n}'],
  ['円', 'void main(){\n  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;\n  float d = length(p);                    // 中心からの距離\n  float c = smoothstep(0.30, 0.29, d);    // 0.3より内側を1に（ふちはなめらか）\n  gl_FragColor = vec4(c * vec3(0.5, 0.3, 1.0), 1.0);\n}'],
  ['波', 'void main(){\n  vec2 p = gl_FragCoord.xy / u_resolution.y;\n  float v = sin(p.x * 20.0 + sin(p.y * 6.0 + u_time) * 2.0 - u_time * 2.0);\n  gl_FragColor = vec4(0.5 + 0.5 * v, 0.3, 0.9 - 0.4 * v, 1.0);\n}'],
  ['マウスで光る', 'void main(){\n  vec2 p = gl_FragCoord.xy / u_resolution.y;\n  vec2 m = u_mouse / u_resolution.y;         // マウスの位置\n  float glow = 0.03 / distance(p, m);        // 近いほど明るい\n  vec3 col = glow * vec3(1.0, 0.55, 0.2);\n  col += 0.1 * vec3(0.2, 0.1, 0.4);\n  gl_FragColor = vec4(col, 1.0);\n}'],
  ['プラズマ', 'void main(){\n  vec2 p = gl_FragCoord.xy / u_resolution.y * 4.0;\n  float t = u_time;\n  float v = sin(p.x + t) + sin(p.y + t * 1.3)\n          + sin(p.x + p.y + t * 0.7) + sin(length(p - 2.0) * 2.0 - t);\n  vec3 col = 0.5 + 0.5 * cos(v + vec3(0.0, 2.0, 4.0)); // 色相を回す定番の式\n  gl_FragColor = vec4(col, 1.0);\n}'],
  ['くり返し', 'void main(){\n  vec2 st = gl_FragCoord.xy / u_resolution.y * 6.0;\n  vec2 cell = floor(st);          // 何番目のマスか\n  vec2 f = fract(st) - 0.5;       // マスの中の位置（-0.5〜0.5）\n  float r = 0.25 + 0.15 * sin(u_time * 2.0 + cell.x + cell.y);\n  float c = smoothstep(r, r - 0.02, length(f));\n  vec3 col = 0.5 + 0.5 * cos(cell.x * 0.6 + cell.y * 0.4 + vec3(0.0, 2.0, 4.0));\n  gl_FragColor = vec4(col * c, 1.0);\n}'],
  ['ノイズ', 'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }\nfloat noise(vec2 p){\n  vec2 i = floor(p), f = fract(p);\n  vec2 u = f * f * (3.0 - 2.0 * f);\n  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),\n             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);\n}\nvoid main(){\n  vec2 p = gl_FragCoord.xy / u_resolution.y * 3.0;\n  float v = 0.0, a = 0.5;\n  for (int i = 0; i < 5; i++){       // 細かさを変えて重ねる（fbm）\n    v += a * noise(p + u_time * 0.2);\n    p *= 2.0; a *= 0.5;\n  }\n  gl_FragColor = vec4(mix(vec3(0.1, 0.2, 0.5), vec3(1.0, 0.9, 0.8), v), 1.0);\n}'],
  ['エラーの例', 'void main(){\n  vec2 st = gl_FragCoord.xy / u_resolution;\n  float v = st.x * 2;   // ← 2.0 と小数で書かないとエラー\n  gl_FragColor = vec4(v, v, v, 1.0);\n}'],
];
const FUNCS = [
  ['step', 'しきい値で0か1', (x, a) => x < a ? 0 : 1, a => `step(${a}, x)`, .5],
  ['smoothstep', 'なめらかに0→1', (x, a) => { const e0 = a - .25, e1 = a + .25, t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); }, a => `smoothstep(${(a - .25).toFixed(2)}, ${(a + .25).toFixed(2)}, x)`, .5],
  ['fract', '小数部分（くり返し）', (x, a) => { const v = x * (1 + a * 8); return v - Math.floor(v); }, a => `fract(x * ${(1 + a * 8).toFixed(1)})`, .3],
  ['sin', '波', (x, a) => .5 + .5 * Math.sin(x * (2 + a * 20)), a => `0.5 + 0.5 * sin(x * ${(2 + a * 20).toFixed(1)})`, .3],
  ['pow', 'カーブを曲げる', (x, a) => Math.pow(x, .2 + a * 4), a => `pow(x, ${(.2 + a * 4).toFixed(2)})`, .25],
  ['abs', '折り返し（山）', (x, a) => 1 - Math.abs(x * 2 - 1), () => '1.0 - abs(x * 2.0 - 1.0)', .5],
  ['clamp', '範囲に収める', (x, a) => Math.min(1, Math.max(0, (x - a * .5) * 2)), a => `clamp((x - ${(a * .5).toFixed(2)}) * 2.0, 0.0, 1.0)`, .5],
  ['mix', '2つの値を混ぜる', (x, a) => .2 * (1 - x) + .9 * x, () => 'mix(0.2, 0.9, x)', .5],
];
const GLSLF = [['step(a, x)', 'x が a 未満なら0、以上なら1。くっきりした境目'], ['smoothstep(a, b, x)', 'a〜b の間でなめらかに0→1。ふちのぼかし・フェード'], ['mix(a, b, t)', 'a と b を t の割合で混ぜる（lerp）。色の混合'], ['fract(x)', '小数部分。0〜1のくり返し（模様のタイル化）'], ['floor(x)', '切り捨て。何番目のマスか'], ['mod(x, y)', '割った余り'], ['clamp(x, a, b)', 'a〜b の範囲に収める'], ['length(v)', 'ベクトルの長さ。中心からの距離（円）'], ['distance(a, b)', '2点の距離'], ['dot(a, b)', '内積。光の当たり具合（法線とライトの向き）'], ['normalize(v)', '長さ1の向きだけにする'], ['sin / cos', '波。時間と組み合わせて動き'], ['abs(x)', '絶対値。左右対称・折り返し'], ['pow(x, n)', 'カーブの強さを変える'], ['min / max', '小さい方・大きい方。SDFの合体・切り抜き'], ['texture(tex, uv)', '画像の色を読む（古い書き方は texture2D）']];

TABS.push({ id:'shader', label:'シェーダー', icon:'✨',
  intro:'<b>シェーダー</b>はGPUで動く小さなプログラムで、<b>画面の画素ごとに「何色にするか」を同時に計算</b>します。GLSLという言語で書き、グラデーション・波・ノイズ・光る演出・画像のエフェクトなど、CPUでは重すぎる表現を軽々と動かせます。下の遊び場でコードを書き換えてみましょう。',
  sections:[
    C('触って理解する', [
      { name:'シェーダーの遊び場', en:'Fragment shader playground', h:600, tags:['体験','GLSL','定番'], wide:true,
        demo:'<div class="kt"><div class="kt-row ps"></div><div class="t3-cv kt-grow" style="min-height:120px"><span class="tip">マウスを動かすと u_mouse が変わる</span></div><textarea class="kt-in t3-code src" rows="9" spellcheck="false" aria-label="シェーダーのコード"></textarea><div class="t3-err er"></div></div>',
        init:(el) => { let apply = () => {}, k = 0; const src = $(el, '.src');
          $(el, '.ps').append(seg(PRESETS.map(p => p[0]), i => { k = i; src.value = PRESETS[i][1]; apply(); }).el);
          let tm = null; src.oninput = () => { clearTimeout(tm); tm = setTimeout(() => apply(), 350); };
          return view3(el, S => { const { T:T3, scene, r } = S; S.tone = T3.NoToneMapping; const gl = r.getContext(); const u = { u_resolution:{ value:new T3.Vector2(S.pw, S.ph) }, u_time:{ value:0 }, u_mouse:{ value:new T3.Vector2(S.pw / 2, S.ph / 2) } };
            const mesh = new T3.Mesh(new T3.PlaneGeometry(2, 2), new T3.ShaderMaterial({ uniforms:u, vertexShader:VERT, fragmentShader:HEAD + PRESETS[0][1] })); mesh.frustumCulled = false; scene.add(mesh);
            S.onShaderError = (log) => { $(el, '.er').textContent = log; };
            apply = () => { const code = src.value, sh = gl.createShader(gl.FRAGMENT_SHADER); gl.shaderSource(sh, PRE + HEAD + code); gl.compileShader(sh); const ok = gl.getShaderParameter(sh, gl.COMPILE_STATUS), log = ok ? '' : gl.getShaderInfoLog(sh) || ''; gl.deleteShader(sh);
              if (!ok){ $(el, '.er').textContent = '⚠ ' + log.trim().split('\n').slice(0, 4).map(l => l.replace(/ERROR:\s*0:(\d+):/, (m, n) => `${+n - PRE_LINES}行目：`)).join('\n'); return; }
              $(el, '.er').textContent = ''; mesh.material.fragmentShader = HEAD + code; mesh.material.needsUpdate = true; };
            S.cv.addEventListener('pointermove', (e) => { const b = S.cv.getBoundingClientRect(); u.u_mouse.value.set((e.clientX - b.left) * S.dpr, (b.bottom - e.clientY) * S.dpr); });
            apply(); S.frame = (dt) => { u.u_time.value += dt; }; }, { orbit:false, env:false }); },
        desc:'このコードは<b>画素の1つ1つで同時に実行</b>され、最後に <code>gl_FragColor</code> に入れた色がその画素の色になります。<code>gl_FragCoord</code>（画素の位置）、<code>u_time</code>（経過時間）、<code>u_mouse</code>（マウス）を使って色を計算するだけで、動く模様が作れます。数字は <b>1.0 のように小数で書く</b>のが最初のつまずきポイントです（「エラーの例」）。',
        prompt:'three.js で、全画面の背景にゆっくり動くグラデーションのシェーダーを作って。ShaderMaterial に u_time と u_resolution を渡し、ブランドカラー（#7c3aed と #0ea5e9）がノイズで混ざり合うようにして。動きを減らす設定の人には止めて。',
        code:'const material = new THREE.ShaderMaterial({\n  uniforms: {\n    u_time: { value: 0 },\n    u_resolution: { value: new THREE.Vector2(innerWidth, innerHeight) },\n  },\n  vertexShader: `\n    varying vec2 vUv;\n    void main() {\n      vUv = uv;\n      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n    }`,\n  fragmentShader: `\n    uniform float u_time;\n    varying vec2 vUv;\n    void main() {\n      vec3 col = 0.5 + 0.5 * cos(u_time + vUv.xyx + vec3(0.0, 2.0, 4.0));\n      gl_FragColor = vec4(col, 1.0);\n    }`,\n});\nrenderer.setAnimationLoop((t) => {\n  material.uniforms.u_time.value = t / 1000;   // JSから値を渡す\n  renderer.render(scene, camera);\n});' },
      { name:'形を作る関数のグラフ', en:'step / smoothstep / fract / sin…', h:430, tags:['GLSL','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="kt-grow cvb" style="position:relative"></div><div class="sl"></div><div class="kt-code cd"></div></div>',
        init:(el) => { let k = 1, draw = () => {};
          const st = sliders($(el, '.sl'), [['a', '値 a', 0, 1, .01, .5]], () => draw());
          $(el, '.sw').replaceWith(seg(FUNCS.map(f => f[0]), i => { k = i; const inp = $(el, '.sl input'); inp.value = FUNCS[i][4]; inp.dispatchEvent(new Event('input')); }, 1).el);
          const box = $(el, '.cvb'); const { ctx, w, h } = VD.canvas(box); const ink = cssv(el, '--stage-ink'), ln = cssv(el, '--border-strong'), ac = cssv(el, '--accent') || '#7c3aed';
          draw = () => { const f = FUNCS[k], pad = 22, gh = h - 46, gw = w - pad * 2; ctx.clearRect(0, 0, w, h);
            ctx.strokeStyle = ln; ctx.lineWidth = 1; ctx.strokeRect(pad, 6, gw, gh); ctx.fillStyle = ink; ctx.font = '10px monospace'; ctx.fillText('1', 8, 14); ctx.fillText('0', 8, gh + 6); ctx.fillText('x →', w - pad - 22, gh + 18);
            ctx.strokeStyle = ac; ctx.lineWidth = 2.5; ctx.beginPath(); for (let i = 0; i <= gw; i++){ const x = i / gw, y = f[2](x, st.a); ctx[i ? 'lineTo' : 'moveTo'](pad + i, 6 + gh - y * gh); } ctx.stroke();
            for (let i = 0; i < gw; i++){ const v = Math.round(f[2](i / gw, st.a) * 255); ctx.fillStyle = `rgb(${v},${v},${v})`; ctx.fillRect(pad + i, h - 18, 1.5, 14); }
            $(el, '.cd').innerHTML = `<span class="c">// ${f[1]}（下の帯＝この値を明るさにしたもの）</span>\nfloat y = <b>${f[3](st.a)}</b>;`; };
          draw(); },
        desc:'シェーダーの模様は、数個の<b>関数の組み合わせ</b>でできています。くっきり切る <code>step</code>、なめらかにつなぐ <code>smoothstep</code>、くり返す <code>fract</code>、波の <code>sin</code>。グラフの縦の値がそのまま<b>明るさ</b>（下の帯）になります。x を画面の位置にすれば模様に、時間にすればアニメーションになります。',
        prompt:'GLSLの step・smoothstep・fract・sin を使って、横じま・水玉・チェック柄・やわらかい光の輪の4つの模様をシェーダーで作って。それぞれに、どの関数が何をしているか日本語のコメントを付けて。' },
      { name:'距離で形を描く（SDF）', en:'Signed distance functions', h:440, tags:['GLSL','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="kt-grow cvb" style="position:relative;touch-action:none"></div><div class="kt-verdict res">図の上でマウスを動かしてください。</div></div>',
        init:(el) => { let k = 2, draw = () => {};
          const SH = [['円', 'length(p) - r'], ['四角', '箱の距離（sdBox）'], ['合体（min）', 'min(円, 四角)'], ['なめらか合体', 'smin(円, 四角, k)'], ['くり抜き（max）', 'max(四角, -円)']];
          $(el, '.sw').replaceWith(seg(SH.map(s => s[0]), i => { k = i; draw(); }, 2).el);
          const box = $(el, '.cvb'); const { ctx, w, h } = VD.canvas(box); const sc = Math.min(w, h) / 2.4, cx = w / 2, cy = h / 2, R = 2, iw = Math.ceil(w / R), ih = Math.ceil(h / R), img = ctx.createImageData(iw, ih);
          const tmp = document.createElement('canvas'); tmp.width = iw; tmp.height = ih; const tctx = tmp.getContext('2d'); let mouse = null;
          const circ = (x, y) => Math.hypot(x + .25, y) - .45, boxd = (x, y) => { const qx = Math.abs(x - .3) - .4, qy = Math.abs(y) - .3; return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0); };
          const smin = (a, b, kk) => { const hh = Math.max(kk - Math.abs(a - b), 0) / kk; return Math.min(a, b) - hh * hh * kk * .25; };
          const sdf = (x, y) => k === 0 ? circ(x, y) : k === 1 ? boxd(x, y) : k === 2 ? Math.min(circ(x, y), boxd(x, y)) : k === 3 ? smin(circ(x, y), boxd(x, y), .3) : Math.max(boxd(x, y), -circ(x - .25, y));
          draw = () => { for (let j = 0; j < ih; j++) for (let i = 0; i < iw; i++){ const x = (i * R - cx) / sc, y = (cy - j * R) / sc, d = sdf(x, y), band = .78 + .22 * Math.cos(d * 60), edge = 1 - Math.min(1, Math.abs(d) * sc / 1.5), o = (j * iw + i) * 4;
              let rr = d > 0 ? 235 : 70, gg = d > 0 ? 150 : 130, bb = d > 0 ? 70 : 230; const fade = Math.exp(-Math.abs(d) * 2.2); rr *= band * (.55 + .45 * fade); gg *= band * (.55 + .45 * fade); bb *= band * (.55 + .45 * fade); if (edge > 0){ rr = gg = bb = 255 * edge + rr * (1 - edge); }
              img.data[o] = rr; img.data[o + 1] = gg; img.data[o + 2] = bb; img.data[o + 3] = 255; }
            tctx.putImageData(img, 0, 0); ctx.imageSmoothingEnabled = true; ctx.drawImage(tmp, 0, 0, iw * R, ih * R);
            if (mouse){ const [mx, my] = mouse, x = (mx - cx) / sc, y = (cy - my) / sc, d = sdf(x, y); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.arc(mx, my, Math.abs(d) * sc, 0, 7); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(mx, my, 3, 0, 7); ctx.fill();
              verdict($(el, '.res'), '', `この点の距離：<b>${d.toFixed(3)}</b>（${d > 0 ? '形の<b>外側</b>：プラス' : '形の<b>内側</b>：マイナス'}）。点線の円＝形のふちまでの距離。<br>式：<code>${SH[k][1]}</code>`); } };
          box.onpointermove = (e) => { const r = box.getBoundingClientRect(); mouse = [e.clientX - r.left, e.clientY - r.top]; draw(); }; draw(); },
        desc:'<b>SDF（符号付き距離関数）</b>は「その点から形のふちまでの距離」で形を表す方法。外側はプラス、内側はマイナス、ちょうど0がふちです。<code>min</code> で合体、<code>max</code> でくり抜き、<code>smin</code> でとろけるように合体。文字のくっきり表示や、レイマーチング（数式だけで3Dを描く）の基礎です。',
        prompt:'GLSLで、SDF を使って「円と角丸の四角がなめらかにくっついたり離れたりする」アニメーションを作って。smin（smooth minimum）を使い、ふちは smoothstep でアンチエイリアスして。' },
      { name:'頂点を動かす（旗のゆれ）', en:'Vertex shader displacement', h:430, tags:['GLSL','体験'],
        demo:'<div class="kt"><div class="t3-cv kt-grow"></div><div class="sl"></div><div class="t3-checks ck"></div></div>',
        init:(el) => { let apply = () => {};
          const st = sliders($(el, '.sl'), [['amp', '波の高さ', 0, .6, .02, .25], ['freq', '波の細かさ', .5, 6, .1, 2.2], ['spd', '速さ', 0, 6, .1, 2.5]], () => apply()), ck = checks($(el, '.ck'), [['wire', '骨組み（頂点）を見る', false]], () => apply());
          return view3(el, S => { const { T:T3, scene } = S; S.tone = T3.NoToneMapping; const u = { u_time:{ value:0 }, u_amp:{ value:.25 }, u_freq:{ value:2.2 }, u_a:{ value:new T3.Color(0x7c3aed) }, u_b:{ value:new T3.Color(0x22d3ee) } };
            const mat = new T3.ShaderMaterial({ uniforms:u, side:T3.DoubleSide,
              vertexShader:'uniform float u_time, u_amp, u_freq;\nvarying float vH; varying vec2 vUv;\nvoid main(){\n  vec3 p = position;\n  float w = uv.x;  // 棒の側は動かさない\n  p.z += sin(p.x * u_freq - u_time) * u_amp * w + sin(p.y * u_freq * .7 - u_time * 1.3) * u_amp * .4 * w;\n  vH = p.z; vUv = uv;\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);\n}',
              fragmentShader:'uniform vec3 u_a, u_b; uniform float u_amp;\nvarying float vH; varying vec2 vUv;\nvoid main(){\n  float shade = 0.75 + 0.5 * vH / max(u_amp, 0.01) * 0.5;\n  vec3 col = mix(u_a, u_b, vUv.x) * shade;\n  col = mix(col, vec3(1.0), step(0.45, abs(vUv.y - 0.5)) * 0.0);\n  gl_FragColor = vec4(col, 1.0);\n}' });
            const flag = new T3.Mesh(new T3.PlaneGeometry(3.2, 2, 48, 30), mat); flag.position.set(1.6, 1.6, 0); const pole = new T3.Mesh(new T3.CylinderGeometry(.05, .05, 3.6), new T3.MeshStandardMaterial({ color:0x9ca3af, metalness:.8, roughness:.3 })); pole.position.set(0, 1, 0); lights3(S); scene.add(flag, pole);
            apply = () => { u.u_amp.value = st.amp; u.u_freq.value = st.freq; mat.wireframe = ck.wire; }; apply(); S.frame = (dt) => { u.u_time.value += dt * st.spd; }; }, { cam:[1.6, 1.6, 6], target:[1.4, 1.3, 0] }); },
        desc:'<b>頂点シェーダー</b>では、頂点の位置を動かせます。平らな板の頂点を <code>sin</code> で前後にずらすだけで、旗・水面・草のゆれが作れます。全部GPUで計算するので、CPUで1つずつ動かすより圧倒的に速いのが利点です。',
        prompt:'three.js で、風にゆれる草原を作って。草1本を細い板にして InstancedMesh で1万本並べ、頂点シェーダーで先端ほど大きく sin でゆらし、場所ごとにゆれのタイミングをずらして。' },
      { name:'画像のエフェクト（ポストプロセス）', en:'Post-processing effects', h:420, tags:['GLSL','体験','演出'],
        demo:'<div class="kt"><span class="sw"></span><div class="t3-cv kt-grow"></div><div class="kt-code cd"></div></div>',
        init:(el) => { let k = 0, apply = () => {};
          const FX = [['なし', 'gl_FragColor = texture2D(tex, uv);'], ['白黒', 'float g = dot(c.rgb, vec3(0.299, 0.587, 0.114)); // 明るさ'], ['周辺を暗く', 'c.rgb *= smoothstep(0.8, 0.2, length(uv - 0.5));'], ['色ずれ', '// R・G・B を少しずつずらして読む\nc.r = texture2D(tex, uv + off).r; c.b = texture2D(tex, uv - off).b;'], ['モザイク', 'uv = floor(uv * 40.0) / 40.0; // 座標を荒くする'], ['走査線', 'c.rgb *= 0.8 + 0.2 * sin(gl_FragCoord.y * 1.5 + u_time * 4.0);'], ['ゆらぎ', 'uv.x += sin(uv.y * 30.0 + u_time * 3.0) * 0.01;']];
          $(el, '.sw').replaceWith(seg(FX.map(f => f[0]), i => { k = i; $(el, '.cd').textContent = FX[i][1]; apply(); }).el);
          return view3(el, S => { const { T:T3, scene } = S; S.tone = T3.NoToneMapping; const c = document.createElement('canvas'); c.width = 512; c.height = 320; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 320); gr.addColorStop(0, '#60a5fa'); gr.addColorStop(.6, '#fde68a'); gr.addColorStop(.61, '#22c55e'); gr.addColorStop(1, '#15803d'); g.fillStyle = gr; g.fillRect(0, 0, 512, 320);
            g.fillStyle = '#fef08a'; g.beginPath(); g.arc(400, 70, 38, 0, 7); g.fill(); [[90, 200, 60, '#ef4444'], [230, 215, 46, '#a855f7'], [340, 225, 40, '#f97316']].forEach(([x, y, r, col]) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.arc(x - r * .3, y - r * .3, r * .25, 0, 7); g.fill(); }); g.fillStyle = '#111'; g.font = '900 44px sans-serif'; g.fillText('SHADER', 150, 300);
            const tex = new T3.CanvasTexture(c); const u = { tex:{ value:tex }, u_time:{ value:0 }, u_mode:{ value:0 } };
            const mat = new T3.ShaderMaterial({ uniforms:u, vertexShader:'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
              fragmentShader:'uniform sampler2D tex; uniform float u_time; uniform int u_mode; varying vec2 vUv;\nvoid main(){\n  vec2 uv = vUv;\n  if (u_mode == 4) uv = floor(uv * 40.0) / 40.0;\n  if (u_mode == 6) uv.x += sin(uv.y * 30.0 + u_time * 3.0) * 0.01;\n  vec4 c = texture2D(tex, uv);\n  if (u_mode == 1){ float g = dot(c.rgb, vec3(0.299, 0.587, 0.114)); c.rgb = vec3(g); }\n  if (u_mode == 2) c.rgb *= smoothstep(0.8, 0.2, length(vUv - 0.5));\n  if (u_mode == 3){ vec2 off = vec2(0.008 + 0.004 * sin(u_time * 2.0), 0.0); c.r = texture2D(tex, uv + off).r; c.b = texture2D(tex, uv - off).b; }\n  if (u_mode == 5) c.rgb *= 0.8 + 0.2 * sin(gl_FragCoord.y * 1.5 + u_time * 4.0);\n  gl_FragColor = c;\n}' });
            const m = new T3.Mesh(new T3.PlaneGeometry(2, 2), mat); m.frustumCulled = false; scene.add(m); apply = () => { u.u_mode.value = k; }; apply(); S.frame = (dt) => { u.u_time.value += dt; }; }, { orbit:false, env:false }); },
        desc:'3Dシーンを描いた<b>あとの画像</b>に、シェーダーでもう一度加工をかけるのが<b>ポストプロセス</b>です。白黒・周辺を暗く・色ずれ・モザイク・光のにじみ（ブルーム）など、映像のような仕上げができます。three.js では EffectComposer、R3F では <code>@react-three/postprocessing</code> を使います。',
        prompt:'three.js のシーンに、EffectComposer でブルーム（光のにじみ）と周辺を暗くする効果（ビネット）をかけて。スマホでは負荷が高いので、画面幅が狭いときはブルームを切って。' },
    ], null, true),
    { title:'GLSLでよく使う関数', note:'シェーダーの模様は、ほぼこれらの組み合わせです。<b>The Book of Shaders</b>（日本語訳あり）と <b>Shadertoy</b> で実例を見るのが上達の近道です。',
      table:{ head:['関数', '働き・使いどころ'], rows:GLSLF.map(([a, b]) => [`<code>${a}</code>`, b]) } },
    S('シェーダーの用語', [
      T('GLSL', 'OpenGL Shading Language', 'WebGLのシェーダーを書く言語。C言語に似ている。型（float・vec3）に厳しく、<b>整数と小数を混ぜるとエラー</b>。', null, ['基本']),
      T('WGSL', 'WebGPU Shading Language', 'WebGPU用のシェーダー言語。Rust に似た書き方。'),
      T('TSL', 'Three.js Shading Language', 'three.js の新しい書き方。JavaScriptの関数でシェーダーを組み立て、WebGLとWebGPUの両方に変換される。'),
      T('頂点シェーダー', 'Vertex shader', '頂点ごとに位置を計算する。形を動かす・ゆらす。'),
      T('フラグメントシェーダー', 'Fragment shader', '画素ごとに色を計算する。模様・光・エフェクト。'),
      T('uniform', 'Uniform', 'JavaScriptからシェーダーに渡す、全画素で共通の値。時間・マウス・色・画像など。'),
      T('attribute', 'Attribute', '頂点ごとに違う値（位置・法線・UV）。頂点シェーダーで受け取る。'),
      T('varying', 'Varying', '頂点シェーダーからフラグメントシェーダーへ渡す値。間の画素では自動でなめらかに補間される。'),
      T('vec2 / vec3 / vec4', 'Vectors', '2〜4個の数の組。位置（xyz）や色（rgba）に使う。<code>v.xy</code> や <code>c.rgb</code> のように一部だけ取り出せる（スウィズル）。'),
      T('gl_FragCoord', 'gl_FragCoord', '今計算している画素の、画面上の位置（ピクセル単位、左下が原点）。'),
      T('精度（precision）', 'Precision', 'highp / mediump / lowp。スマホでは mediump だと時間の値が大きくなると模様が崩れることがある。'),
      T('ノイズ', 'Noise (Perlin / Simplex / fbm)', '自然なランダムさを作る関数。雲・炎・地形・水面に。細かさを変えて重ねたものが fbm。'),
      T('レイマーチング', 'Ray marching', 'SDFを使い、光線を少しずつ進めて3Dの形を描く方法。数式だけで不思議な立体が描ける（Shadertoyでおなじみ）。'),
      T('ポストプロセス', 'Post-processing', '描いた画像全体にかける後処理。ブルーム・被写界深度・色調整・アンチエイリアス。'),
      T('ShaderMaterial / RawShaderMaterial', 'Custom materials', 'three.js で自作シェーダーを使うマテリアル。ShaderMaterial は行列などを自動で用意してくれる。'),
      T('onBeforeCompile', 'Material patching', '既存のマテリアル（Standard など）のシェーダーの一部だけ書き換える方法。光や影の計算を活かしたまま、頂点だけ動かすときに。'),
      T('Shadertoy', 'Shadertoy', 'ブラウザでシェーダーを書いて共有するサイト。名作が大量にある。<b>作品ごとにライセンスが違う</b>ので、使う前に確認。', null, ['注意']),
      T('The Book of Shaders', 'The Book of Shaders', 'フラグメントシェーダーの入門サイト。日本語訳あり。関数のグラフで理解できる。', null, ['おすすめ']),
    ]),
  ]});

/* ================= 6. モデルと制作 ================= */
const GLTF = [['{', ''], ['  "asset": { "version": "2.0", "generator": "Blender" },', 'asset', 'ファイルの形式の版と、作ったツール。'], ['  "scenes": [{ "nodes": [0] }],', 'scenes', 'シーンの一覧。どのノードから始まるか。'], ['  "nodes": [{ "name": "Mug", "mesh": 0, "rotation": [0,0,0,1] }],', 'nodes', '物体の一覧と位置・回転・大きさ。親子関係（children）もここ。'], ['  "meshes": [{ "primitives": [{ "attributes": { "POSITION": 0, "NORMAL": 1, "TEXCOORD_0": 2 }, "material": 0 }] }],', 'meshes', '形。頂点の位置（POSITION）・法線（NORMAL）・UV（TEXCOORD_0）がどのデータかを指す。'], ['  "materials": [{ "pbrMetallicRoughness": { "baseColorTexture": { "index": 0 }, "roughnessFactor": 0.4 } }],', 'materials', '<b>PBRの質感</b>（ベースカラー・金属・粗さ）。three.js の MeshStandardMaterial にそのまま変換される。'], ['  "textures": [{ "source": 0 }],  "images": [{ "uri": "mug_color.webp" }],', 'textures', 'テクスチャと画像。GLBでは画像も中に入る。KTX2で圧縮もできる。'], ['  "animations": [{ "name": "Spin", "channels": [...] }],', 'animations', 'アニメーション。three.js の AnimationMixer で再生する。'], ['  "accessors": [...], "bufferViews": [...],', 'accessors', 'バイナリのどこから何個、どんな型で読むか、の案内。'], ['  "buffers": [{ "uri": "mug.bin", "byteLength": 48210 }]', 'buffers', '頂点などの本体のデータ（バイナリ）。GLBでは1つのファイルにまとまる。'], ['}', '']];
const FLOW = [
  '<b>作る・入手する</b><br>Blender で作る、素材サイト（Sketchfab・Poly Haven・Kenney）から入手、AIで生成（Meshy・Tripo など）。<b>ライセンスを確認</b>。',
  '<b>大きさ・向き・原点をそろえる</b><br>1＝1メートル、正面を −Y（Blender）／+Z（three.js）、足元を原点に。あとで困らないための下ごしらえ。',
  '<b>軽くする</b><br>見えない面・細かすぎる部分を削る（デシメート）。テクスチャは1〜2K、可能ならまとめる（アトラス化）。',
  '<b>質感をPBRで</b><br>Blender の Principled BSDF で作ると glTF にそのまま変換される。複雑なノードは書き出せないのでベイクする。',
  '<b>glTF（.glb）で書き出す</b><br>Web の標準形式。アニメーション・質感・画像を1ファイルにまとめられる。',
  '<b>圧縮する</b><br><code>npx @gltf-transform/cli optimize in.glb out.glb --compress draco --texture-compress webp</code> などで数分の1に。',
  '<b>確認する</b><br>gltf.report や three.js editor で見た目・サイズ・三角形数をチェック。',
  '<b>サイトで読み込む</b><br>three.js なら GLTFLoader、R3F なら useGLTF。gltfjsx で React の部品に変換すると扱いやすい。',
];
const FMT = [['glTF / GLB', '◎ Webの標準', '○', '○', '<b>まずこれ</b>。「3DのJPEG」と呼ばれる。GLBは1ファイル版'], ['FBX', '△ 変換して使う', '○', '△', 'ゲーム業界の定番。Mixamo のアニメーションなど。Blenderで glTF に変換'], ['OBJ（+MTL）', '△', '×', '△', '古くからある単純な形式。形だけ。質感は弱い'], ['USDZ', '○ iPhoneのAR用', '○', '○', 'Apple の AR Quick Look 用。model-viewer は自動変換もできる'], ['STL', '△', '×', '×', '3Dプリンター用。色も質感もない'], ['VRM', '○ three-vrm で', '○', '○', 'アバター（VTuberなど）用。glTFベースで表情・揺れ物の設定付き'], ['PLY / SPZ', '○ 専用ビューア', '×', '—', '点群・ガウシアンスプラッティング（写真から作る景色）'], ['.blend', '× 直接は不可', '○', '○', 'Blenderの作業ファイル。Webで使うには glTF に書き出す']];
const TOOLS = [['Blender', '無料', '3Dの作成・UV展開・ベイク・アニメーション。定番中の定番'], ['Spline', '無料プランあり', 'ブラウザで3Dを作ってそのまま埋め込み。LP向け'], ['Sketchfab', '無料・有料', '3Dモデルの共有・販売サイト。ライセンスを要確認'], ['Poly Haven', '無料（CC0）', 'HDRI・テクスチャ・モデル。商用OK・表記不要'], ['Kenney / Quaternius', '無料（CC0）', 'ゲーム向けのローポリ素材がたくさん'], ['Mixamo', '無料', '人型モデルに自動で骨を入れ、歩く・走るなどのアニメーションを付ける'], ['Meshy / Tripo など', '有料・無料枠', '文章や画像から3Dモデルを生成するAI。形は粗めなので仕上げが必要'], ['Polycam / Luma など', 'アプリ', 'スマホで撮影して3D化（フォトグラメトリ・スプラット）'], ['VRoid Studio', '無料', 'アニメ調の人型アバター（VRM）を作る'], ['gltf.report / gltf-transform', '無料', 'glTF の中身確認・圧縮・最適化'], ['gltfjsx', '無料', 'glTF を React Three Fiber の部品（JSX）に変換']];

TABS.push({ id:'models', label:'モデルと制作', icon:'📦',
  intro:'複雑な形はコードで作らず、<b>Blender などで作った3Dモデル</b>を読み込みます。Webの標準形式は <b>glTF（.glb）</b>。ファイルの中身、<b>軽くする方法</b>（圧縮・LOD）、作ってからサイトに載せるまでの流れと、素材の入手先をまとめます。',
  sections:[
    C('触って理解する', [
      { name:'glTFの中身', en:'glTF anatomy', h:420, tags:['形式','体験'],
        demo:'<div class="kt"><div class="t3-anat kt-grow an"></div><div class="kt-verdict res">紫色の項目をクリックしてください。</div></div>',
        init:(el) => { $(el, '.an').innerHTML = GLTF.map(([l, k]) => { let h = esc(l).replace(/(&quot;[^&]*?&quot;)/g, '<span class="s">$1</span>'); if (k) h = h.replace(`<span class="s">&quot;${k}&quot;</span>`, `<span class="k" data-k="${k}">"${k}"</span>`); return h; }).join('\n');
          $$(el, '.k').forEach(s => s.onclick = () => { $$(el, '.k').forEach(x => x.classList.toggle('on', x === s)); verdict($(el, '.res'), '', `<b>${s.dataset.k}</b>：${GLTF.find(a => a[1] === s.dataset.k)[2]}`); }); },
        desc:'glTF は「3DのJPEG」とも呼ばれる、Web向けの標準形式です。中身は<b>JSONの設計図</b>（物体・形・質感・アニメーション）と、<b>頂点や画像の本体（バイナリ）</b>。全部を1ファイルにまとめたものが <b>.glb</b> で、Webではこちらが扱いやすいです。',
        prompt:'Blender で作ったモデルを Web 用に書き出したい。glTF（.glb）で書き出すときの設定（+Y Up、適用するモディファイア、マテリアル、アニメーション）と、書き出した後に確認すべき点を教えて。' },
      { name:'軽くするとどれくらい変わる？', en:'Optimization: Draco / KTX2 / WebP', h:470, tags:['性能','体験'],
        demo:'<div class="kt"><div class="sl"></div><span class="sw"></span><div class="t3-checks ck"></div><div class="t3-bars kt-grow br"></div><div class="kt-note">※大まかな目安の計算です。実際の大きさはモデルにより大きく変わります。</div></div>',
        init:(el) => { let res = 2, run = () => {};
          const st = sliders($(el, '.sl'), [['tri', '三角形の数', 5000, 500000, 5000, 120000, v => (+v).toLocaleString()], ['tx', 'テクスチャの枚数', 1, 8, 1, 4, v => v + '枚']], () => run());
          $(el, '.sw').replaceWith(seg(['512', '1024', '2048', '4096'], i => { res = i; run(); }, 2).el);
          const ck = checks($(el, '.ck'), [['draco', '形を圧縮（Draco）', false], ['webp', '画像を WebP に', false], ['ktx', '画像を KTX2 に（GPUでも小さい）', false]], () => run());
          const MB = (b) => b / 1048576; run = () => { const px = Math.pow(2, 9 + res) ** 2, geo = st.tri * .6 * 32 + st.tri * 3 * 4, geoF = geo * (ck.draco ? .12 : 1), imgF = st.tx * px * (ck.ktx ? .12 : ck.webp ? .1 : .45), gpu = geo + st.tx * px * 4 * 1.33 * (ck.ktx ? .25 : 1), file = geoF + imgF, sec = file * 8 / 10e6;
            const rows = [['ファイルの大きさ', MB(file), 60, ''], ['うち 形', MB(geoF), 60, ''], ['うち 画像', MB(imgF), 60, ''], ['GPUメモリ', MB(gpu), 400, 'b']];
            $(el, '.br').innerHTML = rows.map(([n, v, max, c]) => `<span>${n}</span><i class="${c}" style="width:${Math.min(100, v / max * 100)}%"></i><output>${v.toFixed(1)}MB</output>`).join('') + `<span>4G回線（10Mbps）</span><i style="width:${Math.min(100, sec / 30 * 100)}%;background:${sec > 5 ? 'var(--bad)' : 'var(--ok)'}"></i><output>${sec.toFixed(1)}秒</output>`; };
          run(); },
        desc:'3Dモデルの重さは、<b>形（頂点）</b>と<b>画像（テクスチャ）</b>で決まります。形は <b>Draco / Meshopt</b> で数分の1に、画像は <b>WebP</b> で小さく、<b>KTX2</b> なら<b>GPUのメモリまで</b>小さくなります。画像はダウンロード時に小さくても、GPUの中では「縦×横×4バイト」に戻る点に注意。スマホが落ちる原因の多くはこれです。',
        prompt:'このサイトの 3D モデル（public/models/*.glb）を gltf-transform で最適化するスクリプトを書いて。Draco で形を圧縮、テクスチャは最大 2048px に縮小して KTX2（ETC1S）に変換、読み込み側の three.js に DRACOLoader と KTX2Loader を設定して。',
        code:'# まとめて最適化（形の圧縮・画像の縮小と変換・不要データの削除）\nnpx @gltf-transform/cli optimize input.glb output.glb \\\n  --compress draco --texture-compress webp --texture-size 2048\n\n// 読み込み側（three.js）\nimport { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";\nimport { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";\nconst draco = new DRACOLoader().setDecoderPath("/draco/");\nconst loader = new GLTFLoader().setDRACOLoader(draco);\nconst gltf = await loader.loadAsync("/models/mug.glb");\nscene.add(gltf.scene);' },
      { name:'距離で細かさを切り替える（LOD）', en:'Level of detail', h:420, tags:['性能','体験'],
        demo:'<div class="kt"><div class="t3-cv kt-grow"><span class="tag tg"></span></div><div class="sl"></div></div>',
        init:(el) => { let apply = () => {};
          const st = sliders($(el, '.sl'), [['d', 'カメラとの距離', 2, 26, .5, 5]], () => apply());
          return view3(el, S => { const { T:T3, scene } = S; lights3(S); floor3(S, 60); const lod = new T3.LOD(), C3 = [0x22c55e, 0xf59e0b, 0xef4444], DET = [[64, 40], [16, 10], [6, 4]];
            DET.forEach(([a, b], i) => { const m = new T3.Mesh(new T3.SphereGeometry(1, a, b), new T3.MeshStandardMaterial({ color:C3[i], flatShading:i > 0 })); m.castShadow = true; lod.addLevel(m, [0, 8, 16][i]); }); lod.position.y = 1; scene.add(lod);
            apply = () => {}; S.frame = (dt, t) => { S.cam.position.set(Math.sin(t * .2) * st.d * .3, 1.6, st.d); S.cam.lookAt(0, 1, 0); const lv = lod.getCurrentLevel(), g = lod.levels[lv].object.geometry; $(el, '.tg').textContent = `レベル${lv}（${['近い：細かい', '中くらい', '遠い：粗い'][lv]}）　三角形 ${g.index.count / 3}`; }; }, { orbit:false }); },
        desc:'遠くの物は小さく見えるので、細かい形で描く必要がありません。<b>LOD</b>は、カメラとの距離に応じて<b>細かいモデルと粗いモデルを自動で切り替える</b>仕組みです（色は分かりやすくするため）。広い景色・街・たくさんの木を表示するときに効きます。',
        prompt:'three.js の街のシーンが重いです。建物ごとに3段階の細かさのモデルを用意して THREE.LOD で距離により切り替え、遠くの建物は影を落とさないようにして。' },
      { name:'作ってからサイトに載せるまで', en:'Asset pipeline', h:440, tags:['流れ'],
        init:(el) => stepper(el, FLOW, { title:'3Dモデルの制作フロー' }),
        desc:'3Dモデルは「作る → 大きさと向きをそろえる → 軽くする → glTFで書き出す → 圧縮 → 確認 → 読み込む」の流れでサイトに載せます。<b>大きさ（1＝1m）と向き、原点</b>を最初にそろえておくと、あとでライトや物理、ARで困りません。',
        prompt:'Sketchfab からダウンロードした3Dモデルを自分のサイトで使いたい。ライセンスの確認ポイント、Blender で大きさと原点を整える手順、glb に書き出して圧縮し、React Three Fiber で表示するまでを順に教えて。' },
    ], null, true),
    { title:'3Dファイル形式', note:'Webで使うなら <b>glTF（.glb）</b> に変換するのが基本。他の形式は Blender で開いて glTF で書き出します。',
      table:{ head:['形式', 'Webでの扱い', 'アニメ', '質感', '特徴'], rows:FMT } },
    { title:'制作ツール・素材サイト', note:'素材は<b>ライセンス</b>（商用利用・クレジット表記・改変）を必ず確認。CC0 なら自由に使えます。AI生成モデルも、各サービスの利用規約を確認しましょう。',
      table:{ head:['名前', '料金', '使いどころ'], rows:TOOLS } },
    S('モデルと制作の用語', [
      T('glTF / GLB', 'GL Transmission Format', 'Web向けの3Dの標準形式。.gltf（JSON＋別ファイル）と .glb（1ファイル）。', null, ['定番']),
      T('Draco', 'Draco compression', 'Google の形の圧縮方式。頂点データが数分の1に。読み込み時に展開（デコーダー）が必要。'),
      T('Meshopt', 'meshoptimizer', '形の圧縮方式の一つ。展開が速く、アニメーションにも効く。'),
      T('KTX2 / Basis Universal', 'GPU texture compression', 'GPUがそのまま使える圧縮画像。ダウンロードもGPUメモリも小さい。', null, ['性能']),
      T('テクスチャアトラス', 'Texture atlas', '複数の画像を1枚にまとめる。読み込みと描画の回数が減る。'),
      T('デシメート', 'Decimate', '三角形を自動で減らす（Blender のモディファイア）。形が崩れない範囲で。'),
      T('リトポロジー', 'Retopology', '細かすぎる・汚い形を、きれいで少ない三角形で作り直すこと。AI生成やスキャンしたモデルで必要。'),
      T('UV展開', 'UV unwrapping', '立体を切り開いて平らにし、画像を貼る位置を決める作業。'),
      T('ベイク', 'Baking', '光・影・細かい凹凸を画像に焼き込む。リアルな見た目を軽く表示できる。', null, ['定番']),
      T('リギング・ウェイト', 'Rigging / weights', '骨を入れ、どの骨がどの部分を動かすかを決める作業。Mixamo で自動化できる。'),
      T('原点（ピボット）', 'Origin / pivot', '物体の回転・配置の基準点。足元や中心にしておくと扱いやすい。', null, ['よくある失敗']),
      T('ガウシアンスプラッティング', 'Gaussian splatting', '写真や動画から、ぼやけた点の集まりで景色をリアルに再現する技術。専用のビューアで表示。'),
      T('フォトグラメトリ', 'Photogrammetry', '多数の写真から3Dモデルを作る技術。スマホアプリでも可能。'),
      T('AIで3D生成', 'Text/Image to 3D', '文章や画像から3Dモデルを作るAI。たたき台には便利だが、形・UV・三角形数の手直しが必要なことが多い。'),
      T('ライセンス（CC0・CC BY）', 'Licenses', 'CC0＝自由に使える。CC BY＝作者名の表記が必要。NC＝商用不可。素材ごとに必ず確認。', null, ['注意']),
      T('gltfjsx', 'gltfjsx', 'glb を React Three Fiber の部品に変換するツール。部品ごとに色を変える・クリックするなどが簡単に。'),
    ]),
  ]});

/* ================= 7. ライブラリと性能 ================= */
const LIBS = [['three.js', 'JS', '定番の3Dライブラリ。情報・作例が最も多い', '<b>まずはこれ</b>'], ['React Three Fiber（R3F）', 'React', 'three.js を React の部品として書ける。<b>drei</b>（便利部品集）とセット', 'Next.js / React のサイト'], ['Threlte / TresJS', 'Svelte / Vue', 'Svelte・Vue 版の R3F のようなもの', 'Svelte・Vue のサイト'], ['Babylon.js', 'JS', 'Microsoft 発の高機能エンジン。物理・XR・GUIエディタ付き', '本格的なゲーム・業務用'], ['PlayCanvas', 'JS＋エディタ', 'ブラウザ上のエディタで共同制作できるゲームエンジン', 'Webゲーム・広告'], ['A-Frame', 'HTMLタグ', 'HTMLのタグでVR/3Dを書ける', 'VRの試作'], ['Spline', 'ツール', 'デザインツールで作って埋め込み', 'LPの演出'], ['&lt;model-viewer&gt;', 'HTMLタグ', 'モデルを表示・回転・AR表示するだけの部品', '商品の3D表示'], ['deck.gl', 'JS', '大量のデータを地図上に3Dで描く', '地図のデータ可視化'], ['CesiumJS', 'JS', '地球全体・3D都市（PLATEAU など）', '地球・都市の表示'], ['OGL / regl', 'JS', 'とても小さいWebGLライブラリ', '軽さ最優先の演出']];
const CODES = [['three.js', 'import * as THREE from "three";\n\nconst scene = new THREE.Scene();\nconst camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);\ncamera.position.set(0, 1, 4);\nconst renderer = new THREE.WebGLRenderer({ antialias: true });\nrenderer.setSize(w, h);\ncontainer.append(renderer.domElement);\n\nscene.add(new THREE.AmbientLight(0xffffff, 0.5));\nconst box = new THREE.Mesh(\n  new THREE.BoxGeometry(1, 1, 1),\n  new THREE.MeshStandardMaterial({ color: "orange" })\n);\nscene.add(box);\n\nrenderer.setAnimationLoop((t) => {\n  box.rotation.y = t / 1000;\n  renderer.render(scene, camera);\n});\n// 画面サイズの変更・後片付け（dispose）も自分で書く'], ['React Three Fiber', 'import { Canvas, useFrame } from "@react-three/fiber";\nimport { OrbitControls, Environment } from "@react-three/drei";\nimport { useRef } from "react";\n\nfunction Box() {\n  const ref = useRef();\n  useFrame((_, dt) => (ref.current.rotation.y += dt)); // 毎フレーム\n  return (\n    <mesh ref={ref}>\n      <boxGeometry args={[1, 1, 1]} />\n      <meshStandardMaterial color="orange" />\n    </mesh>\n  );\n}\n\nexport default function Scene() {\n  return (\n    <Canvas camera={{ position: [0, 1, 4], fov: 40 }}>\n      <ambientLight intensity={0.5} />\n      <Environment preset="city" />\n      <Box />\n      <OrbitControls />\n    </Canvas>\n  ); // サイズ変更・後片付けは自動\n}']];

TABS.push({ id:'perf', label:'ライブラリと性能', icon:'⚙',
  intro:'3Dは<b>重くなりやすい</b>分野です。スマホでも快適に動かすための考え方（<b>ドローコール・画素数・メモリ</b>）と、目的に合った<b>ライブラリの選び方</b>をまとめます。React を使うなら React Three Fiber が便利です。',
  sections:[
    C('触って理解する', [
      { name:'まとめて描く（インスタンシング）', en:'Draw calls & InstancedMesh', h:450, tags:['性能','体験','最重要'],
        demo:'<div class="kt"><span class="sw"></span><div class="t3-cv kt-grow"><span class="tag tg"></span></div><div class="sl"></div></div>',
        init:(el) => { let mode = 0, apply = () => {};
          $(el, '.sw').replaceWith(seg(['1個ずつのメッシュ', 'InstancedMesh（まとめて）'], i => { mode = i; apply(); }).el);
          const st = sliders($(el, '.sl'), [['n', '箱の数', 100, 4000, 100, 1500]], () => apply());
          return view3(el, S => { const { T:T3, scene, r } = S; scene.add(new T3.HemisphereLight(0xffffff, 0x666666, 1.6)); const d = new T3.DirectionalLight(0xffffff, 1.5); d.position.set(3, 5, 2); scene.add(d);
            const geo = new T3.BoxGeometry(.12, .12, .12), mat = new T3.MeshStandardMaterial({ color:0xffffff }), grp = new T3.Group(); scene.add(grp); let inst = null, list = [], avg = 1 / 60, calls = 0; const m4 = new T3.Matrix4(), col = new T3.Color(), q = new T3.Quaternion(), p = new T3.Vector3(), one = new T3.Vector3(1, 1, 1);
            const pos = (i, n, t) => { const a = i * 2.39996, r2 = Math.sqrt(i / n) * 2.4; p.set(Math.cos(a + t * .3) * r2, Math.sin(i * .37 + t * 1.5) * .25, Math.sin(a + t * .3) * r2); return p; };
            apply = () => { grp.clear(); list.forEach(m => m.material.dispose()); list = []; if (inst){ inst.dispose(); inst = null; } const n = st.n;
              if (mode === 0){ for (let i = 0; i < n; i++){ const m = new T3.Mesh(geo, new T3.MeshStandardMaterial({ color:col.setHSL(i / n, .7, .55) })); grp.add(m); list.push(m); } }
              else { inst = new T3.InstancedMesh(geo, mat, n); for (let i = 0; i < n; i++) inst.setColorAt(i, col.setHSL(i / n, .7, .55)); grp.add(inst); } };
            apply(); S.offs.push(() => { geo.dispose(); mat.dispose(); list.forEach(m => m.material.dispose()); });
            const draw0 = S.draw; S.draw = () => { draw0(); calls = r.info.render.calls; };
            S.frame = (dt, t) => { avg += (dt - avg) * .05; const n = st.n; if (mode === 0) list.forEach((m, i) => { m.position.copy(pos(i, n, t)); m.rotation.y = t + i; }); else if (inst){ for (let i = 0; i < n; i++){ q.setFromAxisAngle(T3.Object3D.DEFAULT_UP, t + i); m4.compose(pos(i, n, t), q, one); inst.setMatrixAt(i, m4); } inst.instanceMatrix.needsUpdate = true; }
              $(el, '.tg').textContent = `描画命令（ドローコール）${calls}回　${Math.round(1 / avg)}fps`; }; }, { cam:[0, 3.4, 4.4] }); },
        desc:'GPUへの「これを描いて」という命令（<b>ドローコール</b>）は、1回ごとに手間がかかります。同じ形の物を1000個置くとき、1個ずつのメッシュだと<b>1000回</b>、<b>InstancedMesh</b> なら<b>1回</b>で済みます。木・草・群衆・パーティクルなど、同じ物がたくさんある場面では必ず使いましょう。',
        prompt:'このthree.jsのシーンで、同じ木のモデルを500本個別に配置していて重いです。InstancedMesh に置き換えて、位置・回転・大きさ・色を1本ずつ setMatrixAt / setColorAt で設定して。クリックで選べるようにレイキャストの instanceId も使って。' },
      { name:'1フレームの持ち時間', en:'Frame budget', h:380, tags:['性能','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="t3-budget bg"></div><div class="sl"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let hz = 60; const run = () => { const b = 1000 / hz, items = [['JavaScript', st.js, '#7c3aed'], ['描画の命令', st.cpu, '#0ea5e9'], ['GPUの計算', st.gpu, '#f59e0b']], tot = st.js + st.cpu, frame = Math.max(tot, st.gpu), max = Math.max(b * 1.6, frame * 1.05);
            $(el, '.bg').innerHTML = items.map(([n, v, c]) => `<i style="width:${v / max * 100}%;background:${c}" title="${n}">${v >= 3 ? n : ''}</i>`).join('') + `<span class="line" style="left:${b / max * 100}%"></span>`;
            verdict($(el, '.res'), frame > b ? 'bad' : frame > b * .8 ? 'warn' : 'ok', `持ち時間 <b>${b.toFixed(1)}ms</b>（${hz}fps）／かかった時間 <b>${frame.toFixed(1)}ms</b> → 実際は約 <b>${Math.min(hz, Math.round(1000 / frame))}fps</b>` + (frame > b ? '<br>❌ 間に合わずカクつきます。一番長いもの（' + (st.gpu > tot ? 'GPU：画素数・影・後処理を減らす' : 'CPU：ドローコール・JSの処理を減らす') + '）から削りましょう。' : '')); };
          const st = sliders($(el, '.sl'), [['js', 'JavaScriptの処理', 0, 20, .5, 3, v => v + 'ms'], ['cpu', '描画の命令（CPU）', 0, 20, .5, 4, v => v + 'ms'], ['gpu', 'GPUの計算', 0, 30, .5, 8, v => v + 'ms']], () => run());
          $(el, '.sw').replaceWith(seg(['60Hzの画面', '120Hzの画面'], i => { hz = [60, 120][i]; run(); }).el); },
        desc:'60fpsで動かすには、1コマを<b>約16.7ミリ秒</b>以内に描く必要があります（120Hzの画面なら8.3ミリ秒）。CPU（JavaScriptと描画の命令）とGPU（画素の計算）は同時に進むので、<b>遅い方</b>がフレームの時間になります。どちらが詰まっているかで対策が変わります。',
        prompt:'three.js のサイトがカクつきます。原因が CPU 側（ドローコール・JS）か GPU 側（画素数・影・後処理）かを切り分ける方法を教えて。renderer.info と Chrome の Performance パネルの見方、それぞれの対策も。' },
      { name:'画素数と重さ（pixelRatio）', en:'Device pixel ratio', h:360, tags:['性能','体験','スマホ'],
        demo:'<div class="kt"><div class="t3-px kt-grow px"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const W = 390, H = 844; const draw = (k) => { $(el, '.px').innerHTML = [1, 2, 3].map(d => `<div class="${d === k ? 'on' : ''}" data-d="${d}" style="cursor:pointer"><div class="g" style="grid-template-columns:repeat(${d},1fr);width:${36 + d * 22}px;height:${36 + d * 22}px">${'<i></i>'.repeat(d * d)}</div>×${d}<br><b>${(W * d * H * d / 1e6).toFixed(2)}M画素</b></div>`).join('');
            $$(el, '.px > div').forEach(x => x.onclick = () => draw(+x.dataset.d)); verdict($(el, '.res'), k === 3 ? 'bad' : k === 2 ? 'ok' : 'warn', `スマホ（${W}×${H}）で pixelRatio ${k}：計算する画素は1倍の<b>${k * k}倍</b>。` + (k === 3 ? '<br>❌ 3倍は見た目の差が小さいのに9倍重い。<code>setPixelRatio(Math.min(2, devicePixelRatio))</code> で2倍までに。' : k === 2 ? '<br>✓ くっきりで現実的な重さ。多くのサイトの標準。' : '<br>軽いが少しぼやける。重い場面では一時的に下げる手も。')); }; draw(2); },
        desc:'スマホの画面は1つの点を2〜3倍の細かさで表示しています（devicePixelRatio）。3Dでこれに合わせると、<b>計算する画素の数は2乗</b>で増えます。<b>pixelRatio は最大2</b>に制限するのが定番。重いときは一時的に1.5や1に下げる（動的解像度）方法もあります。',
        prompt:'three.js の renderer の pixelRatio を最大2に制限し、FPSが50を下回る状態が続いたら1.5→1と自動で下げ、余裕があれば戻す仕組みを入れて。R3F なら drei の PerformanceMonitor と AdaptiveDpr を使って。' },
      { name:'後片付け（dispose）とメモリ', en:'Disposing GPU resources', h:400, tags:['性能','体験','よくある失敗'],
        demo:'<div class="kt"><div class="t3-cv kt-grow"><span class="tag tg"></span></div><div class="kt-row"><button type="button" class="kt-btn pri mk">100個作る</button><button type="button" class="kt-btn sm rm">シーンから外すだけ</button><button type="button" class="kt-btn sm ds">dispose する</button></div><div class="kt-verdict res"></div></div>',
        init:(el) => view3(el, S => { const { T:T3, scene, r } = S; lights3(S); let base = null, live = [], removed = [];
          const show = (msg, cls) => { if (base === null) base = r.info.memory.geometries; const g = r.info.memory.geometries - base; $(el, '.tg').textContent = `GPUに残っている形：${Math.max(0, g)}個　画面の物体：${live.length}個`; if (msg) verdict($(el, '.res'), cls, msg); };
          $(el, '.mk').onclick = () => { for (let i = 0; i < 100; i++){ const m = new T3.Mesh(new T3.IcosahedronGeometry(.12, 1), new T3.MeshStandardMaterial({ color:new T3.Color().setHSL(Math.random(), .7, .55) })); m.position.set((Math.random() - .5) * 4, Math.random() * 2, (Math.random() - .5) * 2); scene.add(m); live.push(m); } setTimeout(() => show('作って描いた形は、GPUのメモリに送られます。', ''), 100); };
          $(el, '.rm').onclick = () => { live.forEach(m => scene.remove(m)); removed.push(...live); live = []; setTimeout(() => show('❌ 画面からは消えましたが、<b>GPUのメモリには残ったまま</b>。くり返すとメモリが増え続け、スマホでは落ちます（メモリリーク）。', 'bad'), 100); };
          $(el, '.ds').onclick = () => { [...live, ...removed].forEach(m => { scene.remove(m); m.geometry.dispose(); m.material.dispose(); }); live = []; removed = []; setTimeout(() => show('✓ <code>geometry.dispose()</code>・<code>material.dispose()</code>・<code>texture.dispose()</code> で、GPUのメモリから解放されました。', 'ok'), 100); };
          S.offs.push(() => [...live, ...removed].forEach(m => { m.geometry.dispose(); m.material.dispose(); })); setTimeout(() => show('「100個作る」→「外すだけ」→「dispose する」の順に試してください。', ''), 200); S.frame = (dt) => { scene.rotation.y += dt * .2; }; }, { cam:[0, 2, 5], target:[0, .8, 0] }),
        desc:'three.js では、シーンから外しただけでは<b>GPUのメモリは解放されません</b>。形・質感・画像は <code>dispose()</code> で明示的に片付けます。ページ遷移のあるサイト（SPA）で3Dを出し入れすると、これを忘れてメモリが増え続けるのがよくある事故です。R3F は部品が消えるとき自動で片付けてくれます。',
        prompt:'Next.js のページを行き来するたびに、three.js のシーンのメモリが増えていきます。ページを離れるときに、シーン内のジオメトリ・マテリアル・テクスチャを全部 dispose し、renderer.dispose() とイベントの解除をする後片付けの関数を書いて。' },
      { name:'three.js と React Three Fiber の書き方', en:'Vanilla vs R3F', h:470, tags:['ライブラリ'],
        demo:'<div class="kt"><span class="sw"></span><div class="kt-code kt-grow cd" style="overflow:auto;white-space:pre"></div></div>',
        init:(el) => { $(el, '.sw').replaceWith(seg(CODES.map(c => c[0]), i => { $(el, '.cd').textContent = CODES[i][1]; }).el); },
        desc:'同じ「回る箱」を、素の three.js と <b>React Three Fiber</b> で書いた例です。R3F は <b>three.js の部品をJSXのタグとして書ける</b>ので、Reactの状態と連動させやすく、画面サイズの変更や後片付けも自動。<b>drei</b> には操作・環境光・文字・読み込みなど便利な部品がそろっています。',
        prompt:'Next.js（App Router）のトップページに、React Three Fiber で3Dの商品を表示して。@react-three/drei の useGLTF・Environment・OrbitControls・ContactShadows を使い、読み込み中は Suspense でローディング表示。3Dの部分は "use client" の別コンポーネントにして。' },
    ], null, true),
    { title:'3Dライブラリの比較', note:'迷ったら <b>three.js</b>（React なら <b>R3F + drei</b>）。表示するだけなら <b>model-viewer</b>、ゲームエンジンらしい機能が欲しければ <b>Babylon.js / PlayCanvas</b>。',
      table:{ head:['名前', '書き方', '特徴', '向いている'], rows:LIBS } },
    S('性能とライブラリの用語', [
      T('ドローコール', 'Draw call', 'GPUへの描画命令の回数。<b>数百回以内</b>が目安。物体・マテリアルの数に比例して増える。', null, ['性能']),
      T('InstancedMesh', 'Instancing', '同じ形・同じ材質の物を1回の命令でまとめて描く。数千〜数万個でも軽い。', null, ['定番']),
      T('BatchedMesh・結合', 'BatchedMesh / merge', '形が違っても同じ材質ならまとめて描く方法。動かない物は1つに結合（mergeGeometries）しても速くなる。'),
      T('フラスタムカリング', 'Frustum culling', 'カメラに映らない物は描かない仕組み。three.js では自動。巨大な1つのメッシュだと効かない。'),
      T('pixelRatio の上限', 'setPixelRatio', '<code>Math.min(2, devicePixelRatio)</code> が定番。3倍は重さに対して効果が小さい。', null, ['スマホ']),
      T('dispose（後片付け）', 'Dispose', 'ジオメトリ・マテリアル・テクスチャ・レンダーターゲットは使い終わったら dispose。忘れるとメモリリーク。', null, ['よくある失敗']),
      T('必要なときだけ描く', 'Render on demand', '動きがない3Dは毎フレーム描かない。R3F の <code>frameloop="demand"</code>。電池が長持ちする。'),
      T('性能の計測', 'stats.js / r3f-perf / Spector.js', 'FPS・ドローコール・メモリを表示する道具。<code>renderer.info</code> でも確認できる。'),
      T('端末に合わせて切り替え', 'Adaptive quality', '性能が低い端末では影・後処理・解像度を下げる。drei の PerformanceMonitor など。'),
      T('React Three Fiber', 'R3F', 'three.js を React の部品として書くライブラリ。three.js の機能は全部使える。'),
      T('drei', '@react-three/drei', 'R3F の便利部品集。OrbitControls・Environment・Text・useGLTF・ContactShadows・Html など。', null, ['定番']),
      T('useFrame', 'useFrame', 'R3F で毎フレームの処理を書くフック。中で React の状態（setState）を変えると重くなるので、ref を直接書き換える。', null, ['注意']),
      T('Suspense と読み込み', 'Suspense / useGLTF', 'モデルの読み込み中は Suspense の fallback を表示。useGLTF.preload で先読みも。'),
      T('WebGPURenderer', 'WebGPURenderer', 'three.js の WebGPU 版レンダラー。WebGPU が使えない環境では WebGL に自動で切り替わる。'),
      T('OffscreenCanvas / Worker', 'OffscreenCanvas', '3Dの描画を別のスレッド（Worker）で行い、画面の操作を固まりにくくする方法。'),
      T('3Dとページの読み込み速度', 'Loading performance', '3Dライブラリとモデルは重い。<b>ファーストビュー以外は遅延読み込み</b>、最初はポスター画像を表示。'),
    ]),
  ]});

/* ================= 8. Webでの使いどころ ================= */
const USES = [['商品の3D表示・色替え', 'model-viewer / three.js / R3F', '回して見られる・色を選べる。AR表示で部屋に置ける'], ['LPのヒーロー演出', 'Spline / R3F / three.js', 'ファーストビューの印象づけ。軽さとのバランスが重要'], ['3Dゲーム', 'three.js / Babylon.js / PlayCanvas', '物理エンジン・音と組み合わせる（ゲーム制作辞典も参照）'], ['データ・地図の可視化', 'deck.gl / CesiumJS / three-globe', '大量の点・都市・地球。<b>棒グラフの3D化は読みにくいので避ける</b>'], ['建築・不動産・展示', 'three.js / スプラット', '部屋の内見・展示空間のウォークスルー'], ['アバター・VTuber', 'three-vrm', 'VRM モデルの表示・表情・カメラ連動'], ['AR（現実に重ねる）', 'model-viewer / WebXR', 'スマホのカメラで商品を置いてみる'], ['写真のような景色', 'ガウシアンスプラット', '撮影した場所をそのまま3Dで見せる']];

TABS.push({ id:'web', label:'Webでの使いどころ', icon:'🌐',
  intro:'3Dは「すごい」だけでなく、<b>商品が分かる・印象に残る・操作が楽しい</b>ときに価値があります。商品ビューア、ヒーローの演出、地球儀のデータ表示、読み込み中の見せ方、そして<b>重さ・アクセシビリティ</b>への配慮まで、実際のサイトで使うときの形をまとめます。',
  sections:[
    C('触って理解する', [
      { name:'商品ビューア（色替え・注目点）', en:'Product configurator', h:470, tags:['実用','体験','定番'],
        demo:'<div class="kt"><div class="t3-cv kt-grow"><span class="tip">ドラッグで回転・●をクリック</span><div class="t3-pop pp"></div></div><div class="kt-row"><div class="t3-sw cl"></div><span class="sw"></span></div></div>',
        init:(el) => { let col = '#5b8def', fin = 0, apply = () => {};
          const SWC = ['#5b8def', '#e11d48', '#f59e0b', '#10b981', '#f5f5f4', '#1f2937'];
          $(el, '.cl').innerHTML = SWC.map(c => `<button type="button" style="background:${c}" data-c="${c}" aria-label="色 ${c}"></button>`).join('');
          $$(el, '.cl button').forEach(b => b.onclick = () => { col = b.dataset.c; apply(); });
          $(el, '.sw').replaceWith(seg(['つや', 'マット', '金属'], i => { fin = i; apply(); }).el);
          return view3(el, S => { const { T:T3, scene } = S; lights3(S); floor3(S); const v = vase(S); scene.add(v); const c = S.controls; c.autoRotate = true; c.autoRotateSpeed = 1.5; c.maxPolarAngle = Math.PI / 2.1; c.addEventListener('start', () => { c.autoRotate = false; });
            const HOT = [[[.31, 1.62, 0], [1, .25, 0], '口のふちは厚さ3mm。欠けにくい二重焼き。'], [[.7, .5, 0], [1, 0, 0], '胴は手になじむ、ゆるやかなふくらみ。'], [[.55, .05, 0], [.6, -.8, 0], '底は滑り止めの素焼き仕上げ。']];
            const dots = HOT.map((hh, i) => { const d = document.createElement('button'); d.type = 'button'; d.className = 't3-hot'; d.textContent = i + 1; d.onclick = () => { $(el, '.pp').textContent = `${i + 1}. ${hh[2]}`; }; S.box.append(d); return d; });
            S.offs.push(() => dots.forEach(d => d.remove())); const p = new T3.Vector3(), n = new T3.Vector3(), toCam = new T3.Vector3();
            apply = () => { const m = v.material; m.color.set(col); m.metalness = fin === 2 ? 1 : 0; m.roughness = [.2, .75, .25][fin]; m.clearcoat = fin === 0 ? .8 : 0; $$(el, '.cl button').forEach(b => b.classList.toggle('on', b.dataset.c === col)); };
            apply(); S.frame = () => { HOT.forEach(([pt, nm], i) => { p.set(...pt).applyMatrix4(v.matrixWorld); n.set(...nm).normalize().transformDirection(v.matrixWorld); toCam.subVectors(S.cam.position, p).normalize(); const vis = n.dot(toCam) > .15; p.project(S.cam); dots[i].style.left = (p.x + 1) / 2 * S.w + 'px'; dots[i].style.top = (1 - p.y) / 2 * S.h + 'px'; dots[i].classList.toggle('hide', !vis); }); }; }, { cam:[2.6, 2, 3.4], target:[0, .9, 0] }); },
        desc:'ECサイトの3D表示の基本形。<b>回して見る</b>、<b>色や仕上げを切り替える</b>（マテリアルの色・粗さを変えるだけ）、<b>注目点（ホットスポット）</b>で説明を出す。注目点は、3Dの位置を画面の座標に変換して<b>HTMLを重ねて</b>います。裏側に回ったら隠すのがポイント。',
        prompt:'商品ページに3Dビューアを作って。glbを読み込み、色ボタンでボディのマテリアルの色だけ変える。3か所に番号付きの注目点をHTMLで重ねて、クリックで説明を表示、裏側に回ったら注目点を隠して。スマホでも操作できるように。' },
      { name:'ヒーローの3D演出', en:'Hero section with 3D', h:420, tags:['LP','体験','演出'],
        demo:'<div class="kt" style="padding:0"><div class="t3-cv kt-grow" style="border-radius:0"><div class="t3-hero"><h5>つくる、を<br>もっと自由に。</h5><p>マウスを動かすと奥行きが変わります。</p></div></div><div class="t3-checks ck" style="padding:6px 12px"></div></div>',
        init:(el) => { let st;
          st = checks($(el, '.ck'), [['rm', '動きを減らす（prefers-reduced-motion）', matchMedia('(prefers-reduced-motion: reduce)').matches]]);
          return view3(el, S => { const { T:T3, scene, cv } = S; scene.add(new T3.HemisphereLight(0xffffff, 0x444466, 1.2)); const d = new T3.DirectionalLight(0xffffff, 2); d.position.set(2, 3, 4); scene.add(d);
            const G3 = [new T3.IcosahedronGeometry(.5, 0), new T3.TorusGeometry(.4, .16, 20, 48), new T3.SphereGeometry(.42, 32, 20), new T3.TorusKnotGeometry(.32, .12, 90, 12), new T3.OctahedronGeometry(.45), new T3.CapsuleGeometry(.22, .5, 6, 16)], C3 = [0x7c3aed, 0xf472b6, 0x22d3ee, 0xfbbf24, 0x34d399, 0xa78bfa], objs = [];
            const xs = S.w / S.h > 1.2 ? [.6, 2.6] : [-1.6, 1.6];
            for (let i = 0; i < 9; i++){ const m = new T3.Mesh(G3[i % 6], new T3.MeshPhysicalMaterial({ color:C3[i % 6], roughness:.25, clearcoat:1 })); m.position.set(xs[0] + Math.random() * (xs[1] - xs[0]), (Math.random() - .5) * 2.6, (Math.random() - .5) * 2.5); m.userData = { p:m.position.clone(), s:Math.random() * 6, z:m.position.z }; scene.add(m); objs.push(m); }
            const mouse = new T3.Vector2(); cv.addEventListener('pointermove', (e) => { const b = cv.getBoundingClientRect(); mouse.set((e.clientX - b.left) / b.width - .5, (e.clientY - b.top) / b.height - .5); }); S.box.addEventListener('pointermove', (e) => { const b = S.box.getBoundingClientRect(); mouse.set((e.clientX - b.left) / b.width - .5, (e.clientY - b.top) / b.height - .5); });
            S.offs.push(() => G3.forEach(g => g.dispose()));
            S.frame = (dt, t) => { const k = st.rm ? 0 : 1; objs.forEach(o => { const u = o.userData; o.position.y = u.p.y + Math.sin(t * .8 + u.s) * .15 * k; if (k){ o.rotation.x += dt * .3; o.rotation.y += dt * .4; } }); S.cam.position.x += (mouse.x * 1.2 * k - S.cam.position.x) * .05; S.cam.position.y += (-mouse.y * .8 * k - S.cam.position.y) * .05; S.cam.lookAt(0, 0, 0); }; }, { cam:[0, 0, 6], orbit:false, fov:45 }); },
        desc:'LPのファーストビューに3Dを置くと印象に残ります。ただし<b>文字が主役</b>。3Dは文字の邪魔をしない側に寄せ、マウスに少し反応する程度の<b>控えめな動き</b>が上品です。<b>動きを減らす設定</b>の人には止め、スマホでは物の数を減らしましょう。',
        prompt:'LPのヒーローに、浮遊する立体がマウスに合わせて奥行き方向に少し動く3D背景を R3F で作って。見出しの文字と重ならないよう右側に配置し、prefers-reduced-motion のときは動きを止める。スマホでは数を半分にして。' },
      { name:'地球儀で世界をつなぐ', en:'Globe data visualization', h:430, tags:['データ','体験','演出'],
        demo:'<div class="kt"><div class="t3-cv kt-grow"><span class="tip">ドラッグで回転</span></div></div>',
        init:(el) => view3(el, S => { const { T:T3, scene } = S; S.scene.environment = null; const R = 1.6, N = 2600, pos = new Float32Array(N * 3);
          for (let i = 0; i < N; i++){ const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.39996; pos.set([Math.cos(th) * r * R, y * R, Math.sin(th) * r * R], i * 3); }
          const g = new T3.BufferGeometry(); g.setAttribute('position', new T3.BufferAttribute(pos, 3)); const globe = new T3.Group(); globe.add(new T3.Points(g, new T3.PointsMaterial({ color:S.dark ? 0x64748b : 0x94a3b8, size:.025 })));
          globe.add(new T3.Mesh(new T3.SphereGeometry(R * .985, 48, 32), new T3.MeshBasicMaterial({ color:S.dark ? 0x0f172a : 0xe2e8f0, transparent:true, opacity:.6 })));
          const ll = (lat, lon, r = R) => { const ph = (90 - lat) * Math.PI / 180, th = (lon + 180) * Math.PI / 180; return new T3.Vector3(-r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)); };
          const CITY = [[40.71, -74], [51.5, -.12], [-33.87, 151.2], [-23.55, -46.63], [1.35, 103.82], [37.77, -122.42], [25.2, 55.27], [48.86, 2.35]], tokyo = ll(35.68, 139.69), curves = [], dots = [];
          const mk = (v, c) => { const m = new T3.Mesh(new T3.SphereGeometry(.035, 12, 8), new T3.MeshBasicMaterial({ color:c })); m.position.copy(v); globe.add(m); };
          mk(tokyo, 0xef4444); CITY.forEach(([a, b], i) => { const to = ll(a, b); mk(to, 0x7c3aed); const mid = tokyo.clone().add(to).normalize().multiplyScalar(R * (1 + tokyo.distanceTo(to) * .22)); const cv2 = new T3.QuadraticBezierCurve3(tokyo, mid, to); curves.push(cv2);
            globe.add(new T3.Line(new T3.BufferGeometry().setFromPoints(cv2.getPoints(60)), new T3.LineBasicMaterial({ color:0x7c3aed, transparent:true, opacity:.5 }))); const d = new T3.Mesh(new T3.SphereGeometry(.03, 10, 8), new T3.MeshBasicMaterial({ color:0xf59e0b })); globe.add(d); dots.push(d); });
          globe.rotation.y = -2.4; globe.rotation.x = .35; scene.add(globe); S.controls.autoRotate = true; S.controls.autoRotateSpeed = .8;
          S.frame = (dt, t) => { dots.forEach((d, i) => d.position.copy(curves[i].getPoint((t * .25 + i * .13) % 1))); }; }, { cam:[0, 0, 5.4] }),
        desc:'世界の拠点・アクセス・取引などを、<b>地球儀と弧の線</b>で表す演出です。点は「黄金角」で球に均等に並べ、都市は<b>緯度・経度を3Dの座標に変換</b>、弧は2点の間を持ち上げた曲線で描いています。ただし数値を正確に比べたいときは、3Dより普通のグラフの方が読みやすいことも覚えておきましょう。',
        prompt:'会社の拠点（東京・ニューヨーク・ロンドン・シンガポール）を地球儀に表示し、東京から各拠点へ弧の線と動く光の点で結ぶ演出を three.js で作って。緯度経度から3D座標への変換関数も書いて。' },
      { name:'読み込み中の見せ方', en:'Loading UX', h:400, tags:['UX','体験'],
        demo:'<div class="kt"><div class="t3-cv kt-grow"><div class="t3-load ld"><b>商品の3Dを準備しています</b><div class="bar"><i></i></div><span class="st">ポスター画像を表示中</span></div></div><div class="kt-row"><button type="button" class="kt-btn pri go">読み込みを再現</button></div></div>',
        init:(el) => { const ld = $(el, '.ld'); let tm = [];
          $(el, '.go').onclick = () => { tm.forEach(clearTimeout); tm = []; ld.classList.remove('done'); const steps = [[15, '3Dライブラリを読み込み中…'], [45, 'モデル（2.1MB）をダウンロード中…'], [70, 'テクスチャ（3枚）を読み込み中…'], [90, 'シェーダーを準備中…'], [100, '完成！']];
            steps.forEach(([p, s], i) => tm.push(setTimeout(() => { ld.querySelector('.bar i').style.width = p + '%'; ld.querySelector('.st').textContent = s; if (p === 100) tm.push(setTimeout(() => ld.classList.add('done'), 400)); }, 300 + i * 650))); };
          const stopv = view3(el, S => { const { scene } = S; lights3(S); floor3(S); const v = vase(S, 0x10b981); scene.add(v); S.controls.autoRotate = true; }, { cam:[2.6, 2, 3.4], target:[0, .9, 0] });
          return () => { tm.forEach(clearTimeout); stopv(); }; },
        desc:'3Dは表示までに数秒かかることがあります。真っ白な画面で待たせず、<b>最初はポスター画像（静止画）</b>を出し、<b>進み具合</b>を見せ、準備ができたら<b>ふわっと切り替える</b>のが定番です。three.js の LoadingManager や drei の useProgress で進み具合が取れます。',
        prompt:'3Dの商品ビューアに、読み込み中の表示を付けて。最初は同じ角度のポスター画像を表示し、LoadingManager（R3F なら useProgress）で進み具合のバーを出し、読み込みが終わったら3Dにフェードで切り替えて。読み込みに失敗したらポスター画像のまま残して。' },
    ], null, true),
    { title:'目的別のおすすめ', note:'3Dは<b>目的がはっきりしているとき</b>に使いましょう。「なんとなくかっこいい」だけだと、重さとのつり合いが取れません。',
      table:{ head:['やりたいこと', 'おすすめ', 'ポイント'], rows:USES } },
    S('サイトで使うときの知識', [
      T('&lt;model-viewer&gt;', 'model-viewer', 'Google のWeb部品。<code>&lt;model-viewer src="mug.glb" ar camera-controls&gt;</code> だけで3D表示とAR表示ができる。', null, ['手軽']),
      T('AR Quick Look / Scene Viewer', 'Mobile AR', 'iPhone（USDZ）と Android の標準のAR表示。model-viewer の ar 属性で自動で使い分けられる。'),
      T('WebXR', 'WebXR', 'ブラウザで VR・AR を動かす仕組み。Meta Quest のブラウザなどで没入体験ができる。'),
      T('ホットスポット（注目点）', 'Hotspots / annotations', '3Dの位置にHTMLのラベルを重ねる。drei の <code>&lt;Html&gt;</code>、three.js の CSS2DRenderer で簡単に。'),
      T('ポスター画像', 'Poster', '3Dが準備できるまでの静止画。読み込み失敗時や性能が低い端末の代わりにもなる。', null, ['UX']),
      T('遅延読み込み', 'Lazy loading', '3Dが画面に近づいてから読み込む。ファーストビューの表示速度（LCP）を守る。', null, ['性能']),
      T('低スペック端末への配慮', 'Graceful degradation', 'WebGLが使えない・重い端末では画像や動画に切り替える。電池残量や省データモードも考える。'),
      T('動きを減らす', 'prefers-reduced-motion', '自動回転・カメラの大きな移動・点滅を止める。酔いやすい人への配慮。', null, ['アクセシビリティ']),
      T('3Dの代わりの情報', 'Accessible alternatives', '3Dはスクリーンリーダーで読めない。商品の説明・寸法・色の一覧を<b>文字でも</b>載せる。canvas には aria-label を。', null, ['アクセシビリティ']),
      T('キーボードで操作', 'Keyboard controls', '回転・拡大をボタンやキーでもできるようにする。ドラッグだけに頼らない。'),
      T('スクロールを奪わない', 'Scroll hijacking', '3Dの上でホイールを回したらページがスクロールしてほしい。ズームは Ctrl＋ホイールやボタンに。', null, ['UX']),
      T('three-vrm', '@pixiv/three-vrm', 'VRM アバターを three.js で表示・操作するライブラリ。表情・視線・揺れ物に対応。'),
      T('SEOと3D', 'SEO', '検索エンジンは3Dの中身を読めない。商品名・説明は普通のHTMLで書き、構造化データも付ける。'),
      T('Spline の埋め込み', 'Spline embed', 'Spline で作った3Dは、コード1行や React 部品で埋め込める。重くなりやすいので、書き出し時に品質を確認。'),
    ]),
  ]});
})();
