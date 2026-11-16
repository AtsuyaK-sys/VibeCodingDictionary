/* 動画制作辞典 — A: ショット / アングル / カメラワーク / 構図 */
(function(){
/* 共通のシーン（背景と人物）を一度だけ定義し、<use> で使い回す */
document.body.insertAdjacentHTML('afterbegin', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <linearGradient id="vd-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd3ff"/><stop offset=".75" stop-color="#e9f6ff"/></linearGradient>
  <filter id="vd-blur"><feGaussianBlur stdDeviation=".7"/></filter>
  <g id="vd-bg">
    <rect width="320" height="180" fill="url(#vd-sky)"/>
    <circle cx="252" cy="42" r="14" fill="#ffd166"/>
    <polygon points="0,122 38,88 78,108 128,70 176,102 228,80 278,100 320,84 320,150 0,150" fill="#a7c4e2"/>
    <path d="M0 140 Q70 118 140 138 T320 132 V180 H0Z" fill="#88c070"/>
    <rect y="150" width="320" height="30" fill="#7cb562"/>
    <g fill="#3e8e5a"><polygon points="30,151 40,122 50,151"/><polygon points="52,151 60,130 68,151"/><polygon points="262,151 273,118 284,151"/><polygon points="285,151 293,132 301,151"/></g>
    <rect x="88" y="134" width="22" height="17" fill="#fff4e0"/><polygon points="85,135 99,124 113,135" fill="#e76f51"/><rect x="96" y="141" width="6" height="10" fill="#8d5a3b"/><rect x="102.5" y="138" width="5" height="4" fill="#9fd3ff"/>
  </g>
  <g id="vd-person">
    <rect x="156.2" y="141" width="3.4" height="17" rx="1.2" fill="#2b2d42"/><rect x="160.4" y="141" width="3.4" height="17" rx="1.2" fill="#2b2d42"/>
    <rect x="151.2" y="128" width="3" height="12.5" rx="1.5" style="fill:var(--shirt, #e0364f)"/><rect x="165.8" y="128" width="3" height="12.5" rx="1.5" style="fill:var(--shirt, #e0364f)"/>
    <circle cx="152.7" cy="141" r="1.6" fill="#f2c9a0"/><circle cx="167.3" cy="141" r="1.6" fill="#f2c9a0"/>
    <rect x="153.6" y="126.8" width="12.8" height="15.5" rx="3" style="fill:var(--shirt, #e0364f)"/>
    <rect x="158.6" y="124.3" width="2.8" height="3.2" fill="#e8b98e"/>
    <circle cx="160" cy="121" r="4.3" fill="#f2c9a0"/>
    <path d="M155.6 121 Q155.5 116 160 116.2 Q164.5 116 164.4 121 Q163.6 118.4 160 118.6 Q157 118.4 155.6 121Z" fill="#3d2b1f"/>
    <ellipse cx="158.4" cy="121.3" rx=".85" ry=".55" fill="#fff"/><ellipse cx="161.6" cy="121.3" rx=".85" ry=".55" fill="#fff"/>
    <circle cx="158.5" cy="121.3" r=".42" fill="#3b2416"/><circle cx="161.7" cy="121.3" r=".42" fill="#3b2416"/>
    <circle cx="158.65" cy="121.15" r=".13" fill="#fff"/><circle cx="161.85" cy="121.15" r=".13" fill="#fff"/>
    <path d="M157.5 120.1 L159.2 119.9 M160.8 119.9 L162.5 120.1" stroke="#3d2b1f" stroke-width=".3" stroke-linecap="round"/>
    <path d="M158.9 123.3 Q160 124.1 161.1 123.3" stroke="#a0522d" stroke-width=".3" fill="none" stroke-linecap="round"/>
    <circle cx="157.3" cy="122.6" r=".6" fill="#ff9aa2" opacity=".45"/><circle cx="162.7" cy="122.6" r=".6" fill="#ff9aa2" opacity=".45"/>
  </g>
</defs></svg>`);

const shot = (vb, extra, badge) => `<div class="vd-frame"><svg viewBox="${vb}" preserveAspectRatio="xMidYMid slice"><use href="#vd-bg"/><use href="#vd-person"/>${extra || ''}</svg>${badge ? `<span class="vd-badge">${badge}</span>` : ''}</div>`;
const VB = {
  ECU:'157 119.9 6 3.375', CU:'150.2 116 19.56 11', MCU:'143.1 115.5 33.8 19', MS:'134.67 115 50.67 28.5',
  MLS:'126.65 114.5 66.7 37.5', FS:'119.1 114 81.8 46', LS:'96 96 128 72', ELS:'0 0 320 180',
};
window.VD_SHOT = shot; window.VD_VB = VB;

TABS.push({
  id:'shot', label:'ショットサイズ', icon:'▭',
  intro:'被写体を<b>画面にどれくらいの大きさで写すか</b>の呼び名。映画・ドラマ・YouTube・AI動画生成のどれでも共通語です。引き（広い）から寄り（狭い）へ並べています。AI動画のプロンプトでは、日本語の指示例に英語名（close-up など）を添えると、より確実に伝わります。',
  sections:[
    { title:'人物のショットサイズ（引き → 寄り）', items:[
      { name:'超ロングショット／エスタブリッシングショット', en:'ELS / Extreme Long Shot / Establishing Shot', demo: shot(VB.ELS, '', 'ELS'), tags:['状況説明','冒頭'],
        desc:'人物は豆粒ほどで、<b>場所や世界観</b>を見せる。シーンの冒頭に「ここはどこか」を伝えるエスタブリッシングショットとして使う。', prompt:'超ロングショット（エスタブリッシングショット）。山に囲まれた広大な緑の谷に、小さな人影がぽつんと立っている。' },
      { name:'ロングショット／ワイド', en:'LS / Long Shot / Wide Shot', demo: shot(VB.LS, '', 'LS'), tags:['全体'],
        desc:'人物の全身と周りの環境が入る。人物と場所の関係、動きの全体を見せる。', prompt:'ワイドショット。赤いシャツの女性が草原に立ち、全身と周りの景色が見えている。' },
      { name:'フルショット', en:'FS / Full Shot', demo: shot(VB.FS, '', 'FS'), tags:['全身'],
        desc:'頭からつま先までがちょうど収まる。服装・ポーズ・ダンスなど<b>全身の動き</b>を見せたいときに。', prompt:'フルショット。頭からつま先まで、堂々と立つ女性を画面の中央に。' },
      { name:'ミディアムロングショット／カウボーイショット', en:'MLS / Medium Long Shot / Cowboy Shot', demo: shot(VB.MLS, '', 'MLS'), tags:['膝上'],
        desc:'膝（太もも）から上。西部劇で腰のガンホルスターが入る構図だったことからカウボーイショットとも呼ぶ。', prompt:'ミディアムロングショット（カウボーイショット）。膝から上を写す。' },
      { name:'ミディアムショット／ウエストショット', en:'MS / Medium Shot / Waist Shot', demo: shot(VB.MS, '', 'MS'), tags:['腰上','会話の基本'],
        desc:'腰から上。表情と身振りの両方が見える。<b>トーク・インタビュー・YouTubeの基本サイズ</b>。', prompt:'ミディアムショット（腰から上）。人物がカメラに向かって、自然な身振りを交えて話している。' },
      { name:'ミディアムクローズアップ／バストショット', en:'MCU / Medium Close-Up / Bust Shot', demo: shot(VB.MCU, '', 'MCU'), tags:['胸上'],
        desc:'胸から上。表情がよく分かり、背景も少し入る。ニュースキャスターやVlogの語りに多い。', prompt:'ミディアムクローズアップ（胸から上）。背景は柔らかくぼかす。' },
      { name:'クローズアップ', en:'CU / Close-Up', demo: shot(VB.CU, '', 'CU'), tags:['顔','感情'],
        desc:'顔が画面いっぱい。<b>感情・反応</b>を強く伝える。多用すると圧迫感が出るので、ここぞという場面で。', prompt:'顔のクローズアップ。彼女がゆっくり微笑む。被写界深度は浅く、背景はボケている。' },
      { name:'エクストリームクローズアップ', en:'ECU / Extreme Close-Up', demo: shot(VB.ECU, '', 'ECU'), tags:['目・口・手元'],
        desc:'目・口・指先など体の一部や物のディテールだけを写す。緊張感、象徴的な瞬間、商品の質感に。', prompt:'目のエクストリームクローズアップ。瞳に街の明かりが映り込む、マクロ撮影のような細部。' },
    ]},
    { title:'人数・関係・視点のショット', items:[
      { name:'ツーショット', en:'Two Shot', demo:`<div class="vd-frame"><svg viewBox="124 112 72 40.5" preserveAspectRatio="xMidYMid slice"><use href="#vd-bg"/><use href="#vd-person" x="-11"/><use href="#vd-person" x="12" style="--shirt:#2a9d8f"/></svg><span class="vd-badge">2S</span></div>`, tags:['関係性'],
        desc:'2人を1つの画面に収める。2人の距離感や関係性を見せる。3人ならスリーショット。', prompt:'ツーショット。2人の友人が横に並んで立ち、どちらもカメラの方を向いている。ミディアムの画角で。' },
      { name:'肩越しショット', en:'OTS / Over-the-Shoulder Shot', demo:`<div class="vd-frame"><svg viewBox="148.5 114.5 23 12.94" preserveAspectRatio="xMidYMid slice"><use href="#vd-bg"/><use href="#vd-person"/><g filter="url(#vd-blur)"><ellipse cx="150.2" cy="129" rx="5.5" ry="6" fill="#1f2937"/><circle cx="151" cy="120.5" r="4" fill="#2b1d14"/></g></svg><span class="vd-badge">OTS</span></div>`, tags:['会話シーン'],
        desc:'手前の人物の肩・後頭部越しに相手を写す。<b>会話シーンの定番</b>で、切り返し（ショット／リバースショット）で交互に使う。', prompt:'肩越しショット。男性の後ろから、話を聞いている女性を写す。被写界深度は浅く。' },
      { name:'POV（主観ショット）', en:'POV / Point of View Shot', demo:`<div class="vd-frame"><svg viewBox="96 96 128 72" preserveAspectRatio="xMidYMid slice"><use href="#vd-bg"/><use href="#vd-person"/><ellipse cx="140" cy="172" rx="14" ry="10" fill="#f2c9a0"/><ellipse cx="182" cy="172" rx="14" ry="10" fill="#f2c9a0"/><rect x="146" y="150" width="30" height="20" rx="3" fill="#111"/><rect x="148" y="152" width="26" height="15" rx="1.5" fill="#5aa9ff"/></svg><span class="vd-badge">POV</span></div>`, tags:['一人称','没入感'],
        desc:'登場人物の目線そのものを写す。視聴者が<b>その人になったような没入感</b>。ゲーム実況、Vlog、ホラーで多用。', prompt:'一人称視点（POV）のショット。手前にスマホを持った手が映り、草原にいる人物に向かって歩いていく。' },
      { name:'インサートショット', en:'Insert Shot', demo: shot('84 122 30 16.88', '', 'INSERT'), tags:['物のアップ','情報'],
        desc:'時計・手紙・スマホ画面など、<b>物語に必要な情報</b>を見せるための物のアップ。料理動画の手元や商品のディテールも。', prompt:'インサートショット。赤い屋根の小さな家のアップで、ドアの細部を見せる。' },
      { name:'リアクションショット', en:'Reaction Shot', demo: shot('149.2 115.5 21.5 12.1', '<text x="168" y="118.5" font-size="2.6" fill="#e0364f" font-weight="900">！</text>', 'REACTION'), tags:['反応','切り返し'],
        desc:'出来事に対する人物の反応（驚き・笑い）を写すショット。バラエティでは「ワイプ」で同時に見せることも多い。', prompt:'リアクションショット。知らせを聞いて驚く彼女の顔のアップ。' },
    ]},
    { title:'サイズの使い分けのコツ', layout:'rows', items:[
      { name:'引きから寄りへ', en:'wide → medium → close', desc:'シーンの頭で<b>ELS/LSで場所</b>を見せ、<b>MSで状況</b>、<b>CUで感情</b>と段階的に寄っていくと、視聴者が迷わない。', prompt:'このシーンの絵コンテを「ロングショットで場所を見せる→ミディアムで2人の会話→クローズアップで表情」の順で作って。' },
      { name:'ジャンプのしすぎに注意', en:'avoid similar sizes in a row', desc:'同じ被写体を<b>似たサイズで連続させると「ジャンプカット」</b>に見えて違和感が出る。切り替えるときはサイズを2段階以上変えるか、アングルを30度以上変える（30度ルール）。', prompt:'カットのつながりが不自然なので、連続するショットのサイズを2段階以上変えるか、角度を30度以上変えるよう編集案を出して。' },
      { name:'縦動画のサイズ感', en:'vertical framing', desc:'9:16の縦動画は横幅が狭いため、横動画より<b>1段階寄ったサイズ</b>（MS→MCU）が基本。全身を写すとかなり小さくなる。', prompt:'TikTok用の縦動画なので、話している人はバストショット（胸上）を基本に、上下にテロップ用の余白を残して。' },
    ]},
  ]
});

/* ---------- アングル ---------- */
function angleDiagram(cx, cy, label){
  const hx = 160, hy = 46, ang = Math.atan2(hy - cy, hx - cx) * 180 / Math.PI;
  return `<svg class="vd-diagram" viewBox="0 0 200 124"><line class="line" x1="0" y1="110" x2="200" y2="110"/>
    <g class="person"><circle cx="160" cy="40" r="8"/><rect x="152" y="50" width="16" height="34" rx="5"/><rect x="153" y="84" width="6" height="26" rx="2"/><rect x="161" y="84" width="6" height="26" rx="2"/></g>
    <line class="dash" x1="${cx}" y1="${cy}" x2="${hx}" y2="${hy}"/>
    <g transform="translate(${cx} ${cy}) rotate(${ang})"><rect class="cam-ic" x="-14" y="-7" width="18" height="14" rx="2"/><polygon class="cam-ic" points="4,-4 11,-8 11,8 4,4"/></g>
    <text x="6" y="14">${label}</text></svg>`;
}
const angleCard = (diag, view) => `<div style="position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr"><div style="position:relative">${diag}</div><div style="position:relative;overflow:hidden">${view}</div></div>`;
const tiltView = (t) => `<div class="vd-frame"><svg viewBox="${VB.FS}" preserveAspectRatio="xMidYMid slice" style="transform:${t}"><use href="#vd-bg"/><use href="#vd-person"/></svg></div>`;

TABS.push({
  id:'angle', label:'カメラアングル', icon:'◢',
  intro:'カメラを<b>どの高さ・どの角度から向けるか</b>。同じ人物でもアングルで「強そう」「弱そう」「不安」と印象が変わります。左が横から見た配置図、右が写り方のイメージです。',
  sections:[
    { title:'高さと角度', items:[
      { name:'アイレベル', en:'Eye Level', demo: angleCard(angleDiagram(30, 46, '目の高さ'), tiltView('none')), tags:['中立','基本'],
        desc:'被写体の目の高さから水平に撮る。<b>中立で自然</b>。インタビュー、会話、Vlogの基本。', prompt:'アイレベル（目の高さ）のショット。中立で自然な視点。' },
      { name:'ハイアングル（俯瞰）', en:'High Angle', demo: angleCard(angleDiagram(40, 8, '上から'), tiltView('perspective(260px) rotateX(24deg) scale(1.15)')), tags:['弱さ','孤独'],
        desc:'上から見下ろす。被写体が<b>小さく弱く、孤独に</b>見える。料理の手元や全体の配置説明にも。', prompt:'ハイアングル（俯瞰）のショット。床に座り込む孤独な少女を上から見下ろす。' },
      { name:'ローアングル（煽り）', en:'Low Angle', demo: angleCard(angleDiagram(40, 104, '下から'), tiltView('perspective(260px) rotateX(-24deg) scale(1.15)')), tags:['強さ','威圧感','ヒーロー'],
        desc:'下から見上げる。被写体が<b>大きく力強く、威圧的</b>に見える。ヒーロー、権力者、建物の迫力に。', prompt:'ローアングル（あおり）のヒーローショット。空を背に屋上に立つ男性を下から見上げる。' },
      { name:'俯瞰（真上）／バーズアイ', en:"Bird's-Eye View / Top Shot", demo:`<div class="vd-frame" style="background:#7cb562"><svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice"><rect width="160" height="90" fill="#7cb562"/><ellipse cx="84" cy="50" rx="13" ry="9" fill="#00000022"/><ellipse cx="80" cy="45" rx="13" ry="8" fill="#e0364f"/><circle cx="80" cy="45" r="6" fill="#3d2b1f"/><rect x="20" y="15" width="22" height="18" fill="#e76f51"/><circle cx="130" cy="20" r="9" fill="#3e8e5a"/><circle cx="140" cy="68" r="7" fill="#3e8e5a"/></svg><span class="vd-badge">TOP</span></div>`, tags:['真上','説明的'],
        desc:'真上から見下ろす。地図のように配置が分かる。料理・手元作業・机の上・群衆の模様に。ドローン撮影の定番。', prompt:'真上から見下ろす俯瞰（バーズアイ）のショット。草の上に寝転ぶ人物を真上から撮る、ドローン撮影。' },
      { name:'あおり（真下から）／ワームズアイ', en:"Worm's-Eye View", demo: angleCard(angleDiagram(110, 108, '地面から'), tiltView('perspective(200px) rotateX(-40deg) scale(1.35)')), tags:['迫力','非日常'],
        desc:'地面すれすれから真上近くを見上げる。巨大さ・迫力・非日常感。ビル群、木々、怪獣など。', prompt:'地面すれすれから真上を見上げるあおり（ワームズアイ）のショット。そびえ立つ高層ビル群を見上げる。' },
      { name:'ダッチアングル（斜め）', en:'Dutch Angle / Canted Angle', demo:`<div class="vd-frame"><svg viewBox="${VB.MS}" preserveAspectRatio="xMidYMid slice" style="transform:rotate(-14deg) scale(1.35)"><use href="#vd-bg"/><use href="#vd-person"/></svg><span class="vd-badge">DUTCH</span></div>`, tags:['不安','緊張','狂気'],
        desc:'カメラを横に傾けて水平線を斜めにする。<b>不安・緊張・混乱・狂気</b>の表現。ホラーやサスペンス、MVに。', prompt:'ダッチアングル（カメラを斜めに傾けた構図）。薄暗い廊下に立つ男性。傾いた水平線で不安感を出す。' },
      { name:'ショルダーレベル／ヒップレベル', en:'Shoulder / Hip Level', desc:'肩の高さ・腰の高さから撮る。ヒップレベルは西部劇の撃ち合い、子ども目線の表現などに。', tags:['高さのバリエーション'], prompt:'ヒップレベルのショット。カメラを腰の高さに置き、手元とホルスターを写す。' },
      { name:'グラウンドレベル', en:'Ground Level Shot', desc:'カメラを地面に置いて撮る。足元、歩く靴、走る車輪など。手前の地面が大きくボケて臨場感が出る。', tags:['足元'], prompt:'グラウンドレベルのショット。カメラを歩道に置き、スニーカーが横切っていく。水たまりに反射が映る。' },
    ]},
  ]
});

