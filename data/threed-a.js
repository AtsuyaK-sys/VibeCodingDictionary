/* 3D・WebGL・シェーダー辞典 — A: 共通ヘルパー / 3Dの基本 / 形と質感 / 光と影 / 動きと操作 */
(function(){
const { $, $$, esc, seg, stepper } = KIT;
const S = (title, items, note) => ({ title, note, layout:'rows', items });
const C = (title, items, note, lg) => ({ title, note, layout:lg ? 'cards lg' : 'cards', items });
const T = (name, en, desc, prompt, tags, more) => Object.assign({ name, en, desc, prompt, tags }, more || {});
const verdict = (el, cls, html) => { el.classList.remove('ok', 'bad', 'warn'); if (cls) el.classList.add(cls); el.innerHTML = html; };
const cssv = (el, n) => getComputedStyle(el).getPropertyValue(n).trim();

/* ---- three.js の読み込みと、全デモで共有する1つのレンダラー ----
   ブラウザが同時に持てるWebGLの画面は16個前後まで。デモごとに作ると古いものが消えるので、
   1つのレンダラーで描いて、各デモの2Dキャンバスに写し取る。 */
let P3 = null;
function load3(){
  return P3 || (P3 = Promise.all([import('three'), import('three/addons/controls/OrbitControls.js'), import('three/addons/environments/RoomEnvironment.js')]).then(([T3, O, R]) => {
    const r = new T3.WebGLRenderer({ antialias:true, alpha:true, powerPreference:'high-performance' });
    r.setPixelRatio(1); r.shadowMap.enabled = true; r.shadowMap.type = T3.PCFShadowMap;
    const pm = new T3.PMREMGenerator(r), env = pm.fromScene(new R.RoomEnvironment(), .04).texture; pm.dispose();
    const G = { T:T3, r, Orbit:O.OrbitControls, env, cur:null };
    r.debug.onShaderError = (gl, prog, vs, fs) => { const s = G.cur; if (s && s.onShaderError) s.onShaderError(gl.getShaderInfoLog(fs) || gl.getShaderInfoLog(vs) || 'シェーダーのエラー'); };
    return G;
  }).catch(e => { P3 = null; throw e; }));
}
// 画面の外にあるデモは描かない（電池とGPUの節約）
const onScreen = (el) => { const b = el.getBoundingClientRect(); return b.bottom > -40 && b.top < innerHeight + 40; };
function dispose3(root){
  root.traverse(o => {
    if (o.geometry) o.geometry.dispose();
    [].concat(o.material || []).forEach(m => { for (const k in m){ const v = m[k]; if (v && v.isTexture) v.dispose(); } m.dispose(); });
    if (o.isLight && o.dispose) o.dispose();
    if (o.dispose && /Helper$/.test(o.type || '')) o.dispose();
  });
}
// 3Dデモの土台。setup(S) の中でシーンを組み立て、S.frame = (dt, t) => {} で毎フレームの動きを書く
function view3(el, setup, o = {}){
  const box = $(el, '.t3-cv'); let dead = false, stop = null, St = null; const offs = [];
  box.insertAdjacentHTML('beforeend', '<div class="ph">3Dを読み込み中…</div>');
  load3().then(G => {
    if (dead || !box.isConnected) return;
    const T3 = G.T, r = G.r; const ph0 = $(box, '.ph'); if (ph0) ph0.remove();
    const w = box.clientWidth || 300, h = box.clientHeight || 200, dpr = Math.min(2, devicePixelRatio || 1);
    const pw = Math.max(1, Math.round(w * dpr)), ph = Math.max(1, Math.round(h * dpr));
    const cv = document.createElement('canvas'); cv.width = pw; cv.height = ph; box.prepend(cv); const ctx = cv.getContext('2d');
    const scene = new T3.Scene(); if (o.env !== false) scene.environment = G.env;
    const cam = new T3.PerspectiveCamera(o.fov || 40, w / h, .1, 500); cam.position.set(...(o.cam || [4, 3, 5]));
    const tgt = new T3.Vector3(...(o.target || [0, 0, 0])); cam.lookAt(tgt);
    const dark = new T3.Color(cssv(box, '--stage') || '#ecebe5').getHSL({}).l < .4;
    St = { T:T3, G, r, scene, cam, cv, box, w, h, pw, ph, dpr, dark, tone:T3.ACESFilmicToneMapping, exposure:1, bg:null, frame:null, offs };
    if (o.orbit !== false){
      const c = new G.Orbit(cam, cv); c.target.copy(tgt); c.enableDamping = true; c.enablePan = !!o.pan; c.enableZoom = !!o.zoom;
      c.minDistance = o.minD || 1.5; c.maxDistance = o.maxD || 40; c.update(); St.controls = c; offs.push(() => c.dispose());
    }
    St.draw = () => {
      if (r.domElement.width < pw || r.domElement.height < ph) r.setSize(Math.max(pw, r.domElement.width), Math.max(ph, r.domElement.height), false);
      G.cur = St; r.toneMapping = St.tone; r.toneMappingExposure = St.exposure;
      r.setViewport(0, 0, pw, ph); r.setScissor(0, 0, pw, ph); r.setScissorTest(true);
      if (St.bg != null) r.setClearColor(St.bg, 1); else r.setClearColor(0, 0);
      r.render(scene, St.cam);
      ctx.clearRect(0, 0, pw, ph); ctx.drawImage(r.domElement, 0, r.domElement.height - ph, pw, ph, 0, 0, pw, ph);
    };
    try{ setup(St); }catch(e){ console.error(e); }
    let first = true;
    stop = VD.loop(cv, (dt, t) => { if (!first && !onScreen(cv)) return; first = false; if (St.frame) St.frame(dt, t); if (St.controls) St.controls.update(); St.draw(); });
  }).catch(e => { const p = $(box, '.ph'); if (p) p.innerHTML = '3Dの部品（three.js）を読み込めませんでした。<br>ネット接続を確認して ↻ を押してください。'; console.warn(e); });
  return () => { dead = true; if (stop) stop(); offs.forEach(f => { try{ f(); }catch(e){} }); if (St) dispose3(St.scene); };
}
// よく使う部品：床・ライト・チェックボックス・スライダー
function floor3(S, size = 40){ const { T:T3 } = S; const m = new T3.Mesh(new T3.PlaneGeometry(size, size), new T3.MeshStandardMaterial({ color:S.dark ? 0x3a3b42 : 0xe4e1d8, roughness:.95 })); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; S.scene.add(m); return m; }
function lights3(S, o = {}){
  const { T:T3 } = S; const hemi = new T3.HemisphereLight(0xffffff, 0x8a8577, o.hemi ?? .7); const sun = new T3.DirectionalLight(0xffffff, o.sun ?? 2.4);
  sun.position.set(4, 7, 3); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); const c = sun.shadow.camera; c.left = c.bottom = -5; c.right = c.top = 5; c.near = .5; c.far = 25; sun.shadow.bias = -.0006; sun.shadow.normalBias = .02;
  S.scene.add(hemi, sun); return { hemi, sun };
}
function checks(box, defs, on){ const st = {}; box.innerHTML = defs.map(([k, l, v]) => (st[k] = v, `<label><input type="checkbox" data-k="${k}"${v ? ' checked' : ''}>${l}</label>`)).join(''); $$(box, 'input').forEach(i => i.onchange = () => { st[i.dataset.k] = i.checked; if (on) on(st, i.dataset.k); }); return st; }
function sliders(box, defs, on){
  const st = {}; box.classList.add('t3-ctl');
  box.innerHTML = defs.map(([k, l, a, b, s, v]) => (st[k] = v, `<b>${l}</b><input type="range" min="${a}" max="${b}" step="${s}" value="${v}" data-k="${k}" aria-label="${l}"><output data-o="${k}"></output>`)).join('');
  const show = () => defs.forEach(d => { $(box, `[data-o="${d[0]}"]`).textContent = d[6] ? d[6](st[d[0]]) : st[d[0]]; });
  $$(box, 'input').forEach(i => i.oninput = () => { st[i.dataset.k] = +i.value; show(); if (on) on(st, i.dataset.k); }); show(); return st;
}
// 番号入りのテクスチャ（UVの確認用）。canvas をそのまま縮小表示にも使う
function uvTex(T3, n = 4){
  const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'), s = 512 / n;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++){ g.fillStyle = `hsl(${(x + y * n) * 360 / (n * n)} 65% ${(x + y) % 2 ? 60 : 48}%)`; g.fillRect(x * s, y * s, s, s); g.fillStyle = '#fff'; g.font = `900 ${s * .45}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(x + y * n + 1, x * s + s / 2, y * s + s / 2 + 4); }
  g.fillStyle = 'rgba(0,0,0,.55)'; g.font = '700 26px monospace'; g.textAlign = 'left'; g.fillText('u→', 10, 500); g.save(); g.translate(18, 470); g.fillText('v↑', 0, -16); g.restore();
  const t = new T3.CanvasTexture(c); t.colorSpace = T3.SRGBColorSpace; t.wrapS = t.wrapT = T3.RepeatWrapping; t.anisotropy = 8; return { t, c };
}
// 小さな家と木の島（カメラ操作の題材）
function island(S){
  const { T:T3 } = S, g = new T3.Group(), M = (c, r = .8) => new T3.MeshStandardMaterial({ color:c, roughness:r, flatShading:true });
  const land = new T3.Mesh(new T3.CylinderGeometry(2.6, 2.2, .6, 9), M(0x7cb342)); land.position.y = -.3; land.receiveShadow = true; g.add(land);
  const house = new T3.Mesh(new T3.BoxGeometry(1, .8, .9), M(0xfff3e0)); house.position.set(-.5, .4, .1); const roof = new T3.Mesh(new T3.ConeGeometry(.85, .6, 4), M(0xe53935)); roof.position.set(-.5, 1.1, .1); roof.rotation.y = Math.PI / 4; const door = new T3.Mesh(new T3.BoxGeometry(.25, .4, .05), M(0x6d4c41)); door.position.set(-.5, .2, .57); g.add(house, roof, door);
  [[1.2, .9], [1.4, -.6], [.4, -1.4], [-1.6, -.9], [-1.5, 1.2]].forEach(([x, z], i) => { const tr = new T3.Mesh(new T3.CylinderGeometry(.07, .1, .4), M(0x795548)); tr.position.set(x, .2, z); const lf = new T3.Mesh(new T3.ConeGeometry(.35 + i % 2 * .1, .9, 7), M(0x2e7d32)); lf.position.set(x, .8, z); g.add(tr, lf); });
  const water = new T3.Mesh(new T3.CircleGeometry(4.5, 40), new T3.MeshStandardMaterial({ color:0x4fc3f7, roughness:.2, metalness:.1, transparent:true, opacity:.75 })); water.rotation.x = -Math.PI / 2; water.position.y = -.45; g.add(water);
  g.traverse(o => { if (o.isMesh){ o.castShadow = true; o.receiveShadow = true; } }); S.scene.add(g); return g;
}
// 回転体で作る花びん（商品ビューアなどで使う）
function vase(S, color = 0x5b8def){
  const { T:T3 } = S; const pts = [[0, 0], [.55, 0], [.62, .1], [.7, .5], [.62, 1], [.38, 1.35], [.3, 1.6], [.36, 1.8], [.33, 1.82], [.26, 1.62], [.32, 1.34], [.56, 1], [.64, .5], [.56, .12], [0, .1]].map(([x, y]) => new T3.Vector2(x, y));
  const m = new T3.Mesh(new T3.LatheGeometry(pts, 64), new T3.MeshPhysicalMaterial({ color, roughness:.35, clearcoat:.6, side:T3.DoubleSide })); m.castShadow = true; m.receiveShadow = true; return m;
}
window.T3H = { S, C, T, verdict, cssv, load3, view3, floor3, lights3, checks, sliders, uvTex, island, vase };

/* ================= 1. 3Dの基本 ================= */
const PIPE = [
  '<b>JavaScriptでシーンを用意</b><br>形（頂点の座標）・材質・ライト・カメラを決める。three.js ならここを書くだけ。',
  '<b>GPUに送る（ドローコール）</b><br>頂点のデータをGPUのメモリに入れ、「この形をこの材質で描いて」と命令する。命令の回数＝ドローコール。',
  '<b>頂点シェーダー</b><br>頂点ごとに「画面のどこに来るか」を計算。移動・回転・カメラの遠近はここで反映される。',
  '<b>ラスタライズ</b><br>三角形が画面のどのピクセル（画素）を覆うかを調べ、画素に分解する。',
  '<b>フラグメントシェーダー</b><br>覆われた画素ごとに色を計算。光の当たり方・テクスチャ・影はここ。画素の数だけ同時に動く。',
  '<b>奥行きの比較と合成</b><br>手前にある物だけを残し（深度テスト）、半透明は重ねて混ぜる。',
  '<b>画面に表示 → くり返す</b><br>これを1秒に60回（120Hzの画面なら120回）くり返すとアニメーションになる。1回あたり約16ミリ秒が目安。',
];
const WAYS = [
  ['CSSの3D変形', '★☆☆', '板（DOM要素）を3D空間で回す・重ねる', 'カードの裏返し・立方体メニュー・奥行きのある演出'],
  ['Canvas 2D（疑似3D）', '★★☆', '自分で遠近を計算して2Dで描く', '簡単な回転・星空・パーティクル'],
  ['WebGL を直接書く', '★★★★', 'GPUを直接使う。何でもできるが大量のコード', '学習・特殊な効果・超軽量にしたい時'],
  ['three.js', '★★☆', 'WebGLを使いやすくした定番ライブラリ', '<b>まずはこれ</b>。商品ビューア・LP演出・ゲーム'],
  ['React Three Fiber', '★★☆', 'three.js を React の部品として書ける', 'Next.js / React のサイトに3Dを入れる'],
  ['Babylon.js', '★★☆', '高機能な3Dエンジン（物理・XR・エディタ付き）', '本格的なゲーム・業務用の3D'],
  ['Spline', '★☆☆', 'ブラウザ上で3Dを作って、そのまま埋め込める', 'デザイナーが作るLPのヒーロー演出'],
  ['&lt;model-viewer&gt;', '★☆☆', 'タグ1つで3Dモデルを表示・AR表示', '商品の3D表示・ARでの試し置き'],
  ['WebGPU', '★★★★', 'WebGLの次の世代。より速く、計算にも使える', '大量の物体・GPU計算（three.js も対応が進む）'],
];

TABS.push({ id:'basics', label:'3Dの基本', icon:'🧊',
  intro:'Webの3Dは<b>「シーン（舞台）」に「物体」と「ライト」を置き、「カメラ」で撮った絵を1秒に60回描き直す</b>仕組みです。この辞典のデモは、定番ライブラリの <b>three.js</b> で動いています（ドラッグで回せます）。まずは4つの部品と、3Dが画面の画素になるまでの流れをつかみましょう。',
  sections:[
    C('触って理解する', [
      { name:'3Dを作る4つの部品', en:'Scene / Camera / Light / Mesh', h:420, tags:['基本','体験'],
        demo:'<div class="kt"><div class="t3-cv kt-grow"><span class="tag">scene（舞台）</span><span class="tip">ドラッグで回転</span></div><div class="t3-checks ck"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let st, apply = () => {};
          st = checks($(el, '.ck'), [['light', 'ライト', true], ['mesh', '物体（メッシュ）', true], ['floor', '床と影', true], ['axes', '座標の矢印', false], ['wire', '骨組み表示', false]], () => apply());
          return view3(el, S => { const { T:T3, scene } = S; const L = lights3(S), fl = floor3(S), ax = new T3.AxesHelper(2.2);
            const mat = new T3.MeshStandardMaterial({ color:0x7c3aed, roughness:.35, metalness:.1 }); const mesh = new T3.Mesh(new T3.TorusKnotGeometry(.65, .22, 140, 18), mat); mesh.position.y = 1.15; mesh.castShadow = true; scene.add(mesh, ax);
            apply = () => { L.sun.visible = L.hemi.visible = st.light; scene.environment = st.light ? S.G.env : null; mesh.visible = st.mesh; fl.visible = st.floor; L.sun.castShadow = st.floor; ax.visible = st.axes; mat.wireframe = st.wire;
              verdict($(el, '.res'), st.light && st.mesh ? 'ok' : 'warn', !st.light ? '💡 ライトを消すと、光に反応する材質は<b>真っ黒</b>になります。3Dが真っ暗なときは、まずライトを疑いましょう。' : !st.mesh ? '物体がないと何も映りません。<b>メッシュ＝形（ジオメトリ）＋材質（マテリアル）</b>です。' : st.wire ? '骨組み表示：3Dの形は<b>小さな三角形の集まり</b>でできています。' : '<b>シーン</b>に<b>物体・ライト</b>を置き、<b>カメラ</b>で撮ったものを<b>レンダラー</b>が描いています。'); };
            apply(); S.frame = (dt) => { mesh.rotation.y += dt * .6; mesh.rotation.x += dt * .2; }; }, { cam:[3.5, 2.8, 4.5], target:[0, .9, 0] }); },
        desc:'3Dの画面は<b>シーン（舞台）・カメラ・ライト・メッシュ（物体）</b>の4つと、それを描く<b>レンダラー</b>でできています。メッシュは「形（ジオメトリ）」と「材質（マテリアル）」の組み合わせ。チェックを外して、それぞれが何をしているか確かめましょう。',
        prompt:'three.js で、回転するトーラスノットを床の上に置いた最小のシーンを作って。シーン・カメラ・ライト（環境光と平行光源）・影・レンダラーをそれぞれコメント付きで書き、画面サイズの変更にも対応させて。',
        code:'import * as THREE from "three";\n\nconst scene = new THREE.Scene();                         // 舞台\nconst camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 100);\ncamera.position.set(3.5, 2.8, 4.5);                     // カメラの位置\ncamera.lookAt(0, 1, 0);\n\nconst renderer = new THREE.WebGLRenderer({ antialias: true });\nrenderer.setSize(innerWidth, innerHeight);\nrenderer.setPixelRatio(Math.min(2, devicePixelRatio)); // 高解像度画面でも2倍まで\ndocument.body.append(renderer.domElement);\n\nscene.add(new THREE.HemisphereLight(0xffffff, 0x888888, 0.7)); // 全体の明るさ\nconst sun = new THREE.DirectionalLight(0xffffff, 2.4);           // 太陽のような光\nsun.position.set(4, 7, 3);\nscene.add(sun);\n\nconst mesh = new THREE.Mesh(\n  new THREE.TorusKnotGeometry(0.65, 0.22, 140, 18),            // 形\n  new THREE.MeshStandardMaterial({ color: 0x7c3aed })          // 材質\n);\nmesh.position.y = 1.15;\nscene.add(mesh);\n\nrenderer.setAnimationLoop((time) => {                  // 毎フレーム\n  mesh.rotation.y = time / 1000;\n  renderer.render(scene, camera);\n});' },
      { name:'位置・回転・大きさ', en:'Transform: position / rotation / scale', h:440, tags:['基本','体験'],
        demo:'<div class="kt"><div class="t3-cv kt-grow"><span class="tag">ワールド座標（赤x 緑y 青z）</span></div><div class="sl"></div><div class="kt-code cd"></div></div>',
        init:(el) => { let apply = () => {};
          const st = sliders($(el, '.sl'), [['x', '位置 x', -2, 2, .1, 0], ['y', '位置 y', 0, 2, .1, .5], ['z', '位置 z', -2, 2, .1, 0], ['ry', '回転 y', -180, 180, 5, 30, v => v + '°'], ['rx', '回転 x', -180, 180, 5, 0, v => v + '°'], ['s', '大きさ', .3, 2, .1, 1, v => '×' + v]], () => apply());
          return view3(el, S => { const { T:T3, scene } = S; lights3(S); scene.add(new T3.GridHelper(6, 12, 0x888888, 0x888888), new T3.AxesHelper(3.2));
            const box = new T3.Mesh(new T3.BoxGeometry(1, 1, 1), new T3.MeshStandardMaterial({ color:0xf59e0b, roughness:.5 })); box.castShadow = true; box.add(new T3.AxesHelper(1)); scene.add(box);
            apply = () => { box.position.set(st.x, st.y, st.z); box.rotation.set(st.rx * Math.PI / 180, st.ry * Math.PI / 180, 0); box.scale.setScalar(st.s);
              $(el, '.cd').innerHTML = `mesh.position.set(<b>${st.x}</b>, <b>${st.y}</b>, <b>${st.z}</b>);\nmesh.rotation.set(<b>${(st.rx * Math.PI / 180).toFixed(2)}</b>, <b>${(st.ry * Math.PI / 180).toFixed(2)}</b>, 0); <span class="c">// 角度はラジアン</span>\nmesh.scale.setScalar(<b>${st.s}</b>);`; };
            apply(); }, { cam:[5, 4, 6], target:[0, .5, 0] }); },
        desc:'物体の置き方は<b>位置（position）・回転（rotation）・大きさ（scale）</b>の3つ。three.js は<b>Y軸が上</b>で、回転の角度は度ではなく<b>ラジアン</b>（180°＝π）です。箱の中の小さな矢印は「箱自身の向き（ローカル座標）」で、回転すると一緒に回ります。',
        prompt:'three.js のメッシュを、度で指定した角度で回転させたい。度→ラジアンの変換（THREE.MathUtils.degToRad）を使って、位置・回転・大きさをまとめて設定する関数を書いて。' },
      { name:'透視投影と平行投影', en:'Perspective vs Orthographic camera', h:400, tags:['カメラ','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="t3-cv kt-grow"></div><div class="sl"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let mode = 0, apply = () => {};
          $(el, '.sw').replaceWith(seg(['透視（Perspective）', '平行（Orthographic）'], i => { mode = i; apply(); }).el);
          const st = sliders($(el, '.sl'), [['fov', '画角（fov）', 15, 100, 1, 45, v => v + '°']], () => apply());
          return view3(el, S => { const { T:T3, scene } = S; lights3(S); floor3(S, 30);
            for (let i = 0; i < 7; i++) [-1.3, 1.3].forEach((x, j) => { const b = new T3.Mesh(new T3.BoxGeometry(.8, 1.2, .8), new T3.MeshStandardMaterial({ color:new T3.Color().setHSL((i * .08 + j * .5) % 1, .6, .55) })); b.position.set(x, .6, -i * 1.8 + 3); b.castShadow = true; scene.add(b); });
            const persp = S.cam, a = S.w / S.h, k = 4, ortho = new T3.OrthographicCamera(-a * k, a * k, k, -k, .1, 100);
            apply = () => { S.cam = mode ? ortho : persp; persp.fov = st.fov; persp.updateProjectionMatrix(); $(el, '.sl').style.opacity = mode ? .35 : 1;
              verdict($(el, '.res'), '', mode ? '<b>平行投影</b>：遠くても同じ大きさ。設計図・アイソメトリックなゲーム・UIの3D表示に。' : `<b>透視投影</b>：遠くの物ほど小さく見える、人の目と同じ見え方。画角 ${st.fov}° ${st.fov < 30 ? '（望遠：遠近感が弱い）' : st.fov > 70 ? '（広角：遠近感が強く、端がゆがむ）' : '（自然な見え方）'}`); };
            apply(); S.frame = (dt, t) => { const p = [Math.sin(t * .25) * 7, 4.5, Math.cos(t * .25) * 7 + 2]; [persp, ortho].forEach(c => { c.position.set(...p); c.lookAt(0, .5, -2); }); }; }, { orbit:false }); },
        desc:'カメラには、遠くの物が小さく見える<b>透視投影</b>と、距離に関係なく同じ大きさの<b>平行投影</b>があります。透視投影は<b>画角（fov）</b>で見え方が変わり、小さいと望遠、大きいと広角。商品の見せ方では30〜45°くらいが自然です。',
        prompt:'three.js で、アイソメトリック（斜め上からの平行投影）のミニチュア風の街を表示して。OrthographicCamera を使い、画面サイズが変わってもゆがまないように left/right/top/bottom を計算し直して。' },
      { name:'三角形が画素になるまで', en:'Rasterization', h:420, tags:['仕組み','体験'],
        demo:'<div class="kt"><div class="kt-grow cvb" style="position:relative;touch-action:none"></div><div class="kt-verdict res"></div></div>', hint:'点をドラッグ',
        init:(el) => { const box = $(el, '.cvb'); const { ctx, w, h } = VD.canvas(box); const cs = Math.max(8, Math.floor(Math.min(w / 30, h / 16))), cols = Math.floor(w / cs), rows = Math.floor(h / cs), ox = (w - cols * cs) / 2, oy = (h - rows * cs) / 2;
          const P = [[cols * .15, rows * .15], [cols * .88, rows * .4], [cols * .35, rows * .9]], COL = [[239, 68, 68], [34, 197, 94], [59, 130, 246]], line = cssv(el, '--border-strong'), ink = cssv(el, '--stage-ink'); let drag = -1;
          const draw = () => { ctx.clearRect(0, 0, w, h); const [a, b, c] = P, d = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]); let n = 0;
            for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++){ const x = i + .5, y = j + .5, l1 = ((b[1] - c[1]) * (x - c[0]) + (c[0] - b[0]) * (y - c[1])) / d, l2 = ((c[1] - a[1]) * (x - c[0]) + (a[0] - c[0]) * (y - c[1])) / d, l3 = 1 - l1 - l2;
              if (l1 >= 0 && l2 >= 0 && l3 >= 0){ n++; ctx.fillStyle = `rgb(${[0, 1, 2].map(k => Math.round(COL[0][k] * l1 + COL[1][k] * l2 + COL[2][k] * l3)).join(',')})`; ctx.fillRect(ox + i * cs + .5, oy + j * cs + .5, cs - 1, cs - 1); }
              else { ctx.strokeStyle = line; ctx.globalAlpha = .5; ctx.strokeRect(ox + i * cs + .5, oy + j * cs + .5, cs - 1, cs - 1); ctx.globalAlpha = 1; } }
            ctx.strokeStyle = ink; ctx.lineWidth = 1.5; ctx.beginPath(); P.forEach(([x, y], k) => ctx[k ? 'lineTo' : 'moveTo'](ox + x * cs, oy + y * cs)); ctx.closePath(); ctx.stroke();
            P.forEach(([x, y], k) => { ctx.fillStyle = `rgb(${COL[k]})`; ctx.beginPath(); ctx.arc(ox + x * cs, oy + y * cs, 8, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); });
            verdict($(el, '.res'), '', `頂点シェーダー：<b>3回</b>（頂点の数）　フラグメントシェーダー：<b>${n}回</b>（塗られた画素の数）<br>頂点の色は、間の画素で<b>自動でなめらかに混ざります</b>（補間）。`); };
          const pos = (e) => { const r = box.getBoundingClientRect(); return [(e.clientX - r.left - ox) / cs, (e.clientY - r.top - oy) / cs]; };
          box.onpointerdown = (e) => { const [x, y] = pos(e); drag = P.findIndex(p => Math.hypot(p[0] - x, p[1] - y) * cs < 18); if (drag >= 0) box.setPointerCapture(e.pointerId); };
          box.onpointermove = (e) => { if (drag < 0) return; const [x, y] = pos(e); P[drag] = [Math.max(0, Math.min(cols, x)), Math.max(0, Math.min(rows, y))]; draw(); };
          box.onpointerup = () => { drag = -1; }; draw(); },
        desc:'3Dの物体は、最後には画面の<b>画素（ピクセル）</b>に変換されます。頂点ごとに位置を決める<b>頂点シェーダー</b>、三角形が覆う画素を探す<b>ラスタライズ</b>、画素ごとに色を決める<b>フラグメントシェーダー</b>の順。画素の数だけ計算が走るので、<b>画面が大きい・高解像度ほど重く</b>なります。',
        prompt:'three.js のサイトがスマホで重いです。画素数（devicePixelRatio）を2までに制限する、影やポストエフェクトを端末の性能で切り替える、など「画素の数」を減らす対策をして。' },
      { name:'描画の流れ（パイプライン）', en:'Rendering pipeline', h:420, tags:['仕組み'],
        init:(el) => stepper(el, PIPE, { title:'1フレームが描かれるまで' }),
        desc:'3Dの1コマは「JSで準備 → GPUへ命令 → 頂点を計算 → 画素に分解 → 色を計算 → 合成して表示」という流れで描かれます。これを<b>1秒に60回</b>。重いときは「どこが詰まっているか」（命令の回数・頂点の数・画素の数）を考えると原因が見つかります。',
        prompt:'このthree.jsのシーンのどこが重いか調べたい。renderer.info でドローコール数・三角形の数を表示し、stats.js でFPSを表示するデバッグ用のパネルを付けて。' },
    ], null, true),
    { title:'Webで3Dを表示する方法', note:'迷ったら <b>three.js</b>（Reactなら <b>React Three Fiber</b>）。3Dモデルを見せるだけなら <b>&lt;model-viewer&gt;</b>、デザイナー主導なら <b>Spline</b> が手軽です。',
      table:{ head:['方法', '難しさ', 'できること', '向いている用途'], rows:WAYS } },
    S('3Dの基本用語', [
      T('シーン', 'Scene', '3Dの物体・ライト・カメラを置く「舞台」。描くときは「どのシーンを、どのカメラで」を指定する。'),
      T('カメラ', 'Camera', 'シーンを撮る視点。遠近のある PerspectiveCamera が基本。位置・向き・画角（fov）・写る範囲（near / far）を決める。'),
      T('レンダラー', 'Renderer', 'シーンをカメラで撮って、画面（canvas）に描く係。three.js では WebGLRenderer（新しい WebGPURenderer もある）。'),
      T('メッシュ', 'Mesh', '画面に映る物体。<b>形（ジオメトリ）＋材質（マテリアル）</b>の組み合わせ。'),
      T('ジオメトリ', 'Geometry', '形のデータ。頂点の座標・法線・UVなどが入っている。箱・球・円柱などの基本形が用意されている。'),
      T('マテリアル', 'Material', '表面の質感。色・つや・金属っぽさ・透明度など。光への反応のしかたで種類が分かれる。（「形と質感」タブ）'),
      T('頂点・辺・面（ポリゴン）', 'Vertex / Edge / Face', '3Dの形は点（頂点）を結んだ<b>三角形</b>の集まり。三角形の数が多いほど滑らかだが重い。'),
      T('法線', 'Normal', '面がどちらを向いているかを表す矢印。光の当たり方の計算に使う。法線がおかしいと、黒い面や裏返りが起きる。'),
      T('UV座標', 'UV', '画像（テクスチャ）のどこを、形のどこに貼るかを表す 0〜1 の座標。横がU、縦がV。'),
      T('ワールド座標とローカル座標', 'World / local space', 'シーン全体の座標と、物体自身の座標。親子にした物体は、親と一緒に動く（グループ化）。'),
      T('Y軸が上（右手座標系）', 'Y-up, right-handed', 'three.js は<b>Yが上</b>、Xが右、Zが手前。Blender は Z が上なので、書き出し時に向きが変換される。'),
      T('単位', 'Units', 'three.js の 1 は決まった長さではないが、<b>1＝1メートル</b>で作るのが習慣。物理演算・AR・ライトの強さが自然になる。'),
      T('ラジアン', 'Radians', '回転の単位。180°＝π（約3.14）。<code>THREE.MathUtils.degToRad(90)</code> で変換。'),
      T('クォータニオン', 'Quaternion', '回転を表す別の方法。回転を組み合わせても「ジンバルロック」（軸が重なって回らなくなる）が起きない。カメラや物理演算で使う。'),
      T('GPU', 'Graphics Processing Unit', '画像の計算が得意な部品。たくさんの頂点・画素を<b>同時に</b>計算する。3Dが速いのはGPUのおかげ。'),
      T('WebGL / WebGL2', 'WebGL', 'ブラウザからGPUを使うための仕組み。ほぼ全てのブラウザで動く。three.js などは中でこれを使っている。'),
      T('WebGPU', 'WebGPU', 'WebGLの次の世代の仕組み。速く、GPUで計算（AIや物理）もできる。主要ブラウザで使えるようになり、three.js も WebGPURenderer で対応。'),
      T('フレームレート（FPS）', 'Frames per second', '1秒に何回描き直すか。60が目安、120Hzの画面なら120。下がるとカクカクする。'),
    ]),
  ]});

