function getFeeds() {
  // feedシートのA1:B最終行を取得する。
  //シート名を任意に設定するときは"getSheetByName"の後ろを適宜変えること。
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('feed');
  const lastRow = sheet.getDataRange().getLastRow();
  const values = sheet.getRange(1,1,lastRow,2).getValues();

  const feeds = [];
  values.forEach((value) => {
    const feed = {};
    feed["name"] = value[0];
    feed["link"] = value[1];

    feeds.push(feed);
  });

  return feeds
}
/**
 * RSSフィードから記事を取得する
 * この辺は参考記事のまま。いじる必要が無かったので……
 */
function getArticles() {
  // フィード定義を取得
  const feeds = getFeeds();

  for (const feed of feeds) {
    // RSSの読み込み
    let xml = UrlFetchApp.fetch(feed.link).getContentText();
    let document = XmlService.parse(xml);
    let items = document.getRootElement().getChild('channel').getChildren('item');

    // スプレッドシートからデータを取得
    let articlesSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('articles');
    let lastRow = articlesSheet.getDataRange().getLastRow();
    let urls = articlesSheet.getRange(1, 3, lastRow).getValues();

    // 新しい記事かどうかを古いアイテム(記事)から比較するため
    items.reverse();

    // RSSから取得したデータと比較と保存
    for (var item of items) {
      let title = item.getChild('title').getText();
      let link = item.getChild('link').getValue();
      let pubDate = Utilities.formatDate(new Date(item.getChild('pubDate').getValue()), "JST", "yyyy/MM/dd E HH:mm");

      // URLが一致しないときは新しいデータ
      if (urls.some(url => url[0] === link)) {
        continue;
      }

      // スプレッドシートへの保存
      articlesSheet.appendRow([feed.name, title, link, pubDate]);

      // チャンネルに投稿
      postToChannel(feed.name, title, link, pubDate);

      console.log(feed.name + ': ' + title);
    }
  }
}

/**
 * チャンネルに通知を投稿する
 * @param {string} name フィード名
 * @param {string} title 記事タイトル
 * @param {string} link 記事リンク
 * @param {string} timestamp 投稿日時
 */
function postToChannel(name, title, link, timestamp) {
  //ここにwebhookのURL。Discord側から取得
  const webhookURL = "https://discord.com/api/webhooks/XXXX";
  //feedシートA列の名前で色などを変更。
  /**
  * 現状の変数設定例
  * "name(変更前)": feedシートA列の値。RSSフィードにつけた名前
  * "name(変更後)": 太字でembedの一番上に出るやつ
  * "color": embedの左の線の色(hex)
  * "emoji": 添付する絵文字。鯖独自の絵文字なので、\:Pos:と打った時の<:Pos:0123241415>みたいなやつを入力
  * "case default"はテスト用なので削除してよろし
  */
  switch (name) {
    case "pos":
    name="新規作成記事";
    color = 0xff0000;
    emoji = "<:heart:>";
    break;
    case "sb":
    name = "新規批評開始下書き";
    color = 0x00ff00;
    emoji = "<:eye_in_speech_bubble:>"
    break;
    case "default":
    name = "新規ポスト";
    color = 0x0000ff;
    emoji = "<:emo:1368589125430546536>"

  }
  //実際に投稿されるメッセージのテンプレ
  const message = {
  "username": name,
  //RSSフィードのアイコン
  "avatar_url": "https://github.com/qiita.png",
  "content": `${emoji}|${timestamp}`,
  "embeds": [
    {
      "title": name,
      "description": `**[${title}](${link})**`,
      "color": color
    }
  ]
}

  const param = {
    "method": "POST",
    "headers": { 'Content-type': "application/json" },
    "payload": JSON.stringify(message)
  }

  UrlFetchApp.fetch(webhookURL, param);
}