/* ---------- カメラワーク ---------- */
const CAM = (cls, extra) => `<div class="cam ${cls}"><div class="world">
  <div class="ly bg"><svg viewBox="0 0 720 360" preserveAspectRatio="xMidYMid slice"><circle cx="505" cy="110" r="22" fill="#ffd166"/><g class="cloud"><ellipse cx="300" cy="100" rx="26" ry="9" fill="#fff"/><ellipse cx="318" cy="94" rx="16" ry="9" fill="#fff"/></g><polygon points="0,215 60,170 120,200 200,140 280,195 360,150 440,190 520,135 600,185 680,160 720,175 720,262 0,262" fill="#a7c4e2"/><rect y="250" width="720" height="110" fill="#86c06c"/></svg></div>
  <div class="ly mid"><svg viewBox="0 0 720 360" preserveAspectRatio="xMidYMid slice"><g fill="#3e8e5a"><polygon points="70,262 90,205 110,262"/><polygon points="120,262 140,215 160,262"/><polygon points="455,262 475,200 495,262"/><polygon points="545,262 562,215 579,262"/><polygon points="600,262 622,198 644,262"/></g><rect x="235" y="230" width="44" height="32" fill="#fff4e0"/><polygon points="229,232 257,210 285,232" fill="#e76f51"/><rect x="251" y="243" width="11" height="19" fill="#8d5a3b"/></svg></div>
  <div class="ly subj"><svg viewBox="0 0 720 360" preserveAspectRatio="xMidYMid slice"><g class="walker"><use href="#vd-person" transform="translate(360 268) scale(1.85) translate(-160 -158)"/></g></svg></div>
  <div class="ly fg"><svg viewBox="0 0 720 360" preserveAspectRatio="xMidYMid slice"><rect class="post" x="196" y="238" width="22" height="122" fill="#6b4f3a"/><rect x="188" y="236" width="38" height="8" fill="#5a4030"/><ellipse cx="610" cy="335" rx="70" ry="45" fill="#2d6a4f"/><path d="M0 360 L0 318 Q30 300 50 322 Q70 296 95 320 Q120 300 140 324 L160 360Z" fill="#2d6a4f"/></svg></div>
</div>${extra || ''}<span class="vd-rec">REC</span></div>`;

