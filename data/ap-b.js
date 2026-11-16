/* アプリ・配布形態辞典 — B: デスクトップアプリ / ブラウザ拡張 / LINEミニアプリ・LIFF / 配布と更新 */
(function(){
const { $, $$, esc, tbl, seg, seq, stepper } = KIT;
const { S, C, T, verdict, sleep, phone, bars } = APH;

/* ================= 5. デスクトップアプリ ================= */
const DESK = [['Electron', 'JavaScript（Node.js）', 'Chromium をまるごと同梱', 120, 180, 'VS Code・Slack・Discord・Figma のデスクトップ版。情報が最も多い'], ['Tauri', 'JavaScript ＋ Rust', 'OSのWeb表示部品を使う', 8, 60, '軽い・速い・安全寄り。Rust を少し書く場面も'], ['Wails', 'JavaScript ＋ Go', 'OSのWeb表示部品を使う', 10, 60, 'Go が得意な人に'], ['Flutter（デスクトップ）', 'Dart', '独自に描画', 25, 80, 'スマホと同じコードでPCにも']];

TABS.push({ id:'desktop', label:'デスクトップアプリ', icon:'🖥',
  intro:'Windows・Mac 用のアプリも、<b>Web技術（HTML・CSS・JavaScript）</b>で作れます。定番は <b>Electron</b>（実績No.1）と <b>Tauri</b>（軽い）。PCのファイルを扱う・常駐する・オフラインで使う道具に向いています。配るときは<b>コード署名</b>をしないと、OSに「危険かも」と警告されます。',
  sections:[
    C('触って理解する', [
      { name:'Electron と Tauri の重さ', en:'Bundle size & memory', h:430, tags:['比較','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="ap-bars br kt-grow" style="align-content:center"></div><div class="kt-verdict res"></div><div class="kt-note">※数値は「最小限のアプリ」の大まかな目安。中身によって大きく変わります。</div></div>',
        init:(el) => { $(el, '.sw').replaceWith(seg(['インストーラーの大きさ', '起動時のメモリ'], i => { $(el, '.br').innerHTML = bars(DESK.map(d => [d[0], d[i ? 4 : 3], i ? 200 : 130, d[0] === 'Tauri' ? 'var(--ok)' : '']), 'MB');
            verdict($(el, '.res'), '', i ? 'Electron は<b>ブラウザ（Chromium）を丸ごと動かす</b>ので、メモリを多めに使います。Tauri・Wails は OS に入っている表示部品（Windows は WebView2、Mac は WKWebView）を使うので軽い。' : 'Electron は Chromium を同梱するため、<b>何もしないアプリでも100MB前後</b>。Tauri は数MBから。そのかわり Tauri は OS ごとの表示の違いに注意が必要です。'); }).el); },
        desc:'どちらも画面は Web 技術で作りますが、<b>Electron はブラウザを同梱</b>、<b>Tauri は OS の表示部品を借りる</b>という違いがあります。Electron は実績と情報量、どのOSでも同じ表示。Tauri は軽さとセキュリティ。迷ったら情報の多い Electron、配布サイズが気になるなら Tauri です。',
        prompt:'今の React のWebアプリを、Windows と Mac のデスクトップアプリにしたい。Electron と Tauri のどちらが合うか（配布サイズ・必要なOSの機能・自動アップデート・署名の手間）で比較して、選んだ方で最小の構成を作って。' },
      { name:'メインとレンダラーの安全な分け方', en:'Process model & IPC', h:480, tags:['仕組み','セキュリティ','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="kt-flow fl kt-grow" style="align-content:center"></div><div class="kt-code cd" style="white-space:pre;overflow:auto;max-height:120px"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.sw').replaceWith(seg(['画面から何でもできる（危険）', 'preload で窓口を絞る（安全）'], i => {
            $(el, '.fl').innerHTML = `<div class="kt-box">🪟 レンダラー<small>画面（Web）</small></div><span class="kt-arrow">${i ? '⇄ 決めた関数だけ' : '⇄ 何でも'}</span>${i ? '<div class="kt-box ok">🛡 preload<small>窓口（contextBridge）</small></div><span class="kt-arrow">⇄ IPC</span>' : ''}<div class="kt-box ${i ? '' : 'bad'}">⚙ メイン<small>Node.js・ファイル・OS</small></div>`;
            $(el, '.cd').textContent = i ? '// preload.js：画面に渡すのは「決めた関数」だけ\ncontextBridge.exposeInMainWorld("api", {\n  saveNote: (text) => ipcRenderer.invoke("save-note", text),\n});\n// BrowserWindow の設定\nwebPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, preload }' : '// ❌ 画面から Node.js を直接使える設定\nwebPreferences: { nodeIntegration: true, contextIsolation: false }\n// 画面で表示した文章に悪いスクリプトが混ざると…\nrequire("child_process").exec("…PCで何でも実行…");';
            verdict($(el, '.res'), i ? 'ok' : 'bad', i ? '✓ 画面（レンダラー）は Web と同じく制限された世界。PCの操作は<b>メイン</b>が担当し、画面からは <b>preload で決めた関数だけ</b>を呼べるようにします。' : '❌ 画面で表示した外部の文章（XSS）から、<b>PCのファイル削除や任意のプログラム実行</b>までできてしまいます。'); }).el); },
        desc:'Electron は、OSを操作できる<b>メイン</b>と、画面を表示する<b>レンダラー</b>に分かれています。画面から何でもできる設定（nodeIntegration）にすると、Webの小さな脆弱性がPC全体の乗っ取りにつながります。<b>preload と contextBridge で窓口を絞る</b>のが今の標準です。',
        prompt:'この Electron アプリのセキュリティを見直して。nodeIntegration を無効、contextIsolation と sandbox を有効にし、画面から使う機能（ファイル保存・読み込み）は preload の contextBridge で必要な関数だけを公開する形に作り直して。外部のURLは既定のブラウザで開くように。' },
      { name:'コード署名と OS の警告', en:'Code signing & notarization', h:440, tags:['配布','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="wv kt-grow" style="display:flex;flex-direction:column;gap:8px;justify-content:center"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.sw').replaceWith(seg(['署名なし', '署名あり（Windows）', '署名＋公証（Mac）'], i => {
            $(el, '.wv').innerHTML = i === 0 ? '<div class="ap-warn win"><b>Windows によって PC が保護されました</b>Microsoft Defender SmartScreen は認識されないアプリの起動を停止しました。このアプリを実行すると、PC に問題が起こる可能性があります。<br><u>詳細情報</u>　　［実行しない］</div><div class="ap-warn">🍎 <b>“メモ帳Pro”は開いていません</b><br>Apple は、“メモ帳Pro”にMacに損害を与えたり、プライバシーを侵害する可能性のあるマルウェアが含まれていないことを検証できませんでした。</div>' : i === 1 ? '<div class="ap-warn ok">✓ <b>発行元：Example Inc.</b>（確認済み）<br>ユーザーアカウント制御：このアプリがデバイスに変更を加えることを許可しますか？ ［はい］［いいえ］</div>' : '<div class="ap-warn ok">✓ <b>“メモ帳Pro”はインターネットからダウンロードされたアプリケーションです。開いてもよろしいですか？</b><br>Apple によって悪質なソフトウェアがないかチェック済みです。［開く］</div>';
            verdict($(el, '.res'), i ? 'ok' : 'bad', i === 0 ? '❌ 署名のないアプリは、<b>ほとんどの人が開くのをやめてしまう</b>警告が出ます。' : i === 1 ? '✓ Windows はコード署名証明書で署名すると、発行元の名前が表示されます（評判がたまるまで警告が出ることも）。' : '✓ Mac は Apple Developer Program で署名し、<b>公証（Notarization）</b>まで通すと普通に開けます。'); }).el); },
        desc:'インターネットから配るアプリは、<b>誰が作ったかを証明する署名</b>がないと、OSが強い警告を出します。Windows はコード署名証明書、Mac は Apple Developer Program（年額）での署名と<b>公証（Notarization）</b>が必要。費用はかかりますが、配るなら避けて通れません。社内だけで使うなら、配布方法を相談しましょう。',
        prompt:'Electron Forge（または electron-builder）で、Windows と Mac 向けのインストーラーを作り、Mac は署名と公証（notarize）、Windows はコード署名をして、GitHub Releases から自動アップデートできるように設定して。証明書や秘密の値は CI のシークレットに置いて。' },
    ], null, true),
    { title:'デスクトップアプリの作り方', note:'まずは<b>PWA をデスクトップにインストール</b>できないかも検討を。ファイル操作・常駐・OSとの深い連携が必要なら、Electron か Tauri です。',
      table:{ head:['方法', '言語', '画面の表示', '特徴'], rows:DESK.map(d => [d[0], d[1], d[2], d[5]]).concat([['PWA（インストール）', 'Web', 'ブラウザ', 'Chrome・Edge なら PC にもインストールできる。ファイル操作は制限あり']]) } },
    S('デスクトップアプリの用語', [
      T('メインプロセス', 'Main process', 'Electron で OS・ファイル・ウィンドウを担当する部分（Node.js）。'),
      T('レンダラープロセス', 'Renderer process', '画面を表示する部分（Chromium）。Web と同じく制限して使う。'),
      T('preload / contextBridge', 'Preload script', '画面に公開する関数を絞る窓口。', null, ['セキュリティ']),
      T('IPC', 'Inter-process communication', 'メインとレンダラーがメッセージをやりとりする仕組み。'),
      T('WebView2 / WKWebView', 'System webviews', 'Windows・Mac に入っている Web 表示部品。Tauri はこれを使うので軽い。'),
      T('コード署名', 'Code signing', '作った人を証明し、改ざんされていないことを示す電子署名。'),
      T('公証（Notarization）', 'Notarization', 'Mac で、Apple にアプリを検査してもらう手続き。配布には事実上必須。'),
      T('SmartScreen', 'Microsoft Defender SmartScreen', '知らないアプリの実行を止める Windows の仕組み。署名と実績（評判）で警告が減る。'),
      T('自動アップデート', 'Auto update', '新しい版を自動で取得して入れ替える。electron-updater・Tauri の updater。'),
      T('インストーラー', 'Installer', '.exe / .msi（Windows）、.dmg / .pkg（Mac）。Electron Forge・electron-builder で作る。'),
      T('トレイ常駐', 'System tray', 'タスクバー・メニューバーに小さく常駐する。通知や定期処理に。'),
    ]),
  ]});

/* ================= 6. ブラウザ拡張 ================= */
const MF = [['{', ''], ['  "manifest_version": 3,', 'manifest_version', '今の Chrome 拡張は<b>3（MV3）</b>。古い2はもう使えない。'], ['  "name": "キーワード蛍光ペン",', 'name', '拡張の名前。ストアと拡張機能の一覧に出る。'], ['  "version": "1.0.0",', 'version', '版。更新のたびに上げる。'], ['  "action": { "default_popup": "popup.html" },', 'action', 'ツールバーのアイコンを押したときに開く<b>ポップアップ</b>の画面。'], ['  "background": { "service_worker": "background.js" },', 'background', '裏で動く<b>サービスワーカー</b>。イベントで起きて、用が済むと眠る（常駐しない）。'], ['  "content_scripts": [{ "matches": ["https://*/*"], "js": ["content.js"] }],', 'content_scripts', '開いている<b>Webページの中</b>で動くスクリプト。ページの文字や見た目を変えられる。'], ['  "permissions": ["storage", "activeTab", "scripting"],', 'permissions', '使う機能の許可。<b>必要最小限</b>に。多いとインストール時に強い警告が出て、審査も厳しくなる。'], ['  "host_permissions": ["https://example.com/*"]', 'host_permissions', 'どのサイトのページを読める・変えられるか。「すべてのサイト」は最も警戒される。'], ['}', '']];
const PERMS = [['storage', '設定の保存', ''], ['activeTab', '押したときだけ、今のタブにアクセス', ''], ['scripting', 'ページにスクリプトを入れる', ''], ['tabs', 'タブのURL・タイトルを読む', '閲覧履歴の読み取り'], ['all', 'すべてのサイト（https://*/*）', 'すべてのウェブサイト上にある自分のデータの読み取りと変更'], ['history', '閲覧履歴', '閲覧履歴の読み取りと変更'], ['cookies', 'Cookie', '']];

TABS.push({ id:'extension', label:'ブラウザ拡張', icon:'🧩',
  intro:'<b>ブラウザ拡張機能</b>は、Chrome などに機能を足す小さなプログラムです。見ているページの文字に印を付ける・情報を集める・ボタンを足す…。<b>manifest.json</b> で部品と権限を宣言し、<b>ポップアップ・裏方（サービスワーカー）・ページ内のスクリプト</b>がメッセージでやりとりします。',
  sections:[
    C('触って理解する', [
      { name:'manifest.json（MV3）の中身', en:'Extension manifest', h:440, tags:['拡張','体験'],
        demo:'<div class="kt"><div class="kt-code an kt-grow" style="white-space:pre;overflow:auto"></div><div class="kt-verdict res">紫色の項目をクリックしてください。</div></div>',
        init:(el) => { $(el, '.an').innerHTML = MF.map(([l, k]) => { let h = esc(l).replace(/(&quot;[^&]*?&quot;)/g, '<span class="s">$1</span>'); if (k) h = h.replace(`<span class="s">&quot;${k}&quot;</span>`, `<span class="k" data-k="${k}" style="cursor:pointer;text-decoration:underline dotted">"${k}"</span>`); return h; }).join('\n');
          $$(el, '.an [data-k]').forEach(s => s.onclick = () => verdict($(el, '.res'), '', `<b>${s.dataset.k}</b>：${MF.find(m => m[1] === s.dataset.k)[2]}`)); },
        desc:'拡張機能の設計図が <b>manifest.json</b>。今は <b>Manifest V3（MV3）</b>が必須で、裏方は常駐せずイベントで起きる<b>サービスワーカー</b>になりました。何ができるかは <b>permissions</b> と <b>host_permissions</b> で宣言し、インストールする人に確認されます。',
        prompt:'Chrome 拡張（Manifest V3）で、開いているページの中から指定したキーワードを蛍光ペンで強調する拡張を作って。ポップアップでキーワードを入力して保存（chrome.storage）、ボタンを押したら今のタブだけに適用（activeTab ＋ scripting）。権限は最小限にして。' },
      { name:'部品どうしのやりとり', en:'Popup ↔ content script', h:500, tags:['拡張','体験','仕組み'],
        demo:'<div class="kt"><div class="ap-br br"><div class="tb"><span>◀ ▶ ↻</span><span class="url">https://example.com/blog/vibe-coding</span><span class="ext" title="拡張のアイコン">🖍</span></div><div class="pg">バイブコーディングでは、AIに<span>要件</span>を伝えて作ってもらいます。<span>要件</span>があいまいだと、AIは推測で埋めてしまいます。だからこそ、最初に<span>画面</span>と<span>データ</span>を決めておくことが大切です。</div></div><div class="au-log lg" style="font:11px/1.6 var(--mono);background:var(--code-bg);border:1px solid var(--border);border-radius:8px;padding:6px 8px;height:84px;overflow:auto"></div></div>',
        init:(el) => { const br = $(el, '.br'), lg = $(el, '.lg'), L = (t) => { lg.insertAdjacentHTML('beforeend', `<div>${t}</div>`); lg.scrollTop = 1e6; }; let open = false;
          L('// アイコンを押してポップアップを開いてください');
          $(el, '.ext').onclick = () => { open = !open; const p = $(br, '.pop'); if (p){ p.remove(); return; } br.insertAdjacentHTML('beforeend', '<div class="pop"><b>🖍 キーワード蛍光ペン</b><input class="kt-in kw" value="要件" aria-label="キーワード" style="font-size:11px;padding:4px 6px"><button type="button" class="kt-btn pri sm go">このページで強調</button></div>'); L('popup.html が開いた');
            $(br, '.go').onclick = async () => { const w = $(br, '.kw').value.trim(); L(`popup → <b>chrome.storage</b> に「${esc(w)}」を保存`); await sleep(300); L('popup → <b>chrome.scripting.executeScript</b>（今のタブに content.js を入れる）'); await sleep(300); L(`content.js → ページの中の「${esc(w)}」を探して &lt;mark&gt; で囲む`);
              const pg = $(br, '.pg'); pg.innerHTML = pg.innerHTML.replace(/<\/?mark[^>]*>/g, ''); if (w) pg.innerHTML = pg.innerHTML.replace(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), (m) => `<mark class="ap-mk">${m}</mark>`); await sleep(200); L(`content.js → popup：<b>${$$(pg, 'mark').length}件</b>強調しました（chrome.runtime.sendMessage）`); }; }; },
        desc:'拡張機能は3つの部品でできています。ツールバーから開く<b>ポップアップ</b>、裏で待機する<b>サービスワーカー</b>、Webページの中で動く<b>コンテンツスクリプト</b>。それぞれ別の世界で動くので、<code>chrome.runtime.sendMessage</code> などの<b>メッセージ</b>でやりとりします。アイコンを押して試してみましょう。',
        prompt:'Chrome 拡張で、ポップアップのボタンを押すと、今開いているページの見出し（h1〜h3）を一覧にしてポップアップに表示する機能を作って。ポップアップ・コンテンツスクリプト間のメッセージのやりとりと、ページを移動したときの扱いも含めて。' },
      { name:'権限とインストール時の警告', en:'Permissions & warnings', h:480, tags:['拡張','セキュリティ','体験'],
        demo:'<div class="kt"><div class="cks" style="display:flex;flex-wrap:wrap;gap:4px 12px;font-size:11.5px"></div><div class="ap-perm pm"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.cks').innerHTML = PERMS.map(([k, l], i) => `<label><input type="checkbox" data-i="${i}"${i < 3 ? ' checked' : ''}>${l}</label>`).join('');
          const run = () => { const on = $$(el, '.cks input').filter(i => i.checked).map(i => PERMS[+i.dataset.i]), w = on.filter(p => p[2]);
            $(el, '.pm').innerHTML = `<b>「キーワード蛍光ペン」を追加しますか？</b>${w.length ? `<div style="margin-top:4px">次の権限が必要です：</div><ul style="margin:2px 0">${w.map(p => `<li class="${p[0] === 'all' || p[0] === 'history' ? 'hi' : ''}">${p[2]}</li>`).join('')}</ul>` : '<div style="margin-top:4px;color:var(--muted)">特別な警告はありません。</div>'}<div style="text-align:right;margin-top:6px"><span class="kt-btn sm">キャンセル</span> <span class="kt-btn sm pri">拡張機能を追加</span></div>`;
            const risky = on.some(p => p[0] === 'all' || p[0] === 'history'); verdict($(el, '.res'), risky ? 'bad' : w.length ? 'warn' : 'ok', risky ? '❌ 「すべてのサイト」「閲覧履歴」は、利用者に<b>強い警告</b>が出て、ストアの審査も厳しく時間がかかります。本当に必要か見直しましょう。' : w.length ? '△ 警告が出ます。必要な理由をストアの説明に書きましょう。' : '✓ <b>activeTab</b> なら「アイコンを押したときだけ、そのタブに」アクセスでき、警告も出ません。多くの拡張はこれで足ります。'); };
          $$(el, '.cks input').forEach(i => i.onchange = run); run(); },
        desc:'拡張機能は、許可されると<b>見ているページの中身を読んだり変えたり</b>できる強い力を持ちます。だから権限が多いほど、インストール時に強い警告が出て、ストアの審査も厳しくなります。<b>activeTab</b>（押したときだけ今のタブに）で足りないか、まず考えましょう。',
        prompt:'この Chrome 拡張の権限を見直して、必要最小限にして。"<all_urls>" をやめて activeTab ＋ scripting で動くように書き換え、どうしても必要な権限には Chrome ウェブストアの審査用に「なぜ必要か」の説明文も書いて。' },
      { name:'Chrome ウェブストアに出すまで', en:'Publishing to Chrome Web Store', h:420, tags:['流れ'],
        init:(el) => stepper(el, ['<b>開発者登録</b><br>Chrome ウェブストアのデベロッパーダッシュボードで登録（1回だけ5ドル）。', '<b>zip にまとめる</b><br>manifest.json がある階層を zip にしてアップロード。', '<b>ストアの情報</b><br>説明・スクリーンショット（1280×800 など）・アイコン（128px）・カテゴリ。', '<b>プライバシーの申告</b><br>集めるデータ・使い道・<b>権限ごとの理由</b>。プライバシーポリシーのURL。', '<b>審査</b><br>権限が少なければ早い。広い権限・遠隔のコードは時間がかかる・落ちる。', '<b>公開</b><br>公開・限定公開（URLを知る人だけ）・非公開（テスター）を選べる。社内向けは限定公開が便利。'], { title:'公開の流れ' }),
        desc:'作った拡張は、自分のPCでは「パッケージ化されていない拡張機能を読み込む」で試せます。人に配るなら <b>Chrome ウェブストア</b>に審査を通して公開。<b>外部からコードを読み込んで実行する</b>ことは禁止されているので、必要なコードはすべて拡張の中に入れておきます。Edge・Firefox にもほぼ同じ形で出せます。',
        prompt:'作った Chrome 拡張を Chrome ウェブストアに出したい。必要な画像のサイズ、説明文、権限ごとの理由の書き方、プライバシーの申告の書き方、審査で落ちやすい点を教えて。Firefox と Edge にも出すときの違いも。' },
    ], null, true),
    S('ブラウザ拡張の用語', [
      T('Manifest V3', 'MV3', '今の Chrome 拡張の仕様。裏方はサービスワーカー、外部コードの実行禁止など、安全寄りになった。', null, ['基本']),
      T('サービスワーカー（拡張）', 'Background service worker', 'イベントで起きて処理し、用がなければ眠る裏方。変数はすぐ消えるので、保存は chrome.storage に。', null, ['よくある失敗']),
      T('コンテンツスクリプト', 'Content script', 'Webページの中で動くスクリプト。ページのDOMは触れるが、拡張の多くのAPIは使えない。'),
      T('ポップアップ', 'Popup', 'ツールバーのアイコンを押すと開く小さな画面。閉じると中身は消える。'),
      T('オプションページ', 'Options page', '拡張の設定画面。'),
      T('activeTab', 'activeTab', '利用者がアイコンを押したときだけ、そのタブへの一時的なアクセスを得る権限。警告なし。', null, ['おすすめ']),
      T('chrome.storage', 'chrome.storage', '拡張用の保存場所。sync なら同じアカウントの他のPCとも同期。'),
      T('メッセージング', 'Messaging', '部品どうしのやりとり。chrome.runtime.sendMessage / chrome.tabs.sendMessage。'),
      T('WXT / Plasmo', 'Extension frameworks', '拡張を React・Vue・TypeScript で作りやすくし、Chrome・Firefox 両方に出力できる道具。'),
      T('限定公開', 'Unlisted', 'ストアの検索には出ず、URLを知っている人だけが入れられる公開方法。社内配布に便利。'),
      T('Safari の拡張', 'Safari Web Extension', 'Mac・iPhone の Safari 用。Xcode でアプリに包んで App Store から配る。'),
    ]),
  ]});

