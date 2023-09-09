// 非同期に待機するためのユーティリティ関数
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
  if (request.action === "fetch_data") {
    for (let i = 0; ; i++) {
      // 無限ループ
      const tbodyElement = document.querySelector(".bBBkNh")
      const trElements = tbodyElement ? tbodyElement.querySelectorAll("tr") : []

      if (i >= trElements.length) {
        break // 全てのtr要素を処理したらループを抜ける
      }

      const trElement = trElements[i]
      trElement.click()

      // 3秒待機
      await sleep(3000)

      const mainColumnElement = document.querySelector(".mainColumn")
      const buttons = mainColumnElement ? mainColumnElement.querySelectorAll("button") : []
      const downloadButton = Array.from(buttons).find((button) => button.innerText === "すべてダウンロード")

      if (downloadButton) {
        downloadButton.click()

        // 5秒待機
        await sleep(5000)

        const modalContent = document.querySelector(".ReactModal__Content")
        if (modalContent) {
          const downloadLink = Array.from(modalContent.querySelectorAll("a")).find((a) => a.innerText.includes("ダウンロード"))
          if (downloadLink) {
            chrome.runtime.sendMessage({
              action: "download_file",
              url: downloadLink.href,
              filename: "custom_name.zip",
            })
          }

          const cancelButton = Array.from(modalContent.querySelectorAll("button")).find((button) => button.innerText.includes("キャンセル"))
          if (cancelButton) {
            cancelButton.click()
          }
        }
      }

      const iframeElement = mainColumnElement ? mainColumnElement.querySelector("iframe") : null
      if (iframeElement) {
        const iframeDocument = iframeElement.contentDocument || iframeElement.contentWindow.document
        const iframeBody = iframeDocument ? iframeDocument.body : null
        if (iframeBody) {
          console.log("iframe Body Text:", iframeBody.innerText)
        }
      }

      const backButton = Array.from(document.querySelectorAll("button")).find((button) => button.title === "メール一覧に戻る")
      if (backButton) {
        backButton.click()
        console.log("The button with title 'メール一覧に戻る' was found and clicked.")
      }

      // 3秒待機（次のtr要素に移動する前に）
      await sleep(3000)
    }
  }
})