/* ================= 2. 形と質感 ================= */
const SHAPES = [['箱', g => new g.BoxGeometry(1.4, 1.4, 1.4, 1, 1, 1), 'BoxGeometry'], ['球', (g, n) => new g.SphereGeometry(.9, n * 2, n), 'SphereGeometry'], ['円柱', (g, n) => new g.CylinderGeometry(.7, .7, 1.6, n * 2), 'CylinderGeometry'], ['円すい', (g, n) => new g.ConeGeometry(.8, 1.6, n * 2), 'ConeGeometry'], ['ドーナツ', (g, n) => new g.TorusGeometry(.7, .3, n, n * 3), 'TorusGeometry'], ['多面体', (g, n) => new g.IcosahedronGeometry(.95, Math.min(5, Math.floor(n / 6))), 'IcosahedronGeometry'], ['カプセル', (g, n) => new g.CapsuleGeometry(.5, .8, Math.max(2, n / 2 | 0), n * 2), 'CapsuleGeometry']];
const MATS = [
  ['Basic', 'MeshBasicMaterial', '光の影響を受けない。単色・テクスチャをそのまま表示。最も軽い', '●○○○'],
  ['Lambert', 'MeshLambertMaterial', 'つや消し。光は当たるがハイライトなし。軽い', '●●○○'],
  ['Phong', 'MeshPhongMaterial', 'つやのあるハイライト。プラスチック風', '●●○○'],
  ['Standard', 'MeshStandardMaterial', '<b>PBR（現実の光の計算）</b>。金属っぽさ・粗さで質感を決める。<b>迷ったらこれ</b>', '●●●○'],
  ['Physical', 'MeshPhysicalMaterial', 'Standard ＋ クリアコート・ガラス（透過）・光沢布など。最も高品質で重い', '●●●●'],
  ['Toon', 'MeshToonMaterial', 'アニメ調の、段階的な陰影', '●●○○'],
  ['Normal', 'MeshNormalMaterial', '面の向きを色で表示。形の確認・デバッグ用', '●○○○'],
];
const SW = ['#7c3aed', '#e11d48', '#f59e0b', '#10b981', '#0ea5e9', '#e5e7eb', '#1f2937'];