TABS.push({
  id:'camera', label:'カメラワーク', icon:'⇆',
  intro:'カメラの<b>動かし方</b>の名前。見本は「奥の山・中景の木・人物・手前の柵」の4層でできていて、<b>層ごとの動き方の違い（視差）</b>で各カメラワークの特徴が分かるようになっています。AI動画生成（Sora / Veo / Kling / Runway など）では、日本語の指示例に英語名（dolly in など）を添えると、より確実に伝わります。',
  sections:[
    { title:'その場で向きを変える（三脚）', note:'カメラの位置は動かさず、向きやレンズだけを変える動き。<b>全部の層が同じだけ動く</b>（視差がない）のが特徴です。', items:[
      { name:'フィックス（固定）', en:'Static / Locked-off Shot', demo: CAM('mv-fix'), tags:['基本','安定'],
        desc:'カメラを一切動かさない。被写体の動きや演技に集中させる。迷ったら固定が一番きれい。', prompt:'固定ショット。三脚にカメラを据えて動かさず、雲だけがゆっくり流れる。' },
      { name:'パン', en:'Pan (left / right)', demo: CAM('mv-pan'), tags:['横に振る'],
        desc:'カメラの位置は固定し、<b>水平方向に首を振る</b>。景色の広がりを見せる、人物を目で追う。速く振ると「ホイップパン」。', prompt:'谷を左から右へゆっくりパンし、草原に立つ女性が見えてくる。' },
      { name:'ティルト', en:'Tilt (up / down)', demo: CAM('mv-tilt'), tags:['縦に振る'],
        desc:'カメラの位置は固定し、<b>上下に首を振る</b>。足元から顔へ（ティルトアップ）で人物を紹介、建物の高さを見せる。', prompt:'草から空へゆっくりティルトアップし、山の上の太陽が見えてくる。' },
      { name:'ズーム', en:'Zoom In / Out', demo: CAM('mv-zoom'), tags:['レンズ','視差なし'],
        desc:'レンズの焦点距離を変えて拡大・縮小。カメラは動かないので<b>手前も奥も同じ倍率で大きくなり、立体感は変わらない</b>（ドリーとの違い）。速いズームはバラエティ・ドキュメンタリー的。', prompt:'女性にゆっくりズームイン。カメラの位置は動かさない。' },
      { name:'ロール', en:'Roll / Barrel Roll', demo: CAM('mv-roll'), tags:['回転','不安定'],
        desc:'レンズの軸を中心にカメラを回転させる。めまい・混乱・夢の中・トランジションに。ダッチアングルの動き版。', prompt:'カメラが時計回りにゆっくり15度ロールし、平衡感覚が崩れるような効果を出す。' },
    ]},
    { title:'カメラ自体が移動する', note:'カメラの位置が変わる動き。<b>手前の物ほど大きく動き、奥ほど動かない</b>（視差＝パララックス）ので立体感が生まれます。', items:[
      { name:'ドリーイン／ドリーアウト', en:'Dolly In / Dolly Out', demo: CAM('mv-dolly'), tags:['近づく','立体的'],
        desc:'カメラごと被写体に<b>近づく・離れる</b>。ズームと違い、手前の柵が大きく流れて消え、背景はあまり大きくならない。感情の高まり、核心に迫る演出。', prompt:'女性に向かってゆっくりドリーイン。手前の柵がカメラの横を通り過ぎていく。映画的に。' },
      { name:'プッシュイン', en:'Push In (slow)', demo: CAM('mv-push'), tags:['じわじわ寄る','緊張'],
        desc:'気づかないほど<b>ゆっくり</b>被写体に寄っていく。心情の変化、重要な告白、緊張感の高まりに。映画で多用される。', prompt:'真実に気づいた彼女の顔へ、ごくゆっくりプッシュイン。控えめで緊張感のある動き。' },
      { name:'トラック（トラッキング）', en:'Truck / Tracking Shot', demo: CAM('mv-truck'), tags:['横移動'],
        desc:'カメラが<b>横に平行移動</b>する。レールの上を移動させるイメージ。並んだ物を順に見せる、歩く人と並走する。', prompt:'並木に沿って横に移動するトラッキングショット。手前の柵が素早く流れていく。' },
      { name:'フォローショット', en:'Follow Shot', demo: CAM('mv-follow'), tags:['追いかける','ジンバル'],
        desc:'動く被写体と<b>同じ速さで付いていく</b>。被写体は画面の同じ位置に留まり、背景が流れる。ジンバル・ステディカムで撮る。', prompt:'歩く女性の横を並走する滑らかなフォローショット。ステディカムで撮影し、背景が流れていく。' },
      { name:'ペデスタル（ブーム）', en:'Pedestal / Boom Up-Down', demo: CAM('mv-ped'), tags:['上下移動'],
        desc:'カメラの向きは変えずに<b>上下に平行移動</b>する。ティルトと違い、見下ろす角度にはならない。', prompt:'ペデスタルアップ。カメラが水平を保ったまま真上に上昇し、丘の向こうの家が見えてくる。' },
      { name:'クレーンショット（ジブ）', en:'Crane Shot / Jib', demo: CAM('mv-crane'), tags:['壮大','オープニング・エンディング'],
        desc:'クレーンで<b>高く上昇しながら引いていく</b>（またはその逆）。人物から世界全体へ広がる壮大な締めくくりや、オープニングの導入に。', prompt:'クレーンショット。女性から上昇しながら引いていき、谷全体を見せる壮大なラスト。' },
      { name:'アーク（オービット）', en:'Arc / Orbit Shot', demo: CAM('mv-arc'), tags:['回り込む','ヒーロー'],
        desc:'被写体を中心に<b>円を描いて回り込む</b>。手前と奥が逆方向に流れる。ヒーローの登場、告白、商品紹介の360度に。', prompt:'女性の周りを360度回り込むオービットショット。背景が彼女の後ろで回転していく。' },
      { name:'ドリーズーム（めまいショット）', en:'Dolly Zoom / Vertigo Effect', demo: CAM('mv-vertigo'), tags:['衝撃','めまい','ヒッチコック'],
        desc:'カメラを引きながら同時にズームイン（または逆）。<b>人物の大きさは同じなのに背景だけが伸び縮み</b>する、不気味な効果。衝撃・恐怖・気づきの瞬間。', prompt:'女性へのドリーズーム（めまい効果）。彼女の大きさは変わらないまま、背景だけが伸び縮みする。' },
      { name:'FPVドローン', en:'FPV Drone Shot', demo: CAM('mv-fpv'), tags:['ダイナミック','急降下'],
        desc:'一人称視点のレース用ドローンで、<b>高速で急降下・すり抜け・旋回</b>する。施設紹介・スポーツ・不動産の空撮で人気。', prompt:'FPVドローンショット。空から丘の上へ高速で急降下し、女性の周りを旋回する。ダイナミックな動き。' },
    ]},
    { title:'質感・特殊な動き', items:[
      { name:'ハンドヘルド（手持ち）', en:'Handheld Shot', demo: CAM('mv-hand'), tags:['臨場感','ドキュメンタリー'],
        desc:'手持ちで撮る細かな揺れ。<b>臨場感・生々しさ・緊迫感</b>。ドキュメンタリー、アクション、Vlogに。', prompt:'手持ちカメラ。わずかな揺れのあるドキュメンタリー風で、女性のすぐ後ろを追いかける。' },
      { name:'ホイップパン（スウィッシュパン）', en:'Whip Pan / Swish Pan', demo: CAM('mv-whip'), tags:['高速','つなぎ'],
        desc:'ブレるほど<b>素早く振る</b>パン。勢い・場面転換のトランジションとしても使える（2つのカットを高速パンでつなぐ）。', prompt:'右方向への素早いホイップパン。強いモーションブラーの中で次のシーンへ切り替わる。' },
      { name:'ラックフォーカス（ピント送り）', en:'Rack Focus / Focus Pull', demo: CAM('mv-rack'), tags:['視線誘導','ボケ'],
        desc:'撮影中に<b>ピントを手前から奥へ（またはその逆）移す</b>。見せたいものを切り替える、伏線を明かす。被写界深度が浅いほど効果的。', prompt:'手前の木の柵の杭から、奥にいる女性へとピントを送る（ラックフォーカス）。' },
      { name:'スローモーション撮影', en:'Slow Motion (high frame rate)', tags:['120fps/240fps'], desc:'高フレームレート（60/120/240fps）で撮り、24/30fpsで再生してゆっくり見せる。動きの美しさ・決定的瞬間の強調。詳しくは「編集技法」タブ。', prompt:'120fpsのスローモーション。水しぶきが飛び散る、ドラマチックな映像。' },
      { name:'ワンカット（長回し）', en:'Long Take / Oner', tags:['没入感','技術力'], desc:'カットを割らずに長時間撮り続ける。緊張感と没入感が持続する。最近はAI生成の制約（数秒〜十数秒）から、短いカットをつなぐのが現実的。', prompt:'カットを割らない長回し。家の中を歩く彼女を追いかけ、そのまま庭へ出ていく。' },
      { name:'タイムラプス／ハイパーラプス', en:'Time-lapse / Hyperlapse', tags:['時間の圧縮'], desc:'一定間隔で撮った静止画をつなぎ、雲や人の流れを高速で見せる。ハイパーラプスは撮影位置も移動させる。', prompt:'山の上を雲が速く流れ、昼から夜へ移り変わるタイムラプス。' },
    ]},
  ]
});