/* ================= 7. LINEミニアプリ・LIFF ================= */
const LIFFUSE = [['会員証・ポイントカード', 'LINEを開けばすぐ出せる。カードを持ち歩かなくてよい'], ['予約・順番待ち', 'LINEのログインで名前入力が不要。前日のお知らせもLINEで'], ['モバイルオーダー', '席のQRコードから注文。アプリのインストール不要'], ['アンケート・キャンペーン', '友だちにシェアしてもらいやすい'], ['社内ツール', '社員がいつも使う LINE WORKS / LINE から開ける']];

TABS.push({ id:'line', label:'LINEミニアプリ', icon:'🟩',
  intro:'<b>LIFF（LINE Front-end Framework）</b>を使うと、普通のWebアプリを<b>LINEの中で開いて</b>、LINEのログイン情報（名前・アイコン）を使ったり、トークにメッセージを送ったりできます。これを LINE の仕組みに沿って公開したものが<b>LINEミニアプリ</b>。お店の会員証・予約・注文に定番です。',
  sections:[
    C('触って理解する', [
      { name:'LIFF アプリの動き', en:'LIFF app', h:540, tags:['LINE','体験','定番'],
        demo:'<div class="kt"><div class="ap-wrap st"><div class="ph" style="height:100%;display:flex"></div><div class="side" style="flex:1;min-width:0;max-width:280px;display:flex;flex-direction:column;gap:6px;height:100%"><div class="kt-row bt"></div><div class="kt-code cd" style="flex:1;overflow:auto;white-space:pre;min-height:0"></div></div></div></div>',
        init:(el) => { let st = 0; const prof = { displayName:'山田 太郎', userId:'U1a2b3c4d5e6f…', pictureUrl:'https://profile.line-scdn.net/…' };
          const S0 = [['① 開く', 'https://liff.line.me/1234567890-AbCdEfGh\n// LINEのトークやリッチメニューのリンクから開く', '<div class="ap-mini" style="flex:1;display:grid;place-items:center;color:var(--muted)">読み込み中…</div>'], ['② 初期化', 'import liff from "@line/liff";\nawait liff.init({ liffId: "1234567890-AbCdEfGh" });\n// LINEの中なら自動でログイン済みになる', '<div class="ap-mini" style="flex:1;display:grid;place-items:center;color:var(--muted)">✓ LIFF の準備ができました</div>'], ['③ プロフィール', 'const profile = await liff.getProfile();\n// ' + JSON.stringify(prof, null, 2).replace(/\n/g, '\n// '), '<div class="ap-card"><span style="font-size:10px;opacity:.85">メンバーズカード</span><b style="font-size:13px">山田 太郎 様</b><span style="font-size:10px">ゴールド会員・1,240pt</span><div class="ap-barcode"></div></div><div class="ap-mini"><button type="button" class="ap-btn">予約する</button><button type="button" class="ap-btn sub">友だちに紹介</button></div>'], ['④ シェア', 'await liff.shareTargetPicker([\n  { type: "text", text: "このお店おすすめ！ 初回10%オフ👉 https://…" },\n]);\n// 送り先を選ぶ画面が開き、友だちに送れる', '<div class="ap-mini"><b>送信先を選択</b>' + ['👩 さくら', '👨 けんた', '👥 家族グループ'].map(n => `<label style="display:flex;gap:6px;align-items:center;padding:4px;border-bottom:1px solid var(--border)"><input type="checkbox">${n}</label>`).join('') + '<button type="button" class="ap-btn">送信</button></div>']];
          const draw = () => { $(el, '.ph').innerHTML = phone(`<div class="ap-lhead">✕　<span style="flex:1;text-align:center">ABCカフェ 会員証</span>⋯</div>${S0[st][2]}`); $(el, '.cd').textContent = S0[st][1]; $$(el, '.bt button').forEach((b, i) => b.classList.toggle('pri', i === st)); };
          $(el, '.bt').innerHTML = S0.map((s, i) => `<button type="button" class="kt-btn sm" data-i="${i}">${s[0]}</button>`).join(''); $$(el, '.bt button').forEach(b => b.onclick = () => { st = +b.dataset.i; draw(); }); draw(); },
        desc:'LIFF アプリは、<b>LINEの中のブラウザで開く普通のWebアプリ</b>です。<code>liff.init()</code> のあと、<code>liff.getProfile()</code> で名前とアイコン、<code>shareTargetPicker()</code> で友だちへのシェア、などができます。名前の入力や会員登録の手間がなくなるのが最大の利点。ボタンで流れを見てみましょう。',
        prompt:'LIFF で、カフェの会員証アプリを Next.js で作って。liff.init のあと getProfile で名前を表示し、会員番号のバーコードを表示、「友だちに紹介」で shareTargetPicker を開く。サーバー側では liff.getIDToken() を検証してから会員情報を返すようにして（プロフィールの値をそのまま信じない）。' },
      { name:'普通のWeb・LIFF・LINEミニアプリ', en:'Web vs LIFF vs MINI App', h:420, tags:['比較','体験'],
        demo:'<div class="kt"><span class="sw"></span><div class="tb kt-tblwrap kt-grow"></div></div>',
        init:(el) => { const D = [['普通のWebサイト', [['開き方', 'URL・検索'], ['ログイン', '自分で作る（メール・Google など）'], ['LINEとの連携', 'なし（LINEログインを入れれば可）'], ['審査', 'なし'], ['向いている', '誰にでも見てもらうページ']]], ['LIFF アプリ', [['開き方', 'LINEのトーク・リッチメニュー・QRコードのリンク'], ['ログイン', 'LINEのアカウントで自動'], ['LINEとの連携', 'プロフィール・シェア・トークへの送信'], ['審査', 'なし（LINE Developers で作るだけ）'], ['向いている', '自分の公式アカウントの友だち向け']]], ['LINEミニアプリ', [['開き方', 'LINE内の検索・ミニアプリ一覧・リンク'], ['ログイン', 'LINEのアカウントで自動'], ['LINEとの連携', 'LIFF の機能 ＋ サービスメッセージ（予約完了などの通知）など'], ['審査', 'あり（認証済みミニアプリになると機能が増える）'], ['向いている', '店舗・サービスの本格的な窓口']]]];
          $(el, '.sw').replaceWith(seg(D.map(d => d[0]), i => { $(el, '.tb').innerHTML = `<table class="kt-tbl">${D[i][1].map(([k, v]) => `<tr><th style="width:30%">${k}</th><td style="white-space:normal">${v}</td></tr>`).join('')}</table>`; }, 1).el); },
        desc:'<b>LIFF</b> は「LINEの中でWebを開く」ための仕組みで、審査なしで作れます。それを LINE の決まりに沿って公開・審査を受けたものが <b>LINEミニアプリ</b>で、LINEの中で検索されたり、予約完了などの<b>サービスメッセージ</b>を送れたりします。まずは LIFF で作り、本格的にするならミニアプリへ、が定番の流れです。',
        prompt:'飲食店のモバイルオーダーを作りたい。普通のWeb・LIFF・LINEミニアプリのどれで作るべきか、できること・審査・費用・開発の手間で比較して。LINEミニアプリにする場合の申請の流れも教えて（最新の公式情報で）。' },
    ], null, true),
    { title:'LINEミニアプリ・LIFF の使いどころ', note:'お客さまが<b>すでにLINEで友だちになっている</b>なら、アプリを入れてもらうより圧倒的に届きやすくなります。',
      table:{ head:['使いどころ', '良いところ'], rows:LIFFUSE } },
    S('LIFF・LINEミニアプリの用語', [
      T('LIFF', 'LINE Front-end Framework', 'LINEの中でWebアプリを開き、LINEの機能と連携させる仕組み。', null, ['基本']),
      T('LIFF ID', 'LIFF ID', 'LINE Developers で LIFF アプリを作ると発行される番号。liff.init に渡す。'),
      T('LINE Developers', 'LINE Developers Console', 'チャネル（LINEログイン・Messaging API）や LIFF アプリを作る管理画面。'),
      T('LINEログイン', 'LINE Login', 'LINEのアカウントでログインする仕組み。普通のWebサイトにも入れられる。'),
      T('IDトークン', 'ID token', 'ログインした人を証明する印。<b>サーバーで検証</b>してから、その人のデータを返す。', null, ['セキュリティ']),
      T('shareTargetPicker', 'Share target picker', '送り先を選んで、友だちやグループにメッセージを送れる画面を開く。'),
      T('サービスメッセージ', 'Service messages', 'LINEミニアプリから、予約完了・注文受付などのお知らせを送れる仕組み。'),
      T('外部ブラウザで開いたとき', 'Opened outside LINE', 'LIFF のURLを普通のブラウザで開くと、LINEログインの画面になる。どちらでも動くように作る。'),
      T('リッチメニュー', 'Rich menu', 'トーク画面の下のボタン。LIFF アプリの入口に置くのが定番。'),
    ]),
  ]});

