/* 動画制作辞典 — C: 音 / 仕様・規格 / 企画・構成 / AI動画プロンプト / ツール・FFmpeg */
(function(){
TABS.push({
  id:'audio', label:'音・音響', icon:'♫',
  intro:'動画の印象の半分は音で決まると言われます。<b>映像が多少荒くても音が良ければ見てもらえるが、音が悪いとすぐ離脱される</b>のが動画の鉄則。効果音を実際に鳴らして確認したい場合は <a href="sound.html">サウンド・効果音辞典</a> へ。',
  sections:[
    { title:'音の種類', layout:'rows', items:[
      { name:'BGM', en:'Background Music', desc:'背景に流す音楽。<b>雰囲気・テンポ・感情</b>を決める。話がある場面では音量をぐっと下げる（声より10〜20dB小さく）。必ず利用規約を確認したロイヤリティフリー音源を使う。', tags:['著作権注意'], prompt:'BGMはナレーションの邪魔にならないよう、声が入る区間は-20dB程度まで下げて、声がない区間は-12dB程度に戻して。' },
      { name:'効果音（SE）', en:'Sound Effects', desc:'動きやテロップに合わせて鳴らす音（ポンッ、シュッ、ドンッ、キラーン）。<b>テロップの出現・場面転換・オチ</b>に付けると一気にプロっぽくなる。', prompt:'テロップが出るたびに「ポンッ」、場面転換に「シュッ」、オチに「チーン」の効果音を付けて。' },
      { name:'環境音（アンビエンス）', en:'Ambience / Room Tone', desc:'その場の空気の音（街のざわめき、鳥、風、カフェの雑音）。<b>無音だと不自然</b>なので、カットごとに音が途切れないよう環境音を敷く。', prompt:'カフェのシーン全体に、薄くカフェの環境音（食器・話し声）を敷いてカット間の音のつながりを自然にして。' },
      { name:'ルームトーン', en:'Room Tone', desc:'誰も話していないときの部屋の「無音の音」。収録時に30秒ほど録っておくと、編集で生じた音の穴を自然に埋められる。' },
      { name:'フォーリー', en:'Foley', desc:'足音・服の擦れ・ドアの開閉など、<b>後から録り直して付ける生活音</b>。映像に説得力と臨場感が出る。' },
      { name:'ナレーション（VO）', en:'Voice-over / Narration', desc:'画面外からの語り。AI音声（VOICEVOX・ElevenLabsなど）も使われる。<b>マイクに近く、静かな部屋で、反響を減らして</b>録るのが基本。', prompt:'ナレーション原稿をVOICEVOXで読み上げた音声ファイルにして、文ごとに分割して字幕のタイミングも出して。' },
      { name:'ジングル／サウンドロゴ', en:'Jingle / Audio Logo', desc:'番組やブランドを印象付ける数秒の短い音楽。オープニング、ロゴリビール、コーナーの切り替えに。' },
    ]},
    { title:'音の調整・処理', layout:'rows', items:[
      { name:'ダッキング', en:'Ducking / Sidechain', desc:'声が入ると<b>自動でBGMの音量を下げる</b>仕組み。DaVinci・Premiere・CapCutに機能あり。FFmpegでもsidechaincompressで可能。', prompt:'ナレーションに合わせてBGMが自動で下がるダッキングをFFmpegでかけて。',
        code:'ffmpeg -i voice.wav -i bgm.mp3 -filter_complex "[1:a][0:a]sidechaincompress=threshold=0.05:ratio=8:attack=20:release=400[bg];[bg][0:a]amix=inputs=2:duration=first" out.wav' },
      { name:'ラウドネス正規化（LUFS）', en:'Loudness Normalization', desc:'人が感じる音の大きさの基準。<b>YouTubeは約-14 LUFS</b>に揃えられる（大きすぎると自動で下げられる）。日本のテレビ放送は-24 LKFS。動画ごと・カットごとの音量差をなくす。', tags:['-14 LUFS'], prompt:'動画全体の音量を -14 LUFS、トゥルーピーク -1 dBTP に正規化して。',
        code:'ffmpeg -i in.mp4 -af loudnorm=I=-14:TP=-1:LRA=11 -c:v copy out.mp4' },
      { name:'ノイズ除去', en:'Noise Reduction', desc:'エアコン・PCファン・「サー」というノイズを減らす。かけすぎると声がロボットのようになる。AIノイズ除去（Adobe Podcast、DaVinci Voice Isolation、RNNoise）が強力。', code:'# FFmpeg の簡易ノイズ除去\nffmpeg -i in.wav -af "afftdn=nf=-25" out.wav' },
      { name:'EQ（イコライザー）', en:'Equalizer', desc:'周波数ごとに音量を調整。<b>80Hz以下をカット（ローカット）</b>して低いノイズや吹かれを消し、2〜5kHzを少し上げると声が聞き取りやすくなる。', code:'ffmpeg -i in.wav -af "highpass=f=80, equalizer=f=3000:t=q:w=1:g=3" out.wav' },
      { name:'コンプレッサー／リミッター', en:'Compressor / Limiter', desc:'大きい音を抑えて小さい音との差を縮め、<b>聞きやすく均一な音量</b>にする。リミッターは最大値を超えないよう天井を作る（音割れ防止）。', code:'ffmpeg -i in.wav -af "acompressor=threshold=-18dB:ratio=3:attack=10:release=200, alimiter=limit=0.9" out.wav' },
      { name:'ディエッサー', en:'De-esser', desc:'「サ行」の耳に刺さる歯擦音（シッ、スッ）を抑える。' },
      { name:'リバーブ／エコー', en:'Reverb / Echo', desc:'残響を付けて空間の広さを出す。洞窟・ホール・回想・夢のシーン、歌声に。' },
      { name:'フェードイン／アウト', en:'Audio Fade', desc:'音の始まりと終わりを徐々に大きく・小さくする。<b>BGMのブツ切れを防ぐ</b>最低限の処理。', code:'ffmpeg -i in.mp3 -af "afade=t=in:d=2, afade=t=out:st=58:d=2" out.mp3' },
      { name:'サンプルレート・ビット深度', en:'48kHz / 24bit', desc:'動画用音声は<b>48kHz</b>が標準（音楽CDは44.1kHz）。収録は24bitで録ると余裕がある。混在するとズレや音質劣化の原因に。' },
      { name:'口パクずれ（音ズレ）', en:'Audio Sync / Lip Sync', desc:'映像と音が合わない問題。別録りの音声は<b>拍手（クラップ）や波形</b>で同期する。可変フレームレート（スマホ録画）が原因のことも多い。', prompt:'スマホで撮った動画の音ズレを直したい。可変フレームレート(VFR)を固定(CFR) 30fpsに変換してから編集する方法を教えて。', code:'ffmpeg -i in.mp4 -vf fps=30 -c:a copy out_cfr.mp4' },
    ]},
    { title:'権利・素材', layout:'rows', items:[
      { name:'ロイヤリティフリー', en:'Royalty-free', desc:'一度の条件（無料・購入）で繰り返し使える素材。<b>「著作権フリー」とは違う</b>（著作権は作者にある）。クレジット表記や商用可否、YouTube収益化の可否を必ず確認。', tags:['要確認'] },
      { name:'Content ID', en:'YouTube Content ID', desc:'YouTubeの著作権自動照合システム。登録済みの音源を使うと、収益が権利者に回ったり再生がブロックされたりする。YouTubeオーディオライブラリの曲は安全に使える。' },
      { name:'BGM・効果音の入手先', en:'Sources', desc:'国内：<b>DOVA-SYNDROME、魔王魂、甘茶の音楽工房、効果音ラボ、OtoLogic</b>。海外：<b>YouTubeオーディオライブラリ、Pixabay Music、Freesound</b>。詳しくは「無料素材・リソース辞典」へ。', links:[['無料素材・リソース辞典へ', 'resources.html#audio']] },
      { name:'AI生成音楽の扱い', en:'AI Music (Suno / Udio etc.)', desc:'AIで作曲した曲は、サービスごとに<b>商用利用の条件（有料プランのみ等）</b>が異なる。利用規約を確認し、生成した記録を残しておくと安心。' },
    ]},
  ]
});

/* ---------- 仕様・規格 ---------- */
const AR = [['16:9', 100, 56, '横動画<br>YouTube'], ['9:16', 31.5, 56, '縦<br>Shorts'], ['1:1', 56, 56, '正方形'], ['4:5', 45, 56, 'IG<br>フィード'], ['3:4', 42, 56, '3:4'], ['4:3', 75, 56, 'SD/<br>iPad'], ['2.39:1', 134, 56, 'シネスコ']];
TABS.push({
  id:'spec', label:'仕様・規格', icon:'▦',
  intro:'解像度・アスペクト比・フレームレート・コーデックなど、<b>書き出しや投稿で必ず出てくる数字</b>。AIに「この仕様で書き出して」と伝えるときの基準表として使えます。',
  sections:[
    { title:'画面の形と大きさ', items:[
      { name:'アスペクト比（画面比率）', en:'Aspect Ratio', wide:true, h:150, demo:`<div class="ar">${AR.map(a => `<div style="width:${a[1]}px;height:${a[2]}px">${a[0]}<br><span style="font-weight:400;font-size:8.5px">${a[3]}</span></div>`).join('')}</div>`, tags:['基本'],
        desc:'画面の横と縦の比率。<b>16:9</b>＝YouTube・テレビの標準、<b>9:16</b>＝ショート動画（TikTok・Reels・Shorts）、<b>1:1 / 4:5 / 3:4</b>＝SNSフィード、<b>2.39:1</b>＝映画（シネマスコープ）。', prompt:'同じ素材から、YouTube用16:9（1920×1080）とショート用9:16（1080×1920）の2種類を書き出して。' },
      { name:'解像度', en:'Resolution', h:170, demo:`<div class="res">${[['4K UHD 3840×2160', 100, 100, '#e0364f'], ['1440p 2560×1440', 66.7, 66.7, '#f59e0b'], ['1080p FHD 1920×1080', 50, 50, '#22c55e'], ['720p HD 1280×720', 33.3, 33.3, '#3b82f6']].map(r => `<div style="width:${r[1]}%;height:${r[2]}%;border-color:${r[3]};color:${r[3]}">${r[0]}</div>`).join('')}</div>`, tags:['画素数'],
        desc:'画面を構成する点（ピクセル）の数。<b>1080p（フルHD）が現在の標準</b>、4Kは面積で4倍。解像度が高いほどファイルも重くなる。', prompt:'4Kで撮った素材を、1080pに縮小して書き出して（画質劣化の少ないlanczosで）。', code:'ffmpeg -i in.mp4 -vf "scale=1920:-2:flags=lanczos" -c:a copy out.mp4' },
      { name:'フレームレート（fps）', en:'Frame Rate', h:180, stage:'free', demo:`<div class="fps">${[[12, 0], [24, 25], [30, 50], [60, 75]].map(f => `<div class="lane" style="top:${f[1]}%"><b>${f[0]}fps</b><i style="animation-timing-function:steps(${f[0] * 2})"></i></div>`).join('')}</div>`, tags:['滑らかさ'],
        desc:'1秒あたりのコマ数。<b>24fps</b>＝映画らしい質感、<b>30fps</b>＝テレビ・YouTubeの標準、<b>60fps</b>＝ゲーム・スポーツの滑らかさ。12fpsはアニメ（コマ打ち）っぽい。見本で滑らかさの違いを比較できる。', prompt:'映画っぽい質感にしたいので24fpsで書き出して。シャッタースピードは1/50秒相当（180度ルール）で撮影する前提で。', code:'ffmpeg -i in.mp4 -r 24 out.mp4   # 単純に間引き（動きの補間はしない）' },
      { name:'セーフエリア', en:'Action Safe / Title Safe', h:170, demo:'<div class="safe"><div class="z" style="inset:3.5%;border-color:#facc15;color:#facc15">アクションセーフ（93%）</div><div class="z" style="inset:10%;border-color:#4ade80;color:#4ade80;align-items:flex-end">タイトルセーフ（80〜90%）</div></div>', tags:['テロップ配置'],
        desc:'画面の端は表示環境で切れたりUIに隠れたりするため、<b>重要な動きはアクションセーフ、文字はタイトルセーフ</b>の内側に置く。', prompt:'テロップやロゴはすべて画面の内側90%（タイトルセーフ）に収めて配置して。' },
      { name:'縦動画のUI被り', en:'Vertical Video Safe Zone', h:200, demo:'<div class="vert"><div class="ph"><div class="ng"></div><div class="ok">ここに<br>大事な<br>情報</div><div class="ui"><i></i><i></i><i></i><i></i></div><div class="cap"></div></div></div>', tags:['TikTok','Reels','Shorts'],
        desc:'縦型SNSでは<b>右側にいいね等のボタン、下部にアカウント名と説明文</b>が重なる。上部も検索バーなどで隠れることがある。大事な文字は中央やや上に置く。', prompt:'TikTok・Reels用の縦動画なので、テロップは上下各15%・右側15%を避けた中央エリアに配置して。' },
    ]},
    { title:'解像度の一覧', table:{ head:['名称','サイズ（横×縦）','主な用途'], rows:[
      ['SD（480p）','720×480 / 640×480','古い映像、低速回線'],
      ['HD（720p）','1280×720','軽量配信、Webの埋め込み'],
      ['フルHD（1080p）','1920×1080','<b>YouTube・SNSの標準</b>'],
      ['縦フルHD','1080×1920','<b>ショート動画（9:16）</b>'],
      ['WQHD（1440p）','2560×1440','ゲーム実況、高画質YouTube'],
      ['4K UHD（2160p）','3840×2160','高画質配信、将来性・切り抜き用の撮影'],
      ['DCI 4K','4096×2160','映画制作'],
      ['8K','7680×4320','一部の高級機・特殊用途'],
      ['Instagram フィード','1080×1350（4:5）/ 1080×1440（3:4）','フィード投稿'],
    ]} },
    { title:'フレームレートの使い分け', table:{ head:['fps','印象','用途'], rows:[
      ['24（23.976）','映画らしい・少しカクっとした質感','映画、シネマティックVlog、MV'],
      ['25 / 50','（PAL圏の規格）','ヨーロッパ・一部アジアの放送'],
      ['30（29.97）','自然・標準','YouTube、テレビ（日本・北米）、トーク'],
      ['60（59.94）','とても滑らか','ゲーム実況、スポーツ、画面録画、スロー素材'],
      ['120 / 240','—（スロー再生用に撮る）','スローモーション撮影'],
      ['12 / 8','パラパラ・手作り感','ストップモーション、アニメ的表現'],
    ]} },
    { title:'コーデック・コンテナ', note:'<b>コーデック</b>＝映像・音声を圧縮する方式、<b>コンテナ</b>＝それらを入れる箱（拡張子）。「MP4に入ったH.264」のように組み合わせます。', table:{ head:['名前','種類','特徴'], rows:[
      ['H.264 / AVC','映像コーデック','<b>最も互換性が高い</b>。迷ったらこれ'],
      ['H.265 / HEVC','映像コーデック','同画質でH.264の約半分のサイズ。iPhone標準。古い環境で再生不可のことも'],
      ['AV1','映像コーデック','高圧縮・ロイヤリティフリー。YouTube・Netflixが採用。エンコードは重い'],
      ['VP9','映像コーデック','Google製。WebMで使用'],
      ['ProRes / DNxHR','編集用（中間）コーデック','画質劣化が少なく編集が軽い。ファイルは巨大'],
      ['AAC','音声コーデック','MP4の標準の音声'],
      ['Opus','音声コーデック','高効率。WebM・通話・配信'],
      ['WAV','非圧縮音声','編集・収録用。劣化なし'],
      ['MP4（.mp4）','コンテナ','<b>最も一般的</b>。Web・SNS全般'],
      ['MOV（.mov）','コンテナ','Apple系。iPhoneの標準'],
      ['WebM（.webm）','コンテナ','Web向け。ブラウザの録画やHTML動画'],
      ['MKV（.mkv）','コンテナ','多機能（複数音声・字幕）。録画ソフト（OBS）で安全'],
    ]} },
    { title:'YouTube推奨ビットレート（SDR・アップロード時）', note:'ビットレート＝1秒あたりのデータ量。高いほど高画質・大容量。<b>迷ったらCRF（品質指定）でエンコード</b>するのが簡単です。', table:{ head:['解像度','24〜30fps','48〜60fps'], rows:[
      ['720p','5 Mbps','7.5 Mbps'], ['1080p','8 Mbps','12 Mbps'], ['1440p','16 Mbps','24 Mbps'], ['2160p（4K）','35〜45 Mbps','53〜68 Mbps'],
    ]} },
    { title:'プラットフォーム別の目安', note:'各サービスの仕様（最大の長さ・推奨比率）は頻繁に変わります。<b>投稿前に公式ヘルプで最新情報を確認</b>してください。', table:{ head:['プラットフォーム','推奨比率・サイズ','長さの傾向','ポイント'], rows:[
      ['YouTube（通常）','16:9 / 1920×1080以上','数分〜数十分','サムネ・タイトル・冒頭30秒が勝負。チャプター推奨'],
      ['YouTube ショート','9:16 / 1080×1920','最大3分','冒頭1〜2秒で掴む。ループ構成が強い'],
      ['TikTok','9:16 / 1080×1920','15〜60秒が主流（長尺も可）','音源・トレンド・字幕。UI被りに注意'],
      ['Instagram リール','9:16 / 1080×1920','最大3分程度','カバー画像はグリッド表示（3:4）で切れる'],
      ['Instagram フィード','4:5 / 3:4 / 1:1','短め','縦長の方が画面を占有できる'],
      ['X（旧Twitter）','16:9 / 1:1','短め（無料は約2分20秒まで）','自動再生は無音なので字幕必須'],
      ['LinkedIn / 企業用','16:9 / 1:1','1〜3分','字幕・ロゴ・冒頭で結論'],
    ]} },
    { title:'撮影の基本用語', layout:'rows', items:[
      { name:'シャッタースピードと180度ルール', en:'Shutter Speed / 180° Shutter Rule', desc:'動画のシャッタースピードは<b>フレームレートの2倍分の1</b>（24fps→1/50秒、30fps→1/60秒）が自然なブレ感になる。速すぎるとカクカク、遅すぎるとブレブレ。明るすぎるときはNDフィルターで減光する。' },
      { name:'F値（絞り）', en:'Aperture / f-stop', desc:'小さいほど（f/1.8）光が多く入り背景がボケる。大きいほど（f/11）全体にピントが合う。' },
      { name:'ISO感度', en:'ISO', desc:'暗い場所で明るく写すための増幅。上げすぎるとノイズ（ざらつき）が増える。' },
      { name:'Log撮影', en:'Log Profile (S-Log / V-Log / C-Log / Apple Log)', desc:'明暗の情報を最大限残すための<b>眠い（低コントラストな）記録方式</b>。後からカラーグレーディングする前提。手軽に仕上げたいなら通常モードで撮る方が楽。' },
      { name:'HDR／SDR', en:'HDR (HLG / HDR10 / Dolby Vision) / SDR (Rec.709)', desc:'HDRは明るい部分と暗い部分の幅が広い映像。対応画面では鮮烈だが、非対応環境での見え方の管理が難しい。通常のWeb動画はSDR（Rec.709）が無難。' },
      { name:'可変フレームレート（VFR）', en:'Variable Frame Rate', desc:'スマホや画面録画でよくある、fpsが一定でない記録。<b>編集ソフトで音ズレの原因</b>になるため、編集前に固定フレームレート（CFR）に変換する。' },
    ]},
  ]
});

/* ---------- 企画・構成 ---------- */
TABS.push({
  id:'plan', label:'企画・構成', icon:'✎',
  intro:'撮る前・編集する前に決める<b>動画の設計図</b>。AIに動画の台本や構成案を作ってもらうときに、この用語で指示するとプロの型に沿った案が出てきます。',
  sections:[
    { title:'構成の型', layout:'rows', items:[
      { name:'フック（冒頭3秒）', en:'Hook', desc:'最初の数秒で「続きを見たい」と思わせる仕掛け。<b>結論・意外な事実・問いかけ・完成形を先に見せる</b>など。ショート動画は1〜2秒が勝負。', tags:['最重要'], prompt:'このテーマのショート動画の冒頭フックを10パターン出して（結論先出し・意外な数字・問いかけ・失敗例・完成形見せ など型を変えて）。' },
      { name:'起承転結', en:'Kishōtenketsu', desc:'導入→展開→転換（意外性）→結末。日本的な物語構成。ショートドラマや4コマ的な動画に。', prompt:'30秒のショートドラマの台本を起承転結で書いて。「転」で視聴者が驚くどんでん返しを入れて。' },
      { name:'三幕構成', en:'Three-Act Structure', desc:'第1幕（設定・事件の発生）→第2幕（対立・葛藤・試練）→第3幕（クライマックス・解決）。映画・ドラマ・ブランドストーリーの基本。', prompt:'企業の創業ストーリー動画（3分）の構成を三幕構成で作って。' },
      { name:'PREP法', en:'Point → Reason → Example → Point', desc:'結論→理由→具体例→結論。<b>解説・ビジネス動画の鉄板</b>。短時間で要点が伝わる。', prompt:'「バイブコーディングとは」を説明する1分動画の台本をPREP法で書いて。' },
      { name:'問題提起→解決（PASの型）', en:'Problem → Agitate → Solution', desc:'悩みを提示→その悩みを深掘りして共感→解決策を提示。広告・商品紹介動画で強力。', prompt:'自社アプリの30秒広告動画の台本を、PAS（問題→煽り→解決）の型で3案作って。' },
      { name:'ビフォーアフター', en:'Before / After', desc:'変化を見せる構成。片付け・料理・メイク・リフォーム・アプリ導入前後。<b>完成形を冒頭に一瞬見せる</b>とフックにもなる。' },
      { name:'リスト型（〇選）', en:'Listicle', desc:'「〇〇なアプリ5選」のように並べる。途中離脱されにくく、チャプターにしやすい。最後に一番良いものを置くと最後まで見てもらえる。' },
      { name:'ループ構成', en:'Loop', desc:'終わりが始まりにつながり、<b>気づかず2周目を見てしまう</b>構成。ショート動画の再生数を伸ばす技。' },
    ]},
    { title:'制作の書類・工程', layout:'rows', items:[
      { name:'企画書', en:'Proposal / Brief', desc:'目的・ターゲット・伝えたいこと・尺・公開先・トーン・予算・納期をまとめたもの。<b>AIに依頼するときも最初にこれを渡す</b>と的外れが減る。', prompt:'以下の条件で動画の企画書を作って：目的=アプリのダウンロード、ターゲット=20代の学生、尺=30秒、公開先=TikTok、トーン=明るくテンポよく。' },
      { name:'台本（スクリプト）', en:'Script', desc:'セリフ・ナレーション・テロップ・映像の内容を時系列で書いたもの。2列（映像｜音声）形式のA/V台本が分かりやすい。', prompt:'2列のA/V台本形式（左：映像・テロップ、右：ナレーション・効果音）で、60秒の商品紹介動画の台本を書いて。秒数も入れて。' },
      { name:'絵コンテ（ストーリーボード）', en:'Storyboard', desc:'カットごとの絵（構図）と説明を並べた設計図。<b>ショットサイズ・カメラワーク・秒数・セリフ</b>を書き込む。AI画像生成でコンテ画像を作る方法も。', prompt:'この台本を10カットの絵コンテ表にして。各カットに「ショットサイズ・アングル・カメラワーク・秒数・内容・セリフ」の列を作って。' },
      { name:'ショットリスト', en:'Shot List', desc:'撮影すべきカットの一覧（チェックリスト）。撮り漏れ防止。Bロールの候補もここに書く。', prompt:'カフェ紹介動画のショットリストを作って。外観・内装・料理・調理・店主インタビュー・Bロールの区分で。' },
      { name:'Vコン（ビデオコンテ）', en:'Animatic / Video Storyboard', desc:'絵コンテを仮の音声やBGMと合わせて動画にしたもの。完成前にテンポや尺を確認できる。' },
      { name:'香盤表・撮影スケジュール', en:'Call Sheet / Shooting Schedule', desc:'いつ・どこで・誰が・どのシーンを撮るかの表。' },
    ]},
    { title:'公開・改善', layout:'rows', items:[
      { name:'サムネイル', en:'Thumbnail', desc:'クリック率を左右する最重要要素。<b>大きな顔の表情・3〜7文字の大きな文字・強いコントラスト・1つの主題</b>。1280×720px（16:9）。', prompt:'この動画のYouTubeサムネイル案を3つ出して。メイン文字（7文字以内）、表情、背景色、配置を具体的に。' },
      { name:'視聴維持率', en:'Audience Retention', desc:'動画のどこで視聴者が離脱したかを示すグラフ。急に下がる箇所を見て、冗長な部分を削る・フックを入れる。' },
      { name:'CTA／エンドスクリーン', en:'Call to Action / End Screen', desc:'視聴後にしてほしい行動（登録・次の動画・購入・リンク）。YouTubeの終了画面は最後の5〜20秒に設定できる。' },
      { name:'チャプター（タイムスタンプ）', en:'Chapters', desc:'概要欄に「0:00 はじめに」のように書くと、動画が章分けされ目当ての部分へ飛べる。最初は必ず0:00から。', prompt:'この台本から、YouTube概要欄に貼るチャプター（0:00形式）を作って。' },
      { name:'A/Bテスト', en:'A/B Test', desc:'サムネイルやタイトルを複数用意して効果を比べる。YouTube Studioに比較テスト機能がある。' },
    ]},
  ]
});

/* ---------- AI動画生成プロンプト ---------- */
// P(英語の言い方, 日本語の指示例, 見出しの日本語名, 説明, タグ)
const P = (en, jp, ja, desc, tags) => ({ name: en, en: ja, desc, tags, prompt: jp, search: jp });
TABS.push({
  id:'ai', label:'AI動画プロンプト', icon:'✧',
  intro:'Sora・Veo・Kling・Runway・Hailuo・Pika・Luma などの<b>動画生成AIに渡すプロンプトの語彙</b>。画像生成と違い「<b>何がどう動くか</b>」と「<b>カメラがどう動くか</b>」を書くのがポイントです。「AIへの指示例」は日本語でそのまま使えます。英語の方が安定するモデルでは、見出しの英語の言い方を使うか、日本語の指示例と一緒に添えてください。',
  sections:[
    { title:'プロンプトの組み立て方', layout:'rows', items:[
      { name:'基本テンプレート', en:'Prompt Structure', tags:['まずはこれ'], desc:'<b>①ショット・カメラ → ②被写体と外見 → ③動作（時間順） → ④場所・時間帯 → ⑤光 → ⑥スタイル・色 → ⑦音（対応モデルのみ）</b>の順に、1つの文章として具体的に書く。動作は1カットにつき1〜2個に絞ると破綻しにくい。',
        prompt:'【ショット・カメラ】ゆっくりドリーインするミディアムショット。\n【被写体】黄色いレインコートを着た、黒髪ショートの若い女性。\n【動作】バス停に立って空を見上げ、雨がやむとゆっくり微笑む。\n【場所】夕暮れの静かな東京の通り。\n【光】濡れたアスファルトに、お店の暖かい明かりが反射している。\n【スタイル】映画的、浅い被写界深度、35mmフィルムの質感、柔らかいティール＆オレンジの色調。\n【音】しとしと降る雨の音が小さくなっていき、遠くで電車の音。' },
      { name:'1カット1アクション', en:'One shot, one action', desc:'AI動画は1回の生成が数秒〜十数秒。<b>複雑な展開は複数カットに分けて生成し、編集でつなぐ</b>。「歩いてきて座ってコーヒーを飲んで電話する」は4カットに分ける。' },
      { name:'画像から動画（Image to Video）', en:'Image-to-Video / First Frame', desc:'最初のフレーム（や最後のフレーム）を画像で指定すると、<b>キャラクターや構図の一貫性</b>を保ちやすい。画像生成AIで作った絵を動かすのが定番ワークフロー。プロンプトは「何がどう動くか」だけ書けばよい。', prompt:'カメラがゆっくり寄っていく中、彼女の髪が風にやさしく揺れ、まばたきをする。控えめで自然な動き。' },
      { name:'キャラクターの一貫性', en:'Character Consistency', desc:'カットをまたいで同じ人物にするには、<b>参照画像（リファレンス）機能・同じ外見の記述の使い回し・同じシード</b>を使う。外見の記述は毎回同じ文をコピーする。' },
      { name:'書かない方がよいこと', en:'What to avoid', desc:'否定形（no ～）はかえってその要素を呼び込むことがある。<b>欲しいものを肯定形で</b>書く。多すぎる人物・細かい文字・指の動き・複雑な物理（液体を注ぐ等）は崩れやすい。' },
    ]},
    { title:'カメラの動き', layout:'rows', items:[
      P('static shot, locked-off camera', '固定カメラ（三脚に据えて動かさない）', '固定カメラ', '動かない三脚の映像。被写体の動きを見せたいときに。', ['基本']),
      P('slow dolly in / dolly out', 'ゆっくりドリーイン（またはドリーアウト）する', 'ドリーイン／アウト', 'ゆっくり近づく／離れる。感情の高まりや導入に。'),
      P('slow push in on her face', '彼女の顔へゆっくりプッシュインする', 'プッシュイン', '顔へじわじわ寄る。緊張・気づきの瞬間。'),
      P('pan left / pan right', '左（または右）にパンする', 'パン', '左右に首振り。'),
      P('tilt up from the ground to the sky', '地面から空へティルトアップする', 'ティルトアップ', '下から上へ首振り。'),
      P('tracking shot following the character', '人物を追いかけるトラッキングショット', 'トラッキング／フォロー', '被写体と並走・追従。'),
      P('orbit shot circling around the subject', '被写体の周りを回り込むオービットショット', 'オービット（回り込み）', '被写体の周りを回る。ヒーロー・商品紹介。'),
      P('crane shot rising up to reveal the city', '上昇しながら街の全景を見せるクレーンショット', 'クレーンアップ（俯瞰へ）', '上昇しながら全景を見せる。エンディングに。'),
      P('drone shot / aerial view flying over the forest', '森の上を飛ぶドローンの空撮', 'ドローン空撮', '上空からの移動撮影。'),
      P('FPV drone shot diving through the canyon', '峡谷をすり抜けて急降下するFPVドローンショット', 'FPVドローン', '高速で急降下・すり抜け。'),
      P('handheld camera, slight shake', '手持ちカメラで、わずかに揺れる映像', '手持ち', '臨場感・ドキュメンタリー感。'),
      P('whip pan to the right', '右へ素早くホイップパンする', 'ホイップパン', '高速パン。トランジションにも。'),
      P('rack focus from the foreground flower to the woman', '手前の花から女性へピントを送る（ラックフォーカス）', 'ピント送り', '手前から奥へピントを移す。'),
      P('dolly zoom, vertigo effect', 'ドリーズーム（めまい効果）', 'ドリーズーム', '背景だけが伸び縮みする不気味な効果。'),
      P('the camera slowly rotates 360 degrees', 'カメラがゆっくり360度回転する', 'ロール・回転', 'カメラ自体が回転。'),
      P('POV shot, first-person view', '一人称視点（POV）のショット', '主観ショット', '一人称視点。'),
    ]},
    { title:'ショット・レンズ・画質', layout:'rows', items:[
      P('extreme close-up / close-up / medium shot / wide shot / extreme wide shot', 'エクストリームクローズアップ／クローズアップ／ミディアムショット／ワイドショット／超ロングショット', 'ショットサイズ', '「ショットサイズ」タブ参照。'),
      P('low-angle shot / high-angle shot / bird\'s-eye view / Dutch angle', 'ローアングル／ハイアングル／真上からの俯瞰（バーズアイ）／ダッチアングル', 'アングル', '「カメラアングル」タブ参照。'),
      P('shot on 35mm lens / 85mm portrait lens / 14mm ultra-wide lens', '35mmレンズ／85mmのポートレートレンズ／14mmの超広角レンズで撮影', '焦点距離', '画角と遠近感を指定。'),
      P('anamorphic lens, horizontal lens flares, 2.39:1', 'アナモルフィックレンズ、横に伸びるレンズフレア、2.39:1の横長画面', 'アナモルフィック', '映画らしい横長の光のフレアと楕円ボケ。'),
      P('macro shot, extreme detail', 'マクロ撮影で、細部まで極めて精細に', 'マクロ', '虫・水滴・素材の質感の超接写。'),
      P('shallow depth of field, creamy bokeh', '浅い被写界深度で、背景はとろけるようなボケ', '浅い被写界深度', '背景を大きくぼかす。'),
      P('slow motion, 120fps', '120fpsのスローモーション', 'スローモーション', 'ゆっくりした動き。'),
      P('time-lapse of clouds moving over the city', '街の上を雲が流れていくタイムラプス', 'タイムラプス', '時間の早送り。'),
      P('shot on 16mm film, film grain', '16mmフィルムで撮影したような粒子感', 'フィルム質感', '粒子感のあるフィルムの風合い。'),
      P('4K, ultra detailed, sharp focus', '4K、超高精細、くっきりとしたピント', '高精細', '画質を上げたいとき（効果はモデル次第）。'),
    ]},
    { title:'光・時間帯・天気', layout:'rows', items:[
      P('golden hour sunlight', 'ゴールデンアワーの日差し', 'ゴールデンアワー', '夕方の金色の光。'),
      P('blue hour, city lights turning on', 'ブルーアワー、街の明かりが灯り始める', 'ブルーアワー', '日没後の青い時間。'),
      P('neon-lit rainy street at night', 'ネオンに照らされた雨の夜の通り', 'ネオンの雨の夜', 'サイバーパンク的な夜景。'),
      P('soft window light, overcast', '曇りの日の、柔らかい窓からの光', '柔らかい窓光・曇り', '優しく自然な光。'),
      P('volumetric light rays through fog', '霧の中を通る光の筋（ボリューメトリックライト）', '光芒（ゴッドレイ）', '霧を通る光の筋。'),
      P('backlit, rim light, silhouette', '逆光、リムライト、シルエット', '逆光・リムライト・シルエット', '輪郭が光る／黒い影絵。'),
      P('candlelight, warm flickering light', '暖かく揺らめくろうそくの光', 'ろうそくの光', '温かく揺れる光。'),
      P('heavy rain, snow falling, drifting fog, cherry blossom petals in the wind', '激しい雨、降る雪、漂う霧、風に舞う桜の花びら', '雨・雪・霧・桜吹雪', '天候や舞うものは動画で映える要素。'),
    ]},
    { title:'スタイル・雰囲気', layout:'rows', items:[
      P('cinematic, film still, dramatic lighting', '映画的、映画のワンシーンのような、ドラマチックな照明', 'シネマティック', '映画的な画作り。'),
      P('documentary style, natural light, handheld', 'ドキュメンタリー風、自然光、手持ちカメラ', 'ドキュメンタリー風', 'リアルな記録映像。'),
      P('anime style, cel-shaded, Studio Ghibli inspired background', 'アニメ調、セル画風、スタジオジブリを思わせる背景', 'アニメ調', 'セル画風のアニメ表現（特定作品名の扱いは各サービスの規約に従う）。'),
      P('3D animation, Pixar-like, soft lighting', '3DCGアニメーション、ピクサー風、柔らかい照明', '3DCGアニメ', 'フルCGアニメ風。'),
      P('claymation, stop-motion', 'クレイアニメ、ストップモーション', 'クレイアニメ・ストップモーション', '粘土やコマ撮りの温かみ。'),
      P('VHS footage, 1990s home video', 'VHSの映像、1990年代のホームビデオ', 'VHS・ホームビデオ', '90年代の家庭用ビデオ風。'),
      P('product commercial, clean studio background, smooth rotating turntable', '商品CM、清潔なスタジオの背景、ゆっくり回るターンテーブル', '商品CM', 'スタジオで回る商品。'),
      P('music video, high energy, fast cuts, colorful lights', 'ミュージックビデオ、エネルギッシュ、速いカット割り、カラフルなライト', 'MV風', 'テンポが速く派手。'),
      P('ASMR, calm, close-up of hands', 'ASMR、静か、手元のクローズアップ', 'ASMR', '静かで心地よい手元の映像。'),
    ]},
    { title:'動き・音の指定', layout:'rows', items:[
      P('she slowly turns her head toward the camera and smiles', '彼女がゆっくりカメラの方へ顔を向けて微笑む', '動作は時間順に具体的に', '「ゆっくり」「〜してから〜する」など速度と順番を書く。'),
      P('hair and clothes moving gently in the wind', '髪と服が風にやさしく揺れている', '二次的な動き', '髪・服・葉などの揺れで生命感が出る。'),
      P('steam rising from the coffee cup', 'コーヒーカップから湯気が立ちのぼる', '小さな動き', '湯気・水面・炎など静かなシーンの動き。'),
      P('the crowd moves in slow motion while she stays still', '周りの人混みはスローモーションで動き、彼女だけが静止している', '動と静の対比', '周囲と主役の動きの差で印象的に。'),
      P('ambient sound of rain and distant thunder', '雨の環境音と、遠くの雷鳴', '環境音（音声生成対応モデル）', 'Veo・Soraなど音声も生成できるモデルでは音の指定が効く。'),
      P('she says: "We made it."', '彼女が「やったね。」と言う', 'セリフ', 'セリフは引用符で囲む。口の動きと同期させる機能があるモデルも。'),
      P('upbeat electronic music, no vocals', '明るいエレクトロニックミュージック、ボーカルなし', 'BGMの指定', '音楽の雰囲気（ジャンル・テンポ・ボーカル有無）。'),
    ]},
  ]
});

/* ---------- ツール・コードで作る動画 ---------- */
const ff = (name, desc, code, tags) => ({ name, desc, code, codeLabel:'FFmpegコマンド', tags, prompt:`FFmpegで「${name}」をするコマンドを書いて。入力は input.mp4、出力は output.mp4 で。` });
TABS.push({
  id:'tools', label:'ツール・FFmpeg', icon:'⚒',
  intro:'動画を作る・加工する道具。<b>バイブコーディングでは「FFmpegのコマンド」や「Remotion（Reactで動画を作る）」をAIに書いてもらう</b>と、編集ソフトを触らずに大量の動画処理を自動化できます。',
  sections:[
    { title:'編集ソフト・アプリ', layout:'rows', items:[
      { name:'DaVinci Resolve', en:'Blackmagic Design', tags:['無料版あり','カラー最強'], url:'https://www.blackmagicdesign.com/products/davinciresolve', desc:'プロ仕様の編集・カラー・音響・合成が1本に入ったソフト。<b>無料版でも非常に高機能</b>。カラーグレーディングは業界標準。' },
      { name:'CapCut', en:'ByteDance', tags:['スマホ/PC','ショート向け'], url:'https://www.capcut.com/', desc:'自動字幕・テンプレート・エフェクトが豊富で、ショート動画の編集が速い。一部機能は有料。' },
      { name:'Adobe Premiere Pro / After Effects', en:'Adobe', tags:['有料','業界標準'], url:'https://www.adobe.com/products/premiere.html', desc:'Premiere＝編集、After Effects＝モーショングラフィックス・合成の定番。テンプレートや素材が世界中に豊富。' },
      { name:'Final Cut Pro', en:'Apple', tags:['Mac','買い切り'], url:'https://www.apple.com/final-cut-pro/', desc:'Mac向けの高速な編集ソフト。iPad版もある。' },
      { name:'OBS Studio', en:'obsproject.com', tags:['無料','録画・配信'], url:'https://obsproject.com/', desc:'画面録画・ライブ配信の定番。シーン切替・ワイプ・テロップも可能。' },
      { name:'Blender', en:'blender.org', tags:['無料','3D'], url:'https://www.blender.org/', desc:'3DCG・アニメーション・映像編集まで可能なオープンソースソフト。' },
      { name:'HandBrake', en:'handbrake.fr', tags:['無料','変換・圧縮'], url:'https://handbrake.fr/', desc:'動画の変換・圧縮をGUIで行えるツール。FFmpegのコマンドが苦手なときに。' },
      { name:'Audacity', en:'audacityteam.org', tags:['無料','音声編集'], url:'https://www.audacityteam.org/', desc:'ナレーションの録音・ノイズ除去・カットができる音声編集ソフト。' },
    ]},
    { title:'コードで動画を作る（バイブコーディング向け）', layout:'rows', items:[
      { name:'FFmpeg', en:'ffmpeg.org', tags:['定番','CLI','何でもできる'], url:'https://ffmpeg.org/',
        desc:'動画・音声の変換・切り出し・結合・圧縮・字幕焼き込みなど、<b>ほぼすべての処理ができるコマンドラインツール</b>。多くの動画サービスの裏側でも動いている。AIに書かせるのに最適。下に用途別のレシピあり。', prompt:'フォルダ内のすべての .mov を、H.264・CRF23 の .mp4 に一括変換するスクリプトを書いて（Windows PowerShell用とbash用）。',
        code:'# Windows: winget install Gyan.FFmpeg  /  Mac: brew install ffmpeg\nffmpeg -version' },
      { name:'Remotion', en:'remotion.dev', tags:['React','テンプレ動画量産'], url:'https://www.remotion.dev/',
        desc:'<b>Reactのコンポーネントで動画を作る</b>フレームワーク。テロップ・グラフ・データから動画を自動生成できる（例：毎週のランキング動画、名前入りの動画を大量生成）。商用は会社規模によりライセンスが必要。', prompt:'Remotionで、JSONの売上データから棒グラフが伸びていく15秒の動画を作って。タイトルとBGMも入れて。',
        code:'npx create-video@latest\nnpx remotion render MyComp out/video.mp4' },
      { name:'Manim', en:'Mathematical Animation Engine', tags:['Python','数学・図解'], url:'https://www.manim.community/',
        desc:'3Blue1Brownの数学動画で有名なPythonのアニメーションライブラリ。数式・グラフ・図形の変形を美しく動かせる。教育・解説動画に。', prompt:'Manim Communityで、ピタゴラスの定理を図形の面積で証明するアニメーションを作って。日本語のテキストも表示して。',
        code:'pip install manim\nmanim -pqh scene.py PythagorasScene' },
      { name:'Motion Canvas', en:'motioncanvas.io', tags:['TypeScript','解説動画'], url:'https://motioncanvas.io/', desc:'TypeScriptでコードからアニメーションを作るツール。プログラミング解説動画、図解に。エディタでタイミングを音声に合わせられる。', prompt:'Motion Canvasで、配列のソートアルゴリズム（バブルソート）を棒が入れ替わるアニメーションで説明する動画を作って。' },
      { name:'MoviePy', en:'Python', tags:['Python','簡単な編集'], url:'https://zulko.github.io/moviepy/', desc:'Pythonで動画のカット・結合・テキスト合成ができるライブラリ。簡単な自動編集に。', prompt:'MoviePyで、フォルダ内の動画を順番に結合し、各クリップの左下にファイル名をテキストで表示して書き出して。' },
      { name:'Whisper / faster-whisper', en:'音声認識', tags:['自動字幕','無料・ローカル'], url:'https://github.com/SYSTRAN/faster-whisper', desc:'OpenAIの音声認識モデル（オープンソース）。動画から<b>字幕ファイル（SRT）を自動生成</b>できる。日本語も高精度。', prompt:'faster-whisperで動画の日本語音声を文字起こしして、1行16文字以内に分割したSRT字幕ファイルを出力するPythonスクリプトを書いて。' },
      { name:'auto-editor', en:'無音カット', tags:['ジェットカット'], url:'https://github.com/WyattBlue/auto-editor', desc:'無音部分を自動で検出してカットするツール。トーク動画の下処理が一瞬で終わる。', code:'auto-editor input.mp4 --margin 0.2sec --export premiere   # 編集ソフト用のXMLも出せる' },
      { name:'ブラウザで動画処理', en:'MediaRecorder / WebCodecs / ffmpeg.wasm', tags:['Webアプリ'], desc:'ブラウザだけで録画（MediaRecorder）、Canvasの動画化（captureStream）、変換（ffmpeg.wasm）ができる。<b>サーバー不要の動画ツール</b>を作れる。', prompt:'ブラウザでCanvasに描いたアニメーションを MediaRecorder で録画して、WebM動画としてダウンロードできるページを作って。',
        code:"const stream = canvas.captureStream(30);\nconst rec = new MediaRecorder(stream, { mimeType: 'video/webm' });\nconst chunks = []; rec.ondataavailable = e => chunks.push(e.data);\nrec.onstop = () => { const url = URL.createObjectURL(new Blob(chunks, { type: 'video/webm' })); /* aタグでダウンロード */ };\nrec.start(); setTimeout(() => rec.stop(), 5000);" },
    ]},
    { title:'FFmpeg レシピ集', note:'よく使う処理のコピペ用コマンド。<code>input.mp4</code> と <code>output.mp4</code> を自分のファイル名に変えて使います。', layout:'rows', items:[
      ff('MP4に変換・圧縮（品質指定）', '<b>CRF</b>は品質の指定（18＝ほぼ劣化なし、23＝標準、28＝小さい）。presetはslowほど小さく高品質（時間がかかる）。', 'ffmpeg -i input.mov -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 192k -movflags +faststart output.mp4', ['基本']),
      ff('一部分を切り出す', '開始位置と長さで切り出す。<code>-c copy</code> は再エンコードしないので一瞬だが、切れ目がキーフレームにずれることがある。正確に切るなら再エンコード。', '# 1分05秒から30秒間（高速・再エンコードなし）\nffmpeg -ss 00:01:05 -i input.mp4 -t 30 -c copy output.mp4\n# 正確に切る\nffmpeg -ss 00:01:05 -i input.mp4 -t 30 -c:v libx264 -crf 20 -c:a aac output.mp4', ['トリム']),
      ff('複数の動画を結合', '同じ設定の動画ならconcatで無劣化結合。設定が違う場合は一度揃えてから。', '# list.txt に 1行ずつ  file \'part1.mp4\'\nffmpeg -f concat -safe 0 -i list.txt -c copy output.mp4', ['結合']),
      ff('横動画を縦動画（9:16）に', '中央を切り抜く方法と、ぼかした背景の上に横動画を置く方法がある。', '# 中央を切り抜き\nffmpeg -i input.mp4 -vf "crop=ih*9/16:ih,scale=1080:1920" -c:a copy output.mp4\n# ぼかし背景＋中央に元映像\nffmpeg -i input.mp4 -filter_complex "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20[bg];[0:v]scale=1080:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2" -c:a copy output.mp4', ['ショート化']),
      ff('音声だけ取り出す', '文字起こしや音声編集の前処理に。', 'ffmpeg -i input.mp4 -vn -c:a libmp3lame -q:a 2 output.mp3\n# WAV（無圧縮）なら\nffmpeg -i input.mp4 -vn -ac 1 -ar 16000 output.wav   # Whisper向け：モノラル16kHz', ['音声']),
      ff('BGMを追加（音量調整して混ぜる）', '元の音声にBGMを小さく重ねる。', 'ffmpeg -i input.mp4 -i bgm.mp3 -filter_complex "[1:a]volume=0.15,afade=t=out:st=55:d=3[b];[0:a][b]amix=inputs=2:duration=first[a]" -map 0:v -map "[a]" -c:v copy output.mp4', ['音声']),
      ff('音声を差し替える／消す', 'ナレーションを録り直した場合や、無音にしたい場合。', '# 差し替え\nffmpeg -i input.mp4 -i voice.wav -map 0:v -map 1:a -c:v copy -shortest output.mp4\n# 無音にする\nffmpeg -i input.mp4 -an -c:v copy output.mp4', ['音声']),
      ff('GIFアニメにする（高画質）', 'パレットを先に作るときれいなGIFになる。', 'ffmpeg -i input.mp4 -vf "fps=12,scale=480:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse" output.gif', ['GIF']),
      ff('サムネイル画像を書き出す', '1枚だけ、または一定間隔で連続書き出し、タイル状の一覧も作れる。', '# 10秒地点の1枚\nffmpeg -ss 10 -i input.mp4 -frames:v 1 thumb.jpg\n# 10秒ごとに書き出し\nffmpeg -i input.mp4 -vf fps=1/10 thumb_%03d.jpg\n# 4×4のタイル一覧\nffmpeg -i input.mp4 -vf "fps=1/30,scale=320:-1,tile=4x4" -frames:v 1 contact.jpg', ['画像']),
      ff('ロゴ・透かしを重ねる', '右上にPNGロゴを配置。', 'ffmpeg -i input.mp4 -i logo.png -filter_complex "[1:v]scale=200:-1[l];[0:v][l]overlay=W-w-30:30" -c:a copy output.mp4', ['ウォーターマーク']),
      ff('文字を描画する', 'フォントファイルを指定して、動画に直接文字を入れる。', 'ffmpeg -i input.mp4 -vf "drawtext=fontfile=NotoSansJP-Bold.ttf:text=\'こんにちは\':fontsize=64:fontcolor=white:borderw=4:bordercolor=black:x=(w-text_w)/2:y=h-150" -c:a copy output.mp4', ['テロップ']),
      ff('フェードイン・フェードアウト', '映像と音声の両方を最初と最後でフェード。', 'ffmpeg -i input.mp4 -vf "fade=t=in:d=1,fade=t=out:st=29:d=1" -af "afade=t=in:d=1,afade=t=out:st=29:d=1" output.mp4', ['演出']),
      ff('画像＋音声 → 動画（ポッドキャスト用）', '1枚の画像と音声ファイルからYouTube用動画を作る。', 'ffmpeg -loop 1 -i cover.png -i audio.mp3 -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest output.mp4', ['音声']),
      ff('連番画像 → 動画', 'アニメーションの連番やタイムラプス写真を動画化。', 'ffmpeg -framerate 24 -i frame_%04d.png -c:v libx264 -pix_fmt yuv420p output.mp4', ['連番']),
      ff('回転・反転・切り抜き', 'スマホの向き違いや不要部分のカット。', '# 時計回りに90度\nffmpeg -i input.mp4 -vf "transpose=1" output.mp4\n# 左右反転\nffmpeg -i input.mp4 -vf hflip output.mp4\n# 幅1280×高さ720を左上(100,50)から切り抜き\nffmpeg -i input.mp4 -vf "crop=1280:720:100:50" output.mp4', ['補正']),
      ff('動画の情報を調べる', '解像度・fps・コーデック・長さを確認。トラブル時にAIへ貼り付けると原因が分かりやすい。', 'ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,bit_rate -show_entries format=duration -of json input.mp4', ['調査']),
    ]},
  ]
});
})();
