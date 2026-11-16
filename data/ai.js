/* AIツール・モデル辞典 — A(名前, 提供元・種類, 説明, タグ, URL, 指示例) */
(function(){
const A = (name, en, desc, tags, url, prompt) => ({ name, en, desc, tags, url, prompt });
const S = (title, items, note) => ({ title, note, layout:'rows', items });
const NOTE = { type:'caution', label:'注意', text:'AIツールは機能・料金・モデル名が数か月単位で変わります。ここでは長く通用する特徴を中心に書いています。最新のモデル名・料金・利用規約（特に商用利用と学習へのデータ利用）は各公式サイトで確認してください。' };

TABS.push({
  id:'coding', label:'コーディングAI', icon:'⌨',
  intro:'コードを書く・直す・説明するAIツール。<b>エディタ型</b>（画面を見ながら一緒に書く）と、<b>エージェント型</b>（指示するとファイルを読んで自分で作業を進める）があります。',
  sections:[
    S('エージェント型（ターミナル・自律作業）', [
      A('Claude Code', 'Anthropic', 'ターミナル・デスクトップアプリ・IDE・Webで動く、<b>プロジェクト全体を読んで自分で作業を進める</b>コーディングエージェント。計画→実装→テスト→コミットまで任せられる。CLAUDE.mdにプロジェクトのルールを書いておける。', ['エージェント','おすすめ'], 'https://docs.anthropic.com/en/docs/claude-code/overview', 'まずこのリポジトリの構成を調べて、CLAUDE.mdに概要・使っている技術・コマンド・コーディング規約をまとめて。'),
      A('OpenAI Codex', 'OpenAI', 'ターミナル（CLI）やクラウドで動くOpenAIのコーディングエージェント。タスクを並列でクラウド実行することもできる。', ['エージェント'], 'https://openai.com/codex/'),
      A('Gemini CLI', 'Google', 'ターミナルで動くGoogleのオープンソースのAIエージェント。', ['エージェント','オープンソース'], 'https://github.com/google-gemini/gemini-cli'),
      A('Cline / Roo Code', 'VS Code拡張（オープンソース）', 'VS Codeの中で動くエージェント。好きなAIモデル（APIキー）を選んで使える。', ['オープンソース'], 'https://cline.bot/'),
      A('Aider', 'オープンソースCLI', 'ターミナルでGitと連携しながらコードを編集する老舗ツール。変更ごとに自動でコミット。', ['オープンソース'], 'https://aider.chat/'),
    ]),
    S('エディタ型（IDE）', [
      A('Cursor', 'AIエディタ', 'VS Codeをベースに、AIでの補完・チャット・複数ファイル編集・エージェントを統合したエディタ。拡張機能もVS Codeのものが使える。', ['人気'], 'https://cursor.com/'),
      A('GitHub Copilot', 'GitHub / Microsoft', 'VS Code・JetBrainsなど多くのエディタで使える補完・チャット・エージェント。GitHubのIssueから作業を任せることもできる。学生・OSS開発者向けの無料枠あり。', ['定番'], 'https://github.com/features/copilot'),
      A('Windsurf', 'AIエディタ', 'エージェント機能を中心にしたAIエディタ。', [], 'https://windsurf.com/'),
      A('Kiro', 'AWS', '仕様（要件・設計・タスク）を先に作ってから実装する「仕様駆動」型のAI IDE。', [], 'https://kiro.dev/'),
      A('Zed / JetBrains AI', 'エディタ', '高速エディタZedや、IntelliJ・PyCharmなどJetBrains製品に組み込まれたAI機能。'),
    ]),
    { title:'使い分け', table:{ head:['やりたいこと','向いているツール'], rows:[
      ['既存プロジェクトを大きく改修・調査したい','Claude Code、Codex、Gemini CLI などのエージェント型'],
      ['画面を見ながら少しずつ書きたい・補完がほしい','Cursor、GitHub Copilot'],
      ['プログラミング環境なしで試作したい','v0、Bolt、Lovable、Claudeのアーティファクト（次のタブ）'],
      ['好きなモデルを選びたい・費用を管理したい','Cline、Aider（APIキー方式）'],
    ]}, after: NOTE },
  ]
});

TABS.push({
  id:'builder', label:'アプリ生成サービス', icon:'✦',
  intro:'<b>ブラウザだけで</b>、チャットで指示するとアプリやサイトを作って公開まで進められるサービス。プログラミング環境のセットアップが不要なので、最初の一歩に最適です。',
  sections:[
    S('チャットでアプリを作る', [
      A('v0', 'Vercel', 'React＋Tailwind＋shadcn/uiのUIやアプリを生成。Vercelへそのまま公開でき、コードをダウンロードしてローカルで続けることもできる。', ['UIが得意'], 'https://v0.app/'),
      A('Bolt.new', 'StackBlitz', 'ブラウザ内で開発環境ごと動かし、フルスタックのアプリを生成・実行・公開。', [], 'https://bolt.new/'),
      A('Lovable', 'Lovable', '会話でWebアプリを作り、Supabase連携やGitHub同期、公開までできる。非エンジニア向けの使いやすさ。', [], 'https://lovable.dev/'),
      A('Replit Agent', 'Replit', 'クラウド開発環境Replitの中で、エージェントがアプリを作ってホスティングまで行う。', [], 'https://replit.com/'),
      A('Google AI Studio / Firebase Studio', 'Google', 'Geminiで試作アプリを生成。Firebase StudioはFirebaseと連携したフルスタック開発環境。', [], 'https://aistudio.google.com/'),
      A('Claude（アーティファクト）', 'Anthropic', 'Claudeとの会話の中で、HTMLやReactのアプリ・図・文書を生成して、その場で動かしたり共有したりできる。', [], 'https://claude.ai/'),
      A('ChatGPT（Canvas）', 'OpenAI', 'ChatGPTの中でコードや文書を並べて編集できる作業画面。'),
    ]),
    S('ここから先へ進むには', [
      A('ダウンロードしてローカルで続ける', 'Export to local', '生成サービスで作ったものが大きくなってきたら、GitHubに連携・ダウンロードして、Claude CodeやCursorで続けるのが定番の流れ。', [], null, 'v0で作ったこのプロジェクトをローカルに持ってきました。構成を把握して、README（起動方法）を書いてから、次の機能追加に進もう。'),
    ]),
  ]
});

TABS.push({
  id:'llm', label:'対話AI・LLM', icon:'✧',
  intro:'文章・コード・画像理解を担う大規模言語モデル（LLM）と、そのチャットサービス。用途で得意不得意があるので、複数を使い分ける人も多いです。',
  sections:[
    S('主なAIアシスタント（クローズドモデル）', [
      A('Claude', 'Anthropic', '長い文章の読解・文章作成・コーディング・エージェント作業に強い。Claude Code・API・アプリで使える。', ['コーディング'], 'https://claude.ai/'),
      A('ChatGPT（GPT）', 'OpenAI', '最も利用者の多いAIアシスタント。画像生成・音声会話・検索・エージェント機能など多機能。', ['多機能'], 'https://chatgpt.com/'),
      A('Gemini', 'Google', 'Googleのサービス（Gmail・ドキュメント・検索）と連携。長い資料・動画の理解に強い。API無料枠が大きい。', ['Google連携'], 'https://gemini.google.com/'),
      A('Microsoft Copilot', 'Microsoft', 'WindowsやOffice（Word・Excel・PowerPoint）と統合されたAI。'),
      A('Grok', 'xAI', 'X（旧Twitter）と連携したAI。'),
      A('Perplexity', '検索AI', '<b>出典付き</b>でWeb検索結果をまとめて答えるAI検索。調べ物に。', ['調べ物'], 'https://www.perplexity.ai/'),
      A('NotebookLM', 'Google', 'アップロードした資料（PDF・文書・動画）だけを根拠に答えるAIノート。資料の要約や、音声での解説生成も。', ['資料の理解'], 'https://notebooklm.google.com/'),
    ]),
    S('オープンモデル（自分で動かせる）', [
      A('Llama', 'Meta', '代表的なオープンモデル。ライセンス条件付きで商用利用も可。'),
      A('Qwen', 'Alibaba', '多言語・日本語にも強いオープンモデル群。テキスト・画像（Qwen-Image）・コード向けなど種類が豊富。'),
      A('DeepSeek', 'DeepSeek', '高性能で推論（じっくり考える）に強いオープンモデル。'),
      A('Gemma', 'Google', 'Googleの軽量オープンモデル。普通のPCやスマホでも動かしやすい。'),
      A('Mistral', 'Mistral AI', 'フランスのAI企業の高効率なモデル。オープンなものと商用のものがある。'),
      A('日本語特化モデル', 'Japanese LLMs', '国内の企業・研究機関による日本語に強いモデルも公開されている。Hugging Faceで探せる。', [], 'https://huggingface.co/models'),
    ]),
    S('モデル選びの観点', [
      A('性能・速さ・料金のバランス', 'Model tiers', '各社とも「最上位（賢いが高い・遅い）」「標準」「軽量（速い・安い）」の段階がある。<b>まず軽量モデルで試し、足りなければ上げる</b>のがコスト的に賢い。'),
      A('データの扱い', 'Data policy', '無料プランやサービスによっては、入力がAIの改善に使われることがある。仕事のデータや個人情報を扱うときは設定と規約を確認する。', ['重要']),
    ]),
  ]
});

TABS.push({
  id:'image', label:'画像生成AI', icon:'◩',
  intro:'テキストから画像を作るAI。<b>商用利用・著作権・人物の肖像</b>の扱いは各サービスの規約を必ず確認してください。 画像生成の指示に使う言葉（人物・光・カメラ・画風など約1,400語）は <a href="image-prompts.html">画像・イラスト表現辞典</a> へ。',
  sections:[
    S('サービス・モデル', [
      A('Midjourney', 'Midjourney', '芸術的で美しい画像に定評。Webとアプリで利用（有料）。', ['アート'], 'https://www.midjourney.com/'),
      A('ChatGPTの画像生成（GPT Image）', 'OpenAI', '会話しながら画像を作り、指示で修正できる。文字の描画や、指示への忠実さが強み。APIでも利用可能。', ['会話で修正'], 'https://chatgpt.com/'),
      A('Gemini / Imagen', 'Google', 'Geminiアプリなどで画像生成・編集。画像の一部を言葉で編集するのが得意（「Nano Banana」の愛称で話題になった画像モデルなど）。', ['画像編集'], 'https://gemini.google.com/'),
      A('Stable Diffusion', 'Stability AI ほか（オープン）', '自分のPCで動かせるオープンな画像生成モデル。追加学習モデル（LoRA）やControlNetで細かく制御できる。', ['ローカル','カスタマイズ'], 'https://stability.ai/'),
      A('FLUX', 'Black Forest Labs', '高品質なオープン／商用の画像生成モデル。指示への忠実さとリアルさ。', [], 'https://bfl.ai/'),
      A('Qwen-Image', 'Alibaba（オープン）', '文字の描画（日本語・中国語を含む）や画像編集に強いオープンモデル。以前作成した語彙辞典の対象モデル。', ['文字に強い'], null),
      A('Ideogram', 'Ideogram', '<b>画像内の文字（ロゴ・ポスター）</b>の描画に強い。', ['文字に強い'], 'https://ideogram.ai/'),
      A('Adobe Firefly', 'Adobe', '権利がクリアな素材で学習しており、商用利用しやすいことを重視。Photoshopの生成塗りつぶしなどにも統合。', ['商用向け'], 'https://firefly.adobe.com/'),
      A('Recraft', 'Recraft', 'ベクター（SVG）・アイコン・ロゴ・イラストのスタイル統一に強い。', ['ベクター'], 'https://www.recraft.ai/'),
      A('Canva（AI機能）', 'Canva', 'デザインツールに画像生成・背景除去・文章生成が統合。SNS画像やスライドの作成に。', [], 'https://www.canva.com/'),
    ]),
    S('画像AIの用語', [
      A('txt2img / img2img', 'Text-to-Image / Image-to-Image', '文章から画像を作る／元の画像を元に別の画像を作る。'),
      A('インペイント／アウトペイント', 'Inpainting / Outpainting', '画像の一部だけを描き直す／画像の外側を描き足して広げる。'),
      A('ネガティブプロンプト', 'Negative Prompt', '「入れてほしくないもの」を指定する欄（モデルによっては効きが弱く、肯定形で書く方がよい）。'),
      A('シード値', 'Seed', '乱数の種。同じプロンプト＋同じシードなら同じ画像が出る。比較実験に使う。'),
      A('LoRA', 'Low-Rank Adaptation', '特定の画風やキャラクターを追加学習した小さなファイル。Stable Diffusion系で使う。'),
      A('ControlNet', 'ControlNet', '線画・ポーズ・奥行きなどで構図を指定して生成する仕組み。'),
      A('アップスケール', 'Upscale', 'AIで画像を高解像度に拡大する。'),
    ]),
  ]
});

TABS.push({
  id:'video', label:'動画生成AI', icon:'▶',
  intro:'テキストや画像から動画を生成するAI。プロンプトの語彙は <a href="video.html#ai">動画制作辞典の「AI動画プロンプト」</a> を参照。数秒〜十数秒のカットを作って、編集でつなぐのが基本です。',
  sections:[
    S('サービス・モデル', [
      A('Sora', 'OpenAI', 'リアルな映像と物理表現、音声付きの動画生成。アプリとWebで利用。', [], 'https://openai.com/sora/'),
      A('Veo', 'Google', '高品質な映像に加え、<b>効果音・セリフなどの音声も同時に生成</b>できる。GeminiやFlowで利用。', ['音声付き'], 'https://deepmind.google/models/veo/'),
      A('Kling', 'Kuaishou', '人物の動きの自然さに定評。画像から動画、最初と最後のフレーム指定など。', [], 'https://klingai.com/'),
      A('Runway', 'Runway', '映像クリエイター向けの総合AIツール。動画生成に加えて、編集・合成・カメラ制御が豊富。', ['プロ向け'], 'https://runwayml.com/'),
      A('Hailuo（MiniMax）', 'MiniMax', 'ダイナミックな動きの表現に強い動画生成。', [], 'https://hailuoai.video/'),
      A('Pika / Luma Dream Machine', 'Pika Labs / Luma AI', '手軽な動画生成と、楽しいエフェクト。', [], 'https://lumalabs.ai/'),
      A('Wan / HunyuanVideo など', 'オープンモデル', '自分のPC（高性能GPU）やComfyUIで動かせるオープンな動画生成モデル。', ['ローカル']),
      A('HeyGen / Synthesia', 'AIアバター', '人物のアバターが原稿を話す動画を作る。研修・解説・多言語吹き替えに。', ['アバター']),
    ]),
    S('動画AIの用語', [
      A('Text-to-Video / Image-to-Video', 'T2V / I2V', '文章から動画／画像から動画。キャラクターや構図を安定させたいなら、まず画像を作ってから動かすI2Vが確実。'),
      A('最初と最後のフレーム指定', 'First / Last Frame', '開始と終了の画像を指定して、その間の動きを生成する。トランジションや変身シーンに。'),
      A('リファレンス（参照画像）', 'Reference / Character Consistency', '同じキャラクター・商品をカットをまたいで一貫させるための参照画像機能。'),
      A('リップシンク', 'Lip Sync', '音声に合わせて口の動きを生成する。'),
      A('アップスケール・フレーム補間', 'Upscale / Frame Interpolation', '解像度を上げる、コマを補って滑らかにする。'),
    ]),
  ]
});

TABS.push({
  id:'audio', label:'音声・音楽AI', icon:'♪',
  intro:'読み上げ・文字起こし・音楽・効果音を作るAI。<a href="sound.html">サウンド・効果音辞典</a> も参照。',
  sections:[
    S('音声', [
      A('ElevenLabs', 'ElevenLabs', '自然な多言語の読み上げ、声のクローン、吹き替え、効果音生成。', ['高品質'], 'https://elevenlabs.io/'),
      A('VOICEVOX', '無料・ローカル', '無料の日本語読み上げソフト。キャラクターボイス（ずんだもん等）。クレジット表記で商用利用可（キャラごとの規約あり）。', ['無料','日本語'], 'https://voicevox.hiroshiba.jp/'),
      A('AivisSpeech', '無料・ローカル', '感情豊かな日本語音声合成。VOICEVOX互換のAPI。', ['無料','日本語'], 'https://aivis-project.com/'),
      A('Whisper', 'OpenAI（オープンソース）', '高精度の音声認識（文字起こし）。ローカルで無料で動かせる。字幕作成に。', ['無料','文字起こし'], 'https://github.com/openai/whisper'),
      A('Adobe Podcast（Enhance Speech）', 'Adobe', '雑音だらけの録音を、スタジオ録音のようにきれいにする。'),
    ]),
    S('音楽・効果音', [
      A('Suno', 'Suno', '歌詞付きの曲をテキストから生成。ジャンル・雰囲気の指定で。商用利用はプランの条件を確認。', [], 'https://suno.com/'),
      A('Udio', 'Udio', '高音質な楽曲生成。'),
      A('Stable Audio', 'Stability AI', 'BGM・効果音・ループの生成。'),
      A('ElevenLabs Sound Effects', 'ElevenLabs', '説明文から効果音を生成。'),
    ]),
  ]
});

TABS.push({
  id:'local', label:'ローカルAI', icon:'⌂',
  intro:'自分のPCでAIを動かすツール。<b>無料・回数無制限・オフライン・データが外に出ない</b>のが利点。快適に動かすには、メモリ（RAM）やGPU（VRAM）の容量が重要です。',
  sections:[
    S('テキスト（LLM）', [
      A('Ollama', 'ollama.com', 'コマンド1つでモデルをダウンロードして実行。ローカルにAPIサーバーが立つので、自作アプリから呼べる。', ['定番'], 'https://ollama.com/', 'Ollamaでgemma3を動かして、ローカルのAPI（localhost:11434）を呼ぶ簡単なチャット画面をHTMLで作って。'),
      A('LM Studio', 'lmstudio.ai', '画面操作でモデルを探して実行できるアプリ。OpenAI互換のローカルサーバー機能。', ['GUI'], 'https://lmstudio.ai/'),
      A('Open WebUI', 'オープンソース', 'ChatGPTのような画面で、ローカルのモデル（Ollama等）と会話できるWebアプリ。', [], 'https://openwebui.com/'),
      A('Jan / llama.cpp', 'オープンソース', 'Janはオフラインで使えるチャットアプリ。llama.cppは多くのツールの土台になっている高速な実行エンジン。'),
    ]),
    S('画像・動画', [
      A('ComfyUI', 'オープンソース', 'ノード（箱）をつないで画像・動画生成の手順を組み立てるツール。自由度が非常に高く、最新モデルへの対応も早い。', ['上級者向け'], 'https://www.comfy.org/'),
      A('Stable Diffusion WebUI（Forge など）', 'オープンソース', 'ブラウザの画面でStable Diffusion系の画像生成を操作するツール。'),
    ]),
    S('動かすための目安', [
      A('必要なスペックの目安', 'Hardware', 'テキストAI：小型モデルならメモリ16GBのPCでも動く。画像生成：NVIDIAのGPU（VRAM 8GB以上）が快適。動画生成：さらに大きなVRAMが必要。Apple シリコンのMacも統合メモリで比較的動かしやすい。'),
      A('量子化', 'Quantization（Q4 / Q8 / GGUF）', 'モデルを軽く圧縮する技術。少し精度は落ちるが、少ないメモリで動くようになる。'),
    ]),
  ]
});

TABS.push({
  id:'build', label:'AIを組み込む', icon:'⚙',
  intro:'自分のアプリにAI機能を入れるための仕組みとライブラリ。APIの無料枠は <a href="free-api.html#ai">無料API辞典の「AI・LLM」</a> を参照。実装の詳しい方法（構造化出力・ツール・RAG・料金計算・評価）は <a href="ai-integration.html">AI組み込み辞典</a> へ。',
  sections:[
    S('基本の仕組み', [
      A('API経由で呼ぶ', 'API / SDK', '各社のAPIに、サーバー側からAPIキー付きで文章を送り、回答を受け取る。<b>キーは必ずサーバー側に置く</b>。', ['基本'], null, 'Next.jsのRoute HandlerでClaude（またはGemini）のAPIを呼び、フロントからはそのRouteを呼ぶ形でチャット機能を作って。APIキーは環境変数で。'),
      A('ストリーミング', 'Streaming', '回答を1文字ずつ流して表示する。待ち時間の体感が大きく減る。Vercel AI SDKなら簡単。'),
      A('構造化出力（JSON）', 'Structured Output', 'AIに決まった形のJSONで答えさせる。フォームの自動入力・分類・データ抽出に。', [], null, 'ユーザーの自由記述の問い合わせを、AIで {カテゴリ, 緊急度(1-3), 要約} のJSONに分類して。スキーマはZodで定義して検証して。'),
      A('ツール使用（関数呼び出し）', 'Tool Use / Function Calling', 'AIに「天気を調べる」「DBを検索する」などの関数を使わせる。AIが必要なときに呼び出し、結果を見て回答する。'),
      A('RAG', 'Retrieval-Augmented Generation', '自分の資料（マニュアル・FAQ・社内文書）を検索してAIに渡し、資料に基づいて答えさせる。', [], null, '社内FAQ（Markdown）を元に答えるチャットボットをRAGで作って。文書を分割してエンベディングし、Supabaseのpgvectorに保存、質問に近い文書を3件取り出して回答させ、出典も表示して。'),
      A('エンベディングとベクトル検索', 'Embeddings / Vector Search（pgvector, Chroma, Pinecone）', '文章を意味の数値（ベクトル）に変え、意味の近い文章を検索する。RAGや類似記事のおすすめに。'),
      A('MCP（Model Context Protocol）', 'MCP', 'AIアプリに外部のツールやデータ（GitHub・Slack・DB・ファイル）をつなぐための共通規格。自作のMCPサーバーで、Claudeなどから自分のサービスを操作できるようにもできる。', ['注目'], 'https://modelcontextprotocol.io/'),
      A('AIエージェント', 'Agents（Claude Agent SDK / OpenAI Agents SDK など）', '目標を与えると、計画・ツール使用・結果確認を繰り返して作業を進めるAI。SDKを使うと自作できる。'),
    ]),
    S('ライブラリ', [
      A('Vercel AI SDK', 'TypeScript', '複数のAI APIを同じ書き方で扱え、ストリーミング・ツール使用・チャットUIのフックが揃う。', ['おすすめ'], 'https://ai-sdk.dev/'),
      A('各社の公式SDK', 'Anthropic / OpenAI / Google GenAI SDK', '<code>@anthropic-ai/sdk</code>、<code>openai</code>、<code>@google/genai</code> など。最新機能は公式SDKが一番早く対応する。'),
      A('LangChain / LlamaIndex', '総合フレームワーク', 'RAG・エージェント・文書処理の部品が豊富。大きくなりがちなので、小さなアプリなら公式SDKだけでも十分。'),
      A('Transformers.js / WebLLM', 'ブラウザ内AI', 'サーバーなしで、ブラウザの中で小さなAIモデルを動かす。'),
    ]),
    S('運用のポイント', [
      A('料金を抑える', 'Cost control', '軽量モデルを使う、プロンプトキャッシュを活用、会話履歴を要約して短くする、同じ質問の結果をキャッシュ、利用上限（予算アラート）を設定。'),
      A('出力をチェックする', 'Evals / Guardrails', 'AIの回答は間違うことがある。重要な用途では、テスト用の質問セットで品質を定期的に確認（評価）し、危険な出力を防ぐ仕組みを入れる。'),
      A('プロンプトインジェクション対策', 'Prompt Injection', 'ユーザー入力やWebページに「今までの指示を無視して…」と書かれていてもAIが従わないよう、システムプロンプトで役割を固定し、AIに与える権限（ツール）を最小限にする。', ['セキュリティ']),
    ]),
  ]
});
})();