/* ---------- 構図 ---------- */
const imaginaryLine = `<svg class="vd-diagram" viewBox="0 0 200 124"><rect x="0" y="0" width="200" height="62" fill="#22c55e18"/><rect x="0" y="62" width="200" height="62" fill="#ef444418"/>
  <line x1="10" y1="62" x2="190" y2="62" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="5 3"/><text x="134" y="58" style="fill:#ef4444">イマジナリーライン</text>
  <circle cx="70" cy="62" r="9" fill="#e0364f"/><text x="64" y="66" style="fill:#fff">A</text><circle cx="130" cy="62" r="9" fill="#2a9d8f"/><text x="125" y="66" style="fill:#fff">B</text>
  <g transform="translate(55 22) rotate(40)"><rect class="cam-ic" x="-9" y="-5" width="12" height="10" rx="2"/><polygon class="cam-ic" points="3,-3 8,-6 8,6 3,3"/></g>
  <g transform="translate(145 22) rotate(140)"><rect class="cam-ic" x="-9" y="-5" width="12" height="10" rx="2"/><polygon class="cam-ic" points="3,-3 8,-6 8,6 3,3"/></g>
  <text x="8" y="14" style="fill:#16a34a">○ この側だけで撮る</text>
  <g transform="translate(100 104) rotate(-90)" opacity=".7"><rect x="-9" y="-5" width="12" height="10" rx="2" fill="#ef4444"/><polygon points="3,-3 8,-6 8,6 3,3" fill="#ef4444"/></g><text x="112" y="112" style="fill:#ef4444">× 越えると左右が逆転</text></svg>`;
