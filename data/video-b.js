/* 動画制作辞典 — B: トランジション / 編集技法 / カラーグレーディング / 照明 / テロップ */
(function(){
const TR = (cls) => `<div class="tr ${cls}"><div class="clip ca">A</div><div class="clip cb">B</div><div class="ov"></div></div>`;
const person = (x) => `<svg class="p" viewBox="140 112 40 48" style="left:calc(50% - 35px)"><use href="#vd-person"/></svg>`;
const timeline = (tracks) => `<div class="tl">${tracks.map(t => `<div class="lbl">${t[0]}</div><div class="trk">${t[1].map(s => `<span style="left:${s[0]}%;width:${s[1]}%;background:${s[2]}">${s[3]}</span>`).join('')}<i class="head"></i></div>`).join('')}</div>`;

TABS.push({
  id:'transition', label:'トランジション', icon:'⇢',
  intro:'カットとカットの<b>つなぎ方</b>。見本は青い「A」のカットからオレンジの「B」のカットへの切り替わりを繰り返しています。基本は<b>ただのカット（8割以上）</b>で、凝ったトランジションは場面転換やリズムを作りたいところだけに使うのがプロの使い方です。',
  sections:[
    { title:'基本のつなぎ', items:[
      { name:'カット', en:'Cut / Hard Cut', demo: TR('tr-cut'), tags:['基本','9割これ'],
        desc:'エフェクトなしで瞬時に切り替える。<b>最も自然で、テンポが良い</b>。編集のほとんどはカット。', prompt:'トランジションは基本カットのみで、テンポよくつないで。', code:'# FFmpeg：2本の動画をそのまま連結（同じコーデック・解像度の場合）\nffmpeg -f concat -safe 0 -i list.txt -c copy out.mp4\n# list.txt の中身： file \'a.mp4\'⏎ file \'b.mp4\'' },
      { name:'クロスディゾルブ（オーバーラップ）', en:'Cross Dissolve / Crossfade', demo: TR('tr-dissolve'), tags:['時間経過','余韻'],
        desc:'前のカットが薄れながら次のカットが浮かび上がる。<b>時間の経過・場所の移動・回想・余韻</b>。多用すると古くさく見える。', prompt:'シーンの変わり目は1秒のクロスディゾルブでつないで。', code:'ffmpeg -i a.mp4 -i b.mp4 -filter_complex "xfade=transition=fade:duration=1:offset=4" out.mp4\n# offset = 1本目の長さ − duration' },
      { name:'フェードアウト／イン（暗転）', en:'Dip to Black / Fade to Black', demo: TR('tr-dipb'), tags:['章の区切り','終わり'],
        desc:'一度真っ黒になってから次へ。<b>大きな区切り・時間の大きな経過・終幕</b>。動画の最初と最後にも使う。', prompt:'章の切り替わりでは0.5秒で暗転（dip to black）してから次の章へ。', code:'ffmpeg -i a.mp4 -i b.mp4 -filter_complex "xfade=transition=fadeblack:duration=1:offset=4" out.mp4' },
      { name:'ホワイトアウト', en:'Dip to White', demo: TR('tr-dipw'), tags:['回想','夢','天国'],
        desc:'真っ白に飛んでから次へ。回想・夢・記憶・爽やかな場面転換。', prompt:'回想シーンへの入りはホワイトアウトでつないで。', code:'xfade=transition=fadewhite:duration=1:offset=4' },
      { name:'フラッシュ（光）', en:'Flash / Light Leak', demo: TR('tr-flash'), tags:['勢い','MV'],
        desc:'一瞬白く光ってカットが変わる。カメラのシャッター、勢い、MVやダンス動画のビート合わせに。光漏れ素材（ライトリーク）を重ねる方法も。', prompt:'音楽のビートに合わせて、白いフラッシュでカットを切り替えて。' },
    ]},
    { title:'動きのあるトランジション', items:[
      { name:'ワイプ', en:'Wipe', demo: TR('tr-wipe'), tags:['スター・ウォーズ','明快'],
        desc:'境界線が画面を横切りながら次のカットに置き換わる。レトロで明快。斜め・円形・時計回りなど種類が多い。', prompt:'地域が切り替わる場面は、左から右へのワイプでつないで。', code:'xfade=transition=wipeleft:duration=.6:offset=4\n# 他: wiperight / wipeup / wipedown / slideleft / circleopen / radial / pixelize …' },
      { name:'プッシュ', en:'Push / Slide Push', demo: TR('tr-push'), tags:['スライド','ページ送り'],
        desc:'次のカットが前のカットを押し出す。スライドショー、手順説明、ページめくり感。', prompt:'手順の切り替えは右から左へ押し出すプッシュトランジションで。' },
      { name:'スライド（カバー）', en:'Slide / Cover', demo: TR('tr-slide'), tags:['重なる'],
        desc:'次のカットが上に乗るように滑り込む。前のカットは動かない。', prompt:'次の話題に移るときは、新しい画面が右から上に被さるスライドで。' },
      { name:'アイリス', en:'Iris In / Out', demo: TR('tr-iris'), tags:['円形','レトロ・アニメ'],
        desc:'円が広がって（または閉じて）切り替わる。昔のアニメや映画の終わり方、注目点を強調する演出に。', prompt:'エンディングは人物の顔を中心にアイリスアウト（円が閉じていく）で終わらせて。', code:'xfade=transition=circleopen:duration=.8:offset=4   # circleclose も可' },
      { name:'ズームトランジション', en:'Zoom Transition', demo: TR('tr-zoom'), tags:['勢い','旅行Vlog'],
        desc:'画面に突っ込むように拡大して次のカットへ。旅行Vlog、スポーツ、テンポの速い紹介動画で人気。', prompt:'旅行Vlogのカットのつなぎを、ブラー付きのズームイン・トランジションで勢いよく。' },
      { name:'ホイップパン・トランジション', en:'Whip Pan Transition', demo: TR('tr-whip'), tags:['シームレス'],
        desc:'両方のカットの端を高速パンにして、ブレの中でつなぐ。<b>場面が途切れず続いている</b>ように見せられる。', prompt:'2つのカットの最後と最初を右方向の高速パンで撮っておき、モーションブラーの中でつないで。' },
      { name:'スピン', en:'Spin Transition', demo: TR('tr-spin'), tags:['ポップ'],
        desc:'回転しながら次の画面へ。ポップ・コミカル。', prompt:'エンタメ動画の場面転換に、回転しながら切り替わるスピントランジションを使って。' },
      { name:'グリッチ', en:'Glitch Transition', demo: TR('tr-glitch'), tags:['デジタル','ゲーム実況'],
        desc:'デジタルノイズ・色ズレ・ブロックノイズで乱れて切り替わる。ゲーム・テクノ・ホラー・サイバー系。', prompt:'オープニングのロゴからタイトルへの切り替えに、RGBずれとブロックノイズのグリッチトランジションを入れて。' },
    ]},
    { title:'編集上のつなぎ技法', items:[
      { name:'ジャンプカット', en:'Jump Cut', demo:`<div class="tr tr-jump"><div class="clip"><svg class="p pa" viewBox="140 112 40 48"><use href="#vd-person"/></svg><svg class="p pb" viewBox="140 112 40 48"><use href="#vd-person"/></svg></div></div>`, tags:['YouTube語り','テンポ'],
        desc:'同じ構図のまま途中を切り取ってつなぐと、人物が<b>ピョンと跳んだように</b>見える。本来は避けるべきだが、YouTubeのトーク動画では無駄な間を削ってテンポを出す定番手法になった。', prompt:'トーク部分の「えー」「あの」や無音の間をカットして、ジャンプカットでテンポよくつないで。' },
      { name:'マッチカット', en:'Match Cut', demo:`<div class="tr tr-match"><div class="clip ca">月</div><div class="clip cb">ボール</div></div>`, tags:['形でつなぐ','知的'],
        desc:'<b>形・動き・色が似たもの</b>でつなぐ（月→ボール、回る時計→回る車輪）。場面が変わっても連続性が生まれ、印象に残る。', prompt:'夜空の満月から、同じ位置・大きさのオレンジ色のボールのカットへマッチカットでつないで。' },
      { name:'Jカット', en:'J-Cut', demo: timeline([['映像', [[0, 60, '#3b82f6', 'A'], [60, 40, '#f59e0b', 'B']]], ['音声', [[0, 42, '#1d4ed8', 'A'], [42, 58, '#d97706', 'B の音が先行']]]]), tags:['音が先','自然'],
        desc:'<b>次のカットの音が、映像より先に聞こえ始める</b>。タイムライン上で音声がJの字の形になる。会話や場面転換が自然になり、プロっぽい編集の基本。', prompt:'場面転換では、次のシーンの環境音を1秒前から先に入れるJカットにして。' },
      { name:'Lカット', en:'L-Cut', demo: timeline([['映像', [[0, 50, '#3b82f6', 'A'], [50, 50, '#f59e0b', 'B']]], ['音声', [[0, 70, '#1d4ed8', 'A の音が残る'], [70, 30, '#d97706', 'B']]]]), tags:['音が残る','会話'],
        desc:'<b>前のカットの音が、映像が切り替わった後も続く</b>。話している人から聞いている人の表情（リアクション）に切り替えるときの定番。', prompt:'インタビューは、話し手の声を残したまま聞き手のリアクションに切り替えるLカットを使って。' },
      { name:'カットバック（クロスカッティング）', en:'Cross-Cutting / Parallel Editing', demo: timeline([['映像', [[0, 20, '#3b82f6', 'A'], [20, 20, '#f59e0b', 'B'], [40, 20, '#3b82f6', 'A'], [60, 20, '#f59e0b', 'B'], [80, 20, '#3b82f6', 'A']]]]), tags:['同時進行','緊張感'],
        desc:'別の場所で同時に起きている2つの出来事を<b>交互に見せる</b>。追う者と追われる者、準備する2人など。だんだん短く切り替えると緊張感が高まる。', prompt:'主人公が駅へ走るシーンと、電車のドアが閉まりかけるシーンを交互に見せるカットバックで、だんだん間隔を短くして緊張感を高めて。' },
      { name:'スマッシュカット', en:'Smash Cut', tags:['落差','コメディ'], desc:'静かな場面から<b>いきなり騒がしい場面</b>へ（またはその逆）、前触れなく切り替える。落差で笑いや衝撃を生む。', prompt:'「絶対に行かない」と言った直後に、テーマパークで大はしゃぎしているカットへスマッシュカットで切り替えて。' },
      { name:'カッタウェイ', en:'Cutaway', tags:['補足','B-roll'], desc:'話の流れの途中で、<b>関連する別の映像</b>（手元、周りの景色、話題の物）を挟む。単調さを防ぎ、ジャンプカットを隠す役目もある。', prompt:'インタビュー中に話題に出た商品や工場の映像をカッタウェイとして挟んで。' },
    ]},
  ]
});

/* ---------- 編集技法 ---------- */
TABS.push({
  id:'edit', label:'編集技法', icon:'✂',
  intro:'速度・時間・画面の重ね方など、<b>編集ソフトで行う加工</b>の名前。DaVinci Resolve・Premiere Pro・CapCut・Final Cut Pro などで共通の用語です。',
  sections:[
    { title:'時間・速度', items:[
      { name:'スローモーション／早送り', en:'Slow Motion / Fast Motion', stage:'free', demo:`<div class="ed-lane ed-slow" style="top:0"><b>0.4x</b><i class="ed-ball" style="width:18px;height:18px;top:calc(50% - 9px)"></i></div><div class="ed-lane ed-normal" style="top:33.3%"><b>1.0x</b><i class="ed-ball" style="width:18px;height:18px;top:calc(50% - 9px)"></i></div><div class="ed-lane ed-fast" style="top:66.6%;border:0"><b>2.6x</b><i class="ed-ball" style="width:18px;height:18px;top:calc(50% - 9px)"></i></div>`, tags:['速度変更'],
        desc:'再生速度を変える。滑らかなスローには<b>撮影時に高フレームレート</b>（60/120fps）が必要。30fpsの素材を遅くするとカクつく（AIのフレーム補間で滑らかにできる）。', prompt:'着地の瞬間だけ0.25倍のスローモーションにして、その前後は等倍で。',
        code:'# 2倍速（映像と音声）\nffmpeg -i in.mp4 -filter_complex "[0:v]setpts=0.5*PTS[v];[0:a]atempo=2.0[a]" -map "[v]" -map "[a]" out.mp4\n# 0.5倍速（スロー）\nffmpeg -i in.mp4 -filter_complex "[0:v]setpts=2.0*PTS[v];[0:a]atempo=0.5[a]" -map "[v]" -map "[a]" out.mp4' },
      { name:'スピードランプ', en:'Speed Ramp', stage:'free', demo:'<div class="ed-ramp" style="position:absolute;inset:0"><i class="ed-ball"></i><span class="vd-badge">速→遅→速</span></div>', tags:['かっこいい','スポーツ・ダンス'],
        desc:'1つのクリップの中で<b>速度を滑らかに変化</b>させる（速い→スロー→速い）。アクションの見せ場を強調する。スポーツ、ダンス、旅行動画で人気。', prompt:'ジャンプの瞬間に向けて速度を2倍から0.3倍へ滑らかに落とし、着地後にまた2倍へ戻すスピードランプをかけて。' },
      { name:'フリーズフレーム（静止）', en:'Freeze Frame', stage:'free', demo:'<div class="ed-freeze" style="position:absolute;inset:0"><i class="ed-ball"></i><div class="flash"></div><span class="ff">⏸ 止める！</span></div>', tags:['紹介','オチ'],
        desc:'動画の1コマを止めて静止画にする。キャラ紹介（名前テロップを出す）、「これが私です」系のオチ、決定的瞬間の強調に。', prompt:'登場人物が初めて出てくるところで1.5秒フリーズフレームにして、名前と肩書きのテロップを出して。',
        code:'# 3秒の地点のフレームを画像に書き出す\nffmpeg -ss 3 -i in.mp4 -frames:v 1 frame.png' },
      { name:'逆再生', en:'Reverse', stage:'free', demo:'<div class="ed-rev" style="position:absolute;inset:0"><i class="ed-ball"></i><span class="vd-badge">◀◀ REVERSE</span></div>', tags:['不思議','ループ'],
        desc:'時間を巻き戻す。こぼれた水が戻る、ジャンプして高い所に乗る、など不思議な映像に。順再生と逆再生を往復させると「ブーメラン」。', prompt:'水をこぼす映像を逆再生して、水がコップに戻っていくように見せて。',
        code:'ffmpeg -i in.mp4 -vf reverse -af areverse out.mp4   # 長い動画はメモリを大量に使うので短く切ってから' },
      { name:'タイムラプス／ハイパーラプス', en:'Time-lapse / Hyperlapse', tags:['時間の圧縮'], desc:'長時間を数秒に圧縮。雲の流れ、日没、作業工程、街の人の流れ。撮影しながら移動するのがハイパーラプス。', prompt:'2時間の作業動画を30秒のタイムラプスにして。',
        code:'# 20倍速・音声なし\nffmpeg -i in.mp4 -vf "setpts=PTS/20" -an out.mp4' },
      { name:'ジェットカット（無音カット）', en:'Silence Removal', tags:['YouTube定番','自動化可'], desc:'話していない無音部分を自動・手動で切り詰めて、<b>テンポを上げる</b>。Premiereの文字起こしベース編集、DaVinciの無音検出、auto-editorなどで自動化できる。', prompt:'auto-editorを使って、トーク動画の無音部分（0.5秒以上）を自動でカットするコマンドを書いて。', code:'pip install auto-editor\nauto-editor input.mp4 --margin 0.2sec' },
    ]},
    { title:'画面の重ね方・合成', items:[
      { name:'分割画面', en:'Split Screen', stage:'free', demo:`<div class="ed-split"><div>${VD_SHOT(VD_VB.MS, '', 'A')}</div><div>${VD_SHOT('84 122 30 16.88', '', 'B')}</div></div>`, tags:['比較','同時'],
        desc:'画面を分割して複数の映像を同時に見せる。電話の2人、Before/After、同時進行、リアクション動画に。', prompt:'Before（左）とAfter（右）を左右分割画面で同時に再生して、中央に白い区切り線を入れて。',
        code:'ffmpeg -i left.mp4 -i right.mp4 -filter_complex "[0:v]scale=960:1080[l];[1:v]scale=960:1080[r];[l][r]hstack" out.mp4' },
      { name:'ピクチャー・イン・ピクチャー（ワイプ）', en:'Picture-in-Picture / Wipe', stage:'free', demo:`${VD_SHOT(VD_VB.LS)}<div class="ed-pip">${VD_SHOT(VD_VB.CU)}</div>`, tags:['ゲーム実況','解説'],
        desc:'メイン映像の隅に小さな別映像を重ねる。ゲーム実況の顔出し、解説者の表情、日本のバラエティでは「ワイプ」と呼ぶ。', prompt:'画面右下に、顔出しカメラの映像を幅30%の角丸のワイプで重ねて、白い枠線を付けて。',
        code:'ffmpeg -i main.mp4 -i face.mp4 -filter_complex "[1:v]scale=480:-1[pip];[0:v][pip]overlay=W-w-40:H-h-40" out.mp4' },
      { name:'クロマキー（グリーンバック）', en:'Chroma Key / Green Screen', stage:'free', demo:`<div class="ed-chroma"><div class="gs"><svg viewBox="140 112 40 48"><use href="#vd-person"/></svg></div><span class="arr">→</span><div class="bgc"><svg viewBox="96 100 128 72" preserveAspectRatio="xMidYMid slice"><use href="#vd-bg"/><use href="#vd-person"/></svg></div></div>`, tags:['合成','背景差し替え'],
        desc:'緑（または青）の背景を透明に抜いて、別の背景と合成する。服や小物に緑を使わないのが鉄則。最近はAIで背景を抜く（グリーンバック不要）方法も一般的。', prompt:'グリーンバックで撮った人物を、FFmpegのchromakeyで抜いて、背景画像と合成して。',
        code:'ffmpeg -i bg.mp4 -i green.mp4 -filter_complex "[1:v]chromakey=0x00ff00:0.15:0.1[fg];[0:v][fg]overlay" out.mp4' },
      { name:'マスク', en:'Masking', tags:['部分的な加工'], desc:'画面の一部だけを切り抜いて加工・合成する。顔だけぼかす、空だけ色を変える、人物を文字の前後に出す（テキストの奥行き演出）など。' , prompt:'人物の後ろに大きなタイトル文字を置き、人物をマスクで切り抜いて文字の手前に出す演出をして。' },
      { name:'モーショントラッキング', en:'Motion Tracking', tags:['追従'], desc:'映像内の動く物を自動で追跡し、テロップやモザイクを<b>動きに追従</b>させる。顔のモザイク、走る人に付く名前、商品を指す矢印に。', prompt:'通行人の顔にモーショントラッキングでぼかしを追従させて。' },
      { name:'スタビライズ（手ぶれ補正）', en:'Stabilization', tags:['補正'], desc:'手持ち映像の揺れを編集で補正する。画面の端が少し切り取られる（クロップされる）。', prompt:'手持ちで撮った映像を、DaVinci Resolveのスタビライザーで補正して。',
        code:'# FFmpeg（vidstab）2パス\nffmpeg -i in.mp4 -vf vidstabdetect -f null -\nffmpeg -i in.mp4 -vf vidstabtransform=smoothing=30 out.mp4' },
    ]},
    { title:'編集の考え方・ワークフロー', layout:'rows', items:[
      { name:'Aロール／Bロール', en:'A-roll / B-roll', desc:'<b>Aロール</b>＝メインの映像（インタビュー・語り）。<b>Bロール</b>＝その上に重ねる補足映像（作業風景・景色・物のアップ）。Bロールを挟むと単調にならず、話の内容が映像で伝わる。', prompt:'トーク（Aロール）の内容に合わせて、Bロールとして使えるカットのリストを作って（何を・どのサイズで撮るか）。' },
      { name:'モンタージュ', en:'Montage', desc:'短いカットを音楽に乗せて連続でつなぎ、<b>時間の経過や成長</b>を一気に見せる（特訓シーン、旅の思い出）。', prompt:'3か月の練習の様子を、BGMに合わせた30秒のモンタージュにまとめて。' },
      { name:'ラフカット → ファインカット', en:'Rough Cut → Fine Cut → Picture Lock', desc:'まず使う素材を大まかに並べ（ラフカット）、尺やテンポを詰め（ファインカット）、映像の確定（ピクチャーロック）後に音・色・テロップを仕上げる。', prompt:'編集の工程を、ラフカット→ファインカット→ピクチャーロック→音響→カラー→テロップ→書き出しのチェックリストにして。' },
      { name:'キーフレーム', en:'Keyframe', desc:'ある時点の値（位置・大きさ・不透明度・音量）を記録し、<b>2点間を自動で補間</b>して動かす仕組み。ズーム、テロップの動き、音量の変化はすべてキーフレームで作る。', prompt:'写真を0秒で100%、5秒で120%に拡大するキーフレームを打って、ゆっくりズームする（ケン・バーンズ効果）にして。' },
      { name:'ケン・バーンズ効果', en:'Ken Burns Effect', desc:'静止画にゆっくりしたズームやパンをかけて動きを出す。写真スライドショー、ドキュメンタリーの資料写真に。', prompt:'写真スライドショーの各写真に、ゆっくり寄りながら少し横に動くケン・バーンズ効果をかけて。', code:'ffmpeg -loop 1 -i photo.jpg -vf "zoompan=z=\'min(zoom+0.0015,1.3)\':d=150:s=1920x1080" -t 5 -pix_fmt yuv420p out.mp4' },
      { name:'プロキシ編集', en:'Proxy Editing', desc:'重い4K素材の代わりに<b>軽い低画質コピー（プロキシ）</b>で編集し、書き出し時に元素材に差し替える。パソコンが重いときの定番。', prompt:'4K素材が重いので、DaVinci Resolveでプロキシを生成して編集する手順を教えて。' },
      { name:'マルチカム', en:'Multi-cam Editing', desc:'複数のカメラで同時に撮った映像を<b>音で同期</b>させ、スイッチャーのように切り替えて編集する。対談・ライブ・ポッドキャスト収録に。', prompt:'3台のカメラで撮った対談を、音声波形で同期してマルチカム編集する手順を教えて。' },
      { name:'書き出し（レンダリング・エンコード）', en:'Export / Render / Encode', desc:'編集結果を1本の動画ファイルにすること。<b>解像度・フレームレート・コーデック・ビットレート</b>を投稿先に合わせて設定する（「仕様・規格」タブ参照）。', prompt:'YouTube用に、1080p・30fps・H.264・ビットレート10Mbps・音声AAC 320kbpsで書き出す設定にして。' },
    ]},
  ]
});

/* ---------- カラーグレーディング ---------- */
const CG_PREVIEW = `<div class="cg"><div class="scene"><svg viewBox="40 40 240 135" preserveAspectRatio="xMidYMid slice"><use href="#vd-bg"/><use href="#vd-person"/></svg></div><div class="ov"></div><span class="cg-date">'26 10 22  PM 6:42</span></div>`;
const CG = [
  { label:'オリジナル', en:'Original / Rec.709', cls:'g-none', desc:'補正なしの状態。比較の基準。撮って出しの素材は意外と地味なことが多い。', prompt:'色補正なしの自然な色で。' },
  { label:'ティール＆オレンジ', en:'Teal & Orange', cls:'g-teal', tags:['ハリウッド','定番'], desc:'影を青緑（ティール）、肌やハイライトをオレンジに寄せる。<b>補色で人物が背景から浮き立つ</b>、ハリウッド大作の定番ルック。', prompt:'映画のようなティール＆オレンジのカラーグレーディング。影は青緑、肌は暖かいオレンジに。' },
  { label:'ブリーチバイパス', en:'Bleach Bypass', cls:'g-bleach', tags:['戦争映画','硬派'], desc:'彩度を落としてコントラストを強める。銀残しとも。ざらついた硬派な質感（戦争映画、スリラー）。', prompt:'ブリーチバイパス風のルック。彩度を落とし、コントラストを強めて、ざらついた質感に。' },
  { label:'フィルムルック', en:'Film Look / Faded Film', cls:'g-film', tags:['エモい','Vlog'], desc:'黒を少し浮かせ（黒つぶれさせない）、彩度を少し下げ、暖色に寄せる。フィルムカメラ風の柔らかくエモい雰囲気。', prompt:'暖かく色あせたフィルムルック。黒を少し浮かせ、コントラストは柔らかく、Kodak Portra 400のような色で、うっすらフィルムの粒子を入れる。' },
  { label:'クール・ブルー', en:'Cool Blue Tone', cls:'g-cool', tags:['冷たさ','SF'], desc:'全体を青く寒色に。冷たさ・孤独・未来感・夜明け前。', prompt:'冷たい青のカラーグレード。彩度を落とし、物憂げで孤独な雰囲気に。' },
  { label:'モノクロ・ノワール', en:'Black & White / Film Noir', cls:'g-noir', tags:['白黒','高コントラスト'], desc:'白黒＋強いコントラスト＋周辺減光。1940年代のフィルム・ノワール、ミステリー、アート作品に。', prompt:'高コントラストの白黒フィルム・ノワール風。深い影と強い周辺減光。' },
  { label:'セピア・ヴィンテージ', en:'Sepia / Vintage', cls:'g-sepia', tags:['昔','回想'], desc:'茶色がかった古い写真の色。回想・昔話・歴史。', prompt:'柔らかい茶色の周辺減光が入った、古い写真のようなセピア調。' },
  { label:'ハイキー', en:'High Key', cls:'g-highkey', tags:['明るい','爽やか'], desc:'全体を明るく、影を少なく。清潔・爽やか・幸せ。化粧品・ウェディング・医療系。', prompt:'明るいハイキーのルック。影は柔らかく、軽やかで清潔感のある映像に。' },
  { label:'ローキー', en:'Low Key', cls:'g-lowkey', tags:['暗い','ドラマチック'], desc:'全体を暗く、光の当たる部分だけ浮かび上がらせる。緊張・ミステリー・高級感。', prompt:'ローキーのルック。画面のほとんどが暗く、被写体だけにスポットのような光が当たっている。' },
  { label:'クロスプロセス', en:'Cross Processing', cls:'g-cross', tags:['個性的','90年代'], desc:'色がずれた派手な発色（黄緑・シアン寄り）。90年代のファッション写真やMVのような尖った雰囲気。', prompt:'クロスプロセス風のフィルムルック。緑と黄色に色がずれ、彩度とコントラストは高め。' },
  { label:'マトリックス風グリーン', en:'Matrix Green Tint', cls:'g-matrix', tags:['デジタル世界'], desc:'全体を緑がかったトーンに。デジタル世界・病院・不穏。', prompt:'映画マトリックスのような緑がかったデジタルなルック。冷たく人工的な雰囲気。' },
  { label:'パステル・ドリーミー', en:'Pastel / Dreamy', cls:'g-pastel', tags:['かわいい','夢'], desc:'彩度とコントラストを下げ、ピンクと水色を乗せて柔らかく。かわいい系Vlog、ファンタジー。', prompt:'柔らかいパステル調の夢のようなグレード。コントラストは低く、ピンクと淡い水色を乗せ、ふんわりと光をにじませる。' },
  { label:'デイ・フォー・ナイト', en:'Day for Night', cls:'g-night', tags:['擬似夜景'], desc:'昼に撮った映像を暗く青くして<b>夜に見せる</b>古典的な手法。', prompt:'デイ・フォー・ナイトのグレード。昼に撮った映像を暗くして深い青に染め、月夜のように見せる。' },
  { label:'ゴールデンアワー', en:'Golden Hour Warm', cls:'g-golden', tags:['夕日','温かさ'], desc:'夕方の金色の光のような暖かいトーン。ノスタルジー・青春・幸福感。', prompt:'ゴールデンアワーの暖かいグレード。琥珀色に輝く日差しと、柔らかいレンズフレア。' },
  { label:'ビビッド', en:'Vivid / Punchy', cls:'g-vivid', tags:['鮮やか','旅行'], desc:'彩度とコントラストを上げて鮮やかに。旅行・食べ物・スポーツ・子ども向け。', prompt:'鮮やかでメリハリのある色。彩度は高く、明るく元気な旅行動画のルックに。' },
  { label:'サイバーパンク', en:'Cyberpunk Magenta/Cyan', cls:'g-cyber', tags:['ネオン','夜の街'], desc:'マゼンタとシアンのネオン色に寄せる。夜の都市、SF、ゲーム。', prompt:'ネオンのマゼンタとシアンを効かせたサイバーパンク風のカラーグレード。高コントラストの夜の街の雰囲気。' },
  { label:'Log（未補正素材）', en:'Log Footage (flat)', cls:'g-log', tags:['撮影用','要補正'], desc:'S-Log・V-Log・C-Logなどで撮った<b>補正前の眠い映像</b>。明暗の情報を多く残すためにわざと低コントラストで記録されている。LUTを当てて通常の見た目に戻してから仕上げる。', prompt:'S-Log3で撮った素材なので、まずメーカー純正の変換LUTでRec.709に戻してから色を調整して。' },
  { label:'VHS・ホームビデオ', en:'VHS / Camcorder', cls:'g-vhs', tags:['レトロ','90年代'], desc:'にじみ・走査線・色ずれ・日付表示。90年代のホームビデオ風、ノスタルジー、ホラー（ファウンド・フッテージ）。', prompt:'90年代のVHSホームビデオ風。走査線、色ずれ、柔らかいにじみ、画面の隅に日付表示。' },
];

TABS.push({
  id:'color', label:'カラーグレーディング', icon:'◑',
  intro:'映像の<b>色の雰囲気（ルック）</b>を作る工程。下のタブで同じ映像の色が切り替わります（CSSのフィルターで再現した近似です）。AI動画・画像生成でも英語名がそのままスタイル指定として使えます。',
  sections:[
    { title:'ルック切替プレビュー', note:'タブ＝カラーグレードの種類。右側に雰囲気・用途・英語プロンプトを表示します。',
      custom:(el) => VD.switcher(el, { preview: CG_PREVIEW, options: CG }) },
    { title:'色の用語', layout:'rows', items:[
      { name:'カラーコレクション（色補正）', en:'Color Correction', desc:'撮影ごとのばらつきを直して<b>正しい・揃った色</b>にする工程（露出、ホワイトバランス、カット間の色合わせ）。グレーディングの前に行う。', prompt:'まずカラーコレクションで全カットの露出とホワイトバランスを揃えてから、ティール＆オレンジのグレーディングをかけて。' },
      { name:'カラーグレーディング', en:'Color Grading', desc:'補正済みの映像に<b>雰囲気・感情を与える色作り</b>。映画の「ルック」を作る創造的な工程。' },
      { name:'LUT（ルックアップテーブル）', en:'LUT (.cube)', desc:'色の変換表のファイル。<b>当てるだけで決まったルックや変換</b>ができる。Logを通常の色に戻す「変換LUT」と、雰囲気を付ける「クリエイティブLUT」がある。', prompt:'FFmpegで .cube のLUTを動画に適用して。', code:'ffmpeg -i in.mp4 -vf lut3d=film.cube out.mp4' },
      { name:'ホワイトバランス／色温度', en:'White Balance / Color Temperature (K)', desc:'白を白く写すための調整。数値（ケルビン）が低いほど暖色の光：ろうそく約1,900K、電球約3,000K、昼光約5,500K、曇り約6,500K、日陰約7,500K。', prompt:'室内の電球の光でオレンジに転んでいるので、色温度を3200K相当に補正して白を白く戻して。' },
      { name:'露出・コントラスト・彩度', en:'Exposure / Contrast / Saturation', desc:'<b>露出</b>＝全体の明るさ。<b>コントラスト</b>＝明暗の差。<b>彩度</b>＝色の鮮やかさ。<b>自然な彩度（Vibrance）</b>は肌色を守りながら鮮やかにできる。', code:'ffmpeg -i in.mp4 -vf "eq=brightness=0.05:contrast=1.15:saturation=1.2" out.mp4' },
      { name:'リフト・ガンマ・ゲイン', en:'Lift / Gamma / Gain (Shadows / Midtones / Highlights)', desc:'影・中間・明部をそれぞれ調整するカラーホイール。<b>影に青、明部にオレンジ</b>を足せばティール＆オレンジになる。', prompt:'DaVinci Resolveのカラーホイールで、Liftを少し青緑、Gainを少しオレンジに寄せる手順を教えて。' },
      { name:'スコープ（波形・ベクトル）', en:'Waveform / Vectorscope / Histogram', desc:'目ではなく<b>グラフで明るさや色を確認</b>する道具。波形で白飛び・黒つぶれ、ベクトルスコープで肌色ライン（スキントーンライン）を確認する。' },
      { name:'白飛び・黒つぶれ', en:'Clipping / Crushed Blacks', desc:'明るすぎて真っ白になり情報が消えるのが白飛び、暗すぎて真っ黒になるのが黒つぶれ。<b>撮影時に白飛びさせない</b>のが大事（後から戻せない）。' },
      { name:'8bit／10bit', en:'Bit Depth', desc:'色の階調の細かさ。8bit＝約1,677万色、10bit＝約10億色。10bitの方が<b>グレーディングしても空のグラデーションに縞（バンディング）が出にくい</b>。Log撮影は10bit推奨。' },
      { name:'フィルムグレイン', en:'Film Grain', desc:'映画フィルムの粒子感を足す。デジタルののっぺり感を消し、上質でシネマティックな印象に。', code:'ffmpeg -i in.mp4 -vf "noise=alls=8:allf=t" out.mp4' },
    ]},
  ]
});

/* ---------- 照明 ---------- */
const plan = (lights) => `<svg class="lt-plan" viewBox="0 0 120 120"><circle cx="60" cy="52" r="10" fill="#e6ae84"/><text x="52" y="72">被写体</text>
  <g transform="translate(60 106)"><rect x="-8" y="-5" width="16" height="10" rx="2" fill="#888"/><text x="-12" y="14">カメラ</text></g>
  ${lights.map(l => `<line x1="${l[0]}" y1="${l[1]}" x2="60" y2="52" stroke="${l[3] || '#ffd166'}" stroke-width="1" stroke-dasharray="3 2" opacity=".8"/><circle cx="${l[0]}" cy="${l[1]}" r="6" fill="${l[3] || '#ffd166'}"/><text x="${l[0] + (l[0] > 60 ? -6 : -6)}" y="${l[1] + (l[1] > 52 ? 16 : -9)}">${l[2]}</text>`).join('')}</svg>`;
const face = (vars, extraCls) => `<div class="lt ${extraCls || ''}"><div class="lt-face" style="${vars}"><div class="head"></div><div class="hair"></div><div class="eye l"></div><div class="eye r"></div><div class="nose"></div><div class="mouth"></div><div class="tri"></div></div>`;
const light = (vars, lights, cls) => face(vars, cls) + plan(lights) + '</div>';

TABS.push({
  id:'light', label:'照明・ライティング', icon:'☀',
  intro:'光の<b>当て方のパターン</b>。顔の陰影と、上から見た照明の配置図（黄色＝ライト）で示しています。写真・動画・AI画像生成のどれでも、名前を指定するだけで雰囲気を伝えられます。',
  sections:[
    { title:'人物ライティングの基本パターン', items:[
      { name:'三点照明', en:'Three-Point Lighting', demo: light('--lx:28%;--ly:32%;--rim:inset -5px -2px 8px -3px #fff8', [[22, 30, 'キー'], [100, 34, 'フィル', '#fff3c4'], [78, 10, 'バック', '#cfe8ff']]), tags:['基本','インタビュー'],
        desc:'<b>キーライト</b>（主光源・斜め前）、<b>フィルライト</b>（影を和らげる補助・反対側）、<b>バックライト</b>（後ろから輪郭を光らせ背景と分離）の3灯。インタビューや商品撮影の基本形。', prompt:'三点照明。左前から柔らかいキーライト、右から控えめなフィルライト、後ろからリムライトを当てて、人物を背景から浮き立たせる。' },
      { name:'レンブラントライト', en:'Rembrandt Lighting', demo: light('--lx:20%;--ly:22%;--nx:100deg', [[18, 18, 'キー']], 'lt-rembrandt'), tags:['絵画的','陰影'],
        desc:'斜め上45度から当て、<b>影側の頬に小さな光の三角形</b>ができる。画家レンブラントの肖像画のような重厚でドラマチックな陰影。', prompt:'レンブラントライト。斜め上45度からキーライトを当て、影側の頬に小さな光の三角形ができる、ドラマチックな肖像。' },
      { name:'バタフライライト', en:'Butterfly / Paramount Lighting', demo: light('--lx:50%;--ly:8%;--nx:180deg', [[60, 22, 'キー（正面上）']]), tags:['美しく','ビューティー'],
        desc:'正面の高い位置から当て、<b>鼻の下に蝶の形の影</b>ができる。頬骨が際立ち美しく見える。ビューティー・ファッション・往年のハリウッド女優。', prompt:'バタフライライト。カメラの真上から光を当て、鼻の下に小さな蝶の形の影ができる、華やかなビューティーポートレート。' },
      { name:'スプリットライト', en:'Split Lighting', demo: light('--lx:-10%;--ly:45%;--nx:90deg', [[8, 52, 'キー（真横）']]), tags:['二面性','ミステリー'],
        desc:'真横から当て、<b>顔の半分が明るく半分が暗い</b>。二面性・葛藤・悪役・ミステリアス。', prompt:'スプリットライト。真横から光を当て、顔のちょうど半分が明るく、半分が深い影に沈む、ミステリアスな雰囲気。' },
      { name:'ループライト', en:'Loop Lighting', demo: light('--lx:32%;--ly:22%;--nx:120deg', [[34, 18, 'キー']]), tags:['自然','万能'],
        desc:'キーライトを少し横・少し上から当て、鼻の影が頬に小さな輪を作る。<b>自然で誰にでも似合う</b>万能型。', prompt:'ループライト。キーライトを少し上・少し横から当てた、自然で顔が美しく見えるポートレート。' },
      { name:'リムライト（逆光）', en:'Rim Light / Backlight', demo: light('--lx:50%;--ly:130%;--rim:inset 6px 0 8px -4px #fff, inset -6px 0 8px -4px #fff, inset 0 6px 8px -4px #fffa', [[60, 8, 'バック', '#cfe8ff']]), tags:['輪郭','かっこいい'],
        desc:'被写体の後ろから当てて<b>輪郭だけを光らせる</b>。背景からの分離、神秘性、かっこよさ。髪の毛が光る。', prompt:'後ろから強いリムライトを当て、髪と肩の輪郭を光らせる。背景は暗く、映画的に。' },
      { name:'下からの照明（ホラー）', en:'Under Lighting / Horror Lighting', demo: light('--lx:50%;--ly:118%;--nx:0deg', [[60, 92, 'キー（下）']]), tags:['不気味','怪談'],
        desc:'顎の下から照らす。普段ありえない影の付き方で<b>不気味・怖い</b>。懐中電灯で怪談を話す顔。', prompt:'顎の下からの照明。懐中電灯を顔の下から当てたような、不気味なホラー照明。' },
      { name:'シルエット', en:'Silhouette', demo: light('', [[60, 6, '強い逆光', '#ffb46b']], 'lt-sil'), tags:['夕日','象徴的'],
        desc:'明るい背景の前で被写体を真っ黒に。<b>形だけで語る</b>象徴的な映像。夕日・窓辺・ドラマのクライマックス。', prompt:'明るいオレンジ色の夕焼け空を背にした人物のシルエット。人物は真っ黒で細部は見えない。' },
      { name:'カラーゲル（2色ライト）', en:'Colored Gels / Dual-tone Lighting', demo: light('--lx:20%;--ly:40%;--tint:linear-gradient(90deg, #ff2bd6, #00e5ff)', [[14, 40, 'マゼンタ', '#ff2bd6'], [106, 40, 'シアン', '#00e5ff']]), tags:['MV','ネオン'],
        desc:'色付きのフィルム（ゲル）やRGBライトで<b>左右から違う色</b>を当てる。MV、ゲーム実況、サイバーパンク、クラブ。', prompt:'2色のライティング。左からマゼンタ、右からシアンの光を当てた、ネオン風のミュージックビデオのスタイル。' },
    ]},
    { title:'光の種類・状況', layout:'rows', items:[
      { name:'ハードライト／ソフトライト', en:'Hard Light / Soft Light', desc:'<b>ハード</b>＝小さく強い光源（直射日光・裸電球）で影がくっきり、力強い。<b>ソフト</b>＝大きく拡散した光源（曇り空・窓・ソフトボックス）で影が柔らかく、優しい・美しい。人物はソフトが基本。', prompt:'柔らかく拡散した窓からの光。影はやさしく、自然で美しく見える。' },
      { name:'ゴールデンアワー', en:'Golden Hour', desc:'日の出後・日の入り前の約1時間。<b>低く暖かい金色の光</b>で、長い影と柔らかい逆光。最も美しいとされる時間帯。', prompt:'ゴールデンアワーの日差し。低い太陽の暖かい光を後ろから受け、長い影が伸び、髪が光る。' },
      { name:'ブルーアワー', en:'Blue Hour', desc:'日没直後・日の出前の、空が深い青になる短い時間。街の明かりと青空のバランスが美しい。', prompt:'ブルーアワーの街並み。深い青の空に、暖かい街の明かりが灯り始める。' },
      { name:'プラクティカルライト', en:'Practical Light', desc:'画面内に映り込む照明（デスクランプ・ネオン看板・キャンドル・テレビ）。<b>光の出どころに説得力</b>が出て、雰囲気が増す。', prompt:'画面に映る照明だけで照らす。暖かいデスクランプと、パソコン画面の光。' },
      { name:'モチベーテッドライト', en:'Motivated Lighting', desc:'「窓から差す光」「暖炉の火」など、<b>画面の中の光源から来ているように見せる</b>照明。不自然さを消すための考え方。', prompt:'モチベーテッドライト。左の窓から差し込んでいるように見える、柔らかい昼の光。' },
      { name:'ボリューメトリックライト（光芒）', en:'Volumetric Light / God Rays', desc:'煙や霧の中を通る光の筋。教会の窓、森の木漏れ日、ライブのスモーク。神々しさ・幻想的。', prompt:'森の木々の間から差し込む光の筋（ゴッドレイ）。空気にうっすら霞がかかっている。' },
      { name:'ハイキー照明／ローキー照明', en:'High-key / Low-key Lighting', desc:'ハイキー＝全体を明るく影少なめ（コメディ・広告）。ローキー＝暗部が多く一部だけ照らす（ノワール・スリラー）。', prompt:'ローキー照明。画面のほとんどが影で、顔にだけ硬い光が1つ当たる、フィルム・ノワール風。' },
      { name:'レフ板', en:'Reflector', desc:'光を反射させて影を明るくする板。白（自然）・銀（強め）・金（暖色）。一番安くて効果の大きい照明機材。', prompt:'屋外の逆光ポートレートで、白いレフ板で顔の影を起こす撮り方を教えて。' },
      { name:'キャッチライト', en:'Catchlight', desc:'瞳に映り込む光の点。<b>目に生気</b>が宿る。リングライトだと輪の形になる。', prompt:'大きなソフトボックスによる明るいキャッチライトが瞳に映り、生き生きとした表情に。' },
    ]},
  ]
});

/* ---------- テロップ・モーショングラフィックス ---------- */
TABS.push({
  id:'telop', label:'テロップ・モーグラ', icon:'T',
  intro:'動画に重ねる<b>文字（テロップ・字幕）と動くグラフィック（モーショングラフィックス）</b>の種類。見本はCSSで再現しています。After Effects・Premiere・CapCut のほか、Remotion（React）やHTML/CSSでも作れます。',
  sections:[
    { title:'テロップ・字幕のスタイル', items:[
      { name:'ローワーサード（名前テロップ）', en:'Lower Third', stage:'free', demo:'<div class="mg photo"><div class="mg-lower"><b>山田 花子</b><span>株式会社サンプル 代表取締役</span></div></div>', tags:['定番','インタビュー'],
        desc:'画面の下3分の1に出す、<b>話している人の名前と肩書き</b>。帯がスッと伸びて表示される。', prompt:'インタビュー動画に、左下からスライドで伸びて出てくる赤い帯の名前テロップ（名前＋肩書きの2段）を作って。Remotionで。' },
      { name:'バラエティ風テロップ', en:'Japanese Variety Show Caption', stage:'free', demo:'<div class="mg photo"><div class="mg-variety">それな〜！！</div></div>', tags:['日本特有','強調'],
        desc:'<b>太い縁取り（二重フチ）・黄色や白の極太文字・ポンッと弾む登場</b>。日本のテレビ・YouTubeのお笑い系で必須。セリフを強調したり、ツッコミを入れたりする。', prompt:'バラエティ番組風のテロップを作って。極太の丸ゴシック、黄色の文字に赤の太いフチ＋黒い影、ポンッと弾んで登場（オーバーシュート）させて。',
        code:'.telop { font: 900 48px "M PLUS Rounded 1c"; color:#ffe600;\n  -webkit-text-stroke: 10px #d7002a; paint-order: stroke fill;  /* フチを文字の外側に */\n  text-shadow: 0 6px 0 #000; }' },
      { name:'ニュース風テロップ', en:'News Lower Third + Ticker', stage:'free', demo:'<div class="mg photo"><div class="mg-news"><div class="bar">新サービス 本日スタート</div><div class="tick"><span>【速報】AIで動画編集が自動化 ／ 明日の天気は晴れ ／ 株価は小幅に上昇 ／</span></div></div></div>', tags:['報道','信頼感'],
        desc:'青い帯の見出しと、下を流れる速報（ティッカー）。信頼感・公式感を出したい解説動画に。', prompt:'ニュース番組風に、画面下に青い見出し帯と、その下を右から左に流れる速報ティッカーを作って。' },
      { name:'シネマ字幕', en:'Cinematic Subtitles + Letterbox', stage:'free', demo:'<div class="mg"><div class="mg-cine"><p>「もう一度、ここから始めよう。」</p></div></div>', tags:['映画風','シネスコ'],
        desc:'上下の黒帯（レターボックス）と、控えめな白い字幕。映画的・エモい雰囲気。字幕は細めの文字に薄い影。', prompt:'映画風に上下に黒帯を入れて2.39:1にし、下中央に細めの白い字幕（薄い影付き）を表示して。' },
      { name:'YouTube字幕風', en:'Closed Caption Style', stage:'free', demo:'<div class="mg photo"><div class="mg-yt"><p>今日は簡単なパスタの作り方を紹介します</p></div></div>', tags:['読みやすさ','アクセシビリティ'],
        desc:'半透明の黒い背景に白い文字。<b>どんな映像の上でも読める</b>。音声なしで見る人（SNSのミュート再生）向けに、全編字幕は今や必須。', prompt:'全編に、半透明の黒背景＋白文字の読みやすい字幕を付けて。Whisperで文字起こししたSRTから焼き込んで。',
        code:'# SRT字幕を映像に焼き込む（フォント・サイズ指定）\nffmpeg -i in.mp4 -vf "subtitles=sub.srt:force_style=\'FontName=Noto Sans JP,FontSize=22,BorderStyle=3,BackColour=&H80000000\'" out.mp4' },
      { name:'Vlog風テロップ', en:'Handwritten Vlog Caption', stage:'free', demo:'<div class="mg photo"><div class="mg-vlog">朝カフェ ☕ 9:30</div></div>', tags:['ゆるい','おしゃれ'],
        desc:'手書き風フォント、マスキングテープ風の装飾、少し傾けた配置。日常系・カフェ・旅行Vlogのゆるくておしゃれな雰囲気。', prompt:'Vlog風のテロップを作って。手書き風フォント（Klee One）、生成り色の小さなラベルに少し傾けて、上にピンクのマスキングテープ風の装飾。' },
      { name:'キネティックタイポグラフィ', en:'Kinetic Typography', stage:'free', demo:'<div class="mg"><div class="mg-kinetic"><span>言葉が</span><span>動く</span><span>リズムで</span><span>伝わる</span></div></div>', tags:['MV','広告'],
        desc:'<b>言葉そのものを音やリズムに合わせて動かす</b>表現。歌詞動画（リリックビデオ）、広告、プレゼン動画で強い印象を残す。', prompt:'ナレーションに合わせて、単語が1つずつ大きく回転しながら飛び込んでくるキネティックタイポグラフィの動画をRemotionで作って。' },
      { name:'集中線（効果線）', en:'Speed Lines / Focus Lines', stage:'free', demo:'<div class="mg-speed-wrap"><div class="mg-speed"></div><b>まさかの結果！</b></div>', tags:['漫画的','日本的'],
        desc:'漫画の集中線を背景にして、<b>衝撃・驚き・強調</b>を表現。バラエティやゲーム実況で多用。CSSなら repeating-conic-gradient で作れる。', prompt:'驚きの場面で、画面の中央に向かう白黒の集中線を背景に出し、細かく震わせて。',
        code:'.speedlines { background: repeating-conic-gradient(from 0deg at 50% 50%, #000 0deg 1.2deg, transparent 1.2deg 6deg);\n  mask: radial-gradient(circle, transparent 22%, #000 55%); }' },
    ]},
    { title:'モーショングラフィックス', items:[
      { name:'タイトルカード', en:'Title Card / Opening Title', stage:'free', demo:'<div class="mg"><div class="mg-title"><h6>THE JOURNEY</h6></div></div>', tags:['オープニング'],
        desc:'作品タイトルを見せる画面。<b>文字間がゆっくり広がりながらフェードイン</b>するのは映画の定番。', prompt:'黒背景に細い明朝体の白いタイトルを、ぼかしから浮かび上がりつつ文字間がゆっくり広がる演出で4秒表示して。' },
      { name:'ロゴリビール', en:'Logo Reveal / Logo Sting', stage:'free', demo:'<div class="mg"><div class="mg-logo"><div class="w"></div><div class="c">VD</div></div></div>', tags:['ブランド','冒頭・末尾'],
        desc:'ロゴが印象的に登場する数秒の演出。チャンネルや企業動画の冒頭・最後に。ジングル音（効果音）とセットで。', prompt:'円形のワイプが広がって閉じた後に、ロゴがバネのように弾んで登場する3秒のロゴリビールを作って。' },
      { name:'カウントダウン', en:'Countdown', stage:'free', demo:'<div class="mg"><div class="mg-count"><b class="n">3</b></div></div>', tags:['ライブ配信','開始'],
        init:(el) => { const n = el.querySelector('.n'); let k = 3, alive = true; const t = setInterval(() => { if (!alive) return; k = k <= 1 ? 3 : k - 1; n.textContent = k; }, 1000); return () => { alive = false; clearInterval(t); }; },
        desc:'3・2・1の数字と回る針。ライブ配信の開始待ち、ゲームのスタート、レトロなフィルムリーダー風。', prompt:'フィルムリーダー風のカウントダウン（3→2→1、円の中を針が回る）を作って。' },
      { name:'コールアウト（指し示し）', en:'Callout / Highlight Circle', stage:'free', demo:`${VD_SHOT(VD_VB.LS)}<div class="mg-call"><svg viewBox="0 0 300 170" preserveAspectRatio="none"><path d="M80 40 Q140 30 170 60"/></svg><div class="ring"></div><div class="tag">ここに注目！</div></div>`, tags:['解説','チュートリアル'],
        desc:'画面の一部を<b>丸で囲む・矢印で指す・周りを暗くする</b>。操作説明、チュートリアル、商品の特徴紹介に。', prompt:'画面録画の解説動画で、クリックする場所を赤い丸で囲み、矢印が伸びて「ここをクリック」とラベルが出るコールアウトを入れて。' },
      { name:'パンチイン（強調ズーム）', en:'Punch-in Zoom', stage:'free', demo:'<div class="mg photo"><div class="mg-punch"><b>ここ大事！</b></div></div>', tags:['強調','YouTube'],
        desc:'大事な一言の瞬間に、画面（や文字）を<b>ガッと拡大して少し揺らす</b>。トーク動画のメリハリ付けの定番。', prompt:'トーク動画で強調したいセリフの瞬間に、画面を1.3倍にパンチインして小さく揺らし、太いフチ付きテロップを出して。' },
      { name:'チャプタータイトル', en:'Chapter Title', stage:'free', demo:'<div class="mg"><div class="mg-chap"><small>CHAPTER 02</small><b>準備するもの</b><i></i></div></div>', tags:['章立て','構成'],
        desc:'章の始まりを示す見出し。長い動画の構成が分かり、離脱を防ぐ。YouTubeの概要欄のチャプター（タイムスタンプ）と合わせると親切。', prompt:'各章の頭に、章番号と章タイトルが左からスライドインし、下線が伸びるチャプタータイトルを入れて。' },
      { name:'チャプター進行バー', en:'Progress / Chapter Bar', stage:'free', demo:`${VD_SHOT(VD_VB.MS)}<div class="mg-prog"><div><span class="fill"></span>導入</div><div>準備</div><div>実践</div><div>まとめ</div></div>`, tags:['ショート動画','離脱防止'],
        desc:'画面下に今どの章かを示すバー。ショート動画や解説動画で「あとどれくらいか」が分かり、最後まで見てもらいやすくなる。', prompt:'画面下に「導入・準備・実践・まとめ」の4区切りの進行バーを常時表示し、再生位置に合わせて赤く塗りつぶして。' },
      { name:'チャンネル登録の誘導', en:'Subscribe Animation / CTA', stage:'free', demo:'<div class="mg photo"><div class="mg-sub"><span class="btn">チャンネル登録</span><span class="cur">👆</span></div></div>', tags:['CTA','終盤'],
        desc:'カーソルが登録ボタンを押す小さなアニメーション。動画の終盤や区切りで<b>次の行動（CTA）</b>を促す。', prompt:'動画の最後に、手のカーソルが「チャンネル登録」ボタンを押して灰色に変わるアニメーションを表示して。' },
    ]},
    { title:'テロップ作りのルール', layout:'rows', items:[
      { name:'セーフエリア', en:'Title Safe / Action Safe', desc:'画面の端は機器やUIで隠れることがあるので、<b>文字は内側90%（タイトルセーフ）</b>に収める。縦動画はSNSのボタン・説明文が重なる右側と下部を避ける（「仕様・規格」タブ参照）。', prompt:'テロップは画面端から5%以上内側（タイトルセーフ）に収めて。TikTok用は右側と下部20%を避けて。' },
      { name:'表示時間の目安', en:'Reading Speed', desc:'日本語字幕は<b>1秒あたり4文字程度</b>が読みやすい目安（映画字幕の基準）。1行は13〜16文字、最大2行。短すぎる表示は読めない。', prompt:'字幕は1行最大16文字・2行まで、1秒4文字以上の速さにならないよう分割して。' },
      { name:'フォントの選び方', en:'Font Choice', desc:'基本は<b>太めのゴシック体</b>（視認性）。感情や雰囲気で使い分け：明朝＝上品・シリアス、丸ゴシック＝やさしい・かわいい、手書き＝親しみ、極太＝バラエティ。商用利用OKのフォントを使う。', prompt:'テロップのフォントを、通常セリフはNoto Sans JP Bold、強調はM PLUS Rounded 1c Black、心の声は明朝体で使い分けて。' },
      { name:'縁取り（フチ）と影', en:'Stroke / Outline / Drop Shadow', desc:'背景に関係なく読めるように、文字に<b>フチ（ストローク）や影</b>を付ける。二重フチ（白＋色）はバラエティの定番。', code:'/* CSS：フチを外側だけに付ける */\n.text { -webkit-text-stroke: 8px #000; paint-order: stroke fill; }' },
      { name:'色の役割を決める', en:'Color Coding', desc:'話者ごと・感情ごとに色を固定する（例：出演者Aは青、Bはピンク、ツッコミは黄色、注意は赤）。視聴者が無意識に理解できる。', prompt:'話者ごとにテロップの色を固定して：Aは水色フチ、Bはピンクフチ、ナレーションは白フチ。' },
    ]},
  ]
});
})();
