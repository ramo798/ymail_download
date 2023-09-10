// 非同期に待機するためのユーティリティ関数
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
  if (request.action === "fetch_data") {
    let continueLoop = true
    while (continueLoop) {
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

        const detailHeaderButton = Array.from(mainColumnElement.querySelectorAll("button")).find((button) => button.innerText === "詳細ヘッダー")
        let email_from = ""
        if (detailHeaderButton) {
          detailHeaderButton.click()
          // ボタンクリック後に要素がロードされるのを待つ（この時間は調整が必要かもしれません）
          await sleep(2000)

          // Textareaから文字列を取得
          const textarea = document.getElementById("rawHeaderValue")
          if (textarea) {
            const textareaContent = textarea.value
            // console.log("Textarea Content:", textareaContent)
            const from_adress = extractEmailAndDateFromHeader(textareaContent)
            email_from = from_adress
          }

          const modalContent = document.querySelector(".ReactModal__Content")
          if (modalContent) {
            const closeButton = Array.from(modalContent.querySelectorAll("button")).find((button) => button.innerText.includes("閉じる"))
            if (closeButton) {
              closeButton.click()
              await sleep(1000)
            }
          }
        }
        console.log("email_from:", email_from)

        const detailSubjectElement = mainColumnElement.querySelector("div[data-cy='detailSubject']")
        const detailSubjectText = detailSubjectElement ? detailSubjectElement.innerText : "Element not found"

        console.log("Detail Subject Text:", detailSubjectText)

        console.log("filename:", sanitizeFilename(`${email_from}_${detailSubjectText}.txt`))

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
                filename: sanitizeFilename(`${email_from}_${detailSubjectText}.zip`),
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

            // iframeBodyの内容をテキストファイルとして保存
            const textt = email_from + "\n" + detailSubjectText + "\n" + iframeBody.innerText
            const blob = new Blob([textt], { type: "text/plain" })
            const url = URL.createObjectURL(blob)
            chrome.runtime.sendMessage({
              action: "download_file",
              url: url,
              filename: sanitizeFilename(`${email_from}_${detailSubjectText}.txt`),
            })
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

      // mainAreaクラスを持つ要素を探す
      const mainAreaElement = document.querySelector(".mainArea")

      // 「次のページを表示」というtitleを持つbuttonを探す
      const nextPageButton = mainAreaElement ? mainAreaElement.querySelector('button[title="次のページを表示"]') : null

      // buttonが存在すればクリック
      if (nextPageButton) {
        nextPageButton.click()
      } else {
        continueLoop = false
      }
      await sleep(3000)
    }
    console.log("DONE !")
  }
})

function extractEmailAndDateFromHeader(headerText) {
  const fromLine = headerText.split("\n").find((line) => line.startsWith("From:"))
  const dateLine = headerText.split("\n").find((line) => line.startsWith("Date:"))

  if (!fromLine || !dateLine) {
    return "FROMまたはDateフィールドが見つかりません"
  }

  const emailMatch = fromLine.match(/<(.+?)>/)
  const email = emailMatch && emailMatch[1] ? emailMatch[1] : "メールアドレスが見つかりません"

  const dateMatch = dateLine.match(/Date: (.+)/)
  const date = dateMatch && dateMatch[1] ? new Date(dateMatch[1]) : new Date()

  // yyyy-mm-dd-hh-mm 形式に変換
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  const hh = String(date.getHours()).padStart(2, "0")
  const min = String(date.getMinutes()).padStart(2, "0")

  const formattedDate = `${yyyy}-${mm}-${dd}-${hh}-${min}`

  return `${email}_${formattedDate}`
}

function sanitizeFilename(filename) {
  const illegalRe = /[\/\?<>\\:\*\|"]/g
  const controlRe = /[\x00-\x1f\x80-\x9f]/g
  const reservedRe = /^\.+$/
  const replacement = "_"

  return filename.replace(illegalRe, replacement).replace(controlRe, replacement).replace(reservedRe, replacement)
}