TABS.push({ id:'material', label:'形と質感', icon:'🎨',
  intro:'物体は<b>形（ジオメトリ）</b>と<b>質感（マテリアル）</b>の組み合わせです。質感は、現実の光の当たり方をまねる <b>PBR</b>（金属っぽさ・粗さ）が今の標準。画像を貼る<b>テクスチャ</b>と<b>UV</b>、ガラスや発光の表現も見ていきましょう。',
  sections:[
    C('触って理解する', [
      { name:'基本の形と分割数', en:'Built-in geometries', h:430, tags:['基本','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="t3-cv kt-grow"><span class="tag tg"></span></div><div class="sl"></div><div class="t3-checks ck"></div></div>',
        init:(el) => { let k = 1, apply = () => {};
          $(el, '.sw').replaceWith(seg(SHAPES.map(s => s[0]), i => { k = i; apply(); }, 1).el);
          const st = sliders($(el, '.sl'), [['n', '分割数', 3, 48, 1, 12]], () => apply()), ck = checks($(el, '.ck'), [['wire', '骨組み', false], ['flat', '角ばった陰影（flat）', false]], () => apply());
          return view3(el, S => { const { T:T3, scene } = S; lights3(S); floor3(S); const mat = new T3.MeshStandardMaterial({ color:0x0ea5e9, roughness:.35 }); const mesh = new T3.Mesh(undefined, mat); mesh.position.y = 1.1; mesh.castShadow = true; scene.add(mesh);
            apply = () => { if (mesh.geometry) mesh.geometry.dispose(); mesh.geometry = SHAPES[k][1](T3, st.n); mat.wireframe = ck.wire; mat.flatShading = ck.flat; mat.needsUpdate = true; const g = mesh.geometry, tri = (g.index ? g.index.count : g.attributes.position.count) / 3;
              $(el, '.tg').textContent = `new THREE.${SHAPES[k][2]}()　頂点 ${g.attributes.position.count}・三角形 ${tri}`; };
            apply(); S.frame = (dt) => { mesh.rotation.y += dt * .5; }; }, { cam:[3, 2.6, 3.6], target:[0, 1, 0] }); },
        desc:'three.js には箱・球・円柱などの<b>基本の形</b>が用意されています。曲面は三角形の集まりなので、<b>分割数</b>を増やすほど滑らかになりますが、頂点が増えて重くなります。「角ばった陰影」は、あえて面を見せるローポリ表現に使います。',
        prompt:'three.js で、ローポリ（少ない三角形）でかわいい雰囲気の山と木を作って。IcosahedronGeometry や ConeGeometry を分割数少なめで使い、flatShading: true で面が見える質感にして。' },
      { name:'マテリアルの違い', en:'Material types', h:420, tags:['質感','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="t3-cv kt-grow"><span class="tag tg"></span></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let k = 3, apply = () => {};
          $(el, '.sw').replaceWith(seg(MATS.map(m => m[0]), i => { k = i; apply(); }, 3).el);
          return view3(el, S => { const { T:T3, scene } = S; const L = lights3(S); floor3(S); const pl = new T3.PointLight(0xffaa66, 6, 8); pl.position.set(-2, 2, 1.5); scene.add(pl);
            const mesh = new T3.Mesh(new T3.TorusKnotGeometry(.6, .22, 160, 20)); mesh.position.y = 1.1; mesh.castShadow = true; scene.add(mesh);
            apply = () => { const [, cls, d, cost] = MATS[k]; if (mesh.material) mesh.material.dispose(); const o = cls === 'MeshNormalMaterial' ? {} : { color:0x7c3aed }; if (cls === 'MeshStandardMaterial') Object.assign(o, { roughness:.3, metalness:.2 }); if (cls === 'MeshPhysicalMaterial') Object.assign(o, { roughness:.25, clearcoat:1, clearcoatRoughness:.05, sheen:.5 }); if (cls === 'MeshPhongMaterial') o.shininess = 80;
              mesh.material = new T3[cls](o); $(el, '.tg').textContent = 'new THREE.' + cls + '()'; verdict($(el, '.res'), '', `${d}<br>重さ：<b>${cost}</b>`); };
            apply(); S.frame = (dt, t) => { mesh.rotation.y += dt * .4; pl.position.x = Math.sin(t) * 2.2; }; }, { cam:[3, 2.4, 3.6], target:[0, 1, 0] }); },
        desc:'マテリアルは<b>光をどう計算するか</b>で種類が分かれます。光を無視する Basic、つや消しの Lambert、PBRの Standard / Physical など。見た目と重さのバランスで選びますが、<b>普通は Standard</b> で始めればOKです。',
        prompt:'three.js のシーンを、モバイルでも軽く動くようにしたい。遠くの物や小さい物は MeshLambertMaterial に、主役の商品だけ MeshPhysicalMaterial にするなど、マテリアルの使い分けを提案して変更して。' },
      { name:'PBR：金属っぽさと粗さ', en:'metalness × roughness', h:440, tags:['質感','体験','PBR'],
        demo:'<div class="kt"><div class="t3-cv kt-grow"><span class="tag">↓ 金属っぽさ（metalness）　→ 粗さ（roughness）</span></div><div class="kt-row"><div class="t3-sw cl"></div><div class="t3-checks ck"></div></div></div>',
        init:(el) => { let col = SW[2], apply = () => {};
          $(el, '.cl').innerHTML = SW.map(c => `<button type="button" style="background:${c}" data-c="${c}" aria-label="${c}"></button>`).join('');
          $$(el, '.cl button').forEach(b => b.onclick = () => { col = b.dataset.c; apply(); });
          const ck = checks($(el, '.ck'), [['env', '環境マップ（映り込み）', true]], () => apply());
          return view3(el, S => { const { T:T3, scene } = S; const L = lights3(S, { sun:1.6, hemi:.3 }); const balls = [];
            for (let m = 0; m < 3; m++) for (let r = 0; r < 5; r++){ const b = new T3.Mesh(new T3.SphereGeometry(.38, 40, 24), new T3.MeshStandardMaterial({ metalness:m / 2, roughness:r / 4 })); b.position.set((r - 2) * .95, (1 - m) * .95, 0); scene.add(b); balls.push(b); }
            apply = () => { balls.forEach(b => b.material.color.set(col)); scene.environment = ck.env ? S.G.env : null; $$(el, '.cl button').forEach(b => b.classList.toggle('on', b.dataset.c === col)); };
            apply(); }, { cam:[0, 0, 7.2], fov:36 }); },
        desc:'今の3Dの質感は <b>PBR（物理ベースレンダリング）</b>で、<b>金属っぽさ（metalness）</b>と<b>粗さ（roughness）</b>の2つで大半が決まります。上の段が非金属（プラスチック・陶器）、下の段が金属。右へ行くほど表面が粗く、ぼんやりした反射に。<b>環境マップを外すと金属が真っ黒</b>になるのは、金属は「周りを映して」色が決まるからです。',
        prompt:'商品（スニーカー）の3Dモデルを、PBRで本物らしく見せたい。MeshStandardMaterial の metalness / roughness の目安（布・ゴム・革・金具）と、RoomEnvironment か HDRI で環境マップを設定するコードを書いて。' },
      { name:'テクスチャとUV', en:'Textures & UV mapping', h:430, tags:['質感','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="t3-cv kt-grow"><span class="tip">右上：貼っている画像</span></div><div class="sl"></div></div>',
        init:(el) => { let k = 0, apply = () => {};
          $(el, '.sw').replaceWith(seg(['箱', '球', '円柱', 'ドーナツ'], i => { k = i; apply(); }).el);
          const st = sliders($(el, '.sl'), [['rep', 'くり返し（repeat）', 1, 4, 1, 1, v => v + '×' + v], ['off', 'ずらす（offset）', 0, 1, .05, 0]], () => apply());
          return view3(el, S => { const { T:T3, scene } = S; lights3(S); const { t, c } = uvTex(T3); c.className = 't3-thumb'; S.box.append(c); S.offs.push(() => c.remove());
            const mesh = new T3.Mesh(undefined, new T3.MeshStandardMaterial({ map:t, roughness:.6 })); scene.add(mesh); const G3 = [() => new T3.BoxGeometry(1.5, 1.5, 1.5), () => new T3.SphereGeometry(1, 48, 32), () => new T3.CylinderGeometry(.8, .8, 1.6, 48), () => new T3.TorusGeometry(.8, .35, 32, 64)];
            apply = () => { if (mesh.geometry) mesh.geometry.dispose(); mesh.geometry = G3[k](); t.repeat.set(st.rep, st.rep); t.offset.x = st.off; };
            apply(); S.frame = (dt) => { mesh.rotation.y += dt * .35; }; }, { cam:[2.6, 1.8, 3.2] }); },
        desc:'<b>テクスチャ</b>は形に貼る画像、<b>UV</b>は「画像のどこを形のどこに貼るか」の対応表です。箱は面ごとに画像1枚、球は地球儀のように巻き付け、ドーナツは引き伸ばされます。自作のモデルでは Blender で<b>UV展開</b>（形を切り開いて平らにする作業）をします。',
        prompt:'three.js で、木の床のテクスチャ（カラー・法線・粗さの3枚）を床に貼って、4×4 回くり返して表示して。色の画像だけ colorSpace を SRGBColorSpace にし、斜めから見てもぼやけないよう anisotropy も設定して。',
        code:'const loader = new THREE.TextureLoader();\nconst color = loader.load("/textures/wood_color.jpg");\ncolor.colorSpace = THREE.SRGBColorSpace;      // 色の画像だけ sRGB\nconst normal = loader.load("/textures/wood_normal.jpg");\nconst rough  = loader.load("/textures/wood_rough.jpg");\nfor (const t of [color, normal, rough]) {\n  t.wrapS = t.wrapT = THREE.RepeatWrapping;   // くり返す\n  t.repeat.set(4, 4);\n  t.anisotropy = renderer.capabilities.getMaxAnisotropy();\n}\nconst floor = new THREE.Mesh(\n  new THREE.PlaneGeometry(10, 10),\n  new THREE.MeshStandardMaterial({ map: color, normalMap: normal, roughnessMap: rough })\n);' },
      { name:'透明・ガラス・発光', en:'Transparency / Transmission / Emissive', h:420, tags:['質感','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="t3-cv kt-grow"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let k = 2, apply = () => {};
          const MODES = [['不透明', '普通の物体。', { color:0x10b981, roughness:.3 }], ['半透明', '<code>transparent: true, opacity: 0.4</code>。色ガラスのフィルム。重なり順に注意（後ろの物と前後が逆に見えることがある）。', { color:0x10b981, transparent:true, opacity:.4, roughness:.3 }], ['ガラス', '<code>transmission: 1</code>（Physical）。後ろが<b>屈折してゆがんで</b>見える本物のガラス。重いので主役だけに。', { color:0xffffff, transmission:1, thickness:1.2, roughness:.02, ior:1.5 }], ['すりガラス', 'ガラス＋<code>roughness</code>。後ろがぼやける。', { color:0xffffff, transmission:1, thickness:1.2, roughness:.45, ior:1.5 }], ['発光', '<code>emissive</code> で自分が光って見える（周りは照らさない）。照らすにはライトを足す。光のにじみは「ブルーム」の後処理で。', { color:0x111111, emissive:0x22d3ee, emissiveIntensity:2.5 }]];
          $(el, '.sw').replaceWith(seg(MODES.map(m => m[0]), i => { k = i; apply(); }, 2).el);
          return view3(el, S => { const { T:T3, scene } = S; lights3(S); const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d'); for (let i = 0; i < 8; i++){ g.fillStyle = i % 2 ? '#f59e0b' : '#1f2937'; g.fillRect(i * 32, 0, 32, 256); } g.fillStyle = '#e11d48'; g.font = '900 120px sans-serif'; g.textAlign = 'center'; g.fillText('3D', 128, 170);
            const tx = new T3.CanvasTexture(c); tx.colorSpace = T3.SRGBColorSpace; const wall = new T3.Mesh(new T3.PlaneGeometry(5, 3.4), new T3.MeshBasicMaterial({ map:tx })); wall.position.z = -1.8; scene.add(wall);
            const mesh = new T3.Mesh(new T3.TorusKnotGeometry(.6, .25, 160, 24)); scene.add(mesh);
            apply = () => { if (mesh.material) mesh.material.dispose(); mesh.material = new T3.MeshPhysicalMaterial(MODES[k][2]); verdict($(el, '.res'), '', MODES[k][1]); };
            apply(); S.frame = (dt) => { mesh.rotation.y += dt * .4; }; }, { cam:[0, .4, 4.2] }); },
        desc:'透明には、単純に薄くする<b>半透明（opacity）</b>と、後ろが屈折して見える<b>透過（transmission）</b>があります。自分が光って見えるのは<b>発光（emissive）</b>。ガラスは見栄えが良い反面とても重いので、画面の主役1つに絞りましょう。',
        prompt:'three.js で、ガラスの球の中に光る小さな星が浮いているシーンを作って。ガラスは MeshPhysicalMaterial の transmission、星は emissive と PointLight で、UnrealBloomPass で光をにじませて。' },
    ], null, true),
    { title:'マテリアルの比較（three.js）', note:'重さの ● は目安。<b>画面の大部分を占める物ほど、軽いマテリアル</b>にするとスマホで快適になります。',
      table:{ head:['マテリアル', '光の計算', '重さ', '使いどころ'], rows:MATS.map(m => [`<code>${m[1]}</code>`, m[0] === 'Basic' || m[0] === 'Normal' ? 'なし' : m[0] === 'Toon' ? '段階的' : m[0] === 'Lambert' ? '拡散のみ' : m[0] === 'Phong' ? '拡散＋ハイライト' : 'PBR', m[3], m[2]]).concat([['<code>MeshMatcapMaterial</code>', '画像に焼き込み', '●○○○', '球の画像1枚で質感を表現。ライト不要で軽い。彫刻・UI風'], ['<code>ShaderMaterial</code>', '自分で書く', '自由', '独自の表現（「シェーダー」タブ）'], ['<code>PointsMaterial</code> / <code>LineBasicMaterial</code>', 'なし', '●○○○', '点の集まり（パーティクル）・線']]) } },
    S('形と質感の用語', [
      T('ポリゴン数', 'Polygon count', '三角形の数。Webでは画面全体で数十万までが目安。スマホ向けはもっと少なく。', null, ['性能']),
      T('ローポリ', 'Low poly', '少ない三角形で作った、角ばった表現。軽くて、かわいい・レトロな雰囲気。'),
      T('フラット／スムーズシェーディング', 'Flat / smooth shading', '面ごとに一色で塗る（角ばる）か、法線をなめらかにつなぐ（丸く見える）か。'),
      T('PBR', 'Physically Based Rendering', '現実の光の性質に基づく質感の計算。どんな照明でも自然に見え、Blender などのツールとも見た目がそろう。', null, ['定番']),
      T('ベースカラー（アルベド）', 'Base color / albedo', '光や影を含まない、素材そのものの色。'),
      T('金属っぽさ（metalness）', 'Metalness', '0＝非金属、1＝金属。中間はほぼ使わない（さびなど混ざった素材の境目くらい）。'),
      T('粗さ（roughness）', 'Roughness', '0＝鏡のようにつるつる、1＝ざらざら。質感の印象を最も大きく変える。'),
      T('環境マップ・HDRI', 'Environment map / HDRI', '周囲の景色の画像。映り込みと全体の明るさに使う。無料のHDRIは Poly Haven が定番。', null, ['定番']),
      T('法線マップ', 'Normal map', '凹凸を画像で「ふり」をする。ポリゴンを増やさずに細かいデコボコを表現できる（紫っぽい画像）。'),
      T('テクスチャセット', 'Texture set', 'カラー・法線・粗さ・金属・AO（隅の暗さ）をセットで使う。素材サイトでまとめて配布されている。'),
      T('AO（環境遮蔽）', 'Ambient occlusion', 'すき間や隅が暗くなる表現。リアルさと立体感が増す。画像で持たせるか、後処理で計算する。'),
      T('色空間（sRGB とリニア）', 'Color space', '<b>色の画像は sRGB、法線・粗さなどのデータ画像はそのまま</b>。間違えると色が白っぽく・暗くなる。three.js では <code>texture.colorSpace = SRGBColorSpace</code>。', null, ['よくある失敗']),
      T('テクスチャの大きさ', 'Texture size', '1024・2048 など2の累乗が無難。<b>4096 はスマホでメモリを大量に使う</b>。見える大きさに合わせて縮小する。', null, ['性能']),
      T('ミップマップ・異方性フィルタ', 'Mipmaps / anisotropy', '遠くの模様がチラつかないよう、小さい版を自動で使う仕組み。斜めから見た床がぼやける時は anisotropy を上げる。'),
      T('透明の並び順', 'Transparency sorting', '半透明の物は描く順番で見え方が変わる。重なった半透明同士は破綻しやすいので、<code>depthWrite: false</code> や順番の指定で調整。'),
      T('両面表示', 'side: DoubleSide', '普通は表側だけ描く。薄い板・葉っぱ・布は <code>side: THREE.DoubleSide</code> で裏からも見えるようにする。'),
      T('マットキャップ', 'MatCap', '「光が当たった球」の画像1枚で質感を表すマテリアル。ライト不要で軽く、粘土・金属風の表現に。'),
    ]),
  ]});

/* ================= 3. 光と影 ================= */
const LIGHTS = [
  ['環境光', 'AmbientLight', '全体を同じ明るさで照らす。影も立体感も出ない。暗すぎる部分を持ち上げるだけ。'],
  ['半球光', 'HemisphereLight', '空の色と地面の色で、上と下から照らす。屋外の自然な明るさ。影は出ない。'],
  ['平行光源', 'DirectionalLight', '<b>太陽の光</b>。同じ向きの平行な光で、どこでも同じ明るさ。影を落とせる。メインの光に。'],
  ['点光源', 'PointLight', '<b>電球</b>。1点から全方向へ。距離で弱まる。影も出せるが重い（6方向分）。'],
  ['スポットライト', 'SpotLight', '<b>舞台照明</b>。円すい状に照らす。角度・ぼかしを指定できる。影を落とせる。'],
];
const TONES = [['なし', 'NoToneMapping'], ['Linear', 'LinearToneMapping'], ['Reinhard', 'ReinhardToneMapping'], ['ACES', 'ACESFilmicToneMapping'], ['AgX', 'AgXToneMapping'], ['Neutral', 'NeutralToneMapping']];

TABS.push({ id:'light', label:'光と影', icon:'💡',
  intro:'3Dの見栄えは<b>光</b>で8割決まります。太陽のような平行光源、電球のような点光源などの<b>ライトの種類</b>、<b>影</b>の仕組みと失敗例、写真のような<b>3点照明</b>、明るさを整える<b>トーンマッピング</b>、奥行きを出す<b>霧</b>を体験しましょう。',
  sections:[
    C('触って理解する', [
      { name:'ライトの種類', en:'Light types', h:420, tags:['基本','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="t3-cv kt-grow"><span class="tag tg"></span></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let k = 2, apply = () => {};
          $(el, '.sw').replaceWith(seg(LIGHTS.map(l => l[0]), i => { k = i; apply(); }, 2).el);
          return view3(el, S => { const { T:T3, scene } = S; S.scene.environment = null; floor3(S); const amb = new T3.AmbientLight(0xffffff, .08); scene.add(amb);
            [[-1.1, 0x7c3aed, 'box'], [0, 0xf59e0b, 'sph'], [1.1, 0x0ea5e9, 'cyl']].forEach(([x, c, t]) => { const g = t === 'box' ? new T3.BoxGeometry(.8, .8, .8) : t === 'sph' ? new T3.SphereGeometry(.5, 40, 24) : new T3.CylinderGeometry(.4, .4, 1, 32); const m = new T3.Mesh(g, new T3.MeshStandardMaterial({ color:c, roughness:.4 })); m.position.set(x, .5, 0); m.castShadow = m.receiveShadow = true; scene.add(m); });
            const L = [new T3.AmbientLight(0xffffff, 1.4), new T3.HemisphereLight(0xbfe3ff, 0x8d6e4b, 2), new T3.DirectionalLight(0xffffff, 3), new T3.PointLight(0xffd8a8, 18, 9, 1.6), new T3.SpotLight(0xffffff, 40, 12, Math.PI / 7, .35, 1.4)];
            L.forEach((l, i) => { if (l.castShadow !== undefined && i > 1){ l.castShadow = true; l.shadow.mapSize.set(1024, 1024); l.shadow.bias = -.0008; } scene.add(l); }); L[2].position.set(3, 5, 2); L[4].position.set(-2.5, 4, 2); scene.add(L[4].target);
            const H = [null, new T3.HemisphereLightHelper(L[1], .5), new T3.DirectionalLightHelper(L[2], .6), new T3.PointLightHelper(L[3], .15), new T3.SpotLightHelper(L[4])]; H.forEach(h => h && scene.add(h));
            apply = () => { L.forEach((l, i) => { l.visible = i === k; if (H[i]) H[i].visible = i === k; }); $(el, '.tg').textContent = 'new THREE.' + LIGHTS[k][1] + '()'; verdict($(el, '.res'), '', LIGHTS[k][2]); };
            apply(); S.frame = (dt, t) => { L[3].position.set(Math.sin(t) * 1.8, 1.3 + Math.sin(t * 2) * .3, Math.cos(t) * 1.8); L[4].target.position.set(Math.sin(t * .8) * 1.2, 0, 0); H[4].update(); H[2].update(); }; }, { cam:[3.2, 3.2, 4.6], target:[0, .4, 0] }); },
        desc:'ライトは主に5種類。<b>平行光源（太陽）</b>をメインに、<b>半球光</b>か<b>環境光</b>で暗い部分を持ち上げるのが基本の組み合わせです。点光源とスポットライトは距離で弱まるので、部屋の電球や舞台の演出に向いています。',
        prompt:'three.js の夜の部屋のシーンで、デスクライト（SpotLight）と天井の電球（PointLight）を置いて。暗すぎないよう HemisphereLight を弱めに足し、影はデスクライトだけに付けて軽くして。' },
      { name:'影の仕組みと失敗例', en:'Shadow maps / acne', h:460, tags:['影','体験','よくある失敗'],
        demo:'<div class="kt"><span class="sw"></span><div class="t3-cv kt-grow"></div><div class="sl"></div><div class="t3-checks ck"></div></div>',
        init:(el) => { let res = 1, apply = () => {};
          $(el, '.sw').replaceWith(seg(['解像度 128', '512', '2048'], i => { res = i; apply(); }, 1).el);
          const st = sliders($(el, '.sl'), [['bias', 'かたより（bias）', -.004, .002, .0002, -.0006, v => (+v).toFixed(4)], ['rad', 'ぼかし（radius）', 0, 8, .5, 2]], () => apply()), ck = checks($(el, '.ck'), [['cam', '影のカメラの範囲を表示', false]], () => apply());
          return view3(el, S => { const { T:T3, scene } = S; const L = lights3(S, { sun:2.8 }); L.sun.position.set(3, 5, 1.5); L.sun.shadow.normalBias = 0; floor3(S);
            const k = new T3.Mesh(new T3.TorusKnotGeometry(.55, .2, 140, 20), new T3.MeshStandardMaterial({ color:0xe11d48, roughness:.5 })); k.position.y = 1.2; k.castShadow = k.receiveShadow = true; const b = new T3.Mesh(new T3.BoxGeometry(.8, .8, .8), new T3.MeshStandardMaterial({ color:0xe5e7eb })); b.position.set(1.3, .4, .5); b.castShadow = b.receiveShadow = true; scene.add(k, b);
            const help = new T3.CameraHelper(L.sun.shadow.camera); scene.add(help);
            apply = () => { const sz = [128, 512, 2048][res]; if (L.sun.shadow.mapSize.x !== sz){ L.sun.shadow.mapSize.set(sz, sz); if (L.sun.shadow.map){ L.sun.shadow.map.dispose(); L.sun.shadow.map = null; } } L.sun.shadow.bias = st.bias; L.sun.shadow.radius = st.rad; help.visible = ck.cam; };
            apply(); S.frame = (dt) => { k.rotation.y += dt * .5; help.update(); }; }, { cam:[3.4, 3, 4], target:[0, .6, 0] }); },
        desc:'影は「ライトから見た景色」を画像（<b>シャドウマップ</b>）にして作ります。解像度が低いと<b>ギザギザ</b>、かたより（bias）が0付近だと<b>縞模様（シャドウアクネ）</b>、大きすぎると影が浮きます。影のカメラの範囲は<b>必要な広さだけ</b>にすると、同じ解像度でもくっきりします。',
        prompt:'three.js の影がギザギザで、物体に縞模様も出ています。DirectionalLight の shadow.camera の範囲をシーンに合わせて狭め、mapSize・bias・normalBias を調整して直して。CameraHelper で範囲を確認できるようにして。' },
      { name:'3点照明', en:'Three-point lighting', h:430, tags:['ライティング','体験'],
        demo:'<div class="kt"><div class="t3-cv kt-grow"></div><div class="t3-checks ck"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let apply = () => {};
          const ck = checks($(el, '.ck'), [['key', 'キーライト（主光）', true], ['fill', 'フィルライト（補助）', true], ['rim', 'リムライト（輪郭）', true]], () => apply());
          return view3(el, S => { const { T:T3, scene } = S; scene.environment = null; S.bg = S.dark ? 0x111114 : 0x26262c; const M = (c) => new T3.MeshStandardMaterial({ color:c, roughness:.55 });
            const head = new T3.Mesh(new T3.SphereGeometry(.8, 48, 32), M(0xf2c9a0)); head.position.y = 1.4; const body = new T3.Mesh(new T3.CapsuleGeometry(.55, .7, 8, 24), M(0x3b82f6)); body.position.y = .2; const e1 = new T3.Mesh(new T3.SphereGeometry(.09, 16, 12), M(0x111111)), e2 = e1.clone(); e1.position.set(-.27, 1.5, .72); e2.position.set(.27, 1.5, .72); const nose = new T3.Mesh(new T3.ConeGeometry(.08, .25, 12), M(0xe8a87c)); nose.rotation.x = Math.PI / 2; nose.position.set(0, 1.35, .85);
            const man = new T3.Group(); man.add(head, body, e1, e2, nose); scene.add(man, new T3.AmbientLight(0xffffff, .04));
            const key = new T3.DirectionalLight(0xffe2c4, 3.2); key.position.set(-3, 3, 3); const fill = new T3.DirectionalLight(0xbcd7ff, .9); fill.position.set(3, 1, 2.5); const rim = new T3.DirectionalLight(0xffffff, 5); rim.position.set(1.5, 3, -4); scene.add(key, fill, rim);
            apply = () => { key.visible = ck.key; fill.visible = ck.fill; rim.visible = ck.rim; verdict($(el, '.res'), '', !ck.key ? 'キーライトがないと<b>主役の顔が暗く</b>、何を見せたいか分かりません。' : !ck.fill ? 'フィルなし：影側が真っ黒で<b>コントラストが強すぎ</b>。ドラマチックにしたい時はあえて弱める。' : !ck.rim ? 'リムなし：<b>背景に溶け込んで</b>輪郭がぼやけます。' : '3つそろうと、<b>立体感がありつつ見やすい</b>。商品写真・人物撮影の基本です。'); };
            apply(); S.frame = (dt, t) => { man.rotation.y = Math.sin(t * .5) * .6; }; }, { cam:[0, 1.2, 5], target:[0, .9, 0], fov:34 }); },
        desc:'写真や映像の基本の照明。<b>キーライト</b>（主役を照らす一番強い光）、<b>フィルライト</b>（影を少し明るくする弱い光）、<b>リムライト</b>（後ろから輪郭を光らせる）の3つです。3Dの商品紹介やキャラクター表示でも、この考え方でライトを置くと一気にそれらしくなります。',
        prompt:'three.js の商品ビューアに、3点照明（キー・フィル・リム）を設定して。キーは暖かい色で左上前方、フィルは青みのある弱い光で右、リムは後ろ上から強めに。背景は暗めのグラデーションにして。' },
      { name:'トーンマッピングと露出', en:'Tone mapping & exposure', h:440, tags:['色','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="t3-cv kt-grow"></div><div class="sl"></div></div>',
        init:(el) => { let k = 3, apply = () => {};
          $(el, '.sw').replaceWith(seg(TONES.map(t => t[0]), i => { k = i; apply(); }, 3).el);
          const st = sliders($(el, '.sl'), [['ex', '露出（exposure）', .2, 3, .05, 1]], () => apply());
          return view3(el, S => { const { T:T3, scene } = S; lights3(S, { sun:4 }); floor3(S); const pl = new T3.PointLight(0xff6a00, 30, 6); pl.position.set(0, 1.4, 1.2); scene.add(pl);
            ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7'].forEach((c, i) => { const m = new T3.Mesh(new T3.SphereGeometry(.42, 40, 24), new T3.MeshStandardMaterial({ color:c, roughness:.25 })); m.position.set((i - 2) * 1, .42, 0); m.castShadow = true; scene.add(m); });
            const lamp = new T3.Mesh(new T3.SphereGeometry(.12, 16, 12), new T3.MeshBasicMaterial({ color:0xffd2a6 })); lamp.position.copy(pl.position); scene.add(lamp);
            apply = () => { S.tone = T3[TONES[k][1]]; S.exposure = st.ex; }; apply(); }, { cam:[0, 2.4, 5.4], target:[0, .4, 0] }); },
        desc:'現実の光は画面で表せる明るさより何倍も強いので、<b>明るすぎる部分をなめらかに丸める</b>のがトーンマッピングです。「なし」だと強い光が<b>白く飛んで</b>色が失われます。ACES は映画風のコントラスト、AgX と Neutral は色が自然。<b>露出</b>は全体の明るさ（カメラの絞り）です。',
        prompt:'three.js のシーンの色が白っぽく飛んでいます。renderer.toneMapping を AgXToneMapping か NeutralToneMapping にして、toneMappingExposure で明るさを調整し、テクスチャの colorSpace も確認して直して。' },
      { name:'霧で奥行きを出す', en:'Fog', h:400, tags:['演出','体験'],
        demo:'<div class="kt"><div class="t3-cv kt-grow"></div><div class="sl"></div></div>',
        init:(el) => { let apply = () => {};
          const st = sliders($(el, '.sl'), [['d', '霧の濃さ（density）', 0, .2, .005, .07]], () => apply());
          return view3(el, S => { const { T:T3, scene } = S; lights3(S); const fc = new T3.Color(cssv(el, '--stage') || '#ecebe5'); S.bg = fc.getHex(); scene.fog = new T3.FogExp2(fc, .07); floor3(S, 80);
            const M = new T3.MeshStandardMaterial({ color:0x2e7d32, flatShading:true }), M2 = new T3.MeshStandardMaterial({ color:0x6d4c41 });
            for (let i = 0; i < 70; i++){ const x = (Math.random() - .5) * 16, z = -Math.random() * 40 + 3; if (Math.abs(x) < 1) continue; const s = .7 + Math.random() * .8, tr = new T3.Mesh(new T3.ConeGeometry(.5 * s, 1.6 * s, 7), M); tr.position.set(x, .8 * s + .3, z); const st2 = new T3.Mesh(new T3.CylinderGeometry(.08, .1, .4), M2); st2.position.set(x, .2, z); scene.add(tr, st2); }
            apply = () => { scene.fog.density = st.d; }; apply(); S.frame = (dt, t) => { S.cam.position.set(Math.sin(t * .3) * .6, 1.4, 4 - (t * 1.2 % 20)); S.cam.lookAt(S.cam.position.x * .5, 1, S.cam.position.z - 6); }; }, { orbit:false, fov:55 }); },
        desc:'<b>霧（フォグ）</b>は遠くの物ほど背景の色に溶けていく効果。奥行きが出て、空気感のある絵になります。さらに<b>遠くを描かなくて済む</b>ので、広い景色の負荷を下げる工夫にもなります。背景色と霧の色をそろえるのがコツです。',
        prompt:'three.js の森を歩くシーンで、FogExp2 で霧を出して。背景色と霧の色をそろえ、カメラの far を霧で見えなくなる距離まで縮めて軽くして。' },
    ], null, true),
    { title:'ライトの比較', note:'ライトは数が増えるほど重くなります。特に<b>影を落とすライトは1〜2個まで</b>が目安。動かない物の影は、事前に画像に焼き込む（ベイク）のが軽くてきれいです。',
      table:{ head:['ライト', '光の当たり方', '影', 'たとえ'], rows:[['AmbientLight', '全体を均一に', '×', '曇りの日の部屋'], ['HemisphereLight', '空の色と地面の色', '×', '屋外の空と照り返し'], ['DirectionalLight', '同じ向きの平行光', '○（軽め）', '太陽'], ['PointLight', '1点から全方向、距離で弱まる', '○（重い）', '電球・ろうそく'], ['SpotLight', '円すい状、距離で弱まる', '○', '舞台照明・懐中電灯'], ['RectAreaLight', '四角い面から', '×', '窓・蛍光灯・撮影用ソフトボックス'], ['環境マップ（IBL）', '周りの景色から全方向', '×', '写真スタジオ全体の光']] } },
    S('光と影の用語', [
      T('影を落とす／受ける', 'castShadow / receiveShadow', 'three.js では <code>renderer.shadowMap.enabled</code>、ライトの <code>castShadow</code>、物体の <code>castShadow</code>（落とす）と <code>receiveShadow</code>（受ける）を<b>全部</b>オンにして初めて影が出る。', null, ['よくある失敗']),
      T('シャドウマップ', 'Shadow map', 'ライトから見た奥行きの画像。解像度（mapSize）が影のくっきり度を決める。'),
      T('シャドウアクネ', 'Shadow acne', '物体の表面に出る縞模様。<code>shadow.bias</code> を少しマイナスに、<code>normalBias</code> を少しプラスにして直す。'),
      T('ピーターパン現象', 'Peter-panning', 'bias を大きくしすぎて影が物体から離れ、浮いて見える状態。'),
      T('影のカメラの範囲', 'Shadow camera frustum', '平行光源の影は、決めた範囲の中だけに出る。広すぎるとぼやけ、狭すぎると影が切れる。'),
      T('ソフトシャドウ', 'Soft shadows', 'ふちがぼけた柔らかい影。PCF・VSM などの方式や、接地影（ContactShadows）で表現。'),
      T('ベイク（焼き込み）', 'Baking', '光と影を事前に計算して画像にしておくこと。動かない部屋・背景に。Blender で作るのが定番で、実行時はとても軽い。', null, ['定番']),
      T('ライトマップ', 'Lightmap', 'ベイクした光の画像。<code>lightMap</code> として貼る。'),
      T('IBL（画像ベースの照明）', 'Image-based lighting', '環境マップの画像から光を計算する。PBRと組み合わせると自然な見た目になる。'),
      T('トーンマッピング', 'Tone mapping', '強すぎる光を画面で表せる範囲に丸める。ACES・AgX・Neutral など。'),
      T('露出', 'Exposure', '全体の明るさの倍率。<code>renderer.toneMappingExposure</code>。'),
      T('ブルーム', 'Bloom', '明るい部分の光がにじむ後処理。ネオン・発光の表現に。かけすぎると眠い画面に。'),
      T('フォグ（霧）', 'Fog', '遠くの物を背景色に溶かす。<code>Fog</code>（距離で線形）と <code>FogExp2</code>（指数的）がある。'),
      T('ライトの強さの単位', 'Physical light units', 'three.js の新しい版は現実に近い単位（カンデラ等）。古い記事の数値をそのまま使うと暗すぎることがある。', null, ['注意']),
      T('ライトの数と重さ', 'Light count & cost', 'ライトが1つ増えるごとに、画素ごとの計算が増える。点光源の影は6方向分描くので特に重い。'),
    ]),
  ]});

/* ================= 4. 動きと操作 ================= */
const CAMS = [['正面', [0, 1.2, 6], [0, .6, 0]], ['真上', [0, 7.5, .01], [0, 0, 0]], ['横', [6, 1, 0], [0, .6, 0]], ['近く', [-1.2, 1.1, 1.9], [-.5, .7, 0]]];
const EASE = [['瞬間', '一瞬で移動。場面の切り替えに。'], ['線形', '一定の速さ。機械的で、始まりと終わりがカクッとする。'], ['イージング', '<b>ゆっくり始まり、ゆっくり止まる</b>（easeInOutCubic）。カメラ移動の定番。GSAPなどで指定。'], ['lerp', '毎フレーム「残りの距離の一定割合」だけ近づく。<b>目標が動いても自然に追いかける</b>。マウス追従に。']];

TABS.push({ id:'interact', label:'動きと操作', icon:'🖱',
  intro:'3Dは<b>動かして、触れて</b>こそ楽しくなります。カメラをドラッグで回す操作、マウスで物体を選ぶ<b>レイキャスト</b>、端末の速さに左右されない<b>時間ベースのアニメーション</b>、なめらかな移動、大量の粒（パーティクル）、簡単な物理、スクロール連動を体験しましょう。',
  sections:[
    C('触って理解する', [
      { name:'カメラを回す（OrbitControls）', en:'Orbit controls', h:440, tags:['操作','体験','定番'],
        demo:'<div class="kt"><div class="t3-cv kt-grow"><span class="tip">ドラッグ：回転　ホイール：拡大</span></div><div class="t3-checks ck"></div><div class="kt-code cd"></div></div>',
        init:(el) => { let apply = () => {};
          const ck = checks($(el, '.ck'), [['auto', '自動で回る', true], ['damp', '慣性（なめらかに止まる）', true], ['lim', '地面の下に行かない', true], ['pan', '平行移動（右ドラッグ）', false]], () => apply());
          return view3(el, S => { lights3(S); island(S); const c = S.controls; let n = 0;
            apply = () => { c.autoRotate = ck.auto; c.autoRotateSpeed = 1.2; c.enableDamping = ck.damp; c.maxPolarAngle = ck.lim ? Math.PI / 2.1 : Math.PI; c.enablePan = ck.pan; };
            apply(); S.frame = () => { if (n++ % 10) return; $(el, '.cd').innerHTML = `距離 <b>${c.getDistance().toFixed(2)}</b>　水平角 <b>${Math.round(c.getAzimuthalAngle() * 180 / Math.PI)}°</b>　上下角 <b>${Math.round(c.getPolarAngle() * 180 / Math.PI)}°</b>`; }; }, { cam:[5, 3.5, 6], zoom:true, minD:3, maxD:16 }); },
        desc:'3Dを「ぐるっと回して見る」操作は、three.js の <b>OrbitControls</b> を付けるだけで作れます。<b>慣性</b>を付けるとなめらかに止まり、<b>角度や距離の制限</b>で地面の下や遠くへ行きすぎるのを防げます。スマホの指操作にも対応しています。',
        prompt:'three.js の商品ビューアに OrbitControls を付けて。慣性あり、ズームは 2〜8 の範囲、地面の下には回り込めないように、パンは無効。操作していない間はゆっくり自動回転し、触ったら止まるようにして。',
        code:'import { OrbitControls } from "three/addons/controls/OrbitControls.js";\n\nconst controls = new OrbitControls(camera, renderer.domElement);\ncontrols.enableDamping = true;          // 慣性\ncontrols.minDistance = 2;               // 近づける限界\ncontrols.maxDistance = 8;\ncontrols.maxPolarAngle = Math.PI / 2.1; // 地面の下に行かない\ncontrols.enablePan = false;\ncontrols.autoRotate = true;\ncontrols.addEventListener("start", () => (controls.autoRotate = false));\n\nrenderer.setAnimationLoop(() => {\n  controls.update();                    // 慣性・自動回転に必要\n  renderer.render(scene, camera);\n});' },
      { name:'クリックで物体を選ぶ（レイキャスト）', en:'Raycasting', h:440, tags:['操作','体験','定番'],
        demo:'<div class="kt"><div class="t3-cv kt-grow"><span class="tip">マウスを乗せる・クリック</span></div><div class="kt-code cd">物体にマウスを乗せてください。</div></div>',
        init:(el) => view3(el, S => { const { T:T3, scene, cv } = S; lights3(S); floor3(S); const objs = [], G3 = [new T3.BoxGeometry(.7, .7, .7), new T3.SphereGeometry(.42, 32, 20), new T3.ConeGeometry(.42, .8, 24), new T3.TorusGeometry(.32, .14, 16, 40), new T3.OctahedronGeometry(.45), new T3.CylinderGeometry(.35, .35, .7, 24)], NAMES = ['箱', '球', '円すい', 'ドーナツ', '八面体', '円柱'];
          for (let i = 0; i < 9; i++){ const m = new T3.Mesh(G3[i % 6].clone(), new T3.MeshStandardMaterial({ color:new T3.Color().setHSL(i / 9, .6, .55), roughness:.4 })); m.position.set((i % 3 - 1) * 1.5, .45, (Math.floor(i / 3) - 1) * 1.5); m.castShadow = true; m.name = NAMES[i % 6] + (i + 1); m.userData = { vy:0, y0:.45 }; scene.add(m); objs.push(m); }
          G3.forEach(g => g.dispose());
          const ray = new T3.Raycaster(), ndc = new T3.Vector2(); let hov = null;
          const pick = (e) => { const r = cv.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, S.cam); return [ray.intersectObjects(objs)[0], ndc.clone()]; };
          const onMove = (e) => { const [hit, n] = pick(e); if (hov && hov !== (hit && hit.object)) hov.material.emissive.set(0); hov = hit ? hit.object : null; cv.style.cursor = hov ? 'pointer' : ''; if (hov) hov.material.emissive.set(0x333333);
            $(el, '.cd').innerHTML = `画面の座標 → <b>(${n.x.toFixed(2)}, ${n.y.toFixed(2)})</b>（-1〜1 に変換）\n` + (hit ? `当たった物：<b>${hit.object.name}</b>　距離：<b>${hit.distance.toFixed(2)}</b>\n当たった位置：(${hit.point.x.toFixed(2)}, ${hit.point.y.toFixed(2)}, ${hit.point.z.toFixed(2)})` : '当たった物：なし'); };
          cv.addEventListener('pointermove', onMove); cv.addEventListener('click', (e) => { const [hit] = pick(e); if (hit && hit.object.position.y <= hit.object.userData.y0 + .01) hit.object.userData.vy = 4.5; });
          S.frame = (dt) => objs.forEach(o => { const u = o.userData; if (u.vy || o.position.y > u.y0){ u.vy -= 14 * dt; o.position.y += u.vy * dt; o.rotation.y += dt * 6; if (o.position.y < u.y0){ o.position.y = u.y0; u.vy = 0; } } }); }, { cam:[0, 4.6, 5.2] }),
        desc:'3Dの物体をクリックで選ぶには、カメラからマウスの方向へ<b>見えない光線（レイ）</b>を飛ばし、最初に当たった物を調べます。これが<b>レイキャスト</b>。マウスの位置は画面の端から端を <b>-1〜1</b> に直してから使います。ホバーの強調・クリックで動く・物を置く場所の決定などに使います。',
        prompt:'three.js のシーンで、マウスを乗せた物体を光らせ、クリックしたらその物体の情報をパネルに表示して。Raycaster を使い、ポインターの座標は canvas の位置を考慮して -1〜1 に変換して。',
        code:'const raycaster = new THREE.Raycaster();\nconst pointer = new THREE.Vector2();\n\nrenderer.domElement.addEventListener("click", (e) => {\n  const rect = renderer.domElement.getBoundingClientRect();\n  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;   // -1〜1\n  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;  // 上が+1\n  raycaster.setFromCamera(pointer, camera);\n  const hit = raycaster.intersectObjects(clickableObjects)[0];\n  if (hit) showInfo(hit.object.name, hit.point);\n});' },
      { name:'時間で動かす（deltaTime）', en:'Frame-rate independent animation', h:400, tags:['アニメ','体験','よくある失敗'],
        demo:'<div class="kt"><span class="sw"></span><div class="t3-cv kt-grow"><span class="tag" style="left:8px">左：フレームごとに +0.03</span><span class="tag" style="top:32px">右：経過時間 × 速さ</span></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let fps = 60;
          $(el, '.sw').replaceWith(seg(['60fps（普通の端末）', '30fps（重い端末）', '15fps（とても重い）'], i => { fps = [60, 30, 15][i]; }).el);
          return view3(el, S => { const { T:T3, scene } = S; lights3(S); floor3(S); const mk = (x, c) => { const m = new T3.Mesh(new T3.BoxGeometry(1, 1, 1), new T3.MeshStandardMaterial({ color:c })); m.position.set(x, .9, 0); m.castShadow = true; scene.add(m); return m; }; const a = mk(-1.2, 0xe11d48), b = mk(1.2, 0x10b981); let acc = 0, ra = 0, rb = 0, tt = 0, n = 0;
            S.frame = (dt) => { acc += dt; tt += dt; if (acc < 1 / fps - .002) return; a.rotation.y += .03; b.rotation.y += 1.8 * acc; ra += .03; rb += 1.8 * acc; acc = 0;
              if (tt > .5){ verdict($(el, '.res'), fps < 60 ? 'warn' : 'ok', `1秒あたりの回転：左 <b>${(ra / tt).toFixed(2)}</b>　右 <b>${(rb / tt).toFixed(2)}</b>（目標 1.80）<br>` + (fps < 60 ? '❌ 左は<b>端末が重いと遅くなります</b>。右は描く回数が減ってもカクつくだけで、速さは同じ。' : 'どちらも同じ速さ。でも、端末を重くすると…？')); ra = rb = tt = 0; } }; }, { cam:[0, 2.6, 4.6], target:[0, .7, 0], orbit:false }); },
        desc:'「毎フレーム少しずつ動かす」と書くと、<b>重い端末や60Hz以外の画面で速さが変わって</b>しまいます。前のフレームからの<b>経過時間（deltaTime）</b>を掛けて動かせば、どの端末でも同じ速さ。120Hzの画面では倍速になる、というバグもこれで防げます。',
        prompt:'このthree.jsのアニメーションが、120Hzの画面で速く、重いスマホで遅くなります。THREE.Timer（または Clock）で経過時間を取り、すべての動きを「速さ × 経過時間」で計算するように直して。',
        code:'const timer = new THREE.Timer();\nrenderer.setAnimationLoop((time) => {\n  timer.update(time);\n  const dt = timer.getDelta();   // 前のフレームからの秒数\n  cube.rotation.y += 1.8 * dt;   // 1秒に1.8ラジアン（端末に関係なく同じ）\n  renderer.render(scene, camera);\n});' },
      { name:'なめらかに近づける（lerp・イージング）', en:'Lerp & easing', h:430, tags:['アニメ','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="t3-cv kt-grow"></div><div class="kt-row bt"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { let mode = 2, go = () => {};
          $(el, '.sw').replaceWith(seg(EASE.map(e => e[0]), i => { mode = i; verdict($(el, '.res'), '', EASE[i][1]); }, 2).el);
          $(el, '.bt').innerHTML = CAMS.map((c, i) => `<button type="button" class="kt-btn sm" data-i="${i}">${c[0]}</button>`).join('');
          $$(el, '.bt button').forEach(b => b.onclick = () => go(+b.dataset.i));
          return view3(el, S => { const { T:T3 } = S; lights3(S); island(S); const from = new T3.Vector3(), to = new T3.Vector3(), lf = new T3.Vector3(), lt = new T3.Vector3(), look = new T3.Vector3(0, .6, 0); let t = 1;
            S.cam.position.set(...CAMS[0][1]); S.cam.lookAt(look);
            go = (i) => { from.copy(S.cam.position); lf.copy(look); to.set(...CAMS[i][1]); lt.set(...CAMS[i][2]); t = 0; if (mode === 0){ S.cam.position.copy(to); look.copy(lt); t = 1; } };
            const ease = (x) => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
            S.frame = (dt) => { if (mode === 3){ const k = 1 - Math.pow(.02, dt); S.cam.position.lerp(to.lengthSq() ? to : S.cam.position, k); look.lerp(lt.lengthSq() ? lt : look, k); }
              else if (t < 1){ t = Math.min(1, t + dt / 1.2); const e = mode === 1 ? t : ease(t); S.cam.position.lerpVectors(from, to, e); look.lerpVectors(lf, lt, e); }
              S.cam.lookAt(look); }; }, { orbit:false }); },
        desc:'カメラや物体を目標の位置へ動かすとき、<b>どう加速・減速するか</b>で印象が大きく変わります。始めと終わりをゆっくりにする<b>イージング</b>、毎フレーム残りの一定割合だけ近づく<b>lerp</b>（線形補間）が定番。ボタンを押して比べてみましょう。',
        prompt:'three.js の商品ページで、「正面」「背面」「細部」のボタンを押すとカメラがその位置へなめらかに移動するようにして。GSAP で position と OrbitControls の target を1.2秒・power2.inOut で同時に動かして。' },
      { name:'パーティクル（大量の点）', en:'Particles (Points)', h:430, tags:['演出','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="t3-cv kt-grow"><span class="tag fps"></span></div><div class="sl"></div></div>',
        init:(el) => { let shape = 0, apply = () => {};
          $(el, '.sw').replaceWith(seg(['銀河', '球', '波'], i => { shape = i; apply(); }).el);
          const st = sliders($(el, '.sl'), [['n', '粒の数', 1000, 60000, 1000, 12000, v => (+v).toLocaleString()]], () => apply());
          return view3(el, S => { const { T:T3, scene } = S; S.bg = 0x07070c; let pts = null, base = null, avg = 1 / 60;
            apply = () => { if (pts){ scene.remove(pts); pts.geometry.dispose(); pts.material.dispose(); } const n = st.n, p = new Float32Array(n * 3), c = new Float32Array(n * 3), col = new T3.Color();
              for (let i = 0; i < n; i++){ let x, y, z; if (shape === 0){ const arm = i % 3, r = Math.pow(Math.random(), 1.6) * 3.2, a = arm * 2.094 + r * 1.4 + (Math.random() - .5) * .5; x = Math.cos(a) * r; z = Math.sin(a) * r; y = (Math.random() - .5) * .25 * (3.3 - r); col.setHSL(.62 - r * .09, .8, .55 + (3.2 - r) * .1); }
                else if (shape === 1){ const u = Math.random() * 2 - 1, th = Math.random() * 6.283, r = 2.2 * Math.cbrt(Math.random()) * .2 + 1.9; x = Math.sqrt(1 - u * u) * Math.cos(th) * r; y = u * r; z = Math.sqrt(1 - u * u) * Math.sin(th) * r; col.setHSL(.5 + u * .15, .8, .6); }
                else { const s = Math.ceil(Math.sqrt(n)); x = (i % s / s - .5) * 7; z = (Math.floor(i / s) / s - .5) * 7; y = 0; col.setHSL(.75 + x * .03, .8, .6); }
                p.set([x, y, z], i * 3); c.set([col.r, col.g, col.b], i * 3); }
              base = p.slice(); const g = new T3.BufferGeometry(); g.setAttribute('position', new T3.BufferAttribute(p, 3)); g.setAttribute('color', new T3.BufferAttribute(c, 3));
              pts = new T3.Points(g, new T3.PointsMaterial({ size:shape === 2 ? .045 : .035, vertexColors:true, transparent:true, opacity:.9, blending:T3.AdditiveBlending, depthWrite:false })); scene.add(pts); };
            apply(); S.frame = (dt, t) => { avg += (dt - avg) * .05; $(el, '.fps').textContent = `${Math.round(1 / avg)} fps`; pts.rotation.y += dt * (shape === 2 ? .05 : .12);
              if (shape === 2){ const a = pts.geometry.attributes.position.array; for (let i = 0; i < a.length; i += 3){ const x = base[i], z = base[i + 2]; a[i + 1] = Math.sin(x * 1.6 + t * 2) * .3 + Math.cos(z * 1.3 + t * 1.5) * .3; } pts.geometry.attributes.position.needsUpdate = true; } }; }, { cam:[0, 3.2, 5.6] }); },
        desc:'星・雪・火花・煙のような<b>大量の粒</b>は、1つずつ物体を作ると重すぎるので、<b>Points</b>（点の集まり）で1回の命令でまとめて描きます。数万個でも軽く動きます。もっと複雑な動きは、位置の計算をシェーダー（GPU）に任せると10万個以上も可能です。',
        prompt:'three.js で、マウスの位置に向かって集まり、離すと散らばるパーティクルを2万個作って。Points と BufferGeometry を使い、色は位置で虹色に、加算合成で光って見えるようにして。' },
      { name:'かんたんな物理（落下と跳ね返り）', en:'Simple physics', h:430, tags:['物理','体験'],
        demo:'<div class="kt"><div class="t3-cv kt-grow"><span class="tag ct"></span></div><div class="sl"></div><div class="kt-row"><button type="button" class="kt-btn pri add">ボールを落とす</button><button type="button" class="kt-btn sm rs">リセット</button></div></div>',
        init:(el) => { let add = () => {}, reset = () => {};
          const st = sliders($(el, '.sl'), [['e', '跳ね返り（反発係数）', 0, .95, .05, .7], ['g', '重力', 1, 20, .5, 9.8]]);
          $(el, '.add').onclick = () => add(); $(el, '.rs').onclick = () => reset();
          return view3(el, S => { const { T:T3, scene } = S; lights3(S); floor3(S); const W = 2.4, R = .25, geo = new T3.SphereGeometry(R, 24, 16), balls = [];
            const wallM = new T3.MeshStandardMaterial({ color:0x94a3b8, transparent:true, opacity:.25 }); [[0, -W - .05, W * 2, .1], [0, W + .05, W * 2, .1]].forEach(([x, z, w, d]) => { const m = new T3.Mesh(new T3.BoxGeometry(w + .2, .5, d), wallM); m.position.set(x, .25, z); scene.add(m); const m2 = m.clone(); m2.rotation.y = Math.PI / 2; m2.position.set(z, .25, x); scene.add(m2); });
            add = () => { for (let i = 0; i < 5 && balls.length < 60; i++){ const m = new T3.Mesh(geo, new T3.MeshStandardMaterial({ color:new T3.Color().setHSL(Math.random(), .7, .55), roughness:.3 })); m.castShadow = true; m.position.set((Math.random() - .5) * 3, 3 + Math.random() * 2, (Math.random() - .5) * 3); m.userData.v = new T3.Vector3((Math.random() - .5) * 2, 0, (Math.random() - .5) * 2); scene.add(m); balls.push(m); } };
            reset = () => { balls.splice(0).forEach(b => { scene.remove(b); b.material.dispose(); }); add(); };
            const d = new T3.Vector3(); add();
            S.frame = (dt) => { const steps = 3, h = dt / steps; for (let s = 0; s < steps; s++){ balls.forEach(b => { const v = b.userData.v, p = b.position; v.y -= st.g * h; p.addScaledVector(v, h); if (p.y < R){ p.y = R; v.y = -v.y * st.e; v.x *= .995; v.z *= .995; } ['x', 'z'].forEach(k => { if (p[k] > W - R){ p[k] = W - R; v[k] = -Math.abs(v[k]) * st.e; } if (p[k] < -W + R){ p[k] = -W + R; v[k] = Math.abs(v[k]) * st.e; } }); });
                for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++){ const a = balls[i], b = balls[j]; d.subVectors(b.position, a.position); const L = d.length(); if (L > 0 && L < R * 2){ d.divideScalar(L); const push = (R * 2 - L) / 2; a.position.addScaledVector(d, -push); b.position.addScaledVector(d, push); const va = a.userData.v, vb = b.userData.v, rel = vb.clone().sub(va).dot(d); if (rel < 0){ const imp = -(1 + st.e) * rel / 2; va.addScaledVector(d, -imp); vb.addScaledVector(d, imp); } } } }
              balls.forEach(b => { b.rotation.x += b.userData.v.z * dt * 3; b.rotation.z -= b.userData.v.x * dt * 3; }); $(el, '.ct').textContent = `ボール ${balls.length} 個（最大60）`; };
            S.offs.push(() => geo.dispose()); }, { cam:[0, 5, 6.4], target:[0, .5, 0] }); },
        desc:'物理は「<b>速さに重力を足す → 位置に速さを足す → ぶつかったら跳ね返す</b>」のくり返しです。このデモは自作の簡単な計算ですが、積み重なった箱・関節・車などの本格的な物理は <b>Rapier</b> や <b>cannon-es</b> などの物理エンジンを使います。',
        prompt:'three.js と Rapier（@dimforge/rapier3d-compat）で、クリックした場所に箱が落ちてきて積み重なる物理のデモを作って。物理の世界と three.js の見た目を毎フレーム同期させ、画面外に落ちた箱は削除して。' },
      { name:'スクロールで動かす', en:'Scroll-driven 3D', h:420, tags:['演出','体験','LP'],
        demo:'<div class="kt" style="padding:0"><div class="t3-cv kt-grow" style="border-radius:0"><div class="t3-scroll sc"><section><b>① スクロールしてください</b></section><section><b>② くるっと回って特徴を見せる</b></section><section><b>③ 近づいて細部を見せる</b></section><section><b>④ 色が変わって完成</b></section></div><span class="tag pg" style="z-index:4"></span></div></div>',
        init:(el) => view3(el, S => { const { T:T3, scene } = S; lights3(S); floor3(S); const v = vase(S, 0x5b8def); scene.add(v); const sc = $(el, '.sc'), c1 = new T3.Color(0x5b8def), c2 = new T3.Color(0xe11d48);
          const K = [[0, [3.4, 2, 4.4], 0], [.33, [-3, 1.6, 3.6], Math.PI], [.66, [.8, 1.5, 1.6], Math.PI * 1.6], [1, [0, 2.2, 4.2], Math.PI * 2]]; const pa = new T3.Vector3(), pb = new T3.Vector3();
          S.frame = () => { const p = sc.scrollTop / Math.max(1, sc.scrollHeight - sc.clientHeight); let i = 0; while (i < K.length - 2 && p > K[i + 1][0]) i++; const f = (p - K[i][0]) / (K[i + 1][0] - K[i][0]), e = f * f * (3 - 2 * f);
            pa.set(...K[i][1]); pb.set(...K[i + 1][1]); S.cam.position.lerpVectors(pa, pb, e); S.cam.lookAt(0, .9, 0); v.rotation.y = K[i][2] + (K[i + 1][2] - K[i][2]) * e; v.material.color.lerpColors(c1, c2, Math.max(0, (p - .66) / .34)); $(el, '.pg').textContent = `スクロール ${Math.round(p * 100)}%`; }; }, { orbit:false }),
        desc:'LPでよく見る「スクロールに合わせて3Dが回る・近づく」演出。<b>スクロール量を 0〜1 の進み具合</b>に直し、その値でカメラの位置・物体の回転・色を決めます。区間ごとにイージングをかけると上品に。実際のサイトでは GSAP の ScrollTrigger や drei の ScrollControls を使うと楽です。',
        prompt:'LPのファーストビューに3Dの商品を置いて、スクロールに合わせて回転・カメラが近づく・色が変わる演出を作って。GSAP ScrollTrigger でスクロールの進み具合を取り、three.js のカメラ位置と回転をなめらかに動かして。動きを減らす設定（prefers-reduced-motion）の人には静止画で表示して。' },
    ], null, true),
    { title:'動かし方の選び方', note:'同じ動きでも方法はいろいろ。<b>単純な動き → 自分で計算</b>、<b>演出の流れ → GSAP</b>、<b>モデルに入っている動き → AnimationMixer</b>、<b>ぶつかる・積み重なる → 物理エンジン</b>が目安です。',
      table:{ head:['方法', 'やり方', '向いている'], rows:[['毎フレーム自分で計算', 'sin・速さ×時間 で位置や回転を変える', '回転・ゆらゆら・簡単な動き'], ['lerp（線形補間）', '目標に毎フレーム一定割合だけ近づく', 'マウス追従・カメラの追いかけ'], ['GSAP', 'タイムラインで値を動かす', 'LPの演出・カメラ移動・スクロール連動'], ['AnimationMixer', 'glTFに入ったアニメーションを再生', 'キャラクターの歩き・扉の開閉'], ['物理エンジン（Rapier・cannon-es）', '重さ・衝突・関節を計算', '積み木・ボール・車・ラグドール'], ['シェーダー', 'GPUで頂点や色を動かす', '大量の粒・波・草のゆれ'], ['React Three Fiber の useFrame', '毎フレームの処理を部品の中に書く', 'Reactで作る3Dの動き']] } },
    S('動きと操作の用語', [
      T('アニメーションループ', 'Animation loop', '<code>renderer.setAnimationLoop()</code>（中身は requestAnimationFrame）で、画面の更新ごとに処理を実行。タブが裏にあると自動で止まる。'),
      T('deltaTime（経過時間）', 'Delta time', '前のフレームからの秒数。動きは「速さ × deltaTime」で書くと端末の速さに左右されない。', null, ['最重要']),
      T('Timer / Clock', 'THREE.Timer', 'three.js の経過時間を測る道具。<code>getDelta()</code> で前のフレームからの秒数。新しい Timer はタブ切り替え後の時間の飛びにも強い。'),
      T('lerp（線形補間）', 'Linear interpolation', 'a と b の間の値を割合で取る。<code>a + (b - a) × t</code>。ベクトル・色・角度にも使う。'),
      T('イージング', 'Easing', '動きの加速・減速のしかた。easeInOut（ゆっくり→速く→ゆっくり）が自然。モーション辞典も参照。'),
      T('OrbitControls など', 'Controls', 'カメラ操作の部品。Orbit（回り込む）、Map（地図風）、FirstPerson（一人称）、PointerLock（FPSゲーム）、Trackball など。'),
      T('レイキャスト', 'Raycasting', 'カメラから光線を飛ばして、当たった物体を調べる。クリック・ホバー・置く場所の判定に。'),
      T('正規化デバイス座標', 'NDC', '画面の左端〜右端、下端〜上端を -1〜1 で表す座標。レイキャストの前にマウス座標をこれに直す。'),
      T('AnimationMixer', 'AnimationMixer', 'glTF に入ったアニメーション（歩く・走る）を再生・切り替える仕組み。切り替えは crossFade でなめらかに。'),
      T('ボーン・スキニング', 'Skeleton / skinning', 'キャラクターの中に骨を入れ、骨に合わせて表面を変形させる仕組み。Mixamo で自動で入れられる。'),
      T('モーフターゲット', 'Morph targets', '形の変化（表情・口の開き）を事前に用意して、割合で混ぜる仕組み。'),
      T('物理エンジン', 'Physics engine', '重さ・重力・衝突・摩擦を計算するライブラリ。<b>Rapier</b>（速い・WASM）、<b>cannon-es</b>（手軽）、R3F なら <b>@react-three/rapier</b>。', null, ['定番']),
      T('衝突判定の形', 'Colliders', '物理では見た目の形ではなく、箱・球・カプセルなど<b>単純な形</b>で当たりを計算すると速い。'),
      T('インスタンシング', 'Instancing', '同じ形をたくさん描くとき、1回の命令でまとめて描く仕組み。草・木・群衆に。（「ライブラリと性能」タブ）'),
      T('見えないときは止める', 'Pause when hidden', '画面外・タブが裏のときは描画を止めて電池を節約。IntersectionObserver で表示中かを調べる。', null, ['性能']),
      T('動きを減らす設定', 'prefers-reduced-motion', '動きが苦手な人向けのOS設定。3Dの自動回転や激しいカメラ移動を止める・弱める。', null, ['アクセシビリティ']),
    ]),
  ]});
})();
