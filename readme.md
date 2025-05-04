# 温泉街で使うwebHookとか
[スプシの構成例](https://github.com/ocamimic/onsengai-rss/blob/main/example-gss.png)

## spreadSheetとGASを連携させる手順について
1. スプレッドシートを作成する
2. 上部のリボンから拡張機能>Apps Script
3. コード.gsにこのリポジトリのコード.gsをコピペ
4. GASのエディタ画面、左端の時計マーク(トリガー)から、以下の設定でトリガーを作成
 * **実行する関数を選択:** getArticles
 * **イベントのソースを選択:** 時間主導型
 * **時間ベースのトリガーのタイプを選択:** 分ベースのタイマー
 * **時間の間隔を選択(分):** 1分おき
5. ひとまずこれで動くはず

# 参考記事
https://note.com/taatn0te/n/nacada2f4dfd2