/* ================= 8. 配布と更新 ================= */
TABS.push({ id:'release', label:'配布と更新', icon:'🚀',
  intro:'アプリは<b>出してからが本番</b>です。版の番号の付け方、<b>少しずつ配る（段階的公開）</b>、古い版を使い続けている人への<b>更新のお願い</b>、リンクからアプリの画面を開く<b>ディープリンク</b>など、公開後に必要な仕組みをまとめます。',
  sections:[
    C('触って理解する', [
      { name:'版の番号とビルド番号', en:'Version & build numbers', h:420, tags:['基本','体験'],
        demo:'<div class="kt"><div class="kt-row"><span class="kt-lbl">今の版</span><b class="kt-mono cur" style="font-size:18px"></b><span class="kt-lbl">ビルド</span><b class="kt-mono bn" style="font-size:18px"></b></div><div class="kt-row bt"></div><div class="au-log lg kt-grow" style="font:11.5px/1.6 var(--mono);background:var(--code-bg);border:1px solid var(--border);border-radius:8px;padding:6px 8px;overflow:auto"></div><div class="kt-verdict res">変更の内容を選んでください。</div></div>',
        init:(el) => { let v = [1, 4, 2], b = 37; const draw = () => { $(el, '.cur').textContent = v.join('.'); $(el, '.bn').textContent = b; };
          const K = [['不具合の修正', 2, '3つ目（パッチ）を上げる'], ['機能を追加', 1, '2つ目（マイナー）を上げ、3つ目を0に'], ['大きな作り直し', 0, '1つ目（メジャー）を上げ、残りを0に'], ['同じ版を審査に出し直す', -1, '版はそのまま、<b>ビルド番号だけ</b>上げる']];
          $(el, '.bt').innerHTML = K.map((k, i) => `<button type="button" class="kt-btn sm" data-i="${i}">${k[0]}</button>`).join('');
          $$(el, '.bt button').forEach(x => x.onclick = () => { const [n, p, how] = K[+x.dataset.i], old = v.join('.'); if (p >= 0){ v[p]++; for (let i = p + 1; i < 3; i++) v[i] = 0; } b++; draw();
            $(el, '.lg').insertAdjacentHTML('beforeend', `<div>${n}：${old} → <b>${v.join('.')}</b>（ビルド ${b}）</div>`); $(el, '.lg').scrollTop = 1e6; verdict($(el, '.res'), '', `${how}。ストアは<b>ビルド番号が前より大きい</b>ことを求めます（同じ番号では提出できない）。`); }); draw(); },
        desc:'アプリには、人が見る<b>版の番号</b>（1.4.2 のような <b>セマンティックバージョニング</b>）と、ストアが区別に使う<b>ビルド番号</b>（毎回増える整数）の2つがあります。修正なら3つ目、機能追加なら2つ目、大きな変更なら1つ目を上げます。ビルド番号は<b>提出のたびに必ず増やす</b>。',
        prompt:'Expo のアプリで、版の番号（version）とビルド番号（ios.buildNumber / android.versionCode）を EAS で自動的に増やす設定にして。リリースノートを CHANGELOG.md から作る手順も教えて。' },
      { name:'少しずつ配る（段階的公開）', en:'Staged rollout', h:470, tags:['運用','体験'],
        demo:'<div class="kt"><div class="kt-row"><span class="kt-lbl">新しい版を配る割合</span><input type="range" min="0" max="100" step="5" value="10" class="pc" style="flex:1" aria-label="割合"><b class="kt-mono pv"></b></div><label class="kt-row" style="font-size:11.5px"><input type="checkbox" class="bug">新しい版に、まれに落ちる不具合がある</label><div class="ap-users us kt-grow" style="align-content:center"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const N = 200, order = Array.from({ length:N }, (_, i) => (i * 73) % N), crash = new Set([3, 41, 97, 150, 188, 12, 66, 120]);
          const run = () => { const p = +$(el, '.pc').value, bug = $(el, '.bug').checked, cnt = Math.round(N * p / 100), on = new Set(order.slice(0, cnt)); let hit = 0;
            $(el, '.pv').textContent = p + '%'; $(el, '.us').innerHTML = Array.from({ length:N }, (_, i) => { const n = on.has(i), c = n && bug && crash.has(i); if (c) hit++; return `<i class="${c ? 'crash' : n ? 'new' : ''}"></i>`; }).join('');
            verdict($(el, '.res'), bug && hit ? (p > 30 ? 'bad' : 'warn') : 'ok', bug ? (hit ? `🔴 ${hit}人で落ちています。<b>${p}%</b>の段階なので、${p > 30 ? 'もう多くの人に届いてしまいました。' : '<b>ここで止めれば</b>、残りの人には届きません。修正版を作ってから再開しましょう。'}` : 'まだ不具合に当たった人はいません。クラッシュの報告を見ながら割合を上げます。') : `新しい版：<b>${cnt}人</b>／${N}人。問題がなければ 1% → 10% → 50% → 100% と数日かけて広げます。`); };
          $(el, '.pc').oninput = run; $(el, '.bug').onchange = run; run(); },
        desc:'新しい版をいきなり全員に配ると、不具合があったとき<b>全員が困ります</b>。最初は一部の人（1〜10%）だけに配り、<b>クラッシュや問い合わせを見ながら</b>少しずつ広げるのが段階的公開。問題が見つかったら止めて、修正版を出します。Webでも「フィーチャーフラグ」で同じことができます。',
        prompt:'アプリの新しい版を Google Play では段階的公開（5%→20%→50%→100%）、App Store では段階的リリースで配りたい。クラッシュの監視（Sentry / Crashlytics）を入れて、どのくらいのクラッシュ率で止めるかの基準も決めて。' },
      { name:'古い版への更新のお願い', en:'Forced / soft updates', h:470, tags:['運用','体験'],
        demo:'<div class="kt"><div class="kt-row" style="font-size:11.5px;gap:10px"><label>利用者の版 <select class="kt-in v" style="width:auto"><option>1.2.0</option><option selected>1.4.0</option><option>2.0.1</option></select></label><span class="kt-lbl">サーバーの設定：最低 1.3.0 ／ 最新 2.0.1</span></div><div class="ap-wrap ph"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { const cmp = (a, b) => { const x = a.split('.').map(Number), y = b.split('.').map(Number); for (let i = 0; i < 3; i++){ if (x[i] !== y[i]) return x[i] - y[i]; } return 0; };
          const run = () => { const v = $(el, '.v').value, must = cmp(v, '1.3.0') < 0, soft = !must && cmp(v, '2.0.1') < 0;
            $(el, '.ph').innerHTML = phone(`<div class="ap-bar" style="padding-top:20px">☕ ABCカフェ</div><div style="padding:8px;display:flex;flex-direction:column;gap:6px"><div style="height:40px;border-radius:8px;background:var(--surface-2)"></div><div style="height:12px;border-radius:4px;background:var(--surface-2)"></div></div>${must ? '<div class="ap-dim"></div><div class="ap-dlg"><b>アップデートが必要です</b>お使いの版は利用できなくなりました。最新版に更新してください。<div class="bts"><span>ストアを開く</span></div></div>' : soft ? '<div style="position:absolute;left:6px;right:6px;bottom:18px;border-radius:10px;padding:8px;background:var(--accent);color:#fff;font-size:10px;z-index:4">✨ 新しい版があります（予約の変更ができるように）<br><u>更新する</u>　　あとで</div>' : ''}`);
            verdict($(el, '.res'), must ? 'bad' : soft ? 'warn' : 'ok', must ? '<b>強制アップデート</b>：最低限の版より古いので、更新するまで使えない画面を出す。APIの仕様が変わった・重大な不具合があるときだけ。' : soft ? '<b>おすすめの更新</b>：使い続けられるが、控えめに案内する。毎回しつこく出さない。' : '最新版です。何も出さない。'); };
          $(el, '.v').onchange = run; run(); },
        desc:'アプリは<b>利用者が更新しない限り古い版のまま</b>。サーバー側の仕組みを変えると、古い版が動かなくなることがあります。起動時にサーバーへ「最低限必要な版」を問い合わせ、それより古ければ<b>更新が必要な画面</b>、少し古いだけなら<b>控えめな案内</b>を出します。',
        prompt:'アプリの起動時に、サーバーの /api/app-config から「最低限の版」と「最新の版」を取得し、最低より古ければ更新必須の画面（ストアへのボタンのみ）、最新より古ければ閉じられる案内バナーを出す仕組みを Expo で作って。版の比較はセマンティックバージョニングで。' },
      { name:'リンクからアプリの画面を開く', en:'Deep links / Universal Links', h:430, tags:['仕組み','体験'],
        demo:'<div class="kt"><div class="kt-row"><span class="kt-lbl">リンク</span><code class="kt-mono">https://cafe.example.com/menu/42</code></div><span class="sw"></span><div class="kt-flow fl kt-grow" style="align-content:center"></div><div class="kt-verdict res"></div></div>',
        init:(el) => { $(el, '.sw').replaceWith(seg(['アプリが入っている', 'アプリが入っていない'], i => { $(el, '.fl').innerHTML = `<div class="kt-box">🔗 リンクをタップ<small>メール・SNS・QR</small></div><span class="kt-arrow">→</span>${i ? '<div class="kt-box">🌐 Webサイトの<br>同じページ<small>/menu/42</small></div><span class="kt-arrow">→</span><div class="kt-box">📲 「アプリで開く」<small>ストアへ案内</small></div>' : '<div class="kt-box ok">📱 アプリの<br>メニュー42の画面<small>直接開く</small></div>'}`;
            verdict($(el, '.res'), i ? 'warn' : 'ok', i ? 'アプリがなくても<b>Webで同じページが開く</b>ので、リンクが無駄になりません。' : '✓ 同じURLで、アプリが入っていれば<b>アプリの該当画面</b>が直接開きます（iPhone はユニバーサルリンク、Android はアプリリンク）。'); }).el); },
        desc:'<b>ディープリンク</b>は、リンクからアプリの特定の画面を開く仕組みです。普通の https のURLを使う<b>ユニバーサルリンク（iPhone）・アプリリンク（Android）</b>にすると、アプリがあればアプリで、なければWebで開くので安心。サイト側に「このアプリと関係があります」というファイルを置いて設定します。',
        prompt:'Expo のアプリで、https://cafe.example.com/menu/:id のリンクからメニュー詳細の画面を直接開けるようにして。iPhone のユニバーサルリンク（apple-app-site-association）と Android のアプリリンク（assetlinks.json）の設定、Expo Router での受け取り方を教えて。' },
    ], null, true),
    S('配布と更新の用語', [
      T('セマンティックバージョニング', 'Semantic Versioning', '「メジャー.マイナー.パッチ」で版を表すルール。互換性のない変更・機能追加・修正。', null, ['基本']),
      T('ビルド番号', 'Build number', 'ストアが区別に使う、提出のたびに増やす番号。'),
      T('リリースノート', 'Release notes', '新しい版で何が変わったかの説明。「不具合を修正しました」だけより具体的に。'),
      T('段階的公開', 'Staged rollout', '一部の人から少しずつ配ること。'),
      T('フィーチャーフラグ', 'Feature flag', '機能のオン・オフをサーバーの設定で切り替える仕組み。アプリの更新なしで機能を出し入れできる。'),
      T('強制アップデート', 'Forced update', '古い版を使えなくして更新を求めること。最後の手段。'),
      T('クラッシュレポート', 'Crash reporting', 'アプリが落ちたときの情報を自動で集める。Sentry・Firebase Crashlytics。', null, ['定番']),
      T('ロールバック', 'Rollback', '問題のある版をやめて前の版に戻すこと。ストアアプリは戻せないので「修正版を出す」になる。', null, ['注意']),
      T('ユニバーサルリンク・アプリリンク', 'Universal Links / App Links', 'https のURLでアプリを開く仕組み。アプリがなければWebで開く。'),
      T('アプリの評価のお願い', 'In-app review', 'アプリ内でストアの評価を求める公式の仕組み。<b>良い体験の直後</b>に、控えめに。'),
      T('アナリティクス', 'Analytics', '使われ方の計測。どの画面で離れているか、どの機能が使われているか。プライバシーの申告も忘れずに。'),
    ]),
  ]});
})();
