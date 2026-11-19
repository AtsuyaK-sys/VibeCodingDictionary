# 編集のしかたとブランチのルール

この辞典は **1ページ（1冊）＝1ブランチ** で編集します。どのページをいつ・なぜ変えたかが追いやすく、気に入らない変更はそのページの分だけ取り消せます。

## ブランチの種類

| ブランチ | 役割 | 例 |
|---|---|---|
| `main` | 公開している完成版。**いつ開いても動く状態**を保つ | — |
| `page/<辞典名>` | 1冊の辞典を直す・増やす | `page/motion`、`page/security` |
| `new/<辞典名>` | 新しい辞典を作る | `new/accessibility` |
| `shared/<内容>` | 全ページ共通の部品（`assets/`・`index.html`）だけを変える | `shared/search-improve` |
| `docs/<内容>` | README などの説明だけを変える | `docs/readme` |

`<辞典名>` は HTML のファイル名から `.html` を取ったものです（`motion-math.html` → `page/motion-math`）。

## 1ページを編集する流れ

```bash
git switch main
git pull                          # 最新の完成版を取ってくる
git switch -c page/motion         # そのページ用のブランチを作る
# … data/motion-*.js などを編集して、ブラウザで確認 …
git add -A
git commit -m "motion: 〇〇の項目を追加"
git push -u origin page/motion
```

GitHub 上で **Pull Request** を作ると、変更の差分をページ単位で確認できます。問題なければ `main` にマージします。

## ページとファイルの対応

各辞典は「HTML 1つ ＋ `data/` の中身」でできています。そのページのブランチでは、基本的に下の表のファイルだけを触ります。

| 辞典（HTML） | 中身のファイル（`data/`） |
|---|---|
| `web-design.html` | `web-design-a.js` `-b.js` `-c.js` `web-design-demos.css` `web-design-skins.css` |
| `motion.html` | `motion-a.js` 〜 `motion-e.js` `motion.css` `motion-play.css` |
| `ui-components.html` | `ui.js` `ui.css` `ui-b.js` `ui-b.css` |
| `color-typography.html` | `color.js` `color.css` |
| `ux-writing.html` | `ux-a.js` `ux-b.js` `ux.css` |
| `motion-math.html` | `mm-a.js` `mm-b.js` `mm.css` |
| `dataviz.html` | `dv-a.js` `dv-b.js` `dv.css` |
| `video.html` | `video-a.js` `-b.js` `-c.js` `video.css` |
| `sound.html` | `sound.js` `sound-b.js` `sound-b.css` |
| `game-dev.html` | `game.js` `game-b.js` `game-b.css` |
| `image-prompts.html` | `ig-vocab.js` `ig-a.js` `ig-b.js` `ig.css` |
| `3d.html` | `threed-a.js` `threed-b.js` `threed.css` |
| `data-analysis.html` | `da-a.js` `da-b.js` `da.css` |
| `free-api.html` | `free-api-a.js` `-b.js` `-c.js` |
| `tech-stack.html` | `tech.js` |
| `ai-tools.html` | `ai.js` |
| `security.html` | `security-a.js` `-b.js` `-c.js` `security.css` |
| `database.html` | `db-a.js` `-b.js` `-c.js` `db.css` |
| `git-terminal.html` | `git-a.js` `git-b.js` `git.css` |
| `automation.html` | `au-a.js` `au-b.js` `au.css` |
| `payments.html` | `py-a.js` `py-b.js` `py.css` |
| `ai-integration.html` | `llm-a.js` `llm-b.js` `llm.css` |
| `start.html` | `start.js` `start.css` |
| `ai-basics.html` | `ab-a.js` `ab-b.js` `ab.css` |
| `ai-daily.html` | `ad-a.js` `ad-b.js` `ad.css` |
| `ai-workflow.html` | `wf-a.js` `wf-b.js` `wf.css` |
| `prompts.html` | `prompts.js` `prompts-b.js` `prompts-b.css` |
| `code-reading.html` | `cr-a.js` `cr-b.js` `cr.css` |
| `accessibility.html` | `a11y-a.js` `a11y-b.js` `a11y.css` |
| `licenses.html` | `lc-a.js` `lc-b.js` `lc.css`（設計書：`docs/design/licenses.md`） |
| `errors.html` | `errors.js` `errors-b.js` `errors-b.css` |
| `glossary.html` | `glossary.js` `glossary-b.js` |
| `release.html` | `release.js` `release-b.js` `release-b.css` |
| `testing.html` | `ts-a.js` `ts-b.js` `ts.css` |
| `app-distribution.html` | `ap-a.js` `ap-b.js` `ap.css` |
| `resources.html` | `resources.js` `resources-b.js` |

**タブを増やした・名前を変えたとき**は、同じブランチで `index.html` の `TOC`（一覧に出るタブ名）も合わせて直します。

**項目を足した・名前を変えたとき**は、一覧ページの横断検索用データを作り直して、一緒にコミットします（Node.js が必要です）。

```bash
node tools/build-search-index.js   # assets/search-index.js が更新される
```

## コミットメッセージ

先頭にページ名を付けます。あとから「このページの変更だけ」を探しやすくなります。

```
motion: スクロール演出に3項目を追加
security: 架空のAPIキーの見本を分割して記述
shared: 一覧ページに更新日を表示
docs: README に使い方を追記
```

## 項目を書くときの決まり

- 項目には **日本語の名前・英語の名前・説明・「AIへの指示例」** を付けます。AIへの指示例は日本語で書きます。
- 文章の説明だけより、**触って確かめられる見本**を優先します。
- 料金・法律・サービスの仕様など変わりやすい情報には「いつ時点か」を書きます。
- 本物のAPIキー・パスワード・個人情報は絶対に入れません。見本のキーは架空の値にし、**本物と同じ形のまま1つの文字列で書かない**ようにします（GitHub の自動検知で push が止まります）。
- 公開前に、幅の狭い画面（スマホ幅）と広い画面の両方で、はみ出しやエラーがないか確認します。
- このリポジトリは [MIT ライセンス](LICENSE) です。追加・修正した内容も同じライセンスで公開されます。他の人の文章・画像・コードを写して入れないでください（外部のライブラリは同梱せず、CDN から読み込みます）。

## 新しい辞典を追加するとき

1. `new/<辞典名>` ブランチを作ります。
2. `<辞典名>.html` と `data/<辞典名>.js` を作ります（既存の小さめの辞典、たとえば `ux-writing.html` を手本にします）。
3. `assets/dict.js` の `DICTS` に1行追加します（一覧とメニューに出ます）。
4. `index.html` の `TOC` にタブ名を、動く見本があれば `LIVE` にも追加します。
5. README の一覧にも1行足します。