TABS.push({
  id:'compose', label:'構図・画面設計', icon:'⊞',
  intro:'画面の中に<b>何をどこに置くか</b>のルール。写真・動画・サムネイル・AI画像生成すべてに共通する基本です。',
  sections:[
    { title:'配置のルール', items:[
      { name:'三分割法', en:'Rule of Thirds', demo:`<div class="vd-frame vd-thirds"><svg viewBox="132.7 114 81.8 46" preserveAspectRatio="xMidYMid slice"><use href="#vd-bg"/><use href="#vd-person"/></svg></div>`, tags:['最重要','基本'],
        desc:'画面を縦横3等分し、<b>線や交点に主役を置く</b>。中央に置くより動きと余白が生まれる。スマホのカメラのグリッド表示もこれ。', prompt:'三分割法の構図。被写体を左の3分の1の線上に置き、右側に空間を空ける。' },
      { name:'日の丸構図（中央配置）', en:'Centered Composition', demo:`<div class="vd-frame vd-thirds"><svg viewBox="${VB.FS}" preserveAspectRatio="xMidYMid slice"><use href="#vd-bg"/><use href="#vd-person"/></svg></div>`, tags:['力強い','YouTube'],
        desc:'主役をど真ん中に置く。単調になりやすいが、<b>力強く分かりやすい</b>。正面語り、商品カット、シンメトリーと組み合わせると効果的。', prompt:'日の丸構図。被写体を画面のど真ん中に置き、背景は左右対称に。' },
      { name:'ヘッドルーム', en:'Headroom', demo:`<div style="position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:8px"><div style="position:relative;border-radius:6px;overflow:hidden">${shot('136.7 113.6 46.6 26.2', '', '○ 適切')}</div><div style="position:relative;border-radius:6px;overflow:hidden">${shot('136.7 100 46.6 26.2', '', '× 空きすぎ')}</div></div>`, tags:['頭上の余白'],
        desc:'人物の頭の上の空間。<b>空きすぎると間延び</b>し、なさすぎると窮屈。寄りのショットほど少なく、CUでは頭頂が少し切れてもよい。', prompt:'適切なヘッドルーム。頭の上に少しだけ余白を残し、目を上から3分の1の線に合わせる。' },
      { name:'リードルーム（視線の先の余白）', en:'Lead Room / Nose Room', demo:`<div class="vd-frame"><svg viewBox="132.7 114 81.8 46" preserveAspectRatio="xMidYMid slice"><use href="#vd-bg"/><use href="#vd-person"/><path d="M168 122 L190 122" stroke="#e0364f" stroke-width="1.2" stroke-dasharray="2 1.5"/><polygon points="190,120 194,122 190,124" fill="#e0364f"/><text x="172" y="119" font-size="3.2" fill="#e0364f" font-weight="700">視線・進行方向</text></svg></div>`, tags:['余白の向き'],
        desc:'人物が向いている方向・進む方向に<b>空間を空ける</b>。逆に背中側を空けると、不安・追われる感じが出る。', prompt:'被写体は右を向いて画面の左側に配置し、視線の先（右側）に空間を空ける。' },
      { name:'イマジナリーライン（180度ルール）', en:'180-Degree Rule / Axis of Action', demo:`<div style="position:absolute;inset:0">${imaginaryLine}</div>`, tags:['会話シーン','超重要'],
        desc:'2人を結ぶ見えない線の<b>片側だけからカメラを置く</b>ルール。越えると左右の位置関係が入れ替わり、視聴者が混乱する。切り返しで必ず守る。', prompt:'会話シーンの絵コンテを作って。AとBのイマジナリーラインを越えないように、カメラは常に同じ側から撮るカット割りにして。' },
      { name:'30度ルール', en:'30-Degree Rule', tags:['つなぎ'], desc:'同じ被写体をつなぐとき、<b>カメラの角度を30度以上変える</b>（またはサイズを大きく変える）。変化が小さいと画面が飛んだように見える（ジャンプカット）。', prompt:'同じ人物のカットを2つつなぐときは、カメラ位置を30度以上変えるか、サイズを2段階変えて。' },
    ]},
    { title:'画面を豊かにするテクニック', layout:'rows', items:[
      { name:'リーディングライン（誘導線）', en:'Leading Lines', desc:'道・線路・川・廊下・手すりなどの線で、<b>視線を主役へ導く</b>。奥行きも生まれる。', prompt:'リーディングラインの構図。長く続く道が、遠くの人物に向かって収束していく。' },
      { name:'シンメトリー（対称）', en:'Symmetry', desc:'左右対称の構図。安定・荘厳・不気味さ（ウェス・アンダーソン風、ホラー）。', prompt:'完全な左右対称の構図。中央に一点透視の廊下。ウェス・アンダーソン風。' },
      { name:'フレーム・イン・フレーム', en:'Frame within a Frame', desc:'窓・ドア・木の枝・トンネルなどで<b>画面の中にもう一つ枠</b>を作り、主役を囲む。視線が集中し、のぞき見ている感覚も出る。', prompt:'フレーム・イン・フレームの構図。開いたドア越しに女性が見え、周囲は暗い室内。' },
      { name:'前景を入れる', en:'Foreground Interest', desc:'手前にボケた植物・柵・人の肩などを入れると、<b>奥行きと臨場感</b>が出る。カメラが動くとパララックスも生まれる。', prompt:'手前にボケた花、中景にくっきりピントの合った被写体。被写界深度は浅く。' },
      { name:'ネガティブスペース（余白）', en:'Negative Space', desc:'被写体を小さく、周囲に大きな空白を残す。<b>孤独・静けさ・ミニマル</b>な印象。テキストを載せるスペースにもなる（サムネイル・広告）。', prompt:'ネガティブスペースを大きく取ったミニマルな構図。何もない空の右下に小さな人影。' },
      { name:'対角線構図', en:'Diagonal Composition', desc:'被写体や線を斜めに配置して<b>動き・勢い</b>を出す。スポーツや乗り物に。', prompt:'躍動感のある対角線構図。走る人が左下から右上へ、画面を斜めに横切るように傾いている。' },
      { name:'黄金比・黄金螺旋', en:'Golden Ratio / Fibonacci Spiral', desc:'1:1.618の比率や螺旋に沿って配置する。三分割法より少し外寄りで、自然で美しいとされる。', prompt:'黄金螺旋に沿った構図。被写体の目を螺旋の中心に置く。' },
      { name:'被写界深度（ボケ）', en:'Depth of Field / Bokeh', desc:'ピントが合う範囲の深さ。<b>浅い＝背景が大きくボケて主役が際立つ</b>（F値が小さい・望遠・近距離）。深い＝全体がくっきり（風景）。', prompt:'被写界深度の浅い映像（F1.8）。背景はとろけるようなボケで、被写体にはしっかりピントが合っている。' },
      { name:'レンズの焦点距離', en:'Focal Length (14mm / 35mm / 50mm / 85mm / 200mm)', desc:'<b>広角（14〜24mm）</b>＝広く写り遠近感が強い・ダイナミック／<b>標準（35〜50mm）</b>＝人の目に近い自然な見え方／<b>中望遠（85mm）</b>＝ポートレートの定番、背景がボケやすい／<b>望遠（200mm〜）</b>＝背景が圧縮されて近く見える。', prompt:'85mmレンズで撮影。顔が美しく見えるポートレートの圧縮効果で、背後の街の明かりはボケている。' },
    ]},
  ]
});
})();
