// background.js
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "download_file") {
    chrome.downloads.download(
      {
        url: request.url,
        filename: request.filename || "default_name.zip", // ファイル名が指定されていない場合はデフォルト名を使用
      },
      (downloadId) => {
        // Optional post-download code
      }
    )
  }
})

// このサービスワーカーが起動していることを確認
console.log("Background Service Worker is active.")
